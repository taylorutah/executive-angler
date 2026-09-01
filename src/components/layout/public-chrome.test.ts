import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { hasSessionHint } from "./session-hint";

const root = process.cwd();
const header = readFileSync(join(root, "src/components/gazette/GazetteHeader.tsx"), "utf8");
const footer = readFileSync(join(root, "src/components/layout/Footer.tsx"), "utf8");

describe("gazette chrome locks", () => {
  it("uses the heron mark and two-line wordmark, not the fly splat", () => {
    assert.match(header, /HeronMark/);
    assert.match(header, /ea-wordmark/);
    assert.match(header, /Executive/);
    assert.match(header, /Angler/);
    assert.equal(header.includes("logo-horizontal-forest"), false);
    assert.equal(header.includes("logo.svg"), false);
    assert.equal(header.includes("fly-mark"), false);
    assert.equal(header.includes("HeaderSearch"), false);
    assert.equal(header.includes("ExploreMenu"), false);
    assert.match(header, /Create account/);
    assert.match(header, /hidden[^\n]*md:inline-flex/);
    assert.equal(header.includes("isLoading"), false);
    assert.equal(header.includes("h-8 w-28"), false);
  });

  it("limits the public ticker to three flagship waters", () => {
    const rail = readFileSync(join(root, "src/components/home/ConditionsRail.tsx"), "utf8");
    assert.match(rail, /TICKER_LIMIT = 3/);
    assert.match(rail, /On the water/);
    assert.match(rail, /flex-wrap/);
    assert.equal(rail.includes("LiveDot"), false);
  });

  it("keeps the public nouns as Rivers Flies Places Field Notes Journal", () => {
    const links = readFileSync(join(root, "src/components/layout/nav/links.ts"), "utf8");
    assert.match(links, /label: "Rivers"/);
    assert.match(links, /label: "Flies"/);
    assert.match(links, /label: "Places"/);
    assert.match(links, /label: "Field Notes"/);
    assert.match(links, /label: "Journal"/);
  });

  it("treats sb-*-auth-token as a chrome hint only", () => {
    assert.equal(hasSessionHint(""), false);
    assert.equal(hasSessionHint("theme=dusk"), false);
    assert.equal(hasSessionHint("sb-qlasxtfbodyxbcuchvxz-auth-token=e30"), true);
    assert.equal(hasSessionHint("other=1; sb-proj-auth-token=e30"), true);
  });

  it("ships Privacy and Terms in the House footer column", () => {
    const house = footer.slice(footer.indexOf('title: "House"'));
    assert.match(house, /label: "Privacy", href: "\/privacy"/);
    assert.match(house, /label: "Terms", href: "\/terms"/);
    assert.match(footer, /a river gazette/);
    assert.match(footer, /No spots\. No counts\. No noise\./);
    const layout = readFileSync(join(root, "src/app/layout.tsx"), "utf8");
    assert.match(layout, /<Footer \/>/);
    assert.match(layout, /SiteTicker/);
  });

  it("keeps house and login headings ink Fraunces, not copper fills", () => {
    for (const rel of [
      "src/app/contact/page.tsx",
      "src/app/login/page.tsx",
      "src/app/signup/page.tsx",
    ]) {
      const src = readFileSync(join(root, rel), "utf8");
      assert.match(src, /desk-sheet/);
      assert.match(src, /bg-\[var\(--paper\)\]/);
      assert.equal(
        /<h1[^>]*text-\[var\(--action\)\]/.test(src),
        false,
        `${rel} paints h1 copper`,
      );
    }
    const css = readFileSync(join(root, "src/app/globals.css"), "utf8");
    assert.match(css, /\.house-measure \{\n  max-width: 65ch;/);
    assert.match(css, /\.house-measure \.prose,\n\.house-measure \.desk-dek-ui \{\n  max-width: none;/);
  });
});
