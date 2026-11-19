import {
  GhostGame, CLASSES, CLASS_WEAPON_OPTIONS, SECONDARIES, ABILITY_POOL, CONSUMABLES, PERK_POOL,
  audio, loadRun, hasSavedRun, clearSavedRun, getClass, ABILITY_FX_HUE, SLASH_HUE,
} from "./GhostGame";
import { hueOf } from "./fx";
import type { ClassId, GameStats, SecondaryId } from "./GhostGame";
import { UI_CSS } from "./ui.css";

// ─── Persistent settings & records ────────────────────────────────────────────
const SETTINGS_KEY = "ghostgame.settings.v1";
const BEST_KEY = "ghostgame.best.v1";
const LAST_KEY = "ghostgame.last.v1";

interface Settings { sound: boolean; shake: boolean; tips: boolean; autoPause: boolean; }
interface LastPick { classId: ClassId; weapons: SecondaryId[]; }

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch { return fallback; }
}
function writeJSON(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage blocked */ }
}

const settings: Settings = readJSON(SETTINGS_KEY, { sound: true, shake: true, tips: true, autoPause: true });
const best: Record<string, number> = readJSON(BEST_KEY, {});
let lastPick: LastPick | null = readJSON<LastPick | null>(LAST_KEY, null);

// ─── DOM scaffolding ──────────────────────────────────────────────────────────
const style = document.createElement("style");
style.textContent = UI_CSS;
document.head.appendChild(style);

const canvas = document.getElementById("game-canvas") as HTMLCanvasElement;
const $ = <T extends HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector(sel) as T;
const h = (tag: string, cls = "", html = "") => {
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  if (html) el.innerHTML = html;
  return el;
};

const menu = h("div"); menu.id = "menu";
const hud = h("div"); hud.id = "hud";
const overlay = h("div"); overlay.id = "overlay";
overlay.setAttribute("role", "dialog");
document.body.append(hud, overlay, menu);

// ─── Game state ───────────────────────────────────────────────────────────────
let game: GhostGame | null = null;
let animId: number | null = null;
let lastTime = 0;
let dpr = window.devicePixelRatio || 1;
let stats: GameStats | null = null;
let currentClass: ClassId = lastPick?.classId ?? "samurai";
let currentWeapons: SecondaryId[] = [];
let runStartedAt = 0;
let overlayKey = "";
let recordSet = false;
let attackHeld = false;
let blockHeld = false;
let lastHp = Infinity;

function resize() {
  dpr = window.devicePixelRatio || 1;
  const w = window.innerWidth, hgt = window.innerHeight;
  if (!w || !hgt) return;
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(hgt * dpr);
  canvas.style.width = `${w}px`;
  canvas.style.height = `${hgt}px`;
  game?.resize(w, hgt, dpr);
}
window.addEventListener("resize", resize);

function applySettings() {
  audio.setMuted(!settings.sound);
  if (game) game.shakeScale = settings.shake ? 1 : 0.15;
  writeJSON(SETTINGS_KEY, settings);
}

// ─── Name lookups ─────────────────────────────────────────────────────────────
const abilityInfo = (id: string) => ABILITY_POOL.find(a => a.id === id);
function perkLabel(id: string): { kanji: string; name: string } {
  if (id.startsWith("ability:")) {
    const a = abilityInfo(id.slice(8));
    return a ? { kanji: a.kanji, name: a.name } : { kanji: "技", name: id.slice(8) };
  }
  const base = id.split(/[#:x]/)[0];
  const p = PERK_POOL.find(pp => pp.id === id || pp.id === base);
  return p ? { kanji: p.kanji, name: p.name } : { kanji: "印", name: id.replace(/_/g, " ") };
}

// ─── Pointer-tracked glow & tilt (inspired by 21st.dev Glow Card / Tilt Card) ──
const EMBERS = `<div class="embers" aria-hidden="true">${Array.from({ length: 22 }, (_, i) =>
  `<i style="left:${(i * 37) % 100}%;--d:${8 + (i % 5) * 2}s;--delay:${-(i * 1.3).toFixed(1)}s;--dx:${((i % 7) - 3) * 22}px;${i % 3 ? "" : "background:var(--gold);box-shadow:0 0 8px var(--gold);"}"></i>`).join("")}</div>`;

document.addEventListener("pointermove", e => {
  const el = (e.target as HTMLElement).closest?.<HTMLElement>(".glow");
  if (!el) return;
  const r = el.getBoundingClientRect();
  const x = e.clientX - r.left, y = e.clientY - r.top;
  el.style.setProperty("--mx", `${x}px`);
  el.style.setProperty("--my", `${y}px`);
  if (el.classList.contains("tilt")) {
    el.style.setProperty("--rx", `${((x / r.width) - 0.5) * 10}deg`);
    el.style.setProperty("--ry", `${(0.5 - (y / r.height)) * 10}deg`);
  }
}, { passive: true });

// ─── Class select ─────────────────────────────────────────────────────────────
function defaultWeapons(id: ClassId): SecondaryId[] {
  if (lastPick && lastPick.classId === id && lastPick.weapons.length === 2) return [...lastPick.weapons];
  return CLASS_WEAPON_OPTIONS[id].slice(0, 2);
}

function showMenu() {
  stopGame();
  hud.classList.remove("show");
  hideOverlay();
  if (!currentWeapons.length) currentWeapons = defaultWeapons(currentClass);
  renderMenu();
  menu.style.display = "block";
  requestAnimationFrame(() => $<HTMLElement>(".class-card.sel", menu)?.focus({ preventScroll: true }));
}

function renderMenu() {
  const saved = hasSavedRun() ? loadRun() : null;
  const cards = CLASSES.map(c => {
    const b = best[c.id];
    const badge = b ? `<span class="best num">Best W${b}</span>` : "";
    return `<button class="class-card glow${c.id === currentClass ? " sel" : ""}" data-class="${c.id}" style="--accent:${c.accent}" aria-pressed="${c.id === currentClass}">
      <span class="watermark" aria-hidden="true">${c.ultKanji}</span>${badge}<div class="kanji">${c.kanji}</div><div class="name">${c.name}</div><div class="role">${c.role}</div>
    </button>`;
  }).join("");

  const cls = getClass(currentClass);
  const weapons = CLASS_WEAPON_OPTIONS[currentClass].map(id => {
    const w = SECONDARIES[id];
    const idx = currentWeapons.indexOf(id);
    const on = idx >= 0;
    return `<button class="weapon-chip glow${on ? " on" : ""}" data-weapon="${id}" aria-pressed="${on}">
      <span class="kanji">${w.kanji}</span>
      <span><div class="wn">${w.name}</div><div class="wd">${w.desc}</div></span>
      ${on ? `<span class="wbadge">${idx === 0 ? "MAIN" : "ALT"}</span>` : ""}
    </button>`;
  }).join("");

  const continueBtn = saved
    ? `<button class="btn" data-act="continue">Continue · ${getClass(saved.classId).name} · Wave ${saved.wave}</button>`
    : "";

  menu.innerHTML = `${EMBERS}
  <div class="menu-wrap">
    <div class="menu-top">
      <div class="logo"><span class="kanji">幽</span><div><h1>GHOST GAME</h1><p>Survive the waves. Forge your legend.</p></div></div>
      <div class="menu-actions">${continueBtn}<button class="btn ghost" data-act="random">Random class</button></div>
    </div>
    <div class="menu-body">
      <div class="class-grid" role="listbox" aria-label="Classes">${cards}</div>
      <aside class="detail" style="--accent:${cls.accent}">
        <span class="bigmark" aria-hidden="true">${cls.kanji}</span>
        <div class="detail-head"><span class="kanji">${cls.kanji}</span><div><h2>${cls.name}</h2><div class="role">${cls.role}</div></div></div>
        <h3>Passives</h3>
        <ul>${cls.bonuses.filter(b => !/secondary|Starts with/i.test(b)).map(b => `<li>${b}</li>`).join("") || "<li>Balanced fighter</li>"}</ul>
        <h3>Ultimate · R</h3>
        <div class="ult-box"><b><span class="kanji">${cls.ultKanji}</span> ${cls.ultName}</b><p>${cls.ultDesc}</p></div>
        <h3>Weapons · pick 2</h3>
        <div class="weapons">${weapons}</div>
        <p class="hint">Press Tab in a fight to swap between your two weapons.</p>
        <div class="start-row">
          <button class="btn primary" data-act="start" ${currentWeapons.length === 2 ? "" : "disabled"}>Begin · Enter</button>
        </div>
        ${saved ? `<p class="hint">Starting a new run replaces your saved run.</p>` : ""}
      </aside>
    </div>
    <div class="controls-strip">
      <span><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> Move</span>
      <span>Mouse Aim</span>
      <span><kbd>Click</kbd>/<kbd>Space</kbd> Attack (hold)</span>
      <span><kbd>Shift</kbd>/<kbd>Right-click</kbd> Dash</span>
      <span><kbd>Q</kbd><kbd>E</kbd> Abilities</span>
      <span><kbd>R</kbd> Ultimate</span>
      <span><kbd>Tab</kbd> Swap weapon</span>
      <span><kbd>F</kbd> Block (shields)</span>
      <span><kbd>1</kbd><kbd>2</kbd><kbd>3</kbd> Items</span>
      <span><kbd>Esc</kbd> Pause</span>
    </div>
  </div>`;
}

function selectClass(id: ClassId) {
  if (id === currentClass) return;
  currentClass = id;
  currentWeapons = defaultWeapons(id);
  renderMenu();
  $<HTMLElement>(`.class-card[data-class="${id}"]`, menu)?.focus({ preventScroll: true });
}

menu.addEventListener("click", e => {
  const t = e.target as HTMLElement;
  const card = t.closest<HTMLElement>("[data-class]");
  if (card) { selectClass(card.dataset.class as ClassId); return; }
  const chip = t.closest<HTMLElement>("[data-weapon]");
  if (chip) {
    const id = chip.dataset.weapon as SecondaryId;
    const i = currentWeapons.indexOf(id);
    if (i >= 0) currentWeapons.splice(i, 1);
    else {
      if (currentWeapons.length >= 2) currentWeapons.shift();
      currentWeapons.push(id);
    }
    renderMenu();
    return;
  }
  const act = t.closest<HTMLElement>("[data-act]")?.dataset.act;
  if (act === "start") startGame(currentClass, currentWeapons);
  else if (act === "continue") continueRun();
  else if (act === "random") {
    const pool = CLASSES.filter(c => c.id !== currentClass);
    selectClass(pool[Math.floor(Math.random() * pool.length)].id);
  }
});

function menuKeys(e: KeyboardEvent) {
  if (e.key === "Enter" && !(e.target as HTMLElement).closest?.("[data-weapon],[data-act]")) {
    if (currentWeapons.length === 2) startGame(currentClass, currentWeapons);
    e.preventDefault();
    return;
  }
  const arrows: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 0, ArrowUp: 0 };
  if (!(e.key in arrows)) return;
  const grid = $<HTMLElement>(".class-grid", menu);
  const cols = Math.max(1, getComputedStyle(grid).gridTemplateColumns.split(" ").length);
  const step = e.key === "ArrowDown" ? cols : e.key === "ArrowUp" ? -cols : arrows[e.key];
  const idx = CLASSES.findIndex(c => c.id === currentClass);
  const next = CLASSES[(idx + step + CLASSES.length) % CLASSES.length];
  selectClass(next.id);
  e.preventDefault();
}

// ─── Run lifecycle ────────────────────────────────────────────────────────────
function stopGame() {
  if (animId !== null) cancelAnimationFrame(animId);
  animId = null;
  if (game) audio.stopMusic();
  game = null;
  stats = null;
  attackHeld = blockHeld = false;
}

function bootGame(): GhostGame {
  stopGame();
  menu.style.display = "none";
  resize();
  const g = new GhostGame(canvas);
  game = g;
  resize();
  g.onStatsChange = s => { stats = s; };
  applySettings();
  return g;
}

function beginLoop() {
  hud.classList.add("show");
  buildHud();
  runStartedAt = performance.now();
  overlayKey = "";
  recordSet = false;
  try { audio.ensure(); if (settings.sound) audio.startMusic(); } catch { /* audio unavailable */ }
  lastTime = performance.now();
  animId = requestAnimationFrame(loop);
}

function startGame(classId: ClassId, weapons: SecondaryId[]) {
  const pick = weapons.length === 2 ? weapons : CLASS_WEAPON_OPTIONS[classId].slice(0, 2);
  lastPick = { classId, weapons: [...pick] };
  writeJSON(LAST_KEY, lastPick);
  clearSavedRun();
  const g = bootGame();
  g.start(classId, pick[0]);
  g.equipWeapons([pick[0], pick[1]]);
  stats = { ...g.stats };
  beginLoop();
}

function continueRun() {
  const saved = loadRun();
  if (!saved) { renderMenu(); return; }
  const g = bootGame();
  g.resumeFromSave(saved);
  stats = { ...g.stats };
  beginLoop();
}

function loop(ts: number) {
  if (!game) return;
  const dt = Math.min((ts - lastTime) / 1000, 0.05);
  lastTime = ts;
  try {
    if (attackHeld && game.stats.state === "playing") game.triggerAttack();
    game.update(dt);
    game.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    game.render();
    if (stats) {
      updateHud(stats);
      syncOverlay(stats);
    }
  } catch (err) {
    console.error("Game error:", err);
  }
  animId = requestAnimationFrame(loop);
}

// ─── HUD ──────────────────────────────────────────────────────────────────────
const cache = new Map<string, string>();
function setText(el: HTMLElement | null, key: string, val: string) {
  if (!el || cache.get(key) === val) return;
  cache.set(key, val);
  el.textContent = val;
}
function setScale(el: HTMLElement | null, key: string, frac: number) {
  const v = Math.max(0, Math.min(1, frac)).toFixed(3);
  if (!el || cache.get(key) === v) return;
  cache.set(key, v);
  el.style.transform = `scaleX(${v})`;
}
function setHTML(el: HTMLElement | null, key: string, html: string) {
  if (!el || cache.get(key) === html) return;
  cache.set(key, html);
  el.innerHTML = html;
}
function toggle(el: HTMLElement | null, cls: string, on: boolean) {
  if (el && el.classList.contains(cls) !== on) el.classList.toggle(cls, on);
}

const PAUSE_ICON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>`;

function buildHud() {
  cache.clear();
  lastHp = Infinity;
  const cls = getClass(game!.stats.classId);
  hud.style.setProperty("--accent", cls.accent);
  hud.innerHTML = `
    <div class="lowhp"></div>
    <div class="hud-tl">
      <div class="hud-class"><span class="kanji">${cls.kanji}</span><b>${cls.name}</b><span data-h="lvl"></span></div>
      <div class="bar hp"><i class="ghost" data-h="hpg"></i><i data-h="hp"></i><span class="num" data-h="hpt"></span></div>
      <div class="bar block" data-h="blockwrap"><i data-h="block"></i></div>
      <div class="bar xp"><i data-h="xp"></i></div>
    </div>
    <div class="hud-top">
      <div class="hud-wave" data-h="wave"></div>
      <div class="hud-sub num" data-h="sub"></div>
      <div class="bar timer"><i data-h="timer"></i></div>
      <div class="boss-bar" data-h="bosswrap"><div class="lbl">◆ BOSS ◆</div><div class="bar"><i data-h="boss"></i></div></div>
    </div>
    <div class="hud-tr">
      <div class="mon num"><span class="kanji">文</span><span data-h="mon"></span></div>
      <button class="pause-btn" data-act="pause" aria-label="Pause">${PAUSE_ICON}</button>
    </div>
    <div class="toast" data-h="toast"></div>
    ${settings.tips ? `<div class="tips" data-h="tips">
      <span><kbd>WASD</kbd> move</span><span><kbd>Click</kbd> hold to attack</span><span><kbd>Shift</kbd> dash through foes</span>
      <span><kbd>R</kbd> ultimate when gold</span><span><kbd>Tab</kbd> swap weapon</span><span><kbd>Esc</kbd> pause</span>
    </div>` : ""}
    <div class="hud-bottom">
      <div class="group" data-h="weapons"></div>
      <div class="group" data-h="abilities"></div>
      <div class="cell ult-cell">
        <div class="slot ult" data-h="ult" style="--h:${hueOf(cls.accent)}"><div class="fill" data-h="ultfill"></div>
          <span class="kanji k-base">${cls.ultKanji}</span><span class="kanji k-fill">${cls.ultKanji}</span><span class="cdn num" data-h="ultpct"></span><kbd>R</kbd></div>
        <div class="cell-name">${cls.ultName}</div>
      </div>
      <div class="group" data-h="items"></div>
    </div>`;
  hud.querySelector<HTMLElement>("[data-act=pause]")!.style.pointerEvents = "auto";
}


// ─── Toolbar cells (persistent so cooldown colours refill smoothly) ───────────
interface Cell { root: HTMLElement; slot: HTMLElement; }
function ensureCells(group: HTMLElement | null, n: number): Cell[] {
  if (!group) return [];
  let cells = group.querySelectorAll<HTMLElement>(":scope > .cell:not(.tab-hint)");
  while (cells.length < n) {
    const el = h("div", "cell", `<div class="slot"></div><div class="cell-name"></div>`);
    const hint = group.querySelector(".tab-hint");
    hint ? group.insertBefore(el, hint) : group.appendChild(el);
    cells = group.querySelectorAll<HTMLElement>(":scope > .cell:not(.tab-hint)");
  }
  return Array.from(cells).slice(0, n).map(root => ({ root, slot: root.querySelector<HTMLElement>(".slot")! }));
}

function setCell(c: Cell, key: string, kanji: string, name: string, hue: number, kb: string, empty: boolean) {
  if (c.root.dataset.k === key) return;
  c.root.dataset.k = key;
  cache.delete(`ammo${key[1]}`);
  c.slot.style.setProperty("--h", String(hue));
  c.slot.className = `slot${empty ? " empty" : ""}`;
  c.slot.innerHTML = `<div class="refill"></div><span class="kanji k-base">${kanji}</span><span class="kanji k-fill">${kanji}</span>`
    + `<span class="cdn num"></span><span class="ammo num"></span>${kb ? `<kbd>${kb}</kbd>` : ""}`;
  const nm = c.root.querySelector<HTMLElement>(".cell-name")!;
  nm.textContent = name;
  nm.classList.toggle("dim", empty);
  for (const k of [...cache.keys()]) if (k.startsWith(`tick:${key.slice(0, 2)}`)) cache.delete(k);
}

function tickSlot(c: Cell, key: string, p: number, cooling: boolean, label: string) {
  const pv = Math.max(0, Math.min(1, p)).toFixed(3);
  if (cache.get(`tick:${key}:p`) !== pv) { cache.set(`tick:${key}:p`, pv); c.slot.style.setProperty("--p", pv); }
  const was = cache.get(`tick:${key}:c`);
  const now = cooling ? "1" : "0";
  if (was !== now) {
    cache.set(`tick:${key}:c`, now);
    toggle(c.slot, "cooling", cooling);
    toggle(c.slot, "ready", !cooling && !c.slot.classList.contains("empty"));
    if (was === "1" && !cooling) { c.slot.classList.remove("pop"); void c.slot.offsetWidth; c.slot.classList.add("pop"); }
  }
  setText(c.slot.querySelector<HTMLElement>(".cdn"), `tick:${key}:t`, label);
}

const fmtCd = (sec: number) => (sec < 1 ? sec.toFixed(1) : String(Math.ceil(sec)));

const H = (k: string) => hud.querySelector<HTMLElement>(`[data-h="${k}"]`);

function updateHud(s: GameStats) {
  const hpFrac = s.maxHp > 0 ? s.hp / s.maxHp : 0;
  if (s.hp < lastHp && lastHp !== Infinity) {
    const bar = hud.querySelector<HTMLElement>(".bar.hp");
    if (bar) { bar.classList.remove("hurt"); void bar.offsetWidth; bar.classList.add("hurt"); }
  }
  lastHp = s.hp;
  setScale(H("hp"), "hp", hpFrac);
  setScale(H("hpg"), "hpg", hpFrac);
  setText(H("hpt"), "hpt", `${Math.max(0, Math.ceil(s.hp))} / ${Math.round(s.maxHp)}`);
  toggle(hud.querySelector(".lowhp"), "show", hpFrac > 0 && hpFrac < 0.3 && s.state === "playing");
  const bw = H("blockwrap");
  if (bw) bw.style.display = s.blockHpMax > 0 ? "" : "none";
  setScale(H("block"), "block", s.blockHpMax > 0 ? s.blockHp / s.blockHpMax : 0);
  setScale(H("xp"), "xp", s.xpToNext > 0 ? s.xp / s.xpToNext : 0);
  setText(H("lvl"), "lvl", `· Lv ${s.level}`);

  const waveLabel = s.isBossWave ? `BOSS · WAVE ${s.wave}` : `WAVE ${s.wave}`;
  setText(H("wave"), "wave", waveLabel);
  toggle(H("wave"), "boss", s.isBossWave);
  const secs = Math.ceil(s.waveTimer);
  const timeTxt = s.isBossWave ? "Slay the boss" : `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`;
  setText(H("sub"), "sub", `${s.biomeKanji} ${s.biomeName} · ${timeTxt} · ${s.enemiesLeft} foes`);
  setScale(H("timer"), "timer", s.waveDuration > 0 ? s.waveTimer / s.waveDuration : 0);

  let boss: { hp: number; maxHp: number } | null = null;
  if (game) for (const e of game.enemies) if (e.isBoss && e.state !== "dead") { boss = e; break; }
  toggle(H("bosswrap"), "show", !!boss);
  if (boss) setScale(H("boss"), "boss", boss.hp / Math.max(1, boss.maxHp));

  setText(H("mon"), "mon", String(s.mon));

  const toastOn = s.messageTimer > 0 && !!s.message;
  if (toastOn) setText(H("toast"), "toast", s.message);
  toggle(H("toast"), "show", toastOn);

  const tips = H("tips");
  if (tips) toggle(tips, "hide", performance.now() - runStartedAt > 14000 || s.wave > 1);

  // Weapons
  const wGroup = H("weapons");
  const wCells = ensureCells(wGroup, 2);
  s.secondaryIds.forEach((id, i) => {
    const c = wCells[i];
    if (!id) { setCell(c, `w${i}`, "—", "Empty", 40, "", true); return; }
    const w = SECONDARIES[id];
    setCell(c, `w${i}${id}`, w.kanji, w.name, SLASH_HUE[id] ?? 40, i === 0 ? "1st" : "2nd", false);
    const reloading = s.secondaryReloadMax[i] > 0 && s.secondaryReload[i] > 0;
    const p = reloading ? 1 - s.secondaryReload[i] / s.secondaryReloadMax[i] : 1;
    const ammo = s.secondaryAmmoMax[i] > 0 ? `${s.secondaryAmmo[i]}/${s.secondaryAmmoMax[i]}` : "∞";
    tickSlot(c, `w${i}`, p, reloading, reloading ? fmtCd(s.secondaryReload[i]) : "");
    setText(c.slot.querySelector<HTMLElement>(".ammo"), `ammo${i}`, ammo);
    toggle(c.slot, "active", i === s.secondaryActiveSlot);
    toggle(c.root, "held", i === s.secondaryActiveSlot);
    toggle(c.root, "stowed", i !== s.secondaryActiveSlot);
  });
  if (!wGroup?.querySelector(".tab-hint")) wGroup?.insertAdjacentHTML("beforeend", `<div class="cell tab-hint"><div class="slot mini"><kbd style="position:static">Tab</kbd></div><div class="cell-name dim">Swap</div></div>`);

  // Abilities
  const keys = ["Q", "E"];
  const aCells = ensureCells(H("abilities"), 2);
  [0, 1].forEach(i => {
    const c = aCells[i];
    const id = s.equippedAbilities[i];
    if (!id) {
      setCell(c, `a${i}`, "?", "Level up to unlock", 40, keys[i], true);
      tickSlot(c, `a${i}`, 1, false, "");
      return;
    }
    const info = abilityInfo(id);
    setCell(c, `a${i}${id}`, info?.kanji ?? "技", info?.name ?? id, ABILITY_FX_HUE[id] ?? 40, keys[i], false);
    const cd = s.abilityCd[id] ?? 0;
    const max = s.abilityMax[id] || 1;
    tickSlot(c, `a${i}`, cd > 0 ? 1 - cd / max : 1, cd > 0, cd > 0 ? fmtCd(cd) : "");
  });

  // Ultimate
  const ultFrac = Math.min(1, s.ultMax > 0 ? s.ultCharge / s.ultMax : 0);
  const ult = H("ult");
  const fill = H("ultfill");
  const fh = `${Math.round(ultFrac * 100)}%`;
  if (fill && cache.get("ultfill") !== fh) { cache.set("ultfill", fh); fill.style.height = fh; }
  const ultReady = s.ultReady && !s.ultActive;
  if (ult) {
    const pv = ultFrac.toFixed(3);
    if (cache.get("ultp") !== pv) { cache.set("ultp", pv); ult.style.setProperty("--p", pv); }
    toggle(ult, "cooling", !ultReady);
    toggle(ult, "ready", ultReady);
    if (ultReady && cache.get("ultwas") === "cool") { ult.classList.remove("pop"); void ult.offsetWidth; ult.classList.add("pop"); }
    cache.set("ultwas", ultReady ? "ready" : "cool");
  }
  setText(H("ultpct"), "ultpct", ultReady ? "" : s.ultActive ? "ACTIVE" : `${Math.floor(ultFrac * 100)}%`);

  // Consumables
  const iCells = ensureCells(H("items"), s.consumables.length);
  s.consumables.forEach((cid, i) => {
    const c = iCells[i];
    if (!cid) { setCell(c, `i${i}`, "·", "Empty", 40, String(i + 1), true); tickSlot(c, `i${i}`, 1, false, ""); return; }
    const d = CONSUMABLES[cid];
    setCell(c, `i${i}${cid}`, d.kanji, d.name, hueOf(d.accent), String(i + 1), false);
    c.slot.title = d.desc;
    tickSlot(c, `i${i}`, 1, false, "");
  });

  // Records
  if (s.wave > (best[s.classId] ?? 0) && (s.state === "defeat" || s.state === "victory" || s.state === "shop")) {
    best[s.classId] = s.wave;
    writeJSON(BEST_KEY, best);
    if (s.state === "defeat" || s.state === "victory") recordSet = true;
  }
}

hud.addEventListener("click", e => {
  if ((e.target as HTMLElement).closest("[data-act=pause]")) pauseGame();
});

// ─── Overlays (level up / swap / shop / pause / end) ──────────────────────────
function hideOverlay() {
  overlay.classList.remove("show");
  overlay.innerHTML = "";
  overlayKey = "";
}
function showOverlay(html: string) {
  overlay.innerHTML = html;
  overlay.classList.add("show");
}

function syncOverlay(s: GameStats) {
  let key = s.state;
  if (s.state === "levelup") key += s.pendingChoices.map(c => c.id).join(",");
  if (s.state === "swap") key += s.pendingAbilityId;
  if (s.state === "shop") key += s.shopOffer.map(i => i.id).join(",") + "|" + s.shopPurchasedIds.join(",") + "|" + s.mon;
  if (s.state === "paused") key += "|" + JSON.stringify(settings);
  if (key === overlayKey) return;
  overlayKey = key;
  if (s.state === "playing") { overlay.classList.remove("show"); overlay.innerHTML = ""; return; }
  if (s.state === "levelup") return renderLevelUp(s);
  if (s.state === "swap") return renderSwap(s);
  if (s.state === "shop") return renderShop(s);
  if (s.state === "paused") return renderPause(s);
  if (s.state === "defeat" || s.state === "victory") return renderEnd(s);
}

function rarityClass(r: string) { return `r-${r}`; }

function renderLevelUp(s: GameStats) {
  const cards = s.pendingChoices.map((c, i) => `
    <button class="card glow tilt ${rarityClass(c.rarity)}" data-perk="${c.id}">
      <kbd class="key">${i + 1}</kbd>${c.kind === "ability" ? `<span class="tag">ABILITY</span>` : ""}
      <div class="kanji">${c.kanji}</div><div class="cn">${c.name}</div><div class="rar">${c.rarity}</div><div class="cd">${c.desc}</div>
    </button>`).join("");
  showOverlay(`<div class="panel">
    <div class="panel-title">LEVEL ${s.level}</div>
    <div class="panel-sub">Choose a blessing · press 1–${s.pendingChoices.length}</div>
    <div class="cards">${cards}</div></div>`);
}

function renderSwap(s: GameStats) {
  const incoming = abilityInfo(s.pendingAbilityId ?? "");
  const cards = s.equippedAbilities.map((id, i) => {
    const a = abilityInfo(id);
    return `<button class="card glow tilt r-rare" data-swap="${id}">
      <kbd class="key">${i + 1}</kbd><div class="kanji">${a?.kanji ?? "技"}</div><div class="cn">Replace ${a?.name ?? id}</div>
      <div class="cd">${a?.desc ?? ""}</div></button>`;
  }).join("");
  showOverlay(`<div class="panel">
    <div class="panel-title">NEW ABILITY</div>
    <div class="panel-sub"><b class="kanji" style="color:var(--gold)">${incoming?.kanji ?? ""}</b> ${incoming?.name ?? ""}: ${incoming?.desc ?? ""}</div>
    <div class="cards">${cards}</div>
    <div class="panel-actions"><button class="btn" data-act="keep">Keep current · Esc</button></div></div>`);
}

function renderShop(s: GameStats) {
  const items = s.shopOffer.map((it, i) => {
    const bought = s.shopPurchasedIds.includes(it.id);
    const broke = !bought && s.mon < it.price;
    return `<button class="card glow tilt ${rarityClass(it.rarity)}${bought ? " bought" : ""}" data-buy="${it.id}" ${bought || broke ? "disabled" : ""}>
      <kbd class="key">${i + 1}</kbd><div class="kanji">${it.kanji}</div><div class="cn">${it.name}</div>
      <div class="rar">${it.rarity}</div><div class="cd">${it.desc}</div>
      <div class="price num">${bought ? "Purchased" : `文 ${it.price}`}</div></button>`;
  }).join("");
  showOverlay(`<div class="panel">
    <div class="panel-title">商 MERCHANT</div>
    <div class="panel-sub num">Wave ${s.wave} cleared · You have <b style="color:var(--gold)">文 ${s.mon}</b></div>
    <div class="cards">${items}</div>
    <div class="panel-actions">
      <button class="btn" data-act="reroll" ${s.mon < s.shopRerollCost ? "disabled" : ""}>Reroll · 文 ${s.shopRerollCost} · <kbd>R</kbd></button>
      <button class="btn primary" data-act="leave">Next wave · <kbd>Enter</kbd></button>
    </div></div>`);
}

function renderPause(s: GameStats) {
  const d = s.derivedStats;
  const perks = s.perks.length
    ? s.perks.map(p => { const l = perkLabel(p); return `<span class="perk-pill"><span class="kanji">${l.kanji}</span>${l.name}</span>`; }).join("")
    : `<span style="color:var(--dim);font-size:13px">No blessings yet. Level up to earn them.</span>`;
  const sw = (k: keyof Settings, label: string) =>
    `<button class="toggle" data-set="${k}" role="switch" aria-checked="${settings[k]}"><span>${label}</span><span class="switch${settings[k] ? " on" : ""}"></span></button>`;
  showOverlay(`<div class="panel" style="text-align:left">
    <div class="panel-title" style="text-align:center">PAUSED</div>
    <div class="panel-sub" style="text-align:center">${s.className} · Wave ${s.wave} · Level ${s.level}</div>
    <div class="pause-grid">
      <div class="pause-menu">
        <button class="btn primary" data-act="resume">Resume · Esc</button>
        <button class="btn" data-act="restart">Restart run</button>
        <button class="btn" data-act="quit">Quit to menu</button>
        <div class="pane" style="margin-top:6px">
          <h4>Settings</h4>
          ${sw("sound", "Sound & music")}${sw("shake", "Screen shake")}${sw("tips", "Control tips")}${sw("autoPause", "Pause when tabbed out")}
        </div>
      </div>
      <div style="display:grid;gap:14px">
        <div class="pane"><h4>Stats</h4><div class="stats num">
          <div>Damage <b>${d.damage.toFixed(1)}</b></div><div>Dexterity <b>${d.dexterity}</b></div>
          <div>Defense <b>${d.defense}</b></div><div>Move speed <b>${d.moveSpeedPct}%</b></div>
          <div>Attack speed <b>${d.attackSpeedPct}%</b></div><div>Crit chance <b>${d.critChancePct}%</b></div>
          <div>HP regen <b>${d.hpRegen.toFixed(1)}/s</b></div><div>Weapon dmg <b>×${d.secondaryDmgMul.toFixed(2)}</b></div>
        </div></div>
        <div class="pane"><h4>Blessings</h4><div class="perk-list">${perks}</div></div>
        <div class="pane"><h4>Controls</h4><div class="ctrl-list">
          <span><kbd>WASD</kbd></span><span>Move · mouse to aim</span>
          <span><kbd>Click</kbd><kbd>Space</kbd></span><span>Attack (hold to keep swinging)</span>
          <span><kbd>Shift</kbd><kbd>RMB</kbd></span><span>Dash: brief invincibility, damages foes you pass</span>
          <span><kbd>Q</kbd><kbd>E</kbd></span><span>Abilities (earned from level-ups)</span>
          <span><kbd>R</kbd></span><span>Ultimate, charges from hits and kills</span>
          <span><kbd>Tab</kbd></span><span>Swap weapon</span>
          <span><kbd>F</kbd></span><span>Hold to block (shield weapons)</span>
          <span><kbd>1</kbd><kbd>2</kbd><kbd>3</kbd></span><span>Use item</span>
        </div></div>
      </div>
    </div></div>`);
}

function renderEnd(s: GameStats) {
  const won = s.state === "victory";
  const mins = Math.floor((performance.now() - runStartedAt) / 60000);
  showOverlay(`<div class="panel">
    <div class="end-kanji" style="color:${won ? "var(--gold)" : "var(--crimson)"}">${won ? "天" : "敗"}</div>
    <div class="panel-title" style="margin-top:8px">${won ? "VICTORY" : "YOU HAVE FALLEN"}</div>
    <div class="panel-sub">${s.className}</div>
    ${recordSet ? `<div class="record">NEW BEST · WAVE ${s.wave}</div>` : `<div class="panel-sub num">Best: wave ${best[s.classId] ?? s.wave}</div>`}
    <div class="end-stats num">
      <div class="end-stat"><b>${s.wave}</b><span>Wave</span></div>
      <div class="end-stat"><b>${s.level}</b><span>Level</span></div>
      <div class="end-stat"><b>${s.honor}</b><span>Honor</span></div>
      <div class="end-stat"><b>${s.perks.length}</b><span>Blessings</span></div>
      <div class="end-stat"><b>${mins}m</b><span>Time</span></div>
    </div>
    <div class="panel-actions">
      <button class="btn primary" data-act="retry">Try again · <kbd>Enter</kbd></button>
      <button class="btn" data-act="quit">Change class · <kbd>Esc</kbd></button>
    </div></div>`);
}

function pauseGame() { if (game?.stats.state === "playing") { releaseInputs(); game.pause(); } }
function resumeGame() { game?.resume(); }

overlay.addEventListener("click", e => {
  if (!game) return;
  const t = e.target as HTMLElement;
  const perk = t.closest<HTMLElement>("[data-perk]");
  if (perk) { game.selectPerk(perk.dataset.perk!); return; }
  const sw = t.closest<HTMLElement>("[data-swap]");
  if (sw) { game.swapAbility(sw.dataset.swap!); return; }
  const buy = t.closest<HTMLButtonElement>("[data-buy]");
  if (buy) { if (!buy.disabled) game.buyShopItem(buy.dataset.buy!); return; }
  const set = t.closest<HTMLElement>("[data-set]");
  if (set) {
    const k = set.dataset.set as keyof Settings;
    settings[k] = !settings[k];
    applySettings();
    if (k === "sound" && settings.sound) { try { audio.startMusic(); } catch { /* ignore */ } }
    if (k === "tips") buildHud();
    return;
  }
  const act = t.closest<HTMLElement>("[data-act]")?.dataset.act;
  if (act) runAction(act);
});

function runAction(act: string) {
  if (!game) return;
  switch (act) {
    case "keep": game.cancelSwap(); break;
    case "reroll": game.rerollShop(); break;
    case "leave": game.closeShop(); break;
    case "resume": resumeGame(); break;
    case "restart":
    case "retry": {
      const pick = lastPick ?? { classId: game.stats.classId, weapons: CLASS_WEAPON_OPTIONS[game.stats.classId].slice(0, 2) };
      startGame(pick.classId, pick.weapons);
      break;
    }
    case "quit": showMenu(); break;
  }
}

// ─── Input ────────────────────────────────────────────────────────────────────
function releaseInputs() {
  attackHeld = false;
  blockHeld = false;
  game?.setInput({ up: false, down: false, left: false, right: false, blockHeld: false, attack: false });
}

const MOVE: Record<string, "up" | "down" | "left" | "right"> = {
  KeyW: "up", ArrowUp: "up", KeyS: "down", ArrowDown: "down",
  KeyA: "left", ArrowLeft: "left", KeyD: "right", ArrowRight: "right",
};

function overlayKeys(e: KeyboardEvent, s: GameStats): boolean {
  if (!game) return false;
  const n = /^Digit[1-9]$/.test(e.code) ? Number(e.code.slice(5)) - 1 : -1;
  switch (s.state) {
    case "levelup":
      if (n >= 0 && s.pendingChoices[n]) game.selectPerk(s.pendingChoices[n].id);
      return true;
    case "swap":
      if (n >= 0 && s.equippedAbilities[n]) game.swapAbility(s.equippedAbilities[n]);
      if (e.code === "Escape") game.cancelSwap();
      return true;
    case "shop":
      if (n >= 0 && s.shopOffer[n] && !s.shopPurchasedIds.includes(s.shopOffer[n].id)) game.buyShopItem(s.shopOffer[n].id);
      if (e.code === "KeyR") game.rerollShop();
      if (e.code === "Enter") { e.preventDefault(); game.closeShop(); }
      return true;
    case "paused":
      if (e.code === "Escape" || e.code === "KeyP") resumeGame();
      return true;
    case "defeat":
    case "victory":
      if (e.code === "Enter") { e.preventDefault(); runAction("retry"); }
      if (e.code === "Escape") runAction("quit");
      return true;
  }
  return false;
}

window.addEventListener("keydown", e => {
  if (menu.style.display !== "none") { menuKeys(e); return; }
  if (!game) return;
  const s = game.stats;
  if (s.state !== "playing") { if (!e.repeat) overlayKeys(e, s); return; }

  const dir = MOVE[e.code];
  if (dir) { game.setInput({ [dir]: true }); e.preventDefault(); return; }
  if (e.repeat) return;
  switch (e.code) {
    case "ShiftLeft": case "ShiftRight": game.triggerDash(); break;
    case "Space": e.preventDefault(); attackHeld = true; game.triggerAttack(); break;
    case "KeyQ": if (s.equippedAbilities[0]) game.triggerAbility(s.equippedAbilities[0]); break;
    case "KeyE": if (s.equippedAbilities[1]) game.triggerAbility(s.equippedAbilities[1]); break;
    case "KeyR": game.triggerUlt(); break;
    case "KeyF": blockHeld = true; game.setInput({ blockHeld: true }); break;
    case "Tab": case "KeyX": e.preventDefault(); game.triggerSwap(); break;
    case "Digit1": game.useConsumable(0); break;
    case "Digit2": game.useConsumable(1); break;
    case "Digit3": game.useConsumable(2); break;
    case "Escape": case "KeyP": pauseGame(); break;
  }
});

window.addEventListener("keyup", e => {
  if (!game) return;
  const dir = MOVE[e.code];
  if (dir) game.setInput({ [dir]: false });
  if (e.code === "Space") attackHeld = false;
  if (e.code === "KeyF") { blockHeld = false; game.setInput({ blockHeld: false }); }
});

canvas.addEventListener("mousemove", e => {
  if (!game) return;
  game.setInput({ mouseAim: true, mouseX: e.clientX, mouseY: e.clientY });
});
canvas.addEventListener("mousedown", e => {
  if (!game || game.stats.state !== "playing") return;
  if (e.button === 0) { attackHeld = true; game.triggerAttack(); }
  if (e.button === 2) game.triggerDash();
});
window.addEventListener("mouseup", e => { if (e.button === 0) attackHeld = false; });
canvas.addEventListener("contextmenu", e => e.preventDefault());

window.addEventListener("blur", () => {
  releaseInputs();
  if (settings.autoPause) pauseGame();
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) { releaseInputs(); if (settings.autoPause) pauseGame(); }
});

// ─── Boot ─────────────────────────────────────────────────────────────────────
applySettings();
showMenu();
