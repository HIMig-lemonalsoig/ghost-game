import { GhostGame, CLASSES, CLASS_WEAPON_OPTIONS } from "./GhostGame";
import type { ClassId, GameStats } from "./GhostGame";

// ─── Canvas + Game Instance ───────────────────────────────────────────────────
const canvas = document.getElementById("game-canvas") as HTMLCanvasElement;
let game: GhostGame | null = null;
let animId: number | null = null;
let lastTime = 0;
let dpr = window.devicePixelRatio || 1;
let currentStats: GameStats | null = null;

function resize() {
  dpr = window.devicePixelRatio || 1;
  const w = window.innerWidth;
  const h = window.innerHeight;
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  game?.resize(canvas.width, canvas.height, dpr);
}
window.addEventListener("resize", resize);

// ─── Overlay DOM ─────────────────────────────────────────────────────────────
const overlay = document.createElement("div");
overlay.id = "overlay";
Object.assign(overlay.style, {
  position: "fixed", inset: "0", display: "none",
  alignItems: "center", justifyContent: "center",
  background: "rgba(0,0,0,0.82)", zIndex: "10",
  fontFamily: "serif", color: "#e8d9b0",
});
document.body.appendChild(overlay);

function showOverlay(html: string) {
  overlay.innerHTML = html;
  overlay.style.display = "flex";
}
function hideOverlay() {
  overlay.style.display = "none";
  overlay.innerHTML = "";
}

function rarityColor(r: string) {
  if (r === "legendary") return "#f4c842";
  if (r === "rare") return "#a78bfa";
  return "#aaa";
}

function renderOverlay(stats: GameStats) {
  if (!game) return;

  if (stats.state === "levelup" && stats.pendingChoices.length > 0) {
    const cards = stats.pendingChoices.map(c => `
      <div onclick="window._pickPerk('${c.id}')" style="
        cursor:pointer; border:1px solid ${rarityColor(c.rarity)};
        border-radius:8px; padding:16px; width:200px; background:#111;
        margin:0 8px; text-align:center; transition:background .15s;
      " onmouseenter="this.style.background='#1e1e1e'" onmouseleave="this.style.background='#111'">
        <div style="font-size:32px;color:${rarityColor(c.rarity)}">${c.kanji}</div>
        <div style="font-size:14px;font-weight:bold;margin:6px 0">${c.name}</div>
        <div style="font-size:10px;color:${rarityColor(c.rarity)};margin-bottom:6px;text-transform:uppercase">${c.rarity}</div>
        <div style="font-size:11px;color:#bbb;line-height:1.4">${c.desc}</div>
      </div>
    `).join("");
    showOverlay(`
      <div style="text-align:center">
        <div style="font-size:20px;letter-spacing:2px;margin-bottom:20px;color:#c8a96e">⚔ LEVEL UP ⚔</div>
        <div style="display:flex;justify-content:center">${cards}</div>
      </div>
    `);
    (window as any)._pickPerk = (id: string) => { hideOverlay(); game?.selectPerk(id); };
    return;
  }

  if (stats.state === "swap" && stats.pendingAbilityId) {
    const pending = stats.pendingAbilityId;
    const slots = stats.equippedAbilities.map((id, i) => `
      <div onclick="window._swapAbility('${id}')" style="
        cursor:pointer; border:1px solid #a78bfa; border-radius:8px;
        padding:16px; width:180px; background:#111; margin:0 8px;
        text-align:center;
      " onmouseenter="this.style.background='#1e1e1e'" onmouseleave="this.style.background='#111'">
        <div style="font-size:11px;color:#888;margin-bottom:4px">Replace slot ${i + 1}</div>
        <div style="font-size:24px;color:#a78bfa">⚔</div>
        <div style="font-size:14px;font-weight:bold;margin:4px 0">${id}</div>
      </div>
    `).join("");
    showOverlay(`
      <div style="text-align:center">
        <div style="font-size:18px;margin-bottom:8px;color:#c8a96e">New ability: <b>${pending}</b></div>
        <div style="font-size:13px;color:#888;margin-bottom:20px">Choose an ability to replace</div>
        <div style="display:flex;justify-content:center">${slots}</div>
        <button onclick="window._cancelSwap()" style="
          margin-top:20px; padding:8px 24px; background:transparent;
          border:1px solid #555; color:#aaa; border-radius:6px; cursor:pointer;
          font-size:13px;
        ">Keep current abilities</button>
      </div>
    `);
    (window as any)._swapAbility = (id: string) => { hideOverlay(); game?.swapAbility(id); };
    (window as any)._cancelSwap = () => { hideOverlay(); game?.cancelSwap(); };
    return;
  }

  if (stats.state === "shop") {
    const items = stats.shopOffer.map(item => `
      <div onclick="window._buyItem('${item.id}')" style="
        cursor:pointer; border:1px solid ${rarityColor(item.rarity)};
        border-radius:8px; padding:12px; width:150px; background:#111;
        margin:6px; text-align:center;
      " onmouseenter="this.style.background='#1e1e1e'" onmouseleave="this.style.background='#111'">
        <div style="font-size:10px;color:${rarityColor(item.rarity)};text-transform:uppercase;margin-bottom:4px">${item.rarity}</div>
        <div style="font-size:13px;font-weight:bold;margin:4px 0">${item.name}</div>
        <div style="font-size:11px;color:#bbb;margin-bottom:8px;line-height:1.3">${item.desc}</div>
        <div style="font-size:14px;color:#c8a96e">文 ${item.price}</div>
      </div>
    `).join("");
    showOverlay(`
      <div style="text-align:center;max-width:700px">
        <div style="font-size:20px;letter-spacing:2px;margin-bottom:4px;color:#c8a96e">商 SHOP</div>
        <div style="font-size:13px;color:#888;margin-bottom:16px">文 ${stats.mon} — Wave ${stats.wave}</div>
        <div style="display:flex;flex-wrap:wrap;justify-content:center">${items}</div>
        <div style="margin-top:16px;display:flex;gap:12px;justify-content:center">
          <button onclick="window._rerollShop()" style="
            padding:8px 20px; background:transparent; border:1px solid #c8a96e;
            color:#c8a96e; border-radius:6px; cursor:pointer; font-size:13px;
          ">Reroll (文 ${stats.shopRerollCost})</button>
          <button onclick="window._leaveShop()" style="
            padding:8px 20px; background:transparent; border:1px solid #555;
            color:#aaa; border-radius:6px; cursor:pointer; font-size:13px;
          ">Leave Shop</button>
        </div>
      </div>
    `);
    (window as any)._buyItem = (id: string) => {
      game?.buyShopItem(id);
      if (game) renderOverlay(game.stats);
    };
    (window as any)._rerollShop = () => {
      game?.rerollShop();
      if (game) renderOverlay(game.stats);
    };
    (window as any)._leaveShop = () => { hideOverlay(); game?.closeShop(); };
    return;
  }

  if (stats.state === "victory") {
    showOverlay(`
      <div style="text-align:center">
        <div style="font-size:64px">天</div>
        <div style="font-size:24px;color:#c8a96e;margin:12px 0">VICTORY</div>
        <div style="font-size:14px;color:#888;margin-bottom:24px">Wave ${stats.wave} cleared</div>
        <button onclick="window._restart()" style="
          padding:10px 28px; background:#c8a96e; border:none;
          color:#111; border-radius:6px; cursor:pointer; font-size:14px;font-weight:bold;
        ">Play Again</button>
      </div>
    `);
    (window as any)._restart = () => { hideOverlay(); showClassSelect(); };
    return;
  }

  if (stats.state === "defeat") {
    showOverlay(`
      <div style="text-align:center">
        <div style="font-size:64px;color:#c0392b">敗</div>
        <div style="font-size:24px;color:#c0392b;margin:12px 0">DEFEATED</div>
        <div style="font-size:14px;color:#888;margin-bottom:24px">Survived to wave ${stats.wave}</div>
        <button onclick="window._restart()" style="
          padding:10px 28px; background:#c8a96e; border:none;
          color:#111; border-radius:6px; cursor:pointer; font-size:14px;font-weight:bold;
        ">Try Again</button>
      </div>
    `);
    (window as any)._restart = () => { hideOverlay(); showClassSelect(); };
    return;
  }

  hideOverlay();
}

// ─── Game Loop ────────────────────────────────────────────────────────────────
function loop(ts: number) {
  if (!game) return;
  const dt = Math.min((ts - lastTime) / 1000, 0.05);
  lastTime = ts;
  game.update(dt);
  game.render();
  animId = requestAnimationFrame(loop);
}

function startGame(classId: ClassId) {
  if (animId !== null) cancelAnimationFrame(animId);
  cleanupInput();

  resize();
  game = new GhostGame(canvas);
  resize();

  game.onStatsChange = (stats: GameStats) => {
    currentStats = stats;
    const blocking = stats.state === "levelup" || stats.state === "swap" ||
      stats.state === "shop" || stats.state === "victory" || stats.state === "defeat";
    if (blocking) {
      renderOverlay(stats);
    } else {
      hideOverlay();
    }
  };

  const [primary] = CLASS_WEAPON_OPTIONS[classId];
  game.start(classId, primary);
  setupInput();
  lastTime = performance.now();
  animId = requestAnimationFrame(loop);
}

// ─── Input ────────────────────────────────────────────────────────────────────
function isPlaying() {
  return game && (!currentStats || currentStats.state === "playing");
}

function onKeyDown(e: KeyboardEvent) {
  if (!game) return;
  if (overlay.style.display !== "none") return; // let overlay handle its own clicks

  switch (e.code) {
    case "KeyW": case "ArrowUp":    game.setInput({ up: true }); break;
    case "KeyS": case "ArrowDown":  game.setInput({ down: true }); break;
    case "KeyA": case "ArrowLeft":  game.setInput({ left: true }); break;
    case "KeyD": case "ArrowRight": game.setInput({ right: true }); break;
    case "ShiftLeft": case "ShiftRight":
      game.setInput({ blockHeld: true });
      game.triggerDash();
      break;
    case "Space":
      e.preventDefault();
      game.triggerAttack();
      break;
    case "KeyQ":
      if (game.stats.equippedAbilities[0]) game.triggerAbility(game.stats.equippedAbilities[0]);
      break;
    case "KeyE":
      if (game.stats.equippedAbilities[1]) game.triggerAbility(game.stats.equippedAbilities[1]);
      break;
    case "KeyR":
      game.triggerUlt();
      break;
    case "KeyF":
      game.triggerTimeSlow();
      break;
    case "Tab":
      e.preventDefault();
      game.triggerSwap();
      break;
    case "Digit1": game.useConsumable(0); break;
    case "Digit2": game.useConsumable(1); break;
    case "Digit3": game.useConsumable(2); break;
  }
}

function onKeyUp(e: KeyboardEvent) {
  if (!game) return;
  switch (e.code) {
    case "KeyW": case "ArrowUp":    game.setInput({ up: false }); break;
    case "KeyS": case "ArrowDown":  game.setInput({ down: false }); break;
    case "KeyA": case "ArrowLeft":  game.setInput({ left: false }); break;
    case "KeyD": case "ArrowRight": game.setInput({ right: false }); break;
    case "ShiftLeft": case "ShiftRight":
      game.setInput({ blockHeld: false });
      break;
  }
}

function onMouseMove(e: MouseEvent) {
  if (!game || !isPlaying()) return;
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) * dpr;
  const y = (e.clientY - rect.top) * dpr;
  game.setInput({ mouseAim: true, mouseX: x, mouseY: y });
}

function onMouseDown(e: MouseEvent) {
  if (!game || !isPlaying()) return;
  if (e.button === 0) game.triggerAttack();
  if (e.button === 2) game.triggerDash();
}

function onContextMenu(e: Event) { e.preventDefault(); }

function setupInput() {
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  canvas.addEventListener("mousemove", onMouseMove);
  canvas.addEventListener("mousedown", onMouseDown);
  canvas.addEventListener("contextmenu", onContextMenu);
}

function cleanupInput() {
  window.removeEventListener("keydown", onKeyDown);
  window.removeEventListener("keyup", onKeyUp);
  canvas.removeEventListener("mousemove", onMouseMove);
  canvas.removeEventListener("mousedown", onMouseDown);
  canvas.removeEventListener("contextmenu", onContextMenu);
}

// ─── Class-Select Screen ─────────────────────────────────────────────────────
function showClassSelect() {
  if (animId !== null) { cancelAnimationFrame(animId); animId = null; }
  game = null;
  currentStats = null;
  hideOverlay();

  dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(window.innerWidth * dpr);
  canvas.height = Math.round(window.innerHeight * dpr);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;

  const ctx = canvas.getContext("2d")!;
  const W = canvas.width;
  const H = canvas.height;

  const COLS = 4;
  const CARD_W = Math.min(180 * dpr, (W - 60 * dpr) / COLS);
  const CARD_H = CARD_W * 1.35;
  const PAD = 10 * dpr;
  const ROWS = Math.ceil(CLASSES.length / COLS);
  const totalW = COLS * (CARD_W + PAD) - PAD;
  const totalH = ROWS * (CARD_H + PAD) - PAD;
  const startX = (W - totalW) / 2;
  const startY = H * 0.14;

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
    ctx.font = `${13 * dpr}px sans-serif`;
    ctx.fillStyle = "#555";
    ctx.fillText("WASD to move  ·  Mouse to aim  ·  LMB / Space to attack  ·  Shift to dash  ·  Q / E for abilities  ·  R for ultimate", W / 2, startY - 10 * dpr);

    cards.forEach(({ cls, x, y, w, h }, i) => {
      const hot = i === hovered;
      ctx.save();
      ctx.strokeStyle = hot ? cls.accent : "#2a2a2a";
      ctx.lineWidth = hot ? 2 * dpr : 1 * dpr;
      ctx.fillStyle = hot ? "#1a1818" : "#0e0e0e";
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 6 * dpr);
      ctx.fill();
      ctx.stroke();

      ctx.font = `bold ${28 * dpr}px serif`;
      ctx.fillStyle = cls.accent;
      ctx.textAlign = "center";
      ctx.fillText(cls.kanji, x + w / 2, y + 36 * dpr);

      ctx.font = `bold ${11 * dpr}px sans-serif`;
      ctx.fillStyle = hot ? "#fff" : "#ccc";
      ctx.fillText(cls.name, x + w / 2, y + 54 * dpr);

      ctx.font = `${9 * dpr}px sans-serif`;
      ctx.fillStyle = "#777";
      ctx.fillText(cls.role, x + w / 2, y + 68 * dpr);

      ctx.font = `${8 * dpr}px sans-serif`;
      ctx.fillStyle = "#999";
      ctx.textAlign = "left";
      cls.bonuses.slice(0, 3).forEach((b, bi) => {
        const short = b.length > 30 ? b.slice(0, 28) + "…" : b;
        ctx.fillText(`· ${short}`, x + 8 * dpr, y + 86 * dpr + bi * 14 * dpr);
      });

      ctx.restore();
    });
  }

  draw();

  function onMove(e: MouseEvent) {
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * dpr;
    const my = (e.clientY - rect.top) * dpr;
    const prev = hovered;
    hovered = cards.findIndex(c => mx >= c.x && mx <= c.x + c.w && my >= c.y && my <= c.y + c.h);
    if (hovered !== prev) draw();
  }

  function onClick(e: MouseEvent) {
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * dpr;
    const my = (e.clientY - rect.top) * dpr;
    const hit = cards.findIndex(c => mx >= c.x && mx <= c.x + c.w && my >= c.y && my <= c.y + c.h);
    if (hit !== -1) {
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("click", onClick);
      startGame(cards[hit].cls.id);
    }
  }

  canvas.addEventListener("mousemove", onMove);
  canvas.addEventListener("click", onClick);
}

// ─── Boot ─────────────────────────────────────────────────────────────────────
showClassSelect();
