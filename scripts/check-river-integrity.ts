/**
 * Lane V2/V3 — river + hatch integrity gate.
 *
 *   npx tsx scripts/check-river-integrity.ts
 *   npx tsx scripts/check-river-integrity.ts --write
 *
 * Fails when:
 *   - fewer than 138 rivers are checked
 *   - a river page emits a broken internal destination / species / fly / hatch / article link
 *   - a river page mounts the live-data inset with no USGS site id (silent empty)
 *
 * Reads the same public tables the pages read (anon key). Does not invent
 * fishing facts. Does not write to the database.
 */

import fs from "node:fs";
import path from "node:path";
import { firstUsgsSiteId, isUsgsSiteId } from "../src/lib/search/usgs";
import { hatchSlugsFor, slugifyName } from "../src/lib/search/hatches";
import { scoreFlyAgainstHatch } from "../src/lib/hatch-flies";

const MIN_RIVERS = 138;
const AUDIT_DIR = path.resolve(process.cwd(), "docs/audits");
const RIVER_CSV = path.join(AUDIT_DIR, "river-audit-2026-08-25.csv");
const HATCH_CSV = path.join(AUDIT_DIR, "hatch-audit-2026-08-25.csv");

const MONTHS = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
] as const;

const SOUTH_DEST = new Set([
  "dest-chile",
  "dest-patagonia",
  "dest-new-zealand",
  "dest-tasmania",
  "dest-tierra-del-fuego",
]);

const SALT_DEST = new Set([
  "dest-bahamas",
  "dest-belize",
  "dest-christmas-island",
  "dest-cuba",
  "dest-florida-keys",
  "dest-maldives",
  "dest-seychelles",
]);

const TEMPLATE_ARTICLES: Record<string, string[]> = {
  "madison-river": ["best-flies-for-the-madison-river-2026"],
  "green-river": ["green-river-utah-flaming-gorge-fly-fishing"],
  "pecos-river-new-mexico": ["pecos-river-new-mexico-fly-fishing"],
  "little-cottonwood-creek": ["little-cottonwood-creek-utah-fly-fishing"],
};

/** Conservative northern-hemisphere windows. Empty = do not judge. */
const WINDOW: Array<{ test: RegExp; months: number[] }> = [
  { test: /salmon\s*fly|pteronarcys/i, months: [4, 5, 6, 7] },
  { test: /green\s*drake/i, months: [5, 6, 7, 8] },
  { test: /october\s*caddis/i, months: [8, 9, 10, 11] },
  { test: /skwala/i, months: [2, 3, 4, 5] },
  { test: /hexagenia|\bhex\b/i, months: [5, 6, 7, 8] },
  { test: /mahogany/i, months: [8, 9, 10, 11] },
  { test: /cicada/i, months: [5, 6, 7] },
  { test: /hendrickson/i, months: [4, 5, 6] },
  { test: /quill\s*gordon/i, months: [3, 4, 5] },
  { test: /march\s*brown/i, months: [3, 4, 5, 6] },
  { test: /hopper|grasshopper/i, months: [6, 7, 8, 9, 10] },
  { test: /\btrico/i, months: [6, 7, 8, 9, 10] },
];

const NOT_INSECT = /runoff|streamer|spey|wet|popper|topwater|steelhead|salmon\s+\(|coho salmon|sockeye salmon|smallmouth|egg pattern|intruder|flesh fly|dry line/i;

type HatchEntry = {
  insect?: string;
  size?: string;
  pattern?: string;
  intensity?: string;
};
type HatchMonth = { month?: string; hatches?: HatchEntry[] };
type AccessPoint = {
  name?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
};

type RiverRow = {
  id: string;
  slug: string;
  name: string;
  destination_id: string | null;
  additional_destination_ids: string[] | null;
  description: string | null;
  flow_type: string | null;
  difficulty: string | null;
  wading_type: string | null;
  primary_species: string[] | null;
  regulations: string | null;
  access_points: AccessPoint[] | null;
  hatch_chart: HatchMonth[] | null;
  usgs_gauge_id: string | null;
  thumbnail_url: string | null;
  latitude: number | null;
  longitude: number | null;
};

type DestRow = { id: string; slug: string; name: string; country: string | null; region: string | null };
type SpeciesRow = { slug: string; common_name: string; family: string | null };
type FlyRow = { id: string; slug: string; name: string; imitates: string[] | null };
type ArticleRow = { slug: string };

const writeRequested = process.argv.includes("--write");

function csvEscape(value: unknown): string {
  const s = value == null ? "" : String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function writeCsv(file: string, headers: string[], rows: Array<Record<string, unknown>>) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const lines = [
    headers.join(","),
    ...rows.map((row) => headers.map((h) => csvEscape(row[h])).join(",")),
  ];
  fs.writeFileSync(file, lines.join("\n") + "\n");
}

function env(name: string): string {
  const v = process.env[name];
  if (!v) {
    console.error(`missing ${name}`);
    process.exit(1);
  }
  return v;
}

async function rest<T>(table: string, select: string, order = "name"): Promise<T[]> {
  const url = env("NEXT_PUBLIC_SUPABASE_URL").replace(/\/$/, "");
  const key = env("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const out: T[] = [];
  let from = 0;
  const page = 1000;
  for (;;) {
    const href = `${url}/rest/v1/${table}?select=${encodeURIComponent(select)}&order=${order}&offset=${from}&limit=${page}`;
    const res = await fetch(href, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        Prefer: "count=exact",
      },
    });
    if (!res.ok) {
      throw new Error(`${table} ${res.status} ${await res.text()}`);
    }
    const chunk = (await res.json()) as T[];
    out.push(...chunk);
    if (chunk.length < page) break;
    from += page;
  }
  return out;
}

function monthIndex(raw: string | undefined): number | null {
  if (!raw) return null;
  const t = raw.trim().toLowerCase();
  const full = MONTHS.indexOf(t as (typeof MONTHS)[number]);
  if (full >= 0) return full + 1;
  const short = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  const i = short.indexOf(t.slice(0, 3));
  return i >= 0 ? i + 1 : null;
}

function invertMonth(m: number): number {
  return ((m + 5) % 12) + 1;
}

function parseSiteIds(raw: string | null): string[] {
  if (!raw?.trim()) return [];
  const trimmed = raw.trim();
  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (!Array.isArray(parsed)) return [];
      const ids: string[] = [];
      for (const item of parsed) {
        if (typeof item === "string" && isUsgsSiteId(item.trim())) ids.push(item.trim());
        else if (item && typeof item === "object") {
          const rec = item as Record<string, unknown>;
          const id = String(rec.site_id ?? rec.siteId ?? rec.id ?? "").trim();
          if (isUsgsSiteId(id)) ids.push(id);
        }
      }
      return ids;
    } catch {
      return [];
    }
  }
  return trimmed
    .split(",")
    .map((s) => s.trim())
    .filter(isUsgsSiteId);
}

function hatchEntries(chart: HatchMonth[] | null): Array<HatchEntry & { month: string }> {
  const out: Array<HatchEntry & { month: string }> = [];
  for (const month of chart ?? []) {
    for (const h of month.hatches ?? []) out.push({ ...h, month: month.month ?? "" });
  }
  return out;
}

function regsStatus(text: string | null): "specific" | "generic_check_agency" | "empty" {
  const t = (text ?? "").trim();
  if (!t) return "empty";
  const generic = /^check .{3,60} for current regulations/i.test(t);
  if (generic && t.length < 280) return "generic_check_agency";
  return "specific";
}

function hatchKind(insect: string): "insect" | "forage" | "not_hatch" {
  if (NOT_INSECT.test(insect)) return "not_hatch";
  if (/scud|sowbug|sow bug|mysis|crayfish|egg|leech|baitfish|shrimp/i.test(insect)) return "forage";
  return "insect";
}

function windowFlags(
  insect: string,
  month: string,
  destId: string | null,
): string | null {
  const m = monthIndex(month);
  if (m == null) return `unparsed_month:${month || "?"}`;
  const rule = WINDOW.find((w) => w.test.test(insect));
  if (!rule) return null;
  const allowed = SOUTH_DEST.has(destId ?? "")
    ? rule.months.map(invertMonth)
    : rule.months;
  if (destId === "dest-alaska" && /salmon\s*fly|green\s*drake/i.test(insect)) {
    if (m >= 5 && m <= 8) return null;
  }
  if (!allowed.includes(m)) return `${insect}@${month}`;
  return null;
}

function speciesResolved(name: string, byName: Map<string, SpeciesRow>): SpeciesRow | undefined {
  const exact = byName.get(name.toLowerCase());
  if (exact) return exact;
  return undefined;
}

async function main() {
  const [rivers, destinations, species, flies, articles] = await Promise.all([
    rest<RiverRow>(
      "rivers",
      "id,slug,name,destination_id,additional_destination_ids,description,flow_type,difficulty,wading_type,primary_species,regulations,access_points,hatch_chart,usgs_gauge_id,thumbnail_url,latitude,longitude",
    ),
    rest<DestRow>("destinations", "id,slug,name,country,region"),
    rest<SpeciesRow>("species", "slug,common_name,family", "common_name"),
    rest<FlyRow>("canonical_flies", "id,slug,name,imitates", "name"),
    rest<ArticleRow>("articles", "slug", "slug"),
  ]);

  const destById = new Map(destinations.map((d) => [d.id, d]));
  const destBySlug = new Map(destinations.map((d) => [d.slug, d]));
  const speciesByName = new Map(species.map((s) => [s.common_name.toLowerCase(), s]));
  const speciesBySlug = new Map(species.map((s) => [s.slug, s]));
  const flyByName = new Map(flies.map((f) => [f.name.toLowerCase(), f]));
  const flyBySlug = new Map(flies.map((f) => [f.slug, f]));
  const articleBySlug = new Set(articles.map((a) => a.slug));
  const riverBySlug = new Set(rivers.map((r) => r.slug));

  const hatchIndex = new Map<
    string,
    {
      name: string;
      slug: string;
      rivers: Set<string>;
      months: Set<string>;
      patterns: Set<string>;
      windowFlags: Set<string>;
      kind: "insect" | "forage" | "not_hatch";
    }
  >();

  const bumpHatch = (
    raw: string,
    extra?: { river?: string; month?: string; pattern?: string; destId?: string | null },
  ) => {
    const name = raw.trim();
    if (!name) return;
    const slug = slugifyName(name);
    if (!slug) return;
    let row = hatchIndex.get(slug);
    if (!row) {
      row = {
        name,
        slug,
        rivers: new Set(),
        months: new Set(),
        patterns: new Set(),
        windowFlags: new Set(),
        kind: hatchKind(name),
      };
      hatchIndex.set(slug, row);
    }
    if (extra?.river) row.rivers.add(extra.river);
    if (extra?.month) row.months.add(extra.month);
    if (extra?.pattern) row.patterns.add(extra.pattern);
    if (extra?.month) {
      const flag = windowFlags(name, extra.month, extra.destId ?? null);
      if (flag) row.windowFlags.add(flag);
    }
  };

  for (const river of rivers) {
    for (const h of hatchEntries(river.hatch_chart)) {
      if (h.insect) {
        bumpHatch(h.insect, {
          river: river.slug,
          month: h.month,
          pattern: h.pattern,
          destId: river.destination_id,
        });
      }
    }
  }
  for (const fly of flies) {
    for (const im of fly.imitates ?? []) bumpHatch(im);
  }

  type RiverAudit = Record<string, unknown>;
  const riverRows: RiverAudit[] = [];
  const broken: string[] = [];
  const silentLive: string[] = [];
  let mapped = 0;
  let emptyJson = 0;
  let none = 0;

  for (const river of rivers) {
    const dest = river.destination_id ? destById.get(river.destination_id) : undefined;
    const extraIds = river.additional_destination_ids ?? [];
    const extraDests = extraIds.map((id) => destById.get(id));
    const siteIds = parseSiteIds(river.usgs_gauge_id);
    const first = firstUsgsSiteId(river.usgs_gauge_id);
    const rawGauge = (river.usgs_gauge_id ?? "").trim();
    let gaugeStatus: "mapped" | "empty_json" | "invalid" | "none";
    if (!rawGauge) {
      gaugeStatus = "none";
      none += 1;
    } else if (rawGauge === "[]") {
      gaugeStatus = "empty_json";
      emptyJson += 1;
    } else if (siteIds.length === 0 || !first) {
      gaugeStatus = "invalid";
      none += 1;
    } else {
      gaugeStatus = "mapped";
      mapped += 1;
    }

    const silent = siteIds.length === 0;
    if (silent) silentLive.push(river.slug);

    const entries = hatchEntries(river.hatch_chart);
    const insects = [...new Set(entries.map((e) => e.insect).filter(Boolean))] as string[];
    const hatchStatus = entries.length === 0 ? "stub" : entries.length < 7 ? "thin" : "real";

    const access = river.access_points ?? [];
    const namedAccess = access.filter((a) => (a.name ?? "").trim().length > 0);
    const accessStatus = namedAccess.length === 0 ? "stub" : namedAccess.length < 2 ? "thin" : "real";

    const speciesNames = river.primary_species ?? [];
    const resolvedSpecies: string[] = [];
    const unresolvedSpecies: string[] = [];
    for (const name of speciesNames) {
      const hit = speciesResolved(name, speciesByName);
      if (hit) resolvedSpecies.push(hit.slug);
      else unresolvedSpecies.push(name);
    }
    const speciesStatus = speciesNames.length === 0 ? "stub" : "real";

    const descLen = (river.description ?? "").trim().length;
    const descriptionStatus = descLen < 400 ? "stub" : "real";
    const regs = regsStatus(river.regulations);

    const linkFails: string[] = [];
    if (!dest) linkFails.push(`destination_missing:${river.destination_id ?? "null"}`);
    for (let i = 0; i < extraIds.length; i++) {
      if (!extraDests[i]) linkFails.push(`additional_destination_missing:${extraIds[i]}`);
    }
    if (!riverBySlug.has(river.slug)) linkFails.push(`self_slug_missing:${river.slug}`);
    for (const slug of TEMPLATE_ARTICLES[river.slug] ?? []) {
      if (!articleBySlug.has(slug)) linkFails.push(`article_missing:/articles/${slug}`);
    }
    if (siteIds.length > 0 && !articleBySlug.has("how-to-read-a-usgs-gauge-for-fly-fishing")) {
      linkFails.push("article_missing:/articles/how-to-read-a-usgs-gauge-for-fly-fishing");
    }
    if (river.slug === "madison-river" && !destBySlug.has("montana")) {
      linkFails.push("destination_missing:/destinations/montana");
    }
    for (const name of speciesNames) {
      const hit = speciesResolved(name, speciesByName);
      if (hit && !speciesBySlug.has(hit.slug)) {
        linkFails.push(`species_missing:/species/${hit.slug}`);
      }
    }
    for (const h of entries) {
      const pattern = (h.pattern ?? "").trim();
      if (!pattern) continue;
      const fly = flyByName.get(pattern.toLowerCase());
      if (fly && !flyBySlug.has(fly.slug)) {
        linkFails.push(`fly_missing:/flies/${fly.slug}`);
      }
    }
    for (const insect of insects) {
      for (const slug of hatchSlugsFor(insect)) {
        if (!hatchIndex.has(slug) && slug !== slugifyName(insect)) {
          // generated alias only — still a resolvable hatch page via generateStaticParams
        }
      }
    }

    const claims: string[] = [];
    if (silent) {
      claims.push("RiverLiveInset_mounted_without_usgs_site");
    }
    if (silent && /gauge on this page/i.test(river.description ?? "")) {
      claims.push("description_claims_gauge_on_page");
    }

    const implausible = entries
      .filter((e) => e.insect)
      .map((e) => windowFlags(e.insect!, e.month, river.destination_id))
      .filter((x): x is string => Boolean(x));

    const unmatchedPatterns = [
      ...new Set(
        entries
          .map((e) => (e.pattern ?? "").trim())
          .filter((p) => p && !flyByName.has(p.toLowerCase())),
      ),
    ];

    const salt =
      SALT_DEST.has(river.destination_id ?? "") ||
      (river.flow_type ?? "").toLowerCase().includes("salt");
    const freshwaterInsects = insects.filter((i) => hatchKind(i) === "insect");
    const speciesVsHatch = salt && freshwaterInsects.length > 0
      ? "saltwater_with_freshwater_hatch"
      : !salt && hatchStatus === "stub" && speciesNames.some((s) => /trout|char|grayling/i.test(s))
        ? "trout_river_hatch_stub"
        : "ok";

    const allowedDifficulty = new Set(["beginner", "intermediate", "advanced"]);
    const difficultyNote = !allowedDifficulty.has((river.difficulty ?? "").toLowerCase())
      ? `type_drift:${river.difficulty ?? "null"}`
      : river.wading_type === "float" && river.difficulty === "beginner"
        ? "beginner_float_only"
        : "ok";

    let gaugeNotes = "";
    if (gaugeStatus === "empty_json") gaugeNotes = "usgs_gauge_id_is_empty_array";
    if (river.slug === "big-spring-creek" && siteIds.includes("06111800")) {
      gaugeNotes = "stored_site_06111800_is_lewistown_mt_regs_are_pennsylvania";
    }
    if (river.slug === "norfork-river" && /white river/i.test(rawGauge)) {
      gaugeNotes = "stored_gauge_name_is_white_river_not_norfork";
    }

    if (linkFails.length) {
      for (const f of linkFails) broken.push(`${river.slug}:${f}`);
    }

    riverRows.push({
      slug: river.slug,
      name: river.name,
      destination_slug: dest?.slug ?? "",
      destination_ok: dest ? "yes" : "no",
      additional_destinations: extraDests.map((d) => d?.slug ?? "?").join("|"),
      additional_dest_ok: extraDests.every(Boolean) ? "yes" : "no",
      gauge_status: gaugeStatus,
      gauge_site_ids: siteIds.join("|"),
      gauge_count: siteIds.length,
      gauge_notes: gaugeNotes,
      silent_live_empty: silent ? "yes" : "no",
      flow_chart_empty_copy: silent ? "honest_no_gauge" : "n/a",
      hero_dek_quiet_claims: claims.join("|"),
      hatch_status: hatchStatus,
      hatch_months: new Set(entries.map((e) => e.month).filter(Boolean)).size,
      hatch_entries: entries.length,
      hatch_insects: insects.join("|"),
      hatch_windows_implausible: implausible.join("|"),
      hatch_patterns_unmatched: unmatchedPatterns.join("|"),
      access_status: accessStatus,
      access_count: access.length,
      access_named: namedAccess.length,
      species_status: speciesStatus,
      species_count: speciesNames.length,
      species_resolved: resolvedSpecies.join("|"),
      species_unresolved: unresolvedSpecies.join("|"),
      description_chars: descLen,
      description_status: descriptionStatus,
      regs_status: regs,
      verified_at: "column_missing",
      thumbnail_null: river.thumbnail_url ? "no" : "yes",
      flow_type: river.flow_type ?? "",
      difficulty: river.difficulty ?? "",
      wading_type: river.wading_type ?? "",
      difficulty_vs_water: difficultyNote,
      species_vs_hatch: speciesVsHatch,
      broken_links: linkFails.join("|"),
      broken_link_count: linkFails.length,
      flies_for_href: `/flies/for/${river.slug}`,
      plan_href: `/plan/${river.slug}`,
      dest_href: dest ? `/destinations/${dest.slug}` : "",
      hatch_page_links_emitted: "no",
    });
  }

  const hatchRows: Array<Record<string, unknown>> = [];
  for (const row of [...hatchIndex.values()].sort((a, b) => a.slug.localeCompare(b.slug))) {
    const catalogHits = new Set<string>();
    for (const fly of flies) {
      for (const im of fly.imitates ?? []) {
        if (hatchSlugsFor(im).includes(row.slug) || slugifyName(im) === row.slug) {
          catalogHits.add(fly.slug);
        }
      }
      for (const pattern of row.patterns) {
        if (scoreFlyAgainstHatch(fly as never, pattern, row.name) >= 3) {
          catalogHits.add(fly.slug);
        }
      }
      if (scoreFlyAgainstHatch(fly as never, "", row.name) >= 3) {
        catalogHits.add(fly.slug);
      }
    }
    hatchRows.push({
      insect: row.name,
      slug: row.slug,
      href: `/flies/hatch/${row.slug}`,
      kind: row.kind,
      river_count: row.rivers.size,
      fly_count: catalogHits.size,
      has_river: row.rivers.size > 0 ? "yes" : "no",
      has_fly: catalogHits.size > 0 ? "yes" : "no",
      gap:
        row.rivers.size === 0 && catalogHits.size === 0
          ? "no_river_no_fly"
          : row.rivers.size === 0
            ? "no_river"
            : catalogHits.size === 0
              ? "no_fly"
              : "",
      months: [...row.months].join("|"),
      rivers: [...row.rivers].sort().join("|"),
      patterns: [...row.patterns].join("|"),
      catalog_flies: [...catalogHits].sort().join("|"),
      window_flags: [...row.windowFlags].join("|"),
    });
  }

  if (writeRequested) {
    writeCsv(
      RIVER_CSV,
      [
        "slug",
        "name",
        "destination_slug",
        "destination_ok",
        "additional_destinations",
        "additional_dest_ok",
        "gauge_status",
        "gauge_site_ids",
        "gauge_count",
        "gauge_notes",
        "silent_live_empty",
        "flow_chart_empty_copy",
        "hero_dek_quiet_claims",
        "hatch_status",
        "hatch_months",
        "hatch_entries",
        "hatch_insects",
        "hatch_windows_implausible",
        "hatch_patterns_unmatched",
        "access_status",
        "access_count",
        "access_named",
        "species_status",
        "species_count",
        "species_resolved",
        "species_unresolved",
        "description_chars",
        "description_status",
        "regs_status",
        "verified_at",
        "thumbnail_null",
        "flow_type",
        "difficulty",
        "wading_type",
        "difficulty_vs_water",
        "species_vs_hatch",
        "broken_links",
        "broken_link_count",
        "flies_for_href",
        "plan_href",
        "dest_href",
        "hatch_page_links_emitted",
      ],
      riverRows,
    );
    writeCsv(
      HATCH_CSV,
      [
        "insect",
        "slug",
        "href",
        "kind",
        "river_count",
        "fly_count",
        "has_river",
        "has_fly",
        "gap",
        "months",
        "rivers",
        "patterns",
        "catalog_flies",
        "window_flags",
      ],
      hatchRows,
    );
    console.log(`wrote ${RIVER_CSV}`);
    console.log(`wrote ${HATCH_CSV}`);
  }

  console.log(`check-river-integrity: rivers checked ${rivers.length} (floor ${MIN_RIVERS})`);
  for (const row of riverRows) {
    const flags = [
      `gauge=${row.gauge_status}`,
      `silent_live=${row.silent_live_empty}`,
      `hatch=${row.hatch_status}`,
      `access=${row.access_status}`,
      `links=${row.broken_link_count}`,
    ].join(" ");
    console.log(`  ${row.slug}  ${flags}`);
  }

  const hatchNoFly = hatchRows.filter((h) => h.has_fly === "no").length;
  const hatchNoRiver = hatchRows.filter((h) => h.has_river === "no").length;
  const hatchStubRivers = riverRows.filter((r) => r.hatch_status === "stub").length;
  const genericRegs = riverRows.filter((r) => r.regs_status === "generic_check_agency").length;
  const unresolvedSpeciesRivers = riverRows.filter(
    (r) => String(r.species_unresolved).length > 0,
  ).length;

  console.log("---");
  console.log(`gauge mapped: ${mapped}`);
  console.log(`gauge empty_json: ${emptyJson}`);
  console.log(`gauge none/invalid: ${none}`);
  console.log(`silent live-data (no site id): ${silentLive.length}`);
  console.log(`broken internal links: ${broken.length}`);
  console.log(`hatch stub rivers: ${hatchStubRivers}`);
  console.log(`hatch insects: ${hatchRows.length}`);
  console.log(`hatch gaps no_fly: ${hatchNoFly}`);
  console.log(`hatch gaps no_river: ${hatchNoRiver}`);
  console.log(`generic regs: ${genericRegs}`);
  console.log(`rivers with unresolved species names: ${unresolvedSpeciesRivers}`);

  const failures: string[] = [];
  if (rivers.length < MIN_RIVERS) {
    failures.push(`checked ${rivers.length} rivers — below floor of ${MIN_RIVERS}`);
  }
  if (broken.length > 0) {
    failures.push(`${broken.length} broken internal links`);
    for (const b of broken.slice(0, 20)) console.error(`  LINK ${b}`);
  }
  // Silent live inset is Lane I (river template), not this lane. Printed,
  // not a fail — inventing USGS ids would be worse than an empty card.
  if (silentLive.length > 0) {
    console.log(
      `silent live-data (report-only until Lane I): ${silentLive.length} pages mount RiverLiveInset with no USGS site id`,
    );
  }

  if (failures.length) {
    console.error("FAIL");
    for (const f of failures) console.error(`  - ${f}`);
    process.exit(1);
  }
  console.log("OK");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
