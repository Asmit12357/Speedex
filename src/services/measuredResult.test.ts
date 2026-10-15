import { describe, expect, it } from 'vitest';
import type { SpeedTestMeasurement } from '../types';
import { loadedLatencyIncrease, measuredSuitability, resultFromMeasurement } from './measuredResult';
import { migrateEntry } from '../hooks/useAnalysis';

const base: SpeedTestMeasurement = {
  profile: 'quick',
  downloadMbps: 180.2,
  uploadMbps: 42.7,
  latencyMs: 11,
  jitterMs: 1.4,
  downloadLoadedLatencyMs: 35,
  uploadLoadedLatencyMs: 61,
  scores: {
    streaming: { grade: 'great', gradeIndex: 4, points: 70 },
    gaming: { grade: 'average', gradeIndex: 2, points: 20 },
    rtc: { grade: 'poor', gradeIndex: 1, points: 12 },
  },
  downloadSamples: [150, 180.2],
  uploadSamples: [42.7],
  edge: { colo: 'SIN' },
  durationMs: 9000,
};

describe('resultFromMeasurement', () => {
  it('uses the measured numbers directly', () => {
    const r = resultFromMeasurement(base);
    expect(r).toMatchObject({ source: 'cloudflare', downloadSpeed: 180.2, uploadSpeed: 42.7, quality: 'Excellent' });
    expect(r.confidenceScore).toBeUndefined();
  });

  it('only lists packet loss when it was measured', () => {
    expect(resultFromMeasurement(base).factors.map((f) => f.label)).not.toContain('Packet loss');
    const withLoss = resultFromMeasurement({ ...base, packetLossPct: 3.2 });
    expect(withLoss.factors.find((f) => f.label === 'Packet loss')?.impact).toBe('negative');
    expect(withLoss.quality).toBe('Average');
  });

  it('downgrades slow, laggy links', () => {
    expect(resultFromMeasurement({ ...base, downloadMbps: 6, latencyMs: 140 }).quality).toBe('Poor');
  });
});

describe('loadedLatencyIncrease', () => {
  it('uses the worse of download and upload loaded latency', () => {
    expect(loadedLatencyIncrease(base)).toBe(50);
  });

  it('is undefined when loaded latency was not measured', () => {
    expect(loadedLatencyIncrease({ ...base, downloadLoadedLatencyMs: undefined, uploadLoadedLatencyMs: undefined })).toBeUndefined();
  });
});

describe('measuredSuitability', () => {
  it('maps Cloudflare grades to scores and keeps the transfer check', () => {
    const rows = measuredSuitability(base);
    expect(rows.map((r) => [r.category, r.suitable, r.score])).toEqual([
      ['streaming', true, 100],
      ['gaming', true, 60],
      ['calls', false, 40],
      ['transfers', true, 100],
    ]);
  });
});

describe('migrateEntry', () => {
  it('upgrades a v1 history entry to the source field', () => {
    const legacy = {
      id: '1',
      timestamp: '2026-01-01T00:00:00.000Z',
      input: { latency: 20, jitter: 2, packetLoss: 0, signalStrength: -50, signalUnit: 'dBm' },
      result: { downloadSpeed: 60, quality: 'Excellent', explanation: '', factors: [], isSimulated: true, confidenceScore: 95 },
    };
    const migrated = migrateEntry(legacy);
    expect(migrated?.result.source).toBe('estimate');
    expect(migrated?.result).not.toHaveProperty('isSimulated');
    expect(migrated?.result).not.toHaveProperty('confidenceScore');
  });

  it('drops malformed entries', () => {
    expect(migrateEntry({ id: 'x' })).toBeNull();
    expect(migrateEntry('junk')).toBeNull();
  });
});
