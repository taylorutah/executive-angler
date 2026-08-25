import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { registerForPath, REGISTER_BOOTSTRAP } from "./register.ts";

describe("registerForPath", () => {
  it("treats /app as dusk — the one public product page", () => {
    assert.equal(registerForPath("/app"), "dusk");
    assert.equal(registerForPath("/app?ref=footer"), "dusk");
  });

  it("puts /today and /rivers/mine in dusk without dusking /rivers", () => {
    assert.equal(registerForPath("/today"), "dusk");
    assert.equal(registerForPath("/rivers/mine"), "dusk");
    assert.equal(registerForPath("/rivers/madison-river"), "daylight");
    assert.equal(registerForPath("/"), "daylight");
  });

  it("does not dusk neighboring public routes", () => {
    assert.equal(registerForPath("/"), "daylight");
    assert.equal(registerForPath("/about"), "daylight");
    assert.equal(registerForPath("/rivers"), "daylight");
    assert.equal(registerForPath("/privacy"), "daylight");
  });

  it("still dusks the logged-in product", () => {
    assert.equal(registerForPath("/journal"), "dusk");
    assert.equal(registerForPath("/dashboard"), "dusk");
  });

  it("dusks /flybox — the canonical home of /flies/boxes", () => {
    assert.equal(registerForPath("/flybox"), "dusk");
    assert.match(REGISTER_BOOTSTRAP, /flybox/);
  });
});

describe("REGISTER_BOOTSTRAP", () => {
  it("includes /app so the first paint is dusk", () => {
    assert.match(REGISTER_BOOTSTRAP, /\/\(app\|/);
  });
});
