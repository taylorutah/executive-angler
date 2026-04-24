/**
 * One-off: update gear_brands.hero_image_url and gear_products.hero_image_url
 * to local /images/gear/brands/{slug}-hero.jpg and
 * /images/gear/products/{slug}.jpg respectively.
 */
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const s = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const BRANDS_DIR = path.resolve("public/images/gear/brands");
const PRODUCTS_DIR = path.resolve("public/images/gear/products");

async function main() {
  // Brands
  const brandFiles = new Set(
    fs.readdirSync(BRANDS_DIR).filter((f) => f.endsWith("-hero.jpg")),
  );
  const { data: brands, error: be } = await s
    .from("gear_brands")
    .select("slug");
  if (be) throw be;

  let bOk = 0,
    bMiss = 0;
  for (const b of brands!) {
    const file = `${b.slug}-hero.jpg`;
    if (!brandFiles.has(file)) {
      console.error(`  ! missing brand image: ${b.slug}`);
      bMiss++;
      continue;
    }
    const localPath = `/images/gear/brands/${file}`;
    const { error } = await s
      .from("gear_brands")
      .update({ hero_image_url: localPath })
      .eq("slug", b.slug);
    if (error) console.error(`  ✗ ${b.slug}: ${error.message}`);
    else bOk++;
  }
  console.log(`Brands: ${bOk} updated, ${bMiss} missing`);

  // Products
  const productFiles = new Set(
    fs.readdirSync(PRODUCTS_DIR).filter((f) => f.endsWith(".jpg")),
  );
  const { data: products, error: pe } = await s
    .from("gear_products")
    .select("slug");
  if (pe) throw pe;

  let pOk = 0,
    pMiss = 0;
  for (const p of products!) {
    const file = `${p.slug}.jpg`;
    if (!productFiles.has(file)) {
      console.error(`  ! missing product image: ${p.slug}`);
      pMiss++;
      continue;
    }
    const localPath = `/images/gear/products/${file}`;
    const { error } = await s
      .from("gear_products")
      .update({ hero_image_url: localPath })
      .eq("slug", p.slug);
    if (error) console.error(`  ✗ ${p.slug}: ${error.message}`);
    else pOk++;
  }
  console.log(`Products: ${pOk} updated, ${pMiss} missing`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
