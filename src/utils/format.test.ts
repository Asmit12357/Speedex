import { describe, expect, it } from 'vitest';
import { formatMbps, formatMs, gaugeFraction, timeAgo } from './format';

describe('gaugeFraction', () => {
  it('is 0 at zero, 1 at the 1 Gbps cap and clamps above it', () => {
    expect(gaugeFraction(0)).toBe(0);
    expect(gaugeFraction(1000)).toBeCloseTo(1);
    expect(gaugeFraction(5000)).toBe(1);
  });

  it('gives mid-range speeds visible movement', () => {
    expect(gaugeFraction(25)).toBeGreaterThan(0.4);
    expect(gaugeFraction(100)).toBeGreaterThan(gaugeFraction(25));
  });

  it('treats bad input as empty', () => {
    expect(gaugeFraction(Number.NaN)).toBe(0);
    expect(gaugeFraction(-4)).toBe(0);
  });
});

describe('formatters', () => {
  it('keeps one decimal below 100 and rounds above', () => {
    expect(formatMbps(94.36)).toBe('94.4');
    expect(formatMbps(512.7)).toBe('513');
    expect(formatMs(12)).toBe('12.0');
    expect(formatMbps(undefined)).toBe('—');
  });

  it('describes recency', () => {
    const now = Date.parse('2026-10-15T12:00:00Z');
    expect(timeAgo('2026-10-15T11:59:30Z', now)).toBe('just now');
    expect(timeAgo('2026-10-15T11:15:00Z', now)).toBe('45 min ago');
    expect(timeAgo('2026-10-15T07:00:00Z', now)).toBe('5 h ago');
  });
});
