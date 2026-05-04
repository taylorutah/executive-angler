/**
 * Demo session data for new user onboarding.
 *
 * Three curated sessions across three rivers, three techniques, three months —
 * intended to show a new angler what a populated journal looks like without
 * overwhelming them. Seeded at signup via /api/onboarding/seed-demo.
 *
 * All seeded rows get is_demo=true and privacy='private', which means:
 *   - The user sees them in /dashboard, /journal, and trophy wall.
 *   - Public feeds (privacy='public' filters) never surface them.
 *   - River stats, leaderboards, and awards filter is_demo=false and skip them.
 *
 * Dates are offsets from "today" so the journal always looks freshly active.
 */

export interface DemoCatch {
  species: string;
  length_inches: number;
  fly_name: string;
  fly_size: string;
  fly_position?: number;
  time_caught_hour: number; // 0-23, converted to ISO at seed time
  time_caught_minute: number;
  catch_note?: string;
  catch_tags?: string[];
}

export interface DemoSession {
  days_ago: number;
  river_id: string;
  river_name: string;
  title: string;
  location: string;
  section: string;
  weather: string;
  water_temp_f: number;
  water_clarity: string;
  notes: string;
  flies_notes: string;
  tags: string[];
  trip_tags: string[];
  latitude: number;
  longitude: number;
  catches: DemoCatch[];
}

export const DEMO_SESSIONS: DemoSession[] = [
  // ───────────────────────────────────────────────
  // Oldest — Provo River, UT — winter midge session
  // Quiet confidence: low count, technical, cold water
  // ───────────────────────────────────────────────
  {
    days_ago: 24,
    river_id: "provo-river",
    river_name: "Provo River",
    title: "Midge cluster bite, Middle Provo",
    location: "Heber Valley, UT",
    section: "Middle",
    weather: "Overcast, 34°F air",
    water_temp_f: 40,
    water_clarity: "Clear",
    notes:
      "Slow start at 9am — fish stacked in the deeper seams, nothing moving. Broke through around 11:30 when a midge cluster came off in the soft water below Rickety Bridge. Dropped from a single #20 zebra to a two-fly rig (#22 black midge trailing a #20 red zebra, 6X fluoro, 18 inches between) and the bite turned on. Eight to the net, all browns, all in the 12–16\" range. Tight nymphing under a Thingamabobber at 6ft depth. Fish are holding deep and slow — don't speed the drift.",
    flies_notes: "#20 Zebra Midge (red), #22 Black Beauty, 6X tippet.",
    tags: ["midges", "nymphing", "winter", "tailwater"],
    trip_tags: ["solo", "half-day"],
    latitude: 40.545,
    longitude: -111.41,
    catches: [
      {
        species: "Brown Trout",
        length_inches: 14,
        fly_name: "Zebra Midge",
        fly_size: "#20",
        fly_position: 1,
        time_caught_hour: 11,
        time_caught_minute: 42,
        catch_note: "First fish of the day. Deep seam below the bridge.",
      },
      {
        species: "Brown Trout",
        length_inches: 12,
        fly_name: "Black Beauty",
        fly_size: "#22",
        fly_position: 2,
        time_caught_hour: 11,
        time_caught_minute: 58,
      },
      {
        species: "Brown Trout",
        length_inches: 16,
        fly_name: "Zebra Midge",
        fly_size: "#20",
        fly_position: 1,
        time_caught_hour: 12,
        time_caught_minute: 15,
        catch_note: "Thick-shouldered winter brown. Slow fight but strong.",
      },
      {
        species: "Brown Trout",
        length_inches: 13,
        fly_name: "Black Beauty",
        fly_size: "#22",
        fly_position: 2,
        time_caught_hour: 12,
        time_caught_minute: 31,
      },
      {
        species: "Brown Trout",
        length_inches: 15,
        fly_name: "Zebra Midge",
        fly_size: "#20",
        fly_position: 1,
        time_caught_hour: 12,
        time_caught_minute: 47,
      },
      {
        species: "Rainbow Trout",
        length_inches: 13,
        fly_name: "Black Beauty",
        fly_size: "#22",
        fly_position: 2,
        time_caught_hour: 13,
        time_caught_minute: 10,
        catch_note: "Only rainbow of the day.",
      },
      {
        species: "Brown Trout",
        length_inches: 14,
        fly_name: "Zebra Midge",
        fly_size: "#20",
        fly_position: 1,
        time_caught_hour: 13,
        time_caught_minute: 28,
      },
      {
        species: "Brown Trout",
        length_inches: 12,
        fly_name: "Zebra Midge",
        fly_size: "#20",
        fly_position: 1,
        time_caught_hour: 13,
        time_caught_minute: 52,
        catch_note: "Bite faded after this. Packed up at 2:30.",
      },
    ],
  },

  // ───────────────────────────────────────────────
  // Middle — Henry's Fork, ID — dry-dropper numbers day
  // The fun-filled session: high count, varied species, good flow
  // ───────────────────────────────────────────────
  {
    days_ago: 11,
    river_id: "river-henry-s-fork",
    river_name: "Henry's Fork",
    title: "Dry-dropper numbers game at Box Canyon",
    location: "Island Park, ID",
    section: "Box Canyon",
    weather: "Partly cloudy, 62°F air, light WSW wind",
    water_temp_f: 54,
    water_clarity: "Slightly off-color",
    notes:
      "Back at Box Canyon with the dry-dropper setup I've been tuning all season. #16 Parachute Adams on top, #18 RS2 trailing 18 inches on 5X fluoro. Fish were eating the dropper 80% of the time but the indicator fly wasn't just an indicator — took five on the Adams during the afternoon flurry. Best stretch was the big riffle above the Lower Campground; rainbows stacked on the inside seam, no two in the same lie. Fourteen to the net in three hours. Flow at Last Chance gauge reading 1,240 cfs, right in the wheelhouse.",
    flies_notes:
      "#16 Parachute Adams (indicator + fish-catcher), #18 RS2 dropper, 5X fluoro.",
    tags: ["dry-dropper", "RS2", "Henry's Fork", "box canyon"],
    trip_tags: ["morning", "solo"],
    latitude: 44.4608,
    longitude: -111.393,
    catches: [
      {
        species: "Rainbow Trout",
        length_inches: 13,
        fly_name: "RS2",
        fly_size: "#18",
        fly_position: 2,
        time_caught_hour: 9,
        time_caught_minute: 18,
      },
      {
        species: "Rainbow Trout",
        length_inches: 15,
        fly_name: "RS2",
        fly_size: "#18",
        fly_position: 2,
        time_caught_hour: 9,
        time_caught_minute: 33,
      },
      {
        species: "Rainbow Trout",
        length_inches: 12,
        fly_name: "Parachute Adams",
        fly_size: "#16",
        fly_position: 1,
        time_caught_hour: 9,
        time_caught_minute: 51,
        catch_note: "First one on the dry. Fish is eating the indicator.",
      },
      {
        species: "Rainbow Trout",
        length_inches: 16,
        fly_name: "RS2",
        fly_size: "#18",
        fly_position: 2,
        time_caught_hour: 10,
        time_caught_minute: 14,
        catch_note: "Strong fish on the inside seam. Ran downstream twice.",
      },
      {
        species: "Rainbow Trout",
        length_inches: 14,
        fly_name: "RS2",
        fly_size: "#18",
        fly_position: 2,
        time_caught_hour: 10,
        time_caught_minute: 28,
      },
      {
        species: "Rainbow Trout",
        length_inches: 13,
        fly_name: "Parachute Adams",
        fly_size: "#16",
        fly_position: 1,
        time_caught_hour: 10,
        time_caught_minute: 44,
      },
      {
        species: "Rainbow Trout",
        length_inches: 11,
        fly_name: "RS2",
        fly_size: "#18",
        fly_position: 2,
        time_caught_hour: 10,
        time_caught_minute: 59,
      },
      {
        species: "Rainbow Trout",
        length_inches: 18,
        fly_name: "RS2",
        fly_size: "#18",
        fly_position: 2,
        time_caught_hour: 11,
        time_caught_minute: 17,
        catch_note: "Biggest of the day. Thick rainbow, sat in the slow water behind the shelf rock.",
      },
      {
        species: "Rainbow Trout",
        length_inches: 13,
        fly_name: "Parachute Adams",
        fly_size: "#16",
        fly_position: 1,
        time_caught_hour: 11,
        time_caught_minute: 34,
      },
      {
        species: "Rainbow Trout",
        length_inches: 12,
        fly_name: "RS2",
        fly_size: "#18",
        fly_position: 2,
        time_caught_hour: 11,
        time_caught_minute: 48,
      },
      {
        species: "Mountain Whitefish",
        length_inches: 14,
        fly_name: "RS2",
        fly_size: "#18",
        fly_position: 2,
        time_caught_hour: 12,
        time_caught_minute: 3,
        catch_note: "Fun surprise. They eat the RS2 as well as anything.",
      },
      {
        species: "Rainbow Trout",
        length_inches: 15,
        fly_name: "Parachute Adams",
        fly_size: "#16",
        fly_position: 1,
        time_caught_hour: 12,
        time_caught_minute: 19,
      },
      {
        species: "Rainbow Trout",
        length_inches: 13,
        fly_name: "RS2",
        fly_size: "#18",
        fly_position: 2,
        time_caught_hour: 12,
        time_caught_minute: 31,
      },
      {
        species: "Rainbow Trout",
        length_inches: 14,
        fly_name: "Parachute Adams",
        fly_size: "#16",
        fly_position: 1,
        time_caught_hour: 12,
        time_caught_minute: 42,
        catch_note: "Last fish before I packed up. Stiff evening wind picked up.",
      },
    ],
  },

  // ───────────────────────────────────────────────
  // Most recent — Madison River, MT — PMD hatch, trophy brown
  // The quality session: moderate count, the PB of the three
  // ───────────────────────────────────────────────
  {
    days_ago: 3,
    river_id: "river-madison",
    river_name: "Madison River",
    title: "PMD hatch below Three Dollar Bridge",
    location: "Cameron, MT",
    section: "Upper (between-the-lakes)",
    weather: "Sunny breaking to thin clouds, 68°F air, no wind",
    water_temp_f: 52,
    water_clarity: "Clear",
    notes:
      "Got on the water at 11 expecting the PMD hatch around 1pm — it came off right on time. Thicker than I expected, with size 16s coming off in steady waves through 3pm. Fish were keyed on emergers for the first hour, then moved to duns as the hatch peaked. Switched from a PMD soft-hackle emerger to a size-16 Sparkle Dun and the visual takes started. Nine fish, all on top, which I'll take any day. The 19-inch brown came from the far seam against the willows — watched him rise three times before I threw at him. Perfect drag-free float and he tipped up slow.",
    flies_notes:
      "#16 PMD Sparkle Dun (dun phase), #16 PMD Soft-Hackle Emerger (early), 5X fluoro.",
    tags: ["PMD", "dry fly", "hatch match", "Madison"],
    trip_tags: ["solo", "afternoon"],
    latitude: 45.0469,
    longitude: -111.556,
    catches: [
      {
        species: "Brown Trout",
        length_inches: 14,
        fly_name: "PMD Soft-Hackle Emerger",
        fly_size: "#16",
        fly_position: 1,
        time_caught_hour: 12,
        time_caught_minute: 47,
        catch_note: "Emerger phase — fish still picking bugs just below the surface.",
      },
      {
        species: "Rainbow Trout",
        length_inches: 15,
        fly_name: "PMD Soft-Hackle Emerger",
        fly_size: "#16",
        fly_position: 1,
        time_caught_hour: 13,
        time_caught_minute: 2,
      },
      {
        species: "Brown Trout",
        length_inches: 13,
        fly_name: "PMD Sparkle Dun",
        fly_size: "#16",
        fly_position: 1,
        time_caught_hour: 13,
        time_caught_minute: 28,
        catch_note: "Switched to dun. First take was splashy — they're up and committed.",
      },
      {
        species: "Rainbow Trout",
        length_inches: 14,
        fly_name: "PMD Sparkle Dun",
        fly_size: "#16",
        fly_position: 1,
        time_caught_hour: 13,
        time_caught_minute: 44,
      },
      {
        species: "Brown Trout",
        length_inches: 16,
        fly_name: "PMD Sparkle Dun",
        fly_size: "#16",
        fly_position: 1,
        time_caught_hour: 14,
        time_caught_minute: 1,
      },
      {
        species: "Brown Trout",
        length_inches: 19,
        fly_name: "PMD Sparkle Dun",
        fly_size: "#16",
        fly_position: 1,
        time_caught_hour: 14,
        time_caught_minute: 23,
        catch_note:
          "Trophy. Watched him rise three times against the willows — gave him one perfect drift. Took slow and confident. New PB on the Madison.",
        catch_tags: ["PB", "trophy"],
      },
      {
        species: "Rainbow Trout",
        length_inches: 13,
        fly_name: "PMD Sparkle Dun",
        fly_size: "#16",
        fly_position: 1,
        time_caught_hour: 14,
        time_caught_minute: 48,
      },
      {
        species: "Brown Trout",
        length_inches: 15,
        fly_name: "PMD Sparkle Dun",
        fly_size: "#16",
        fly_position: 1,
        time_caught_hour: 15,
        time_caught_minute: 6,
      },
      {
        species: "Brown Trout",
        length_inches: 14,
        fly_name: "PMD Sparkle Dun",
        fly_size: "#16",
        fly_position: 1,
        time_caught_hour: 15,
        time_caught_minute: 22,
        catch_note: "Hatch tailed off around 3:15. Called it after this one.",
      },
    ],
  },
];

/**
 * Build session + catch rows ready for Supabase insert, with dates shifted
 * relative to the moment of seed (so demos always look recent).
 *
 * All rows are marked is_demo=true and privacy='private' — that is the clean
 * separation boundary. Do not expose a way to toggle those off at seed time.
 */
export function buildDemoRows(userId: string, now = new Date()) {
  return DEMO_SESSIONS.map((session) => {
    const sessionDate = new Date(now);
    sessionDate.setDate(sessionDate.getDate() - session.days_ago);
    // Zero out the time portion — date column is a calendar date
    const dateStr = sessionDate.toISOString().split("T")[0];

    const catches = session.catches.map((c) => {
      const dt = new Date(sessionDate);
      dt.setHours(c.time_caught_hour, c.time_caught_minute, 0, 0);
      return {
        user_id: userId,
        species: c.species,
        length_inches: c.length_inches,
        fly_name: c.fly_name,
        fly_size: c.fly_size,
        fly_position: c.fly_position ?? null,
        time_caught: dt.toISOString(),
        catch_note: c.catch_note ?? null,
        catch_tags: c.catch_tags ?? [],
        is_demo: true,
      };
    });

    return {
      session: {
        user_id: userId,
        river_id: session.river_id,
        river_name: session.river_name,
        title: session.title,
        location: session.location,
        section: session.section,
        date: dateStr,
        weather: session.weather,
        water_temp_f: session.water_temp_f,
        water_clarity: session.water_clarity,
        total_fish: session.catches.length,
        notes: session.notes,
        flies_notes: session.flies_notes,
        tags: session.tags,
        trip_tags: session.trip_tags,
        latitude: session.latitude,
        longitude: session.longitude,
        // privacy column dropped 2026-05-04 — demo sessions don't broadcast
        broadcast_presence: false,
        is_demo: true,
      },
      catches,
    };
  });
}
