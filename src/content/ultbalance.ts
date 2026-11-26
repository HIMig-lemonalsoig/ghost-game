// ─── Ult balance (Phase 7.5) ──────────────────────────────────────────────────
// Every class's ultimate is tuned toward one shared "power budget": the extra
// damage the ult adds over 10 seconds against a pack, measured at wave 25 with
// no upgrades (target ≈ 60 grunts' worth, within ±30%).
//
// • ULT_CLASS_MUL scales damage ults (everything that uses ultDmg()).
// • ULT_EMPOWER gives power-up ults (Berserker rage, Shinobi stealth…) bonus
//   ult damage on every weapon hit while they're active, so they matter as
//   much as damage ults while still playing like buffs.
// Re-measure with the dev "budget" harness after changing anything here.
import type { ClassId } from "../GhostGame";

export const ULT_CLASS_MUL: Partial<Record<ClassId, number>> = {
  miko: 0.22, kunoichi: 0.09, onmyoji: 0.23, tsuchigumo: 0.33, kitsune: 0.36,
  ashigaru: 0.38, arashi: 0.6, dokkaebi: 0.53, onna: 0.54, kappa: 0.64,
  kensei: 0.95, sohei: 1.24, raijin: 1.36, ronin: 1.55, tetsubo: 1.62, samurai: 3.4,
};

/** Bonus ult damage (ultDmg base) added to each weapon hit while a power-up ult runs. */
export const ULT_EMPOWER: Partial<Record<ClassId, number>> = {
  berserker: 9.7, shinobi: 13, kagebushi: 8.2, kabuki: 9.3, hatamoto: 7,
  yukionna: 9.4, yamabushi: 15, tengu: 1,
};
