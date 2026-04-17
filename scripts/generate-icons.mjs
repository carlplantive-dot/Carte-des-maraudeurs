/**
 * Génère les icônes PWA (192, 512, apple-touch-icon) depuis un SVG source.
 * Usage : node scripts/generate-icons.mjs
 */
import sharp from "sharp";
import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "../public");

// SVG source de l'icône — fond marine, épingle blanche, cœur brique
const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <!-- Fond -->
  <rect width="512" height="512" rx="96" fill="#1a1a2e"/>

  <!-- Épingle de carte -->
  <path d="M256 96C196 96 148 144 148 204c0 84 108 212 108 212s108-128 108-212c0-60-48-108-108-108z"
        fill="white"/>

  <!-- Cœur brique à l'intérieur de l'épingle -->
  <path d="M256 235
           C238 218 216 212 216 190
           A24 24 0 0 1 256 174
           A24 24 0 0 1 296 190
           C296 212 274 218 256 235z"
        fill="#C0622F"/>
</svg>`;

const sizes = [
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
  { name: "apple-touch-icon.png", size: 180 },
];

for (const { name, size } of sizes) {
  const outPath = join(publicDir, name);
  await sharp(Buffer.from(svgIcon))
    .resize(size, size)
    .png()
    .toFile(outPath);
  console.log(`✓ ${name} (${size}x${size})`);
}

// Favicon 32x32
await sharp(Buffer.from(svgIcon))
  .resize(32, 32)
  .png()
  .toFile(join(publicDir, "favicon.png"));
console.log("✓ favicon.png (32x32)");

console.log("Icônes générées dans /public");
