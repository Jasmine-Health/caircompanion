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

  it('returns false when user dismisses the install prompt', async () => {
    const prompt = vi.fn().mockResolvedValue(undefined);
    const userChoice = Promise.resolve({ outcome: 'dismissed' as const });
    (window as unknown as { deferredPrompt: unknown }).deferredPrompt = { prompt, userChoice };

    const { result } = renderHook(() => usePWAInstall());

    await act(async () => {
      const accepted = await result.current.install();
      expect(accepted).toBe(false);
    });

    expect(result.current.isInstalled).toBe(false);
    delete (window as unknown as { deferredPrompt?: unknown }).deferredPrompt;
  });

  it('shows instructions when prompt throws', async () => {
    const prompt = vi.fn().mockRejectedValue(new Error('blocked'));
    (window as unknown as { deferredPrompt: unknown }).deferredPrompt = {
      prompt,
      userChoice: Promise.resolve({ outcome: 'dismissed' as const }),
    };

    const { result } = renderHook(() => usePWAInstall());

    await act(async () => {
      await result.current.install();
    });

    expect(result.current.showInstructions).toBe(true);
    delete (window as unknown as { deferredPrompt?: unknown }).deferredPrompt;
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
