import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { StrictMode } from 'react';
import { AppShell } from './AppShell';

vi.mock('./App.tsx', () => ({ default: () => <div data-testid="app">App content</div> }));
vi.mock('./components/SplashScreen', () => ({
  SplashScreen: ({ fading }: { fading: boolean }) => (
    <div data-testid="splash" data-fading={fading ? 'true' : 'false'}>
      Splash
    </div>
  ),
}));

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
