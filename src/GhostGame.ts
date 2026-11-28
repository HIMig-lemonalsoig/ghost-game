// Consolidated game engine and supporting systems. No React dependencies.
import { loadSprites, spritesReady, drawChar, classChar, frameCount, hasAnim, hasBody, drawItem, type Anim as SprAnim, type CharId, type Variant as SprVariant } from "./sprites";
import { drawCrestCursor } from "./cursor";
import { Fx, hueOf } from "./fx";
import { updateUltTrail, drawUltUnder, drawUltOver } from "./ultvfx";
import { drawBack, drawBody, lookDye, spriteLayers } from "./cosmeticdraw";
import { drawPointers, drawMinimap } from "./navui";
import { startNewClass, castNewUlt, newUltActive, fortuneActive, updateNewClasses, onShotNewClass, onHitNewClass, onDashNewClass, onWaveStartNewClass, drawNewClasses, resetNewClasses } from "./newclasses";
import { spawnNewEnemy, updateNewEnemy, updateNewHazards, drawNewHazards, drawNewTelegraphs, drawNewEnemy, onNewEnemyKilled, newEnemyWeights, newEnemySlowMul, NEW_ENEMY_LABEL, NEW_ENEMY_TIPS2 } from "./newenemies";
import type { Look } from "./cosmeticdraw";
import { Arena } from "./arena";
import { ULT_STYLES, poseFrame, drawMotif, STRIKE } from "./ultimates";
import type { UltMotif } from "./ultimates";
import { defenseReduction, dexAttackSpeed, critFromPoints, moveSpeedFromMul, soft, softStat, SOFT_STATS, WEAPON_FLAT, ULT_WAVE_SCALE, BOSS_CAST_CAPS, SHOP_RARITY, shopLegChance, ULT_CHARGE, coinDropChance, endlessIncomeMul, lateInflation, BOSS_PACING } from "./content/curves";
import { AFFIXES, ELITE, ENEMY_LABEL, rollAffixes } from "./content/elites";
import { hashStr, mulberry32 } from "./rng";
import { ULT_CLASS_MUL, ULT_EMPOWER } from "./content/ultbalance";
import { OMENS, OMEN_BY_ID, omenBefore, ARENA_SHRINES, ARENA_SHRINE_BY_ID, ARENA_SHRINE_CHANCE, ARENA_SHRINE_HOLD, ARENA_SHRINE_R } from "./content/choices";
import type { OmenId, OmenDef, ArenaShrineId } from "./content/choices";
import type { AffixId } from "./content/elites";
import { EVOLUTIONS, EVO_MASTERY, EVO_DAMAGE_MUL } from "./content/evolutions";
import { DUOS, DUO_BY_ID } from "./content/duos";
import { NEW_ENEMY_TIPS, ONRYO, NUE, MIRROR, newEnemyChance } from "./content/enemies";
import { SIG } from "./content/signatures";
import { ULT_PERKS, ULT_PERK_BY_ID } from "./content/ultperks";
import { vowRank, vowScore, VOW_COIN_BONUS } from "./content/vows";
import type { VowId, VowSet } from "./content/vows";
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
  | "kagebushi"
  | "kitsune"
  | "raijin"
  | "yukionna"
  | "sohei"
  | "ashigaru"
  | "kappa"
  | "tengu"
  | "kabuki"
  // ===== STEP 5 (src/newclasses.ts) =====
  | "teppo" | "takajo" | "karakuri" | "bakuto" | "rikishi" | "sumie";

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
    ultDesc: "Pay 20% HP to brand the 3 strongest foes. 1.5s later the debt is collected in one brutal strike each — the lower your HP, the harder it hits.",
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
    ultDesc: "For 2.5s, arrows rain on wherever you aim. Steer the storm onto your enemies.",
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
    ultDesc: "Tear a fissure forward: every foe in front of you is launched and stunned. Nothing behind you is touched.",
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
    ultDesc: "Split into 3 afterimages side by side. They criss-cross the spot you aim at in a storm of slashes (steer it), then meet for a final X-cut and fold back into you.",
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
    ultDesc: "A pillar of holy light follows your aim for 4s, burning and disarming what it touches and healing you for each new foe it strikes.",
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
    ultDesc: "Merge with shadow for 6s: 2× damage. Every kill feeds the darkness and extends it.",
    accent: "hsl(250, 30%, 40%)",
  },
  {
    id: "kitsune",
    kanji: "狐",
    name: "Kitsune",
    role: "Fox Spirit",
    bonuses: ["+10% movement speed", "15% chance on hit to set foes ablaze", "25% chance on kill to release a homing foxfire"],
    ultName: "Nine Tails",
    ultKanji: "九",
    ultDesc: "Release nine homing foxfires that hunt foes down one by one, setting them ablaze.",
    accent: "hsl(24, 95%, 60%)",
  },
  {
    id: "raijin",
    kanji: "雷",
    name: "Raijin",
    role: "Thunder Drummer",
    bonuses: ["+10 max HP", "Every 6th hit calls a chain-lightning bolt (3 jumps)"],
    ultName: "Heaven's Drum",
    ultKanji: "鼓",
    ultDesc: "Charge your weapon for 6s: every hit you land calls chain lightning that jumps to 3 more foes.",
    accent: "hsl(52, 100%, 62%)",
  },
  {
    id: "yukionna",
    kanji: "雪",
    name: "Yuki-onna",
    role: "Snow Witch",
    bonuses: ["+10 max HP", "Every hit chills the target (slowed 1.5s)", "+15% damage to chilled foes"],
    ultName: "Eternal Winter",
    ultKanji: "冬",
    ultDesc: "A blizzard follows you for 6s. Foes inside crawl, and anyone caught for over a second freezes solid and takes +50% damage.",
    accent: "hsl(195, 85%, 80%)",
  },
  {
    id: "sohei",
    kanji: "僧",
    name: "Sohei",
    role: "Warrior Monk",
    bonuses: ["+35 max HP", "−5% movement speed", "Thorns: attackers take 60% of the damage they deal you"],
    ultName: "Prayer Wheel",
    ultKanji: "輪",
    ultDesc: "Turn the prayer wheel for 4s: you heal in pulses, gain brief immunity, and foes are pushed back from you.",
    accent: "hsl(28, 55%, 58%)",
  },
  {
    id: "ashigaru",
    kanji: "足",
    name: "Ashigaru",
    role: "Spear Footsoldier",
    bonuses: ["Starts with Flame Spear", "+15 max HP", "+25% knockback on hit"],
    ultName: "Spear Wall",
    ultKanji: "槍",
    ultDesc: "Plant a wall of spears in front of you for 7s. It blocks arrows and orbs, and foes that touch it are burned and shoved back.",
    accent: "hsl(12, 75%, 55%)",
  },
  {
    id: "kappa",
    kanji: "河",
    name: "Kappa",
    role: "River Trickster",
    bonuses: ["+0.3 HP regen per second", "Every 4th hit splashes nearby foes for 60% damage"],
    ultName: "Tidal Surge",
    ultKanji: "潮",
    ultDesc: "Send a tidal wave rolling forward across the arena. It carries every foe it catches and dumps them, slowed, at the far end.",
    accent: "hsl(175, 65%, 50%)",
  },
  {
    id: "tengu",
    kanji: "天",
    name: "Tengu",
    role: "Mountain Goblin",
    bonuses: ["+15% movement speed", "Dash recharges 40% faster"],
    ultName: "Divine Wind",
    ultKanji: "風",
    ultDesc: "Take flight for 5s: +60% speed, dash recharges almost instantly, and every dash leaves a cutting gale in its path.",
    accent: "hsl(150, 45%, 60%)",
  },
  {
    id: "kabuki",
    kanji: "歌",
    name: "Kabuki",
    role: "Stage Performer",
    bonuses: ["+15% critical hit chance", "Critical hits heal 1 HP (once every 0.5s)"],
    ultName: "Grand Finale",
    ultKanji: "幕",
    ultDesc: "For 5s every hit is a critical hit, under a blazing spotlight.",
    accent: "hsl(335, 80%, 65%)",
  },
  {
    id: "teppo", kanji: "砲", name: "Teppō", role: "Matchlock Gunner",
    bonuses: ["+10% critical hit chance", "Every 4th shot is a matchlock blast: 3× damage and pierces"],
    ultName: "Three Ranks Fire", ultKanji: "斉",
    ultDesc: "A rank of ghost gunners appears behind you and fires three volleys down a lane in front of you.",
    accent: "hsl(28, 80%, 58%)",
  },
  {
    id: "takajo", kanji: "鷹", name: "Takajō", role: "Falconer",
    bonuses: ["+5% movement speed", "A hunting hawk dives on a nearby foe every 3s"],
    ultName: "Sky Hunt", ultKanji: "狩",
    ultDesc: "Five hawks fill the sky for 6s, diving on foes all around you.",
    accent: "hsl(38, 60%, 62%)",
  },
  {
    id: "karakuri", kanji: "機", name: "Karakuri-shi", role: "Clockwork Puppeteer",
    bonuses: ["+10 max HP", "Every 12s, sets down a wind-up turret that shoots foes for 6s"],
    ultName: "Clockwork Battalion", ultKanji: "繰",
    ultDesc: "Deploy three clockwork turrets around you that rapid-fire for 8s.",
    accent: "hsl(190, 50%, 58%)",
  },
  {
    id: "bakuto", kanji: "賽", name: "Bakuto", role: "Dice Gambler",
    bonuses: ["+20% luck", "Each wave starts with a lucky die roll: a random buff for that wave"],
    ultName: "Roll of Fate", ultKanji: "運",
    ultDesc: "Roll two dice. Low: lightning strikes every nearby foe twice. Middle: 6s where every hit crits. High: a golden jackpot blast and a purse of coins.",
    accent: "hsl(330, 65%, 62%)",
  },
  {
    id: "rikishi", kanji: "力", name: "Rikishi", role: "Sumo Wrestler",
    bonuses: ["+40 max HP, +30% knockback, −6% speed", "Dashing shoves foes aside and stuns them"],
    ultName: "Dohyō Stomp", ultKanji: "土",
    ultDesc: "Draw a sumo ring and stomp three times: each stomp drags foes in, then slams and stuns them.",
    accent: "hsl(15, 60%, 56%)",
  },
  {
    id: "sumie", kanji: "墨", name: "Sumi-e Painter", role: "Ink Painter",
    bonuses: ["Abilities recover 10% faster", "Every 5th hit paints an ink pool that slows foes"],
    ultName: "Living Ink", ultKanji: "虎",
    ultDesc: "Paint an ink tiger that leaps from foe to foe for 6s, leaving slowing ink everywhere it strikes.",
    accent: "hsl(265, 30%, 72%)",
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
    damageMul: 0.85,
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
    desc: "Long piercing thrust that skewers every foe in a line and sets them ablaze for 4s.",
    aim: "self",
    maxAmmo: 0,
    startAmmo: 0,
    regenTime: 0,
    fireCooldown: 0.5,
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
    desc: "Lightning-fast alternating stabs. Scales hardest with Dexterity, and every stab can trigger on-hit effects. 15% chance to stun.",
    aim: "self",
    maxAmmo: 9,
    startAmmo: 9,
    regenTime: 2.5,
    fireCooldown: 0.14,
    damageMul: 0.85,
    projectiles: 1,
    spread: 0,
    accent: "hsl(280, 50%, 70%)",
    dmgScale: 0.52, dexScale: 1.8,
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
  kitsune:    ["katana", "blowgun", "tessen", "kunai"],
  raijin:     ["katana", "ono", "shuriken_wheel", "crossbow"],
  yukionna:   ["katana", "tessen", "yumi", "kunai"],
  sohei:      ["katana", "ono", "tate", "tetsubishi"],
  ashigaru:   ["flame_spear", "yumi", "katana", "tate"],
  kappa:      ["katana", "kusarigama", "blowgun", "tessen"],
  tengu:      ["katana", "shuriken_wheel", "tessen", "kunai"],
  kabuki:     ["katana", "tessen", "twin_sai", "odachi"],
  teppo:      ["crossbow", "yumi", "katana", "kunai"],
  takajo:     ["yumi", "kunai", "katana", "shuriken_wheel"],
  karakuri:   ["tetsubishi", "crossbow", "katana", "tate"],
  bakuto:     ["kunai", "katana", "tessen", "shuriken_wheel"],
  rikishi:    ["tate", "ono", "katana", "tetsubishi"],
  sumie:      ["tessen", "blowgun", "katana", "kunai"],
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
  "tessen", "jutte", "ono", "twin_sai", "odachi", "tate", "flame_spear",
];

export const isMeleeSecondary = (id: SecondaryId): boolean =>
  MELEE_SECONDARY_IDS.includes(id);

/** Pixel bodies: which weapons are thrown from the hand, aimed from the shoulder or thrust. */
const THROWN = new Set<SecondaryId>(["kunai", "shuriken_wheel", "smoke_bomb", "tetsubishi", "kusarigama"]);
const AIMED = new Set<SecondaryId>(["yumi", "crossbow", "blowgun"]);
const THRUSTS = new Set<SecondaryId>(["flame_spear", "twin_sai"]);
/** On-body length of each weapon's art when held by a pixel body. */
const BARE_LEN: Partial<Record<SecondaryId, number>> = {
  yumi: 46, crossbow: 34, blowgun: 40, kunai: 20, shuriken_wheel: 18, smoke_bomb: 16, tetsubishi: 16, kusarigama: 28,
  tessen: 28, jutte: 30, ono: 42, twin_sai: 30, odachi: 64, tate: 30, flame_spear: 66,
};

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
  | "shop_lucky_coin" | "shop_bounty" | "shop_spirit_bell" | "shop_battle_drum" | "shop_dash_talisman"
  | "shop_gamble" | "shop_oni_mask" | "shop_fire_charm" | "shop_thunder_charm" | "shop_reaper_bell" | "shop_fortune"
  | "shop_whetted_eye" | "shop_assassin_ledger" | "shop_night_lantern"
  | "shop_wide_brush" | "shop_full_quiver" | "shop_maneki" | "shop_scholar_brush" | "shop_lodestone" | "shop_frost_talisman"
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
  locked?: boolean;       // SHOPLOCK: kept through rerolls and into the next shop at this price
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
  // CRIT STEP (2026-11-27): crit chance + the new crit damage stat.
  { effect: "shop_whetted_eye",     kanji: "研", name: "Whetted Eye",      desc: "+4% crit chance.",                                       priceMin: 24, priceMax: 34, rarity: "common"    },
  { effect: "shop_assassin_ledger", kanji: "帳", name: "Assassin's Ledger", desc: "+30% crit damage (crits hit harder). Appears once you have 15% crit.", priceMin: 45, priceMax: 62, rarity: "rare" },
  { effect: "shop_night_lantern",   kanji: "灯", name: "Night Lantern",    desc: "+15% crit chance, but −10% max HP.",                     priceMin: 90, priceMax: 120, rarity: "legendary" },
  // STEP 3 (2026-11-27): one shop source for every stat that had none.
  { effect: "shop_wide_brush",     kanji: "筆", name: "Wide Brush",      desc: "+10% area: explosions, smoke, AoE hits and petals reach farther.", priceMin: 30, priceMax: 44, rarity: "common" },
  { effect: "shop_full_quiver",    kanji: "箙", name: "Full Quiver",     desc: "Thrown and shot weapons fire +1 projectile.",            priceMin: 60, priceMax: 80, rarity: "rare" },
  { effect: "shop_maneki",         kanji: "招", name: "Maneki-neko",     desc: "+15% luck: rarer cards and shop items, more item drops.", priceMin: 30, priceMax: 44, rarity: "common" },
  { effect: "shop_scholar_brush",  kanji: "学", name: "Scholar's Brush", desc: "+15% XP gained.",                                        priceMin: 26, priceMax: 38, rarity: "common" },
  { effect: "shop_lodestone",      kanji: "磁", name: "Lodestone",       desc: "+40% pickup radius for XP, ammo and items.",             priceMin: 22, priceMax: 32, rarity: "common" },
  { effect: "shop_frost_talisman", kanji: "氷", name: "Frost Talisman",  desc: "+8% chance to chill on hit (slows the foe).",            priceMin: 30, priceMax: 42, rarity: "common" },
  { effect: "ult_charge",    kanji: "気", name: "Spirit Surge",      desc: "Instantly fills 35% of your ultimate.",    priceMin: 25, priceMax: 35, rarity: "common"   },
  { effect: "ammo_refill",   kanji: "充", name: "Ammo Cache",        desc: "Refill all secondary ammo.",               priceMin: 15, priceMax: 22, rarity: "common"   },
  { effect: "ammo_cap",      kanji: "袋", name: "Wider Quiver",      desc: "+2 max ammo on every secondary.",          priceMin: 30, priceMax: 45, rarity: "rare"     },
  { effect: "ammo_regen",    kanji: "練", name: "Trained Hand",      desc: "−25% secondary regen time.",               priceMin: 35, priceMax: 50, rarity: "rare"     },
  { effect: "secondary_dmg_global", kanji: "矢", name: "Sharpened Tips", desc: "+12% damage to ALL secondary weapons.", priceMin: 38, priceMax: 55, rarity: "rare" },
  { effect: "lifesteal",     kanji: "吸", name: "Crimson Rite",      desc: "Heal +1 HP on every kill (per-kill heal capped at 6).",          priceMin: 40, priceMax: 55, rarity: "rare"     },
  { effect: "hp_regen",      kanji: "息", name: "Steady Breath",     desc: "+0.5 HP/s passive regeneration.",          priceMin: 30, priceMax: 45, rarity: "rare"     },
  // ===== Stat upgrades (rarity-tiered) =====
  // Damage — Katana (always available).
  { effect: "dmg_katana_common", kanji: "刃", name: "Whetstone",          desc: "+7% damage with all weapons.",                       priceMin: 28, priceMax: 42, rarity: "common"    },
  { effect: "dmg_katana_rare",   kanji: "刃", name: "Honed Whetstone",    desc: "+14% damage with all weapons.",                       priceMin: 50, priceMax: 70, rarity: "rare"      },
  { effect: "dmg_katana_leg",    kanji: "刃", name: "Masterforged Edge",  desc: "+28% damage with all weapons.",                       priceMin: 95, priceMax: 130, rarity: "legendary" },
  // Dexterity (replaces flat attack-speed perks).
  { effect: "dex_common", kanji: "敏", name: "Light Hands",      desc: "+3 dexterity (attack speed scales with weapon).", priceMin: 28, priceMax: 42, rarity: "common"   },
  { effect: "dex_rare",   kanji: "敏", name: "Trained Reflexes", desc: "+6 dexterity.",                                     priceMin: 50, priceMax: 70, rarity: "rare"     },
  { effect: "dex_leg",    kanji: "敏", name: "Wind's Grace",     desc: "+12 dexterity.",                                    priceMin: 95, priceMax: 130, rarity: "legendary" },
  // Movement speed.
  { effect: "spd_common", kanji: "風", name: "Wind Step",        desc: "+5% movement speed.",                               priceMin: 25, priceMax: 38, rarity: "common"   },
  { effect: "spd_rare",   kanji: "風", name: "Swift Sandals",    desc: "+8% movement speed.",                               priceMin: 42, priceMax: 60, rarity: "rare"     },
  { effect: "spd_leg",    kanji: "風", name: "Boots of the Gale",desc: "+15% movement speed.",                              priceMin: 90, priceMax: 120, rarity: "legendary" },
  // Defense (no common variant).
  { effect: "def_rare",   kanji: "盾", name: "Lacquered Plate",  desc: "+2 defense — blocks a share of every hit.",        priceMin: 55, priceMax: 75, rarity: "rare"      },
  { effect: "def_leg",    kanji: "盾", name: "Daimyo's Cuirass", desc: "+4 defense — blocks a share of every hit.",        priceMin: 100, priceMax: 140, rarity: "legendary" },
  // Max HP (cap removed).
  { effect: "hp_common",  kanji: "命", name: "Iron Resolve",     desc: "+6% max HP and heals fully.",                     priceMin: 32, priceMax: 48, rarity: "common"    },
  { effect: "hp_rare",    kanji: "命", name: "Steel Heart",      desc: "+15 max HP and heals 15.",                         priceMin: 48, priceMax: 65, rarity: "rare"      },
  { effect: "hp_leg",     kanji: "命", name: "Oni's Vigor",      desc: "+40 max HP and heals 40.",                         priceMin: 95, priceMax: 130, rarity: "legendary" },
  // ===== Per-weapon damage upgrades (only shown when equipped) =====
  ...buildWeaponDamagePool(),
  // ===== Phase A — 12 new purchasable perks =====
  { effect: "perk_crimson_blade",   kanji: "紅", name: "Crimson Blade",      desc: "+10% damage with all weapons.",   priceMin: 35, priceMax: 50, rarity: "rare"      },
  { effect: "perk_stone_stance",    kanji: "岩", name: "Stone Stance",       desc: "−10% damage taken and +10% damage.",     priceMin: 40, priceMax: 55, rarity: "rare"      },
  { effect: "perk_ghost_steps",     kanji: "歩", name: "Ghost Steps",        desc: "+5% movement speed.",               priceMin: 30, priceMax: 45, rarity: "common"    },
  { effect: "perk_void_shard",      kanji: "虚", name: "Void Shard",         desc: "+0.25s of invulnerability after you're hit.",   priceMin: 45, priceMax: 65, rarity: "rare"      },
  { effect: "perk_hungry_blade",    kanji: "飢", name: "Hungry Blade",       desc: "Heal 1 HP on every kill (max 6 HP per kill).",                                priceMin: 50, priceMax: 70, rarity: "rare"      },
  { effect: "perk_war_paint",       kanji: "戦", name: "War Paint",          desc: "+5% damage with all weapons.",           priceMin: 35, priceMax: 50, rarity: "common"    },
  { effect: "perk_cursed_eye",      kanji: "眼", name: "Cursed Eye",         desc: "+5% critical chance and +5% damage.",        priceMin: 40, priceMax: 55, rarity: "rare"      },
  { effect: "perk_raging_current",  kanji: "波", name: "Raging Current",     desc: "+10% attack speed with the katana.",                        priceMin: 55, priceMax: 75, rarity: "legendary" },
  { effect: "perk_twin_fang",       kanji: "牙", name: "Twin Fang",          desc: "+25% damage with every weapon except the katana.",                    priceMin: 60, priceMax: 85, rarity: "legendary" },
  { effect: "perk_bone_armor",      kanji: "骨", name: "Bone Armor",         desc: "Survive one fatal blow each wave, at half HP.",      priceMin: 70, priceMax: 95, rarity: "legendary" },
  { effect: "perk_drifting_leaves", kanji: "葉", name: "Drifting Leaves",    desc: "+20% knockback and +5% movement speed.",        priceMin: 45, priceMax: 60, rarity: "rare"      },
  { effect: "perk_soul_collector",  kanji: "魂", name: "Soul Collector",     desc: "+20 max HP and heal 20 HP.",        priceMin: 50, priceMax: 70, rarity: "rare"      },
  // ===== Build-direction items =====
  { effect: "shop_lucky_coin",    kanji: "運", name: "Lucky Coin",      desc: "+20% coins from kills.",                                     priceMin: 40, priceMax: 55, rarity: "rare"      },
  { effect: "shop_bounty",        kanji: "賞", name: "Bounty Ledger",   desc: "Elite kills give +4 coins and heal 2 HP.",                   priceMin: 45, priceMax: 60, rarity: "rare"      },
  { effect: "shop_spirit_bell",   kanji: "鈴", name: "Spirit Bell",     desc: "Ultimate charges 12% faster.",                               priceMin: 30, priceMax: 42, rarity: "common"    },
  { effect: "shop_battle_drum",   kanji: "鼓", name: "Battle Drum",     desc: "Ability cooldowns recover 15% faster.",                      priceMin: 45, priceMax: 62, rarity: "rare"      },
  { effect: "shop_dash_talisman", kanji: "符", name: "Dash Talisman",   desc: "Dash recharges 10% faster.",                                 priceMin: 28, priceMax: 40, rarity: "common"    },
  { effect: "shop_gamble",        kanji: "賭", name: "Ronin's Gamble",  desc: "+18% damage, but −12% max HP.",                              priceMin: 45, priceMax: 60, rarity: "rare"      },
  { effect: "shop_oni_mask",      kanji: "面", name: "Oni Mask",        desc: "Below 30% HP: +50% damage and −20% damage taken.",           priceMin: 90, priceMax: 120, rarity: "legendary" },
  { effect: "shop_fire_charm",    kanji: "火", name: "Fire Charm",      desc: "+6% chance to ignite on hit.",                              priceMin: 30, priceMax: 42, rarity: "common"    },
  { effect: "shop_thunder_charm", kanji: "雷", name: "Thunder Charm",   desc: "+8% chance to call lightning on hit.",                       priceMin: 42, priceMax: 58, rarity: "rare"      },
  { effect: "shop_fortune",       kanji: "籤", name: "Fortune Stick",   desc: "+2 level-up rerolls and +1 banish.",                          priceMin: 26, priceMax: 38, rarity: "common"    },
  { effect: "shop_reaper_bell",   kanji: "冥", name: "Reaper's Bell",   desc: "Every 10th kill releases a soul shockwave (stacks faster).", priceMin: 95, priceMax: 125, rarity: "legendary" },
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
      desc: `+10% ${def.name} damage.`,
      priceMin: 28, priceMax: 42, rarity: "common",
    });
    out.push({
      effect: `dmg_${wid}_rare`,
      kanji: def.kanji,
      name: `${def.name} Honed`,
      desc: `+20% ${def.name} damage.`,
      priceMin: 50, priceMax: 70, rarity: "rare",
    });
    out.push({
      effect: `dmg_${wid}_leg`,
      kanji: def.kanji,
      name: `${def.name} Forged`,
      desc: `+40% ${def.name} damage.`,
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
  blocked: Set<string> = new Set(),
  odds?: { legendary: number; rare: number },   // SHOP RARITY (7.3): per-slot chances; omitted = uniform
): ShopItem[] => {
  const equippedSet = new Set(equippedSecondaries);
  const pool = SHOP_POOL.filter((entry) => {
    if (blocked.has(entry.effect)) return false;
    const m = /^dmg_([a-z_]+)_(common|rare|leg)$/.exec(entry.effect);
    if (!m) return true;
    const wid = m[1];
    if (wid === "katana") return true;
    return equippedSet.has(wid as SecondaryId);
  });
  const out: ShopItem[] = [];
  for (let i = 0; i < count && pool.length > 0; i++) {
    let idx = Math.floor(Math.random() * pool.length);
    if (odds) {
      // Roll the rarity first, then an item of that rarity (falling back to the
      // nearest rarity that still has items left).
      const r = Math.random();
      const want: ShopRarity = r < odds.legendary ? "legendary" : r < odds.legendary + odds.rare ? "rare" : "common";
      const order: ShopRarity[] = want === "legendary" ? ["legendary", "rare", "common"] : want === "rare" ? ["rare", "common", "legendary"] : ["common", "rare", "legendary"];
      for (const rar of order) {
        const ids = pool.map((e, k) => (e.rarity === rar ? k : -1)).filter(k => k >= 0);
        if (ids.length) { idx = ids[Math.floor(Math.random() * ids.length)]; break; }
      }
    }
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
  | "wind_charm"    // +30% movement speed for 8s
  | "thunder_scroll" | "fire_bomb" | "frost_talisman" | "elixir" | "war_banner"
  | "golden_koban" | "shadow_scroll" | "lucky_charm" | "phoenix_feather" | "hourglass";

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
  thunder_scroll: {
    id: "thunder_scroll", kanji: "雷", name: "Thunder Scroll",
    desc: "Lightning strikes the 6 nearest foes and stuns them.",
    accent: "hsl(52 100% 65%)", weight: 10,
  },
  fire_bomb: {
    id: "fire_bomb", kanji: "炎", name: "Fire Bomb",
    desc: "Explodes around you and sets nearby foes ablaze.",
    accent: "hsl(20 95% 60%)", weight: 11,
  },
  frost_talisman: {
    id: "frost_talisman", kanji: "氷", name: "Frost Talisman",
    desc: "Freezes nearby foes solid for 2.5s, then chills them.",
    accent: "hsl(195 90% 78%)", weight: 9,
  },
  elixir: {
    id: "elixir", kanji: "薬", name: "Vigor Elixir",
    desc: "+10 max HP for the rest of the run, and heals 20.",
    accent: "hsl(330 70% 70%)", weight: 7,
  },
  war_banner: {
    id: "war_banner", kanji: "旗", name: "War Banner",
    desc: "+15 Dexterity (faster attacks) for 10 seconds.",
    accent: "hsl(358 75% 60%)", weight: 10,
  },
  golden_koban: {
    id: "golden_koban", kanji: "金", name: "Golden Koban",
    desc: "A gold coin worth more the later the wave.",
    accent: "hsl(45 95% 60%)", weight: 10,
  },
  shadow_scroll: {
    id: "shadow_scroll", kanji: "影", name: "Shadow Scroll",
    desc: "Summons a shadow clone that fights beside you for 8s.",
    accent: "hsl(250 40% 70%)", weight: 7,
  },
  lucky_charm: {
    id: "lucky_charm", kanji: "吉", name: "Lucky Omamori",
    desc: "+40% critical hit chance for 10 seconds.",
    accent: "hsl(140 60% 65%)", weight: 9,
  },
  phoenix_feather: {
    id: "phoenix_feather", kanji: "鳳", name: "Phoenix Feather",
    desc: "Survive your next fatal blow at half HP.",
    accent: "hsl(15 100% 65%)", weight: 4,
  },
  hourglass: {
    id: "hourglass", kanji: "時", name: "Sand Hourglass",
    desc: "Slows every foe to a crawl for 4 seconds.",
    accent: "hsl(210 70% 75%)", weight: 7,
  },
};

export const ALL_CONSUMABLE_IDS: ConsumableId[] = [
  "rice_ball", "sake", "smoke_pellet", "spirit_pearl", "iron_powder", "wind_charm",
  "thunder_scroll", "fire_bomb", "frost_talisman", "elixir", "war_banner",
  "golden_koban", "shadow_scroll", "lucky_charm", "phoenix_feather", "hourglass",
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

export type Difficulty = "easy" | "medium" | "normal" | "hard" | "death";

export const DIFFICULTIES: Record<Difficulty, {
  name: string; kanji: string; desc: string; color: string;
  hp: number; dmg: number; speed: number; density: number; coins: number; tele: number;
}> = {
  easy:   { name: "Easy",   kanji: "楽", color: "hsl(140 55% 60%)", desc: "Weaker, slower, fewer foes, longer attack warnings, more coins.", hp: 0.65, dmg: 0.55, speed: 0.9,  density: 0.8,  coins: 1.25, tele: 1.25 },
  medium: { name: "Medium", kanji: "中", color: "hsl(190 60% 60%)", desc: "A gentler fight: foes hit softer and there are fewer of them.",  hp: 0.82, dmg: 0.78, speed: 0.95, density: 0.9,  coins: 1.1,  tele: 1.1 },
  normal: { name: "Normal", kanji: "常", color: "hsl(42 80% 62%)",  desc: "The intended challenge.",                                          hp: 1,    dmg: 1,    speed: 1,    density: 1,    coins: 1,    tele: 1 },
  hard:   { name: "Hard",   kanji: "難", color: "hsl(20 85% 58%)",  desc: "Tougher, faster foes that hit harder and come in bigger numbers.", hp: 1.3,  dmg: 1.3,  speed: 1.06, density: 1.15, coins: 0.95, tele: 0.92 },
  death:  { name: "Death",  kanji: "死", color: "hsl(358 80% 58%)", desc: "Brutal. Huge, fast, deadly hordes and barely any warning.",       hp: 1.75, dmg: 1.8,  speed: 1.12, density: 1.3,  coins: 0.9,  tele: 0.8 },
};

/** Shrine of Ancestors bonuses for a run (see src/unlocks.ts). */
export interface MetaBonus {
  rerolls: number; banishes: number; startMon: number; monMul: number;
  chestHeal: number; chestCoinMul: number; startItem: boolean; startRiceBalls: number;
  maxHp: number; damageTakenMul: number; speedMul: number; dashCdMul: number;
  startUlt: number; ultChargeMul: number; xpMul: number; skipMul: number;
  shopMul: number; rerollMul: number; secondLife: boolean; bossHeal: number;
}
export const NO_META: MetaBonus = {
  rerolls: 0, banishes: 0, startMon: 0, monMul: 1, chestHeal: 0, chestCoinMul: 1, startItem: false, startRiceBalls: 0,
  maxHp: 0, damageTakenMul: 1, speedMul: 1, dashCdMul: 1, startUlt: 0, ultChargeMul: 1, xpMul: 1, skipMul: 1,
  shopMul: 1, rerollMul: 1, secondLife: false, bossHeal: 0,
};

export interface SavedRun {
  meta?: MetaBonus;
  daily?: string;            // DAILY: date key of a daily run
  assist?: number;           // A11Y: Assist mode damage reduction for this run
  v: number;
  savedAt: number;
  atShop?: boolean;          // saved right after a wave cleared
  endless?: boolean;
  vows?: VowSet;
  difficulty?: Difficulty;
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

// The audio engine lives in src/audio.ts (synthesized SFX + composed music).
import { audio } from "./audio";
export { audio };

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
  /** WARDROBE: slash color from the equipped sword kit. */
  rgb: [number, number, number] = [180, 20, 20];
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
      const [r, g, b] = this.rgb;
      grad.addColorStop(0, `rgba(${r},${g},${b},0)`);
      grad.addColorStop(0.7, `rgba(${r},${g},${b},${pass === 0 ? 0.35 : 0.65})`);
      grad.addColorStop(1, `rgba(${Math.min(255, r + 40)},${Math.min(255, g + 20)},${Math.min(255, b + 20)},${tipAlpha})`);
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
  rarity: "common" | "rare" | "legendary" | "ability" | "duo";   // 7.8: abilities and duos have their own odds
  kind?: "passive" | "ability";
  duo?: boolean;
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
  buffHasteRemaining: number;      // +15 dexterity
  buffLuckRemaining: number;       // +40% crit chance
  // Last consumable used — the HUD shows a card describing what it did.
  lastItemId: ConsumableId | null;
  lastItemText: string;
  lastItemSeq: number;
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
    moveSpeedPct: number;  // % of base speed (100 = baseline), after the curve
    defensePct: number;    // % of each hit blocked by Defense
    attackSpeedPct: number;// % of base atk speed (100 = baseline)
    critChancePct: number;
    critMul: number;       // CRIT STEP: crit damage multiplier
    more?: [string, string][];   // STEP 3: extra stats shown only once you have them
    hpRegen: number;
    secondaryDmgMul: number;
  };
}

interface Vec2 { x: number; y: number; }

/** One Kunoichi afterimage during Phantom Dance. */
interface PhantomImage {
  home: Vec2;          // slot beside the player (left / centre / right)
  pos: Vec2;
  facing: number;
  from: Vec2; to: Vec2; // current dash
  dashT: number;        // 0..1 through the current dash (≥1 = waiting for the next)
  delay: number;        // stagger before its next dash
  trail: { x: number; y: number; a: number }[];
  swing: number;        // drives the weapon swing animation
  dir: number;
}

// Phantom Dance timeline (seconds).
const PD = {
  split: 0.3,          // the body splits into three, side by side
  flurryEnd: 3.0,      // afterimages criss-cross the target zone, slashing
  finisher: 3.25,      // they converge for a final X-cut
  dur: 3.6,
  reach: 175,          // zone centre distance in front of the player
  zoneR: 115,          // zone radius
  dashTime: 0.15,
  spacing: 62,         // gap between the three afterimages
  tick: 0.12,          // damage tick
  steerSpeed: 430,     // WASD / stick moves the storm this fast (px/s)
  leash: 560,          // how far the storm can roam from your body
};

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
  | "final"
  // Swarm / support / artillery / exploder roles
  | "wisp"
  | "priest"
  | "bomber"
  | "lantern"
  // Phase 4: controller / summoner / anti-ranged
  | "onryo"
  | "nue"
  | "mirror"
  // STEP 4 (src/newenemies.ts)
  | "inoshishi" | "kappa_raid" | "taiko" | "tsukumo" | "tsukumo_small" | "sniper" | "mukade" | "yukiwarashi" | "mimic";

/** v3.13: yokai drawn as sprites (only when their art is present). Bodies only — every
 *  warning ring / telegraph is still drawn by the game on top. */
const YOKAI_SPRITES: Record<string, { id: CharId; variant?: SprVariant; h?: number }> = {
  onryo: { id: "onryo" }, mirror: { id: "mirror" }, bomber: { id: "bomber" },
  kappa_raid: { id: "kappa" }, taiko: { id: "taiko" }, yukiwarashi: { id: "yukiwarashi", h: 4.6 },
  sniper: { id: "archer", variant: "shade" },
  lantern: { id: "lantern", h: 4.4 }, wisp: { id: "wisp", h: 3.4 }, tsukumo: { id: "tsukumo", h: 3.6 }, tsukumo_small: { id: "tsukumo", h: 3.6 },
  mimic: { id: "mimic", h: 2.6 }, inoshishi: { id: "boar", h: 3.2 }, nue: { id: "nue", h: 3.0 },
};

export type BossKind = "oni" | "kitsune" | "gasha" | "raijin";
/** STEP 3: perk families for family weighting (owning one makes the rest 1.5× likelier). */
const PERK_FAMILY: Record<string, string> = Object.fromEntries([
  ["crit", ["keen_eye", "crit_strike", "steady_aim", "hawks_eye", "heavens_eye", "deep_cut", "bone_splitter", "death_blossom"]],
  ["area", ["broad_sweep", "shock_stance", "heaven_earth", "long_blade", "wide_arc"]],
  ["proj", ["extra_kunai", "piercing_shot", "steel_storm"]],
  ["luck", ["lucky_charm", "fortune_favor", "scavenger"]],
  ["xp", ["diligent", "scholar_scroll"]],
  ["pickup", ["magnet_charm", "spirit_pull"]],
  ["frost", ["frostbite", "deep_freeze", "winters_heart"]],
  ["poison", ["poison_hits_c", "poison_dmg_r", "poison_ramp_l"]],
  ["fire", ["fire_hits_c", "fire_dmg_r", "fire_spread_l"]],
  ["bleed", ["bleed_hits_c", "bleed_dmg_r"]],
  ["lightning", ["lightning_hits_r", "lightning_dmg_l"]],
  ["heal", ["vampire", "lifebloom", "wave_clear", "shadow_lord"]],
].flatMap(([fam, ids]) => (ids as string[]).map(id => [id, fam as string])));
/** Spawn table: plain grunts always keep at least this share of regular spawns. */
const SPAWN_MIN_NORMAL = 0.15;

/** Balance-tracking events (see src/telemetry.ts). */
export type GameEvent =
  | { t: "offer"; kind: "perk" | "shop"; ids: string[] }
  | { t: "pick"; kind: "perk" | "shop"; id: string }
  | { t: "death"; by: string; wave: number }
  | { t: "reroll" } | { t: "banish"; id: string } | { t: "skip" }
  | { t: "choice"; id: string };   // OMEN / ARENA SHRINE picks

/** Per-run counters the menu folds into lifetime career stats. */
export interface RunCounters {
  kills: number;
  stealthKills: number;
  bossKills: number;
  bossByKind: Record<string, number>;
  killsByKind: Record<string, number>;
  wavesCleared: number;
  damageDealt: number;
  damageTaken: number;
  biggestHit: number;
  monEarned: number;
  ults: number;
  items: number;
  dashes: number;
  time: number;          // seconds of active play
  // ── Achievement trackers (per run, not summed into career totals) ──
  purchases: number;
  flawlessWaves: number;       // waves cleared without taking damage
  flawlessStreak: number;      // current streak
  bestFlawlessStreak: number;
  flawlessBossWaves: number;
  bestMultiKill: number;       // most kills inside 0.5s
  bestUltKills: number;        // most kills during one ultimate
  maxMon: number;              // most coins held at once
  clutchWaves: number;         // waves cleared on 3 HP or less
  eliteKills: number;
  eliteByAffix: Record<string, number>;
  doubleEliteKills: number;
  chests: number;
  evolutions: string[];
  duos: string[];
  nueFirstStrike: number;     // Nue killed before it ever summoned
  dmgBy: Record<string, number>;     // RECAP damage dealt per source label
  takenBy: Record<string, number>;   // RECAP damage taken per attacker
  takenWave: Record<string, Record<string, number>>;   // RECAP damage taken per wave per attacker
  altars: number;       // ARENA SHRINE trades accepted
  omens: number;        // OMEN waves survived
}
export const newRunCounters = (): RunCounters => ({
  kills: 0, stealthKills: 0, bossKills: 0, bossByKind: {}, killsByKind: {}, wavesCleared: 0,
  damageDealt: 0, damageTaken: 0, biggestHit: 0, monEarned: 0, ults: 0, items: 0, dashes: 0, time: 0,
  purchases: 0, flawlessWaves: 0, flawlessStreak: 0, bestFlawlessStreak: 0, flawlessBossWaves: 0,
  bestMultiKill: 0, bestUltKills: 0, maxMon: 0, clutchWaves: 0,
  eliteKills: 0, eliteByAffix: {}, doubleEliteKills: 0, chests: 0, evolutions: [], duos: [], nueFirstStrike: 0,
  dmgBy: {}, takenBy: {}, takenWave: {}, altars: 0, omens: 0,
});

export const BOSS_INFO: Record<BossKind, { name: string; kanji: string }> = {
  oni:     { name: "Oni Warlord",      kanji: "鬼" },
  kitsune: { name: "Nine-Tailed Witch", kanji: "狐" },
  gasha:   { name: "Gashadokuro",      kanji: "骸" },
  raijin:  { name: "Thunder General",  kanji: "雷" },
};

// Telegraphed ground attack: a circle fills up over `max` seconds, then
// detonates and hurts the player if they're still inside.
interface Hazard {
  x: number; y: number; r: number;
  t: number; max: number;
  damage: number;
  kind: "bomb" | "bolt" | "slam";
  fromX: number; fromY: number;
  src?: string;       // death-cause label for balance tracking
}

interface Enemy {
  /** 7.10: last time an ult tick showed a damage number on this enemy. */
  lastUltNum?: number;
  /** BOSS CAP: damage taken from the current cast of each capped source. */
  castCap?: Record<string, { cast: number; dealt: number; shown?: boolean }>;
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
  bossRecover?: number;        // melee pass: boss is winded after a pattern (stands still)
  dashWind?: number;           // dodge pass: seconds left on a boss charge's aim line
  blinkX?: number; blinkY?: number;   // Kitsune: where her blink will land (shown in advance)
  lastBossPattern?: number;
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
  // Stealth — while the player is hidden, enemies search the last place
  // they saw them instead of tracking their true position.
  lostTrack?: number;          // >0 while searching (seconds spent lost)
  searchX?: number;
  searchY?: number;
  // ===== New ability effects =====
  // Death Mark — cursed seal that increases damage taken; chains on kill.
  markRemaining: number;
  critMarkUntil?: number;      // CRIT STEP: Heaven's Eye mark expires at this time
  chillUntil?: number;         // STEP 3: chilled (slowed) until
  chillHits?: number;          // STEP 3: Deep Freeze counter
  frozenUntil?: number;        // STEP 3: frozen solid until
  // STEP 4 enemy state (src/newenemies.ts)
  drumUntil?: number; submerged?: boolean; disguised?: boolean; segs?: { x: number; y: number }[];
  windT?: number; chargeT?: number; chargeAng?: number; chargeHit?: boolean; burstT?: number; drumT?: number;
  aimT?: number; aimAng?: number; trailCd?: number; biteT?: number; biteCd?: number;
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
  bossKind?: BossKind;
  chill?: number;     // seconds spent inside Yuki-onna's blizzard
  // ── Elite affixes (src/content/elites.ts) ──
  affixes?: AffixId[];
  wardHits?: number;
  trailT?: number;
  // ── PHASE4 enemy state ──
  castCount?: number;       // Onryō casts so far
  summonCharge?: number;    // Nue: >0 while charging a summon
  summoned?: boolean;       // Nue: has summoned at least once
  summonerId?: number;      // wisps summoned by a Nue
  lastSrc?: string;         // weapon that last hit it (Arashi Tailwind)
  special?: number;   // per-archetype timer (heal pulse, bomb throw)
  fuse?: number;      // lantern self-destruct countdown
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
  // Touch: face the nearest enemy while attacking (phones have no cursor)
  aimAssist?: boolean; attackHeld?: boolean;
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
  fromUlt?: boolean;         // RECAP: spawned by an ultimate (its hits count as "Ultimate")
  label?: string;            // RECAP: explicit damage label (e.g. "Fox companion")
  size: number;
  homing?: boolean;
  burn?: boolean;
  charge?: boolean;          // Dokkaebi horde: a straight stampede that speeds up
  delay?: number;            // seconds before it sets off (staggered charge)
  seed?: number;
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
  // Human-like movement (clone AI rework)
  vel?: Vec2;
  mode?: "follow" | "approach" | "windup" | "strike" | "recover" | "circle" | "dodge";
  modeT?: number;
  targetId?: number | null;
  swing?: number;            // 1 → 0 during a swing (drawn as a katana sweep)
  swingDir?: number;
  circleDir?: number;
  dodgeCd?: number;
  side?: number;             // which side of you it walks on when following
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
  kind: "arrow" | "orb" | "talisman";
  trail: { x: number; y: number }[];
  /** Boss volley orbs start slow and speed up (0→1), so you can step between them up close. */
  ramp?: number;
}
/** Boss ground slam: one blast of this radius when it lands (matches the drawn danger circle). */
const BOSS_SLAM_R = 150;

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
  src?: SecondaryId;   // weapon that fired it (evolutions + hitstun)
  pierceLeft?: number; // extra enemies it may pass through (Arashi)
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
  venom?: boolean;
}

// Caltrop field — DoT zone left by a bomb.
interface CaltropField {
  pos: Vec2;
  radius: number;
  life: number;
  maxLife: number;
  dps: number;
  tickAccum: number;
  venom?: boolean;     // Venom Caltrops evolution: the field poisons
}

// Smoke cloud — slows + reduces enemy alertness in radius.
interface SmokeCloud {
  pos: Vec2;
  radius: number;
  life: number;
  maxLife: number;
  follow?: boolean;    // Ninja Fog evolution: the cloud tracks the player
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
  PLAYER_SPEED: 215,
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
  DASH_COOLDOWN: 2.4,    // seconds
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

// ===== Balance caps =====
// Defense, dexterity, crit and move speed use smooth diminishing-return
// curves (src/content/curves.ts) — the values below are only backstops
// against broken saves. The rest are real ceilings: items for a maxed stat
// stop appearing in the shop.
export const STAT_CAPS = {
  dexMaxRaw: 300,         // backstop
  attackSpeedMax: 2.5,    // 250% attack speed, all sources combined
  speedMulMax: 4,         // backstop (real speed comes from the curve)
  defenseMax: 200,        // backstop
  critPointsMax: 3,       // backstop
  classDamageMul: 6,      // backstop (real value comes from the curve)
  secondaryDmgMul: 6,     // backstop
  hpRegen: 3,
  monMul: 2.2,
  ultChargeMul: 2,
  abilityHaste: 2.5,        // backstop (curve keeps it under 2× for most classes)
  dashCdMul: 0.5,         // floor
  secondaryRegenMul: 0.4, // floor
  invulnBonus: 0.75,
  fireChance: 0.5,
  lightningChance: 0.4,
  healOnKill: 6,
  eliteBounty: 16,
  maxHpBonus: 400,
};
// Hard cap on the swing arc multiplier so wide_arc stacking can never
// push the swept arc past 180°. BASE.ATTACK_ARC is 0.7π, so the cap is
// (1π / 0.7π) ≈ 1.4286.
const MAX_ATTACK_ARC_MUL = Math.PI / (Math.PI * 0.7);
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
// Seconds the block pool waits before regenerating after it soaks a hit.
const BLOCK_REGEN_DELAY = 2;

// All available perks. Some can stack.
export const PERK_POOL: Omit<PerkChoice, never>[] = [
  { id: "blade_edge", kanji: "刃", name: "Honed Edge", desc: "+15% damage with all weapons", rarity: "common" },
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
  { id: "kensei", kanji: "剣", name: "Way of the Kensei", desc: "+60% damage with all weapons", rarity: "legendary" },
  { id: "tempest", kanji: "嵐", name: "Tempest", desc: "Katana swings strike twice (katana only)", rarity: "legendary" },
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
  // ===== Build-direction perks =====
  { id: "keen_eye",      kanji: "眼", name: "Keen Eye",       desc: "+6% critical hit chance",                                   rarity: "common" },
  // CRIT STEP (2026-11-27): a full crit family. Crit damage cards only show up once you have 15% crit.
  { id: "steady_aim",    kanji: "準", name: "Steady Aim",     desc: "+5% crit chance",                                           rarity: "common" },
  { id: "hawks_eye",     kanji: "鷹", name: "Hawk's Eye",     desc: "+10% crit chance, and +5% more for 2s after you dash",      rarity: "rare" },
  { id: "heavens_eye",   kanji: "天", name: "Heaven's Eye",   desc: "+15% crit chance. Crits mark foes: they take +10% damage for 3s", rarity: "legendary" },
  { id: "deep_cut",      kanji: "深", name: "Deep Cut",       desc: "+25% crit damage",                                          rarity: "common" },
  { id: "bone_splitter", kanji: "骨", name: "Bone Splitter",  desc: "+50% crit damage",                                          rarity: "rare" },
  { id: "death_blossom", kanji: "華", name: "Death Blossom",  desc: "Crits burst into petals that hit nearby foes for about 40% of the crit", rarity: "legendary" },
  // STEP 3 (2026-11-27): area, projectiles, luck, XP, pickup and frost lines.
  { id: "broad_sweep",    kanji: "広", name: "Broad Sweep",     desc: "+10% area and +4% melee reach",                               rarity: "common" },
  { id: "shock_stance",   kanji: "震", name: "Shockwave Stance",desc: "+20% area and +8% melee reach",                                rarity: "rare" },
  { id: "heaven_earth",   kanji: "乾", name: "Heaven and Earth",desc: "+35% area and +12% melee reach, but −10% attack speed",       rarity: "legendary" },
  { id: "extra_kunai",    kanji: "苦", name: "Extra Kunai",     desc: "Thrown and shot weapons fire +1 projectile",                  rarity: "common" },
  { id: "piercing_shot",  kanji: "貫", name: "Piercing Shot",   desc: "Projectiles pass through +1 more foe",                        rarity: "rare" },
  { id: "steel_storm",    kanji: "嵐", name: "Storm of Steel",  desc: "+1 projectile, +1 pierce and +15% projectile speed",          rarity: "legendary" },
  { id: "lucky_charm",    kanji: "福", name: "Lucky Charm",     desc: "+10% luck (rarer cards and shop items, more item drops)",     rarity: "common" },
  { id: "fortune_favor",  kanji: "運", name: "Fortune's Favour",desc: "+25% luck",                                                    rarity: "rare" },
  { id: "diligent",       kanji: "勉", name: "Diligent Study",  desc: "+10% XP gained",                                              rarity: "common" },
  { id: "scholar_scroll", kanji: "巻", name: "Scholar's Scroll",desc: "+20% XP gained",                                              rarity: "rare" },
  { id: "magnet_charm",   kanji: "磁", name: "Magnet Charm",    desc: "+30% pickup radius",                                          rarity: "common" },
  { id: "spirit_pull",    kanji: "引", name: "Spirit Pull",     desc: "+60% pickup radius",                                          rarity: "rare" },
  { id: "frostbite",      kanji: "凍", name: "Frostbite Edge",  desc: "+12% chance to chill on hit (slows the foe for 2s)",           rarity: "common" },
  { id: "deep_freeze",    kanji: "氷", name: "Deep Freeze",     desc: "Hitting a chilled foe 3 times freezes it solid for 1s",       rarity: "rare" },
  { id: "winters_heart",  kanji: "冬", name: "Winter's Heart",  desc: "Frozen foes shatter when killed, hurting everything nearby", rarity: "legendary" },
  { id: "thick_hide",    kanji: "皮", name: "Thick Hide",     desc: "+2 defense (blocks a share of every hit)",                   rarity: "common" },
  { id: "quick_draw",    kanji: "抜", name: "Quick Draw",     desc: "Dash recharges 15% faster",                                 rarity: "common" },
  { id: "scavenger",     kanji: "拾", name: "Scavenger",      desc: "+20% coins from kills",                                     rarity: "common" },
  { id: "glass_cannon",  kanji: "硝", name: "Glass Cannon",   desc: "+35% damage, but −20% max HP",                              rarity: "rare" },
  { id: "exploit",       kanji: "破", name: "Exploit Weakness", desc: "+40% damage to stunned, slowed or webbed foes",          rarity: "rare" },
  { id: "dash_strike",   kanji: "突", name: "Piercing Dash",  desc: "Dashing through foes deals 3× damage",                       rarity: "rare" },
  { id: "spirit_flow",   kanji: "気", name: "Spirit Flow",    desc: "Ultimate charges 30% faster",                               rarity: "rare" },
  { id: "bounty_hunter", kanji: "賞", name: "Bounty Hunter",  desc: "Elite kills give +3 coins and heal 2 HP",                   rarity: "rare" },
  { id: "haste",         kanji: "速", name: "Battle Rhythm",  desc: "Ability cooldowns recover 20% faster",                     rarity: "rare" },
  { id: "reaper",        kanji: "冥", name: "Reaper's Toll",  desc: "Every 10th kill releases a soul shockwave",                 rarity: "legendary" },
  { id: "last_stand",    kanji: "背", name: "Last Stand",     desc: "Below 30% HP: +50% damage and −20% damage taken",          rarity: "legendary" },
  { id: "fox_companion", kanji: "狐", name: "Spirit Fox",     desc: "A homing foxfire leaps from you every 4s",                  rarity: "legendary" },
];

interface Perks {
  dashCdMul: number;        // multiplies dash cooldown
  dashDmgMul: number;       // multiplies dash contact damage
  ultPowerMul: number;      // ULTPERK Honed/Fierce Spirit
  rerolls: number;          // level-up rerolls left this run
  banishes: number;         // level-up banishes left this run
  banished: string[];       // perk / ability ids removed from the pool this run
  shopLocks: ShopItem[];    // SHOPLOCK: up to 2 shop items held for later
  shopPity: number;         // SHOP RARITY: rolls in a row without a legendary
  softRaw: Record<string, { base: number; raw: number; eff: number }>;   // SOFTCAP raw totals behind curved stats
  weaponMastery: Record<string, number>;  // damage upgrades bought per weapon (evolutions)
  shopBought: string[];     // shop effects bought this run (evolution catalysts)
  evolved: string[];        // evolved weapon ids
  duos: string[];           // duo perk ids owned
  monMul: number;           // multiplies coins from kills
  eliteBounty: number;      // bonus coins (+2 HP) per elite kill
  ultChargeMul: number;     // multiplies ultimate charge gained
  abilityHaste: number;     // ability cooldowns tick this much faster
  exploitMul: number;       // bonus damage vs stunned/slowed/webbed foes
  lastStand: boolean;       // below 30% HP: +50% damage, −20% damage taken
  reaperEvery: number;      // every N kills, a soul shockwave (0 = off)
  foxCompanion: boolean;    // a homing foxfire every 4s
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
  critDmgRaw: number;          // CRIT STEP: raw crit damage bonus (soft-capped, added to the 3× base)
  hawkEye: boolean;            // CRIT STEP: +5 crit points for 2s after a dash
  critMark: boolean;           // CRIT STEP: crits mark foes (+10% damage taken for 3s)
  deathBlossom: boolean;       // CRIT STEP: crits splash 40% to nearby foes
  areaBonus: number;           // STEP 3 (soft-capped): +area for AoE / explosions
  luck: number;                // STEP 3 (soft-capped)
  xpBonus: number;             // STEP 3 (soft-capped)
  pickupBonus: number;         // STEP 3 (soft-capped)
  frostChance: number;         // STEP 3 (soft-capped): chill on hit
  extraProjectiles: number;    // STEP 3: hard cap +4
  pierceBonus: number;         // STEP 3: hard cap +3
  projSpeedBonus: number;      // STEP 3
  deepFreeze: boolean;
  wintersHeart: boolean;
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
  dashCdMul: 1,
  dashDmgMul: 1,
  ultPowerMul: 1,
  rerolls: 2,
  banishes: 2,
  banished: [],
  shopLocks: [],
  shopPity: 0,
  softRaw: {},
  weaponMastery: {},
  shopBought: [],
  evolved: [],
  duos: [],
  monMul: 1,
  eliteBounty: 0,
  ultChargeMul: 1,
  abilityHaste: 1,
  exploitMul: 0,
  lastStand: false,
  reaperEvery: 0,
  foxCompanion: false,
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
  critDmgRaw: 0,
  hawkEye: false,
  critMark: false,
  deathBlossom: false,
  areaBonus: 0, luck: 0, xpBonus: 0, pickupBonus: 0, frostChance: 0,
  extraProjectiles: 0, pierceBonus: 0, projSpeedBonus: 0, deepFreeze: false, wintersHeart: false,
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
// ULTPERK: ultimate perks join the level-up pool (class ones are filtered by class).
PERK_POOL.push(...ULT_PERKS.map(({ id, kanji, name, desc, rarity }) => ({ id, kanji, name, desc, rarity })));

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
  kitsune:    { name: "Kitsune",         kanji: "狐",  ultName: "Nine Tails",            ultKanji: "九" },
  raijin:     { name: "Raijin",          kanji: "雷",  ultName: "Heaven's Drum",         ultKanji: "鼓" },
  yukionna:   { name: "Yuki-onna",       kanji: "雪",  ultName: "Eternal Winter",        ultKanji: "冬" },
  sohei:      { name: "Sohei",           kanji: "僧",  ultName: "Prayer Wheel",          ultKanji: "輪" },
  ashigaru:   { name: "Ashigaru",        kanji: "足",  ultName: "Spear Wall",            ultKanji: "槍" },
  kappa:      { name: "Kappa",           kanji: "河",  ultName: "Tidal Surge",           ultKanji: "潮" },
  tengu:      { name: "Tengu",           kanji: "天",  ultName: "Divine Wind",           ultKanji: "風" },
  kabuki:     { name: "Kabuki",          kanji: "歌",  ultName: "Grand Finale",          ultKanji: "幕" },
  teppo:      { name: "Teppō",           kanji: "砲",  ultName: "Three Ranks Fire",      ultKanji: "斉" },
  takajo:     { name: "Takajō",          kanji: "鷹",  ultName: "Sky Hunt",              ultKanji: "狩" },
  karakuri:   { name: "Karakuri-shi",    kanji: "機",  ultName: "Clockwork Battalion",   ultKanji: "繰" },
  bakuto:     { name: "Bakuto",          kanji: "賽",  ultName: "Roll of Fate",          ultKanji: "運" },
  rikishi:    { name: "Rikishi",         kanji: "力",  ultName: "Dohyō Stomp",           ultKanji: "土" },
  sumie:      { name: "Sumi-e Painter",  kanji: "墨",  ultName: "Living Ink",            ultKanji: "虎" },
};

export const SLASH_HUE: Partial<Record<SecondaryId, number>> = {
  katana: 40, tessen: 330, jutte: 200, ono: 18, twin_sai: 160, tate: 45, odachi: 265, flame_spear: 22,
};

export const ABILITY_FX_HUE: Record<string, number> = {
  barrage: 40, flash: 200, whirlwind: 330, timeslow: 210, bladestorm: 0, phantom_slash: 358,
  death_mark: 358, soul_rend: 280, deflect: 45, smoke_bomb: 220, war_horn: 42, execution: 358,
  fireball: 20, lightning: 52,
};

// Damage/HP text: two decimals below 1, one below 10, so small hits aren't shown as "1".
export function fmtNum(n: number): string {
  const v = Math.max(0, n);
  if (v >= 10) return String(Math.round(v));
  if (v > 0 && v < 0.01) return "0.01";
  if (v < 1) return String(Math.round(v * 100) / 100);
  const r = Math.round(v * 10) / 10;
  return Number.isInteger(r) ? String(r) : r.toFixed(1);
}

// XP needed to go from `level` to `level + 1`. Quadratic so levels arrive
// about once per wave after the first, instead of in early bursts.
export const xpForLevel = (level: number): number => Math.round(42 + 7 * level * level);

// Shop prices rise with the wave so late-game income can't buy everything.
const shopInflation = (wave: number): number => (1 + 0.15 * Math.max(0, wave - 1)) * lateInflation(wave);   // 7.7: faster after wave 8

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
      level: 1, xp: 0, xpToNext: xpForLevel(1),
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
      buffHasteRemaining: 0,
      buffLuckRemaining: 0,
      lastItemId: null,
      lastItemText: "",
      lastItemSeq: 0,
      biomeId: "tsushima",
      biomeName: BIOMES.tsushima.name,
      biomeKanji: BIOMES.tsushima.kanji,
      derivedStats: {
        damage: BASE.ATTACK_DAMAGE,
        dexterity: 0,
        defense: 0,
        moveSpeedPct: 100,
        defensePct: 0,
        attackSpeedPct: 100,
        critChancePct: 0,
        critMul: 3,
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
  hazards: Hazard[] = [];
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
  ultThousandCutsTimer = 0;
  spriteBodyDrawn = false;   // last frame drew the pixel-art body (ult VFX adapt to it)
  kitsuneTailsT = 0;           // ult visual pass 2: Nine Tails fan-out on cast   // Onna ult — spinning AoE active duration
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
  raijinHitChain = 0;
  raijinZapping = false;
  ultThunderTimer = 0;
  ultThunderTick = 0;
  ultPhantomTimer = 0;          // Kunoichi Phantom Dance
  ultPhantomImages: PhantomImage[] = [];
  /** Phantom Dance: centre of the slash flurry and timers. */
  phantom = { t: 0, cx: 0, cy: 0, hitAcc: 0, slashAcc: 0, finished: false };
  /** Movement input redirected to steer Phantom Dance (WASD / stick instead of the body). */
  private phantomMove = { x: 0, y: 0 };
  private phantomSteering() { return this.ultPhantomTimer > 0 && this.phantom.t < PD.flurryEnd; }
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
  shakeScale = 1;
  fx = new Fx();
  ultCutscene: { t: number; dur: number } | null = null;
  roninDebt: { ids: number[]; t: number; dmg: number } | null = null;
  beamPos: Vec2 = { x: 0, y: 0 };
  ultBlizzardTimer = 0;
  spearWall: { x: number; y: number; ang: number; len: number; t: number; tick: number } | null = null;
  tideWave: { x: number; y: number; ang: number; dist: number; max: number; width: number; carried: Set<number> } | null = null;
  thunderCd = 0;
  ultCutscenes = true;
  ultPose: { t: number; dur: number } | null = null;
  ultPrayerTimer = 0;
  ultPrayerTick = 0;
  ultArrowTimer = 0;
  ultArrowTick = 0;
  difficulty: Difficulty = "normal";
  vows: VowSet = {};          // VOW ranks sworn for this run (set by the menu before start)
  endless = false;            // VICTORY: true after choosing "Continue (Endless)"
  private victoryPending = false;
  vr(id: VowId) { return vowRank(this.vows, id); }
  get vowScore() { return vowScore(this.vows); }
  // ===================== OMEN + ARENA SHRINE (Phase 16) =====================
  /** Omen active for the current wave. */
  omen: OmenId | null = null;
  /** Two omens offered in the shop for the next wave (empty = none offered). */
  omenOffer: OmenId[] = [];
  /** Extra enemy damage from a Cursed Offering this wave. */
  curseDmgIn = 1;
  arenaShrine: { id: ArenaShrineId; x: number; y: number; hold: number; t: number } | null = null;
  get omenDef(): OmenDef | null { return this.omen ? OMEN_BY_ID[this.omen] : null; }
  private rollOmens(): OmenId[] {
    const pool = OMENS.map(o => o.id);
    const a = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
    const b = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
    return [a, b];
  }
  /** Maybe place an arena shrine at the start of a wave. */
  private maybeSpawnArenaShrine(wave: number) {
    this.arenaShrine = null;
    if (wave < 4 || wave % 5 === 0 || Math.random() >= ARENA_SHRINE_CHANCE) return;
    const id = ARENA_SHRINES[Math.floor(Math.random() * ARENA_SHRINES.length)].id;
    const at = this.pickSpawnAwayFromPlayer(220);
    this.arenaShrine = { id, x: at.x, y: at.y, hold: 0, t: 0 };
    const d = ARENA_SHRINE_BY_ID[id];
    this.flash(`${d.kanji} A ${d.name} has appeared. Stand in it to trade.`);
  }
  private updateArenaShrine(dt: number) {
    const sh = this.arenaShrine;
    if (!sh || !this.player) return;
    sh.t += dt;
    const inside = Math.hypot(this.player.pos.x - sh.x, this.player.pos.y - sh.y) < ARENA_SHRINE_R;
    sh.hold = inside ? sh.hold + dt : Math.max(0, sh.hold - dt * 2);
    if (sh.hold >= ARENA_SHRINE_HOLD) this.acceptArenaShrine();
  }
  /** Grant a random passive perk of at least this rarity (falls back to anything). */
  private grantRandomPerk(minRarity: "rare" | "legendary") {
    const ok = (r: string) => minRarity === "legendary" ? r === "legendary" : r === "rare" || r === "legendary";
    let pick: PerkChoice | undefined, any: PerkChoice | undefined;
    for (let i = 0; i < 12 && !pick; i++) {
      for (const c of this.rollPerkChoicesInner()) {
        if (c.kind === "ability" || c.duo || ABILITY_POOL.some(a => a.id === c.id)) continue;
        any ??= c;
        if (ok(c.rarity)) { pick = c; break; }
      }
    }
    const c = pick ?? any;
    if (!c) return;
    this.applyPerk(c.id);
    this.enforceStatCaps();
    this.acquiredPerks.push(c.id);
    this.stats.perks = [...this.acquiredPerks];
    this.spawnFloatText(this.player.pos, `+ ${c.name}`, { color: "hsl(48 90% 70%)", size: 15, vy: -60 });
  }
  private acceptArenaShrine() {
    const sh = this.arenaShrine;
    if (!sh) return;
    this.arenaShrine = null;
    this.run.altars++;
    const p = this.player;
    switch (sh.id) {
      case "blood_pact": {
        const loss = Math.round(p.maxHp * 0.2);
        p.maxHp = Math.max(10, p.maxHp - loss); this.stats.maxHp = p.maxHp;
        p.hp = Math.min(p.hp, p.maxHp); this.stats.hp = p.hp;
        this.grantRandomPerk("legendary");
        break;
      }
      case "cursed_offering":
        this.curseDmgIn = 1.25;
        this.spiritChests.push({ x: sh.x, y: sh.y, life: ELITE.chestLife, t: 0 });
        break;
      case "gamblers_altar":
        this.stats.mon = Math.floor(this.stats.mon * 0.6);
        this.grantRandomPerk("rare");
        break;
      case "spirit_well":
        p.hp = Math.max(1, Math.round(p.hp * 0.7)); this.stats.hp = p.hp;
        this.stats.ultCharge = this.stats.ultMax;
        this.perks.rerolls += 1;
        break;
    }
    const d = ARENA_SHRINE_BY_ID[sh.id];
    this.flash(`${d.kanji} ${d.name}: ${d.reward}`);
    this.emitEvent({ t: "choice", id: `shrine:${sh.id}` });
    this.fx.shockwave(sh.x, sh.y, 110, { hue: d.hue, light: 65, life: 0.5, width: 6 });
    audio.play("levelUp");
    this.emitStats();
  }
  private drawArenaShrine() {
    const sh = this.arenaShrine;
    if (!sh) return;
    const ctx = this.ctx, d = ARENA_SHRINE_BY_ID[sh.id], R = ARENA_SHRINE_R;
    const pulse = 0.5 + Math.sin(sh.t * 3) * 0.5;
    ctx.save();
    ctx.fillStyle = `hsla(${d.hue}, 70%, 45%, ${0.12 + pulse * 0.08})`;
    ctx.beginPath(); ctx.arc(sh.x, sh.y, R, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = `hsla(${d.hue}, 90%, 70%, 0.9)`; ctx.lineWidth = 2;
    ctx.setLineDash([6, 5]); ctx.lineDashOffset = -sh.t * 20;
    ctx.beginPath(); ctx.arc(sh.x, sh.y, R, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    if (sh.hold > 0) {
      ctx.strokeStyle = "hsl(45, 100%, 70%)"; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.arc(sh.x, sh.y, R + 6, -Math.PI / 2, -Math.PI / 2 + (sh.hold / ARENA_SHRINE_HOLD) * Math.PI * 2); ctx.stroke();
    }
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.font = '700 30px "Noto Serif JP", "Yu Mincho", serif';
    ctx.fillStyle = `hsl(${d.hue}, 90%, 78%)`;
    ctx.fillText(d.kanji, sh.x, sh.y + 1);
    ctx.font = "bold 12px system-ui, sans-serif";
    const l1 = d.name, l2 = `${d.cost} → ${d.reward}`;
    const w = Math.max(ctx.measureText(l1).width, ctx.measureText(l2).width) + 14;
    ctx.fillStyle = "rgba(0,0,0,0.75)"; ctx.fillRect(sh.x - w / 2, sh.y - R - 42, w, 34);
    ctx.fillStyle = `hsl(${d.hue}, 90%, 75%)`; ctx.fillText(l1, sh.x, sh.y - R - 32);
    ctx.font = "11px system-ui, sans-serif"; ctx.fillStyle = "#eee"; ctx.fillText(l2, sh.x, sh.y - R - 17);
    ctx.restore();
  }

  // ===================== POLISH (Phase 18) =====================
  static readonly MAGNET_R = 130;
  /** Show the XP pickup radius while orbs are nearby (settings toggle). */
  showPickupRadius = false;
  /** Haptics hook (phones): "hit" | "deflect" | "ult". Set by the UI. */
  onHaptic?: (kind: "hit" | "deflect" | "ult") => void;
  private drawPickupRadius() {
    if (!this.showPickupRadius || !this.player || !this.xpOrbs.length) return;
    const R = GhostGame.MAGNET_R * this.pickupMul(), p = this.player.pos;
    const near = this.xpOrbs.some(o => Math.hypot(o.pos.x - p.x, o.pos.y - p.y) < R * 2.2);
    if (!near) return;
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = "hsla(190, 90%, 70%, 0.45)"; ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 6]); ctx.lineDashOffset = -this.elapsed * 12;
    ctx.beginPath(); ctx.arc(p.x, p.y, R, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }

  /** A11Y options (set by the UI). colorblind: 0 off, 1 red-green safe, 2 blue-yellow safe. */
  a11y = { colorblind: 0 as 0 | 1 | 2, bigNumbers: false, outline: false };
  /** A11Y Assist mode: fraction of enemy damage removed (0 = off). Runs show an "Assist" tag. */
  assistDR = 0;
  /** Hue used for "danger" telegraphs. */
  get dangerHue() { return this.a11y.colorblind === 1 ? 50 : this.a11y.colorblind === 2 ? 300 : 0; }
  /** SHRINE bonuses for this run (set by the menu before start; NO_META when the shrine is off). */
  meta: MetaBonus = { ...NO_META };
  bagFullWarnAt = -99;
  reaperCount = 0;
  foxTimer = 4;
  arena = new Arena();
  baseKatanaDamage = 1;
  fireAnim = 0;
  abilityPose: { id: string; t: number; dur: number } | null = null;
  saiAnim: [number, number] = [0, 0];
  autoSwapTimer = 0;
  kappaHitChain = 0;
  kappaSplashing = false;
  ultWindTimer = 0;
  ultWindTick = 0;
  ultFinaleTimer = 0;
  kabukiHealCd = 0;
  saiNext = 0;
  inkGrain = new InkGrain();
  parallax = new ParallaxLayer();
  cameraZoom = new CameraZoom();
  katanaTrail = new KatanaTrail();
  /** NAV: edge arrows to off-screen altars / chests / items / boss, and the minimap (Settings). */
  showPointers = true;
  showMinimap = true;
  showCursor = true; cursorInside = true; cursorT = 0; cursorSpin = 0; cursorKick = 0; cursorScale = 1; minimapScale = 1;
  /** v3.7 pixel sprites: on/off + per-player animation state. */
  useSprites = true;
  /** True for the frame the sprite body itself is playing the ult move (code pose is skipped). */
  sprUltPose = false;
  sprBare = false;   // the pixel body is the weaponless version this frame (a non-katana weapon is in hand)
  /** Ghost copies of the player (phantoms, clones, decoys) drawn through drawPlayer. */
  ghostLook: { variant?: SprVariant; outline?: string; moving?: boolean } | null = null;
  sprPrev = { x: 0, y: 0, mv: 0, lastAtk: 0, atkIdx: 0, face: 1, vert: false, vx: 0, vy: 0, lastT: 0, throwT: 0, lastFire: 0, dustT: 0, dust: [] as { x: number; y: number; vx: number; vy: number; age: number; life: number; r: number }[] };
  /** WARDROBE: the player's equipped cosmetics (set by the UI before a run; null = classic look). */
  look: Look | null = null;
  private lookPrev = { x: 0, y: 0, sway: 0 };
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
    this.wrapDamageSources();
    this.wrapSeededStreams();
  }

  // ===================== DAILY: seeded randomness =====================
  /** Date key ("2026-11-20") when this is a Daily run, else "". */
  daily = "";
  private rngStreams: Record<string, () => number> = {};
  /** During a Daily, the systems that decide the run (spawns, cards, shop,
   *  chests) each draw from their own seeded stream, so everyone gets the same
   *  run no matter their frame rate. Visual randomness stays unseeded. */
  private wrapSeededStreams() {
    const table: Record<string, (args: unknown[]) => string> = {
      spawnWave: a => `wave:${a[0]}`,
      spawnSingleEnemy: a => `wave:${a[0]}`,
      rollPerkChoices: () => "perk",
      rollOfferWithLocks: () => "shop",
      openSpiritChest: () => "chest",
      rollOmens: () => "omen",
      maybeSpawnArenaShrine: a => `shrine:${a[0]}`,
    };
    const self = this as unknown as Record<string, (...a: unknown[]) => unknown>;
    for (const [name, keyOf] of Object.entries(table)) {
      const fn = self[name];
      if (typeof fn !== "function") continue;
      self[name] = (...args: unknown[]) => {
        if (!this.daily) return fn.apply(this, args);
        const key = keyOf(args);
        const stream = (this.rngStreams[key] ??= mulberry32(hashStr(`${this.daily}|${key}`)));
        const prev = Math.random;
        Math.random = stream;
        try { return fn.apply(this, args); } finally { Math.random = prev; }
      };
    }
  }

  // ===================== RECAP: damage-by-source tracking =====================
  /** Label for damage dealt right now when the hit itself doesn't say (set by the system that's running). */
  dmgSrc: string | null = null;
  /** Hits taken in the last few seconds, for the death recap. */
  recentHits: { t: number; by: string; dmg: number }[] = [];

  /** Tag every damage-dealing system with a label so dealDamage knows who hit. */
  private wrapDamageSources() {
    const ult = "Ultimate";
    const table: Record<string, string> = {
      executeUltimate: ult, updatePhantomDance: ult, updatePhaseCUltimates: ult, castIaiChain: ult,
      updateIaiChain: ult, iaiChainStep: ult, ultAftershock: ult, resolveStandoff: ult,
      castBarrage: "Barrage", barrageSwing: "Barrage", castFlashStep: "Flash Step", castWhirlwind: "Whirlwind",
      whirlwindSwing: "Whirlwind", castBladeStorm: "Blade Storm", bladeStormSwing: "Blade Storm",
      castPhantomSlash: "Phantom Slash", castSoulRend: "Soul Rend", castExecution: "Execution",
      castFireball: "Fireball", castLightning: "Lightning", chainZap: "Lightning", updateAbilities: "Abilities",
      updateClassPassives: "Class powers", updatePhaseCPassives: "Class powers", updateClassEntities: "Class powers",
      updateSecondaries: "Weapons", updateSecProjectiles: "Weapons", swingMeleeSecondary: "Weapons", updateArcBombs: "Arc bombs",
      updateEvo: "Evolutions & duos", onEvoHit: "Evolutions & duos", updateInk: "Evolutions & duos",
      updateSignatures: "Signature", useConsumable: "Items", killEnemy: "On-kill effects",
    };
    const self = this as unknown as Record<string, (...a: unknown[]) => unknown>;
    for (const [name, label] of Object.entries(table)) {
      const fn = self[name];
      if (typeof fn !== "function") continue;
      self[name] = (...args: unknown[]) => {
        const prev = this.dmgSrc;
        this.dmgSrc = label;
        try { return fn.apply(this, args); } finally { this.dmgSrc = prev; this.ultHitFlag = false; }
      };
    }
  }

  /** Record damage taken from an attacker (run total, per wave, and the last 10 s). */
  trackTaken(by: string, amt: number) {
    if (!(amt > 0)) return;
    if (by === "arrow") by = "archer";
    this.run.takenBy[by] = (this.run.takenBy[by] ?? 0) + amt;
    const w = (this.run.takenWave[this.stats.wave] ??= {});
    w[by] = (w[by] ?? 0) + amt;
    this.recentHits.push({ t: this.run.time, by, dmg: amt });
    while (this.recentHits.length && this.run.time - this.recentHits[0].t > 10) this.recentHits.shift();
  }

  /** Damage taken in the 10 seconds before now (or before death), grouped by attacker. */
  recentTaken(): Record<string, number> {
    const out: Record<string, number> = {};
    for (const h of this.recentHits) if (this.run.time - h.t <= 10) out[h.by] = (out[h.by] ?? 0) + h.dmg;
    return out;
  }

  /** Record damage dealt under a source label. */
  trackDealt(label: string, amt: number, addToTotal = true) {
    if (!(amt > 0)) return;
    this.run.dmgBy[label] = (this.run.dmgBy[label] ?? 0) + amt;
    // Damage that doesn't go through dealDamage (DoTs, dash, deflect, thorns…)
    // still belongs in the run's total, so the breakdown adds up to 100%.
    if (addToTotal) this.run.damageDealt += amt;
  }
  /** BOSS CAP: how much of this source's current-cast allowance is left on this boss. */
  private bossCap(e: Enemy, label: string, amount: number): number {
    const capShare = BOSS_CAST_CAPS[label];
    if (capShare === undefined) return amount;
    const cast = this.castIds[label] ?? 0;
    const rec = ((e.castCap ??= {})[label] ??= { cast, dealt: 0 });
    if (rec.cast !== cast) { rec.cast = cast; rec.dealt = 0; rec.shown = false; }
    const room = Math.max(0, e.maxHp * capShare - rec.dealt);
    const out = Math.min(amount, room);
    if (out <= 0) {
      e.hitFlash = Math.max(e.hitFlash, 0.3);
      if (!rec.shown) { rec.shown = true; this.spawnFloatText(e.pos, "Resists", { color: "hsl(210 30% 80%)", size: 12 }); }
    }
    rec.dealt += out;
    return out;
  }
  /** BOSS CAP: how many times each capped source has been cast this run. */
  castIds: Record<string, number> = {};
  /** RECAP: set by ultDmg(); the next dealDamage counts as ultimate damage. */
  private ultHitFlag = false;
  /** Which bar a dealDamage hit belongs to. */
  private hitLabel(weaponSource?: SecondaryId | "katana"): string {
    const ult = this.ultHitFlag;
    this.ultHitFlag = false;
    if (this.evoNested) return "Evolutions & duos";
    if (weaponSource) return SECONDARIES[weaponSource]?.name ?? weaponSource;
    if (this.dmgSrcOverride) return this.dmgSrcOverride;
    if (ult) return "Ultimate";
    // Ult helpers that live on after the cast (arrow storms, ghosts, clones, waves…).
    if (this.dmgSrc === "Class powers" && this.stats.ultActive) return "Ultimate";
    if (this.dmgSrc === "Lightning" && this.ultThunderTimer > 0) return "Ultimate";   // Raijin's Heaven's Drum
    return this.dmgSrc ?? "Other";
  }
  /** Explicit label for one effect inside a bigger system (e.g. a perk inside class passives). */
  private dmgSrcOverride: string | null = null;

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
    this.rngStreams = {};
    this.applyClassBonuses(cid);
    // SHRINE: small permanent bonuses.
    const M = this.meta;
    this.perks.rerolls += M.rerolls; this.perks.banishes += M.banishes;
    this.perks.monMul *= M.monMul; this.perks.maxHpBonus += M.maxHp;
    this.perks.damageTakenMul *= M.damageTakenMul; this.perks.speedMul *= M.speedMul;
    this.perks.dashCdMul *= M.dashCdMul; this.perks.ultChargeMul *= M.ultChargeMul;
    if (M.secondLife) this.perks.hasSecondWind = true;
    this.initSoftStats();   // SOFTCAP: everything above is the run's starting point
    this.baseKatanaDamage = this.perks.damage;
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
    this.hazards = [];
    this.firePatches = [];
    this.spiritChests = [];
    this.seenAffixes = new Set();
    this.evoWaves = []; this.evoZones = []; this.evoOrbits = [];
    this.inkPools = []; this.playerRoot = 0;
    this.endless = false; this.victoryPending = false;
    this.stillTimer = 0; this.vanishTimer = 0; this.prayerShield = 0; this.tailwindStacks = 0; this.tailwindTimer = 0;
    this.feathers = []; this.braceCd = new Map(); this.forceCrit = false;
    this.evoShield = 0; this.katanaSwings = 0; this.saiHits = 0;
    this.cinematicTimer = 0;
    this.fx.clear();
    this.ultCutscene = null;
    this.ultPose = null;
    this.roninDebt = null;
    this.ultBlizzardTimer = 0;
    this.spearWall = null;
    this.tideWave = null;
    this.ultPrayerTimer = 0;
    this.ultArrowTimer = 0;
    this.reaperCount = 0;
    this.foxTimer = 4;
    this.kappaHitChain = 0;
    this.ultWindTimer = 0;
    this.ultFinaleTimer = 0;
    this.kabukiHealCd = 0;
    this.raijinHitChain = 0;
    this.ultThunderTimer = 0;
    this.ultThunderTick = 0;
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
    // SHRINE: starting coins, ultimate charge and items.
    this.stats.mon += M.startMon;
    this.stats.ultCharge = Math.max(this.stats.ultCharge, this.stats.ultMax * M.startUlt);
    if (M.startItem) { const slot = this.stats.consumables.findIndex(c => c === null); if (slot !== -1) this.stats.consumables[slot] = rollConsumable(); }
    for (let i = 0; i < M.startRiceBalls; i++) { const slot = this.stats.consumables.findIndex(c => c === null); if (slot !== -1) this.stats.consumables[slot] = "rice_ball"; }
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
      case "kitsune":
        this.perks.speedMul *= 1.10;
        this.perks.fireChance = Math.max(this.perks.fireChance, 0.15);
        break;
      case "raijin":
        this.perks.maxHpBonus += 10;
        break;
      case "yukionna":
        this.perks.maxHpBonus += 10;
        break;
      case "ashigaru":
        this.perks.maxHpBonus += 15;
        this.perks.knockbackMul *= 1.25;
        break;
      case "kappa":
        this.perks.hpRegen += 0.3;
        break;
      case "tengu":
        this.perks.speedMul *= 1.15;
        break;
      case "kabuki":
        this.perks.critChance += 0.15;
        break;
      case "teppo": case "takajo": case "karakuri": case "bakuto": case "rikishi": case "sumie":
        resetNewClasses(this);
        startNewClass(this, this.stats.classId);   // STEP 5
        break;
      case "sohei":
        this.perks.maxHpBonus += 35;
        this.perks.speedMul *= 0.95;
        this.perks.blockHpBase += 15;
        this.perks.blockRegen += 1.0;
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

  // ===== Stats helpers =====
  // Effective fireCooldown for a weapon, factoring in Dexterity scaled by
  // the weapon's per-weapon dexScale. 1 point Dex = ~1.5% atk-speed at
  // dexScale=1. Result is also clamped by MIN_ATTACK_COOLDOWN_MUL via the
  // attackCooldownMul, then by an additional Dex floor of 0.4.
  private dexCooldownMul(dexScale: number): number {
    const raw = Math.max(0, this.perks.dexterity + (this.stats.buffHasteRemaining > 0 ? 15 : 0));
    // Diminishing curve: attack speed approaches +150% but never reaches it.
    return Math.max(1 / STAT_CAPS.attackSpeedMax, 1 / dexAttackSpeed(raw * Math.max(0, dexScale)));
  }

  /** Katana swing cooldown multiplier — every attack-speed source, capped. */
  private katanaCdMul(): number {
    return Math.max(1 / STAT_CAPS.attackSpeedMax, this.perks.attackCooldownMul * this.dexCooldownMul(0.8));
  }

  /** Clamp every stackable stat to STAT_CAPS (shop, perks, and loaded saves). */
  /** SOFTCAP: remember each curved stat's starting value for this run. */
  private initSoftStats() {
    const P = this.perks as unknown as Record<string, number>;
    this.perks.softRaw = {};
    for (const key of Object.keys(SOFT_STATS)) {
      const v = Number.isFinite(P[key]) ? P[key] : 0;
      this.perks.softRaw[key] = { base: v, raw: v, eff: v };
    }
  }
  /** SOFTCAP: fold any change since last time into the raw total, then apply the curve. */
  private applySoftStats() {
    const P = this.perks as unknown as Record<string, number>;
    const S = (this.perks.softRaw ??= {});
    for (const [key, cfg] of Object.entries(SOFT_STATS)) {
      const cur = Number.isFinite(P[key]) ? P[key] : 0;
      const st = (S[key] ??= { base: cur, raw: cur, eff: cur });
      if (Math.abs(cur - st.eff) > 1e-9) st.raw += cur - st.eff;
      st.eff = softStat(cfg.mode, st.base, st.raw, cfg.k, cfg.max);
      P[key] = st.eff;
    }
  }

  enforceStatCaps() {
    const P = this.perks, C = STAT_CAPS;
    const fin = (v: number, d: number) => (Number.isFinite(v) ? v : d);
    this.applySoftStats();   // SOFTCAP: curves first, hard caps below are only backstops
    P.extraProjectiles = Math.min(4, fin(P.extraProjectiles, 0));   // STEP 3
    P.pierceBonus = Math.min(3, fin(P.pierceBonus, 0));
    P.damage = Math.min(MAX_KATANA_DAMAGE, fin(P.damage, 3));
    P.dexterity = Math.min(C.dexMaxRaw, fin(P.dexterity, 0));
    P.defense = Math.min(C.defenseMax, Math.max(0, fin(P.defense, 0)));
    P.classDamageMul = Math.min(C.classDamageMul, fin(P.classDamageMul, 1));
    P.secondaryDmgMul = Math.min(C.secondaryDmgMul, fin(P.secondaryDmgMul, 1));
    P.critChance = Math.min(C.critPointsMax, fin(P.critChance, 0));
    P.hpRegen = Math.min(C.hpRegen, fin(P.hpRegen, 0));
    P.monMul = Math.min(C.monMul, fin(P.monMul, 1));
    P.ultChargeMul = Math.min(C.ultChargeMul, fin(P.ultChargeMul, 1));
    P.abilityHaste = Math.min(C.abilityHaste, fin(P.abilityHaste, 0));
    P.dashCdMul = Math.max(C.dashCdMul, fin(P.dashCdMul, 1));
    P.secondaryRegenMul = Math.max(C.secondaryRegenMul, fin(P.secondaryRegenMul, 1));
    P.invulnBonus = Math.min(C.invulnBonus, fin(P.invulnBonus, 0));
    P.fireChance = Math.min(C.fireChance, fin(P.fireChance, 0));
    P.lightningChance = Math.min(C.lightningChance, fin(P.lightningChance, 0));
    P.healOnKill = Math.min(C.healOnKill, fin(P.healOnKill, 0));
    P.eliteBounty = Math.min(C.eliteBounty, fin(P.eliteBounty, 0));
    P.attackCooldownMul = Math.max(MIN_ATTACK_COOLDOWN_MUL, fin(P.attackCooldownMul, 1));
    P.speedMul = Math.min(C.speedMulMax, fin(P.speedMul, 1));
    P.maxHpBonus = Math.min(C.maxHpBonus, fin(P.maxHpBonus, 0));
    if (this.player) {
      this.player.maxHp = Math.min(this.player.maxHp, 100 + C.maxHpBonus);
      this.player.hp = Math.min(this.player.hp, this.player.maxHp);
    }
  }

  /** "Now → after" preview for shop items on curved stats (null for others). */
  shopPreview(effect: string): string | null {
    const P = this.perks;
    const pc = (v: number) => `${Math.round(v * 100)}%`;
    const def: Record<string, number> = { def_rare: 2, def_leg: 4 };
    const dex: Record<string, number> = { dex_common: 3, dex_rare: 6, dex_leg: 12 };
    const spd: Record<string, number> = { spd_common: 1.05, spd_rare: 1.08, spd_leg: 1.15, perk_ghost_steps: 1.05, perk_drifting_leaves: 1.05 };
    const crit: Record<string, number> = { crit: 0.08, perk_cursed_eye: 0.05, shop_whetted_eye: 0.04, shop_night_lantern: 0.15 };
    if (effect === "shop_assassin_ledger") {
      const now = 3 + soft(P.critDmgRaw, 2, 2), next = 3 + soft(P.critDmgRaw + 0.3, 2, 2);
      return `Crit damage ×${now.toFixed(2)} → ×${next.toFixed(2)}`;
    }
    if (effect in def) return `Blocked ${pc(defenseReduction(P.defense))} → ${pc(defenseReduction(P.defense + def[effect]))}`;
    if (effect in dex) {
      const now = 1 / Math.max(1 / STAT_CAPS.attackSpeedMax, P.attackCooldownMul / dexAttackSpeed(P.dexterity * 0.8));
      const next = 1 / Math.max(1 / STAT_CAPS.attackSpeedMax, P.attackCooldownMul / dexAttackSpeed((P.dexterity + dex[effect]) * 0.8));
      return `Attack speed ${pc(now)} → ${pc(next)}`;
    }
    if (effect in spd) return `Move speed ${pc(moveSpeedFromMul(P.speedMul))} → ${pc(moveSpeedFromMul(P.speedMul * spd[effect]))}`;
    if (effect in crit) return `Crit ${pc(critFromPoints(P.critChance))} → ${pc(critFromPoints(P.critChance + crit[effect]))}`;
    return null;
  }

  /** Shop effects that would do nothing because their stat is already maxed. */
  maxedShopEffects(): Set<string> {
    const P = this.perks, C = STAT_CAPS, out = new Set<string>();
    const add = (cond: boolean, ...ids: string[]) => { if (cond) ids.forEach(i => out.add(i)); };
    add(P.speedMul >= C.speedMulMax - 1e-6, "spd_common", "spd_rare", "spd_leg", "perk_ghost_steps");
    add(P.defense >= C.defenseMax, "def_rare", "def_leg");
    add(P.dexterity >= C.dexMaxRaw || this.katanaCdMul() <= 1 / C.attackSpeedMax + 1e-6, "dex_common", "dex_rare", "dex_leg", "perk_raging_current");
    add(P.classDamageMul >= C.classDamageMul - 1e-6, "perk_crimson_blade", "perk_war_paint", "shop_gamble");
    add(P.secondaryDmgMul >= C.secondaryDmgMul - 1e-6, "secondary_dmg_global", "perk_twin_fang");
    add(P.critChance >= C.critPointsMax - 1e-6, "crit", "shop_whetted_eye", "shop_night_lantern");
    add(critFromPoints(P.critChance) < 0.15, "shop_assassin_ledger");   // CRIT STEP: crit damage needs crit first
    add(P.extraProjectiles >= 4 || !this.hasProjectileWeapon(), "shop_full_quiver");   // STEP 3
    add(P.hpRegen >= C.hpRegen - 1e-6, "hp_regen");
    add(P.monMul >= C.monMul - 1e-6, "shop_lucky_coin");
    add(P.ultChargeMul >= C.ultChargeMul - 1e-6, "shop_spirit_bell");
    add(P.abilityHaste >= C.abilityHaste - 1e-6, "shop_battle_drum");
    add(P.dashCdMul <= C.dashCdMul + 1e-6, "shop_dash_talisman");
    add(P.secondaryRegenMul <= C.secondaryRegenMul + 1e-6, "ammo_regen");
    add(P.invulnBonus >= C.invulnBonus - 1e-6, "perk_void_shard");
    add(P.fireChance >= C.fireChance - 1e-6, "shop_fire_charm");
    add(P.lightningChance >= C.lightningChance - 1e-6, "shop_thunder_charm");
    add(P.healOnKill >= C.healOnKill, "lifesteal", "perk_hungry_blade");
    add(P.eliteBounty >= C.eliteBounty, "shop_bounty");
    add(P.maxHpBonus >= C.maxHpBonus, "hp_common", "hp_rare", "hp_leg", "perk_soul_collector");
    add(P.damage >= MAX_KATANA_DAMAGE, "dmg_katana_common", "dmg_katana_rare", "dmg_katana_leg");
    add(this.vr("no_rest") > 0, "heal_full", "heal_half");   // VOW No Rest
    return out;
  }

  // Effective per-shot/swing damage for a secondary, including base scale,
  // the weapon's dmgScale, the per-weapon flat damage bonus, the global
  // secondaryDmgMul, and classDamageMul.
  effectiveSecondaryDamage(id: SecondaryId): number {
    const def = SECONDARIES[id];
    const base = this.perks.damage;
    const hit = base * def.damageMul * def.dmgScale;
    // SOFTCAP: the per-weapon flat bonus follows a curve relative to the weapon's own hit.
    const rawFlat = this.perks.weaponDamageBonus[id] || 0;
    const flat = rawFlat <= 0 ? rawFlat : hit * soft(rawFlat / Math.max(0.01, hit), WEAPON_FLAT.k, WEAPON_FLAT.max);
    // classDamageMul is applied once, in dealDamage.
    return (hit + flat) * this.perks.secondaryDmgMul;
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
    const defMul = Math.max(MIN_DAMAGE_TAKEN_MUL, this.perks.damageTakenMul) * (1 + 0.15 * this.vr("sharp_steel"));   // VOW Sharp Steel
    // Defense: a % of every hit, on a diminishing curve (max 80%).
    const armor = 1 - defenseReduction(Math.max(0, this.perks.defense));
    return Math.max(1, Math.round(raw * hpScale * defMul * armor * (1 - this.assistDR) * (this.omenDef?.dmgIn ?? 1) * this.curseDmgIn));   // A11Y Assist, OMEN, ARENA SHRINE
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
    const night = 1 + 0.2 * this.vr("long_night");   // VOW Long Night
    const breather = wave > 1 && (wave - 1) % 5 === 0 ? BOSS_PACING.breatherDuration : 1;   // 7.9
    return (isBoss ? Math.min(110, base + 25) : base) * night * breather;
  }

  // Target number of live enemies on the field for this wave.
  // Used by maybeSpawnEnemies() to continuously replenish.
  computeTargetDensity(wave: number): number {
    const isBoss = wave % 5 === 0;
    const breather = wave > 1 && (wave - 1) % 5 === 0 ? BOSS_PACING.breatherDensity : 1;   // 7.9: the wave after a boss
    const dens = DIFFICULTIES[this.difficulty].density * (1 + 0.15 * this.vr("swarm")) * (this.omenDef?.density ?? 1) * breather;   // VOW Swarm, OMEN
    if (isBoss) return Math.round(Math.min(14, 6 + Math.floor(wave / 5) * 2) * dens);
    return Math.round(Math.min(28, 5 + Math.floor(wave * 1.6) + Math.floor(wave / 2)) * dens);
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
    const n = this.enemies.length;
    this.spawnSingleEnemyInner(wave, kind);
    for (let i = n; i < this.enemies.length; i++) {
      const e = this.enemies[i];
      // VOW Iron Hide
      const hide = this.vr("iron_hide");
      if (hide) e.hp = e.maxHp = e.maxHp * (1 + 0.2 * hide);
      const om = this.omenDef;   // OMEN
      if (om?.hp && !e.isBoss) e.hp = e.maxHp = e.maxHp * om.hp;
      if (om?.speed) e.speed *= om.speed;
      if (e.isBoss && !this.seenAffixes.has("tip:boss")) {   // 7.9: first boss of the run
        this.seenAffixes.add("tip:boss");
        this.flash("Boss tip: big attacks glow before they land. Dash through them (you're invulnerable while dashing), then punish.");
      }
      const tip = NEW_ENEMY_TIPS[e.archetype] ?? NEW_ENEMY_TIPS2[e.archetype];
      if (tip && !this.seenAffixes.has(`enemy:${e.archetype}`)) { this.seenAffixes.add(`enemy:${e.archetype}`); this.flash(tip); }
      if (e.isBoss) {
        // Hard and Death bosses carry one affix.
        // Hard/Death bosses carry one affix; VOW Boss Fury adds up to two on any difficulty.
        const n = Math.max(this.difficulty === "hard" || this.difficulty === "death" ? 1 : 0, this.vr("boss_fury"));
        if (n) this.makeElite(e, rollAffixes(n, true), true);
      } else if (e.archetype !== "wisp" && e.archetype !== "mimic" && e.archetype !== "tsukumo_small" && e.archetype !== "kappa_raid" && Math.random() < ELITE.chanceAt(wave) * Math.pow(1.5, this.vr("elite_blood")) * (this.omenDef?.elite ?? 1)) {
        const count = wave >= ELITE.doubleFromWave && Math.random() < ELITE.doubleChance ? 2 : 1;
        this.makeElite(e, rollAffixes(count));
      }
    }
  }

  /** Turn an enemy into an elite with the given affixes. */
  makeElite(e: Enemy, affixes: AffixId[], boss = false) {
    if (!affixes.length) return;
    e.affixes = affixes;
    if (!boss) {
      e.hp = e.maxHp = e.maxHp * ELITE.hpMul * (this.stats.wave <= BOSS_PACING.earlyEliteUntilWave ? BOSS_PACING.earlyEliteHpMul : 1);   // 7.9
      e.size = Math.round(e.size * ELITE.sizeMul);
      e.xpReward = Math.round(e.xpReward * ELITE.rewardMul);
      e.monReward = Math.round(e.monReward * ELITE.rewardMul);
    }
    if (affixes.includes("hasted")) e.speed *= ELITE.hasteSpeed;
    if (affixes.includes("warded")) e.wardHits = ELITE.wardHits;
    // First time this run you meet an affix, say how to beat it.
    for (const a of affixes) {
      if (this.seenAffixes.has(a)) continue;
      this.seenAffixes.add(a);
      this.flash(`${AFFIXES[a].kanji} ${AFFIXES[a].name} elite: ${AFFIXES[a].hint}`);
    }
  }

  /** "Burning Hasted Brute" */
  eliteName(e: Enemy): string {
    return `${(e.affixes ?? []).map(a => AFFIXES[a].name).join(" ")} ${ENEMY_LABEL[e.archetype] ?? e.archetype}`;
  }

  private hasAffix(e: Enemy, a: AffixId) { return !!e.affixes && e.affixes.includes(a); }

  /** Fire trails, frost aura timing, chests — runs every frame while playing. */
  private updateElites(dt: number) {
    for (const e of this.enemies) {
      if (e.state === "dead" || !e.affixes) continue;
      if (this.hasAffix(e, "burning")) {
        e.trailT = (e.trailT ?? 0) - dt;
        if (e.trailT <= 0) {
          e.trailT = ELITE.fireTrailEvery;
          this.firePatches.push({ x: e.pos.x, y: e.pos.y, life: ELITE.fireLife, dmg: Math.max(1, Math.round(e.damage * ELITE.fireDmgShare)) });
        }
      }
    }
    // Fire patches hurt the player on a tick.
    this.fireTickCd = Math.max(0, this.fireTickCd - dt);
    for (const f of this.firePatches) {
      f.life -= dt;
      if (f.life > 0 && this.fireTickCd <= 0 &&
          Math.hypot(this.player.pos.x - f.x, this.player.pos.y - f.y) < ELITE.fireRadius + BASE.PLAYER_RADIUS * 0.6) {
        this.fireTickCd = ELITE.fireTick;
        this.applyEnemyHit(null, f.dmg, "burning elite (fire trail)");
      }
    }
    if (this.firePatches.length > 160) this.firePatches.splice(0, this.firePatches.length - 160);
    this.firePatches = this.firePatches.filter(f => f.life > 0);
    // Spirit chests: drift to the player when close, open on touch.
    for (const c of this.spiritChests) {
      c.life -= dt; c.t += dt;
      const dx = this.player.pos.x - c.x, dy = this.player.pos.y - c.y, d = Math.hypot(dx, dy);
      if (d < 120 && d > 1) { c.x += (dx / d) * 220 * dt; c.y += (dy / d) * 220 * dt; }
      if (d < 34) { c.life = 0; this.openSpiritChest(c.x, c.y); }
    }
    this.spiritChests = this.spiritChests.filter(c => c.life > 0);
  }

  // ===================== Kunoichi: Phantom Dance =====================
  private updatePhantomDance(dt: number) {
    const ph = this.phantom, p = this.player;
    ph.t += dt;
    const t = ph.t;
    // Steer the storm with WASD / the stick (movement is redirected here while it lasts).
    if (t < PD.flurryEnd) {
      const mv = this.phantomMove, m = Math.hypot(mv.x, mv.y);
      if (m > 0.05) {
        ph.cx += (mv.x / Math.max(m, 1)) * PD.steerSpeed * dt;
        ph.cy += (mv.y / Math.max(m, 1)) * PD.steerSpeed * dt;
      }
      // Stay in the arena and within reach of the body.
      const dx = ph.cx - p.pos.x, dy = ph.cy - p.pos.y, d = Math.hypot(dx, dy);
      if (d > PD.leash) { ph.cx = p.pos.x + (dx / d) * PD.leash; ph.cy = p.pos.y + (dy / d) * PD.leash; }
      ph.cx = Math.max(PD.zoneR * 0.5, Math.min(this.worldW - PD.zoneR * 0.5, ph.cx));
      ph.cy = Math.max(PD.zoneR * 0.5, Math.min(this.worldH - PD.zoneR * 0.5, ph.cy));
    }
    const ease = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
    for (const [i, img] of this.ultPhantomImages.entries()) {
      img.swing = Math.max(0, img.swing - dt * 5);
      const prev = { x: img.pos.x, y: img.pos.y };
      if (t < PD.split) {
        // 1) Split: slide out from the body into a line, side by side.
        const k = ease(t / PD.split);
        img.pos.x = p.pos.x + (img.home.x - p.pos.x) * k;
        img.pos.y = p.pos.y + (img.home.y - p.pos.y) * k;
        img.facing = Math.atan2(ph.cy - img.pos.y, ph.cx - img.pos.x);
      } else if (t < PD.flurryEnd) {
        // 2) Flurry: each afterimage dashes through the zone along a new line, staggered.
        if (img.dashT >= 1) {
          img.delay -= dt;
          if (img.delay <= 0) {
            const a = Math.random() * Math.PI * 2;
            const r = PD.zoneR * (0.9 + Math.random() * 0.25);
            img.from = { x: img.pos.x, y: img.pos.y };
            img.to = { x: ph.cx + Math.cos(a) * r, y: ph.cy + Math.sin(a) * r };
            // Make sure the line goes through the middle: start on the opposite side.
            if (Math.hypot(img.from.x - ph.cx, img.from.y - ph.cy) < PD.zoneR * 0.5) img.from = { x: ph.cx - Math.cos(a) * r, y: ph.cy - Math.sin(a) * r };
            img.dashT = 0;
            img.facing = Math.atan2(img.to.y - img.from.y, img.to.x - img.from.x);
            img.swing = 1; img.dir = -img.dir;
            this.fx.streakLine(img.from.x, img.from.y, img.to.x, img.to.y, 320 + i * 12, 88, 5, 0.22);
          }
        } else {
          img.dashT = Math.min(1, img.dashT + dt / PD.dashTime);
          const k = ease(img.dashT);
          img.pos.x = img.from.x + (img.to.x - img.from.x) * k;
          img.pos.y = img.from.y + (img.to.y - img.from.y) * k;
          if (img.dashT >= 1) img.delay = 0.02 + Math.random() * 0.05;
        }
      } else if (t < PD.finisher) {
        // 3) Converge: the three rush the centre from three sides.
        const k = ease((t - PD.flurryEnd) / (PD.finisher - PD.flurryEnd));
        if (!img.from || k < 0.05) img.from = { x: img.pos.x, y: img.pos.y };
        const a = (i / 3) * Math.PI * 2;
        img.pos.x = img.from.x + (ph.cx + Math.cos(a) * 18 - img.from.x) * k;
        img.pos.y = img.from.y + (ph.cy + Math.sin(a) * 18 - img.from.y) * k;
        img.facing = Math.atan2(ph.cy - img.pos.y, ph.cx - img.pos.x);
        img.swing = 1;
      } else {
        // 4) Fold back into the body.
        const k = ease((t - PD.finisher) / (PD.dur - PD.finisher));
        img.pos.x = ph.cx + (p.pos.x - ph.cx) * k;
        img.pos.y = ph.cy + (p.pos.y - ph.cy) * k;
        img.facing = Math.atan2(p.pos.y - img.pos.y, p.pos.x - img.pos.x);
      }
      // Speedster trail: remember recent positions, fade them out.
      if (Math.hypot(img.pos.x - prev.x, img.pos.y - prev.y) > 4) img.trail.push({ x: img.pos.x, y: img.pos.y, a: 1 });
      for (const tr of img.trail) tr.a -= dt * 4;
      img.trail = img.trail.filter(tr => tr.a > 0).slice(-14);
    }
    if (t >= PD.split && t < PD.flurryEnd) {
      // A storm of slashes inside the zone.
      ph.slashAcc += dt;
      while (ph.slashAcc >= 0.06) {   // 7.10: was every 0.035s
        ph.slashAcc -= 0.06;
        const a = Math.random() * Math.PI * 2, r = Math.random() * PD.zoneR * 0.75;
        this.fx.slash(ph.cx + Math.cos(a) * r, ph.cy + Math.sin(a) * r, Math.random() * Math.PI * 2, 46 + Math.random() * 40,
          Math.PI * (0.5 + Math.random() * 0.4), Math.random() < 0.5 ? 1 : -1,
          { hue: 315 + Math.random() * 30, sat: 80, light: 72, width: 4 + Math.random() * 3, life: 0.16 });
      }
      // Damage + a gentle pull that keeps foes inside the storm.
      ph.hitAcc += dt;
      if (ph.hitAcc >= PD.tick) {
        ph.hitAcc -= PD.tick;
        let any = false;
        for (const e of this.enemies) {
          if (e.state === "dead") continue;
          const d = Math.hypot(e.pos.x - ph.cx, e.pos.y - ph.cy);
          if (d > PD.zoneR + e.size) continue;
          this.dealDamage(e, this.ultDmg(4), Math.random() * Math.PI * 2, 0);
          any = true;
        }
        if (any) audio.play("slash");
      }
      for (const e of this.enemies) {
        if (e.state === "dead" || e.isBoss) continue;
        const dx = ph.cx - e.pos.x, dy = ph.cy - e.pos.y, d = Math.hypot(dx, dy);
        if (d < PD.zoneR + 60 && d > 14) { e.pos.x += (dx / d) * 140 * dt; e.pos.y += (dy / d) * 140 * dt; }
      }
    }
    if (!ph.finished && t >= PD.finisher) {
      // Final X-cut where the three meet.
      ph.finished = true;
      const R = PD.zoneR + 25;
      for (const e of this.enemies) {
        if (e.state === "dead") continue;
        if (Math.hypot(e.pos.x - ph.cx, e.pos.y - ph.cy) > R + e.size) continue;
        this.dealDamage(e, this.ultDmg(16) * (this.hasUltPerk("ultc_kunoichi") ? 1.5 : 1), Math.atan2(e.pos.y - ph.cy, e.pos.x - ph.cx), e.isBoss ? 40 : 220);
      }
      for (const a of [Math.PI / 4, -Math.PI / 4]) {
        this.fx.streakLine(ph.cx - Math.cos(a) * R, ph.cy - Math.sin(a) * R, ph.cx + Math.cos(a) * R, ph.cy + Math.sin(a) * R, 320, 95, 14, 0.5);
      }
      this.fx.shockwave(ph.cx, ph.cy, R, { hue: 320, light: 80, life: 0.45, width: 10, lines: 14 });
      this.fx.seal(ph.cx, ph.cy - 10, "舞", 320, 44, 0.8);
      this.fx.burst(ph.cx, ph.cy, { count: 26, hue: 320, light: 80, speed: 420, life: 0.5 });
      this.hitstop = Math.max(this.hitstop, 0.1);
      this.cameraShake = Math.max(this.cameraShake, 0.6);
      this.whiteFlashTimer = 0.1; this.whiteFlashMax = 0.1; this.whiteFlashAlpha = 0.35;
      audio.play("executeThud");
    }
  }

  /** Draw a translucent copy of the player figure at (x, y). */
  private drawPlayerGhost(x: number, y: number, facing: number, alpha: number, swing: number, dir: number) {
    const p = this.player;
    const save = { x: p.pos.x, y: p.pos.y, f: p.facing, a: p.attackAnim, d: p.swingDir, w: p.swingWeaponId };
    p.pos.x = x; p.pos.y = y; p.facing = facing; p.attackAnim = swing; p.swingDir = dir >= 0 ? 1 : -1; p.swingWeaponId = this.abilityWeapon();
    this.ghostAlpha = alpha;
    try { this.drawPlayer(); } finally {
      this.ghostAlpha = 0;
      p.pos.x = save.x; p.pos.y = save.y; p.facing = save.f; p.attackAnim = save.a; p.swingDir = save.d; p.swingWeaponId = save.w;
    }
  }

  private drawPhantomDance() {
    if (this.ultPhantomTimer <= 0 || !this.ultPhantomImages.length) return;
    const ctx = this.ctx, ph = this.phantom, t = ph.t;
    ctx.save();
    // The zone: a pink rotating ring while the flurry runs.
    if (t >= PD.split * 0.5 && t < PD.finisher) {
      const fade = Math.min(1, (t - PD.split * 0.5) / 0.2) * (t > PD.flurryEnd ? 1 - (t - PD.flurryEnd) / (PD.finisher - PD.flurryEnd) : 1);
      const g = ctx.createRadialGradient(ph.cx, ph.cy, 0, ph.cx, ph.cy, PD.zoneR);
      g.addColorStop(0, `hsla(320, 80%, 70%, ${0.16 * fade})`);
      g.addColorStop(1, "hsla(320, 80%, 60%, 0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(ph.cx, ph.cy, PD.zoneR, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = `hsla(320, 85%, 75%, ${0.45 * fade})`;
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 12]); ctx.lineDashOffset = -this.elapsed * 60;
      ctx.beginPath(); ctx.arc(ph.cx, ph.cy, PD.zoneR, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
    }
    // Speedster trails: fading pink after-silhouettes along each afterimage's path.
    for (const [i, img] of this.ultPhantomImages.entries()) {
      if (this.useSprites && spritesReady()) {   // fading pink copies of the sprite along the path
        img.trail.forEach((tr, k) => {
          if (k % 3) return;
          this.ghostLook = { outline: `hsl(${320 + i * 12}, 95%, 72%)`, moving: true };
          this.drawPlayerGhost(tr.x, tr.y, img.facing, tr.a * 0.22, 0, img.dir);
          this.ghostLook = null;
        });
        continue;
      }
      for (const tr of img.trail) {
        ctx.fillStyle = `hsla(${320 + i * 12}, 85%, 72%, ${tr.a * 0.22})`;
        ctx.beginPath(); ctx.arc(tr.x, tr.y, BASE.PLAYER_RADIUS * (0.6 + tr.a * 0.4), 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.restore();
    // The afterimages themselves: real copies of your character, glowing pink.
    const fadeOut = t > PD.finisher ? 1 - (t - PD.finisher) / (PD.dur - PD.finisher) : 1;
    for (const [i, img] of this.ultPhantomImages.entries()) {
      ctx.save();
      if (this.useSprites && spritesReady()) ctx.globalAlpha = 0;   // sprites get an outline instead of a glow disc
      const glow = ctx.createRadialGradient(img.pos.x, img.pos.y, 0, img.pos.x, img.pos.y, BASE.PLAYER_RADIUS * 2.4);
      glow.addColorStop(0, `hsla(${320 + i * 12}, 90%, 70%, ${0.35 * fadeOut})`);
      glow.addColorStop(1, "hsla(320, 90%, 60%, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(img.pos.x, img.pos.y, BASE.PLAYER_RADIUS * 2.4, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      const spr = this.useSprites && spritesReady();
      this.ghostLook = spr ? { outline: `hsl(${320 + i * 12}, 95%, 72%)`, moving: true } : null;
      this.drawPlayerGhost(img.pos.x, img.pos.y, img.facing, 0.72 * fadeOut, img.swing, img.dir);
      this.ghostLook = null;
      if (spr) continue;
      // Glowing pink rim so the copies read as spirit afterimages.
      ctx.save();
      ctx.strokeStyle = `hsla(${320 + i * 12}, 95%, 75%, ${0.85 * fadeOut})`;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = `hsla(${320 + i * 12}, 95%, 65%, ${fadeOut})`;
      ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.arc(img.pos.x, img.pos.y, BASE.PLAYER_RADIUS + 3, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }
  }

  // ===================== SIGNATURE helpers (Phase 5) =====================
  private isClass(id: ClassId) { return this.stats.classId === id; }

  /** Heal the player; Yamabushi turns the overflow into a shield. */
  healPlayer(amount: number) {
    amount *= 1 - 0.25 * this.vr("thin_blood");   // VOW Thin Blood
    if (amount <= 0) return;
    const room = this.player.maxHp - this.player.hp;
    this.player.hp = Math.min(this.player.maxHp, this.player.hp + amount);
    const over = amount - Math.max(0, room);
    if (over > 0 && this.isClass("yamabushi")) this.prayerShield = Math.min(SIG.yamaShieldMax, this.prayerShield + over);
  }

  private shopSlots() { return this.isClass("ronin") ? SIG.roninShopSlots : 6; }

  /** Per-frame signature logic. */
  private updateSignatures(dt: number, moving: boolean, dashing: boolean) {
    const p = this.player;
    this.stillTimer = moving || dashing ? 0 : this.stillTimer + dt;
    if (this.vanishTimer > 0) this.vanishTimer = Math.max(0, this.vanishTimer - dt);
    if (this.tailwindTimer > 0) { this.tailwindTimer -= dt; if (this.tailwindTimer <= 0) this.tailwindStacks = 0; }
    if (this.isClass("ashigaru") && this.stillTimer >= SIG.ashigaruBraceTime) {
      for (const [id, t] of this.braceCd) this.braceCd.set(id, t - dt);
      for (const e of this.enemies) {
        if (e.state === "dead" || (this.braceCd.get(e.id) ?? 0) > 0) continue;
        const d = Math.hypot(e.pos.x - p.pos.x, e.pos.y - p.pos.y);
        if (d > BASE.PLAYER_RADIUS + e.size + 10) continue;
        this.braceCd.set(e.id, SIG.ashigaruCd);
        const a = Math.atan2(e.pos.y - p.pos.y, e.pos.x - p.pos.x);
        this.dealDamage(e, this.perks.damage * SIG.ashigaruDmg, a, e.isBoss ? 30 : 280);
        e.attackTelegraph = 0;
        this.spawnSpark(e.pos);
      }
    }
    for (const f of this.feathers) {
      f.t -= dt;
      if (f.t > 0) continue;
      for (const e of this.enemies) {
        if (e.state === "dead") continue;
        if (Math.hypot(e.pos.x - f.x, e.pos.y - f.y) > SIG.tenguBurstRadius + e.size) continue;
        this.dealDamage(e, this.perks.damage * SIG.tenguDmg, Math.atan2(e.pos.y - f.y, e.pos.x - f.x), 120);
      }
      this.fx.burst(f.x, f.y, { count: 10, hue: 200, light: 85, speed: 240, life: 0.35 });
      this.fx.shockwave(f.x, f.y, SIG.tenguBurstRadius, { hue: 200, light: 80, life: 0.3, width: 4 });
    }
    this.feathers = this.feathers.filter(f => f.t > 0);
  }

  private drawSignatures() {
    const ctx = this.ctx, p = this.player.pos, t = this.elapsed;
    ctx.save();
    const focusReady = this.isClass("kensei") && this.stillTimer >= SIG.kenseiFocusTime;
    const braced = this.isClass("ashigaru") && this.stillTimer >= SIG.ashigaruBraceTime;
    if (focusReady || braced) {
      ctx.strokeStyle = focusReady ? `hsla(45, 95%, 70%, ${0.55 + Math.sin(t * 8) * 0.25})` : `hsla(20, 85%, 60%, ${0.6 + Math.sin(t * 6) * 0.2})`;
      ctx.lineWidth = 2.5;
      ctx.setLineDash(braced ? [4, 5] : []);
      ctx.beginPath(); ctx.arc(p.x, p.y, BASE.PLAYER_RADIUS + (braced ? 14 : 9), 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
    }
    for (const f of this.feathers) {
      ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(t * 4 + f.x);
      ctx.fillStyle = `hsla(200, 70%, 90%, ${0.6 + (1 - f.t / SIG.tenguFeatherDelay) * 0.4})`;
      ctx.beginPath(); ctx.ellipse(0, 0, 9, 3, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }

  // ===================== PHASE4 helpers =====================
  /** Keep roughly `ideal` px from the player, strafing a little. */
  private kiteFrom(e: Enemy, dist: number, angToPlayer: number, ideal: number, speedMul: number, dt: number) {
    let mx = 0, my = 0;
    if (dist < ideal - 50) { mx = -Math.cos(angToPlayer); my = -Math.sin(angToPlayer); }
    else if (dist > ideal + 80) { mx = Math.cos(angToPlayer) * 0.85; my = Math.sin(angToPlayer) * 0.85; }
    const strafe = Math.sin(this.elapsed * 0.8 + e.id) * 0.45;
    mx += -Math.sin(angToPlayer) * strafe; my += Math.cos(angToPlayer) * strafe;
    e.pos.x += mx * e.speed * speedMul * dt;
    e.pos.y += my * e.speed * speedMul * dt;
  }

  private nueSummon(e: Enemy) {
    const wave = Math.max(1, this.stats.wave);
    const D = DIFFICULTIES[this.difficulty];
    const hpScale = (1 + (wave - 1) * 0.45) * D.hp;
    const dmgScale = (1 + (wave - 1) * 0.10) * D.dmg;
    for (let i = 0; i < NUE.perSummon; i++) {
      const a = (i / NUE.perSummon) * Math.PI * 2 + Math.random();
      const w = this.makeEnemy({
        x: e.pos.x + Math.cos(a) * 30, y: e.pos.y + Math.sin(a) * 30, isBoss: false, archetype: "wisp",
        hp: Math.max(0.5, 0.6 * hpScale), damage: Math.round(6 * dmgScale), speed: 200, size: 9,
        xpReward: 1, monReward: 0,     // summons give almost nothing — kill the Nue instead
      });
      w.summonerId = e.id;
      this.enemies.push(w);
    }
    e.summoned = true;
    this.fx.shockwave(e.pos.x, e.pos.y, 90, { hue: 270, light: 65, life: 0.45, width: 6 });
    audio.play("smokeWoosh");
  }

  /** Player move multiplier from active ink pools (Onryō). */
  private inkSlowMul(): number {
    for (const k of this.inkPools) {
      if (k.t >= ONRYO.inkTelegraph && Math.hypot(this.player.pos.x - k.x, this.player.pos.y - k.y) < ONRYO.inkRadius) return ONRYO.inkSlow;
    }
    return 1;
  }

  private updateInk(dt: number) {
    for (const k of this.inkPools) { k.t += dt; }
    this.inkPools = this.inkPools.filter(k => k.t < k.life);
    if (this.playerRoot > 0) this.playerRoot = Math.max(0, this.playerRoot - dt);
  }

  private drawInk() {
    const ctx = this.ctx, t = this.elapsed;
    ctx.save();
    for (const k of this.inkPools) {
      if (k.t < ONRYO.inkTelegraph) {
        const f = k.t / ONRYO.inkTelegraph;
        ctx.strokeStyle = `hsla(280, 70%, 65%, ${0.35 + f * 0.5})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 6]); ctx.lineDashOffset = -t * 30;
        ctx.beginPath(); ctx.arc(k.x, k.y, ONRYO.inkRadius, 0, Math.PI * 2); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = `hsla(280, 60%, 20%, ${f * 0.35})`;
        ctx.beginPath(); ctx.arc(k.x, k.y, ONRYO.inkRadius * f, 0, Math.PI * 2); ctx.fill();
      } else {
        const fade = Math.min(1, (k.life - k.t) / 0.5);
        const g = ctx.createRadialGradient(k.x, k.y, 0, k.x, k.y, ONRYO.inkRadius);
        g.addColorStop(0, `hsla(280, 50%, 6%, ${0.75 * fade})`);
        g.addColorStop(0.75, `hsla(275, 55%, 12%, ${0.55 * fade})`);
        g.addColorStop(1, "hsla(275, 60%, 20%, 0)");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(k.x, k.y, ONRYO.inkRadius * (1 + Math.sin(t * 3 + k.x) * 0.03), 0, Math.PI * 2); ctx.fill();
      }
    }
    if (this.playerRoot > 0) {
      // Paper talisman pinned above the rooted player.
      const px = this.player.pos.x, py = this.player.pos.y - BASE.PLAYER_RADIUS - 22;
      ctx.fillStyle = "hsl(45, 60%, 88%)";
      ctx.fillRect(px - 6, py - 10, 12, 20);
      ctx.fillStyle = "hsl(0, 75%, 45%)";
      ctx.fillRect(px - 1.5, py - 7, 3, 14);
      ctx.strokeStyle = "hsla(280, 80%, 70%, 0.7)";
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(this.player.pos.x, this.player.pos.y, BASE.PLAYER_RADIUS + 6, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();
  }

  /** Player move multiplier from Frost elite auras. */
  private frostSlowMul(): number {
    for (const e of this.enemies) {
      if (e.state !== "dead" && e.affixes && e.affixes.includes("frost") &&
          Math.hypot(e.pos.x - this.player.pos.x, e.pos.y - this.player.pos.y) < ELITE.frostRadius) return ELITE.frostSlow;
    }
    return 1;
  }

  /** Damage multiplier for an attacker standing near a Commander. */
  private commanderMul(e: Enemy | null): number {
    if (!e) return 1;
    for (const o of this.enemies) {
      if (o.state !== "dead" && o.affixes && o.affixes.includes("commander") &&
          Math.hypot(o.pos.x - e.pos.x, o.pos.y - e.pos.y) < ELITE.commanderRadius) return ELITE.commanderBuff;
    }
    return 1;
  }

  // ===================== EVOLUTIONS =====================
  isEvolved(id: string | null | undefined): boolean { return !!id && this.perks.evolved.includes(id); }

  hasCatalyst(id: SecondaryId): boolean {
    const evo = EVOLUTIONS[id];
    return !!evo && evo.catalysts.some(c => this.acquiredPerks.includes(c) || this.perks.shopBought.includes(c));
  }

  /** What the HUD shows for a weapon: progress toward its evolution. */
  evoStatus(id: SecondaryId): { state: "none" | "ready" | "evolved"; mastery: number; catalyst: boolean } {
    const mastery = this.perks.weaponMastery[id] ?? 0;
    const catalyst = this.hasCatalyst(id);
    if (this.isEvolved(id)) return { state: "evolved", mastery, catalyst };
    return { state: mastery >= EVO_MASTERY && catalyst ? "ready" : "none", mastery, catalyst };
  }

  evoReadyWeapon(): SecondaryId | null {
    for (const id of this.stats.secondaryIds) {
      if (id && this.evoStatus(id).state === "ready") return id;
    }
    return null;
  }

  evolveWeapon(id: SecondaryId, x = this.player.pos.x, y = this.player.pos.y) {
    if (this.isEvolved(id)) return;
    this.perks.evolved.push(id);
    this.run.evolutions.push(id);
    const evo = EVOLUTIONS[id];
    this.flash(`EVOLUTION · ${evo.kanji} ${evo.name}: ${evo.desc}`);
    this.stats.messageTimer = 4;
    this.fx.shockwave(x, y, 160, { hue: 45, light: 75, life: 0.7, width: 10, lines: 16 });
    this.fx.burst(x, y, { count: 30, hue: 45, light: 75, speed: 360, life: 0.8, grav: -40 });
    this.whiteFlashTimer = 0.2; this.whiteFlashMax = 0.2; this.whiteFlashAlpha = 0.35;
    this.hitstop = Math.max(this.hitstop, 0.12);
    this.cameraShake = Math.max(this.cameraShake, 0.5);
    audio.play("levelUp");
    this.spawnFloatText({ x, y }, `${evo.kanji} ${evo.name}!`, { color: "hsl(45 100% 70%)", size: 20, jp: true, vy: -50 });
    this.onActiveSecondaryChanged();
    this.emitStats();
  }

  hasDuo(id: string) { return this.perks.duos.includes(id); }

  /** Duo perks whose two requirements are met and that aren't owned yet. */
  availableDuos() {
    return DUOS.filter(d => !this.hasDuo(d.id) && d.needs.every(group => group.some(p => this.acquiredPerks.includes(p))));
  }

  /** Small piercing wind/crescent wave (Kusanagi, Moon Cleaver, Heaven's Reach). */
  private spawnEvoWave(ang: number, dmg: number, r: number, speed: number, life: number, hue: number) {
    const p = this.player.pos;
    this.evoWaves.push({ x: p.x + Math.cos(ang) * 30, y: p.y + Math.sin(ang) * 30, vx: Math.cos(ang) * speed, vy: Math.sin(ang) * speed,
      life, max: life, dmg, r, hue, hit: new Set() });
  }

  /** Called whenever a secondary weapon fires or swings. */
  private onEvoFire(id: SecondaryId) {
    if (!this.isEvolved(id)) return;
    const p = this.player, ang = p.facing;
    const dmg = this.effectiveSecondaryDamage(id) * EVO_DAMAGE_MUL;
    if (id === "flame_spear") {
      for (let i = 1; i <= 5; i++) {
        this.evoZones.push({ x: p.pos.x + Math.cos(ang) * 46 * i, y: p.pos.y + Math.sin(ang) * 46 * i, r: 30, life: 2.4, max: 2.4, dmg: dmg * 0.35, tick: 0, kind: "fire" });
      }
    } else if (id === "odachi") {
      this.spawnEvoWave(ang, dmg * 0.9, 70, 620, 0.9, 210);
    } else if (id === "shuriken_wheel") {
      this.evoOrbits = [];
      for (let i = 0; i < 3; i++) this.evoOrbits.push({ ang: (i / 3) * Math.PI * 2, life: 4, dmg: dmg * 0.5, hitCd: new Map() });
    }
  }

  /** Called on every katana swing (hit or miss). */
  private onKatanaSwing() {
    const ang = this.player.facing;
    this.katanaSwings++;
    if (this.isEvolved("katana") && this.katanaSwings % 3 === 0) {
      this.spawnEvoWave(ang, this.perks.damage * EVO_DAMAGE_MUL, 46, 760, 0.5, 140);
    } else if (this.hasDuo("duo_reach")) {
      this.spawnEvoWave(ang, this.perks.damage * 0.5, 34, 700, 0.4, 50);
    }
  }

  /** Called after a weapon hit lands (not for the extra hits these spawn). */
  private onEvoHit(e: Enemy, src: SecondaryId | "katana" | undefined, dmg: number, isCrit: boolean) {
    if (this.evoNested) return;
    this.evoNested = true;
    try {
      // ── DUO effects (any source) ──
      if (this.hasDuo("duo_searing")) {
        if (e.bleedRemaining > 0) { e.burnRemaining = Math.max(e.burnRemaining, 3); e.burnDps = Math.max(e.burnDps, 4); }
        if (e.burnRemaining > 0) e.bleedRemaining = Math.max(e.bleedRemaining, 3);
      }
      if (isCrit && this.hasDuo("duo_thunder") && e.state !== "dead") this.chainZap(e, Math.max(1, dmg * 0.5), 2);
      // ── EVOLUTION effects (by weapon) ──
      if (!src || src === "katana" || !this.isEvolved(src)) return;
      if (src === "yumi") this.chainZap(e, Math.max(1, dmg * 0.4), 2);
      else if (src === "kusarigama") {
        for (const o of this.enemies) {
          if (o.state === "dead" || o.isBoss) continue;
          const d = Math.hypot(o.pos.x - e.pos.x, o.pos.y - e.pos.y);
          if (d > 160) continue;
          const a = Math.atan2(this.player.pos.y - o.pos.y, this.player.pos.x - o.pos.x);
          o.vel.x = Math.cos(a) * 520; o.vel.y = Math.sin(a) * 520;
        }
        this.chainBolts.spawn(this.player.pos.x, this.player.pos.y, e.pos.x, e.pos.y, 0.25);
      } else if (src === "tessen") {
        for (const o of this.enemies) {
          if (o === e || o.state === "dead") continue;
          const d = Math.hypot(o.pos.x - e.pos.x, o.pos.y - e.pos.y);
          if (d < 100) this.dealDamage(o, dmg * 0.5, Math.atan2(o.pos.y - e.pos.y, o.pos.x - e.pos.x), o.isBoss ? 20 : 220);
        }
        this.fx.shockwave(e.pos.x, e.pos.y, 100, { hue: 170, light: 75, life: 0.3, width: 5 });
      } else if (src === "jutte") {
        this.evoShield = Math.min(20, this.evoShield + 2);
      } else if (src === "ono") {
        if (!e.isBoss && e.state !== "dead" && e.hp > 0 && e.hp / e.maxHp < 0.15) {
          this.spawnFloatText(e.pos, "Execute!", { color: "hsl(0 90% 65%)", size: 15 });
          this.killEnemy(e, "honor");
        }
      } else if (src === "twin_sai") {
        if (++this.saiHits % 4 === 0) {
          for (let i = 0; i < 3 && e.state !== "dead"; i++) this.dealDamage(e, dmg * 0.4, 0, 10);
          this.spawnFloatText(e.pos, "Flurry!", { color: "hsl(300 80% 75%)", size: 13 });
        }
      } else if (src === "blowgun") {
        if (this.plagueCd <= 0) {
          this.plagueCd = 0.3;
          this.evoZones.push({ x: e.pos.x, y: e.pos.y, r: 60, life: 3, max: 3, dmg: dmg * 0.25, tick: 0, kind: "poison" });
        }
      }
    } finally {
      this.evoNested = false;
    }
  }

  private updateEvo(dt: number) {
    this.plagueCd = Math.max(0, this.plagueCd - dt);
    for (const w of this.evoWaves) {
      w.life -= dt; w.x += w.vx * dt; w.y += w.vy * dt;
      for (const e of this.enemies) {
        if (e.state === "dead" || w.hit.has(e.id)) continue;
        if (Math.hypot(e.pos.x - w.x, e.pos.y - w.y) > w.r + e.size) continue;
        w.hit.add(e.id);
        this.evoNested = true;
        try { this.dealDamage(e, w.dmg, Math.atan2(w.vy, w.vx), e.isBoss ? 10 : 60); } finally { this.evoNested = false; }
      }
    }
    this.evoWaves = this.evoWaves.filter(w => w.life > 0);
    for (const z of this.evoZones) {
      z.life -= dt; z.tick -= dt;
      if (z.tick > 0) continue;
      z.tick = 0.5;
      for (const e of this.enemies) {
        if (e.state === "dead" || Math.hypot(e.pos.x - z.x, e.pos.y - z.y) > z.r + e.size) continue;
        if (z.kind === "fire") { e.burnRemaining = Math.max(e.burnRemaining, 2); e.burnDps = Math.max(e.burnDps, 4); }
        else { e.poisonRemaining = Math.min(8, e.poisonRemaining + 1); if (this.perks.poisonDps <= 0) this.perks.poisonDps = 4; }
        this.evoNested = true;
        try { this.dealDamage(e, z.dmg, 0, 0); } finally { this.evoNested = false; }
      }
    }
    if (this.evoZones.length > 60) this.evoZones.splice(0, this.evoZones.length - 60);
    this.evoZones = this.evoZones.filter(z => z.life > 0);
    for (const o of this.evoOrbits) {
      o.life -= dt; o.ang += dt * 5;
      const ox = this.player.pos.x + Math.cos(o.ang) * 72, oy = this.player.pos.y + Math.sin(o.ang) * 72;
      for (const [id, t] of o.hitCd) o.hitCd.set(id, t - dt);
      for (const e of this.enemies) {
        if (e.state === "dead" || (o.hitCd.get(e.id) ?? 0) > 0) continue;
        if (Math.hypot(e.pos.x - ox, e.pos.y - oy) > e.size + 14) continue;
        o.hitCd.set(e.id, 0.4);
        this.evoNested = true;
        try { this.dealDamage(e, o.dmg, o.ang + Math.PI / 2, 40); } finally { this.evoNested = false; }
      }
    }
    this.evoOrbits = this.evoOrbits.filter(o => o.life > 0);
  }

  private drawEvo() {
    const ctx = this.ctx, t = this.elapsed;
    ctx.save();
    for (const z of this.evoZones) {
      const a = Math.min(1, z.life / 0.5) * (z.kind === "fire" ? 0.5 : 0.35);
      const g = ctx.createRadialGradient(z.x, z.y, 0, z.x, z.y, z.r);
      if (z.kind === "fire") { g.addColorStop(0, `hsla(45, 100%, 65%, ${a})`); g.addColorStop(1, "hsla(15, 100%, 50%, 0)"); }
      else { g.addColorStop(0, `hsla(110, 70%, 50%, ${a})`); g.addColorStop(1, "hsla(130, 70%, 40%, 0)"); }
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(z.x, z.y, z.r * (0.9 + Math.sin(t * 7 + z.x) * 0.06), 0, Math.PI * 2); ctx.fill();
    }
    for (const w of this.evoWaves) {
      const a = Math.atan2(w.vy, w.vx), k = w.life / w.max;
      ctx.strokeStyle = `hsla(${w.hue}, 90%, 80%, ${0.25 + k * 0.6})`;
      ctx.lineWidth = 5 + w.r * 0.08;
      ctx.lineCap = "round";
      ctx.beginPath(); ctx.arc(w.x - Math.cos(a) * w.r * 0.6, w.y - Math.sin(a) * w.r * 0.6, w.r, a - 0.9, a + 0.9); ctx.stroke();
    }
    for (const o of this.evoOrbits) {
      const ox = this.player.pos.x + Math.cos(o.ang) * 72, oy = this.player.pos.y + Math.sin(o.ang) * 72;
      ctx.save(); ctx.translate(ox, oy); ctx.rotate(t * 18);
      ctx.fillStyle = "hsl(190, 60%, 82%)";
      for (let i = 0; i < 4; i++) { ctx.rotate(Math.PI / 2); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(11, -3); ctx.lineTo(3, 3); ctx.closePath(); ctx.fill(); }
      ctx.restore();
    }
    if (this.evoShield + this.prayerShield > 0) {
      ctx.strokeStyle = `hsla(45, 90%, 70%, ${0.3 + (this.evoShield + this.prayerShield) / 60})`;
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(this.player.pos.x, this.player.pos.y, BASE.PLAYER_RADIUS + 10, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();
  }

  /** Spirit Chest reward — evolves a ready weapon first, otherwise loot. */
  openSpiritChest(x: number, y: number) {
    this.run.chests++;
    const ready = this.evoReadyWeapon();
    if (ready) { this.evolveWeapon(ready, x, y); return; }
    const D = DIFFICULTIES[this.difficulty];
    const coins = Math.round((12 + this.stats.wave * 4) * D.coins * this.meta.chestCoinMul);   // SHRINE Gilded
    this.stats.mon += coins;
    this.run.monEarned += coins;
    const parts = [`+${coins} 文`];
    const slot = this.stats.consumables.findIndex(c => c === null);
    if (slot !== -1) {
      const id = rollConsumable();
      this.stats.consumables[slot] = id;
      parts.push(CONSUMABLES[id].name);
    }
    const heal = Math.round(this.player.maxHp * (0.15 + this.meta.chestHeal));   // SHRINE Blessed
    this.healPlayer(heal);
    parts.push(`+${heal} HP`);
    this.fx.shockwave(x, y, 80, { hue: 45, light: 70, life: 0.45, width: 6 });
    this.fx.burst(x, y, { count: 14, hue: 45, light: 70, speed: 220, life: 0.6, grav: -60 });
    audio.play("levelUp");
    this.spawnFloatText({ x, y }, `Spirit Chest: ${parts.join(" · ")}`, { color: "hsl(45 95% 70%)", size: 14, vy: -55 });
    this.emitStats();
  }

  private spawnSingleEnemyInner(wave: number, kind: EnemyArchetype) {
    const tier = Math.floor((wave - 1) / 5);
    // Phase 2 — slightly steeper HP/dmg curve to match the new stat upgrades.
    // Players now get flat +5 / +25 hits from rare/legendary perks, so basic
    // enemies need to keep up to remain a threat into the late waves.
    // Steeper HP curve so wave 5 grunts feel meaty (~10 HP) instead of
    // being two-shot trash. Bosses use computeBossHpScale separately.
    const D = DIFFICULTIES[this.difficulty];
    const hpScale = (1 + (wave - 1) * 0.45) * D.hp;
    const dmgScale = (1 + (wave - 1) * 0.10) * D.dmg;
    // Kept under the player's base speed so kiting stays possible late-game.
    const speedScale = (1 + Math.min(0.25, (wave - 1) * 0.015)) * D.speed;
    const isBigSpawn = kind === "boss" || kind === "final";
    const s = this.pickSpawnAwayFromPlayer(isBigSpawn ? 460 : 360);
    (this as unknown as Record<string, number>).lastHpScale = hpScale;
    (this as unknown as Record<string, number>).lastDmgScale = dmgScale;
    (this as unknown as Record<string, number>).lastSpdScale = speedScale;
    if (spawnNewEnemy(this, kind, s, hpScale, dmgScale, speedScale, tier)) return;   // STEP 4

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
        speed: 190 * speedScale,
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
        speed: 178 * speedScale,
        size: 24 + tier * 2,
        xpReward: 60 + tier * 20,
        monReward: 80 + tier * 40 + Math.floor(Math.random() * 30),
      }));
      this.decorateBoss(this.enemies[this.enemies.length - 1], wave);
      if (wave === BOSS_PACING.firstBossWave) {   // 7.9: "first meeting" discount
        const b = this.enemies[this.enemies.length - 1];
        b.hp = b.maxHp = Math.round(b.maxHp * BOSS_PACING.firstBossHpMul);
        b.damage = Math.round(b.damage * BOSS_PACING.firstBossDmgMul);
      }
    } else if (kind === "shielded") {
      // Tanky frontline — frontal melee bounces off until shield breaks.
      this.enemies.push(this.makeEnemy({
        x: s.x, y: s.y,
        isBoss: false,
        archetype: "shielded",
        hp: Math.round(5 * hpScale),
        damage: Math.round(16 * dmgScale),
        speed: 150 * speedScale,
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
        speed: 170 * speedScale,
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
        speed: 185 * speedScale,
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
        speed: 150 * speedScale,
        size: BASE.ENEMY_RADIUS + 5,
        xpReward: 14,
        monReward: 6 + tier * 2 + Math.floor(Math.random() * 4),
      }));
    } else if (kind === "wisp") {
      // Swarm: a pack of four weak, quick spirit flames.
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2;
        this.enemies.push(this.makeEnemy({
          x: s.x + Math.cos(a) * 26, y: s.y + Math.sin(a) * 26,
          isBoss: false, archetype: "wisp",
          hp: Math.max(0.5, 0.6 * hpScale),
          damage: Math.round(6 * dmgScale),
          speed: 200 * speedScale,
          size: 9,
          xpReward: 3,
          monReward: 1 + Math.floor(Math.random() * 2),
        }));
      }
    } else if (kind === "onryo") {
      // PHASE4 controller: keeps away, drops slowing ink pools, throws binding talismans.
      const on = this.makeEnemy({
        x: s.x, y: s.y, isBoss: false, archetype: "onryo",
        hp: Math.round(2.6 * hpScale * 10) / 10, damage: Math.round(9 * dmgScale), speed: 145 * speedScale, size: 14,
        xpReward: 20, monReward: 7 + tier * 2 + Math.floor(Math.random() * 4),
      });
      on.special = 1.5; on.castCount = 0;
      this.enemies.push(on);
    } else if (kind === "nue") {
      // PHASE4 summoner: hides behind allies and calls wisps. Low HP — priority target.
      const nu = this.makeEnemy({
        x: s.x, y: s.y, isBoss: false, archetype: "nue",
        hp: Math.round(2.2 * hpScale * 10) / 10, damage: Math.round(8 * dmgScale), speed: 150 * speedScale, size: 16,
        xpReward: 24, monReward: 9 + tier * 2 + Math.floor(Math.random() * 4),
      });
      nu.special = 2.5; nu.summoned = false;
      this.enemies.push(nu);
    } else if (kind === "mirror") {
      // PHASE4 anti-ranged: reflects projectiles that hit its front.
      this.enemies.push(this.makeEnemy({
        x: s.x, y: s.y, isBoss: false, archetype: "mirror",
        hp: Math.round(3.2 * hpScale * 10) / 10, damage: Math.round(12 * dmgScale), speed: 140 * speedScale, size: BASE.ENEMY_RADIUS + 2,
        xpReward: 18, monReward: 7 + tier * 2 + Math.floor(Math.random() * 4),
      }));
    } else if (kind === "priest") {
      // Support: heals nearby allies — the priority target.
      const pr = this.makeEnemy({
        x: s.x, y: s.y, isBoss: false, archetype: "priest",
        hp: Math.round(3 * hpScale * 10) / 10,
        damage: Math.round(8 * dmgScale),
        speed: 150 * speedScale,
        size: 15,
        xpReward: 22,
        monReward: 8 + tier * 2 + Math.floor(Math.random() * 4),
      });
      pr.special = 2;
      this.enemies.push(pr);
    } else if (kind === "bomber") {
      // Artillery: lobs bombs onto where you're standing.
      const bm = this.makeEnemy({
        x: s.x, y: s.y, isBoss: false, archetype: "bomber",
        hp: Math.round(2.5 * hpScale * 10) / 10,
        damage: Math.round(14 * dmgScale),
        speed: 155 * speedScale,
        size: 13,
        xpReward: 18,
        monReward: 6 + tier + Math.floor(Math.random() * 4),
      });
      bm.special = 1.5 + Math.random();
      this.enemies.push(bm);
    } else if (kind === "lantern") {
      // Exploder: rushes in, swells, then bursts.
      this.enemies.push(this.makeEnemy({
        x: s.x, y: s.y, isBoss: false, archetype: "lantern",
        hp: Math.round(1.5 * hpScale * 10) / 10,
        damage: Math.round(20 * dmgScale),
        speed: 205 * speedScale,
        size: 13,
        xpReward: 12,
        monReward: 4 + tier + Math.floor(Math.random() * 3),
      }));
    } else {
      this.enemies.push(this.makeEnemy({
        x: s.x, y: s.y,
        isBoss: false,
        archetype: "normal",
        hp: Math.max(1, Math.round(2 * hpScale)),
        damage: Math.round(12 * dmgScale),
        speed: 165 * speedScale,
        size: BASE.ENEMY_RADIUS,
        xpReward: 8 + tier * 2,
        monReward: 2 + tier + Math.floor(Math.random() * 3),
      }));
    }
  }

  // Each boss wave brings a different boss: Oni → Kitsune → Gashadokuro → Raijin.
  decorateBoss(b: Enemy, wave: number) {
    const order: BossKind[] = ["oni", "kitsune", "gasha", "raijin"];
    const kind = order[Math.max(0, Math.floor(wave / 5) - 1) % order.length];
    b.bossKind = kind;
    if (kind === "kitsune") { b.hp = b.maxHp = Math.round(b.maxHp * 0.85); b.speed *= 1.1; }
    else if (kind === "gasha") { b.hp = b.maxHp = Math.round(b.maxHp * 1.3); b.speed *= 0.75; b.size += 8; }
  }

  // Roll a non-elite enemy, with elites unlocking by wave.
  // shielded @ wave 6+, archer @ wave 8+, assassin @ wave 10+.
  pickRollKind(wave: number): EnemyArchetype {
    const r = Math.random();
    const heavyChance = wave >= 3 ? Math.min(0.35, (wave - 2) * 0.07) : 0;
    const shieldedChance = wave >= 6 ? Math.min(0.18, (wave - 5) * 0.025) : 0;
    const archerChance = wave >= 8 ? Math.min(0.22, (wave - 7) * 0.03) : 0;
    const assassinChance = wave >= 10 ? Math.min(0.18, (wave - 9) * 0.025) : 0;
    const wispChance = wave >= 2 ? Math.min(0.09, (wave - 1) * 0.02) : 0;
    const lanternChance = wave >= 4 ? Math.min(0.12, (wave - 3) * 0.02) : 0;
    const bomberChance = wave >= 5 ? Math.min(0.12, (wave - 4) * 0.02) : 0;
    const priestChance = wave >= 7 ? Math.min(0.08, (wave - 6) * 0.015) : 0;
    // Spawn-table fix (2026-11-27): these used to be rolled in a fixed order, and
    // from wave 10 they add up to over 100%, so the types at the end of the list
    // (heavy, assassin) and plain grunts stopped spawning at all. Now they're
    // weights: plain grunts always keep at least SPAWN_MIN_NORMAL of the mix and
    // everything else shares the rest in proportion. Waves where the chances add
    // up to less than that are exactly as before.
    const table: [EnemyArchetype, number][] = [
      ["onryo", newEnemyChance("onryo", wave)], ["nue", newEnemyChance("nue", wave)], ["mirror", newEnemyChance("mirror", wave)],
      ["priest", priestChance], ["bomber", bomberChance], ["lantern", lanternChance], ["wisp", wispChance],
      ["shielded", shieldedChance], ["archer", archerChance], ["assassin", assassinChance], ["heavy", heavyChance],
      ...newEnemyWeights(wave),   // STEP 4: new enemies share by weight
    ];
    const special = table.reduce((a, [, w]) => a + w, 0);
    const normalW = Math.max(1 - special, (special * SPAWN_MIN_NORMAL) / (1 - SPAWN_MIN_NORMAL));   // grunts end up >= SPAWN_MIN_NORMAL of the mix
    let pick = r * (special + normalW);
    for (const [kind, w] of table) { if (pick < w) return kind; pick -= w; }
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
    if (this.hasUltPerk("ult_start_c") && this.stats.ultCharge < this.stats.ultMax * 0.25 && !this.stats.ultActive) {   // ULTPERK Battle Ready
      this.stats.ultCharge = this.stats.ultMax * 0.25;
    }
    this.waveDmgMark = this.run.damageTaken;
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
    if (isBoss) {
      const bk = this.enemies.find(en => en.bossKind)?.bossKind;
      this.flash(bk ? `◈ ${BOSS_INFO[bk].kanji} ${BOSS_INFO[bk].name} approaches ◈` : `◈ BOSS WAVE ${wave} · Slay the boss ◈`);
    }
    else this.flash(`Wave ${wave} · Survive ${Math.round(this.stats.waveDuration)}s`);

    audio.play("waveStart");
    audio.setBossMode(isBoss);
    if (isBoss) setTimeout(() => audio.play("bossRoar"), 350);

    // Heal between waves perk
    if (wave > 1 && this.perks.healBetweenWaves > 0 && !this.vr("no_rest")) {   // VOW No Rest
      this.healPlayer(this.perks.healBetweenWaves);
    }
    if (this.perks.secondWindAvailable) this.perks.hasSecondWind = true;
    // 7.9: rest before every boss (Slay the Spire puts a rest site before each boss).
    if (wave % 5 === 0 && BOSS_PACING.restBeforeBoss && !this.vr("no_rest") && this.player && this.player.hp < this.player.maxHp) {
      this.healPlayer(this.player.maxHp);
      this.spawnFloatText(this.player.pos, "Rested", { color: "hsl(140 70% 70%)", size: 15, vy: -60 });
    }
    // 7.6: the bar is trimmed between waves (a softer version of Hades' per-room reset).
    if (wave > 1 && !this.stats.ultActive && this.stats.ultCharge > this.stats.ultMax * ULT_CHARGE.carryBetweenWaves) {
      this.stats.ultCharge = this.stats.ultMax * ULT_CHARGE.carryBetweenWaves;
      this.stats.ultReady = false;
    }
    onWaveStartNewClass(this, wave);   // STEP 5: Bakuto lucky die
    // OMEN: announce it (and Elite Hunt's chest); ARENA SHRINE: maybe place one.
    const om = this.omenDef;
    if (om) {
      this.flash(`${om.kanji} ${om.name} · ${om.desc}`);
      if (om.chest && this.player) this.spiritChests.push({ x: this.player.pos.x - 110, y: this.player.pos.y, life: ELITE.chestLife, t: 0 });
    }
    this.maybeSpawnArenaShrine(wave);
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
    if (this.stats.mon > this.run.maxMon) this.run.maxMon = this.stats.mon;
    // Derived stat snapshot — used by pause-screen stat list.
    const cdMulKatana = this.katanaCdMul();
    this.stats.derivedStats = {
      damage: this.perks.damage,
      dexterity: this.perks.dexterity,
      defense: this.perks.defense,
      moveSpeedPct: Math.round(moveSpeedFromMul(this.perks.speedMul) * 100),
      defensePct: Math.round(defenseReduction(this.perks.defense) * 100),
      attackSpeedPct: Math.round((1 / Math.max(0.001, cdMulKatana)) * 100),
      critChancePct: Math.round(critFromPoints(this.perks.critChance) * 100),
      critMul: Math.round(this.critMultiplier() * 100) / 100,
      more: ([
        ["Area", this.perks.areaBonus > 0 ? `+${Math.round(this.perks.areaBonus * 100)}%` : ""],
        ["Projectiles", this.perks.extraProjectiles > 0 ? `+${this.perks.extraProjectiles}` : ""],
        ["Pierce", this.perks.pierceBonus > 0 ? `+${this.perks.pierceBonus}` : ""],
        ["Luck", this.perks.luck > 0 ? `+${Math.round(this.perks.luck * 100)}%` : ""],
        ["XP gain", this.perks.xpBonus > 0 ? `+${Math.round(this.perks.xpBonus * 100)}%` : ""],
        ["Pickup radius", this.perks.pickupBonus > 0 ? `+${Math.round(this.perks.pickupBonus * 100)}%` : ""],
        ["Chill chance", this.perks.frostChance > 0 ? `${Math.round(this.perks.frostChance * 100)}%` : ""],
      ] as [string, string][]).filter(([, v]) => v),
      hpRegen: this.perks.hpRegen,
      secondaryDmgMul: this.perks.secondaryDmgMul,
    };
    this.onStatsChange?.({ ...this.stats, pendingChoices: [...this.stats.pendingChoices] });
  }

  setInput(partial: Partial<Input>) {
    Object.assign(this.input, partial);
  }

  triggerAttack() { this.input.attackPressed = true; this.input.attack = true; this.cursorKick = 1; }
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
    this.emitEvent({ t: "pick", kind: "perk", id: newId });
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
  run: RunCounters = newRunCounters();
  // Elite state
  firePatches: { x: number; y: number; life: number; dmg: number }[] = [];
  spiritChests: { x: number; y: number; life: number; t: number }[] = [];
  private fireTickCd = 0;
  private seenAffixes = new Set<string>();
  // EVOLUTION / DUO state
  evoWaves: { x: number; y: number; vx: number; vy: number; life: number; max: number; dmg: number; r: number; hue: number; hit: Set<number> }[] = [];
  evoZones: { x: number; y: number; r: number; life: number; max: number; dmg: number; tick: number; kind: "fire" | "poison" }[] = [];
  evoOrbits: { ang: number; life: number; dmg: number; hitCd: Map<number, number> }[] = [];
  evoShield = 0;
  private ghostAlpha = 0;     // >0 while drawing a Phantom Dance afterimage
  blockRegenDelay = 0;
  // PHASE4 state
  inkPools: { x: number; y: number; t: number; life: number }[] = [];
  playerRoot = 0;
  // SIGNATURE state (Phase 5)
  stillTimer = 0;            // seconds standing still (Kensei Focus, Ashigaru Spear Wall)
  vanishTimer = 0;           // Shinobi Vanish
  prayerShield = 0;          // Yamabushi Mountain Prayer
  tailwindStacks = 0; tailwindTimer = 0;   // Arashi
  feathers: { x: number; y: number; t: number }[] = [];   // Tengu
  private braceCd = new Map<number, number>();
  private forceCrit = false;
  private roninFreeReroll = false;
  private evoNested = false;
  private katanaSwings = 0;
  private saiHits = 0;
  private plagueCd = 0;
  onEvent?: (ev: GameEvent) => void;
  lastHitBy = "unknown";
  private emitEvent(ev: GameEvent) { try { this.onEvent?.(ev); } catch { /* tracking must never break the game */ } }
  private multiKillTimes: number[] = [];
  private sweeping = false;
  private ultKillCount = 0;
  private waveDmgMark = 0;
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

  /** Dev: place an arena altar near the player. */
  devSpawnAltar() {
    const id = ARENA_SHRINES[Math.floor(Math.random() * ARENA_SHRINES.length)].id;
    this.arenaShrine = { id, x: this.player.pos.x + 140, y: this.player.pos.y, hold: 0, t: 0 };
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

  devSpawnElite(kind: EnemyArchetype, affix: AffixId | "random" | "double") {
    if (this.stats.state !== "playing") return;
    const n = this.enemies.length;
    this.spawnSingleEnemyInner(Math.max(6, this.stats.wave), kind);
    const e = this.enemies[n];
    if (!e) return;
    this.makeElite(e, affix === "random" ? rollAffixes(1) : affix === "double" ? rollAffixes(2) : [affix]);
    this.stats.enemiesLeft = this.enemies.filter(o => o.state !== "dead").length;
    this.emitStats();
  }

  /** Dev: evolve the weapon in a slot right now. */
  devEvolve(slot: 0 | 1) {
    const id = this.stats.secondaryIds[slot];
    if (id) this.evolveWeapon(id);
  }

  /** Dev: max mastery + grant the catalyst, so the next Spirit Chest evolves it. */
  devReadyEvolution(slot: 0 | 1) {
    const id = this.stats.secondaryIds[slot];
    if (!id) return;
    this.perks.weaponMastery[id] = EVO_MASTERY;
    const cat = EVOLUTIONS[id].catalysts[0];
    if (!this.hasCatalyst(id)) { if (PERK_POOL.some(p => p.id === cat)) this.acquiredPerks.push(cat); else this.perks.shopBought.push(cat); }
    this.emitStats();
  }

  devGiveDuo(id: string) {
    if (!DUO_BY_ID[id]) return;
    this.applyPerk(id);
    this.acquiredPerks.push(id);
    this.emitStats();
  }

  /** VICTORY: keep playing after winning. Waves keep scaling; records go to Endless. */
  continueEndless() {
    if (this.stats.state !== "victory") return;
    this.endless = true;
    this.stats.state = "playing";
    this.flash("∞ ENDLESS — how far can you go?");
    this.persistResumeSnapshot(true);
    this.finishWave();          // the level-ups and shop the Final Boss wave earned
    this.emitStats();
  }

  /** Dev: jump straight to the victory screen. */
  devWin() {
    if (this.stats.state !== "playing") return;
    this.stats.wave = Math.max(this.stats.wave, 25);
    for (const e of this.enemies) e.state = "dead";
    this.enemies = [];
    this.stats.state = "victory";
    this.emitStats();
  }

  devSpawnChest() {
    this.spiritChests.push({ x: this.player.pos.x + 90, y: this.player.pos.y, life: ELITE.chestLife, t: 0 });
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
  devShowHitboxes = false;

  devLevelUp() {
    this.gainXp(Math.max(1, this.stats.xpToNext - this.stats.xp));
  }

  devGivePerk(id: string) {
    if (!PERK_POOL.some(p => p.id === id)) return;
    this.applyPerk(id);
    this.enforceStatCaps();
    this.acquiredPerks.push(id);
    this.stats.perks = [...this.acquiredPerks];
    const def = PERK_POOL.find(p => p.id === id)!;
    if (this.player) this.spawnFloatText(this.player.pos, `+ ${def.name}`, { color: "hsl(48 90% 70%)", size: 14, vy: -60 });
    this.emitStats();
  }

  devGiveItem(id: ConsumableId) {
    if (!CONSUMABLES[id]) return;
    let slot = this.stats.consumables.findIndex(c => c === null);
    if (slot === -1) slot = 0;
    this.stats.consumables[slot] = id;
    this.emitStats();
  }

  devSetWeapon(slot: 0 | 1, id: SecondaryId) {
    const ids: [SecondaryId, SecondaryId] = [this.stats.secondaryIds[0] as SecondaryId, this.stats.secondaryIds[1] as SecondaryId];
    ids[slot] = id;
    const active = this.stats.secondaryActiveSlot;
    this.equipWeapons(ids);
    this.stats.secondaryActiveSlot = active;
    this.onActiveSecondaryChanged();
    this.emitStats();
  }

  devRefillAmmo() {
    for (let s = 0; s < 2; s++) {
      this.stats.secondaryAmmo[s] = this.stats.secondaryAmmoMax[s];
      this.stats.secondaryReload[s] = 0;
    }
    this.emitStats();
  }

  devSetAbility(slot: 0 | 1, id: string) {
    if (!ABILITY_POOL.some(a => a.id === id)) return;
    const other = this.stats.equippedAbilities[1 - slot];
    if (other === id) return;
    const old = this.stats.equippedAbilities[slot];
    if (old) { delete this.stats.abilityCd[old]; delete this.stats.abilityMax[old]; }
    if (slot >= this.stats.equippedAbilities.length) this.equipAbilityInternal(id);
    else this.equipAbilityInternal(id, slot);
    this.emitStats();
  }

  devSpawnBoss(kind: BossKind | "final") {
    if (this.stats.state !== "playing") return;
    if (kind === "final") { this.devSpawnEnemy("final"); return; }
    const n = this.enemies.length;
    this.spawnSingleEnemy(Math.max(5, this.stats.wave), "boss");
    const b = this.enemies[this.enemies.length - 1];
    if (this.enemies.length > n && b) {
      // Undo the wave's default boss tweaks, then apply the requested kind.
      if (b.bossKind === "kitsune") { b.maxHp = Math.round(b.maxHp / 0.85); b.speed /= 1.1; }
      else if (b.bossKind === "gasha") { b.maxHp = Math.round(b.maxHp / 1.3); b.speed /= 0.75; b.size -= 8; }
      b.hp = b.maxHp;
      const order: BossKind[] = ["oni", "kitsune", "gasha", "raijin"];
      this.decorateBoss(b, (order.indexOf(kind) + 1) * 5);
    }
    this.stats.enemiesLeft = this.enemies.filter(e => e.state !== "dead").length;
    this.emitStats();
  }

  devClearWave() {
    // Kill everything (bosses too) so the wave ends normally into the shop.
    if (this.stats.state !== "playing") return;
    for (const e of [...this.enemies]) {
      if (e.state === "dead") continue;
      e.hp = 0;
      this.killEnemy(e, "honor");
    }
    this.stats.enemiesLeft = 0;
    // Waves end on their timer — expire it so the next frame runs the
    // normal wave-clear path (level-ups, then the shop).
    this.stats.isBossWave = false;
    this.stats.waveTimer = Math.min(this.stats.waveTimer, 0.0001);
    this.emitStats();
  }

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
        this.emitEvent({ t: "pick", kind: "perk", id });
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
    this.enforceStatCaps();
    this.emitEvent({ t: "pick", kind: "perk", id });
    this.acquiredPerks.push(id);
    this.afterPerkSelected();
  }

  // Shared bookkeeping after a level-up choice resolves.
  // ===================== Level-up control: Reroll / Banish / Skip =====================
  /** Redraw every card. */
  rerollLevelUp(): boolean {
    if (this.stats.state !== "levelup" || this.perks.rerolls <= 0) return false;
    this.perks.rerolls--;
    this.stats.pendingChoices = this.rollPerkChoices();
    this.emitEvent({ t: "reroll" });
    audio.play("slash");
    this.emitStats();
    return true;
  }

  /** Remove a card's perk from the pool for the rest of the run and replace the card. */
  banishPerk(id: string): boolean {
    if (this.stats.state !== "levelup" || this.perks.banishes <= 0) return false;
    const i = this.stats.pendingChoices.findIndex(c => c.id === id);
    if (i < 0) return false;
    this.perks.banishes--;
    this.perks.banished.push(id);
    this.emitEvent({ t: "banish", id });
    const taken = new Set(this.stats.pendingChoices.map(c => c.id));
    let replacement: PerkChoice | undefined;
    for (let tries = 0; tries < 8 && !replacement; tries++) replacement = this.rollPerkChoices().find(c => !taken.has(c.id));
    const next = [...this.stats.pendingChoices];
    if (replacement) next[i] = replacement; else next.splice(i, 1);
    this.stats.pendingChoices = next;
    audio.play("armorRing");
    if (!next.length) { this.afterPerkSelected(); return true; }
    this.emitStats();
    return true;
  }

  /** Coins you get for skipping a level-up card. */
  skipReward(): number {
    return Math.round(10 * Math.max(1, this.stats.wave) * DIFFICULTIES[this.difficulty].coins * this.meta.skipMul);   // SHRINE Ascetic
  }

  /** Take coins instead of a card. */
  skipLevelUp(): boolean {
    if (this.stats.state !== "levelup") return false;
    const coins = this.skipReward();
    this.stats.mon += coins;
    this.run.monEarned += coins;
    this.emitEvent({ t: "skip" });
    this.spawnFloatText(this.player.pos, `+${coins} 文`, { color: "hsl(45 95% 65%)", size: 15, vy: -60 });
    audio.play("monPing");
    this.afterPerkSelected();
    return true;
  }

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

  // Damage upgrades add a percent of the run's *starting* damage, so buying
  // several stacks linearly (+30% +30% = +60%) instead of compounding.
  private addKatanaDamagePct(pct: number) {
    this.perks.damage = Math.min(MAX_KATANA_DAMAGE, this.perks.damage + this.baseKatanaDamage * pct);
  }

  // +damage for −max HP. Used by the Glass Cannon perk and Ronin's Gamble.
  // ===================== CRIT STEP =====================
  hawkEyeT = 0;
  private blossomGuard = false;
  private lastBlossom = -1;
  private pendingBlossoms: { x: number; y: number; dmg: number; src: number }[] = [];
  /** STEP 3: does the build carry a thrown / shot weapon that projectile perks help? */
  hasProjectileWeapon(): boolean {
    return this.stats.secondaryIds.some(id => !!id && ["yumi", "kunai", "crossbow", "shuriken_wheel", "flame_spear", "blowgun"].includes(id));
  }
  /** STEP 3: area multiplier for AoE radii. */
  areaMul(): number { return 1 + Math.max(0, this.perks.areaBonus); }
  /** STEP 3: pickup radius multiplier. */
  pickupMul(): number { return 1 + Math.max(0, this.perks.pickupBonus); }
  /** Crit damage multiplier: 3× base plus the soft-capped crit damage stat (never above 5×). */
  critMultiplier(): number { return 3 + soft(this.perks.critDmgRaw, 2, 2); }
  private queueBlossom(e: Enemy, dmg: number) {
    this.lastBlossom = this.elapsed;
    this.pendingBlossoms.push({ x: e.pos.x, y: e.pos.y, dmg: dmg * 0.34, src: e.id });   // the splash picks up damage bonuses again, so 0.34 lands near 40%
  }
  /** Death Blossom bursts resolve after the hit (no crit chains inside one hit). */
  private resolveBlossoms() {
    if (!this.pendingBlossoms.length) return;
    const list = this.pendingBlossoms; this.pendingBlossoms = [];
    this.blossomGuard = true;
    try {
      for (const b of list) {
        for (const o of this.enemies) {
          if (o.state === "dead" || o.id === b.src || Math.hypot(o.pos.x - b.x, o.pos.y - b.y) > 80 * this.areaMul() + o.size) continue;
          this.dmgSrcOverride = "Death Blossom";
          this.dealDamage(o, b.dmg, Math.atan2(o.pos.y - b.y, o.pos.x - b.x), 40);
          this.dmgSrcOverride = null;
        }
        this.fx.burst(b.x, b.y, { count: 12, hue: 340, sat: 80, light: 78, speed: 170, life: 0.5, grav: 60 });
        this.fx.shockwave(b.x, b.y, 80, { hue: 340, light: 75, life: 0.3, width: 5 });
      }
    } finally { this.blossomGuard = false; }
  }

  private applyGlassCannon(dmgMul: number, hpCut: number) {
    this.perks.classDamageMul *= dmgMul;
    const cut = Math.round((100 + this.perks.maxHpBonus) * hpCut);
    this.perks.maxHpBonus -= cut;
    this.player.maxHp = Math.max(20, 100 + this.perks.maxHpBonus);
    this.player.hp = Math.min(this.player.hp, this.player.maxHp);
  }

  applyPerk(id: string) {
    if (id === "ult_power_c") { this.perks.ultPowerMul += 0.15; return; }
    if (id === "ult_power_r") { this.perks.ultPowerMul += 0.30; return; }
    if (DUO_BY_ID[id]) {
      if (!this.perks.duos.includes(id)) { this.perks.duos.push(id); this.run.duos.push(id); }
      this.flash(`DUO · ${DUO_BY_ID[id].kanji} ${DUO_BY_ID[id].name}`);
      return;
    }
    switch (id) {
      case "blade_edge":
        this.addKatanaDamagePct(0.15);
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
      case "keen_eye": this.perks.critChance += 0.06; break;
      case "steady_aim": this.perks.critChance += 0.05; break;
      case "hawks_eye": this.perks.critChance += 0.10; this.perks.hawkEye = true; break;
      case "heavens_eye": this.perks.critChance += 0.15; this.perks.critMark = true; break;
      case "deep_cut": this.perks.critDmgRaw += 0.25; break;
      case "bone_splitter": this.perks.critDmgRaw += 0.5; break;
      case "death_blossom": this.perks.deathBlossom = true; break;
      case "broad_sweep": this.perks.areaBonus += 0.10; this.perks.attackRangeMul *= 1.04; break;
      case "shock_stance": this.perks.areaBonus += 0.20; this.perks.attackRangeMul *= 1.08; break;
      case "heaven_earth": this.perks.areaBonus += 0.35; this.perks.attackRangeMul *= 1.12; this.perks.attackCooldownMul *= 1.1; break;
      case "extra_kunai": this.perks.extraProjectiles += 1; break;
      case "piercing_shot": this.perks.pierceBonus += 1; break;
      case "steel_storm": this.perks.extraProjectiles += 1; this.perks.pierceBonus += 1; this.perks.projSpeedBonus += 0.15; break;
      case "lucky_charm": this.perks.luck += 0.10; break;
      case "fortune_favor": this.perks.luck += 0.25; break;
      case "diligent": this.perks.xpBonus += 0.10; break;
      case "scholar_scroll": this.perks.xpBonus += 0.20; break;
      case "magnet_charm": this.perks.pickupBonus += 0.30; break;
      case "spirit_pull": this.perks.pickupBonus += 0.60; break;
      case "frostbite": this.perks.frostChance += 0.12; break;
      case "deep_freeze": this.perks.deepFreeze = true; break;
      case "winters_heart": this.perks.wintersHeart = true; break;
      case "thick_hide": this.perks.defense += 2; break;
      case "quick_draw": this.perks.dashCdMul *= 0.85; break;
      case "scavenger": this.perks.monMul += 0.2; break;
      case "glass_cannon": this.applyGlassCannon(1.35, 0.2); break;
      case "exploit": this.perks.exploitMul += 0.4; break;
      case "dash_strike": this.perks.dashDmgMul *= 3; break;
      case "spirit_flow": this.perks.ultChargeMul += 0.3; break;
      case "bounty_hunter": this.perks.eliteBounty += 3; break;
      case "haste": this.perks.abilityHaste += 0.2; break;
      case "reaper": this.perks.reaperEvery = this.perks.reaperEvery ? Math.max(5, this.perks.reaperEvery - 3) : 10; break;
      case "last_stand": this.perks.lastStand = true; break;
      case "fox_companion": this.perks.foxCompanion = true; break;
      case "phantom": this.perks.invulnBonus += 1; break;
      case "kensei":
        this.addKatanaDamagePct(0.60);
        break;
      case "tempest": this.perks.doubleStrike = true; break;
      case "shadow_lord": this.perks.stealthHeal += 6; break;
      case "momentum": this.perks.momentumCdr += 1; break;
      case "crit_strike": this.perks.critChance += 0.20; break;
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
    let out = this.rollPerkChoicesInner();
    if (this.isClass("ronin")) out = out.slice(0, SIG.roninCards);   // SIGNATURE Masterless
    // Banished abilities never come back this run.
    out = out.filter(c => !this.perks.banished.includes(c.id));
    // ULTPERK: your class's ultimate upgrade gets a 1-in-5 slot until you take it.
    const mine = ULT_PERKS.find(u => u.cls === this.stats.classId);
    if (mine && !this.perks.banished.includes(mine.id) && !this.acquiredPerks.includes(mine.id) && !out.some(c => c.id === mine.id) && out.length && Math.random() < 0.2) {
      out[Math.floor(Math.random() * out.length)] = { id: mine.id, name: mine.name, kanji: mine.kanji, desc: mine.desc, rarity: mine.rarity, kind: "passive" };
    }
    // DUO: 1 in 4 level-ups swaps the last card for an available duo perk.
    const duos = this.availableDuos().filter(d => !this.perks.banished.includes(d.id));
    if (duos.length && out.length && Math.random() < 0.25) {
      const d = duos[Math.floor(Math.random() * duos.length)];
      out[out.length - 1] = { id: d.id, name: d.name, kanji: d.kanji, desc: `${d.desc} (${d.needsLabel})`, rarity: "duo", kind: "passive", duo: true };   // 7.8: duos have their own odds
    }
    this.emitEvent({ t: "offer", kind: "perk", ids: out.map(c => c.id) });
    return out;
  }

  private rollPerkChoicesInner(): PerkChoice[] {
    // Filter out passive perks that buff abilities the player hasn't equipped.
    const equipped = this.stats.equippedAbilities;
    const maxed = this.maxedShopEffects();
    const perkMaxed: Record<string, string> = {
      swift_step: "spd_common", swift_strike: "dex_common", thick_hide: "def_rare",
      keen_eye: "crit", crit_strike: "crit", steady_aim: "crit", hawks_eye: "crit", heavens_eye: "crit",
      extra_kunai: "shop_full_quiver", steel_storm: "shop_full_quiver",
      lifebloom: "hp_regen", blade_edge: "dmg_katana_common",
      vampire: "lifesteal",
    };
    const critNow = critFromPoints(this.perks.critChance);
    const passivesAvailable = PERK_POOL.filter(p => {
      if (perkMaxed[p.id] && maxed.has(perkMaxed[p.id])) return false;
      // CRIT STEP: crit damage only matters once you crit (Halls of Torment rule).
      if ((p.id === "deep_cut" || p.id === "bone_splitter" || p.id === "death_blossom") && critNow < 0.15) return false;
      if (p.id === "death_blossom" && this.perks.deathBlossom) return false;
      // STEP 3: only offer cards that can do something for this build.
      if ((p.id === "extra_kunai" || p.id === "piercing_shot" || p.id === "steel_storm") && !this.hasProjectileWeapon()) return false;
      if ((p.id === "deep_freeze" || p.id === "winters_heart") && !(this.perks.frostChance > 0)) return false;
      if ((p.id === "deep_freeze" && this.perks.deepFreeze) || (p.id === "winters_heart" && this.perks.wintersHeart)) return false;
      if (this.perks.banished.includes(p.id)) return false;   // banished this run
      if (p.id === "wave_clear" && this.vr("no_rest")) return false;
      const up = ULT_PERK_BY_ID[p.id];
      if (up && up.cls && up.cls !== this.stats.classId) return false;     // class ult perks: own class only
      if (up && up.unique && this.acquiredPerks.includes(p.id)) return false;
      if ((p.id === "barrage_master" || p.id === "barrage_blade") && !equipped.includes("barrage")) return false;
      if ((p.id === "flash_master" || p.id === "phantom_strike") && !equipped.includes("flash")) return false;
      return true;
    });

    const ownedFamilies = new Set(this.acquiredPerks.map(id => PERK_FAMILY[id]).filter(Boolean));
    // Weight: common 70%, rare 25%, legendary 5%
    const pickPassive = (): PerkChoice => {
      const r = Math.random();
      const lk = Math.max(0, this.perks.luck);   // STEP 3: luck shifts odds toward rare / legendary
      const legT = 0.05 * (1 + lk), rareT = legT + 0.25 * (1 + lk * 0.6);
      const rarity = r < legT ? "legendary" : r < rareT ? "rare" : "common";
      const pool = passivesAvailable.filter(p => p.rarity === rarity);
      const src = pool.length ? pool : passivesAvailable;
      // STEP 3: family weighting (Hades-style) — cards from a family you already
      // have a card from are 1.5× as likely, so builds come together.
      const w = src.map(p => (PERK_FAMILY[p.id] && ownedFamilies.has(PERK_FAMILY[p.id]) ? 1.5 : 1));
      let roll = Math.random() * w.reduce((a, b) => a + b, 0);
      let pick = src[src.length - 1];
      for (let i = 0; i < src.length; i++) { roll -= w[i]; if (roll < 0) { pick = src[i]; break; } }
      return { ...pick, kind: "passive" } as PerkChoice;
    };

    // Build ability cards for any abilities the player doesn't yet have equipped.
    const abilityCards: PerkChoice[] = ABILITY_POOL
      .filter(a => !equipped.includes(a.id))
      .map(a => ({
        id: a.id,
        kanji: a.kanji,
        name: a.name,
        desc: a.desc,
        rarity: "ability",   // 7.8: own category, no longer counted as "rare"
        kind: "ability",
      }));

    const out: PerkChoice[] = [];
    const seen = new Set<string>();

    // Guarantee an ability card while you still have an empty ability slot.
    // 7.8: once both slots are full, ability cards are only occasional swap offers.
    if (abilityCards.length > 0 && (equipped.length < 2 || Math.random() < 0.2)) {
      const ac = abilityCards[Math.floor(Math.random() * abilityCards.length)];
      out.push(ac);
      seen.add(ac.id);
    }

    let safety = 30;
    while (out.length < 3 && safety-- > 0) {
      // Mix in another ability card occasionally
      const useAbility = abilityCards.length > 0 && equipped.length < 2 && Math.random() < 0.15;   // 7.8: was 25%, even with full slots
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
    amount *= this.meta.xpMul * (this.omenDef?.xp ?? 1) * (1 + Math.max(0, this.perks.xpBonus));   // SHRINE Scholar, OMEN, STEP 3 XP
    this.stats.xp += amount;
    let gained = false;
    while (this.stats.xp >= this.stats.xpToNext) {
      this.stats.xp -= this.stats.xpToNext;
      this.stats.level += 1;
      this.stats.xpToNext = xpForLevel(this.stats.level);
      this.pendingLevelUps += 1;
      gained = true;
    }
    if (!gained) return;
    this.flash(`Level ${this.stats.level}! · blessing after the wave`);
    audio.play("levelUp");
    this.fx.levelUp(this.player.pos.x, this.player.pos.y);
    // Mid-wave level-ups are banked so combat isn't interrupted.
    // (Not while the Final Boss victory is pending: those wait for Endless.)
    if (this.stats.state === "playing" && this.stats.waveTimer <= 0 && !this.victoryPending && this.cinematicTimer <= 0) this.openPendingLevelUp();
  }

  private openPendingLevelUp() {
    this.stats.state = "levelup";
    this.stats.pendingChoices = this.rollPerkChoices();
    this.emitStats();
  }

  // Wave over: spend banked level-ups first, then visit the shop.
  private finishWave() {
    this.run.wavesCleared++;
    if (this.omen) this.run.omens++;
    this.omen = null; this.curseDmgIn = 1; this.arenaShrine = null;   // OMEN / ARENA SHRINE last one wave
    if (this.hasDuo("duo_flow")) {   // DUO Endless Flow
      for (const id of Object.keys(this.stats.abilityCd)) this.stats.abilityCd[id] = 0;
      this.addUltCharge(this.stats.ultMax * 0.25);
    }
    if (this.run.damageTaken <= this.waveDmgMark) {
      this.run.flawlessWaves++;
      this.run.flawlessStreak++;
      this.run.bestFlawlessStreak = Math.max(this.run.bestFlawlessStreak, this.run.flawlessStreak);
      if (this.stats.isBossWave) this.run.flawlessBossWaves++;
    } else this.run.flawlessStreak = 0;
    if (this.player && this.player.hp > 0 && this.player.hp <= 3) this.run.clutchWaves++;
    if ((this.stats.state as string) === "levelup") { this.pendingShopOpen = true; return; }
    if (this.pendingLevelUps > 0) {
      this.pendingShopOpen = true;
      this.openPendingLevelUp();
      return;
    }
    this.openShop();
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
    this.fx.scale = this.quality.state.particleScale;
    this.fx.update(dtRaw);
    if (this.player) {
      this.fx.aura.on = this.stats.ultActive;
      this.fx.aura.x = this.player.pos.x;
      this.fx.aura.y = this.player.pos.y;
    }
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

    // Ultimate cutscene: the world holds still while the class's cutscene plays.
    if (this.ultCutscene && this.stats.state === "playing") {
      this.ultCutscene.t += dtRaw;
      if (this.ultCutscene.t >= this.ultCutscene.dur) {
        this.ultCutscene = null;
        // Aim where the player is pointing NOW, not where they were when they pressed it.
        if (this.input.mouseAim) {
          this.player.facing = Math.atan2(this.input.mouseY + this.cameraY - this.player.pos.y, this.input.mouseX + this.cameraX - this.player.pos.x);
        }
        this.executeUltimate();
      }
      this.emitStats();
      return;
    }

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
        if (this.victoryPending) {
          this.victoryPending = false;
          this.stats.state = "victory";
          audio.stopMusic();
          audio.play("levelUp");
        }
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
    this.updateHazards(dt);
    this.updateElites(dt);
    this.updateArenaShrine(dt);
    this.ultDealtBucket = Math.min(ULT_CHARGE.dealtBurst, this.ultDealtBucket + ULT_CHARGE.dealtRatePerSec * dt);   // 7.6
    this.ultTakenBucket = Math.min(ULT_CHARGE.takenBurst, this.ultTakenBucket + ULT_CHARGE.takenRatePerSec * dt);
    this.updateEvo(dt);
    this.updateInk(dt);
    updateNewHazards(this, dt);   // STEP 4
    this.updateParticles(dt);
    this.updatePetals(dtRaw);
    this.updateAbilities(dt);
    this.maybeSpawnEnemies(dt);

    // Wave survival timer countdown — wave ends when timer expires,
    // then we open the between-wave shop (Phase 4) instead of auto-spawning.
    // Exception: on boss waves the timer is uncapped — the wave only
    // ends when every living boss is dead. The countdown still ticks
    // for visual feedback but reaching 0 does not end the wave.
    this.run.time += dt;
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
        // Snapshot at the wave-clear boundary (flagged atShop so Continue
        // reopens the level-ups/shop rather than replaying this wave). We
        // re-save when the shop closes so resumed runs start the next wave.
        this.persistResumeSnapshot(true);
        this.finishWave();
      }
    }

    // Passive HP regen perk
    if (this.perks.hpRegen > 0) {
      this.hpRegenAccumulator += this.perks.hpRegen * dt;
      if (this.hpRegenAccumulator >= 1) {
        const heal = Math.floor(this.hpRegenAccumulator);
        this.hpRegenAccumulator -= heal;
        this.healPlayer(heal);
      }
    }

    // Ability cooldown ticking — every equipped ability
    for (const id of this.stats.equippedAbilities) {
      const cur = this.stats.abilityCd[id] ?? 0;
      if (cur > 0) this.stats.abilityCd[id] = Math.max(0, cur - dt * this.perks.abilityHaste);
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
        this.emitEvent({ t: "death", by: this.lastHitBy, wave: this.stats.wave });
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
    // Kunoichi Phantom Dance: movement steers the slash storm; the body holds still.
    if (this.phantomSteering()) { this.phantomMove = { x: mx, y: my }; mx = 0; my = 0; }
    else this.phantomMove = { x: 0, y: 0 };

    const mag = Math.hypot(mx, my);
    if (mag > 0.05) {
      mx /= Math.max(mag, 1);
      my /= Math.max(mag, 1);
      // Movement direction is default facing
      if (!this.input.mouseAim) p.facing = Math.atan2(my, mx);
    }
    // Touch aim assist: while attacking, turn to the nearest enemy in reach.
    if (!this.input.mouseAim && this.input.aimAssist && this.input.attackHeld) {
      const t = this.nearestEnemyTo(p.pos, 420);
      if (t) p.facing = Math.atan2(t.pos.y - p.pos.y, t.pos.x - p.pos.x);
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
    if (this.isClass("tetsubo")) this.playerRoot = 0;   // SIGNATURE Unstoppable
    const ctrlSlow = this.isClass("tetsubo") ? 1 : this.frostSlowMul() * this.inkSlowMul() * newEnemySlowMul(this) * (this.playerRoot > 0 ? 0 : 1);
    const slow = ((!dashing && p.attackAnim > 0) ? 0.87 : 1) * (dashing ? 1 : ctrlSlow) * (1 + this.tailwindStacks * SIG.arashiStack);
    this.updateSignatures(dt, mag > 0.05, dashing);
    // Hard cap on player speed bonuses from all sources (perks + class + items).
    // Penalties (speedMul < 1, e.g. Tetsubo / Sumo) still apply normally; only
    // the *bonus* above 1.0 is clamped so the player can never out-run elites.
    // Diminishing curve on speed bonuses; penalties apply in full.
    const cappedSpeedMul = moveSpeedFromMul(this.perks.speedMul);
    // Wind Charm consumable: +30% movement speed while active.
    const buffSpeedMul = (this.stats.buffWindCharmRemaining > 0 ? 1.30 : 1) * (this.ultWindTimer > 0 ? 1.6 : 1);
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
          const dmg = BASE.DASH_DAMAGE * (this.perks.damage / BASE.ATTACK_DAMAGE) * this.perks.dashDmgMul;
          if (this.isClass("tengu")) this.feathers.push({ x: e.pos.x, y: e.pos.y, t: SIG.tenguFeatherDelay });   // SIGNATURE Feather Dash
          // DUO Phantom Rush: weak non-elites die outright.
          if (this.hasDuo("duo_phantom") && !e.isBoss && !e.affixes && e.hp / e.maxHp < 0.4) {
            p.dashHitIds.add(e.id);
            this.spawnFloatText(e.pos, "幻", { color: "hsl(260 80% 80%)", size: 15, jp: true });
            this.killEnemy(e, "ghost");
            this.run.stealthKills++;
            continue;
          }
          e.hp -= dmg;
          this.trackDealt("Dash", dmg);
          this.spawnFloatText(e.pos, fmtNum(dmg), {
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
    const wasDashing = p.dashTimer > 0;
    p.dashTimer = Math.max(0, p.dashTimer - dt);
    if (wasDashing && p.dashTimer === 0 && this.isClass("shinobi")) this.vanishTimer = SIG.shinobiVanish;   // SIGNATURE Vanish
    if (p.dashTimer <= 0 && p.dashHitIds.size > 0) p.dashHitIds.clear();
    p.hitFlash = Math.max(0, p.hitFlash - dt * 4);
    this.fireAnim = Math.max(0, this.fireAnim - dt * 5);
    if (this.abilityPose) {
      this.abilityPose.t += dt;
      if (this.abilityPose.t >= this.abilityPose.dur) this.abilityPose = null;
    }
    if (this.ultPose) {
      this.ultPose.t += dt;
      if (this.ultPose.t >= this.ultPose.dur) this.ultPose = null;
    }
    this.saiAnim[0] = Math.max(0, this.saiAnim[0] - dt * 6);
    this.saiAnim[1] = Math.max(0, this.saiAnim[1] - dt * 6);
    if (p.attackAnim > 0) {
      p.attackAnim -= dt * 3.5;
      if (p.attackAnim < 0) p.attackAnim = 0;
    }

    if (this.input.attackPressed && p.attackCooldown <= 0 && !blocking) {
      // If the active secondary slot holds a melee weapon, the katana attack
      // button swings it instead of the katana. Katana buffs do NOT transfer —
      // the secondary uses its own damage/range/arc/cooldown via fireSecondary().
      const slot = this.stats.secondaryActiveSlot;
      const activeId = this.stats.secondaryIds[slot];
      if (!activeId || activeId === "katana") {
        this.doPlayerAttack();
      } else if (this.activeSecondaryIsMelee()) {
        this.fireSecondary();
      } else if (this.stats.secondaryAmmo[slot] > 0 && this.stats.secondaryReload[slot] <= 0) {
        this.fireSecondary();
      } else {
        // Out of ammo / reloading: fall back to a katana swing so attack never does nothing.
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
      if (this.perks.hawkEye) this.hawkEyeT = 2;   // CRIT STEP: Hawk's Eye
      onDashNewClass(this, ang);   // STEP 5: Rikishi shove
      this.playerRoot = 0;   // dashing breaks an Onryō root
      this.run.dashes++;
      p.dashCooldown = BASE.DASH_COOLDOWN * (this.stats.classId === "tengu" ? 0.6 : 1) * this.perks.dashCdMul * (this.ultWindTimer > 0 ? 0.15 : 1);
      if (this.ultWindTimer > 0) {
        // Gale: a cutting wind along the whole dash path.
        const ex = p.pos.x + Math.cos(ang) * BASE.DASH_DISTANCE, ey = p.pos.y + Math.sin(ang) * BASE.DASH_DISTANCE;
        for (const e of this.enemies) {
          if (e.state === "dead") continue;
          const rx = e.pos.x - p.pos.x, ry = e.pos.y - p.pos.y;
          const along = rx * Math.cos(ang) + ry * Math.sin(ang);
          if (along < 0 || along > BASE.DASH_DISTANCE) continue;
          if (Math.abs(-rx * Math.sin(ang) + ry * Math.cos(ang)) > 46 + e.size) continue;
          this.dmgSrcOverride = "Ultimate"; this.dealDamage(e, this.ultDmgRaw(2.1), ang, 120); this.dmgSrcOverride = null;   // Divine Wind gale (7.5: was a flat 8)
        }
        this.fx.streakLine(p.pos.x, p.pos.y, ex, ey, 140, 90, 18, 0.35);
      }
      p.invuln = Math.max(p.invuln, BASE.DASH_IFRAMES);
      p.dashHitIds.clear();
      this.cameraShake = Math.max(this.cameraShake, 0.15);
      audio.play("smokeWoosh");
      this.fx.smoke(p.pos.x, p.pos.y, 4, 26, 45, 30, 15);
      this.fx.streakLine(p.pos.x, p.pos.y, p.pos.x + Math.cos(ang) * BASE.DASH_DISTANCE, p.pos.y + Math.sin(ang) * BASE.DASH_DISTANCE, 40, 92, 7, 0.22);
      for (let i = 1; i <= 3; i++) spawnGhostAfterimage(this.vfx, p.pos.x + Math.cos(ang) * BASE.DASH_DISTANCE * i * 0.25, p.pos.y + Math.sin(ang) * BASE.DASH_DISTANCE * i * 0.25, ang, BASE.PLAYER_RADIUS);
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
    p.attackCooldown = BASE.ATTACK_COOLDOWN * this.katanaCdMul();

    const range = BASE.ATTACK_RANGE * this.perks.attackRangeMul;
    let arc = BASE.ATTACK_ARC * this.perks.attackArcMul;
    const stealthRange = BASE.STEALTH_KILL_RANGE * this.perks.stealthRangeMul;

    // Stealth kill — eligible if the enemy hasn't seen us (patrol + low
 // alertness) OR if the enemy is currently disoriented by smoke (from
 // either the Smoke Bomb ability or the Smoke Bomb secondary).
    const nearest = this.findNearestEnemyInFront(stealthRange, Math.PI * 0.6);
    const isUnaware = nearest && nearest.state === "patrol" && nearest.alertness < 0.5;
    const isSmoked  = nearest && nearest.disorientRemaining > 0;
    const isLost = nearest && !!nearest.lostTrack;   // searching for a hidden player
    if (nearest && (isUnaware || isSmoked || isLost) && !nearest.isBoss) {
      this.killEnemy(nearest, "ghost");
      this.run.stealthKills++;
      if (this.isClass("shinobi")) this.player.dashCooldown = 0;   // SIGNATURE Vanish: refund dash
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
        this.healPlayer(heal);
      }
      return;
    }

    this.onKatanaSwing();
    this.vanishTimer = 0;   // attacking breaks Shinobi's Vanish
    const focused = this.isClass("kensei") && this.stillTimer >= SIG.kenseiFocusTime;   // SIGNATURE Focus
    if (focused) { arc *= SIG.kenseiArcMul; this.forceCrit = true; this.stillTimer = 0; }
    const strikes = this.perks.doubleStrike ? 2 : 1;
    let hit = false;
    const struck = new Set<number>();
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
          struck.add(e.id);
        }
      }
    }
    this.forceCrit = false;
    if (focused) this.spawnFloatText(p.pos, "心 Focus", { color: "hsl(45 95% 70%)", size: 13, jp: true });
    if (this.isClass("onna") && struck.size >= SIG.onnaHits) {   // SIGNATURE Sweeping Stance
      p.dashCooldown = 0;
      this.spawnFloatText(p.pos, "薙 Dash ready", { color: "hsl(200 80% 75%)", size: 12, jp: true });
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

  /** Splitting / Volatile death effects and the Spirit Chest drop. */
  private onEliteDeath(e: Enemy) {
    const aff = e.affixes!;
    this.run.eliteKills++;
    for (const a of aff) this.run.eliteByAffix[a] = (this.run.eliteByAffix[a] ?? 0) + 1;
    if (aff.length >= 2) this.run.doubleEliteKills++;
    if (aff.includes("splitting") && !e.isBoss) {
      for (const side of [-1, 1]) {
        const c = this.makeEnemy({
          x: e.pos.x + side * 22, y: e.pos.y, isBoss: false, archetype: e.archetype,
          hp: Math.max(1, e.maxHp * ELITE.splitHpShare), damage: e.damage, speed: e.speed,
          size: Math.max(8, Math.round(e.size * ELITE.splitSize)),
          xpReward: Math.max(1, Math.round(e.xpReward / 6)), monReward: Math.max(1, Math.round(e.monReward / 6)),
        });
        c.vel.x = side * 260;
        this.enemies.push(c);
      }
      this.fx.burst(e.pos.x, e.pos.y, { count: 10, hue: AFFIXES.splitting.hue, light: 60, speed: 200, life: 0.4 });
    }
    if (aff.includes("volatile")) {
      this.hazards.push({ x: e.pos.x, y: e.pos.y, r: ELITE.volatileRadius, t: 0, max: ELITE.volatileFuse,
        damage: Math.round(e.damage * ELITE.volatileDmgMul), kind: "bomb", fromX: e.pos.x, fromY: e.pos.y, src: "volatile elite (explosion)" });
    }
    this.spiritChests.push({ x: e.pos.x, y: e.pos.y, life: ELITE.chestLife, t: 0 });
  }

  /** Stats/achievement bookkeeping for a real kill. */
  private trackKill(e: Enemy) {
    this.run.kills++;
    this.multiKillTimes.push(this.elapsed);
    while (this.multiKillTimes.length && this.elapsed - this.multiKillTimes[0] > 0.5) this.multiKillTimes.shift();
    this.run.bestMultiKill = Math.max(this.run.bestMultiKill, this.multiKillTimes.length);
    if (this.stats.ultActive && this.hasUltPerk("ult_harvest_c")) {   // ULTPERK Soul Harvest
      this.stats.ultCharge = Math.min(this.stats.ultMax, this.stats.ultCharge + this.stats.ultMax * 0.04);
    }
    if (this.ultShadowStepTimer > 0 && this.hasUltPerk("ultc_shinobi")) { this.ultShadowStepTimer += 0.5; this.healPlayer(3); }
    if (this.ultBloodRageTimer > 0 && this.hasUltPerk("ultc_berserker")) this.ultBloodRageTimer += 0.5;
    if (this.stats.ultActive || this.ultCutscene) {
      this.ultKillCount++;
      this.run.bestUltKills = Math.max(this.run.bestUltKills, this.ultKillCount);
    }
    this.run.killsByKind[e.archetype] = (this.run.killsByKind[e.archetype] ?? 0) + 1;
    if (e.isBoss) {
      this.run.bossKills++;
      if (this.meta.bossHeal > 0 && this.player) this.healPlayer(Math.round(this.player.maxHp * this.meta.bossHeal));   // SHRINE Trophy
      const bk = e.archetype === "final" ? "final" : (e.bossKind ?? "oni");
      this.run.bossByKind[bk] = (this.run.bossByKind[bk] ?? 0) + 1;
    }
  }

  killEnemy(e: Enemy, type: "honor" | "ghost") {
    if (e.state === "dead") return;
    e.state = "dead";
    onNewEnemyKilled(this, e);   // STEP 4: splitter / mimic
    if (!this.sweeping) this.trackKill(e);
    if (!this.sweeping && this.isClass("arashi") && e.lastSrc && e.lastSrc !== "katana" && e.lastSrc !== "other" &&
        !isMeleeSecondary(e.lastSrc as SecondaryId)) {   // SIGNATURE Tailwind
      this.tailwindStacks = Math.min(SIG.arashiMaxStacks, this.tailwindStacks + 1);
      this.tailwindTimer = SIG.arashiTime;
    }
    if (e.archetype === "nue" && !this.sweeping) {
      if (!e.summoned) this.run.nueFirstStrike++;
      // Its summons dissipate with it (they don't count as your kills).
      const prev = this.sweeping;
      this.sweeping = true;
      for (const o of this.enemies) if (o.summonerId === e.id && o.state !== "dead") { this.spawnSpark(o.pos); this.killEnemy(o, "honor"); }
      this.sweeping = prev;
    }
    if (e.affixes && !this.sweeping) this.onEliteDeath(e);
    else if (e.isBoss && !this.sweeping) this.spiritChests.push({ x: e.pos.x, y: e.pos.y, life: ELITE.chestLife, t: 0 });
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
    // 7.7: Brotato-style — fewer kills drop coins as waves go on (bosses always pay).
    const drops = e.isBoss || Math.random() < coinDropChance(this.stats.wave);
    const monGain = !drops ? 0 : Math.max(0, Math.round(e.monReward * 0.75 * this.perks.monMul * DIFFICULTIES[this.difficulty].coins * (type === "ghost" ? 1.5 : 1) * (1 + VOW_COIN_BONUS * this.vowScore) * (this.omenDef?.coins ?? 1) * endlessIncomeMul(this.stats.wave)));
    if (this.perks.eliteBounty > 0 && e.archetype !== "normal" && e.archetype !== "wisp") {
      this.stats.mon += this.perks.eliteBounty;
      this.healPlayer(2);
      this.spawnFloatText(e.pos, `+${this.perks.eliteBounty} 賞`, { color: "hsl(45 95% 65%)", size: 13, jp: true, vy: -70 });
    }
    if (this.perks.wintersHeart && (e.frozenUntil ?? 0) > this.elapsed - 0.1 && !this.blossomGuard) {   // STEP 3: Winter's Heart
      const R = 110 * this.areaMul(), sd = this.perks.damage * 2 + 6;
      this.blossomGuard = true;
      try {
        for (const o of this.enemies) {
          if (o === e || o.state === "dead" || o.hp <= 0 || Math.hypot(o.pos.x - e.pos.x, o.pos.y - e.pos.y) > R + o.size) continue;
          this.dmgSrcOverride = "Winter's Heart"; this.dealDamage(o, sd, Math.atan2(o.pos.y - e.pos.y, o.pos.x - e.pos.x), 160); this.dmgSrcOverride = null;
          o.chillUntil = this.elapsed + 2; o.slowRemaining = Math.max(o.slowRemaining, 2);
        }
      } finally { this.blossomGuard = false; }
      this.fx.frost(e.pos.x, e.pos.y, 14);
      this.fx.shockwave(e.pos.x, e.pos.y, R, { hue: 195, light: 88, life: 0.4, width: 8, lines: 12 });
    }
    if (this.perks.reaperEvery > 0 && ++this.reaperCount >= this.perks.reaperEvery) {
      this.reaperCount = 0;
      const R = 170 * this.areaMul();   // STEP 3 area
      const rd = this.perks.damage * 3 + 4;
      for (const o of this.enemies) {
        if (o === e || o.state === "dead" || o.hp <= 0) continue;
        const d = Math.hypot(o.pos.x - e.pos.x, o.pos.y - e.pos.y);
        if (d <= R + o.size) {
          if (this.hasDuo("duo_pyre")) { o.burnRemaining = Math.max(o.burnRemaining, 4); o.burnDps = Math.max(o.burnDps, 5); }  // DUO Funeral Pyre
          this.dealDamage(o, rd, Math.atan2(o.pos.y - e.pos.y, o.pos.x - e.pos.x), 120);
        }
      }
      this.fx.shockwave(e.pos.x, e.pos.y, R, { hue: 280, light: 70, life: 0.5, width: 10, lines: 14 });
      this.fx.seal(e.pos.x, e.pos.y - 30, "冥", 280, 30, 0.7);
    }
    this.stats.mon += monGain;
    this.run.monEarned += monGain;
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
        this.healPlayer(6);
        this.spawnFloatText(this.player.pos, "+6", {
          color: "hsl(180 80% 75%)", size: 14, vy: -55,
        });
      }
    }
    this.spawnBlood(e.pos, Math.random() * Math.PI * 2, e.isBoss ? 40 : 18);
    this.fx.death(e.pos.x, e.pos.y, e.size, e.isBoss);
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
      let heal = Math.min(MAX_HEAL_PER_KILL, killHeal);
      if (this.hasDuo("duo_undying") && this.player.hp / Math.max(1, this.player.maxHp) < 0.3) heal *= 3;  // DUO Undying Rage
      this.healPlayer(heal);
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
    if (this.ultShadowConsumeTimer > 0) {
      // Shadow Consume feeds on kills: each one extends it.
      this.ultShadowConsumeTimer = Math.min(12, this.ultShadowConsumeTimer + 0.6);
      this.fx.smoke(e.pos.x, e.pos.y, 3, 30, 8, 260, 30);
    }
    if (this.stats.classId === "kitsune" && Math.random() < 0.25) {
      this.spawnFoxfire(e.pos.x, e.pos.y, 5);
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
    // 7.6: kills no longer charge the ult (damage dealt does, with a rate limit).

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
        this.persistResumeSnapshot(true);
        // VICTORY: the first Final Boss ends the run in triumph (after its
        // cinematic). Level-ups and the shop resume if you continue in Endless.
        if (e.archetype === "final" && !this.endless) this.victoryPending = true;
        else this.finishWave();
      }
    }
    this.emitStats();
  }

  // True when the player is below 30% HP — used for ult charge bonuses + ramp.
  lowHp(): boolean {
    return this.player.hp / Math.max(1, this.player.maxHp) <= 0.3;
  }

  // Add charge to the ultimate gauge and update the `ultReady` flag.
  /** Clone AI rework: one human-like swordsman tick. Same damage per cycle as before (~0.7s). */
  private updateClone(c: Clone, ci: number, dt: number) {
    const P = this.player.pos;
    c.life -= dt;
    c.hitFlash = Math.max(0, c.hitFlash - dt * 4);
    c.vel ??= { x: 0, y: 0 };
    c.mode ??= "follow";
    c.modeT = (c.modeT ?? 0) - dt;
    c.swing = Math.max(0, (c.swing ?? 0) - dt / 0.22);
    c.dodgeCd = Math.max(0, (c.dodgeCd ?? 0) - dt);
    c.side ??= ci % 2 ? -1 : 1;
    c.circleDir ??= Math.random() < 0.5 ? -1 : 1;
    // Target: an enemy near YOU (a bodyguard, not a wanderer), keep it while it lives.
    let tgt = c.targetId != null ? this.enemies.find(e => e.id === c.targetId && e.state !== "dead") ?? null : null;
    if (tgt && Math.hypot(tgt.pos.x - P.x, tgt.pos.y - P.y) > 380) tgt = null;
    if (!tgt) {
      let best = Infinity;
      for (const e of this.enemies) {
        if (e.state === "dead") continue;
        const dp = Math.hypot(e.pos.x - P.x, e.pos.y - P.y);
        if (dp > 320) continue;
        const dc = Math.hypot(e.pos.x - c.pos.x, e.pos.y - c.pos.y);
        const taken = this.clones.some(o => o !== c && o.targetId === e.id) ? 80 : 0;   // spread out
        if (dc + taken < best) { best = dc + taken; tgt = e; }
      }
      c.targetId = tgt ? tgt.id : null;
      if (tgt && c.mode === "follow") { c.mode = "approach"; c.modeT = 0; }
    }
    if (!tgt && c.mode !== "dodge") c.mode = "follow";
    let goalX = P.x, goalY = P.y, maxSpd = 235, accel = 1100;
    const face = (ang: number, rate: number) => {
      const d = Math.atan2(Math.sin(ang - c.facing), Math.cos(ang - c.facing));
      c.facing += d * Math.min(1, dt * rate);
    };
    if (c.mode === "follow") {
      // Walk at your shoulder, a step behind, with a little idle sway.
      const pf = this.player.facing;
      goalX = P.x + Math.cos(pf + Math.PI / 2 * c.side) * 46 - Math.cos(pf) * 22 + Math.sin(this.elapsed * 1.3 + ci) * 6;
      goalY = P.y + Math.sin(pf + Math.PI / 2 * c.side) * 46 - Math.sin(pf) * 22 + Math.cos(this.elapsed * 1.1 + ci) * 6;
      maxSpd = 250;
    } else if (tgt) {
      const dx = tgt.pos.x - c.pos.x, dy = tgt.pos.y - c.pos.y, d = Math.hypot(dx, dy) || 1;
      const ang = Math.atan2(dy, dx);
      const reach = 58 + tgt.size;
      // React to an enemy wind-up: sidestep (cooldown so it doesn't jitter).
      if (tgt.attackTelegraph > 0 && d < reach + 30 && c.dodgeCd <= 0 && c.mode !== "strike" && (c.dodgeCd = 0.6, Math.random() < 0.6)) {
        c.mode = "dodge"; c.modeT = 0.2; c.dodgeCd = 1.4;
        const side = Math.random() < 0.5 ? -1 : 1;
        c.vel.x = Math.cos(ang + side * 1.9) * 380; c.vel.y = Math.sin(ang + side * 1.9) * 380;
        this.fx.smoke(c.pos.x, c.pos.y, 2, 14, 30, 215, 30);
      }
      if (c.mode === "approach") {
        // Close in on a slight curve (people don't walk in perfect lines).
        const weave = Math.sin(this.elapsed * 3 + ci * 2) * 0.35;
        goalX = c.pos.x + Math.cos(ang + weave) * 100; goalY = c.pos.y + Math.sin(ang + weave) * 100;
        face(ang, 10);
        if (d < reach + 6 && c.attackTimer <= 0) { c.mode = "windup"; c.modeT = 0.16; }
        else if (d < reach) { c.mode = "circle"; c.modeT = 0.2 + Math.random() * 0.25; }
      } else if (c.mode === "windup") {
        // Draw back: a small step away, blade raised.
        goalX = c.pos.x - Math.cos(ang) * 30; goalY = c.pos.y - Math.sin(ang) * 30; maxSpd = 60;
        face(ang, 16);
        if (c.modeT <= 0) {
          c.mode = "strike"; c.modeT = 0.12;
          c.vel.x = Math.cos(ang) * 420; c.vel.y = Math.sin(ang) * 420;   // lunge
          c.swing = 1; c.swingDir = -(c.swingDir ?? 1);
          c.attackTimer = 0.7;
          if (d < reach + 40) {
            this.dmgSrcOverride = "Ultimate"; this.dealDamage(tgt, this.ultDmgRaw(7.5), ang, 40); this.dmgSrcOverride = null;   // Twin Shadows clone (7.5: scales like an ult)
          }
          this.fx.slash(c.pos.x, c.pos.y, ang, 56, Math.PI * 0.8, c.swingDir, { hue: 215, sat: 80, light: 72, width: 6, life: 0.2 });
          audio.play("slash");
        }
      } else if (c.mode === "strike") {
        goalX = tgt.pos.x; goalY = tgt.pos.y; maxSpd = 420; accel = 400;
        if (c.modeT <= 0) { c.mode = "recover"; c.modeT = 0.2; }
      } else if (c.mode === "recover") {
        // Settle back out of reach.
        goalX = c.pos.x - Math.cos(ang) * 40; goalY = c.pos.y - Math.sin(ang) * 40; maxSpd = 130;
        face(ang, 8);
        if (c.modeT <= 0) { c.mode = "circle"; c.modeT = 0.15 + Math.random() * 0.3; if (Math.random() < 0.3) c.circleDir = -c.circleDir; }
      } else if (c.mode === "circle") {
        // Strafe around the target at sword's length, looking for the next opening.
        const ca = ang + Math.PI + c.circleDir * 0.9;
        goalX = tgt.pos.x + Math.cos(ca) * (reach - 4); goalY = tgt.pos.y + Math.sin(ca) * (reach - 4); maxSpd = 170;
        face(ang, 12);
        if (c.modeT <= 0 && c.attackTimer <= 0) c.mode = "approach";
      } else if (c.mode === "dodge") {
        maxSpd = 400; accel = 300; goalX = c.pos.x + c.vel.x; goalY = c.pos.y + c.vel.y;
        if (c.modeT <= 0) c.mode = "circle";
      }
    } else if (c.mode === "dodge" && c.modeT <= 0) c.mode = "follow";
    c.attackTimer -= dt;
    // Arrive steering: accelerate toward the goal, ease off when close.
    const gx = goalX - c.pos.x, gy = goalY - c.pos.y, gd = Math.hypot(gx, gy);
    const want = gd < 1 ? 0 : Math.min(maxSpd, gd * 6);
    const tvx = gd < 1 ? 0 : (gx / gd) * want, tvy = gd < 1 ? 0 : (gy / gd) * want;
    const ax = tvx - c.vel.x, ay = tvy - c.vel.y, al = Math.hypot(ax, ay), step = accel * dt;
    if (al > step) { c.vel.x += (ax / al) * step; c.vel.y += (ay / al) * step; } else { c.vel.x = tvx; c.vel.y = tvy; }
    // Keep personal space from you and the other clone.
    for (const o of [this.player.pos, ...this.clones.filter(o => o !== c).map(o => o.pos)]) {
      const sx = c.pos.x - o.x, sy = c.pos.y - o.y, sd = Math.hypot(sx, sy);
      if (sd > 0 && sd < 36) { c.vel.x += (sx / sd) * 600 * dt; c.vel.y += (sy / sd) * 600 * dt; }
    }
    c.pos.x += c.vel.x * dt; c.pos.y += c.vel.y * dt;
    c.pos.x = Math.max(20, Math.min(this.worldW - 20, c.pos.x));
    c.pos.y = Math.max(20, Math.min(this.worldH - 20, c.pos.y));
    if (c.mode === "follow" || (c.mode === "approach" && Math.hypot(c.vel.x, c.vel.y) > 40 && !tgt)) {
      if (Math.hypot(c.vel.x, c.vel.y) > 30) face(Math.atan2(c.vel.y, c.vel.x), 7);
      else face(this.player.facing, 3);
    }
  }

  // ===================== 7.6: Hades-style ult charging =====================
  /** Refilling allowance (in % of the bar) for charge from dealing damage. */
  private ultDealtBucket = ULT_CHARGE.dealtBurst;
  private ultTakenBucket = ULT_CHARGE.takenBurst;
  /** HP of a plain grunt this wave: the unit for "how much damage is a lot". */
  gruntHp(): number {
    const D = DIFFICULTIES[this.difficulty];
    return Math.max(1, 2 * (1 + (Math.max(1, this.stats.wave) - 1) * 0.45) * D.hp);
  }
  /** Charge from dealt damage, measured in grunts' worth, limited by the bucket. */
  chargeFromDealt(grunts: number) {
    if (this.stats.ultActive || !(grunts > 0)) return;
    const want = grunts * ULT_CHARGE.perGruntDealt * (this.lowHp() ? 2 : 1);
    const got = Math.min(want, this.ultDealtBucket);
    if (got <= 0) return;
    this.ultDealtBucket -= got;
    this.addUltCharge(got);
  }

  addUltCharge(amount: number) {
    if (this.stats.ultActive) return;
    amount *= this.perks.ultChargeMul;
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
    if (weaponSource && this.isEvolved(weaponSource)) baseDmg *= EVO_DAMAGE_MUL;
    // Warded elite — the first few hits are absorbed by its ward.
    if (e.wardHits && e.wardHits > 0) {
      e.wardHits--;
      e.hitFlash = 0.5;
      this.spawnSpark(e.pos);
      this.fx.shockwave(e.pos.x, e.pos.y, e.size + 14, { hue: AFFIXES.warded.hue, light: 70, life: 0.25, width: 4 });
      this.spawnFloatText(e.pos, e.wardHits > 0 ? `Ward ${e.wardHits}` : "Ward broken!", { color: "hsl(220 80% 75%)", size: 12 });
      audio.play("armorRing");
      return;
    }
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
    // Only WEAPON hits (swings + projectiles) are blocked — abilities,
    // ultimates and ground effects go through the shield.
    if (e.archetype === "shielded" && e.shieldHp > 0 && weaponSource) {
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
    let dmg = baseDmg * (this.omenDef?.dmgOut ?? 1);   // OMEN Glass Night
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
    if (this.stats.classId === "yukionna" && e.slowRemaining > 0) dmg *= 1.15;
    if (e.chill !== undefined && e.chill < 0 && e.stunTimer > 0) dmg *= 1.5;   // frozen by Eternal Winter
    if (this.perks.exploitMul > 0 && (e.stunTimer > 0 || e.slowRemaining > 0 || e.webbedRemaining > 0 || e.warHornSlowRemaining > 0)) {
      dmg *= 1 + this.perks.exploitMul;
    }
    if (this.perks.lastStand && this.player.hp / Math.max(1, this.player.maxHp) < 0.3) dmg *= 1.5;
    // Executioner perk
    if (this.perks.executionerThreshold > 0 && e.maxHp > 0) {
      const ratio = e.hp / e.maxHp;
      if (ratio <= this.perks.executionerThreshold) dmg *= this.perks.executionerMul;
    }
    // Crit
    let isCrit = false;
    const critChance = critFromPoints(this.perks.critChance + (this.stats.buffLuckRemaining > 0 ? 0.4 : 0) + (this.hawkEyeT > 0 ? 0.05 : 0));
    if (e.critMarkUntil !== undefined && e.critMarkUntil > this.elapsed) dmg *= 1.1;   // CRIT STEP: Heaven's Eye mark
    if (this.forceCrit || this.ultFinaleTimer > 0 || fortuneActive(this) || (critChance > 0 && Math.random() < critChance)) {
      dmg *= this.critMultiplier();
      isCrit = true;
      if (this.perks.critMark) e.critMarkUntil = this.elapsed + 3;
      if (this.perks.deathBlossom && !this.blossomGuard && this.elapsed - this.lastBlossom > 0.15) this.queueBlossom(e, dmg);
      if (this.hasDuo("duo_venom") && e.poisonRemaining > 0) dmg *= 2;   // DUO Venom Strike
      if (this.stats.classId === "kabuki" && this.kabukiHealCd <= 0 && this.player.hp < this.player.maxHp) {
        this.kabukiHealCd = 0.5;
        this.healPlayer(1);
      }
    }
    const label = this.hitLabel(weaponSource);
    // BOSS CAP (7.2): one cast of an ult / Soul Rend can only take so much off a boss.
    if (e.isBoss && BOSS_CAST_CAPS[label] !== undefined) {
      dmg = this.bossCap(e, label, dmg);
      if (dmg <= 0) return;
    }
    // 7.5: power-up ults add bonus ult damage to every weapon hit while active.
    let empower = 0;
    const ek = weaponSource ? this.empowerBase() : 0;
    if (ek > 0) {
      empower = this.ultDmgRaw(ek);
      if (e.isBoss) empower = this.bossCap(e, "Ultimate", empower);
    }
    e.hp -= dmg + empower;
    this.run.damageDealt += dmg + empower;
    this.trackDealt(label, dmg, false);
    if (empower > 0) { this.trackDealt("Ultimate", empower, false); dmg += empower; }
    // 7.6: dealing damage charges the ult (ult damage itself doesn't refill the bar).
    if (label !== "Ultimate") this.chargeFromDealt(dmg / Math.max(1, this.gruntHp()));
    if (dmg > this.run.biggestHit) this.run.biggestHit = dmg;
    if (!this.evoNested && !this.raijinZapping) this.onEvoHit(e, weaponSource, dmg, isCrit);
    // Floating damage number above the enemy.
    // 7.10: rapid ult ticks show at most one number per enemy every 0.3s and a
    // softer white flash, so packs inside a storm don't turn into a white blob.
    const ultTick = label === "Ultimate";
    if (!ultTick || this.elapsed - (e.lastUltNum ?? -9) > 0.3) {
      if (ultTick) e.lastUltNum = this.elapsed;
      const shown = fmtNum(dmg);
      this.spawnFloatText(e.pos, isCrit ? `${shown}!` : `${shown}`, {
        color: empower > 0 ? `hsl(${this.ultAuraHue()} 90% 72%)` : isCrit ? "hsl(42 100% 65%)" : "hsl(36 30% 92%)",
        size: isCrit ? 18 : 13,
      });
    }
    e.hitFlash = ultTick ? Math.max(e.hitFlash, 0.45) : 1;
    if (empower > 0 && Math.random() < 0.5) this.fx.burst(e.pos.x, e.pos.y, { count: 3, hue: this.ultAuraHue(), light: 72, speed: 200, life: 0.25 });   // 7.10: empowered hit sparks
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
    e.lastSrc = weaponSource ?? "other";
    if (this.isClass("tetsubo") && kb > 40 && !this.evoNested) {   // SIGNATURE Unstoppable clash
      this.evoNested = true;
      try {
        for (const o of this.enemies) {
          if (o === e || o.state === "dead") continue;
          if (Math.hypot(o.pos.x - e.pos.x, o.pos.y - e.pos.y) > SIG.tetsuboClashRadius + o.size) continue;
          o.stunTimer = Math.max(o.stunTimer, SIG.tetsuboStun);
          e.stunTimer = Math.max(e.stunTimer, SIG.tetsuboStun);
          this.dealDamage(o, this.perks.damage * SIG.tetsuboClashDmg, ang, 60);
          this.spawnSpark({ x: (o.pos.x + e.pos.x) / 2, y: (o.pos.y + e.pos.y) / 2 });
        }
      } finally { this.evoNested = false; }
    }
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
        if (this.perks.poisonDps <= 0) this.perks.poisonDps = 4;
      }
    }
    if (this.stats.classId === "yukionna") {
      e.slowRemaining = Math.max(e.slowRemaining, 1.5);
    }
    onHitNewClass(this, e);   // STEP 5: Sumi-e ink
    if (this.stats.classId === "kappa" && !this.kappaSplashing) {
      this.kappaHitChain++;
      if (this.kappaHitChain >= 4) {
        this.kappaHitChain = 0;
        this.kappaSplashing = true;
        const splash = dmg * 0.6 / Math.max(0.01, this.perks.classDamageMul);
        for (const o of this.enemies) {
          if (o === e || o.state === "dead" || o.hp <= 0) continue;
          const d = Math.hypot(o.pos.x - e.pos.x, o.pos.y - e.pos.y);
          if (d <= 95 + o.size) this.dealDamage(o, splash, Math.atan2(o.pos.y - e.pos.y, o.pos.x - e.pos.x), 60);
        }
        this.kappaSplashing = false;
        this.fx.shockwave(e.pos.x, e.pos.y, 95, { hue: 185, light: 70, life: 0.35, width: 6 });
        this.fx.burst(e.pos.x, e.pos.y, { count: 10, hue: 190, sat: 80, light: 80, speed: 260, life: 0.35, grav: 300 });
      }
    }
    if (this.ultThunderTimer > 0 && !this.raijinZapping && this.thunderCd <= 0) {
      this.thunderCd = 0.12;
      this.chainZap(e, this.ultDmg(7), this.hasUltPerk("ultc_raijin") ? 5 : 3);
      this.fx.bolt(e.pos.x, e.pos.y - 260, e.pos.x, e.pos.y, 205, 0.25);
    }
    if (this.stats.classId === "raijin" && !this.raijinZapping) {
      this.raijinHitChain++;
      if (this.raijinHitChain >= 6) {
        this.raijinHitChain = 0;
        this.chainZap(e, 7, 3);
      }
    }
    // ===== Phase 3 — Generic status effect chances =====
    // Fire (burn DoT), bleed (existing slot), and lightning (instant zap).
    // STEP 3: frost — chill (slow), Deep Freeze (3 hits on a chilled foe = frozen 1s).
    if ((e.chillUntil ?? 0) > this.elapsed && this.perks.deepFreeze) {
      e.chillHits = (e.chillHits ?? 0) + 1;
      if (e.chillHits >= 3 && !(e.frozenUntil && e.frozenUntil > this.elapsed)) {
        e.chillHits = 0;
        e.frozenUntil = this.elapsed + 1;
        e.stunTimer = Math.max(e.stunTimer, e.isBoss ? 0.3 : 1);
        this.fx.frost(e.pos.x, e.pos.y, 8);
        this.fx.shockwave(e.pos.x, e.pos.y, e.size + 18, { hue: 195, light: 85, life: 0.3, width: 4 });
      }
    }
    if (this.perks.frostChance > 0 && Math.random() < this.perks.frostChance) {
      e.chillUntil = this.elapsed + 2;
      e.slowRemaining = Math.max(e.slowRemaining, 2);
      this.fx.frost(e.pos.x, e.pos.y, 3);
    }
    if (this.perks.fireChance > 0 && Math.random() < this.perks.fireChance) {
      e.burnRemaining = Math.max(e.burnRemaining, 4);
      e.burnDps = Math.max(e.burnDps, 4);
    }
    if (this.perks.bleedChance > 0 && Math.random() < this.perks.bleedChance) {
      e.bleedRemaining = Math.max(e.bleedRemaining, 3);
      // Apply a small instant bleed tick so it feels punchy.
      const bleed = Math.max(1, Math.round(2 * this.perks.bleedDmgMul));
      e.hp -= bleed;
      this.trackDealt("Bleed", bleed);
      this.spawnFloatText(e.pos, `${bleed}`, { color: "hsl(0 95% 60%)", size: 11 });
    }
    if (this.perks.lightningChance > 0 && Math.random() < this.perks.lightningChance) {
      const ld = Math.max(1, Math.round(4 + this.perks.lightningDmgBonus));
      e.hp -= ld;
      this.trackDealt("Lightning perk", ld);
      e.stunTimer = Math.max(e.stunTimer, 0.25 + this.perks.lightningStunBonus);
      e.hitFlash = 1;
      this.spawnFloatText(e.pos, `⚡${ld}`, { color: "hsl(55 100% 75%)", size: 13 });
      audio.play("crossbowSnap");
    }
    this.spawnBlood(e.pos, ang);
    // Phase 1 — sparks burst (orange + white-hot) on every weapon hit.
    spawnSparkBurst(this.vfx, this.quality.state, e.pos.x, e.pos.y, ang, {
      count: 4, spread: Math.PI * 80 / 180, hue: 32, speed: 220,
    });
    this.fx.impact(e.pos.x, e.pos.y, ang, isCrit ? 45 : 30, isCrit || dmg >= 12 || e.isBoss);
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
  applyEnemyHit(e: Enemy | null, baseDamage: number, source?: string) {
    if (this.player.invuln > 0) return;
    if (this.ultMountainTimer > 0 || this.ultBloodRageTimer > 0 || this.ultShadowStepTimer > 0) return;
    // Deflect stance blocks EVERY enemy attack — dashes, explosions, slams,
    // hazards and fire included — and reflects damage when there's an attacker.
    if (this.player.deflectTimer > 0) {
      if (e && e.state !== "dead") {
        e.hp -= e.damage + this.perks.parryDamage;
        this.trackDealt("Deflect", e.damage + this.perks.parryDamage);
        this.onHaptic?.("deflect");
        e.hitFlash = 1;
        e.stunTimer = Math.max(e.stunTimer, e.isBoss ? 0.4 : 0.8);
        if (e.hp <= 0) this.killEnemy(e, "honor");
      }
      this.player.invuln = Math.max(this.player.invuln, 0.2);
      this.spawnSpark(this.player.pos);
      this.hitstop = Math.max(this.hitstop, 0.06);
      this.whiteFlashTimer = 0.08; this.whiteFlashMax = 0.08; this.whiteFlashAlpha = 0.3;
      audio.play("parry");
      this.flash("Deflected!");
      return;
    }
    // ===== Phase 2 — Block check =====
    // Block soaks damage up to what's left in the pool; any overflow goes
    // through to HP. (It used to absorb the WHOLE hit if even 0.01 block
    // remained, and regen during the i-frames refilled that sliver — so
    // block classes like Sohei were effectively invincible.)
    const incoming = Math.max(1, Math.round(this.scaleEnemyDamage(baseDamage)));
    let blockedShare = 0;
    if (this.stats.blockHpMax > 0 && this.stats.blockHp >= 1) {
      const soak = Math.min(this.stats.blockHp, incoming);
      this.stats.blockHp = Math.max(0, this.stats.blockHp - soak);
      this.blockRegenDelay = BLOCK_REGEN_DELAY;
      blockedShare = soak / incoming;
    }
    if (blockedShare >= 1) {
      this.player.invuln = Math.max(this.player.invuln, 0.25);
      this.player.hitFlash = 0.4;
      this.cameraShake = Math.max(this.cameraShake, 0.18);
      this.spawnFloatText(this.player.pos, `Block ${incoming}`, {
        color: "hsl(45 80% 75%)",
        size: 12,
      });
      audio.play("parry");
      audio.play("armorRing");
      this.chargeFromDealt(1.2);   // 7.6: a deflect counts like ~1 grunt of damage
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
    const lastStandMul = this.perks.lastStand && this.player.hp / Math.max(1, this.player.maxHp) < 0.3 ? 0.8 : 1;
    baseDamage = Math.max(1, Math.round(this.scaleEnemyDamage(baseDamage) * bannerMul * lastStandMul * this.commanderMul(e) * (1 - blockedShare)));
    if (blockedShare > 0) this.spawnFloatText(this.player.pos, "Guard broken!", { color: "hsl(45 80% 75%)", size: 12, vy: -70 });
    // Shields soak damage first: Yamabushi's Mountain Prayer, then Iron Warden.
    if (this.evoShield + this.prayerShield > 0) {
      const soak = Math.min(this.evoShield + this.prayerShield, baseDamage);
      const fromPrayer = Math.min(this.prayerShield, soak);
      this.prayerShield -= fromPrayer;
      this.evoShield -= soak - fromPrayer;
      baseDamage -= soak;
      if (baseDamage <= 0) {
        this.player.invuln = Math.max(this.player.invuln, 0.3);
        this.spawnFloatText(this.player.pos, `Shield ${soak}`, { color: "hsl(45 90% 70%)", size: 12 });
        audio.play("armorRing");
        return;
      }
    }
    this.player.hp -= baseDamage;
    this.run.damageTaken += baseDamage;
    this.lastHitBy = source ?? (e ? (e.archetype === "final" ? "final boss" : e.isBoss ? `${e.bossKind ?? "oni"} boss` : e.affixes ? `elite ${e.archetype}` : e.archetype) : "unknown");
    this.trackTaken(this.lastHitBy, baseDamage);
    this.onHaptic?.("hit");
    if (e && e.state !== "dead" && e.affixes && e.affixes.includes("vampiric") && e.hp < e.maxHp) {
      const heal = e.maxHp * ELITE.vampHeal;
      e.hp = Math.min(e.maxHp, e.hp + heal);
      this.spawnFloatText(e.pos, `+${fmtNum(heal)}`, { color: "hsl(345 80% 65%)", size: 12 });
    }
    if (this.stats.classId === "sohei" && e && e.state !== "dead") {
      const thorns = Math.max(1, Math.round(baseDamage * 0.6));
      e.hp -= thorns;
      this.trackDealt("Thorns", thorns);
      e.hitFlash = 1;
      this.spawnFloatText(e.pos, `${thorns}`, { color: "hsl(28 80% 65%)", size: 13 });
      if (e.hp <= 0) this.killEnemy(e, "honor");
    }
    // Damage taken — red float text above the player.
    this.spawnFloatText(this.player.pos, `-${Math.max(1, Math.round(baseDamage))}`, {
      color: "hsl(358 90% 65%)",
      size: 15,
    });
    if (this.stats.classId === "samurai") {
      this.stats.bushidoStacks = Math.min(5, this.stats.bushidoStacks + 1);
    }
    {   // 7.6: taking damage charges (Hades-style), with its own speed limit
      const got = Math.min(this.lowHp() ? ULT_CHARGE.takenHitLow : ULT_CHARGE.takenHit, this.ultTakenBucket);
      if (got > 0) { this.ultTakenBucket -= got; this.addUltCharge(got); }
    }
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
        // Dodge pass: orbs leave from the boss's edge and start slow, so the gaps
        // between them are wide enough to step into even when you're up close.
        pos: { x: e.pos.x + Math.cos(a) * (e.size + 4), y: e.pos.y + Math.sin(a) * (e.size + 4) },
        vel: { x: Math.cos(a) * speed, y: Math.sin(a) * speed },
        life: 2.8, maxLife: 2.8,
        damage: Math.round(e.damage * 0.7),
        size: 9,
        kind: "orb",
        trail: [],
        ramp: 0,
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
      let spd = 1;
      if (ep.ramp !== undefined) { ep.ramp = Math.min(1, ep.ramp + dt / 0.5); spd = 0.35 + 0.65 * ep.ramp * ep.ramp; }
      ep.pos.x += ep.vel.x * dt * spd;
      ep.pos.y += ep.vel.y * dt * spd;
      // Out of world bounds → kill
      if (ep.pos.x < -20 || ep.pos.y < -20 || ep.pos.x > this.worldW + 20 || ep.pos.y > this.worldH + 20) {
        ep.life = 0;
        continue;
      }
      // Player collision
      const dx = this.player.pos.x - ep.pos.x;
      const dy = this.player.pos.y - ep.pos.y;
      if (Math.hypot(dx, dy) < BASE.PLAYER_RADIUS + ep.size * 0.5) {
          if (this.isClass("tengu") && this.player.dashTimer > 0) continue;   // SIGNATURE Feather Dash
          // PHASE4 Onryō talisman — dash through it; otherwise it roots you briefly.
          if (ep.kind === "talisman") {
            if (this.player.dashTimer > 0 || this.player.invuln > 0) continue;
            if (this.player.deflectTimer > 0) { ep.life = 0; this.applyEnemyHit(null, ep.damage, "onryō talisman"); continue; }
            ep.life = 0;
            this.playerRoot = ONRYO.rootTime;
            this.applyEnemyHit(null, ep.damage, "onryō talisman");
            if (!this.seenAffixes.has("tip:root")) { this.seenAffixes.add("tip:root"); this.flash("Rooted! Dash to break free"); }
            continue;
          }
          // EVOLUTION Fortress Wall: blocking with the evolved Tate reflects shots.
          if (this.input.blockHeld && this.stats.secondaryIds[this.stats.secondaryActiveSlot] === "tate" && this.isEvolved("tate")) {
            const sp = Math.hypot(ep.vel.x, ep.vel.y) * 1.2;
            const a = Math.atan2(-ep.vel.y, -ep.vel.x);
            this.secProjectiles.push({ pos: { x: ep.pos.x, y: ep.pos.y }, vel: { x: Math.cos(a) * sp, y: Math.sin(a) * sp },
              life: 1.2, maxLife: 1.2, damage: ep.damage * 2 + this.perks.damage, hitSet: new Set(), pierce: true,
              kind: "kunai", hookEnemyId: null, trail: [] });
            this.spawnSpark(ep.pos);
            audio.play("parry");
            ep.life = 0;
            continue;
          }
          // ===== Phase B — Tessen passive 10% projectile deflect while equipped =====
          if (this.tessenEquipped() && Math.random() < 0.10) {
            this.spawnSpark(ep.pos);
            audio.play("parry");
            this.whiteFlashTimer = 0.06; this.whiteFlashMax = 0.06; this.whiteFlashAlpha = 0.22;
            ep.life = 0;
            continue;
          }
        // Deflect window — block + reflect (visual spark only; arrows just die).
        if (this.player.deflectTimer > 0) {
          this.spawnSpark(ep.pos);
          this.flash("Deflected!");
          audio.play("parry");
          this.whiteFlashTimer = 0.08; this.whiteFlashMax = 0.08; this.whiteFlashAlpha = 0.3;
          spawnRing(this.vfx, this.player.pos.x, this.player.pos.y, 0, 100, 280,
            { hue: 358, saturation: 80, lightness: 50, alpha: 0.9, lineW: 4 });
          ep.life = 0;
          continue;
        }
        // Route through the shared path so block and class shields apply.
        this.applyEnemyHit(null, ep.damage, ep.kind === "arrow" ? "archer" : "boss projectile");
        ep.life = 0;
      }
    }
    this.enemyProjectiles = this.enemyProjectiles.filter(ep => ep.life > 0);
  }

  updateHazards(dt: number) {
    if (!this.hazards.length) return;
    for (const h of this.hazards) {
      h.t += dt;
      if (h.t < h.max) continue;
      if (Math.hypot(this.player.pos.x - h.x, this.player.pos.y - h.y) <= h.r + BASE.PLAYER_RADIUS * 0.5) {
        this.applyEnemyHit(null, h.damage, h.src ?? (h.kind === "bomb" ? "bomber" : "boss hazard"));
      }
      if (h.kind === "bomb") {
        this.fx.shockwave(h.x, h.y, h.r * 1.2, { hue: 22, life: 0.4, width: 12, lines: 10 });
        this.fx.smoke(h.x, h.y, 6, h.r, 20, 20, 15);
        this.fx.flames2(h.x, h.y, 8, h.r * 0.5);
        audio.play("bombBoom");
      } else if (h.kind === "bolt") {
        this.fx.bolt(h.x + (Math.random() - 0.5) * 40, h.y - 320, h.x, h.y, 205, 0.3);
        this.fx.shockwave(h.x, h.y, h.r * 1.1, { hue: 205, light: 80, life: 0.35, width: 8 });
        audio.play("crossbowSnap");
      } else {
        this.fx.shockwave(h.x, h.y, h.r * 1.3, { hue: 40, sat: 20, light: 85, life: 0.45, width: 14, lines: 12 });
        this.fx.ground(h.x, h.y, h.r * 1.1, 30, 1.6);
        audio.play("bombBoom");
      }
      this.cameraShake = Math.max(this.cameraShake, 0.3);
    }
    this.hazards = this.hazards.filter(h => h.t < h.max);
  }

  drawHazards() {
    const ctx = this.ctx;
    for (const h of this.hazards) {
      const p = Math.min(1, h.t / h.max);
      const hue = h.kind === "bolt" ? 205 : h.kind === "bomb" ? 18 : this.dangerHue;
      ctx.save();
      if (this.a11y.colorblind) this.hatchCircle(h.x, h.y, h.r, 0.25 + p * 0.35);   // A11Y: pattern, not just colour
      ctx.fillStyle = `hsla(${hue}, 85%, 50%, ${0.1 + p * 0.12})`;
      ctx.beginPath(); ctx.arc(h.x, h.y, h.r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `hsla(${hue}, 90%, 55%, ${0.18 + p * 0.22})`;
      ctx.beginPath(); ctx.arc(h.x, h.y, h.r * p, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = `hsla(${hue}, 95%, 65%, ${0.6 + p * 0.35})`;
      ctx.lineWidth = 2 + p * 2;
      ctx.setLineDash([8, 6]);
      ctx.lineDashOffset = -h.t * 30;
      ctx.beginPath(); ctx.arc(h.x, h.y, h.r, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
      if (h.kind === "bomb" && p < 0.75) {
        // The bomb arcs from the thrower to the target.
        const k = p / 0.75;
        const bx = h.fromX + (h.x - h.fromX) * k;
        const by = h.fromY + (h.y - h.fromY) * k - Math.sin(k * Math.PI) * 90;
        ctx.fillStyle = "hsl(0, 0%, 10%)";
        ctx.beginPath(); ctx.arc(bx, by, 6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = `hsl(${30 + Math.random() * 20}, 100%, 65%)`;
        ctx.beginPath(); ctx.arc(bx + 3, by - 5, 2, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    }
  }

  /** A11Y: diagonal hatching + white outline so danger zones read without colour. */
  private hatchCircle(x: number, y: number, r: number, alpha: number) {
    const ctx = this.ctx;
    ctx.save();
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.clip();
    ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let d = -r * 2; d < r * 2; d += 12) { ctx.moveTo(x + d - r, y - r); ctx.lineTo(x + d + r, y + r); }
    ctx.stroke();
    ctx.restore();
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.85)"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }

  /** A11Y cues drawn over enemies: "!" over anyone winding up, clear elite kanji, player outline. */
  private drawA11yCues() {
    const ctx = this.ctx;
    const cb = this.a11y.colorblind > 0;
    // 7.10: while an ult is running, warnings get the "!" marker too, so big
    // effects never hide an incoming attack.
    if (!cb && this.stats.ultActive) {
      ctx.save();
      ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.font = "900 22px system-ui, sans-serif";
      for (const e of this.enemies) {
        if (e.state === "dead" || !(e.attackTelegraph > 0)) continue;
        const y = e.pos.y - e.size - 30;
        ctx.lineWidth = 4; ctx.strokeStyle = "#000"; ctx.strokeText("!", e.pos.x, y);
        ctx.fillStyle = "#fff"; ctx.fillText("!", e.pos.x, y);
      }
      ctx.restore();
    }
    if (cb) {
      ctx.save();
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      for (const e of this.enemies) {
        if (e.state === "dead") continue;
        if (e.attackTelegraph > 0) {
          const y = e.pos.y - e.size - 30;
          ctx.font = "900 22px system-ui, sans-serif";
          ctx.lineWidth = 4; ctx.strokeStyle = "#000"; ctx.strokeText("!", e.pos.x, y);
          ctx.fillStyle = "#fff"; ctx.fillText("!", e.pos.x, y);
        }
        if (e.affixes?.length && !e.isBoss) {
          const k = e.affixes.map(a => AFFIXES[a].kanji).join("");
          const y = e.pos.y + e.size + 16;
          ctx.font = '700 16px "Noto Serif JP", "Yu Mincho", serif';
          const w = ctx.measureText(k).width + 10;
          ctx.fillStyle = "rgba(0,0,0,0.8)"; ctx.fillRect(e.pos.x - w / 2, y - 10, w, 20);
          ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5; ctx.strokeRect(e.pos.x - w / 2, y - 10, w, 20);
          ctx.fillStyle = "#fff"; ctx.fillText(k, e.pos.x, y + 1);
        }
      }
      for (const f of this.firePatches) this.hatchCircle(f.x, f.y, ELITE.fireRadius * 0.85, 0.3);
      ctx.restore();
    }
    if (this.a11y.outline && this.player) {
      const p = this.player.pos, r = BASE.PLAYER_RADIUS + 9;
      ctx.save();
      ctx.lineWidth = 5; ctx.strokeStyle = "rgba(0,0,0,0.75)";
      ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.stroke();
      ctx.lineWidth = 2.5; ctx.strokeStyle = "#fff";
      ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }
  }

  /** Melee pass: visible wind-ups for the boss attacks that come from its body. */
  drawBossTelegraph(e: Enemy) {
    const ctx = this.ctx;
    const pulse = 0.5 + 0.5 * Math.sin(this.elapsed * 18);
    if (e.bossPatternTimer > 0 && e.bossPatternStep === 0 && e.bossPattern === 1) {
      // Ground slam: the danger ring fills in until the slam lands.
      const start = e.bossPhase >= 3 ? 1.25 : 1.4;
      const k = Math.max(0, Math.min(1, (start - e.bossPatternTimer) / (start - 0.65)));
      ctx.save();
      ctx.strokeStyle = `hsla(${this.dangerHue}, 90%, 60%, ${0.45 + 0.4 * pulse})`;
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 8]);
      ctx.beginPath(); ctx.arc(e.pos.x, e.pos.y, BOSS_SLAM_R, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = `hsla(${this.dangerHue}, 90%, 55%, ${0.14 + 0.14 * k})`;
      ctx.beginPath(); ctx.arc(e.pos.x, e.pos.y, BOSS_SLAM_R * k, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `hsla(${this.dangerHue}, 95%, 70%, 0.95)`;
      ctx.font = "bold 22px serif"; ctx.textAlign = "center";
      ctx.fillText("!", e.pos.x, e.pos.y - e.size - 30);
      ctx.restore();
    } else if (e.bossPatternTimer > 0 && e.bossPattern === 0) {
      // Radial volley: energy gathers on the boss before each burst.
      const steps = e.bossPhase === 1 ? 1 : e.bossPhase === 2 ? 2 : 3;
      if (e.bossPatternStep < steps) {
        const untilNext = e.bossPatternTimer - (steps - e.bossPatternStep - 1) * 0.35 - 0.35;
        const k = Math.max(0, Math.min(1, 1 - untilNext / 0.6));
        ctx.save();
        ctx.strokeStyle = `hsla(${this.dangerHue}, 90%, 65%, ${0.4 + 0.5 * k})`;
        ctx.lineWidth = 3 + 3 * k;
        ctx.beginPath(); ctx.arc(e.pos.x, e.pos.y, e.size + 70 * (1 - k) + 6, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
      }
    } else if (e.bossPatternTimer > 0 && e.bossPattern === 3 && e.bossPatternStep === 1 && e.blinkX !== undefined) {
      // Kitsune blink: foxfire marks where she'll reappear.
      const k = Math.max(0, Math.min(1, (1.3 - e.bossPatternTimer) / 0.55));
      ctx.save();
      ctx.strokeStyle = `hsla(24, 95%, 60%, ${0.5 + 0.4 * pulse})`;
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 6]);
      ctx.beginPath(); ctx.arc(e.blinkX, e.blinkY!, e.size + 30 * (1 - k) + 4, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = `hsla(24, 95%, 55%, ${0.15 + 0.2 * k})`;
      ctx.beginPath(); ctx.arc(e.blinkX, e.blinkY!, e.size * k, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    } else if (e.bossPatternTimer > 0 && e.bossPattern === 2 && (e.dashWind ?? 0) > 0) {
      // Charge: a danger lane along the locked aim (the boss's width), filling in.
      const k = 1 - (e.dashWind ?? 0) / 0.4, L = 520 * 0.22 + 30, w = e.size + BASE.PLAYER_RADIUS;
      ctx.save();
      ctx.translate(e.pos.x, e.pos.y); ctx.rotate(e.dashAng);
      ctx.fillStyle = `hsla(${this.dangerHue}, 90%, 55%, ${0.12 + 0.18 * k})`;
      ctx.fillRect(0, -w, L * k, w * 2);
      ctx.strokeStyle = `hsla(${this.dangerHue}, 95%, 62%, ${0.5 + 0.4 * pulse})`;
      ctx.lineWidth = 2; ctx.setLineDash([8, 6]);
      ctx.strokeRect(0, -w, L, w * 2);
      ctx.restore();
    } else if ((e.bossRecover ?? 0) > 0) {
      // Winded: a little "breath" puff over its head — your opening.
      ctx.save();
      ctx.fillStyle = `hsla(50, 90%, 70%, ${0.5 + 0.4 * pulse})`;
      ctx.font = "bold 13px sans-serif"; ctx.textAlign = "center";
      ctx.fillText("隙 opening", e.pos.x, e.pos.y - e.size - 30);
      ctx.restore();
    }
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
          const count = 5 + e.bossPhase * 2;   // dodge pass: 7 / 9 / 11 (was 9 / 12 / 15)
          this.fireBossVolley(e, count, Math.random() * Math.PI * 2, 240);
        }
      } else if (e.bossPattern === 1) {
        // Ground slam — small windup then a shockwave (uses existing shockwaves[]).
        if (e.bossPatternStep === 0 && e.bossPatternTimer < 0.65) {   // windup 0.75s (0.6s in the last phase)
          e.bossPatternStep = 1;
          // Dodge pass: the slam hits once, inside the circle that was drawn
          // (150 px). The old ring rolled out to 260 px, too far to walk out of.
          const dp = Math.hypot(this.player.pos.x - e.pos.x, this.player.pos.y - e.pos.y);
          if (dp <= BOSS_SLAM_R + BASE.PLAYER_RADIUS * 0.5 && this.player.invuln <= 0) this.applyEnemyHit(e, Math.round(e.damage * 0.9));
          this.fx.shockwave(e.pos.x, e.pos.y, BOSS_SLAM_R, { hue: this.dangerHue, light: 60, life: 0.45, width: 14, lines: 14 });
          this.fx.ground(e.pos.x, e.pos.y, BOSS_SLAM_R * 0.8, 20, 1.2);
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
        } else if ((e.dashWind ?? 0) > 0) {
          // Dodge pass: a visible aim line, locked where you stood, before each charge.
          e.dashWind = (e.dashWind ?? 0) - dt;
          if (e.dashWind <= 0) {
            e.dashTimer = 0.22;
            e.dashInvuln = 0.18;
            audio.play("smokeWoosh");
          }
        } else if (e.bossPatternStep < 3 && e.bossPatternTimer < 1.75 - e.bossPatternStep * 0.55) {
          e.bossPatternStep++;
          e.dashAng = angToPlayer;
          e.dashWind = 0.4;
        }
      }
      else if (e.bossPattern === 3) {
        // Kitsune blink (readable version): the landing spot is marked first,
        // she vanishes, reappears there, fires a foxfire fan, then is dazed.
        if (e.bossPatternStep === 0) {
          e.bossPatternStep = 1;
          // Lands fairly close (150 px) so a melee class can reach her afterwards.
          const a = Math.random() * Math.PI * 2;
          e.blinkX = Math.max(40, Math.min(this.worldW - 40, this.player.pos.x + Math.cos(a) * 150));
          e.blinkY = Math.max(40, Math.min(this.worldH - 40, this.player.pos.y + Math.sin(a) * 150));
          this.fx.smoke(e.pos.x, e.pos.y, 6, 60, 70, 24, 40);
        } else if (e.bossPatternStep === 1 && e.bossPatternTimer < 0.75) {
          e.bossPatternStep = 2;
          this.fx.smoke(e.pos.x, e.pos.y, 10, 60, 70, 24, 60);
          e.pos.x = e.blinkX ?? e.pos.x;
          e.pos.y = e.blinkY ?? e.pos.y;
          this.fx.smoke(e.pos.x, e.pos.y, 10, 60, 70, 24, 60);
          this.fx.shockwave(e.pos.x, e.pos.y, 90, { hue: 24, life: 0.35, width: 6 });
          audio.play("smokeWoosh");
        } else if (e.bossPatternStep === 2 && e.bossPatternTimer < 0.3) {
          e.bossPatternStep = 3;
          e.blinkX = e.blinkY = undefined;
          const n = 3 + e.bossPhase;   // dodge pass: 4 / 5 / 6 (was 5 / 7 / 9), wider gaps
          for (let i = 0; i < n; i++) {
            const a = angToPlayer + (i / (n - 1) - 0.5) * 1.0;
            this.enemyProjectiles.push({
              pos: { x: e.pos.x, y: e.pos.y }, vel: { x: Math.cos(a) * 300, y: Math.sin(a) * 300 },
              life: 2.4, maxLife: 2.4, damage: Math.round(e.damage * 0.6), size: 9, kind: "orb", trail: [], ramp: 0,
            });
          }
          audio.play("bombBoom");
        }
      } else if (e.bossPattern === 4) {
        // Summon: the witch calls wisps, the skeleton raises soldiers.
        if (e.bossPatternStep === 0) {
          e.bossPatternStep = 1;
          const tier = Math.floor((this.stats.wave - 1) / 5);
          const scale = (1 + (this.stats.wave - 1) * 0.45) * DIFFICULTIES[this.difficulty].hp;
          if (e.bossKind === "kitsune") {
            for (let i = 0; i < 5; i++) {
              const a = (i / 5) * Math.PI * 2;
              this.enemies.push(this.makeEnemy({
                x: e.pos.x + Math.cos(a) * 50, y: e.pos.y + Math.sin(a) * 50, isBoss: false, archetype: "wisp",
                hp: Math.max(0.5, 0.6 * scale), damage: Math.round(6 * (1 + (this.stats.wave - 1) * 0.1) * DIFFICULTIES[this.difficulty].dmg),
                speed: 200, size: 9, xpReward: 2, monReward: 0,
              }));
            }
          } else {
            for (let i = 0; i < 3; i++) {
              const a = (i / 3) * Math.PI * 2 + Math.random();
              this.enemies.push(this.makeEnemy({
                x: e.pos.x + Math.cos(a) * 70, y: e.pos.y + Math.sin(a) * 70, isBoss: false, archetype: "normal",
                hp: Math.max(1, Math.round(2 * scale)), damage: Math.round(12 * (1 + (this.stats.wave - 1) * 0.1) * DIFFICULTIES[this.difficulty].dmg),
                speed: 165, size: BASE.ENEMY_RADIUS, xpReward: 4 + tier, monReward: 0,
              }));
            }
          }
          this.fx.shockwave(e.pos.x, e.pos.y, 140, { hue: e.bossKind === "kitsune" ? 24 : 40, life: 0.5, width: 8, lines: 10 });
          audio.play("bossRoar");
        }
      } else if (e.bossPattern === 5) {
        // Gashadokuro: three telegraphed fist slams marching toward you.
        if (e.bossPatternStep === 0) {
          e.bossPatternStep = 1;
          for (let k = 1; k <= 3; k++) {
            this.hazards.push({
              x: e.pos.x + Math.cos(angToPlayer) * k * 110, y: e.pos.y + Math.sin(angToPlayer) * k * 110,
              r: 80, t: 0, max: 0.6 + k * 0.28, damage: Math.round(e.damage * 0.8), kind: "slam", fromX: e.pos.x, fromY: e.pos.y,
            });
          }
        }
      } else if (e.bossPattern === 6) {
        // Thunder General: lightning strikes on and around you.
        if (e.bossPatternStep === 0) {
          e.bossPatternStep = 1;
          const n = 4 + e.bossPhase;
          for (let i = 0; i < n; i++) {
            const a = Math.random() * Math.PI * 2, d = i === 0 ? 0 : 60 + Math.random() * 130;
            this.hazards.push({
              x: this.player.pos.x + Math.cos(a) * d, y: this.player.pos.y + Math.sin(a) * d,
              r: 62, t: 0, max: 0.9 + i * 0.12, damage: Math.round(e.damage * 0.7), kind: "bolt", fromX: e.pos.x, fromY: e.pos.y,
            });
          }
          audio.play("timeSlowSwell");
        }
      }
      if (e.bossPatternTimer <= 0) {
        // Melee pass: a longer gap between attacks, and the boss is winded
        // (stands still) for the first part of it, so you can get in and hit.
        e.bossPatternCd = 2.0 - e.bossPhase * 0.25;
        e.bossPatternStep = 0;
        e.dashWind = 0;
        e.bossRecover = 1.0 - (e.bossPhase - 1) * 0.15;
        if (e.bossPattern === 3) e.bossRecover += 0.6;   // dazed after a blink: your chance to hit her
        e.lastBossPattern = e.bossPattern;
      }
      return;
    }

    // Between patterns — stalk player slowly, then queue next pattern.
    e.bossPatternCd -= dt;
    if ((e.bossRecover ?? 0) > 0) {   // winded: no moving, no new attack yet
      e.bossRecover = (e.bossRecover ?? 0) - dt;
      return;
    }
    if (e.bossKind === "kitsune") {
      // The witch keeps her distance and circles.
      const side = angToPlayer + Math.PI / 2;
      const away = dist < 230 ? -1 : dist > 320 ? 1 : 0;
      // Melee pass: she backs off at half speed so a melee class can stay on her.
      e.pos.x += (Math.cos(angToPlayer) * away * 0.5 + Math.cos(side) * 0.45) * e.speed * speedMul * dt;
      e.pos.y += (Math.sin(angToPlayer) * away * 0.5 + Math.sin(side) * 0.45) * e.speed * speedMul * dt;
      e.pos.x = Math.max(40, Math.min(this.worldW - 40, e.pos.x));
      e.pos.y = Math.max(40, Math.min(this.worldH - 40, e.pos.y));
    } else if (dist > 220) {
      e.pos.x += Math.cos(angToPlayer) * e.speed * speedMul * dt;
      e.pos.y += Math.sin(angToPlayer) * e.speed * speedMul * dt;
    }
    if (e.bossPatternCd <= 0) {
      // Pick a pattern weighted by phase
      const choices: number[] = [0, 1];
      if (e.bossKind === "kitsune") {
        // Blinks are rarer and never back-to-back; she volleys and summons more.
        choices.length = 0; choices.push(0, 0, 4);
        if (e.bossPhase >= 2) choices.push(3);
        if (e.bossPhase >= 3) choices.push(0);
        if (e.lastBossPattern !== 3) choices.push(3);
      }
      else if (e.bossKind === "gasha") { choices.length = 0; choices.push(1, 5, 4); if (e.bossPhase >= 2) choices.push(5); if (e.bossPhase >= 3) choices.push(1, 5); }
      else if (e.bossKind === "raijin") { choices.length = 0; choices.push(6, 2, 0); if (e.bossPhase >= 2) choices.push(6); if (e.bossPhase >= 3) choices.push(2, 6); }
      else if (e.bossPhase >= 2) choices.push(1);
      if (!e.bossKind || e.bossKind === "oni") { if (e.bossPhase >= 3) { choices.push(2, 0); } }
      e.bossPattern = choices[Math.floor(Math.random() * choices.length)];
      e.bossPatternStep = 0;
      e.bossPatternTimer =
        e.bossPattern === 0 ? 0.6 + (e.bossPhase === 1 ? 1 : e.bossPhase === 2 ? 2 : 3) * 0.35 :
        e.bossPattern === 1 ? (e.bossPhase >= 3 ? 1.25 : 1.4) :
        e.bossPattern === 3 ? 1.3 :
        e.bossPattern === 4 ? 0.6 :
        e.bossPattern === 5 ? 1.6 :
        e.bossPattern === 6 ? 1.2 : 2.0;   // dash sweep: room for three 0.4s aim lines
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
        this.fx.flame(fb.pos.x, fb.pos.y, 9);
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
          const r = ABILITY.FIREBALL_RADIUS * this.areaMul();   // STEP 3 area
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
          this.fx.shockwave(fb.pos.x, fb.pos.y, ABILITY.FIREBALL_RADIUS * 1.2, { hue: 22, life: 0.45, width: 14, lines: 14 });
          this.fx.glow(fb.pos.x, fb.pos.y, ABILITY.FIREBALL_RADIUS, 25, 100, 60, 0.35);
          this.fx.flames2(fb.pos.x, fb.pos.y, 22, ABILITY.FIREBALL_RADIUS * 0.6);
          this.fx.ground(fb.pos.x, fb.pos.y, ABILITY.FIREBALL_RADIUS, 20, 1.2);
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
    this.abilityFx("barrage");
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
    p.swingWeaponId = this.abilityWeapon();
    this.kickAbilityWeapon();
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
    this.abilityFx("flash");
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
      this.fx.slash(e.pos.x, e.pos.y, ang + Math.PI / 2, e.size + 20, Math.PI * 0.7, 1,
        { hue: 200, sat: 70, light: 92, width: 6, life: 0.3, delay: 0.16 });
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
    this.fx.streakLine(startX, startY, endX, endY, 200, 95, 12, 0.35);
    this.fx.smoke(startX, startY, 5, 30, 35, 210, 20);
    this.fx.burst(endX, endY, { count: 12, hue: 200, light: 85, speed: 380, life: 0.3 });
  }

  // ============ Whirlwind: spin attack hitting enemies in a 360° ring ============
  castWhirlwind() {
    this.abilityFx("whirlwind");
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
    p.swingWeaponId = this.abilityWeapon();
    this.kickAbilityWeapon();
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
    this.abilityFx("timeslow");
    this.timeSlowRemaining = ABILITY.TIMESLOW_DURATION;
    const cd = ABILITY.TIMESLOW_CD;
    this.stats.abilityCd.timeslow = cd;
    this.stats.abilityMax.timeslow = cd;
    this.cameraShake = 0.2;
    audio.play("timeSlowSwell");
    this.flash("Time Slow!");
    this.fx.shockwave(this.player.pos.x, this.player.pos.y, 520, { hue: 210, life: 0.9, width: 6, light: 80, lines: 12 });
    this.fx.enso(this.player.pos.x, this.player.pos.y, 120, 210, { life: 1.1, width: 6, follow: this.player.pos });
  }

  // ============ Blade Storm: 9 rapid 360° hits, last spin launches enemies ============
  castBladeStorm() {
    this.abilityFx("bladestorm");
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
    p.swingWeaponId = this.abilityWeapon();
    this.kickAbilityWeapon();
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
    this.abilityFx("phantom_slash");
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
    this.fx.glow(sx, sy, 80, 358, 90, 60, 0.25);
    this.fx.burst(sx, sy, { count: 14, hue: 358, light: 70, speed: 520, dir: ang, spread: 0.5, life: 0.4 });
  }

  // ============ Death Mark: cursed seal on nearest enemy; chains on kill ============
  castDeathMark() {
    this.abilityFx("death_mark");
    const target = this.findNearestEnemy();
    this.stats.abilityCd.death_mark = ABILITY.DEATH_MARK_CD;
    this.stats.abilityMax.death_mark = ABILITY.DEATH_MARK_CD;
    if (!target) {
      this.flash("No target");
      return;
    }
    target.markRemaining = ABILITY.DEATH_MARK_DURATION;
    this.deathMarkId = target.id;
    this.fx.bolt(this.player.pos.x, this.player.pos.y, target.pos.x, target.pos.y, 358, 0.35);
    this.fx.enso(target.pos.x, target.pos.y, target.size + 18, 358, { life: 0.8, width: 4, light: 50, follow: target.pos });
    audio.play("deathMarkSeal");
    this.flash("Death Mark!");
  }

  // ============ Soul Rend: deal 40% of nearest enemy's current HP ============
  castSoulRend() {
    this.abilityFx("soul_rend");
    const target = this.findNearestEnemy();
    this.stats.abilityCd.soul_rend = ABILITY.SOUL_REND_CD;
    this.stats.abilityMax.soul_rend = ABILITY.SOUL_REND_CD;
    if (!target) {
      this.flash("No target");
      return;
    }
    this.castIds["Soul Rend"] = (this.castIds["Soul Rend"] ?? 0) + 1;   // BOSS CAP: new cast
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
    for (let i = 0; i < 8; i++) {
      const a = Math.random() * Math.PI * 2;
      this.fx.streaks.push({ x: target.pos.x + Math.cos(a) * 30, y: target.pos.y + Math.sin(a) * 30,
        vx: (this.player.pos.x - target.pos.x) * 2.2, vy: (this.player.pos.y - target.pos.y) * 2.2,
        hue: 280, sat: 70, light: 75, life: 0.45, max: 0.45, w: 3, drag: 1, grav: 0 });
    }
    this.fx.glow(target.pos.x, target.pos.y, 70, 280, 80, 60, 0.3);
    // Phase 2 — triple concentric shockwave from the player + edge bleed.
    this.soulRendShocks.spawn(this.player.pos.x, this.player.pos.y, 280, 0.55);
    this.edgeBleedTimer = 0.5; this.edgeBleedMax = 0.5;
  }

  // ============ Deflect: 1.0s perfect-guard window (scaled by Perfect Guard perk) ============
  castDeflect() {
    this.abilityFx("deflect");
    this.player.deflectTimer = ABILITY.DEFLECT_DURATION * this.perks.parryWindowMul;
    this.stats.abilityCd.deflect = ABILITY.DEFLECT_CD;
    this.stats.abilityMax.deflect = ABILITY.DEFLECT_CD;
    audio.play("parry");
    this.flash("Deflect stance!");
    this.fx.shockwave(this.player.pos.x, this.player.pos.y, 70, { hue: 45, life: 0.3, width: 5, light: 80 });
  }

  // ============ Smoke Bomb: cloud disorients enemies in radius ============
  castSmokeBomb() {
    this.abilityFx("smoke_bomb");
    const p = this.player;
    this.smokeClouds.push({
      pos: { x: p.pos.x, y: p.pos.y },
      radius: ABILITY.SMOKE_BOMB_RADIUS * this.areaMul(),   // STEP 3 area
      life: ABILITY.SMOKE_BOMB_LINGER,
      maxLife: ABILITY.SMOKE_BOMB_LINGER,
    });
    for (const e of this.enemies) {
      if (e.state === "dead") continue;
      const d = Math.hypot(e.pos.x - p.pos.x, e.pos.y - p.pos.y);
      if (d <= ABILITY.SMOKE_BOMB_RADIUS * this.areaMul()) {
        e.disorientRemaining = ABILITY.SMOKE_BOMB_DURATION;
        e.disorientAng = Math.random() * Math.PI * 2;
        e.alertness = 0; // lose track of player
      }
    }
    this.stats.abilityCd.smoke_bomb = ABILITY.SMOKE_BOMB_CD;
    this.stats.abilityMax.smoke_bomb = ABILITY.SMOKE_BOMB_CD;
    audio.play("smokeWoosh");
    this.flash("Smoke Bomb!");
    this.fx.smoke(p.pos.x, p.pos.y, 16, ABILITY.SMOKE_BOMB_RADIUS, 30, 220, 10);
    this.fx.shockwave(p.pos.x, p.pos.y, ABILITY.SMOKE_BOMB_RADIUS, { hue: 220, sat: 15, light: 70, life: 0.4, width: 6 });
  }

  // ============ War Horn: slow every enemy on screen ============
  castWarHorn() {
    this.abilityFx("war_horn");
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
    for (let i = 0; i < 3; i++) this.fx.shockwave(p.pos.x, p.pos.y, 380 + i * 80, { hue: 42, life: 0.7, width: 10 - i * 2, delay: i * 0.14, lines: i === 0 ? 16 : 0 });
  }

  // ============ Execution: instakill enemy <15% HP, else heavy single hit ============
  castExecution() {
    this.abilityFx("execution");
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
      this.fx.slash(victim.pos.x, victim.pos.y, Math.PI * 0.25, 46, Math.PI * 0.5, 1, { hue: 358, sat: 80, light: 75, width: 9, life: 0.45 });
      this.fx.slash(victim.pos.x, victim.pos.y, Math.PI * 0.75, 46, Math.PI * 0.5, -1, { hue: 358, sat: 80, light: 75, width: 9, life: 0.45 });
      this.fx.seal(victim.pos.x, victim.pos.y - 40, "斬", 358, 42, 0.9);
      this.fx.glow(victim.pos.x, victim.pos.y, 110, 358, 90, 55, 0.3);
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
    this.abilityFx("fireball");
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
    this.abilityFx("lightning");
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
      this.fx.bolt(origin.x, origin.y, best.pos.x, best.pos.y, 52);
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

  // Lightning that arcs outward from `source` (not hitting it) to nearby foes,
  // or from the player onto `source` when `includeSource` is set. Guarded so
  // its own hits don't re-trigger class on-hit lightning.
  chainZap(source: Enemy, dmg: number, jumps: number, includeSource = false) {
    this.raijinZapping = true;
    const hit = new Set<number>();
    let origin = includeSource
      ? { x: this.player.pos.x, y: this.player.pos.y }
      : { x: source.pos.x, y: source.pos.y };
    if (!includeSource) hit.add(source.id);
    const pickNext = (): Enemy | null => {
      let next: Enemy | null = null;
      let bestD = 240;
      for (const o of this.enemies) {
        if (o.state === "dead" || o.hp <= 0 || hit.has(o.id)) continue;
        const d = Math.hypot(o.pos.x - origin.x, o.pos.y - origin.y);
        if (d < bestD) { bestD = d; next = o; }
      }
      return next;
    };
    let target: Enemy | null = includeSource ? source : pickNext();
    for (let i = 0; i < jumps && target; i++) {
      hit.add(target.id);
      this.fx.bolt(origin.x, origin.y, target.pos.x, target.pos.y, 52);
      const ang = Math.atan2(target.pos.y - origin.y, target.pos.x - origin.x);
      origin = { x: target.pos.x, y: target.pos.y };
      if (target.state !== "dead" && target.hp > 0) {
        target.stunTimer = Math.max(target.stunTimer, 0.3);
        this.dealDamage(target, dmg, ang, 20);
      }
      target = pickNext();
    }
    audio.play("crossbowSnap");
    this.raijinZapping = false;
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
    const hidden = this.stats.state === "playing" && this.playerHidden();
    for (const e of this.enemies) {
      e.hitFlash = Math.max(0, e.hitFlash - dt * 3);
      if (e.state === "dead") {
        e.deathTimer -= dt;
        continue;
      }
      e.stunTimer = Math.max(0, e.stunTimer - dt);
      e.attackCooldown = Math.max(0, e.attackCooldown - dt * (e.affixes && e.affixes.includes("hasted") ? ELITE.hasteAttack : 1));
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
      const telegraph = 0.5 * DIFFICULTIES[this.difficulty].tele * (1 - 0.15 * this.vr("quick_death"));   // VOW Quick Death

      let speedMul = this.timeSlowRemaining > 0 ? 0.25 : 1;
      if ((e.drumUntil ?? 0) > this.elapsed) speedMul *= 1.35;   // STEP 4: Taiko drummer buff
      const tough = e.isBoss || e.archetype === "final";
      if (e.slowRemaining > 0) speedMul *= tough ? 0.8 : 0.55;
      if (e.warHornSlowRemaining > 0) speedMul *= e.warHornSlowFactor;
      if (e.webbedRemaining > 0) speedMul *= tough ? 0.7 : 0.3;
      if (this.ultBannerActive && Math.hypot(e.pos.x - this.ultBannerPos.x, e.pos.y - this.ultBannerPos.y) < 260) {
        speedMul *= tough ? 0.85 : 0.65;
      }
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

      // ===== Stealth — player is invisible / in smoke: enemies lose track. =====
      // They drop their attack, stop shooting, and wander around the spot
      // they last saw the player. Lit lanterns still go off where they are.
      if (hidden && !(e.archetype === "lantern" && (e.fuse ?? 0) > 0)) {
        if (!e.lostTrack) {
          e.lostTrack = 0.0001;
          e.searchX = p.pos.x + (Math.random() - 0.5) * 160;
          e.searchY = p.pos.y + (Math.random() - 0.5) * 160;
        }
        e.lostTrack += dt;
        e.attackTelegraph = 0;
        e.attackAnim = 0;
        if (e.state === "attacking") e.state = "alert";
        const sx = (e.searchX ?? e.pos.x) - e.pos.x;
        const sy = (e.searchY ?? e.pos.y) - e.pos.y;
        const sd = Math.hypot(sx, sy);
        if (sd < 24) {
          // Reached the search spot — pick another nearby one and look around.
          const a = Math.random() * Math.PI * 2;
          const r = 60 + Math.random() * 140;
          e.searchX = Math.max(30, Math.min(this.worldW - 30, e.pos.x + Math.cos(a) * r));
          e.searchY = Math.max(30, Math.min(this.worldH - 30, e.pos.y + Math.sin(a) * r));
        } else {
          const ang = Math.atan2(sy, sx);
          e.facing += Math.atan2(Math.sin(ang - e.facing), Math.cos(ang - e.facing)) * Math.min(1, dt * 5);
          e.pos.x += (sx / sd) * e.speed * 0.45 * speedMul * dt;
          e.pos.y += (sy / sd) * e.speed * 0.45 * speedMul * dt;
        }
        continue;
      }
      if (e.lostTrack) {
        // Spotted again — short "!" beat before they resume the hunt.
        e.lostTrack = 0;
        e.attackCooldown = Math.max(e.attackCooldown, 0.35);
        this.spawnFloatText(e.pos, "!", { color: "hsl(0 85% 65%)", size: 16 });
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

      if (e.archetype === "priest") {
        // Healer — shadow the most-wounded ally (or the nearest one), standing
        // just behind it relative to the player, so allies stay in the aura.
        const HEAL_R = 200;
        let ward: Enemy | null = null;
        let best = -Infinity;
        for (const o of this.enemies) {
          if (o === e || o.state === "dead" || o.archetype === "priest") continue;
          const od = Math.hypot(o.pos.x - e.pos.x, o.pos.y - e.pos.y);
          if (od > 700) continue;
          const score = (1 - o.hp / o.maxHp) * 600 + (o.isBoss ? 120 : 0) - od * 0.4;
          if (score > best) { best = score; ward = o; }
        }
        let tx: number, ty: number;
        if (ward) {
          const wa = Math.atan2(ward.pos.y - p.pos.y, ward.pos.x - p.pos.x);
          tx = ward.pos.x + Math.cos(wa) * 80;
          ty = ward.pos.y + Math.sin(wa) * 80;
        } else {
          // No allies — keep away from the player.
          tx = e.pos.x - Math.cos(angToPlayer) * 120;
          ty = e.pos.y - Math.sin(angToPlayer) * 120;
        }
        const px = tx - e.pos.x, py = ty - e.pos.y;
        const pd = Math.hypot(px, py);
        let mx = 0, my = 0;
        if (pd > 20) { mx = px / pd; my = py / pd; }
        if (dist < 170) {
          // Too close to the player — back off first.
          mx = mx * 0.4 - Math.cos(angToPlayer);
          my = my * 0.4 - Math.sin(angToPlayer);
        }
        const ml = Math.hypot(mx, my);
        if (ml > 0.01) {
          e.pos.x += (mx / ml) * e.speed * speedMul * dt;
          e.pos.y += (my / ml) * e.speed * speedMul * dt;
        }
        e.facing = ward && dist > 220 ? Math.atan2(ward.pos.y - e.pos.y, ward.pos.x - e.pos.x) : angToPlayer;
        e.special = (e.special ?? 2) - dt * speedMul;
        if (e.special <= 0 && e.disarmedRemaining <= 0) {
          let healed = 0;
          for (const o of this.enemies) {
            if (o === e || o.state === "dead" || o.hp >= o.maxHp) continue;
            if (Math.hypot(o.pos.x - e.pos.x, o.pos.y - e.pos.y) > HEAL_R + o.size) continue;
            o.hp = Math.min(o.maxHp, o.hp + o.maxHp * (o.isBoss ? 0.04 : 0.3));
            healed++;
            this.fx.burst(o.pos.x, o.pos.y, { count: 3, hue: 130, light: 70, speed: 120, life: 0.4, grav: -120 });
          }
          if (healed) {
            e.special = 3.5;
            this.fx.shockwave(e.pos.x, e.pos.y, HEAL_R, { hue: 130, light: 65, life: 0.6, width: 5 });
            this.spawnFloatText(e.pos, "癒", { color: "hsl(130 70% 65%)", size: 16, jp: true });
          } else {
            // Nobody hurt in range — hold the charge and check again shortly.
            e.special = 0.25;
          }
        }
        continue;
      }

      // ===== PHASE4: Onryō (controller) =====
      if (e.archetype === "onryo") {
        this.kiteFrom(e, dist, angToPlayer, ONRYO.keepAway, speedMul, dt);
        e.facing = angToPlayer;
        e.special = (e.special ?? ONRYO.castEvery) - dt * speedMul;
        if (e.special <= 0 && e.disarmedRemaining <= 0 && dist < 650) {
          e.special = ONRYO.castEvery;
          e.castCount = (e.castCount ?? 0) + 1;
          this.inkPools.push({ x: p.pos.x + (Math.random() - 0.5) * 40, y: p.pos.y + (Math.random() - 0.5) * 40, t: 0, life: ONRYO.inkTelegraph + ONRYO.inkLife });
          this.fx.burst(e.pos.x, e.pos.y, { count: 6, hue: 280, light: 30, speed: 90, life: 0.4 });
          if (e.castCount % ONRYO.talismanEvery === 0) {
            this.enemyProjectiles.push({
              pos: { x: e.pos.x + Math.cos(angToPlayer) * 18, y: e.pos.y + Math.sin(angToPlayer) * 18 },
              vel: { x: Math.cos(angToPlayer) * ONRYO.talismanSpeed, y: Math.sin(angToPlayer) * ONRYO.talismanSpeed },
              life: 3, maxLife: 3, damage: Math.max(1, Math.round(e.damage * 0.5)), size: 10, kind: "talisman", trail: [],
            });
          }
        }
        continue;
      }

      // ===== PHASE4: Nue (summoner) =====
      if (e.archetype === "nue") {
        if ((e.summonCharge ?? 0) > 0) {
          // Rooted in place while summoning (telegraphed by a glowing ring).
          e.summonCharge = (e.summonCharge ?? 0) - dt * speedMul;
          if (e.summonCharge <= 0) this.nueSummon(e);
          continue;
        }
        // Hide behind the nearest ally, away from the player.
        let ally: Enemy | null = null, ad = 420;
        for (const o of this.enemies) {
          if (o === e || o.state === "dead" || o.summonerId === e.id) continue;
          const d2 = Math.hypot(o.pos.x - e.pos.x, o.pos.y - e.pos.y);
          if (d2 < ad) { ad = d2; ally = o; }
        }
        if (ally && dist > 200) {
          const a = Math.atan2(ally.pos.y - p.pos.y, ally.pos.x - p.pos.x);
          const tx = ally.pos.x + Math.cos(a) * 90 - e.pos.x, ty = ally.pos.y + Math.sin(a) * 90 - e.pos.y, td = Math.hypot(tx, ty);
          if (td > 20) { e.pos.x += (tx / td) * e.speed * speedMul * dt; e.pos.y += (ty / td) * e.speed * speedMul * dt; }
        } else this.kiteFrom(e, dist, angToPlayer, NUE.keepAway, speedMul, dt);
        e.facing = angToPlayer;
        e.special = (e.special ?? NUE.summonEvery) - dt * speedMul;
        const mine = this.enemies.filter(o => o.state !== "dead" && o.summonerId === e.id).length;
        if (e.special <= 0 && e.disarmedRemaining <= 0 && mine < NUE.maxSummons) {
          e.special = NUE.summonEvery;
          e.summonCharge = NUE.summonCharge;
        }
        continue;
      }

      if (e.archetype === "bomber") {
        const ideal = 300;
        e.facing = angToPlayer;
        if (dist < ideal - 40) {
          e.pos.x -= Math.cos(angToPlayer) * e.speed * speedMul * dt;
          e.pos.y -= Math.sin(angToPlayer) * e.speed * speedMul * dt;
        } else if (dist > ideal + 60) {
          e.pos.x += Math.cos(angToPlayer) * e.speed * 0.8 * speedMul * dt;
          e.pos.y += Math.sin(angToPlayer) * e.speed * 0.8 * speedMul * dt;
        }
        e.special = (e.special ?? 2) - dt * speedMul;
        if (e.special <= 0 && e.disarmedRemaining <= 0) {
          if (dist < 560) {
            e.special = 2.8 + Math.random() * 0.8;
            const tx = this.player.pos.x + (Math.random() - 0.5) * 50;
            const ty = this.player.pos.y + (Math.random() - 0.5) * 50;
            this.hazards.push({ x: tx, y: ty, r: 70, t: 0, max: 1.15, damage: e.damage, kind: "bomb", fromX: e.pos.x, fromY: e.pos.y });
            audio.play("slash");
          }
        }
        continue;
      }

      if (e.archetype === "lantern") {
        if (e.fuse !== undefined && e.fuse > 0) {
          e.fuse -= dt * speedMul;
          if (e.fuse <= 0) {
            const R = 90;
            if (Math.hypot(this.player.pos.x - e.pos.x, this.player.pos.y - e.pos.y) <= R + BASE.PLAYER_RADIUS) {
              this.applyEnemyHit(e, e.damage);
            }
            this.fx.shockwave(e.pos.x, e.pos.y, R * 1.2, { hue: 25, life: 0.45, width: 14, lines: 12 });
            this.fx.glow(e.pos.x, e.pos.y, R, 30, 100, 65, 0.3);
            this.fx.flames2(e.pos.x, e.pos.y, 14, 40);
            this.cameraShake = Math.max(this.cameraShake, 0.35);
            audio.play("bombBoom");
            this.killEnemy(e, "honor");
          }
          continue;
        }
        e.facing = angToPlayer;
        if (dist < 62 && e.disarmedRemaining <= 0) {
          e.fuse = 0.8;
          audio.play("bossRoar");
        } else {
          e.pos.x += Math.cos(angToPlayer) * e.speed * speedMul * dt;
          e.pos.y += Math.sin(angToPlayer) * e.speed * speedMul * dt;
        }
        continue;
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

      if (updateNewEnemy(this, e, dt, dist, angToPlayer, speedMul)) continue;   // STEP 4
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
            if (this.player.deflectTimer > 0) {
              // Deflect — block + reflect full damage to attacker.
              // Counter Strike perk adds bonus reflect damage on top.
              const counterBonus = this.perks.parryDamage;
              e.hp -= e.damage + counterBonus;
              this.trackDealt("Deflect", e.damage + counterBonus);
              this.onHaptic?.("deflect");
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
            } else {
              // Route through the shared path so block, class shields and thorns apply.
              const hpBefore = this.player.hp;
              this.applyEnemyHit(e, e.damage);
              if (this.player.hp < hpBefore) {
                this.hitstop = 0.06;
                audio.play("playerHit");
              }
            }
          }
          e.state = "alert";
          e.attackCooldown = e.isBoss ? 0.7 : 0.95;
          e.attackAnim = 0;
        }
      }
    }

    this.separateEnemies(dt);
    this.enemies = this.enemies.filter(e => !(e.state === "dead" && e.deathTimer <= -0.5));
  }

  separateEnemies(dt: number) {
    const live = this.enemies.filter(e => e.state !== "dead");
    for (let i = 0; i < live.length; i++) {
      const a = live[i];
      for (let j = i + 1; j < live.length; j++) {
        const b = live[j];
        const dx = b.pos.x - a.pos.x;
        const dy = b.pos.y - a.pos.y;
        const min = (a.size + b.size) * 0.9;
        const d2 = dx * dx + dy * dy;
        if (d2 >= min * min || d2 === 0) continue;
        const d = Math.sqrt(d2);
        const push = Math.min((min - d) * 0.5, 240 * dt);
        const nx = dx / d, ny = dy / d;
        const wa = a.isBoss ? 0.15 : 0.5;
        const wb = b.isBoss ? 0.15 : 0.5;
        a.pos.x -= nx * push * wa * 2; a.pos.y -= ny * push * wa * 2;
        b.pos.x += nx * push * wb * 2; b.pos.y += ny * push * wb * 2;
      }
    }
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
    const onPlayer = this.player && pos === this.player.pos;
    const wid = onPlayer ? this.player.swingWeaponId : null;
    const hue = wid ? (SLASH_HUE[wid] ?? 40) : (this.stats.ultActive ? hueOf(getClass(this.stats.classId).accent) : 40);
    this.fx.slash(pos.x, pos.y, ang, range * 0.92, arc, onPlayer ? this.player.swingDir : 1, {
      hue, sat: wid || this.stats.ultActive ? 70 : 35, light: 90, follow: onPlayer ? this.player.pos : undefined,
      width: wid === "ono" || wid === "odachi" ? range * 0.2 : undefined,
    });
    for (let i = 0; i < 3; i++) {
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
      size: (opts.size ?? 14) * (this.a11y.bigNumbers ? 1.45 : 1),   // A11Y bigger numbers
      jp: opts.jp,
    });
  }

  // ============ RENDER ============
  render() {
    const ctx = this.ctx;
    const W = this.width, H = this.height;

    const shakeX = (Math.random() - 0.5) * this.cameraShake * 14 * this.shakeScale;
    const shakeY = (Math.random() - 0.5) * this.cameraShake * 14 * this.shakeScale;

    ctx.save();
    ctx.translate(shakeX, shakeY);

    const biome = this.currentBiome;
    this.arena.build(biome.id, this.worldW, this.worldH, ctx);
    ctx.fillStyle = this.arena.edgeColor();
    ctx.fillRect(-shakeX - 20, -shakeY - 20, W + 40, H + 40);

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

    const zoomPad = this.cameraZoom.zoom < 1 ? (1 / this.cameraZoom.zoom - 1) * Math.max(W, H) : 0;
    this.arena.draw(ctx, this.cameraX - zoomPad, this.cameraY - zoomPad, W + zoomPad * 2, H + zoomPad * 2, performance.now() / 1000);

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
      if (e.state === "dead" || e.stunTimer > 0 || e.archetype === "wisp" || e.archetype === "lantern") continue;
      ctx.save();
      ctx.translate(e.pos.x, e.pos.y);
      ctx.rotate(e.facing);
      const alertColor = e.state === "alert" || e.state === "attacking"
        ? "358, 78%, 48%"
        : "42, 78%, 58%";
      const visionRange = e.isBoss ? BASE.ENEMY_VISION_RANGE * 1.4 : BASE.ENEMY_VISION_RANGE;
      const coneGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, visionRange);
      coneGrad.addColorStop(0, `hsla(${alertColor}, ${this.stats.ultActive ? 0.06 : 0.25})`);   // dim during ults
      coneGrad.addColorStop(1, `hsla(${alertColor}, 0)`);
      ctx.fillStyle = coneGrad;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, visionRange, -BASE.ENEMY_VISION_ANGLE / 2, BASE.ENEMY_VISION_ANGLE / 2);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    this.fx.drawGround(ctx);
    this.drawHazards();
    for (const e of this.enemies) if (e.state === "dead") this.drawEnemy(e, true);
    for (const p of this.particles) if (p.kind === "blood") this.drawParticle(p);
    this.drawInk();
    drawNewHazards(this, ctx);   // STEP 4
    this.drawEliteGround();
    this.drawArenaShrine();
    this.drawEvo();
    for (const e of this.enemies) if (e.state !== "dead") this.drawEnemy(e, false);
    for (const e of this.enemies) if (e.state !== "dead") drawNewTelegraphs(this, ctx, e);   // STEP 4
    this.drawEliteTags();
    this.drawSignatures();
    this.drawSearchMarkers();
    if (this.devShowHitboxes) this.drawDevHitboxes();

    this.drawPickupRadius();
    drawNewClasses(this, ctx);   // STEP 5: hawks, turrets, tiger, ink, volleys
    drawUltUnder(this, ctx);   // ult visual pass 2: signature ground effects
    this.drawUltAura();
    this.drawPlayer();
    drawUltOver(this, ctx);    // ult visual pass 2: signature effects on top
    this.drawA11yCues();
    this.drawPhantomDance();
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
    this.fx.drawWorld(ctx);
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

    // Time Slow — a ghostly clock face turns slowly around the player.
    if (this.timeSlowRemaining > 0) {
      const p = this.player;
      const a = Math.min(1, this.timeSlowRemaining / 0.4);
      ctx.save();
      ctx.translate(p.pos.x, p.pos.y);
      ctx.strokeStyle = `hsla(210, 80%, 80%, ${0.45 * a})`;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, 0, 74, 0, Math.PI * 2); ctx.stroke();
      for (let i = 0; i < 12; i++) {
        const ang = (i / 12) * Math.PI * 2;
        const r0 = i % 3 === 0 ? 62 : 67;
        ctx.beginPath(); ctx.moveTo(Math.cos(ang) * r0, Math.sin(ang) * r0); ctx.lineTo(Math.cos(ang) * 74, Math.sin(ang) * 74); ctx.stroke();
      }
      const hand = this.elapsed * 0.6;
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(hand) * 56, Math.sin(hand) * 56); ctx.stroke();
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(hand * 12) * 66, Math.sin(hand * 12) * 66); ctx.stroke();
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

    // Phantom Slash — a crescent blade-wave travels the line, leaving a glowing trail.
    for (const w of this.phantomSlashes) {
      const prog = Math.min(1, (1 - w.life / w.maxLife) * 1.6);
      const ang = Math.atan2(w.ey - w.sy, w.ex - w.sx);
      const reach = Math.min(Math.hypot(w.ex - w.sx, w.ey - w.sy), 1100);
      const hx = w.sx + Math.cos(ang) * reach * prog, hy = w.sy + Math.sin(ang) * reach * prog;
      if (prog < 1) {
        ctx.save();
        ctx.translate(hx, hy);
        ctx.rotate(ang);
        ctx.globalCompositeOperation = "lighter";
        for (const [r, w2, a] of [[46, 16, 0.35], [44, 7, 0.95]] as const) {
          ctx.fillStyle = a > 0.5 ? "hsla(20, 90%, 92%, 0.95)" : `hsla(358, 90%, 60%, ${a})`;
          ctx.beginPath();
          ctx.arc(-r * 0.6, 0, r, -1.1, 1.1);
          ctx.arc(-r * 0.6 - w2, 0, r, 1.1, -1.1, true);
          ctx.closePath(); ctx.fill();
        }
        ctx.restore();
      }
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
    vg.addColorStop(1, "hsla(0, 0%, 0%, 0.22)");
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
    if (this.showPointers && !this.ultCutscene && !(this.cinematicTimer > 0)) drawPointers(this, ctx, W, H);
    if (this.showMinimap && !this.ultCutscene && !(this.cinematicTimer > 0)) drawMinimap(this, ctx, W, H);
    this.fx.drawScreen(ctx, W, H);
    if (this.ultCutscene) this.drawUltCutscene(ctx, W, H);
    drawCrestCursor(this, ctx);
  }

  /** v3.7: draw the player as an animated pixel sprite (feet at the hitbox bottom). */
  private drawPlayerSprite(): boolean {
    if (!this.useSprites || !spritesReady()) return false;
    const p = this.player, ctx = this.ctx;
    const id = classChar(this.stats.classId);
    if (this.ghostAlpha > 0 && this.ghostLook) return this.drawGhostSprite(id);
    const sp = this.sprPrev;
    const dx = p.pos.x - sp.x, dy = p.pos.y - sp.y;
    const mv = Math.hypot(dx, dy);
    sp.x = p.pos.x; sp.y = p.pos.y;
    sp.vx += (dx - sp.vx) * 0.35; sp.vy += (dy - sp.vy) * 0.35;      // smoothed per-frame motion
    const now = this.elapsed, fdt = Math.max(0, Math.min(0.1, now - sp.lastT)); sp.lastT = now;
    sp.mv += (Math.min(1, mv / 3) - sp.mv) * 0.3;
    if (p.attackAnim > sp.lastAtk + 0.25) sp.atkIdx = (sp.atkIdx + 1) % 3;   // new swing → next combo frame set
    sp.lastAtk = p.attackAnim;
    const t = this.elapsed;
    let anim: SprAnim, frame: number, loop = true;
    const ultAnim = `Ult_${ULT_STYLES[this.stats.classId].pose}` as SprAnim;
    this.sprUltPose = !!this.ultPose && hasAnim(id, ultAnim);
    // Holding anything but the katana: use the weaponless body and draw the real weapon in its hand.
    const heldNow = this.stats.secondaryIds[this.stats.secondaryActiveSlot];
    const bareW = p.attackAnim > 0 ? p.swingWeaponId : (heldNow && heldNow !== "katana" ? heldNow : null);
    const bare = !!bareW && !this.sprUltPose && hasAnim(id, "Bare_Idle");
    this.sprBare = bare;
    if (this.fireAnim > sp.lastFire + 0.3 && heldNow && THROWN.has(heldNow)) sp.throwT = 0.3;
    sp.lastFire = this.fireAnim;
    sp.throwT = Math.max(0, sp.throwT - fdt);
    if (this.sprUltPose) {   // the class's ult move, played once over the 0.9s pose
      anim = ultAnim; frame = (this.ultPose!.t / this.ultPose!.dur) * frameCount(id, ultAnim) * 1.05; loop = false;
    } else if (p.attackAnim > 0) {
      anim = id === "archer" ? "Shot" : (["Attack_1", "Attack_2", "Attack_3"] as const)[sp.atkIdx];
      frame = (1 - p.attackAnim) * frameCount(id, anim); loop = false;
    } else if (p.hitFlash > 0) { anim = "Hurt"; frame = (1 - p.hitFlash) * frameCount(id, "Hurt"); loop = false; }
    else if (this.isBlocking() || p.deflectTimer > 0) { anim = id === "commander" ? "Protect" : "Protection"; frame = t * 6; loop = false; }
    else if (p.dashTimer > 0) { anim = "Run"; frame = t * 18; }
    else if (sp.mv > 0.25) { anim = "Run"; frame = t * 12; }
    else { anim = "Idle"; frame = t * 8; }
    const R = BASE.PLAYER_RADIUS;
    const running = anim === "Run";
    const sv = Math.hypot(sp.vx, sp.vy);
    const dirA = Math.atan2(sp.vy, sp.vx);
    const accent = getClass(this.stats.classId).accent;

    // Dust puffs kicked up behind you while running (world space, under the body).
    sp.dustT -= fdt;
    if (running && sv > 0.6 && sp.dustT <= 0) {
      sp.dustT = p.dashTimer > 0 ? 0.03 : 0.08;
      const back = dirA + Math.PI;
      for (let i = 0; i < (p.dashTimer > 0 ? 2 : 1); i++) {
        sp.dust.push({ x: p.pos.x + Math.cos(back) * 5 + (Math.random() - 0.5) * 6, y: p.pos.y + R - 1 + (Math.random() - 0.5) * 3,
          vx: Math.cos(back) * (18 + Math.random() * 14), vy: Math.sin(back) * 10 - 8 - Math.random() * 8, age: 0, life: 0.38 + Math.random() * 0.15, r: 2 + Math.random() * 1.5 });
      }
      if (sp.dust.length > 40) sp.dust.splice(0, sp.dust.length - 40);
    }
    ctx.save();
    ctx.translate(-p.pos.x, -p.pos.y);
    for (const d of sp.dust) {
      d.age += fdt; d.x += d.vx * fdt; d.y += d.vy * fdt; d.vx *= 0.9; d.vy *= 0.9;
      const k = d.age / d.life;
      if (k >= 1) continue;
      const r = Math.round(d.r * (1 + k * 1.6));
      ctx.fillStyle = `rgba(226, 210, 172, ${0.7 * (1 - k)})`;
      ctx.fillRect(Math.round(d.x - r), Math.round(d.y - r), r * 2, r * 2);   // square puffs read as pixels
    }
    sp.dust = sp.dust.filter(d => d.age < d.life);
    ctx.restore();

    // Class-accent ring at your feet; while moving, a chevron on it points the way you're going.
    ctx.save();
    ctx.strokeStyle = accent; ctx.globalAlpha *= 0.75; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(0, R - 2, R + 3, (R + 3) * 0.42, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.translate(0, R - 1);
    // Face where you're going while running; face your aim when attacking,
    // guarding or standing still. Straight up/down keeps the last side.
    const aimFace = Math.cos(p.facing) < 0 ? -1 : 1;
    if (!running) sp.face = aimFace;
    else if (Math.abs(dx) > 0.4) sp.face = dx < 0 ? -1 : 1;
    // Mostly-vertical running uses real back / front views when this body has them.
    // Hysteresis: switch to front/back past ~50° from horizontal, back to side below ~39°,
    // so diagonal movement doesn't flicker between views.
    const avx = Math.abs(sp.vx), avy = Math.abs(sp.vy);
    sp.vert = running && sv > 0.4 && (sp.vert ? avy > avx * 0.8 : avy > avx * 1.2);
    let vert = false;
    if (sp.vert) {
      const va: SprAnim = sp.vy < 0 ? "RunUp" : "RunDown";
      if (hasAnim(id, va)) { anim = va; frame = now * (p.dashTimer > 0 ? 16 : 12); loop = true; vert = true; }
    } else if (anim === "Idle" && Math.sin(p.facing) < -0.75 && hasAnim(id, "IdleUp")) {
      anim = "IdleUp"; frame = 0;                       // aiming straight up: stand facing away
    } else if (anim === "Idle" && Math.sin(p.facing) > 0.75 && hasAnim(id, "IdleDown")) {
      anim = "IdleDown"; frame = 0;                     // aiming straight down: face the camera
    }
    // Lean into the run (more when heading up, a touch back when heading down)
    // and squash/stretch with each stride when moving vertically.
    if (running && sv > 0.3 && !vert) {
      const vy = Math.max(-1, Math.min(1, sp.vy / Math.max(0.001, sv)));
      ctx.rotate(sp.face * (0.07 + 0.11 * Math.max(0, -vy) - 0.06 * Math.max(0, vy)));
      const st = Math.abs(vy) * 0.06 * Math.sin(now * 22);
      ctx.scale(1 - st * 0.7, 1 + st);
    }
    const view = anim === "RunUp" || anim === "IdleUp" ? "back" : anim === "RunDown" || anim === "IdleDown" ? "front" : "side";
    if (bare) {
      if (p.attackAnim > 0 && p.swingWeaponId) {
        anim = THRUSTS.has(p.swingWeaponId) ? "Bare_Thrust" : "Bare_Swing";
        frame = (1 - p.attackAnim) * frameCount(id, anim); loop = false;
      } else if (sp.throwT > 0 && hasAnim(id, "Bare_Throw")) {
        anim = "Bare_Throw"; frame = (1 - sp.throwT / 0.3) * frameCount(id, anim); loop = false;
      } else if (anim === "Run" || anim === "RunUp" || anim === "RunDown" || anim === "IdleUp" || anim === "IdleDown") {
        if (hasAnim(id, `Bare_${anim}`)) anim = `Bare_${anim}`;   // else keep the armed view (the back view hides the hands)
      } else { anim = "Bare_Idle"; frame = t * 8; loop = true; }
    }
    // Nine Tails: the pixel tails catch foxfire — a pulsing orange-gold glow and a burning outline.
    const fox = this.kitsuneTailsT > 0 ? this.kitsuneTailsT / 1.6 : 0;
    if (fox > 0) {
      const gl = ctx.createRadialGradient(0, -R * 1.6, 0, 0, -R * 1.6, R * 4.2);
      const pulse = 0.75 + 0.25 * Math.sin(now * 14);
      gl.addColorStop(0, `hsla(38, 100%, 70%, ${0.55 * fox * pulse})`);
      gl.addColorStop(0.5, `hsla(22, 100%, 55%, ${0.3 * fox * pulse})`);
      gl.addColorStop(1, "hsla(15, 100%, 50%, 0)");
      ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.fillStyle = gl;
      ctx.beginPath(); ctx.arc(0, -R * 1.6, R * 4.2, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
    drawChar(ctx, id, anim, { frame, loop, flip: sp.face < 0, height: R * 4.4, flash: p.hitFlash > 0 ? 0.6 : 0, variant: "base",
      outline: fox > 0 ? { color: `hsl(${30 + 12 * Math.sin(now * 9)}, 100%, 60%)`, alpha: Math.min(1, fox * 1.6), width: 1.6 + Math.sin(now * 16) } : undefined,
      dye: this.look ? lookDye(this.look) : undefined, layers: this.look ? spriteLayers(this.look, now, sp.mv, view) : undefined });
    ctx.restore();
    // Direction chevron just outside the ring, drawn on top so it never hides behind the body.
    // (Running away from the camera, the back view already says where you're going.)
    if (running && sv > 0.4 && !(vert && sp.vy < 0)) {
      const rr = R + 11;
      const ex = Math.cos(dirA) * rr, ey = R - 2 + Math.sin(dirA) * rr * 0.55;
      const pa = Math.atan2(Math.sin(dirA) * 0.55, Math.cos(dirA));
      ctx.save();
      ctx.translate(ex, ey); ctx.rotate(pa);
      ctx.beginPath(); ctx.moveTo(7, 0); ctx.lineTo(-3, -6); ctx.lineTo(-1, 0); ctx.lineTo(-3, 6); ctx.closePath();
      ctx.lineWidth = 3; ctx.lineJoin = "round"; ctx.strokeStyle = "#140c0a"; ctx.stroke();
      ctx.fillStyle = accent; ctx.fill();
      ctx.restore();
    }
    return true;
  }

  /** The weaponless pixel body's hand-held weapon: held at rest, swung from the shoulder,
   *  aimed from the shoulder (bows, crossbow, blowgun), or wound up and thrown (kunai, shuriken…).
   *  Called with the canvas at the player's centre, unrotated. */
  private drawBareWeapon(swinging: SecondaryId | null, swingAng: number, range: number) {
    const ctx = this.ctx, p = this.player, sp = this.sprPrev, R = BASE.PLAYER_RADIUS;
    const face = sp.face < 0 ? -1 : 1;
    const held = swinging ?? this.stats.secondaryIds[this.stats.secondaryActiveSlot];
    if (!held || held === "katana") return;
    const len = BARE_LEN[held] ?? 34;
    ctx.save();
    if (swinging) {
      // Swung from the shoulder along the real hit arc.
      ctx.translate(face * R * 0.15, -R * 1.25);
      ctx.rotate(p.facing + swingAng);
      if (THRUSTS.has(swinging)) {
        const ph = 1 - p.attackAnim, ext = ph < 0.3 ? ph / 0.3 : 1 - (ph - 0.3) / 0.7;
        if (swinging === "twin_sai") { this.drawWeaponArt("twin_sai", len, ext * 18 - 2); }
        else this.drawWeaponArt(swinging, len, -len * 0.38 + ext * 20);   // gripped mid-shaft, driven forward
      } else {
        const swingLen = held === "odachi" ? Math.max(len, Math.min(110, range * 0.8)) : held === "ono" ? 54 : len + 6;
        if (this.barrageActive) for (const off of [-0.35, -0.7]) {
          ctx.save(); ctx.globalAlpha *= off === -0.35 ? 0.4 : 0.2; ctx.rotate(off * p.swingDir);
          this.drawWeaponArt(swinging, swingLen, R * 0.2); ctx.restore();
        }
        this.drawWeaponArt(swinging, swingLen, R * 0.2);
      }
    } else if (AIMED.has(held)) {
      // Raised to the shoulder and pointed where you aim; kicks back when it fires.
      ctx.translate(face * R * 0.3, -R * 1.15);
      ctx.rotate(p.facing);
      if (held === "yumi") {   // a bow stands across the shot, limbs curving back toward you
        ctx.translate(R * 0.55 - this.fireAnim * 4, 0); ctx.rotate(Math.PI / 2);
        this.drawWeaponArt(held, len, -len / 2);
      } else {
        if (Math.cos(p.facing) < 0) ctx.scale(1, -1);   // keep the art upright when aiming left
        this.drawWeaponArt(held, len, -len * 0.25 - this.fireAnim * 6);
      }
    } else if (THROWN.has(held)) {
      if (sp.throwT > 0) {
        // Wind up behind the head, whip forward; the item leaves the hand at release.
        const pr = 1 - sp.throwT / 0.3;
        if (pr < 0.5) {
          const k = pr / 0.5;
          ctx.translate(face * R * (-0.55 + 1.3 * k), -R * (2.3 - 0.9 * k));
          ctx.scale(face, 1); ctx.rotate(-1.9 + 1.9 * k);
          this.drawWeaponArt(held, len, -len * 0.3);
        }
      } else {
        ctx.translate(face * R * 0.55, -R * 1.2);
        ctx.scale(face, 1); ctx.rotate(held === "kusarigama" ? -1.2 : -0.5);
        this.drawWeaponArt(held, len, -len * 0.3);
      }
    } else {
      // Melee weapon held at rest in the leading hand, tip up and forward.
      ctx.translate(face * R * (held === "flame_spear" ? 0.8 : 0.55), -R * 1.25);
      ctx.scale(face, 1);
      if (held === "tate") { ctx.rotate(0); this.drawWeaponArt(held, len, -len * 0.45); }
      else { ctx.rotate(held === "flame_spear" ? -1.25 : held === "odachi" ? -1.05 : -0.95); this.drawWeaponArt(held, len, -len * (held === "flame_spear" ? 0.4 : 0.12)); }
    }
    ctx.restore();
  }

  /** Pixel-art weapon along the current swing / aim axis (the evolved art once evolved). */
  private drawWeaponArt(id: SecondaryId, length: number, x = 4): boolean {
    if (!this.useSprites || !spritesReady()) return false;
    return drawItem(this.ctx, `${id}${this.isEvolved(id) ? "_evo" : ""}`, x, length) || drawItem(this.ctx, id, x, length);
  }

  /** A copy of your character (phantom / clone / decoy): same body, its own tint and outline,
   *  no ring, dust or arrow, and it never touches your own movement tracking. */
  private drawGhostSprite(id: CharId): boolean {
    const p = this.player, ctx = this.ctx, gl = this.ghostLook!;
    const R = BASE.PLAYER_RADIUS, t = this.elapsed;
    let anim: SprAnim, frame: number, loop = true;
    if (p.attackAnim > 0) {
      anim = id === "archer" ? "Shot" : (["Attack_1", "Attack_2", "Attack_3"] as const)[Math.abs(p.swingDir) % 3];
      frame = (1 - p.attackAnim) * frameCount(id, anim); loop = false;
    } else if (gl.moving) { anim = "Run"; frame = t * 12; }
    else { anim = "Idle"; frame = t * 8; }
    ctx.save();
    ctx.translate(0, R - 1);
    drawChar(ctx, id, anim, { frame, loop, flip: Math.cos(p.facing) < 0, height: R * 4.4, variant: gl.variant ?? "base",
      outline: gl.outline ? { color: gl.outline, alpha: 0.9 } : undefined });
    ctx.restore();
    return true;
  }

  drawPlayer() {
    const p = this.player;
    const ctx = this.ctx;
    ctx.save();
    // Shinobi Shadow Step — go ghostly + shimmer trail.
    if (this.ghostAlpha > 0) ctx.globalAlpha = this.ghostAlpha;                       // Phantom Dance afterimage
    else if (this.ultPhantomTimer > 0 && this.ultPhantomImages.length) ctx.globalAlpha = 0.12;   // body has split away
    else if (this.ultShadowStepTimer > 0) ctx.globalAlpha = 0.25;
    else if (this.vanishTimer > 0) ctx.globalAlpha = 0.35;   // SIGNATURE Shinobi Vanish
    ctx.translate(p.pos.x, p.pos.y);

    ctx.fillStyle = "hsla(0, 0%, 0%, 0.5)";
    ctx.beginPath();
    ctx.ellipse(0, BASE.PLAYER_RADIUS - 2, BASE.PLAYER_RADIUS, BASE.PLAYER_RADIUS * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();

    const spriteBody = this.drawPlayerSprite();
    this.spriteBodyDrawn = spriteBody;

    ctx.rotate(p.facing);

    // WARDROBE: sash / cape / headband tails stream behind you (faster when moving).
    if (this.look && !spriteBody) {
      const mv = Math.hypot(p.pos.x - this.lookPrev.x, p.pos.y - this.lookPrev.y);
      this.lookPrev.sway += (Math.min(1, mv / 5) - this.lookPrev.sway) * 0.15;
      this.lookPrev.x = p.pos.x; this.lookPrev.y = p.pos.y;
      drawBack(ctx, this.look, BASE.PLAYER_RADIUS, this.elapsed, this.lookPrev.sway);
    }

    // ===== Weapon model + swing animation =====
    // Pick the active weapon (katana when swingWeaponId is null OR when not
    // mid-melee-secondary-swing). Each melee secondary gets its own per-weapon
    // arc/range, model, and color; all of them honor swingDir so successive
    // swings alternate left→right→left→right.
    const heldRaw = this.stats.secondaryIds[this.stats.secondaryActiveSlot];
    const held = heldRaw && heldRaw !== "katana" ? heldRaw : null;
    const swingingNow = p.attackAnim > 0;
    const weaponId = swingingNow ? p.swingWeaponId : (held && isMeleeSecondary(held) ? held : null);
    const rangedHeld = !swingingNow && held && !isMeleeSecondary(held) ? held : null;
    let weaponRange: number;
    let weaponArc: number;
    if (weaponId === "tessen") { weaponRange = 90; weaponArc = Math.PI * 0.95; }
    else if (weaponId === "jutte") { weaponRange = 78; weaponArc = Math.PI * 0.55; }
    else if (weaponId === "ono") { weaponRange = 110; weaponArc = Math.PI * 0.55; }
    else if (weaponId === "twin_sai") { weaponRange = 88; weaponArc = Math.PI * 0.55; }
    else if (weaponId === "odachi") { weaponRange = 150; weaponArc = Math.PI * 1.5; }
    else if (weaponId === "tate") { weaponRange = 75; weaponArc = Math.PI * 0.5; }
    else if (weaponId === "flame_spear") { weaponRange = 125; weaponArc = Math.PI * 0.2; }
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
    const spinning = this.whirlwindActive || this.bladeStormActive;
    const spinWeapon = spinning ? (this.abilityWeapon() ?? null) : null;
    const pose = this.abilityPose && !swingingNow && !spinning ? this.abilityPose : null;
    if (spinning) {
      // Whirlwind / Blade Storm: the weapon whirls in a continuous circle.
      const spin = this.elapsed * (this.bladeStormActive ? 30 : 22);
      const ring = (weaponRange + 6);
      ctx.save();
      ctx.strokeStyle = this.bladeStormActive ? "hsla(358, 90%, 60%, 0.35)" : "hsla(330, 80%, 75%, 0.3)";
      ctx.lineWidth = 10;
      ctx.beginPath(); ctx.arc(0, 0, ring * 0.8, spin, spin + 2.4); ctx.stroke();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "hsla(40, 60%, 95%, 0.55)";
      ctx.beginPath(); ctx.arc(0, 0, ring * 0.92, spin + 1.2, spin + 2.4); ctx.stroke();
      ctx.restore();
      ctx.rotate(spin);
      if (spinWeapon === "twin_sai") { this.drawSai(1); ctx.rotate(Math.PI); this.drawSai(1); }
      else if (spinWeapon === "flame_spear") this.drawSpear(18);
      else this.drawPlayerWeapon(spinWeapon, true, weaponRange * 0.85);
    } else if (spriteBody && this.sprBare && !pose && !(this.ultPose && !swingingNow) && !(this.player.deflectTimer > 0 && !swingingNow)) {
      ctx.rotate(-p.facing);
      this.drawBareWeapon(swingingNow ? weaponId : null, swingAng, weaponRange);
    } else if (this.ultPose && !swingingNow && spriteBody && this.sprUltPose) {
      // The sprite is playing its own ult move — nothing to draw on top.
    } else if (this.ultPose && !swingingNow) {
      // Hold the class's ultimate pose (post-strike frame) for a moment.
      const style = ULT_STYLES[this.stats.classId];
      const f = poseFrame(style.pose, STRIKE + 0.12 + 0.4 * (this.ultPose.t / this.ultPose.dur));
      const m = this.abilityWeapon();
      ctx.rotate(f.ang);
      if (style.pose === "aim" && rangedHeld) this.drawRangedWeapon(rangedHeld);
      else if (m === "twin_sai") this.drawSai(1);
      else if (m === "flame_spear") this.drawSpear(14);
      else this.drawPlayerWeapon(m, true, weaponRange);
      if (f.glow > 0) {
        const hue = hueOf(getClass(this.stats.classId).accent);
        const g = ctx.createRadialGradient(12, 8, 0, 12, 8, 18);
        g.addColorStop(0, `hsla(${hue}, 100%, 85%, ${0.9 * f.glow})`);
        g.addColorStop(1, `hsla(${hue}, 100%, 55%, 0)`);
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(12, 8, 18, 0, Math.PI * 2); ctx.fill();
      }
    } else if (pose) {
      this.drawAbilityPose(pose, weaponId ?? (held && isMeleeSecondary(held) ? held : null), weaponRange);
    } else if (this.player.deflectTimer > 0 && !swingingNow) {
      // Deflect: blade held crosswise in front, catching light.
      ctx.translate(12, 0);
      ctx.rotate(-Math.PI / 2 + Math.sin(this.elapsed * 20) * 0.05);
      ctx.translate(-14, 0);
      if (weaponId === "twin_sai") this.drawSai(0); else if (weaponId === "flame_spear") this.drawSpear(0);
      else this.drawPlayerWeapon(rangedHeld ? null : weaponId, false, weaponRange);
    } else if (rangedHeld) {
      // Pixel-art bodies hold the real item, pointed where you aim, with a little kick when it fires.
      if (!(spriteBody && this.drawWeaponArt(rangedHeld, rangedHeld === "yumi" ? 44 : 34, 8 - this.fireAnim * 6))) this.drawRangedWeapon(rangedHeld);
    } else if (weaponId === "twin_sai") {
      if (spriteBody && swingingNow && this.drawWeaponArt("twin_sai", 34)) { /* pixel-art sai */ }
      else if (!spriteBody || swingingNow) this.drawTwinSai();
    } else if (weaponId === "flame_spear") {
      const ph = 1 - p.attackAnim;
      const ext = p.attackAnim > 0 ? (ph < 0.25 ? ph / 0.25 : 1 - (ph - 0.25) / 0.75) : 0;
      ctx.rotate(p.attackAnim > 0 ? 0 : 0.18 * swingDir);
      if (spriteBody && swingingNow && this.drawWeaponArt("flame_spear", 60, ext * 46 - 6)) { /* pixel-art spear thrust */ }
      else if (!spriteBody || swingingNow) this.drawSpear(ext * 46);
    } else {
      if (this.barrageActive && swingingNow) {
        for (const off of [-0.35, -0.7]) {
          ctx.save();
          ctx.globalAlpha = off === -0.35 ? 0.4 : 0.2;
          ctx.rotate(swingAng + off * swingDir);
          this.drawPlayerWeapon(weaponId, true, weaponRange);
          ctx.restore();
        }
      }
      ctx.rotate(swingAng);
      // Sprite bodies already hold a blade: only show the weapon model mid-swing (so the arc
      // still reads), never at rest — at rest it spun with the cursor across the body.
      if (spriteBody && weaponId && swingingNow && this.drawWeaponArt(weaponId, Math.max(34, Math.min(weaponId === "odachi" ? 110 : 60, weaponRange * 0.85)))) { /* pixel-art weapon */ }
      else if (!spriteBody || (weaponId && swingingNow)) this.drawPlayerWeapon(weaponId, p.attackAnim > 0, weaponRange);
    }
    ctx.restore();

    // Phase 1 — sample the swung weapon's tip into the ink-brush trail.
    if (p.attackAnim > 0 && weaponId !== "twin_sai" && weaponId !== "flame_spear") {
      const tipLen = weaponRange * 0.95;
      const total = p.facing + swingAng;
      const tipX = p.pos.x + Math.cos(total) * tipLen;
      const tipY = p.pos.y + Math.sin(total) * tipLen;
      this.katanaTrail.push(tipX, tipY);
    }

    if (spriteBody) { ctx.restore(); return; }
    if (this.look) {   // WARDROBE: outfit + headgear
      drawBody(ctx, this.look, BASE.PLAYER_RADIUS, p.hitFlash > 0 ? "hit" : p.invuln > 0 ? "invuln" : null);
      ctx.restore();
      return;
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
    const tip = swinging ? range * 0.95 : Math.max(id === null ? 36 : 28, Math.min(64, range * 0.45));

    if (id === null) {
      // ===== Katana — curved single-edge blade, tsuba, wrapped tsuka =====
      const bladeStart = r0 + 3;
      const curve = -Math.max(2, (tip - bladeStart) * 0.06);
      ctx.lineCap = "round";
      const kit = this.look?.blade;   // WARDROBE: sword kit colors
      ctx.fillStyle = kit?.bladeCol ?? "hsl(210, 12%, 82%)";
      ctx.beginPath();
      ctx.moveTo(bladeStart, -1.6);
      ctx.quadraticCurveTo((bladeStart + tip) / 2, -1.6 + curve, tip, curve * 0.9);
      ctx.lineTo(tip - 6, curve * 0.3 + 1.6);
      ctx.quadraticCurveTo((bladeStart + tip) / 2, 1.8 + curve * 0.6, bladeStart, 1.8);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = kit?.edgeCol ?? "hsla(200, 60%, 96%, 0.9)";
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(bladeStart + 2, 1.2);
      ctx.quadraticCurveTo((bladeStart + tip) / 2, 1.2 + curve * 0.6, tip - 5, curve * 0.3 + 1);
      ctx.stroke();
      ctx.fillStyle = kit?.guardCol ?? "hsl(42, 65%, 45%)";
      ctx.beginPath();
      ctx.ellipse(r0 + 1, 0, 1.8, 4.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = kit?.wrapCol ?? "hsl(0, 60%, 28%)";
      ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(-3, 0); ctx.lineTo(r0, 0); ctx.stroke();
      ctx.strokeStyle = "hsl(36, 40%, 80%)";
      ctx.lineWidth = 0.8;
      for (let x = -2; x < r0 - 1; x += 3) {
        ctx.beginPath(); ctx.moveTo(x, -2); ctx.lineTo(x + 1.5, 2); ctx.stroke();
      }
      return;
    }

    if (id === "tate") {
      // ===== Tate — wooden war shield with iron rim and clan crest =====
      const raised = this.isBlocking();
      const x = swinging ? Math.min(tip, 40) : raised ? 20 : 14;
      const h = raised ? 40 : 32;
      ctx.fillStyle = "hsl(25, 35%, 28%)";
      ctx.strokeStyle = "hsl(210, 10%, 55%)";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(x - 4, -h / 2, 9, h, 3);
      ctx.fill(); ctx.stroke();
      ctx.strokeStyle = "hsl(25, 30%, 18%)";
      ctx.lineWidth = 1;
      for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(x - 3, i * h / 4); ctx.lineTo(x + 4, i * h / 4); ctx.stroke(); }
      ctx.fillStyle = "hsl(358, 70%, 45%)";
      ctx.beginPath(); ctx.arc(x + 0.5, 0, 3.2, 0, Math.PI * 2); ctx.fill();
      if (raised) {
        ctx.strokeStyle = "hsla(45, 90%, 65%, 0.6)";
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(0, 0, x + 10, -0.8, 0.8); ctx.stroke();
      }
      return;
    }

    if (id === "tessen") {
      // ===== Tessen — iron-ribbed folding war fan. Opens wide as it sweeps,
      // snaps shut at the end; idle it's held folded like a baton.
      const prog = swinging ? 1 - this.player.attackAnim : 0;
      const open = swinging ? (prog < 0.22 ? prog / 0.22 : prog > 0.85 ? Math.max(0.25, 1 - (prog - 0.85) / 0.15) : 1) : 0;
      const span = 0.16 + open * 2.3;
      const L = swinging ? 46 : 34;
      const inner = L * 0.36;
      const px = 3;
      ctx.save();
      ctx.translate(px, 0);
      if (swinging) ctx.rotate(-span / 2 * this.player.swingDir * 0.35);
      const ribs = 11;
      // Paper / silk leaf with alternating fold shading
      for (let i = 0; i < ribs - 1; i++) {
        const a0 = -span / 2 + (i / (ribs - 1)) * span;
        const a1 = -span / 2 + ((i + 1) / (ribs - 1)) * span;
        ctx.beginPath();
        ctx.arc(0, 0, L, a0, a1);
        ctx.arc(0, 0, inner, a1, a0, true);
        ctx.closePath();
        ctx.fillStyle = i % 2 === 0 ? "hsl(356, 72%, 42%)" : "hsl(356, 68%, 34%)";
        ctx.fill();
      }
      if (open > 0.35) {
        // Gold rising-sun crest + inner gold band
        ctx.globalAlpha = Math.min(1, (open - 0.35) / 0.4);
        ctx.fillStyle = "hsl(44, 90%, 58%)";
        ctx.beginPath();
        ctx.arc(Math.cos(0) * L * 0.68, 0, L * 0.13, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "hsl(44, 85%, 55%)";
        ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(0, 0, L * 0.9, -span / 2 + 0.05, span / 2 - 0.05); ctx.stroke();
        ctx.globalAlpha = 1;
      }
      // Lacquered ribs
      ctx.strokeStyle = "hsl(0, 0%, 8%)";
      ctx.lineWidth = 1;
      for (let i = 1; i < ribs - 1; i++) {
        const a = -span / 2 + (i / (ribs - 1)) * span;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * L, Math.sin(a) * L); ctx.stroke();
      }
      // Heavy iron guard ribs on the outside (what makes it a weapon)
      ctx.strokeStyle = "hsl(210, 8%, 58%)";
      ctx.lineWidth = 2.6;
      ctx.lineCap = "round";
      for (const a of [-span / 2, span / 2]) {
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * (L + 2), Math.sin(a) * (L + 2)); ctx.stroke();
      }
      // Gold edge rim
      ctx.strokeStyle = "hsl(44, 80%, 52%)";
      ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.arc(0, 0, L, -span / 2, span / 2); ctx.stroke();
      // Pivot rivet + tassel
      ctx.fillStyle = "hsl(44, 90%, 60%)";
      ctx.beginPath(); ctx.arc(0, 0, 2.4, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "hsl(356, 70%, 45%)";
      ctx.lineWidth = 1.5;
      const sway = Math.sin(this.elapsed * 6) * 2;
      ctx.beginPath(); ctx.moveTo(-1, 0); ctx.quadraticCurveTo(-6, 4 + sway, -9, 9 + sway); ctx.stroke();
      ctx.restore();
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

    if (id === "odachi") {
      // ===== Odachi (Greatsword) — long, broad curved blade =====
      const bs = r0 + 4;
      const curve = -Math.max(3, (tip - bs) * 0.07);
      ctx.lineCap = "round";
      ctx.fillStyle = "hsl(250, 10%, 80%)";
      ctx.beginPath();
      ctx.moveTo(bs, -2.6);
      ctx.quadraticCurveTo((bs + tip) / 2, -2.6 + curve, tip, curve * 0.9);
      ctx.lineTo(tip - 9, curve * 0.3 + 2.6);
      ctx.quadraticCurveTo((bs + tip) / 2, 2.8 + curve * 0.6, bs, 2.8);
      ctx.closePath();
      ctx.fill();
      // Hamon (temper line) highlight
      ctx.strokeStyle = "hsla(265, 70%, 85%, 0.8)";
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(bs + 3, 1.8);
      ctx.quadraticCurveTo((bs + tip) / 2, 1.8 + curve * 0.6, tip - 8, curve * 0.3 + 1.6);
      ctx.stroke();
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

  // Twin Sai: one held in each hand. Each attack press stabs with the next
  // sai in turn (saiAnim[side] runs 1 → 0); the other stays guarded.
  private drawTwinSai() {
    const ctx = this.ctx;
    for (const side of [0, 1] as const) {
      const a = this.saiAnim[side];
      const ph = 1 - a;
      const ext = a > 0 ? (ph < 0.3 ? ph / 0.3 : 1 - (ph - 0.3) / 0.7) : 0;
      const y = side === 0 ? -9 : 9;
      const guard = side === 0 ? -0.35 : 0.35;
      ctx.save();
      ctx.translate(4 + ext * 26, y * (1 - ext * 0.55));
      ctx.rotate(guard * (1 - ext));
      this.drawSai(ext);
      ctx.restore();
    }
  }

  private drawSai(ext: number) {
    const ctx = this.ctx;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    // Handle wrap + pommel
    ctx.strokeStyle = "hsl(165, 35%, 22%)";
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(-6, 0); ctx.lineTo(4, 0); ctx.stroke();
    ctx.strokeStyle = "hsl(45, 60%, 70%)";
    ctx.lineWidth = 0.8;
    for (let x = -5; x < 4; x += 2.5) { ctx.beginPath(); ctx.moveTo(x, -2); ctx.lineTo(x + 1.2, 2); ctx.stroke(); }
    ctx.fillStyle = "hsl(210, 10%, 55%)";
    ctx.beginPath(); ctx.arc(-7, 0, 2.4, 0, Math.PI * 2); ctx.fill();
    // Side prongs (yoku): flare out from the guard, then hook forward to points
    ctx.strokeStyle = "hsl(210, 10%, 66%)";
    ctx.lineWidth = 2;
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(4, 0);
      ctx.quadraticCurveTo(6, s * 8, 14, s * 7.5);
      ctx.stroke();
    }
    // Central prong (monouchi): tapered octagonal shaft to a point
    ctx.fillStyle = "hsl(210, 12%, 74%)";
    ctx.beginPath();
    ctx.moveTo(4, -1.8); ctx.lineTo(30, -1.1); ctx.lineTo(35, 0); ctx.lineTo(30, 1.1); ctx.lineTo(4, 1.8);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "hsla(190, 70%, 95%, 0.9)";
    ctx.lineWidth = 0.7;
    ctx.beginPath(); ctx.moveTo(6, -0.5); ctx.lineTo(31, -0.3); ctx.stroke();
    if (ext > 0.5) {
      ctx.strokeStyle = `hsla(165, 90%, 80%, ${(ext - 0.5) * 1.4})`;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(-4, 0); ctx.stroke();
    }
  }

  // Hokiyari: long shaft, red tassel collar, steel head wreathed in flame.
  private drawSpear(thrust: number) {
    const ctx = this.ctx;
    const t = this.elapsed;
    ctx.save();
    ctx.lineCap = "round";
    ctx.translate(thrust - 6, 0);
    ctx.strokeStyle = "hsl(20, 40%, 26%)";
    ctx.lineWidth = 3.5;
    ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(44, 0); ctx.stroke();
    ctx.strokeStyle = "hsl(42, 50%, 55%)";
    ctx.lineWidth = 4.2;
    ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(-7, 0); ctx.stroke();
    ctx.strokeStyle = "hsl(358, 65%, 40%)";
    ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(40, 0); ctx.lineTo(44, 0); ctx.stroke();
    ctx.fillStyle = "hsl(20, 25%, 72%)";
    ctx.beginPath(); ctx.moveTo(62, 0); ctx.lineTo(46, -4.5); ctx.lineTo(44, 0); ctx.lineTo(46, 4.5); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "hsla(40, 80%, 92%, 0.9)";
    ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(46, 0); ctx.lineTo(60, 0); ctx.stroke();
    const fl = 4 + Math.sin(t * 22) * 1.5 + thrust * 0.05;
    ctx.fillStyle = "hsla(25, 100%, 55%, 0.75)";
    ctx.beginPath(); ctx.ellipse(55, 0, 9 + fl, 4 + fl * 0.4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "hsla(50, 100%, 75%, 0.9)";
    ctx.beginPath(); ctx.ellipse(56, 0, 4, 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  // Ranged / thrown weapon models. Drawn pointing along +X (the aim direction).
  private drawRangedWeapon(id: SecondaryId) {
    const ctx = this.ctx;
    const slot = this.stats.secondaryActiveSlot;
    const loaded = this.stats.secondaryAmmo[slot] > 0 && this.stats.secondaryReload[slot] <= 0;
    const ready = loaded && this.stats.secondaryCooldown <= 0;
    const fa = this.fireAnim;
    const t = this.elapsed;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    const throwArm = (len: number) => {
      // Thrown weapons swing back then whip forward when released.
      ctx.rotate(fa > 0 ? -0.9 * fa : 0.35);
      ctx.translate(len, 0);
    };
    switch (id) {
      case "yumi": {
        // Tall asymmetric longbow; string draws back with an arrow nocked.
        const bx = 16;
        const draw = ready ? 9 : fa > 0 ? 0 : 4;
        ctx.strokeStyle = "hsl(28, 45%, 32%)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(bx - 2, -30);
        ctx.quadraticCurveTo(bx + 16, -6, bx + 2, 22);
        ctx.stroke();
        ctx.strokeStyle = "hsl(0, 60%, 35%)";
        ctx.lineWidth = 3.5;
        ctx.beginPath(); ctx.moveTo(bx + 5, -4); ctx.lineTo(bx + 6, 3); ctx.stroke();
        ctx.strokeStyle = "hsla(40, 30%, 90%, 0.85)";
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(bx - 2, -30); ctx.lineTo(bx - draw, 0); ctx.lineTo(bx + 2, 22);
        ctx.stroke();
        if (loaded && fa <= 0.2) {
          ctx.strokeStyle = "hsl(36, 35%, 70%)";
          ctx.lineWidth = 1.6;
          ctx.beginPath(); ctx.moveTo(bx - draw, 0); ctx.lineTo(bx + 24, 0); ctx.stroke();
          ctx.fillStyle = "hsl(210, 15%, 75%)";
          ctx.beginPath(); ctx.moveTo(bx + 30, 0); ctx.lineTo(bx + 23, -3); ctx.lineTo(bx + 23, 3); ctx.closePath(); ctx.fill();
          ctx.fillStyle = "hsl(0, 0%, 92%)";
          ctx.beginPath(); ctx.moveTo(bx - draw, 0); ctx.lineTo(bx - draw + 6, -3); ctx.lineTo(bx - draw + 6, 3); ctx.closePath(); ctx.fill();
        }
        break;
      }
      case "crossbow": {
        ctx.translate(-fa * 6, 0);
        ctx.fillStyle = "hsl(25, 40%, 30%)";
        ctx.beginPath(); ctx.roundRect(2, -3, 34, 6, 2); ctx.fill();
        ctx.fillStyle = "hsl(25, 35%, 22%)";
        ctx.beginPath(); ctx.roundRect(4, 2, 8, 6, 2); ctx.fill();
        ctx.strokeStyle = "hsl(210, 10%, 50%)";
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(26, -16); ctx.quadraticCurveTo(33, 0, 26, 16); ctx.stroke();
        const sx = loaded ? 18 : 25;
        ctx.strokeStyle = "hsla(40, 30%, 90%, 0.8)";
        ctx.lineWidth = 0.9;
        ctx.beginPath(); ctx.moveTo(26, -16); ctx.lineTo(sx, 0); ctx.lineTo(26, 16); ctx.stroke();
        if (loaded) {
          ctx.strokeStyle = "hsl(36, 70%, 60%)";
          ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(sx, 0); ctx.lineTo(38, 0); ctx.stroke();
          ctx.fillStyle = "hsl(210, 15%, 80%)";
          ctx.beginPath(); ctx.moveTo(42, 0); ctx.lineTo(37, -2.5); ctx.lineTo(37, 2.5); ctx.closePath(); ctx.fill();
        } else if (this.stats.secondaryReload[slot] > 0) {
          ctx.strokeStyle = "hsla(200, 80%, 70%, 0.8)";
          ctx.lineWidth = 2;
          const pr = 1 - this.stats.secondaryReload[slot] / Math.max(0.01, this.stats.secondaryReloadMax[slot]);
          ctx.beginPath(); ctx.arc(10, -10, 5, -Math.PI / 2, -Math.PI / 2 + pr * Math.PI * 2); ctx.stroke();
        }
        break;
      }
      case "blowgun": {
        ctx.translate(-fa * 3, 0);
        ctx.strokeStyle = "hsl(80, 30%, 45%)";
        ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(4, 0); ctx.lineTo(46, 0); ctx.stroke();
        ctx.strokeStyle = "hsl(80, 25%, 28%)";
        ctx.lineWidth = 4.6;
        for (const x of [14, 26, 38]) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 1, 0); ctx.stroke(); }
        ctx.strokeStyle = "hsl(0, 0%, 12%)";
        ctx.lineWidth = 5;
        ctx.beginPath(); ctx.moveTo(2, 0); ctx.lineTo(6, 0); ctx.stroke();
        if (loaded && fa <= 0.2) {
          ctx.fillStyle = "hsl(120, 60%, 55%)";
          ctx.beginPath(); ctx.arc(45, 0, 1.6, 0, Math.PI * 2); ctx.fill();
        }
        break;
      }
      case "flame_spear": {
        this.drawSpear(fa * 14);
        break;
      }
      case "kunai": {
        throwArm(14);
        if (fa > 0.4) break;
        ctx.strokeStyle = "hsl(0, 0%, 25%)";
        ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.arc(-3, 0, 3, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = "hsl(0, 55%, 30%)";
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(7, 0); ctx.stroke();
        ctx.fillStyle = "hsl(210, 10%, 60%)";
        ctx.beginPath(); ctx.moveTo(7, -3.5); ctx.lineTo(20, 0); ctx.lineTo(7, 3.5); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = "hsla(200, 50%, 90%, 0.8)";
        ctx.lineWidth = 0.7;
        ctx.beginPath(); ctx.moveTo(8, 0); ctx.lineTo(18, 0); ctx.stroke();
        break;
      }
      case "shuriken_wheel": {
        const out = this.secProjectiles.some(pr => pr.kind === "shuriken");
        throwArm(16);
        if (out || fa > 0.4) break;
        ctx.rotate(t * 3);
        ctx.fillStyle = "hsl(210, 8%, 62%)";
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2;
          const r = i % 2 === 0 ? 10 : 3.5;
          i === 0 ? ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r) : ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        }
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "hsl(0, 0%, 10%)";
        ctx.beginPath(); ctx.arc(0, 0, 2, 0, Math.PI * 2); ctx.fill();
        break;
      }
      case "kusarigama": {
        const hookOut = this.secProjectiles.some(pr => pr.kind === "hook");
        ctx.strokeStyle = "hsl(20, 40%, 28%)";
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(4, 0); ctx.lineTo(20, 0); ctx.stroke();
        ctx.fillStyle = "hsl(210, 10%, 70%)";
        ctx.beginPath();
        ctx.moveTo(20, -2);
        ctx.quadraticCurveTo(30, -16, 16, -20);
        ctx.quadraticCurveTo(24, -12, 18, 1);
        ctx.closePath();
        ctx.fill();
        if (!hookOut) {
          ctx.strokeStyle = "hsl(0, 0%, 45%)";
          ctx.lineWidth = 1.2;
          ctx.setLineDash([2, 2]);
          ctx.beginPath();
          ctx.moveTo(4, 0);
          ctx.bezierCurveTo(-6, 14, 10, 18, 12, 8 + Math.sin(t * 4) * 2);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = "hsl(0, 0%, 30%)";
          ctx.beginPath(); ctx.arc(12, 8 + Math.sin(t * 4) * 2, 3, 0, Math.PI * 2); ctx.fill();
        }
        break;
      }
      case "smoke_bomb": {
        throwArm(14);
        if (fa > 0.4) break;
        ctx.fillStyle = "hsl(0, 0%, 14%)";
        ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "hsl(36, 40%, 60%)";
        ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(3, -4); ctx.quadraticCurveTo(7, -9, 5, -12); ctx.stroke();
        ctx.fillStyle = `hsla(${30 + Math.sin(t * 30) * 15}, 100%, 65%, 0.95)`;
        ctx.beginPath(); ctx.arc(5, -12, 1.8 + Math.random(), 0, Math.PI * 2); ctx.fill();
        break;
      }
      case "tetsubishi": {
        throwArm(14);
        if (fa > 0.4) break;
        ctx.fillStyle = "hsl(20, 25%, 22%)";
        ctx.beginPath(); ctx.arc(0, 0, 6.5, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "hsl(210, 8%, 60%)";
        ctx.lineWidth = 1.6;
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2 + t;
          ctx.beginPath(); ctx.moveTo(Math.cos(a) * 5, Math.sin(a) * 5); ctx.lineTo(Math.cos(a) * 10, Math.sin(a) * 10); ctx.stroke();
        }
        break;
      }
      default:
        this.drawPlayerWeapon(null, false, 28);
    }
  }

  // Bodies for the newer roles. Drawn unrotated around the enemy's position.
  private drawSpecialEnemy(e: Enemy): boolean {
    const ctx = this.ctx;
    if (e.archetype !== "priest" && YOKAI_SPRITES[e.archetype] && this.isSpriteEnemy(e)) {
      this.drawEnemySprite(e, false);
      this.drawYokaiOverlay(e);
      return true;
    }
    if (drawNewEnemy(this, ctx, e)) return true;   // STEP 4
    const t = this.elapsed + e.id;
    const flash = e.hitFlash > 0;
    switch (e.archetype) {
      case "onryo": {
        // Vengeful ghost: floating pale robe, long black hair, violet haze.
        const bob = Math.sin(t * 3) * 2.5;
        ctx.save();
        ctx.translate(0, bob);
        ctx.globalAlpha = 0.85;
        const haze = ctx.createRadialGradient(0, 0, 2, 0, 0, e.size * 2.2);
        haze.addColorStop(0, "hsla(280, 70%, 55%, 0.35)"); haze.addColorStop(1, "hsla(280, 70%, 30%, 0)");
        ctx.fillStyle = haze;
        ctx.beginPath(); ctx.arc(0, 0, e.size * 2.2, 0, Math.PI * 2); ctx.fill();
        ctx.rotate(e.facing);
        ctx.fillStyle = flash ? "hsl(0, 0%, 100%)" : "hsl(220, 15%, 90%)";       // robe
        ctx.beginPath(); ctx.ellipse(-2, 0, e.size * 1.05, e.size * 0.95, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "hsl(260, 25%, 8%)";                                       // hair falling back
        ctx.beginPath(); ctx.moveTo(e.size * 0.5, -e.size * 0.6);
        ctx.quadraticCurveTo(-e.size * 0.6, -e.size * 0.9 + Math.sin(t * 4) * 2, -e.size * 1.9, -e.size * 0.3);
        ctx.lineTo(-e.size * 1.9, e.size * 0.3);
        ctx.quadraticCurveTo(-e.size * 0.6, e.size * 0.9 + Math.sin(t * 4 + 1) * 2, e.size * 0.5, e.size * 0.6);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = "hsl(0, 0%, 97%)";                                         // face
        ctx.beginPath(); ctx.arc(e.size * 0.45, 0, e.size * 0.38, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        // Cast charge: violet sigil fills before an ink pool.
        const charge = Math.max(0, 1 - (e.special ?? ONRYO.castEvery) / 0.6);
        if (charge > 0) {
          ctx.strokeStyle = `hsla(280, 85%, 70%, ${charge})`;
          ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(0, 0, e.size + 8, -Math.PI / 2, -Math.PI / 2 + charge * Math.PI * 2); ctx.stroke();
        }
        return true;
      }
      case "nue": {
        // Chimera: tiger-striped body, monkey face, snake tail. Glows while summoning.
        const charging = (e.summonCharge ?? 0) > 0;
        if (charging) {
          const k = 1 - (e.summonCharge ?? 0) / NUE.summonCharge;
          ctx.strokeStyle = `hsla(270, 90%, 70%, ${0.4 + k * 0.6})`;
          ctx.lineWidth = 3;
          ctx.beginPath(); ctx.arc(0, 0, e.size + 10 + k * 18, 0, Math.PI * 2); ctx.stroke();
          ctx.fillStyle = `hsla(270, 90%, 60%, ${0.12 + k * 0.2})`;
          ctx.beginPath(); ctx.arc(0, 0, e.size + 10 + k * 18, 0, Math.PI * 2); ctx.fill();
        }
        ctx.save();
        ctx.rotate(e.facing);
        ctx.strokeStyle = "hsl(110, 35%, 30%)";                                    // snake tail
        ctx.lineWidth = 4; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(-e.size * 0.8, 0);
        ctx.quadraticCurveTo(-e.size * 1.6, Math.sin(t * 5) * 8, -e.size * 2.3, Math.sin(t * 5 + 1.5) * 6);
        ctx.stroke();
        ctx.fillStyle = flash ? "hsl(40, 80%, 85%)" : "hsl(35, 70%, 45%)";       // tiger body
        ctx.beginPath(); ctx.ellipse(0, 0, e.size * 1.05, e.size * 0.85, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "hsl(20, 40%, 12%)"; ctx.lineWidth = 2.5;
        for (const sx of [-0.5, -0.1, 0.3]) { ctx.beginPath(); ctx.moveTo(e.size * sx, -e.size * 0.8); ctx.lineTo(e.size * (sx - 0.15), -e.size * 0.2); ctx.stroke(); ctx.beginPath(); ctx.moveTo(e.size * sx, e.size * 0.8); ctx.lineTo(e.size * (sx - 0.15), e.size * 0.2); ctx.stroke(); }
        ctx.fillStyle = "hsl(25, 35%, 30%)";                                       // monkey face
        ctx.beginPath(); ctx.arc(e.size * 0.85, 0, e.size * 0.45, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "hsl(30, 40%, 70%)";
        ctx.beginPath(); ctx.arc(e.size * 1.0, 0, e.size * 0.25, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        return true;
      }
      case "mirror": {
        // Monk carrying a big bronze mirror in front — shots off the front bounce back.
        ctx.save();
        ctx.rotate(e.facing);
        ctx.fillStyle = flash ? "hsl(30, 60%, 85%)" : "hsl(28, 45%, 38%)";       // robe
        ctx.beginPath(); ctx.arc(0, 0, e.size, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "hsl(30, 30%, 70%)";                                       // shaved head
        ctx.beginPath(); ctx.arc(e.size * 0.2, 0, e.size * 0.45, 0, Math.PI * 2); ctx.fill();
        const mg = ctx.createLinearGradient(e.size, -e.size, e.size + 6, e.size);
        mg.addColorStop(0, "hsl(45, 70%, 75%)"); mg.addColorStop(0.5, "hsl(40, 80%, 55%)"); mg.addColorStop(1, "hsl(35, 70%, 35%)");
        ctx.fillStyle = mg;                                                        // bronze mirror
        ctx.beginPath(); ctx.ellipse(e.size + 5, 0, 5, e.size * 1.15, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = `hsla(50, 100%, 90%, ${0.4 + Math.sin(t * 4) * 0.3})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(e.size + 7, -e.size * 0.6); ctx.lineTo(e.size + 7, e.size * 0.2); ctx.stroke();
        ctx.restore();
        return true;
      }
      case "wisp": {
        // Hitodama: a blue spirit flame trailing behind its direction of travel.
        const back = e.facing + Math.PI;
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        const g = ctx.createRadialGradient(0, 0, 1, 0, 0, e.size * 1.6);
        g.addColorStop(0, flash ? "hsla(0,0%,100%,0.95)" : "hsla(195, 100%, 85%, 0.95)");
        g.addColorStop(0.5, "hsla(210, 90%, 60%, 0.55)");
        g.addColorStop(1, "hsla(230, 90%, 50%, 0)");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(0, 0, e.size * 1.6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "hsla(205, 95%, 70%, 0.6)";
        ctx.beginPath();
        const wob = Math.sin(t * 12) * 3;
        ctx.moveTo(Math.cos(back + 1.2) * e.size * 0.8, Math.sin(back + 1.2) * e.size * 0.8);
        ctx.quadraticCurveTo(Math.cos(back) * e.size * 2.4 + wob, Math.sin(back) * e.size * 2.4 - wob, Math.cos(back) * e.size * 2.8, Math.sin(back) * e.size * 2.8);
        ctx.quadraticCurveTo(Math.cos(back) * e.size * 2.2 - wob, Math.sin(back) * e.size * 2.2 + wob, Math.cos(back - 1.2) * e.size * 0.8, Math.sin(back - 1.2) * e.size * 0.8);
        ctx.fill();
        ctx.restore();
        ctx.fillStyle = "hsl(220, 60%, 12%)";
        for (const s of [-1, 1]) {
          ctx.beginPath(); ctx.arc(Math.cos(e.facing + s * 0.5) * 3.5, Math.sin(e.facing + s * 0.5) * 3.5 - 1, 1.5, 0, Math.PI * 2); ctx.fill();
        }
        return true;
      }
      case "priest": {
        // Healer monk: pale robe, shakujō staff, and a visible healing aura.
        const charge = Math.max(0, 1 - (e.special ?? 2) / 3.5);
        ctx.save();
        ctx.strokeStyle = `hsla(130, 70%, 60%, ${0.18 + charge * 0.35})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 8]);
        ctx.lineDashOffset = -t * 20;
        ctx.beginPath(); ctx.arc(0, 0, 200, 0, Math.PI * 2); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = `hsla(130, 70%, 55%, ${0.05 + charge * 0.1})`;
        ctx.beginPath(); ctx.arc(0, 0, 200, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        if (this.drawEnemySprite(e, false)) {
          ctx.fillStyle = "hsl(130, 70%, 65%)"; ctx.font = "bold 12px serif"; ctx.textAlign = "center";
          ctx.fillText("癒", 0, -e.size * 4.6);
          return true;
        }
        ctx.save();
        ctx.rotate(e.facing);
        ctx.fillStyle = flash ? "hsl(36, 80%, 85%)" : "hsl(45, 25%, 82%)";
        ctx.beginPath(); ctx.arc(0, 0, e.size, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "hsl(130, 40%, 30%)";
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(0, 0, e.size - 1.5, Math.PI * 0.6, Math.PI * 1.4); ctx.stroke();
        ctx.fillStyle = "hsl(30, 30%, 70%)";
        ctx.beginPath(); ctx.arc(e.size * 0.35, 0, e.size * 0.42, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "hsl(42, 70%, 50%)";
        ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(-4, e.size * 0.7); ctx.lineTo(e.size + 16, e.size * 0.7); ctx.stroke();
        ctx.beginPath(); ctx.arc(e.size + 18, e.size * 0.7, 5, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
        ctx.fillStyle = "hsl(130, 70%, 65%)";
        ctx.font = "bold 12px serif";
        ctx.textAlign = "center";
        ctx.fillText("癒", 0, -e.size - 14);
        return true;
      }
      case "bomber": {
        // Hōrokubiya: straw-hatted grenadier with a lit bomb in hand.
        ctx.save();
        ctx.rotate(e.facing);
        ctx.fillStyle = flash ? "hsl(36, 80%, 80%)" : "hsl(25, 30%, 24%)";
        ctx.beginPath(); ctx.arc(0, 0, e.size, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "hsl(42, 45%, 55%)";
        ctx.beginPath(); ctx.arc(0, 0, e.size * 1.15, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "hsl(38, 40%, 38%)";
        ctx.lineWidth = 1;
        for (let k = 0; k < 8; k++) {
          const a = (k / 8) * Math.PI * 2;
          ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * e.size * 1.15, Math.sin(a) * e.size * 1.15); ctx.stroke();
        }
        ctx.fillStyle = "hsl(0, 0%, 9%)";
        ctx.beginPath(); ctx.arc(e.size + 4, e.size * 0.5, 5.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = `hsl(${35 + Math.sin(t * 25) * 12}, 100%, 65%)`;
        ctx.beginPath(); ctx.arc(e.size + 7, e.size * 0.5 - 5, 1.8, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        return true;
      }
      case "lantern": {
        // Chōchin-obake: a paper lantern ghost; swells and blinks before bursting.
        const fusing = (e.fuse ?? 0) > 0;
        const fp = fusing ? 1 - (e.fuse! / 0.8) : 0;
        const sc = 1 + fp * 0.45;
        if (fusing) {
          ctx.fillStyle = `hsla(10, 90%, 50%, ${0.12 + fp * 0.18})`;
          ctx.beginPath(); ctx.arc(0, 0, 90, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = `hsla(10, 95%, 60%, ${0.5 + fp * 0.4})`;
          ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(0, 0, 90, 0, Math.PI * 2); ctx.stroke();
          ctx.beginPath(); ctx.arc(0, 0, 90 * fp, 0, Math.PI * 2); ctx.stroke();
        }
        ctx.save();
        ctx.scale(sc, sc);
        const blink = fusing && Math.sin(t * (20 + fp * 40)) > 0;
        const body = flash || blink ? "hsl(40, 100%, 85%)" : "hsl(24, 85%, 52%)";
        const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, e.size * 2);
        glow.addColorStop(0, "hsla(35, 100%, 65%, 0.55)");
        glow.addColorStop(1, "hsla(30, 100%, 50%, 0)");
        ctx.fillStyle = glow;
        ctx.beginPath(); ctx.arc(0, 0, e.size * 2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = body;
        ctx.beginPath(); ctx.ellipse(0, 0, e.size * 0.85, e.size * 1.1, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "hsla(20, 60%, 25%, 0.8)";
        ctx.lineWidth = 1;
        for (let k = -2; k <= 2; k++) {
          ctx.beginPath(); ctx.ellipse(0, k * e.size * 0.35, e.size * 0.85 * Math.cos(k * 0.45), 1, 0, 0, Math.PI * 2); ctx.stroke();
        }
        ctx.fillStyle = "hsl(0, 0%, 10%)";
        ctx.fillRect(-e.size * 0.5, -e.size * 1.15, e.size, 3);
        ctx.fillRect(-e.size * 0.5, e.size * 1.05, e.size, 3);
        ctx.fillStyle = "hsl(0, 0%, 98%)";
        ctx.beginPath(); ctx.arc(0, -2, 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "hsl(0, 0%, 5%)";
        ctx.beginPath(); ctx.arc(Math.cos(e.facing) * 1.5, -2 + Math.sin(e.facing) * 1.5, 2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "hsl(355, 80%, 55%)";
        ctx.beginPath(); ctx.ellipse(0, 6, 2.5, 4 + Math.sin(t * 8), 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        return true;
      }
    }
    return false;
  }

  private drawEnemyHpBar(e: Enemy) {
    const ctx = this.ctx;
    const ratio = Math.max(0, Math.min(1, e.hp / e.maxHp));
    const w = Math.max(18, e.size * 1.6);
    const x = e.pos.x - w / 2;
    const y = this.isSpriteEnemy(e) ? e.pos.y + e.size - this.spriteHeightOf(e) - 4
      : e.pos.y - e.size - (e.archetype === "priest" ? 28 : 9);
    ctx.fillStyle = "hsla(0, 0%, 4%, 0.7)";
    ctx.fillRect(x - 1, y - 1, w + 2, 4);
    ctx.fillStyle = `hsl(358, 75%, ${30 + ratio * 22}%)`;
    ctx.fillRect(x, y, w * ratio, 2);
  }

  // Boss-specific silhouettes layered over the shared boss body (rotated space).
  private drawBossOrnament(e: Enemy) {
    const ctx = this.ctx;
    const t = this.elapsed;
    const s = e.size;
    switch (e.bossKind) {
      case "oni": {
        ctx.fillStyle = "hsl(42, 70%, 70%)";
        for (const side of [-1, 1]) {
          ctx.beginPath();
          ctx.moveTo(s * 0.1, side * s * 0.45);
          ctx.lineTo(-s * 0.45, side * s * 1.15);
          ctx.lineTo(s * 0.35, side * s * 0.7);
          ctx.closePath(); ctx.fill();
        }
        break;
      }
      case "kitsune": {
        // Nine fanned tails behind her.
        for (let i = 0; i < 9; i++) {
          const a = Math.PI + (i / 8 - 0.5) * 2.2 + Math.sin(t * 3 + i) * 0.08;
          ctx.save();
          ctx.rotate(a);
          const g = ctx.createLinearGradient(s * 0.5, 0, s * 2.6, 0);
          g.addColorStop(0, "hsla(28, 95%, 55%, 0.9)");
          g.addColorStop(1, "hsla(40, 100%, 92%, 0.95)");
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.ellipse(s * 1.55, 0, s * 1.05, s * 0.28, 0, 0, Math.PI * 2); ctx.fill();
          ctx.restore();
        }
        ctx.fillStyle = "hsl(30, 90%, 60%)";
        for (const side of [-1, 1]) {
          ctx.beginPath(); ctx.moveTo(s * 0.4, side * s * 0.3); ctx.lineTo(s * 0.1, side * s * 1.0); ctx.lineTo(-s * 0.2, side * s * 0.4); ctx.closePath(); ctx.fill();
        }
        break;
      }
      case "gasha": {
        // Giant skeleton: bone skull face with hollow eyes and ribs.
        ctx.fillStyle = e.hitFlash > 0 ? "hsl(36, 80%, 90%)" : "hsl(45, 25%, 82%)";
        ctx.beginPath(); ctx.arc(0, 0, s * 0.92, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "hsl(0, 0%, 6%)";
        for (const side of [-1, 1]) { ctx.beginPath(); ctx.ellipse(s * 0.3, side * s * 0.32, s * 0.2, s * 0.15, 0, 0, Math.PI * 2); ctx.fill(); }
        ctx.fillStyle = `hsla(0, 90%, 55%, ${0.6 + Math.sin(t * 5) * 0.3})`;
        for (const side of [-1, 1]) { ctx.beginPath(); ctx.arc(s * 0.32, side * s * 0.32, s * 0.06, 0, Math.PI * 2); ctx.fill(); }
        ctx.strokeStyle = "hsl(45, 15%, 55%)";
        ctx.lineWidth = 2;
        for (let k = -2; k <= 2; k++) { ctx.beginPath(); ctx.arc(-s * 0.4, 0, s * 0.5 + k * 3, Math.PI * 0.6, Math.PI * 1.4); ctx.stroke(); }
        break;
      }
      case "raijin": {
        // Ring of thunder drums orbiting the general, crackling.
        for (let i = 0; i < 6; i++) {
          const a = t * 1.5 + (i / 6) * Math.PI * 2;
          const x = Math.cos(a) * s * 1.7, y = Math.sin(a) * s * 1.7;
          ctx.fillStyle = "hsl(15, 60%, 30%)";
          ctx.beginPath(); ctx.arc(x, y, s * 0.28, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = "hsl(45, 80%, 60%)";
          ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.arc(x, y, s * 0.2, 0, Math.PI * 2); ctx.stroke();
        }
        ctx.strokeStyle = `hsla(205, 100%, 80%, ${0.4 + Math.random() * 0.5})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(0, 0, s * 1.7, 0, Math.PI * 2); ctx.stroke();
        break;
      }
    }
  }

  /** True while the player is untargetable: Shadow Step, smoke pellet, or standing in smoke. */
  playerHidden(): boolean {
    if (this.ultShadowStepTimer > 0 || this.stats.buffSmokeRemaining > 0 || this.vanishTimer > 0) return true;
    const p = this.player.pos;
    for (const s of this.smokeClouds) {
      if (Math.hypot(p.x - s.pos.x, p.y - s.pos.y) <= s.radius * 0.9) return true;
    }
    return false;
  }

  /** Dev overlay: hit circles, enemy HP/state and the player's stealth state. */
  private drawDevHitboxes() {
    const ctx = this.ctx;
    ctx.save();
    ctx.lineWidth = 1;
    ctx.font = "10px monospace";
    ctx.textAlign = "center";
    for (const e of this.enemies) {
      if (e.state === "dead") continue;
      ctx.strokeStyle = e.isBoss ? "hsla(0, 100%, 60%, 0.9)" : "hsla(0, 90%, 65%, 0.7)";
      ctx.beginPath(); ctx.arc(e.pos.x, e.pos.y, e.size, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = "hsla(0, 0%, 100%, 0.85)";
      ctx.fillText(`${e.archetype} ${Math.ceil(e.hp * 10) / 10}/${e.maxHp}${e.lostTrack ? " lost" : ""}`, e.pos.x, e.pos.y + e.size + 12);
    }
    const p = this.player.pos;
    const hidden = this.playerHidden();
    ctx.strokeStyle = hidden ? "hsla(200, 90%, 70%, 0.9)" : "hsla(120, 80%, 60%, 0.8)";
    ctx.beginPath(); ctx.arc(p.x, p.y, BASE.PLAYER_RADIUS, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = ctx.strokeStyle;
    ctx.fillText(hidden ? "HIDDEN" : `hp ${Math.ceil(this.player.hp)}`, p.x, p.y + BASE.PLAYER_RADIUS + 12);
    ctx.restore();
  }

  /** Under the enemies: fire trails, frost / commander auras, Spirit Chests. */
  private drawEliteGround() {
    const ctx = this.ctx, t = this.elapsed;
    ctx.save();
    for (const f of this.firePatches) {
      const a = Math.min(1, f.life / 0.6) * 0.55;
      const r = ELITE.fireRadius * (0.85 + Math.sin(t * 9 + f.x) * 0.08);
      const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, r);
      g.addColorStop(0, `hsla(40, 100%, 65%, ${a})`);
      g.addColorStop(0.6, `hsla(18, 100%, 50%, ${a * 0.7})`);
      g.addColorStop(1, "hsla(10, 100%, 40%, 0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(f.x, f.y, r, 0, Math.PI * 2); ctx.fill();
    }
    for (const e of this.enemies) {
      if (e.state === "dead" || !e.affixes) continue;
      if (e.affixes.includes("frost")) {
        ctx.fillStyle = "hsla(195, 90%, 75%, 0.07)";
        ctx.strokeStyle = `hsla(195, 90%, 80%, ${0.25 + Math.sin(t * 3) * 0.08})`;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(e.pos.x, e.pos.y, ELITE.frostRadius, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      }
      if (e.affixes.includes("commander")) {
        ctx.strokeStyle = "hsla(275, 70%, 70%, 0.35)";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([8, 10]); ctx.lineDashOffset = -t * 25;
        ctx.beginPath(); ctx.arc(e.pos.x, e.pos.y, ELITE.commanderRadius, 0, Math.PI * 2); ctx.stroke();
        ctx.setLineDash([]);
      }
    }
    for (const c of this.spiritChests) {
      if (c.life < 5 && Math.floor(c.life * 6) % 2 === 0) continue; // blink before it fades
      const bob = Math.sin(c.t * 4) * 3;
      const glow = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, 34);
      glow.addColorStop(0, "hsla(45, 100%, 65%, 0.45)"); glow.addColorStop(1, "hsla(45, 100%, 65%, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(c.x, c.y, 34, 0, Math.PI * 2); ctx.fill();
      ctx.save();
      ctx.translate(c.x, c.y + bob);
      ctx.fillStyle = "hsl(355, 60%, 30%)";             // lacquer box
      ctx.fillRect(-12, -7, 24, 15);
      ctx.fillStyle = "hsl(355, 65%, 38%)";             // lid
      ctx.fillRect(-13, -11, 26, 6);
      ctx.fillStyle = "hsl(45, 90%, 60%)";              // gold trim + clasp
      ctx.fillRect(-13, -6, 26, 2);
      ctx.fillRect(-2.5, -7, 5, 6);
      ctx.restore();
    }
    ctx.restore();
  }

  /** Over the enemies: affix outline ring, name tag and ward pips. */
  private drawEliteTags() {
    const ctx = this.ctx, t = this.elapsed;
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 11px system-ui, sans-serif";
    for (const e of this.enemies) {
      if (e.state === "dead" || !e.affixes) continue;
      const hue = AFFIXES[e.affixes[0]].hue;
      const spr = this.isSpriteEnemy(e);   // sprites get a silhouette outline in drawEnemySprite instead of rings
      if (!spr) {
      ctx.strokeStyle = `hsla(${hue}, 95%, 65%, ${0.55 + Math.sin(t * 5 + e.id) * 0.25})`;
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(e.pos.x, e.pos.y, e.size + 5, 0, Math.PI * 2); ctx.stroke();
      }
      if (e.affixes[1] && !spr) {
        ctx.strokeStyle = `hsla(${AFFIXES[e.affixes[1]].hue}, 95%, 65%, 0.6)`;
        ctx.beginPath(); ctx.arc(e.pos.x, e.pos.y, e.size + 9, 0, Math.PI * 2); ctx.stroke();
      }
      if (e.isBoss) continue;   // bosses already have a big name bar
      const label = `${e.affixes.map(a => AFFIXES[a].kanji).join("")} ${this.eliteName(e)}`;
      const y = spr ? e.pos.y + e.size - this.spriteHeightOf(e) - 18 : e.pos.y - e.size - (e.archetype === "priest" ? 42 : 22);
      const w = ctx.measureText(label).width + 10;
      ctx.fillStyle = "hsla(0, 0%, 4%, 0.72)";
      ctx.fillRect(e.pos.x - w / 2, y - 8, w, 16);
      ctx.fillStyle = `hsl(${hue}, 95%, 72%)`;
      ctx.fillText(label, e.pos.x, y + 0.5);
      if (e.wardHits && e.wardHits > 0) {
        for (let i = 0; i < e.wardHits; i++) {
          ctx.fillStyle = "hsl(220, 90%, 75%)";
          ctx.beginPath(); ctx.arc(e.pos.x + w / 2 + 7 + i * 8, y, 3, 0, Math.PI * 2); ctx.fill();
        }
      }
    }
    ctx.restore();
  }

  /** "?" over enemies that lost the player in stealth. */
  private drawSearchMarkers() {
    const ctx = this.ctx;
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 18px serif";
    for (const e of this.enemies) {
      if (e.state === "dead" || !e.lostTrack) continue;
      const bob = Math.sin(this.elapsed * 6 + e.pos.x) * 2;
      const a = Math.min(1, e.lostTrack * 4);
      const y = e.pos.y - e.size - (e.archetype === "priest" ? 44 : 24) + bob;
      ctx.fillStyle = `hsla(0, 0%, 4%, ${0.6 * a})`;
      ctx.beginPath(); ctx.arc(e.pos.x, y, 10, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `hsla(48, 95%, 70%, ${a})`;
      ctx.fillText("?", e.pos.x, y + 1);
    }
    ctx.restore();
  }

  /** v3.7: human enemies as pixel sprites. Yokai, elites' auras and bosses keep their own art. */
  isSpriteEnemy(e: Enemy): boolean {
    if (!this.useSprites || !spritesReady()) return false;
    if (e.archetype === "final") return hasBody("shogun");
    if (e.isBoss) return e.bossKind === "kitsune" || e.bossKind === "gasha" || e.bossKind === "oni" || e.bossKind === "raijin";
    const yk = YOKAI_SPRITES[e.archetype];
    if (yk) return hasBody(yk.id) && !(e.archetype === "kappa_raid" && e.submerged) && !(e.archetype === "mimic" && (e as Enemy & { disguised?: boolean }).disguised);
    return e.archetype === "normal" || e.archetype === "assassin" || e.archetype === "archer" || e.archetype === "heavy" || e.archetype === "shielded" || e.archetype === "priest";
  }

  /** Gameplay warnings that sat on the old yokai bodies, redrawn on top of their sprites. */
  private drawYokaiOverlay(e: Enemy) {
    const ctx = this.ctx, t = this.elapsed + e.id;
    const midY = e.size - this.spriteHeightOf(e) * 0.5;   // body centre (feet are at +size)
    ctx.save();
    switch (e.archetype) {
      case "onryo": {
        const charge = Math.max(0, 1 - (e.special ?? ONRYO.castEvery) / 0.6);
        if (charge > 0) {
          ctx.strokeStyle = `hsla(280, 85%, 70%, ${charge})`; ctx.lineWidth = 2.5;
          ctx.beginPath(); ctx.arc(0, midY, e.size + 14, -Math.PI / 2, -Math.PI / 2 + charge * Math.PI * 2); ctx.stroke();
        }
        break;
      }
      case "nue": {
        if ((e.summonCharge ?? 0) > 0) {
          const k = 1 - (e.summonCharge ?? 0) / NUE.summonCharge;
          ctx.strokeStyle = `hsla(270, 90%, 70%, ${0.4 + k * 0.6})`; ctx.lineWidth = 3;
          ctx.beginPath(); ctx.arc(0, midY, e.size + 10 + k * 18, 0, Math.PI * 2); ctx.stroke();
          ctx.fillStyle = `hsla(270, 90%, 60%, ${0.12 + k * 0.2})`; ctx.fill();
        }
        break;
      }
      case "mirror": {   // the reflecting front: a gold arc on the ground on the mirror's side
        ctx.translate(0, e.size - 2); ctx.scale(1, 0.45); ctx.rotate(e.facing);
        ctx.strokeStyle = `hsla(45, 95%, 70%, ${0.55 + Math.sin(t * 4) * 0.25})`; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(0, 0, e.size + 10, -0.9, 0.9); ctx.stroke();
        break;
      }
      case "lantern": {
        if ((e.fuse ?? 0) > 0) {
          const fp = 1 - e.fuse! / 0.8;
          ctx.fillStyle = `hsla(10, 90%, 50%, ${0.12 + fp * 0.18})`; ctx.beginPath(); ctx.arc(0, 0, 90, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = `hsla(10, 95%, 60%, ${0.5 + fp * 0.4})`; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(0, 0, 90, 0, Math.PI * 2); ctx.stroke();
          ctx.beginPath(); ctx.arc(0, 0, 90 * fp, 0, Math.PI * 2); ctx.stroke();
        }
        break;
      }
      case "taiko": {
        if ((e.drumT ?? 0) > 0) {
          const r = e.size + 8 + ((t * 60) % 30);
          ctx.strokeStyle = `hsla(0, 80%, 60%, ${1 - ((t * 60) % 30) / 30})`; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.ellipse(0, e.size - 2, r, r * 0.45, 0, 0, Math.PI * 2); ctx.stroke();
        }
        break;
      }
      case "inoshishi": {
        if (e.stunTimer > 0) {
          ctx.fillStyle = "hsl(50, 100%, 70%)";
          for (let i = 0; i < 3; i++) { const a = t * 5 + i * 2.1; ctx.beginPath(); ctx.arc(Math.cos(a) * 12, e.size - this.spriteHeightOf(e) - 4 + Math.sin(a) * 4, 2.5, 0, Math.PI * 2); ctx.fill(); }
        }
        break;
      }
    }
    ctx.restore();
  }

  spriteHeightOf(e: Enemy): number { return e.size * (YOKAI_SPRITES[e.archetype]?.h ?? (e.archetype === "final" ? 3.8 : e.bossKind === "gasha" ? 4.2 : e.bossKind === "oni" || e.bossKind === "raijin" ? 3.6 : e.isBoss ? 3.4 : 4.4)); }

  private drawEnemySprite(e: Enemy, dead: boolean): boolean {
    if (!this.isSpriteEnemy(e)) return false;
    let id: CharId, variant: SprVariant = "base";
    // From the Gashadokuro's wave on, about a third of the rank-and-file rise as skeletons (looks only).
    const undead = this.stats.wave >= 15 && (e.id * 7) % 3 === 0;
    switch (e.archetype) {
      case "normal": if (undead) { id = "skspear"; break; } id = "samurai"; variant = "crimson"; break;
      case "assassin": id = "karasu"; break;
      case "priest": id = "ytengu"; break;
      case "archer": id = undead ? "skarcher" : "archer"; break;
      case "heavy": id = "commander"; break;
      case "shielded": id = undead ? "skwarrior" : "commander"; break;
      default:
        if (YOKAI_SPRITES[e.archetype] && !e.isBoss) { id = YOKAI_SPRITES[e.archetype].id; variant = YOKAI_SPRITES[e.archetype].variant ?? "base"; break; }
        if (e.archetype === "final") { id = "shogun"; break; }
        if (e.bossKind === "kitsune") { id = "kitsune"; break; }
        if (e.bossKind === "gasha") { id = "skwarrior"; break; }
        if (e.bossKind === "oni") { id = "oni"; break; }
        if (e.bossKind === "raijin") { id = "raijin"; break; }
        return false;
    }
    const ctx = this.ctx, t = this.elapsed + e.id * 0.37;
    const h = this.spriteHeightOf(e);
    // Face the way they walk; face their target while attacking or standing.
    const tr = e as Enemy & { _sx?: number; _face?: number };
    const edx = tr._sx === undefined ? 0 : e.pos.x - tr._sx;
    tr._sx = e.pos.x;
    const attackingNow = e.state === "attacking" || (e.isBoss && e.bossPatternTimer > 0);
    if (dead) { /* keep the side they fell on */ }
    else if (attackingNow || Math.abs(edx) < 0.25) tr._face = Math.cos(e.facing) < 0 ? -1 : 1;
    else tr._face = edx < 0 ? -1 : 1;
    const flip = (tr._face ?? (Math.cos(e.facing) < 0 ? -1 : 1)) < 0;
    const tr2 = e as Enemy & { _sy?: number };
    const edy = tr2._sy === undefined ? 0 : e.pos.y - tr2._sy;
    tr2._sy = e.pos.y;
    const emv = Math.hypot(edx, edy);
    ctx.save();
    ctx.translate(0, e.size - 1);
    if (dead) {
      ctx.globalAlpha *= Math.max(0, Math.min(1, e.deathTimer * 1.5));
      drawChar(ctx, id, "Dead", { frame: (1 - Math.min(1, e.deathTimer)) * frameCount(id, "Dead") * 1.6, loop: false, flip, height: h, variant });
      ctx.restore();
      return true;
    }
    let anim: SprAnim, frame: number, loop = true;
    if (e.isBoss && e.bossPatternTimer > 0) {
      // Boss patterns: raise the weapon for slams, sweep for volleys.
      anim = e.bossPattern === 1 ? "Attack_1" : "Attack_2";
      const n = frameCount(id, anim);
      frame = e.bossPattern === 1 ? Math.min(n - 1, (1 - Math.min(1, e.bossPatternTimer / 1.4)) * n * 1.1) : t * 9;
      loop = e.bossPattern !== 1;
    } else if (e.state === "attacking") {
      anim = id === "archer" || id === "skarcher" ? "Shot" : e.id % 3 === 0 ? "Attack_2" : "Attack_1";
      frame = Math.max(0, Math.min(1, e.attackAnim)) * frameCount(id, anim); loop = false;
    } else if (e.hitFlash > 0.5 && !e.isBoss) { anim = "Hurt"; frame = (1 - e.hitFlash) * frameCount(id, "Hurt") * 2; loop = false; }
    else if (e.archetype === "shielded" && e.shieldHp > 0 && e.state === "alert") { anim = "Protect"; frame = 99; loop = false; }
    else if (e.state !== "stunned" && e.speed > 0.5) { anim = e.archetype === "assassin" ? "Run" : "Walk"; frame = t * (e.archetype === "assassin" ? 14 : 10); }
    else { anim = "Idle"; frame = t * 7; }
    // Mostly-vertical walking uses back / front views when this body has them.
    let evert = false;
    if (!attackingNow && emv > 0.25 && (anim === "Walk" || anim === "Run") && Math.abs(edy) > Math.abs(edx) * 1.2) {
      const va: SprAnim = edy < 0 ? "RunUp" : "RunDown";
      if (hasAnim(id, va)) { anim = va; frame = t * 10; loop = true; evert = true; }
    }
    if (!evert && !attackingNow && emv > 0.25 && (anim === "Walk" || anim === "Run")) {
      const vy = Math.max(-1, Math.min(1, edy / emv));
      ctx.rotate((flip ? -1 : 1) * (0.05 + 0.08 * Math.max(0, -vy) - 0.04 * Math.max(0, vy)));
    }
    let fl = e.hitFlash > 0 ? Math.min(0.8, e.hitFlash) : 0;
    if (e.archetype === "lantern" && (e.fuse ?? 0) > 0) {   // swell and blink before it bursts
      const fp = 1 - e.fuse! / 0.8;
      ctx.scale(1 + fp * 0.45, 1 + fp * 0.45);
      if (Math.sin(this.elapsed * (20 + fp * 40)) > 0) fl = 0.8;
    }
    if (e.archetype === "tsukumo" || e.archetype === "tsukumo_small") ctx.translate(0, -Math.abs(Math.sin(this.elapsed * 6 + e.id)) * e.size * 0.45);   // hops on one leg
    if (e.archetype === "taiko" && (e.drumT ?? 0) > 0) { const b = 1 + 0.08 * Math.sin(this.elapsed * 40); ctx.scale(b, b); }
    const outline = e.affixes?.length
      ? { color: `hsl(${AFFIXES[e.affixes[0]].hue}, 95%, 62%)`, alpha: 0.7 + Math.sin(this.elapsed * 5 + e.id) * 0.25, width: e.affixes[1] ? 3 : 2 }
      : undefined;
    drawChar(ctx, id, anim, { frame, loop, flip, height: h, variant, flash: fl, outline });
    ctx.restore();
    return true;
  }

  drawEnemy(e: Enemy, dead: boolean) {
    const ctx = this.ctx;
    ctx.save();
    // Tetsubo launch — render with vertical offset (shadow stays grounded).
    const yOff = e.launched ? -e.launchHeight : 0;
    ctx.translate(e.pos.x, e.pos.y + yOff);

    if (dead && this.drawEnemySprite(e, true)) { ctx.restore(); return; }
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

    if (this.drawSpecialEnemy(e)) {
      ctx.restore();
      this.drawEnemyHpBar(e);
      return;
    }

    const spriteBody = this.drawEnemySprite(e, false);
    ctx.rotate(e.facing);

    const isAttacking = e.state === "attacking";
    if (isAttacking) {
      const t = Math.max(0, Math.min(1, e.attackAnim));
      const reach = (e.isBoss ? BASE.ENEMY_ATTACK_RANGE + 16 : BASE.ENEMY_ATTACK_RANGE) + BASE.PLAYER_RADIUS + 6;
      ctx.save();
      ctx.fillStyle = `hsla(358, 85%, 50%, ${0.08 + t * 0.14})`;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, reach, -0.6, 0.6);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = `hsla(358, 90%, 55%, ${0.18 + t * 0.25})`;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, reach * Math.min(1, t), -0.6, 0.6);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
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
    } else if (!spriteBody) {
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

    if (!spriteBody) {
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
    }

    // Shinobi poison-on-hit — sickly green tint pulse over the body.
    if (e.poisonRemaining > 0 && !spriteBody) {
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
      if (spriteBody) {   // on the ground under its feet, so it doesn't cut through the sprite
        ctx.rotate(-e.facing); ctx.translate(0, e.size - 2); ctx.scale(1, 0.45); ctx.rotate(e.shieldFacing);
      } else ctx.rotate(-e.facing + e.shieldFacing);
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
      // Bow — drawn forward (sprite archers hold their own bow).
      ctx.save();
      if (!spriteBody) {
      ctx.strokeStyle = "hsl(36, 60%, 40%)";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(e.size + 4, 0, 7, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
      }
      // Telegraph aim line during draw
      if (e.attackAnim > 0) {
        ctx.strokeStyle = `hsla(${this.a11y.colorblind ? this.dangerHue : 355}, 90%, 55%, ${0.25 + e.attackAnim * 0.55})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(e.size + 4, 0);
        ctx.lineTo(e.size + 4 + 320, 0);
        ctx.stroke();
      }
      ctx.restore();
    } else if (e.archetype === "assassin" && !spriteBody) {
      // Twin blades (sprite assassins hold their own).
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
    } else if (e.archetype === "final" && !spriteBody) {
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
    if (e.bossKind && !spriteBody) this.drawBossOrnament(e);

    ctx.restore();
    if (e.isBoss) this.drawBossTelegraph(e);

    // Final boss extra: a centered kanji 鬼 above the body (the sprite has its nameplate instead).
    if (e.archetype === "final" && !this.isSpriteEnemy(e)) {
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
      const y = this.isSpriteEnemy(e) ? e.pos.y + e.size - this.spriteHeightOf(e) - 14 : e.pos.y - e.size - 18;
      ctx.fillStyle = "hsla(0, 0%, 0%, 0.6)";
      ctx.fillRect(x - 1, y - 1, w + 2, 6);
      ctx.fillStyle = "hsl(358, 78%, 48%)";
      ctx.fillRect(x, y, w * Math.max(0, e.hp / e.maxHp), 4);
      ctx.fillStyle = "hsl(42, 95%, 70%)";
      ctx.font = "bold 10px serif";
      ctx.textAlign = "center";
      ctx.fillText(e.bossKind ? `◈ ${BOSS_INFO[e.bossKind].kanji} ${BOSS_INFO[e.bossKind].name} ◈` : e.archetype === "final" ? "◈ 将 The Shogun ◈" : "◈ BOSS ◈", e.pos.x, y - 4);
      // Numeric HP — current/max, to the right of the bar.
      const hpNow = fmtNum(e.hp);
      const hpMax = fmtNum(e.maxHp);
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
      const hpNow = fmtNum(e.hp);
      const hpMax = fmtNum(e.maxHp);
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
      const age = f.maxLife - f.life;
      const pop = age < 0.12 ? 1.6 - (age / 0.12) * 0.6 : 1;
      ctx.save();
      ctx.globalAlpha = a;
      if (pop !== 1) {
        ctx.translate(f.pos.x, f.pos.y);
        ctx.scale(pop, pop);
        ctx.translate(-f.pos.x, -f.pos.y);
      }
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
      if (this.useSprites && spritesReady()) {   // a dark copy of your sprite
        this.ghostLook = { variant: "shade" };
        this.drawPlayerGhost(d.pos.x, d.pos.y, this.player.facing, 0.55 * a, 0, 1);
        this.ghostLook = null;
        continue;
      }
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

    // Clones — a glowing ink double, tied to you by a shadow thread.
    for (const c of this.clones) {
      ctx.save();
      const pulse = 0.5 + 0.5 * Math.sin(this.elapsed * 6 + c.pos.x);
      ctx.strokeStyle = `hsla(215, 80%, 65%, ${0.25 + 0.2 * pulse})`;
      ctx.lineWidth = 2; ctx.setLineDash([4, 6]); ctx.lineDashOffset = -this.elapsed * 30;
      ctx.beginPath(); ctx.moveTo(this.player.pos.x, this.player.pos.y); ctx.lineTo(c.pos.x, c.pos.y); ctx.stroke();
      ctx.setLineDash([]);
      const cloneSpr = this.useSprites && spritesReady();
      if (cloneSpr) {
        ctx.fillStyle = `hsla(215, 90%, 75%, ${0.6 + 0.3 * pulse})`;
        ctx.font = "bold 14px serif"; ctx.textAlign = "center";
        ctx.fillText("影", c.pos.x, c.pos.y + BASE.PLAYER_RADIUS - BASE.PLAYER_RADIUS * 4.4 - 6);
        ctx.restore();
        const spd = Math.hypot(c.vel?.x ?? 0, c.vel?.y ?? 0);
        this.ghostLook = { variant: "spirit", outline: "hsl(215, 90%, 70%)", moving: spd > 40 };
        this.drawPlayerGhost(c.pos.x, c.pos.y, c.facing, c.hitFlash > 0 ? 0.6 : 0.9, c.swing ?? 0, c.swingDir ?? 1);
        this.ghostLook = null;
        continue;
      }
      const cg = ctx.createRadialGradient(c.pos.x, c.pos.y, 4, c.pos.x, c.pos.y, BASE.PLAYER_RADIUS + 22);
      cg.addColorStop(0, "hsla(215, 90%, 60%, 0.45)");
      cg.addColorStop(1, "hsla(215, 90%, 50%, 0)");
      ctx.fillStyle = cg;
      ctx.beginPath(); ctx.arc(c.pos.x, c.pos.y, BASE.PLAYER_RADIUS + 22, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `hsla(215, 90%, 75%, ${0.6 + 0.3 * pulse})`;
      ctx.font = "bold 14px serif"; ctx.textAlign = "center";
      ctx.fillText("影", c.pos.x, c.pos.y - BASE.PLAYER_RADIUS - 10);
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = 0.85;
      const spd = Math.hypot(c.vel?.x ?? 0, c.vel?.y ?? 0);
      const bob = Math.sin(this.elapsed * (spd > 40 ? 14 : 3) + c.pos.x * 0.01) * (spd > 40 ? 1.6 : 0.7);   // footsteps / breathing
      ctx.translate(c.pos.x, c.pos.y + bob);
      ctx.fillStyle = "hsla(0, 0%, 0%, 0.5)";
      ctx.beginPath();
      ctx.ellipse(0, BASE.PLAYER_RADIUS - 2, BASE.PLAYER_RADIUS, BASE.PLAYER_RADIUS * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.rotate(c.facing);
      ctx.fillStyle = c.hitFlash > 0 ? "hsl(358, 80%, 60%)" : "hsl(220, 40%, 18%)";
      ctx.beginPath();
      ctx.arc(0, 0, BASE.PLAYER_RADIUS, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "hsl(215, 85%, 70%)";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, BASE.PLAYER_RADIUS, 0, Math.PI * 2);
      ctx.stroke();
      // Its katana: held low at rest, raised in the wind-up, swept through a strike.
      const sw = c.swing ?? 0, sd = c.swingDir ?? 1;
      const bladeAng = sw > 0 ? sd * (-1.1 + (1 - sw) * 2.2) : c.mode === "windup" ? -sd * 1.3 : 0.55;
      ctx.save();
      ctx.rotate(bladeAng);
      ctx.strokeStyle = "hsl(210, 30%, 88%)";
      ctx.lineWidth = 3; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(BASE.PLAYER_RADIUS - 4, 0); ctx.lineTo(BASE.PLAYER_RADIUS + (sw > 0 ? 34 : 24), -2); ctx.stroke();
      ctx.fillStyle = "hsl(42, 65%, 50%)";
      ctx.beginPath(); ctx.arc(BASE.PLAYER_RADIUS - 3, 0, 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      ctx.restore();
    }

    // Ally ghosts — wispy crimson/teal orbs trailing motion.
    for (const g of this.allyGhosts) {
      if (g.charge) { this.drawHordeGhost(ctx, g); continue; }
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
    // Phantom afterimages (Kunoichi) — drawn after the player, see render()
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
      const { x, y } = this.beamPos;
      const r = this.ultDivineBeamRadius;
      const col = ctx.createLinearGradient(x - r, 0, x + r, 0);
      col.addColorStop(0, "hsla(180, 80%, 85%, 0)");
      col.addColorStop(0.5, "hsla(55, 100%, 95%, 0.75)");
      col.addColorStop(1, "hsla(180, 80%, 85%, 0)");
      ctx.fillStyle = col;
      ctx.fillRect(x - r, y - 900, r * 2, 900);
      const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, "hsla(60, 100%, 92%, 0.9)");
      grad.addColorStop(1, "hsla(180, 80%, 75%, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "hsla(50, 100%, 80%, 0.8)";
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(x, y, r, this.elapsed * 3, this.elapsed * 3 + 4.5); ctx.stroke();
      ctx.restore();
    }
    // Spear Wall (Ashigaru) — a palisade of spears with war banners at each end.
    if (this.spearWall) {
      const w = this.spearWall;
      const ux = Math.cos(w.ang), uy = Math.sin(w.ang);
      const fade = Math.min(1, w.t / 0.5);
      const rise = Math.min(1, (7 - w.t) / 0.25 + 0.05);   // spears spring up on cast
      const nx = Math.cos(w.ang - Math.PI / 2), ny = Math.sin(w.ang - Math.PI / 2);   // facing out
      const ax = w.x - ux * w.len / 2, ay = w.y - uy * w.len / 2, bx = w.x + ux * w.len / 2, by = w.y + uy * w.len / 2;
      ctx.save();
      ctx.globalAlpha = fade;
      // glowing ground line (danger edge)
      ctx.strokeStyle = "hsla(28, 95%, 58%, 0.35)"; ctx.lineWidth = 14; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
      // wooden rail
      ctx.strokeStyle = "hsl(25, 45%, 30%)"; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
      const n = Math.round(w.len / 20);
      for (let i = 0; i <= n; i++) {
        const k = i / n;
        const sx = ax + (bx - ax) * k, sy = ay + (by - ay) * k;
        const tilt = (i % 2 ? 0.22 : -0.22);
        const dx = nx * Math.cos(tilt) - ny * Math.sin(tilt), dy = nx * Math.sin(tilt) + ny * Math.cos(tilt);
        const L = 46 * rise;
        const tx = sx + dx * L, ty = sy + dy * L;
        ctx.strokeStyle = "hsl(28, 40%, 34%)"; ctx.lineWidth = 3.5;
        ctx.beginPath(); ctx.moveTo(sx - dx * 8, sy - dy * 8); ctx.lineTo(tx, ty); ctx.stroke();
        // steel tip
        ctx.fillStyle = "hsl(210, 15%, 85%)";
        ctx.beginPath();
        ctx.moveTo(tx + dx * 12, ty + dy * 12);
        ctx.lineTo(tx - dy * 4, ty + dx * 4);
        ctx.lineTo(tx + dy * 4, ty - dx * 4);
        ctx.closePath(); ctx.fill();
      }
      // nobori war banners at both ends
      for (const [px, py] of [[ax, ay], [bx, by]]) {
        const sway = Math.sin(this.elapsed * 4 + px) * 4;
        ctx.strokeStyle = "hsl(25, 35%, 22%)"; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, py - 70); ctx.stroke();
        ctx.fillStyle = "hsl(355, 70%, 42%)";
        ctx.beginPath(); ctx.moveTo(px, py - 68); ctx.lineTo(px + 22 + sway, py - 66); ctx.lineTo(px + 20 + sway, py - 24); ctx.lineTo(px, py - 26); ctx.closePath(); ctx.fill();
        ctx.fillStyle = "hsl(45, 80%, 85%)";
        ctx.font = "bold 13px serif"; ctx.textAlign = "center";
        ctx.fillText("槍", px + 11 + sway * 0.5, py - 42);
      }
      ctx.restore();
    }
    // Tidal Surge wave (Kappa)
    if (this.tideWave) {
      const tw = this.tideWave;
      const ux = Math.cos(tw.ang), uy = Math.sin(tw.ang);
      const fx = tw.x + ux * tw.dist, fy = tw.y + uy * tw.dist;
      ctx.save();
      ctx.translate(fx, fy);
      ctx.rotate(tw.ang);
      const g = ctx.createLinearGradient(-60, 0, 14, 0);
      g.addColorStop(0, "hsla(195, 80%, 40%, 0)");
      g.addColorStop(0.7, "hsla(190, 80%, 55%, 0.55)");
      g.addColorStop(1, "hsla(185, 90%, 88%, 0.9)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(-60, -tw.width / 2);
      for (let k = 0; k <= 10; k++) {
        const yy = -tw.width / 2 + (k / 10) * tw.width;
        ctx.lineTo(14 + Math.sin(this.elapsed * 10 + k) * 6, yy);
      }
      ctx.lineTo(-60, tw.width / 2);
      ctx.closePath(); ctx.fill();
      ctx.restore();
    }
    // Blizzard (Yuki-onna)
    if (this.ultBlizzardTimer > 0) {
      ctx.save();
      const { x, y } = this.player.pos;
      ctx.fillStyle = "hsla(200, 70%, 85%, 0.12)";
      ctx.beginPath(); ctx.arc(x, y, 230, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "hsla(195, 80%, 90%, 0.5)";
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 10]);
      ctx.lineDashOffset = -this.elapsed * 40;
      ctx.beginPath(); ctx.arc(x, y, 230, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }
    // Arashi's storm target
    if (this.ultArrowTimer > 0) {
      const a = this.aimPoint();
      ctx.save();
      ctx.strokeStyle = "hsla(200, 80%, 75%, 0.7)";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.beginPath(); ctx.arc(a.x, a.y, 110, 0, Math.PI * 2); ctx.stroke();
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
      // A violet silhouette that echoes your moves half a second late, sword and all.
      const sc = this.shadowClone;
      ctx.save();
      ctx.translate(sc.pos.x, sc.pos.y + Math.sin(this.elapsed * 3) * 0.8);
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = "hsla(260, 60%, 30%, 0.35)";
      ctx.beginPath(); ctx.arc(0, 0, BASE.PLAYER_RADIUS + 7, 0, Math.PI * 2); ctx.fill();
      ctx.rotate(sc.facing);
      const k = sc.attackTimer > 0 ? 1 - sc.attackTimer / 0.5 : 0;   // swing plays as the echo lands
      const ba = sc.attackTimer > 0 && k > 0.6 ? -1 + ((k - 0.6) / 0.4) * 2 : sc.attackTimer > 0 ? -1.2 : 0.5;
      ctx.save(); ctx.rotate(ba);
      ctx.strokeStyle = "hsla(270, 70%, 75%, 0.9)"; ctx.lineWidth = 2.5; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(BASE.PLAYER_RADIUS - 4, 0); ctx.lineTo(BASE.PLAYER_RADIUS + 28, -2); ctx.stroke();
      ctx.restore();
      ctx.fillStyle = "hsl(255, 35%, 12%)";
      ctx.beginPath(); ctx.arc(0, 0, BASE.PLAYER_RADIUS, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "hsla(275, 80%, 65%, 0.8)"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(0, 0, BASE.PLAYER_RADIUS, 0, Math.PI * 2); ctx.stroke();
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
        // Every poison source does damage (Kunoichi's Venom Rhythm used to apply 0 DPS), and it grows a little each wave.
        const baseDps = Math.max(4, this.perks.poisonDps) * (1 + 0.1 * Math.max(0, this.stats.wave - 1));
        const dps = baseDps * this.perks.poisonDmgMul * ramp;
        e.poisonTickAccum += dps * dt;
        if (e.poisonTickAccum >= 1) {
          const tick = Math.floor(e.poisonTickAccum);
          e.poisonTickAccum -= tick;
          e.hp -= tick; this.trackDealt("Poison", tick);
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
          e.hp -= tick; this.trackDealt("Bleed", tick);
          this.spawnFloatText(e.pos, `${tick}`, { color: "hsl(0 95% 55%)", size: 11 });
          if (e.hp <= 0) { this.killEnemy(e, "ghost"); continue; }
        }
      }
      if (e.curseRemaining > 0) e.curseRemaining = Math.max(0, e.curseRemaining - dt);
      if (e.slowRemaining > 0) {
        e.slowRemaining = Math.max(0, e.slowRemaining - dt);
        if (Math.random() < dt * 5) this.fx.frost(e.pos.x, e.pos.y, 1);
      }
      // ===== Phase B — Flame Spear burn DoT (separate from poison) =====
      if (e.burnRemaining > 0) {
        e.burnRemaining = Math.max(0, e.burnRemaining - dt);
        e.burnTickAccum += e.burnDps * this.perks.fireDmgMul * dt;
        if (e.burnTickAccum >= 1) {
          const tick = Math.floor(e.burnTickAccum);
          e.burnTickAccum -= tick;
          e.hp -= tick; this.trackDealt("Burn", tick);
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
        if (Math.random() < dt * 9) this.fx.flame(e.pos.x, e.pos.y + e.size * 0.3, e.size * 0.35);
        // Ember particle drizzle
        if (Math.random() < dt * 4) {
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
    updateUltTrail(this, dt);   // ult visual pass 2
    updateNewClasses(this, dt);   // STEP 5
    this.hawkEyeT = Math.max(0, this.hawkEyeT - dt);
    this.resolveBlossoms();
    if (this.ultBloodRageTimer > 0) this.ultBloodRageTimer = Math.max(0, this.ultBloodRageTimer - dt);
    if (this.ultShadowStepTimer > 0) this.ultShadowStepTimer = Math.max(0, this.ultShadowStepTimer - dt);
    if (this.ultMountainTimer > 0) this.ultMountainTimer = Math.max(0, this.ultMountainTimer - dt);
    if (this.ultThousandCutsTimer > 0) {
      this.ultThousandCutsTimer = Math.max(0, this.ultThousandCutsTimer - dt);
      // Onna spinning AoE: tick damage every 0.1s in radius 120
      this.ultThousandTickAccum += dt;
      if (this.ultThousandTickAccum >= 0.1) {
        this.ultThousandTickAccum = 0;
        this.fx.slash(this.player.pos.x, this.player.pos.y, Math.random() * Math.PI * 2, this.hasUltPerk("ultc_onna") ? 180 : 120, Math.PI * 1.2, Math.random() < 0.5 ? 1 : -1,
          { hue: 330, sat: 75, light: 85, width: 10, life: 0.16, follow: this.player.pos });
        for (const e of this.enemies) {
          if (e.state === "dead") continue;
          const dx = e.pos.x - this.player.pos.x;
          const dy = e.pos.y - this.player.pos.y;
          if (Math.hypot(dx, dy) <= (this.hasUltPerk("ultc_onna") ? 180 : 120) + e.size) {
            this.dealDamage(e, this.ultDmg(2), Math.atan2(dy, dx), 30);
          }
        }
      }
    }
    if (this.kabukiHealCd > 0) this.kabukiHealCd = Math.max(0, this.kabukiHealCd - dt);
    if (this.perks.foxCompanion) {
      this.foxTimer -= dt;
      if (this.foxTimer <= 0 && this.enemies.some(o => o.state !== "dead")) {
        this.foxTimer = 4;
        this.spawnFoxfire(this.player.pos.x, this.player.pos.y, this.perks.damage * 1.5 + 2, undefined, "Fox companion");
      }
    }
    if (this.ultFinaleTimer > 0) {
      this.ultFinaleTimer = Math.max(0, this.ultFinaleTimer - dt);
      if (Math.random() < dt * 14) {
        const a = Math.random() * Math.PI * 2;
        this.fx.burst(this.player.pos.x + Math.cos(a) * 30, this.player.pos.y + Math.sin(a) * 30,
          { count: 1, hue: 335 + Math.random() * 40, light: 75, speed: 120, life: 0.4 });
      }
    }
    if (this.ultWindTimer > 0) {
      this.ultWindTimer = Math.max(0, this.ultWindTimer - dt);
      if (Math.random() < dt * 14) {
        this.fx.burst(this.player.pos.x, this.player.pos.y, { count: 1, hue: 140, sat: 40, light: 88, speed: 60, life: 0.3 });
      }
    }
    if (this.ultPrayerTimer > 0) {
      this.ultPrayerTimer = Math.max(0, this.ultPrayerTimer - dt);
      this.ultPrayerTick -= dt;
      if (this.ultPrayerTick <= 0) {
        this.ultPrayerTick = 0.5;
        const p = this.player;
        this.healPlayer(p.maxHp * (this.hasUltPerk("ultc_sohei") ? 0.08 : 0.05));
        this.fx.enso(p.pos.x, p.pos.y, 120, 42, { life: 0.5, width: 5, follow: p.pos });
        for (const e of this.enemies) {
          if (e.state === "dead") continue;
          const dx = e.pos.x - p.pos.x, dy = e.pos.y - p.pos.y, d = Math.hypot(dx, dy);
          if (d > (this.hasUltPerk("ultc_sohei") ? 200 : 140) + e.size) continue;
          this.dealDamage(e, this.ultDmg(3), Math.atan2(dy, dx), e.isBoss ? 40 : 260);
        }
      }
    }
    if (this.ultArrowTimer > 0) {
      this.ultArrowTimer = Math.max(0, this.ultArrowTimer - dt);
      this.ultArrowTick -= dt;
      while (this.ultArrowTick <= 0) {
        this.ultArrowTick += 0.07;
        const aim = this.aimPoint();
        const a = Math.random() * Math.PI * 2, d = Math.sqrt(Math.random()) * (this.hasUltPerk("ultc_arashi") ? 160 : 110);
        const tx = aim.x + Math.cos(a) * d;
        const ty = aim.y + Math.sin(a) * d;
        this.fx.streakLine(tx + 50, ty - 230, tx, ty, 200, 92, 3, 0.18);
        this.fx.burst(tx, ty, { count: 2, hue: 200, light: 85, speed: 120, life: 0.15 });
        for (const e of this.enemies) {
          if (e.state === "dead" || Math.hypot(e.pos.x - tx, e.pos.y - ty) > 34 + e.size) continue;
          this.dealDamage(e, this.ultDmg(7), Math.PI / 2, 20);
          e.slowRemaining = Math.max(e.slowRemaining, 2);
        }
      }
    }
    if (this.ultThunderTimer > 0) {
      this.ultThunderTimer = Math.max(0, this.ultThunderTimer - dt);
      this.thunderCd = Math.max(0, this.thunderCd - dt);
      if (Math.random() < dt * 10) {
        const a = Math.random() * Math.PI * 2;
        this.fx.burst(this.player.pos.x + Math.cos(a) * 16, this.player.pos.y + Math.sin(a) * 16, { count: 1, hue: 205, light: 85, speed: 90, life: 0.2 });
      }
    }
    if (this.roninDebt) {
      this.roninDebt.t -= dt;
      if (this.roninDebt.t <= 0) {
        for (const id of this.roninDebt.ids) {
          const e = this.enemies.find(o => o.id === id && o.state !== "dead");
          if (!e) continue;
          this.fx.slash(e.pos.x, e.pos.y, Math.PI * 0.25, e.size + 30, Math.PI * 0.6, 1, { hue: 358, sat: 85, light: 70, width: 10, life: 0.4 });
          this.fx.slash(e.pos.x, e.pos.y, Math.PI * 0.75, e.size + 30, Math.PI * 0.6, -1, { hue: 358, sat: 85, light: 70, width: 10, life: 0.4 });
          this.fx.glow(e.pos.x, e.pos.y, 80, 358, 90, 50, 0.3);
          this.dealDamage(e, this.ultDmg(this.roninDebt.dmg), -Math.PI / 2, 60);
        }
        this.hitstop = Math.max(this.hitstop, 0.1);
        this.cameraShake = Math.max(this.cameraShake, 0.5);
        audio.play("executeThud");
        this.roninDebt = null;
      }
    }
    if (this.ultBlizzardTimer > 0) {
      this.ultBlizzardTimer = Math.max(0, this.ultBlizzardTimer - dt);
      const R = this.hasUltPerk("ultc_yukionna") ? 320 : 230;
      for (const e of this.enemies) {
        if (e.state === "dead") continue;
        if (Math.hypot(e.pos.x - this.player.pos.x, e.pos.y - this.player.pos.y) > R + e.size) { e.chill = 0; continue; }
        e.slowRemaining = Math.max(e.slowRemaining, 1.5);
        e.chill = (e.chill ?? 0) + dt;
        if (e.chill >= 1.2) {
          e.chill = -1.5;
          e.stunTimer = Math.max(e.stunTimer, e.isBoss ? 0.8 : 2.5);
          if (this.hasUltPerk("ultc_yukionna")) this.dealDamage(e, this.ultDmg(8), 0, 0);
          this.fx.frost(e.pos.x, e.pos.y, 6);
        }
      }
      for (let i = 0; i < 3; i++) {
        const a = Math.random() * Math.PI * 2, d = Math.random() * R;
        this.fx.frost(this.player.pos.x + Math.cos(a) * d, this.player.pos.y + Math.sin(a) * d, 1);
      }
    }
    if (this.spearWall) {
      const w = this.spearWall;
      w.t -= dt;
      w.tick -= dt;
      const ux = Math.cos(w.ang), uy = Math.sin(w.ang);
      const nx = -uy, ny = ux;
      const sideOf = (x: number, y: number) => (x - w.x) * nx + (y - w.y) * ny;
      const playerSide = Math.sign(sideOf(this.player.pos.x, this.player.pos.y)) || 1;
      for (const e of this.enemies) {
        if (e.state === "dead") continue;
        const along = (e.pos.x - w.x) * ux + (e.pos.y - w.y) * uy;
        if (Math.abs(along) > w.len / 2) continue;
        const side = sideOf(e.pos.x, e.pos.y);
        if (Math.abs(side) > e.size + 14) continue;
        // Shove foes back to the far side of the wall.
        const push = -playerSide * (e.size + 16) - side;
        e.pos.x += nx * push; e.pos.y += ny * push;
        if (w.tick <= 0) {
          this.dealDamage(e, this.ultDmg(6), Math.atan2(-playerSide * ny, -playerSide * nx), e.isBoss ? 20 : 140);
          e.burnRemaining = Math.max(e.burnRemaining, 2);
          e.burnDps = Math.max(e.burnDps, 4);
        }
      }
      if (w.tick <= 0) w.tick = 0.35;
      for (const ep of this.enemyProjectiles) {
        const along = (ep.pos.x - w.x) * ux + (ep.pos.y - w.y) * uy;
        if (Math.abs(along) <= w.len / 2 && Math.abs(sideOf(ep.pos.x, ep.pos.y)) < 14) {
          ep.life = 0;
          this.spawnSpark(ep.pos);
        }
      }
      if (w.t <= 0) this.spearWall = null;
    }
    if (this.tideWave) {
      const tw = this.tideWave;
      const step = 520 * dt;
      tw.dist += step;
      const ux = Math.cos(tw.ang), uy = Math.sin(tw.ang);
      const fx = tw.x + ux * tw.dist, fy = tw.y + uy * tw.dist;
      for (const e of this.enemies) {
        if (e.state === "dead") continue;
        const rx = e.pos.x - tw.x, ry = e.pos.y - tw.y;
        const along = rx * ux + ry * uy;
        const perp = Math.abs(-rx * uy + ry * ux);
        if (perp > tw.width / 2 || along < tw.dist - 40 || along > tw.dist + 20) continue;
        if (!tw.carried.has(e.id)) { tw.carried.add(e.id); this.dealDamage(e, this.ultDmg(6), tw.ang, 0); }
        if (!e.isBoss) { e.pos.x += ux * step; e.pos.y += uy * step; }
        e.stunTimer = Math.max(e.stunTimer, 0.15);
      }
      if (Math.random() < 0.8) this.fx.burst(fx + (Math.random() - 0.5) * -uy * tw.width, fy + (Math.random() - 0.5) * ux * tw.width, { count: 2, hue: 190, light: 82, speed: 140, dir: tw.ang, spread: 1, life: 0.35 });
      if (tw.dist >= tw.max || fx < 0 || fy < 0 || fx > this.worldW || fy > this.worldH) {
        for (const id of tw.carried) {
          const e = this.enemies.find(o => o.id === id && o.state !== "dead");
          if (!e) continue;
          this.dealDamage(e, this.ultDmg(10) * (this.hasUltPerk("ultc_kappa") ? 2 : 1), tw.ang, 80);
          e.slowRemaining = Math.max(e.slowRemaining, 4);
        }
        this.fx.smoke(fx, fy, 10, 120, 70, 190, 55);
        this.tideWave = null;
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
        this.ultShadowConsumeTimer <= 0 &&
        this.ultThunderTimer <= 0 &&
        this.ultPrayerTimer <= 0 &&
        this.ultArrowTimer <= 0 &&
        this.ultBlizzardTimer <= 0 &&
        !this.spearWall &&
        !this.tideWave &&
        !this.roninDebt &&
        this.ultWindTimer <= 0 &&
        this.ultFinaleTimer <= 0 &&
        !newUltActive(this)) {   // STEP 5
      this.stats.ultActive = false;
      if (this.hasUltPerk("ult_after_l")) this.ultAftershock();   // ULTPERK Aftershock
      if (this.stats.ultCharge >= this.stats.ultMax) this.stats.ultReady = true;
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
      const R = this.hasUltPerk("ultc_onmyoji") ? 380 : 280;
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
            this.dealDamage(e, this.ultDmg(4), Math.atan2(e.pos.y - cy, e.pos.x - cx), 0);
            if (before > 0 && e.hp <= 0) {
              for (const o of this.enemies) {
                if (o === e || o.state === "dead") continue;
                if (Math.hypot(o.pos.x - e.pos.x, o.pos.y - e.pos.y) <= 110) {
                  this.dealDamage(o, this.ultDmg(8), Math.atan2(o.pos.y - e.pos.y, o.pos.x - e.pos.x), 60);
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
      if (this.hasUltPerk("ultc_hatamoto") && Math.hypot(this.player.pos.x - this.ultBannerPos.x, this.player.pos.y - this.ultBannerPos.y) <= 260) this.healPlayer(2 * dt);
      if (this.ultBannerTimer <= 0) this.ultBannerActive = false;
    }

    // Kunoichi: Phantom Dance
    if (this.ultPhantomTimer > 0) {
      this.ultPhantomTimer = Math.max(0, this.ultPhantomTimer - dt);
      this.updatePhantomDance(dt);
      if (this.ultPhantomTimer <= 0) {
        this.ultPhantomImages = [];
        this.player.invuln = Math.max(this.player.invuln, 1.5);
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
          this.dealDamage(e, this.ultDmg(14), this.ultEarthshakerDir, 480 * this.perks.knockbackMul);
          if (e.hp > 0 && !e.isBoss) {
            e.launched = true;
            e.launchTimer = 0.9;
            e.launchHeight = 0;
            e.launchDamage = this.ultDmg(6);
          }
        }
      }
      const atWall = this.player.pos.x <= 25 || this.player.pos.x >= this.worldW - 25 ||
                     this.player.pos.y <= 25 || this.player.pos.y >= this.worldH - 25;
      if (atWall || this.ultEarthshakerTimer <= 0) {
        this.ultEarthshakerTimer = 0;
        this.shockwaves.push({
          pos: { x: this.player.pos.x, y: this.player.pos.y },
          radius: 0, maxRadius: 520, life: 0.8, damage: this.ultDmg(16), hitSet: new Set(),
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
            this.dealDamage(e, this.ultDmg(2), 0, 0);
          } else {
            e.webbedRemaining = Math.max(e.webbedRemaining, 0.6);
            e.stunTimer = Math.max(e.stunTimer, 0.5);
            const before = e.hp;
            this.dealDamage(e, this.ultDmg(3), 0, 0);
            if (this.hasUltPerk("ultc_tsuchigumo")) { e.poisonRemaining = Math.min(8, e.poisonRemaining + 1); if (this.perks.poisonDps <= 0) this.perks.poisonDps = 4; }
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
      this.ultDivineBeamRadius = this.hasUltPerk("ultc_miko") ? 110 : 70;
      // The pillar glides toward wherever you're aiming.
      const aim = this.aimPoint();
      const k = Math.min(1, dt * 4);
      this.beamPos.x += (aim.x - this.beamPos.x) * k;
      this.beamPos.y += (aim.y - this.beamPos.y) * k;
      this.ultDivineBeamTick += dt;
      if (this.ultDivineBeamTick >= 0.15) {
        this.ultDivineBeamTick = 0;
        for (const e of this.enemies) {
          if (e.state === "dead") continue;
          const d = Math.hypot(e.pos.x - this.beamPos.x, e.pos.y - this.beamPos.y);
          if (d <= this.ultDivineBeamRadius + e.size) {
            this.dealDamage(e, this.ultDmg(5), 0, 0);
            e.disarmedRemaining = Math.max(e.disarmedRemaining, 3);
            if (!this.ultDivineBeamHit.has(e.id)) {
              this.ultDivineBeamHit.add(e.id);
              this.healPlayer(4);
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
      if (prev > 0 && this.ultShadowConsumeTimer <= 0 && this.hasUltPerk("ultc_kagebushi")) {   // ULTPERK Abyss
        const p = this.player.pos;
        for (const e of this.enemies) {
          if (e.state === "dead" || Math.hypot(e.pos.x - p.x, e.pos.y - p.y) > 260 + e.size) continue;
          this.dealDamage(e, this.ultDmg(20), Math.atan2(e.pos.y - p.y, e.pos.x - p.x), e.isBoss ? 40 : 240);
        }
        this.fx.shockwave(p.x, p.y, 260, { hue: 255, light: 40, life: 0.5, width: 14, lines: 14 });
        this.cameraShake = Math.max(this.cameraShake, 0.6);
      }
      if (prev > 0 && this.ultShadowConsumeTimer <= 0) {
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
      if (g.charge) {
        if ((g.delay ?? 0) > 0) { g.delay! -= dt; g.life += dt; continue; }   // rising, waiting for the charge
        const sp = Math.hypot(g.vel.x, g.vel.y), ns = Math.min(700, sp + 1500 * dt);
        g.vel.x *= ns / sp; g.vel.y *= ns / sp;
      }
      if (g.homing) {
        let best: Enemy | null = null;
        let bestD = 520;
        for (const e of this.enemies) {
          if (e.state === "dead" || g.hitSet.has(e.id)) continue;
          const d = Math.hypot(e.pos.x - g.pos.x, e.pos.y - g.pos.y);
          if (d < bestD) { bestD = d; best = e; }
        }
        if (best) {
          const want = Math.atan2(best.pos.y - g.pos.y, best.pos.x - g.pos.x);
          const sp = Math.hypot(g.vel.x, g.vel.y) || 300;
          const cur = Math.atan2(g.vel.y, g.vel.x);
          let diff = want - cur;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          const turn = cur + Math.max(-7 * dt, Math.min(7 * dt, diff));
          g.vel.x = Math.cos(turn) * sp;
          g.vel.y = Math.sin(turn) * sp;
        }
      }
      g.pos.x += g.vel.x * dt;
      g.pos.y += g.vel.y * dt;
      for (const e of this.enemies) {
        if (e.state === "dead" || g.hitSet.has(e.id)) continue;
        if (Math.hypot(e.pos.x - g.pos.x, e.pos.y - g.pos.y) <= e.size + g.size) {
          g.hitSet.add(e.id);
          if (g.label) this.dmgSrcOverride = g.label;
          else if (g.fromUlt) this.dmgSrcOverride = "Ultimate";
          this.dealDamage(e, g.damage, Math.atan2(e.pos.y - g.pos.y, e.pos.x - g.pos.x), 30);
          this.dmgSrcOverride = null;
          if (g.curse) e.curseRemaining = Math.max(e.curseRemaining, 6);
          if (g.burn) { e.burnRemaining = Math.max(e.burnRemaining, 4); e.burnDps = Math.max(e.burnDps, 5); }
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
            this.applyEnemyHit(null, sw.damage, "boss shockwave");
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

    // Kagemusha clones (ult) — fight like a second swordsman: steer with momentum,
    // pick a target near you, wind up → lunge → recover, circle between swings,
    // sidestep enemy wind-ups, and fall back to your side when nothing's close.
    this.clones.forEach((c, ci) => this.updateClone(c, ci, dt));
    // Explode any clones whose life ran out (or were "destroyed")
    for (const c of this.clones) {
      if (c.life <= 0) {
        for (const e of this.enemies) {
          if (e.state === "dead") continue;
          const d = Math.hypot(e.pos.x - c.pos.x, e.pos.y - c.pos.y);
          if (d < 120) {
            this.dmgSrcOverride = "Ultimate"; this.dealDamage(e, this.ultDmgRaw(20), Math.atan2(e.pos.y - c.pos.y, e.pos.x - c.pos.x), 80); this.dmgSrcOverride = null;   // clone burst
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
        const debtTargets = this.enemies
          .filter(o => o.state !== "dead" && Math.hypot(o.pos.x - this.player.pos.x, o.pos.y - this.player.pos.y) <= 600)
          .sort((a, b) => Math.hypot(a.pos.x - this.player.pos.x, a.pos.y - this.player.pos.y) - Math.hypot(b.pos.x - this.player.pos.x, b.pos.y - this.player.pos.y))
          .slice(0, 8);
        for (const e of debtTargets) {
          const dx = e.pos.x - this.player.pos.x;
          const dy = e.pos.y - this.player.pos.y;
          this.fx.slash(e.pos.x, e.pos.y, Math.random() * Math.PI * 2, e.size + 16, Math.PI * 0.7, 1, { hue: 0, sat: 85, light: 70, width: 6, life: 0.18 });
          this.dealDamage(e, 8 * this.ultRoninMul, Math.atan2(dy, dx), 40);
        }
        this.spawnBlood(this.player.pos, Math.random() * Math.PI * 2, 6);
        this.cameraShake = Math.max(this.cameraShake, 0.3);
        if (this.ultRoninRemaining === 0) this.ultRoninMul = 1;
      }
    }
  }

  /** Dokkaebi horde ghost: a horned goblin spirit with a smoky tail, leaning into its charge. */
  private drawHordeGhost(ctx: CanvasRenderingContext2D, g: AllyGhost) {
    const t = this.elapsed + (g.seed ?? 0);
    const rising = Math.max(0, g.delay ?? 0);
    const fadeIn = 1 - Math.min(1, rising / 0.35);
    const a = Math.min(1, g.life / 0.4) * (0.35 + 0.65 * fadeIn);
    const ang = Math.atan2(g.vel.y, g.vel.x);
    const S = g.size * (0.6 + 0.4 * fadeIn);
    ctx.save();
    ctx.translate(g.pos.x, g.pos.y - 6 * (1 - fadeIn));
    // smoky trail of afterimages behind it
    ctx.globalCompositeOperation = "lighter";
    const sp = Math.hypot(g.vel.x, g.vel.y);
    for (let k = 4; k >= 1; k--) {
      const d = k * (8 + sp * 0.03);
      ctx.fillStyle = `hsla(${175 + k * 6}, 80%, 55%, ${a * 0.12 * (5 - k) / 4})`;
      ctx.beginPath(); ctx.ellipse(-Math.cos(ang) * d, -Math.sin(ang) * d, S * (1 - k * 0.12), S * 0.7 * (1 - k * 0.12), ang, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalCompositeOperation = "source-over";
    ctx.rotate(ang);
    const wob = Math.sin(t * 18) * 0.08;
    // body: a teardrop with a ragged tail
    const grad = ctx.createRadialGradient(S * 0.25, 0, 0, 0, 0, S * 1.2);
    grad.addColorStop(0, `hsla(170, 90%, 85%, ${a})`);
    grad.addColorStop(0.55, `hsla(185, 75%, 50%, ${a * 0.85})`);
    grad.addColorStop(1, `hsla(205, 70%, 25%, 0)`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(S * 0.9, 0);
    ctx.quadraticCurveTo(S * 0.8, -S * 0.75, 0, -S * 0.7);
    for (let i = 0; i <= 4; i++) {   // ragged tail flames
      const tx = -S * (0.9 + 0.55 * ((i % 2) ? 0.6 : 1)) , ty = -S * 0.7 + (S * 1.4 * i) / 4;
      ctx.lineTo(tx + Math.sin(t * 14 + i) * 3, ty);
    }
    ctx.lineTo(0, S * 0.7);
    ctx.quadraticCurveTo(S * 0.8, S * 0.75, S * 0.9, 0);
    ctx.fill();
    // horns
    ctx.fillStyle = `hsla(45, 70%, 80%, ${a})`;
    for (const sd of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(S * 0.35, sd * S * 0.45);
      ctx.quadraticCurveTo(S * 0.55, sd * S * (0.95 + wob), S * 0.05, sd * S * 1.05);
      ctx.lineTo(S * 0.2, sd * S * 0.5);
      ctx.fill();
    }
    // grinning face: glowing eyes and a jagged mouth
    ctx.fillStyle = `hsla(50, 100%, 70%, ${a})`;
    for (const sd of [-1, 1]) { ctx.beginPath(); ctx.ellipse(S * 0.45, sd * S * 0.22, S * 0.11, S * 0.07, 0, 0, Math.PI * 2); ctx.fill(); }
    ctx.strokeStyle = `hsla(200, 60%, 12%, ${a})`; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(S * 0.68, -S * 0.2);
    for (let i = 1; i <= 4; i++) ctx.lineTo(S * (0.68 + (i % 2 ? 0.08 : 0)), -S * 0.2 + (S * 0.4 * i) / 4);
    ctx.stroke();
    ctx.restore();
  }

  spawnFoxfire(x: number, y: number, damage: number, ang = Math.random() * Math.PI * 2, label?: string) {
    this.allyGhosts.push({
      pos: { x, y },
      vel: { x: Math.cos(ang) * 340, y: Math.sin(ang) * 340 },
      life: 2.2, maxLife: 2.2,
      damage,
      hitSet: new Set(),
      curse: false,
      fromUlt: this.dmgSrc === "Ultimate",
      label,
      size: 13,
      homing: true,
      burn: true,
    });
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
  abilityFx(id: string) {
    if (!this.player) return;
    const info = ABILITY_POOL.find(a => a.id === id);
    const kanji = info?.kanji ?? (id === "fireball" ? "炎" : id === "lightning" ? "雷" : "技");
    const hue = ABILITY_FX_HUE[id] ?? 40;
    const p = this.player;
    const { x, y } = p.pos;
    const fwd = (d: number) => ({ x: x + Math.cos(p.facing) * d, y: y + Math.sin(p.facing) * d });
    this.fx.seal(x, y - 44, kanji, hue, 26, 0.7, p.pos);
    const POSE: Record<string, number> = {
      timeslow: 0.7, death_mark: 0.45, soul_rend: 0.55, war_horn: 0.7, smoke_bomb: 0.4,
      execution: 0.45, fireball: 0.4, lightning: 0.45, phantom_slash: 0.45, deflect: 0,
    };
    if (POSE[id]) this.abilityPose = { id, t: 0, dur: POSE[id] };
    switch (id) {
      case "barrage": {
        // Golden storm of ghost blades fanning forward.
        const f = fwd(40);
        this.fx.burst(f.x, f.y, { count: 14, hue: 45, light: 80, speed: 380, dir: p.facing, spread: 1.4, life: 0.35 });
        this.fx.glow(f.x, f.y, 60, 45, 90, 70, 0.25);
        break;
      }
      case "flash":
        this.fx.glow(x, y, 50, 200, 90, 80, 0.2);
        break;
      case "whirlwind":
        this.fx.enso(x, y, 70, 330, { life: 0.9, width: 6, light: 72, follow: p.pos });
        this.fx.smoke(x, y, 8, 60, 70, 330, 25);
        break;
      case "timeslow":
        this.fx.glow(x, y, 120, 210, 80, 75, 0.5);
        break;
      case "bladestorm":
        this.fx.enso(x, y, 85, 0, { life: 1.2, width: 8, light: 55, follow: p.pos });
        this.fx.ground(x, y, 110, 358, 1.4);
        break;
      case "phantom_slash": {
        const f = fwd(24);
        this.fx.glow(f.x, f.y, 70, 358, 90, 60, 0.3);
        break;
      }
      case "death_mark":
      case "soul_rend": {
        const f = fwd(18);
        this.fx.burst(f.x, f.y, { count: 10, hue, light: 60, speed: 160, life: 0.45 });
        break;
      }
      case "deflect":
        this.fx.enso(x, y, 30, 45, { life: 0.5, width: 4, light: 75, follow: p.pos });
        break;
      case "smoke_bomb":
        break;
      case "war_horn": {
        const f = fwd(16);
        this.fx.burst(f.x, f.y, { count: 12, hue: 42, light: 75, speed: 260, dir: p.facing, spread: 1.2, life: 0.4 });
        break;
      }
      case "execution":
        this.fx.glow(x, y, 70, 358, 95, 45, 0.35);
        break;
      case "fireball":
        this.fx.flames2(fwd(26).x, fwd(26).y, 8, 10);
        break;
      case "lightning": {
        const f = fwd(20);
        this.fx.bolt(f.x, f.y - 140, f.x, f.y, 52, 0.2);
        break;
      }
      default:
        this.fx.abilityCast(x, y, kanji, hue, p.pos);
    }
  }

  // Freeze-frame ultimate cutscene: the class motif, the character in their
  // signature pose holding their real weapon, then the strike.
  drawUltCutscene(ctx: CanvasRenderingContext2D, W: number, H: number) {
    const cs = this.ultCutscene!;
    const k = Math.min(1, cs.t / cs.dur);
    const cid = this.stats.classId;
    const style = ULT_STYLES[cid];
    const cls = getClass(cid);
    const hue = hueOf(cls.accent);
    const easeOut = (v: number) => 1 - Math.pow(1 - v, 3);
    const vis = Math.min(1, k / 0.1) * (k > 0.86 ? 1 - (k - 0.86) / 0.14 : 1);
    const cx = W * 0.27, cy = H * 0.56;
    ctx.save();
    ctx.globalAlpha = vis;
    ctx.fillStyle = "rgba(6, 5, 4, 0.74)";
    ctx.fillRect(0, 0, W, H);
    const bg = ctx.createRadialGradient(cx, cy, 10, cx, cy, Math.max(W, H) * 0.7);
    bg.addColorStop(0, `hsla(${hue}, 60%, 30%, 0.55)`);
    bg.addColorStop(1, `hsla(${hue}, 60%, 8%, 0)`);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
    drawMotif(ctx, style.motif, W, H, k, hue, cx, cy);

    // Character, sliding in, performing the pose.
    const S = Math.min(W, H) / 150;
    const f = poseFrame(style.pose, k);
    const slide = (1 - easeOut(Math.min(1, k / 0.22))) * -W * 0.35;
    if (style.motif === "mirror") {
      for (const off of [-1, 1]) {
        ctx.save(); ctx.globalAlpha = vis * 0.3;
        this.drawCutsceneCharacter(ctx, cx + slide + f.dx * S + off * 22 * S, cy + f.dy * S, S * 0.92, f, hue, style.pose);
        ctx.restore();
      }
    }
    this.drawCutsceneCharacter(ctx, cx + slide + f.dx * S, cy + f.dy * S, S, f, hue, style.pose);

    // Strike flash
    if (k >= STRIKE && k < STRIKE + 0.09) {
      ctx.fillStyle = `hsla(${hue}, 60%, 95%, ${(1 - (k - STRIKE) / 0.09) * 0.7})`;
      ctx.fillRect(0, 0, W, H);
    }
    // Letterbox
    const bar = H * 0.1 * Math.min(1, k / 0.12);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, W, bar);
    ctx.fillRect(0, H - bar, W, bar);

    // Title block
    const tk = Math.max(0, Math.min(1, (k - 0.16) / 0.14));
    const tx = W * 0.57;
    ctx.globalAlpha = vis * tk;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    const big = Math.min(130, H * 0.2);
    ctx.font = `900 ${big * (1.5 - tk * 0.5)}px "Hiragino Mincho ProN","Yu Mincho","Noto Serif JP",serif`;
    ctx.lineWidth = 10;
    ctx.strokeStyle = "rgba(0,0,0,0.85)";
    ctx.strokeText(cls.ultKanji, tx, H * 0.4);
    ctx.fillStyle = `hsl(${hue}, 90%, 72%)`;
    ctx.fillText(cls.ultKanji, tx, H * 0.4);
    ctx.font = `600 ${Math.min(13, H * 0.02)}px system-ui, sans-serif`;
    ctx.lineWidth = 3;
    ctx.strokeText(`${cls.name.toUpperCase()} · ULTIMATE`, tx + 4, H * 0.4 + big * 0.62);
    ctx.fillStyle = `hsl(${hue}, 80%, 72%)`;
    ctx.fillText(`${cls.name.toUpperCase()} · ULTIMATE`, tx + 4, H * 0.4 + big * 0.62);
    // Shrink the title until it fits between the title column and the screen edge.
    let nameSize = Math.min(40, H * 0.055);
    ctx.font = `700 ${nameSize}px "Hiragino Mincho ProN","Yu Mincho",Georgia,serif`;
    while (nameSize > 14 && ctx.measureText(cls.ultName.toUpperCase()).width > W - tx - 18) {
      nameSize -= 2;
      ctx.font = `700 ${nameSize}px "Hiragino Mincho ProN","Yu Mincho",Georgia,serif`;
    }
    ctx.lineWidth = 6;
    ctx.strokeText(cls.ultName.toUpperCase(), tx, H * 0.4 + big * 0.62 + 34);
    ctx.fillStyle = "#f3ead2";
    ctx.fillText(cls.ultName.toUpperCase(), tx, H * 0.4 + big * 0.62 + 34);
    const lk = Math.max(0, Math.min(1, (k - 0.32) / 0.15));
    ctx.globalAlpha = vis * lk;
    let quoteSize = Math.min(18, H * 0.028);
    ctx.font = `italic 500 ${quoteSize}px Georgia, serif`;
    while (quoteSize > 10 && ctx.measureText(`“${style.line}”`).width > W - tx - 18) {
      quoteSize -= 1;
      ctx.font = `italic 500 ${quoteSize}px Georgia, serif`;
    }
    ctx.lineWidth = 4;
    ctx.strokeStyle = "rgba(0,0,0,0.85)";
    ctx.strokeText(`“${style.line}”`, tx, H * 0.4 + big * 0.62 + 72);
    ctx.fillStyle = "hsla(36, 30%, 90%, 0.95)";
    ctx.fillText(`“${style.line}”`, tx, H * 0.4 + big * 0.62 + 72);
    if (k > 0.3) {
      ctx.globalAlpha = vis * 0.6;
      ctx.font = `500 11px system-ui, sans-serif`;
      ctx.fillText("Attack or ultimate key to skip", W - 210, H - bar - 14);
    }
    ctx.restore();
  }

  private drawCutsceneCharacter(ctx: CanvasRenderingContext2D, x: number, y: number, S: number, f: { ang: number; squash: number; glow: number }, hue: number, pose: string) {
    if (this.useSprites && spritesReady()) {   // the real character performing its ult move, big
      const id = classChar(this.stats.classId);
      let anim = `Ult_${pose}` as SprAnim;
      if (!hasAnim(id, anim)) anim = "Attack_1";
      const k = this.ultCutscene ? Math.min(1, this.ultCutscene.t / this.ultCutscene.dur) : 1;
      const n = frameCount(id, anim);
      const fr = Math.min(n - 1, (k / 0.8) * n);   // finish the move a little before the banner fades
      ctx.save();
      ctx.fillStyle = "rgba(0,0,0,0.45)";
      ctx.beginPath(); ctx.ellipse(x + 2 * S, y + 13 * S, 15 * S, 5 * S, 0, 0, Math.PI * 2); ctx.fill();
      ctx.translate(x, y + 13 * S);
      drawChar(ctx, id, anim, { frame: fr, loop: false, height: S * 46,
        outline: { color: `hsl(${hue}, 95%, 66%)`, alpha: 0.35 + f.glow * 0.6, width: 3 },
        dye: this.look ? lookDye(this.look) : undefined, layers: this.look ? spriteLayers(this.look, this.elapsed, 0.4, "side") : undefined });
      ctx.restore();
      return;
    }
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(S, S * f.squash);
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.beginPath(); ctx.ellipse(2, 13, 15, 5, 0, 0, Math.PI * 2); ctx.fill();
    // Weapon behind/through the body depending on angle.
    ctx.save();
    ctx.rotate(f.ang);
    const held = this.stats.secondaryIds[this.stats.secondaryActiveSlot];
    const ranged = held && held !== "katana" && !isMeleeSecondary(held);
    const melee = this.abilityWeapon();
    if (pose === "aim" && ranged) this.drawRangedWeapon(held!);
    else if (melee === "twin_sai") { this.drawSai(1); ctx.rotate(0.5); this.drawSai(0.4); }
    else if (melee === "flame_spear") this.drawSpear(10);
    else this.drawPlayerWeapon(melee, true, 58);
    ctx.restore();
    // Body: dark lacquer armour with the class colour on the sash.
    ctx.fillStyle = "hsl(0, 0%, 9%)";
    ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = `hsl(${hue}, 75%, 55%)`;
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(0, 0, 12.5, Math.PI * 0.55, Math.PI * 1.45); ctx.stroke();
    ctx.strokeStyle = "hsl(358, 78%, 48%)";
    ctx.beginPath(); ctx.arc(0, 0, 13, -Math.PI / 4, Math.PI / 4); ctx.stroke();
    ctx.fillStyle = "hsl(36, 30%, 88%)";
    ctx.beginPath(); ctx.arc(7, -1, 2.6, 0, Math.PI * 2); ctx.fill();
    if (f.glow > 0) {
      const g = ctx.createRadialGradient(13, 8, 0, 13, 8, 6 + f.glow * 16);
      g.addColorStop(0, `hsla(${hue}, 100%, 88%, ${0.95 * f.glow})`);
      g.addColorStop(1, `hsla(${hue}, 100%, 55%, 0)`);
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(13, 8, 6 + f.glow * 16, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  // Short character poses for abilities that aren't sword swings.
  private drawAbilityPose(pose: { id: string; t: number; dur: number }, weaponId: SecondaryId | null, range: number) {
    const ctx = this.ctx;
    const k = pose.t / pose.dur;              // 0 → 1
    const rise = Math.sin(Math.min(1, k * 2.2) * Math.PI / 2) * (1 - Math.max(0, (k - 0.7) / 0.3));
    const hue = ABILITY_FX_HUE[pose.id] ?? 40;
    const orb = (ox: number, oy: number, r: number) => {
      const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, r);
      g.addColorStop(0, `hsla(${hue}, 100%, 85%, ${0.9 * rise})`);
      g.addColorStop(1, `hsla(${hue}, 100%, 55%, 0)`);
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(ox, oy, r, 0, Math.PI * 2); ctx.fill();
    };
    const drawHeld = (swinging: boolean) => {
      if (weaponId === "twin_sai") this.drawSai(swinging ? 1 : 0);
      else if (weaponId === "flame_spear") this.drawSpear(swinging ? 20 : 0);
      else this.drawPlayerWeapon(weaponId, swinging, range);
    };
    switch (pose.id) {
      case "war_horn": {
        // Conch horn raised to the lips.
        ctx.save();
        ctx.translate(12 + rise * 4, -6);
        ctx.rotate(-0.4);
        ctx.fillStyle = "hsl(36, 50%, 85%)";
        ctx.beginPath();
        ctx.moveTo(0, -3); ctx.quadraticCurveTo(14, -12, 20, -2); ctx.quadraticCurveTo(14, 10, 0, 3); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = "hsl(20, 40%, 50%)";
        ctx.lineWidth = 1;
        for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.arc(14, -1, i * 2.2, -1, 1.2); ctx.stroke(); }
        ctx.restore();
        orb(30, -8, 22 * rise);
        break;
      }
      case "smoke_bomb": {
        // Overhand throw: arm whips forward.
        ctx.save();
        ctx.rotate(-1.4 + k * 2.2);
        ctx.translate(14, 0);
        if (k < 0.5) {
          ctx.fillStyle = "hsl(0, 0%, 12%)";
          ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
        ctx.save(); ctx.rotate(0.6); drawHeld(false); ctx.restore();
        break;
      }
      case "execution":
      case "phantom_slash": {
        // Overhead raise, then a hard downward cut.
        const a = k < 0.45 ? -1.6 * (k / 0.45) : -1.6 + ((k - 0.45) / 0.55) * 2.4;
        ctx.save(); ctx.rotate(a); drawHeld(true); ctx.restore();
        orb(18, 0, 26 * rise);
        break;
      }
      default: {
        // Casting stance: weapon lifted high, free hand glowing with the ability's colour.
        ctx.save(); ctx.rotate(-1.15 * rise - 0.2); drawHeld(false); ctx.restore();
        orb(14, 6, 20 * rise + 6);
        if (pose.id === "timeslow") {
          ctx.strokeStyle = `hsla(210, 80%, 80%, ${0.7 * rise})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.arc(14, 6, 9, 0, Math.PI * 2); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(14, 6); ctx.lineTo(14 + Math.cos(k * 12) * 7, 6 + Math.sin(k * 12) * 7); ctx.stroke();
        }
      }
    }
  }

  // World-space signature effect for each ultimate, by the class's motif.
  ultimateFx() {
    const cls = getClass(this.stats.classId);
    const hue = hueOf(cls.accent);
    const style = ULT_STYLES[this.stats.classId];
    const { x, y } = this.player.pos;
    this.hitstop = Math.max(this.hitstop, 0.05);
    this.ultPose = { t: 0, dur: 0.9 };
    this.fx.seal(x, y - 50, cls.ultKanji, hue, 34, 1, this.player.pos);
    this.ultWorldFx(style.motif, x, y, hue);
  }

  private ultWorldFx(motif: UltMotif, x: number, y: number, hue: number) {
    const f = this.fx;
    const face = this.player.facing;
    switch (motif) {
      case "moon":
        f.slash(x, y, face, 150, Math.PI * 1.1, 1, { hue: 45, sat: 20, light: 96, width: 14, life: 0.5 });
        f.glow(x, y, 160, 45, 30, 90, 0.4);
        break;
      case "smoke": f.smoke(x, y, 18, 140, 14, 250, 20); break;
      case "blood":
        f.burst(x, y, { count: 40, hue: 358, sat: 85, light: 40, speed: 420, life: 0.6, w: 3 });
        f.ground(x, y, 200, 358, 1.8);
        break;
      case "leaves":
        f.burst(x, y, { count: 34, hue: 100, sat: 50, light: 50, speed: 300, life: 0.9, grav: 60 });
        f.enso(x, y, 90, 120, { life: 1.2, width: 8, follow: this.player.pos });
        break;
      case "petals": f.burst(x, y, { count: 44, hue: 335, sat: 80, light: 78, speed: 360, life: 0.8 }); break;
      case "ghosts":
        f.smoke(x, y, 10, 100, 60, 180, 50);
        f.burst(x, y, { count: 20, hue: 180, light: 80, speed: 160, life: 0.9, grav: -220 });
        break;
      case "mirror":
        for (let i = 0; i < 4; i++) {
          const a = (i / 4) * Math.PI * 2;
          spawnGhostAfterimage(this.vfx, x + Math.cos(a) * 34, y + Math.sin(a) * 34, face, BASE.PLAYER_RADIUS);
        }
        f.enso(x, y, 60, hue, { life: 0.8, width: 5, follow: this.player.pos });
        break;
      case "embers":
        f.flames2(x, y, 34, 60);
        f.glow(x, y, 120, 5, 100, 50, 0.5);
        break;
      case "rain":
        for (let i = 0; i < 10; i++) {
          const tx = x + (Math.random() - 0.5) * 300, ty = y + (Math.random() - 0.5) * 300;
          f.streakLine(tx + 60, ty - 260, tx, ty, 200, 92, 3, 0.4);
        }
        break;
      case "earth":
        f.ground(x, y, 260, 30, 2.2);
        f.smoke(x, y, 12, 140, 35, 30, 25);
        break;
      case "gold":
        f.glow(x, y, 200, 45, 95, 65, 0.5);
        f.burst(x, y, { count: 24, hue: 45, light: 75, speed: 500, life: 0.5 });
        break;
      case "talismans":
        f.burst(x, y, { count: 24, hue: 45, sat: 30, light: 94, speed: 260, life: 0.8, w: 4 });
        f.enso(x, y, 110, 280, { life: 1.4, width: 7, follow: this.player.pos });
        break;
      case "banner": f.glow(x, y, 180, 45, 95, 60, 0.6); break;
      case "ribbons": f.burst(x, y, { count: 30, hue: 320, light: 75, speed: 380, life: 0.6, w: 4 }); break;
      case "web": f.ground(x, y, 300, 260, 2.5); break;
      case "sun":
        f.streakLine(x, y - 400, x, y, 50, 98, 40, 0.6);
        f.glow(x, y, 170, 180, 80, 90, 0.6);
        break;
      case "void": f.smoke(x, y, 16, 120, 6, 260, 30); break;
      case "fox": f.flames2(x, y, 26, 50); break;
      case "lightning":
        for (let i = 0; i < 3; i++) f.bolt(x + (Math.random() - 0.5) * 120, y - 340, x + (Math.random() - 0.5) * 60, y, 205, 0.35);
        break;
      case "snow":
        f.burst(x, y, { count: 50, hue: 200, sat: 60, light: 95, speed: 640, life: 0.8, w: 2 });
        f.glow(x, y, 260, 195, 70, 90, 0.5);
        break;
      case "wheel": f.enso(x, y, 130, 42, { life: 1.6, width: 10, light: 62, follow: this.player.pos }); break;
      case "water":
        f.smoke(x, y, 10, 120, 70, 190, 55);
        f.burst(x, y, { count: 34, hue: 190, sat: 80, light: 80, speed: 520, life: 0.7, grav: 260 });
        break;
      case "wind": f.burst(x, y, { count: 34, hue: 140, sat: 40, light: 88, speed: 600, life: 0.6, w: 1.6 }); break;
      case "spotlight":
        f.glow(x, y, 120, 45, 100, 80, 0.9);
        for (let i = 0; i < 24; i++) f.burst(x + (Math.random() - 0.5) * 160, y - 120, { count: 1, hue: Math.random() * 360, light: 65, speed: 80, life: 1.2, grav: 160 });
        break;
      case "spears": break;
    }
    void hue;
  }

  triggerUltimate() {
    if (!this.stats.ultReady || this.stats.ultActive || this.ultCutscene) return;
    this.stats.ultCharge = 0;
    this.stats.ultReady = false;
    this.stats.ultActive = true;
    this.run.ults++;
    this.ultKillCount = 0;
    if (this.hasUltPerk("ult_refund_r")) this.stats.ultCharge = this.stats.ultMax * 0.25;   // ULTPERK Echoing Soul
    audio.play("timeSlowSwell");
    if (this.ultCutscenes) {
      this.ultCutscene = { t: 0, dur: 1.35 };
    } else {
      const cls = getClass(this.stats.classId);
      this.fx.ultimate(this.player.pos.x, this.player.pos.y, cls.ultKanji, cls.ultName, hueOf(cls.accent), this.player.pos);
      this.executeUltimate();
    }
    this.emitStats();
  }

  /** Closest living enemy within range (touch aim assist). */
  nearestEnemyTo(pos: Vec2, range: number): Enemy | null {
    let best: Enemy | null = null, bd = range;
    for (const e of this.enemies) {
      if (e.state === "dead") continue;
      const d = Math.hypot(e.pos.x - pos.x, e.pos.y - pos.y);
      if (d < bd) { bd = d; best = e; }
    }
    return best;
  }

  /** Touch: point at the nearest enemy right now (before an ability / ult / shot). */
  aimAtNearest(range = 520) {
    const t = this.nearestEnemyTo(this.player.pos, range);
    if (t) this.player.facing = Math.atan2(t.pos.y - this.player.pos.y, t.pos.x - this.player.pos.x);
  }

  /** Ultimate damage grows with the wave (+35%/wave, a bit under enemy HP's
   *  +45%) or with how much the player's own damage has grown — whichever is
   *  higher — so ultimates stay strong late in a run. */
  ultDmg(base: number): number {
    // Phase 7.1: your build drives ult damage; the wave adds only a little.
    const wave = Math.max(1, this.stats.wave);
    const waveScale = 1 + (wave - 1) * ULT_WAVE_SCALE;
    // "Weapon power": how much your damage upgrades have grown your main weapon
    // (katana upgrades or the all-weapons multiplier, whichever is bigger).
    const katanaGrowth = this.perks.damage / Math.max(0.01, this.baseKatanaDamage);
    const powerScale = Math.max(1, katanaGrowth, this.perks.secondaryDmgMul);
    this.ultHitFlag = true;   // RECAP: the hit this feeds into counts as "Ultimate"
    const classMul = ULT_CLASS_MUL[this.stats.classId] ?? 1;   // 7.5: per-class ult budget
    return base * powerScale * waveScale * this.perks.ultPowerMul * classMul;
  }
  /** Same as ultDmg() but without marking the next hit (for bonus damage added inside a hit). */
  ultDmgRaw(base: number): number {
    const v = this.ultDmg(base);
    this.ultHitFlag = false;
    return v;
  }
  /** 7.10: the class's accent hue, used for its ult aura and empowered hits. */
  ultAuraHue(): number { return hueOf(getClass(this.stats.classId).accent); }
  /** 7.10: power-up ults (and Raijin's charged weapon) get a clear, pulsing aura. */
  private drawUltAura() {
    const powered = this.empowerBase() > 0 || this.ultThunderTimer > 0;
    if (!powered || !this.player) return;
    const ctx = this.ctx, p = this.player.pos, h = this.ultAuraHue(), t = this.elapsed;
    const r = BASE.PLAYER_RADIUS + 14 + Math.sin(t * 8) * 3;
    ctx.save();
    const g = ctx.createRadialGradient(p.x, p.y, BASE.PLAYER_RADIUS * 0.6, p.x, p.y, r + 16);
    g.addColorStop(0, `hsla(${h}, 90%, 60%, 0.0)`);
    g.addColorStop(0.55, `hsla(${h}, 90%, 60%, 0.28)`);
    g.addColorStop(1, `hsla(${h}, 90%, 60%, 0)`);
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(p.x, p.y, r + 16, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = `hsla(${h}, 95%, 72%, ${0.55 + Math.sin(t * 8) * 0.25})`;
    ctx.lineWidth = 2.5;
    ctx.setLineDash([10, 7]); ctx.lineDashOffset = -t * 40;
    ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
    if (Math.random() < 0.35) this.fx.burst(p.x + (Math.random() - 0.5) * 30, p.y + (Math.random() - 0.5) * 30, { count: 1, hue: h, light: 70, speed: 60, life: 0.4, grav: -120 });
  }

  /** 7.5: bonus-damage base for weapon hits while this class's power-up ult is running (0 = none). */
  private empowerBase(): number {
    const k = ULT_EMPOWER[this.stats.classId];
    if (!k) return 0;
    const on =
      this.ultBloodRageTimer > 0 || this.ultShadowStepTimer > 0 || this.ultShadowConsumeTimer > 0 ||
      this.ultFinaleTimer > 0 || this.ultBannerActive || this.ultBlizzardTimer > 0 ||
      this.ultMountainTimer > 0 || this.ultWindTimer > 0 || fortuneActive(this);
    return on ? k : 0;
  }

  /** ULTPERK: does the player own this ultimate perk? */
  hasUltPerk(id: string) { return this.acquiredPerks.includes(id); }

  /** ULTPERK Lingering Power: stretch every timed ultimate that just started. */
  private extendTimedUlts(mul: number) {
    const keys = ["ultBloodRageTimer", "ultShadowStepTimer", "ultMountainTimer", "ultThousandCutsTimer", "ultArrowTimer",
      "ultSpiritTempestTimer", "ultBannerTimer", "ultDeathWebTimer", "ultDivineBeamTimer", "ultShadowConsumeTimer",
      "ultThunderTimer", "ultBlizzardTimer", "ultPrayerTimer", "ultWindTimer", "ultFinaleTimer"] as const;
    const self = this as unknown as Record<string, number>;
    for (const k of keys) if (self[k] > 0) self[k] *= mul;
    if (this.spearWall) this.spearWall.t *= mul;
    for (const c of this.clones) c.life *= mul;
  }

  /** ULTPERK Aftershock: blast around the player when an ultimate ends. */
  private ultAftershock() {
    const p = this.player.pos, R = 230 * this.areaMul();   // STEP 3 area
    for (const e of this.enemies) {
      if (e.state === "dead" || Math.hypot(e.pos.x - p.x, e.pos.y - p.y) > R + e.size) continue;
      this.dealDamage(e, this.ultDmg(15), Math.atan2(e.pos.y - p.y, e.pos.x - p.x), e.isBoss ? 40 : 260);
    }
    this.fx.shockwave(p.x, p.y, R, { hue: 45, light: 75, life: 0.5, width: 12, lines: 16 });
    this.fx.seal(p.x, p.y - 30, "震", 45, 34, 0.7);
    this.cameraShake = Math.max(this.cameraShake, 0.5);
    audio.play("bombBoom");
  }

  skipUltCutscene() {
    if (this.ultCutscene && this.ultCutscene.t > 0.25) this.ultCutscene.t = this.ultCutscene.dur;
  }

  executeUltimate() {
    this.onHaptic?.("ult");
    this.castIds.Ultimate = (this.castIds.Ultimate ?? 0) + 1;   // BOSS CAP: new cast
    this.cameraShake = Math.max(this.cameraShake, 0.45);
    this.cameraZoom.setTarget(1.05, 13);
    setTimeout(() => this.cameraZoom.setTarget(1, 6), 150);
    audio.play("levelUp");
    this.flash(`${this.stats.ultName}!`);
    this.ultimateFx();
    if (this.hasUltPerk("ult_ward_r")) {   // ULTPERK Unbroken Will
      this.player.invuln = Math.max(this.player.invuln, 2);
      this.healPlayer(this.player.maxHp * 0.15);
    }

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
        this.ultMountainTimer = this.hasUltPerk("ultc_yamabushi") ? 5 : 3;
        this.healPlayer(this.hasUltPerk("ultc_yamabushi") ? 60 : 30);
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
        const dashDist = this.hasUltPerk("ultc_kensei") ? 540 : 360;
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
          if (perp > (this.hasUltPerk("ultc_kensei") ? 100 : 70) + e.size) continue;
          this.dealDamage(e, this.ultDmg(24), ang, 80);
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
        this.fx.streakLine(startX, startY, endX, endY, 36, 95, 22, 0.6);
        for (let i = 1; i < 6; i++) {
          const t = i / 6;
          this.fx.slash(startX + (endX - startX) * t, startY + (endY - startY) * t, ang + Math.PI / 2, 44, Math.PI * 0.6, i % 2 ? 1 : -1, { hue: 36, sat: 70, light: 88, width: 7, life: 0.4 });
        }
        this.player.pos.x = Math.max(20, Math.min(this.worldW - 20, endX));   // stay inside the arena
        this.player.pos.y = Math.max(20, Math.min(this.worldH - 20, endY));
        this.player.invuln = Math.max(this.player.invuln, 1.5);
        this.screenFlashColor = "hsla(36, 90%, 92%, 0.7)";
        this.screenFlashTimer = 0.35;
        break;
      }
      case "ronin": {
        // Crimson Debt: pay 20% HP to brand the 3 strongest foes; 1.5s later the debt
        // is collected in one strike each, scaled by how hurt you are.
        const cost = Math.floor(this.player.maxHp * (this.hasUltPerk("ultc_ronin") ? 0.1 : 0.2));
        this.player.hp = Math.max(1, this.player.hp - cost);
        this.player.hitFlash = 1;
        const ratio = this.player.hp / Math.max(1, this.player.maxHp);
        const marked = this.enemies.filter(e => e.state !== "dead")
          .sort((a, b) => b.hp - a.hp).slice(0, this.hasUltPerk("ultc_ronin") ? 5 : 3);
        for (const e of marked) {
          e.markRemaining = Math.max(e.markRemaining, 2);
          this.fx.seal(e.pos.x, e.pos.y - e.size - 18, "債", 358, 26, 1.6, e.pos);
          this.fx.bolt(this.player.pos.x, this.player.pos.y, e.pos.x, e.pos.y, 358, 0.3);
        }
        this.roninDebt = { ids: marked.map(e => e.id), t: 1.5, dmg: (10 + cost * 1.5) * (1 + (1 - ratio) * 1.5) };
        this.player.invuln = Math.max(this.player.invuln, 1);
        break;
      }
      case "dokkaebi": {
        // Cursed Horde — a rank of goblin ghosts rises behind you in a line across your aim,
        // then charges straight across the arena, trampling and cursing everything in its path.
        {
          const n = this.hasUltPerk("ultc_dokkaebi") ? 8 : 5;
          const a = this.player.facing, px = -Math.sin(a), py = Math.cos(a);
          for (let i = 0; i < n; i++) {
            const off = (i - (n - 1) / 2) * 46;
            const back = 34 + Math.abs(i - (n - 1) / 2) * 10;   // a shallow V, the middle ghost leads
            this.allyGhosts.push({
              pos: { x: this.player.pos.x + px * off - Math.cos(a) * back, y: this.player.pos.y + py * off - Math.sin(a) * back },
              vel: { x: Math.cos(a) * 90, y: Math.sin(a) * 90 },
              life: 2.8, maxLife: 2.8,
              damage: this.ultDmg(10),
              hitSet: new Set(),
              curse: true,
              fromUlt: true,
              charge: true,
              delay: 0.35 + Math.abs(i - (n - 1) / 2) * 0.06,
              seed: Math.random() * 10,
              size: 26,
            });
          }
        }
        this.screenFlashColor = "hsla(180, 50%, 60%, 0.35)";
        this.screenFlashTimer = 0.35;
        break;
      }
      case "kagemusha": {
        // Twin Shadows — spawn an 8s clone that mirrors and fights.
        if (this.hasUltPerk("ultc_kagemusha")) this.clones.push({ pos: { x: this.player.pos.x - 40, y: this.player.pos.y }, facing: this.player.facing, hp: 60, maxHp: 60, attackTimer: 0.35, life: 8, hitFlash: 0 });
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
        // Storm of Heaven: arrows rain on wherever you aim, for 2.5s. Steer it.
        this.player.invuln = Math.max(this.player.invuln, 1);
        this.ultArrowTimer = this.hasUltPerk("ultc_arashi") ? 3.5 : 2.5;
        this.ultArrowTick = 0;
        break;
      }
      case "tetsubo": {
        // Earthbreaker: a fissure tears forward in a cone; only foes in front are launched.
        const p = this.player;
        const ang = p.facing;
        for (const e of this.enemies) {
          if (e.state === "dead") continue;
          const dx = e.pos.x - p.pos.x, dy = e.pos.y - p.pos.y, d = Math.hypot(dx, dy);
          if (d > (this.hasUltPerk("ultc_tetsubo") ? 620 : 440)) continue;
          let diff = Math.atan2(dy, dx) - ang;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          if (Math.abs(diff) > (this.hasUltPerk("ultc_tetsubo") ? 0.75 : 0.55)) continue;
          this.dealDamage(e, this.ultDmg(20), Math.atan2(dy, dx), e.isBoss ? 60 : 420);
          e.stunTimer = Math.max(e.stunTimer, e.isBoss ? 0.5 : 1.4);
        }
        for (let i = -2; i <= 2; i++) {
          const a = ang + i * 0.22;
          this.fx.streakLine(p.pos.x, p.pos.y, p.pos.x + Math.cos(a) * 440, p.pos.y + Math.sin(a) * 440, 28, 60, 10, 0.7);
        }
        this.fx.ground(p.pos.x + Math.cos(ang) * 200, p.pos.y + Math.sin(ang) * 200, 220, 30, 2.4);
        this.cameraShake = Math.max(this.cameraShake, 0.9);
        break;
      }
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
        // Phantom Dance: the body splits into three afterimages side by side,
        // they criss-cross the zone in front of you in a storm of slashes, then
        // converge for a final X-cut and fold back into you.
        const p = this.player, f = p.facing;
        this.ultPhantomTimer = PD.dur;
        this.phantom = { t: 0, cx: p.pos.x + Math.cos(f) * PD.reach, cy: p.pos.y + Math.sin(f) * PD.reach, hitAcc: 0, slashAcc: 0, finished: false };
        this.ultPhantomImages = (this.hasUltPerk("ultc_kunoichi") ? [-1.5, -0.5, 0.5, 1.5] : [-1, 0, 1]).map((k, i) => {
          const home = { x: p.pos.x - Math.sin(f) * k * PD.spacing, y: p.pos.y + Math.cos(f) * k * PD.spacing };
          return { home, pos: { x: p.pos.x, y: p.pos.y }, facing: f, from: { ...p.pos }, to: home, dashT: 0, delay: i * 0.05,
            trail: [], swing: 0, dir: k === 0 ? 1 : k };
        });
        p.invuln = Math.max(p.invuln, PD.dur + 0.2);
        this.screenFlashColor = "hsla(320, 70%, 75%, 0.35)";
        this.screenFlashTimer = 0.25;
        audio.play("smokeWoosh");
        for (const img of this.ultPhantomImages) this.fx.streakLine(p.pos.x, p.pos.y, img.home.x, img.home.y, 320, 85, 6, 0.3);
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
        // Divine Judgement: a pillar of light that follows your aim for 4s, burning
        // and disarming what it touches and healing you as it lands.
        this.ultDivineBeamTimer = 4;
        this.ultDivineBeamTick = 0;
        this.ultDivineBeamHit = new Set();
        const a = this.aimPoint();
        this.beamPos = { x: a.x, y: a.y };
        this.player.invuln = Math.max(this.player.invuln, 0.6);
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
      case "kitsune": {
        // Nine Tails: nine homing foxfires hunt foes down one by one.
        this.kitsuneTailsT = 1.6;
        for (let i = 0, n = this.hasUltPerk("ultc_kitsune") ? 14 : 9; i < n; i++) {
          this.spawnFoxfire(this.player.pos.x, this.player.pos.y, this.ultDmg(9), (i / n) * Math.PI * 2);
        }
        this.player.invuln = Math.max(this.player.invuln, 0.8);
        break;
      }
      case "raijin": {
        // Heaven's Drum: for 6s your weapon is charged — every hit calls chain lightning.
        this.ultThunderTimer = 6;
        this.ultThunderTick = 0;
        this.player.invuln = Math.max(this.player.invuln, 0.5);
        break;
      }
      case "yukionna": {
        // Eternal Winter: a blizzard follows you for 6s. Foes inside crawl, and
        // freeze solid after 1.2s in the storm (frozen foes take +50%).
        this.ultBlizzardTimer = 6;
        this.player.invuln = Math.max(this.player.invuln, 0.6);
        break;
      }
      case "ashigaru": {
        // Spear Wall: plant a barrier of spears in front of you for 7s. It blocks
        // arrows and orbs, and foes that touch it are hurt and shoved back.
        const p = this.player;
        this.spearWall = {
          x: p.pos.x + Math.cos(p.facing) * 70, y: p.pos.y + Math.sin(p.facing) * 70,
          ang: p.facing + Math.PI / 2, len: this.hasUltPerk("ultc_ashigaru") ? 420 : 280, t: 7, tick: 0,
        };
        this.cameraShake = Math.max(this.cameraShake, 0.5);
        break;
      }
      case "kappa": {
        // Tidal Surge: a rolling wave crashes forward across the arena, carrying every
        // foe it catches and dumping them, slowed, at the far end.
        const p = this.player;
        this.tideWave = { x: p.pos.x, y: p.pos.y, ang: p.facing, dist: 0, max: 760, width: this.hasUltPerk("ultc_kappa") ? 380 : 260, carried: new Set() };
        this.player.invuln = Math.max(this.player.invuln, 0.6);
        break;
      }
      case "tengu": {
        // Divine Wind: take flight for 5s — much faster, dash recharges almost
        // instantly, and every dash leaves a cutting gale behind you.
        this.ultWindTimer = this.hasUltPerk("ultc_tengu") ? 7 : 5;
        this.player.dashCooldown = 0;
        this.player.invuln = Math.max(this.player.invuln, 0.5);
        break;
      }
      case "teppo": case "takajo": case "karakuri": case "bakuto": case "rikishi": case "sumie":
        castNewUlt(this, this.stats.classId);   // STEP 5
        break;
      case "kabuki": {
        this.ultFinaleTimer = this.hasUltPerk("ultc_kabuki") ? 7 : 5;
        this.player.invuln = Math.max(this.player.invuln, 0.6);
        break;
      }
      case "sohei": {
        // Prayer Wheel: a turning aura for 4s that heals in pulses and gently pushes foes away.
        this.ultPrayerTimer = 4;
        this.ultPrayerTick = 0;
        this.player.invuln = Math.max(this.player.invuln, 1.5);
        this.screenFlashColor = "hsla(28, 70%, 70%, 0.4)";
        this.screenFlashTimer = 0.4;
        break;
      }
      default: {
        // Safety net — should not be reached now that all classes have bespoke ults.
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
    if (this.hasUltPerk("ult_linger_r")) this.extendTimedUlts(1.3);   // ULTPERK Lingering Power
  }

  // ============ Iai Chain (Samurai ultimate) ============
  // Picks the strongest still-living enemy within IAI_CHAIN_RADIUS of the
  // player, teleports the player next to them, slashes, and queues the
  // next step. Up to MAX_IAI_CHAIN_HITS slashes per cast. Each step is
  // its own frame (driven by updateIaiChain()) so the player can SEE each
  // teleport + slash + ink splash + slash SFX.
  castIaiChain() {
    this.iaiChainRemaining = MAX_IAI_CHAIN_HITS + (this.hasUltPerk("ultc_samurai") ? 3 : 0);
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
    p.attackAnim = 1;
    p.swingDir = (p.swingDir === 1 ? -1 : 1);
    p.swingWeaponId = this.abilityWeapon();
    this.kickAbilityWeapon();
    this.fx.streakLine(startX, startY, p.pos.x, p.pos.y, 45, 95, 10, 0.3);
    this.fx.glow(best.pos.x, best.pos.y, 60, 45, 90, 70, 0.2);
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
    this.dealDamage(best, this.ultDmg(IAI_CHAIN_DAMAGE), p.facing, 50);

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
      this.lastHitBy = "own ultimate (mistimed)";
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
    // Out of ammo → swap to the other weapon once the last shot has left.
    if (this.autoSwapTimer > 0) {
      this.autoSwapTimer -= dt;
      if (this.autoSwapTimer <= 0) {
        const cur = this.stats.secondaryActiveSlot;
        const other = cur === 0 ? 1 : 0;
        const curId = this.stats.secondaryIds[cur];
        if (curId && !isMeleeSecondary(curId) && curId !== "katana" && this.stats.secondaryAmmo[cur] <= 0
            && this.slotUsable(other)) {
          this.swapSecondary();
        }
      }
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
      // No regen for a moment after taking a hit on the guard.
      this.blockRegenDelay = Math.max(0, this.blockRegenDelay - dt);
      if (effectiveRegen > 0 && this.blockRegenDelay <= 0 && !this.input.blockHeld && this.stats.blockHp < this.stats.blockHpMax) {
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
  private slotUsable(slot: number): boolean {
    const id = this.stats.secondaryIds[slot];
    if (!id) return false;
    if (id === "katana" || isMeleeSecondary(id)) return true;
    return this.stats.secondaryAmmo[slot] > 0 && this.stats.secondaryReload[slot] <= 0;
  }

  swapSecondary() {
    const a = this.stats.secondaryIds[0];
    const b = this.stats.secondaryIds[1];
    if (!a || !b) return;
    this.stats.secondaryActiveSlot = this.stats.secondaryActiveSlot === 0 ? 1 : 0;
    audio.play("slash");
    this.onActiveSecondaryChanged();
    const now = SECONDARIES[this.stats.secondaryIds[this.stats.secondaryActiveSlot]!];
    this.flash(`${now.kanji} ${now.name}`);
    if (this.player) {
      this.fx.seal(this.player.pos.x, this.player.pos.y - 40, now.kanji, SLASH_HUE[now.id] ?? 42, 24, 0.6, this.player.pos);
      this.fx.enso(this.player.pos.x, this.player.pos.y, 26, SLASH_HUE[now.id] ?? 42, { life: 0.35, width: 3, follow: this.player.pos });
    }
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
  // Where the player is aiming in world space (mouse, or straight ahead without one).
  aimPoint(): Vec2 {
    if (this.input.mouseAim) return { x: this.input.mouseX + this.cameraX, y: this.input.mouseY + this.cameraY };
    return { x: this.player.pos.x + Math.cos(this.player.facing) * 220, y: this.player.pos.y + Math.sin(this.player.facing) * 220 };
  }

  // Abilities swing whatever melee weapon is in hand; ranged weapons fall back to the katana.
  abilityWeapon(): SecondaryId | null {
    const held = this.stats.secondaryIds[this.stats.secondaryActiveSlot];
    return held && held !== "katana" && isMeleeSecondary(held) ? held : null;
  }

  private kickAbilityWeapon() {
    if (this.abilityWeapon() === "twin_sai") {
      this.saiAnim[this.saiNext] = 1;
      this.saiNext = 1 - this.saiNext;
    }
  }

  // Distance from the player's centre to the weapon's tip, so shots leave the weapon.
  muzzleDist(id: SecondaryId): number {
    switch (id) {
      case "yumi": return 30;
      case "crossbow": return 36;
      case "blowgun": return 44;
      case "flame_spear": return 46;
      case "kusarigama": return 26;
      case "shuriken_wheel": return 24;
      case "kunai": return 24;
      default: return 20;
    }
  }

  fireSecondary() {
    if (this.stats.secondaryCooldown > 0) return;
    this.vanishTimer = 0;   // attacking breaks Shinobi's Vanish
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
      if (this.stats.secondaryAmmo[slot] === 0) this.autoSwapTimer = 0.25;
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
    if (!melee) this.fireAnim = 1;

    const p = this.player;
    const baseAng = p.facing;
    const projSpeedMul = this.perks.projectileSpeedMul ?? 1;

    // ===== Phase B — melee-style secondaries (Tessen, Jutte, Ono, Twin Sai, Odachi).
    // These all use def.aim === "self" but behave like swings, NOT smoke clouds.
    // We branch by id BEFORE the generic "self" path so smoke_bomb still works.
    if (isMeleeSecondary(id)) {
      this.swingMeleeSecondary(id, def);
      this.onEvoFire(id);
      return;
    }

    if (def.aim === "self") {
      // Smoke bomb (secondary) — drops at player's feet.
      // Deliberately smaller and shorter than the Smoke Bomb ability
      // so the ability still feels distinct and powerful.
      const fog = this.isEvolved("smoke_bomb");   // EVOLUTION: Ninja Fog
      this.smokeClouds.push({
        pos: { x: p.pos.x, y: p.pos.y },
        radius: fog ? 125 : 80,
        life: fog ? 4 : 3.5,
        maxLife: fog ? 4 : 3.5,
        follow: fog,
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
        pos: { x: p.pos.x + Math.cos(ang) * 18, y: p.pos.y + Math.sin(ang) * 18 },
        vel: { x: Math.cos(ang) * horizSpeed, y: Math.sin(ang) * horizSpeed },
        height: 0,
        vh,
        life: T + 0.3,            // a little slack past the predicted landing
        damage: this.effectiveSecondaryDamage(id) + 4,
        radius: (this.isEvolved(id) ? 126 : 90) * this.areaMul(),     // EVOLUTION: Venom Caltrops · STEP 3 area
        venom: this.isEvolved(id),
      });
      // Face the throw so the throwing animation reads correctly.
      p.facing = ang;
      this.spawnMuzzleFlash(p.pos, ang, "hsl(20 80% 65%)");
      audio.play("slash");
      return;
    }

    // Aimed projectile (yumi / kunai / crossbow / kusarigama).
    // EVOLUTION: Raiden Bow / Shadow Fan / Siege Repeater fire extra shots.
    const evo = this.isEvolved(id);
    const extra = !evo ? 0 : id === "yumi" ? 2 : id === "kunai" ? 2 : id === "crossbow" ? 3 : 0;
    const more = id === "kusarigama" ? 0 : this.perks.extraProjectiles;   // STEP 3: +projectiles (not the chain hook)
    const count = def.projectiles + extra + more;
    const spread = (extra || more) && def.spread < 0.2 ? 0.22 + def.spread + 0.06 * more : def.spread + 0.08 * more;
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
         480) * projSpeedMul * (1 + this.perks.projSpeedBonus);
      const dmg = this.effectiveSecondaryDamage(id);
      const kind: SecondaryProjectile["kind"] =
        id === "yumi" ? "arrow" :
        id === "crossbow" ? "bolt" :
        id === "kusarigama" ? "hook" :
        id === "shuriken_wheel" ? "shuriken" :
        id === "flame_spear" ? "spear" :
        id === "blowgun" ? "dart" :
        "kunai";
      const md = this.muzzleDist(id);
      const proj: SecondaryProjectile = {
        pos: { x: p.pos.x + Math.cos(baseAng) * md, y: p.pos.y + Math.sin(baseAng) * md },
        vel: { x: Math.cos(ang) * speed, y: Math.sin(ang) * speed },
        life: kind === "hook" ? 0.5 : kind === "shuriken" ? 2.4 : kind === "spear" ? 0.55 : 1.0,
        maxLife: kind === "hook" ? 0.5 : kind === "shuriken" ? 2.4 : kind === "spear" ? 0.55 : 1.0,
        damage: dmg,
        hitSet: new Set(),
        // arrows + spears pierce; shuriken bounces (handled separately, not pierce)
        pierce: kind === "arrow" || kind === "spear" || (evo && (id === "kunai" || id === "crossbow")),
        src: id,
        kind,
        hookEnemyId: null,
        trail: [],
      };
      if (this.isClass("arashi") && !proj.pierce) proj.pierceLeft = SIG.arashiPierce;   // SIGNATURE Tailwind
      if (!proj.pierce && this.perks.pierceBonus > 0 && kind !== "hook") proj.pierceLeft = (proj.pierceLeft ?? 0) + this.perks.pierceBonus;   // STEP 3
      onShotNewClass(this, proj);   // STEP 5: Teppō matchlock
      if (kind === "shuriken") {
        proj.bouncesLeft = 4;
        proj.returning = false;
        proj.spinAng = 0;
      }
      if (kind === "spear") proj.burnSeconds = 4;
      if (kind === "dart") proj.poisonSeconds = 3;
      this.secProjectiles.push(proj);
    }
    this.onEvoFire(id);   // EVOLUTION hooks for projectile weapons (Storm Wheel)
    // Phase 6 — muzzle flash + per-weapon fire SFX
    const flashColor =
      id === "yumi" ? "hsl(200 80% 80%)" :
      id === "crossbow" ? "hsl(36 95% 75%)" :
      id === "kusarigama" ? "hsl(0 80% 60%)" :
      id === "shuriken_wheel" ? "hsl(190 70% 80%)" :
      id === "flame_spear" ? "hsl(15 95% 70%)" :
      id === "blowgun" ? "hsl(120 60% 70%)" :
      "hsl(260 60% 80%)";
    {
      const md = this.muzzleDist(id) - 14;
      this.spawnMuzzleFlash({ x: p.pos.x + Math.cos(baseAng) * md, y: p.pos.y + Math.sin(baseAng) * md }, baseAng, flashColor);
    }
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
    return isMeleeSecondary(id);
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
    else if (id === "twin_sai") { range = 88; arc = Math.PI * 0.4; }
    else if (id === "tate") { range = 75; arc = Math.PI * 0.5; }      // shield bash — short cone
    else if (id === "flame_spear") { range = 125; arc = Math.PI * 0.2; } // narrow piercing thrust
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
        if (id === "flame_spear") {
          e.burnRemaining = Math.max(e.burnRemaining, 4);
          e.burnDps = Math.max(e.burnDps, 4);
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
    if (id === "flame_spear") {
      const tipX = p.pos.x + Math.cos(p.facing) * range, tipY = p.pos.y + Math.sin(p.facing) * range;
      this.fx.streakLine(p.pos.x + Math.cos(p.facing) * 24, p.pos.y + Math.sin(p.facing) * 24, tipX, tipY, 22, 85, 9, 0.16);
      this.fx.flames2(tipX, tipY, 6, 14);
      this.fx.burst(tipX, tipY, { count: 5, hue: 25, light: 70, speed: 260, dir: p.facing, spread: 0.6, life: 0.2 });
    } else if (id === "twin_sai") {
      const side = this.saiNext;
      this.saiNext = 1 - side;
      this.saiAnim[side] = 1;
      const off = side === 0 ? -8 : 8;
      const nx = -Math.sin(p.facing), ny = Math.cos(p.facing);
      const sx = p.pos.x + nx * off, sy = p.pos.y + ny * off;
      const tipX = sx + Math.cos(p.facing) * range, tipY = sy + Math.sin(p.facing) * range;
      this.fx.streakLine(sx + Math.cos(p.facing) * 20, sy + Math.sin(p.facing) * 20, tipX, tipY, 165, 92, 6, 0.13);
      this.fx.burst(tipX, tipY, { count: 3, hue: 165, light: 85, speed: 220, dir: p.facing, spread: 0.9, life: 0.15 });
    } else {
      this.spawnSlash(p.pos, p.facing, range, arc);
    }
    if (id === "tessen") {
      this.fx.burst(p.pos.x + Math.cos(p.facing) * 30, p.pos.y + Math.sin(p.facing) * 30,
        { count: 9, hue: 340, sat: 50, light: 88, speed: 440, dir: p.facing, spread: arc, life: 0.32, w: 1.4 });
    }
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
        // PHASE4 Mirror Monk — projectiles hitting its front bounce back at you.
        if (e.archetype === "mirror") {
          const incomingDir = Math.atan2(-pr.vel.y, -pr.vel.x);
          let fd = incomingDir - e.facing;
          while (fd > Math.PI) fd -= Math.PI * 2;
          while (fd < -Math.PI) fd += Math.PI * 2;
          if (Math.abs(fd) < MIRROR.frontArc) {
            const a = Math.atan2(this.player.pos.y - e.pos.y, this.player.pos.x - e.pos.x);
            const sp = Math.max(300, Math.hypot(pr.vel.x, pr.vel.y) * 0.8);
            this.enemyProjectiles.push({ pos: { x: pr.pos.x, y: pr.pos.y }, vel: { x: Math.cos(a) * sp, y: Math.sin(a) * sp },
              life: 1.6, maxLife: 1.6, damage: Math.max(1, Math.round(e.damage * MIRROR.reflectDmgShare)), size: 7, kind: "arrow", trail: [] });
            this.spawnSpark(pr.pos);
            audio.play("armorRing");
            pr.life = 0;
            break;
          }
        }
        if (pr.kind === "hook" && !e.isBoss) {
          // Latch + bleed
          pr.hookEnemyId = e.id;
          e.bleedRemaining = Math.max(e.bleedRemaining, 3);
          this.dealDamage(e, pr.damage, ang, 0, pr.src);
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
        this.dealDamage(e, pr.damage, ang, pr.kind === "kunai" ? 30 : 60, pr.src);
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
          if ((pr.pierceLeft ?? 0) > 0) { pr.pierceLeft = (pr.pierceLeft ?? 0) - 1; continue; }
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
          venom: b.venom,
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
            if (c.venom) { e.poisonRemaining = Math.min(8, e.poisonRemaining + 0.5); if (this.perks.poisonDps <= 0) this.perks.poisonDps = 4; }
            e.hp -= tick; this.trackDealt("Caltrops", tick);
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
      if (s.follow) { s.pos.x += (this.player.pos.x - s.pos.x) * Math.min(1, dt * 8); s.pos.y += (this.player.pos.y - s.pos.y) * Math.min(1, dt * 8); }
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
    const MAGNET_R = 110 * this.pickupMul();   // STEP 3
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
    chance *= 1 + Math.max(0, this.perks.luck);   // STEP 3: luck
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
    const MAGNET_R = 130 * this.pickupMul();   // STEP 3
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
          this.spawnFloatText(this.player.pos, `+${CONSUMABLES[p.id].kanji} ${CONSUMABLES[p.id].name} [${slot + 1}]`, {
            color: CONSUMABLES[p.id].accent, size: 14, jp: true, vy: -65,
          });
          p.life = 0;
        } else if (this.elapsed - this.bagFullWarnAt > 3) {
          this.bagFullWarnAt = this.elapsed;
          this.spawnFloatText(this.player.pos, "Item bag full — use one (1/2/3)", { color: "hsl(36 60% 80%)", size: 12, vy: -50 });
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
    const p = this.player;
    const near = (r: number) => this.enemies
      .filter(e => e.state !== "dead" && Math.hypot(e.pos.x - p.pos.x, e.pos.y - p.pos.y) <= r)
      .sort((a, b) => Math.hypot(a.pos.x - p.pos.x, a.pos.y - p.pos.y) - Math.hypot(b.pos.x - p.pos.x, b.pos.y - p.pos.y));
    let text = def.desc;
    switch (id) {
      case "rice_ball": {
        const before = Math.ceil(p.hp);
        this.healPlayer(35);
        const healed = Math.round(p.hp - before);
        text = healed > 0 ? `+${healed} HP (${before} → ${Math.ceil(p.hp)})` : "Already at full HP";
        this.spawnFloatText(p.pos, `+${healed}`, { color: "hsl(140 80% 65%)", size: 16, vy: -65 });
        break;
      }
      case "sake":
        this.stats.buffSakeRemaining = 8;
        text = "+30% damage for 8s";
        break;
      case "smoke_pellet": {
        this.stats.buffSmokeRemaining = 2.5;
        p.invuln = Math.max(p.invuln, 2.5);
        this.smokeClouds.push({ pos: { x: p.pos.x, y: p.pos.y }, radius: 110, life: 3.5, maxLife: 3.5 });
        this.fx.smoke(p.pos.x, p.pos.y, 14, 110, 30, 220, 10);
        text = "Invulnerable for 2.5s inside a smoke cloud";
        break;
      }
      case "spirit_pearl":
        this.stats.ultCharge = this.stats.ultMax;
        this.stats.ultReady = true;
        text = "Ultimate fully charged — press R";
        break;
      case "iron_powder":
        if (this.stats.blockHpMax > 0) {
          this.stats.blockHp = this.stats.blockHpMax;
          this.stats.buffIronPowderRemaining = 10;
          text = `Block restored to ${Math.round(this.stats.blockHpMax)} · 3× block regen for 10s`;
        } else {
          p.invuln = Math.max(p.invuln, 1.5);
          text = "No block meter, so you're shielded for 1.5s instead";
        }
        break;
      case "wind_charm":
        this.stats.buffWindCharmRemaining = 8;
        text = "+30% movement speed for 8s";
        break;
      case "thunder_scroll": {
        const targets = near(520).slice(0, 6);
        const dmg = this.perks.damage * 4 + 8;
        for (const e of targets) {
          this.fx.bolt(e.pos.x + (Math.random() - 0.5) * 40, e.pos.y - 300, e.pos.x, e.pos.y, 52, 0.3);
          e.stunTimer = Math.max(e.stunTimer, e.isBoss ? 0.4 : 1);
          this.dealDamage(e, dmg, -Math.PI / 2, 20);
        }
        this.cameraShake = Math.max(this.cameraShake, 0.4);
        text = targets.length ? `Lightning struck ${targets.length} ${targets.length === 1 ? "foe" : "foes"} for ${fmtNum(dmg * this.perks.classDamageMul)} each` : "Lightning crackled, but no foes were near";
        break;
      }
      case "fire_bomb": {
        const targets = near(170);
        const dmg = this.perks.damage * 3 + 6;
        for (const e of targets) {
          this.dealDamage(e, dmg, Math.atan2(e.pos.y - p.pos.y, e.pos.x - p.pos.x), 160);
          e.burnRemaining = Math.max(e.burnRemaining, 5);
          e.burnDps = Math.max(e.burnDps, 6);
        }
        this.fx.shockwave(p.pos.x, p.pos.y, 190, { hue: 22, life: 0.5, width: 16, lines: 16 });
        this.fx.flames2(p.pos.x, p.pos.y, 26, 120);
        this.fx.glow(p.pos.x, p.pos.y, 170, 25, 100, 60, 0.35);
        p.invuln = Math.max(p.invuln, 0.3);
        this.cameraShake = Math.max(this.cameraShake, 0.5);
        audio.play("bombBoom");
        text = targets.length ? `Blast hit ${targets.length} ${targets.length === 1 ? "foe" : "foes"} and set them ablaze` : "Boom! No foes were close enough";
        break;
      }
      case "frost_talisman": {
        const targets = near(320);
        for (const e of targets) {
          e.stunTimer = Math.max(e.stunTimer, e.isBoss ? 0.8 : 2.5);
          e.slowRemaining = Math.max(e.slowRemaining, 5);
          this.fx.frost(e.pos.x, e.pos.y, 4);
        }
        this.fx.shockwave(p.pos.x, p.pos.y, 320, { hue: 195, light: 88, life: 0.6, width: 10, lines: 18 });
        this.fx.burst(p.pos.x, p.pos.y, { count: 30, hue: 195, sat: 70, light: 92, speed: 500, life: 0.6 });
        text = targets.length ? `Froze ${targets.length} ${targets.length === 1 ? "foe" : "foes"} for 2.5s` : "The air went cold, but no foes were near";
        break;
      }
      case "elixir": {
        this.perks.maxHpBonus += 10;
        p.maxHp = 100 + this.perks.maxHpBonus;
        const before = Math.ceil(p.hp);
        this.healPlayer(20);
        text = `+10 max HP (now ${Math.round(p.maxHp)}) and +${Math.round(p.hp - before)} HP`;
        break;
      }
      case "war_banner":
        this.stats.buffHasteRemaining = 10;
        text = "+15 Dexterity (faster attacks) for 10s";
        break;
      case "golden_koban": {
        const coins = Math.round(40 * (1 + 0.15 * Math.max(0, this.stats.wave - 1)));
        this.stats.mon += coins;
        text = `+${coins} coins (you have ${this.stats.mon})`;
        this.spawnFloatText(p.pos, `+${coins} 文`, { color: "hsl(45 95% 65%)", size: 16, jp: true, vy: -70 });
        audio.play("monPing");
        break;
      }
      case "shadow_scroll":
        this.clones.push({ pos: { x: p.pos.x + 40, y: p.pos.y }, facing: p.facing, hp: 60, maxHp: 60, attackTimer: 0, life: 8, hitFlash: 0 });
        this.fx.smoke(p.pos.x + 40, p.pos.y, 10, 50, 12, 250, 30);
        text = "A shadow clone fights beside you for 8s";
        break;
      case "lucky_charm":
        this.stats.buffLuckRemaining = 10;
        text = "+40% critical hit chance for 10s";
        break;
      case "phoenix_feather":
        this.perks.hasSecondWind = true;
        text = "You'll survive your next fatal blow at half HP";
        break;
      case "hourglass":
        this.timeSlowRemaining = Math.max(this.timeSlowRemaining, 4);
        text = "Time slowed for 4s — foes move at a crawl";
        break;
    }
    this.stats.consumables[slot] = null;
    this.stats.lastItemId = id;
    this.run.items++;
    this.stats.lastItemText = text;
    this.stats.lastItemSeq++;
    this.fx.seal(p.pos.x, p.pos.y - 44, def.kanji, hueOf(def.accent), 26, 0.8, p.pos);
    this.fx.enso(p.pos.x, p.pos.y, 30, hueOf(def.accent), { life: 0.45, width: 4, follow: p.pos });
    audio.play("levelUp");
    this.flash(`${def.kanji} ${def.name}: ${text}`);
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
    if (this.stats.buffHasteRemaining > 0)
      this.stats.buffHasteRemaining = Math.max(0, this.stats.buffHasteRemaining - dt);
    if (this.stats.buffLuckRemaining > 0)
      this.stats.buffLuckRemaining = Math.max(0, this.stats.buffLuckRemaining - dt);
  }

  // ============= Resume-run save (Phase 4) =============
  // Snapshot the player's current run between waves so they can come back
  // later via "Continue Run" on the main menu. Only safe to call from a
  // wave boundary — mid-wave state (enemies on screen, ult timers, in-flight
  // VFX) is intentionally NOT persisted; those reset cleanly on resume.
  persistResumeSnapshot(atShop = false) {
    try {
      saveRun({
        atShop,
        endless: this.endless,
        meta: { ...this.meta },
        daily: this.daily || undefined,
        assist: this.assistDR || undefined,
        vows: { ...this.vows },
        classId: this.lastClassId,
        difficulty: this.difficulty,
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
    this.difficulty = s.difficulty ?? "normal";
    this.vows = { ...(s.vows ?? {}) };
    this.meta = { ...NO_META, ...(s.meta ?? {}) };
    this.daily = s.daily ?? "";
    if (s.assist) this.assistDR = Math.max(this.assistDR, s.assist);
    this.start(s.classId, s.secondaryId);
    this.endless = s.endless ?? s.wave > 25;
    // Overlay numeric perks (captures shop-bought upgrades that aren't in
    // acquiredPerks). Spread carefully — keep keys we don't recognize so
    // forward-compat survives.
    Object.assign(this.perks as unknown as Record<string, unknown>, s.perks);
    this.enforceStatCaps();   // old saves can carry stats from before the caps
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
    this.player.maxHp = Math.min(s.maxHp, 100 + STAT_CAPS.maxHpBonus);
    this.player.hp = Math.min(this.stats.hp, this.player.maxHp);
    this.stats.maxHp = this.player.maxHp;
    this.stats.hp = this.player.hp;
    // Mirror perk badges
    this.stats.perks = [...this.acquiredPerks];
    // Re-spawn the saved wave fresh (clears the wave-1 enemies start()
    // already spawned).
    for (const e of this.enemies) e.state = "dead";
    this.enemies = [];
    this.applyBiome(s.wave);
    if (s.atShop) {
      // Saved after the wave was cleared — go straight to the level-ups /
      // shop instead of replaying the wave (which used to grant its coins
      // and level-ups a second time).
      this.stats.wave = s.wave;
      this.stats.waveTimer = 0;
      this.onActiveSecondaryChanged();
      if (this.pendingLevelUps > 0) { this.pendingShopOpen = true; this.openPendingLevelUp(); }
      else this.openShop();
      return;
    }
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
    const MAGNET_R = GhostGame.MAGNET_R * this.pickupMul();   // STEP 3
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
    this.sweeping = true;   // these vanish — they don't count as kills in stats/achievements
    for (const e of alive) {
      // Spawn a small dissipation puff so it reads as "they vanish".
      this.spawnBlood(e.pos, Math.random() * Math.PI * 2, 6);
      this.killEnemy(e, "honor");
    }
    this.sweeping = false;
    // Auto-collect every remaining orb (after the kill loop so newly-dropped
    // orbs are also swept up).
    let swept = 0;
    for (const o of this.xpOrbs) {
      this.gainXp(o.amount);
      swept += o.amount;
    }
    if (swept > 0) audio.play("levelUp");
    this.xpOrbs = [];
    for (const c of this.spiritChests) this.openSpiritChest(c.x, c.y);
    this.spiritChests = [];
    this.firePatches = [];
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
          : ep.kind === "talisman" ? `hsla(280, 80%, 65%, ${0.6 * t})`
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
      if (ep.kind === "talisman") {
        // Ofuda: spinning paper charm with a red seal and violet glow.
        ctx.rotate(this.elapsed * 6);
        ctx.fillStyle = "hsla(280, 90%, 60%, 0.35)";
        ctx.beginPath(); ctx.arc(0, 0, 13, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "hsl(45, 60%, 88%)";
        ctx.fillRect(-5, -9, 10, 18);
        ctx.fillStyle = "hsl(0, 75%, 45%)";
        ctx.fillRect(-1.5, -6, 3, 12);
      } else if (ep.kind === "arrow") {
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
    const infl = shopInflation(this.stats.wave) * (1 + 0.2 * this.vr("stingy")) * this.meta.shopMul;   // VOW Stingy Merchant, SHRINE Haggler
    this.stats.shopOffer = this.rollOfferWithLocks(equipped, infl);
    this.emitEvent({ t: "offer", kind: "shop", ids: this.stats.shopOffer.map(it => it.effect) });
    this.stats.shopRerollCost = Math.round(SHOP_REROLL_COST * infl * this.meta.rerollMul);   // SHRINE Browser
    this.roninFreeReroll = this.isClass("ronin");   // SIGNATURE Masterless: first reroll free
    if (this.roninFreeReroll) this.stats.shopRerollCost = 0;
    this.stats.shopPurchasedIds = [];
    this.omenOffer = omenBefore(this.stats.wave + 1) ? this.rollOmens() : [];   // OMEN
    this.stats.state = "shop";
    audio.play("levelUp");
    this.emitStats();
  }

  // ===================== SHOPLOCK =====================
  static readonly MAX_SHOP_LOCKS = 2;
  /** Locked items first (at their locked price), then fresh rolls for the other slots. */
  private rollOfferWithLocks(equipped: SecondaryId[], infl: number): ShopItem[] {
    const locks = this.perks.shopLocks.map(it => ({ ...it, locked: true }));
    const n = Math.max(0, this.shopSlots() - locks.length);
    const taken = new Set(locks.map(l => l.effect));
    let fresh: ShopItem[] = [];
    for (let tries = 0; tries < 6; tries++) {
      fresh = this.dedupeOffer(rollShopOffer(n + locks.length, equipped, this.maxedShopEffects(), this.shopOdds()))
        .filter(it => !taken.has(it.effect)).slice(0, n);
      if (fresh.length >= n) break;
    }
    // 7.4: legendaries also get pricier each wave on top of normal inflation.
    const legMul = 1 + SHOP_RARITY.legPricePerWave * Math.max(0, this.stats.wave - 1);
    const offer = [...locks, ...fresh.map(it => ({ ...it, price: Math.round(it.price * infl * (it.rarity === "legendary" ? legMul : 1)) }))];
    // Bad-luck protection: count rolls without a fresh legendary; reset when one appears.
    if (this.stats.wave >= SHOP_RARITY.legFromWave) {
      this.perks.shopPity = fresh.some(it => it.rarity === "legendary") ? 0 : (this.perks.shopPity ?? 0) + 1;
    }
    return offer;
  }

  /** SHOP RARITY (7.3): per-slot odds for this wave, including bad-luck protection. */
  shopOdds() {
    const lk = Math.max(0, this.perks.luck);   // STEP 3: luck
    const legendary = Math.min(0.5, shopLegChance(this.stats.wave, this.perks.shopPity ?? 0) * (1 + lk));
    return { legendary, rare: Math.min(0.6, SHOP_RARITY.rare * (1 + lk * 0.5)) };
  }

  /** Lock or unlock a shop card. Returns false when the lock limit is reached. */
  toggleShopLock(itemId: string): boolean {
    if (this.stats.state !== "shop" || this.stats.shopPurchasedIds.includes(itemId)) return false;
    const item = this.stats.shopOffer.find(i => i.id === itemId);
    if (!item) return false;
    if (item.locked) {
      item.locked = false;
      this.perks.shopLocks = this.perks.shopLocks.filter(l => l.id !== itemId);
    } else {
      if (this.perks.shopLocks.length >= GhostGame.MAX_SHOP_LOCKS) { this.flash(`You can lock ${GhostGame.MAX_SHOP_LOCKS} items at most`); return false; }
      item.locked = true;
      const { locked: _l, ...plain } = item;
      this.perks.shopLocks.push(plain);
    }
    this.stats.shopOffer = [...this.stats.shopOffer];
    audio.play("armorRing");
    this.emitStats();
    return true;
  }

  // Swap out items whose effect the player already has, so nothing is wasted.
  private dedupeOffer(items: ShopItem[]): ShopItem[] {
    const owned = (eff: string) => eff === "shop_oni_mask" && this.perks.lastStand;
    const replacement = SHOP_POOL.find(e => e.effect === "heal_full")!;
    return items.map(it => (owned(it.effect) ? rollOne(replacement) : it));
  }

  rerollShop() {
    if (this.stats.state !== "shop") return;
    if (this.stats.mon < this.stats.shopRerollCost) return;
    this.stats.mon -= this.stats.shopRerollCost;
    const equipped = this.stats.secondaryIds.filter((s): s is SecondaryId => !!s);
    const infl = shopInflation(this.stats.wave) * (1 + 0.2 * this.vr("stingy")) * this.meta.shopMul;   // VOW Stingy Merchant, SHRINE Haggler
    this.stats.shopOffer = this.rollOfferWithLocks(equipped, infl);
    this.emitEvent({ t: "offer", kind: "shop", ids: this.stats.shopOffer.map(it => it.effect) });
    // Slight escalation so reroll spam isn't free.
    if (this.roninFreeReroll) { this.roninFreeReroll = false; this.stats.shopRerollCost = Math.round(SHOP_REROLL_COST * infl * this.meta.rerollMul); }
    else this.stats.shopRerollCost = Math.round(this.stats.shopRerollCost * 1.5);
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
    if (item.locked) { item.locked = false; this.perks.shopLocks = this.perks.shopLocks.filter(l => l.id !== itemId); }   // SHOPLOCK
    this.run.purchases++;
    if (!this.perks.shopBought.includes(item.effect)) this.perks.shopBought.push(item.effect);
    {
      const m = /^dmg_([a-z_]+)_(common|rare|leg)$/.exec(item.effect);
      if (m) this.perks.weaponMastery[m[1]] = (this.perks.weaponMastery[m[1]] ?? 0) + 1;
    }
    this.emitEvent({ t: "pick", kind: "shop", id: item.effect });
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
      this.enforceStatCaps();
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

  closeShop(omen?: OmenId) {
    if (this.stats.state !== "shop") return;
    if (this.omenOffer.length) {
      this.omen = omen && this.omenOffer.includes(omen) ? omen : this.omenOffer[0];
      this.emitEvent({ t: "choice", id: `omen:${this.omen}` });
      this.omenOffer = [];
    }
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
        this.healPlayer(Math.floor(p.maxHp * 0.4));
        break;
      // ===== Stats rework — rarity-tiered upgrades =====
      case "hp_common":
        this.perks.maxHpBonus = Math.round(this.perks.maxHpBonus + (100 + this.perks.maxHpBonus) * 0.06);   // 7.4: was 10%
        p.maxHp = 100 + this.perks.maxHpBonus;
        p.hp = p.maxHp;
        break;
      case "hp_rare":
        this.perks.maxHpBonus += 15;
        p.maxHp = 100 + this.perks.maxHpBonus;
        this.healPlayer(15);
        break;
      case "hp_leg":
        this.perks.maxHpBonus += 40;
        p.maxHp = 100 + this.perks.maxHpBonus;
        this.healPlayer(40);
        break;
      case "dmg_katana_common":
        this.addKatanaDamagePct(0.07);   // 7.4: was 12%
        break;
      case "dmg_katana_rare":
        this.addKatanaDamagePct(0.14);   // 7.4: was 30%
        break;
      case "dmg_katana_leg":
        this.addKatanaDamagePct(0.28);   // 7.4: was 75%
        break;
      case "dex_common":
        this.perks.dexterity += 3;
        break;
      case "dex_rare":
        this.perks.dexterity += 6;
        break;
      case "dex_leg":
        this.perks.dexterity += 12;
        break;
      case "spd_common":
        this.perks.speedMul *= 1.05;
        break;
      case "spd_rare":
        this.perks.speedMul *= 1.08;
        break;
      case "spd_leg":
        this.perks.speedMul *= 1.15;
        break;
      case "def_rare":
        this.perks.defense += 2;
        break;
      case "def_leg":
        this.perks.defense += 4;   // 7.4: was 5
        break;
      case "crit":
        this.perks.critChance = this.perks.critChance + 0.08;
        break;
      case "shop_whetted_eye": this.perks.critChance += 0.04; break;
      case "shop_assassin_ledger": this.perks.critDmgRaw += 0.3; break;
      case "shop_night_lantern": this.perks.critChance += 0.15; this.applyGlassCannon(1, 0.1); break;
      case "shop_wide_brush": this.perks.areaBonus += 0.10; break;
      case "shop_full_quiver": this.perks.extraProjectiles += 1; break;
      case "shop_maneki": this.perks.luck += 0.15; break;
      case "shop_scholar_brush": this.perks.xpBonus += 0.15; break;
      case "shop_lodestone": this.perks.pickupBonus += 0.40; break;
      case "shop_frost_talisman": this.perks.frostChance += 0.08; break;
      case "ult_charge":
        this.addUltCharge(this.stats.ultMax * 0.35);   // 7.4: was 50%
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
        this.perks.secondaryDmgMul += 0.12;   // 7.4: was 15%
        break;
      case "lifesteal":
        this.perks.healOnKill += 1;
        break;
      case "hp_regen":
        this.perks.hpRegen += 0.5;
        break;
      case "shop_lucky_coin": this.perks.monMul += 0.2; break;
      case "shop_bounty": this.perks.eliteBounty += 4; break;
      case "shop_spirit_bell": this.perks.ultChargeMul += 0.12; break;   // 7.4: was 25%
      case "shop_battle_drum": this.perks.abilityHaste += 0.15; break;   // 7.4: was 20%
      case "shop_dash_talisman": this.perks.dashCdMul *= 0.90; break;   // 7.4: was 15%
      case "shop_gamble": this.applyGlassCannon(1.18, 0.12); break;   // 7.4: was +30% / −15%
      case "shop_oni_mask": this.perks.lastStand = true; break;
      case "shop_fire_charm":
        this.perks.fireChance += 0.06;   // 7.4: was 10%
        this.perks.fireDmgMul = Math.max(this.perks.fireDmgMul, 1);
        break;
      case "shop_thunder_charm": this.perks.lightningChance += 0.08; break;
      case "shop_reaper_bell": this.perks.reaperEvery = this.perks.reaperEvery ? Math.max(5, this.perks.reaperEvery - 3) : 10; break;
      case "shop_fortune": this.perks.rerolls += 2; this.perks.banishes += 1; break;
      // ===== Shop perks (perk_*) — implemented as safe stat boosts so
      // none of them can ever crash the game or silently no-op. The
      // descriptions in shop.ts hint at richer mechanics; these
      // simplified implementations preserve the spirit (offense /
      // defense / utility) until full mechanics ship.
      case "perk_crimson_blade":
        this.perks.classDamageMul += 0.10;   // 7.4: was 15%
        this.flash("Crimson Blade");
        break;
      case "perk_stone_stance":
        // "−20% dmg taken / +15% dmg dealt" → permanent partial buff,
        // clamped by the global 15% damage-reduction cap.
        this.perks.damageTakenMul *= 0.90;
        this.perks.classDamageMul += 0.10;
        this.flash("Stone Stance");
        break;
      case "perk_ghost_steps":
        this.perks.speedMul *= 1.05;   // 7.4: was 10% (more than the rare boots)
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
        this.perks.classDamageMul += 0.05;   // 7.4: was 8%
        this.flash("War Paint");
        break;
      case "perk_cursed_eye":
        this.perks.critChance += 0.05;
        this.perks.classDamageMul += 0.05;
        this.flash("Cursed Eye");
        break;
      case "perk_raging_current":
        this.perks.attackCooldownMul = Math.max(MIN_ATTACK_COOLDOWN_MUL, this.perks.attackCooldownMul * 0.90);
        this.flash("Raging Current");
        break;
      case "perk_twin_fang":
        this.perks.secondaryDmgMul += 0.25;
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
        this.perks.maxHpBonus = Math.min(MAX_HP_CAP - 100, this.perks.maxHpBonus + 20);   // 7.4: was 30
        if (this.player) {
          this.player.maxHp = Math.min(MAX_HP_CAP, 100 + this.perks.maxHpBonus);
          this.healPlayer(20);
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
          // Percent of the weapon's current base damage, added on the bonus channel.
          const def = SECONDARIES[wid];
          const base = this.baseKatanaDamage * def.damageMul * def.dmgScale;
          const pct = tier === "common" ? 0.10 : tier === "rare" ? 0.20 : 0.40;   // 7.4: was 12/30/75%
          this.perks.weaponDamageBonus[wid] = cur + base * pct;
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
