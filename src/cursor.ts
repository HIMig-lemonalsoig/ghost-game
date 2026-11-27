// ─── Tomoe crest cursor (v3.5) ───────────────────────────────────────────────
// Drawn on the canvas (not a CSS cursor) so it stays big, sharp and readable on
// every biome: a dark outline under a gold fill. It spins gently, spins faster
// and glows when the ult is ready, and kicks inward on every attack.
import type { GhostGame } from "./GhostGame";

const GOLD = "#e8b75a", INK = "#0c0a08";

export function drawCrestCursor(g: GhostGame, ctx: CanvasRenderingContext2D) {
  const inp = g.input;
  if (!g.showCursor || !inp.mouseAim || !g.cursorInside) return;
  if (g.stats.state !== "playing" || g.ultCutscene) return;
  const now = performance.now() / 1000;
  const dt = Math.min(0.05, Math.max(0, now - (g.cursorT || now)));
  g.cursorT = now;
  const ready = g.stats.ultReady && !g.stats.ultActive;
  g.cursorSpin = (g.cursorSpin || 0) + dt * (ready ? 4.2 : 1.1);
  g.cursorKick = Math.max(0, (g.cursorKick || 0) - dt * 6);
  const k = g.cursorKick;
  const r = 18 * (1 - k * 0.22);
  ctx.save();
  ctx.setTransform(devicePixelRatio || 1, 0, 0, devicePixelRatio || 1, 0, 0);
  ctx.translate(inp.mouseX, inp.mouseY);
  ctx.lineCap = "round"; ctx.lineJoin = "round";
  if (ready) {
    ctx.beginPath(); ctx.arc(0, 0, r + 7, 0, Math.PI * 2);
    ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.stroke();
    ctx.globalAlpha = 0.65 + 0.35 * Math.sin(now * 6);
    ctx.strokeStyle = "#fff1c8"; ctx.lineWidth = 2.5; ctx.stroke();
    ctx.globalAlpha = 1;
  }
  ctx.rotate(g.cursorSpin + k * 1.2);
  // Outer ring: ink outline, then gold.
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.strokeStyle = INK; ctx.lineWidth = 5.5; ctx.stroke();
  ctx.strokeStyle = GOLD; ctx.lineWidth = 2.5; ctx.stroke();
  // Three tomoe (comma swirls).
  for (let i = 0; i < 3; i++) {
    ctx.save();
    ctx.rotate(i * (Math.PI * 2 / 3));
    const cx = r * 0.32;
    ctx.beginPath(); ctx.arc(cx, 0, r * 0.36, -1.6, 0.2);
    ctx.strokeStyle = INK; ctx.lineWidth = 5.5; ctx.stroke();
    ctx.strokeStyle = GOLD; ctx.lineWidth = 2.5; ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, 0, r * 0.26, 0, Math.PI * 2);
    ctx.fillStyle = INK; ctx.fill();
    ctx.beginPath(); ctx.arc(cx, 0, r * 0.18, 0, Math.PI * 2);
    ctx.fillStyle = GOLD; ctx.fill();
    ctx.restore();
  }
  // Exact aim point.
  ctx.beginPath(); ctx.arc(0, 0, 2.2, 0, Math.PI * 2);
  ctx.fillStyle = INK; ctx.fill();
  ctx.restore();
}
