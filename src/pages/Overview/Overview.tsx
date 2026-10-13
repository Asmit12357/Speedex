import React, { useState } from 'react';
import {
  Zap,
  Clock,
  Activity,
  AlertTriangle,
  ArrowRight,
  PlayCircle,
  History as HistoryIcon,
  Info,
  Server,
  Tv,
  Gamepad2,
  Video,
  HardDriveUpload,
  Cpu,
  Sparkles,
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
    setQuickTestPhase('Probing Round-Trip Latency (ICMP/Ping)...');
    await new Promise((r) => setTimeout(r, 600));

    setQuickTestPhase('Sampling Packet Jitter & Link Budget...');
    await new Promise((r) => setTimeout(r, 600));

    setQuickTestPhase('Executing ML Throughput Regressor...');
    await new Promise((r) => setTimeout(r, 500));

    setIsQuickTesting(false);
    onRunDemo();
  };

  const qualityClass = `quality-badge quality-badge--${demoMetrics.quality.toLowerCase()}`;

  return (
    <div className="overview fade-in">
      {/* ── Page Header & Quick Diagnostic Banner ── */}
      <div className="overview__hero card">
        <div className="overview__hero-left">
          <div className="overview__hero-badge">
            <span className="pulse-dot pulse-dot--online" />
            <span>Telemetry Stream Active</span>
          </div>
          <h1 className="overview__hero-title">Network Diagnostics &amp; Quality Hub</h1>
          <p className="overview__hero-desc">
            Monitor real-time network telemetry, evaluate link health benchmarks, and simulate
            dual-task machine-learning bandwidth predictions.
          </p>

          <div className="overview__hero-meta">
            <div className="overview__meta-item">
              <Server size={14} className="overview__meta-icon" />
              <span>Target Node: <strong>{demoMetrics.serverLocation}</strong></span>
            </div>
            <div className="overview__meta-item">
              <span>Gateway: <strong>{demoMetrics.ip}</strong></span>
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
                <PlayCircle size={18} />
                <span>Run Instant Diagnostic</span>
              </>
            )}
          </button>
          <span className="overview__hero-note">Runs end-to-end simulated ML analysis</span>
        </div>
      </div>

      {/* ── Notice / Disclaimer Banner ── */}
      <div className="disclaimer">
        <Info size={16} style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <strong>Illustrative Baseline Telemetry:</strong> Dashboard charts and metrics currently
          reflect deterministic baseline demonstration values. To analyze your custom connection parameters,
          navigate to the <strong>Network Analyzer</strong>.
        </div>
      </div>

      {/* ── 4 Key Metric Cards ── */}
      <div className="overview__metrics">
        <MetricCard
          icon={<Zap size={20} />}
          label="Download Throughput"
          value={demoMetrics.downloadSpeed}
          unit="Mbps"
          color="var(--accent-cyan-light)"
          subtitle="Estimated bandwidth capacity"
          trend="up"
          trendValue="+4.2%"
          benchmark="Target: 50+ Mbps"
        />
        <MetricCard
          icon={<Clock size={20} />}
          label="Round-Trip Latency"
          value={demoMetrics.latency}
          unit="ms"
          color="var(--accent-blue)"
          subtitle="One-way propagation delay"
          trend="stable"
          trendValue="±1 ms"
          benchmark="Tier 1: < 30 ms"
        />
        <MetricCard
          icon={<Activity size={20} />}
          label="Packet Jitter"
          value={demoMetrics.jitter}
          unit="ms"
          color="var(--accent-indigo)"
          subtitle="Latency statistical variance"
          trend="down"
          trendValue="-0.8 ms"
          benchmark="Optimal: < 5 ms"
        />
        <MetricCard
          icon={<AlertTriangle size={20} />}
          label="Packet Loss"
          value={demoMetrics.packetLoss}
          unit="%"
          color="var(--accent-red)"
          subtitle="Discarded transport packets"
          trend="stable"
          trendValue="0.0%"
          benchmark="Optimal: < 0.5%"
        />
      </div>

      {/* ── Interactive Historical Telemetry Trend Chart ── */}
      <NetworkChart />

      {/* ── Network Quality & Workload Suitability Panels ── */}
      <div className="overview__panels">
        {/* Network Quality Card with Semi-Circular Gauge */}
        <div className="card overview__quality-card">
          <div className="card__title">
            <span>Overall Network SLA Quality</span>
            <span className="demo-badge">Demo Model</span>
          </div>

          <div className="overview__quality-gauge-wrapper">
            {/* High Precision SVG Semi-Circular Meter */}
            <div className="overview__gauge">
              <svg viewBox="0 0 120 70" className="overview__gauge-svg">
                {/* Background Track */}
                <path
                  d="M 15 65 A 45 45 0 0 1 105 65"
                  fill="none"
                  stroke="var(--meter-track)"
                  strokeWidth="10"
                  strokeLinecap="round"
                />
                {/* Active Colored Arc (Score 92/100) */}
                <path
                  d="M 15 65 A 45 45 0 0 1 98 40"
                  fill="none"
                  stroke="url(#overviewGaugeGrad)"
                  strokeWidth="10"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="overviewGaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="60%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
              </svg>

              <div className="overview__gauge-center">
                <span className="overview__gauge-score">{demoMetrics.confidenceScore}</span>
                <span className="overview__gauge-sub">Quality Score / 100</span>
              </div>
            </div>

            <div className="overview__quality-meta">
              <div className="overview__quality-badge-row">
                <span className={qualityClass}>{demoMetrics.quality} Quality</span>
                <span className="overview__sla-chip">Tier 1 SLA</span>
              </div>
              <p className="overview__quality-explanation">
                Transport telemetry indicates low delay variation and minimal retransmission overhead.
                Connection is rated <strong>{demoMetrics.quality}</strong> for sustained multi-user operations.
              </p>
            </div>
          </div>

          {/* Telemetry Parameter Health Summary Breakdown */}
          <div className="overview__health-grid">
            <div className="overview__health-box">
              <span className="overview__health-key">RTT Latency</span>
              <span className="overview__health-val">{demoMetrics.latency} ms</span>
              <span className="overview__health-status overview__health-status--good">Optimal</span>
            </div>
            <div className="overview__health-box">
              <span className="overview__health-key">Jitter (PDV)</span>
              <span className="overview__health-val">{demoMetrics.jitter} ms</span>
              <span className="overview__health-status overview__health-status--good">Stable</span>
            </div>
            <div className="overview__health-box">
              <span className="overview__health-key">Packet Loss</span>
              <span className="overview__health-val">{demoMetrics.packetLoss}%</span>
              <span className="overview__health-status overview__health-status--good">Minimal</span>
            </div>
            <div className="overview__health-box">
              <span className="overview__health-key">Signal (RSSI)</span>
              <span className="overview__health-val">{demoMetrics.signalStrength} dBm</span>
              <span className="overview__health-status overview__health-status--good">Strong</span>
            </div>
          </div>
        </div>

        {/* Application Suitability & Workload Readiness */}
        <div className="card overview__suitability-card">
          <div className="card__title">
            <span>Workload Suitability Index</span>
            <span className="overview__suitability-legend">Based on Telemetry</span>
          </div>

          <div className="overview__suitability-list">
            <div className="overview__suitability-item">
              <div className="overview__suitability-icon-wrap overview__suitability-icon-wrap--green">
                <Tv size={18} />
              </div>
              <div className="overview__suitability-info">
                <div className="overview__suitability-name-row">
                  <span className="overview__suitability-name">4K UHD Video Streaming</span>
                  <span className="overview__tag overview__tag--good">Ready (98%)</span>
                </div>
                <span className="overview__suitability-desc">
                  Sufficient throughput headroom for multiple concurrent 4K HDR streams (Netflix, YouTube).
                </span>
              </div>
            </div>

            <div className="overview__suitability-item">
              <div className="overview__suitability-icon-wrap overview__suitability-icon-wrap--cyan">
                <Gamepad2 size={18} />
              </div>
              <div className="overview__suitability-info">
                <div className="overview__suitability-name-row">
                  <span className="overview__suitability-name">Competitive Cloud Gaming</span>
                  <span className="overview__tag overview__tag--good">Optimal (92%)</span>
                </div>
                <span className="overview__suitability-desc">
                  Low 24ms RTT latency and 3.2ms jitter ensure fluid input response with zero tick lag.
                </span>
              </div>
            </div>

            <div className="overview__suitability-item">
              <div className="overview__suitability-icon-wrap overview__suitability-icon-wrap--indigo">
                <Video size={18} />
              </div>
              <div className="overview__suitability-info">
                <div className="overview__suitability-name-row">
                  <span className="overview__suitability-name">HD Video Conferencing (Zoom/Teams)</span>
                  <span className="overview__tag overview__tag--good">Ready (95%)</span>
                </div>
                <span className="overview__suitability-desc">
                  Negligible packet loss prevents audio stutter and video frame freezing during two-way calls.
                </span>
              </div>
            </div>

            <div className="overview__suitability-item">
              <div className="overview__suitability-icon-wrap overview__suitability-icon-wrap--blue">
                <HardDriveUpload size={18} />
              </div>
              <div className="overview__suitability-info">
                <div className="overview__suitability-name-row">
                  <span className="overview__suitability-name">Cloud Backup &amp; Bulk Transfers</span>
                  <span className="overview__tag overview__tag--moderate">Good (85%)</span>
                </div>
                <span className="overview__suitability-desc">
                  Moderate upstream bandwidth (21.6 Mbps) allows consistent background cloud syncing.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── ML Dual-Task Architecture Placeholder Banner ── */}
      <div className="card overview__ai-card">
        <div className="overview__ai-header">
          <div className="overview__ai-title-row">
            <div className="overview__ai-icon-wrap">
              <Cpu size={20} />
            </div>
            <div>
              <h3 className="overview__ai-title">Planned Machine Learning Architecture</h3>
              <p className="overview__ai-desc">
                Dual-task regression &amp; classification pipeline trained on transport-layer telemetry
              </p>
            </div>
          </div>
          <span className="demo-badge">
            <Sparkles size={12} />
            ML Integration Interface
          </span>
        </div>

        <div className="overview__ai-grid">
          <div className="overview__ai-step">
            <span className="overview__ai-step-tag">Task 1: Continuous Regression</span>
            <h4>Throughput Regressor</h4>
            <p>
              Predicts download and upload bandwidth curves (Mbps) using Random Forest Regressor &amp; Linear benchmarks.
            </p>
          </div>
          <div className="overview__ai-step">
            <span className="overview__ai-step-tag">Task 2: Discrete Classification</span>
            <h4>Quality Tier Classifier</h4>
            <p>
              Classifies network links into Poor, Average, or Excellent operational SLA categories.
            </p>
          </div>
          <div className="overview__ai-step">
            <span className="overview__ai-step-tag">API Integration Stub</span>
            <h4>FastAPI / Flask Microservice</h4>
            <p>
              Client-side stub implements standard <code>PredictionService</code> interface for instant drop-in replacement.
            </p>
          </div>
        </div>
      </div>

      {/* ── Quick Action Navigation Bar ── */}
      <div className="overview__actions">
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => onNavigate('analyzer')}
        >
          <span>Open Network Analyzer</span>
          <ArrowRight size={16} />
        </button>

        <button
          type="button"
          className="btn btn--secondary"
          onClick={onRunDemo}
        >
          <PlayCircle size={16} />
          <span>Inspect Full Prediction Results</span>
        </button>

        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => onNavigate('history')}
        >
          <HistoryIcon size={16} />
          <span>View Diagnostic History</span>
        </button>
      </div>
    </div>
  );
};

export default Overview;
