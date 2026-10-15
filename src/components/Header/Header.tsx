import { useState, useEffect } from 'react';
import { Wifi, WifiOff, Clock, Sun, Moon, Server } from 'lucide-react';
import type { Theme } from '../../hooks/useTheme';
import type { SpeedTestState } from '../../hooks/useSpeedTest';
import type { EdgeLocation, PageId } from '../../types';
import { NAV_ITEMS } from '../../navigation';
import { formatEdge } from '../../services/edgeInfo';
import './Header.css';

interface HeaderProps {
  theme: Theme;
  onToggleTheme: () => void;
  activePage: PageId;
  edge?: EdgeLocation;
  testState: SpeedTestState;
  onOpenSpeedTest: () => void;
}

const PHASE_TEXT = { latency: 'latency', download: 'download', upload: 'upload', packetLoss: 'packet loss' } as const;

function Header({ theme, onToggleTheme, activePage, edge, testState, onOpenSpeedTest }: HeaderProps) {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });

  const [currentTime, setCurrentTime] = useState<string>(() => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
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

  const pageLabel = NAV_ITEMS.find((item) => item.id === activePage)?.label ?? '';
  // Reaching Cloudflare proves we're online even when navigator.onLine is unreliable (e.g. embedded browsers)
  const online = isOnline || edge !== undefined;
  const running = testState.status === 'running';
  const testPct = running ? Math.round((testState.progress?.fraction ?? 0) * 100) : 0;
  const phase = running && testState.progress ? PHASE_TEXT[testState.progress.phase] : 'connecting';

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
          <span className="header__breadcrumb-current">{pageLabel}</span>
        </div>
        {running && activePage !== 'speedtest' && (
          <button type="button" className="header__env-badge header__test-chip" onClick={onOpenSpeedTest}>
            <span className="pulse-dot pulse-dot--online" />
            <span>Testing {phase} · {testPct}%</span>
          </button>
        )}
      </div>

      <div className="header__right">
        <div className="header__status-chip" title="Browser network status">
          {online ? (
            <>
              <Wifi size={13} className="header__icon-green" />
              <span className="header__status-text">Online</span>
            </>
          ) : (
            <>
              <WifiOff size={13} className="header__icon-red" />
              <span className="header__status-text header__status-text--offline">Offline</span>
            </>
          )}
        </div>

        {edge && (
          <div className="header__node-chip" title="Nearest Cloudflare data center">
            <Server size={12} className="header__node-icon" />
            <span>{formatEdge(edge)}</span>
          </div>
        )}

        <div className="header__time-chip" title="Local time">
          <Clock size={12} />
          <span className="header__time-text">{currentTime}</span>
        </div>

        <button
          type="button"
          className="header__theme-btn"
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
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
