import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  articlesByAuthorSlug,
  authorSlugForByline,
  listAuthors,
  resolveAuthorByline,
  resolveAuthorSlug,
  slugifyAuthor,
} from "./authors";
import type { Article } from "@/types/entities";

const article = (id: string, author: string): Article =>
  ({
    id,
    slug: id,
    title: id,
    author,
    category: "technique",
    excerpt: "",
    content: "",
    readingTimeMinutes: 5,
    tags: [],
    relatedDestinationIds: [],
    relatedRiverIds: [],
    publishedAt: "2026-01-01",
    featured: false,
  }) as unknown as Article;

const CORPUS = [
  article("a", "Executive Angler Staff"),
  article("b", "Taylor Warnick"),
  article("c", "Jane Q. Angler"),
];

describe("slugifyAuthor", () => {
  it("slugifies punctuation and apostrophes", () => {
    assert.equal(slugifyAuthor("Jane Q. Angler"), "jane-q-angler");
    assert.equal(slugifyAuthor("Sean O'Malley"), "sean-omalley");
    assert.equal(slugifyAuthor("  Two  Spaces "), "two-spaces");
  });
});

describe("authorSlugForByline", () => {
  it("routes a curated author's own name to their slug", () => {
    assert.equal(authorSlugForByline("Taylor Warnick"), "taylor-warnick");
  });

  it("routes the curated articleAuthorName to the same slug", () => {
    assert.equal(authorSlugForByline("Executive Angler Staff"), "taylor-warnick");
  });

  it("derives a slug for a byline with no curated profile", () => {
    assert.equal(authorSlugForByline("Jane Q. Angler"), "jane-q-angler");
  });
});

describe("resolveAuthorByline", () => {
  it("returns the curated profile when there is one", () => {
    const got = resolveAuthorByline("Executive Angler Staff");
    assert.equal(got.name, "Taylor Warnick");
    assert.ok(got.profile);
  });

  it("returns a bare identity when there is not", () => {
    const got = resolveAuthorByline("Jane Q. Angler");
    assert.equal(got.name, "Jane Q. Angler");
    assert.equal(got.profile, undefined);
  });
});

describe("resolveAuthorSlug", () => {
  it("resolves a curated slug", () => {
    assert.equal(resolveAuthorSlug("taylor-warnick", CORPUS)?.name, "Taylor Warnick");
  });

  it("resolves a byline-only slug", () => {
    assert.equal(resolveAuthorSlug("jane-q-angler", CORPUS)?.name, "Jane Q. Angler");
  });

  it("resolves a curated author with nothing published", () => {
    assert.equal(resolveAuthorSlug("taylor-warnick", [])?.name, "Taylor Warnick");
  });

  it("returns undefined for an unknown slug", () => {
    assert.equal(resolveAuthorSlug("nobody-at-all", CORPUS), undefined);
  });
});

describe("articlesByAuthorSlug", () => {
  it("collects both spellings of the same curated author", () => {
    assert.deepEqual(
      articlesByAuthorSlug("taylor-warnick", CORPUS).map((a) => a.id),
      ["a", "b"],
    );
  });

  it("is empty, not broken, for an author with no articles", () => {
    assert.deepEqual(articlesByAuthorSlug("taylor-warnick", []), []);
  });
});

describe("listAuthors", () => {
  it("includes curated authors and unclaimed bylines exactly once", () => {
    const slugs = listAuthors(CORPUS).map((a) => a.slug);
    assert.deepEqual(slugs, ["jane-q-angler", "taylor-warnick"]);
  });

  it("still lists the curated roster with no articles at all", () => {
    assert.deepEqual(
      listAuthors([]).map((a) => a.slug),
      ["taylor-warnick"],
    );
  });
});
