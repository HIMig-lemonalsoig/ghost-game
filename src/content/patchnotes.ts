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
    version: "3.18", date: "2026-11-28", title: "Steel in Hand", kanji: "握",
    summary: "Pixel-art characters now hold and use whatever weapon you have equipped.",
    lines: [
      ["new", "Every pixel-art body has a weaponless version. With anything but the katana in hand, your character puts the katana away and holds the real weapon instead."],
      ["new", "Melee weapons are swung from the shoulder along the real hit arc with a full-body slash; the flame spear and twin sai thrust with a lunge."],
      ["new", "Kunai, shuriken, smoke bombs, caltrops and the kusarigama sit in your hand, then get wound up behind the head and thrown with an overhand throw."],
      ["new", "Bows, the crossbow and the blowgun are raised to the shoulder and aimed where you point; the bow stands upright across the shot."],
      ["change", "Nine Tails on the pixel-art Kitsune no longer draws a second set of tails: her own tails catch foxfire, with a burning outline, a pulsing glow and rising embers."],
      ["fix", "The Kitsune's tails no longer melt into a single blob when running up the screen: the back view was redrawn with nine separate, swaying tails."],
    ],
  },
  {
    version: "3.17", date: "2026-11-27", title: "The Ghost's Wardrobe", kanji: "装",
    summary: "Cosmetics now work on pixel-art characters, and 34 new Tsushima-inspired pieces join the Wardrobe.",
    lines: [
      ["new", "Outfits dye your pixel-art character: armor plates take the outfit's colour and the cords and trim take its accent, while skin, steel and the outline stay untouched."],
      ["new", "Headgear and back pieces have pixel art and follow your head every frame: hats and helmets sit on top, masks cover the face (not from behind), and capes and banners stream behind you as you run."],
      ["new", "10 new outfits: Sakai Clan, Ronin, Iki Island, Sarugami, Ghost, Kensei, Gosaku's, Mongol Raider, Lord Shimura's and Tadayori's armor."],
      ["new", "8 new headgear: Ghost Mask, Dragon Kabuto, Mongol Helm, Komusō Basket, Jingasa, Hannya Mask, Sakai Clan Kabuto and Sarugami Helm."],
      ["new", "5 new sword kits, each with its own slash colour: Sakai Steel, Ghost Kit, Kensei Kit, Iki Tide and Sarugami Fang."],
      ["new", "11 new back pieces: Sakai Sashimono and Blossom Banner war banners, Straw Mino, Wolf Mantle, Ghost Cloak, Mongol War Cape, Shimura Cape, Bamboo Cape, Ember Scarf, Crane Cloak and Storm Cloak."],
      ["change", "The Sash slot is now called Back. The Wardrobe preview shows your pixel-art character wearing the look, and so does the ult cutscene."],
    ],
  },
  {
    version: "3.16", date: "2026-11-27", title: "Signature Moves", kanji: "奥",
    summary: "Every class's ultimate is now performed by your pixel-art character.",
    lines: [
      ["new", "The ult cutscene shows your own character, large, performing its signature move with a glow in your class colour: the Kensei's iaijutsu draw, the Tetsu-bo's earth-cracking slam, the Kitsune's foxfire spell, the Archer's charged shot and more."],
      ["new", "19 hand-checked ult moves across all six bodies: draw, crouch-dash, sky raise, whirlwind spin, guard, aimed release, lunge, spell, banner/blade plant and ground slam. Each class plays the move that matches its ultimate."],
      ["new", "In the fight, your character plays the same move for the ult's opening moment instead of the old drawn weapon pose."],
      ["change", "Frames that broke the look were cut (a smeared draw frame, a crouch that turned into someone else, a flickering cast, a ghosted slam)."],
    ],
  },
  {
    version: "3.15", date: "2026-11-27", title: "The Armoury", kanji: "武",
    summary: "Every weapon and every evolution has pixel art.",
    lines: [
      ["new", "All 16 weapons have pixel-art icons: katana, yumi, kunai, smoke bomb, caltrops, kusarigama, crossbow, war fan, jutte, ono, shuriken, flame spear, twin sai, ōdachi, blowgun and tate shield. They replace the kanji in the hotbar, the class weapon picker and the evolution list."],
      ["new", "All 16 evolutions have their own art: the jade Kusanagi, lightning Raiden Bow, phoenix-winged lance, crescent Moon Cleaver, castle-crest Fortress Wall and the rest. The icon changes the moment a weapon evolves."],
      ["new", "In a fight, pixel-art bodies swing the real weapon along the slash arc, and hold bows, crossbows and blowguns pointed where you aim (they kick back when they fire)."],
      ["change", "Hotbar icons dim and refill on cooldown just like the kanji did. Turning off Pixel-art characters brings the kanji back."],
    ],
  },
  {
    version: "3.14", date: "2026-11-27", title: "The Shogun Rises", kanji: "将",
    summary: "The final boss, your summons and the last old-style enemy get pixel art.",
    lines: [
      ["new", "The Shogun (final boss): a towering warlord in black and crimson lacquered armour, a horned kabuto with a gold crescent, a red oni mask and a flowing crimson cape. He stalks you, cleaves with a giant crimson crescent slash and falls to one knee before collapsing. His nameplate now reads The Shogun."],
      ["new", "Your copies are now copies of you: Kagemusha's Twin Shadows clone is a blue ink double of your character, Kunoichi's Phantom Dance afterimages are pink-outlined copies with fading trails, smoke decoys are dark doubles, and Teppō's ghost gunners are blue ink ranks of you."],
      ["new", "Pets: Takajō's hawk flaps beside you, Karakuri turrets are red-lacquered clockwork crossbows that wind and fire, and Sumi-e's Living Ink summons a striped spirit tiger. Ult summons glow gold."],
      ["new", "Mukade is now a chain of red armoured plates with a golden-mandibled head, each plate turning to follow its winding trail."],
      ["fix", "Phantom Dance no longer scrambled your own facing and running animation while the afterimages were on screen."],
    ],
  },
  {
    version: "3.13.2", date: "2026-11-27", title: "Clean Edges", kanji: "縁",
    summary: "Leftovers from the old circle bodies are gone.",
    lines: [
      ["change", "Elites now glow with an outline that traces their own pixel-art body in their affix colour (thicker with two affixes), instead of a circle around where the old body was. Their name tag sits above their head."],
      ["fix", "Assassins no longer show the faint circle and two blade sticks on top of their sprite; archers no longer draw a second little bow."],
      ["change", "Shield-bearers' blocking arc now lies on the ground at their feet, so it shows which side is guarded without cutting through the sprite."],
    ],
  },
  {
    version: "3.13.1", date: "2026-11-27", title: "Steady Hands", kanji: "定",
    summary: "Characters stay the same size facing any way, and the class rack behaves.",
    lines: [
      ["fix", "Characters no longer grow when they face the camera or walk away from it. The front, back and side views of each body are scaled to match (the samurai's front view was 45% too big, the commander's 31%, the kitsune's 29%)."],
      ["fix", "Class select: scrolling the page up or down never changes your class any more, so picking Kunoichi and scrolling down to Start keeps Kunoichi."],
      ["fix", "Class select: clicking or tapping a class picks it (clicks were landing on the class you already had). On touchscreens, a scroll is never mistaken for a tap."],
      ["change", "Class select: bigger, brighter ‹ › buttons. Browse with the buttons, the ← → keys, clicking, or dragging the rail sideways."],
    ],
  },
  {
    version: "3.13", date: "2026-11-27", title: "Night Parade", kanji: "百",
    summary: "Every yokai and boss now has real pixel art: a full night parade of a hundred demons.",
    lines: [
      ["new", "Oni Warlord: a hulking red oni with ivory horns, a wild mane and a studded iron kanabō. He walks, lifts the club overhead and smashes it down when his slam lands, and falls flat when beaten."],
      ["new", "Raijin, the Thunder General: a blue thunder god inside his ring of red war drums. Lightning crackles between his drumsticks and bursts when he strikes."],
      ["new", "Onryō drifts toward you hunched over with hair across her face; Mirror Monk raises a polished bronze mirror that flashes; Bomber is a straw-hatted ghost with a lit bomb; Kappa creeps with its shell and water dish (it spills when it dies); Taiko Drummer marches and beats the drum on its chest; Yuki-warashi toddles along with an ice ball."],
      ["new", "Creatures: a smouldering Boar Spirit, a blue hitodama Wisp, the one-eyed Lantern Ghost, the hopping Umbrella Spirit, a fanged gold Mimic on spider legs (it still looks like a real chest until it bites), and the Nue chimera with its snake tail. Yumi Snipers use the new archer in dark colours."],
      ["change", "Every warning is unchanged and drawn on top: the Onryō's casting ring, the Nue's summoning ring, the Lantern's blast radius, the Taiko's drumbeat pulse, and a gold arc under the Mirror Monk showing which side reflects shots."],
      ["change", "Mukade stays hand-drawn: its body is a chain that trails behind it. All new art was made with PixelLab and checked frame by frame (offline version only)."],
    ],
  },
  {
    version: "3.12", date: "2026-11-27", title: "All Sides", kanji: "全",
    summary: "The archer, kitsune and both tengu can now be seen from the front and the back.",
    lines: [
      ["new", "Archer (Takajō, Teppō, archer enemies): new run and walk, plus front and back views when moving up or down."],
      ["new", "Kitsune (Kitsune class and the Nine-Tailed Witch boss): glides toward you with all nine tails fanned, runs away showing her tails, and has a new side run and walk."],
      ["new", "Karasu tengu (Tengu class and assassins): sprints with its wings spread from every side, crow beak visible running at you."],
      ["new", "Yamabushi tengu (Yamabushi class and healer monks): red face and white mane from the front, wings from the back, new run and walk."],
      ["change", "Every frame was checked by hand; runs that changed outfit, lost a beak or barely moved were thrown out and remade. Skeletons keep the side view for now."],
      ["change", "Art made with PixelLab from the CraftPix characters (offline version only)."],
    ],
  },
  {
    version: "3.11.3", date: "2026-11-27", title: "Face the Camera", kanji: "面",
    summary: "The samurai and the commander now have real front views.",
    lines: [
      ["new", "Running down shows the samurai and the commander sprinting toward the camera, faces and armour front-on, replacing the old half-turned walk."],
      ["new", "Standing still while aiming straight down, they face the camera."],
      ["change", "With back views already in, both bodies now look right in all four directions. Red ronin and heavy/shield enemies get the new front views too."],
    ],
  },
  {
    version: "3.11.2", date: "2026-11-27", title: "Banner Bearer", kanji: "旗",
    summary: "The banner commander gets a back view, a new sprint and a new walk.",
    lines: [
      ["new", "Commander body (Tetsu-bo, Berserker, Sōhei, Rikishi, Hatamoto, Ashigaru, Dokkaebi, and heavy/shield enemies): running up shows him from behind with the banner on his back, and he faces away when you aim straight up."],
      ["new", "New sprint with the banner streaming behind him, and a new walk (made in PixelLab)."],
      ["fix", "Characters now line up on their hips and legs, so big banners, tails and swords no longer push the body off its ring."],
      ["change", "No front view for the commander yet. Running down still uses the side view with lean and dust."],
    ],
  },
  {
    version: "3.11.1", date: "2026-11-27", title: "Smoother Strides", kanji: "歩",
    summary: "New walk and sprint for the samurai, and no more shaking when you run down.",
    lines: [
      ["new", "The samurai has a new walk and a much faster-looking sprint (made in PixelLab), replacing the old run."],
      ["fix", "Running down no longer jitters: frames line up on the chest instead of the swinging sword, and the walk toward the camera now loops only its three matching frames (the others changed angle or arm pose), at a calmer pace."],
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
