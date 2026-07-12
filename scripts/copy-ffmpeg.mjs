// Copies the FFmpeg (single-thread) core into `public/ffmpeg/` so it can be
// served same-origin. This keeps Open Utils 100% local at runtime — no CDN
// request is ever made — while keeping the 31 MB wasm out of version control.
//
// Runs automatically on `postinstall` and before `dev` / `build`.
import { existsSync, mkdirSync, copyFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = join(root, "node_modules", "@ffmpeg", "core", "dist", "umd");
const destDir = join(root, "public", "ffmpeg");
const files = ["ffmpeg-core.js", "ffmpeg-core.wasm"];

if (!existsSync(srcDir)) {
  console.warn(
    "[copy-ffmpeg] @ffmpeg/core is not installed — skipping. " +
      "Run `npm install` to enable the local video converter."
  );
  process.exit(0);
}

mkdirSync(destDir, { recursive: true });

let copied = 0;
for (const file of files) {
  const src = join(srcDir, file);
  const dest = join(destDir, file);
  if (!existsSync(src)) {
    console.warn(`[copy-ffmpeg] missing source: ${src} — skipping.`);
    continue;
  }
  // Skip if the destination is already up to date (same size).
  if (existsSync(dest) && statSync(dest).size === statSync(src).size) {
    copied++;
    continue;
  }
  copyFileSync(src, dest);
  copied++;
}

console.log(`[copy-ffmpeg] ${copied}/${files.length} core file(s) ready in public/ffmpeg/`);
