/**
 * Prediction service selection: the single switch point for the model.
 *
 * - `VITE_PREDICTION_API_URL` set → POST features to `<url>/predict`
 *   (falls back to the heuristic if the API is down)
 * - unset → built-in heuristic estimate
 *
 * The request/response contract is documented in README.md. The UI only
 * depends on the `PredictionService` interface, so nothing else changes
 * when the model goes live.
 */

import type { NetworkInput, PredictionFactor, PredictionResult, PredictionService, QualityCategory } from '../types';
import { config } from '../config';
import {
  HeuristicPredictionService,
  buildExplanation,
  buildFactors,
  computeSuitability,
  estimateUploadMbps,
} from './heuristicModel';

const QUALITIES: QualityCategory[] = ['Poor', 'Average', 'Excellent'];
const REQUEST_TIMEOUT_MS = 15_000;

function isFactor(value: unknown): value is PredictionFactor {
  if (!value || typeof value !== 'object') return false;
  const f = value as Record<string, unknown>;
  return (
    typeof f.label === 'string' &&
    typeof f.value === 'string' &&
    (f.impact === 'positive' || f.impact === 'neutral' || f.impact === 'negative')
  );
}

/**
 * Validates the model API's JSON. Only `downloadSpeed` and `quality` are
 * required; anything optional the model leaves out is filled in locally.
 */
export function parseModelResponse(body: unknown, input: NetworkInput): PredictionResult {
  if (!body || typeof body !== 'object') throw new Error('Model API returned a non-object response.');
  const r = body as Record<string, unknown>;

  const downloadSpeed = r.downloadSpeed;
  if (typeof downloadSpeed !== 'number' || !Number.isFinite(downloadSpeed) || downloadSpeed < 0) {
    throw new Error('Model API response is missing a valid `downloadSpeed`.');
  }
  const quality = r.quality;
  if (typeof quality !== 'string' || !QUALITIES.includes(quality as QualityCategory)) {
    throw new Error(`Model API response has an invalid \`quality\` (expected ${QUALITIES.join(' | ')}).`);
  }

  const factors = Array.isArray(r.factors) && r.factors.every(isFactor) ? r.factors : buildFactors(input);
  const q = quality as QualityCategory;

  return {
    downloadSpeed,
    uploadSpeed: typeof r.uploadSpeed === 'number' ? r.uploadSpeed : estimateUploadMbps(downloadSpeed),
    quality: q,
    explanation: typeof r.explanation === 'string' && r.explanation ? r.explanation : buildExplanation(q, factors),
    source: 'model',
    confidenceScore:
      typeof r.confidenceScore === 'number' && r.confidenceScore >= 0 && r.confidenceScore <= 100
        ? r.confidenceScore
        : undefined,
    factors,
    suitability: computeSuitability(downloadSpeed, input),
  };
}

export class HttpPredictionService implements PredictionService {
  readonly endpoint: string;

  constructor(baseUrl: string) {
    this.endpoint = `${baseUrl.replace(/\/+$/, '')}/predict`;
  }

  async predict(input: NetworkInput): Promise<PredictionResult> {
    const res = await fetch(this.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        latency: input.latency,
        jitter: input.jitter,
        packetLoss: input.packetLoss,
        signalStrength: input.signalStrength,
        signalUnit: input.signalUnit,
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`Model API responded with HTTP ${res.status}.`);
    return parseModelResponse(await res.json(), input);
  }
}

/** Tries the model first; if it fails, returns the estimate with a notice saying so. */
export class FallbackPredictionService implements PredictionService {
  readonly primary: PredictionService;
  readonly fallback: PredictionService;

  constructor(primary: PredictionService, fallback: PredictionService) {
    this.primary = primary;
    this.fallback = fallback;
  }

  async predict(input: NetworkInput): Promise<PredictionResult> {
    try {
      return await this.primary.predict(input);
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      const result = await this.fallback.predict(input);
      return { ...result, notice: `Model API unavailable (${reason}). Showing the built-in estimate instead.` };
    }
  }
}

export function createPredictionService(apiUrl: string | null = config.predictionApiUrl): PredictionService {
  const heuristic = new HeuristicPredictionService();
  return apiUrl ? new FallbackPredictionService(new HttpPredictionService(apiUrl), heuristic) : heuristic;
}

export const predictionService: PredictionService = createPredictionService();

/** True once a model API is configured. Drives "estimate" vs "model" labelling in the UI. */
export const isModelConfigured = config.predictionApiUrl !== null;
