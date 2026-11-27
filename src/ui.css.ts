export const UI_CSS = `
:root {
  --ink: #0b0a09;
  --surface: rgba(16, 13, 11, 0.88);
  --surface-2: #1a1613;
  --surface-3: #241f1b;
  --line: rgba(237, 227, 200, 0.14);
  --line-strong: rgba(237, 227, 200, 0.32);
  --bone: #ede3c8;
  --muted: #a89c84;
  --dim: #7a705f;
  --gold: #d9ad5b;
  --crimson: #d6453f;
  --hp: #cf3f3a;
  --block: #d9b45a;
  --xp: #7fb6dc;
  --ult: #f0c75e;
  --common: #b9b1a0;
  --rare: #b197fc;
  --legendary: #f4c842;
  --font-display: "Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", Georgia, "Times New Roman", serif;
  --font-ui: system-ui, -apple-system, "Segoe UI", Roboto, Ubuntu, sans-serif;
  --r: 10px;
  --ease: cubic-bezier(.2,.8,.2,1);
}
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { width: 100%; height: 100%; overflow: hidden; background: var(--ink); color: var(--bone); font-family: var(--font-ui); }
#game-canvas { position: fixed; inset: 0; display: block; cursor: crosshair; }
button { font: inherit; color: inherit; background: none; border: none; cursor: pointer; }
button:focus-visible, [tabindex]:focus-visible { outline: 2px solid var(--gold); outline-offset: 2px; }
.kanji { font-family: var(--font-display); }
.num { font-variant-numeric: tabular-nums; }
kbd {
  display: inline-flex; align-items: center; justify-content: center; min-width: 20px; height: 20px; padding: 0 5px;
  border: 1px solid var(--line-strong); border-bottom-width: 2px; border-radius: 5px;
  font: 600 11px var(--font-ui); color: var(--bone); background: rgba(0,0,0,.35);
}

/* ---------- Buttons ---------- */
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  min-height: 44px; padding: 0 20px; border-radius: 8px; font-weight: 600; font-size: 15px;
  border: 1px solid var(--line-strong); background: var(--surface-2);
  transition: background .15s, border-color .15s, transform .1s;
}
.btn:hover { background: var(--surface-3); border-color: var(--bone); }
.btn:active { transform: scale(.97); }
.btn.primary { background: var(--crimson); border-color: var(--crimson); color: #fff; }
.btn.primary:hover { background: #e2554f; }
.btn.ghost { background: transparent; }
.btn[disabled] { opacity: .4; cursor: not-allowed; transform: none; }

/* ---------- Menu (class select) ---------- */
#menu {
  position: fixed; inset: 0; z-index: 30; overflow-y: auto;
  background:
    radial-gradient(ellipse at 70% 0%, rgba(214,69,63,.16), transparent 55%),
    radial-gradient(ellipse at 10% 100%, rgba(217,173,91,.08), transparent 50%),
    var(--ink);
}
.menu-wrap { max-width: 1240px; margin: 0 auto; padding: 28px 24px 40px; }
.menu-top { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-bottom: 22px; }
.logo { display: flex; align-items: baseline; gap: 14px; }
.logo .kanji { font-size: 44px; color: var(--crimson); line-height: 1; }
.logo h1 { font-family: var(--font-display); font-size: 30px; letter-spacing: 4px; font-weight: 700; }
.logo p { color: var(--muted); font-size: 13px; margin-top: 2px; letter-spacing: .5px; }
.menu-actions { display: flex; gap: 10px; flex-wrap: wrap; }
.menu-body { display: grid; grid-template-columns: 1fr 380px; gap: 22px; align-items: start; }
.class-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px; }
.class-card {
  position: relative; overflow: hidden; text-align: left; padding: 14px 12px 12px; border-radius: var(--r);
  background: var(--surface-2); border: 1px solid var(--line); min-height: 112px;
  transition: border-color .15s, background .15s, transform .15s var(--ease);
}
.class-card:hover { border-color: var(--accent); transform: translateY(-2px); }
.class-card.sel { border-color: var(--accent); background: var(--surface-3); box-shadow: 0 0 0 1px var(--accent) inset, 0 8px 24px -12px var(--accent); }
.class-card .kanji { font-size: 30px; color: var(--accent); line-height: 1.1; }
.class-card .name { font-weight: 700; font-size: 14px; margin-top: 6px; }
.class-card .role { color: var(--muted); font-size: 12px; }
.class-card .best { position: absolute; top: 10px; right: 10px; font-size: 11px; color: var(--gold); }
.class-card .new { position: absolute; top: 10px; right: 10px; font-size: 10px; font-weight: 700; letter-spacing: 1px; color: var(--ink); background: var(--gold); border-radius: 4px; padding: 2px 5px; }
.detail {
  position: sticky; top: 20px; padding: 22px; border-radius: 14px;
  background: var(--surface-2); border: 1px solid var(--line);
}
.detail-head { display: flex; gap: 14px; align-items: center; }
.detail-head .kanji { font-size: 56px; color: var(--accent); line-height: 1; }
.detail h2 { font-family: var(--font-display); font-size: 26px; }
.detail .role { color: var(--muted); font-size: 14px; }
.detail h3 { font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--dim); margin: 18px 0 8px; font-weight: 700; }
.detail ul { list-style: none; display: grid; gap: 6px; }
.detail li { font-size: 14px; line-height: 1.45; padding-left: 14px; position: relative; color: var(--bone); }
.detail li::before { content: ""; position: absolute; left: 0; top: .6em; width: 5px; height: 5px; border-radius: 50%; background: var(--accent); }
.ult-box { padding: 12px; border-radius: 8px; background: rgba(0,0,0,.25); border: 1px solid var(--line); }
.ult-box b { color: var(--ult); }
.ult-box p { font-size: 13px; color: var(--muted); line-height: 1.45; margin-top: 4px; }
.weapons { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.weapon-chip {
  position: relative; display: flex; gap: 10px; align-items: flex-start; text-align: left; padding: 10px; border-radius: 8px; min-height: 52px;
  border: 1px solid var(--line); background: rgba(0,0,0,.2); transition: border-color .15s, background .15s;
}
.weapon-chip:hover { border-color: var(--line-strong); }
.weapon-chip.on { border-color: var(--gold); background: rgba(217,173,91,.12); }
.weapon-chip .kanji { font-size: 22px; color: var(--gold); width: 26px; text-align: center; }
.weapon-chip .wn { font-size: 13px; font-weight: 600; padding-right: 34px; }
.weapon-chip .wd { font-size: 11px; color: var(--muted); line-height: 1.35; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-top: 2px; }
.weapon-chip .wbadge { position: absolute; top: 8px; right: 8px; font-size: 9px; font-weight: 800; letter-spacing: .5px; color: var(--ink); background: var(--gold); border-radius: 4px; padding: 2px 5px; }
.hint { font-size: 12px; color: var(--dim); margin-top: 8px; }
.start-row { display: flex; gap: 10px; margin-top: 20px; }
.start-row .btn.primary { flex: 1; }
.controls-strip { display: flex; flex-wrap: wrap; gap: 8px 18px; margin-top: 26px; color: var(--muted); font-size: 13px; }
.controls-strip span { display: inline-flex; gap: 6px; align-items: center; }
@media (max-width: 900px) {
  .menu-body { grid-template-columns: 1fr; }
  .detail { position: static; }
}
/* Phones (landscape and portrait): compact menu so picking a class is quick. */
@media (max-width: 760px), (max-height: 500px) {
  .menu-wrap { padding: calc(12px + env(safe-area-inset-top)) calc(12px + env(safe-area-inset-right)) 28px calc(12px + env(safe-area-inset-left)); }
  .logo .kanji { font-size: 32px; }
  .logo h1 { font-size: 22px; letter-spacing: 3px; }
  .logo p { font-size: 12px; }
  .menu-actions { gap: 6px; }
  .menu-actions .btn { min-height: 38px; padding: 0 12px; font-size: 13px; }
  .class-grid { grid-template-columns: repeat(auto-fill, minmax(112px, 1fr)); gap: 6px; }
  .class-card { padding: 8px 10px; }
  .class-card .kanji { font-size: 22px; }
  .controls-strip { display: none; }
}

/* ---------- HUD ---------- */
#hud { position: fixed; inset: 0; z-index: 10; pointer-events: none; display: none; }
#hud.show { display: block; }
.hud-tl { position: absolute; top: 16px; left: 16px; width: min(340px, 40vw); display: grid; gap: 6px; }
.hud-class { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--muted); }
.hud-class .kanji { font-size: 20px; color: var(--accent, var(--gold)); }
.hud-class b { color: var(--bone); }
.bar { position: relative; height: 16px; border-radius: 4px; background: rgba(0,0,0,.55); border: 1px solid var(--line); overflow: hidden; }
.bar > i { position: absolute; inset: 0; transform-origin: left; transition: transform .12s linear; }
.bar > span { position: absolute; inset: 0; display: flex; align-items: center; padding: 0 7px; font-size: 11px; font-weight: 700; text-shadow: 0 1px 2px #000; }
.bar.hp { height: 20px; }
.bar.hp > i { background: linear-gradient(90deg, #8f1f1c, var(--hp)); }
.bar.hp > .ghost { background: rgba(255,255,255,.35); transition: transform .5s ease .25s; }
.bar.block { height: 8px; }
.bar.block > i { background: var(--block); }
.bar.xp { height: 6px; }
.bar.xp > i { background: var(--xp); }
.hud-level { font-size: 12px; color: var(--muted); display: flex; justify-content: space-between; }
.hud-top { position: absolute; top: 14px; left: 50%; transform: translateX(-50%); text-align: center; width: min(420px, 50vw); }
.hud-wave { font-family: var(--font-display); font-size: 22px; letter-spacing: 2px; }
.hud-wave.boss { color: var(--crimson); }
.hud-sub { font-size: 12px; color: var(--muted); margin-top: 2px; }
.bar.timer { height: 4px; margin-top: 6px; border: none; }
.bar.timer > i { background: var(--gold); }
.boss-bar { margin-top: 10px; display: none; }
.boss-bar.show { display: block; }
.boss-bar .lbl { font-size: 11px; letter-spacing: 2px; color: var(--crimson); font-weight: 700; margin-bottom: 3px; }
.boss-bar .bar > i { background: linear-gradient(90deg, #7a1412, var(--crimson)); }
.hud-tr { position: absolute; top: 16px; right: 16px; display: flex; align-items: center; gap: 10px; }
.mon { font-size: 18px; font-weight: 700; color: var(--gold); padding: 6px 12px; border-radius: 8px; background: var(--surface); border: 1px solid var(--line); }
.mon .kanji { margin-right: 4px; }
.pause-btn { pointer-events: auto; width: 44px; height: 44px; border-radius: 8px; background: var(--surface); border: 1px solid var(--line); display: grid; place-items: center; }
.pause-btn:hover { border-color: var(--line-strong); }
.toast {
  position: absolute; top: 96px; left: 50%; transform: translate(-50%, -6px); opacity: 0;
  font-family: var(--font-display); font-size: 20px; letter-spacing: 1px; text-shadow: 0 2px 10px #000;
  transition: opacity .2s, transform .2s var(--ease); white-space: nowrap;
}
.toast.show { opacity: 1; transform: translate(-50%, 0); }
.hud-bottom { position: absolute; bottom: 16px; left: 50%; transform: translateX(-50%); display: flex; align-items: flex-end; gap: 14px; }
.group { display: flex; gap: 8px; padding: 8px; border-radius: 12px; background: var(--surface); border: 1px solid var(--line); }
.slot {
  position: relative; width: 56px; height: 56px; border-radius: 8px; background: rgba(0,0,0,.4); border: 1px solid var(--line);
  display: grid; place-items: center; overflow: hidden;
}
.slot .kanji { font-size: 24px; position: relative; z-index: 1; }
.slot kbd { position: absolute; bottom: 3px; right: 3px; z-index: 2; height: 16px; min-width: 16px; font-size: 10px; padding: 0 3px; }
.slot.empty { opacity: .35; }
.slot.empty .kanji { color: var(--dim); }
.slot.ready { border-color: var(--line-strong); }
.slot.active { border-color: var(--gold); box-shadow: 0 0 0 1px var(--gold) inset; }
.slot .ammo { position: absolute; top: 3px; left: 4px; z-index: 2; font-size: 10px; font-weight: 700; color: var(--bone); }
.slot .reload { position: absolute; left: 0; bottom: 0; height: 3px; background: var(--xp); z-index: 2; }
.slot.ult { width: 68px; height: 68px; border-radius: 50%; }
.slot.ult .fill { position: absolute; left: 0; right: 0; bottom: 0; background: linear-gradient(0deg, rgba(240,199,94,.55), rgba(240,199,94,.15)); }
.slot.ult.ready { border-color: var(--ult); box-shadow: 0 0 18px rgba(240,199,94,.55); animation: pulse 1.2s ease-in-out infinite; }
.slot.ult.ready .kanji { color: var(--ult); }
@keyframes pulse { 50% { box-shadow: 0 0 28px rgba(240,199,94,.85); } }
/* Toolbar cells: icon + readable name, cooldown greys out then refills in colour */
.cell { display: flex; flex-direction: column; align-items: center; gap: 5px; width: 76px; }
.cell.tab-hint { width: 44px; }
.slot.mini { width: 40px; height: 40px; margin-top: 8px; }
.cell-name {
  font-size: 11px; font-weight: 700; line-height: 1.2; text-align: center; color: var(--bone);
  text-shadow: 0 1px 3px #000; min-height: 27px; max-width: 76px;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.cell-name.dim { color: var(--dim); font-weight: 500; }
.slot { --h: 40; --p: 1; transition: border-color .25s, box-shadow .25s, background .25s; }
.slot .refill {
  position: absolute; left: 0; right: 0; bottom: 0; height: calc(var(--p) * 100%); z-index: 0; opacity: 0;
  background: linear-gradient(0deg, hsl(var(--h) 80% 42% / .65), hsl(var(--h) 80% 55% / .2));
  border-top: 2px solid hsl(var(--h) 90% 70% / .9);
}
.slot .k-base { color: hsl(var(--h) 85% 74%); transition: color .3s; }
.slot .k-fill {
  position: absolute; inset: 0; display: grid; place-items: center; z-index: 1; opacity: 0;
  color: hsl(var(--h) 85% 74%); clip-path: inset(calc((1 - var(--p)) * 100%) 0 0 0);
}
.slot.ready:not(.empty) { border-color: hsl(var(--h) 70% 55%); box-shadow: 0 0 14px -2px hsl(var(--h) 85% 55% / .55), inset 0 0 12px hsl(var(--h) 80% 50% / .18); }
.slot.cooling { background: rgba(0,0,0,.7); border-color: rgba(255,255,255,.07); }
.slot.cooling .k-base { color: #3d3832; }
.slot.cooling .k-fill, .slot.cooling .refill { opacity: 1; }
.slot .cdn {
  position: absolute; z-index: 3; left: 50%; top: 50%; transform: translate(-50%, -50%);
  font-size: 19px; font-weight: 800; color: #fff; padding: 0 6px; border-radius: 6px; line-height: 1.25;
  background: rgba(0,0,0,.62); text-shadow: 0 1px 2px #000; pointer-events: none;
}
.slot .cdn:empty { display: none; }
.slot .ammo:empty { display: none; }
.slot.empty .k-base { color: var(--dim); }
.slot.pop { animation: readyPop .65s cubic-bezier(.2,.8,.2,1); }
@keyframes readyPop {
  0% { transform: scale(1.2); box-shadow: 0 0 0 3px hsl(var(--h) 95% 70%), 0 0 30px hsl(var(--h) 95% 60%); }
  100% { transform: scale(1); }
}
.slot.ult .cdn { font-size: 13px; }
.slot.ult.cooling .fill { opacity: .5; }
.cell.held, .cell.stowed { position: relative; transition: opacity .2s, transform .2s; }
.cell.held .slot.slot { border: 2px solid var(--gold); box-shadow: 0 0 0 1px rgba(0,0,0,.6), 0 0 18px rgba(217,173,91,.55); }
.cell.held::before {
  content: "IN HAND"; position: absolute; top: -17px; left: 50%; transform: translateX(-50%); white-space: nowrap;
  font-size: 9px; font-weight: 800; letter-spacing: 1px; color: var(--ink); background: var(--gold); border-radius: 4px; padding: 1px 5px;
}
.cell.held .cell-name { color: var(--gold); }
.cell.stowed { opacity: .45; transform: scale(.92); }
/* Vows */
.vow-btn { display: flex; align-items: center; gap: 12px; width: 100%; margin-top: 10px; padding: 10px 14px; border-radius: 12px; text-align: left;
  background: var(--surface-2); border: 1px solid var(--line); color: var(--bone); cursor: pointer; transition: border-color .15s, background .15s; }
.vow-btn:hover { border-color: var(--line-strong); background: var(--surface-3); }
.vow-btn.on { border-color: color-mix(in srgb, var(--crimson) 60%, transparent); background: linear-gradient(135deg, rgba(214,69,63,.16), rgba(0,0,0,.2)); }
.vow-btn .kanji { font-size: 24px; color: var(--crimson); }
.vow-btn b { display: block; font-size: 14px; }
.vow-btn i { font-style: normal; font-size: 12px; color: var(--muted); }
.vow-btn .vow-score { margin-left: auto; font-size: 22px; font-weight: 700; color: var(--gold); }
.vow-locked .kanji { color: var(--dim); }
.vow-panel { max-width: 760px; }
.class-card.locked { filter: grayscale(.85) brightness(.7); }
.class-card.locked.sel { filter: grayscale(.5) brightness(.85); }
.class-card .best.lock { background: rgba(0,0,0,.45); }
.weapon-chip.locked { opacity: .55; cursor: not-allowed; }
.weapon-chip.locked .kanji { font-size: 18px; }
.lock-req { color: var(--gold); font-weight: 600; }
.lock-banner { margin: 10px 0 4px; padding: 9px 12px; border-radius: 10px; border: 1px solid color-mix(in srgb, var(--gold) 45%, transparent); background: rgba(232,183,90,.08); font-size: 13px; }
.embers-earned { margin-top: 14px; font-size: 14px; color: var(--gold); }
.embers-earned .kanji { font-size: 18px; }
.sh-off { display: flex; align-items: center; gap: 8px; justify-content: center; font-size: 13px; color: var(--muted); margin: 6px 0 10px; cursor: pointer; }
.sh-off input { width: 18px; height: 18px; accent-color: var(--gold); }
.sh-disabled { opacity: .45; }
.sh-row { display: grid; grid-template-columns: 40px 1fr auto; gap: 12px; align-items: center; padding: 10px 12px; border-radius: 12px; border: 1px solid var(--line); background: var(--surface-2); }
.sh-row.on { border-color: color-mix(in srgb, var(--gold) 45%, transparent); }
.sh-row > .kanji { font-size: 26px; color: var(--gold); text-align: center; }
.sh-name { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
.sh-vers { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.sh-ver { text-align: left; padding: 7px 9px; border-radius: 9px; border: 1px solid var(--line); background: rgba(0,0,0,.18); color: var(--muted); cursor: pointer; font: inherit; }
.sh-ver b { display: block; font-size: 12.5px; color: var(--bone); }
.sh-ver span { font-size: 11.5px; }
.sh-ver.on { border-color: var(--gold); background: rgba(232,183,90,.1); color: var(--bone); cursor: default; }
.sh-ver:not(.on):hover { border-color: var(--line-strong); }
.sh-buy { white-space: nowrap; min-height: 44px; }
/* Patch notes */
.pn-panel { max-width: 780px; }
.pn-filters { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; margin: 14px 0 12px; }
.pn-filter { min-height: 36px; padding: 0 12px; border-radius: 999px; border: 1px solid var(--line); background: rgba(0,0,0,.25); color: var(--muted); font: inherit; font-size: 13px; cursor: pointer; }
.pn-filter:hover { border-color: var(--line-strong); color: var(--bone); }
.pn-filter.on { border-color: var(--gold); color: var(--bone); background: rgba(217,173,91,.12); }
.pn-list { display: grid; gap: 12px; max-height: 58vh; overflow-y: auto; padding-right: 4px; }
.pn-entry { position: relative; padding: 14px 16px; border-radius: 12px; background: var(--lacquer, var(--surface-2)); border: 1px solid rgba(237,227,200,.1); }
.pn-entry.latest { border-color: rgba(217,173,91,.45); box-shadow: 0 0 0 1px rgba(217,173,91,.15), 0 14px 30px -18px rgba(217,173,91,.6); }
.pn-entry header { display: grid; grid-template-columns: 44px 1fr; gap: 12px; align-items: center; margin-bottom: 10px; }
.pn-k { font-size: 34px; color: var(--gold); text-align: center; text-shadow: 0 0 16px rgba(217,173,91,.35); }
.pn-ver { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 700; letter-spacing: 1px; color: var(--gold); }
.pn-latest { font-size: 10px; letter-spacing: 1.2px; text-transform: uppercase; color: var(--ink); background: var(--gold); border-radius: 4px; padding: 1px 6px; }
.pn-date { margin-left: auto; color: var(--dim); font-weight: 500; letter-spacing: 0; }
.pn-entry h3 { font-family: var(--font-display); font-size: 20px; margin-top: 2px; }
.pn-entry header p { font-size: 13px; color: var(--muted); margin-top: 2px; }
.pn-entry ul { list-style: none; display: grid; gap: 7px; }
.pn-entry li { display: grid; grid-template-columns: 82px 1fr; gap: 10px; align-items: start; font-size: 13.5px; line-height: 1.45; }
.pn-tag { display: inline-flex; justify-content: center; font-size: 10.5px; font-weight: 800; letter-spacing: .8px; text-transform: uppercase; border-radius: 6px; padding: 3px 6px; border: 1px solid currentColor; }
.pn-new .pn-tag, .pn-filter.pn-new.on { color: hsl(150 60% 62%); }
.pn-buff .pn-tag, .pn-filter.pn-buff.on { color: hsl(195 75% 64%); }
.pn-nerf .pn-tag, .pn-filter.pn-nerf.on { color: hsl(2 80% 66%); }
.pn-change .pn-tag, .pn-filter.pn-change.on { color: var(--gold); }
.pn-fix .pn-tag, .pn-filter.pn-fix.on { color: hsl(265 65% 74%); }
@media (max-width: 640px) { .pn-entry li { grid-template-columns: 1fr; gap: 3px; } .pn-tag { justify-self: start; } }
/* Wardrobe */
.wd-panel { max-width: 760px; }
.wd-top { display: grid; grid-template-columns: 180px 1fr; gap: 18px; align-items: center; margin: 8px 0 12px; }
.wd-prev { width: 180px; height: 180px; border-radius: 16px; border: 1px solid var(--line); background: radial-gradient(circle at 50% 45%, rgba(232,183,90,.14), rgba(0,0,0,.25) 70%), var(--surface-2); }
.wd-side .vow-total { margin: 0 0 4px; }
.wd-owned { font-size: 12.5px; margin-bottom: 10px; }
.wd-tabs { display: flex; flex-wrap: wrap; gap: 6px; }
.wd-tab { padding: 8px 12px; min-height: 40px; border-radius: 10px; border: 1px solid var(--line); background: rgba(0,0,0,.18); color: var(--muted); cursor: pointer; font: inherit; font-size: 13px; }
.wd-tab .kanji { color: var(--gold); }
.wd-tab.on { border-color: var(--gold); color: var(--bone); background: rgba(232,183,90,.1); }
.wd-tab:not(.on):hover { border-color: var(--line-strong); color: var(--bone); }
.wd-list { display: grid; gap: 8px; max-height: 46vh; overflow-y: auto; padding-right: 4px; }
.wd-item { display: grid; grid-template-columns: 40px 1fr auto; gap: 12px; align-items: center; padding: 10px 12px; border-radius: 12px; border: 1px solid var(--line); background: var(--surface-2); cursor: pointer; transition: border-color .15s; }
.wd-item:hover, .wd-item:focus-visible { border-color: var(--line-strong); outline: none; }
.wd-item.on { border-color: color-mix(in srgb, var(--gold) 55%, transparent); }
.wd-item.locked .wd-k { opacity: .45; }
.wd-k { font-size: 24px; color: var(--gold); text-align: center; }
.wd-t b { display: block; font-size: 14px; color: var(--bone); }
.wd-t span { font-size: 12.5px; color: var(--muted); }
.wd-btn { white-space: nowrap; min-height: 40px; }
.wd-state { font-size: 12px; white-space: nowrap; }
.wd-state.on { color: var(--gold); font-weight: 600; }
.wd-state.lock { color: var(--muted); white-space: normal; max-width: 220px; text-align: right; }
@media (max-width: 640px) { .wd-top { grid-template-columns: 1fr; justify-items: center; } .wd-item { grid-template-columns: 1fr; } .wd-k { display: none; } .wd-state.lock { text-align: left; max-width: none; } }
@media (max-width: 640px) { .sh-row { grid-template-columns: 1fr; } .sh-row > .kanji { display: none; } .sh-vers { grid-template-columns: 1fr; } }
.vow-total { display: flex; align-items: baseline; gap: 8px; justify-content: center; margin: 14px 0 6px; flex-wrap: wrap; }
.vow-total b { font-size: 34px; color: var(--crimson); font-family: var(--font-display); }
.vow-total .dim, .vow-row .dim { color: var(--dim); }
.vow-best { margin-left: 12px; font-size: 12px; color: var(--muted); }
.vow-list { display: grid; gap: 6px; margin-top: 10px; }
.vow-row { display: grid; grid-template-columns: 36px 1fr auto; gap: 12px; align-items: center; padding: 10px 12px; border-radius: 10px;
  background: var(--surface-2); border: 1px solid var(--line); }
.vow-row.on { border-color: color-mix(in srgb, var(--crimson) 50%, transparent); }
.vow-row > .kanji { font-size: 22px; color: var(--dim); text-align: center; }
.vow-row.on > .kanji { color: var(--crimson); }
.vow-t b { font-size: 14px; color: var(--bone); }
.vow-t p { font-size: 13px; color: var(--muted); margin-top: 2px; }
.vow-pts { font-size: 11px; color: var(--dim); margin-left: 6px; }
.vow-ctrl { display: flex; align-items: center; gap: 8px; }
.vow-step { width: 34px; height: 34px; border-radius: 8px; border: 1px solid var(--line-strong); background: var(--surface-3); color: var(--bone);
  font-size: 18px; cursor: pointer; }
.vow-step:hover:not([disabled]) { border-color: var(--bone); }
.vow-step[disabled] { opacity: .35; cursor: not-allowed; }
.vow-pips { display: flex; gap: 4px; min-width: 42px; justify-content: center; }
.vow-pips i { width: 10px; height: 10px; border-radius: 3px; background: rgba(255,255,255,.12); }
.vow-pips i.on { background: var(--crimson); box-shadow: 0 0 8px rgba(214,69,63,.6); }

/* Class signature passive */
.sig-box { display: flex; gap: 12px; align-items: flex-start; margin: 12px 0 4px; padding: 12px 14px; border-radius: 12px;
  background: linear-gradient(135deg, color-mix(in srgb, var(--accent) 18%, transparent), rgba(0,0,0,.25));
  border: 1px solid color-mix(in srgb, var(--accent) 55%, transparent); }
.sig-box .kanji { font-size: 28px; color: var(--accent); line-height: 1; }
.sig-box b { font-size: 13px; letter-spacing: .5px; color: var(--bone); }
.sig-box p { font-size: 13px; color: var(--muted); line-height: 1.45; margin-top: 3px; }
/* Weapon evolutions */
.slot.evo-ready { animation: evoReady 1.2s ease-in-out infinite; }
@keyframes evoReady { 50% { box-shadow: 0 0 0 2px hsl(45 95% 65%), 0 0 22px hsl(45 95% 60%); } }
.slot.evolved { background: linear-gradient(160deg, rgba(240,199,94,.22), rgba(0,0,0,.4)); border-color: hsl(45 85% 60%); }
.slot.evolved .k-base, .slot.evolved .k-fill { color: hsl(45 95% 70%); }
.evo-list { display: grid; gap: 8px; }
.evo-row { display: grid; grid-template-columns: 28px 1fr; column-gap: 8px; font-size: 13px; color: var(--muted); }
.evo-row .kanji { grid-row: span 4; font-size: 22px; color: var(--dim); }
.evo-row b { color: var(--bone); }
.evo-row i { font-style: normal; color: var(--dim); font-size: 12px; }
.evo-row.ready .kanji, .evo-row.done .kanji { color: var(--ult); }
.evo-row.ready b { color: var(--ult); }
.evo-row.done b { color: var(--ult); }
/* Duo perk card */
.card.duo { border-image: linear-gradient(135deg, var(--legendary), var(--rare)) 1; background: linear-gradient(160deg, rgba(244,200,66,.10), rgba(177,151,252,.12)), var(--surface-2); }
.card .tag.ult-tag { background: var(--ult); color: var(--ink); }
.card .duo-tag { background: linear-gradient(90deg, var(--legendary), var(--rare)); }
@media (prefers-reduced-motion: reduce) { .slot.evo-ready { animation: none; box-shadow: 0 0 0 2px hsl(45 95% 65%); } }
.buffs { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 2px; }
.buff {
  display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 600; padding: 2px 7px 2px 4px;
  border-radius: 999px; background: rgba(0,0,0,.6); border: 1px solid var(--c); color: var(--bone);
}
.buff .kanji { color: var(--c); font-size: 13px; }
.buff i { font-style: normal; color: var(--muted); }
.itemcard {
  position: absolute; right: 16px; bottom: 120px; max-width: 300px; display: flex; gap: 10px; align-items: center;
  padding: 10px 14px 10px 10px; border-radius: 12px; background: var(--surface); border: 1px solid var(--c, var(--line));
  box-shadow: 0 0 24px -8px var(--c); opacity: 0; transform: translateY(8px); transition: opacity .25s, transform .25s var(--ease);
}
.itemcard.show { opacity: 1; transform: translateY(0); }
.itemcard .kanji { font-size: 30px; color: var(--c); line-height: 1; }
.itemcard b { font-size: 14px; }
.itemcard p { font-size: 12.5px; color: var(--bone); opacity: .85; margin-top: 2px; line-height: 1.35; }
#overlay.top { z-index: 40; }
.binds { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px 20px; }
.bind-group h5 { font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--dim); margin-bottom: 6px; }
.bind-row { display: flex; justify-content: space-between; align-items: center; gap: 10px; min-height: 36px; font-size: 13px; color: var(--muted); }
.keycap {
  min-width: 64px; min-height: 30px; padding: 0 10px; border-radius: 6px; font-weight: 700; font-size: 12px; color: var(--bone);
  background: rgba(0,0,0,.4); border: 1px solid var(--line-strong); border-bottom-width: 3px; transition: border-color .15s, background .15s;
}
.keycap:hover { border-color: var(--gold); }
.keycap.listening { border-color: var(--gold); background: rgba(217,173,91,.18); color: var(--gold); animation: listen 1s ease-in-out infinite; }
@keyframes listen { 50% { box-shadow: 0 0 0 3px rgba(217,173,91,.35); } }
.diff-row { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; }
.diff {
  display: flex; flex-direction: column; align-items: center; gap: 2px; min-height: 52px; padding: 6px 2px; border-radius: 8px;
  font-size: 12px; font-weight: 700; color: var(--muted); background: rgba(0,0,0,.25); border: 1px solid var(--line);
  transition: border-color .15s, background .15s, color .15s;
}
.diff .kanji { font-size: 18px; color: var(--c); }
.diff:hover { border-color: var(--c); color: var(--bone); }
.diff.on { border-color: var(--c); color: var(--bone); background: color-mix(in srgb, var(--c) 16%, transparent); box-shadow: 0 0 14px -6px var(--c); }
.diff-tag { display: inline-block; margin-top: 2px; font-size: 10px; font-weight: 800; letter-spacing: 1.5px; color: var(--c); }
.diff-tag .kanji { font-size: 12px; }
.slot-label { position: absolute; top: -16px; left: 0; right: 0; text-align: center; font-size: 10px; color: var(--muted); white-space: nowrap; }
.tips {
  position: absolute; bottom: 132px; left: 50%; transform: translateX(-50%);
  display: flex; flex-wrap: wrap; justify-content: center; gap: 6px 16px; max-width: 760px;
  padding: 10px 16px; border-radius: 10px; background: var(--surface); border: 1px solid var(--line);
  font-size: 12px; color: var(--muted); transition: opacity .6s;
}
.tips span { display: inline-flex; gap: 5px; align-items: center; }
.tips.hide { opacity: 0; }
.lowhp { position: absolute; inset: 0; box-shadow: inset 0 0 120px rgba(200,20,20,.55); opacity: 0; transition: opacity .3s; }
.lowhp.show { opacity: 1; animation: throb 1s ease-in-out infinite; }
@keyframes throb { 50% { opacity: .55; } }
@media (max-width: 760px) {
  .slot { width: 46px; height: 46px; } .slot.ult { width: 56px; height: 56px; }
  .cell { width: 60px; } .cell-name { font-size: 10px; max-width: 60px; }
  .tips { display: none; }
}

/* ---------- Modal overlays ---------- */
#overlay {
  position: fixed; inset: 0; z-index: 20; display: none; align-items: center; justify-content: center;
  padding: 24px; overflow-y: auto; background: rgba(5,4,3,.78); backdrop-filter: blur(3px);
}
#overlay.show { display: flex; animation: fade .18s ease-out; }
/* Centre panels with auto margins (not align-items) so a panel taller than the
   screen can still scroll all the way to its top. */
#overlay { align-items: flex-start; }
#overlay > * { margin-block: auto; }
@keyframes fade { from { opacity: 0; } }
.panel { width: min(960px, 100%); text-align: center; }
.panel-title { font-family: var(--font-display); font-size: 30px; letter-spacing: 3px; }
.panel-sub { color: var(--muted); font-size: 14px; margin-top: 6px; }
.cards { display: flex; flex-wrap: wrap; justify-content: center; gap: 14px; margin-top: 24px; }
.card {
  position: relative; width: 230px; padding: 20px 16px 16px; border-radius: 12px; text-align: center;
  background: var(--surface-2); border: 1px solid var(--rc, var(--line)); transition: transform .15s var(--ease), background .15s;
  animation: rise .25s var(--ease) both;
}
.card:nth-child(2) { animation-delay: .04s; } .card:nth-child(3) { animation-delay: .08s; } .card:nth-child(4) { animation-delay: .12s; }
@keyframes rise { from { opacity: 0; transform: translateY(10px); } }
.card:hover:not([disabled]) { transform: translateY(-3px); background: var(--surface-3); }
.card .kanji { font-size: 38px; color: var(--rc); }
.card .cn { font-weight: 700; font-size: 16px; margin-top: 6px; }
.card .rar { font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--rc); margin-top: 3px; font-weight: 700; }
.card .cd { font-size: 13px; color: var(--muted); line-height: 1.45; margin-top: 10px; }
.card .key { position: absolute; top: 10px; left: 10px; }
.card .tag { position: absolute; top: 10px; right: 10px; font-size: 9px; font-weight: 800; letter-spacing: 1px; padding: 2px 5px; border-radius: 4px; background: var(--xp); color: var(--ink); }
.card .preview { margin-top: 8px; font-size: 12px; font-weight: 700; color: var(--xp); background: rgba(0,0,0,.3); border-radius: 6px; padding: 4px 6px; }
.card .price { margin-top: 12px; font-size: 16px; font-weight: 700; color: var(--gold); }
.card.bought { opacity: .45; }
.card.bought .price { color: var(--muted); }
.shop-slot { position: relative; display: flex; }
#dps-meter { position: fixed; top: 64px; right: 14px; z-index: 6; pointer-events: none; padding: 6px 10px; border-radius: 10px; text-align: right;
  background: rgba(10,9,8,.6); border: 1px solid var(--line); font-size: 11px; color: var(--dim); letter-spacing: 1px; min-width: 84px; }
#dps-meter b { display: block; font-size: 20px; color: var(--gold); letter-spacing: 0; }
#dps-meter i { display: block; font-style: normal; font-size: 10.5px; color: var(--muted); letter-spacing: 0; max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
body:not(.playing) #dps-meter { display: none; }
body.minimap-on #dps-meter { top: 232px; }
@media (max-width: 760px) { body.minimap-on #dps-meter { top: 190px; } }
.omen-pick { margin-top: 18px; }
.omen-row { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-top: 8px; }
.omen { display: flex; align-items: center; gap: 12px; text-align: left; width: 300px; padding: 12px 14px; border-radius: 12px; cursor: pointer; font: inherit; color: var(--bone);
  background: linear-gradient(135deg, hsla(var(--oh), 60%, 30%, .25), rgba(0,0,0,.25)); border: 1px solid hsla(var(--oh), 70%, 60%, .6); }
.omen:hover, .omen:focus-visible { border-color: hsl(var(--oh), 80%, 70%); transform: translateY(-2px); }
.omen .kanji { font-size: 30px; color: hsl(var(--oh), 85%, 70%); }
.omen b { display: block; font-size: 15px; }
.omen i { font-style: normal; font-size: 12.5px; color: var(--muted); }
.omen kbd { margin-left: auto; font-size: 10px; white-space: nowrap; }
.a11y-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 14px; }
@media (max-width: 720px) { .a11y-grid { grid-template-columns: 1fr; } }
.a11y-slider { display: grid; grid-template-columns: 8.5em 1fr 3.2em; gap: 10px; align-items: center; margin: 10px 0; font-size: 13.5px; }
.a11y-slider input { width: 100%; accent-color: var(--gold); min-height: 28px; }
.a11y-slider b { text-align: right; font-size: 13px; }
.a11y-seg > span { display: block; font-size: 13.5px; margin-bottom: 6px; }
.a11y-seg > div { display: flex; gap: 6px; flex-wrap: wrap; }
.a11y-sub { display: block; font-style: normal; font-size: 11.5px; color: var(--dim); margin-top: 2px; }
.assist-tag { color: hsl(195 80% 70%); border: 1px solid currentColor; border-radius: 5px; padding: 0 5px; font-size: 11px; letter-spacing: 1px; }
body.pad :is(button, [tabindex], input):focus { outline: 3px solid var(--gold); outline-offset: 3px; }
body.pad.playing { cursor: none; }
.lock-btn { position: absolute; top: 6px; right: 6px; z-index: 2; width: 40px; height: 40px; border-radius: 10px; border: 1px solid var(--line);
  background: rgba(0,0,0,.35); font-size: 17px; cursor: pointer; opacity: .65; transition: opacity .15s, border-color .15s, background .15s; }
.lock-btn:hover, .lock-btn:focus-visible { opacity: 1; border-color: var(--line-strong); }
.lock-btn.on { opacity: 1; border-color: var(--gold); background: rgba(232,183,90,.18); }
.card.locked-item { outline: 2px solid var(--gold); outline-offset: 3px; }
.lock-btn:not(.on) { filter: grayscale(1); opacity: .45; }
.locked-tag { font-size: 10px; letter-spacing: 1.4px; color: var(--gold); border: 1px solid var(--gold); border-radius: 5px; padding: 1px 5px; vertical-align: middle; margin-left: 4px; }
.shop-lock-hint { margin-top: 14px; font-size: 12px; }
.card[disabled] .price { color: var(--crimson); }
.r-common { --rc: var(--common); } .r-rare { --rc: var(--rare); } .r-legendary { --rc: var(--legendary); }
.r-ability { --rc: hsl(175 60% 58%); } .r-duo { --rc: var(--legendary); }
.panel-actions { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; margin-top: 24px; }
.lvl-actions { margin-top: 16px; }
.lvl-actions .btn { min-height: 44px; }
.btn.danger { border-color: hsl(0 75% 55%); color: hsl(0 85% 72%); box-shadow: 0 0 18px hsl(0 80% 50% / .35); }
.card.banishing { outline: 2px dashed hsl(0 80% 58%); outline-offset: 3px; }
.card.banishing:hover { box-shadow: 0 0 28px hsl(0 85% 50% / .55); filter: saturate(.6); }
.pause-grid { display: grid; grid-template-columns: 260px 1fr; gap: 18px; margin-top: 20px; text-align: left; }
.pause-menu { display: grid; gap: 8px; align-content: start; }
.pause-menu .btn { justify-content: flex-start; }
.pane { padding: 16px; border-radius: 12px; background: var(--surface-2); border: 1px solid var(--line); }
.pane h4 { font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--dim); margin-bottom: 10px; }
.stats { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 8px 16px; font-size: 14px; }
.stats div { display: flex; justify-content: space-between; border-bottom: 1px dashed var(--line); padding-bottom: 4px; }
.stats b { color: var(--gold); }
.stats b i { font-style: normal; font-size: 9px; letter-spacing: 1px; padding: 1px 4px; border-radius: 4px; vertical-align: 2px; margin-left: 3px; }
.stats b i.maxed { background: var(--gold); color: var(--ink); }
.stats b i.soft { border: 1px solid var(--line-strong); color: var(--muted); }
.perk-list { display: flex; flex-wrap: wrap; gap: 6px; }
.perk-pill { font-size: 12px; padding: 4px 8px; border-radius: 999px; background: rgba(0,0,0,.3); border: 1px solid var(--line); }
.perk-pill .kanji { color: var(--gold); margin-right: 4px; }
.toggle { display: flex; align-items: center; justify-content: space-between; gap: 12px; min-height: 44px; font-size: 14px; }
.switch { width: 44px; height: 24px; border-radius: 999px; background: var(--surface-3); border: 1px solid var(--line-strong); position: relative; transition: background .15s; }
.switch::after { content: ""; position: absolute; top: 2px; left: 2px; width: 18px; height: 18px; border-radius: 50%; background: var(--muted); transition: transform .15s var(--ease), background .15s; }
.switch.on { background: rgba(214,69,63,.45); border-color: var(--crimson); }
.switch.on::after { transform: translateX(20px); background: var(--bone); }
.ctrl-list { display: grid; grid-template-columns: auto 1fr; gap: 8px 12px; font-size: 13px; color: var(--muted); align-items: center; }
.ctrl-list span:nth-child(odd) { display: flex; gap: 4px; }
.end-kanji { font-family: var(--font-display); font-size: 96px; line-height: 1; }
.end-stats { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-top: 22px; }
.end-stat { min-width: 120px; padding: 12px 16px; border-radius: 10px; background: var(--surface-2); border: 1px solid var(--line); }
.end-stat b { display: block; font-size: 26px; color: var(--bone); }
.end-stat span { font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--dim); }
.recap { margin: 18px auto 0; max-width: 860px; text-align: left; }
.rc-why { padding: 10px 14px; border-radius: 10px; border: 1px solid hsl(355 60% 45% / .5); background: hsl(355 60% 30% / .18); font-size: 13.5px; line-height: 1.5; color: var(--bone); }
.rc-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px; justify-content: center; }
.rc-chip { font-size: 12px; padding: 5px 10px; border-radius: 999px; background: var(--surface-2); border: 1px solid var(--line); color: var(--dim); }
.rc-chip b { color: var(--bone); font-weight: 600; margin-left: 3px; }
.rc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 12px; }
@media (max-width: 720px) { .rc-grid { grid-template-columns: 1fr; } }
.rc-box { padding: 12px 14px; border-radius: 10px; background: var(--surface-2); border: 1px solid var(--line); min-width: 0; }
.rc-box h4 { margin: 0 0 8px; font-size: 12px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--dim); display: flex; justify-content: space-between; gap: 8px; }
.rc-box h4 .num { color: var(--bone); letter-spacing: 0; }
.rc-sub { font-size: 11px; color: var(--dim); margin: 8px 0 4px; }
.rc-bars { display: grid; gap: 5px; }
.rc-row { display: grid; grid-template-columns: minmax(0, 9.5em) 1fr auto; align-items: center; gap: 8px; font-size: 12.5px; }
.rc-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--bone); }
.rc-track { height: 8px; border-radius: 4px; background: hsl(0 0% 100% / .06); overflow: hidden; }
.rc-track i { display: block; height: 100%; border-radius: 4px; }
.rc-val { color: var(--bone); font-size: 12px; white-space: nowrap; }
.rc-val em { color: var(--dim); font-style: normal; margin-left: 4px; }
.rc-empty { font-size: 12px; color: var(--dim); margin: 4px 0; }
.record { display: inline-block; margin-top: 14px; padding: 5px 12px; border-radius: 999px; background: var(--gold); color: var(--ink); font-weight: 800; font-size: 12px; letter-spacing: 1.5px; }
@media (max-width: 760px) { .pause-grid { grid-template-columns: 1fr; } }
/* ---------- Magic-inspired effects: pointer glow, tilt, shine, animated border ---------- */
@property --spin { syntax: "<angle>"; inherits: false; initial-value: 0deg; }
.glow { --mx: 50%; --my: 50%; --gc: var(--accent, var(--rc, var(--gold))); isolation: isolate; }
.glow::before {
  content: ""; position: absolute; inset: 0; border-radius: inherit; padding: 1px; pointer-events: none; z-index: 0;
  background: radial-gradient(180px circle at var(--mx) var(--my), var(--gc), transparent 70%);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor; mask-composite: exclude;
  opacity: 0; transition: opacity .2s;
}
.glow::after {
  content: ""; position: absolute; inset: 0; border-radius: inherit; pointer-events: none; z-index: 0;
  background: radial-gradient(240px circle at var(--mx) var(--my), color-mix(in srgb, var(--gc) 16%, transparent), transparent 65%);
  opacity: 0; transition: opacity .2s;
}
.glow:hover::before, .glow:hover::after, .glow.sel::before, .glow:focus-visible::after { opacity: 1; }
.glow > * { position: relative; z-index: 1; }
.class-card .watermark {
  position: absolute; right: -6px; bottom: -14px; z-index: 0; font-family: var(--font-display); font-size: 84px; line-height: 1;
  color: var(--accent); opacity: .06; transition: opacity .25s, transform .35s var(--ease); pointer-events: none;
}
.class-card:hover .watermark, .class-card.sel .watermark { opacity: .16; transform: translateY(-4px) rotate(-6deg); }
.tilt { transform-style: preserve-3d; transition: transform .18s var(--ease), background .15s; will-change: transform; }
.card.tilt:hover:not([disabled]) { transform: perspective(700px) rotateX(var(--ry, 0deg)) rotateY(var(--rx, 0deg)) translateY(-4px); }
.card.r-legendary { border-color: transparent; background:
  linear-gradient(var(--surface-2), var(--surface-2)) padding-box,
  conic-gradient(from var(--spin), #f4c842, #d6453f, #f4c842 40%, #6b4b12, #f4c842) border-box;
  animation: rise .25s var(--ease) both, spin 4s linear infinite; box-shadow: 0 0 28px -8px rgba(244,200,66,.6); }
.card.r-legendary:hover:not([disabled]) { background:
  linear-gradient(var(--surface-3), var(--surface-3)) padding-box,
  conic-gradient(from var(--spin), #f4c842, #d6453f, #f4c842 40%, #6b4b12, #f4c842) border-box; }
.card.r-rare { box-shadow: 0 0 22px -12px var(--rare); }
@keyframes spin { to { --spin: 360deg; } }
.btn.primary { position: relative; overflow: hidden; }
.btn.primary::after {
  content: ""; position: absolute; inset: 0; transform: translateX(-120%) skewX(-20deg);
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.35), transparent);
}
.btn.primary:hover::after { transform: translateX(120%) skewX(-20deg); transition: transform .6s var(--ease); }
.detail { overflow: hidden; }
.detail .bigmark {
  position: absolute; right: -20px; top: -30px; font-family: var(--font-display); font-size: 220px; line-height: 1;
  color: var(--accent); opacity: .05; pointer-events: none;
}
.detail > * { position: relative; }
.detail-head .kanji { text-shadow: 0 0 24px color-mix(in srgb, var(--accent) 55%, transparent); }
#menu .embers { position: fixed; inset: 0; pointer-events: none; overflow: hidden; z-index: 0; }
#menu .menu-wrap { position: relative; z-index: 1; }
.embers i {
  position: absolute; bottom: -10px; width: 4px; height: 4px; border-radius: 50%;
  background: var(--crimson); box-shadow: 0 0 8px var(--crimson); opacity: 0;
  animation: ember var(--d, 9s) linear var(--delay, 0s) infinite;
}
@keyframes ember {
  10% { opacity: .8; }
  100% { transform: translate(var(--dx, 40px), -105vh); opacity: 0; }
}
.logo .kanji { text-shadow: 0 0 30px rgba(214,69,63,.55); animation: breathe 4s ease-in-out infinite; }
@keyframes breathe { 50% { text-shadow: 0 0 46px rgba(214,69,63,.85); } }
.bar.hp.hurt { animation: hurt .35s ease-out; }
@keyframes hurt { 30% { box-shadow: 0 0 0 2px var(--crimson), 0 0 18px var(--crimson); } }
.slot.ult.ready::before {
  content: ""; position: absolute; inset: -3px; border-radius: 50%; z-index: 0;
  background: conic-gradient(from var(--spin), transparent 0 70%, var(--ult) 85%, transparent 100%);
  animation: spin 1.6s linear infinite;
  -webkit-mask: radial-gradient(circle, transparent 62%, #000 64%); mask: radial-gradient(circle, transparent 62%, #000 64%);
}
.slot.ready:not(.ult):not(.empty) .kanji { text-shadow: 0 0 12px rgba(237,227,200,.35); }
@media (prefers-reduced-motion: reduce) {
  .tilt:hover { transform: none !important; }
}
/* ═══════════ UI pass 2 — "lacquer & gold leaf" ═══════════
   Lacquered panels with gold corner brackets, ornament dividers, a crimson
   lacquer CTA with a sweeping sheen + pointer light (after Klyv Shimmer Button),
   a light that travels the border of selected / ready things (after Border Beam
   Panel), and a framed hotbar with a tick-gauge ult (after Radial Progress). */
:root {
  --lacquer: linear-gradient(180deg, rgba(38, 30, 25, .96), rgba(20, 16, 13, .96));
  --lacquer-2: linear-gradient(180deg, #2a221c, #1a1512);
  --gold-leaf: linear-gradient(135deg, #f3d48a, #c89a45 45%, #8a6326 70%, #e9c46f);
  --frame: rgba(217, 173, 91, .38);
  --hi: inset 0 1px 0 rgba(255, 240, 210, .07);
  --drop: 0 18px 40px -18px rgba(0, 0, 0, .8);
}
@property --beam { syntax: "<angle>"; inherits: false; initial-value: 0deg; }
@keyframes beam-spin { to { --beam: 360deg; } }
@keyframes sheen { 0% { transform: translateX(-160%) skewX(-20deg); } 55%, 100% { transform: translateX(360%) skewX(-20deg); } }

/* ---------- Buttons ---------- */
.btn { border-radius: 10px; background: var(--lacquer-2); border-color: rgba(237, 227, 200, .18); box-shadow: var(--hi), 0 2px 0 rgba(0, 0, 0, .35);
  letter-spacing: .2px; transition: background .2s, border-color .2s, transform .12s var(--ease), box-shadow .2s; }
.btn:hover { border-color: var(--frame); background: linear-gradient(180deg, #33291f, #1f1915); box-shadow: var(--hi), 0 0 0 1px rgba(217, 173, 91, .15), 0 6px 18px -10px rgba(217, 173, 91, .5); }
.btn .kanji { color: var(--gold); }
.btn.ghost { background: rgba(20, 16, 13, .55); backdrop-filter: blur(6px); }
.btn.primary { position: relative; isolation: isolate; overflow: hidden; color: #fff8ea; border: 1px solid #f0b06a55;
  background: linear-gradient(180deg, #d94a3f, #a8241f 60%, #8a1c18); text-shadow: 0 1px 1px rgba(60, 0, 0, .6);
  box-shadow: inset 0 1px 0 rgba(255, 210, 180, .35), inset 0 -2px 0 rgba(60, 0, 0, .35), 0 8px 22px -10px rgba(214, 69, 63, .8); }
.btn.primary::before { content: ""; position: absolute; z-index: -1; width: 160px; height: 160px; border-radius: 50%; left: var(--gx, 50%); top: var(--gy, 50%);
  transform: translate(-50%, -50%); background: radial-gradient(circle, rgba(255, 220, 170, .45), transparent 65%); opacity: 0; transition: opacity .25s; pointer-events: none; }
.btn.primary:hover::before { opacity: 1; }
.btn.primary::after { content: ""; position: absolute; z-index: -1; inset: 0 auto 0 0; width: 34%; background: linear-gradient(90deg, transparent, rgba(255, 240, 215, .55), transparent);
  filter: blur(4px); animation: sheen 3.4s ease-in-out infinite; pointer-events: none; }
.btn.primary:hover { background: linear-gradient(180deg, #e2564a, #b3291f 60%, #921e19); border-color: #f6c27f99; }

/* ---------- Panels: lacquer + gold corner brackets ---------- */
.pane, .detail, .group, .mon, .pause-btn, .wd-item, .sh-row, .g-card {
  background: var(--lacquer); border-color: rgba(237, 227, 200, .12); box-shadow: var(--hi), var(--drop);
}
.pane, .detail { position: relative; }
.pane::before, .detail::before, .group::before {
  content: ""; position: absolute; inset: 5px; pointer-events: none; border-radius: inherit;
  background:
    linear-gradient(var(--frame), var(--frame)) top left / 14px 1.5px no-repeat,
    linear-gradient(var(--frame), var(--frame)) top left / 1.5px 14px no-repeat,
    linear-gradient(var(--frame), var(--frame)) top right / 14px 1.5px no-repeat,
    linear-gradient(var(--frame), var(--frame)) top right / 1.5px 14px no-repeat,
    linear-gradient(var(--frame), var(--frame)) bottom left / 14px 1.5px no-repeat,
    linear-gradient(var(--frame), var(--frame)) bottom left / 1.5px 14px no-repeat,
    linear-gradient(var(--frame), var(--frame)) bottom right / 14px 1.5px no-repeat,
    linear-gradient(var(--frame), var(--frame)) bottom right / 1.5px 14px no-repeat;
}
.pane h4, .detail h3 { display: flex; align-items: center; gap: 10px; color: #b99a5e; letter-spacing: 2px; }
.pane h4::after, .detail h3::after { content: ""; flex: 1; height: 1px; background: linear-gradient(90deg, rgba(217, 173, 91, .35), transparent); }
.panel-title { display: flex; align-items: center; justify-content: center; gap: 16px; text-shadow: 0 2px 18px rgba(214, 69, 63, .25); }
.panel-title::before, .panel-title::after { content: ""; width: min(120px, 14vw); height: 9px; flex: none;
  background: radial-gradient(circle, var(--gold) 0 2.6px, transparent 3px) center / 9px 9px no-repeat, linear-gradient(var(--frame), var(--frame)) center / 100% 1px no-repeat; }
.panel-title::before { -webkit-mask: linear-gradient(90deg, transparent, #000 60%); mask: linear-gradient(90deg, transparent, #000 60%); }
.panel-title::after { -webkit-mask: linear-gradient(270deg, transparent, #000 60%); mask: linear-gradient(270deg, transparent, #000 60%); }
#overlay { background: radial-gradient(ellipse at 50% 20%, rgba(60, 14, 12, .55), rgba(5, 4, 3, .86) 60%); backdrop-filter: blur(5px) saturate(.8); }

/* ---------- Menu / class select ---------- */
#menu { background:
  radial-gradient(ellipse at 75% -10%, rgba(214, 69, 63, .22), transparent 55%),
  radial-gradient(ellipse at 0% 110%, rgba(217, 173, 91, .1), transparent 50%),
  repeating-linear-gradient(90deg, rgba(237, 227, 200, .018) 0 1px, transparent 1px 64px),
  var(--ink); }
.logo .kanji { text-shadow: 0 0 24px rgba(214, 69, 63, .45); }
.logo h1 { background: linear-gradient(180deg, #f6ecd2, #c9b282); -webkit-background-clip: text; background-clip: text; color: transparent; }
.menu-actions { padding: 6px; border-radius: 14px; background: rgba(20, 16, 13, .6); border: 1px solid rgba(237, 227, 200, .08); backdrop-filter: blur(8px); gap: 6px; }
.menu-actions .btn { min-height: 40px; padding: 0 14px; font-size: 14px; background: transparent; box-shadow: none; border-color: transparent; }
.menu-actions .btn:hover { background: rgba(217, 173, 91, .08); border-color: rgba(217, 173, 91, .25); }
.class-card { background: var(--lacquer); border-color: rgba(237, 227, 200, .1); box-shadow: var(--hi), 0 10px 26px -18px #000; }
.class-card.sel { background: radial-gradient(ellipse at 30% 0%, color-mix(in srgb, var(--accent) 22%, transparent), transparent 70%), var(--lacquer); border-color: transparent; }
/* Travelling light around the selected card / ready ult / held weapon (Border Beam Panel, CSS-only) */
.class-card.sel::before, .slot.ult.ready::before {
  content: ""; position: absolute; inset: -1px; border-radius: inherit; padding: 1.5px; pointer-events: none; z-index: 2;
  background: conic-gradient(from var(--beam), transparent 0deg, color-mix(in srgb, var(--accent, var(--gold)) 10%, transparent) 20deg,
    color-mix(in srgb, var(--accent, var(--gold)) 60%, transparent) 48deg, var(--accent, var(--gold)) 58deg, #fff 61deg, transparent 64deg,
    transparent 180deg, color-mix(in srgb, var(--gold) 50%, transparent) 230deg, var(--gold) 240deg, transparent 244deg, transparent 360deg);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor;
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); mask-composite: exclude;
  animation: beam-spin 6s linear infinite; opacity: 1;
}
.class-card.sel { box-shadow: 0 0 0 1px color-mix(in srgb, var(--accent) 35%, transparent), 0 14px 34px -14px var(--accent); }
.detail { background: radial-gradient(ellipse at 20% 0%, color-mix(in srgb, var(--accent) 14%, transparent), transparent 60%), var(--lacquer); }
.detail-head .kanji { text-shadow: 0 0 26px color-mix(in srgb, var(--accent) 55%, transparent); }
.ult-box { background: linear-gradient(135deg, rgba(240, 199, 94, .08), rgba(0, 0, 0, .25)); border-color: rgba(240, 199, 94, .25); }
.weapon-chip { background: rgba(10, 8, 7, .45); }
.weapon-chip.on { background: linear-gradient(135deg, rgba(217, 173, 91, .16), rgba(0, 0, 0, .2)); box-shadow: inset 0 0 0 1px rgba(217, 173, 91, .35); }
.start-row .btn.primary { min-height: 52px; font-size: 16px; letter-spacing: .5px; }

/* ---------- HUD ---------- */
.hud-tl { padding: 10px 12px 10px; border-radius: 12px; background: linear-gradient(180deg, rgba(20, 16, 13, .72), rgba(20, 16, 13, .4)); border: 1px solid rgba(237, 227, 200, .08); backdrop-filter: blur(4px); }
.hud-class .kanji { text-shadow: 0 0 12px color-mix(in srgb, var(--accent, var(--gold)) 60%, transparent); }
.bar { border-radius: 6px; border-color: rgba(237, 227, 200, .16); box-shadow: inset 0 1px 3px rgba(0, 0, 0, .6); }
.bar.hp > i:not(.ghost) { background: linear-gradient(180deg, #e45a4f, #b3241e 55%, #861a16); box-shadow: inset 0 1px 0 rgba(255, 200, 180, .35); }
.bar.xp > i { background: linear-gradient(90deg, #4f8fbf, #9fd0f0); }
.hud-wave { font-size: 24px; letter-spacing: 4px; display: flex; align-items: center; justify-content: center; gap: 12px; text-shadow: 0 2px 12px rgba(0, 0, 0, .8); }
.hud-wave::before, .hud-wave::after { content: ""; width: 54px; height: 7px; background: radial-gradient(circle, var(--gold) 0 2px, transparent 2.5px) center / 7px 7px no-repeat, linear-gradient(var(--frame), var(--frame)) center / 100% 1px no-repeat; }
.hud-wave.boss::before, .hud-wave.boss::after { filter: hue-rotate(-40deg) saturate(2); }
.bar.timer { height: 3px; } .bar.timer > i { background: var(--gold-leaf); }
.mon { border-color: rgba(217, 173, 91, .3); }
.group { position: relative; padding: 10px; border-radius: 14px; background: linear-gradient(180deg, rgba(34, 27, 22, .88), rgba(14, 11, 9, .9)); border-color: rgba(217, 173, 91, .2); }
.slot { border-radius: 10px; background: radial-gradient(circle at 50% 30%, rgba(255, 240, 210, .06), rgba(0, 0, 0, .55)); box-shadow: inset 0 1px 0 rgba(255, 240, 210, .06), inset 0 -6px 12px rgba(0, 0, 0, .45); }
.cell.held::before { background: var(--gold-leaf); }
/* Ult: orb framed by a tick gauge that fills as it charges */
.ult-gauge { position: relative; width: 92px; height: 92px; display: grid; place-items: center; margin-top: -12px; }
.ult-ticks { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.ult-ticks line { stroke: rgba(237, 227, 200, .18); stroke-width: 2.4; stroke-linecap: round; transition: stroke .25s; }
.ult-ticks line.on { stroke: hsl(var(--h) 85% 66%); filter: drop-shadow(0 0 2px hsl(var(--h) 90% 60%)); }
.slot.ult { background: radial-gradient(circle at 50% 35%, rgba(255, 240, 210, .1), rgba(0, 0, 0, .7)); border-color: rgba(217, 173, 91, .35); }
.slot.ult.ready { overflow: visible; }
.slot.ult.ready::before { border-radius: 50%; padding: 2px; --accent: var(--ult); animation-duration: 2.2s; }
.ult-cell { width: 96px; }

/* ---------- Pause ---------- */
.pause-menu .btn { min-height: 48px; padding: 0 16px; }
.pause-menu .btn:not(.primary)::after { content: "›"; margin-left: auto; color: var(--dim); font-size: 18px; transition: transform .2s var(--ease), color .2s; }
.pause-menu .btn:not(.primary):hover::after { transform: translateX(3px); color: var(--gold); }
.stats div { border-bottom: 1px solid rgba(237, 227, 200, .07); }
.switch { background: rgba(0, 0, 0, .45); box-shadow: inset 0 1px 3px rgba(0, 0, 0, .6); }
.switch.on { background: linear-gradient(180deg, #c0392f, #8a1c18); border-color: #e0786a; }
.switch.on::after { background: #fff4dc; box-shadow: 0 0 8px rgba(255, 220, 170, .6); }

/* ---------- Level-up / shop cards ---------- */
.card { background: radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--rc) 14%, transparent), transparent 65%), var(--lacquer); box-shadow: var(--hi), var(--drop); }
.card:hover:not([disabled]) { box-shadow: var(--hi), 0 0 0 1px color-mix(in srgb, var(--rc) 50%, transparent), 0 18px 40px -16px color-mix(in srgb, var(--rc) 70%, transparent); }
.card .kanji { text-shadow: 0 0 20px color-mix(in srgb, var(--rc) 45%, transparent); }
.card.r-legendary::before { content: ""; position: absolute; inset: -1px; border-radius: inherit; padding: 1.5px; pointer-events: none;
  background: conic-gradient(from var(--beam), transparent 0 40deg, var(--legendary) 58deg, #fff 61deg, transparent 64deg 220deg, var(--legendary) 238deg, transparent 242deg);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor;
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); mask-composite: exclude; animation: beam-spin 5s linear infinite; opacity: 1; z-index: 2; }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
}
`;
