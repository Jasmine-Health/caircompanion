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

  const probe = useCallback(() => {
    const probeId = ++probeIdRef.current;
    void probeInternetReachability().then((reachable) => {
      if (probeId === probeIdRef.current) {
        setIsReachable(reachable);
      }
    });
  }, []);

  const runProbe = useCallback(() => {
    if (!navigator.onLine) {
      setIsReachable(false);
      return;
    }
    probe();
  }, [probe]);

  useEffect(() => {
    // Offline at mount needs no probe: the state already starts from navigator.onLine.
    if (navigator.onLine) probe();

    const interval = window.setInterval(() => {
      runProbe();
    }, intervalMs);

    const handleOffline = () => {
      probeIdRef.current += 1;
      setIsReachable(false);
    };

    const handleOnline = () => {
      setIsReachable(true);
      runProbe();
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        runProbe();
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
  }, [probe, runProbe, intervalMs]);

  return isReachable;
}
