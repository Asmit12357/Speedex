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
import { SOURCE_LABEL, entryMetrics } from '../../utils/entryMetrics';
import './History.css';

interface HistoryProps {
  history: AnalysisEntry[];
  onLoadEntry: (entry: AnalysisEntry) => void;
  onClearHistory: () => void;
  onNavigate: (page: PageId) => void;
}

type FilterTier = 'ALL' | QualityCategory;
type FilterSource = 'all' | 'measured' | 'estimated';
type SortOption = 'newest' | 'oldest' | 'speed_high' | 'latency_low';

const SOURCE_FILTERS: ReadonlyArray<readonly [FilterSource, string]> = [
  ['all', 'All'],
  ['measured', 'Measured'],
  ['estimated', 'Estimated'],
];

export default function History({
  history,
  onLoadEntry,
  onClearHistory,
  onNavigate,
}: HistoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTier, setFilterTier] = useState<FilterTier>('ALL');
  const [filterSource, setFilterSource] = useState<FilterSource>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  // Summary statistics across history
  const stats = useMemo(() => {
    if (history.length === 0) return null;
    const speeds = history.map((e) => e.result.downloadSpeed);
    const latencies = history.map((e) => entryMetrics(e).latencyMs);

    const avgSpeed = (speeds.reduce((a, b) => a + b, 0) / speeds.length).toFixed(1);
    const maxSpeed = Math.max(...speeds).toFixed(1);
    const avgLatency = Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length);

    return {
      total: history.length,
      measured: history.filter((e) => e.result.source === 'cloudflare').length,
      avgSpeed,
      maxSpeed,
      avgLatency,
    };
  }, [history]);

  // Filter and sort entries
  const filteredHistory = useMemo(() => {
    return history
      .filter((entry) => {
        if (filterTier !== 'ALL' && entry.result.quality !== filterTier) {
          return false;
        }

        const measured = entry.result.source === 'cloudflare';
        if ((filterSource === 'measured' && !measured) || (filterSource === 'estimated' && measured)) {
          return false;
        }

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const speedStr = String(entry.result.downloadSpeed);
          const dateStr = new Date(entry.timestamp).toLocaleString().toLowerCase();
          const qualityStr = entry.result.quality.toLowerCase();
          const serverStr = entry.measurement?.edge?.colo.toLowerCase() ?? '';
          return speedStr.includes(q) || dateStr.includes(q) || qualityStr.includes(q) || serverStr.includes(q);
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
          return entryMetrics(a).latencyMs - entryMetrics(b).latencyMs;
        }
        return 0;
      });
  }, [history, filterTier, filterSource, searchQuery, sortBy]);

  const handleClearWithConfirm = () => {
    if (window.confirm('Clear all saved results from this browser?')) {
      onClearHistory();
    }
  };

  const handleExportCSV = () => {
    if (history.length === 0) return;
    const headers = ['Timestamp', 'Source', 'Quality', 'Download_Mbps', 'Upload_Mbps', 'Latency_ms', 'Jitter_ms', 'Loss_pct', 'Signal', 'Server'];
    const rows = history.map((e) => {
      const m = entryMetrics(e);
      return [
        e.timestamp,
        SOURCE_LABEL[m.source],
        e.result.quality,
        m.downloadMbps,
        m.uploadMbps ?? '',
        m.latencyMs,
        m.jitterMs,
        m.packetLossPct ?? '',
        m.signal ?? '',
        m.edge?.colo ?? '',
      ];
    });

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
          <span className="eyebrow">Saved results</span>
          <h1 className="page-title">History</h1>
          <p className="page-subtitle">
            Every speed test and estimate you run, kept in this browser.
          </p>
        </header>

        <div className="card empty-state">
          <HistoryIcon size={40} className="empty-state__icon" />
          <h3 className="empty-state__title">Nothing saved yet</h3>
          <p className="empty-state__desc">
            Speed tests and estimates you run are saved here, in this browser only.
          </p>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => onNavigate('speedtest')}
          >
            <span>Run a speed test</span>
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
          <span className="eyebrow">Saved results</span>
          <div className="history__title-row">
            <h1 className="page-title">History</h1>
            <span className="history__count">{history.length} saved</span>
          </div>
          <p className="history__subtitle">
            Saved in this browser only. Clearing site data removes them.
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
            <span>Clear</span>
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
              <span className="history__stat-label">Results</span>
              <span className="history__stat-val">
                {stats.total} <small>{stats.measured} measured</small>
              </span>
            </div>
          </div>
          <div className="history__stat-item">
            <div className="history__stat-icon-wrap">
              <Zap size={14} />
            </div>
            <div>
              <span className="history__stat-label">Average download</span>
              <span className="history__stat-val">{stats.avgSpeed} <small>Mbps</small></span>
            </div>
          </div>
          <div className="history__stat-item">
            <div className="history__stat-icon-wrap">
              <Activity size={14} />
            </div>
            <div>
              <span className="history__stat-label">Best download</span>
              <span className="history__stat-val">{stats.maxSpeed} <small>Mbps</small></span>
            </div>
          </div>
          <div className="history__stat-item">
            <div className="history__stat-icon-wrap">
              <Clock size={14} />
            </div>
            <div>
              <span className="history__stat-label">Average latency</span>
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
            placeholder="Search by speed, date, quality or server…"
            aria-label="Search history"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="history__filters">
          <div className="history__tier-pills" role="group" aria-label="Filter by source">
            {SOURCE_FILTERS.map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={`history__tier-pill tag-pill${filterSource === id ? ' tag-pill--active' : ''}`}
                aria-pressed={filterSource === id}
                onClick={() => setFilterSource(id)}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="history__tier-pills" role="group" aria-label="Filter by quality">
            {(['ALL', 'Excellent', 'Average', 'Poor'] as const).map((tier) => (
              <button
                key={tier}
                type="button"
                className={`history__tier-pill tag-pill${filterTier === tier ? ' tag-pill--active' : ''}`}
                aria-pressed={filterTier === tier}
                onClick={() => setFilterTier(tier)}
              >
                {tier === 'ALL' ? 'Any quality' : tier}
              </button>
            ))}
          </div>

          <div className="history__sort-wrap">
            <span className="history__sort-label">Sort</span>
            <select
              className="history__sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              aria-label="Sort by"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="speed_high">Fastest download</option>
              <option value="latency_low">Lowest latency</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Entry List ── */}
      <div className="history__list">
        {filteredHistory.length === 0 ? (
          <div className="card empty-state">
            <Search size={32} className="empty-state__icon" />
            <h3 className="empty-state__title">No matches</h3>
            <p className="empty-state__desc">Nothing matches these filters. Try clearing the search or picking "All".</p>
          </div>
        ) : (
          filteredHistory.map((entry) => {
            const m = entryMetrics(entry);
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
                    <span className={`source-badge source-badge--${m.source}`}>{SOURCE_LABEL[m.source]}</span>
                    <div className="history__entry-speed">
                      <span className="history__entry-speed-val">{entry.result.downloadSpeed}</span>
                      <span className="history__entry-speed-unit">Mbps</span>
                    </div>
                    <span className="history__entry-time">{formattedDate}</span>
                  </div>

                  <div className="history__entry-metrics">
                    {m.uploadMbps !== undefined && (
                      <div className="history__entry-metric">
                        <span className="history__entry-metric-label">Upload</span>
                        <span className="history__entry-metric-val">{m.uploadMbps} Mbps</span>
                      </div>
                    )}
                    <div className="history__entry-metric">
                      <span className="history__entry-metric-label">Latency</span>
                      <span className="history__entry-metric-val">{m.latencyMs} ms</span>
                    </div>
                    <div className="history__entry-metric">
                      <span className="history__entry-metric-label">Jitter</span>
                      <span className="history__entry-metric-val">{m.jitterMs} ms</span>
                    </div>
                    {m.packetLossPct !== undefined && (
                      <div className="history__entry-metric">
                        <span className="history__entry-metric-label">Loss</span>
                        <span className="history__entry-metric-val">{m.packetLossPct}%</span>
                      </div>
                    )}
                    {m.signal && (
                      <div className="history__entry-metric">
                        <span className="history__entry-metric-label">Signal</span>
                        <span className="history__entry-metric-val">{m.signal}</span>
                      </div>
                    )}
                    {m.edge && (
                      <div className="history__entry-metric">
                        <span className="history__entry-metric-label">Server</span>
                        <span className="history__entry-metric-val">{m.edge.colo}</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn--outline btn--sm history__inspect-btn"
                  onClick={() => handleInspect(entry)}
                  title="Open the full report"
                >
                  <span>Open</span>
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
