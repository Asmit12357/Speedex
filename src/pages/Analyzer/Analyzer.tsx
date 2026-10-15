import { useState, useCallback, useEffect } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import {
  Clock,
  Activity,
  AlertTriangle,
  Wifi,
  RotateCcw,
  Zap,
  ShieldCheck,
  BookmarkCheck,
} from 'lucide-react';
import type { NetworkInput, SignalUnit } from '../../types';
import { DEMO_VALUES, PRESET_SCENARIOS } from '../../data/scenarios';
import { probeLatency } from '../../services/speedTestService';
import { isModelConfigured } from '../../services/predictionService';
import './Analyzer.css';

interface AnalyzerProps {
  onAnalyse: (input: NetworkInput, scenarioName?: string) => void;
  isAnalysing: boolean;
  /** Preset picked elsewhere (e.g. Overview) to load on arrival */
  initialScenarioId?: string | null;
  onScenarioApplied?: () => void;
}

interface FormValues {
  latency: string;
  jitter: string;
  packetLoss: string;
  signalStrength: string;
  signalUnit: SignalUnit;
}

type FormErrors = Partial<Record<keyof Omit<FormValues, 'signalUnit'>, string>>;

const INITIAL_VALUES: FormValues = {
  latency: '',
  jitter: '',
  packetLoss: '',
  signalStrength: '',
  signalUnit: 'dBm',
};

function valuesFromInput(input: NetworkInput): FormValues {
  return {
    latency: String(input.latency),
    jitter: String(input.jitter),
    packetLoss: String(input.packetLoss),
    signalStrength: String(input.signalStrength),
    signalUnit: input.signalUnit,
  };
}

function initialFor(scenarioId: string | null | undefined): FormValues {
  const scenario = PRESET_SCENARIOS.find((s) => s.id === scenarioId);
  return scenario ? valuesFromInput(scenario.values) : INITIAL_VALUES;
}

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  const latency = Number(values.latency);
  if (values.latency === '') {
    errors.latency = 'Latency is required.';
  } else if (Number.isNaN(latency) || latency < 0 || latency > 2000) {
    errors.latency = 'Must be between 0 and 2000 ms.';
  }

  const jitter = Number(values.jitter);
  if (values.jitter === '') {
    errors.jitter = 'Jitter is required.';
  } else if (Number.isNaN(jitter) || jitter < 0 || jitter > 500) {
    errors.jitter = 'Must be between 0 and 500 ms.';
  }

  const packetLoss = Number(values.packetLoss);
  if (values.packetLoss === '') {
    errors.packetLoss = 'Packet loss is required.';
  } else if (Number.isNaN(packetLoss) || packetLoss < 0 || packetLoss > 100) {
    errors.packetLoss = 'Must be between 0 and 100%.';
  }

  const signal = Number(values.signalStrength);
  if (values.signalStrength === '') {
    errors.signalStrength = 'Signal strength is required.';
  } else if (values.signalUnit === 'dBm') {
    if (Number.isNaN(signal) || signal < -100 || signal > 0) {
      errors.signalStrength = 'Must be between -100 and 0 dBm.';
    }
  } else {
    if (Number.isNaN(signal) || signal < 0 || signal > 100) {
      errors.signalStrength = 'Must be between 0 and 100%.';
    }
  }

  return errors;
}

export default function Analyzer({ onAnalyse, isAnalysing, initialScenarioId, onScenarioApplied }: AnalyzerProps) {
  const [values, setValues] = useState<FormValues>(() => initialFor(initialScenarioId));
  const [errors, setErrors] = useState<FormErrors>({});
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(
    () => PRESET_SCENARIOS.find((s) => s.id === initialScenarioId)?.id ?? null,
  );
  const [isDetecting, setIsDetecting] = useState<boolean>(false);
  const [probeNote, setProbeNote] = useState<{ ok: boolean; text: string } | null>(null);

  // The preset has been loaded into the form; clear it so a later visit starts clean
  useEffect(() => {
    if (initialScenarioId) onScenarioApplied?.();
  }, [initialScenarioId, onScenarioApplied]);

  const updateField = useCallback(
    (field: keyof FormValues) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setSelectedScenarioId(null);
      setValues((prev) => ({ ...prev, [field]: e.target.value }));
      setErrors((prev) => {
        if (!prev[field as keyof FormErrors]) return prev;
        const next = { ...prev };
        delete next[field as keyof FormErrors];
        return next;
      });
    },
    []
  );

  const handleUnitChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    const unit = e.target.value as SignalUnit;
    setValues((prev) => ({ ...prev, signalUnit: unit, signalStrength: '' }));
    setErrors((prev) => {
      if (!prev.signalStrength) return prev;
      const next = { ...prev };
      delete next.signalStrength;
      return next;
    });
  }, []);

  const handleApplyScenario = useCallback((scenarioId: string) => {
    const target = PRESET_SCENARIOS.find((s) => s.id === scenarioId);
    if (!target) return;
    setSelectedScenarioId(scenarioId);
    setValues(valuesFromInput(target.values));
    setErrors({});
    setProbeNote(null);
  }, []);

  const handleDemoValues = useCallback(() => {
    setSelectedScenarioId(null);
    setValues(valuesFromInput(DEMO_VALUES));
    setErrors({});
    setProbeNote(null);
  }, []);

  const handleReset = useCallback(() => {
    setSelectedScenarioId(null);
    setValues(INITIAL_VALUES);
    setErrors({});
    setProbeNote(null);
  }, []);

  // Real latency + jitter from ~20 tiny Cloudflare requests. Loss and signal stay as entered.
  const handleAutoDetect = useCallback(async () => {
    setIsDetecting(true);
    setProbeNote(null);
    try {
      const { latencyMs, jitterMs, edge } = await probeLatency();
      setValues((prev) => ({ ...prev, latency: String(latencyMs), jitter: String(jitterMs) }));
      setSelectedScenarioId(null);
      setErrors((prev) => {
        const next = { ...prev };
        delete next.latency;
        delete next.jitter;
        return next;
      });
      setProbeNote({
        ok: true,
        text: `Measured against Cloudflare${edge ? ` ${edge.colo}` : ''}. Browsers can't read packet loss or signal strength, so enter those yourself.`,
      });
    } catch {
      setProbeNote({ ok: false, text: 'Could not reach Cloudflare to measure latency. Enter the values manually.' });
    } finally {
      setIsDetecting(false);
    }
  }, []);

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const validationErrors = validate(values);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }
      onAnalyse(
        {
          latency: Number(values.latency),
          jitter: Number(values.jitter),
          packetLoss: Number(values.packetLoss),
          signalStrength: Number(values.signalStrength),
          signalUnit: values.signalUnit,
        },
        PRESET_SCENARIOS.find((s) => s.id === selectedScenarioId)?.name,
      );
    },
    [values, onAnalyse, selectedScenarioId]
  );

  const getLatencyTier = (val: string) => {
    if (!val) return null;
    const n = Number(val);
    if (n < 30) return { text: '< 30ms Optimal', class: 'good' };
    if (n < 80) return { text: '30-80ms Acceptable', class: 'fair' };
    return { text: '> 80ms High Delay', class: 'poor' };
  };

  const getJitterTier = (val: string) => {
    if (!val) return null;
    const n = Number(val);
    if (n < 5) return { text: '< 5ms Low PDV', class: 'good' };
    if (n < 15) return { text: '5-15ms Moderate', class: 'fair' };
    return { text: '> 15ms Unstable', class: 'poor' };
  };

  const getLossTier = (val: string) => {
    if (!val) return null;
    const n = Number(val);
    if (n < 0.5) return { text: '< 0.5% Carrier Grade', class: 'good' };
    if (n < 2.5) return { text: '0.5-2.5% Noticeable', class: 'fair' };
    return { text: '> 2.5% Severe Drops', class: 'poor' };
  };

  const latencyTier = getLatencyTier(values.latency);
  const jitterTier = getJitterTier(values.jitter);
  const lossTier = getLossTier(values.packetLoss);

  return (
    <div className="analyzer fade-in">
      {/* ── Console Header ── */}
      <div className="analyzer__header">
        <div>
          <span className="eyebrow">{isModelConfigured ? 'Model prediction' : 'Estimate · model in development'}</span>
          <h1 className="page-title">Speed estimator</h1>
          <p className="page-subtitle">
            Estimate download speed and quality from latency, jitter, packet loss and signal strength, without running a
            full test.{' '}
            {isModelConfigured
              ? 'Predictions come from your model API.'
              : 'Until the model ships this uses a built-in formula, so treat results as rough. For real numbers, run a speed test.'}
          </p>
        </div>
      </div>

      <div className="analyzer__layout">
        {/* ── Main Form Area ── */}
        <div className="analyzer__main">
          {/* Preset Scenario Selector Strip */}
          <div className="card analyzer__scenarios-card">
            <div className="analyzer__scenarios-header">
              <div className="analyzer__scenarios-title">
                <BookmarkCheck size={14} className="analyzer__scenario-icon" />
                <span>Preset profiles</span>
              </div>
              <span className="analyzer__scenarios-hint">Typical values for common connection types</span>
            </div>

            <div className="analyzer__scenarios-list">
              {PRESET_SCENARIOS.map((sc) => (
                <button
                  key={sc.id}
                  type="button"
                  className={`tag-pill analyzer__scenario-chip${selectedScenarioId === sc.id ? ' analyzer__scenario-chip--active' : ''}`}
                  onClick={() => handleApplyScenario(sc.id)}
                  title={sc.description}
                >
                  <span className="analyzer__scenario-name">{sc.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Form Card */}
          <form className="card analyzer__form-card" onSubmit={handleSubmit} noValidate>
            {isAnalysing && (
              <div className="analyzer__loading-overlay">
                <div className="analyzer__loading-content">
                  <span className="spinner" />
                  <h3>{isModelConfigured ? 'Asking the model…' : 'Estimating…'}</h3>
                  <p>Working out download speed and quality tier from these values.</p>
                </div>
              </div>
            )}

            <div className="analyzer__form-header">
              <div>
                <span className="eyebrow">Inputs</span>
                <h2 className="analyzer__section-title">Connection signals</h2>
              </div>
              <button
                type="button"
                className="btn btn--secondary btn--sm"
                onClick={handleAutoDetect}
                disabled={isDetecting || isAnalysing}
              >
                {isDetecting ? (
                  <>
                    <span className="spinner" />
                    <span>Measuring latency…</span>
                  </>
                ) : (
                  <>
                    <Zap size={13} />
                    <span>Measure latency</span>
                  </>
                )}
              </button>
            </div>

            {probeNote && (
              <div className={`alert-banner ${probeNote.ok ? 'alert-banner--info' : 'alert-banner--error'} analyzer__probe-note`} role="status">
                <span>{probeNote.text}</span>
              </div>
            )}

            <div className="analyzer__input-grid">
              {/* Latency Input */}
              <div className="input-group">
                <label htmlFor="latency">
                  <span>Round-Trip Latency (ms)</span>
                  {latencyTier && (
                    <span className={`analyzer__tier-tag analyzer__tier-tag--${latencyTier.class}`}>
                      {latencyTier.text}
                    </span>
                  )}
                </label>
                <div className="analyzer__input-wrap">
                  <Clock size={15} className="analyzer__input-icon" />
                  <input
                    id="latency"
                    className={`input-field analyzer__input-field${errors.latency ? ' input-field--error' : ''}`}
                    type="number"
                    min={0}
                    max={2000}
                    step={1}
                    placeholder="e.g. 24"
                    value={values.latency}
                    onChange={updateField('latency')}
                    disabled={isAnalysing}
                  />
                  <span className="analyzer__input-unit">ms</span>
                </div>
                {errors.latency ? (
                  <span className="input-error">{errors.latency}</span>
                ) : (
                  <span className="input-hint">
                    ICMP round-trip propagation delay. SLA target: &lt; 30 ms.
                  </span>
                )}
              </div>

              {/* Jitter Input */}
              <div className="input-group">
                <label htmlFor="jitter">
                  <span>Packet Jitter (ms)</span>
                  {jitterTier && (
                    <span className={`analyzer__tier-tag analyzer__tier-tag--${jitterTier.class}`}>
                      {jitterTier.text}
                    </span>
                  )}
                </label>
                <div className="analyzer__input-wrap">
                  <Activity size={15} className="analyzer__input-icon" />
                  <input
                    id="jitter"
                    className={`input-field analyzer__input-field${errors.jitter ? ' input-field--error' : ''}`}
                    type="number"
                    min={0}
                    max={500}
                    step={0.1}
                    placeholder="e.g. 3.2"
                    value={values.jitter}
                    onChange={updateField('jitter')}
                    disabled={isAnalysing}
                  />
                  <span className="analyzer__input-unit">ms</span>
                </div>
                {errors.jitter ? (
                  <span className="input-error">{errors.jitter}</span>
                ) : (
                  <span className="input-hint">
                    Packet Delay Variation (PDV). Crucial for real-time WebRTC &amp; gaming.
                  </span>
                )}
              </div>

              {/* Packet Loss Input */}
              <div className="input-group">
                <label htmlFor="packetLoss">
                  <span>Packet Loss Rate (%)</span>
                  {lossTier && (
                    <span className={`analyzer__tier-tag analyzer__tier-tag--${lossTier.class}`}>
                      {lossTier.text}
                    </span>
                  )}
                </label>
                <div className="analyzer__input-wrap">
                  <AlertTriangle size={15} className="analyzer__input-icon" />
                  <input
                    id="packetLoss"
                    className={`input-field analyzer__input-field${errors.packetLoss ? ' input-field--error' : ''}`}
                    type="number"
                    min={0}
                    max={100}
                    step={0.1}
                    placeholder="e.g. 0.2"
                    value={values.packetLoss}
                    onChange={updateField('packetLoss')}
                    disabled={isAnalysing}
                  />
                  <span className="analyzer__input-unit">%</span>
                </div>
                {errors.packetLoss ? (
                  <span className="input-error">{errors.packetLoss}</span>
                ) : (
                  <span className="input-hint">
                    Transport packet drop ratio. Even 1% loss degrades TCP flow control.
                  </span>
                )}
              </div>

              {/* Signal Strength Input */}
              <div className="input-group">
                <label htmlFor="signalStrength">
                  <span>Radio Signal (RSSI)</span>
                  <span className="analyzer__unit-label">{values.signalUnit}</span>
                </label>
                <div className="analyzer__signal-row">
                  <div className="analyzer__input-wrap analyzer__input-wrap--flex">
                    <Wifi size={15} className="analyzer__input-icon" />
                    <input
                      id="signalStrength"
                      className={`input-field analyzer__input-field${errors.signalStrength ? ' input-field--error' : ''}`}
                      type="number"
                      min={values.signalUnit === 'dBm' ? -100 : 0}
                      max={values.signalUnit === 'dBm' ? 0 : 100}
                      step={1}
                      placeholder={values.signalUnit === 'dBm' ? 'e.g. -45' : 'e.g. 80'}
                      value={values.signalStrength}
                      onChange={updateField('signalStrength')}
                      disabled={isAnalysing}
                    />
                  </div>
                  <select
                    className="analyzer__signal-unit"
                    value={values.signalUnit}
                    onChange={handleUnitChange}
                    disabled={isAnalysing}
                    aria-label="Signal unit"
                  >
                    <option value="dBm">dBm</option>
                    <option value="%">%</option>
                  </select>
                </div>
                {errors.signalStrength ? (
                  <span className="input-error">{errors.signalStrength}</span>
                ) : (
                  <span className="input-hint">
                    {values.signalUnit === 'dBm'
                      ? 'Find it in your router or phone Wi-Fi details. -30 (strong) to -85 dBm (weak).'
                      : 'Wireless signal percentage.'}
                  </span>
                )}
              </div>
            </div>

            <hr className="analyzer__divider" />

            {/* Action Buttons */}
            <div className="analyzer__actions">
              <button
                type="button"
                className="btn btn--secondary btn--sm"
                onClick={handleDemoValues}
                disabled={isAnalysing}
              >
                <span>Load example values</span>
              </button>

              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={handleReset}
                disabled={isAnalysing}
              >
                <RotateCcw size={13} />
                <span>Reset</span>
              </button>

              <button
                type="submit"
                className="btn btn--primary analyzer__submit-btn"
                disabled={isAnalysing}
              >
                {isAnalysing ? (
                  <>
                    <span className="spinner" />
                    <span>{isModelConfigured ? 'Predicting…' : 'Estimating…'}</span>
                  </>
                ) : (
                  <>
                    <Zap size={14} />
                    <span>{isModelConfigured ? 'Predict speed' : 'Estimate speed'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* ── Side Educational & Benchmark Panel ── */}
        <aside className="analyzer__sidebar">
          <div className="card analyzer__info-panel">
            <div className="analyzer__side-header">
              <span className="eyebrow">Reference</span>
              <h3 className="card__title">
                <span>What good looks like</span>
              </h3>
            </div>

            <div className="analyzer__metric-explainer">
              <div className="analyzer__explainer-item">
                <div className="analyzer__explainer-top">
                  <Clock size={14} className="analyzer__explainer-icon analyzer__explainer-icon--blue" />
                  <span className="analyzer__explainer-title">Round-Trip Latency (RTT)</span>
                </div>
                <p className="analyzer__explainer-text">
                  Time elapsed for an ICMP/UDP packet to reach target gateway and return.
                </p>
                <div className="analyzer__explainer-benchmark">
                  <span>ITU-T Y.1541:</span>
                  <strong>&lt; 30ms Optimal | 30–80ms Fair | &gt; 80ms High</strong>
                </div>
              </div>

              <div className="analyzer__explainer-item">
                <div className="analyzer__explainer-top">
                  <Activity size={14} className="analyzer__explainer-icon analyzer__explainer-icon--indigo" />
                  <span className="analyzer__explainer-title">Packet Jitter (PDV)</span>
                </div>
                <p className="analyzer__explainer-text">
                  Statistical packet delay variation. High jitter introduces buffer underrun.
                </p>
                <div className="analyzer__explainer-benchmark">
                  <span>RFC 3550:</span>
                  <strong>&lt; 5ms VoIP Ready | 5–15ms Fair | &gt; 15ms Jittery</strong>
                </div>
              </div>

              <div className="analyzer__explainer-item">
                <div className="analyzer__explainer-top">
                  <AlertTriangle size={14} className="analyzer__explainer-icon analyzer__explainer-icon--red" />
                  <span className="analyzer__explainer-title">Packet Loss Rate</span>
                </div>
                <p className="analyzer__explainer-text">
                  Ratio of dropped packets across observation probe window.
                </p>
                <div className="analyzer__explainer-benchmark">
                  <span>Carrier SLA:</span>
                  <strong>0.0% Carrier | &lt; 0.5% Normal | &gt; 2% Degraded</strong>
                </div>
              </div>

              <div className="analyzer__explainer-item">
                <div className="analyzer__explainer-top">
                  <Wifi size={14} className="analyzer__explainer-icon analyzer__explainer-icon--cyan" />
                  <span className="analyzer__explainer-title">Link Budget (RSSI)</span>
                </div>
                <p className="analyzer__explainer-text">
                  Decibels relative to 1 mW received signal power at radio antenna interface.
                </p>
                <div className="analyzer__explainer-benchmark">
                  <span>Radio Budget:</span>
                  <strong>-30 to -55 dBm Strong | &lt; -75 dBm Fringe</strong>
                </div>
              </div>
            </div>

            <div className="analyzer__side-notice">
              <ShieldCheck size={14} className="analyzer__icon-green" />
              <span>
                {isModelConfigured
                  ? 'Predictions come from the model API configured for this deployment.'
                  : 'The prediction model is still in development. Estimates here use a built-in formula.'}
              </span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
