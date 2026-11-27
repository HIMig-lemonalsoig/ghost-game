// ─── Class signature passives ─────────────────────────────────────────────────
// Every class gets ONE passive that changes how it plays, not just a number.
// 16 classes already had one (described here); the 9 that only changed stats
// got a new one in Phase 5 (marked `added`). Behaviour lives in GhostGame.ts
// (search "SIGNATURE"); tuning numbers are below.
import type { ClassId } from "../GhostGame";

export interface Signature { name: string; kanji: string; desc: string; added?: boolean; }

export const SIGNATURES: Record<ClassId, Signature> = {
  kensei:     { name: "Focus",           kanji: "心", added: true, desc: "Stand still for 0.6s and your next katana swing is a guaranteed crit with a 60% wider arc." },
  shinobi:    { name: "Vanish",          kanji: "隠", added: true, desc: "After a dash you vanish for 1.2s (enemies lose you) until you attack. Stealth kills refund your dash." },
  ronin:      { name: "Masterless",      kanji: "浪", added: true, desc: "The merchant offers 7 items and your first reroll each visit is free — but level-ups offer only 2 cards." },
  yamabushi:  { name: "Mountain Prayer", kanji: "祈", added: true, desc: "Healing past full HP (regen, kill heals) becomes a shield that soaks damage, up to 30." },
  onna:       { name: "Sweeping Stance", kanji: "薙", added: true, desc: "Hitting 3 or more enemies with one katana swing instantly refunds your dash." },
  arashi:     { name: "Tailwind",        kanji: "嵐", added: true, desc: "Projectiles pierce 1 extra enemy. Ranged kills give +5% move speed for 3s (stacks 5×)." },
  tetsubo:    { name: "Unstoppable",     kanji: "鉄", added: true, desc: "Immune to slows and roots. Enemies you smash into other enemies are stunned and take damage." },
  ashigaru:   { name: "Spear Wall",      kanji: "槍", added: true, desc: "Stand still for 0.4s to brace your spear: enemies that run into you take damage and are thrown back." },
  tengu:      { name: "Feather Dash",    kanji: "羽", added: true, desc: "Dashing through enemies leaves feathers that burst a moment later. Projectiles pass through you mid-dash." },
  dokkaebi:   { name: "Cursed Kin",      kanji: "鬼", desc: "Kills have a 5% chance to raise an allied ghost that fights for you." },
  kagemusha:  { name: "Decoy",           kanji: "影", desc: "Every 15s a decoy appears and draws enemy attention for 3s." },
  berserker:  { name: "Oni Blood",       kanji: "怒", desc: "Damage rises up to +40% as your HP drops toward 20%." },
  samurai:    { name: "Bushido",         kanji: "侍", desc: "Each hit you take adds +10% damage to your next attack (stacks 5×)." },
  onmyoji:    { name: "Spirit Orbs",     kanji: "陰", desc: "Casting an ability leaves a spirit orb that damages foes for 5s." },
  hatamoto:   { name: "Golden Shield",   kanji: "旗", desc: "Taking damage raises a golden shield that blocks the next hit (10s cooldown)." },
  kunoichi:   { name: "Venom Rhythm",    kanji: "女", desc: "Every 4th attack automatically poisons the target." },
  tsuchigumo: { name: "Web",             kanji: "蜘", desc: "Kills can web nearby foes for 2s; webbed foes take double damage." },
  miko:       { name: "Divine Barrier",  kanji: "巫", desc: "A barrier absorbs one hit every 20s." },
  kagebushi:  { name: "Shadow Clone",    kanji: "影", desc: "An untargetable clone copies your attacks at 40% damage." },
  kitsune:    { name: "Foxfire",         kanji: "狐", desc: "Hits can ignite foes; kills can release a homing foxfire." },
  raijin:     { name: "Drumroll",        kanji: "雷", desc: "Every 6th hit calls a chain-lightning bolt (3 jumps)." },
  yukionna:   { name: "Chill",           kanji: "雪", desc: "Every hit chills (slows) the target; chilled foes take +15% damage." },
  sohei:      { name: "Thorns",          kanji: "僧", desc: "Attackers take 60% of the damage they deal you." },
  kappa:      { name: "Splash",          kanji: "河", desc: "Every 4th hit splashes nearby foes for 60% damage." },
  kabuki:     { name: "Showstopper",     kanji: "歌", desc: "Critical hits heal 1 HP (once every 0.5s)." },
  teppo:      { name: "Matchlock",       kanji: "砲", desc: "Every 4th shot is a matchlock blast: 3× damage and it pierces." },
  takajo:     { name: "Hunting Hawk",    kanji: "鷹", desc: "Your hawk dives on the nearest foe every 3s." },
  karakuri:   { name: "Wind-up Turret",  kanji: "機", desc: "Every 12s you set down a turret that shoots nearby foes for 6s." },
  bakuto:     { name: "Lucky Die",       kanji: "賽", desc: "Each wave starts with a die roll: +damage, +crit, +speed, +defense, coins or ult charge for that wave." },
  rikishi:    { name: "Shove",           kanji: "力", desc: "Dashing shoves foes out of your path and stuns them for 0.5s." },
  sumie:      { name: "Ink Brush",       kanji: "墨", desc: "Every 5th hit paints an ink pool that slows foes inside it." },
};

export const SIG = {
  kenseiFocusTime: 0.6, kenseiArcMul: 1.6,
  shinobiVanish: 1.2,
  roninShopSlots: 7, roninCards: 2,
  yamaShieldMax: 30,
  onnaHits: 3,
  arashiPierce: 1, arashiStack: 0.05, arashiMaxStacks: 5, arashiTime: 3,
  tetsuboClashRadius: 48, tetsuboStun: 0.6, tetsuboClashDmg: 0.6,
  ashigaruBraceTime: 0.4, ashigaruDmg: 1.2, ashigaruCd: 0.6,
  tenguFeatherDelay: 0.45, tenguBurstRadius: 70, tenguDmg: 1.5,
};
