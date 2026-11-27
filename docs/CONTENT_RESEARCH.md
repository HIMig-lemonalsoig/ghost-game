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

---

# C5 results (2026-11-27)

All numbers come from the real formulas in `src/content/curves.ts` and `rollPerkChoicesInner()` / `pickRollKind()` in `src/GhostGame.ts` (script: average damage, not single-hit luck).

## C5a. Crit chance × crit damage
Average damage from crits = 1 + crit chance × (crit damage − 1). Crit chance is soft-capped (`soft(points, 0.5, 0.75)`): 6 points → 8%, 20 → 21%, 39 (every crit source today) → 33%, 100 → 50%, never above 75%.

**Value of one card** (damage increase it gives you), by build:

| Build | Honed Edge (+15% dmg) | Keen Eye (+6 crit) | Killing Edge (+20 crit) | Deep Cut (+0.25× crit dmg) | Bone Splitter (+0.5× crit dmg) |
|---|---|---|---|---|---|
| Fresh: no damage, no crit | +14.5% | +16.1% | **+42.9%** | 0% | 0% |
| +60% damage, 0% crit | +7.2% | +16.1% | **+42.9%** | 0% | 0% |
| +60% damage, 21% crit | +7.2% | +5.9% | +16.7% | +3.7% | +7.5% |
| +60% damage, 33% crit | +7.2% | +3.2% | +9.3% | +5.0% | +9.9% |
| +120% damage, 41% crit | +4.5% | +1.9% | +5.8% | +5.6% | **+11.3%** |

Findings:
- **Killing Edge is the strongest rare in the game early** (+43% damage from one card). That's because the first crit points are worth a lot at 3×. It's fine as a rare, but new crit cards shouldn't pile on top of it.
- **Crit damage is worthless until you have crit**, then becomes the best late card. This matches Halls of Torment: only offer crit-damage cards once crit chance is at least ~15%.
- **Keep crits at 3×** (no nerf to existing builds). Crit-damage cards add to the multiplier: +0.25 (common), +0.5 (rare), soft-capped at +2 (so never above 5×).
- New crit-chance cards should be smaller than Killing Edge: Steady Aim +5 points, Hawk's Eye +10.

## C5b. Soft caps for the new stats
Stacking the same card keeps helping but less each time; never reaches the cap.

| New stat (curve) | Common ×1 / ×3 / ×5 / ×10 | Rare ×1 / ×3 / ×5 / ×10 | Cap |
|---|---|---|---|
| Crit damage (add, k 2, max 2) | +0.22 / +0.55 / +0.77 / +1.11× | +0.40 / +0.86 / +1.11 / +1.43× | +2× (5× total) |
| Area (mul, k 0.8, max 0.8) | +9 / 22 / 31 / 44% | +16 / 34 / 44 / 57% | +80% |
| Luck (add, k 1, max 1) | +9 / 23 / 33 / 50% | +17 / 38 / 50 / 67% | +100% |
| XP gain (mul, k 1, max 1) | +9 / 23 / 33 / 50% | +17 / 38 / 50 / 67% | +100% |
| Pickup radius (mul, k 1.5, max 1.5) | +25 / 56 / 75 / 100% | +43 / 82 / 100 / 120% | +150% |
| Dodge (add, k 0.3, max 0.3) | — | 6 / 13 / 17 / 22% | 30% |
| Frost chance (add, k 0.5, max 0.5) | 10 / 21 / 27 / 35% | (same card) | 50% (same as other elements) |
| Damage vs bosses (mul, k 1, max 1) | — | +20 / 43 / 56 / 71% | +100% |
| Projectiles | +1 per card, hard cap +4 | Pierce +1, hard cap +3 | — |

Dodge is capped lowest (30%) because a dodge cancels a whole hit. Boss damage stops at +100% so the 12% per-ult boss cap and boss HP still matter.

## C5c. Card pool dilution
Simulated with the real odds (70% common / 25% rare / 5% legendary per card, 3 cards per level-up). Today's pool for one class is about 18 common, 21 rare and 12 legendary cards. Adding the ~26 candidate perks (8 / 10 / 8):

| Chance to see ONE specific card at least once | By level-up 8 (≈ wave 6) | By level-up 14 (≈ wave 11) |
|---|---|---|
| Common | 63% → 49% | 82% → 69% |
| Rare | 26% → 18% | 41% → 29% |
| Legendary | 10% → 6% | 17% → 10% |

But **themes get easier to build**: today the crit "family" (2 cards) appears on 3+ level-ups by level-up 14 in 34% of runs; with a 5-card crit family it's **58%**.

Findings:
- Adding 26 cards makes any single card about 30% rarer, which hurts runs chasing one legendary.
- Fix, as in Hades (gods you've taken show up more): **family weighting**. Cards from a family you already own a card from (crit, area, frost…) get ×1.5 weight. Plus the existing reroll / banish tools and the Shrine's Lore node.
- Don't add all 26 at once: start with the stats that have **zero** sources (crit damage, area, projectiles, luck, XP, pickup, frost), about 14 cards.

## C5d. Enemy pacing (found an existing bug)
`pickRollKind()` adds chances in a fixed order, and from wave 10 they add up to **more than 100%** (105% at wave 10, 153% by wave 20). Types at the end of the list get squeezed out:

| Wave | Heavy (intended → actual) | Assassin (intended → actual) | Plain grunts |
|---|---|---|---|
| 8 | 35% → 35% | 0 → 0 | 22% |
| 10 | 35% → 30% | 2.5% → 2.5% | **0%** |
| 12 | 35% → **6.8%** | 7.5% → 7.5% | 0% |
| 15 | 35% → **0%** | 15% → **2.2%** | 0% |
| 20 | 35% → **0%** | 18% → **0%** | 0% |

So **heavies disappear from wave ~13 and assassins from ~16**, and plain grunts vanish at wave 10. Adding new enemies on top would push even more out.

Fix before adding enemies: turn the chances into **weights** and normalize them, so every unlocked type keeps a share (Brotato-style spawn tables). This changes late-wave difficulty (heavies come back), so it needs a bot check after the fix.

**Proposed introduction waves for new enemies** (one new type per normal wave, none on boss waves, each taking its share from the weights rather than adding density):

| Wave | Today | Proposed new |
|---|---|---|
| 11 | — | Inoshishi (charger) |
| 13 | — | Kappa raider (ambusher) |
| 14 | — | Taiko drummer (buffer) |
| 16 | — | Tsukumogami (splitter) |
| 17 | — | Yumi sniper |
| 18 | — | Mukade (trail-layer) |
| 19 | — | Yuki-warashi (frost control) |
| 12+ | — | Mimic: 10% of Spirit Chests |
| Endless 30 | — | Ōmukade boss (adds to the boss rotation after the Final Boss) |

Waves 2–10 already introduce a new type almost every wave, so new enemies go into waves 11–19, which today introduce only one (Mirror Monk at 12). Late runs get fresher without making the early game harder.

## C5e. Starting ult budgets for new classes
Each new class's ult reuses a mechanic we've already measured with the ult budget harness (target 60 grunts' worth at wave 25, ±30%). Start from that class's multiplier, then re-measure after building.

| New class | Ult idea | Closest measured ult | Its score | Starting setting |
|---|---|---|---|---|
| Teppō (gunner) | Volley line: a row of gunners fires across the screen | Tetsubo cone (61), Kensei line (58) | ~60 | ULT_CLASS_MUL ≈ 1.0 (line damage like Kensei) |
| Takajō (falconer) | Hawk dives on every marked foe for 6s | Kagemusha clone (58) | 58 | Pet damage like the clone, `ultDmgRaw(7.5)` per strike |
| Karakuri-shi (puppeteer) | Drops 3 automaton turrets for 8s | Kagemusha clone ×3 | ~3 × 58 = too much | Each turret at ~⅓ of a clone's damage |
| Bakuto (gambler) | Rolls dice: random ult from 6 effects | Average of the 6 effects | varies | Budget each face at 60; random choice keeps the average fair |
| Rikishi (sumo) | Grabs and slams foes in a ring | Tetsubo launch (61) | 61 | ULT_CLASS_MUL ≈ 1.6 |
| Sumi-e Painter | Paints an ink tiger that rampages for 6s | Kagemusha clone (58) / Onmyoji tempest (69) | ~60 | Tiger hits like the clone, plus area like Tempest at half |

## Recommended build order
1. **Fix the enemy roll** (weights + normalize) and re-check difficulty with the bot. This is a bug fix that matters even with no new content.
2. **Crit damage stat + crit family** (Deep Cut, Bone Splitter, Death Blossom; Steady Aim, Hawk's Eye; shop: Whetted Eye, Assassin's Ledger, Night Lantern), with the "only after 15% crit" rule.
3. **Zero-source stats**: area, projectiles, luck, XP, pickup, frost (about 14 cards + 6 shop items), each with the soft caps above, plus **family weighting**.
4. **New enemies** in waves 11–19 (one at a time, bot-checked).
5. **New classes** (one at a time, ult budget measured).

### C5d follow-up: spawn bug fixed (2026-11-27)
`pickRollKind()` now uses normalized weights with plain grunts kept at ≥15% (`SPAWN_MIN_NORMAL`). Measured in-game (4,000 rolls per wave):

| Wave | Heavy | Assassin | Grunts | Types spawning | Avg enemy HP / damage vs before |
|---|---|---|---|---|---|
| 8 | 35% (same) | 0 | 22% | 9 | unchanged |
| 10 | 29% | 2% | 15% (was 0) | 11 | −4% / −3% |
| 12 | 24% (was 7%) | 5% | 14% | 12 | +5% / +2% |
| 15 | 20% (was 0) | 8% (was 2%) | 15% | 12 | +1% / +4% |
| 20 | 21% (was 0) | 9% (was 0) | 14% | 12 | +3% / +5% |

New enemies can now be added as weights without pushing anything out.

## Step 4 done: new enemies (2026-11-27)
Built in `src/newenemies.ts`: Boar Spirit (11), Mimic (12, rare), Kappa Raider (13), Taiko Drummer (14), Tsukumogami (16), Yumi Sniper (17), Mukade (18), Yuki-warashi (19). Spawn weights, telegraphs, bestiary, tips; mimic / submerged kappa / small umbrellas can't be elites.

Measured (4,000 rolls per wave):

| Wave | Types spawning | New-enemy share | Avg enemy HP / damage vs. after the spawn fix |
|---|---|---|---|
| 11 | 12 | 1% | +0% |
| 12 | 14 | 2% | +4% / +0% |
| 15 | 16 | 8% | +8% / +2% |
| 19 | 20 | 15% | — |
| 20 | 20 | 16% | +7% / +1% |
| 25 | 20 | 18% | +5% / 0% |

Bot check (all 8 spawned around a standing player for 12 s): no errors; charge, aim, surfacing, drumming, splitting, poison trail, frost rings and mimic chest drop all work.


## Step 5 done: new classes (2026-11-27)
Built in `src/newclasses.ts` (state in `g.nc`), wired into class select, signatures, ult styles, ult perks and unlocks.

| Class | Signature | Ult | Unlock | Ult budget (target 60, band 42–78) |
|---|---|---|---|---|
| Teppō | every 4th shot ×3, pierces | Three Ranks Fire | Arashi wave 10 | 63 |
| Takajō | hawk dive every 3s | Sky Hunt (5 hawks) | 1,500 kills | 61 |
| Karakuri-shi | turret every 12s | Clockwork Battalion (3 turrets) | 25 chests | 57 |
| Bakuto | per-wave lucky die | Roll of Fate (2d6) | any class wave 18 | 53 (avg of 6 rolls) |
| Rikishi | dash shove + stun | Dohyō Stomp ×3 | Tetsubō wave 10 | 65 |
| Sumi-e Painter | ink pool every 5th hit | Living Ink (ink tiger) | Onmyōji wave 10 | 61 |

Class multipliers in `content/ultbalance.ts`: takajo 6.5, karakuri 4, sumie 5.5 (pets/pools started at 9–15), bakuto empower 4.5. Checked by bot and screenshots only, not real play.
