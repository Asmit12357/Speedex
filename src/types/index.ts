/** Units for network measurement inputs */
export type SignalUnit = 'dBm' | '%';

/** Raw network measurements entered by the user or provided as demo values */
export interface NetworkInput {
  latency: number;       // milliseconds
  jitter: number;        // milliseconds
  packetLoss: number;    // percentage (0–100)
  signalStrength: number; // dBm (typically -30 to -90) or % (0–100)
  signalUnit: SignalUnit;
}

/** Quality classification labels */
export type QualityCategory = 'Poor' | 'Average' | 'Excellent';

/** Result of a prediction (mock or real) */
export interface PredictionResult {
  /** Estimated download speed in Mbps */
  downloadSpeed: number;
  /** Predicted quality category */
  quality: QualityCategory;
  /** Human-readable explanation of the result */
  explanation: string;
  /** Whether this result was produced by a mock/demo heuristic */
  isSimulated: boolean;
  /** Factors that influenced the result */
  factors: PredictionFactor[];
}

/** A single factor contributing to the prediction explanation */
export interface PredictionFactor {
  label: string;
  value: string;
  impact: 'positive' | 'neutral' | 'negative';
}

/** A saved analysis entry for history */
export interface AnalysisEntry {
  id: string;
  timestamp: string; // ISO 8601
  input: NetworkInput;
  result: PredictionResult;
}

/** The interface that any prediction service must implement */
export interface PredictionService {
  predict(input: NetworkInput): Promise<PredictionResult>;
}

/** Navigation page identifiers */
export type PageId = 'overview' | 'analyzer' | 'results' | 'history' | 'about';
