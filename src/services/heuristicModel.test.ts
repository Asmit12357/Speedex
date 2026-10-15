import { describe, expect, it } from 'vitest';
import { classifyQuality, estimateDownloadMbps, normaliseSignal } from './heuristicModel';
import type { NetworkInput } from '../types';

const fiber: NetworkInput = {
  latency: 8,
  jitter: 0.8,
  packetLoss: 0,
  signalStrength: -38,
  signalUnit: 'dBm',
};

describe('normaliseSignal', () => {
  it('maps the dBm link budget onto 0–1', () => {
    expect(normaliseSignal(-90, 'dBm')).toBe(0);
    expect(normaliseSignal(-30, 'dBm')).toBe(1);
    expect(normaliseSignal(-60, 'dBm')).toBeCloseTo(0.5);
  });

  it('clamps percentages outside 0–100', () => {
    expect(normaliseSignal(150, '%')).toBe(1);
    expect(normaliseSignal(-5, '%')).toBe(0);
  });
});

describe('heuristic estimate', () => {
  it('rates a clean fiber link as Excellent', () => {
    const speed = estimateDownloadMbps(fiber);
    expect(speed).toBeGreaterThan(50);
    expect(classifyQuality(speed, fiber)).toBe('Excellent');
  });

  it('never returns a speed below the floor', () => {
    const awful: NetworkInput = { ...fiber, latency: 900, jitter: 200, packetLoss: 40, signalStrength: -99 };
    expect(estimateDownloadMbps(awful)).toBe(0.8);
  });
});
