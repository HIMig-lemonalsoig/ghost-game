import { defineConfig } from "vite";
// @ts-expect-error plain .mjs helper
import { spriteScriptTag } from "./scripts/sprites.mjs";

export default defineConfig({
  base: "./",
  build: {
    outDir: "dist",
  },
  plugins: [{
    // Inline the local, licensed sprite art (./art) when it's present.
    name: "yuken-sprites",
    transformIndexHtml(html: string) {
      const tag = spriteScriptTag();
      return tag ? html.replace("</head>", `${tag}</head>`) : html;
    },
  }],
  test: {
    environment: "jsdom",
    globals: true,
  },
});
