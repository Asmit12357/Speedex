import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import './MetricCard.css';

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  unit: string;
  color: string;
  subtitle?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  /** Color the trend by whether the change is good, independent of its direction */
  trendTone?: 'good' | 'bad' | 'neutral';
  benchmark?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  icon,
  label,
  value,
  unit,
  color,
  subtitle,
  trend,
  trendValue,
  trendTone,
  benchmark,
}) => {
  const toneClass = trendTone ? { good: 'up', bad: 'down', neutral: 'stable' }[trendTone] : trend;

  return (
    <div
      className="card metric-card"
      style={{ '--metric-theme-color': color } as React.CSSProperties}
    >
      <div className="metric-card__header">
        <div className="metric-card__icon-wrapper">
          <div className="metric-card__icon">{icon}</div>
        </div>
        {benchmark && (
          <span className="metric-card__benchmark">
            <span className="metric-card__benchmark-dot" />
            {benchmark}
          </span>
        )}
      </div>

      <div className="metric-card__content">
        <div className="metric-card__label-row">
          <span className="metric-card__label">{label}</span>
          {trend && (
            <div className={`metric-card__trend metric-card__trend--${toneClass}`}>
              {trend === 'up' && <TrendingUp size={11} />}
              {trend === 'down' && <TrendingDown size={11} />}
              {trend === 'stable' && <Minus size={11} />}
              {trendValue && <span>{trendValue}</span>}
            </div>
          )}
        </div>

        <div className="metric-card__value-row">
          <span className="metric-card__value">{value}</span>
          <span className="metric-card__unit">{unit}</span>
        </div>

        {subtitle && <div className="metric-card__subtitle">{subtitle}</div>}
      </div>
    </div>
  );
};

export default MetricCard;
