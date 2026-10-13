import { useState } from 'react';
import {
  Activity,
  ArrowRight,
  RotateCcw,
  History as HistoryIcon,
  Info,
  Clock,
  Wifi,
  AlertTriangle,
  Download,
  Upload,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  FileDown,
  Sparkles,
  Tv,
  Gamepad2,
  Video,
  HardDriveUpload,
} from 'lucide-react';
import type { PageId, NetworkInput, PredictionResult } from '../../types';
import './Results.css';

interface ResultsProps {
  result: PredictionResult | null;
  input: NetworkInput | null;
  onNavigate: (page: PageId) => void;
}

export default function Results({ result, input, onNavigate }: ResultsProps) {
  const [copied, setCopied] = useState(false);

  // Store evaluated timestamp once upon mount
  const [evaluationTimestamp] = useState<string>(() => {
    return new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  });

  if (!result || !input) {
    return (
      <div className="results fade-in">
        <header>
          <h1 className="page-title">Prediction Diagnostics</h1>
          <p className="page-subtitle">Estimated network throughput &amp; operational quality evaluation</p>
        </header>

        <div className="card empty-state">
          <Activity size={52} />
          <h3>No Active Diagnostics Session</h3>
          <p>
            Provide your network link parameters or choose a realistic preset scenario
            in the Network Analyzer to generate predictive bandwidth curves and factor impact insights.
          </p>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => onNavigate('analyzer')}
          >
            <span>Launch Network Analyzer</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  const qualityClass = `quality-badge quality-badge--${result.quality.toLowerCase()}`;
  const uploadSpeed = result.uploadSpeed ?? Math.round(result.downloadSpeed * 0.38 * 10) / 10;
  const confidence = result.confidenceScore ?? 94;

  // Calculate needle angle on gauge: 0 Mbps = -110deg, 120 Mbps = 110deg
  const speedPercentage = Math.min(1, Math.max(0, result.downloadSpeed / 120));
  const gaugeAngle = -110 + speedPercentage * 220;

  const handleCopySummary = () => {
    const text = [
      `SPEEDEX NETWORK DIAGNOSTICS REPORT`,
      `Quality Tier: ${result.quality}`,
      `Download Speed: ${result.downloadSpeed} Mbps`,
      `Upload Speed (Est): ${uploadSpeed} Mbps`,
      `Latency: ${input.latency} ms | Jitter: ${input.jitter} ms | Packet Loss: ${input.packetLoss}%`,
      `Model Confidence: ${confidence}%`,
      `Summary: ${result.explanation}`,
    ].join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportJSON = () => {
    const payload = {
      project: 'Speedex AI Diagnostics',
      version: '1.2-preview',
      evaluatedAt: new Date().toISOString(),
      input,
      prediction: {
        ...result,
        uploadSpeed,
      },
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `speedex-diagnostic-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="results fade-in">
      {/* ── Page Header ── */}
      <div className="results__header-row">
        <div>
          <h1 className="page-title">Diagnostic &amp; Prediction Results</h1>
          <p className="page-subtitle">
            Dual-task machine-learning evaluation synthesized from transport telemetry
          </p>
        </div>

        <div className="results__header-actions">
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            onClick={handleCopySummary}
            title="Copy diagnostic text summary"
          >
            {copied ? <Check size={14} className="results__icon-green" /> : <Copy size={14} />}
            <span>{copied ? 'Copied' : 'Copy Summary'}</span>
          </button>

          <button
            type="button"
            className="btn btn--secondary btn--sm"
            onClick={handleExportJSON}
            title="Download full JSON diagnostics report"
          >
            <FileDown size={14} />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* ── Illustrative Model Notice ── */}
      <div className="disclaimer">
        <Info size={16} style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <strong>Deterministic Heuristic Baseline:</strong> Evaluation represents simulated dual-task
          model outputs with calculated feature penalties. Real weights will be produced once the
          Python Scikit-Learn / PyTorch model backend completes training.
        </div>
      </div>

      {/* ── Hero Speed & Quality Gauge ── */}
      <div className="card results__hero-card">
        <div className="results__hero-gauge-side">
          <div className="results__speedometer">
            <svg viewBox="0 0 200 125" className="results__speedometer-svg">
              <defs>
                <linearGradient id="meterGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="35%" stopColor="#f59e0b" />
                  <stop offset="70%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
              {/* Background Meter Track */}
              <path
                d="M 25 115 A 75 75 0 0 1 175 115"
                fill="none"
                stroke="var(--meter-track)"
                strokeWidth="16"
                strokeLinecap="round"
              />
              {/* Colored Gradient Track */}
              <path
                d="M 25 115 A 75 75 0 0 1 175 115"
                fill="none"
                stroke="url(#meterGrad)"
                strokeWidth="16"
                strokeDasharray="235"
                strokeDashoffset={235 - speedPercentage * 235}
                strokeLinecap="round"
              />
              {/* Center Needle */}
              <g transform={`rotate(${gaugeAngle}, 100, 115)`}>
                <line x1="100" y1="115" x2="100" y2="45" stroke="#38bdf8" strokeWidth="3.5" strokeLinecap="round" />
                <circle cx="100" cy="115" r="7" fill="#0ea5e9" />
                <circle cx="100" cy="115" r="3" fill="#ffffff" />
              </g>
            </svg>

            <div className="results__gauge-readout">
              <span className="results__gauge-readout-val">{result.downloadSpeed}</span>
              <span className="results__gauge-readout-unit">Mbps Download</span>
            </div>
          </div>
        </div>

        <div className="results__hero-info-side">
          <div className="results__hero-classification-row">
            <span className={qualityClass}>{result.quality} Tier</span>
            <span className="demo-badge">
              <Sparkles size={12} />
              {confidence}% Confidence
            </span>
          </div>

          <h2 className="results__hero-headline">
            {result.quality === 'Excellent' && 'High-Performance Gigabit & Broadband Class'}
            {result.quality === 'Average' && 'Moderate Broadband / Standard Commercial Class'}
            {result.quality === 'Poor' && 'Degraded Link / Transport Congestion Detected'}
          </h2>

          <div className="results__hero-dual-bandwidth">
            <div className="results__bandwidth-pill">
              <Download size={16} className="results__icon-cyan" />
              <div>
                <span className="results__bandwidth-label">Download Speed</span>
                <span className="results__bandwidth-value">{result.downloadSpeed} Mbps</span>
              </div>
            </div>
            <div className="results__bandwidth-pill">
              <Upload size={16} className="results__icon-green" />
              <div>
                <span className="results__bandwidth-label">Projected Upload</span>
                <span className="results__bandwidth-value">{uploadSpeed} Mbps</span>
              </div>
            </div>
          </div>

          <div className="results__timestamp-pill">
            Evaluated at {evaluationTimestamp} (Session Active)
          </div>
        </div>
      </div>

      {/* ── Submitted Telemetry Parameter Summary ── */}
      <div className="card">
        <div className="card__title">
          <span>Submitted Transport Telemetry</span>
          <span className="results__card-sub">Link inputs fed to model</span>
        </div>

        <div className="results__telemetry-grid">
          <div className="results__telemetry-item">
            <div className="results__telemetry-head">
              <Clock size={16} className="results__icon-blue" />
              <span className="results__telemetry-label">RTT Latency</span>
            </div>
            <div className="results__telemetry-val-row">
              <span className="results__telemetry-val">{input.latency}</span>
              <span className="results__telemetry-unit">ms</span>
            </div>
            <span className="results__telemetry-benchmark">Target: &lt; 30 ms</span>
          </div>

          <div className="results__telemetry-item">
            <div className="results__telemetry-head">
              <Activity size={16} className="results__icon-indigo" />
              <span className="results__telemetry-label">Packet Jitter</span>
            </div>
            <div className="results__telemetry-val-row">
              <span className="results__telemetry-val">{input.jitter}</span>
              <span className="results__telemetry-unit">ms</span>
            </div>
            <span className="results__telemetry-benchmark">Target: &lt; 5 ms</span>
          </div>

          <div className="results__telemetry-item">
            <div className="results__telemetry-head">
              <AlertTriangle size={16} className="results__icon-red" />
              <span className="results__telemetry-label">Packet Loss</span>
            </div>
            <div className="results__telemetry-val-row">
              <span className="results__telemetry-val">{input.packetLoss}</span>
              <span className="results__telemetry-unit">%</span>
            </div>
            <span className="results__telemetry-benchmark">Target: &lt; 0.5%</span>
          </div>

          <div className="results__telemetry-item">
            <div className="results__telemetry-head">
              <Wifi size={16} className="results__icon-cyan" />
              <span className="results__telemetry-label">Signal RSSI</span>
            </div>
            <div className="results__telemetry-val-row">
              <span className="results__telemetry-val">{input.signalStrength}</span>
              <span className="results__telemetry-unit">{input.signalUnit}</span>
            </div>
            <span className="results__telemetry-benchmark">Target: &gt; -55 dBm</span>
          </div>
        </div>
      </div>

      {/* ── Feature Importance & Contributing Factors ── */}
      {result.factors && result.factors.length > 0 && (
        <div className="card">
          <div className="card__title">
            <span>Model Factor Impact Decomposition</span>
            <span className="results__card-sub">Influence of each feature on predicted speed</span>
          </div>

          <div className="results__factors-list">
            {result.factors.map((factor, index) => (
              <div key={index} className="results__factor-row">
                <span className={`results__factor-dot results__factor-dot--${factor.impact}`} />
                <div className="results__factor-content">
                  <div className="results__factor-title-row">
                    <span className="results__factor-label">{factor.label}</span>
                    <span className="results__factor-value">{factor.value}</span>
                  </div>
                  {factor.benchmark && (
                    <span className="results__factor-benchmark">Benchmark: {factor.benchmark}</span>
                  )}
                </div>
                <span className={`results__factor-badge results__factor-badge--${factor.impact}`}>
                  {factor.impact === 'positive' && 'Favorable'}
                  {factor.impact === 'neutral' && 'Acceptable'}
                  {factor.impact === 'negative' && 'Constraining'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Application Workload Suitability Index ── */}
      {result.suitability && result.suitability.length > 0 && (
        <div className="card">
          <div className="card__title">
            <span>Practical Application Suitability</span>
            <span className="results__card-sub">Suitability based on speed &amp; latency tolerances</span>
          </div>

          <div className="results__suitability-grid">
            {result.suitability.map((item, idx) => (
              <div key={idx} className="results__suitability-card">
                <div className="results__suitability-top">
                  <div className="results__suitability-icon-wrap">
                    {item.category === 'streaming' && <Tv size={18} />}
                    {item.category === 'gaming' && <Gamepad2 size={18} />}
                    {item.category === 'calls' && <Video size={18} />}
                    {item.category === 'transfers' && <HardDriveUpload size={18} />}
                  </div>
                  <div className="results__suitability-titles">
                    <span className="results__suitability-title">{item.name}</span>
                    <span className="results__suitability-note">{item.note}</span>
                  </div>
                </div>

                <div className="results__suitability-bottom">
                  {item.suitable ? (
                    <span className="results__tag results__tag--good">
                      <CheckCircle2 size={12} /> Suitable ({item.score}%)
                    </span>
                  ) : (
                    <span className="results__tag results__tag--warn">
                      <XCircle size={12} /> May Degrade ({item.score}%)
                    </span>
                  )}
                  <div className="results__suitability-bar">
                    <div
                      className={`results__suitability-bar-fill results__suitability-bar-fill--${item.suitable ? 'good' : 'warn'}`}
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Model Interpretation Explanation ── */}
      <div className="card">
        <div className="card__title">
          <span>Heuristic Evaluation Synthesis</span>
          <span className="demo-badge">Summary</span>
        </div>
        <p className="results__explanation">{result.explanation}</p>
      </div>

      {/* ── Navigation Actions ── */}
      <div className="results__actions">
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => onNavigate('analyzer')}
        >
          <RotateCcw size={16} />
          <span>Analyze Different Parameters</span>
        </button>

        <button
          type="button"
          className="btn btn--secondary"
          onClick={() => onNavigate('history')}
        >
          <HistoryIcon size={16} />
          <span>View Past Analysis History</span>
        </button>
      </div>
    </div>
  );
}
