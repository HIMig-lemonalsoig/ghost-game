// ─── Menu backdrop: an ukiyo-e dusk ──────────────────────────────────────────
// Lives behind the main menu / class select (fixed, under #menu):
//  1. Sky   — port of "Mesh Gradient" (Paper Shaders via the 21st.dev Shader
//             Builder, Apache-2.0): drifting colour blobs, here pulled toward a
//             vertical dusk ramp so it's indigo above and warm at the horizon.
//  2. Sun   — a big vermilion disc low in the sky.
//  3. Ridges— four ink-wash mountain layers with mist between (ridge painter
//             after the "Ink Blot Reveal" landscape), each drifting with the
//             pointer at its own depth — the "Layer Parallax Hero" idea.
//  4. Petals— sakura drifting across, a few catching the light.
// Pauses itself whenever the menu is hidden. Reduced motion: a still frame.

const SKY_VERT = `attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}`;
const SKY_FRAG = `precision mediump float;
uniform vec3 u_c[4];uniform vec3 u_s;
float gh(vec2 p){vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}
vec3 ramp(float y){ // indigo zenith -> blue -> vermilion -> peach horizon
  vec3 a=vec3(.055,.067,.17),b=vec3(.12,.25,.45),c=vec3(.78,.29,.2),d=vec3(.96,.66,.4);
  return y>.74?mix(b,a,smoothstep(.74,1.,y)):y>.46?mix(c,b,smoothstep(.46,.74,y)):mix(d,c,smoothstep(.24,.46,y));}
void main(){vec2 uv=gl_FragCoord.xy/u_s.xy;vec2 p=(gl_FragCoord.xy-.5*u_s.xy)/min(u_s.x,u_s.y)*1.26;float t=u_s.z;
 vec3 col=u_c[0]*.16;float w=.16;
 for(int i=0;i<4;i++){float fi=float(i);vec2 ce=vec2(sin(fi*2.17+t*.13+1.),cos(fi*1.63-t*.11))*(.22+.35*.62);
  float inf=exp(-dot(p-ce,p-ce)*mix(12.,2.4,.28));col+=u_c[i]*inf;w+=inf;}
 col/=w;col=mix(ramp(uv.y),col,.38);
 col+=(gh(gl_FragCoord.xy)-.5)*.035;gl_FragColor=vec4(clamp(col,0.,1.),1.);}`;

function createSky(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext("webgl", { antialias: false });
  if (!gl) return null;
  const sh = (t: number, s: string) => { const o = gl.createShader(t)!; gl.shaderSource(o, s); gl.compileShader(o); return o; };
  const pr = gl.createProgram()!;
  gl.attachShader(pr, sh(gl.VERTEX_SHADER, SKY_VERT)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, SKY_FRAG)); gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return null;
  gl.useProgram(pr);
  const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const l = gl.getAttribLocation(pr, "a"); gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, 2, gl.FLOAT, false, 0, 0);
  // Blobs: night indigo, Hiroshige blue, vermilion, plum.
  gl.uniform3fv(gl.getUniformLocation(pr, "u_c"), new Float32Array([0.07, 0.08, 0.2, 0.13, 0.3, 0.52, 0.85, 0.33, 0.22, 0.42, 0.2, 0.38]));
  const uS = gl.getUniformLocation(pr, "u_s");
  return (t: number) => {
    const cw = canvas.clientWidth, ch = canvas.clientHeight;
    const k = Math.min(0.6, Math.sqrt(380_000 / Math.max(1, cw * ch)));   // soft gradients: render small
    const w = Math.max(1, Math.round(cw * k)), h = Math.max(1, Math.round(ch * k));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); }
    gl.uniform3f(uS, w, h, t * 0.575);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

/** One mountain ridge layer painted to its own canvas (wider than the screen so it can drift). */
function paintRidge(cv: HTMLCanvasElement, seed: number, k: number, colTop: string, colBot: string, mist: string, pines: boolean) {
  const w = cv.width = 1800, h = cv.height = 520;
  const g = cv.getContext("2d")!;
  const r = mulberry32(seed);
  const base = h * (0.38 + k * 0.22), amp = h * (0.16 + k * 0.08);
  const ph = [r(), r(), r(), r()].map(v => v * Math.PI * 2);
  const fr = [1.6 + r(), 3.4 + r() * 2, 8 + r() * 4, 19 + r() * 8];
  const ridge = (x: number) => { const u = x / w; return base - amp * (0.55 * Math.sin(u * fr[0] + ph[0]) + 0.28 * Math.sin(u * fr[1] + ph[1]) + 0.12 * Math.abs(Math.sin(u * fr[2] + ph[2])) + 0.05 * Math.sin(u * fr[3] + ph[3])); };
  const m = g.createLinearGradient(0, base - amp * 1.5, 0, base + amp * 0.3);
  m.addColorStop(0, "rgba(0,0,0,0)"); m.addColorStop(1, mist);
  g.fillStyle = m; g.fillRect(0, base - amp * 1.5, w, amp * 1.8);
  const body = g.createLinearGradient(0, base - amp, 0, h);
  body.addColorStop(0, colTop); body.addColorStop(1, colBot);
  g.fillStyle = body;
  g.beginPath(); g.moveTo(0, h);
  for (let x = 0; x <= w; x += 6) g.lineTo(x, ridge(x));
  g.lineTo(w, h); g.closePath(); g.fill();
  // ink-wash rim light along the crest
  g.strokeStyle = "rgba(255, 190, 150, .08)"; g.lineWidth = 2;
  g.beginPath(); for (let x = 0; x <= w; x += 6) x ? g.lineTo(x, ridge(x) + 1) : g.moveTo(x, ridge(x) + 1); g.stroke();
  if (pines) {
    g.fillStyle = colTop;
    for (let x = 0; x < w; x += 6 + r() * 10) {
      if (r() < 0.4) continue;
      const y = ridge(x) + 2, th = h * (0.03 + r() * 0.04), tw = th * 0.3;
      g.beginPath(); g.moveTo(x, y - th); g.lineTo(x + tw, y); g.lineTo(x - tw, y); g.closePath(); g.fill();
    }
  }
}

interface Petal { x: number; y: number; vx: number; vy: number; rot: number; vr: number; s: number; flip: number; hue: number; }

let started = false;
export function initMenuBackdrop() {
  if (started) return;
  started = true;
  const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  const root = document.createElement("div");
  root.id = "menu-bg";
  root.setAttribute("aria-hidden", "true");
  root.innerHTML = `<canvas class="mbg-sky"></canvas><div class="mbg-sun"></div>
    <div class="mbg-layer" data-d="1"><canvas></canvas></div><div class="mbg-layer" data-d="2"><canvas></canvas></div>
    <div class="mbg-layer" data-d="3"><canvas></canvas></div><div class="mbg-layer" data-d="4"><canvas></canvas></div>
    <canvas class="mbg-petals"></canvas><div class="mbg-grain"></div>`;
  document.body.prepend(root);
  const sky = root.querySelector<HTMLCanvasElement>(".mbg-sky")!;
  let drawSky: ((t: number) => void) | null = null;
  try { drawSky = createSky(sky); } catch { /* no WebGL: CSS gradient fallback */ }
  if (!drawSky) sky.style.background = "linear-gradient(180deg, #0e1130, #1f406f 45%, #c9502f 75%, #f2a65a)";
  // Ridges: far (pale blue, misty) → near (deep indigo ink).
  const layers = Array.from(root.querySelectorAll<HTMLElement>(".mbg-layer"));
  const spec: [number, string, string, string, boolean][] = [
    [11, "rgba(122,140,190,.55)", "rgba(80,96,150,.7)", "rgba(250,190,160,.35)", false],
    [23, "rgba(70,84,140,.85)", "rgba(44,54,100,.95)", "rgba(230,160,150,.28)", false],
    [37, "#2a3466", "#1a2149", "rgba(190,130,150,.22)", true],
    [53, "#141936", "#0b0e22", "rgba(120,90,130,.2)", true],
  ];
  layers.forEach((l, i) => paintRidge(l.querySelector("canvas")!, spec[i][0], i / 3, spec[i][1], spec[i][2], spec[i][3], spec[i][4]));
  // Petals
  const pc = root.querySelector<HTMLCanvasElement>(".mbg-petals")!;
  const pctx = pc.getContext("2d")!;
  const rnd = Math.random;
  const petals: Petal[] = Array.from({ length: 46 }, () => ({ x: rnd() * innerWidth, y: rnd() * innerHeight, vx: 18 + rnd() * 30, vy: 14 + rnd() * 22, rot: rnd() * 6, vr: (rnd() - 0.5) * 2.4, s: 4 + rnd() * 5, flip: rnd() * 6, hue: 340 + rnd() * 18 }));
  // Pointer parallax
  let mx = 0, my = 0, tx = 0, ty = 0;
  window.addEventListener("pointermove", e => { tx = e.clientX / innerWidth - 0.5; ty = e.clientY / innerHeight - 0.5; }, { passive: true });

  let last = performance.now(), t = 0;
  const frame = (now: number) => {
    requestAnimationFrame(frame);
    if (!document.body.classList.contains("in-menu")) { last = now; return; }
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (!reduced) t += dt;
    drawSky?.(t);
    mx += (tx - mx) * Math.min(1, dt * 4); my += (ty - my) * Math.min(1, dt * 4);
    layers.forEach((l, i) => {
      const d = (i + 1) * 9;   // nearer layers move more
      l.style.transform = `translate3d(${(-mx * d * 2).toFixed(1)}px, ${(-my * d * 0.5).toFixed(1)}px, 0)`;
    });
    (root.querySelector(".mbg-sun") as HTMLElement).style.transform = `translate3d(${(-mx * 6).toFixed(1)}px, ${(-my * 4).toFixed(1)}px, 0)`;
    // petals
    const W = innerWidth, H = innerHeight, dpr = Math.min(2, devicePixelRatio || 1);
    if (pc.width !== Math.round(W * dpr)) { pc.width = Math.round(W * dpr); pc.height = Math.round(H * dpr); }
    pctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    pctx.clearRect(0, 0, W, H);
    for (const p of petals) {
      if (!reduced) {
        p.x += (p.vx + Math.sin(t * 0.8 + p.flip) * 14) * dt; p.y += p.vy * dt; p.rot += p.vr * dt; p.flip += dt * 2.2;
        if (p.x > W + 20) p.x = -20; if (p.y > H + 20) { p.y = -20; p.x = rnd() * W; }
      }
      pctx.save();
      pctx.translate(p.x, p.y); pctx.rotate(p.rot); pctx.scale(1, Math.abs(Math.sin(p.flip)) * 0.7 + 0.3);
      pctx.fillStyle = `hsla(${p.hue}, 75%, ${78 + Math.sin(p.flip) * 8}%, .8)`;
      pctx.beginPath();
      pctx.moveTo(0, -p.s); pctx.quadraticCurveTo(p.s * 0.9, -p.s * 0.2, 0, p.s); pctx.quadraticCurveTo(-p.s * 0.9, -p.s * 0.2, 0, -p.s);
      pctx.fill();
      pctx.restore();
    }
  };
  requestAnimationFrame(frame);
}
