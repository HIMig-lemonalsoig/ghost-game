// ─── Step 4 enemies (2026-11-27) ─────────────────────────────────────────────
// Eight new yokai, each with ONE clear role and a readable telegraph
// (docs/CONTENT_RESEARCH.md C3/C5d). They unlock in waves 11–19, where the game
// had only introduced one new type before, and take their share of the spawn
// table by weight (they never push other types out).
//
//   inoshishi   Boar spirit      — charger: paws the ground (lane shown), then charges; stunned if it hits a wall
//   kappa_raid  Kappa raider     — ambusher: creeps up as a ripple, bursts out when close
//   taiko       Taiko drummer    — buffer: drumbeats speed up nearby foes; kill it first
//   tsukumo     Tsukumogami      — splitter: a haunted umbrella that splits into two when killed
//   sniper      Yumi sniper      — sniper: long red aim line, then one very fast arrow
//   mukade      Mukade           — trail-layer: a centipede leaving a poison trail
//   yukiwarashi Yuki-warashi     — control: frost rings that slow you
//   mimic       Mimic chest      — punisher: looks like a Spirit Chest; drops a real one when killed
/* eslint-disable @typescript-eslint/no-explicit-any */

export type NewEnemyKind = "inoshishi" | "kappa_raid" | "taiko" | "tsukumo" | "tsukumo_small" | "sniper" | "mukade" | "yukiwarashi" | "mimic";

export const NEW_ENEMIES: Record<Exclude<NewEnemyKind, "tsukumo_small">, { fromWave: number; max: number; per: number }> = {
  inoshishi:   { fromWave: 11, max: 0.08, per: 0.015 },
  kappa_raid:  { fromWave: 13, max: 0.07, per: 0.015 },
  taiko:       { fromWave: 14, max: 0.04, per: 0.01 },
  tsukumo:     { fromWave: 16, max: 0.07, per: 0.015 },
  sniper:      { fromWave: 17, max: 0.05, per: 0.01 },
  mukade:      { fromWave: 18, max: 0.05, per: 0.01 },
  yukiwarashi: { fromWave: 19, max: 0.04, per: 0.01 },
  mimic:       { fromWave: 12, max: 0.012, per: 0.004 },
};
export const newEnemyWeights = (wave: number): [NewEnemyKind, number][] =>
  (Object.entries(NEW_ENEMIES) as [NewEnemyKind, { fromWave: number; max: number; per: number }][])
    .map(([k, c]) => [k, wave >= c.fromWave ? Math.min(c.max, (wave - c.fromWave + 1) * c.per) : 0]);

export const NEW_ENEMY_LABEL: Record<string, string> = {
  inoshishi: "Boar Spirit", kappa_raid: "Kappa Raider", taiko: "Taiko Drummer", tsukumo: "Tsukumogami", tsukumo_small: "Tsukumogami",
  sniper: "Yumi Sniper", mukade: "Mukade", yukiwarashi: "Yuki-warashi", mimic: "Mimic Chest",
};
export const NEW_ENEMY_TIPS2: Record<string, string> = {
  inoshishi: "猪 Boar Spirit: when it paws the ground a red lane appears. Step out of the lane; it stuns itself on walls",
  kappa_raid: "河 Kappa Raider: that ripple is a kappa sneaking up. It bursts out when you're close",
  taiko: "鼓 Taiko Drummer: its drumbeats make nearby foes faster. Kill it first",
  tsukumo: "傘 Tsukumogami: splits into two little umbrellas when killed",
  sniper: "狙 Yumi Sniper: a red line means it's aiming. Move off the line before it fires",
  mukade: "百 Mukade: leaves a poison trail. Don't stand in the green",
  yukiwarashi: "雪 Yuki-warashi: frost rings slow you. Step out before they close",
  mimic: "擬 Mimic: that chest has teeth. Kill it and it drops a real Spirit Chest",
};

/** Spawn stats. Returns false for kinds this module doesn't own. */
export function spawnNewEnemy(g: any, kind: string, s: { x: number; y: number }, hp: number, dmg: number, spd: number, tier: number): boolean {
  const mk = (o: Record<string, unknown>) => { const e = g.makeEnemy({ x: s.x, y: s.y, isBoss: false, archetype: kind, ...o }); g.enemies.push(e); return e; };
  const coin = (b: number) => b + tier * 2 + Math.floor(Math.random() * 4);
  switch (kind) {
    case "inoshishi": { const e = mk({ hp: Math.round(3.6 * hp), damage: Math.round(20 * dmg), speed: 150 * spd, size: 19, xpReward: 22, monReward: coin(7) }); e.special = 1.2; return true; }
    case "kappa_raid": { const e = mk({ hp: Math.round(2.4 * hp), damage: Math.round(15 * dmg), speed: 120 * spd, size: 15, xpReward: 20, monReward: coin(6) }); e.submerged = true; return true; }
    case "taiko": { const e = mk({ hp: Math.round(3 * hp), damage: Math.round(9 * dmg), speed: 140 * spd, size: 17, xpReward: 26, monReward: coin(9) }); e.special = 2; return true; }
    case "tsukumo": { mk({ hp: Math.round(2.6 * hp), damage: Math.round(12 * dmg), speed: 170 * spd, size: 15, xpReward: 16, monReward: coin(5) }); return true; }
    case "tsukumo_small": { mk({ hp: Math.max(1, Math.round(0.8 * hp)), damage: Math.round(7 * dmg), speed: 215 * spd, size: 10, xpReward: 4, monReward: 1 }); return true; }
    case "sniper": { const e = mk({ hp: Math.max(1, Math.round(1.8 * hp)), damage: Math.round(24 * dmg), speed: 150 * spd, size: 13, xpReward: 22, monReward: coin(7) }); e.special = 2.5; return true; }
    case "mukade": { const e = mk({ hp: Math.round(3.4 * hp), damage: Math.round(12 * dmg), speed: 155 * spd, size: 15, xpReward: 24, monReward: coin(8) }); e.segs = []; return true; }
    case "yukiwarashi": { const e = mk({ hp: Math.round(2.4 * hp), damage: Math.round(10 * dmg), speed: 140 * spd, size: 13, xpReward: 24, monReward: coin(8) }); e.special = 3; return true; }
    case "mimic": { const e = mk({ hp: Math.round(5 * hp), damage: Math.round(22 * dmg), speed: 215 * spd, size: 17, xpReward: 30, monReward: coin(12) }); e.disguised = true; return true; }
  }
  return false;
}

/** Per-frame AI. Returns true when it handled the enemy (caller should `continue`). */
export function updateNewEnemy(g: any, e: any, dt: number, dist: number, ang: number, speedMul: number): boolean {
  const P = g.player.pos, t = g.elapsed as number;
  const move = (a: number, sp: number) => { e.pos.x += Math.cos(a) * sp * speedMul * dt; e.pos.y += Math.sin(a) * sp * speedMul * dt; };
  const keepAway = (ideal: number) => {
    if (dist < ideal - 40) move(ang + Math.PI, e.speed);
    else if (dist > ideal + 60) move(ang, e.speed * 0.8);
    else move(ang + Math.PI / 2, e.speed * 0.4);
  };
  const clampW = () => { e.pos.x = Math.max(24, Math.min(g.worldW - 24, e.pos.x)); e.pos.y = Math.max(24, Math.min(g.worldH - 24, e.pos.y)); };
  switch (e.archetype) {
    case "inoshishi": {
      if (e.stunTimer > 0) return true;
      if ((e.chargeT ?? 0) > 0) {   // charging
        e.chargeT -= dt;
        const sp = 560 * speedMul * dt;
        e.pos.x += Math.cos(e.chargeAng) * sp; e.pos.y += Math.sin(e.chargeAng) * sp;
        if (g.player.invuln <= 0 && Math.hypot(P.x - e.pos.x, P.y - e.pos.y) < e.size + 16 && !e.chargeHit) {
          e.chargeHit = true; g.applyEnemyHit(e, e.damage);
        }
        if (e.pos.x < 26 || e.pos.y < 26 || e.pos.x > g.worldW - 26 || e.pos.y > g.worldH - 26) {   // wall: dizzy
          clampW(); e.chargeT = 0; e.stunTimer = 1.3; g.cameraShake = Math.max(g.cameraShake, 0.3);
          g.fx.burst(e.pos.x, e.pos.y, { count: 10, hue: 30, light: 60, speed: 160, life: 0.4 });
        }
        if (e.chargeT <= 0) e.special = 1.6;
        return true;
      }
      if ((e.windT ?? 0) > 0) {   // pawing the ground, lane locked
        e.windT -= dt;
        if (Math.random() < dt * 12) g.fx.burst(e.pos.x - Math.cos(e.chargeAng) * e.size, e.pos.y - Math.sin(e.chargeAng) * e.size, { count: 1, hue: 30, sat: 20, light: 55, speed: 60, life: 0.4 });
        if (e.windT <= 0) { e.chargeT = 0.85; e.chargeHit = false; }
        return true;
      }
      e.facing = ang;
      e.special = (e.special ?? 1) - dt;
      if (dist < 330 && e.special <= 0) { e.windT = 0.75; e.chargeAng = ang; e.facing = ang; return true; }
      move(ang, e.speed);
      return true;
    }
    case "kappa_raid": {
      if (e.submerged) {
        move(ang, e.speed * 0.8);
        if (dist < 120) { e.submerged = false; e.burstT = 0.35; g.fx.burst(e.pos.x, e.pos.y, { count: 14, hue: 195, light: 70, speed: 200, life: 0.5 }); }
        return true;
      }
      if ((e.burstT ?? 0) > 0) { e.burstT -= dt; return true; }   // surfacing beat, then a normal melee chaser
      e.speed = Math.max(e.speed, 190);
      return false;
    }
    case "taiko": {
      keepAway(260); e.facing = ang; clampW();
      e.special = (e.special ?? 3) - dt * speedMul;
      if (e.special <= 0) {
        e.special = 3.2; e.drumT = 0.5;
        for (const o of g.enemies) if (o !== e && o.state !== "dead" && Math.hypot(o.pos.x - e.pos.x, o.pos.y - e.pos.y) < 230) o.drumUntil = t + 3;
        g.fx.shockwave(e.pos.x, e.pos.y, 230, { hue: 20, light: 60, life: 0.5, width: 6, lines: 10 });
      }
      e.drumT = Math.max(0, (e.drumT ?? 0) - dt);
      return true;
    }
    case "sniper": {
      if ((e.aimT ?? 0) > 0) {
        e.aimT -= dt;
        if (e.aimT > 0.3) e.aimAng = ang;   // tracks you, then locks for the last 0.3s
        e.facing = e.aimAng;
        if (e.aimT <= 0) {
          const sp = 980, a = e.aimAng;
          g.enemyProjectiles.push({ pos: { x: e.pos.x + Math.cos(a) * 18, y: e.pos.y + Math.sin(a) * 18 }, vel: { x: Math.cos(a) * sp, y: Math.sin(a) * sp },
            life: 1.4, maxLife: 1.4, damage: e.damage, size: 8, kind: "arrow", trail: [] });
          e.special = 3.2;
        }
        return true;
      }
      keepAway(430); clampW(); e.facing = ang;
      e.special = (e.special ?? 2) - dt * speedMul;
      if (e.special <= 0 && dist < 760) { e.aimT = 1.0; e.aimAng = ang; }
      return true;
    }
    case "mukade": {
      const wig = Math.sin(t * 5 + e.id) * 0.7;
      move(ang + wig, e.speed); e.facing = ang + wig;
      e.segs = e.segs ?? [];
      e.segs.unshift({ x: e.pos.x, y: e.pos.y }); if (e.segs.length > 26) e.segs.length = 26;
      e.trailCd = (e.trailCd ?? 0) - dt;
      if (e.trailCd <= 0) { e.trailCd = 0.22; (g.mukadeTrail ??= []).push({ x: e.pos.x, y: e.pos.y, t: 0, life: 4, dmg: Math.max(1, Math.round(e.damage * 0.35)) }); }
      e.biteCd = Math.max(0, (e.biteCd ?? 0) - dt);   // mandible bite when it reaches you
      if (dist < e.size + 22 && e.biteCd <= 0) { e.biteCd = 1.1; g.applyEnemyHit(e, e.damage); }
      return true;
    }
    case "yukiwarashi": {
      keepAway(300); clampW(); e.facing = ang;
      e.special = (e.special ?? 3) - dt * speedMul;
      if (e.special <= 0 && dist < 620) {
        e.special = 4.5;
        (g.frostRings ??= []).push({ x: P.x, y: P.y, r: 105, t: 0, warn: 1.0, dmg: Math.max(1, Math.round(e.damage * 0.6)) });
      }
      return true;
    }
    case "mimic": {
      if (e.disguised) {
        if (dist < 70 || e.hp < e.maxHp) { e.disguised = false; e.biteT = 0.3; g.cameraShake = Math.max(g.cameraShake, 0.35); g.fx.burst(e.pos.x, e.pos.y, { count: 14, hue: 40, light: 60, speed: 220, life: 0.5 }); }
        return true;   // a chest doesn't move
      }
      if ((e.biteT ?? 0) > 0) { e.biteT -= dt; return true; }
      return false;   // then it hunts like a fast melee foe
    }
  }
  return false;
}

/** Ground effects (poison trails, frost rings): tick + damage. Call once per frame. */
export function updateNewHazards(g: any, dt: number) {
  const P = g.player.pos;
  if (g.mukadeTrail?.length) {
    for (const p of g.mukadeTrail) {
      p.t += dt;
      if (g.player.invuln <= 0 && Math.hypot(P.x - p.x, P.y - p.y) < 26) {
        g.mukadePoisonCd = (g.mukadePoisonCd ?? 0) - dt;
        if (g.mukadePoisonCd <= 0) { g.mukadePoisonCd = 0.5; g.applyEnemyHit(null, p.dmg, "mukade poison"); }
      }
    }
    g.mukadeTrail = g.mukadeTrail.filter((p: any) => p.t < p.life);
  }
  if (g.frostRings?.length) {
    for (const r of g.frostRings) {
      const before = r.t; r.t += dt;
      if (before < r.warn && r.t >= r.warn) {
        if (Math.hypot(P.x - r.x, P.y - r.y) < r.r) { g.playerChillUntil = g.elapsed + 2; g.applyEnemyHit(null, r.dmg, "yuki-warashi frost"); }
        g.fx.frost(r.x, r.y, 12);
        g.fx.shockwave(r.x, r.y, r.r, { hue: 195, light: 88, life: 0.35, width: 8 });
      }
    }
    g.frostRings = g.frostRings.filter((r: any) => r.t < r.warn + 0.4);
  }
}
/** Player move multiplier from Yuki-warashi frost. */
export const newEnemySlowMul = (g: any) => ((g.playerChillUntil ?? 0) > g.elapsed ? 0.55 : 1);

/** On death: Tsukumogami splits, Mimic leaves a real chest. */
export function onNewEnemyKilled(g: any, e: any) {
  if (e.archetype === "tsukumo" && !g.sweeping) {
    for (const side of [-1, 1]) {
      const before = g.enemies.length;
      spawnNewEnemy(g, "tsukumo_small", { x: e.pos.x + side * 18, y: e.pos.y }, g.lastHpScale ?? 1, g.lastDmgScale ?? 1, g.lastSpdScale ?? 1, 0);
      const c = g.enemies[before]; if (c) { c.state = "alert"; c.alertness = 1; }
    }
    g.fx.burst(e.pos.x, e.pos.y, { count: 10, hue: 280, light: 65, speed: 180, life: 0.4 });
  }
  if (e.archetype === "mimic" && !g.sweeping) g.spiritChests.push({ x: e.pos.x, y: e.pos.y, life: 30, t: 0 });
}

// ── Drawing ──
export function drawNewHazards(g: any, ctx: CanvasRenderingContext2D) {
  for (const p of g.mukadeTrail ?? []) {
    const a = Math.min(1, (p.life - p.t) / 1) * 0.5;
    ctx.fillStyle = `hsla(110, 70%, 40%, ${a})`;
    ctx.beginPath(); ctx.arc(p.x, p.y, 20 + Math.sin(p.t * 6) * 2, 0, Math.PI * 2); ctx.fill();
  }
  for (const r of g.frostRings ?? []) {
    if (r.t > r.warn) continue;
    const k = r.t / r.warn;
    ctx.save();
    ctx.strokeStyle = `hsla(195, 90%, 80%, ${0.5 + 0.4 * k})`; ctx.lineWidth = 3; ctx.setLineDash([7, 6]);
    ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = `hsla(195, 90%, 75%, ${0.12 + 0.2 * k})`;
    ctx.beginPath(); ctx.arc(r.x, r.y, r.r * k, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
}

/** Telegraphs drawn in world space (lanes, aim lines). */
export function drawNewTelegraphs(g: any, ctx: CanvasRenderingContext2D, e: any) {
  if (e.archetype === "inoshishi" && (e.windT ?? 0) > 0) {
    const k = 1 - e.windT / 0.75, L = 560 * 0.85, w = e.size + 16;
    ctx.save(); ctx.translate(e.pos.x, e.pos.y); ctx.rotate(e.chargeAng);
    ctx.fillStyle = `hsla(${g.dangerHue}, 90%, 55%, ${0.12 + 0.2 * k})`; ctx.fillRect(0, -w, L * k, w * 2);
    ctx.strokeStyle = `hsla(${g.dangerHue}, 95%, 62%, .7)`; ctx.lineWidth = 2; ctx.setLineDash([8, 6]); ctx.strokeRect(0, -w, L, w * 2);
    ctx.restore();
  }
  if (e.archetype === "sniper" && (e.aimT ?? 0) > 0) {
    const locked = e.aimT <= 0.3;
    ctx.save(); ctx.translate(e.pos.x, e.pos.y); ctx.rotate(e.aimAng);
    ctx.strokeStyle = `hsla(${g.dangerHue}, 100%, ${locked ? 65 : 55}%, ${locked ? 0.95 : 0.5})`; ctx.lineWidth = locked ? 3 : 1.5;
    ctx.beginPath(); ctx.moveTo(16, 0); ctx.lineTo(900, 0); ctx.stroke();
    ctx.restore();
  }
}

/** Bodies. Returns true when drawn (canvas is translated to the enemy). */
export function drawNewEnemy(g: any, ctx: CanvasRenderingContext2D, e: any): boolean {
  const t = (g.elapsed as number) + e.id, flash = e.hitFlash > 0, s = e.size;
  switch (e.archetype) {
    case "inoshishi": {
      ctx.save(); ctx.rotate(e.facing);
      ctx.fillStyle = flash ? "#fff" : "hsl(25, 35%, 26%)";
      ctx.beginPath(); ctx.ellipse(0, 0, s * 1.25, s * 0.85, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "hsl(25, 30%, 18%)";   // bristly ridge
      for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(i * 4, -s * 0.7); ctx.lineTo(i * 4 + 2, -s * 1.05); ctx.lineTo(i * 4 + 4, -s * 0.7); ctx.fill(); }
      ctx.fillStyle = "hsl(40, 30%, 92%)";   // tusks
      for (const sd of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * 1.05, sd * 4); ctx.quadraticCurveTo(s * 1.5, sd * 8, s * 1.35, sd * 13); ctx.lineTo(s * 1.15, sd * 6); ctx.fill(); }
      ctx.fillStyle = (e.windT ?? 0) > 0 || (e.chargeT ?? 0) > 0 ? "hsl(0, 100%, 60%)" : "hsl(40, 90%, 60%)";
      ctx.beginPath(); ctx.arc(s * 0.75, -5, 2.2, 0, Math.PI * 2); ctx.arc(s * 0.75, 5, 2.2, 0, Math.PI * 2); ctx.fill();
      if (e.stunTimer > 0) { ctx.rotate(-e.facing); ctx.fillStyle = "hsl(50, 100%, 70%)"; for (let i = 0; i < 3; i++) { const a = t * 5 + i * 2.1; ctx.beginPath(); ctx.arc(Math.cos(a) * 12, -s - 6 + Math.sin(a) * 4, 2.5, 0, Math.PI * 2); ctx.fill(); } }
      ctx.restore(); return true;
    }
    case "kappa_raid": {
      if (e.submerged) {   // only a ripple shows
        ctx.save(); ctx.strokeStyle = "hsla(195, 70%, 75%, .55)"; ctx.lineWidth = 1.5;
        for (let i = 0; i < 3; i++) { const r = ((t * 20 + i * 9) % 26) + 4; ctx.globalAlpha = 1 - r / 30; ctx.beginPath(); ctx.ellipse(0, 4, r, r * 0.45, 0, 0, Math.PI * 2); ctx.stroke(); }
        ctx.restore(); return true;
      }
      ctx.save();
      ctx.fillStyle = flash ? "#fff" : "hsl(150, 45%, 32%)"; ctx.beginPath(); ctx.arc(0, 0, s, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "hsl(35, 40%, 30%)"; ctx.beginPath(); ctx.ellipse(-2, 2, s * 0.8, s * 0.7, 0, 0, Math.PI * 2); ctx.fill();   // shell
      ctx.fillStyle = "hsl(195, 70%, 70%)"; ctx.beginPath(); ctx.ellipse(0, -s * 0.55, s * 0.45, s * 0.22, 0, 0, Math.PI * 2); ctx.fill();   // water dish
      ctx.restore(); return true;
    }
    case "taiko": {
      ctx.save();
      const beat = (e.drumT ?? 0) > 0 ? 1 + 0.15 * Math.sin(t * 40) : 1;
      ctx.scale(beat, beat);
      ctx.fillStyle = flash ? "#fff" : "hsl(0, 55%, 30%)"; ctx.beginPath(); ctx.arc(0, 0, s, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "hsl(30, 45%, 35%)"; ctx.beginPath(); ctx.arc(0, 0, s * 0.62, 0, Math.PI * 2); ctx.fill();   // drum
      ctx.fillStyle = "hsl(40, 35%, 85%)"; ctx.beginPath(); ctx.arc(0, 0, s * 0.48, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "hsl(0, 70%, 45%)"; for (let i = 0; i < 3; i++) { const a = i * 2.094 + t; ctx.beginPath(); ctx.arc(Math.cos(a) * s * 0.2, Math.sin(a) * s * 0.2, 3, 0, Math.PI * 2); ctx.fill(); }   // tomoe
      ctx.restore(); return true;
    }
    case "tsukumo": case "tsukumo_small": {
      ctx.save(); ctx.translate(0, -Math.abs(Math.sin(t * 6)) * 5);   // hops
      ctx.fillStyle = flash ? "#fff" : "hsl(280, 45%, 45%)";
      ctx.beginPath(); ctx.moveTo(0, -s * 1.1);
      for (let i = 0; i <= 8; i++) { const a = Math.PI + (i / 8) * Math.PI; ctx.lineTo(Math.cos(a) * s * 1.1, Math.sin(a) * s * 0.4 + 2 + (i % 2) * 3); }
      ctx.closePath(); ctx.fill();   // umbrella canopy
      ctx.strokeStyle = "hsl(30, 40%, 35%)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, s * 0.9); ctx.stroke();   // one leg
      ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(0, -s * 0.35, s * 0.28, 0, Math.PI * 2); ctx.fill();   // one big eye
      ctx.fillStyle = "#111"; ctx.beginPath(); ctx.arc(Math.cos(e.facing) * 2, -s * 0.35 + Math.sin(e.facing) * 2, s * 0.14, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "hsl(355, 80%, 55%)"; ctx.beginPath(); ctx.ellipse(0, -s * 0.02, s * 0.12, s * 0.22, 0, 0, Math.PI * 2); ctx.fill();   // tongue
      ctx.restore(); return true;
    }
    case "sniper": {
      ctx.save(); ctx.rotate(e.facing);
      ctx.fillStyle = flash ? "#fff" : "hsl(210, 20%, 22%)"; ctx.beginPath(); ctx.arc(0, 0, s, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "hsl(30, 50%, 45%)"; ctx.lineWidth = 2.5;   // long yumi
      ctx.beginPath(); ctx.arc(s * 0.4, 0, s * 1.5, -1.1, 1.1); ctx.stroke();
      ctx.strokeStyle = "hsla(0,0%,90%,.7)"; ctx.lineWidth = 1; const pull = (e.aimT ?? 0) > 0 ? -6 : 0;
      ctx.beginPath(); ctx.moveTo(s * 0.4 + Math.cos(-1.1) * s * 1.5, Math.sin(-1.1) * s * 1.5); ctx.lineTo(pull, 0); ctx.lineTo(s * 0.4 + Math.cos(1.1) * s * 1.5, Math.sin(1.1) * s * 1.5); ctx.stroke();
      ctx.restore(); return true;
    }
    case "mukade": {
      ctx.save();
      const segs = e.segs ?? [];
      for (let i = segs.length - 1; i >= 0; i -= 3) {   // body segments trailing behind, drawn relative to head
        const sg = segs[i], rx = sg.x - e.pos.x, ry = sg.y - e.pos.y, r = s * (0.85 - i * 0.012);
        ctx.fillStyle = i % 2 ? "hsl(15, 60%, 28%)" : "hsl(15, 55%, 22%)";
        ctx.beginPath(); ctx.arc(rx, ry, r, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "hsl(45, 70%, 55%)"; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(rx - r * 1.3, ry); ctx.lineTo(rx + r * 1.3, ry); ctx.stroke();   // legs
      }
      ctx.rotate(e.facing);
      ctx.fillStyle = flash ? "#fff" : "hsl(5, 65%, 35%)"; ctx.beginPath(); ctx.arc(0, 0, s, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "hsl(45, 80%, 60%)"; for (const sd of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * 0.8, sd * 4); ctx.lineTo(s * 1.5, sd * 9); ctx.lineTo(s * 0.9, sd * 8); ctx.fill(); }   // mandibles
      ctx.restore(); return true;
    }
    case "yukiwarashi": {
      ctx.save(); ctx.translate(0, Math.sin(t * 2.5) * 2);
      const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, s * 2);
      glow.addColorStop(0, "hsla(195, 90%, 80%, .35)"); glow.addColorStop(1, "hsla(195, 90%, 70%, 0)");
      ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(0, 0, s * 2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = flash ? "#fff" : "hsl(200, 40%, 92%)"; ctx.beginPath(); ctx.arc(0, 0, s, 0, Math.PI * 2); ctx.fill();   // straw cloak of snow
      ctx.fillStyle = "hsl(40, 40%, 55%)"; ctx.beginPath(); ctx.arc(0, -s * 0.3, s * 0.95, Math.PI, 0); ctx.fill();   // kasa
      ctx.fillStyle = "hsl(195, 90%, 60%)"; ctx.beginPath(); ctx.arc(-3, s * 0.15, 1.8, 0, Math.PI * 2); ctx.arc(3, s * 0.15, 1.8, 0, Math.PI * 2); ctx.fill();
      ctx.restore(); return true;
    }
    case "mimic": {
      ctx.save();
      const open = e.disguised ? 0 : 0.35 + 0.25 * Math.abs(Math.sin(t * 8));
      ctx.fillStyle = flash ? "#fff" : "hsl(30, 45%, 30%)";
      ctx.fillRect(-s, -s * 0.3, s * 2, s * 1.1);   // chest body
      ctx.fillStyle = "hsl(45, 80%, 55%)"; ctx.fillRect(-s, -s * 0.3, s * 2, 3); ctx.fillRect(-2, -s * 0.3, 4, s * 1.1);   // gold bands
      ctx.save(); ctx.translate(0, -s * 0.3); ctx.rotate(-open);   // lid
      ctx.fillStyle = flash ? "#fff" : "hsl(30, 45%, 26%)"; ctx.fillRect(-s, -s * 0.55, s * 2, s * 0.55);
      ctx.fillStyle = "hsl(45, 80%, 55%)"; ctx.fillRect(-s, -3, s * 2, 3);
      ctx.restore();
      if (!e.disguised) {   // teeth + tongue
        ctx.fillStyle = "#f4f0e6"; for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(i * 5 - 2, -s * 0.3); ctx.lineTo(i * 5, -s * 0.3 + 6); ctx.lineTo(i * 5 + 2, -s * 0.3); ctx.fill(); }
        ctx.fillStyle = "hsl(350, 70%, 45%)"; ctx.beginPath(); ctx.ellipse(0, -s * 0.15, 5, 3, 0, 0, Math.PI * 2); ctx.fill();
      } else {   // a chest's gentle golden shimmer, like a real one
        ctx.fillStyle = `hsla(45, 100%, 70%, ${0.25 + 0.2 * Math.sin(t * 3)})`; ctx.beginPath(); ctx.arc(0, 0, s * 1.6, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore(); return true;
    }
  }
  return false;
}
