// ─── Stat curves ──────────────────────────────────────────────────────────────
// Diminishing returns instead of hard walls (Brotato armor / Risk of Rain 2
// hyperbolic stacking): every point still helps, each one a little less, and
// the stat can never reach its ceiling.
//
//   soft(x, k, max) = max * x / (x + k)     → max/2 when x = k
//
// All tuning lives here so a balance pass only touches this file.

export const soft = (x: number, k: number, max: number) => (x <= 0 ? 0 : (max * x) / (x + k));

export const CURVES = {
  defense:   { k: 20,  max: 0.8 },  // 5 → 16% · 20 → 40% · 60 → 60%
  dexterity: { k: 40,  max: 1.5 },  // 20 → +50% · 60 → +90% atk speed
  crit:      { k: 0.5, max: 0.75 }, // 0.25 → 25% · 1.0 → 50%
  moveSpeed: { k: 0.4, max: 0.5 },  // +12% → +11.5% · +80% → +33%
};

/**
 * Soft-capped perk stats. Gains go into a hidden "raw" total and the stat you
 * actually get follows a curve: early upgrades count almost fully, later ones
 * less and less, and the bonus can never pass `max`.
 *   mul: bonus is a fraction of the run's starting value (1.0 = +100%)
 *   add: bonus is a flat amount on top of the starting value
 * With k = max the first upgrades count ~fully; at raw bonus = max you get half of max.
 */
export const SOFT_STATS: Record<string, { mode: "mul" | "add"; k: number; max: number; note: string }> = {
  damage:          { mode: "mul", k: 4,   max: 4,   note: "Katana damage: +100% raw → +80% · +400% raw → +200% · never above +400%" },
  classDamageMul:  { mode: "mul", k: 2.5, max: 2.5, note: "All damage: +100% raw → +71% · never above +250%" },
  secondaryDmgMul: { mode: "mul", k: 3,   max: 3,   note: "Weapon damage: +100% raw → +75% · never above +300%" },
  ultPowerMul:     { mode: "mul", k: 2,   max: 2,   note: "Ultimate damage: +60% raw → +46% · never above +200%" },
  ultChargeMul:    { mode: "mul", k: 1,   max: 1,   note: "Ultimate charge rate: +50% raw → +33% · never above +100%" },
  monMul:          { mode: "mul", k: 1.2, max: 1.2, note: "Coins: +60% raw → +40% · never above +120%" },
  abilityHaste:    { mode: "mul", k: 1,   max: 1,   note: "Ability cooldown speed: never above 2×" },
  hpRegen:         { mode: "add", k: 3,   max: 3,   note: "HP regen per second: never above 3" },
  healOnKill:      { mode: "add", k: 6,   max: 6,   note: "Heal on kill: never above 6" },
  fireChance:      { mode: "add", k: 0.5, max: 0.5, note: "Burn chance: never above 50%" },
  lightningChance: { mode: "add", k: 0.4, max: 0.4, note: "Lightning chance: never above 40%" },
  bleedChance:     { mode: "add", k: 0.5, max: 0.5, note: "Bleed chance: never above 50%" },
  poisonChance:    { mode: "add", k: 0.5, max: 0.5, note: "Poison chance: never above 50%" },
  eliteBounty:     { mode: "add", k: 16,  max: 16,  note: "Elite bounty coins: never above 16" },
  invulnBonus:     { mode: "add", k: 0.75, max: 0.75, note: "Extra i-frames: never above 0.75s" },
};
/**
 * Ultimate damage (Phase 7.1). Ults scale mostly with YOUR power, like Risk of
 * Rain 2 skills: base × your weapon power × a small wave bonus × ult upgrades.
 * The wave bonus used to be +35% per wave (which matched enemy HP growth, so a
 * no-upgrade ult never fell off). Now it's +12%, so builds decide late-game ults.
 */
export const ULT_WAVE_SCALE = 0.12;

/**
 * Shop rarity (Phase 7.3), Brotato-style. Each slot rolls a rarity first, then
 * an item of that rarity. Legendaries can't appear early, then their chance
 * grows a little each wave up to a cap. Slay-the-Spire-style bad-luck
 * protection: every shop roll without a legendary adds a bit until one shows.
 */
export const SHOP_RARITY = {
  rare: 0.28,            // chance per slot of a rare
  legFromWave: 4,        // no legendaries before this wave
  legBase: 0.02,         // legendary chance per slot at legFromWave
  legPerWave: 0.004,     // +0.4% per wave after that
  legMax: 0.08,          // cap (reached around wave 19)
  pityStep: 0.005,       // +0.5% per slot for each roll in a row without a legendary
  legPricePerWave: 0.04, // 7.4: legendaries cost +4% more per wave on top of normal inflation
};
/** Legendary chance per slot for this wave and pity count. */
export const shopLegChance = (wave: number, pity: number) =>
  wave < SHOP_RARITY.legFromWave ? 0
    : Math.min(SHOP_RARITY.legMax, SHOP_RARITY.legBase + (wave - SHOP_RARITY.legFromWave) * SHOP_RARITY.legPerWave) + pity * SHOP_RARITY.pityStep;

/**
 * Ult charging (Phase 7.6), Hades-style: the bar fills from damage you deal and
 * damage you take, not from kills. Charging from dealt damage has a speed limit
 * (a refilling "bucket") so huge late waves can't flood it, and the bar is
 * trimmed between waves. Charge perks/items (Spirit Bell…) still multiply all of it.
 */
export const ULT_CHARGE = {
  perGruntDealt: 2.5,     // % charge per grunt's worth of damage dealt (×2 when low on HP)
  dealtRatePerSec: 2.5,   // max % per second from dealing damage (bucket refill rate)
  dealtBurst: 12,         // bucket size: how much can be gained at once after a lull
  takenHit: 8,            // % per hit taken (13 when low on HP)
  takenHitLow: 13,
  takenRatePerSec: 1.2,   // max % per second from taking hits (own bucket, so tanking can't flood it)
  takenBurst: 20,         // a couple of big hits still give a real boost
  carryBetweenWaves: 0.5, // bar is trimmed to this share at the start of each wave
};

/**
 * Coin economy (Phase 7.7), Brotato-style: from wave 5 a kill is less and less
 * likely to drop coins, shop prices grow faster after mid-game so the shop
 * slowly outgrows your income, and income tapers off further in Endless.
 */
export const COIN_ECONOMY = {
  dropFallFromWave: 5,
  dropFallPerWave: 0.03,    // −3% coin drop chance per wave after that
  dropFloor: 0.4,           // never below 40%
  lateInflationFromWave: 8,
  lateInflationPerWave: 0.05, // +5% prices per wave after wave 8 (on top of the normal +15%)
  endlessFromWave: 26,
  endlessDecay: 0.92,       // Endless: income ×0.92 per wave past wave 25…
  endlessFloor: 0.25,       // …but never below 25%
};
/** Chance a kill drops coins on this wave. */
export const coinDropChance = (wave: number) =>
  Math.max(COIN_ECONOMY.dropFloor, 1 - COIN_ECONOMY.dropFallPerWave * Math.max(0, wave - COIN_ECONOMY.dropFallFromWave));
/** Extra income multiplier in Endless. */
export const endlessIncomeMul = (wave: number) =>
  wave < COIN_ECONOMY.endlessFromWave ? 1 : Math.max(COIN_ECONOMY.endlessFloor, Math.pow(COIN_ECONOMY.endlessDecay, wave - COIN_ECONOMY.endlessFromWave + 1));
/** Extra price multiplier after mid-game. */
export const lateInflation = (wave: number) =>
  1 + COIN_ECONOMY.lateInflationPerWave * Math.max(0, wave - COIN_ECONOMY.lateInflationFromWave);

/**
 * Boss caps (Phase 7.2): the most one cast of a source can take off a single
 * boss, as a share of its max HP. Stops ults and Soul Rend from deleting bosses
 * (like RAID's 5–10% caps and Isaac's big-hit cap). Extra damage is ignored.
 */
export const BOSS_CAST_CAPS: Record<string, number> = {
  "Ultimate": 0.12,
  "Soul Rend": 0.06,
};

/** Weapon flat damage bonus (per weapon) as a fraction of that weapon's base hit. */
export const WEAPON_FLAT = { k: 3, max: 3 };

/** The stat you get from a raw total, given the run's starting value. Penalties (raw below base) pass straight through. */
export function softStat(mode: "mul" | "add", base: number, raw: number, k: number, max: number): number {
  if (raw <= base) return raw;
  if (mode === "add") return base + soft(raw - base, k, max);
  const b = Math.max(1e-6, base);
  return b * (1 + soft(raw / b - 1, k, max));
}

/** Fraction of each hit blocked by Defense (0..0.8). */
export const defenseReduction = (def: number) => soft(def, CURVES.defense.k, CURVES.defense.max);

/** Attack-speed multiplier from Dexterity (1 = base, max 2.5). */
export const dexAttackSpeed = (dexEff: number) => 1 + soft(dexEff, CURVES.dexterity.k, CURVES.dexterity.max);

/** Real crit chance from crit "points" (perks and items add points). */
export const critFromPoints = (points: number) => soft(points, CURVES.crit.k, CURVES.crit.max);

/** Real move-speed multiplier from the raw multiplier (penalties below 1 pass straight through). */
export const moveSpeedFromMul = (rawMul: number) =>
  rawMul <= 1 ? rawMul : 1 + soft(rawMul - 1, CURVES.moveSpeed.k, CURVES.moveSpeed.max);

export const pct = (v: number) => `${Math.round(v * 100)}%`;
