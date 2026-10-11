import { useState } from 'react';
import type { PageId, NetworkInput, AnalysisEntry } from './types';
import { useAnalysis } from './hooks/useAnalysis';
import { DEMO_VALUES } from './services/mockPredictionService';
import Sidebar from './components/Sidebar/Sidebar';
import Header from './components/Header/Header';
import Overview from './pages/Overview/Overview';
import Analyzer from './pages/Analyzer/Analyzer';
import Results from './pages/Results/Results';
import History from './pages/History/History';
import About from './pages/About/About';

export default function App() {
  const [activePage, setActivePage] = useState<PageId>('overview');

  const {
    history,
    currentResult,
    currentInput,
    isAnalysing,
    error,
    analyse,
    clearHistory,
    loadEntry,
  } = useAnalysis();

  const handleAnalyse = async (input: NetworkInput) => {
    await analyse(input);
    setActivePage('results');
  };

  const handleRunDemo = async () => {
    await analyse(DEMO_VALUES);
    setActivePage('results');
  };

  const handleLoadEntry = (entry: AnalysisEntry) => {
    loadEntry(entry);
    setActivePage('results');
  };

  return (
    <div className="app-layout">
      {/* Sidebar navigation */}
      <Sidebar activePage={activePage} onNavigate={setActivePage} />

      {/* Top Header bar */}
      <Header />

      {/* Main active view container */}
      <main className="app-main">
        {error && (
          <div
            className="disclaimer"
            style={{
              borderColor: 'rgba(239, 68, 68, 0.3)',
              color: 'var(--accent-red)',
              background: 'rgba(239, 68, 68, 0.08)',
              marginBottom: 'var(--sp-6)',
            }}
          >
            <span>{error}</span>
          </div>
        )}

        {activePage === 'overview' && (
          <Overview onNavigate={setActivePage} onRunDemo={handleRunDemo} />
        )}

        {activePage === 'analyzer' && (
          <Analyzer onAnalyse={handleAnalyse} isAnalysing={isAnalysing} />
        )}

        {activePage === 'results' && (
          <Results
            result={currentResult}
            input={currentInput}
            onNavigate={setActivePage}
          />
        )}

        {activePage === 'history' && (
          <History
            history={history}
            onLoadEntry={handleLoadEntry}
            onClearHistory={clearHistory}
            onNavigate={setActivePage}
          />
        )}

        {activePage === 'about' && <About />}
      </main>
    </div>
  );
}
