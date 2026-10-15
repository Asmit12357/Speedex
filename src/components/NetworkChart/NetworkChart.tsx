import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { demoTimeSeries24h, demoTimeSeries12h } from '../../data/demoData';
import { Download, Upload, Clock, Activity } from 'lucide-react';
import './NetworkChart.css';

type TimeRange = '24h' | '12h';

const NetworkChart: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const [showDownload, setShowDownload] = useState(true);
  const [showUpload, setShowUpload] = useState(true);
  const [showLatency, setShowLatency] = useState(true);

  const data = timeRange === '24h' ? demoTimeSeries24h : demoTimeSeries12h;

  // Compute peak stats for header summary
  const peakDownload = Math.max(...data.map((d) => d.downloadSpeed));
  const minLatency = Math.min(...data.map((d) => d.latency));
  const avgLoss = (data.reduce((acc, d) => acc + d.packetLoss, 0) / data.length).toFixed(1);

  return (
    <div className="card network-chart">
      <div className="network-chart__header">
        <div className="network-chart__title-group">
          <div className="network-chart__title">
            <Activity size={15} className="network-chart__title-icon" />
            <span>Telemetry Performance Trends</span>
          </div>
          <div className="network-chart__subtitle">
            Temporal bandwidth and transport delay metrics over observation window
          </div>
        </div>

        <div className="network-chart__controls">
          {/* Time range pill buttons */}
          <div className="network-chart__range-selector">
            <button
              type="button"
              className={`network-chart__range-btn${timeRange === '24h' ? ' network-chart__range-btn--active' : ''}`}
              onClick={() => setTimeRange('24h')}
            >
              24 Hours
            </button>
            <button
              type="button"
              className={`network-chart__range-btn${timeRange === '12h' ? ' network-chart__range-btn--active' : ''}`}
              onClick={() => setTimeRange('12h')}
            >
              12 Hours
            </button>
          </div>

          <span className="demo-badge">Historical Stream</span>
        </div>
      </div>

      {/* Quick Stats Pill Strip */}
      <div className="network-chart__stats-strip">
        <div className="network-chart__stat-item">
          <Download size={13} className="network-chart__stat-icon network-chart__stat-icon--cyan" />
          <span className="network-chart__stat-label">Peak Download:</span>
          <span className="network-chart__stat-value">{peakDownload} Mbps</span>
        </div>
        <div className="network-chart__stat-item">
          <Clock size={13} className="network-chart__stat-icon network-chart__stat-icon--indigo" />
          <span className="network-chart__stat-label">Min RTT Latency:</span>
          <span className="network-chart__stat-value">{minLatency} ms</span>
        </div>
        <div className="network-chart__stat-item">
          <Upload size={13} className="network-chart__stat-icon network-chart__stat-icon--emerald" />
          <span className="network-chart__stat-label">Avg Loss:</span>
          <span className="network-chart__stat-value">{avgLoss}%</span>
        </div>

        {/* Series toggle pills */}
        <div className="network-chart__toggles">
          <button
            type="button"
            className={`network-chart__toggle-pill${showDownload ? ' network-chart__toggle-pill--active-cyan' : ''}`}
            onClick={() => setShowDownload((p) => !p)}
          >
            Download
          </button>
          <button
            type="button"
            className={`network-chart__toggle-pill${showUpload ? ' network-chart__toggle-pill--active-emerald' : ''}`}
            onClick={() => setShowUpload((p) => !p)}
          >
            Upload
          </button>
          <button
            type="button"
            className={`network-chart__toggle-pill${showLatency ? ' network-chart__toggle-pill--active-indigo' : ''}`}
            onClick={() => setShowLatency((p) => !p)}
          >
            Latency
          </button>
        </div>
      </div>

      <div className="network-chart__body">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 12, right: 18, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#00e5ff" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#c7ff00" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#c7ff00" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="indigoGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#9d65ff" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#9d65ff" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="2 4" stroke="var(--border-color)" vertical={false} />
            <XAxis
              dataKey="time"
              tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
              stroke="var(--border-color)"
              tickLine={false}
            />
            <YAxis
              tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
              stroke="var(--border-color)"
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-light)',
                borderRadius: '10px',
                boxShadow: 'var(--shadow-md)',
                padding: '10px 14px',
                fontFamily: 'var(--font-mono)',
              }}
              labelStyle={{
                color: 'var(--text-primary)',
                fontWeight: 700,
                fontSize: 12,
                marginBottom: 6,
                letterSpacing: '0.04em',
              }}
              itemStyle={{ fontSize: 12, padding: '2px 0' }}
              formatter={(value: any, name: any) => {
                const unit = name === 'RTT Latency' ? ' ms' : ' Mbps';
                return [`${value ?? 0}${unit}`, String(name ?? '')];
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', paddingTop: 10 }}
            />
            {showDownload && (
              <Area
                type="monotone"
                dataKey="downloadSpeed"
                name="Download Speed"
                stroke="#00e5ff"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#cyanGradient)"
                activeDot={{ r: 5, stroke: '#ffffff', strokeWidth: 2 }}
              />
            )}
            {showUpload && (
              <Area
                type="monotone"
                dataKey="uploadSpeed"
                name="Upload Speed"
                stroke="#c7ff00"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#emeraldGradient)"
                activeDot={{ r: 4 }}
              />
            )}
            {showLatency && (
              <Area
                type="monotone"
                dataKey="latency"
                name="RTT Latency"
                stroke="#9d65ff"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#indigoGradient)"
                activeDot={{ r: 4 }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default NetworkChart;
