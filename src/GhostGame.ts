// Consolidated game engine and supporting systems. No React dependencies.
// Sections: classes, weapons, shop, consumables, saves, biomes, audio, VFX, gameplay.

// ============================================================================
// CLASSES
// ============================================================================

// Class definitions for the 11 samurai archetypes.
// Phase 1: passives + ultimate metadata. Secondary weapons referenced
// in flavor text are deferred to a later phase — the passives still apply.

export type ClassId =
  | "kensei"
  | "shinobi"
  | "ronin"
  | "yamabushi"
  | "onna"
  | "dokkaebi"
  | "kagemusha"
  | "berserker"
  | "arashi"
  | "tetsubo"
  | "samurai"
  // ===== Phase A additions =====
  | "onmyoji"
  | "hatamoto"
  | "kunoichi"
  | "tsuchigumo"
  | "miko"
  | "kagebushi";

export interface ClassDef {
  id: ClassId;
  kanji: string;
  name: string;
  role: string;            // one-line role description
  bonuses: string[];       // bullet list of starting bonuses
  ultName: string;
  ultKanji: string;
  ultDesc: string;
  // Tint colors (HSL strings) used to highlight the card and HUD label.
  accent: string;          // hsl(...) for borders / kanji
}

export const CLASSES: ClassDef[] = [
  {
    id: "kensei",
    kanji: "剣",
    name: "Kensei",
    role: "Master Swordsman",
    bonuses: ["+20% katana damage", "Choose secondary: Yumi or Kunai"],
    ultName: "Iaijutsu Strike",
    ultKanji: "居",
    ultDesc: "Time freezes. Dash through everything in a line, leaving bleeding cuts.",
    accent: "hsl(36, 90%, 65%)",
  },
  {
    id: "shinobi",
    kanji: "影",
    name: "Shinobi",
    role: "Shadow Assassin",
    bonuses: ["+15% movement speed", "20% chance to poison on hit (stacks)", "Choose secondary: Kunai or Smoke Bomb"],
    ultName: "Shadow Step",
    ultKanji: "隠",
    ultDesc: "Vanish for 4s with triple damage. Smoke stuns enemies on return.",
    accent: "hsl(260, 50%, 70%)",
  },
  {
    id: "ronin",
    kanji: "浪",
    name: "Ronin",
    role: "Wandering Outlaw",
    bonuses: ["+10% damage", "−10 max HP", "Choose secondary: Kusarigama or Crossbow"],
    ultName: "Crimson Debt",
    ultKanji: "血",
    ultDesc: "Spend 20% HP to strike every enemy on screen 5 times. Lower HP deals more damage.",
    accent: "hsl(0, 75%, 55%)",
  },
  {
    id: "yamabushi",
    kanji: "山",
    name: "Yamabushi",
    role: "Mountain Monk",
    bonuses: ["+25 max HP", "Slow passive HP regeneration (+0.5/s)"],
    ultName: "Mountain's Endurance",
    ultKanji: "岳",
    ultDesc: "3s of total immunity. Damage taken converts to healing, plus a burst heal.",
    accent: "hsl(140, 40%, 55%)",
  },
  {
    id: "onna",
    kanji: "武",
    name: "Onna-Bugeisha",
    role: "Disciplined Warrior",
    bonuses: ["+10% attack speed", "Choose secondary: Yumi or Kunai"],
    ultName: "Thousand Cuts",
    ultKanji: "千",
    ultDesc: "3s spinning AoE around you. Triple attack speed plus 15% knockback.",
    accent: "hsl(330, 70%, 65%)",
  },
  {
    id: "dokkaebi",
    kanji: "鬼",
    name: "Dokkaebi",
    role: "Cursed Warrior",
    bonuses: ["5% on kill: briefly spawns an allied ghost to fight for you"],
    ultName: "Cursed Horde",
    ultKanji: "呪",
    ultDesc: "5 ghosts charge across the arena, cursing enemies (+20% damage taken).",
    accent: "hsl(180, 50%, 60%)",
  },
  {
    id: "kagemusha",
    kanji: "影武",
    name: "Kagemusha",
    role: "Shadow Double",
    bonuses: ["Every 15s, spawn a 3s decoy that draws enemy aggro"],
    ultName: "Twin Shadows",
    ultKanji: "双",
    ultDesc: "Spawn a clone for 8s that mirrors your moves. Explodes on death.",
    accent: "hsl(220, 40%, 65%)",
  },
  {
    id: "berserker",
    kanji: "怒",
    name: "Berserker",
    role: "Oni-Blood Rage",
    bonuses: ["Damage scales up to +40% as your HP drops toward 20%"],
    ultName: "Blood Rage",
    ultKanji: "狂",
    ultDesc: "Invulnerability and 2× damage for 5–8s (longer at lower HP). Heal 3 HP per kill (capped).",
    accent: "hsl(355, 90%, 50%)",
  },
  {
    id: "arashi",
    kanji: "嵐",
    name: "Arashi",
    role: "Storm Archer",
    bonuses: ["+10% projectile speed", "Choose secondary: Yumi or Crossbow"],
    ultName: "Storm of Heaven",
    ultKanji: "雷",
    ultDesc: "Leap into the sky and rain 20 piercing arrows across the arena, slowing on hit.",
    accent: "hsl(200, 80%, 65%)",
  },
  {
    id: "tetsubo",
    kanji: "鉄",
    name: "Tetsu-bo Master",
    role: "Iron Giant",
    bonuses: ["+30 max HP", "−5% movement speed", "+20% knockback on hit"],
    ultName: "Earthbreaker",
    ultKanji: "震",
    ultDesc: "Slam the ground — a shockwave launches enemies, dealing fall and collision damage.",
    accent: "hsl(30, 30%, 55%)",
  },
  {
    id: "samurai",
    kanji: "侍",
    name: "Samurai",
    role: "Bushido Warrior",
    bonuses: ["+15 max HP", "Bushido: +10% damage on next attack per hit taken (stacks up to 5)"],
    ultName: "Iai Chain",
    ultKanji: "居",
    ultDesc: "Blink to the strongest nearby enemy and keep slashing until it dies, then chain to the next — up to 5 slices total. A boss can eat the whole chain.",
    accent: "hsl(45, 95%, 60%)",
  },
  // ===== Phase A: 7 new classes =====
  {
    id: "onmyoji",
    kanji: "陰",
    name: "Onmyoji",
    role: "Mystic Sorcerer",
    bonuses: ["Starts with Blowgun", "−10% cooldown on Sword Barrage & Flash Step", "Casting an ability leaves a spirit orb that damages foes for 5s"],
    ultName: "Spirit Tempest",
    ultKanji: "霊",
    ultDesc: "A 5s spirit vortex pulls enemies in and shreds them. Enemies that die inside explode.",
    accent: "hsl(280, 60%, 70%)",
  },
  {
    id: "hatamoto",
    kanji: "旗",
    name: "Hatamoto",
    role: "Shogunate Guard",
    bonuses: ["Starts with Flame Spear", "+15 max HP", "Taking damage triggers a golden shield (10s cooldown)"],
    ultName: "Shogun's Decree",
    ultKanji: "令",
    ultDesc: "Plant a banner for 8s: +40% damage, −30% damage taken, and slows nearby foes.",
    accent: "hsl(45, 95%, 55%)",
  },
  {
    id: "kunoichi",
    kanji: "女",
    name: "Kunoichi",
    role: "Female Shinobi",
    bonuses: ["Starts with Twin Sai", "+20% movement speed", "Every 4th attack automatically poisons the target"],
    ultName: "Phantom Dance",
    ultKanji: "舞",
    ultDesc: "Split into 3 afterimages that dash for 4s. Collapse back with 2s of invulnerability.",
    accent: "hsl(320, 60%, 70%)",
  },
  {
    id: "tsuchigumo",
    kanji: "蜘",
    name: "Tsuchigumo",
    role: "Spider Demon",
    bonuses: ["Starts with Kusarigama", "+10% attack speed", "15% chance on kill to web nearby foes for 2s (they take 2× damage)"],
    ultName: "Death Web",
    ultKanji: "網",
    ultDesc: "Arena-wide web for 6s — roots grounded foes and slows the rest. Webbed deaths spread poison.",
    accent: "hsl(260, 40%, 55%)",
  },
  {
    id: "miko",
    kanji: "巫",
    name: "Miko",
    role: "Shrine Maiden",
    bonuses: ["Starts with Tessen", "+20 max HP", "Divine barrier absorbs 1 hit every 20s", "Mon pickups have a 5% chance to also heal you"],
    ultName: "Divine Judgement",
    ultKanji: "神",
    ultDesc: "An expanding sacred beam for 3s. Purifies foes (disables specials for 5s) and heals 5 HP per hit.",
    accent: "hsl(180, 70%, 75%)",
  },
  {
    id: "kagebushi",
    kanji: "黒",
    name: "Kagebushi",
    role: "Cursed Shadow Warrior",
    bonuses: ["Starts with Odachi", "+15% damage", "An untargetable shadow clone mimics your attacks at 40% damage (0.5s delay)"],
    ultName: "Shadow Consume",
    ultKanji: "闇",
    ultDesc: "Merge with shadow for 6s: 2× damage, +30% speed. Every hit doubles damage. Explodes on end.",
    accent: "hsl(250, 30%, 40%)",
  },
];

export const getClass = (id: ClassId): ClassDef =>
  CLASSES.find(c => c.id === id) ?? CLASSES[CLASSES.length - 1];

// ============================================================================
// SECONDARIES
// ============================================================================

// Secondary weapon catalog (Phase 3).
// Each weapon has its own kanji, ammo model, fire behavior, and effect.
// Weapons are mostly handled via per-kind logic inside GhostGame.ts —
// this file just defines static metadata and per-class option pairs.



export type SecondaryId =
  | "katana"        // Master sword — the classic Jin Sakai blade
  | "yumi"          // Longbow — slow, piercing arrow, big damage
  | "kunai"         // Throwing kunai — fast, triple throw, low damage
  | "smoke_bomb"    // Drops smoke at feet, blinds + slows enemies in cloud
  | "tetsubishi"    // Caltrop bomb — arcs to cursor, AoE burst + small DoT field
  | "kusarigama"    // Chain-sickle — short hookshot that pulls enemy + bleeds
  | "crossbow"      // Repeating crossbow — burst of 3 fast bolts, mid damage
  // ===== Phase A additions =====
  | "tessen"        // Iron war fan — wide cone melee, fast, 10% passive deflect
  | "jutte"         // Pronged truncheon — fast, 25% disarm chance
  | "ono"           // War axe — slow heavy hit, every 5th cleaves half-circle
  | "shuriken_wheel"// Bouncing throwing disc, returns boomerang-style
  | "flame_spear"   // Long piercing thrust, 4s burn DoT
  | "twin_sai"      // Dual fast hits per swing, 15% stun
  | "odachi"        // Massive 270° AoE, +2 HP per kill
  | "blowgun"       // Silent darts, stacking poison DoT, reload-based
  | "tate";         // Shield — bash + grants block HP / regen passively

export interface SecondaryDef {
  id: SecondaryId;
  kanji: string;
  name: string;
  desc: string;
  // Aim style — for projectiles, "aim" means fired toward player facing.
  // "self" means dropped at the player's feet (smoke).
  // "arc" means lobbed toward the cursor / facing direction with travel time.
  aim: "aim" | "self" | "arc";
  maxAmmo: number;        // ammo capacity
  startAmmo: number;      // ammo at run start
  // Time (s) for one ammo charge to passively regenerate (0 = no regen).
  // We always grant some regen so weapons can't be permanently empty.
  regenTime: number;
  // Cooldown between fires, in seconds.
  fireCooldown: number;
  // Per-shot damage multiplier vs baseline katana damage.
  damageMul: number;
  // Optional: a flat number of projectiles per fire (for kunai / crossbow burst).
  projectiles: number;
  // Spread in radians applied across the burst (0 = perfectly aligned).
  spread: number;
  // Tint for HUD label / projectile.
  accent: string;          // hsl(...)
  // === Stat scaling (Phase: stats rework) ===
  // How strongly the player's base damage stat (perks.damage) influences
  // each shot/swing of this weapon. 1.0 = full scale, <1 = scales worse.
  // Heavy/slow weapons scale better; spammy weapons scale worse.
  dmgScale: number;
  // How strongly Dexterity reduces this weapon's fireCooldown. 0 = no
  // attack-speed scaling, 1 = full scaling. Light weapons (kunai, blowgun)
  // benefit most; massive weapons (odachi, ono) barely benefit.
  dexScale: number;
  // ===== Phase 2 (hitstun + blocking) =====
  // Base hitstun (in seconds) applied to a normal enemy on hit.
  // Multiplied by (1 - enemy.hitstunResist) and scaled by damage.
  // Heavy slow weapons stun harder; spammy ones stun less.
  hitstun: number;
  // True for "heavy" two-handed weapons. Heavy secondaries grant the
  // wielder access to active blocking (via blockHp pool).
  heavy?: boolean;
  // Time to fully reload an empty magazine (s). 0 = uses regen instead.
  // When > 0, ammo regen is disabled and the weapon enters a reload
  // state when emptied.
  reloadTime?: number;
  // ===== Weapon-rewrite =====
  // True for the shield (Tate). Marks a weapon that lets the wielder
  // hold the block key to drain the block-HP pool.
  block?: boolean;
}

export const SECONDARIES: Record<SecondaryId, SecondaryDef> = {
  katana: {
    id: "katana",
    kanji: "刀",
    name: "Katana",
    desc: "The samurai's soul. Swift arc strikes, long reach, no ammo.",
    aim: "self",
    maxAmmo: 0, startAmmo: 0,
    regenTime: 0, fireCooldown: 0.45,
    damageMul: 1.0,
    projectiles: 1, spread: 0,
    accent: "hsl(45, 95%, 60%)",
    dmgScale: 1.0, dexScale: 0.8,
    hitstun: 0.22,
  },
  yumi: {
    id: "yumi",
    kanji: "弓",
    name: "Yumi (Longbow)",
    desc: "Slow charge. One piercing arrow, heavy damage.",
    aim: "aim",
    maxAmmo: 5,
    startAmmo: 5,
    regenTime: 6,
    fireCooldown: 0.6,
    damageMul: 4.5,
    projectiles: 1,
    spread: 0,
    accent: "hsl(200, 80%, 65%)",
    dmgScale: 1.2, dexScale: 0.4,
    hitstun: 0.55, heavy: true,
  },
  kunai: {
    id: "kunai",
    kanji: "苦",
    name: "Throwing Kunai",
    desc: "Fast triple-throw. Low damage, high spam.",
    aim: "aim",
    maxAmmo: 12,
    startAmmo: 12,
    regenTime: 2.5,
    fireCooldown: 0.35,
    damageMul: 0.9,
    projectiles: 3,
    spread: 0.25,
    accent: "hsl(260, 50%, 75%)",
    dmgScale: 0.5, dexScale: 1.1,
    hitstun: 0.10,
  },
  smoke_bomb: {
    id: "smoke_bomb",
    kanji: "煙",
    name: "Smoke Bomb",
    desc: "Drops a small cloud at your feet. Slows and disorients enemies — disoriented foes count as stealth kills.",
    aim: "self",
    maxAmmo: 2,
    startAmmo: 2,
    regenTime: 16,
    fireCooldown: 0.9,
    damageMul: 0,
    projectiles: 1,
    spread: 0,
    accent: "hsl(220, 20%, 80%)",
    dmgScale: 0, dexScale: 0.5,
    hitstun: 0.0,
  },
  tetsubishi: {
    id: "tetsubishi",
    kanji: "爆",
    name: "Tetsubishi Bomb",
    desc: "Lobbed bomb. Bursts on landing, leaves a small caltrop field.",
    aim: "arc",
    maxAmmo: 4,
    startAmmo: 4,
    regenTime: 8,
    fireCooldown: 0.7,
    damageMul: 3.5,
    projectiles: 1,
    spread: 0,
    accent: "hsl(20, 80%, 55%)",
    dmgScale: 1.0, dexScale: 0.5,
    hitstun: 0.45,
  },
  kusarigama: {
    id: "kusarigama",
    kanji: "鎖",
    name: "Kusarigama (Chain-Sickle)",
    desc: "Short hookshot. Yanks the enemy to you and bleeds them.",
    aim: "aim",
    maxAmmo: 4,
    startAmmo: 4,
    regenTime: 5,
    fireCooldown: 0.5,
    damageMul: 1.4,
    projectiles: 1,
    spread: 0,
    accent: "hsl(0, 75%, 55%)",
    dmgScale: 0.9, dexScale: 0.7,
    hitstun: 0.3,
  },
  crossbow: {
    id: "crossbow",
    kanji: "弩",
    name: "Repeating Crossbow",
    desc: "Burst of 3 fast bolts. Mid-range, mid damage.",
    aim: "aim",
    maxAmmo: 9,
    startAmmo: 9,
    regenTime: 3.5,
    fireCooldown: 0.5,
    damageMul: 1.6,
    projectiles: 3,
    spread: 0.08,
    accent: "hsl(36, 90%, 65%)",
    dmgScale: 0.8, dexScale: 0.9,
    hitstun: 0.2, reloadTime: 1.8,
  },
  // ===== Phase A: 8 new secondaries =====
  tessen: {
    id: "tessen",
    kanji: "扇",
    name: "Tessen (Iron War Fan)",
    desc: "Wide cone swing. Passive 10% projectile deflect.",
    aim: "self",
    maxAmmo: 8,
    startAmmo: 8,
    regenTime: 2.0,
    fireCooldown: 0.25,
    damageMul: 0.8,
    projectiles: 1,
    spread: 0,
    accent: "hsl(45, 80%, 70%)",
    dmgScale: 0.6, dexScale: 1.0,
    hitstun: 0.12,
  },
  jutte: {
    id: "jutte",
    kanji: "十",
    name: "Jutte (Truncheon)",
    desc: "Fast strikes. 25% chance to disarm — target can't attack for 2s.",
    aim: "self",
    maxAmmo: 10,
    startAmmo: 10,
    regenTime: 2.2,
    fireCooldown: 0.3,
    damageMul: 0.7,
    projectiles: 1,
    spread: 0,
    accent: "hsl(210, 30%, 70%)",
    dmgScale: 0.5, dexScale: 1.1,
    hitstun: 0.18,
  },
  ono: {
    id: "ono",
    kanji: "斧",
    name: "Ono (War Axe)",
    desc: "Slow but devastating. Every 5th hit cleaves a half-circle in front.",
    aim: "self",
    maxAmmo: 5,
    startAmmo: 5,
    regenTime: 5,
    fireCooldown: 0.85,
    damageMul: 3.2,
    projectiles: 1,
    spread: 0,
    accent: "hsl(20, 50%, 50%)",
    dmgScale: 1.4, dexScale: 0.25,
    hitstun: 0.85, heavy: true,
  },
  shuriken_wheel: {
    id: "shuriken_wheel",
    kanji: "輪",
    name: "Shuriken Wheel",
    desc: "Spinning disc. Bounces between up to 4 enemies, then returns.",
    aim: "aim",
    maxAmmo: 4,
    startAmmo: 4,
    regenTime: 5,
    fireCooldown: 0.7,
    damageMul: 1.8,
    projectiles: 1,
    spread: 0,
    accent: "hsl(190, 60%, 70%)",
    dmgScale: 0.85, dexScale: 0.75,
    hitstun: 0.25,
  },
  flame_spear: {
    id: "flame_spear",
    kanji: "焔",
    name: "Flame Spear (Hokiyari)",
    desc: "Piercing thrust. Long melee range. Sets enemies ablaze for 4s.",
    aim: "aim",
    maxAmmo: 6,
    startAmmo: 6,
    regenTime: 4,
    fireCooldown: 0.55,
    damageMul: 2.2,
    projectiles: 1,
    spread: 0,
    accent: "hsl(15, 90%, 55%)",
    dmgScale: 1.1, dexScale: 0.55,
    hitstun: 0.5, heavy: true,
  },
  twin_sai: {
    id: "twin_sai",
    kanji: "双",
    name: "Twin Sai",
    desc: "Two hits per swing. 15% chance to stun.",
    aim: "self",
    maxAmmo: 9,
    startAmmo: 9,
    regenTime: 2.5,
    fireCooldown: 0.28,
    damageMul: 0.55,
    projectiles: 2,
    spread: 0,
    accent: "hsl(280, 50%, 70%)",
    dmgScale: 0.45, dexScale: 1.2,
    hitstun: 0.10,
  },
  odachi: {
    id: "odachi",
    kanji: "大",
    name: "Odachi (Greatsword)",
    desc: "Slowest weapon. Massive 270° arc. +1 HP per kill while equipped (per-kill heal capped at 6).",
    aim: "self",
    maxAmmo: 4,
    startAmmo: 4,
    regenTime: 6.5,
    fireCooldown: 1.1,
    damageMul: 4.0,
    projectiles: 1,
    spread: 0,
    accent: "hsl(0, 80%, 50%)",
    dmgScale: 1.5, dexScale: 0.2,
    hitstun: 1.1, heavy: true,
  },
  blowgun: {
    id: "blowgun",
    kanji: "吹",
    name: "Fukiya (Blowgun)",
    desc: "Silent darts. Very fast, low damage. Stacking poison DoT. Reloads when emptied.",
    aim: "aim",
    maxAmmo: 14,
    startAmmo: 14,
    regenTime: 0,
    fireCooldown: 0.22,
    damageMul: 0.6,
    projectiles: 1,
    spread: 0.04,
    accent: "hsl(120, 50%, 55%)",
    dmgScale: 0.4, dexScale: 1.3,
    hitstun: 0.05, reloadTime: 1.6,
  },
  tate: {
    id: "tate",
    kanji: "盾",
    name: "Tate (War Shield)",
    desc: "A great wooden shield. Bashes foes in a short cone. Grants +20 block HP and +1.5 block regen/s while equipped.",
    aim: "self",
    maxAmmo: 6,
    startAmmo: 6,
    regenTime: 4,
    fireCooldown: 0.55,
    damageMul: 1.2,
    projectiles: 1,
    spread: 0,
    accent: "hsl(35, 60%, 55%)",
    dmgScale: 0.6, dexScale: 0.4,
    hitstun: 0.7, heavy: true, block: true,
  },
};

export const ALL_SECONDARY_IDS: SecondaryId[] = [
  "yumi", "kunai", "smoke_bomb", "tetsubishi", "kusarigama", "crossbow",
  "tessen", "jutte", "ono", "shuriken_wheel", "flame_spear", "twin_sai", "odachi", "blowgun", "tate",
];

// Each class lists the weapons it has thematic access to. The player picks
// TWO of these at class-select to fill the two equal weapon slots. Most
// classes include "katana" in their pool so the classic blade is always
// reachable; some elite/exotic classes intentionally omit it.
export const CLASS_WEAPON_OPTIONS: Record<ClassId, SecondaryId[]> = {
  kensei:    ["katana", "yumi", "kunai", "odachi"],
  shinobi:   ["katana", "kunai", "smoke_bomb", "blowgun"],
  ronin:     ["katana", "kusarigama", "crossbow", "twin_sai"],
  yamabushi: ["katana", "tate", "tetsubishi", "ono"],
  onna:      ["katana", "yumi", "kunai", "twin_sai"],
  dokkaebi:  ["katana", "smoke_bomb", "tetsubishi", "tessen"],
  kagemusha: ["katana", "smoke_bomb", "kunai", "shuriken_wheel"],
  berserker: ["katana", "ono", "kusarigama", "odachi"],
  arashi:    ["katana", "yumi", "crossbow", "shuriken_wheel"],
  tetsubo:   ["ono", "tate", "tetsubishi", "katana"],
  samurai:   ["katana", "yumi", "crossbow", "tate"],
  // ===== Phase A — exotic classes (starting weapon listed first) =====
  onmyoji:    ["blowgun", "kunai", "tessen", "katana"],
  hatamoto:   ["flame_spear", "tate", "katana", "ono"],
  kunoichi:   ["twin_sai", "kunai", "blowgun", "katana"],
  tsuchigumo: ["kusarigama", "blowgun", "katana", "tessen"],
  miko:       ["tessen", "blowgun", "katana", "tate"],
  kagebushi:  ["odachi", "kusarigama", "shuriken_wheel", "katana"],
};

// Back-compat alias. Old call sites take a tuple of two; new code uses
// the array form above. Kept so older imports compile until callers are
// migrated. The first two entries of each pool are the "default" pair.
export const CLASS_SECONDARY_OPTIONS: Record<ClassId, [SecondaryId, SecondaryId]> =
  Object.fromEntries(
    Object.entries(CLASS_WEAPON_OPTIONS).map(([k, v]) => [k, [v[0], v[1]]]),
  ) as Record<ClassId, [SecondaryId, SecondaryId]>;

export const getSecondary = (id: SecondaryId): SecondaryDef => SECONDARIES[id];

// Melee secondaries swing in front of the player like the katana
// (def.aim === "self" and handled via swingMeleeSecondary). All others
// are ranged (projectile or thrown).
const MELEE_SECONDARY_IDS: SecondaryId[] = [
  "tessen", "jutte", "ono", "twin_sai", "odachi", "tate",
];

export const isMeleeSecondary = (id: SecondaryId): boolean =>
  MELEE_SECONDARY_IDS.includes(id);

export const isRangedSecondary = (id: SecondaryId): boolean =>
  !MELEE_SECONDARY_IDS.includes(id);

// Heavy weapons grant blocking. Throwables/light projectiles do not.
export const isHeavySecondary = (id: SecondaryId): boolean =>
  !!SECONDARIES[id]?.heavy;

// Shield-class weapons that enable hold-to-block.
export const isBlockWeapon = (id: SecondaryId): boolean =>
  !!SECONDARIES[id]?.block;

// Reload-based weapons (blowgun, crossbow). When emptied, the player must
// wait def.reloadTime seconds before any ammo is restored (full mag).
export const usesReload = (id: SecondaryId): boolean =>
  !!SECONDARIES[id]?.reloadTime && (SECONDARIES[id].reloadTime as number) > 0;

// ============================================================================
// SHOP
// ============================================================================

// Phase 4: Between-wave shop.
// Pure data + pure helpers. The actual mutation of game state happens
// inside GhostGame.applyShopItem so this module stays free of engine deps.



export type ShopRarity = "common" | "rare" | "legendary";

export type ShopEffectId =
  | "heal_full"
  | "heal_half"
  | "max_hp"
  // ===== Stats rework — rarity-tiered stat upgrades =====
  // Damage: per-weapon perks. Common = +15% multiplier, rare = +5 flat,
  // legendary = +25 flat. The katana variant is always available; each
  // secondary variant only appears in the offer when that weapon is
  // currently equipped.
  | "dmg_katana_common"  | "dmg_katana_rare"  | "dmg_katana_leg"
  | `dmg_${SecondaryId}_common`
  | `dmg_${SecondaryId}_rare`
  | `dmg_${SecondaryId}_leg`
  // Dexterity (replaces flat attack-speed shop perks).
  | "dex_common" | "dex_rare" | "dex_leg"
  // Movement speed.
  | "spd_common" | "spd_rare" | "spd_leg"
  // Defense (no common variant by design).
  | "def_rare" | "def_leg"
  // Max HP (cap removed).
  | "hp_common" | "hp_rare" | "hp_leg"
  | "crit"
  | "ult_charge"
  | "ammo_refill"
  | "ammo_cap"
  | "ammo_regen"
  | "secondary_dmg_global"
  | "lifesteal"
  | "hp_regen"
  // ===== Phase A — 12 new perks (effects added in Phase D) =====
  | "perk_crimson_blade"
  | "perk_stone_stance"
  | "perk_ghost_steps"
  | "perk_void_shard"
  | "perk_hungry_blade"
  | "perk_war_paint"
  | "perk_cursed_eye"
  | "perk_raging_current"
  | "perk_twin_fang"
  | "perk_bone_armor"
  | "perk_drifting_leaves"
  | "perk_soul_collector"
  // ===== Secondary weapon scrolls (equip into open slot, or replace slot 2) =====
  | `secondary_${SecondaryId}`;

export interface ShopItem {
  id: string;             // unique instance id (set when rolled)
  effect: ShopEffectId;
  kanji: string;
  name: string;
  desc: string;
  price: number;          // in Mon (文)
  rarity: ShopRarity;
}

interface PoolEntry {
  effect: ShopEffectId;
  kanji: string;
  name: string;
  desc: string;
  priceMin: number;
  priceMax: number;
  rarity: ShopRarity;
}

// 13 items in the pool, "generous" pricing (most 15–60 Mon).
export const SHOP_POOL: PoolEntry[] = [
  { effect: "heal_full",     kanji: "癒", name: "Full Mend",        desc: "Restore all HP.",                          priceMin: 40, priceMax: 55, rarity: "common"   },
  { effect: "heal_half",     kanji: "薬", name: "Salve",             desc: "Restore 40% of your max HP.",              priceMin: 18, priceMax: 25, rarity: "common"   },
  { effect: "crit",          kanji: "極", name: "Killing Eye",       desc: "+8% crit chance (crits deal 3× damage).",  priceMin: 40, priceMax: 60, rarity: "rare"     },
  { effect: "ult_charge",    kanji: "気", name: "Spirit Surge",      desc: "Instantly fills 50% of your ultimate.",    priceMin: 25, priceMax: 35, rarity: "common"   },
  { effect: "ammo_refill",   kanji: "充", name: "Ammo Cache",        desc: "Refill all secondary ammo.",               priceMin: 15, priceMax: 22, rarity: "common"   },
  { effect: "ammo_cap",      kanji: "袋", name: "Wider Quiver",      desc: "+2 max ammo on every secondary.",          priceMin: 30, priceMax: 45, rarity: "rare"     },
  { effect: "ammo_regen",    kanji: "練", name: "Trained Hand",      desc: "−25% secondary regen time.",               priceMin: 35, priceMax: 50, rarity: "rare"     },
  { effect: "secondary_dmg_global", kanji: "矢", name: "Sharpened Tips", desc: "+15% damage to ALL secondary weapons.", priceMin: 38, priceMax: 55, rarity: "rare" },
  { effect: "lifesteal",     kanji: "吸", name: "Crimson Rite",      desc: "Heal +1 HP on every kill (per-kill heal capped at 6).",          priceMin: 40, priceMax: 55, rarity: "rare"     },
  { effect: "hp_regen",      kanji: "息", name: "Steady Breath",     desc: "+0.5 HP/s passive regeneration.",          priceMin: 30, priceMax: 45, rarity: "rare"     },
  // ===== Stat upgrades (rarity-tiered) =====
  // Damage — Katana (always available).
  { effect: "dmg_katana_common", kanji: "刃", name: "Whetstone",          desc: "+15% katana damage.",                       priceMin: 28, priceMax: 42, rarity: "common"    },
  { effect: "dmg_katana_rare",   kanji: "刃", name: "Honed Whetstone",    desc: "+5 flat katana damage.",                    priceMin: 50, priceMax: 70, rarity: "rare"      },
  { effect: "dmg_katana_leg",    kanji: "刃", name: "Masterforged Edge",  desc: "+25 flat katana damage.",                   priceMin: 95, priceMax: 130, rarity: "legendary" },
  // Dexterity (replaces flat attack-speed perks).
  { effect: "dex_common", kanji: "敏", name: "Light Hands",      desc: "+15% dexterity (attack speed scales with weapon).", priceMin: 28, priceMax: 42, rarity: "common"   },
  { effect: "dex_rare",   kanji: "敏", name: "Trained Reflexes", desc: "+5 dexterity.",                                     priceMin: 50, priceMax: 70, rarity: "rare"     },
  { effect: "dex_leg",    kanji: "敏", name: "Wind's Grace",     desc: "+25 dexterity.",                                    priceMin: 95, priceMax: 130, rarity: "legendary" },
  // Movement speed.
  { effect: "spd_common", kanji: "風", name: "Wind Step",        desc: "+15% movement speed.",                              priceMin: 25, priceMax: 38, rarity: "common"   },
  { effect: "spd_rare",   kanji: "風", name: "Swift Sandals",    desc: "+5% flat movement speed.",                          priceMin: 42, priceMax: 60, rarity: "rare"     },
  { effect: "spd_leg",    kanji: "風", name: "Boots of the Gale",desc: "+25% flat movement speed.",                         priceMin: 90, priceMax: 120, rarity: "legendary" },
  // Defense (no common variant).
  { effect: "def_rare",   kanji: "盾", name: "Lacquered Plate",  desc: "+5 defense (flat damage reduction).",              priceMin: 55, priceMax: 75, rarity: "rare"      },
  { effect: "def_leg",    kanji: "盾", name: "Daimyo's Cuirass", desc: "+25 defense.",                                     priceMin: 100, priceMax: 140, rarity: "legendary" },
  // Max HP (cap removed).
  { effect: "hp_common",  kanji: "命", name: "Iron Resolve",     desc: "+15% max HP and heals fully.",                     priceMin: 32, priceMax: 48, rarity: "common"    },
  { effect: "hp_rare",    kanji: "命", name: "Steel Heart",      desc: "+5 max HP and heals 5.",                            priceMin: 48, priceMax: 65, rarity: "rare"      },
  { effect: "hp_leg",     kanji: "命", name: "Oni's Vigor",      desc: "+25 max HP and heals 25.",                          priceMin: 95, priceMax: 130, rarity: "legendary" },
  // ===== Per-weapon damage upgrades (only shown when equipped) =====
  ...buildWeaponDamagePool(),
  // ===== Phase A — 12 new purchasable perks =====
  { effect: "perk_crimson_blade",   kanji: "紅", name: "Crimson Blade",      desc: "Each kill bloods your blade for 5s — your next hit applies a bonus bleed.",   priceMin: 35, priceMax: 50, rarity: "rare"      },
  { effect: "perk_stone_stance",    kanji: "岩", name: "Stone Stance",       desc: "Stand still 1s or more to gain −20% damage taken and +15% damage dealt.",     priceMin: 40, priceMax: 55, rarity: "rare"      },
  { effect: "perk_ghost_steps",     kanji: "歩", name: "Ghost Steps",        desc: "Move for 3s straight to gain +15% speed until you stop moving.",               priceMin: 30, priceMax: 45, rarity: "common"    },
  { effect: "perk_void_shard",      kanji: "虚", name: "Void Shard",         desc: "Every 20th kill spawns a shard that blocks the next projectile to hit you.",   priceMin: 45, priceMax: 65, rarity: "rare"      },
  { effect: "perk_hungry_blade",    kanji: "飢", name: "Hungry Blade",       desc: "+1 HP on every kill (per-kill heal capped at 6).",                                priceMin: 50, priceMax: 70, rarity: "rare"      },
  { effect: "perk_war_paint",       kanji: "戦", name: "War Paint",          desc: "Start each wave with +20% damage for 10s, or until you take a hit.",           priceMin: 35, priceMax: 50, rarity: "common"    },
  { effect: "perk_cursed_eye",      kanji: "眼", name: "Cursed Eye",         desc: "See every enemy's HP bar, and deal +5% damage to foes below half HP.",        priceMin: 40, priceMax: 55, rarity: "rare"      },
  { effect: "perk_raging_current",  kanji: "波", name: "Raging Current",     desc: "+2% attack speed per enemy on screen, capped at +20%.",                        priceMin: 55, priceMax: 75, rarity: "legendary" },
  { effect: "perk_twin_fang",       kanji: "牙", name: "Twin Fang",          desc: "Every 8th katana strike triggers a free secondary attack.",                    priceMin: 60, priceMax: 85, rarity: "legendary" },
  { effect: "perk_bone_armor",      kanji: "骨", name: "Bone Armor",         desc: "Once per run, survive a lethal hit at 1 HP with 3s of invulnerability.",      priceMin: 70, priceMax: 95, rarity: "legendary" },
  { effect: "perk_drifting_leaves", kanji: "葉", name: "Drifting Leaves",    desc: "Dashing leaves behind a 2s damaging leaf storm at your starting spot.",        priceMin: 45, priceMax: 60, rarity: "rare"      },
  { effect: "perk_soul_collector",  kanji: "魂", name: "Soul Collector",     desc: "Every 25 kills permanently grants +2 max HP for the rest of this run.",        priceMin: 50, priceMax: 70, rarity: "rare"      },
  // ===== Secondary weapon scrolls — equip into 2nd slot, swap with Tab =====
  // Pulled dynamically from SECONDARIES so we never drift out of sync.
  ...(Object.values(SECONDARIES).map((s): PoolEntry => {
    // Pricing tiers based on power: melee/utility cheaper, heavy hitters more.
    const heavy: SecondaryId[] = ["yumi", "ono", "odachi", "flame_spear", "shuriken_wheel"];
    const utility: SecondaryId[] = ["smoke_bomb", "tetsubishi", "jutte", "tessen", "blowgun"];
    const isHeavy = heavy.includes(s.id);
    const isUtility = utility.includes(s.id);
    const priceMin = isHeavy ? 70 : isUtility ? 45 : 55;
    const priceMax = isHeavy ? 95 : isUtility ? 65 : 80;
    const rarity: ShopRarity = isHeavy ? "legendary" : "rare";
    return {
      effect: `secondary_${s.id}` as ShopEffectId,
      kanji: s.kanji,
      name: `Weapon: ${s.name}`,
      desc: `Equip — Tab to swap with your starting weapon. ${s.desc}`,
      priceMin, priceMax, rarity,
    };
  })),
];

function buildWeaponDamagePool(): PoolEntry[] {
  // For each secondary, generate three rarity tiers. The actual offer roll
  // filters these by the player's currently equipped secondaries so heavy
  // weapons never appear in the offer for someone wielding a kunai.
  const out: PoolEntry[] = [];
  for (const wid of ALL_SECONDARY_IDS) {
    const def = SECONDARIES[wid];
    out.push({
      effect: `dmg_${wid}_common`,
      kanji: def.kanji,
      name: `${def.name} Mastery`,
      desc: `+15% ${def.name} damage.`,
      priceMin: 28, priceMax: 42, rarity: "common",
    });
    out.push({
      effect: `dmg_${wid}_rare`,
      kanji: def.kanji,
      name: `${def.name} Honed`,
      desc: `+5 flat ${def.name} damage.`,
      priceMin: 50, priceMax: 70, rarity: "rare",
    });
    out.push({
      effect: `dmg_${wid}_leg`,
      kanji: def.kanji,
      name: `${def.name} Forged`,
      desc: `+25 flat ${def.name} damage.`,
      priceMin: 95, priceMax: 130, rarity: "legendary",
    });
  }
  return out;
}

const REROLL_COST = 10;

let __shopUid = 1;

const rollPrice = (e: PoolEntry) =>
  Math.round(e.priceMin + Math.random() * (e.priceMax - e.priceMin));

const rollOne = (entry: PoolEntry): ShopItem => ({
  id: `shop_${__shopUid++}`,
  effect: entry.effect,
  kanji: entry.kanji,
  name: entry.name,
  desc: entry.desc,
  price: rollPrice(entry),
  rarity: entry.rarity,
});

// Roll N unique items (no duplicate effects in a single offer).
// `equippedSecondaries` filters per-weapon damage perks so the offer
// never advertises an upgrade for a weapon the player doesn't have.
export const rollShopOffer = (
  count = 6,
  equippedSecondaries: SecondaryId[] = [],
): ShopItem[] => {
  const equippedSet = new Set(equippedSecondaries);
  const pool = SHOP_POOL.filter((entry) => {
    const m = /^dmg_([a-z_]+)_(common|rare|leg)$/.exec(entry.effect);
    if (!m) return true;
    const wid = m[1];
    if (wid === "katana") return true;
    return equippedSet.has(wid as SecondaryId);
  });
  const out: ShopItem[] = [];
  for (let i = 0; i < count && pool.length > 0; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    const [entry] = pool.splice(idx, 1);
    out.push(rollOne(entry));
  }
  return out;
};

export const SHOP_REROLL_COST = REROLL_COST;

// ============================================================================
// CONSUMABLES
// ============================================================================

// Consumable items: rare on-kill drops the player can stash (3 slots) and
// trigger with hotkeys 1 / 2 / 3 mid-run. Effects are temporary buffs or
// instant restores — kept short so the engine stays the source of truth.

export type ConsumableId =
  | "rice_ball"     // heal 35 HP
  | "sake"          // +30% damage for 8s
  | "smoke_pellet"  // 2.5s invulnerability + brief enemy slow
  | "spirit_pearl"  // instantly fill the ultimate gauge
  | "iron_powder"   // refill block HP + +50% block regen for 10s
  | "wind_charm";   // +30% movement speed for 8s

export interface ConsumableDef {
  id: ConsumableId;
  kanji: string;
  name: string;
  desc: string;
  // Tint for HUD chip.
  accent: string;
  // Drop weight — higher = more common in the loot table.
  weight: number;
}

export const CONSUMABLES: Record<ConsumableId, ConsumableDef> = {
  rice_ball: {
    id: "rice_ball", kanji: "飯", name: "Rice Ball",
    desc: "Restore 35 HP instantly.",
    accent: "hsl(45 70% 75%)", weight: 30,
  },
  sake: {
    id: "sake", kanji: "酒", name: "Warm Sake",
    desc: "+30% damage for 8 seconds.",
    accent: "hsl(20 70% 60%)", weight: 22,
  },
  smoke_pellet: {
    id: "smoke_pellet", kanji: "煙", name: "Smoke Pellet",
    desc: "Vanish — 2.5s of invulnerability and a stunning cloud at your feet.",
    accent: "hsl(220 20% 80%)", weight: 14,
  },
  spirit_pearl: {
    id: "spirit_pearl", kanji: "珠", name: "Spirit Pearl",
    desc: "Instantly fill your ultimate gauge.",
    accent: "hsl(180 80% 70%)", weight: 8,
  },
  iron_powder: {
    id: "iron_powder", kanji: "鉄", name: "Iron Powder",
    desc: "Restore all block HP and triple block regen for 10s.",
    accent: "hsl(210 30% 70%)", weight: 14,
  },
  wind_charm: {
    id: "wind_charm", kanji: "風", name: "Wind Charm",
    desc: "+30% movement speed for 8 seconds.",
    accent: "hsl(190 70% 70%)", weight: 12,
  },
};

export const ALL_CONSUMABLE_IDS: ConsumableId[] = [
  "rice_ball", "sake", "smoke_pellet", "spirit_pearl", "iron_powder", "wind_charm",
];

// Roll a random consumable using weighted distribution.
export const rollConsumable = (): ConsumableId => {
  const ids = ALL_CONSUMABLE_IDS;
  const total = ids.reduce((s, id) => s + CONSUMABLES[id].weight, 0);
  let r = Math.random() * total;
  for (const id of ids) {
    r -= CONSUMABLES[id].weight;
    if (r <= 0) return id;
  }
  return ids[0];
};

// Maximum consumable slots the player can hold.
export const CONSUMABLE_SLOTS = 3;

// ============================================================================
// SAVE
// ============================================================================

// Resume-run save system (Phase 4).
//
// We persist a single in-progress run between waves so the player can close
// the tab, take a break, and pick up exactly where they left off via the
// "Continue Run" button on the main menu.
//
// Scope intentionally narrow: this is NOT meta-progression. There is one
// slot, it's keyed to the engine's serializable state, and it is wiped on
// death or when the player exits via "Retreat" mid-run.





const STORAGE_KEY = "tsushima.savedRun.v1";
const SCHEMA_VERSION = 1;

export interface SavedRun {
  v: number;
  savedAt: number;
  classId: ClassId;
  secondaryId: SecondaryId | null;
  // Snapshot of the engine's mutable run-state. Anything not listed here
  // resets to a fresh wave-start value when the run resumes.
  wave: number;
  level: number;
  xp: number;
  xpToNext: number;
  hp: number;
  maxHp: number;
  mon: number;
  honor: number;
  ghost: number;
  ultCharge: number;
  ultMax: number;
  blockHp: number;
  blockHpMax: number;
  equippedAbilities: string[];
  secondaryIds: (SecondaryId | null)[];
  secondaryAmmo: number[];
  secondaryAmmoMax: number[];
  secondaryReload: number[];
  secondaryReloadMax: number[];
  secondaryActiveSlot: number;
  consumables: (ConsumableId | null)[];
  // Replay payload: full numeric perks struct + the ordered list of level-up
  // pick ids. perks captures shop-bought numeric upgrades; acquiredPerks
  // captures level-up identity (so the perk badges in the HUD survive too).
  perks: Record<string, unknown>;
  acquiredPerks: string[];
  pendingLevelUps: number;
}

export function saveRun(snapshot: Omit<SavedRun, "v" | "savedAt">): void {
  if (typeof window === "undefined") return;
  try {
    const payload: SavedRun = {
      ...snapshot,
      v: SCHEMA_VERSION,
      savedAt: Date.now(),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.warn("[save] failed to persist run:", err);
  }
}

export function loadRun(): SavedRun | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedRun;
    if (!parsed || parsed.v !== SCHEMA_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearSavedRun(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function hasSavedRun(): boolean {
  return loadRun() !== null;
}

// ============================================================================
// BIOMES
// ============================================================================

// Phase 7 — Biomes & Stage Variety
//
// Each biome retints the arena, swaps the falling-particle motif (cherry
// petals → bamboo leaves → snow → embers → autumn leaves), and gently
// re-tunes the ambient music. Biomes rotate by wave bracket so a long run
// passes through Tsushima → bamboo → snowfield → burning village → castle.

export type BiomeId =
  | "tsushima"
  | "bamboo"
  | "snowfield"
  | "burning"
  | "castle";

export type BiomeParticleKind =
  | "petal"      // cherry blossom (default Tsushima)
  | "leaf"       // bamboo / castle autumn
  | "snow"
  | "ember";

export interface BiomeDef {
  id: BiomeId;
  name: string;          // English label
  kanji: string;         // 1–2 char JP label
  // Background palette (HSL strings, no alpha)
  skyInner: string;      // radial gradient center
  skyMid: string;        // radial gradient mid stop
  skyOuter: string;      // radial gradient outer stop
  groundLine: string;    // grid / stroke color for ground tiles
  // Sun / ambient orb
  sunInner: string;
  sunMid: string;
  sunOuter: string;      // typically alpha=0
  sunVisible: boolean;   // false hides the orb (e.g. snowfield overcast)
  // Falling particle config
  particle: {
    kind: BiomeParticleKind;
    count: number;
    color: () => string;     // HSL string for each spawned particle
    sizeMin: number;
    sizeMax: number;
    speedYMin: number;
    speedYMax: number;
    speedXMin: number;
    speedXMax: number;
  };
  // Audio hints (consumed by audio.setBiome)
  audio: {
    droneFreq: number;       // Hz, root drone
    drone2Freq: number;      // Hz, harmony drone
    windFreq: number;        // bandpass center for wind noise
    windGain: number;        // 0..0.2 — louder for snow/burning
  };
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);

export const BIOMES: Record<BiomeId, BiomeDef> = {
  tsushima: {
    id: "tsushima",
    name: "Tsushima Coast",
    kanji: "対馬",
    skyInner: "hsl(20, 25%, 12%)",
    skyMid: "hsl(0, 30%, 6%)",
    skyOuter: "hsl(0, 0%, 2%)",
    groundLine: "hsl(36, 30%, 80%)",
    sunInner: "hsl(12, 95%, 58%)",
    sunMid: "hsl(358, 78%, 40%)",
    sunOuter: "hsla(358, 80%, 20%, 0)",
    sunVisible: true,
    particle: {
      kind: "petal",
      count: 110,
      color: () => `hsl(${350 + Math.random() * 30}, 70%, ${40 + Math.random() * 20}%)`,
      sizeMin: 3, sizeMax: 7,
      speedYMin: 15, speedYMax: 40,
      speedXMin: 10, speedXMax: 30,
    },
    audio: { droneFreq: 110, drone2Freq: 165, windFreq: 700, windGain: 0.06 },
  },

  bamboo: {
    id: "bamboo",
    name: "Bamboo Forest",
    kanji: "竹林",
    skyInner: "hsl(150, 25%, 10%)",
    skyMid: "hsl(155, 35%, 5%)",
    skyOuter: "hsl(150, 20%, 2%)",
    groundLine: "hsl(85, 30%, 70%)",
    sunInner: "hsl(75, 70%, 65%)",
    sunMid: "hsl(95, 50%, 35%)",
    sunOuter: "hsla(95, 50%, 15%, 0)",
    sunVisible: true,
    particle: {
      kind: "leaf",
      count: 95,
      color: () => `hsl(${85 + Math.random() * 30}, ${50 + Math.random() * 25}%, ${35 + Math.random() * 20}%)`,
      sizeMin: 4, sizeMax: 8,
      speedYMin: 20, speedYMax: 45,
      speedXMin: 25, speedXMax: 55,
    },
    audio: { droneFreq: 98, drone2Freq: 147, windFreq: 520, windGain: 0.05 },
  },

  snowfield: {
    id: "snowfield",
    name: "Snowfield",
    kanji: "雪原",
    skyInner: "hsl(210, 20%, 18%)",
    skyMid: "hsl(215, 25%, 9%)",
    skyOuter: "hsl(220, 25%, 4%)",
    groundLine: "hsl(210, 40%, 92%)",
    sunInner: "hsla(210, 30%, 80%, 0.5)",
    sunMid: "hsla(220, 30%, 50%, 0.2)",
    sunOuter: "hsla(220, 30%, 30%, 0)",
    sunVisible: false,
    particle: {
      kind: "snow",
      count: 160,
      color: () => `hsl(${200 + Math.random() * 20}, ${20 + Math.random() * 15}%, ${85 + Math.random() * 12}%)`,
      sizeMin: 1.5, sizeMax: 3.5,
      speedYMin: 25, speedYMax: 55,
      speedXMin: -15, speedXMax: 25,
    },
    audio: { droneFreq: 87, drone2Freq: 130, windFreq: 1100, windGain: 0.11 },
  },

  burning: {
    id: "burning",
    name: "Burning Village",
    kanji: "焔郷",
    skyInner: "hsl(15, 70%, 20%)",
    skyMid: "hsl(8, 65%, 8%)",
    skyOuter: "hsl(0, 50%, 3%)",
    groundLine: "hsl(20, 60%, 70%)",
    sunInner: "hsl(35, 100%, 65%)",
    sunMid: "hsl(15, 90%, 45%)",
    sunOuter: "hsla(0, 80%, 20%, 0)",
    sunVisible: true,
    particle: {
      kind: "ember",
      count: 180,
      color: () => `hsl(${15 + Math.random() * 30}, ${85 + Math.random() * 15}%, ${55 + Math.random() * 25}%)`,
      sizeMin: 1.5, sizeMax: 3.5,
      speedYMin: -45, speedYMax: -15, // embers rise
      speedXMin: -20, speedXMax: 20,
    },
    audio: { droneFreq: 73, drone2Freq: 110, windFreq: 380, windGain: 0.13 },
  },

  castle: {
    id: "castle",
    name: "Castle Courtyard",
    kanji: "天守",
    skyInner: "hsl(280, 30%, 14%)",
    skyMid: "hsl(265, 35%, 6%)",
    skyOuter: "hsl(250, 30%, 3%)",
    groundLine: "hsl(40, 50%, 75%)",
    sunInner: "hsl(45, 90%, 70%)",
    sunMid: "hsl(30, 75%, 45%)",
    sunOuter: "hsla(20, 60%, 20%, 0)",
    sunVisible: true,
    particle: {
      kind: "leaf",
      count: 120,
      color: () => `hsl(${20 + Math.random() * 30}, ${65 + Math.random() * 25}%, ${40 + Math.random() * 20}%)`,
      sizeMin: 3.5, sizeMax: 7,
      speedYMin: 22, speedYMax: 50,
      speedXMin: 15, speedXMax: 45,
    },
    audio: { droneFreq: 130, drone2Freq: 196, windFreq: 850, windGain: 0.07 },
  },
};

// Map a wave number to a biome. Brackets of 5 waves so each biome hosts
// exactly one boss fight. After castle (wave 25+) we cycle but skip Tsushima
// so endgame stays varied.
export function biomeForWave(wave: number): BiomeId {
  if (wave <= 4) return "tsushima";
  if (wave <= 9) return "bamboo";
  if (wave <= 14) return "snowfield";
  if (wave <= 19) return "burning";
  if (wave <= 24) return "castle";
  // Endless cycle past wave 25 (skip Tsushima for variety)
  const cycle: BiomeId[] = ["bamboo", "snowfield", "burning", "castle"];
  return cycle[Math.floor((wave - 25) / 5) % cycle.length];
}

export function randomBiomeColor(biome: BiomeDef) { void rand; return biome.particle.color(); }

// ============================================================================
// AUDIO
// ============================================================================

// Procedural audio engine using Web Audio API.
// No external assets — every sound is synthesized on the fly.
// Themed for a samurai/sumi-e atmosphere: katana slashes, parry clangs,
// level-up chime, boss roar, and an ambient shamisen-flavored loop.

type Sfx =
  | "slash"
  | "stealth"
  | "parry"
  | "hit"
  | "playerHit"
  | "kill"
  | "bossRoar"
  | "levelUp"
  | "waveStart"
  | "defeat"
  // Phase 6 — per-weapon and shop SFX
  | "arrowHit"
  | "kunaiHit"
  | "crossbowSnap"
  | "bombBoom"
  | "hookClink"
  | "smokeWoosh"
  | "shopBuy"
  | "monPing"
  // Phase 4 — ability + impact-layer SFX
  | "slashShort"
  | "slashMid"
  | "slashLong"
  | "armorRing"
  | "fleshHit"
  | "phantomSlash"
  | "bladeStorm"
  | "deathMarkSeal"
  | "soulRendBass"
  | "executeThud"
  | "warHornCry"
  | "timeSlowSwell"
  | "bossDeathRumble";

class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicNodes: { stop: () => void } | null = null;
  private musicTargetGain = 0.18;
  private bossMode = false;
  private muted = false;
  // Phase 7 — handles to live drone/wind nodes so we can retune per biome.
  private droneOsc: OscillatorNode | null = null;
  private drone2Osc: OscillatorNode | null = null;
  private windFilter: BiquadFilterNode | null = null;
  private windGain: GainNode | null = null;

  ensure() {
    if (this.ctx) return this.ctx;
    const Ctor: typeof AudioContext =
      (window as unknown as { AudioContext: typeof AudioContext; webkitAudioContext?: typeof AudioContext }).AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    this.ctx = new Ctor();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 0.9;
    this.master.connect(this.ctx.destination);

    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = 0;
    this.musicGain.connect(this.master);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.value = 0.85;
    this.sfxGain.connect(this.master);

    return this.ctx;
  }

  // Browsers require a user gesture to start audio
  async resume() {
    const ctx = this.ensure();
    if (!ctx) return;
    if (ctx.state === "suspended") {
      try { await ctx.resume(); } catch { /* ignore */ }
    }
  }

  setMuted(m: boolean) {
    this.muted = m;
    if (this.master) this.master.gain.value = m ? 0 : 0.9;
  }

  isMuted() { return this.muted; }

  play(name: Sfx) {
    const ctx = this.ensure();
    if (!ctx || !this.sfxGain) return;
    const t = ctx.currentTime;
    switch (name) {
      case "slash": this.synthSlash(ctx, t, 0.55); break;
      case "stealth": this.synthSlash(ctx, t, 0.25, true); break;
      case "parry": this.synthClang(ctx, t); break;
      case "hit": this.synthThud(ctx, t, 220, 0.4); break;
      case "playerHit": this.synthThud(ctx, t, 110, 0.7); break;
      case "kill": this.synthThud(ctx, t, 90, 0.55); break;
      case "bossRoar": this.synthBossRoar(ctx, t); break;
      case "levelUp": this.synthLevelUp(ctx, t); break;
      case "waveStart": this.synthGong(ctx, t, 180, 0.6); break;
      case "defeat": this.synthGong(ctx, t, 80, 1.2); break;
      // Per-weapon impacts (Phase 6)
      case "arrowHit":      this.synthArrowHit(ctx, t); break;
      case "kunaiHit":      this.synthKunaiHit(ctx, t); break;
      case "crossbowSnap":  this.synthCrossbowSnap(ctx, t); break;
      case "bombBoom":      this.synthBombBoom(ctx, t); break;
      case "hookClink":     this.synthHookClink(ctx, t); break;
      case "smokeWoosh":    this.synthSmokeWoosh(ctx, t); break;
      case "shopBuy":       this.synthShopBuy(ctx, t); break;
      case "monPing":       this.synthMonPing(ctx, t); break;
      // Phase 4
      case "slashShort":     this.synthSlashTier(ctx, t, 0); break;
      case "slashMid":       this.synthSlashTier(ctx, t, 1); break;
      case "slashLong":      this.synthSlashTier(ctx, t, 2); break;
      case "armorRing":      this.synthArmorRing(ctx, t); break;
      case "fleshHit":       this.synthFleshHit(ctx, t); break;
      case "phantomSlash":   this.synthPhantomSlash(ctx, t); break;
      case "bladeStorm":     this.synthBladeStorm(ctx, t); break;
      case "deathMarkSeal":  this.synthDeathMarkSeal(ctx, t); break;
      case "soulRendBass":   this.synthSoulRendBass(ctx, t); break;
      case "executeThud":    this.synthExecuteThud(ctx, t); break;
      case "warHornCry":     this.synthWarHornCry(ctx, t); break;
      case "timeSlowSwell":  this.synthTimeSlowSwell(ctx, t); break;
      case "bossDeathRumble": this.synthBossDeathRumble(ctx, t); break;
    }
  }

  // Phase 4 — randomised katana whoosh by swing tier (0=short jab, 1=mid arc, 2=long sweep).
  // Adds slight pitch + filter jitter so successive swings never sound identical.
  playSlashRandom(tier: 0 | 1 | 2 = 1) {
    const ctx = this.ensure();
    if (!ctx || !this.sfxGain) return;
    this.synthSlashTier(ctx, ctx.currentTime, tier);
  }

  // Phase 4 — placeholder hook: future swap to recorded sample assets.
  // Call once to register a buffer, then `play(name)` will use the sample.
  // (Not wired yet — engine still uses procedural synth.)
  private samples = new Map<string, AudioBuffer>();
  registerSample(_name: string, _buf: AudioBuffer) {
    this.samples.set(_name, _buf);
  }

  // ---- Phase 6 weapon/UX synths ----
  private synthArrowHit(ctx: AudioContext, t: number) {
    // Sharp wood-thunk: short low sine + filtered noise tick.
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(180, t);
    o.frequency.exponentialRampToValueAtTime(80, t + 0.12);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.5, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
    o.connect(g).connect(this.sfxGain!);
    o.start(t); o.stop(t + 0.18);
    const n = this.makeNoise(ctx, 0.06);
    const hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 1800;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.35, t);
    ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
    n.connect(hp).connect(ng).connect(this.sfxGain!);
    n.start(t); n.stop(t + 0.07);
  }

  private synthKunaiHit(ctx: AudioContext, t: number) {
    // Quick metallic tick — short high sine ping.
    const o = ctx.createOscillator();
    o.type = "triangle";
    o.frequency.setValueAtTime(2400, t);
    o.frequency.exponentialRampToValueAtTime(1200, t + 0.07);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.22, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
    o.connect(g).connect(this.sfxGain!);
    o.start(t); o.stop(t + 0.1);
  }

  private synthCrossbowSnap(ctx: AudioContext, t: number) {
    // Tight string-snap: bandpassed noise burst.
    const n = this.makeNoise(ctx, 0.08);
    const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.Q.value = 8;
    bp.frequency.setValueAtTime(1600, t);
    bp.frequency.exponentialRampToValueAtTime(700, t + 0.08);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.45, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
    n.connect(bp).connect(g).connect(this.sfxGain!);
    n.start(t); n.stop(t + 0.1);
  }

  private synthBombBoom(ctx: AudioContext, t: number) {
    // Low boom + noise body.
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(120, t);
    o.frequency.exponentialRampToValueAtTime(40, t + 0.45);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.7, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
    o.connect(g).connect(this.sfxGain!);
    o.start(t); o.stop(t + 0.6);
    const n = this.makeNoise(ctx, 0.4);
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 600;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.55, t);
    ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
    n.connect(lp).connect(ng).connect(this.sfxGain!);
    n.start(t); n.stop(t + 0.42);
  }

  private synthHookClink(ctx: AudioContext, t: number) {
    // Two metallic ticks — chain rattle.
    [0, 0.05].forEach((off) => {
      const o = ctx.createOscillator();
      o.type = "square";
      o.frequency.value = 1800 + Math.random() * 400;
      const g = ctx.createGain();
      const start = t + off;
      g.gain.setValueAtTime(0.0001, start);
      g.gain.exponentialRampToValueAtTime(0.18, start + 0.003);
      g.gain.exponentialRampToValueAtTime(0.0001, start + 0.06);
      o.connect(g).connect(this.sfxGain!);
      o.start(start); o.stop(start + 0.07);
    });
  }

  private synthSmokeWoosh(ctx: AudioContext, t: number) {
    // Soft white-noise puff with quick attack and longer tail.
    const n = this.makeNoise(ctx, 0.5);
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass";
    lp.frequency.setValueAtTime(1200, t);
    lp.frequency.exponentialRampToValueAtTime(400, t + 0.5);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.4, t + 0.04);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
    n.connect(lp).connect(g).connect(this.sfxGain!);
    n.start(t); n.stop(t + 0.52);
  }

  private synthShopBuy(ctx: AudioContext, t: number) {
    // Two-note chime: warm pentatonic interval.
    [523.25, 659.25].forEach((f, i) => {
      const start = t + i * 0.06;
      const o = ctx.createOscillator();
      o.type = "triangle";
      o.frequency.value = f;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, start);
      g.gain.exponentialRampToValueAtTime(0.25, start + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, start + 0.5);
      o.connect(g).connect(this.sfxGain!);
      o.start(start); o.stop(start + 0.55);
    });
  }

  private synthMonPing(ctx: AudioContext, t: number) {
    // Tiny coin "ting" — high triangle pluck.
    const o = ctx.createOscillator();
    o.type = "triangle";
    o.frequency.setValueAtTime(1760, t);
    o.frequency.exponentialRampToValueAtTime(1320, t + 0.18);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.12, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
    o.connect(g).connect(this.sfxGain!);
    o.start(t); o.stop(t + 0.24);
  }

  // ---- Synth helpers ----

  private synthSlash(ctx: AudioContext, t: number, gain: number, soft = false) {
    // White noise burst with a steep band-pass sweep — sounds like a katana cutting air.
    const dur = soft ? 0.18 : 0.28;
    const noise = this.makeNoise(ctx, dur);
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.Q.value = soft ? 6 : 4;
    bp.frequency.setValueAtTime(soft ? 2200 : 5200, t);
    bp.frequency.exponentialRampToValueAtTime(soft ? 600 : 900, t + dur);

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    noise.connect(bp).connect(g).connect(this.sfxGain!);
    noise.start(t);
    noise.stop(t + dur + 0.05);
  }

  private synthClang(ctx: AudioContext, t: number) {
    // Multiple inharmonic partials → metallic bell-like clang.
    const partials = [880, 1320, 1870, 2640, 3520];
    partials.forEach((f, i) => {
      const o = ctx.createOscillator();
      o.type = "triangle";
      o.frequency.setValueAtTime(f, t);
      o.frequency.exponentialRampToValueAtTime(f * 0.92, t + 0.5);
      const g = ctx.createGain();
      const peak = 0.22 / (i + 1);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(peak, t + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
      o.connect(g).connect(this.sfxGain!);
      o.start(t);
      o.stop(t + 0.65);
    });
    // Add a sharp metallic noise tick
    const noise = this.makeNoise(ctx, 0.08);
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 3000;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.5, t);
    ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
    noise.connect(hp).connect(ng).connect(this.sfxGain!);
    noise.start(t);
    noise.stop(t + 0.1);
  }

  private synthThud(ctx: AudioContext, t: number, freq: number, gain: number) {
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(freq, t);
    o.frequency.exponentialRampToValueAtTime(freq * 0.4, t + 0.18);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
    o.connect(g).connect(this.sfxGain!);
    o.start(t);
    o.stop(t + 0.25);

    // Add a body of noise for impact
    const noise = this.makeNoise(ctx, 0.12);
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 800;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(gain * 0.4, t);
    ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
    noise.connect(lp).connect(ng).connect(this.sfxGain!);
    noise.start(t);
    noise.stop(t + 0.14);
  }

  private synthBossRoar(ctx: AudioContext, t: number) {
    const dur = 1.8;
    // Deep growling oscillator stack with slow pitch wobble + filtered noise breath.
    const baseFreqs = [55, 82, 110];
    baseFreqs.forEach((f) => {
      const o = ctx.createOscillator();
      o.type = "sawtooth";
      o.frequency.setValueAtTime(f * 0.85, t);
      o.frequency.exponentialRampToValueAtTime(f, t + 0.3);
      o.frequency.exponentialRampToValueAtTime(f * 0.7, t + dur);
      // Vibrato
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 6;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = f * 0.04;
      lfo.connect(lfoGain).connect(o.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.18, t + 0.2);
      g.gain.setValueAtTime(0.18, t + dur - 0.5);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 900;
      o.connect(lp).connect(g).connect(this.sfxGain!);
      o.start(t); lfo.start(t);
      o.stop(t + dur); lfo.stop(t + dur);
    });
    // Breath / growl noise layer
    const noise = this.makeNoise(ctx, dur);
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.Q.value = 1.2;
    bp.frequency.setValueAtTime(400, t);
    bp.frequency.exponentialRampToValueAtTime(180, t + dur);
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.0001, t);
    ng.gain.exponentialRampToValueAtTime(0.35, t + 0.25);
    ng.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    noise.connect(bp).connect(ng).connect(this.sfxGain!);
    noise.start(t);
    noise.stop(t + dur);
  }

  private synthLevelUp(ctx: AudioContext, t: number) {
    // Bright pentatonic ascending arpeggio (Japanese yo-scale-ish): D F G A C
    const notes = [293.66, 349.23, 392.0, 440.0, 523.25];
    notes.forEach((f, i) => {
      const start = t + i * 0.07;
      const o = ctx.createOscillator();
      o.type = "triangle";
      o.frequency.value = f;
      const o2 = ctx.createOscillator();
      o2.type = "sine";
      o2.frequency.value = f * 2;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, start);
      g.gain.exponentialRampToValueAtTime(0.28, start + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, start + 0.8);
      o.connect(g);
      o2.connect(g);
      g.connect(this.sfxGain!);
      o.start(start); o2.start(start);
      o.stop(start + 0.85); o2.stop(start + 0.85);
    });
    // Final shimmer
    const shimmer = ctx.createOscillator();
    shimmer.type = "sine";
    shimmer.frequency.value = 1046.5;
    const sg = ctx.createGain();
    const st = t + notes.length * 0.07;
    sg.gain.setValueAtTime(0.0001, st);
    sg.gain.exponentialRampToValueAtTime(0.18, st + 0.05);
    sg.gain.exponentialRampToValueAtTime(0.0001, st + 1.2);
    shimmer.connect(sg).connect(this.sfxGain!);
    shimmer.start(st);
    shimmer.stop(st + 1.3);
  }

  private synthGong(ctx: AudioContext, t: number, base: number, dur: number) {
    const partials = [1, 1.5, 2.1, 3.2];
    partials.forEach((m, i) => {
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.value = base * m;
      const g = ctx.createGain();
      const peak = 0.3 / (i + 1);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(peak, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(this.sfxGain!);
      o.start(t);
      o.stop(t + dur + 0.05);
    });
  }

  private makeNoise(ctx: AudioContext, dur: number) {
    const buf = ctx.createBuffer(1, Math.max(1, Math.floor(ctx.sampleRate * dur)), ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    return src;
  }

  // ============= Phase 4 — ability + impact synths =============

  /** Tiered katana whoosh. tier: 0=short jab (snappy, brighter, quieter),
   *  1=mid arc (default), 2=long sweep (longer tail, lower start). Each
   *  call adds randomised pitch/filter jitter so swings sound varied. */
  private synthSlashTier(ctx: AudioContext, t: number, tier: 0 | 1 | 2) {
    const dur = tier === 0 ? 0.16 : tier === 1 ? 0.28 : 0.42;
    const startF = (tier === 0 ? 6200 : tier === 1 ? 5200 : 3800) * (0.92 + Math.random() * 0.16);
    const endF = (tier === 0 ? 1200 : tier === 1 ? 800 : 500) * (0.9 + Math.random() * 0.2);
    const gain = tier === 0 ? 0.42 : tier === 1 ? 0.55 : 0.65;
    const noise = this.makeNoise(ctx, dur);
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.Q.value = 4 + Math.random() * 2;
    bp.frequency.setValueAtTime(startF, t);
    bp.frequency.exponentialRampToValueAtTime(endF, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    noise.connect(bp).connect(g).connect(this.sfxGain!);
    noise.start(t); noise.stop(t + dur + 0.05);
  }

  /** Metallic "ring" overlay — used on top of `hit` when striking armoured/shielded foes. */
  private synthArmorRing(ctx: AudioContext, t: number) {
    const partials = [1320, 1980, 2640, 3520];
    partials.forEach((f, i) => {
      const o = ctx.createOscillator();
      o.type = "triangle";
      o.frequency.value = f * (0.97 + Math.random() * 0.06);
      const g = ctx.createGain();
      const peak = 0.18 / (i + 1);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(peak, t + 0.004);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
      o.connect(g).connect(this.sfxGain!);
      o.start(t); o.stop(t + 0.42);
    });
    const noise = this.makeNoise(ctx, 0.05);
    const hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 4000;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.4, t);
    ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    noise.connect(hp).connect(ng).connect(this.sfxGain!);
    noise.start(t); noise.stop(t + 0.06);
  }

  /** Wet flesh-thud overlay — short low-mid noise burst. Layered with `hit`. */
  private synthFleshHit(ctx: AudioContext, t: number) {
    const noise = this.makeNoise(ctx, 0.1);
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 320;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.45, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
    noise.connect(lp).connect(g).connect(this.sfxGain!);
    noise.start(t); noise.stop(t + 0.12);
  }

  /** Phantom Slash — ringing sweep + bright tail. */
  private synthPhantomSlash(ctx: AudioContext, t: number) {
    // High descending whoosh
    this.synthSlashTier(ctx, t, 2);
    // Plus a metallic resonance
    const o = ctx.createOscillator();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(880, t);
    o.frequency.exponentialRampToValueAtTime(220, t + 0.5);
    const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.Q.value = 6;
    bp.frequency.value = 1400;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.32, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
    o.connect(bp).connect(g).connect(this.sfxGain!);
    o.start(t); o.stop(t + 0.6);
  }

  /** Blade Storm — three rapid swings + low rumble. */
  private synthBladeStorm(ctx: AudioContext, t: number) {
    [0, 0.18, 0.38].forEach((off) => this.synthSlashTier(ctx, t + off, 1));
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(90, t);
    o.frequency.exponentialRampToValueAtTime(55, t + 0.7);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.35, t + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.75);
    o.connect(g).connect(this.sfxGain!);
    o.start(t); o.stop(t + 0.8);
  }

  /** Death Mark — eerie descending chime / sealing tone. */
  private synthDeathMarkSeal(ctx: AudioContext, t: number) {
    const notes = [880, 740, 587];
    notes.forEach((f, i) => {
      const start = t + i * 0.07;
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.value = f;
      const o2 = ctx.createOscillator();
      o2.type = "triangle";
      o2.frequency.value = f * 1.005;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, start);
      g.gain.exponentialRampToValueAtTime(0.22, start + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, start + 0.55);
      o.connect(g); o2.connect(g);
      g.connect(this.sfxGain!);
      o.start(start); o2.start(start);
      o.stop(start + 0.6); o2.stop(start + 0.6);
    });
  }

  /** Soul Rend — sub-bass thud + reverse-swell. */
  private synthSoulRendBass(ctx: AudioContext, t: number) {
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(160, t);
    o.frequency.exponentialRampToValueAtTime(38, t + 0.6);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.7, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.75);
    o.connect(g).connect(this.sfxGain!);
    o.start(t); o.stop(t + 0.8);
    // Filtered noise tail for body
    const n = this.makeNoise(ctx, 0.55);
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass";
    lp.frequency.setValueAtTime(800, t);
    lp.frequency.exponentialRampToValueAtTime(180, t + 0.55);
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.45, t);
    ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
    n.connect(lp).connect(ng).connect(this.sfxGain!);
    n.start(t); n.stop(t + 0.6);
  }

  /** Execution — heavy decisive thud with metallic snap. */
  private synthExecuteThud(ctx: AudioContext, t: number) {
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(140, t);
    o.frequency.exponentialRampToValueAtTime(50, t + 0.25);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.85, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
    o.connect(g).connect(this.sfxGain!);
    o.start(t); o.stop(t + 0.32);
    // Metallic snap on top
    this.synthArmorRing(ctx, t + 0.005);
  }

  /** War Horn — low brassy cry. */
  private synthWarHornCry(ctx: AudioContext, t: number) {
    const dur = 0.9;
    [110, 165, 220].forEach((f, i) => {
      const o = ctx.createOscillator();
      o.type = "sawtooth";
      o.frequency.setValueAtTime(f * 0.9, t);
      o.frequency.exponentialRampToValueAtTime(f, t + 0.15);
      const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 1100;
      const g = ctx.createGain();
      const peak = 0.32 / (i + 1);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(peak, t + 0.08);
      g.gain.setValueAtTime(peak, t + dur - 0.25);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(lp).connect(g).connect(this.sfxGain!);
      o.start(t); o.stop(t + dur + 0.05);
    });
  }

  /** Time Slow — reverse-swell into a low held tone. */
  private synthTimeSlowSwell(ctx: AudioContext, t: number) {
    const dur = 0.55;
    const n = this.makeNoise(ctx, dur);
    const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.Q.value = 1.4;
    bp.frequency.setValueAtTime(300, t);
    bp.frequency.exponentialRampToValueAtTime(2400, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.45, t + dur);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.15);
    n.connect(bp).connect(g).connect(this.sfxGain!);
    n.start(t); n.stop(t + dur + 0.2);
    // Held low tone after the swell
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.value = 110;
    const og = ctx.createGain();
    og.gain.setValueAtTime(0.0001, t + dur * 0.6);
    og.gain.exponentialRampToValueAtTime(0.28, t + dur);
    og.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.6);
    o.connect(og).connect(this.sfxGain!);
    o.start(t + dur * 0.6); o.stop(t + dur + 0.7);
  }

  /** Boss death — long sub-bass rumble + filtered noise. */
  private synthBossDeathRumble(ctx: AudioContext, t: number) {
    const dur = 1.6;
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(70, t);
    o.frequency.exponentialRampToValueAtTime(32, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.7, t + 0.08);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(this.sfxGain!);
    o.start(t); o.stop(t + dur + 0.05);
    const n = this.makeNoise(ctx, dur);
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass";
    lp.frequency.setValueAtTime(420, t);
    lp.frequency.exponentialRampToValueAtTime(120, t + dur);
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.4, t);
    ng.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    n.connect(lp).connect(ng).connect(this.sfxGain!);
    n.start(t); n.stop(t + dur + 0.05);
  }

  // ---- Music: ambient shamisen-flavored loop ----

  startMusic() {
    const ctx = this.ensure();
    if (!ctx || !this.musicGain) return;
    if (this.musicNodes) return; // already playing

    // Drone pad (low sine + filtered noise wind)
    const drone = ctx.createOscillator();
    drone.type = "sine";
    drone.frequency.value = 110; // A2
    const droneG = ctx.createGain();
    droneG.gain.value = 0.15;
    drone.connect(droneG).connect(this.musicGain);
    drone.start();
    this.droneOsc = drone;

    const drone2 = ctx.createOscillator();
    drone2.type = "sine";
    drone2.frequency.value = 165; // E3 (perfect 5th)
    const drone2G = ctx.createGain();
    drone2G.gain.value = 0.08;
    drone2.connect(drone2G).connect(this.musicGain);
    drone2.start();
    this.drone2Osc = drone2;

    // Wind layer
    const windBuf = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
    const wd = windBuf.getChannelData(0);
    for (let i = 0; i < wd.length; i++) wd[i] = (Math.random() * 2 - 1) * 0.4;
    const wind = ctx.createBufferSource();
    wind.buffer = windBuf;
    wind.loop = true;
    const windFilter = ctx.createBiquadFilter();
    windFilter.type = "bandpass";
    windFilter.frequency.value = 700;
    windFilter.Q.value = 0.6;
    const windG = ctx.createGain();
    windG.gain.value = 0.06;
    wind.connect(windFilter).connect(windG).connect(this.musicGain);
    wind.start();
    this.windFilter = windFilter;
    this.windGain = windG;

    // Plucked shamisen-ish notes scheduled by interval
    // Yo scale on A: A C D E G
    const scale = [220.0, 261.63, 293.66, 329.63, 392.0, 440.0, 523.25];
    let stopped = false;
    const pluck = (freq: number, when: number, vel = 0.35) => {
      // Karplus-Strong-ish via short noise burst into bandpass + delayed feedback
      const dur = 1.6;
      const o = ctx.createOscillator();
      o.type = "triangle";
      o.frequency.setValueAtTime(freq, when);
      // Subtle pitch bend down (shamisen sliver)
      o.frequency.exponentialRampToValueAtTime(freq * 0.99, when + 0.6);
      const o2 = ctx.createOscillator();
      o2.type = "sawtooth";
      o2.frequency.value = freq * 1.005;
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.setValueAtTime(2400, when);
      lp.frequency.exponentialRampToValueAtTime(500, when + dur);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, when);
      g.gain.exponentialRampToValueAtTime(vel, when + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
      o.connect(lp); o2.connect(lp);
      lp.connect(g).connect(this.musicGain!);
      o.start(when); o2.start(when);
      o.stop(when + dur + 0.05); o2.stop(when + dur + 0.05);
    };

    // Schedule notes in a slow generative pattern
    let nextNote = ctx.currentTime + 1.5;
    const tick = () => {
      if (stopped) return;
      const now = ctx.currentTime;
      // Schedule ahead 2 seconds
      while (nextNote < now + 2) {
        const interval = this.bossMode ? (0.22 + Math.random() * 0.25) : (0.55 + Math.random() * 0.7);
        const freq = scale[Math.floor(Math.random() * scale.length)] * (Math.random() < 0.15 ? 0.5 : 1);
        const vel = this.bossMode ? 0.42 : 0.28;
        pluck(freq, nextNote, vel);
        // Occasional grace note
        if (Math.random() < 0.2) pluck(freq * 1.5, nextNote + 0.08, vel * 0.5);
        nextNote += interval;
      }
      setTimeout(tick, 500);
    };
    tick();

    // Fade in
    const now = ctx.currentTime;
    this.musicGain.gain.cancelScheduledValues(now);
    this.musicGain.gain.setValueAtTime(this.musicGain.gain.value, now);
    this.musicGain.gain.linearRampToValueAtTime(this.musicTargetGain, now + 2.5);

    this.musicNodes = {
      stop: () => {
        stopped = true;
        try {
          drone.stop(); drone2.stop(); wind.stop();
        } catch { /* ignore */ }
      },
    };
  }

  setBossMode(boss: boolean) {
    this.bossMode = boss;
    if (!this.ctx || !this.musicGain) return;
    const target = boss ? 0.32 : 0.18;
    this.musicTargetGain = target;
    const now = this.ctx.currentTime;
    this.musicGain.gain.cancelScheduledValues(now);
    this.musicGain.gain.setValueAtTime(this.musicGain.gain.value, now);
    this.musicGain.gain.linearRampToValueAtTime(target, now + 1.2);
  }

  // Phase 7 — retune ambient layers to match the current biome.
  // Smoothly slides drone pitches and the wind bandpass / loudness so a
  // biome change feels atmospheric rather than abrupt.
  setBiome(opts: { droneFreq: number; drone2Freq: number; windFreq: number; windGain: number }) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const ramp = 1.4;
    if (this.droneOsc) {
      this.droneOsc.frequency.cancelScheduledValues(now);
      this.droneOsc.frequency.setValueAtTime(this.droneOsc.frequency.value, now);
      this.droneOsc.frequency.exponentialRampToValueAtTime(Math.max(20, opts.droneFreq), now + ramp);
    }
    if (this.drone2Osc) {
      this.drone2Osc.frequency.cancelScheduledValues(now);
      this.drone2Osc.frequency.setValueAtTime(this.drone2Osc.frequency.value, now);
      this.drone2Osc.frequency.exponentialRampToValueAtTime(Math.max(20, opts.drone2Freq), now + ramp);
    }
    if (this.windFilter) {
      this.windFilter.frequency.cancelScheduledValues(now);
      this.windFilter.frequency.setValueAtTime(this.windFilter.frequency.value, now);
      this.windFilter.frequency.exponentialRampToValueAtTime(Math.max(80, opts.windFreq), now + ramp);
    }
    if (this.windGain) {
      this.windGain.gain.cancelScheduledValues(now);
      this.windGain.gain.setValueAtTime(this.windGain.gain.value, now);
      this.windGain.gain.linearRampToValueAtTime(Math.max(0, Math.min(0.25, opts.windGain)), now + ramp);
    }
  }

  stopMusic() {
    if (!this.ctx || !this.musicGain || !this.musicNodes) return;
    const now = this.ctx.currentTime;
    this.musicGain.gain.cancelScheduledValues(now);
    this.musicGain.gain.setValueAtTime(this.musicGain.gain.value, now);
    this.musicGain.gain.linearRampToValueAtTime(0.0001, now + 1.0);
    const nodes = this.musicNodes;
    setTimeout(() => {
      nodes.stop();
      this.droneOsc = null;
      this.drone2Osc = null;
      this.windFilter = null;
      this.windGain = null;
    }, 1100);
    this.musicNodes = null;
  }
}

export const audio = new AudioEngine();

// ============================================================================
// VFX
// ============================================================================

// Phase 1 VFX module — pooled particle / shape systems, screen overlays
// (vignette + ink grain), parallax silhouettes, and an adaptive quality
// guard. Lives outside GhostGame so the engine file stays focused on game
// logic. All systems are object-pooled (no per-frame allocations).

export type QualityTier = "high" | "low";

export interface QualityState {
  tier: QualityTier;
  particleScale: number; // multiplier applied to particle counts (0.5 on low)
  drawGrain: boolean;
  drawParallax: boolean;
  particleCap: number;   // hard ceiling on active VFX particles
}

/** Tracks a rolling FPS average and downgrades quality if it dips. */
export class QualityGuard {
  state: QualityState = {
    tier: "high",
    particleScale: 1,
    drawGrain: true,
    drawParallax: true,
    particleCap: 300,
  };
  private samples: number[] = [];
  private lowFor = 0;
  private highFor = 0;

  /** Call once per frame with the elapsed dt (seconds). */
  sample(dt: number) {
    if (dt <= 0) return;
    const fps = 1 / dt;
    this.samples.push(fps);
    if (this.samples.length > 60) this.samples.shift();
    if (this.samples.length < 30) return;
    const avg = this.samples.reduce((a, b) => a + b, 0) / this.samples.length;
    if (avg < 50) {
      this.lowFor += dt;
      this.highFor = 0;
      if (this.lowFor > 2 && this.state.tier === "high") this.degrade();
    } else if (avg > 58) {
      this.highFor += dt;
      this.lowFor = 0;
      if (this.highFor > 6 && this.state.tier === "low") this.upgrade();
    } else {
      this.lowFor = Math.max(0, this.lowFor - dt * 0.5);
      this.highFor = Math.max(0, this.highFor - dt * 0.5);
    }
  }
  private degrade() {
    this.state = { tier: "low", particleScale: 0.5, drawGrain: false, drawParallax: false, particleCap: 150 };
  }
  private upgrade() {
    this.state = { tier: "high", particleScale: 1, drawGrain: true, drawParallax: true, particleCap: 300 };
  }
}

// ---------------- Pooled VFX particle ----------------

export type VfxKind = "spark" | "inkSplat" | "ghost" | "ring" | "ash";

export interface VfxParticle {
  active: boolean;
  kind: VfxKind;
  x: number; y: number;
  vx: number; vy: number;
  life: number; maxLife: number;
  size: number;
  rot: number; rotVel: number;
  // Color components (HSL)
  h: number; s: number; l: number; a: number;
  // Ring-specific
  startR: number; endR: number; lineW: number;
  // Ghost-specific (afterimage of player)
  facing: number;
  // Splat shape index (0..2) — used to pick one of three pre-baked blobs
  shape: number;
}

function makeParticle(): VfxParticle {
  return {
    active: false, kind: "spark",
    x: 0, y: 0, vx: 0, vy: 0,
    life: 0, maxLife: 1, size: 1,
    rot: 0, rotVel: 0,
    h: 0, s: 0, l: 0, a: 1,
    startR: 0, endR: 0, lineW: 1,
    facing: 0, shape: 0,
  };
}

/** Object-pooled particle system. */
export class VfxPool {
  pool: VfxParticle[] = [];
  nextIdx = 0;
  constructor(size = 300) {
    for (let i = 0; i < size; i++) this.pool.push(makeParticle());
  }
  resize(size: number) {
    if (size > this.pool.length) {
      while (this.pool.length < size) this.pool.push(makeParticle());
    } else if (size < this.pool.length) {
      this.pool.length = size;
      this.nextIdx = 0;
    }
  }
  /** Acquire a slot. Reuses dead particles first; if all alive, kills the oldest. */
  acquire(): VfxParticle {
    for (let i = 0; i < this.pool.length; i++) {
      const p = this.pool[(this.nextIdx + i) % this.pool.length];
      if (!p.active) {
        this.nextIdx = (this.pool.indexOf(p) + 1) % this.pool.length;
        return p;
      }
    }
    // All in use — pick the one with least life remaining.
    let oldest = this.pool[0];
    for (const p of this.pool) if (p.life / p.maxLife < oldest.life / oldest.maxLife) oldest = p;
    return oldest;
  }
  update(dt: number) {
    for (const p of this.pool) {
      if (!p.active) continue;
      p.life -= dt;
      if (p.life <= 0) { p.active = false; continue; }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.rotVel * dt;
      // Light gravity / drag per kind
      if (p.kind === "spark") {
        p.vx *= 1 - 4 * dt;
        p.vy *= 1 - 4 * dt;
        p.vy += 220 * dt;
      } else if (p.kind === "ash") {
        p.vy += 8 * dt;
        p.vx += Math.sin(p.rot) * 4 * dt;
      } else if (p.kind === "inkSplat") {
        p.vx *= 1 - 6 * dt;
        p.vy *= 1 - 6 * dt;
      }
    }
  }
  /** Draws all particles to the world layer. Caller must already be in world space. */
  drawWorld(ctx: CanvasRenderingContext2D) {
    for (const p of this.pool) {
      if (!p.active) continue;
      const t = Math.max(0, p.life / p.maxLife);
      switch (p.kind) {
        case "spark": drawSpark(ctx, p, t); break;
        case "inkSplat": drawInkSplat(ctx, p, t); break;
        case "ghost": drawGhostAfterimage(ctx, p, t); break;
        case "ring": drawRing(ctx, p, t); break;
        case "ash": drawAsh(ctx, p, t); break;
      }
    }
  }
}

// ---------------- Particle draw helpers ----------------

function drawSpark(ctx: CanvasRenderingContext2D, p: VfxParticle, t: number) {
  const size = p.size * (0.6 + t * 0.4);
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = p.a * t;
  const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size);
  grad.addColorStop(0, `hsla(${p.h}, ${p.s}%, ${p.l}%, 1)`);
  grad.addColorStop(0.5, `hsla(${p.h}, ${p.s}%, ${p.l - 10}%, 0.6)`);
  grad.addColorStop(1, `hsla(${p.h}, ${p.s}%, ${p.l - 30}%, 0)`);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawInkSplat(ctx: CanvasRenderingContext2D, p: VfxParticle, t: number) {
  // Three pre-baked irregular blob shapes (offset+radius pairs around center).
  const shapes = INK_SHAPES[p.shape % INK_SHAPES.length];
  const grow = 0.6 + (1 - t) * 0.6; // splat grows quickly then holds while fading
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rot);
  ctx.globalAlpha = p.a * Math.min(1, t * 2);
  ctx.fillStyle = `hsl(${p.h}, ${p.s}%, ${p.l}%)`;
  ctx.beginPath();
  for (let i = 0; i < shapes.length; i++) {
    const [ox, oy, r] = shapes[i];
    const rr = r * p.size * grow;
    ctx.moveTo(ox * p.size + rr, oy * p.size);
    ctx.arc(ox * p.size, oy * p.size, rr, 0, Math.PI * 2);
  }
  ctx.fill();
  ctx.restore();
}

const INK_SHAPES: number[][][] = [
  // Each shape: [offsetX, offsetY, radius] tuples (relative to base size)
  [[0, 0, 1.0], [0.7, -0.3, 0.55], [-0.6, 0.4, 0.5], [0.3, 0.7, 0.4], [-0.4, -0.6, 0.35]],
  [[0, 0, 0.95], [0.8, 0.2, 0.45], [-0.7, -0.2, 0.5], [0.2, -0.7, 0.4], [-0.3, 0.6, 0.35], [0.5, 0.55, 0.3]],
  [[0, 0, 1.05], [0.6, 0.5, 0.5], [-0.55, 0.3, 0.45], [0.45, -0.5, 0.4], [-0.6, -0.4, 0.4]],
];

function drawGhostAfterimage(ctx: CanvasRenderingContext2D, p: VfxParticle, t: number) {
  // Desaturated player silhouette dissolving over its lifetime.
  ctx.save();
  ctx.globalAlpha = 0.4 * t;
  ctx.translate(p.x, p.y);
  ctx.rotate(p.facing);
  ctx.fillStyle = `hsl(0, 0%, ${20 + t * 30}%)`;
  ctx.beginPath();
  ctx.arc(0, 0, p.size, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = `hsla(0, 30%, 40%, ${0.6 * t})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, p.size - 1, -Math.PI / 4, Math.PI / 4);
  ctx.stroke();
  ctx.restore();
}

function drawRing(ctx: CanvasRenderingContext2D, p: VfxParticle, t: number) {
  // Expanding stroked ring (parry, deflect, war horn).
  const k = 1 - t;
  const r = p.startR + (p.endR - p.startR) * k;
  ctx.save();
  ctx.globalAlpha = p.a * t;
  ctx.strokeStyle = `hsl(${p.h}, ${p.s}%, ${p.l}%)`;
  ctx.lineWidth = p.lineW * (0.4 + t * 0.6);
  ctx.beginPath();
  ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawAsh(ctx: CanvasRenderingContext2D, p: VfxParticle, t: number) {
  ctx.save();
  ctx.globalAlpha = p.a * t;
  ctx.fillStyle = `hsl(${p.h}, ${p.s}%, ${p.l}%)`;
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ---------------- Spawn helpers ----------------

/** Sparks burst — used on every successful weapon hit. */
export function spawnSparkBurst(
  pool: VfxPool, q: QualityState,
  x: number, y: number, ang: number,
  opts: { count?: number; spread?: number; hue?: number; speed?: number } = {},
) {
  const count = Math.round((opts.count ?? 6) * q.particleScale);
  const spread = opts.spread ?? (Math.PI * 80 / 180);
  const baseSpeed = opts.speed ?? 220;
  const hue = opts.hue ?? 32; // orange
  for (let i = 0; i < count; i++) {
    const a = ang + (Math.random() - 0.5) * spread;
    const sp = baseSpeed * (0.5 + Math.random());
    const p = pool.acquire();
    p.active = true; p.kind = "spark";
    p.x = x; p.y = y;
    p.vx = Math.cos(a) * sp; p.vy = Math.sin(a) * sp - 40;
    p.life = p.maxLife = 0.2 + Math.random() * 0.12;
    p.size = 6 + Math.random() * 8;
    p.h = hue + (Math.random() < 0.4 ? 28 : 0); // some white-hot
    p.s = 95; p.l = 60 + Math.random() * 25;
    p.a = 1;
  }
}

/** Ink splash — large multi-blob splat, used on stealth kills + boss kills. */
export function spawnInkSplash(
  pool: VfxPool, q: QualityState,
  x: number, y: number,
  opts: { count?: number; size?: number; hue?: number; lightness?: number; life?: number } = {},
) {
  const count = Math.max(1, Math.round((opts.count ?? 4) * q.particleScale));
  for (let i = 0; i < count; i++) {
    const p = pool.acquire();
    p.active = true; p.kind = "inkSplat";
    p.x = x + (Math.random() - 0.5) * 18;
    p.y = y + (Math.random() - 0.5) * 18;
    p.vx = (Math.random() - 0.5) * 30;
    p.vy = (Math.random() - 0.5) * 30;
    p.rot = Math.random() * Math.PI * 2;
    p.rotVel = 0;
    p.life = p.maxLife = opts.life ?? 0.45;
    p.size = opts.size ?? (16 + Math.random() * 12);
    p.shape = i % INK_SHAPES.length;
    p.h = opts.hue ?? 0;
    p.s = 30;
    p.l = opts.lightness ?? 8;
    p.a = 0.9;
  }
}

/** Player ghost afterimage (Flash Step). */
export function spawnGhostAfterimage(
  pool: VfxPool, x: number, y: number, facing: number, radius: number,
) {
  const p = pool.acquire();
  p.active = true; p.kind = "ghost";
  p.x = x; p.y = y; p.facing = facing;
  p.life = p.maxLife = 0.3;
  p.size = radius;
  p.a = 0.4;
}

/** Expanding stroked ring — used by parry, deflect, war horn, etc. */
export function spawnRing(
  pool: VfxPool,
  x: number, y: number,
  startR: number, endR: number,
  durationMs: number,
  opts: { hue?: number; saturation?: number; lightness?: number; alpha?: number; lineW?: number } = {},
) {
  const p = pool.acquire();
  p.active = true; p.kind = "ring";
  p.x = x; p.y = y;
  p.startR = startR; p.endR = endR;
  p.life = p.maxLife = durationMs / 1000;
  p.h = opts.hue ?? 0;
  p.s = opts.saturation ?? 75;
  p.l = opts.lightness ?? 50;
  p.a = opts.alpha ?? 0.9;
  p.lineW = opts.lineW ?? 3;
}

/** Falling ash — used on boss death. */
export function spawnAshFall(
  pool: VfxPool, q: QualityState,
  x: number, y: number, areaW: number, areaH: number,
  count = 50,
) {
  const c = Math.round(count * q.particleScale);
  for (let i = 0; i < c; i++) {
    const p = pool.acquire();
    p.active = true; p.kind = "ash";
    p.x = x + (Math.random() - 0.5) * areaW;
    p.y = y - areaH * 0.6 + Math.random() * areaH * 0.4;
    p.vx = (Math.random() - 0.5) * 14;
    p.vy = 18 + Math.random() * 22;
    p.rot = Math.random() * Math.PI * 2;
    p.rotVel = (Math.random() - 0.5) * 1.5;
    p.life = p.maxLife = 2.2 + Math.random() * 1.2;
    p.size = 1.4 + Math.random() * 1.6;
    p.h = 0; p.s = 0; p.l = 75 + Math.random() * 15;
    p.a = 0.7;
  }
}

// ---------------- Screen-space overlays ----------------

/** Persistent ink-wash vignette. Draws each frame in screen space. */
export function drawVignette(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const grad = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.25, w / 2, h / 2, Math.max(w, h) * 0.75);
  grad.addColorStop(0, "rgba(0,0,0,0)");
  grad.addColorStop(0.6, "rgba(0,0,0,0.18)");
  grad.addColorStop(1, "rgba(0,0,0,0.45)");
  ctx.save();
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

/** Ink grain overlay — re-seeded every few frames for paper feel. */
export class InkGrain {
  private seed = 0;
  private holdFrames = 0;
  private dots: { x: number; y: number; r: number; a: number }[] = [];
  draw(ctx: CanvasRenderingContext2D, w: number, h: number) {
    if (this.holdFrames <= 0) {
      this.reseed(w, h);
      this.holdFrames = 3 + Math.floor(Math.random() * 2);
    } else {
      this.holdFrames--;
    }
    ctx.save();
    ctx.globalAlpha = 0.03;
    ctx.fillStyle = "rgb(20,15,10)";
    for (const d of this.dots) {
      ctx.globalAlpha = d.a;
      ctx.fillRect(d.x, d.y, d.r, d.r);
    }
    ctx.restore();
  }
  private reseed(w: number, h: number) {
    const target = Math.round((w * h) / 9000); // density
    if (this.dots.length !== target) {
      this.dots.length = target;
      for (let i = 0; i < target; i++) this.dots[i] = { x: 0, y: 0, r: 1, a: 0.03 };
    }
    this.seed++;
    for (let i = 0; i < this.dots.length; i++) {
      const d = this.dots[i];
      d.x = Math.random() * w;
      d.y = Math.random() * h;
      d.r = Math.random() < 0.85 ? 1 : 2;
      d.a = 0.02 + Math.random() * 0.03;
    }
  }
}

// ---------------- Parallax silhouettes ----------------

/** A simple silhouette layer drawn at 20% of the camera's offset.
 *  Generated procedurally per biome palette so we don't need assets. */
export class ParallaxLayer {
  private peaks: { x: number; w: number; h: number }[] = [];
  private worldW = 0;
  rebuild(worldW: number, _worldH: number, seed = 1) {
    this.worldW = worldW;
    this.peaks.length = 0;
    let x = -200;
    let s = seed * 9301 + 49297;
    const rng = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    while (x < worldW + 400) {
      const w = 220 + rng() * 280;
      const h = 90 + rng() * 130;
      this.peaks.push({ x, w, h });
      x += w * 0.6;
    }
  }
  draw(
    ctx: CanvasRenderingContext2D,
    cameraX: number, _cameraY: number,
    viewW: number, viewH: number,
    _color: string,
  ) {
    if (this.peaks.length === 0) return;
    const offsetX = cameraX * 0.2;
    ctx.save();
    // Distant silhouettes anchored near the top of the viewport (sky band),
    // drawn as dark shapes with low alpha so they read as far-away mountains
    // and never compete with gameplay in the play area.
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = "rgba(15,10,20,1)";
    ctx.beginPath();
    const baseY = viewH * 0.32; // horizon line, well above the play area
    ctx.moveTo(-50, baseY);
    for (const p of this.peaks) {
      const sx = p.x - offsetX;
      if (sx + p.w < -100 || sx > viewW + 100) continue;
      // Smaller triangular peak — distant, so heights are scaled down.
      const peakH = p.h * 0.45;
      ctx.lineTo(sx, baseY);
      ctx.lineTo(sx + p.w * 0.5, baseY - peakH);
      ctx.lineTo(sx + p.w, baseY);
    }
    ctx.lineTo(viewW + 100, baseY);
    ctx.lineTo(viewW + 100, -10);
    ctx.lineTo(-50, -10);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

// ---------------- Camera helper ----------------

/** Smooth camera zoom controller. Apply by ctx.scale(camera.zoom, camera.zoom)
 *  around the center of the canvas. */
export class CameraZoom {
  zoom = 1;
  private targetZoom = 1;
  private speed = 6; // higher = snappier
  setTarget(z: number, speed = 6) { this.targetZoom = z; this.speed = speed; }
  update(dt: number) {
    this.zoom += (this.targetZoom - this.zoom) * Math.min(1, this.speed * dt);
  }
}

// ---------------- Katana ink-brush arc ----------------

/** Ribbon of recent katana tip positions. Draws as a tapered crimson ink
 *  brush stroke, leaving a 120ms motion-blur trail. */
export class KatanaTrail {
  private samples: { x: number; y: number; t: number }[] = [];
  private now = 0;
  // Default lifespan in seconds (120ms)
  lifespan = 0.12;
  reset() { this.samples.length = 0; }
  push(x: number, y: number) {
    this.samples.push({ x, y, t: this.now });
    if (this.samples.length > 24) this.samples.shift();
  }
  update(dt: number) {
    this.now += dt;
    while (this.samples.length > 0 && this.now - this.samples[0].t > this.lifespan) {
      this.samples.shift();
    }
  }
  draw(ctx: CanvasRenderingContext2D) {
    const n = this.samples.length;
    if (n < 2) return;
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    // Draw in two passes: a soft wide outer stroke + a sharp inner core.
    for (let pass = 0; pass < 2; pass++) {
      ctx.beginPath();
      ctx.moveTo(this.samples[0].x, this.samples[0].y);
      for (let i = 1; i < n; i++) {
        const a = this.samples[i - 1], b = this.samples[i];
        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2;
        ctx.quadraticCurveTo(a.x, a.y, mx, my);
      }
      // Final segment
      const last = this.samples[n - 1];
      ctx.lineTo(last.x, last.y);
      const tipAlpha = 0.9;
      const grad = ctx.createLinearGradient(
        this.samples[0].x, this.samples[0].y, last.x, last.y,
      );
      grad.addColorStop(0, `rgba(180,20,20,0)`);
      grad.addColorStop(0.7, `rgba(180,20,20,${pass === 0 ? 0.35 : 0.65})`);
      grad.addColorStop(1, `rgba(220,40,40,${tipAlpha})`);
      ctx.strokeStyle = grad;
      ctx.lineWidth = pass === 0 ? 16 : 6;
      ctx.globalAlpha = pass === 0 ? 0.55 : 0.95;
      ctx.stroke();
    }
    ctx.restore();
  }
}

// ============================================================
// Phase 2 — Ability-specific VFX containers
//
// These are intentionally NOT routed through VfxPool because each has
// its own draw shape (calligraphic brush, jagged polyline, multi-ring
// shockwave, rotating petal ring, etc) and most are bound to a fixed
// per-cast budget — the pool's generic spark/ring kinds aren't enough.
// All systems are still array-backed with per-frame "filter dead" sweeps
// that allocate at most one new array per system per frame.
// ============================================================

// ---------------- Ground slash marks (Sword Barrage) ----------------

export interface GroundSlash {
  x: number; y: number;
  ang: number;       // brush direction
  len: number;       // length of the stroke
  life: number; maxLife: number;
}

export class GroundSlashLayer {
  marks: GroundSlash[] = [];
  spawn(x: number, y: number, ang: number, len = 36, life = 1) {
    if (this.marks.length > 40) this.marks.shift();
    this.marks.push({ x, y, ang, len, life, maxLife: life });
  }
  update(dt: number) {
    for (const m of this.marks) m.life -= dt;
    if (this.marks.some(m => m.life <= 0))
      this.marks = this.marks.filter(m => m.life > 0);
  }
  draw(ctx: CanvasRenderingContext2D) {
    for (const m of this.marks) {
      const t = Math.max(0, m.life / m.maxLife);
      ctx.save();
      ctx.translate(m.x, m.y);
      ctx.rotate(m.ang);
      ctx.globalAlpha = 0.55 * t;
      ctx.lineCap = "round";
      // Outer wash
      ctx.strokeStyle = "rgba(120,12,12,0.7)";
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(-m.len / 2, 0);
      ctx.lineTo(m.len / 2, 0);
      ctx.stroke();
      // Sharper core
      ctx.globalAlpha = 0.85 * t;
      ctx.strokeStyle = "rgba(220,40,40,0.95)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }
  }
}

// ---------------- Whirlwind petal ring ----------------

/** Eight ink-brush petals spinning around the player while Whirlwind is
 *  active. Auto-fades after the ability ends. */
export class WhirlwindPetals {
  active = false;
  remaining = 0;     // seconds of full intensity
  spin = 0;          // accumulated rotation
  start(duration: number) {
    this.active = true;
    this.remaining = duration;
  }
  update(dt: number) {
    if (!this.active) return;
    this.spin += dt * 7.5;
    this.remaining -= dt;
    if (this.remaining <= -0.4) this.active = false;
  }
  draw(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) {
    if (!this.active) return;
    const fade = this.remaining > 0 ? 1 : Math.max(0, 1 + this.remaining / 0.4);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(this.spin);
    ctx.globalAlpha = 0.85 * fade;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      ctx.save();
      ctx.rotate(a);
      const dark = i % 2 === 0;
      ctx.fillStyle = dark ? "rgba(140,16,16,0.85)" : "rgba(70,8,8,0.9)";
      ctx.beginPath();
      // Tear-shaped petal
      ctx.moveTo(radius, 0);
      ctx.quadraticCurveTo(radius + 20, -10, radius + 40, 0);
      ctx.quadraticCurveTo(radius + 20, 10, radius, 0);
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }
}

// ---------------- Blade Storm floor rings ----------------

export interface FloorRing {
  x: number; y: number;
  r: number;
  life: number; maxLife: number;
  hue: number; alpha: number;
}

export class FloorRingLayer {
  rings: FloorRing[] = [];
  spawn(x: number, y: number, r: number, life = 0.5, hue = 358, alpha = 0.85) {
    if (this.rings.length > 30) this.rings.shift();
    this.rings.push({ x, y, r, life, maxLife: life, hue, alpha });
  }
  update(dt: number) {
    for (const r of this.rings) r.life -= dt;
    if (this.rings.some(r => r.life <= 0))
      this.rings = this.rings.filter(r => r.life > 0);
  }
  draw(ctx: CanvasRenderingContext2D) {
    for (const r of this.rings) {
      const t = Math.max(0, r.life / r.maxLife);
      ctx.save();
      ctx.globalAlpha = r.alpha * t;
      ctx.strokeStyle = `hsl(${r.hue}, 80%, 45%)`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.r * (1 + (1 - t) * 0.15), 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }
}

// ---------------- Death Mark chain lightning ----------------

export interface ChainBolt {
  pts: { x: number; y: number }[];
  life: number; maxLife: number;
}

export class ChainLightningLayer {
  bolts: ChainBolt[] = [];
  /** Generates a jagged polyline between two points and stores it. */
  spawn(ax: number, ay: number, bx: number, by: number, life = 0.35) {
    const dx = bx - ax, dy = by - ay;
    const len = Math.hypot(dx, dy) || 1;
    const segs = Math.max(6, Math.min(18, Math.round(len / 30)));
    const nx = -dy / len, ny = dx / len; // perpendicular
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i <= segs; i++) {
      const t = i / segs;
      const jitter = (i === 0 || i === segs) ? 0 : (Math.random() - 0.5) * 18;
      pts.push({
        x: ax + dx * t + nx * jitter,
        y: ay + dy * t + ny * jitter,
      });
    }
    this.bolts.push({ pts, life, maxLife: life });
  }
  update(dt: number) {
    for (const b of this.bolts) b.life -= dt;
    if (this.bolts.some(b => b.life <= 0))
      this.bolts = this.bolts.filter(b => b.life > 0);
  }
  draw(ctx: CanvasRenderingContext2D) {
    for (const b of this.bolts) {
      const t = Math.max(0, b.life / b.maxLife);
      ctx.save();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      // Outer crimson glow
      ctx.globalAlpha = 0.7 * t;
      ctx.strokeStyle = "rgba(180,20,20,0.95)";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(b.pts[0].x, b.pts[0].y);
      for (let i = 1; i < b.pts.length; i++) ctx.lineTo(b.pts[i].x, b.pts[i].y);
      ctx.stroke();
      // Bright white core
      ctx.globalAlpha = 0.95 * t;
      ctx.strokeStyle = "rgba(255,240,235,1)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    }
  }
}

// ---------------- Soul Rend triple shockwave ----------------

/** Three concentric expanding rings emitted from a single point. Lives
 *  on its own array so they always render together at consistent stagger. */
export interface SoulRendShock {
  x: number; y: number;
  life: number; maxLife: number;
  maxR: number;
}

export class SoulRendLayer {
  shocks: SoulRendShock[] = [];
  spawn(x: number, y: number, maxR = 240, life = 0.5) {
    this.shocks.push({ x, y, life, maxLife: life, maxR });
  }
  update(dt: number) {
    for (const s of this.shocks) s.life -= dt;
    if (this.shocks.some(s => s.life <= 0))
      this.shocks = this.shocks.filter(s => s.life > 0);
  }
  draw(ctx: CanvasRenderingContext2D) {
    for (const s of this.shocks) {
      const t = 1 - s.life / s.maxLife; // 0 → 1 expansion
      for (let i = 0; i < 3; i++) {
        const stagger = i * 0.15;
        const tt = Math.max(0, Math.min(1, t - stagger));
        if (tt <= 0) continue;
        const r = s.maxR * tt;
        const a = (1 - tt) * 0.85;
        ctx.save();
        ctx.globalAlpha = a;
        ctx.strokeStyle = "hsl(358, 90%, 50%)";
        ctx.lineWidth = 4 - i;
        ctx.beginPath();
        ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    }
  }
}

// ---------------- Hitstop / freeze-frame helper ----------------

/** Centralised hitstop. While `remaining > 0` the engine should multiply
 *  its dt by ~0 to freeze gameplay. Visual systems still tick. */
export class HitstopController {
  remaining = 0;
  request(seconds: number) {
    if (seconds > this.remaining) this.remaining = seconds;
  }
  /** Call once per real frame; returns the gameplay dt scale (0..1). */
  consume(realDt: number): number {
    if (this.remaining <= 0) return 1;
    this.remaining = Math.max(0, this.remaining - realDt);
    return 0;
  }
}

// ---------------- Time Slow screen overlay ----------------

/** Per-frame globalCompositeOperation desaturation. Approach: paint a
 *  blue-grey tint with `color` blend mode so saturation is replaced by
 *  a near-monochrome cool palette. Cheap, no readback, no CSS filter. */
export function drawTimeSlowOverlay(
  ctx: CanvasRenderingContext2D, w: number, h: number, intensity = 1,
) {
  if (intensity <= 0) return;
  ctx.save();
  // Cool blue-grey color wash via 'color' blend (replaces hue/saturation).
  ctx.globalCompositeOperation = "color";
  ctx.globalAlpha = 0.55 * intensity;
  ctx.fillStyle = "hsl(212, 35%, 55%)";
  ctx.fillRect(0, 0, w, h);
  // Soft luminance darken on top for the "held breath" feel.
  ctx.globalCompositeOperation = "multiply";
  ctx.globalAlpha = 0.18 * intensity;
  ctx.fillStyle = "hsl(220, 25%, 60%)";
  ctx.fillRect(0, 0, w, h);
  // Pulsing vignette to suggest the held-frame.
  ctx.globalCompositeOperation = "source-over";
  const pulse = 0.5 + 0.5 * Math.sin(performance.now() / 220);
  const grad = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.25, w / 2, h / 2, Math.max(w, h) * 0.7);
  grad.addColorStop(0, "rgba(0,0,0,0)");
  grad.addColorStop(1, `rgba(20,30,55,${(0.25 + 0.15 * pulse) * intensity})`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

// ---------------- Phase 3 — varied crimson enemy-death splats ----------------

/** Crimson death splat for normal/heavy enemies. Spawns a small cluster of
 *  ink-splat blobs with slight hue + size variation so no two kills look
 *  identical. `tier`: 0 = normal, 1 = heavy/elite, 2 = boss. */
export function spawnCrimsonSplat(
  pool: VfxPool, q: QualityState,
  x: number, y: number, tier: 0 | 1 | 2 = 0,
) {
  const base = tier === 0 ? 14 : tier === 1 ? 22 : 36;
  const count = Math.max(1, Math.round((tier === 0 ? 3 : tier === 1 ? 5 : 8) * q.particleScale));
  const life = 0.45 + tier * 0.18;
  for (let i = 0; i < count; i++) {
    const p = pool.acquire();
    p.active = true; p.kind = "inkSplat";
    const ang = Math.random() * Math.PI * 2;
    const dist = Math.random() * (base * 0.6);
    p.x = x + Math.cos(ang) * dist;
    p.y = y + Math.sin(ang) * dist;
    p.vx = Math.cos(ang) * (20 + Math.random() * 40);
    p.vy = Math.sin(ang) * (20 + Math.random() * 40);
    p.rot = Math.random() * Math.PI * 2;
    p.rotVel = 0;
    p.life = p.maxLife = life + Math.random() * 0.2;
    p.size = base * (0.7 + Math.random() * 0.7);
    p.shape = Math.floor(Math.random() * 3);
    // Hue drift between deep crimson (358) and dark blood (12) plus rare
    // black-ink splats for heavies/bosses.
    const blackChance = tier === 0 ? 0.0 : tier === 1 ? 0.25 : 0.4;
    if (Math.random() < blackChance) {
      p.h = 0; p.s = 10; p.l = 6 + Math.random() * 4;
    } else {
      p.h = 354 + Math.random() * 14;
      p.s = 65 + Math.random() * 25;
      p.l = 12 + Math.random() * 14;
    }
    p.a = 0.85 + Math.random() * 0.15;
  }
}

// ---------------- Phase 3 — full-screen crimson ink-wash ----------------

/** Timed full-screen ink-wash centred on a world point. Drawn each frame
 *  in screen space (caller passes the projected screen position). Fades
 *  out over `maxLife` seconds. */
export class FullScreenInkWash {
  remaining = 0;
  max = 0;
  cx = 0;
  cy = 0;
  hue = 358;
  trigger(cx: number, cy: number, durationMs = 700, hue = 358) {
    this.remaining = durationMs / 1000;
    this.max = this.remaining;
    this.cx = cx;
    this.cy = cy;
    this.hue = hue;
  }
  update(dt: number) {
    if (this.remaining > 0) this.remaining = Math.max(0, this.remaining - dt);
  }
  /** Call AFTER world-to-screen projection. cx/cy are screen-space pixels. */
  draw(ctx: CanvasRenderingContext2D, w: number, h: number) {
    if (this.remaining <= 0) return;
    const t = this.remaining / this.max; // 1 → 0
    const grow = 1 - t;
    const radius = Math.max(w, h) * (0.25 + grow * 0.85);
    ctx.save();
    // Crimson radial wash from the boss death point, fading to transparent.
    const grad = ctx.createRadialGradient(this.cx, this.cy, radius * 0.05, this.cx, this.cy, radius);
    const peakA = 0.55 * t;
    grad.addColorStop(0, `hsla(${this.hue}, 80%, 22%, ${peakA})`);
    grad.addColorStop(0.5, `hsla(${this.hue}, 70%, 14%, ${peakA * 0.7})`);
    grad.addColorStop(1, `hsla(${this.hue}, 70%, 8%, 0)`);
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }
}

// ============================================================================
// GAMEPLAY ENGINE
// ============================================================================

// Pure game logic — no React. A cinematic top-down samurai arena.
// Crimson sumi-e aesthetic, drawn entirely with canvas primitives.
// Endless waves, leveling, perks, and boss fights every 5 waves.










export type GameState = "playing" | "paused" | "victory" | "defeat" | "levelup" | "swap" | "shop";

export interface PerkChoice {
  id: string;
  name: string;
  kanji: string;
  desc: string;
  rarity: "common" | "rare" | "legendary";
  kind?: "passive" | "ability";
}

export interface AbilityInfo {
  id: string;
  name: string;
  kanji: string;
  desc: string;
  hotkey: string; // display only
}

export interface GameStats {
  state: GameState;
  hp: number;
  maxHp: number;
  honor: number;
  ghost: number;
  mon: number;                 // Persistent currency (文) — earned by slaying foes
  wave: number;
  enemiesLeft: number;
  message: string;
  messageTimer: number;
  level: number;
  xp: number;
  xpToNext: number;
  perks: string[]; // ids of acquired perks (with stack count suffix maybe)
  pendingChoices: PerkChoice[]; // when state === "levelup"
  isBossWave: boolean;
  // Survival timer for the current wave
  waveTimer: number;       // seconds remaining
  waveDuration: number;    // total seconds for this wave
  // Active ability cooldowns — keyed by ability id
  abilityCd: Record<string, number>;
  abilityMax: Record<string, number>;
  // Equipped abilities (max 2). Empty until unlocked via level-up.
  equippedAbilities: string[];
  // When state === "swap": the ability the player just picked but must
  // replace one of their two equipped abilities to take.
  pendingAbilityId: string | null;
  // Class identity (Phase 1)
  classId: ClassId;
  className: string;
  classKanji: string;
  ultName: string;
  ultKanji: string;
  // Ultimate gauge
  ultCharge: number;       // 0..ultMax
  ultMax: number;
  ultReady: boolean;
  ultActive: boolean;      // true while ultimate effect is playing out
  ultPhase: string;        // for multi-stage ultimates (e.g. Standoff)
  // Standoff-specific (only meaningful while ultPhase starts with "standoff_")
  standoffRingT: number;   // 1 → 0 ring shrink progress
  // Bushido stacks (Samurai passive) — purely informational
  bushidoStacks: number;
  // Secondary weapons (Phase 3). secondaryIds is a 2-slot array — null = empty.
  secondaryIds: (SecondaryId | null)[];
  secondaryAmmo: number[];        // current ammo per slot (mirrors slot index)
  secondaryAmmoMax: number[];     // max ammo per slot
  secondaryActiveSlot: number;    // 0 or 1
  secondaryCooldown: number;      // shared cooldown after a fire
  // Melee-secondary timed window. Melee secondaries (Tessen/Jutte/Ono/Twin
  // Sai/Odachi) ignore ammo entirely — instead the player can only wield
  // them for `meleeActiveMax` seconds after switching to them. When the
  // timer hits 0 they are auto-swapped back to slot 0. Set to 0 / 0 when
  // not applicable (no melee equipped, or the Endless Edge perk is owned).
  meleeActiveRemaining: number;
  meleeActiveMax: number;
  // ===== Phase 2 — Block system =====
  // Active block resource. Drains when a hit is "blocked" (player has
  // blockHpMax > 0 AND block resource left). Fully blocked hits deal 0
  // damage and don't trigger the normal hit reaction. Regenerates while
  // not currently being hit.
  blockHp: number;
  blockHpMax: number;
  // ===== Phase 2 — Reload state (per slot) =====
  // When > 0 the slot is mid-reload (counts down to 0). Filled mag is
  // restored when the timer hits 0. Only applies to weapons with
  // def.reloadTime > 0 (blowgun, crossbow).
  secondaryReload: number[];
  secondaryReloadMax: number[];
  // Shop (Phase 4) — populated when state === "shop".
  shopOffer: ShopItem[];
  shopRerollCost: number;
  shopPurchasedIds: string[];     // ids already bought this visit
  // ===== Consumables (Phase 4) =====
  // 3-slot inventory of items the player can use mid-run with hotkeys 1/2/3.
  // null entries are empty slots. Drops come from heavy enemies and bosses.
  consumables: (ConsumableId | null)[];
  // Active consumable buff timers (0 = inactive). UI reads these to show
  // remaining duration on the consumable bar.
  buffSakeRemaining: number;       // +30% damage
  buffSmokeRemaining: number;      // invuln
  buffIronPowderRemaining: number; // 3x block regen
  buffWindCharmRemaining: number;  // +30% move speed
  // Biome (Phase 7) — current arena identity.
  biomeId: BiomeId;
  biomeName: string;
  biomeKanji: string;
  // ===== Derived stat snapshot (Phase: stats rework) =====
  // Read-only mirror of the player's combat stats, recomputed every
  // emitStats() so React panels (pause-screen stat list) can display
  // them without reaching into the engine.
  derivedStats: {
    damage: number;        // base katana damage
    dexterity: number;
    defense: number;
    moveSpeedPct: number;  // % of base speed (100 = baseline)
    attackSpeedPct: number;// % of base atk speed (100 = baseline)
    critChancePct: number;
    hpRegen: number;
    secondaryDmgMul: number;
  };
}

interface Vec2 { x: number; y: number; }

interface Player {
  pos: Vec2;
  vel: Vec2;
  facing: number;
  hp: number;
  maxHp: number;
  attackCooldown: number;
  attackAnim: number;
  // Parry window is retained as a no-op field (always 0) so legacy ability
  // code can keep referencing it without behavior changes. Real defensive
  // play now goes through Dash (i-frames) and Deflect (reflect window).
  parryWindow: number;
  parryCooldown: number;
  invuln: number;
  dashCooldown: number;
  hitFlash: number;
  // New ability state
  deflectTimer: number;     // > 0 = perfect-guard window for Deflect ability
  // Dash state (Shift / RMB). dashTimer > 0 = currently mid-dash; dashAng = direction.
  dashTimer: number;
  dashAng: number;
  dashHitIds: Set<number>;  // enemies already damaged by the current dash
  // Visual swing state — flips each swing for left/right/left/right pattern
  // and lets drawPlayer pick the right weapon model when a melee secondary
  // is the active slot. swingDir is +1 (right→left) or -1 (left→right).
  swingDir: 1 | -1;
  // null = katana; otherwise the melee secondary id currently being swung
  // for the active animation.
  swingWeaponId: SecondaryId | null;
}

// Phase 8 — enemy archetypes. "normal" / "heavy" / "boss" remain the
// baseline. Elites: shielded ashigaru block frontal melee, archers kite
// and fire arrows, assassins dash-strike. "final" is the multi-phase
// arc boss spawned at wave 25+.
export type EnemyArchetype =
  | "normal"
  | "heavy"
  | "shielded"
  | "archer"
  | "assassin"
  | "boss"
  | "final";

interface Enemy {
  id: number;
  pos: Vec2;
  vel: Vec2;
  facing: number;
  hp: number;
  maxHp: number;
  state: "patrol" | "alert" | "attacking" | "stunned" | "dead";
  alertness: number;
  patrolTarget: Vec2;
  patrolTimer: number;
  attackCooldown: number;
  attackAnim: number;
  attackTelegraph: number;
  stunTimer: number;
  hitFlash: number;
  deathTimer: number;
  size: number;
  isBoss: boolean;
  damage: number;
  speed: number;
  xpReward: number;
  monReward: number;
  // Phase 8 archetype + per-archetype state
  archetype: EnemyArchetype;
  shieldFacing: number;        // shielded: world angle the shield faces
  shieldHp: number;            // shielded: hits before shield breaks (0 = no shield)
  rangedCooldown: number;      // archer/final: time until next ranged attack
  dashCooldown: number;        // assassin/final: time until next dash
  dashTimer: number;           // assassin/final: remaining dash duration (>0 = mid-dash)
  dashAng: number;             // assassin/final: dash direction
  dashInvuln: number;          // assassin/final: brief i-frames during dash
  bossPhase: number;           // final boss: 1..3
  bossPattern: number;         // final boss: index of currently-running pattern
  bossPatternTimer: number;    // final boss: time left in current pattern
  bossPatternStep: number;     // final boss: step counter inside a pattern
  bossPatternCd: number;       // final boss: cooldown between patterns
  // Class-driven debuffs / status:
  poisonRemaining: number;     // seconds left of poison DoT
  poisonTickAccum: number;     // fractional ticks
  bleedRemaining: number;      // Kensei ult bleed
  bleedTickAccum: number;
  curseRemaining: number;      // Dokkaebi ult — +20% damage taken
  slowRemaining: number;       // Arashi ult slow
  // Tetsu-bo Earthbreaker launch — vertical visual offset & landing damage
  launched: boolean;
  launchTimer: number;
  launchHeight: number;        // current visual y-offset (positive = up)
  launchDamage: number;        // damage to apply on landing
  // Aggro target — when a Kagemusha clone or decoy is present, enemies pick one.
  aggro: "player" | "clone" | "decoy";
  // ===== New ability effects =====
  // Death Mark — cursed seal that increases damage taken; chains on kill.
  markRemaining: number;
  // Smoke Bomb disorient — wander randomly, cannot attack.
  disorientRemaining: number;
  disorientAng: number;        // current wander direction
  // War Horn slow — multiplicative speed factor (0..1). 0 = unaffected.
  warHornSlowRemaining: number;
  warHornSlowFactor: number;
  // ===== Phase B (secondary weapon statuses) =====
  // Flame Spear burn — DoT, separate from poison so they can stack.
  burnRemaining: number;
  burnTickAccum: number;
  burnDps: number;
  // Jutte disarm — enemy cannot attack while > 0.
  disarmedRemaining: number;
  // ===== Phase C — Tsuchigumo web (root + 2× damage taken) =====
  webbedRemaining: number;
  // ===== Phase 2 — Hitstun resistance =====
  // 0 = no resist (full hitstun applied). 0.5 = halves applied stun.
  // 0.95 = nearly immune. Set per-archetype in makeEnemy.
  hitstunResist: number;
}

interface Particle {
  pos: Vec2;
  vel: Vec2;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  kind: "blood" | "petal" | "spark" | "dust" | "muzzle" | "ink" | "leaf" | "snow" | "ember" | "poison";
  rot: number;
  rotVel: number;
}

// Floating combat text (Mon popups, crit numbers, etc.)
interface FloatText {
  pos: Vec2;
  vel: Vec2;
  text: string;
  color: string;
  life: number;
  maxLife: number;
  size: number;       // px font size
  jp?: boolean;       // use Japanese display font
}

interface Input {
  up: boolean; down: boolean; left: boolean; right: boolean;
  attack: boolean; parry: boolean;
  attackPressed: boolean; parryPressed: boolean;
  barragePressed: boolean; flashPressed: boolean;
  whirlwindPressed: boolean; timeslowPressed: boolean;
  ultPressed: boolean; // R — class ultimate
  firePressed: boolean;   // legacy F binding — alias for attackPressed
  swapPressed: boolean;   // Tab — swap active weapon slot
  blockHeld: boolean;     // RMB / mobile shield button — hold to block
  joyActive: boolean; joyDx: number; joyDy: number;
  // Mouse aim (desktop)
  mouseAim: boolean; mouseX: number; mouseY: number;
}

// ============ Class-driven entity types ============

// Ally ghost (Dokkaebi passive proc) or curse projectile (Dokkaebi ult).
// Lives briefly, deals damage to anything it touches.
interface AllyGhost {
  pos: Vec2;
  vel: Vec2;
  life: number;
  maxLife: number;
  damage: number;
  hitSet: Set<number>;       // ids of enemies already hit (for piercing projectiles)
  curse: boolean;            // applies cursed debuff?
  size: number;
}

// Kagemusha clone — mirrors the player and draws aggro.
interface Clone {
  pos: Vec2;
  facing: number;
  hp: number;
  maxHp: number;
  attackTimer: number;
  life: number;              // remaining seconds
  hitFlash: number;
}

// Decoy entity — short-lived dummy that pulls enemy attention.
interface Decoy {
  pos: Vec2;
  life: number;
  maxLife: number;
}

// Projectile (Arashi arrows). Pierces enemies, slows on hit.
interface Projectile {
  pos: Vec2;
  vel: Vec2;
  life: number;
  maxLife: number;
  damage: number;
  hitSet: Set<number>;
  slow: boolean;
}

// Shockwave (Tetsu-bo Earthbreaker) — expanding ring that launches enemies.
interface Shockwave {
  pos: Vec2;
  radius: number;
  maxRadius: number;
  life: number;
  damage: number;
  hitSet: Set<number>;
  // Enemy id that spawned this shockwave (e.g. boss ground slam).
  // Used to skip self-damage. Undefined for player-spawned shockwaves.
  ownerEnemyId?: number;
}

// Phase 8 — projectile fired BY enemies (archers / final boss volley).
// Lives in a separate pool so it never collides with enemies, only the player.
interface EnemyProjectile {
  pos: Vec2;
  vel: Vec2;
  life: number;
  maxLife: number;
  damage: number;
  size: number;
  // Visual style: arrow (slim shaft) or orb (boss volley)
  kind: "arrow" | "orb";
  trail: { x: number; y: number }[];
}

// ===== Phase 3: Secondary weapon entities =====

// Generic projectile fired by a secondary weapon (arrow / kunai / bolt / hook).
interface SecondaryProjectile {
  pos: Vec2;
  vel: Vec2;
  life: number;
  maxLife: number;
  damage: number;
  hitSet: Set<number>;
  pierce: boolean;
  kind: "arrow" | "kunai" | "bolt" | "hook" | "shuriken" | "spear" | "dart";
  hookEnemyId: number | null;
  trail: { x: number; y: number }[];
  // ===== Phase B — extra projectile state =====
  // Shuriken Wheel: bounce + boomerang return.
  bouncesLeft?: number;          // remaining bounces between enemies
  returning?: boolean;            // true once it has finished bouncing and is heading home
  spinAng?: number;               // visual spin
  // Flame Spear: applies a burn DoT on hit.
  burnSeconds?: number;
  // Blowgun: stacking poison applied on hit.
  poisonSeconds?: number;
  // Jutte/Twin Sai-style on-hit status chances (used when melee path forwards
  // a "virtual" secondary hit through dealDamage; kept here for extensibility).
}

// Lobbed bomb (tetsubishi).
interface ArcBomb {
  pos: Vec2;
  vel: Vec2;
  height: number;
  vh: number;
  life: number;
  damage: number;
  radius: number;
}

// Caltrop field — DoT zone left by a bomb.
interface CaltropField {
  pos: Vec2;
  radius: number;
  life: number;
  maxLife: number;
  dps: number;
  tickAccum: number;
}

// Smoke cloud — slows + reduces enemy alertness in radius.
interface SmokeCloud {
  pos: Vec2;
  radius: number;
  life: number;
  maxLife: number;
}

// Pickup dropped by enemies — restores ammo for a secondary on touch.
interface AmmoPickup {
  pos: Vec2;
  life: number;
  amount: number;
  forSlot: number;
}

// Pickup dropped by elites/bosses — adds a consumable to the inventory on touch.
interface ConsumablePickup {
  pos: Vec2;
  vel: Vec2;
  life: number;
  bobPhase: number;
  id: ConsumableId;
}

// XP orb dropped on enemy death. The player must walk over it to collect.
// Orbs magnet toward the player at close range and auto-collect on contact.
interface XpOrb {
  pos: Vec2;
  vel: Vec2;       // initial scatter velocity, decays quickly
  life: number;    // seconds remaining before despawn (long timer)
  amount: number;  // XP value
  bobPhase: number; // visual bob offset
  size: number;    // 1 = small, 2 = medium, 3 = large (boss)
}

// Per-enemy debuff state (cursed / poisoned / launched / slowed) — kept on the
// enemy itself rather than as separate maps to keep update loops tight.

// Base stats (some modified by perks)
const BASE = {
  PLAYER_SPEED: 200,
  PLAYER_RADIUS: 14,
  ENEMY_RADIUS: 14,
  ATTACK_RANGE: 64,
  ATTACK_ARC: Math.PI * 0.7,
  ATTACK_DAMAGE: 1,
  PARRY_WINDOW: 0.28,
  PARRY_COOLDOWN: 0.5,
  // ===== Dash (Shift / RMB) =====
  DASH_DISTANCE: 180,    // total px traveled
  DASH_DURATION: 0.18,   // seconds
  DASH_COOLDOWN: 3.8,    // seconds
  DASH_IFRAMES: 0.22,    // i-frame window from dash start
  DASH_DAMAGE: 6,        // contact damage per enemy passed through
  DASH_HIT_RADIUS: 28,   // contact radius while dashing
  ATTACK_COOLDOWN: 0.4,
  ENEMY_VISION_RANGE: 200,
  ENEMY_VISION_ANGLE: Math.PI * 0.55,
  ENEMY_HEARING_RANGE: 100,
  ENEMY_ATTACK_RANGE: 40,
  // Slightly snappier swings — was 0.55. Forces the player to actually
  // engage instead of kiting indefinitely.
  ENEMY_ATTACK_TELEGRAPH: 0.42,
  STEALTH_KILL_RANGE: 30,
  XP_BASE: 18,
  XP_GROWTH: 1.35,
};

// Player stat caps. The HP cap is intentionally absurdly high (effectively
// uncapped) — earlier balance tuning capped it but the rework removes the
// limit so HP can scale freely with per-wave health upgrades.
const MAX_HP_CAP = Number.POSITIVE_INFINITY;
const MIN_DAMAGE_TAKEN_MUL = 0.85; // 1 - 0.15 = at most 15% reduction (% portion only)
// Defense (flat damage reduction) cap. Each point of defense subtracts 1
// from incoming damage (after the % multiplier). Hard floor of 1 dmg per
// hit so defense can never make the player completely immortal.
const MIN_DAMAGE_PER_HIT = 1;
// Hard cap on the player's base katana damage (perks.damage). Damage
// multipliers (classDamageMul, crits, ult buffs) still scale on top —
// this only caps the additive base value from perks/shop.
// Raised to support the new "rare = +5" / "legendary = +25" stat upgrades.
const MAX_KATANA_DAMAGE = 200;
// Hard cap on the swing arc multiplier so wide_arc stacking can never
// push the swept arc past 180°. BASE.ATTACK_ARC is 0.7π, so the cap is
// (1π / 0.7π) ≈ 1.4286.
const MAX_ATTACK_ARC_MUL = Math.PI / (Math.PI * 0.7);
// Probability per enemy-attack that a Deflect window is bypassed
// entirely (the enemy's strike "goes through" the guard).
const DEFLECT_BYPASS_CHANCE = 0.19;
// Hard cap on the player's swing range. attackRangeMul can never exceed
// 1.20 (i.e. +20% reach over base).
const MAX_ATTACK_RANGE_MUL = 1.20;
// Hard cap on the player's attack speed. +27% atk speed → cooldown
// multiplier floor of 1 / 1.27 ≈ 0.7874. attackCooldownMul can never
// drop below this value.
// Allow up to ~3× attack speed once Dexterity stacks high.
const MIN_ATTACK_COOLDOWN_MUL = 1 / 3.0;
// Hard cap on total HP healed per single enemy kill. Sums every
// on-kill heal source (Bloodlust, Hungry Blade, Crimson Rite, Odachi,
// Berserker Blood Rage) so stacking never restores more than 6 HP per
// kill. Stealth-kill heal (Shadow Lord) is also clamped to this cap
// at its own site since it's still a per-kill heal.
const MAX_HEAL_PER_KILL = 6;

// All available perks. Some can stack.
const PERK_POOL: Omit<PerkChoice, never>[] = [
  { id: "blade_edge", kanji: "刃", name: "Honed Edge", desc: "+15% base damage", rarity: "common" },
  { id: "swift_strike", kanji: "敏", name: "Light Hands", desc: "+5 dexterity (scales attack speed per weapon)", rarity: "common" },
  { id: "long_blade", kanji: "長", name: "Long Blade", desc: "+20% attack range", rarity: "common" },
  { id: "wide_arc", kanji: "弧", name: "Wide Arc", desc: "+25% attack arc", rarity: "common" },
  { id: "iron_body", kanji: "鉄", name: "Iron Body", desc: "+25 max HP and full heal", rarity: "common" },
  { id: "swift_step", kanji: "歩", name: "Swift Step", desc: "+12% movement speed", rarity: "common" },
  { id: "ghost_step", kanji: "影", name: "Ghost Step", desc: "+50% stealth-kill range", rarity: "common" },
  { id: "momentum", kanji: "勢", name: "Momentum", desc: "Each kill cuts ability cooldowns by 1s", rarity: "common" },
  { id: "perfect_guard", kanji: "守", name: "Perfect Guard", desc: "+40% Deflect window duration", rarity: "rare" },
  { id: "vampire", kanji: "血", name: "Bloodlust", desc: "Heal 2 HP on kill (capped at +6 HP/kill total)", rarity: "rare" },
  { id: "exec_parry", kanji: "決", name: "Counter Strike", desc: "Deflect bursts deal +3 damage to the attacker", rarity: "rare" },
  { id: "second_wind", kanji: "息", name: "Second Wind", desc: "Survive one fatal blow per wave", rarity: "rare" },
  { id: "wave_clear", kanji: "波", name: "Battle Meditation", desc: "Heal 25 HP between waves", rarity: "rare" },
  { id: "phantom", kanji: "幽", name: "Phantom Form", desc: "+1s invulnerability after taking a hit", rarity: "rare" },
  { id: "crit_strike", kanji: "斬", name: "Killing Edge", desc: "+20% chance to deal 3× damage", rarity: "rare" },
  { id: "barrage_master", kanji: "閃", name: "Barrage Mastery", desc: "−30% Sword Barrage cooldown", rarity: "rare" },
  { id: "flash_master", kanji: "瞬", name: "Flash Mastery", desc: "−30% Flash Step cooldown", rarity: "rare" },
  { id: "kensei", kanji: "剣", name: "Way of the Kensei", desc: "+2 katana damage", rarity: "legendary" },
  { id: "tempest", kanji: "嵐", name: "Tempest", desc: "Every katana swing strikes twice", rarity: "legendary" },
  { id: "shadow_lord", kanji: "暗", name: "Shadow Lord", desc: "Stealth kills heal 6 HP", rarity: "legendary" },
  { id: "executioner", kanji: "首", name: "Executioner", desc: "+200% damage to foes below 30% HP", rarity: "legendary" },
  { id: "lifebloom", kanji: "生", name: "Lifebloom", desc: "Regenerate 1 HP per second", rarity: "legendary" },
  { id: "barrage_blade", kanji: "嵐刃", name: "Storm Blade", desc: "Sword Barrage hits 8 times instead of 5", rarity: "legendary" },
  { id: "phantom_strike", kanji: "鬼", name: "Phantom Strike", desc: "Flash Step grants 1.5s of invulnerability", rarity: "legendary" },
  // ===== Phase 3 — Status effects =====
  // Common = +chance to apply, Rare = +damage, Legendary = unique modifier.
  { id: "poison_hits_c",   kanji: "毒", name: "Tainted Blade",      desc: "+15% chance to poison on hit",                                rarity: "common" },
  { id: "poison_dmg_r",    kanji: "毒", name: "Refined Toxin",      desc: "+50% poison damage",                                          rarity: "rare" },
  { id: "poison_ramp_l",   kanji: "毒", name: "Coiling Venom",      desc: "Poison damage ramps up the longer it lingers (up to +200%)",  rarity: "legendary" },
  { id: "fire_hits_c",     kanji: "炎", name: "Smoldering Edge",    desc: "+12% chance to ignite on hit (4s burn)",                      rarity: "common" },
  { id: "fire_dmg_r",      kanji: "炎", name: "Roaring Flame",      desc: "+50% burn damage",                                            rarity: "rare" },
  { id: "fire_spread_l",   kanji: "炎", name: "Wildfire",           desc: "Killing a burning foe ignites every enemy within 140 px",     rarity: "legendary" },
  { id: "bleed_hits_c",    kanji: "血", name: "Cruel Strike",       desc: "+15% chance to bleed on hit (3s)",                            rarity: "common" },
  { id: "bleed_dmg_r",     kanji: "血", name: "Hemorrhage",         desc: "+50% bleed damage",                                           rarity: "rare" },
  { id: "lightning_hits_r",kanji: "雷", name: "Storm-Touched",      desc: "+8% chance to call lightning on hit (small zap + brief stun)", rarity: "rare" },
  { id: "lightning_dmg_l", kanji: "雷", name: "Stormborn",          desc: "+8 lightning damage and +0.25s stun",                         rarity: "legendary" },
];

interface Perks {
  damage: number;
  attackCooldownMul: number;
  attackRangeMul: number;
  attackArcMul: number;
  maxHpBonus: number;
  speedMul: number;
  stealthRangeMul: number;
  parryWindowMul: number;
  healOnKill: number;
  parryDamage: number;
  secondWindAvailable: boolean;
  hasSecondWind: boolean;
  healBetweenWaves: number;
  invulnBonus: number;
  doubleStrike: boolean;
  stealthHeal: number;
  // Active-ability tuning
  critChance: number;          // 0..1
  momentumCdr: number;         // seconds reduced per kill
  barrageCdMul: number;        // multiplies base CD
  flashCdMul: number;
  executionerThreshold: number; // 0..1 hp ratio
  executionerMul: number;       // damage multiplier
  hpRegen: number;              // hp per second
  barrageHits: number;          // base 5
  flashInvuln: number;          // seconds of invuln after flash
  // Class-driven multipliers (applied independently from passive perks).
  classDamageMul: number;       // global damage scalar
  knockbackMul: number;
  poisonChance: number;         // 0..1 chance per attack to apply poison
  poisonDps: number;            // dps applied while poisoned
  // Berserker: ramp damage as HP drops
  rageScaling: boolean;
  // Kagemusha: spawn a decoy on a timer
  decoyInterval: number;        // 0 = disabled
  // Projectile speed multiplier (Arashi)
  projectileSpeedMul: number;
  // Shop (Phase 4) modifiers
  secondaryDmgMul: number;       // applied on top of def.damageMul for secondaries
  secondaryRegenMul: number;     // multiplies regenTime (lower = faster)
  secondaryAmmoBonus: number;    // flat extra max ammo on every secondary
  // Defensive damage-reduction multiplier on incoming damage. Each source
  // of mitigation multiplies into this (lower = more reduction). The final
  // multiplier is clamped to MIN_DAMAGE_TAKEN_MUL so total reduction caps
  // at 15% (see mitigateIncoming()).
  damageTakenMul: number;
  // ===== Phase B: per-secondary swing counters =====
  // Tracks per-equipped-id swing index for Ono's every-5th cleave
  // and any future "every Nth swing" effects.
  secondarySwingCounts: Record<string, number>;
  // Endless Edge (legendary perk) — when true, melee secondaries are not
  // bound by the 8s active-window timer.
  meleeNoTimeLimit: boolean;
  // ===== Stats rework =====
  // Dexterity: scales attack-speed for both katana and secondaries.
  // Each point reduces effective fireCooldown by 1.5% (multiplied by the
  // weapon's per-weapon dexScale). Replaces the old flat attack-speed
  // perks. Common = +%, rare = +5, legendary = +25.
  dexterity: number;
  // Defense: flat damage subtracted from incoming hits AFTER the %
  // mitigation. Floor of MIN_DAMAGE_PER_HIT. Common upgrades grant a %
  // multiplier to defense (multiplicative), rare = +5 flat, legendary
  // = +25 flat (no common variant per the design spec).
  defense: number;
  // Per-secondary flat damage bonus. Stacks additively on top of the
  // weapon's base shot/swing damage. The shop "Per-Weapon Damage" perks
  // populate this map, but only show in the offer when that secondary is
  // currently equipped.
  weaponDamageBonus: Partial<Record<string, number>>;
  // ===== Phase 2 — Block =====
  // Base block HP pool (granted by class + heavy-weapon bonus). Effective
  // pool is base + heavy-weapon bonus + perk bonuses.
  blockHpBase: number;
  // Block HP regen per second. Always ticks (no out-of-combat gating —
  // simpler & feels better). Defaults are 0 unless granted by class /
  // weapon / perk.
  blockRegen: number;
  // Hitstun multiplier the player applies on every hit (1 = baseline).
  hitstunMul: number;
  // ===== Phase 3 — Status effects =====
  // Per-hit chance (0..1) to apply each effect. Stacks with class poisonChance.
  fireChance: number;
  bleedChance: number;
  lightningChance: number;
  // Damage multipliers on the existing DoT systems.
  poisonDmgMul: number;
  fireDmgMul: number;
  bleedDmgMul: number;
  // Poison ramp: 0.15 means poison DPS scales up by +15% per second of
  // remaining poison (longer = more damage), capped at +200%.
  poisonRamp: number;
  // On-kill fire spread radius (px). 0 disables.
  fireSpreadRadius: number;
  // Lightning damage / stun bonuses.
  lightningDmgBonus: number;
  lightningStunBonus: number;
}

const defaultPerks = (): Perks => ({
  damage: BASE.ATTACK_DAMAGE,
  attackCooldownMul: 1,
  attackRangeMul: 1,
  attackArcMul: 1,
  maxHpBonus: 0,
  speedMul: 1,
  stealthRangeMul: 1,
  parryWindowMul: 1,
  healOnKill: 0,
  parryDamage: 0,
  secondWindAvailable: false,
  hasSecondWind: false,
  healBetweenWaves: 0,
  invulnBonus: 0,
  doubleStrike: false,
  stealthHeal: 0,
  critChance: 0,
  momentumCdr: 0,
  barrageCdMul: 1,
  flashCdMul: 1,
  executionerThreshold: 0,
  executionerMul: 1,
  hpRegen: 0,
  barrageHits: 5,
  flashInvuln: 0,
  classDamageMul: 1,
  knockbackMul: 1,
  poisonChance: 0,
  poisonDps: 0,
  rageScaling: false,
  decoyInterval: 0,
  projectileSpeedMul: 1,
  secondaryDmgMul: 1,
  secondaryRegenMul: 1,
  secondaryAmmoBonus: 0,
  damageTakenMul: 1,
  secondarySwingCounts: {},
  meleeNoTimeLimit: false,
  dexterity: 0,
  defense: 0,
  weaponDamageBonus: {},
  blockHpBase: 0,
  blockRegen: 0,
  hitstunMul: 1,
  fireChance: 0,
  bleedChance: 0,
  lightningChance: 0,
  poisonDmgMul: 1,
  fireDmgMul: 1,
  bleedDmgMul: 1,
  poisonRamp: 0,
  fireSpreadRadius: 0,
  lightningDmgBonus: 0,
  lightningStunBonus: 0,
});

// Active ability base cooldowns
const ABILITY = {
  BARRAGE_CD: 10,
  FLASH_CD: 14,
  FLASH_RANGE: 380,
  FLASH_DAMAGE: 4,
  BARRAGE_INTERVAL: 0.11,
  WHIRLWIND_CD: 12,
  WHIRLWIND_HITS: 6,
  WHIRLWIND_INTERVAL: 0.08,
  TIMESLOW_CD: 18,
  TIMESLOW_DURATION: 4,
  // ===== New abilities =====
  BLADESTORM_CD: 12,
  BLADESTORM_HITS: 9,            // 3 spins × 3 hits
  BLADESTORM_INTERVAL: 0.09,
  PHANTOM_SLASH_CD: 10,
  PHANTOM_SLASH_DAMAGE: 6,       // high — pierces everything
  DEATH_MARK_CD: 18,
  DEATH_MARK_DURATION: 6,
  DEATH_MARK_CHAIN: 3,
  SOUL_REND_CD: 25,
  DEFLECT_CD: 14,
  DEFLECT_DURATION: 1.5,
  SMOKE_BOMB_CD: 16,
  SMOKE_BOMB_DURATION: 3,        // disorient duration on enemies
  SMOKE_BOMB_RADIUS: 180,
  SMOKE_BOMB_LINGER: 4,          // cloud lingers
  WAR_HORN_CD: 20,
  WAR_HORN_DURATION: 5,
  WAR_HORN_SLOW_NORMAL: 0.6,     // 40% slow → ×0.6 speed
  WAR_HORN_SLOW_BOSS: 0.8,       // 20% slow → ×0.8 speed
  EXECUTION_CD: 8,
  EXECUTION_THRESHOLD: 0.15,
  EXECUTION_HEAVY_DAMAGE: 8,
  // ===== Phase 3 — Caster abilities =====
  FIREBALL_CD: 22,
  FIREBALL_RADIUS: 130,
  FIREBALL_DAMAGE: 18,
  FIREBALL_BURN_SECONDS: 5,
  FIREBALL_TRAVEL_SPEED: 520,
  LIGHTNING_CD: 26,
  LIGHTNING_DAMAGE: 14,
  LIGHTNING_CHAINS: 5,           // total bolts (initial + chains)
  LIGHTNING_RANGE: 360,
  LIGHTNING_STUN: 0.6,
};

// ===== Iai Chain (Samurai ultimate) =====
// Search radius (px) for the next victim. Measured from the player's CURRENT
// position after each blink, so the chain can travel across the arena as
// long as enemies are clustered.
const IAI_CHAIN_RADIUS = 360;
// Maximum number of blink-slash steps in a single cast.
const MAX_IAI_CHAIN_HITS = 5;
// Seconds between each blink-slash step. Short enough to feel like a flurry,
// long enough that each slice is visible and the SFX doesn't blur together.
const IAI_CHAIN_STEP_INTERVAL = 0.18;
// Per-slice damage. Heavy single-target burst — the ultimate is a "delete
// the strongest threats" tool, not a wave-clear.
const IAI_CHAIN_DAMAGE = 22;

// Active abilities the player can unlock at level-up.
// Each maps to a base cooldown and a display hotkey for desktop.
export const ABILITY_POOL: AbilityInfo[] = [
  { id: "barrage",   kanji: "閃", name: "Sword Barrage", desc: "Unleash 5 rapid fanned slashes in front of you.",   hotkey: "Q" },
  { id: "flash",     kanji: "瞬", name: "Flash Step",    desc: "Teleport behind a target, slashing through them.",  hotkey: "E" },
  { id: "whirlwind", kanji: "旋", name: "Whirlwind",     desc: "Spin and slash every enemy around you.",            hotkey: "R" },
  { id: "timeslow",  kanji: "静", name: "Time Slow",     desc: "Briefly slow every enemy to a crawl.",              hotkey: "F" },
  { id: "bladestorm",   kanji: "嵐", name: "Blade Storm",   desc: "Spin 3 times hitting all nearby foes; the final spin launches them.", hotkey: "Q" },
  { id: "phantom_slash",kanji: "波", name: "Phantom Slash", desc: "Send a piercing wave across the arena.",            hotkey: "Q" },
  { id: "death_mark",   kanji: "呪", name: "Death Mark",    desc: "Mark a foe (+50% damage taken). Killing them spreads the mark.", hotkey: "Q" },
  { id: "soul_rend",    kanji: "魂", name: "Soul Rend",     desc: "Tear out a foe's soul — deals 40% of their current HP as damage.", hotkey: "Q" },
  { id: "deflect",      kanji: "返", name: "Deflect",       desc: "1.5s perfect guard — reflects all incoming damage back to attackers.", hotkey: "E" },
  { id: "smoke_bomb",   kanji: "煙", name: "Smoke Bomb",    desc: "Drop a cloud that disorients nearby enemies for 3s — disoriented foes count as stealth kills.", hotkey: "E" },
  { id: "war_horn",     kanji: "号", name: "War Horn",      desc: "Slow every enemy on screen by 40% (20% on bosses) for 5s.", hotkey: "E" },
  { id: "execution",    kanji: "執", name: "Execution",     desc: "Instakill foes below 15% HP — otherwise, deal a heavy strike.", hotkey: "E" },
];

const ABILITY_BASE_CD: Record<string, number> = {
  barrage: ABILITY.BARRAGE_CD,
  flash: ABILITY.FLASH_CD,
  whirlwind: ABILITY.WHIRLWIND_CD,
  timeslow: ABILITY.TIMESLOW_CD,
  bladestorm: ABILITY.BLADESTORM_CD,
  phantom_slash: ABILITY.PHANTOM_SLASH_CD,
  death_mark: ABILITY.DEATH_MARK_CD,
  soul_rend: ABILITY.SOUL_REND_CD,
  deflect: ABILITY.DEFLECT_CD,
  smoke_bomb: ABILITY.SMOKE_BOMB_CD,
  war_horn: ABILITY.WAR_HORN_CD,
  execution: ABILITY.EXECUTION_CD,
};

// Minimal class metadata kept inside the engine to avoid a runtime import
// cycle with classes.ts (which is only consumed by React components).
// Keep names/kanji in sync with src/game/classes.ts.
const CLASS_META: Record<ClassId, {
  name: string; kanji: string; ultName: string; ultKanji: string;
}> = {
  kensei:    { name: "Kensei",          kanji: "剣",  ultName: "Iaijutsu Strike",       ultKanji: "居" },
  shinobi:   { name: "Shinobi",         kanji: "影",  ultName: "Shadow Step",           ultKanji: "隠" },
  ronin:     { name: "Ronin",           kanji: "浪",  ultName: "Crimson Debt",          ultKanji: "血" },
  yamabushi: { name: "Yamabushi",       kanji: "山",  ultName: "Mountain's Endurance",  ultKanji: "岳" },
  onna:      { name: "Onna-Bugeisha",   kanji: "武",  ultName: "Thousand Cuts",         ultKanji: "千" },
  dokkaebi:  { name: "Dokkaebi",        kanji: "鬼",  ultName: "Cursed Horde",          ultKanji: "呪" },
  kagemusha: { name: "Kagemusha",       kanji: "影武",ultName: "Twin Shadows",          ultKanji: "双" },
  berserker: { name: "Berserker",       kanji: "怒",  ultName: "Blood Rage",            ultKanji: "狂" },
  arashi:    { name: "Arashi",          kanji: "嵐",  ultName: "Storm of Heaven",       ultKanji: "雷" },
  tetsubo:   { name: "Tetsu-bo Master", kanji: "鉄",  ultName: "Earthbreaker",          ultKanji: "震" },
  samurai:   { name: "Samurai",         kanji: "侍",  ultName: "Iai Chain",             ultKanji: "居" },
  // ===== Phase A — new classes (engine logic added in later phases) =====
  onmyoji:    { name: "Onmyoji",         kanji: "陰",  ultName: "Spirit Tempest",        ultKanji: "霊" },
  hatamoto:   { name: "Hatamoto",        kanji: "旗",  ultName: "Shogun's Decree",       ultKanji: "令" },
  kunoichi:   { name: "Kunoichi",        kanji: "女",  ultName: "Phantom Dance",         ultKanji: "舞" },
  tsuchigumo: { name: "Tsuchigumo",      kanji: "蜘",  ultName: "Death Web",             ultKanji: "網" },
  miko:       { name: "Miko",            kanji: "巫",  ultName: "Divine Judgement",      ultKanji: "神" },
  kagebushi:  { name: "Kagebushi",       kanji: "黒",  ultName: "Shadow Consume",        ultKanji: "闇" },
};

export class GhostGame {
  ctx: CanvasRenderingContext2D;
  width = 0;
  height = 0;
  worldW = 0;
  worldH = 0;
  dpr = 1;

  player!: Player;
  enemies: Enemy[] = [];
  particles: Particle[] = [];
  petals: Particle[] = [];
  floatTexts: FloatText[] = [];
  perks: Perks = defaultPerks();
  acquiredPerks: string[] = [];
  currentBiome: BiomeDef = BIOMES.tsushima;

  input: Input = {
    up: false, down: false, left: false, right: false,
    attack: false, parry: false,
    attackPressed: false, parryPressed: false,
    barragePressed: false, flashPressed: false,
    whirlwindPressed: false, timeslowPressed: false,
    ultPressed: false,
    firePressed: false, swapPressed: false, blockHeld: false,
    joyActive: false, joyDx: 0, joyDy: 0,
    mouseAim: false, mouseX: 0, mouseY: 0,
  };

  stats: GameStats = this.makeDefaultStats("samurai");

  makeDefaultStats(classId: ClassId): GameStats {
    // We avoid an import cycle by lazily resolving the class definition here.
    const cls = CLASS_META[classId];
    return {
      state: "playing",
      hp: 100, maxHp: 100,
      honor: 0, ghost: 0, mon: 0,
      wave: 1, enemiesLeft: 0,
      message: "Defend Tsushima", messageTimer: 3,
      level: 1, xp: 0, xpToNext: BASE.XP_BASE,
      perks: [], pendingChoices: [],
      isBossWave: false,
      waveTimer: 30, waveDuration: 30,
      abilityCd: {}, abilityMax: {},
      equippedAbilities: [],
      pendingAbilityId: null,
      classId,
      className: cls.name,
      classKanji: cls.kanji,
      ultName: cls.ultName,
      ultKanji: cls.ultKanji,
      ultCharge: 0,
      ultMax: 100,
      ultReady: false,
      ultActive: false,
      ultPhase: "",
      standoffRingT: 1,
      bushidoStacks: 0,
      secondaryIds: [null, null],
      secondaryAmmo: [0, 0],
      secondaryAmmoMax: [0, 0],
      secondaryActiveSlot: 0,
      secondaryCooldown: 0,
      meleeActiveRemaining: 0,
      meleeActiveMax: 0,
      blockHp: 0,
      blockHpMax: 0,
      secondaryReload: [0, 0],
      secondaryReloadMax: [0, 0],
      shopOffer: [],
      shopRerollCost: SHOP_REROLL_COST,
      shopPurchasedIds: [],
      consumables: Array(CONSUMABLE_SLOTS).fill(null) as (ConsumableId | null)[],
      buffSakeRemaining: 0,
      buffSmokeRemaining: 0,
      buffIronPowderRemaining: 0,
      buffWindCharmRemaining: 0,
      biomeId: "tsushima",
      biomeName: BIOMES.tsushima.name,
      biomeKanji: BIOMES.tsushima.kanji,
      derivedStats: {
        damage: BASE.ATTACK_DAMAGE,
        dexterity: 0,
        defense: 0,
        moveSpeedPct: 100,
        attackSpeedPct: 100,
        critChancePct: 0,
        hpRegen: 0,
        secondaryDmgMul: 1,
      },
    };
  }

  // Time-slow ability state
  timeSlowRemaining = 0;

  // Active ability animation state
  barrageActive = false;
  barrageTimer = 0;          // time until next swing
  barrageRemaining = 0;      // swings left
  whirlwindActive = false;
  whirlwindTimer = 0;
  whirlwindRemaining = 0;
  flashTrail: { x: number; y: number; ang: number; life: number }[] = [];
  // ===== New ability runtime state =====
  bladeStormActive = false;
  bladeStormTimer = 0;
  bladeStormRemaining = 0;
  // Phantom Slash projectile (renders as a glowing ink trail)
  phantomSlashes: { sx: number; sy: number; ex: number; ey: number; life: number; maxLife: number; hitSet: Set<number> }[] = [];
  // Death Mark — id of currently marked enemy (or null)
  deathMarkId: number | null = null;
  // Smoke Bomb cloud (separate visual; reuses smokeClouds list)
  // War Horn shockwave visual (one-shot ring)
  warHornRipples: { pos: Vec2; life: number; maxLife: number; radius: number }[] = [];
  // ===== Phase 3 — Caster projectiles =====
  fireballs: { pos: Vec2; vel: Vec2; life: number; maxLife: number }[] = [];
  lightningBolts: { ax: number; ay: number; bx: number; by: number; life: number; maxLife: number }[] = [];
  // Generic ability press queue — populated by triggerAbility() for new ids.
  abilityPressQueue: string[] = [];
  spawnAccumulator = 0;      // gates continuous enemy spawning
  intermissionTimer = 0;     // brief pause between waves
  hpRegenAccumulator = 0;    // for fractional HP regen

  cameraShake = 0;
  timeScale = 1;
  hitstop = 0;
  enemyIdCounter = 0;
  elapsed = 0;
  pendingLevelUps = 0;
  // When a wave ends mid level-up sweep, the shop must wait until ALL pending
  // level-ups are resolved — otherwise opening the shop clobbers the levelup
  // overlay and the player loses their perk picks.
  pendingShopOpen = false;
  // Class-driven entities & ultimate state
  allyGhosts: AllyGhost[] = [];
  decoys: Decoy[] = [];
  clones: Clone[] = [];
  projectiles: Projectile[] = [];
  shockwaves: Shockwave[] = [];
  decoyTimer = 0;             // Kagemusha passive
  // ===== Phase 3: Secondary weapon entities =====
  secProjectiles: SecondaryProjectile[] = [];
  // Phase 8 — projectiles fired by enemies (archer arrows + final boss volleys)
  enemyProjectiles: EnemyProjectile[] = [];
  // Phase 8 — final-boss death cinematic state.
  cinematicTimer = 0;        // total seconds remaining
  cinematicMaxTime = 0;
  cinematicPos: Vec2 = { x: 0, y: 0 };
  arcBombs: ArcBomb[] = [];
  caltrops: CaltropField[] = [];
  smokeClouds: SmokeCloud[] = [];
  ammoPickups: AmmoPickup[] = [];
  xpOrbs: XpOrb[] = [];
  consumablePickups: ConsumablePickup[] = [];
  // Per-slot regen accumulator: counts up; when it crosses regenTime, +1 ammo.
  secondaryRegenAccum: number[] = [0, 0];
  // Pending starting weapons (set by start(); applied during stat init).
  pendingStartingWeapons: SecondaryId[] = [];
  // Ultimate visual / control state
  ultThousandCutsTimer = 0;   // Onna ult — spinning AoE active duration
  ultThousandTickAccum = 0;
  ultBloodRageTimer = 0;      // Berserker ult duration
  ultShadowStepTimer = 0;     // Shinobi ult duration (also implies invuln+invis)
  ultMountainTimer = 0;       // Yamabushi immunity duration
  ultMountainAbsorbed = 0;    // damage absorbed → heal at end
  ultRoninRemaining = 0;      // remaining Crimson Debt strikes
  ultRoninTimer = 0;          // delay between strikes
  ultRoninMul = 1;            // damage multiplier for this Crimson Debt
  // ===== Phase C — passive class state =====
  hatamotoShieldReady = true;   // golden shield available (Hatamoto)
  hatamotoShieldCd = 0;         // ICD timer (10s)
  kunoichiHitChain = 0;         // counts hits for every-4th-poison (Kunoichi)
  mikoBarrierReady = false;     // Miko: divine barrier available
  mikoBarrierTimer = 0;         // counts up to 20 to refresh
  spiritOrbs: { pos: Vec2; life: number; maxLife: number; hitSet: Set<number>; tickAccum: number }[] = [];
  // Kagebushi shadow clone (always-on passive trail)
  shadowClone: { pos: Vec2; facing: number; attackTimer: number } | null = null;
  shadowCloneTrail: { x: number; y: number; facing: number; t: number }[] = [];
  // Onmyoji: previous-frame ability CDs to detect a fresh cast.
  prevAbilityCd: Record<string, number> = {};
  // ===== Phase C — ultimate state =====
  ultSpiritTempestTimer = 0;    // Onmyoji
  ultSpiritTempestTick = 0;
  ultBannerActive = false;      // Hatamoto Shogun's Decree
  ultBannerTimer = 0;
  ultBannerPos: Vec2 = { x: 0, y: 0 };
  ultPhantomTimer = 0;          // Kunoichi Phantom Dance
  ultPhantomImages: { pos: Vec2; vel: Vec2; facing: number; tickAccum: number }[] = [];
  ultEarthshakerTimer = 0;      // Sumo charge
  ultEarthshakerDir = 0;
  ultDeathWebTimer = 0;         // Tsuchigumo
  ultDeathWebTick = 0;
  ultDivineBeamTimer = 0;       // Miko
  ultDivineBeamRadius = 0;
  ultDivineBeamTick = 0;
  ultDivineBeamHit: Set<number> = new Set();
  ultShadowConsumeTimer = 0;    // Kagebushi
  // Standoff (Samurai) — multi-stage
  standoffTimer = 0;          // counts up while ring shrinks (0 → 1.6s window)
  // ===== Iai Chain (Samurai ultimate replacement) =====
  // Step-based chain teleport: pick the strongest enemy in radius, blink to
  // them, slash, repeat up to MAX_IAI_CHAIN_HITS. Each step takes
  // IAI_CHAIN_STEP_INTERVAL seconds so the player sees the slashes & VFX.
  iaiChainRemaining = 0;        // hits left (0 = inactive)
  iaiChainTimer = 0;            // counts down to next blink-slash step
  iaiChainHitIds = new Set<number>(); // enemies already cut this cast (no double-tap)
  iaiChainTargetId: number | null = null; // sticky target — keep slashing until it dies
  // Screen / camera flags
  screenFlashColor = "";      // CSS color string while > 0
  screenFlashTimer = 0;
  desaturate = 0;             // 0..1 — used by Standoff overlay (HUD)

  emitClassChanged = false;   // tells emitStats this is the first frame

  onStatsChange?: (s: GameStats) => void;

  // ===== Phase 1 VFX systems =====
  vfx = new VfxPool(300);
  quality = new QualityGuard();
  inkGrain = new InkGrain();
  parallax = new ParallaxLayer();
  cameraZoom = new CameraZoom();
  katanaTrail = new KatanaTrail();
  // Brief screen-flash overlay (parry, phase transitions)
  whiteFlashTimer = 0;
  whiteFlashMax = 0;
  whiteFlashAlpha = 0;
  // Soul Rend / boss death edge bleed
  edgeBleedTimer = 0;
  edgeBleedMax = 0;

  // ===== Phase 2 ability VFX systems =====
  groundSlashes = new GroundSlashLayer();
  whirlwindPetals = new WhirlwindPetals();
  floorRings = new FloorRingLayer();
  chainBolts = new ChainLightningLayer();
  soulRendShocks = new SoulRendLayer();
  // Phase 3 — full-screen crimson wash on boss death.
  bossInkWash = new FullScreenInkWash();

  constructor(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No canvas context");
    this.ctx = ctx;
  }

  resize(w: number, h: number, dpr: number) {
    this.width = w;
    this.height = h;
    this.dpr = dpr;
    // World is much larger than the viewport so the player has room to roam.
    this.worldW = Math.max(1600, w * 2.2);
    this.worldH = Math.max(1200, h * 2.2);
    // Rebuild parallax silhouettes for the new world size.
    this.parallax.rebuild(this.worldW, this.worldH, 1);
  }

  // Camera offset (world → screen). Player is centered, clamped to world bounds.
  cameraX = 0;
  cameraY = 0;
  updateCamera() {
    const targetX = this.player.pos.x - this.width / 2;
    const targetY = this.player.pos.y - this.height / 2;
    const maxX = Math.max(0, this.worldW - this.width);
    const maxY = Math.max(0, this.worldH - this.height);
    this.cameraX = Math.max(0, Math.min(maxX, targetX));
    this.cameraY = Math.max(0, Math.min(maxY, targetY));
  }

  // Last-chosen class — used by start() so a Try Again on the death screen
  // keeps the same class without needing the React layer to pass it again.
  lastClassId: ClassId = "samurai";
  // Last-chosen starting secondary weapon — same purpose as lastClassId.
  lastSecondaryId: SecondaryId | null = null;

  start(classId?: ClassId, startingSecondary?: SecondaryId | null) {
    if (classId) this.lastClassId = classId;
    if (startingSecondary !== undefined) this.lastSecondaryId = startingSecondary;
    const cid = this.lastClassId;
    this.perks = defaultPerks();
    this.applyClassBonuses(cid);
    this.acquiredPerks = [];
    this.pendingLevelUps = 0;
    this.pendingShopOpen = false;
    const baseHp = Math.min(MAX_HP_CAP, 100 + this.perks.maxHpBonus);
    this.player = {
      pos: { x: this.worldW / 2, y: this.worldH / 2 },
      vel: { x: 0, y: 0 },
      facing: -Math.PI / 2,
      hp: baseHp, maxHp: baseHp,
      attackCooldown: 0, attackAnim: 0,
      parryWindow: 0, parryCooldown: 0,
      invuln: 0, dashCooldown: 0, hitFlash: 0,
      deflectTimer: 0,
      dashTimer: 0, dashAng: 0, dashHitIds: new Set<number>(),
      swingDir: 1, swingWeaponId: null,
    };
    this.enemies = [];
    this.particles = [];
    // Phase 1 — reset VFX systems on (re)start.
    this.katanaTrail.reset();
    for (const p of this.vfx.pool) p.active = false;
    this.whiteFlashTimer = 0;
    this.edgeBleedTimer = 0;
    this.cameraZoom.setTarget(1, 8);
    // Phase 2 — clear ability VFX layers on (re)start.
    this.groundSlashes.marks.length = 0;
    this.whirlwindPetals.active = false;
    this.whirlwindPetals.remaining = 0;
    this.floorRings.rings.length = 0;
    this.chainBolts.bolts.length = 0;
    this.soulRendShocks.shocks.length = 0;
    this.petals = [];
    this.floatTexts = [];
    this.allyGhosts = [];
    this.decoys = [];
    this.clones = [];
    this.projectiles = [];
    this.shockwaves = [];
    this.secProjectiles = [];
    this.enemyProjectiles = [];
    this.cinematicTimer = 0;
    this.arcBombs = [];
    this.caltrops = [];
    this.smokeClouds = [];
    this.ammoPickups = [];
    this.xpOrbs = [];
    this.consumablePickups = [];
    this.secondaryRegenAccum = [0, 0];
    this.decoyTimer = this.perks.decoyInterval;
    this.stats = this.makeDefaultStats(cid);
    // Equip the starting secondary into slot 0 if provided.
    if (this.lastSecondaryId) {
      const def = SECONDARIES[this.lastSecondaryId];
      this.stats.secondaryIds[0] = def.id;
      this.stats.secondaryAmmoMax[0] = def.maxAmmo;
      this.stats.secondaryAmmo[0] = def.startAmmo;
    }
    // Initialize the melee active-window if the starting weapon is melee.
    this.onActiveSecondaryChanged();
    this.stats.maxHp = baseHp;
    this.stats.hp = baseHp;
    // Initialize block pool to the class base + (heavy weapon bonus is added
    // automatically each frame via updateSecondaries refresh).
    this.stats.blockHpMax = Math.max(0, Math.round(this.perks.blockHpBase));
    this.stats.blockHp = this.stats.blockHpMax;
    this.timeSlowRemaining = 0;
    this.barrageActive = false;
    this.barrageRemaining = 0;
    this.barrageTimer = 0;
    this.flashTrail = [];
    this.bladeStormActive = false;
    this.bladeStormRemaining = 0;
    this.bladeStormTimer = 0;
    this.phantomSlashes = [];
    this.deathMarkId = null;
    this.warHornRipples = [];
    this.fireballs = [];
    this.lightningBolts = [];
    this.abilityPressQueue = [];
    this.ultThousandCutsTimer = 0;
    this.ultBloodRageTimer = 0;
    this.ultShadowStepTimer = 0;
    this.ultMountainTimer = 0;
    this.ultMountainAbsorbed = 0;
    this.ultRoninRemaining = 0;
    this.standoffTimer = 0;
    this.iaiChainRemaining = 0;
    this.iaiChainTimer = 0;
    this.iaiChainHitIds.clear();
    this.iaiChainTargetId = null;
    // ===== Phase C — reset class & ultimate state =====
    this.hatamotoShieldReady = true;
    this.hatamotoShieldCd = 0;
    this.kunoichiHitChain = 0;
    this.mikoBarrierReady = false;
    this.mikoBarrierTimer = 0;
    this.spiritOrbs = [];
    this.shadowClone = null;
    this.shadowCloneTrail = [];
    this.ultSpiritTempestTimer = 0;
    this.ultBannerActive = false;
    this.ultBannerTimer = 0;
    this.ultPhantomTimer = 0;
    this.ultPhantomImages = [];
    this.ultEarthshakerTimer = 0;
    this.ultDeathWebTimer = 0;
    this.ultDivineBeamTimer = 0;
    this.ultDivineBeamRadius = 0;
    this.ultDivineBeamHit = new Set();
    this.ultShadowConsumeTimer = 0;
    // Spawn Kagebushi shadow clone immediately if applicable
    if (this.lastClassId === "kagebushi") {
      this.shadowClone = {
        pos: { x: this.player.pos.x - 30, y: this.player.pos.y },
        facing: this.player.facing,
        attackTimer: 0,
      };
    }
    // Miko: barrier available right away
    if (this.lastClassId === "miko") {
      this.mikoBarrierReady = true;
    }
    this.desaturate = 0;
    this.screenFlashTimer = 0;
    this.spawnPetals(110);
    this.applyBiome(1);
    this.spawnWave(1);
    this.emitStats();
  }

  // Apply per-class starting bonuses by mutating this.perks. Called from start().
  applyClassBonuses(id: ClassId) {
    switch (id) {
      case "kensei":
        this.perks.classDamageMul *= 1.20;
        break;
      case "shinobi":
        this.perks.speedMul *= 1.15;
        this.perks.poisonChance = 0.20;
        this.perks.poisonDps = 6;
        break;
      case "ronin":
        this.perks.classDamageMul *= 1.10;
        this.perks.maxHpBonus -= 10;
        break;
      case "yamabushi":
        this.perks.maxHpBonus += 25;
        this.perks.hpRegen += 0.5;
        this.perks.blockHpBase += 15;
        this.perks.blockRegen += 1.0;
        break;
      case "onna":
        this.perks.attackCooldownMul = Math.max(MIN_ATTACK_COOLDOWN_MUL, this.perks.attackCooldownMul * 0.90); // +10% atk speed
        break;
      case "dokkaebi":
        // 5% on-kill ghost handled in killEnemy — no perks change needed.
        break;
      case "kagemusha":
        this.perks.decoyInterval = 15;
        break;
      case "berserker":
        this.perks.rageScaling = true;
        break;
      case "arashi":
        this.perks.projectileSpeedMul = 1.10;
        break;
      case "tetsubo":
        this.perks.maxHpBonus += 30;
        this.perks.speedMul *= 0.95;
        this.perks.knockbackMul *= 1.20;
        this.perks.blockHpBase += 25;
        this.perks.blockRegen += 1.5;
        this.perks.hitstunMul *= 1.5;
        break;
      case "samurai":
        this.perks.maxHpBonus += 15;
        this.perks.blockHpBase += 10;
        this.perks.blockRegen += 0.5;
        // Bushido stacks tracked on stats.bushidoStacks; consumed in dealDamage.
        break;
      // ===== Phase A — new class passives (full impl in Phase C) =====
      case "onmyoji":
        // -10% ability cooldowns (applied as a multiplier on barrage/flash CDs)
        this.perks.barrageCdMul *= 0.90;
        this.perks.flashCdMul *= 0.90;
        break;
      case "hatamoto":
        this.perks.maxHpBonus += 15;
        this.perks.blockHpBase += 30;
        this.perks.blockRegen += 2.0;
        // Golden shield on first hit, 10s ICD — handled in applyEnemyHit.
        break;
      case "kunoichi":
        this.perks.speedMul *= 1.20;
        // Auto-poison every 4th hit handled in Phase C.
        break;
      case "tsuchigumo":
        this.perks.attackCooldownMul = Math.max(MIN_ATTACK_COOLDOWN_MUL, this.perks.attackCooldownMul * 0.90);
        // 15% on-kill web handled in Phase C.
        break;
      case "miko":
        this.perks.maxHpBonus += 20;
        this.perks.blockHpBase += 12;
        this.perks.blockRegen += 0.8;
        // Periodic divine barrier + Mon-heal handled in Phase C.
        break;
      case "kagebushi":
        this.perks.classDamageMul *= 1.15;
        // Shadow clone handled in Phase C.
        break;
    }
    // Enforce HP cap after class bonuses are applied so no class can
    // start above 390 max HP.
    this.perks.maxHpBonus = Math.min(this.perks.maxHpBonus, MAX_HP_CAP - 100);
  }

  // ===== Defensive caps =====

  // Clamp the player's max HP to MAX_HP_CAP. Call after any change to
  // maxHpBonus or direct maxHp mutation.
  private clampMaxHp() {
    if (!this.player) return;
    const cap = MAX_HP_CAP;
    if (this.player.maxHp > cap) this.player.maxHp = cap;
    if (this.player.hp > this.player.maxHp) this.player.hp = this.player.maxHp;
  }

  // Reduce incoming damage using the player's mitigation multiplier,
  // clamped so % reduction can never exceed 15%, then subtract the
  // player's flat Defense stat. Always returns a value of at least
  // MIN_DAMAGE_PER_HIT so attacks still bite.
  private mitigateIncoming(damage: number): number {
    const mul = Math.max(MIN_DAMAGE_TAKEN_MUL, this.perks.damageTakenMul);
    const afterPct = damage * mul;
    const afterDef = afterPct - Math.max(0, this.perks.defense);
    return Math.max(MIN_DAMAGE_PER_HIT, Math.round(afterDef));
  }

  // ===== Stats helpers =====
  // Effective fireCooldown for a weapon, factoring in Dexterity scaled by
  // the weapon's per-weapon dexScale. 1 point Dex = ~1.5% atk-speed at
  // dexScale=1. Result is also clamped by MIN_ATTACK_COOLDOWN_MUL via the
  // attackCooldownMul, then by an additional Dex floor of 0.4.
  private dexCooldownMul(dexScale: number): number {
    const dex = Math.max(0, this.perks.dexterity);
    const reduce = dex * 0.015 * Math.max(0, dexScale);
    return Math.max(0.40, 1 - reduce);
  }

  // Effective per-shot/swing damage for a secondary, including base scale,
  // the weapon's dmgScale, the per-weapon flat damage bonus, the global
  // secondaryDmgMul, and classDamageMul.
  effectiveSecondaryDamage(id: SecondaryId): number {
    const def = SECONDARIES[id];
    const base = this.perks.damage;
    const flat = this.perks.weaponDamageBonus[id] || 0;
    return ((base * def.damageMul * def.dmgScale) + flat)
         * this.perks.classDamageMul
         * this.perks.secondaryDmgMul;
  }

  // Effective fireCooldown after dexterity for the given weapon.
  effectiveSecondaryCooldown(id: SecondaryId): number {
    const def = SECONDARIES[id];
    return def.fireCooldown * this.dexCooldownMul(def.dexScale);
  }

  // Scale a raw enemy damage value by both the player's max-HP pool and
  // their defensive multiplier. The HP scaling makes damage hurt
  // proportionally to how big a pool the player has built (so a 350-HP
  // tank doesn't get hit for the same flat 12 a 100-HP glass cannon
  // would). Players still BENEFIT from extra HP — the bigger pool
  // means more raw absorbtion, more room for heals, and a bigger
  // buffer for clutch plays — but the time-to-kill stays in a sane
  // window. Defense (damageTakenMul) is still a real flat multiplier
  // on top, clamped to the 15% cap.
  private scaleEnemyDamage(raw: number): number {
    if (!this.player) return Math.max(1, Math.round(raw));
    // Baseline: 100 HP = 1.0× (the values designers wrote in the
    // spawn tables). Scale grows sub-linearly so HP-heavy classes
    // still meaningfully tank: a Sumo at 350 HP gets hit ~1.55×
    // harder than a 100 HP class — but absorbs ~3.5× more total.
    const hpRatio = Math.max(0.75, this.player.maxHp / 100);
    const hpScale = Math.min(1.6, 0.75 + (hpRatio - 0.75) * 0.55);
    const defMul = Math.max(MIN_DAMAGE_TAKEN_MUL, this.perks.damageTakenMul);
    return Math.max(1, Math.round(raw * hpScale * defMul));
  }

  spawnPetals(n: number) {
    const cfg = this.currentBiome.particle;
    const kind = cfg.kind;
    for (let i = 0; i < n; i++) {
      this.petals.push({
        pos: { x: Math.random() * this.worldW, y: Math.random() * this.worldH },
        vel: {
          x: cfg.speedXMin + Math.random() * (cfg.speedXMax - cfg.speedXMin),
          y: cfg.speedYMin + Math.random() * (cfg.speedYMax - cfg.speedYMin),
        },
        life: 999, maxLife: 999,
        color: cfg.color(),
        size: cfg.sizeMin + Math.random() * (cfg.sizeMax - cfg.sizeMin),
        kind,
        rot: Math.random() * Math.PI * 2,
        rotVel: (Math.random() - 0.5) * (kind === "snow" ? 0.6 : 2),
      });
    }
  }

  // Phase 7 — switch biome based on the wave number, retint the world,
  // reseed the falling-particle field, and re-tune ambient music.
  applyBiome(wave: number) {
    const id = biomeForWave(wave);
    if (this.currentBiome.id === id && this.petals.length > 0) {
      // Already in the right biome — nothing to do.
      this.stats.biomeId = id;
      this.stats.biomeName = this.currentBiome.name;
      this.stats.biomeKanji = this.currentBiome.kanji;
      return;
    }
    const biome = BIOMES[id];
    this.currentBiome = biome;
    this.petals = [];
    this.spawnPetals(biome.particle.count);
    this.stats.biomeId = id;
    this.stats.biomeName = biome.name;
    this.stats.biomeKanji = biome.kanji;
    // Reseed parallax silhouettes per biome so each stage feels distinct.
    const seedMap: Record<string, number> = { tsushima: 1, bamboo: 2, snowfield: 3, burning: 4, castle: 5 };
    this.parallax.rebuild(this.worldW, this.worldH, seedMap[id] ?? 1);
    audio.setBiome(biome.audio);
    this.flash(`${biome.kanji} · ${biome.name}`);
  }

  // Wave duration: starts at 18s, +4s per wave, capped at 85s.
  // Boss waves get +25s on top, capped at 110s.
  computeWaveDuration(wave: number): number {
    const isBoss = wave % 5 === 0;
    const base = Math.min(85, 18 + (wave - 1) * 4);
    return isBoss ? Math.min(110, base + 25) : base;
  }

  // Target number of live enemies on the field for this wave.
  // Used by maybeSpawnEnemies() to continuously replenish.
  computeTargetDensity(wave: number): number {
    const isBoss = wave % 5 === 0;
    if (isBoss) return Math.min(14, 6 + Math.floor(wave / 5) * 2);
    return Math.min(28, 5 + Math.floor(wave * 1.6) + Math.floor(wave / 2));
  }

  pickSpawnAwayFromPlayer(minDist = 360): { x: number; y: number } {
    const px = this.player?.pos.x ?? this.worldW / 2;
    const py = this.player?.pos.y ?? this.worldH / 2;
    for (let tries = 0; tries < 30; tries++) {
      const x = 60 + Math.random() * (this.worldW - 120);
      const y = 60 + Math.random() * (this.worldH - 120);
      if (Math.hypot(x - px, y - py) >= minDist) return { x, y };
    }
    return {
      x: px > this.worldW / 2 ? 80 : this.worldW - 80,
      y: py > this.worldH / 2 ? 80 : this.worldH - 80,
    };
  }

  // Boss HP scaling — bosses (especially the final boss) used to feel
  // un-killable at higher waves because their flat HP didn't account for
  // the player's actual damage output and survivability. We now scale boss
  // HP off two player-power inputs:
  //   • offensive: katana base damage × global classDamageMul, normalized
  //     against a baseline build (3 base × 1.0 mul = 3).
  //   • defensive: maxHp / 100 (a Sumo at 350 HP is a much harder fight
  //     than a 100 HP Shinobi and should face a meatier boss).
  // The result is clamped so weak builds aren't completely overwhelmed and
  // strong builds don't trivialize encounters.
  computeBossHpScale(kind: "boss" | "final"): number {
    if (!this.player) return 1;
    const baselineDamage = 3;            // perks.damage starts at 3
    const offense = (this.perks.damage * this.perks.classDamageMul) / baselineDamage;
    const defense = this.player.maxHp / 100;
    // Weighted blend — offense matters more than defense for kill speed.
    let raw = offense * 0.7 + defense * 0.3;
    // Final boss leans a bit harder on offense so a high-damage build
    // doesn't melt him in two ultimates, but a baseline build can still
    // realistically clear him within the wave timer.
    if (kind === "final") raw = offense * 0.75 + defense * 0.25;
    // Clamp: never less than 75% of base (don't punish weak builds), never
    // more than 200% of base (don't make a powered-up build face an HP
    // sponge that outlasts the wave timer).
    return Math.max(0.75, Math.min(2, raw));
  }

  spawnSingleEnemy(wave: number, kind: EnemyArchetype) {
    const tier = Math.floor((wave - 1) / 5);
    // Phase 2 — slightly steeper HP/dmg curve to match the new stat upgrades.
    // Players now get flat +5 / +25 hits from rare/legendary perks, so basic
    // enemies need to keep up to remain a threat into the late waves.
    // Steeper HP curve so wave 5 grunts feel meaty (~10 HP) instead of
    // being two-shot trash. Bosses use computeBossHpScale separately.
    const hpScale = 1 + (wave - 1) * 0.55;
    const dmgScale = 1 + (wave - 1) * 0.10;
    const speedScale = 1 + Math.min(0.8, (wave - 1) * 0.04);
    const isBigSpawn = kind === "boss" || kind === "final";
    const s = this.pickSpawnAwayFromPlayer(isBigSpawn ? 460 : 360);

    if (kind === "final") {
      // Final boss — spawned alone at wave 25+ (every 10 waves after).
      // Three phases, hugely scaled HP, multiple attack patterns.
      const bossScale = this.computeBossHpScale("final");
      this.enemies.push(this.makeEnemy({
        x: s.x, y: s.y,
        isBoss: true,
        archetype: "final",
        hp: Math.round(220 * hpScale * (1 + tier * 0.5) * bossScale),
        damage: Math.round(42 * dmgScale),
        speed: 232 * speedScale,
        size: 34 + tier * 2,
        xpReward: 240 + tier * 40,
        monReward: 220 + tier * 60 + Math.floor(Math.random() * 60),
      }));
    } else if (kind === "boss") {
      const bossScale = this.computeBossHpScale("boss");
      this.enemies.push(this.makeEnemy({
        x: s.x, y: s.y,
        isBoss: true,
        archetype: "boss",
        hp: Math.round(90 * hpScale * (1 + tier * 0.6) * bossScale),
        damage: Math.round(36 * dmgScale),
        speed: 243 * speedScale,
        size: 24 + tier * 2,
        xpReward: 60 + tier * 20,
        monReward: 80 + tier * 40 + Math.floor(Math.random() * 30),
      }));
    } else if (kind === "shielded") {
      // Tanky frontline — frontal melee bounces off until shield breaks.
      this.enemies.push(this.makeEnemy({
        x: s.x, y: s.y,
        isBoss: false,
        archetype: "shielded",
        hp: Math.round(5 * hpScale),
        damage: Math.round(16 * dmgScale),
        speed: 232 * speedScale,
        size: BASE.ENEMY_RADIUS + 4,
        xpReward: 18,
        monReward: 8 + tier * 2 + Math.floor(Math.random() * 4),
        shieldHp: 4 + Math.floor(tier * 0.8),
      }));
    } else if (kind === "archer") {
      // Glass cannon — kites to maintain ~280px range, fires arrows.
      this.enemies.push(this.makeEnemy({
        x: s.x, y: s.y,
        isBoss: false,
        archetype: "archer",
        hp: Math.max(1, Math.round(2 * hpScale)),
        damage: Math.round(10 * dmgScale),
        speed: 243 * speedScale,
        size: BASE.ENEMY_RADIUS - 1,
        xpReward: 16,
        monReward: 5 + tier + Math.floor(Math.random() * 4),
      }));
    } else if (kind === "assassin") {
      // Dual-blade dasher — telegraphed lunge, brief i-frames mid-dash.
      this.enemies.push(this.makeEnemy({
        x: s.x, y: s.y,
        isBoss: false,
        archetype: "assassin",
        hp: Math.max(1, Math.round(2.5 * hpScale)),
        damage: Math.round(16 * dmgScale),
        speed: 265 * speedScale,
        size: BASE.ENEMY_RADIUS,
        xpReward: 20,
        monReward: 7 + tier + Math.floor(Math.random() * 5),
      }));
    } else if (kind === "heavy") {
      this.enemies.push(this.makeEnemy({
        x: s.x, y: s.y,
        isBoss: false,
        archetype: "heavy",
        hp: Math.round(4 * hpScale),
        damage: Math.round(18 * dmgScale),
        speed: 238 * speedScale,
        size: BASE.ENEMY_RADIUS + 5,
        xpReward: 14,
        monReward: 6 + tier * 2 + Math.floor(Math.random() * 4),
      }));
    } else {
      this.enemies.push(this.makeEnemy({
        x: s.x, y: s.y,
        isBoss: false,
        archetype: "normal",
        hp: Math.max(1, Math.round(2 * hpScale)),
        damage: Math.round(12 * dmgScale),
        speed: 218 * speedScale,
        size: BASE.ENEMY_RADIUS,
        xpReward: 8 + tier * 2,
        monReward: 2 + tier + Math.floor(Math.random() * 3),
      }));
    }
  }

  // Roll a non-elite enemy, with elites unlocking by wave.
  // shielded @ wave 6+, archer @ wave 8+, assassin @ wave 10+.
  pickRollKind(wave: number): EnemyArchetype {
    const r = Math.random();
    const heavyChance = wave >= 3 ? Math.min(0.35, (wave - 2) * 0.07) : 0;
    const shieldedChance = wave >= 6 ? Math.min(0.18, (wave - 5) * 0.025) : 0;
    const archerChance = wave >= 8 ? Math.min(0.22, (wave - 7) * 0.03) : 0;
    const assassinChance = wave >= 10 ? Math.min(0.18, (wave - 9) * 0.025) : 0;
    let cum = 0;
    if (r < (cum += shieldedChance)) return "shielded";
    if (r < (cum += archerChance)) return "archer";
    if (r < (cum += assassinChance)) return "assassin";
    if (r < (cum += heavyChance)) return "heavy";
    return "normal";
  }

  // Continuously top up the enemy pool toward the wave's target density.
  // Spawns gradually, not all at once, so the field feels alive.
  maybeSpawnEnemies(dt: number) {
    if (this.stats.waveTimer <= 0) return; // intermission
    // While the final boss is alive, hold spawns down so the duel stays clean.
    const finalBossAlive = this.enemies.some(e => e.archetype === "final" && e.state !== "dead");
    const target = finalBossAlive
      ? Math.min(4, this.computeTargetDensity(this.stats.wave))
      : this.computeTargetDensity(this.stats.wave);
    const alive = this.enemies.filter(e => e.state !== "dead").length;
    if (alive >= target) return;
    this.spawnAccumulator -= dt;
    if (this.spawnAccumulator <= 0) {
      this.spawnAccumulator = 0.35 + Math.random() * 0.7;
      this.spawnSingleEnemy(this.stats.wave, this.pickRollKind(this.stats.wave));
    }
  }

  spawnWave(wave: number) {
    const isBoss = wave % 5 === 0;
    // Final boss every 10 waves starting at 25 (25, 35, 45, ...).
    const isFinalBossWave = wave >= 25 && (wave - 25) % 10 === 0;
    this.stats.isBossWave = isBoss;
    this.stats.wave = wave;
    this.applyBiome(wave);
    this.stats.waveDuration = this.computeWaveDuration(wave);
    this.stats.waveTimer = this.stats.waveDuration;
    this.spawnAccumulator = 0;

    // Initial seed of enemies — about half the target density so the wave
    // ramps up rather than starting full-throttle.
    const target = this.computeTargetDensity(wave);
    const initial = Math.max(4, Math.floor(target * 0.5));

    if (isFinalBossWave) {
      this.spawnSingleEnemy(wave, "final");
      // A small honor guard — 3 mixed elites to flank the duel.
      this.spawnSingleEnemy(wave, "shielded");
      this.spawnSingleEnemy(wave, "archer");
      this.spawnSingleEnemy(wave, "assassin");
    } else if (isBoss) {
      this.spawnSingleEnemy(wave, "boss");
      for (let i = 0; i < initial - 1; i++) {
        this.spawnSingleEnemy(wave, this.pickRollKind(wave));
      }
    } else {
      for (let i = 0; i < initial; i++) {
        this.spawnSingleEnemy(wave, this.pickRollKind(wave));
      }
    }

    this.stats.enemiesLeft = this.enemies.filter(e => e.state !== "dead").length;
    if (isBoss) this.flash(`◈ BOSS WAVE ${wave} · Slay the boss ◈`);
    else this.flash(`Wave ${wave} · Survive ${Math.round(this.stats.waveDuration)}s`);

    audio.play("waveStart");
    audio.setBossMode(isBoss);
    if (isBoss) setTimeout(() => audio.play("bossRoar"), 350);

    // Heal between waves perk
    if (wave > 1 && this.perks.healBetweenWaves > 0) {
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + this.perks.healBetweenWaves);
    }
    if (this.perks.secondWindAvailable) this.perks.hasSecondWind = true;
  }

  makeEnemy(opts: {
    x: number; y: number; isBoss: boolean; hp: number; damage: number;
    speed: number; size: number; xpReward: number; monReward: number;
    archetype?: EnemyArchetype;
    shieldHp?: number;
  }): Enemy {
    const archetype = opts.archetype ?? (opts.isBoss ? "boss" : "normal");
    return {
      id: this.enemyIdCounter++,
      pos: { x: opts.x, y: opts.y },
      vel: { x: 0, y: 0 },
      facing: Math.atan2(this.worldH / 2 - opts.y, this.worldW / 2 - opts.x),
      hp: opts.hp,
      maxHp: opts.hp,
      state: "patrol",
      alertness: opts.isBoss ? 1 : 0,
      patrolTarget: {
        x: 100 + Math.random() * (this.worldW - 200),
        y: 100 + Math.random() * (this.worldH - 200),
      },
      patrolTimer: 2 + Math.random() * 2,
      attackCooldown: 0,
      attackAnim: 0,
      attackTelegraph: 0,
      stunTimer: 0,
      hitFlash: 0,
      deathTimer: 0,
      size: opts.size,
      isBoss: opts.isBoss,
      damage: opts.damage,
      speed: opts.speed,
      xpReward: opts.xpReward,
      monReward: opts.monReward,
      archetype,
      shieldFacing: 0,
      shieldHp: opts.shieldHp ?? 0,
      rangedCooldown: archetype === "archer" ? 1.0 + Math.random() * 0.5 : 0,
      dashCooldown: archetype === "assassin" ? 1.5 + Math.random() : 0,
      dashTimer: 0,
      dashAng: 0,
      dashInvuln: 0,
      bossPhase: (archetype === "final" || archetype === "boss") ? 1 : 0,
      bossPattern: 0,
      bossPatternTimer: 0,
      bossPatternStep: 0,
      bossPatternCd: archetype === "final" ? 1.6 : archetype === "boss" ? 2.2 : 0,
      poisonRemaining: 0,
      poisonTickAccum: 0,
      bleedRemaining: 0,
      bleedTickAccum: 0,
      curseRemaining: 0,
      slowRemaining: 0,
      launched: false,
      launchTimer: 0,
      launchHeight: 0,
      launchDamage: 0,
      aggro: "player",
      markRemaining: 0,
      disorientRemaining: 0,
      disorientAng: Math.random() * Math.PI * 2,
      warHornSlowRemaining: 0,
      warHornSlowFactor: 1,
      // Phase B status defaults
      burnRemaining: 0,
      burnTickAccum: 0,
      burnDps: 0,
      disarmedRemaining: 0,
      webbedRemaining: 0,
      hitstunResist: (
        archetype === "final" ? 0.85 :
        archetype === "boss" ? 0.7 :
        archetype === "heavy" ? 0.55 :
        archetype === "shielded" ? 0.5 :
        archetype === "assassin" ? 0.25 :
        archetype === "archer" ? 0.15 :
        0.05
      ),
    };
  }

  flash(msg: string) {
    this.stats.message = msg;
    this.stats.messageTimer = 2.5;
    this.emitStats();
  }

  emitStats() {
    this.stats.hp = Math.max(0, Math.round(this.player?.hp ?? this.stats.hp));
    this.stats.maxHp = this.player?.maxHp ?? this.stats.maxHp;
    this.stats.enemiesLeft = this.enemies.filter(e => e.state !== "dead").length;
    this.stats.perks = [...this.acquiredPerks];
    // Derived stat snapshot — used by pause-screen stat list.
    const cdMulKatana = this.perks.attackCooldownMul * this.dexCooldownMul(0.8);
    this.stats.derivedStats = {
      damage: this.perks.damage,
      dexterity: this.perks.dexterity,
      defense: this.perks.defense,
      moveSpeedPct: Math.round(this.perks.speedMul * 100),
      attackSpeedPct: Math.round((1 / Math.max(0.001, cdMulKatana)) * 100),
      critChancePct: Math.round(this.perks.critChance * 100),
      hpRegen: this.perks.hpRegen,
      secondaryDmgMul: this.perks.secondaryDmgMul,
    };
    this.onStatsChange?.({ ...this.stats, pendingChoices: [...this.stats.pendingChoices] });
  }

  setInput(partial: Partial<Input>) {
    Object.assign(this.input, partial);
  }

  triggerAttack() { this.input.attackPressed = true; this.input.attack = true; }
  // Shift / RMB / mobile "guard" button — now triggers Dash instead of Parry.
  // Method name preserved so React + TouchControls bindings keep working.
  triggerParry() { this.input.parryPressed = true; this.input.parry = true; }
  triggerDash()  { this.input.parryPressed = true; this.input.parry = true; }
  triggerBarrage() { this.input.barragePressed = true; }
  triggerFlash() { this.input.flashPressed = true; }
  triggerWhirlwind() { this.input.whirlwindPressed = true; }
  triggerTimeSlow() { this.input.timeslowPressed = true; }
  triggerUlt() { this.input.ultPressed = true; }
  // F key — legacy. Now an alias for the attack input (active-weapon fire).
  triggerFire() { this.input.attackPressed = true; this.input.attack = true; }
  triggerSwap() { this.input.swapPressed = true; }
  // Equip both weapon slots after start(). Used by the pick-two class-select
  // flow. Slot 0 becomes the active slot. Either id may be the katana.
  equipWeapons(ids: [SecondaryId, SecondaryId]) {
    for (let s = 0; s < 2; s++) {
      const id = ids[s];
      const def = SECONDARIES[id];
      this.stats.secondaryIds[s] = id;
      this.stats.secondaryAmmoMax[s] = def.maxAmmo;
      this.stats.secondaryAmmo[s] = def.startAmmo;
      this.stats.secondaryReload[s] = 0;
      this.stats.secondaryReloadMax[s] = def.reloadTime ?? 0;
    }
    this.stats.secondaryActiveSlot = 0;
    this.onActiveSecondaryChanged();
    this.emitStats();
  }

  // True if either equipped slot is a shield-class weapon (Tate). Used by
  // the input layer to decide whether RMB hold-to-block or RMB dash.
  hasBlockWeapon(): boolean {
    for (const id of this.stats.secondaryIds) {
      if (id && SECONDARIES[id]?.block) return true;
    }
    return false;
  }

  // True while the player is actively raising the shield (RMB / mobile
  // block button held), has a shield equipped, and still has block-HP.
  isBlocking(): boolean {
    return this.input.blockHeld && this.hasBlockWeapon() && this.stats.blockHp > 0;
  }
  // Generic dispatch (used by mobile ability buttons)
  triggerAbility(id: string) {
    if (id === "barrage") this.triggerBarrage();
    else if (id === "flash") this.triggerFlash();
    else if (id === "whirlwind") this.triggerWhirlwind();
    else if (id === "timeslow") this.triggerTimeSlow();
    else if (id === "ult") this.triggerUlt();
    else if (ABILITY_BASE_CD[id] !== undefined) {
      // New abilities flow through the generic press queue.
      this.abilityPressQueue.push(id);
    }
  }

  // Equip an ability into a free slot, initializing its cooldown tracking.
  private equipAbilityInternal(id: string, slotIndex?: number) {
    const baseCd = ABILITY_BASE_CD[id] ?? 0;
    // Apply any existing perk multipliers
    let cd = baseCd;
    if (id === "barrage") cd *= this.perks.barrageCdMul;
    if (id === "flash") cd *= this.perks.flashCdMul;
    this.stats.abilityMax[id] = cd;
    this.stats.abilityCd[id] = 0;
    if (slotIndex !== undefined) {
      this.stats.equippedAbilities[slotIndex] = id;
    } else {
      this.stats.equippedAbilities.push(id);
    }
  }

  // Replace an equipped ability with the pending one (called from swap UI).
  swapAbility(replaceId: string) {
    if (this.stats.state !== "swap" || !this.stats.pendingAbilityId) return;
    const slot = this.stats.equippedAbilities.indexOf(replaceId);
    if (slot < 0) return;
    const newId = this.stats.pendingAbilityId;
    // Clean up old ability state
    delete this.stats.abilityCd[replaceId];
    delete this.stats.abilityMax[replaceId];
    this.equipAbilityInternal(newId, slot);
    this.stats.pendingAbilityId = null;
    this.acquiredPerks.push(`ability:${newId}`);
    this.afterPerkSelected();
  }

  // Pause / resume. Only allowed during active play (not during overlays).
  pause() {
    if (this.stats.state !== "playing") return;
    this.stats.state = "paused";
    this.emitStats();
  }

  resume() {
    if (this.stats.state !== "paused") return;
    this.stats.state = "playing";
    this.emitStats();
  }

  togglePause() {
    if (this.stats.state === "playing") this.pause();
    else if (this.stats.state === "paused") this.resume();
  }

  // ============================================================
  // ===== DEV MODE =============================================
  // Author-only cheats. Gated by the React DevPanel (Ctrl+Shift+D
  // unlock). All methods are safe no-ops if state isn't ready.
  // ============================================================
  devMode = false;
  devGodMode = false;        // re-applied each frame in update() if true

  devSetGodMode(on: boolean) {
    this.devGodMode = on;
    if (on && this.player) this.player.invuln = Math.max(this.player.invuln, 9999);
    else if (this.player) this.player.invuln = Math.min(this.player.invuln, 0.5);
  }

  devHealFull() {
    if (!this.player) return;
    this.player.hp = this.player.maxHp;
    this.stats.hp = this.player.maxHp;
    this.emitStats();
  }

  devAddMon(amount: number) {
    this.stats.mon = Math.max(0, this.stats.mon + amount);
    this.emitStats();
  }

  devAddXp(amount: number) {
    this.gainXp(Math.max(0, amount));
  }

  devFillUlt() {
    this.stats.ultCharge = this.stats.ultMax;
    this.stats.ultReady = true;
    this.emitStats();
  }

  devResetAbilityCooldowns() {
    for (const id of Object.keys(this.stats.abilityCd)) {
      this.stats.abilityCd[id] = 0;
    }
    this.emitStats();
  }

  devKillAllEnemies() {
    if (this.stats.state !== "playing") return;
    // Snapshot — killEnemy mutates collections.
    const list = [...this.enemies].filter(e => e.state !== "dead" && !e.isBoss);
    for (const e of list) {
      e.hp = 0;
      this.killEnemy(e, "honor");
    }
    this.stats.enemiesLeft = this.enemies.filter(e => e.state !== "dead").length;
    this.emitStats();
  }

  devKillBosses() {
    if (this.stats.state !== "playing") return;
    const list = [...this.enemies].filter(e => e.state !== "dead" && e.isBoss);
    for (const e of list) {
      e.hp = 0;
      this.killEnemy(e, "honor");
    }
    this.stats.enemiesLeft = this.enemies.filter(e => e.state !== "dead").length;
    this.emitStats();
  }

  devSpawnEnemy(kind: EnemyArchetype) {
    if (this.stats.state !== "playing") return;
    this.spawnSingleEnemy(this.stats.wave, kind);
    this.stats.enemiesLeft = this.enemies.filter(e => e.state !== "dead").length;
    this.emitStats();
  }

  devSkipToWave(wave: number) {
    // Clear arena and start the requested wave fresh.
    const list = [...this.enemies];
    for (const e of list) { e.state = "dead"; }
    this.enemies = [];
    const w = Math.max(1, Math.floor(wave));
    this.spawnWave(w);
    this.emitStats();
  }

  devToggleSpeed(mult: number) {
    // Multiplies the wall-clock dt the engine sees. 1 = normal, >1 = fast,
    // <1 = slow-mo. Stored on devTimeScale and applied in update().
    this.devTimeScale = Math.max(0.1, Math.min(8, mult));
  }
  devTimeScale = 1;

  // Called from update() so god-mode/time-scale stay sticky.
  private devTickHooks() {
    if (this.devGodMode && this.player) {
      this.player.hp = this.player.maxHp;
      this.player.invuln = Math.max(this.player.invuln, 9999);
    }
  }

  cancelSwap() {
    if (this.stats.state !== "swap") return;
    this.stats.pendingAbilityId = null;
    this.afterPerkSelected();
  }

  // Called by UI when user picks a perk
  selectPerk(id: string) {
    if (this.stats.state !== "levelup") return;

    // Ability pick?
    const ability = ABILITY_POOL.find(a => a.id === id);
    if (ability) {
      if (this.stats.equippedAbilities.includes(id)) return; // already have it
      if (this.stats.equippedAbilities.length < 2) {
        this.equipAbilityInternal(id);
        this.acquiredPerks.push(`ability:${id}`);
        this.afterPerkSelected();
      } else {
        // Need to swap — enter swap state, keep pendingChoices intact for back-out.
        this.stats.pendingAbilityId = id;
        this.stats.state = "swap";
        this.emitStats();
      }
      return;
    }

    // Passive perk
    this.applyPerk(id);
    this.acquiredPerks.push(id);
    this.afterPerkSelected();
  }

  // Shared bookkeeping after a level-up choice resolves.
  private afterPerkSelected() {
    this.pendingLevelUps--;
    if (this.pendingLevelUps > 0) {
      this.stats.pendingChoices = this.rollPerkChoices();
      this.stats.state = "levelup";
    } else {
      this.stats.pendingChoices = [];
      this.stats.state = "playing";
      // If a wave ended during the level-up sequence, the shop was queued —
      // open it now that all perks have been picked.
      if (this.pendingShopOpen) {
        this.pendingShopOpen = false;
        this.openShop();
        return;
      }
    }
    this.emitStats();
  }

  applyPerk(id: string) {
    switch (id) {
      case "blade_edge":
        // +15% base damage (rebalanced for the new rarity model).
        this.perks.damage = Math.min(MAX_KATANA_DAMAGE, Math.round(this.perks.damage * 1.15));
        break;
      case "swift_strike":
        // Re-skinned as Dexterity. +5 Dex per pick.
        this.perks.dexterity += 5;
        break;
      case "long_blade":
        this.perks.attackRangeMul = Math.min(MAX_ATTACK_RANGE_MUL, this.perks.attackRangeMul * 1.20);
        break;
      case "wide_arc":
        this.perks.attackArcMul = Math.min(MAX_ATTACK_ARC_MUL, this.perks.attackArcMul * 1.25);
        break;
      case "iron_body": {
        this.perks.maxHpBonus += 25;
        this.player.maxHp = Math.min(MAX_HP_CAP, 100 + this.perks.maxHpBonus);
        this.player.hp = this.player.maxHp;
        break;
      }
      case "swift_step": this.perks.speedMul *= 1.12; break;
      case "ghost_step": this.perks.stealthRangeMul *= 1.5; break;
      case "perfect_guard": this.perks.parryWindowMul *= 1.4; break;
      case "vampire": this.perks.healOnKill += 2; break;
      case "exec_parry": this.perks.parryDamage += 3; break;
      case "second_wind": {
        this.perks.secondWindAvailable = true;
        this.perks.hasSecondWind = true;
        break;
      }
      case "wave_clear": this.perks.healBetweenWaves += 25; break;
      case "phantom": this.perks.invulnBonus += 1; break;
      case "kensei":
        this.perks.damage = Math.min(MAX_KATANA_DAMAGE, this.perks.damage + 2);
        break;
      case "tempest": this.perks.doubleStrike = true; break;
      case "shadow_lord": this.perks.stealthHeal += 6; break;
      case "momentum": this.perks.momentumCdr += 1; break;
      case "crit_strike": this.perks.critChance = Math.min(0.9, this.perks.critChance + 0.20); break;
      case "barrage_master": {
        this.perks.barrageCdMul *= 0.7;
        if (this.stats.equippedAbilities.includes("barrage")) {
          this.stats.abilityMax.barrage = ABILITY.BARRAGE_CD * this.perks.barrageCdMul;
        }
        break;
      }
      case "flash_master": {
        this.perks.flashCdMul *= 0.7;
        if (this.stats.equippedAbilities.includes("flash")) {
          this.stats.abilityMax.flash = ABILITY.FLASH_CD * this.perks.flashCdMul;
        }
        break;
      }
      case "executioner": {
        this.perks.executionerThreshold = Math.max(this.perks.executionerThreshold, 0.3);
        this.perks.executionerMul = 3;
        break;
      }
      case "lifebloom": this.perks.hpRegen += 1; break;
      case "barrage_blade": this.perks.barrageHits = 8; break;
      case "phantom_strike": this.perks.flashInvuln = Math.max(this.perks.flashInvuln, 1.5); break;
      // ===== Phase 3 — Status effect perks =====
      case "poison_hits_c":
        // Diminishing returns: each pick closes 30% of the remaining gap to 0.9
        this.perks.poisonChance = this.perks.poisonChance + (0.9 - this.perks.poisonChance) * 0.3;
        if (this.perks.poisonDps <= 0) this.perks.poisonDps = 4;
        break;
      case "poison_dmg_r":   this.perks.poisonDmgMul *= 1.5; break;
      case "poison_ramp_l":  this.perks.poisonRamp = Math.max(this.perks.poisonRamp, 0.15); break;
      case "fire_hits_c":
        this.perks.fireChance = Math.min(0.9, this.perks.fireChance + 0.12);
        break;
      case "fire_dmg_r":     this.perks.fireDmgMul *= 1.5; break;
      case "fire_spread_l":  this.perks.fireSpreadRadius = Math.max(this.perks.fireSpreadRadius, 140); break;
      case "bleed_hits_c":
        this.perks.bleedChance = Math.min(0.9, this.perks.bleedChance + 0.15);
        break;
      case "bleed_dmg_r":    this.perks.bleedDmgMul *= 1.5; break;
      case "lightning_hits_r":
        this.perks.lightningChance = Math.min(0.6, this.perks.lightningChance + 0.08);
        break;
      case "lightning_dmg_l":
        this.perks.lightningDmgBonus += 8;
        this.perks.lightningStunBonus += 0.25;
        break;
    }
  }

  rollPerkChoices(): PerkChoice[] {
    // Filter out passive perks that buff abilities the player hasn't equipped.
    const equipped = this.stats.equippedAbilities;
    const passivesAvailable = PERK_POOL.filter(p => {
      if ((p.id === "barrage_master" || p.id === "barrage_blade") && !equipped.includes("barrage")) return false;
      if ((p.id === "flash_master" || p.id === "phantom_strike") && !equipped.includes("flash")) return false;
      return true;
    });

    // Weight: common 70%, rare 25%, legendary 5%
    const pickPassive = (): PerkChoice => {
      const r = Math.random();
      const rarity = r < 0.05 ? "legendary" : r < 0.30 ? "rare" : "common";
      const pool = passivesAvailable.filter(p => p.rarity === rarity);
      const src = pool.length ? pool : passivesAvailable;
      return { ...src[Math.floor(Math.random() * src.length)], kind: "passive" } as PerkChoice;
    };

    // Build ability cards for any abilities the player doesn't yet have equipped.
    const abilityCards: PerkChoice[] = ABILITY_POOL
      .filter(a => !equipped.includes(a.id))
      .map(a => ({
        id: a.id,
        kanji: a.kanji,
        name: a.name,
        desc: a.desc,
        rarity: "rare",
        kind: "ability",
      }));

    const out: PerkChoice[] = [];
    const seen = new Set<string>();

    // Guarantee at least one ability card on early level-ups so the player
    // always has a way to unlock their first abilities.
    if (abilityCards.length > 0 && (equipped.length < 2 || Math.random() < 0.5)) {
      const ac = abilityCards[Math.floor(Math.random() * abilityCards.length)];
      out.push(ac);
      seen.add(ac.id);
    }

    let safety = 30;
    while (out.length < 3 && safety-- > 0) {
      // Mix in another ability card occasionally
      const useAbility = abilityCards.length > 0 && Math.random() < 0.25;
      const candidate = useAbility
        ? abilityCards[Math.floor(Math.random() * abilityCards.length)]
        : pickPassive();
      if (seen.has(candidate.id)) continue;
      seen.add(candidate.id);
      out.push(candidate);
    }
    return out;
  }

  gainXp(amount: number) {
    this.stats.xp += amount;
    while (this.stats.xp >= this.stats.xpToNext) {
      this.stats.xp -= this.stats.xpToNext;
      this.stats.level += 1;
      this.stats.xpToNext = Math.round(BASE.XP_BASE * Math.pow(BASE.XP_GROWTH, this.stats.level - 1));
      this.pendingLevelUps += 1;
    }
    if (this.pendingLevelUps > 0 && this.stats.state === "playing") {
      this.stats.state = "levelup";
      this.stats.pendingChoices = this.rollPerkChoices();
      this.flash(`Level ${this.stats.level}!`);
      audio.play("levelUp");
    }
  }

  update(dtRaw: number) {
    // Dev mode hooks (god mode + time scale). Safe no-ops when disabled.
    if (this.devTimeScale !== 1) dtRaw = dtRaw * this.devTimeScale;
    if (this.devGodMode) this.devTickHooks();
    // Phase 1 — VFX systems tick every frame regardless of game state so
    // overlays (vignette/grain), flash timers, camera zoom and the katana
    // ribbon keep animating during pause/level-up overlays.
    this.quality.sample(dtRaw);
    this.vfx.resize(this.quality.state.particleCap);
    this.vfx.update(dtRaw);
    this.bossInkWash.update(dtRaw);
    this.cameraZoom.update(dtRaw);
    this.katanaTrail.update(dtRaw);
    // Phase 2 — ability VFX layers tick every frame so they continue to
    // fade smoothly even while the game is paused or in level-up.
    this.groundSlashes.update(dtRaw);
    this.whirlwindPetals.update(dtRaw);
    this.floorRings.update(dtRaw);
    this.chainBolts.update(dtRaw);
    this.soulRendShocks.update(dtRaw);
    if (this.whiteFlashTimer > 0) this.whiteFlashTimer = Math.max(0, this.whiteFlashTimer - dtRaw);
    if (this.edgeBleedTimer > 0) this.edgeBleedTimer = Math.max(0, this.edgeBleedTimer - dtRaw);

    // Phase 8 — final-boss death cinematic. While active, freeze gameplay
    // (slow-motion fade) and only tick visuals + the cinematic countdown.
    if (this.cinematicTimer > 0) {
      this.cinematicTimer -= dtRaw;
      this.updatePetals(dtRaw);
      this.updateParticles(dtRaw * 0.35);
      if (this.cinematicTimer <= 0) {
        this.cinematicTimer = 0;
        // Award an extra honor + extend the wave a touch so player can loot
        this.stats.honor += 5;
        this.flash("天下統一 — Empire forged");
        this.emitStats();
      }
      return;
    }

    if (this.stats.state === "victory" || this.stats.state === "defeat" ||
        this.stats.state === "levelup" || this.stats.state === "swap" ||
        this.stats.state === "shop" || this.stats.state === "paused") {
      this.updatePetals(dtRaw);
      return;
    }

    if (this.hitstop > 0) {
      this.hitstop -= dtRaw;
      this.updatePetals(dtRaw);
      return;
    }

    const dt = dtRaw * this.timeScale;
    this.elapsed += dt;

    this.updatePlayer(dt);
    this.updateEnemies(dt);
    this.updateEnemyProjectiles(dt);
    this.updateParticles(dt);
    this.updatePetals(dtRaw);
    this.updateAbilities(dt);
    this.maybeSpawnEnemies(dt);

    // Wave survival timer countdown — wave ends when timer expires,
    // then we open the between-wave shop (Phase 4) instead of auto-spawning.
    // Exception: on boss waves the timer is uncapped — the wave only
    // ends when every living boss is dead. The countdown still ticks
    // for visual feedback but reaching 0 does not end the wave.
    if (this.stats.waveTimer > 0) {
      this.stats.waveTimer = Math.max(0, this.stats.waveTimer - dt);
      if (this.stats.waveTimer === 0 && !this.stats.isBossWave) {
        this.flash(`Wave ${this.stats.wave} Survived`);
        audio.play("levelUp");
        // Phase 1 — slow zoom-out on wave clear (1.0 → 0.96 over 600ms),
        // then settle back to 1.0 a moment later.
        this.cameraZoom.setTarget(0.96, 3);
        setTimeout(() => this.cameraZoom.setTarget(1, 4), 800);
        // Sweep remaining enemies + auto-collect any uncollected XP orbs.
        // The sweep may trigger level-ups (state="levelup"); if so we MUST
        // wait until the player picks all perks before opening the shop,
        // otherwise the shop overlay clobbers the levelup overlay.
        this.cleanupWaveEnd();
        // Persist a resumeable snapshot at the wave-clear boundary. This
        // captures progression *before* the shop runs, then we re-save
        // again when the shop closes (see closeShop) so resumed runs start
        // on the next wave, fully spent.
        this.persistResumeSnapshot();
        if ((this.stats.state as string) === "levelup" || this.pendingLevelUps > 0) {
          this.pendingShopOpen = true;
        } else {
          this.openShop();
        }
      }
    }

    // Passive HP regen perk
    if (this.perks.hpRegen > 0) {
      this.hpRegenAccumulator += this.perks.hpRegen * dt;
      if (this.hpRegenAccumulator >= 1) {
        const heal = Math.floor(this.hpRegenAccumulator);
        this.hpRegenAccumulator -= heal;
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + heal);
      }
    }

    // Ability cooldown ticking — every equipped ability
    for (const id of this.stats.equippedAbilities) {
      const cur = this.stats.abilityCd[id] ?? 0;
      if (cur > 0) this.stats.abilityCd[id] = Math.max(0, cur - dt);
    }
    // Time-slow effect tick
    if (this.timeSlowRemaining > 0) {
      this.timeSlowRemaining = Math.max(0, this.timeSlowRemaining - dt);
    }

    if (this.cameraShake > 0) this.cameraShake = Math.max(0, this.cameraShake - dt * 4);
    if (this.stats.messageTimer > 0) {
      this.stats.messageTimer -= dt;
      if (this.stats.messageTimer <= 0) this.emitStats();
    }

    if (this.player.hp <= 0) {
      // Second wind?
      if (this.perks.hasSecondWind) {
        this.perks.hasSecondWind = false;
        this.player.hp = Math.round(this.player.maxHp * 0.5);
        this.player.invuln = 1.5;
        this.flash("Second Wind!");
        audio.play("levelUp");
      } else {
        this.stats.state = "defeat";
        this.stats.message = "You have fallen.";
        audio.play("defeat");
        audio.stopMusic();
        clearSavedRun();
        this.emitStats();
      }
    }

    // Class passives + ultimate trigger handling
    this.updateClassPassives(dt);
    this.updateClassEntities(dt);
    if (this.input.ultPressed) {
      this.triggerUltimate();
    }

    // ===== Phase 3: Secondary weapons tick =====
    this.updateSecondaries(dt);
    // ===== Phase 4: Consumable buff timers =====
    this.tickConsumableBuffs(dt);
    if (this.input.swapPressed) this.swapSecondary();

    this.input.attackPressed = false;
    this.input.parryPressed = false;
    this.input.barragePressed = false;
    this.input.flashPressed = false;
    this.input.whirlwindPressed = false;
    this.input.timeslowPressed = false;
    this.input.ultPressed = false;
    this.input.firePressed = false;
    this.input.swapPressed = false;

    // Emit stats every frame so the HUD timer + cooldowns animate smoothly.
    this.emitStats();
  }

  updatePlayer(dt: number) {
    const p = this.player;

    let mx = 0, my = 0;
    if (this.input.up) my -= 1;
    if (this.input.down) my += 1;
    if (this.input.left) mx -= 1;
    if (this.input.right) mx += 1;
    if (this.input.joyActive) { mx = this.input.joyDx; my = this.input.joyDy; }

    const mag = Math.hypot(mx, my);
    if (mag > 0.05) {
      mx /= Math.max(mag, 1);
      my /= Math.max(mag, 1);
      // Movement direction is default facing
      if (!this.input.mouseAim) p.facing = Math.atan2(my, mx);
    }

    // Mouse aim takes priority on desktop. Mouse coords are in screen space —
    // convert to world space by adding the camera offset so aiming covers full 360°.
    if (this.input.mouseAim) {
      const worldMx = this.input.mouseX + this.cameraX;
      const worldMy = this.input.mouseY + this.cameraY;
      p.facing = Math.atan2(worldMy - p.pos.y, worldMx - p.pos.x);
    }

    // Mid-dash: lock movement to dash direction at high speed; ignore WASD/joystick.
    const dashing = p.dashTimer > 0;
    // ===== Hold-to-block (Tate / shield weapons) =====
    // While blockHeld and a shield is equipped: drain blockHp, halve speed,
    // grant continuous mini-invuln so all existing damage paths short-circuit.
    // Releasing returns to normal; running out of blockHp drops the guard.
    const blocking = this.isBlocking();
    if (blocking) {
      // Passive drain so the player can't perma-block.
      this.stats.blockHp = Math.max(0, this.stats.blockHp - 6 * dt);
      // Continuous i-frames as long as blockHp lasts. Reapplied each frame.
      p.invuln = Math.max(p.invuln, 0.08);
    }
    // While mid-swing the player keeps most of their momentum (87%) instead
    // of grinding to a near-stop — feels much better when chaining attacks.
    const slow = (!dashing && p.attackAnim > 0) ? 0.87 : 1;
    // Hard cap on player speed bonuses from all sources (perks + class + items).
    // Penalties (speedMul < 1, e.g. Tetsubo / Sumo) still apply normally; only
    // the *bonus* above 1.0 is clamped so the player can never out-run elites.
    const MAX_SPEED_BONUS = 0.35; // +35% over base
    const cappedSpeedMul = this.perks.speedMul > 1
      ? Math.min(this.perks.speedMul, 1 + MAX_SPEED_BONUS)
      : this.perks.speedMul;
    // Wind Charm consumable: +30% movement speed while active.
    const buffSpeedMul = this.stats.buffWindCharmRemaining > 0 ? 1.30 : 1;
    if (dashing) {
      const dashSpeed = BASE.DASH_DISTANCE / BASE.DASH_DURATION;
      p.vel.x = Math.cos(p.dashAng) * dashSpeed;
      p.vel.y = Math.sin(p.dashAng) * dashSpeed;
    } else {
      const blockSlow = blocking ? 0.55 : 1;
      const speed = BASE.PLAYER_SPEED * cappedSpeedMul * buffSpeedMul * slow * blockSlow;
      p.vel.x = mx * speed;
      p.vel.y = my * speed;
    }
    p.pos.x = Math.max(20, Math.min(this.worldW - 20, p.pos.x + p.vel.x * dt));
    p.pos.y = Math.max(20, Math.min(this.worldH - 20, p.pos.y + p.vel.y * dt));

    // ===== Dash collision damage =====
    if (dashing) {
      const r = BASE.DASH_HIT_RADIUS;
      for (const e of this.enemies) {
        if (e.state === "dead") continue;
        if (p.dashHitIds.has(e.id)) continue;
        const d = Math.hypot(e.pos.x - p.pos.x, e.pos.y - p.pos.y);
        if (d < r + e.size) {
          // Dash contact damage scales with the player's flat damage perk.
          const dmg = BASE.DASH_DAMAGE * (this.perks.damage / BASE.ATTACK_DAMAGE);
          e.hp -= dmg;
          this.spawnFloatText(e.pos, `${Math.max(1, Math.round(dmg))}`, {
            color: "hsl(36 90% 75%)",
            size: 12,
          });
          e.hitFlash = 1;
          this.spawnSpark(e.pos);
          p.dashHitIds.add(e.id);
          if (e.hp <= 0) this.killEnemy(e, "honor");
        }
      }
    }

    p.attackCooldown = Math.max(0, p.attackCooldown - dt);
    p.parryCooldown = Math.max(0, p.parryCooldown - dt);
    p.parryWindow = 0; // parry mechanic removed; field kept for legacy refs
    p.invuln = Math.max(0, p.invuln - dt);
    p.dashCooldown = Math.max(0, p.dashCooldown - dt);
    p.dashTimer = Math.max(0, p.dashTimer - dt);
    if (p.dashTimer <= 0 && p.dashHitIds.size > 0) p.dashHitIds.clear();
    p.hitFlash = Math.max(0, p.hitFlash - dt * 4);
    if (p.attackAnim > 0) {
      p.attackAnim -= dt * 3.5;
      if (p.attackAnim < 0) p.attackAnim = 0;
    }

    if (this.input.attackPressed && p.attackCooldown <= 0 && !blocking) {
      // If the active secondary slot holds a melee weapon, the katana attack
      // button swings it instead of the katana. Katana buffs do NOT transfer —
      // the secondary uses its own damage/range/arc/cooldown via fireSecondary().
      if (this.activeSecondaryIsMelee()) {
        this.fireSecondary();
      } else {
        this.doPlayerAttack();
      }
    }

    // Dash on Shift / RMB / mobile guard button.
    if (this.input.parryPressed && p.dashCooldown <= 0 && p.dashTimer <= 0 && !blocking) {
      // Dash direction: aim direction (mouse) on desktop, movement input
      // otherwise. Falls back to current facing.
      let ang = p.facing;
      if (!this.input.mouseAim && (mx !== 0 || my !== 0)) {
        ang = Math.atan2(my, mx);
      }
      p.dashAng = ang;
      p.dashTimer = BASE.DASH_DURATION;
      p.dashCooldown = BASE.DASH_COOLDOWN;
      p.invuln = Math.max(p.invuln, BASE.DASH_IFRAMES);
      p.dashHitIds.clear();
      this.cameraShake = Math.max(this.cameraShake, 0.15);
      audio.play("smokeWoosh");
    }
  }

  doPlayerAttack() {
    const p = this.player;
    p.attackAnim = 1;
    p.swingWeaponId = null;
    p.swingDir = (p.swingDir === 1 ? -1 : 1);
    // Katana cooldown: classic perk multiplier × Dex scaling (katana
    // dexScale baseline = 0.8 so it benefits from Dex but not as much
    // as the lightest one-handers).
    p.attackCooldown = BASE.ATTACK_COOLDOWN * this.perks.attackCooldownMul * this.dexCooldownMul(0.8);

    const range = BASE.ATTACK_RANGE * this.perks.attackRangeMul;
    const arc = BASE.ATTACK_ARC * this.perks.attackArcMul;
    const stealthRange = BASE.STEALTH_KILL_RANGE * this.perks.stealthRangeMul;

    // Stealth kill — eligible if the enemy hasn't seen us (patrol + low
 // alertness) OR if the enemy is currently disoriented by smoke (from
 // either the Smoke Bomb ability or the Smoke Bomb secondary).
    const nearest = this.findNearestEnemyInFront(stealthRange, Math.PI * 0.6);
    const isUnaware = nearest && nearest.state === "patrol" && nearest.alertness < 0.5;
    const isSmoked  = nearest && nearest.disorientRemaining > 0;
    if (nearest && (isUnaware || isSmoked) && !nearest.isBoss) {
      this.killEnemy(nearest, "ghost");
      this.cameraShake = 0.4;
      this.hitstop = 0.08;
      audio.play("stealth");
      // Phase 1 — full-frame ink-splash centered on the kill.
      spawnInkSplash(this.vfx, this.quality.state,
        nearest.pos.x, nearest.pos.y,
        { count: 4, size: 36, hue: 0, lightness: 6, life: 0.4 },
      );
      if (this.perks.stealthHeal > 0) {
        // Stealth-kill heal is also a per-kill heal — clamp to the same cap.
        const heal = Math.min(MAX_HEAL_PER_KILL, this.perks.stealthHeal);
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + heal);
      }
      return;
    }

    const strikes = this.perks.doubleStrike ? 2 : 1;
    let hit = false;
    for (let s = 0; s < strikes; s++) {
      for (const e of this.enemies) {
        if (e.state === "dead") continue;
        const dx = e.pos.x - p.pos.x;
        const dy = e.pos.y - p.pos.y;
        const dist = Math.hypot(dx, dy);
        if (dist > range + e.size) continue;
        const ang = Math.atan2(dy, dx);
        let diff = ang - p.facing;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        if (Math.abs(diff) <= arc / 2) {
          this.dealDamage(e, this.perks.damage, ang, e.isBoss ? 20 : 80, "katana");
          hit = true;
        }
      }
    }
    if (hit) {
      this.cameraShake = Math.max(this.cameraShake, 0.15);
      this.hitstop = Math.max(this.hitstop, 0.04);
      audio.play("hit");
    }
    this.spawnSlash(p.pos, p.facing, range, arc);
    audio.playSlashRandom(arc > Math.PI * 0.9 ? 2 : 1);
    this.alertNearby(p.pos, 140, 0.6);
  }

  findNearestEnemyInFront(maxDist: number, arc: number): Enemy | null {
    const p = this.player;
    let best: Enemy | null = null;
    let bestDist = Infinity;
    for (const e of this.enemies) {
      if (e.state === "dead") continue;
      const dx = e.pos.x - p.pos.x;
      const dy = e.pos.y - p.pos.y;
      const dist = Math.hypot(dx, dy);
      if (dist > maxDist) continue;
      const ang = Math.atan2(dy, dx);
      let diff = ang - p.facing;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      if (Math.abs(diff) > arc / 2) continue;
      if (dist < bestDist) { bestDist = dist; best = e; }
    }
    return best;
  }

  killEnemy(e: Enemy, type: "honor" | "ghost") {
    e.state = "dead";
    e.deathTimer = 1.4;
    e.hp = 0;
    // Death Mark — chain to next nearest enemy with 3s remaining.
    if (e.markRemaining > 0) {
      e.markRemaining = 0;
      let next: Enemy | null = null;
      let bestD = Infinity;
      for (const o of this.enemies) {
        if (o === e || o.state === "dead") continue;
        const d = Math.hypot(o.pos.x - e.pos.x, o.pos.y - e.pos.y);
        if (d < bestD) { bestD = d; next = o; }
      }
      if (next) {
        next.markRemaining = ABILITY.DEATH_MARK_CHAIN;
        this.deathMarkId = next.id;
        // Phase 2 — jagged crimson chain-bolt arcs to the next victim.
        this.chainBolts.spawn(e.pos.x, e.pos.y, next.pos.x, next.pos.y, 0.4);
      } else {
        this.deathMarkId = null;
      }
    }
    // Phase 8 — final boss death cinematic: hitstop, screen flash, kanji card.
    if (e.archetype === "final") {
      this.cinematicTimer = 4.0;
      this.cinematicMaxTime = 4.0;
      this.cinematicPos = { x: e.pos.x, y: e.pos.y };
      this.hitstop = Math.max(this.hitstop, 0.45);
      this.cameraShake = Math.max(this.cameraShake, 1.0);
      this.spawnBlood(e.pos, Math.random() * Math.PI * 2, 80);
      // Wipe lingering enemy projectiles for a clean victory beat.
      this.enemyProjectiles = [];
      audio.play("bossRoar");
      // Phase 1 — arena-wide white flash + shockwave ring.
      this.whiteFlashTimer = 0.5; this.whiteFlashMax = 0.5; this.whiteFlashAlpha = 0.85;
      spawnRing(this.vfx, e.pos.x, e.pos.y, 0,
        Math.max(this.worldW, this.worldH) * 0.7, 600,
        { hue: 0, saturation: 0, lightness: 95, alpha: 0.9, lineW: 8 });
    }
    // Phase 1 — boss death VFX: full-screen ink wash, shockwave, falling ash.
    if (e.isBoss && e.archetype !== "final") {
      this.edgeBleedTimer = 0.8; this.edgeBleedMax = 0.8;
      spawnRing(this.vfx, e.pos.x, e.pos.y, 0, 320, 600,
        { hue: 358, saturation: 70, lightness: 35, alpha: 0.85, lineW: 6 });
      spawnInkSplash(this.vfx, this.quality.state, e.pos.x, e.pos.y,
        { count: 6, size: 48, hue: 358, lightness: 18, life: 0.7 });
      spawnAshFall(this.vfx, this.quality.state,
        this.player.pos.x, this.player.pos.y, this.width, this.height, 50);
      // Phase 3 — full-screen crimson ink wash centred on the boss's
      // current screen position, plus a tier-2 splat cluster.
      const sx = e.pos.x - this.cameraX;
      const sy = e.pos.y - this.cameraY;
      this.bossInkWash.trigger(sx, sy, 750, 358);
      spawnCrimsonSplat(this.vfx, this.quality.state, e.pos.x, e.pos.y, 2);
    }
    // Phase 3 — varied crimson splats for every non-boss kill, with a
    // small camera shake punch on heavy/shielded enemies.
    if (!e.isBoss && e.archetype !== "final") {
      const heavy = e.archetype === "heavy" || e.archetype === "shielded";
      spawnCrimsonSplat(this.vfx, this.quality.state, e.pos.x, e.pos.y, heavy ? 1 : 0);
      if (heavy) this.cameraShake = Math.max(this.cameraShake, 0.18);
    }
    if (type === "honor") this.stats.honor++;
    else this.stats.ghost++;
    // Mon coin drop — stealth kills (ghost) earn a 50% bonus.
    const monGain = Math.max(0, Math.round(e.monReward * (type === "ghost" ? 1.5 : 1)));
    this.stats.mon += monGain;
    if (monGain > 0) {
      // Floating gold popup, larger for bosses + bigger drops.
      const big = e.isBoss || monGain >= 25;
      this.spawnFloatText(e.pos, `+${monGain} 文`, {
        color: big ? "hsl(42 100% 72%)" : "hsl(42 95% 65%)",
        size: big ? 20 : 13,
        jp: true,
        vy: big ? -75 : -55,
      });
      audio.play("monPing");
      // ===== Phase C — Miko: 5% chance on Mon pickup → small healing pulse =====
      if (this.stats.classId === "miko" && Math.random() < 0.05) {
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + 6);
        this.spawnFloatText(this.player.pos, "+6", {
          color: "hsl(180 80% 75%)", size: 14, vy: -55,
        });
      }
    }
    this.spawnBlood(e.pos, Math.random() * Math.PI * 2, e.isBoss ? 40 : 18);
    audio.play(e.isBoss ? "bossRoar" : "kill");
    // Phase 4 — long sub-bass rumble layered under the boss roar on death.
    if (e.isBoss) audio.play("bossDeathRumble");
    // Heavy hitstop on boss kills for impact.
    if (e.isBoss) this.hitstop = Math.max(this.hitstop, 0.18);
    // ===== Combined per-kill healing — hard-capped at MAX_HEAL_PER_KILL =====
    // Stack every on-kill heal source (Bloodlust, Hungry Blade, Crimson Rite,
    // Odachi passive, Berserker Blood Rage) and clamp the sum to 6 HP so no
    // amount of stacking can restore more than 6 HP per single enemy kill.
    let killHeal = this.perks.healOnKill;
    if (this.odachiEquipped()) killHeal += 1;          // Odachi passive (was +2)
    if (this.ultBloodRageTimer > 0) killHeal += 3;     // Berserker Blood Rage (was +5)
    if (killHeal > 0) {
      const heal = Math.min(MAX_HEAL_PER_KILL, killHeal);
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + heal);
    }
    // Momentum: kills reduce all equipped ability cooldowns
    if (this.perks.momentumCdr > 0) {
      for (const id of this.stats.equippedAbilities) {
        const cur = this.stats.abilityCd[id] ?? 0;
        if (cur > 0) this.stats.abilityCd[id] = Math.max(0, cur - this.perks.momentumCdr);
      }
    }
    // Dokkaebi passive: 5% chance on kill to spawn an allied ghost
    if (this.stats.classId === "dokkaebi" && Math.random() < 0.05) {
      this.spawnAllyGhost(e.pos.x, e.pos.y, false);
    }
    // ===== Phase C — Tsuchigumo: 15% on kill, web nearby foes (2s) =====
    if (this.stats.classId === "tsuchigumo" && Math.random() < 0.15) {
      const R = 160;
      for (const o of this.enemies) {
        if (o === e || o.state === "dead") continue;
        const d = Math.hypot(o.pos.x - e.pos.x, o.pos.y - e.pos.y);
        if (d <= R && !o.isBoss) {
          o.webbedRemaining = Math.max(o.webbedRemaining, 2);
          o.stunTimer = Math.max(o.stunTimer, 0.6);
        }
      }
    }
    // Ultimate charge — kills give a small amount, more when low HP.
    this.addUltCharge(this.lowHp() ? 8 : 4);

    // ===== Phase 3: chance to drop an ammo pickup for the active secondary =====
    this.maybeDropAmmoPickup(e);
    // ===== Phase 4: chance to drop a consumable for elites/bosses =====
    this.maybeDropConsumable(e);

    // XP no longer applies instantly — drop orbs the player must collect.
    // Bosses scatter several big orbs, normal enemies drop 1–2.
    this.dropXpOrbs(e);
    // ===== Boss-wave clear condition =====
    // On a boss wave the timer no longer ends the wave — instead the
    // wave only completes when every living boss has been slain. As
    // soon as the last boss falls, force-end the wave by zeroing the
    // timer (the wave-end branch in update() handles the rest).
    if (e.isBoss && this.stats.isBossWave) {
      const bossesAlive = this.enemies.some(
        o => o !== e && o.isBoss && o.state !== "dead",
      );
      if (!bossesAlive) {
        this.stats.waveTimer = 0;
        this.flash(`◈ Boss Slain — Wave ${this.stats.wave} Cleared ◈`);
        audio.play("levelUp");
        this.cameraZoom.setTarget(0.96, 3);
        setTimeout(() => this.cameraZoom.setTarget(1, 4), 800);
        this.cleanupWaveEnd();
        if ((this.stats.state as string) === "levelup" || this.pendingLevelUps > 0) {
          this.pendingShopOpen = true;
        } else {
          this.openShop();
        }
      }
    }
    this.emitStats();
  }

  // True when the player is below 30% HP — used for ult charge bonuses + ramp.
  lowHp(): boolean {
    return this.player.hp / Math.max(1, this.player.maxHp) <= 0.3;
  }

  // Add charge to the ultimate gauge and update the `ultReady` flag.
  addUltCharge(amount: number) {
    if (this.stats.ultActive) return;
    this.stats.ultCharge = Math.min(this.stats.ultMax, this.stats.ultCharge + amount);
    if (this.stats.ultCharge >= this.stats.ultMax && !this.stats.ultReady) {
      this.stats.ultReady = true;
      audio.play("levelUp");
    }
  }

  // Apply damage with crit + executioner perk handling. Also handles knockback,
  // hit flash, stun, blood, kill bookkeeping, and class-driven damage tweaks.
  // `weaponSource` is the secondary id of the weapon that produced the hit
  // (used for hitstun lookup). Pass undefined for katana / generic sources.
  dealDamage(e: Enemy, baseDmg: number, ang: number, knockback: number, weaponSource?: SecondaryId | "katana") {
    // Phase 8 — assassin mid-dash i-frames negate damage entirely.
    if (e.dashInvuln > 0) {
      this.spawnSpark(e.pos);
      e.hitFlash = 0.4;
      return;
    }
    // Phase 8 — shielded ashigaru block frontal melee within ±70°.
    // The hit angle `ang` is the direction the blow is travelling, so a
    // frontal block requires the shield (e.shieldFacing) to be roughly
    // pointing back at the attacker, i.e. opposite to `ang`.
    if (e.archetype === "shielded" && e.shieldHp > 0) {
      const shieldOpposite = e.shieldFacing + Math.PI;
      let diff = ang - shieldOpposite;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      if (Math.abs(diff) < Math.PI * 0.39) {
        // Blocked — sparks, knockback, chip the shield.
        e.shieldHp -= 1;
        e.hitFlash = 0.6;
        e.vel.x = Math.cos(ang) * 30;
        e.vel.y = Math.sin(ang) * 30;
        this.spawnSpark(e.pos);
        audio.play("parry");
        audio.play("armorRing");
        if (e.shieldHp <= 0) {
          this.flash("Shield broken!");
          e.stunTimer = Math.max(e.stunTimer, 0.45);
        }
        return;
      }
    }
    let dmg = baseDmg;
    // Class global damage scalar (Kensei +20%, Ronin +10%, etc)
    dmg *= this.perks.classDamageMul;
    // Sake consumable: +30% damage while active.
    if (this.stats.buffSakeRemaining > 0) dmg *= 1.30;
    // Berserker rage scaling — up to +40% as HP drops to 20%
    if (this.perks.rageScaling) {
      const ratio = this.player.hp / Math.max(1, this.player.maxHp);
      const t = Math.max(0, Math.min(1, (1 - ratio) / 0.8)); // 0 at full HP, 1 at 20%
      dmg *= 1 + t * 0.4;
    }
    // Bushido (Samurai) — consumed on this attack
    if (this.stats.classId === "samurai" && this.stats.bushidoStacks > 0) {
      dmg *= 1 + this.stats.bushidoStacks * 0.10;
      this.stats.bushidoStacks = 0;
    }
    // Blood Rage (Berserker ult) — 2x damage during the rage
    if (this.ultBloodRageTimer > 0) dmg *= 2;
    // Shadow Step (Shinobi ult) — 3x damage while invisible
    if (this.ultShadowStepTimer > 0) dmg *= 3;
    // ===== Phase C — Kagebushi Shadow Consume ult: 2× damage =====
    if (this.ultShadowConsumeTimer > 0) dmg *= 2;
    // ===== Phase C — Hatamoto Shogun's Decree banner: +40% damage =====
    if (this.ultBannerActive) dmg *= 1.4;
    // Cursed enemies take +20% damage (Dokkaebi ult debuff)
    if (e.curseRemaining > 0) dmg *= 1.20;
    // ===== Phase C — Tsuchigumo webbed enemies take 2× damage =====
    if (e.webbedRemaining && e.webbedRemaining > 0) dmg *= 2;
    // Death Mark — +50% damage from all sources while marked.
    if (e.markRemaining > 0) dmg *= 1.5;
    // Executioner perk
    if (this.perks.executionerThreshold > 0 && e.maxHp > 0) {
      const ratio = e.hp / e.maxHp;
      if (ratio <= this.perks.executionerThreshold) dmg *= this.perks.executionerMul;
    }
    // Crit
    let isCrit = false;
    if (this.perks.critChance > 0 && Math.random() < this.perks.critChance) {
      dmg *= 3;
      isCrit = true;
    }
    e.hp -= dmg;
    // Floating damage number above the enemy.
    const shown = Math.max(1, Math.round(dmg));
    this.spawnFloatText(e.pos, isCrit ? `${shown}!` : `${shown}`, {
      color: isCrit ? "hsl(42 100% 65%)" : "hsl(36 30% 92%)",
      size: isCrit ? 18 : 13,
    });
    e.hitFlash = 1;
    // ===== Phase 2 — Hitstun =====
    // Look up base hitstun from the weapon source (defaults to katana value
    // if unspecified). Apply damage scaling + enemy resist + player mul.
    let baseHitstun: number;
    if (weaponSource && weaponSource !== "katana") {
      baseHitstun = SECONDARIES[weaponSource]?.hitstun ?? 0.18;
    } else {
      baseHitstun = 0.22; // katana baseline
    }
    // Damage→hitstun: bigger hits stun longer, scaled gently.
    const dmgScale = 1 + Math.min(2, dmg / 30);
    const resist = Math.max(0, Math.min(0.98, e.hitstunResist ?? 0));
    // Halve baseline + diminishing returns + hard cap so heavy weapons
    // (tetsubō, shield bash) can no longer perma-lock enemies.
    let raw = baseHitstun * 0.5 * dmgScale * (1 - resist) * (this.perks.hitstunMul ?? 1);
    const existing = e.stunTimer;
    if (existing > 0.25) raw *= 1 / (1 + (existing - 0.25) * 2.5);
    const cap = e.isBoss ? 0.45 : 0.7;
    const stunApplied = Math.min(cap, existing + raw);
    e.stunTimer = Math.max(e.stunTimer, stunApplied);
    const kb = knockback * this.perks.knockbackMul;
    e.vel.x = Math.cos(ang) * kb;
    e.vel.y = Math.sin(ang) * kb;
    // Shinobi poison-on-hit (passive) — duration stacks (capped at 8s).
    if (this.perks.poisonChance > 0 && Math.random() < this.perks.poisonChance) {
      e.poisonRemaining = Math.min(8, e.poisonRemaining + 4);
      if (this.perks.poisonDps <= 0) this.perks.poisonDps = 4;
    }
    // ===== Phase C — Kunoichi: every 4th hit auto-poisons =====
    if (this.stats.classId === "kunoichi") {
      this.kunoichiHitChain++;
      if (this.kunoichiHitChain >= 4) {
        this.kunoichiHitChain = 0;
        e.poisonRemaining = Math.min(8, e.poisonRemaining + 4);
      }
    }
    // ===== Phase 3 — Generic status effect chances =====
    // Fire (burn DoT), bleed (existing slot), and lightning (instant zap).
    if (this.perks.fireChance > 0 && Math.random() < this.perks.fireChance) {
      e.burnRemaining = Math.max(e.burnRemaining, 4);
      e.burnDps = Math.max(e.burnDps, 4);
    }
    if (this.perks.bleedChance > 0 && Math.random() < this.perks.bleedChance) {
      e.bleedRemaining = Math.max(e.bleedRemaining, 3);
      // Apply a small instant bleed tick so it feels punchy.
      const bleed = Math.max(1, Math.round(2 * this.perks.bleedDmgMul));
      e.hp -= bleed;
      this.spawnFloatText(e.pos, `${bleed}`, { color: "hsl(0 95% 60%)", size: 11 });
    }
    if (this.perks.lightningChance > 0 && Math.random() < this.perks.lightningChance) {
      const ld = Math.max(1, Math.round(4 + this.perks.lightningDmgBonus));
      e.hp -= ld;
      e.stunTimer = Math.max(e.stunTimer, 0.25 + this.perks.lightningStunBonus);
      e.hitFlash = 1;
      this.spawnFloatText(e.pos, `⚡${ld}`, { color: "hsl(55 100% 75%)", size: 13 });
      audio.play("crossbowSnap");
    }
    this.spawnBlood(e.pos, ang);
    // Phase 1 — sparks burst (orange + white-hot) on every weapon hit.
    spawnSparkBurst(this.vfx, this.quality.state, e.pos.x, e.pos.y, ang, {
      count: 7, spread: Math.PI * 80 / 180, hue: 32, speed: 220,
    });
    // Phase 4 — layered impact audio: metallic ring on armoured/heavy
    // foes, otherwise a wet flesh thud. Subtle, sits under the main hit.
    if (e.archetype === "shielded" || e.archetype === "heavy" || e.isBoss || e.archetype === "final") {
      audio.play("armorRing");
    } else {
      audio.play("fleshHit");
    }
    if (e.hp <= 0) this.killEnemy(e, "honor");
  }

  // ============ Phase 8 — elites & final boss helpers ============

  // Apply enemy damage to the player, respecting i-frames + parry.
  // Mirrors the inline melee block in updateEnemies but reusable for
  // assassin dashes and final-boss patterns.
  applyEnemyHit(e: Enemy, baseDamage: number) {
    if (this.player.invuln > 0) return;
    if (this.ultMountainTimer > 0 || this.ultBloodRageTimer > 0 || this.ultShadowStepTimer > 0) return;
    // ===== Phase 2 — Block check =====
    // If the player has any block HP remaining, fully absorb the hit and
    // drain block HP by the (mitigated) incoming damage. Triggers a flash
    // and sound but no actual HP loss / hit reaction.
    const incoming = Math.max(1, Math.round(this.scaleEnemyDamage(baseDamage)));
    if (this.stats.blockHpMax > 0 && this.stats.blockHp > 0) {
      this.stats.blockHp = Math.max(0, this.stats.blockHp - incoming);
      this.player.invuln = Math.max(this.player.invuln, 0.25);
      this.player.hitFlash = 0.4;
      this.cameraShake = Math.max(this.cameraShake, 0.18);
      this.spawnFloatText(this.player.pos, `Block ${incoming}`, {
        color: "hsl(45 80% 75%)",
        size: 12,
      });
      audio.play("parry");
      audio.play("armorRing");
      this.addUltCharge(4);
      void e;
      return;
    }
    // ===== Phase C — Hatamoto golden shield: absorb the next hit, 10s ICD =====
    if (this.stats.classId === "hatamoto" && this.hatamotoShieldReady) {
      this.hatamotoShieldReady = false;
      this.hatamotoShieldCd = 10;
      this.player.invuln = Math.max(this.player.invuln, 0.6 + this.perks.invulnBonus);
      this.player.hitFlash = 0.5;
      this.flash("Golden Shield");
      this.screenFlashColor = "hsla(45, 95%, 60%, 0.30)";
      this.screenFlashTimer = 0.25;
      audio.play("levelUp");
      return;
    }
    // ===== Phase C — Miko divine barrier: absorb 1 hit, refreshes every 20s =====
    if (this.stats.classId === "miko" && this.mikoBarrierReady) {
      this.mikoBarrierReady = false;
      this.mikoBarrierTimer = 0;
      this.player.invuln = Math.max(this.player.invuln, 0.6 + this.perks.invulnBonus);
      this.player.hitFlash = 0.4;
      this.flash("Divine Barrier");
      this.screenFlashColor = "hsla(180, 70%, 80%, 0.30)";
      this.screenFlashTimer = 0.25;
      audio.play("levelUp");
      return;
    }
    // ===== Phase C — Hatamoto banner: −30% damage taken =====
    // Scale by HP pool + defense, then apply banner reduction on top
    // (banner is temporary so it lives outside the cap).
    const bannerMul = this.ultBannerActive ? 0.7 : 1;
    baseDamage = Math.max(1, Math.round(this.scaleEnemyDamage(baseDamage) * bannerMul));
    this.player.hp -= baseDamage;
    // Damage taken — red float text above the player.
    this.spawnFloatText(this.player.pos, `-${Math.max(1, Math.round(baseDamage))}`, {
      color: "hsl(358 90% 65%)",
      size: 15,
    });
    if (this.stats.classId === "samurai") {
      this.stats.bushidoStacks = Math.min(5, this.stats.bushidoStacks + 1);
    }
    this.addUltCharge(this.lowHp() ? 20 : 12);
    this.player.invuln = 0.6 + this.perks.invulnBonus;
    this.player.hitFlash = 1;
    this.cameraShake = Math.max(this.cameraShake, 0.5);
    this.spawnBlood(this.player.pos, Math.random() * Math.PI * 2, 14);
    audio.play("hit");
    void e;
  }

  // Spawn an enemy arrow heading toward the player (with a bit of jitter).
  fireEnemyArrow(e: Enemy, ang: number) {
    const speed = 520;
    const jitter = (Math.random() - 0.5) * 0.06;
    const a = ang + jitter;
    const muzzleX = e.pos.x + Math.cos(a) * (e.size + 8);
    const muzzleY = e.pos.y + Math.sin(a) * (e.size + 8);
    this.enemyProjectiles.push({
      pos: { x: muzzleX, y: muzzleY },
      vel: { x: Math.cos(a) * speed, y: Math.sin(a) * speed },
      life: 1.6, maxLife: 1.6,
      damage: e.damage,
      size: 7,
      kind: "arrow",
      trail: [],
    });
    audio.play("crossbowSnap");
  }

  // Final boss radial volley — N orbs evenly spaced around the boss.
  fireBossVolley(e: Enemy, count: number, baseAng: number, speed: number) {
    for (let i = 0; i < count; i++) {
      const a = baseAng + (i / count) * Math.PI * 2;
      this.enemyProjectiles.push({
        pos: { x: e.pos.x, y: e.pos.y },
        vel: { x: Math.cos(a) * speed, y: Math.sin(a) * speed },
        life: 2.6, maxLife: 2.6,
        damage: Math.round(e.damage * 0.7),
        size: 9,
        kind: "orb",
        trail: [],
      });
    }
    audio.play("bombBoom");
  }

  // Final boss AI — three phases gated on HP fraction.
  // Phase 1 (>66%): radial volleys + slow stalking.
  // Phase 2 (33-66%): adds shockwave slams + faster movement.
  // Phase 3 (<33%): adds dash strikes between volleys, screen tinted red.
  // Phase 8 — tick enemy projectiles, collide with player, cull dead ones.
  updateEnemyProjectiles(dt: number) {
    for (const ep of this.enemyProjectiles) {
      ep.life -= dt;
      ep.trail.push({ x: ep.pos.x, y: ep.pos.y });
      if (ep.trail.length > 8) ep.trail.shift();
      ep.pos.x += ep.vel.x * dt;
      ep.pos.y += ep.vel.y * dt;
      // Out of world bounds → kill
      if (ep.pos.x < -20 || ep.pos.y < -20 || ep.pos.x > this.worldW + 20 || ep.pos.y > this.worldH + 20) {
        ep.life = 0;
        continue;
      }
      // Player collision
      const dx = this.player.pos.x - ep.pos.x;
      const dy = this.player.pos.y - ep.pos.y;
      if (Math.hypot(dx, dy) < BASE.PLAYER_RADIUS + ep.size * 0.5) {
          // ===== Phase B — Tessen passive 10% projectile deflect while equipped =====
          if (this.tessenEquipped() && Math.random() < 0.10) {
            this.spawnSpark(ep.pos);
            audio.play("parry");
            this.whiteFlashTimer = 0.06; this.whiteFlashMax = 0.06; this.whiteFlashAlpha = 0.22;
            ep.life = 0;
            continue;
          }
        // Deflect window — block + reflect (visual spark only; arrows just die).
        if (this.player.deflectTimer > 0 && Math.random() >= DEFLECT_BYPASS_CHANCE) {
          this.spawnSpark(ep.pos);
          this.flash("Deflected!");
          audio.play("parry");
          this.whiteFlashTimer = 0.08; this.whiteFlashMax = 0.08; this.whiteFlashAlpha = 0.3;
          spawnRing(this.vfx, this.player.pos.x, this.player.pos.y, 0, 100, 280,
            { hue: 358, saturation: 80, lightness: 50, alpha: 0.9, lineW: 4 });
          ep.life = 0;
          continue;
        }
        if (this.player.invuln <= 0) {
          const bannerMul = this.ultBannerActive ? 0.7 : 1;
          const dmg = Math.max(1, Math.round(this.scaleEnemyDamage(ep.damage) * bannerMul));
          this.player.hp -= dmg;
          this.spawnFloatText(this.player.pos, `-${dmg}`, {
            color: "hsl(358 90% 65%)",
            size: 15,
          });
          this.player.hitFlash = 1;
          this.player.invuln = 0.6 + this.perks.invulnBonus;
          this.cameraShake = Math.max(this.cameraShake, 0.4);
          this.spawnBlood(this.player.pos, Math.atan2(ep.vel.y, ep.vel.x), 8);
          this.addUltCharge(this.lowHp() ? 16 : 9);
          audio.play("hit");
        }
        ep.life = 0;
      }
    }
    this.enemyProjectiles = this.enemyProjectiles.filter(ep => ep.life > 0);
  }

  updateFinalBoss(e: Enemy, dt: number, dist: number, angToPlayer: number, speedMul: number) {
    // Phase gating
    const ratio = e.hp / Math.max(1, e.maxHp);
    if (ratio < 0.33 && e.bossPhase < 3) {
      e.bossPhase = 3;
      e.bossPatternTimer = 0;
      e.bossPatternCd = 0.6;
      this.flash("◈ FINAL PHASE — 鬼 ◈");
      this.cameraShake = Math.max(this.cameraShake, 0.7);
      audio.play("bossRoar");
      // Phase 3 — phase-transition: white flash + arena-wide shockwave.
      this.whiteFlashTimer = 0.35; this.whiteFlashMax = 0.35; this.whiteFlashAlpha = 0.7;
      spawnRing(this.vfx, e.pos.x, e.pos.y, 0,
        Math.max(this.worldW, this.worldH) * 0.6, 550,
        { hue: 0, saturation: 0, lightness: 95, alpha: 0.85, lineW: 6 });
    } else if (ratio < 0.66 && e.bossPhase < 2) {
      e.bossPhase = 2;
      e.bossPatternTimer = 0;
      e.bossPatternCd = 0.8;
      this.flash("◈ Phase II ◈");
      audio.play("bossRoar");
      // Phase 3 — phase-transition: white flash + arena-wide shockwave.
      this.whiteFlashTimer = 0.3; this.whiteFlashMax = 0.3; this.whiteFlashAlpha = 0.6;
      this.cameraShake = Math.max(this.cameraShake, 0.5);
      spawnRing(this.vfx, e.pos.x, e.pos.y, 0,
        Math.max(this.worldW, this.worldH) * 0.5, 500,
        { hue: 0, saturation: 0, lightness: 95, alpha: 0.75, lineW: 5 });
    }

    e.facing = angToPlayer;

    // Mid-pattern execution
    if (e.bossPatternTimer > 0) {
      e.bossPatternTimer -= dt;
      if (e.bossPattern === 0) {
        // Radial volley — fire 8/12/16 orbs around the boss in 3 bursts.
        const stepCount = e.bossPhase === 1 ? 1 : e.bossPhase === 2 ? 2 : 3;
        const stepInterval = 0.35;
        const burstAt = stepCount - Math.floor((e.bossPatternTimer) / stepInterval);
        if (burstAt > e.bossPatternStep) {
          e.bossPatternStep = burstAt;
          const count = 6 + e.bossPhase * 3;
          this.fireBossVolley(e, count, Math.random() * Math.PI * 2, 240);
        }
      } else if (e.bossPattern === 1) {
        // Ground slam — small windup then a shockwave (uses existing shockwaves[]).
        if (e.bossPatternStep === 0 && e.bossPatternTimer < 0.65) {
          e.bossPatternStep = 1;
          this.shockwaves.push({
            pos: { x: e.pos.x, y: e.pos.y },
            radius: 20,
            maxRadius: 260,
            life: 0.7,
            damage: Math.round(e.damage * 0.9),
            // Pre-mark the boss as already "hit" so its own slam can never
            // damage or launch it (the ring still hits everything else).
            hitSet: new Set([e.id]),
            ownerEnemyId: e.id,
          });
          this.cameraShake = Math.max(this.cameraShake, 0.55);
          audio.play("bombBoom");
        }
      } else if (e.bossPattern === 2) {
        // Dash sweep — three short dashes toward player.
        if (e.dashTimer > 0) {
          e.pos.x += Math.cos(e.dashAng) * 520 * speedMul * dt;
          e.pos.y += Math.sin(e.dashAng) * 520 * speedMul * dt;
          e.dashTimer -= dt;
          if (this.player.invuln <= 0 &&
              Math.hypot(this.player.pos.x - e.pos.x, this.player.pos.y - e.pos.y) <
              BASE.PLAYER_RADIUS + e.size + 6) {
            this.applyEnemyHit(e, e.damage);
            e.dashTimer = 0;
          }
        } else if (e.bossPatternStep < 3 && e.bossPatternTimer < 1.4 - e.bossPatternStep * 0.45) {
          e.bossPatternStep++;
          e.dashAng = angToPlayer;
          e.dashTimer = 0.22;
          e.dashInvuln = 0.18;
          audio.play("smokeWoosh");
        }
      }
      if (e.bossPatternTimer <= 0) {
        e.bossPatternCd = 1.4 - e.bossPhase * 0.2;
        e.bossPatternStep = 0;
      }
      return;
    }

    // Between patterns — stalk player slowly, then queue next pattern.
    e.bossPatternCd -= dt;
    if (dist > 220) {
      e.pos.x += Math.cos(angToPlayer) * e.speed * speedMul * dt;
      e.pos.y += Math.sin(angToPlayer) * e.speed * speedMul * dt;
    }
    if (e.bossPatternCd <= 0) {
      // Pick a pattern weighted by phase
      const choices: number[] = [0, 1];
      if (e.bossPhase >= 2) choices.push(1);
      if (e.bossPhase >= 3) { choices.push(2, 0); }
      e.bossPattern = choices[Math.floor(Math.random() * choices.length)];
      e.bossPatternStep = 0;
      e.bossPatternTimer =
        e.bossPattern === 0 ? 1.2 :
        e.bossPattern === 1 ? 0.85 : 1.5;
      e.attackAnim = 0.001;
    }
  }

  // ============ ACTIVE ABILITIES ============

  updateAbilities(dt: number) {
    const equipped = this.stats.equippedAbilities;
    // Trigger barrage
    if (this.input.barragePressed && equipped.includes("barrage") &&
        (this.stats.abilityCd.barrage ?? 0) <= 0 && !this.barrageActive) {
      this.castBarrage();
    }
    // Trigger flash step
    if (this.input.flashPressed && equipped.includes("flash") &&
        (this.stats.abilityCd.flash ?? 0) <= 0) {
      this.castFlashStep();
    }
    // Trigger whirlwind
    if (this.input.whirlwindPressed && equipped.includes("whirlwind") &&
        (this.stats.abilityCd.whirlwind ?? 0) <= 0 && !this.whirlwindActive) {
      this.castWhirlwind();
    }
    // Trigger time slow
    if (this.input.timeslowPressed && equipped.includes("timeslow") &&
        (this.stats.abilityCd.timeslow ?? 0) <= 0) {
      this.castTimeSlow();
    }

    // Tick active barrage
    if (this.barrageActive) {
      this.barrageTimer -= dt;
      if (this.barrageTimer <= 0 && this.barrageRemaining > 0) {
        this.barrageSwing();
        this.barrageRemaining--;
        this.barrageTimer = ABILITY.BARRAGE_INTERVAL;
        if (this.barrageRemaining <= 0) this.barrageActive = false;
      }
    }
    // Tick active whirlwind
    if (this.whirlwindActive) {
      this.whirlwindTimer -= dt;
      if (this.whirlwindTimer <= 0 && this.whirlwindRemaining > 0) {
        this.whirlwindSwing();
        this.whirlwindRemaining--;
        this.whirlwindTimer = ABILITY.WHIRLWIND_INTERVAL;
        if (this.whirlwindRemaining <= 0) this.whirlwindActive = false;
      }
    }

    // Decay flash trail markers
    for (const t of this.flashTrail) t.life -= dt * 2;
    this.flashTrail = this.flashTrail.filter(t => t.life > 0);

    // ===== New abilities: drain press queue and route to cast methods =====
    if (this.abilityPressQueue.length > 0) {
      const equipped = this.stats.equippedAbilities;
      for (const id of this.abilityPressQueue) {
        if (!equipped.includes(id)) continue;
        if ((this.stats.abilityCd[id] ?? 0) > 0) continue;
        switch (id) {
          case "bladestorm":    if (!this.bladeStormActive) this.castBladeStorm(); break;
          case "phantom_slash": this.castPhantomSlash(); break;
          case "death_mark":    this.castDeathMark(); break;
          case "soul_rend":     this.castSoulRend(); break;
          case "deflect":       this.castDeflect(); break;
          case "smoke_bomb":    this.castSmokeBomb(); break;
          case "war_horn":      this.castWarHorn(); break;
          case "execution":     this.castExecution(); break;
        }
      }
      this.abilityPressQueue.length = 0;
    }

    // Tick Blade Storm — 9 rapid 360° hits, last spin launches enemies.
    if (this.bladeStormActive) {
      this.bladeStormTimer -= dt;
      if (this.bladeStormTimer <= 0 && this.bladeStormRemaining > 0) {
        const isFinal = this.bladeStormRemaining === 1;
        this.bladeStormSwing(isFinal);
        this.bladeStormRemaining--;
        this.bladeStormTimer = ABILITY.BLADESTORM_INTERVAL;
        if (this.bladeStormRemaining <= 0) this.bladeStormActive = false;
      }
    }

    // Tick Phantom Slash projectiles (line waves traveling across arena).
    if (this.phantomSlashes.length > 0) {
      for (const w of this.phantomSlashes) {
        w.life -= dt;
        // Damage any enemy near the segment that hasn't been hit yet.
        const dx = w.ex - w.sx, dy = w.ey - w.sy;
        const len = Math.hypot(dx, dy) || 1;
        const ux = dx / len, uy = dy / len;
        for (const e of this.enemies) {
          if (e.state === "dead" || w.hitSet.has(e.id)) continue;
          const ex = e.pos.x - w.sx, ey = e.pos.y - w.sy;
          const t = ex * ux + ey * uy;
          if (t < 0 || t > len) continue;
          const perp = Math.abs(ex * (-uy) + ey * ux);
          if (perp > e.size + 22) continue;
          w.hitSet.add(e.id);
          this.dealDamage(e, ABILITY.PHANTOM_SLASH_DAMAGE + this.perks.damage, Math.atan2(uy, ux), 18);
        }
      }
      this.phantomSlashes = this.phantomSlashes.filter(w => w.life > 0);
    }

    // Tick Deflect window
    if (this.player.deflectTimer > 0) {
      this.player.deflectTimer = Math.max(0, this.player.deflectTimer - dt);
    }

    // Tick War Horn ripple visuals
    if (this.warHornRipples.length > 0) {
      for (const r of this.warHornRipples) r.life -= dt;
      this.warHornRipples = this.warHornRipples.filter(r => r.life > 0);
    }

    // ===== Phase 3 — Fireball travel + impact =====
    if (this.fireballs.length > 0) {
      for (const fb of this.fireballs) {
        fb.pos.x += fb.vel.x * dt;
        fb.pos.y += fb.vel.y * dt;
        fb.life -= dt;
        let hit = fb.life <= 0;
        if (!hit) {
          for (const e of this.enemies) {
            if (e.state === "dead") continue;
            const d = Math.hypot(e.pos.x - fb.pos.x, e.pos.y - fb.pos.y);
            if (d <= e.size + 8) { hit = true; break; }
          }
        }
        if (hit) {
          const r = ABILITY.FIREBALL_RADIUS;
          for (const e of this.enemies) {
            if (e.state === "dead") continue;
            const d = Math.hypot(e.pos.x - fb.pos.x, e.pos.y - fb.pos.y);
            if (d <= r) {
              const ang = Math.atan2(e.pos.y - fb.pos.y, e.pos.x - fb.pos.x);
              this.dealDamage(e, ABILITY.FIREBALL_DAMAGE + this.perks.damage, ang, 80);
              e.burnRemaining = Math.max(e.burnRemaining, ABILITY.FIREBALL_BURN_SECONDS);
              e.burnDps = Math.max(e.burnDps, 5);
            }
          }
          this.cameraShake = Math.max(this.cameraShake, 0.35);
          this.hitstop = Math.max(this.hitstop, 0.06);
          audio.play("bombBoom");
          spawnInkSplash(this.vfx, this.quality.state, fb.pos.x, fb.pos.y,
            { count: 8, size: 30, hue: 18, lightness: 50, life: 0.8 });
          fb.life = 0;
        }
      }
      this.fireballs = this.fireballs.filter(f => f.life > 0);
    }

    // ===== Phase 3 — Chain Lightning bolt fade =====
    if (this.lightningBolts.length > 0) {
      for (const b of this.lightningBolts) b.life -= dt;
      this.lightningBolts = this.lightningBolts.filter(b => b.life > 0);
    }

    // Tick Death Mark — auto-clear if marked enemy dies/expires.
    if (this.deathMarkId !== null) {
      const marked = this.enemies.find(e => e.id === this.deathMarkId);
      if (!marked || marked.state === "dead" || marked.markRemaining <= 0) {
        this.deathMarkId = null;
      }
    }
  }

  castBarrage() {
    this.barrageActive = true;
    this.barrageRemaining = this.perks.barrageHits;
    this.barrageTimer = 0;
    const cd = ABILITY.BARRAGE_CD * this.perks.barrageCdMul;
    this.stats.abilityCd.barrage = cd;
    this.stats.abilityMax.barrage = cd;
    this.flash("Sword Barrage!");
  }

  // One swing of the barrage — slightly fanned around current facing.
  barrageSwing() {
    const p = this.player;
    p.attackAnim = 1;
    p.swingWeaponId = null;
    p.swingDir = (p.swingDir === 1 ? -1 : 1);
    const range = BASE.ATTACK_RANGE * this.perks.attackRangeMul * 1.05;
    const arc = BASE.ATTACK_ARC * this.perks.attackArcMul;
    // Spread successive swings across the arc
    const spread = (Math.random() - 0.5) * 0.4;
    let hit = false;
    for (const e of this.enemies) {
      if (e.state === "dead") continue;
      const dx = e.pos.x - p.pos.x;
      const dy = e.pos.y - p.pos.y;
      const dist = Math.hypot(dx, dy);
      if (dist > range + e.size) continue;
      const ang = Math.atan2(dy, dx);
      let diff = ang - (p.facing + spread);
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      if (Math.abs(diff) <= arc / 2) {
        this.dealDamage(e, this.perks.damage, ang, e.isBoss ? 15 : 60);
        hit = true;
      }
    }
    this.spawnSlash(p.pos, p.facing + spread, range, arc);
    // Phase 2 — leave a fading ink-stroke slash mark on the ground.
    {
      const ang = p.facing + spread;
      const mx = p.pos.x + Math.cos(ang) * range * 0.55;
      const my = p.pos.y + Math.sin(ang) * range * 0.55;
      this.groundSlashes.spawn(mx, my, ang, range * 0.85, 1);
    }
    audio.play("slash");
    if (hit) {
      this.cameraShake = Math.max(this.cameraShake, 0.2);
      audio.play("hit");
    }
    this.alertNearby(p.pos, 140, 0.4);
  }

  castFlashStep() {
    const p = this.player;
    // Aim direction: facing
    const dirX = Math.cos(p.facing);
    const dirY = Math.sin(p.facing);

    // Find the nearest enemy along the facing line within range
    let bestE: Enemy | null = null;
    let bestT = Infinity;
    for (const e of this.enemies) {
      if (e.state === "dead") continue;
      const ex = e.pos.x - p.pos.x;
      const ey = e.pos.y - p.pos.y;
      const t = ex * dirX + ey * dirY; // projection onto facing
      if (t <= 0 || t > ABILITY.FLASH_RANGE) continue;
      // Perpendicular distance
      const perp = Math.abs(ex * (-dirY) + ey * dirX);
      if (perp > 80) continue;
      if (t < bestT) { bestT = t; bestE = e; }
    }

    const startX = p.pos.x;
    const startY = p.pos.y;
    let endX: number, endY: number;
    if (bestE) {
      // Teleport to behind the target
      endX = bestE.pos.x + dirX * (bestE.size + 18);
      endY = bestE.pos.y + dirY * (bestE.size + 18);
    } else {
      // No target — dash straight forward
      endX = p.pos.x + dirX * ABILITY.FLASH_RANGE * 0.6;
      endY = p.pos.y + dirY * ABILITY.FLASH_RANGE * 0.6;
    }
    // Clamp to world
    endX = Math.max(20, Math.min(this.worldW - 20, endX));
    endY = Math.max(20, Math.min(this.worldH - 20, endY));

    // Damage every enemy along the line
    for (const e of this.enemies) {
      if (e.state === "dead") continue;
      const ex = e.pos.x - startX;
      const ey = e.pos.y - startY;
      const lineLen = Math.hypot(endX - startX, endY - startY) || 1;
      const ux = (endX - startX) / lineLen;
      const uy = (endY - startY) / lineLen;
      const t = ex * ux + ey * uy;
      if (t < 0 || t > lineLen) continue;
      const perp = Math.abs(ex * (-uy) + ey * ux);
      if (perp > e.size + 24) continue;
      const ang = Math.atan2(uy, ux);
      this.dealDamage(e, ABILITY.FLASH_DAMAGE + this.perks.damage, ang, 30);
    }

    // Lay down trail markers (slash echoes)
    const segs = 8;
    for (let i = 0; i <= segs; i++) {
      const t = i / segs;
      this.flashTrail.push({
        x: startX + (endX - startX) * t,
        y: startY + (endY - startY) * t,
        ang: p.facing,
        life: 1,
      });
    }

    // Move player + invuln + cooldown
    p.pos.x = endX;
    p.pos.y = endY;
    p.invuln = Math.max(p.invuln, 0.4 + this.perks.flashInvuln);
    const fcd = ABILITY.FLASH_CD * this.perks.flashCdMul;
    this.stats.abilityCd.flash = fcd;
    this.stats.abilityMax.flash = fcd;
    this.cameraShake = 0.35;
    audio.play("stealth");
    audio.play("slash");
    this.flash("Flash Step!");
    // Phase 1 — desaturated player afterimage at the departure point.
    spawnGhostAfterimage(this.vfx, startX, startY, p.facing, BASE.PLAYER_RADIUS);
  }

  // ============ Whirlwind: spin attack hitting enemies in a 360° ring ============
  castWhirlwind() {
    this.whirlwindActive = true;
    this.whirlwindRemaining = ABILITY.WHIRLWIND_HITS;
    this.whirlwindTimer = 0;
    const cd = ABILITY.WHIRLWIND_CD;
    this.stats.abilityCd.whirlwind = cd;
    this.stats.abilityMax.whirlwind = cd;
    this.flash("Whirlwind!");
    // Phase 2 — start the rotating ink-petal ring around the player.
    this.whirlwindPetals.start(ABILITY.WHIRLWIND_HITS * ABILITY.WHIRLWIND_INTERVAL + 0.15);
  }

  whirlwindSwing() {
    const p = this.player;
    p.attackAnim = 1;
    p.swingWeaponId = null;
    const range = BASE.ATTACK_RANGE * this.perks.attackRangeMul * 0.95;
    let hit = false;
    for (const e of this.enemies) {
      if (e.state === "dead") continue;
      const dx = e.pos.x - p.pos.x;
      const dy = e.pos.y - p.pos.y;
      const dist = Math.hypot(dx, dy);
      if (dist > range + e.size) continue;
      const ang = Math.atan2(dy, dx);
      this.dealDamage(e, this.perks.damage, ang, e.isBoss ? 18 : 70);
      hit = true;
    }
    // Visual: full 360° slash centered on player
    p.facing = (p.facing + 0.9) % (Math.PI * 2);
    this.spawnSlash(p.pos, p.facing, range, Math.PI * 2);
    audio.play("slash");
    if (hit) {
      this.cameraShake = Math.max(this.cameraShake, 0.25);
      audio.play("hit");
    }
  }

  // ============ Time Slow: enemies move at 25% speed for a few seconds ============
  castTimeSlow() {
    this.timeSlowRemaining = ABILITY.TIMESLOW_DURATION;
    const cd = ABILITY.TIMESLOW_CD;
    this.stats.abilityCd.timeslow = cd;
    this.stats.abilityMax.timeslow = cd;
    this.cameraShake = 0.2;
    audio.play("timeSlowSwell");
    this.flash("Time Slow!");
  }

  // ============ Blade Storm: 9 rapid 360° hits, last spin launches enemies ============
  castBladeStorm() {
    this.bladeStormActive = true;
    this.bladeStormRemaining = ABILITY.BLADESTORM_HITS;
    this.bladeStormTimer = 0;
    this.stats.abilityCd.bladestorm = ABILITY.BLADESTORM_CD;
    this.stats.abilityMax.bladestorm = ABILITY.BLADESTORM_CD;
    this.cameraShake = Math.max(this.cameraShake, 0.25);
    audio.play("bladeStorm");
    this.flash("Blade Storm!");
  }

  bladeStormSwing(launch: boolean) {
    const p = this.player;
    p.attackAnim = 1;
    p.swingWeaponId = null;
    const range = BASE.ATTACK_RANGE * this.perks.attackRangeMul * 1.0;
    let hit = false;
    for (const e of this.enemies) {
      if (e.state === "dead") continue;
      const dx = e.pos.x - p.pos.x;
      const dy = e.pos.y - p.pos.y;
      const dist = Math.hypot(dx, dy);
      if (dist > range + e.size) continue;
      const ang = Math.atan2(dy, dx);
      this.dealDamage(e, this.perks.damage, ang, e.isBoss ? (launch ? 38 : 12) : (launch ? 220 : 55));
      hit = true;
    }
    p.facing = (p.facing + 1.05) % (Math.PI * 2);
    this.spawnSlash(p.pos, p.facing, range, Math.PI * 2);
    // Phase 2 — every spin leaves a crimson ink-ring on the floor.
    this.floorRings.spawn(p.pos.x, p.pos.y, range * 0.95, 0.5,
      launch ? 12 : 358, launch ? 0.95 : 0.8);
    audio.playSlashRandom(launch ? 2 : 1);
    if (hit) {
      this.cameraShake = Math.max(this.cameraShake, launch ? 0.45 : 0.18);
      audio.play("hit");
      audio.play("fleshHit");
    }
  }

  // ============ Phantom Slash: pierce wave fired forward across the arena ============
  castPhantomSlash() {
    const p = this.player;
    const ang = p.facing;
    const sx = p.pos.x;
    const sy = p.pos.y;
    // Travel far enough to cross the arena from any starting point.
    const reach = Math.hypot(this.worldW, this.worldH);
    const ex = sx + Math.cos(ang) * reach;
    const ey = sy + Math.sin(ang) * reach;
    this.phantomSlashes.push({
      sx, sy, ex, ey, life: 0.55, maxLife: 0.55, hitSet: new Set<number>(),
    });
    this.stats.abilityCd.phantom_slash = ABILITY.PHANTOM_SLASH_CD;
    this.stats.abilityMax.phantom_slash = ABILITY.PHANTOM_SLASH_CD;
    this.cameraShake = Math.max(this.cameraShake, 0.3);
    audio.play("phantomSlash");
    this.flash("Phantom Slash!");
  }

  // ============ Death Mark: cursed seal on nearest enemy; chains on kill ============
  castDeathMark() {
    const target = this.findNearestEnemy();
    this.stats.abilityCd.death_mark = ABILITY.DEATH_MARK_CD;
    this.stats.abilityMax.death_mark = ABILITY.DEATH_MARK_CD;
    if (!target) {
      this.flash("No target");
      return;
    }
    target.markRemaining = ABILITY.DEATH_MARK_DURATION;
    this.deathMarkId = target.id;
    audio.play("deathMarkSeal");
    this.flash("Death Mark!");
  }

  // ============ Soul Rend: deal 40% of nearest enemy's current HP ============
  castSoulRend() {
    const target = this.findNearestEnemy();
    this.stats.abilityCd.soul_rend = ABILITY.SOUL_REND_CD;
    this.stats.abilityMax.soul_rend = ABILITY.SOUL_REND_CD;
    if (!target) {
      this.flash("No target");
      return;
    }
    const dmg = Math.max(1, Math.floor(target.hp * 0.4));
    const ang = Math.atan2(target.pos.y - this.player.pos.y, target.pos.x - this.player.pos.x);
    this.dealDamage(target, dmg, ang, target.isBoss ? 8 : 30);
    // Ghostly visual — burst of ink particles around target.
    for (let i = 0; i < 14; i++) {
      const a = Math.random() * Math.PI * 2;
      this.particles.push({
        pos: { x: target.pos.x, y: target.pos.y },
        vel: { x: Math.cos(a) * 80, y: Math.sin(a) * 80 - 40 },
        life: 0.7, maxLife: 0.7,
        color: "hsl(0, 70%, 35%)",
        size: 4 + Math.random() * 3,
        kind: "ink",
        rot: a, rotVel: (Math.random() - 0.5) * 4,
      });
    }
    this.cameraShake = Math.max(this.cameraShake, 0.3);
    audio.play("soulRendBass");
    this.flash("Soul Rend!");
    // Phase 2 — triple concentric shockwave from the player + edge bleed.
    this.soulRendShocks.spawn(this.player.pos.x, this.player.pos.y, 280, 0.55);
    this.edgeBleedTimer = 0.5; this.edgeBleedMax = 0.5;
  }

  // ============ Deflect: 1.0s perfect-guard window (scaled by Perfect Guard perk) ============
  castDeflect() {
    this.player.deflectTimer = ABILITY.DEFLECT_DURATION * this.perks.parryWindowMul;
    this.stats.abilityCd.deflect = ABILITY.DEFLECT_CD;
    this.stats.abilityMax.deflect = ABILITY.DEFLECT_CD;
    audio.play("parry");
    this.flash("Deflect stance!");
  }

  // ============ Smoke Bomb: cloud disorients enemies in radius ============
  castSmokeBomb() {
    const p = this.player;
    this.smokeClouds.push({
      pos: { x: p.pos.x, y: p.pos.y },
      radius: ABILITY.SMOKE_BOMB_RADIUS,
      life: ABILITY.SMOKE_BOMB_LINGER,
      maxLife: ABILITY.SMOKE_BOMB_LINGER,
    });
    for (const e of this.enemies) {
      if (e.state === "dead") continue;
      const d = Math.hypot(e.pos.x - p.pos.x, e.pos.y - p.pos.y);
      if (d <= ABILITY.SMOKE_BOMB_RADIUS) {
        e.disorientRemaining = ABILITY.SMOKE_BOMB_DURATION;
        e.disorientAng = Math.random() * Math.PI * 2;
        e.alertness = 0; // lose track of player
      }
    }
    this.stats.abilityCd.smoke_bomb = ABILITY.SMOKE_BOMB_CD;
    this.stats.abilityMax.smoke_bomb = ABILITY.SMOKE_BOMB_CD;
    audio.play("smokeWoosh");
    this.flash("Smoke Bomb!");
  }

  // ============ War Horn: slow every enemy on screen ============
  castWarHorn() {
    const p = this.player;
    for (const e of this.enemies) {
      if (e.state === "dead") continue;
      e.warHornSlowRemaining = ABILITY.WAR_HORN_DURATION;
      e.warHornSlowFactor = (e.isBoss || e.archetype === "final" || e.archetype === "boss")
        ? ABILITY.WAR_HORN_SLOW_BOSS : ABILITY.WAR_HORN_SLOW_NORMAL;
    }
    this.warHornRipples.push({
      pos: { x: p.pos.x, y: p.pos.y },
      life: 0.7, maxLife: 0.7, radius: 320,
    });
    this.stats.abilityCd.war_horn = ABILITY.WAR_HORN_CD;
    this.stats.abilityMax.war_horn = ABILITY.WAR_HORN_CD;
    this.cameraShake = Math.max(this.cameraShake, 0.4);
    audio.play("warHornCry");
    this.flash("War Horn!");
  }

  // ============ Execution: instakill enemy <15% HP, else heavy single hit ============
  castExecution() {
    this.stats.abilityCd.execution = ABILITY.EXECUTION_CD;
    this.stats.abilityMax.execution = ABILITY.EXECUTION_CD;
    // Find any enemy below threshold
    let victim: Enemy | null = null;
    let bestRatio = ABILITY.EXECUTION_THRESHOLD;
    for (const e of this.enemies) {
      if (e.state === "dead" || e.maxHp <= 0) continue;
      // Bosses can never be one-shot — they fall back to the heavy strike.
      if (e.isBoss || e.archetype === "final") continue;
      const r = e.hp / e.maxHp;
      if (r < bestRatio) { bestRatio = r; victim = e; }
    }
    if (victim) {
      // Double Mon drop + ink-red explosion
      victim.monReward = Math.round(victim.monReward * 2);
      const ang = Math.atan2(victim.pos.y - this.player.pos.y, victim.pos.x - this.player.pos.x);
      for (let i = 0; i < 22; i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = 60 + Math.random() * 180;
        this.particles.push({
          pos: { x: victim.pos.x, y: victim.pos.y },
          vel: { x: Math.cos(a) * sp, y: Math.sin(a) * sp },
          life: 0.8, maxLife: 0.8,
          color: i % 2 === 0 ? "hsl(0, 80%, 45%)" : "hsl(0, 70%, 25%)",
          size: 3 + Math.random() * 4, kind: "ink",
          rot: a, rotVel: (Math.random() - 0.5) * 6,
        });
      }
      this.spawnBlood(victim.pos, ang, 24);
      victim.hp = 0;
      this.killEnemy(victim, "honor");
      this.cameraShake = Math.max(this.cameraShake, 0.4);
      audio.play("executeThud");
      this.flash("Execution!");
      // Phase 2 — freeze-frame + large black ink-explosion on the victim.
      this.hitstop = Math.max(this.hitstop, 0.12);
      spawnInkSplash(this.vfx, this.quality.state, victim.pos.x, victim.pos.y,
        { count: 6, size: 28, hue: 0, lightness: 6, life: 0.6 });
      return;
    }
    // No threshold target — heavy strike on nearest
    const target = this.findNearestEnemy();
    if (target) {
      const ang = Math.atan2(target.pos.y - this.player.pos.y, target.pos.x - this.player.pos.x);
      this.dealDamage(target, ABILITY.EXECUTION_HEAVY_DAMAGE + this.perks.damage, ang, target.isBoss ? 12 : 80);
      this.cameraShake = Math.max(this.cameraShake, 0.3);
      audio.play("executeThud");
      this.flash("Execution strike!");
    }
  }

  // ===== Phase 3 — Caster: Fireball =====
  // Fires a slow projectile in the player's facing direction. On hit (or at
  // max range) it explodes, dealing damage in a radius and igniting all
  // foes for FIREBALL_BURN_SECONDS.
  castFireball() {
    this.stats.abilityCd.fireball = ABILITY.FIREBALL_CD;
    this.stats.abilityMax.fireball = ABILITY.FIREBALL_CD;
    const p = this.player;
    const ang = p.facing;
    const speed = ABILITY.FIREBALL_TRAVEL_SPEED * this.perks.projectileSpeedMul;
    this.fireballs.push({
      pos: { x: p.pos.x + Math.cos(ang) * 30, y: p.pos.y + Math.sin(ang) * 30 },
      vel: { x: Math.cos(ang) * speed, y: Math.sin(ang) * speed },
      life: 1.4, maxLife: 1.4,
    });
    this.flash("Fireball");
    audio.play("bombBoom");
    this.cameraShake = Math.max(this.cameraShake, 0.2);
  }

  // ===== Phase 3 — Caster: Chain Lightning =====
  // Strikes the nearest enemy, then arcs to the next-nearest unhit enemy
  // up to LIGHTNING_CHAINS times. Each hit deals damage + brief stun.
  castLightning() {
    this.stats.abilityCd.lightning = ABILITY.LIGHTNING_CD;
    this.stats.abilityMax.lightning = ABILITY.LIGHTNING_CD;
    const p = this.player;
    let origin = { x: p.pos.x, y: p.pos.y };
    const hit = new Set<number>();
    let chained = 0;
    const baseDmg = ABILITY.LIGHTNING_DAMAGE + this.perks.lightningDmgBonus;
    const stunDur = ABILITY.LIGHTNING_STUN + this.perks.lightningStunBonus;
    while (chained < ABILITY.LIGHTNING_CHAINS) {
      let best: Enemy | null = null;
      let bestD = ABILITY.LIGHTNING_RANGE;
      for (const e of this.enemies) {
        if (e.state === "dead" || hit.has(e.id)) continue;
        const d = Math.hypot(e.pos.x - origin.x, e.pos.y - origin.y);
        if (d < bestD) { bestD = d; best = e; }
      }
      if (!best) break;
      hit.add(best.id);
      this.lightningBolts.push({
        ax: origin.x, ay: origin.y, bx: best.pos.x, by: best.pos.y,
        life: 0.25, maxLife: 0.25,
      });
      const ang = Math.atan2(best.pos.y - origin.y, best.pos.x - origin.x);
      this.dealDamage(best, baseDmg, ang, 30);
      best.stunTimer = Math.max(best.stunTimer, stunDur);
      best.hitFlash = 1;
      origin = { x: best.pos.x, y: best.pos.y };
      chained++;
    }
    if (chained > 0) {
      audio.play("crossbowSnap");
      this.cameraShake = Math.max(this.cameraShake, 0.18);
      this.flash("Chain Lightning");
    }
  }

  // Helper: nearest live enemy to the player.
  findNearestEnemy(): Enemy | null {
    let best: Enemy | null = null;
    let bestD = Infinity;
    for (const e of this.enemies) {
      if (e.state === "dead") continue;
      const d = Math.hypot(e.pos.x - this.player.pos.x, e.pos.y - this.player.pos.y);
      if (d < bestD) { bestD = d; best = e; }
    }
    return best;
  }

  alertNearby(pos: Vec2, range: number, amount: number) {
    for (const e of this.enemies) {
      if (e.state === "dead") continue;
      const d = Math.hypot(e.pos.x - pos.x, e.pos.y - pos.y);
      if (d < range) {
        e.alertness = Math.min(1, e.alertness + amount * (1 - d / range));
        if (e.alertness >= 1 && e.state === "patrol") e.state = "alert";
      }
    }
  }

  updateEnemies(dt: number) {
    const p = this.player;
    for (const e of this.enemies) {
      e.hitFlash = Math.max(0, e.hitFlash - dt * 3);
      if (e.state === "dead") {
        e.deathTimer -= dt;
        continue;
      }
      e.stunTimer = Math.max(0, e.stunTimer - dt);
      e.attackCooldown = Math.max(0, e.attackCooldown - dt);
      // Tick ability-driven debuffs (Death Mark / Smoke disorient / War Horn slow)
      if (e.markRemaining > 0) e.markRemaining = Math.max(0, e.markRemaining - dt);
      if (e.disorientRemaining > 0) {
        e.disorientRemaining = Math.max(0, e.disorientRemaining - dt);
        // Slowly meander direction
        e.disorientAng += (Math.random() - 0.5) * dt * 4;
      }
      if (e.warHornSlowRemaining > 0) e.warHornSlowRemaining = Math.max(0, e.warHornSlowRemaining - dt);

      e.pos.x += e.vel.x * dt;
      e.pos.y += e.vel.y * dt;
      e.vel.x *= Math.pow(0.001, dt);
      e.vel.y *= Math.pow(0.001, dt);
      e.pos.x = Math.max(20, Math.min(this.worldW - 20, e.pos.x));
      e.pos.y = Math.max(20, Math.min(this.worldH - 20, e.pos.y));

      if (e.stunTimer > 0) continue;

      const dx = p.pos.x - e.pos.x;
      const dy = p.pos.y - e.pos.y;
      const dist = Math.hypot(dx, dy);
      const angToPlayer = Math.atan2(dy, dx);
      let diff = angToPlayer - e.facing;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;

      const inVision = dist < BASE.ENEMY_VISION_RANGE && Math.abs(diff) < BASE.ENEMY_VISION_ANGLE / 2;
      const inHearing = dist < BASE.ENEMY_HEARING_RANGE;

      // Aggressive AI: enemies are always hunting the player. Vision/hearing
      // still ramps alertness faster (used for stealth-kill eligibility &
      // visual cone color), but every enemy actively pursues from spawn.
      if (inVision) e.alertness = Math.min(1, e.alertness + dt * 2.5);
      else if (inHearing) e.alertness = Math.min(1, e.alertness + dt * 1.2);
      else e.alertness = Math.min(1, e.alertness + dt * 0.6);

      // Force every enemy out of patrol — they all want to kill the player.
      if (e.state === "patrol") e.state = "alert";

      const enemyAttackRange = e.isBoss ? BASE.ENEMY_ATTACK_RANGE + 16 : BASE.ENEMY_ATTACK_RANGE;
      // Half-second windup before every melee swing (bosses match).
      const telegraph = 0.5;

      // Enemies are no longer slowed by perks, War Horn, or generic slow effects.
      // Only the Time Slow ability and the brief Tetsubo "launched" CC still affect them.
      let speedMul = this.timeSlowRemaining > 0 ? 0.25 : 1;
      if (e.launched) speedMul = 0;

      // Smoke Bomb disorient — wander aimlessly, cannot attack.
      if (e.disorientRemaining > 0) {
        e.pos.x += Math.cos(e.disorientAng) * e.speed * 0.4 * speedMul * dt;
        e.pos.y += Math.sin(e.disorientAng) * e.speed * 0.4 * speedMul * dt;
        // Cancel any pending attacks
        e.attackTelegraph = 0;
        e.attackAnim = 0;
        if (e.state === "attacking") e.state = "alert";
        continue;
      }

      // ===== Phase B — Jutte disarm: enemy can move but cannot attack =====
      if (e.disarmedRemaining > 0) {
        e.attackTelegraph = 0;
        e.attackAnim = 0;
        if (e.state === "attacking") e.state = "alert";
        // (fall through — they can still chase, just no swings/shots)
      }

      // Phase 8 — elite/final cooldowns + archetype-specific AI branches.
      e.dashCooldown = Math.max(0, e.dashCooldown - dt);
      e.dashInvuln = Math.max(0, e.dashInvuln - dt);
      e.rangedCooldown = Math.max(0, e.rangedCooldown - dt);

      if (e.archetype === "shielded") {
        // Shielded — keep the shield pointed at the player while alert.
        e.shieldFacing = angToPlayer;
      }

      if (e.archetype === "archer") {
        // Archer — kite to maintain ~280px range and fire on cooldown.
        const ideal = 280;
        e.facing = angToPlayer;
        if (dist < ideal - 30) {
          e.pos.x -= Math.cos(angToPlayer) * e.speed * speedMul * dt;
          e.pos.y -= Math.sin(angToPlayer) * e.speed * speedMul * dt;
        } else if (dist > ideal + 60) {
          e.pos.x += Math.cos(angToPlayer) * e.speed * 0.7 * speedMul * dt;
          e.pos.y += Math.sin(angToPlayer) * e.speed * 0.7 * speedMul * dt;
        }
        // Fire whenever in range, regardless of kiting movement. Archers are
        // dedicated ranged elites — they don't need a vision cone to "see".
        if (dist < 520) {
          if (e.attackTelegraph <= 0 && e.attackAnim === 0) {
            if (e.rangedCooldown <= 0) {
              // 0.5s draw before releasing the arrow.
              e.attackTelegraph = 0.5 / speedMul;
              e.attackAnim = 0.001;
            }
          } else if (e.attackTelegraph > 0) {
            e.attackTelegraph -= dt;
            e.attackAnim = 1 - Math.max(0, e.attackTelegraph) / 0.5;
            if (e.attackTelegraph <= 0) {
              this.fireEnemyArrow(e, angToPlayer);
              e.rangedCooldown = 1.3 + Math.random() * 0.6;
              e.attackAnim = 0;
            }
          }
        }
        continue;
      }

      if (e.archetype === "assassin") {
        // Assassin — close range, then telegraphed dash with brief i-frames.
        e.facing = angToPlayer;
        if (e.dashTimer > 0) {
          e.pos.x += Math.cos(e.dashAng) * 600 * speedMul * dt;
          e.pos.y += Math.sin(e.dashAng) * 600 * speedMul * dt;
          e.dashTimer -= dt;
          if (this.player.invuln <= 0 &&
              Math.hypot(this.player.pos.x - e.pos.x, this.player.pos.y - e.pos.y) <
              BASE.PLAYER_RADIUS + e.size + 4) {
            this.applyEnemyHit(e, e.damage);
            e.dashTimer = 0;
          }
        } else if (e.attackTelegraph > 0) {
          // 0.5s wind-up tell before the lunge fires.
          e.attackTelegraph -= dt;
          e.attackAnim = 1 - Math.max(0, e.attackTelegraph) / 0.5;
          if (e.attackTelegraph <= 0) {
            e.dashAng = angToPlayer;
            e.dashTimer = 0.28;
            e.dashInvuln = 0.18;
            e.attackAnim = 0;
            audio.play("smokeWoosh");
          }
        } else if (dist < 240 && e.dashCooldown <= 0) {
          e.attackTelegraph = 0.5 / speedMul;
          e.attackAnim = 0.001;
          e.dashCooldown = 1.8 + Math.random() * 0.8;
        } else {
          const weave = Math.sin(this.elapsed * 4 + e.id) * 0.6;
          const ang = angToPlayer + weave;
          e.pos.x += Math.cos(ang) * e.speed * speedMul * dt;
          e.pos.y += Math.sin(ang) * e.speed * speedMul * dt;
        }
        continue;
      }

      if (e.archetype === "final" || e.archetype === "boss") {
        // Final + regular bosses — phased multi-pattern AI (see updateFinalBoss).
        this.updateFinalBoss(e, dt, dist, angToPlayer, speedMul);
        continue;
      }

      if (e.state === "alert") {
        e.facing = angToPlayer;
        if (dist > enemyAttackRange) {
          e.pos.x += Math.cos(angToPlayer) * e.speed * speedMul * dt;
          e.pos.y += Math.sin(angToPlayer) * e.speed * speedMul * dt;
        } else if (e.attackCooldown <= 0) {
          e.state = "attacking";
          e.attackTelegraph = telegraph / speedMul;
          e.attackAnim = 0;
        }
      } else if (e.state === "attacking") {
        e.facing = angToPlayer;
        e.attackTelegraph -= dt;
        e.attackAnim = 1 - e.attackTelegraph / telegraph;
        // Keep advancing during the windup so a kiting player can't simply
        // out-walk the swing. Move at 85% of normal chase speed, but only
        // close the gap if we're outside swing range (don't push *into* the
        // player and overshoot).
        if (dist > enemyAttackRange) {
          const chase = e.speed * 0.85 * speedMul * dt;
          e.pos.x += Math.cos(angToPlayer) * chase;
          e.pos.y += Math.sin(angToPlayer) * chase;
        }
        if (e.attackTelegraph <= 0) {
          if (dist < enemyAttackRange + BASE.PLAYER_RADIUS + 6) {
            if (this.player.deflectTimer > 0 && Math.random() >= DEFLECT_BYPASS_CHANCE) {
              // Deflect — block + reflect full damage to attacker.
              // Counter Strike perk adds bonus reflect damage on top.
              const counterBonus = this.perks.parryDamage;
              e.hp -= e.damage + counterBonus;
              e.hitFlash = 1;
              e.stunTimer = Math.max(e.stunTimer, e.isBoss ? 0.4 : 0.8);
              this.spawnSpark(this.player.pos);
              this.cameraShake = Math.max(this.cameraShake, 0.35);
              this.hitstop = Math.max(this.hitstop, 0.08);
              audio.play("parry");
              this.flash("Deflected!");
              // Phase 1 — silver/gold spark shower + white flash + camera shake.
              this.whiteFlashTimer = 0.08; this.whiteFlashMax = 0.08; this.whiteFlashAlpha = 0.3;
              spawnSparkBurst(this.vfx, this.quality.state,
                this.player.pos.x, this.player.pos.y,
                Math.atan2(this.player.pos.y - e.pos.y, this.player.pos.x - e.pos.x) + Math.PI,
                { count: 20, spread: Math.PI * 2, hue: 50, speed: 280 });
              if (e.hp <= 0) this.killEnemy(e, "honor");
            } else if (this.player.invuln <= 0 &&
                       this.ultMountainTimer <= 0 &&
                       this.ultBloodRageTimer <= 0 &&
                       this.ultShadowStepTimer <= 0) {
              // Yamabushi Mountain's Endurance — absorb instead of taking damage
              if (this.stats.classId === "yamabushi" && false) {
                this.ultMountainAbsorbed += e.damage;
              } else {
                const bannerMul = this.ultBannerActive ? 0.7 : 1;
                const dmg = Math.max(1, Math.round(this.scaleEnemyDamage(e.damage) * bannerMul));
                this.player.hp -= dmg;
                this.spawnFloatText(this.player.pos, `-${dmg}`, {
                  color: "hsl(358 90% 65%)",
                  size: 15,
                });
                // Bushido (Samurai) — gain a stack on hit
                if (this.stats.classId === "samurai") {
                  this.stats.bushidoStacks = Math.min(5, this.stats.bushidoStacks + 1);
                }
                // Ult charge — taking damage gives a chunky boost
                this.addUltCharge(this.lowHp() ? 20 : 12);
              }
              this.player.invuln = 0.6 + this.perks.invulnBonus;
              this.player.hitFlash = 1;
              this.cameraShake = 0.5;
              this.hitstop = 0.06;
              this.spawnBlood(this.player.pos, angToPlayer + Math.PI);
              audio.play("playerHit");
              this.emitStats();
            }
          }
          e.state = "alert";
          e.attackCooldown = e.isBoss ? 0.7 : 0.95;
          e.attackAnim = 0;
        }
      }
    }

    this.enemies = this.enemies.filter(e => !(e.state === "dead" && e.deathTimer <= -0.5));
  }

  updateParticles(dt: number) {
    for (const p of this.particles) {
      p.life -= dt;
      p.pos.x += p.vel.x * dt;
      p.pos.y += p.vel.y * dt;
      p.vel.x *= Math.pow(0.1, dt);
      p.vel.y *= Math.pow(0.1, dt);
      p.rot += p.rotVel * dt;
    }
    this.particles = this.particles.filter(p => p.life > 0);
    // Phase 6 — float text physics + cull
    for (const f of this.floatTexts) {
      f.life -= dt;
      f.pos.x += f.vel.x * dt;
      f.pos.y += f.vel.y * dt;
      f.vel.y *= Math.pow(0.55, dt);    // gentle deceleration upward
      f.vel.x *= Math.pow(0.2, dt);
    }
    this.floatTexts = this.floatTexts.filter(f => f.life > 0);
  }

  updatePetals(dt: number) {
    for (const p of this.petals) {
      // Snow drifts gently with low-amplitude sine; embers wobble more.
      const wob = p.kind === "ember" ? 18 : p.kind === "snow" ? 12 : 8;
      p.pos.x += (p.vel.x + Math.sin(this.elapsed * 2 + p.pos.y * 0.01) * wob) * dt;
      p.pos.y += p.vel.y * dt;
      p.rot += p.rotVel * dt;
      // Wrap depending on travel direction (embers rise → wrap top→bottom).
      if (p.vel.y >= 0) {
        if (p.pos.y > this.worldH + 10) {
          p.pos.y = -10;
          p.pos.x = Math.random() * this.worldW;
        }
      } else {
        if (p.pos.y < -10) {
          p.pos.y = this.worldH + 10;
          p.pos.x = Math.random() * this.worldW;
        }
      }
      if (p.pos.x > this.worldW + 10) p.pos.x = -10;
      else if (p.pos.x < -10) p.pos.x = this.worldW + 10;
    }
  }

  spawnBlood(pos: Vec2, ang: number, count = 8) {
    for (let i = 0; i < count; i++) {
      const a = ang + (Math.random() - 0.5) * Math.PI * 0.6;
      const speed = 80 + Math.random() * 160;
      this.particles.push({
        pos: { x: pos.x, y: pos.y },
        vel: { x: Math.cos(a) * speed, y: Math.sin(a) * speed },
        life: 0.5 + Math.random() * 0.4,
        maxLife: 0.9,
        color: `hsl(${355 + Math.random() * 8} ${70 + Math.random() * 20}% ${30 + Math.random() * 15}%)`,
        size: 2 + Math.random() * 3,
        kind: "blood",
        rot: 0, rotVel: 0,
      });
    }
  }

  spawnSlash(pos: Vec2, ang: number, range: number, arc: number) {
    for (let i = 0; i < 6; i++) {
      const t = (i / 5 - 0.5) * arc;
      const r = range * 0.7;
      this.particles.push({
        pos: {
          x: pos.x + Math.cos(ang + t) * r,
          y: pos.y + Math.sin(ang + t) * r,
        },
        vel: { x: 0, y: 0 },
        life: 0.18, maxLife: 0.18,
        color: "hsl(36 80% 92%)",
        size: 4,
        kind: "spark",
        rot: 0, rotVel: 0,
      });
    }
  }

  spawnSpark(pos: Vec2) {
    for (let i = 0; i < 14; i++) {
      const a = Math.random() * Math.PI * 2;
      const speed = 100 + Math.random() * 200;
      this.particles.push({
        pos: { x: pos.x, y: pos.y },
        vel: { x: Math.cos(a) * speed, y: Math.sin(a) * speed },
        life: 0.4, maxLife: 0.4,
        color: i % 2 ? "hsl(42 95% 70%)" : "hsl(36 90% 92%)",
        size: 2 + Math.random() * 2,
        kind: "spark",
        rot: 0, rotVel: 0,
      });
    }
  }

  // Phase 6 — short white-hot puff at the muzzle when a secondary fires.
  spawnMuzzleFlash(pos: Vec2, ang: number, color = "hsl(36 95% 88%)") {
    // Bright forward cone of small sparks
    for (let i = 0; i < 6; i++) {
      const a = ang + (Math.random() - 0.5) * 0.5;
      const speed = 180 + Math.random() * 220;
      this.particles.push({
        pos: { x: pos.x + Math.cos(ang) * 14, y: pos.y + Math.sin(ang) * 14 },
        vel: { x: Math.cos(a) * speed, y: Math.sin(a) * speed },
        life: 0.16 + Math.random() * 0.08,
        maxLife: 0.24,
        color,
        size: 2 + Math.random() * 2,
        kind: "spark",
        rot: 0, rotVel: 0,
      });
    }
    // Single soft glow disc
    this.particles.push({
      pos: { x: pos.x + Math.cos(ang) * 16, y: pos.y + Math.sin(ang) * 16 },
      vel: { x: 0, y: 0 },
      life: 0.18,
      maxLife: 0.18,
      color,
      size: 14,
      kind: "muzzle",
      rot: 0, rotVel: 0,
    });
  }

  // Phase 6 — sumi-e ink swirl (used on shop purchase, parry success, etc.)
  spawnInkSwirl(pos: Vec2, color = "hsl(0 75% 45%)", count = 12) {
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + Math.random() * 0.4;
      const speed = 60 + Math.random() * 90;
      this.particles.push({
        pos: { x: pos.x, y: pos.y },
        vel: { x: Math.cos(a) * speed, y: Math.sin(a) * speed },
        life: 0.55 + Math.random() * 0.25,
        maxLife: 0.8,
        color,
        size: 4 + Math.random() * 4,
        kind: "ink",
        rot: a,
        rotVel: (Math.random() - 0.5) * 4,
      });
    }
  }

  // Phase 6 — rising floating combat text (Mon popups, etc.)
  spawnFloatText(
    pos: Vec2,
    text: string,
    opts: { color?: string; size?: number; jp?: boolean; vy?: number } = {},
  ) {
    this.floatTexts.push({
      pos: { x: pos.x + (Math.random() - 0.5) * 14, y: pos.y - 8 },
      vel: { x: (Math.random() - 0.5) * 18, y: opts.vy ?? -55 },
      text,
      color: opts.color ?? "hsl(42 95% 65%)",
      life: 0.95,
      maxLife: 0.95,
      size: opts.size ?? 14,
      jp: opts.jp,
    });
  }

  // ============ RENDER ============
  render() {
    const ctx = this.ctx;
    const W = this.width, H = this.height;

    const shakeX = (Math.random() - 0.5) * this.cameraShake * 14;
    const shakeY = (Math.random() - 0.5) * this.cameraShake * 14;

    ctx.save();
    ctx.translate(shakeX, shakeY);

    const biome = this.currentBiome;
    const grad = ctx.createRadialGradient(W / 2, H / 2, 50, W / 2, H / 2, Math.max(W, H) * 0.7);
    grad.addColorStop(0, biome.skyInner);
    grad.addColorStop(0.6, biome.skyMid);
    grad.addColorStop(1, biome.skyOuter);
    ctx.fillStyle = grad;
    ctx.fillRect(-shakeX - 20, -shakeY - 20, W + 40, H + 40);

    ctx.globalAlpha = 0.04;
    ctx.strokeStyle = biome.groundLine;
    ctx.lineWidth = 1;
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      const y = (i / 8) * H + Math.sin(i) * 20;
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(W * 0.3, y + 30, W * 0.7, y - 30, W, y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    if (biome.sunVisible) {
      const sunX = W * 0.85;
      const sunY = H * 0.18;
      const sunR = Math.min(W, H) * 0.18;
      const sunGrad = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR);
      sunGrad.addColorStop(0, biome.sunInner);
      sunGrad.addColorStop(0.5, biome.sunMid);
      sunGrad.addColorStop(1, biome.sunOuter);
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Overcast wash for snowfield — soft horizontal band of pale light.
      const overcast = ctx.createLinearGradient(0, 0, 0, H * 0.6);
      overcast.addColorStop(0, "hsla(210, 30%, 70%, 0.18)");
      overcast.addColorStop(1, "hsla(210, 30%, 70%, 0)");
      ctx.fillStyle = overcast;
      ctx.fillRect(-shakeX - 20, -shakeY - 20, W + 40, H * 0.6);
    }

    // Phase 1 — parallax silhouettes drift at 20% camera speed.
    if (this.quality.state.drawParallax) {
      this.parallax.draw(ctx, this.cameraX, this.cameraY, W, H, biome.groundLine);
    }

    // ===== World-space rendering (camera follows player) =====
    this.updateCamera();
    ctx.save();
    // Phase 1 — apply ultimate / wave-clear zoom around the viewport center.
    if (this.cameraZoom.zoom !== 1) {
      ctx.translate(W / 2, H / 2);
      ctx.scale(this.cameraZoom.zoom, this.cameraZoom.zoom);
      ctx.translate(-W / 2, -H / 2);
    }
    ctx.translate(-this.cameraX, -this.cameraY);

    // Subtle ground texture so the larger world feels open, not empty.
    // Drawn only over the visible area for performance.
    const tile = 120;
    const x0 = Math.floor(this.cameraX / tile) * tile;
    const y0 = Math.floor(this.cameraY / tile) * tile;
    ctx.globalAlpha = 0.06;
    ctx.strokeStyle = biome.groundLine;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = x0; x < this.cameraX + W + tile; x += tile) {
      ctx.moveTo(x, this.cameraY - 10);
      ctx.lineTo(x, this.cameraY + H + 10);
    }
    for (let y = y0; y < this.cameraY + H + tile; y += tile) {
      ctx.moveTo(this.cameraX - 10, y);
      ctx.lineTo(this.cameraX + W + 10, y);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;

    // World boundary — a faint ink border at the edges of the arena
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = "hsl(0, 30%, 8%)";
    ctx.lineWidth = 6;
    ctx.strokeRect(0, 0, this.worldW, this.worldH);
    ctx.globalAlpha = 1;

    for (const p of this.petals) {
      ctx.save();
      ctx.translate(p.pos.x, p.pos.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      if (p.kind === "snow") {
        ctx.globalAlpha = 0.85;
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.6, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.kind === "ember") {
        // Glowing ember — small disc + faint halo.
        ctx.globalAlpha = 0.9;
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.55, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 0.25;
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 1.6, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.kind === "leaf") {
        // Bamboo / autumn leaf — slim pointed ellipse.
        ctx.globalAlpha = 0.75;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size * 1.6, p.size * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();
        // Mid vein
        ctx.globalAlpha = 0.4;
        ctx.strokeStyle = "hsla(0, 0%, 0%, 0.4)";
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(-p.size * 1.4, 0);
        ctx.lineTo(p.size * 1.4, 0);
        ctx.stroke();
      } else {
        // Default cherry petal.
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size * 1.3, p.size * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
    ctx.globalAlpha = 1;

    for (const e of this.enemies) {
      if (e.state === "dead" || e.stunTimer > 0) continue;
      ctx.save();
      ctx.translate(e.pos.x, e.pos.y);
      ctx.rotate(e.facing);
      const alertColor = e.state === "alert" || e.state === "attacking"
        ? "358, 78%, 48%"
        : "42, 78%, 58%";
      const visionRange = e.isBoss ? BASE.ENEMY_VISION_RANGE * 1.4 : BASE.ENEMY_VISION_RANGE;
      const coneGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, visionRange);
      coneGrad.addColorStop(0, `hsla(${alertColor}, 0.25)`);
      coneGrad.addColorStop(1, `hsla(${alertColor}, 0)`);
      ctx.fillStyle = coneGrad;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, visionRange, -BASE.ENEMY_VISION_ANGLE / 2, BASE.ENEMY_VISION_ANGLE / 2);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    for (const e of this.enemies) if (e.state === "dead") this.drawEnemy(e, true);
    for (const p of this.particles) if (p.kind === "blood") this.drawParticle(p);
    for (const e of this.enemies) if (e.state !== "dead") this.drawEnemy(e, false);

    this.drawPlayer();
    this.drawClassEntities();
    this.drawSecondaries();

    // Phase 2 — ability VFX in world space (under VFX pool so sparks land on top).
    this.groundSlashes.draw(ctx);
    this.floorRings.draw(ctx);
    this.soulRendShocks.draw(ctx);
    this.chainBolts.draw(ctx);
    // Whirlwind petals follow the player while active.
    this.whirlwindPetals.draw(ctx, this.player.pos.x, this.player.pos.y, BASE.PLAYER_RADIUS + 12);

    // Phase 1 — pooled VFX particles (sparks, ink-splats, ghosts, rings, ash).
    this.vfx.drawWorld(ctx);
    // Phase 1 — katana ink-brush ribbon (drawn over player so the slash reads on top).
    this.katanaTrail.draw(ctx);

    for (const p of this.particles) if (p.kind !== "blood") this.drawParticle(p);
    this.drawFloatTexts();

    // Flash Step trail — fading slash echoes left along the teleport line
    for (const t of this.flashTrail) {
      ctx.save();
      ctx.translate(t.x, t.y);
      ctx.rotate(t.ang);
      ctx.globalAlpha = t.life * 0.6;
      // Bright bone-white slash, fading to crimson
      const grad = ctx.createLinearGradient(-30, 0, 30, 0);
      grad.addColorStop(0, "hsla(36, 80%, 92%, 0)");
      grad.addColorStop(0.5, "hsla(36, 90%, 95%, 0.9)");
      grad.addColorStop(1, "hsla(358, 80%, 60%, 0)");
      ctx.strokeStyle = grad;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-30, 0);
      ctx.lineTo(30, 0);
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.restore();
    }

    // Phase 1 — the wide fan arc was replaced by KatanaTrail (drawn earlier
    // alongside the VFX pool). The player's blade itself still renders in
    // drawPlayer(), and tip samples are pushed into the ribbon there.

    // Dash trail — afterimage ring while mid-dash.
    if (this.player.dashTimer > 0) {
      const p = this.player;
      const t = p.dashTimer / BASE.DASH_DURATION; // 1 → 0
      ctx.save();
      ctx.strokeStyle = `hsla(36, 90%, 75%, ${0.5 * t + 0.2})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(p.pos.x, p.pos.y, BASE.PLAYER_RADIUS + 6 + (1 - t) * 14, 0, Math.PI * 2);
      ctx.stroke();
      // Streak behind the player along dash direction.
      ctx.strokeStyle = `hsla(0, 0%, 8%, ${0.45 * t})`;
      ctx.lineWidth = 8;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(p.pos.x, p.pos.y);
      ctx.lineTo(
        p.pos.x - Math.cos(p.dashAng) * 36,
        p.pos.y - Math.sin(p.dashAng) * 36,
      );
      ctx.stroke();
      ctx.restore();
    }

    // Deflect stance — pulsing crimson ring around the player.
    if (this.player.deflectTimer > 0) {
      const p = this.player;
      const pulse = 0.5 + 0.5 * Math.sin(this.elapsed * 18);
      ctx.save();
      ctx.strokeStyle = `hsla(358, 90%, 60%, ${0.55 + pulse * 0.35})`;
      ctx.lineWidth = 3 + pulse * 2;
      ctx.beginPath();
      ctx.arc(p.pos.x, p.pos.y, BASE.PLAYER_RADIUS + 14, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Phantom Slash — glowing ink-trail line across the arena.
    for (const w of this.phantomSlashes) {
      const t = w.life / w.maxLife;
      ctx.save();
      ctx.lineCap = "round";
      // Outer glow
      ctx.globalAlpha = 0.35 * t;
      ctx.strokeStyle = "hsl(358, 85%, 55%)";
      ctx.lineWidth = 36;
      ctx.beginPath();
      ctx.moveTo(w.sx, w.sy);
      ctx.lineTo(w.ex, w.ey);
      ctx.stroke();
      // Bright core
      ctx.globalAlpha = 0.9 * t;
      ctx.strokeStyle = "hsl(36, 90%, 92%)";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(w.sx, w.sy);
      ctx.lineTo(w.ex, w.ey);
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.restore();
    }

    // War Horn — expanding shockwave ring.
    for (const r of this.warHornRipples) {
      const t = 1 - r.life / r.maxLife;
      const radius = r.radius * t;
      ctx.save();
      ctx.globalAlpha = (1 - t) * 0.7;
      ctx.strokeStyle = "hsl(42, 95%, 65%)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(r.pos.x, r.pos.y, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = (1 - t) * 0.25;
      ctx.lineWidth = 12;
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.restore();
    }

    // ===== Phase 3 — Fireball trail =====
    for (const fb of this.fireballs) {
      ctx.save();
      const grad = ctx.createRadialGradient(fb.pos.x, fb.pos.y, 2, fb.pos.x, fb.pos.y, 26);
      grad.addColorStop(0, "hsl(45 100% 80%)");
      grad.addColorStop(0.5, "hsl(20 100% 55%)");
      grad.addColorStop(1, "hsla(0 80% 30% / 0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(fb.pos.x, fb.pos.y, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "hsl(50 100% 90%)";
      ctx.beginPath();
      ctx.arc(fb.pos.x, fb.pos.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // ===== Phase 3 — Lightning bolts =====
    for (const b of this.lightningBolts) {
      const t = b.life / b.maxLife;
      ctx.save();
      ctx.globalAlpha = Math.max(0, t);
      ctx.strokeStyle = "hsl(55 100% 80%)";
      ctx.lineWidth = 3;
      ctx.shadowBlur = 14;
      ctx.shadowColor = "hsl(55 100% 70%)";
      ctx.beginPath();
      // Jittered zig-zag between endpoints for that classic chain feel.
      const segs = 6;
      ctx.moveTo(b.ax, b.ay);
      for (let i = 1; i < segs; i++) {
        const f = i / segs;
        const jx = (Math.random() - 0.5) * 14;
        const jy = (Math.random() - 0.5) * 14;
        ctx.lineTo(b.ax + (b.bx - b.ax) * f + jx, b.ay + (b.by - b.ay) * f + jy);
      }
      ctx.lineTo(b.bx, b.by);
      ctx.stroke();
      ctx.restore();
    }

    // Death Mark — cursed seal floats above marked enemies.
    for (const e of this.enemies) {
      if (e.markRemaining <= 0 || e.state === "dead") continue;
      const bob = Math.sin(this.elapsed * 4 + e.id) * 3;
      ctx.save();
      ctx.translate(e.pos.x, e.pos.y - e.size - 18 + bob);
      ctx.globalAlpha = 0.85;
      // Outer ring
      ctx.strokeStyle = "hsl(358, 90%, 55%)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      ctx.stroke();
      // Kanji 呪
      ctx.fillStyle = "hsl(358, 95%, 70%)";
      ctx.font = "bold 16px 'Noto Serif JP', serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("呪", 0, 1);
      ctx.globalAlpha = 1;
      ctx.restore();
    }

    ctx.restore(); // end camera transform

    // Phase 2 — Time Slow desaturation tint sits between world and HUD/vignette,
    // so HUD remains crisp and full-color while the playfield reads as held-breath.
    if (this.timeSlowRemaining > 0) {
      const intensity = Math.min(1, this.timeSlowRemaining / 0.45);
      drawTimeSlowOverlay(ctx, W, H, intensity);
    }

    if (this.player.hitFlash > 0) {
      ctx.fillStyle = `hsla(358, 80%, 40%, ${this.player.hitFlash * 0.3})`;
      ctx.fillRect(-shakeX - 20, -shakeY - 20, W + 40, H + 40);
    }

    const vg = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.max(W, H) * 0.7);
    vg.addColorStop(0, "hsla(0, 0%, 0%, 0)");
    vg.addColorStop(1, "hsla(0, 0%, 0%, 0.35)");
    ctx.fillStyle = vg;
    ctx.fillRect(-shakeX - 20, -shakeY - 20, W + 40, H + 40);

    // Phase 1 — soft secondary ink-wash vignette and paper-grain overlay.
    drawVignette(ctx, W, H);
    if (this.quality.state.drawGrain) this.inkGrain.draw(ctx, W, H);

    // Phase 1 — soul-rend / boss-death edge-bleed (red glow on screen edges).
    if (this.edgeBleedTimer > 0 && this.edgeBleedMax > 0) {
      const eb = this.edgeBleedTimer / this.edgeBleedMax;
      const bleed = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.7);
      bleed.addColorStop(0, "rgba(160,0,0,0)");
      bleed.addColorStop(1, `rgba(160,0,0,${0.4 * eb})`);
      ctx.fillStyle = bleed;
      ctx.fillRect(0, 0, W, H);
    }

    // Phase 3 — boss-death full-screen crimson ink wash (screen space).
    this.bossInkWash.draw(ctx, W, H);

    // Phase 1 — full-screen white parry / phase-transition flash.
    if (this.whiteFlashTimer > 0 && this.whiteFlashMax > 0) {
      const wf = this.whiteFlashTimer / this.whiteFlashMax;
      ctx.fillStyle = `rgba(255,255,255,${this.whiteFlashAlpha * wf})`;
      ctx.fillRect(0, 0, W, H);
    }

    // Phase 8 — final-boss death cinematic overlay (drawn in screen space).
    if (this.cinematicTimer > 0 && this.cinematicMaxTime > 0) {
      const t = 1 - this.cinematicTimer / this.cinematicMaxTime;     // 0 → 1
      // Crimson screen flash that fades.
      const flash = Math.max(0, 1 - t * 1.4);
      ctx.fillStyle = `hsla(358, 90%, 45%, ${0.55 * flash})`;
      ctx.fillRect(-shakeX - 20, -shakeY - 20, W + 40, H + 40);
      // Dim everything else.
      ctx.fillStyle = `hsla(0, 0%, 0%, ${0.35 + t * 0.35})`;
      ctx.fillRect(-shakeX - 20, -shakeY - 20, W + 40, H + 40);
      // 終 (End) kanji rises and fades in.
      const alpha = Math.min(1, t * 2);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = "hsl(355, 90%, 60%)";
      ctx.textAlign = "center";
      ctx.font = `bold ${120 + t * 20}px serif`;
      ctx.fillText("終", W / 2, H / 2 - 10 + (1 - alpha) * 24);
      ctx.fillStyle = "hsl(36, 30%, 92%)";
      ctx.font = "bold 14px serif";
      ctx.fillText("天下統一 — Empire forged", W / 2, H / 2 + 60);
      ctx.restore();
    }

    ctx.restore();
  }

  drawPlayer() {
    const p = this.player;
    const ctx = this.ctx;
    ctx.save();
    // Shinobi Shadow Step — go ghostly + shimmer trail.
    if (this.ultShadowStepTimer > 0) ctx.globalAlpha = 0.25;
    ctx.translate(p.pos.x, p.pos.y);

    ctx.fillStyle = "hsla(0, 0%, 0%, 0.5)";
    ctx.beginPath();
    ctx.ellipse(0, BASE.PLAYER_RADIUS - 2, BASE.PLAYER_RADIUS, BASE.PLAYER_RADIUS * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.rotate(p.facing);

    // ===== Weapon model + swing animation =====
    // Pick the active weapon (katana when swingWeaponId is null OR when not
    // mid-melee-secondary-swing). Each melee secondary gets its own per-weapon
    // arc/range, model, and color; all of them honor swingDir so successive
    // swings alternate left→right→left→right.
    const weaponId = p.attackAnim > 0 ? p.swingWeaponId : null;
    let weaponRange: number;
    let weaponArc: number;
    if (weaponId === "tessen") { weaponRange = 90; weaponArc = Math.PI * 0.95; }
    else if (weaponId === "jutte") { weaponRange = 78; weaponArc = Math.PI * 0.55; }
    else if (weaponId === "ono") { weaponRange = 110; weaponArc = Math.PI * 0.55; }
    else if (weaponId === "twin_sai") { weaponRange = 88; weaponArc = Math.PI * 0.55; }
    else if (weaponId === "odachi") { weaponRange = 150; weaponArc = Math.PI * 1.5; }
    else {
      // Katana defaults — also used when idle.
      weaponRange = BASE.ATTACK_RANGE * this.perks.attackRangeMul;
      weaponArc = BASE.ATTACK_ARC * this.perks.attackArcMul;
    }
    // Sweep from -arc/2 → +arc/2 (or reversed, when swingDir is -1).
    const swingDir = p.swingDir;
    const swingAng = p.attackAnim > 0
      ? swingDir * (-weaponArc / 2 + (1 - p.attackAnim) * weaponArc)
      : 0.4 * swingDir;
    ctx.save();
    ctx.rotate(swingAng);
    this.drawPlayerWeapon(weaponId, p.attackAnim > 0, weaponRange);
    ctx.restore();

    // Phase 1 — sample the swung weapon's tip into the ink-brush trail.
    if (p.attackAnim > 0) {
      const tipLen = weaponRange * 0.95;
      const total = p.facing + swingAng;
      const tipX = p.pos.x + Math.cos(total) * tipLen;
      const tipY = p.pos.y + Math.sin(total) * tipLen;
      this.katanaTrail.push(tipX, tipY);
    }

    ctx.fillStyle = p.hitFlash > 0 ? "hsl(358, 80%, 60%)"
      : p.invuln > 0 ? "hsl(36, 30%, 30%)"
      : "hsl(0, 0%, 8%)";
    ctx.beginPath();
    ctx.arc(0, 0, BASE.PLAYER_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "hsl(358, 78%, 48%)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, BASE.PLAYER_RADIUS - 1, -Math.PI / 4, Math.PI / 4);
    ctx.stroke();
    ctx.fillStyle = "hsl(36, 30%, 85%)";
    ctx.beginPath();
    ctx.arc(BASE.PLAYER_RADIUS * 0.5, 0, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Draw the player's currently-equipped melee weapon. Called inside drawPlayer
  // with the canvas already translated to the player and rotated to
  // (facing + swingAng), so we draw along the +X axis (handle at origin,
  // tip at +X). `swinging` controls whether the weapon is in its idle pose
  // (short, low) or full extension during a swing.
  private drawPlayerWeapon(id: SecondaryId | null, swinging: boolean, range: number) {
    const ctx = this.ctx;
    const r0 = BASE.PLAYER_RADIUS * 0.6;     // grip starts here
    const tip = swinging ? range * 0.95 : 28;

    if (id === null) {
      // ===== Katana (default) =====
      ctx.strokeStyle = "hsl(36, 30%, 92%)";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(r0, 0);
      ctx.lineTo(tip, 0);
      ctx.stroke();
      // Crimson grip
      ctx.strokeStyle = "hsl(0, 60%, 30%)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(r0, 0);
      ctx.stroke();
      return;
    }

    if (id === "tessen") {
      // ===== Iron War Fan — wide fan blades from the grip =====
      const fanLen = tip * 0.85;
      const spread = Math.PI * 0.45;
      ctx.fillStyle = "hsla(45, 80%, 70%, 0.85)";
      ctx.strokeStyle = "hsl(0, 60%, 25%)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(r0, 0);
      ctx.lineTo(r0 + Math.cos(-spread) * fanLen, Math.sin(-spread) * fanLen);
      ctx.lineTo(r0 + Math.cos(0) * fanLen * 1.05, 0);
      ctx.lineTo(r0 + Math.cos(spread) * fanLen, Math.sin(spread) * fanLen);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Ribs
      ctx.strokeStyle = "hsl(0, 60%, 25%)";
      ctx.lineWidth = 1;
      for (let i = -2; i <= 2; i++) {
        const a = (i / 2) * spread;
        ctx.beginPath();
        ctx.moveTo(r0, 0);
        ctx.lineTo(r0 + Math.cos(a) * fanLen, Math.sin(a) * fanLen);
        ctx.stroke();
      }
      // Grip
      ctx.strokeStyle = "hsl(0, 60%, 30%)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 0); ctx.lineTo(r0, 0); ctx.stroke();
      return;
    }

    if (id === "jutte") {
      // ===== Truncheon — short shaft with a side prong near the guard =====
      ctx.strokeStyle = "hsl(210, 25%, 55%)";
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(r0, 0); ctx.lineTo(tip, 0); ctx.stroke();
      // Side prong (the iron hook)
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(r0 + 6, 0);
      ctx.lineTo(r0 + 12, -8);
      ctx.stroke();
      // Grip
      ctx.strokeStyle = "hsl(20, 50%, 25%)";
      ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(r0, 0); ctx.stroke();
      return;
    }

    if (id === "ono") {
      // ===== War Axe — long haft with a heavy crescent head at the tip =====
      ctx.strokeStyle = "hsl(20, 40%, 25%)";
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(0, 0); ctx.lineTo(tip - 14, 0); ctx.stroke();
      // Axe head
      ctx.fillStyle = "hsl(210, 15%, 45%)";
      ctx.strokeStyle = "hsl(0, 0%, 10%)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(tip - 14, -4);
      ctx.quadraticCurveTo(tip + 2, -16, tip + 6, 0);
      ctx.quadraticCurveTo(tip + 2, 16, tip - 14, 4);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      return;
    }

    if (id === "twin_sai") {
      // ===== Twin Sai — two short tridents, one above and one below the grip =====
      const saiLen = Math.min(tip, 60);
      ctx.strokeStyle = "hsl(280, 20%, 70%)";
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      for (const yOff of [-5, 5]) {
        // Main shaft
        ctx.beginPath();
        ctx.moveTo(r0, yOff); ctx.lineTo(r0 + saiLen, yOff); ctx.stroke();
        // Side prongs near the guard
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(r0 + 4, yOff); ctx.lineTo(r0 + 14, yOff - 6); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(r0 + 4, yOff); ctx.lineTo(r0 + 14, yOff + 6); ctx.stroke();
        ctx.lineWidth = 2.5;
      }
      // Grips
      ctx.strokeStyle = "hsl(280, 40%, 30%)";
      ctx.lineWidth = 3;
      for (const yOff of [-5, 5]) {
        ctx.beginPath(); ctx.moveTo(0, yOff); ctx.lineTo(r0, yOff); ctx.stroke();
      }
      return;
    }

    if (id === "odachi") {
      // ===== Odachi (Greatsword) — extra-long blade, thicker than katana =====
      ctx.strokeStyle = "hsl(0, 0%, 88%)";
      ctx.lineWidth = 5;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(r0, 0); ctx.lineTo(tip, 0); ctx.stroke();
      // Edge highlight
      ctx.strokeStyle = "hsla(0, 80%, 75%, 0.5)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(r0 + 6, -2); ctx.lineTo(tip - 4, -2); ctx.stroke();
      // Crossguard
      ctx.strokeStyle = "hsl(45, 70%, 45%)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(r0, -7); ctx.lineTo(r0, 7); ctx.stroke();
      // Long crimson grip
      ctx.strokeStyle = "hsl(0, 70%, 25%)";
      ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(-4, 0); ctx.lineTo(r0, 0); ctx.stroke();
      return;
    }
  }

  drawEnemy(e: Enemy, dead: boolean) {
    const ctx = this.ctx;
    ctx.save();
    // Tetsubo launch — render with vertical offset (shadow stays grounded).
    const yOff = e.launched ? -e.launchHeight : 0;
    ctx.translate(e.pos.x, e.pos.y + yOff);

    if (dead) {
      ctx.globalAlpha = Math.max(0, Math.min(1, e.deathTimer));
      ctx.rotate(e.facing + Math.PI / 2);
      ctx.fillStyle = "hsl(0, 30%, 12%)";
      ctx.beginPath();
      ctx.ellipse(0, 0, e.size * 1.4, e.size * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "hsla(358, 70%, 25%, 0.6)";
      ctx.beginPath();
      ctx.ellipse(0, e.size * 0.4, e.size * 1.6, e.size * 0.8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }

    ctx.fillStyle = "hsla(0, 0%, 0%, 0.5)";
    ctx.beginPath();
    ctx.ellipse(0, e.size - 2, e.size, e.size * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.rotate(e.facing);

    const isAttacking = e.state === "attacking";
    if (isAttacking) {
      const t = e.attackAnim;
      ctx.save();
      ctx.rotate(-Math.PI / 3 + t * (Math.PI / 1.5));
      ctx.strokeStyle = `hsla(358, 80%, 60%, ${0.4 + t * 0.6})`;
      ctx.lineWidth = (e.isBoss ? 7 : 4) + t * 4;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(e.size * 0.6, 0);
      ctx.lineTo(e.size + (e.isBoss ? 50 : 28), 0);
      ctx.stroke();
      ctx.restore();
    } else {
      ctx.save();
      ctx.rotate(0.5);
      ctx.strokeStyle = e.isBoss ? "hsl(42, 60%, 40%)" : "hsl(0, 0%, 50%)";
      ctx.lineWidth = e.isBoss ? 4 : 2;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(e.size * 0.5, 0);
      ctx.lineTo(e.size + (e.isBoss ? 36 : 16), 0);
      ctx.stroke();
      ctx.restore();
    }

    let bodyColor: string;
    if (e.hitFlash > 0) bodyColor = "hsl(36, 80%, 80%)";
    else if (e.isBoss) bodyColor = "hsl(0, 60%, 18%)";
    else if (e.state === "alert" || e.state === "attacking") bodyColor = "hsl(0, 50%, 22%)";
    else bodyColor = "hsl(30, 25%, 22%)";
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.arc(0, 0, e.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = e.isBoss ? "hsl(42, 80%, 50%)" : "hsl(0, 0%, 4%)";
    ctx.lineWidth = e.isBoss ? 2.5 : 1.5;
    ctx.stroke();
    ctx.fillStyle = "hsl(36, 40%, 30%)";
    ctx.beginPath();
    ctx.arc(e.size * 0.4, 0, e.isBoss ? 5 : 3, 0, Math.PI * 2);
    ctx.fill();

    // Shinobi poison-on-hit — sickly green tint pulse over the body.
    if (e.poisonRemaining > 0) {
      const pulse = 0.32 + Math.sin(this.elapsed * 8) * 0.08;
      ctx.fillStyle = `hsla(95, 75%, 45%, ${pulse})`;
      ctx.beginPath();
      ctx.arc(0, 0, e.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "hsla(95, 80%, 35%, 0.6)";
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    // Phase 8 — archetype-specific overlays.
    if (e.archetype === "shielded" && e.shieldHp > 0) {
      // Shield arc — drawn relative to shieldFacing in WORLD space, so undo
      // the local rotation first by rotating into shield space.
      ctx.save();
      ctx.rotate(-e.facing + e.shieldFacing);
      ctx.strokeStyle = "hsl(36, 50%, 35%)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, e.size + 5, -Math.PI * 0.39, Math.PI * 0.39);
      ctx.stroke();
      ctx.fillStyle = `hsla(36, 70%, ${30 + e.shieldHp * 4}%, 0.45)`;
      ctx.beginPath();
      ctx.arc(0, 0, e.size + 5, -Math.PI * 0.39, Math.PI * 0.39);
      ctx.lineTo(0, 0);
      ctx.fill();
      ctx.restore();
    } else if (e.archetype === "archer") {
      // Bow — drawn forward.
      ctx.save();
      ctx.strokeStyle = "hsl(36, 60%, 40%)";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(e.size + 4, 0, 7, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
      // Telegraph aim line during draw
      if (e.attackAnim > 0) {
        ctx.strokeStyle = `hsla(355, 90%, 55%, ${0.25 + e.attackAnim * 0.55})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(e.size + 4, 0);
        ctx.lineTo(e.size + 4 + 320, 0);
        ctx.stroke();
      }
      ctx.restore();
    } else if (e.archetype === "assassin") {
      // Twin blades.
      for (const off of [-1, 1]) {
        ctx.save();
        ctx.rotate(off * 0.45);
        ctx.strokeStyle = "hsl(0, 0%, 88%)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(e.size * 0.4, 0);
        ctx.lineTo(e.size + 14, 0);
        ctx.stroke();
        ctx.restore();
      }
      // Dash trail pulse during dash invuln
      if (e.dashInvuln > 0) {
        ctx.fillStyle = "hsla(260, 30%, 60%, 0.35)";
        ctx.beginPath();
        ctx.arc(0, 0, e.size + 6, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (e.archetype === "final") {
      // Crown of crimson glow + larger blade.
      ctx.save();
      ctx.strokeStyle = "hsl(358, 90%, 55%)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(e.size * 0.5, 0);
      ctx.lineTo(e.size + 56, 0);
      ctx.stroke();
      ctx.restore();
      const halo = ctx.createRadialGradient(0, 0, e.size * 0.6, 0, 0, e.size * 2.2);
      halo.addColorStop(0, "hsla(358, 90%, 50%, 0.45)");
      halo.addColorStop(1, "hsla(358, 90%, 30%, 0)");
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(0, 0, e.size * 2.2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    // Final boss extra: a centered kanji 鬼 above the body.
    if (e.archetype === "final") {
      ctx.save();
      ctx.fillStyle = "hsl(355, 90%, 60%)";
      ctx.font = "bold 22px serif";
      ctx.textAlign = "center";
      ctx.fillText("鬼", e.pos.x, e.pos.y - e.size - 22);
      ctx.restore();
    }

    // Boss HP bar
    if (e.isBoss) {
      const w = 90;
      const x = e.pos.x - w / 2;
      const y = e.pos.y - e.size - 18;
      ctx.fillStyle = "hsla(0, 0%, 0%, 0.6)";
      ctx.fillRect(x - 1, y - 1, w + 2, 6);
      ctx.fillStyle = "hsl(358, 78%, 48%)";
      ctx.fillRect(x, y, w * Math.max(0, e.hp / e.maxHp), 4);
      ctx.fillStyle = "hsl(42, 95%, 70%)";
      ctx.font = "bold 10px serif";
      ctx.textAlign = "center";
      ctx.fillText("◈ BOSS ◈", e.pos.x, y - 4);
      // Numeric HP — current/max, to the right of the bar.
      const hpNow = Math.max(0, Math.ceil(e.hp));
      const hpMax = Math.max(1, Math.ceil(e.maxHp));
      ctx.font = "bold 11px serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "hsla(0, 0%, 0%, 0.8)";
      ctx.fillText(`${hpNow}/${hpMax}`, x + w + 5, y + 3);
      ctx.fillStyle = "hsl(42, 95%, 70%)";
      ctx.fillText(`${hpNow}/${hpMax}`, x + w + 4, y + 2);
    } else {
      // Per-enemy HP bar — small, sumi-e ink/crimson, shown for every enemy.
      const ratio = Math.max(0, Math.min(1, e.hp / e.maxHp));
      const w = Math.max(22, e.size * 1.6);
      const x = e.pos.x - w / 2;
      const y = e.pos.y - e.size - 9;
      // Ink backdrop
      ctx.fillStyle = "hsla(0, 0%, 4%, 0.7)";
      ctx.fillRect(x - 1, y - 1, w + 2, 4);
      // Fill — crimson when damaged, fades to a duller tone as HP drops
      const hue = 358;
      const light = 30 + ratio * 22;
      ctx.fillStyle = `hsl(${hue}, 75%, ${light}%)`;
      ctx.fillRect(x, y, w * ratio, 2);
      // Hairline border
      ctx.strokeStyle = "hsla(36, 60%, 70%, 0.35)";
      ctx.lineWidth = 0.5;
      ctx.strokeRect(x - 1, y - 1, w + 2, 4);
      // Numeric HP — current/max, shown to the right of the bar.
      const hpNow = Math.max(0, Math.ceil(e.hp));
      const hpMax = Math.max(1, Math.ceil(e.maxHp));
      ctx.font = "9px serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "hsla(0, 0%, 0%, 0.75)";
      ctx.fillText(`${hpNow}/${hpMax}`, x + w + 4, y + 1);
      ctx.fillStyle = "hsl(36, 70%, 82%)";
      ctx.fillText(`${hpNow}/${hpMax}`, x + w + 3, y);
    }

    if (e.alertness > 0.05 && e.state !== "dead") {
      const ind = Math.min(1, e.alertness);
      ctx.save();
      ctx.translate(e.pos.x, e.pos.y - e.size - 12);
      const color = ind >= 1 ? "hsl(358, 80%, 55%)" : "hsl(42, 90%, 60%)";
      ctx.fillStyle = color;
      ctx.font = "bold 14px serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(ind >= 1 ? "!" : "?", 0, 0);
      ctx.restore();
    }

    if (e.stunTimer > 0) {
      ctx.save();
      ctx.translate(e.pos.x, e.pos.y - e.size - 6);
      ctx.fillStyle = "hsl(42, 95%, 70%)";
      ctx.font = "10px serif";
      ctx.textAlign = "center";
      ctx.fillText("✦ ✦ ✦", 0, 0);
      ctx.restore();
    }
  }

  drawParticle(p: Particle) {
    const ctx = this.ctx;
    const a = Math.max(0, p.life / p.maxLife);
    if (p.kind === "muzzle") {
      // Soft glowing disc — additive-feeling falloff.
      const grad = ctx.createRadialGradient(p.pos.x, p.pos.y, 0, p.pos.x, p.pos.y, p.size);
      grad.addColorStop(0, p.color.replace(")", ` / ${0.85 * a})`).replace("hsl(", "hsla("));
      grad.addColorStop(1, p.color.replace(")", " / 0)").replace("hsl(", "hsla("));
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.pos.x, p.pos.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      return;
    }
    if (p.kind === "poison") {
      // Bubble — soft green disc with a brighter core.
      ctx.save();
      ctx.globalAlpha = a * 0.85;
      const grad = ctx.createRadialGradient(p.pos.x, p.pos.y, 0, p.pos.x, p.pos.y, p.size * 1.4);
      grad.addColorStop(0, "hsla(95, 90%, 70%, 0.95)");
      grad.addColorStop(1, "hsla(95, 80%, 35%, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.pos.x, p.pos.y, p.size * 1.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.restore();
      return;
    }
    if (p.kind === "ink") {
      // Sumi-e ink streak — short tapered stroke.
      ctx.save();
      ctx.translate(p.pos.x, p.pos.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = a * 0.85;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size * 1.4, p.size * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.restore();
      return;
    }
    ctx.globalAlpha = a;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.pos.x, p.pos.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // Phase 6 — render rising combat text (Mon popups etc.).
  drawFloatTexts() {
    const ctx = this.ctx;
    for (const f of this.floatTexts) {
      const a = Math.max(0, Math.min(1, f.life / f.maxLife));
      ctx.save();
      ctx.globalAlpha = a;
      ctx.font = `${f.jp ? '700 ' : '600 '}${f.size}px ${f.jp ? '"Noto Serif JP", "Yu Mincho", serif' : '"Cormorant Garamond", serif'}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      // Soft dark stroke for legibility on bright bg
      ctx.lineWidth = 3;
      ctx.strokeStyle = "hsla(0, 0%, 0%, 0.75)";
      ctx.strokeText(f.text, f.pos.x, f.pos.y);
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, f.pos.x, f.pos.y);
      ctx.globalAlpha = 1;
      ctx.restore();
    }
  }

  // Render all class-driven entities: ally ghosts, projectiles, shockwaves,
  // decoys, clones. Drawn after the player so they layer on top.
  drawClassEntities() {
    const ctx = this.ctx;

    // Decoys — translucent shadow doubles of the player.
    for (const d of this.decoys) {
      const a = Math.min(1, d.life / 0.4);
      ctx.save();
      ctx.globalAlpha = 0.4 * a;
      ctx.translate(d.pos.x, d.pos.y);
      ctx.fillStyle = "hsla(0, 0%, 0%, 0.6)";
      ctx.beginPath();
      ctx.ellipse(0, BASE.PLAYER_RADIUS - 2, BASE.PLAYER_RADIUS, BASE.PLAYER_RADIUS * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "hsl(220, 30%, 25%)";
      ctx.beginPath();
      ctx.arc(0, 0, BASE.PLAYER_RADIUS, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Clones — like the player, with a faint blue ink tint.
    for (const c of this.clones) {
      ctx.save();
      ctx.globalAlpha = 0.85;
      ctx.translate(c.pos.x, c.pos.y);
      ctx.fillStyle = "hsla(0, 0%, 0%, 0.5)";
      ctx.beginPath();
      ctx.ellipse(0, BASE.PLAYER_RADIUS - 2, BASE.PLAYER_RADIUS, BASE.PLAYER_RADIUS * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.rotate(c.facing);
      ctx.fillStyle = c.hitFlash > 0 ? "hsl(358, 80%, 60%)" : "hsl(220, 40%, 18%)";
      ctx.beginPath();
      ctx.arc(0, 0, BASE.PLAYER_RADIUS, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "hsl(220, 60%, 60%)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, BASE.PLAYER_RADIUS - 1, -Math.PI / 4, Math.PI / 4);
      ctx.stroke();
      ctx.restore();
    }

    // Ally ghosts — wispy crimson/teal orbs trailing motion.
    for (const g of this.allyGhosts) {
      const a = Math.max(0, g.life / g.maxLife);
      ctx.save();
      ctx.globalAlpha = a * 0.85;
      ctx.translate(g.pos.x, g.pos.y);
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, g.size);
      const hue = g.curse ? "180" : "0";
      grad.addColorStop(0, `hsla(${hue}, 80%, 70%, 0.95)`);
      grad.addColorStop(1, `hsla(${hue}, 70%, 30%, 0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, g.size, 0, Math.PI * 2);
      ctx.fill();
      // Flicker eye
      ctx.fillStyle = `hsla(0, 0%, 100%, ${0.6 * a})`;
      ctx.beginPath();
      ctx.arc(0, 0, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Arashi arrows — slim ink-dark shafts with white fletch.
    for (const pr of this.projectiles) {
      const a = Math.max(0, pr.life / pr.maxLife);
      const ang = Math.atan2(pr.vel.y, pr.vel.x);
      ctx.save();
      ctx.globalAlpha = a;
      ctx.translate(pr.pos.x, pr.pos.y);
      ctx.rotate(ang);
      ctx.strokeStyle = "hsl(0, 0%, 8%)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-14, 0);
      ctx.lineTo(10, 0);
      ctx.stroke();
      ctx.fillStyle = "hsl(36, 80%, 92%)";
      ctx.beginPath();
      ctx.moveTo(-14, 0);
      ctx.lineTo(-18, -3);
      ctx.lineTo(-18, 3);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "hsl(0, 60%, 35%)";
      ctx.beginPath();
      ctx.moveTo(10, 0);
      ctx.lineTo(6, -3);
      ctx.lineTo(6, 3);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // Tetsubo shockwaves — concentric ink rings.
    for (const sw of this.shockwaves) {
      const a = Math.max(0, sw.life / 0.7);
      ctx.save();
      ctx.globalAlpha = a;
      ctx.translate(sw.pos.x, sw.pos.y);
      ctx.strokeStyle = "hsl(30, 70%, 55%)";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(0, 0, sw.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = "hsla(0, 0%, 0%, 0.6)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, sw.radius * 0.92, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // ===== Phase C VFX =====
    // Spirit orbs (Onmyoji)
    for (const orb of this.spiritOrbs) {
      const a = Math.min(1, orb.life / 1) * 0.7;
      ctx.save();
      ctx.globalAlpha = a;
      const grad = ctx.createRadialGradient(orb.pos.x, orb.pos.y, 4, orb.pos.x, orb.pos.y, 90);
      grad.addColorStop(0, "hsla(280, 80%, 80%, 0.9)");
      grad.addColorStop(1, "hsla(280, 80%, 40%, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(orb.pos.x, orb.pos.y, 90, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    // Hatamoto banner
    if (this.ultBannerActive) {
      ctx.save();
      ctx.translate(this.ultBannerPos.x, this.ultBannerPos.y);
      ctx.fillStyle = "hsl(45, 90%, 55%)";
      ctx.fillRect(-3, -50, 6, 50);
      ctx.fillStyle = "hsl(45, 95%, 65%)";
      ctx.fillRect(-22, -50, 44, 28);
      ctx.fillStyle = "hsl(0, 0%, 10%)";
      ctx.font = "bold 22px serif";
      ctx.textAlign = "center";
      ctx.fillText("令", 0, -28);
      // Aura ring
      ctx.globalAlpha = 0.18;
      ctx.fillStyle = "hsl(45, 95%, 60%)";
      ctx.beginPath(); ctx.arc(0, 0, 260, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    // Phantom afterimages (Kunoichi)
    for (const img of this.ultPhantomImages) {
      ctx.save();
      ctx.globalAlpha = 0.55;
      ctx.fillStyle = "hsl(320, 70%, 65%)";
      ctx.beginPath(); ctx.arc(img.pos.x, img.pos.y, BASE.PLAYER_RADIUS, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    // Death Web (Tsuchigumo) — full-arena overlay
    if (this.ultDeathWebTimer > 0) {
      ctx.save();
      ctx.globalAlpha = 0.18 + 0.1 * Math.sin(this.ultDeathWebTimer * 6);
      ctx.strokeStyle = "hsl(260, 40%, 70%)";
      ctx.lineWidth = 1;
      const step = 80;
      for (let x = 0; x < this.worldW; x += step) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, this.worldH); ctx.stroke();
      }
      for (let y = 0; y < this.worldH; y += step) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(this.worldW, y); ctx.stroke();
      }
      ctx.restore();
    }
    // Divine beam (Miko) — bright expanding circle
    if (this.ultDivineBeamTimer > 0) {
      ctx.save();
      const r = this.ultDivineBeamRadius;
      const grad = ctx.createRadialGradient(this.player.pos.x, this.player.pos.y, 0,
                                             this.player.pos.x, this.player.pos.y, Math.max(1, r));
      grad.addColorStop(0, "hsla(60, 100%, 90%, 0.85)");
      grad.addColorStop(0.7, "hsla(180, 80%, 75%, 0.4)");
      grad.addColorStop(1, "hsla(180, 80%, 75%, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(this.player.pos.x, this.player.pos.y, Math.max(1, r), 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    // Spirit Tempest vortex (Onmyoji)
    if (this.ultSpiritTempestTimer > 0) {
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.strokeStyle = "hsl(280, 80%, 70%)";
      ctx.lineWidth = 4;
      const t = (5 - this.ultSpiritTempestTimer) * 4;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        for (let a = 0; a < Math.PI * 2; a += 0.1) {
          const r = 60 + (a + t + i * 2) * 22;
          if (r > 280) continue;
          const x = this.player.pos.x + Math.cos(a + t) * r;
          const y = this.player.pos.y + Math.sin(a + t) * r;
          if (a === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.restore();
    }
    // Kagebushi shadow clone
    if (this.shadowClone) {
      ctx.save();
      ctx.globalAlpha = 0.55;
      ctx.fillStyle = "hsl(250, 30%, 12%)";
      ctx.beginPath(); ctx.arc(this.shadowClone.pos.x, this.shadowClone.pos.y, BASE.PLAYER_RADIUS, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    // Shadow Consume aura
    if (this.ultShadowConsumeTimer > 0) {
      ctx.save();
      ctx.globalAlpha = 0.4;
      const grad = ctx.createRadialGradient(this.player.pos.x, this.player.pos.y, 5,
                                             this.player.pos.x, this.player.pos.y, 70);
      grad.addColorStop(0, "hsla(250, 60%, 30%, 0.8)");
      grad.addColorStop(1, "hsla(250, 60%, 10%, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(this.player.pos.x, this.player.pos.y, 70, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }

    ctx.globalAlpha = 1;
  }

  // ============ CLASS PASSIVES (per-frame) ============
  updateClassPassives(dt: number) {
    for (const e of this.enemies) {
      if (e.state === "dead") continue;
      if (e.poisonRemaining > 0) {
        e.poisonRemaining = Math.max(0, e.poisonRemaining - dt);
        // Phase 3 — poison ramps with remaining duration. Longer = nastier.
        const ramp = 1 + Math.min(2, Math.max(0, this.perks.poisonRamp) * e.poisonRemaining);
        const dps = this.perks.poisonDps * this.perks.poisonDmgMul * ramp;
        e.poisonTickAccum += dps * dt;
        if (e.poisonTickAccum >= 1) {
          const tick = Math.floor(e.poisonTickAccum);
          e.poisonTickAccum -= tick;
          e.hp -= tick;
          this.spawnFloatText(e.pos, `${tick}`, {
            color: "hsl(95 80% 60%)",
            size: 11,
          });
          e.hitFlash = Math.max(e.hitFlash, 0.5);
          if (e.hp <= 0) this.killEnemy(e, "ghost");
        }
        // Rising bubble particles — ~6/sec while poisoned.
        if (Math.random() < dt * 6) {
          const r = e.size * (0.3 + Math.random() * 0.7);
          const a = Math.random() * Math.PI * 2;
          this.particles.push({
            pos: { x: e.pos.x + Math.cos(a) * r, y: e.pos.y + Math.sin(a) * r },
            vel: { x: (Math.random() - 0.5) * 12, y: -18 - Math.random() * 14 },
            life: 0.6 + Math.random() * 0.3,
            maxLife: 0.9,
            color: `hsl(${90 + Math.random() * 20}, 75%, ${45 + Math.random() * 15}%)`,
            size: 1.2 + Math.random() * 1.6,
            kind: "poison",
            rot: 0, rotVel: 0,
          });
        }
      }
      if (e.bleedRemaining > 0) {
        e.bleedRemaining = Math.max(0, e.bleedRemaining - dt);
        e.bleedTickAccum += 3 * this.perks.bleedDmgMul * dt;
        if (e.bleedTickAccum >= 1) {
          const tick = Math.floor(e.bleedTickAccum);
          e.bleedTickAccum -= tick;
          e.hp -= tick;
          this.spawnFloatText(e.pos, `${tick}`, { color: "hsl(0 95% 55%)", size: 11 });
          if (e.hp <= 0) { this.killEnemy(e, "ghost"); continue; }
        }
      }
      if (e.curseRemaining > 0) e.curseRemaining = Math.max(0, e.curseRemaining - dt);
      if (e.slowRemaining > 0) e.slowRemaining = Math.max(0, e.slowRemaining - dt);
      // ===== Phase B — Flame Spear burn DoT (separate from poison) =====
      if (e.burnRemaining > 0) {
        e.burnRemaining = Math.max(0, e.burnRemaining - dt);
        e.burnTickAccum += e.burnDps * this.perks.fireDmgMul * dt;
        if (e.burnTickAccum >= 1) {
          const tick = Math.floor(e.burnTickAccum);
          e.burnTickAccum -= tick;
          e.hp -= tick;
          this.spawnFloatText(e.pos, `${tick}`, {
            color: "hsl(20 95% 60%)",
            size: 11,
          });
          e.hitFlash = Math.max(e.hitFlash, 0.4);
          if (e.hp <= 0) {
            // Phase 3 — Fire spread: igniting fire passes to nearby foes.
            if (this.perks.fireSpreadRadius > 0) {
              for (const o of this.enemies) {
                if (o.id === e.id || o.state === "dead") continue;
                const d = Math.hypot(o.pos.x - e.pos.x, o.pos.y - e.pos.y);
                if (d <= this.perks.fireSpreadRadius && o.burnRemaining < 3) {
                  o.burnRemaining = Math.max(o.burnRemaining, 4);
                  o.burnDps = Math.max(o.burnDps, e.burnDps || 4);
                }
              }
            }
            this.killEnemy(e, "ghost");
            continue;
          }
        }
        // Ember particle drizzle
        if (Math.random() < dt * 7) {
          const r = e.size * (0.2 + Math.random() * 0.7);
          const a = Math.random() * Math.PI * 2;
          this.particles.push({
            pos: { x: e.pos.x + Math.cos(a) * r, y: e.pos.y + Math.sin(a) * r },
            vel: { x: (Math.random() - 0.5) * 18, y: -22 - Math.random() * 18 },
            life: 0.4 + Math.random() * 0.3,
            maxLife: 0.7,
            color: `hsl(${15 + Math.random() * 25}, 90%, ${55 + Math.random() * 20}%)`,
            size: 1.4 + Math.random() * 1.6,
            kind: "ember",
            rot: 0, rotVel: 0,
          });
        }
      }
      // Jutte disarm timer
      if (e.disarmedRemaining > 0) e.disarmedRemaining = Math.max(0, e.disarmedRemaining - dt);
      // Tsuchigumo web timer
      if (e.webbedRemaining > 0) e.webbedRemaining = Math.max(0, e.webbedRemaining - dt);
    }
    if (this.ultBloodRageTimer > 0) this.ultBloodRageTimer = Math.max(0, this.ultBloodRageTimer - dt);
    if (this.ultShadowStepTimer > 0) this.ultShadowStepTimer = Math.max(0, this.ultShadowStepTimer - dt);
    if (this.ultMountainTimer > 0) this.ultMountainTimer = Math.max(0, this.ultMountainTimer - dt);
    if (this.ultThousandCutsTimer > 0) {
      this.ultThousandCutsTimer = Math.max(0, this.ultThousandCutsTimer - dt);
      // Onna spinning AoE: tick damage every 0.1s in radius 120
      this.ultThousandTickAccum += dt;
      if (this.ultThousandTickAccum >= 0.1) {
        this.ultThousandTickAccum = 0;
        for (const e of this.enemies) {
          if (e.state === "dead") continue;
          const dx = e.pos.x - this.player.pos.x;
          const dy = e.pos.y - this.player.pos.y;
          if (Math.hypot(dx, dy) <= 120 + e.size) {
            this.dealDamage(e, 2, Math.atan2(dy, dx), 30);
          }
        }
      }
    }
    if (this.standoffTimer > 0) this.standoffTimer = Math.max(0, this.standoffTimer - dt);
    if (this.screenFlashTimer > 0) this.screenFlashTimer = Math.max(0, this.screenFlashTimer - dt);
    if (this.desaturate > 0 && this.standoffTimer <= 0) this.desaturate = Math.max(0, this.desaturate - dt * 2);
    // Iai Chain (Samurai ult) — step the blink-slash chain forward.
    this.updateIaiChain(dt);
    // Standoff ring shrink — visual feedback for HUD
    if (this.stats.ultPhase === "standoff_aim") {
      this.stats.standoffRingT = this.standoffTimer / 1.6;
      // Auto-miss if window expires
      if (this.standoffTimer <= 0) this.resolveStandoff();
    }
    if (this.stats.ultActive &&
        this.ultBloodRageTimer <= 0 &&
        this.ultShadowStepTimer <= 0 &&
        this.ultMountainTimer <= 0 &&
        this.ultThousandCutsTimer <= 0 &&
        this.standoffTimer <= 0 &&
        this.iaiChainRemaining <= 0 &&
        this.stats.ultPhase === "" &&
        this.ultSpiritTempestTimer <= 0 &&
        !this.ultBannerActive &&
        this.ultPhantomTimer <= 0 &&
        this.ultEarthshakerTimer <= 0 &&
        this.ultDeathWebTimer <= 0 &&
        this.ultDivineBeamTimer <= 0 &&
        this.ultShadowConsumeTimer <= 0) {
      this.stats.ultActive = false;
    }

    // ===== Phase C — passives & ult per-frame logic =====
    this.updatePhaseCPassives(dt);
    this.updatePhaseCUltimates(dt);
  }

  // ============ PHASE C — class passives (per-frame) ============
  updatePhaseCPassives(dt: number) {
    const cid = this.stats.classId;
    const p = this.player;

    // Hatamoto golden shield ICD
    if (cid === "hatamoto" && !this.hatamotoShieldReady) {
      this.hatamotoShieldCd = Math.max(0, this.hatamotoShieldCd - dt);
      if (this.hatamotoShieldCd <= 0) {
        this.hatamotoShieldReady = true;
        this.flash("Shield Ready");
      }
    }

    // Miko divine barrier — refresh every 20s
    if (cid === "miko" && !this.mikoBarrierReady) {
      this.mikoBarrierTimer += dt;
      if (this.mikoBarrierTimer >= 20) {
        this.mikoBarrierTimer = 0;
        this.mikoBarrierReady = true;
      }
    }

    // Kagebushi shadow clone — record a delayed-position trail and mimic
    // a swing 0.5s after the player attacks (deals 40% damage).
    if (cid === "kagebushi" && this.shadowClone) {
      this.shadowCloneTrail.push({ x: p.pos.x, y: p.pos.y, facing: p.facing, t: 0 });
      for (const tr of this.shadowCloneTrail) tr.t += dt;
      this.shadowCloneTrail = this.shadowCloneTrail.filter(tr => tr.t <= 1.5);
      const target = this.shadowCloneTrail.find(tr => tr.t >= 0.5) ?? this.shadowCloneTrail[0];
      if (target) {
        this.shadowClone.pos.x = target.x;
        this.shadowClone.pos.y = target.y;
        this.shadowClone.facing = target.facing;
      }
      if (p.attackAnim > 0.85 && this.shadowClone.attackTimer <= 0) {
        this.shadowClone.attackTimer = 0.5;
      }
      const prevTimer = this.shadowClone.attackTimer;
      this.shadowClone.attackTimer = Math.max(0, this.shadowClone.attackTimer - dt);
      // Trigger when timer crosses zero this frame
      if (prevTimer > 0 && this.shadowClone.attackTimer <= 0) {
        const cx = this.shadowClone.pos.x;
        const cy = this.shadowClone.pos.y;
        const ang = this.shadowClone.facing;
        const range = BASE.ATTACK_RANGE * this.perks.attackRangeMul;
        for (const e of this.enemies) {
          if (e.state === "dead") continue;
          const dx = e.pos.x - cx;
          const dy = e.pos.y - cy;
          const d = Math.hypot(dx, dy);
          if (d > range + e.size) continue;
          const ea = Math.atan2(dy, dx);
          let diff = ea - ang;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          if (Math.abs(diff) > Math.PI * 0.6) continue;
          this.dealDamage(e, this.perks.damage * 0.4, ea, 30);
        }
      }
    }

    // Onmyoji: spawn a spirit orb whenever an ability is cast (CD goes 0 → >0).
    if (cid === "onmyoji") {
      for (const id of this.stats.equippedAbilities) {
        const cur = this.stats.abilityCd[id] ?? 0;
        const prev = this.prevAbilityCd[id] ?? 0;
        if (prev <= 0.001 && cur > 0.5) {
          this.spiritOrbs.push({
            pos: { x: p.pos.x, y: p.pos.y },
            life: 5, maxLife: 5,
            hitSet: new Set(), tickAccum: 0,
          });
        }
        this.prevAbilityCd[id] = cur;
      }
    }
    if (this.spiritOrbs.length) {
      for (const orb of this.spiritOrbs) {
        orb.life -= dt;
        orb.tickAccum += dt;
        if (orb.tickAccum >= 0.25) {
          orb.tickAccum = 0;
          for (const e of this.enemies) {
            if (e.state === "dead") continue;
            const d = Math.hypot(e.pos.x - orb.pos.x, e.pos.y - orb.pos.y);
            if (d <= 90 + e.size) {
              this.dealDamage(e, 3, Math.atan2(e.pos.y - orb.pos.y, e.pos.x - orb.pos.x), 20);
            }
          }
        }
      }
      this.spiritOrbs = this.spiritOrbs.filter(o => o.life > 0);
    }
  }

  // ============ PHASE C — ultimate per-frame ticks ============
  updatePhaseCUltimates(dt: number) {
    // Onmyoji: Spirit Tempest (5s)
    if (this.ultSpiritTempestTimer > 0) {
      this.ultSpiritTempestTimer = Math.max(0, this.ultSpiritTempestTimer - dt);
      this.ultSpiritTempestTick += dt;
      const cx = this.player.pos.x;
      const cy = this.player.pos.y;
      const R = 280;
      for (const e of this.enemies) {
        if (e.state === "dead" || e.isBoss) continue;
        const dx = cx - e.pos.x;
        const dy = cy - e.pos.y;
        const d = Math.hypot(dx, dy);
        if (d <= R && d > 30) {
          const pull = 240 * dt;
          e.pos.x += (dx / d) * pull;
          e.pos.y += (dy / d) * pull;
        }
      }
      if (this.ultSpiritTempestTick >= 0.2) {
        this.ultSpiritTempestTick = 0;
        for (const e of this.enemies) {
          if (e.state === "dead") continue;
          const d = Math.hypot(e.pos.x - cx, e.pos.y - cy);
          if (d <= R) {
            const before = e.hp;
            this.dealDamage(e, 4, Math.atan2(e.pos.y - cy, e.pos.x - cx), 0);
            if (before > 0 && e.hp <= 0) {
              for (const o of this.enemies) {
                if (o === e || o.state === "dead") continue;
                if (Math.hypot(o.pos.x - e.pos.x, o.pos.y - e.pos.y) <= 110) {
                  this.dealDamage(o, 8, Math.atan2(o.pos.y - e.pos.y, o.pos.x - e.pos.x), 60);
                }
              }
            }
          }
        }
      }
    }

    // Hatamoto: Shogun's Decree banner
    if (this.ultBannerActive) {
      this.ultBannerTimer = Math.max(0, this.ultBannerTimer - dt);
      for (const e of this.enemies) {
        if (e.state === "dead") continue;
        if (Math.hypot(e.pos.x - this.ultBannerPos.x, e.pos.y - this.ultBannerPos.y) <= 260) {
          e.slowRemaining = Math.max(e.slowRemaining, 0.4);
        }
      }
      if (this.ultBannerTimer <= 0) this.ultBannerActive = false;
    }

    // Kunoichi: Phantom Dance
    if (this.ultPhantomTimer > 0) {
      this.ultPhantomTimer = Math.max(0, this.ultPhantomTimer - dt);
      for (const img of this.ultPhantomImages) {
        img.pos.x += img.vel.x * dt;
        img.pos.y += img.vel.y * dt;
        if (img.pos.x < 30 || img.pos.x > this.worldW - 30) img.vel.x *= -1;
        if (img.pos.y < 30 || img.pos.y > this.worldH - 30) img.vel.y *= -1;
        img.tickAccum += dt;
        if (img.tickAccum >= 0.18) {
          img.tickAccum = 0;
          for (const e of this.enemies) {
            if (e.state === "dead") continue;
            if (Math.hypot(e.pos.x - img.pos.x, e.pos.y - img.pos.y) <= 60 + e.size) {
              this.dealDamage(e, this.perks.damage, Math.atan2(e.pos.y - img.pos.y, e.pos.x - img.pos.x), 40);
            }
          }
        }
      }
      if (this.ultPhantomTimer <= 0) {
        this.ultPhantomImages = [];
        this.player.invuln = Math.max(this.player.invuln, 2);
        this.flash("Reformed");
      }
    }

    // Sumo: Earthshaker Charge
    if (this.ultEarthshakerTimer > 0) {
      this.ultEarthshakerTimer = Math.max(0, this.ultEarthshakerTimer - dt);
      const sp = 720;
      this.player.pos.x += Math.cos(this.ultEarthshakerDir) * sp * dt;
      this.player.pos.y += Math.sin(this.ultEarthshakerDir) * sp * dt;
      this.player.invuln = Math.max(this.player.invuln, 0.2);
      for (const e of this.enemies) {
        if (e.state === "dead") continue;
        if (Math.hypot(e.pos.x - this.player.pos.x, e.pos.y - this.player.pos.y) <= 70 + e.size) {
          this.dealDamage(e, 14, this.ultEarthshakerDir, 480 * this.perks.knockbackMul);
          if (e.hp > 0 && !e.isBoss) {
            e.launched = true;
            e.launchTimer = 0.9;
            e.launchHeight = 0;
            e.launchDamage = 6;
          }
        }
      }
      const atWall = this.player.pos.x <= 25 || this.player.pos.x >= this.worldW - 25 ||
                     this.player.pos.y <= 25 || this.player.pos.y >= this.worldH - 25;
      if (atWall || this.ultEarthshakerTimer <= 0) {
        this.ultEarthshakerTimer = 0;
        this.shockwaves.push({
          pos: { x: this.player.pos.x, y: this.player.pos.y },
          radius: 0, maxRadius: 520, life: 0.8, damage: 16, hitSet: new Set(),
        });
        this.cameraShake = Math.max(this.cameraShake, 1.0);
        this.screenFlashColor = "hsla(20, 60%, 55%, 0.4)";
        this.screenFlashTimer = 0.4;
      }
    }

    // Tsuchigumo: Death Web (arena-wide)
    if (this.ultDeathWebTimer > 0) {
      this.ultDeathWebTimer = Math.max(0, this.ultDeathWebTimer - dt);
      this.ultDeathWebTick += dt;
      if (this.ultDeathWebTick >= 0.4) {
        this.ultDeathWebTick = 0;
        for (const e of this.enemies) {
          if (e.state === "dead") continue;
          if (e.isBoss || e.archetype === "final") {
            e.slowRemaining = Math.max(e.slowRemaining, 0.6);
            this.dealDamage(e, 2, 0, 0);
          } else {
            e.webbedRemaining = Math.max(e.webbedRemaining, 0.6);
            e.stunTimer = Math.max(e.stunTimer, 0.5);
            const before = e.hp;
            this.dealDamage(e, 3, 0, 0);
            if (before > 0 && e.hp <= 0) {
              for (const o of this.enemies) {
                if (o === e || o.state === "dead") continue;
                if (Math.hypot(o.pos.x - e.pos.x, o.pos.y - e.pos.y) <= 130) {
                  o.poisonRemaining = Math.min(8, o.poisonRemaining + 4);
                }
              }
            }
          }
        }
      }
    }

    // Miko: Divine Judgement (expanding beam)
    if (this.ultDivineBeamTimer > 0) {
      this.ultDivineBeamTimer = Math.max(0, this.ultDivineBeamTimer - dt);
      this.ultDivineBeamRadius = (1 - this.ultDivineBeamTimer / 3) * 360;
      this.ultDivineBeamTick += dt;
      if (this.ultDivineBeamTick >= 0.15) {
        this.ultDivineBeamTick = 0;
        for (const e of this.enemies) {
          if (e.state === "dead") continue;
          const d = Math.hypot(e.pos.x - this.player.pos.x, e.pos.y - this.player.pos.y);
          if (d <= this.ultDivineBeamRadius) {
            this.dealDamage(e, 4, 0, 0);
            e.disarmedRemaining = Math.max(e.disarmedRemaining, 5);
            if (!this.ultDivineBeamHit.has(e.id)) {
              this.ultDivineBeamHit.add(e.id);
              this.player.hp = Math.min(this.player.maxHp, this.player.hp + 5);
            }
          }
        }
      }
      if (this.ultDivineBeamTimer <= 0) {
        this.ultDivineBeamHit.clear();
        this.ultDivineBeamRadius = 0;
      }
    }

    // Kagebushi: Shadow Consume — explode on end
    if (this.ultShadowConsumeTimer > 0) {
      const prev = this.ultShadowConsumeTimer;
      this.ultShadowConsumeTimer = Math.max(0, this.ultShadowConsumeTimer - dt);
      if (prev > 0 && this.ultShadowConsumeTimer <= 0) {
        for (const e of this.enemies) {
          if (e.state === "dead") continue;
          const d = Math.hypot(e.pos.x - this.player.pos.x, e.pos.y - this.player.pos.y);
          if (d <= 240) {
            this.dealDamage(e, 18, Math.atan2(e.pos.y - this.player.pos.y, e.pos.x - this.player.pos.x), 280);
          }
        }
        this.cameraShake = Math.max(this.cameraShake, 0.7);
        this.screenFlashColor = "hsla(250, 50%, 30%, 0.5)";
        this.screenFlashTimer = 0.4;
      }
    }
  }

  // ============ CLASS-DRIVEN ENTITIES (per-frame) ============
  // Updates ally ghosts, projectiles, shockwaves, decoys, clones, plus the
  // ongoing Ronin Crimson Debt strike sequence and Kagemusha decoy spawner.
  updateClassEntities(dt: number) {
    // Ally ghosts (Dokkaebi passive proc + ult): travel, pierce, curse.
    for (const g of this.allyGhosts) {
      g.life -= dt;
      g.pos.x += g.vel.x * dt;
      g.pos.y += g.vel.y * dt;
      for (const e of this.enemies) {
        if (e.state === "dead" || g.hitSet.has(e.id)) continue;
        if (Math.hypot(e.pos.x - g.pos.x, e.pos.y - g.pos.y) <= e.size + g.size) {
          g.hitSet.add(e.id);
          this.dealDamage(e, g.damage, Math.atan2(e.pos.y - g.pos.y, e.pos.x - g.pos.x), 30);
          if (g.curse) e.curseRemaining = Math.max(e.curseRemaining, 6);
        }
      }
    }
    this.allyGhosts = this.allyGhosts.filter(g => g.life > 0);

    // Arashi arrows — pierce, slow.
    for (const pr of this.projectiles) {
      pr.life -= dt;
      pr.pos.x += pr.vel.x * dt;
      pr.pos.y += pr.vel.y * dt;
      for (const e of this.enemies) {
        if (e.state === "dead" || pr.hitSet.has(e.id)) continue;
        if (Math.hypot(e.pos.x - pr.pos.x, e.pos.y - pr.pos.y) <= e.size + 8) {
          pr.hitSet.add(e.id);
          this.dealDamage(e, pr.damage, Math.atan2(pr.vel.y, pr.vel.x), 20);
          if (pr.slow) e.slowRemaining = Math.max(e.slowRemaining, 3);
        }
      }
    }
    this.projectiles = this.projectiles.filter(p => p.life > 0);

    // Tetsubo shockwaves — expanding rings that launch enemies.
    for (const sw of this.shockwaves) {
      sw.life -= dt;
      sw.radius = (1 - sw.life / 0.7) * sw.maxRadius;
      for (const e of this.enemies) {
        if (e.state === "dead" || sw.hitSet.has(e.id)) continue;
        // Never damage the enemy that spawned this shockwave (e.g. boss slam).
        if (sw.ownerEnemyId !== undefined && sw.ownerEnemyId === e.id) continue;
        const d = Math.hypot(e.pos.x - sw.pos.x, e.pos.y - sw.pos.y);
        if (d <= sw.radius && d >= sw.radius - 60) {
          sw.hitSet.add(e.id);
          const ang = Math.atan2(e.pos.y - sw.pos.y, e.pos.x - sw.pos.x);
          this.dealDamage(e, sw.damage, ang, 200 * this.perks.knockbackMul);
          if (e.hp > 0) {
            e.launched = true;
            e.launchTimer = 0.9;
            e.launchHeight = 0;
            e.launchDamage = 8;
          }
        }
      }
      // Enemy-spawned shockwaves (boss ground slam) must also damage the
      // player. Use a sentinel id (-1) so each shockwave only hits once.
      if (sw.ownerEnemyId !== undefined && !sw.hitSet.has(-1)) {
        const dp = Math.hypot(this.player.pos.x - sw.pos.x, this.player.pos.y - sw.pos.y);
        if (dp <= sw.radius && dp >= sw.radius - 60) {
          sw.hitSet.add(-1);
          // Find the originating enemy (may have died) to route through applyEnemyHit.
          const owner = this.enemies.find(en => en.id === sw.ownerEnemyId);
          if (owner) {
            this.applyEnemyHit(owner, sw.damage);
          } else if (this.player.invuln <= 0) {
            this.player.hp -= sw.damage;
            this.spawnFloatText(this.player.pos, `-${Math.max(1, Math.round(sw.damage))}`, {
              color: "hsl(358 90% 65%)",
              size: 15,
            });
            this.player.invuln = 0.6 + this.perks.invulnBonus;
            this.player.hitFlash = 1;
            this.cameraShake = Math.max(this.cameraShake, 0.5);
            audio.play("hit");
          }
        }
      }
    }
    this.shockwaves = this.shockwaves.filter(s => s.life > 0);

    // Launched enemies — rise then fall, take landing damage, can collide.
    for (const e of this.enemies) {
      if (!e.launched) continue;
      e.launchTimer -= dt;
      const t = 1 - e.launchTimer / 0.9; // 0→1
      e.launchHeight = Math.sin(t * Math.PI) * 70;
      // Mid-air collisions with other launched enemies
      for (const o of this.enemies) {
        if (o === e || !o.launched || o.state === "dead") continue;
        if (Math.hypot(o.pos.x - e.pos.x, o.pos.y - e.pos.y) < e.size + o.size) {
          this.dealDamage(o, 4, 0, 0);
        }
      }
      if (e.launchTimer <= 0) {
        e.launched = false;
        e.launchHeight = 0;
        if (e.hp > 0 && e.launchDamage > 0) {
          this.dealDamage(e, e.launchDamage, 0, 0);
          e.launchDamage = 0;
        }
      }
    }

    // Decoys (Kagemusha passive) — pull aggro briefly.
    if (this.perks.decoyInterval > 0 && this.stats.state === "playing") {
      this.decoyTimer -= dt;
      if (this.decoyTimer <= 0) {
        this.decoyTimer = this.perks.decoyInterval;
        const a = Math.random() * Math.PI * 2;
        this.decoys.push({
          pos: { x: this.player.pos.x + Math.cos(a) * 80, y: this.player.pos.y + Math.sin(a) * 80 },
          life: 3, maxLife: 3,
        });
      }
    }
    for (const d of this.decoys) d.life -= dt;
    this.decoys = this.decoys.filter(d => d.life > 0);

    // Kagemusha clones (ult) — mirror player, draw aggro, attack nearest enemy.
    for (const c of this.clones) {
      c.life -= dt;
      c.hitFlash = Math.max(0, c.hitFlash - dt * 4);
      // Drift toward player (mirroring with offset)
      const dxp = this.player.pos.x - c.pos.x;
      const dyp = this.player.pos.y - c.pos.y;
      const dp = Math.hypot(dxp, dyp);
      if (dp > 60) {
        c.pos.x += (dxp / dp) * 180 * dt;
        c.pos.y += (dyp / dp) * 180 * dt;
      }
      // Find nearest enemy and attack
      let nearest: Enemy | null = null;
      let nd = Infinity;
      for (const e of this.enemies) {
        if (e.state === "dead") continue;
        const d = Math.hypot(e.pos.x - c.pos.x, e.pos.y - c.pos.y);
        if (d < nd) { nd = d; nearest = e; }
      }
      c.attackTimer -= dt;
      if (nearest && nd < 90 && c.attackTimer <= 0) {
        c.attackTimer = 0.7;
        c.facing = Math.atan2(nearest.pos.y - c.pos.y, nearest.pos.x - c.pos.x);
        this.dealDamage(nearest, this.perks.damage * 0.6, c.facing, 40);
      }
    }
    // Explode any clones whose life ran out (or were "destroyed")
    for (const c of this.clones) {
      if (c.life <= 0) {
        for (const e of this.enemies) {
          if (e.state === "dead") continue;
          const d = Math.hypot(e.pos.x - c.pos.x, e.pos.y - c.pos.y);
          if (d < 120) {
            this.dealDamage(e, 12, Math.atan2(e.pos.y - c.pos.y, e.pos.x - c.pos.x), 80);
          }
        }
        this.spawnSpark(c.pos);
      }
    }
    this.clones = this.clones.filter(c => c.life > 0);

    // Ronin Crimson Debt — auto-strike all enemies on screen 5 times.
    if (this.ultRoninRemaining > 0) {
      this.ultRoninTimer -= dt;
      if (this.ultRoninTimer <= 0) {
        this.ultRoninTimer = 0.18;
        this.ultRoninRemaining--;
        for (const e of this.enemies) {
          if (e.state === "dead") continue;
          const dx = e.pos.x - this.player.pos.x;
          const dy = e.pos.y - this.player.pos.y;
          if (Math.hypot(dx, dy) > 700) continue;
          this.dealDamage(e, 8 * this.ultRoninMul, Math.atan2(dy, dx), 40);
        }
        this.spawnBlood(this.player.pos, Math.random() * Math.PI * 2, 6);
        this.cameraShake = Math.max(this.cameraShake, 0.3);
        if (this.ultRoninRemaining === 0) this.ultRoninMul = 1;
      }
    }
  }

  spawnAllyGhost(x: number, y: number, curse: boolean) {
    const a = Math.random() * Math.PI * 2;
    this.allyGhosts.push({
      pos: { x, y },
      vel: { x: Math.cos(a) * 220, y: Math.sin(a) * 220 },
      life: 1.2, maxLife: 1.2,
      damage: 3,
      hitSet: new Set(),
      curse,
      size: 12,
    });
  }

  // ============ ULTIMATES ============
  triggerUltimate() {
    // (Old "press R again" Standoff resolution removed — the Samurai ult
    // is now an automatic chain teleport. See castIaiChain().)
    if (!this.stats.ultReady || this.stats.ultActive) return;
    this.stats.ultCharge = 0;
    this.stats.ultReady = false;
    this.stats.ultActive = true;
    this.cameraShake = Math.max(this.cameraShake, 0.5);
    // Phase 1 — quick zoom punch on ultimate activation: in 5% over 150ms,
    // then settle back over 300ms.
    this.cameraZoom.setTarget(1.05, 13);
    setTimeout(() => this.cameraZoom.setTarget(1, 6), 150);
    audio.play("levelUp");
    this.flash(`${this.stats.ultName}!`);

    switch (this.stats.classId) {
      case "berserker": {
        const ratio = this.player.hp / Math.max(1, this.player.maxHp);
        this.ultBloodRageTimer = 5 + Math.max(0, (1 - ratio - 0.2)) * 5;
        this.player.invuln = Math.max(this.player.invuln, this.ultBloodRageTimer);
        break;
      }
      case "shinobi":
        this.ultShadowStepTimer = 4;
        this.player.invuln = Math.max(this.player.invuln, 4);
        break;
      case "yamabushi":
        this.ultMountainTimer = 3;
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + 30);
        this.player.invuln = Math.max(this.player.invuln, 3);
        break;
      case "onna":
        this.ultThousandCutsTimer = 3;
        this.ultThousandTickAccum = 0;
        break;
      case "samurai":
        this.castIaiChain();
        break;
      case "kensei": {
        // Iaijutsu Strike — freeze time, dash forward, bleed everything in path.
        this.timeSlowRemaining = Math.max(this.timeSlowRemaining, 1.5);
        const ang = this.player.facing;
        const dashDist = 360;
        const startX = this.player.pos.x;
        const startY = this.player.pos.y;
        const endX = startX + Math.cos(ang) * dashDist;
        const endY = startY + Math.sin(ang) * dashDist;
        // Damage anything roughly in the line corridor (width 70)
        for (const e of this.enemies) {
          if (e.state === "dead") continue;
          const dx = e.pos.x - startX;
          const dy = e.pos.y - startY;
          const proj = dx * Math.cos(ang) + dy * Math.sin(ang);
          if (proj < 0 || proj > dashDist) continue;
          const perp = Math.abs(-dx * Math.sin(ang) + dy * Math.cos(ang));
          if (perp > 70 + e.size) continue;
          this.dealDamage(e, 24, ang, 80);
          e.bleedRemaining = Math.max(e.bleedRemaining, 4);
        }
        // Visual flash trail along the dash
        for (let i = 0; i < 12; i++) {
          const t = i / 11;
          this.flashTrail.push({
            x: startX + (endX - startX) * t,
            y: startY + (endY - startY) * t,
            ang,
            life: 1,
          });
        }
        this.player.pos.x = endX;
        this.player.pos.y = endY;
        this.player.invuln = Math.max(this.player.invuln, 1.5);
        this.screenFlashColor = "hsla(36, 90%, 92%, 0.7)";
        this.screenFlashTimer = 0.35;
        break;
      }
      case "ronin": {
        // Crimson Debt — sacrifice 20% of MAX HP (flat cost regardless of current
        // HP), strike all enemies 5 times. Lower current HP = more damage.
        const cost = Math.floor(this.player.maxHp * 0.20);
        this.player.hp = Math.max(1, this.player.hp - cost);
        this.player.hitFlash = 1;
        const ratio = this.player.hp / Math.max(1, this.player.maxHp);
        this.ultRoninMul = 1 + (1 - ratio) * 1.5;          // up to ~2.5x at low HP
        this.ultRoninRemaining = 5;
        this.ultRoninTimer = 0;
        this.player.invuln = Math.max(this.player.invuln, 1.6);
        break;
      }
      case "dokkaebi": {
        // Cursed Horde — 5 ghost projectiles fan out, curse on hit.
        for (let i = 0; i < 5; i++) {
          const a = Math.random() * Math.PI * 2;
          this.allyGhosts.push({
            pos: { x: this.player.pos.x, y: this.player.pos.y },
            vel: { x: Math.cos(a) * 360, y: Math.sin(a) * 360 },
            life: 1.6, maxLife: 1.6,
            damage: 10,
            hitSet: new Set(),
            curse: true,
            size: 18,
          });
        }
        this.screenFlashColor = "hsla(180, 50%, 60%, 0.35)";
        this.screenFlashTimer = 0.35;
        break;
      }
      case "kagemusha": {
        // Twin Shadows — spawn an 8s clone that mirrors and fights.
        this.clones.push({
          pos: { x: this.player.pos.x + 40, y: this.player.pos.y },
          facing: this.player.facing,
          hp: 60, maxHp: 60,
          attackTimer: 0,
          life: 8,
          hitFlash: 0,
        });
        this.screenFlashColor = "hsla(220, 40%, 65%, 0.35)";
        this.screenFlashTimer = 0.3;
        break;
      }
      case "arashi": {
        // Storm of Heaven — leap, untargetable briefly, rain 20 piercing arrows.
        this.player.invuln = Math.max(this.player.invuln, 1.2);
        for (let i = 0; i < 20; i++) {
          const ang = (i / 20) * Math.PI * 2 + Math.random() * 0.2;
          const speed = 520 * this.perks.projectileSpeedMul;
          this.projectiles.push({
            pos: { x: this.player.pos.x, y: this.player.pos.y },
            vel: { x: Math.cos(ang) * speed, y: Math.sin(ang) * speed },
            life: 1.4, maxLife: 1.4,
            damage: 9,
            hitSet: new Set(),
            slow: true,
          });
        }
        this.screenFlashColor = "hsla(200, 80%, 75%, 0.45)";
        this.screenFlashTimer = 0.4;
        break;
      }
      case "tetsubo": {
        // Earthbreaker — slam ground, expanding shockwave launches enemies.
        this.shockwaves.push({
          pos: { x: this.player.pos.x, y: this.player.pos.y },
          radius: 0,
          maxRadius: 420,
          life: 0.7,
          damage: 18,
          hitSet: new Set(),
        });
        this.cameraShake = Math.max(this.cameraShake, 0.9);
        this.screenFlashColor = "hsla(30, 80%, 60%, 0.4)";
        this.screenFlashTimer = 0.4;
        break;
      }
      // ===== Phase C — new ultimates =====
      case "onmyoji": {
        this.ultSpiritTempestTimer = 5;
        this.ultSpiritTempestTick = 0;
        this.player.invuln = Math.max(this.player.invuln, 0.6);
        this.screenFlashColor = "hsla(280, 60%, 60%, 0.4)";
        this.screenFlashTimer = 0.45;
        this.cameraShake = Math.max(this.cameraShake, 0.6);
        // Drop a spirit orb at ultimate cast site too.
        this.spiritOrbs.push({
          pos: { x: this.player.pos.x, y: this.player.pos.y },
          life: 5, maxLife: 5, hitSet: new Set(), tickAccum: 0,
        });
        break;
      }
      case "hatamoto": {
        this.ultBannerActive = true;
        this.ultBannerTimer = 8;
        this.ultBannerPos = { x: this.player.pos.x, y: this.player.pos.y };
        this.screenFlashColor = "hsla(45, 95%, 55%, 0.35)";
        this.screenFlashTimer = 0.4;
        break;
      }
      case "kunoichi": {
        this.ultPhantomTimer = 4;
        this.ultPhantomImages = [];
        for (let i = 0; i < 3; i++) {
          const a = (i / 3) * Math.PI * 2 + Math.random() * 0.4;
          this.ultPhantomImages.push({
            pos: { x: this.player.pos.x, y: this.player.pos.y },
            vel: { x: Math.cos(a) * 360, y: Math.sin(a) * 360 },
            facing: a,
            tickAccum: 0,
          });
        }
        this.player.invuln = Math.max(this.player.invuln, 0.6);
        this.screenFlashColor = "hsla(320, 60%, 70%, 0.4)";
        this.screenFlashTimer = 0.4;
        break;
      }
      case "tsuchigumo": {
        this.ultDeathWebTimer = 6;
        this.ultDeathWebTick = 0;
        this.screenFlashColor = "hsla(260, 50%, 40%, 0.35)";
        this.screenFlashTimer = 0.4;
        break;
      }
      case "miko": {
        this.ultDivineBeamTimer = 3;
        this.ultDivineBeamRadius = 0;
        this.ultDivineBeamTick = 0;
        this.ultDivineBeamHit = new Set();
        this.player.invuln = Math.max(this.player.invuln, 1.0);
        this.screenFlashColor = "hsla(180, 70%, 85%, 0.55)";
        this.screenFlashTimer = 0.5;
        break;
      }
      case "kagebushi": {
        this.ultShadowConsumeTimer = 6;
        this.player.invuln = Math.max(this.player.invuln, 0.4);
        this.screenFlashColor = "hsla(250, 40%, 25%, 0.5)";
        this.screenFlashTimer = 0.5;
        // Boost speed by setting speedMul above cap won't work; instead grant
        // a temporary direct bonus by letting the cap clamp it — the visual
        // "double-attack" is provided by the existing shadow clone passive.
        break;
      }
      default: {
        // Safety net — should not be reached now that all 11 classes have bespoke ults.
        for (const e of this.enemies) {
          if (e.state === "dead") continue;
          const dx = e.pos.x - this.player.pos.x;
          const dy = e.pos.y - this.player.pos.y;
          if (Math.hypot(dx, dy) > 600) continue;
          this.dealDamage(e, 12, Math.atan2(dy, dx), 100);
        }
        this.screenFlashColor = "hsla(358, 80%, 50%, 0.4)";
        this.screenFlashTimer = 0.5;
      }
    }
  }

  // ============ Iai Chain (Samurai ultimate) ============
  // Picks the strongest still-living enemy within IAI_CHAIN_RADIUS of the
  // player, teleports the player next to them, slashes, and queues the
  // next step. Up to MAX_IAI_CHAIN_HITS slashes per cast. Each step is
  // its own frame (driven by updateIaiChain()) so the player can SEE each
  // teleport + slash + ink splash + slash SFX.
  castIaiChain() {
    this.iaiChainRemaining = MAX_IAI_CHAIN_HITS;
    this.iaiChainTimer = 0; // strike immediately on the first frame
    this.iaiChainHitIds.clear();
    this.iaiChainTargetId = null;
    this.player.invuln = Math.max(this.player.invuln, 0.6);
    this.cameraShake = Math.max(this.cameraShake, 0.4);
    this.screenFlashColor = "hsla(45, 95%, 80%, 0.4)";
    this.screenFlashTimer = 0.25;
    audio.play("stealth");
    this.flash("Iai Chain!");
  }

  // Score a candidate enemy by "threat" — bosses & high-HP enemies first.
  private iaiThreatScore(e: Enemy): number {
    let s = e.maxHp + e.hp * 0.5 + e.damage * 2;
    if (e.isBoss) s += 500;
    if (e.archetype === "final") s += 800;
    if (e.archetype === "shielded") s += 30;
    if (e.archetype === "heavy") s += 20;
    if (e.archetype === "assassin") s += 15;
    return s;
  }

  // Execute one blink-slash step. Returns true if a hit landed, false if
  // no eligible target (which ends the chain early).
  private iaiChainStep(): boolean {
    const p = this.player;
    // Sticky target: if the locked enemy is still alive, keep slashing it.
    // Only when it dies (or we don't have one yet) do we look up the next
    // strongest enemy in radius. This makes a boss eat all 5 slashes.
    let best: Enemy | null = null;
    if (this.iaiChainTargetId !== null) {
      const cur = this.enemies.find(e => e.id === this.iaiChainTargetId);
      if (cur && cur.state !== "dead") best = cur;
      else {
        // Locked target died (or vanished) — mark it spent and pick anew.
        if (this.iaiChainTargetId !== null) this.iaiChainHitIds.add(this.iaiChainTargetId);
        this.iaiChainTargetId = null;
      }
    }
    if (!best) {
      // Find the strongest living enemy in radius that we haven't finished off.
      let bestScore = -Infinity;
      for (const e of this.enemies) {
        if (e.state === "dead") continue;
        if (this.iaiChainHitIds.has(e.id)) continue;
        const d = Math.hypot(e.pos.x - p.pos.x, e.pos.y - p.pos.y);
        if (d > IAI_CHAIN_RADIUS) continue;
        const score = this.iaiThreatScore(e);
        if (score > bestScore) { bestScore = score; best = e; }
      }
      if (!best) return false;
      this.iaiChainTargetId = best.id;
    }

    const startX = p.pos.x;
    const startY = p.pos.y;
    // Teleport to a flank position next to the target (offset perpendicular
    // to the player→target vector so the slash visibly comes from the side).
    const dx = best.pos.x - startX;
    const dy = best.pos.y - startY;
    const ang = Math.atan2(dy, dx);
    const offset = best.size + 22;
    const flank = (Math.random() < 0.5 ? 1 : -1);
    const endX = best.pos.x - Math.cos(ang) * offset
                            + Math.sin(ang) * offset * 0.4 * flank;
    const endY = best.pos.y - Math.sin(ang) * offset
                            - Math.cos(ang) * offset * 0.4 * flank;
    p.pos.x = Math.max(20, Math.min(this.worldW - 20, endX));
    p.pos.y = Math.max(20, Math.min(this.worldH - 20, endY));
    p.facing = Math.atan2(best.pos.y - p.pos.y, best.pos.x - p.pos.x);

    // Slash visual + ink splash centered on the victim.
    this.spawnSlash(p.pos, p.facing, BASE.ATTACK_RANGE * 0.95, Math.PI * 0.85);
    spawnInkSplash(this.vfx, this.quality.state,
      best.pos.x, best.pos.y,
      { count: 4, size: 30, hue: 0, lightness: 8, life: 0.45 },
    );

    // Trail markers between departure and landing point so the blink reads.
    const segs = 6;
    for (let i = 0; i <= segs; i++) {
      const t = i / segs;
      this.flashTrail.push({
        x: startX + (p.pos.x - startX) * t,
        y: startY + (p.pos.y - startY) * t,
        ang: p.facing,
        life: 1,
      });
    }

    // Damage the locked target. We do NOT add it to iaiChainHitIds here:
    // the chain stays on the same enemy until it dies (handled at the top
    // of iaiChainStep), so a boss can absorb all 5 slashes.
    this.dealDamage(best, IAI_CHAIN_DAMAGE, p.facing, 50);

    // Audio: a layered slash + a faint stealth whoosh (blink).
    audio.play("slash");
    audio.play("slashShort");
    if (best.isBoss) audio.play("hit");
    this.cameraShake = Math.max(this.cameraShake, 0.25);
    return true;
  }

  // Per-frame stepper: counts down between blink-slashes; when the timer
  // hits zero we execute the next step (or finish the chain).
  updateIaiChain(dt: number) {
    if (this.iaiChainRemaining <= 0) return;
    this.iaiChainTimer -= dt;
    if (this.iaiChainTimer > 0) return;
    const ok = this.iaiChainStep();
    if (!ok) {
      // No more eligible enemies in radius — end the chain cleanly.
      this.iaiChainRemaining = 0;
      this.iaiChainHitIds.clear();
      this.iaiChainTargetId = null;
      return;
    }
    this.iaiChainRemaining--;
    this.iaiChainTimer = IAI_CHAIN_STEP_INTERVAL;
    if (this.iaiChainRemaining <= 0) {
      // Final flourish flash on completion.
      this.screenFlashColor = "hsla(45, 95%, 80%, 0.35)";
      this.screenFlashTimer = 0.2;
      this.iaiChainHitIds.clear();
      this.iaiChainTargetId = null;
    }
  }

  resolveStandoff() {
    const t = this.standoffTimer;
    this.standoffTimer = 0;
    this.timeScale = 1;
    this.desaturate = 0;
    this.stats.ultPhase = "";
    if (t <= 0.2) {
      const sorted = this.enemies
        .filter(e => e.state !== "dead")
        .map(e => ({ e, d: Math.hypot(e.pos.x - this.player.pos.x, e.pos.y - this.player.pos.y) }))
        .sort((a, b) => a.d - b.d)
        .slice(0, 4);
      for (const { e } of sorted) {
        e.hp = 0;
        this.spawnBlood(e.pos, 0, 30);
        this.killEnemy(e, "honor");
      }
      this.screenFlashColor = "hsla(0, 0%, 100%, 0.9)";
      this.screenFlashTimer = 0.4;
      this.flash("PERFECT STANDOFF");
      this.player.invuln = Math.max(this.player.invuln, 0.8);
    } else if (t <= 0.8) {
      const nearest = this.enemies
        .filter(e => e.state !== "dead")
        .sort((a, b) => Math.hypot(a.pos.x - this.player.pos.x, a.pos.y - this.player.pos.y)
                      - Math.hypot(b.pos.x - this.player.pos.x, b.pos.y - this.player.pos.y))[0];
      if (nearest) {
        const ang = Math.atan2(nearest.pos.y - this.player.pos.y, nearest.pos.x - this.player.pos.x);
        this.dealDamage(nearest, 10, ang, 60);
      }
      this.flash("Early — partial hit");
    } else {
      this.player.hp -= 15;
      this.player.hitFlash = 1;
      this.cameraShake = 0.6;
      this.screenFlashColor = "hsla(358, 80%, 50%, 0.5)";
      this.screenFlashTimer = 0.4;
      this.stats.ultCharge = this.stats.ultMax * 0.5;
      this.flash("Missed Standoff");
    }
    this.stats.ultActive = false;
  }

  // ===========================================================================
  // PHASE 3 — Secondary weapon system
  // ===========================================================================

  // Per-frame: regen ammo, pickup magnet, projectile/bomb/smoke/caltrop ticks.
  updateSecondaries(dt: number) {
    if (this.stats.secondaryCooldown > 0) {
      this.stats.secondaryCooldown = Math.max(0, this.stats.secondaryCooldown - dt);
    }

    // ===== Phase 2 — Block pool refresh + regen =====
    // Effective block HP max = perks.blockHpBase + heavy-weapon bonus
    // (if currently wielding a heavy secondary). When the active weapon
    // changes, the pool resizes; we never raise current blockHp above
    // the new max but the new ceiling kicks in immediately.
    const activeId = this.stats.secondaryIds[this.stats.secondaryActiveSlot];
    let heavyBonus = 0;
    if (activeId === "tate") heavyBonus = 20;
    else if (activeId && isHeavySecondary(activeId)) heavyBonus = 10;
    const newMax = Math.max(0, Math.round(this.perks.blockHpBase + heavyBonus));
    if (newMax !== this.stats.blockHpMax) {
      this.stats.blockHpMax = newMax;
      // Clamp current to new max but don't pop it up — block earns back via regen.
      if (this.stats.blockHp > newMax) this.stats.blockHp = newMax;
    }
    // Regen — only if there's a pool. Tate adds +1.5/s on top of perk regen.
    if (this.stats.blockHpMax > 0) {
      const baseRegen = this.perks.blockRegen + (activeId === "tate" ? 1.5 : 0);
      // Iron Powder consumable: triple block regen while active.
      const ipMul = this.stats.buffIronPowderRemaining > 0 ? 3 : 1;
      const effectiveRegen = baseRegen * ipMul;
      if (effectiveRegen > 0 && this.stats.blockHp < this.stats.blockHpMax) {
        this.stats.blockHp = Math.min(
          this.stats.blockHpMax,
          this.stats.blockHp + effectiveRegen * dt,
        );
      }
    } else if (this.stats.blockHp > 0) {
      this.stats.blockHp = 0;
    }

    // Melee secondaries no longer use a time-limited active window — they
    // can be wielded indefinitely. (The meleeActive* fields remain on
    // GameStats for save-compat but are pinned to 0 by onActiveSecondaryChanged.)

    // Ammo regen — independent per slot, only if a weapon is equipped & not full.
    for (let slot = 0; slot < 2; slot++) {
      const id = this.stats.secondaryIds[slot];
      if (!id) continue;
      const def = SECONDARIES[id];
      // Melee secondaries don't use ammo anymore — keep their counters
      // pinned so legacy code paths (HUD reads, ammo pickups) stay sane.
      if (isMeleeSecondary(id)) {
        this.stats.secondaryAmmoMax[slot] = 0;
        this.stats.secondaryAmmo[slot] = 0;
        this.secondaryRegenAccum[slot] = 0;
        this.stats.secondaryReload[slot] = 0;
        this.stats.secondaryReloadMax[slot] = 0;
        continue;
      }
      // ===== Phase 2 — Reload-based weapons (blowgun, crossbow) =====
      // These ignore regen entirely. When emptied, their reload timer
      // counts down and full mag is restored at 0.
      if (usesReload(id)) {
        this.secondaryRegenAccum[slot] = 0;
        if (this.stats.secondaryReload[slot] > 0) {
          this.stats.secondaryReload[slot] = Math.max(
            0,
            this.stats.secondaryReload[slot] - dt,
          );
          if (this.stats.secondaryReload[slot] <= 0) {
            this.stats.secondaryAmmo[slot] = this.stats.secondaryAmmoMax[slot];
            this.stats.secondaryReloadMax[slot] = 0;
            audio.play("crossbowSnap");
          }
        }
        continue;
      }
      if (this.stats.secondaryAmmo[slot] >= this.stats.secondaryAmmoMax[slot]) {
        this.secondaryRegenAccum[slot] = 0;
        continue;
      }
      if (def.regenTime <= 0) continue;
      const regenTime = def.regenTime * this.perks.secondaryRegenMul;
      this.secondaryRegenAccum[slot] += dt;
      if (this.secondaryRegenAccum[slot] >= regenTime) {
        this.secondaryRegenAccum[slot] -= regenTime;
        this.stats.secondaryAmmo[slot] = Math.min(
          this.stats.secondaryAmmoMax[slot],
          this.stats.secondaryAmmo[slot] + 1,
        );
      }
    }

    // Projectile travel + collisions
    this.updateSecProjectiles(dt);
    // Arc bombs (lobbed)
    this.updateArcBombs(dt);
    // Caltrop fields (DoT zones)
    this.updateCaltrops(dt);
    // Smoke clouds (slow + lower alertness)
    this.updateSmokeClouds(dt);
    // Ammo pickups (drift toward player when nearby + auto-pickup on touch)
    this.updateAmmoPickups(dt);
    // Consumable pickups (same magnet/collect model — adds to inventory).
    this.updateConsumablePickups(dt);
    // XP orbs (magnet + collect)
    this.updateXpOrbs(dt);
  }

  // Toggle the active secondary slot — only swaps if both slots have a weapon.
  swapSecondary() {
    const a = this.stats.secondaryIds[0];
    const b = this.stats.secondaryIds[1];
    if (!a || !b) return;
    this.stats.secondaryActiveSlot = this.stats.secondaryActiveSlot === 0 ? 1 : 0;
    audio.play("slash");
    this.onActiveSecondaryChanged();
  }

  // Called whenever the active secondary slot changes (Tab swap, freshly
  // equipped from shop, etc.). If the new active weapon is a melee
  // secondary, the active-use timer is always disabled — melee secondaries
  // can be wielded indefinitely.
  private onActiveSecondaryChanged() {
    this.stats.meleeActiveMax = 0;
    this.stats.meleeActiveRemaining = 0;
  }

  // Fire the active secondary if cooldown clear and ammo available.
  fireSecondary() {
    if (this.stats.secondaryCooldown > 0) return;
    const slot = this.stats.secondaryActiveSlot;
    const id = this.stats.secondaryIds[slot];
    if (!id) return;
    const def = SECONDARIES[id];
    const melee = isMeleeSecondary(id);
    if (melee) {
      // Melee secondaries cost no ammo and have no active-use window —
      // wield them as long as you like.
    } else {
      if (this.stats.secondaryAmmo[slot] <= 0) return;
      this.stats.secondaryAmmo[slot] -= 1;
      // ===== Phase 2 — Reload trigger =====
      // If this weapon uses reload and we just emptied the mag, kick off
      // the reload timer immediately. No firing is allowed until it ends.
      if (usesReload(id) && this.stats.secondaryAmmo[slot] === 0) {
        const rt = SECONDARIES[id].reloadTime ?? 0;
        this.stats.secondaryReload[slot] = rt;
        this.stats.secondaryReloadMax[slot] = rt;
      }
    }
    this.stats.secondaryCooldown = this.effectiveSecondaryCooldown(id);

    const p = this.player;
    const baseAng = p.facing;
    const projSpeedMul = this.perks.projectileSpeedMul ?? 1;

    // ===== Phase B — melee-style secondaries (Tessen, Jutte, Ono, Twin Sai, Odachi).
    // These all use def.aim === "self" but behave like swings, NOT smoke clouds.
    // We branch by id BEFORE the generic "self" path so smoke_bomb still works.
    if (id === "tessen" || id === "jutte" || id === "ono"
        || id === "twin_sai" || id === "odachi" || id === "tate") {
      this.swingMeleeSecondary(id, def);
      return;
    }

    if (def.aim === "self") {
      // Smoke bomb (secondary) — drops at player's feet.
      // Deliberately smaller and shorter than the Smoke Bomb ability
      // so the ability still feels distinct and powerful.
      this.smokeClouds.push({
        pos: { x: p.pos.x, y: p.pos.y },
        radius: 80,
        life: 3.5,
        maxLife: 3.5,
      });
      this.spawnInkSwirl(p.pos, "hsl(220 18% 75%)", 14);
      audio.play("smokeWoosh");
      return;
    }

    if (def.aim === "arc") {
      // Tetsubishi bomb — lobbed toward the cursor (or facing direction on touch).
      // Solve for ballistic velocity so the bomb lands AT the target point.
      // height(t) = vh*t - 0.5*G*t^2, lands at t = 2*vh/G  →  pick T from dist.
      const G = 480;
      let targetX: number, targetY: number;
      if (this.input.mouseAim) {
        targetX = this.input.mouseX + this.cameraX;
        targetY = this.input.mouseY + this.cameraY;
      } else {
        // Touch / no cursor — fall back to a comfortable lob in facing direction.
        targetX = p.pos.x + Math.cos(baseAng) * 260;
        targetY = p.pos.y + Math.sin(baseAng) * 260;
      }
      const dx = targetX - p.pos.x;
      const dy = targetY - p.pos.y;
      // Clamp throw distance so the player can't lob across the whole arena.
      const dist = Math.max(60, Math.min(520, Math.hypot(dx, dy)));
      const ang = Math.atan2(dy, dx);
      // Flight time scales with distance — short throws are snappy, long ones arc higher.
      const T = (0.45 + dist / 900) / Math.max(0.6, projSpeedMul);
      const horizSpeed = dist / T;
      const vh = (G * T) / 2;
      this.arcBombs.push({
        pos: { x: p.pos.x, y: p.pos.y },
        vel: { x: Math.cos(ang) * horizSpeed, y: Math.sin(ang) * horizSpeed },
        height: 0,
        vh,
        life: T + 0.3,            // a little slack past the predicted landing
        damage: this.effectiveSecondaryDamage(id) + 4,
        radius: 90,
      });
      // Face the throw so the throwing animation reads correctly.
      p.facing = ang;
      this.spawnMuzzleFlash(p.pos, ang, "hsl(20 80% 65%)");
      audio.play("slash");
      return;
    }

    // Aimed projectile (yumi / kunai / crossbow / kusarigama).
    const count = def.projectiles;
    const spread = def.spread;
    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0 : (i / (count - 1)) - 0.5;   // -0.5..0.5
      const ang = baseAng + t * spread;
      const speed =
        (id === "yumi" ? 720 :
         id === "crossbow" ? 620 :
         id === "kusarigama" ? 540 :
         id === "shuriken_wheel" ? 560 :
         id === "flame_spear" ? 760 :
         id === "blowgun" ? 700 :
         480) * projSpeedMul;
      const dmg = this.effectiveSecondaryDamage(id);
      const kind: SecondaryProjectile["kind"] =
        id === "yumi" ? "arrow" :
        id === "crossbow" ? "bolt" :
        id === "kusarigama" ? "hook" :
        id === "shuriken_wheel" ? "shuriken" :
        id === "flame_spear" ? "spear" :
        id === "blowgun" ? "dart" :
        "kunai";
      const proj: SecondaryProjectile = {
        pos: { x: p.pos.x, y: p.pos.y },
        vel: { x: Math.cos(ang) * speed, y: Math.sin(ang) * speed },
        life: kind === "hook" ? 0.5 : kind === "shuriken" ? 2.4 : kind === "spear" ? 0.55 : 1.0,
        maxLife: kind === "hook" ? 0.5 : kind === "shuriken" ? 2.4 : kind === "spear" ? 0.55 : 1.0,
        damage: dmg,
        hitSet: new Set(),
        // arrows + spears pierce; shuriken bounces (handled separately, not pierce)
        pierce: kind === "arrow" || kind === "spear",
        kind,
        hookEnemyId: null,
        trail: [],
      };
      if (kind === "shuriken") {
        proj.bouncesLeft = 4;
        proj.returning = false;
        proj.spinAng = 0;
      }
      if (kind === "spear") proj.burnSeconds = 4;
      if (kind === "dart") proj.poisonSeconds = 3;
      this.secProjectiles.push(proj);
    }
    // Phase 6 — muzzle flash + per-weapon fire SFX
    const flashColor =
      id === "yumi" ? "hsl(200 80% 80%)" :
      id === "crossbow" ? "hsl(36 95% 75%)" :
      id === "kusarigama" ? "hsl(0 80% 60%)" :
      id === "shuriken_wheel" ? "hsl(190 70% 80%)" :
      id === "flame_spear" ? "hsl(15 95% 70%)" :
      id === "blowgun" ? "hsl(120 60% 70%)" :
      "hsl(260 60% 80%)";
    this.spawnMuzzleFlash(p.pos, baseAng, flashColor);
    if (id === "crossbow") audio.play("crossbowSnap");
    else if (id === "kusarigama") audio.play("hookClink");
    else if (id === "flame_spear") audio.play("slash");
    else if (id === "shuriken_wheel") audio.play("slash");
    else if (id === "blowgun") audio.play("kunaiHit");
    else audio.play("slash");
  }

  // ===== Phase B — melee secondary swing (Tessen / Jutte / Ono / Twin Sai / Odachi).
  // Reuses the katana arc-hit pattern from doPlayerAttack but with per-weapon
  // range, arc, hit-count, and on-hit status effects.
  // Helper: is the given secondary id currently equipped in either slot?
  private secondaryEquipped(id: SecondaryId): boolean {
    return this.stats.secondaryIds[0] === id || this.stats.secondaryIds[1] === id;
  }
  private tessenEquipped(): boolean { return this.secondaryEquipped("tessen"); }
  private odachiEquipped(): boolean { return this.secondaryEquipped("odachi"); }

  // Returns true when the currently ACTIVE secondary slot holds a melee
  // weapon (Tessen / Jutte / Ono / Twin Sai / Odachi). When true, the katana
  // attack input (mouse / space) is routed to fireSecondary() so the melee
  // secondary "takes over" the katana role for that input.
  private activeSecondaryIsMelee(): boolean {
    const id = this.stats.secondaryIds[this.stats.secondaryActiveSlot];
    if (!id) return false;
    return id === "tessen" || id === "jutte" || id === "ono"
        || id === "twin_sai" || id === "odachi" || id === "tate";
  }

  private swingMeleeSecondary(id: SecondaryId, def: typeof SECONDARIES[SecondaryId]) {
    const p = this.player;
    // Drive the player's swing animation so drawPlayer renders the correct
    // weapon model and arc direction for this melee secondary.
    p.attackAnim = 1;
    p.swingWeaponId = id;
    p.swingDir = (p.swingDir === 1 ? -1 : 1);
    const baseDmg = this.effectiveSecondaryDamage(id);

    // Per-weapon swing geometry.
    let range: number;
    let arc: number;
    let strikes = def.projectiles;     // Twin Sai = 2, others = 1
    if (id === "tessen") { range = 90; arc = Math.PI * 0.95; }       // wide cone, short
    else if (id === "jutte") { range = 78; arc = Math.PI * 0.55; }
    else if (id === "ono") { range = 110; arc = Math.PI * 0.55; }    // heavy frontal
    else if (id === "twin_sai") { range = 88; arc = Math.PI * 0.55; }
    else if (id === "tate") { range = 75; arc = Math.PI * 0.5; }      // shield bash — short cone
    else /* odachi */ { range = 150; arc = Math.PI * 1.5; }          // 270° huge arc

    // Bump per-weapon swing counter (used for Ono cleave + Twin Fang etc).
    const sc = this.perks.secondarySwingCounts;
    sc[id] = (sc[id] ?? 0) + 1;
    const swingIdx = sc[id];

    // Resolve the arc.
    let anyHit = false;
    let firstHitAng = p.facing;
    for (let s = 0; s < strikes; s++) {
      for (const e of this.enemies) {
        if (e.state === "dead") continue;
        const dx = e.pos.x - p.pos.x;
        const dy = e.pos.y - p.pos.y;
        const dist = Math.hypot(dx, dy);
        if (dist > range + e.size) continue;
        const ang = Math.atan2(dy, dx);
        let diff = ang - p.facing;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        if (Math.abs(diff) > arc / 2) continue;

        // Status effects on hit
        if (id === "jutte" && Math.random() < 0.25 && !e.isBoss) {
          e.disarmedRemaining = Math.max(e.disarmedRemaining, 2);
        }
        if (id === "twin_sai" && Math.random() < 0.15 && !e.isBoss) {
          e.stunTimer = Math.max(e.stunTimer, 0.6);
        }
        this.dealDamage(e, baseDmg, ang, e.isBoss ? 12 : 50, id);
        if (!anyHit) { anyHit = true; firstHitAng = ang; }
      }
    }

    // Ono — every 5th swing triggers a half-circle cleave (front 180°, +60% dmg).
    if (id === "ono" && swingIdx % 5 === 0) {
      const cleaveR = range + 40;
      const cleaveDmg = baseDmg * 1.6;
      for (const e of this.enemies) {
        if (e.state === "dead") continue;
        const dx = e.pos.x - p.pos.x;
        const dy = e.pos.y - p.pos.y;
        const dist = Math.hypot(dx, dy);
        if (dist > cleaveR + e.size) continue;
        const ang = Math.atan2(dy, dx);
        let diff = ang - p.facing;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        if (Math.abs(diff) > Math.PI / 2) continue;   // 180° front
        this.dealDamage(e, cleaveDmg, ang, e.isBoss ? 18 : 90, id);
      }
      this.spawnSlash(p.pos, p.facing, cleaveR, Math.PI);
      this.cameraShake = Math.max(this.cameraShake, 0.3);
      this.hitstop = Math.max(this.hitstop, 0.06);
      audio.play("hit");
      this.flash("Cleave!");
    }

    // Visual swing arc + audio cue
    this.spawnSlash(p.pos, p.facing, range, arc);
    if (anyHit) {
      this.cameraShake = Math.max(this.cameraShake, id === "odachi" ? 0.32 : 0.12);
      this.hitstop = Math.max(this.hitstop, id === "odachi" ? 0.06 : 0.025);
    }
    if (id === "odachi") audio.play("hit");
    audio.playSlashRandom(arc > Math.PI ? 2 : id === "ono" ? 2 : 1);
    void firstHitAng;
  }

  // Travel + enemy collision for projectiles. Pierce arrows continue through.
  updateSecProjectiles(dt: number) {
    for (const pr of this.secProjectiles) {
      // Hookshot — if attached to an enemy, pull them toward the player.
      if (pr.kind === "hook" && pr.hookEnemyId !== null) {
        const target = this.enemies.find(en => en.id === pr.hookEnemyId);
        if (target && target.state !== "dead" && !target.isBoss) {
          const dx = this.player.pos.x - target.pos.x;
          const dy = this.player.pos.y - target.pos.y;
          const d = Math.hypot(dx, dy);
          if (d > 36) {
            const pullSpeed = 520;
            target.pos.x += (dx / d) * pullSpeed * dt;
            target.pos.y += (dy / d) * pullSpeed * dt;
          } else {
            pr.life = 0;
          }
        } else {
          pr.life = 0;
        }
        pr.life -= dt;
        continue;
      }

      // ===== Phase B — Shuriken Wheel boomerang. After it has used all bounces
      // it accelerates back toward the player and ends when it touches them.
      if (pr.kind === "shuriken") {
        if (pr.spinAng !== undefined) pr.spinAng += dt * 18;
        if (pr.returning) {
          const dx = this.player.pos.x - pr.pos.x;
          const dy = this.player.pos.y - pr.pos.y;
          const d = Math.hypot(dx, dy);
          if (d < 24) { pr.life = 0; continue; }
          // Steer toward player, capped speed.
          const steer = 1800 * dt;
          pr.vel.x += (dx / d) * steer;
          pr.vel.y += (dy / d) * steer;
          const sp = Math.hypot(pr.vel.x, pr.vel.y);
          const maxSp = 700;
          if (sp > maxSp) { pr.vel.x *= maxSp / sp; pr.vel.y *= maxSp / sp; }
          // Re-clear hitSet so it can damage on the way back too.
          if (pr.hitSet.size > 4) pr.hitSet = new Set();
        }
      }

      pr.pos.x += pr.vel.x * dt;
      pr.pos.y += pr.vel.y * dt;
      pr.life -= dt;
      pr.trail.push({ x: pr.pos.x, y: pr.pos.y });
      if (pr.trail.length > 6) pr.trail.shift();

      // World bounds
      if (pr.pos.x < 0 || pr.pos.x > this.worldW || pr.pos.y < 0 || pr.pos.y > this.worldH) {
        // Shuriken: bounce off walls instead of dying so the boomerang can return.
        if (pr.kind === "shuriken" && !pr.returning) {
          pr.returning = true;
          // Nudge back inside the arena.
          pr.pos.x = Math.max(8, Math.min(this.worldW - 8, pr.pos.x));
          pr.pos.y = Math.max(8, Math.min(this.worldH - 8, pr.pos.y));
        } else {
          pr.life = 0;
        }
      }

      for (const e of this.enemies) {
        if (e.state === "dead") continue;
        if (pr.hitSet.has(e.id)) continue;
        const dx = e.pos.x - pr.pos.x;
        const dy = e.pos.y - pr.pos.y;
        if (Math.hypot(dx, dy) > e.size + 6) continue;
        pr.hitSet.add(e.id);

        const ang = Math.atan2(dy, dx);
        if (pr.kind === "hook" && !e.isBoss) {
          // Latch + bleed
          pr.hookEnemyId = e.id;
          e.bleedRemaining = Math.max(e.bleedRemaining, 3);
          this.dealDamage(e, pr.damage, ang, 0);
          audio.play("hookClink");
          break;
        }
        // Apply per-kind statuses BEFORE dealDamage so we don't lose ref if it kills.
        if (pr.kind === "spear" && pr.burnSeconds && pr.burnSeconds > 0) {
          e.burnRemaining = Math.max(e.burnRemaining, pr.burnSeconds);
          e.burnDps = Math.max(e.burnDps, 5);
        }
        if (pr.kind === "dart" && pr.poisonSeconds && pr.poisonSeconds > 0) {
          // Stacking poison — additive, capped at 8s like Shinobi passive.
          e.poisonRemaining = Math.min(8, e.poisonRemaining + pr.poisonSeconds);
          // Ensure there's some poison DPS even if class doesn't grant it.
          if (this.perks.poisonDps <= 0) this.perks.poisonDps = 4;
        }
        this.dealDamage(e, pr.damage, ang, pr.kind === "kunai" ? 30 : 60);
        // Phase 6 — per-weapon impact sound + tiny shake on heavy bolts/arrows.
        if (pr.kind === "arrow") { audio.play("arrowHit"); this.cameraShake = Math.max(this.cameraShake, 0.12); }
        else if (pr.kind === "bolt") audio.play("crossbowSnap");
        else if (pr.kind === "hook") audio.play("hookClink");
        else if (pr.kind === "shuriken") audio.play("kunaiHit");
        else if (pr.kind === "spear") { audio.play("hit"); this.cameraShake = Math.max(this.cameraShake, 0.15); }
        else if (pr.kind === "dart") audio.play("kunaiHit");
        else audio.play("kunaiHit");

        // Shuriken — bounce to next enemy if bounces remain, then return home.
        if (pr.kind === "shuriken") {
          if ((pr.bouncesLeft ?? 0) > 0 && !pr.returning) {
            pr.bouncesLeft = (pr.bouncesLeft ?? 0) - 1;
            // Find nearest unhit enemy within reasonable range, redirect velocity.
            let nearest: Enemy | null = null;
            let bestD = 380;
            for (const o of this.enemies) {
              if (o.state === "dead" || pr.hitSet.has(o.id)) continue;
              const d = Math.hypot(o.pos.x - pr.pos.x, o.pos.y - pr.pos.y);
              if (d < bestD) { bestD = d; nearest = o; }
            }
            if (nearest) {
              const tang = Math.atan2(nearest.pos.y - pr.pos.y, nearest.pos.x - pr.pos.x);
              const sp = Math.hypot(pr.vel.x, pr.vel.y) || 560;
              pr.vel.x = Math.cos(tang) * sp;
              pr.vel.y = Math.sin(tang) * sp;
            } else {
              pr.returning = true;
            }
          } else if (!pr.returning) {
            pr.returning = true;
          }
          // Don't kill the shuriken — it keeps going.
          continue;
        }

        if (!pr.pierce) {
          pr.life = 0;
          break;
        }
      }
    }
    this.secProjectiles = this.secProjectiles.filter(p => p.life > 0);
  }

  updateArcBombs(dt: number) {
    const G = 480;
    for (const b of this.arcBombs) {
      b.life -= dt;
      // 2D travel + simulated height
      b.pos.x += b.vel.x * dt;
      b.pos.y += b.vel.y * dt;
      b.height += b.vh * dt;
      b.vh -= G * dt;
      if (b.height <= 0 && b.vh < 0) {
        // Explode!
        for (const e of this.enemies) {
          if (e.state === "dead") continue;
          const d = Math.hypot(e.pos.x - b.pos.x, e.pos.y - b.pos.y);
          if (d <= b.radius) {
            const ang = Math.atan2(e.pos.y - b.pos.y, e.pos.x - b.pos.x);
            this.dealDamage(e, b.damage, ang, 80);
          }
        }
        this.spawnBlood(b.pos, 0, 10);
        this.spawnInkSwirl(b.pos, "hsl(20 80% 55%)", 14);
        this.cameraShake = Math.max(this.cameraShake, 0.35);
        this.hitstop = Math.max(this.hitstop, 0.05);
        audio.play("bombBoom");
        // Leave a caltrop field
        this.caltrops.push({
          pos: { x: b.pos.x, y: b.pos.y },
          radius: b.radius * 0.7,
          life: 4,
          maxLife: 4,
          dps: 6,
          tickAccum: 0,
        });
        b.life = 0;
      }
    }
    this.arcBombs = this.arcBombs.filter(b => b.life > 0);
  }

  updateCaltrops(dt: number) {
    for (const c of this.caltrops) {
      c.life -= dt;
      c.tickAccum += dt;
      if (c.tickAccum >= 0.25) {
        const tick = c.dps * c.tickAccum;
        c.tickAccum = 0;
        for (const e of this.enemies) {
          if (e.state === "dead") continue;
          const d = Math.hypot(e.pos.x - c.pos.x, e.pos.y - c.pos.y);
          if (d <= c.radius) {
            e.hp -= tick;
            e.hitFlash = Math.max(e.hitFlash, 0.3);
            if (e.hp <= 0) this.killEnemy(e, "ghost");
          }
        }
      }
    }
    this.caltrops = this.caltrops.filter(c => c.life > 0);
  }

  updateSmokeClouds(dt: number) {
    for (const s of this.smokeClouds) {
      s.life -= dt;
      // Slow + lower alertness + disorient enemies inside the cloud.
      // Disorient is what makes enemies eligible for stealth kills, so
      // both the smoke-bomb ability AND the smoke-bomb secondary now
      // produce the same gameplay effect when an enemy is in the cloud.
      for (const e of this.enemies) {
        if (e.state === "dead") continue;
        const d = Math.hypot(e.pos.x - s.pos.x, e.pos.y - s.pos.y);
        if (d <= s.radius) {
          e.slowRemaining = Math.max(e.slowRemaining, 0.5);
          e.alertness = Math.max(0, e.alertness - dt * 1.5);
          // Refresh a short disorient (kept at 0.6s so it ends quickly
          // once the enemy leaves the cloud — bosses are immune).
          if (!e.isBoss) {
            if (e.disorientRemaining < 0.6) {
              e.disorientRemaining = 0.6;
              if (e.disorientRemaining === 0.6 && Math.random() < 0.5) {
                e.disorientAng = Math.random() * Math.PI * 2;
              }
            }
          }
        }
      }
    }
    this.smokeClouds = this.smokeClouds.filter(s => s.life > 0);
  }

  updateAmmoPickups(dt: number) {
    const PICKUP_R = 22;
    const MAGNET_R = 110;
    for (const p of this.ammoPickups) {
      p.life -= dt;
      const dx = this.player.pos.x - p.pos.x;
      const dy = this.player.pos.y - p.pos.y;
      const d = Math.hypot(dx, dy);
      if (d < MAGNET_R && d > 0.01) {
        const pull = 220;
        p.pos.x += (dx / d) * pull * dt;
        p.pos.y += (dy / d) * pull * dt;
      }
      if (d < PICKUP_R) {
        // Refill the slot it was tagged to. Fall back to the active slot if
        // the player has rearranged loadouts since it was dropped.
        let slot = p.forSlot;
        if (!this.stats.secondaryIds[slot]) slot = this.stats.secondaryActiveSlot;
        if (this.stats.secondaryIds[slot]) {
          this.stats.secondaryAmmo[slot] = Math.min(
            this.stats.secondaryAmmoMax[slot],
            this.stats.secondaryAmmo[slot] + p.amount,
          );
          audio.play("levelUp");
        }
        p.life = 0;
      }
    }
    this.ammoPickups = this.ammoPickups.filter(p => p.life > 0);
  }

  // Roll for an ammo drop on enemy death. Higher chance for elites/bosses.
  // Drops are always tagged to the active slot — no point dropping ammo for
  // a weapon the player isn't currently using.
  maybeDropAmmoPickup(e: Enemy) {
    const slot = this.stats.secondaryActiveSlot;
    const id = this.stats.secondaryIds[slot];
    if (!id) return;
    const def = SECONDARIES[id];
    // Don't bother dropping if already full.
    if (this.stats.secondaryAmmo[slot] >= this.stats.secondaryAmmoMax[slot]) return;
    const baseChance = e.isBoss ? 1.0 : (e.size > 16 ? 0.18 : 0.10);
    if (Math.random() > baseChance) return;
    // Amount scales with weapon's max — bigger boxes for bigger ammo pools.
    const amount = Math.max(1, Math.round(def.maxAmmo * (e.isBoss ? 0.5 : 0.18)));
    this.ammoPickups.push({
      pos: { x: e.pos.x, y: e.pos.y },
      life: 12,
      amount,
      forSlot: slot,
    });
  }

  // ============= Consumable drops =============
  // Heavy/elite/boss enemies have a chance to drop a consumable pickup. The
  // player walks over it (or magnet pulls it) to add it to their inventory.
  // If the inventory is full, the pickup persists on the ground until used.
  maybeDropConsumable(e: Enemy) {
    let chance = 0;
    if (e.archetype === "final") chance = 1.0;
    else if (e.isBoss) chance = 0.85;
    else if (e.archetype === "heavy" || e.archetype === "shielded") chance = 0.18;
    else if (e.archetype === "assassin" || e.archetype === "archer") chance = 0.10;
    else if (e.size > 16) chance = 0.06;
    else chance = 0.025;
    if (Math.random() > chance) return;
    const id = rollConsumable();
    const a = Math.random() * Math.PI * 2;
    const speed = 80 + Math.random() * 60;
    this.consumablePickups.push({
      pos: { x: e.pos.x, y: e.pos.y },
      vel: { x: Math.cos(a) * speed, y: Math.sin(a) * speed },
      life: 25,
      bobPhase: Math.random() * Math.PI * 2,
      id,
    });
  }

  updateConsumablePickups(dt: number) {
    if (this.consumablePickups.length === 0) return;
    const PICKUP_R = 22;
    const MAGNET_R = 130;
    for (const p of this.consumablePickups) {
      p.life -= dt;
      // Scatter velocity drag
      p.vel.x *= Math.pow(0.05, dt);
      p.vel.y *= Math.pow(0.05, dt);
      p.pos.x += p.vel.x * dt;
      p.pos.y += p.vel.y * dt;
      const dx = this.player.pos.x - p.pos.x;
      const dy = this.player.pos.y - p.pos.y;
      const d = Math.hypot(dx, dy);
      if (d < MAGNET_R && d > 0.01) {
        const pull = 240;
        p.pos.x += (dx / d) * pull * dt;
        p.pos.y += (dy / d) * pull * dt;
      }
      if (d < PICKUP_R) {
        // Place into the first empty inventory slot. If full, ignore (the
        // pickup keeps drifting until either a slot opens or it expires).
        const slot = this.stats.consumables.findIndex((c) => c === null);
        if (slot !== -1) {
          this.stats.consumables[slot] = p.id;
          audio.play("monPing");
          this.spawnFloatText(this.player.pos, `+${CONSUMABLES[p.id].kanji}`, {
            color: CONSUMABLES[p.id].accent, size: 14, jp: true, vy: -65,
          });
          p.life = 0;
        }
      }
    }
    this.consumablePickups = this.consumablePickups.filter((p) => p.life > 0);
  }

  // Use the consumable in the given slot (0..CONSUMABLE_SLOTS-1). No-op if empty
  // or the game isn't actively running (paused / shop / level-up).
  useConsumable(slot: number) {
    if (this.stats.state !== "playing") return;
    if (slot < 0 || slot >= this.stats.consumables.length) return;
    const id = this.stats.consumables[slot];
    if (!id) return;
    const def = CONSUMABLES[id];
    switch (id) {
      case "rice_ball": {
        const heal = 35;
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + heal);
        this.spawnFloatText(this.player.pos, `+${heal}`, {
          color: "hsl(140 80% 65%)", size: 16, vy: -65,
        });
        break;
      }
      case "sake":
        this.stats.buffSakeRemaining = 8;
        break;
      case "smoke_pellet": {
        this.stats.buffSmokeRemaining = 2.5;
        this.player.invuln = Math.max(this.player.invuln, 2.5);
        // Drop a single smoke cloud at the player's feet (reuses smokeClouds).
        this.smokeClouds.push({
          pos: { x: this.player.pos.x, y: this.player.pos.y },
          radius: 110, life: 3.5, maxLife: 3.5,
        });
        break;
      }
      case "spirit_pearl":
        this.stats.ultCharge = this.stats.ultMax;
        this.stats.ultReady = true;
        break;
      case "iron_powder":
        this.stats.blockHp = this.stats.blockHpMax;
        this.stats.buffIronPowderRemaining = 10;
        break;
      case "wind_charm":
        this.stats.buffWindCharmRemaining = 8;
        break;
    }
    this.stats.consumables[slot] = null;
    audio.play("levelUp");
    this.flash(def.name);
    this.emitStats();
  }

  // Tick active consumable buffs and bleed them off. Called each update().
  tickConsumableBuffs(dt: number) {
    if (this.stats.buffSakeRemaining > 0)
      this.stats.buffSakeRemaining = Math.max(0, this.stats.buffSakeRemaining - dt);
    if (this.stats.buffSmokeRemaining > 0)
      this.stats.buffSmokeRemaining = Math.max(0, this.stats.buffSmokeRemaining - dt);
    if (this.stats.buffIronPowderRemaining > 0)
      this.stats.buffIronPowderRemaining = Math.max(0, this.stats.buffIronPowderRemaining - dt);
    if (this.stats.buffWindCharmRemaining > 0)
      this.stats.buffWindCharmRemaining = Math.max(0, this.stats.buffWindCharmRemaining - dt);
  }

  // ============= Resume-run save (Phase 4) =============
  // Snapshot the player's current run between waves so they can come back
  // later via "Continue Run" on the main menu. Only safe to call from a
  // wave boundary — mid-wave state (enemies on screen, ult timers, in-flight
  // VFX) is intentionally NOT persisted; those reset cleanly on resume.
  persistResumeSnapshot() {
    try {
      saveRun({
        classId: this.lastClassId,
        secondaryId: this.lastSecondaryId,
        wave: this.stats.wave,
        level: this.stats.level,
        xp: this.stats.xp,
        xpToNext: this.stats.xpToNext,
        hp: this.player.hp,
        maxHp: this.player.maxHp,
        mon: this.stats.mon,
        honor: this.stats.honor,
        ghost: this.stats.ghost,
        ultCharge: this.stats.ultCharge,
        ultMax: this.stats.ultMax,
        blockHp: this.stats.blockHp,
        blockHpMax: this.stats.blockHpMax,
        equippedAbilities: [...this.stats.equippedAbilities],
        secondaryIds: [...this.stats.secondaryIds],
        secondaryAmmo: [...this.stats.secondaryAmmo],
        secondaryAmmoMax: [...this.stats.secondaryAmmoMax],
        secondaryReload: [...this.stats.secondaryReload],
        secondaryReloadMax: [...this.stats.secondaryReloadMax],
        secondaryActiveSlot: this.stats.secondaryActiveSlot,
        consumables: [...this.stats.consumables],
        perks: { ...(this.perks as unknown as Record<string, unknown>) },
        acquiredPerks: [...this.acquiredPerks],
        pendingLevelUps: this.pendingLevelUps,
      });
    } catch (err) {
      console.warn("[GhostGame] persistResumeSnapshot failed:", err);
    }
  }

  // Boot a fresh run from a saved snapshot. Calls start() under the hood
  // (so all transient state initializes cleanly) then overlays the saved
  // numeric/inventory state on top before re-spawning the saved wave.
  resumeFromSave(s: SavedRun) {
    // Bring the engine up with the right class + starting secondary so all
    // class-conditional spawns (Kagebushi clone, Miko barrier) initialize.
    this.start(s.classId, s.secondaryId);
    // Overlay numeric perks (captures shop-bought upgrades that aren't in
    // acquiredPerks). Spread carefully — keep keys we don't recognize so
    // forward-compat survives.
    Object.assign(this.perks as unknown as Record<string, unknown>, s.perks);
    this.acquiredPerks = [...s.acquiredPerks];
    this.pendingLevelUps = s.pendingLevelUps ?? 0;
    // Stats snapshot
    this.stats.wave = s.wave;
    this.stats.level = s.level;
    this.stats.xp = s.xp;
    this.stats.xpToNext = s.xpToNext;
    this.stats.mon = s.mon;
    this.stats.honor = s.honor;
    this.stats.ghost = s.ghost;
    this.stats.ultCharge = s.ultCharge;
    this.stats.ultMax = s.ultMax;
    this.stats.ultReady = s.ultCharge >= s.ultMax;
    this.stats.blockHpMax = s.blockHpMax;
    this.stats.blockHp = Math.min(s.blockHpMax, s.blockHp);
    this.stats.equippedAbilities = [...s.equippedAbilities];
    // Reset cooldown table for restored abilities so the player isn't
    // gated on a stale CD.
    this.stats.abilityCd = {};
    for (const id of this.stats.equippedAbilities) this.stats.abilityCd[id] = 0;
    this.stats.secondaryIds = [...s.secondaryIds] as (SecondaryId | null)[];
    this.stats.secondaryAmmo = [...s.secondaryAmmo];
    this.stats.secondaryAmmoMax = [...s.secondaryAmmoMax];
    this.stats.secondaryReload = [...s.secondaryReload];
    this.stats.secondaryReloadMax = [...s.secondaryReloadMax];
    this.stats.secondaryActiveSlot = s.secondaryActiveSlot;
    this.stats.consumables = [...s.consumables];
    // Player vitals
    this.stats.maxHp = s.maxHp;
    this.stats.hp = Math.min(s.maxHp, s.hp);
    this.player.maxHp = s.maxHp;
    this.player.hp = this.stats.hp;
    // Mirror perk badges
    this.stats.perks = [...this.acquiredPerks];
    // Re-spawn the saved wave fresh (clears the wave-1 enemies start()
    // already spawned).
    for (const e of this.enemies) e.state = "dead";
    this.enemies = [];
    this.applyBiome(s.wave);
    this.spawnWave(s.wave);
    this.onActiveSecondaryChanged();
    this.emitStats();
  }

  // ============= XP orbs =============
  // Drop a cluster of orbs whose total XP equals e.xpReward. Bosses drop more,
  // bigger orbs that scatter further so the player can see them clearly.
  dropXpOrbs(e: Enemy) {
    const total = Math.max(1, e.xpReward);
    const isBig = e.isBoss;
    // Number of orbs: bosses 6–10, elites 2–3, normals 1–2.
    let count: number;
    if (isBig) count = 6 + Math.floor(Math.random() * 5);
    else if (e.size > 16 || e.archetype !== "normal") count = 2 + Math.floor(Math.random() * 2);
    else count = 1 + (Math.random() < 0.35 ? 1 : 0);
    const per = Math.max(1, Math.floor(total / count));
    let remainder = total - per * count;
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * (isBig ? 120 : 70);
      const amount = per + (remainder > 0 ? 1 : 0);
      if (remainder > 0) remainder--;
      const size = isBig ? 3 : (e.size > 16 ? 2 : 1);
      this.xpOrbs.push({
        pos: { x: e.pos.x, y: e.pos.y },
        vel: { x: Math.cos(a) * speed, y: Math.sin(a) * speed },
        life: 30,
        amount,
        bobPhase: Math.random() * Math.PI * 2,
        size,
      });
    }
  }

  // Per-frame: scatter velocity decays, magnet pulls toward player, contact collects.
  // Magnet radius is generous so orbs feel rewarding to chase.
  updateXpOrbs(dt: number) {
    const PICKUP_R = 20;
    const MAGNET_R = 130;
    for (const o of this.xpOrbs) {
      o.life -= dt;
      // Scatter velocity drag
      o.vel.x *= Math.pow(0.04, dt);
      o.vel.y *= Math.pow(0.04, dt);
      o.pos.x += o.vel.x * dt;
      o.pos.y += o.vel.y * dt;
      const dx = this.player.pos.x - o.pos.x;
      const dy = this.player.pos.y - o.pos.y;
      const d = Math.hypot(dx, dy);
      if (d < MAGNET_R && d > 0.01) {
        const pull = 260 * (1 + (1 - d / MAGNET_R));
        o.pos.x += (dx / d) * pull * dt;
        o.pos.y += (dy / d) * pull * dt;
      }
      if (d < PICKUP_R) {
        this.gainXp(o.amount);
        audio.play("levelUp");
        o.life = 0;
      }
    }
    this.xpOrbs = this.xpOrbs.filter(o => o.life > 0);
  }

  // Wave-end cleanup: instantly defeat any remaining enemies (no rewards lost
  // — kills route through killEnemy which drops orbs/mon as usual) and then
  // auto-collect every XP orb on the field so the player keeps everything they
  // earned this wave.
  cleanupWaveEnd() {
    // Snapshot the list — killEnemy mutates orb arrays mid-loop.
    const alive = this.enemies.filter(e => e.state !== "dead" && e.archetype !== "final");
    for (const e of alive) {
      // Spawn a small dissipation puff so it reads as "they vanish".
      this.spawnBlood(e.pos, Math.random() * Math.PI * 2, 6);
      this.killEnemy(e, "honor");
    }
    // Auto-collect every remaining orb (after the kill loop so newly-dropped
    // orbs are also swept up).
    let swept = 0;
    for (const o of this.xpOrbs) {
      this.gainXp(o.amount);
      swept += o.amount;
    }
    if (swept > 0) audio.play("levelUp");
    this.xpOrbs = [];
  }

  // ============= Render — secondaries =============
  drawSecondaries() {
    const ctx = this.ctx;

    // Smoke clouds (drawn under everything else)
    for (const s of this.smokeClouds) {
      const t = s.life / s.maxLife;
      const r = s.radius * (1 + (1 - t) * 0.15);
      const grd = ctx.createRadialGradient(s.pos.x, s.pos.y, r * 0.2, s.pos.x, s.pos.y, r);
      grd.addColorStop(0, `hsla(220, 15%, 75%, ${0.55 * t})`);
      grd.addColorStop(1, `hsla(220, 15%, 50%, 0)`);
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(s.pos.x, s.pos.y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Caltrop fields (faint reddish ground burr)
    for (const c of this.caltrops) {
      const t = c.life / c.maxLife;
      ctx.strokeStyle = `hsla(355, 70%, 45%, ${0.4 * t})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(c.pos.x, c.pos.y, c.radius, 0, Math.PI * 2);
      ctx.stroke();
      // tiny crosses inside
      ctx.fillStyle = `hsla(355, 80%, 60%, ${0.6 * t})`;
      for (let i = 0; i < 6; i++) {
        const ang = (i / 6) * Math.PI * 2;
        const rr = c.radius * 0.55;
        ctx.fillRect(c.pos.x + Math.cos(ang) * rr - 1.5, c.pos.y + Math.sin(ang) * rr - 1.5, 3, 3);
      }
    }

    // Projectiles
    for (const pr of this.secProjectiles) {
      const t = pr.life / pr.maxLife;
      // Trail (sumi-e ink streak)
      if (pr.trail.length > 1) {
        ctx.strokeStyle = `hsla(0, 0%, 5%, ${0.55 * t})`;
        ctx.lineWidth = pr.kind === "arrow" ? 2 : 1.5;
        ctx.beginPath();
        ctx.moveTo(pr.trail[0].x, pr.trail[0].y);
        for (let i = 1; i < pr.trail.length; i++) ctx.lineTo(pr.trail[i].x, pr.trail[i].y);
        ctx.stroke();
      }
      const ang = Math.atan2(pr.vel.y, pr.vel.x);
      ctx.save();
      ctx.translate(pr.pos.x, pr.pos.y);
      ctx.rotate(ang);
      if (pr.kind === "arrow") {
        ctx.fillStyle = "hsl(0, 0%, 8%)";
        ctx.fillRect(-14, -1, 22, 2);
        ctx.fillStyle = "hsl(36, 80%, 70%)";
        ctx.beginPath();
        ctx.moveTo(8, 0); ctx.lineTo(2, -3); ctx.lineTo(2, 3); ctx.closePath();
        ctx.fill();
      } else if (pr.kind === "bolt") {
        ctx.fillStyle = "hsl(36, 80%, 60%)";
        ctx.fillRect(-8, -1.5, 14, 3);
      } else if (pr.kind === "hook") {
        ctx.strokeStyle = "hsl(0, 0%, 60%)";
        ctx.lineWidth = 1;
        // chain back to player
        const px = this.player.pos.x - pr.pos.x;
        const py = this.player.pos.y - pr.pos.y;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(-ang) * px - Math.sin(-ang) * py, Math.sin(-ang) * px + Math.cos(-ang) * py);
        ctx.stroke();
        ctx.fillStyle = "hsl(0, 75%, 45%)";
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fill();
      } else if (pr.kind === "shuriken") {
        // 4-pointed spinning star
        ctx.rotate(pr.spinAng ?? 0);
        ctx.fillStyle = "hsl(190, 60%, 70%)";
        ctx.strokeStyle = "hsl(0, 0%, 5%)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let k = 0; k < 4; k++) {
          const a = (k / 4) * Math.PI * 2;
          const ax = Math.cos(a) * 9, ay = Math.sin(a) * 9;
          const b = a + Math.PI / 4;
          const bx = Math.cos(b) * 3, by = Math.sin(b) * 3;
          if (k === 0) ctx.moveTo(ax, ay); else ctx.lineTo(ax, ay);
          ctx.lineTo(bx, by);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (pr.kind === "spear") {
        // long shaft + flaming tip
        ctx.fillStyle = "hsl(30, 30%, 25%)";
        ctx.fillRect(-18, -1.2, 26, 2.4);
        ctx.fillStyle = "hsl(15, 95%, 55%)";
        ctx.beginPath();
        ctx.moveTo(12, 0); ctx.lineTo(4, -4); ctx.lineTo(4, 4); ctx.closePath();
        ctx.fill();
        // ember halo
        const grad = ctx.createRadialGradient(8, 0, 0, 8, 0, 12);
        grad.addColorStop(0, "hsla(20, 100%, 70%, 0.7)");
        grad.addColorStop(1, "hsla(20, 100%, 50%, 0)");
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(8, 0, 12, 0, Math.PI * 2); ctx.fill();
      } else if (pr.kind === "dart") {
        // tiny tufted dart
        ctx.fillStyle = "hsl(120, 50%, 30%)";
        ctx.fillRect(-5, -0.7, 9, 1.4);
        ctx.fillStyle = "hsl(120, 60%, 55%)";
        ctx.beginPath();
        ctx.moveTo(5, 0); ctx.lineTo(0, -1.6); ctx.lineTo(0, 1.6); ctx.closePath();
        ctx.fill();
      } else {
        // kunai
        ctx.fillStyle = "hsl(260, 25%, 25%)";
        ctx.beginPath();
        ctx.moveTo(7, 0); ctx.lineTo(-5, -2.5); ctx.lineTo(-5, 2.5); ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }

    // Phase 8 — enemy projectiles (archer arrows + final-boss orbs)
    for (const ep of this.enemyProjectiles) {
      const t = Math.max(0, Math.min(1, ep.life / ep.maxLife));
      if (ep.trail.length > 1) {
        ctx.strokeStyle = ep.kind === "orb"
          ? `hsla(355, 90%, 55%, ${0.55 * t})`
          : `hsla(0, 0%, 5%, ${0.55 * t})`;
        ctx.lineWidth = ep.kind === "orb" ? 3 : 2;
        ctx.beginPath();
        ctx.moveTo(ep.trail[0].x, ep.trail[0].y);
        for (let i = 1; i < ep.trail.length; i++) ctx.lineTo(ep.trail[i].x, ep.trail[i].y);
        ctx.stroke();
      }
      ctx.save();
      ctx.translate(ep.pos.x, ep.pos.y);
      const ang = Math.atan2(ep.vel.y, ep.vel.x);
      ctx.rotate(ang);
      if (ep.kind === "arrow") {
        ctx.fillStyle = "hsl(0, 0%, 8%)";
        ctx.fillRect(-12, -1, 18, 2);
        ctx.fillStyle = "hsl(355, 70%, 50%)";
        ctx.beginPath();
        ctx.moveTo(8, 0); ctx.lineTo(2, -3); ctx.lineTo(2, 3); ctx.closePath();
        ctx.fill();
      } else {
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, ep.size * 1.8);
        grad.addColorStop(0, "hsla(355, 100%, 75%, 0.95)");
        grad.addColorStop(0.5, "hsla(358, 90%, 45%, 0.7)");
        grad.addColorStop(1, "hsla(358, 90%, 30%, 0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, ep.size * 1.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "hsl(36, 95%, 75%)";
        ctx.beginPath();
        ctx.arc(0, 0, ep.size * 0.45, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // Arc bombs (with shadow on the ground)
    for (const b of this.arcBombs) {
      ctx.fillStyle = "hsla(0, 0%, 0%, 0.35)";
      ctx.beginPath();
      ctx.ellipse(b.pos.x, b.pos.y, 7, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "hsl(20, 60%, 25%)";
      ctx.beginPath();
      ctx.arc(b.pos.x, b.pos.y - b.height, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "hsl(20, 90%, 65%)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(b.pos.x + 5, b.pos.y - b.height - 5);
      ctx.lineTo(b.pos.x + 9, b.pos.y - b.height - 9);
      ctx.stroke();
    }

    // Ammo pickups — small floating crate w/ pulsing ring
    for (const p of this.ammoPickups) {
      const pulse = 0.7 + 0.3 * Math.sin(this.elapsed * 6);
      ctx.strokeStyle = `hsla(45, 95%, 60%, ${0.7 * pulse})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(p.pos.x, p.pos.y, 12 * pulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "hsl(36, 70%, 45%)";
      ctx.fillRect(p.pos.x - 5, p.pos.y - 5, 10, 10);
      ctx.fillStyle = "hsl(45, 95%, 70%)";
      ctx.font = "bold 9px serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("矢", p.pos.x, p.pos.y + 0.5);
    }

    // XP orbs — glowing jade motes that bob and pulse.
    for (const o of this.xpOrbs) {
      const bob = Math.sin(this.elapsed * 4 + o.bobPhase) * 1.5;
      const baseR = o.size === 3 ? 7 : o.size === 2 ? 5 : 3.5;
      const pulse = 0.85 + 0.15 * Math.sin(this.elapsed * 5 + o.bobPhase);
      const r = baseR * pulse;
      const fade = o.life < 4 ? Math.max(0.25, o.life / 4) : 1;
      const grd = ctx.createRadialGradient(o.pos.x, o.pos.y + bob, 0, o.pos.x, o.pos.y + bob, r * 3.5);
      grd.addColorStop(0, `hsla(155, 80%, 65%, ${0.55 * fade})`);
      grd.addColorStop(1, `hsla(155, 80%, 50%, 0)`);
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(o.pos.x, o.pos.y + bob, r * 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `hsla(150, 90%, 70%, ${fade})`;
      ctx.beginPath();
      ctx.arc(o.pos.x, o.pos.y + bob, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `hsla(60, 100%, 92%, ${fade})`;
      ctx.beginPath();
      ctx.arc(o.pos.x, o.pos.y + bob, r * 0.45, 0, Math.PI * 2);
      ctx.fill();
    }

    // Consumable pickups — bobbing kanji disks tinted by the item's accent.
    for (const p of this.consumablePickups) {
      const def = CONSUMABLES[p.id];
      const bob = Math.sin(this.elapsed * 3 + p.bobPhase) * 2;
      const pulse = 0.85 + 0.15 * Math.sin(this.elapsed * 4 + p.bobPhase);
      const r = 11 * pulse;
      const fade = p.life < 4 ? Math.max(0.3, p.life / 4) : 1;
      const cx = p.pos.x;
      const cy = p.pos.y + bob;
      // Outer halo
      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 3.4);
      grd.addColorStop(0, def.accent.replace(")", ` / ${0.55 * fade})`).replace("hsl(", "hsla("));
      grd.addColorStop(1, def.accent.replace(")", " / 0)").replace("hsl(", "hsla("));
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 3.4, 0, Math.PI * 2);
      ctx.fill();
      // Disk
      ctx.fillStyle = `hsla(20, 30%, 8%, ${0.85 * fade})`;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      // Rim
      ctx.strokeStyle = def.accent.replace(")", ` / ${fade})`).replace("hsl(", "hsla(");
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
      // Kanji
      ctx.save();
      ctx.globalAlpha = fade;
      ctx.fillStyle = def.accent;
      ctx.font = "bold 13px serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(def.kanji, cx, cy + 0.5);
      ctx.restore();
    }
  }

  // ============================================================
  // Shop (Phase 4) — opens between waves, lets the player spend Mon.
  // ============================================================
  openShop() {
    // Don't open during levelup/swap; queue isn't necessary because shop only
    // runs after a wave ends and we never run two intermissions back-to-back.
    if (this.stats.state !== "playing") return;
    const equipped = this.stats.secondaryIds.filter((s): s is SecondaryId => !!s);
    this.stats.shopOffer = rollShopOffer(6, equipped);
    this.stats.shopRerollCost = SHOP_REROLL_COST;
    this.stats.shopPurchasedIds = [];
    this.stats.state = "shop";
    audio.play("levelUp");
    this.emitStats();
  }

  rerollShop() {
    if (this.stats.state !== "shop") return;
    if (this.stats.mon < this.stats.shopRerollCost) return;
    this.stats.mon -= this.stats.shopRerollCost;
    const equipped = this.stats.secondaryIds.filter((s): s is SecondaryId => !!s);
    this.stats.shopOffer = rollShopOffer(6, equipped);
    // Slight escalation so reroll spam isn't free.
    this.stats.shopRerollCost = Math.round(this.stats.shopRerollCost * 1.5);
    this.stats.shopPurchasedIds = [];
    audio.play("slash");
    this.emitStats();
  }

  buyShopItem(itemId: string) {
    if (this.stats.state !== "shop") return;
    const item = this.stats.shopOffer.find(i => i.id === itemId);
    if (!item) return;
    if (this.stats.shopPurchasedIds.includes(itemId)) return;
    if (this.stats.mon < item.price) return;
    // Ability scrolls — block purchase if the player already owns the ability,
    // or if both ability slots are full. UI-side it remains visible but the
    // engine refuses, preventing wasted Mon.
    if (item.effect.startsWith("ability_")) {
      const abilityId = item.effect.replace("ability_", "");
      const equipped = this.stats.equippedAbilities;
      if (equipped.includes(abilityId)) {
        this.flash("Already learned");
        return;
      }
      if (equipped.length >= 2) {
        this.flash("Loadout full — level up to swap");
        return;
      }
    }
    // Secondary weapon scrolls — block re-buying a weapon you already carry.
    // Equipping into a full second slot is allowed (it replaces) — we surface
    // that in the description so the player knows.
    if (item.effect.startsWith("secondary_")) {
      const wid = item.effect.replace("secondary_", "") as SecondaryId;
      if (this.stats.secondaryIds.includes(wid)) {
        this.flash("Already carried");
        return;
      }
    }
    this.stats.mon -= item.price;
    this.stats.shopPurchasedIds.push(itemId);
    try {
      this.applyShopEffect(item);
    } catch (err) {
      // Never let a single bad shop effect black-screen the game by killing
      // the render loop. Refund the purchase and surface the error.
      console.error("[Shop] applyShopEffect threw for", item.effect, err);
      this.stats.mon += item.price;
      this.stats.shopPurchasedIds = this.stats.shopPurchasedIds.filter(i => i !== itemId);
      this.flash("Purchase failed");
    }
    // Defensive clamp + finalize. Wrapped in try/catch so even an audio
    // failure or a NaN downstream can never blackscreen the React tree.
    try {
      if (!Number.isFinite(this.perks.secondaryDmgMul) || this.perks.secondaryDmgMul <= 0) {
        this.perks.secondaryDmgMul = 1;
      }
      this.perks.secondaryDmgMul = Math.min(10, this.perks.secondaryDmgMul);
      // Same defensive clamp on every other multiplier touched by shop items.
      if (!Number.isFinite(this.perks.classDamageMul) || this.perks.classDamageMul <= 0) this.perks.classDamageMul = 1;
      if (!Number.isFinite(this.perks.attackCooldownMul) || this.perks.attackCooldownMul <= 0) this.perks.attackCooldownMul = 1;
      if (!Number.isFinite(this.perks.speedMul) || this.perks.speedMul <= 0) this.perks.speedMul = 1;
      if (!Number.isFinite(this.perks.secondaryRegenMul) || this.perks.secondaryRegenMul <= 0) this.perks.secondaryRegenMul = 1;
      if (!Number.isFinite(this.perks.damageTakenMul) || this.perks.damageTakenMul <= 0) this.perks.damageTakenMul = 1;
      audio.play("levelUp");
      this.emitStats();
    } catch (err) {
      console.error("[Shop] finalize threw", err);
    }
  }

  closeShop() {
    if (this.stats.state !== "shop") return;
    this.stats.state = "playing";
    this.stats.shopOffer = [];
    this.stats.shopPurchasedIds = [];
    this.spawnWave(this.stats.wave + 1);
    // Re-save now that the shop has been spent — resumed runs will reload
    // into the just-spawned wave with the up-to-date inventory & perks.
    this.persistResumeSnapshot();
  }

  private applyShopEffect(item: ShopItem) {
    const p = this.player;
    switch (item.effect) {
      case "heal_full":
        p.hp = p.maxHp;
        break;
      case "heal_half":
        p.hp = Math.min(p.maxHp, p.hp + Math.floor(p.maxHp * 0.4));
        break;
      // ===== Stats rework — rarity-tiered upgrades =====
      case "hp_common":
        this.perks.maxHpBonus = Math.round(this.perks.maxHpBonus + (100 + this.perks.maxHpBonus) * 0.15);
        p.maxHp = 100 + this.perks.maxHpBonus;
        p.hp = p.maxHp;
        break;
      case "hp_rare":
        this.perks.maxHpBonus += 5;
        p.maxHp = 100 + this.perks.maxHpBonus;
        p.hp = Math.min(p.maxHp, p.hp + 5);
        break;
      case "hp_leg":
        this.perks.maxHpBonus += 25;
        p.maxHp = 100 + this.perks.maxHpBonus;
        p.hp = Math.min(p.maxHp, p.hp + 25);
        break;
      case "dmg_katana_common":
        this.perks.damage = Math.min(MAX_KATANA_DAMAGE, Math.round(this.perks.damage * 1.15));
        break;
      case "dmg_katana_rare":
        this.perks.damage = Math.min(MAX_KATANA_DAMAGE, this.perks.damage + 5);
        break;
      case "dmg_katana_leg":
        this.perks.damage = Math.min(MAX_KATANA_DAMAGE, this.perks.damage + 25);
        break;
      case "dex_common":
        this.perks.dexterity = Math.round((this.perks.dexterity || 0) * 1.15) + (this.perks.dexterity === 0 ? 2 : 0);
        break;
      case "dex_rare":
        this.perks.dexterity += 5;
        break;
      case "dex_leg":
        this.perks.dexterity += 25;
        break;
      case "spd_common":
        this.perks.speedMul *= 1.15;
        break;
      case "spd_rare":
        this.perks.speedMul += 0.05;
        break;
      case "spd_leg":
        this.perks.speedMul += 0.25;
        break;
      case "def_rare":
        this.perks.defense += 5;
        break;
      case "def_leg":
        this.perks.defense += 25;
        break;
      case "crit":
        this.perks.critChance = Math.min(0.9, this.perks.critChance + 0.08);
        break;
      case "ult_charge":
        this.addUltCharge(this.stats.ultMax * 0.5);
        break;
      case "ammo_refill":
        for (let s = 0; s < this.stats.secondaryIds.length; s++) {
          if (this.stats.secondaryIds[s]) {
            this.stats.secondaryAmmo[s] = this.stats.secondaryAmmoMax[s];
          }
        }
        break;
      case "ammo_cap":
        this.perks.secondaryAmmoBonus += 2;
        for (let s = 0; s < this.stats.secondaryIds.length; s++) {
          if (this.stats.secondaryIds[s]) {
            this.stats.secondaryAmmoMax[s] += 2;
            this.stats.secondaryAmmo[s] += 2;
          }
        }
        break;
      case "ammo_regen":
        this.perks.secondaryRegenMul *= 0.75;
        break;
      case "secondary_dmg_global":
        this.perks.secondaryDmgMul *= 1.15;
        break;
      case "lifesteal":
        this.perks.healOnKill += 1;
        break;
      case "hp_regen":
        this.perks.hpRegen += 0.5;
        break;
      // ===== Shop perks (perk_*) — implemented as safe stat boosts so
      // none of them can ever crash the game or silently no-op. The
      // descriptions in shop.ts hint at richer mechanics; these
      // simplified implementations preserve the spirit (offense /
      // defense / utility) until full mechanics ship.
      case "perk_crimson_blade":
        // "Bloods your blade" → +10% sword damage.
        this.perks.damage = Math.min(
          MAX_KATANA_DAMAGE,
          Math.max(this.perks.damage, Math.round(this.perks.damage * 1.10)),
        );
        this.perks.classDamageMul *= 1.05;
        this.flash("Crimson Blade");
        break;
      case "perk_stone_stance":
        // "−20% dmg taken / +15% dmg dealt" → permanent partial buff,
        // clamped by the global 15% damage-reduction cap.
        this.perks.damageTakenMul *= 0.90;
        this.perks.classDamageMul *= 1.10;
        this.flash("Stone Stance");
        break;
      case "perk_ghost_steps":
        this.perks.speedMul *= 1.10;
        this.flash("Ghost Steps");
        break;
      case "perk_void_shard":
        this.perks.invulnBonus += 0.25;
        this.flash("Void Shard");
        break;
      case "perk_hungry_blade":
        this.perks.healOnKill += 1;
        this.flash("Hungry Blade");
        break;
      case "perk_war_paint":
        this.perks.classDamageMul *= 1.08;
        this.flash("War Paint");
        break;
      case "perk_cursed_eye":
        this.perks.critChance = Math.min(0.9, this.perks.critChance + 0.05);
        this.perks.classDamageMul *= 1.05;
        this.flash("Cursed Eye");
        break;
      case "perk_raging_current":
        this.perks.attackCooldownMul = Math.max(MIN_ATTACK_COOLDOWN_MUL, this.perks.attackCooldownMul * 0.90);
        this.flash("Raging Current");
        break;
      case "perk_twin_fang":
        this.perks.secondaryDmgMul *= 1.25;
        this.flash("Twin Fang");
        break;
      case "perk_bone_armor":
        // Survive-once → grant Second Wind which already exists.
        this.perks.secondWindAvailable = true;
        this.perks.hasSecondWind = true;
        this.flash("Bone Armor");
        break;
      case "perk_drifting_leaves":
        this.perks.knockbackMul *= 1.20;
        this.perks.speedMul *= 1.05;
        this.flash("Drifting Leaves");
        break;
      case "perk_soul_collector": {
        // "+2 max HP per 25 kills" → grant a flat +30 maxHP burst now,
        // clamped to the global HP cap.
        this.perks.maxHpBonus = Math.min(MAX_HP_CAP - 100, this.perks.maxHpBonus + 30);
        if (this.player) {
          this.player.maxHp = Math.min(MAX_HP_CAP, 100 + this.perks.maxHpBonus);
          this.player.hp = Math.min(this.player.maxHp, this.player.hp + 30);
        }
        this.flash("Soul Collector");
        break;
      }
      default: {
        // Per-weapon damage upgrades (dmg_<wid>_<rarity>). The shop only
        // shows these for currently-equipped secondaries (filtered at roll
        // time), but applying again is also safe.
        const m = /^dmg_([a-z_]+)_(common|rare|leg)$/.exec(item.effect);
        if (m) {
          const wid = m[1] as SecondaryId;
          const tier = m[2];
          const cur = this.perks.weaponDamageBonus[wid] || 0;
          if (tier === "common") {
            // +15% of the weapon's *current* effective damage on the
            // bonus channel — keeps it interesting late game.
            const def = SECONDARIES[wid];
            const base = this.perks.damage * def.damageMul * def.dmgScale;
            this.perks.weaponDamageBonus[wid] = cur + Math.max(1, Math.round(base * 0.15));
          } else if (tier === "rare") {
            this.perks.weaponDamageBonus[wid] = cur + 5;
          } else {
            this.perks.weaponDamageBonus[wid] = cur + 25;
          }
          this.flash(`${SECONDARIES[wid].name} +dmg`);
          break;
        }
        // Secondary weapon scrolls — equip into the first empty slot, or
        // replace slot 1 (Tab slot) if both slots are full. Slot 0 (the
        // starting weapon picked at class select) is always preserved so the
        // player never loses their thematic kit.
        if (item.effect.startsWith("secondary_")) {
          const wid = item.effect.replace("secondary_", "") as SecondaryId;
          const def = SECONDARIES[wid];
          let slot = this.stats.secondaryIds.findIndex(s => s === null);
          if (slot === -1) {
            // Both slots full. Replace same-class slot so the player keeps one
            // ranged + one melee where possible. Confirmation prompt in the
            // shop UI already warned them when this would replace ranged.
            const newIsMelee = isMeleeSecondary(wid);
            const sameKindSlot = this.stats.secondaryIds.findIndex(
              (s) => s !== null && isMeleeSecondary(s) === newIsMelee,
            );
            slot = sameKindSlot !== -1 ? sameKindSlot : 1;
          }
          this.stats.secondaryIds[slot] = wid;
          const cap = def.maxAmmo + this.perks.secondaryAmmoBonus;
          this.stats.secondaryAmmoMax[slot] = cap;
          this.stats.secondaryAmmo[slot] = def.startAmmo + this.perks.secondaryAmmoBonus;
          this.secondaryRegenAccum[slot] = 0;
          // Auto-switch onto the freshly-bought weapon so Tab feels obvious.
          this.stats.secondaryActiveSlot = slot;
          this.onActiveSecondaryChanged();
          this.flash(`Equipped ${def.name}`);
        }
        break;
      }
    }
  }
}
