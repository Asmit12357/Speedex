/**
 * Live speed test against Cloudflare's edge, via @cloudflare/speedtest.
 *
 * The library is imported on demand, so it stays out of the initial bundle. Pure helpers (step plans, result mapping) are exported
 * separately so they can be unit tested without a network.
 */

import type SpeedTestEngine from '@cloudflare/speedtest';
import type {
  BandwidthPoint,
  ConfigOptions,
  MeasurementConfig,
  MeasurementSummary,
  Results,
  Scores,
} from '@cloudflare/speedtest';
import type {
  EdgeLocation,
  ExperienceGrade,
  ExperienceScores,
  SpeedTestMeasurement,
  SpeedTestPhase,
  SpeedTestProfile,
  SpeedTestProgress,
} from '../types';
import { config } from '../config';
import { fetchEdgeLocation } from './edgeInfo';

/* ── Step plans ───────────────────────────────────────────────── */

/** A library measurement step, tagged with the phase the UI should show for it. */
export interface PlannedStep {
  phase: SpeedTestPhase;
  step: MeasurementConfig;
}

const latency = (numPackets: number, phase: SpeedTestPhase = 'latency'): PlannedStep => ({
  phase,
  step: { type: 'latency', numPackets },
});

const down = (bytes: number, count: number, bypassMinDuration?: boolean): PlannedStep => ({
  phase: 'download',
  step: { type: 'download', bytes, count, ...(bypassMinDuration ? { bypassMinDuration } : {}) },
});

const up = (bytes: number, count: number): PlannedStep => ({
  phase: 'upload',
  step: { type: 'upload', bytes, count },
});

const packetLoss = (numPackets: number): PlannedStep => ({
  phase: 'packetLoss',
  step: { type: 'packetLoss', numPackets, batchSize: 10, batchWaitTime: 10, responsesWaitTime: 3000 },
});

/** Capped at 10 MB requests: roughly 30 MB worst case on a fast link. */
const QUICK_PLAN: PlannedStep[] = [
  latency(1),
  { ...down(1e5, 1, true), phase: 'latency' }, // warm-up so the TLS handshake doesn't skew pings
  latency(20),
  down(1e5, 8),
  down(1e6, 6),
  down(1e7, 2),
  up(1e5, 6),
  up(1e6, 4),
];

/** Cloudflare's own default sequence, minus packet loss (added only when TURN is configured). */
const FULL_PLAN: PlannedStep[] = [
  latency(1),
  { ...down(1e5, 1, true), phase: 'latency' },
  latency(20),
  down(1e5, 9),
  latency(2, 'download'),
  down(1e6, 8),
  latency(2, 'upload'),
  up(1e5, 8),
  latency(2, 'upload'),
  up(1e6, 6),
  latency(2, 'download'),
  down(1e7, 6),
  latency(2, 'upload'),
  up(1e7, 4),
  latency(2, 'download'),
  down(25e6, 4),
  latency(2, 'upload'),
  up(25e6, 4),
  latency(2, 'download'),
  down(1e8, 3),
  latency(2, 'upload'),
  up(5e7, 3),
  latency(2, 'download'),
  down(25e7, 2),
];

export const SPEED_TEST_PROFILES: Record<SpeedTestProfile, { label: string; dataNote: string }> = {
  quick: { label: 'Quick', dataNote: 'About 10 s · up to ~30 MB' },
  full: { label: 'Full', dataNote: 'About 30 s · can exceed 1 GB on fast links' },
};

export function planFor(profile: SpeedTestProfile, withPacketLoss = config.turnCredsUrl !== null): PlannedStep[] {
  const plan = profile === 'quick' ? QUICK_PLAN : FULL_PLAN;
  if (!withPacketLoss) return plan;
  // Packet loss runs right after the idle latency pings, before the link is loaded
  return [...plan.slice(0, 3), packetLoss(profile === 'quick' ? 300 : 1000), ...plan.slice(3)];
}

export function buildEngineConfig(plan: PlannedStep[]): ConfigOptions {
  return {
    autoStart: false,
    measurements: plan.map((p) => p.step),
    // Keep results on this device: don't post them to Cloudflare's aggregate endpoint
    logAimApiUrl: null,
    logMeasurementApiUrl: null,
    ...(config.turnCredsUrl
      ? { turnServerCredsApiUrl: config.turnCredsUrl, turnServerUri: config.turnServerUri }
      : {}),
  };
}

/* ── Result mapping ───────────────────────────────────────────── */

const round1 = (n: number) => Math.round(n * 10) / 10;
const toMbps = (bps: number) => round1(bps / 1e6);
const optional = (n: number | null | undefined) => (typeof n === 'number' && Number.isFinite(n) ? round1(n) : undefined);

const GRADES: ExperienceGrade[] = ['bad', 'poor', 'average', 'good', 'great'];

export function toExperienceScores(scores: Scores): ExperienceScores {
  const out: ExperienceScores = {};
  for (const key of ['streaming', 'gaming', 'rtc'] as const) {
    const s = scores[key];
    if (!s) continue;
    out[key] = {
      grade: GRADES[s.classificationIdx] ?? s.classificationName,
      gradeIndex: s.classificationIdx,
      points: s.points,
    };
  }
  return out;
}

export interface RawSnapshot {
  summary: MeasurementSummary;
  scores: Scores;
  downloadPoints: Pick<BandwidthPoint, 'bps'>[];
  uploadPoints: Pick<BandwidthPoint, 'bps'>[];
  durationMs?: number;
}

export function snapshotOf(results: Results): RawSnapshot {
  return {
    summary: results.getSummary(),
    scores: results.getScores(),
    downloadPoints: results.getDownloadBandwidthPoints(),
    uploadPoints: results.getUploadBandwidthPoints(),
    durationMs: results.getTotalDurationMs(),
  };
}

export function toMeasurement(
  raw: RawSnapshot,
  profile: SpeedTestProfile,
  edge?: EdgeLocation,
): SpeedTestMeasurement {
  const { summary } = raw;
  if (summary.download === undefined || summary.upload === undefined || summary.latency === undefined) {
    throw new Error('The speed test finished without download, upload and latency results.');
  }

  return {
    profile,
    downloadMbps: toMbps(summary.download),
    uploadMbps: toMbps(summary.upload),
    latencyMs: round1(summary.latency),
    jitterMs: optional(summary.jitter) ?? 0,
    downloadLoadedLatencyMs: optional(summary.downLoadedLatency),
    uploadLoadedLatencyMs: optional(summary.upLoadedLatency),
    packetLossPct: summary.packetLoss === undefined ? undefined : round1(summary.packetLoss * 100),
    scores: toExperienceScores(raw.scores),
    downloadSamples: raw.downloadPoints.map((p) => toMbps(p.bps)),
    uploadSamples: raw.uploadPoints.map((p) => toMbps(p.bps)),
    edge,
    durationMs: Math.round(raw.durationMs ?? 0),
  };
}

export function toProgress(
  raw: Omit<RawSnapshot, 'scores'>,
  phase: SpeedTestPhase,
  fraction: number,
): SpeedTestProgress {
  const { summary } = raw;
  return {
    phase,
    fraction: Math.max(0, Math.min(1, fraction)),
    downloadMbps: summary.download === undefined ? undefined : toMbps(summary.download),
    uploadMbps: summary.upload === undefined ? undefined : toMbps(summary.upload),
    latencyMs: optional(summary.latency),
    jitterMs: optional(summary.jitter),
    downloadSamples: raw.downloadPoints.map((p) => toMbps(p.bps)),
    uploadSamples: raw.uploadPoints.map((p) => toMbps(p.bps)),
  };
}

/* ── Runner ───────────────────────────────────────────────────── */

export class SpeedTestCancelledError extends Error {
  constructor() {
    super('Speed test cancelled.');
    this.name = 'SpeedTestCancelledError';
  }
}

/** The subset of the library engine this module drives (eases testing). */
export interface SpeedTestEngineLike {
  onPhaseChange: SpeedTestEngine['onPhaseChange'];
  onResultsChange: SpeedTestEngine['onResultsChange'];
  onFinish: (results: Results) => void;
  onError: (message: string, status?: number) => void;
  readonly results: Results;
  play(): void;
  pause(): void;
}

export type EngineFactory = (options: ConfigOptions) => SpeedTestEngineLike;

async function loadCloudflareEngine(): Promise<EngineFactory> {
  const { default: SpeedTest } = await import('@cloudflare/speedtest');
  return (options) => new SpeedTest(options);
}

export interface SpeedTestRun {
  done: Promise<SpeedTestMeasurement>;
  cancel(): void;
}

export interface RunDeps {
  loadEngine?: () => Promise<EngineFactory>;
  fetchEdge?: () => Promise<EdgeLocation | undefined>;
  /** Defaults to whether a TURN server is configured */
  withPacketLoss?: boolean;
}

/** Runs one plan to completion. `profile` only labels the result. */
function runPlan(
  plan: PlannedStep[],
  profile: SpeedTestProfile,
  onProgress: (p: SpeedTestProgress) => void,
  { loadEngine = loadCloudflareEngine, fetchEdge = fetchEdgeLocation }: RunDeps = {},
): SpeedTestRun {
  let cancelled = false;
  let stop: () => void = () => {};

  const done = (async () => {
    const [createEngine, edge] = await Promise.all([loadEngine(), fetchEdge().catch(() => undefined)]);
    if (cancelled) throw new SpeedTestCancelledError();

    return new Promise<SpeedTestMeasurement>((resolve, reject) => {
      const engine = createEngine(buildEngineConfig(plan));
      let stepIdx = 0;

      const emit = () => {
        const r = engine.results;
        const snapshot = {
          summary: r.getSummary(),
          downloadPoints: r.getDownloadBandwidthPoints(),
          uploadPoints: r.getUploadBandwidthPoints(),
        };
        onProgress(toProgress(snapshot, plan[stepIdx]?.phase ?? 'latency', stepIdx / plan.length));
      };

      engine.onPhaseChange = ({ measurementId }) => {
        stepIdx = measurementId;
        emit();
      };
      engine.onResultsChange = emit;
      engine.onFinish = (results) => {
        try {
          resolve(toMeasurement(snapshotOf(results), profile, edge));
        } catch (err) {
          reject(err);
        }
      };
      engine.onError = (message) => {
        // A failed packet loss step is skipped by the engine; everything else stops the test
        if (plan[stepIdx]?.phase === 'packetLoss') return;
        engine.pause();
        reject(new Error(`Speed test failed: ${message}`));
      };

      stop = () => {
        engine.pause();
        reject(new SpeedTestCancelledError());
      };
      engine.play();
    });
  })();

  return {
    done,
    cancel() {
      cancelled = true;
      stop();
    },
  };
}

export function runSpeedTest(
  profile: SpeedTestProfile,
  onProgress: (p: SpeedTestProgress) => void,
  deps?: RunDeps,
): SpeedTestRun {
  return runPlan(planFor(profile, deps?.withPacketLoss), profile, onProgress, deps);
}

/**
 * Latency and jitter only: ~20 tiny requests, a couple of seconds, near-zero data.
 * Used by the Analyzer's "Auto-probe" button.
 */
export async function probeLatency(deps: RunDeps = {}): Promise<{ latencyMs: number; jitterMs: number; edge?: EdgeLocation }> {
  const { loadEngine = loadCloudflareEngine, fetchEdge = fetchEdgeLocation } = deps;
  const [createEngine, edge] = await Promise.all([loadEngine(), fetchEdge().catch(() => undefined)]);

  return new Promise((resolve, reject) => {
    const engine = createEngine({
      ...buildEngineConfig([latency(1), { ...down(1e5, 1, true), phase: 'latency' }, latency(20)]),
      measureDownloadLoadedLatency: false,
      measureUploadLoadedLatency: false,
    });
    engine.onPhaseChange = () => {};
    engine.onResultsChange = () => {};
    engine.onFinish = (results) => {
      const s = results.getSummary();
      if (s.latency === undefined) {
        reject(new Error('Latency probe returned no samples.'));
        return;
      }
      resolve({ latencyMs: round1(s.latency), jitterMs: optional(s.jitter) ?? 0, edge });
    };
    engine.onError = (message) => {
      engine.pause();
      reject(new Error(`Latency probe failed: ${message}`));
    };
    engine.play();
  });
}
