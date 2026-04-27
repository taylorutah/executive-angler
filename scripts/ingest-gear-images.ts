/**
 * Executive Angler — Gear Image Ingest Pipeline
 *
 * Reads products from src/data/gear-products.ts where `sourceImageUrl` is set,
 * downloads each image, compresses with sharp, and uploads to the Supabase
 * Storage bucket `gear-images`. Final URLs land at:
 *   https://qlasxtfbodyxbcuchvxz.supabase.co/storage/v1/object/public/gear-images/{brand-slug}/{product-slug}-hero.webp
 *
 * After a successful run, manually update each product's `heroImageUrl` to
 * the rehosted URL and clear `sourceImageUrl`.
 *
 * Usage:
 *   SUPABASE_SERVICE_ROLE_KEY=xxx npx tsx scripts/ingest-gear-images.ts
 *
 * Optional flags (env):
 *   GEAR_INGEST_BRAND=sage       — only process products from this brand slug
 *   GEAR_INGEST_DRY_RUN=true     — log only, don't download or upload
 *   GEAR_INGEST_OVERWRITE=true   — overwrite existing files in the bucket
 *
 * Setup (one-time):
 *   Create a public Supabase Storage bucket named `gear-images`. The script
 *   does NOT create the bucket automatically.
 */

import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import { gearBrands } from "../src/data/gear-brands";
import { gearProducts } from "../src/data/gear-products";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Missing env vars. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const BUCKET = "gear-images";
const TARGET_WIDTH = 1600;
const WEBP_QUALITY = 82;
const REQUEST_DELAY_MS = 1000; // 1 req/sec to each brand domain
const USER_AGENT =
  "Mozilla/5.0 (compatible; ExecutiveAnglerBot/1.0; +https://www.executiveangler.com)";

const onlyBrand = process.env.GEAR_INGEST_BRAND;
const dryRun = process.env.GEAR_INGEST_DRY_RUN === "true";
const overwrite = process.env.GEAR_INGEST_OVERWRITE === "true";

interface IngestResult {
  productSlug: string;
  status: "ok" | "skipped" | "failed";
  finalUrl?: string;
  reason?: string;
}

async function ingestOne(
  brandSlug: string,
  productSlug: string,
  sourceUrl: string,
): Promise<IngestResult> {
  const objectPath = `${brandSlug}/${productSlug}-hero.webp`;
  const finalUrl = `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${objectPath}`;

  if (!overwrite) {
    const { data: existing } = await supabase.storage
      .from(BUCKET)
      .list(brandSlug, { search: `${productSlug}-hero.webp` });
    if (existing && existing.length > 0) {
      return { productSlug, status: "skipped", finalUrl, reason: "already exists" };
    }
  }

  if (dryRun) {
    return { productSlug, status: "skipped", reason: "dry-run", finalUrl };
  }

  let buffer: ArrayBuffer;
  try {
    const response = await fetch(sourceUrl, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "image/avif,image/webp,image/png,image/jpeg,image/*,*/*;q=0.8",
      },
    });
    if (!response.ok) {
      return {
        productSlug,
        status: "failed",
        reason: `HTTP ${response.status} from source`,
      };
    }
    buffer = await response.arrayBuffer();
  } catch (e) {
    return {
      productSlug,
      status: "failed",
      reason: `fetch error: ${(e as Error).message}`,
    };
  }

  let compressed: Buffer;
  try {
    compressed = await sharp(Buffer.from(buffer))
      .resize({ width: TARGET_WIDTH, withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();
  } catch (e) {
    return {
      productSlug,
      status: "failed",
      reason: `sharp error: ${(e as Error).message}`,
    };
  }

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(objectPath, compressed, {
      contentType: "image/webp",
      upsert: overwrite,
      cacheControl: "31536000",
    });

  if (uploadError) {
    return {
      productSlug,
      status: "failed",
      reason: `upload error: ${uploadError.message}`,
    };
  }

  return { productSlug, status: "ok", finalUrl };
}

async function main() {
  console.log("Executive Angler — Gear Image Ingest");
  console.log(`  Bucket: ${BUCKET}`);
  console.log(`  Dry run: ${dryRun}`);
  console.log(`  Overwrite: ${overwrite}`);
  if (onlyBrand) console.log(`  Brand filter: ${onlyBrand}`);

  const brandById = new Map(gearBrands.map((b) => [b.id, b]));

  const queue = gearProducts
    .filter((p) => p.sourceImageUrl)
    .filter((p) => {
      if (!onlyBrand) return true;
      const brand = brandById.get(p.brandId);
      return brand?.slug === onlyBrand;
    });

  console.log(`  Queue: ${queue.length} products with source URLs\n`);

  const results: IngestResult[] = [];
  let lastDomain = "";
  for (const product of queue) {
    const brand = brandById.get(product.brandId);
    if (!brand) {
      results.push({
        productSlug: product.slug,
        status: "failed",
        reason: "brand not found",
      });
      continue;
    }
    const sourceUrl = product.sourceImageUrl!;
    const domain = new URL(sourceUrl).hostname;
    if (domain === lastDomain) {
      await new Promise((r) => setTimeout(r, REQUEST_DELAY_MS));
    }
    lastDomain = domain;

    const result = await ingestOne(brand.slug, product.slug, sourceUrl);
    results.push(result);
    const symbol = result.status === "ok" ? "✓" : result.status === "skipped" ? "·" : "✗";
    console.log(
      `  ${symbol} ${product.slug}${result.reason ? ` (${result.reason})` : ""}`,
    );
  }

  const ok = results.filter((r) => r.status === "ok").length;
  const skipped = results.filter((r) => r.status === "skipped").length;
  const failed = results.filter((r) => r.status === "failed").length;

  console.log(`\nDone: ${ok} ingested, ${skipped} skipped, ${failed} failed`);

  if (failed > 0) {
    console.log("\nFailed products:");
    for (const r of results.filter((r) => r.status === "failed")) {
      console.log(`  ${r.productSlug}: ${r.reason}`);
    }
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
