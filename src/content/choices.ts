// ─── Between-wave choices (Phase 16) ─────────────────────────────────────────
// Omens: after some waves the merchant offers two modifiers for the next wave
// and you must pick one. Arena shrines: rare altars that appear mid-wave;
// stand in one for a moment to accept its trade. Effects live in GhostGame.ts
// (search "OMEN" / "ARENA SHRINE").

export type OmenId = "blood_moon" | "elite_hunt" | "calm_night" | "swift_shadows" | "iron_tide" | "glass_night";
export interface OmenDef {
  id: OmenId; kanji: string; name: string; desc: string; hue: number;
  density?: number; coins?: number; elite?: number; chest?: boolean; xp?: number;
  speed?: number; hp?: number; dmgOut?: number; dmgIn?: number;
}
export const OMENS: OmenDef[] = [
  { id: "blood_moon",    kanji: "血", name: "Blood Moon",    hue: 355, desc: "+40% enemies, ×2 coins.", density: 1.4, coins: 2 },
  { id: "elite_hunt",    kanji: "精", name: "Elite Hunt",    hue: 280, desc: "Elites ×3 as common. A Spirit Chest waits for you.", elite: 3, chest: true },
  { id: "calm_night",    kanji: "静", name: "Calm Night",    hue: 200, desc: "30% fewer enemies, but half the coins.", density: 0.7, coins: 0.5 },
  { id: "swift_shadows", kanji: "疾", name: "Swift Shadows", hue: 160, desc: "Enemies are 20% faster. +50% XP.", speed: 1.2, xp: 1.5 },
  { id: "iron_tide",     kanji: "鉄", name: "Iron Tide",     hue: 30,  desc: "Enemies have +30% HP. +60% coins.", hp: 1.3, coins: 1.6 },
  { id: "glass_night",   kanji: "玻", name: "Glass Night",   hue: 50,  desc: "You deal +30% damage and take +30% damage.", dmgOut: 1.3, dmgIn: 1.3 },
];
export const OMEN_BY_ID = Object.fromEntries(OMENS.map(o => [o.id, o])) as Record<OmenId, OmenDef>;
/** Omens are offered before waves 3, 4, 6, 7, 8, 9, 11… (never before a boss wave). */
export const omenBefore = (nextWave: number) => nextWave >= 3 && nextWave % 5 !== 0 && nextWave % 2 === 1;

export type ArenaShrineId = "blood_pact" | "cursed_offering" | "gamblers_altar" | "spirit_well";
export interface ArenaShrineDef { id: ArenaShrineId; kanji: string; name: string; cost: string; reward: string; hue: number; }
export const ARENA_SHRINES: ArenaShrineDef[] = [
  { id: "blood_pact",      kanji: "契", name: "Blood Pact",      hue: 355, cost: "Lose 20% max HP",                      reward: "a random legendary perk" },
  { id: "cursed_offering", kanji: "呪", name: "Cursed Offering", hue: 280, cost: "Enemies deal +25% damage this wave",   reward: "a Spirit Chest (evolves a ready weapon)" },
  { id: "gamblers_altar",  kanji: "賭", name: "Gambler's Altar", hue: 45,  cost: "Lose 40% of your coins",               reward: "a random rare-or-better perk" },
  { id: "spirit_well",     kanji: "泉", name: "Spirit Well",     hue: 190, cost: "Lose 30% of your current HP",          reward: "a full ultimate and +1 reroll" },
];
export const ARENA_SHRINE_BY_ID = Object.fromEntries(ARENA_SHRINES.map(s => [s.id, s])) as Record<ArenaShrineId, ArenaShrineDef>;
export const ARENA_SHRINE_CHANCE = 0.3;     // per non-boss wave from wave 4
export const ARENA_SHRINE_HOLD = 1.2;       // seconds standing in it to accept
export const ARENA_SHRINE_R = 46;
