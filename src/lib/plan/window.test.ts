import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { deriveWindow, fliesForWindow, windowSentence } from "./window.ts";
import type { HatchMonth } from "../../types/entities.ts";

const chart: HatchMonth[] = [
  {
    month: "March",
    hatches: [
      { insect: "Midges", size: "#18-22", pattern: "Zebra Midge, Griffith's Gnat", intensity: "moderate" },
    ],
  },
  {
    month: "July",
    hatches: [
      { insect: "Caddis", size: "#14-16", pattern: "Elk Hair Caddis", intensity: "heavy" },
      { insect: "PMD", size: "#16", pattern: "Sparkle Dun", intensity: "sparse" },
    ],
  },
];

// Fixed clock in Denver terms: 2026-03-10 is March.
const march = new Date("2026-03-10T18:00:00Z");

describe("deriveWindow", () => {
  it("writes the brief for today when today is a listed month", () => {
    const win = deriveWindow(["March", "July"], chart, march);
    assert.equal(win.source, "in-window");
    assert.equal(win.month, "March");
    assert.equal(win.hatches.length, 1);
  });

  it("rolls forward to the next listed month when today is outside the window", () => {
    const win = deriveWindow(["July", "August"], chart, march);
    assert.equal(win.source, "next-listed");
    assert.equal(win.month, "July");
    assert.equal(win.hatches.length, 2);
  });

  it("wraps the year when every listed month is behind today", () => {
    const win = deriveWindow(["January"], chart, march);
    assert.equal(win.month, "January");
  });

  it("falls back to the hatch chart when no best months are stored", () => {
    const win = deriveWindow([], chart, march);
    assert.equal(win.source, "charted-only");
    assert.equal(win.month, "March");
  });

  it("reports nothing rather than inventing a month", () => {
    const win = deriveWindow([], [], march);
    assert.equal(win.source, "none");
    assert.equal(win.month, null);
    assert.equal(win.hatches.length, 0);
  });

  it("accepts short month names from stored data", () => {
    const win = deriveWindow(["Mar"], chart, march);
    assert.equal(win.month, "March");
    assert.deepEqual(win.listedMonths, ["March"]);
  });

  it("names no month it was not given", () => {
    const win = deriveWindow(["July"], chart, march);
    assert.ok(windowSentence(win, "Test River").includes("July"));
    assert.ok(!windowSentence(win, "Test River").includes("August"));
  });
});

describe("fliesForWindow", () => {
  it("splits stored pattern strings without adding patterns", () => {
    const flies = fliesForWindow(deriveWindow(["March"], chart, march).hatches);
    assert.deepEqual(flies[0].patterns, ["Zebra Midge", "Griffith's Gnat"]);
  });

  it("puts the heaviest charted hatch first", () => {
    const flies = fliesForWindow(deriveWindow(["July"], chart, march).hatches);
    assert.equal(flies[0].insect, "Caddis");
  });

  it("returns nothing for an empty chart", () => {
    assert.deepEqual(fliesForWindow([]), []);
  });
});
