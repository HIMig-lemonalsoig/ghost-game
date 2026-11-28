# Held weapons, round 2 (plan, 2026-11-28)

## The problem (after v3.18)
Weapons are a separate PNG drawn at a *guessed* hand spot. They don't follow the hand, nothing
covers the grip, and they don't turn with the arm, so they read as stickers. The Bare_* clips
(skeleton-v3 moves) are stiff and the weapon arc isn't synced to the arm.

## Fix: hand tracking + a hand drawn over the grip
1. **Know where the hand is on every frame.** Remake each Bare clip with *custom skeleton-v3
   poses* (we write `right_hand` / `right_elbow` per frame), so we know the exact hand point and
   forearm angle. Save them as `art/<body>/Bare_<Anim>.hand.json` ([x, y, angle] per frame).
   Fallback for clips we keep: detect the hand by its skin/glove colour near the expected spot.
2. **Grip point per weapon.** Add a `GRIP` table: where the handle is on each weapon PNG (0..1)
   and its resting angle. Draw the weapon so its grip sits exactly on the hand point, rotated
   by the forearm angle (plus the swing).
3. **Fingers over the handle.** Cut a small patch around the hand from the body frame and draw
   it again *after* the weapon, so the fist wraps the grip. In back views, draw the weapon
   *behind* the body.
4. **Sync swings to the pose.** Wind-up frames hold the weapon back, strike frames sweep the
   arc, follow-through settles. Use the frame index for timing instead of a fixed 0.3s.

## New per-weapon motions (PixelLab, 6 bodies)
- **Bow draw:** left arm out holding the bow, right hand pulls the string to the cheek, release.
- **Crossbow / blowgun aim:** two hands up, held to shoulder / mouth.
- **Throw (redo):** slower wind-up, a clear release frame, so kunai/shuriken visibly leave the hand.
- **Two-hand heavy swing:** for ōdachi / axe (both hands on the handle).
- **Shield guard:** forearm raised in front.
Cost estimate: ~5 clips × 6 bodies × ~3 gens ≈ 90–120 gens (838 left).

## Must-haves from the user (2026-11-28)
- **Kunai are not a "brick of three."** The current kunai art is one image of three kunai fanned
  together. Make a **single-kunai** sprite (and single shuriken, single caltrop) for the hand.
  Hold one or two kunai between the fingers (fanned like a real thrower) and throw them one
  at a time, matching the triple throw.
- **Every weapon is actually held.** The fist closes around the grip (hand drawn over the handle);
  no weapon floats next to the hand or sits as a flat PNG.
- **Correct angles per weapon.** Each weapon gets its own rest angle, grip point and swing plane:
  katana-like blades edge forward, axe head forward, spear shaft along the forearm, fan opened
  flat when swung and closed at rest, shield face out, bow upright, crossbow/blowgun level at
  the shoulder/mouth. Check each one in the side, front and back views.
- **Animations fit the weapon.** No shared generic swing for everything: ōdachi/axe = heavy
  two-hand swing, fan/jutte/sai = quick one-hand strikes, spear = thrust, shield = bash,
  kunai/shuriken = flick throw, smoke bomb/caltrops = underhand toss, kusarigama = chain spin
  then throw, bow = draw and release, crossbow = shoulder and fire, blowgun = raise to mouth and puff.
  Review every clip frame by frame before importing and reject anything that looks off.

## Other fixes queued (2026-11-28)
- **Cosmetics fit:** some hats float above the head, some are far too big; some back pieces are
  tiny next to the character. Size each piece to the body and seat hats on the head per view.
- **Dokkaebi ult:** five goblin ghosts that charge across the arena (currently a blue reskin of
  the Kitsune foxfires).
- **Ult cutscenes made unique** for Shinobi, Ronin, Yamabushi, Arashi, Hatamoto, Kunoichi,
  Kagebushi, Raijin, Yuki-onna, Sohei, Kappa, Kabuki, Bakuto, Rikishi and Sumi-e Painter —
  waiting on the user's answers in the ult form.
- **Onmyoji ult visuals** look weak and end before the ult's real effect does (Sohei's visuals
  last the right length but could look better) — also via the ult form.

## Also
- Spawn thrown/shot projectiles from the tracked hand point (visual offset only, hit box unchanged).
- Try PixelLab `edit_animation` on one clip ("holding a kunai in the right hand") to compare
  baked-in weapons against overlays before committing.

## Order for tomorrow
Samurai only first: hand JSON → grip table → hand-over-grip → bow draw + throw redo → check
in preview → then the other 5 bodies.
