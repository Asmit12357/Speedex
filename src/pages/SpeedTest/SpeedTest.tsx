import { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Clock,
  Download,
  Gamepad2,
  Play,
  RotateCcw,
  Server,
  Square,
  Tv,
  Upload,
  Video,
} from 'lucide-react';
import type { EdgeLocation, ExperienceScore, SpeedTestPhase, SpeedTestProfile } from '../../types';
import type { SpeedTestState } from '../../hooks/useSpeedTest';
import { SPEED_TEST_PROFILES } from '../../services/speedTestService';
import { loadedLatencyIncrease, resultFromMeasurement } from '../../services/measuredResult';
import { formatEdge } from '../../services/edgeInfo';
import { config } from '../../config';
import { formatDuration, formatMbps, formatMs, gaugeFraction } from '../../utils/format';
import SpeedGauge, { type GaugeTone } from '../../components/SpeedGauge/SpeedGauge';
import Sparkline from '../../components/Sparkline/Sparkline';
import './SpeedTest.css';

interface SpeedTestProps {
  state: SpeedTestState;
  edge?: EdgeLocation;
  onStart: (profile: SpeedTestProfile) => void;
  onCancel: () => void;
  onOpenReport: () => void;
}

const PROFILE_KEY = 'speedex-test-profile';

function loadProfile(): SpeedTestProfile {
  try {
    return localStorage.getItem(PROFILE_KEY) === 'full' ? 'full' : 'quick';
  } catch {
    return 'quick';
  }
}

const PHASES: { id: SpeedTestPhase; label: string; icon: typeof Clock }[] = [
  { id: 'latency', label: 'Latency', icon: Clock },
  ...(config.turnCredsUrl ? [{ id: 'packetLoss' as const, label: 'Packet loss', icon: AlertTriangle }] : []),
  { id: 'download', label: 'Download', icon: Download },
  { id: 'upload', label: 'Upload', icon: Upload },
];

const GRADE_TEXT: Record<ExperienceScore['grade'], string> = {
  bad: 'Bad',
  poor: 'Poor',
  average: 'Average',
  good: 'Good',
  great: 'Great',
};

export default function SpeedTest({ state, edge, onStart, onCancel, onOpenReport }: SpeedTestProps) {
  const [profile, setProfile] = useState<SpeedTestProfile>(loadProfile);
  const running = state.status === 'running';
  const progress = state.status === 'running' ? state.progress : null;
  const measurement = state.status === 'done' ? state.measurement : null;

  const chooseProfile = (p: SpeedTestProfile) => {
    setProfile(p);
    try {
      localStorage.setItem(PROFILE_KEY, p);
    } catch { /* not persisted; fine */ }
  };

  // ── Gauge readout ──
  let gauge: { tone: GaugeTone; label: string; value: string; unit: string; fraction: number } = {
    tone: 'idle',
    label: 'Ready',
    value: '—',
    unit: 'Mbps',
    fraction: 0,
  };
  if (running && !progress) {
    gauge = { ...gauge, label: 'Connecting' };
  } else if (progress) {
    if (progress.phase === 'download' || progress.phase === 'upload') {
      const mbps = progress.phase === 'download' ? progress.downloadMbps : progress.uploadMbps;
      gauge = {
        tone: progress.phase,
        label: progress.phase === 'download' ? 'Download' : 'Upload',
        value: formatMbps(mbps),
        unit: 'Mbps',
        fraction: gaugeFraction(mbps ?? 0),
      };
    } else {
      gauge = {
        tone: 'latency',
        label: progress.phase === 'packetLoss' ? 'Packet loss' : 'Latency',
        value: progress.phase === 'packetLoss' ? '…' : formatMs(progress.latencyMs),
        unit: progress.phase === 'packetLoss' ? 'testing' : 'ms',
        fraction: 0,
      };
    }
  } else if (measurement) {
    gauge = {
      tone: 'download',
      label: 'Download',
      value: formatMbps(measurement.downloadMbps),
      unit: 'Mbps',
      fraction: gaugeFraction(measurement.downloadMbps),
    };
  } else if (state.status === 'error') {
    gauge = { ...gauge, label: 'Stopped' };
  }

  const phaseValue = (id: SpeedTestPhase): string | undefined => {
    const src = progress ?? (measurement && {
      latencyMs: measurement.latencyMs,
      downloadMbps: measurement.downloadMbps,
      uploadMbps: measurement.uploadMbps,
    });
    if (!src) return undefined;
    if (id === 'latency' && src.latencyMs !== undefined) return `${formatMs(src.latencyMs)} ms`;
    if (id === 'download' && src.downloadMbps !== undefined) return `${formatMbps(src.downloadMbps)} Mbps`;
    if (id === 'upload' && src.uploadMbps !== undefined) return `${formatMbps(src.uploadMbps)} Mbps`;
    if (id === 'packetLoss' && measurement?.packetLossPct !== undefined) return `${measurement.packetLossPct}%`;
    return undefined;
  };

  const downloadSamples = progress?.downloadSamples ?? measurement?.downloadSamples ?? [];
  const uploadSamples = progress?.uploadSamples ?? measurement?.uploadSamples ?? [];
  const progressPct = measurement ? 100 : Math.round((progress?.fraction ?? 0) * 100);
  const shownEdge = measurement?.edge ?? edge;
  const result = measurement ? resultFromMeasurement(measurement) : null;
  const bloat = measurement ? loadedLatencyIncrease(measurement) : undefined;

  return (
    <div className="speedtest fade-in">
      <header className="speedtest__header">
        <div>
          <span className="eyebrow">Live measurement</span>
          <h1 className="page-title">Speed test</h1>
          <p className="page-subtitle">
            Measures your connection against the nearest Cloudflare data center: latency first,
            then download and upload.
          </p>
        </div>
        {shownEdge && (
          <div className="speedtest__server" title="Cloudflare data center serving this test">
            <Server size={13} />
            <span>{formatEdge(shownEdge)}</span>
          </div>
        )}
      </header>

      {state.status === 'error' && (
        <div className="alert-banner alert-banner--error" role="alert">
          <AlertTriangle size={15} />
          <span>{state.message}</span>
        </div>
      )}

      <section className="card speedtest__console" aria-label="Speed test">
        <div className="speedtest__gauge-side">
          <SpeedGauge {...gauge} live={running} />
          <div
            className="speedtest__progress"
            role="progressbar"
            aria-label="Test progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progressPct}
          >
            <div className="speedtest__progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
        </div>

        <div className="speedtest__control-side">
          <ol className="speedtest__phases">
            {PHASES.map(({ id, label, icon: Icon }) => {
              const value = phaseValue(id);
              const active = progress?.phase === id;
              const status = active ? 'active' : value || (measurement && id === 'packetLoss') ? 'done' : 'waiting';
              return (
                <li key={id} className={`speedtest__phase speedtest__phase--${status}`}>
                  <span className="speedtest__phase-icon">
                    <Icon size={14} />
                  </span>
                  <span className="speedtest__phase-label">{label}</span>
                  <span className="speedtest__phase-value">
                    {active && !value ? 'Measuring…' : value ?? (status === 'waiting' ? 'Waiting' : '—')}
                  </span>
                </li>
              );
            })}
          </ol>

          <div className="speedtest__profiles" role="radiogroup" aria-label="Test size">
            {(Object.keys(SPEED_TEST_PROFILES) as SpeedTestProfile[]).map((p) => (
              <button
                key={p}
                type="button"
                role="radio"
                aria-checked={profile === p}
                className={`speedtest__profile${profile === p ? ' speedtest__profile--active' : ''}`}
                onClick={() => chooseProfile(p)}
                disabled={running}
              >
                <span className="speedtest__profile-name">{SPEED_TEST_PROFILES[p].label}</span>
                <span className="speedtest__profile-note">{SPEED_TEST_PROFILES[p].dataNote}</span>
              </button>
            ))}
          </div>

          {running ? (
            <button type="button" className="btn btn--secondary btn--lg speedtest__cta" onClick={onCancel}>
              <Square size={14} />
              <span>Stop test</span>
            </button>
          ) : (
            <button type="button" className="btn btn--primary btn--lg speedtest__cta" onClick={() => onStart(profile)}>
              {measurement || state.status === 'error' ? <RotateCcw size={15} /> : <Play size={15} />}
              <span>{measurement || state.status === 'error' ? 'Run again' : 'Start speed test'}</span>
            </button>
          )}
        </div>
      </section>

      <section className="card speedtest__samples">
        <div className="speedtest__section-head">
          <span className="eyebrow">Throughput per request</span>
          {measurement && <span className="speedtest__meta">{formatDuration(measurement.durationMs)} · {SPEED_TEST_PROFILES[measurement.profile].label} test</span>}
        </div>
        <Sparkline
          unit="Mbps"
          series={[
            { label: 'Download', values: downloadSamples, color: 'var(--accent-cyan)' },
            { label: 'Upload', values: uploadSamples, color: 'var(--color-electric)' },
          ]}
        />
      </section>

      {measurement && result && (
        <section className="card speedtest__summary fade-in" aria-label="Result summary">
          <div className="speedtest__section-head">
            <div className="speedtest__summary-title">
              <span className={`quality-badge quality-badge--${result.quality.toLowerCase()}`}>{result.quality}</span>
              <span className="source-badge source-badge--cloudflare">Measured</span>
            </div>
            <button type="button" className="btn btn--secondary btn--sm" onClick={onOpenReport}>
              <span>Open full report</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <dl className="speedtest__stats">
            <div className="speedtest__stat">
              <dt><Download size={13} /> Download</dt>
              <dd>{formatMbps(measurement.downloadMbps)} <small>Mbps</small></dd>
            </div>
            <div className="speedtest__stat">
              <dt><Upload size={13} /> Upload</dt>
              <dd>{formatMbps(measurement.uploadMbps)} <small>Mbps</small></dd>
            </div>
            <div className="speedtest__stat">
              <dt><Clock size={13} /> Latency</dt>
              <dd>{formatMs(measurement.latencyMs)} <small>ms</small></dd>
            </div>
            <div className="speedtest__stat">
              <dt><Activity size={13} /> Jitter</dt>
              <dd>{formatMs(measurement.jitterMs)} <small>ms</small></dd>
            </div>
            <div className="speedtest__stat">
              <dt><Activity size={13} /> Under load</dt>
              <dd>{bloat === undefined ? '—' : <>+{formatMs(bloat)} <small>ms</small></>}</dd>
            </div>
            <div className="speedtest__stat">
              <dt><AlertTriangle size={13} /> Packet loss</dt>
              <dd>{measurement.packetLossPct === undefined ? <small>Not measured</small> : <>{measurement.packetLossPct} <small>%</small></>}</dd>
            </div>
          </dl>

          <div className="speedtest__grades">
            {([
              ['streaming', 'Streaming', Tv],
              ['gaming', 'Gaming', Gamepad2],
              ['rtc', 'Video calls', Video],
            ] as const).map(([key, label, Icon]) => {
              const score = measurement.scores[key];
              if (!score) return null;
              return (
                <span key={key} className={`speedtest__grade speedtest__grade--${score.grade}`}>
                  <Icon size={13} />
                  <span>{label}</span>
                  <strong>{GRADE_TEXT[score.grade]}</strong>
                </span>
              );
            })}
          </div>
        </section>
      )}

      <p className="speedtest__footnote">
        Powered by Cloudflare's open-source speed test. Results stay in this browser and aren't sent to Cloudflare.
        {!config.turnCredsUrl && ' Packet loss needs a TURN relay, so it isn\'t measured here (see README).'}
      </p>
    </div>
  );
}
