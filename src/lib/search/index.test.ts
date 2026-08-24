import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { SearchDocument } from "./types";
import { rankSearch } from "./rank";
import { GROUP_ORDER } from "./types";
import { buildHatchDocuments } from "./hatches";
import { isUsgsSiteId } from "./usgs";

function doc(
  partial: Omit<SearchDocument, "href" | "subtitle"> & { subtitle?: string },
): SearchDocument {
  return {
    subtitle: partial.subtitle ?? "",
    href: `/${partial.type}/${partial.slug}`,
    ...partial,
  };
}

/** One Green River spanning WY+UT, a PMD hatch, a shop named Hatch. */
const CORPUS: SearchDocument[] = [
  doc({
    type: "river",
    slug: "green-river",
    title: "Green River",
    subtitle: "Wyoming / Utah — tailwater",
    keywords: "pmd pale morning dun baetis wyoming utah",
    flowType: "tailwater",
    featured: true,
  }),
  doc({
    type: "river",
    slug: "madison-river",
    title: "Madison River",
    subtitle: "Montana — freestone",
    keywords: "pmd pale morning dun montana",
    flowType: "freestone",
    featured: true,
  }),
  doc({
    type: "river",
    slug: "missouri-river",
    title: "Missouri River",
    subtitle: "Montana — tailwater",
    keywords: "the mo missouri montana tailwater",
    flowType: "tailwater",
    featured: true,
  }),
  doc({
    type: "river",
    slug: "bighorn-river",
    title: "Bighorn River",
    subtitle: "Montana — tailwater",
    keywords: "montana tailwater",
    flowType: "tailwater",
  }),
  doc({
    type: "river",
    slug: "yellowstone-river",
    title: "Yellowstone River",
    subtitle: "Montana — freestone",
    flowType: "freestone",
  }),
  doc({
    type: "river",
    slug: "gallatin-river",
    title: "Gallatin River",
    subtitle: "Montana — freestone",
    flowType: "freestone",
  }),
  doc({
    type: "fly",
    slug: "pheasant-tail",
    title: "Pheasant Tail",
    subtitle: "nymph — Sizes 14–20",
    keywords: "pt pheasant tail nymph mayfly",
    category: "nymph",
  }),
  doc({
    type: "fly",
    slug: "pmd-sparkle-dun",
    title: "PMD Sparkle Dun",
    subtitle: "dry — Sizes 16–20",
    keywords: "pmd pale morning dun dry",
    category: "dry",
  }),
  doc({
    type: "fly",
    slug: "rs2",
    title: "RS2",
    subtitle: "emerger — Sizes 18–22",
    keywords: "pmd bwo baetis emerger",
  }),
  doc({
    type: "hatch",
    slug: "pale-morning-dun",
    title: "Pale Morning Dun",
    subtitle: "May–July · 2 rivers",
    keywords: "pmd pale morning dun ephemerella hatch",
    months: ["May", "June", "July"],
    riverCount: 2,
  }),
  doc({
    type: "hatch",
    slug: "blue-winged-olive",
    title: "Blue-Winged Olive",
    subtitle: "Mar–Nov · 3 rivers",
    keywords: "bwo baetis blue winged olive hatch",
  }),
  doc({
    type: "destination",
    slug: "montana",
    title: "Montana",
    subtitle: "Northern Rockies, United States",
    keywords: "tailwater freestone",
  }),
  doc({
    type: "destination",
    slug: "new-zealand",
    title: "New Zealand",
    subtitle: "Oceania, New Zealand",
  }),
  doc({
    type: "species",
    slug: "brown-trout",
    title: "Brown Trout",
    subtitle: "Salmo trutta",
    keywords: "browns salmo trutta",
  }),
  doc({
    type: "article",
    slug: "when-to-fish-a-streamer",
    title: "When to Fish a Streamer",
    subtitle: "technique — 8 min",
    keywords: "streamer streamers baitfish",
    readingTimeMinutes: 8,
    category: "technique",
  }),
  doc({
    type: "fly-shop",
    slug: "the-evening-hatch",
    title: "The Evening Hatch",
    subtitle: "Washington",
    keywords: "shop retail washington",
  }),
  doc({
    type: "lodge",
    slug: "firehole-ranch",
    title: "Firehole Ranch",
    subtitle: "Montana",
  }),
];

function titles(result: ReturnType<typeof rankSearch>, type?: string) {
  const groups = type ? result.groups.filter((g) => g.type === type) : result.groups;
  return groups.flatMap((g) => g.items.map((i) => i.doc.title));
}

describe("rankSearch", () => {
  it("green river: Rivers group first, Green River is the top river", () => {
    const r = rankSearch("green river", CORPUS);
    assert.equal(r.groups[0]?.type, "river");
    assert.equal(r.groups[0]?.items[0]?.doc.title, "Green River");
    assert.ok(r.groups[0]!.items.length <= 5);
    assert.ok(r.groups[0]!.total >= r.groups[0]!.items.length);
    assert.equal(
      r.groups[0]!.items.filter((i) => i.doc.title === "Green River").length,
      1,
    );
    assert.match(r.groups[0]!.items[0]!.doc.subtitle, /Utah/i);
    assert.match(r.groups[0]!.items[0]!.doc.subtitle, /Wyoming/i);
  });

  it("pmd hatch: Pale Morning Dun hatch + PMD flies + PMD rivers; shop not above them", () => {
    const r = rankSearch("pmd hatch", CORPUS);
    assert.ok(titles(r, "hatch").includes("Pale Morning Dun"));
    assert.ok(titles(r, "fly").some((t) => /pmd|sparkle|rs2/i.test(t)));
    assert.ok(titles(r, "river").includes("Green River") || titles(r, "river").includes("Madison River"));

    const flat = r.groups.flatMap((g) => g.items.map((i) => i.doc));
    const shopIdx = flat.findIndex((d) => d.title === "The Evening Hatch");
    const hatchIdx = flat.findIndex((d) => d.title === "Pale Morning Dun");
    const flyIdx = flat.findIndex((d) => d.type === "fly");
    const riverIdx = flat.findIndex((d) => d.type === "river");
    if (shopIdx >= 0) {
      assert.ok(shopIdx > hatchIdx, "shop must not outrank the PMD hatch");
      if (flyIdx >= 0) assert.ok(shopIdx > flyIdx);
      if (riverIdx >= 0) assert.ok(shopIdx > riverIdx);
    }
  });

  it("pheasant tail: exact fly is result 1", () => {
    const r = rankSearch("pheasant tail", CORPUS);
    const first = r.groups[0]?.items[0]?.doc;
    assert.equal(first?.title, "Pheasant Tail");
    assert.equal(first?.type, "fly");
  });

  it("pt nymph: alias resolves to Pheasant Tail", () => {
    const r = rankSearch("pt nymph", CORPUS);
    assert.ok(titles(r, "fly").includes("Pheasant Tail"));
  });

  it("bwo: Blue-Winged Olive hatch + matching flies", () => {
    const r = rankSearch("bwo", CORPUS);
    assert.ok(titles(r, "hatch").includes("Blue-Winged Olive"));
    assert.ok(titles(r, "fly").includes("RS2"));
  });

  it("the mo: Missouri River in the top 3 overall", () => {
    const r = rankSearch("the mo", CORPUS);
    const top = r.groups.flatMap((g) => g.items.map((i) => i.doc.title)).slice(0, 3);
    assert.ok(top.includes("Missouri River"), `top 3 = ${top.join(", ")}`);
  });

  it("tailwater montana: coverage keeps only Montana tailwaters", () => {
    const r = rankSearch("tailwater montana", CORPUS);
    const rivers = r.groups.find((g) => g.type === "river")?.items.map((i) => i.doc) ?? [];
    assert.ok(rivers.length > 0);
    for (const river of rivers) {
      assert.match(river.subtitle, /Montana/i);
      assert.equal(river.flowType, "tailwater");
    }
    assert.equal(
      rivers.find((d) => d.slug === "green-river"),
      undefined,
      "Wyoming/Utah Green should not rank when Montana is required",
    );
  });

  it("green riverpheasant tail: zero results + suggestion", () => {
    const r = rankSearch("green riverpheasant tail", CORPUS);
    assert.equal(r.total, 0);
    assert.equal(r.groups.length, 0);
    assert.ok(r.suggestion, "should offer a nearest title");
  });

  it("asdkjhasd: zero results", () => {
    const r = rankSearch("asdkjhasd", CORPUS);
    assert.equal(r.total, 0);
    assert.equal(r.groups.length, 0);
  });

  it("empty query: no ranked groups (UI owns the teaching empty state)", () => {
    const r = rankSearch("", CORPUS);
    assert.equal(r.total, 0);
    assert.equal(r.groups.length, 0);
  });

  it("group order is fixed and groups are capped at 5", () => {
    const r = rankSearch("montana", CORPUS);
    const types = r.groups.map((g) => g.type);
    const orderIdx = types.map((t) => GROUP_ORDER.indexOf(t));
    for (let i = 1; i < orderIdx.length; i++) {
      assert.ok(orderIdx[i] > orderIdx[i - 1], `order ${types.join(",")}`);
    }
    for (const g of r.groups) {
      assert.ok(g.items.length <= 5);
    }
  });

  it("henry's fork: apostrophe and henrys fork both match Henry's Fork", () => {
    const docs = [
      doc({
        type: "river",
        slug: "henrys-fork",
        title: "Henry's Fork",
        subtitle: "Idaho — spring creek",
        keywords: "the fork idaho",
      }),
      ...CORPUS,
    ];
    for (const q of ["henry's fork", "henrys fork", "Henry’s Fork"]) {
      const r = rankSearch(q, docs);
      const first = r.groups.find((g) => g.type === "river")?.items[0]?.doc;
      assert.equal(first?.slug, "henrys-fork", q);
    }
  });

  it("does not promote hatch-chart pattern names to hatch documents", () => {
    const rivers = [
      {
        name: "Green River",
        hatchChart: [
          {
            month: "July",
            hatches: [{ insect: "PMD", pattern: "Sparkle Dun", size: "16" }],
          },
        ],
      },
    ] as Parameters<typeof buildHatchDocuments>[0];
    const docs = buildHatchDocuments(rivers, []);
    assert.equal(docs.length, 1);
    assert.ok(
      !docs.some((d) => /sparkle/i.test(d.title) || /sparkle/i.test(d.slug)),
      "Sparkle Dun is a pattern, not a hatch",
    );
    assert.match(docs[0].title, /pale morning dun/i);
  });

  it("accepts only 8–15 digit USGS site ids", () => {
    assert.equal(isUsgsSiteId("06041000"), true);
    assert.equal(isUsgsSiteId("06041000&period=P120D"), false);
    assert.equal(isUsgsSiteId("abc"), false);
    assert.equal(isUsgsSiteId("123"), false);
  });
});
