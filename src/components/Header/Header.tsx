import { useState, useEffect } from 'react';
import { Wifi, WifiOff, Clock, Sun, Moon, Server, ShieldCheck } from 'lucide-react';
import type { Theme } from '../../hooks/useTheme';
import './Header.css';

interface HeaderProps {
  theme: Theme;
  onToggleTheme: () => void;
}

function Header({ theme, onToggleTheme }: HeaderProps) {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });

  const [currentTime, setCurrentTime] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  });

  const [connectionType] = useState<string>(() => {
    if (typeof navigator === 'undefined') return 'Gigabit';
    const navConn = (navigator as unknown as { connection?: { effectiveType?: string } }).connection;
    return navConn?.effectiveType ? navConn.effectiveType.toUpperCase() : 'Gigabit';
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    }, 1000);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(timer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <header className="header">
      <div className="header__left">
        <div className="header__breadcrumb">
          <span className="header__brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </span>
          <span className="header__breadcrumb-root">Speedex</span>
          <span className="header__breadcrumb-slash">/</span>
          <span className="header__breadcrumb-current">Network Intelligence &amp; SLA Diagnostics</span>
        </div>
        <div className="header__env-badge" title="Validated Passive Telemetry Model">
          <ShieldCheck size={11} className="header__env-icon" />
          <span>Non-Saturating Telemetry v2.4</span>
        </div>
      </div>

      <div className="header__right">
        {/* Link Connectivity Chip */}
        <div className="header__status-chip" title="Active network connection status">
          {isOnline ? (
            <>
              <span className="pulse-dot pulse-dot--online" />
              <Wifi size={13} className="header__icon-green" />
              <span className="header__status-text">Online • {connectionType}</span>
            </>
          ) : (
            <>
              <WifiOff size={13} className="header__icon-red" />
              <span className="header__status-text header__status-text--offline">Offline</span>
            </>
          )}
        </div>

        {/* Edge Node Chip */}
        <div className="header__node-chip" title="Connected Telemetry Edge PoP">
          <Server size={12} className="header__node-icon" />
          <span>FRA-01 (18ms)</span>
        </div>

        {/* Time Chip */}
        <div className="header__time-chip" title="Local workstation timestamp">
          <Clock size={12} />
          <span className="header__time-text">{currentTime || 'Syncing...'}</span>
        </div>

        {/* Theme Toggle Button */}
        <button
          type="button"
          className="header__theme-btn"
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          aria-label={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        >
          {theme === 'dark' ? (
            <Sun size={14} className="header__theme-icon header__theme-icon--sun" />
          ) : (
            <Moon size={14} className="header__theme-icon header__theme-icon--moon" />
          )}
          <span className="header__theme-label">{theme === 'dark' ? 'Light' : 'Dark'}</span>
        </button>
      </div>
    </header>
  );
}

export default Header;
