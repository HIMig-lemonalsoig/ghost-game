// ─── Controller support (Phase 14) ────────────────────────────────────────────
// Polls the Gamepad API every frame. In a fight, buttons fire the same key
// events as the keyboard (so everything that works on keys works on a pad),
// the left stick moves and the right stick aims (aim assist when it's idle).
// In menus the D-pad / left stick moves focus between buttons, A clicks and
// B goes back. Buttons can be remapped in Controls. Optional rumble.
import type { GhostGame } from "./GhostGame";

export type PadAction = "attack" | "block" | "dash" | "ability1" | "ability2" | "ult" | "swap" | "item1" | "item2" | "item3" | "pause";
export const PAD_ACTIONS: { id: PadAction; label: string }[] = [
  { id: "attack", label: "Attack (hold)" }, { id: "block", label: "Block (shields)" }, { id: "dash", label: "Dash" },
  { id: "ability1", label: "Ability 1" }, { id: "ability2", label: "Ability 2" }, { id: "ult", label: "Ultimate" },
  { id: "swap", label: "Swap weapon" }, { id: "item1", label: "Item 1" }, { id: "item2", label: "Item 2" },
  { id: "item3", label: "Item 3" }, { id: "pause", label: "Pause" },
];
const DEFAULT_PAD: Record<PadAction, number> = {
  attack: 7, block: 6, dash: 0, ability1: 2, ability2: 3, ult: 5, swap: 4, item1: 12, item2: 14, item3: 15, pause: 9,
};
export const BUTTON_NAMES = ["A", "B", "X", "Y", "LB", "RB", "LT", "RT", "Back", "Start", "L3", "R3", "D-pad ↑", "D-pad ↓", "D-pad ←", "D-pad →", "Home"];
const KEY = "ghostgame.pad.v1";
const DEAD = 0.2;

export interface PadApi {
  readonly connected: boolean;
  readonly active: boolean;
  map: Record<PadAction, number>;
  capturing: PadAction | null;
  startCapture(a: PadAction | null): void;
  reset(): void;
  /** Run one poll right now (tests). */
  tick(): void;
}

interface Opts {
  getGame: () => GhostGame | null;
  keyCode: (a: PadAction) => string;          // keyboard code bound to an action
  uiRoot: () => HTMLElement | null;            // where menu navigation happens (null = gameplay)
  rumbleOn: () => boolean;
  notify: (html: string) => void;
  onCaptured: () => void;                      // redraw Controls after a remap
}

export function initGamepad(o: Opts): PadApi {
  let map: Record<PadAction, number> = { ...DEFAULT_PAD };
  try { const raw = localStorage.getItem(KEY); if (raw) map = { ...DEFAULT_PAD, ...JSON.parse(raw) }; } catch { /* blocked */ }
  const saveMap = () => { try { localStorage.setItem(KEY, JSON.stringify(map)); } catch { /* blocked */ } };

  let connected = false, active = false, announced = false;
  let capturing: PadAction | null = null;
  let prev: boolean[] = [];
  let navHeldAt = 0, navDir = "";
  let joyWasOn = false;
  let lastHp = -1, lastUlt = false;

  const fire = (type: "keydown" | "keyup", code: string) =>
    window.dispatchEvent(new KeyboardEvent(type, { code, key: code === "Escape" ? "Escape" : code === "Enter" ? "Enter" : "", bubbles: true }));

  window.addEventListener("gamepadconnected", () => {
    connected = true;
    if (!announced) { announced = true; o.notify("🎮 <b>Controller connected</b> · press any button to use it"); }
  });
  window.addEventListener("gamepaddisconnected", () => { connected = [...(navigator.getGamepads?.() ?? [])].some(Boolean); if (!connected) active = false; });
  // Real mouse / keyboard use hands control back.
  window.addEventListener("mousemove", e => { if (e.isTrusted && (Math.abs(e.movementX) + Math.abs(e.movementY) > 2)) active = false; }, { passive: true });
  window.addEventListener("keydown", e => { if (e.isTrusted) active = false; }, true);

  function rumble(pad: Gamepad, strong: number, weak: number, ms: number) {
    if (!o.rumbleOn()) return;
    const act = (pad as Gamepad & { vibrationActuator?: { playEffect?: (t: string, p: object) => Promise<unknown> } }).vibrationActuator;
    try { void act?.playEffect?.("dual-rumble", { duration: ms, strongMagnitude: strong, weakMagnitude: weak })?.catch(() => {}); } catch { /* unsupported */ }
  }

  // ── Menu navigation: move focus to the nearest button in a direction ──
  const focusables = (root: HTMLElement) => [...root.querySelectorAll<HTMLElement>("button:not([disabled]), [data-perk], [data-buy]:not([disabled]), input, [tabindex]:not([tabindex='-1'])")]
    .filter(el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== "hidden"; });
  function nav(dir: "up" | "down" | "left" | "right") {
    const root = o.uiRoot();
    if (!root) return;
    const list = focusables(root);
    if (!list.length) return;
    const cur = document.activeElement as HTMLElement | null;
    if (!cur || !root.contains(cur) || !list.includes(cur)) { list[0].focus(); list[0].scrollIntoView({ block: "nearest" }); return; }
    const c = cur.getBoundingClientRect(), cx = c.left + c.width / 2, cy = c.top + c.height / 2;
    let best: HTMLElement | null = null, bestScore = Infinity;
    for (const el of list) {
      if (el === cur) continue;
      const r = el.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
      const dx = x - cx, dy = y - cy;
      const along = dir === "left" ? -dx : dir === "right" ? dx : dir === "up" ? -dy : dy;
      const across = dir === "left" || dir === "right" ? Math.abs(dy) : Math.abs(dx);
      if (along <= 4) continue;
      const score = along + across * 2.2;
      if (score < bestScore) { bestScore = score; best = el; }
    }
    if (best) { best.focus(); best.scrollIntoView({ block: "nearest" }); }
  }

  function poll() {
    requestAnimationFrame(poll);
    step();
  }
  function step() {
    const pads = navigator.getGamepads?.() ?? [];
    const pad = [...pads].find((p): p is Gamepad => !!p && p.connected);
    if (!pad) return;
    connected = true;
    const btn = pad.buttons.map(b => b.pressed || b.value > 0.5);
    const down = (i: number) => btn[i] && !prev[i];
    const up = (i: number) => !btn[i] && prev[i];
    const ax = (i: number) => { const v = pad.axes[i] ?? 0; return Math.abs(v) < DEAD ? 0 : v; };
    const lx = ax(0), ly = ax(1), rx = ax(2), ry = ax(3);
    const anyInput = btn.some(Boolean) || lx || ly || rx || ry;
    if (anyInput && !active) { active = true; document.body.classList.add("pad"); }
    if (!active) { prev = btn; document.body.classList.remove("pad"); return; }

    // Remap capture: the next button pressed becomes the binding.
    if (capturing) {
      const i = btn.findIndex((b, k) => b && !prev[k]);
      if (i >= 0) {
        if (i !== 1) { map[capturing] = i; saveMap(); }   // B cancels
        capturing = null; o.onCaptured();
      }
      prev = btn; return;
    }

    const g = o.getGame();
    const ui = o.uiRoot();
    if (ui) {
      // Release anything held from gameplay.
      if (joyWasOn) { g?.setInput({ joyActive: false, joyDx: 0, joyDy: 0 }); joyWasOn = false; }
      for (const a of PAD_ACTIONS) if (prev[map[a.id]] && (a.id === "attack" || a.id === "block")) fire("keyup", o.keyCode(a.id));
      // D-pad or left stick (with key-repeat style delay) moves focus.
      const dir = btn[12] || ly < -0.6 ? "up" : btn[13] || ly > 0.6 ? "down" : btn[14] || lx < -0.6 ? "left" : btn[15] || lx > 0.6 ? "right" : "";
      const now = performance.now();
      if (dir && (dir !== navDir || now - navHeldAt > (navDir === dir ? 140 : 0))) {
        if (dir !== navDir) navHeldAt = now + 260; else navHeldAt = now;
        nav(dir as "up" | "down" | "left" | "right");
      }
      navDir = dir;
      if (down(0)) {
        const el = document.activeElement as HTMLElement | null;
        if (el && ui.contains(el) && el !== document.body) el.click();
        else nav("down");
      }
      if (down(1)) fire("keydown", "Escape");
      if (down(9)) fire("keydown", "Escape");
      if (down(2) && g?.stats.state === "levelup") fire("keydown", "KeyR");   // X = reroll cards / shop
      if (down(2) && g?.stats.state === "shop") fire("keydown", "KeyR");
      prev = btn; return;
    }

    // ── Gameplay ──
    if (g) {
      const joyOn = !!(lx || ly);
      if (joyOn || joyWasOn) g.setInput({ joyActive: joyOn, joyDx: lx, joyDy: ly });
      joyWasOn = joyOn;
      const aimOn = Math.hypot(rx, ry) > 0.3;
      const G = g as unknown as { player: { pos: { x: number; y: number } }; cameraX: number; cameraY: number };
      if (aimOn) {
        const a = Math.atan2(ry, rx);
        g.setInput({ mouseAim: true, mouseX: G.player.pos.x - G.cameraX + Math.cos(a) * 220, mouseY: G.player.pos.y - G.cameraY + Math.sin(a) * 220 });
      } else {
        // Stick idle: face the move direction, and snap to the nearest foe while attacking.
        g.setInput({ mouseAim: false, aimAssist: true, attackHeld: !!btn[map.attack] });
      }

      for (const a of PAD_ACTIONS) {
        const i = map[a.id];
        if (down(i)) fire("keydown", a.id === "pause" ? o.keyCode("pause") : o.keyCode(a.id));
        if (up(i) && (a.id === "attack" || a.id === "block")) fire("keyup", o.keyCode(a.id));
      }
      // Rumble on hits taken and on ultimate.
      const s = g.stats;
      if (lastHp >= 0 && s.hp < lastHp) rumble(pad, 0.6, 0.4, 140);
      if (s.ultActive && !lastUlt) rumble(pad, 0.9, 0.7, 320);
      lastHp = s.hp; lastUlt = !!s.ultActive;
    }
    prev = btn;
  }
  requestAnimationFrame(poll);

  return {
    get connected() { return connected; },
    get active() { return active; },
    get map() { return map; },
    set map(m) { map = m; saveMap(); },
    get capturing() { return capturing; },
    set capturing(a) { capturing = a; },
    startCapture(a) { capturing = a; },
    reset() { map = { ...DEFAULT_PAD }; saveMap(); },
    tick: step,
  };
}
