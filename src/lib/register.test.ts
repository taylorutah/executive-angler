import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { registerForPath } from "./register.ts";

describe("registerForPath", () => {
  it("puts /today and /rivers/mine in dusk without dusking /rivers", () => {
    assert.equal(registerForPath("/today"), "dusk");
    assert.equal(registerForPath("/rivers/mine"), "dusk");
    assert.equal(registerForPath("/rivers/madison-river"), "daylight");
    assert.equal(registerForPath("/"), "daylight");
  });
});
