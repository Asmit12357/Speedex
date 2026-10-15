import type { AnalysisEntry, EdgeLocation, ResultSource } from '../types';

export const SOURCE_LABEL: Record<ResultSource, string> = {
  cloudflare: 'Measured',
  model: 'Model',
  estimate: 'Estimate',
};

/** One flat set of numbers for any history entry, measured or estimated. */
export interface EntryMetrics {
  source: ResultSource;
  downloadMbps: number;
  uploadMbps?: number;
  latencyMs: number;
  jitterMs: number;
  /** undefined when the source never measured it */
  packetLossPct?: number;
  /** e.g. "-45 dBm"; only for manual inputs */
  signal?: string;
  edge?: EdgeLocation;
}

export function entryMetrics(entry: AnalysisEntry): EntryMetrics {
  const { result, measurement: m, input } = entry;
  if (m) {
    return {
      source: result.source,
      downloadMbps: m.downloadMbps,
      uploadMbps: m.uploadMbps,
      latencyMs: m.latencyMs,
      jitterMs: m.jitterMs,
      packetLossPct: m.packetLossPct,
      edge: m.edge,
    };
  }
  return {
    source: result.source,
    downloadMbps: result.downloadSpeed,
    uploadMbps: result.uploadSpeed,
    latencyMs: input?.latency ?? 0,
    jitterMs: input?.jitter ?? 0,
    packetLossPct: input?.packetLoss,
    signal: input ? `${input.signalStrength} ${input.signalUnit}` : undefined,
  };
}

/** Most recent live measurement, if any (history is newest-first). */
export function latestMeasured(history: AnalysisEntry[]): AnalysisEntry | undefined {
  return history.find((e) => e.measurement !== undefined);
}
