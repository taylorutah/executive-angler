import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { rivers } from "@/data/rivers";
import {
  haversineMeters,
  officialAccessFor,
  MONTANA_OFFICIAL_ACCESS,
} from "./montana-fas";

const MAX_DELTA_M = 75;

describe("Montana official access pins", () => {
  it("lists unique official names", () => {
    const names = MONTANA_OFFICIAL_ACCESS.map((r) => r.name);
    assert.equal(new Set(names).size, names.length);
  });

  it("seed pins that match an official FAS sit within 75 m", () => {
    const checked: string[] = [];
    for (const river of rivers) {
      for (const ap of river.accessPoints ?? []) {
        const official = officialAccessFor(ap.name);
        if (!official) continue;
        const delta = haversineMeters(ap, official);
        checked.push(`${river.slug}:${ap.name}`);
        assert.ok(
          delta <= MAX_DELTA_M,
          `${river.slug} ${ap.name} is ${Math.round(delta)} m from ${official.source}`,
        );
      }
    }
    assert.ok(
      checked.includes("madison-river:Lyons Bridge FAS"),
      "Madison Lyons must be in seed",
    );
    assert.ok(
      checked.includes("madison-river:Three Dollar Bridge FAS"),
      "Madison must list Three Dollar Bridge FAS",
    );
    assert.ok(
      checked.includes("madison-river:Raynolds' Pass FAS") ||
        checked.includes("madison-river:Raynolds' Pass FAS"),
      "Madison must list Raynolds' Pass FAS",
    );
  });
});
