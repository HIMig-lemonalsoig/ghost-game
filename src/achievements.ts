// ─── Achievements ─────────────────────────────────────────────────────────────
// Six tiers, from things everyone gets in their first run (Common) to feats
// almost nobody will ever pull off (Mythic). Unlocks are saved per browser.
// Lifetime goals read career totals; run goals read the live run. Runs that
// touched dev mode never unlock anything.
import { CLASSES } from "./GhostGame";
import { AFFIX_IDS } from "./content/elites";
import { EVOLUTIONS } from "./content/evolutions";
import { DUOS } from "./content/duos";
const EVO_COUNT = Object.keys(EVOLUTIONS).length;
const evolvedKinds = (x: AchCtx) => Object.keys(x.c.evolvedBy ?? {}).length;
const duoKinds = (x: AchCtx) => Object.keys(x.c.duosBy ?? {}).length;
import type { GameStats, RunCounters, Difficulty } from "./GhostGame";
import type { Career } from "./career";

export type Tier = "common" | "uncommon" | "rare" | "epic" | "legendary" | "mythic";
export const TIERS: Record<Tier, { name: string; color: string; order: number }> = {
  common:    { name: "Common",    color: "#b9b1a0", order: 0 },
  uncommon:  { name: "Uncommon",  color: "#6fcf8e", order: 1 },
  rare:      { name: "Rare",      color: "#6aa8ff", order: 2 },
  epic:      { name: "Epic",      color: "#b197fc", order: 3 },
  legendary: { name: "Legendary", color: "#f4c842", order: 4 },
  mythic:    { name: "Mythic",    color: "#ff4d6d", order: 5 },
};

export interface AchCtx {
  c: Career;                    // lifetime totals (live during a run)
  r: RunCounters | null;        // current run (null on the menu)
  s: GameStats | null;
  diff: Difficulty | null;
  fresh: boolean;               // current run was started fresh (not Continued)
}
interface Ach {
  id: string; tier: Tier; kanji: string; name: string; desc: string;
  check: (x: AchCtx) => boolean;
  progress?: (x: AchCtx) => [number, number];
}

const DIFF_RANK: Record<Difficulty, number> = { easy: 0, medium: 1, normal: 2, hard: 3, death: 4 };
const atLeast = (x: AchCtx, d: Difficulty) => !!x.diff && DIFF_RANK[x.diff] >= DIFF_RANK[d];
const wave = (x: AchCtx) => Math.max(x.c.highestWave, x.s?.wave ?? 0);
const bestOn = (x: AchCtx, ...ds: Difficulty[]) => Math.max(0, ...ds.map(d => x.c.bestWaveByDiff?.[d] ?? 0));
const classesPlayed = (x: AchCtx) => Object.values(x.c.byClass).filter(v => v.runs > 0).length;
const runBossFinal = (x: AchCtx) => (x.r?.bossByKind.final ?? 0) > 0;

const total = (field: keyof Career, n: number) => ({
  check: (x: AchCtx) => (x.c[field] as number) >= n,
  progress: (x: AchCtx): [number, number] => [Math.min(n, x.c[field] as number), n],
});
const reachWave = (n: number) => ({ check: (x: AchCtx) => wave(x) >= n, progress: (x: AchCtx): [number, number] => [Math.min(n, wave(x)), n] });
const runMax = (field: keyof RunCounters, n: number) => ({ check: (x: AchCtx) => ((x.r?.[field] as number) ?? 0) >= n });

export const ACHIEVEMENTS: Ach[] = [
  // ── Common ──
  { id: "first_blood", tier: "common", kanji: "一", name: "First Blood", desc: "Kill your first enemy.", ...total("kills", 1) },
  { id: "survivor", tier: "common", kanji: "生", name: "Still Standing", desc: "Survive your first wave.", ...total("wavesCleared", 1) },
  { id: "customer", tier: "common", kanji: "買", name: "Customer", desc: "Buy something from the merchant.", ...runMax("purchases", 1) },
  { id: "unleashed", tier: "common", kanji: "解", name: "Unleashed", desc: "Use an ultimate.", ...total("ults", 1) },
  { id: "silent", tier: "common", kanji: "忍", name: "Silent Blade", desc: "Get a stealth kill on an enemy that hasn't seen you (or is lost in smoke).", ...total("stealthKills", 1) },
  { id: "centurion", tier: "common", kanji: "百", name: "Centurion", desc: "Kill 100 enemies in total.", ...total("kills", 100) },
  { id: "wave5", tier: "common", kanji: "五", name: "Getting Started", desc: "Reach wave 5.", ...reachWave(5) },
  { id: "elite_first", tier: "common", kanji: "精", name: "Elite Slayer", desc: "Kill an elite enemy (glowing outline and a name tag).", ...total("eliteKills", 1) },
  { id: "quick_feet", tier: "common", kanji: "走", name: "Quick Feet", desc: "Dash 100 times in total.", ...total("dashes", 100) },

  // ── Uncommon ──
  { id: "boss_slayer", tier: "uncommon", kanji: "鬼", name: "Boss Slayer", desc: "Slay a boss.", ...total("bossKills", 1) },
  { id: "wave10", tier: "uncommon", kanji: "十", name: "Seasoned", desc: "Reach wave 10.", ...reachWave(10) },
  { id: "level10", tier: "uncommon", kanji: "昇", name: "Rising Star", desc: "Reach level 10 in a single run.", check: x => Math.max(x.c.highestLevel, x.s?.level ?? 0) >= 10 },
  { id: "flawless", tier: "uncommon", kanji: "完", name: "Flawless", desc: "Clear a wave without taking any damage.", ...runMax("flawlessWaves", 1) },
  { id: "multi5", tier: "uncommon", kanji: "連", name: "Chain Reaction", desc: "Kill 5 enemies within half a second.", ...runMax("bestMultiKill", 5) },
  { id: "thousand", tier: "uncommon", kanji: "千", name: "Thousand Cuts", desc: "Kill 1,000 enemies in total.", ...total("kills", 1000) },
  { id: "ghost25", tier: "uncommon", kanji: "影", name: "Ghost of the Arena", desc: "Get 25 stealth kills in total.", ...total("stealthKills", 25) },
  { id: "wanderer", tier: "uncommon", kanji: "旅", name: "Wanderer", desc: "Play 3 different classes.", check: x => classesPlayed(x) >= 3, progress: x => [Math.min(3, classesPlayed(x)), 3] },
  { id: "stocked", tier: "uncommon", kanji: "薬", name: "Well Stocked", desc: "Use 25 items in total.", ...total("items", 25) },

  { id: "evolved", tier: "uncommon", kanji: "進", name: "Evolution", desc: "Evolve a weapon (Mastery 3 + its catalyst + a Spirit Chest).", check: x => evolvedKinds(x) >= 1 },
  { id: "exorcist", tier: "uncommon", kanji: "祓", name: "Exorcist", desc: "Banish 25 Onryō in total.",
    check: x => (x.c.killsByKind?.onryo ?? 0) >= 25,
    progress: x => [Math.min(25, (x.c.killsByKind?.onryo ?? 0)), 25] },
  { id: "double_trouble", tier: "uncommon", kanji: "双", name: "Double Trouble", desc: "Kill an elite with two affixes (from wave 18).", ...runMax("doubleEliteKills", 1) },

  // ── Rare ──
  { id: "wave20", tier: "rare", kanji: "廿", name: "Veteran", desc: "Reach wave 20.", ...reachWave(20) },
  { id: "yokai_hunter", tier: "rare", kanji: "四", name: "Yokai Hunter", desc: "Slay all four bosses: Oni, Kitsune, Gashadokuro and Raijin.",
    check: x => ["oni", "kitsune", "gasha", "raijin"].every(k => (x.c.bossByKind[k] ?? 0) > 0),
    progress: x => [["oni", "kitsune", "gasha", "raijin"].filter(k => (x.c.bossByKind[k] ?? 0) > 0).length, 4] },
  { id: "multi10", tier: "rare", kanji: "嵐", name: "Massacre", desc: "Kill 10 enemies within half a second.", ...runMax("bestMultiKill", 10) },
  { id: "overkill", tier: "rare", kanji: "極", name: "Overkill", desc: "Kill 15 enemies with a single ultimate.", ...runMax("bestUltKills", 15) },
  { id: "hardened", tier: "rare", kanji: "難", name: "Hardened", desc: "Reach wave 10 on Hard or Death.",
    check: x => bestOn(x, "hard", "death") >= 10 || (atLeast(x, "hard") && (x.s?.wave ?? 0) >= 10) },
  { id: "hoarder", tier: "rare", kanji: "富", name: "Hoarder", desc: "Hold 1,500 coins at once.", ...runMax("maxMon", 1500) },
  { id: "executioner", tier: "rare", kanji: "斬", name: "Executioner", desc: "Kill 5,000 enemies in total.", ...total("kills", 5000) },
  { id: "level20", tier: "rare", kanji: "昂", name: "Ascendant", desc: "Reach level 20 in a single run.", check: x => Math.max(x.c.highestLevel, x.s?.level ?? 0) >= 20 },
  { id: "elite_hunter", tier: "rare", kanji: "狩", name: "Elite Hunter", desc: "Kill an elite with each of the 8 affixes.",
    check: x => AFFIX_IDS.every(a => (x.c.eliteByAffix?.[a] ?? 0) > 0),
    progress: x => [AFFIX_IDS.filter(a => (x.c.eliteByAffix?.[a] ?? 0) > 0).length, AFFIX_IDS.length] },
  { id: "duo_first", tier: "rare", kanji: "双", name: "Better Together", desc: "Take a duo perk (own the two perks it needs, then it can show up at level-up).", check: x => duoKinds(x) >= 1 },
  { id: "nip_bud", tier: "rare", kanji: "芽", name: "Nip It in the Bud", desc: "Kill a Nue before it summons any wisps.", ...runMax("nueFirstStrike", 1) },
  { id: "treasure", tier: "rare", kanji: "宝", name: "Treasure Hunter", desc: "Open 25 Spirit Chests in total.", ...total("chests", 25) },
  { id: "clutch", tier: "rare", kanji: "危", name: "By a Thread", desc: "Clear a wave with 3 HP or less.", ...runMax("clutchWaves", 1) },

  // ── Epic ──
  { id: "wave30", tier: "epic", kanji: "卅", name: "Unbroken", desc: "Reach wave 30.", ...reachWave(30) },
  { id: "kingslayer", tier: "epic", kanji: "王", name: "Kingslayer", desc: "Slay the Final Boss (first appears on wave 25).",
    check: x => (x.c.bossByKind.final ?? 0) > 0 },
  { id: "untouched_duel", tier: "epic", kanji: "静", name: "Untouched Duel", desc: "Clear a boss wave without taking any damage.", ...runMax("flawlessBossWaves", 1) },
  { id: "trial_by_fire", tier: "epic", kanji: "修", name: "Trial by Fire", desc: "Reach wave 20 on Hard or Death.",
    check: x => bestOn(x, "hard", "death") >= 20 || (atLeast(x, "hard") && (x.s?.wave ?? 0) >= 20) },
  { id: "shatter", tier: "epic", kanji: "砕", name: "Shatter", desc: "Deal 300 damage with a single hit.", ...total("biggestHit", 300) },
  { id: "master_of_many", tier: "epic", kanji: "衆", name: "Master of Many", desc: `Play every class (${CLASSES.length}).`,
    check: x => classesPlayed(x) >= CLASSES.length, progress: x => [Math.min(CLASSES.length, classesPlayed(x)), CLASSES.length] },
  { id: "in_the_zone", tier: "epic", kanji: "心", name: "In the Zone", desc: "Clear 3 waves in a row without taking damage.", ...runMax("bestFlawlessStreak", 3) },
  { id: "arsenal", tier: "epic", kanji: "庫", name: "Arsenal", desc: "Evolve 8 different weapons.", check: x => evolvedKinds(x) >= 8, progress: x => [Math.min(8, evolvedKinds(x)), 8] },
  { id: "marathon", tier: "epic", kanji: "時", name: "Marathon", desc: "Play for 5 hours in total.",
    check: x => x.c.time >= 5 * 3600, progress: x => [Math.min(300, Math.floor(x.c.time / 60)), 300] },

  // ── Legendary ──
  { id: "wave40", tier: "legendary", kanji: "伝", name: "Living Legend", desc: "Reach wave 40.", ...reachWave(40) },
  { id: "deathwalker", tier: "legendary", kanji: "死", name: "Deathwalker", desc: "Reach wave 15 on Death difficulty.",
    check: x => bestOn(x, "death") >= 15 || (x.diff === "death" && (x.s?.wave ?? 0) >= 15) },
  { id: "ten_thousand", tier: "legendary", kanji: "万", name: "Ten Thousand Blades", desc: "Kill 10,000 enemies in total.", ...total("kills", 10000) },
  { id: "untouchable", tier: "legendary", kanji: "空", name: "Untouchable", desc: "Clear 5 waves in a row without taking damage.", ...runMax("bestFlawlessStreak", 5) },
  { id: "tyrants_end", tier: "legendary", kanji: "覇", name: "Tyrant's End", desc: "Slay the Final Boss on Hard or Death.", check: x => atLeast(x, "hard") && runBossFinal(x) },
  { id: "master_smith", tier: "legendary", kanji: "鍛", name: "Master Smith", desc: `Evolve every weapon (${EVO_COUNT}).`, check: x => evolvedKinds(x) >= EVO_COUNT, progress: x => [evolvedKinds(x), EVO_COUNT] },
  { id: "harmony", tier: "legendary", kanji: "和", name: "Perfect Harmony", desc: `Take every duo perk (${DUOS.length}).`, check: x => duoKinds(x) >= DUOS.length, progress: x => [duoKinds(x), DUOS.length] },
  { id: "annihilation", tier: "legendary", kanji: "滅", name: "Annihilation", desc: "Kill 20 enemies within half a second.", ...runMax("bestMultiKill", 20) },

  // ── Mythic (insanely rare) ──
  { id: "eternal", tier: "mythic", kanji: "永", name: "Eternal", desc: "Reach wave 50.", ...reachWave(50) },
  { id: "deaths_equal", tier: "mythic", kanji: "冥", name: "Death's Equal", desc: "Slay the Final Boss on Death difficulty.", check: x => x.diff === "death" && runBossFinal(x) },
  { id: "ghost", tier: "mythic", kanji: "幽", name: "Ghost", desc: "Clear 10 waves in a row without taking damage.", ...runMax("bestFlawlessStreak", 10) },
  { id: "empty_hand", tier: "mythic", kanji: "禅", name: "Empty Hand", desc: "Reach wave 20 without buying anything from the merchant (in one fresh run).",
    check: x => x.fresh && !!x.r && !!x.s && x.r.purchases === 0 && x.s.wave >= 20 },
  { id: "beyond_death", tier: "mythic", kanji: "超", name: "Beyond Death", desc: "Reach wave 30 on Death difficulty.",
    check: x => bestOn(x, "death") >= 30 || (x.diff === "death" && (x.s?.wave ?? 0) >= 30) },
];
// The capstone: everything else.
ACHIEVEMENTS.push({
  id: "master", tier: "mythic", kanji: "極", name: "Ghost Game Master", desc: "Unlock every other achievement.",
  check: () => ACHIEVEMENTS.every(a => a.id === "master" || !!unlocked[a.id]),
  progress: () => [ACHIEVEMENTS.filter(a => a.id !== "master" && unlocked[a.id]).length, ACHIEVEMENTS.length - 1],
});

// ─── Storage ──────────────────────────────────────────────────────────────────
const KEY = "ghostgame.ach.v1";
let unlocked: Record<string, number> = {};
try { unlocked = JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch { unlocked = {}; }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(unlocked)); } catch { /* storage blocked */ } };

export const isUnlocked = (id: string) => !!unlocked[id];
export const unlockedCount = () => ACHIEVEMENTS.filter(a => unlocked[a.id]).length;
export function resetAchievements() { unlocked = {}; save(); }

/** Check every locked achievement; returns the ones that just unlocked. */
export function checkAchievements(x: AchCtx): Ach[] {
  const fresh: Ach[] = [];
  for (let pass = 0; pass < 2; pass++) {          // 2nd pass lets the capstone pop in the same check
    for (const a of ACHIEVEMENTS) {
      if (unlocked[a.id]) continue;
      let ok = false;
      try { ok = a.check(x); } catch { ok = false; }
      if (ok) { unlocked[a.id] = Date.now(); fresh.push(a); }
    }
  }
  if (fresh.length) save();
  return fresh;
}

// ─── UI ───────────────────────────────────────────────────────────────────────
const tierOrder = (Object.keys(TIERS) as Tier[]).sort((a, b) => TIERS[a].order - TIERS[b].order);

export function achievementsHTML(x: AchCtx): string {
  const done = unlockedCount();
  const chips = tierOrder.map(t => {
    const list = ACHIEVEMENTS.filter(a => a.tier === t);
    const got = list.filter(a => unlocked[a.id]).length;
    return `<span class="ach-chip" style="--tc:${TIERS[t].color}">${TIERS[t].name} <b class="num">${got}/${list.length}</b></span>`;
  }).join("");
  const sections = tierOrder.map(t => {
    const cards = ACHIEVEMENTS.filter(a => a.tier === t).map(a => {
      const on = !!unlocked[a.id];
      const prog = !on && a.progress ? a.progress(x) : null;
      return `<div class="ach-card${on ? " on" : ""}${t === "mythic" ? " mythic" : ""}" style="--tc:${TIERS[t].color}">
        <span class="ach-k kanji" aria-hidden="true">${a.kanji}</span>
        <div class="ach-t">
          <div class="ach-n">${a.name}${on ? ` <span class="ach-check" aria-label="Unlocked">✓</span>` : ""}</div>
          <div class="ach-d">${a.desc}</div>
          ${prog ? `<div class="ach-p"><i style="width:${(prog[0] / prog[1]) * 100}%"></i></div><div class="ach-pn num">${prog[0].toLocaleString()} / ${prog[1].toLocaleString()}</div>` : ""}
          ${on ? `<div class="ach-pn">Unlocked ${new Date(unlocked[a.id]).toLocaleDateString()}</div>` : ""}
        </div></div>`;
    }).join("");
    return `<section class="ach-sec"><h4 style="color:${TIERS[t].color}">${TIERS[t].name}</h4><div class="ach-grid">${cards}</div></section>`;
  }).join("");
  return `<div class="panel ach-panel" style="text-align:left">
    <div class="panel-title" style="text-align:center">ACHIEVEMENTS</div>
    <div class="panel-sub num" style="text-align:center">${done} / ${ACHIEVEMENTS.length} unlocked</div>
    <div class="ach-chips">${chips}</div>
    ${sections}
    <div class="panel-actions"><button class="btn primary" data-act="closeach">Close · Esc</button></div>
  </div>`;
}

export function achToastHTML(a: Ach): string {
  return `<div class="ach-toast${a.tier === "mythic" ? " mythic" : ""}" style="--tc:${TIERS[a.tier].color}" role="status">
    <span class="ach-k kanji" aria-hidden="true">${a.kanji}</span>
    <div><div class="ach-tl">Achievement · ${TIERS[a.tier].name}</div><div class="ach-n">${a.name}</div><div class="ach-d">${a.desc}</div></div>
  </div>`;
}

export const ACH_CSS = `
.ach-panel { max-width: 1000px; }
.ach-chips { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; margin: 14px 0 6px; }
.ach-chip { font-size: 12px; padding: 4px 10px; border-radius: 999px; border: 1px solid var(--tc); color: var(--tc); background: rgba(0,0,0,.25); }
.ach-chip b { color: var(--bone); margin-left: 4px; }
.ach-sec { margin-top: 18px; }
.ach-sec h4 { font-size: 11px; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px; }
.ach-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 8px; }
.ach-card { display: flex; gap: 12px; align-items: flex-start; padding: 12px; border-radius: 12px;
  background: var(--surface-2); border: 1px solid var(--line); }
.ach-card.on { border-color: color-mix(in srgb, var(--tc) 55%, transparent); background: color-mix(in srgb, var(--tc) 8%, var(--surface-2)); }
.ach-k { flex: none; width: 42px; height: 42px; border-radius: 10px; display: grid; place-items: center; font-size: 22px;
  color: var(--dim); background: rgba(0,0,0,.35); border: 1px solid var(--line); }
.ach-card.on .ach-k, .ach-toast .ach-k { color: var(--tc); border-color: var(--tc); box-shadow: 0 0 14px color-mix(in srgb, var(--tc) 35%, transparent); }
.ach-t { min-width: 0; flex: 1; }
.ach-n { font-weight: 700; font-size: 14px; color: var(--bone); }
.ach-card:not(.on) .ach-n { color: var(--muted); }
.ach-check { color: var(--tc); }
.ach-d { font-size: 12.5px; color: var(--muted); line-height: 1.4; margin-top: 2px; }
.ach-p { height: 5px; border-radius: 99px; background: rgba(0,0,0,.4); margin-top: 8px; overflow: hidden; }
.ach-p i { display: block; height: 100%; background: var(--tc); border-radius: 99px; }
.ach-pn { font-size: 11px; color: var(--dim); margin-top: 4px; }
.ach-card.mythic.on, .ach-toast.mythic { border-image: linear-gradient(120deg, #ff4d6d, #f4c842, #b197fc, #6aa8ff, #ff4d6d) 1; animation: achglow 3s linear infinite; }
@keyframes achglow { 50% { box-shadow: 0 0 22px rgba(255, 77, 109, .35); } }
#ach-toasts { position: fixed; top: 72px; right: 16px; z-index: 45; display: grid; gap: 8px; pointer-events: none; width: min(340px, calc(100vw - 32px)); }
.ach-toast { display: flex; gap: 12px; align-items: center; padding: 12px 14px; border-radius: 12px;
  background: rgba(14, 11, 9, .95); border: 1px solid var(--tc); box-shadow: 0 10px 30px rgba(0,0,0,.5);
  animation: achin .3s var(--ease) both; }
.ach-toast.out { animation: achout .2s ease-in both; }
.ach-tl { font-size: 10px; letter-spacing: 1.6px; text-transform: uppercase; color: var(--tc); font-weight: 700; }
@keyframes achin { from { opacity: 0; transform: translateX(24px); } }
@keyframes achout { to { opacity: 0; transform: translateX(24px); } }
@media (prefers-reduced-motion: reduce) { .ach-toast, .ach-toast.out, .ach-card.mythic.on { animation: none; } }
`;
