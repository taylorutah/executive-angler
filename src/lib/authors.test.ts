import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  articlesByAuthorSlug,
  authorSlugForByline,
  isHouseAuthor,
  isHouseByline,
  listAuthors,
  labeledPhotoCredit,
  namesPrivatePerson,
  publicImageCredit,
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
  it("returns the house byline for the curated profile", () => {
    const got = resolveAuthorByline("Executive Angler Staff");
    assert.equal(got.name, "Executive Angler Staff");
    assert.ok(got.profile);
  });

  it("does not resolve the private person name as a public byline", () => {
    const got = resolveAuthorByline("Taylor Warnick");
    assert.equal(got.name, "Executive Angler Staff");
  });

  it("returns a bare identity when there is not", () => {
    const got = resolveAuthorByline("Jane Q. Angler");
    assert.equal(got.name, "Jane Q. Angler");
    assert.equal(got.profile, undefined);
  });
});

describe("resolveAuthorSlug", () => {
  it("resolves a curated slug to the house byline", () => {
    assert.equal(resolveAuthorSlug("taylor-warnick", CORPUS)?.name, "Executive Angler Staff");
  });

  it("resolves a byline-only slug", () => {
    assert.equal(resolveAuthorSlug("jane-q-angler", CORPUS)?.name, "Jane Q. Angler");
  });

  it("resolves a curated author with nothing published", () => {
    assert.equal(resolveAuthorSlug("taylor-warnick", [])?.name, "Executive Angler Staff");
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
    assert.deepEqual(slugs, ["taylor-warnick", "jane-q-angler"]);
  });

  it("still lists the curated roster with no articles at all", () => {
    assert.deepEqual(
      listAuthors([]).map((a) => a.slug),
      ["taylor-warnick"],
    );
  });
});

describe("isHouseByline", () => {
  it("matches the house byline and the private person name", () => {
    assert.equal(isHouseByline("Executive Angler Staff"), true);
    assert.equal(isHouseByline("  Executive Angler Staff  "), true);
    assert.equal(isHouseByline("Taylor Warnick"), true);
    assert.equal(isHouseByline("Jane Q. Angler"), false);
  });
});

describe("publicImageCredit", () => {
  it("drops the private person name and house byline", () => {
    assert.equal(publicImageCredit("Taylor Warnick"), undefined);
    assert.equal(publicImageCredit("Submitted by Taylor Warnick"), undefined);
    assert.equal(publicImageCredit("Executive Angler Staff"), undefined);
    assert.equal(publicImageCredit("Jane Doe / Unsplash"), "Jane Doe / Unsplash");
  });
});

describe("labeledPhotoCredit", () => {
  it("omits the house person and labels a real photographer", () => {
    assert.equal(labeledPhotoCredit("Taylor Warnick"), undefined);
    assert.equal(labeledPhotoCredit("Jane Doe / Unsplash"), "Photo: Jane Doe / Unsplash");
    assert.equal(labeledPhotoCredit("Photo: Pat Clayton"), "Photo: Pat Clayton");
  });
});

describe("namesPrivatePerson", () => {
  it("matches the legal name inside a longer credit", () => {
    assert.equal(namesPrivatePerson("Submitted by Taylor Warnick"), true);
    assert.equal(namesPrivatePerson("Photo: Pat Clayton"), false);
  });
});

describe("isHouseAuthor", () => {
  it("flags the curated profile that claims the house byline", () => {
    assert.equal(isHouseAuthor(resolveAuthorByline("Executive Angler Staff")), true);
  });

  it("flags a bare house byline with no curated profile", () => {
    assert.equal(
      isHouseAuthor({ slug: "executive-angler-staff", name: "Executive Angler Staff" }),
      true,
    );
  });

  it("leaves named authors alone", () => {
    assert.equal(isHouseAuthor(resolveAuthorByline("Jane Q. Angler")), false);
  });
});
