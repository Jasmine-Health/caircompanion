import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { installDefaultWebSocket } from './defaultWebSocket';

Element.prototype.scrollIntoView = vi.fn();

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

vi.stubGlobal('open', vi.fn());
installDefaultWebSocket();

const EXPECTED_CONSOLE_ERROR = [
  /^Failed to load Medications:/,
  /^Failed to load care plan details:/,
  /^OAuth callback error:/,
  /^\[Voice\] Failed/,
  /^PWA install prompt failed/,
  /^\[MIC\] Failed/,
  /^\[WS\] Server error:/,
  /^\[WS\] Connection error$/,
];

function consoleErrorText(args: unknown[]): string {
  const first = args[0];
  if (typeof first === 'string') return first;
  if (first instanceof Error) return first.message;
  return String(first ?? '');
}

const originalConsoleError = console.error.bind(console);
console.error = (...args: unknown[]) => {
  const text = consoleErrorText(args);
  if (EXPECTED_CONSOLE_ERROR.some((pattern) => pattern.test(text))) {
    return;
  }
  originalConsoleError(...args);
};

afterEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  installDefaultWebSocket();
});
