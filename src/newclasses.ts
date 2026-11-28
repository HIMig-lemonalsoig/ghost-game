import { drawChar, hasBody, spritesReady } from "./sprites";
// ─── Step 5 classes (2026-11-27) ─────────────────────────────────────────────
// Six playstyles the roster didn't have (docs/CONTENT_RESEARCH.md C4 / C5e):
//   teppo   Teppō        matchlock gunner   — every 4th shot is a piercing matchlock blast · ult: Three Ranks Fire (volley lane ×3)
//   takajo  Takajō       falconer (pet)     — a hawk dives on a foe every 3s            · ult: Sky Hunt (five hawks, 6s)
//   karakuri Karakuri-shi puppeteer (turret) — a wind-up turret every 12s                 · ult: Clockwork Battalion (three turrets, 8s)
//   bakuto  Bakuto       gambler (luck)     — +luck and a lucky die each wave            · ult: Roll of Fate (two dice: thunder / crits / jackpot)
//   rikishi Rikishi      sumo (control)     — +HP; dashing shoves and stuns foes         · ult: Dohyō Stomp (three pull-in slams)
//   sumie   Sumi-e Painter ink (summoner)   — every 5th hit paints a slowing ink pool    · ult: Living Ink (a painted tiger hunts, 6s)
// Ult damage goes through g.ultDmg / g.ultDmgRaw, so ULT_CLASS_MUL tunes each one
// toward the shared 60-grunt budget.
/* eslint-disable @typescript-eslint/no-explicit-any */

export type NewClassId = "teppo" | "takajo" | "karakuri" | "bakuto" | "rikishi" | "sumie";
const TAU = Math.PI * 2;

interface Pet { kind: "hawk" | "turret" | "tiger"; x: number; y: number; ang: number; life: number; cd: number; target: number | null; dive: number; hx: number; hy: number; ult: boolean; }
interface Volley { t: number; n: number; ang: number; x: number; y: number; }
interface Ink { x: number; y: number; t: number; life: number; r: number; }

const S = (g: any) => (g.nc ??= { pets: [] as Pet[], volleys: [] as Volley[], inks: [] as Ink[], shots: 0, hits: 0, hawkCd: 2, turretCd: 6, stomps: 0, stompT: 0, fortuneT: 0, dieBuff: "" });

/** Class start bonuses. */
export function startNewClass(g: any, cls: string) {
  const P = g.perks;
  switch (cls) {
    case "teppo": P.critChance += 0.10; break;
    case "takajo": P.speedMul *= 1.05; S(g).pets.push(mkPet("hawk", g.player.pos.x, g.player.pos.y, false)); break;
    case "karakuri": P.maxHpBonus += 10; break;
    case "bakuto": P.luck += 0.2; break;
    case "rikishi": P.maxHpBonus += 40; P.speedMul *= 0.94; P.knockbackMul = (P.knockbackMul ?? 1) * 1.3; break;
    case "sumie": P.abilityHaste = (P.abilityHaste ?? 0) + 0.1; break;
  }
}
const mkPet = (kind: Pet["kind"], x: number, y: number, ult: boolean, life = Infinity): Pet => ({ kind, x, y, ang: Math.random() * TAU, life, cd: 0.4 + Math.random() * 0.5, target: null, dive: 0, hx: x, hy: y, ult });

/** Ultimates. Returns true when it handled the class. */
export function castNewUlt(g: any, cls: string): boolean {
  const st = S(g), p = g.player;
  switch (cls) {
    case "teppo":
      st.volleys.push({ t: 0, n: g.hasUltPerk("ultc_teppo") ? 4 : 3, ang: p.facing, x: p.pos.x, y: p.pos.y });
      p.invuln = Math.max(p.invuln, 0.6);
      return true;
    case "takajo":
      for (let i = 0; i < (g.hasUltPerk("ultc_takajo") ? 7 : 5); i++) { const a = (i / 5) * TAU; st.pets.push(mkPet("hawk", p.pos.x + Math.cos(a) * 60, p.pos.y + Math.sin(a) * 60, true, 6)); }
      return true;
    case "karakuri":
      for (let i = 0; i < 3; i++) { const a = p.facing + (i - 1) * 1.2; st.pets.push(mkPet("turret", p.pos.x + Math.cos(a) * 70, p.pos.y + Math.sin(a) * 70, true, g.hasUltPerk("ultc_karakuri") ? 11 : 8)); }
      g.cameraShake = Math.max(g.cameraShake, 0.3);
      return true;
    case "bakuto": rollFate(g); return true;
    case "rikishi":
      st.stomps = g.hasUltPerk("ultc_rikishi") ? 4 : 3; st.stompT = 0.25; p.invuln = Math.max(p.invuln, 1.2);
      return true;
    case "sumie": {
      const t = mkPet("tiger", p.pos.x + Math.cos(p.facing) * 50, p.pos.y + Math.sin(p.facing) * 50, true, g.hasUltPerk("ultc_sumie") ? 8 : 6);
      st.pets.push(t);
      g.fx.smoke(t.x, t.y, 12, 60, 12, 260, 10);
      return true;
    }
  }
  return false;
}

function rollFate(g: any) {
  const st = S(g), p = g.player;
  const d1 = 1 + Math.floor(Math.random() * 6), d2 = 1 + Math.floor(Math.random() * 6), sum = d1 + d2;
  g.flash(`🎲 ${d1} + ${d2} = ${sum}${sum <= 5 ? " · Thunder of Heaven" : sum <= 8 ? " · Fortune's Edge" : " · Jackpot!"}`);
  if (sum <= 5) {   // lightning on every foe near you, twice
    for (let k = 0; k < 2; k++) for (const e of g.enemies) {
      if (e.state === "dead" || Math.hypot(e.pos.x - p.pos.x, e.pos.y - p.pos.y) > 620) continue;
      g.fx.bolt(e.pos.x, e.pos.y - 240, e.pos.x, e.pos.y, 52, 0.3);
      g.dealDamage(e, g.ultDmg(11), -Math.PI / 2, e.isBoss ? 20 : 120);
    }
    g.cameraShake = Math.max(g.cameraShake, 0.5);
  } else if (sum <= 8) {   // 6s: every hit crits, and crits carry bonus ult damage
    st.fortuneT = g.hasUltPerk("ultc_bakuto") ? 8 : 6;
  } else {   // jackpot: a golden blast and a shower of coins
    const R = 280 * g.areaMul();
    for (const e of g.enemies) {
      if (e.state === "dead" || Math.hypot(e.pos.x - p.pos.x, e.pos.y - p.pos.y) > R + e.size) continue;
      g.dealDamage(e, g.ultDmg(24), Math.atan2(e.pos.y - p.pos.y, e.pos.x - p.pos.x), e.isBoss ? 40 : 300);
    }
    g.stats.mon += 10 + g.stats.wave * 3;
    g.fx.shockwave(p.pos.x, p.pos.y, R, { hue: 45, light: 70, life: 0.5, width: 14, lines: 18 });
    g.fx.burst(p.pos.x, p.pos.y, { count: 40, hue: 45, light: 65, speed: 320, life: 0.8, grav: 300 });
    g.cameraShake = Math.max(g.cameraShake, 0.6);
  }
}

/** True while one of these classes' ults is still running. */
export const newUltActive = (g: any) => {
  const st = S(g);
  return st.volleys.length > 0 || st.stomps > 0 || st.fortuneT > 0 || st.pets.some((p: Pet) => p.ult && p.life > 0);
};
/** Bakuto Fortune's Edge: forced crits + empowered hits. */
export const fortuneActive = (g: any) => S(g).fortuneT > 0;

/** Per-frame: signatures, pets, volleys, stomps, ink. */
export function updateNewClasses(g: any, dt: number) {
  const cls = g.stats.classId, st = S(g), p = g.player;
  if (!p) return;
  st.fortuneT = Math.max(0, st.fortuneT - dt);
  // Takajō signature hawk respawns if missing.
  if (cls === "takajo" && !st.pets.some((q: Pet) => q.kind === "hawk" && !q.ult)) st.pets.push(mkPet("hawk", p.pos.x, p.pos.y, false));
  // Karakuri signature turret every 12s.
  if (cls === "karakuri") {
    st.turretCd -= dt * (1 + (g.perks.abilityHaste ?? 0));
    if (st.turretCd <= 0 && g.enemies.some((e: any) => e.state !== "dead")) {
      st.turretCd = 12;
      st.pets.push(mkPet("turret", p.pos.x + Math.cos(p.facing + Math.PI) * 40, p.pos.y + Math.sin(p.facing + Math.PI) * 40, false, 6));
    }
  }
  // Pets
  for (const q of st.pets) {
    q.life -= dt;
    if (q.kind === "turret") {
      q.cd -= dt;
      const t = nearest(g, q.x, q.y, 520);
      if (t) q.ang = Math.atan2(t.pos.y - q.y, t.pos.x - q.x);
      if (t && q.cd <= 0) {
        q.cd = q.ult ? 0.4 : 0.7;
        const dmg = q.ult ? g.ultDmgRaw(1.6) : g.perks.damage * 0.6 + 1;
        g.fx.streakLine(q.x, q.y, t.pos.x, t.pos.y, 190, 85, 3, 0.12);
        if (q.ult) g.dmgSrcOverride = "Ultimate";
        g.dealDamage(t, dmg, q.ang, 30);
        g.dmgSrcOverride = null;
      }
      continue;
    }
    if (q.kind === "hawk") {
      if (q.dive > 0) {   // diving on its target
        const t = g.enemies.find((e: any) => e.id === q.target && e.state !== "dead");
        if (!t) { q.dive = 0; continue; }
        q.dive -= dt;
        q.x += (t.pos.x - q.x) * Math.min(1, dt * 12); q.y += (t.pos.y - q.y) * Math.min(1, dt * 12);
        q.ang = Math.atan2(t.pos.y - q.y, t.pos.x - q.x);
        if (q.dive <= 0) {
          const dmg = q.ult ? g.ultDmgRaw(1.7) : g.perks.damage * 1.2 + 2;
          if (q.ult) g.dmgSrcOverride = "Ultimate"; else g.dmgSrcOverride = "Hunting Hawk";
          g.dealDamage(t, dmg, q.ang, 60);
          g.dmgSrcOverride = null;
          g.fx.burst(t.pos.x, t.pos.y, { count: 6, hue: 35, light: 75, speed: 140, life: 0.3 });
          q.cd = q.ult ? 0.5 : 3;
        }
        continue;
      }
      // circle above you
      q.ang += dt * (q.ult ? 3 : 2);
      const r = q.ult ? 90 : 55;
      q.x += (p.pos.x + Math.cos(q.ang) * r - q.x) * Math.min(1, dt * 6);
      q.y += (p.pos.y + Math.sin(q.ang) * r * 0.7 - q.y) * Math.min(1, dt * 6);
      q.cd -= dt;
      if (q.cd <= 0) {
        const t = q.ult ? randomFoe(g, p.pos.x, p.pos.y, 520) : nearest(g, p.pos.x, p.pos.y, 380);
        if (t) { q.target = t.id; q.dive = 0.28; } else q.cd = 0.3;
      }
      continue;
    }
    if (q.kind === "tiger") {   // a painted tiger: pounces from foe to foe, leaving ink
      q.cd -= dt;
      let t = g.enemies.find((e: any) => e.id === q.target && e.state !== "dead");
      if (!t) { t = nearest(g, q.x, q.y, 600); q.target = t ? t.id : null; }
      if (t) {
        const d = Math.hypot(t.pos.x - q.x, t.pos.y - q.y);
        q.ang = Math.atan2(t.pos.y - q.y, t.pos.x - q.x);
        if (d > 40) { q.x += Math.cos(q.ang) * 330 * dt; q.y += Math.sin(q.ang) * 330 * dt; }
        if (d < 60 && q.cd <= 0) {
          q.cd = 0.6;
          g.dmgSrcOverride = "Ultimate"; g.dealDamage(t, g.ultDmgRaw(7.5), q.ang, 120); g.dmgSrcOverride = null;
          g.fx.slash(t.pos.x, t.pos.y, q.ang, 40, Math.PI * 0.9, 1, { hue: 0, sat: 0, light: 12, width: 8, life: 0.25 });
          st.inks.push({ x: t.pos.x, y: t.pos.y, t: 0, life: 3, r: 50 });
        }
      } else { q.x += (p.pos.x - q.x) * dt * 3; q.y += (p.pos.y - q.y) * dt * 3; }
    }
  }
  st.pets = st.pets.filter((q: Pet) => q.life > 0);
  // Teppō volleys: a rank of ghost gunners fires down a lane.
  for (const v of st.volleys) {
    const before = v.t; v.t += dt;
    for (let k = 0; k < v.n; k++) {
      const at = 0.25 + k * 0.38;
      if (before < at && v.t >= at) volleyFire(g, v);
    }
  }
  st.volleys = st.volleys.filter((v: Volley) => v.t < 0.35 + v.n * 0.38);
  // Rikishi stomps: pull in, then slam.
  if (st.stomps > 0) {
    st.stompT -= dt;
    const R = 270 * g.areaMul();
    for (const e of g.enemies) {   // the dohyō drags foes toward you between stomps
      if (e.state === "dead" || e.isBoss) continue;
      const dx = p.pos.x - e.pos.x, dy = p.pos.y - e.pos.y, d = Math.hypot(dx, dy);
      if (d < R && d > 50) { e.pos.x += (dx / d) * 260 * dt; e.pos.y += (dy / d) * 260 * dt; }
    }
    if (st.stompT <= 0) {
      st.stomps--; st.stompT = 0.6;
      for (const e of g.enemies) {
        if (e.state === "dead" || Math.hypot(e.pos.x - p.pos.x, e.pos.y - p.pos.y) > R + e.size) continue;
        g.dealDamage(e, g.ultDmg(14), Math.atan2(e.pos.y - p.pos.y, e.pos.x - p.pos.x), e.isBoss ? 30 : 160);
        e.stunTimer = Math.max(e.stunTimer, e.isBoss ? 0.2 : 0.6);
      }
      g.fx.shockwave(p.pos.x, p.pos.y, R, { hue: 25, light: 55, life: 0.45, width: 12, lines: 14 });
      g.fx.ground(p.pos.x, p.pos.y, R * 0.7, 25, 1.4);
      g.cameraShake = Math.max(g.cameraShake, 0.55);
    }
  }
  // Ink pools slow foes inside.
  for (const k of st.inks) {
    k.t += dt;
    for (const e of g.enemies) if (e.state !== "dead" && Math.hypot(e.pos.x - k.x, e.pos.y - k.y) < k.r) e.slowRemaining = Math.max(e.slowRemaining, 0.4);
  }
  st.inks = st.inks.filter((k: Ink) => k.t < k.life);
}

function volleyFire(g: any, v: Volley) {
  const ux = Math.cos(v.ang), uy = Math.sin(v.ang), L = 900, W = 80 * g.areaMul();
  for (const e of g.enemies) {
    if (e.state === "dead") continue;
    const rx = e.pos.x - v.x, ry = e.pos.y - v.y, along = rx * ux + ry * uy;
    if (along < -20 || along > L) continue;
    if (Math.abs(-rx * uy + ry * ux) > W + e.size) continue;
    g.dealDamage(e, g.ultDmg(9), v.ang, e.isBoss ? 30 : 140);
  }
  for (let i = -2; i <= 2; i++) {   // five muzzle flashes along the rank
    const ox = -uy * i * 28, oy = ux * i * 28;
    g.fx.streakLine(v.x + ox, v.y + oy, v.x + ox + ux * L, v.y + oy + uy * L, 40, 92, 4, 0.18);
    g.fx.smoke(v.x + ox + ux * 20, v.y + oy + uy * 20, 2, 18, 70, 30, 10);
  }
  g.cameraShake = Math.max(g.cameraShake, 0.35);
}

const nearest = (g: any, x: number, y: number, maxD: number) => {
  let best: any = null, bd = maxD;
  for (const e of g.enemies) { if (e.state === "dead") continue; const d = Math.hypot(e.pos.x - x, e.pos.y - y); if (d < bd) { bd = d; best = e; } }
  return best;
};
const randomFoe = (g: any, x: number, y: number, maxD: number) => {
  const list = g.enemies.filter((e: any) => e.state !== "dead" && Math.hypot(e.pos.x - x, e.pos.y - y) < maxD);
  return list.length ? list[Math.floor(Math.random() * list.length)] : null;
};

// ── Signature hooks ──
/** Teppō: every 4th projectile is a matchlock blast. */
export function onShotNewClass(g: any, proj: any) {
  if (g.stats.classId !== "teppo") return;
  const st = S(g);
  if (++st.shots % 4 !== 0) return;
  proj.damage *= 3; proj.pierce = true;
  g.fx.smoke(proj.pos.x, proj.pos.y, 4, 22, 75, 30, 10);
  g.fx.burst(proj.pos.x, proj.pos.y, { count: 8, hue: 35, light: 70, speed: 220, life: 0.25 });
  g.cameraShake = Math.max(g.cameraShake, 0.2);
}
/** Sumi-e: every 5th hit paints a slowing ink pool. */
export function onHitNewClass(g: any, e: any) {
  if (g.stats.classId !== "sumie") return;
  const st = S(g);
  if (++st.hits % 5 !== 0) return;
  st.inks.push({ x: e.pos.x, y: e.pos.y, t: 0, life: 2.5, r: 46 * g.areaMul() });
}
/** Rikishi: a dash shoves foes aside and stuns them. */
export function onDashNewClass(g: any, ang: number) {
  if (g.stats.classId !== "rikishi") return;
  const p = g.player.pos;
  for (const e of g.enemies) {
    if (e.state === "dead") continue;
    const rx = e.pos.x - p.x, ry = e.pos.y - p.y, along = rx * Math.cos(ang) + ry * Math.sin(ang);
    if (along < 0 || along > 200 || Math.abs(-rx * Math.sin(ang) + ry * Math.cos(ang)) > 50 + e.size) continue;
    const side = (-rx * Math.sin(ang) + ry * Math.cos(ang)) >= 0 ? 1 : -1;
    e.pos.x += -Math.sin(ang) * side * 60; e.pos.y += Math.cos(ang) * side * 60;
    e.stunTimer = Math.max(e.stunTimer, e.isBoss ? 0.15 : 0.5);
  }
}
/** Bakuto: a lucky die every wave. */
export function onWaveStartNewClass(g: any, wave: number) {
  if (g.stats.classId !== "bakuto" || wave <= 1) return;
  const st = S(g), P = g.perks;
  // undo last wave's buff
  if (st.dieBuff === "dmg") P.classDamageMul /= 1.15;
  if (st.dieBuff === "crit") P.critChance -= 0.1;
  if (st.dieBuff === "spd") P.speedMul /= 1.1;
  if (st.dieBuff === "def") P.defense -= 3;
  const r = 1 + Math.floor(Math.random() * 6);
  const buff = ["", "dmg", "crit", "spd", "def", "coin", "ult"][r];
  st.dieBuff = buff;
  if (buff === "dmg") P.classDamageMul *= 1.15;
  if (buff === "crit") P.critChance += 0.1;
  if (buff === "spd") P.speedMul *= 1.1;
  if (buff === "def") P.defense += 3;
  if (buff === "coin") g.stats.mon += 15 + wave * 3;
  if (buff === "ult") g.addUltCharge(g.stats.ultMax * 0.3);
  const label = { dmg: "+15% damage", crit: "+10% crit", spd: "+10% speed", def: "+3 defense", coin: "a purse of coins", ult: "+30% ultimate" }[buff as "dmg"];
  g.flash(`🎲 Lucky die: ${r} · ${label} this wave`);
}

// ── Drawing (world space) ──
export function drawNewClasses(g: any, ctx: CanvasRenderingContext2D) {
  const st = g.nc; if (!st) return;
  const t = g.elapsed as number, p = g.player?.pos;
  for (const k of st.inks) {
    const a = Math.min(1, (k.life - k.t) / 0.6) * 0.55;
    ctx.fillStyle = `rgba(14, 10, 22, ${a})`;
    ctx.beginPath();
    for (let i = 0; i <= 24; i++) { const an = (i / 24) * TAU, r = k.r * (1 + 0.12 * Math.sin(an * 5 + k.x)); if (i) ctx.lineTo(k.x + Math.cos(an) * r, k.y + Math.sin(an) * r); else ctx.moveTo(k.x + Math.cos(an) * r, k.y + Math.sin(an) * r); }
    ctx.fill();
  }
  if (p && st.stomps > 0) {   // the dohyō ring under you
    ctx.save(); ctx.strokeStyle = "hsla(35, 55%, 70%, .7)"; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.arc(p.x, p.y, 270 * g.areaMul(), 0, TAU); ctx.stroke();
    ctx.strokeStyle = "hsla(35, 55%, 50%, .35)"; ctx.lineWidth = 14; ctx.beginPath(); ctx.arc(p.x, p.y, 270 * g.areaMul() - 10, 0, TAU); ctx.stroke(); ctx.restore();
  }
  for (const v of st.volleys) {   // ghost gunners in a rank behind you
    const ux = Math.cos(v.ang), uy = Math.sin(v.ang), fade = Math.min(1, v.t / 0.2) * Math.max(0, 1 - Math.max(0, v.t - (0.25 + v.n * 0.38)) / 0.1);
    ctx.save(); ctx.globalAlpha = 0.75 * fade;
    const ghosts = g.useSprites && spritesReady();
    for (let i = -2; i <= 2; i++) {
      const x = v.x - ux * 30 - uy * i * 28, y = v.y - uy * 30 + ux * i * 28;
      if (ghosts) {   // blue ink copies of you, matchlocks raised
        g.ghostLook = { variant: "spirit", outline: "hsl(210, 80%, 72%)" };
        g.drawPlayerGhost(x, y, v.ang, 0.75 * fade, 0.5, 1);
        g.ghostLook = null;
        continue;
      }
      ctx.fillStyle = "hsla(210, 30%, 80%, .55)"; ctx.beginPath(); ctx.arc(x, y, 11, 0, TAU); ctx.fill();
      ctx.strokeStyle = "hsl(30, 40%, 35%)"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + ux * 30, y + uy * 30); ctx.stroke();   // matchlock barrel
    }
    ctx.restore();
  }
  if (st.fortuneT > 0 && p) {   // gold dice orbiting you
    ctx.save();
    for (let i = 0; i < 2; i++) { const a = t * 3 + i * Math.PI; const x = p.x + Math.cos(a) * 34, y = p.y + Math.sin(a) * 22 - 8;
      ctx.fillStyle = "hsl(45, 90%, 62%)"; ctx.fillRect(x - 6, y - 6, 12, 12); ctx.fillStyle = "#3a1d06"; ctx.beginPath(); ctx.arc(x, y, 1.8, 0, TAU); ctx.fill(); }
    ctx.restore();
  }
  const PET_ART: Record<string, { id: "hawk" | "turret" | "inktiger"; h: number; fps: number }> = {
    hawk: { id: "hawk", h: 30, fps: 14 }, turret: { id: "turret", h: 34, fps: 8 }, tiger: { id: "inktiger", h: 46, fps: 14 },
  };
  for (const q of st.pets as Pet[]) {
    const art = PET_ART[q.kind];
    if (art && g.useSprites && spritesReady() && hasBody(art.id)) {   // pixel-art pets
      ctx.save(); ctx.translate(q.x, q.y + art.h * 0.45);
      const anim = art.fps ? "Walk" : "Idle";
      drawChar(ctx, art.id, anim, { frame: t * (art.fps || 1) + q.hx, flip: Math.cos(q.ang) < 0, height: art.h,
        outline: q.ult ? { color: "hsl(45, 95%, 65%)", alpha: 0.6 } : undefined });
      ctx.restore();
      continue;
    }
    ctx.save(); ctx.translate(q.x, q.y);
    if (q.kind === "hawk") {
      ctx.rotate(q.ang + Math.PI / 2 * (q.dive > 0 ? 0 : 1));
      const flap = Math.sin(t * (q.dive > 0 ? 4 : 14) + q.hx) * 0.5;
      ctx.fillStyle = q.ult ? "hsl(40, 60%, 70%)" : "hsl(30, 35%, 45%)";
      for (const sd of [-1, 1]) { ctx.save(); ctx.scale(sd, 1); ctx.rotate(flap); ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(10, -6, 20, 2); ctx.quadraticCurveTo(10, 2, 0, 4); ctx.fill(); ctx.restore(); }
      ctx.fillStyle = "hsl(30, 25%, 25%)"; ctx.beginPath(); ctx.ellipse(0, 0, 4, 9, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = "hsl(45, 90%, 60%)"; ctx.beginPath(); ctx.arc(0, -8, 2, 0, TAU); ctx.fill();
    } else if (q.kind === "turret") {
      ctx.fillStyle = "hsl(30, 35%, 30%)"; ctx.beginPath(); ctx.arc(0, 0, 13, 0, TAU); ctx.fill();
      ctx.strokeStyle = q.ult ? "hsl(45, 85%, 60%)" : "hsl(190, 45%, 60%)"; ctx.lineWidth = 2; ctx.stroke();
      ctx.save(); ctx.rotate(t * 6); ctx.strokeStyle = "hsl(40, 30%, 75%)"; ctx.lineWidth = 2;   // wind-up key
      ctx.beginPath(); ctx.moveTo(-6, 0); ctx.lineTo(6, 0); ctx.stroke(); ctx.restore();
      ctx.rotate(q.ang); ctx.fillStyle = "hsl(210, 10%, 55%)"; ctx.fillRect(6, -3, 16, 6);   // barrel
    } else {
      ctx.rotate(q.ang);
      ctx.fillStyle = "hsla(0, 0%, 6%, .9)";   // brush-stroke tiger
      ctx.beginPath(); ctx.ellipse(0, 0, 24, 12, 0, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.arc(22, 0, 10, 0, TAU); ctx.fill();
      ctx.strokeStyle = "hsla(0, 0%, 6%, .9)"; ctx.lineWidth = 5; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(-22, 0); ctx.quadraticCurveTo(-36, -14 + Math.sin(t * 8) * 6, -44, -4); ctx.stroke();
      ctx.strokeStyle = "hsla(355, 80%, 55%, .9)"; ctx.lineWidth = 2;   // a dab of red seal ink for its eyes
      ctx.beginPath(); ctx.moveTo(26, -4); ctx.lineTo(29, -3); ctx.moveTo(26, 4); ctx.lineTo(29, 3); ctx.stroke();
      ctx.strokeStyle = "hsla(40, 30%, 85%, .5)"; ctx.lineWidth = 2;   // stripes
      for (const sx of [-12, -2, 8]) { ctx.beginPath(); ctx.moveTo(sx, -11); ctx.lineTo(sx + 3, -3); ctx.stroke(); }
    }
    ctx.restore();
  }
}

/** Reset per-run state. */
export const resetNewClasses = (g: any) => { g.nc = undefined; };
