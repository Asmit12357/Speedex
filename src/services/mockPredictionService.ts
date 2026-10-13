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
  ApplicationSuitability,
  NetworkScenario,
} from '../types';

/**
 * Normalise signal strength to a 0–1 scale regardless of input unit.
 * dBm: maps -90 (worst) → 0 and -30 (best) → 1.
 * %:   maps 0 → 0 and 100 → 1.
 */
export function normaliseSignal(value: number, unit: 'dBm' | '%'): number {
  if (unit === 'dBm') {
    return Math.max(0, Math.min(1, (value + 90) / 60));
  }
  return Math.max(0, Math.min(1, value / 100));
}

/**
 * Demo heuristic — NOT a trained model.
 *
 * The formula below is a weighted combination designed to produce
 * plausible-looking results for demonstration purposes. It has no
 * scientific validity and must be replaced by the real ML pipeline.
 */
export function computeMockSpeed(input: NetworkInput): number {
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

export function classifyQuality(speed: number, input: NetworkInput): QualityCategory {
  if (speed >= 50 && input.latency < 35 && input.packetLoss < 1) return 'Excellent';
  if (speed >= 15 && input.latency < 85 && input.packetLoss < 3.5) return 'Average';
  return 'Poor';
}

export function computeSuitability(speed: number, input: NetworkInput): ApplicationSuitability[] {
  const uploadSpeed = Math.round(Math.max(0.5, speed * 0.35) * 10) / 10;

  // 1. 4K / UHD Streaming: Needs download >= 25 Mbps and packet loss <= 1.5%
  const streamingOk = speed >= 25 && input.packetLoss <= 1.5;
  const streamingScore = Math.min(100, Math.max(10, Math.round((speed / 25) * 70 + (input.packetLoss < 1 ? 30 : 0))));

  // 2. Competitive Gaming: Needs latency <= 45 ms, jitter <= 8 ms, loss <= 0.5%
  const gamingOk = input.latency <= 45 && input.jitter <= 8 && input.packetLoss <= 0.5;
  const gamingScore = Math.min(
    100,
    Math.max(10, Math.round(100 - (input.latency * 0.9) - (input.jitter * 1.5) - (input.packetLoss * 12)))
  );

  // 3. HD Video Calls (Zoom / Meet): Needs speed >= 5 Mbps, latency <= 100 ms, jitter <= 20 ms
  const callingOk = speed >= 5 && input.latency <= 100 && input.jitter <= 20 && input.packetLoss <= 2.5;
  const callingScore = Math.min(
    100,
    Math.max(10, Math.round(Math.min(100, (speed / 5) * 40) + Math.max(0, 60 - input.latency * 0.4)))
  );

  // 4. Large Cloud Transfers: Needs download >= 30 Mbps and upload >= 10 Mbps
  const transferOk = speed >= 30 && uploadSpeed >= 8;
  const transferScore = Math.min(100, Math.max(10, Math.round((speed / 30) * 50 + (uploadSpeed / 8) * 50)));

  return [
    {
      category: 'streaming',
      name: '4K UHD Streaming',
      suitable: streamingOk,
      score: streamingScore,
      note: streamingOk ? 'Buffer-free 4K playback (25+ Mbps headroom)' : 'May buffer or downscale to 1080p/720p',
    },
    {
      category: 'gaming',
      name: 'Cloud & Online Gaming',
      suitable: gamingOk,
      score: gamingScore,
      note: gamingOk ? 'Minimal tick delay, stable RTT for real-time play' : 'High latency/jitter may induce rubber-banding',
    },
    {
      category: 'calls',
      name: 'Video Conferencing (Zoom/Teams)',
      suitable: callingOk,
      score: callingScore,
      note: callingOk ? 'Crystal-clear two-way audio & 1080p video' : 'Risk of robotic audio or packet dropout',
    },
    {
      category: 'transfers',
      name: 'Cloud Sync & Big Files',
      suitable: transferOk,
      score: transferScore,
      note: transferOk ? 'High burst throughput for cloud backups' : 'Prolonged upload and download completion times',
    },
  ];
}

export function buildFactors(input: NetworkInput, _quality: QualityCategory): PredictionFactor[] {
  const factors: PredictionFactor[] = [];

  // Latency
  if (input.latency < 25) {
    factors.push({
      label: 'RTT Latency',
      value: `${input.latency} ms`,
      impact: 'positive',
      benchmark: '< 30 ms (Tier 1)',
    });
  } else if (input.latency < 70) {
    factors.push({
      label: 'RTT Latency',
      value: `${input.latency} ms`,
      impact: 'neutral',
      benchmark: '30–80 ms (Standard)',
    });
  } else {
    factors.push({
      label: 'RTT Latency',
      value: `${input.latency} ms`,
      impact: 'negative',
      benchmark: '> 80 ms (High Delay)',
    });
  }

  // Jitter
  if (input.jitter < 4) {
    factors.push({
      label: 'Packet Jitter',
      value: `${input.jitter} ms`,
      impact: 'positive',
      benchmark: '< 5 ms (Low PDV)',
    });
  } else if (input.jitter < 15) {
    factors.push({
      label: 'Packet Jitter',
      value: `${input.jitter} ms`,
      impact: 'neutral',
      benchmark: '5–15 ms (Moderate)',
    });
  } else {
    factors.push({
      label: 'Packet Jitter',
      value: `${input.jitter} ms`,
      impact: 'negative',
      benchmark: '> 15 ms (Unstable)',
    });
  }

  // Packet loss
  if (input.packetLoss < 0.5) {
    factors.push({
      label: 'Packet Loss',
      value: `${input.packetLoss}%`,
      impact: 'positive',
      benchmark: '< 0.5% (Optimal)',
    });
  } else if (input.packetLoss < 2.5) {
    factors.push({
      label: 'Packet Loss',
      value: `${input.packetLoss}%`,
      impact: 'neutral',
      benchmark: '0.5–2.5% (Elevated)',
    });
  } else {
    factors.push({
      label: 'Packet Loss',
      value: `${input.packetLoss}%`,
      impact: 'negative',
      benchmark: '> 2.5% (Degraded)',
    });
  }

  // Signal
  const sig = normaliseSignal(input.signalStrength, input.signalUnit);
  const sigLabel = input.signalUnit === 'dBm' ? `${input.signalStrength} dBm` : `${input.signalStrength}%`;
  if (sig > 0.7) {
    factors.push({
      label: 'Signal Strength (RSSI)',
      value: sigLabel,
      impact: 'positive',
      benchmark: '> -55 dBm (Strong)',
    });
  } else if (sig > 0.4) {
    factors.push({
      label: 'Signal Strength (RSSI)',
      value: sigLabel,
      impact: 'neutral',
      benchmark: '-55 to -75 dBm (Fair)',
    });
  } else {
    factors.push({
      label: 'Signal Strength (RSSI)',
      value: sigLabel,
      impact: 'negative',
      benchmark: '< -75 dBm (Weak)',
    });
  }

  return factors;
}

export function buildExplanation(quality: QualityCategory, factors: PredictionFactor[]): string {
  const negatives = factors.filter((f) => f.impact === 'negative');
  const positives = factors.filter((f) => f.impact === 'positive');

  if (quality === 'Excellent') {
    return 'All measured telemetry signals indicate high link stability with low round-trip latency and negligible packet loss. The heuristic model predicts fast, sustained throughput suitable for intensive real-time workloads.';
  }
  if (quality === 'Poor') {
    const issues = negatives.map((f) => f.label.toLowerCase()).join(', ');
    return `The heuristic flags ${issues || 'multiple telemetry bottlenecks'} as significantly degrading link performance. This induces severe transport-layer retransmissions and reduces effective bandwidth.`;
  }
  const good = positives.map((f) => f.label.toLowerCase()).join(', ');
  const bad = negatives.map((f) => f.label.toLowerCase()).join(', ');
  let msg = 'The network exhibits balanced operational performance.';
  if (good) msg += ` Strong telemetry: ${good}.`;
  if (bad) msg += ` Constraining variables: ${bad}.`;
  return msg;
}

/** Simulate realistic inference time for ML model simulation */
function simulateDelay(): Promise<void> {
  const ms = 450 + Math.random() * 600; // 450–1050 ms
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class MockPredictionService implements PredictionService {
  async predict(input: NetworkInput): Promise<PredictionResult> {
    await simulateDelay();

    const downloadSpeed = computeMockSpeed(input);
    const uploadSpeed = Math.round(Math.max(0.6, downloadSpeed * 0.38) * 10) / 10;
    const quality = classifyQuality(downloadSpeed, input);
    const factors = buildFactors(input, quality);
    const explanation = buildExplanation(quality, factors);
    const suitability = computeSuitability(downloadSpeed, input);

    // Simulated confidence score (91% - 98%)
    const penaltyCount = factors.filter((f) => f.impact === 'negative').length;
    const confidenceScore = Math.max(86, Math.min(98, 96 - penaltyCount * 3 + Math.floor(Math.random() * 4)));

    return {
      downloadSpeed,
      uploadSpeed,
      quality,
      explanation,
      isSimulated: true,
      confidenceScore,
      factors,
      suitability,
    };
  }
}

/**
 * The singleton prediction service used by the application.
 */
export const predictionService: PredictionService = new MockPredictionService();

/** Demo input values for quick testing */
export const DEMO_VALUES: NetworkInput = {
  latency: 24,
  jitter: 3,
  packetLoss: 0.2,
  signalStrength: -45,
  signalUnit: 'dBm',
  testServer: 'Ashburn, VA (Edge Node 04)',
};

/** Pre-configured realistic network scenarios for immediate testing */
export const PRESET_SCENARIOS: NetworkScenario[] = [
  {
    id: 'fiber-gigabit',
    name: 'Fiber Gigabit (High Speed)',
    description: 'Ultra-low latency symmetric fiber connection with zero jitter.',
    icon: 'Zap',
    category: 'Broadband',
    values: {
      latency: 8,
      jitter: 0.8,
      packetLoss: 0.0,
      signalStrength: -38,
      signalUnit: 'dBm',
      testServer: 'New York Metro (Fiber PoP)',
    },
  },
  {
    id: 'office-wifi',
    name: 'Office Wi-Fi 6 (Standard)',
    description: 'Corporate wireless network with balanced throughput and low interference.',
    icon: 'Wifi',
    category: 'Wireless',
    values: {
      latency: 22,
      jitter: 2.8,
      packetLoss: 0.1,
      signalStrength: -52,
      signalUnit: 'dBm',
      testServer: 'Chicago, IL (Cloudflare Gateway)',
    },
  },
  {
    id: 'mobile-5g',
    name: '5G Mobile Cellular',
    description: 'Modern cellular tower connection with high speed but moderate jitter.',
    icon: 'Signal',
    category: 'Cellular',
    values: {
      latency: 38,
      jitter: 7.5,
      packetLoss: 0.8,
      signalStrength: -68,
      signalUnit: 'dBm',
      testServer: 'Dallas, TX (Cellular Edge)',
    },
  },
  {
    id: 'congested-cafe',
    name: 'Crowded Public Café',
    description: 'Degraded link with high interference and RF packet collision.',
    icon: 'AlertTriangle',
    category: 'Degraded',
    values: {
      latency: 94,
      jitter: 26.0,
      packetLoss: 4.8,
      signalStrength: -82,
      signalUnit: 'dBm',
      testServer: 'Seattle, WA (Public Hotspot)',
    },
  },
  {
    id: 'satellite-link',
    name: 'Satellite / Geo-Orbit',
    description: 'High propagation delay link with high physical distance overhead.',
    icon: 'Radio',
    category: 'Satellite',
    values: {
      latency: 220,
      jitter: 18.5,
      packetLoss: 1.8,
      signalStrength: -74,
      signalUnit: 'dBm',
      testServer: 'LEO Constellation Downlink',
    },
  },
];
