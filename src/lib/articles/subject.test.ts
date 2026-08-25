import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  countMentions,
  deriveSubjectFlies,
  deriveSubjectRivers,
} from "./subject";
import type { Article, CanonicalFly, River } from "@/types/entities";

const article = (over: Partial<Article> = {}): Article => ({
  id: "a1",
  slug: "a1",
  title: "",
  author: "Executive Angler Staff",
  category: "technique",
  excerpt: "",
  content: "",
  readingTimeMinutes: 8,
  tags: [],
  relatedDestinationIds: [],
  relatedRiverIds: [],
  publishedAt: "2026-01-01",
  featured: false,
  ...over,
});

const river = (id: string, name: string, destinationId = "d1"): River =>
  ({
    id,
    slug: id,
    name,
    destinationId,
    description: "",
    flowType: "freestone",
    difficulty: "intermediate",
    wadingType: "wade",
    primarySpecies: [],
    accessPoints: [],
    bestMonths: [],
    latitude: 0,
    longitude: 0,
    hatchChart: [],
    featured: false,
  }) as unknown as River;

const fly = (
  id: string,
  name: string,
  category: CanonicalFly["category"],
  imitates: string[] = [],
): CanonicalFly =>
  ({
    id,
    slug: id,
    name,
    category,
    description: "",
    imitates,
    effectiveSpecies: [],
    waterTypes: [],
    sizes: [],
    colors: [],
    beadOptions: [],
    hookStyles: [],
    galleryUrls: [],
    relatedFlyIds: [],
    relatedRiverIds: [],
    relatedDestinationIds: [],
    flyShopIds: [],
    featured: false,
    isHeroPattern: false,
  }) as unknown as CanonicalFly;

const RIVERS = [
  river("r-madison", "Madison River"),
  river("r-gallatin", "Gallatin River"),
  river("r-provo", "Provo River", "d2"),
  river("r-green", "Green River", "d2"),
];

const FLIES = [
  fly("f-pt", "Pheasant Tail", "nymph", ["mayfly"]),
  fly("f-ehc", "Elk Hair Caddis", "dry", ["caddis"]),
  fly("f-wb", "Woolly Bugger", "streamer"),
  fly("f-zonker", "Zonker", "streamer"),
];

describe("countMentions", () => {
  it("counts whole words only", () => {
    assert.equal(countMentions("the madison river runs", "madison river"), 1);
    assert.equal(countMentions("madison madison", "madison"), 2);
    assert.equal(countMentions("madisonville", "madison"), 0);
  });

  it("is safe on empty input", () => {
    assert.equal(countMentions("", "madison"), 0);
    assert.equal(countMentions("madison", ""), 0);
  });
});

describe("deriveSubjectRivers", () => {
  it("prefers explicit relatedRiverIds and keeps their order", () => {
    const got = deriveSubjectRivers(
      article({ relatedRiverIds: ["r-green", "r-provo"] }),
      RIVERS,
    );
    assert.deepEqual(
      got.map((r) => r.id),
      ["r-green", "r-provo"],
    );
  });

  it("falls back to river names the body actually uses, ranked by mentions", () => {
    const got = deriveSubjectRivers(
      article({
        content:
          "<p>The Gallatin River is small. The Madison River, the Madison River again.</p>",
      }),
      RIVERS,
    );
    assert.deepEqual(
      got.map((r) => r.id),
      ["r-madison", "r-gallatin"],
    );
  });

  it("weights the title over a passing body mention", () => {
    const got = deriveSubjectRivers(
      article({
        title: "Provo River in March",
        content: "<p>Also worth a look: the Green River.</p>",
      }),
      RIVERS,
      1,
    );
    assert.deepEqual(
      got.map((r) => r.id),
      ["r-provo"],
    );
  });

  it("tops up an explicit list of one from body mentions without duplicating", () => {
    const got = deriveSubjectRivers(
      article({
        relatedRiverIds: ["r-madison"],
        content: "<p>Madison River, Madison River, and the Gallatin River.</p>",
      }),
      RIVERS,
    );
    assert.deepEqual(
      got.map((r) => r.id),
      ["r-madison", "r-gallatin"],
    );
  });

  it("uses rivers of the filed destination as the last resort", () => {
    const got = deriveSubjectRivers(
      article({ relatedDestinationIds: ["d2"] }),
      RIVERS,
    );
    assert.deepEqual(
      got.map((r) => r.id),
      ["r-provo", "r-green"],
    );
  });

  it("returns nothing rather than inventing a river", () => {
    assert.deepEqual(
      deriveSubjectRivers(
        article({ content: "<p>Choosing a five weight rod.</p>" }),
        RIVERS,
      ),
      [],
    );
  });
});

describe("deriveSubjectFlies", () => {
  it("prefers pattern names the piece actually names", () => {
    const got = deriveSubjectFlies(
      article({
        content:
          "<p>A Woolly Bugger, then another Woolly Bugger, then a Pheasant Tail.</p>",
      }),
      FLIES,
    );
    assert.deepEqual(
      got.map((f) => f.id),
      ["f-wb", "f-pt"],
    );
  });

  it("falls back to patterns imitating an insect the piece names", () => {
    const got = deriveSubjectFlies(
      article({ title: "Fishing the caddis hatch" }),
      FLIES,
      1,
    );
    assert.deepEqual(
      got.map((f) => f.id),
      ["f-ehc"],
    );
  });

  it("falls back to the category the piece declares in its title", () => {
    const got = deriveSubjectFlies(
      article({ title: "Streamer fishing mastery" }),
      FLIES,
    );
    assert.deepEqual(
      got.map((f) => f.id),
      ["f-wb", "f-zonker"],
    );
  });

  it("ignores a category word used only in passing in the body", () => {
    assert.deepEqual(
      deriveSubjectFlies(
        article({
          title: "Photographing your catch",
          content: "<p>Shoot on a dry bank, not in the water.</p>",
        }),
        FLIES,
      ),
      [],
    );
  });

  it("returns nothing rather than inventing a pattern", () => {
    assert.deepEqual(
      deriveSubjectFlies(article({ content: "<p>Knots and leaders.</p>" }), FLIES),
      [],
    );
  });
});
