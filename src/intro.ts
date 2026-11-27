// ─── Opening intro: "居合 · Iai Draw" ────────────────────────────────────────
// Plays each time the game opens (about 6.5 s, skippable):
//   1. Ember smoke rolls in        — port of "HANZO Ember Smoke" (21st.dev Shader Builder, workout_scorpion)
//   2. Ink soaks into a washi moon — port of "Ink Blot Reveal" (21st.dev, kedhareswer): turbulence-masked blot
//   3. 幽剣 is drawn with a brush, then fills with rising crimson ink
//                                  — port of "Stroke Draw Type" (21st.dev, isaiahbjork): dash-drawn outline,
//                                    gold pen-tip glow, goo-masked liquid fill with beading drops
//   4. An iai draw cuts the screen: the title splits along the slash, embers spray, it seals again
//   5. Fade into the menu
// Vanilla TS (no React, no dependencies) so the offline single-file build keeps working.
// Click, tap, any key or the Skip button ends it. Reduced motion skips it entirely.

const SVGNS = "http://www.w3.org/2000/svg";
const INK = "#070605";
const BONE = "#ede3c8";
const GOLD = "#f0c35a";
const CRIMSON = "#b3201c";
const SERIF = `"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", "Noto Serif CJK JP", "Noto Sans CJK JP", Georgia, serif`;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
/** CSS-style cubic-bezier easing (x→y), solved with Newton steps. */
function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sy = (t: number) => ((ay * t + by) * t + cy) * t;
  const dx = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 6; i++) { const e = sx(t) - x; const d = dx(t); if (Math.abs(e) < 1e-5 || !d) break; t -= e / d; }
    return sy(clamp01(t));
  };
}
const drawEase = cubicBezier(0.55, 0.06, 0.35, 1);
const fillEase = cubicBezier(0.3, 0, 0.2, 1);
const easeInOut = (t: number) => { const c = clamp01(t); return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2; };
const easeOut = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const el = <K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number> = {}, parent?: Element) => {
  const e = document.createElementNS(SVGNS, tag);
  for (const k in attrs) e.setAttribute(k, String(attrs[k]));
  parent?.appendChild(e);
  return e;
};

/* ══ 1. Ember smoke (WebGL1 shader) ═════════════════════════════════════════ */
const SMOKE_VERT = `attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}`;
// The Shader Builder's "Smoke" recipe, trimmed to what this look uses (palette fbm warp + grain + vignette).
const SMOKE_FRAG = `precision mediump float;
uniform vec3 u_c[4];uniform vec3 u_s;// res.xy, time
float h21(vec2 p){p=mod(p,31.);p=fract(p*vec2(234.34,435.345));p+=dot(p,p+34.23);return fract(p.x*p.y);}
float gh(vec2 p){vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}
float n(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);return mix(mix(h21(i),h21(i+vec2(1,0)),u.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p=p*2.03+vec2(17.,9.2);a*=.5;}return v;}
vec3 pal(float x){float f=clamp(x,0.,1.)*3.;vec3 c=u_c[0];
 c=mix(c,u_c[1],smoothstep(0.,1.,clamp(f,0.,1.)));c=mix(c,u_c[2],smoothstep(0.,1.,clamp(f-1.,0.,1.)));c=mix(c,u_c[3],smoothstep(0.,1.,clamp(f-2.,0.,1.)));return c;}
void main(){vec2 uv=gl_FragCoord.xy/u_s.xy;vec2 p=(gl_FragCoord.xy-.5*u_s.xy)/min(u_s.x,u_s.y)*1.5;float t=u_s.z;
 float w=2.+.55*4.;vec2 q=vec2(fbm(p+t*.08),fbm(p+vec2(5.2,1.3)-t*.06));vec2 r=vec2(fbm(p+w*q+vec2(1.7,9.2)),fbm(p+w*q+vec2(8.3,2.8)));
 vec3 col=pal(fbm(p+3.*r+1.));float vd=length(uv-.5)*1.414;col*=1.-.75*smoothstep(.3,1.,vd);
 col+=(gh(gl_FragCoord.xy+vec2(17.,31.))-.5)*.042;gl_FragColor=vec4(clamp(col,0.,1.),1.);}`;

function createSmoke(canvas: HTMLCanvasElement) {
  // preserveDrawingBuffer: the slash snapshots the smoke into the two halves of the screen.
  const gl = canvas.getContext("webgl", { antialias: false, premultipliedAlpha: false, preserveDrawingBuffer: true });
  if (!gl) return null;
  const sh = (type: number, src: string) => { const s = gl.createShader(type)!; gl.shaderSource(s, src); gl.compileShader(s); return s; };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, SMOKE_VERT));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, SMOKE_FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "a");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  // Ink black → oxblood → crimson → ember (the component's palette, pulled darker so type stays readable).
  gl.uniform3fv(gl.getUniformLocation(prog, "u_c"), new Float32Array([0.027, 0.024, 0.02, 0.17, 0.03, 0.03, 0.55, 0.09, 0.08, 0.86, 0.3, 0.2]));
  const uS = gl.getUniformLocation(prog, "u_s");
  return {
    render(t: number) {
      // Pixel budget: the warp is ~75 noise taps per pixel, so stay cheap on Chromebooks.
      const cw = canvas.clientWidth, ch = canvas.clientHeight;
      const k = Math.min(1, Math.sqrt(520_000 / Math.max(1, cw * ch)));
      const w = Math.max(1, Math.round(cw * k)), h = Math.max(1, Math.round(ch * k));
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); }
      gl.uniform3f(uS, w, h, t * 0.86);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    dispose() { gl.deleteBuffer(buf); gl.deleteProgram(prog); gl.getExtension("WEBGL_lose_context")?.loseContext(); },
  };
}

/* ══ 2. Ink blot → washi moon ═══════════════════════════════════════════════ */
function createInkMoon(host: HTMLElement) {
  const svg = el("svg", { viewBox: "0 0 1000 1000", class: "intro-moon", "aria-hidden": "true" });
  const defs = el("defs", {}, svg);
  const f = el("filter", { id: "iblot-f", x: "-25%", y: "-25%", width: "150%", height: "150%" }, defs);
  el("feTurbulence", { type: "fractalNoise", baseFrequency: "0.018", numOctaves: 3, seed: 7 }, f);
  el("feDisplacementMap", { in: "SourceGraphic", scale: 70, xChannelSelector: "R", yChannelSelector: "G" }, f);
  el("feGaussianBlur", { stdDeviation: 1.2 }, f);
  const paperF = el("filter", { id: "iblot-paper", x: "0", y: "0", width: "100%", height: "100%" }, defs);
  el("feTurbulence", { type: "fractalNoise", baseFrequency: "0.9", numOctaves: 2, seed: 3, result: "n" }, paperF);
  el("feColorMatrix", { in: "n", type: "matrix", values: "0 0 0 0 0.3  0 0 0 0 0.25  0 0 0 0 0.18  0 0 0 0.10 0", result: "fib" }, paperF);
  el("feComposite", { in: "fib", in2: "SourceGraphic", operator: "in", result: "fib2" }, paperF);
  const mg = el("feMerge", {}, paperF);
  el("feMergeNode", { in: "SourceGraphic" }, mg); el("feMergeNode", { in: "fib2" }, mg);
  const grad = el("radialGradient", { id: "iblot-g", cx: "50%", cy: "46%", r: "55%" }, defs);
  el("stop", { offset: "0%", "stop-color": "#f4ead3" }, grad);
  el("stop", { offset: "70%", "stop-color": "#e6d6b3" }, grad);
  el("stop", { offset: "100%", "stop-color": "#c9b38a" }, grad);
  const mask = el("mask", { id: "iblot-m", maskUnits: "userSpaceOnUse", x: 0, y: 0, width: 1000, height: 1000 }, defs);
  el("rect", { width: 1000, height: 1000, fill: "black" }, mask);
  const mgr = el("g", { filter: "url(#iblot-f)" }, mask);
  // Main blot + satellite drops (seeded so the splash is always the same).
  const r = mulberry32(1311);
  const parts: [number, number, number][] = [[0, 0, 1]];
  for (let i = 0; i < 8; i++) { const a = r() * Math.PI * 2, d = 330 + r() * 120; parts.push([Math.cos(a) * d, Math.sin(a) * d, 0.05 + r() * 0.09]); }
  const circles = parts.map(p => el("circle", { cx: 500 + p[0], cy: 500 + p[1], r: 0, fill: "white" }, mgr));
  const paper = el("g", { mask: "url(#iblot-m)" }, svg);
  el("rect", { width: 1000, height: 1000, fill: "url(#iblot-g)", filter: "url(#iblot-paper)" }, paper);
  // a faint crimson ensō rim brushed on once the paper has soaked in
  const ring = el("circle", { cx: 500, cy: 500, r: 372, fill: "none", stroke: CRIMSON, "stroke-width": 9, "stroke-linecap": "round", opacity: 0, "stroke-dasharray": "2340 2340", "stroke-dashoffset": 2340, transform: "rotate(-80 500 500)" }, svg);
  host.appendChild(svg);
  return {
    /** k: 0..1 bloom progress, ring: 0..1 ensō brush progress */
    update(k: number, ringK: number) {
      const e = easeInOut(k);
      parts.forEach((p, i) => circles[i].setAttribute("r", String(i ? 400 * p[2] * 0.5 * clamp01(e * 1.4 - 0.2) : 380 * e)));
      ring.setAttribute("opacity", String(ringK > 0 ? 0.85 : 0));
      ring.setAttribute("stroke-dashoffset", String(2340 * (1 - easeOut(ringK) * 0.93)));
    },
  };
}

/* ══ 3. Stroke-draw type with rising ink fill ═══════════════════════════════ */
interface DrawOpts { text: string; size: number; weight: number; spacing: number; stroke: string; fill: string; tip: string; strokeW: number; duration: number; stagger: number; delay: number; id: string; }
const FS = 100, DASH_MAX = 900, TIP = 7, DROPS = 3, SAMPLES = 9;
function createStrokeDraw(host: HTMLElement, o: DrawOpts) {
  const svg = el("svg", { class: `intro-type intro-type-${o.id}`, "aria-hidden": "true", viewBox: "0 -100 600 130" });
  svg.style.overflow = "visible";
  host.appendChild(svg);
  const textAttrs = { "font-size": FS, "font-family": SERIF, "font-weight": o.weight, "letter-spacing": `${o.spacing}em` };
  const measure = el("text", { x: 0, y: 0, visibility: "hidden", ...textAttrs }, svg);
  measure.textContent = o.text;
  let box: DOMRect;
  try { box = measure.getBBox(); } catch { box = new DOMRect(0, -88, 300, 100); }
  const letters: { ch: string; x: number; left: number; right: number; dash: number }[] = [];
  let idx = 0;
  for (const ch of Array.from(o.text)) {
    if (ch.trim()) {
      let x = idx * 60, left = x, w = 60;
      try { x = measure.getStartPositionOfChar(idx).x; const ext = measure.getExtentOfChar(idx); left = ext.x; w = ext.width; } catch { /* layout not ready */ }
      letters.push({ ch, x, left, right: left + w, dash: ch.charCodeAt(0) > 0x2e80 ? FS * 2.6 : Math.min(DASH_MAX, 2.4 * w + FS * 1.05) });   // CJK glyphs are many short contours: each one draws at once, like brush strokes
    }
    idx += ch.length;
  }
  measure.remove();
  const sw = (o.strokeW * FS) / o.size;
  const pad = sw * 2 + FS * 0.05;
  svg.setAttribute("viewBox", [box.x - pad, box.y - pad, box.width + pad * 2, box.height + pad * 2].map(v => v.toFixed(2)).join(" "));
  svg.style.width = `min(${((box.width + pad * 2) * o.size) / FS}px, 88vw)`;
  const top = box.y, bottom = box.y + box.height;
  const defs = el("defs", {}, svg);
  const goo = el("filter", { id: `goo-${o.id}`, x: "-10%", y: "-10%", width: "120%", height: "120%", "color-interpolation-filters": "sRGB" }, defs);
  el("feGaussianBlur", { in: "SourceGraphic", stdDeviation: FS * 0.032, result: "b" }, goo);
  el("feColorMatrix", { in: "b", type: "matrix", values: "1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9", result: "g" }, goo);
  el("feGaussianBlur", { in: "g", stdDeviation: FS * 0.008 }, goo);
  const mask = el("mask", { id: `mask-${o.id}`, maskUnits: "userSpaceOnUse", x: box.x - pad, y: box.y - pad - FS * 0.3, width: box.width + pad * 2, height: box.height + pad * 2 + FS * 0.6 }, defs);
  const mg = el("g", { filter: `url(#goo-${o.id})`, fill: "#fff" }, mask);
  const glow = el("filter", { id: `glow-${o.id}`, x: "-20%", y: "-20%", width: "140%", height: "140%", "color-interpolation-filters": "sRGB" }, defs);
  el("feGaussianBlur", { in: "SourceGraphic", stdDeviation: FS * 0.03, result: "h" }, glow);
  const gm = el("feMerge", {}, glow);
  el("feMergeNode", { in: "h" }, gm); el("feMergeNode", { in: "h" }, gm); el("feMergeNode", { in: "SourceGraphic" }, gm);

  const rand = mulberry32(o.text.length * 977 + 13);
  const surfaces = letters.map(() => el("path", {}, mg));
  const drops = letters.flatMap(l => Array.from({ length: DROPS }, (_, d) => {
    const w = l.right - l.left;
    return { x: l.left + w * (0.2 + 0.6 * ((d + 0.5) / DROPS)) + (rand() - 0.5) * w * 0.15, r: FS * (0.035 + rand() * 0.035), k: 55 + rand() * 110, off: FS * (0.02 + rand() * 0.04) };
  }));
  const dropEls = drops.map(d => el("circle", { cx: d.x, cy: bottom + FS, r: d.r }, mg));
  const fillG = el("g", { mask: `url(#mask-${o.id})`, fill: o.fill }, svg);
  const strokeG = el("g", { fill: "none", stroke: o.stroke, "stroke-width": sw, "stroke-linejoin": "round", "stroke-linecap": "round" }, svg);
  const tipG = el("g", { fill: "none", stroke: o.tip, "stroke-width": sw * 2.4, "stroke-linecap": "round", filter: `url(#glow-${o.id})` }, svg);
  const mk = (g: SVGGElement, hidden: boolean) => letters.map(l => { const t = el("text", { x: l.x, y: 0, ...textAttrs }, g); t.textContent = l.ch; if (hidden) t.style.opacity = "0"; return t; });
  mk(fillG, false);
  const strokes = mk(strokeG, true), tips = mk(tipG, true);
  const dropY = new Float64Array(drops.length).fill(1e4), dropV = new Float64Array(drops.length);
  const lo = top - FS * 0.12, hi = bottom + FS * 0.16;
  const fillStart = o.duration * 0.58, fillDur = o.duration * 0.85;
  const total = o.delay + Math.max(0, letters.length - 1) * o.stagger + fillStart + fillDur;
  let prevY = new Float64Array(letters.length).fill(hi);

  return {
    total,
    update(t: number, dt: number) {
      let allFull = true;
      for (let i = 0; i < letters.length; i++) {
        const s0 = o.delay + i * o.stagger;
        const p = drawEase(clamp01((t - s0) / o.duration));
        const lv = fillEase(clamp01((t - s0 - fillStart) / fillDur));
        if (lv < 1) allFull = false;
        const L = letters[i].dash, st = strokes[i].style;
        if (p >= 1) { st.strokeDasharray = "none"; st.strokeDashoffset = "0"; }
        else { st.strokeDasharray = `${L} ${L}`; st.strokeDashoffset = (L * (1 - p)).toFixed(2); }
        st.opacity = p <= 0 ? "0" : "1";
        const tp = tips[i].style;
        tp.strokeDasharray = `${TIP} ${DASH_MAX * 3}`;
        tp.strokeDashoffset = (-(p * L - TIP)).toFixed(2);
        tp.opacity = (p > 0 && p < 1 ? Math.min(1, p * 12, (1 - p) * 6) : 0).toFixed(3);
        // Liquid surface with a little slosh while it rises.
        const y = hi + (lo - hi) * lv;
        const vel = dt > 0 ? (y - prevY[i]) / dt : 0;
        prevY[i] = y;
        const amp = Math.min(FS * 0.035, Math.abs(vel) * 0.012) + (lv > 0 && lv < 1 ? FS * 0.008 : 0);
        const l = letters[i], x0 = l.left - FS * 0.08, x1 = l.right + FS * 0.08;
        let d = `M${x0.toFixed(1)} ${(hi + FS).toFixed(1)}`;
        for (let k = 0; k <= SAMPLES; k++) {
          const x = x0 + ((x1 - x0) * k) / SAMPLES;
          d += `L${x.toFixed(1)} ${(y + amp * Math.sin(x * 0.11 + t * 7 + i * 1.7) + amp * 0.5 * Math.sin(x * 0.27 - t * 4.3)).toFixed(1)}`;
        }
        surfaces[i].setAttribute("d", d + `L${x1.toFixed(1)} ${(hi + FS).toFixed(1)}Z`);
        for (let k = 0; k < DROPS; k++) {   // beads that cling, then let go (damped springs)
          const di = i * DROPS + k, drop = drops[di], target = y + drop.off + drop.r;
          if (dt <= 0 || dropY[di] > 9e3) { dropY[di] = target; dropV[di] = 0; }
          else for (let q = 0; q < 3; q++) { const h = dt / 3; const a = -drop.k * (dropY[di] - target) - 11 * dropV[di]; dropV[di] += a * h; dropY[di] += dropV[di] * h; }
          dropEls[di].setAttribute("cy", dropY[di].toFixed(2));
        }
      }
      const settled = allFull && dropV.every(v => Math.abs(v) < 0.5);
      if (settled) fillG.removeAttribute("mask"); else fillG.setAttribute("mask", `url(#mask-${o.id})`);
    },
  };
}

/* ══ 4. Iai slash + embers ══════════════════════════════════════════════════ */
interface Spark { x: number; y: number; vx: number; vy: number; life: number; max: number; hue: number; }

const CSS = `
#intro { position: fixed; inset: 0; z-index: 100; background: ${INK}; cursor: pointer; overflow: hidden; transition: opacity .6s ease; }
#intro.out { opacity: 0; pointer-events: none; }
#intro canvas { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
#intro .intro-smoke { opacity: 0; transition: opacity 1.1s ease; }
#intro .intro-smoke.on { opacity: .9; }
#intro .intro-stage { position: absolute; inset: 0; display: grid; place-items: center; }
#intro .intro-center { position: relative; width: min(56vmin, 420px); aspect-ratio: 1; display: grid; place-items: center; }
#intro .intro-moon { position: absolute; inset: -14%; width: 128%; height: 128%; filter: drop-shadow(0 0 40px rgba(179, 32, 28, .25)); }
#intro .intro-type { position: relative; display: block; height: auto; }
#intro .intro-type-k { margin-top: -2%; }
#intro .intro-sub { position: absolute; left: 0; right: 0; top: calc(50% + min(30vmin, 228px)); display: grid; justify-items: center; gap: 10px; }
#intro .intro-tag { font: 14px/1.4 ${SERIF}; color: #a89c84; letter-spacing: .14em; opacity: 0; transform: translateY(6px); transition: opacity .8s ease, transform .8s ease; text-align: center; padding: 0 16px; }
#intro .intro-tag.show { opacity: 1; transform: none; }
#intro .intro-scene { position: absolute; inset: 0; will-change: transform; }
#intro .intro-split { position: absolute; inset: 0; pointer-events: none; will-change: transform; }
#intro.opening { background: transparent; }
#intro .intro-slash { position: absolute; left: -10vw; top: 50%; width: 120vw; height: 3px; transform-origin: 0 50%; pointer-events: none; opacity: 0;
  background: linear-gradient(90deg, rgba(255,255,255,0), #fff 18%, #fff6dc 70%, ${GOLD}); box-shadow: 0 0 18px 4px rgba(255, 236, 190, .75), 0 0 60px 10px rgba(240, 120, 70, .35); }
#intro .intro-flash { position: absolute; inset: 0; background: #fff; opacity: 0; pointer-events: none; }
#intro .intro-skip { position: absolute; right: 16px; bottom: 16px; min-height: 44px; min-width: 44px; padding: 0 16px; border-radius: 22px;
  border: 1px solid rgba(237, 227, 200, .28); background: rgba(7, 6, 5, .45); color: #cfc3a6; font: 13px system-ui, sans-serif; letter-spacing: .08em; cursor: pointer;
  backdrop-filter: blur(4px); transition: border-color .2s, color .2s; }
#intro .intro-skip:hover, #intro .intro-skip:focus-visible { border-color: ${GOLD}; color: #fff; outline: none; }
`;

/**
 * Plays the intro over the page and resolves when it's gone (finished or
 * skipped). Resolves immediately when the player prefers reduced motion.
 */
export function playIntro(): Promise<void> {
  return new Promise(resolve => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) { resolve(); return; }

    const style = document.createElement("style");
    style.textContent = CSS;
    document.head.append(style);
    const root = document.createElement("div");
    root.id = "intro";
    root.setAttribute("role", "img");
    root.setAttribute("aria-label", "Yūken");
    const smokeCv = document.createElement("canvas");
    smokeCv.className = "intro-smoke";
    smokeCv.setAttribute("aria-hidden", "true");
    const stage = document.createElement("div");
    stage.className = "intro-stage";
    const center = document.createElement("div");
    center.className = "intro-center";
    const sub = document.createElement("div");
    sub.className = "intro-sub";
    const tag = document.createElement("div");
    tag.className = "intro-tag";
    tag.textContent = "Survive the waves. Forge your legend.";
    const slash = document.createElement("div");
    slash.className = "intro-slash";
    const flash = document.createElement("div");
    flash.className = "intro-flash";
    const sparkCv = document.createElement("canvas");
    sparkCv.setAttribute("aria-hidden", "true");
    const inkCv = document.createElement("canvas");   // the ink drop, flood and bloom
    inkCv.setAttribute("aria-hidden", "true");
    const skip = document.createElement("button");
    skip.className = "intro-skip";
    skip.type = "button";
    skip.textContent = "Skip ›";
    stage.append(center, sub);
    const scene = document.createElement("div");
    scene.className = "intro-scene";
    scene.append(smokeCv, stage);
    root.append(scene, inkCv, slash, flash, sparkCv, skip);
    document.body.append(root);

    let smoke: ReturnType<typeof createSmoke> = null;
    try { smoke = createSmoke(smokeCv); } catch (err) { console.warn("[intro]", err); }
    if (!smoke) smokeCv.style.background = `radial-gradient(circle at 50% 45%, #3a0b0a, ${INK} 70%)`;

    let raf = 0;
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKey, true);
      root.classList.add("out");
      resolve();
      setTimeout(() => { smoke?.dispose(); root.remove(); style.remove(); }, 650);
    };
    // Any key, click or the Skip button ends it — swallowed so it doesn't also act on the menu.
    const onKey = (e: KeyboardEvent) => { e.preventDefault(); e.stopImmediatePropagation(); finish(); };
    window.addEventListener("keydown", onKey, true);
    root.addEventListener("pointerdown", e => { e.preventDefault(); finish(); });

    // Build the type after the overlay paints (fonts measured in the real layout).
    requestAnimationFrame(() => setTimeout(() => {
      if (done) return;
      let moon: ReturnType<typeof createInkMoon>, kanji: ReturnType<typeof createStrokeDraw>, latin: ReturnType<typeof createStrokeDraw>;
      try {
        moon = createInkMoon(center);
        kanji = createStrokeDraw(center, { id: "k", text: "幽剣", size: 190, weight: 700, spacing: 0.02, stroke: "#1a1210", fill: CRIMSON, tip: GOLD, strokeW: 2.2, duration: 1.5, stagger: 0.3, delay: 0 });
        latin = createStrokeDraw(sub, { id: "l", text: "YŪKEN", size: 64, weight: 600, spacing: 0.3, stroke: BONE, fill: BONE, tip: GOLD, strokeW: 1.4, duration: 1.0, stagger: 0.07, delay: 0 });
        sub.append(tag);
      } catch (err) { console.warn("[intro]", err); finish(); return; }

      // Timeline (seconds)
      const T_INK = 0.45, T_KANJI = 1.25, T_LATIN = 2.55, T_SLASH = 4.35, T_END = T_SLASH + 2.05;
      const sparks: Spark[] = [];
      const sctx = sparkCv.getContext("2d");
      const ictx = inkCv.getContext("2d");
      let impX = 0, impY = 0, cutY = 0;
      const splat: { x: number; y: number; vx: number; vy: number; r: number; life: number }[] = [];
      let slashAng = 0, slashed = false;
      let time = 0;
      let last = performance.now();

      const doSlash = () => {
        slashed = true;
        const W = root.clientWidth, H = root.clientHeight;
        slashAng = -0.2;
        // Where the ink will fall: it beads on the cut at screen centre and drops.
        const cy = H / 2 - 0.02 * H;
        cutY = cy; impX = W / 2; impY = cy + Math.min(0.24 * H, 210);
        slash.style.top = `${cy + Math.tan(slashAng) * (-0.1 * W - W / 2)}px`;   // the blade line passes through the cut at screen centre
        slash.style.transform = `rotate(${slashAng}rad) scaleX(0)`;
        // Embers along the cut.
        for (let i = 0; i < 90; i++) {
          const u = Math.random(), x = W * (0.1 + u * 0.8), y = cy + Math.tan(slashAng) * (x - W / 2);
          const a = slashAng + (Math.random() < 0.5 ? -1 : 1) * (Math.PI / 2) * (0.4 + Math.random() * 0.6) + (Math.random() - 0.5) * 0.6;
          const sp = 80 + Math.random() * 380;
          sparks.push({ x, y, vx: Math.cos(a) * sp + 120, vy: Math.sin(a) * sp, life: 0, max: 0.6 + Math.random() * 0.9, hue: 18 + Math.random() * 30 });
        }
      };

      // ── Ink drop → splash → flood (diving in) → bloom open into the menu ──
      const blot = (g: CanvasRenderingContext2D, x: number, y: number, R: number, t: number, outline = false) => {
        g.beginPath();
        for (let i = 0; i <= 72; i++) {
          const a = (i / 72) * Math.PI * 2;
          const w = 1 + 0.06 * Math.sin(5 * a + t * 3) + 0.04 * Math.sin(11 * a - t * 5) + 0.03 * Math.sin(17 * a + 1.3) + 0.02 * Math.sin(29 * a + t);
          const px = x + Math.cos(a) * R * w, py = y + Math.sin(a) * R * w;
          if (i) g.lineTo(px, py); else g.moveTo(px, py);
        }
        g.closePath();
        if (!outline) g.fill();
      };
      const inkStep = (s: number) => {
        if (!ictx) return;
        const W = root.clientWidth, H = root.clientHeight, dpr = Math.min(window.devicePixelRatio || 1, 2);
        if (inkCv.width !== Math.round(W * dpr)) { inkCv.width = Math.round(W * dpr); inkCv.height = Math.round(H * dpr); }
        ictx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ictx.clearRect(0, 0, W, H);
        const INKC = "#0a0706", diag = Math.hypot(W, H);
        const T_BEAD = 0.28, T_DROP = 0.52, G = 2600;
        const fallT = Math.sqrt((2 * (impY - cutY)) / G), T_HIT = T_DROP + fallT;
        const T_FULL = T_HIT + 0.5, T_OPEN = T_FULL + 0.08;
        ictx.fillStyle = INKC;
        // 1. a bead swells on the cut, stretches, and lets go
        if (s >= T_BEAD && s < T_HIT) {
          const swell = clamp01((s - T_BEAD) / (T_DROP - T_BEAD));
          let y = cutY + 4, stretch = 1 + swell * 0.6, r = 4 + swell * 10;
          if (s >= T_DROP) { const f = s - T_DROP; y = cutY + 4 + 0.5 * G * f * f; stretch = 1.7; r = 14; }
          ictx.save(); ictx.translate(impX, y);
          ictx.beginPath();
          ictx.moveTo(0, -r * 1.6 * stretch);
          ictx.bezierCurveTo(r * 0.9, -r * 0.4, r, r * 0.9, 0, r);
          ictx.bezierCurveTo(-r, r * 0.9, -r * 0.9, -r * 0.4, 0, -r * 1.6 * stretch);
          ictx.fill();
          ictx.fillStyle = "rgba(255,255,255,.35)";   // a glint on the drop
          ictx.beginPath(); ictx.arc(-r * 0.35, -r * 0.1, r * 0.22, 0, Math.PI * 2); ictx.fill();
          ictx.restore();
        }
        // 2. impact: rings + splatter
        if (s >= T_HIT && !root.dataset.hit) {
          root.dataset.hit = "1";
          for (let i = 0; i < 26; i++) {
            const a = Math.random() * Math.PI * 2, sp = 120 + Math.random() * 420;
            splat.push({ x: impX, y: impY, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * 0.6 - 120, r: 2 + Math.random() * 5, life: 0 });
          }
        }
        if (s >= T_HIT) {
          const f = s - T_HIT;
          for (let k = 0; k < 2; k++) {
            const rr = (f - k * 0.08) * 380;
            if (rr <= 0) continue;
            ictx.strokeStyle = `rgba(10,7,6,${Math.max(0, 0.55 - f)})`; ictx.lineWidth = 2.5;
            ictx.beginPath(); ictx.ellipse(impX, impY, rr, rr * 0.35, 0, 0, Math.PI * 2); ictx.stroke();
          }
          ictx.fillStyle = INKC;
          for (const p of splat) {
            p.life += 1 / 60; p.vy += 900 / 60; p.x += p.vx / 60; p.y += p.vy / 60;
            ictx.beginPath(); ictx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ictx.fill();
          }
        }
        // 3. the ink floods outward while we dive into it
        if (s >= T_HIT && s < T_OPEN) {
          const k = clamp01((s - T_HIT) / (T_FULL - T_HIT));
          const R = Math.pow(k, 2.2) * diag * 1.15 + 6;
          ictx.fillStyle = INKC;
          blot(ictx, impX, impY, R, s);
          ictx.strokeStyle = `rgba(179, 32, 28, ${0.55 * (1 - k)})`; ictx.lineWidth = 10;   // crimson bleeding at the edge
          blot(ictx, impX, impY, R, s, true); ictx.stroke();
          const z = 1 + Math.pow(k, 2) * 0.9;
          scene.style.transformOrigin = `${impX}px ${impY}px`;
          scene.style.transform = `scale(${z.toFixed(3)})`;
          scene.style.filter = `blur(${(k * 3).toFixed(1)}px)`;
        }
        // 4. the ink blooms open from the same spot, and the menu is underneath
        if (s >= T_OPEN) {
          if (!root.classList.contains("opening")) {
            root.classList.add("opening");
            scene.style.visibility = "hidden";
            document.body.classList.add("intro-reveal");
            setTimeout(() => document.body.classList.remove("intro-reveal"), 1600);
          }
          const k = clamp01((s - T_OPEN) / (T_END - T_SLASH - T_OPEN - 0.05));
          const R = Math.pow(k, 1.6) * diag * 1.2;
          ictx.fillStyle = INKC;
          ictx.beginPath(); ictx.rect(0, 0, W, H);
          for (let i = 0; i <= 72; i++) {   // ragged hole (even-odd) so the menu shows through
            const a = (i / 72) * Math.PI * 2;
            const w = 1 + 0.08 * Math.sin(6 * a + s * 4) + 0.05 * Math.sin(13 * a - s * 6) + 0.03 * Math.sin(23 * a + 2.1);
            const px = impX + Math.cos(a) * R * w, py = impY + Math.sin(a) * R * w;
            if (i) ictx.lineTo(px, py); else ictx.moveTo(px, py);
          }
          ictx.closePath();
          ictx.fill("evenodd");
          ictx.strokeStyle = `rgba(200, 50, 36, ${0.8 * (1 - k)})`; ictx.lineWidth = 8;   // wet crimson rim
          blot(ictx, impX, impY, R, s, true); ictx.stroke();
        }
      };

      const tick = (now: number) => {
        if (done) return;
        const dt = Math.min(0.05, (now - last) / 1000);
        time += dt;
        last = now;
        smoke?.render(time);
        if (time > 0.05) smokeCv.classList.add("on");
        moon.update(clamp01((time - T_INK) / 1.5), clamp01((time - T_INK - 1.2) / 1.1));
        kanji.update(time - T_KANJI, dt);
        latin.update(time - T_LATIN, dt);
        if (time > T_LATIN + 1.1) tag.classList.add("show");
        if (!slashed && time >= T_SLASH) doSlash();
        if (slashed) {
          const s = time - T_SLASH;
          // The blade crosses in 0.12 s, then its trace fades.
          slash.style.opacity = String(s < 0.12 ? 1 : Math.max(0, 1 - (s - 0.12) / 0.45));
          slash.style.transform = `rotate(${slashAng}rad) scaleX(${easeOut(s / 0.12)})`;
          flash.style.opacity = String(s < 0.12 ? 0 : Math.max(0, 0.45 - (s - 0.12) * 1.6));
          inkStep(s);
        }
        // Embers
        if (sctx) {
          const dpr = Math.min(window.devicePixelRatio || 1, 2), W = root.clientWidth, H = root.clientHeight;
          if (sparkCv.width !== Math.round(W * dpr)) { sparkCv.width = Math.round(W * dpr); sparkCv.height = Math.round(H * dpr); }
          sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          sctx.clearRect(0, 0, W, H);
          sctx.globalCompositeOperation = "lighter";
          for (const p of sparks) {
            p.life += dt; p.vy += 260 * dt; p.vx *= 0.985; p.x += p.vx * dt; p.y += p.vy * dt;
            const a = 1 - p.life / p.max;
            if (a <= 0) continue;
            sctx.strokeStyle = `hsla(${p.hue}, 100%, ${60 + a * 25}%, ${a})`;
            sctx.lineWidth = 1.6;
            sctx.beginPath(); sctx.moveTo(p.x, p.y); sctx.lineTo(p.x - p.vx * 0.03, p.y - p.vy * 0.03); sctx.stroke();
          }
          for (let i = sparks.length - 1; i >= 0; i--) if (sparks[i].life >= sparks[i].max) sparks.splice(i, 1);
          sctx.globalCompositeOperation = "source-over";
        }
        if (time >= T_END) { finish(); return; }
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, 30));
  });
}
