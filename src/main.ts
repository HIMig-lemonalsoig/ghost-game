import {
  GhostGame, CLASSES, CLASS_WEAPON_OPTIONS, SECONDARIES, ABILITY_POOL, CONSUMABLES, PERK_POOL,
  audio, loadRun, hasSavedRun, STAT_CAPS, clearSavedRun, getClass, ABILITY_FX_HUE, SLASH_HUE, BOSS_INFO, DIFFICULTIES, NO_META,
} from "./GhostGame";
import {
  classUnlocked, weaponUsable, CLASS_REQS, WEAPON_REQS, reqText, checkUnlocks, unlockToastHTML, unlockedClassCount,
  SHRINE, getShrine, nodeRank, nodeCost, buyNode, toggleAlt, setShrineOff, refundShrine, addEmbers, shrineBonus, embersFor,
} from "./unlocks";
import type { NodeId } from "./unlocks";
import { hueOf } from "./fx";
import type { ClassId, GameStats, SecondaryId, Difficulty } from "./GhostGame";
import { UI_CSS } from "./ui.css";
import { initDevMode } from "./devmode";
import { playIntro } from "./intro";
import { initTouch } from "./touch";
import { initGamepad, PAD_ACTIONS, BUTTON_NAMES } from "./gamepad";
import type { PadAction } from "./gamepad";
import { EVOLUTIONS, EVO_MASTERY } from "./content/evolutions";
import { DUO_BY_ID } from "./content/duos";
import { SIGNATURES } from "./content/signatures";
import { ULT_PERK_BY_ID } from "./content/ultperks";
import { guideHTML, GUIDE_CSS } from "./guide";
import type { GuideTab, GuideCtx } from "./guide";
import { DUOS } from "./content/duos";
import { OMEN_BY_ID } from "./content/choices";
import { VOWS, VOW_BY_ID, vowScore, vowRank, MAX_VOW_SCORE, VOW_UNLOCK_WAVE, VOW_COIN_BONUS } from "./content/vows";
import type { VowSet, VowId } from "./content/vows";
import { trackGame, trackStartWeapons } from "./telemetry";
import { recapHTML, summaryText } from "./recap";
import { dailySetup, dailyHTML, DAILY_CSS, todayKey, startAttempt, recordAttempt, shareText, dailyDay } from "./daily";
import { trackRun, commitRun, careerHTML, resetCareer, CAREER_CSS, getCareer, liveCareer, isFreshRun, recordWin, wonClasses } from "./career";
import { ACHIEVEMENTS, checkAchievements, achievementsHTML, achToastHTML, unlockedCount, ACH_CSS } from "./achievements";
import type { AchCtx } from "./achievements";

// ─── Persistent settings & records ────────────────────────────────────────────
const SETTINGS_KEY = "ghostgame.settings.v1";
const BEST_KEY = "ghostgame.best.v1";
const LAST_KEY = "ghostgame.last.v1";

interface Settings { sound: boolean; shake: boolean; tips: boolean; autoPause: boolean; cutscenes: boolean; rumble: boolean; difficulty: Difficulty; }
type ToggleKey = "sound" | "shake" | "tips" | "autoPause" | "cutscenes" | "rumble";
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

const settings: Settings = readJSON(SETTINGS_KEY, { sound: true, shake: true, tips: true, autoPause: true, cutscenes: true, rumble: true, difficulty: "normal" as Difficulty });
if (!(settings.difficulty in DIFFICULTIES)) settings.difficulty = "normal";
// Best wave per class and difficulty (Normal keeps the original un-suffixed key).
const bestKey = (cls: string, d: Difficulty) => (d === "normal" ? cls : `${cls}@${d}`);
const best: Record<string, number> = readJSON(BEST_KEY, {});
let lastPick: LastPick | null = readJSON<LastPick | null>(LAST_KEY, null);

// ─── Keybinds (rebindable, saved per browser) ────────────────────────────────
const KEYS_KEY = "ghostgame.keys.v1";
type Action = "up" | "down" | "left" | "right" | "attack" | "dash" | "block" | "ability1" | "ability2"
  | "ult" | "swap" | "item1" | "item2" | "item3" | "pause";
const ACTIONS: { id: Action; label: string; group: string }[] = [
  { id: "up", label: "Move up", group: "Movement" },
  { id: "down", label: "Move down", group: "Movement" },
  { id: "left", label: "Move left", group: "Movement" },
  { id: "right", label: "Move right", group: "Movement" },
  { id: "attack", label: "Attack (hold)", group: "Combat" },
  { id: "dash", label: "Dash", group: "Combat" },
  { id: "block", label: "Block (shields)", group: "Combat" },
  { id: "ability1", label: "Ability 1", group: "Combat" },
  { id: "ability2", label: "Ability 2", group: "Combat" },
  { id: "ult", label: "Ultimate", group: "Combat" },
  { id: "swap", label: "Swap weapon", group: "Combat" },
  { id: "item1", label: "Use item 1", group: "Items & menu" },
  { id: "item2", label: "Use item 2", group: "Items & menu" },
  { id: "item3", label: "Use item 3", group: "Items & menu" },
  { id: "pause", label: "Pause (Esc also works)", group: "Items & menu" },
];
const DEFAULT_KEYS: Record<Action, string> = {
  up: "KeyW", down: "KeyS", left: "KeyA", right: "KeyD",
  attack: "Space", dash: "ShiftLeft", block: "KeyF", ability1: "KeyQ", ability2: "KeyE",
  ult: "KeyR", swap: "Tab", item1: "Digit1", item2: "Digit2", item3: "Digit3", pause: "KeyP",
};
const keys: Record<Action, string> = readJSON(KEYS_KEY, { ...DEFAULT_KEYS });
let capturing: Action | null = null;
let controlsOpen = false;
let careerOpen = false;
let guideOpen = false;
let logoTaps = 0, logoTapAt = 0;
let guideTab: GuideTab = "basics";
// ─── Vows ─────────────────────────────────────────────────────────────────────
const VOWS_KEY = "ghostgame.vows.v1";
const vowSet: VowSet = readJSON<VowSet>(VOWS_KEY, {});
let vowsOpen = false;
const vowsUnlocked = () => {
  let dev = false;
  try { dev = localStorage.getItem("ghostgame.vowsDev") === "1"; } catch { /* storage blocked */ }
  return dev || getCareer().highestWave >= VOW_UNLOCK_WAVE;
};
const activeVows = (): VowSet => (vowsUnlocked() ? { ...vowSet } : {});
let achOpen = false;
let shrineOpen = false;
let dailyOpen = false;
const dailyRecorded = new WeakMap<GhostGame, number>();   // last wave recorded for this daily attempt
let runAchCount = 0;                       // achievements unlocked this run (for Spirit Embers)
const embersGiven = new WeakMap<GhostGame, number>();
let lastEmbers = 0;
let careerArmed = false;

// Left/right modifier keys count as the same key.
const normKey = (c: string) => c.replace(/Right$/, (m) => (/^(Shift|Control|Alt|Meta)/.test(c) ? "Left" : m));
const NAMED: Record<string, string> = {
  Space: "Space", Escape: "Esc", Enter: "Enter", Tab: "Tab", Backspace: "Bksp", CapsLock: "Caps",
  ShiftLeft: "Shift", ControlLeft: "Ctrl", AltLeft: "Alt", MetaLeft: "Meta",
  ArrowUp: "↑", ArrowDown: "↓", ArrowLeft: "←", ArrowRight: "→",
  Backquote: "`", Minus: "-", Equal: "=", BracketLeft: "[", BracketRight: "]", Backslash: "\\",
  Semicolon: ";", Quote: "'", Comma: ",", Period: ".", Slash: "/",
};
function keyLabel(code: string): string {
  if (NAMED[code]) return NAMED[code];
  const m = /^(?:Key|Digit)(.)$/.exec(code);
  if (m) return m[1];
  if (code.startsWith("Numpad")) return "Num " + code.slice(6);
  return code;
}
const K = (a: Action) => keyLabel(keys[a]);
function actionOf(code: string): Action | null {
  for (const a of ACTIONS) if (keys[a.id] === code) return a.id;
  return null;
}
function bindKey(a: Action, code: string) {
  const other = actionOf(code);
  if (other && other !== a) keys[other] = keys[a];   // swap so nothing is left unbound
  keys[a] = code;
  writeJSON(KEYS_KEY, keys);
}
const ARROWS: Record<string, "up" | "down" | "left" | "right"> = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right" };

function controlsPanel(): string {
  const groups = [...new Set(ACTIONS.map(a => a.group))];
  return `<div class="binds">${groups.map(gname => `<div class="bind-group"><h5>${gname}</h5>${
    ACTIONS.filter(a => a.group === gname).map(a => `<div class="bind-row"><span>${a.label}</span>
      <button class="keycap${capturing === a.id ? " listening" : ""}" data-bind="${a.id}" aria-label="Rebind ${a.label}">${capturing === a.id ? "Press a key…" : K(a.id)}</button></div>`).join("")
  }</div>`).join("")}</div>
  <h5 style="margin:16px 0 6px">Controller 🎮 ${pad.connected ? "<span class=\"dim\">connected</span>" : "<span class=\"dim\">(plug one in and press a button)</span>"}</h5>
  <div class="bind-group pad-binds">${PAD_ACTIONS.map(a => `<div class="bind-row"><span>${a.label}</span>
    <button class="keycap${pad.capturing === a.id ? " listening" : ""}" data-padbind="${a.id}" aria-label="Rebind ${a.label} on controller">${pad.capturing === a.id ? "Press a button…" : BUTTON_NAMES[pad.map[a.id]] ?? `Button ${pad.map[a.id]}`}</button></div>`).join("")}</div>
  <p class="hint">Left stick moves · right stick aims (when it's idle you face the nearest foe while attacking) · in menus the D-pad moves, A selects, B goes back. B cancels a remap.</p>
  <div style="margin-top:6px"><button class="btn ghost" data-act="resetpad">Reset controller</button></div>
  <p class="hint" style="margin-top:10px">Click a key, then press the new one (Esc cancels). Mouse: left-click attacks, right-click dashes. Arrow keys always move and Esc always pauses.</p>
  <div style="margin-top:10px"><button class="btn ghost" data-act="resetkeys">Reset to defaults</button></div>`;
}

function showControlsModal() {
  controlsOpen = true;
  overlay.classList.add("show", "top");
  overlay.innerHTML = `<div class="panel" style="text-align:left;max-width:720px">
    <div class="panel-title" style="text-align:center">CONTROLS</div>
    <div class="pane" style="margin-top:16px">${controlsPanel()}</div>
    <div class="panel-actions"><button class="btn primary" data-act="closecontrols">Done · Esc</button></div></div>`;
}
function achCtx(): AchCtx {
  const g = game && !game.devMode ? game : null;
  return { c: liveCareer(g), r: g?.run ?? null, s: g?.stats ?? null, diff: g?.difficulty ?? null, fresh: g ? isFreshRun(g) : false, vow: g?.vowScore ?? 0 };
}
function showAchModal() {
  achOpen = true;
  overlay.classList.add("show", "top");
  overlay.innerHTML = achievementsHTML({ c: getCareer(), r: null, s: null, diff: null, fresh: false, vow: 0 });
}
function closeAchModal() {
  achOpen = false;
  overlay.classList.remove("show", "top");
  overlay.innerHTML = "";
  renderMenu();
}
const achToasts = document.createElement("div");
achToasts.id = "ach-toasts";
achToasts.setAttribute("aria-live", "polite");
document.body.append(achToasts);
let achCheckAt = 0;
function runAchievementCheck(force = false) {
  if (!game || game.devMode) return;
  const now = performance.now();
  if (!force && now - achCheckAt < 250) return;
  achCheckAt = now;
  showUnlockToasts();
  for (const a of checkAchievements(achCtx())) {
    runAchCount++;
    const wrap = document.createElement("div");
    wrap.innerHTML = achToastHTML(a);
    const el = wrap.firstElementChild as HTMLElement;
    achToasts.append(el);
    try { audio.play(a.tier === "common" || a.tier === "uncommon" ? "monPing" : "levelUp"); } catch { /* audio off */ }
    setTimeout(() => { el.classList.add("out"); setTimeout(() => el.remove(), 220); }, a.tier === "mythic" ? 7000 : 4500);
  }
}

function vowsHTML(): string {
  const score = vowScore(vowSet);
  const rows = VOWS.map(v => {
    const r = vowRank(vowSet, v.id);
    const pips = Array.from({ length: v.ranks }, (_, i) => `<i class="${i < r ? "on" : ""}"></i>`).join("");
    return `<div class="vow-row${r ? " on" : ""}">
      <span class="kanji">${v.kanji}</span>
      <div class="vow-t"><b>${v.name}</b> <span class="vow-pts">${v.points} pt${v.points > 1 ? "s" : ""} / rank</span>
        <p>${r ? v.desc(r) : `<span class="dim">${v.desc(1)}</span>`}</p></div>
      <div class="vow-ctrl">
        <button class="vow-step" data-vow="${v.id}" data-d="-1" ${r ? "" : "disabled"} aria-label="Lower ${v.name}">−</button>
        <span class="vow-pips" aria-label="Rank ${r} of ${v.ranks}">${pips}</span>
        <button class="vow-step" data-vow="${v.id}" data-d="1" ${r < v.ranks ? "" : "disabled"} aria-label="Raise ${v.name}">+</button>
      </div></div>`;
  }).join("");
  return `<div class="panel vow-panel" style="text-align:left">
    <div class="panel-title" style="text-align:center">誓 VOWS</div>
    <div class="panel-sub" style="text-align:center">Swear optional challenges. Every point adds +${Math.round(VOW_COIN_BONUS * 100)}% coins and goes on your record.</div>
    <div class="vow-total"><span>Vow score</span><b class="num">${score}</b><span class="dim">/ ${MAX_VOW_SCORE}</span>
      ${getCareer().vowBest ? `<span class="vow-best">Best: score ${getCareer().vowBest!.score} · wave ${getCareer().vowBest!.wave}</span>` : ""}</div>
    <div class="vow-list">${rows}</div>
    <div class="panel-actions"><button class="btn primary" data-act="closevows">Done · Esc</button><button class="btn ghost" data-act="clearvows" ${score ? "" : "disabled"}>Clear all</button></div>
  </div>`;
}
// ─── Shrine of Ancestors (Phase 11) ──────────────────────────────────────────
function shrineHTML(): string {
  const sh = getShrine();
  const rows = SHRINE.map(n => {
    const r = nodeRank(n.id), alt = !!sh.alt[n.id], cost = nodeCost(n.id);
    const pips = Array.from({ length: n.max }, (_, i) => `<i class="${i < r ? "on" : ""}"></i>`).join("");
    const v = (side: "a" | "b") => {
      const on = (side === "b") === alt;
      return `<button class="sh-ver${on ? " on" : ""}" data-shalt="${n.id}" ${on ? "disabled" : ""} aria-pressed="${on}">
        <b>${n[side].name}</b><span>${n[side].desc(Math.max(1, r))}</span></button>`;
    };
    return `<div class="sh-row${r ? " on" : ""}">
      <span class="kanji">${n.kanji}</span>
      <div class="sh-t"><div class="sh-name"><b>${n.name}</b><span class="vow-pips" aria-label="Rank ${r} of ${n.max}">${pips}</span></div>
        <div class="sh-vers">${v("a")}${v("b")}</div></div>
      <button class="btn sh-buy" data-shbuy="${n.id}" ${cost && sh.embers >= cost ? "" : "disabled"}>${cost ? `Kindle · <span class="num">${cost}</span> 火` : "Max"}</button>
    </div>`;
  }).join("");
  return `<div class="panel vow-panel" style="text-align:left">
    <div class="panel-title" style="text-align:center">祖 SHRINE OF ANCESTORS</div>
    <div class="panel-sub" style="text-align:center">Spend Spirit Embers on small permanent blessings. Each one has an alternate version: tap it to switch for free.</div>
    <div class="vow-total"><span>Spirit Embers</span><b class="num">${sh.embers}</b><span class="dim">· earned ${sh.earned}</span></div>
    <label class="sh-off"><input type="checkbox" data-shoff ${sh.off ? "checked" : ""}> Switch all shrine blessings off (purist runs)</label>
    <div class="vow-list${sh.off ? " sh-disabled" : ""}">${rows}</div>
    <p class="hint" style="text-align:center">Earn embers every run: 1 per wave reached, 3 per boss, 5 per achievement, 15 for a win.</p>
    <div class="panel-actions"><button class="btn primary" data-act="closeshrine">Done · Esc</button><button class="btn ghost" data-act="refundshrine" ${sh.spent ? "" : "disabled"}>Refund all</button></div>
  </div>`;
}
// ─── Daily run (Phase 13) ────────────────────────────────────────────────────
function showDailyModal() {
  dailyOpen = true;
  overlay.classList.add("show", "top");
  overlay.innerHTML = dailyHTML();
}
function closeDailyModal(rerender = true) {
  dailyOpen = false;
  overlay.classList.remove("show", "top");
  overlay.innerHTML = "";
  if (rerender) renderMenu();
}
function startDaily() {
  const d = dailySetup();
  closeDailyModal(false);
  clearSavedRun();
  const g = bootGame();
  g.difficulty = "normal";
  g.vows = { ...d.vows };
  g.meta = { ...NO_META };   // Shrine off: same run for everyone
  g.daily = d.date;
  g.assistDR = assistLevel();
  runAchCount = 0;
  g.start(d.classId, d.weapons[0]);
  g.equipWeapons([d.weapons[0], d.weapons[1]]);
  trackRun(g, true);
  trackGame(g);
  startAttempt(d.date, d.classId);
  stats = { ...g.stats };
  beginLoop();
}
/** Save this daily attempt's result (safe to call more than once). */
function recordDaily(g: GhostGame | null) {
  if (!g || !g.daily || g.devMode) return;
  const wave = g.stats.wave;
  if ((dailyRecorded.get(g) ?? -1) >= wave && g.stats.state !== "victory") return;
  dailyRecorded.set(g, wave);
  recordAttempt(g.daily, wave, g.run.kills, g.stats.state === "victory" || (g.run.bossByKind.final ?? 0) > 0);
}
async function copyText(text: string, btn?: HTMLElement | null) {
  let ok = false;
  try { await navigator.clipboard.writeText(text); ok = true; } catch {
    const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select();
    try { ok = document.execCommand("copy"); } catch { /* blocked */ }
    ta.remove();
  }
  if (btn) btn.textContent = ok ? "Copied ✓" : "Copy blocked";
}

function showShrineModal() {
  shrineOpen = true;
  overlay.classList.add("show", "top");
  overlay.innerHTML = shrineHTML();
}
function closeShrineModal() {
  shrineOpen = false;
  overlay.classList.remove("show", "top");
  overlay.innerHTML = "";
  renderMenu();
}
/** Give this run's Spirit Embers (only the part not given yet: Endless keeps adding). */
function awardEmbers(g: GhostGame | null) {
  if (!g || g.devMode) return;
  const total = embersFor(g.stats.wave, g.run.bossKills, runAchCount, g.stats.state === "victory" || g.run.bossByKind.final > 0);
  const given = embersGiven.get(g) ?? 0;
  if (total > given) { addEmbers(total - given); embersGiven.set(g, total); }
  lastEmbers = total;
}
function showUnlockToasts() {
  for (const u of checkUnlocks(game && !game.devMode ? liveCareer(game) : getCareer())) {
    const wrap = document.createElement("div");
    wrap.innerHTML = unlockToastHTML(u);
    const el = wrap.firstElementChild as HTMLElement;
    achToasts.append(el);
    try { audio.play("levelUp"); } catch { /* audio off */ }
    setTimeout(() => { el.classList.add("out"); setTimeout(() => el.remove(), 220); }, 5500);
  }
}

function showVowsModal() {
  vowsOpen = true;
  overlay.classList.add("show", "top");
  overlay.innerHTML = vowsHTML();
}
function closeVowsModal() {
  vowsOpen = false;
  overlay.classList.remove("show", "top");
  overlay.innerHTML = "";
  renderMenu();
}

// ─── Guide (tutorials) ────────────────────────────────────────────────────────
function guideCtx(): GuideCtx {
  const c = getCareer();
  const g = game;
  return {
    owned: g ? [...g.acquiredPerks] : [],
    ownedDuos: g ? [...g.perks.duos] : [],
    discoveredDuos: c.duosBy ?? {},
    evolvedEver: c.evolvedBy ?? {},
    evolvedNow: g ? [...g.perks.evolved] : [],
    equipped: g ? (g.stats.secondaryIds.filter(Boolean) as SecondaryId[]) : [],
    classId: g?.stats.classId ?? currentClass,
    highestWave: c.highestWave || 0,
    mastery: g ? { ...g.perks.weaponMastery } : {},
  };
}
function showGuide(tab: GuideTab = guideTab) {
  guideOpen = true;
  guideTab = tab;
  if (game?.stats.state === "playing") game.pause();
  overlay.classList.add("show", "top");
  overlay.innerHTML = guideHTML(tab, guideCtx());
}
// ─── Accessibility (Phase 15) ────────────────────────────────────────────────
const A11Y_KEY = "ghostgame.a11y.v1";
interface A11y { colorblind: 0 | 1 | 2; uiScale: number; bigNumbers: boolean; outline: boolean; music: number; sfx: number; ui: number; assist: boolean; assistDeaths: number; }
const a11y: A11y = readJSON(A11Y_KEY, { colorblind: 0, uiScale: 100, bigNumbers: false, outline: false, music: 100, sfx: 100, ui: 100, assist: false, assistDeaths: 0 } as A11y);
let a11yOpen = false;
const assistLevel = () => (a11y.assist ? Math.min(0.8, 0.2 + 0.02 * a11y.assistDeaths) : 0);
function applyA11y() {
  audio.setVolumes({ music: a11y.music / 100, sfx: a11y.sfx / 100, ui: a11y.ui / 100 });
  const z = String(Math.max(0.9, Math.min(1.5, a11y.uiScale / 100)));
  for (const el of [hud, menu, overlay, achToasts]) (el.style as CSSStyleDeclaration & { zoom: string }).zoom = z;
  if (game) game.a11y = { colorblind: a11y.colorblind, bigNumbers: a11y.bigNumbers, outline: a11y.outline };
  writeJSON(A11Y_KEY, a11y);
}
function a11yHTML(): string {
  const tg = (k: "bigNumbers" | "outline" | "assist", label: string, sub = "") =>
    `<button class="toggle" data-a11yt="${k}" role="switch" aria-checked="${a11y[k]}"><span>${label}${sub ? `<i class="a11y-sub">${sub}</i>` : ""}</span><span class="switch${a11y[k] ? " on" : ""}"></span></button>`;
  const sl = (k: "music" | "sfx" | "ui" | "uiScale", label: string, min: number, max: number, step: number, unit = "%") =>
    `<label class="a11y-slider"><span>${label}</span><input type="range" data-a11ys="${k}" min="${min}" max="${max}" step="${step}" value="${a11y[k]}" aria-label="${label}"><b class="num" data-a11yv="${k}">${a11y[k]}${unit}</b></label>`;
  const cbs = ["Off", "Red-green safe", "Blue-yellow safe"];
  return `<div class="panel vow-panel" style="text-align:left">
    <div class="panel-title" style="text-align:center">ACCESSIBILITY</div>
    <div class="a11y-grid">
      <div class="pane"><h4>Vision</h4>
        <div class="a11y-seg" role="radiogroup" aria-label="Colorblind mode"><span>Colorblind mode</span><div>${cbs.map((c, i) => `<button class="diff${a11y.colorblind === i ? " on" : ""}" data-a11ycb="${i}" role="radio" aria-checked="${a11y.colorblind === i}">${c}</button>`).join("")}</div></div>
        <p class="hint">Danger zones get stripes and a white edge, enemies about to attack show a <b>!</b>, and elite affixes show their kanji in a clear box.</p>
        ${sl("uiScale", "UI scale", 90, 150, 10)}
        ${tg("bigNumbers", "Bigger damage numbers")}
        ${tg("outline", "Highlight my character", "A bright ring around you in busy fights")}
      </div>
      <div class="pane"><h4>Sound</h4>
        ${sl("music", "Music", 0, 100, 5)}${sl("sfx", "Sound effects", 0, 100, 5)}${sl("ui", "Menu sounds", 0, 100, 5)}
        <h4 style="margin-top:14px">Assist mode</h4>
        ${tg("assist", "Assist mode", `Take ${Math.round(assistLevel() * 100) || 20}% less damage, +2% each death (max 80%). Runs show an Assist tag.`)}
      </div>
    </div>
    <div class="panel-actions"><button class="btn primary" data-act="closea11y">Done · Esc</button></div>
  </div>`;
}
function showA11yModal() {
  a11yOpen = true;
  overlay.classList.add("show", "top");
  overlay.innerHTML = a11yHTML();
}
function closeA11yModal() {
  a11yOpen = false;
  overlay.classList.remove("top");
  if (menu.style.display !== "none") { overlay.classList.remove("show"); overlay.innerHTML = ""; renderMenu(); }
  else overlayKey = "";   // let the pause screen redraw
}

function closeGuide() {
  guideOpen = false;
  overlay.classList.remove("top");
  if (menu.style.display !== "none") { overlay.classList.remove("show"); overlay.innerHTML = ""; renderMenu(); }
  else overlayKey = "";   // let the pause screen redraw
}

/** Small lines on level-up / shop cards that explain what a card unlocks. */
function cardHints(id: string): string {
  if (!game) return "";
  const out: string[] = [];
  const owned = game.acquiredPerks;
  for (const d of DUOS) {
    if (game.perks.duos.includes(d.id)) continue;
    const gi = d.needs.findIndex(gr => gr.includes(id));
    if (gi < 0) continue;
    const other = d.needs[1 - gi];
    if (other.some(o => owned.includes(o))) out.push(`<div class="hint-line done">★ Completes duo: ${d.name}</div>`);
    else if (!d.needs[gi].some(o => owned.includes(o))) out.push(`<div class="hint-line duo">◆ Duo piece: ${d.name}</div>`);
    if (out.length >= 2) break;
  }
  for (const wid of game.stats.secondaryIds) {
    if (!wid || game.perks.evolved.includes(wid)) continue;
    const evo = EVOLUTIONS[wid];
    if (evo.catalysts.includes(id) && !game.hasCatalyst(wid)) out.push(`<div class="hint-line evo">⚒ Catalyst: ${SECONDARIES[wid].name} → ${evo.name}</div>`);
    const m = new RegExp(`^dmg_${wid}_(common|rare|leg)$`).exec(id);
    if (m) out.push(`<div class="hint-line evo">⚒ Mastery ${Math.min(EVO_MASTERY, (game.perks.weaponMastery[wid] ?? 0) + 1)}/${EVO_MASTERY} → ${evo.name}</div>`);
  }
  return out.slice(0, 2).join("");
}

/** One-time tips (once per browser) when a new system becomes reachable. */
const TIPS_KEY = "ghostgame.tipsSeen.v1";
const tipsSeen: Record<string, number> = readJSON(TIPS_KEY, {});
let tipCheckAt = 0;
function showTip(id: string, kanji: string, text: string) {
  if (tipsSeen[id] || !settings.tips) return;
  tipsSeen[id] = Date.now();
  writeJSON(TIPS_KEY, tipsSeen);
  const el = document.createElement("div");
  el.className = "tip-toast";
  el.setAttribute("role", "status");
  el.innerHTML = `<span class="kanji">${kanji}</span><div><span class="tip-label">Tip</span><p>${text}</p><div class="tip-guide">More in the Guide (pause or menu)</div></div>`;
  achToasts.append(el);
  setTimeout(() => { el.classList.add("out"); setTimeout(() => el.remove(), 220); }, 7000);
}
function runTipCheck() {
  if (!game || game.devMode || game.stats.state !== "playing" || !settings.tips) return;
  const now = performance.now();
  if (now - tipCheckAt < 500) return;
  tipCheckAt = now;
  const g = game;
  if (g.stats.wave >= 1 && runStartedAt && now - runStartedAt > 15000) showTip("guide", "道", "New here? The <b>Guide</b> explains duo perks, weapon evolutions, elites, vows and more.");
  const duo = g.availableDuos()[0];
  if (duo) showTip("duo_ready", "双", `You own both halves of the duo <b>${duo.name}</b>. It can now show up on level-up cards.`);
  else if (DUOS.some(d => d.needs.some(gr => gr.some(id => g.acquiredPerks.includes(id))))) showTip("duo_piece", "双", "You picked a <b>duo piece</b>. Get a perk from its partner group and a powerful duo perk can appear. Cards marked ◆ build toward one.");
  const ready = g.evoReadyWeapon();
  if (ready) showTip("evo_ready", "進", `<b>${SECONDARIES[ready].name}</b> is ready to evolve! Open a Spirit Chest (elites and bosses drop them).`);
  else if (Object.values(g.perks.weaponMastery).some(v => v > 0)) showTip("evo_mastery", "進", `Weapon mastery started. Buy ${EVO_MASTERY} damage upgrades for a weapon and own its catalyst, then a Spirit Chest evolves it. Pause to see progress.`);
  if (g.spiritChests.length) showTip("chest", "宝", "A <b>Spirit Chest</b> dropped! Walk over it for loot, or to evolve a weapon that's ready.");
  if (g.enemies.some(e => e.state !== "dead" && e.affixes)) showTip("elite", "精", "<b>Elite</b> enemies glow and have a name tag. They're tougher, but always drop a Spirit Chest.");
}

function showCareerModal() {
  careerOpen = true;
  overlay.classList.add("show", "top");
  overlay.innerHTML = careerHTML(careerArmed);
}
function closeCareerModal() {
  careerOpen = false;
  careerArmed = false;
  overlay.classList.remove("show", "top");
  overlay.innerHTML = "";
  renderMenu();
}
function closeControlsModal() {
  controlsOpen = false;
  capturing = null;
  overlay.classList.remove("show", "top");
  overlay.innerHTML = "";
  renderMenu();
}
function refreshControls() {
  if (controlsOpen) showControlsModal();
  else overlayKey = "";
  if (game) buildHud();
  if (menu.style.display !== "none" && !controlsOpen) renderMenu();
}

// ─── DOM scaffolding ──────────────────────────────────────────────────────────
const style = document.createElement("style");
style.textContent = UI_CSS + CAREER_CSS + ACH_CSS + GUIDE_CSS + DAILY_CSS;
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
// Touch controls (turn on with the first touch). Attacks from touch also tell
// the engine so its aim assist can face the nearest enemy.
const touch = initTouch(() => game, held => { attackHeld = held; game?.setInput({ attackHeld: held }); });
// ─── Controller (Phase 14) ───
const pad = initGamepad({
  getGame: () => game,
  keyCode: a => keys[a as Action],
  uiRoot: () => overlay.classList.contains("show") ? overlay : menu.style.display !== "none" ? menu : null,
  rumbleOn: () => settings.rumble !== false,
  notify: html => {
    const el = document.createElement("div");
    el.className = "ach-toast"; el.style.setProperty("--tc", "hsl(42 90% 62%)"); el.setAttribute("role", "status");
    el.innerHTML = `<span class="ach-k kanji" aria-hidden="true">🎮</span><div><div class="ach-n">${html}</div><div class="ach-d">Left stick moves, right stick aims, RT attacks. Remap in Controls.</div></div>`;
    achToasts.append(el);
    setTimeout(() => { el.classList.add("out"); setTimeout(() => el.remove(), 220); }, 6000);
  },
  onCaptured: () => { if (controlsOpen) refreshControls(); },
});
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
  if (game) {
    game.shakeScale = settings.shake ? 1 : 0.15;
    game.ultCutscenes = settings.cutscenes;
  }
  writeJSON(SETTINGS_KEY, settings);
}

// ─── Name lookups ─────────────────────────────────────────────────────────────
const abilityInfo = (id: string) => ABILITY_POOL.find(a => a.id === id);
function perkLabel(id: string): { kanji: string; name: string } {
  if (id.startsWith("ability:")) {
    const a = abilityInfo(id.slice(8));
    return a ? { kanji: a.kanji, name: a.name } : { kanji: "技", name: id.slice(8) };
  }
  if (DUO_BY_ID[id]) return { kanji: DUO_BY_ID[id].kanji, name: `${DUO_BY_ID[id].name} (duo)` };
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
const canStart = () => currentWeapons.length === 2 && classUnlocked(currentClass) && currentWeapons.every(w => weaponUsable(currentClass, w));

function showMenu() {
  stopGame();
  hud.classList.remove("show");
  hideOverlay();
  if (!currentWeapons.length) currentWeapons = defaultWeapons(currentClass);
  showUnlockToasts();
  renderMenu();
  menu.style.display = "block";
  requestAnimationFrame(() => $<HTMLElement>(".class-card.sel", menu)?.focus({ preventScroll: true }));
}

function renderMenu() {
  const saved = hasSavedRun() ? loadRun() : null;
  const cards = CLASSES.map(c => {
    const b = best[bestKey(c.id, settings.difficulty)];
    const won = wonClasses().has(c.id);
    const badge = (b ? `<span class="best num">${won ? "✓ " : ""}Best W${b}</span>` : won ? `<span class="best num">✓ Won</span>` : "");
    const locked = !classUnlocked(c.id);
    return `<button class="class-card glow${c.id === currentClass ? " sel" : ""}${locked ? " locked" : ""}" data-class="${c.id}" style="--accent:${c.accent}" aria-pressed="${c.id === currentClass}"${locked ? ` title="Locked: ${reqText(CLASS_REQS[c.id])}"` : ""}>
      <span class="watermark" aria-hidden="true">${c.ultKanji}</span>${locked ? `<span class="best lock">🔒</span>` : badge}<div class="kanji">${c.kanji}</div><div class="name">${c.name}</div><div class="role">${locked ? "Locked" : c.role}</div>
    </button>`;
  }).join("");

  const cls = getClass(currentClass);
  const weapons = CLASS_WEAPON_OPTIONS[currentClass].map(id => {
    const w = SECONDARIES[id];
    const idx = currentWeapons.indexOf(id);
    const on = idx >= 0;
    const wl = !weaponUsable(currentClass, id);
    return `<button class="weapon-chip glow${on ? " on" : ""}${wl ? " locked" : ""}" data-weapon="${id}" aria-pressed="${on}" ${wl ? "aria-disabled=\"true\"" : ""}>
      <span class="kanji">${wl ? "🔒" : w.kanji}</span>
      <span><div class="wn">${w.name}</div><div class="wd">${wl ? `<b class="lock-req">Locked:</b> ${reqText(WEAPON_REQS[id])}` : w.desc}</div></span>
      ${on ? `<span class="wbadge">${idx === 0 ? "MAIN" : "ALT"}</span>` : ""}
    </button>`;
  }).join("");

  const continueBtn = saved
    ? `<button class="btn" data-act="continue">Continue · ${getClass(saved.classId).name} · Wave ${saved.wave}</button>`
    : "";

  menu.innerHTML = `${EMBERS}
  <div class="menu-wrap">
    <div class="menu-top">
      <div class="logo"><span class="kanji">幽</span><div><h1>YŪKEN</h1><p>Survive the waves. Forge your legend.</p></div></div>
      <div class="menu-actions">${continueBtn}<button class="btn ghost" data-act="guide"><span class="kanji" style="color:var(--gold)">道</span> Guide</button><button class="btn ghost" data-act="ach">Achievements <span class="num" style="opacity:.7">${unlockedCount()}/${ACHIEVEMENTS.length}</span></button><button class="btn ghost" data-act="career">Career</button><button class="btn ghost" data-act="daily"><span class="kanji" style="color:var(--gold)">日</span> Daily${dailyDay() ? "" : ` <span class="dl-new">NEW</span>`}</button><button class="btn ghost" data-act="shrine"><span class="kanji" style="color:var(--gold)">祖</span> Shrine <span class="num" style="opacity:.7">${getShrine().embers} 火</span></button><button class="btn ghost" data-act="controls">Controls</button><button class="btn ghost" data-act="a11y">Accessibility</button><button class="btn ghost" data-act="random">Random class</button></div>
    </div>
    <div class="menu-body">
      <div class="class-grid" role="listbox" aria-label="Classes">${cards}</div>
      <aside class="detail" style="--accent:${cls.accent}">
        <span class="bigmark" aria-hidden="true">${cls.kanji}</span>
        <div class="detail-head"><span class="kanji">${cls.kanji}</span><div><h2>${cls.name}</h2><div class="role">${cls.role}</div></div></div>
        ${classUnlocked(cls.id) ? "" : `<div class="lock-banner">🔒 <b>Locked.</b> ${reqText(CLASS_REQS[cls.id])}</div>`}
        <div class="sig-box"><span class="kanji">${SIGNATURES[cls.id].kanji}</span><div><b>Signature · ${SIGNATURES[cls.id].name}</b><p>${SIGNATURES[cls.id].desc}</p></div></div>
        <h3>Passives</h3>
        <ul>${cls.bonuses.filter(b => !/secondary|Starts with/i.test(b) && !sameAsSignature(b, cls.id)).map(b => `<li>${b}</li>`).join("") || "<li>No stat bonuses. The signature is the whole kit</li>"}</ul>
        <h3>Ultimate · ${K("ult")}</h3>
        <div class="ult-box"><b><span class="kanji">${cls.ultKanji}</span> ${cls.ultName}</b><p>${cls.ultDesc}</p></div>
        <h3>Weapons · pick 2</h3>
        <div class="weapons">${weapons}</div>
        <p class="hint">Press ${K("swap")} in a fight to swap between your two weapons.</p>
        <h3>Difficulty</h3>
        <div class="diff-row" role="radiogroup" aria-label="Difficulty">${(Object.keys(DIFFICULTIES) as Difficulty[]).map(d => {
          const D = DIFFICULTIES[d];
          return `<button class="diff${d === settings.difficulty ? " on" : ""}" style="--c:${D.color}" data-diff="${d}" role="radio" aria-checked="${d === settings.difficulty}"><span class="kanji">${D.kanji}</span>${D.name}</button>`;
        }).join("")}</div>
        <p class="hint">${DIFFICULTIES[settings.difficulty].desc}</p>
        ${vowsUnlocked()
          ? `<button class="vow-btn${vowScore(vowSet) ? " on" : ""}" data-act="vows"><span class="kanji">誓</span><span><b>Vows</b><i>${vowScore(vowSet) ? `Score ${vowScore(vowSet)} · +${Math.round(vowScore(vowSet) * VOW_COIN_BONUS * 100)}% coins` : "Swear optional challenges for a higher score"}</i></span><span class="num vow-score">${vowScore(vowSet)}</span></button>`
          : `<p class="hint vow-locked"><span class="kanji">誓</span> Vows unlock when you reach wave ${VOW_UNLOCK_WAVE} (your best: ${getCareer().highestWave || 0}).</p>`}
        <div class="start-row">
          <button class="btn primary" data-act="start" ${canStart() ? "" : "disabled"}>${classUnlocked(cls.id) ? "" : "🔒 "}Begin · ${DIFFICULTIES[settings.difficulty].name}${vowsUnlocked() && vowScore(vowSet) ? ` · 誓 ${vowScore(vowSet)}` : ""} · Enter</button>
        </div>
        ${saved ? `<p class="hint">Starting a new run replaces your saved run.</p>` : ""}
      </aside>
    </div>
    <div class="controls-strip">
      <span><kbd>${K("up")}</kbd><kbd>${K("left")}</kbd><kbd>${K("down")}</kbd><kbd>${K("right")}</kbd> Move</span>
      <span>Mouse Aim</span>
      <span><kbd>Click</kbd>/<kbd>${K("attack")}</kbd> Attack (hold)</span>
      <span><kbd>${K("dash")}</kbd>/<kbd>Right-click</kbd> Dash</span>
      <span><kbd>${K("ability1")}</kbd><kbd>${K("ability2")}</kbd> Abilities</span>
      <span><kbd>${K("ult")}</kbd> Ultimate</span>
      <span><kbd>${K("swap")}</kbd> Swap weapon</span>
      <span><kbd>${K("block")}</kbd> Block (shields)</span>
      <span><kbd>${K("item1")}</kbd><kbd>${K("item2")}</kbd><kbd>${K("item3")}</kbd> Items</span>
      <span><kbd>Esc</kbd> Pause</span>
      <span><button class="btn ghost" style="min-height:30px;padding:0 10px" data-act="controls">Change keys</button></span>
    </div>
  </div>`;
}

/** True when a bonus line just repeats the class's signature passive (shared key words). */
function sameAsSignature(bonus: string, id: ClassId): boolean {
  const words = (t: string) => new Set(t.toLowerCase().match(/[a-z]{4,}/g) ?? []);
  const sig = words(SIGNATURES[id].desc), b = words(bonus);
  let shared = 0;
  for (const w of b) if (sig.has(w)) shared++;
  return shared >= 2;
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
  if (card) {
    selectClass(card.dataset.class as ClassId);
    // Phones: the details + Begin button sit below the grid — bring them into view.
    if (window.matchMedia("(max-width: 900px)").matches) $<HTMLElement>(".detail", menu)?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  const diffBtn = t.closest<HTMLElement>("[data-diff]");
  if (diffBtn) {
    settings.difficulty = diffBtn.dataset.diff as Difficulty;
    writeJSON(SETTINGS_KEY, settings);
    renderMenu();
    return;
  }
  const chip = t.closest<HTMLElement>("[data-weapon]");
  if (chip) {
    const id = chip.dataset.weapon as SecondaryId;
    if (!weaponUsable(currentClass, id)) return;
    const i = currentWeapons.indexOf(id);
    if (i >= 0) currentWeapons.splice(i, 1);
    else {
      if (currentWeapons.length >= 2) currentWeapons.shift();
      currentWeapons.push(id);
    }
    renderMenu();
    return;
  }
  if (t.closest(".logo .kanji")) {
    const now = performance.now();
    logoTaps = now - logoTapAt < 600 ? logoTaps + 1 : 1;
    logoTapAt = now;
    if (logoTaps >= 7) { logoTaps = 0; for (const ch of "ghostdev") window.dispatchEvent(new KeyboardEvent("keydown", { key: ch })); }
  }
  const act = t.closest<HTMLElement>("[data-act]")?.dataset.act;
  if (act === "start") { if (canStart()) startGame(currentClass, currentWeapons); }
  else if (act === "continue") continueRun();
  else if (act === "controls") showControlsModal();
  else if (act === "career") showCareerModal();
  else if (act === "ach") showAchModal();
  else if (act === "guide") showGuide("basics");
  else if (act === "vows") showVowsModal();
  else if (act === "shrine") showShrineModal();
  else if (act === "daily") showDailyModal();
  else if (act === "a11y") showA11yModal();
  else if (act === "random") {
    const pool = CLASSES.filter(c => c.id !== currentClass && classUnlocked(c.id));
    selectClass(pool[Math.floor(Math.random() * pool.length)].id);
  }
});

function menuKeys(e: KeyboardEvent) {
  if (e.key === "Enter" && !(e.target as HTMLElement).closest?.("[data-weapon],[data-act]")) {
    if (canStart()) startGame(currentClass, currentWeapons);
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
  if (game) { commitRun(game); recordDaily(game); audio.stopMusic(); }
  touch.update(null);
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
  if (touch.active) g.setInput({ mouseAim: false, aimAssist: true });
  applySettings();
  applyA11y();
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
  g.difficulty = settings.difficulty;
  g.vows = activeVows();
  g.meta = shrineBonus() ?? { ...NO_META };   // SHRINE
  g.assistDR = assistLevel();   // A11Y Assist
  runAchCount = 0;
  g.start(classId, pick[0]);
  g.equipWeapons([pick[0], pick[1]]);
  trackRun(g, true);
  trackGame(g);
  trackStartWeapons(pick);
  stats = { ...g.stats };
  beginLoop();
}

function continueRun() {
  const saved = loadRun();
  if (!saved) { renderMenu(); return; }
  const g = bootGame();
  runAchCount = 0;
  g.resumeFromSave(saved);
  trackRun(g, false);
  trackGame(g);
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

let seenItemSeq = 0;
let itemCardUntil = 0;

function buildHud() {
  cache.clear();
  seenItemSeq = game?.stats.lastItemSeq ?? 0;
  itemCardUntil = 0;
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
      <div class="buffs" data-h="buffs"></div>
    </div>
    <div class="itemcard" data-h="itemcard"></div>
    <div class="hud-top">
      <div class="hud-wave" data-h="wave"></div>
      <div class="diff-tag" data-h="difftag"></div>
      <div class="hud-sub num" data-h="sub"></div>
      <div class="bar timer"><i data-h="timer"></i></div>
      <div class="boss-bar" data-h="bosswrap"><div class="lbl" data-h="bossname">◆ BOSS ◆</div><div class="bar"><i data-h="boss"></i></div></div>
    </div>
    <div class="hud-tr">
      <div class="mon num"><span class="kanji">文</span><span data-h="mon"></span></div>
      <button class="pause-btn" data-act="pause" aria-label="Pause">${PAUSE_ICON}</button>
    </div>
    <div class="toast" data-h="toast"></div>
    ${settings.tips ? `<div class="tips" data-h="tips">
      <span><kbd>${K("up")}${K("left")}${K("down")}${K("right")}</kbd> move</span><span><kbd>Click</kbd> hold to attack</span><span><kbd>${K("dash")}</kbd> dash through foes</span>
      <span><kbd>${K("ult")}</kbd> ultimate when gold</span><span><kbd>${K("swap")}</kbd> swap weapon</span><span><kbd>Esc</kbd> pause</span>
    </div>` : ""}
    <div class="hud-bottom">
      <div class="group" data-h="weapons"></div>
      <div class="group" data-h="abilities"></div>
      <div class="cell ult-cell">
        <div class="slot ult" data-h="ult" style="--h:${hueOf(cls.accent)}"><div class="fill" data-h="ultfill"></div>
          <span class="kanji k-base">${cls.ultKanji}</span><span class="kanji k-fill">${cls.ultKanji}</span><span class="cdn num" data-h="ultpct"></span><kbd>${K("ult")}</kbd></div>
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
  const banked = game?.pendingLevelUps ?? 0;
  setText(H("lvl"), "lvl", `· Lv ${s.level}${banked > 0 && s.state === "playing" ? ` · ✦${banked} after wave` : ""}`);

  const waveLabel = s.isBossWave ? `BOSS · WAVE ${s.wave}` : `WAVE ${s.wave}`;
  setText(H("wave"), "wave", waveLabel);
  toggle(H("wave"), "boss", s.isBossWave);
  const secs = Math.ceil(s.waveTimer);
  const timeTxt = s.isBossWave ? "Slay the boss" : `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`;
  setText(H("sub"), "sub", `${s.biomeKanji} ${s.biomeName} · ${timeTxt} · ${s.enemiesLeft} foes`);
  setScale(H("timer"), "timer", s.waveDuration > 0 ? s.waveTimer / s.waveDuration : 0);

  let boss: GhostGame["enemies"][number] | null = null;
  if (game) for (const e of game.enemies) if (e.isBoss && e.state !== "dead") { boss = e; break; }
  toggle(H("bosswrap"), "show", !!boss);
  if (boss) {
    setScale(H("boss"), "boss", boss.hp / Math.max(1, boss.maxHp));
    const info = boss.bossKind ? BOSS_INFO[boss.bossKind] : null;
    setText(H("bossname"), "bossname", info ? `◆ ${info.kanji} ${info.name.toUpperCase()} ◆` : boss.archetype === "final" ? "◆ 鬼 THE DEMON LORD ◆" : "◆ BOSS ◆");
  }

  setText(H("mon"), "mon", String(s.mon));
  if (game) {
    const D = DIFFICULTIES[game.difficulty];
    const tag = H("difftag");
    const vs = game.vowScore;
    if (tag && cache.get("difftag") !== `${game.difficulty}${vs}${game.endless}`) {
      cache.set("difftag", `${game.difficulty}${vs}${game.endless}`);
      tag.style.setProperty("--c", D.color);
      tag.innerHTML = `<span class="kanji">${D.kanji}</span> ${D.name.toUpperCase()}${vs ? ` · <span class="kanji">誓</span> ${vs}` : ""}${game.endless ? " · ∞ ENDLESS" : ""}${game.daily ? " · 日 DAILY" : ""}${game.omen ? ` · <span class="kanji">${OMEN_BY_ID[game.omen].kanji}</span> ${OMEN_BY_ID[game.omen].name.toUpperCase()}` : ""}${game.assistDR ? ` · ASSIST ${Math.round(game.assistDR * 100)}%` : ""}`;
    }
  }

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
    const evo = game?.evoStatus(id);
    const evolved = evo?.state === "evolved";
    setCell(c, `w${i}${id}${evolved ? "E" : ""}`, evolved ? EVOLUTIONS[id].kanji : w.kanji, evolved ? EVOLUTIONS[id].name : w.name, SLASH_HUE[id] ?? 40, i === 0 ? "1st" : "2nd", false);
    toggle(c.slot, "evo-ready", evo?.state === "ready");
    toggle(c.slot, "evolved", evolved);
    const reloading = s.secondaryReloadMax[i] > 0 && s.secondaryReload[i] > 0;
    const p = reloading ? 1 - s.secondaryReload[i] / s.secondaryReloadMax[i] : 1;
    const ammo = s.secondaryAmmoMax[i] > 0 ? `${s.secondaryAmmo[i]}/${s.secondaryAmmoMax[i]}` : "∞";
    tickSlot(c, `w${i}`, p, reloading, reloading ? fmtCd(s.secondaryReload[i]) : "");
    setText(c.slot.querySelector<HTMLElement>(".ammo"), `ammo${i}`, ammo);
    toggle(c.slot, "active", i === s.secondaryActiveSlot);
    toggle(c.root, "held", i === s.secondaryActiveSlot);
    toggle(c.root, "stowed", i !== s.secondaryActiveSlot);
  });
  if (!wGroup?.querySelector(".tab-hint")) wGroup?.insertAdjacentHTML("beforeend", `<div class="cell tab-hint"><div class="slot mini"><kbd style="position:static">${K("swap")}</kbd></div><div class="cell-name dim">Swap</div></div>`);

  // Abilities
  const keysAb = [K("ability1"), K("ability2")];
  const aCells = ensureCells(H("abilities"), 2);
  [0, 1].forEach(i => {
    const c = aCells[i];
    const id = s.equippedAbilities[i];
    if (!id) {
      setCell(c, `a${i}`, "?", "Level up to unlock", 40, keysAb[i], true);
      tickSlot(c, `a${i}`, 1, false, "");
      return;
    }
    const info = abilityInfo(id);
    setCell(c, `a${i}${id}`, info?.kanji ?? "技", info?.name ?? id, ABILITY_FX_HUE[id] ?? 40, keysAb[i], false);
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
    const itemKey = K((["item1", "item2", "item3"] as const)[i] ?? "item1");
    if (!cid) { setCell(c, `i${i}`, "·", "Empty", 40, itemKey, true); tickSlot(c, `i${i}`, 1, false, ""); return; }
    const d = CONSUMABLES[cid];
    setCell(c, `i${i}${cid}`, d.kanji, d.name, hueOf(d.accent), itemKey, false);
    c.slot.title = d.desc;
    tickSlot(c, `i${i}`, 1, false, "");
  });

  // Item used → card explaining exactly what it did
  if (s.lastItemSeq !== seenItemSeq) {
    seenItemSeq = s.lastItemSeq;
    if (s.lastItemId) {
      const d = CONSUMABLES[s.lastItemId];
      const card = H("itemcard");
      if (card) {
        card.style.setProperty("--c", d.accent);
        card.innerHTML = `<span class="kanji">${d.kanji}</span><div><b>${d.name}</b><p>${s.lastItemText}</p></div>`;
        card.classList.remove("show"); void card.offsetWidth; card.classList.add("show");
      }
      itemCardUntil = performance.now() + 4000;
    }
  }
  if (itemCardUntil && performance.now() > itemCardUntil) { itemCardUntil = 0; H("itemcard")?.classList.remove("show"); }

  // Active timed effects
  const fx: [boolean, string, string, string, number][] = [
    [s.buffSakeRemaining > 0, "酒", "+30% damage", "hsl(20 70% 60%)", s.buffSakeRemaining],
    [s.buffSmokeRemaining > 0, "煙", "Invulnerable", "hsl(220 20% 80%)", s.buffSmokeRemaining],
    [s.buffIronPowderRemaining > 0, "鉄", "3× block regen", "hsl(210 30% 70%)", s.buffIronPowderRemaining],
    [s.buffWindCharmRemaining > 0, "風", "+30% speed", "hsl(190 70% 70%)", s.buffWindCharmRemaining],
    [s.buffHasteRemaining > 0, "旗", "+15 Dex", "hsl(358 75% 60%)", s.buffHasteRemaining],
    [s.buffLuckRemaining > 0, "吉", "+40% crit", "hsl(140 60% 65%)", s.buffLuckRemaining],
    [(game?.timeSlowRemaining ?? 0) > 0, "時", "Time slowed", "hsl(210 70% 75%)", game?.timeSlowRemaining ?? 0],
    [!!game?.perks.hasSecondWind, "鳳", "Revive ready", "hsl(15 100% 65%)", -1],
  ];
  setHTML(H("buffs"), "buffs", fx.filter(f => f[0]).map(([, k, label, c, t]) =>
    `<span class="buff" style="--c:${c}"><b class="kanji">${k}</b>${label}${t >= 0 ? ` <i class="num">${Math.ceil(t)}s</i>` : ""}</span>`).join(""));

  // Records
  const bk = bestKey(s.classId, game?.difficulty ?? "normal") + (game?.endless ? "#endless" : "");
  if (!game?.devMode && !game?.daily && s.wave > (best[bk] ?? 0) && (s.state === "defeat" || s.state === "victory" || s.state === "shop")) {
    best[bk] = s.wave;
    writeJSON(BEST_KEY, best);
    if (s.state === "defeat" || s.state === "victory") recordSet = true;
  }
  runAchievementCheck();
  runTipCheck();
  touch.update(s);
  // Career — fold progress in at each wave end and when the run ends.
  if (game && s.state !== careerSeenState) {
    if (s.state === "shop") commitRun(game);
    else if (s.state === "defeat") { commitRun(game, true); awardEmbers(game); recordDaily(game); if (game.assistDR > 0) { a11y.assistDeaths++; writeJSON(A11Y_KEY, a11y); } }
    else if (s.state === "victory") { commitRun(game); recordWin(game); awardEmbers(game); recordDaily(game); }   // run continues if they go Endless
    careerSeenState = s.state;
    runAchievementCheck(true);
  }
}
let careerSeenState = "";

hud.addEventListener("click", e => {
  const t = e.target as HTMLElement;
  if (t.closest("[data-act=pause]")) { pauseGame(); return; }
  // Touch mode: weapon and item slots in the bottom bar are tappable.
  if (!touch.active || !game || game.stats.state !== "playing") return;
  const cell = t.closest<HTMLElement>(".hud-bottom .cell");
  const group = cell?.parentElement?.dataset.h;
  if (!cell || !group) return;
  const cells = Array.from(cell.parentElement!.querySelectorAll(":scope > .cell:not(.tab-hint)"));
  const i = cells.indexOf(cell);
  if (group === "items" && i >= 0) game.useConsumable(i);
  else if (group === "weapons" && (cell.classList.contains("tab-hint") || i !== game.stats.secondaryActiveSlot)) game.triggerSwap();
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
  if (guideOpen || a11yOpen) return;
  let key = s.state;
  if (s.state === "levelup") key += s.pendingChoices.map(c => c.id).join(",") + `|${banishMode}|${game?.perks.rerolls}|${game?.perks.banishes}`;
  if (s.state === "swap") key += s.pendingAbilityId;
  if (s.state === "shop") key += s.shopOffer.map(i => i.id + (i.locked ? "L" : "")).join(",") + "|" + s.shopPurchasedIds.join(",") + "|" + s.mon;
  if (s.state === "paused") key += "|" + JSON.stringify(settings) + JSON.stringify(keys) + capturing;
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

let banishMode = false;
function renderLevelUp(s: GameStats) {
  const rr = game?.perks.rerolls ?? 0, bn = game?.perks.banishes ?? 0;
  if (bn <= 0) banishMode = false;
  showTip("lvl_control", "籤", "Don't like the cards? <b>Reroll</b> (R) draws new ones, <b>Banish</b> (B) removes a perk for the whole run, <b>Skip</b> (S) takes coins instead.");
  if (s.pendingChoices.some(c => ULT_PERK_BY_ID[c.id])) showTip("ultperk", "極", "Cards tagged <b>ULTIMATE</b> upgrade your ultimate. Each class also has its own ultimate perk.");
  if (s.pendingChoices.some(c => c.duo)) showTip("duo_card", "双", "A <b>DUO</b> perk! It combines two perks you own into something much stronger.");
  const cards = s.pendingChoices.map((c, i) => `
    <button class="card glow tilt ${rarityClass(c.rarity)}${c.duo ? " duo" : ""}${banishMode ? " banishing" : ""}" data-perk="${c.id}">
      <kbd class="key">${i + 1}</kbd>${c.kind === "ability" ? `<span class="tag">ABILITY</span>` : ""}${c.duo ? `<span class="tag duo-tag">DUO</span>` : ""}${ULT_PERK_BY_ID[c.id] ? `<span class="tag ult-tag">${ULT_PERK_BY_ID[c.id].cls ? `ULTIMATE · ${getClass(ULT_PERK_BY_ID[c.id].cls!).name.toUpperCase()}` : "ULTIMATE"}</span>` : ""}
      <div class="kanji">${c.kanji}</div><div class="cn">${c.name}</div><div class="rar">${c.rarity}</div><div class="cd">${c.desc}</div>${cardHints(c.id)}
    </button>`).join("");
  showOverlay(`<div class="panel">
    <div class="panel-title">LEVEL ${s.level}</div>
    <div class="panel-sub">${banishMode ? `<span style="color:hsl(0 80% 65%)">Pick a card to <b>banish</b> for the rest of the run · B to cancel</span>` : `Choose a blessing · press 1–${s.pendingChoices.length}`}</div>
    <div class="cards">${cards}</div>
    <div class="panel-actions lvl-actions">
      <button class="btn" data-act="lvlreroll" ${rr > 0 ? "" : "disabled"}>Reroll · ${rr} · <kbd>R</kbd></button>
      <button class="btn${banishMode ? " danger" : ""}" data-act="lvlbanish" ${bn > 0 ? "" : "disabled"}>${banishMode ? "Cancel banish" : "Banish"} · ${bn} · <kbd>B</kbd></button>
      <button class="btn ghost" data-act="lvlskip">Skip · +${game?.skipReward() ?? 0} 文 · <kbd>S</kbd></button>
    </div></div>`);
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
    const lockBtn = bought ? "" : `<button class="lock-btn${it.locked ? " on" : ""}" data-lock="${it.id}" aria-pressed="${!!it.locked}" title="${it.locked ? "Unlock" : "Lock: keep it through rerolls and into the next shop"} (Shift+${i + 1})">${it.locked ? "🔒" : "🔓"}</button>`;
    return `<div class="shop-slot">${lockBtn}<button class="card glow tilt ${rarityClass(it.rarity)}${bought ? " bought" : ""}${it.locked ? " locked-item" : ""}" data-buy="${it.id}" ${bought || broke ? "disabled" : ""}>
      <kbd class="key">${i + 1}</kbd><div class="kanji">${it.kanji}</div><div class="cn">${it.name}</div>
      <div class="rar">${it.rarity}</div><div class="cd">${it.desc}</div>${cardHints(it.effect)}
      ${(() => { const pv = game?.shopPreview(it.effect); return pv ? `<div class="preview num">${pv}</div>` : ""; })()}
      <div class="price num">${bought ? "Purchased" : `文 ${it.price}`}${it.locked ? ` <span class="locked-tag">LOCKED</span>` : ""}</div></button></div>`;
  }).join("");
  const nLocked = s.shopOffer.filter(i => i.locked).length;
  showOverlay(`<div class="panel">
    <div class="panel-title">商 MERCHANT</div>
    <div class="panel-sub num">Wave ${s.wave} cleared · You have <b style="color:var(--gold)">文 ${s.mon}</b></div>
    <div class="cards">${items}</div>
    <div class="panel-sub shop-lock-hint">🔒 Lock up to 2 items (${nLocked}/2) · <kbd>Shift</kbd>+<kbd>1–${s.shopOffer.length}</kbd> · locked items survive rerolls and wait for you next wave at the same price</div>
    <div class="panel-actions">
      <button class="btn" data-act="reroll" ${s.mon < s.shopRerollCost ? "disabled" : ""}>Reroll · 文 ${s.shopRerollCost} · <kbd>R</kbd></button>
      ${game?.omenOffer.length ? "" : `<button class="btn primary" data-act="leave">Next wave · <kbd>Enter</kbd></button>`}
    </div>
    ${game?.omenOffer.length ? `<div class="omen-pick"><div class="panel-sub">Choose tonight's omen for wave ${s.wave + 1}</div><div class="omen-row">${game.omenOffer.map((id, i) => {
      const o = OMEN_BY_ID[id];
      return `<button class="omen glow" style="--oh:${o.hue}" data-omen="${id}"><span class="kanji">${o.kanji}</span><span><b>${o.name}</b><i>${o.desc}</i></span><kbd>${i === 0 ? "Enter" : "Shift+Enter"}</kbd></button>`;
    }).join("")}</div></div>` : ""}
    </div>`);
}

function evoRows(s: GameStats): string {
  const ids = [...new Set(s.secondaryIds.filter((x): x is SecondaryId => !!x))];
  if (!game || !ids.length) return "";
  return ids.map(id => {
    const st = game!.evoStatus(id), evo = EVOLUTIONS[id];
    if (st.state === "evolved") return `<div class="evo-row done"><span class="kanji">${evo.kanji}</span><b>${evo.name}</b><span>${evo.desc}</span></div>`;
    const m = Math.min(EVO_MASTERY, st.mastery);
    return `<div class="evo-row${st.state === "ready" ? " ready" : ""}"><span class="kanji">${SECONDARIES[id].kanji}</span>
      <b>${SECONDARIES[id].name} → ${evo.name}</b>
      <span>${m >= EVO_MASTERY ? "✓" : "○"} Mastery ${m}/${EVO_MASTERY} <i>(buy "${id === "katana" ? "Whetstone" : SECONDARIES[id].name + " Mastery/Honed/Forged"}" in the shop)</i></span>
      <span>${st.catalyst ? "✓" : "○"} Catalyst: ${evo.catalystLabel}</span>
      <span>${st.state === "ready" ? "★ Ready! Open a Spirit Chest (elites and bosses drop them)" : "○ Then open a Spirit Chest"}</span></div>`;
  }).join("");
}

function renderPause(s: GameStats) {
  const d = s.derivedStats;
  const perks = s.perks.length
    ? s.perks.map(p => { const l = perkLabel(p); return `<span class="perk-pill"><span class="kanji">${l.kanji}</span>${l.name}</span>`; }).join("")
    : `<span style="color:var(--dim);font-size:13px">No blessings yet. Level up to earn them.</span>`;
  const sw = (k: ToggleKey, label: string) =>
    `<button class="toggle" data-set="${k}" role="switch" aria-checked="${settings[k]}"><span>${label}</span><span class="switch${settings[k] ? " on" : ""}"></span></button>`;
  showOverlay(`<div class="panel" style="text-align:left">
    <div class="panel-title" style="text-align:center">PAUSED</div>
    <div class="panel-sub" style="text-align:center">${s.className} · ${DIFFICULTIES[game?.difficulty ?? "normal"].name}${game?.vowScore ? ` · 誓 ${game.vowScore}` : ""} · Wave ${s.wave} · Level ${s.level}</div>
    <div class="pause-grid">
      <div class="pause-menu">
        <button class="btn primary" data-act="resume">Resume · Esc</button>
        <button class="btn" data-act="restart">Restart run</button>
        <button class="btn" data-act="quit">Quit to menu</button>
        <button class="btn" data-act="guide"><span class="kanji" style="color:var(--gold)">道</span> Guide</button>
        <button class="btn" data-act="a11y">Accessibility</button>
        <div class="pane" style="margin-top:6px">
          <h4>Settings</h4>
          ${sw("sound", "Sound & music")}${sw("shake", "Screen shake")}${sw("tips", "Control tips")}${sw("cutscenes", "Ultimate cutscenes")}${sw("autoPause", "Pause when tabbed out")}${sw("rumble", "Controller rumble")}
        </div>
      </div>
      <div style="display:grid;gap:14px">
        <div class="pane"><h4>Stats</h4><div class="stats num">
          <div>Damage <b>${d.damage.toFixed(1)}</b></div><div>Dexterity <b>${d.dexterity}</b></div>
          <div>Defense <b>${d.defense} <i class="soft">${d.defensePct}% blocked</i></b></div><div>Move speed <b>${d.moveSpeedPct}%</b></div>
          <div>Attack speed <b>${d.attackSpeedPct}%${mx(d.attackSpeedPct >= STAT_CAPS.attackSpeedMax * 100)}</b></div><div>Crit chance <b>${d.critChancePct}%</b></div>
          <div>HP regen <b>${d.hpRegen.toFixed(1)}/s${mx(d.hpRegen >= STAT_CAPS.hpRegen)}</b></div><div>Weapon dmg <b>×${d.secondaryDmgMul.toFixed(2)}${mx(d.secondaryDmgMul >= STAT_CAPS.secondaryDmgMul)}</b></div>
        </div></div>
        <div class="pane"><h4>Blessings</h4><div class="perk-list">${perks}</div></div>
        <div class="pane"><h4>Weapon evolutions</h4><div class="evo-list">${evoRows(s)}</div></div>
        <div class="pane"><h4>Controls · click a key to change it</h4>${controlsPanel()}</div>
      </div>
    </div></div>`);
}

function renderEnd(s: GameStats) {
  const won = s.state === "victory";
  const endless = !!game?.endless;
  const mins = Math.floor((performance.now() - runStartedAt) / 60000);
  showOverlay(`<div class="panel">
    <div class="end-kanji" style="color:${won ? "var(--gold)" : "var(--crimson)"}">${won ? "天" : "敗"}</div>
    <div class="panel-title" style="margin-top:8px">${won ? "VICTORY" : endless ? "THE LEGEND ENDS" : "YOU HAVE FALLEN"}</div>
    ${won ? `<div class="panel-sub" style="color:var(--gold)">The Final Boss is slain. 天下統一, the realm is yours.</div>` : endless ? `<div class="panel-sub" style="color:var(--gold)">∞ Endless run: you reached wave ${s.wave}</div>` : ""}
    <div class="panel-sub">${s.className} · ${DIFFICULTIES[game?.difficulty ?? "normal"].name}${game?.vowScore ? ` · Vow score ${game.vowScore}` : ""}${game?.assistDR ? ` · <span class="assist-tag">Assist ${Math.round(game.assistDR * 100)}%</span>` : ""}</div>
    ${won ? "" : recordSet ? `<div class="record">NEW ${endless ? "ENDLESS " : ""}BEST · WAVE ${s.wave}</div>` : `<div class="panel-sub num">${endless ? "Endless best" : "Best"} on ${DIFFICULTIES[game?.difficulty ?? "normal"].name}: wave ${best[bestKey(s.classId, game?.difficulty ?? "normal") + (endless ? "#endless" : "")] ?? s.wave}</div>`}
    <div class="end-stats num">
      <div class="end-stat"><b>${s.wave}</b><span>Wave</span></div>
      <div class="end-stat"><b>${s.level}</b><span>Level</span></div>
      <div class="end-stat"><b>${s.honor}</b><span>Honor</span></div>
      <div class="end-stat"><b>${s.perks.length}</b><span>Blessings</span></div>
      <div class="end-stat"><b>${mins}m</b><span>Time</span></div>
    </div>
    ${game?.daily && !game.devMode ? (recordDaily(game), `<div class="daily-end">日 Daily ${game.daily} · best wave ${dailyDay(game.daily)?.best ?? s.wave} · first try ${dailyDay(game.daily)?.first || "–"} <button class="btn ghost" data-act="copydailyend">Copy result</button></div>`) : ""}
    ${game && !game.devMode ? (awardEmbers(game), `<div class="embers-earned"><span class="kanji">火</span> +${lastEmbers} Spirit Embers <span class="dim">· spend them at the Shrine</span></div>`) : ""}
    ${game ? recapHTML(game, won) : ""}
    <div class="panel-actions">
      ${won ? `<button class="btn primary" data-act="endless">∞ Continue (Endless) · <kbd>Enter</kbd></button>
      <button class="btn" data-act="retry">New run</button>`
      : `<button class="btn primary" data-act="retry">Try again · <kbd>Enter</kbd></button>`}
      <button class="btn" data-act="quit">Change class · <kbd>Esc</kbd></button>
      <button class="btn ghost" data-act="copyrun">Copy run summary</button>
    </div></div>`);
}

async function copyRunSummary(btn?: HTMLElement | null) {
  if (!game) return;
  const s = game.stats;
  const text = summaryText(game, s, s.state === "victory", Math.floor((performance.now() - runStartedAt) / 60000));
  let ok = false;
  try { await navigator.clipboard.writeText(text); ok = true; } catch {
    const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select();
    try { ok = document.execCommand("copy"); } catch { /* blocked */ }
    ta.remove();
  }
  if (btn) btn.textContent = ok ? "Copied ✓" : "Copy blocked";
}

const mx = (on: boolean) => (on ? ` <i class="maxed">MAX</i>` : "");
function pauseGame() { if (game?.stats.state === "playing") { releaseInputs(); game.pause(); } }
function resumeGame() { game?.resume(); }

overlay.addEventListener("input", e => {
  const r = (e.target as HTMLElement).closest<HTMLInputElement>("[data-a11ys]");
  if (!r) return;
  const k = r.dataset.a11ys as "music" | "sfx" | "ui" | "uiScale";
  a11y[k] = Number(r.value);
  const v = overlay.querySelector(`[data-a11yv="${k}"]`); if (v) v.textContent = `${a11y[k]}%`;
  if (k !== "uiScale") applyA11y();
});
overlay.addEventListener("change", e => {
  // UI scale applies on release so the slider doesn't jump under your finger.
  if ((e.target as HTMLElement).closest('[data-a11ys="uiScale"]')) applyA11y();
  if ((e.target as HTMLElement).closest('[data-a11ys="ui"]')) audio.playUi("monPing");
});
overlay.addEventListener("click", e => {
  const t = e.target as HTMLElement;
  const bind = t.closest<HTMLElement>("[data-bind]");
  if (bind) { capturing = bind.dataset.bind as Action; refreshControls(); return; }
  const cact = t.closest<HTMLElement>("[data-act]")?.dataset.act;
  if (cact === "resetkeys") { Object.assign(keys, DEFAULT_KEYS); writeJSON(KEYS_KEY, keys); capturing = null; refreshControls(); return; }
  if (cact === "closecontrols") { pad.startCapture(null); closeControlsModal(); return; }
  if (cact === "resetpad") { pad.reset(); refreshControls(); return; }
  const pb = t.closest<HTMLElement>("[data-padbind]");
  if (pb) { pad.startCapture(pb.dataset.padbind as PadAction); refreshControls(); return; }
  if (cact === "closecareer") { closeCareerModal(); return; }
  if (cact === "closeach") { closeAchModal(); return; }
  if (cact === "guide") { showGuide(guideTab); return; }
  if (cact === "closeguide") { closeGuide(); return; }
  const gt = t.closest<HTMLElement>("[data-guide]");
  if (gt && guideOpen) { showGuide(gt.dataset.guide as GuideTab); overlay.scrollTop = 0; return; }
  if (cact === "closevows") { closeVowsModal(); return; }
  if (cact === "closeshrine") { closeShrineModal(); return; }
  if (cact === "closedaily") { closeDailyModal(); return; }
  if (cact === "a11y") { showA11yModal(); return; }
  if (cact === "closea11y") { closeA11yModal(); return; }
  if (a11yOpen) {
    const cb = t.closest<HTMLElement>("[data-a11ycb]");
    if (cb) { a11y.colorblind = Number(cb.dataset.a11ycb) as 0 | 1 | 2; applyA11y(); showA11yModal(); return; }
    const tg = t.closest<HTMLElement>("[data-a11yt]");
    if (tg) { const k = tg.dataset.a11yt as "bigNumbers" | "outline" | "assist"; a11y[k] = !a11y[k]; applyA11y(); showA11yModal(); return; }
  }
  if (cact === "startdaily") { startDaily(); return; }
  if (cact === "copydaily") { void copyText(shareText(todayKey()), t.closest<HTMLElement>("[data-act]")); return; }
  if (cact === "refundshrine") { refundShrine(); showShrineModal(); return; }
  if (shrineOpen) {
    const sb = t.closest<HTMLElement>("[data-shbuy]");
    if (sb) { if (buyNode(sb.dataset.shbuy as NodeId)) { try { audio.play("monPing"); } catch { /* audio off */ } } showShrineModal(); return; }
    const sa = t.closest<HTMLElement>("[data-shalt]");
    if (sa) { toggleAlt(sa.dataset.shalt as NodeId); showShrineModal(); return; }
    const so = t.closest<HTMLInputElement>("[data-shoff]");
    if (so) { setShrineOff(so.checked); showShrineModal(); return; }
  }
  if (cact === "clearvows") { for (const k of Object.keys(vowSet)) delete vowSet[k as VowId]; writeJSON(VOWS_KEY, vowSet); showVowsModal(); return; }
  const vb = t.closest<HTMLElement>("[data-vow]");
  if (vb && vowsOpen) {
    const id = vb.dataset.vow as VowId;
    const next = Math.max(0, Math.min(VOW_BY_ID[id].ranks, vowRank(vowSet, id) + Number(vb.dataset.d)));
    if (next) vowSet[id] = next; else delete vowSet[id];
    writeJSON(VOWS_KEY, vowSet);
    showVowsModal();
    return;
  }
  if (cact === "resetcareer") {
    if (careerArmed) { resetCareer(); careerArmed = false; } else careerArmed = true;
    showCareerModal();
    return;
  }
  if (!game) return;
  const perk = t.closest<HTMLElement>("[data-perk]");
  if (perk) {
    if (banishMode) { banishMode = false; game.banishPerk(perk.dataset.perk!); overlayKey = ""; syncOverlay({ ...game.stats }); }
    else game.selectPerk(perk.dataset.perk!);
    return;
  }
  const sw = t.closest<HTMLElement>("[data-swap]");
  if (sw) { game.swapAbility(sw.dataset.swap!); return; }
  const om = t.closest<HTMLElement>("[data-omen]");
  if (om) { game.closeShop(om.dataset.omen as never); return; }
  const lk = t.closest<HTMLElement>("[data-lock]");
  if (lk) { game.toggleShopLock(lk.dataset.lock!); return; }
  const buy = t.closest<HTMLButtonElement>("[data-buy]");
  if (buy) { if (!buy.disabled) game.buyShopItem(buy.dataset.buy!); return; }
  const set = t.closest<HTMLElement>("[data-set]");
  if (set) {
    const k = set.dataset.set as ToggleKey;
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
    case "copydailyend": if (game.daily) void copyText(shareText(game.daily), document.querySelector<HTMLElement>('[data-act="copydailyend"]')); break;
    case "copyrun": void copyRunSummary(document.querySelector<HTMLElement>('[data-act="copyrun"]')); break;
    case "lvlreroll": banishMode = false; game.rerollLevelUp(); break;
    case "lvlbanish": banishMode = !banishMode; overlayKey = ""; syncOverlay({ ...game.stats }); break;
    case "lvlskip": banishMode = false; game.skipLevelUp(); break;
    case "leave": game.closeShop(); break;
    case "resume": resumeGame(); break;
    case "restart":
    case "retry": {
      const pick = lastPick ?? { classId: game.stats.classId, weapons: CLASS_WEAPON_OPTIONS[game.stats.classId].slice(0, 2) };
      startGame(pick.classId, pick.weapons);
      break;
    }
    case "quit": showMenu(); break;
    case "endless": game.continueEndless(); overlayKey = ""; break;
  }
}

// ─── Input ────────────────────────────────────────────────────────────────────
function releaseInputs() {
  attackHeld = false;
  blockHeld = false;
  game?.setInput({ up: false, down: false, left: false, right: false, blockHeld: false, attack: false });
}

function moveDir(code: string): "up" | "down" | "left" | "right" | null {
  if (ARROWS[code]) return ARROWS[code];
  const a = actionOf(code);
  return a === "up" || a === "down" || a === "left" || a === "right" ? a : null;
}

function overlayKeys(e: KeyboardEvent, s: GameStats): boolean {
  if (!game) return false;
  const n = /^Digit[1-9]$/.test(e.code) ? Number(e.code.slice(5)) - 1 : -1;
  switch (s.state) {
    case "levelup":
      if (n >= 0 && s.pendingChoices[n]) {
        if (banishMode) { banishMode = false; game.banishPerk(s.pendingChoices[n].id); overlayKey = ""; syncOverlay({ ...game.stats }); }
        else game.selectPerk(s.pendingChoices[n].id);
      }
      if (e.code === "KeyR") runAction("lvlreroll");
      if (e.code === "KeyB") runAction("lvlbanish");
      if (e.code === "KeyS") runAction("lvlskip");
      if (e.code === "Escape" && banishMode) runAction("lvlbanish");
      return true;
    case "swap":
      if (n >= 0 && s.equippedAbilities[n]) game.swapAbility(s.equippedAbilities[n]);
      if (e.code === "Escape") game.cancelSwap();
      return true;
    case "shop":
      if (n >= 0 && s.shopOffer[n] && e.shiftKey) game.toggleShopLock(s.shopOffer[n].id);   // SHOPLOCK
      else if (n >= 0 && s.shopOffer[n] && !s.shopPurchasedIds.includes(s.shopOffer[n].id)) game.buyShopItem(s.shopOffer[n].id);
      if (e.code === "KeyR") game.rerollShop();
      if (e.code === "Enter") { e.preventDefault(); game.closeShop(game.omenOffer[e.shiftKey ? 1 : 0]); }
      return true;
    case "paused":
      if (e.code === "Escape" || normKey(e.code) === keys.pause) resumeGame();
      return true;
    case "defeat":
    case "victory":
      if (e.code === "Enter") { e.preventDefault(); runAction(s.state === "victory" ? "endless" : "retry"); }
      if (e.code === "Escape") runAction("quit");
      return true;
  }
  return false;
}

window.addEventListener("keydown", e => {
  // Typing into the dev panel's fields shouldn't drive the game.
  const tgt = e.target as HTMLElement | null;
  if (tgt?.closest?.("#devpanel") && (tgt.tagName === "INPUT" || tgt.tagName === "SELECT")) return;
  if (capturing) {
    e.preventDefault();
    e.stopPropagation();
    if (e.code !== "Escape") bindKey(capturing, normKey(e.code));
    capturing = null;
    refreshControls();
    return;
  }
  if (controlsOpen) { if (e.code === "Escape") closeControlsModal(); return; }
  if (careerOpen) { if (e.code === "Escape") closeCareerModal(); return; }
  if (achOpen) { if (e.code === "Escape") closeAchModal(); return; }
  if (vowsOpen) { if (e.code === "Escape") closeVowsModal(); return; }
  if (shrineOpen) { if (e.code === "Escape") closeShrineModal(); return; }
  if (a11yOpen) { if (e.code === "Escape") closeA11yModal(); return; }
  if (dailyOpen) { if (e.code === "Escape") closeDailyModal(); else if (e.code === "Enter") { e.preventDefault(); startDaily(); } return; }
  if (guideOpen) { if (e.code === "Escape") closeGuide(); return; }
  if (menu.style.display !== "none") { menuKeys(e); return; }
  if (!game) return;
  const s = game.stats;
  if (s.state !== "playing") { if (!e.repeat) overlayKeys(e, s); return; }

  const code = normKey(e.code);
  if (game.ultCutscene) {
    const a = actionOf(code);
    if (a === "attack" || a === "ult" || code === "Enter") { e.preventDefault(); game.skipUltCutscene(); return; }
  }
  const dir = moveDir(code);
  if (dir) { game.setInput({ [dir]: true }); e.preventDefault(); return; }
  const act = actionOf(code);
  if (act || code === "Escape") e.preventDefault();
  if (e.repeat) return;
  if (code === "Escape") { pauseGame(); return; }
  switch (act) {
    case "dash": game.triggerDash(); break;
    case "attack": attackHeld = true; game.triggerAttack(); break;
    case "ability1": if (s.equippedAbilities[0]) game.triggerAbility(s.equippedAbilities[0]); break;
    case "ability2": if (s.equippedAbilities[1]) game.triggerAbility(s.equippedAbilities[1]); break;
    case "ult": game.triggerUlt(); break;
    case "block": blockHeld = true; game.setInput({ blockHeld: true }); break;
    case "swap": game.triggerSwap(); break;
    case "item1": game.useConsumable(0); break;
    case "item2": game.useConsumable(1); break;
    case "item3": game.useConsumable(2); break;
    case "pause": pauseGame(); break;
  }
});

window.addEventListener("keyup", e => {
  if (!game) return;
  const code = normKey(e.code);
  const dir = moveDir(code);
  if (dir) game.setInput({ [dir]: false });
  const act = actionOf(code);
  if (act === "attack") attackHeld = false;
  if (act === "block") { blockHeld = false; game.setInput({ blockHeld: false }); }
});

canvas.addEventListener("mousemove", e => {
  if (!game) return;
  game.setInput({ mouseAim: true, mouseX: e.clientX, mouseY: e.clientY });
});
canvas.addEventListener("mousedown", e => {
  if (!game || game.stats.state !== "playing") return;
  if (game.ultCutscene) { game.skipUltCutscene(); return; }
  if (e.button === 0) { attackHeld = true; game.triggerAttack(); }
  if (e.button === 2) game.triggerDash();
});
window.addEventListener("mouseup", e => { if (e.button === 0) attackHeld = false; });
canvas.addEventListener("contextmenu", e => e.preventDefault());

window.addEventListener("blur", () => {
  releaseInputs();
  if (settings.autoPause) pauseGame();
});
window.addEventListener("pagehide", () => commitRun(game));
document.addEventListener("visibilitychange", () => {
  if (document.hidden) { commitRun(game); releaseInputs(); if (settings.autoPause) pauseGame(); }
});

// ─── Boot ─────────────────────────────────────────────────────────────────────
initDevMode(() => game);
applySettings();
applyA11y();
showMenu();
void playIntro();   // liquid-glass 幽 reveal over the menu each time the game opens
