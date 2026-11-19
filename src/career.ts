// ─── Career stats ─────────────────────────────────────────────────────────────
// Lifetime totals saved per browser. Each GhostGame keeps per-run counters
// (game.run); we fold only the *new* part of them into the career whenever a
// wave ends, the run ends, the player quits, or the page is closed — so
// nothing is double-counted and a closed tab still keeps its progress.
// Runs that touched dev mode are never counted.
import { CLASSES, BOSS_INFO, DIFFICULTIES, getClass, newRunCounters } from "./GhostGame";
import type { GhostGame, RunCounters, Difficulty } from "./GhostGame";

const KEY = "ghostgame.career.v1";

interface ClassCareer { runs: number; kills: number; bestWave: number; time: number; }
export interface Career {
  runs: number; deaths: number;
  kills: number; stealthKills: number; bossKills: number;
  bossByKind: Record<string, number>; killsByKind: Record<string, number>;
  wavesCleared: number; highestWave: number; highestWaveClass: string; highestWaveDiff: string;
  highestLevel: number; monEarned: number;
  damageDealt: number; damageTaken: number; biggestHit: number;
  ults: number; items: number; dashes: number; time: number;
  waveSum: number; runsEnded: number;       // for average wave reached
  byClass: Record<string, ClassCareer>;
  byDifficulty: Record<string, number>;     // runs per difficulty
  bestWaveByDiff: Record<string, number>;   // highest wave reached per difficulty
  firstPlayed: number;
}

const fresh = (): Career => ({
  runs: 0, deaths: 0, kills: 0, stealthKills: 0, bossKills: 0, bossByKind: {}, killsByKind: {},
  wavesCleared: 0, highestWave: 0, highestWaveClass: "", highestWaveDiff: "", highestLevel: 0, monEarned: 0,
  damageDealt: 0, damageTaken: 0, biggestHit: 0, ults: 0, items: 0, dashes: 0, time: 0,
  waveSum: 0, runsEnded: 0, byClass: {}, byDifficulty: {}, bestWaveByDiff: {}, firstPlayed: 0,
});

function load(): Career {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...fresh(), ...JSON.parse(raw) };
  } catch { /* storage blocked or corrupt */ }
  return fresh();
}
let career = load();
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(career)); } catch { /* storage blocked */ } };

export const getCareer = () => career;

/** Career totals including this run's not-yet-saved progress (for live achievement checks). */
/** True when this game is a fresh (not continued) run that is being tracked. */
export const isFreshRun = (g: GhostGame) => tracks.get(g)?.isNew ?? false;

export function liveCareer(g: GhostGame | null): Career {
  const t = g ? tracks.get(g) : undefined;
  if (!g || !t || t.ended || g.devMode) return career;
  const out: Career = { ...career, killsByKind: { ...career.killsByKind }, bossByKind: { ...career.bossByKind },
    byClass: { ...career.byClass }, bestWaveByDiff: { ...career.bestWaveByDiff } };
  out.byClass[g.stats.classId] ??= { runs: 1, kills: 0, bestWave: 0, time: 0 };
  out.bestWaveByDiff[g.difficulty] = Math.max(out.bestWaveByDiff[g.difficulty] ?? 0, g.stats.wave);
  out.highestWave = Math.max(out.highestWave, g.stats.wave);
  out.highestLevel = Math.max(out.highestLevel, g.stats.level);
  for (const k of ["kills", "stealthKills", "bossKills", "wavesCleared", "damageDealt", "damageTaken",
    "monEarned", "ults", "items", "dashes", "time"] as const) out[k] += Math.max(0, g.run[k] - t.committed[k]);
  for (const k of Object.keys(g.run.bossByKind)) out.bossByKind[k] = (out.bossByKind[k] ?? 0) + Math.max(0, g.run.bossByKind[k] - (t.committed.bossByKind[k] ?? 0));
  out.biggestHit = Math.max(out.biggestHit, g.run.biggestHit);
  return out;
}
export function resetCareer() { career = fresh(); save(); }

// What has already been folded in, per game instance.
interface Track { committed: RunCounters; isNew: boolean; counted: boolean; ended: boolean; }
const tracks = new WeakMap<GhostGame, Track>();
const zero = (): RunCounters => newRunCounters();

/** Call right after a run starts. `isNew` = fresh run (false for "Continue"). */
export function trackRun(g: GhostGame, isNew: boolean) {
  tracks.set(g, { committed: zero(), isNew, counted: false, ended: false });
}

const cls = (id: string): ClassCareer => (career.byClass[id] ??= { runs: 0, kills: 0, bestWave: 0, time: 0 });

/** Fold any new progress from this run into the career. `died` = run just ended in defeat. */
export function commitRun(g: GhostGame | null, died = false) {
  if (!g) return;
  const t = tracks.get(g);
  if (!t || t.ended || g.devMode) return;
  const r = g.run, c = t.committed, s = g.stats;
  const C = cls(s.classId);

  if (!t.counted && t.isNew) {
    career.runs++;
    C.runs++;
    career.byDifficulty[g.difficulty] = (career.byDifficulty[g.difficulty] ?? 0) + 1;
    if (!career.firstPlayed) career.firstPlayed = Date.now();
  }
  t.counted = true;

  const nums = ["kills", "stealthKills", "bossKills", "wavesCleared", "damageDealt", "damageTaken",
    "monEarned", "ults", "items", "dashes", "time"] as const;
  for (const k of nums) {
    const d = Math.max(0, r[k] - c[k]);
    career[k] += d;
    if (k === "kills") C.kills += d;
    if (k === "time") C.time += d;
    c[k] = r[k];
  }
  const foldMap = (from: Record<string, number>, mark: Record<string, number>, into: Record<string, number>) => {
    for (const k of Object.keys(from)) {
      const d = from[k] - (mark[k] ?? 0);
      if (d > 0) into[k] = (into[k] ?? 0) + d;
      mark[k] = from[k];
    }
  };
  foldMap(r.killsByKind, c.killsByKind, career.killsByKind);
  foldMap(r.bossByKind, c.bossByKind, career.bossByKind);
  career.biggestHit = Math.max(career.biggestHit, r.biggestHit);
  career.highestLevel = Math.max(career.highestLevel, s.level);
  if (s.wave > career.highestWave) {
    career.highestWave = s.wave;
    career.highestWaveClass = s.classId;
    career.highestWaveDiff = g.difficulty;
  }
  C.bestWave = Math.max(C.bestWave, s.wave);
  career.bestWaveByDiff[g.difficulty] = Math.max(career.bestWaveByDiff[g.difficulty] ?? 0, s.wave);

  if (died) {
    t.ended = true;
    career.deaths++;
    career.runsEnded++;
    career.waveSum += s.wave;
  }
  save();
}

// ─── Rendering ────────────────────────────────────────────────────────────────
const n = (v: number) => Math.round(v).toLocaleString();
function dur(sec: number) {
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = Math.floor(sec % 60);
  return h ? `${h}h ${m}m` : m ? `${m}m ${s}s` : `${s}s`;
}
const ENEMY_NAMES: Record<string, string> = {
  normal: "Ashigaru", heavy: "Brute", shielded: "Shield-bearer", archer: "Archer", assassin: "Assassin",
  wisp: "Wisp", priest: "Healer monk", bomber: "Bomber", lantern: "Lantern ghost", boss: "Boss", final: "Final boss",
};

function bars(rows: [string, number, string?][], empty: string): string {
  const list = rows.filter(r => r[1] > 0).sort((a, b) => b[1] - a[1]);
  if (!list.length) return `<p class="cr-empty">${empty}</p>`;
  const max = list[0][1];
  return `<div class="cr-bars">${list.map(([label, v, color]) => `
    <div class="cr-bar"><span class="cr-bl">${label}</span>
      <span class="cr-bt"><i style="width:${Math.max(3, (v / max) * 100)}%;${color ? `background:${color}` : ""}"></i></span>
      <b class="num">${n(v)}</b></div>`).join("")}</div>`;
}

export function careerHTML(confirmReset: boolean): string {
  const c = career;
  if (!c.runs) {
    return `<div class="panel cr" style="max-width:560px">
      <div class="panel-title">CAREER</div>
      <div class="pane" style="margin-top:18px"><p class="cr-empty">No runs recorded yet. Finish a wave and your stats will start showing up here.</p></div>
      <div class="panel-actions"><button class="btn primary" data-act="closecareer">Close · Esc</button></div></div>`;
  }
  const fav = Object.entries(c.byClass).sort((a, b) => b[1].runs - a[1].runs)[0];
  const avgWave = c.runsEnded ? (c.waveSum / c.runsEnded).toFixed(1) : "—";
  const hwClass = c.highestWaveClass ? getClass(c.highestWaveClass as never).name : "";
  const hwDiff = c.highestWaveDiff ? DIFFICULTIES[c.highestWaveDiff as Difficulty]?.name ?? "" : "";
  const tile = (label: string, value: string, sub = "") =>
    `<div class="cr-tile"><span>${label}</span><b class="num">${value}</b>${sub ? `<em>${sub}</em>` : ""}</div>`;
  const row = (label: string, value: string) => `<div><span>${label}</span><b class="num">${value}</b></div>`;

  const classRows = CLASSES.filter(k => c.byClass[k.id]?.runs).map(k => {
    const s = c.byClass[k.id];
    return `<tr><td><span class="kanji" style="color:${k.accent}">${k.kanji}</span> ${k.name}</td>
      <td class="num">${n(s.runs)}</td><td class="num">${n(s.kills)}</td><td class="num">${s.bestWave || "—"}</td><td class="num">${dur(s.time)}</td></tr>`;
  }).sort().join("");

  return `<div class="panel cr" style="text-align:left">
    <div class="panel-title" style="text-align:center">CAREER</div>
    <div class="panel-sub" style="text-align:center">Since ${new Date(c.firstPlayed || Date.now()).toLocaleDateString()}${fav ? ` · Favourite class: ${getClass(fav[0] as never).name}` : ""}</div>

    <div class="cr-tiles">
      ${tile("Total kills", n(c.kills))}
      ${tile("Highest wave", String(c.highestWave || "—"), [hwClass, hwDiff].filter(Boolean).join(" · "))}
      ${tile("Runs", n(c.runs), `avg wave ${avgWave}`)}
      ${tile("Time played", dur(c.time))}
    </div>

    <div class="cr-grid">
      <div class="pane"><h4>Combat</h4><div class="stats">
        ${row("Stealth kills", n(c.stealthKills))}
        ${row("Bosses slain", n(c.bossKills))}
        ${row("Damage dealt", n(c.damageDealt))}
        ${row("Damage taken", n(c.damageTaken))}
        ${row("Biggest hit", n(c.biggestHit))}
        ${row("Ultimates used", n(c.ults))}
        ${row("Dashes", n(c.dashes))}
        ${row("Items used", n(c.items))}
      </div></div>
      <div class="pane"><h4>Progress</h4><div class="stats">
        ${row("Waves cleared", n(c.wavesCleared))}
        ${row("Highest level", String(c.highestLevel || "—"))}
        ${row("Coins earned", n(c.monEarned))}
        ${row("Deaths", n(c.deaths))}
        ${row("Kills per run", c.runs ? n(c.kills / c.runs) : "0")}
        ${row("Average wave", avgWave)}
      </div></div>
      <div class="pane"><h4>Enemies slain</h4>${bars(Object.entries(c.killsByKind).map(([k, v]) => [ENEMY_NAMES[k] ?? k, v] as [string, number]), "No enemies slain yet.")}</div>
      <div class="pane"><h4>Bosses slain</h4>${bars([
        ...(Object.keys(BOSS_INFO) as (keyof typeof BOSS_INFO)[]).map(k => [`${BOSS_INFO[k].kanji} ${BOSS_INFO[k].name}`, c.bossByKind[k] ?? 0, "var(--crimson)"] as [string, number, string]),
        ["王 Final boss", c.bossByKind.final ?? 0, "var(--legendary)"],
      ], "No bosses slain yet — the first one shows up on wave 5.")}</div>
      <div class="pane cr-wide"><h4>Classes</h4>
        <table class="cr-table"><thead><tr><th>Class</th><th>Runs</th><th>Kills</th><th>Best wave</th><th>Time</th></tr></thead>
        <tbody>${classRows}</tbody></table></div>
    </div>

    <div class="panel-actions">
      <button class="btn primary" data-act="closecareer">Close · Esc</button>
      <button class="btn ghost cr-reset${confirmReset ? " armed" : ""}" data-act="resetcareer">${confirmReset ? "Click again to erase all stats" : "Reset stats"}</button>
    </div>
  </div>`;
}

export const CAREER_CSS = `
.cr { max-width: 980px; }
.cr-tiles { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 18px; }
.cr-tile { padding: 14px 14px 12px; border-radius: 12px; background: var(--surface-2); border: 1px solid var(--line);
  display: flex; flex-direction: column; gap: 2px; animation: rise .25s var(--ease) both; }
.cr-tile:nth-child(2) { animation-delay: .04s; } .cr-tile:nth-child(3) { animation-delay: .08s; } .cr-tile:nth-child(4) { animation-delay: .12s; }
.cr-tile span { font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--dim); }
.cr-tile b { font-size: 28px; color: var(--gold); font-family: var(--font-display); }
.cr-tile em { font-style: normal; font-size: 12px; color: var(--muted); }
.cr-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px; }
.cr-wide { grid-column: 1 / -1; }
.cr-bars { display: grid; gap: 7px; }
.cr-bar { display: grid; grid-template-columns: 130px 1fr 52px; gap: 10px; align-items: center; font-size: 13px; }
.cr-bl { color: var(--bone); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cr-bt { height: 8px; border-radius: 99px; background: rgba(0,0,0,.35); overflow: hidden; }
.cr-bt i { display: block; height: 100%; border-radius: 99px; background: var(--gold); transform-origin: left; animation: crgrow .5s var(--ease) both; }
@keyframes crgrow { from { transform: scaleX(0); } }
.cr-bar b { text-align: right; color: var(--gold); }
.cr-empty { color: var(--muted); font-size: 14px; }
.cr-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.cr-table th { text-align: left; font-size: 10px; letter-spacing: 1.4px; text-transform: uppercase; color: var(--dim); font-weight: 600; padding: 0 8px 6px; }
.cr-table td { padding: 6px 8px; border-top: 1px dashed var(--line); }
.cr-table td:not(:first-child), .cr-table th:not(:first-child) { text-align: right; }
.cr-table .kanji { font-size: 15px; margin-right: 4px; }
.cr-reset { color: var(--muted); }
.cr-reset.armed { color: #fff; background: var(--crimson); border-color: var(--crimson); }
@media (max-width: 720px) {
  .cr-tiles { grid-template-columns: 1fr 1fr; }
  .cr-grid { grid-template-columns: 1fr; }
  .cr-bar { grid-template-columns: 100px 1fr 44px; }
}
@media (prefers-reduced-motion: reduce) { .cr-tile, .cr-bt i { animation: none; } }
`;
