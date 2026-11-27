# Yūken Roadmap (formerly Ghost Game): lessons from the roguelite research

This plan is built from what Hades, Vampire Survivors, Brotato, Risk of Rain 2, Slay the Spire, Dead Cells and Halls of Torment do well.
There are 7 phases, in the order they depend on each other. Each phase is roughly one session of work. Every phase ends with the same release steps:
- update the dev panel so the new feature can be tested
- add achievements for it
- check it in the browser
- rebuild `offline/Yuken.html`
- deploy

| # | Phase | Why it matters | Size |
|---|-------|----------------|------|
| 1 ✅ | Foundations: smooth stat curves, content files, balance tracking | Fixes how the stat caps feel, makes the later phases easier, and collects data | S |
| 2 ✅ | Elite affixes | Lots of fight variety for little work; Phase 3 needs it | S–M |
| 3 ✅ | Weapon evolutions + duo perks | Gives every run a goal to build toward (the biggest gap right now) | M |
| 4 ✅ | New enemy roles: controller + summoner | Fills the two roles that are missing | M |
| 5 ✅ | Class signature passives | Makes the 25 classes play differently instead of just having different numbers | M–L |
| 6 ✅ | Vows (Hades-style "Heat") | A long-term goal for players who've beaten Death | M |
| 7 | Data-driven balance pass (best after Round 2 phases 8–10) | Tune using real pick rates and wave numbers instead of guesses | S |

---

## Phase 1: Foundations ✅ done

Shipped: curves in `src/content/curves.ts`; defense now actually reduces damage (before this, `mitigateIncoming` was never called, so defense did nothing); shop previews; `src/telemetry.ts` plus the dev panel → Balance report / Copy JSON. Defense items were changed to +2 / +5 and Thick Hide to +2.

**1a. Smooth stat curves instead of hard caps.** Brotato's armor and Risk of Rain 2's hyperbolic items both work this way: every point still helps, just a little less each time.

```
soft(x, k, max) = max * x / (x + k)     // reaches max/2 when x = k, never hits max
```

| Stat | New rule | Examples |
|------|----------|----------|
| Defense | damage reduction = `soft(def, 20, 0.8)`, replacing flat −1 per point | 5 def → 16% · 20 → 40% · 60 → 60% |
| Attack speed | bonus = `soft(effectiveDex, 40, 1.5)` | 20 dex → +50% · 60 → +90% · max +150% |
| Crit chance | `soft(critPoints, 0.5, 0.75)` | 0.25 → 25% · 1.0 → 50% |
| Move speed | `soft(bonus, 0.4, 0.5)` | +12% item → +11% · stacked +80% → +33% |
| HP regen, coin bonus, haste | keep the current hard caps (they're fine) | |

The shop text should show what an item really adds, for example "+1 defense (→ 18% reduction)". The `STAT_CAPS` table stays as a backstop, and the "maxed item" filter only applies to stats that still have a hard cap.

**1b. Split the content out of `GhostGame.ts`.** The file is about 13,000 lines long. Add a `src/content/` folder with `elites.ts`, `evolutions.ts`, `duos.ts`, `vows.ts` and `signatures.ts`. Each holds data plus small hook functions, so new content doesn't keep growing the engine file.

**1c. Balance tracking** (Slay the Spire's approach). Save these per browser under `ghostgame.telemetry.v1`:
- how often each perk, shop item and weapon is **offered** and how often it's **picked**
- for each class: runs, average wave, and best wave per difficulty
- **what killed you**: enemy type or boss, plus the wave
- the dev panel gets a "Balance report" tab and a "Copy JSON" button, so the data can be pasted back to Claude

---

## Phase 2: Elite affixes ✅ done

Shipped: `src/content/elites.ts` (all tuning), elites spawn through `spawnSingleEnemy`, Hard and Death bosses get 1 affix, Spirit Chests (coins, an item and +15% HP for now; `openSpiritChest()` is the hook for Phase 3), a first-encounter tip for each affix, the dev panel "Spawn elite" / "Drop Spirit Chest", and 4 achievements. Size is ×1.3 rather than the planned ×1.6, which was too big on screen.

From wave 6, any normal enemy can spawn as an **elite** with one affix. That means 1.6× size, 2.5× HP, a colored aura and a name tag such as "Burning Brute".

| Affix | Effect | Counterplay |
|-------|--------|-------------|
| Burning 炎 | leaves a fire trail that hurts | don't chase it in a straight line |
| Frost 氷 | aura slows you | fight it from range |
| Vampiric 吸 | heals 30% of the damage it deals | burst it down |
| Hasted 速 | +40% speed, attacks faster | block, dash or stun it |
| Splitting 分 | splits into 2 small copies on death | AoE |
| Warded 盾 | blocks the first 3 hits | multi-hit weapons |
| Volatile 爆 | explodes 1s after death (telegraphed) | move away |
| Commander 将 | nearby enemies +20% damage | kill it first |

- **How often:** 3% at wave 6, rising to 12% at wave 20. From wave 18 an elite can have 2 affixes.
- **On Hard and Death:** bosses get 1 random affix.
- **Reward:** coins ×3 and a guaranteed **Spirit Chest**, which Phase 3 needs.
- **Visuals:** colored outline and aura, plus a tag over the HP bar. Every affix is telegraphed.
- **Dev panel:** spawn an elite with a chosen affix.
- **Achievements:** kill one of each affix (Rare); kill a 2-affix elite (Uncommon).

---

## Phase 3: Weapon evolutions + duo perks ✅ done

Shipped: `src/content/evolutions.ts` and `src/content/duos.ts`. Evolved weapons hit ×1.4 harder. Bosses now drop Spirit Chests too. The pause screen shows evolution progress, the weapon slot glows when a weapon is ready, and evolved weapons show their new name. 5 achievements were added, plus dev-panel buttons (Evolve / Ready / Give duo).

Changes from the plan:
- Blowgun's catalyst is Refined Toxin (poison) instead of Hemorrhage.
- Jutte's catalyst is Counter Strike or Perfect Guard, and Crossbow also accepts Keen Eye or Killing Edge.
- Two duos were rewritten to use perks that actually exist: Frostbite Venom became **Venom Strike** (Poison + Crit), and Blood Mirror became **Undying Rage** (Bloodlust + Last Stand).

**Evolutions** (Vampire Survivors style). A weapon evolves when all three are true:
1. **Mastery 3**: you bought 3 of its damage upgrades (Mastery, Honed or Forged)
2. you own its **catalyst** perk or shop item
3. you open a **Spirit Chest** (dropped by an elite or boss)

The evolved weapon replaces the base one in its slot. A gold glow on the weapon chip means it's ready to evolve.

| Weapon | Catalyst | Evolution |
|--------|----------|-----------|
| Katana | Honed Edge | **Kusanagi**: every 3rd swing sends a wind wave |
| Yumi | Long Blade | **Raiden Bow**: arrows pierce all enemies |
| Kunai | Swift Step | **Shadow Fan**: throws 5 at once and they come back |
| Smoke Bomb | Ghost Step | **Ninja Fog**: the cloud follows you for 4s |
| Tetsubishi | Tainted Blade | **Venom Caltrops**: stack poison, bigger area |
| Kusarigama | Cruel Strike | **Reaper's Chain**: pulls a whole group in |
| Crossbow | Killing Eye | **Siege Repeater**: 6-bolt bursts that can crit |
| Tessen | Wide Arc | **Gale Fan**: knockback that slams enemies into each other |
| Jutte | Thick Hide | **Iron Warden**: disarming a foe gives you a shield |
| Ono | Bloodlust | **Executioner's Axe**: instantly kills elites below 15% HP |
| Shuriken Wheel | Momentum | **Storm Wheel**: orbits you while spinning |
| Flame Spear | Roaring Flame | **Phoenix Lance**: the thrust leaves a fire line |
| Twin Sai | Light Hands | **Thousand Needles**: each 4th hit is a flurry |
| Odachi | Iron Body | **Moon Cleaver**: a crescent hits the whole screen width |
| Blowgun | Hemorrhage | **Plague Pipe**: darts spread poison clouds |
| Tate | Lacquered Plate | **Fortress Wall**: blocking reflects projectiles |

**Duo perks** (Hades style). When you own both perks in a pair, a special duo card can show up at level-up (about 1 in 4 level-ups once it's possible), marked with a unique gold-and-violet frame.

| Needs | Duo perk |
|-------|----------|
| Burn + Bleed | **Searing Wounds**: bleed ticks also burn |
| Poison + Chill | **Frostbite Venom**: poisoned and chilled foes shatter on death |
| Lightning + Crit | **Thunderclap**: crits call lightning |
| Lifesteal + Thorns-style perk | **Blood Mirror**: reflected damage heals you |
| Momentum + Battle Meditation | **Endless Flow**: each wave clear resets all cooldowns |
| Dash talisman + Ghost Step | **Phantom Rush**: dashing through enemies stealth-kills weak ones |
| Wildfire + Reaper's Bell | **Funeral Pyre**: soul shockwaves ignite |
| Wide Arc + Long Blade | **Heaven's Reach**: katana hits reach the screen edge at 50% damage |

**Dev panel:** give a Spirit Chest; force an evolution.
**Achievements:** first evolution (Uncommon), evolve 8 weapons (Epic), all 16 (Legendary), first duo (Rare), every duo (Legendary).

---

## Phase 4: New enemy roles ✅ done

Shipped: all three, including the optional Mirror Monk. Tuning is in `src/content/enemies.ts`. Each one shows a first-encounter tip. Nue summons give 1 XP and 0 coins, so farming them isn't worth it. 2 achievements were added (Exorcist, Nip It in the Bud), and all three are in the dev panel's spawn list.

| Enemy | Role | Behavior | From wave |
|-------|------|----------|-----------|
| **Onryō** 怨 (vengeful spirit) | Controller | Keeps its distance. Throws ink pools (slow you 40%, 2s telegraph) and sometimes a binding talisman (roots you 0.6s, clearly shown, can be dashed through) | 7 |
| **Nue** 鵺 (chimera summoner) | Summoner | Hides behind allies and summons 3 wisps every 6s, up to 9. Low HP, so it's a priority target. Its summons die with it | 9 |
| **Mirror Monk** 鏡 *(optional)* | Anti-ranged | Reflects projectiles from the front; melee hits from behind work | 12 |

Each new enemy shows its counterplay in the tutorial tip the first time it appears.
**Achievements:** kill a Nue before it summons (Rare).

---

## Phase 5: Class signature passives ✅ done

Shipped: `src/content/signatures.ts` holds all 25 signatures (the 9 new ones are marked `added`) and their tuning. The class screen shows a highlighted Signature box, and Passives lines that just repeat it are hidden.

Changes beyond the plan:
- Enemies that are searching for a hidden player can now be stealth-killed. This applies to every class and makes Vanish and smoke work together.
- Yamabushi's shield comes from regen and kill heals, through the new `healPlayer()`.

Rule: **every class gets one passive that changes the rules**, not just a number. 16 classes already have one. These 9 only change stats:

| Class | New signature passive |
|-------|-----------------------|
| Kensei | **Focus**: standing still for 0.6s makes the next swing a guaranteed wide crit |
| Shinobi | **Vanish**: after a dash, you're hidden for 1.2s if you don't attack (uses the new stealth system); stealth kills refund the dash |
| Ronin | **Masterless**: +1 shop slot and 1 free reroll every wave, but level-ups offer 2 cards instead of 3 |
| Yamabushi | **Mountain Prayer**: healing past full HP becomes a temporary shield (max 30) |
| Onna-Bugeisha | **Sweeping Stance**: hitting 3+ enemies in one swing refunds the dash cooldown |
| Arashi | **Tailwind**: projectiles pierce +1 enemy; ranged kills stack +5% move speed (max 5, lasts 3s) |
| Tetsu-bo | **Unstoppable**: can't be slowed or knocked back; enemies you knock into each other are stunned |
| Ashigaru | **Spear Wall**: standing still raises a brace, and enemies that run into you take damage and stop |
| Tengu | **Feather Dash**: dashing through enemies leaves feathers that burst; you can dodge projectiles mid-dash |

The other 16 already have rule-changing passives. Look at their numbers in Phase 7.
The class screen shows the signature passive in its own highlighted box.

---

## Phase 6: Vows (Hades-style Heat) ✅ done

Shipped: `src/content/vows.ts` holds 10 vows, max score 30. The Vows button sits under Difficulty (locked until wave 15), and the score shows in the HUD, pause and end screens. Vows are saved with Continue, Career shows your "Best Vow run", and there are 3 achievements (Sworn, Oathbound, Every Oath Sworn) plus a dev-panel "Toggle Vows unlock".

Changes beyond the plan:
- Each Vow point gives +3% coins as a reward.
- Every heal in the game now goes through `healPlayer()`, so Thin Blood (and Yamabushi's shield) apply to all healing.
- No Rest also removes the shop's heal items and the Battle Meditation perk.

- **Unlocks** after reaching wave 15 on any difficulty.
- **Where:** a "Vows" panel next to difficulty on the class screen.
- **Score:** each vow rank adds to a **Vow score** shown on Career and next to records.

| Vow | Per rank | Ranks |
|-----|----------|-------|
| Iron Hide | enemies +20% HP | 3 |
| Swarm | +15% enemy density | 3 |
| Elite Blood | elite chance ×1.5 | 2 |
| Sharp Steel | enemy damage +15% | 3 |
| Stingy Merchant | shop prices +20% | 2 |
| Thin Blood | healing −25% | 2 |
| Quick Death | telegraphs 15% shorter | 2 |
| Boss Fury | bosses gain an affix (and a 2nd at rank 2) | 2 |
| No Rest | no heal between waves | 1 |
| Long Night | waves last 20% longer | 2 |

- **Records** are stored per Vow score.
- **Achievements:** Vow score 10 at wave 15 (Epic), 20 (Legendary), 30 at wave 25 (Mythic).

---

## Phase 7: Data-driven balance pass ✅ done (7.0–7.10, 2026-11-26)

Use the tracking from Phase 1 after some real play (yours and your friends'):

| Problem in the data | Fix |
|---------------------|-----|
| Item or perk picked less than 10% of the time it's offered | rework it, don't just buff the number |
| Item or perk picked more than 60% of the time | check whether it's a must-take |
| Class average wave more than 25% off the middle | adjust that class's signature passive first |
| One enemy causes more than 30% of deaths | check its telegraph and damage |

**Targets:** a decent player on Normal reaches wave 12–18, and boss waves are the most common place to die.

Re-run the headless power-curve bot (`scratchpad/sim.js` pattern) to check that no build is immortal by wave 20.

### Phase 7 implementation plan (after all research in `docs/BALANCE_RESEARCH.md` is done)

Research so far (R1 ult measurements, R8 other games) points to these changes, in this order:

| # | Change | Why | Done when |
|---|---|---|---|
| 7.1 ✅ | **Ults scale with you, not the wave.** Ult damage comes from your own damage and ult upgrades (like Risk of Rain 2 skills), with only a small wave bonus. | Today every damage ult gets +35% per wave automatically, so a no-upgrade character at wave 99 wipes crowds and builds barely matter (R1). | A no-upgrade ult at wave 50 clears about 30–40% of a pack; a strong build clears most of it. |
| 7.2 ✅ | **Boss cap on ults.** One ult takes at most about 12% of a boss's HP. | Ults deleted wave-10 bosses (Miko, Kunoichi, Samurai 99–100%). Isaac and RAID cap big hits on bosses. | No single ult does more than 12% to any boss. |
| 7.3 ✅ | **Shop rarity weighted Brotato-style.** About 65% common, 28% rare, legendary 0–2% early rising per wave to about 8%, plus Slay-the-Spire-style bad-luck protection. | Today picks are uniform, so about 21% of slots are legendary and rares beat commons. Other games: 1–8%. | Simulated shops match the target odds. |
| 7.4 ✅ | **Smaller shop values, rising prices.** Each rarity is about 2× the one below (damage 6% / 12% / 25% instead of 12% / 30% / 75%). Legendary prices grow with the wave. | One shop legendary equals five level-up damage picks. | Shop items sit close to level-up perks in value per pick. |
| 7.5 ✅ | **Even out the classes.** All ults within about ±30% of each other: weak damage ults up, Miko and Onmyoji down, power-up ults (Berserker, Shinobi, Kabuki, Kagebushi, Hatamoto) stronger, and the seven "does nothing" ults fixed or checked for bugs. | The spread is about 70× (Miko 68.8× vs. Kensei 0.9×). | R1 and R7 tables re-run: every class within the target band. |

**Added after R2–R4:**

| # | Change | Why | Done when |
|---|---|---|---|
| 7.6 ✅ | **Ult cooldown floor.** Charge still comes from kills and hits, but there's a minimum of about 20–25 seconds between ults, and charge per kill shrinks as waves get bigger. | Late waves have 100–180 kills, so the bar fills every 8–9 seconds (R2). | At most about 3–4 ults per late wave. |
| 7.7 ✅ | **Coins vs. prices.** Kill rewards grow more slowly per wave, and shop prices grow faster after wave 8. | From about wave 7, one wave pays for 3–6 legendaries, so the shop is effectively free (R4). | A late-wave player can afford about 1 legendary or 2–3 rares per shop. |
| 7.8 ✅ | **Ability cards stop counting as "rare"** for rarity rolls (they get their own slot chance), and duo perks get their own odds instead of raising legendary rates. | Abilities make up about half of all cards, so rares are 61–74% of level-up cards and commons only 18–34% (R3). | Level-up cards land near 70 / 25 / 5 again. |

**Added after R7 (bot runs + ult visual review):**

| # | Change | Why | Done when |
|---|---|---|---|
| 7.0 ✅ | **Fix what's broken first:** check Raijin's and Tengu's ults (nothing visible, nothing hit), Kensei's, Tetsubo's and Ashigaru's (did ~nothing to grouped foes), and the end-screen damage labels ("Class powers" too big, shares over 100%). | Tuning broken things gives wrong answers (R1, R7). | Every ult deals its intended effect, and the damage breakdown adds up to 100%. |
| 7.9 ✅ | **Smooth the wave-5 boss wall.** Gentler first boss (or a warm-up mini-boss at wave 3), with later boss waves stepping up evenly. | 38 of 75 bot runs died on wave 5. Waves 1–4 are trivial, then difficulty jumps. | The bot's wave-5 death rate drops to about 15–25% for mid-tier classes. |
| 7.10 ✅ | **Ult visual pass:** shrink or remove the name banner (it hides the first ~1.2 s and enemy warnings), give power-up ults a clear look (Berserker, Shinobi, Yamabushi, Kagebushi, Kabuki, Tengu), match looks to power (Tetsubo and Yuki-onna look huge but are weak; Kunoichi looks strongest but is mid; Tsuchigumo and Kitsune look medium but are the strongest), and tone down blinding effects (Onmyoji's white blob, Kunoichi's storm). | R7b scores; League rule that visual weight should match gameplay weight. | Re-run the screenshot review: every ult scores at least 3 on Readable and Clear. |

**7.0 results (done 2026-11-26):**
- **The five "do-nothing" ults are not broken.** Measured properly with enemies in their real hit area:
  - Kensei: 1,895 damage, about 20× normal
  - Tetsubo: 1,706, about 7×
  - Ashigaru: 1,538
  - Raijin: 2,730 while attacking, about 17×
  - Tengu: 261 while dashing, about 5×

  Their low R1 numbers came from my first test setup. Raijin and Tengu are power-up ults that only act when you hit or dash. That's a visual problem for 7.10, not a bug.
- **Damage breakdown fixed** (end screen and run history):
  - dash, poison, burn, bleed, deflect, thorns, lightning and caltrops damage now count toward "Damage dealt", so the bars add up to 100%
  - ult effects that outlast the cast (Arashi's storm, Ronin's debt, Kappa's wave, Dokkaebi's ghosts, Kitsune's foxfires, Kagemusha's clones, Tengu's gale, Raijin's thunder) now show as "Ultimate" instead of "Class powers" or "Other"
  - the Fox Companion perk has its own bar
- **New balance findings for 7.1 / 7.5:**
  - **Soul Rend** does a share of the target's max HP (480,000 to four 1,000,000-HP dummies), so it shreds bosses whatever your build. Needs a boss cap like 7.2.
  - **Tengu's ult gale** does a flat 8 damage that never scales, the main reason Tengu is bottom tier.
  - **Sohei's Prayer Wheel, Onna's Thousand Cuts** and several other ults use the same wave-scaled formula as the rest, so they're covered by 7.1.

**7.1 results (done 2026-11-26):**
- Ult damage = base × weapon power (your katana growth, or your all-weapons multiplier, whichever is bigger) × wave bonus × ult upgrades. Your build now **multiplies** in instead of only counting once it beats the wave bonus.
- The wave bonus dropped from **+35% to +12% per wave** (`ULT_WAVE_SCALE` in `src/content/curves.ts`).
- Measured with 14 classes: total ult damage, in grunts' worth, 14 foes, 10 seconds.

  | | Wave 5 | Wave 25 | Wave 50 | Wave 99 |
  |---|---|---|---|---|
  | No upgrades, vs. before | 62% | 41% | 38% | 36% |
  | Built (6 Honed Edge + 2 ult perks), vs. before | 107% | 72% | 66% | 63% |
  | Built ÷ no upgrades | 2.4× (was 1.36×) | 2.4× | 2.4× | 2.4× |

- Effect: a no-upgrade ult now fades as waves go on (about half as strong relative to enemies by wave 50), while a built ult stays strong.
- Not handled here: the size of each class's ult (Kunoichi about 359 grunts' worth at wave 5 vs. Samurai about 27) is the spread that **7.5** evens out.

**7.2 results (done 2026-11-26):**
- One ult cast can take at most **12%** of a boss's max HP, and one Soul Rend cast at most **6%**. Any extra is ignored, and a "Resists" note pops once per cast. The limits are in `BOSS_CAST_CAPS` in `src/content/curves.ts`.
- Measured with a strong build:
  - Miko, Samurai, Onmyoji and Arashi ults take exactly 12% off both the wave-10 boss and the wave-25 Final Boss. Before, they took 88–100% of the wave-10 boss.
  - Soul Rend takes 6% per cast from the Final Boss. Before, it took 40% of the boss's current HP, ×3 on a crit.
  - Normal enemies are unaffected (Soul Rend still takes 40%+).
- Poison, burn and other effects applied by ult hits aren't capped. For example, Kunoichi's passive poison added about 6.5% on the wave-10 boss.

**7.3 results (done 2026-11-26):**
- Each shop slot rolls a rarity first, then an item of that rarity: **28% rare**, **no legendaries before wave 4**, then **2% rising 0.4% per wave to an 8% cap**, and the rest common.
- **Bad-luck protection:** every shop roll without a legendary adds +0.5% per slot, and it resets when one appears. This is saved with the run.
- Settings live in `SHOP_RARITY` in `src/content/curves.ts`.
- Simulated with 3,000 shops per wave and 500 full runs:

  | | Before | Now |
  |---|---|---|
  | Legendary per slot | 24% at every wave | 0% → 2% (wave 4) → 4.6% (wave 10) → 7.7% (wave 20) |
  | Shops showing a legendary | 82% | 12% (wave 4) → 24% (wave 10) → 38% (wave 20) |
  | Legendary-showing rolls per 25-wave run (out of 50) | about 41 | about 15 (3 by wave 10) |
  | First legendary seen | wave 1 | about wave 6 |

- Affording them is a separate step (7.4 prices and 7.7 coin income).

**7.4 results (done 2026-11-26):**
- Shop values now step about 2× per rarity and sit in the same range as level-up perks (Honed Edge +15%):

  | Item | Old | New |
  |---|---|---|
  | Whetstone (C) / Honed Whetstone (R) / Masterforged Edge (L) | +12% / +30% / +75% | +7% / +14% / +28% |
  | Per-weapon Mastery (C) / Honed (R) / Forged (L) | +12% / +30% / +75% | +10% / +20% / +40% |
  | War Paint (C) / Crimson Blade (R) | +8% / +15% | +5% / +10% |
  | Ronin's Gamble (R) | +30% dmg, −15% HP | +18% dmg, −12% HP |
  | Sharpened Tips (R) | +15% secondaries | +12% |
  | Ghost Steps (C) | +10% speed (more than the rare) | +5% |
  | Daimyo's Cuirass (L) | +5 defense | +4 |
  | Iron Resolve (C) / Soul Collector (R) | +10% max HP / +30 HP | +6% / +20 HP |
  | Spirit Surge (C) / Spirit Bell (C) | 50% ult / +25% charge | 35% / +12% |
  | Battle Drum (R) / Dash Talisman (C) / Fire Charm (C) | 20% / 15% / +10% | 15% / 10% / +6% |

- **Legendary prices** now rise an extra 4% per wave (`legPricePerWave`). Average legendary price: wave 5 about 173 (was about 120), wave 10 about 301 (was about 190), wave 20 about 632 (was about 300).
- Tested in the game: every effect matches its new description, and the shop shows the new text.

**7.5 results (done 2026-11-26):**
- **One shared ult budget:** the extra damage an ult adds over 10 seconds against a 14-enemy pack, at wave 25 with no upgrades. Target: about 60 grunts' worth, ±30%. The test harness is `budgetTest` (dev console). Settings live in `src/content/ultbalance.ts`.
- **Damage ults** get a per-class multiplier (`ULT_CLASS_MUL`):
  - toned down: Miko ×0.22, Kunoichi ×0.09, Onmyoji ×0.23, Tsuchigumo ×0.33
  - raised: Samurai ×3.4, Tetsubo ×1.62, Ronin ×1.55
- **Power-up ults keep their buff, and every weapon hit during them adds bonus ult damage that scales with your build** (`ULT_EMPOWER`). This covers Berserker, Shinobi, Kagebushi, Kabuki, Hatamoto, Yuki-onna, Yamabushi and Tengu. They still play like buffs, but now they matter (reshape, not just cut).
- **Tengu's** gale went from a flat 8 to scaling ult damage, and **Kagemusha's** clones now scale like an ult.
- **Result:**

  | | Before | After |
  |---|---|---|
  | Spread between classes at wave 25 | 0 to 272 grunts (over 200×) | 44 to 73, every class within ±30% |
  | Wave 10 sample | | 72 to 105 |
  | Wave 50 sample | | 50 to 66 |

- **Not measured by this budget:** defensive value (Yamabushi's immunity, Sohei's healing, Hatamoto's banner). Those classes sit at the low end of the band on purpose.
- **Watch:** strong ults are much weaker now (7.1 + 7.5). Re-run the bot playtests after 7.6–7.9 to check overall difficulty, especially the wave-5 wall.

**7.6 results (done 2026-11-26, Hades-style option):**
- The ult bar now fills from **damage you deal** (grunts' worth × 2.5%, doubled at low HP) and **damage you take** (8% per hit, 13% at low HP). **Kills no longer charge it**, and ult damage doesn't refill it.
- **Speed limits, so huge waves or tanking can't flood it:**
  - dealing damage: at most 2.5% per second (with a 12% burst allowance)
  - taking hits: at most 1.2% per second (with a 20% burst allowance)
- **Between waves, the bar is trimmed to 50%** (a softer version of Hades' reset each room). Charge perks and items (Spirit Bell and others) still multiply everything.
- Settings live in `ULT_CHARGE` in `src/content/curves.ts`.
- Measured with a bot that never dies (Kensei and Miko, waves 1–20):

  | | Before | After |
  |---|---|---|
  | Ults per wave, waves 2–7 | 1–4 | 1 |
  | Ults per wave, waves 16–20 | 7–12 | 3–4 |
  | First ult after | 0–5 s | 13–26 s |

- **Watch for 7.9:** boss waves (10, 15, 20) now take the bot 2.5–4 minutes, because weaker ults, the 12% boss cap and slower charging all add up. Consider raising the boss cap or shortening boss HP when doing the boss-pacing fix.

**7.7 results (done 2026-11-26, Brotato approach):**
- **Coin drop chance per kill** falls 3% per wave from wave 5, with a 40% floor. Bosses always pay. (Brotato: −1.5% per wave, but its waves are shorter.)
- **Prices grow faster after wave 8:** an extra +5% per wave on top of the normal +15%. Legendaries also keep their extra +4% per wave from 7.4.
- **Endless:** income ×0.92 per wave past wave 25, with a 25% floor (Brotato: −20% per wave).
- Settings live in `COIN_ECONOMY` in `src/content/curves.ts`.
- Measured with a bot that never dies and never buys (at the first setting, −3.5% per wave and +8% prices; then eased slightly to −3% and +5%):

  | | Before (R4) | After |
  |---|---|---|
  | Coins per wave, waves 16–20 | 1,750–2,900 | about 300–1,500 (average ~600) |
  | What one late wave buys | 3–6 legendaries | 1–2 rares, or a legendary every ~2 waves |

- The easing makes rares about 18% cheaper and drops about 14% more common by wave 19, closer to the target of about 1 legendary or 2–3 rares per shop. Real players kill less than this bot, so their income will be somewhat lower.

**7.8 results (done 2026-11-26):**
- **Ability cards** now have their own "Ability" rarity, with their own teal look. They're guaranteed while you have an empty ability slot. Once both slots are full, they only appear 20% of the time as swap offers (was 50%, plus 25% per extra slot).
- **Duo cards** have their own "Duo" rarity, so they no longer count as legendaries (they still appear on 25% of eligible level-ups).
- Simulated with 4,000 level-ups per case:

  | | Before | After |
  |---|---|---|
  | Passive cards, common / rare / legendary | 18–34% / 61–74% / 2–14% | 55–64% / 31–41% / 4–5% |
  | Ability cards mid-run (both slots full) | 44–55% | 6.5–9% |
  | Mid-run level-ups showing a legendary | ~30% | 6–12% |

- Rares sit a bit above 25% only because your class's ult perk (a rare) is slipped into 1 level-up in 5 on purpose. Early in a run, ability cards stay common because you need two.

**7.9 results (done 2026-11-26):**
- **First-meeting discount:** the wave-5 boss has 75% HP and 60% damage, and elites up to wave 10 spawn with 75% HP (Brotato does the same for early elites).
- **Rest before every boss:** a boss wave starts by restoring you to full HP, except with the No Rest vow (Slay the Spire puts a rest site before each boss).
- **Breather wave after each boss:** 75% of the usual enemies and 85% of the usual length.
- **Boss tip:** the first boss of a run shows "big attacks glow before they land; dash through them". The end screen already says how to beat what killed you.
- Settings live in `BOSS_PACING` in `src/content/curves.ts`.
- **Measured** (mortal bot, 10 mid-tier classes × 2 runs, waves 1–11):

  | | Wave-5 deaths |
  |---|---|
  | Before Phase 7 (R7a) | about 50% |
  | After 7.1–7.8, before 7.9 | **85%** (weaker early ults, slower charge, smaller shop items) |
  | With discount + breather + tip | 80% |
  | With rest before bosses + 60% first-boss damage | **65%** |

- **What's left is mostly the bot.** It reaches the boss at full HP but circles it at sword range and doesn't learn its patterns. A person backs off and dashes through the glows. Judge the rest from real play (R6 data or your own runs), not by weakening the boss further.
- Not measured yet: whether later boss fights (waves 10/15/20) still feel too long (see the 7.6 note). If they do, raise the ult boss cap (12% → 15%) in `BOSS_CAST_CAPS`.

**7.10 results (done 2026-11-26):**
- **Ult name banner:** now a slim strip near the top for 0.95 s (was a big diagonal band through the middle plus black letterbox bars for about 1.2 s), so the fight and enemy warnings stay visible.
- **Power-up ults** (Berserker, Shinobi, Kagebushi, Kabuki, Hatamoto, Yuki-onna, Yamabushi, Tengu) and Raijin's charged weapon get a pulsing aura in the class color. Empowered hits throw class-colored sparks and show their damage number in that color.
- **No more white blobs:** during ult ticks each enemy shows at most one damage number every 0.3 s and only a soft hit flash. Kunoichi's storm draws fewer, dimmer slashes (every 0.06 s instead of 0.035 s).
- **Warnings stay visible:** while any ult is running, enemies winding up an attack show a "!" (the colorblind-mode marker).
- Checked by screenshots: Kensei, Berserker, Shinobi, Kabuki, Raijin, Tengu, Onmyoji and Kunoichi at 0.4 s and 1.5 s.
- Looks vs. power mostly sorted itself out with 7.5: Tetsubo and Yuki-onna are now in the power band, so their big visuals fit.

**Options to discuss before building** (from R8 round 2 in `docs/BALANCE_RESEARCH.md`):
- **7.6:** a simple minimum time between ults, *or* the Hades approach: charge from damage dealt and taken instead of kills, partly reset between waves, and faster charging as a perk you choose.
- **7.7:** Brotato-style falling drop chance per wave plus prices that outgrow income mid-game, with income in Endless tapering off.
- **7.9 (wave-5 wall):** any mix of these:
  - (a) a "first meeting" discount on the first boss and first elites (Brotato gives first elites 75% HP)
  - (b) a wave-3/4 mini-boss that teaches one boss attack
  - (c) a breather wave after each boss
  - (d) a "how to beat it" tip after dying to a boss
- **7.5:** one shared power budget per ult, tuned by re-running the bot. Overpowered effects get reshaped, not just cut (Hades II approach).
- **New, from the ult visual review:** visual weight matches power, hit areas are clear, and enemy telegraphs stay visible during ults (League of Legends VFX rules).

Changes 7.1–7.4 are mostly formula and data edits (`ultDmg`, `rollShopOffer`, `SHOP_POOL`, `src/content/curves.ts`). Change 7.5 needs the R7 bot playtests and ult visual review first. After each change, re-run the same measurement scripts and compare before and after.

---

## Also shipped (outside the original plan)

- **Soft caps on every power stat** (`SOFT_STATS` in `src/content/curves.ts`): katana, weapon, class and ultimate damage, ult charge rate, coins, regen, heal on kill, proc chances, ability haste, i-frames and per-weapon flat damage all have diminishing returns now, like Dexterity. **Ultimate charges about 35–40% slower** (kills 4 → 2.5, hits taken 12 → 8).

Liquid-glass 幽 intro · infinite-block fix · deflect and ultimate audit (no random deflect failures, deflect blocks everything, shields only block weapon hits, aim re-read after the cutscene, homing Dokkaebi ghosts, ultimate damage scaling) · Kunoichi Phantom Dance rework · Twin Sai and War Fan buff · ultimate perks (8 general + 25 class) · in-game Guide, card hints and one-time tips · mobile and touch support.

---

# Round 2: gaps found in the second research pass

The second pass compared GhostGame with Hades, Dead Cells, Brotato, Vampire Survivors, Halls of Torment, Risk of Rain 2, Slay the Spire and Spelunky.
The core systems are covered; these are what's still missing. Recommended order: **8 → 9 → 10**, then 11, then the rest. Phase 7 (balance) works best after 8–10, because the new end screen also gives better data.

| # | Phase | Inspired by | Why | Size |
|---|-------|-------------|-----|------|
| 8 ✅ | Victory + Endless mode | Brotato, Vampire Survivors | The game never says "you won" | S–M |
| 9 ✅ | Level-up control: Reroll / Banish / Skip | Halls of Torment, Brotato | A bad set of cards can't be fixed | S |
| 10 ✅ | Better end-of-run screen + death recap | Risk of Rain 2, LoL Death Recap | Players can't see *why* a run ended | S–M |
| 11 ✅ | Unlocks across runs (sideways unlocks + small upgrade tree) | Hades Mirror of Night, Dead Cells | Runs don't feed into anything permanent | L |
| 12 ✅ | Shop lock | Brotato | Save up for an item across a reroll or wave | S |
| 13 ✅ | Daily run (seeded by date) | Spelunky, Dead Cells | A shared daily challenge | M |
| 14 ✅ | Controller support | Browser Gamepad API | Chromebook and PC players with controllers | M |
| 15 ✅ | Accessibility round 2 | Dead Cells, Hades | Colorblind safety, UI scale, volume, assist mode | M |
| 16 ✅ | Between-wave choices (wave modifiers + shrines) | Slay the Spire map, Hades rooms | More variety and decisions between waves | M |
| 17 ✅ | Run history + bestiary | Most roguelites | Long-term record and a sense of collection | S |
| 18 ✅ | Polish: DPS meter, pickup radius, haptics | Halls of Torment | Small quality-of-life touches | S |

---

## Phase 8: Victory + Endless mode ✅ done

Shipped: after the first wave-25 Final Boss and its cinematic you get the Victory screen. Any level-ups earned during the cinematic are saved for later. "∞ Continue (Endless)" (Enter) then gives those level-ups and the shop and carries on. Endless shows a badge in the HUD and keeps its own record (`best["cls#endless"]`), and an Endless death shows "THE LEGEND ENDS". Wins are recorded per class and difficulty in Career, class cards show a ✓, and there are 5 win achievements plus a dev "Win now" button.

Changes from the plan: no separate Endless-wave-40 achievement was added, because the existing wave 40 and wave 50 achievements now effectively require Endless.

- **Win condition:** beating the **wave-25 Final Boss** gives a **Victory** screen with a summary and a gold "勝" seal. (`stats.state = "victory"` already exists and is handled by the end screen, but nothing triggers it yet.)
- **Endless option:** the victory screen offers **"Continue (Endless)"**. Waves keep scaling, an "∞ Endless" badge shows in the HUD, and wave records are kept separately (e.g. "Endless best: 34").
- **Records:** a win is stored per class and difficulty, and the class card on the menu shows a ✓ for classes you've beaten.
- **Achievements:** First Victory (Rare), win on Hard (Epic), win on Death (Legendary), win with 10 / all 25 classes (Epic / Mythic), Endless wave 40 (Legendary).
- **Dev panel:** "Win now".

## Phase 9: Level-up control: Reroll / Banish / Skip ✅ done

- **Reroll:** each run starts with **2 rerolls** that redraw all cards. More come from a rare perk or shop item ("Fortune Stick").
- **Banish:** each run starts with **2 banishes**. Banishing a card removes that perk from the pool for the rest of the run (Halls of Torment style).
- **Skip:** take **+15 coins × wave** (scaled) instead of a card. Always available.
- Buttons go under the cards with counts shown, plus keys (R reroll, B banish then pick a card, S skip) and touch-friendly sizes.
- **Balance tracking:** record rerolls, banishes and skips, since banish rates are a strong "this perk is a trap" signal for Phase 7.

## Phase 10: Better end-of-run screen + death recap ✅ done

- **Damage dealt by source:** katana, each weapon, each ability, ultimate, DoTs (burn / bleed / poison), and evolution or duo effects, shown as sorted bars with percentages. This needs `dealDamage` callers to pass a source label.
- **Death recap:** what killed you (already tracked as `lastHitBy`), plus damage taken by source over the last 10 seconds and over the whole run (LoL-style).
- **Highlights:** biggest hit, best multi-kill, elites slain, chests opened, evolutions and duos this run.
- **"Why you lost" line:** e.g. "Most damage came from Archers on wave 14. Try deflect or a shield." Simple rules only.
- **Share:** a "Copy run summary" button that copies plain text to share with friends.

## Phase 11: Unlocks across runs ✅ done

Research warns: unlocks that only add raw power make runs trivial, so keep power growth small and favour **sideways** unlocks.

- **Sideways unlocks (most of it):** new players start with about 8 classes and about 8 weapons. The rest unlock from milestones you'd hit anyway ("reach wave 10 with Samurai", "kill 50 elites", "evolve a weapon"). Locked cards show the requirement. Existing players' saves count toward unlocks automatically, so nothing they have gets taken away.
- **Small upgrade tree ("Shrine of Ancestors"):** a soft currency, **Spirit Embers**, earned per run (wave reached + bosses + achievements) and spent on about 10 nodes with low caps. Examples: +1 starting reroll, +5% starting coins, Spirit Chests also heal 5%, start with a random common item. Each node has an **alternate version** you can switch to (Mirror of Night style) for build variety rather than just more power.
- A **toggle to switch all upgrades off** for purists and for the Daily (Phase 13).
- Guide tab and achievements to match.

## Phase 12: Shop lock ✅ done

- A 🔒 button on each shop card. Locked items **survive rerolls and carry to the next wave at their locked price**.
- Max 2 locks, a touch-friendly button, and a keyboard shortcut (Shift + number).

## Phase 13: Daily run ✅ done

- **Seeded by the date:** everyone gets the same class, weapons, Vows and RNG. Swap `Math.random` for a seeded PRNG during a daily run, so spawns, cards and shop all match.
- **Dead Cells hybrid:** unlimited attempts with your **best score saved**, plus a separate **"first attempt"** record (Spelunky's one-shot tension).
- There's no server on GitHub Pages, so it stays local: a daily history calendar, a streak counter, and a "Copy result" share code.
- Phase 11 upgrades are switched off in the Daily so it's fair.

## Phase 14: Controller support ✅ done

- Gamepad API polling in the game loop, with dead zones (about 0.2) and a "press any button to use controller" prompt.
- **Layout:** left stick moves, right stick aims (aim assist when the stick is idle), RT attack, LT block, A dash, X/Y abilities, RB ultimate, LB swap, D-pad items, Start pause. Remappable in Controls.
- Menus, cards and the shop are navigable with the D-pad and A/B.
- Optional rumble (works in Chrome; skipped where unsupported).

## Phase 15: Accessibility round 2 ✅ done

- **Colorblind-safe mode:** telegraphs and danger zones get patterns or outlines, not just red, and elite affixes show their kanji clearly. Alternative palettes too.
- **UI scale** (90–150%) and a **bigger damage numbers** toggle.
- **Separate volume sliders:** music, sound effects, UI.
- **Assist mode** (Hades god mode style): starts at 20% damage reduction and rises 2% per death, up to 80%. Clearly labelled; runs still count but show an "Assist" tag.
- An option to highlight the player outline (for busy fights).

## Phase 16: Between-wave choices ✅ done

A lighter version of Slay the Spire's map, sized for a wave game:

- After some waves, choose **one of two modifiers for the next wave**, e.g. "Blood Moon: +40% enemies, ×2 coins", "Elite Hunt: elites ×3, extra Spirit Chest", "Calm Night: fewer enemies, no shop discount".
- Rare **shrines** in the arena: walk into one to accept a trade, e.g. "lose 20% max HP → a random legendary perk", "curse: +25% enemy damage this wave → an extra evolution chest".
- Shrines get telegraphs and a Guide entry; balance tracking records which choices people make.

## Phase 17: Run history + bestiary ✅ done

- **Run history** in Career: the last 30 runs (class, difficulty, Vows, wave, win/loss, killer, top damage source, date), each tappable for its Phase 10 summary.
- **Bestiary:** the Guide's Enemies tab shows **kills per enemy type** and unlocks a short lore line after 10 kills. Achievement for filling it.

## Phase 18: Polish ✅ done

- An optional **DPS meter** (top-right, toggle in settings).
- A **pickup radius** ring while collecting orbs (toggle).
- **Haptics** on phones (`navigator.vibrate`) for hits taken, perfect deflects and ultimates (toggle, off with reduced motion).

---

## Things to keep in mind throughout

- Every dangerous attack keeps a visible telegraph.
- New content goes in `src/content/` with a dev-panel hook and at least one achievement.
- Keep the offline single-file build working: no network assets, everything bundled.
- Balance changes go through `enforceStatCaps()` and the soft curves, never one-off clamps.

### Playtest fix: bosses can be fought in melee (2026-11-26)
User report (wave 12): every boss had to be fought from range; standing next to one was death.
Cause: boss attacks all come from its body (radial orb volley, ground-slam ring) with almost no tell (slam wind-up 0.2 s, late-phase volleys ~0.15 s), and only 0.8–1.4 s between attacks, so there was never a safe moment up close.
Fix (Hades / Hollow Knight style "tell → attack → opening"):
- Ground slam wind-up 0.2 s → 0.6 s, with a dashed danger ring that fills in before it lands (dash through it).
- Orb volleys always wind up ≥ 0.6 s, with energy gathering on the boss before each burst.
- After every attack the boss is winded for ~1 s (stands still, "隙 opening" shown), and the gap between attacks is longer (2.0/1.75/1.5 s by phase).
- Kitsune backs off at half speed so melee classes can stay on her.
