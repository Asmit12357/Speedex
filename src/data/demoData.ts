/**
 * Deterministic demo data for the Overview dashboard and analytics trends.
 * All values here are illustrative and clearly labelled as such in the UI.
 */

export interface DemoTimePoint {
  time: string;
  downloadSpeed: number;
  uploadSpeed: number;
  latency: number;
  jitter: number;
  packetLoss: number;
}

/** 12 illustrative data points for the overview 24-hour chart */
export const demoTimeSeries24h: DemoTimePoint[] = [
  { time: '00:00', downloadSpeed: 72.4, uploadSpeed: 24.8, latency: 18, jitter: 2.1, packetLoss: 0.1 },
  { time: '02:00', downloadSpeed: 68.1, uploadSpeed: 23.5, latency: 21, jitter: 2.4, packetLoss: 0.1 },
  { time: '04:00', downloadSpeed: 75.3, uploadSpeed: 26.2, latency: 16, jitter: 1.8, packetLoss: 0.0 },
  { time: '06:00', downloadSpeed: 64.8, uploadSpeed: 21.9, latency: 25, jitter: 3.2, packetLoss: 0.2 },
  { time: '08:00', downloadSpeed: 48.2, uploadSpeed: 17.5, latency: 38, jitter: 5.6, packetLoss: 0.5 },
  { time: '10:00', downloadSpeed: 42.5, uploadSpeed: 15.1, latency: 44, jitter: 6.8, packetLoss: 0.7 },
  { time: '12:00', downloadSpeed: 38.9, uploadSpeed: 14.0, latency: 52, jitter: 7.9, packetLoss: 0.9 },
  { time: '14:00', downloadSpeed: 45.7, uploadSpeed: 16.3, latency: 41, jitter: 6.1, packetLoss: 0.6 },
  { time: '16:00', downloadSpeed: 51.3, uploadSpeed: 18.2, latency: 35, jitter: 4.8, packetLoss: 0.4 },
  { time: '18:00', downloadSpeed: 55.6, uploadSpeed: 19.8, latency: 30, jitter: 4.0, packetLoss: 0.3 },
  { time: '20:00', downloadSpeed: 62.1, uploadSpeed: 21.7, latency: 24, jitter: 3.1, packetLoss: 0.2 },
  { time: '22:00', downloadSpeed: 70.8, uploadSpeed: 24.4, latency: 19, jitter: 2.3, packetLoss: 0.1 },
];

/** 12-hour high-resolution window */
export const demoTimeSeries12h: DemoTimePoint[] = [
  { time: '12:00', downloadSpeed: 38.9, uploadSpeed: 14.0, latency: 52, jitter: 7.9, packetLoss: 0.9 },
  { time: '13:00', downloadSpeed: 41.5, uploadSpeed: 15.0, latency: 48, jitter: 7.0, packetLoss: 0.8 },
  { time: '14:00', downloadSpeed: 45.7, uploadSpeed: 16.3, latency: 41, jitter: 6.1, packetLoss: 0.6 },
  { time: '15:00', downloadSpeed: 48.8, uploadSpeed: 17.1, latency: 38, jitter: 5.3, packetLoss: 0.5 },
  { time: '16:00', downloadSpeed: 51.3, uploadSpeed: 18.2, latency: 35, jitter: 4.8, packetLoss: 0.4 },
  { time: '17:00', downloadSpeed: 53.2, uploadSpeed: 19.0, latency: 33, jitter: 4.4, packetLoss: 0.3 },
  { time: '18:00', downloadSpeed: 55.6, uploadSpeed: 19.8, latency: 30, jitter: 4.0, packetLoss: 0.3 },
  { time: '19:00', downloadSpeed: 58.9, uploadSpeed: 20.6, latency: 27, jitter: 3.5, packetLoss: 0.2 },
  { time: '20:00', downloadSpeed: 62.1, uploadSpeed: 21.7, latency: 24, jitter: 3.1, packetLoss: 0.2 },
  { time: '21:00', downloadSpeed: 66.4, uploadSpeed: 23.0, latency: 21, jitter: 2.7, packetLoss: 0.1 },
  { time: '22:00', downloadSpeed: 70.8, uploadSpeed: 24.4, latency: 19, jitter: 2.3, packetLoss: 0.1 },
  { time: '23:00', downloadSpeed: 73.5, uploadSpeed: 25.1, latency: 18, jitter: 2.0, packetLoss: 0.1 },
];

/** Default alias for backward compatibility */
export const demoTimeSeries = demoTimeSeries24h;

/** Overview card demo metrics */
export const demoMetrics = {
  downloadSpeed: 58.4,
  uploadSpeed: 21.6,
  latency: 24,
  jitter: 3.2,
  packetLoss: 0.2,
  signalStrength: -46,
  signalUnit: 'dBm' as const,
  quality: 'Excellent' as const,
  confidenceScore: 94,
  isp: 'Cloud Diagnostics Edge Network',
  ip: '198.51.100.42 (Demo Gateway)',
  serverLocation: 'Frankfurt / Northern Edge Node',
};
