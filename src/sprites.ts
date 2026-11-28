// ─── Pixel-art character sprites (v3.7) ──────────────────────────────────────
// Licensed CraftPix "Samurai" sheets, inlined by the build as
// window.__YUKEN_SPRITES (see scripts/sprites.mjs). Every sheet is a row of
// 128×128 frames facing right. If the art isn't present (public CI build) or
// the player turns it off, the game keeps drawing the original shapes.
//
// Characters are side-view, so we use the Nuclear Throne / Gungeon trick: the
// body flips left/right toward where you aim, while attack arcs, telegraphs
// and hitboxes stay exactly as they were.

import { buildSheets, ONI_LOOK, RAIJIN_LOOK } from "./pixelart";

export type CharId = "samurai" | "archer" | "commander" | "kitsune" | "karasu" | "ytengu" | "skwarrior" | "skspear" | "skarcher" | "oni" | "raijin"
  | "onryo" | "kappa" | "taiko" | "bomber" | "mirror" | "yukiwarashi" | "lantern" | "wisp" | "tsukumo" | "mimic" | "boar" | "nue";
export type Anim = "Idle" | "Walk" | "Run" | "Attack_1" | "Attack_2" | "Attack_3" | "Hurt" | "Dead" | "Protection" | "Protect" | "Shot" | "Shot_1" | "RunUp" | "RunDown" | "IdleUp" | "IdleDown";
/** Colour variants, made once with a canvas filter and cached. */
export type Variant = "base" | "crimson" | "shade" | "flash" | "gold";

const FILTERS: Record<Variant, string> = {
  base: "none",
  crimson: "sepia(1) saturate(3) hue-rotate(-38deg) brightness(.95)", // navy samurai → blood-red ronin
  shade: "grayscale(1) sepia(.6) hue-rotate(225deg) saturate(2.4) brightness(.8)", // violet shinobi
  flash: "brightness(0) invert(1)",                       // white hit silhouette
  gold: "sepia(1) saturate(2.2) hue-rotate(-12deg) brightness(1.05)",
};

interface Sheet { img: HTMLImageElement | HTMLCanvasElement; frames: number; size: number; own?: { cx: number; feet: number }[]; }

/** PixelLab exports come as square grids (e.g. 3×3 = 9 frames, read left→right, top→bottom).
 *  Any square RunUp / RunDown sheet is treated as a grid. `SKIP` drops leading frames that
 *  are still side-on or just standing (default: RunUp 1, RunDown 0). */
const VIEW_ANIMS = new Set(["RunUp", "RunDown", "IdleUp", "IdleDown"]);
// Frame 1 of a PixelLab run is the standing pose, so it's dropped from every run sheet.
const SKIP: Record<string, number> = { "samurai/RunUp": 1, "samurai/RunDown": 1, "samurai/Run": 1, "commander/Run": 1, "commander/RunUp": 1, "commander/RunDown": 1 };
/** Trailing frames to drop, and sheets that don't loop cleanly (play 1→n→1 instead of snapping back). */
const DROP_END: Record<string, number> = {};
/** Hand-picked frames (grid order) when only some of an AI sheet are consistent with each other. */
const PICK: Record<string, number[]> = {};
const PINGPONG = new Set<string>();
/** Any square sheet bigger than one frame is a PixelLab grid (CraftPix sheets are long strips). */
function gridFor(key: string, img: HTMLImageElement): { cols: number; rows: number; skip: number; end: number; pingpong: boolean; pick?: number[] } | null {
  if (img.width !== img.height || img.width < 200) return null;
  const anim = key.split("/")[1];
  const cols = img.width % 3 === 0 && img.width / 3 >= 48 ? 3 : img.width % 4 === 0 ? 4 : 3;
  return { cols, rows: cols, skip: SKIP[key] ?? (anim === "RunUp" ? 1 : 0), end: DROP_END[key] ?? 0, pingpong: PINGPONG.has(key), pick: PICK[key] };
}
/** Sheets from a different tool: anchor each frame on its own body, not the idle pose's. */
const OWN_ANIMS = new Set(["Run", "Walk"]);   // PixelLab runs/walks are imported as plain strips too
/** Bodies whose attack/hurt/death sheets are CraftPix (consistent frames, shared anchor). */
const CRAFTPIX_BODIES = new Set(["samurai", "archer", "commander", "kitsune", "karasu", "ytengu", "skwarrior", "skspear", "skarcher"]);
const ownAnchored = (key: string, fromGrid: boolean) => {
  const [ch, anim] = key.split("/");
  return fromGrid || VIEW_ANIMS.has(anim) || OWN_ANIMS.has(anim) || (!CRAFTPIX_BODIES.has(ch) && anim !== "Idle");
};

function gridToStrip(img: HTMLImageElement, gd: { cols: number; rows: number; skip: number; end: number; pingpong: boolean; pick?: number[] }): HTMLCanvasElement {
  const cell = img.width / gd.cols;
  const idx: number[] = [];
  if (gd.pick) idx.push(...gd.pick);
  else for (let k = gd.skip; k < gd.cols * gd.rows - gd.end; k++) idx.push(k);
  if (gd.pingpong) for (let k = idx.length - 2; k > 0; k--) idx.push(idx[k]);
  const c = document.createElement("canvas");
  c.width = cell * idx.length; c.height = cell;
  const g = c.getContext("2d")!;
  idx.forEach((k, i) => {
    const col = k % gd.cols, row = Math.floor(k / gd.cols);
    g.drawImage(img, col * cell, row * cell, cell, cell, i * cell, 0, cell, cell);
  });
  return c;
}

/** Median x of opaque pixels between `a` and `b` (fractions of body height below the top).
 *  The median ignores thin things sticking out (banner poles, sheathed swords, flags). */
function bandMedianX(px: Uint8ClampedArray, size: number, top: number, feet: number, a: number, b: number): number | null {
  const xs: number[] = [];
  const h = feet - top;
  for (let y = top + Math.floor(h * a); y < Math.min(size, top + Math.floor(h * b)); y++)
    for (let x = 0; x < size; x++) if (px[(y * size + x) * 4 + 3] > 40) xs.push(x);
  if (!xs.length) return null;
  xs.sort((m, n) => m - n);
  return xs[xs.length >> 1];
}

/** Per frame anchors for AI-generated frames, which drift around their cells.
 *  Lock onto the head (stable) rather than the whole body (the sword and legs swing the
 *  centre of mass around and make the sprite shiver), then keep the body a fixed height. */
function ownAnchors(src: HTMLCanvasElement | HTMLImageElement, size: number, frames: number): { cx: number; feet: number }[] {
  const c = document.createElement("canvas");
  c.width = size; c.height = size;
  const g = c.getContext("2d", { willReadFrequently: true })!;
  const raw: { cx: number; top: number; feet: number }[] = [];
  for (let f = 0; f < frames; f++) {
    g.clearRect(0, 0, size, size);
    g.drawImage(src, f * size, 0, size, size, 0, 0, size, size);
    const px = g.getImageData(0, 0, size, size).data;
    const on = (x: number, y: number) => px[(y * size + x) * 4 + 3] > 40;
    let top = -1;
    for (let y = 0; y < size && top < 0; y++) for (let x = 0; x < size; x++) if (on(x, y)) { top = y; break; }
    if (top < 0) { raw.push({ cx: size / 2, top: 0, feet: size - 1 }); continue; }
    // head x first, to find the feet under the body (not the sword tip)
    let sx = 0, n = 0;
    for (let y = top; y < Math.min(size, top + 16); y++) for (let x = 0; x < size; x++) if (on(x, y)) { sx += x; n++; }
    const hx = n ? sx / n : size / 2;
    let feet = top;
    for (let y = size - 1; y > top; y--) { let hit = false; for (let x = Math.max(0, Math.floor(hx - 16)); x < Math.min(size, hx + 16); x++) if (on(x, y)) { hit = true; break; } if (hit) { feet = y; break; } }
    // then the hips/legs band, same as the idle anchor
    raw.push({ cx: bandMedianX(px, size, top, feet, 0.5, 0.85) ?? hx, top, feet });
  }
  const hs = raw.map(r => r.feet - r.top).sort((a, b) => a - b);
  const h = hs[Math.floor(hs.length / 2)];
  // Smooth x a little so frame-to-frame noise doesn't read as shaking.
  return raw.map((r, i) => {
    const prev = raw[(i - 1 + raw.length) % raw.length], next = raw[(i + 1) % raw.length];
    return { cx: (prev.cx + 2 * r.cx + next.cx) / 4, feet: r.top + h };
  });
}

interface Anchor { cx: number; top: number; feet: number; }

const sheets = new Map<string, Sheet>();
const variants = new Map<string, HTMLCanvasElement>();
const anchors = new Map<CharId, Anchor>();
let started = false;
let loaded = 0, total = 0;

function data(): Record<string, string> | null {
  const w = typeof window !== "undefined" ? (window as unknown as { __YUKEN_SPRITES?: Record<string, string> }) : null;
  return w?.__YUKEN_SPRITES ?? null;
}

/** True when sprite art shipped with this build at all. */
export function spritesAvailable(): boolean { return !!data(); }

export function loadSprites() {
  if (started) return;
  started = true;
  const d = data();
  if (!d || typeof Image === "undefined") return;
  // Hand-made bosses (src/pixelart.ts) are painted in code at start-up.
  try {
    for (const [id, look] of [["oni", ONI_LOOK], ["raijin", RAIJIN_LOOK]] as const) {
      if (d[`${id}/Idle`]) continue;   // real PixelLab art for this boss is in ./art — use that instead
      const sh = buildSheets(look);
      for (const [anim, c] of Object.entries(sh)) sheets.set(`${id}/${anim}`, { img: c, size: c.height, frames: Math.round(c.width / c.height) });
    }
  } catch { /* canvas unavailable: bosses keep their old art */ }
  for (const [key, url] of Object.entries(d)) {
    total++;
    const img = new Image();
    img.onload = () => {
      const gd = gridFor(key, img);
      const src = gd ? gridToStrip(img, gd) : img;
      const size = src.height;
      const sh: Sheet = { img: src, size, frames: Math.max(1, Math.round(src.width / size)) };
      if (ownAnchored(key, !!gd)) sh.own = ownAnchors(src, size, sh.frames);
      sheets.set(key, sh);
      loaded++;
    };
    img.src = url;
  }
}

export function spritesReady(): boolean { return total > 0 && loaded === total; }

/** Body anchor from the idle pose: horizontal centre of mass, head top and feet. */
function anchorOf(id: CharId): Anchor {
  const a = anchors.get(id);
  if (a) return a;
  const sh = sheets.get(`${id}/Idle`);
  const fallback = { cx: 64, top: 44, feet: 127 };
  if (!sh) return fallback;
  const c = document.createElement("canvas");
  c.width = sh.size; c.height = sh.size;
  const g = c.getContext("2d", { willReadFrequently: true });
  if (!g) return fallback;
  g.drawImage(sh.img, 0, 0, sh.size, sh.size, 0, 0, sh.size, sh.size);
  const px = g.getImageData(0, 0, sh.size, sh.size).data;
  let n = 0, top = sh.size, feet = 0;
  for (let y = 0; y < sh.size; y++) for (let x = 0; x < sh.size; x++) {
    if (px[(y * sh.size + x) * 4 + 3] > 40) { n++; if (y < top) top = y; if (y > feet) feet = y; }
  }
  // Centre on the hips/legs (median, 50–85% down the body) so every sheet — CraftPix or
  // PixelLab — lines up the same way; banners, tails and swords don't pull it sideways.
  const hx = bandMedianX(px, sh.size, top, feet, 0.5, 0.85);
  const hn = hx === null ? 0 : 1;
  const out = n ? { cx: hn ? (hx as number) : sh.size / 2, top, feet } : fallback;
  anchors.set(id, out);
  return out;
}

function sheetFor(id: CharId, anim: Anim): Sheet | undefined {
  const g = (n: string) => sheets.get(`${id}/${n}`);
  return g(anim)
    ?? (anim === "Protection" ? g("Protect") : anim === "Protect" ? g("Protection") : undefined)
    ?? (anim === "Shot" ? g("Shot_1") : anim === "Shot_1" ? g("Shot") : undefined)
    ?? (anim === "Run" ? g("Walk") : undefined)
    ?? (anim.startsWith("Attack") || anim.startsWith("Shot") ? g("Attack_1") ?? g("Walk") : undefined)
    ?? g("Idle");
}

function imageFor(id: CharId, anim: Anim, v: Variant): { src: CanvasImageSource; sh: Sheet } | null {
  const sh = sheetFor(id, anim);
  if (!sh) return null;
  if (v === "base") return { src: sh.img, sh };
  const key = `${id}/${anim}/${v}`;
  let c = variants.get(key);
  if (!c) {
    c = document.createElement("canvas");
    c.width = sh.img.width; c.height = sh.img.height;
    const g = c.getContext("2d");
    if (!g) return { src: sh.img, sh };
    g.filter = FILTERS[v];
    g.drawImage(sh.img, 0, 0);
    variants.set(key, c);
  }
  return { src: c, sh };
}

/** Height of the drawn pixels in one frame of a sheet. */
function frameHeight(sh: Sheet, f = 0): number {
  const c = document.createElement("canvas");
  c.width = sh.size; c.height = sh.size;
  const g = c.getContext("2d", { willReadFrequently: true })!;
  g.drawImage(sh.img, f * sh.size, 0, sh.size, sh.size, 0, 0, sh.size, sh.size);
  const px = g.getImageData(0, 0, sh.size, sh.size).data;
  let top = -1, bot = -1;
  for (let y = 0; y < sh.size; y++) for (let x = 0; x < sh.size; x++) if (px[(y * sh.size + x) * 4 + 3] > 40) { if (top < 0) top = y; bot = y; break; }
  return top < 0 ? 0 : bot - top;
}

/** Views drawn by a different tool can come out bigger than the body's idle pose (e.g. the
 *  CraftPix samurai is 68px tall, PixelLab's front view of him 99px). Scale each movement
 *  view so its standing height matches the idle pose: front views against the standing
 *  front (IdleDown), back views against IdleUp, side walks/runs against the walk. */
const viewScale = new Map<string, number>();
function scaleFor(id: CharId, anim: Anim): number {
  const key = `${id}/${anim}`;
  const hit = viewScale.get(key);
  if (hit !== undefined) return hit;
  let f = 1;
  const idle = sheets.get(`${id}/Idle`);
  const refKey = anim === "RunDown" || anim === "IdleDown" ? "IdleDown"
    : anim === "RunUp" || anim === "IdleUp" ? "IdleUp"
    : anim === "Run" || anim === "Walk" ? "Walk" : null;
  const ref = refKey ? sheets.get(`${id}/${refKey}`) : undefined;
  if (idle && ref) {
    const ih = frameHeight(idle);
    const hs: number[] = [];
    for (let i = 0; i < Math.min(ref.frames, 8); i++) hs.push(frameHeight(ref, i));
    hs.sort((a, b) => a - b);
    const rh = hs[hs.length >> 1];
    if (ih > 8 && rh > 8) f = Math.max(0.6, Math.min(1.25, ih / rh));
  }
  viewScale.set(key, f);
  return f;
}

export function frameCount(id: CharId, anim: Anim): number { return sheetFor(id, anim)?.frames ?? 1; }
/** True only if this character has its own sheet for the animation (no fallback). */
export function hasAnim(id: CharId, anim: Anim): boolean { return sheets.has(`${id}/${anim}`); }
/** True if this body has any art at all. */
export function hasBody(id: CharId): boolean { return sheets.has(`${id}/Idle`) || sheets.has(`${id}/Walk`); }

export interface DrawOpts {
  /** Frame index (wrapped for loops, clamped otherwise). */
  frame: number;
  loop?: boolean;
  /** Face left instead of right. */
  flip?: boolean;
  /** On-screen body height (head top to feet), in world px. */
  height: number;
  variant?: Variant;
  /** 0..1 white hit flash drawn over the body. */
  flash?: number;
}

/** Draw a character with its feet at (0, 0) of the current transform. */
export function drawChar(ctx: CanvasRenderingContext2D, id: CharId, anim: Anim, o: DrawOpts): boolean {
  const im = imageFor(id, anim, o.variant ?? "base");
  if (!im) return false;
  const { sh } = im;
  const an = anchorOf(id);
  const n = sh.frames;
  let f = Math.floor(o.frame);
  f = o.loop === false ? Math.max(0, Math.min(n - 1, f)) : ((f % n) + n) % n;
  const k = (o.height / Math.max(8, an.feet - an.top)) * scaleFor(id, anim);
  const smooth = ctx.imageSmoothingEnabled;
  ctx.imageSmoothingEnabled = false;
  ctx.save();
  if (o.flip) ctx.scale(-1, 1);
  const own = sh.own?.[f];
  const ax = own?.cx ?? an.cx, af = own?.feet ?? an.feet;
  const dx = -ax * k, dy = -af * k, s = sh.size * k;
  ctx.drawImage(im.src, f * sh.size, 0, sh.size, sh.size, dx, dy, s, s);
  if (o.flash && o.flash > 0) {
    const fl = imageFor(id, anim, "flash");
    if (fl) {
      const a = ctx.globalAlpha;
      ctx.globalAlpha = a * Math.min(1, o.flash);
      ctx.drawImage(fl.src, f * sh.size, 0, sh.size, sh.size, dx, dy, s, s);
      ctx.globalAlpha = a;
    }
  }
  ctx.restore();
  ctx.imageSmoothingEnabled = smooth;
  return true;
}

/** Which body each class wears. */
export function classChar(classId: string): CharId {
  switch (classId) {
    case "kitsune": return "kitsune";
    case "tengu": return "karasu";
    case "yamabushi": return "ytengu";
    case "tetsubo": case "berserker": case "sohei": case "rikishi":
    case "hatamoto": case "ashigaru": case "dokkaebi":
      return "commander";
    case "takajo": case "teppo":
      return "archer";
    default:
      return "samurai";
  }
}
