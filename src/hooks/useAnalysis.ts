import { useState, useCallback } from 'react';
import type { AnalysisEntry, NetworkInput, PredictionResult } from '../types';
import { predictionService } from '../services/mockPredictionService';

const STORAGE_KEY = 'speedex-history';

function loadHistory(): AnalysisEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AnalysisEntry[];
  } catch { /* ignore corrupt data */ }
  return [];
}

function saveHistory(entries: AnalysisEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch { /* storage full — silent fail */ }
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useAnalysis() {
  const [history, setHistory] = useState<AnalysisEntry[]>(loadHistory);
  const [currentResult, setCurrentResult] = useState<PredictionResult | null>(null);
  const [currentInput, setCurrentInput] = useState<NetworkInput | null>(null);
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyse = useCallback(async (input: NetworkInput) => {
    setIsAnalysing(true);
    setError(null);
    setCurrentInput(input);

    try {
      const result = await predictionService.predict(input);
      setCurrentResult(result);

      const entry: AnalysisEntry = {
        id: generateId(),
        timestamp: new Date().toISOString(),
        input,
        result,
      };

      setHistory(prev => {
        const updated = [entry, ...prev].slice(0, 50); // keep last 50
        saveHistory(updated);
        return updated;
      });
    } catch {
      setError('Analysis failed. Please try again.');
      setCurrentResult(null);
    } finally {
      setIsAnalysing(false);
    }
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const loadEntry = useCallback((entry: AnalysisEntry) => {
    setCurrentInput(entry.input);
    setCurrentResult(entry.result);
  }, []);

  return {
    history,
    currentResult,
    currentInput,
    isAnalysing,
    error,
    analyse,
    clearHistory,
    loadEntry,
  };
}
