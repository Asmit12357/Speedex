import { useState } from 'react';
import { Menu, X, Gauge, Cpu } from 'lucide-react';
import type { AnalysisEntry, PageId } from '../../types';
import { NAV_ITEMS } from '../../navigation';
import { latestMeasured } from '../../utils/entryMetrics';
import { formatMbps, formatMs, timeAgo } from '../../utils/format';
import { isModelConfigured } from '../../services/predictionService';
import './Sidebar.css';

interface SidebarProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
  history: AnalysisEntry[];
  isTesting: boolean;
}

function Sidebar({ activePage, onNavigate, history, isTesting }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const last = latestMeasured(history);
  const m = last?.measurement;

  const handleNavigate = (page: PageId) => {
    onNavigate(page);
    setIsOpen(false);
  };

  return (
    <>
      <button
        type="button"
        className="sidebar__toggle"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? 'Close navigation' : 'Open navigation'}
        aria-expanded={isOpen}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <div
        className={`sidebar__backdrop${isOpen ? ' sidebar__backdrop--visible' : ''}`}
        onClick={() => setIsOpen(false)}
      />

      <aside className={`sidebar${isOpen ? ' sidebar--open' : ''}`}>
        {/* Brand Header */}
        <button type="button" className="sidebar__brand" onClick={() => handleNavigate('overview')}>
          <span className="sidebar__brand-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </span>
          <span className="sidebar__brand-meta">
            <span className="sidebar__brand-name">Speedex</span>
            <span className="sidebar__brand-tag">Network Diagnostics</span>
          </span>
        </button>

        <div className="sidebar__section-label">
          <span>Navigation</span>
        </div>

        <nav className="sidebar__nav" aria-label="Main">
          <ul className="sidebar__nav-list">
            {NAV_ITEMS.map(({ id, label, icon: Icon, shortcut }) => (
              <li key={id}>
                <button
                  type="button"
                  className={`sidebar__nav-item${activePage === id ? ' sidebar__nav-item--active' : ''}`}
                  aria-current={activePage === id ? 'page' : undefined}
                  aria-keyshortcuts={shortcut}
                  onClick={() => handleNavigate(id)}
                >
                  <span className="sidebar__nav-icon">
                    <Icon size={16} />
                  </span>
                  <span className="sidebar__nav-label">{label}</span>
                  {id === 'speedtest' && isTesting && <span className="sidebar__nav-badge">Running</span>}
                  <kbd className="sidebar__nav-kbd" aria-hidden="true">{shortcut}</kbd>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar__footer">
          <div className="sidebar__gateway-card">
            <div className="sidebar__gateway-header">
              <Gauge size={13} className="sidebar__gateway-icon" />
              <span className="sidebar__gateway-title">Last speed test</span>
              {last && <span className="sidebar__gateway-when">{timeAgo(last.timestamp)}</span>}
            </div>
            {m ? (
              <div className="sidebar__gateway-details">
                <div className="sidebar__gateway-row">
                  <span className="sidebar__gateway-key">Down / Up</span>
                  <span className="sidebar__gateway-val sidebar__gateway-val--highlight">
                    {formatMbps(m.downloadMbps)} / {formatMbps(m.uploadMbps)}
                  </span>
                </div>
                <div className="sidebar__gateway-row">
                  <span className="sidebar__gateway-key">Latency</span>
                  <span className="sidebar__gateway-val">{formatMs(m.latencyMs)} ms</span>
                </div>
                {m.edge && (
                  <div className="sidebar__gateway-row">
                    <span className="sidebar__gateway-key">Server</span>
                    <span className="sidebar__gateway-val">{m.edge.colo}</span>
                  </div>
                )}
              </div>
            ) : (
              <button type="button" className="sidebar__gateway-empty" onClick={() => handleNavigate('speedtest')}>
                No tests yet. Run one →
              </button>
            )}
          </div>

          <div className="sidebar__status">
            <span className="sidebar__status-icon-wrap">
              <Cpu size={13} />
            </span>
            <div className="sidebar__status-text">
              <span className="sidebar__status-label">Prediction model</span>
              <span className="sidebar__status-sub">
                {isModelConfigured ? 'Connected via API' : 'In development · estimates only'}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
