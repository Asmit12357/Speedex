import { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Download, Clock, Activity, Layers, Zap } from 'lucide-react';
import type { AnalysisEntry } from '../../types';
import { demoTimeSeries24h } from '../../data/demoData';
import './NetworkChart.css';

type Range = 10 | 25 | 'all';

interface ChartPoint {
  time: string;
  downloadSpeed: number;
  uploadSpeed: number;
  latency: number;
}

interface NetworkChartProps {
  history: AnalysisEntry[];
  onRunTest: () => void;
}

const RANGES: { id: Range; label: string }[] = [
  { id: 10, label: 'Last 10' },
  { id: 25, label: 'Last 25' },
  { id: 'all', label: 'All' },
];

const COLORS = {
  download: 'var(--accent-cyan)',
  upload: 'var(--color-electric)',
  latency: 'var(--accent-purple)',
};

const SAMPLE: ChartPoint[] = demoTimeSeries24h.map(({ time, downloadSpeed, uploadSpeed, latency }) => ({
  time,
  downloadSpeed,
  uploadSpeed,
  latency,
}));

function pointLabel(iso: string): string {
  const d = new Date(iso);
  const sameDay = d.toDateString() === new Date().toDateString();
  return sameDay
    ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

const NetworkChart = ({ history, onRunTest }: NetworkChartProps) => {
  const [range, setRange] = useState<Range>(10);
  const [showDownload, setShowDownload] = useState(true);
  const [showUpload, setShowUpload] = useState(true);
  const [showLatency, setShowLatency] = useState(true);

  // Oldest → newest, measured tests only
  const measured = useMemo<ChartPoint[]>(
    () =>
      history
        .filter((e) => e.measurement)
        .reverse()
        .map((e) => ({
          time: pointLabel(e.timestamp),
          downloadSpeed: e.measurement!.downloadMbps,
          uploadSpeed: e.measurement!.uploadMbps,
          latency: e.measurement!.latencyMs,
        })),
    [history],
  );

  const isSample = measured.length < 2;
  const data = isSample ? SAMPLE : range === 'all' ? measured : measured.slice(-range);

  const peakDownload = Math.max(...data.map((d) => d.downloadSpeed));
  const bestLatency = Math.min(...data.map((d) => d.latency));

  return (
    <div className="card network-chart">
      <div className="network-chart__header">
        <div className="network-chart__title-group">
          <div className="network-chart__title">
            <Activity size={15} className="network-chart__title-icon" />
            <span>Speed over time</span>
          </div>
          <div className="network-chart__subtitle">
            {isSample
              ? 'Illustrative data. Your own trend appears after two speed tests.'
              : `Your last ${data.length} measured tests, oldest to newest`}
          </div>
        </div>

        <div className="network-chart__controls">
          {isSample ? (
            <>
              <span className="demo-badge">Sample data</span>
              <button type="button" className="btn btn--secondary btn--sm" onClick={onRunTest}>
                <Zap size={13} />
                <span>Run a test</span>
              </button>
            </>
          ) : (
            <div className="network-chart__range-selector" role="group" aria-label="How many tests">
              {RANGES.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  aria-pressed={range === r.id}
                  className={`network-chart__range-btn${range === r.id ? ' network-chart__range-btn--active' : ''}`}
                  onClick={() => setRange(r.id)}
                >
                  {r.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="network-chart__stats-strip">
        <div className="network-chart__stat-item">
          <Download size={13} className="network-chart__stat-icon network-chart__stat-icon--cyan" />
          <span className="network-chart__stat-label">Peak download:</span>
          <span className="network-chart__stat-value">{peakDownload} Mbps</span>
        </div>
        <div className="network-chart__stat-item">
          <Clock size={13} className="network-chart__stat-icon network-chart__stat-icon--indigo" />
          <span className="network-chart__stat-label">Best latency:</span>
          <span className="network-chart__stat-value">{bestLatency} ms</span>
        </div>
        <div className="network-chart__stat-item">
          <Layers size={13} className="network-chart__stat-icon network-chart__stat-icon--emerald" />
          <span className="network-chart__stat-label">Tests:</span>
          <span className="network-chart__stat-value">{isSample ? '—' : measured.length}</span>
        </div>

        <div className="network-chart__toggles" role="group" aria-label="Series">
          <button
            type="button"
            aria-pressed={showDownload}
            className={`network-chart__toggle-pill${showDownload ? ' network-chart__toggle-pill--active-cyan' : ''}`}
            onClick={() => setShowDownload((p) => !p)}
          >
            Download
          </button>
          <button
            type="button"
            aria-pressed={showUpload}
            className={`network-chart__toggle-pill${showUpload ? ' network-chart__toggle-pill--active-emerald' : ''}`}
            onClick={() => setShowUpload((p) => !p)}
          >
            Upload
          </button>
          <button
            type="button"
            aria-pressed={showLatency}
            className={`network-chart__toggle-pill${showLatency ? ' network-chart__toggle-pill--active-indigo' : ''}`}
            onClick={() => setShowLatency((p) => !p)}
          >
            Latency
          </button>
        </div>
      </div>

      <div className={`network-chart__body${isSample ? ' network-chart__body--sample' : ''}`}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 12, right: 4, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="nc-download" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLORS.download} stopOpacity={0.18} />
                <stop offset="100%" stopColor={COLORS.download} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="nc-upload" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLORS.upload} stopOpacity={0.12} />
                <stop offset="100%" stopColor={COLORS.upload} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="2 4" stroke="var(--border-color)" vertical={false} />
            <XAxis
              dataKey="time"
              tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
              stroke="var(--border-color)"
              tickLine={false}
              minTickGap={16}
            />
            <YAxis
              yAxisId="mbps"
              tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
              stroke="var(--border-color)"
              tickLine={false}
              unit=" Mb"
              width={64}
            />
            <YAxis
              yAxisId="ms"
              orientation="right"
              hide={!showLatency}
              tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
              stroke="var(--border-color)"
              tickLine={false}
              unit=" ms"
              width={56}
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
              formatter={(value, name) => [`${value ?? 0}${name === 'Latency' ? ' ms' : ' Mbps'}`, String(name ?? '')]}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', paddingTop: 10 }}
            />
            {showDownload && (
              <Area
                yAxisId="mbps"
                type="monotone"
                dataKey="downloadSpeed"
                name="Download"
                stroke={COLORS.download}
                strokeWidth={2}
                fill="url(#nc-download)"
                activeDot={{ r: 4 }}
              />
            )}
            {showUpload && (
              <Area
                yAxisId="mbps"
                type="monotone"
                dataKey="uploadSpeed"
                name="Upload"
                stroke={COLORS.upload}
                strokeWidth={2}
                fill="url(#nc-upload)"
                activeDot={{ r: 4 }}
              />
            )}
            {showLatency && (
              <Line
                yAxisId="ms"
                type="monotone"
                dataKey="latency"
                name="Latency"
                stroke={COLORS.latency}
                strokeWidth={1.5}
                strokeDasharray="4 3"
                dot={false}
                activeDot={{ r: 3 }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default NetworkChart;
