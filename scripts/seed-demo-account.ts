/**
 * Seed a demo account with marketing-quality fishing data.
 *
 * Usage:
 *   npx tsx scripts/seed-demo-account.ts
 *
 * Idempotent — checks if user exists before creating.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://qlasxtfbodyxbcuchvxz.supabase.co";
const SERVICE_ROLE_KEY: string = process.env.SUPABASE_SERVICE_ROLE_KEY ?? (() => {
  console.error("ERROR: SUPABASE_SERVICE_ROLE_KEY env var is required.");
  console.error("Usage: SUPABASE_SERVICE_ROLE_KEY=<key> npx tsx scripts/seed-demo-account.ts");
  process.exit(1);
  return ""; // unreachable
})();

const DEMO_EMAIL = "demo@executiveangler.com";
const DEMO_PASSWORD = "DemoAngler2026!";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function supabaseAdmin(
  path: string,
  method: string,
  body?: unknown
): Promise<unknown> {
  const res = await fetch(`${SUPABASE_URL}${path}`, {
    method,
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`${method} ${path} → ${res.status}: ${text}`);
  }
  return text ? JSON.parse(text) : null;
}

async function rpc(table: string, method: string, body: unknown): Promise<unknown> {
  return supabaseAdmin(`/rest/v1/${table}`, method, body);
}

async function upsertRow(table: string, row: Record<string, unknown>, onConflict?: string): Promise<unknown> {
  const prefer = onConflict
    ? `return=representation,resolution=merge-duplicates`
    : `return=representation`;
  const url = onConflict
    ? `/rest/v1/${table}?on_conflict=${onConflict}`
    : `/rest/v1/${table}`;
  const res = await fetch(`${SUPABASE_URL}${url}`, {
    method: "POST",
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: prefer,
    },
    body: JSON.stringify(row),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`upsert ${table} → ${res.status}: ${text}`);
  return JSON.parse(text);
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const FLY_PATTERNS = [
  { name: "Zebra Midge", type: "nymph", notes: "Black thread, silver wire rib, silver bead. The Provo River killer." },
  { name: "RS2", type: "emerger", notes: "Rim Chung classic. Gray body, CDC wing post. Dead-drifted or swung in film." },
  { name: "Pheasant Tail", type: "nymph", notes: "Sawyer style, copper wire. Works everywhere, every time." },
  { name: "Frenchie", type: "nymph", notes: "Hot-spot pheasant tail. Pink or orange collar, slotted tungsten bead." },
  { name: "Pat's Rubber Legs", type: "nymph", notes: "Brown/tan rubber legs, lead-wrapped. Anchor fly for double-nymph rigs." },
  { name: "Copper John", type: "nymph", notes: "Barr's original. Copper wire body, epoxy wing case, tungsten bead." },
  { name: "BWO Sparkle Dun", type: "dry", notes: "Craig Mathews design. Z-lon shuck, deer hair wing. Size 18-20 for spring BWOs." },
  { name: "Purple Haze", type: "dry", notes: "Purple parachute Adams variant. Surprisingly effective on the Madison." },
  { name: "Griffith's Gnat", type: "dry", notes: "Midge cluster pattern. Grizzly hackle palmered over peacock herl." },
  { name: "San Juan Worm", type: "nymph", notes: "Red Ultra Chenille. Ugly but deadly after rain or high water." },
  { name: "Juju Baetis", type: "nymph", notes: "Charlie Craven design. Stripped peacock body, dark wing case." },
  { name: "Woolly Bugger", type: "streamer", notes: "Olive or black, gold bead, marabou tail. Strip or dead-drift deep." },
  { name: "Sculpin Streamer", type: "streamer", notes: "Articulated sculpin. Olive/tan, dumbell eyes. Strip hard along banks." },
  { name: "Adams", type: "dry", notes: "The universal dry fly. Grizzly/brown hackle mix. Search pattern." },
  { name: "Elk Hair Caddis", type: "dry", notes: "Al Troth original. Elk wing, palmered hackle. Dead-drift or skitter." },
];

interface SessionDef {
  title: string;
  river_id: string;
  river_name: string;
  section: string;
  location: string;
  date: string;
  weather: string;
  water_temp_f: number;
  water_clarity: string;
  notes: string;
  tags: string[];
  latitude: number;
  longitude: number;
  catches: CatchDef[];
}

interface CatchDef {
  species: string;
  length_inches: number;
  fly_name: string;
  fly_size: string;
  time_caught: string;
  catch_note?: string;
}

const SESSIONS: SessionDef[] = [
  // ── MADISON RIVER (10 sessions) ──────────────────────────
  {
    title: "Hebgen Dam — Cold Morning Midge Fest",
    river_id: "river-madison",
    river_name: "Madison River",
    section: "Below Hebgen Dam",
    location: "Madison River, MT",
    date: "2026-01-05",
    weather: "Overcast, 18°F, light snow, wind 5mph SW",
    water_temp_f: 34,
    water_clarity: "Clear",
    notes: "Arrived at first light to find a pod of risers tight against the dam. Midges coming off slow but steady. Went with a Zebra Midge dropper 18 inches below a Griffith's Gnat — fish were keyed in on the emergers just below the surface. Numb fingers but worth it.",
    tags: ["midges", "euro nymphing", "cold weather", "winter"],
    latitude: 44.8647,
    longitude: -111.3456,
    catches: [
      { species: "Brown Trout", length_inches: 14, fly_name: "Zebra Midge", fly_size: "#20", time_caught: "2026-01-05T08:45:00Z" },
      { species: "Rainbow Trout", length_inches: 11, fly_name: "Griffith's Gnat", fly_size: "#18", time_caught: "2026-01-05T09:20:00Z", catch_note: "Took the dry right in the film" },
      { species: "Brown Trout", length_inches: 16, fly_name: "Zebra Midge", fly_size: "#20", time_caught: "2026-01-05T10:05:00Z", catch_note: "Best fish of the day — butter yellow belly" },
      { species: "Mountain Whitefish", length_inches: 13, fly_name: "Zebra Midge", fly_size: "#20", time_caught: "2026-01-05T10:40:00Z" },
    ],
  },
  {
    title: "Three Dollar Bridge — Slow Start, Hot Finish",
    river_id: "river-madison",
    river_name: "Madison River",
    section: "Three Dollar Bridge",
    location: "Madison River, MT",
    date: "2026-01-18",
    weather: "Partly cloudy, 24°F, wind 10mph W",
    water_temp_f: 36,
    water_clarity: "Clear",
    notes: "Nothing happened for the first two hours. Switched from a dead-drift presentation to a slow swing with the Pheasant Tail and immediately started getting grabs. Fish were stacked in the deeper seam below the bridge. Lesson learned — sometimes they want movement in cold water.",
    tags: ["euro nymphing", "winter", "swing technique"],
    latitude: 44.6753,
    longitude: -111.5112,
    catches: [
      { species: "Rainbow Trout", length_inches: 13, fly_name: "Pheasant Tail", fly_size: "#16", time_caught: "2026-01-18T11:15:00Z" },
      { species: "Brown Trout", length_inches: 15, fly_name: "Pheasant Tail", fly_size: "#16", time_caught: "2026-01-18T11:50:00Z" },
      { species: "Rainbow Trout", length_inches: 12, fly_name: "Pheasant Tail", fly_size: "#16", time_caught: "2026-01-18T12:30:00Z", catch_note: "Aggressive eat on the swing" },
    ],
  },
  {
    title: "$3 to Lyons — Rubber Legs and Coffee",
    river_id: "river-madison",
    river_name: "Madison River",
    section: "$3 Bridge to Lyons Bridge",
    location: "Madison River, MT",
    date: "2026-01-29",
    weather: "Clear skies, 28°F, calm wind",
    water_temp_f: 35,
    water_clarity: "Slightly Off",
    notes: "Water had a slight green tint after some snowmelt. Went heavy with Pat's Rubber Legs as the anchor and a Copper John dropper. The bigger nymphs got attention in the off-color water. Fish were holding in slower water than usual — check the inside seams on days like this.",
    tags: ["stonefly nymphs", "winter", "off-color water"],
    latitude: 44.6543,
    longitude: -111.5289,
    catches: [
      { species: "Brown Trout", length_inches: 17, fly_name: "Pat's Rubber Legs", fly_size: "#8", time_caught: "2026-01-29T09:30:00Z", catch_note: "Smashed it in 2 feet of water" },
      { species: "Rainbow Trout", length_inches: 10, fly_name: "Copper John", fly_size: "#16", time_caught: "2026-01-29T10:15:00Z" },
      { species: "Mountain Whitefish", length_inches: 14, fly_name: "Copper John", fly_size: "#16", time_caught: "2026-01-29T10:50:00Z" },
      { species: "Brown Trout", length_inches: 13, fly_name: "Pat's Rubber Legs", fly_size: "#8", time_caught: "2026-01-29T11:30:00Z" },
      { species: "Rainbow Trout", length_inches: 15, fly_name: "Copper John", fly_size: "#14", time_caught: "2026-01-29T12:20:00Z" },
    ],
  },
  {
    title: "Varney Bridge — Streamer Day",
    river_id: "river-madison",
    river_name: "Madison River",
    section: "Varney Bridge to Ennis",
    location: "Madison River, MT",
    date: "2026-02-08",
    weather: "Overcast, 32°F, wind 15mph NW",
    water_temp_f: 38,
    water_clarity: "Slightly Off",
    notes: "Decided to go full streamer today. Woolly Bugger on a sink-tip line, stripped along the bank. Two solid browns came out of undercut banks within the first hour. The wind was brutal but pushed baitfish tight to the east bank. Sometimes you just need to think like a predator.",
    tags: ["streamers", "big fish", "winter", "windy"],
    latitude: 45.3210,
    longitude: -111.7112,
    catches: [
      { species: "Brown Trout", length_inches: 19, fly_name: "Woolly Bugger", fly_size: "#6", time_caught: "2026-02-08T10:00:00Z", catch_note: "Crushed the bugger on the strip — violent eat" },
      { species: "Brown Trout", length_inches: 16, fly_name: "Woolly Bugger", fly_size: "#6", time_caught: "2026-02-08T10:45:00Z" },
      { species: "Brown Trout", length_inches: 21, fly_name: "Sculpin Streamer", fly_size: "#4", time_caught: "2026-02-08T13:15:00Z", catch_note: "Fish of the month. Came from under a log jam. Held it for a good 30 seconds before the photo." },
    ],
  },
  {
    title: "Bear Trap Canyon — Brave or Stupid",
    river_id: "river-madison",
    river_name: "Madison River",
    section: "Bear Trap Canyon",
    location: "Madison River, MT",
    date: "2026-02-15",
    weather: "Partly cloudy, 30°F, wind 8mph W",
    water_temp_f: 37,
    water_clarity: "Clear",
    notes: "Hiked into Bear Trap with full winter gear. The canyon is empty this time of year and the fish have zero pressure. Found a deep pool with a foam line and worked it with a Frenchie tight-line rig. Every drift felt like it could produce. Two solid rainbows and a thick brown rewarded the effort.",
    tags: ["backcountry", "euro nymphing", "winter", "canyon"],
    latitude: 45.5512,
    longitude: -111.5823,
    catches: [
      { species: "Rainbow Trout", length_inches: 16, fly_name: "Frenchie", fly_size: "#14", time_caught: "2026-02-15T10:30:00Z" },
      { species: "Brown Trout", length_inches: 18, fly_name: "Frenchie", fly_size: "#14", time_caught: "2026-02-15T11:45:00Z", catch_note: "Dark coloring from the canyon — gorgeous fish" },
      { species: "Rainbow Trout", length_inches: 14, fly_name: "Juju Baetis", fly_size: "#20", time_caught: "2026-02-15T12:30:00Z" },
    ],
  },
  {
    title: "Hebgen Repeat — Cracked the Code",
    river_id: "river-madison",
    river_name: "Madison River",
    section: "Below Hebgen Dam",
    location: "Madison River, MT",
    date: "2026-02-22",
    weather: "Overcast, 26°F, light snow, wind 5mph NE",
    water_temp_f: 35,
    water_clarity: "Clear",
    notes: "Went back to the Hebgen stretch with a plan. Rigged a micro nymph setup: 6x fluorocarbon, #22 Zebra Midge trailing a #20 RS2. The key was depth — I was running my sighter at 10 o'clock to keep the flies right on the bottom. Eight fish in four hours. Best winter day yet.",
    tags: ["midges", "euro nymphing", "winter", "micro nymphs"],
    latitude: 44.8653,
    longitude: -111.3461,
    catches: [
      { species: "Rainbow Trout", length_inches: 12, fly_name: "RS2", fly_size: "#20", time_caught: "2026-02-22T09:00:00Z" },
      { species: "Brown Trout", length_inches: 14, fly_name: "Zebra Midge", fly_size: "#22", time_caught: "2026-02-22T09:30:00Z" },
      { species: "Rainbow Trout", length_inches: 13, fly_name: "RS2", fly_size: "#20", time_caught: "2026-02-22T10:00:00Z" },
      { species: "Brown Trout", length_inches: 15, fly_name: "Zebra Midge", fly_size: "#22", time_caught: "2026-02-22T10:45:00Z" },
      { species: "Rainbow Trout", length_inches: 11, fly_name: "RS2", fly_size: "#20", time_caught: "2026-02-22T11:15:00Z" },
      { species: "Mountain Whitefish", length_inches: 14, fly_name: "Zebra Midge", fly_size: "#22", time_caught: "2026-02-22T11:50:00Z" },
      { species: "Brown Trout", length_inches: 17, fly_name: "Zebra Midge", fly_size: "#22", time_caught: "2026-02-22T12:30:00Z", catch_note: "Biggest of the day — fought hard for a winter fish" },
      { species: "Rainbow Trout", length_inches: 10, fly_name: "RS2", fly_size: "#20", time_caught: "2026-02-22T13:00:00Z" },
    ],
  },
  {
    title: "Madison — First BWO Hatch of Spring",
    river_id: "river-madison",
    river_name: "Madison River",
    section: "Three Dollar Bridge",
    location: "Madison River, MT",
    date: "2026-03-08",
    weather: "Overcast, 38°F, drizzle, wind 5mph S",
    water_temp_f: 41,
    water_clarity: "Clear",
    notes: "The BWOs finally showed up. Around 1 PM the cloud cover brought a blanket hatch — tiny olives everywhere. Switched from nymphs to a #20 BWO Sparkle Dun and immediately had fish looking up. The key was a long drag-free drift in the back eddies. Magic afternoon.",
    tags: ["BWO", "dry fly", "hatch", "spring"],
    latitude: 44.6749,
    longitude: -111.5108,
    catches: [
      { species: "Rainbow Trout", length_inches: 14, fly_name: "BWO Sparkle Dun", fly_size: "#20", time_caught: "2026-03-08T13:15:00Z", catch_note: "First dry fly fish of the year!" },
      { species: "Brown Trout", length_inches: 13, fly_name: "BWO Sparkle Dun", fly_size: "#20", time_caught: "2026-03-08T13:45:00Z" },
      { species: "Rainbow Trout", length_inches: 16, fly_name: "BWO Sparkle Dun", fly_size: "#20", time_caught: "2026-03-08T14:20:00Z" },
      { species: "Rainbow Trout", length_inches: 11, fly_name: "Juju Baetis", fly_size: "#20", time_caught: "2026-03-08T14:50:00Z" },
      { species: "Brown Trout", length_inches: 15, fly_name: "BWO Sparkle Dun", fly_size: "#18", time_caught: "2026-03-08T15:30:00Z" },
    ],
  },
  {
    title: "Lyons Bridge — Skwala Scouting",
    river_id: "river-madison",
    river_name: "Madison River",
    section: "$3 Bridge to Lyons Bridge",
    location: "Madison River, MT",
    date: "2026-03-15",
    weather: "Sunny, 42°F, wind 10mph W",
    water_temp_f: 44,
    water_clarity: "Clear",
    notes: "Came to scout for early skwalas. Didn't find a full hatch but saw a few naturals on the water. Ran a Pat's Rubber Legs tight to the bank and got a few aggressive takes from fish that were clearly anticipating the stonefly season. Spring is coming.",
    tags: ["skwala", "stoneflies", "spring", "scouting"],
    latitude: 44.6540,
    longitude: -111.5285,
    catches: [
      { species: "Brown Trout", length_inches: 15, fly_name: "Pat's Rubber Legs", fly_size: "#8", time_caught: "2026-03-15T11:00:00Z" },
      { species: "Rainbow Trout", length_inches: 13, fly_name: "Pat's Rubber Legs", fly_size: "#8", time_caught: "2026-03-15T12:15:00Z", catch_note: "Hammered it on the drift" },
    ],
  },
  {
    title: "Varney — High Water Tactics",
    river_id: "river-madison",
    river_name: "Madison River",
    section: "Varney Bridge to Ennis",
    location: "Madison River, MT",
    date: "2026-03-22",
    weather: "Overcast, 40°F, wind 12mph NW",
    water_temp_f: 42,
    water_clarity: "Slightly Off",
    notes: "Spring melt is pushing flows up. Water is bigger and slightly off-color. Went deep with San Juan Worm trailing a heavy Pat's Rubber Legs. Fish were pushed to the soft edges. Had to really slow down and let the flies get deep into the bucket. Patience paid off with two quality browns.",
    tags: ["high water", "spring", "worm", "deep nymphing"],
    latitude: 45.3215,
    longitude: -111.7118,
    catches: [
      { species: "Brown Trout", length_inches: 18, fly_name: "San Juan Worm", fly_size: "#12", time_caught: "2026-03-22T10:30:00Z", catch_note: "Worm strikes again — can't argue with results" },
      { species: "Brown Trout", length_inches: 14, fly_name: "Pat's Rubber Legs", fly_size: "#8", time_caught: "2026-03-22T11:45:00Z" },
      { species: "Mountain Whitefish", length_inches: 15, fly_name: "San Juan Worm", fly_size: "#12", time_caught: "2026-03-22T12:30:00Z" },
    ],
  },
  {
    title: "Spring on the Madison — Purple Haze Magic",
    river_id: "river-madison",
    river_name: "Madison River",
    section: "Below Hebgen Dam",
    location: "Madison River, MT",
    date: "2026-03-29",
    weather: "Partly cloudy, 46°F, wind 8mph SW",
    water_temp_f: 46,
    water_clarity: "Clear",
    notes: "Perfect spring afternoon. Midges and a few BWOs on the water. Put on a Purple Haze as a general attractor and it worked beautifully — the fish weren't being selective, just eating anything that looked alive in the film. Six fish on dries in two hours. This is what we wait all winter for.",
    tags: ["dry fly", "spring", "attractor", "purple haze"],
    latitude: 44.8650,
    longitude: -111.3458,
    catches: [
      { species: "Rainbow Trout", length_inches: 13, fly_name: "Purple Haze", fly_size: "#16", time_caught: "2026-03-29T13:00:00Z" },
      { species: "Brown Trout", length_inches: 14, fly_name: "Purple Haze", fly_size: "#16", time_caught: "2026-03-29T13:25:00Z" },
      { species: "Rainbow Trout", length_inches: 16, fly_name: "Purple Haze", fly_size: "#16", time_caught: "2026-03-29T13:55:00Z", catch_note: "Ate with a splashy rise — fired up" },
      { species: "Brown Trout", length_inches: 12, fly_name: "Adams", fly_size: "#16", time_caught: "2026-03-29T14:20:00Z" },
      { species: "Rainbow Trout", length_inches: 15, fly_name: "Purple Haze", fly_size: "#16", time_caught: "2026-03-29T14:50:00Z" },
      { species: "Rainbow Trout", length_inches: 11, fly_name: "Purple Haze", fly_size: "#16", time_caught: "2026-03-29T15:15:00Z" },
    ],
  },

  // ── PROVO RIVER (10 sessions) ───────────────────────────
  {
    title: "Jordanelle Tailwater — January Deep Freeze",
    river_id: "provo-river",
    river_name: "Provo River",
    section: "Below Jordanelle Dam",
    location: "Provo River, UT",
    date: "2026-01-11",
    weather: "Clear, 15°F, calm",
    water_temp_f: 38,
    water_clarity: "Crystal Clear",
    notes: "Gin-clear tailwater in January. Fish are spooky and sitting deep. Ran a tight-line rig with 7x fluoro and a #22 Zebra Midge. Took 45 minutes to get the first eat but once I dialed the depth, it was game on. The browns in this section are incredibly well-fed — thick shoulders on every fish.",
    tags: ["tailwater", "euro nymphing", "winter", "sight fishing"],
    latitude: 40.6012,
    longitude: -111.5089,
    catches: [
      { species: "Brown Trout", length_inches: 16, fly_name: "Zebra Midge", fly_size: "#22", time_caught: "2026-01-11T10:45:00Z", catch_note: "Beautiful spotted brown — dark olive back" },
      { species: "Brown Trout", length_inches: 14, fly_name: "Zebra Midge", fly_size: "#22", time_caught: "2026-01-11T11:30:00Z" },
      { species: "Brown Trout", length_inches: 18, fly_name: "Pheasant Tail", fly_size: "#18", time_caught: "2026-01-11T12:15:00Z", catch_note: "Switched to PT and got an immediate eat" },
    ],
  },
  {
    title: "Deer Creek Stretch — Midday Midge Push",
    river_id: "provo-river",
    river_name: "Provo River",
    section: "Deer Creek to Bridal Veil",
    location: "Provo River, UT",
    date: "2026-01-22",
    weather: "Overcast, 28°F, wind 5mph N",
    water_temp_f: 40,
    water_clarity: "Clear",
    notes: "The midge hatch kicked off around 11 AM. Tiny black midges clustering on the surface. Set up below a riffle with a Griffith's Gnat over a trailing Zebra Midge. The Cutthroats were aggressive today — one took the dry fly so hard it nearly pulled the rod out of my hand.",
    tags: ["midges", "cutthroat", "winter", "dry-dropper"],
    latitude: 40.3345,
    longitude: -111.6123,
    catches: [
      { species: "Cutthroat Trout", length_inches: 13, fly_name: "Griffith's Gnat", fly_size: "#18", time_caught: "2026-01-22T11:15:00Z" },
      { species: "Brown Trout", length_inches: 11, fly_name: "Zebra Midge", fly_size: "#22", time_caught: "2026-01-22T11:45:00Z" },
      { species: "Cutthroat Trout", length_inches: 15, fly_name: "Griffith's Gnat", fly_size: "#18", time_caught: "2026-01-22T12:20:00Z", catch_note: "Gorgeous slash marks — classic Bonneville cutt" },
      { species: "Brown Trout", length_inches: 12, fly_name: "Zebra Midge", fly_size: "#22", time_caught: "2026-01-22T12:55:00Z" },
    ],
  },
  {
    title: "Middle Provo — River Road Sight Fishing",
    river_id: "provo-river",
    river_name: "Provo River",
    section: "Middle Provo (River Road)",
    location: "Provo River, UT",
    date: "2026-02-01",
    weather: "Sunny, 34°F, wind 8mph W",
    water_temp_f: 39,
    water_clarity: "Crystal Clear",
    notes: "The braided channels on River Road are perfect for sight fishing. Spotted three browns holding in a secondary channel. Crept up with a long leader and dropped a Frenchie two feet upstream. Had to adjust the weight three times before finding the sweet spot. Two of the three ate — the third spooked when my shadow hit the water.",
    tags: ["sight fishing", "euro nymphing", "winter", "meadow section"],
    latitude: 40.5123,
    longitude: -111.4567,
    catches: [
      { species: "Brown Trout", length_inches: 17, fly_name: "Frenchie", fly_size: "#14", time_caught: "2026-02-01T11:00:00Z", catch_note: "Sight-fished this one for 10 minutes before the eat" },
      { species: "Brown Trout", length_inches: 14, fly_name: "Frenchie", fly_size: "#14", time_caught: "2026-02-01T11:45:00Z" },
    ],
  },
  {
    title: "Upper Provo — Snow Day Exploration",
    river_id: "provo-river",
    river_name: "Provo River",
    section: "Upper Provo",
    location: "Provo River, UT",
    date: "2026-02-09",
    weather: "Heavy snow, 22°F, wind 3mph NE",
    water_temp_f: 36,
    water_clarity: "Clear",
    notes: "Drove up the Mirror Lake Highway as far as the road was plowed. Hiked in a quarter mile through snow to a pool I remembered from fall. Small fish but eager — they don't see many flies this time of year. The Copper John was the ticket in the deeper pocket water.",
    tags: ["backcountry", "winter", "exploration", "small stream"],
    latitude: 40.6478,
    longitude: -111.2345,
    catches: [
      { species: "Cutthroat Trout", length_inches: 10, fly_name: "Copper John", fly_size: "#16", time_caught: "2026-02-09T10:30:00Z" },
      { species: "Cutthroat Trout", length_inches: 8, fly_name: "Copper John", fly_size: "#16", time_caught: "2026-02-09T11:00:00Z" },
      { species: "Cutthroat Trout", length_inches: 11, fly_name: "Pheasant Tail", fly_size: "#16", time_caught: "2026-02-09T11:30:00Z", catch_note: "Pretty little native cutt" },
    ],
  },
  {
    title: "Jordanelle — Dialing in the Euro Rig",
    river_id: "provo-river",
    river_name: "Provo River",
    section: "Below Jordanelle Dam",
    location: "Provo River, UT",
    date: "2026-02-19",
    weather: "Overcast, 30°F, wind 10mph W",
    water_temp_f: 39,
    water_clarity: "Clear",
    notes: "Spent the day really working on my tight-line technique. Focused on rod angle and line management instead of chasing numbers. Found that a 45-degree downstream cast with a slow lift at the end of the drift got the most takes. The Juju Baetis was the hot fly today — the browns couldn't resist it.",
    tags: ["euro nymphing", "technique", "winter", "practice"],
    latitude: 40.6008,
    longitude: -111.5085,
    catches: [
      { species: "Brown Trout", length_inches: 15, fly_name: "Juju Baetis", fly_size: "#20", time_caught: "2026-02-19T10:00:00Z" },
      { species: "Brown Trout", length_inches: 13, fly_name: "Juju Baetis", fly_size: "#20", time_caught: "2026-02-19T11:00:00Z" },
      { species: "Brown Trout", length_inches: 16, fly_name: "Juju Baetis", fly_size: "#20", time_caught: "2026-02-19T12:00:00Z", catch_note: "Textbook euro drift — felt the tick right at the transition" },
      { species: "Mountain Whitefish", length_inches: 12, fly_name: "Zebra Midge", fly_size: "#20", time_caught: "2026-02-19T12:45:00Z" },
      { species: "Brown Trout", length_inches: 14, fly_name: "Juju Baetis", fly_size: "#20", time_caught: "2026-02-19T13:30:00Z" },
    ],
  },
  {
    title: "Deer Creek — Warm Afternoon Surprise",
    river_id: "provo-river",
    river_name: "Provo River",
    section: "Deer Creek to Bridal Veil",
    location: "Provo River, UT",
    date: "2026-02-28",
    weather: "Sunny, 40°F, calm",
    water_temp_f: 43,
    water_clarity: "Clear",
    notes: "Unseasonably warm day brought some fish up. Saw a few sporadic rises and decided to go dry. An Adams in #16 was enough to fool three fish in the tail of a long pool. The best was a chunky brown that sipped the fly so gently I almost missed the take. These Provo fish are educated.",
    tags: ["dry fly", "winter", "warm spell", "educated fish"],
    latitude: 40.3350,
    longitude: -111.6128,
    catches: [
      { species: "Brown Trout", length_inches: 15, fly_name: "Adams", fly_size: "#16", time_caught: "2026-02-28T13:30:00Z", catch_note: "Subtle sip — barely a dimple" },
      { species: "Cutthroat Trout", length_inches: 12, fly_name: "Adams", fly_size: "#16", time_caught: "2026-02-28T14:00:00Z" },
      { species: "Brown Trout", length_inches: 13, fly_name: "Adams", fly_size: "#16", time_caught: "2026-02-28T14:30:00Z" },
    ],
  },
  {
    title: "Middle Provo — March Mud and Redemption",
    river_id: "provo-river",
    river_name: "Provo River",
    section: "Middle Provo (River Road)",
    location: "Provo River, UT",
    date: "2026-03-07",
    weather: "Overcast, 36°F, rain, wind 12mph SW",
    water_temp_f: 41,
    water_clarity: "Slightly Off",
    notes: "Rain pushed some mud into the river from construction upstream. Visibility dropped to about 3 feet. Went big and bright — San Juan Worm and a gaudy Copper John. The fish were still there, just holding tighter to structure. Found a log jam that produced four fish in 30 minutes.",
    tags: ["rain", "muddy water", "spring", "structure fishing"],
    latitude: 40.5128,
    longitude: -111.4572,
    catches: [
      { species: "Brown Trout", length_inches: 14, fly_name: "San Juan Worm", fly_size: "#12", time_caught: "2026-03-07T10:00:00Z" },
      { species: "Brown Trout", length_inches: 16, fly_name: "San Juan Worm", fly_size: "#12", time_caught: "2026-03-07T10:15:00Z" },
      { species: "Cutthroat Trout", length_inches: 13, fly_name: "Copper John", fly_size: "#14", time_caught: "2026-03-07T10:30:00Z" },
      { species: "Brown Trout", length_inches: 12, fly_name: "San Juan Worm", fly_size: "#12", time_caught: "2026-03-07T10:45:00Z" },
    ],
  },
  {
    title: "Legacy Bridge — BWOs and Caddis Scouts",
    river_id: "provo-river",
    river_name: "Provo River",
    section: "Middle Provo (Legacy Bridge)",
    location: "Provo River, UT",
    date: "2026-03-14",
    weather: "Overcast, 44°F, wind 5mph S",
    water_temp_f: 45,
    water_clarity: "Clear",
    notes: "Spring is definitely here on the Provo. Strong BWO hatch from 1-3 PM. Also saw a few early caddis bouncing off the water — first ones of the year. Went with the BWO Sparkle Dun and had steady action in the riffles. One brown absolutely porpoised on the fly. Spring fishing is the best fishing.",
    tags: ["BWO", "caddis", "dry fly", "spring", "hatch"],
    latitude: 40.4987,
    longitude: -111.4321,
    catches: [
      { species: "Brown Trout", length_inches: 15, fly_name: "BWO Sparkle Dun", fly_size: "#18", time_caught: "2026-03-14T13:15:00Z" },
      { species: "Cutthroat Trout", length_inches: 14, fly_name: "BWO Sparkle Dun", fly_size: "#18", time_caught: "2026-03-14T13:45:00Z" },
      { species: "Brown Trout", length_inches: 17, fly_name: "BWO Sparkle Dun", fly_size: "#18", time_caught: "2026-03-14T14:15:00Z", catch_note: "Porpoised on the fly — full body out of the water" },
      { species: "Rainbow Trout", length_inches: 12, fly_name: "Elk Hair Caddis", fly_size: "#14", time_caught: "2026-03-14T14:50:00Z" },
      { species: "Cutthroat Trout", length_inches: 13, fly_name: "BWO Sparkle Dun", fly_size: "#18", time_caught: "2026-03-14T15:20:00Z" },
      { species: "Brown Trout", length_inches: 14, fly_name: "BWO Sparkle Dun", fly_size: "#18", time_caught: "2026-03-14T15:45:00Z" },
    ],
  },
  {
    title: "Jordanelle — Personal Best Brown",
    river_id: "provo-river",
    river_name: "Provo River",
    section: "Below Jordanelle Dam",
    location: "Provo River, UT",
    date: "2026-03-21",
    weather: "Partly cloudy, 48°F, wind 6mph W",
    water_temp_f: 46,
    water_clarity: "Clear",
    notes: "The water is warming and the fish are getting active. Spotted a large shape holding behind a midstream boulder and spent 20 minutes working it. Finally got a clean drift with the Frenchie at the right depth and angle. The rod doubled over — 22-inch brown, by far my best on the Provo. Hands were shaking during the release.",
    tags: ["personal best", "sight fishing", "euro nymphing", "spring", "big fish"],
    latitude: 40.6015,
    longitude: -111.5092,
    catches: [
      { species: "Brown Trout", length_inches: 22, fly_name: "Frenchie", fly_size: "#14", time_caught: "2026-03-21T11:30:00Z", catch_note: "PERSONAL BEST — 22 inch brown. 20 minutes of casting to get the eat. Shaking." },
      { species: "Brown Trout", length_inches: 15, fly_name: "Pheasant Tail", fly_size: "#16", time_caught: "2026-03-21T12:15:00Z" },
      { species: "Rainbow Trout", length_inches: 13, fly_name: "Frenchie", fly_size: "#14", time_caught: "2026-03-21T13:00:00Z" },
      { species: "Brown Trout", length_inches: 16, fly_name: "Pheasant Tail", fly_size: "#16", time_caught: "2026-03-21T13:45:00Z" },
    ],
  },
  {
    title: "Provo Meadow — End of Q1 Victory Lap",
    river_id: "provo-river",
    river_name: "Provo River",
    section: "Middle Provo (River Road)",
    location: "Provo River, UT",
    date: "2026-03-30",
    weather: "Sunny, 52°F, wind 3mph SE",
    water_temp_f: 50,
    water_clarity: "Clear",
    notes: "Last session of March. Warm, sunny, fish rising everywhere in the meadow section. Started with an Elk Hair Caddis and caught two quick fish. Switched to a Purple Haze and kept it rolling. Seven fish on dries in a single afternoon. The confidence is high going into April. This is what 20 sessions of practice looks like.",
    tags: ["dry fly", "spring", "caddis", "confidence", "season review"],
    latitude: 40.5130,
    longitude: -111.4575,
    catches: [
      { species: "Brown Trout", length_inches: 14, fly_name: "Elk Hair Caddis", fly_size: "#14", time_caught: "2026-03-30T12:30:00Z" },
      { species: "Cutthroat Trout", length_inches: 13, fly_name: "Elk Hair Caddis", fly_size: "#14", time_caught: "2026-03-30T12:55:00Z" },
      { species: "Brown Trout", length_inches: 16, fly_name: "Purple Haze", fly_size: "#16", time_caught: "2026-03-30T13:20:00Z" },
      { species: "Rainbow Trout", length_inches: 12, fly_name: "Purple Haze", fly_size: "#16", time_caught: "2026-03-30T13:45:00Z" },
      { species: "Brown Trout", length_inches: 15, fly_name: "Purple Haze", fly_size: "#16", time_caught: "2026-03-30T14:10:00Z", catch_note: "Rising steadily in a foam line" },
      { species: "Cutthroat Trout", length_inches: 14, fly_name: "Purple Haze", fly_size: "#16", time_caught: "2026-03-30T14:35:00Z" },
      { species: "Brown Trout", length_inches: 13, fly_name: "Adams", fly_size: "#16", time_caught: "2026-03-30T15:00:00Z" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("=== Seed Demo Account ===\n");

  // 1. Check if user exists
  console.log("1. Checking for existing user...");
  let userId: string;

  try {
    const listRes = await fetch(
      `${SUPABASE_URL}/auth/v1/admin/users?page=1&per_page=50`,
      {
        headers: {
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        },
      }
    );
    const listData = (await listRes.json()) as { users: Array<{ id: string; email: string }> };
    const existing = listData.users?.find((u) => u.email === DEMO_EMAIL);

    if (existing) {
      userId = existing.id;
      console.log(`   User already exists: ${userId}`);

      // Clean up existing data for idempotency
      console.log("   Cleaning existing data...");
      // Delete catches first (FK to sessions)
      await fetch(`${SUPABASE_URL}/rest/v1/catches?user_id=eq.${userId}`, {
        method: "DELETE",
        headers: {
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
          Prefer: "return=minimal",
        },
      });
      // Delete session_rigs (FK to sessions)
      await fetch(
        `${SUPABASE_URL}/rest/v1/session_rigs?session_id=in.(select id from fishing_sessions where user_id = '${userId}')`,
        {
          method: "DELETE",
          headers: {
            apikey: SERVICE_ROLE_KEY,
            Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
            Prefer: "return=minimal",
          },
        }
      );
      // Delete sessions
      await fetch(`${SUPABASE_URL}/rest/v1/fishing_sessions?user_id=eq.${userId}`, {
        method: "DELETE",
        headers: {
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
          Prefer: "return=minimal",
        },
      });
      // Delete fly patterns
      await fetch(`${SUPABASE_URL}/rest/v1/fly_patterns?user_id=eq.${userId}`, {
        method: "DELETE",
        headers: {
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
          Prefer: "return=minimal",
        },
      });
      console.log("   Existing data cleaned.");
    } else {
      // Create user
      console.log("   Creating user...");
      const createRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
        method: "POST",
        headers: {
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: DEMO_EMAIL,
          password: DEMO_PASSWORD,
          email_confirm: true,
          user_metadata: { display_name: "Alex Morgan" },
        }),
      });
      const createData = (await createRes.json()) as { id: string; error?: string };
      if (!createRes.ok) {
        throw new Error(`Failed to create user: ${JSON.stringify(createData)}`);
      }
      userId = createData.id;
      console.log(`   User created: ${userId}`);
    }
  } catch (err) {
    console.error("Auth error:", err);
    process.exit(1);
  }

  // 2. Upsert profile
  console.log("\n2. Upserting profile...");
  await upsertRow("profiles", {
    user_id: userId,
    display_name: "Alex Morgan",
    username: "alexmorgan_ea",
    bio: "Chasing trout in the Mountain West. Euro nymph addict. Data nerd.",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    is_premium: true,
    is_private: false,
    home_location: "Salt Lake City, UT",
    home_state: "Utah",
    experience_level: "advanced",
    feed_display: "collage",
    total_sessions: 20,
    total_fish: 85,
  }, "user_id");
  console.log("   Profile upserted.");

  // 3. Create fly patterns
  console.log("\n3. Creating fly patterns...");
  const flyPatternIds: Record<string, string> = {};

  for (const fp of FLY_PATTERNS) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/fly_patterns`, {
      method: "POST",
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        user_id: userId,
        name: fp.name,
        type: fp.type,
        notes: fp.notes,
      }),
    });
    const data = (await res.json()) as Array<{ id: string }>;
    if (!res.ok) {
      console.error(`   Failed to create fly pattern ${fp.name}:`, data);
      continue;
    }
    flyPatternIds[fp.name] = data[0].id;
    console.log(`   Created: ${fp.name} → ${data[0].id}`);
  }

  // 4. Create sessions and catches
  console.log("\n4. Creating sessions and catches...");
  let totalCatches = 0;

  for (const session of SESSIONS) {
    // Insert session
    const sessionRes = await fetch(`${SUPABASE_URL}/rest/v1/fishing_sessions`, {
      method: "POST",
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        user_id: userId,
        river_id: session.river_id,
        river_name: session.river_name,
        title: session.title,
        section: session.section,
        location: session.location,
        date: session.date,
        weather: session.weather,
        water_temp_f: session.water_temp_f,
        water_clarity: session.water_clarity,
        total_fish: session.catches.length,
        notes: session.notes,
        tags: session.tags,
        trip_tags: session.tags,
        latitude: session.latitude,
        longitude: session.longitude,
        privacy: "public",
      }),
    });

    const sessionData = (await sessionRes.json()) as Array<{ id: string }>;
    if (!sessionRes.ok) {
      console.error(`   Failed to create session "${session.title}":`, sessionData);
      continue;
    }
    const sessionId = sessionData[0].id;
    console.log(`   Session: ${session.title} → ${sessionId} (${session.catches.length} catches)`);

    // Insert catches
    for (const c of session.catches) {
      const flyPatternId = flyPatternIds[c.fly_name] || null;
      const catchRes = await fetch(`${SUPABASE_URL}/rest/v1/catches`, {
        method: "POST",
        headers: {
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          session_id: sessionId,
          user_id: userId,
          species: c.species,
          length_inches: c.length_inches,
          fly_pattern_id: flyPatternId,
          fly_name: c.fly_name,
          fly_size: c.fly_size,
          time_caught: c.time_caught,
          catch_note: c.catch_note || null,
        }),
      });
      if (!catchRes.ok) {
        const errText = await catchRes.text();
        console.error(`     Failed catch: ${c.species} ${c.length_inches}" on ${c.fly_name}: ${errText}`);
      } else {
        totalCatches++;
      }
    }
  }

  // 5. Summary
  console.log("\n=== DONE ===");
  console.log(`User ID:      ${userId}`);
  console.log(`Email:        ${DEMO_EMAIL}`);
  console.log(`Password:     ${DEMO_PASSWORD}`);
  console.log(`Fly patterns: ${Object.keys(flyPatternIds).length}`);
  console.log(`Sessions:     ${SESSIONS.length}`);
  console.log(`Catches:      ${totalCatches}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
