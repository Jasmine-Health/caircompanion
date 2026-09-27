import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { usePWAInstall } from './usePWAInstall';

describe('usePWAInstall', () => {
  it('shows fallback instructions when no deferred prompt exists', async () => {
    const { result } = renderHook(() => usePWAInstall());

    await act(async () => {
      const accepted = await result.current.install();
      expect(accepted).toBe(false);
    });

    expect(result.current.showInstructions).toBe(true);
  });

  it('accepts install when browser prompt succeeds', async () => {
    const prompt = vi.fn().mockResolvedValue(undefined);
    const userChoice = Promise.resolve({ outcome: 'accepted' as const });
    (window as unknown as { deferredPrompt: unknown }).deferredPrompt = { prompt, userChoice };

    const { result } = renderHook(() => usePWAInstall());

    await act(async () => {
      const accepted = await result.current.install();
      expect(accepted).toBe(true);
    });

    expect(result.current.isInstalled).toBe(true);
    delete (window as unknown as { deferredPrompt?: unknown }).deferredPrompt;
  });
});
