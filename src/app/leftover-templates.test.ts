import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (rel: string) => readFileSync(join(root, rel), "utf8");

const LEFTOVER_PAGES = [
  "src/app/guides/GuidesDeskPage.tsx",
  "src/app/guides/GuidesIndex.tsx",
  "src/app/guides/[slug]/page.tsx",
  "src/app/fly-shops/ShopsDeskPage.tsx",
  "src/app/fly-shops/ShopsIndex.tsx",
  "src/app/fly-shops/[slug]/page.tsx",
  "src/app/gear/page.tsx",
  "src/app/contribute/page.tsx",
  "src/app/contribute/[entityType]/SubmissionForm.tsx",
  "src/app/contribute/photo-update/PhotoUpdateForm.tsx",
  "src/app/feedback/FeedbackClient.tsx",
  "src/app/for-guides/page.tsx",
  "src/app/reset-password/page.tsx",
  "src/app/authors/[slug]/page.tsx",
  "src/app/learn/page.tsx",
] as const;

describe("leftover public templates inherit Water Desk", () => {
  it("keeps FIND leftover indexes on Lodges 84:3 language", () => {
    const desk = read("src/components/desk/FindDesk.tsx");
    assert.match(desk, /kicker="FIND"/);
    assert.match(desk, /Also on the desk this week/);
    assert.match(desk, /Pictures/);
    assert.match(desk, /Refine/);
    assert.match(desk, /DeskSeeAll/);
    assert.match(desk, /hostedStillUrl/);
    assert.equal(desk.includes("unsplash"), false);
    assert.equal(desk.includes("max-w-7xl"), false);

    const guides = read("src/app/guides/GuidesDeskPage.tsx");
    assert.match(guides, /We do not book the day/);
    assert.match(guides, /seeAllHref="\/guides\/all"/);

    const shops = read("src/app/fly-shops/ShopsDeskPage.tsx");
    assert.match(shops, /We do not sell the fly/);
    assert.match(shops, /seeAllHref="\/fly-shops\/all"/);
  });

  it("keeps leftover public files off Unsplash, Lucide, and leftover rails", () => {
    for (const rel of LEFTOVER_PAGES) {
      const src = read(rel);
      assert.equal(src.includes("unsplash.com"), false, `${rel} still names Unsplash`);
      assert.equal(src.includes('from "@/icons"'), false, `${rel} still imports Lucide`);
      assert.equal(src.includes("max-w-7xl"), false, `${rel} still uses max-w-7xl`);
      assert.equal(src.includes("rounded-xl"), false, `${rel} still uses rounded-xl`);
      assert.equal(src.includes("#6E7681"), false, `${rel} still uses leftover slate`);
      assert.equal(src.includes("#D4751F"), false, `${rel} still uses leftover copper`);
      assert.equal(src.includes("red-950"), false, `${rel} still uses a dusk error chip`);
    }
  });

  it("keeps fly sheet one left edge and variants on vellum", () => {
    const fly = read("src/app/flies/[slug]/page.tsx");
    const variants = read("src/components/fly-detail/FlyVariantTable.tsx");
    const css = read("src/app/globals.css");
    assert.match(fly, /desk-sheet-stack/);
    assert.match(variants, /bg-\[var\(--vellum\)\]/);
    assert.match(variants, /Swipe to see In box and Add/);
    assert.match(css, /\.desk-sheet-stack \{\n  width: 100%;/);
    assert.match(css, /mask-image: linear-gradient/);
    assert.match(css, /\.desk-form button:disabled/);
    assert.match(css, /background: var\(--vellum\)/);
  });

  it("keeps library fallback to Pictures and Refine, not four filter rows", () => {
    const fallback = read("src/components/ui/BrowseIndexFallback.tsx");
    assert.match(fallback, /h-10 w-36/);
    assert.match(fallback, /h-10 w-\[88px\]/);
    assert.equal(fallback.includes("Category"), false);
    assert.equal(fallback.includes("Hatch"), false);
    assert.equal(fallback.includes("Can tie"), false);
  });

  it("keeps hatch headers ink, not copper", () => {
    const hatch = read("src/components/rivers/HatchSeasonGrid.tsx");
    assert.match(hatch, /Swipe months to stay on the year/);
    assert.match(hatch, /bg-\[var\(--ink\)\] text-\[var\(--hero-type\)\]/);
    assert.match(hatch, /desk-table-wrap/);
    assert.equal(/best[\s\S]*copper/.test(hatch), false);
    assert.equal(hatch.includes("text-[var(--action)]"), false);
  });

  it("keeps the gear chip count on the parent ink, not slate-on-ink", () => {
    const tabs = read("src/components/gear-v2/GearCategoryTabs.tsx");
    assert.match(tabs, /bg-\[var\(--ink\)\] text-\[var\(--hero-type\)\]/);
    assert.equal(tabs.includes("text-[var(--text-meta)]"), false);
  });

  it("keeps leftover stills on hostedStillUrl", () => {
    for (const rel of [
      "src/app/guides/GuidesIndex.tsx",
      "src/app/guides/[slug]/page.tsx",
      "src/app/fly-shops/ShopsIndex.tsx",
      "src/app/fly-shops/[slug]/page.tsx",
      "src/components/desk/FindDesk.tsx",
    ]) {
      assert.match(read(rel), /hostedStillUrl/, `${rel} is missing hostedStillUrl`);
    }
  });
});
