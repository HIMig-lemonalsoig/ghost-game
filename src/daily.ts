// ─── Daily run (Phase 13) ─────────────────────────────────────────────────────
// Everyone gets the same class, weapons, Vows and seeded run for a given date.
// Unlimited attempts: your best is saved, plus a separate "first attempt"
// record. Shrine blessings are off so it's fair. Everything stays local.
import { CLASSES, CLASS_WEAPON_OPTIONS, SECONDARIES, getClass } from "./GhostGame";
import type { ClassId, SecondaryId } from "./GhostGame";
import { VOWS } from "./content/vows";
import type { VowSet } from "./content/vows";
import { vowScore } from "./content/vows";
import { hashStr, mulberry32 } from "./rng";

const KEY = "ghostgame.daily.v1";

export interface DailySetup { date: string; classId: ClassId; weapons: [SecondaryId, SecondaryId]; vows: VowSet; }
export interface DailyDay { attempts: number; first: number; best: number; bestKills: number; won: boolean; classId: ClassId; }
interface DailySave { days: Record<string, DailyDay>; }

/** Local date key, e.g. "2026-11-20". */
export function todayKey(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
const addDays = (key: string, n: number) => { const [y, m, d] = key.split("-").map(Number); return todayKey(new Date(y, m - 1, d + n)); };

export function dailySetup(date = todayKey()): DailySetup {
  const r = mulberry32(hashStr(`yuken-daily|${date}`));
  const pick = <T>(a: T[]) => a[Math.floor(r() * a.length)];
  const cls = pick(CLASSES).id;
  const opts = [...CLASS_WEAPON_OPTIONS[cls]];
  const main = opts.splice(Math.floor(r() * 2), 1)[0];            // one of the class's two signature weapons
  const alt = opts.splice(Math.floor(r() * opts.length), 1)[0];
  // 2–3 vows at rank 1 (never the harshest one) for a bit of spice.
  const pool = VOWS.filter(v => v.id !== "no_rest");
  const vows: VowSet = {};
  const n = 2 + Math.floor(r() * 2);
  for (let i = 0; i < n && pool.length; i++) vows[pool.splice(Math.floor(r() * pool.length), 1)[0].id] = 1;
  return { date, classId: cls, weapons: [main, alt], vows };
}

const load = (): DailySave => { try { const raw = localStorage.getItem(KEY); if (raw) return { days: {}, ...JSON.parse(raw) }; } catch { /* blocked */ } return { days: {} }; };
let data = load();
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { /* blocked */ } };

export const dailyDay = (date = todayKey()) => data.days[date];

/** Count an attempt as soon as it starts (so quitting still uses up the first try). */
export function startAttempt(date: string, classId: ClassId) {
  const d = (data.days[date] ??= { attempts: 0, first: 0, best: 0, bestKills: 0, won: false, classId });
  d.attempts++;
  save();
}
/** Record a finished (or abandoned) attempt. */
export function recordAttempt(date: string, wave: number, kills: number, won: boolean) {
  const d = data.days[date];
  if (!d) return;
  if (d.attempts === 1 && !d.first) d.first = wave;
  if (wave > d.best || (wave === d.best && kills > d.bestKills)) { d.best = wave; d.bestKills = kills; }
  d.won ||= won;
  save();
}

/** Consecutive days played, ending today (or yesterday if today isn't played yet). */
export function streak(): number {
  let day = todayKey();
  if (!data.days[day]) day = addDays(day, -1);
  let n = 0;
  while (data.days[day]) { n++; day = addDays(day, -1); }
  return n;
}

export function shareText(date: string): string {
  const d = data.days[date], s = dailySetup(date);
  if (!d) return "";
  const st = streak();
  return `Yūken Daily ${date} · ${getClass(s.classId).name}\n${d.won ? "🏆 Victory · " : ""}Best: wave ${d.best} (${d.bestKills} kills) · First try: wave ${d.first || "–"} · ${d.attempts} attempt${d.attempts > 1 ? "s" : ""}${st > 1 ? `\n🔥 ${st}-day streak` : ""}`;
}

export function dailyHTML(): string {
  const date = todayKey(), s = dailySetup(date), d = data.days[date], cls = getClass(s.classId);
  const vowList = Object.keys(s.vows).map(id => VOWS.find(v => v.id === id)!).map(v => `<span class="dl-vow"><span class="kanji">${v.kanji}</span>${v.name}</span>`).join("");
  // Last 28 days calendar (oldest first, today last).
  const cells = Array.from({ length: 28 }, (_, i) => addDays(date, i - 27)).map(k => {
    const day = data.days[k];
    const lvl = !day ? 0 : day.won ? 4 : day.best >= 15 ? 3 : day.best >= 8 ? 2 : 1;
    return `<i class="dl-c l${lvl}${k === date ? " today" : ""}" title="${k}${day ? ` · best wave ${day.best}` : " · not played"}"></i>`;
  }).join("");
  const st = streak();
  return `<div class="panel vow-panel daily" style="text-align:left">
    <div class="panel-title" style="text-align:center">日 DAILY RUN</div>
    <div class="panel-sub" style="text-align:center">${date} · Same run for everyone today · Shrine blessings off</div>
    <div class="dl-setup" style="--accent:${cls.accent}">
      <span class="kanji dl-k">${cls.kanji}</span>
      <div><b class="dl-cls">${cls.name}</b><div class="dim">${cls.role}</div>
        <div class="dl-w">${s.weapons.map(w => `<span><span class="kanji">${SECONDARIES[w].kanji}</span>${SECONDARIES[w].name}</span>`).join("")}</div>
        <div class="dl-vows">${vowList}<span class="dim">Vow score ${vowScore(s.vows)}</span></div></div>
    </div>
    <div class="dl-stats num">
      <div><b>${d?.best ?? "–"}</b><span>Best wave</span></div>
      <div><b>${d?.first || "–"}</b><span>First try</span></div>
      <div><b>${d?.attempts ?? 0}</b><span>Attempts</span></div>
      <div><b>${st}${st ? "🔥" : ""}</b><span>Day streak</span></div>
    </div>
    <div class="dl-cal" aria-label="Last 28 days">${cells}</div>
    <p class="hint" style="text-align:center">Your first attempt is saved separately: make it count. Unlimited retries for your best.</p>
    <div class="panel-actions">
      <button class="btn primary" data-act="startdaily">${d ? "Try again" : "Start daily"} · Enter</button>
      <button class="btn" data-act="copydaily" ${d ? "" : "disabled"}>Copy result</button>
      <button class="btn ghost" data-act="closedaily">Close · Esc</button>
    </div>
  </div>`;
}

export const DAILY_CSS = `
.dl-setup { display: flex; gap: 16px; align-items: center; margin: 16px 0 10px; padding: 14px 16px; border-radius: 12px; background: var(--surface-2); border: 1px solid color-mix(in srgb, var(--accent) 45%, var(--line)); }
.dl-k { font-size: 54px; color: var(--accent); line-height: 1; }
.dl-cls { font-size: 20px; }
.dl-w, .dl-vows { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; align-items: center; font-size: 12.5px; }
.dl-w > span, .dl-vow { padding: 4px 9px; border-radius: 999px; background: rgba(0,0,0,.25); border: 1px solid var(--line); }
.dl-w .kanji, .dl-vow .kanji { margin-right: 5px; color: var(--gold); }
.dl-vow .kanji { color: var(--crimson); }
.dl-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin: 10px 0; }
.dl-stats > div { text-align: center; padding: 10px 6px; border-radius: 10px; background: var(--surface-2); border: 1px solid var(--line); }
.dl-stats b { display: block; font-size: 22px; }
.dl-stats span { font-size: 10.5px; letter-spacing: 1.2px; text-transform: uppercase; color: var(--dim); }
.dl-cal { display: grid; grid-template-columns: repeat(14, 1fr); gap: 4px; margin: 12px auto 4px; max-width: 420px; }
.dl-c { aspect-ratio: 1; border-radius: 4px; background: rgba(255,255,255,.06); }
.dl-c.l1 { background: rgba(232,183,90,.25); } .dl-c.l2 { background: rgba(232,183,90,.45); }
.dl-c.l3 { background: rgba(232,183,90,.7); } .dl-c.l4 { background: var(--gold); }
.dl-c.today { outline: 2px solid var(--bone); outline-offset: 1px; }
.dl-new { font-size: 9.5px; letter-spacing: 1px; color: #111; background: var(--gold); border-radius: 4px; padding: 1px 5px; margin-left: 4px; }
.daily-end { margin-top: 12px; font-size: 14px; color: var(--gold); display: flex; gap: 10px; align-items: center; justify-content: center; flex-wrap: wrap; }
@media (max-width: 560px) { .dl-stats { grid-template-columns: repeat(2, 1fr); } }
`;
