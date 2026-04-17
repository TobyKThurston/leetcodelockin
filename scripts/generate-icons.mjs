import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

// Favicon design principles applied here:
// 1. Single bold shape that reads at 16x16 (Google SERP size).
// 2. High contrast — saturated indigo background, pure white glyph.
// 3. Generous padding (~22%) so the shape stays readable after Google crops to a circle.
// 4. No thin strokes — every stroke is ≥48px at 512, so it stays ≥1.5px at 16px.
// 5. Brand continuity with the existing [L_] mark: the glyph is an L paired with
//    a short underscore "cursor", evoking a terminal / code prompt without relying
//    on the brackets which would turn to mush at small sizes.

const root = process.cwd();

// v2 — smaller, bolder L + cursor in brand indigo on dark-navy tile.
// Principles for Google SERP favicon (16px):
//  - Dark tile stays legible against Google's white result row (no blending).
//  - Thick strokes (stem 40% of stem-height, foot 50% of foot-width) survive downscaling.
//  - ~27% padding so Google's circular crop won't clip the glyph.
//  - Glyph color is indigo-300, not white — matches the brand accent used in the dashboard.
const BG_DARK = '#0b1220';
const FG_INDIGO = '#a5b4fc';
// Geometry on a 512 canvas (glyph occupies ~46% of width — smaller than v1).
const STEM_X = 140;
const STEM_W = 80;
const STEM_Y_TOP = 148;
const STEM_Y_BOT = 364;
const FOOT_X_END = 300;
const FOOT_Y_TOP = 284;
const FOOT_Y_BOT = STEM_Y_BOT;
const CURSOR_X = 320;
const CURSOR_W = 56;
const CURSOR_Y = 308;
const CURSOR_H = 56;

function svg({ rx }) {
  const bgRect = rx
    ? `<rect width="512" height="512" rx="${rx}" ry="${rx}" fill="${BG_DARK}"/>`
    : `<rect width="512" height="512" fill="${BG_DARK}"/>`;
  const lPath = `M ${STEM_X} ${STEM_Y_TOP} L ${STEM_X + STEM_W} ${STEM_Y_TOP} L ${STEM_X + STEM_W} ${FOOT_Y_TOP} L ${FOOT_X_END} ${FOOT_Y_TOP} L ${FOOT_X_END} ${FOOT_Y_BOT} L ${STEM_X} ${FOOT_Y_BOT} Z`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  ${bgRect}
  <path d="${lPath}" fill="${FG_INDIGO}"/>
  <rect x="${CURSOR_X}" y="${CURSOR_Y}" width="${CURSOR_W}" height="${CURSOR_H}" rx="6" ry="6" fill="${FG_INDIGO}"/>
</svg>`;
}

async function render(svgSource) {
  return sharp(Buffer.from(svgSource)).png().toBuffer();
}

const targets = [
  { rel: 'app/icon.png', svgSource: svg({ rx: 0 }) },
  { rel: 'app/apple-icon.png', svgSource: svg({ rx: 112 }) },
  { rel: 'public/logo.png', svgSource: svg({ rx: 64 }) },
];

for (const { rel, svgSource } of targets) {
  const buf = await render(svgSource);
  const out = path.join(root, rel);
  fs.writeFileSync(out, buf);
  const m = await sharp(buf).metadata();
  console.log(`wrote ${rel}: ${m.width}x${m.height} (${buf.length} bytes)`);
}
