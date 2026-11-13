import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { resolveBoxMembershipCount } from "./box-membership-count.ts";

describe("resolveBoxMembershipCount", () => {
  it("fails closed when the count query errors (must not treat as zero)", () => {
    const r = resolveBoxMembershipCount(null, { message: "timeout" });
    assert.equal(r.ok, false);
    if (!r.ok) assert.match(r.error, /timeout/);
  });

  it("returns zero only when the query succeeded with no rows", () => {
    const r = resolveBoxMembershipCount(0, null);
    assert.equal(r.ok, true);
    if (r.ok) assert.equal(r.count, 0);
  });
});
