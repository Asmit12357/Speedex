/** Units for network measurement inputs */
export type SignalUnit = 'dBm' | '%';

/** Raw network measurements entered by the user or provided as demo values */
export interface NetworkInput {
  latency: number;        // milliseconds (RTT)
  jitter: number;         // milliseconds (PDV)
  packetLoss: number;     // percentage (0–100)
  signalStrength: number; // dBm (typically -30 to -90) or % (0–100)
  signalUnit: SignalUnit;
  testServer?: string;    // server location if measured
}

/** Quality classification labels */
export type QualityCategory = 'Poor' | 'Average' | 'Excellent';

/** Impact tier for contributing factors */
export type FactorImpact = 'positive' | 'neutral' | 'negative';

/** A single factor contributing to the prediction explanation */
export interface PredictionFactor {
  label: string;
  value: string;
  impact: FactorImpact;
  benchmark?: string;
}

/** Application suitability rating */
export interface ApplicationSuitability {
  category: string;
  name: string;
  suitable: boolean;
  score: number; // 0 - 100
  note: string;
}

/**
 * Where a result came from:
 * - `cloudflare`: measured live against Cloudflare's edge
 * - `model`: predicted by the trained model API
 * - `estimate`: the built-in heuristic, used until the model ships
 */
export type ResultSource = 'cloudflare' | 'model' | 'estimate';

/** Result of a prediction or a live measurement */
export interface PredictionResult {
  /** Estimated download speed in Mbps */
  downloadSpeed: number;
  /** Estimated upload speed in Mbps (projected from throughput curve) */
  uploadSpeed?: number;
  /** Predicted quality category */
  quality: QualityCategory;
  /** Human-readable explanation of the result */
  explanation: string;
  /** Where the numbers came from */
  source: ResultSource;
  /** Model confidence (0–100%), only when the model reports one */
  confidenceScore?: number;
  /** Shown to the user when something degraded (e.g. model API fell back) */
  notice?: string;
  /** Factors that influenced the result */
  factors: PredictionFactor[];
  /** Suitability across common network workloads */
  suitability?: ApplicationSuitability[];
}

/** A saved analysis entry for history */
export interface AnalysisEntry {
  id: string;
  timestamp: string; // ISO 8601
  /** Features sent to the model or heuristic (absent for live tests) */
  input?: NetworkInput;
  /** Raw live measurement (only for `cloudflare` results) */
  measurement?: SpeedTestMeasurement;
  result: PredictionResult;
  scenarioName?: string;
}

/* ── Live speed test (Cloudflare) ─────────────────────────────── */

/** Quick keeps data use small; full runs Cloudflare's complete sequence */
export type SpeedTestProfile = 'quick' | 'full';

export type SpeedTestPhase = 'latency' | 'download' | 'upload' | 'packetLoss';

/** Cloudflare AIM rating buckets, worst to best */
export type ExperienceGrade = 'bad' | 'poor' | 'average' | 'good' | 'great';

export interface ExperienceScore {
  grade: ExperienceGrade;
  /** 0 (bad) to 4 (great) */
  gradeIndex: number;
  points: number;
}

export interface ExperienceScores {
  streaming?: ExperienceScore;
  gaming?: ExperienceScore;
  rtc?: ExperienceScore;
}

/** The Cloudflare data center that served the test */
export interface EdgeLocation {
  colo: string;
  city?: string;
  country?: string;
  asn?: string;
}

/** Final numbers from a live speed test */
export interface SpeedTestMeasurement {
  profile: SpeedTestProfile;
  downloadMbps: number;
  uploadMbps: number;
  latencyMs: number;
  jitterMs: number;
  /** Latency while the download was saturating the link */
  downloadLoadedLatencyMs?: number;
  /** Latency while the upload was saturating the link */
  uploadLoadedLatencyMs?: number;
  /** Only measured when a TURN server is configured */
  packetLossPct?: number;
  scores: ExperienceScores;
  /** Per-request throughput in Mbps, in the order measured */
  downloadSamples: number[];
  uploadSamples: number[];
  edge?: EdgeLocation;
  durationMs: number;
}

/** Live snapshot emitted while a test is running */
export interface SpeedTestProgress {
  phase: SpeedTestPhase;
  /** 0–1 share of configured steps that have started */
  fraction: number;
  downloadMbps?: number;
  uploadMbps?: number;
  latencyMs?: number;
  jitterMs?: number;
  downloadSamples: number[];
  uploadSamples: number[];
}

/** Preset network telemetry scenario for quick testing */
export interface NetworkScenario {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'Broadband' | 'Cellular' | 'Wireless' | 'Satellite' | 'Degraded';
  values: NetworkInput;
}

/** The interface that any prediction service must implement */
export interface PredictionService {
  predict(input: NetworkInput): Promise<PredictionResult>;
}

/** Navigation page identifiers */
export type PageId = 'overview' | 'speedtest' | 'analyzer' | 'results' | 'history' | 'about';
