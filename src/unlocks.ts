// ─── Unlocks across runs (Phase 11) ───────────────────────────────────────────
// Sideways unlocks: new players start with 8 classes and 8 weapons; the rest
// open up from milestones you'd hit anyway. Anything you've already played is
// unlocked for good, so old saves never lose anything.
//
// Shrine of Ancestors: Spirit Embers earned each run buy small, capped upgrades.
// Every node has an alternate version you can switch to, and the whole shrine
// can be switched off.
import { CLASSES, getClass, SECONDARIES, CLASS_WEAPON_OPTIONS } from "./GhostGame";
import type { ClassId, SecondaryId, MetaBonus } from "./GhostGame";
import { getCareer, totalWins } from "./career";
import type { Career } from "./career";
import { getTelemetry } from "./telemetry";

const UNLOCK_KEY = "ghostgame.unlocks.v1";
const SHRINE_KEY = "ghostgame.shrine.v1";

const read = <T>(k: string, d: T): T => { try { const r = localStorage.getItem(k); return r ? { ...d, ...JSON.parse(r) } : d; } catch { return d; } };
const write = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage blocked */ } };

// ─── Milestones ───────────────────────────────────────────────────────────────
interface Req { desc: string; check: (c: Career) => boolean; progress?: (c: Career) => [number, number]; }
const classWave = (cls: ClassId, n: number): Req => ({
  desc: `Reach wave ${n} with ${getClass(cls).name}`,
  check: c => (c.byClass[cls]?.bestWave ?? 0) >= n,
  progress: c => [Math.min(n, c.byClass[cls]?.bestWave ?? 0), n],
});
const anyWave = (n: number): Req => ({ desc: `Reach wave ${n} with any class`, check: c => c.highestWave >= n, progress: c => [Math.min(n, c.highestWave), n] });
const count = (desc: string, n: number, get: (c: Career) => number): Req => ({ desc, check: c => get(c) >= n, progress: c => [Math.min(n, get(c)), n] });
const sum = (m: Record<string, number> | undefined) => Object.values(m ?? {}).reduce((a, b) => a + b, 0);

export const STARTER_CLASSES: ClassId[] = ["kensei", "shinobi", "ronin", "yamabushi", "onna", "berserker", "samurai", "arashi"];
export const CLASS_REQS: Partial<Record<ClassId, Req>> = {
  dokkaebi:   anyWave(5),
  kagemusha:  count("Kill 300 enemies", 300, c => c.kills),
  tetsubo:    classWave("berserker", 8),
  hatamoto:   classWave("samurai", 10),
  kunoichi:   classWave("shinobi", 10),
  onmyoji:    count("Kill 25 elites", 25, c => c.eliteKills),
  tsuchigumo: count("Open 10 Spirit Chests", 10, c => c.chests),
  miko:       anyWave(12),
  kagebushi:  classWave("kagemusha", 10),
  kitsune:    count("Defeat the Nine-Tailed Witch", 1, c => c.bossByKind.kitsune ?? 0),
  raijin:     count("Defeat the Thunder General", 1, c => c.bossByKind.raijin ?? 0),
  yukionna:   count("Evolve a weapon", 1, c => sum(c.evolvedBy)),
  sohei:      classWave("yamabushi", 10),
  ashigaru:   count("Kill 1,000 enemies", 1000, c => c.kills),
  kappa:      count("Get a duo perk", 1, c => sum(c.duosBy)),
  tengu:      anyWave(15),
  kabuki:     count("Win a run (beat the Final Boss)", 1, c => totalWins(c)),
  teppo:      classWave("arashi", 10),
  takajo:     count("Kill 1,500 enemies", 1500, c => c.kills),
  karakuri:   count("Open 25 Spirit Chests", 25, c => c.chests),
  bakuto:     anyWave(18),
  rikishi:    classWave("tetsubo", 10),
  sumie:      classWave("onmyoji", 10),
};
export const WEAPON_REQS: Partial<Record<SecondaryId, Req>> = {
  tessen:         anyWave(5),
  ono:            count("Defeat 3 bosses", 3, c => c.bossKills),
  shuriken_wheel: count("Kill 500 enemies", 500, c => c.kills),
  flame_spear:    count("Open 5 Spirit Chests", 5, c => c.chests),
  blowgun:        classWave("shinobi", 8),
  twin_sai:       classWave("ronin", 10),
  odachi:         classWave("berserker", 10),
};

interface UnlockSave { classes: string[]; weapons: string[]; all?: boolean; }
let saved = read<UnlockSave>(UNLOCK_KEY, { classes: [], weapons: [] });

/** Classes / weapons you'd already used before unlocks existed stay open. */
function grandfather(): boolean {
  let changed = false;
  const c = getCareer();
  for (const [id, row] of Object.entries(c.byClass)) if (row.runs > 0 && !saved.classes.includes(id)) { saved.classes.push(id); changed = true; }
  for (const [w, n] of Object.entries(getTelemetry().startWeapons)) if (n > 0 && !saved.weapons.includes(w)) { saved.weapons.push(w); changed = true; }
  return changed;
}
if (grandfather()) write(UNLOCK_KEY, saved);

export const classUnlocked = (id: ClassId) => !!saved.all || !CLASS_REQS[id] || saved.classes.includes(id);
export const weaponUnlocked = (id: SecondaryId) => !!saved.all || !WEAPON_REQS[id] || saved.weapons.includes(id);
/** A class's first two weapons are always usable so every class can start. */
export const weaponUsable = (cls: ClassId, id: SecondaryId) => CLASS_WEAPON_OPTIONS[cls].indexOf(id) < 2 || weaponUnlocked(id);
export const unlockedClassCount = () => CLASSES.filter(c => classUnlocked(c.id)).length;
export const unlockedWeaponCount = () => (Object.keys(SECONDARIES) as SecondaryId[]).filter(weaponUnlocked).length;
export const totalWeaponCount = () => Object.keys(SECONDARIES).length;

export interface NewUnlock { kind: "class" | "weapon"; id: string; name: string; kanji: string; }

/** Check milestones against the (live) career. Returns anything newly unlocked. */
export function checkUnlocks(c: Career): NewUnlock[] {
  const out: NewUnlock[] = [];
  for (const [id, req] of Object.entries(CLASS_REQS) as [ClassId, Req][]) {
    if (saved.classes.includes(id) || !req.check(c)) continue;
    saved.classes.push(id);
    const cls = getClass(id);
    out.push({ kind: "class", id, name: cls.name, kanji: cls.kanji });
  }
  for (const [id, req] of Object.entries(WEAPON_REQS) as [SecondaryId, Req][]) {
    if (saved.weapons.includes(id) || !req.check(c)) continue;
    saved.weapons.push(id);
    out.push({ kind: "weapon", id, name: SECONDARIES[id].name, kanji: SECONDARIES[id].kanji });
  }
  if (out.length) write(UNLOCK_KEY, saved);
  return out;
}

export function reqText(r: Req | undefined, c: Career = getCareer()): string {
  if (!r) return "";
  const p = r.progress?.(c);
  return p && p[1] > 1 ? `${r.desc} (${p[0].toLocaleString()}/${p[1].toLocaleString()})` : r.desc;
}

/** Real unlock counts (ignore the dev unlock-all switch) for achievements. */
export const earnedClassCount = () => CLASSES.filter(c => !CLASS_REQS[c.id] || saved.classes.includes(c.id)).length;
export const earnedWeaponCount = () => (Object.keys(SECONDARIES) as SecondaryId[]).filter(w => !WEAPON_REQS[w] || saved.weapons.includes(w)).length;

export function setUnlockAll(on: boolean) { saved.all = on; write(UNLOCK_KEY, saved); }
export const unlockAllOn = () => !!saved.all;

export function unlockToastHTML(u: NewUnlock): string {
  return `<div class="ach-toast" style="--tc:hsl(42 90% 62%)" role="status">
    <span class="ach-k kanji" aria-hidden="true">${u.kanji}</span>
    <div><div class="ach-tl">Unlocked · ${u.kind === "class" ? "New class" : "New weapon"}</div><div class="ach-n">${u.name}</div><div class="ach-d">${u.kind === "class" ? "Pick it on the class select screen." : "Pick it as a starting weapon on classes that can use it."}</div></div>
  </div>`;
}

// ─── Shrine of Ancestors ──────────────────────────────────────────────────────
export type NodeId = "fortune" | "purse" | "chest" | "provisions" | "vitality" | "swift" | "focus" | "lore" | "merchant" | "ancestor";
export interface ShrineNode {
  id: NodeId; kanji: string; name: string; max: number; cost: number[];
  a: { name: string; desc: (r: number) => string };
  b: { name: string; desc: (r: number) => string };
}
export const SHRINE: ShrineNode[] = [
  { id: "fortune",    kanji: "籤", name: "Fortune",     max: 2, cost: [20, 45],
    a: { name: "Reroller",   desc: r => `+${r} level-up reroll${r > 1 ? "s" : ""} each run` },
    b: { name: "Exile",      desc: r => `+${r} level-up banish${r > 1 ? "es" : ""} each run` } },
  { id: "purse",      kanji: "文", name: "Purse",       max: 3, cost: [15, 30, 50],
    a: { name: "Nest Egg",   desc: r => `Start each run with ${15 * r} coins` },
    b: { name: "Thrift",     desc: r => `+${5 * r}% coins earned` } },
  { id: "chest",      kanji: "宝", name: "Spirit Chests", max: 2, cost: [20, 40],
    a: { name: "Blessed",    desc: r => `Spirit Chests heal ${5 * r}% more HP` },
    b: { name: "Gilded",     desc: r => `Spirit Chests give ${25 * r}% more coins` } },
  { id: "provisions", kanji: "糧", name: "Provisions",  max: 1, cost: [35],
    a: { name: "Lucky Pack", desc: () => "Start each run with a random item" },
    b: { name: "Rations",    desc: () => "Start each run with 2 Rice Balls" } },
  { id: "vitality",   kanji: "命", name: "Vitality",    max: 3, cost: [15, 30, 50],
    a: { name: "Sturdy",     desc: r => `+${5 * r} max HP` },
    b: { name: "Hardened",   desc: r => `Take ${3 * r}% less damage` } },
  { id: "swift",      kanji: "迅", name: "Swiftness",   max: 2, cost: [20, 40],
    a: { name: "Fleet",      desc: r => `+${3 * r}% move speed` },
    b: { name: "Blink",      desc: r => `Dash recharges ${6 * r}% faster` } },
  { id: "focus",      kanji: "極", name: "Focus",       max: 2, cost: [25, 50],
    a: { name: "Ready",      desc: r => `Start each run with ${20 * r}% ultimate charge` },
    b: { name: "Kindled",    desc: r => `Ultimate charges ${5 * r}% faster` } },
  { id: "lore",       kanji: "学", name: "Lore",        max: 3, cost: [15, 30, 50],
    a: { name: "Scholar",    desc: r => `+${5 * r}% XP` },
    b: { name: "Ascetic",    desc: r => `Skipping a level-up card pays ${40 * r}% more` } },
  { id: "merchant",   kanji: "商", name: "Merchant",    max: 2, cost: [20, 40],
    a: { name: "Haggler",    desc: r => `Shop items ${5 * r}% cheaper` },
    b: { name: "Browser",    desc: r => `Shop rerolls ${25 * r}% cheaper` } },
  { id: "ancestor",   kanji: "祖", name: "Ancestor's Hand", max: 1, cost: [60],
    a: { name: "Second Life", desc: () => "Once per run, survive a killing blow at 1 HP" },
    b: { name: "Trophy",      desc: () => "Heal 25% HP whenever you slay a boss" } },
];
export const SHRINE_BY_ID = Object.fromEntries(SHRINE.map(n => [n.id, n])) as Record<NodeId, ShrineNode>;

interface ShrineSave { embers: number; spent: number; earned: number; ranks: Partial<Record<NodeId, number>>; alt: Partial<Record<NodeId, boolean>>; off: boolean; seeded?: boolean; }
let shrine = read<ShrineSave>(SHRINE_KEY, { embers: 0, spent: 0, earned: 0, ranks: {}, alt: {}, off: false });
const saveShrine = () => write(SHRINE_KEY, shrine);

// Existing players get embers for the runs they've already played (once).
if (!shrine.seeded) {
  const c = getCareer();
  const back = Math.min(300, Math.floor(c.waveSum / 2 + c.bossKills * 3));
  shrine.embers += back; shrine.earned += back; shrine.seeded = true;
  saveShrine();
}

export const getShrine = () => shrine;
export const nodeRank = (id: NodeId) => Math.min(SHRINE_BY_ID[id].max, shrine.ranks[id] ?? 0);
export const nodeCost = (id: NodeId) => { const r = nodeRank(id); return r >= SHRINE_BY_ID[id].max ? 0 : SHRINE_BY_ID[id].cost[r]; };
export const maxedNodes = () => SHRINE.filter(n => nodeRank(n.id) >= n.max).length;

export function buyNode(id: NodeId): boolean {
  const cost = nodeCost(id);
  if (!cost || shrine.embers < cost) return false;
  shrine.embers -= cost; shrine.spent += cost;
  shrine.ranks[id] = nodeRank(id) + 1;
  saveShrine();
  return true;
}
export function toggleAlt(id: NodeId) { shrine.alt[id] = !shrine.alt[id]; saveShrine(); }
export function setShrineOff(off: boolean) { shrine.off = off; saveShrine(); }
/** Refund everything (free respec). */
export function refundShrine() { shrine.embers += shrine.spent; shrine.spent = 0; shrine.ranks = {}; saveShrine(); }
export function addEmbers(n: number) { if (n <= 0) return; shrine.embers += n; shrine.earned += n; saveShrine(); }

/** The shrine's effect on a run, or null when switched off. */
export function shrineBonus(): MetaBonus | null {
  if (shrine.off) return null;
  const r = (id: NodeId, alt: boolean) => (!!shrine.alt[id] === alt ? nodeRank(id) : 0);
  return {
    rerolls: r("fortune", false), banishes: r("fortune", true),
    startMon: 15 * r("purse", false), monMul: 1 + 0.05 * r("purse", true),
    chestHeal: 0.05 * r("chest", false), chestCoinMul: 1 + 0.25 * r("chest", true),
    startItem: r("provisions", false) > 0, startRiceBalls: r("provisions", true) > 0 ? 2 : 0,
    maxHp: 5 * r("vitality", false), damageTakenMul: 1 - 0.03 * r("vitality", true),
    speedMul: 1 + 0.03 * r("swift", false), dashCdMul: 1 - 0.06 * r("swift", true),
    startUlt: 0.2 * r("focus", false), ultChargeMul: 1 + 0.05 * r("focus", true),
    xpMul: 1 + 0.05 * r("lore", false), skipMul: 1 + 0.4 * r("lore", true),
    shopMul: 1 - 0.05 * r("merchant", false), rerollMul: 1 - 0.25 * r("merchant", true),
    secondLife: r("ancestor", false) > 0, bossHeal: r("ancestor", true) > 0 ? 0.25 : 0,
  };
}

/** Embers for a run: wave reached + 3 per boss + 5 per achievement + 15 for a win. */
export function embersFor(wave: number, bosses: number, achievements: number, won: boolean): number {
  return Math.max(0, wave) + bosses * 3 + achievements * 5 + (won ? 15 : 0);
}
