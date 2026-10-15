import { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import type { PageId, NetworkInput, AnalysisEntry, EdgeLocation, SpeedTestMeasurement, SpeedTestProfile } from './types';
import { useAnalysis } from './hooks/useAnalysis';
import { useSpeedTest } from './hooks/useSpeedTest';
import { useTheme } from './hooks/useTheme';
import { fetchEdgeLocation } from './services/edgeInfo';
import { pageForShortcut } from './navigation';
import { latestMeasured } from './utils/entryMetrics';
import Sidebar from './components/Sidebar/Sidebar';
import Header from './components/Header/Header';

const Overview = lazy(() => import('./pages/Overview/Overview'));
const SpeedTest = lazy(() => import('./pages/SpeedTest/SpeedTest'));
const Analyzer = lazy(() => import('./pages/Analyzer/Analyzer'));
const Results = lazy(() => import('./pages/Results/Results'));
const History = lazy(() => import('./pages/History/History'));
const About = lazy(() => import('./pages/About/About'));

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
}

export default function App() {
  const [activePage, setActivePage] = useState<PageId>('overview');
  const [pendingScenarioId, setPendingScenarioId] = useState<string | null>(null);
  const [edge, setEdge] = useState<EdgeLocation | undefined>();
  const { theme, toggleTheme } = useTheme();

  const {
    history,
    current,
    isAnalysing,
    error,
    analyse,
    recordMeasurement,
    clearHistory,
    loadEntry,
    dismissError,
  } = useAnalysis();

  const handleMeasured = useCallback((m: SpeedTestMeasurement) => {
    recordMeasurement(m);
    if (m.edge) setEdge(m.edge);
  }, [recordMeasurement]);

  const speedTest = useSpeedTest(handleMeasured);

  // Which Cloudflare data center this browser reaches (0-byte request)
  useEffect(() => {
    const controller = new AbortController();
    fetchEdgeLocation(controller.signal)
      .then((e) => e && setEdge((prev) => prev ?? e))
      .catch(() => { /* offline or blocked: the header just omits the chip */ });
    return () => controller.abort();
  }, []);

  // Number keys 1–6 jump between pages
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey || isTypingTarget(e.target)) return;
      const page = pageForShortcut(e.key);
      if (page) setActivePage(page);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Each page starts at the top
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [activePage]);

  const handleAnalyse = async (input: NetworkInput, scenarioName?: string) => {
    if (await analyse(input, scenarioName)) setActivePage('results');
  };

  const handleStartTest = (profile: SpeedTestProfile = 'quick') => {
    speedTest.start(profile);
    setActivePage('speedtest');
  };

  const handleSelectScenario = (scenarioId: string) => {
    setPendingScenarioId(scenarioId);
    setActivePage('analyzer');
  };

  const handleLoadEntry = (entry: AnalysisEntry) => {
    loadEntry(entry);
    setActivePage('results');
  };

  return (
    <div className="app-layout">
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        history={history}
        isTesting={speedTest.state.status === 'running'}
      />

      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        activePage={activePage}
        edge={edge}
        testState={speedTest.state}
        onOpenSpeedTest={() => setActivePage('speedtest')}
      />

      <main className="app-main" id="main">
        {error && (
          <div className="alert-banner alert-banner--error app-main__alert" role="alert">
            <AlertTriangle size={15} />
            <span>{error}</span>
            <button type="button" className="alert-banner__dismiss" onClick={dismissError} aria-label="Dismiss">
              <X size={14} />
            </button>
          </div>
        )}

        <Suspense
          fallback={
            <div className="page-loading">
              <span className="spinner" />
              <span>Loading…</span>
            </div>
          }
        >
          {activePage === 'overview' && (
            <Overview
              history={history}
              testState={speedTest.state}
              onNavigate={setActivePage}
              onStartTest={() => handleStartTest()}
              onSelectScenario={handleSelectScenario}
              onOpenEntry={handleLoadEntry}
            />
          )}

          {activePage === 'speedtest' && (
            <SpeedTest
              state={speedTest.state}
              edge={edge}
              onStart={handleStartTest}
              onCancel={speedTest.cancel}
              onOpenReport={() => {
                // The finished test is the newest measured entry, even if another result was opened since
                const latest = latestMeasured(history);
                if (latest) handleLoadEntry(latest);
              }}
            />
          )}

          {activePage === 'analyzer' && (
            <Analyzer
              onAnalyse={handleAnalyse}
              isAnalysing={isAnalysing}
              initialScenarioId={pendingScenarioId}
              onScenarioApplied={() => setPendingScenarioId(null)}
            />
          )}

          {activePage === 'results' && <Results entry={current} onNavigate={setActivePage} />}

          {activePage === 'history' && (
            <History
              history={history}
              onLoadEntry={handleLoadEntry}
              onClearHistory={clearHistory}
              onNavigate={setActivePage}
            />
          )}

          {activePage === 'about' && <About />}
        </Suspense>
      </main>
    </div>
  );
}
