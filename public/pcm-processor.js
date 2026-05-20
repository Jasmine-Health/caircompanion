/**
 * AudioWorklet processor for converting microphone float32 samples to
 * 16-bit linear PCM at the native sample rate.
 *
 * The processor collects samples and posts them in ~100ms chunks
 * to minimise message overhead while keeping latency low.
 */
class PCMProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this._buffer = [];
    // ~100ms worth of samples at 16kHz = 1600 samples
    this._flushSize = 1600;
  }

  process(inputs) {
    const input = inputs[0];
    if (!input || !input[0]) return true;

    const channelData = input[0]; // mono

    for (let i = 0; i < channelData.length; i++) {
      this._buffer.push(channelData[i]);
    }

    if (this._buffer.length >= this._flushSize) {
      const pcm16 = new Int16Array(this._buffer.length);
      for (let i = 0; i < this._buffer.length; i++) {
        const s = Math.max(-1, Math.min(1, this._buffer[i]));
        pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
      }
      this.port.postMessage(pcm16.buffer, [pcm16.buffer]);
      this._buffer = [];
    }

    return true;
  }
}

registerProcessor('pcm-processor', PCMProcessor);
