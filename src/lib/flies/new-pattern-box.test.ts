import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  autoConfigCountsFromSource,
  firstHookSize,
  newPatternBoxEntry,
  pickTargetFlyBoxId,
  type FlyBoxPickRow,
} from "./new-pattern-box.ts";

const steveBoxes: FlyBoxPickRow[] = [
  { id: "0ad4c3ef-ffad-43bd-8593-689fcbcc541b", is_default: false, created_at: "2026-03-01T10:00:00Z" },
  { id: "box-dry", is_default: false, created_at: "2026-03-02T10:00:00Z" },
  { id: "box-midge", is_default: false, created_at: "2026-03-03T10:00:00Z" },
  { id: "box-streamer", is_default: false, created_at: "2026-03-04T10:00:00Z" },
  { id: "box-emerger", is_default: false, created_at: "2026-03-05T10:00:00Z" },
  { id: "box-terrestrial", is_default: false, created_at: "2026-03-06T10:00:00Z" },
  { id: "box-caddis", is_default: false, created_at: "2026-03-07T10:00:00Z" },
];

describe("pickTargetFlyBoxId", () => {
  it("returns the oldest box when none is default and does not invent My Fly Box", () => {
    const id = pickTargetFlyBoxId(steveBoxes);
    assert.equal(id, "0ad4c3ef-ffad-43bd-8593-689fcbcc541b");
    assert.notEqual(id, null);
  });

  it("prefers is_default even when it is not the oldest", () => {
    const boxes: FlyBoxPickRow[] = [
      { id: "oldest", is_default: false, created_at: "2026-01-01T00:00:00Z" },
      { id: "default", is_default: true, created_at: "2026-06-01T00:00:00Z" },
    ];
    assert.equal(pickTargetFlyBoxId(boxes), "default");
  });

  it("returns null when the user has zero boxes (caller may create My Fly Box)", () => {
    assert.equal(pickTargetFlyBoxId([]), null);
  });
});

describe("firstHookSize", () => {
  it("strips # and takes the first comma-separated size", () => {
    assert.equal(firstHookSize("#20"), "20");
    assert.equal(firstHookSize("16, 18"), "16");
    assert.equal(firstHookSize("  #18, #20 "), "18");
  });

  it("returns undefined when empty", () => {
    assert.equal(firstHookSize(""), undefined);
    assert.equal(firstHookSize("  ,  "), undefined);
    assert.equal(firstHookSize(undefined), undefined);
  });
});

describe("autoConfigCountsFromSource", () => {
  it("sets bought_count 1 for bought", () => {
    assert.deepEqual(autoConfigCountsFromSource("bought"), {
      tied_count: 0,
      bought_count: 1,
    });
  });

  it("leaves 0/0 for tied or missing", () => {
    assert.deepEqual(autoConfigCountsFromSource("tied"), {
      tied_count: 0,
      bought_count: 0,
    });
    assert.deepEqual(autoConfigCountsFromSource(undefined), {
      tied_count: 0,
      bought_count: 0,
    });
  });
});

describe("newPatternBoxEntry", () => {
  it("builds a fly_box_entries_v3 row for that box, config, and user", () => {
    const cfgId = "cfg-hares-ear";
    const userId = "fa9ecd15-72b9-46a1-b108-74598726a878";
    const boxId = pickTargetFlyBoxId(steveBoxes);
    assert.ok(boxId);
    assert.deepEqual(newPatternBoxEntry(boxId, cfgId, userId), {
      box_id: boxId,
      configuration_id: cfgId,
      user_id: userId,
      sort_order: 0,
    });
  });
});
