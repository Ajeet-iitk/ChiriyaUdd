/* ==========================================================================
   Sound — a small synthesised baithak.
   Tanpura drone, santoor plucks in Bhairavi, tabla ticks, and hand-made FX.
   No audio files, no libraries.
   ========================================================================== */

const SCALE = [293.66, 311.13, 349.23, 392.0, 415.3, 466.16, 523.25, 587.33]; // D Bhairavi
const PAD_CHORDS = [
  [146.83, 220.0, 293.66],   // D
  [116.54, 174.61, 233.08],  // Bb
  [98.0, 146.83, 196.0],     // G
  [110.0, 164.81, 261.63],   // A
];

export class Sound {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.musicBus = null;
    this.sfxBus = null;
    this.reverb = null;
    this.analyser = null;
    this.noise = null;
    this.musicOn = true;
    this.sfxOn = true;
    this.musicVol = 0.38;
    this.sfxVol = 0.72;
    this.started = false;
    this._timer = null;
    this._next = 0;
    this._step = 0;
    this._padAt = 0;
    this._duck = false;
    this._raf = null;
    this._hidden = false;

    document.addEventListener("visibilitychange", () => {
      this._hidden = document.hidden;
      if(!this.ctx) return;
      if(this._hidden){ this._stopScheduler(); }
      else if(this.started){ this._next = this.ctx.currentTime + 0.1; this._startScheduler(); }
    });
  }

  /* ---------- setup ---------- */
  ensure(){
    if(this.ctx) { if(this.ctx.state === "suspended") this.ctx.resume(); return this.ctx; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if(!AC) return null;
    const ctx = this.ctx = new AC();

    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.knee.value = 24;
    comp.ratio.value = 3;
    comp.attack.value = 0.006;
    comp.release.value = 0.28;

    this.master = ctx.createGain();
    this.master.gain.value = 0.9;

    this.analyser = ctx.createAnalyser();
    this.analyser.fftSize = 256;
    this.analyser.smoothingTimeConstant = 0.82;

    this.musicBus = ctx.createGain();
    this.musicBus.gain.value = this.musicOn ? this.musicVol : 0;
    this.sfxBus = ctx.createGain();
    this.sfxBus.gain.value = this.sfxOn ? this.sfxVol : 0;

    // a small room
    const conv = ctx.createConvolver();
    conv.buffer = this._impulse(2.1, 2.6);
    const wet = ctx.createGain();
    wet.gain.value = 0.26;
    const wetMusic = ctx.createGain();
    wetMusic.gain.value = 0.34;

    this.musicBus.connect(comp);
    this.musicBus.connect(wetMusic).connect(conv);
    this.sfxBus.connect(comp);
    this.sfxBus.connect(wet).connect(conv);
    conv.connect(comp);
    comp.connect(this.analyser);
    this.analyser.connect(this.master);
    this.master.connect(ctx.destination);

    this.noise = this._noise(2);
    this.started = false;
    return ctx;
  }

  _impulse(seconds, decay){
    const ctx = this.ctx, rate = ctx.sampleRate, len = Math.floor(rate * seconds);
    const buf = ctx.createBuffer(2, len, rate);
    for(let ch = 0; ch < 2; ch++){
      const d = buf.getChannelData(ch);
      for(let i = 0; i < len; i++){
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
      }
    }
    return buf;
  }

  _noise(seconds){
    const ctx = this.ctx, rate = ctx.sampleRate, len = Math.floor(rate * seconds);
    const buf = ctx.createBuffer(1, len, rate);
    const d = buf.getChannelData(0);
    for(let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }

  /* ---------- controls ---------- */
  setMusic(on){
    this.musicOn = on;
    if(!this.ctx) return;
    this.musicBus.gain.setTargetAtTime(on ? (this._duck ? this.musicVol * 0.35 : this.musicVol) : 0, this.ctx.currentTime, 0.25);
    if(on && !this.started && this.ctx.state === "running") this.startMusic();
  }
  setSfx(on){
    this.sfxOn = on;
    if(this.ctx) this.sfxBus.gain.setTargetAtTime(on ? this.sfxVol : 0, this.ctx.currentTime, 0.1);
  }
  setMusicVol(v){
    this.musicVol = Math.max(0, Math.min(1, v));
    if(this.ctx && this.musicOn) this.musicBus.gain.setTargetAtTime(this._duck ? this.musicVol * 0.35 : this.musicVol, this.ctx.currentTime, 0.12);
  }
  setSfxVol(v){
    this.sfxVol = Math.max(0, Math.min(1, v));
    if(this.ctx && this.sfxOn) this.sfxBus.gain.setTargetAtTime(this.sfxVol, this.ctx.currentTime, 0.12);
  }
  duck(on){
    this._duck = on;
    if(!this.ctx || !this.musicOn) return;
    this.musicBus.gain.setTargetAtTime(on ? this.musicVol * 0.32 : this.musicVol, this.ctx.currentTime, 0.4);
  }

  /* ---------- music ---------- */
  startMusic(){
    const ctx = this.ensure();
    if(!ctx) return;
    if(this.started) return;
    this.started = true;
    this._next = ctx.currentTime + 0.12;
    this._step = 0;
    this._padAt = ctx.currentTime;
    this._startScheduler();
    this._drone();
  }
  stopMusic(){
    this.started = false;
    this._stopScheduler();
    if(this.ctx && this.musicBus){
      const t = this.ctx.currentTime;
      this.musicBus.gain.cancelScheduledValues(t);
      this.musicBus.gain.setTargetAtTime(0, t, 0.3);
    }
  }
  _startScheduler(){
    this._stopScheduler();
    this._timer = setInterval(() => this._scheduler(), 80);
  }
  _stopScheduler(){
    if(this._timer){ clearInterval(this._timer); this._timer = null; }
  }

  _scheduler(){
    if(!this.ctx || this._hidden) return;
    const stepDur = 60 / 76 / 2; // eighth notes at 76bpm
    while(this._next < this.ctx.currentTime + 0.5){
      this._playStep(this._step, this._next, stepDur);
      this._next += stepDur;
      this._step = (this._step + 1) % 64;
    }
  }

  _playStep(step, t, dur){
    const bar = Math.floor(step / 8) % 8;
    // pluck melody
    const density = 0.34;
    if(Math.random() < density){
      const note = SCALE[Math.floor(Math.random() * SCALE.length)];
      this.pluck(note, t, 0.05 + Math.random() * 0.035, 1.5);
      if(Math.random() < 0.22) this.pluck(note * 2, t + 0.06, 0.018, 1.1);
    }
    // a rare low answer
    if(step % 16 === 0) this.pluck(SCALE[0] / 2, t, 0.045, 2.2);
    // tabla-ish pulse on 1 and 5
    if(step % 8 === 0) this.thump(t, 0.055, 118);
    if(step % 8 === 4) this.tick(t, 0.02);
    // pad every two bars
    if(step % 16 === 0){
      const chord = PAD_CHORDS[Math.floor(step / 16) % PAD_CHORDS.length];
      this.pad(chord, t, dur * 16);
    }
  }

  _drone(){
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const freqs = [73.42, 110.0, 146.83];
    const g = ctx.createGain();
    g.gain.value = 0.0;
    g.gain.setTargetAtTime(0.035, t, 2.2);
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass"; lp.frequency.value = 720; lp.Q.value = 0.4;
    g.connect(lp).connect(this.musicBus);
    freqs.forEach((f, i) => {
      const o = ctx.createOscillator();
      o.type = i === 0 ? "sine" : "triangle";
      o.frequency.value = f;
      o.detune.value = (i - 1) * 4;
      const og = ctx.createGain();
      og.gain.value = i === 0 ? 0.6 : 0.22;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.06 + i * 0.021;
      const lg = ctx.createGain();
      lg.gain.value = 0.12;
      lfo.connect(lg).connect(og.gain);
      o.connect(og).connect(g);
      o.start(t); lfo.start(t);
    });
    this._droneGain = g;
  }

  pad(freqs, t, dur){
    const ctx = this.ctx;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.032, t + dur * 0.35);
    g.gain.linearRampToValueAtTime(0, t + dur);
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass"; lp.frequency.value = 900; lp.Q.value = 0.7;
    g.connect(lp).connect(this.musicBus);
    freqs.forEach((f, i) => {
      const o = ctx.createOscillator();
      o.type = i === 0 ? "triangle" : "sine";
      o.frequency.value = f;
      o.detune.value = (i - 1) * 6;
      const og = ctx.createGain();
      og.gain.value = i === 0 ? 0.7 : 0.4;
      o.connect(og).connect(g);
      o.start(t); o.stop(t + dur + 0.1);
    });
  }

  pluck(freq, t, gain = 0.05, decay = 1.6, bus = this.musicBus){
    if(!this.ctx) return;
    const ctx = this.ctx;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
    const bp = ctx.createBiquadFilter();
    bp.type = "lowpass"; bp.frequency.setValueAtTime(4200, t); bp.frequency.exponentialRampToValueAtTime(900, t + decay * 0.7); bp.Q.value = 0.8;
    g.connect(bp).connect(bus);
    const o1 = ctx.createOscillator(); o1.type = "triangle"; o1.frequency.value = freq;
    const o2 = ctx.createOscillator(); o2.type = "sine"; o2.frequency.value = freq * 2.001;
    const g2 = ctx.createGain(); g2.gain.value = 0.28;
    o1.connect(g); o2.connect(g2).connect(g);
    o1.start(t); o2.start(t);
    o1.stop(t + decay + 0.05); o2.stop(t + decay + 0.05);
  }

  thump(t, gain = 0.06, f0 = 120){
    if(!this.ctx) return;
    const ctx = this.ctx;
    const o = ctx.createOscillator(); o.type = "sine";
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(f0 * 0.55, t + 0.11);
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
    o.connect(g).connect(this.musicBus);
    o.start(t); o.stop(t + 0.24);
  }

  tick(t, gain = 0.03){
    if(!this.ctx) return;
    const ctx = this.ctx;
    const s = ctx.createBufferSource(); s.buffer = this.noise;
    const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 3400; bp.Q.value = 1.4;
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.045);
    s.connect(bp).connect(g).connect(this.musicBus);
    s.start(t); s.stop(t + 0.06);
  }

  /** A single plucked note on the santoor, through the effects bus. */
  santoor(freq){
    const ctx = this.ensure();
    if(!ctx) return;
    this.pluck(freq, ctx.currentTime + 0.01, 0.13, 2.1, this.sfxBus);
  }

  /* ---------- effects ---------- */
  fx(kind){
    const ctx = this.ensure();
    if(!ctx || !this.sfxOn) return;
    const t = ctx.currentTime + 0.005;
    switch(kind){
      case "ui": this._blip(t, 720, 0.03, 0.12); break;
      case "tick": this._click(t, 0.05, 2400); break;
      case "lift":
        this._sweep(t, 380, 900, 0.28, 0.06);
        this._click(t, 0.05, 2000);
        break;
      case "settle":
        this._blip(t, 210, 0.09, 0.18);
        this._click(t, 0.035, 900);
        break;
      case "hitFly":
        this.pluck(SCALE[4] * 2, t, 0.06, 1.1, this.sfxBus);
        this.pluck(SCALE[6] * 2, t + 0.045, 0.045, 1.3, this.sfxBus);
        this._sweep(t, 500, 1500, 0.22, 0.035);
        break;
      case "hitStay":
        this._blip(t, 240, 0.07, 0.16);
        this._click(t, 0.03, 1200);
        break;
      case "miss":
        this._sweep(t + 0.02, 300, 120, 0.5, 0.06, true);
        this.thump(t, 0.16, 96);
        [0, 0.085, 0.17].forEach((d, i) => this._clap(t + d, 0.1 - i * 0.015));
        break;
      case "count":
        this.pluck(SCALE[2], t, 0.07, 0.9, this.sfxBus);
        break;
      case "go":
        this.pluck(SCALE[3], t, 0.07, 1.1, this.sfxBus);
        this.pluck(SCALE[6], t + 0.09, 0.06, 1.4, this.sfxBus);
        break;
      case "over":
        this.pluck(SCALE[5], t, 0.06, 1.4, this.sfxBus);
        this.pluck(SCALE[3], t + 0.16, 0.055, 1.5, this.sfxBus);
        this.pluck(SCALE[1], t + 0.34, 0.05, 2.0, this.sfxBus);
        break;
      case "best":
        this.pluck(SCALE[6], t, 0.055, 1.2, this.sfxBus);
        this.pluck(SCALE[7], t + 0.1, 0.05, 1.4, this.sfxBus);
        this.pluck(SCALE[4] * 2, t + 0.22, 0.04, 1.8, this.sfxBus);
        break;
      case "chirp": {
        const base = 1250 + Math.random() * 700;
        this._sweep(t, base, base * 1.45, 0.09, 0.032);
        this._sweep(t + 0.11, base * 1.1, base * 1.7, 0.08, 0.026);
        if(Math.random() < 0.6) this._sweep(t + 0.22, base * 1.25, base * 0.95, 0.1, 0.02);
        break;
      }
      case "wings": {
        for(let i = 0; i < 6; i++){
          this._flap(t + i * 0.075, 0.05 - i * 0.004, 620 + i * 130);
        }
        break;
      }
      case "peck":
        this._click(t, 0.06, 1900 + Math.random() * 500);
        this._blip(t, 320, 0.028, 0.07);
        break;
      case "grain":
        for(let i = 0; i < 4; i++) this._click(t + i * 0.045, 0.022, 2600 + Math.random() * 1200);
        break;
      default: break;
    }
  }

  _blip(t, f, gain, dur){
    const ctx = this.ctx;
    const o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = f;
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(this.sfxBus);
    o.start(t); o.stop(t + dur + 0.02);
  }

  _click(t, gain, freq){
    const ctx = this.ctx;
    const s = ctx.createBufferSource(); s.buffer = this.noise;
    const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = freq; bp.Q.value = 1.1;
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
    s.connect(bp).connect(g).connect(this.sfxBus);
    s.start(t); s.stop(t + 0.05);
  }

  /** One soft wingbeat — noise through a moving band-pass. */
  _flap(t, gain = 0.04, freq = 700){
    const ctx = this.ctx;
    const s = ctx.createBufferSource(); s.buffer = this.noise;
    const bp = ctx.createBiquadFilter(); bp.type = "bandpass";
    bp.frequency.setValueAtTime(freq, t);
    bp.frequency.exponentialRampToValueAtTime(freq * 0.5, t + 0.16);
    bp.Q.value = 0.8;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
    s.connect(bp).connect(g).connect(this.sfxBus);
    s.start(t); s.stop(t + 0.18);
  }

  _clap(t, gain){
    const ctx = this.ctx;
    const s = ctx.createBufferSource(); s.buffer = this.noise;
    const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 1100 + Math.random() * 500; bp.Q.value = 0.9;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
    s.connect(bp).connect(g).connect(this.sfxBus);
    s.start(t); s.stop(t + 0.14);
  }

  _sweep(t, f0, f1, dur, gain, down = false){
    const ctx = this.ctx;
    const o = ctx.createOscillator(); o.type = "sine";
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass"; bp.frequency.value = down ? 500 : 1200; bp.Q.value = 0.8;
    o.connect(bp).connect(g).connect(this.sfxBus);
    o.start(t); o.stop(t + dur + 0.05);
  }

  /* ---------- analyser ---------- */
  levels(){
    if(!this.analyser) return null;
    const n = this.analyser.frequencyBinCount;
    if(!this._lvl || this._lvl.length !== n) this._lvl = new Uint8Array(n);
    this.analyser.getByteFrequencyData(this._lvl);
    return this._lvl;
  }
}
