// ─── Audio (sound effects + music) ────────────────────────────────────────────
// Everything is synthesized with the Web Audio API, so the offline single-file
// build needs no audio assets. Design notes:
//   • Plucked strings (koto / shamisen) use Karplus-Strong, rendered once per
//     pitch into a cached buffer: real string tone instead of beeping oscillators.
//   • Drums (taiko, wood block) are pitched noise + sine bodies.
//   • A generated reverb (temple hall) and a master compressor glue it together
//     and stop loud moments from clipping.
//   • Impacts are "thumps" and "cuts" with very little ringing pitch, so combat
//     doesn't sound like a pile of bells.
//   • The music is composed: an "In" scale (Japanese minor pentatonic) chord
//     progression with a pad, bass, koto melody phrases, shakuhachi-style
//     flute and taiko. Boss waves speed up and get heavier drums.

export type Sfx =
  | "slash" | "stealth" | "parry" | "hit" | "playerHit" | "kill" | "bossRoar" | "levelUp" | "waveStart" | "defeat"
  | "arrowHit" | "kunaiHit" | "crossbowSnap" | "bombBoom" | "hookClink" | "smokeWoosh" | "shopBuy" | "monPing"
  | "slashShort" | "slashMid" | "slashLong" | "armorRing" | "fleshHit" | "phantomSlash" | "bladeStorm"
  | "deathMarkSeal" | "soulRendBass" | "executeThud" | "warHornCry" | "timeSlowSwell" | "bossDeathRumble";

const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const midi = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private comp: DynamicsCompressorNode | null = null;
  private musicGain: GainNode | null = null;
  private musicVol: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private uiGain: GainNode | null = null;
  private reverb: ConvolverNode | null = null;
  private sfxVerb: GainNode | null = null;      // send into the reverb from SFX
  private musicVerb: GainNode | null = null;    // send into the reverb from music
  private noiseBuf: AudioBuffer | null = null;
  private pluckCache = new Map<string, AudioBuffer>();
  private vol = { music: 1, sfx: 1, ui: 1 };
  private muted = false;
  private musicTargetGain = 0.5;
  private bossMode = false;
  private musicNodes: { stop: () => void } | null = null;
  private windFilter: BiquadFilterNode | null = null;
  private windGain: GainNode | null = null;
  private transpose = 1;            // biome tuning (ratio)
  private lastPlay = new Map<string, number>();   // per-sound rate limit

  ensure() {
    if (this.ctx) return this.ctx;
    const Ctor: typeof AudioContext =
      (window as unknown as { AudioContext: typeof AudioContext }).AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    const ctx = (this.ctx = new Ctor());
    // master → compressor → speakers
    this.comp = ctx.createDynamicsCompressor();
    this.comp.threshold.value = -14; this.comp.knee.value = 10; this.comp.ratio.value = 4;
    this.comp.attack.value = 0.004; this.comp.release.value = 0.2;
    this.comp.connect(ctx.destination);
    this.master = ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 0.9;
    this.master.connect(this.comp);
    // reverb
    this.reverb = ctx.createConvolver();
    this.reverb.buffer = this.makeImpulse(ctx, 2.4, 2.6);
    const verbOut = ctx.createGain(); verbOut.gain.value = 0.55;
    this.reverb.connect(verbOut).connect(this.master);
    // buses
    this.musicVol = ctx.createGain(); this.musicVol.gain.value = this.vol.music; this.musicVol.connect(this.master);
    this.musicGain = ctx.createGain(); this.musicGain.gain.value = 0; this.musicGain.connect(this.musicVol);
    this.musicVerb = ctx.createGain(); this.musicVerb.gain.value = 0.35; this.musicGain.connect(this.musicVerb).connect(this.reverb);
    this.sfxGain = ctx.createGain(); this.sfxGain.gain.value = 1.25 * this.vol.sfx; this.sfxGain.connect(this.master);
    this.sfxVerb = ctx.createGain(); this.sfxVerb.gain.value = 0.18 * this.vol.sfx; this.sfxVerb.connect(this.reverb);
    this.uiGain = ctx.createGain(); this.uiGain.gain.value = 0.85 * this.vol.ui; this.uiGain.connect(this.master);
    // shared noise
    this.noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = this.noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return ctx;
  }

  /** A11Y: volumes 0–1 for each bus. */
  setVolumes(v: Partial<{ music: number; sfx: number; ui: number }>) {
    Object.assign(this.vol, v);
    if (this.musicVol) this.musicVol.gain.value = this.vol.music;
    if (this.sfxGain) this.sfxGain.gain.value = 1.25 * this.vol.sfx;
    if (this.sfxVerb) this.sfxVerb.gain.value = 0.18 * this.vol.sfx;
    if (this.uiGain) this.uiGain.gain.value = 0.85 * this.vol.ui;
  }
  /** Play a sound on the UI bus (menus, toasts, buttons). */
  playUi(name: Sfx) {
    this.ensure();
    const keep = this.sfxGain;
    if (this.uiGain) this.sfxGain = this.uiGain;
    try { this.play(name); } finally { this.sfxGain = keep; }
  }
  async resume() {
    const ctx = this.ensure();
    if (ctx && ctx.state === "suspended") { try { await ctx.resume(); } catch { /* ignore */ } }
  }
  setMuted(m: boolean) { this.muted = m; if (this.master) this.master.gain.value = m ? 0 : 0.9; }
  isMuted() { return this.muted; }
  registerSample(_name: string, _buf: AudioBuffer) { /* kept for API compatibility */ }

  // ─────────────────────────────── building blocks ───────────────────────────────
  private makeImpulse(ctx: AudioContext, seconds: number, decay: number) {
    const len = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) {
        const t = i / len;
        // early reflections + smooth tail, slightly darker over time
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, decay) * (i < 400 ? 0.3 : 1);
      }
    }
    return buf;
  }
  /** Output for a one-shot: dry to the bus, plus an optional reverb send, with stereo pan. */
  private out(ctx: AudioContext, verb = 0, pan = 0): AudioNode {
    const p = ctx.createStereoPanner(); p.pan.value = pan;
    p.connect(this.sfxGain!);
    if (verb > 0 && this.sfxVerb) { const s = ctx.createGain(); s.gain.value = verb; p.connect(s).connect(this.sfxVerb); }
    return p;
  }
  private env(ctx: AudioContext, t: number, peak: number, attack: number, decay: number, dest: AudioNode) {
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
    g.connect(dest);
    return g;
  }
  private noise(ctx: AudioContext, t: number, dur: number) {
    const s = ctx.createBufferSource();
    s.buffer = this.noiseBuf!;
    s.start(t, Math.random() * 1.5, dur + 0.05);
    return s;
  }
  /** Filtered noise burst. */
  private nz(ctx: AudioContext, t: number, o: { type: BiquadFilterType; f0: number; f1?: number; q?: number; peak: number; a: number; d: number; dest: AudioNode }) {
    const src = this.noise(ctx, t, o.a + o.d);
    const f = ctx.createBiquadFilter(); f.type = o.type; f.Q.value = o.q ?? 1;
    f.frequency.setValueAtTime(o.f0, t);
    if (o.f1) f.frequency.exponentialRampToValueAtTime(o.f1, t + o.a + o.d);
    src.connect(f).connect(this.env(ctx, t, o.peak, o.a, o.d, o.dest));
  }
  /** Pitched tone with a pitch glide. */
  private tone(ctx: AudioContext, t: number, o: { type: OscillatorType; f0: number; f1?: number; glide?: number; peak: number; a: number; d: number; dest: AudioNode; lp?: number }) {
    const osc = ctx.createOscillator(); osc.type = o.type;
    osc.frequency.setValueAtTime(o.f0, t);
    if (o.f1) osc.frequency.exponentialRampToValueAtTime(o.f1, t + (o.glide ?? o.a + o.d));
    const g = this.env(ctx, t, o.peak, o.a, o.d, o.dest);
    if (o.lp) { const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = o.lp; osc.connect(f).connect(g); }
    else osc.connect(g);
    osc.start(t); osc.stop(t + o.a + o.d + 0.05);
  }
  /** Soft-clipping shaper for grit (booms, roars). */
  private drive(ctx: AudioContext, amount: number) {
    const ws = ctx.createWaveShaper();
    const n = 1024, curve = new Float32Array(n);
    for (let i = 0; i < n; i++) { const x = (i / (n - 1)) * 2 - 1; curve[i] = Math.tanh(x * amount); }
    ws.curve = curve;
    return ws;
  }
  /** Karplus-Strong plucked string, cached per pitch/brightness. */
  private pluckBuf(ctx: AudioContext, freq: number, bright: number, seconds: number) {
    const key = `${Math.round(freq * 10)}|${bright}|${seconds}`;
    const hit = this.pluckCache.get(key);
    if (hit) return hit;
    const sr = ctx.sampleRate, len = Math.floor(sr * seconds);
    const buf = ctx.createBuffer(1, len, sr), d = buf.getChannelData(0);
    const period = Math.max(2, Math.round(sr / freq));
    const ring = new Float32Array(period);
    for (let i = 0; i < period; i++) ring[i] = Math.random() * 2 - 1;
    // pre-filter the excitation for a softer pick
    for (let i = 1; i < period; i++) ring[i] = ring[i] * bright + ring[i - 1] * (1 - bright);
    let idx = 0;
    const damp = 0.996 - (1 - bright) * 0.004;
    for (let i = 0; i < len; i++) {
      const next = (idx + 1) % period;
      const v = (ring[idx] + ring[next]) * 0.5 * damp;
      d[i] = ring[idx];
      ring[idx] = v;
      idx = next;
    }
    if (this.pluckCache.size > 160) this.pluckCache.clear();
    this.pluckCache.set(key, buf);
    return buf;
  }
  private pluck(ctx: AudioContext, t: number, freq: number, gain: number, dest: AudioNode, opts: { bright?: number; secs?: number; pan?: number; bend?: number } = {}) {
    const s = ctx.createBufferSource();
    s.buffer = this.pluckBuf(ctx, freq, opts.bright ?? 0.7, opts.secs ?? 2.2);
    if (opts.bend) { s.playbackRate.setValueAtTime(1, t); s.playbackRate.exponentialRampToValueAtTime(opts.bend, t + 0.12); }
    const g = ctx.createGain(); g.gain.value = gain;
    const p = ctx.createStereoPanner(); p.pan.value = opts.pan ?? 0;
    s.connect(g).connect(p).connect(dest);
    s.start(t);
  }
  /** Taiko-style drum: sine body with pitch drop + skin noise. */
  private taiko(ctx: AudioContext, t: number, gain: number, dest: AudioNode, pitch = 1) {
    this.tone(ctx, t, { type: "sine", f0: 110 * pitch, f1: 48 * pitch, glide: 0.18, peak: gain, a: 0.004, d: 0.45, dest });
    this.tone(ctx, t, { type: "triangle", f0: 190 * pitch, f1: 90 * pitch, glide: 0.08, peak: gain * 0.35, a: 0.002, d: 0.12, dest });
    this.nz(ctx, t, { type: "lowpass", f0: 900, f1: 200, peak: gain * 0.45, a: 0.002, d: 0.14, dest });
  }
  /** Wood block / rim click. */
  private wood(ctx: AudioContext, t: number, gain: number, dest: AudioNode, f = 1800) {
    this.nz(ctx, t, { type: "bandpass", f0: f, q: 6, peak: gain, a: 0.001, d: 0.05, dest });
    this.tone(ctx, t, { type: "sine", f0: f * 0.55, peak: gain * 0.5, a: 0.001, d: 0.05, dest });
  }
  /** Rate-limit very frequent sounds so crowds don't turn into noise. */
  private allow(name: string, minGap: number) {
    const now = this.ctx!.currentTime, last = this.lastPlay.get(name) ?? -1;
    if (now - last < minGap) return false;
    this.lastPlay.set(name, now);
    return true;
  }

  // ─────────────────────────────── sound effects ───────────────────────────────
  play(name: Sfx) {
    const ctx = this.ensure();
    if (!ctx || !this.sfxGain) return;
    const t = ctx.currentTime + 0.005;
    switch (name) {
      case "slash": case "slashMid": if (this.allow("slash", 0.03)) this.whoosh(ctx, t, 1); break;
      case "slashShort": if (this.allow("slash", 0.03)) this.whoosh(ctx, t, 0); break;
      case "slashLong": if (this.allow("slash", 0.03)) this.whoosh(ctx, t, 2); break;
      case "stealth": this.whoosh(ctx, t, 0, 0.5); this.cut(ctx, t + 0.04, 0.6); break;
      case "hit": if (this.allow("hit", 0.025)) this.impact(ctx, t, 1); break;
      case "fleshHit": if (this.allow("flesh", 0.03)) this.cut(ctx, t, 1); break;
      case "kill": this.impact(ctx, t, 1.3); this.cut(ctx, t, 0.8); break;
      case "playerHit": this.playerHit(ctx, t); break;
      case "parry": if (this.allow("parry", 0.04)) this.parry(ctx, t); break;
      case "armorRing": if (this.allow("armor", 0.05)) this.armor(ctx, t); break;
      case "bossRoar": this.roar(ctx, t); break;
      case "levelUp": if (this.allow("levelUp", 0.12)) this.chime(ctx, t); break;
      case "waveStart": this.waveStart(ctx, t); break;
      case "defeat": this.defeatSting(ctx, t); break;
      case "arrowHit": this.nz(ctx, t, { type: "bandpass", f0: 1400, q: 2, peak: 0.35, a: 0.001, d: 0.05, dest: this.out(ctx) }); this.impact(ctx, t, 0.6); break;
      case "kunaiHit": if (this.allow("kunai", 0.03)) { const o = this.out(ctx, 0.05, rnd(-0.3, 0.3)); this.nz(ctx, t, { type: "bandpass", f0: 3200, q: 3, peak: 0.5, a: 0.001, d: 0.04, dest: o }); this.wood(ctx, t, 0.35, o, 1500); } break;
      case "crossbowSnap": { const o = this.out(ctx, 0.05); this.nz(ctx, t, { type: "bandpass", f0: 1500, f1: 600, q: 5, peak: 0.8, a: 0.002, d: 0.07, dest: o }); this.tone(ctx, t, { type: "sine", f0: 160, f1: 70, peak: 0.3, a: 0.002, d: 0.08, dest: o }); break; }
      case "bombBoom": if (this.allow("boom", 0.06)) this.boom(ctx, t, 1); break;
      case "hookClink": { const o = this.out(ctx, 0.08); for (let i = 0; i < 4; i++) this.nz(ctx, t + i * rnd(0.025, 0.04), { type: "bandpass", f0: rnd(3500, 5500), q: 9, peak: 0.5, a: 0.001, d: 0.03, dest: o }); break; }
      case "smokeWoosh": { const o = this.out(ctx, 0.2); this.nz(ctx, t, { type: "lowpass", f0: 1600, f1: 300, q: 0.7, peak: 0.35, a: 0.06, d: 0.55, dest: o }); this.nz(ctx, t, { type: "highpass", f0: 5000, peak: 0.06, a: 0.05, d: 0.3, dest: o }); break; }
      case "shopBuy": this.coins(ctx, t, 4); this.pluck(ctx, t + 0.02, midi(81), 0.35, this.out(ctx, 0.3), { bright: 0.8, secs: 1.2 }); break;
      case "monPing": if (this.allow("coin", 0.05)) this.coins(ctx, t, 2); break;
      case "phantomSlash": this.whoosh(ctx, t, 2, 1.1); this.whoosh(ctx, t + 0.09, 1, 0.7); this.shimmer(ctx, t, 0.25); break;
      case "bladeStorm": [0, 0.12, 0.24, 0.36].forEach((o, i) => this.whoosh(ctx, t + o, i % 2 ? 1 : 2, 0.8)); this.taiko(ctx, t, 0.5, this.out(ctx, 0.2), 0.8); break;
      case "deathMarkSeal": { const o = this.out(ctx, 0.5); [76, 75, 69].forEach((m, i) => this.pluck(ctx, t + i * 0.09, midi(m), 0.4, o, { bright: 0.55, secs: 1.6 })); this.tone(ctx, t, { type: "sine", f0: 55, peak: 0.25, a: 0.02, d: 0.6, dest: o }); break; }
      case "soulRendBass": this.boom(ctx, t, 0.8); this.nz(ctx, t, { type: "bandpass", f0: 300, f1: 1800, q: 1.5, peak: 0.25, a: 0.25, d: 0.15, dest: this.out(ctx, 0.3) }); break;
      case "executeThud": this.taiko(ctx, t, 0.9, this.out(ctx, 0.3), 0.7); this.cut(ctx, t, 1.2); this.whoosh(ctx, t - 0.004, 2, 0.8); break;
      case "warHornCry": this.horn(ctx, t); break;
      case "timeSlowSwell": this.timeSlow(ctx, t); break;
      case "bossDeathRumble": this.boom(ctx, t, 1.6); this.taiko(ctx, t + 0.25, 0.8, this.out(ctx, 0.5), 0.6); this.chime(ctx, t + 0.6); break;
    }
  }

  /** Randomised katana whoosh by swing tier (0 jab, 1 arc, 2 sweep). */
  playSlashRandom(tier: 0 | 1 | 2 = 1) {
    const ctx = this.ensure();
    if (!ctx || !this.sfxGain || !this.allow("slash", 0.03)) return;
    this.whoosh(ctx, ctx.currentTime + 0.005, tier);
  }

  /** Air being cut: a swelling, falling band of noise (no pitch, no ring). */
  private whoosh(ctx: AudioContext, t: number, tier: 0 | 1 | 2, gainMul = 1) {
    const dur = [0.13, 0.22, 0.34][tier] * rnd(0.9, 1.1);
    const o = this.out(ctx, 0.06, rnd(-0.35, 0.35));
    const peak = [0.5, 0.65, 0.8][tier] * gainMul;
    // high "air" band sweeping down
    this.nz(ctx, t, { type: "bandpass", f0: [5200, 4200, 3400][tier] * rnd(0.9, 1.1), f1: [1500, 1000, 650][tier], q: 1.4, peak, a: dur * 0.35, d: dur * 0.65, dest: o });
    // low body so big swings feel heavy
    if (tier > 0) this.nz(ctx, t, { type: "lowpass", f0: 700, f1: 250, q: 0.8, peak: peak * 0.5, a: dur * 0.4, d: dur * 0.6, dest: o });
  }
  /** Blade biting into a body: short wet slice. */
  private cut(ctx: AudioContext, t: number, gainMul = 1) {
    const o = this.out(ctx, 0.04, rnd(-0.2, 0.2));
    this.nz(ctx, t, { type: "bandpass", f0: rnd(1800, 2400), f1: 700, q: 1.6, peak: 0.7 * gainMul, a: 0.002, d: 0.09, dest: o });
    this.nz(ctx, t, { type: "lowpass", f0: 500, peak: 0.45 * gainMul, a: 0.002, d: 0.07, dest: o });
  }
  /** Meaty hit on an enemy: sub punch + body + tiny crack. */
  private impact(ctx: AudioContext, t: number, gainMul = 1) {
    const o = this.out(ctx, 0.05, rnd(-0.2, 0.2));
    this.tone(ctx, t, { type: "sine", f0: rnd(150, 175), f1: 48, glide: 0.11, peak: 0.55 * gainMul, a: 0.002, d: 0.16, dest: o });
    this.nz(ctx, t, { type: "lowpass", f0: 1200, f1: 300, peak: 0.32 * gainMul, a: 0.002, d: 0.09, dest: o });
    this.nz(ctx, t, { type: "highpass", f0: 2500, peak: 0.12 * gainMul, a: 0.001, d: 0.02, dest: o });
  }
  private playerHit(ctx: AudioContext, t: number) {
    const o = this.out(ctx, 0.15);
    this.tone(ctx, t, { type: "sine", f0: 120, f1: 40, glide: 0.2, peak: 0.8, a: 0.003, d: 0.3, dest: o });
    const d = this.drive(ctx, 3);
    const g = this.env(ctx, t, 0.22, 0.004, 0.18, o);
    const osc = ctx.createOscillator(); osc.type = "sawtooth";
    osc.frequency.setValueAtTime(190, t); osc.frequency.exponentialRampToValueAtTime(85, t + 0.2);
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 600;
    osc.connect(d).connect(lp).connect(g); osc.start(t); osc.stop(t + 0.25);
    this.nz(ctx, t, { type: "lowpass", f0: 900, peak: 0.3, a: 0.002, d: 0.12, dest: o });
  }
  /** Steel meeting steel: a sharp scrape-clack with a short, dark ring. */
  private parry(ctx: AudioContext, t: number) {
    const o = this.out(ctx, 0.35, rnd(-0.2, 0.2));
    this.nz(ctx, t, { type: "highpass", f0: 2600, peak: 0.6, a: 0.001, d: 0.04, dest: o });
    this.nz(ctx, t + 0.005, { type: "bandpass", f0: 5200, f1: 2600, q: 3, peak: 0.12, a: 0.01, d: 0.16, dest: o });
    const base = rnd(1150, 1350);
    [1, 2.76, 4.1].forEach((m, i) => this.tone(ctx, t, { type: "sine", f0: base * m, peak: [0.11, 0.05, 0.025][i], a: 0.001, d: [0.28, 0.16, 0.09][i], dest: o }));
    this.tone(ctx, t, { type: "sine", f0: 220, f1: 120, peak: 0.25, a: 0.002, d: 0.08, dest: o });
  }
  /** Weapon glancing off armour or a ward: dull thunk with a hint of metal. */
  private armor(ctx: AudioContext, t: number) {
    const o = this.out(ctx, 0.12, rnd(-0.2, 0.2));
    this.tone(ctx, t, { type: "triangle", f0: 240, f1: 150, peak: 0.5, a: 0.002, d: 0.09, dest: o, lp: 900 });
    this.nz(ctx, t, { type: "bandpass", f0: rnd(1100, 1500), q: 4, peak: 0.45, a: 0.001, d: 0.07, dest: o });
    this.tone(ctx, t, { type: "sine", f0: rnd(1700, 2000), peak: 0.035, a: 0.001, d: 0.12, dest: o });
  }
  private boom(ctx: AudioContext, t: number, size: number) {
    const o = this.out(ctx, 0.3);
    this.tone(ctx, t, { type: "sine", f0: 90, f1: 32, glide: 0.4 * size, peak: 0.85, a: 0.004, d: 0.5 * size, dest: o });
    const src = this.noise(ctx, t, 0.7 * size);
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass";
    lp.frequency.setValueAtTime(2400, t); lp.frequency.exponentialRampToValueAtTime(120, t + 0.6 * size);
    src.connect(this.drive(ctx, 2.5)).connect(lp).connect(this.env(ctx, t, 0.6, 0.004, 0.6 * size, o));
  }
  private coins(ctx: AudioContext, t: number, n: number) {
    const o = this.out(ctx, 0.12, rnd(-0.3, 0.3));
    for (let i = 0; i < n; i++) {
      const tt = t + i * rnd(0.03, 0.06);
      this.tone(ctx, tt, { type: "sine", f0: rnd(2600, 3400), peak: 0.09, a: 0.001, d: 0.07, dest: o });
      this.nz(ctx, tt, { type: "bandpass", f0: 6000, q: 5, peak: 0.12, a: 0.001, d: 0.02, dest: o });
    }
  }
  private shimmer(ctx: AudioContext, t: number, gain: number) {
    const o = this.out(ctx, 0.6);
    this.nz(ctx, t, { type: "bandpass", f0: 7000, f1: 3000, q: 2, peak: gain * 0.4, a: 0.05, d: 0.6, dest: o });
  }
  /** Koto arpeggio: level-ups, chests, rewards. */
  private chime(ctx: AudioContext, t: number) {
    const o = this.out(ctx, 0.5);
    const notes = [69, 72, 74, 76, 81].map(m => midi(m) * this.transpose);   // In-scale-ish rising run
    notes.forEach((f, i) => this.pluck(ctx, t + i * 0.055, f, 0.42 - i * 0.03, o, { bright: 0.8, secs: 1.6, pan: (i - 2) * 0.15 }));
    this.shimmer(ctx, t + 0.2, 0.25);
  }
  private waveStart(ctx: AudioContext, t: number) {
    const o = this.out(ctx, 0.5);
    this.taiko(ctx, t, 0.75, o, 0.9);
    this.taiko(ctx, t + 0.28, 0.9, o, 0.75);
    // small gong swell
    [1, 2.4, 3.1].forEach((m, i) => this.tone(ctx, t + 0.28, { type: "sine", f0: 98 * m, peak: [0.18, 0.06, 0.03][i], a: 0.02, d: 1.6, dest: o }));
  }
  private defeatSting(ctx: AudioContext, t: number) {
    const o = this.out(ctx, 0.6);
    this.taiko(ctx, t, 0.9, o, 0.6);
    [64, 62, 57].forEach((m, i) => this.flute(ctx, t + 0.3 + i * 0.55, midi(m), 0.6, 0.18, o));
  }
  private roar(ctx: AudioContext, t: number) {
    const dur = 1.6, o = this.out(ctx, 0.4);
    const d = this.drive(ctx, 4);
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.setValueAtTime(500, t); lp.frequency.linearRampToValueAtTime(1400, t + 0.3); lp.frequency.exponentialRampToValueAtTime(300, t + dur);
    const g = this.env(ctx, t, 0.35, 0.18, dur - 0.18, o);
    d.connect(lp).connect(g);
    [55, 58.3, 82.4].forEach(f => {
      const osc = ctx.createOscillator(); osc.type = "sawtooth";
      osc.frequency.setValueAtTime(f * 0.8, t); osc.frequency.exponentialRampToValueAtTime(f, t + 0.25); osc.frequency.exponentialRampToValueAtTime(f * 0.65, t + dur);
      const lfo = ctx.createOscillator(); lfo.frequency.value = rnd(5, 8);
      const lg = ctx.createGain(); lg.gain.value = f * 0.05; lfo.connect(lg).connect(osc.frequency);
      osc.connect(d); osc.start(t); lfo.start(t); osc.stop(t + dur); lfo.stop(t + dur);
    });
    this.nz(ctx, t, { type: "bandpass", f0: 600, f1: 200, q: 1, peak: 0.3, a: 0.2, d: dur - 0.2, dest: o });
    this.taiko(ctx, t, 0.7, o, 0.6);
  }
  private horn(ctx: AudioContext, t: number) {
    const o = this.out(ctx, 0.5), dur = 1.1;
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.setValueAtTime(400, t); lp.frequency.linearRampToValueAtTime(1300, t + 0.25); lp.frequency.linearRampToValueAtTime(700, t + dur);
    const g = this.env(ctx, t, 0.3, 0.12, dur, o);
    lp.connect(g);
    [110, 110.6, 165].forEach(f => {
      const osc = ctx.createOscillator(); osc.type = "sawtooth";
      osc.frequency.setValueAtTime(f * 0.94, t); osc.frequency.exponentialRampToValueAtTime(f, t + 0.15);
      osc.connect(lp); osc.start(t); osc.stop(t + dur + 0.15);
    });
  }
  private timeSlow(ctx: AudioContext, t: number) {
    const o = this.out(ctx, 0.7);
    this.nz(ctx, t, { type: "bandpass", f0: 3000, f1: 250, q: 1.2, peak: 0.35, a: 0.05, d: 0.7, dest: o });
    this.tone(ctx, t, { type: "sine", f0: 220, f1: 110, glide: 0.6, peak: 0.25, a: 0.05, d: 0.9, dest: o });
  }
  /** Breathy bamboo flute (shakuhachi-ish). */
  private flute(ctx: AudioContext, t: number, freq: number, dur: number, gain: number, dest: AudioNode) {
    const osc = ctx.createOscillator(); osc.type = "sine";
    osc.frequency.setValueAtTime(freq * 0.97, t); osc.frequency.exponentialRampToValueAtTime(freq, t + 0.12);
    const vib = ctx.createOscillator(); vib.frequency.value = 5.2;
    const vg = ctx.createGain(); vg.gain.setValueAtTime(0, t); vg.gain.linearRampToValueAtTime(freq * 0.012, t + dur * 0.6);
    vib.connect(vg).connect(osc.frequency);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + 0.15);
    g.gain.setValueAtTime(gain, t + dur * 0.7); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g).connect(dest);
    // breath
    const src = this.noise(ctx, t, dur);
    const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = freq * 2; bp.Q.value = 3;
    const ng = ctx.createGain(); ng.gain.setValueAtTime(0.0001, t); ng.gain.exponentialRampToValueAtTime(gain * 0.35, t + 0.08); ng.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(bp).connect(ng).connect(dest);
    osc.start(t); vib.start(t); osc.stop(t + dur + 0.05); vib.stop(t + dur + 0.05);
  }

  // ─────────────────────────────── music ───────────────────────────────
  // "In" scale on A (A Bb D E F) with a slow i–VI–iv–v feel. 16-step bars.
  startMusic() {
    const ctx = this.ensure();
    if (!ctx || !this.musicGain || this.musicNodes) return;
    const bus = this.musicGain;
    let stopped = false;
    const live: AudioScheduledSourceNode[] = [];

    // Wind bed (biome-tuned).
    const wind = ctx.createBufferSource(); wind.buffer = this.noiseBuf!; wind.loop = true;
    const wf = ctx.createBiquadFilter(); wf.type = "bandpass"; wf.frequency.value = 600; wf.Q.value = 0.5;
    const wg = ctx.createGain(); wg.gain.value = 0.025;
    wind.connect(wf).connect(wg).connect(bus); wind.start();
    this.windFilter = wf; this.windGain = wg; live.push(wind);

    // Pad: two detuned saws per chord tone through a slow lowpass.
    const padLP = ctx.createBiquadFilter(); padLP.type = "lowpass"; padLP.frequency.value = 700; padLP.Q.value = 0.4;
    const padLFO = ctx.createOscillator(); padLFO.frequency.value = 0.07;
    const padLFOg = ctx.createGain(); padLFOg.gain.value = 250; padLFO.connect(padLFOg).connect(padLP.frequency); padLFO.start(); live.push(padLFO);
    const padOut = ctx.createGain(); padOut.gain.value = 0.05; padLP.connect(padOut).connect(bus);

    // Chords (MIDI notes) — A minor "In" colour: Am(add b2 colour), Fmaj7, Dm, Esus.
    const CHORDS = [
      { root: 45, pad: [57, 60, 64, 71] },   // A  (A C E B)
      { root: 41, pad: [57, 60, 64, 65] },   // F  (A C E F)
      { root: 38, pad: [57, 62, 65, 69] },   // Dm (A D F A)
      { root: 40, pad: [56, 59, 64, 69] },   // E  (G# B E A) — leading tone pull back to A
    ];
    const SCALE = [57, 58, 62, 64, 65, 69, 70, 74, 76, 77, 81];   // A Bb D E F (two octaves)
    // Koto phrases: [scale index or -1 rest, steps]
    const PHRASES: [number, number][][] = [
      [[5, 2], [4, 2], [3, 4], [2, 2], [3, 6]],
      [[3, 3], [4, 1], [5, 4], [7, 4], [5, 4]],
      [[7, 2], [6, 2], [5, 2], [4, 2], [3, 8]],
      [[0, 4], [2, 2], [3, 2], [5, 4], [4, 4]],
      [[8, 2], [7, 2], [5, 4], [-1, 2], [4, 2], [3, 4]],
      [[3, 2], [3, 2], [5, 4], [4, 2], [2, 2], [3, 4]],
    ];
    const BOSS_PHRASES: [number, number][][] = [
      [[5, 1], [5, 1], [6, 2], [5, 1], [4, 1], [3, 2], [4, 4], [3, 4]],
      [[7, 2], [6, 1], [5, 1], [6, 2], [5, 2], [3, 2], [2, 2], [3, 4]],
      [[3, 1], [4, 1], [5, 2], [7, 2], [8, 2], [7, 4], [5, 4]],
    ];

    let step = 0, nextTime = ctx.currentTime + 0.3, bar = 0, chordIdx = 0;
    let phrase: [number, number][] = [], phraseStep = 0, phraseWait = 4;
    const padVoices: { osc: OscillatorNode[]; g: GainNode }[] = [];

    const setChord = (t: number, c: typeof CHORDS[number]) => {
      for (const v of padVoices) { v.g.gain.cancelScheduledValues(t); v.g.gain.setValueAtTime(v.g.gain.value, t); v.g.gain.linearRampToValueAtTime(0.0001, t + 1.2); v.osc.forEach(o => o.stop(t + 1.3)); }
      padVoices.length = 0;
      for (const m of c.pad) {
        const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.25, t + 1.2); g.connect(padLP);
        const oscs = [-7, 7].map(det => { const o = ctx.createOscillator(); o.type = "sawtooth"; o.frequency.value = midi(m) * this.transpose; o.detune.value = det; o.connect(g); o.start(t); return o; });
        padVoices.push({ osc: oscs, g });
      }
    };

    const schedule = (t: number) => {
      const boss = this.bossMode;
      const s = step % 16;
      const tr = this.transpose;
      if (s === 0) {
        if (bar % 2 === 0) { const c = CHORDS[chordIdx % CHORDS.length]; setChord(t, c); chordIdx++; }
        bar++;
      }
      const chord = CHORDS[(chordIdx - 1 + CHORDS.length) % CHORDS.length];
      // Bass: root on 1 and the "and" of 3 (boss: driving 8ths).
      if (boss ? s % 2 === 0 : (s === 0 || s === 10)) {
        this.tone(ctx, t, { type: "triangle", f0: midi(chord.root) * tr, peak: boss ? 0.16 : 0.2, a: 0.01, d: boss ? 0.22 : 0.9, dest: bus, lp: 400 });
      }
      // Taiko.
      if (boss) {
        if (s % 4 === 0) this.taiko(ctx, t, s === 0 ? 0.5 : 0.35, bus, s === 0 ? 0.8 : 1);
        if (s === 6 || s === 14) this.taiko(ctx, t, 0.22, bus, 1.25);
        if (s % 2 === 1) this.wood(ctx, t, 0.05, bus, 2400);
      } else {
        if (s === 0) this.taiko(ctx, t, 0.32, bus, 0.85);
        if (s === 8 && bar % 2 === 0) this.taiko(ctx, t, 0.18, bus, 1.1);
        if (s === 12 || s === 14) this.wood(ctx, t, 0.035, bus, 1900);
      }
      // Koto melody phrases with rests between them.
      if (phraseStep <= 0) {
        if (phrase.length) {
          const [idx, len] = phrase.shift()!;
          if (idx >= 0) {
            const f = midi(SCALE[Math.min(SCALE.length - 1, idx)]) * tr;
            this.pluck(ctx, t, f, boss ? 0.5 : 0.42, bus, { bright: boss ? 0.85 : 0.7, secs: 2.4, pan: rnd(-0.3, 0.3), bend: Math.random() < 0.15 ? 0.985 : undefined });
            if (!boss && Math.random() < 0.15) this.pluck(ctx, t + 0.06, f * 2, 0.12, bus, { bright: 0.8, secs: 1.2 });   // grace note
          }
          phraseStep = len;
        } else if (--phraseWait <= 0) {
          const pool = boss ? BOSS_PHRASES : PHRASES;
          phrase = pool[Math.floor(Math.random() * pool.length)].map(x => [...x] as [number, number]);
          phraseWait = boss ? 2 : 8 + Math.floor(Math.random() * 12);
          phraseStep = 0;
        }
      }
      phraseStep--;
      // Shakuhachi line now and then in calm sections.
      if (!boss && s === 0 && bar % 8 === 5) {
        const m = [69, 70, 64, 65][Math.floor(Math.random() * 4)];
        this.flute(ctx, t, midi(m) * tr, 3.2, 0.06, bus);
      }
      step++;
    };

    const tick = () => {
      if (stopped) return;
      const now = ctx.currentTime;
      const stepDur = 60 / (this.bossMode ? 128 : 84) / 4;
      if (nextTime < now - 0.5) nextTime = now + 0.05;   // tab was asleep: don't burst-play
      while (nextTime < now + 0.25) { schedule(nextTime); nextTime += stepDur; }
      setTimeout(tick, 60);
    };
    tick();

    const now = ctx.currentTime;
    bus.gain.cancelScheduledValues(now);
    bus.gain.setValueAtTime(bus.gain.value, now);
    bus.gain.linearRampToValueAtTime(this.musicTargetGain, now + 2.5);

    this.musicNodes = {
      stop: () => {
        stopped = true;
        const t = ctx.currentTime;
        for (const v of padVoices) v.osc.forEach(o => { try { o.stop(t + 0.1); } catch { /* stopped */ } });
        for (const n of live) { try { n.stop(t + 0.1); } catch { /* stopped */ } }
      },
    };
  }

  setBossMode(boss: boolean) {
    this.bossMode = boss;
    if (!this.ctx || !this.musicGain) return;
    const target = boss ? 0.62 : 0.5;
    this.musicTargetGain = target;
    const now = this.ctx.currentTime;
    this.musicGain.gain.cancelScheduledValues(now);
    this.musicGain.gain.setValueAtTime(this.musicGain.gain.value, now);
    this.musicGain.gain.linearRampToValueAtTime(target, now + 1.2);
  }

  /** Retune to the biome: music key follows the old drone pitch, wind follows its settings. */
  setBiome(opts: { droneFreq: number; drone2Freq: number; windFreq: number; windGain: number }) {
    this.transpose = Math.max(0.7, Math.min(1.5, (opts.droneFreq || 110) / 110));
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    if (this.windFilter) { this.windFilter.frequency.cancelScheduledValues(now); this.windFilter.frequency.setValueAtTime(this.windFilter.frequency.value, now); this.windFilter.frequency.exponentialRampToValueAtTime(Math.max(80, opts.windFreq), now + 1.4); }
    if (this.windGain) { this.windGain.gain.cancelScheduledValues(now); this.windGain.gain.setValueAtTime(this.windGain.gain.value, now); this.windGain.gain.linearRampToValueAtTime(Math.max(0, Math.min(0.06, opts.windGain * 0.4)), now + 1.4); }
  }

  stopMusic() {
    if (!this.ctx || !this.musicGain || !this.musicNodes) return;
    const now = this.ctx.currentTime;
    this.musicGain.gain.cancelScheduledValues(now);
    this.musicGain.gain.setValueAtTime(this.musicGain.gain.value, now);
    this.musicGain.gain.linearRampToValueAtTime(0.0001, now + 1.0);
    const nodes = this.musicNodes;
    this.musicNodes = null;
    setTimeout(() => { nodes.stop(); this.windFilter = null; this.windGain = null; }, 1100);
  }
}

export const audio = new AudioEngine();
