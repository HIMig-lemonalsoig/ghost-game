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
  if (w === 0 || h === 0) return; // ignore bad resize events
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

function renderGameOverlay(stats: GameStats) {
  if (!game) return;

  if (stats.state === "levelup" && stats.pendingChoices.length > 0) {
    const cards = stats.pendingChoices.map(c => `
      <div onclick="window._pickPerk('${c.id}')" style="
        cursor:pointer; border:1px solid ${rarityColor(c.rarity)};
        border-radius:8px; padding:16px; width:200px; background:#111;
        margin:0 8px; text-align:center;
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
        <div style="display:flex;justify-content:center;flex-wrap:wrap">${cards}</div>
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
        padding:16px; width:180px; background:#111; margin:0 8px; text-align:center;
      " onmouseenter="this.style.background='#1e1e1e'" onmouseleave="this.style.background='#111'">
        <div style="font-size:11px;color:#888;margin-bottom:4px">Replace slot ${i + 1}</div>
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
          border:1px solid #555; color:#aaa; border-radius:6px; cursor:pointer; font-size:13px;
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
      if (game) renderGameOverlay(game.stats);
    };
    (window as any)._rerollShop = () => {
      game?.rerollShop();
      if (game) renderGameOverlay(game.stats);
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
  try {
    game.update(dt);
    game.render();
  } catch (err) {
    console.error("Game error:", err);
  }
  animId = requestAnimationFrame(loop);
}

function startGame(classId: ClassId) {
  if (animId !== null) { cancelAnimationFrame(animId); animId = null; }
  cleanupInput();
  hideClassSelect();

  resize();
  game = new GhostGame(canvas);
  resize();

  game.onStatsChange = (stats: GameStats) => {
    currentStats = { ...stats };
    const blocking = stats.state === "levelup" || stats.state === "swap" ||
      stats.state === "shop" || stats.state === "victory" || stats.state === "defeat";
    if (blocking) renderGameOverlay(stats);
    else hideOverlay();
  };

  const [primary, secondary] = CLASS_WEAPON_OPTIONS[classId];
  game.start(classId, primary);
  game.equipWeapons([primary, secondary]);

  setupInput();
  lastTime = performance.now();
  animId = requestAnimationFrame(loop);
}

// ─── Input ────────────────────────────────────────────────────────────────────
function onKeyDown(e: KeyboardEvent) {
  if (!game) return;
  if (overlay.style.display !== "none") return;

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
  if (!game) return;
  if (currentStats && currentStats.state !== "playing") return;
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) * dpr;
  const y = (e.clientY - rect.top) * dpr;
  game.setInput({ mouseAim: true, mouseX: x, mouseY: y });
}

function onMouseDown(e: MouseEvent) {
  if (!game) return;
  if (currentStats && currentStats.state !== "playing") return;
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

// ─── Class-Select Screen (HTML) ───────────────────────────────────────────────
const classSelectEl = document.createElement("div");
classSelectEl.id = "class-select";
Object.assign(classSelectEl.style, {
  position: "fixed", inset: "0", zIndex: "20",
  background: "#0a0a0a", overflowY: "auto",
  fontFamily: "serif", color: "#e8d9b0",
  display: "none",
});
document.body.appendChild(classSelectEl);

function hideClassSelect() {
  classSelectEl.style.display = "none";
}

function showClassSelect() {
  if (animId !== null) { cancelAnimationFrame(animId); animId = null; }
  game = null;
  currentStats = null;
  hideOverlay();
  cleanupInput();

  const COLS = Math.min(4, Math.floor((window.innerWidth - 32) / 180)) || 4;

  const cards = CLASSES.map(cls => {
    const bonuses = cls.bonuses.slice(0, 3).map(b =>
      `<div style="font-size:11px;color:#999;margin:2px 0">· ${b}</div>`
    ).join("");
    return `
      <div onclick="window._selectClass('${cls.id}')" style="
        cursor:pointer; border:1px solid #2a2a2a; border-radius:8px;
        padding:14px 12px; width:170px; background:#0e0e0e; margin:6px;
        text-align:center; transition:border-color .15s,background .15s;
        flex-shrink:0;
      "
      onmouseenter="this.style.borderColor='${cls.accent}';this.style.background='#161414'"
      onmouseleave="this.style.borderColor='#2a2a2a';this.style.background='#0e0e0e'">
        <div style="font-size:28px;color:${cls.accent};margin-bottom:4px">${cls.kanji}</div>
        <div style="font-size:13px;font-weight:bold;margin-bottom:2px">${cls.name}</div>
        <div style="font-size:10px;color:#666;margin-bottom:8px">${cls.role}</div>
        <hr style="border:none;border-top:1px solid #222;margin:6px 0">
        ${bonuses}
        <hr style="border:none;border-top:1px solid #222;margin:8px 0 4px">
        <div style="font-size:10px;color:#c8a96e">${cls.ultName}</div>
        <div style="font-size:10px;color:#666;margin-top:2px;line-height:1.3">${cls.ultDesc.slice(0, 60)}…</div>
      </div>
    `;
  }).join("");

  classSelectEl.innerHTML = `
    <div style="max-width:900px;margin:0 auto;padding:32px 16px">
      <div style="text-align:center;margin-bottom:24px">
        <div style="font-size:28px;color:#c8a96e;letter-spacing:3px;margin-bottom:6px">選択 — Choose Your Class</div>
        <div style="font-size:12px;color:#444">
          WASD move &nbsp;·&nbsp; Mouse aim &nbsp;·&nbsp; LMB / Space attack &nbsp;·&nbsp; Shift dash &nbsp;·&nbsp; Q / E abilities &nbsp;·&nbsp; R ultimate &nbsp;·&nbsp; Tab swap weapon
        </div>
      </div>
      <div style="display:flex;flex-wrap:wrap;justify-content:center">${cards}</div>
    </div>
  `;
  classSelectEl.style.display = "block";
  (window as any)._selectClass = (id: string) => startGame(id as ClassId);
}

// ─── Boot ─────────────────────────────────────────────────────────────────────
showClassSelect();
