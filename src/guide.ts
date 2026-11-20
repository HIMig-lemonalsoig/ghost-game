// ─── Guide ────────────────────────────────────────────────────────────────────
// In-game tutorial / codex: how runs work and how to unlock the deeper systems
// (duo perks, evolutions, elites, ultimate perks, vows...). Everything listed
// is generated from the real game data, so it never goes out of date.
import { PERK_POOL, SECONDARIES, CLASSES, getClass } from "./GhostGame";
import type { ClassId, SecondaryId } from "./GhostGame";
import { DUOS } from "./content/duos";
import { EVOLUTIONS, EVO_MASTERY } from "./content/evolutions";
import { AFFIXES } from "./content/elites";
import { GENERAL_ULT_PERKS, CLASS_ULT_PERKS } from "./content/ultperks";
import { VOWS, VOW_UNLOCK_WAVE, MAX_VOW_SCORE, VOW_COIN_BONUS } from "./content/vows";
import { SIGNATURES } from "./content/signatures";

export type GuideTab = "basics" | "duos" | "evolutions" | "ultperks" | "elites" | "enemies" | "vows" | "classes";
export const GUIDE_TABS: { id: GuideTab; label: string; kanji: string }[] = [
  { id: "basics", label: "Basics", kanji: "基" },
  { id: "duos", label: "Duo perks", kanji: "双" },
  { id: "evolutions", label: "Evolutions", kanji: "進" },
  { id: "ultperks", label: "Ultimate perks", kanji: "極" },
  { id: "elites", label: "Elites & chests", kanji: "精" },
  { id: "enemies", label: "Enemies", kanji: "敵" },
  { id: "vows", label: "Vows", kanji: "誓" },
  { id: "classes", label: "Signatures", kanji: "印" },
];

export interface GuideCtx {
  owned: string[];                     // perks owned this run
  ownedDuos: string[];
  discoveredDuos: Record<string, number>;
  evolvedEver: Record<string, number>;
  evolvedNow: string[];
  equipped: SecondaryId[];
  classId: ClassId | null;
  highestWave: number;
  mastery: Record<string, number>;
}

const perkName = (id: string) => PERK_POOL.find(p => p.id === id)?.name
  ?? ({ crit: "Killing Eye (shop)", def_rare: "Lacquered Plate (shop)", def_leg: "Daimyo's Cuirass (shop)", dex_common: "Light Hands (shop)", shop_fire_charm: "Fire Charm (shop)" } as Record<string, string>)[id]
  ?? id;
const step = (n: number, html: string) => `<li><b class="g-step">${n}</b><span>${html}</span></li>`;

function basics(): string {
  return `
  <div class="g-grid">
    <div class="g-card"><h5>How a run works</h5><ul>
      <li>Survive each wave until its timer runs out. Every 5th wave is a <b>boss</b>.</li>
      <li>Kills drop XP orbs and coins. <b>Level-ups are banked</b> and you pick them when the wave ends.</li>
      <li>After each wave the <b>merchant</b> sells upgrades. Reroll for new items.</li>
      <li>Your best wave, career stats and achievements are saved in this browser.</li>
    </ul></div>
    <div class="g-card"><h5>Your kit</h5><ul>
      <li><b>Two weapons</b>: swap with Tab. Ranged weapons auto-swap when they run out of ammo.</li>
      <li><b>Abilities</b> (Q / E) come from level-up cards. Picking a third swaps one out.</li>
      <li><b>Ultimate</b> (R) charges from hitting and getting hit. It glows gold when ready.</li>
      <li><b>Items</b> (1 / 2 / 3) drop from tough enemies and Spirit Chests. Using one tells you what it did.</li>
    </ul></div>
    <div class="g-card"><h5>Staying alive</h5><ul>
      <li><b>Dash</b> (Shift / right-click) gives brief invulnerability.</li>
      <li><b>Deflect</b> (an ability) blocks every attack while it's up and hits attackers back.</li>
      <li><b>Shields</b> (Tate etc.) block while you hold F until the block meter empties.</li>
      <li>Watch for <b>telegraphs</b>: red wind-ups, circles on the ground and glowing outlines all warn you before a hit.</li>
    </ul></div>
    <div class="g-card"><h5>Stealth</h5><ul>
      <li>Invisibility, smoke pellets and standing in smoke make enemies <b>lose track of you</b> (they show a "?").</li>
      <li>Hit an enemy that has lost you, or one that hasn't noticed you, for an instant <b>stealth kill</b>.</li>
    </ul></div>
    <div class="g-card"><h5>Getting stronger</h5><ul>
      <li>Defense, dexterity, crit and move speed give a bit less each time you stack them. Shop cards show the real gain.</li>
      <li>Combine perks into <b>Duo perks</b> and push weapons to <b>Evolutions</b> (see their tabs).</li>
      <li>Pause any time to see your stats, blessings and evolution progress.</li>
    </ul></div>
    <div class="g-card"><h5>Unlocks</h5><ul>
      <li>Reach wave ${VOW_UNLOCK_WAVE} to unlock <b>Vows</b> for extra challenge and coins.</li>
      <li>Achievements range from Common to Mythic. Check them on the menu.</li>
    </ul></div>
  </div>`;
}

function duos(c: GuideCtx): string {
  const rows = DUOS.map(d => {
    const groups = d.needs.map(g => {
      const have = g.find(id => c.owned.includes(id));
      return `<span class="g-need${have ? " ok" : ""}">${have ? "✓ " + perkName(have) : g.map(perkName).join(" / ")}</span>`;
    }).join(`<span class="g-plus">+</span>`);
    const state = c.ownedDuos.includes(d.id) ? `<span class="g-badge on">Owned</span>`
      : d.needs.every(g => g.some(id => c.owned.includes(id))) ? `<span class="g-badge ready">Can appear now!</span>`
      : c.discoveredDuos[d.id] ? `<span class="g-badge">Found before</span>` : "";
    return `<div class="g-row"><span class="g-k kanji">${d.kanji}</span><div class="g-t"><b>${d.name}</b> ${state}<p>${d.desc}</p><div class="g-needs">${groups}</div></div></div>`;
  }).join("");
  return `
  <div class="g-card g-how"><h5>How to unlock a duo perk</h5><ol class="g-steps">
    ${step(1, "Each duo needs <b>one perk from each of two groups</b> (listed below). Pick them from level-up cards.")}
    ${step(2, "Once you own both halves, the duo can appear at level-up, with about a <b>1 in 4 chance</b> each time. It has a gold-and-violet card marked <b>DUO</b>.")}
    ${step(3, "Level-up cards show <b>◆ Duo piece</b> on perks that build toward one, and <b>★ Completes duo</b> on the card that finishes the pair.")}
  </ol></div>
  <div class="g-list">${rows}</div>`;
}

function evolutions(c: GuideCtx): string {
  const rows = (Object.keys(EVOLUTIONS) as SecondaryId[]).map(id => {
    const e = EVOLUTIONS[id];
    const m = Math.min(EVO_MASTERY, c.mastery[id] ?? 0);
    const equipped = c.equipped.includes(id);
    const state = c.evolvedNow.includes(id) ? `<span class="g-badge on">Evolved</span>`
      : equipped ? `<span class="g-badge ready">Equipped · Mastery ${m}/${EVO_MASTERY}</span>`
      : c.evolvedEver[id] ? `<span class="g-badge">Evolved before</span>` : "";
    return `<div class="g-row"><span class="g-k kanji">${e.kanji}</span><div class="g-t">
      <b>${SECONDARIES[id].name} → ${e.name}</b> ${state}<p>${e.desc}</p>
      <div class="g-needs"><span class="g-need">Catalyst: ${e.catalystLabel}</span></div></div></div>`;
  }).join("");
  return `
  <div class="g-card g-how"><h5>How to evolve a weapon</h5><ol class="g-steps">
    ${step(1, `<b>Mastery ${EVO_MASTERY}</b>: buy 3 damage upgrades for that weapon in the shop ("<i>Weapon</i> Mastery / Honed / Forged"). For the katana, buy 3 <b>Whetstones</b>.`)}
    ${step(2, "Own its <b>catalyst</b>, a specific level-up perk or shop item (listed below). Cards say <b>⚒ Catalyst</b> when they are one.")}
    ${step(3, "Open a <b>Spirit Chest</b>. Elites and bosses drop them. When a weapon is ready, its slot glows gold and the next chest evolves it.")}
  </ol><p class="g-note">Evolved weapons hit 40% harder and gain a new trick. Pause to check progress for your equipped weapons.</p></div>
  <div class="g-list">${rows}</div>`;
}

function ultPerks(c: GuideCtx): string {
  const gen = GENERAL_ULT_PERKS.map(p => `<div class="g-row"><span class="g-k kanji">${p.kanji}</span><div class="g-t"><b>${p.name}</b> <span class="g-badge">${p.rarity}</span><p>${p.desc}</p></div></div>`).join("");
  const cls = CLASS_ULT_PERKS.map(p => `<div class="g-row${p.cls === c.classId ? " mine" : ""}"><span class="g-k kanji">${p.kanji}</span><div class="g-t"><b>${getClass(p.cls!).name}: ${p.name}</b>${p.cls === c.classId ? ` <span class="g-badge ready">Your class</span>` : ""}<p>${p.desc}</p></div></div>`).join("");
  return `
  <div class="g-card g-how"><h5>How ultimate perks work</h5><ol class="g-steps">
    ${step(1, "They appear on level-up cards with a gold <b>ULTIMATE</b> tag.")}
    ${step(2, "General ones work for any class. The damage ones stack.")}
    ${step(3, "Every class has one <b>class ultimate perk</b> that only shows up while you play that class, with about a 1 in 5 chance each level-up until you take it.")}
  </ol></div>
  <h4 class="g-h">General</h4><div class="g-list">${gen}</div>
  <h4 class="g-h">Class ultimate perks</h4><div class="g-list">${cls}</div>`;
}

function elites(): string {
  const rows = Object.values(AFFIXES).map(a => `<div class="g-row"><span class="g-k kanji" style="color:hsl(${a.hue} 90% 70%)">${a.kanji}</span><div class="g-t"><b>${a.name}</b><p>${a.hint[0].toUpperCase() + a.hint.slice(1)}.</p></div></div>`).join("");
  return `
  <div class="g-card g-how"><h5>Elites</h5><ol class="g-steps">
    ${step(1, "From wave 6, any normal enemy can spawn as an <b>elite</b>: a glowing outline, a name tag like <i>Burning Brute</i>, and 2.5× HP.")}
    ${step(2, "From wave 18 some have <b>two</b> affixes. On Hard and Death (or with the Boss Fury vow), bosses get affixes too.")}
    ${step(3, "Elites give triple XP and coins and always drop a <b>Spirit Chest</b>.")}
  </ol></div>
  <div class="g-card g-how"><h5>Spirit Chests</h5><ul>
    <li>Walk over the red-and-gold box. It floats toward you when you're close.</li>
    <li>If a weapon is <b>ready to evolve</b>, the chest evolves it. Otherwise it gives coins, an item (if you have a free slot) and some healing.</li>
    <li>Bosses drop them too. Leftover chests open automatically when the wave ends.</li>
  </ul></div>
  <h4 class="g-h">Affixes and how to beat them</h4><div class="g-list">${rows}</div>`;
}

function enemies(): string {
  const list: [string, string, string][] = [
    ["兵", "Ashigaru / Brute", "Basic melee. Watch the red wind-up, then dash or block."],
    ["盾", "Shield-bearer", "Blocks weapon hits from the front. Hit it from the side or behind, or use abilities and ultimates (they go through)."],
    ["弓", "Archer", "Keeps its distance and shoots. Dash through arrows, or deflect them."],
    ["刺", "Assassin", "Dashes at you with a telegraph. Sidestep, then punish."],
    ["魂", "Wisp", "Fast, weak swarms. Area attacks clear them."],
    ["癒", "Healer Monk", "Hides behind allies and heals them. The green ring shows its range, so kill it first."],
    ["爆", "Bomber", "Lobs bombs at your position. Keep moving out of the circles."],
    ["灯", "Lantern Ghost", "Explodes after a fuse. Back off when it glows."],
    ["怨", "Onryō", "Ink pools slow you, and its talisman roots you. Dash through the talisman, or dash to break free."],
    ["鵺", "Nue", "Summons wisps after a purple charge. Kill it and its wisps vanish."],
    ["鏡", "Mirror Monk", "Reflects shots that hit its front. Use melee or hit it from behind."],
  ];
  return `<div class="g-list">${list.map(([k, n, d]) => `<div class="g-row"><span class="g-k kanji">${k}</span><div class="g-t"><b>${n}</b><p>${d}</p></div></div>`).join("")}</div>
  <p class="g-note">New enemy types also show a tip the first time you meet them in a run.</p>`;
}

function vows(c: GuideCtx): string {
  const locked = c.highestWave < VOW_UNLOCK_WAVE;
  const rows = VOWS.map(v => `<div class="g-row"><span class="g-k kanji">${v.kanji}</span><div class="g-t"><b>${v.name}</b> <span class="g-badge">${v.ranks} rank${v.ranks > 1 ? "s" : ""} · ${v.points} pt${v.points > 1 ? "s" : ""}/rank</span><p>${v.desc(1)}</p></div></div>`).join("");
  return `
  <div class="g-card g-how"><h5>How to unlock Vows</h5><ol class="g-steps">
    ${step(1, `Reach <b>wave ${VOW_UNLOCK_WAVE}</b> on any difficulty. ${locked ? `Your best so far: wave ${c.highestWave}.` : "<b>You've unlocked them!</b>"}`)}
    ${step(2, "Press the <b>誓 Vows</b> button under Difficulty on the class screen and raise vows with +.")}
    ${step(3, `Every point adds <b>+${Math.round(VOW_COIN_BONUS * 100)}% coins</b>, goes on your record and counts toward Vow achievements (max score ${MAX_VOW_SCORE}).`)}
  </ol></div>
  <div class="g-list">${rows}</div>`;
}

function classes(c: GuideCtx): string {
  return `<p class="g-note">Every class has one signature passive that changes how it plays. Its ultimate perk is on the Ultimate perks tab.</p>
  <div class="g-list">${CLASSES.map(k => {
    const s = SIGNATURES[k.id];
    return `<div class="g-row${k.id === c.classId ? " mine" : ""}"><span class="g-k kanji" style="color:${k.accent}">${k.kanji}</span><div class="g-t"><b>${k.name}: ${s.name}</b><p>${s.desc}</p></div></div>`;
  }).join("")}</div>`;
}

export function guideHTML(tab: GuideTab, c: GuideCtx): string {
  const body = tab === "basics" ? basics() : tab === "duos" ? duos(c) : tab === "evolutions" ? evolutions(c)
    : tab === "ultperks" ? ultPerks(c) : tab === "elites" ? elites() : tab === "enemies" ? enemies()
    : tab === "vows" ? vows(c) : classes(c);
  return `<div class="panel guide" style="text-align:left">
    <div class="panel-title" style="text-align:center">道 GUIDE</div>
    <div class="g-tabs" role="tablist">${GUIDE_TABS.map(t => `<button class="g-tab${t.id === tab ? " on" : ""}" role="tab" aria-selected="${t.id === tab}" data-guide="${t.id}"><span class="kanji">${t.kanji}</span>${t.label}</button>`).join("")}</div>
    <div class="g-body">${body}</div>
    <div class="panel-actions"><button class="btn primary" data-act="closeguide">Close · Esc</button></div>
  </div>`;
}

export const GUIDE_CSS = `
.guide { max-width: 980px; }
.g-tabs { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; margin: 14px 0 16px; }
.g-tab { display: inline-flex; align-items: center; gap: 6px; min-height: 36px; padding: 0 12px; border-radius: 999px; cursor: pointer;
  background: var(--surface-2); border: 1px solid var(--line); color: var(--muted); font: inherit; font-size: 13px; }
.g-tab:hover { color: var(--bone); border-color: var(--line-strong); }
.g-tab.on { color: var(--ink); background: var(--gold); border-color: var(--gold); font-weight: 700; }
.g-tab .kanji { font-size: 15px; }
.g-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 10px; }
.g-card { padding: 14px 16px; border-radius: 12px; background: var(--surface-2); border: 1px solid var(--line); }
.g-card h5 { font-size: 12px; letter-spacing: 1.6px; text-transform: uppercase; color: var(--gold); margin-bottom: 8px; }
.g-card ul { padding-left: 18px; display: grid; gap: 6px; font-size: 13.5px; color: var(--muted); line-height: 1.5; }
.g-card b, .g-steps b { color: var(--bone); }
.g-how { margin-bottom: 12px; }
.g-steps { list-style: none; display: grid; gap: 8px; }
.g-steps li { display: flex; gap: 10px; align-items: flex-start; font-size: 13.5px; color: var(--muted); line-height: 1.5; }
.g-step { flex: none; width: 22px; height: 22px; border-radius: 50%; display: grid; place-items: center; background: var(--gold); color: var(--ink); font-size: 12px; }
.g-note { font-size: 13px; color: var(--dim); margin: 8px 0; }
.g-h { font-size: 11px; letter-spacing: 1.6px; text-transform: uppercase; color: var(--dim); margin: 16px 0 8px; }
.g-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 8px; }
.g-row { display: flex; gap: 12px; padding: 10px 12px; border-radius: 10px; background: var(--surface-2); border: 1px solid var(--line); }
.g-row.mine { border-color: color-mix(in srgb, var(--gold) 55%, transparent); }
.g-k { flex: none; width: 34px; font-size: 22px; text-align: center; color: var(--gold); }
.g-t { min-width: 0; }
.g-t b { font-size: 14px; color: var(--bone); }
.g-t p { font-size: 13px; color: var(--muted); margin-top: 2px; line-height: 1.45; }
.g-needs { display: flex; flex-wrap: wrap; align-items: center; gap: 4px; margin-top: 6px; }
.g-need { font-size: 11.5px; padding: 2px 7px; border-radius: 6px; background: rgba(0,0,0,.3); border: 1px solid var(--line); color: var(--muted); }
.g-need.ok { color: #7fdc9a; border-color: rgba(127,220,154,.5); }
.g-plus { color: var(--dim); font-size: 12px; }
.g-badge { font-size: 10px; letter-spacing: .8px; text-transform: uppercase; padding: 2px 6px; border-radius: 4px; margin-left: 4px; vertical-align: 1px;
  color: var(--muted); border: 1px solid var(--line-strong); }
.g-badge.on { color: var(--ink); background: #7fdc9a; border-color: #7fdc9a; }
.g-badge.ready { color: var(--ink); background: var(--gold); border-color: var(--gold); }
/* Card hints on level-up / shop cards */
.card .hint-line { margin-top: 8px; font-size: 11.5px; font-weight: 700; line-height: 1.35; padding: 4px 6px; border-radius: 6px; background: rgba(0,0,0,.3); }
.card .hint-line.duo { color: #c9b6ff; }
.card .hint-line.done { color: #ffd66b; }
.card .hint-line.evo { color: #ffb36b; }
/* One-time tip popups */
.tip-toast { display: flex; gap: 12px; align-items: flex-start; padding: 12px 14px; border-radius: 12px; pointer-events: auto;
  background: rgba(10, 16, 22, .95); border: 1px solid #7fb6dc; box-shadow: 0 10px 30px rgba(0,0,0,.5); animation: achin .3s var(--ease) both; }
.tip-toast.out { animation: achout .2s ease-in both; }
.tip-toast .kanji { font-size: 22px; color: #7fb6dc; }
.tip-toast .tip-label { display: block; font-size: 10px; letter-spacing: 1.6px; text-transform: uppercase; color: #7fb6dc; font-weight: 700; }
.tip-toast p b { color: #ffd66b; }
.tip-toast p { font-size: 13px; color: var(--bone); line-height: 1.4; margin-top: 2px; }
.tip-toast .tip-guide { margin-top: 6px; font-size: 11px; color: var(--muted); }
`;
