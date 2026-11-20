# GhostGame Roadmap: lessons from the roguelite research

This plan is built from what Hades, Vampire Survivors, Brotato, Risk of Rain 2, Slay the Spire, Dead Cells and Halls of Torment do well.
There are 7 phases, in the order they depend on each other. Each phase is roughly one session of work. Every phase ends with the same release steps:
- update the dev panel so the new feature can be tested
- add achievements for it
- check it in the browser
- rebuild `offline/GhostGame.html`
- deploy

| # | Phase | Why it matters | Size |
|---|-------|----------------|------|
| 1 ✅ | Foundations: smooth stat curves, content files, balance tracking | Fixes how the stat caps feel, makes the later phases easier, and collects data | S |
| 2 ✅ | Elite affixes | Lots of fight variety for little work; Phase 3 needs it | S–M |
| 3 ✅ | Weapon evolutions + duo perks | Gives every run a goal to build toward (the biggest gap right now) | M |
| 4 ✅ | New enemy roles: controller + summoner | Fills the two roles that are missing | M |
| 5 | Class signature passives | Makes the 25 classes play differently instead of just having different numbers | M–L |
| 6 | Vows (Hades-style "Heat") | A long-term goal for players who've beaten Death | M |
| 7 | Data-driven balance pass | Tune using real pick rates and wave numbers instead of guesses | S |

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

## Phase 5: Class signature passives

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

## Phase 6: Vows (Hades-style Heat)

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

## Phase 7: Data-driven balance pass

Use the tracking from Phase 1 after some real play (yours and your friends'):

| Problem in the data | Fix |
|---------------------|-----|
| Item or perk picked less than 10% of the time it's offered | rework it, don't just buff the number |
| Item or perk picked more than 60% of the time | check whether it's a must-take |
| Class average wave more than 25% off the middle | adjust that class's signature passive first |
| One enemy causes more than 30% of deaths | check its telegraph and damage |

**Targets:** a decent player on Normal reaches wave 12–18, and boss waves are the most common place to die.

Re-run the headless power-curve bot (`scratchpad/sim.js` pattern) to check that no build is immortal by wave 20.

---

## Things to keep in mind throughout

- Every dangerous attack keeps a visible telegraph.
- New content goes in `src/content/` with a dev-panel hook and at least one achievement.
- Keep the offline single-file build working: no network assets, everything bundled.
- Balance changes go through `enforceStatCaps()` and the soft curves, never one-off clamps.
