// ─── Weapon evolutions ────────────────────────────────────────────────────────
// Vampire Survivors–style: a weapon evolves when ALL three are true —
//   1. Mastery 3: you bought 3 of its damage upgrades in the shop
//      (katana: the "+% damage with all weapons" Whetstones)
//   2. you own its catalyst (a level-up perk or a shop item, see `catalysts`)
//   3. you open a Spirit Chest (elites and bosses drop them)
// The evolved weapon keeps its slot, hits 40% harder and gains a new trick.
// The tricks are implemented in GhostGame.ts (search "EVOLUTION").
import type { SecondaryId } from "../GhostGame";

export interface EvolutionDef {
  name: string;
  kanji: string;
  desc: string;
  catalysts: string[];      // perk ids or shop effect ids — any one works
  catalystLabel: string;
}

export const EVO_MASTERY = 3;
export const EVO_DAMAGE_MUL = 1.4;

export const EVOLUTIONS: Record<SecondaryId, EvolutionDef> = {
  katana:         { name: "Kusanagi",          kanji: "草", desc: "Every 3rd swing sends a cutting wind wave.",                 catalysts: ["blade_edge"],                      catalystLabel: "Honed Edge" },
  yumi:           { name: "Raiden Bow",        kanji: "雷", desc: "Looses 3 arrows; each hit arcs lightning to 2 nearby foes.", catalysts: ["long_blade"],                      catalystLabel: "Long Blade" },
  kunai:          { name: "Shadow Fan",        kanji: "扇", desc: "Throws 5 kunai that pierce.",                                 catalysts: ["swift_step"],                      catalystLabel: "Swift Step" },
  smoke_bomb:     { name: "Ninja Fog",         kanji: "霧", desc: "A bigger cloud that follows you for 4s (you stay hidden).",   catalysts: ["ghost_step"],                      catalystLabel: "Ghost Step" },
  tetsubishi:     { name: "Venom Caltrops",    kanji: "毒", desc: "Bigger blast; the caltrop field poisons.",                    catalysts: ["poison_hits_c"],                   catalystLabel: "Tainted Blade" },
  kusarigama:     { name: "Reaper's Chain",    kanji: "鎖", desc: "Hits drag every nearby foe toward you.",                      catalysts: ["bleed_hits_c"],                    catalystLabel: "Cruel Strike" },
  crossbow:       { name: "Siege Repeater",    kanji: "連", desc: "Fires extra piercing bolts.",                                 catalysts: ["crit", "keen_eye", "crit_strike"], catalystLabel: "Killing Eye, Keen Eye or Killing Edge" },
  tessen:         { name: "Gale Fan",          kanji: "嵐", desc: "Hits burst into a gust that slams nearby foes.",              catalysts: ["wide_arc"],                        catalystLabel: "Wide Arc" },
  jutte:          { name: "Iron Warden",       kanji: "衛", desc: "Each hit grants 2 shield (max 20) that soaks damage.",        catalysts: ["exec_parry", "perfect_guard"],     catalystLabel: "Counter Strike or Perfect Guard" },
  ono:            { name: "Executioner's Axe", kanji: "斬", desc: "Instantly kills non-boss foes below 15% HP.",                 catalysts: ["vampire"],                         catalystLabel: "Bloodlust" },
  shuriken_wheel: { name: "Storm Wheel",       kanji: "輪", desc: "Each throw also sets 3 blades orbiting you for 4s.",          catalysts: ["momentum"],                        catalystLabel: "Momentum" },
  flame_spear:    { name: "Phoenix Lance",     kanji: "鳳", desc: "Each thrust leaves a line of fire on the ground.",            catalysts: ["fire_dmg_r", "shop_fire_charm"],   catalystLabel: "Roaring Flame or Fire Charm" },
  twin_sai:       { name: "Thousand Needles",  kanji: "針", desc: "Every 4th hit unleashes a 3-strike flurry.",                  catalysts: ["swift_strike", "dex_common"],      catalystLabel: "Light Hands (perk or shop)" },
  odachi:         { name: "Moon Cleaver",      kanji: "月", desc: "Every swing sends a wide crescent across the arena.",         catalysts: ["iron_body"],                       catalystLabel: "Iron Body" },
  blowgun:        { name: "Plague Pipe",       kanji: "疫", desc: "Darts burst into poison clouds.",                            catalysts: ["poison_dmg_r"],                    catalystLabel: "Refined Toxin" },
  tate:           { name: "Fortress Wall",     kanji: "城", desc: "Blocking reflects enemy projectiles back at them.",           catalysts: ["thick_hide", "def_rare", "def_leg"], catalystLabel: "Thick Hide or any armor" },
};
