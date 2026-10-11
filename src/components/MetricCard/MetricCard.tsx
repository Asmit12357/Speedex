import React from 'react';
import './MetricCard.css';

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  unit: string;
  color: string;
  subtitle?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ icon, label, value, unit, color, subtitle }) => {
  return (
    <div className="card metric-card">
      <div
        className="metric-card__icon"
        style={{ background: color.replace(')', ', 0.15)').replace('var(', 'var('), color }}
      >
        <div style={{ color }}>{icon}</div>
      </div>
      <div className="metric-card__content">
        <div className="metric-card__value-row">
          <span className="metric-card__value">{value}</span>
          <span className="metric-card__unit">{unit}</span>
        </div>
        <div className="metric-card__label">{label}</div>
        {subtitle && <div className="metric-card__subtitle">{subtitle}</div>}
      </div>
    </div>
  );
};

export default MetricCard;
