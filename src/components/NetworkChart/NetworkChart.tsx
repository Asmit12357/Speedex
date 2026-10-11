import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { demoTimeSeries } from '../../data/demoData';
import './NetworkChart.css';

const NetworkChart: React.FC = () => {
  return (
    <div className="card network-chart">
      <div className="network-chart__header">
        <div>
          <div className="network-chart__title">Network Performance Trends</div>
          <div className="network-chart__subtitle">
            24-hour illustrative data (demo)
          </div>
        </div>
        <span className="demo-badge">Demo data</span>
      </div>

      <div className="network-chart__body">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={demoTimeSeries} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
            <XAxis
              dataKey="time"
              tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
              stroke="var(--border-color)"
            />
            <YAxis
              tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
              stroke="var(--border-color)"
            />
            <Tooltip
              contentStyle={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-md)',
              }}
              labelStyle={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: 12 }}
              itemStyle={{ fontSize: 13 }}
              formatter={(value: any, name: any) => {
                const unit = name === 'Download Speed' ? ' Mbps' : ' ms';
                return [`${value ?? 0}${unit}`, String(name ?? '')];
              }}
            />
            <Legend
              verticalAlign="bottom"
              iconType="circle"
              wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)' }}
            />
            <Line
              type="monotone"
              dataKey="downloadSpeed"
              name="Download Speed"
              stroke="var(--accent-cyan)"
              strokeWidth={2}
              dot={{ r: 3, fill: 'var(--accent-cyan)' }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="latency"
              name="Latency"
              stroke="var(--accent-indigo)"
              strokeWidth={2}
              dot={{ r: 3, fill: 'var(--accent-indigo)' }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default NetworkChart;
