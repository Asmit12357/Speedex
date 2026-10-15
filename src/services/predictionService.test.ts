import { afterEach, describe, expect, it, vi } from 'vitest';
import type { NetworkInput, PredictionService } from '../types';
import {
  FallbackPredictionService,
  HttpPredictionService,
  createPredictionService,
  parseModelResponse,
} from './predictionService';
import { HeuristicPredictionService } from './heuristicModel';

const input: NetworkInput = { latency: 20, jitter: 2, packetLoss: 0.1, signalStrength: -50, signalUnit: 'dBm' };

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('parseModelResponse', () => {
  it('accepts the minimal contract and fills in the rest', () => {
    const r = parseModelResponse({ downloadSpeed: 72.5, quality: 'Excellent' }, input);
    expect(r.source).toBe('model');
    expect(r.downloadSpeed).toBe(72.5);
    expect(r.uploadSpeed).toBeGreaterThan(0);
    expect(r.factors.length).toBeGreaterThan(0);
    expect(r.explanation).not.toBe('');
    expect(r.confidenceScore).toBeUndefined();
  });

  it('keeps optional fields the model provides', () => {
    const r = parseModelResponse(
      {
        downloadSpeed: 40,
        uploadSpeed: 12,
        quality: 'Average',
        confidenceScore: 88,
        explanation: 'From the model.',
        factors: [{ label: 'Latency', value: '20 ms', impact: 'positive' }],
      },
      input,
    );
    expect(r).toMatchObject({ uploadSpeed: 12, confidenceScore: 88, explanation: 'From the model.' });
    expect(r.factors).toEqual([{ label: 'Latency', value: '20 ms', impact: 'positive' }]);
  });

  it.each([
    [null, /non-object/],
    [{ quality: 'Average' }, /downloadSpeed/],
    [{ downloadSpeed: -1, quality: 'Average' }, /downloadSpeed/],
    [{ downloadSpeed: 10, quality: 'Great' }, /quality/],
  ])('rejects %j', (body, message) => {
    expect(() => parseModelResponse(body, input)).toThrow(message);
  });

  it('ignores an out-of-range confidence score', () => {
    expect(parseModelResponse({ downloadSpeed: 1, quality: 'Poor', confidenceScore: 140 }, input).confidenceScore).toBeUndefined();
  });
});

describe('HttpPredictionService', () => {
  it('POSTs the features to <base>/predict', async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ downloadSpeed: 50, quality: 'Average' })));
    vi.stubGlobal('fetch', fetchMock);

    await new HttpPredictionService('/api/').predict({ ...input, testServer: 'ignored' });

    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('/api/predict');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body as string)).toEqual({
      latency: 20,
      jitter: 2,
      packetLoss: 0.1,
      signalStrength: -50,
      signalUnit: 'dBm',
    });
  });

  it('throws on a non-2xx response', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('nope', { status: 503 })));
    await expect(new HttpPredictionService('http://model').predict(input)).rejects.toThrow(/503/);
  });
});

describe('FallbackPredictionService', () => {
  it('returns the estimate with a notice when the model fails', async () => {
    const broken: PredictionService = { predict: async () => { throw new Error('connection refused'); } };
    const r = await new FallbackPredictionService(broken, new HeuristicPredictionService()).predict(input);
    expect(r.source).toBe('estimate');
    expect(r.notice).toMatch(/connection refused/);
  });
});

describe('createPredictionService', () => {
  it('uses the heuristic when no API is configured', () => {
    expect(createPredictionService(null)).toBeInstanceOf(HeuristicPredictionService);
  });

  it('wraps the model API with a fallback when configured', () => {
    expect(createPredictionService('/api')).toBeInstanceOf(FallbackPredictionService);
  });
});
