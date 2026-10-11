import { useState, useCallback } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import {
  Clock,
  Activity,
  AlertTriangle,
  Wifi,
  PlayCircle,
  RotateCcw,
  Search,
  Info,
} from 'lucide-react';
import type { NetworkInput, SignalUnit } from '../../types';
import { DEMO_VALUES } from '../../services/mockPredictionService';
import './Analyzer.css';

interface AnalyzerProps {
  onAnalyse: (input: NetworkInput) => void;
  isAnalysing: boolean;
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

export default function Analyzer({ onAnalyse, isAnalysing }: AnalyzerProps) {
  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<FormErrors>({});

  const updateField = useCallback(
    (field: keyof FormValues) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setValues(prev => ({ ...prev, [field]: e.target.value }));
      setErrors(prev => {
        if (!prev[field as keyof FormErrors]) return prev;
        const next = { ...prev };
        delete next[field as keyof FormErrors];
        return next;
      });
    },
    [],
  );

  const handleUnitChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    const unit = e.target.value as SignalUnit;
    setValues(prev => ({ ...prev, signalUnit: unit, signalStrength: '' }));
    setErrors(prev => {
      if (!prev.signalStrength) return prev;
      const next = { ...prev };
      delete next.signalStrength;
      return next;
    });
  }, []);

  const handleDemoValues = useCallback(() => {
    setValues({
      latency: String(DEMO_VALUES.latency),
      jitter: String(DEMO_VALUES.jitter),
      packetLoss: String(DEMO_VALUES.packetLoss),
      signalStrength: String(DEMO_VALUES.signalStrength),
      signalUnit: DEMO_VALUES.signalUnit,
    });
    setErrors({});
  }, []);

  const handleReset = useCallback(() => {
    setValues(INITIAL_VALUES);
    setErrors({});
  }, []);

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const validationErrors = validate(values);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }
      onAnalyse({
        latency: Number(values.latency),
        jitter: Number(values.jitter),
        packetLoss: Number(values.packetLoss),
        signalStrength: Number(values.signalStrength),
        signalUnit: values.signalUnit,
      });
    },
    [values, onAnalyse],
  );

  const signalHint =
    values.signalUnit === 'dBm'
      ? 'Typical WiFi: -30 (excellent) to -80 (poor)'
      : 'Signal quality percentage.';

  const signalMin = values.signalUnit === 'dBm' ? -100 : 0;
  const signalMax = values.signalUnit === 'dBm' ? 0 : 100;

  return (
    <div className="analyzer">
      {/* ── Form card ── */}
      <form className="card analyzer__form-card" onSubmit={handleSubmit} noValidate>
        {isAnalysing && (
          <div className="analyzer__loading-overlay">
            <div className="analyzer__loading-content">
              <span className="spinner" />
              Analysing network parameters…
            </div>
          </div>
        )}

        <h2 className="analyzer__section-title">
          <Search size={18} />
          Network Parameters
        </h2>

        <div className="analyzer__input-grid">
          {/* Latency */}
          <div className="input-group">
            <label htmlFor="latency">Latency (ms)</label>
            <input
              id="latency"
              className={`input-field${errors.latency ? ' input-field--error' : ''}`}
              type="number"
              min={0}
              max={2000}
              step={1}
              placeholder="e.g. 24"
              value={values.latency}
              onChange={updateField('latency')}
              disabled={isAnalysing}
            />
            {errors.latency ? (
              <span className="input-error">{errors.latency}</span>
            ) : (
              <span className="input-hint">
                Round-trip time for data packets. Lower is better. Typical: 5–50 ms
              </span>
            )}
          </div>

          {/* Jitter */}
          <div className="input-group">
            <label htmlFor="jitter">Jitter (ms)</label>
            <input
              id="jitter"
              className={`input-field${errors.jitter ? ' input-field--error' : ''}`}
              type="number"
              min={0}
              max={500}
              step={0.1}
              placeholder="e.g. 3"
              value={values.jitter}
              onChange={updateField('jitter')}
              disabled={isAnalysing}
            />
            {errors.jitter ? (
              <span className="input-error">{errors.jitter}</span>
            ) : (
              <span className="input-hint">
                Variation in latency over time. Lower means more stable.
              </span>
            )}
          </div>

          {/* Packet Loss */}
          <div className="input-group">
            <label htmlFor="packetLoss">Packet Loss (%)</label>
            <input
              id="packetLoss"
              className={`input-field${errors.packetLoss ? ' input-field--error' : ''}`}
              type="number"
              min={0}
              max={100}
              step={0.1}
              placeholder="e.g. 0.2"
              value={values.packetLoss}
              onChange={updateField('packetLoss')}
              disabled={isAnalysing}
            />
            {errors.packetLoss ? (
              <span className="input-error">{errors.packetLoss}</span>
            ) : (
              <span className="input-hint">
                Percentage of packets that fail to reach destination.
              </span>
            )}
          </div>

          {/* Signal Strength */}
          <div className="input-group">
            <label htmlFor="signalStrength">Signal Strength</label>
            <div className="analyzer__signal-row">
              <input
                id="signalStrength"
                className={`input-field analyzer__signal-input${
                  errors.signalStrength ? ' input-field--error' : ''
                }`}
                type="number"
                min={signalMin}
                max={signalMax}
                step={1}
                placeholder={values.signalUnit === 'dBm' ? 'e.g. -45' : 'e.g. 75'}
                value={values.signalStrength}
                onChange={updateField('signalStrength')}
                disabled={isAnalysing}
              />
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
              <span className="input-hint">{signalHint}</span>
            )}
          </div>
        </div>

        <hr className="analyzer__divider" />

        <div className="analyzer__actions">
          <button
            type="button"
            className="btn btn--secondary"
            onClick={handleDemoValues}
            disabled={isAnalysing}
          >
            <PlayCircle size={16} />
            Use Demo Values
          </button>

          <button
            type="button"
            className="btn btn--ghost"
            onClick={handleReset}
            disabled={isAnalysing}
          >
            <RotateCcw size={16} />
            Reset
          </button>

          <button type="submit" className="btn btn--primary" disabled={isAnalysing}>
            {isAnalysing ? (
              <>
                <span className="spinner" />
                Analysing…
              </>
            ) : (
              <>
                <Search size={16} />
                Analyze Network
              </>
            )}
          </button>
        </div>
      </form>

      {/* ── Info panel ── */}
      <aside className="card analyzer__info-panel">
        <h3 className="card__title">
          <Info size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 6 }} />
          Understanding Network Metrics
        </h3>

        <div className="analyzer__info-block">
          <div className="analyzer__info-icon">
            <Clock size={18} />
          </div>
          <div className="analyzer__info-text">
            <h4>Latency</h4>
            <p>
              Measures the round-trip time for data to travel between your device and the server.
              High latency causes noticeable delays in real-time applications.
            </p>
          </div>
        </div>

        <div className="analyzer__info-block">
          <div className="analyzer__info-icon">
            <Activity size={18} />
          </div>
          <div className="analyzer__info-text">
            <h4>Jitter</h4>
            <p>
              Represents the variation in latency over time. Low jitter (under 5 ms) means a
              stable, predictable connection ideal for streaming and calls.
            </p>
          </div>
        </div>

        <div className="analyzer__info-block">
          <div className="analyzer__info-icon">
            <AlertTriangle size={18} />
          </div>
          <div className="analyzer__info-text">
            <h4>Packet Loss</h4>
            <p>
              Indicates the percentage of data packets that never arrive. Even 1–2% loss can
              degrade video quality and cause audio dropouts.
            </p>
          </div>
        </div>

        <div className="analyzer__info-block">
          <div className="analyzer__info-icon">
            <Wifi size={18} />
          </div>
          <div className="analyzer__info-text">
            <h4>Signal Strength</h4>
            <p>
              Reflects how strong the wireless signal is at your device. Stronger signals allow
              higher data rates and more reliable connections.
            </p>
          </div>
        </div>

        <div className="disclaimer analyzer__info-disclaimer">
          <Info size={14} style={{ flexShrink: 0, marginTop: 2 }} />
          <span>
            Enter values manually or use demo values. This tool does not measure your actual
            network connection.
          </span>
        </div>
      </aside>
    </div>
  );
}
