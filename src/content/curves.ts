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
