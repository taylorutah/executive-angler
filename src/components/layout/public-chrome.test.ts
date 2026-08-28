import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const header = readFileSync(join(root, "src/components/layout/Header.tsx"), "utf8");
const footer = readFileSync(join(root, "src/components/layout/Footer.tsx"), "utf8");
const visual = readFileSync(join(root, "tests/visual.spec.ts"), "utf8");

const CARD_FILES = [
  "src/components/desk/DeskPhotoCard.tsx",
  "src/components/desk/DeskArchive.tsx",
  "src/components/desk/DeskFlyIndex.tsx",
  "src/components/ui/ListCard.tsx",
  "src/components/ui/MagazineGrid.tsx",
  "src/components/ui/CompactCard.tsx",
  "src/components/ui/EntityCard.tsx",
  "src/components/home/FlyPlate.tsx",
  "src/components/home/WhereToGo.tsx",
  "src/components/home/ThisWeeksRead.tsx",
  "src/components/home/OnTheWaterNow.tsx",
] as const;

describe("public chrome locks", () => {
  it("uses one forest horizontal wordmark on cream public headers", () => {
    assert.match(header, /duskApp = Boolean\(user\) && registerForPath\(pathname\) === "dusk"/);
    assert.match(header, /logo-horizontal-white\.svg/);
    assert.match(header, /logo-horizontal-forest\.svg/);
    assert.equal(header.includes("/images/logo.svg"), false);
    assert.match(header, /data-wordmark=\{duskApp \? "white-horizontal" : "forest-horizontal"\}/);
    assert.match(header, /h-\[26px\] w-\[136px\] max-h-\[26px\] object-contain object-left/);
    assert.match(header, /width=\{136\}/);
    assert.match(header, /height=\{26\}/);
    assert.match(header, /<img\s+src=\{logoSrc\}/);
  });

  it("keeps signed-out /today on the cream public bar and out of the visual gate", () => {
    assert.match(header, /duskApp \? "" : "ea-header-public"/);
    assert.match(visual, /SIGNED_IN_ROUTES = \["\/journal"\]/);
    assert.equal(/SIGNED_IN_ROUTES[\s\S]*?"\/today"/.test(visual), false);
    assert.equal(/PUBLIC_ROUTES[\s\S]*?"\/today"/.test(visual), false);
  });

  it("ships Privacy and Terms in the House footer column", () => {
    const house = footer.slice(footer.indexOf('title: "House"'));
    assert.match(house, /label: "Privacy", href: "\/privacy"/);
    assert.match(house, /label: "Terms", href: "\/terms"/);
  });

  it("puts the long 600ms ease on every public card", () => {
    for (const file of CARD_FILES) {
      const src = readFileSync(join(root, file), "utf8");
      const hasHover =
        src.includes("photo-lift") || src.includes("hover-copper") || src.includes("card-hover");
      assert.equal(hasHover, true, `${file} is missing the 600ms card hover classes`);
    }
  });
});
