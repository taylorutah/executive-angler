import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildFlyLogEvents,
  computeTopFly,
  flyIdentity,
} from "./top-fly.ts";

describe("flyIdentity", () => {
  it("prefers the live flies-table name over the snapshot", () => {
    const names = new Map([["f1", "Silver Bullet"]]);
    assert.deepEqual(
      flyIdentity({ fly_pattern_id: "f1", fly_name: "old snapshot" }, names),
      { key: "id:f1", displayName: "Silver Bullet" },
    );
  });

  it("falls back to a normalized freehand name", () => {
    assert.deepEqual(
      flyIdentity({ fly_name: "  Walt's Worm  " }, new Map()),
      { key: "name:walt's worm", displayName: "Walt's Worm" },
    );
  });

  it("returns null when there is no fly record", () => {
    assert.equal(flyIdentity({}, new Map()), null);
  });
});

describe("computeTopFly", () => {
  it("returns null when no flies were logged", () => {
    assert.equal(computeTopFly([]), null);
  });

  it("names a fly from one session and one log", () => {
    const top = computeTopFly([
      {
        key: "name:silver bullet",
        displayName: "Silver Bullet",
        sessionId: "s1",
        sessionDate: "2026-03-01",
        fish: 1,
      },
    ]);
    assert.equal(top?.name, "Silver Bullet");
    assert.equal(top?.sessionCount, 1);
  });

  it("ranks by session count, then fish, then most recent use", () => {
    const events = [
      { key: "a", displayName: "Alpha", sessionId: "s1", sessionDate: "2026-01-01", fish: 10 },
      { key: "b", displayName: "Bravo", sessionId: "s1", sessionDate: "2026-01-01", fish: 1 },
      { key: "b", displayName: "Bravo", sessionId: "s2", sessionDate: "2026-02-01", fish: 1 },
    ];
    assert.equal(computeTopFly(events)?.name, "Bravo");

    const tiedSessions = [
      { key: "a", displayName: "Alpha", sessionId: "s1", sessionDate: "2026-03-01", fish: 2 },
      { key: "a", displayName: "Alpha", sessionId: "s2", sessionDate: "2026-04-01", fish: 2 },
      { key: "b", displayName: "Bravo", sessionId: "s3", sessionDate: "2026-05-01", fish: 9 },
      { key: "b", displayName: "Bravo", sessionId: "s4", sessionDate: "2026-06-01", fish: 9 },
    ];
    assert.equal(computeTopFly(tiedSessions)?.name, "Bravo");

    const tiedFish = [
      { key: "a", displayName: "Alpha", sessionId: "s1", sessionDate: "2026-01-01", fish: 3 },
      { key: "b", displayName: "Bravo", sessionId: "s2", sessionDate: "2026-06-01", fish: 3 },
    ];
    assert.equal(computeTopFly(tiedFish)?.name, "Bravo");
  });
});

describe("buildFlyLogEvents", () => {
  it("counts a session-rig fly with no catch as a log", () => {
    const events = buildFlyLogEvents({
      catches: [],
      rigs: [{ session_id: "s1", fly_name: "Zebra Midge" }],
      sessionDateById: new Map([["s1", "2026-03-01"]]),
      flyNameById: new Map(),
    });
    assert.equal(computeTopFly(events)?.name, "Zebra Midge");
  });
});
