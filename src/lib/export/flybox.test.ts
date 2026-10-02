import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { summarizeVersion } from "@/components/flies-v3/summarize-version";
import {
  assembleFlyboxRows,
  buildFlyboxCsv,
  escapeCsv,
  flyboxExportFilename,
  formatTierLabel,
  inventoryCounts,
  parseFlyboxSelection,
  selectionSubtitle,
  summarizeExport,
  type FlyboxExportBox,
} from "./flybox.ts";

const boxA: FlyboxExportBox = {
  id: "box-a",
  name: "Madison Summer",
  tier: "kill",
  description: "Chest",
  sort_order: 0,
};
const boxB: FlyboxExportBox = {
  id: "box-b",
  name: "Support",
  tier: "support",
  description: null,
  sort_order: 1,
};

describe("inventoryCounts", () => {
  it("adds tied and bought for Total", () => {
    assert.deepEqual(inventoryCounts(4, 2, 10), {
      tied: 4,
      bought: 2,
      total: 6,
      target: 10,
      need: 4,
    });
  });

  it("never returns a negative Need", () => {
    assert.equal(inventoryCounts(8, 4, 6).need, 0);
    assert.equal(inventoryCounts(0, 0, 0).need, 0);
  });

  it("treats null counts as zero", () => {
    assert.deepEqual(inventoryCounts(null, undefined, 3), {
      tied: 0,
      bought: 0,
      total: 0,
      target: 3,
      need: 3,
    });
  });
});

describe("escapeCsv", () => {
  it("leaves plain values alone", () => {
    assert.equal(escapeCsv("Pheasant Tail"), "Pheasant Tail");
  });

  it("quotes commas, quotes, and newlines", () => {
    assert.equal(escapeCsv("Kill, chest"), '"Kill, chest"');
    assert.equal(escapeCsv('Say "hi"'), '"Say ""hi"""');
    assert.equal(escapeCsv("line1\nline2"), '"line1\nline2"');
  });
});

describe("summarizeVersion", () => {
  it("prefers a nickname", () => {
    assert.equal(
      summarizeVersion({ nickname: "Hot spot", size: "16", slot_overrides: {} }),
      "Hot spot",
    );
  });

  it("builds #size · bead · body when there is no nickname", () => {
    assert.equal(
      summarizeVersion({
        nickname: null,
        size: "16",
        slot_overrides: { bead: { size_mm: 3, color: "copper" }, body: { color: "olive" } },
      }),
      "#16 · 3mm copper · olive body",
    );
  });

  it("falls back to Default version", () => {
    assert.equal(
      summarizeVersion({ nickname: "  ", size: null, slot_overrides: {} }),
      "Default version",
    );
  });
});

describe("assembleFlyboxRows", () => {
  it("sorts by box order, then sort_order, then fly name", () => {
    const rows = assembleFlyboxRows([boxA, boxB], [
      {
        boxId: "box-b",
        sortOrder: 0,
        flyName: "Zebra Midge",
        nickname: null,
        size: "20",
        slotOverrides: {},
        tied: 1,
        bought: 0,
        target: 6,
      },
      {
        boxId: "box-a",
        sortOrder: 1,
        flyName: "Zebra Midge",
        nickname: null,
        size: "18",
        slotOverrides: {},
        tied: 2,
        bought: 0,
        target: 4,
      },
      {
        boxId: "box-a",
        sortOrder: 1,
        flyName: "Pheasant Tail",
        nickname: "PT",
        size: "16",
        slotOverrides: {},
        tied: 3,
        bought: 1,
        target: 8,
      },
    ]);
    assert.deepEqual(
      rows.map((r) => r.flyName),
      ["Pheasant Tail", "Zebra Midge", "Zebra Midge"],
    );
    assert.deepEqual(
      rows.map((r) => r.boxName),
      ["Madison Summer", "Madison Summer", "Support"],
    );
  });

  it("repeats the same configuration in each selected box", () => {
    const rows = assembleFlyboxRows([boxA, boxB], [
      {
        boxId: "box-a",
        sortOrder: 0,
        flyName: "RS2",
        nickname: null,
        size: "20",
        slotOverrides: {},
        tied: 5,
        bought: 0,
        target: 5,
      },
      {
        boxId: "box-b",
        sortOrder: 0,
        flyName: "RS2",
        nickname: null,
        size: "20",
        slotOverrides: {},
        tied: 5,
        bought: 0,
        target: 5,
      },
    ]);
    assert.equal(rows.length, 2);
    assert.equal(rows[0].boxId, "box-a");
    assert.equal(rows[1].boxId, "box-b");
  });
});

describe("buildFlyboxCsv", () => {
  it("writes a BOM, header, and Need as 0 (not a dash)", () => {
    const rows = assembleFlyboxRows([boxA], [
      {
        boxId: "box-a",
        sortOrder: 0,
        flyName: "Adams, Parachute",
        nickname: null,
        size: "16",
        slotOverrides: {},
        tied: 2,
        bought: 2,
        target: 4,
      },
    ]);
    const csv = buildFlyboxCsv(rows);
    assert.equal(csv.charCodeAt(0), 0xfeff);
    assert.match(csv, /Box,Tier,Fly,Version,Size,Tied,Bought,Total,Target,Need/);
    assert.match(csv, /"Adams, Parachute"/);
    assert.match(csv, /2,2,4,4,0/);
    assert.equal(csv.includes("—"), false);
  });

  it("skips empty boxes (no data rows)", () => {
    const csv = buildFlyboxCsv(assembleFlyboxRows([boxA, boxB], []));
    const lines = csv.replace(/^\uFEFF/, "").split("\n");
    assert.equal(lines.length, 1);
    assert.equal(lines[0], "Box,Tier,Fly,Version,Size,Tied,Bought,Total,Target,Need");
  });
});

describe("parseFlyboxSelection", () => {
  it("treats missing ids/all as empty", () => {
    assert.deepEqual(parseFlyboxSelection(new URLSearchParams()), { kind: "empty" });
    assert.deepEqual(parseFlyboxSelection(new URLSearchParams("ids=")), { kind: "empty" });
  });

  it("reads all=1 and a list of ids", () => {
    assert.deepEqual(parseFlyboxSelection(new URLSearchParams("all=1")), { kind: "all" });
    assert.deepEqual(parseFlyboxSelection(new URLSearchParams("ids=a, b,,c")), {
      kind: "ids",
      ids: ["a", "b", "c"],
    });
  });
});

describe("flyboxExportFilename / subtitle / tier", () => {
  it("slugs a single box and uses the generic name for several", () => {
    assert.equal(
      flyboxExportFilename([boxA], "csv"),
      "executive-angler-flybox-madison-summer.csv",
    );
    assert.equal(
      flyboxExportFilename([boxA, boxB], "pdf"),
      "executive-angler-flybox.pdf",
    );
  });

  it("labels all vs named selection", () => {
    assert.equal(selectionSubtitle(true, [boxA, boxB]), "All boxes");
    assert.equal(selectionSubtitle(false, [boxA, boxB]), "Madison Summer, Support");
  });

  it("uses default tier labels", () => {
    assert.equal(formatTierLabel("kill"), "Kill");
    assert.equal(formatTierLabel("saltwater"), "Saltwater");
  });

  it("sums printed rows for the summary bar", () => {
    const rows = assembleFlyboxRows([boxA], [
      {
        boxId: "box-a",
        sortOrder: 0,
        flyName: "PT",
        nickname: null,
        size: "16",
        slotOverrides: {},
        tied: 2,
        bought: 1,
        target: 8,
      },
    ]);
    assert.deepEqual(summarizeExport(rows), {
      versions: 1,
      tied: 2,
      bought: 1,
      need: 5,
    });
  });
});
