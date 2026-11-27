// ─── Patch notes ─────────────────────────────────────────────────────────────
// Newest first. Each line is tagged so the screen can colour it:
//   new    – a feature or content that wasn't there before
//   buff   – something got stronger / easier for the player
//   nerf   – something got weaker / harder for the player
//   change – reworked or rebalanced without a clear up/down
//   fix    – a bug fix
// Add a new entry at the top for every update (and bump the version).

export type NoteTag = "new" | "buff" | "nerf" | "change" | "fix";
export interface PatchNote { version: string; date: string; title: string; kanji: string; summary: string; lines: [NoteTag, string][]; }

export const PATCH_NOTES: PatchNote[] = [
  {
    version: "2.6", date: "2026-11-26", title: "Find Your Way", kanji: "道",
    summary: "A minimap and arrows that point to the important stuff.",
    lines: [
      ["new", "Minimap in the top-right corner: the whole arena, your view, enemies, elites (purple), the boss (pulsing red), altars, Spirit Chests and items."],
      ["new", "Edge arrows point to off-screen altars 祭, Spirit Chests 宝, items 品 and the boss 鬼, with the distance in metres."],
      ["new", "Settings: Minimap and Arrows switches (both on by default)."],
      ["change", "The DPS meter moves below the minimap when both are on."],
    ],
  },
  {
    version: "2.5", date: "2026-11-26", title: "Dodge Pass", kanji: "避",
    summary: "Every boss attack can now be dodged up close.",
    lines: [
      ["buff", "Boss ground slam: hits once inside the drawn circle, which shrank from 260 px to 150 px. Warning is 0.75 s (0.6 s in the last phase)."],
      ["buff", "Boss orb volleys: 7 / 9 / 11 orbs (was 9 / 12 / 15). They leave the boss's edge slowly and speed up, so you can step between them."],
      ["buff", "Nine-Tailed Witch foxfire fan: 4 / 5 / 6 fireballs (was 5 / 7 / 9), wider gaps, slow start."],
      ["new", "Boss charges (Thunder General, Oni last phase) show a red danger lane for 0.4 s before each dash."],
      ["fix", "Thunder General's triple charge had no warning at all."],
    ],
  },
  {
    version: "2.4", date: "2026-11-26", title: "Lacquer & Gold Leaf", kanji: "漆",
    summary: "A full visual pass on menus and the HUD.",
    lines: [
      ["new", "Lacquered panels with gold corner brackets and ornament dividers on every screen."],
      ["new", "Main buttons shimmer and glow where your mouse is. The selected class card has a light running around its border."],
      ["new", "Ultimate charge shows as a ring of ticks around the ult orb; a light circles it when it's ready."],
      ["change", "Cleaner main-menu toolbar, framed hotbar and nameplate, ornate wave title, restyled pause menu and switches."],
      ["change", "Legendary shop and level-up cards get a travelling gold border."],
    ],
  },
  {
    version: "2.3", date: "2026-11-26", title: "Iai Draw", kanji: "居",
    summary: "A brand-new opening.",
    lines: [
      ["new", "New intro: ember smoke, ink soaking into a paper moon, 幽剣 drawn with a brush and filled with crimson ink, then a sword slash that splits the title."],
      ["change", "Skip with the Skip button, a click or any key. Reduced-motion settings skip it automatically."],
    ],
  },
  {
    version: "2.2", date: "2026-11-26", title: "Wardrobe", kanji: "装",
    summary: "Change how you look, and clones that fight like people.",
    lines: [
      ["new", "Wardrobe on the main menu: 32 outfits, headgear, sword kits and sashes. Looks only, no stats."],
      ["new", "Flowers 花: a cosmetic currency from every run (2 per wave, 5 per boss, 1 per 40 kills). Saves got up to 400 for past runs."],
      ["new", "16 cosmetics are earned from challenges (bosses, waves, stealth kills, chests…), with a pop-up when you earn one."],
      ["new", "Sword kits change the colour of your slash. Sashes, capes and headband tails flutter behind you."],
      ["change", "Kagemusha's clones fight like a real swordsman: they pick targets, wind up, lunge, circle and sidestep attacks. Same damage."],
      ["change", "Kagebushi's echo clone has a proper silhouette and a visible sword swing."],
      ["new", "Guide: Wardrobe & Flowers tab and a Fighting Bosses section."],
    ],
  },
  {
    version: "2.1", date: "2026-11-26", title: "Ultimate Showcase", kanji: "極",
    summary: "Ult tier list: better looks for weak-looking ults, power evened out.",
    lines: [
      ["new", "New ult effects: Kabuki spotlight, Raijin drum ring, Kitsune nine tails, Tengu whirlwind, Berserker flames, Yamabushi stone mandala, Shinobi afterimages, Kagebushi void tendrils, Kagemusha ink clone, Ashigaru palisade with banners, Samurai golden Iai path."],
      ["change", "Enemy vision cones fade while an ult runs (they used to cover the effect in a red blob)."],
      ["nerf", "Berserker Blood Rage: bonus per hit 9.7 → 4.1 (148 → 71 grunts' worth)."],
      ["nerf", "Kabuki Grand Finale: 9.3 → 4.1 (143 → 73)."],
      ["nerf", "Yamabushi Mountain's Endurance: 15 → 7 (133 → 67)."],
      ["nerf", "Hatamoto Shogun's Decree: 7 → 3.8 (111 → 68)."],
      ["nerf", "Kagebushi Shadow Consume: 8.2 → 4.8 (111 → 72)."],
      ["buff", "Tetsubo Earthbreaker: damage ×1.62 → ×2.6 (32 → 61)."],
      ["buff", "Ashigaru Spear Wall: ×0.38 → ×1.3 (18 → 48)."],
      ["buff", "Tengu Divine Wind: bonus per hit 1 → 3.4 (17 → 44)."],
      ["buff", "Kunoichi Phantom Dance: ×0.09 → ×0.13 (35 → 45)."],
      ["change", "Every class's ult now measures 44–73 grunts' worth (target 60)."],
    ],
  },
  {
    version: "2.0.2", date: "2026-11-26", title: "Economy Patch", kanji: "文",
    summary: "Omens were printing money.",
    lines: [
      ["nerf", "Blood Moon: ×2 coins → +30% coins per kill (+40% enemies unchanged)."],
      ["nerf", "Iron Tide: +60% coins → +35%."],
      ["nerf", "Skipping a level-up card: 15 × wave coins → 10 × wave."],
    ],
  },
  {
    version: "2.0.1", date: "2026-11-26", title: "Melee Bosses", kanji: "隙",
    summary: "Bosses can be fought up close.",
    lines: [
      ["buff", "Boss slam wind-up 0.2 s → 0.6 s, with a danger circle that fills in."],
      ["buff", "Boss orb volleys always wind up at least 0.6 s, with energy gathering on the boss."],
      ["new", "After every attack the boss is winded for about 1 s and shows 隙 opening: your chance to hit it."],
      ["buff", "Nine-Tailed Witch: shows where she'll teleport with foxfire, lands closer, is dazed after, teleports less and never twice in a row, backs away slower."],
    ],
  },
  {
    version: "2.0", date: "2026-11-26", title: "The Balance Pass", kanji: "衡",
    summary: "Phase 7: ults, shop, coins and pacing rebuilt from research and bot playtests.",
    lines: [
      ["change", "Ults scale with your build instead of the wave number."],
      ["nerf", "One ult can take at most 12% of a boss's HP (used to delete bosses)."],
      ["change", "Ults charge Hades-style from damage dealt and taken, not kills. Late waves give 3–4 ults instead of 7–12."],
      ["nerf", "Shop: legendaries from wave 4 at 2% rising to 8% (was ~24% of slots), with bad-luck protection."],
      ["nerf", "Legendary item strength: e.g. damage +75% → +28%. Legendary prices rise faster."],
      ["nerf", "Coins: drop chance falls after wave 5, prices rise faster after wave 8, Endless income tapers."],
      ["change", "Level-up cards about 60 / 33 / 5 common / rare / legendary. Ability cards guaranteed while a slot is empty."],
      ["buff", "First boss (wave 5) has 75% HP and damage. Early elites have 75% HP. The wave after a boss is a breather."],
      ["new", "Damage breakdown by source in the run recap, and a Balance report in dev mode."],
      ["change", "Compact ult banner, class-coloured auras on power-up ults, no more white blobs, warnings stay visible during ults."],
      ["fix", "Kunoichi's poison did 0 damage."],
      ["change", "Kunoichi's ult is steered with WASD instead of the mouse."],
    ],
  },
  {
    version: "1.9", date: "2026-11-20", title: "Yūken", kanji: "幽",
    summary: "The game got its name, and a lot of new systems.",
    lines: [
      ["new", "Renamed to Yūken (幽剣, 'ghost blade')."],
      ["new", "Level-up reroll, banish and skip (skip pays coins)."],
      ["new", "End-of-run recap, run history and a bestiary with lore."],
      ["new", "Unlocks and the Shrine of Ancestors (Spirit Embers buy small permanent blessings)."],
      ["new", "Shop lock: keep up to 2 items for next wave."],
      ["new", "Daily run: the same seed and class for everyone each day."],
      ["new", "Omens (pick a modifier for the next wave) and arena altars (stand in one to trade)."],
      ["new", "Controller support, accessibility options, DPS meter, pickup radius and phone vibration."],
      ["change", "Soft caps on every stat: stacking the same stat gives a little less each time."],
      ["nerf", "Ultimates charge more slowly."],
      ["new", "New sound effects and composed music."],
    ],
  },
];

export const LATEST_PATCH = PATCH_NOTES[0].version;
