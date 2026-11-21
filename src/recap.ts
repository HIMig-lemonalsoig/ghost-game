// ─── End-of-run recap (Phase 10) ─────────────────────────────────────────────
// Damage dealt by source, a LoL-style death recap (last 10 s + whole run),
// run highlights, a simple "why you lost" tip, and a plain-text summary to share.
import type { GhostGame, GameStats } from "./GhostGame";
import { DIFFICULTIES, BOSS_INFO } from "./GhostGame";
import { ENEMY_LABEL } from "./content/elites";
import { EVOLUTIONS } from "./content/evolutions";
import { DUO_BY_ID } from "./content/duos";

const fmt = (n: number) => n >= 10000 ? `${(n / 1000).toFixed(n >= 100000 ? 0 : 1)}k` : `${Math.round(n)}`;
const esc = (s: string) => s.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));

/** "elite archer" → "Elite Archer", "oni boss" → "Oni Warlord" … */
export function attackerName(by: string): string {
  if (by === "final boss") return "The Shogun (final boss)";
  const boss = /^(\w+) boss$/.exec(by);
  if (boss && BOSS_INFO[boss[1] as keyof typeof BOSS_INFO]) return BOSS_INFO[boss[1] as keyof typeof BOSS_INFO].name;
  const elite = /^elite (\w+)$/.exec(by);
  if (elite) return `Elite ${ENEMY_LABEL[elite[1]] ?? elite[1]}`;
  if (ENEMY_LABEL[by]) return ENEMY_LABEL[by];
  return by.charAt(0).toUpperCase() + by.slice(1);
}

const sorted = (m: Record<string, number>) => Object.entries(m).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);

function bars(m: Record<string, number>, name: (k: string) => string, hue: number, max = 8): string {
  const rows = sorted(m);
  if (!rows.length) return `<p class="rc-empty">Nothing yet.</p>`;
  const total = rows.reduce((n, [, v]) => n + v, 0);
  const top = rows[0][1];
  const shown = rows.slice(0, max);
  const rest = rows.slice(max).reduce((n, [, v]) => n + v, 0);
  if (rest > 0) shown.push(["__rest", rest]);
  return `<div class="rc-bars">${shown.map(([k, v]) => `
    <div class="rc-row"><span class="rc-name">${esc(k === "__rest" ? "Everything else" : name(k))}</span>
      <span class="rc-track"><i style="width:${Math.max(2, (v / top) * 100)}%;background:hsl(${hue} 70% 55%)"></i></span>
      <span class="rc-val num">${fmt(v)} <em>${Math.round((v / total) * 100)}%</em></span></div>`).join("")}</div>`;
}

/** The wave where `by` dealt the most damage to you. */
function worstWave(g: GhostGame, by: string): number {
  let best = 0, wave = g.stats.wave;
  for (const [w, m] of Object.entries(g.run.takenWave)) if ((m[by] ?? 0) > best) { best = m[by]; wave = Number(w); }
  return wave;
}

/** One simple "why you lost" line. */
export function whyLost(g: GhostGame): string {
  const recent = sorted(g.recentTaken());
  const all = sorted(g.run.takenBy);
  const key = (recent[0] ?? all[0])?.[0];
  if (!key) return "";
  const tip =
    /arrow|archer|projectile|talisman|onry/.test(key) ? "Ranged hits add up: dodge sideways, deflect the shots back, or pick a shield perk." :
    key === "final boss" ? "Learn the Shogun's phases and keep your ultimate for when it gets desperate." :
    /boss/.test(key) ? "Watch for the glowing wind-up and dash through the big attacks instead of away from them." :
    /fire|burning|hazard|shockwave/.test(key) ? "Don't stand in fire trails or inside the warning circles." :
    /bomb/.test(key) ? "Kill Bombers before they reach you, or dash away when they start to flash." :
    /^elite/.test(key) ? "Elites are 2.5× tougher: the tip that pops up the first time you meet an affix tells you how to beat it." :
    /assassin/.test(key) ? "Assassins dash in fast: block or deflect when they flash." :
    /heavy/.test(key) ? "Brutes hit hard: stay out of their swing and punish after it." :
    "Keep moving so you don't get surrounded, and grab area damage to clear crowds.";
  return `Most damage came from <b>${esc(attackerName(key))}</b> on wave ${worstWave(g, key)}. ${tip}`;
}

function highlights(g: GhostGame): string[] {
  const r = g.run;
  const evoName = (id: string) => EVOLUTIONS[id as keyof typeof EVOLUTIONS]?.name ?? id;
  const out = [
    `Biggest hit <b class="num">${fmt(r.biggestHit)}</b>`,
    `Best multi-kill <b class="num">${r.bestMultiKill}</b>`,
    `Kills <b class="num">${r.kills}</b>`,
    `Elites slain <b class="num">${r.eliteKills}</b>`,
    `Bosses slain <b class="num">${r.bossKills}</b>`,
    `Chests <b class="num">${r.chests}</b>`,
  ];
  if (r.evolutions.length) out.push(`Evolved <b>${r.evolutions.map(evoName).map(esc).join(", ")}</b>`);
  if (r.duos.length) out.push(`Duos <b>${r.duos.map(d => DUO_BY_ID[d]?.name ?? d).map(esc).join(", ")}</b>`);
  return out;
}

export function recapHTML(g: GhostGame, won: boolean): string {
  const recent = g.recentTaken();
  const killer = g.lastHitBy;
  return `<div class="recap">
    ${won ? "" : `<div class="rc-why">${whyLost(g)}</div>`}
    <div class="rc-chips">${highlights(g).map(h => `<span class="rc-chip">${h}</span>`).join("")}</div>
    <div class="rc-grid">
      <section class="rc-box"><h4>Damage dealt <span class="num">${fmt(g.run.damageDealt)}</span></h4>${bars(g.run.dmgBy, k => k, 42)}</section>
      <section class="rc-box"><h4>${won ? "Damage taken" : `Death recap${killer && killer !== "unknown" ? `<span style="color:var(--crimson)">${esc(attackerName(killer))}</span>` : ""}`}</h4>
        ${won ? "" : `<div class="rc-sub">Last 10 seconds</div>${bars(recent, attackerName, 0, 5)}`}
        <div class="rc-sub">Whole run · <span class="num">${fmt(g.run.damageTaken)}</span></div>${bars(g.run.takenBy, attackerName, 355, 6)}
      </section>
    </div></div>`;
}

/** Plain text for "Copy run summary". */
export function summaryText(g: GhostGame, s: GameStats, won: boolean, mins: number): string {
  const r = g.run;
  const total = Math.max(1, r.damageDealt);
  const lines = [
    `Yūken · ${s.className} · ${DIFFICULTIES[g.difficulty].name}${g.vowScore ? ` · Vow ${g.vowScore}` : ""}${g.endless ? " · Endless" : ""}`,
    won ? `VICTORY on wave ${s.wave}` : `Fell on wave ${s.wave} to ${attackerName(g.lastHitBy)}`,
    `Level ${s.level} · ${r.kills} kills · ${r.eliteKills} elites · ${r.bossKills} bosses · ${mins}m`,
    `Biggest hit ${fmt(r.biggestHit)} · best multi-kill ${r.bestMultiKill}`,
    `Top damage: ${sorted(r.dmgBy).slice(0, 3).map(([k, v]) => `${k} ${Math.round((v / total) * 100)}%`).join(", ") || "none"}`,
  ];
  if (r.evolutions.length) lines.push(`Evolutions: ${r.evolutions.map(id => EVOLUTIONS[id as keyof typeof EVOLUTIONS]?.name ?? id).join(", ")}`);
  if (r.duos.length) lines.push(`Duos: ${r.duos.map(d => DUO_BY_ID[d]?.name ?? d).join(", ")}`);
  return lines.join("\n");
}
