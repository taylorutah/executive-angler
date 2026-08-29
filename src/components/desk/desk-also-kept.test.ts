import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { groupAlsoKept } from "./DeskAlsoKept";
import type { CardData } from "@/types/list-config";

function item(title: string, group?: string): CardData {
  return {
    href: `/${title}`,
    imageAlt: title,
    title,
    group,
    meta: "meta",
  };
}

describe("groupAlsoKept", () => {
  it("groups by state and sorts names", () => {
    const groups = groupAlsoKept([
      item("Yellowstone River", "Montana"),
      item("Madison River", "Montana"),
      item("Green River", "Utah"),
    ]);
    assert.deepEqual(
      groups.map((g) => [g.group, g.items.map((i) => i.title)]),
      [
        ["Montana", ["Madison River", "Yellowstone River"]],
        ["Utah", ["Green River"]],
      ],
    );
  });

  it("does not invent a state when group is missing", () => {
    const groups = groupAlsoKept([item("Unknown Water")]);
    assert.equal(groups[0]?.group, "Also kept");
    assert.equal(groups[0]?.items[0]?.title, "Unknown Water");
  });
});
