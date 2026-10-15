import { describe, expect, it, vi } from 'vitest';
import type { MeasurementSummary, Results, Scores } from '@cloudflare/speedtest';
import {
  SpeedTestCancelledError,
  buildEngineConfig,
  planFor,
  probeLatency,
  runSpeedTest,
  toMeasurement,
  type EngineFactory,
  type SpeedTestEngineLike,
} from './speedTestService';
import { formatEdge, parseTrace } from './edgeInfo';
import type { SpeedTestProgress } from '../types';

const SCORES: Scores = {
  streaming: { points: 45, classificationIdx: 3, classificationName: 'good' },
  gaming: { points: 12, classificationIdx: 1, classificationName: 'poor' },
  rtc: { points: 50, classificationIdx: 4, classificationName: 'great' },
};

const FULL_SUMMARY: MeasurementSummary = {
  download: 94_350_000,
  upload: 21_120_000,
  latency: 12.34,
  jitter: 1.26,
  downLoadedLatency: 48.1,
  upLoadedLatency: 30.05,
};

function fakeResults(summary: MeasurementSummary, durationMs = 9_500): Results {
  return {
    getSummary: () => summary,
    getScores: () => SCORES,
    getDownloadBandwidthPoints: () => [{ bps: 80e6 }, { bps: 94.35e6 }],
    getUploadBandwidthPoints: () => [{ bps: 21.12e6 }],
    getTotalDurationMs: () => durationMs,
  } as unknown as Results;
}

/** Engine double: the test drives its callbacks by hand. */
function fakeEngine(summary: MeasurementSummary = FULL_SUMMARY) {
  const engine: SpeedTestEngineLike = {
    onPhaseChange: () => {},
    onResultsChange: () => {},
    onFinish: () => {},
    onError: () => {},
    results: fakeResults(summary),
    play: vi.fn(),
    pause: vi.fn(),
  };
  const factory: EngineFactory = vi.fn(() => engine);
  return { engine, deps: { loadEngine: async () => factory, fetchEdge: async () => ({ colo: 'BOM', city: 'Mumbai' }) }, factory };
}

const tick = () => new Promise((r) => setTimeout(r, 0));

describe('planFor', () => {
  const totalBytes = (profile: 'quick' | 'full') =>
    planFor(profile, false).reduce((sum, { step }) => sum + ('bytes' in step ? step.bytes * step.count : 0), 0);

  it('keeps the quick test around 30 MB worst case', () => {
    expect(totalBytes('quick')).toBeLessThanOrEqual(32e6);
  });

  it('only adds packet loss when TURN is configured', () => {
    expect(planFor('quick', false).some((p) => p.phase === 'packetLoss')).toBe(false);
    const withLoss = planFor('quick', true);
    expect(withLoss[3].step.type).toBe('packetLoss');
    expect(withLoss).toHaveLength(planFor('quick', false).length + 1);
  });

  it('starts every plan with idle latency', () => {
    expect(planFor('full', false)[2]).toEqual({ phase: 'latency', step: { type: 'latency', numPackets: 20 } });
  });
});

describe('buildEngineConfig', () => {
  it('does not send results to Cloudflare and waits for play()', () => {
    const cfg = buildEngineConfig(planFor('quick', false));
    expect(cfg.logAimApiUrl).toBeNull();
    expect(cfg.logMeasurementApiUrl).toBeNull();
    expect(cfg.autoStart).toBe(false);
  });
});

describe('toMeasurement', () => {
  const raw = {
    summary: { ...FULL_SUMMARY, packetLoss: 0.0123 },
    scores: SCORES,
    downloadPoints: [{ bps: 80e6 }],
    uploadPoints: [{ bps: 21.12e6 }],
    durationMs: 9_512.7,
  };

  it('converts bps to Mbps and rounds to one decimal', () => {
    const m = toMeasurement(raw, 'quick');
    expect(m.downloadMbps).toBe(94.4);
    expect(m.uploadMbps).toBe(21.1);
    expect(m.latencyMs).toBe(12.3);
    expect(m.jitterMs).toBe(1.3);
    expect(m.downloadSamples).toEqual([80]);
    expect(m.durationMs).toBe(9513);
  });

  it('turns the packet loss ratio into a percentage', () => {
    expect(toMeasurement(raw, 'quick').packetLossPct).toBe(1.2);
    expect(toMeasurement({ ...raw, summary: FULL_SUMMARY }, 'quick').packetLossPct).toBeUndefined();
  });

  it('maps AIM scores to grades', () => {
    const { scores } = toMeasurement(raw, 'full');
    expect(scores.streaming).toEqual({ grade: 'good', gradeIndex: 3, points: 45 });
    expect(scores.gaming?.grade).toBe('poor');
    expect(scores.rtc?.grade).toBe('great');
  });

  it('rejects a run with no bandwidth results', () => {
    expect(() => toMeasurement({ ...raw, summary: { latency: 10 } }, 'quick')).toThrow(/download/);
  });
});

describe('runSpeedTest', () => {
  it('reports progress per phase and resolves with the measurement', async () => {
    const { engine, deps } = fakeEngine();
    const progress: SpeedTestProgress[] = [];
    const run = runSpeedTest('quick', (p) => progress.push(p), deps);
    await tick();

    expect(engine.play).toHaveBeenCalled();
    engine.onPhaseChange({ measurementId: 3, measurement: { type: 'download', bytes: 1e5, count: 8 } });
    expect(progress.at(-1)).toMatchObject({ phase: 'download', downloadMbps: 94.4 });
    expect(progress.at(-1)!.fraction).toBeCloseTo(3 / planFor('quick').length);

    engine.onFinish(engine.results);
    const m = await run.done;
    expect(m.downloadMbps).toBe(94.4);
    expect(m.edge?.colo).toBe('BOM');
  });

  it('fails the run when a bandwidth step errors', async () => {
    const { engine, deps } = fakeEngine();
    const run = runSpeedTest('quick', () => {}, deps);
    await tick();
    engine.onPhaseChange({ measurementId: 4, measurement: { type: 'download', bytes: 1e6, count: 6 } });
    engine.onError('net::ERR_BLOCKED_BY_CLIENT');
    await expect(run.done).rejects.toThrow(/ERR_BLOCKED_BY_CLIENT/);
    expect(engine.pause).toHaveBeenCalled();
  });

  it('keeps going when only the packet loss step errors', async () => {
    const { engine, deps } = fakeEngine();
    const run = runSpeedTest('quick', () => {}, { ...deps, withPacketLoss: true });
    await tick();
    engine.onPhaseChange({
      measurementId: 3,
      measurement: { type: 'packetLoss', numPackets: 300, batchSize: 10, batchWaitTime: 10, responsesWaitTime: 3000 },
    });
    engine.onError('unable to get turn server credentials');
    expect(engine.pause).not.toHaveBeenCalled();
    engine.onFinish(engine.results);
    await expect(run.done).resolves.toMatchObject({ uploadMbps: 21.1 });
  });

  it('rejects with a cancellation error when cancelled', async () => {
    const { deps } = fakeEngine();
    const run = runSpeedTest('quick', () => {}, deps);
    await tick();
    run.cancel();
    await expect(run.done).rejects.toBeInstanceOf(SpeedTestCancelledError);
  });

  it('never creates an engine when cancelled before it loads', async () => {
    const { deps, factory } = fakeEngine();
    const run = runSpeedTest('quick', () => {}, deps);
    run.cancel();
    await expect(run.done).rejects.toBeInstanceOf(SpeedTestCancelledError);
    expect(factory).not.toHaveBeenCalled();
  });
});

describe('probeLatency', () => {
  it('returns latency and jitter without bandwidth steps', async () => {
    const { engine, deps, factory } = fakeEngine({ latency: 23.46, jitter: 2.04 });
    const probe = probeLatency(deps);
    await tick();
    const options = vi.mocked(factory).mock.calls[0][0];
    expect(options.measurements?.filter((s) => s.type === 'upload')).toHaveLength(0);
    engine.onFinish(engine.results);
    await expect(probe).resolves.toEqual({ latencyMs: 23.5, jitterMs: 2, edge: { colo: 'BOM', city: 'Mumbai' } });
  });
});

describe('parseTrace', () => {
  const TRACE = ['fl=1007f144', 'h=speed.cloudflare.com', 'ip=203.0.113.9', 'colo=DEL', 'loc=IN', 'tls=TLSv1.3', ''].join('\n');

  it('reads the data center and country', () => {
    expect(parseTrace(TRACE)).toEqual({ colo: 'DEL', country: 'IN' });
  });

  it('ignores the unknown-country placeholder', () => {
    expect(parseTrace(['colo=SJC', 'loc=XX'].join('\n'))).toEqual({ colo: 'SJC', country: undefined });
  });

  it('returns undefined without a colo line', () => {
    expect(parseTrace(['fl=1', 'ip=203.0.113.9'].join('\n'))).toBeUndefined();
  });

  it('formats as code plus place', () => {
    expect(formatEdge({ colo: 'BOM', city: 'Mumbai' })).toBe('BOM · Mumbai');
    expect(formatEdge({ colo: 'DEL', country: 'IN' })).toMatch(/^DEL · (India|IN)$/);
    expect(formatEdge({ colo: 'AMS' })).toBe('AMS');
  });
});
