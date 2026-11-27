// ─── Secret dev mode ──────────────────────────────────────────────────────────
// Unlock: type  ghostdev  anywhere (menu or mid-run). Type it again to lock.
// Once unlocked, press  `  (backquote) or click the DEV badge to open the panel.
// Any cheat used marks the run as a dev run, so it never sets a best record.
import {
  PERK_POOL, CONSUMABLES, SECONDARIES, ABILITY_POOL, BOSS_INFO,
} from "./GhostGame";
import type { GhostGame, SecondaryId, ConsumableId, EnemyArchetype, BossKind } from "./GhostGame";
import { setUnlockAll, unlockAllOn, addEmbers } from "./unlocks";
import { addFlowers } from "./cosmetics";
import { reportHTML, getTelemetry, resetTelemetry } from "./telemetry";
import { AFFIXES } from "./content/elites";
import { DUOS } from "./content/duos";
import type { AffixId } from "./content/elites";

const UNLOCK_KEY = "ghostgame.dev.v1";
const CODE = "ghostdev";

const ENEMY_KINDS: EnemyArchetype[] = [
  "normal", "heavy", "shielded", "archer", "assassin", "wisp", "priest", "bomber", "lantern", "onryo", "nue", "mirror",
];

const CSS = `
#devbadge {
  position: fixed; left: 10px; bottom: 10px; z-index: 60;
  font: 700 10px/1 ui-monospace, Menlo, monospace; letter-spacing: .12em;
  padding: 5px 9px; border-radius: 999px; cursor: pointer;
  color: #0b0a09; background: #7fdc9a; border: 0; opacity: .85;
}
#devbadge:hover { opacity: 1; }
#devpanel {
  position: fixed; top: 12px; right: 12px; bottom: 12px; width: 300px; z-index: 61;
  display: none; flex-direction: column; gap: 10px; overflow-y: auto;
  padding: 12px; border-radius: 10px;
  background: rgba(10, 14, 11, 0.94); border: 1px solid rgba(127, 220, 154, 0.35);
  color: #e6efe8; font: 12px/1.35 ui-monospace, Menlo, monospace;
  box-shadow: 0 10px 40px rgba(0,0,0,.5);
}
#devpanel.open { display: flex; }
#devpanel h3 { margin: 0; font-size: 13px; color: #7fdc9a; display: flex; justify-content: space-between; align-items: center; }
#devpanel h4 { margin: 0 0 6px; font-size: 10px; letter-spacing: .14em; text-transform: uppercase; color: #8fa596; }
#devpanel section { border-top: 1px solid rgba(255,255,255,.08); padding-top: 8px; }
#devpanel .row { display: flex; flex-wrap: wrap; gap: 5px; align-items: center; margin-bottom: 5px; }
#devpanel button, #devpanel select, #devpanel input {
  font: inherit; color: inherit; background: #18211b; border: 1px solid rgba(255,255,255,.14);
  border-radius: 6px; padding: 4px 7px; min-height: 26px;
}
#devpanel button { cursor: pointer; }
#devpanel button:hover { border-color: #7fdc9a; }
#devpanel button.on { background: #2c5a3a; border-color: #7fdc9a; }
#devpanel select { flex: 1; min-width: 0; }
#devpanel input[type=number] { width: 56px; }
#devpanel .status { color: #b8c9bd; white-space: pre-line; font-size: 11px; }
#devpanel .hint { color: #7d8f82; font-size: 10px; }
#devpanel .x { min-height: 0; padding: 2px 7px; }
#devtoast {
  position: fixed; left: 50%; top: 18px; transform: translate(-50%, -8px); z-index: 62;
  padding: 7px 12px; border-radius: 8px; pointer-events: none; opacity: 0;
  background: rgba(10, 14, 11, 0.94); border: 1px solid #7fdc9a; color: #e6efe8;
  font: 12px ui-monospace, Menlo, monospace; transition: opacity .2s, transform .2s;
}
#devtoast.show { opacity: 1; transform: translate(-50%, 0); }
#devreport {
  position: fixed; inset: 0; z-index: 63; display: none; overflow-y: auto; padding: 24px 16px;
  background: rgba(5, 8, 6, .9); color: #e6efe8; font: 13px/1.4 ui-monospace, Menlo, monospace;
}
#devreport.open { display: block; }
#devreport .dr-wrap { max-width: 900px; margin: 0 auto; background: rgba(10,14,11,.96); border: 1px solid rgba(127,220,154,.35); border-radius: 12px; padding: 18px; }
#devreport h3 { margin: 0 0 4px; color: #7fdc9a; font-size: 16px; }
#devreport h4 { margin: 18px 0 6px; font-size: 11px; letter-spacing: .14em; text-transform: uppercase; color: #8fa596; }
#devreport .dr-sub, #devreport .dr-empty { color: #8fa596; font-size: 12px; }
#devreport .dr-t { width: 100%; border-collapse: collapse; }
#devreport .dr-t th { text-align: left; color: #8fa596; font-weight: 600; font-size: 11px; padding: 4px 6px; }
#devreport .dr-t td { padding: 4px 6px; border-top: 1px solid rgba(255,255,255,.07); }
#devreport .dr-hot { color: #ffb36b; font-size: 11px; } #devreport .dr-cold { color: #7fb6dc; font-size: 11px; }
#devreport .dr-actions { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px; }
#devreport button { font: inherit; color: inherit; background: #18211b; border: 1px solid rgba(255,255,255,.14); border-radius: 6px; padding: 6px 10px; cursor: pointer; min-height: 32px; }
#devreport button:hover { border-color: #7fdc9a; }
#devreport button.danger { border-color: #d6453f; }
`;

export function initDevMode(getGame: () => GhostGame | null) {
  let unlocked = false;
  try { unlocked = localStorage.getItem(UNLOCK_KEY) === "1"; } catch { /* storage blocked */ }
  let typed = "";

  const style = document.createElement("style");
  style.textContent = CSS;
  document.head.append(style);

  const badge = document.createElement("button");
  badge.id = "devbadge";
  badge.textContent = "DEV  `";
  badge.title = "Open dev panel (`)";
  const panel = document.createElement("div");
  panel.id = "devpanel";
  const toast = document.createElement("div");
  toast.id = "devtoast";
  const report = document.createElement("div");
  report.id = "devreport";
  report.setAttribute("role", "dialog");
  report.setAttribute("aria-label", "Balance report");
  document.body.append(badge, panel, toast, report);
  let resetArmed = false;
  const renderReport = () => {
    report.innerHTML = `<div class="dr-wrap"><h3>Balance report</h3>${reportHTML()}
      <div class="dr-actions"><button data-dr="copy">Copy JSON</button>
      <button data-dr="reset" class="${resetArmed ? "danger" : ""}">${resetArmed ? "Click again to erase tracking data" : "Reset tracking data"}</button>
      <button data-dr="close">Close · Esc</button></div></div>`;
  };
  const copyJson = async () => {
    const text = JSON.stringify(getTelemetry(), null, 1);
    try { await navigator.clipboard.writeText(text); notify("Balance data copied — paste it to Claude"); }
    catch { notify("Copy blocked — select the text in the console instead"); console.log(text); }
  };
  report.addEventListener("click", e => {
    const b = (e.target as HTMLElement).closest<HTMLElement>("[data-dr]");
    if (!b) return;
    const a = b.dataset.dr;
    if (a === "close") { report.classList.remove("open"); resetArmed = false; }
    else if (a === "copy") void copyJson();
    else if (a === "reset") {
      if (resetArmed) { resetTelemetry(); resetArmed = false; notify("Tracking data erased"); } else resetArmed = true;
      renderReport();
    }
  });
  let toastTimer = 0;
  const notify = (msg: string) => {
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 1800);
  };

  const opts = (list: [string, string][]) => list.map(([v, l]) => `<option value="${v}">${l}</option>`).join("");
  const weaponOpts = opts(Object.values(SECONDARIES).map(s => [s.id, s.name]));
  const abilityOpts = opts(ABILITY_POOL.map(a => [a.id, a.name]));

  panel.innerHTML = `
    <h3>DEV MODE <button class="x" data-dev="close" title="Close (\`)">✕</button></h3>
    <div class="status" data-dev-status></div>
    <section>
      <h4>Balance data</h4>
      <div class="row"><button data-dev="report">Balance report</button><button data-dev="copyjson">Copy JSON</button></div>
      <div class="row"><button data-dev="vowsunlock">Toggle Vows unlock</button><button data-dev="unlockall">Toggle unlock all</button></div>
      <div class="row"><button data-dev="embers">+100 Spirit Embers</button><button data-dev="flowers">+200 Flowers</button></div>
    </section>
    <section>
      <h4>Toggles</h4>
      <div class="row">
        <button data-dev="god">God mode</button>
        <button data-dev="hitbox">Hitboxes</button>
      </div>
      <div class="row">Speed
        ${[0.25, 0.5, 1, 2, 4].map(v => `<button data-dev="speed" data-v="${v}">${v}×</button>`).join("")}
      </div>
    </section>
    <section>
      <h4>Player</h4>
      <div class="row">
        <button data-dev="heal">Heal</button>
        <button data-dev="lvl">+1 level</button>
        <button data-dev="lvl5">+5 levels</button>
        <button data-dev="mon">+1000 mon</button>
      </div>
      <div class="row">
        <button data-dev="ult">Fill ult</button>
        <button data-dev="cds">Reset cooldowns</button>
        <button data-dev="ammo">Refill ammo</button>
      </div>
    </section>
    <section>
      <h4>Stealth test</h4>
      <div class="row">
        <button data-dev="smoke">Smoke pellet 5s</button>
        <button data-dev="shadow">Shadow Step 4s</button>
      </div>
    </section>
    <section>
      <h4>Waves</h4>
      <div class="row">
        <button data-dev="clear">End wave → shop</button>
        <button data-dev="killall">Kill all (not bosses)</button>
        <button data-dev="win">Win now</button>
        <button data-dev="altar">Spawn altar</button>
      </div>
      <div class="row">Go to wave <input type="number" min="1" max="99" value="5" data-dev-in="wave"><button data-dev="wave">Go</button></div>
    </section>
    <section>
      <h4>Spawn</h4>
      <div class="row"><select data-dev-in="enemy">${opts(ENEMY_KINDS.map(k => [k, k]))}</select>
        <input type="number" min="1" max="30" value="1" data-dev-in="count"><button data-dev="spawn">Spawn</button></div>
      <div class="row"><select data-dev-in="boss">${opts([...Object.entries(BOSS_INFO).map(([k, b]) => [k, b.name] as [string, string]), ["final", "Final boss"]])}</select>
        <button data-dev="boss">Spawn boss</button></div>
      <div class="row"><select data-dev-in="affix">${opts([["random", "Elite: random affix"], ["double", "Elite: 2 affixes"], ...Object.values(AFFIXES).map(a => [a.id, `Elite: ${a.kanji} ${a.name}`] as [string, string])])}</select>
        <button data-dev="elite">Spawn elite</button></div>
      <div class="row"><button data-dev="chest">Drop Spirit Chest</button></div>
    </section>
    <section>
      <h4>Give</h4>
      <div class="row"><select data-dev-in="perk">${opts(PERK_POOL.map(p => [p.id, `${p.name} (${p.rarity})`]))}</select><button data-dev="perk">Give</button></div>
      <div class="row"><select data-dev-in="item">${opts(Object.values(CONSUMABLES).map(c => [c.id, c.name]))}</select><button data-dev="item">Give</button></div>
      <div class="row">W1 <select data-dev-in="w0">${weaponOpts}</select><button data-dev="w0">Equip</button></div>
      <div class="row">W2 <select data-dev-in="w1">${weaponOpts}</select><button data-dev="w1">Equip</button></div>
      <div class="row">Evolve <button data-dev="evo0">W1 now</button><button data-dev="evo1">W2 now</button><button data-dev="rdy0">Ready W1</button><button data-dev="rdy1">Ready W2</button></div>
      <div class="row"><select data-dev-in="duo">${opts(DUOS.map(d => [d.id, `Duo: ${d.name}`] as [string, string]))}</select><button data-dev="duo">Give</button></div>
      <div class="row">A1 <select data-dev-in="a0">${abilityOpts}</select><button data-dev="a0">Set</button></div>
      <div class="row">A2 <select data-dev-in="a1">${abilityOpts}</select><button data-dev="a1">Set</button></div>
    </section>
    <div class="hint">Type "ghostdev" again to lock dev mode. Dev runs don't count for best records.</div>
  `;

  const $ = <T extends HTMLElement>(sel: string) => panel.querySelector<T>(sel)!;
  const val = (k: string) => $<HTMLInputElement>(`[data-dev-in=${k}]`).value;

  const isOpen = () => panel.classList.contains("open");
  const syncSelects = () => {
    const g = getGame();
    if (!g) return;
    $<HTMLSelectElement>("[data-dev-in=w0]").value = g.stats.secondaryIds[0] ?? "katana";
    $<HTMLSelectElement>("[data-dev-in=w1]").value = g.stats.secondaryIds[1] ?? "katana";
    if (g.stats.equippedAbilities[0]) $<HTMLSelectElement>("[data-dev-in=a0]").value = g.stats.equippedAbilities[0];
    if (g.stats.equippedAbilities[1]) $<HTMLSelectElement>("[data-dev-in=a1]").value = g.stats.equippedAbilities[1];
  };
  const setOpen = (on: boolean) => {
    panel.classList.toggle("open", on && unlocked);
    if (on) syncSelects();
  };
  const refreshVisibility = () => {
    badge.style.display = unlocked ? "" : "none";
    if (!unlocked) setOpen(false);
  };
  refreshVisibility();

  // Live status + toggle highlight (cheap, 5×/s).
  setInterval(() => {
    if (!isOpen()) return;
    const g = getGame();
    const st = $("[data-dev-status]");
    if (!g) { st.textContent = "No run active — start a run to use cheats."; return; }
    const alive = g.enemies.filter(e => e.state !== "dead");
    const lost = alive.filter(e => e.lostTrack).length;
    st.textContent =
      `${g.stats.classId} · ${g.difficulty} · wave ${g.stats.wave} · lvl ${g.stats.level}\n` +
      `state ${g.stats.state} · enemies ${alive.length}${lost ? ` (${lost} searching)` : ""}\n` +
      `player ${g.playerHidden() ? "HIDDEN" : "visible"} · hp ${Math.ceil(g.player.hp)}/${Math.ceil(g.player.maxHp)}`;
    $("[data-dev=god]").classList.toggle("on", g.devGodMode);
    $("[data-dev=hitbox]").classList.toggle("on", g.devShowHitboxes);
    panel.querySelectorAll<HTMLElement>("[data-dev=speed]").forEach(b =>
      b.classList.toggle("on", Number(b.dataset.v) === g.devTimeScale));
  }, 200);

  badge.addEventListener("click", () => setOpen(!isOpen()));

  panel.addEventListener("click", e => {
    const btn = (e.target as HTMLElement).closest<HTMLElement>("[data-dev]");
    if (!btn) return;
    const act = btn.dataset.dev!;
    if (act === "close") { setOpen(false); return; }
    // Balance report doesn't need a run and doesn't count as cheating.
    if (act === "report") { resetArmed = false; renderReport(); report.classList.add("open"); return; }
    if (act === "copyjson") { void copyJson(); return; }
    if (act === "vowsunlock") {
      let on = false;
      try { on = localStorage.getItem("ghostgame.vowsDev") !== "1"; localStorage.setItem("ghostgame.vowsDev", on ? "1" : "0"); } catch { /* blocked */ }
      notify(on ? "Vows unlocked (dev) — reopen the menu" : "Vows dev unlock off");
      return;
    }
    if (act === "unlockall") { setUnlockAll(!unlockAllOn()); notify(unlockAllOn() ? "All classes & weapons unlocked (dev) — reopen the menu" : "Unlock-all off"); return; }
    if (act === "embers") { addEmbers(100); notify("+100 Spirit Embers"); return; }
    if (act === "flowers") { addFlowers(200); notify("+200 Flowers"); return; }
    const g = getGame();
    if (!g) { notify("Start a run first"); return; }
    g.devMode = true; // dev run — no records
    switch (act) {
      case "god": g.devSetGodMode(!g.devGodMode); break;
      case "hitbox": g.devShowHitboxes = !g.devShowHitboxes; break;
      case "speed": g.devToggleSpeed(Number(btn.dataset.v)); break;
      case "heal": g.devHealFull(); break;
      case "lvl": g.devLevelUp(); break;
      case "lvl5": for (let i = 0; i < 5; i++) g.devLevelUp(); break;
      case "mon": g.devAddMon(1000); break;
      case "ult": g.devFillUlt(); break;
      case "cds": g.devResetAbilityCooldowns(); break;
      case "ammo": g.devRefillAmmo(); break;
      case "smoke": g.stats.buffSmokeRemaining = 5; break;
      case "shadow": g.ultShadowStepTimer = 4; break;
      case "clear": g.devClearWave(); break;
      case "killall": g.devKillAllEnemies(); break;
      case "win": g.devWin(); break;
      case "altar": g.devSpawnAltar(); break;
      case "wave": g.devSkipToWave(Math.max(1, Math.min(99, Number(val("wave")) || 1))); break;
      case "spawn": {
        const n = Math.max(1, Math.min(30, Number(val("count")) || 1));
        for (let i = 0; i < n; i++) g.devSpawnEnemy(val("enemy") as EnemyArchetype);
        break;
      }
      case "boss": g.devSpawnBoss(val("boss") as BossKind | "final"); break;
      case "elite": g.devSpawnElite(val("enemy") as EnemyArchetype, val("affix") as AffixId | "random" | "double"); break;
      case "chest": g.devSpawnChest(); break;
      case "evo0": g.devEvolve(0); break;
      case "evo1": g.devEvolve(1); break;
      case "rdy0": g.devReadyEvolution(0); break;
      case "rdy1": g.devReadyEvolution(1); break;
      case "duo": g.devGiveDuo(val("duo")); break;
      case "perk": g.devGivePerk(val("perk")); break;
      case "item": g.devGiveItem(val("item") as ConsumableId); break;
      case "w0": g.devSetWeapon(0, val("w0") as SecondaryId); break;
      case "w1": g.devSetWeapon(1, val("w1") as SecondaryId); break;
      case "a0": g.devSetAbility(0, val("a0")); syncSelects(); break;
      case "a1": g.devSetAbility(1, val("a1")); syncSelects(); break;
    }
    btn.blur(); // keep Space/Enter from re-clicking the button during play
  });

  // Secret code + panel hotkey. Capture phase so it sees keys before the game.
  window.addEventListener("keydown", e => {
    const t = e.target as HTMLElement | null;
    if (t?.closest?.("#devpanel") && (t.tagName === "INPUT" || t.tagName === "SELECT")) return;
    if (e.key.length === 1) {
      typed = (typed + e.key.toLowerCase()).slice(-CODE.length);
      if (typed === CODE) {
        typed = "";
        unlocked = !unlocked;
        try { localStorage.setItem(UNLOCK_KEY, unlocked ? "1" : "0"); } catch { /* storage blocked */ }
        refreshVisibility();
        notify(unlocked ? "Dev mode unlocked — press ` to open" : "Dev mode locked");
        if (unlocked) setOpen(true);
      }
    }
    if (report.classList.contains("open") && e.code === "Escape") {
      e.preventDefault(); e.stopPropagation();
      report.classList.remove("open"); resetArmed = false;
      return;
    }
    if (unlocked && e.code === "Backquote" && !e.repeat) {
      e.preventDefault();
      e.stopPropagation();
      setOpen(!isOpen());
    }
  }, true);
}
