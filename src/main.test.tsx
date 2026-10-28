import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { StrictMode, useState, useEffect } from 'react';

function AppShell() {
  const [showSplash, setShowSplash] = useState(true);
  const [fadeSplash, setFadeSplash] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadeSplash(true), 1500);
    const removeTimer = setTimeout(() => setShowSplash(false), 1900);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  return (
    <>
      <div data-testid="app">App content</div>
      {showSplash && (
        <div data-testid="splash" data-fading={fadeSplash ? 'true' : 'false'}>
          Splash
        </div>
      )}
    </>
  );
}

describe('AppShell splash timing', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('fades then removes splash overlay', () => {
    render(
      <StrictMode>
        <AppShell />
      </StrictMode>
    );

    expect(screen.getByTestId('splash')).toBeInTheDocument();
    expect(screen.getByTestId('splash')).toHaveAttribute('data-fading', 'false');

    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(screen.getByTestId('splash')).toHaveAttribute('data-fading', 'true');

    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(screen.queryByTestId('splash')).not.toBeInTheDocument();
    expect(screen.getByTestId('app')).toBeInTheDocument();
  });
});
