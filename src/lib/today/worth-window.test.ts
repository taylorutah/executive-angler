import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildFiveDayOutlook, deriveBestWindow } from "./worth-window.ts";

describe("deriveBestWindow", () => {
  it("needs three sessions before it returns a band", () => {
    assert.deepEqual(deriveBestWindow([{ river_flow_cfs: 400 }, { river_flow_cfs: 500 }]), {
      flowMin: null,
      flowMax: null,
      sessionCount: 2,
    });
  });

  it("uses flows from the top third of sessions by fish logged", () => {
    const win = deriveBestWindow([
      { river_flow_cfs: 200, total_fish: 1 },
      { river_flow_cfs: 400, total_fish: 2 },
      { river_flow_cfs: 500, total_fish: 8 },
      { river_flow_cfs: 600, total_fish: 10 },
    ]);
    assert.equal(win.sessionCount, 4);
    assert.equal(win.flowMin, 500);
    assert.equal(win.flowMax, 600);
  });
});

describe("buildFiveDayOutlook", () => {
  it("never invents cfs for future days", () => {
    const days = buildFiveDayOutlook(
      {
        time: ["2026-08-26", "2026-08-27"],
        temperature_2m_max: [72, 68],
        weather_code: [0, 3],
      },
      { flowMin: 400, flowMax: 800, sessionCount: 4 },
      650,
      "Madison River",
    );
    assert.equal(days.length, 2);
    assert.match(days[1].note, /do not forecast cfs/i);
  });
});
