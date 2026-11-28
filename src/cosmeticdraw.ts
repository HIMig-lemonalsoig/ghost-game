import { drawChar, drawCosmeticFit, hasCosmetic, spritesReady, type CharId } from "./sprites";
// Cosmetic drawing (no game imports, so the engine can use it without import cycles).
/* eslint-disable @typescript-eslint/no-explicit-any */
export type Slot = "attire" | "head" | "blade" | "sash";
export interface Cosmetic {
  id: string; slot: Slot; name: string; desc: string; kanji: string;
  cost?: number;          // bought with Flowers
  unlock?: { desc: string; check: (c: any) => boolean; progress?: (c: any) => [number, number] };   // earned from an achievement / challenge
  // Look data (only the fields for its slot are used)
  body?: string; trim?: string; accent?: string; plates?: string; pattern?: "plates" | "robe" | "hood" | "scales";
  head?: "kasa" | "band" | "oni" | "fox" | "kabuto" | "hood" | "antler" | "tengu";
  headCol?: string; headCol2?: string;
  bladeCol?: string; edgeCol?: string; guardCol?: string; wrapCol?: string; trail?: [number, number, number];
  sashCol?: string; sashCol2?: string; sashLen?: number;
}

// ─── Drawing ─────────────────────────────────────────────────────────────────
// All draw calls expect the canvas translated to the character and rotated so
// +X is the way they face. R = body radius.
export interface Look { attire: Cosmetic; head: Cosmetic; blade: Cosmetic; sash: Cosmetic; }

/** Sash / cape / headband tails streaming behind (drawn under the body). `sway` 0..1 = how fast you're moving. */
export function drawBack(ctx: CanvasRenderingContext2D, look: Look, R: number, t: number, sway: number) {
  const s = look.sash, h = look.head;
  const wave = (k: number, amp: number) => Math.sin(t * (6 + sway * 8) - k * 3) * amp * (0.5 + sway * 0.8);
  if (s.sashCol) {
    const L = (s.sashLen ?? 34) * (0.8 + sway * 0.4);
    if (s.id === "s_indigo") {   // cape: a wide flap behind the shoulders
      ctx.fillStyle = s.sashCol;
      ctx.beginPath();
      ctx.moveTo(-R * 0.2, -R * 0.9);
      ctx.quadraticCurveTo(-R - L * 0.6, -R * 1.1 + wave(0.5, 4), -R - L, wave(1, 6));
      ctx.quadraticCurveTo(-R - L * 0.6, R * 1.1 + wave(0.7, 4), -R * 0.2, R * 0.9);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = s.sashCol2 ?? s.sashCol; ctx.lineWidth = 1.5; ctx.stroke();
    } else {   // a long ribbon, two strands
      for (const [off, w] of [[-4, 5], [3, 3.5]] as const) {
        ctx.strokeStyle = off < 0 ? s.sashCol : (s.sashCol2 ?? s.sashCol);
        ctx.lineWidth = w; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(-R * 0.6, off);
        const n = 6;
        for (let i = 1; i <= n; i++) {
          const k = i / n;
          ctx.lineTo(-R * 0.6 - L * k, off * (1 + k) + wave(k, 7 * k));
        }
        ctx.stroke();
      }
      if (s.id === "s_gold") {   // tassels
        ctx.fillStyle = s.sashCol;
        ctx.beginPath(); ctx.arc(-R * 0.6 - L, wave(1, 7) - 4, 3, 0, Math.PI * 2); ctx.fill();
      }
    }
  }
  if (h.head === "band") {   // hachimaki tails
    ctx.strokeStyle = h.headCol!; ctx.lineWidth = 2.5; ctx.lineCap = "round";
    for (const off of [-3, 3]) {
      ctx.beginPath(); ctx.moveTo(-R + 2, off);
      ctx.quadraticCurveTo(-R - 10, off * 2 + wave(0.5, 5), -R - 20 - sway * 6, off * 3 + wave(1, 7));
      ctx.stroke();
    }
  }
}

/** Body + outfit + headgear (drawn on top of the weapon, like the old body circle). */
export function drawBody(ctx: CanvasRenderingContext2D, look: Look, R: number, flash: "hit" | "invuln" | null) {
  const a = look.attire, h = look.head;
  const body = flash === "hit" ? "hsl(358, 80%, 60%)" : flash === "invuln" ? "hsl(36, 30%, 30%)" : a.body!;
  // Shoulder plates (sode) for armors
  if (a.pattern === "plates" || a.pattern === "scales") {
    for (const side of [-1, 1]) {
      ctx.fillStyle = a.plates ?? a.body!;
      ctx.beginPath(); ctx.ellipse(-1, side * (R - 1), R * 0.55, R * 0.32, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = a.trim ?? a.accent!; ctx.lineWidth = 1.5; ctx.stroke();
      if (a.pattern === "scales") {
        ctx.strokeStyle = "hsla(0,0%,0%,0.35)"; ctx.lineWidth = 1;
        for (const k of [-0.25, 0.1]) { ctx.beginPath(); ctx.moveTo(-R * 0.45, side * (R - 1) + k * R); ctx.lineTo(R * 0.35, side * (R - 1) + k * R); ctx.stroke(); }
      }
    }
  }
  ctx.fillStyle = body;
  ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.fill();
  if (a.trim && !flash) {   // collar / obi line across the chest
    ctx.strokeStyle = a.trim; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 0, R - 1, Math.PI * 0.62, Math.PI * 1.38); ctx.stroke();
    if (a.pattern === "robe") { ctx.beginPath(); ctx.moveTo(R * 0.15, -R * 0.85); ctx.lineTo(-R * 0.35, R * 0.4); ctx.stroke(); }
  }
  ctx.strokeStyle = a.accent!; ctx.lineWidth = 3;   // the front accent arc (old red stripe)
  ctx.beginPath(); ctx.arc(0, 0, R - 1, -Math.PI / 4, Math.PI / 4); ctx.stroke();
  drawHead(ctx, look, R, a.pattern === "hood");
}

function drawHead(ctx: CanvasRenderingContext2D, look: Look, R: number, hoodedOutfit: boolean) {
  const h = look.head, c1 = h.headCol ?? "#000", c2 = h.headCol2 ?? c1;
  const face = () => { ctx.fillStyle = "hsl(36, 30%, 85%)"; ctx.beginPath(); ctx.arc(R * 0.5, 0, 3, 0, Math.PI * 2); ctx.fill(); };
  switch (h.head) {
    case "kasa": {   // wide straw hat seen from above
      ctx.fillStyle = c1;
      ctx.beginPath(); ctx.arc(0, 0, R + 7, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = c2; ctx.lineWidth = 1;
      for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * (R + 6), Math.sin(a) * (R + 6)); ctx.stroke(); }
      ctx.beginPath(); ctx.arc(0, 0, R + 6.5, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = c2; ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI * 2); ctx.fill();
      return;
    }
    case "band":
      face();
      ctx.strokeStyle = c1; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(0, 0, R * 0.62, 0, Math.PI * 2); ctx.stroke();
      return;
    case "hood":
      ctx.fillStyle = c1;
      ctx.beginPath(); ctx.arc(-1, 0, R * 0.82, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = c2;   // cloth mask over the face
      ctx.beginPath(); ctx.ellipse(R * 0.45, 0, 4, 6, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "hsl(36, 30%, 85%)"; ctx.fillRect(R * 0.42, -3, 2, 1.6); ctx.fillRect(R * 0.42, 1.4, 2, 1.6);
      return;
    case "oni":
      ctx.fillStyle = c1;
      ctx.beginPath(); ctx.ellipse(R * 0.42, 0, 6, 8.5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = c2;   // horns
      for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(R * 0.15, s * 6); ctx.lineTo(R * 0.05, s * 14); ctx.lineTo(R * 0.4, s * 7); ctx.closePath(); ctx.fill(); }
      ctx.fillStyle = "hsl(50, 100%, 70%)"; ctx.fillRect(R * 0.55, -4, 2, 2); ctx.fillRect(R * 0.55, 2, 2, 2);
      ctx.strokeStyle = "hsl(0, 0%, 95%)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(R * 0.78, -3); ctx.lineTo(R * 0.78, 3); ctx.stroke();
      return;
    case "fox":
      ctx.fillStyle = c1;
      ctx.beginPath(); ctx.moveTo(R * 0.95, 0); ctx.lineTo(R * 0.1, -8); ctx.lineTo(R * 0.1, 8); ctx.closePath(); ctx.fill();
      for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(R * 0.15, s * 5); ctx.lineTo(R * -0.05, s * 12); ctx.lineTo(R * 0.4, s * 7); ctx.closePath(); ctx.fill(); }
      ctx.strokeStyle = c2; ctx.lineWidth = 1.5;
      for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(R * 0.35, s * 2); ctx.lineTo(R * 0.6, s * 4); ctx.stroke(); }
      ctx.fillStyle = c2; ctx.beginPath(); ctx.arc(R * 0.92, 0, 1.5, 0, Math.PI * 2); ctx.fill();
      return;
    case "tengu":
      ctx.fillStyle = c1;
      ctx.beginPath(); ctx.ellipse(R * 0.4, 0, 6, 8, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(R * 0.5, -2.5); ctx.lineTo(R * 1.35, 0); ctx.lineTo(R * 0.5, 2.5); ctx.closePath(); ctx.fill();   // the long nose
      ctx.fillStyle = c2; ctx.fillRect(R * 0.3, -5, 3, 2); ctx.fillRect(R * 0.3, 3, 3, 2);
      return;
    case "kabuto":
    case "antler": {
      ctx.fillStyle = c1;
      ctx.beginPath(); ctx.arc(-1, 0, R * 0.78, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "hsla(0,0%,100%,0.2)"; ctx.lineWidth = 1;
      for (const k of [-0.3, 0, 0.3]) { ctx.beginPath(); ctx.moveTo(-R * 0.7, k * R); ctx.lineTo(R * 0.6, k * R); ctx.stroke(); }
      ctx.strokeStyle = c2; ctx.fillStyle = c2; ctx.lineCap = "round";
      if (h.head === "kabuto") {   // golden crescent crest
        ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(R * 0.55, 0, 9, Math.PI * 0.55, Math.PI * 1.45, true); ctx.stroke();
      } else {   // antlers sweeping back and out
        ctx.lineWidth = 2;
        for (const s of [-1, 1]) {
          ctx.beginPath(); ctx.moveTo(R * 0.2, s * 5); ctx.quadraticCurveTo(R * 0.1, s * 16, -R * 0.7, s * 20); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(R * 0.05, s * 13); ctx.lineTo(R * 0.4, s * 19); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(-R * 0.35, s * 18); ctx.lineTo(-R * 0.2, s * 25); ctx.stroke();
        }
      }
      ctx.fillStyle = "hsl(36, 30%, 85%)"; ctx.beginPath(); ctx.arc(R * 0.55, 0, 2.2, 0, Math.PI * 2); ctx.fill();
      return;
    }
    default:
      if (hoodedOutfit) {   // Phantom Garb comes with a soft hood
        ctx.fillStyle = look.attire.trim ?? "#ccc";
        ctx.beginPath(); ctx.arc(-2, 0, R * 0.6, 0, Math.PI * 2); ctx.fill();
      }
      face();
  }
}

/** Static preview (Wardrobe): character facing right, katana held low. */
export function drawPreview(ctx: CanvasRenderingContext2D, look: Look, size: number, t: number) {
  const R = 16, sc = size / 110;
  ctx.save();
  ctx.clearRect(0, 0, size, size);
  ctx.translate(size / 2 + 6 * sc, size / 2);
  ctx.scale(sc, sc);
  ctx.fillStyle = "hsla(0, 0%, 0%, 0.45)";
  ctx.beginPath(); ctx.ellipse(0, R - 2, R, R * 0.4, 0, 0, Math.PI * 2); ctx.fill();
  drawBack(ctx, look, R, t, 0.5);
  // katana held low and forward
  ctx.save(); ctx.rotate(0.45);
  const b = look.blade, r0 = R * 0.6;
  ctx.strokeStyle = b.wrapCol!; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-3, 0); ctx.lineTo(r0, 0); ctx.stroke();
  ctx.fillStyle = b.guardCol!; ctx.beginPath(); ctx.ellipse(r0 + 1, 0, 1.8, 4.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = b.bladeCol!; ctx.beginPath(); ctx.moveTo(r0 + 3, -1.6); ctx.quadraticCurveTo(r0 + 22, -3.5, r0 + 40, -2.5); ctx.lineTo(r0 + 35, 1.4); ctx.quadraticCurveTo(r0 + 20, 1.2, r0 + 3, 1.8); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = b.edgeCol!; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(r0 + 5, 1.2); ctx.quadraticCurveTo(r0 + 20, 0.6, r0 + 34, 0.8); ctx.stroke();
  const [r, g, bb] = b.trail!;   // a hint of the slash color
  ctx.strokeStyle = `rgba(${r},${g},${bb},0.55)`; ctx.lineWidth = 5; ctx.lineCap = "round";
  ctx.beginPath(); ctx.arc(0, 0, r0 + 44, -0.9, -0.2); ctx.stroke();
  ctx.restore();
  drawBody(ctx, look, R, null);
  ctx.restore();
}


// ─── Pixel-art bodies (v3.17) ────────────────────────────────────────────────
// Outfits become dyes on the sprite; headgear and back items are pixel-art pieces
// (art/cosmetics/<id>.png) placed on the head / shoulders every frame.
const HATS = new Set(["h_kasa", "h_jingasa"]);
const HELMS = new Set(["h_crescent", "h_antler", "h_dragon", "h_mongol", "h_sakai", "h_sarugami", "h_hood", "h_komuso"]);
const MASKS = new Set(["h_oni", "h_fox", "h_tengu", "h_ghostmask", "h_hannya"]);
const BANNERS = new Set(["s_sashimono", "s_blossom"]);

/** The outfit as a dye (the starting black outfit keeps the original art). */
export function lookDye(look: Look): { body: string; trim: string } | undefined {
  const a = look.attire;
  if (!a || a.id === "a_wanderer" || !a.body) return undefined;
  return { body: a.body, trim: a.trim ?? a.accent ?? a.body };
}

/** Wardrobe pieces to draw with a sprite. `view`: side, front (facing camera) or back.
 *  `sway` 0..1 = how fast you're moving (capes lift). */
export function spriteLayers(look: Look, t: number, sway: number, view: "side" | "front" | "back") {
  const head = look.head?.id, back = look.sash?.id;
  const hasHead = !!head && head !== "h_none" && hasCosmetic(head);
  const hasBack = !!back && back !== "s_none" && hasCosmetic(back) && view === "side";
  return {
    behind: hasBack ? (hx: number, hy: number, H: number, ctx: CanvasRenderingContext2D) => {
      const flap = Math.sin(t * (4 + sway * 8)) * (0.04 + sway * 0.08) - sway * 0.25;
      if (BANNERS.has(back!)) drawCosmeticFit(ctx, back!, hx - H * 0.75, hy + H * 1.9, H * 1.7, "bottom", Math.sin(t * 3) * 0.03 - sway * 0.08);
      else drawCosmeticFit(ctx, back!, hx - H * 0.05, hy + H * 0.85, H * (back === "s_gold" ? 1.6 : 2.3), "topright", flap);
    } : undefined,
    front: hasHead ? (hx: number, hy: number, H: number, ctx: CanvasRenderingContext2D) => {
      if (MASKS.has(head!)) {
        if (view === "back") return;   // you can't see a mask from behind
        const fx = view === "front" ? hx : hx + H * 0.28;
        drawCosmeticFit(ctx, head!, fx, hy + H * (head === "h_ghostmask" ? 0.72 : 0.55), H * (head === "h_tengu" ? 1.35 : 1.0), "center");
        return;
      }
      const dv = view === "side" ? 0 : H * 0.3;   // front/back art has a taller crest: sit lower
      if (HATS.has(head!)) drawCosmeticFit(ctx, head!, hx, hy + H * 0.5 + dv, H * 2.3, "bottom");
      else if (HELMS.has(head!)) drawCosmeticFit(ctx, head!, hx, hy + H * (head === "h_hood" ? 1.15 : 1.0) + dv * 0.6, H * (head === "h_antler" ? 1.8 : 1.5), "bottom");
      else drawCosmeticFit(ctx, head!, hx - H * 0.1, hy + H * 0.35, H * 1.35, "center");   // headband
    } : undefined,
  };
}

/** Wardrobe preview on a pixel-art body (returns false if the art isn't there). */
export function drawSpritePreview(ctx: CanvasRenderingContext2D, look: Look, size: number, t: number, body: CharId): boolean {
  if (!spritesReady()) return false;
  ctx.clearRect(0, 0, size, size);
  ctx.save();
  ctx.fillStyle = "hsla(0, 0%, 0%, 0.45)";
  ctx.beginPath(); ctx.ellipse(size / 2, size * 0.86, size * 0.18, size * 0.05, 0, 0, Math.PI * 2); ctx.fill();
  ctx.translate(size / 2, size * 0.86);
  const ok = drawChar(ctx, body, "Idle", { frame: t * 7, height: size * 0.62, dye: lookDye(look), layers: spriteLayers(look, t, 0.3, "side") });
  ctx.restore();
  return ok;
}
