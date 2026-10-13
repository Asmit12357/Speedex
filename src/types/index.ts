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

/** Result of a prediction (mock or real) */
export interface PredictionResult {
  /** Estimated download speed in Mbps */
  downloadSpeed: number;
  /** Estimated upload speed in Mbps (projected from throughput curve) */
  uploadSpeed?: number;
  /** Predicted quality category */
  quality: QualityCategory;
  /** Human-readable explanation of the result */
  explanation: string;
  /** Whether this result was produced by a mock/demo heuristic */
  isSimulated: boolean;
  /** Simulated model confidence score (0-100%) */
  confidenceScore?: number;
  /** Factors that influenced the result */
  factors: PredictionFactor[];
  /** Suitability across common network workloads */
  suitability?: ApplicationSuitability[];
}

/** A saved analysis entry for history */
export interface AnalysisEntry {
  id: string;
  timestamp: string; // ISO 8601
  input: NetworkInput;
  result: PredictionResult;
  scenarioName?: string;
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
export type PageId = 'overview' | 'analyzer' | 'results' | 'history' | 'about';
