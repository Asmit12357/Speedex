import { useState } from 'react';
import {
  LayoutDashboard,
  Activity,
  BarChart3,
  History,
  Info,
  Server,
  Menu,
  X,
  Gauge,
  Cpu,
} from 'lucide-react';
import type { PageId } from '../../types';
import './Sidebar.css';

interface NavItem {
  id: PageId;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'analyzer', label: 'Network Analyzer', icon: Activity, badge: 'Live' },
  { id: 'results', label: 'Prediction Results', icon: BarChart3 },
  { id: 'history', label: 'Analysis History', icon: History },
  { id: 'about', label: 'About & ML Architecture', icon: Info },
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
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <div
        className={`sidebar__backdrop${isOpen ? ' sidebar__backdrop--visible' : ''}`}
        onClick={() => setIsOpen(false)}
      />

      <aside className={`sidebar${isOpen ? ' sidebar--open' : ''}`}>
        <div className="sidebar__brand" onClick={() => handleNavigate('overview')} role="button" tabIndex={0}>
          <div className="sidebar__brand-icon">
            <Gauge size={20} />
          </div>
          <div className="sidebar__brand-meta">
            <span className="sidebar__brand-name">Speedex</span>
            <span className="sidebar__brand-tag">Network Diagnostics</span>
          </div>
        </div>

        <div className="sidebar__section-label">Navigation</div>

        <nav className="sidebar__nav">
          <ul className="sidebar__nav-list">
            {NAV_ITEMS.map(({ id, label, icon: Icon, badge }) => (
              <li key={id}>
                <button
                  className={`sidebar__nav-item${activePage === id ? ' sidebar__nav-item--active' : ''}`}
                  onClick={() => handleNavigate(id)}
                >
                  <span className="sidebar__nav-icon">
                    <Icon size={18} />
                  </span>
                  <span className="sidebar__nav-label">{label}</span>
                  {badge && <span className="sidebar__nav-badge">{badge}</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Server & Edge Node Status Summary */}
        <div className="sidebar__footer">
          <div className="sidebar__gateway-card">
            <div className="sidebar__gateway-header">
              <Server size={14} className="sidebar__gateway-icon" />
              <span className="sidebar__gateway-title">Telemetry Node</span>
            </div>
            <div className="sidebar__gateway-details">
              <div className="sidebar__gateway-row">
                <span className="sidebar__gateway-key">Region</span>
                <span className="sidebar__gateway-val">Edge Gateway (PoP)</span>
              </div>
              <div className="sidebar__gateway-row">
                <span className="sidebar__gateway-key">Engine</span>
                <span className="sidebar__gateway-val">Dual-Task ML Model</span>
              </div>
            </div>
          </div>

          <div className="sidebar__status">
            <span className="sidebar__status-dot">
              <Cpu size={15} />
            </span>
            <div className="sidebar__status-text">
              <span className="sidebar__status-label">Engine Ready</span>
              <span className="sidebar__status-sub">FastAPI Client Stub Active</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
