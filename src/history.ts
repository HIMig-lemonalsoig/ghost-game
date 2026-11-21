// ─── Run history (Phase 17) ───────────────────────────────────────────────────
// The last 30 finished runs with a compact copy of their end-of-run recap.
import { getClass, DIFFICULTIES } from "./GhostGame";
import type { GhostGame, Difficulty, ClassId } from "./GhostGame";
import { attackerName } from "./recap";

const KEY = "ghostgame.history.v1";
const MAX = 30;

export interface RunRecord {
  id: number; at: number;
  cls: ClassId; diff: Difficulty; vow: number; wave: number; level: number;
  won: boolean; endless: boolean; daily?: string; assist?: number;
  killer: string; kills: number; elites: number; bosses: number; biggestHit: number; time: number;
  dmgBy: [string, number][]; takenBy: [string, number][];
}

let runs: RunRecord[] = [];
try { const raw = localStorage.getItem(KEY); if (raw) runs = JSON.parse(raw); } catch { /* blocked */ }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(runs)); } catch { /* blocked */ } };
const ids = new WeakMap<GhostGame, number>();
const top = (m: Record<string, number>, n: number) => Object.entries(m).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, v]) => [k, Math.round(v)] as [string, number]);

/** Save (or update, e.g. Endless after a win) this game's entry. Dev runs are skipped. */
export function recordRun(g: GhostGame | null) {
  if (!g || g.devMode) return;
  const id = ids.get(g) ?? Date.now();
  ids.set(g, id);
  const won = g.stats.state === "victory" || (g.run.bossByKind.final ?? 0) > 0;
  const rec: RunRecord = {
    id, at: Date.now(), cls: g.stats.classId, diff: g.difficulty, vow: g.vowScore, wave: g.stats.wave, level: g.stats.level,
    won, endless: g.endless, daily: g.daily || undefined, assist: g.assistDR || undefined,
    killer: g.stats.state === "victory" ? "" : g.lastHitBy, kills: g.run.kills, elites: g.run.eliteKills, bosses: g.run.bossKills,
    biggestHit: Math.round(g.run.biggestHit), time: Math.round(g.run.time),
    dmgBy: top(g.run.dmgBy, 6), takenBy: top(g.run.takenBy, 5),
  };
  runs = [rec, ...runs.filter(r => r.id !== id)].slice(0, MAX);
  save();
}
export const getHistory = () => runs;
export function clearHistory() { runs = []; save(); }

const fmt = (n: number) => n >= 10000 ? `${(n / 1000).toFixed(1)}k` : `${Math.round(n)}`;
function bars(rows: [string, number][], name: (k: string) => string, hue: number) {
  if (!rows.length) return `<p class="rc-empty">Nothing recorded.</p>`;
  const total = rows.reduce((a, [, v]) => a + v, 0), max = rows[0][1];
  return `<div class="rc-bars">${rows.map(([k, v]) => `<div class="rc-row"><span class="rc-name">${name(k)}</span>
    <span class="rc-track"><i style="width:${Math.max(2, (v / max) * 100)}%;background:hsl(${hue} 70% 55%)"></i></span>
    <span class="rc-val num">${fmt(v)} <em>${Math.round((v / total) * 100)}%</em></span></div>`).join("")}</div>`;
}

export function historyHTML(openId: number | null): string {
  if (!runs.length) return `<div class="pane cr-wide"><h4>Run history</h4><p class="cr-empty">Your last ${MAX} runs will show up here.</p></div>`;
  const rows = runs.map(r => {
    const k = getClass(r.cls);
    const open = r.id === openId;
    const when = new Date(r.at).toLocaleDateString(undefined, { month: "short", day: "numeric" });
    const tags = [r.daily ? "日 Daily" : "", r.endless ? "∞" : "", r.vow ? `誓${r.vow}` : "", r.assist ? "Assist" : ""].filter(Boolean).join(" · ");
    return `<button class="hist-row${open ? " open" : ""}${r.won ? " won" : ""}" data-hist="${r.id}" aria-expanded="${open}">
        <span class="kanji" style="color:${k.accent}">${k.kanji}</span>
        <span class="h-main"><b>${k.name}</b> <i>${DIFFICULTIES[r.diff]?.name ?? r.diff}${tags ? ` · ${tags}` : ""}</i></span>
        <span class="h-res">${r.won ? "🏆 Victory" : `Wave ${r.wave}`}</span>
        <span class="h-kill">${r.won ? `Wave ${r.wave}` : r.killer ? attackerName(r.killer) : ""}</span>
        <span class="h-top">${r.dmgBy[0] ? r.dmgBy[0][0] : ""}</span>
        <span class="h-date">${when}</span>
      </button>${open ? `<div class="hist-detail">
        <div class="rc-chips">${[`Level <b class="num">${r.level}</b>`, `Kills <b class="num">${r.kills}</b>`, `Elites <b class="num">${r.elites}</b>`, `Bosses <b class="num">${r.bosses}</b>`, `Biggest hit <b class="num">${fmt(r.biggestHit)}</b>`, `Time <b class="num">${Math.floor(r.time / 60)}m</b>`].map(c => `<span class="rc-chip">${c}</span>`).join("")}</div>
        <div class="rc-grid"><section class="rc-box"><h4>Damage dealt</h4>${bars(r.dmgBy, k => k, 42)}</section>
        <section class="rc-box"><h4>Damage taken</h4>${bars(r.takenBy, attackerName, 355)}</section></div></div>` : ""}`;
  }).join("");
  return `<div class="pane cr-wide"><h4>Run history <span class="dim">· last ${runs.length} · tap one for its recap</span></h4><div class="hist">${rows}</div></div>`;
}

export const HISTORY_CSS = `
.hist { display: grid; gap: 4px; }
.hist-row { display: grid; grid-template-columns: 28px 1.6fr 0.9fr 1.2fr 1fr 0.6fr; gap: 8px; align-items: center; text-align: left; width: 100%;
  padding: 8px 10px; border-radius: 9px; border: 1px solid var(--line); background: var(--surface-2); color: var(--bone); font: inherit; font-size: 13px; cursor: pointer; }
.hist-row:hover, .hist-row.open { border-color: var(--line-strong); background: var(--surface-3); }
.hist-row.won { border-color: color-mix(in srgb, var(--gold) 50%, var(--line)); }
.hist-row .kanji { font-size: 20px; }
.hist-row i { font-style: normal; color: var(--dim); font-size: 12px; }
.h-res { font-weight: 700; } .h-kill, .h-top, .h-date { color: var(--muted); font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.hist-detail { padding: 8px 4px 12px; }
@media (max-width: 640px) { .hist-row { grid-template-columns: 28px 1fr auto; } .h-kill, .h-top, .h-date { display: none; } }
`;
