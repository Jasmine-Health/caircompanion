import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useVoiceChat } from './useVoiceChat';

let latestSocket: MockWebSocket | null = null;
let socketCount = 0;

class MockWebSocket {
  static OPEN = 1;
  static CLOSED = 3;
  readyState = MockWebSocket.OPEN;
  binaryType = 'arraybuffer';
  onopen: (() => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: (() => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  send = vi.fn();
  close = vi.fn();

  url: string;

  constructor(url: string) {
    this.url = url;
    socketCount += 1;
    latestSocket = this;
    queueMicrotask(() => {
      this.onopen?.();
    });
  }
}

function createAudioContextMock() {
  return {
    state: 'running',
    currentTime: 0,
    destination: {},
    resume: vi.fn().mockResolvedValue(undefined),
    close: vi.fn(),
    createBuffer: vi.fn(() => ({
      duration: 0.1,
      getChannelData: () => new Float32Array(8),
    })),
    createBufferSource: vi.fn(() => ({
      buffer: null,
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      disconnect: vi.fn(),
      onended: null as (() => void) | null,
    })),
    createMediaStreamSource: vi.fn(() => ({ connect: vi.fn() })),
    audioWorklet: {
      addModule: vi.fn().mockResolvedValue(undefined),
    },
  };
}

describe('useVoiceChat', () => {
  beforeEach(() => {
    latestSocket = null;
    socketCount = 0;
    localStorage.setItem('access_token', 'token');
    vi.stubGlobal('WebSocket', MockWebSocket as unknown as typeof WebSocket);
    vi.stubGlobal(
      'AudioWorkletNode',
      vi.fn().mockImplementation(function AudioWorkletNode() {
        return {
          port: { onmessage: null },
          connect: vi.fn(),
          disconnect: vi.fn(),
        };
      })
    );
    vi.stubGlobal('AudioContext', vi.fn().mockImplementation(createAudioContextMock));
    Object.defineProperty(globalThis.navigator, 'mediaDevices', {
      configurable: true,
      value: {
        getUserMedia: vi.fn().mockResolvedValue({
          getTracks: () => [{ stop: vi.fn() }],
        }),
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('connects and handles server ready and transcript messages', async () => {
    const { result } = renderHook(() => useVoiceChat());

    await waitFor(() => expect(result.current.status).toBe('connecting'));

    act(() => {
      latestSocket?.onmessage?.({ data: JSON.stringify({ type: 'ready' }) } as MessageEvent);
    });

    await waitFor(() => expect(result.current.status).toBe('ready'));

    await act(async () => {
      await result.current.startConversation();
    });

    act(() => {
      latestSocket?.onmessage?.({ data: JSON.stringify({ type: 'user_transcript', content: 'Hello' }) } as MessageEvent);
      latestSocket?.onmessage?.({ data: JSON.stringify({ type: 'assistant_transcript', content: 'Hi there' }) } as MessageEvent);
      latestSocket?.onmessage?.({ data: JSON.stringify({ type: 'audio_start' }) } as MessageEvent);
      latestSocket?.onmessage?.({ data: JSON.stringify({ type: 'audio_end' }) } as MessageEvent);
      latestSocket?.onmessage?.({ data: JSON.stringify({ type: 'speech_started' }) } as MessageEvent);
      latestSocket?.onmessage?.({ data: JSON.stringify({ type: 'error', content: 'Server busy' }) } as MessageEvent);
      latestSocket?.onmessage?.({ data: JSON.stringify({ type: 'unknown_event' }) } as MessageEvent);
    });
    expect(result.current.transcript).toBe('');
    expect(result.current.error).toBe('Server busy');
  });

  it('sets auth error when token is missing', async () => {
    localStorage.removeItem('access_token');
    const { result } = renderHook(() => useVoiceChat());
    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.error).toMatch(/authenticated/i);
  });

  it('plays binary audio chunks while speaking', async () => {
    const { result } = renderHook(() => useVoiceChat());
    act(() => {
      latestSocket?.onmessage?.({ data: JSON.stringify({ type: 'ready' }) } as MessageEvent);
    });
    await waitFor(() => expect(result.current.status).toBe('ready'));

    await act(async () => {
      await result.current.startConversation();
    });

    act(() => {
      latestSocket?.onmessage?.({ data: new ArrayBuffer(8) } as MessageEvent);
      latestSocket?.onerror?.();
      latestSocket?.onclose?.({ code: 1006 } as CloseEvent);
    });

    expect(result.current.status).toBe('disconnected');
  });

  it('stopConversation closes active websocket', async () => {
    const { result } = renderHook(() => useVoiceChat());
    act(() => {
      latestSocket?.onmessage?.({ data: JSON.stringify({ type: 'ready' }) } as MessageEvent);
    });
    await waitFor(() => expect(result.current.status).toBe('ready'));

    const closedSocket = latestSocket;
    act(() => {
      result.current.stopConversation();
    });

    expect(closedSocket?.close).toHaveBeenCalled();
  });
});
