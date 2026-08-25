/**
 * Image ingest — Unsplash now, Wikimedia only with a readable licence,
 * brand/CDN never bulk-downloaded.
 *
 *   npx tsx scripts/ingest-images.ts --dry
 *   npx tsx scripts/ingest-images.ts --unsplash
 *   npx tsx scripts/ingest-images.ts --wikimedia
 *   npx tsx scripts/ingest-images.ts --credits
 *   npx tsx scripts/ingest-images.ts --crop-flies
 *
 * Uploads need SUPABASE_SERVICE_ROLE_KEY. --dry classifies with the anon key.
 * --credits writes photographer / Commons attribution onto entity credit
 * columns without downloading bytes.
 * sharp.rotate() without withMetadata() strips EXIF including GPS.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import sharp from "sharp";
import { attributionHref, formatAttribution, publishStatus } from "../src/lib/media/licence";
import { fetchUnsplashCredit } from "../src/lib/media/unsplash-credit";
import { commonsFilePageUrl, fetchCommonsMeta } from "../src/lib/media/wikimedia-credit";

try {
  const env = readFileSync(".env.local", "utf8");
  for (const line of env.split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
} catch {
  /* env may already be set */
}

const argv = process.argv.slice(2);
const dryRun = argv.includes("--dry") || argv.length === 0;
const doUnsplash = argv.includes("--unsplash");
const doWikimedia = argv.includes("--wikimedia");
const doCredits = argv.includes("--credits");
const doCrop = argv.includes("--crop-flies");

const ENTITY_CREDIT: Record<string, { credit: string; url: string }> = {
  destinations: { credit: "hero_image_credit", url: "hero_image_credit_url" },
  rivers: { credit: "hero_image_credit", url: "hero_image_credit_url" },
  articles: { credit: "hero_image_credit", url: "hero_image_credit_url" },
  lodges: { credit: "hero_image_credit", url: "hero_image_credit_url" },
  fly_shops: { credit: "hero_image_credit", url: "hero_image_credit_url" },
  guides: { credit: "hero_image_credit", url: "hero_image_credit_url" },
  species: { credit: "hero_image_credit", url: "hero_image_credit_url" },
  gear_products: { credit: "hero_image_credit", url: "hero_image_credit_url" },
};

async function writeEntityCredit(
  write: SupabaseClient,
  table: string,
  id: unknown,
  credit: string,
  creditUrl: string | undefined,
) {
  const cols = ENTITY_CREDIT[table];
  if (!cols || !credit) return;
  const { error } = await write
    .from(table)
    .update({ [cols.credit]: credit, [cols.url]: creditUrl ?? null })
    .eq("id", id);
  if (error) console.error("credit", table, id, error.message);
}

const BUCKET = "media";
const UNSPLASH_LICENCE = "Unsplash License";
const UNSPLASH_LICENCE_URL = "https://unsplash.com/license";

type Source = {
  entity: string;
  table: string;
  nameCol: string;
  column: string;
};

const SOURCES: Source[] = [
  { entity: "destinations", table: "destinations", nameCol: "name", column: "hero_image_url" },
  { entity: "guides", table: "guides", nameCol: "name", column: "photo_url" },
  { entity: "fly_shops", table: "fly_shops", nameCol: "name", column: "hero_image_url" },
  { entity: "canonical_flies", table: "canonical_flies", nameCol: "name", column: "hero_image_url" },
  { entity: "rivers", table: "rivers", nameCol: "name", column: "hero_image_url" },
  { entity: "articles", table: "articles", nameCol: "title", column: "hero_image_url" },
  { entity: "lodges", table: "lodges", nameCol: "name", column: "hero_image_url" },
  { entity: "species", table: "species", nameCol: "common_name", column: "image_url" },
  { entity: "gear_products", table: "gear_products", nameCol: "name", column: "hero_image_url" },
];

type Class = "unsplash" | "wikimedia" | "supabase" | "local" | "brand" | "empty";

function classify(url: string): Class {
  if (!url) return "empty";
  if (url.startsWith("/")) return "local";
  let host = "";
  try {
    host = new URL(url).hostname;
  } catch {
    return "empty";
  }
  if (host === "images.unsplash.com" || host === "plus.unsplash.com") return "unsplash";
  if (host === "upload.wikimedia.org") return "wikimedia";
  if (host === "qlasxtfbodyxbcuchvxz.supabase.co" || host === "api.executiveangler.com") {
    return "supabase";
  }
  return "brand";
}

function client(service: boolean): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://qlasxtfbodyxbcuchvxz.supabase.co";
  const key = service
    ? process.env.SUPABASE_SERVICE_ROLE_KEY
    : process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) {
    console.error("Missing Supabase key");
    process.exit(1);
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

async function allRows(sb: SupabaseClient, table: string, columns: string) {
  const rows: Record<string, unknown>[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await sb.from(table).select(columns).range(from, from + 999);
    if (error) throw new Error(`${table}: ${error.message}`);
    rows.push(...((data as Record<string, unknown>[]) ?? []));
    if (!data || data.length < 1000) break;
  }
  return rows;
}

/** Download, auto-orient, strip EXIF/GPS, resize, return JPEG bytes + blur data URL. */
async function processImage(bytes: Buffer, maxEdge = 2400): Promise<{ jpeg: Buffer; blur: string }> {
  const image = sharp(bytes, { failOn: "none" }).rotate();
  const meta = await image.metadata();
  const resized =
    Math.max(meta.width ?? 0, meta.height ?? 0) > maxEdge
      ? image.resize({ width: maxEdge, height: maxEdge, fit: "inside" })
      : image;
  const jpeg = await resized.jpeg({ quality: 82, mozjpeg: true }).toBuffer();
  const blurBuf = await sharp(jpeg).resize(8, 8, { fit: "inside" }).png().toBuffer();
  return { jpeg, blur: `data:image/png;base64,${blurBuf.toString("base64")}` };
}

async function headOk(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: "HEAD", redirect: "follow" });
    if (res.ok) return true;
    const get = await fetch(url, { method: "GET", redirect: "follow" });
    return get.ok;
  } catch {
    return false;
  }
}

async function report(sb: SupabaseClient) {
  const counts: Record<Class, number> = {
    unsplash: 0,
    wikimedia: 0,
    supabase: 0,
    local: 0,
    brand: 0,
    empty: 0,
  };
  const hosts = new Map<string, number>();
  for (const src of SOURCES) {
    const rows = await allRows(sb, src.table, `id, slug, ${src.nameCol}, ${src.column}`);
    for (const rec of rows) {
      const raw = typeof rec[src.column] === "string" ? (rec[src.column] as string).trim() : "";
      const kind = classify(raw);
      counts[kind]++;
      if (raw.startsWith("http")) {
        const host = new URL(raw).hostname;
        hosts.set(host, (hosts.get(host) ?? 0) + 1);
      }
    }
  }
  console.log("host counts (content tables):");
  for (const [host, n] of [...hosts.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${n.toString().padStart(4)}  ${host}`);
  }
  console.log("\nclass:", counts);
  return counts;
}

async function ingestUnsplash(sb: SupabaseClient, write: SupabaseClient) {
  const service = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (!service) {
    console.error("--unsplash needs SUPABASE_SERVICE_ROLE_KEY to upload. Ran as report only.");
  }
  let ingested = 0;
  let dead = 0;
  for (const src of SOURCES) {
    const rows = await allRows(sb, src.table, `id, slug, ${src.nameCol}, ${src.column}`);
    for (const rec of rows) {
      const raw = typeof rec[src.column] === "string" ? (rec[src.column] as string).trim() : "";
      if (classify(raw) !== "unsplash") continue;
      const alive = await headOk(raw);
      if (!alive) {
        dead++;
        await write.from("media_assets").upsert(
          {
            entity_type: src.entity,
            entity_id: String(rec.id),
            column_name: src.column,
            source_url: raw,
            status: "flagged",
            tier: "unsplash",
            notes: "dead Unsplash URL — do not publish; fall back to PlateFallback",
          },
          { onConflict: "entity_type,entity_id,column_name" },
        );
        if (service) {
          await write.from(src.table).update({ [src.column]: null }).eq("id", rec.id);
        }
        continue;
      }
      if (!service) continue;
      const photo = await fetchUnsplashCredit(raw);
      const creditLabel = formatAttribution({
        creditName: photo.name,
        licence: UNSPLASH_LICENCE,
      });
      const creditHref = attributionHref({
        creditUrl: photo.url,
        licenceUrl: UNSPLASH_LICENCE_URL,
        licence: UNSPLASH_LICENCE,
      });
      const res = await fetch(raw);
      if (!res.ok) continue;
      const { jpeg, blur } = await processImage(Buffer.from(await res.arrayBuffer()));
      const path = `${src.entity}/${rec.id}.jpg`;
      const up = await write.storage.from(BUCKET).upload(path, jpeg, {
        contentType: "image/jpeg",
        upsert: true,
      });
      if (up.error) {
        console.error("upload", path, up.error.message);
        continue;
      }
      const pub = write.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
      const status = publishStatus({ licence: UNSPLASH_LICENCE, storagePath: path });
      await write.from("media_assets").upsert(
        {
          entity_type: src.entity,
          entity_id: String(rec.id),
          column_name: src.column,
          storage_path: path,
          source_url: raw,
          credit_name: photo.name,
          credit_url: photo.url,
          licence: UNSPLASH_LICENCE,
          licence_url: UNSPLASH_LICENCE_URL,
          acquired_at: new Date().toISOString(),
          blur_hash: blur,
          status,
          tier: "unsplash",
        },
        { onConflict: "entity_type,entity_id,column_name" },
      );
      await write.from(src.table).update({ [src.column]: pub }).eq("id", rec.id);
      await writeEntityCredit(write, src.table, rec.id, creditLabel, creditHref);
      ingested++;
    }
  }
  console.log(`unsplash ingested ${ingested}, dead ${dead}`);
}

async function ingestWikimedia(sb: SupabaseClient, write: SupabaseClient) {
  const service = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const rows = await allRows(sb, "species", "id, slug, common_name, image_url");
  let flagged = 0;
  let licensed = 0;
  for (const rec of rows) {
    const raw = typeof rec.image_url === "string" ? rec.image_url.trim() : "";
    if (classify(raw) !== "wikimedia") continue;
    const meta = await fetchCommonsMeta(raw);
    if (!meta) {
      flagged++;
      continue;
    }
    const { licence, licenceUrl, artist } = meta;
    if (!licence) {
      flagged++;
      await write.from("media_assets").upsert(
        {
          entity_type: "species",
          entity_id: String(rec.id),
          column_name: "image_url",
          source_url: raw,
          status: "flagged",
          tier: "wikimedia",
          notes: "Commons page has no readable licence — not migrated",
        },
        { onConflict: "entity_type,entity_id,column_name" },
      );
      continue;
    }
    licensed++;
    if (!service) {
      await write.from("media_assets").upsert(
        {
          entity_type: "species",
          entity_id: String(rec.id),
          column_name: "image_url",
          source_url: raw,
          credit_name: artist || "Wikimedia Commons",
          licence,
          licence_url: licenceUrl || null,
          status: "pending",
          tier: "wikimedia",
          notes: "licence captured; waiting on storage upload",
        },
        { onConflict: "entity_type,entity_id,column_name" },
      );
      continue;
    }
    const res = await fetch(raw, { headers: { "User-Agent": "ExecutiveAngler/1.0" } });
    if (!res.ok) {
      flagged++;
      continue;
    }
    const { jpeg, blur } = await processImage(Buffer.from(await res.arrayBuffer()));
    const path = `species/${rec.id}.jpg`;
    await write.storage.from(BUCKET).upload(path, jpeg, { contentType: "image/jpeg", upsert: true });
    const pub = write.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
    const status = publishStatus({ licence, storagePath: path });
    await write.from("media_assets").upsert(
      {
        entity_type: "species",
        entity_id: String(rec.id),
        column_name: "image_url",
        storage_path: path,
        source_url: raw,
        credit_name: artist || "Wikimedia Commons",
        licence,
        licence_url: licenceUrl || null,
        acquired_at: new Date().toISOString(),
        blur_hash: blur,
        status,
        tier: "wikimedia",
      },
      { onConflict: "entity_type,entity_id,column_name" },
    );
    await write.from("species").update({ image_url: pub }).eq("id", rec.id);
    const creditLabel = formatAttribution({
      creditName: artist || "Wikimedia Commons",
      licence,
    });
    const creditHref = attributionHref({
      creditUrl: commonsFilePageUrl(raw),
      licenceUrl: licenceUrl || null,
      licence,
    });
    await writeEntityCredit(write, "species", rec.id, creditLabel, creditHref);
  }
  console.log(`wikimedia licensed ${licensed}, flagged ${flagged}`);
}

async function writeCredits(sb: SupabaseClient, write: SupabaseClient) {
  const service = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (!service) {
    console.error("--credits needs SUPABASE_SERVICE_ROLE_KEY to write. Printing only.");
  }
  let unsplash = 0;
  let commons = 0;
  let flagged = 0;
  for (const src of SOURCES) {
    const rows = await allRows(sb, src.table, `id, slug, ${src.nameCol}, ${src.column}`);
    for (const rec of rows) {
      const raw = typeof rec[src.column] === "string" ? (rec[src.column] as string).trim() : "";
      const kind = classify(raw);
      if (kind === "unsplash") {
        const photo = await fetchUnsplashCredit(raw);
        const label = formatAttribution({
          creditName: photo.name,
          licence: UNSPLASH_LICENCE,
        });
        const href = attributionHref({
          creditUrl: photo.url,
          licenceUrl: UNSPLASH_LICENCE_URL,
          licence: UNSPLASH_LICENCE,
        });
        console.log(`  unsplash  ${src.entity}/${rec.slug}: ${label}`);
        if (service) {
          await writeEntityCredit(write, src.table, rec.id, label, href);
          unsplash++;
        }
        continue;
      }
      if (kind === "wikimedia") {
        const meta = await fetchCommonsMeta(raw);
        if (!meta?.licence) {
          flagged++;
          console.log(`  flagged   ${src.entity}/${rec.slug}: no readable Commons licence`);
          continue;
        }
        const label = formatAttribution({
          creditName: meta.artist || "Wikimedia Commons",
          licence: meta.licence,
        });
        const href = attributionHref({
          creditUrl: commonsFilePageUrl(raw),
          licenceUrl: meta.licenceUrl || null,
          licence: meta.licence,
        });
        console.log(`  commons   ${src.entity}/${rec.slug}: ${label}`);
        if (service) {
          await writeEntityCredit(write, src.table, rec.id, label, href);
          commons++;
        }
      }
    }
  }
  console.log(`credits written: unsplash ${unsplash}, commons ${commons}, flagged ${flagged}`);
}

async function cropFlies(sb: SupabaseClient, write: SupabaseClient) {
  const service = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const rows = await allRows(sb, "canonical_flies", "id, slug, name, hero_image_url");
  let notSquare = 0;
  for (const rec of rows) {
    const raw = typeof rec.hero_image_url === "string" ? rec.hero_image_url.trim() : "";
    if (!raw) continue;
    try {
      const res = await fetch(raw);
      if (!res.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      const meta = await sharp(buf, { failOn: "none" }).metadata();
      const w = meta.width ?? 0;
      const h = meta.height ?? 0;
      if (w === 0 || h === 0) continue;
      if (Math.abs(w / h - 1) < 0.05) continue;
      notSquare++;
      if (!service) continue;
      const side = Math.min(w, h);
      const jpeg = await sharp(buf)
        .rotate()
        .extract({
          left: Math.floor((w - side) / 2),
          top: Math.floor((h - side) / 2),
          width: side,
          height: side,
        })
        .resize(1200, 1200)
        .jpeg({ quality: 84, mozjpeg: true })
        .toBuffer();
      const path = `flies/${rec.id}-square.jpg`;
      await write.storage.from(BUCKET).upload(path, jpeg, { contentType: "image/jpeg", upsert: true });
      const pub = write.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
      await write.from("canonical_flies").update({ hero_image_url: pub }).eq("id", rec.id);
    } catch (err) {
      console.error("crop", rec.slug, err);
    }
  }
  console.log(`fly macros not 1:1: ${notSquare}${service ? " (recropped)" : " (report only — no service role)"}`);
}

async function main() {
  const read = client(false);
  const write = client(Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY));
  await report(read);
  if (dryRun && !doUnsplash && !doWikimedia && !doCredits && !doCrop) {
    console.log("\n--dry only. Pass --unsplash / --wikimedia / --credits / --crop-flies to write.");
    console.log("Do not shrink remotePatterns until Unsplash ingest lands.");
    return;
  }
  if (doCredits) await writeCredits(read, write);
  if (doUnsplash) await ingestUnsplash(read, write);
  if (doWikimedia) await ingestWikimedia(read, write);
  if (doCrop) await cropFlies(read, write);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
