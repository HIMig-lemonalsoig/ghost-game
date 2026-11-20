// ─── Elite affixes ────────────────────────────────────────────────────────────
// From wave 6 any regular enemy can spawn as an elite carrying an affix that
// changes how the fight plays (Risk of Rain / Mewgenics style). Every affix has
// a visible tell and a clear counter. Behaviour hooks live in GhostGame.ts and
// look up these ids; all tuning numbers are here.

export type AffixId = "burning" | "frost" | "vampiric" | "hasted" | "splitting" | "warded" | "volatile" | "commander";

export interface AffixDef {
  id: AffixId;
  name: string;
  kanji: string;
  hue: number;          // aura / tag colour
  hint: string;         // shown the first time you meet it each run
  bossOk: boolean;      // can a boss roll it (Hard / Death)?
}

export const AFFIXES: Record<AffixId, AffixDef> = {
  burning:   { id: "burning",   name: "Burning",   kanji: "炎", hue: 18,  hint: "leaves a fire trail — don't chase it in a line", bossOk: true },
  frost:     { id: "frost",     name: "Frost",     kanji: "氷", hue: 195, hint: "its aura slows you — fight it from range", bossOk: true },
  vampiric:  { id: "vampiric",  name: "Vampiric",  kanji: "吸", hue: 345, hint: "heals when it hits you — burst it down", bossOk: true },
  hasted:    { id: "hasted",    name: "Hasted",    kanji: "速", hue: 55,  hint: "fast and attacks often — block, dash or stun it", bossOk: true },
  splitting: { id: "splitting", name: "Splitting", kanji: "分", hue: 140, hint: "splits in two on death — use area attacks", bossOk: false },
  warded:    { id: "warded",    name: "Warded",    kanji: "盾", hue: 220, hint: "blocks the first 3 hits — multi-hit weapons strip it", bossOk: true },
  volatile:  { id: "volatile",  name: "Volatile",  kanji: "爆", hue: 30,  hint: "explodes 1s after death — step away", bossOk: true },
  commander: { id: "commander", name: "Commander", kanji: "将", hue: 275, hint: "nearby foes hit 20% harder — kill it first", bossOk: true },
};
export const AFFIX_IDS = Object.keys(AFFIXES) as AffixId[];

export const ELITE = {
  startWave: 6,
  chanceAt: (wave: number) => (wave < 6 ? 0 : Math.min(0.12, 0.03 + (wave - 6) * 0.0065)), // 3% → 12% by wave 20
  doubleFromWave: 18,
  doubleChance: 0.3,          // share of elites that roll a 2nd affix from wave 18
  hpMul: 2.5,
  sizeMul: 1.3,
  rewardMul: 3,               // xp + coins
  // affix tuning
  fireTrailEvery: 0.3, fireLife: 2.6, fireRadius: 26, fireTick: 0.5, fireDmgShare: 0.3,
  frostRadius: 150, frostSlow: 0.7,
  vampHeal: 0.12,             // of max HP per hit landed
  hasteSpeed: 1.4, hasteAttack: 1.6,
  splitHpShare: 0.3, splitSize: 0.7,
  wardHits: 3,
  volatileRadius: 95, volatileFuse: 1.0, volatileDmgMul: 1.4,
  commanderRadius: 200, commanderBuff: 1.2,
  chestLife: 25,
};

export const ENEMY_LABEL: Record<string, string> = {
  normal: "Ashigaru", heavy: "Brute", shielded: "Shield-bearer", archer: "Archer", assassin: "Assassin",
  wisp: "Wisp", priest: "Healer Monk", bomber: "Bomber", lantern: "Lantern Ghost", boss: "Warlord", final: "Shogun",
};

/** Pick n distinct affixes (bosses skip the ones that don't suit them). */
export function rollAffixes(n: number, boss = false): AffixId[] {
  const pool = AFFIX_IDS.filter(a => !boss || AFFIXES[a].bossOk);
  const out: AffixId[] = [];
  while (out.length < n && pool.length) out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  return out;
}
