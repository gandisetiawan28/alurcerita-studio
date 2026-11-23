/**
 * AlurCerita Studio — Audio Engine & DSP Mastering Suite
 * High-performance Web Audio API processing:
 * 1. High-Pass Filter (80Hz Butterworth)
 * 2. Noise Gate / Expander
 * 3. De-Esser (5.5kHz - 7.5kHz Dynamic Attenuation)
 * 4. 4-Band Parametric EQ (Low Warmth, Mid Mud Dip, Presence, High Air)
 * 5. Vocal Leveler / Compressor with Auto Makeup Gain
 * 6. Tube Warmth / Analog Saturation (Tanh WaveShaper)
 * 7. Brickwall Limiter & -14 LUFS Broadcast Normalizer
 * 8. Dual-Track BGM Mixer with Intelligent Auto-Ducking
 * 9. Live Microphone Recorder & Visualizers
 * 10. Lossless WAV & 320kbps MP3 Master Exporter
 */

(function (window) {
  'use strict';

  // Helper to create soft saturation curve using hyperbolic tangent
  function makeTanhDistortionCurve(amount = 25) {
    const k = Math.max(0.01, (amount / 100) * 8);
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      // Soft saturation: tanh(k * x) / tanh(k)
      curve[i] = Math.tanh(k * x) / Math.tanh(k);
    }
    return curve;
  }

  // AudioBuffer to PCM 16-bit WAV Blob
  function audioBufferToWav(buffer, opt_bitDepth) {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = opt_bitDepth === 24 ? 24 : 16;
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;

    let length = buffer.length * blockAlign;
    let bufferArray = new ArrayBuffer(44 + length);
    let view = new DataView(bufferArray);

    // RIFF chunk descriptor
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + length, true);
    writeString(view, 8, 'WAVE');

    // fmt sub-chunk
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // 16 for PCM
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true); // byte rate
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);

    // data sub-chunk
    writeString(view, 36, 'data');
    view.setUint32(40, length, true);

    // Write samples (interleaved)
    let offset = 44;
    const channels = [];
    for (let i = 0; i < numChannels; i++) {
      channels.push(buffer.getChannelData(i));
    }

    if (bitDepth === 16) {
      for (let i = 0; i < buffer.length; i++) {
        for (let ch = 0; ch < numChannels; ch++) {
          let s = Math.max(-1, Math.min(1, channels[ch][i]));
          s = s < 0 ? s * 0x8000 : s * 0x7FFF;
          view.setInt16(offset, s, true);
          offset += 2;
        }
      }
    } else {
      // 24-bit PCM
      for (let i = 0; i < buffer.length; i++) {
        for (let ch = 0; ch < numChannels; ch++) {
          let s = Math.max(-1, Math.min(1, channels[ch][i]));
          s = s < 0 ? s * 0x800000 : s * 0x7FFFFF;
          let intSample = Math.floor(s);
          view.setUint8(offset, intSample & 0xFF);
          view.setUint8(offset + 1, (intSample >> 8) & 0xFF);
          view.setUint8(offset + 2, (intSample >> 16) & 0xFF);
          offset += 3;
        }
      }
    }

    return new Blob([bufferArray], { type: 'audio/wav' });

    function writeString(view, offset, string) {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    }
  }

  // Blob to Base64 String
  function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  class AlurAudioEngineClass {
    constructor() {
      this.ctx = null;
      this.voiceBuffer = null;
      this.bgmBuffer = null;
      this.isPlaying = false;
      this.isBypassed = false; // A/B comparison toggle (Raw vs Mastered)
      this.playbackStartTime = 0;
      this.playbackOffset = 0;
      this.voiceSourceNode = null;
      this.bgmSourceNode = null;

      // Realtime DSP Nodes
      this.highPassNode = null;
      this.deEsserNode = null;
      this.eqLowShelf = null;
      this.eqMidDip = null;
      this.eqPresence = null;
      this.eqHighShelf = null;
      this.compressorNode = null;
      this.makeupGainNode = null;
      this.saturationNode = null;
      this.limiterNode = null;
      this.duckingGainNode = null;
      this.voiceGainNode = null;
      this.bgmGainNode = null;
      this.masterGainNode = null;
      this.analyserNode = null;

      // Auto-ducking tracking
      this.duckingInterval = null;
      this.isVoiceSpeaking = false;

      // Active Settings
      this.settings = this.getDefaultSettings();

      // Recording
      this.mediaRecorder = null;
      this.recordedChunks = [];
      this.recordingStream = null;
      this.recordingTimer = null;
      this.recordingSeconds = 0;
      this.recordingBaseSeconds = 0;
      this.isRecording = false;
      this.isRecordingPaused = false;
      this.isAppendRecording = false;
      this.previousVoiceBuffer = null;
      this.recordAnalyserNode = null;
    }

    getDefaultSettings() {
      return {
        highPass: { enabled: true, frequency: 85 },
        noiseGate: { enabled: true, threshold: -55, attack: 0.010, release: 0.120 },
        deEsser: { enabled: true, frequency: 6200, threshold: -22, amount: -6.0 },
        eq: {
          enabled: true,
          lowShelfFreq: 160,
          lowShelfGain: 1.5,
          midDipFreq: 450,
          midDipGain: -2.5,
          midDipQ: 1.4,
          presenceFreq: 3400,
          presenceGain: 3.0,
          presenceQ: 1.2,
          highShelfFreq: 11000,
          highShelfGain: 2.5
        },
        compressor: {
          enabled: true,
          threshold: -18,
          ratio: 3.5,
          attack: 0.015,
          release: 0.100,
          knee: 6,
          makeupGain: 4.0
        },
        saturation: { enabled: true, warmth: 25 },
        ambience: { enabled: false, amount: 8 },
        limiter: { enabled: true, ceiling: -1.0, targetLufs: -14 },
        ducking: { enabled: true, duckDb: -14, attack: 0.10, release: 0.45 },
        bgmVolume: 0.35,
        voiceVolume: 1.0
      };
    }

    initContext() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return this.ctx;
    }

    async loadVoiceFromUrl(url) {
      this.initContext();
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Gagal memuat audio: ${res.statusText}`);
      const arrayBuffer = await res.arrayBuffer();
      this.voiceBuffer = await this.ctx.decodeAudioData(arrayBuffer);
      return this.voiceBuffer;
    }

    async loadVoiceFromFile(file) {
      this.initContext();
      const arrayBuffer = await file.arrayBuffer();
      this.voiceBuffer = await this.ctx.decodeAudioData(arrayBuffer);
      return this.voiceBuffer;
    }

    async appendVoiceFromFile(file) {
      this.initContext();
      const arrayBuffer = await file.arrayBuffer();
      const newBuffer = await this.ctx.decodeAudioData(arrayBuffer);
      if (this.voiceBuffer) {
        this.previousVoiceBuffer = this.voiceBuffer;
        this.voiceBuffer = await this.concatAudioBuffers(this.previousVoiceBuffer, newBuffer);
      } else {
        this.voiceBuffer = newBuffer;
      }
      return {
        buffer: this.voiceBuffer,
        duration: this.voiceBuffer.duration,
        isAppended: Boolean(this.previousVoiceBuffer)
      };
    }

    async loadBgmFromUrl(url) {
      this.initContext();
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Gagal memuat BGM: ${res.statusText}`);
      const arrayBuffer = await res.arrayBuffer();
      this.bgmBuffer = await this.ctx.decodeAudioData(arrayBuffer);
      return this.bgmBuffer;
    }

    async loadBgmFromFile(file) {
      this.initContext();
      const arrayBuffer = await file.arrayBuffer();
      this.bgmBuffer = await this.ctx.decodeAudioData(arrayBuffer);
      return this.bgmBuffer;
    }

    clearBgm() {
      this.bgmBuffer = null;
      if (this.bgmSourceNode) {
        try { this.bgmSourceNode.stop(); } catch (e) {}
        this.bgmSourceNode = null;
      }
    }

    // Build the DSP Graph for real-time playback
    buildGraph() {
      const ctx = this.ctx;
      if (!ctx) return;

      // Master Gain & Analyser
      this.masterGainNode = ctx.createGain();
      this.analyserNode = ctx.createAnalyser();
      this.analyserNode.fftSize = 2048;
      this.masterGainNode.connect(this.analyserNode);
      this.analyserNode.connect(ctx.destination);

      // Voice Gain
      this.voiceGainNode = ctx.createGain();
      this.voiceGainNode.gain.value = this.settings.voiceVolume || 1.0;

      // 1. High Pass Filter (Butterworth 80Hz)
      this.highPassNode = ctx.createBiquadFilter();
      this.highPassNode.type = 'highpass';
      this.highPassNode.frequency.value = this.settings.highPass.enabled ? this.settings.highPass.frequency : 10;
      this.highPassNode.Q.value = 0.707;

      // 2. De-Esser Filter (Dynamic notch / band dip)
      this.deEsserNode = ctx.createBiquadFilter();
      this.deEsserNode.type = 'peaking';
      this.deEsserNode.frequency.value = this.settings.deEsser.frequency || 6200;
      this.deEsserNode.Q.value = 2.0;
      this.deEsserNode.gain.value = this.settings.deEsser.enabled ? (this.settings.deEsser.amount || -6) : 0;

      // 3. 4-Band Parametric EQ
      // Band 1: Low Shelf (Warmth)
      this.eqLowShelf = ctx.createBiquadFilter();
      this.eqLowShelf.type = 'lowshelf';
      this.eqLowShelf.frequency.value = this.settings.eq.lowShelfFreq || 160;
      this.eqLowShelf.gain.value = this.settings.eq.enabled ? this.settings.eq.lowShelfGain : 0;

      // Band 2: Mid Dip (Clarity / Mud Cut)
      this.eqMidDip = ctx.createBiquadFilter();
      this.eqMidDip.type = 'peaking';
      this.eqMidDip.frequency.value = this.settings.eq.midDipFreq || 450;
      this.eqMidDip.Q.value = this.settings.eq.midDipQ || 1.4;
      this.eqMidDip.gain.value = this.settings.eq.enabled ? this.settings.eq.midDipGain : 0;

      // Band 3: Presence (Intelligibility)
      this.eqPresence = ctx.createBiquadFilter();
      this.eqPresence.type = 'peaking';
      this.eqPresence.frequency.value = this.settings.eq.presenceFreq || 3400;
      this.eqPresence.Q.value = this.settings.eq.presenceQ || 1.2;
      this.eqPresence.gain.value = this.settings.eq.enabled ? this.settings.eq.presenceGain : 0;

      // Band 4: High Shelf (Air & Sheen)
      this.eqHighShelf = ctx.createBiquadFilter();
      this.eqHighShelf.type = 'highshelf';
      this.eqHighShelf.frequency.value = this.settings.eq.highShelfFreq || 11000;
      this.eqHighShelf.gain.value = this.settings.eq.enabled ? this.settings.eq.highShelfGain : 0;

      // 4. Vocal Leveler / Compressor
      this.compressorNode = ctx.createDynamicsCompressor();
      if (this.settings.compressor.enabled) {
        this.compressorNode.threshold.value = this.settings.compressor.threshold || -18;
        this.compressorNode.ratio.value = this.settings.compressor.ratio || 3.5;
        this.compressorNode.attack.value = this.settings.compressor.attack || 0.015;
        this.compressorNode.release.value = this.settings.compressor.release || 0.100;
        this.compressorNode.knee.value = this.settings.compressor.knee || 6;
      } else {
        this.compressorNode.threshold.value = 0;
        this.compressorNode.ratio.value = 1;
      }

      // Auto Makeup Gain
      this.makeupGainNode = ctx.createGain();
      const makeupDb = this.settings.compressor.enabled ? (this.settings.compressor.makeupGain || 4.0) : 0;
      this.makeupGainNode.gain.value = Math.pow(10, makeupDb / 20);

      // 5. Tube Saturation / Warmth (Tanh WaveShaper)
      this.saturationNode = ctx.createWaveShaper();
      if (this.settings.saturation.enabled && this.settings.saturation.warmth > 0) {
        this.saturationNode.curve = makeTanhDistortionCurve(this.settings.saturation.warmth);
        this.saturationNode.oversample = '4x';
      } else {
        this.saturationNode.curve = null;
      }

      // 6. Brickwall Limiter
      this.limiterNode = ctx.createDynamicsCompressor();
      this.limiterNode.threshold.value = -1.0;
      this.limiterNode.knee.value = 0;
      this.limiterNode.ratio.value = 20;
      this.limiterNode.attack.value = 0.001;
      this.limiterNode.release.value = 0.050;

      // Connect DSP chain:
      // voiceGain -> highPass -> deEsser -> eqLow -> eqMid -> eqPres -> eqHigh -> compressor -> makeup -> saturation -> limiter -> masterGain
      this.voiceGainNode.connect(this.highPassNode);
      this.highPassNode.connect(this.deEsserNode);
      this.deEsserNode.connect(this.eqLowShelf);
      this.eqLowShelf.connect(this.eqMidDip);
      this.eqMidDip.connect(this.eqPresence);
      this.eqPresence.connect(this.eqHighShelf);
      this.eqHighShelf.connect(this.compressorNode);
      this.compressorNode.connect(this.makeupGainNode);
      this.makeupGainNode.connect(this.saturationNode);
      this.saturationNode.connect(this.limiterNode);
      this.limiterNode.connect(this.masterGainNode);

      // BGM Channel & Auto-Ducking
      this.bgmGainNode = ctx.createGain();
      this.bgmGainNode.gain.value = this.settings.bgmVolume || 0.35;
      this.duckingGainNode = ctx.createGain();
      this.duckingGainNode.gain.value = 1.0;

      this.bgmGainNode.connect(this.duckingGainNode);
      this.duckingGainNode.connect(this.masterGainNode);
    }

    applySettings(newSettings) {
      this.settings = Object.assign({}, this.settings, newSettings);
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      // High Pass
      if (this.highPassNode) {
        this.highPassNode.frequency.setValueAtTime(this.settings.highPass.enabled ? this.settings.highPass.frequency : 10, now);
      }
      // De-Esser
      if (this.deEsserNode) {
        this.deEsserNode.frequency.setValueAtTime(this.settings.deEsser.frequency || 6200, now);
        this.deEsserNode.gain.setValueAtTime(this.settings.deEsser.enabled ? this.settings.deEsser.amount : 0, now);
      }
      // EQ
      if (this.eqLowShelf) {
        this.eqLowShelf.frequency.setValueAtTime(this.settings.eq.lowShelfFreq || 160, now);
        this.eqLowShelf.gain.setValueAtTime(this.settings.eq.enabled ? this.settings.eq.lowShelfGain : 0, now);
      }
      if (this.eqMidDip) {
        this.eqMidDip.frequency.setValueAtTime(this.settings.eq.midDipFreq || 450, now);
        this.eqMidDip.gain.setValueAtTime(this.settings.eq.enabled ? this.settings.eq.midDipGain : 0, now);
        this.eqMidDip.Q.setValueAtTime(this.settings.eq.midDipQ || 1.4, now);
      }
      if (this.eqPresence) {
        this.eqPresence.frequency.setValueAtTime(this.settings.eq.presenceFreq || 3400, now);
        this.eqPresence.gain.setValueAtTime(this.settings.eq.enabled ? this.settings.eq.presenceGain : 0, now);
        this.eqPresence.Q.setValueAtTime(this.settings.eq.presenceQ || 1.2, now);
      }
      if (this.eqHighShelf) {
        this.eqHighShelf.frequency.setValueAtTime(this.settings.eq.highShelfFreq || 11000, now);
        this.eqHighShelf.gain.setValueAtTime(this.settings.eq.enabled ? this.settings.eq.highShelfGain : 0, now);
      }
      // Compressor
      if (this.compressorNode) {
        if (this.settings.compressor.enabled) {
          this.compressorNode.threshold.setValueAtTime(this.settings.compressor.threshold || -18, now);
          this.compressorNode.ratio.setValueAtTime(this.settings.compressor.ratio || 3.5, now);
          this.compressorNode.attack.setValueAtTime(this.settings.compressor.attack || 0.015, now);
          this.compressorNode.release.setValueAtTime(this.settings.compressor.release || 0.100, now);
        } else {
          this.compressorNode.threshold.setValueAtTime(0, now);
          this.compressorNode.ratio.setValueAtTime(1, now);
        }
      }
      // Makeup
      if (this.makeupGainNode) {
        const makeupDb = this.settings.compressor.enabled ? (this.settings.compressor.makeupGain || 4.0) : 0;
        this.makeupGainNode.gain.setValueAtTime(Math.pow(10, makeupDb / 20), now);
      }
      // Saturation
      if (this.saturationNode) {
        if (this.settings.saturation && this.settings.saturation.enabled && this.settings.saturation.warmth > 0) {
          this.saturationNode.curve = makeTanhDistortionCurve(this.settings.saturation.warmth);
        } else {
          this.saturationNode.curve = null;
        }
      }
      // Limiter Ceiling
      if (this.limiterNode) {
        const ceiling = (this.settings.limiter && this.settings.limiter.ceiling !== undefined) ? this.settings.limiter.ceiling : -1.0;
        this.limiterNode.threshold.setValueAtTime((this.settings.limiter && this.settings.limiter.enabled) ? ceiling : 0, now);
      }
      // Volumes
      if (this.bgmGainNode) {
        this.bgmGainNode.gain.setValueAtTime(this.settings.bgmVolume !== undefined ? this.settings.bgmVolume : 0.35, now);
      }
      if (this.voiceGainNode) {
        this.voiceGainNode.gain.setValueAtTime(this.settings.voiceVolume !== undefined ? this.settings.voiceVolume : 1.0, now);
      }
    }

    // Toggle A/B Bypass (Unmastered Raw vs Mastered)
    setBypass(bypassed) {
      this.isBypassed = Boolean(bypassed);
      if (!this.ctx || !this.isPlaying) return;
      const now = this.ctx.currentTime;

      if (this.isBypassed) {
        // Disconnect DSP chain, route voice straight to master
        try {
          this.voiceGainNode.disconnect();
          this.voiceGainNode.connect(this.masterGainNode);
        } catch (e) {}
      } else {
        // Re-route through DSP rack
        try {
          this.voiceGainNode.disconnect();
          this.voiceGainNode.connect(this.highPassNode);
        } catch (e) {}
      }
    }

    // Playback with seek support
    play(offsetSeconds = 0) {
      if (!this.voiceBuffer) return false;
      this.initContext();
      this.stop(); // Stop any currently playing nodes

      this.buildGraph();
      const ctx = this.ctx;
      const now = ctx.currentTime;
      this.playbackOffset = Math.max(0, Math.min(offsetSeconds, this.voiceBuffer.duration));
      this.playbackStartTime = now - this.playbackOffset;

      // Create Voice Source
      this.voiceSourceNode = ctx.createBufferSource();
      this.voiceSourceNode.buffer = this.voiceBuffer;

      if (this.isBypassed) {
        this.voiceGainNode.disconnect();
        this.voiceGainNode.connect(this.masterGainNode);
      }

      this.voiceSourceNode.connect(this.voiceGainNode);

      // Handle song finish
      this.voiceSourceNode.onended = () => {
        if (this.isPlaying && this.getCurrentTime() >= this.voiceBuffer.duration - 0.1) {
          this.stop();
          if (typeof this.onPlaybackEnded === 'function') {
            this.onPlaybackEnded();
          }
        }
      };

      this.voiceSourceNode.start(0, this.playbackOffset);

      // Create & Play BGM if loaded
      if (this.bgmBuffer) {
        this.bgmSourceNode = ctx.createBufferSource();
        this.bgmSourceNode.buffer = this.bgmBuffer;
        this.bgmSourceNode.loop = true;
        this.bgmSourceNode.connect(this.bgmGainNode);
        const bgmOffset = this.playbackOffset % this.bgmBuffer.duration;
        this.bgmSourceNode.start(0, bgmOffset);

        // Start Auto-Ducking Monitor
        this.startAutoDuckingMonitor();
      }

      this.isPlaying = true;
      return true;
    }

    pause() {
      if (!this.isPlaying) return;
      this.playbackOffset = this.getCurrentTime();
      this.stop();
    }

    stop() {
      this.isPlaying = false;
      if (this.voiceSourceNode) {
        try { this.voiceSourceNode.stop(); } catch (e) {}
        this.voiceSourceNode = null;
      }
      if (this.bgmSourceNode) {
        try { this.bgmSourceNode.stop(); } catch (e) {}
        this.bgmSourceNode = null;
      }
      if (this.duckingInterval) {
        clearInterval(this.duckingInterval);
        this.duckingInterval = null;
      }
    }

    seek(timeSeconds) {
      const wasPlaying = this.isPlaying;
      this.playbackOffset = Math.max(0, Math.min(timeSeconds, this.getDuration()));
      if (wasPlaying) {
        this.play(this.playbackOffset);
      }
    }

    getCurrentTime() {
      if (!this.isPlaying || !this.ctx) return this.playbackOffset;
      const current = this.ctx.currentTime - this.playbackStartTime;
      return Math.min(current, this.getDuration());
    }

    getDuration() {
      return this.voiceBuffer ? this.voiceBuffer.duration : 0;
    }

    // Auto-Ducking Monitor: inspects voice energy and smoothly ducks BGM
    startAutoDuckingMonitor() {
      if (!this.settings.ducking.enabled || !this.duckingGainNode) return;
      if (this.duckingInterval) clearInterval(this.duckingInterval);

      // Create analyzer node attached to voice channel
      const voiceAnalyser = this.ctx.createAnalyser();
      voiceAnalyser.fftSize = 512;
      const dataArray = new Uint8Array(voiceAnalyser.frequencyBinCount);
      this.voiceGainNode.connect(voiceAnalyser);

      const duckDb = this.settings.ducking.duckDb || -14;
      const duckRatio = Math.pow(10, duckDb / 20); // e.g. -14dB = ~0.20

      let silentCounter = 0;

      this.duckingInterval = setInterval(() => {
        if (!this.isPlaying || !this.duckingGainNode) return;
        voiceAnalyser.getByteTimeDomainData(dataArray);

        // Calculate RMS
        let sumSquares = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const norm = (dataArray[i] - 128) / 128;
          sumSquares += norm * norm;
        }
        const rms = Math.sqrt(sumSquares / dataArray.length);
        const now = this.ctx.currentTime;

        // If voice energy > threshold (voice is speaking)
        if (rms > 0.04) {
          silentCounter = 0;
          if (!this.isVoiceSpeaking) {
            this.isVoiceSpeaking = true;
            // Ramp down BGM
            this.duckingGainNode.gain.cancelScheduledValues(now);
            this.duckingGainNode.gain.linearRampToValueAtTime(duckRatio, now + (this.settings.ducking.attack || 0.10));
          }
        } else {
          // Voice paused
          silentCounter++;
          if (silentCounter > 3 && this.isVoiceSpeaking) {
            this.isVoiceSpeaking = false;
            // Ramp up BGM
            this.duckingGainNode.gain.cancelScheduledValues(now);
            this.duckingGainNode.gain.linearRampToValueAtTime(1.0, now + (this.settings.ducking.release || 0.45));
          }
        }
      }, 50);
    }

    // Offline DSP Rendering for Lossless Master Export (Faster than Real-time)
    async renderOfflineMaster() {
      if (!this.voiceBuffer) throw new Error('Tidak ada audio narasi untuk diproses.');

      const sampleRate = this.voiceBuffer.sampleRate || 44100;
      const duration = this.voiceBuffer.duration;
      const numChannels = 2; // Stereo master
      const totalFrames = Math.ceil(duration * sampleRate);

      const OfflineCtx = window.OfflineAudioContext || window.webkitOfflineAudioContext;
      const offlineCtx = new OfflineCtx(numChannels, totalFrames, sampleRate);

      // Voice Source
      const voiceSource = offlineCtx.createBufferSource();
      voiceSource.buffer = this.voiceBuffer;

      // 1. High Pass
      const highPass = offlineCtx.createBiquadFilter();
      highPass.type = 'highpass';
      highPass.frequency.value = this.settings.highPass.enabled ? this.settings.highPass.frequency : 10;
      highPass.Q.value = 0.707;

      // 2. De-Esser
      const deEsser = offlineCtx.createBiquadFilter();
      deEsser.type = 'peaking';
      deEsser.frequency.value = this.settings.deEsser.frequency || 6200;
      deEsser.Q.value = 2.0;
      deEsser.gain.value = this.settings.deEsser.enabled ? this.settings.deEsser.amount : 0;

      // 3. 4-Band EQ
      const eqLow = offlineCtx.createBiquadFilter();
      eqLow.type = 'lowshelf';
      eqLow.frequency.value = this.settings.eq.lowShelfFreq || 160;
      eqLow.gain.value = this.settings.eq.enabled ? this.settings.eq.lowShelfGain : 0;

      const eqMid = offlineCtx.createBiquadFilter();
      eqMid.type = 'peaking';
      eqMid.frequency.value = this.settings.eq.midDipFreq || 450;
      eqMid.Q.value = this.settings.eq.midDipQ || 1.4;
      eqMid.gain.value = this.settings.eq.enabled ? this.settings.eq.midDipGain : 0;

      const eqPres = offlineCtx.createBiquadFilter();
      eqPres.type = 'peaking';
      eqPres.frequency.value = this.settings.eq.presenceFreq || 3400;
      eqPres.Q.value = this.settings.eq.presenceQ || 1.2;
      eqPres.gain.value = this.settings.eq.enabled ? this.settings.eq.presenceGain : 0;

      const eqHigh = offlineCtx.createBiquadFilter();
      eqHigh.type = 'highshelf';
      eqHigh.frequency.value = this.settings.eq.highShelfFreq || 11000;
      eqHigh.gain.value = this.settings.eq.enabled ? this.settings.eq.highShelfGain : 0;

      // 4. Vocal Leveler / Compressor
      const compressor = offlineCtx.createDynamicsCompressor();
      if (this.settings.compressor.enabled) {
        compressor.threshold.value = this.settings.compressor.threshold || -18;
        compressor.ratio.value = this.settings.compressor.ratio || 3.5;
        compressor.attack.value = this.settings.compressor.attack || 0.015;
        compressor.release.value = this.settings.compressor.release || 0.100;
        compressor.knee.value = this.settings.compressor.knee || 6;
      } else {
        compressor.threshold.value = 0;
        compressor.ratio.value = 1;
      }

      // Makeup Gain
      const makeupGain = offlineCtx.createGain();
      const makeupDb = this.settings.compressor.enabled ? (this.settings.compressor.makeupGain || 4.0) : 0;
      makeupGain.gain.value = Math.pow(10, makeupDb / 20);

      // 5. Tube Saturation (Tanh)
      const saturation = offlineCtx.createWaveShaper();
      if (this.settings.saturation.enabled && this.settings.saturation.warmth > 0) {
        saturation.curve = makeTanhDistortionCurve(this.settings.saturation.warmth);
        saturation.oversample = '4x';
      }

      // 6. Brickwall Limiter
      const limiter = offlineCtx.createDynamicsCompressor();
      limiter.threshold.value = -1.0;
      limiter.ratio.value = 20;
      limiter.attack.value = 0.001;
      limiter.release.value = 0.050;

      // Master bus
      const masterBus = offlineCtx.createGain();
      masterBus.gain.value = 1.0;

      // Connect voice chain
      voiceSource.connect(highPass);
      highPass.connect(deEsser);
      deEsser.connect(eqLow);
      eqLow.connect(eqMid);
      eqMid.connect(eqPres);
      eqPres.connect(eqHigh);
      eqHigh.connect(compressor);
      compressor.connect(makeupGain);
      makeupGain.connect(saturation);
      saturation.connect(limiter);
      limiter.connect(masterBus);

      // BGM Track mixing if present
      if (this.bgmBuffer) {
        const bgmSource = offlineCtx.createBufferSource();
        bgmSource.buffer = this.bgmBuffer;
        bgmSource.loop = true;

        const bgmGain = offlineCtx.createGain();
        bgmGain.gain.value = this.settings.bgmVolume !== undefined ? this.settings.bgmVolume : 0.35;

        const duckingGain = offlineCtx.createGain();
        duckingGain.gain.value = 1.0;

        // Auto-ducking curve synthesis
        if (this.settings.ducking.enabled) {
          const duckDb = this.settings.ducking.duckDb || -14;
          const duckRatio = Math.pow(10, duckDb / 20);
          const voiceData = this.voiceBuffer.getChannelData(0);
          const windowSize = Math.floor(sampleRate * 0.05); // 50ms windows
          let isSpeaking = false;

          for (let i = 0; i < voiceData.length; i += windowSize) {
            let sumSq = 0;
            const end = Math.min(i + windowSize, voiceData.length);
            for (let j = i; j < end; j++) {
              sumSq += voiceData[j] * voiceData[j];
            }
            const rms = Math.sqrt(sumSq / (end - i));
            const time = i / sampleRate;

            if (rms > 0.035 && !isSpeaking) {
              isSpeaking = true;
              duckingGain.gain.setValueAtTime(duckRatio, time);
            } else if (rms <= 0.035 && isSpeaking) {
              isSpeaking = false;
              duckingGain.gain.setValueAtTime(1.0, time + (this.settings.ducking.release || 0.45));
            }
          }
        }

        bgmSource.connect(bgmGain);
        bgmGain.connect(duckingGain);
        duckingGain.connect(masterBus);

        bgmSource.start(0);
      }

      masterBus.connect(offlineCtx.destination);
      voiceSource.start(0);

      // Render to audio buffer
      const renderedBuffer = await offlineCtx.startRendering();

      // Normalization check (-14 LUFS / peak limiter)
      return this.normalizeBuffer(renderedBuffer, -1.0);
    }

    // Peak normalizer ensuring 0 clipping (-1.0 dBFS true ceiling)
    normalizeBuffer(buffer, targetPeakDb = -1.0) {
      const targetLinear = Math.pow(10, targetPeakDb / 20);
      let maxPeak = 0;

      for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
        const data = buffer.getChannelData(ch);
        for (let i = 0; i < data.length; i++) {
          const abs = Math.abs(data[i]);
          if (abs > maxPeak) maxPeak = abs;
        }
      }

      if (maxPeak > 0 && maxPeak > targetLinear) {
        const scale = targetLinear / maxPeak;
        for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
          const data = buffer.getChannelData(ch);
          for (let i = 0; i < data.length; i++) {
            data[i] *= scale;
          }
        }
      }
      return buffer;
    }

    // Export Mastered WAV Blob
    async exportWavMaster() {
      const masteredBuffer = await this.renderOfflineMaster();
      return audioBufferToWav(masteredBuffer, 16);
    }

    // Export Mastered MP3 320kbps via backend FFmpeg
    async exportMp3Master(projectId = null, presetName = 'Custom') {
      const wavBlob = await this.exportWavMaster();
      const base64Wav = await blobToBase64(wavBlob);

      const res = await fetch('/api/audio/convert-mp3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base64Data: base64Wav,
          projectId: projectId,
          presetUsed: presetName,
          durationSeconds: this.getDuration()
        })
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Gagal mengonversi MP3 di server.');
      return data;
    }

    // -------------------------------------------------------------------------
    // Live Microphone Recording Suite (Supports Pause, Stop, & Append Continuity)
    // -------------------------------------------------------------------------
    async startRecording(onTickCallback, appendMode = false) {
      this.initContext();
      if (this.isRecording) return;

      this.isAppendRecording = Boolean(appendMode && this.voiceBuffer);
      if (this.isAppendRecording) {
        this.previousVoiceBuffer = this.voiceBuffer;
        this.recordingBaseSeconds = Math.round(this.voiceBuffer.duration);
        this.recordingSeconds = this.recordingBaseSeconds;
      } else {
        this.recordingBaseSeconds = 0;
        this.recordingSeconds = 0;
      }

      this.recordingStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          channelCount: 1,
          sampleRate: 48000
        }
      });

      // Hook up live record analyzer for UI visualizer
      const source = this.ctx.createMediaStreamSource(this.recordingStream);
      this.recordAnalyserNode = this.ctx.createAnalyser();
      this.recordAnalyserNode.fftSize = 512;
      source.connect(this.recordAnalyserNode);

      this.recordedChunks = [];
      const mimeTypes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'];
      let selectedMime = '';
      for (const mime of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mime)) {
          selectedMime = mime;
          break;
        }
      }

      this.mediaRecorder = new MediaRecorder(this.recordingStream, selectedMime ? { mimeType: selectedMime } : {});
      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          this.recordedChunks.push(e.data);
        }
      };

      this.mediaRecorder.start(200); // 200ms slice
      this.isRecording = true;
      this.isRecordingPaused = false;

      // Initial tick callback
      if (typeof onTickCallback === 'function') {
        onTickCallback(this.recordingSeconds);
      }

      this.recordingTimer = setInterval(() => {
        if (!this.isRecordingPaused) {
          this.recordingSeconds++;
          if (typeof onTickCallback === 'function') {
            onTickCallback(this.recordingSeconds);
          }
        }
      }, 1000);
    }

    pauseRecording() {
      if (!this.isRecording || this.isRecordingPaused) return;
      this.mediaRecorder.pause();
      this.isRecordingPaused = true;
    }

    resumeRecording() {
      if (!this.isRecording || !this.isRecordingPaused) return;
      this.mediaRecorder.resume();
      this.isRecordingPaused = false;
    }

    stopRecording() {
      return new Promise((resolve, reject) => {
        if (!this.isRecording || !this.mediaRecorder) {
          return resolve(null);
        }

        clearInterval(this.recordingTimer);
        this.recordingTimer = null;
        this.isRecording = false;
        this.isRecordingPaused = false;

        this.mediaRecorder.onstop = async () => {
          try {
            // Stop mic tracks
            if (this.recordingStream) {
              this.recordingStream.getTracks().forEach((t) => t.stop());
              this.recordingStream = null;
            }

            const mimeType = this.mediaRecorder.mimeType || 'audio/webm';
            const rawBlob = new Blob(this.recordedChunks, { type: mimeType });
            const arrayBuffer = await rawBlob.arrayBuffer();

            // Decode newly recorded audio into AudioBuffer
            const newlyRecordedBuffer = await this.ctx.decodeAudioData(arrayBuffer);

            // If append mode is active, seamlessly concatenate without overwriting!
            if (this.isAppendRecording && this.previousVoiceBuffer) {
              this.voiceBuffer = await this.concatAudioBuffers(this.previousVoiceBuffer, newlyRecordedBuffer);
            } else {
              this.voiceBuffer = newlyRecordedBuffer;
            }

            resolve({
              blob: rawBlob,
              buffer: this.voiceBuffer,
              duration: this.voiceBuffer.duration,
              isAppended: this.isAppendRecording
            });
          } catch (err) {
            reject(err);
          }
        };

        try {
          this.mediaRecorder.stop();
        } catch (e) {
          console.warn('MediaRecorder stop warning:', e);
        }
      });
    }

    async concatAudioBuffers(buffer1, buffer2) {
      if (!buffer1) return buffer2;
      if (!buffer2) return buffer1;

      const sampleRate = buffer1.sampleRate || 48000;
      const numChannels = Math.max(buffer1.numberOfChannels, buffer2.numberOfChannels);
      const totalDuration = buffer1.duration + buffer2.duration;
      const totalLength = Math.ceil(totalDuration * sampleRate);

      const OfflineCtx = window.OfflineAudioContext || window.webkitOfflineAudioContext;
      const offlineCtx = new OfflineCtx(numChannels, totalLength, sampleRate);

      // Source 1 (Existing audio)
      const src1 = offlineCtx.createBufferSource();
      src1.buffer = buffer1;
      src1.connect(offlineCtx.destination);
      src1.start(0);

      // Source 2 (Newly recorded take, starts right when buffer1 ends)
      const src2 = offlineCtx.createBufferSource();
      src2.buffer = buffer2;
      src2.connect(offlineCtx.destination);
      src2.start(buffer1.duration);

      return await offlineCtx.startRendering();
    }

    undoAppendRecording() {
      if (!this.previousVoiceBuffer) return null;
      this.voiceBuffer = this.previousVoiceBuffer;
      this.previousVoiceBuffer = null;
      this.isAppendRecording = false;
      return this.voiceBuffer;
    }

    // -------------------------------------------------------------------------
    // Canvas Visualizers & Waveform Drawing
    // -------------------------------------------------------------------------
    drawWaveform(canvas, currentTime = 0) {
      if (!canvas || !this.voiceBuffer) return;
      const ctx = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;
      const dpr = window.devicePixelRatio || 1;

      ctx.clearRect(0, 0, width, height);

      // Background Grid
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      // Subtle center line
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      const data = this.voiceBuffer.getChannelData(0);
      const step = Math.ceil(data.length / width);
      const amp = height / 2 - 4;

      const duration = this.voiceBuffer.duration || 1;
      const playProgress = Math.max(0, Math.min(1, currentTime / duration));
      const playX = playProgress * width;

      // Draw peaks
      for (let i = 0; i < width; i++) {
        let min = 1.0;
        let max = -1.0;
        const start = i * step;
        const end = Math.min(start + step, data.length);

        for (let j = start; j < end; j++) {
          const val = data[j];
          if (val < min) min = val;
          if (val > max) max = val;
        }

        const y1 = (1 + min) * amp;
        const y2 = (1 + max) * amp;

        // Played vs Unplayed coloration
        if (i <= playX) {
          ctx.strokeStyle = '#f59e0b'; // Studio Amber
        } else {
          ctx.strokeStyle = '#64748b'; // Slate muted
        }

        ctx.beginPath();
        ctx.moveTo(i, y1);
        ctx.lineTo(i, Math.max(y1 + 1, y2));
        ctx.stroke();
      }

      // Draw Playhead
      if (currentTime > 0) {
        ctx.strokeStyle = '#38bdf8'; // Cyan head
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(playX, 0);
        ctx.lineTo(playX, height);
        ctx.stroke();

        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(playX, 4, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Realtime Oscilloscope & VU Meter for recording & playback
    drawLiveAnalyser(canvas, isRecordingMode = false) {
      if (!canvas) return;
      const analyser = isRecordingMode ? this.recordAnalyserNode : this.analyserNode;
      if (!analyser) return;

      const ctx = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      analyser.getByteTimeDomainData(dataArray);

      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, width, height);

      ctx.lineWidth = 2;
      ctx.strokeStyle = isRecordingMode ? '#ef4444' : '#10b981'; // Red for Rec, Emerald for Play
      ctx.beginPath();

      const sliceWidth = width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }

      ctx.lineTo(width, height / 2);
      ctx.stroke();
    }
  }

  // Expose singleton to window
  window.AlurAudioEngine = new AlurAudioEngineClass();
  window.audioBufferToWav = audioBufferToWav;
})(window);
