import React from 'react';
import {
  Zap,
  Clock,
  Activity,
  AlertTriangle,
  ArrowRight,
  PlayCircle,
  History,
  Info,
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
  const qualityClass = `quality-badge quality-badge--${demoMetrics.quality.toLowerCase()}`;

  return (
    <div className="overview">
      {/* Page header */}
      <header>
        <h1 className="page-title">Dashboard Overview</h1>
        <p className="page-subtitle">
          Real-time network performance snapshot (demo data)
        </p>
      </header>

      {/* Disclaimer banner */}
      <div className="disclaimer">
        <Info size={16} style={{ flexShrink: 0, marginTop: 1 }} />
        <span>
          Dashboard displays illustrative demo data. Values shown are not
          measured from your actual network connection.
        </span>
      </div>

      {/* Metric cards */}
      <div className="overview__metrics">
        <MetricCard
          icon={<Zap size={22} />}
          label="Download Speed"
          value={demoMetrics.downloadSpeed}
          unit="Mbps"
          color="var(--accent-cyan)"
          subtitle="Demo data"
        />
        <MetricCard
          icon={<Clock size={22} />}
          label="Latency"
          value={demoMetrics.latency}
          unit="ms"
          color="var(--accent-blue)"
          subtitle="Demo data"
        />
        <MetricCard
          icon={<Activity size={22} />}
          label="Jitter"
          value={demoMetrics.jitter}
          unit="ms"
          color="var(--accent-indigo)"
          subtitle="Demo data"
        />
        <MetricCard
          icon={<AlertTriangle size={22} />}
          label="Packet Loss"
          value={demoMetrics.packetLoss}
          unit="%"
          color="var(--accent-red)"
          subtitle="Demo data"
        />
      </div>

      {/* Network chart */}
      <NetworkChart />

      {/* Quality & Health panels */}
      <div className="overview__panels">
        {/* Network Quality */}
        <div className="card overview__quality">
          <div className="card__title">Network Quality</div>
          <div className="overview__quality-header">
            <span className={qualityClass}>{demoMetrics.quality}</span>
            <span className="demo-badge">Demo</span>
          </div>
          <p className="overview__quality-text">
            Based on the current demo metrics, the network quality is classified
            as <strong>{demoMetrics.quality}</strong>. Moderate latency and
            stable jitter suggest a usable connection, though speeds may be
            impacted during peak hours.
          </p>
        </div>

        {/* Network Health Summary */}
        <div className="card overview__health">
          <div className="card__title">Network Health Summary</div>
          <div className="overview__health-row">
            <span className="overview__health-label">Latency</span>
            <span className="overview__health-value">{demoMetrics.latency} ms</span>
          </div>
          <div className="overview__health-row">
            <span className="overview__health-label">Jitter</span>
            <span className="overview__health-value">{demoMetrics.jitter} ms</span>
          </div>
          <div className="overview__health-row">
            <span className="overview__health-label">Packet Loss</span>
            <span className="overview__health-value">{demoMetrics.packetLoss}%</span>
          </div>
          <div className="overview__health-row">
            <span className="overview__health-label">Signal Strength</span>
            <span className="overview__health-value">{demoMetrics.signalStrength} dBm</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="overview__actions">
        <button className="btn btn--primary" onClick={() => onNavigate('analyzer')}>
          Open Analyzer
          <ArrowRight size={16} />
        </button>
        <button className="btn btn--secondary" onClick={onRunDemo}>
          <PlayCircle size={16} />
          Run Demo Analysis
        </button>
        <button className="btn btn--ghost" onClick={() => onNavigate('history')}>
          <History size={16} />
          View History
        </button>
      </div>
    </div>
  );
};

export default Overview;
