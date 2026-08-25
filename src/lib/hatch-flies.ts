import type { CanonicalFly, HatchMonth, River } from "@/types/entities";
import { firstUsgsSiteId } from "@/lib/search/usgs";

function riverHasGauge(river: River): boolean {
  return Boolean(firstUsgsSiteId(river.usgsGaugeId));
}

function norm(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function tokens(s: string): string[] {
  return norm(s).split(" ").filter((w) => w.length > 2);
}

/** Score a catalog fly against a hatch chart pattern / insect name. No catch data. */
export function scoreFlyAgainstHatch(fly: CanonicalFly, pattern: string, insect: string): number {
  const name = norm(fly.name);
  const p = norm(pattern);
  const ins = norm(insect);
  if (!name) return 0;
  if (p && (name === p || name.includes(p) || p.includes(name))) return 6;
  const nameTok = new Set(tokens(fly.name));
  const pTok = tokens(pattern);
  const overlap = pTok.filter((t) => nameTok.has(t)).length;
  if (pTok.length && overlap >= Math.min(2, pTok.length)) return 4 + overlap;
  const imitates = (fly.imitates ?? []).map(norm);
  if (ins && imitates.some((i) => i.includes(ins) || ins.includes(i))) return 3;
  if (p && imitates.some((i) => i.includes(p) || p.includes(i))) return 2;
  return overlap > 0 ? 1 : 0;
}

export type GroupedFlies = {
  nymphs: CanonicalFly[];
  dries: CanonicalFly[];
  streamers: CanonicalFly[];
};

const NYMPH_CATS = new Set(["nymph", "midge", "egg", "emerger"]);
const DRY_CATS = new Set(["dry", "terrestrial"]);
const STREAMER_CATS = new Set(["streamer", "wet"]);

export function groupFlies(flies: CanonicalFly[]): GroupedFlies {
  const nymphs: CanonicalFly[] = [];
  const dries: CanonicalFly[] = [];
  const streamers: CanonicalFly[] = [];
  for (const f of flies) {
    if (NYMPH_CATS.has(f.category)) nymphs.push(f);
    else if (DRY_CATS.has(f.category)) dries.push(f);
    else if (STREAMER_CATS.has(f.category)) streamers.push(f);
    else nymphs.push(f);
  }
  return { nymphs, dries, streamers };
}

/**
 * Match hatch-chart pattern names to canonical flies, then fill gaps from
 * featured / category lists. Never reads user catch pulse.
 */
export function fliesFromHatchChart(
  hatchChart: HatchMonth[] | undefined,
  catalog: CanonicalFly[],
  featured: CanonicalFly[],
  byCategory: GroupedFlies
): CanonicalFly[] {
  const ranked = new Map<string, { fly: CanonicalFly; score: number }>();
  for (const month of hatchChart ?? []) {
    for (const h of month.hatches ?? []) {
      for (const fly of catalog) {
        const s = scoreFlyAgainstHatch(fly, h.pattern ?? "", h.insect ?? "");
        if (s <= 0) continue;
        const prev = ranked.get(fly.id);
        if (!prev || s > prev.score) ranked.set(fly.id, { fly, score: s });
      }
    }
  }
  const matched = [...ranked.values()]
    .sort((a, b) => b.score - a.score)
    .map((r) => r.fly);

  const seen = new Set(matched.map((f) => f.id));
  const fill = [...featured, ...byCategory.nymphs, ...byCategory.dries, ...byCategory.streamers];
  for (const f of fill) {
    if (matched.length >= 18) break;
    if (seen.has(f.id)) continue;
    seen.add(f.id);
    matched.push(f);
  }
  return matched.slice(0, 18);
}

export function currentMonthLabel(): string {
  return new Date().toLocaleString("en-US", { month: "long", timeZone: "America/Denver" });
}

const LEDES: Record<string, string> = {
  "madison-river":
    "The Madison is a two-river problem. Above Ennis Lake you are fishing a broad riffle-and-run meadow for rainbows and browns that see a lot of rubber legs. Below the lake the water warms, the wade game opens up, and caddis and PMDs do more of the work than the salmonfly posters suggest. This list is built from the hatch chart we publish for the river, not from anyone else's catch log.",
  "green-river":
    "Flaming Gorge's tailwater is gin-clear, crowded on the A section, and honest about fly size. Midges and scuds carry winter. PMDs, caddis, and cicadas carry summer. If you show up with a box of size 12 attractors and no 20s, you will look at a lot of fish you cannot move. Patterns below follow the Green River hatch chart, not a crowdsourced hot list.",
  "pecos-river-new-mexico":
    "The Pecos above Terrero is a small-water cutthroat and brown fishery with a wilderness upper and a roadside middle. High water in June shuts the easy pull-offs. By late summer you are fishing pocket water with a short leader and a short list: attractor dries, a pheasant tail, and a rubber legs in the deeper slots. Holy Ghost and the wilderness trail fish smaller and quieter than the campground water.",
  "little-cottonwood-creek":
    "Little Cottonwood is a Wasatch canyon creek, not a tailwater. It fishes well in a short spring window, then Utah's summer thermal shutdown is real. When it is open, a small dry-dropper and a tight nymph rig cover almost every pocket you can reach from the road. Treat the hatch chart as a calendar for stoneflies and caddis, and treat July afternoon water as a reason to walk away.",
  "rio-grande-new-mexico":
    "The Taos Box and the Orilla Verde water are different fisheries that share a name. The Box is a float through a canyon. The wade water above and below is pocket water and seams for browns. Golden stones and caddis are the honest hatches. Streamers have a job in stained water after a rain. This page tracks the Rio Grande hatch chart, not a permit-era rumor mill.",
  "methow-river":
    "The Methow is a north-central Washington snowmelt river that fishes like a smaller Yellowstone: big stones in early summer, caddis on the banks, and a dry-fly crowd that shows up when the runoff drops. You need a plan for high, off-color June and a different box for August evenings. Patterns follow the Methow hatch chart we store for this river.",
  "hat-creek-california":
    "Hat Creek's Wild Trout section is a spring creek with a reputation that outruns most visiting casts. Fish are on midges, PMDs, and Tricos more than on the fly you bought because it looked good in the bin. Long leaders, small flies, and a willingness to nymph the same lane are the job. The hatch table below is the editorial chart for Hat Creek, not a live trap report.",
  "weber-river-utah":
    "The Weber below Echo and through the Ogden valley is a year-round tailwater-influenced fishery that Utahns treat as a after-work river. Midges and blue-wings in the cold months. Caddis and hoppers when the banks dry out. It is not secret, and it is not large. A short nymph rig and a few dries cover it if you match size to the chart.",
  "strawberry-river-utah":
    "The Strawberry below the reservoir is a small tailwater with a big-fish reputation and a winter midge culture. Summer brings caddis and PMDs and more people. The river is short. You will share water. Bring 18s and 20s and a plan to fish the edges rather than the parking-lot run. Chart-based patterns only.",
  "provo-river":
    "The Middle Provo is Utah's most fished tailwater for a reason: it is close, it stays wadeable, and it hatches. It also educates trout. Midges, BWOs, and PMDs do more than the hopper you want to throw. The Lower Provo is a different, bigger channel. This list follows the Provo hatch chart. It does not tell you what someone landed at the weir last night.",
};

export function uniqueLede(river: River, placeLabel: string): string {
  if (LEDES[river.slug]) return LEDES[river.slug];
  const species = (river.primarySpecies ?? []).slice(0, 2).join(" and ") || "trout";
  const flow = river.flowType || "freestone";
  const wade = river.wadingType === "float" ? "fishes best from a boat" : river.wadingType === "both" ? "fishes as both a wade and a float" : "is primarily a wade fishery";
  const months = (river.bestMonths ?? []).slice(0, 3).join(", ");
  const where = placeLabel ? ` in ${placeLabel}` : "";
  return `The ${river.name}${where} ${wade}. It is a ${flow} fishery for ${species}${months ? `, with the most reliable window in ${months}` : ""}. The patterns below are matched to the hatch chart we publish for this water. They are not a live report of what other anglers caught this week.`;
}

export function setupCopy(river: River): string {
  const wade = river.wadingType;
  const flow = (river.flowType || "").toLowerCase();
  const tippet =
    flow.includes("tailwater") || flow.includes("spring")
      ? "5X and 6X fluorocarbon on nymphs, 5X on dries unless the fish are on Tricos, then 6X or 7X."
      : "4X and 5X cover most nymphing. 4X on dries until the fish get picky, then 5X.";
  const weight =
    flow.includes("tailwater")
      ? "Start lighter than your home river. One small tungsten and a long tag often beats a 3.5mm bead in clear water."
      : "A 3.0–3.8mm tungsten on the point and a lighter dropper is a default until you see the water.";
  const indicator =
    wade === "float"
      ? "From a boat, a yarn or New Zealand indicator is faster than a tight-line program if you are covering water. Tight-line the inside seams when you park."
      : "Tight-line the near bank and the heads of pockets. Use an indicator only when you need to search water you cannot euro.";
  return `${tippet} ${weight} ${indicator}`;
}

export function riverFaqs(
  river: River,
  placeLabel: string,
  patternA: string,
  patternB: string
): { question: string; answer: string }[] {
  const name = river.name;
  return [
    {
      question: `What flies work on the ${name}?`,
      answer: `Start with ${patternA} and ${patternB}, then match size to the hatch chart for the month you are standing in. The ${name} does not need a 40-pattern box. It needs the right size on the insect that is actually in the drift.`,
    },
    {
      question: `When is the best time to fly fish the ${name}?`,
      answer: (river.bestMonths ?? []).length
        ? `The editorial window we list is ${(river.bestMonths ?? []).join(", ")}. That is a planning month range, not a guarantee. Shoulder months can fish well if flows and water temperature cooperate.`
        : riverHasGauge(river)
          ? `Use the hatch chart on this page and the live USGS gauge on the ${name} river page. We do not publish other anglers' catch timing.`
          : `Use the hatch chart on this page. The ${name} river page has no USGS gauge mapped yet — we are not guessing a number. We do not publish other anglers' catch timing.`,
    },
    {
      question: `Do I need a guide on the ${name}?`,
      answer: `${placeLabel ? `${placeLabel} has` : "This water has"} walk-up wade water and, on some sections, float water. A guide is worth it for a first float or a technical tailwater. A hatch chart and a gauge are enough for a first wade if you already nymph. We list local guides and shops on this page when we have them.`,
    },
    {
      question: `Where can I see live flow for the ${name}?`,
      answer: riverHasGauge(river)
        ? `Open the ${name} river page for the USGS gauge, access notes, and the same hatch chart this fly list is built from. We do not publish other people's spots or fish counts.`
        : `The ${name} has no USGS gauge mapped yet. The river page says so; we are not guessing a number. Access notes and the hatch chart are on that page. We do not publish other people's spots or fish counts.`,
    },
    {
      question: `Is this a report of what's working now on the ${name}?`,
      answer: `No. Executive Angler does not publish other anglers' catches, GPS, or a crowdsourced hot fly. This page is hatch-chart patterns plus catalog flies. Presence on the river page is gauge and weather only.`,
    },
  ];
}
