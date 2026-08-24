import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  PHASE1_UNIQUE_HOST_COUNT,
  classifyImageUrl,
  countPhase2ExternalRows,
  evaluateRemotePatterns,
} from "./phase2-hosts";

const TARGET = [
  "executiveangler.com",
  "www.executiveangler.com",
  "qlasxtfbodyxbcuchvxz.supabase.co",
  "api.executiveangler.com",
  "lh3.googleusercontent.com",
  "*.googleusercontent.com",
];

const BASELINE = Array.from({ length: PHASE1_UNIQUE_HOST_COUNT }, (_, i) =>
  i < TARGET.length ? TARGET[i] : `cdn-${i}.example.com`,
);

describe("classifyImageUrl", () => {
  it("does not count empty cells or local /images paths as external", () => {
    assert.equal(classifyImageUrl("", TARGET), "empty");
    assert.equal(classifyImageUrl("   ", TARGET), "empty");
    assert.equal(classifyImageUrl("/images/madison-river-three-dollar-bridge.jpg", TARGET), "local");
  });

  it("counts Unsplash and Wikimedia as external — the 167 that block Phase 2", () => {
    assert.equal(
      classifyImageUrl("https://images.unsplash.com/photo-abc", TARGET),
      "external",
    );
    assert.equal(
      classifyImageUrl("https://upload.wikimedia.org/wikipedia/commons/a/a0/x.jpg", TARGET),
      "external",
    );
  });

  it("treats our storage and site hosts as target", () => {
    assert.equal(
      classifyImageUrl(
        "https://qlasxtfbodyxbcuchvxz.supabase.co/storage/v1/object/public/media/x.jpg",
        TARGET,
      ),
      "target",
    );
    assert.equal(
      classifyImageUrl("https://www.executiveangler.com/images/x.jpg", TARGET),
      "target",
    );
  });

  it("excepts Google avatars from the external count", () => {
    assert.equal(
      classifyImageUrl("https://lh3.googleusercontent.com/a/photo", TARGET),
      "avatar",
    );
    assert.equal(
      classifyImageUrl("https://lh4.googleusercontent.com/a/photo", TARGET),
      "avatar",
    );
  });
});

describe("countPhase2ExternalRows", () => {
  it("is the measurement Phase 2 reads — not a checklist", () => {
    const n = countPhase2ExternalRows(
      [
        "https://images.unsplash.com/a",
        "https://images.unsplash.com/b",
        "https://qlasxtfbodyxbcuchvxz.supabase.co/storage/v1/object/public/x.jpg",
        "/images/local.jpg",
        "",
        "https://lh3.googleusercontent.com/a",
      ],
      TARGET,
    );
    assert.equal(n, 2);
  });
});

describe("evaluateRemotePatterns", () => {
  it("lets Phase 1 through without a database measurement", () => {
    const v = evaluateRemotePatterns({
      configHosts: BASELINE,
      baselineHosts: BASELINE,
      targetHosts: TARGET,
      externalRows: null,
    });
    assert.deepEqual(v, { ok: true, reason: "phase1" });
  });

  it("refuses a new host even if the baseline file is also edited", () => {
    const v = evaluateRemotePatterns({
      configHosts: [...BASELINE, "cdn.evil.test"],
      baselineHosts: [...BASELINE, "cdn.evil.test"],
      targetHosts: TARGET,
      externalRows: null,
    });
    assert.equal(v.ok, false);
    if (v.ok) throw new Error("expected failure");
    assert.equal(v.code, "grew");
  });

  it("blocks shrinking to the six while Unsplash rows remain", () => {
    const v = evaluateRemotePatterns({
      configHosts: TARGET,
      baselineHosts: BASELINE,
      targetHosts: TARGET,
      externalRows: 167,
    });
    assert.equal(v.ok, false);
    if (v.ok) throw new Error("expected failure");
    assert.equal(v.code, "phase2-blocked");
    assert.match(v.message, /PHASE2_EXTERNAL_ROWS=167/);
  });

  it("blocks shrinking when the measurement was not taken", () => {
    const v = evaluateRemotePatterns({
      configHosts: TARGET,
      baselineHosts: TARGET,
      targetHosts: TARGET,
      externalRows: null,
    });
    assert.equal(v.ok, false);
    if (v.ok) throw new Error("expected failure");
    assert.equal(v.code, "phase2-blocked");
  });

  it("does not let editing the baseline to six sneak past a non-zero audit", () => {
    const v = evaluateRemotePatterns({
      configHosts: TARGET,
      baselineHosts: TARGET,
      targetHosts: TARGET,
      externalRows: 12,
    });
    assert.equal(v.ok, false);
    if (v.ok) throw new Error("expected failure");
    assert.equal(v.code, "phase2-blocked");
  });

  it("allows the shrink only when the audit reports 0 external rows", () => {
    const v = evaluateRemotePatterns({
      configHosts: TARGET,
      baselineHosts: BASELINE,
      targetHosts: TARGET,
      externalRows: 0,
    });
    assert.deepEqual(v, { ok: true, reason: "phase2" });
  });

  it("refuses shrinking to some other short list", () => {
    const v = evaluateRemotePatterns({
      configHosts: TARGET.slice(0, 3),
      baselineHosts: BASELINE,
      targetHosts: TARGET,
      externalRows: 0,
    });
    assert.equal(v.ok, false);
    if (v.ok) throw new Error("expected failure");
    assert.equal(v.code, "illegal-shrink");
  });
});
