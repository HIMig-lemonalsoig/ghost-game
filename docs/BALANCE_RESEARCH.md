# Balance research phase (Phase 7)

**Rule for this phase:** measure first, change nothing until the targets below are agreed.
Everything here was measured in the dev build on 2026-11-22 with no perks, no shop items and god mode on.

---

## What we already found

### 1. Ultimates ignore how strong you are

`ultDmg(base)` multiplies every ult hit by `max(waveScale, powerScale) × ultPowerMul`, where

- `waveScale = 1 + 0.35 × (wave − 1)`, which is **35.3× on wave 99** even with zero upgrades
- `powerScale = your katana damage ÷ your starting katana damage`, so it only matters once upgrades beat the wave bonus

Normal enemies get `1 + 0.45 × (wave − 1)` HP, so an ult keeps almost the same share of a crowd's HP at every wave.

**Measured: 14 grunts clumped together, one ult, no upgrades**

| Class | Wave 5 | Wave 25 | Wave 99 |
|---|---|---|---|
| Dokkaebi, Kitsune, Kunoichi, Tsuchigumo | 14/14 | 14/14 | 14/14 |
| Kappa, Onmyoji | 13/14 | 13/14 | 13/14 |
| Arashi | 11/14 | 11/14 | 10/14 |
| Kensei, Tetsubo | 9/14 | 9/14 | 9/14 |
| Miko, Samurai, Sohei | 5/14 | 5/14 | 5/14 |
| Onna, Ronin | 3/14 | 3/14 | 3/14 |
| Raijin, Tengu, Yuki-onna | 0/14 | 0/14 | 0/14 |

The same character's katana does about 1 damage per hit against a 90 HP wave-99 grunt. So the ult does 30–40× more than anything else you have, regardless of your build. That's the "insane damage with no levels" you saw.

Two other things stand out:

- **Classes are very far apart.** Some ults wipe the whole pack, while Raijin, Tengu and Yuki-onna kill nothing in this test. Those three may target differently, or rely on slows and lightning that need more than 10 seconds. That needs checking, not just tuning.
- **Bosses are already the exception.** On the wave-99 Final Boss (78,915 HP) a single ult removes 0–11%. Boss HP grows faster than the wave bonus, because of the extra tier multiplier. So the ult problem is mainly about crowds and normal enemies.

**Measured: one ult on a boss, no upgrades (share of its HP removed)**

| Class | Wave 10 boss (463 HP) | Wave 25 Final (5,841 HP) | Wave 99 Final (78,915 HP) |
|---|---|---|---|
| Kunoichi | 100% | 19% | 5% |
| Miko | 100% | 21% | 6% |
| Samurai | 99% | 18% | 5% |
| Arashi | 88% | 16% | 11% |
| Onmyoji | 82% | 16% | 4% |
| Ronin | 71% | 13% | 4% |
| Kitsune | 69% | 13% | 4% |
| Kensei | 28% | 5% | 1% |
| 10 buff-type ults* | 0% | 0% | 0% |

\* Berserker, Shinobi, Yamabushi, Hatamoto, Kabuki, Kagebushi, Kagemusha, Ashigaru, Raijin, Tengu and Yuki-onna mostly power up your normal attacks, so this test can't see them. They need their own test (below).

### 2. Shop rarity isn't weighted at all

`rollShopOffer` picks items **evenly** from the pool. The pool has 14 commons, 23 rares and 10 legendaries, plus 3 damage items per equipped weapon. So every shop slot is roughly:

| | Common | Rare | Legendary |
|---|---|---|---|
| Chance per slot | ~30% | ~49% | ~21% |
| At least one in a 6-slot shop | | | **~76% of shops** |

Rares show up more than commons, and you see a legendary in most shops. That matches what you noticed.

Level-up cards *are* weighted (70% common, 25% rare, 5% legendary). But several extras add more rares and legendaries on top:
- class ult perks are injected 20% of the time
- duo perks are injected 25% of the time
- arena altars hand out legendaries
- rerolls and banishes let you dig for them

We haven't measured the real odds after all of that yet.

### 3. Shop items are worth far more than level-up perks

| Effect | Level-up perk | Shop common | Shop rare | Shop legendary |
|---|---|---|---|---|
| Damage, all weapons | Honed Edge +15% | Whetstone +12%, War Paint +8% | Honed Whetstone +30%, Crimson Blade +15% | **Masterforged Edge +75%** |
| Max HP | | Iron Resolve +10% | Steel Heart +15, Soul Collector +30 | Oni's Vigor +40 |
| Dexterity | | Light Hands +3 | Trained Reflexes +6 | Wind's Grace +12 |

- One legendary damage item equals **five** level-up damage picks.
- Legendaries cost 95–130 coins. We don't yet know how quickly coins come in, so we can't tell how often people can afford them.
- The new soft caps shrink stacking, but they don't fix single items being too big.

---

## R1 results (2026-11-25): ult strength vs. your own normal damage

**Setup:** wave 25, katana, 10 tough dummies in sword range, attacking non-stop for 8 seconds. Each class was measured twice: without the ult and with the ult fired at the start. The "built" columns add 6× Honed Edge, Fierce Spirit and Honed Spirit.

| Class | Normal 8s | With ult | Ult multiplier | Built multiplier |
|---|---|---|---|---|
| Miko | 180 | 12,390 | **68.8×** | 54.5× |
| Onmyoji | 180 | 9,358 | **52.0×** | 40.5× |
| Tsuchigumo | 219 | 9,102 | **41.6×** | 35.1× |
| Kitsune | 180 | 6,356 | **35.3×** | 26.5× |
| Arashi | 180 | 4,513 | 25.1× | 13.9× |
| Dokkaebi | 180 | 4,525 | 25.1× | 21.6× |
| Onna-Bugeisha | 200 | 4,900 | 24.5× | 18.8× |
| Sohei | 180 | 2,539 | 14.1× | 10.4× |
| Ronin | 198 | 2,433 | 12.3× | 9.3× |
| Kappa | 471 | 3,382 | 7.2× | 6.2× |
| Samurai | 185 | 1,204 | 6.5× | 5.5× |
| Raijin | 810 | 3,719 | 4.6× | 5.2× |
| Kunoichi | 180 | 546 | 3.0× | 2.3× |
| Shinobi | 180 | 370 | 2.1× | 2.1× |
| Kabuki / Kagebushi | ~250 | ~450 | 1.8× | 1.8× |
| Berserker | 180 | 300 | 1.7× | 1.7× |
| Ashigaru | 196 | 339 | 1.7× | 1.0× |
| Hatamoto | 180 | 238 | 1.3× | 1.2× |
| Yuki-onna, Kagemusha, Yamabushi | ~190 | ~190 | ~1.0× | ~1.0× |
| Kensei, Tengu, Tetsubo | — | — | ~0.9× | ~0.9× |

**What it shows**
1. **Ults that deal damage directly** (Miko, Onmyoji, Tsuchigumo, Kitsune and others) get the automatic wave bonus. They do 25–70× your normal damage at wave 25, and more at higher waves.
2. **Ults that power up your attacks** (Berserker, Shinobi, Kabuki, Kagebushi, Hatamoto) don't get the wave bonus. They stay at 1.3–2.1× forever, so these classes fall far behind late.
3. **Upgrades barely matter for ults.** Six damage upgrades plus two ult upgrades raised ult damage by only about 30–40%, while your normal damage went up about 75%. The wave bonus drowns out your build.
4. **The class spread is about 70×**, from Miko's 68.8× down to Kensei's 0.9×.
5. **Seven ults did about nothing to grouped targets:** Kensei, Tengu, Tetsubo, Yuki-onna, Kagemusha, Yamabushi and Ashigaru (when built). Some are defensive by design (Yamabushi), some may aim or move differently from this test (Kensei's dash, Tetsubo's cone), and some may be bugs. Each one needs a look during R7.

## R8 results (2026-11-25): how other games handle it

| Topic | What other games do | Source |
|---|---|---|
| Ability scaling | **Risk of Rain 2:** every skill, specials included, is a % of *your* base damage, and base damage grows as you level. The big move scales with you, not the stage. | [Bandit](https://riskofrain2.wiki.gg/wiki/Bandit), [Mercenary](https://riskofrain2.wiki.gg/wiki/Mercenary) |
| Big moves vs. bosses | **Hades:** Calls are flat-damage moves you charge by dealing and taking damage. A full-bar "Greater Call" is strong on bosses but doesn't delete them. Aphrodite's Call does a flat 2,500 to one target. | [Call guide](https://www.gamepressure.com/hades/call-how-does-it-work/z3ec5f), [Prima](https://primagames.com/gaming/hades-guide-call-aid-super-god-gauge) |
| One-shot protection for bosses | **Binding of Isaac** cuts any single hit above 4× an armored boss's damage-per-second cap. **RAID** caps max-HP-based hits on bosses at 5–10% of their HP per hit. | [Isaac](https://bindingofisaacrebirth.wiki.gg/wiki/Damage_scaling), [RAID caps](https://hellhades.com/best-enemy-max-hp-champions-in-raid-shadow-legends/) |
| Shop rarity | **Brotato:** top-tier items can't appear before wave 8, then the chance grows **+0.23% per wave up to 8%**. Lower tiers are checked top-down. **Risk of Rain 2 small chest:** 79% common, 20% uncommon, **1%** legendary. | [Brotato shop](https://brotato.wiki.spellsandguns.com/Shop), [RoR2 odds](https://riskofrain2.fandom.com/wiki/Luck) |
| Bad-luck protection | **Slay the Spire:** rare cards start around 3% (60% common, 37% uncommon). Every common rolled adds +1% to the rare chance, and getting a rare resets it. | [StS card rewards](https://slay-the-spire.fandom.com/wiki/Card_Rewards) |
| Item value vs. price | **Brotato** prices rise with the wave (an item with base price 15 costs 17 at wave 1 and 65 at wave 20), so late legendaries stay a real choice. | [Brotato items](https://bloxodes.com/wiki/brotato/items) |

The common thread: **in all of these, the top rarity shows up roughly 1–8% of the time, not 21% like our shop, and big moves scale with the player, not the level.**

### R8 round 2: comparisons for R2, R4 and R7

| Our issue | What other games do | What it suggests for us | Source |
|---|---|---|---|
| **R2: ult every 8–9 s late** | **Hades:** the God Gauge fills from dealing *and taking* damage, is split into segments, and **resets every room**. Boons that speed it up are build choices. The one that fills it fast on its own also **caps it at one segment**. | Charge from damage dealt and taken, not kills (so big crowds don't flood it). Reset or partly drain between waves. Make faster charging a perk you choose. Any "fast charge" effect should come with a cap. | [Prima](https://primagames.com/gaming/hades-guide-call-aid-super-god-gauge), [GameRevolution](https://www.gamerevolution.com/guides/661036-hades-call-ability-how-to-fill-god-meter-boon), [Gamepressure](https://www.gamepressure.com/hades/call-how-does-it-work/z3ec5f) |
| **R4: coins outgrow prices** | **Brotato:** enemy material drop chance **falls 1.5% per wave from wave 5**, shop prices rise each wave, and guides note "the shop begins to slowly outscale your income" late. Extra income is a stat you build (Harvesting), and it **shrinks 20% per wave in Endless**. | Lower the kill-reward growth (or drop chance) per wave, and let prices outgrow income after mid-game. Make big income a build choice (Lucky Coin and similar), and taper income in Endless. | [Brotato Materials](https://brotato.wiki.spellsandguns.com/Materials), [Harvesting](https://brotato.wiki.spellsandguns.com/Harvesting), [Endless](https://brotato.wiki.spellsandguns.com/Endless_Mode) |
| **R7a: class balance** | **Hades:** weapon aspects are "similar by design" (Amir Rao), and balance comes from **heavy iteration and playtesting**, not up-front math. In Hades II, strong boons were "moved to new homes" rather than simply nerfed. | Keep one shared power budget per ult. Tune by re-running the bot and R1 tables after every change. When something is overpowered, move or reshape the effect instead of only cutting numbers. | [PC Gamer](https://www.pcgamer.com/games/roguelike/hades-2-lead-says-they-didnt-nerf-the-games-most-popular-boons-but-rather-found-new-homes-for-them-during-early-access-development), [GamesRadar](https://www.gamesradar.com/games/hades/the-game-is-the-design-document-hades-2-devs-dont-have-long-elaborate-plans-that-lay-out-the-future-of-the-things-were-making-because-supergiant-is-a-heavily-iterative-studio) |
| **R7b: ult visuals** | **League of Legends VFX guide:** an effect's visual weight should match its gameplay weight (a basic attack never looks as loud as an ult), each effect needs a clear focal point, and visual noise that carries no gameplay information gets cut. **Overwatch** players say low contrast and clutter hide important cues. | Judge each ult on: does its size match its power? Is its hit area clear? Do enemy telegraphs stay visible through it? Cut decorative particles that hide danger. | [Riot: Clarity in League](https://www.leagueoflegends.com/en-gb/news/dev/clarity-in-league/), [Riot VFX style guide](https://nexus.leagueoflegends.com/en-us/2017/10/dev-leagues-vfx-style-guide/), [Overwatch forum](https://us.forums.blizzard.com/en/overwatch/t/the-visual-clutter/426445) |

## R3 results (2026-11-25): true rarity odds

Measured with 4,000 simulated level-ups per case and 4,000 simulated shops per wave, using the real game code.

**Level-ups.** The base roll is 70% common, 25% rare, 5% legendary, but that's not what players see:

| Situation | Common | Rare | Legendary | Level-ups showing a legendary |
|---|---|---|---|---|
| Fresh run, Kensei | 34% | **64%** | 2% | 7% |
| Fresh run, Ronin (2 cards) | 25% | **74%** | 2% | 4% |
| Mid-run (wave 12, 8 perks), Kensei | 29% | 61% | **11%** | **31%** |
| Mid-run, Ronin | 18% | 68% | **14%** | 28% |

- **Why rares dominate:** about half of all cards are ability cards (44–55%), and every ability card counts as rare. Ult perk cards (13–16%) are also rare.
- **Why legendaries climb mid-run:** duo perks (9–13% of cards) and other unlocks push the legendary share up to 11–14%.

**Shop** (Kensei with katana + yumi):

| Wave | Common | Rare | Legendary | Shops showing a legendary |
|---|---|---|---|---|
| 3 | 23% | 53% | 24% | **82%** |
| 10 | 23% | 53% | 24% | 82% |
| 20 | 23% | 53% | 24% | 82% |

The odds never change with the wave, and **4 out of 5 shops show a legendary**. Other games: 1–8%.

## R4 + R2 results (2026-11-25): coins and ult timing

**Setup:** a bot played Kensei and Miko through wave 20 on Normal. It walked to the nearest enemy and attacked, pressed the ult key whenever it was full, took the first non-ability level-up card, **never bought anything**, and had its HP kept full. So these numbers are an upper bound: a real player kills a bit less and dies sometimes.

| Wave | Coins earned (Kensei / Miko) | Coins saved up | Cheapest legendary in shop | Ults that wave | First ult after |
|---|---|---|---|---|---|
| 2 | 70 / 76 | ~125 | ~90 | 1–2 | 2–7 s |
| 5 | 195 / 136 | ~470–600 | ~120 | 0–2 | — |
| 9 | 1,090 / 1,339 | ~3,600 | ~190 | 3–6 | 1–9 s |
| 13 | 1,748 / 1,326 | ~8,000 | ~230 | 5–7 | 0 s |
| 16 | 1,830 / 1,895 | ~12,000 | ~260–400 | 8–10 | 2–5 s |
| 19 | 1,756 / 2,022 | ~17,000 | ~275–300 | 9–10 | 1–3 s |

**What it shows**
1. **Coins outgrow prices very fast.** From about wave 7, one wave pays for 3–6 legendaries. Prices rise with the wave, but income rises much faster (more enemies and bigger rewards per kill). So late in a run the shop is effectively free, and the strongest items stack without limit.
2. **Ults come every 8–9 seconds late in a run.** The slower charge per kill helped early on (1–2 ults per wave), but late waves have 100–180 kills, so you still get 8–10 ults per wave. Ult strength × ult frequency is why late-game ults feel unstoppable.

## R7a + R5 results (2026-11-26): bot plays every class

**Setup:** 3 full Normal runs per class (75 runs). The bot:
- walks in and attacks, circles at close range, and backs off below 40% HP
- steps away from wind-ups and warning circles, and dashes when an attack is about to land
- uses abilities and fires its ult when full
- takes ability cards until it has two, then passive cards
- buys the best-rarity shop items it can afford (no weapons or ability scrolls)
- always takes the first omen

It plays worse than a person against bosses (no learned patterns) and better in other ways (instant reactions). So read this as **relative** class strength.

| Tier | Class | Waves reached (3 runs) | Beat the Final Boss |
|---|---|---|---|
| **S** | Tsuchigumo | WIN, 25, 20 | 1 / 3 |
| **A** | Tetsubo | 10, WIN, 25 | 1 / 3 |
| A | Berserker | 25, WIN, 10 | 1 / 3 |
| A | Miko | 5, WIN, 25 | 1 / 3 |
| A | Onmyoji | WIN, 5, 25 | 1 / 3 |
| A | Kitsune | WIN, 5, 25 | 1 / 3 |
| A | Arashi | 20, WIN, 10 | 1 / 3 |
| **B** | Onna-Bugeisha | 5, 20, 25 | 0 |
| B | Kagebushi | 14, 5, 25 | 0 |
| B | Samurai | 9, 9, 25 | 0 |
| B | Dokkaebi | 5, 15, 20 | 0 |
| B | Sohei | 25, 5, 10 | 0 |
| B | Raijin | 5, 5, WIN | 1 / 3 |
| **C** | Hatamoto | 5, 15, 10 | 0 |
| C | Kunoichi | 5, 15, 5 | 0 |
| C | Ronin | 10, 6, 7 | 0 |
| C | Kabuki | 5, 11, 5 | 0 |
| **D** | Kensei | 9, 5, 5 | 0 |
| D | Ashigaru | 9, 5, 5 | 0 |
| D | Shinobi, Yamabushi, Kagemusha, Yuki-onna, Kappa, Tengu | 5, 5, 5 | 0 |

**What it shows**
1. **The wave-5 boss is a wall.** About half of all runs (38 of 75) ended on wave 5, almost all to the Oni Warlord or a boss projectile. Waves 1–4 are easy for every class, then difficulty jumps. Classes with a strong crowd-clearing ult push through; the rest stop there. The next big spikes are waves 10, 15 and 20, which are also boss waves.
2. **The tier list matches the ult measurements (R1).** The S and A classes are the big-damage ults (Tsuchigumo 42×, Miko 69×, Onmyoji 52×, Kitsune 35×, Arashi 25×) plus Tetsubo and Berserker, whose weapons and evolutions carry them. Most of the D classes are the ones whose ults did "about nothing" in R1 (Kensei, Tengu, Yuki-onna, Kagemusha, Yamabushi, Ashigaru).
3. **Power curve (R5).** Damage per second at wave 10 ranged from **27 to 177** between classes, about 6.5×. Late waves had 3–9 ults each.
4. **Possible tracking bug:** in the bot runs, the end-of-run damage breakdown (Phase 10) put a large share under "Class powers", and the shares sometimes added up to more than 100%. The labelling should be checked before using it to tune.

## R7b results (2026-11-26): ult visual review

Each ult was fired into the same 12-enemy pack. One enemy started an attack mid-ult, to check whether warnings stay visible. Frames were taken at 1.3 s and 2.5 s. The scores are 1–5 for **R**eadable (can you tell what it does and where), **I**mpact (does it look as strong as it is), **C**lear (can you still see yourself and enemy attacks) and **S**tyle (fits the ink and samurai look).

| Class | What you see | R | I | C | S | Looks vs. power (R1) |
|---|---|---|---|---|---|---|
| Kensei | screen goes blue-grey (time stops), dash streak, tiny cuts | 3 | 2 | 4 | 4 | weak and looks weak |
| Shinobi | small ring on you, "?" over enemies | 2 | 1 | 5 | 3 | buff ult, invisible |
| Ronin | black ink veins, brands on 3 foes | 3 | 3 | 4 | 4 | ok |
| Yamabushi | double ring on you | 3 | 1 | 5 | 3 | defensive, invisible |
| Onna-Bugeisha | big sweeping white arc, hit flashes | 4 | 3 | 4 | 4 | ok |
| Dokkaebi | white ghosts fly through the pack | 3 | 3 | 3 | 3 | ghosts look like enemies |
| Kagemusha | one dark clone next to you | 2 | 1 | 4 | 3 | clone looks like an enemy |
| Berserker | ring only | 1 | 1 | 5 | 2 | **strong buff, shows nothing** |
| Arashi | arrows from the sky, dashed target area | 4 | 3 | 3 | 4 | ok |
| Tetsubo | huge ground cracks in every direction | 3 | 4 | 4 | 4 | **looks huge, did ~nothing in R1** |
| Samurai | you blink into the pack, small slashes | 2 | 2 | 4 | 3 | looks weaker than it is |
| Onmyoji | giant white blob pulls everyone into a pile | 4 | 5 | **1** | 3 | strong and looks it, but **blinding** |
| Hatamoto | big yellow zone + banner | 4 | 2 | 4 | 4 | ok |
| Kunoichi | pink afterimages + white slash storm | 4 | 4 | 2 | 5 | **looks very strong, only 3× in R1** |
| Tsuchigumo | web lines, every enemy turns white | 4 | 3 | 4 | 4 | **strongest class, looks only medium** |
| Miko | tall light pillar, enemies whitened | 4 | 4 | 3 | 4 | strongest ult, looks strong |
| Kagebushi | you turn dark blue | 1 | 1 | 5 | 2 | invisible buff |
| Kitsune | small foxfires, hit flashes | 3 | 3 | 4 | 4 | looks weaker than it is |
| Raijin | **nothing visible** in either frame | 1 | 1 | 5 | 2 | check for a bug |
| Yuki-onna | big pale snow circle, foes slowed | 4 | 2 | 4 | 4 | **looks big, ~no damage** |
| Sohei | golden expanding prayer rings | 4 | 3 | 4 | 5 | ok |
| Ashigaru | line of spikes appears | 4 | 2 | 4 | 4 | only hits enemies on the line |
| Kappa | the wave shoves the whole pack off-screen | 2 | 3 | 3 | 3 | you can't see what it did |
| Tengu | **nothing visible** | 1 | 1 | 5 | 2 | check for a bug or a missing effect |
| Kabuki | **nothing visible** | 1 | 1 | 5 | 2 | buff ult, invisible |

**What it shows**
1. **The name banner hides the first ~1.2 seconds of every ult.** It covers about 40% of the screen, including enemy attack warnings, even with "Ultimate cutscenes" switched off.
2. **About 8 ults show almost nothing:** Berserker, Shinobi, Yamabushi, Kagebushi, Kabuki, Tengu, Raijin, and Kagemusha's clone. Most are power-ups that change your numbers but not the screen. By League's rule (visual weight should match gameplay weight), they need a clear "I'm powered up" look.
3. **Looks and power don't match in five places:**
   - Tetsubo and Yuki-onna look huge but do very little.
   - Kunoichi looks like the strongest ult but is mid.
   - Tsuchigumo and Kitsune are the strongest classes but look medium.
4. **Two ults hurt clarity:** Onmyoji's white blob and Kunoichi's storm hide the enemies inside them, including attack warnings.
5. **Raijin and Tengu** showed no ult effect at all and also did nothing in R1, so they're likely bugs, not just tuning.
6. **Contrast:** a strong red haze sits under every enemy pack and lowers contrast. It should be checked whether that's intended.

## R6 (real play data): needs your runs

Your real runs are stored in the browser you play in, so they can't be read from here. When you have 10+ normal (non-dev) runs: open dev mode → Balance report → Copy JSON, and paste it in chat. It doesn't block the fix plan; it's a check against real play.

## Research plan (no game changes during this)

Each step produces numbers we can compare later. The test harness is the same dev-console script used above, and it can become a permanent **"Balance lab"** button in dev mode so we can re-run it after every change.

**R1. Ultimate power map**
- For every class, measure crowd kill share and boss HP share at waves 5, 15, 25, 50 and 99, with three builds: no upgrades, a typical build for that wave, and a maxed build.
- Buff-type ults: measure your damage per second during the ult vs. without it (Berserker, Shinobi, Hatamoto, Kabuki and the others).
- Check why Raijin, Tengu and Yuki-onna killed nothing (targeting, timing, or just weak).
- Output: one table, every class, ult strength relative to your own normal damage.

**R2. Ult charge timing**
- How many seconds into a wave until your first ult, and how many ults per wave, at waves 5, 15 and 30. Use real enemy density and the new slower charge rates.

**R3. True rarity odds**
- Simulate 10,000 level-ups and 10,000 shops with the real code (including injections, Ronin's extra card, rerolls and altars).
- Output: actual common / rare / legendary rates per level-up and per shop, and legendaries seen per run.

**R4. Coin income and item value**
- Coins earned per wave (kills, chests, skips, omens) at waves 5, 10, 20 and 30.
- Then: when can a player afford their first legendary, and how many do they own by wave 25?
- Value per coin for every shop item vs. the matching level-up perk.

**R5. Player power vs. enemy power curve**
- Simulate a "typical" run (average picks, average purchases) and plot your damage per second and health against enemy HP and damage per wave.
- Find where the game becomes trivial and where it becomes impossible.

**R6. Real play data**
- Play 10+ normal (non-dev) runs on mixed classes, then open dev mode → Balance report → Copy JSON and paste it to Claude.
- This shows real pick rates, death causes and wave reached per class, to check the simulations against.

**R7. Claude playtests every class (bot runs + ult visual review)**

Claude can't play with a keyboard and see it live the way you do, but it can drive the game from the browser console and look at screenshots. This step has three parts.

*a) Bot runs to judge power*
- A simple scripted player (a bot) plays full runs on Normal with each of the 25 classes:
  - it kites away from enemies when hurt and attacks the nearest foe
  - it dashes away from danger warnings
  - it fires the ult when ready
  - it picks level-up cards and shop items with a fixed, sensible rule
- It runs headless at high speed: about 3 runs per class, waves 1–25 (the Final Boss), then Endless until death.
- Recorded for each class:
  - wave reached and whether it beat the Final Boss
  - how many seconds each boss fight took
  - what share of damage came from the ult
  - what killed it
- Output: a class tier list (S / A / B / C / D) for "how easy is it to beat the game with this class", backed by the numbers.

*b) Ult visual review*
- For each class, fire the ult in a crowd and take screenshots at 3–4 moments: start, middle, peak and end.
- Each ult is scored 1–5 on:
  - **readability:** can you tell what it does and where it hits?
  - **impact:** does it look as strong as it is?
  - **clarity:** can you still see yourself and enemy attacks during it?
  - **style:** does it fit the ink and samurai look?
- Output: a short note per class, flagging ults that look weak for how strong they are (or the other way round) and ones that hide danger.

*c) Power vs. looks check*
- Put the tier list and the visual scores side by side. An ult that looks huge but is weak (or looks small but is overpowered) is a mismatch to fix in the balance pass.

**Limits to keep in mind**
- A bot plays worse than a person in some ways (no clever positioning) and better in others (perfect reactions to warnings). So the tier list shows **relative** class strength, not exact difficulty.
- Screenshots show still frames, not motion. Judging motion, timing and sound still needs you to watch.
- These findings are a starting point to check against your own play and the R6 Balance report data.

**R8. How other roguelites solve the same problems**

Look up how well-known games handle each issue we found, and pull out ideas that fit a wave-survival game:

| Our problem | Games to study | What to find out |
|---|---|---|
| Ults that ignore player power | Hades (God Gauge / Call), Risk of Rain 2 (special skills scale with your damage), Halls of Torment, Hi-Fi Rush, Diablo-style ultimates | Does the big move scale with the wave, with your stats, or both? Do bosses take reduced ult damage? How long is the charge? |
| Shop rarity | Brotato (item tier chance by wave and Luck), The Binding of Isaac (item pools and quality), Slay the Spire (card rarity offsets) | How do rare and legendary odds change over a run? Is there "bad luck protection"? |
| Shop item strength | Brotato, Vampire Survivors, Risk of Rain 2 (common, uncommon and legendary item ratios) | How much stronger is a legendary than a common in those games? How do prices compare to income? |
| Class balance | Hades weapons and aspects, Dead Cells, Vampire Survivors characters | How do they keep very different playstyles roughly equal? What gets tuned (damage, cooldown, size)? |
| Ult visuals | Hades, Hi-Fi Rush, Genshin Impact bursts, Overwatch ults | How do strong ults stay readable without hiding enemy attacks (flash timing, darkened backgrounds, slow-mo)? |

Output: a short "what they do → what we should do" table for each problem, with sources. The proposed targets below get checked against it before anything is changed.

---

## Targets to agree on before any changes

These are starting proposals. Change them to whatever feels right.

| Area | Proposed target |
|---|---|
| Ult vs. crowds | Without upgrades, an ult clears about 60–80% of a pack early (waves 1–10), falling to about 30–40% by wave 50. Upgrades bring it back up. |
| Ult vs. bosses | One ult takes at most about 10–15% of a boss's HP (never a full kill on a wave-10 boss without upgrades). |
| Ult scaling | Mostly from **your** power (damage upgrades, ult perks), with only a small wave bonus. |
| Class spread | Every class's ult within about ±30% of the average on the R1 table. |
| Shop rarity per slot | About 60% common, 30% rare, 10% legendary (legendary rising a little after wave 10). |
| Shop values | Rare about 2× a common, legendary about 2× a rare. Damage example: 6% / 12% / 25% instead of 12% / 30% / 75%. |
| Level-up rarity | Real odds (after injections) of about 70 / 25 / 5. |

## After the research

1. Fill in the R1–R5 tables.
2. Agree on the final numbers.
3. Change everything in one pass. Most of the numbers live in `src/content/curves.ts`, `ultDmg`, `SHOP_POOL` and `rollShopOffer`.
4. Re-run the Balance lab and compare before and after.
