import { useState, useRef, useCallback, useEffect } from 'react';
import { API_CONFIG } from '../config/api';

// ── Types ────────────────────────────────────────────────────────────────────

export type VoiceChatStatus =
  | 'disconnected'   // WebSocket not yet connected
  | 'connecting'     // WebSocket handshake in progress
  | 'ready'          // Connected & idle – mic button enabled
  | 'listening'      // User is speaking, mic is hot
  | 'processing'     // Waiting for AI response
  | 'speaking'       // AI audio is playing
  | 'error';         // Something went wrong

export interface UseVoiceChatReturn {
  status: VoiceChatStatus;
  transcript: string;
  transcriptSpeaker: 'user' | 'assistant' | null;
  startConversation: () => void;
  stopConversation: () => void;
  error: string | null;
}

// ── Constants ────────────────────────────────────────────────────────────────

const PLAYBACK_SAMPLE_RATE = 24000;
const CAPTURE_SAMPLE_RATE = 16000;

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useVoiceChat(): UseVoiceChatReturn {
  const [status, setStatus] = useState<VoiceChatStatus>('disconnected');
  const [transcript, setTranscript] = useState('');
  const [transcriptSpeaker, setTranscriptSpeaker] = useState<'user' | 'assistant' | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Refs for mutable state that callbacks close over
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const statusRef = useRef<VoiceChatStatus>('disconnected');
  const isConversationActiveRef = useRef(false);

  // Audio playback refs
  const playbackCtxRef = useRef<AudioContext | null>(null);
  const audioQueueRef = useRef<ArrayBuffer[]>([]);
  const isPlayingRef = useRef(false);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const playbackStartTimeRef = useRef(0);
  const scheduledEndTimeRef = useRef(0);
  const pendingAudioEndRef = useRef(false);

  // Keep statusRef in sync
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  // ── Audio Playback (low-latency streaming) ──────────────────────────────

  const getPlaybackContext = useCallback((): AudioContext => {
    if (!playbackCtxRef.current || playbackCtxRef.current.state === 'closed') {
      playbackCtxRef.current = new AudioContext({ sampleRate: PLAYBACK_SAMPLE_RATE });
    }
    return playbackCtxRef.current;
  }, []);

  const stopAudioPlayback = useCallback(() => {
    // Stop any currently playing source
    if (currentSourceRef.current) {
      try {
        currentSourceRef.current.stop();
        currentSourceRef.current.disconnect();
      } catch {
        // already stopped
      }
      currentSourceRef.current = null;
    }
    audioQueueRef.current = [];
    isPlayingRef.current = false;
    playbackStartTimeRef.current = 0;
    scheduledEndTimeRef.current = 0;
    pendingAudioEndRef.current = false;
  }, []);

  const drainAudioQueue = useCallback(() => {
    if (audioQueueRef.current.length === 0) {
      // Queue is empty – always mark as not playing so new chunks can restart
      isPlayingRef.current = false;
      if (pendingAudioEndRef.current) {
        pendingAudioEndRef.current = false;
        if (isConversationActiveRef.current && statusRef.current === 'speaking') {
          setStatus('listening');
        }
      }
      return;
    }

    const ctx = getPlaybackContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    // Concatenate all queued chunks into a single buffer for gapless playback
    const chunks = audioQueueRef.current.splice(0);
    let totalSamples = 0;
    const int16Arrays: Int16Array[] = [];
    for (const buf of chunks) {
      const arr = new Int16Array(buf);
      int16Arrays.push(arr);
      totalSamples += arr.length;
    }

    if (totalSamples === 0) {
      isPlayingRef.current = false;
      return;
    }

    const audioBuffer = ctx.createBuffer(1, totalSamples, PLAYBACK_SAMPLE_RATE);
    const channelData = audioBuffer.getChannelData(0);
    let offset = 0;
    for (const arr of int16Arrays) {
      for (let i = 0; i < arr.length; i++) {
        channelData[offset++] = arr[i] / 32768;
      }
    }

    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);

    // Schedule this chunk right after the previous one for gapless playback
    const now = ctx.currentTime;
    const startAt = Math.max(now, scheduledEndTimeRef.current);
    source.start(startAt);
    scheduledEndTimeRef.current = startAt + audioBuffer.duration;

    currentSourceRef.current = source;
    isPlayingRef.current = true;

    source.onended = () => {
      // When this chunk finishes, try to play more or mark idle
      if (isConversationActiveRef.current) {
        drainAudioQueue();
      } else {
        isPlayingRef.current = false;
      }
    };
  }, [getPlaybackContext]);

  const enqueueAudio = useCallback((data: ArrayBuffer) => {
    // Only accept audio when actively speaking – drop leftover TTS
    // chunks that arrive after a barge-in transitions us to 'listening'
    if (!isConversationActiveRef.current || statusRef.current !== 'speaking') return;
    audioQueueRef.current.push(data);
    if (!isPlayingRef.current) {
      drainAudioQueue();
    }
  }, [drainAudioQueue]);

  // ── Microphone Capture ──────────────────────────────────────────────────

  const startMicrophone = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: CAPTURE_SAMPLE_RATE,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = stream;

      const audioCtx = new AudioContext({ sampleRate: CAPTURE_SAMPLE_RATE });
      audioContextRef.current = audioCtx;

      await audioCtx.audioWorklet.addModule(`${import.meta.env.BASE_URL}pcm-processor.js`);

      const source = audioCtx.createMediaStreamSource(stream);
      const workletNode = new AudioWorkletNode(audioCtx, 'pcm-processor');
      workletNodeRef.current = workletNode;

      workletNode.port.onmessage = (e: MessageEvent<ArrayBuffer>) => {
        const ws = wsRef.current;
        if (ws && ws.readyState === WebSocket.OPEN && isConversationActiveRef.current) {
          ws.send(e.data);
        }
      };

      source.connect(workletNode);
      workletNode.connect(audioCtx.destination); // needed to keep the worklet alive

    } catch (err) {
      console.error('[MIC] Failed to start microphone:', err);
      setError('Microphone access denied. Please allow microphone access.');
      setStatus('error');
    }
  }, []);

  const stopMicrophone = useCallback(() => {
    if (workletNodeRef.current) {
      workletNodeRef.current.disconnect();
      workletNodeRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }
  }, []);

  // ── WebSocket Connection ────────────────────────────────────────────────

  const connectWebSocket = useCallback(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('Not authenticated');
      setStatus('error');
      return;
    }

    setStatus('connecting');
    setError(null);

    const wsUrl = `${API_CONFIG.BASE_URL.replace('http', 'ws')}/ws/voice-chat?token=${token}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.binaryType = 'arraybuffer';

    ws.onopen = () => {
      console.log('[WS] Connected to voice chat');
    };

    ws.onmessage = (event: MessageEvent) => {
      if (event.data instanceof ArrayBuffer) {
        // Binary audio data from TTS – enqueue for playback
        enqueueAudio(event.data);
        return;
      }

      // Text message
      try {
        const msg = JSON.parse(event.data);

        switch (msg.type) {
          case 'ready':
            console.log('[WS] Voice assistant ready');
            setStatus('ready');
            break;

          case 'interim_transcript':
            if (isConversationActiveRef.current) {
              setTranscript(msg.content);
              setTranscriptSpeaker('user');
            }
            break;

          case 'user_transcript':
            if (isConversationActiveRef.current) {
              setTranscript(msg.content);
              setTranscriptSpeaker('user');
              setStatus('processing');
            }
            break;

          case 'assistant_transcript':
            if (isConversationActiveRef.current) {
              setTranscript(msg.content);
              setTranscriptSpeaker('assistant');
              setStatus('speaking');
            }
            break;

          case 'audio_start':
            // TTS streaming is about to begin
            if (isConversationActiveRef.current) {
              setStatus('speaking');
              // Reset scheduling timeline for new utterance
              const ctx = getPlaybackContext();
              playbackStartTimeRef.current = ctx.currentTime;
              scheduledEndTimeRef.current = ctx.currentTime;
            }
            break;

          case 'audio_end':
            // TTS streaming finished – wait for queue to drain then go back to listening
            pendingAudioEndRef.current = true;
            if (audioQueueRef.current.length === 0 && !isPlayingRef.current) {
              pendingAudioEndRef.current = false;
              if (isConversationActiveRef.current) {
                setStatus('listening');
              }
            }
            break;

          case 'speech_started':
            // Server detected barge-in via VAD
            if (isConversationActiveRef.current) {
              stopAudioPlayback();
              setStatus('listening');
              setTranscript('');
              setTranscriptSpeaker('user');
            }
            break;

          case 'error':
            console.error('[WS] Server error:', msg.content);
            setError(msg.content || 'Server error');
            break;

          default:
            console.log('[WS] Unknown message type:', msg.type);
        }
      } catch (err) {
        console.error('[WS] Failed to parse message:', err);
      }
    };

    ws.onerror = () => {
      // Only show error if we're actively trying to connect or in a conversation
      // Ignore errors from stale/closed connections during reconnect
      if (wsRef.current === ws && statusRef.current !== 'disconnected') {
        console.error('[WS] Connection error');
        setError('Connection error. Please try again.');
        setStatus('error');
      }
    };

    ws.onclose = (event) => {
      // Only log if this is the current active connection
      if (wsRef.current === ws) {
        console.log('[WS] Disconnected:', event.code, event.reason);
        if (isConversationActiveRef.current) {
          // Unexpected close during conversation
          isConversationActiveRef.current = false;
          stopMicrophone();
          stopAudioPlayback();
        }
        setStatus('disconnected');
      }
    };
  }, [enqueueAudio, getPlaybackContext, stopAudioPlayback, stopMicrophone]);

  // ── Public API ──────────────────────────────────────────────────────────

  const startConversation = useCallback(async () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setError('Not connected to server');
      return;
    }

    isConversationActiveRef.current = true;
    setError(null);
    setTranscript('');
    setTranscriptSpeaker(null);

    // Start microphone capture
    await startMicrophone();

    // Ensure playback context is ready (must be resumed from user gesture)
    const pCtx = getPlaybackContext();
    if (pCtx.state === 'suspended') {
      await pCtx.resume();
    }

    // Tell backend to start (triggers greeting)
    wsRef.current.send(JSON.stringify({ type: 'StartRecording' }));
    setStatus('speaking'); // Greeting will play first
  }, [startMicrophone, getPlaybackContext]);

  const stopConversation = useCallback(() => {
    isConversationActiveRef.current = false;

    // Stop audio immediately
    stopAudioPlayback();

    // Stop microphone
    stopMicrophone();

    // Tell backend to interrupt any playing audio and close the stream
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify({ type: 'InterruptAudio' }));
        ws.send(JSON.stringify({ type: 'CloseStream' }));
      } catch {
        // ws may have already errored
      }
    }

    setTranscript('');
    setTranscriptSpeaker(null);

    // Close the current WebSocket and reconnect for the next conversation.
    // The backend session is tied to a single WebSocket lifecycle, so we
    // need a fresh connection for each conversation.
    if (ws) {
      ws.close();
      wsRef.current = null;
    }

    // Short delay before reconnecting to let the backend clean up
    setTimeout(() => {
      connectWebSocket();
    }, 500);
  }, [stopAudioPlayback, stopMicrophone, connectWebSocket]);

  // ── Connect on mount, disconnect on unmount ─────────────────────────────

  useEffect(() => {
    connectWebSocket();

    return () => {
      isConversationActiveRef.current = false;
      stopMicrophone();
      stopAudioPlayback();

      const ws = wsRef.current;
      if (ws) {
        ws.close();
        wsRef.current = null;
      }

      if (playbackCtxRef.current) {
        playbackCtxRef.current.close();
        playbackCtxRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    status,
    transcript,
    transcriptSpeaker,
    startConversation,
    stopConversation,
    error,
  };
}
