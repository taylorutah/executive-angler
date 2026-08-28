import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const flyPage = readFileSync(join(root, "src/app/flies/[slug]/page.tsx"), "utf8");
const recipe = readFileSync(join(root, "src/components/desk/RecipeStrip.tsx"), "utf8");
const variants = readFileSync(join(root, "src/components/fly-detail/FlyVariantTable.tsx"), "utf8");
const login = readFileSync(join(root, "src/app/login/page.tsx"), "utf8");
const loginForm = readFileSync(join(root, "src/app/login/LoginForm.tsx"), "utf8");
const css = readFileSync(join(root, "src/app/globals.css"), "utf8");

describe("fly Water Desk sheet", () => {
  it("uses one 12-col sheet — no 50vw, no mixed max-w rails", () => {
    assert.match(flyPage, /desk-sheet/);
    assert.match(flyPage, /desk-sheet-grid/);
    assert.match(flyPage, /desk-sheet-photo/);
    assert.match(flyPage, /desk-sheet-name/);
    assert.match(flyPage, /desk-spec/);
    assert.match(flyPage, /desk-rule-list/);
    assert.equal(flyPage.includes("50vw"), false);
    assert.equal(flyPage.includes("max-w-7xl"), false);
    assert.equal(flyPage.includes("max-w-xl"), false);
    assert.equal(flyPage.includes("max-w-2xl"), false);
    assert.equal(flyPage.includes("InstrumentWellFrame"), false);
  });

  it("keeps recipe on the same measure as a 7em spec sheet", () => {
    assert.match(recipe, /desk-recipe/);
    assert.match(recipe, /desk-recipe-label/);
    assert.equal(recipe.includes("max-w-7xl"), false);
    assert.equal(recipe.includes("max-w-2xl"), false);
    assert.match(css, /grid-template-columns: 7em minmax\(0, 1fr\)/);
  });

  it("keeps variants on the cream sheet, not a dusk well", () => {
    assert.match(variants, /desk-table-wrap/);
    assert.equal(variants.includes("InstrumentWellFrame"), false);
    assert.equal(variants.includes("register-dusk"), false);
  });

  it("ships login as a cream desk form with SSR chrome", () => {
    assert.match(login, /desk-sheet/);
    assert.match(login, /desk-form/);
    assert.match(login, /Sign in/);
    assert.equal(login.includes("Loading"), false);
    assert.equal(login.includes("SITE_NAME"), false);
    assert.equal(loginForm.includes("red-950"), false);
    assert.equal(loginForm.includes("rounded-xl"), false);
  });
});
