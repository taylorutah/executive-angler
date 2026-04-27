// Rewrites heroImageUrl in src/data/gear-products.ts to point at the
// Supabase Storage gear-images bucket rehost. Pairs each product's brand
// slug + product slug to the canonical Supabase URL pattern:
//   {SUPABASE_URL}/storage/v1/object/public/gear-images/{brand-slug}/{product-slug}-hero.webp
// Only updates products that currently have a sourceImageUrl set (i.e.
// were matched by apply-product-images.mjs).

import { readFileSync, writeFileSync } from "node:fs";

const env = readFileSync(
  "/Users/taylorwarnick/My Sites-Apps/personal/executive-angler/.env.local",
  "utf8",
);
for (const line of env.split("\n")) {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}
// Use the canonical Supabase project URL for the storage path so it works
// regardless of whether the app hits the custom domain or the Supabase URL
const SUPABASE_STORAGE_BASE =
  "https://qlasxtfbodyxbcuchvxz.supabase.co/storage/v1/object/public/gear-images";

const PRODUCTS_FILE =
  "/Users/taylorwarnick/My Sites-Apps/personal/executive-angler/src/data/gear-products.ts";
const BRANDS_FILE =
  "/Users/taylorwarnick/My Sites-Apps/personal/executive-angler/src/data/gear-brands.ts";

const productsTs = readFileSync(PRODUCTS_FILE, "utf8");
const brandsTs = readFileSync(BRANDS_FILE, "utf8");

// Build brandId → brandSlug map by parsing brands file
const brandSlugMap = new Map();
const brandRe = /id:\s*"(brand-[^"]+)",\s*\n\s*slug:\s*"([^"]+)",/g;
let bmatch;
while ((bmatch = brandRe.exec(brandsTs)) !== null) {
  brandSlugMap.set(bmatch[1], bmatch[2]);
}

let updated = 0;
const productBlockRe = /(\{\s*id: "(prod-[^"]+)",[\s\S]*?\n\s*\},)/g;
const newProductsTs = productsTs.replace(productBlockRe, (block) => {
  if (!/sourceImageUrl:/.test(block)) return block;
  const slugMatch = block.match(/slug:\s*"([^"]+)",/);
  const brandIdMatch = block.match(/brandId:\s*"([^"]+)",/);
  if (!slugMatch || !brandIdMatch) return block;
  const brandSlug = brandSlugMap.get(brandIdMatch[1]);
  if (!brandSlug) return block;

  const supabaseUrl = `${SUPABASE_STORAGE_BASE}/${brandSlug}/${slugMatch[1]}-hero.webp`;

  // Replace existing heroImageUrl line with the Supabase URL
  let next = block;
  if (/heroImageUrl:/.test(next)) {
    next = next.replace(
      /heroImageUrl:\s*\n?\s*"[^"]+",/,
      `heroImageUrl:\n      "${supabaseUrl}",`,
    );
  } else {
    // Insert before galleryUrls
    next = next.replace(
      /(\s*galleryUrls:\s*\[\],)/,
      `\n    heroImageUrl:\n      "${supabaseUrl}",$1`,
    );
  }

  if (next !== block) updated++;
  return next;
});

writeFileSync(PRODUCTS_FILE, newProductsTs);
console.log(`Updated heroImageUrl on ${updated} products to Supabase Storage paths`);
