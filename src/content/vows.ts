// ─── Vows (Hades-style Heat) ──────────────────────────────────────────────────
// Optional challenges you swear to before a run. Each rank adds to your Vow
// score; harder vows are worth more points. They unlock once you've reached
// wave 15 on any difficulty. A run with a Vow score also earns +3% coins per
// point. Effects are applied in GhostGame.ts (search "VOW").

export type VowId =
  | "iron_hide" | "swarm" | "elite_blood" | "sharp_steel" | "stingy"
  | "thin_blood" | "quick_death" | "boss_fury" | "no_rest" | "long_night";

export interface VowDef {
  id: VowId;
  name: string;
  kanji: string;
  ranks: number;
  points: number;               // score per rank
  desc: (rank: number) => string;
}

export const VOWS: VowDef[] = [
  { id: "iron_hide",   name: "Iron Hide",       kanji: "鉄", ranks: 3, points: 1, desc: r => `Enemies have +${20 * r}% HP.` },
  { id: "swarm",       name: "Swarm",           kanji: "群", ranks: 3, points: 1, desc: r => `+${15 * r}% more enemies at once.` },
  { id: "sharp_steel", name: "Sharp Steel",     kanji: "鋭", ranks: 3, points: 1, desc: r => `Enemies deal +${15 * r}% damage.` },
  { id: "elite_blood", name: "Elite Blood",     kanji: "精", ranks: 2, points: 2, desc: r => `Elites appear ${r === 1 ? "1.5×" : "2.25×"} as often.` },
  { id: "stingy",      name: "Stingy Merchant", kanji: "吝", ranks: 2, points: 1, desc: r => `Shop prices +${20 * r}%.` },
  { id: "thin_blood",  name: "Thin Blood",      kanji: "薄", ranks: 2, points: 1, desc: r => `All healing −${25 * r}%.` },
  { id: "quick_death", name: "Quick Death",     kanji: "疾", ranks: 2, points: 2, desc: r => `Enemy attack wind-ups are ${15 * r}% shorter.` },
  { id: "boss_fury",   name: "Boss Fury",       kanji: "怒", ranks: 2, points: 2, desc: r => `Bosses gain ${r} elite affix${r > 1 ? "es" : ""} (on any difficulty).` },
  { id: "no_rest",     name: "No Rest",         kanji: "休", ranks: 1, points: 3, desc: () => "No healing between waves: Battle Meditation and the merchant's healing are gone." },
  { id: "long_night",  name: "Long Night",      kanji: "夜", ranks: 2, points: 1, desc: r => `Waves last +${20 * r}% longer.` },
];
export const VOW_BY_ID = Object.fromEntries(VOWS.map(v => [v.id, v])) as Record<VowId, VowDef>;
export const MAX_VOW_SCORE = VOWS.reduce((n, v) => n + v.ranks * v.points, 0);
export const VOW_UNLOCK_WAVE = 15;
export const VOW_COIN_BONUS = 0.03;   // per point

export type VowSet = Partial<Record<VowId, number>>;

export const vowScore = (v: VowSet) => VOWS.reduce((n, d) => n + Math.min(d.ranks, v[d.id] ?? 0) * d.points, 0);
export const vowRank = (v: VowSet | undefined, id: VowId) => Math.min(VOW_BY_ID[id].ranks, Math.max(0, v?.[id] ?? 0));
