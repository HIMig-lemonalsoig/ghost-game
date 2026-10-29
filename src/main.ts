import { GhostGame, CLASSES, CLASS_WEAPON_OPTIONS } from "./GhostGame";
import type { ClassId } from "./GhostGame";

const canvas = document.getElementById("game-canvas") as HTMLCanvasElement;
let game: GhostGame | null = null;
let animId: number | null = null;
let lastTime = 0;

function resize() {
  const dpr = window.devicePixelRatio || 1;
  const w = window.innerWidth;
  const h = window.innerHeight;
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  game?.resize(canvas.width, canvas.height, dpr);
}

function loop(ts: number) {
  if (!game) return;
  const dt = Math.min((ts - lastTime) / 1000, 0.05);
  lastTime = ts;
  game.update(dt);
  game.render();
  animId = requestAnimationFrame(loop);
}

function startGame(classId: ClassId) {
  const [primary] = CLASS_WEAPON_OPTIONS[classId];
  resize();
  game = new GhostGame(canvas);
  resize();
  game.start(classId, primary);
  lastTime = performance.now();
  animId = requestAnimationFrame(loop);
}

window.addEventListener("resize", resize);

// ── Class-select screen drawn on the canvas before the game starts ───────────
(function showClassSelect() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(window.innerWidth * dpr);
  canvas.height = Math.round(window.innerHeight * dpr);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;

  const ctx = canvas.getContext("2d")!;
  const W = canvas.width;
  const H = canvas.height;

  const COLS = 4;
  const CARD_W = Math.min(180 * dpr, (W - 60 * dpr) / COLS);
  const CARD_H = CARD_W * 1.3;
  const PAD = 12 * dpr;
  const ROWS = Math.ceil(CLASSES.length / COLS);
  const totalW = COLS * (CARD_W + PAD) - PAD;
  const totalH = ROWS * (CARD_H + PAD) - PAD;
  const startX = (W - totalW) / 2;
  const startY = H * 0.15;

  const cards: { cls: typeof CLASSES[0]; x: number; y: number; w: number; h: number }[] = [];
  CLASSES.forEach((cls, i) => {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    cards.push({
      cls,
      x: startX + col * (CARD_W + PAD),
      y: startY + row * (CARD_H + PAD),
      w: CARD_W,
      h: CARD_H,
    });
  });

  let hovered = -1;

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = "#c8a96e";
    ctx.font = `bold ${36 * dpr}px serif`;
    ctx.textAlign = "center";
    ctx.fillText("選択 — Choose Your Class", W / 2, startY - 28 * dpr);
    ctx.font = `${14 * dpr}px sans-serif`;
    ctx.fillStyle = "#666";
    ctx.fillText("Click a class to begin", W / 2, startY - 10 * dpr);

    cards.forEach(({ cls, x, y, w, h }, i) => {
      const hot = i === hovered;
      ctx.save();
      ctx.strokeStyle = hot ? cls.accent : "#333";
      ctx.lineWidth = hot ? 2 * dpr : 1 * dpr;
      ctx.fillStyle = hot ? "#1a1a1a" : "#111";
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 6 * dpr);
      ctx.fill();
      ctx.stroke();

      // Kanji
      ctx.font = `bold ${28 * dpr}px serif`;
      ctx.fillStyle = cls.accent;
      ctx.textAlign = "center";
      ctx.fillText(cls.kanji, x + w / 2, y + 36 * dpr);

      // Name
      ctx.font = `bold ${11 * dpr}px sans-serif`;
      ctx.fillStyle = hot ? "#fff" : "#ccc";
      ctx.fillText(cls.name, x + w / 2, y + 56 * dpr);

      // Role
      ctx.font = `${9 * dpr}px sans-serif`;
      ctx.fillStyle = "#888";
      ctx.fillText(cls.role, x + w / 2, y + 70 * dpr);

      // Bonuses
      ctx.font = `${8 * dpr}px sans-serif`;
      ctx.fillStyle = "#aaa";
      ctx.textAlign = "left";
      cls.bonuses.slice(0, 3).forEach((b, bi) => {
        const short = b.length > 28 ? b.slice(0, 26) + "…" : b;
        ctx.fillText(`• ${short}`, x + 8 * dpr, y + 88 * dpr + bi * 14 * dpr);
      });

      ctx.restore();
    });
  }

  draw();

  canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * dpr;
    const my = (e.clientY - rect.top) * dpr;
    const prev = hovered;
    hovered = cards.findIndex(c => mx >= c.x && mx <= c.x + c.w && my >= c.y && my <= c.y + c.h);
    if (hovered !== prev) draw();
  });

  canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * dpr;
    const my = (e.clientY - rect.top) * dpr;
    const hit = cards.findIndex(c => mx >= c.x && mx <= c.x + c.w && my >= c.y && my <= c.y + c.h);
    if (hit !== -1) startGame(cards[hit].cls.id);
  });
})();
