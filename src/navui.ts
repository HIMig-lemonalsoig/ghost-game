// ─── Navigation aids: edge arrows + minimap ───────────────────────────────────
// Screen-space overlays drawn after the world:
//  • Edge arrows point at important things you can't see: arena altars, Spirit
//    Chests, item pickups and the boss. Each shows its icon and distance.
//  • A minimap (top-right, under the coins) shows the whole arena: you, the
//    view rectangle, enemies (elites and bosses stand out) and the same points.
// Both can be turned off in Settings.
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ARENA_SHRINE_BY_ID } from "./content/choices";

type Ctx = CanvasRenderingContext2D;
interface Poi { x: number; y: number; kind: "altar" | "chest" | "item" | "boss"; kanji: string; hue: number; label: string; }

const STYLE: Record<Poi["kind"], { hue: number; sat: number; light: number }> = {
  altar: { hue: 45, sat: 90, light: 62 },
  chest: { hue: 40, sat: 85, light: 58 },
  item: { hue: 140, sat: 60, light: 58 },
  boss: { hue: 355, sat: 85, light: 58 },
};

function collect(g: any): Poi[] {
  const out: Poi[] = [];
  const sh = g.arenaShrine;
  if (sh) { const d = ARENA_SHRINE_BY_ID[sh.id as keyof typeof ARENA_SHRINE_BY_ID]; out.push({ x: sh.x, y: sh.y, kind: "altar", kanji: d?.kanji ?? "祭", hue: d?.hue ?? 45, label: d?.name ?? "Altar" }); }
  for (const c of g.spiritChests ?? []) out.push({ x: c.x, y: c.y, kind: "chest", kanji: "宝", hue: 40, label: "Spirit Chest" });
  for (const c of g.consumablePickups ?? []) out.push({ x: c.pos.x, y: c.pos.y, kind: "item", kanji: "品", hue: 140, label: "Item" });
  for (const e of g.enemies ?? []) if (e.isBoss && e.state !== "dead") out.push({ x: e.pos.x, y: e.pos.y, kind: "boss", kanji: "鬼", hue: 355, label: "Boss" });
  return out;
}

/** World → screen (the camera centres-zooms then translates). */
function toScreen(g: any, x: number, y: number, W: number, H: number): [number, number] {
  const z = g.cameraZoom?.zoom ?? 1;
  return [W / 2 + (x - g.cameraX - W / 2) * z, H / 2 + (y - g.cameraY - H / 2) * z];
}

export function drawPointers(g: any, ctx: Ctx, W: number, H: number) {
  if (!g.player || g.stats?.state !== "playing") return;
  const pois = collect(g);
  if (!pois.length) return;
  const t = g.elapsed as number;
  // Keep arrows clear of the HUD: name plate / wave title on top, hotbar at the bottom.
  const top = 96, bottom = H - (W < 760 ? 120 : 150), left = 34, right = W - 34;
  const cx = W / 2, cy = (top + bottom) / 2;
  const P = g.player.pos;
  ctx.save();
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  for (const p of pois) {
    const [sx, sy] = toScreen(g, p.x, p.y, W, H);
    if (sx > 20 && sx < W - 20 && sy > 70 && sy < H - 90) continue;   // on screen: no arrow
    // Ray from the play-area centre toward the target, clipped to the inset frame.
    const dx = sx - cx, dy = sy - cy;
    const kx = dx > 0 ? (right - cx) / dx : dx < 0 ? (left - cx) / dx : Infinity;
    const ky = dy > 0 ? (bottom - cy) / dy : dy < 0 ? (top - cy) / dy : Infinity;
    const k = Math.min(kx, ky);
    const ax = cx + dx * k, ang = Math.atan2(dy, dx);
    let ay = cy + dy * k;
    // Don't sit on the minimap (top-right): slide down below it.
    const mmBottom = 66 + Math.round((W < 760 ? 104 : 148) * (g.worldH / g.worldW)) + 34;
    if (g.showMinimap && ax > W - (W < 760 ? 150 : 195) && ay < mmBottom) ay = mmBottom;
    const st = STYLE[p.kind];
    const col = `hsl(${p.kind === "altar" ? p.hue : st.hue}, ${st.sat}%, ${st.light}%)`;
    const pulse = 0.5 + 0.5 * Math.sin(t * 5 + p.x * 0.01);
    const bob = Math.sin(t * 6) * 3;
    ctx.save();
    ctx.translate(ax + Math.cos(ang) * bob, ay + Math.sin(ang) * bob);
    // arrow head
    ctx.save();
    ctx.rotate(ang);
    ctx.fillStyle = col;
    ctx.shadowColor = col; ctx.shadowBlur = 8 + pulse * 8;
    ctx.beginPath(); ctx.moveTo(30, 0); ctx.lineTo(18, -9); ctx.lineTo(18, 9); ctx.closePath(); ctx.fill();
    ctx.restore();
    // icon disc
    ctx.fillStyle = "rgba(14, 11, 9, .82)";
    ctx.strokeStyle = col; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 0, 15, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = col;
    ctx.font = `bold 15px "Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif`;
    ctx.fillText(p.kanji, 0, 1);
    // distance (1 m ≈ 20 px)
    const m = Math.round(Math.hypot(p.x - P.x, p.y - P.y) / 20);
    ctx.font = "600 10px system-ui, sans-serif";
    ctx.fillStyle = "rgba(237, 227, 200, .9)";
    ctx.shadowColor = "#000"; ctx.shadowBlur = 3;
    const ly = ay > H / 2 ? -24 : 25;
    ctx.fillText(`${m}m`, 0, ly);
    ctx.restore();
  }
  ctx.restore();
}

export function drawMinimap(g: any, ctx: Ctx, W: number, H: number) {
  if (!g.player || g.stats?.state !== "playing") return;
  const S = W < 760 ? 104 : 148;                          // map width
  const ww = g.worldW, wh = g.worldH;
  const mh = Math.round(S * (wh / ww));
  const x0 = W - 16 - S, y0 = 66;
  const sx = (x: number) => x0 + (x / ww) * S, sy = (y: number) => y0 + (y / wh) * mh;
  const t = g.elapsed as number;
  ctx.save();
  // frame: lacquer panel with gold corner ticks
  ctx.fillStyle = "rgba(14, 11, 9, .78)";
  ctx.strokeStyle = "rgba(217, 173, 91, .45)"; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.roundRect(x0 - 5, y0 - 5, S + 10, mh + 10, 8); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "rgba(237, 227, 200, .045)";
  ctx.fillRect(x0, y0, S, mh);
  ctx.strokeStyle = "rgba(237, 227, 200, .06)"; ctx.lineWidth = 1;
  for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.moveTo(x0 + (S * i) / 4, y0); ctx.lineTo(x0 + (S * i) / 4, y0 + mh); ctx.moveTo(x0, y0 + (mh * i) / 4); ctx.lineTo(x0 + S, y0 + (mh * i) / 4); ctx.stroke(); }
  ctx.save();
  ctx.beginPath(); ctx.rect(x0, y0, S, mh); ctx.clip();
  // view rectangle
  const z = g.cameraZoom?.zoom ?? 1;
  const vw = g.width / z, vh = g.height / z;
  const vx = g.cameraX + g.width / 2 - vw / 2, vy = g.cameraY + g.height / 2 - vh / 2;
  ctx.strokeStyle = "rgba(237, 227, 200, .35)"; ctx.lineWidth = 1;
  ctx.strokeRect(sx(vx), sy(vy), (vw / ww) * S, (vh / wh) * mh);
  // enemies
  for (const e of g.enemies ?? []) {
    if (e.state === "dead") continue;
    const ex = sx(e.pos.x), ey = sy(e.pos.y);
    if (e.isBoss) {
      ctx.fillStyle = "hsl(355, 85%, 58%)";
      ctx.beginPath(); ctx.arc(ex, ey, 4, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = `hsla(355, 90%, 62%, ${0.4 + 0.4 * Math.sin(t * 6)})`; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(ex, ey, 7 + Math.sin(t * 6) * 1.5, 0, Math.PI * 2); ctx.stroke();
    } else if (e.affixes?.length) {
      ctx.fillStyle = "hsl(280, 75%, 68%)";
      ctx.beginPath(); ctx.arc(ex, ey, 2.4, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.fillStyle = "hsla(0, 70%, 55%, .85)";
      ctx.fillRect(ex - 1, ey - 1, 2, 2);
    }
  }
  // points of interest
  for (const p of collect(g)) {
    if (p.kind === "boss") continue;
    const px = sx(p.x), py = sy(p.y), st = STYLE[p.kind];
    ctx.fillStyle = `hsl(${p.kind === "altar" ? p.hue : st.hue}, ${st.sat}%, ${st.light}%)`;
    ctx.save(); ctx.translate(px, py);
    if (p.kind === "altar") { ctx.rotate(Math.PI / 4); const r = 4 + Math.sin(t * 5); ctx.fillRect(-r, -r, r * 2, r * 2); }
    else if (p.kind === "chest") ctx.fillRect(-3.5, -3, 7, 6);
    else { ctx.beginPath(); ctx.arc(0, 0, 2.8, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
  }
  // you
  const P = g.player.pos;
  ctx.save();
  ctx.translate(sx(P.x), sy(P.y)); ctx.rotate(g.player.facing);
  ctx.fillStyle = "#fff4dc"; ctx.shadowColor = "#000"; ctx.shadowBlur = 3;
  ctx.beginPath(); ctx.moveTo(6, 0); ctx.lineTo(-4, -4); ctx.lineTo(-2, 0); ctx.lineTo(-4, 4); ctx.closePath(); ctx.fill();
  ctx.restore();
  ctx.restore();
  ctx.restore();
}
