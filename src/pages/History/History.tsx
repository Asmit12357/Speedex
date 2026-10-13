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
        <header>
          <h1 className="page-title">Analysis History</h1>
          <p className="page-subtitle">
            Local browser diagnostics log (stored in HTML5 LocalStorage)
          </p>
        </header>

        <div className="card empty-state">
          <HistoryIcon size={52} />
          <h3>No Historical Diagnostics Recorded</h3>
          <p>
            Your simulated bandwidth and link quality predictions will be preserved here
            as you test network parameters. No telemetry leaves your browser.
          </p>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => onNavigate('analyzer')}
          >
            <span>Run First Diagnostics Session</span>
            <ArrowRight size={16} />
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
          <div className="history__title-row">
            <h1 className="page-title">Diagnostics History</h1>
            <span className="history__count">{history.length} records</span>
          </div>
          <p className="history__subtitle">
            Local workstation log. Preserved across sessions in browser storage.
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
            <span>Clear History</span>
          </button>
        </div>
      </div>

      {/* ── Summary Stats Strip ── */}
      {stats && (
        <div className="history__stats-strip card">
          <div className="history__stat-item">
            <Layers size={16} className="history__icon-cyan" />
            <div>
              <span className="history__stat-label">Total Diagnostics</span>
              <span className="history__stat-val">{stats.total}</span>
            </div>
          </div>
          <div className="history__stat-item">
            <Zap size={16} className="history__icon-cyan" />
            <div>
              <span className="history__stat-label">Average Speed</span>
              <span className="history__stat-val">{stats.avgSpeed} Mbps</span>
            </div>
          </div>
          <div className="history__stat-item">
            <Activity size={16} className="history__icon-green" />
            <div>
              <span className="history__stat-label">Peak Recorded</span>
              <span className="history__stat-val">{stats.maxSpeed} Mbps</span>
            </div>
          </div>
          <div className="history__stat-item">
            <Clock size={16} className="history__icon-indigo" />
            <div>
              <span className="history__stat-label">Mean Latency</span>
              <span className="history__stat-val">{stats.avgLatency} ms</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Search, Filters, and Sorting Bar ── */}
      <div className="card history__toolbar">
        <div className="history__search-wrap">
          <Search size={16} className="history__search-icon" />
          <input
            type="text"
            className="history__search-input"
            placeholder="Search by speed, date, or quality..."
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
                className={`history__tier-pill${filterTier === tier ? ' history__tier-pill--active' : ''}`}
                onClick={() => setFilterTier(tier)}
              >
                {tier}
              </button>
            ))}
          </div>

          <div className="history__sort-wrap">
            <span className="history__sort-label">Sort:</span>
            <select
              className="history__sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              aria-label="Sort by"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="speed_high">Fastest Speed</option>
              <option value="latency_low">Lowest Latency</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Entry List ── */}
      <div className="history__list">
        {filteredHistory.length === 0 ? (
          <div className="card empty-state">
            <Search size={36} />
            <h3>No Matching Records</h3>
            <p>No diagnostics in history matched your current filter or search criteria.</p>
          </div>
        ) : (
          filteredHistory.map((entry) => {
            const qualityClass = `quality-badge quality-badge--${entry.result.quality.toLowerCase()}`;
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
                    <span className={qualityClass}>{entry.result.quality}</span>
                    <div className="history__entry-speed">
                      <span className="history__entry-speed-val">{entry.result.downloadSpeed}</span>
                      <span className="history__entry-speed-unit">Mbps</span>
                    </div>
                    <span className="history__entry-time">{formattedDate}</span>
                  </div>

                  <div className="history__entry-metrics">
                    <div className="history__entry-metric">
                      Latency: <span>{entry.input.latency} ms</span>
                    </div>
                    <div className="history__entry-metric">
                      Jitter: <span>{entry.input.jitter} ms</span>
                    </div>
                    <div className="history__entry-metric">
                      Packet Loss: <span>{entry.input.packetLoss}%</span>
                    </div>
                    <div className="history__entry-metric">
                      Signal: <span>{entry.input.signalStrength} {entry.input.signalUnit}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn--secondary btn--sm history__inspect-btn"
                  onClick={() => handleInspect(entry)}
                  title="View full prediction and workload diagnostics"
                >
                  <span>Inspect</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
