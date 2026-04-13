/**
 * Génère les icônes PWA (192×192 et 512×512) dans /public
 * Couleurs : fond navy Poudlard + carte or
 */
const sharp = require("sharp");
const path = require("path");

const SIZES = [192, 512];
const OUT_DIR = path.join(__dirname, "../public");

// SVG source de l'icône (carte des maraudeurs stylisée)
function buildSvg(size) {
  const pad = Math.round(size * 0.1);
  const r = Math.round(size * 0.18); // border-radius
  const center = size / 2;
  const mapW = Math.round(size * 0.55);
  const mapH = Math.round(size * 0.42);
  const mapX = center - mapW / 2;
  const mapY = center - mapH / 2 - size * 0.02;
  const pinR = Math.round(size * 0.08);
  const pinX = center;
  const pinY = mapY + mapH * 0.35;
  const pinTailY = pinY + pinR * 1.6;
  const starSize = Math.round(size * 0.055);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <!-- fond navy -->
  <rect width="${size}" height="${size}" rx="${r}" fill="#1a1a2e"/>

  <!-- parchemin (carte) -->
  <rect x="${mapX}" y="${mapY}" width="${mapW}" height="${mapH}"
        rx="${Math.round(size * 0.04)}" fill="#f5f0e8" opacity="0.95"/>

  <!-- lignes de la carte -->
  <line x1="${mapX + mapW * 0.2}" y1="${mapY + mapH * 0.3}"
        x2="${mapX + mapW * 0.8}" y2="${mapY + mapH * 0.3}"
        stroke="#c8a84b" stroke-width="${Math.round(size * 0.012)}" opacity="0.5"/>
  <line x1="${mapX + mapW * 0.2}" y1="${mapY + mapH * 0.55}"
        x2="${mapX + mapW * 0.75}" y2="${mapY + mapH * 0.55}"
        stroke="#c8a84b" stroke-width="${Math.round(size * 0.01)}" opacity="0.4"/>
  <line x1="${mapX + mapW * 0.2}" y1="${mapY + mapH * 0.75}"
        x2="${mapX + mapW * 0.6}" y2="${mapY + mapH * 0.75}"
        stroke="#c8a84b" stroke-width="${Math.round(size * 0.01)}" opacity="0.35"/>

  <!-- pin marqueur -->
  <circle cx="${pinX}" cy="${pinY}" r="${pinR}"
          fill="#8B2019" stroke="#c8a84b" stroke-width="${Math.round(size * 0.015)}"/>
  <circle cx="${pinX}" cy="${pinY}" r="${Math.round(pinR * 0.42)}" fill="white" opacity="0.9"/>
  <path d="M ${pinX - pinR * 0.45} ${pinY + pinR * 0.85}
           Q ${pinX} ${pinTailY + pinR * 0.3} ${pinX + pinR * 0.45} ${pinY + pinR * 0.85}"
        fill="#8B2019"/>

  <!-- étoiles dorées (discret HP) -->
  ${[
    [mapX + mapW * 0.18, mapY + mapH * 0.18],
    [mapX + mapW * 0.82, mapY + mapH * 0.2],
    [mapX + mapW * 0.78, mapY + mapH * 0.78],
  ]
    .map(
      ([x, y]) =>
        `<text x="${x}" y="${y}" font-size="${starSize}" text-anchor="middle"
               dominant-baseline="middle" fill="#c8a84b" opacity="0.7">✦</text>`
    )
    .join("\n  ")}

  <!-- texte "CDM" en bas -->
  <text x="${center}" y="${mapY + mapH + Math.round(size * 0.12)}"
        font-size="${Math.round(size * 0.09)}" font-family="serif"
        text-anchor="middle" dominant-baseline="middle"
        fill="#c8a84b" letter-spacing="${Math.round(size * 0.012)}">CDM</text>
</svg>`;
}

async function main() {
  for (const size of SIZES) {
    const svg = Buffer.from(buildSvg(size));
    const outPath = path.join(OUT_DIR, `icon-${size}.png`);
    await sharp(svg).png().toFile(outPath);
    console.log(`✓ icon-${size}.png`);
  }

  // Apple touch icon 180×180
  const svgApple = Buffer.from(buildSvg(180));
  await sharp(svgApple).png().toFile(path.join(OUT_DIR, "apple-touch-icon.png"));
  console.log("✓ apple-touch-icon.png");
}

main().catch(console.error);
