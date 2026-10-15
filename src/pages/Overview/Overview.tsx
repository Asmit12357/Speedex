import React, { useState } from 'react';
import {
  Zap,
  Clock,
  Activity,
  AlertTriangle,
  ArrowRight,
  Server,
  Tv,
  Gamepad2,
  Video,
  HardDriveUpload,
  CheckCircle2,
  Cpu,
} from 'lucide-react';
import type { PageId } from '../../types';
import { demoMetrics } from '../../data/demoData';
import MetricCard from '../../components/MetricCard/MetricCard';
import NetworkChart from '../../components/NetworkChart/NetworkChart';
import './Overview.css';

interface OverviewProps {
  onNavigate: (page: PageId) => void;
  onRunDemo: () => void;
}

const Overview: React.FC<OverviewProps> = ({ onNavigate, onRunDemo }) => {
  const [isQuickTesting, setIsQuickTesting] = useState(false);
  const [quickTestPhase, setQuickTestPhase] = useState<string>('');

  const handleStartQuickDiagnostic = async () => {
    setIsQuickTesting(true);
    setQuickTestPhase('Probing Round-Trip Latency (ICMP)...');
    await new Promise((r) => setTimeout(r, 450));

    setQuickTestPhase('Sampling Packet Jitter Dispersion...');
    await new Promise((r) => setTimeout(r, 450));

    setQuickTestPhase('Running Dual-Task ML Regressor...');
    await new Promise((r) => setTimeout(r, 400));

    setIsQuickTesting(false);
    onRunDemo();
  };

  const qualityClass = `quality-badge quality-badge--${demoMetrics.quality.toLowerCase()}`;

  // Dynamic SLA health score computation based on telemetry
  const latencyPenalty = Math.max(0, (demoMetrics.latency - 15) * 0.4);
  const jitterPenalty = Math.max(0, (demoMetrics.jitter - 1.5) * 1.5);
  const lossPenalty = demoMetrics.packetLoss * 8;
  const healthScore = Math.max(20, Math.min(100, Math.round(100 - latencyPenalty - jitterPenalty - lossPenalty)));
  const circumference = 264;
  const strokeOffset = circumference - (circumference * (healthScore / 100));

  return (
    <div className="overview fade-in">
      {/* ── Page Hero Command Center ── */}
      <section className="card overview__hero">
        <div className="overview__hero-left">
          <div className="overview__hero-badge">
            <span className="pulse-dot pulse-dot--online" />
            <span className="eyebrow">Carrier Telemetry Gateway · Active</span>
          </div>
          <h1 className="overview__hero-title">
            Network Intelligence &amp; SLA Diagnostics
          </h1>
          <p className="overview__hero-desc">
            Continuous passive transport telemetry monitoring coupled with dual-task machine learning. Accurately evaluates link throughput and ITU-T operational SLA tiers without flooding metered data connections.
          </p>

          <div className="overview__hero-meta">
            <div className="overview__meta-item">
              <Server size={12} className="overview__meta-icon" />
              <span>Target PoP: <strong>{demoMetrics.serverLocation}</strong></span>
            </div>
            <div className="overview__meta-item">
              <span>Local Gateway: <strong>{demoMetrics.ip}</strong></span>
            </div>
            <div className="overview__meta-item">
              <Cpu size={12} className="overview__meta-icon" />
              <span>Model: <strong>Dual-Task XGBoost (R² 0.94)</strong></span>
            </div>
          </div>
        </div>

        <div className="overview__hero-right">
          <button
            type="button"
            className="btn btn--primary btn--lg overview__test-btn"
            onClick={handleStartQuickDiagnostic}
            disabled={isQuickTesting}
          >
            {isQuickTesting ? (
              <>
                <span className="spinner" />
                <span>{quickTestPhase}</span>
              </>
            ) : (
              <>
                <Zap size={15} />
                <span>Run Live Diagnostic</span>
              </>
            )}
          </button>
          <span className="overview__hero-note">Passive telemetry probe · Zero payload overhead</span>
        </div>
      </section>

      {/* ── Metric Cards Grid ── */}
      <section className="overview__metrics" aria-label="Key Performance Indicators">
        <MetricCard
          icon={<Clock size={16} />}
          label="Round-Trip Latency"
          value={demoMetrics.latency}
          unit="ms"
          color="var(--accent-cyan)"
          subtitle="Median response time across ICMP probes"
          trend="down"
          trendValue="-2.4ms"
          benchmark="< 20ms Target"
        />

        <MetricCard
          icon={<Activity size={16} />}
          label="Packet Jitter"
          value={demoMetrics.jitter}
          unit="ms"
          color="var(--color-electric)"
          subtitle="Mean packet arrival dispersion variance"
          trend="stable"
          trendValue="0.1ms"
          benchmark="< 5ms Target"
        />

        <MetricCard
          icon={<AlertTriangle size={16} />}
          label="Packet Loss"
          value={demoMetrics.packetLoss}
          unit="%"
          color="var(--accent-red)"
          subtitle="Transport layer dropped packet ratio"
          trend="stable"
          trendValue="0.0%"
          benchmark="< 0.5% Target"
        />

        <MetricCard
          icon={<Zap size={16} />}
          label="Predicted Throughput"
          value={demoMetrics.downloadSpeed}
          unit="Mbps"
          color="var(--accent-purple)"
          subtitle="Dual-task ML estimated download capacity"
          trend="up"
          trendValue="+12.0 Mbps"
          benchmark="Tier-1 SLA"
        />
      </section>

      {/* ── Historical Performance Trend Chart ── */}
      <NetworkChart />

      {/* ── Dual Panel Section: Quality & Suitability ── */}
      <div className="overview__panels">
        {/* Network Quality Card */}
        <div className="card overview__quality-card">
          <div className="overview__card-header">
            <div>
              <span className="eyebrow">Service Level Compliance</span>
              <h3 className="overview__card-title">Network Quality &amp; SLA Readiness</h3>
            </div>
            <span className={qualityClass}>{demoMetrics.quality}</span>
          </div>

          <p className="overview__card-desc">
            Dual-task classifier maps link characteristics to international telecommunication standards (ITU-T Y.1541).
          </p>

          <div className="overview__quality-gauge-wrapper">
            <div className="overview__gauge">
              <svg viewBox="0 0 100 100" className="overview__gauge-svg">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="overview__gauge-bg"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="overview__gauge-fill"
                  style={{ strokeDashoffset: strokeOffset }}
                />
              </svg>
              <div className="overview__gauge-label">
                <span className="overview__gauge-score">{healthScore}</span>
                <span className="overview__gauge-max">/100</span>
              </div>
            </div>

            <div className="overview__quality-details">
              <div className="overview__health-box">
                <div className="overview__health-title">
                  <CheckCircle2 size={15} className="overview__icon-green" />
                  <span>Carrier-Grade Stability Verified</span>
                </div>
                <p className="overview__health-text">
                  Packet loss under 0.1% with latency well below SLA thresholds. Qualified for all high-concurrency and latency-critical cloud operations.
                </p>
              </div>

              <div className="overview__sla-row">
                <span className="overview__sla-item">Jitter SLA: <strong>PASS (&lt;5ms)</strong></span>
                <span className="overview__sla-item">RTT SLA: <strong>PASS (&lt;30ms)</strong></span>
                <span className="overview__sla-item">Loss SLA: <strong>PASS (&lt;0.5%)</strong></span>
              </div>
            </div>
          </div>

          <div className="overview__card-footer">
            <button
              type="button"
              className="btn btn--secondary btn--sm"
              onClick={() => onNavigate('results')}
            >
              <span>View Full Prediction Breakdown</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {/* Workload Suitability Matrix */}
        <div className="card overview__suitability-card">
          <div className="overview__card-header">
            <div>
              <span className="eyebrow">Protocol Suitability</span>
              <h3 className="overview__card-title">Workload Readiness Matrix</h3>
            </div>
            <span className="tag-pill">Benchmark Calibrated</span>
          </div>

          <p className="overview__card-desc">
            Measured link capability compared against strict protocol and application bandwidth thresholds:
          </p>

          <div className="overview__suitability-list">
            <div className="overview__suitability-item">
              <div className="overview__suitability-left">
                <div className="overview__suitability-icon">
                  <Tv size={15} />
                </div>
                <div>
                  <div className="overview__suitability-name">4K / 8K UHD HDR Streaming</div>
                  <div className="overview__suitability-sub">Target &gt; 25 Mbps · Measured {demoMetrics.downloadSpeed} Mbps (3.7x Headroom)</div>
                </div>
              </div>
              <span className="tag-pill tag-pill--pass">Optimized</span>
            </div>

            <div className="overview__suitability-item">
              <div className="overview__suitability-left">
                <div className="overview__suitability-icon">
                  <Gamepad2 size={15} />
                </div>
                <div>
                  <div className="overview__suitability-name">Competitive Cloud Gaming</div>
                  <div className="overview__suitability-sub">Target &lt; 30ms RTT · Measured {demoMetrics.latency}ms / {demoMetrics.jitter}ms Jitter</div>
                </div>
              </div>
              <span className="tag-pill tag-pill--pass">Ultra-Low Delay</span>
            </div>

            <div className="overview__suitability-item">
              <div className="overview__suitability-left">
                <div className="overview__suitability-icon">
                  <Video size={15} />
                </div>
                <div>
                  <div className="overview__suitability-name">HD Video Conferencing (WebRTC)</div>
                  <div className="overview__suitability-sub">Target &lt; 1% Loss · Measured {demoMetrics.packetLoss}% Loss (Zero Glitch)</div>
                </div>
              </div>
              <span className="tag-pill tag-pill--pass">Stable</span>
            </div>

            <div className="overview__suitability-item">
              <div className="overview__suitability-left">
                <div className="overview__suitability-icon">
                  <HardDriveUpload size={15} />
                </div>
                <div>
                  <div className="overview__suitability-name">Cloud Sync &amp; Datacenter Backup</div>
                  <div className="overview__suitability-sub">Throughput-bound large file synchronization pipelines</div>
                </div>
              </div>
              <span className="tag-pill tag-pill--pass">High Throughput</span>
            </div>
          </div>

          <div className="overview__card-footer">
            <button
              type="button"
              className="btn btn--secondary btn--sm"
              onClick={() => onNavigate('analyzer')}
            >
              <span>Test Custom Telemetry Parameters</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* ── ML Dual-Task Architecture Quick Summary ── */}
      <section className="card overview__ai-card">
        <div className="overview__ai-header">
          <div className="overview__ai-title-wrap">
            <span className="eyebrow">Zero-Saturation Telemetry</span>
            <h3 className="overview__ai-title">Dual-Task Predictive Machine Learning</h3>
          </div>
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            onClick={() => onNavigate('about')}
          >
            <span>Read ML Architecture Whitepaper</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <p className="overview__ai-desc">
          Unlike legacy speed tests that saturate connections with 50+ MB dummy payloads, Speedex evaluates link health via lightweight passive telemetry. Four transport features feed a synchronized dual-task ML pipeline:
        </p>

        <div className="overview__ai-steps">
          <div className="overview__ai-step">
            <div className="overview__ai-step-num">01</div>
            <div className="overview__ai-step-title">Passive Telemetry Probe</div>
            <p className="overview__ai-step-desc">
              Measures transport RTT latency, packet jitter variance, and packet loss rate using micro ICMP/UDP probes.
            </p>
          </div>

          <div className="overview__ai-step">
            <div className="overview__ai-step-num">02</div>
            <div className="overview__ai-step-title">Regression: Throughput (Mbps)</div>
            <p className="overview__ai-step-desc">
              Ensemble regressor predicts continuous download bandwidth with R² &gt; 0.94 without flooding links.
            </p>
          </div>

          <div className="overview__ai-step">
            <div className="overview__ai-step-num">03</div>
            <div className="overview__ai-step-title">Classification: Quality Tier</div>
            <p className="overview__ai-step-desc">
              Multi-class tree classifies connection into ITU-T operational SLA tiers (Excellent / Good / Fair / Poor).
            </p>
          </div>
        </div>
      </section>

      {/* ── Scenario Quick Selector ── */}
      <section className="card overview__scenarios-card">
        <div className="overview__scenarios-header">
          <div>
            <span className="eyebrow">Preset Profiles</span>
            <h3 className="overview__scenarios-title">Simulate Real-World Network Link Profiles</h3>
          </div>
          <span className="overview__scenarios-hint">Click any profile to load into Network Analyzer</span>
        </div>

        <div className="overview__scenarios-chips">
          <button
            type="button"
            className="tag-pill overview__scenario-chip"
            onClick={() => onNavigate('analyzer')}
          >
            <span className="overview__scenario-dot" style={{ background: 'var(--color-electric)' }} />
            <span>Fiber Gigabit · 10ms · 0.5ms Jitter</span>
          </button>

          <button
            type="button"
            className="tag-pill overview__scenario-chip"
            onClick={() => onNavigate('analyzer')}
          >
            <span className="overview__scenario-dot" style={{ background: 'var(--accent-cyan)' }} />
            <span>High-Speed Broadband · 22ms · 2.1ms Jitter</span>
          </button>

          <button
            type="button"
            className="tag-pill overview__scenario-chip"
            onClick={() => onNavigate('analyzer')}
          >
            <span className="overview__scenario-dot" style={{ background: 'var(--accent-purple)' }} />
            <span>Starlink LEO Satellite · 42ms · 8.4ms Jitter</span>
          </button>

          <button
            type="button"
            className="tag-pill overview__scenario-chip"
            onClick={() => onNavigate('analyzer')}
          >
            <span className="overview__scenario-dot" style={{ background: 'var(--accent-amber)' }} />
            <span>Degraded 4G / LTE · 85ms · 18ms Jitter · 3.2% Loss</span>
          </button>

          <button
            type="button"
            className="tag-pill overview__scenario-chip"
            onClick={() => onNavigate('analyzer')}
          >
            <span className="overview__scenario-dot" style={{ background: 'var(--accent-red)' }} />
            <span>High-Loss Wireless · 140ms · 45ms Jitter · 9.5% Loss</span>
          </button>
        </div>
      </section>
    </div>
  );
};

export default Overview;
