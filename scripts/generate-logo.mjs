import sharp from "sharp";
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  copyFileSync,
  unlinkSync,
  existsSync,
} from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PUBLIC_IMAGES = join(ROOT, "public", "images");
const SOURCE_NAME = " logo-source.jpg"; // leading space in original filename

async function main() {
  console.log("Generating Executive Angler logo...\n");

  // 1. Ensure output directory
  mkdirSync(PUBLIC_IMAGES, { recursive: true });

  // 2. Copy source image to public/images/
  const srcPath = join(ROOT, SOURCE_NAME);
  const destPath = join(PUBLIC_IMAGES, "logo-source.jpg");
  if (existsSync(srcPath)) {
    copyFileSync(srcPath, destPath);
    console.log("  Copied logo-source.jpg → public/images/");
  } else if (!existsSync(destPath)) {
    console.error("  ERROR: Cannot find logo source image");
    process.exit(1);
  }

  // 3. Extract fish illustration from center of source
  console.log("  Extracting fish illustration...");
  const fishBase64 = await extractFish(destPath);
  console.log(
    `  Fish image: ${Math.round(fishBase64.length / 1024)}KB base64`
  );

  // 4. Fetch Playfair Display Bold font
  console.log("  Fetching Playfair Display Bold...");
  const fontBase64 = await fetchFont();
  console.log(`  Font: ${Math.round(fontBase64.length / 1024)}KB base64`);

  // 5. Build SVG
  console.log("  Building SVG...");
  const svg = buildSvg(fishBase64, fontBase64);

  // 6. Write SVG
  const svgPath = join(PUBLIC_IMAGES, "logo.svg");
  writeFileSync(svgPath, svg);
  console.log(`  Written: ${svgPath}`);

  // 7. Generate 1200×1200 PNG
  console.log("  Generating logo-1200.png...");
  const pngPath = join(PUBLIC_IMAGES, "logo-1200.png");
  await sharp(Buffer.from(svg), { density: 300 })
    .resize(1200, 1200)
    .png({ quality: 90 })
    .toFile(pngPath);
  console.log(`  Written: ${pngPath}`);

  // 8. Clean up root source file
  if (existsSync(srcPath)) {
    unlinkSync(srcPath);
    console.log(`  Removed root "${SOURCE_NAME}"`);
  }

  console.log("\nLogo generation complete!");
}

/**
 * Extract the central fish illustration from the source badge image.
 * The source is 1024×1024 with the fish in the center ~65%.
 * We crop the center, apply a circular mask, and return base64 PNG.
 */
async function extractFish(imagePath) {
  const sourceBuffer = readFileSync(imagePath);

  // Crop the center portion - the fish and water occupy roughly the inner 640px
  // (leaving out the ~192px text band on each side)
  const cropSize = 640;
  const offset = Math.floor((1024 - cropSize) / 2); // 192

  const cropped = await sharp(sourceBuffer)
    .extract({ left: offset, top: offset, width: cropSize, height: cropSize })
    .toBuffer();

  // Create circular alpha mask
  const maskSvg = Buffer.from(`
    <svg width="${cropSize}" height="${cropSize}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${cropSize / 2}" cy="${cropSize / 2}" r="${cropSize / 2 - 5}" fill="white"/>
    </svg>
  `);

  const mask = await sharp(maskSvg).resize(cropSize, cropSize).png().toBuffer();

  // Composite: apply mask as alpha channel
  const circular = await sharp(cropped)
    .ensureAlpha()
    .composite([{ input: mask, blend: "dest-in" }])
    .png()
    .toBuffer();

  return circular.toString("base64");
}

/**
 * Fetch Playfair Display Bold WOFF2 from Google Fonts and return as base64.
 */
async function fetchFont() {
  // Request the CSS with a modern user-agent to get WOFF2
  const cssUrl =
    "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap";
  const cssResp = await fetch(cssUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  });
  const css = await cssResp.text();

  // Extract the WOFF2 URL - Google Fonts CSS has url(...) entries
  const match = css.match(
    /url\((https:\/\/fonts\.gstatic\.com\/s\/playfairdisplay\/[^)]+\.woff2)\)/
  );
  if (!match) {
    // Fallback: try any woff2 URL
    const fallback = css.match(
      /url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.woff2)\)/
    );
    if (!fallback) {
      console.warn("  WARNING: Could not fetch font, using fallback");
      return "";
    }
    const fontResp = await fetch(fallback[1]);
    return Buffer.from(await fontResp.arrayBuffer()).toString("base64");
  }

  const fontResp = await fetch(match[1]);
  const fontBuffer = Buffer.from(await fontResp.arrayBuffer());
  return fontBuffer.toString("base64");
}

/**
 * Build the SVG string with all embedded assets.
 */
function buildSvg(fishBase64, fontBase64) {
  // Font face declaration (only if font was fetched)
  const fontFace = fontBase64
    ? `@font-face {
        font-family: 'Playfair Display';
        font-weight: 700;
        font-style: normal;
        src: url('data:font/woff2;base64,${fontBase64}') format('woff2');
      }`
    : "";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     xmlns:xlink="http://www.w3.org/1999/xlink"
     viewBox="0 0 1000 1000"
     width="1000" height="1000">
  <defs>
    <style>
      ${fontFace}
    </style>

    <!-- Clip path for the fish image -->
    <clipPath id="fishClip">
      <circle cx="500" cy="500" r="330"/>
    </clipPath>

    <!-- Top arc path for "EXECUTIVE ANGLER" text -->
    <path id="topArc"
          d="M 140,500 A 360,360 0 0,1 860,500"
          fill="none"/>

    <!-- Bottom arc path for "FLY FISHING" text -->
    <path id="bottomArc"
          d="M 810,560 A 330,330 0 0,1 190,560"
          fill="none"/>
  </defs>

  <!-- === BACKGROUND === -->
  <circle cx="500" cy="500" r="495" fill="#1a2e1a"/>

  <!-- === DOUBLE BORDER RINGS === -->
  <circle cx="500" cy="500" r="492" fill="none"
          stroke="#f5f0e8" stroke-width="3"/>
  <circle cx="500" cy="500" r="478" fill="none"
          stroke="#f5f0e8" stroke-width="1.5"/>

  <!-- === INNER CIRCLE BACKGROUND (behind fish) === -->
  <circle cx="500" cy="500" r="340" fill="#1a2e1a"/>

  <!-- === FISH ILLUSTRATION (raster, clipped to circle) === -->
  <image href="data:image/png;base64,${fishBase64}"
         x="170" y="170" width="660" height="660"
         clip-path="url(#fishClip)"
         preserveAspectRatio="xMidYMid slice"/>

  <!-- === SUBTLE RING around fish area === -->
  <circle cx="500" cy="500" r="335" fill="none"
          stroke="#f5f0e8" stroke-width="1" opacity="0.4"/>

  <!-- === LEFT LAUREL === -->
  <g transform="translate(500, 500)" fill="none" stroke="#f5f0e8" stroke-width="1.8" stroke-linecap="round" opacity="0.85">
    <!-- Left laurel branch -->
    <g transform="rotate(90) translate(350, 0)">
      <!-- Stem -->
      <line x1="0" y1="-30" x2="0" y2="30"/>
      <!-- Leaves -->
      <path d="M 0,-25 C -12,-20 -14,-10 0,-8"/>
      <path d="M 0,-15 C -12,-10 -14,0 0,2"/>
      <path d="M 0,-5 C -12,0 -14,10 0,12"/>
      <path d="M 0,5 C -12,10 -14,20 0,22"/>
      <path d="M 0,-25 C 12,-20 14,-10 0,-8"/>
      <path d="M 0,-15 C 12,-10 14,0 0,2"/>
      <path d="M 0,-5 C 12,0 14,10 0,12"/>
      <path d="M 0,5 C 12,10 14,20 0,22"/>
    </g>
  </g>

  <!-- === RIGHT LAUREL (mirrored) === -->
  <g transform="translate(500, 500) scale(-1,1)" fill="none" stroke="#f5f0e8" stroke-width="1.8" stroke-linecap="round" opacity="0.85">
    <g transform="rotate(90) translate(350, 0)">
      <line x1="0" y1="-30" x2="0" y2="30"/>
      <path d="M 0,-25 C -12,-20 -14,-10 0,-8"/>
      <path d="M 0,-15 C -12,-10 -14,0 0,2"/>
      <path d="M 0,-5 C -12,0 -14,10 0,12"/>
      <path d="M 0,5 C -12,10 -14,20 0,22"/>
      <path d="M 0,-25 C 12,-20 14,-10 0,-8"/>
      <path d="M 0,-15 C 12,-10 14,0 0,2"/>
      <path d="M 0,-5 C 12,0 14,10 0,12"/>
      <path d="M 0,5 C 12,10 14,20 0,22"/>
    </g>
  </g>

  <!-- === SEPARATOR DOTS === -->
  <circle cx="155" cy="485" r="5" fill="#f5f0e8" opacity="0.8"/>
  <circle cx="845" cy="485" r="5" fill="#f5f0e8" opacity="0.8"/>

  <!-- === TOP ARC TEXT: EXECUTIVE ANGLER === -->
  <text fill="#f5f0e8"
        font-family="'Playfair Display', Georgia, 'Times New Roman', serif"
        font-size="58" font-weight="700"
        letter-spacing="6">
    <textPath href="#topArc" startOffset="50%" text-anchor="middle">
      EXECUTIVE ANGLER
    </textPath>
  </text>

  <!-- === BOTTOM ARC TEXT: FLY FISHING === -->
  <text fill="#f5f0e8"
        font-family="'Playfair Display', Georgia, 'Times New Roman', serif"
        font-size="40" font-weight="700"
        letter-spacing="10">
    <textPath href="#bottomArc" startOffset="50%" text-anchor="middle">
      FLY FISHING
    </textPath>
  </text>

</svg>`;
}

main().catch((err) => {
  console.error("Logo generation failed:", err);
  process.exit(1);
});
