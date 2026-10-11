/**
 * Deterministic demo data for the Overview dashboard.
 * All values here are illustrative and clearly labelled as such in the UI.
 */

export interface DemoTimePoint {
  time: string;
  downloadSpeed: number;
  latency: number;
}

/** 12 illustrative data points for the overview chart */
export const demoTimeSeries: DemoTimePoint[] = [
  { time: '00:00', downloadSpeed: 72.4, latency: 18 },
  { time: '02:00', downloadSpeed: 68.1, latency: 21 },
  { time: '04:00', downloadSpeed: 75.3, latency: 16 },
  { time: '06:00', downloadSpeed: 64.8, latency: 25 },
  { time: '08:00', downloadSpeed: 48.2, latency: 38 },
  { time: '10:00', downloadSpeed: 42.5, latency: 44 },
  { time: '12:00', downloadSpeed: 38.9, latency: 52 },
  { time: '14:00', downloadSpeed: 45.7, latency: 41 },
  { time: '16:00', downloadSpeed: 51.3, latency: 35 },
  { time: '18:00', downloadSpeed: 55.6, latency: 30 },
  { time: '20:00', downloadSpeed: 62.1, latency: 24 },
  { time: '22:00', downloadSpeed: 70.8, latency: 19 },
];

/** Overview card demo metrics */
export const demoMetrics = {
  downloadSpeed: 55.4,
  latency: 28,
  jitter: 4.2,
  packetLoss: 0.3,
  signalStrength: -48,
  quality: 'Average' as const,
};
