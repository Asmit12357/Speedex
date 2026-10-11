import { useState } from 'react';
import {
  LayoutDashboard,
  Activity,
  BarChart3,
  History,
  Info,
  Wifi,
  Menu,
  X,
} from 'lucide-react';
import type { PageId } from '../../types';
import './Sidebar.css';

interface NavItem {
  id: PageId;
  label: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'analyzer', label: 'Network Analyzer', icon: Activity },
  { id: 'results', label: 'Prediction Results', icon: BarChart3 },
  { id: 'history', label: 'Analysis History', icon: History },
  { id: 'about', label: 'About the Project', icon: Info },
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
        <div className="sidebar__brand">
          <div className="sidebar__brand-icon">
            <Activity size={20} />
          </div>
          <span className="sidebar__brand-name">Speedex</span>
        </div>

        <nav className="sidebar__nav">
          <ul className="sidebar__nav-list">
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
              <li key={id}>
                <button
                  className={`sidebar__nav-item${activePage === id ? ' sidebar__nav-item--active' : ''}`}
                  onClick={() => handleNavigate(id)}
                >
                  <span className="sidebar__nav-icon">
                    <Icon size={18} />
                  </span>
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar__footer">
          <div className="sidebar__status">
            <span className="sidebar__status-dot">
              <Wifi size={16} />
            </span>
            <div className="sidebar__status-text">
              <span className="sidebar__status-label">Demo Mode</span>
              <span className="sidebar__status-sub">ML model integration pending</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
