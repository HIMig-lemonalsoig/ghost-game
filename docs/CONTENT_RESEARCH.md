# Content Research: enemies, classes, perks and shop items (2026-11-27)

Goal: add more enemy types, more classes, and more perks and shop items, especially for stats that barely have any (the user called out crit and damage). This is the research step only. Nothing below is implemented yet.

## C1. What's in the game today (audited from the code)

| Content | Count | Where |
|---|---|---|
| Classes | 25 | `CLASSES` in `src/GhostGame.ts` |
| Weapons | 16 | `SecondaryId` in `src/GhostGame.ts` |
| Level-up perks (normal) | 47 | `PERK_POOL` |
| Ultimate perks | 33 | `src/content/ultperks.ts` |
| Duo perks | 8 | `src/content/duos.ts` |
| Shop items | 48 | `SHOP_POOL` |
| Regular enemy types | 12 | normal, heavy, shielded, archer, assassin, wisp, priest, bomber, lantern, onryō, nue, mirror monk |
| Elite affixes | 8 | burning, frost, vampiric, hasted, splitting, warded, volatile, commander |
| Bosses | 4 + final | Oni, Nine-Tailed Witch, Gashadokuro, Thunder General, Final Boss |

## C2. Stat gaps (what you noticed is real)

Level-up perks and shop items grouped by the stat they raise:

| Stat | Level-up perks | Shop items | Verdict |
|---|---|---|---|
| Damage % | 6 (Honed Edge, Way of the Kensei, Glass Cannon, Last Stand, Executioner, Exploit Weakness) | 9 | Plenty, but almost all are flat "+X% damage", which is boring |
| **Crit chance** | **2** (Keen Eye +6%, Killing Edge +20%) | **2** (Killing Eye +8%, Cursed Eye +5%) | **Thin.** Only 4 sources in the whole game |
| **Crit damage** | **0** | **0** | **Missing.** Crits are hard-coded to 3× (`dmg *= 3`) |
| On-crit effects | 0 (one duo) | 0 | Missing; crit builds have no payoff beyond bigger numbers |
| Attack speed (dexterity) | 1 | 4 | OK |
| Move speed | 1 | 4 | OK |
| Max HP / defence | 3 | 7 | OK |
| Healing | 4 | 4 | OK |
| Burn / poison / bleed / lightning | 10 | 2 | Good, but **no frost / slow element** and no generic "status duration" stat |
| **Area size** (bigger AoE, explosions, ult radius) | 2 (Long Blade, Wide Arc: katana only) | 0 | **Missing** for everything except the katana |
| **Projectiles** (count, pierce, speed) | 0 | 3 (ammo / regen / +12% secondary damage) | **Missing.** Ranged builds can't really scale |
| **Luck** (rarer cards, more drops) | 0 | 0 (one consumable buff) | **Missing** |
| **XP gain** | 0 | 0 | **Missing** |
| **Pickup radius** | 0 | 0 | **Missing** (the circle is drawn but nothing raises it) |
| Damage vs elites / bosses | 0 | 0 | Missing |
| Dodge / evasion | 0 | 0 | Missing (only i-frames) |
| Coins | 2 | 2 | OK |
| Cooldowns / ult charge | 3 | 3 | OK |

## C3. How other roguelites handle it

| Game | What we can learn | Source |
|---|---|---|
| **Brotato** | Every stat has its own upgrade line at several tiers (e.g. crit "Fingers" gives 3 / 5 / 7 / 9% crit). Crit items often have a downside (Night Goggles: +15% crit, −3 max HP, −1 armour). Luck is its own stat that boosts drops and rarities. A big roster: one tier list counts 66 weapons and 59 characters (patch 1.1.6). | [Stats](https://brotato.wiki.spellsandguns.com/Stats), [Crit Chance](https://brotato.wiki.spellsandguns.com/Crit_Chance), [Upgrades](https://brotato.wiki.spellsandguns.com/Upgrades), [Luck](https://brotato.wiki.spellsandguns.com/Luck), [items guide](https://brotato-builds.com/items), [tier list](https://rogueranker.com/brotato-tier-list/) |
| **Vampire Survivors** | 34 passive items, mostly one per stat (Might = damage, Area, Amount = projectiles, Duration, Magnet = pickup, Growth = XP, Luck, Crown, Clover), and most also unlock a weapon evolution. Every stat has an item, which is exactly our gap. | [passive item guide](https://primagames.com/gaming/vampire-survivors-passive-item-guide), [list](https://rogueranker.com/vampire-survivors-passive-items/) |
| **Halls of Torment** | Separates **crit chance** and **crit damage**, and crit traits only show up once you have something that can crit. That's a good rule for us: don't offer crit damage to a build with 0% crit. | [Steam discussion](https://steamcommunity.com/app/2218750/discussions/0/3803903751086779801), [ability traits](https://thenerdstash.com/what-is-the-radiant-aura-ability-in-halls-of-torment-explained) |
| **Enemy design (general)** | Give each enemy one clear **role**: pressure (rusher), tank, ranged / kiter, support (healer / buffer), control (area denial), summoner, splitter, punisher. Mix roles so enemies cover each other's weaknesses, and telegraph every role so players can prioritise. | [Designing Engaging Enemy Archetypes](https://www.wayline.io/blog/designing-engaging-enemy-archetypes), [Build a Bad Guy Workshop](https://www.gamedeveloper.com/design/build-a-bad-guy-workshop-designing-enemies-for-retro-games), [Finding the fun: Archero](https://gamedeveloper.com/design/finding-the-fun-archero-part-1---gameplay) |

Takeaways:
1. **Give every stat its own line**, with a common / rare / legendary version, like Brotato and Vampire Survivors. Our crit, area, projectiles, luck, XP and pickup lines are missing or have one card.
2. **Split crit into chance and damage** (Halls of Torment), and only offer crit damage once you have some crit.
3. **Interesting beats flat.** Strong items in those games have a condition or a downside (Glass Cannon is our only good example).
4. **Enemies by role.** We already cover pressure, tank, ranged, support (priest), summoner (nue), control (onryō) and exploder (lantern). Missing: a **charger**, a **true splitter**, an **ambusher / burrower**, a **buffer / shield-caster**, a **sniper** with a long telegraph, a **trail-layer** for area denial, and a **mimic**.

## C4. Candidates (to discuss before building)

### New level-up perks (about 20, filling the gaps)
| Stat | Common | Rare | Legendary |
|---|---|---|---|
| Crit chance | Steady Aim: +5% crit | Hawk's Eye: +10% crit, +5% crit after a dash | Heaven's Eye: +15% crit; crits mark foes for +10% damage |
| **Crit damage (new stat)** | Deep Cut: +25% crit damage | Bone Splitter: +50% crit damage | Death Blossom: crits release a small petal burst (AoE) |
| Area | Broad Sweep: +10% area (all AoE, explosions, ult radius) | Shockwave Stance: +20% area | Heaven and Earth: +35% area, −10% attack speed |
| Projectiles | Extra Kunai: +1 projectile on throwing weapons | Piercing Shot: projectiles pierce +1 foe | Arrow Rain: every 5th shot fires a volley |
| Luck (new) | Lucky Charm: +10% luck | Maneki-neko: +20% luck, chests drop +1 item | Fortune's Favour: rare+ cards 50% more often |
| XP (new) | Diligent Study: +10% XP | Scholar's Scroll: +20% XP | Enlightenment: +1 level-up choice |
| Pickup (new) | Magnet Charm: +30% pickup radius | Spirit Pull: +60% radius, orbs fly faster | — |
| Frost (new element) | Frostbite Edge: +12% chance to chill (slow) | Deep Freeze: chilled foes freeze after 3 hits | Winter's Heart: frozen foes shatter for AoE damage |
| vs elites / bosses | — | Giant Slayer: +25% damage to elites and bosses | — |
| Dodge (new) | — | Wind Dancer: 8% chance to dodge a hit | Mist Body: dodging refunds your dash |

### New shop items (about 15)
Crit: **Whetted Eye** (common, +4% crit), **Assassin's Ledger** (rare, +30% crit damage), **Night Lantern** (legendary, +15% crit, −10% max HP). Damage with conditions instead of flat: **Duelist's Ribbon** (+20% damage when only one foe is near), **Berserker Sake** (+2% damage per 10% HP missing), **Executioner's Hood** (+30% damage to bosses). Plus one each for area, projectiles, luck, XP, pickup and frost, so every stat has a shop source.

### New enemies (about 8, each with a clear role)
| Enemy | Role | Behaviour | From wave |
|---|---|---|---|
| **Inoshishi** (boar spirit) | Charger | Paws the ground (telegraph), then charges in a straight line and stuns itself if it hits a wall | 4 |
| **Kappa raider** | Ambusher | Hides in puddles, bursts out when you're close | 6 |
| **Tsukumogami** (living lantern / umbrella) | Splitter | Splits into 2 small fast ones on death | 5 |
| **Taiko drummer** | Buffer | Drums to give nearby foes +speed; kill it first | 8 |
| **Yumi sniper** | Sniper | Draws a long red line for 1 s, then fires a fast arrow | 11 |
| **Mukade** (giant centipede) | Trail-layer | Leaves a poison trail; multi-segment body | 13 |
| **Mimic chest** | Punisher | Looks like a Spirit Chest; bites when you open it | 10 (rare) |
| **Yuki-warashi** | Control | Freezes the ground in a ring, slowing you | 14 |
Plus a new **boss** for wave 25 or Endless: **Ōmukade**, a huge centipede that circles the arena.

### New classes (about 6, playstyles we don't have)
| Class | Fantasy | Playstyle gap it fills |
|---|---|---|
| **Teppō** (matchlock gunner) | Slow, huge-damage gun shots; reload rhythm | A true crit / sniper class (built around the new crit damage) |
| **Takajō** (falconer) | Commands a hawk that dives on marked targets | Pet / summoner |
| **Karakuri-shi** (puppeteer) | Places wind-up automaton turrets | Engineer / turret builds (Brotato's Engineer) |
| **Bakuto** (gambler) | Dice rolls change their damage and luck each wave | Luck class (uses the new luck stat) |
| **Rikishi** (sumo) | Grabs and throws enemies into others | Grappler / crowd control |
| **Sumi-e Painter** | Paints ink creatures and walls that come alive | Creative summoner / area control |

## C5. Research steps left (before building)

| Step | What | How |
|---|---|---|
| C5a | **Crit math check.** What crit damage multiplier keeps crit builds balanced against flat damage builds? | Bot runs: same build with 0 / 25 / 50% crit and 2× / 3× / 4× crit damage, measured DPS at waves 10 and 25 |
| C5b | **Stat cap check.** New stats (luck, area, XP, pickup) need soft caps like the existing ones in `curves.ts` | Simulate stacking each new card 10 times |
| C5c | **Card pool dilution.** Adding ~20 perks changes how often you see any one card | Simulated level-ups: odds of seeing a build's key card by wave 10, before vs after |
| C5d | **Enemy pacing.** Where each new enemy fits so early waves don't get harder | Wave-by-wave spawn table plus bot playtests at waves 5, 10 and 15 |
| C5e | **Class budget.** New classes measured with the same ult budget harness (target 60 grunts) | Bot budget runs |
| C5f | **Your picks.** Which of the candidates above you actually want | Discussion |
