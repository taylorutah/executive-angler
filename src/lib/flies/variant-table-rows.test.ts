import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { PublicVariantRow } from "./variant-rows";
import {
  beadLabelFromOverrides,
  bodyLabelFromOverrides,
  mergeRows,
  type VariantTableConfig,
} from "./variant-table-rows";

const publicRows: PublicVariantRow[] = [
  { key: "14", size: "#14", bead: "3mm · tungsten · gold", body: "olive" },
  { key: "16", size: "#16", bead: "2.5mm · tungsten · gold", body: "olive" },
];

function config(
  partial: Pick<VariantTableConfig, "id" | "size"> &
    Partial<Omit<VariantTableConfig, "id" | "size">>,
): VariantTableConfig {
  return {
    tied_count: 1,
    bought_count: 0,
    target_count: 6,
    slot_overrides: {},
    ...partial,
  };
}

describe("beadLabelFromOverrides", () => {
  it("joins size_mm and color", () => {
    assert.equal(
      beadLabelFromOverrides({ bead: { size_mm: 2.5, color: "gold" } }),
      "2.5mm gold",
    );
  });

  it("skips none material", () => {
    assert.equal(
      beadLabelFromOverrides({ bead: { color: "black", material: "none" } }),
      "black",
    );
  });
});

describe("bodyLabelFromOverrides", () => {
  it("uses body.color", () => {
    assert.equal(bodyLabelFromOverrides({ body: { color: "olive" } }), "olive");
  });

  it("falls back when body color is missing", () => {
    assert.equal(bodyLabelFromOverrides({}), "—");
  });
});

describe("mergeRows", () => {
  it("public #14/#16 with no configs stay two Add rows", () => {
    const rows = mergeRows(publicRows, []);
    assert.equal(rows.length, 2);
    assert.deepEqual(
      rows.map((r) => r.configurationId),
      [null, null],
    );
    assert.deepEqual(
      rows.map((r) => r.key),
      ["14", "16"],
    );
  });

  it("one #16 olive config keeps public Add and adds a mine row", () => {
    const rows = mergeRows(publicRows, [
      config({
        id: "cfg-olive",
        size: "16",
        slot_overrides: {
          bead: { size_mm: 2.5, color: "gold" },
          body: { color: "olive" },
        },
      }),
    ]);
    const publicOnly = rows.filter((r) => !r.key.startsWith("mine-"));
    const mine = rows.filter((r) => r.key.startsWith("mine-"));
    assert.equal(publicOnly.length, 2);
    assert.ok(publicOnly.every((r) => r.configurationId == null));
    assert.equal(mine.length, 1);
    assert.equal(mine[0].key, "mine-cfg-olive");
    assert.equal(mine[0].configurationId, "cfg-olive");
    assert.equal(mine[0].size, "#16");
    assert.equal(mine[0].body, "olive");
    assert.equal(mine[0].bead, "2.5mm gold");
    assert.equal(mine[0].stock, 1);
  });

  it("two same-size colors become two mine rows; public rows stay Add", () => {
    const rows = mergeRows(publicRows, [
      config({
        id: "cfg-olive",
        size: "#16",
        slot_overrides: { body: { color: "olive" } },
      }),
      config({
        id: "cfg-black",
        size: "16",
        slot_overrides: { body: { color: "black" } },
      }),
    ]);
    const publicOnly = rows.filter((r) => !r.key.startsWith("mine-"));
    const mine = rows.filter((r) => r.key.startsWith("mine-"));
    assert.equal(publicOnly.length, 2);
    assert.ok(publicOnly.every((r) => r.configurationId == null));
    assert.equal(mine.length, 2);
    assert.deepEqual(
      mine.map((r) => r.body),
      ["olive", "black"],
    );
    assert.ok(mine.every((r) => r.size === "#16"));
    assert.ok(mine.every((r) => r.configurationId != null));
  });
});
