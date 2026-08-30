import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const flyPage = readFileSync(join(root, "src/app/flies/[slug]/page.tsx"), "utf8");
const recipe = readFileSync(join(root, "src/components/desk/RecipeStrip.tsx"), "utf8");
const variants = readFileSync(join(root, "src/components/fly-detail/FlyVariantTable.tsx"), "utf8");
const library = readFileSync(join(root, "src/app/flies/library/FlyLibraryClient.tsx"), "utf8");
const category = readFileSync(join(root, "src/app/flies/category/[category]/page.tsx"), "utf8");
const hatch = readFileSync(join(root, "src/app/flies/hatch/[slug]/page.tsx"), "utf8");
const forRiver = readFileSync(join(root, "src/app/flies/for/[slug]/page.tsx"), "utf8");
const photoCard = readFileSync(join(root, "src/components/desk/DeskPhotoCard.tsx"), "utf8");
const flyIndex = readFileSync(join(root, "src/components/desk/DeskFlyIndex.tsx"), "utf8");
const css = readFileSync(join(root, "src/app/globals.css"), "utf8");

describe("fly desk sheet", () => {
  it("uses one 12-col magazine sheet — no skinny 50vw rail, no dusk well", () => {
    assert.match(flyPage, /desk-sheet/);
    assert.match(flyPage, /desk-sheet-grid/);
    assert.match(flyPage, /desk-sheet-photo/);
    assert.match(flyPage, /desk-sheet-name/);
    assert.match(flyPage, /desk-spec/);
    assert.match(flyPage, /desk-sheet-stack/);
    assert.match(flyPage, /desk-rule-list/);
    assert.equal(flyPage.includes("50vw"), false);
    assert.equal(flyPage.includes("max-w-xl"), false);
    assert.equal(flyPage.includes("InstrumentWellFrame"), false);
    assert.equal(flyPage.includes("lucide"), false);
  });

  it("keeps recipe on a 7em spec sheet with unique slot labels", () => {
    assert.match(recipe, /desk-recipe/);
    assert.match(recipe, /desk-recipe-label/);
    assert.match(recipe, /uniqueRecipeRows/);
    assert.equal(recipe.includes("max-w-7xl"), false);
    assert.match(css, /grid-template-columns: 7em minmax\(0, 1fr\)/);
  });

  it("keeps variants as one bordered instrument on paper", () => {
    assert.match(variants, /desk-table-wrap/);
    assert.match(variants, /bg-\[var\(--vellum\)\]|desk-table-wrap/);
    assert.match(variants, /Swipe to see In box and Add/);
    assert.match(variants, /Sign in to put these sizes in your box/);
    assert.equal(variants.includes("InstrumentWellFrame"), false);
    assert.equal(variants.includes("register-dusk"), false);
    assert.equal(variants.includes('href={loginHref}\n                          className="text-[13px]'), false);
  });

  it("always renders designed empty states for missing copy", () => {
    assert.match(flyPage, /Tying notes are not on file for this pattern/);
    assert.match(flyPage, /No tying video on file/);
    assert.match(flyPage, /Fishing notes are not on file for this pattern/);
    assert.match(flyPage, /History is not on file for this pattern/);
  });

  it("wires the library to DeskFlyIndex and deletes the competing desk page", () => {
    assert.match(library, /DeskFlyIndex/);
    assert.equal(existsSync(join(root, "src/app/flies/FliesDeskPage.tsx")), false);
    assert.match(flyIndex, /On the plate/);
    assert.match(flyIndex, /The rest of the bench/);
  });

  it("keeps leftover fly indexes on specimen cards, not EntityCard clip-art", () => {
    for (const [rel, src] of [
      ["category", category],
      ["hatch", hatch],
      ["for", forRiver],
    ] as const) {
      assert.match(src, /DeskFlyIndex|DeskPhotoCard/, `${rel} is missing specimen cards`);
      assert.equal(src.includes("EntityCard"), false, `${rel} still uses EntityCard`);
      assert.equal(src.includes("ScrollAnimation"), false, `${rel} still uses ScrollAnimation`);
      assert.equal(src.includes("/images/fly-icons/"), false, `${rel} still uses fly-icon clip-art`);
      assert.equal(src.includes("unsplash.com"), false, `${rel} still names Unsplash`);
    }
  });

  it("migrates fly chrome off Water Desk copper and photo-lift", () => {
    assert.equal(photoCard.includes("photo-lift"), false);
    assert.equal(photoCard.includes("hover-copper"), false);
    assert.equal(photoCard.includes("--text-primary"), false);
    assert.match(photoCard, /--text-1/);
    assert.match(photoCard, /--accent/);
    assert.equal(flyIndex.includes("hover-copper"), false);
    assert.equal(flyIndex.includes("--text-primary"), false);
  });
});
