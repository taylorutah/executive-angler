import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { arrangeFlyIndex, PLATE_PIN_HREFS } from "./DeskFlyIndex";
import type { CardData } from "@/types/list-config";

function fly(slug: string, title = slug): CardData {
  return {
    href: `/flies/${slug}`,
    imageAlt: title,
    title,
  };
}

describe("arrangeFlyIndex", () => {
  it("pins Soft Hackle Carrot on the plate when the catalog row is present", () => {
    const items = [
      fly("adams", "Adams"),
      fly("muddler-minnow", "Muddler Minnow"),
      fly("soft-hackle-carrot", "Soft Hackle Carrot"),
      fly("pheasant-tail", "Pheasant Tail"),
    ];
    const { plate, rest } = arrangeFlyIndex(items);
    assert.equal(plate[0]?.href, "/flies/soft-hackle-carrot");
    assert.equal(plate[0]?.title, "Soft Hackle Carrot");
    assert.equal(
      rest.some((item) => item.href === "/flies/soft-hackle-carrot"),
      false,
    );
    assert.equal(PLATE_PIN_HREFS.includes("/flies/soft-hackle-carrot"), true);
  });

  it("does not invent the fly when the catalog omits it", () => {
    const items = [fly("adams", "Adams"), fly("muddler-minnow", "Muddler Minnow")];
    const { plate, rest } = arrangeFlyIndex(items);
    assert.equal(
      [...plate, ...rest].some((item) => item.href === "/flies/soft-hackle-carrot"),
      false,
    );
    assert.equal(plate.length, 2);
  });
});
