/**
 * Read-only image audit.
 *
 * Classifies every image-bearing content URL as:
 *   ok | null | dead | host-not-allowlisted
 *
 *   npx tsx scripts/audit-images.ts
 *   npx tsx scripts/audit-images.ts --entity=rivers
 *   npx tsx scripts/audit-images.ts --dry
 *
 * --dry skips HTTP HEAD checks. Never writes to the database.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import sharp from "sharp";

try {
  const env = readFileSync(".env.local", "utf8");
  for (const line of env.split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
} catch {
  /* env may already be set */
}

const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.executiveangler.com").replace(/\/$/, "");
const argv = process.argv.slice(2);
const entityArg = argv.find((a) => a.startsWith("--entity="))?.slice("--entity=".length);
const dryRun = argv.includes("--dry");

type Status = "ok" | "null" | "dead" | "host-not-allowlisted";

interface Pattern {
  host: string;
  pathname?: string;
}

interface Row {
  entity: string;
  id: string;
  slug: string;
  name: string;
  column: string;
  url: string;
  host: string;
  status: Status;
  http_code: string;
  notes: string;
}

function parseRemotePatterns(configPath: string): Pattern[] {
  const text = readFileSync(configPath, "utf8");
  const patterns: Pattern[] = [];
  const re = /\{\s*protocol:\s*"https",\s*hostname:\s*"([^"]+)"(?:,\s*pathname:\s*"([^"]+)")?/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    patterns.push({ host: m[1], pathname: m[2] });
  }
  return patterns;
}

function isHostAllowed(hostname: string, pathname: string, allow: Pattern[]): boolean {
  for (const p of allow) {
    const hostOk =
      p.host === hostname ||
      (p.host.startsWith("*.") &&
        (hostname === p.host.slice(2) || hostname.endsWith("." + p.host.slice(2))));
    if (!hostOk) continue;
    if (!p.pathname || p.pathname === "/**") return true;
    const prefix = p.pathname.replace(/\*\*$/, "").replace(/\*$/, "");
    if (pathname.startsWith(prefix)) return true;
  }
  return false;
}

function hostOf(url: string): string {
  if (!url || url.startsWith("/")) return "";
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

function makeClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://qlasxtfbodyxbcuchvxz.supabase.co";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) {
    console.error("Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY");
    process.exit(1);
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

async function fetchPaged(
  sb: SupabaseClient,
  table: string,
  columns: string,
): Promise<Record<string, unknown>[]> {
  const pageSize = 1000;
  const rows: Record<string, unknown>[] = [];
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await sb.from(table).select(columns).range(from, from + pageSize - 1);
    if (error) throw new Error(`${table}: ${error.message}`);
    rows.push(...((data as Record<string, unknown>[]) ?? []));
    if (!data || data.length < pageSize) break;
  }
  return rows;
}

const SOURCES: {
  entity: string;
  table: string;
  nameCol: string;
  columns: { column: string; field: string }[];
}[] = [
  {
    entity: "rivers",
    table: "rivers",
    nameCol: "name",
    columns: [
      { column: "hero_image_url", field: "hero_image_url" },
      { column: "thumbnail_url", field: "thumbnail_url" },
    ],
  },
  {
    entity: "destinations",
    table: "destinations",
    nameCol: "name",
    columns: [{ column: "hero_image_url", field: "hero_image_url" }],
  },
  {
    entity: "articles",
    table: "articles",
    nameCol: "title",
    columns: [{ column: "hero_image_url", field: "hero_image_url" }],
  },
  {
    entity: "lodges",
    table: "lodges",
    nameCol: "name",
    columns: [{ column: "hero_image_url", field: "hero_image_url" }],
  },
  {
    entity: "guides",
    table: "guides",
    nameCol: "name",
    columns: [{ column: "photo_url", field: "photo_url" }],
  },
  {
    entity: "fly_shops",
    table: "fly_shops",
    nameCol: "name",
    columns: [{ column: "hero_image_url", field: "hero_image_url" }],
  },
  {
    entity: "species",
    table: "species",
    nameCol: "common_name",
    columns: [{ column: "image_url", field: "image_url" }],
  },
  {
    entity: "canonical_flies",
    table: "canonical_flies",
    nameCol: "name",
    columns: [{ column: "hero_image_url", field: "hero_image_url" }],
  },
];

const httpCache = new Map<string, { code: number; ctype: string; err?: string }>();

async function headCheck(url: string): Promise<{ code: number; ctype: string; err?: string }> {
  const cached = httpCache.get(url);
  if (cached) return cached;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  try {
    let res = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: ctrl.signal,
      headers: { "User-Agent": "executive-angler-image-audit/1.0" },
    });
    if (res.status === 405 || res.status === 403 || res.status === 501) {
      res = await fetch(url, {
        method: "GET",
        redirect: "follow",
        signal: ctrl.signal,
        headers: {
          "User-Agent": "executive-angler-image-audit/1.0",
          Range: "bytes=0-64",
        },
      });
    }
    const result = { code: res.status, ctype: res.headers.get("content-type") || "" };
    httpCache.set(url, result);
    return result;
  } catch (e) {
    const result = { code: 0, ctype: "", err: e instanceof Error ? e.message : String(e) };
    httpCache.set(url, result);
    return result;
  } finally {
    clearTimeout(timer);
  }
}

async function runPool<T>(items: T[], concurrency: number, fn: (item: T) => Promise<void>): Promise<void> {
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      await fn(items[idx]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, Math.max(items.length, 1)) }, () => worker()));
}

function csvCell(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

async function main() {
  const allow = parseRemotePatterns(join(process.cwd(), "next.config.ts"));
  const sb = makeClient();
  const sources = entityArg ? SOURCES.filter((s) => s.entity === entityArg) : SOURCES;
  if (entityArg && sources.length === 0) {
    console.error(`Unknown --entity=${entityArg}. Try: ${SOURCES.map((s) => s.entity).join(", ")}`);
    process.exit(1);
  }

  type Pending = Omit<Row, "status" | "http_code" | "notes">;
  const pending: Pending[] = [];

  for (const src of sources) {
    const cols = ["id", "slug", src.nameCol, ...src.columns.map((c) => c.field)].join(",");
    const records = await fetchPaged(sb, src.table, cols);
    for (const rec of records) {
      for (const col of src.columns) {
        const raw = rec[col.field];
        const urls: string[] = Array.isArray(raw)
          ? raw.filter((u): u is string => typeof u === "string")
          : typeof raw === "string"
            ? [raw]
            : [];
        if (urls.length === 0) {
          pending.push({
            entity: src.entity,
            id: String(rec.id ?? ""),
            slug: String(rec.slug ?? ""),
            name: String(rec[src.nameCol] ?? ""),
            column: col.column,
            url: "",
            host: "",
          });
          continue;
        }
        for (const url of urls) {
          pending.push({
            entity: src.entity,
            id: String(rec.id ?? ""),
            slug: String(rec.slug ?? ""),
            name: String(rec[src.nameCol] ?? ""),
            column: col.column,
            url,
            host: hostOf(url),
          });
        }
      }
    }
  }

  const toCheck = pending.filter((p) => p.url.trim().length > 0);
  if (!dryRun) {
    await runPool(toCheck, 8, async (p) => {
      const target = p.url.startsWith("/") ? SITE + p.url : p.url;
      await headCheck(target);
    });
  }

  const rows: Row[] = pending.map((p) => {
    const url = p.url.trim();
    if (!url) {
      return { ...p, url: "", status: "null", http_code: "", notes: "no URL in database" };
    }
    const notes: string[] = [];
    if (url.startsWith("/")) {
      const localPath = join(process.cwd(), "public", url.replace(/^\//, ""));
      if (!existsSync(localPath)) notes.push("missing from this checkout's public/");
    } else {
      try {
        const u = new URL(url);
        if (u.protocol === "https:" && !isHostAllowed(u.hostname, u.pathname, allow)) {
          return {
            ...p,
            status: "host-not-allowlisted",
            http_code: "",
            notes: `hostname ${u.hostname} is not in next.config.ts images.remotePatterns`,
          };
        }
      } catch {
        return { ...p, status: "dead", http_code: "", notes: "unparseable URL" };
      }
    }
    if (dryRun) {
      return {
        ...p,
        status: "ok",
        http_code: "",
        notes: [...notes, "dry: skipped HTTP"].filter(Boolean).join("; "),
      };
    }
    const target = url.startsWith("/") ? SITE + url : url;
    const head = httpCache.get(target) || { code: 0, ctype: "" };
    const okCode = head.code >= 200 && head.code < 300;
    const imageType =
      !head.ctype || head.ctype.startsWith("image/") || head.ctype.includes("octet-stream");
    if (!okCode || !imageType) {
      return {
        ...p,
        status: "dead",
        http_code: String(head.code || ""),
        notes: [notes.join("; "), head.err || "", head.ctype && !imageType ? `content-type ${head.ctype}` : ""]
          .filter(Boolean)
          .join("; "),
      };
    }
    return { ...p, status: "ok", http_code: String(head.code), notes: notes.join("; ") };
  });

  const date = new Date().toISOString().slice(0, 10);
  mkdirSync(join(process.cwd(), "reports"), { recursive: true });
  const csvPath = join(process.cwd(), "reports", `image-audit-${date}.csv`);
  const jsonPath = join(process.cwd(), "reports", `image-audit-${date}.json`);

  const header = "entity,id,slug,name,column,url,host,status,http_code,notes";
  const csv =
    header +
    "\n" +
    rows
      .map((r) =>
        [r.entity, r.id, r.slug, r.name, r.column, r.url, r.host, r.status, r.http_code, r.notes]
          .map(csvCell)
          .join(","),
      )
      .join("\n") +
    "\n";
  writeFileSync(csvPath, csv);
  writeFileSync(
    jsonPath,
    JSON.stringify({ generatedAt: new Date().toISOString(), dry: dryRun, site: SITE, rows }, null, 2),
  );

  const entities = [...new Set(rows.map((r) => r.entity))];
  const statuses: Status[] = ["ok", "null", "dead", "host-not-allowlisted"];
  console.log("\nImage audit" + (dryRun ? " (dry)" : ""));
  console.log("Site:", SITE);
  console.log("entity".padEnd(20) + statuses.map((s) => s.padStart(22)).join("") + " total".padStart(8));
  for (const ent of entities) {
    const subset = rows.filter((r) => r.entity === ent);
    const counts = Object.fromEntries(statuses.map((s) => [s, subset.filter((r) => r.status === s).length]));
    console.log(
      ent.padEnd(20) +
        statuses.map((s) => String(counts[s]).padStart(22)).join("") +
        String(subset.length).padStart(8),
    );
  }

  const hostFail = new Map<string, number>();
  for (const r of rows) {
    if (r.status === "ok" || r.status === "null") continue;
    const host = r.host || (r.url.startsWith("/") ? "(relative)" : "(none)");
    hostFail.set(host, (hostFail.get(host) || 0) + 1);
  }
  console.log("\nTop 10 offending hostnames");
  [...hostFail.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([h, n]) => console.log(`  ${String(n).padStart(4)}  ${h}`));

  if (!entityArg || entityArg === "canonical_flies") {
    await reportFlyMacros(rows, dryRun);
  }

  console.log(`\nWrote ${csvPath}`);
  console.log(`Wrote ${jsonPath}`);
}

type MacroFlag = {
  slug: string;
  name: string;
  url: string;
  flags: string[];
  width: number;
  height: number;
  aspect: number;
  fill: number;
  minHook: number | null;
};

async function reportFlyMacros(rows: Row[], dry: boolean): Promise<void> {
  const flies = rows.filter(
    (r) => r.entity === "canonical_flies" && r.column === "hero_image_url" && r.status === "ok" && r.url,
  );
  if (flies.length === 0 || dry) {
    console.log("\nFly-macro check skipped (no ok fly heroes, or --dry).");
    return;
  }

  const sb = makeClient();
  const { data, error } = await sb
    .from("canonical_flies")
    .select("slug, name, sizes, option_envelope, hero_image_url");
  if (error) {
    console.log(`\nFly-macro check: could not read sizes (${error.message}). Flagging geometry only.`);
  }
  const sizeBySlug = new Map<string, number[]>();
  for (const rec of data ?? []) {
    const raw =
      (rec as { sizes?: unknown }).sizes ??
      (rec as { option_envelope?: { sizes?: unknown } }).option_envelope?.sizes;
    const nums = (Array.isArray(raw) ? raw : [])
      .map((v) => Number(String(v).replace(/[^0-9.]/g, "")))
      .filter((n) => Number.isFinite(n) && n > 0);
    sizeBySlug.set(String((rec as { slug?: string }).slug ?? ""), nums);
  }

  const flags: MacroFlag[] = [];
  await runPool(flies, 4, async (row) => {
    const target = row.url.startsWith("/") ? SITE + row.url : row.url;
    try {
      const res = await fetch(target, {
        headers: { "User-Agent": "executive-angler-image-audit/1.0" },
        signal: AbortSignal.timeout(12000),
      });
      if (!res.ok) return;
      const buf = Buffer.from(await res.arrayBuffer());
      const img = sharp(buf);
      const meta = await img.metadata();
      const width = meta.width ?? 0;
      const height = meta.height ?? 0;
      if (!width || !height) return;
      const aspect = width / height;
      const { data: raw, info } = await img
        .resize(64, 64, { fit: "fill" })
        .removeAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
      const paperish = (i: number) => {
        const r = raw[i];
        const g = raw[i + 1];
        const b = raw[i + 2];
        return r > 220 && g > 210 && b > 200 && Math.abs(r - g) < 25 && Math.abs(g - b) < 25;
      };
      const corners = [0, 63, 64 * 63, 64 * 64 - 1].map((px) => paperish(px * 3));
      const cornersPaper = corners.filter(Boolean).length >= 3;
      let subject = 0;
      for (let i = 0; i < raw.length; i += info.channels) {
        if (!paperish(i)) subject += 1;
      }
      const fill = subject / (64 * 64);
      const hooks = sizeBySlug.get(row.slug) ?? [];
      const minHook = hooks.length ? Math.min(...hooks) : null;
      const found: string[] = [];
      if (aspect < 0.8 || aspect > 1.25) found.push(`aspect ${aspect.toFixed(2)} (want ~1:1)`);
      if (!cornersPaper) found.push("corners not paper/white");
      if (minHook !== null && minHook >= 18 && fill > 0.55) {
        found.push(`#${minHook} fills ${(fill * 100).toFixed(0)}% — midge should read smaller than a streamer`);
      }
      if (minHook !== null && minHook <= 6 && fill < 0.2) {
        found.push(`#${minHook} fills ${(fill * 100).toFixed(0)}% — streamer looks undersized`);
      }
      if (found.length) {
        flags.push({
          slug: row.slug,
          name: row.name,
          url: row.url,
          flags: found,
          width,
          height,
          aspect,
          fill,
          minHook,
        });
      }
    } catch {
      /* skip undecodable */
    }
  });

  flags.sort((a, b) => a.slug.localeCompare(b.slug));
  const date = new Date().toISOString().slice(0, 10);
  const macroPath = join(process.cwd(), "reports", `fly-macros-${date}.json`);
  writeFileSync(macroPath, JSON.stringify({ generatedAt: new Date().toISOString(), flags }, null, 2));
  console.log(`\nFly-macro check: ${flags.length} flagged of ${flies.length} ok heroes`);
  for (const f of flags.slice(0, 15)) {
    console.log(`  ${f.slug}: ${f.flags.join("; ")}`);
  }
  if (flags.length > 15) console.log(`  … ${flags.length - 15} more`);
  console.log(`Wrote ${macroPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
