// Renders the Open Utils logomark to `public/logo.png` (512x512).
//
// Schema.org `Organization.logo` and the web manifest both need a real raster
// image at a stable URL — a 404 there invalidates the markup. Generating it from
// code (rather than committing a binary someone has to re-cut by hand) keeps the
// mark in sync with the brand and needs no image dependency.
//
// Run with: npm run gen:logo
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SIZE = 512;
const BG = [237, 237, 237]; // --ds-gray-1000, the disc
const FG = [10, 10, 10]; // --background, the glyph
const SS = 4; // supersampling factor, for antialiased edges

/** Signed distance from point to segment, used to draw round-capped strokes. */
function distToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  const t = lenSq === 0 ? 0 : Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lenSq));
  const cx = x1 + t * dx;
  const cy = y1 + t * dy;
  return Math.hypot(px - cx, py - cy);
}

// Geometry in a 64x64 space, matching the SVG logomark: a ">" chevron and a "_".
const S = SIZE / 64;
const STROKE = 5.6 * S;
const CHEVRON = [
  [16 * S, 20 * S, 30 * S, 32 * S], // upper arm
  [30 * S, 32 * S, 16 * S, 44 * S], // lower arm
];
const UNDERSCORE = [34 * S, 43 * S, 47 * S, 43 * S];
const R = SIZE / 2;

const pixels = Buffer.alloc(SIZE * SIZE * 4);

for (let y = 0; y < SIZE; y++) {
  for (let x = 0; x < SIZE; x++) {
    let inDisc = 0;
    let inGlyph = 0;

    // Supersample so the circle and stroke edges come out smooth.
    for (let sy = 0; sy < SS; sy++) {
      for (let sx = 0; sx < SS; sx++) {
        const px = x + (sx + 0.5) / SS;
        const py = y + (sy + 0.5) / SS;

        if (Math.hypot(px - R, py - R) <= R) inDisc++;

        const d = Math.min(
          ...CHEVRON.map(([x1, y1, x2, y2]) => distToSegment(px, py, x1, y1, x2, y2)),
          distToSegment(px, py, ...UNDERSCORE)
        );
        if (d <= STROKE / 2) inGlyph++;
      }
    }

    const total = SS * SS;
    const discA = inDisc / total;
    const glyphA = (inGlyph / total) * discA; // glyph is clipped to the disc

    const i = (y * SIZE + x) * 4;
    for (let c = 0; c < 3; c++) {
      // Composite glyph over disc, then the whole thing over transparency.
      pixels[i + c] = Math.round(BG[c] * (1 - glyphA) + FG[c] * glyphA);
    }
    pixels[i + 3] = Math.round(discA * 255);
  }
}

// --- Minimal PNG encoder (RGBA, 8-bit, filter type 0) ---
const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};

const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
};

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(SIZE, 0);
ihdr.writeUInt32BE(SIZE, 4);
ihdr[8] = 8; // bit depth
ihdr[9] = 6; // colour type: RGBA
// 10-12: compression, filter, interlace — all 0

// Each scanline is prefixed with its filter byte (0 = none).
const raw = Buffer.alloc(SIZE * (SIZE * 4 + 1));
for (let y = 0; y < SIZE; y++) {
  raw[y * (SIZE * 4 + 1)] = 0;
  pixels.copy(raw, y * (SIZE * 4 + 1) + 1, y * SIZE * 4, (y + 1) * SIZE * 4);
}

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk("IHDR", ihdr),
  chunk("IDAT", deflateSync(raw, { level: 9 })),
  chunk("IEND", Buffer.alloc(0)),
]);

const out = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "logo.png");
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, png);
console.log(`[generate-logo] wrote ${out} (${SIZE}x${SIZE}, ${(png.length / 1024).toFixed(1)} KB)`);
