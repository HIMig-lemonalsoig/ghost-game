// ─── Ult signature visuals (ult visual pass 2) ───────────────────────────────
// Every power-up / buff ult gets its own unmistakable look, so you can tell at
// a glance which one is running (they used to share one small colored ring).
//
//   Berserker  Blood Rage        – crimson flame tongues + pulsing red veins
//   Kabuki     Grand Finale      – stage spotlight (screen dims), kumadori ring, confetti
//   Yamabushi  Mountain's End.   – stone mandala + orbiting rock plates + peaks
//   Shinobi    Shadow Step       – violet afterimages + smoke wisps
//   Tengu      Divine Wind       – wind vortex arcs + falling feathers + speed lines
//   Kagebushi  Shadow Consume    – spreading void with tendrils that grab foes
//   Raijin     Heaven's Drum     – ring of taiko drums with lightning between them
//   Kitsune    Nine Tails        – nine fire tails fanning out on cast
//   Samurai    Iai Chain         – golden slash path linking every blink
//
// Drawn in world space. "under" = beneath the player, "over" = on top.
/* eslint-disable @typescript-eslint/no-explicit-any */

type Ctx = CanvasRenderingContext2D;
const TAU = Math.PI * 2;

/** Positions recorded while a movement ult runs (afterimages / paths). */
export interface TrailPt { x: number; y: number; life: number; ang: number; kind: "shadow" | "wind" | "iai" | "rage" }

export function updateUltTrail(g: any, dt: number) {
  const trail: TrailPt[] = g.ultTrail ?? (g.ultTrail = []);
  for (const t of trail) t.life -= dt;
  while (trail.length && trail[0].life <= 0) trail.shift();
  if (!g.player) return;
  const kind: TrailPt["kind"] | null =
    g.ultShadowStepTimer > 0 ? "shadow" :
    g.ultWindTimer > 0 ? "wind" :
    g.iaiChainRemaining > 0 ? "iai" :
    g.ultBloodRageTimer > 0 ? "rage" : null;
  if (!kind) { g.ultTrailLast = null; return; }
  const p = g.player.pos, last = g.ultTrailLast as { x: number; y: number } | null;
  const gap = kind === "iai" ? 4 : 14;
  if (!last || Math.hypot(p.x - last.x, p.y - last.y) > gap) {
    const life = kind === "iai" ? 0.9 : kind === "shadow" ? 0.45 : 0.35;
    trail.push({ x: p.x, y: p.y, life, ang: g.player.facing, kind });
    g.ultTrailLast = { x: p.x, y: p.y };
    if (trail.length > 80) trail.shift();
  }
  if (g.kitsuneTailsT > 0) g.kitsuneTailsT = Math.max(0, g.kitsuneTailsT - dt);
}

export function drawUltUnder(g: any, ctx: Ctx) {
  if (!g.player) return;
  const p = g.player.pos, t = g.elapsed as number, R = 16;

  // ── Kabuki: stage spotlight — everything else dims, you're centre stage.
  if (g.ultFinaleTimer > 0) {
    const fade = Math.min(1, g.ultFinaleTimer / 0.4);
    const cx = g.cameraX, cy = g.cameraY, W = g.width, H = g.height, SR = 150;
    ctx.save();
    ctx.globalAlpha = 0.42 * Math.max(0, Math.min(1, fade));
    ctx.fillStyle = "hsl(330, 40%, 4%)";
    ctx.beginPath();
    ctx.rect(cx - 200, cy - 200, W + 400, H + 400);
    ctx.ellipse(p.x, p.y + 6, SR, SR * 0.72, 0, 0, TAU, true);
    ctx.fill("evenodd");
    ctx.restore();
    ctx.save();
    const lg = ctx.createRadialGradient(p.x, p.y, 10, p.x, p.y, SR);
    lg.addColorStop(0, "hsla(45, 100%, 88%, 0.32)");
    lg.addColorStop(0.75, "hsla(40, 100%, 75%, 0.12)");
    lg.addColorStop(1, "hsla(40, 100%, 70%, 0)");
    ctx.fillStyle = lg;
    ctx.beginPath(); ctx.ellipse(p.x, p.y + 6, SR, SR * 0.72, 0, 0, TAU); ctx.fill();
    // Kumadori ring: red & white stage stripes turning around you.
    ctx.translate(p.x, p.y);
    ctx.rotate(t * 1.6);
    for (let i = 0; i < 12; i++) {
      ctx.strokeStyle = i % 2 ? "hsla(0, 0%, 96%, 0.85)" : "hsla(355, 85%, 52%, 0.9)";
      ctx.lineWidth = 6;
      ctx.beginPath(); ctx.arc(0, 0, R + 30, (i / 12) * TAU, ((i + 0.8) / 12) * TAU); ctx.stroke();
    }
    ctx.restore();
    if (Math.random() < 0.5) {   // confetti / petals drifting down through the light
      const a = Math.random() * TAU, d = Math.random() * 140;
      g.fx.burst(p.x + Math.cos(a) * d, p.y - 60 + Math.sin(a) * d * 0.5, { count: 1, hue: Math.random() < 0.5 ? 340 : 46, sat: 90, light: 72, speed: 30, life: 1.1, grav: 90, w: 3 });
    }
  }

  // ── Yamabushi: stone mandala under your feet + mountain peaks.
  if (g.ultMountainTimer > 0) {
    const k = Math.min(1, g.ultMountainTimer / 0.4);
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.globalAlpha = 0.85 * k;
    ctx.strokeStyle = "hsla(38, 70%, 62%, 0.9)";
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(0, 0, 74, 0, TAU); ctx.stroke();
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(0, 0, 62, 0, TAU); ctx.stroke();
    ctx.save();
    ctx.rotate(-t * 0.6);
    for (let i = 0; i < 8; i++) {   // eight mountain peaks pointing out
      ctx.rotate(TAU / 8);
      ctx.fillStyle = "hsla(30, 30%, 38%, 0.75)";
      ctx.beginPath(); ctx.moveTo(-12, -62); ctx.lineTo(0, -88); ctx.lineTo(12, -62); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "hsla(42, 80%, 70%, 0.9)"; ctx.lineWidth = 1.5; ctx.stroke();
    }
    ctx.restore();
    ctx.fillStyle = "hsla(38, 80%, 60%, 0.13)";
    ctx.beginPath(); ctx.arc(0, 0, 62, 0, TAU); ctx.fill();
    ctx.restore();
  }

  // ── Kagebushi: a spreading void; tendrils reach out and grab nearby foes.
  if (g.ultShadowConsumeTimer > 0) {
    const VR = 120;
    ctx.save();
    const vg = ctx.createRadialGradient(p.x, p.y, 8, p.x, p.y, VR);
    vg.addColorStop(0, "hsla(265, 70%, 6%, 0.9)");
    vg.addColorStop(0.7, "hsla(265, 60%, 12%, 0.55)");
    vg.addColorStop(1, "hsla(265, 60%, 20%, 0)");
    ctx.fillStyle = vg;
    ctx.beginPath();
    for (let i = 0; i <= 40; i++) {   // wobbling ink edge
      const a = (i / 40) * TAU, r = VR * (0.85 + 0.12 * Math.sin(a * 5 + t * 3));
      i ? ctx.lineTo(p.x + Math.cos(a) * r, p.y + Math.sin(a) * r) : ctx.moveTo(p.x + Math.cos(a) * r, p.y + Math.sin(a) * r);
    }
    ctx.fill();
    ctx.strokeStyle = "hsla(275, 80%, 55%, 0.75)";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    let n = 0;
    for (const e of g.enemies) {
      if (e.state === "dead" || n > 7) continue;
      const dx = e.pos.x - p.x, dy = e.pos.y - p.y, d = Math.hypot(dx, dy);
      if (d > 200) continue;
      n++;
      const nx = -dy / (d || 1), ny = dx / (d || 1), w = Math.sin(t * 9 + e.id) * 18;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.quadraticCurveTo(p.x + dx / 2 + nx * w, p.y + dy / 2 + ny * w, e.pos.x, e.pos.y);
      ctx.stroke();
    }
    ctx.restore();
  }

  // ── Trails: shadow afterimages, wind streaks, golden iai path, rage embers.
  const trail: TrailPt[] = g.ultTrail ?? [];
  if (trail.length) {
    ctx.save();
    const iai = trail.filter(q => q.kind === "iai");
    if (iai.length > 1) {   // Samurai: the path of every blink, a golden stroke
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      for (const [w, col] of [[12, "hsla(45, 100%, 60%, 0.25)"], [4, "hsla(48, 100%, 85%, 0.95)"]] as const) {
        ctx.strokeStyle = col; ctx.lineWidth = w;
        ctx.beginPath();
        iai.forEach((q, i) => i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y));
        ctx.stroke();
      }
    }
    for (const q of trail) {
      const a = Math.max(0, q.life);
      if (q.kind === "shadow") {   // Shinobi: violet afterimages
        ctx.globalAlpha = a * 0.9;
        ctx.fillStyle = "hsla(270, 60%, 30%, 0.8)";
        ctx.beginPath(); ctx.arc(q.x, q.y, R, 0, TAU); ctx.fill();
        ctx.strokeStyle = "hsla(280, 90%, 72%, 0.9)"; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(q.x, q.y, R + 1, 0, TAU); ctx.stroke();
      } else if (q.kind === "wind") {   // Tengu: speed streaks behind you
        ctx.globalAlpha = a * 1.8;
        ctx.strokeStyle = "hsla(150, 60%, 88%, 0.9)"; ctx.lineWidth = 2;
        const bx = Math.cos(q.ang + Math.PI) * 26, by = Math.sin(q.ang + Math.PI) * 26;
        for (const s of [-10, 0, 10]) {
          const ox = -Math.sin(q.ang) * s, oy = Math.cos(q.ang) * s;
          ctx.beginPath(); ctx.moveTo(q.x + ox, q.y + oy); ctx.lineTo(q.x + ox + bx, q.y + oy + by); ctx.stroke();
        }
      } else if (q.kind === "rage") {   // Berserker: smouldering footprints
        ctx.globalAlpha = a * 1.5;
        ctx.fillStyle = "hsla(8, 95%, 50%, 0.5)";
        ctx.beginPath(); ctx.arc(q.x, q.y + 8, 7, 0, TAU); ctx.fill();
      }
    }
    ctx.restore();
  }
}

export function drawUltOver(g: any, ctx: Ctx) {
  if (!g.player) return;
  const p = g.player.pos, t = g.elapsed as number, R = 16;

  // ── Berserker: crimson flame tongues licking upward + pulsing veins.
  if (g.ultBloodRageTimer > 0) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * TAU + Math.sin(t * 3 + i) * 0.15;
      const base = R + 4, h = 26 + 14 * Math.abs(Math.sin(t * 11 + i * 1.7));
      const bx = p.x + Math.cos(a) * base, by = p.y + Math.sin(a) * base * 0.8;
      const fg = ctx.createLinearGradient(bx, by, bx, by - h);
      fg.addColorStop(0, "hsla(0, 95%, 45%, 0.75)");
      fg.addColorStop(0.6, "hsla(18, 100%, 55%, 0.45)");
      fg.addColorStop(1, "hsla(40, 100%, 65%, 0)");
      ctx.fillStyle = fg;
      ctx.beginPath();
      ctx.moveTo(bx - 6, by);
      ctx.quadraticCurveTo(bx - 4 + Math.sin(t * 13 + i) * 5, by - h * 0.6, bx + Math.sin(t * 7 + i) * 6, by - h);
      ctx.quadraticCurveTo(bx + 4, by - h * 0.5, bx + 6, by);
      ctx.fill();
    }
    ctx.restore();
    ctx.save();
    const beat = Math.max(0, Math.sin(t * 9));   // heartbeat ring
    ctx.strokeStyle = `hsla(355, 95%, 55%, ${0.35 + 0.5 * beat})`;
    ctx.lineWidth = 2 + 3 * beat;
    ctx.beginPath(); ctx.arc(p.x, p.y, R + 22 + beat * 8, 0, TAU); ctx.stroke();
    ctx.fillStyle = `hsla(355, 95%, 60%, ${0.5 + 0.4 * beat})`;
    ctx.font = "bold 18px serif"; ctx.textAlign = "center";
    ctx.fillText("狂", p.x, p.y - R - 26);
    ctx.restore();
  }

  // ── Yamabushi: rock plates orbiting you like armour.
  if (g.ultMountainTimer > 0) {
    ctx.save();
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * TAU + t * 1.4, r = R + 20;
      const x = p.x + Math.cos(a) * r, y = p.y + Math.sin(a) * r;
      ctx.save();
      ctx.translate(x, y); ctx.rotate(a);
      ctx.fillStyle = "hsl(30, 18%, 42%)";
      ctx.strokeStyle = "hsl(40, 70%, 68%)"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(-7, -9); ctx.lineTo(7, -7); ctx.lineTo(9, 6); ctx.lineTo(-5, 9); ctx.lineTo(-9, 1); ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.restore();
    }
    ctx.fillStyle = "hsla(42, 85%, 70%, 0.95)";
    ctx.font = "bold 18px serif"; ctx.textAlign = "center";
    ctx.fillText("岳", p.x, p.y - R - 26);
    ctx.restore();
  }

  // ── Shinobi: smoke wisps curling off you.
  if (g.ultShadowStepTimer > 0 && Math.random() < 0.2) {
    g.fx.smoke(p.x + (Math.random() - 0.5) * 20, p.y + (Math.random() - 0.5) * 20, 1, 10, 45, 275, 45);
  }

  // ── Tengu: a whirlwind of arcs around you, plus falling feathers.
  if (g.ultWindTimer > 0) {
    ctx.save();
    ctx.lineCap = "round";
    for (let i = 0; i < 5; i++) {
      const r = R + 18 + i * 9, a0 = t * (5 - i * 0.6) + i * 1.3;
      ctx.strokeStyle = `hsla(${145 + i * 8}, 55%, ${86 - i * 5}%, ${0.75 - i * 0.1})`;
      ctx.lineWidth = 3 - i * 0.35;
      ctx.beginPath(); ctx.arc(p.x, p.y, r, a0, a0 + 1.6); ctx.stroke();
      ctx.beginPath(); ctx.arc(p.x, p.y, r, a0 + Math.PI, a0 + Math.PI + 1.6); ctx.stroke();
    }
    ctx.restore();
    if (Math.random() < 0.35) {
      const a = Math.random() * TAU;
      g.fx.burst(p.x + Math.cos(a) * 40, p.y + Math.sin(a) * 40 - 20, { count: 1, hue: 30, sat: 20, light: 92, speed: 40, life: 0.9, grav: 60, w: 4 });
    }
  }

  // ── Raijin: Heaven's Drum — the ring of taiko drums, crackling between them.
  if (g.ultThunderTimer > 0) {
    const N = 8, DR = R + 40;
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i < N; i++) {
      const a = (i / N) * TAU + t * 0.9;
      pts.push({ x: p.x + Math.cos(a) * DR, y: p.y + Math.sin(a) * DR });
    }
    ctx.save();
    ctx.strokeStyle = "hsla(205, 100%, 80%, 0.85)";
    ctx.lineWidth = 1.5;
    for (let i = 0; i < N; i++) {   // jittery lightning between neighbouring drums
      if ((Math.floor(t * 20) + i) % 3 === 0) continue;
      const a = pts[i], b = pts[(i + 1) % N];
      ctx.beginPath(); ctx.moveTo(a.x, a.y);
      for (let s = 1; s < 4; s++) {
        const k = s / 4;
        ctx.lineTo(a.x + (b.x - a.x) * k + (Math.random() - 0.5) * 10, a.y + (b.y - a.y) * k + (Math.random() - 0.5) * 10);
      }
      ctx.lineTo(b.x, b.y); ctx.stroke();
    }
    for (const q of pts) {   // drums with a tomoe swirl
      ctx.fillStyle = "hsl(18, 55%, 30%)";
      ctx.beginPath(); ctx.arc(q.x, q.y, 9, 0, TAU); ctx.fill();
      ctx.strokeStyle = "hsl(42, 80%, 62%)"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(q.x, q.y, 9, 0, TAU); ctx.stroke();
      ctx.fillStyle = "hsl(205, 100%, 80%)";
      ctx.beginPath(); ctx.arc(q.x, q.y, 3.5, t * 6, t * 6 + 4.2); ctx.fill();
    }
    ctx.restore();
  }

  // ── Kitsune: nine fire tails fanning out behind you on cast.
  if (g.kitsuneTailsT > 0) {
    const k = g.kitsuneTailsT / 1.6;   // 1 → 0
    const spread = Math.min(1, (1 - k) * 6);
    const back = g.player.facing + Math.PI;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.lineCap = "round";
    for (let i = 0; i < 9; i++) {
      const a = back + (i / 8 - 0.5) * 3.6 * spread;
      const len = 70 + 16 * Math.sin(t * 6 + i);
      const sway = Math.sin(t * 5 + i) * 0.35;
      const mx = p.x + Math.cos(a) * len * 0.55, my = p.y + Math.sin(a) * len * 0.55;
      const ex = p.x + Math.cos(a + sway) * len, ey = p.y + Math.sin(a + sway) * len;
      for (const [w, col] of [[14, `hsla(22, 100%, 55%, ${0.35 * k + 0.1})`], [6, `hsla(40, 100%, 78%, ${0.7 * k + 0.15})`]] as const) {
        ctx.strokeStyle = col; ctx.lineWidth = w;
        ctx.beginPath(); ctx.moveTo(p.x, p.y);
        ctx.quadraticCurveTo(mx + Math.cos(a + 1.57) * 14, my + Math.sin(a + 1.57) * 14, ex, ey);
        ctx.stroke();
      }
      ctx.fillStyle = `hsla(48, 100%, 92%, ${0.8 * k + 0.1})`;
      ctx.beginPath(); ctx.arc(ex, ey, 4, 0, TAU); ctx.fill();
    }
    ctx.restore();
  }
}
