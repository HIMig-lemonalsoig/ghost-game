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
    version: "3.11.1", date: "2026-11-27", title: "Smoother Strides", kanji: "歩",
    summary: "New walk and sprint for the samurai, and no more shaking when you run down.",
    lines: [
      ["new", "The samurai has a new walk and a much faster-looking sprint (made in PixelLab), replacing the old run."],
      ["fix", "Running down no longer jitters: frames line up on the chest instead of the swinging sword, the half-turned frames are gone, and the animation plays back and forth instead of snapping."],
      ["fix", "Moving diagonally no longer flickers between the side view and the front/back view."],
      ["fix", "Melee weapons other than the katana (war fan, spear, sai, axes…) no longer hang across the pixel-art body spinning with your cursor. They only appear during a swing, so the swing arc still shows. Bows and guns still show, since they aim."],
      ["fix", "Every body now centres on its chest, so switching between idle, walk, run and attack doesn't nudge the character sideways."],
    ],
  },
  {
    version: "3.11", date: "2026-11-27", title: "Every Direction", kanji: "四",
    summary: "The samurai can now be seen from behind and from the front.",
    lines: [
      ["new", "Running up shows the samurai from behind, with the gold crest on his back plate; running down shows him walking toward the camera. Left and right still use the side view."],
      ["new", "Standing still while aiming straight up, the samurai turns to face away from you."],
      ["change", "The direction arrow at your feet hides while you run up, since the back view already shows the way you're going."],
      ["new", "Red ronin enemies use the same back and front views when they walk up or down."],
      ["change", "New poses made with PixelLab from the CraftPix samurai (offline version only). Other bodies keep the side view with lean and dust for now."],
    ],
  },
  {
    version: "3.10.2", date: "2026-11-27", title: "Feel the Run", kanji: "走",
    summary: "Running up and down now looks and feels like it, even though the art is side-on.",
    lines: [
      ["new", "Your character leans into the run: further forward when heading up, slightly back when heading down, with a little squash and stretch on each stride."],
      ["new", "Dust puffs kick up behind your feet while running, and more during a dash."],
      ["new", "While moving, a chevron in your class colour beside the ring at your feet points the way you're going."],
      ["change", "Enemies lean into their walk the same way."],
    ],
  },
  {
    version: "3.10.1", date: "2026-11-27", title: "Face Forward", kanji: "向",
    summary: "Pixel-art characters now face the way they're moving.",
    lines: [
      ["fix", "You no longer moonwalk: while running, your character faces the way you're going. When you attack, guard or stand still, they turn to face your cursor."],
      ["fix", "Enemies and bosses face the way they walk, and turn toward you when they stop or attack."],
      ["change", "Running straight up or down keeps the side you were last facing (the art is side-on)."],
    ],
  },
  {
    version: "3.10", date: "2026-11-27", title: "Oni and Thunder", kanji: "雷",
    summary: "The last two bosses get pixel-art bodies, hand-drawn for Yūken.",
    lines: [
      ["new", "Oni Warlord (wave 5): a hulking red oni with horns, a wild mane, a tiger-skin loincloth and a studded iron kanabō. He raises it overhead while the slam warning fills, then smashes it down."],
      ["new", "Raijin, the Thunder General (wave 20): a blue thunder god inside a ring of eight war drums with a drumstick. The drums light up while he charges a volley."],
      ["change", "Both are drawn in-game in the same pixel style as the other characters, so the offline file doesn't get any bigger. Their attacks and warnings are unchanged."],
    ],
  },
  {
    version: "3.9", date: "2026-11-27", title: "Rise of the Bones", kanji: "骸",
    summary: "The Gashadokuro is now a towering pixel-art skeleton, and skeletons join the enemy ranks.",
    lines: [
      ["new", "Gashadokuro (wave 15 boss) is now a giant skeleton warrior with a sword and shield. Its fist-slam warnings are unchanged."],
      ["new", "From wave 15 on, about a third of foot soldiers, archers and shield-bearers rise as skeletons: spearmen, bone archers and shield warriors. Looks only: same stats as before."],
      ["fix", "Health bars and boss nameplates now sit above pixel-art characters' heads instead of over their bodies."],
      ["change", "Art: CraftPix Skeleton pack (licensed, offline version only)."],
    ],
  },
  {
    version: "3.8", date: "2026-11-27", title: "Pixel Yokai", kanji: "妖",
    summary: "The first yokai get pixel-art bodies: the Kitsune boss and two kinds of tengu.",
    lines: [
      ["new", "The Nine-Tailed Witch (wave 10 boss) is now a full pixel-art kitsune with all nine tails. Her attack warnings are unchanged."],
      ["new", "Assassins are now Karasu tengu: crow-headed yokai with wings and a blade."],
      ["new", "Healer Monks are now Yamabushi tengu: red-faced mountain spirits. Their green healing ring still shows their range."],
      ["new", "Playing as Kitsune, Tengu or Yamabushi gives you the matching yokai body."],
      ["change", "Oni Warlord, Gashadokuro, Raijin and the other yokai keep their old look until we find art for them. Art: CraftPix Yokai pack (licensed, offline version only)."],
    ],
  },
  {
    version: "3.7", date: "2026-11-27", title: "Pixel Samurai", kanji: "絵",
    summary: "You and the human enemies are now animated pixel-art samurai instead of circles.",
    lines: [
      ["new", "Your character is a pixel-art samurai that idles, runs, swings through a 3-hit combo, raises a guard and flinches when hit. Heavy classes (Tetsu-bo, Berserker, Sōhei, Yamabushi, Rikishi, Hatamoto, Ashigaru, Dokkaebi) wear the banner commander; Takajō and Teppō use the archer."],
      ["new", "Enemies: foot soldiers are red ronin, assassins are violet shinobi, archers draw real bows, and heavies / shield-bearers are banner commanders. They walk, attack, flinch and play a death animation."],
      ["change", "Bodies face left or right toward where they're aiming. Swing arcs, attack warnings and hitboxes are exactly the same as before."],
      ["change", "A ring in your class colour sits under your feet so you stand out. Yokai, bosses and Wardrobe outfits keep their old look for now."],
      ["new", "Settings → Pixel-art characters switches back to the old look. Art: CraftPix Samurai pack (licensed)."],
    ],
  },
  {
    version: "3.6", date: "2026-11-27", title: "A Real Map", kanji: "図",
    summary: "The minimap now shows the actual arena, and you can make it bigger or smaller.",
    lines: [
      ["new", "The minimap is painted from the arena itself: ground colour, rocks, bamboo, pines, ice, embers, lanterns and flagstones all show as little map symbols, with the fence around the edge."],
      ["new", "Incoming boss and enemy attacks (slams, bombs, bolts) flash as red circles on the map."],
      ["change", "Enemies have dark outlines so they stand out on every biome, elites are bigger purple dots, and the boss shows a 鬼 marker."],
      ["change", "Chests, altars and items have clearer icons, your arrow is bigger, and the map shows a 北 north mark and the biome name."],
      ["new", "Minimap size slider (60%–200%) under the Minimap switch in Settings and in Accessibility. Arrows and the DPS meter move out of its way."],
    ],
  },
  {
    version: "3.5", date: "2026-11-27", title: "Tomoe Cursor", kanji: "巴",
    summary: "A big, easy-to-find aiming cursor in the shape of a tomoe clan crest, with a size slider.",
    lines: [
      ["new", "The thin crosshair is replaced by a gold Tomoe crest with a dark outline, so it stands out on grass, Blood Moon red and snow alike."],
      ["new", "It spins faster and gets a bright pulsing ring when your ultimate is ready, and kicks inward every time you attack."],
      ["change", "Turn it off under Settings → Big crest cursor to go back to the old crosshair. Menus still use the normal pointer."],
      ["new", "Cursor size slider (50%–200%) right under the toggle in Settings and in Accessibility, with a live spinning preview. Your size is saved."],
    ],
  },
  {
    version: "3.4", date: "2026-11-27", title: "Six New Classes", kanji: "六",
    summary: "Six new classes, each with its own signature, ultimate and unlock challenge.",
    lines: [
      ["new", "Teppō (gunner): every 4th shot is a matchlock blast (3× damage, pierces). Ult Three Ranks Fire: rolling volleys down a line. Unlock: reach wave 10 as Arashi."],
      ["new", "Takajō (falconer): a hawk dives on the nearest foe every 3s. Ult Sky Hunt: five hawks hunt for 6s. Unlock: 1,500 total kills."],
      ["new", "Karakuri-shi (tinkerer): sets down a wind-up turret every 12s. Ult Clockwork Battalion: three turrets for 8s. Unlock: open 25 chests."],
      ["new", "Bakuto (gambler): each wave starts with a lucky die (damage, crit, speed, defense, coins or ult charge). Ult Roll of Fate: 2d6, from thunder strikes to Fortune's Edge (guaranteed crits) to a jackpot blast with coins. Unlock: reach wave 18 with any class."],
      ["new", "Rikishi (sumo): dashing shoves foes aside and stuns them. Ult Dohyō Stomp: three huge stomps that pull foes in. Unlock: reach wave 10 as Tetsubō."],
      ["new", "Sumi-e Painter: every 5th hit paints an ink pool that slows foes. Ult Living Ink: a painted tiger hunts for 6s. Unlock: reach wave 10 as Onmyōji."],
      ["change", "All six ultimates are tuned to the same damage budget as the existing classes (measured 53–65, target 60), and each has its own ult perk card."],
    ],
  },
  {
    version: "3.3", date: "2026-11-27", title: "New Yokai", kanji: "妖",
    summary: "Eight new enemies, each with one clear job, fill out waves 11–19.",
    lines: [
      ["new", "Boar Spirit (wave 11): paws the ground, shows a red lane, then charges. Hits a wall and stuns itself."],
      ["new", "Mimic Chest (wave 12, rare): looks like a Spirit Chest and bites when you get close. Kill it and it drops a real one."],
      ["new", "Kappa Raider (wave 13): creeps up as a ripple and bursts out of the water when you're close."],
      ["new", "Taiko Drummer (wave 14): its drumbeats make nearby foes 35% faster. Kill it first."],
      ["new", "Tsukumogami (wave 16): a haunted one-eyed umbrella that splits into two little ones when killed."],
      ["new", "Yumi Sniper (wave 17): draws a long red aim line, locks on, then fires a very fast arrow."],
      ["new", "Mukade (wave 18): a giant centipede that leaves a poison trail."],
      ["new", "Yuki-warashi (wave 19): drops frost rings on you that slow you if you don't step out."],
      ["change", "New enemies take their share of spawns by weight: by wave 19, 20 enemy types appear instead of 11, and plain grunts stay at about 15%."],
      ["nerf", "Waves 12–20 are a little tougher: the average enemy has about 4–8% more HP (damage almost unchanged)."],
      ["new", "All eight are in the Bestiary with tips and lore, and each shows a one-time tip the first time you meet it."],
    ],
  },
  {
    version: "3.2", date: "2026-11-27", title: "Every Stat Has a Path", kanji: "道",
    summary: "Six stats that had no perks or items now have full lines, and builds come together faster.",
    lines: [
      ["new", "Area: Broad Sweep, Shockwave Stance, Heaven and Earth (+area and melee reach). Explosions, smoke, petals, Reaper's Toll and Aftershock all grow with area."],
      ["new", "Projectiles: Extra Kunai (+1 projectile), Piercing Shot (+1 pierce), Storm of Steel (+1 projectile, +1 pierce, faster shots). Only offered if you carry a thrown or shot weapon."],
      ["new", "Luck: Lucky Charm and Fortune's Favour. Luck makes rare and legendary cards and shop items more common and items drop more often."],
      ["new", "XP: Diligent Study and Scholar's Scroll. Pickup: Magnet Charm and Spirit Pull (bigger pickup radius for XP, ammo and items)."],
      ["new", "Frost (new element): Frostbite Edge (chill on hit, slows), Deep Freeze (3 hits on a chilled foe freeze it), Winter's Heart (frozen foes shatter on death and chill everything nearby)."],
      ["new", "Shop items: Wide Brush (area), Full Quiver (+1 projectile), Maneki-neko (luck), Scholar's Brush (XP), Lodestone (pickup), Frost Talisman (chill)."],
      ["change", "Family weighting: once you own a card from a family (crit, area, frost, fire, poison…), the rest of that family shows up 1.5× as often."],
      ["change", "New stats have diminishing returns like the others, and show in the pause screen once you have them."],
    ],
  },
  {
    version: "3.1", date: "2026-11-27", title: "The Crit Update", kanji: "会",
    summary: "Crit builds are real now: more crit chance, and a brand-new crit damage stat.",
    lines: [
      ["new", "New stat: Crit damage. Crits still start at ×3; crit damage perks and items add to it (never above ×5). Shown in the pause screen."],
      ["new", "Level-up perks: Steady Aim (+5% crit), Hawk's Eye (+10% crit, +5% more for 2s after a dash), Heaven's Eye (+15% crit; crits mark foes to take +10% damage for 3s)."],
      ["new", "Level-up perks: Deep Cut (+25% crit damage), Bone Splitter (+50% crit damage), Death Blossom (crits burst into petals that hit nearby foes for about 40% of the crit)."],
      ["new", "Shop items: Whetted Eye (+4% crit), Assassin's Ledger (+30% crit damage), Night Lantern (+15% crit, −10% max HP)."],
      ["change", "Crit damage cards and the Ledger only show up once you have at least 15% crit, so they're never wasted picks."],
    ],
  },
  {
    version: "3.0.2", date: "2026-11-27", title: "Spawn Table Fix", kanji: "群",
    summary: "Late waves had stopped spawning some enemy types entirely.",
    lines: [
      ["fix", "From wave 10 the enemy chances added up to over 100%, so the last types in the list were squeezed out: heavies vanished after wave ~13, assassins after ~16, and plain grunts after wave 10."],
      ["change", "Enemy types now share the spawns by weight, so every unlocked type keeps appearing, and plain grunts always make up about 15% of regular spawns."],
      ["nerf", "Late waves are slightly tougher: at wave 20 the average enemy has about 3% more HP and hits about 5% harder, because heavies and assassins are back."],
    ],
  },
  {
    version: "3.0.1", date: "2026-11-27", title: "The Split Returns", kanji: "斬",
    summary: "Back to the sword cut that splits the screen open.",
    lines: [
      ["change", "The intro's sword cut splits the screen in two again and the halves slide apart into the menu (the v2.9 ending). The ink-drop ending from v3.0 is retired."],
    ],
  },
  {
    version: "3.0", date: "2026-11-27", title: "A Drop of Ink", kanji: "墨",
    summary: "A new way into the game: the cut bleeds a single drop of ink.",
    lines: [
      ["new", "After the sword cut, a bead of ink swells on the slash, stretches and falls. It splashes with ripples and splatter."],
      ["new", "The ink floods the screen while the view dives into it, then a ragged hole with a wet crimson rim blooms open, revealing the menu."],
      ["change", "Replaces the screen-splitting transition from v2.9. The intro is about 6.4 s; Skip still works at any time."],
    ],
  },
  {
    version: "2.9", date: "2026-11-27", title: "Cut Into the World", kanji: "斬",
    summary: "The intro's sword cut now opens straight into the game.",
    lines: [
      ["new", "When the blade cuts through 幽剣, the whole intro screen splits along the slash and the two halves slide apart, revealing the menu behind it."],
      ["new", "A second spray of embers bursts from the tear, and the menu settles into place as it's uncovered."],
      ["change", "The tagline appears before the cut, and the intro is about a second shorter (about 5.7 s)."],
    ],
  },
  {
    version: "2.8", date: "2026-11-27", title: "Dusk at the Dojo", kanji: "暮",
    summary: "The main menu got colour: a living ukiyo-e sunset.",
    lines: [
      ["new", "Animated dusk sky behind the menu: deep indigo overhead, burning vermilion at the horizon."],
      ["new", "A huge setting sun, four layers of ink-wash mountains and a pine forest that shift with your mouse for depth."],
      ["new", "Sakura petals drift across the screen."],
      ["change", "Menu panels, garments and buttons switched from brown-black to indigo glass with vermilion and gold, so the scene shows through."],
      ["change", "Removed the old floating embers from the menu."],
    ],
  },
  {
    version: "2.7", date: "2026-11-26", title: "The Garment Rack", kanji: "衣",
    summary: "Class select is now a rack of hanging garments.",
    lines: [
      ["new", "Classes hang like garments on a bamboo rail. The chosen one steps forward into a spotlight in its colour, with a light running around its edge."],
      ["new", "Switching class slides the rack and the garments swing on their hooks, then settle."],
      ["new", "Pick a class by clicking, dragging or swiping the rail, the mouse wheel, the ‹ › buttons or the arrow keys."],
      ["change", "The class details sit under the rack in two columns and fade in when you switch."],
    ],
  },
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
