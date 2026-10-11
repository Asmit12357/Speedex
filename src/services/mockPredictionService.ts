/**
 * Mock Prediction Service
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │  FUTURE INTEGRATION POINT                                          │
 * │                                                                     │
 * │  Replace this module with a real API client that calls your         │
 * │  Flask / FastAPI backend.  The UI imports only the                  │
 * │  `PredictionService` interface from ../types — swap the             │
 * │  implementation here and everything else stays unchanged.           │
 * │                                                                     │
 * │  Example:                                                           │
 * │    const res = await fetch('/api/predict', {                        │
 * │      method: 'POST',                                               │
 * │      headers: { 'Content-Type': 'application/json' },              │
 * │      body: JSON.stringify(input),                                   │
 * │    });                                                              │
 * │    return await res.json() as PredictionResult;                     │
 * └─────────────────────────────────────────────────────────────────────┘
 */

import type {
  NetworkInput,
  PredictionResult,
  PredictionFactor,
  PredictionService,
  QualityCategory,
} from '../types';

/**
 * Normalise signal strength to a 0–1 scale regardless of input unit.
 * dBm: maps -90 (worst) → 0 and -30 (best) → 1.
 * %:   maps 0 → 0 and 100 → 1.
 */
function normaliseSignal(value: number, unit: 'dBm' | '%'): number {
  if (unit === 'dBm') {
    return Math.max(0, Math.min(1, (value + 90) / 60));
  }
  return Math.max(0, Math.min(1, value / 100));
}

/**
 * Demo heuristic — NOT a trained model.
 *
 * The formula below is a simple weighted combination designed to produce
 * plausible-looking results for demonstration purposes.  It has no
 * scientific validity and must be replaced by the real ML pipeline.
 */
function computeMockSpeed(input: NetworkInput): number {
  const signal = normaliseSignal(input.signalStrength, input.signalUnit);

  // Base speed driven primarily by signal quality
  const baseSpeed = signal * 120; // 0–120 Mbps range

  // Penalties
  const latencyPenalty = Math.min(input.latency / 5, 40);   // up to -40
  const jitterPenalty = Math.min(input.jitter / 3, 20);      // up to -20
  const lossPenalty = input.packetLoss * 3;                   // up to -30 at 10%

  const speed = Math.max(0.5, baseSpeed - latencyPenalty - jitterPenalty - lossPenalty);
  return Math.round(speed * 10) / 10;
}

function classifyQuality(speed: number, input: NetworkInput): QualityCategory {
  if (speed >= 50 && input.latency < 30 && input.packetLoss < 1) return 'Excellent';
  if (speed >= 15 && input.latency < 80 && input.packetLoss < 3) return 'Average';
  return 'Poor';
}

function buildFactors(input: NetworkInput, _quality: QualityCategory): PredictionFactor[] {
  const factors: PredictionFactor[] = [];

  // Latency
  if (input.latency < 20) {
    factors.push({ label: 'Latency', value: `${input.latency} ms — very low`, impact: 'positive' });
  } else if (input.latency < 60) {
    factors.push({ label: 'Latency', value: `${input.latency} ms — acceptable`, impact: 'neutral' });
  } else {
    factors.push({ label: 'Latency', value: `${input.latency} ms — high`, impact: 'negative' });
  }

  // Jitter
  if (input.jitter < 5) {
    factors.push({ label: 'Jitter', value: `${input.jitter} ms — stable`, impact: 'positive' });
  } else if (input.jitter < 15) {
    factors.push({ label: 'Jitter', value: `${input.jitter} ms — moderate`, impact: 'neutral' });
  } else {
    factors.push({ label: 'Jitter', value: `${input.jitter} ms — high variability`, impact: 'negative' });
  }

  // Packet loss
  if (input.packetLoss < 0.5) {
    factors.push({ label: 'Packet Loss', value: `${input.packetLoss}% — negligible`, impact: 'positive' });
  } else if (input.packetLoss < 2) {
    factors.push({ label: 'Packet Loss', value: `${input.packetLoss}% — noticeable`, impact: 'neutral' });
  } else {
    factors.push({ label: 'Packet Loss', value: `${input.packetLoss}% — significant`, impact: 'negative' });
  }

  // Signal
  const sig = normaliseSignal(input.signalStrength, input.signalUnit);
  const sigLabel = input.signalUnit === 'dBm'
    ? `${input.signalStrength} dBm`
    : `${input.signalStrength}%`;
  if (sig > 0.7) {
    factors.push({ label: 'Signal Strength', value: `${sigLabel} — strong`, impact: 'positive' });
  } else if (sig > 0.35) {
    factors.push({ label: 'Signal Strength', value: `${sigLabel} — fair`, impact: 'neutral' });
  } else {
    factors.push({ label: 'Signal Strength', value: `${sigLabel} — weak`, impact: 'negative' });
  }

  return factors;
}

function buildExplanation(quality: QualityCategory, factors: PredictionFactor[]): string {
  const negatives = factors.filter(f => f.impact === 'negative');
  const positives = factors.filter(f => f.impact === 'positive');

  if (quality === 'Excellent') {
    return 'All measured parameters are within optimal ranges. The demo heuristic estimates a high-quality connection with fast download speeds.';
  }
  if (quality === 'Poor') {
    const issues = negatives.map(f => f.label.toLowerCase()).join(', ');
    return `The demo heuristic flags ${issues || 'several parameters'} as problematic, resulting in a low estimated speed and poor quality classification.`;
  }
  const good = positives.map(f => f.label.toLowerCase()).join(', ');
  const bad = negatives.map(f => f.label.toLowerCase()).join(', ');
  let msg = 'The connection shows mixed characteristics.';
  if (good) msg += ` Strengths: ${good}.`;
  if (bad) msg += ` Areas of concern: ${bad}.`;
  return msg;
}

/** Simulate a short network delay to make the UX feel realistic */
function simulateDelay(): Promise<void> {
  const ms = 400 + Math.random() * 800; // 400–1200 ms
  return new Promise(resolve => setTimeout(resolve, ms));
}

class MockPredictionService implements PredictionService {
  async predict(input: NetworkInput): Promise<PredictionResult> {
    await simulateDelay();

    const downloadSpeed = computeMockSpeed(input);
    const quality = classifyQuality(downloadSpeed, input);
    const factors = buildFactors(input, quality);
    const explanation = buildExplanation(quality, factors);

    return {
      downloadSpeed,
      quality,
      explanation,
      isSimulated: true,
      factors,
    };
  }
}

/**
 * The singleton prediction service used by the application.
 *
 * To integrate the real ML model, replace this with an instance of a
 * class that calls your backend API and implements `PredictionService`.
 */
export const predictionService: PredictionService = new MockPredictionService();

/** Demo input values for quick testing */
export const DEMO_VALUES: NetworkInput = {
  latency: 24,
  jitter: 3,
  packetLoss: 0.2,
  signalStrength: -45,
  signalUnit: 'dBm',
};
