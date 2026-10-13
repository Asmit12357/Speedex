import { useState, useEffect } from 'react';
import { Wifi, WifiOff, Clock, ShieldCheck, HelpCircle, Sun, Moon } from 'lucide-react';
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
    if (typeof navigator === 'undefined') return 'Broadband / Wi-Fi';
    const navConn = (navigator as unknown as { connection?: { effectiveType?: string } }).connection;
    return navConn?.effectiveType ? navConn.effectiveType.toUpperCase() : 'Broadband / Wi-Fi';
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
        <div className="header__title-row">
          <h1 className="header__title">Network Diagnostics &amp; Quality Predictor</h1>
          <span className="header__version-pill">v1.2-preview</span>
        </div>
        <span className="header__subtitle">
          Real-time dual-task throughput estimation &amp; SLA tier classification
        </span>
      </div>

      <div className="header__right">
        {/* Connection status badge */}
        <div className="header__status-chip" title="Browser link connectivity state">
          {isOnline ? (
            <>
              <span className="pulse-dot pulse-dot--online" />
              <Wifi size={14} className="header__icon-green" />
              <span className="header__status-text">Online ({connectionType})</span>
            </>
          ) : (
            <>
              <WifiOff size={14} className="header__icon-red" />
              <span className="header__status-text header__status-text--offline">Offline</span>
            </>
          )}
        </div>

        {/* Live system clock */}
        <div className="header__time-chip" title="Local workstation timestamp">
          <Clock size={13} />
          <span className="header__time-text">{currentTime || 'Syncing...'}</span>
        </div>

        {/* Theme Toggle Button (Light / Dark) */}
        <button
          type="button"
          className="header__theme-btn"
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? (
            <Sun size={15} className="header__theme-icon header__theme-icon--sun" />
          ) : (
            <Moon size={15} className="header__theme-icon header__theme-icon--moon" />
          )}
          <span className="header__theme-label">{theme === 'dark' ? 'Light' : 'Dark'}</span>
        </button>

        {/* Demo Mode Badge */}
        <div
          className="demo-badge header__demo-chip"
          title="ML models run client-side heuristic evaluation. Ready for Python Flask / FastAPI inference API."
        >
          <ShieldCheck size={13} />
          <span>Demo ML Engine</span>
          <HelpCircle size={11} className="header__help-icon" />
        </div>
      </div>
    </header>
  );
}

export default Header;
