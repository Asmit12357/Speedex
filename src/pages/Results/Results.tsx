import { useState } from 'react';
import {
  Activity,
  History as HistoryIcon,
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
  Tv,
  Gamepad2,
  Video,
  HardDriveUpload,
  ShieldCheck,
  Sliders,
  Gauge,
  Info,
} from 'lucide-react';
import type { AnalysisEntry, PageId } from '../../types';
import { SOURCE_LABEL, entryMetrics } from '../../utils/entryMetrics';
import { formatDuration, formatMbps, formatMs, gaugeFraction } from '../../utils/format';
import { loadedLatencyIncrease } from '../../services/measuredResult';
import { formatEdge } from '../../services/edgeInfo';
import { SPEED_TEST_PROFILES } from '../../services/speedTestService';
import Sparkline from '../../components/Sparkline/Sparkline';
import './Results.css';

interface ResultsProps {
  entry: AnalysisEntry | null;
  onNavigate: (page: PageId) => void;
}

const HEADLINE = {
  Excellent: 'Fast and responsive: ready for anything',
  Average: 'Solid for everyday use',
  Poor: 'Slow or unstable connection',
} as const;

const SUITABILITY_ICON = { streaming: Tv, gaming: Gamepad2, calls: Video, transfers: HardDriveUpload } as const;

export default function Results({ entry, onNavigate }: ResultsProps) {
  const [copied, setCopied] = useState(false);

  if (!entry) {
    return (
      <div className="results fade-in">
        <header>
          <span className="eyebrow">Results</span>
          <h1 className="page-title">No result open</h1>
          <p className="page-subtitle">Run a speed test, make an estimate, or open a saved result from History.</p>
        </header>

        <div className="card empty-state">
          <Activity size={44} />
          <h3>Nothing to show yet</h3>
          <p>A speed test measures your real connection in about 10 seconds. The estimator gives a rough figure from values you type in.</p>
          <div className="results__empty-actions">
            <button type="button" className="btn btn--primary" onClick={() => onNavigate('speedtest')}>
              <Gauge size={14} />
              <span>Run speed test</span>
            </button>
            <button type="button" className="btn btn--secondary" onClick={() => onNavigate('history')}>
              <HistoryIcon size={14} />
              <span>Open history</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { result, measurement: m, input } = entry;
  const metrics = entryMetrics(entry);
  const measured = result.source === 'cloudflare';
  const uploadSpeed = result.uploadSpeed;
  const bloat = m ? loadedLatencyIncrease(m) : undefined;

  const fraction = gaugeFraction(result.downloadSpeed);
  const needleAngle = -90 + fraction * 180;
  const evaluatedAt = new Date(entry.timestamp).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const sourceLine = measured
    ? `Measured ${evaluatedAt}${m?.edge ? ` via Cloudflare ${formatEdge(m.edge)}` : ''}${m ? ` · ${SPEED_TEST_PROFILES[m.profile].label} test, ${formatDuration(m.durationMs)}` : ''}`
    : result.source === 'model'
      ? `Predicted ${evaluatedAt} by the model API`
      : `Estimated ${evaluatedAt} with the built-in formula (model in development)`;

  const handleCopySummary = () => {
    const lines = [
      `Speedex ${measured ? 'speed test' : 'estimate'} (${SOURCE_LABEL[result.source]})`,
      `Quality: ${result.quality}`,
      `Download: ${result.downloadSpeed} Mbps`,
      uploadSpeed !== undefined ? `Upload: ${uploadSpeed} Mbps` : null,
      `Latency: ${metrics.latencyMs} ms · Jitter: ${metrics.jitterMs} ms`,
      metrics.packetLossPct !== undefined ? `Packet loss: ${metrics.packetLossPct}%` : null,
      m?.edge ? `Server: ${formatEdge(m.edge)}` : null,
      sourceLine,
      result.explanation,
    ].filter(Boolean);

    navigator.clipboard
      .writeText(lines.join('\n'))
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => { /* clipboard blocked; nothing to undo */ });
  };

  const handleExportJSON = () => {
    const payload = {
      app: 'Speedex',
      exportedAt: new Date().toISOString(),
      recordedAt: entry.timestamp,
      source: result.source,
      ...(input ? { input } : {}),
      ...(m ? { measurement: m } : {}),
      result,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `speedex-${result.source}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="results fade-in">
      {/* ── Page Header ── */}
      <div className="results__header-row">
        <div>
          <span className="eyebrow">{measured ? 'Speed test result' : result.source === 'model' ? 'Model prediction' : 'Estimate'}</span>
          <h1 className="page-title">{measured ? 'Your connection' : 'Estimated connection'}</h1>
          <p className="page-subtitle">{sourceLine}</p>
        </div>

        <div className="results__header-actions">
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            onClick={handleCopySummary}
            title="Copy a text summary"
          >
            {copied ? <Check size={13} className="results__icon-green" /> : <Copy size={13} />}
            <span>{copied ? 'Copied' : 'Copy summary'}</span>
          </button>

          <button
            type="button"
            className="btn btn--secondary btn--sm"
            onClick={handleExportJSON}
            title="Download this result as JSON"
          >
            <FileDown size={13} />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {result.notice && (
        <div className="alert-banner alert-banner--info" role="status">
          <Info size={15} />
          <span>{result.notice}</span>
        </div>
      )}

      {/* ── Hero ── */}
      <div className="card results__hero-card">
        <div className="results__hero-gauge-side">
          <div className="results__speedometer">
            <svg viewBox="0 0 200 125" className="results__speedometer-svg" aria-hidden="true">
              <defs>
                <linearGradient id="meterGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="var(--accent-red)" />
                  <stop offset="35%" stopColor="var(--accent-amber)" />
                  <stop offset="70%" stopColor="var(--accent-cyan)" />
                  <stop offset="100%" stopColor="var(--gauge-end)" />
                </linearGradient>
              </defs>
              <path
                d="M 25 115 A 75 75 0 0 1 175 115"
                fill="none"
                stroke="var(--meter-track)"
                strokeWidth="14"
                strokeLinecap="round"
              />
              <path
                d="M 25 115 A 75 75 0 0 1 175 115"
                fill="none"
                stroke="url(#meterGrad)"
                strokeWidth="14"
                pathLength={100}
                strokeDasharray="100"
                strokeDashoffset={100 - fraction * 100}
                strokeLinecap="round"
                className="results__meter-fill"
              />
              {/* Marker across the arc; a full needle would cross the readout */}
              <g transform={`rotate(${needleAngle}, 100, 115)`} className="results__needle">
                <line x1="100" y1="29" x2="100" y2="51" stroke="var(--text-primary)" strokeWidth="3" strokeLinecap="round" />
              </g>
            </svg>

            <div className="results__gauge-readout">
              <span className="results__gauge-readout-val">{formatMbps(result.downloadSpeed)}</span>
              <span className="results__gauge-readout-unit">Mbps {measured ? 'download' : 'estimated'}</span>
            </div>
          </div>
        </div>

        <div className="results__hero-info-side">
          <div className="results__hero-classification-row">
            <span className={`quality-badge quality-badge--${result.quality.toLowerCase()}`}>{result.quality}</span>
            <span className={`source-badge source-badge--${result.source}`}>{SOURCE_LABEL[result.source]}</span>
            {result.confidenceScore !== undefined && (
              <span className="demo-badge">
                <ShieldCheck size={11} />
                {result.confidenceScore}% confidence
              </span>
            )}
          </div>

          <h2 className="results__hero-headline">{HEADLINE[result.quality]}</h2>

          <div className="results__hero-dual-bandwidth">
            <div className="results__bandwidth-pill">
              <Download size={15} className="results__icon-cyan" />
              <div>
                <span className="results__bandwidth-label">{measured ? 'Download' : 'Estimated download'}</span>
                <span className="results__bandwidth-value">{formatMbps(result.downloadSpeed)} Mbps</span>
              </div>
            </div>
            {uploadSpeed !== undefined && (
              <div className="results__bandwidth-pill">
                <Upload size={15} className="results__icon-green" />
                <div>
                  <span className="results__bandwidth-label">{measured ? 'Upload' : 'Assumed upload'}</span>
                  <span className="results__bandwidth-value">{formatMbps(uploadSpeed)} Mbps</span>
                </div>
              </div>
            )}
          </div>

          {!measured && (
            <div className="results__timestamp-pill">
              Estimates are rough. Run a speed test for real numbers.
            </div>
          )}
        </div>
      </div>

      {/* ── Measured / entered values ── */}
      <div className="card">
        <div className="card__title">
          <span>{measured ? 'Measured values' : 'Values entered'}</span>
          <span className="results__card-sub">{measured ? 'From the live test' : 'Inputs to the estimate'}</span>
        </div>

        <div className="results__telemetry-grid">
          <div className="results__telemetry-item">
            <div className="results__telemetry-head">
              <Clock size={14} className="results__icon-blue" />
              <span className="results__telemetry-label">Latency</span>
            </div>
            <div className="results__telemetry-val-row">
              <span className="results__telemetry-val">{formatMs(metrics.latencyMs)}</span>
              <span className="results__telemetry-unit">ms</span>
            </div>
            <span className="results__telemetry-benchmark">Target: &lt; 30 ms</span>
          </div>

          <div className="results__telemetry-item">
            <div className="results__telemetry-head">
              <Activity size={14} className="results__icon-indigo" />
              <span className="results__telemetry-label">Jitter</span>
            </div>
            <div className="results__telemetry-val-row">
              <span className="results__telemetry-val">{formatMs(metrics.jitterMs)}</span>
              <span className="results__telemetry-unit">ms</span>
            </div>
            <span className="results__telemetry-benchmark">Target: &lt; 5 ms</span>
          </div>

          {measured ? (
            <div className="results__telemetry-item">
              <div className="results__telemetry-head">
                <Gauge size={14} className="results__icon-cyan" />
                <span className="results__telemetry-label">Latency under load</span>
              </div>
              <div className="results__telemetry-val-row">
                <span className="results__telemetry-val">{bloat === undefined ? '—' : `+${formatMs(bloat)}`}</span>
                <span className="results__telemetry-unit">ms</span>
              </div>
              <span className="results__telemetry-benchmark">Bufferbloat target: &lt; 30 ms</span>
            </div>
          ) : (
            <div className="results__telemetry-item">
              <div className="results__telemetry-head">
                <Wifi size={14} className="results__icon-cyan" />
                <span className="results__telemetry-label">Signal</span>
              </div>
              <div className="results__telemetry-val-row">
                <span className="results__telemetry-val">{input?.signalStrength ?? '—'}</span>
                <span className="results__telemetry-unit">{input?.signalUnit}</span>
              </div>
              <span className="results__telemetry-benchmark">Target: &gt; -55 dBm</span>
            </div>
          )}

          <div className="results__telemetry-item">
            <div className="results__telemetry-head">
              <AlertTriangle size={14} className="results__icon-red" />
              <span className="results__telemetry-label">Packet loss</span>
            </div>
            <div className="results__telemetry-val-row">
              {metrics.packetLossPct === undefined ? (
                <span className="results__telemetry-na">Not measured</span>
              ) : (
                <>
                  <span className="results__telemetry-val">{metrics.packetLossPct}</span>
                  <span className="results__telemetry-unit">%</span>
                </>
              )}
            </div>
            <span className="results__telemetry-benchmark">
              {metrics.packetLossPct === undefined ? 'Needs a TURN server (see README)' : 'Target: < 0.5%'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Throughput samples (measured only) ── */}
      {m && (
        <div className="card">
          <div className="card__title">
            <span>Throughput per request</span>
            <span className="results__card-sub">
              {m.downloadSamples.length} download · {m.uploadSamples.length} upload samples
            </span>
          </div>
          <Sparkline
            unit="Mbps"
            height={96}
            series={[
              { label: 'Download', values: m.downloadSamples, color: 'var(--accent-cyan)' },
              { label: 'Upload', values: m.uploadSamples, color: 'var(--color-electric)' },
            ]}
          />
        </div>
      )}

      {/* ── Factors ── */}
      {result.factors.length > 0 && (
        <div className="card">
          <div className="card__title">
            <span>What's helping and hurting</span>
            <span className="results__card-sub">Each value against its target</span>
          </div>

          <div className="results__factors-list">
            {result.factors.map((factor) => (
              <div key={factor.label} className="results__factor-row">
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
                <span className={`tag-pill results__factor-badge results__factor-badge--${factor.impact}`}>
                  {factor.impact === 'positive' && 'Good'}
                  {factor.impact === 'neutral' && 'OK'}
                  {factor.impact === 'negative' && 'Holding back'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Suitability ── */}
      {result.suitability && result.suitability.length > 0 && (
        <div className="card">
          <div className="card__title">
            <span>What it's good for</span>
            <span className="results__card-sub">{measured ? 'Cloudflare AIM ratings' : 'Estimated from the inputs'}</span>
          </div>

          <div className="results__suitability-grid">
            {result.suitability.map((item) => {
              const Icon = SUITABILITY_ICON[item.category as keyof typeof SUITABILITY_ICON] ?? Activity;
              return (
                <div key={item.category} className="results__suitability-card">
                  <div className="results__suitability-top">
                    <div className="results__suitability-icon-wrap">
                      <Icon size={15} />
                    </div>
                    <div className="results__suitability-titles">
                      <span className="results__suitability-title">{item.name}</span>
                      <span className="results__suitability-note">{item.note}</span>
                    </div>
                  </div>

                  <div className="results__suitability-bottom">
                    {item.suitable ? (
                      <span className="tag-pill tag-pill--pass">
                        <CheckCircle2 size={11} /> Good ({item.score})
                      </span>
                    ) : (
                      <span className="tag-pill results__tag--warn">
                        <XCircle size={11} /> Struggles ({item.score})
                      </span>
                    )}
                    <div className="results__suitability-bar" role="img" aria-label={`Score ${item.score} out of 100`}>
                      <div
                        className={`results__suitability-bar-fill results__suitability-bar-fill--${item.suitable ? 'good' : 'warn'}`}
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Summary ── */}
      <div className="card">
        <div className="card__title">
          <span>Summary</span>
        </div>
        <p className="results__explanation">{result.explanation}</p>
      </div>

      {/* ── Navigation ── */}
      <div className="results__actions">
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => onNavigate(measured ? 'speedtest' : 'analyzer')}
        >
          {measured ? <Gauge size={14} /> : <Sliders size={14} />}
          <span>{measured ? 'Run another test' : 'Try different values'}</span>
        </button>

        <button type="button" className="btn btn--secondary" onClick={() => onNavigate('history')}>
          <HistoryIcon size={14} />
          <span>View history</span>
        </button>
      </div>
    </div>
  );
}
