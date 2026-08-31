import type { AccessPoint } from "@/types/entities";

export type AccessGroup = {
  label?: string;
  points: AccessPoint[];
};

/** Green River is one water with two fisheries. Split at the UT/WY line (~41.5°). */
const GREEN_SPLIT_LAT = 41.5;

export function groupAccessPoints(
  slug: string,
  points: AccessPoint[] | undefined,
): AccessGroup[] {
  const list = points ?? [];
  if (list.length === 0) return [];
  if (slug !== "green-river") return [{ points: list }];

  const wyoming = list.filter((p) => p.latitude >= GREEN_SPLIT_LAT);
  const flamingGorge = list.filter((p) => p.latitude < GREEN_SPLIT_LAT);
  const groups: AccessGroup[] = [];
  if (wyoming.length > 0) {
    groups.push({ label: "Wyoming headwaters", points: wyoming });
  }
  if (flamingGorge.length > 0) {
    groups.push({ label: "Flaming Gorge tailwater", points: flamingGorge });
  }
  return groups.length > 0 ? groups : [{ points: list }];
}
