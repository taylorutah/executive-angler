import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  PARAM_DISCHARGE,
  PARAM_WATER_TEMP,
  clockMinutes,
  dailyUrl,
  latestContinuousUrl,
  locationsFromOgc,
  observationsFromLegacy,
  observationsFromOgc,
  usableNumber,
} from "./client";

const OGC_LATEST = {
  properties: {
    monitoring_location_id: "USGS-06038500",
    parameter_code: "00060",
    time: "2026-08-31T13:45:00+00:00",
    value: "760",
    monitoring_location_name: "Madison River bl Hebgen Lake nr Grayling MT",
  },
};

const LEGACY_IV = {
  value: {
    timeSeries: [
      {
        sourceInfo: {
          siteName: "Madison River bl Hebgen Lake nr Grayling MT",
          siteCode: [{ value: "06038500" }],
        },
        variable: { variableCode: [{ value: "00060" }] },
        values: [
          {
            value: [
              { value: "760", dateTime: "2026-08-31T07:45:00.000-06:00" },
              { value: "-999999", dateTime: "2026-08-31T08:00:00.000-06:00" },
            ],
          },
        ],
      },
    ],
  },
};

describe("OGC URL builders", () => {
  it("targets api.waterdata.usgs.gov and never dumps P1D", () => {
    const url = latestContinuousUrl(["06038500", "06040000"], [PARAM_DISCHARGE, PARAM_WATER_TEMP]);
    assert.equal(url.includes("api.waterdata.usgs.gov"), true);
    assert.equal(url.includes("latest-continuous"), true);
    assert.equal(url.includes("USGS-06038500"), true);
    assert.equal(url.includes("period="), false);
    assert.equal(url.includes("waterservices.usgs.gov"), false);
  });

  it("asks daily for a dated window, not a truncated dump", () => {
    const url = dailyUrl(["06038500"], "2026-08-01", "2026-08-31");
    assert.equal(url.includes("/daily/items"), true);
    assert.equal(url.includes("2026-08-01"), true);
    assert.equal(url.includes("2026-08-31"), true);
    assert.equal(url.includes("statistic_id=00003"), true);
  });
});

describe("observationsFromOgc", () => {
  it("reads discharge from a latest-continuous feature", () => {
    const obs = observationsFromOgc([OGC_LATEST]);
    assert.equal(obs.length, 1);
    assert.equal(obs[0]?.siteId, "06038500");
    assert.equal(obs[0]?.parameterCode, "00060");
    assert.equal(obs[0]?.value, 760);
  });

  it("reads a live latest-continuous payload that omits monitoring_location_name", () => {
    const obs = observationsFromOgc([
      {
        properties: {
          time_series_id: "28bbb0def4fe41ca8e1273f94a3960d5",
          monitoring_location_id: "USGS-06038500",
          parameter_code: "00060",
          statistic_id: "00011",
          time: "2026-08-31T14:45:00+00:00",
          value: "760",
          unit_of_measure: "ft^3/s",
          approval_status: "Provisional",
          qualifier: null,
        },
      },
    ]);
    assert.equal(obs[0]?.siteId, "06038500");
    assert.equal(obs[0]?.value, 760);
  });

  it("reads daily means whose time is a date, not an instant", () => {
    const obs = observationsFromOgc([
      {
        properties: {
          monitoring_location_id: "USGS-06038500",
          parameter_code: "00060",
          statistic_id: "00003",
          time: "2026-08-01",
          value: "1240",
        },
      },
    ]);
    assert.equal(obs[0]?.dateTime, "2026-08-01");
    assert.equal(obs[0]?.value, 1240);
  });

  it("skips null and sentinel values", () => {
    assert.deepEqual(
      observationsFromOgc([
        { properties: { ...OGC_LATEST.properties, value: null } },
        { properties: { ...OGC_LATEST.properties, value: "-999999" } },
      ]),
      [],
    );
  });
});

describe("observationsFromLegacy", () => {
  it("keeps real IV points and drops the USGS missing sentinel", () => {
    const obs = observationsFromLegacy(LEGACY_IV, [PARAM_DISCHARGE]);
    assert.equal(obs.length, 1);
    assert.equal(obs[0]?.siteId, "06038500");
    assert.equal(obs[0]?.value, 760);
  });
});

describe("locationsFromOgc", () => {
  it("reads GeoJSON [lng, lat]", () => {
    const locs = locationsFromOgc([
      {
        geometry: { type: "Point", coordinates: [-111.33878, 44.86639] },
        properties: {
          id: "USGS-06038500",
          monitoring_location_name: "Madison River bl Hebgen Lake nr Grayling MT",
        },
      },
    ]);
    assert.equal(locs[0]?.siteId, "06038500");
    assert.equal(locs[0]?.latitude, 44.86639);
    assert.equal(locs[0]?.longitude, -111.33878);
  });
});

describe("clockMinutes", () => {
  it("converts OGC UTC to America/Denver wall time", () => {
    // 13:45 UTC on 31 Aug = 07:45 MDT
    assert.equal(clockMinutes("2026-08-31T13:45:00+00:00"), 7 * 60 + 45);
  });

  it("reads a WaterServices site-local offset the same way", () => {
    assert.equal(clockMinutes("2026-08-31T07:45:00.000-06:00"), 7 * 60 + 45);
  });
});

describe("usableNumber", () => {
  it("rejects empty and sentinel", () => {
    assert.equal(usableNumber(""), null);
    assert.equal(usableNumber("-999999"), null);
    assert.equal(usableNumber("760"), 760);
  });
});
