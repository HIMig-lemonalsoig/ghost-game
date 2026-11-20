// ─── Touch controls (phones & tablets) ────────────────────────────────────────
// Turns on the first time the screen is touched (and off again if a mouse is
// used). Left half: a floating joystick that appears under your thumb. Right
// side: a big Attack button with Dash, both abilities and the Ultimate around
// it (cooldown rings included); tapping empty space on the right also attacks.
// Attacks, abilities and ultimates aim at the nearest enemy automatically.
import { ABILITY_POOL, getClass } from "./GhostGame";
import type { GhostGame, GameStats } from "./GhostGame";

export interface TouchApi {
  /** Call every HUD frame. */
  update(s: GameStats | null): void;
  readonly active: boolean;
}

const CSS = `
#touch-ui { position: fixed; inset: 0; z-index: 9; display: none; touch-action: none; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; }
body.touch.playing #touch-ui { display: block; }
#touch-ui .joy { position: absolute; width: 124px; height: 124px; margin: -62px 0 0 -62px; border-radius: 50%;
  border: 2px solid rgba(237,227,200,.28); background: rgba(0,0,0,.22); pointer-events: none; }
#touch-ui .joy-knob { position: absolute; left: 50%; top: 50%; width: 56px; height: 56px; margin: -28px 0 0 -28px; border-radius: 50%;
  background: rgba(237,227,200,.35); border: 2px solid rgba(237,227,200,.6); }
#touch-ui .joy-hint { position: absolute; left: calc(16px + env(safe-area-inset-left)); bottom: calc(18px + env(safe-area-inset-bottom)); width: 110px; height: 110px;
  border-radius: 50%; border: 2px dashed rgba(237,227,200,.18); display: grid; place-items: center; color: rgba(237,227,200,.35); font-size: 11px; text-align: center; pointer-events: none; }
#touch-ui .t-cluster { position: absolute; right: calc(14px + env(safe-area-inset-right)); bottom: calc(14px + env(safe-area-inset-bottom)); width: 210px; height: 210px; pointer-events: none; }
#touch-ui .t-btn { position: absolute; pointer-events: auto; border-radius: 50%; display: grid; place-items: center; overflow: hidden;
  background: rgba(14,11,9,.72); border: 2px solid rgba(237,227,200,.32); color: #ede3c8; font-size: 20px; padding: 0;
  font-family: "Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif; touch-action: none; }
#touch-ui .t-btn.down { transform: scale(.92); background: rgba(217,173,91,.35); }
#touch-ui .t-btn small { position: absolute; bottom: 5px; left: 0; right: 0; text-align: center; font: 600 8px system-ui, sans-serif; letter-spacing: .5px; color: rgba(237,227,200,.7); }
#touch-ui .t-btn .cd { position: absolute; inset: 0; border-radius: 50%; pointer-events: none;
  background: conic-gradient(rgba(0,0,0,.66) calc(var(--cd, 0) * 1turn), transparent 0); }
#touch-ui .t-attack { width: 92px; height: 92px; right: 0; bottom: 0; font-size: 34px; border-color: rgba(214,69,63,.8); background: rgba(214,69,63,.28); }
#touch-ui .t-dash { width: 58px; height: 58px; right: 104px; bottom: 0; }
#touch-ui .t-a0 { width: 58px; height: 58px; right: 92px; bottom: 74px; }
#touch-ui .t-a1 { width: 58px; height: 58px; right: 26px; bottom: 112px; }
#touch-ui .t-ult { width: 64px; height: 64px; right: 144px; bottom: 140px; }
#touch-ui .t-ult.ready { border-color: #f0c75e; box-shadow: 0 0 18px rgba(240,199,94,.7); animation: tUlt 1s ease-in-out infinite; }
@keyframes tUlt { 50% { box-shadow: 0 0 4px rgba(240,199,94,.4); } }
#touch-ui .t-block { width: 54px; height: 54px; right: 168px; bottom: 66px; }
#touch-ui .t-btn.off { display: none; }
#touch-ui .rotate-hint { position: absolute; left: 50%; top: 84px; transform: translateX(-50%); padding: 8px 14px; border-radius: 999px;
  background: rgba(10,8,6,.85); border: 1px solid rgba(237,227,200,.25); color: #ede3c8; font: 13px system-ui, sans-serif; display: none; pointer-events: none; white-space: nowrap; }
@media (orientation: portrait) { #touch-ui .rotate-hint { display: block; } }
/* Touch mode tweaks to the regular HUD */
body.touch #hud .tips, body.touch #hud [data-h=abilities], body.touch #hud .ult-cell { display: none; }
body.touch #hud .hud-bottom .cell { pointer-events: auto; cursor: pointer; }
body.touch #hud .hud-bottom { left: 50%; right: auto; transform: translateX(-50%); }
body.touch, body.touch * { -webkit-tap-highlight-color: transparent; }
@media (max-height: 520px) {
  #touch-ui .t-cluster { transform: scale(.82); transform-origin: right bottom; }
  body.touch #hud .slot { width: 40px; height: 40px; }
  body.touch #hud .cell { width: 50px; }
  body.touch #hud .cell-name { font-size: 9px; max-width: 50px; }
  body.touch #hud .hud-tl { top: 8px; left: calc(8px + env(safe-area-inset-left)); width: min(260px, 36vw); }
}
/* Portrait phones: stack the HUD so nothing overlaps the thumb controls. */
@media (orientation: portrait) and (max-width: 600px) {
  body.touch #hud .hud-top { top: calc(8px + env(safe-area-inset-top)); width: 60vw; }
  body.touch #hud .hud-tl { top: calc(92px + env(safe-area-inset-top)); left: 10px; width: 62vw; }
  body.touch #hud .hud-bottom { bottom: calc(226px + env(safe-area-inset-bottom)); transform: translateX(-50%) scale(.8); transform-origin: 50% 100%; }
  #touch-ui .rotate-hint { top: calc(196px + env(safe-area-inset-top)); bottom: auto; font-size: 12px; }
}
@media (prefers-reduced-motion: reduce) { #touch-ui .t-ult.ready { animation: none; } }
`;

export function initTouch(getGame: () => GhostGame | null, setAttack: (held: boolean) => void): TouchApi {
  const style = document.createElement("style");
  style.textContent = CSS;
  document.head.append(style);

  const root = document.createElement("div");
  root.id = "touch-ui";
  root.setAttribute("aria-hidden", "true");
  root.innerHTML = `
    <div class="joy-hint">Move</div>
    <div class="joy" hidden><div class="joy-knob"></div></div>
    <div class="t-cluster">
      <button class="t-btn t-attack" data-t="attack">斬<small>ATTACK</small></button>
      <button class="t-btn t-dash" data-t="dash"><i class="cd"></i>走<small>DASH</small></button>
      <button class="t-btn t-a0" data-t="a0"><i class="cd"></i><span>?</span><small>SKILL</small></button>
      <button class="t-btn t-a1" data-t="a1"><i class="cd"></i><span>?</span><small>SKILL</small></button>
      <button class="t-btn t-ult" data-t="ult"><i class="cd"></i><span>極</span><small>ULT</small></button>
      <button class="t-btn t-block off" data-t="block">盾<small>BLOCK</small></button>
    </div>
    <div class="rotate-hint">↻ Turn your phone sideways for the best view</div>`;
  document.body.append(root);
  const joy = root.querySelector<HTMLElement>(".joy")!;
  const knob = root.querySelector<HTMLElement>(".joy-knob")!;
  const btn = (k: string) => root.querySelector<HTMLElement>(`[data-t=${k}]`)!;

  let active = false;
  const setActive = (on: boolean) => {
    if (on === active) return;
    active = on;
    document.body.classList.toggle("touch", on);
    getGame()?.setInput({ mouseAim: false, aimAssist: on });
  };
  // A real touch turns touch mode on; using a mouse turns it back off.
  window.addEventListener("pointerdown", e => {
    if (e.pointerType === "touch") setActive(true);
    else if (e.pointerType === "mouse") setActive(false);
  }, true);

  // ── Pointer tracking: each finger owns either the joystick, a button, or "attack" ──
  const JOY_R = 60;
  type Grab = { kind: "joy"; ox: number; oy: number } | { kind: "btn"; key: string; el: HTMLElement } | { kind: "attack" };
  const grabs = new Map<number, Grab>();
  let attackFingers = 0;
  const setAttackHeld = () => setAttack(attackFingers > 0);

  const press = (key: string) => {
    const g = getGame();
    if (!g || g.stats.state !== "playing") return;
    const s = g.stats;
    if (key === "dash") g.triggerDash();
    else if (key === "a0" || key === "a1") {
      const id = s.equippedAbilities[key === "a0" ? 0 : 1];
      if (id) { g.aimAtNearest(); g.triggerAbility(id); }
    } else if (key === "ult") { g.aimAtNearest(); g.triggerUlt(); }
  };

  root.addEventListener("pointerdown", e => {
    if (e.pointerType !== "touch" && e.pointerType !== "pen") return;
    e.preventDefault();
    try { root.setPointerCapture?.(e.pointerId); } catch { /* pointer already gone */ }
    const b = (e.target as HTMLElement).closest<HTMLElement>("[data-t]");
    if (b) {
      const key = b.dataset.t!;
      b.classList.add("down");
      grabs.set(e.pointerId, { kind: "btn", key, el: b });
      if (key === "attack") { attackFingers++; setAttackHeld(); getGame()?.triggerAttack(); }
      else if (key === "block") getGame()?.setInput({ blockHeld: true });
      else press(key);
      return;
    }
    if (e.clientX < window.innerWidth * 0.45) {
      grabs.set(e.pointerId, { kind: "joy", ox: e.clientX, oy: e.clientY });
      joy.hidden = false;
      joy.style.left = `${e.clientX}px`;
      joy.style.top = `${e.clientY}px`;
      knob.style.transform = "translate(0,0)";
    } else {
      grabs.set(e.pointerId, { kind: "attack" });
      attackFingers++;
      setAttackHeld();
      getGame()?.triggerAttack();
    }
  });
  root.addEventListener("pointermove", e => {
    const gr = grabs.get(e.pointerId);
    if (!gr || gr.kind !== "joy") return;
    e.preventDefault();
    let dx = e.clientX - gr.ox, dy = e.clientY - gr.oy;
    const d = Math.hypot(dx, dy);
    if (d > JOY_R) { dx *= JOY_R / d; dy *= JOY_R / d; }
    knob.style.transform = `translate(${dx}px, ${dy}px)`;
    const mag = Math.min(1, d / JOY_R);
    const on = mag > 0.18;
    getGame()?.setInput({ joyActive: on, joyDx: on ? (dx / JOY_R) : 0, joyDy: on ? (dy / JOY_R) : 0, mouseAim: false });
  });
  const release = (e: PointerEvent) => {
    const gr = grabs.get(e.pointerId);
    if (!gr) return;
    grabs.delete(e.pointerId);
    if (gr.kind === "joy") {
      joy.hidden = true;
      getGame()?.setInput({ joyActive: false, joyDx: 0, joyDy: 0 });
    } else if (gr.kind === "attack") {
      attackFingers = Math.max(0, attackFingers - 1); setAttackHeld();
    } else {
      gr.el.classList.remove("down");
      if (gr.key === "attack") { attackFingers = Math.max(0, attackFingers - 1); setAttackHeld(); }
      if (gr.key === "block") getGame()?.setInput({ blockHeld: false });
    }
  };
  root.addEventListener("pointerup", release);
  root.addEventListener("pointercancel", release);
  root.addEventListener("contextmenu", e => e.preventDefault());

  // Release everything if the game leaves "playing" (pause, level-up, shop...).
  const releaseAll = () => {
    for (const [, gr] of grabs) if (gr.kind === "btn") gr.el.classList.remove("down");
    grabs.clear();
    attackFingers = 0; setAttack(false);
    joy.hidden = true;
    getGame()?.setInput({ joyActive: false, joyDx: 0, joyDy: 0, blockHeld: false });
  };

  let wasPlaying = false;
  let dashMax = 2.4;
  return {
    get active() { return active; },
    update(s) {
      const g = getGame();
      const playing = !!g && !!s && s.state === "playing";
      document.body.classList.toggle("playing", playing);
      if (wasPlaying && !playing) releaseAll();
      wasPlaying = playing;
      if (!active || !playing || !g || !s) return;
      // Ability buttons: kanji + cooldown ring.
      [0, 1].forEach(i => {
        const el = btn(`a${i}`);
        const id = s.equippedAbilities[i];
        el.classList.toggle("off", !id);
        if (!id) return;
        const info = ABILITY_POOL.find(a => a.id === id);
        const span = el.querySelector("span")!;
        if (span.textContent !== (info?.kanji ?? "技")) span.textContent = info?.kanji ?? "技";
        const cd = s.abilityCd[id] ?? 0, max = s.abilityMax[id] || 1;
        el.style.setProperty("--cd", String(Math.max(0, Math.min(1, cd / max))));
      });
      // Dash cooldown.
      const dc = g.player.dashCooldown;
      if (dc > dashMax) dashMax = dc;
      btn("dash").style.setProperty("--cd", String(dc > 0 ? Math.min(1, dc / dashMax) : 0));
      // Ultimate: charge fills the ring; glows when ready.
      const ult = btn("ult");
      const uk = getClass(s.classId).ultKanji;
      const us = ult.querySelector("span")!;
      if (us.textContent !== uk) us.textContent = uk;
      ult.style.setProperty("--cd", String(s.ultReady ? 0 : 1 - s.ultCharge / Math.max(1, s.ultMax)));
      ult.classList.toggle("ready", s.ultReady && !s.ultActive);
      // Block only when a shield weapon is equipped.
      btn("block").classList.toggle("off", !g.hasBlockWeapon());
    },
  };
}
