// ─── Pixel-art character sprites (v3.7) ──────────────────────────────────────
// Licensed CraftPix "Samurai" sheets, inlined by the build as
// window.__YUKEN_SPRITES (see scripts/sprites.mjs). Every sheet is a row of
// 128×128 frames facing right. If the art isn't present (public CI build) or
// the player turns it off, the game keeps drawing the original shapes.
//
// Characters are side-view, so we use the Nuclear Throne / Gungeon trick: the
// body flips left/right toward where you aim, while attack arcs, telegraphs
// and hitboxes stay exactly as they were.

export type CharId = "samurai" | "archer" | "commander";
export type Anim = "Idle" | "Walk" | "Run" | "Attack_1" | "Attack_2" | "Attack_3" | "Hurt" | "Dead" | "Protection" | "Protect" | "Shot";
/** Colour variants, made once with a canvas filter and cached. */
export type Variant = "base" | "crimson" | "shade" | "flash" | "gold";

const FILTERS: Record<Variant, string> = {
  base: "none",
  crimson: "sepia(1) saturate(3) hue-rotate(-38deg) brightness(.95)", // navy samurai → blood-red ronin
  shade: "grayscale(1) sepia(.6) hue-rotate(225deg) saturate(2.4) brightness(.8)", // violet shinobi
  flash: "brightness(0) invert(1)",                       // white hit silhouette
  gold: "sepia(1) saturate(2.2) hue-rotate(-12deg) brightness(1.05)",
};

interface Sheet { img: HTMLImageElement; frames: number; size: number; }
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
  for (const [key, url] of Object.entries(d)) {
    total++;
    const img = new Image();
    img.onload = () => {
      sheets.set(key, { img, size: img.height, frames: Math.max(1, Math.round(img.width / img.height)) });
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
  let sx = 0, n = 0, top = sh.size, feet = 0;
  for (let y = 0; y < sh.size; y++) for (let x = 0; x < sh.size; x++) {
    if (px[(y * sh.size + x) * 4 + 3] > 40) { sx += x; n++; if (y < top) top = y; if (y > feet) feet = y; }
  }
  const out = n ? { cx: sx / n, top, feet } : fallback;
  anchors.set(id, out);
  return out;
}

function sheetFor(id: CharId, anim: Anim): Sheet | undefined {
  return sheets.get(`${id}/${anim}`)
    ?? (anim === "Protection" ? sheets.get(`${id}/Protect`) : anim === "Protect" ? sheets.get(`${id}/Protection`) : undefined)
    ?? (anim === "Shot" ? sheets.get(`${id}/Attack_1`) : undefined)
    ?? sheets.get(`${id}/Idle`);
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

export function frameCount(id: CharId, anim: Anim): number { return sheetFor(id, anim)?.frames ?? 1; }

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
  const k = o.height / Math.max(8, an.feet - an.top);
  const smooth = ctx.imageSmoothingEnabled;
  ctx.imageSmoothingEnabled = false;
  ctx.save();
  if (o.flip) ctx.scale(-1, 1);
  const dx = -an.cx * k, dy = -an.feet * k, s = sh.size * k;
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
    case "tetsubo": case "berserker": case "sohei": case "yamabushi": case "rikishi":
    case "hatamoto": case "ashigaru": case "dokkaebi":
      return "commander";
    case "takajo": case "teppo":
      return "archer";
    default:
      return "samurai";
  }
}
