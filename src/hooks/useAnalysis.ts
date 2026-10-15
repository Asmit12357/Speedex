import { useState, useCallback } from 'react';
import type { AnalysisEntry, NetworkInput, SpeedTestMeasurement } from '../types';
import { predictionService } from '../services/predictionService';
import { resultFromMeasurement } from '../services/measuredResult';

const STORAGE_KEY = 'speedex-history';
const MAX_ENTRIES = 50;

/**
 * Upgrades entries saved by older versions: `isSimulated` became `source`,
 * and their random confidence scores are dropped.
 */
export function migrateEntry(raw: unknown): AnalysisEntry | null {
  if (!raw || typeof raw !== 'object') return null;
  const entry = raw as AnalysisEntry & { result?: Record<string, unknown> };
  if (typeof entry.id !== 'string' || !entry.result || typeof entry.result !== 'object') return null;
  if (!entry.input && !entry.measurement) return null;
  if (entry.result.source) return entry;

  const { isSimulated: _legacy, confidenceScore: _fake, ...result } = entry.result;
  return {
    ...entry,
    result: { ...(result as unknown as AnalysisEntry['result']), source: 'estimate' },
  };
}

export function loadHistory(): AnalysisEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(migrateEntry).filter((e): e is AnalysisEntry => e !== null);
  } catch {
    return []; // corrupt data or storage blocked
  }
}

function saveHistory(entries: AnalysisEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch { /* storage full or blocked — history just won't persist */ }
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useAnalysis() {
  const [history, setHistory] = useState<AnalysisEntry[]>(loadHistory);
  const [current, setCurrent] = useState<AnalysisEntry | null>(null);
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const record = useCallback((entry: AnalysisEntry) => {
    setCurrent(entry);
    setHistory((prev) => {
      const updated = [entry, ...prev].slice(0, MAX_ENTRIES);
      saveHistory(updated);
      return updated;
    });
  }, []);

  const analyse = useCallback(async (input: NetworkInput, scenarioName?: string) => {
    setIsAnalysing(true);
    setError(null);
    try {
      const result = await predictionService.predict(input);
      record({ id: generateId(), timestamp: new Date().toISOString(), input, result, scenarioName });
      return true;
    } catch {
      setError('Analysis failed. Please try again.');
      return false;
    } finally {
      setIsAnalysing(false);
    }
  }, [record]);

  const recordMeasurement = useCallback((measurement: SpeedTestMeasurement) => {
    record({
      id: generateId(),
      timestamp: new Date().toISOString(),
      measurement,
      result: resultFromMeasurement(measurement),
    });
  }, [record]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch { /* storage blocked */ }
  }, []);

  const dismissError = useCallback(() => setError(null), []);

  return {
    history,
    current,
    isAnalysing,
    error,
    analyse,
    recordMeasurement,
    clearHistory,
    loadEntry: setCurrent,
    dismissError,
  };
}
