/**
 * Grades a live Cloudflare measurement with the same thresholds the
 * estimator uses, so measured and estimated results read the same way.
 */

import type {
  ApplicationSuitability,
  ExperienceGrade,
  ExperienceScore,
  PredictionFactor,
  PredictionResult,
  SpeedTestMeasurement,
} from '../types';
import {
  buildExplanation,
  classifyQuality,
  jitterFactor,
  latencyFactor,
  packetLossFactor,
  transferSuitability,
} from './heuristicModel';

const GRADE_LABEL: Record<ExperienceGrade, string> = {
  bad: 'Bad',
  poor: 'Poor',
  average: 'Average',
  good: 'Good',
  great: 'Great',
};

/** Extra latency once the link is busy. Large values mean bufferbloat. */
export function loadedLatencyIncrease(m: SpeedTestMeasurement): number | undefined {
  const loaded = [m.downloadLoadedLatencyMs, m.uploadLoadedLatencyMs].filter((v): v is number => v !== undefined);
  if (loaded.length === 0) return undefined;
  return Math.max(0, Math.round((Math.max(...loaded) - m.latencyMs) * 10) / 10);
}

export function bufferbloatFactor(increaseMs: number): PredictionFactor {
  const value = `+${increaseMs} ms`;
  const label = 'Latency under load';
  if (increaseMs < 30) return { label, value, impact: 'positive', benchmark: '< 30 ms added (Minimal bufferbloat)' };
  if (increaseMs < 100) return { label, value, impact: 'neutral', benchmark: '30–100 ms added (Some bufferbloat)' };
  return { label, value, impact: 'negative', benchmark: '> 100 ms added (Heavy bufferbloat)' };
}

export function measuredFactors(m: SpeedTestMeasurement): PredictionFactor[] {
  const factors = [latencyFactor(m.latencyMs), jitterFactor(m.jitterMs)];
  const increase = loadedLatencyIncrease(m);
  if (increase !== undefined) factors.push(bufferbloatFactor(increase));
  if (m.packetLossPct !== undefined) factors.push(packetLossFactor(m.packetLossPct));
  return factors;
}

function fromScore(
  category: string,
  name: string,
  score: ExperienceScore | undefined,
  use: string,
): ApplicationSuitability | null {
  if (!score) return null;
  return {
    category,
    name,
    // "Average" or better is usable; Cloudflare reserves bad/poor for noticeable problems
    suitable: score.gradeIndex >= 2,
    score: (score.gradeIndex + 1) * 20,
    note: `Cloudflare rates this connection ${GRADE_LABEL[score.grade]} for ${use}`,
  };
}

export function measuredSuitability(m: SpeedTestMeasurement): ApplicationSuitability[] {
  return [
    fromScore('streaming', 'Video streaming', m.scores.streaming, 'streaming'),
    fromScore('gaming', 'Online gaming', m.scores.gaming, 'gaming'),
    fromScore('calls', 'Video calls', m.scores.rtc, 'real-time calls'),
    transferSuitability(m.downloadMbps, m.uploadMbps),
  ].filter((s): s is ApplicationSuitability => s !== null);
}

export function resultFromMeasurement(m: SpeedTestMeasurement): PredictionResult {
  // Unmeasured packet loss is treated as zero for tiering only; the UI shows it as "not measured"
  const quality = classifyQuality(m.downloadMbps, { latency: m.latencyMs, packetLoss: m.packetLossPct ?? 0 });
  const factors = measuredFactors(m);

  return {
    downloadSpeed: m.downloadMbps,
    uploadSpeed: m.uploadMbps,
    quality,
    explanation: buildExplanation(quality, factors),
    source: 'cloudflare',
    factors,
    suitability: measuredSuitability(m),
  };
}
