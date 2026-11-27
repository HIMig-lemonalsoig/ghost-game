// Arena floor: a tileable per-biome ground texture, scattered props, drifting
// cloud shadows and a fenced border. Everything is drawn in world space.
// Floors are mid-tone so the dark player and enemies stay easy to read.

type BiomeKey = "tsushima" | "bamboo" | "snowfield" | "burning" | "castle";

interface Palette {
  base: string;
  blotch: [number, number, number][]; // hsl triples for large soft patches
  strokes: [number, number, number][]; // grass / leaf / gravel marks
  strokeKind: "grass" | "leaf" | "gravel" | "ash" | "snow";
  shadow: string;       // cloud-shadow tint
  border: string;
  edge: string;         // outside-the-arena colour
  props: PropKind[];
}

type PropKind = "rock" | "lily" | "tuft" | "bamboo" | "pine" | "ice" | "ember" | "lantern" | "flagstone" | "stump";

interface Prop { kind: PropKind; x: number; y: number; s: number; r: number; seed: number; }

const PALETTES: Record<BiomeKey, Palette> = {
  tsushima: {
    base: "hsl(56, 30%, 37%)",
    blotch: [[48, 42, 44], [70, 26, 32], [38, 48, 46], [84, 22, 30]],
    strokes: [[62, 36, 48], [46, 52, 56], [80, 28, 38], [40, 58, 62]],
    strokeKind: "grass",
    shadow: "rgba(20, 24, 10, 0.16)",
    border: "hsl(28, 35%, 22%)",
    edge: "hsl(70, 20%, 14%)",
    props: ["tuft", "tuft", "tuft", "lily", "lily", "rock", "stump"],
  },
  bamboo: {
    base: "hsl(132, 18%, 22%)",
    blotch: [[120, 24, 26], [145, 20, 18], [95, 22, 28], [160, 16, 20]],
    strokes: [[85, 35, 42], [110, 30, 36], [60, 40, 46], [140, 22, 30]],
    strokeKind: "leaf",
    shadow: "rgba(4, 18, 10, 0.2)",
    border: "hsl(80, 30%, 18%)",
    edge: "hsl(140, 22%, 9%)",
    props: ["bamboo", "bamboo", "tuft", "rock", "tuft"],
  },
  snowfield: {
    base: "hsl(210, 22%, 80%)",
    blotch: [[210, 30, 86], [215, 22, 72], [200, 35, 90], [220, 18, 76]],
    strokes: [[210, 30, 92], [215, 18, 70], [205, 25, 84], [220, 15, 66]],
    strokeKind: "snow",
    shadow: "rgba(40, 60, 100, 0.14)",
    border: "hsl(215, 20%, 40%)",
    edge: "hsl(215, 25%, 55%)",
    props: ["pine", "pine", "ice", "ice", "rock"],
  },
  burning: {
    base: "hsl(18, 20%, 18%)",
    blotch: [[15, 25, 22], [30, 18, 14], [5, 30, 20], [25, 12, 26]],
    strokes: [[20, 12, 32], [0, 0, 36], [18, 40, 28], [30, 10, 40]],
    strokeKind: "ash",
    shadow: "rgba(0, 0, 0, 0.22)",
    border: "hsl(10, 40%, 16%)",
    edge: "hsl(10, 30%, 7%)",
    props: ["ember", "ember", "rock", "stump", "ember"],
  },
  castle: {
    base: "hsl(36, 12%, 36%)",
    blotch: [[36, 14, 40], [30, 10, 32], [40, 16, 44], [25, 8, 30]],
    strokes: [[36, 10, 46], [30, 8, 28], [40, 12, 52], [32, 6, 34]],
    strokeKind: "gravel",
    shadow: "rgba(20, 14, 8, 0.18)",
    border: "hsl(358, 45%, 30%)",
    edge: "hsl(30, 10%, 16%)",
    props: ["flagstone", "flagstone", "lantern", "rock", "flagstone"],
  },
};

function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
    return ((s >>> 0) % 100000) / 100000;
  };
}

const hsl = (t: [number, number, number], a = 1) => `hsla(${t[0]}, ${t[1]}%, ${t[2]}%, ${a})`;
const TILE = 512;

export class Arena {
  private biome: BiomeKey = "tsushima";
  private pal: Palette = PALETTES.tsushima;
  private pattern: CanvasPattern | null = null;
  private props: Prop[] = [];
  private shadowBlob: HTMLCanvasElement | null = null;
  private w = 0;
  private h = 0;

  build(biome: string, worldW: number, worldH: number, ctx: CanvasRenderingContext2D) {
    const key = (biome in PALETTES ? biome : "tsushima") as BiomeKey;
    if (key === this.biome && this.pattern && worldW === this.w && worldH === this.h) return;
    const biomeChanged = key !== this.biome || !this.pattern;
    this.biome = key;
    this.pal = PALETTES[key];
    this.w = worldW;
    this.h = worldH;
    if (biomeChanged) this.pattern = this.makePattern(ctx);
    this.props = this.makeProps();
    if (!this.shadowBlob) this.shadowBlob = this.makeShadowBlob();
  }

  edgeColor() { return this.pal.edge; }

  // ── Minimap terrain (v3.6) ──────────────────────────────────────────────
  // A small painted map of this arena: ground tone, soft patches, every prop
  // as a tiny map symbol and the fence. Cached until the biome / size changes.
  private mm: HTMLCanvasElement | null = null;
  private mmKey = "";
  minimapImage(pw: number, ph: number): HTMLCanvasElement | null {
    if (!this.w || !this.h || typeof document === "undefined") return null;
    const dpr = Math.min(2, (typeof devicePixelRatio === "number" ? devicePixelRatio : 1) || 1);
    const W = Math.max(1, Math.round(pw * dpr)), H = Math.max(1, Math.round(ph * dpr));
    const key = `${this.biome}|${this.w}|${this.h}|${W}|${H}`;
    if (this.mm && this.mmKey === key) return this.mm;
    const c = this.mm ?? document.createElement("canvas");
    c.width = W; c.height = H;
    const g = c.getContext("2d");
    if (!g) return null;
    const kx = W / this.w, ky = H / this.h, k = Math.min(kx, ky);
    g.fillStyle = this.pal.base; g.fillRect(0, 0, W, H);
    // soft ground patches
    const r = rng(this.w * 7 + this.h * 3 + this.biome.length * 59);
    for (let i = 0; i < 60; i++) {
      const t = this.pal.blotch[i % this.pal.blotch.length];
      const x = r() * W, y = r() * H, rad = (0.04 + r() * 0.1) * Math.max(W, H);
      const gr = g.createRadialGradient(x, y, 0, x, y, rad);
      gr.addColorStop(0, hsl(t, 0.8)); gr.addColorStop(1, hsl(t, 0));
      g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
    // fine texture flecks
    for (let i = 0; i < 900; i++) {
      const t = this.pal.strokes[i % this.pal.strokes.length];
      g.fillStyle = hsl(t, 0.35);
      g.fillRect(r() * W, r() * H, Math.max(1, dpr), Math.max(1, dpr));
    }
    // props as map symbols (scaled with the map, never smaller than ~1.5px)
    const u = Math.max(3.2 * dpr, 70 * k);
    for (const p of this.props) {
      const x = p.x * kx, y = p.y * ky, s = u * (0.55 + p.s * 0.35);
      g.save(); g.translate(x, y);
      switch (p.kind) {
        case "rock": g.fillStyle = this.biome === "snowfield" ? "hsl(215, 12%, 46%)" : "hsl(30, 6%, 30%)"; g.beginPath(); g.ellipse(0, 0, s * 0.55, s * 0.4, p.r, 0, Math.PI * 2); g.fill(); break;
        case "tuft": g.strokeStyle = "hsla(80, 40%, 26%, .8)"; g.lineWidth = Math.max(1, s * 0.18); g.beginPath(); g.moveTo(-s * 0.3, s * 0.2); g.lineTo(0, -s * 0.3); g.lineTo(s * 0.3, s * 0.2); g.stroke(); break;
        case "lily": g.fillStyle = "hsla(120, 30%, 30%, .85)"; g.beginPath(); g.arc(0, 0, s * 0.38, 0, Math.PI * 2); g.fill(); g.fillStyle = "hsl(330, 60%, 78%)"; g.fillRect(-s * 0.1, -s * 0.1, s * 0.2, s * 0.2); break;
        case "stump": g.fillStyle = "hsl(26, 32%, 24%)"; g.beginPath(); g.arc(0, 0, s * 0.35, 0, Math.PI * 2); g.fill(); break;
        case "bamboo": g.strokeStyle = "hsl(95, 40%, 36%)"; g.lineWidth = Math.max(1, s * 0.16); for (let j = -1; j <= 1; j++) { g.beginPath(); g.moveTo(j * s * 0.25, s * 0.45); g.lineTo(j * s * 0.25, -s * 0.45); g.stroke(); } break;
        case "pine": g.fillStyle = "hsl(160, 30%, 22%)"; g.beginPath(); g.moveTo(0, -s * 0.6); g.lineTo(s * 0.45, s * 0.4); g.lineTo(-s * 0.45, s * 0.4); g.closePath(); g.fill(); break;
        case "ice": g.fillStyle = "hsl(195, 70%, 88%)"; g.rotate(Math.PI / 4); g.fillRect(-s * 0.28, -s * 0.28, s * 0.56, s * 0.56); break;
        case "ember": g.fillStyle = "hsl(22, 95%, 55%)"; g.beginPath(); g.arc(0, 0, s * 0.3, 0, Math.PI * 2); g.fill(); g.fillStyle = "hsla(22, 95%, 55%, .25)"; g.beginPath(); g.arc(0, 0, s * 0.7, 0, Math.PI * 2); g.fill(); break;
        case "lantern": g.fillStyle = "hsl(44, 90%, 62%)"; g.fillRect(-s * 0.2, -s * 0.3, s * 0.4, s * 0.6); break;
        case "flagstone": g.fillStyle = "hsla(36, 10%, 56%, .7)"; g.rotate(p.r); g.fillRect(-s * 0.5, -s * 0.35, s, s * 0.7); break;
      }
      g.restore();
    }
    // spawn clearing + fence
    g.strokeStyle = "rgba(0,0,0,.18)"; g.lineWidth = dpr;
    g.beginPath(); g.arc(W / 2, H / 2, 140 * k, 0, Math.PI * 2); g.stroke();
    const vg = g.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.max(W, H) * 0.72);
    vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,.35)");
    g.fillStyle = vg; g.fillRect(0, 0, W, H);
    g.strokeStyle = this.pal.border; g.lineWidth = Math.max(2, 2 * dpr);
    g.strokeRect(g.lineWidth / 2, g.lineWidth / 2, W - g.lineWidth, H - g.lineWidth);
    this.mm = c; this.mmKey = key;
    return c;
  }

  private makePattern(ctx: CanvasRenderingContext2D): CanvasPattern | null {
    const c = document.createElement("canvas");
    c.width = TILE; c.height = TILE;
    const g = c.getContext("2d")!;
    const pal = this.pal;
    const r = rng(Object.keys(PALETTES).indexOf(this.biome) * 7919 + 17);
    g.fillStyle = pal.base;
    g.fillRect(0, 0, TILE, TILE);
    // Draw `fn` at (x, y) plus wrapped copies so the tile repeats seamlessly.
    const wrap = (x: number, y: number, rad: number, fn: (x: number, y: number) => void) => {
      for (const ox of [0, -TILE, TILE]) for (const oy of [0, -TILE, TILE]) {
        const px = x + ox, py = y + oy;
        if (px + rad < 0 || px - rad > TILE || py + rad < 0 || py - rad > TILE) continue;
        fn(px, py);
      }
    };
    // Large soft patches give the ground variation at a glance.
    for (let i = 0; i < 26; i++) {
      const x = r() * TILE, y = r() * TILE, rad = 40 + r() * 110;
      const col = pal.blotch[i % pal.blotch.length];
      wrap(x, y, rad, (px, py) => {
        const gr = g.createRadialGradient(px, py, 0, px, py, rad);
        gr.addColorStop(0, hsl(col, 0.55));
        gr.addColorStop(1, hsl(col, 0));
        g.fillStyle = gr;
        g.beginPath(); g.arc(px, py, rad, 0, Math.PI * 2); g.fill();
      });
    }
    // Fine marks: grass blades, leaves, gravel, ash, snow sparkle.
    const n = pal.strokeKind === "gravel" ? 900 : pal.strokeKind === "snow" ? 500 : 700;
    for (let i = 0; i < n; i++) {
      const x = r() * TILE, y = r() * TILE;
      const col = pal.strokes[Math.floor(r() * pal.strokes.length)];
      const a = 0.35 + r() * 0.5;
      wrap(x, y, 12, (px, py) => {
        g.strokeStyle = hsl(col, a);
        g.fillStyle = hsl(col, a);
        g.lineCap = "round";
        switch (pal.strokeKind) {
          case "grass": {
            g.lineWidth = 1.2;
            const len = 4 + r() * 7, lean = (r() - 0.5) * 4;
            g.beginPath(); g.moveTo(px, py); g.quadraticCurveTo(px + lean * 0.5, py - len * 0.6, px + lean, py - len); g.stroke();
            break;
          }
          case "leaf": {
            const ang = r() * Math.PI;
            g.save(); g.translate(px, py); g.rotate(ang);
            g.beginPath(); g.ellipse(0, 0, 5 + r() * 3, 1.4, 0, 0, Math.PI * 2); g.fill();
            g.restore();
            break;
          }
          case "gravel":
            g.beginPath(); g.arc(px, py, 0.8 + r() * 1.6, 0, Math.PI * 2); g.fill();
            break;
          case "ash":
            g.beginPath(); g.arc(px, py, 0.6 + r() * 2.2, 0, Math.PI * 2); g.fill();
            break;
          case "snow":
            g.lineWidth = 1;
            g.beginPath(); g.ellipse(px, py, 3 + r() * 6, 1.2 + r() * 1.5, 0, 0, Math.PI * 2); g.stroke();
            break;
        }
      });
    }
    // Castle courtyard: raked-gravel arcs.
    if (this.biome === "castle") {
      g.strokeStyle = "hsla(36, 12%, 52%, 0.25)";
      g.lineWidth = 1.5;
      for (let y = 8; y < TILE; y += 16) {
        g.beginPath();
        for (let x = 0; x <= TILE; x += 16) g.lineTo(x, y + Math.sin((x / TILE) * Math.PI * 4) * 4);
        g.stroke();
      }
    }
    return ctx.createPattern(c, "repeat");
  }

  private makeShadowBlob(): HTMLCanvasElement {
    const c = document.createElement("canvas");
    c.width = 256; c.height = 256;
    const g = c.getContext("2d")!;
    const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    gr.addColorStop(0, "rgba(0,0,0,1)");
    gr.addColorStop(0.6, "rgba(0,0,0,0.55)");
    gr.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = gr;
    g.fillRect(0, 0, 256, 256);
    return c;
  }

  private makeProps(): Prop[] {
    const r = rng(this.w * 31 + this.h * 17 + this.biome.length * 101);
    const count = Math.round((this.w * this.h) / 26000);
    const out: Prop[] = [];
    const cx = this.w / 2, cy = this.h / 2;
    for (let i = 0; i < count; i++) {
      const x = 40 + r() * (this.w - 80), y = 40 + r() * (this.h - 80);
      // Keep the spawn area in the middle clear.
      if (Math.hypot(x - cx, y - cy) < 140) continue;
      const kind = this.pal.props[Math.floor(r() * this.pal.props.length)];
      out.push({ kind, x, y, s: 0.7 + r() * 0.7, r: r() * Math.PI * 2, seed: r() });
    }
    // Flagstones sit under everything else.
    out.sort((a, b) => (a.kind === "flagstone" ? -1 : 0) - (b.kind === "flagstone" ? -1 : 0) || a.y - b.y);
    return out;
  }

  draw(ctx: CanvasRenderingContext2D, camX: number, camY: number, viewW: number, viewH: number, t: number, wind = 1) {
    const pad = 80;
    // Outside the arena
    ctx.fillStyle = this.pal.edge;
    ctx.fillRect(camX - pad, camY - pad, viewW + pad * 2, viewH + pad * 2);
    // Floor
    if (this.pattern) {
      ctx.fillStyle = this.pattern;
      const x0 = Math.max(0, camX - pad), y0 = Math.max(0, camY - pad);
      const x1 = Math.min(this.w, camX + viewW + pad), y1 = Math.min(this.h, camY + viewH + pad);
      ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
    }
    // Props
    for (const p of this.props) {
      if (p.x < camX - 60 || p.x > camX + viewW + 60 || p.y < camY - 60 || p.y > camY + viewH + 60) continue;
      this.drawProp(ctx, p, t, wind);
    }
    // Drifting cloud shadows keep the ground slowly alive.
    if (this.shadowBlob) {
      ctx.save();
      ctx.globalAlpha = 1;
      const tint = this.pal.shadow;
      const alpha = Number(/,\s*([\d.]+)\)$/.exec(tint)?.[1] ?? 0.15);
      ctx.globalAlpha = alpha;
      for (let i = 0; i < 7; i++) {
        const sz = 380 + (i % 3) * 140;
        const sx = ((i * 613 + t * (14 + i * 2)) % (this.w + sz * 2)) - sz;
        const sy = ((i * 397 + t * (5 + i)) % (this.h + sz * 2)) - sz;
        if (sx + sz < camX || sx > camX + viewW || sy + sz < camY || sy > camY + viewH) continue;
        ctx.drawImage(this.shadowBlob, sx, sy, sz * 1.6, sz);
      }
      ctx.restore();
    }
    this.drawBorder(ctx, t);
  }

  private drawBorder(ctx: CanvasRenderingContext2D, t: number) {
    const w = this.w, h = this.h;
    ctx.save();
    // Soft inner shade so the edge reads as a boundary
    const band = 70;
    const shade = (x: number, y: number, ww: number, hh: number, x0: number, y0: number, x1: number, y1: number) => {
      const gr = ctx.createLinearGradient(x0, y0, x1, y1);
      gr.addColorStop(0, "rgba(0,0,0,0.35)");
      gr.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = gr;
      ctx.fillRect(x, y, ww, hh);
    };
    shade(0, 0, w, band, 0, 0, 0, band);
    shade(0, h - band, w, band, 0, h, 0, h - band);
    shade(0, 0, band, h, 0, 0, band, 0);
    shade(w - band, 0, band, h, w, 0, w - band, 0);
    // Rope fence with posts
    ctx.strokeStyle = this.pal.border;
    ctx.lineWidth = 5;
    ctx.strokeRect(6, 6, w - 12, h - 12);
    ctx.strokeStyle = "hsla(40, 40%, 70%, 0.35)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([10, 8]);
    ctx.lineDashOffset = -t * 6;
    ctx.strokeRect(6, 6, w - 12, h - 12);
    ctx.setLineDash([]);
    ctx.fillStyle = this.pal.border;
    for (let x = 6; x <= w - 6; x += 90) { ctx.fillRect(x - 4, 2, 8, 10); ctx.fillRect(x - 4, h - 12, 8, 10); }
    for (let y = 6; y <= h - 6; y += 90) { ctx.fillRect(2, y - 4, 10, 8); ctx.fillRect(w - 12, y - 4, 10, 8); }
    ctx.restore();
  }

  private drawProp(ctx: CanvasRenderingContext2D, p: Prop, t: number, wind: number) {
    const s = p.s;
    const sway = Math.sin(t * 1.6 + p.seed * 12) * 2.5 * wind;
    ctx.save();
    ctx.translate(p.x, p.y);
    switch (p.kind) {
      case "rock": {
        ctx.fillStyle = "rgba(0,0,0,0.25)";
        ctx.beginPath(); ctx.ellipse(3, 4, 14 * s, 8 * s, 0, 0, Math.PI * 2); ctx.fill();
        ctx.rotate(p.r * 0.2);
        ctx.fillStyle = this.biome === "snowfield" ? "hsl(215, 10%, 45%)" : "hsl(30, 6%, 40%)";
        ctx.beginPath(); ctx.ellipse(0, 0, 13 * s, 9 * s, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = this.biome === "snowfield" ? "hsl(210, 30%, 92%)" : "hsl(30, 8%, 55%)";
        ctx.beginPath(); ctx.ellipse(-3 * s, -3 * s, 7 * s, 4 * s, -0.4, 0, Math.PI * 2); ctx.fill();
        break;
      }
      case "tuft": {
        ctx.strokeStyle = this.biome === "bamboo" ? "hsl(100, 35%, 38%)" : "hsl(62, 34%, 44%)";
        ctx.lineWidth = 1.6;
        ctx.lineCap = "round";
        for (let i = -3; i <= 3; i++) {
          const len = (12 + (i % 2) * 4) * s;
          ctx.beginPath();
          ctx.moveTo(i * 2.2, 0);
          ctx.quadraticCurveTo(i * 3 + sway * 0.4, -len * 0.6, i * 4 + sway, -len);
          ctx.stroke();
        }
        break;
      }
      case "lily": {
        // Red spider lilies (higanbana) — thin petals curling outward.
        ctx.strokeStyle = "hsl(110, 30%, 32%)";
        ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(sway * 0.3, -10 * s); ctx.stroke();
        ctx.translate(sway * 0.3, -10 * s);
        ctx.strokeStyle = "hsl(354, 78%, 50%)";
        ctx.lineWidth = 1.3;
        for (let i = 0; i < 7; i++) {
          const a = (i / 7) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.quadraticCurveTo(Math.cos(a) * 7 * s, Math.sin(a) * 7 * s, Math.cos(a + 0.6) * 9 * s, Math.sin(a + 0.6) * 9 * s);
          ctx.stroke();
        }
        ctx.fillStyle = "hsl(358, 85%, 58%)";
        ctx.beginPath(); ctx.arc(0, 0, 2 * s, 0, Math.PI * 2); ctx.fill();
        break;
      }
      case "stump": {
        ctx.fillStyle = "rgba(0,0,0,0.25)";
        ctx.beginPath(); ctx.ellipse(3, 3, 12 * s, 9 * s, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = this.biome === "burning" ? "hsl(15, 20%, 14%)" : "hsl(28, 35%, 28%)";
        ctx.beginPath(); ctx.arc(0, 0, 10 * s, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = this.biome === "burning" ? "hsla(20, 90%, 50%, 0.6)" : "hsl(32, 35%, 42%)";
        ctx.lineWidth = 1;
        for (let k = 3; k < 10; k += 3) { ctx.beginPath(); ctx.arc(0, 0, k * s, 0, Math.PI * 2); ctx.stroke(); }
        break;
      }
      case "bamboo": {
        // Top-down bamboo clump: a few stalk tops with leaf sprays that sway.
        for (let i = 0; i < 4; i++) {
          const a = p.r + i * 1.6, d = 8 * s;
          const bx = Math.cos(a) * d, by = Math.sin(a) * d;
          ctx.fillStyle = "rgba(0,0,0,0.3)";
          ctx.beginPath(); ctx.arc(bx + 4, by + 4, 5 * s, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "hsl(95, 40%, 42%)";
          ctx.beginPath(); ctx.arc(bx, by, 4.5 * s, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = "hsl(80, 45%, 60%)";
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.arc(bx, by, 3 * s, 0, Math.PI * 2); ctx.stroke();
        }
        ctx.fillStyle = "hsla(110, 40%, 36%, 0.85)";
        for (let i = 0; i < 9; i++) {
          const a = p.r + i * 0.7 + sway * 0.04;
          ctx.save();
          ctx.rotate(a);
          ctx.beginPath(); ctx.ellipse(18 * s, 0, 10 * s, 2.6 * s, 0, 0, Math.PI * 2); ctx.fill();
          ctx.restore();
        }
        break;
      }
      case "pine": {
        ctx.fillStyle = "rgba(30,50,90,0.2)";
        ctx.beginPath(); ctx.ellipse(6, 6, 20 * s, 14 * s, 0, 0, Math.PI * 2); ctx.fill();
        for (let layer = 0; layer < 3; layer++) {
          const rad = (20 - layer * 6) * s;
          ctx.fillStyle = layer % 2 ? "hsl(160, 30%, 22%)" : "hsl(155, 28%, 28%)";
          ctx.beginPath();
          for (let i = 0; i < 16; i++) {
            const a = (i / 16) * Math.PI * 2 + p.r;
            const rr = i % 2 ? rad : rad * 0.6;
            i ? ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : ctx.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
          }
          ctx.closePath(); ctx.fill();
        }
        ctx.fillStyle = "hsla(210, 40%, 96%, 0.85)";
        for (let i = 0; i < 5; i++) {
          const a = p.r + i * 1.3;
          ctx.beginPath(); ctx.arc(Math.cos(a) * 8 * s, Math.sin(a) * 8 * s, 2.5 * s, 0, Math.PI * 2); ctx.fill();
        }
        break;
      }
      case "ice": {
        ctx.rotate(p.r);
        ctx.fillStyle = "hsla(195, 60%, 88%, 0.75)";
        ctx.beginPath(); ctx.ellipse(0, 0, 28 * s, 14 * s, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "hsla(200, 70%, 70%, 0.6)";
        ctx.lineWidth = 1;
        ctx.stroke();
        const glint = 0.4 + 0.6 * Math.max(0, Math.sin(t * 2 + p.seed * 20));
        ctx.strokeStyle = `hsla(0, 0%, 100%, ${glint})`;
        ctx.beginPath(); ctx.moveTo(-10 * s, -4 * s); ctx.lineTo(4 * s, -7 * s); ctx.stroke();
        break;
      }
      case "ember": {
        // Glowing crack that pulses.
        const pulse = 0.5 + 0.5 * Math.sin(t * 3 + p.seed * 9);
        ctx.rotate(p.r);
        ctx.lineCap = "round";
        ctx.strokeStyle = `hsla(18, 95%, ${45 + pulse * 15}%, ${0.35 + pulse * 0.4})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-22 * s, 0); ctx.lineTo(-8 * s, 4 * s); ctx.lineTo(0, -3 * s); ctx.lineTo(12 * s, 3 * s); ctx.lineTo(24 * s, -2 * s);
        ctx.moveTo(0, -3 * s); ctx.lineTo(4 * s, -14 * s);
        ctx.stroke();
        ctx.strokeStyle = `hsla(45, 100%, 75%, ${0.3 + pulse * 0.5})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        break;
      }
      case "lantern": {
        // Stone tōrō seen from above, flame flickering in the light box.
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.fillRect(-9 * s + 4, -9 * s + 4, 18 * s, 18 * s);
        ctx.fillStyle = "hsl(30, 6%, 48%)";
        ctx.fillRect(-9 * s, -9 * s, 18 * s, 18 * s);
        ctx.fillStyle = "hsl(30, 6%, 38%)";
        ctx.fillRect(-6 * s, -6 * s, 12 * s, 12 * s);
        const flick = 0.75 + Math.sin(t * 9 + p.seed * 40) * 0.15;
        const gr = ctx.createRadialGradient(0, 0, 0, 0, 0, 34 * s);
        gr.addColorStop(0, `hsla(40, 100%, 70%, ${0.45 * flick})`);
        gr.addColorStop(1, "hsla(40, 100%, 60%, 0)");
        ctx.fillStyle = gr;
        ctx.beginPath(); ctx.arc(0, 0, 34 * s, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = `hsla(45, 100%, 80%, ${flick})`;
        ctx.beginPath(); ctx.arc(0, 0, 2.5 * s, 0, Math.PI * 2); ctx.fill();
        break;
      }
      case "flagstone": {
        ctx.rotate(p.r * 0.15);
        ctx.fillStyle = "hsla(36, 10%, 46%, 0.9)";
        ctx.strokeStyle = "hsla(30, 10%, 24%, 0.6)";
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.roundRect(-26 * s, -18 * s, 52 * s, 36 * s, 5); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = "hsla(36, 12%, 60%, 0.35)";
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(-20 * s, -10 * s); ctx.lineTo(10 * s, -12 * s); ctx.stroke();
        break;
      }
    }
    ctx.restore();
  }
}
