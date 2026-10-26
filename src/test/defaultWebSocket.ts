import { vi } from 'vitest';

/** Minimal WebSocket stub so pages using chat/voice do not hit jsdom errors in unrelated tests. */
export class DefaultTestWebSocket {
  static OPEN = 1;
  static CLOSED = 3;
  readyState = DefaultTestWebSocket.OPEN;
  binaryType = 'arraybuffer';
  onopen: (() => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: (() => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  close = vi.fn();
  send = vi.fn();

  constructor(_url?: string) {
    queueMicrotask(() => {
      this.onopen?.();
    });
  }
}

export function installDefaultWebSocket() {
  vi.stubGlobal('WebSocket', DefaultTestWebSocket as unknown as typeof WebSocket);
}
