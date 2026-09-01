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
    assert.match(header, /bg-\[var\(--accent-soft\)\]/);
    assert.match(header, /text-\[var\(--accent\)\][^\n]*md:inline-flex/);
    assert.match(header, /ea-lockup-heron/);
    assert.match(header, /md:h-\[4\.75rem\]/);
    const css = readFileSync(join(root, "src/app/globals.css"), "utf8");
    assert.match(css, /\.ea-lockup-heron \{[\s\S]*height: 56px;/);
    assert.match(css, /\.ea-lockup-heron \{[\s\S]*height: 76px;/);
    assert.equal(header.includes("h-[30px] w-[22px]"), false);
    assert.equal(header.includes("isLoading"), false);
    assert.equal(header.includes("h-8 w-28"), false);
  });

  it("types /rivers filters as State · Water · Hatch · Gauge", () => {
    const rivers = readFileSync(
      join(root, "src/components/gazette/GazetteRiversIndex.tsx"),
      "utf8",
    );
    assert.match(rivers, /label: "State"/);
    assert.match(rivers, /label: "Water"/);
    assert.match(rivers, /label: "Hatch"/);
    assert.match(rivers, /label: "Gauge"/);
    assert.match(rivers, /ea-search-underline/);
    assert.match(rivers, /flex flex-wrap/);
    assert.equal(rivers.includes("rounded-full"), false, "search must be type, not a boxed pill");
    assert.equal(rivers.includes("ea-search-pill"), false);
  });

  it("limits the public ticker to three flagship waters", () => {
    const rail = readFileSync(join(root, "src/components/home/ConditionsRail.tsx"), "utf8");
    assert.match(rail, /TICKER_LIMIT = 3/);
    assert.match(rail, /On the water/);
    assert.match(rail, /flex-wrap/);
    assert.equal(rail.includes("LiveDot"), false);
  });

  it("keeps the public nouns as the still-3 masthead", () => {
    const links = readFileSync(join(root, "src/components/layout/nav/links.ts"), "utf8");
    assert.match(links, /label: "Rivers"/);
    assert.match(links, /label: "Hatches"/);
    assert.match(links, /label: "Gauges"/);
    assert.match(links, /label: "Maps"/);
    assert.match(links, /label: "Gear"/);
    assert.match(links, /label: "Journal"/);
    assert.match(links, /label: "About"/);
  });

  it("treats sb-*-auth-token as a chrome hint only", () => {
    assert.equal(hasSessionHint(""), false);
    assert.equal(hasSessionHint("theme=dusk"), false);
    assert.equal(hasSessionHint("sb-qlasxtfbodyxbcuchvxz-auth-token=e30"), true);
    assert.equal(hasSessionHint("other=1; sb-proj-auth-token=e30"), true);
  });

  it("ships Privacy and Terms and the still-4 footer line", () => {
    assert.match(footer, /label: "Privacy", href: "\/privacy"/);
    assert.match(footer, /label: "Terms", href: "\/terms"/);
    assert.match(footer, /a fly-fishing gazette/);
    assert.match(footer, /No spots\. No counts\. No leaderboard\./);
    const layout = readFileSync(join(root, "src/app/layout.tsx"), "utf8");
    assert.match(layout, /<Footer \/>/);
    assert.match(layout, /SiteTicker/);
    assert.match(layout, /gazette-sheet/);
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
    const login = readFileSync(join(root, "src/app/login/page.tsx"), "utf8");
    const signup = readFileSync(join(root, "src/app/signup/page.tsx"), "utf8");
    const turnstile = readFileSync(
      join(root, "src/components/ui/TurnstileWidget.tsx"),
      "utf8",
    );
    assert.equal(login.includes("HeronMark"), false, "login must not repeat the masthead");
    assert.equal(signup.includes("HeronMark"), false, "signup must not repeat the masthead");
    assert.equal(login.includes("min-h-[70vh]"), false);
    assert.equal(signup.includes("min-h-[70vh]"), false);
    assert.equal(turnstile.includes("Having trouble"), false);
    assert.equal(turnstile.includes("Troubleshoot"), false);
    const css = readFileSync(join(root, "src/app/globals.css"), "utf8");
    assert.match(css, /\.house-measure \{\n  max-width: 65ch;/);
    assert.match(css, /\.house-measure \.prose,\n\.house-measure \.desk-dek-ui \{\n  max-width: none;/);
  });
});
