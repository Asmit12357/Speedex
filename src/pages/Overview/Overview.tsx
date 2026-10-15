import { lazy, Suspense } from 'react';
import {
  Zap,
  Clock,
  Activity,
  ArrowRight,
  Server,
  Tv,
  Gamepad2,
  Video,
  HardDriveUpload,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  Download,
  Upload,
  Gauge,
} from 'lucide-react';
import type { AnalysisEntry, PageId, SpeedTestMeasurement } from '../../types';
import type { SpeedTestState } from '../../hooks/useSpeedTest';
import { PRESET_SCENARIOS } from '../../data/scenarios';
import { SPEED_TEST_PROFILES } from '../../services/speedTestService';
import { formatEdge } from '../../services/edgeInfo';
import { isModelConfigured } from '../../services/predictionService';
import { formatMbps, formatMs, timeAgo } from '../../utils/format';
import MetricCard from '../../components/MetricCard/MetricCard';
import './Overview.css';

const NetworkChart = lazy(() => import('../../components/NetworkChart/NetworkChart'));

interface OverviewProps {
  history: AnalysisEntry[];
  testState: SpeedTestState;
  onNavigate: (page: PageId) => void;
  onStartTest: () => void;
  onSelectScenario: (scenarioId: string) => void;
  onOpenEntry: (entry: AnalysisEntry) => void;
}

const SUITABILITY_ICON = {
  streaming: Tv,
  gaming: Gamepad2,
  calls: Video,
  transfers: HardDriveUpload,
} as const;

const SCENARIO_COLOR: Record<string, string> = {
  Broadband: 'var(--color-electric)',
  Wireless: 'var(--accent-cyan)',
  Cellular: 'var(--accent-purple)',
  Satellite: 'var(--accent-amber)',
  Degraded: 'var(--accent-red)',
};

type Trend = { trend: 'up' | 'down' | 'stable'; trendValue: string; trendTone: 'good' | 'bad' | 'neutral' };

/** Change vs the previous test. `higherIsBetter` decides the color, not the arrow. */
function trendOf(now: number, before: number | undefined, unit: string, higherIsBetter: boolean): Trend | undefined {
  if (before === undefined) return undefined;
  const diff = Math.round((now - before) * 10) / 10;
  if (Math.abs(diff) < Math.max(0.1, Math.abs(before) * 0.03)) {
    return { trend: 'stable', trendValue: `±0 ${unit}`, trendTone: 'neutral' };
  }
  const good = diff > 0 === higherIsBetter;
  return {
    trend: diff > 0 ? 'up' : 'down',
    trendValue: `${diff > 0 ? '+' : ''}${diff} ${unit}`,
    trendTone: good ? 'good' : 'bad',
  };
}

/** 0–100 health from latency, jitter and (when measured) loss. Same weights as before, now on real data. */
function healthScore(m: SpeedTestMeasurement): number {
  const latencyPenalty = Math.max(0, (m.latencyMs - 15) * 0.4);
  const jitterPenalty = Math.max(0, (m.jitterMs - 1.5) * 1.5);
  const lossPenalty = (m.packetLossPct ?? 0) * 8;
  return Math.max(0, Math.min(100, Math.round(100 - latencyPenalty - jitterPenalty - lossPenalty)));
}

const Overview = ({ history, testState, onNavigate, onStartTest, onSelectScenario, onOpenEntry }: OverviewProps) => {
  const measured = history.filter((e) => e.measurement);
  const latest = measured[0];
  const previous = measured[1]?.measurement;
  const m = latest?.measurement;
  const running = testState.status === 'running';
  const runningPct = running ? Math.round((testState.progress?.fraction ?? 0) * 100) : 0;

  const score = m ? healthScore(m) : 0;
  const circumference = 264;
  const strokeOffset = circumference - circumference * (score / 100);

  return (
    <div className="overview fade-in">
      {/* ── Hero ── */}
      <section className="card overview__hero">
        <div className="overview__hero-left">
          <div className="overview__hero-badge">
            <span className="pulse-dot pulse-dot--online" />
            <span className="eyebrow">Live speed test · Cloudflare edge</span>
          </div>
          <h1 className="overview__hero-title">Network Intelligence &amp; SLA Diagnostics</h1>
          <p className="overview__hero-desc">
            Measure your real download, upload and latency against Cloudflare's global network, see what the
            connection is good for, and track it over time. A model that predicts speed from passive signals is
            in development.
          </p>

          <div className="overview__hero-meta">
            <div className="overview__meta-item">
              <Clock size={12} className="overview__meta-icon" />
              <span>Last test: <strong>{latest ? timeAgo(latest.timestamp) : 'none yet'}</strong></span>
            </div>
            {m?.edge && (
              <div className="overview__meta-item">
                <Server size={12} className="overview__meta-icon" />
                <span>Server: <strong>{formatEdge(m.edge)}</strong></span>
              </div>
            )}
            <div className="overview__meta-item">
              <Cpu size={12} className="overview__meta-icon" />
              <span>Model: <strong>{isModelConfigured ? 'Connected' : 'In development'}</strong></span>
            </div>
          </div>
        </div>

        <div className="overview__hero-right">
          {running ? (
            <button
              type="button"
              className="btn btn--secondary btn--lg overview__test-btn"
              onClick={() => onNavigate('speedtest')}
            >
              <span className="spinner" />
              <span>Test running · {runningPct}%</span>
            </button>
          ) : (
            <button type="button" className="btn btn--primary btn--lg overview__test-btn" onClick={onStartTest}>
              <Zap size={15} />
              <span>{latest ? 'Run speed test again' : 'Run speed test'}</span>
            </button>
          )}
          <span className="overview__hero-note">Quick test · {SPEED_TEST_PROFILES.quick.dataNote}</span>
        </div>
      </section>

      {/* ── Latest numbers ── */}
      <section className="overview__metrics" aria-label="Latest speed test">
        <MetricCard
          icon={<Download size={16} />}
          label="Download"
          value={m ? formatMbps(m.downloadMbps) : '—'}
          unit="Mbps"
          color="var(--accent-cyan)"
          subtitle={m ? 'Measured, 90th percentile of requests' : 'Run a speed test to fill this in'}
          benchmark="25+ for 4K"
          {...(m && trendOf(m.downloadMbps, previous?.downloadMbps, 'Mbps', true))}
        />

        <MetricCard
          icon={<Upload size={16} />}
          label="Upload"
          value={m ? formatMbps(m.uploadMbps) : '—'}
          unit="Mbps"
          color="var(--color-electric)"
          subtitle={m ? 'Measured, 90th percentile of requests' : 'Run a speed test to fill this in'}
          benchmark="10+ for calls"
          {...(m && trendOf(m.uploadMbps, previous?.uploadMbps, 'Mbps', true))}
        />

        <MetricCard
          icon={<Clock size={16} />}
          label="Latency"
          value={m ? formatMs(m.latencyMs) : '—'}
          unit="ms"
          color="var(--accent-purple)"
          subtitle={m ? 'Median round trip while the link is idle' : 'Run a speed test to fill this in'}
          benchmark="< 30 ms"
          {...(m && trendOf(m.latencyMs, previous?.latencyMs, 'ms', false))}
        />

        <MetricCard
          icon={<Activity size={16} />}
          label="Jitter"
          value={m ? formatMs(m.jitterMs) : '—'}
          unit="ms"
          color="var(--accent-red)"
          subtitle={m ? 'Average change between latency samples' : 'Run a speed test to fill this in'}
          benchmark="< 5 ms"
          {...(m && trendOf(m.jitterMs, previous?.jitterMs, 'ms', false))}
        />
      </section>

      {/* ── Trend ── */}
      <Suspense fallback={<div className="card overview__chart-placeholder" />}>
        <NetworkChart history={history} onRunTest={onStartTest} />
      </Suspense>

      {/* ── Quality & suitability ── */}
      <div className="overview__panels">
        <div className="card overview__quality-card">
          <div className="overview__card-header">
            <div>
              <span className="eyebrow">Connection health</span>
              <h3 className="overview__card-title">Quality &amp; SLA readiness</h3>
            </div>
            {latest && (
              <span className={`quality-badge quality-badge--${latest.result.quality.toLowerCase()}`}>
                {latest.result.quality}
              </span>
            )}
          </div>

          {m ? (
            <>
              <p className="overview__card-desc">
                Scored from your last test's latency, jitter{m.packetLossPct !== undefined ? ' and packet loss' : ''}, using
                ITU-T Y.1541-style targets.
              </p>

              <div className="overview__quality-gauge-wrapper">
                <div className="overview__gauge" role="img" aria-label={`Health score ${score} out of 100`}>
                  <svg viewBox="0 0 100 100" className="overview__gauge-svg">
                    <circle cx="50" cy="50" r="42" className="overview__gauge-bg" />
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      className="overview__gauge-fill"
                      style={{ strokeDashoffset: strokeOffset }}
                    />
                  </svg>
                  <div className="overview__gauge-label">
                    <span className="overview__gauge-score">{score}</span>
                    <span className="overview__gauge-max">/100</span>
                  </div>
                </div>

                <div className="overview__quality-details">
                  <div className="overview__health-box">
                    <div className="overview__health-title">
                      {latest.result.quality === 'Poor' ? (
                        <AlertTriangle size={15} className="overview__icon-warn" />
                      ) : (
                        <CheckCircle2 size={15} className="overview__icon-green" />
                      )}
                      <span>
                        {latest.result.quality === 'Excellent' && 'Ready for demanding real-time work'}
                        {latest.result.quality === 'Average' && 'Fine for everyday use'}
                        {latest.result.quality === 'Poor' && 'Expect slowdowns and lag'}
                      </span>
                    </div>
                    <p className="overview__health-text">{latest.result.explanation}</p>
                  </div>

                  <div className="overview__sla-row">
                    <span className="overview__sla-item">
                      Latency: <strong>{m.latencyMs < 30 ? 'PASS' : 'MISS'} (&lt;30 ms)</strong>
                    </span>
                    <span className="overview__sla-item">
                      Jitter: <strong>{m.jitterMs < 5 ? 'PASS' : 'MISS'} (&lt;5 ms)</strong>
                    </span>
                    <span className="overview__sla-item">
                      Loss:{' '}
                      <strong>
                        {m.packetLossPct === undefined ? 'NOT MEASURED' : `${m.packetLossPct < 0.5 ? 'PASS' : 'MISS'} (<0.5%)`}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="overview__panel-empty">
              <Gauge size={28} />
              <p>Your connection health score appears after the first speed test.</p>
            </div>
          )}

          <div className="overview__card-footer">
            <button
              type="button"
              className="btn btn--secondary btn--sm"
              onClick={() => (latest ? onOpenEntry(latest) : onStartTest())}
            >
              <span>{latest ? 'Open full report' : 'Run speed test'}</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>

        <div className="card overview__suitability-card">
          <div className="overview__card-header">
            <div>
              <span className="eyebrow">What it's good for</span>
              <h3 className="overview__card-title">Workload readiness</h3>
            </div>
            {latest && <span className="tag-pill">Cloudflare AIM</span>}
          </div>

          {latest?.result.suitability?.length ? (
            <>
              <p className="overview__card-desc">Based on your last measured test:</p>
              <div className="overview__suitability-list">
                {latest.result.suitability.map((item) => {
                  const Icon = SUITABILITY_ICON[item.category as keyof typeof SUITABILITY_ICON] ?? Activity;
                  return (
                    <div key={item.category} className="overview__suitability-item">
                      <div className="overview__suitability-left">
                        <div className="overview__suitability-icon">
                          <Icon size={15} />
                        </div>
                        <div className="overview__suitability-text">
                          <div className="overview__suitability-name">{item.name}</div>
                          <div className="overview__suitability-sub">{item.note}</div>
                        </div>
                      </div>
                      <span className={`tag-pill ${item.suitable ? 'tag-pill--pass' : 'tag-pill--fail'}`}>
                        {item.suitable ? 'Good' : 'Struggles'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="overview__panel-empty">
              <Tv size={28} />
              <p>Streaming, gaming, video call and big-file ratings appear after the first speed test.</p>
            </div>
          )}

          <div className="overview__card-footer">
            <button type="button" className="btn btn--secondary btn--sm" onClick={() => onNavigate('analyzer')}>
              <span>Estimate a different connection</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* ── How it works ── */}
      <section className="card overview__ai-card">
        <div className="overview__ai-header">
          <div className="overview__ai-title-wrap">
            <span className="eyebrow">How Speedex works</span>
            <h3 className="overview__ai-title">Measure now, predict next</h3>
          </div>
          <button type="button" className="btn btn--secondary btn--sm" onClick={() => onNavigate('about')}>
            <span>Model roadmap</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <div className="overview__ai-steps">
          <div className="overview__ai-step">
            <div className="overview__ai-step-num">01 · Live</div>
            <div className="overview__ai-step-title">Measure</div>
            <p className="overview__ai-step-desc">
              Cloudflare's open-source speed test measures download, upload, latency, jitter and latency under load
              from your browser.
            </p>
          </div>

          <div className="overview__ai-step">
            <div className="overview__ai-step-num">02 · Live</div>
            <div className="overview__ai-step-title">Grade</div>
            <p className="overview__ai-step-desc">
              Results are graded against standard targets and Cloudflare's AIM ratings for streaming, gaming and calls.
            </p>
          </div>

          <div className="overview__ai-step">
            <div className="overview__ai-step-num">03 · {isModelConfigured ? 'Live' : 'In development'}</div>
            <div className="overview__ai-step-title">Predict</div>
            <p className="overview__ai-step-desc">
              A model will estimate speed from passive signals without a full test. Until then the Estimator uses a
              built-in formula.
            </p>
          </div>
        </div>
      </section>

      {/* ── Presets ── */}
      <section className="card overview__scenarios-card">
        <div className="overview__scenarios-header">
          <div>
            <span className="eyebrow">Preset profiles</span>
            <h3 className="overview__scenarios-title">Try the estimator on typical connections</h3>
          </div>
          <span className="overview__scenarios-hint">Opens the Estimator with these values filled in</span>
        </div>

        <div className="overview__scenarios-chips">
          {PRESET_SCENARIOS.map((sc) => (
            <button
              key={sc.id}
              type="button"
              className="tag-pill overview__scenario-chip"
              onClick={() => onSelectScenario(sc.id)}
              title={sc.description}
            >
              <span className="overview__scenario-dot" style={{ background: SCENARIO_COLOR[sc.category] }} />
              <span>
                {sc.name} · {sc.values.latency} ms · {sc.values.jitter} ms jitter
                {sc.values.packetLoss > 0 ? ` · ${sc.values.packetLoss}% loss` : ''}
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Overview;
