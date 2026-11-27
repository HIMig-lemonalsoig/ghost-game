// Ultimate presentation: each class has its own cutscene pose and motif.
// ULT_STYLES is a Record over ClassId, so adding a class without giving it
// a unique style is a type error.
import type { ClassId } from "./GhostGame";

export type UltPose = "draw" | "crouch" | "raise" | "plant" | "spin" | "cast" | "guard" | "aim" | "slam" | "lunge";
export type UltMotif =
  | "moon" | "smoke" | "blood" | "leaves" | "petals" | "ghosts" | "mirror" | "embers" | "rain" | "earth"
  | "gold" | "talismans" | "banner" | "ribbons" | "web" | "sun" | "void" | "fox" | "lightning" | "snow"
  | "wheel" | "water" | "wind" | "spotlight" | "spears";

export interface UltStyle { pose: UltPose; motif: UltMotif; line: string; }

export const ULT_STYLES: Record<ClassId, UltStyle> = {
  kensei:     { pose: "draw",   motif: "moon",      line: "One breath. One cut." },
  shinobi:    { pose: "crouch", motif: "smoke",     line: "You never saw me." },
  ronin:      { pose: "raise",  motif: "blood",     line: "Every debt is paid in blood." },
  yamabushi:  { pose: "plant",  motif: "leaves",    line: "The mountain does not fall." },
  onna:       { pose: "spin",   motif: "petals",    line: "A thousand blossoms, a thousand cuts." },
  dokkaebi:   { pose: "cast",   motif: "ghosts",    line: "Rise, my restless dead." },
  kagemusha:  { pose: "guard",  motif: "mirror",    line: "Which of us is real?" },
  berserker:  { pose: "raise",  motif: "embers",    line: "Let the blood boil!" },
  arashi:     { pose: "aim",    motif: "rain",      line: "Let the heavens fall." },
  tetsubo:    { pose: "slam",   motif: "earth",     line: "Break the earth itself." },
  samurai:    { pose: "lunge",  motif: "gold",      line: "My blade answers to honor." },
  onmyoji:    { pose: "cast",   motif: "talismans", line: "By seal and spirit, bind them." },
  hatamoto:   { pose: "plant",  motif: "banner",    line: "Hold the line for the Shogun!" },
  kunoichi:   { pose: "lunge",  motif: "ribbons",   line: "Dance with me." },
  tsuchigumo: { pose: "crouch", motif: "web",       line: "Every thread leads to me." },
  miko:       { pose: "cast",   motif: "sun",       line: "Judgement descends." },
  kagebushi:  { pose: "guard",  motif: "void",      line: "Become the dark." },
  kitsune:    { pose: "cast",   motif: "fox",       line: "Nine tails, nine flames." },
  raijin:     { pose: "raise",  motif: "lightning", line: "Hear the drums of thunder!" },
  yukionna:   { pose: "cast",   motif: "snow",      line: "Sleep in the eternal winter." },
  sohei:      { pose: "plant",  motif: "wheel",     line: "Turn the wheel of prayer." },
  ashigaru:   { pose: "lunge",  motif: "spears",    line: "Spears forward!" },
  kappa:      { pose: "cast",   motif: "water",     line: "The river takes all." },
  tengu:      { pose: "spin",   motif: "wind",      line: "Ride the divine wind!" },
  kabuki:     { pose: "guard",  motif: "spotlight", line: "The curtain falls on you." },
  teppo:      { pose: "aim",    motif: "embers",    line: "First rank, fire!" },
  takajo:     { pose: "raise",  motif: "wind",      line: "Hunt, my hawks." },
  karakuri:   { pose: "plant",  motif: "gold",      line: "Wind them up. Let them loose." },
  bakuto:     { pose: "cast",   motif: "petals",    line: "Let the dice decide." },
  rikishi:    { pose: "slam",   motif: "earth",     line: "Out of my ring!" },
  sumie:      { pose: "cast",   motif: "smoke",     line: "What I paint, lives." },
};

// Pose keyframes for the cutscene. k runs 0 → 1; the strike lands at STRIKE.
export const STRIKE = 0.48;
export interface PoseFrame { ang: number; dx: number; dy: number; squash: number; glow: number; }

export function poseFrame(pose: UltPose, k: number): PoseFrame {
  const wind = Math.min(1, k / STRIKE);
  const after = Math.max(0, (k - STRIKE) / (1 - STRIKE));
  const snap = k < STRIKE ? 0 : Math.min(1, after * 6);
  const ease = (t: number) => 1 - Math.pow(1 - t, 3);
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  switch (pose) {
    case "draw":   return { ang: lerp(2.7, 2.7, wind) + (k < STRIKE ? 0 : lerp(0, -3.0, ease(snap))), dx: k < STRIKE ? -2 * wind : lerp(-2, 22, ease(snap)), dy: 0, squash: 1, glow: 0 };
    case "crouch": return { ang: 2.2 - snap * 2.6, dx: lerp(0, -4, wind) + snap * 18, dy: lerp(0, 3, wind) * (1 - snap), squash: lerp(1, 0.86, wind) + snap * 0.14, glow: 0 };
    case "raise":  return { ang: lerp(-0.2, -1.75, ease(wind)) + snap * 2.4, dx: snap * 6, dy: 0, squash: 1, glow: 0 };
    case "plant":  return { ang: lerp(0.6, 1.57, ease(wind)), dx: 0, dy: lerp(0, -2, wind), squash: 1, glow: wind };
    case "spin":   return { ang: ease(wind) * Math.PI * 4 + snap * 0.5, dx: 0, dy: 0, squash: 1, glow: 0 };
    case "cast":   return { ang: lerp(0.4, 0.95, wind), dx: 0, dy: 0, squash: 1, glow: Math.min(1, wind * 1.2) * (1 - after * 0.3) };
    case "guard":  return { ang: lerp(0.3, -1.57, ease(wind)) + snap * 0.2, dx: lerp(0, -3, wind), dy: 0, squash: 1, glow: snap };
    case "aim":    return { ang: lerp(-0.6, -0.15, ease(wind)), dx: -wind * 3 + snap * 3, dy: 0, squash: 1, glow: 0 };
    case "slam":   return { ang: lerp(-0.4, -2.1, ease(wind)) + snap * 3.4, dx: snap * 4, dy: lerp(0, -4, wind) + snap * 6, squash: 1 - snap * 0.1, glow: 0 };
    case "lunge":  return { ang: lerp(0.4, 0.1, wind), dx: lerp(0, -6, ease(wind)) + ease(snap) * 34, dy: 0, squash: 1, glow: 0 };
  }
}

const rnd = (seed: number) => {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

// Screen-space backdrop for a cutscene. (cx, cy) is where the character stands.
export function drawMotif(ctx: CanvasRenderingContext2D, motif: UltMotif, W: number, H: number, k: number, hue: number, cx: number, cy: number) {
  const t = k * 1.35;
  const strike = k >= STRIKE ? Math.min(1, (k - STRIKE) * 5) : 0;
  ctx.save();
  switch (motif) {
    case "moon": {
      const r = H * 0.3;
      const g = ctx.createRadialGradient(W * 0.6, H * 0.42, r * 0.2, W * 0.6, H * 0.42, r * 1.4);
      g.addColorStop(0, "hsla(45, 40%, 92%, 0.95)"); g.addColorStop(0.7, "hsla(45, 40%, 85%, 0.9)"); g.addColorStop(1, "hsla(45, 40%, 80%, 0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(W * 0.6, H * 0.42, r * 1.4, 0, Math.PI * 2); ctx.fill();
      if (strike > 0) {
        ctx.strokeStyle = `hsla(0, 0%, 100%, ${1 - strike * 0.6})`; ctx.lineWidth = 6 * (1 - strike) + 1;
        ctx.beginPath(); ctx.moveTo(0, H * 0.5 - 30); ctx.lineTo(W, H * 0.5 - 80); ctx.stroke();
      }
      break;
    }
    case "smoke":
      for (let i = 0; i < 26; i++) {
        const x = rnd(i) * W, y = H * 0.4 + rnd(i + 50) * H * 0.6 - t * 60 * rnd(i + 9);
        ctx.fillStyle = `hsla(250, 10%, ${18 + rnd(i + 3) * 20}%, 0.45)`;
        ctx.beginPath(); ctx.arc(x, y, 40 + rnd(i + 7) * 90 + t * 30, 0, Math.PI * 2); ctx.fill();
      }
      break;
    case "blood":
      for (let i = 0; i < 18; i++) {
        const sp = Math.min(1, k * 2.2) * (0.6 + rnd(i) * 0.6);
        const a = rnd(i + 2) * Math.PI * 2;
        ctx.fillStyle = `hsla(358, 85%, ${28 + rnd(i) * 15}%, 0.85)`;
        ctx.beginPath(); ctx.arc(cx + Math.cos(a) * W * 0.35 * sp, cy + Math.sin(a) * H * 0.35 * sp, 8 + rnd(i + 4) * 26, 0, Math.PI * 2); ctx.fill();
      }
      break;
    case "leaves":
      for (let i = 0; i < 40; i++) {
        const x = (rnd(i) * W + t * 220) % (W + 40) - 20, y = (rnd(i + 30) * H + t * 160 * (0.5 + rnd(i))) % H;
        ctx.save(); ctx.translate(x, y); ctx.rotate(t * 4 + i);
        ctx.fillStyle = `hsla(${80 + rnd(i) * 50}, 55%, ${35 + rnd(i + 1) * 20}%, 0.85)`;
        ctx.beginPath(); ctx.ellipse(0, 0, 9, 3.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      }
      break;
    case "petals":
      for (let i = 0; i < 60; i++) {
        const a = rnd(i) * Math.PI * 2 + t * (1.5 + rnd(i + 2));
        const r = 60 + rnd(i + 5) * Math.max(W, H) * 0.5;
        ctx.fillStyle = `hsla(${330 + rnd(i) * 25}, 80%, ${70 + rnd(i + 1) * 15}%, 0.85)`;
        ctx.beginPath(); ctx.ellipse(cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.7, 6, 3, a, 0, Math.PI * 2); ctx.fill();
      }
      break;
    case "ghosts":
      for (let i = 0; i < 9; i++) {
        const x = W * (0.1 + rnd(i) * 0.8), y = H * (1.1 - t * (0.5 + rnd(i + 3) * 0.6));
        const g = ctx.createRadialGradient(x, y, 2, x, y, 40);
        g.addColorStop(0, "hsla(180, 80%, 85%, 0.9)"); g.addColorStop(1, "hsla(190, 80%, 50%, 0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 40, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "hsla(185, 70%, 70%, 0.4)";
        ctx.beginPath(); ctx.moveTo(x - 14, y); ctx.quadraticCurveTo(x + Math.sin(t * 8 + i) * 20, y + 60, x, y + 110); ctx.quadraticCurveTo(x + 8, y + 50, x + 14, y); ctx.fill();
      }
      break;
    case "mirror":
      ctx.strokeStyle = `hsla(${hue}, 60%, 80%, 0.6)`; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx + 70, 0); ctx.lineTo(cx + 70, H); ctx.stroke();
      for (let i = 0; i < 12; i++) {
        ctx.strokeStyle = `hsla(${hue}, 50%, 80%, ${0.15 + rnd(i) * 0.2})`;
        ctx.beginPath(); ctx.moveTo(cx + 70, rnd(i) * H); ctx.lineTo(cx + 70 + (rnd(i + 1) - 0.5) * 300, rnd(i + 2) * H); ctx.stroke();
      }
      break;
    case "embers": {
      const g = ctx.createLinearGradient(0, H, 0, H * 0.4);
      g.addColorStop(0, "hsla(10, 90%, 40%, 0.6)"); g.addColorStop(1, "hsla(10, 90%, 40%, 0)");
      ctx.fillStyle = g; ctx.fillRect(0, H * 0.4, W, H * 0.6);
      for (let i = 0; i < 70; i++) {
        const x = rnd(i) * W + Math.sin(t * 3 + i) * 20, y = H - ((rnd(i + 10) * H + t * 300 * (0.5 + rnd(i))) % H);
        ctx.fillStyle = `hsla(${15 + rnd(i) * 30}, 100%, 60%, 0.9)`;
        ctx.beginPath(); ctx.arc(x, y, 1.5 + rnd(i + 3) * 2.5, 0, Math.PI * 2); ctx.fill();
      }
      break;
    }
    case "rain":
      ctx.strokeStyle = "hsla(200, 70%, 80%, 0.7)"; ctx.lineWidth = 1.5;
      for (let i = 0; i < 70; i++) {
        const x = (rnd(i) * W * 1.3 - t * 400) % W, y = (rnd(i + 20) * H + t * 900) % H;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 14, y + 34); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x - 14, y + 34); ctx.lineTo(x - 11, y + 27); ctx.stroke();
      }
      break;
    case "earth":
      ctx.strokeStyle = `hsla(25, 60%, 20%, ${0.5 + strike * 0.4})`; ctx.lineWidth = 4;
      for (let i = 0; i < 12; i++) {
        const a = Math.PI + (i / 11) * Math.PI;
        const len = (0.2 + strike * 0.8) * Math.max(W, H) * 0.6;
        ctx.beginPath(); ctx.moveTo(cx, cy + 50);
        let x = cx, y = cy + 50;
        for (let s = 1; s <= 5; s++) { x = cx + Math.cos(a) * len * s / 5 + (rnd(i * 5 + s) - 0.5) * 30; y = cy + 50 - Math.sin(a) * len * s / 5 * 0.3 + (rnd(i + s) - 0.5) * 20; ctx.lineTo(x, y); }
        ctx.stroke();
      }
      for (let i = 0; i < 14 * strike; i++) {
        ctx.fillStyle = "hsl(25, 20%, 30%)";
        ctx.fillRect(cx + (rnd(i) - 0.5) * 500, cy + 40 - strike * 200 * rnd(i + 2), 10 + rnd(i) * 14, 8 + rnd(i + 1) * 10);
      }
      break;
    case "gold":
      ctx.translate(cx, cy);
      ctx.rotate(t * 0.6);
      for (let i = 0; i < 16; i++) {
        ctx.rotate(Math.PI / 8);
        ctx.fillStyle = `hsla(45, 95%, 65%, ${0.12 + (i % 2) * 0.1})`;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.max(W, H), -40); ctx.lineTo(Math.max(W, H), 40); ctx.closePath(); ctx.fill();
      }
      break;
    case "talismans":
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2 + t * 2;
        const r = 150 + Math.sin(t * 3 + i) * 20;
        ctx.save(); ctx.translate(cx + Math.cos(a) * r * 1.4, cy + Math.sin(a) * r * 0.7); ctx.rotate(a + Math.PI / 2);
        ctx.fillStyle = "hsl(45, 40%, 92%)"; ctx.fillRect(-9, -22, 18, 44);
        ctx.strokeStyle = "hsl(358, 80%, 45%)"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(0, -16); ctx.lineTo(0, 16); ctx.moveTo(-5, -6); ctx.lineTo(5, -6); ctx.stroke();
        ctx.restore();
      }
      break;
    case "banner": {
      const bx = cx + 90, wave = Math.sin(t * 6) * 10;
      ctx.fillStyle = "hsl(20, 30%, 25%)"; ctx.fillRect(bx - 3, cy - 220, 6, 300);
      ctx.fillStyle = "hsl(45, 90%, 55%)";
      ctx.beginPath(); ctx.moveTo(bx + 3, cy - 210); ctx.lineTo(bx + 90 + wave, cy - 200); ctx.lineTo(bx + 90 - wave, cy + 20); ctx.lineTo(bx + 3, cy + 30); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "hsl(358, 75%, 40%)"; ctx.font = "bold 54px serif"; ctx.textAlign = "center";
      ctx.fillText("令", bx + 48, cy - 70);
      break;
    }
    case "ribbons":
      for (let r = 0; r < 4; r++) {
        ctx.strokeStyle = `hsla(${320 + r * 8}, 80%, ${65 + r * 5}%, 0.7)`; ctx.lineWidth = 8 - r;
        ctx.beginPath();
        for (let x = 0; x <= W; x += 16) ctx.lineTo(x, cy + Math.sin(x * 0.012 + t * 6 + r * 1.3) * (60 + r * 25));
        ctx.stroke();
      }
      break;
    case "web":
      ctx.strokeStyle = "hsla(260, 30%, 85%, 0.55)"; ctx.lineWidth = 1.2;
      for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * W, cy + Math.sin(a) * W); ctx.stroke(); }
      for (let ring = 1; ring < 8; ring++) {
        const rr = ring * 60 * Math.min(1, k * 2.5);
        ctx.beginPath();
        for (let i = 0; i <= 14; i++) { const a = (i / 14) * Math.PI * 2; ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); }
        ctx.stroke();
      }
      break;
    case "sun": {
      const w = 80 + strike * 120;
      const g = ctx.createLinearGradient(cx - w, 0, cx + w, 0);
      g.addColorStop(0, "hsla(180, 80%, 90%, 0)"); g.addColorStop(0.5, `hsla(50, 100%, 96%, ${0.5 + strike * 0.4})`); g.addColorStop(1, "hsla(180, 80%, 90%, 0)");
      ctx.fillStyle = g; ctx.fillRect(cx - w, 0, w * 2, H);
      break;
    }
    case "void":
      for (let i = 0; i < 16; i++) {
        const side = i % 4;
        const sx = side === 0 ? 0 : side === 1 ? W : rnd(i) * W, sy = side === 2 ? 0 : side === 3 ? H : rnd(i) * H;
        const reach = Math.min(1, k * 1.6);
        ctx.strokeStyle = `hsla(260, 40%, 6%, 0.85)`; ctx.lineWidth = 14 - (i % 5) * 2; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(sx, sy);
        ctx.quadraticCurveTo((sx + cx) / 2 + Math.sin(t * 4 + i) * 80, (sy + cy) / 2, sx + (cx - sx) * reach * 0.8, sy + (cy - sy) * reach * 0.8);
        ctx.stroke();
      }
      break;
    case "fox":
      for (let i = 0; i < 9; i++) {
        const a = (i / 9) * Math.PI * 2 + t * 1.5;
        const x = cx + Math.cos(a) * 170, y = cy + Math.sin(a) * 110;
        const g = ctx.createRadialGradient(x, y, 2, x, y, 34);
        g.addColorStop(0, "hsla(45, 100%, 85%, 1)"); g.addColorStop(0.5, "hsla(25, 100%, 55%, 0.8)"); g.addColorStop(1, "hsla(15, 100%, 45%, 0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 34, 0, Math.PI * 2); ctx.fill();
      }
      break;
    case "lightning":
      if (Math.floor(t * 12) % 3 !== 0 || strike > 0) {
        ctx.strokeStyle = "hsla(205, 100%, 88%, 0.9)"; ctx.lineWidth = 3;
        for (let b = 0; b < 4; b++) {
          let x = rnd(b + Math.floor(t * 8)) * W, y = 0;
          ctx.beginPath(); ctx.moveTo(x, y);
          while (y < H) { x += (rnd(x + y + b) - 0.5) * 70; y += 40; ctx.lineTo(x, y); }
          ctx.stroke();
        }
      }
      break;
    case "snow":
      ctx.fillStyle = "hsla(200, 60%, 85%, 0.15)"; ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < 90; i++) {
        const x = (rnd(i) * W + Math.sin(t * 2 + i) * 30) % W, y = (rnd(i + 40) * H + t * 120 * (0.4 + rnd(i))) % H;
        ctx.fillStyle = "hsla(0, 0%, 100%, 0.9)"; ctx.beginPath(); ctx.arc(x, y, 1.5 + rnd(i + 2) * 2.5, 0, Math.PI * 2); ctx.fill();
      }
      break;
    case "wheel": {
      const r = Math.min(W, H) * 0.32;
      ctx.translate(cx, cy); ctx.rotate(t * 2.5);
      ctx.strokeStyle = "hsla(42, 80%, 60%, 0.75)"; ctx.lineWidth = 10;
      ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
      ctx.lineWidth = 4;
      for (let i = 0; i < 8; i++) { ctx.rotate(Math.PI / 4); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(r, 0); ctx.stroke(); }
      ctx.beginPath(); ctx.arc(0, 0, r * 0.25, 0, Math.PI * 2); ctx.stroke();
      break;
    }
    case "water":
      for (let w = 0; w < 5; w++) {
        ctx.fillStyle = `hsla(${185 + w * 5}, 70%, ${40 + w * 8}%, 0.35)`;
        ctx.beginPath(); ctx.moveTo(0, H);
        for (let x = 0; x <= W; x += 20) ctx.lineTo(x, H * (0.55 + w * 0.09) + Math.sin(x * 0.01 + t * 5 + w) * 30 - strike * 80);
        ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
      }
      break;
    case "wind":
      ctx.strokeStyle = "hsla(140, 40%, 88%, 0.55)"; ctx.lineCap = "round";
      for (let i = 0; i < 40; i++) {
        const y = rnd(i) * H, x = ((rnd(i + 3) * W) + t * 1600) % (W + 300) - 150;
        ctx.lineWidth = 1 + rnd(i) * 3; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 80 - rnd(i + 1) * 120, y); ctx.stroke();
      }
      break;
    case "spotlight": {
      ctx.fillStyle = "rgba(0,0,0,0.55)"; ctx.fillRect(0, 0, W, H);
      const g = ctx.createRadialGradient(cx, cy, 20, cx, cy, 220);
      g.addColorStop(0, "hsla(45, 100%, 85%, 0.55)"); g.addColorStop(1, "hsla(45, 100%, 70%, 0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(cx - 40, 0); ctx.lineTo(cx + 40, 0); ctx.lineTo(cx + 220, cy + 120); ctx.lineTo(cx - 220, cy + 120); ctx.closePath(); ctx.fill();
      for (let i = 0; i < 30 * strike; i++) {
        ctx.fillStyle = `hsl(${rnd(i) * 360}, 80%, 65%)`;
        ctx.fillRect(cx + (rnd(i) - 0.5) * W * 0.8, rnd(i + 5) * H * strike, 6, 3);
      }
      break;
    }
    case "spears":
      ctx.strokeStyle = "hsla(20, 50%, 80%, 0.8)"; ctx.lineCap = "round";
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const len = strike * Math.max(W, H) * 0.6;
        ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * len, cy + Math.sin(a) * len); ctx.stroke();
        ctx.fillStyle = "hsl(20, 90%, 60%)";
        ctx.beginPath(); ctx.arc(cx + Math.cos(a) * len, cy + Math.sin(a) * len, 8, 0, Math.PI * 2); ctx.fill();
      }
      break;
  }
  ctx.restore();
}
