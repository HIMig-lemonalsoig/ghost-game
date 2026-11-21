import { build } from "esbuild";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const result = await build({
  entryPoints: ["src/main.ts"],
  bundle: true,
  format: "iife",
  minify: true,
  target: "es2020",
  write: false,
});

// Inline <script> would end early on a literal "</script" inside the bundle.
const js = result.outputFiles[0].text.replace(/<\/script/gi, "<\\/script");
const html = readFileSync("index.html", "utf8").replace(
  /<script type="module" src="\/src\/main.ts"><\/script>/,
  () => `<script>${js}</script>`,
);

mkdirSync("offline", { recursive: true });
writeFileSync("offline/Yuken.html", html);
console.log(`offline/Yuken.html (${(html.length / 1024).toFixed(0)} KB)`);
