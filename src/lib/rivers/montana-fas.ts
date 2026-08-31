/** Official Montana FAS / USFS lots used for pin tests. Do not invent extra holes. */

export type OfficialAccess = {
  name: string;
  latitude: number;
  longitude: number;
  source: string;
};

export const MONTANA_OFFICIAL_ACCESS: OfficialAccess[] = [
  {
    name: "Three Dollar Bridge FAS",
    latitude: 44.83194,
    longitude: -111.51417,
    source: "FWP FishMT 39754533",
  },
  {
    name: "Raynolds' Pass FAS",
    latitude: 44.82871,
    longitude: -111.47933,
    source: "FWP FishMT 39753440",
  },
  {
    name: "Lyons Bridge FAS",
    latitude: 44.8991,
    longitude: -111.5926,
    source: "FWP FishMT 39753518",
  },
  {
    name: "McAtee Bridge FAS",
    latitude: 45.09665,
    longitude: -111.66152,
    source: "FWP FishMT 39753516",
  },
  {
    name: "Varney Bridge FAS",
    latitude: 45.229,
    longitude: -111.75196,
    source: "FWP FishMT 39753404",
  },
  {
    name: "Ennis Bridge FAS",
    latitude: 45.34443,
    longitude: -111.7231,
    source: "FWP FishMT 39753534",
  },
  {
    name: "Valley Garden FAS",
    latitude: 45.36726,
    longitude: -111.7054,
    source: "FWP FishMT 39753456",
  },
  {
    name: "Wally Crawford FAS",
    latitude: 46.09179,
    longitude: -114.17494,
    source: "FWP GIS",
  },
  {
    name: "River Junction FAS",
    latitude: 46.98574,
    longitude: -113.13638,
    source: "FWP GIS",
  },
  {
    name: "Bighorn FAS (13-Mile)",
    latitude: 45.4146,
    longitude: -107.78649,
    source: "FWP FishMT 39753822",
  },
  {
    name: "Afterbay Dam Launch",
    latitude: 45.31829,
    longitude: -107.924,
    source: "Yellowtail Afterbay launch (NPS/BIA vicinity)",
  },
  {
    name: "Mountain Palace FAS",
    latitude: 47.16256,
    longitude: -111.82311,
    source: "FWP GIS",
  },
  {
    name: "Craig FAS (Craig Bridge)",
    latitude: 47.07256,
    longitude: -111.96305,
    source: "FWP GIS",
  },
  {
    name: "Maiden Rock FAS",
    latitude: 45.65559,
    longitude: -112.69612,
    source: "FWP GIS Maidenrock",
  },
  {
    name: "Henneberry Bridge FAS",
    latitude: 45.0597,
    longitude: -112.81503,
    source: "FWP GIS",
  },
  {
    name: "Vigilante FAS",
    latitude: 45.25994,
    longitude: -112.10057,
    source: "FWP GIS",
  },
  {
    name: "Mallard's Rest FAS",
    latitude: 45.48483,
    longitude: -110.62164,
    source: "FWP GIS",
  },
  {
    name: "Loch Leven FAS (Emigrant area)",
    latitude: 45.45722,
    longitude: -110.62424,
    source: "FWP GIS",
  },
  {
    name: "Greek Creek Campground",
    latitude: 45.3725,
    longitude: -111.1764,
    source: "USFS / gazetteer",
  },
  {
    name: "Moose Creek Flat",
    latitude: 45.356,
    longitude: -111.1721,
    source: "USFS",
  },
];

function normalizeAccessName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*\(.*?\)\s*/g, " ")
    .trim();
}

const BY_NAME = new Map(
  MONTANA_OFFICIAL_ACCESS.map((row) => [normalizeAccessName(row.name), row]),
);

/** Extra keys so "Craig FAS" and "Loch Leven FAS" still match the official row. */
BY_NAME.set("craig fas", BY_NAME.get("craig fas")!);
BY_NAME.set("loch leven fas", BY_NAME.get("loch leven fas")!);
BY_NAME.set("bighorn fas", BY_NAME.get("bighorn fas")!);
BY_NAME.set("raynolds pass fas", BY_NAME.get("raynolds pass fas")!);

export function officialAccessFor(name: string): OfficialAccess | undefined {
  return BY_NAME.get(normalizeAccessName(name));
}

export function haversineMeters(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}
