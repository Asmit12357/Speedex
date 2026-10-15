import './Sparkline.css';

export interface SparkSeries {
  label: string;
  values: number[];
  /** CSS color, e.g. var(--accent-cyan) */
  color: string;
}

interface SparklineProps {
  series: SparkSeries[];
  unit: string;
  height?: number;
  emptyText?: string;
}

const W = 600;

function toPoints(values: number[], max: number, height: number): string {
  const y = (v: number) => height - (v / max) * (height - 4) - 2;
  if (values.length === 1) return `0,${y(values[0])} ${W},${y(values[0])}`;
  return values.map((v, i) => `${(i / (values.length - 1)) * W},${y(v)}`).join(' ');
}

/** Per-request throughput as simple lines. No axes: the readouts carry the numbers. */
export default function Sparkline({ series, unit, height = 72, emptyText = 'Samples appear as the test runs' }: SparklineProps) {
  const drawn = series.filter((s) => s.values.length > 0);
  const max = Math.max(1, ...drawn.flatMap((s) => s.values));
  const summary = drawn
    .map((s) => `${s.label}: ${s.values.length} samples, peak ${Math.max(...s.values)} ${unit}`)
    .join('; ');

  return (
    <div className="sparkline">
      {drawn.length === 0 ? (
        <div className="sparkline__empty" style={{ height }}>{emptyText}</div>
      ) : (
        <svg
          className="sparkline__svg"
          viewBox={`0 0 ${W} ${height}`}
          preserveAspectRatio="none"
          style={{ height }}
          role="img"
          aria-label={summary}
        >
          <line x1="0" y1={height - 1} x2={W} y2={height - 1} className="sparkline__baseline" />
          {drawn.map((s) => (
            <polyline
              key={s.label}
              points={toPoints(s.values, max, height)}
              fill="none"
              stroke={s.color}
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>
      )}
      <div className="sparkline__legend">
        {series.map((s) => (
          <span key={s.label} className="sparkline__legend-item">
            <span className="sparkline__swatch" style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
        <span className="sparkline__legend-scale">peak {Math.round(max)} {unit}</span>
      </div>
    </div>
  );
}
