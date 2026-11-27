// ─── Ultimate perks ───────────────────────────────────────────────────────────
// Level-up perks that improve your ultimate. General ones can show up for any
// class; each class also has one signature upgrade that is ONLY offered while
// playing that class (and has a 1-in-5 chance per level-up to be slotted in
// until you take it). Effects live in GhostGame.ts (search "ULTPERK").
import type { ClassId } from "../GhostGame";

export interface UltPerk {
  id: string;
  kanji: string;
  name: string;
  desc: string;
  rarity: "common" | "rare" | "legendary";
  cls?: ClassId;        // only offered to this class
  unique?: boolean;     // can be taken once
}

export const GENERAL_ULT_PERKS: UltPerk[] = [
  { id: "ult_power_c",   kanji: "極", name: "Honed Spirit",    rarity: "common",    desc: "Ultimate damage +15% (stacks)." },
  { id: "ult_power_r",   kanji: "極", name: "Fierce Spirit",   rarity: "rare",      desc: "Ultimate damage +30% (stacks)." },
  { id: "ult_start_c",   kanji: "始", name: "Battle Ready",    rarity: "common",    desc: "Start every wave with at least 25% ultimate charge.", unique: true },
  { id: "ult_harvest_c", kanji: "魂", name: "Soul Harvest",    rarity: "common",    desc: "Each kill during your ultimate refills 4% of the gauge.", unique: true },
  { id: "ult_refund_r",  kanji: "還", name: "Echoing Soul",    rarity: "rare",      desc: "Using your ultimate refunds 25% of the gauge.", unique: true },
  { id: "ult_ward_r",    kanji: "護", name: "Unbroken Will",   rarity: "rare",      desc: "Casting your ultimate grants 2s of invulnerability and heals 15% HP.", unique: true },
  { id: "ult_linger_r",  kanji: "久", name: "Lingering Power", rarity: "rare",      desc: "Ultimates that last a while last 30% longer.", unique: true },
  { id: "ult_after_l",   kanji: "震", name: "Aftershock",      rarity: "legendary", desc: "When your ultimate ends, a shockwave blasts every foe around you.", unique: true },
];

export const CLASS_ULT_PERKS: UltPerk[] = ([
  { id: "ultc_kensei",     cls: "kensei",     kanji: "閃", name: "Endless Draw",    desc: "Iaijutsu Strike dashes 50% farther through a wider corridor." },
  { id: "ultc_shinobi",    cls: "shinobi",    kanji: "影", name: "Shadow Feast",    desc: "Kills during Shadow Step heal 3 HP and extend it by 0.5s." },
  { id: "ultc_ronin",      cls: "ronin",      kanji: "債", name: "Compound Debt",   desc: "Crimson Debt brands 5 foes and costs only 10% HP." },
  { id: "ultc_yamabushi",  cls: "yamabushi",  kanji: "山", name: "Mountain's Root", desc: "Mountain stance lasts 2s longer and heals 30 more HP." },
  { id: "ultc_onna",       cls: "onna",       kanji: "薙", name: "Wider Storm",     desc: "Thousand Cuts reaches 50% farther." },
  { id: "ultc_dokkaebi",   cls: "dokkaebi",   kanji: "鬼", name: "Endless Horde",   desc: "Cursed Horde releases 8 ghosts instead of 5." },
  { id: "ultc_kagemusha",  cls: "kagemusha",  kanji: "双", name: "Third Shadow",    desc: "Twin Shadows summons two clones." },
  { id: "ultc_berserker",  cls: "berserker",  kanji: "怒", name: "Blood Frenzy",    desc: "Kills during Blood Rage extend it by 0.5s." },
  { id: "ultc_arashi",     cls: "arashi",     kanji: "雹", name: "Hailstorm",       desc: "Storm of Heaven covers a 45% wider area and lasts 1s longer." },
  { id: "ultc_tetsubo",    cls: "tetsubo",    kanji: "裂", name: "Fault Line",      desc: "Earthbreaker reaches 40% farther in a wider cone." },
  { id: "ultc_samurai",    cls: "samurai",    kanji: "居", name: "Unbroken Chain",  desc: "Iai Chain strikes 3 more times." },
  { id: "ultc_onmyoji",    cls: "onmyoji",    kanji: "陰", name: "Eye of the Storm", desc: "Spirit Tempest pulls from 35% farther away." },
  { id: "ultc_hatamoto",   cls: "hatamoto",   kanji: "旗", name: "Shogun's Will",   desc: "Standing in your banner heals 2 HP per second." },
  { id: "ultc_kunoichi",   cls: "kunoichi",   kanji: "舞", name: "Fourth Phantom",  desc: "Phantom Dance splits into 4 afterimages and the final cut hits 50% harder." },
  { id: "ultc_tsuchigumo", cls: "tsuchigumo", kanji: "毒", name: "Venom Web",       desc: "Death Web also poisons every foe caught in it." },
  { id: "ultc_miko",       cls: "miko",       kanji: "陽", name: "Radiance",        desc: "Divine Judgement's pillar is 55% wider." },
  { id: "ultc_kagebushi",  cls: "kagebushi",  kanji: "淵", name: "Abyss",           desc: "When Shadow Consume ends, the dark erupts and hits every nearby foe." },
  { id: "ultc_kitsune",    cls: "kitsune",    kanji: "狐", name: "Fourteen Tails",  desc: "Nine Tails releases 14 foxfires." },
  { id: "ultc_raijin",     cls: "raijin",     kanji: "雷", name: "Thunderhead",     desc: "Heaven's Drum lightning jumps to 5 foes instead of 3." },
  { id: "ultc_yukionna",   cls: "yukionna",   kanji: "凍", name: "Absolute Zero",   desc: "Eternal Winter's storm is 40% bigger and freezing a foe deals damage." },
  { id: "ultc_sohei",      cls: "sohei",      kanji: "輪", name: "Iron Sutra",      desc: "Prayer Wheel reaches 40% farther and heals 8% per pulse." },
  { id: "ultc_ashigaru",   cls: "ashigaru",   kanji: "槍", name: "Pike Line",       desc: "Spear Wall is 50% longer." },
  { id: "ultc_kappa",      cls: "kappa",      kanji: "波", name: "Riptide",         desc: "Tidal Surge is 45% wider and its final crash hits twice as hard." },
  { id: "ultc_tengu",      cls: "tengu",      kanji: "風", name: "Gale Lord",       desc: "Divine Wind lasts 2s longer." },
  { id: "ultc_kabuki",     cls: "kabuki",     kanji: "幕", name: "Encore",          desc: "The Grand Finale lasts 2s longer." },
  { id: "ultc_teppo",      cls: "teppo",      kanji: "斉", name: "Fourth Rank",     desc: "Three Ranks Fire fires a fourth volley." },
  { id: "ultc_takajo",     cls: "takajo",     kanji: "狩", name: "Full Mews",       desc: "Sky Hunt calls seven hawks instead of five." },
  { id: "ultc_karakuri",   cls: "karakuri",   kanji: "繰", name: "Tightly Wound",   desc: "Clockwork Battalion turrets run for 11s." },
  { id: "ultc_bakuto",     cls: "bakuto",     kanji: "運", name: "Loaded Dice",     desc: "Fortune's Edge lasts 8s instead of 6s." },
  { id: "ultc_rikishi",    cls: "rikishi",    kanji: "土", name: "Yokozuna",        desc: "Dohyō Stomp stomps four times." },
  { id: "ultc_sumie",      cls: "sumie",      kanji: "虎", name: "Masterwork",      desc: "The ink tiger lives 8s instead of 6s." },
] as Omit<UltPerk, "rarity" | "unique">[]).map(p => ({ ...p, rarity: "rare" as const, unique: true }));

export const ULT_PERKS: UltPerk[] = [...GENERAL_ULT_PERKS, ...CLASS_ULT_PERKS];
export const ULT_PERK_BY_ID = Object.fromEntries(ULT_PERKS.map(p => [p.id, p])) as Record<string, UltPerk>;
