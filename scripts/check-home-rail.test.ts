import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { railCfsCount } from "./check-home-rail";

describe("home rail smoke", () => {
  it("counts numeric cfs strings the rail must show", async () => {
    assert.equal(await railCfsCount(["Madison gauge offline", "Green no reading"]), 0);
    assert.equal(await railCfsCount(["Madison 760 cfs", "Green last seen"]), 1);
    assert.equal(await railCfsCount(["Madison 760 cfs", "Green 1,810 cfs"]), 2);
  });
});
