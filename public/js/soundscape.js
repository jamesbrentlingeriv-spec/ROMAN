// Web Audio API Soundscape for "A Roman Witness"
// Synthesizes atmospheric sounds without external audio file dependencies

class AncientSoundscape {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.volume = 0.3;
    this.windNode = null;
    this.gainNode = null;
    this.intervals = [];
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContext();
    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    this.gainNode.connect(this.ctx.destination);
  }

  start() {
    this.init();
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.isPlaying = true;
    this.startWind();
    this.scheduleAtmosphere();
  }

  stop() {
    this.isPlaying = false;
    if (this.windNode) {
      try { this.windNode.stop(); } catch(e) {}
      this.windNode = null;
    }
    this.intervals.forEach(id => clearInterval(id));
    this.intervals = [];
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  // Generates desert wind using filtered pink/brown noise
  startWind() {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filter to sound like low desert wind
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(260, this.ctx.currentTime);
    filter.Q.setValueAtTime(1.5, this.ctx.currentTime);

    // Subtle LFO modulation on wind frequency
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime);
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(80, this.ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const windGain = this.ctx.createGain();
    windGain.gain.setValueAtTime(0.25, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(windGain);
    windGain.connect(this.gainNode);

    whiteNoise.start(0);
    lfo.start(0);
    this.windNode = whiteNoise;
  }

  // Periodic ancient resonant bell / cymbal / horn chime
  playTempleChime() {
    if (!this.ctx || !this.isPlaying) return;
    const now = this.ctx.currentTime;
    
    // Fundamental and overtone frequencies
    const freqs = [216, 432, 648, 864];
    const chimeGain = this.ctx.createGain();
    chimeGain.gain.setValueAtTime(0, now);
    chimeGain.gain.linearRampToValueAtTime(0.18, now + 0.04);
    chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 4.5);
    chimeGain.connect(this.gainNode);

    freqs.forEach((f, idx) => {
      const osc = this.ctx.createOscillator();
      osc.type = idx === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(f + (Math.random() * 2 - 1), now);
      osc.connect(chimeGain);
      osc.start(now);
      osc.stop(now + 4.6);
    });
  }

  // Ancient lyre pluck
  playLyrePluck(freq = 293.66) { // D4 default
    if (!this.ctx || !this.isPlaying) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const pluckGain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    pluckGain.gain.setValueAtTime(0, now);
    pluckGain.gain.linearRampToValueAtTime(0.15, now + 0.015);
    pluckGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, now);
    filter.frequency.exponentialRampToValueAtTime(300, now + 2.0);

    osc.connect(filter);
    filter.connect(pluckGain);
    pluckGain.connect(this.gainNode);

    osc.start(now);
    osc.stop(now + 2.3);
  }

  scheduleAtmosphere() {
    // Occasional gentle lyre melody
    const lyreScale = [220, 246.94, 261.63, 293.66, 329.63, 349.23, 392, 440];
    
    const bellInterval = setInterval(() => {
      if (this.isPlaying && Math.random() > 0.35) {
        this.playTempleChime();
      }
    }, 11000);

    const lyreInterval = setInterval(() => {
      if (this.isPlaying && Math.random() > 0.4) {
        const note = lyreScale[Math.floor(Math.random() * lyreScale.length)];
        this.playLyrePluck(note);
        setTimeout(() => {
          if (this.isPlaying) {
            const nextNote = lyreScale[Math.floor(Math.random() * lyreScale.length)];
            this.playLyrePluck(nextNote);
          }
        }, 380);
      }
    }, 7000);

    this.intervals.push(bellInterval, lyreInterval);
  }
}

export const soundscape = new AncientSoundscape();
