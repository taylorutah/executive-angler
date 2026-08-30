import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { recipeSlotLabel, uniqueRecipeRows } from "./recipe-slots";
import type { LinkedMaterialSlot } from "./link-materials";

function slot(
  s: string,
  material: string,
  description?: string,
): LinkedMaterialSlot {
  return { slot: s, material, description, href: null, catalogName: null };
}

describe("recipeSlotLabel", () => {
  it("keeps one BOM name per nymph slot", () => {
    assert.equal(recipeSlotLabel("hook"), "Hook");
    assert.equal(recipeSlotLabel("thorax"), "Thorax");
    assert.equal(recipeSlotLabel("abdomen"), "Body");
    assert.equal(
      recipeSlotLabel("wing", "Pearl Mylar tinsel (flashback wingcase)"),
      "Wingcase",
    );
    assert.equal(recipeSlotLabel("wing", "White calf tail"), "Wing");
  });
});

describe("uniqueRecipeRows", () => {
  it("does not print Body twice when abdomen and thorax share body", () => {
    const rows = uniqueRecipeRows([
      slot("hook", "2x long nymph, #12-18"),
      slot("body", "Hare's ear dubbing"),
      slot("body", "Hare's ear dubbing, picked out"),
      slot("wing", "Pearl Mylar tinsel (flashback wingcase)"),
      slot("thorax", "Hare's ear dubbing, picked out"),
    ]);
    const labels = rows.map((r) => r.label);
    assert.deepEqual(new Set(labels).size, labels.length);
    assert.equal(labels.filter((l) => l === "Body").length, 1);
    assert.ok(labels.includes("Thorax"));
    assert.ok(labels.includes("Wingcase"));
  });
});
