import { History as HistoryIcon, Trash2, ArrowRight } from 'lucide-react';
import type { PageId, AnalysisEntry } from '../../types';
import './History.css';

interface HistoryProps {
  history: AnalysisEntry[];
  onLoadEntry: (entry: AnalysisEntry) => void;
  onClearHistory: () => void;
  onNavigate: (page: PageId) => void;
}

export default function History({
  history,
  onLoadEntry,
  onClearHistory,
  onNavigate,
}: HistoryProps) {
  if (history.length === 0) {
    return (
      <div className="history">
        <header>
          <h1 className="page-title">Analysis History</h1>
          <p className="page-subtitle">
            Local demo history stored in your browser session
          </p>
        </header>

        <div className="card empty-state">
          <HistoryIcon size={48} />
          <h3>No Analysis History</h3>
          <p>
            Your simulated predictions will appear here once you run them in the
            Network Analyzer. History is preserved locally in your browser.
          </p>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => onNavigate('analyzer')}
          >
            Start an Analysis
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  const handleInspect = (entry: AnalysisEntry) => {
    onLoadEntry(entry);
    onNavigate('results');
  };

  return (
    <div className="history">
      <div className="history__header">
        <div>
          <div className="history__title-row">
            <h1 className="page-title" style={{ marginBottom: 0 }}>
              Analysis History
            </h1>
            <span className="history__count">{history.length}</span>
          </div>
          <p className="history__subtitle">
            Local browser storage (demo). Not synced to external databases or servers.
          </p>
        </div>

        <button
          type="button"
          className="btn btn--danger btn--sm"
          onClick={onClearHistory}
        >
          <Trash2 size={14} />
          Clear History
        </button>
      </div>

      <div className="history__list">
        {history.map((entry) => {
          const qualityClass = `quality-badge quality-badge--${entry.result.quality.toLowerCase()}`;
          const formattedDate = new Date(entry.timestamp).toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          });

          return (
            <div key={entry.id} className="history__entry">
              <div className="history__entry-main">
                <div className="history__entry-top">
                  <span className={qualityClass}>{entry.result.quality}</span>
                  <div className="history__entry-speed">
                    {entry.result.downloadSpeed}
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
                className="btn btn--secondary btn--sm"
                onClick={() => handleInspect(entry)}
                title="View full prediction details"
              >
                Inspect
                <ArrowRight size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
