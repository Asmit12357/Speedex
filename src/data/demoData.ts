/**
 * Sample trend shown until there are at least two real speed tests.
 * Illustrative values; the chart labels them "Sample data".
 */

export interface DemoTimePoint {
  time: string;
  downloadSpeed: number;
  uploadSpeed: number;
  latency: number;
  jitter: number;
  packetLoss: number;
}

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
