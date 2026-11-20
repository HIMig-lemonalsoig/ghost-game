// ─── Phase 4 enemies ──────────────────────────────────────────────────────────
// Two roles GhostGame was missing (controller + summoner) plus an anti-ranged
// enemy. Behaviour lives in GhostGame.ts (search "PHASE4"); tuning is here.

export const NEW_ENEMY_TIPS: Record<string, string> = {
  onryo: "怨 Onryō: its ink pools slow you, and its talisman roots you. Dash to break free",
  nue: "鵺 Nue: it summons wisps. Kill it first and its wisps vanish",
  mirror: "鏡 Mirror Monk: reflects shots from the front. Hit it up close or from behind",
};

export const ONRYO = {
  fromWave: 7,
  keepAway: 300,
  castEvery: 3.4,           // seconds between ink pools
  talismanEvery: 3,         // every Nth cast also throws a binding talisman
  inkRadius: 72, inkTelegraph: 1.1, inkLife: 3.6, inkSlow: 0.6,
  talismanSpeed: 250, rootTime: 0.6,
};

export const NUE = {
  fromWave: 9,
  keepAway: 330,
  summonEvery: 6, summonCharge: 0.8, perSummon: 3, maxSummons: 9,
};

export const MIRROR = {
  fromWave: 12,
  frontArc: Math.PI * 0.78,  // ±70° from its facing reflects projectiles
  reflectDmgShare: 0.7,      // of its own damage stat
};

/** Spawn chance per roll (added to pickRollKind). */
export const newEnemyChance = (kind: "onryo" | "nue" | "mirror", wave: number) => {
  if (kind === "onryo") return wave >= ONRYO.fromWave ? Math.min(0.07, (wave - ONRYO.fromWave + 1) * 0.012) : 0;
  if (kind === "nue") return wave >= NUE.fromWave ? Math.min(0.05, (wave - NUE.fromWave + 1) * 0.01) : 0;
  return wave >= MIRROR.fromWave ? Math.min(0.07, (wave - MIRROR.fromWave + 1) * 0.012) : 0;
};
