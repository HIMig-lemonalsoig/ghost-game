// ─── Duo perks ────────────────────────────────────────────────────────────────
// Hades-style: owning one perk from EACH group unlocks a special duo card that
// can appear at level-up (1 in 4 level-ups while one is available). Effects
// are implemented in GhostGame.ts (search "DUO").

export interface DuoDef {
  id: string;
  name: string;
  kanji: string;
  desc: string;
  needs: [string[], string[]];   // one perk id from each list
  needsLabel: string;
}

const FIRE = ["fire_hits_c", "fire_dmg_r", "fire_spread_l"];
const BLEED = ["bleed_hits_c", "bleed_dmg_r"];
const POISON = ["poison_hits_c", "poison_dmg_r", "poison_ramp_l"];
const CRIT = ["keen_eye", "crit_strike"];
const LIGHTNING = ["lightning_hits_r", "lightning_dmg_l"];

export const DUOS: DuoDef[] = [
  { id: "duo_searing",   name: "Searing Wounds",  kanji: "灼", desc: "Hitting a bleeding foe sets it ablaze, and hitting a burning foe makes it bleed.", needs: [FIRE, BLEED], needsLabel: "Fire + Bleed" },
  { id: "duo_venom",     name: "Venom Strike",    kanji: "毒", desc: "Critical hits on poisoned foes deal double damage.",                               needs: [POISON, CRIT], needsLabel: "Poison + Crit" },
  { id: "duo_thunder",   name: "Thunderclap",     kanji: "轟", desc: "Critical hits chain lightning to 2 nearby foes (50% damage).",                     needs: [LIGHTNING, CRIT], needsLabel: "Lightning + Crit" },
  { id: "duo_undying",   name: "Undying Rage",    kanji: "怒", desc: "Below 30% HP, healing from kills is tripled.",                                     needs: [["vampire", "bounty_hunter"], ["last_stand", "phantom"]], needsLabel: "Bloodlust/Bounty Hunter + Last Stand/Phantom Form" },
  { id: "duo_flow",      name: "Endless Flow",    kanji: "流", desc: "Clearing a wave resets all ability cooldowns and adds 25% ultimate charge.",      needs: [["momentum", "haste"], ["wave_clear"]], needsLabel: "Momentum/Battle Rhythm + Battle Meditation" },
  { id: "duo_phantom",   name: "Phantom Rush",    kanji: "幻", desc: "Dashing through a non-elite foe below 40% HP stealth-kills it.",                  needs: [["dash_strike", "quick_draw"], ["ghost_step", "shadow_lord"]], needsLabel: "Piercing Dash/Quick Draw + Ghost Step/Shadow Lord" },
  { id: "duo_pyre",      name: "Funeral Pyre",    kanji: "葬", desc: "Reaper's soul shockwaves set every foe they touch on fire.",                       needs: [FIRE, ["reaper"]], needsLabel: "Fire + Reaper's Toll" },
  { id: "duo_reach",     name: "Heaven's Reach",  kanji: "天", desc: "Katana swings also send a small wind wave (50% damage).",                         needs: [["wide_arc"], ["long_blade"]], needsLabel: "Wide Arc + Long Blade" },
];
export const DUO_BY_ID: Record<string, DuoDef> = Object.fromEntries(DUOS.map(d => [d.id, d]));
