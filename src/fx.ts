// Combat effects layer: blade arcs, shockwaves, streak sparks, branching
// lightning, ensō brush circles, kanji seals, smoke, flames, and the
// screen-space ultimate cinematic. Everything is short-lived and budgeted by
// `scale` (the engine's quality tier) so low-end Chromebooks stay smooth.

type Pt = { x: number; y: number };

interface Arc { x: number; y: number; ang: number; r: number; arc: number; dir: number; hue: number; sat: number; light: number; width: number; life: number; max: number; follow?: Pt; }
interface Shock { x: number; y: number; r: number; hue: number; sat: number; light: number; life: number; max: number; delay: number; width: number; lines: number; }
interface Streak { x: number; y: number; vx: number; vy: number; hue: number; sat: number; light: number; life: number; max: number; w: number; drag: number; grav: number; }
interface Bolt { pts: Pt[]; branch: Pt[]; ax: number; ay: number; bx: number; by: number; hue: number; life: number; max: number; rejit: number; }
interface Seal { x: number; y: number; text: string; hue: number; size: number; life: number; max: number; follow?: Pt; }
interface Enso { x: number; y: number; r: number; hue: number; sat: number; light: number; life: number; max: number; rot: number; width: number; follow?: Pt; }
interface Puff { x: number; y: number; vx: number; vy: number; r: number; grow: number; light: number; hue: number; sat: number; life: number; max: number; }
interface Flame { x: number; y: number; vx: number; vy: number; size: number; hue: number; life: number; max: number; }
interface Glow { x: number; y: number; r: number; hue: number; sat: number; light: number; life: number; max: number; }
interface Line { ax: number; ay: number; bx: number; by: number; hue: number; light: number; width: number; life: number; max: number; }
interface Crack { x: number; y: number; segs: Pt[][]; life: number; max: number; hue: number; }
interface Cine { kanji: string; name: string; hue: number; t: number; dur: number; }

const TAU = Math.PI * 2;
const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const hsla = (h: number, s: number, l: number, a: number) => `hsla(${h},${s}%,${l}%,${a})`;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

export function hueOf(color: string, fallback = 40): number {
  const m = /hsla?\(\s*(-?\d+(?:\.\d+)?)/.exec(color);
  return m ? Number(m[1]) : fallback;
}

function jaggedPath(ax: number, ay: number, bx: number, by: number, segs: number, amp: number): Pt[] {
  const pts: Pt[] = [{ x: ax, y: ay }];
  const dx = bx - ax, dy = by - ay;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len, ny = dx / len;
  for (let i = 1; i < segs; i++) {
    const t = i / segs;
    const off = (Math.random() - 0.5) * amp * Math.sin(t * Math.PI) * 2;
    pts.push({ x: ax + dx * t + nx * off, y: ay + dy * t + ny * off });
  }
  pts.push({ x: bx, y: by });
  return pts;
}

export class Fx {
  scale = 1;
  arcs: Arc[] = [];
  shocks: Shock[] = [];
  streaks: Streak[] = [];
  bolts: Bolt[] = [];
  seals: Seal[] = [];
  ensos: Enso[] = [];
  puffs: Puff[] = [];
  flames: Flame[] = [];
  glows: Glow[] = [];
  lines: Line[] = [];
  cracks: Crack[] = [];
  cine: Cine | null = null;
  aura: { x: number; y: number; hue: number; on: boolean; t: number } = { x: 0, y: 0, hue: 40, on: false, t: 0 };

  private n(count: number) { return Math.max(1, Math.round(count * this.scale)); }

  clear() {
    this.arcs = []; this.shocks = []; this.streaks = []; this.bolts = []; this.seals = [];
    this.ensos = []; this.puffs = []; this.flames = []; this.glows = []; this.lines = []; this.cracks = [];
    this.cine = null;
  }

  // ───────── Spawners ─────────
  slash(x: number, y: number, ang: number, r: number, arc: number, dir = 1,
        o: { hue?: number; sat?: number; light?: number; width?: number; life?: number; follow?: Pt } = {}) {
    const life = o.life ?? (arc >= TAU - 0.01 ? 0.26 : 0.2);
    this.arcs.push({ x, y, ang, r, arc: Math.min(arc, TAU), dir, hue: o.hue ?? 40, sat: o.sat ?? 40,
      light: o.light ?? 92, width: o.width ?? Math.max(6, r * 0.16), life, max: life, follow: o.follow });
  }

  shockwave(x: number, y: number, r: number, o: { hue?: number; sat?: number; light?: number; life?: number; delay?: number; width?: number; lines?: number } = {}) {
    const life = o.life ?? 0.45;
    this.shocks.push({ x, y, r, hue: o.hue ?? 40, sat: o.sat ?? 80, light: o.light ?? 70, life, max: life,
      delay: o.delay ?? 0, width: o.width ?? 10, lines: o.lines ?? 0 });
  }

  burst(x: number, y: number, o: { count?: number; hue?: number; sat?: number; light?: number; speed?: number; life?: number; dir?: number; spread?: number; w?: number; grav?: number } = {}) {
    const count = this.n(o.count ?? 10);
    for (let i = 0; i < count; i++) {
      const a = o.dir !== undefined ? o.dir + (Math.random() - 0.5) * (o.spread ?? 1) : Math.random() * TAU;
      const sp = (o.speed ?? 320) * rnd(0.45, 1.15);
      const life = (o.life ?? 0.35) * rnd(0.7, 1.2);
      this.streaks.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, hue: o.hue ?? 40, sat: o.sat ?? 90,
        light: o.light ?? 70, life, max: life, w: o.w ?? rnd(1.5, 3), drag: 5, grav: o.grav ?? 0 });
    }
  }

  impact(x: number, y: number, ang: number, hue = 36, heavy = false) {
    this.burst(x, y, { count: heavy ? 9 : 5, hue, light: 75, speed: heavy ? 420 : 300, dir: ang, spread: 1.4, life: 0.22 });
    this.slash(x - Math.cos(ang) * 6, y - Math.sin(ang) * 6, ang + Math.PI / 2, heavy ? 22 : 15, Math.PI * 0.5, 1,
      { hue, sat: 60, light: 95, width: heavy ? 5 : 3.5, life: 0.12 });
    if (heavy) this.glow(x, y, 46, hue, 90, 70, 0.14);
  }

  bolt(ax: number, ay: number, bx: number, by: number, hue = 52, life = 0.28) {
    const segs = Math.max(4, Math.round(Math.hypot(bx - ax, by - ay) / 26));
    const pts = jaggedPath(ax, ay, bx, by, segs, 18);
    const bi = 1 + Math.floor(Math.random() * (pts.length - 2));
    const bp = pts[bi];
    const ba = Math.atan2(by - ay, bx - ax) + rnd(-1, 1);
    const blen = rnd(24, 60);
    const branch = jaggedPath(bp.x, bp.y, bp.x + Math.cos(ba) * blen, bp.y + Math.sin(ba) * blen, 4, 10);
    this.bolts.push({ pts, branch, ax, ay, bx, by, hue, life, max: life, rejit: 0.05 });
    this.glow(bx, by, 40, hue, 100, 80, 0.18);
    this.burst(bx, by, { count: 4, hue, light: 85, speed: 260, life: 0.2 });
  }

  seal(x: number, y: number, text: string, hue: number, size = 36, life = 0.9, follow?: Pt) {
    this.seals.push({ x, y, text, hue, size, life, max: life, follow });
  }

  enso(x: number, y: number, r: number, hue: number, o: { sat?: number; light?: number; life?: number; width?: number; follow?: Pt } = {}) {
    const life = o.life ?? 0.6;
    this.ensos.push({ x, y, r, hue, sat: o.sat ?? 70, light: o.light ?? 60, life, max: life, rot: Math.random() * TAU,
      width: o.width ?? Math.max(4, r * 0.08), follow: o.follow });
  }

  smoke(x: number, y: number, count = 10, radius = 60, light = 22, hue = 0, sat = 0) {
    const c = this.n(count);
    for (let i = 0; i < c; i++) {
      const a = Math.random() * TAU;
      const d = Math.random() * radius * 0.5;
      const life = rnd(0.7, 1.2);
      this.puffs.push({ x: x + Math.cos(a) * d, y: y + Math.sin(a) * d, vx: Math.cos(a) * rnd(20, 70), vy: Math.sin(a) * rnd(20, 70) - 10,
        r: rnd(radius * 0.25, radius * 0.45), grow: rnd(20, 50), light, hue, sat, life, max: life });
    }
  }

  flame(x: number, y: number, size = 6, hue = rnd(14, 42)) {
    const life = rnd(0.35, 0.6);
    this.flames.push({ x: x + rnd(-6, 6), y, vx: rnd(-12, 12), vy: rnd(-70, -40), size, hue, life, max: life });
  }

  flames2(x: number, y: number, count = 12, radius = 30) {
    for (let i = 0; i < this.n(count); i++) {
      const a = Math.random() * TAU, d = Math.random() * radius;
      this.flame(x + Math.cos(a) * d, y + Math.sin(a) * d, rnd(5, 10));
    }
  }

  glow(x: number, y: number, r: number, hue: number, sat = 90, light = 70, life = 0.2) {
    this.glows.push({ x, y, r, hue, sat, light, life, max: life });
  }

  streakLine(ax: number, ay: number, bx: number, by: number, hue = 40, light = 92, width = 10, life = 0.3) {
    this.lines.push({ ax, ay, bx, by, hue, light, width, life, max: life });
  }

  ground(x: number, y: number, r: number, hue = 30, life = 1.4) {
    const segs: Pt[][] = [];
    const count = 7 + Math.floor(Math.random() * 4);
    for (let i = 0; i < count; i++) {
      const a = (i / count) * TAU + rnd(-0.2, 0.2);
      const len = r * rnd(0.5, 1);
      segs.push(jaggedPath(x + Math.cos(a) * 12, y + Math.sin(a) * 12, x + Math.cos(a) * len, y + Math.sin(a) * len, 6, 14));
    }
    this.cracks.push({ x, y, segs, life, max: life, hue });
  }

  frost(x: number, y: number, count = 3) {
    for (let i = 0; i < this.n(count); i++) {
      const a = Math.random() * TAU;
      const life = rnd(0.4, 0.7);
      this.streaks.push({ x: x + rnd(-10, 10), y: y + rnd(-10, 10), vx: Math.cos(a) * 30, vy: Math.sin(a) * 30 - 20,
        hue: 195, sat: 80, light: 88, life, max: life, w: 2, drag: 2, grav: -10 });
    }
  }

  ultimate(x: number, y: number, kanji: string, name: string, hue: number, follow?: Pt) {
    this.cine = { kanji, name, hue, t: 0, dur: 1.15 };
    this.glow(x, y, 220, hue, 90, 70, 0.35);
    this.shockwave(x, y, 360, { hue, life: 0.6, width: 18, lines: 18 });
    this.shockwave(x, y, 220, { hue, life: 0.45, width: 8, delay: 0.08, light: 85 });
    this.enso(x, y, 80, hue, { life: 0.9, width: 9, light: 65, follow });
    this.burst(x, y, { count: 26, hue, light: 75, speed: 520, life: 0.5, w: 2.5 });
    this.seal(x, y - 64, kanji, hue, 46, 1.0, follow);
  }

  abilityCast(x: number, y: number, kanji: string, hue: number, follow?: Pt) {
    this.enso(x, y, 34, hue, { life: 0.45, width: 4, light: 70, follow });
    this.seal(x, y - 42, kanji, hue, 26, 0.7, follow);
    this.burst(x, y, { count: 8, hue, light: 78, speed: 240, life: 0.3 });
  }

  levelUp(x: number, y: number) {
    this.glow(x, y, 90, 45, 95, 70, 0.4);
    this.shockwave(x, y, 140, { hue: 45, life: 0.55, width: 6, light: 75 });
    for (let i = 0; i < this.n(16); i++) {
      const life = rnd(0.6, 1);
      this.streaks.push({ x: x + rnd(-22, 22), y: y + rnd(-6, 10), vx: rnd(-10, 10), vy: rnd(-260, -140),
        hue: 45, sat: 95, light: 75, life, max: life, w: 2.2, drag: 1.5, grav: 0 });
    }
  }

  death(x: number, y: number, size: number, boss: boolean) {
    this.burst(x, y, { count: boss ? 30 : 7, hue: 358, sat: 70, light: 45, speed: boss ? 480 : 260, life: boss ? 0.6 : 0.32, w: boss ? 3 : 2 });
    this.smoke(x, y, boss ? 12 : 3, size * 2.4, 8, 0, 20);
    if (boss) {
      this.shockwave(x, y, 420, { hue: 358, life: 0.8, width: 22, lines: 24, light: 55 });
      this.glow(x, y, 260, 20, 95, 70, 0.5);
      this.ground(x, y, 160, 358, 2);
    }
  }

  // ───────── Update ─────────
  update(dt: number) {
    const tick = <T extends { life: number }>(arr: T[]) => {
      let w = 0;
      for (let i = 0; i < arr.length; i++) {
        const o = arr[i];
        o.life -= dt;
        if (o.life > 0) arr[w++] = o;
      }
      arr.length = w;
    };
    for (const s of this.shocks) if (s.delay > 0) { s.delay -= dt; s.life = Math.min(s.max, s.life + dt); }
    for (const s of this.streaks) {
      s.x += s.vx * dt; s.y += s.vy * dt;
      const k = Math.max(0, 1 - s.drag * dt);
      s.vx *= k; s.vy = s.vy * k + s.grav * dt;
    }
    for (const p of this.puffs) { p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 1 - 2 * dt; p.vy *= 1 - 2 * dt; p.r += p.grow * dt; }
    for (const f of this.flames) { f.x += f.vx * dt; f.y += f.vy * dt; }
    for (const b of this.bolts) {
      b.rejit -= dt;
      if (b.rejit <= 0) {
        b.rejit = 0.05;
        b.pts = jaggedPath(b.ax, b.ay, b.bx, b.by, b.pts.length - 1, 18);
      }
    }
    for (const a of this.arcs) if (a.follow) { a.x = a.follow.x; a.y = a.follow.y; }
    for (const s of this.seals) if (s.follow) { s.x = s.follow.x; s.y = s.follow.y - 54; }
    for (const e of this.ensos) if (e.follow) { e.x = e.follow.x; e.y = e.follow.y; }
    tick(this.arcs); tick(this.shocks); tick(this.streaks); tick(this.bolts); tick(this.seals);
    tick(this.ensos); tick(this.puffs); tick(this.flames); tick(this.glows); tick(this.lines); tick(this.cracks);
    if (this.cine) { this.cine.t += dt; if (this.cine.t >= this.cine.dur) this.cine = null; }
    this.aura.t += dt;
  }

  // ───────── Draw (world space) ─────────
  drawGround(ctx: CanvasRenderingContext2D) {
    for (const c of this.cracks) {
      const t = c.life / c.max;
      ctx.save();
      ctx.lineCap = "round";
      ctx.strokeStyle = hsla(c.hue, 60, 8, 0.75 * Math.min(1, t * 2));
      ctx.lineWidth = 3;
      for (const seg of c.segs) {
        ctx.beginPath();
        ctx.moveTo(seg[0].x, seg[0].y);
        for (let i = 1; i < seg.length; i++) ctx.lineTo(seg[i].x, seg[i].y);
        ctx.stroke();
      }
      ctx.strokeStyle = hsla(c.hue, 90, 60, 0.5 * t * t);
      ctx.lineWidth = 1.2;
      for (const seg of c.segs) {
        ctx.beginPath();
        ctx.moveTo(seg[0].x, seg[0].y);
        for (let i = 1; i < seg.length; i++) ctx.lineTo(seg[i].x, seg[i].y);
        ctx.stroke();
      }
      ctx.restore();
    }
    if (this.aura.on) {
      const { x, y, hue, t } = this.aura;
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      const r = 30 + Math.sin(t * 6) * 3;
      ctx.lineWidth = 3;
      for (let i = 0; i < 3; i++) {
        const a0 = t * 3 + (i * TAU) / 3;
        ctx.strokeStyle = hsla(hue, 90, 65, 0.55);
        ctx.beginPath();
        ctx.arc(x, y, r, a0, a0 + 1.1);
        ctx.stroke();
      }
      const g = ctx.createRadialGradient(x, y, 8, x, y, 54);
      g.addColorStop(0, hsla(hue, 90, 60, 0.22));
      g.addColorStop(1, hsla(hue, 90, 60, 0));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, 54, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
  }

  drawWorld(ctx: CanvasRenderingContext2D) {
    ctx.save();
    // Smoke (normal blending, under everything bright)
    for (const p of this.puffs) {
      const t = p.life / p.max;
      ctx.fillStyle = hsla(p.hue, p.sat, p.light, 0.45 * Math.min(1, t * 1.5));
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(0.5, p.r), 0, TAU);
      ctx.fill();
    }
    // Ensō brush circles
    for (const e of this.ensos) {
      const t = e.life / e.max;
      const draw = easeOut(Math.min(1, (1 - t) / 0.35));
      const segs = 16;
      ctx.lineCap = "round";
      for (let i = 0; i < segs * draw; i++) {
        const a0 = e.rot + (i / segs) * TAU * 0.92;
        const a1 = e.rot + ((i + 1) / segs) * TAU * 0.92;
        const taper = Math.sin(((i + 0.5) / segs) * Math.PI);
        ctx.strokeStyle = hsla(e.hue, e.sat, e.light, 0.85 * Math.min(1, t * 1.6));
        ctx.lineWidth = e.width * (0.35 + taper * 0.9);
        ctx.beginPath();
        ctx.arc(e.x, e.y, Math.max(0.5, e.r * (1 + (1 - t) * 0.12)), a0, a1);
        ctx.stroke();
      }
    }
    // Shockwaves
    for (const s of this.shocks) {
      if (s.delay > 0) continue;
      const t = Math.min(1, s.life / s.max);
      const k = easeOut(Math.max(0, 1 - t));
      const r = Math.max(0.1, s.r * k);
      ctx.lineCap = "round";
      ctx.strokeStyle = hsla(s.hue, s.sat, s.light, 0.25 * t);
      ctx.lineWidth = s.width * 2.4 * t + 2;
      ctx.beginPath(); ctx.arc(s.x, s.y, r, 0, TAU); ctx.stroke();
      ctx.strokeStyle = hsla(s.hue, s.sat, Math.min(96, s.light + 18), 0.9 * t);
      ctx.lineWidth = Math.max(1, s.width * t);
      ctx.beginPath(); ctx.arc(s.x, s.y, r, 0, TAU); ctx.stroke();
      if (s.lines > 0) {
        ctx.strokeStyle = hsla(s.hue, s.sat, 85, 0.6 * t);
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < s.lines; i++) {
          const a = (i / s.lines) * TAU + s.x * 0.01;
          const r0 = r * 0.82, r1 = r * 1.08 + 20 * t;
          ctx.moveTo(s.x + Math.cos(a) * r0, s.y + Math.sin(a) * r0);
          ctx.lineTo(s.x + Math.cos(a) * r1, s.y + Math.sin(a) * r1);
        }
        ctx.stroke();
      }
    }
    // Cracks/aura are drawn in drawGround (under actors).
    ctx.globalCompositeOperation = "lighter";
    // Glows
    for (const g of this.glows) {
      const t = g.life / g.max;
      const gr = ctx.createRadialGradient(g.x, g.y, 0, g.x, g.y, g.r);
      gr.addColorStop(0, hsla(g.hue, g.sat, g.light, 0.55 * t));
      gr.addColorStop(1, hsla(g.hue, g.sat, g.light, 0));
      ctx.fillStyle = gr;
      ctx.beginPath(); ctx.arc(g.x, g.y, g.r, 0, TAU); ctx.fill();
    }
    // Blade arcs (crescents that sweep then fade)
    for (const a of this.arcs) {
      const t = a.life / a.max;
      const sweep = easeOut(Math.min(1, (1 - t) / 0.45));
      const full = a.arc >= TAU - 0.01;
      const span = full ? TAU * Math.max(0.15, sweep) : a.arc * Math.max(0.1, sweep);
      const start = full ? a.ang - span * a.dir : a.ang - (a.arc / 2) * a.dir;
      const end = start + span * a.dir;
      const r = a.r * (0.92 + (1 - t) * 0.12);
      const w = a.width * (0.5 + t * 0.5);
      const mid = (start + end) / 2;
      const ccw = a.dir < 0;
      const shape = (rad: number, thick: number) => {
        rad = Math.max(0.5, rad);
        thick = Math.min(thick, rad - 0.25);
        ctx.beginPath();
        ctx.arc(a.x, a.y, rad, start, end, ccw);
        if (full) {
          ctx.arc(a.x, a.y, rad - thick, end, start, !ccw);
        } else {
          ctx.arc(a.x - Math.cos(mid) * thick, a.y - Math.sin(mid) * thick, rad, end, start, !ccw);
        }
        ctx.closePath();
      };
      ctx.fillStyle = hsla(a.hue, Math.max(a.sat, 70), 60, 0.35 * t);
      shape(r + w * 0.35, w * 1.5);
      ctx.fill();
      ctx.fillStyle = hsla(a.hue, a.sat, a.light, 0.95 * t);
      shape(r, w);
      ctx.fill();
    }
    // Streak lines (dash/teleport trails)
    for (const l of this.lines) {
      const t = l.life / l.max;
      ctx.lineCap = "round";
      ctx.strokeStyle = hsla(l.hue, 80, 60, 0.3 * t);
      ctx.lineWidth = l.width * 2.2 * t;
      ctx.beginPath(); ctx.moveTo(l.ax, l.ay); ctx.lineTo(l.bx, l.by); ctx.stroke();
      ctx.strokeStyle = hsla(l.hue, 60, l.light, 0.95 * t);
      ctx.lineWidth = Math.max(1, l.width * 0.5 * t);
      ctx.beginPath(); ctx.moveTo(l.ax, l.ay); ctx.lineTo(l.bx, l.by); ctx.stroke();
    }
    // Streak sparks
    ctx.lineCap = "round";
    for (const s of this.streaks) {
      const t = s.life / s.max;
      ctx.strokeStyle = hsla(s.hue, s.sat, s.light, t);
      ctx.lineWidth = s.w * (0.4 + t * 0.6);
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x - s.vx * 0.035, s.y - s.vy * 0.035);
      ctx.stroke();
    }
    // Flames
    for (const f of this.flames) {
      const t = f.life / f.max;
      const sz = f.size * (0.4 + t * 0.6);
      ctx.fillStyle = hsla(f.hue, 100, 45 + t * 25, 0.85 * t);
      ctx.beginPath();
      ctx.moveTo(f.x, f.y - sz * 2.2);
      ctx.quadraticCurveTo(f.x + sz, f.y - sz * 0.2, f.x, f.y + sz * 0.6);
      ctx.quadraticCurveTo(f.x - sz, f.y - sz * 0.2, f.x, f.y - sz * 2.2);
      ctx.fill();
    }
    // Lightning
    for (const b of this.bolts) {
      const t = b.life / b.max;
      const path = (pts: Pt[]) => { ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y); };
      ctx.lineJoin = "round";
      ctx.strokeStyle = hsla(b.hue, 100, 60, 0.35 * t); ctx.lineWidth = 9 * t + 2; path(b.pts); ctx.stroke();
      ctx.strokeStyle = hsla(b.hue, 100, 75, 0.8 * t); ctx.lineWidth = 3.5 * t + 1; path(b.pts); ctx.stroke();
      ctx.strokeStyle = hsla(b.hue, 40, 97, t); ctx.lineWidth = 1.4; path(b.pts); ctx.stroke();
      ctx.strokeStyle = hsla(b.hue, 100, 80, 0.7 * t); ctx.lineWidth = 1.2; path(b.branch); ctx.stroke();
    }
    ctx.restore();
    // Kanji seals (normal blending, stamped then rise and fade)
    for (const s of this.seals) {
      const age = s.max - s.life;
      const t = s.life / s.max;
      const stamp = age < 0.12 ? 1.7 - (age / 0.12) * 0.7 : 1;
      const rise = (1 - t) * 18;
      ctx.save();
      ctx.translate(s.x, s.y - rise);
      ctx.scale(stamp, stamp);
      ctx.globalAlpha = Math.min(1, t * 2.5);
      ctx.font = `700 ${s.size}px "Hiragino Mincho ProN","Yu Mincho","Noto Serif JP",serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.lineWidth = 5;
      ctx.strokeStyle = "rgba(0,0,0,.75)";
      ctx.strokeText(s.text, 0, 0);
      ctx.fillStyle = hsla(s.hue, 85, 70, 1);
      ctx.fillText(s.text, 0, 0);
      ctx.restore();
    }
  }

  // ───────── Draw (screen space) ─────────
  drawScreen(ctx: CanvasRenderingContext2D, W: number, H: number) {
    const c = this.cine;
    if (!c) return;
    const p = c.t / c.dur;
    const inT = easeOut(Math.min(1, p / 0.18));
    const outT = p > 0.75 ? (p - 0.75) / 0.25 : 0;
    const vis = inT * (1 - outT);
    ctx.save();
    // Letterbox bars
    const bar = H * 0.09 * vis;
    ctx.fillStyle = "rgba(0,0,0,0.92)";
    ctx.fillRect(0, 0, W, bar);
    ctx.fillRect(0, H - bar, W, bar);
    // Diagonal brush band
    const bandH = Math.min(220, H * 0.28);
    const sweep = easeOut(Math.min(1, p / 0.22));
    ctx.translate(W / 2, H / 2);
    ctx.rotate(-0.12);
    const bw = W * 1.4 * sweep;
    const g = ctx.createLinearGradient(-W * 0.7, 0, -W * 0.7 + bw, 0);
    g.addColorStop(0, hsla(c.hue, 70, 18, 0));
    g.addColorStop(0.15, hsla(c.hue, 70, 18, 0.85 * vis));
    g.addColorStop(0.85, hsla(c.hue, 70, 14, 0.85 * vis));
    g.addColorStop(1, hsla(c.hue, 70, 14, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(-W * 0.7, -bandH / 2 + 8);
    ctx.lineTo(-W * 0.7 + bw, -bandH / 2);
    ctx.lineTo(-W * 0.7 + bw, bandH / 2 - 6);
    ctx.lineTo(-W * 0.7, bandH / 2);
    ctx.closePath();
    ctx.fill();
    // Edge highlight lines
    ctx.strokeStyle = hsla(c.hue, 90, 65, 0.8 * vis);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-W * 0.7, -bandH / 2 + 8); ctx.lineTo(-W * 0.7 + bw, -bandH / 2);
    ctx.moveTo(-W * 0.7, bandH / 2); ctx.lineTo(-W * 0.7 + bw, bandH / 2 - 6);
    ctx.stroke();
    ctx.rotate(0.12);
    // Kanji stamp
    const kp = Math.min(1, Math.max(0, (p - 0.08) / 0.14));
    const ks = 1.8 - easeOut(kp) * 0.8;
    const size = Math.min(150, H * 0.22);
    ctx.globalAlpha = kp * (1 - outT);
    ctx.font = `900 ${size * ks}px "Hiragino Mincho ProN","Yu Mincho","Noto Serif JP",serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineWidth = 10;
    ctx.strokeStyle = "rgba(0,0,0,.8)";
    const kx = -Math.min(260, W * 0.2);
    ctx.strokeText(c.kanji, kx, 0);
    ctx.fillStyle = hsla(c.hue, 90, 72, 1);
    ctx.fillText(c.kanji, kx, 0);
    // Name
    const np = Math.min(1, Math.max(0, (p - 0.16) / 0.15));
    ctx.globalAlpha = np * (1 - outT);
    ctx.textAlign = "left";
    ctx.font = `700 ${Math.min(40, H * 0.055)}px "Hiragino Mincho ProN","Yu Mincho",Georgia,serif`;
    ctx.lineWidth = 6;
    const nx = kx + size * 0.75 + (1 - easeOut(np)) * 40;
    ctx.strokeText(c.name.toUpperCase(), nx, 4);
    ctx.fillStyle = "#f3ead2";
    ctx.fillText(c.name.toUpperCase(), nx, 4);
    ctx.font = `600 ${Math.min(13, H * 0.02)}px system-ui, sans-serif`;
    ctx.fillStyle = hsla(c.hue, 80, 70, 1);
    ctx.fillText("ULTIMATE", nx + 2, -Math.min(30, H * 0.045));
    ctx.restore();
  }
}
