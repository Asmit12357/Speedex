import { useCallback, useEffect, useRef, useState } from 'react';
import type { SpeedTestMeasurement, SpeedTestProfile, SpeedTestProgress } from '../types';
import { SpeedTestCancelledError, runSpeedTest, type SpeedTestRun } from '../services/speedTestService';

export type SpeedTestState =
  | { status: 'idle' }
  | { status: 'running'; profile: SpeedTestProfile; progress: SpeedTestProgress | null }
  | { status: 'done'; measurement: SpeedTestMeasurement }
  | { status: 'error'; message: string };

function describeError(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err);
  if (/blocked|failed to fetch|networkerror|load failed/i.test(message)) {
    return 'Could not reach speed.cloudflare.com. An ad blocker, VPN or firewall may be blocking it.';
  }
  return message;
}

/**
 * Owns one live speed test at a time. Lives in App so switching pages
 * mid-test doesn't cancel it.
 */
export function useSpeedTest(onComplete: (measurement: SpeedTestMeasurement) => void) {
  const [state, setState] = useState<SpeedTestState>({ status: 'idle' });
  const runRef = useRef<SpeedTestRun | null>(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const start = useCallback((profile: SpeedTestProfile) => {
    runRef.current?.cancel();
    setState({ status: 'running', profile, progress: null });

    const run = runSpeedTest(profile, (progress) => {
      if (runRef.current !== run) return;
      setState({ status: 'running', profile, progress });
    });
    runRef.current = run;

    run.done
      .then((measurement) => {
        if (runRef.current !== run) return;
        runRef.current = null;
        setState({ status: 'done', measurement });
        onCompleteRef.current(measurement);
      })
      .catch((err: unknown) => {
        if (runRef.current !== run) return;
        runRef.current = null;
        setState(err instanceof SpeedTestCancelledError ? { status: 'idle' } : { status: 'error', message: describeError(err) });
      });
  }, []);

  const cancel = useCallback(() => {
    runRef.current?.cancel();
  }, []);

  const reset = useCallback(() => {
    if (!runRef.current) setState({ status: 'idle' });
  }, []);

  // Stop any in-flight test if the app unmounts
  useEffect(() => () => runRef.current?.cancel(), []);

  return { state, start, cancel, reset };
}
