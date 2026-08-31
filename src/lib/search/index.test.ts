import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { SearchDocument } from "./types";
import { rankSearch } from "./rank";
import { GROUP_ORDER } from "./types";
import { buildHatchDocuments } from "./hatches";
import { isUsgsSiteId } from "./usgs";
import { expandTerm } from "./aliases";
import { buildScoreContext, scoreDocument } from "./score";

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

  it("green riverpheasant tail: glued 3-token query falls back to closest matches", () => {
    const r = rankSearch("green riverpheasant tail", CORPUS);
    // Strict AND misses. Relaxed 3-term (≥⅔) can still hit Green River
    // (green + substring "tail" inside "tailwater"). Labelled closest, not empty.
    assert.ok(r.total > 0);
    assert.equal(r.matchQuality, "closest");
    assert.ok(titles(r, "river").includes("Green River"));
  });

  it("green riverpheasant xzqfoo: still zero — not enough coverage even relaxed", () => {
    const r = rankSearch("green riverpheasant xzqfoo", CORPUS);
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
    for (const q of ["henry's fork", "henrys fork", "Henry’s Fork", "henrys"]) {
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

  it("tailwater montana is an exact match, not a closest fallback", () => {
    const r = rankSearch("tailwater montana", CORPUS);
    assert.equal(r.matchQuality, "exact");
    assert.ok(r.total > 0);
    for (const item of r.groups.flatMap((g) => g.items)) {
      assert.equal(item.matchQuality, "exact");
    }
  });

  it("two-term partial coverage still returns zero (no closest fallback)", () => {
    const r = rankSearch("tailwater iceland", CORPUS);
    assert.equal(r.total, 0);
    assert.equal(r.groups.length, 0);
    assert.equal(r.matchQuality, undefined);
  });
});

function withMadisonSeason(docs: SearchDocument[]): SearchDocument[] {
  return docs.map((d) =>
    d.slug === "madison-river"
      ? {
          ...d,
          keywords: `${d.keywords ?? ""} dry september hopper stimulator parachute`,
        }
      : d,
  );
}

describe("relaxed AND fallback", () => {
  it("4-term natural language: closest matches for madison in september", () => {
    const docs = withMadisonSeason(CORPUS);
    const r = rankSearch("best dry fly for the madison in september", docs);
    assert.ok(r.total > 0, "conversational query should return closest matches");
    assert.equal(r.matchQuality, "closest");
    assert.ok(
      titles(r, "river").includes("Madison River"),
      `rivers = ${titles(r, "river").join(", ")}`,
    );
    for (const item of r.groups.flatMap((g) => g.items)) {
      assert.equal(item.matchQuality, "closest");
    }
  });

  it("5-term natural language: closest matches when one filler term misses", () => {
    const docs = [
      ...withMadisonSeason(CORPUS),
      doc({
        type: "fly",
        slug: "stimulator",
        title: "Stimulator",
        subtitle: "dry — Sizes 8–14",
        keywords: "hopper madison september stimulator dry",
        category: "dry",
      }),
    ];
    const r = rankSearch("best stimulator hopper madison september", docs);
    assert.ok(r.total > 0, "5-term query should return closest matches");
    assert.equal(r.matchQuality, "closest");
    assert.ok(
      titles(r, "river").includes("Madison River") || titles(r, "fly").includes("Stimulator"),
      `got rivers=${titles(r, "river").join(", ")} flies=${titles(r, "fly").join(", ")}`,
    );
    for (const item of r.groups.flatMap((g) => g.items)) {
      assert.equal(item.matchQuality, "closest");
    }
  });
});

describe("term frequency memoization", () => {
  it("lazily populates ScoreContext.termFreq and reuses it across documents", () => {
    const ctx = buildScoreContext(CORPUS);
    assert.equal(ctx.termFreq.size, 0);
    scoreDocument("madison", CORPUS[1], ctx);
    assert.ok(ctx.termFreq.size > 0);
    const size = ctx.termFreq.size;
    scoreDocument("madison", CORPUS[0], ctx);
    assert.equal(ctx.termFreq.size, size);
  });

  it("ranks ~779 documents in under the memoization budget", () => {
    const n = 779;
    const index: SearchDocument[] = [];
    for (let i = 0; i < n; i++) {
      const base = CORPUS[i % CORPUS.length];
      const original = i < CORPUS.length;
      index.push({
        ...base,
        slug: original ? base.slug : `${base.slug}-${i}`,
        title: original ? base.title : `${base.title} ${i}`,
        href: original ? base.href : `/${base.type}/${base.slug}-${i}`,
        keywords: `${base.keywords ?? ""} ${i % 2 === 0 ? "montana tailwater hopper" : "freestone september dry"}`,
      });
    }

    for (const q of ["green river", "tailwater montana", "best dry fly for the madison in september"]) {
      rankSearch(q, index);
    }

    let best = Infinity;
    for (let i = 0; i < 20; i++) {
      const t0 = performance.now();
      rankSearch("best dry fly for the madison in september", index);
      best = Math.min(best, performance.now() - t0);
    }
    const budget = process.env.CI ? 32 : 16;
    assert.ok(best < budget, `ranking 779 docs took ${best.toFixed(2)}ms (need < ${budget}ms)`);
  });
});

describe("alias expansions", () => {
  it("misspellings resolve to the river", () => {
    assert.ok(titles(rankSearch("madision", CORPUS), "river").includes("Madison River"));
    assert.ok(titles(rankSearch("missourri", CORPUS), "river").includes("Missouri River"));
  });

  it("the-X river nicknames still hit Bighorn, Deschutes, Green", () => {
    assert.ok(titles(rankSearch("the bighorn", CORPUS), "river").includes("Bighorn River"));
    const withDeschutes = [
      doc({
        type: "river",
        slug: "deschutes-river",
        title: "Deschutes River",
        subtitle: "Oregon — freestone",
      }),
      ...CORPUS,
    ];
    assert.ok(
      titles(rankSearch("the deschutes", withDeschutes), "river").includes("Deschutes River"),
    );
    assert.ok(titles(rankSearch("the green", CORPUS), "river").includes("Green River"));
  });

  it("hatch, fly, and hook vocabulary expand", () => {
    const hopper = expandTerm("hopper");
    assert.ok(hopper.some((v) => /grasshopper|hoppers/.test(v)));
    assert.ok(expandTerm("skwala").length > 1);
    assert.ok(expandTerm("trico").some((v) => /trico/.test(v)));
    assert.ok(expandTerm("sex dungeon").includes("sex dungeons"));
    assert.ok(expandTerm("circus peanut").includes("circus peanuts"));
    assert.ok(expandTerm("weezy").includes("weiser") || expandTerm("weezy").includes("weiser river"));
    assert.ok(expandTerm("size 16").some((v) => v === "16" || v.includes("hook")));
    assert.ok(expandTerm("#16").some((v) => v.includes("size") || v.includes("hook")));
    assert.ok(expandTerm("2xl").some((v) => /2x long|2xl/.test(v)));
    assert.ok(expandTerm("3xl").length > 1);
    assert.ok(expandTerm("4xl").length > 1);
    assert.ok(expandTerm("std").some((v) => /standard/.test(v)));
    assert.ok(expandTerm("1x fine").some((v) => /1xf|1x fine/.test(v)));
    assert.ok(expandTerm("2x heavy").some((v) => /2xh|2x heavy/.test(v)));
    assert.ok(expandTerm("barbless").includes("barbless hook"));
    assert.ok(expandTerm("yellowstone").includes("yellowstone river"));
    assert.ok(expandTerm("henry fork").includes("henrys fork") || expandTerm("henry fork").includes("henry's fork"));
    assert.ok(expandTerm("henrys").some((v) => v.includes("henrys fork") || v.includes("henry's fork")));
  });
});
