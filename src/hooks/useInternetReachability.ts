import { useState, useEffect, useRef, useCallback } from 'react';
import { API_CONFIG } from '../config/api';

const DEFAULT_INTERVAL_MS = 5_000;
const PROBE_TIMEOUT_MS = 4_000;

/** True when the browser reports a network and the API responds (any HTTP status). */
export async function probeInternetReachability(): Promise<boolean> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return false;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);

  try {
    await fetch(`${API_CONFIG.BASE_URL}/health`, {
      method: 'GET',
      cache: 'no-store',
      signal: controller.signal,
    });
    return true;
  } catch {
    return false;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Tracks real internet/API reachability: immediate offline on `offline`,
 * verified online via `/health` probes on load, interval, and `online` events.
 */
export function useInternetReachability(intervalMs = DEFAULT_INTERVAL_MS): boolean {
  const [isReachable, setIsReachable] = useState(
    () => typeof navigator !== 'undefined' && navigator.onLine,
  );
  const probeIdRef = useRef(0);

  const runProbe = useCallback(async () => {
    if (!navigator.onLine) {
      setIsReachable(false);
      return;
    }

    const probeId = ++probeIdRef.current;
    const reachable = await probeInternetReachability();
    if (probeId === probeIdRef.current) {
      setIsReachable(reachable);
    }
  }, []);

  useEffect(() => {
    void runProbe();

    const interval = window.setInterval(() => {
      void runProbe();
    }, intervalMs);

    const handleOffline = () => {
      probeIdRef.current += 1;
      setIsReachable(false);
    };

    const handleOnline = () => {
      setIsReachable(true);
      void runProbe();
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        void runProbe();
      }
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      probeIdRef.current += 1;
      window.clearInterval(interval);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [runProbe, intervalMs]);

  return isReachable;
}
