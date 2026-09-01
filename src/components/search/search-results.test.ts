import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { SearchDocumentImage } from "@/lib/search";

const root = process.cwd();
const row = readFileSync(join(root, "src/components/search/SearchResultRow.tsx"), "utf8");
const headerSearch = readFileSync(
  join(root, "src/components/layout/nav/HeaderSearch.tsx"),
  "utf8",
);
const plate = readFileSync(join(root, "src/components/media/PlateFallback.tsx"), "utf8");

describe("search result tiles", () => {
  it("omits the square when there is no still — no quiet plate", () => {
    assert.match(row, /if \(!SearchDocumentImage\.url\(item\.imageUrl\)\) return null;/);
    assert.match(row, /fallback="none"/);
    assert.match(row, /empty:hidden/);
    assert.match(row, /data-search-media/);
    assert.match(row, /size-16/);
    assert.match(row, /class SearchResultTile/);
    assert.match(row, /class SearchResultCopy/);
    assert.match(row, /class SearchResultTrail/);
    assert.equal(row.includes('fallback="quiet"'), false);
    assert.equal(row.includes('fallback="named"'), false);
    assert.equal(row.includes("line-clamp-3"), false);
  });

  it("keeps type, live flow, and a 44px tap target on every row", () => {
    assert.match(row, /SearchResultCopy\.overline/);
    assert.match(row, /min-h-11/);
    assert.match(row, /line-clamp-2/);
    assert.match(row, /self-end sm:self-auto/);
    assert.match(row, /--signal-live/);
    assert.match(row, /Gauge offline/);
    assert.equal(row.includes("hidden sm:inline"), false);
  });

  it("leaves /search with one field — the page owns #search-q", () => {
    assert.match(headerSearch, /if \(pathname === "\/search"\) \{\n    return null;/);
    const pageField = readFileSync(
      join(root, "src/components/search/SearchField.tsx"),
      "utf8",
    );
    assert.match(pageField, /id="search-q"/);
  });
});

describe("quiet plate", () => {
  it("says no photograph and never reprints the entity name", () => {
    assert.match(plate, /No photograph/);
    assert.match(plate, /items-center justify-center/);
    assert.equal(
      /if \(quiet\) \{[\s\S]*?<p[^>]*>\{title\}/.test(plate),
      false,
    );
  });
});

describe("SearchDocumentImage", () => {
  it("takes the first real still and leaves blanks missing", () => {
    assert.equal(SearchDocumentImage.url(undefined, "  ", "/images/rivers/provo-river-hero.jpg"), "/images/rivers/provo-river-hero.jpg");
    assert.equal(SearchDocumentImage.url(null, ""), undefined);
    assert.equal(
      SearchDocumentImage.url("/images/madison-river-three-dollar-bridge.jpg"),
      "/images/home/madison-three-dollar-bridge.jpg",
    );
  });

  it("inherits a linked river still when the guide has no portrait", () => {
    const rivers = [
      {
        id: "river-strawberry-ut",
        slug: "strawberry-river-utah",
        heroImageUrl: "/images/rivers/strawberry-river-utah-hero.jpg",
      },
      {
        id: "provo-river",
        slug: "provo-river",
        heroImageUrl: "/images/rivers/provo-river-hero.jpg",
      },
      {
        id: "river-weber-ut",
        slug: "weber-river-utah",
        heroImageUrl: "/images/rivers/weber-river-utah-hero.jpg",
      },
    ];
    assert.equal(
      SearchDocumentImage.forGuide(null, ["river-strawberry", "river-provo"], rivers),
      "/images/rivers/strawberry-river-utah-hero.jpg",
    );
    assert.equal(
      SearchDocumentImage.forGuide(undefined, ["river-weber", "river-provo"], rivers),
      "/images/rivers/weber-river-utah-hero.jpg",
    );
    assert.equal(
      SearchDocumentImage.forGuide("/images/guides/own.jpg", ["river-provo"], rivers),
      "/images/guides/own.jpg",
    );
    assert.equal(
      SearchDocumentImage.forGuide(null, ["river-missing"], rivers),
      undefined,
    );
  });
});
