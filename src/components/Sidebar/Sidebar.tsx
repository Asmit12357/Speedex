import { useState } from 'react';
import {
  LayoutDashboard,
  Activity,
  BarChart3,
  History,
  Info,
  Menu,
  X,
  Server,
  Zap,
} from 'lucide-react';
import type { PageId } from '../../types';
import './Sidebar.css';

interface NavItem {
  id: PageId;
  label: string;
  icon: React.ElementType;
  shortcut: string;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, shortcut: '1' },
  { id: 'analyzer', label: 'Network Analyzer', icon: Activity, shortcut: '2', badge: 'Live' },
  { id: 'results', label: 'Prediction Results', icon: BarChart3, shortcut: '3' },
  { id: 'history', label: 'Analysis History', icon: History, shortcut: '4' },
  { id: 'about', label: 'System Architecture', icon: Info, shortcut: '5' },
];

interface SidebarProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
}

function Sidebar({ activePage, onNavigate }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleNavigate = (page: PageId) => {
    onNavigate(page);
    setIsOpen(false);
  };

  return (
    <>
      <button
        className="sidebar__toggle"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? 'Close navigation' : 'Open navigation'}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <div
        className={`sidebar__backdrop${isOpen ? ' sidebar__backdrop--visible' : ''}`}
        onClick={() => setIsOpen(false)}
      />

      <aside className={`sidebar${isOpen ? ' sidebar--open' : ''}`}>
        {/* Brand Header */}
        <div
          className="sidebar__brand"
          onClick={() => handleNavigate('overview')}
          role="button"
          tabIndex={0}
        >
          <div className="sidebar__brand-icon">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <div className="sidebar__brand-meta">
            <span className="sidebar__brand-name">Speedex</span>
            <span className="sidebar__brand-tag">Network Diagnostics</span>
          </div>
        </div>

        <div className="sidebar__section-label">
          <span>Navigation</span>
        </div>

        <nav className="sidebar__nav">
          <ul className="sidebar__nav-list">
            {NAV_ITEMS.map(({ id, label, icon: Icon, badge, shortcut }) => (
              <li key={id}>
                <button
                  className={`sidebar__nav-item${activePage === id ? ' sidebar__nav-item--active' : ''}`}
                  onClick={() => handleNavigate(id)}
                >
                  <span className="sidebar__nav-icon">
                    <Icon size={16} />
                  </span>
                  <span className="sidebar__nav-label">{label}</span>
                  {badge && <span className="sidebar__nav-badge">{badge}</span>}
                  <kbd className="sidebar__nav-kbd">{shortcut}</kbd>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Server & Edge Node Status Summary */}
        <div className="sidebar__footer">
          <div className="sidebar__gateway-card">
            <div className="sidebar__gateway-header">
              <Server size={13} className="sidebar__gateway-icon" />
              <span className="sidebar__gateway-title">Telemetry Gateway</span>
              <span className="pulse-dot pulse-dot--online" style={{ marginLeft: 'auto' }} />
            </div>
            <div className="sidebar__gateway-details">
              <div className="sidebar__gateway-row">
                <span className="sidebar__gateway-key">Region</span>
                <span className="sidebar__gateway-val">FRA-01 (Frankfurt)</span>
              </div>
              <div className="sidebar__gateway-row">
                <span className="sidebar__gateway-key">Model</span>
                <span className="sidebar__gateway-val">Dual-Task XGBoost</span>
              </div>
              <div className="sidebar__gateway-row">
                <span className="sidebar__gateway-key">Payload</span>
                <span className="sidebar__gateway-val sidebar__gateway-val--highlight">0 MB (Passive)</span>
              </div>
            </div>
          </div>

          <div className="sidebar__status">
            <span className="sidebar__status-icon-wrap">
              <Zap size={13} />
            </span>
            <div className="sidebar__status-text">
              <span className="sidebar__status-label">Engine Ready</span>
              <span className="sidebar__status-sub">Passive Link Telemetry</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
