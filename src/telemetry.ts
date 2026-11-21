// ─── Balance tracking ─────────────────────────────────────────────────────────
// Slay the Spire–style pick-rate data, saved per browser. Records how often
// each perk / shop item is offered vs. picked, which weapons runs start with,
// how far each class gets per difficulty, and what kills the player.
// Nothing leaves the browser — the dev panel can show it or copy it as JSON.
import { PERK_POOL, ABILITY_POOL, SHOP_POOL, getClass, DIFFICULTIES } from "./GhostGame";
import type { GhostGame, GameEvent, Difficulty, ClassId } from "./GhostGame";
import { DUO_BY_ID } from "./content/duos";

const KEY = "ghostgame.telemetry.v1";

interface Rate { offered: number; picked: number; }
interface ClassRow { runs: number; waveSum: number; best: number; }
export interface Telemetry {
  v: 1;
  since: number;
  perks: Record<string, Rate>;
  shop: Record<string, Rate>;
  startWeapons: Record<string, number>;
  classes: Record<string, ClassRow>;        // "classId@difficulty"
  deaths: Record<string, { count: number; waveSum: number }>;
  banished: Record<string, number>;
  rerolls: number;
  skips: number;
  choices: Record<string, number>;   // OMEN / ARENA SHRINE picks
}
const fresh = (): Telemetry => ({ v: 1, since: Date.now(), perks: {}, shop: {}, startWeapons: {}, classes: {}, deaths: {}, banished: {}, rerolls: 0, skips: 0, choices: {} });

let data: Telemetry = fresh();
try {
  const raw = localStorage.getItem(KEY);
  if (raw) data = { ...fresh(), ...JSON.parse(raw) };
} catch { /* storage blocked */ }
let dirty = false;
const save = () => {
  if (!dirty) return;
  dirty = false;
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { /* storage blocked */ }
};
setInterval(save, 3000);
window.addEventListener("pagehide", save);

export const getTelemetry = () => data;
export function resetTelemetry() { data = fresh(); dirty = true; save(); }

const bump = (m: Record<string, Rate>, id: string, f: keyof Rate) => { (m[id] ??= { offered: 0, picked: 0 })[f]++; };

/** Wire a game's events into the tracker. Dev runs are ignored. */
export function trackGame(g: GhostGame) {
  g.onEvent = (ev: GameEvent) => {
    if (g.devMode) return;
    if (ev.t === "offer") for (const id of new Set(ev.ids)) bump(ev.kind === "perk" ? data.perks : data.shop, id, "offered");
    else if (ev.t === "pick") bump(ev.kind === "perk" ? data.perks : data.shop, ev.id, "picked");
    else if (ev.t === "reroll") data.rerolls++;
    else if (ev.t === "skip") data.skips++;
    else if (ev.t === "choice") data.choices[ev.id] = (data.choices[ev.id] ?? 0) + 1;
    else if (ev.t === "banish") data.banished[ev.id] = (data.banished[ev.id] ?? 0) + 1;
    else if (ev.t === "death") {
      const d = (data.deaths[ev.by] ??= { count: 0, waveSum: 0 });
      d.count++; d.waveSum += ev.wave;
      const row = (data.classes[`${g.stats.classId}@${g.difficulty}`] ??= { runs: 0, waveSum: 0, best: 0 });
      row.runs++; row.waveSum += ev.wave; row.best = Math.max(row.best, ev.wave);
      dirty = true; save();
      return;
    }
    dirty = true;
  };
}

export function trackStartWeapons(weapons: string[]) {
  for (const w of weapons) data.startWeapons[w] = (data.startWeapons[w] ?? 0) + 1;
  dirty = true;
}

// ─── Report ───────────────────────────────────────────────────────────────────
const perkName = (id: string) => PERK_POOL.find(p => p.id === id)?.name ?? ABILITY_POOL.find(a => a.id === id)?.name ?? (DUO_BY_ID[id] ? `${DUO_BY_ID[id].name} (duo)` : id);
const shopName = (id: string) => SHOP_POOL.find(p => p.effect === id)?.name ?? id;

function rateTable(m: Record<string, Rate>, name: (id: string) => string, minOffers: number): string {
  const rows = Object.entries(m).filter(([, r]) => r.offered >= minOffers)
    .map(([id, r]) => ({ id, ...r, rate: r.picked / r.offered })).sort((a, b) => b.rate - a.rate);
  if (!rows.length) return `<p class="dr-empty">Not enough data yet (each needs ${minOffers}+ offers).</p>`;
  const flag = (r: number) => (r >= 0.6 ? `<span class="dr-hot">must-pick?</span>` : r < 0.1 ? `<span class="dr-cold">trap?</span>` : "");
  return `<table class="dr-t"><tr><th>Name</th><th>Offered</th><th>Picked</th><th>Rate</th><th></th></tr>${
    rows.map(r => `<tr><td>${name(r.id)}</td><td>${r.offered}</td><td>${r.picked}</td><td>${Math.round(r.rate * 100)}%</td><td>${flag(r.rate)}</td></tr>`).join("")
  }</table>`;
}

export function reportHTML(): string {
  const classRows = Object.entries(data.classes).map(([k, r]) => {
    const [cid, diff] = k.split("@");
    let cname = cid;
    try { cname = getClass(cid as ClassId).name; } catch { /* unknown id */ }
    return { cname, diff: DIFFICULTIES[diff as Difficulty]?.name ?? diff, ...r, avg: r.waveSum / Math.max(1, r.runs) };
  }).sort((a, b) => b.avg - a.avg);
  const avgs = classRows.map(r => r.avg).sort((a, b) => a - b);
  const median = avgs.length ? avgs[Math.floor(avgs.length / 2)] : 0;
  const deaths = Object.entries(data.deaths).sort((a, b) => b[1].count - a[1].count);
  const totalDeaths = deaths.reduce((n, [, d]) => n + d.count, 0);
  const weapons = Object.entries(data.startWeapons).sort((a, b) => b[1] - a[1]);
  return `
    <p class="dr-sub">Tracking since ${new Date(data.since).toLocaleDateString()} · ${totalDeaths} finished runs · dev runs excluded</p>
    <h4>Classes (average wave reached)</h4>
    ${classRows.length ? `<table class="dr-t"><tr><th>Class</th><th>Difficulty</th><th>Runs</th><th>Avg wave</th><th>Best</th><th></th></tr>${classRows.map(r =>
      `<tr><td>${r.cname}</td><td>${r.diff}</td><td>${r.runs}</td><td>${r.avg.toFixed(1)}</td><td>${r.best}</td><td>${
        median && r.runs >= 3 && Math.abs(r.avg - median) / median > 0.25 ? `<span class="${r.avg > median ? "dr-hot" : "dr-cold"}">${r.avg > median ? "strong?" : "weak?"}</span>` : ""}</td></tr>`).join("")}</table>` : `<p class="dr-empty">No finished runs yet.</p>`}
    <h4>What kills you</h4>
    ${deaths.length ? `<table class="dr-t"><tr><th>Killer</th><th>Deaths</th><th>Share</th><th>Avg wave</th></tr>${deaths.map(([by, d]) =>
      `<tr><td>${by}</td><td>${d.count}</td><td>${Math.round((d.count / totalDeaths) * 100)}%${d.count / totalDeaths > 0.3 && totalDeaths >= 5 ? ` <span class="dr-hot">check</span>` : ""}</td><td>${(d.waveSum / d.count).toFixed(1)}</td></tr>`).join("")}</table>` : `<p class="dr-empty">No deaths recorded yet.</p>`}
    <h4>Level-up picks</h4>${rateTable(data.perks, perkName, 5)}
    <h4>Level-up control</h4>
    <p class="dr-sub">${data.rerolls} rerolls · ${data.skips} skips · ${Object.values(data.banished).reduce((a, b) => a + b, 0)} banishes</p>
    ${Object.keys(data.banished).length ? `<table class="dr-t"><tr><th>Most banished</th><th>Times</th></tr>${Object.entries(data.banished).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([id, n]) =>
      `<tr><td>${perkName(id)}</td><td>${n}</td></tr>`).join("")}</table>` : ""}
    <h4>Omens & arena shrines</h4>
    ${Object.keys(data.choices).length ? `<table class="dr-t"><tr><th>Choice</th><th>Times</th></tr>${Object.entries(data.choices).sort((a, b) => b[1] - a[1]).map(([id, n]) =>
      `<tr><td>${id.replace(/^(omen|shrine):/, (_, k) => k === "omen" ? "Omen · " : "Shrine · ").replace(/_/g, " ")}</td><td>${n}</td></tr>`).join("")}</table>` : `<p class="dr-empty">No choices recorded yet.</p>`}
    <h4>Shop picks</h4>${rateTable(data.shop, shopName, 5)}
    <h4>Starting weapons</h4>
    ${weapons.length ? `<table class="dr-t"><tr><th>Weapon</th><th>Runs</th></tr>${weapons.map(([w, n]) => `<tr><td>${w}</td><td>${n}</td></tr>`).join("")}</table>` : `<p class="dr-empty">No runs yet.</p>`}
  `;
}
