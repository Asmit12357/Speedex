import { gaugeFraction } from '../../utils/format';
import './SpeedGauge.css';

export type GaugeTone = 'download' | 'upload' | 'latency' | 'idle';

interface SpeedGaugeProps {
  /** 0–1 fill of the arc */
  fraction: number;
  value: string;
  unit: string;
  label: string;
  tone: GaugeTone;
  /** Pulses the readout while a phase is live */
  live?: boolean;
}

const CX = 120;
const CY = 120;
const R = 96;
const START_DEG = 135;
const SWEEP_DEG = 270;
const TICKS = [0, 10, 50, 100, 500, 1000];

function polar(deg: number, radius: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: CX + radius * Math.cos(rad), y: CY + radius * Math.sin(rad) };
}

const start = polar(START_DEG, R);
const end = polar(START_DEG + SWEEP_DEG, R);
const ARC = `M ${start.x} ${start.y} A ${R} ${R} 0 1 1 ${end.x} ${end.y}`;

export default function SpeedGauge({ fraction, value, unit, label, tone, live = false }: SpeedGaugeProps) {
  const fill = Math.max(0, Math.min(1, fraction)) * 100;

  return (
    <div className={`speed-gauge speed-gauge--${tone}${live ? ' speed-gauge--live' : ''}`}>
      <svg viewBox="0 0 240 216" className="speed-gauge__svg" aria-hidden="true">
        <path d={ARC} className="speed-gauge__track" pathLength={100} />
        <path
          d={ARC}
          className="speed-gauge__fill"
          pathLength={100}
          strokeDasharray="100"
          strokeDashoffset={100 - fill}
          // A zero-length dash still paints a round cap, so hide the fill when empty
          opacity={fill > 0.5 ? 1 : 0}
        />
        {TICKS.map((t) => {
          const deg = START_DEG + gaugeFraction(t) * SWEEP_DEG;
          const inner = polar(deg, R - 14);
          const outer = polar(deg, R - 8);
          const text = polar(deg, R - 28);
          return (
            <g key={t} className="speed-gauge__tick">
              <line x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} />
              <text x={text.x} y={text.y} textAnchor="middle" dominantBaseline="middle">
                {t >= 1000 ? '1G' : t}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="speed-gauge__readout" aria-live="polite">
        <span className="speed-gauge__label">{label}</span>
        <span className="speed-gauge__value">{value}</span>
        <span className="speed-gauge__unit">{unit}</span>
      </div>
    </div>
  );
}
