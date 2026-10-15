/**
 * Built-in heuristic estimator: a stand-in until the trained model ships.
 *
 * The formula is a hand-tuned weighted combination that produces plausible
 * numbers. It is NOT a trained model and the UI labels its output as an
 * estimate. The per-metric rating helpers below are also used to grade live
 * Cloudflare measurements, so both paths share one set of thresholds.
 */

import type {
  ApplicationSuitability,
  NetworkInput,
  PredictionFactor,
  PredictionResult,
  PredictionService,
  QualityCategory,
  SignalUnit,
} from '../types';

/**
 * Normalise signal strength to a 0–1 scale regardless of input unit.
 * dBm: maps -90 (worst) → 0 and -30 (best) → 1.
 * %:   maps 0 → 0 and 100 → 1.
 */
export function normaliseSignal(value: number, unit: SignalUnit): number {
  if (unit === 'dBm') {
    return Math.max(0, Math.min(1, (value + 90) / 60));
  }
  return Math.max(0, Math.min(1, value / 100));
}

/** Heuristic download estimate in Mbps, driven mostly by signal quality. */
export function estimateDownloadMbps(input: NetworkInput): number {
  const signal = normaliseSignal(input.signalStrength, input.signalUnit);

  // Base speed driven primarily by signal quality (up to 125 Mbps)
  const baseSpeed = signal * 125;

  // Penalties
  const latencyPenalty = Math.min(input.latency / 4.5, 45); // up to -45
  const jitterPenalty = Math.min(input.jitter / 2.5, 25);    // up to -25
  const lossPenalty = input.packetLoss * 3.5;                 // up to -35 at 10%

  const speed = Math.max(0.8, baseSpeed - latencyPenalty - jitterPenalty - lossPenalty);
  return Math.round(speed * 10) / 10;
}

/** Uplink is not modelled yet; assume a typical asymmetric ratio. */
export function estimateUploadMbps(downloadMbps: number): number {
  return Math.round(Math.max(0.6, downloadMbps * 0.38) * 10) / 10;
}

export function classifyQuality(
  speed: number,
  { latency, packetLoss }: Pick<NetworkInput, 'latency' | 'packetLoss'>,
): QualityCategory {
  if (speed >= 50 && latency < 35 && packetLoss < 1) return 'Excellent';
  if (speed >= 15 && latency < 85 && packetLoss < 3.5) return 'Average';
  return 'Poor';
}

/* ── Per-metric ratings ───────────────────────────────────────── */

export function latencyFactor(ms: number): PredictionFactor {
  const value = `${ms} ms`;
  if (ms < 25) return { label: 'Latency', value, impact: 'positive', benchmark: '< 30 ms (Tier 1)' };
  if (ms < 70) return { label: 'Latency', value, impact: 'neutral', benchmark: '30–80 ms (Standard)' };
  return { label: 'Latency', value, impact: 'negative', benchmark: '> 80 ms (High delay)' };
}

export function jitterFactor(ms: number): PredictionFactor {
  const value = `${ms} ms`;
  if (ms < 4) return { label: 'Jitter', value, impact: 'positive', benchmark: '< 5 ms (Low variation)' };
  if (ms < 15) return { label: 'Jitter', value, impact: 'neutral', benchmark: '5–15 ms (Moderate)' };
  return { label: 'Jitter', value, impact: 'negative', benchmark: '> 15 ms (Unstable)' };
}

export function packetLossFactor(pct: number): PredictionFactor {
  const value = `${pct}%`;
  if (pct < 0.5) return { label: 'Packet loss', value, impact: 'positive', benchmark: '< 0.5% (Optimal)' };
  if (pct < 2.5) return { label: 'Packet loss', value, impact: 'neutral', benchmark: '0.5–2.5% (Elevated)' };
  return { label: 'Packet loss', value, impact: 'negative', benchmark: '> 2.5% (Degraded)' };
}

export function signalFactor(value: number, unit: SignalUnit): PredictionFactor {
  const sig = normaliseSignal(value, unit);
  const label = 'Signal strength';
  const shown = unit === 'dBm' ? `${value} dBm` : `${value}%`;
  if (sig > 0.7) return { label, value: shown, impact: 'positive', benchmark: '> -55 dBm (Strong)' };
  if (sig > 0.4) return { label, value: shown, impact: 'neutral', benchmark: '-55 to -75 dBm (Fair)' };
  return { label, value: shown, impact: 'negative', benchmark: '< -75 dBm (Weak)' };
}

export function buildFactors(input: NetworkInput): PredictionFactor[] {
  return [
    latencyFactor(input.latency),
    jitterFactor(input.jitter),
    packetLossFactor(input.packetLoss),
    signalFactor(input.signalStrength, input.signalUnit),
  ];
}

/* ── Workload suitability ─────────────────────────────────────── */

export function transferSuitability(downloadMbps: number, uploadMbps: number): ApplicationSuitability {
  const ok = downloadMbps >= 30 && uploadMbps >= 8;
  return {
    category: 'transfers',
    name: 'Cloud sync & big files',
    suitable: ok,
    score: Math.min(100, Math.max(10, Math.round((downloadMbps / 30) * 50 + (uploadMbps / 8) * 50))),
    note: ok ? 'Plenty of throughput for backups and large uploads' : 'Large uploads and downloads will take a while',
  };
}

export function computeSuitability(speed: number, input: NetworkInput): ApplicationSuitability[] {
  const uploadSpeed = estimateUploadMbps(speed);

  // 4K / UHD streaming: needs download >= 25 Mbps and packet loss <= 1.5%
  const streamingOk = speed >= 25 && input.packetLoss <= 1.5;
  const streamingScore = Math.min(100, Math.max(10, Math.round((speed / 25) * 70 + (input.packetLoss < 1 ? 30 : 0))));

  // Competitive gaming: needs latency <= 45 ms, jitter <= 8 ms, loss <= 0.5%
  const gamingOk = input.latency <= 45 && input.jitter <= 8 && input.packetLoss <= 0.5;
  const gamingScore = Math.min(
    100,
    Math.max(10, Math.round(100 - (input.latency * 0.9) - (input.jitter * 1.5) - (input.packetLoss * 12)))
  );

  // HD video calls: needs speed >= 5 Mbps, latency <= 100 ms, jitter <= 20 ms
  const callingOk = speed >= 5 && input.latency <= 100 && input.jitter <= 20 && input.packetLoss <= 2.5;
  const callingScore = Math.min(
    100,
    Math.max(10, Math.round(Math.min(100, (speed / 5) * 40) + Math.max(0, 60 - input.latency * 0.4)))
  );

  return [
    {
      category: 'streaming',
      name: '4K streaming',
      suitable: streamingOk,
      score: streamingScore,
      note: streamingOk ? 'Smooth 4K playback with 25+ Mbps headroom' : 'May buffer or drop to 1080p/720p',
    },
    {
      category: 'gaming',
      name: 'Online gaming',
      suitable: gamingOk,
      score: gamingScore,
      note: gamingOk ? 'Low, steady latency for real-time play' : 'Latency or jitter may cause lag spikes',
    },
    {
      category: 'calls',
      name: 'Video calls',
      suitable: callingOk,
      score: callingScore,
      note: callingOk ? 'Clear two-way audio and HD video' : 'Risk of choppy audio or frozen video',
    },
    transferSuitability(speed, uploadSpeed),
  ];
}

export function buildExplanation(quality: QualityCategory, factors: PredictionFactor[]): string {
  const negatives = factors.filter((f) => f.impact === 'negative');
  const positives = factors.filter((f) => f.impact === 'positive');

  if (quality === 'Excellent') {
    return 'Latency, jitter and loss are all in healthy ranges. This connection should handle demanding real-time work comfortably.';
  }
  if (quality === 'Poor') {
    const issues = negatives.map((f) => f.label.toLowerCase()).join(', ');
    return `${issues ? `High ${issues}` : 'Several weak metrics'} will noticeably slow this connection and cause retransmissions.`;
  }
  const good = positives.map((f) => f.label.toLowerCase()).join(', ');
  const bad = negatives.map((f) => f.label.toLowerCase()).join(', ');
  let msg = 'A balanced connection.';
  if (good) msg += ` Strong: ${good}.`;
  if (bad) msg += ` Holding it back: ${bad}.`;
  return msg;
}

export function estimate(input: NetworkInput): PredictionResult {
  const downloadSpeed = estimateDownloadMbps(input);
  const quality = classifyQuality(downloadSpeed, input);
  const factors = buildFactors(input);

  return {
    downloadSpeed,
    uploadSpeed: estimateUploadMbps(downloadSpeed),
    quality,
    explanation: buildExplanation(quality, factors),
    source: 'estimate',
    factors,
    suitability: computeSuitability(downloadSpeed, input),
  };
}

export class HeuristicPredictionService implements PredictionService {
  async predict(input: NetworkInput): Promise<PredictionResult> {
    return estimate(input);
  }
}
