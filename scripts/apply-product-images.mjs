// Reads scripts/scraped-product-images.json and src/data/gear-products.ts.
// For each product without a sourceImageUrl, finds the best fuzzy-match
// from the scraped data (by brand + name token overlap) and rewrites the
// product in-place to add sourceImageUrl + heroImageUrl.

import { readFileSync, writeFileSync } from "node:fs";

const PRODUCTS_FILE =
  "/Users/taylorwarnick/My Sites-Apps/personal/executive-angler/src/data/gear-products.ts";
const SCRAPED_FILE =
  "/Users/taylorwarnick/My Sites-Apps/personal/executive-angler/scripts/scraped-product-images.json";

const productsTs = readFileSync(PRODUCTS_FILE, "utf8");
const scraped = JSON.parse(readFileSync(SCRAPED_FILE, "utf8"));

// Map scraped brand → array of {handle, title, imageUrl, productUrl}
const scrapedByBrand = new Map();
for (const entry of Object.values(scraped)) {
  const list = scrapedByBrand.get(entry.brand) || [];
  list.push(entry);
  scrapedByBrand.set(entry.brand, list);
}

const STOP_WORDS = new Set([
  "the",
  "and",
  "fly",
  "fishing",
  "series",
  "with",
  "for",
  "of",
  "in",
  "on",
  "&",
  "amp",
]);

// Normalize a name to whitespace-separated lowercase tokens. Less aggressive
// than before — keeps "rod"/"reel"/etc. since the scraped titles often
// drop them, leading to score=0. We rely on lower threshold instead.
function tokens(s) {
  return s
    .toLowerCase()
    .replace(/[^\w\s-]/g, " ")
    .replace(/-/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t));
}

function score(productSlug, productName, scrapedHandle, scrapedTitle) {
  const targetTokens = new Set([
    ...tokens(productName),
    ...tokens(productSlug),
  ]);
  const candidateTokens = new Set([
    ...tokens(scrapedTitle),
    ...tokens(scrapedHandle),
  ]);
  if (targetTokens.size === 0 || candidateTokens.size === 0) return 0;

  // Boost: identifying tokens (short numbers like "888", "590-4", "590") matter heavily
  // We'll also count overlap relative to the SMALLER set so a precise short
  // product name doesn't get penalized by a verbose scraped title.
  let overlap = 0;
  for (const t of targetTokens) if (candidateTokens.has(t)) overlap++;
  return overlap / targetTokens.size;
}

// Map our brandId → scraped brand key
const BRAND_MAP = {
  "brand-sage": "sage",
  "brand-orvis": "orvis",
  "brand-winston": "winston",
  "brand-scott": "scott",
  "brand-g-loomis": "g-loomis",
  "brand-echo": "echo",
  "brand-redington": "redington",
  "brand-simms": "simms",
  "brand-lamson": "lamson",
  "brand-patagonia": "patagonia",
  "brand-thomas-thomas": "thomas-thomas",
  "brand-hardy": "hardy",
  "brand-douglas": "douglas",
  "brand-tfo": "tfo",
  "brand-st-croix": "st-croix",
  "brand-beulah": "beulah",
  "brand-hatch": "hatch",
  "brand-tibor": "tibor",
  "brand-abel": "abel",
  "brand-ross": "ross",
  "brand-nautilus": "nautilus",
  "brand-galvan": "galvan",
  "brand-bauer": "bauer",
  "brand-cheeky": "cheeky",
  "brand-skwala": "skwala",
  "brand-grundens": "grundens",
  "brand-frogg-toggs": "frogg-toggs",
  "brand-ll-bean": "ll-bean",
  "brand-filson": "filson",
  "brand-korkers": "korkers",
  "brand-rio": "rio",
  "brand-scientific-anglers": "scientific-anglers",
  "brand-airflo": "airflo",
  "brand-cortland": "cortland",
  "brand-trouthunter": "trouthunter",
  "brand-fishpond": "fishpond",
  "brand-umpqua": "umpqua",
  "brand-brodin": "brodin",
};

// Parse all product blocks from the TS file
const productBlockRe =
  /(\{\s*id: "(prod-[^"]+)",[\s\S]*?\n\s*\},)/g;

let updatedCount = 0;
let totalProducts = 0;
const matchReport = [];

const newProductsTs = productsTs.replace(productBlockRe, (block, _g1, id) => {
  totalProducts++;

  // Strip existing sourceImageUrl + matcher-set heroImageUrl so we can re-evaluate
  // with the latest matcher logic. Products without scrape coverage will simply
  // end the run with no image, same as before.
  block = block
    .replace(/\n\s*sourceImageUrl:[^\n]*\n/g, "\n")
    .replace(/\n\s*heroImageUrl:[\s\S]*?",\n/g, "\n");

  const brandIdMatch = block.match(/brandId:\s*"([^"]+)"/);
  const nameMatch = block.match(/name:\s*"([^"]+)"/);
  const slugMatch = block.match(/slug:\s*"([^"]+)"/);
  if (!brandIdMatch || !nameMatch || !slugMatch) return block;

  const brandKey = BRAND_MAP[brandIdMatch[1]];
  if (!brandKey) return block;

  const scrapedList = scrapedByBrand.get(brandKey);
  if (!scrapedList || scrapedList.length === 0) return block;

  // Accessory keywords — products with these in title/handle are NOT main products
  const ACCESSORY_TERMS = [
    "pouch",
    "spool",
    "wrench",
    "knob",
    "lube",
    "grease",
    "decal",
    "sticker",
    "cap",
    "nameplate",
    "reelstand",
    "stand",
    "lanyard",
    "kit",
    "case",
    "cover",
    "rod tube",
    "rod-tube",
    "extra-spool",
    "replacement",
    "stand-",
    "tippet-",
    "leader-",
  ];

  function isAccessory(entry) {
    const t = (entry.handle + " " + entry.title).toLowerCase();
    return ACCESSORY_TERMS.some((term) => t.includes(term));
  }

  // Score every scraped item, pick best
  let best = null;
  let bestScore = 0;
  for (const entry of scrapedList) {
    if (isAccessory(entry)) continue;
    const s = score(slugMatch[1], nameMatch[1], entry.handle, entry.title);
    if (s > bestScore) {
      best = entry;
      bestScore = s;
    }
  }

  // Lower threshold — bias toward giving products SOMETHING rather than nothing
  if (!best || bestScore < 0.5) {
    matchReport.push({ id, brand: brandKey, name: nameMatch[1], match: null, score: bestScore });
    return block;
  }

  matchReport.push({
    id,
    brand: brandKey,
    name: nameMatch[1],
    match: best.title,
    score: bestScore.toFixed(2),
    image: best.imageUrl,
  });

  // Insert sourceImageUrl + update heroImageUrl after galleryUrls
  // Add right after `galleryUrls: [],` line
  let updated = block;

  // Remove existing heroImageUrl if present
  updated = updated.replace(/\n\s*heroImageUrl:[^\n]*\n/g, "\n");

  // Add new heroImageUrl + sourceImageUrl after the galleryUrls line
  const gallRe = /(galleryUrls:\s*\[\],)/;
  if (gallRe.test(updated)) {
    updated = updated.replace(
      gallRe,
      `heroImageUrl:\n      "${best.imageUrl}",\n    sourceImageUrl: "${best.imageUrl}",\n    galleryUrls: [],`,
    );
  }

  updatedCount++;
  return updated;
});

writeFileSync(PRODUCTS_FILE, newProductsTs);

// Summary
console.log(`Total products scanned: ${totalProducts}`);
console.log(`Products updated with image: ${updatedCount}`);
console.log(`Skipped (no match or already had image): ${totalProducts - updatedCount}`);

// Group by brand
const byBrand = {};
for (const m of matchReport) {
  byBrand[m.brand] = byBrand[m.brand] || { matched: 0, unmatched: 0 };
  if (m.match) byBrand[m.brand].matched++;
  else byBrand[m.brand].unmatched++;
}
console.log("\nBy brand:");
for (const [brand, stats] of Object.entries(byBrand).sort()) {
  console.log(`  ${brand}: ${stats.matched} matched, ${stats.unmatched} unmatched`);
}

// Write detailed report
writeFileSync(
  "/Users/taylorwarnick/My Sites-Apps/personal/executive-angler/scripts/match-report.json",
  JSON.stringify(matchReport, null, 2),
);
console.log("\nDetailed report: scripts/match-report.json");
