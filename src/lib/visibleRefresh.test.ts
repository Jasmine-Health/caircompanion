import { afterEach, describe, expect, it, vi } from 'vitest';
import { watchVisible } from './visibleRefresh';

describe('watchVisible', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('reloads when tab becomes visible and cleans up listeners', () => {
    vi.useFakeTimers();
    const load = vi.fn();
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' });

    const cleanup = watchVisible(load, 1000);
    vi.advanceTimersByTime(1000);
    expect(load).toHaveBeenCalledTimes(1);

    document.dispatchEvent(new Event('visibilitychange'));
    expect(load).toHaveBeenCalledTimes(2);

    cleanup();
    vi.advanceTimersByTime(2000);
    expect(load).toHaveBeenCalledTimes(2);
  });

  it('skips reload while the document is hidden', () => {
    vi.useFakeTimers();
    const load = vi.fn();
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' });

    watchVisible(load, 500);
    vi.advanceTimersByTime(500);
    expect(load).not.toHaveBeenCalled();

    vi.useRealTimers();
  });
});
