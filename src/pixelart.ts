// ─── Hand-made pixel art: Oni Warlord & Raijin (v3.10) ──────────────────────
// No pack had an oni, so these are drawn here, in code, to sit next to the
// CraftPix sheets: 128×128 frames facing right, feet near the bottom, a hard
// palette and a 1px ink outline.
//
// How it works: a simple "rig" (hips, torso, head, two arms, two legs and a
// weapon) is posed per frame and painted with flat shapes on a 128px canvas.
// Then every pixel is snapped to the palette (no anti-aliasing), and an ink
// outline is grown around the silhouette — which is what makes it read as
// pixel art rather than vector shapes.

type RGB = [number, number, number];

interface Look {
  skin: string; skinShade: string; skinLight: string;
  hair: string; hairLight: string;
  horn: string; hornShade: string;
  cloth: string; clothStripe: string; belt: string;
  weapon: string; weaponShade: string; weaponStud: string;
  eye: string; tooth: string;
  weaponLen: number; weaponW0: number; weaponW1: number;
  drums: boolean;            // Raijin's ring of thunder drums
  drum?: string; drumRim?: string; ring?: string;
}

const INK = "#140c0a";

export const ONI_LOOK: Look = {
  skin: "#c23a2a", skinShade: "#7f2219", skinLight: "#e8674a",
  hair: "#1c1414", hairLight: "#3a2a26",
  horn: "#efe0b6", hornShade: "#b49c6a",
  cloth: "#e2a12c", clothStripe: "#2a1a12", belt: "#6b4a2e",
  weapon: "#3c3a44", weaponShade: "#24222a", weaponStud: "#a7adb8",
  eye: "#ffd84a", tooth: "#f6f0e0",
  weaponLen: 50, weaponW0: 6, weaponW1: 12,
  drums: false,
};

export const RAIJIN_LOOK: Look = {
  skin: "#3d7fb4", skinShade: "#22517a", skinLight: "#6fb2e0",
  hair: "#eef2f6", hairLight: "#ffffff",
  horn: "#f2c94c", hornShade: "#b8892a",
  cloth: "#e9e2cf", clothStripe: "#3a3550", belt: "#c8372d",
  weapon: "#8a5a32", weaponShade: "#5c3a1e", weaponStud: "#f2c94c",
  eye: "#fff6a0", tooth: "#f6f0e0",
  weaponLen: 30, weaponW0: 4, weaponW1: 6,
  drums: true, drum: "#c8372d", drumRim: "#f2c94c", ring: "#f2c94c",
};

/** One pose of the rig. Angles in radians; 0 = hanging straight down, + = swung forward (right). */
interface Pose {
  bob: number;      // whole body up/down (px, + = down)
  lean: number;     // torso tilt (+ = forward)
  legF: number; legB: number; kneeF: number; kneeB: number;
  armF: number; elbowF: number; armB: number; elbowB: number;
  weapon: number;   // weapon angle relative to the forearm
  head: number;     // head tilt
  fall: number;     // whole-body rotation around the feet (death)
  glow: number;     // 0..1 eye / drum glow
}

const P0: Pose = { bob: 0, lean: 0, legF: 0.12, legB: -0.12, kneeF: 0.1, kneeB: 0.1, armF: 0.45, elbowF: 0.6, armB: -0.2, elbowB: 0.4, weapon: 0.1, head: 0, fall: 0, glow: 0 };

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const mix = (a: Pose, b: Partial<Pose>, t: number): Pose => {
  const o = { ...a };
  for (const k of Object.keys(b) as (keyof Pose)[]) o[k] = lerp(a[k], b[k] as number, t);
  return o;
};
const ease = (t: number) => t * t * (3 - 2 * t);

export type GenAnim = "Idle" | "Walk" | "Attack_1" | "Attack_2" | "Hurt" | "Dead";

function poses(anim: GenAnim): Pose[] {
  const out: Pose[] = [];
  switch (anim) {
    case "Idle":
      for (let f = 0; f < 6; f++) {
        const s = Math.sin((f / 6) * Math.PI * 2);
        out.push({ ...P0, bob: s * 1.2, armF: P0.armF + s * 0.05, armB: P0.armB - s * 0.05, head: s * 0.03, glow: 0.3 });
      }
      break;
    case "Walk":
      for (let f = 0; f < 8; f++) {
        const p = (f / 8) * Math.PI * 2, s = Math.sin(p);
        out.push({ ...P0, bob: -Math.abs(Math.cos(p)) * 2 + 1, lean: 0.06,
          legF: s * 0.5, legB: -s * 0.5, kneeF: Math.max(0, -Math.cos(p)) * 0.7 + 0.1, kneeB: Math.max(0, Math.cos(p)) * 0.7 + 0.1,
          armF: 0.4 - s * 0.2, armB: -0.15 + s * 0.3, head: s * 0.03, glow: 0.3 });
      }
      break;
    case "Attack_1": {   // overhead slam: wind up, smash, recover
      const raise: Partial<Pose> = { armF: 3.45, elbowF: 0.35, weapon: 0.25, lean: -0.16, bob: -1, armB: 0.4, head: -0.06, glow: 1 };
      const smash: Partial<Pose> = { armF: 1.25, elbowF: 0.1, weapon: 0.05, lean: 0.26, bob: 5, legF: 0.45, legB: -0.45, kneeF: 0.5, kneeB: 0.5, armB: -0.5, head: 0.08, glow: 1 };
      const ks = [0, 0.4, 0.75, 1];
      for (const k of ks) out.push(mix(P0, raise, ease(k)));
      out.push(mix(mix(P0, raise, 1), smash, 0.55));
      out.push(mix(P0, smash, 1));
      out.push(mix(P0, smash, 0.9));
      out.push(mix(P0, smash, 0.45));
      break;
    }
    case "Attack_2": {   // horizontal sweep
      const back: Partial<Pose> = { armF: -0.9, elbowF: 0.9, weapon: -0.4, lean: -0.1, armB: 0.6, glow: 1 };
      const sweep: Partial<Pose> = { armF: 1.9, elbowF: 0.15, weapon: 0.2, lean: 0.18, armB: -0.6, legF: 0.35, legB: -0.35, glow: 1 };
      for (const k of [0, 0.5, 1]) out.push(mix(P0, back, ease(k)));
      for (const k of [0.5, 1]) out.push(mix(mix(P0, back, 1), sweep, k));
      out.push(mix(P0, sweep, 0.5));
      break;
    }
    case "Hurt":
      for (const k of [0.6, 1, 0.4]) out.push(mix(P0, { lean: -0.3, head: -0.2, armF: 0.1, armB: -0.6, bob: 1 }, k));
      break;
    case "Dead":
      for (let f = 0; f < 7; f++) {
        const k = ease(Math.min(1, f / 5));
        out.push(mix(P0, { fall: -1.5, lean: -0.3, head: -0.4, armF: 2.2, armB: 1.6, legF: 0.4, kneeF: 0.6, bob: 2 }, k));
      }
      break;
  }
  return out;
}

// ── painting ────────────────────────────────────────────────────────────────

/** A tapered limb from (0,0) pointing down after rotation; light from the upper right. */
function limb(g: CanvasRenderingContext2D, len: number, w0: number, w1: number, base: string, shade: string) {
  const cap = (w: number, y: number, c: string, dx = 0) => { g.fillStyle = c; g.beginPath(); g.ellipse(dx, y, w / 2, w / 2, 0, 0, Math.PI * 2); g.fill(); };
  const body = (dx: number, sh: number, c: string) => {
    g.fillStyle = c; g.beginPath();
    g.moveTo(-w0 / 2 + dx + sh, 0); g.lineTo(w0 / 2 + dx, 0); g.lineTo(w1 / 2 + dx, len); g.lineTo(-w1 / 2 + dx + sh, len); g.closePath(); g.fill();
  };
  body(0, 0, shade); cap(w0, 0, shade); cap(w1, len, shade);
  body(1.2, 1.6, base); cap(w0 - 2, 0, base, 0.8); cap(w1 - 2, len, base, 0.8);
}

function drawFigure(g: CanvasRenderingContext2D, L: Look, p: Pose) {
  const FEET = 124, CX = 58;
  g.save();
  g.translate(CX, FEET);
  g.rotate(-p.fall);                    // fall backwards around the feet
  g.translate(0, p.bob);
  const hipY = -30;

  // Raijin: ring of thunder drums behind everything.
  if (L.drums) {
    g.save();
    g.translate(-2, hipY - 22);
    g.strokeStyle = L.ring!; g.lineWidth = 3;
    g.beginPath(); g.arc(0, 0, 36, 0, Math.PI * 2); g.stroke();
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(a) * 36, y = Math.sin(a) * 36;
      g.fillStyle = L.drumRim!; g.beginPath(); g.ellipse(x, y, 7.5, 7.5, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = p.glow > 0.8 && i % 2 === 0 ? "#fff6a0" : L.drum!; g.beginPath(); g.ellipse(x, y, 5.5, 5.5, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = L.drumRim!; g.fillRect(x - 1, y - 1, 2, 2);
    }
    g.restore();
  }

  const leg = (ang: number, knee: number, front: boolean) => {
    g.save();
    g.translate(front ? 5 : -6, hipY + 2);
    g.rotate(-ang);
    limb(g, 15, 13, 11, front ? L.skin : L.skinShade, front ? L.skinShade : INK);
    g.translate(0, 15);
    g.rotate(knee);
    limb(g, 14, 11, 9, front ? L.skin : L.skinShade, front ? L.skinShade : INK);
    // foot
    g.fillStyle = front ? L.skinShade : INK; g.beginPath(); g.ellipse(3, 14, 8, 4, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = front ? L.skin : L.skinShade; g.beginPath(); g.ellipse(4, 13, 6.5, 3, 0, 0, Math.PI * 2); g.fill();
    g.restore();
  };

  const arm = (ang: number, elbow: number, front: boolean, weapon: boolean, wAng: number) => {
    g.save();
    g.translate(front ? 12 : -11, -2);
    g.rotate(-ang);
    limb(g, 14, 13, 11, front ? L.skin : L.skinShade, front ? L.skinShade : INK);
    g.translate(0, 14);
    g.rotate(-elbow);
    limb(g, 13, 11, 10, front ? L.skin : L.skinShade, front ? L.skinShade : INK);
    g.translate(0, 14);
    if (weapon) {
      g.save();
      g.rotate(-(Math.PI / 2) - wAng);  // weapon sticks out of the fist, perpendicular-ish to the forearm
      g.translate(-6, 0);
      // grip
      g.fillStyle = L.belt; g.fillRect(-2, -3, 12, 6);
      // head of the club, widening toward the tip
      g.fillStyle = L.weaponShade;
      g.beginPath(); g.moveTo(8, -L.weaponW0 / 2 - 1); g.lineTo(8 + L.weaponLen, -L.weaponW1 / 2 - 1); g.lineTo(8 + L.weaponLen, L.weaponW1 / 2 + 1); g.lineTo(8, L.weaponW0 / 2 + 1); g.closePath(); g.fill();
      g.fillStyle = L.weapon;
      g.beginPath(); g.moveTo(8, -L.weaponW0 / 2); g.lineTo(8 + L.weaponLen, -L.weaponW1 / 2); g.lineTo(8 + L.weaponLen, L.weaponW1 / 4); g.lineTo(8, L.weaponW0 / 4); g.closePath(); g.fill();
      if (!L.drums) {   // kanabō studs
        g.fillStyle = L.weaponStud;
        for (let i = 0; i < 6; i++) { const x = 16 + i * 7, w = lerp(L.weaponW0, L.weaponW1, (x - 8) / L.weaponLen) / 2; g.fillRect(x, -w + 1, 2, 2); g.fillRect(x + 3, w - 3, 2, 2); }
      } else {          // drumstick knob
        g.fillStyle = L.weaponStud; g.beginPath(); g.ellipse(8 + L.weaponLen, 0, 4, 4, 0, 0, Math.PI * 2); g.fill();
      }
      g.restore();
    }
    // fist
    g.fillStyle = front ? L.skinShade : INK; g.beginPath(); g.ellipse(0, 0, 6, 6, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = front ? L.skin : L.skinShade; g.beginPath(); g.ellipse(1, -1, 4.5, 4.5, 0, 0, Math.PI * 2); g.fill();
    g.restore();
  };

  // back limbs
  g.save(); g.translate(0, hipY); g.rotate(p.lean); g.translate(0, -26); arm(p.armB, p.elbowB, false, false, 0); g.restore();
  leg(p.legB, p.kneeB, false);

  // torso (rotates around the hips)
  g.save();
  g.translate(0, hipY);
  g.rotate(p.lean);
  // barrel chest + belly
  g.fillStyle = L.skinShade; g.beginPath(); g.ellipse(0, -16, 20, 20, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = L.skin; g.beginPath(); g.ellipse(2, -17, 17.5, 18, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = L.skinLight; g.beginPath(); g.ellipse(7, -24, 5, 4, -0.4, 0, Math.PI * 2); g.fill();
  // pec line + abs
  g.fillStyle = L.skinShade;
  g.fillRect(-2, -22, 13, 2);
  for (let i = 0; i < 3; i++) g.fillRect(3, -15 + i * 5, 6, 1.6);
  // loincloth: tiger-striped wrap + rope belt
  g.fillStyle = L.cloth; g.beginPath(); g.moveTo(-15, -4); g.lineTo(15, -4); g.lineTo(17, 9); g.lineTo(-16, 9); g.closePath(); g.fill();
  g.fillStyle = L.clothStripe;
  for (let i = 0; i < 5; i++) { const x = -12 + i * 7; g.beginPath(); g.moveTo(x, -3); g.lineTo(x + 3, -3); g.lineTo(x + 1, 6); g.closePath(); g.fill(); }
  g.fillStyle = L.belt; g.fillRect(-16, -6, 33, 4);
  g.fillStyle = L.cloth; g.fillRect(12, -5, 4, 3);

  // head
  g.save();
  g.translate(5, -38);
  g.rotate(p.head);
  // wild mane behind the head
  g.fillStyle = L.hair;
  g.beginPath();
  const spikes = 9;
  for (let i = 0; i <= spikes; i++) {
    const a = Math.PI * 0.55 + (i / spikes) * Math.PI * 1.25;
    const r = i % 2 ? 13 : 19;
    g.lineTo(Math.cos(a) * r - 3, Math.sin(a) * r);
  }
  g.closePath(); g.fill();
  g.fillStyle = L.hairLight; g.fillRect(-14, -6, 3, 3); g.fillRect(-9, -15, 3, 3);
  // horns
  const horn = (x: number, tipX: number, tipY: number, c: string, s: string) => {
    g.fillStyle = s; g.beginPath(); g.moveTo(x - 4, -8); g.quadraticCurveTo(x - 2, -18, tipX, tipY); g.quadraticCurveTo(x + 2, -14, x + 4, -8); g.closePath(); g.fill();
    g.fillStyle = c; g.beginPath(); g.moveTo(x - 2, -8); g.quadraticCurveTo(x - 1, -17, tipX, tipY + 1); g.quadraticCurveTo(x + 2, -13, x + 3, -8); g.closePath(); g.fill();
  };
  horn(-3, -6, -27, L.hornShade, INK);
  horn(5, 10, -28, L.horn, L.hornShade);
  // face
  g.fillStyle = L.skinShade; g.beginPath(); g.ellipse(1, 0, 11, 11.5, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = L.skin; g.beginPath(); g.ellipse(2.5, -0.5, 9.5, 10, 0, 0, Math.PI * 2); g.fill();
  // jaw jutting forward
  g.fillStyle = L.skin; g.beginPath(); g.ellipse(7, 5, 6, 5, 0, 0, Math.PI * 2); g.fill();
  // heavy brow
  g.fillStyle = L.hair; g.fillRect(3, -5, 9, 2.5);
  // glowing eye
  g.fillStyle = L.eye; g.fillRect(6, -2.5, 4, 2.5);
  if (p.glow > 0.8) { g.fillStyle = "#ffffff"; g.fillRect(8, -2.5, 1.5, 1.5); }
  g.fillStyle = INK; g.fillRect(9, -2.5, 1.5, 2.5);
  // nose + mouth with a tusk
  g.fillStyle = L.skinShade; g.fillRect(10, 0, 3, 3);
  g.fillStyle = INK; g.fillRect(6, 6, 8, 2);
  g.fillStyle = L.tooth; g.fillRect(11, 3.5, 2, 3); g.fillRect(7, 6.5, 2, 2);
  g.restore();
  g.restore();

  // front leg, then the front arm with the weapon on top
  leg(p.legF, p.kneeF, true);
  g.save(); g.translate(0, hipY); g.rotate(p.lean); g.translate(0, -26); arm(p.armF, p.elbowF, true, true, p.weapon); g.restore();

  g.restore();
}

// ── pixel pass: snap to palette, then grow an ink outline ───────────────────

const hex = (h: string): RGB => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];

function pixelate(g: CanvasRenderingContext2D, size: number, L: Look) {
  const pal: RGB[] = [INK, L.skin, L.skinShade, L.skinLight, L.hair, L.hairLight, L.horn, L.hornShade, L.cloth, L.clothStripe, L.belt,
    L.weapon, L.weaponShade, L.weaponStud, L.eye, L.tooth, "#ffffff", "#fff6a0", ...(L.drums ? [L.drum!, L.drumRim!, L.ring!] : [])].map(hex);
  const img = g.getImageData(0, 0, size, size);
  const d = img.data;
  const solid = new Uint8Array(size * size);
  for (let i = 0; i < size * size; i++) {
    const a = d[i * 4 + 3];
    if (a < 110) { d[i * 4 + 3] = 0; continue; }
    // un-premultiply edge pixels, then snap to the nearest palette colour
    const r = d[i * 4], gg = d[i * 4 + 1], b = d[i * 4 + 2];
    let best = 0, bd = Infinity;
    for (let k = 0; k < pal.length; k++) {
      const c = pal[k]; const dd = (c[0] - r) ** 2 + (c[1] - gg) ** 2 + (c[2] - b) ** 2;
      if (dd < bd) { bd = dd; best = k; }
    }
    const c = pal[best];
    d[i * 4] = c[0]; d[i * 4 + 1] = c[1]; d[i * 4 + 2] = c[2]; d[i * 4 + 3] = 255;
    solid[i] = 1;
  }
  const ink = hex(INK);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const i = y * size + x;
    if (solid[i]) continue;
    if ((x > 0 && solid[i - 1]) || (x < size - 1 && solid[i + 1]) || (y > 0 && solid[i - size]) || (y < size - 1 && solid[i + size])) {
      d[i * 4] = ink[0]; d[i * 4 + 1] = ink[1]; d[i * 4 + 2] = ink[2]; d[i * 4 + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
}

/** Render every animation of a look into horizontal 128px sheets. */
export function buildSheets(L: Look, size = 128): Record<GenAnim, HTMLCanvasElement> {
  const out = {} as Record<GenAnim, HTMLCanvasElement>;
  for (const anim of ["Idle", "Walk", "Attack_1", "Attack_2", "Hurt", "Dead"] as GenAnim[]) {
    const ps = poses(anim);
    const sheet = document.createElement("canvas");
    sheet.width = size * ps.length; sheet.height = size;
    const sg = sheet.getContext("2d")!;
    ps.forEach((p, i) => {
      const c = document.createElement("canvas");
      c.width = size; c.height = size;
      const g = c.getContext("2d", { willReadFrequently: true })!;
      drawFigure(g, L, p);
      pixelate(g, size, L);
      sg.drawImage(c, i * size, 0);
    });
    out[anim] = sheet;
  }
  return out;
}
