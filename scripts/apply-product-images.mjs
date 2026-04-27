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

// Brand-name tokens that, on their own, don't actually identify a product.
// "Sage R8 Core" → if we only match on "sage" the match is meaningless.
// Keep this strictly limited to brand-name identifiers — product family
// names like "Absolute" or "Amplitude" ARE the distinguishing tokens and
// must NOT be in this list.
const BRAND_TOKENS = new Set([
  "sage",
  "orvis",
  "winston",
  "scott",
  "loomis",
  "echo",
  "redington",
  "simms",
  "lamson",
  "patagonia",
  "thomas",
  "hardy",
  "douglas",
  "tfo",
  "croix",
  "beulah",
  "hatch",
  "tibor",
  "abel",
  "ross",
  "nautilus",
  "galvan",
  "bauer",
  "cheeky",
  "skwala",
  "grundens",
  "bean",
  "filson",
  "korkers",
  "rio",
  "airflo",
  "cortland",
  "trouthunter",
  "fishpond",
  "umpqua",
  "brodin",
  "frogg",
  "toggs",
  "sa",
  "tnt",
]);

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

  // Distinguishing (non-brand) tokens are the ones that actually identify
  // a specific product. "R8 Core" matters; "Sage" is half the catalog.
  const targetDistinguishing = new Set(
    [...targetTokens].filter((t) => !BRAND_TOKENS.has(t)),
  );
  const candidateDistinguishing = new Set(
    [...candidateTokens].filter((t) => !BRAND_TOKENS.has(t)),
  );

  if (targetDistinguishing.size === 0) {
    // Product name has no distinguishing tokens after stripping brand and
    // stop words (e.g. "Scott G Series" → just "g" filtered for length).
    // Refuse to match — auto-matching would just pick any same-brand product.
    return 0;
  }

  let distinguishingOverlap = 0;
  for (const t of targetDistinguishing) {
    if (candidateDistinguishing.has(t)) distinguishingOverlap++;
  }

  return distinguishingOverlap / targetDistinguishing.size;
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

  /**
   * Reject candidates whose title clearly belongs to a different product
   * category from our target. Brands like Simms reuse model names across
   * waders/jackets/pants/shirts (e.g. "G3 Guide Stockingfoot" vs "G3 Guide
   * Tactical Jacket"), and the matcher will happily pick the wrong one
   * unless we filter by category keywords.
   */
  const categoryMatch = block.match(/category:\s*"([^"]+)"/);
  const targetCategory = categoryMatch?.[1];

  // Tokens in the scraped title that indicate a category. If any of these
  // appear and the target category is different, reject.
  const CATEGORY_INDICATORS = {
    rod: /\b(?:rod|fly[-\s]?rod|spey[-\s]?rod|switch[-\s]?rod|euro[-\s]?nymph)\b/i,
    reel: /\b(?:reel|fly[-\s]?reel|spool)\b/i,
    waders: /\b(?:waders?|stockingfoot|bootfoot|wading[-\s]?pant)\b/i,
    "wading-boots": /\b(?:wading[-\s]?boot|wade\s+boot|fishing[-\s]?boot)\b/i,
    line: /\b(?:fly[-\s]?line|line|skagit[-\s]?head|scandi[-\s]?head|spey[-\s]?line)\b/i,
    leader: /\b(?:leader)\b/i,
    tippet: /\b(?:tippet)\b/i,
    pack: /\b(?:pack|sling|vest|backpack|tote|bag|cooler|chest[-\s]?pack|hip[-\s]?pack|wader[-\s]?bag|boat[-\s]?bag)\b/i,
    net: /\b(?:net|landing[-\s]?net)\b/i,
  };

  // Apparel/accessory words that must NEVER match a gear category
  const APPAREL_RE =
    /\b(?:jacket|hoodie|hoody|shirt|tee|t-shirt|jersey|short(?!s\s+stix)|pants?|trouser|cap|hat|beanie|gaiter|glove|sock|underwear|bib|fleece|sweater|sweatshirt|wader\s+bag(?:\s+specific)?)\b/i;

  function isCategoryMismatch(entry) {
    const title = entry.title.toLowerCase();
    if (!targetCategory) return false;

    // Hard-reject obvious apparel matches for any non-apparel category
    // (we don't have an apparel category)
    if (APPAREL_RE.test(title)) {
      // Allow "wader" + "bag" combos — those are valid pack products
      if (targetCategory === "pack" && /wader.*bag|bag.*wader/i.test(title)) {
        return false;
      }
      return true;
    }

    // If we know the target category, prefer titles whose explicit category
    // matches. If the title declares a DIFFERENT category, reject.
    const targetIndicator = CATEGORY_INDICATORS[targetCategory];
    for (const [cat, re] of Object.entries(CATEGORY_INDICATORS)) {
      if (cat === targetCategory) continue;
      if (re.test(title)) {
        // The title explicitly says a different category. If our target's
        // own indicator ALSO appears, that's ambiguous — let it through.
        // Otherwise reject.
        if (targetIndicator && targetIndicator.test(title)) return false;
        return true;
      }
    }
    return false;
  }

  // Brand-direct sources (the brand's own /products.json) get a small bonus
  // over fly-shop catalogs, which sometimes carry "used" or limited-edition
  // variants under near-identical names.
  const BRAND_DIRECT_HOSTS = [
    "farbank.com",
    "tiborreel.com",
    "korkers.com",
    "skwalafishing.com",
    "thomasandthomas.com",
    "hardyfishing.com",
    "fishpondusa.com",
    "simmsfishing.com",
    "hatchoutdoors.com",
    "abelreels.com",
    "rossreels.com",
    "nautilusreels.com",
    "cheekyfishing.com",
    "lamson.com",
    "airflousa.com",
    "cortlandline.com",
    "trouthunt.com",
    "templeforkoutfitters.com",
    "beulahflyrods.com",
    "umpqua.com",
    "brodinnets.com",
    "grundens.com",
    "gloomis.com",
  ];

  function isBrandDirect(entry) {
    return BRAND_DIRECT_HOSTS.some((h) => entry.source?.includes(h));
  }

  // Score every scraped item, pick best
  let best = null;
  let bestScore = 0;
  for (const entry of scrapedList) {
    if (isAccessory(entry)) continue;
    if (isCategoryMismatch(entry)) continue;
    let s = score(slugMatch[1], nameMatch[1], entry.handle, entry.title);
    // Penalize "used" / "demo" / "limited" listings from fly shops
    const lowerTitle = entry.title.toLowerCase();
    if (/\b(used|demo|legacy|limited\s+edition|breast\s+cancer)\b/.test(lowerTitle)) {
      s *= 0.7;
    }
    // Boost brand-direct sources (avoids falling back to a fly shop's
    // similarly-named-but-different product when the brand has the real one)
    if (isBrandDirect(entry)) s += 0.05;

    if (s > bestScore) {
      best = entry;
      bestScore = s;
    }
  }

  // Threshold: at least 2/3 of distinguishing tokens must overlap. Below
  // that, the match is meaningless ("Sage" alone matching anything Sage).
  if (!best || bestScore < 0.67) {
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
