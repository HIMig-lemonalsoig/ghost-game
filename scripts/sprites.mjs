// Licensed sprite art lives in ./art (gitignored, CraftPix licence: no
// redistribution). When it's there, builds inline it as
// window.__YUKEN_SPRITES = { "samurai/Idle": "data:image/png;base64,…", … }.
// When it's missing (e.g. the public CI build) the game falls back to the
// original shapes.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

export function spriteData(root = "art") {
  if (!existsSync(root)) return null;
  const out = {};
  for (const dir of readdirSync(root)) {
    const d = join(root, dir);
    if (!statSync(d).isDirectory()) continue;
    for (const f of readdirSync(d)) {
      if (!f.endsWith(".png")) continue;
      out[`${dir}/${f.slice(0, -4)}`] = "data:image/png;base64," + readFileSync(join(d, f)).toString("base64");
    }
  }
  return Object.keys(out).length ? out : null;
}

export function spriteScriptTag(root = "art") {
  const data = spriteData(root);
  return data ? `<script>window.__YUKEN_SPRITES=${JSON.stringify(data)};</script>` : "";
}
