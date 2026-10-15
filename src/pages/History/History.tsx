import { useState, useMemo } from 'react';
import {
  History as HistoryIcon,
  Trash2,
  ArrowRight,
  Search,
  FileDown,
  Activity,
  Zap,
  Clock,
  Layers,
} from 'lucide-react';
import type { PageId, AnalysisEntry, QualityCategory } from '../../types';
import './History.css';

interface HistoryProps {
  history: AnalysisEntry[];
  onLoadEntry: (entry: AnalysisEntry) => void;
  onClearHistory: () => void;
  onNavigate: (page: PageId) => void;
}

type FilterTier = 'ALL' | QualityCategory;
type SortOption = 'newest' | 'oldest' | 'speed_high' | 'latency_low';

export default function History({
  history,
  onLoadEntry,
  onClearHistory,
  onNavigate,
}: HistoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTier, setFilterTier] = useState<FilterTier>('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  // Summary statistics across history
  const stats = useMemo(() => {
    if (history.length === 0) return null;
    const speeds = history.map((e) => e.result.downloadSpeed);
    const latencies = history.map((e) => e.input.latency);

    const avgSpeed = (speeds.reduce((a, b) => a + b, 0) / speeds.length).toFixed(1);
    const maxSpeed = Math.max(...speeds).toFixed(1);
    const avgLatency = Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length);

    return {
      total: history.length,
      avgSpeed,
      maxSpeed,
      avgLatency,
    };
  }, [history]);

  // Filter and sort entries
  const filteredHistory = useMemo(() => {
    return history
      .filter((entry) => {
        // Tier filter
        if (filterTier !== 'ALL' && entry.result.quality !== filterTier) {
          return false;
        }

        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const speedStr = String(entry.result.downloadSpeed);
          const dateStr = new Date(entry.timestamp).toLocaleString().toLowerCase();
          const qualityStr = entry.result.quality.toLowerCase();
          return speedStr.includes(q) || dateStr.includes(q) || qualityStr.includes(q);
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        }
        if (sortBy === 'oldest') {
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        }
        if (sortBy === 'speed_high') {
          return b.result.downloadSpeed - a.result.downloadSpeed;
        }
        if (sortBy === 'latency_low') {
          return a.input.latency - b.input.latency;
        }
        return 0;
      });
  }, [history, filterTier, searchQuery, sortBy]);

  const handleClearWithConfirm = () => {
    if (window.confirm('Are you sure you want to clear your local diagnostics history?')) {
      onClearHistory();
    }
  };

  const handleExportCSV = () => {
    if (history.length === 0) return;
    const headers = ['Timestamp', 'Quality', 'Download_Mbps', 'Latency_ms', 'Jitter_ms', 'Loss_pct', 'Signal'];
    const rows = history.map((e) => [
      e.timestamp,
      e.result.quality,
      e.result.downloadSpeed,
      e.input.latency,
      e.input.jitter,
      e.input.packetLoss,
      `${e.input.signalStrength} ${e.input.signalUnit}`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `speedex-history-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleInspect = (entry: AnalysisEntry) => {
    onLoadEntry(entry);
    onNavigate('results');
  };

  if (history.length === 0) {
    return (
      <div className="history fade-in">
        <header className="history__header-empty">
          <span className="eyebrow">Diagnostic Archive</span>
          <h1 className="page-title">Session History</h1>
          <p className="page-subtitle">
            Local browser diagnostic session logs preserved across sessions.
          </p>
        </header>

        <div className="card empty-state">
          <HistoryIcon size={40} className="empty-state__icon" />
          <h3 className="empty-state__title">No Historical Records Stored</h3>
          <p className="empty-state__desc">
            Your simulated throughput, SLA classification outputs, and link telemetry parameters
            will be archived here as you run diagnostics. Zero data leaves your machine.
          </p>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => onNavigate('analyzer')}
          >
            <span>Run Diagnostic Session</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="history fade-in">
      {/* ── Top Header Row ── */}
      <div className="history__header">
        <div>
          <span className="eyebrow">Diagnostic Archive</span>
          <div className="history__title-row">
            <h1 className="page-title">Session History</h1>
            <span className="history__count">{history.length} SESSIONS</span>
          </div>
          <p className="history__subtitle">
            Local browser logs preserved across sessions with zero external telemetry transmission.
          </p>
        </div>

        <div className="history__top-actions">
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            onClick={handleExportCSV}
            title="Export history records as CSV"
          >
            <FileDown size={14} />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            className="btn btn--danger btn--sm"
            onClick={handleClearWithConfirm}
          >
            <Trash2 size={14} />
            <span>Clear Log</span>
          </button>
        </div>
      </div>

      {/* ── Summary Stats Strip ── */}
      {stats && (
        <div className="history__stats-strip card">
          <div className="history__stat-item">
            <div className="history__stat-icon-wrap">
              <Layers size={14} />
            </div>
            <div>
              <span className="history__stat-label">TOTAL LOGS</span>
              <span className="history__stat-val">{stats.total}</span>
            </div>
          </div>
          <div className="history__stat-item">
            <div className="history__stat-icon-wrap">
              <Zap size={14} />
            </div>
            <div>
              <span className="history__stat-label">MEAN THROUGHPUT</span>
              <span className="history__stat-val">{stats.avgSpeed} <small>Mbps</small></span>
            </div>
          </div>
          <div className="history__stat-item">
            <div className="history__stat-icon-wrap">
              <Activity size={14} />
            </div>
            <div>
              <span className="history__stat-label">PEAK RECORDED</span>
              <span className="history__stat-val">{stats.maxSpeed} <small>Mbps</small></span>
            </div>
          </div>
          <div className="history__stat-item">
            <div className="history__stat-icon-wrap">
              <Clock size={14} />
            </div>
            <div>
              <span className="history__stat-label">AVG RTT DELAY</span>
              <span className="history__stat-val">{stats.avgLatency} <small>ms</small></span>
            </div>
          </div>
        </div>
      )}

      {/* ── Search, Filters, and Sorting Bar ── */}
      <div className="card history__toolbar">
        <div className="history__search-wrap">
          <Search size={14} className="history__search-icon" />
          <input
            type="text"
            className="history__search-input"
            placeholder="Search by throughput, timestamp, or tier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="history__filters">
          <div className="history__tier-pills">
            {(['ALL', 'Excellent', 'Average', 'Poor'] as const).map((tier) => (
              <button
                key={tier}
                type="button"
                className={`history__tier-pill tag-pill${filterTier === tier ? ' tag-pill--active' : ''}`}
                onClick={() => setFilterTier(tier)}
              >
                {tier}
              </button>
            ))}
          </div>

          <div className="history__sort-wrap">
            <span className="history__sort-label">ORDER:</span>
            <select
              className="history__sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              aria-label="Sort by"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="speed_high">Fastest Throughput</option>
              <option value="latency_low">Lowest Latency</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Entry List ── */}
      <div className="history__list">
        {filteredHistory.length === 0 ? (
          <div className="card empty-state">
            <Search size={32} className="empty-state__icon" />
            <h3 className="empty-state__title">No Matching Diagnostics</h3>
            <p className="empty-state__desc">No recorded session matched your current filter or search criteria.</p>
          </div>
        ) : (
          filteredHistory.map((entry) => {
            const qualityClass = `sla-badge sla-badge--${entry.result.quality.toLowerCase()}`;
            const formattedDate = new Date(entry.timestamp).toLocaleString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            });

            return (
              <div key={entry.id} className="history__entry card">
                <div className="history__entry-main">
                  <div className="history__entry-top">
                    <span className={qualityClass}>
                      <span className="sla-badge__dot" />
                      {entry.result.quality}
                    </span>
                    <div className="history__entry-speed">
                      <span className="history__entry-speed-val">{entry.result.downloadSpeed}</span>
                      <span className="history__entry-speed-unit">Mbps</span>
                    </div>
                    <span className="history__entry-time">{formattedDate}</span>
                  </div>

                  <div className="history__entry-metrics">
                    <div className="history__entry-metric">
                      <span className="history__entry-metric-label">RTT</span>
                      <span className="history__entry-metric-val">{entry.input.latency} ms</span>
                    </div>
                    <div className="history__entry-metric">
                      <span className="history__entry-metric-label">Jitter</span>
                      <span className="history__entry-metric-val">{entry.input.jitter} ms</span>
                    </div>
                    <div className="history__entry-metric">
                      <span className="history__entry-metric-label">Loss</span>
                      <span className="history__entry-metric-val">{entry.input.packetLoss}%</span>
                    </div>
                    <div className="history__entry-metric">
                      <span className="history__entry-metric-label">Signal</span>
                      <span className="history__entry-metric-val">{entry.input.signalStrength} {entry.input.signalUnit}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn--outline btn--sm history__inspect-btn"
                  onClick={() => handleInspect(entry)}
                  title="View full prediction and workload diagnostics"
                >
                  <span>Inspect</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
