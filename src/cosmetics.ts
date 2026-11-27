// ─── Wardrobe: character cosmetics ───────────────────────────────────────────
// Purely visual. Four slots, Tsushima-style: an outfit (armor / attire),
// headgear (hats, headbands, masks, helmets), a sword kit (blade, guard, wrap
// and the color of your slash), and a sash that streams behind you.
//
// Two ways to earn them:
//  • Buy with Flowers (花) — a cosmetic-only currency picked up every run, so
//    looks never compete with Shrine Embers (power). Like dyes bought with
//    flowers in Ghost of Tsushima, or Hades keeping cosmetics on their own
//    currency.
//  • Earn them from achievements and challenges (bosses, waves, stealth…).
import { getCareer } from "./career";
import type { Career } from "./career";
import { isUnlocked as achUnlocked, ACHIEVEMENTS } from "./achievements";
import type { Slot, Cosmetic, Look } from "./cosmeticdraw";
export type { Slot, Cosmetic, Look } from "./cosmeticdraw";
export { drawPreview } from "./cosmeticdraw";

interface Unlock { desc: string; check: (c: Career) => boolean; progress?: (c: Career) => [number, number]; }
export const SLOTS: { id: Slot; name: string; kanji: string }[] = [
  { id: "attire", name: "Outfit", kanji: "装" },
  { id: "head", name: "Headgear", kanji: "冠" },
  { id: "blade", name: "Sword Kit", kanji: "刀" },
  { id: "sash", name: "Sash", kanji: "帯" },
];

const ach = (id: string): Unlock => {
  const a = ACHIEVEMENTS.find(x => x.id === id);
  return { desc: `Achievement: ${a ? a.name : id}${a ? ` (${a.desc.replace(/\.$/, "")})` : ""}`, check: () => achUnlocked(id) };
};
const cnt = (desc: string, n: number, get: (c: Career) => number): Unlock => ({ desc, check: c => get(c) >= n, progress: c => [Math.min(n, get(c)), n] });
const wins = (c: Career) => Object.values(c.wins ?? {}).reduce((a, b) => a + b, 0);

export const COSMETICS: Cosmetic[] = [
  // ── Outfits ──
  { id: "a_wanderer", slot: "attire", name: "Wanderer's Black", kanji: "黒", desc: "The plain black you started in.", body: "hsl(0, 0%, 8%)", accent: "hsl(358, 78%, 48%)", pattern: "robe" },
  { id: "a_traveler", slot: "attire", name: "Traveler's Indigo", kanji: "旅", desc: "Faded indigo robes and a straw-colored obi, worn on long roads.", cost: 60, body: "hsl(222, 35%, 22%)", trim: "hsl(42, 45%, 62%)", accent: "hsl(42, 55%, 60%)", pattern: "robe" },
  { id: "a_hermit", slot: "attire", name: "Mountain Hermit", kanji: "山", desc: "Layered olive and brown cloth for cold passes.", cost: 80, body: "hsl(75, 18%, 22%)", trim: "hsl(30, 35%, 38%)", accent: "hsl(30, 50%, 50%)", pattern: "robe" },
  { id: "a_clan", slot: "attire", name: "Clan Lacquer Armor", kanji: "家", desc: "Crimson-lacquered plates laced with gold. The armor of a samurai house.", cost: 140, body: "hsl(356, 60%, 28%)", trim: "hsl(43, 75%, 55%)", accent: "hsl(43, 80%, 58%)", plates: "hsl(356, 55%, 36%)", pattern: "plates" },
  { id: "a_iron", slot: "attire", name: "Iron Lord's Armor", kanji: "鉄", desc: "Dark steel scales bound with red cord.", unlock: cnt("Defeat 10 bosses", 10, c => c.bossKills), body: "hsl(215, 10%, 20%)", trim: "hsl(0, 70%, 45%)", accent: "hsl(0, 75%, 50%)", plates: "hsl(215, 8%, 32%)", pattern: "scales" },
  { id: "a_phantom", slot: "attire", name: "Phantom Garb", kanji: "幽", desc: "Charcoal cloth and a pale hood. Strike from the dark.", unlock: cnt("Get 50 stealth kills", 50, c => c.stealthKills), body: "hsl(220, 8%, 13%)", trim: "hsl(40, 15%, 82%)", accent: "hsl(40, 20%, 85%)", pattern: "hood" },
  { id: "a_sword", slot: "attire", name: "Swordmaster's Kimono", kanji: "剣", desc: "White and deep blue, for one who has mastered the blade.", unlock: cnt("Reach wave 25", 25, c => c.highestWave), body: "hsl(40, 20%, 88%)", trim: "hsl(222, 60%, 35%)", accent: "hsl(222, 65%, 40%)", pattern: "robe" },
  { id: "a_fox", slot: "attire", name: "Fox Shrine Robe", kanji: "稲", desc: "White and vermilion, blessed at a fox shrine.", unlock: cnt("Defeat the Nine-Tailed Witch", 1, c => c.bossByKind.kitsune ?? 0), body: "hsl(30, 25%, 90%)", trim: "hsl(12, 85%, 52%)", accent: "hsl(12, 90%, 55%)", pattern: "robe" },
  { id: "a_storm", slot: "attire", name: "Storm Sentinel", kanji: "雷", desc: "Navy plates with gold lightning trim.", unlock: cnt("Defeat the Thunder General", 1, c => c.bossByKind.raijin ?? 0), body: "hsl(225, 45%, 18%)", trim: "hsl(48, 90%, 60%)", accent: "hsl(48, 95%, 62%)", plates: "hsl(225, 40%, 28%)", pattern: "plates" },
  { id: "a_gold", slot: "attire", name: "Golden Temple Armor", kanji: "金", desc: "Gold and ivory, worn by those who ended the war.", unlock: cnt("Win a run (beat the Final Boss)", 1, wins), body: "hsl(44, 60%, 42%)", trim: "hsl(40, 30%, 92%)", accent: "hsl(40, 40%, 95%)", plates: "hsl(44, 70%, 52%)", pattern: "plates" },

  // ── Headgear ──
  { id: "h_none", slot: "head", name: "Bare Head", kanji: "無", desc: "Nothing but your topknot." },
  { id: "h_band", slot: "head", name: "Red Hachimaki", kanji: "鉢", desc: "A headband with long tails that stream behind you.", cost: 30, head: "band", headCol: "hsl(358, 75%, 48%)" },
  { id: "h_kasa", slot: "head", name: "Straw Kasa", kanji: "笠", desc: "A wide traveler's hat of woven straw.", cost: 45, head: "kasa", headCol: "hsl(40, 45%, 58%)", headCol2: "hsl(35, 35%, 42%)" },
  { id: "h_oni", slot: "head", name: "Oni Mask", kanji: "鬼", desc: "A snarling red demon face with horns.", cost: 150, head: "oni", headCol: "hsl(358, 70%, 42%)", headCol2: "hsl(42, 70%, 70%)" },
  { id: "h_hood", slot: "head", name: "Ghost Hood", kanji: "頭", desc: "A pale hood and cloth mask. Nobody sees your face.", unlock: ach("silent"), head: "hood", headCol: "hsl(40, 12%, 78%)", headCol2: "hsl(220, 8%, 16%)" },
  { id: "h_fox", slot: "head", name: "Fox Spirit Mask", kanji: "狐", desc: "White fox mask with red markings. Fox shrines remember you.", unlock: cnt("Open 20 Spirit Chests", 20, c => c.chests), head: "fox", headCol: "hsl(40, 30%, 95%)", headCol2: "hsl(8, 85%, 52%)" },
  { id: "h_crescent", slot: "head", name: "Crescent Kabuto", kanji: "月", desc: "A lacquered helmet crowned with a golden crescent.", unlock: cnt("Reach wave 20", 20, c => c.highestWave), head: "kabuto", headCol: "hsl(220, 10%, 16%)", headCol2: "hsl(45, 85%, 58%)" },
  { id: "h_antler", slot: "head", name: "Antlered Kabuto", kanji: "角", desc: "A war helmet with sweeping antler crests.", unlock: cnt("Kill 50 elites", 50, c => c.eliteKills), head: "antler", headCol: "hsl(25, 25%, 18%)", headCol2: "hsl(35, 30%, 75%)" },
  { id: "h_tengu", slot: "head", name: "Tengu Mask", kanji: "天", desc: "A long-nosed red mountain spirit.", unlock: cnt("Reach wave 15 on Hard or Death", 15, c => Math.max(c.bestWaveByDiff?.hard ?? 0, c.bestWaveByDiff?.death ?? 0)), head: "tengu", headCol: "hsl(5, 80%, 45%)", headCol2: "hsl(0, 0%, 95%)" },

  // ── Sword kits ──
  { id: "b_steel", slot: "blade", name: "Folded Steel", kanji: "鋼", desc: "A plain, honest katana.", bladeCol: "hsl(210, 12%, 82%)", edgeCol: "hsla(200, 60%, 96%, 0.9)", guardCol: "hsl(42, 65%, 45%)", wrapCol: "hsl(0, 60%, 28%)", trail: [180, 20, 20] },
  { id: "b_moon", slot: "blade", name: "Moonlit Edge", kanji: "月", desc: "Pale blue steel and a silver guard. Leaves a cold blue arc.", cost: 70, bladeCol: "hsl(205, 35%, 86%)", edgeCol: "hsla(195, 100%, 92%, 0.95)", guardCol: "hsl(210, 10%, 75%)", wrapCol: "hsl(215, 40%, 25%)", trail: [90, 150, 235] },
  { id: "b_crimson", slot: "blade", name: "Crimson Lacquer", kanji: "朱", desc: "Red-wrapped hilt, gold guard, a deep red arc.", cost: 90, bladeCol: "hsl(210, 10%, 80%)", edgeCol: "hsla(0, 100%, 90%, 0.9)", guardCol: "hsl(45, 85%, 55%)", wrapCol: "hsl(355, 75%, 40%)", trail: [215, 25, 45] },
  { id: "b_sakura", slot: "blade", name: "Sakura Blade", kanji: "桜", desc: "Pink-wrapped hilt and a blossom-pink arc.", cost: 120, bladeCol: "hsl(340, 20%, 88%)", edgeCol: "hsla(340, 100%, 94%, 0.95)", guardCol: "hsl(340, 30%, 70%)", wrapCol: "hsl(338, 55%, 55%)", trail: [245, 130, 175] },
  { id: "b_black", slot: "blade", name: "Black Water", kanji: "墨", desc: "A blade as dark as ink, with a violet edge.", unlock: cnt("Kill 2,000 enemies", 2000, c => c.kills), bladeCol: "hsl(250, 15%, 18%)", edgeCol: "hsla(275, 90%, 72%, 0.95)", guardCol: "hsl(270, 25%, 35%)", wrapCol: "hsl(260, 20%, 15%)", trail: [140, 70, 220] },
  { id: "b_storm", slot: "blade", name: "Storm Edge", kanji: "嵐", desc: "Crackling blue steel and a lightning-bright arc.", unlock: cnt("Defeat 3 Thunder Generals", 3, c => c.bossByKind.raijin ?? 0), bladeCol: "hsl(200, 40%, 80%)", edgeCol: "hsla(190, 100%, 85%, 1)", guardCol: "hsl(48, 90%, 60%)", wrapCol: "hsl(225, 50%, 22%)", trail: [70, 190, 255] },
  { id: "b_gold", slot: "blade", name: "Gold Leaf", kanji: "金", desc: "Gold-leafed blade and guard, a golden arc.", unlock: ach("wave20"), bladeCol: "hsl(45, 55%, 70%)", edgeCol: "hsla(48, 100%, 92%, 1)", guardCol: "hsl(45, 90%, 50%)", wrapCol: "hsl(30, 40%, 22%)", trail: [240, 190, 60] },

  // ── Sashes ──
  { id: "s_none", slot: "sash", name: "No Sash", kanji: "無", desc: "Travel light." },
  { id: "s_red", slot: "sash", name: "Red Sash", kanji: "紅", desc: "A crimson sash that snaps in the wind.", cost: 40, sashCol: "hsl(358, 72%, 45%)", sashLen: 34 },
  { id: "s_indigo", slot: "sash", name: "Indigo Cape", kanji: "藍", desc: "A short indigo cape.", cost: 70, sashCol: "hsl(225, 45%, 32%)", sashCol2: "hsl(225, 40%, 22%)", sashLen: 26 },
  { id: "s_white", slot: "sash", name: "Ghost White Cloth", kanji: "白", desc: "A long pale scarf, trailing like a spirit.", unlock: cnt("Reach wave 15 on Hard or Death", 15, c => Math.max(c.bestWaveByDiff?.hard ?? 0, c.bestWaveByDiff?.death ?? 0)), sashCol: "hsl(40, 25%, 90%)", sashLen: 52 },
  { id: "s_gold", slot: "sash", name: "Golden Cord", kanji: "綱", desc: "A braided gold cord with tassels.", unlock: cnt("Defeat 25 bosses", 25, c => c.bossKills), sashCol: "hsl(45, 85%, 55%)", sashCol2: "hsl(30, 70%, 40%)", sashLen: 40 },
  { id: "s_sakura", slot: "sash", name: "Petal Scarf", kanji: "花", desc: "Pink silk that sheds the odd petal.", cost: 110, sashCol: "hsl(338, 60%, 72%)", sashLen: 44 },
];
export const COSMETIC_BY_ID: Record<string, Cosmetic> = Object.fromEntries(COSMETICS.map(c => [c.id, c]));
const DEFAULTS: Record<Slot, string> = { attire: "a_wanderer", head: "h_none", blade: "b_steel", sash: "s_none" };

// ─── Save data ────────────────────────────────────────────────────────────────
const KEY = "ghostgame.cosmetics.v1";
interface Save { flowers: number; earned: number; owned: string[]; equipped: Record<Slot, string>; }
function load(): Save {
  const d: Save = { flowers: 0, earned: 0, owned: [], equipped: { ...DEFAULTS } };
  try { const r = localStorage.getItem(KEY); if (r) { const v = JSON.parse(r); return { ...d, ...v, equipped: { ...DEFAULTS, ...(v.equipped ?? {}) } }; } } catch { /* storage blocked */ }
  // First time the Wardrobe exists: Flowers for the runs you've already played
  // (2 per wave you've reached across all runs, up to 400).
  const back = Math.min(400, Math.max(0, Math.round((getCareer().waveSum ?? 0) * 2)));
  d.flowers = d.earned = back;
  try { localStorage.setItem(KEY, JSON.stringify(d)); } catch { /* storage blocked */ }
  return d;
}
let save = load();
const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(save)); } catch { /* storage blocked */ } };

export const flowers = () => save.flowers;
export const flowersEarned = () => save.earned;
export function addFlowers(n: number) { if (n <= 0) return; save.flowers += n; save.earned += n; persist(); }
/** Flowers for a run: 2 per wave reached, 5 per boss, 1 per 40 kills. */
export function flowersFor(wave: number, bosses: number, kills: number): number {
  return Math.max(0, wave) * 2 + bosses * 5 + Math.floor(kills / 40);
}

export function isOwned(id: string): boolean {
  const c = COSMETIC_BY_ID[id];
  if (!c) return false;
  if (!c.cost && !c.unlock) return true;                // defaults
  if (save.owned.includes(id)) return true;
  if (c.unlock && c.unlock.check(getCareer())) return true;
  return false;
}
export function buy(id: string): boolean {
  const c = COSMETIC_BY_ID[id];
  if (!c?.cost || isOwned(id) || save.flowers < c.cost) return false;
  save.flowers -= c.cost; save.owned.push(id); persist();
  return true;
}
export function equip(id: string): boolean {
  const c = COSMETIC_BY_ID[id];
  if (!c || !isOwned(id)) return false;
  save.equipped[c.slot] = id; persist();
  return true;
}
export const equippedId = (slot: Slot) => isOwned(save.equipped[slot]) ? save.equipped[slot] : DEFAULTS[slot];
export const equipped = (slot: Slot): Cosmetic => COSMETIC_BY_ID[equippedId(slot)];
export function unlockText(c: Cosmetic): string {
  if (!c.unlock) return "";
  const pr = c.unlock.progress?.(getCareer());
  return pr ? `${c.unlock.desc} · ${pr[0].toLocaleString()}/${pr[1].toLocaleString()}` : c.unlock.desc;
}
/** Earned (challenge) cosmetics that are unlocked now but weren't announced yet. */
export function newlyEarned(): Cosmetic[] {
  const out: Cosmetic[] = [];
  for (const c of COSMETICS) {
    if (!c.unlock || save.owned.includes(c.id)) continue;
    if (c.unlock.check(getCareer())) { save.owned.push(c.id); out.push(c); }
  }
  if (out.length) persist();
  return out;
}
export const ownedCount = () => COSMETICS.filter(c => isOwned(c.id)).length;

export const currentLook = (): Look => ({ attire: equipped("attire"), head: equipped("head"), blade: equipped("blade"), sash: equipped("sash") });
