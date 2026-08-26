/**
 * Seed the screenshot / workbench fixture account.
 *
 *   SUPABASE_SERVICE_ROLE_KEY=… EA_FIXTURE_EMAIL=… EA_FIXTURE_PASSWORD=… \\
 *     npx tsx scripts/seed-fixture-account.ts
 *   SUPABASE_SERVICE_ROLE_KEY=… EA_FIXTURE_EMAIL=… EA_FIXTURE_PASSWORD=… \\
 *     npx tsx scripts/seed-fixture-account.ts --empty
 *
 * Idempotent. Never writes to the App Store review inbox.
 * Anyone can rebuild the fixture from this file.
 *
 * Default: rows labelled as fixture data so /journal, /flybox,
 * /rivers/mine, and /account/gear have enough of a table to drive, not
 * as a fishing log.
 *
 * --empty: a second user with zero rows (first-run surfaces).
 */
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://qlasxtfbodyxbcuchvxz.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export const FIXTURE_EMAIL = process.env.EA_FIXTURE_EMAIL ?? "";
export const FIXTURE_EMPTY_EMAIL =
  process.env.EA_FIXTURE_EMPTY_EMAIL || "fixture-empty@executiveangler.com";
export const FIXTURE_PASSWORD = process.env.EA_FIXTURE_PASSWORD ?? "";
export const QA_REVIEW_EMAIL = ["test", "executiveangler.com"].join("@");

const EMPTY_MODE = process.argv.includes("--empty");

if (!SERVICE_ROLE_KEY) {
  console.error("ERROR: SUPABASE_SERVICE_ROLE_KEY is required.");
  console.error("Usage: SUPABASE_SERVICE_ROLE_KEY=<key> npx tsx scripts/seed-fixture-account.ts");
  process.exit(1);
}

if (!FIXTURE_EMAIL || !FIXTURE_PASSWORD) {
  console.error("ERROR: EA_FIXTURE_EMAIL and EA_FIXTURE_PASSWORD must be set.");
  console.error("There is no default account or password.");
  process.exit(1);
}

const headers = {
  apikey: SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
  "Content-Type": "application/json",
};

async function admin(path: string, init: RequestInit = {}): Promise<Response> {
  return fetch(`${SUPABASE_URL}${path}`, {
    ...init,
    headers: { ...headers, ...(init.headers as Record<string, string> | undefined) },
  });
}

async function rest(
  table: string,
  method: string,
  body?: unknown,
  query = "",
): Promise<unknown> {
  const res = await admin(`/rest/v1/${table}${query}`, {
    method,
    headers: { Prefer: "return=representation" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${table}${query} → ${res.status}: ${text}`);
  return text ? JSON.parse(text) : null;
}

const GEAR = [
  {
    type: "rod",
    name: "5wt dry rod",
    maker: "Sage",
    model: "R8 Core 590-4",
    specs: { length_ft: 9, weight_wt: 5, pieces: 4 },
    is_default: true,
    is_active: true,
  },
  {
    type: "reel",
    name: "5/6 reel",
    maker: "Ross",
    model: "Animas 5/6",
    specs: { size: "5/6" },
    is_default: true,
    is_active: true,
  },
  {
    type: "line",
    name: "Floating trout line",
    maker: "Scientific Anglers",
    model: "Amplitude Trout WF5F",
    specs: { taper: "WF", weight: 5, density: "floating" },
    is_default: true,
    is_active: true,
  },
];

const SECTIONS = [
  { river_id: "river-madison", usgs_site_id: "06041000", position: 0 },
  { river_id: "river-gallatin", usgs_site_id: "06043120", position: 1 },
  { river_id: "green-river-utah", usgs_site_id: "09234500", position: 2 },
];

const BOXES = [
  { name: "Kill box", tier: "kill", total_capacity: 20, is_default: true, sort_order: 0 },
  { name: "Support", tier: "support", total_capacity: 80, is_default: false, sort_order: 1 },
  { name: "Archive", tier: "archive", total_capacity: 200, is_default: false, sort_order: 2 },
];

const SESSIONS = [
  {
    title: "Fixture — Madison table row",
    river_id: "river-madison",
    river_name: "Madison River",
    date: "2026-06-01",
    total_fish: 0,
    water_temp_f: 48,
    notes: "Fixture row for workbench screenshots. Not a logged day.",
  },
  {
    title: "Fixture — Gallatin table row",
    river_id: "river-gallatin",
    river_name: "Gallatin River",
    date: "2026-06-08",
    total_fish: 0,
    water_temp_f: 46,
    notes: "Fixture row for workbench screenshots. Not a logged day.",
  },
  {
    title: "Fixture — Green table row",
    river_id: "green-river-utah",
    river_name: "Green River",
    date: "2026-06-15",
    total_fish: 0,
    water_temp_f: 52,
    notes: "Fixture row for workbench screenshots. Not a logged day.",
  },
  {
    title: "Fixture — Provo table row",
    river_id: "provo-river",
    river_name: "Provo River",
    date: "2026-06-22",
    total_fish: 0,
    water_temp_f: 50,
    notes: "Fixture row for workbench screenshots. Not a logged day.",
  },
];

async function findOrCreateUser(email: string, displayName: string, purpose: string): Promise<string> {
  if (email === QA_REVIEW_EMAIL) {
    throw new Error("Refusing to write the App Store review account.");
  }
  const list = (await (
    await admin("/auth/v1/admin/users?page=1&per_page=200")
  ).json()) as { users?: Array<{ id: string; email?: string }> };
  const existing = list.users?.find((u) => u.email === email);
  if (existing) {
    if (existing.email === QA_REVIEW_EMAIL) {
      throw new Error("Refusing to write the App Store review account.");
    }
    console.log(`User exists: ${existing.id}`);
    return existing.id;
  }
  const qa = list.users?.find((u) => u.email === QA_REVIEW_EMAIL);
  if (!qa) {
    console.warn("Review account not found — continuing, but refuse to write it if it appears.");
  }
  const createRes = await admin("/auth/v1/admin/users", {
    method: "POST",
    body: JSON.stringify({
      email,
      password: FIXTURE_PASSWORD,
      email_confirm: true,
      user_metadata: {
        purpose,
        display_name: displayName,
      },
    }),
  });
  const created = (await createRes.json()) as { id?: string; email?: string };
  if (!createRes.ok || !created.id) {
    throw new Error(`Failed to create fixture user: ${JSON.stringify(created)}`);
  }
  if (created.email === QA_REVIEW_EMAIL || created.id === qa?.id) {
    throw new Error("Refusing to continue: create returned the review account.");
  }
  console.log(`User created: ${created.id}`);
  return created.id;
}

async function refuseIfReviewInbox(userId: string): Promise<void> {
  const qaCheck = (await (
    await admin(`/auth/v1/admin/users/${userId}`)
  ).json()) as { email?: string };
  if (qaCheck.email === QA_REVIEW_EMAIL) {
    throw new Error("Refusing to write the App Store review account.");
  }
}

async function deleteUserRows(userId: string): Promise<void> {
  const tables = [
    "catches",
    "session_rigs",
    "fly_box_entries",
    "fly_box_entries_v3",
    "fishing_sessions",
    "fly_boxes",
    "gear_items",
    "user_favorite_sections",
    "user_favorites",
  ];
  for (const table of tables) {
    try {
      await rest(table, "DELETE", undefined, `?user_id=eq.${userId}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes(" → 404") || msg.includes(" → 400") || msg.includes(" → 406")) {
        continue;
      }
      // fly_box_entries may key on box owner, not user_id
      if (table.startsWith("fly_box_entries")) continue;
      throw err;
    }
  }
}

async function upsertProfile(
  userId: string,
  profile: Record<string, unknown>,
): Promise<void> {
  const existingProfile = (await rest(
    "profiles",
    "GET",
    undefined,
    `?user_id=eq.${userId}&select=user_id`,
  )) as Array<{ user_id: string }>;
  if (existingProfile?.[0]?.user_id) {
    await rest("profiles", "PATCH", profile, `?user_id=eq.${userId}`);
  } else {
    await rest("profiles", "POST", profile);
  }
}

async function upsertByUser(
  table: string,
  userId: string,
  match: Record<string, string>,
  row: Record<string, unknown>,
): Promise<void> {
  const params = new URLSearchParams({ user_id: `eq.${userId}` });
  for (const [k, v] of Object.entries(match)) params.set(k, `eq.${v}`);
  const existing = (await rest(table, "GET", undefined, `?${params}&select=id`)) as Array<{
    id: string;
  }>;
  if (existing?.[0]?.id) {
    await rest(table, "PATCH", row, `?id=eq.${existing[0].id}`);
    return;
  }
  await rest(table, "POST", { user_id: userId, ...match, ...row });
}

async function seedEmpty(): Promise<void> {
  console.log("=== Seed empty fixture account ===\n");
  const userId = await findOrCreateUser(
    FIXTURE_EMPTY_EMAIL,
    "Empty Fixture",
    "first_run_empty_states",
  );
  await refuseIfReviewInbox(userId);

  console.log("Clearing rows (must stay at zero)…");
  await deleteUserRows(userId);

  console.log("Profiles…");
  await upsertProfile(userId, {
    user_id: userId,
    display_name: "Empty Fixture",
    username: "fixture_empty",
    bio: "First-run empty fixture. Not a person. Zero rows.",
    is_private: true,
    searchable: false,
    profile_visibility: "private",
    founders_free_signup: false,
    feed_display: "collage",
  });

  console.log("\n=== DONE (empty) ===");
  console.log(`Email:    ${FIXTURE_EMPTY_EMAIL}`);
  console.log("Password: (from EA_FIXTURE_PASSWORD)");
  console.log(`User ID:  ${userId}`);
  console.log("Zero journal / flybox / watch / gear rows.");
  console.log("Never use the App Store review inbox for screenshots or seeded rows.");
}

async function main() {
  if (EMPTY_MODE) {
    await seedEmpty();
    return;
  }

  console.log("=== Seed fixture account ===\n");
  const userId = await findOrCreateUser(
    FIXTURE_EMAIL,
    "Fixture Angler",
    "screenshots_and_workbench_demos",
  );
  if (!userId) throw new Error("No fixture user id");
  await refuseIfReviewInbox(userId);

  console.log("Profiles…");
  await upsertProfile(userId, {
    user_id: userId,
    display_name: "Fixture Angler",
    username: "fixture_ea",
    bio: "Screenshot and workbench fixture. Not a person.",
    is_private: true,
    searchable: false,
    profile_visibility: "private",
    founders_free_signup: false,
    feed_display: "collage",
  });

  console.log("Gear locker…");
  for (const item of GEAR) {
    await upsertByUser("gear_items", userId, { name: item.name }, item);
  }

  console.log("Watched sections…");
  for (const section of SECTIONS) {
    await upsertByUser(
      "user_favorite_sections",
      userId,
      { river_id: section.river_id, usgs_site_id: section.usgs_site_id },
      { position: section.position },
    );
  }

  console.log("Fly boxes…");
  for (const box of BOXES) {
    await upsertByUser("fly_boxes", userId, { name: box.name }, box);
  }

  console.log("Journal sessions…");
  for (const session of SESSIONS) {
    const existing = (await rest(
      "fishing_sessions",
      "GET",
      undefined,
      `?user_id=eq.${userId}&title=eq.${encodeURIComponent(session.title)}&select=id`,
    )) as Array<{ id: string }>;
    const body = {
      ...session,
      user_id: userId,
      is_demo: true,
      broadcast_presence: false,
      location: "Fixture",
    };
    if (existing?.[0]?.id) {
      await rest("fishing_sessions", "PATCH", body, `?id=eq.${existing[0].id}`);
    } else {
      await rest("fishing_sessions", "POST", body);
    }
  }

  console.log("\n=== DONE ===");
  console.log(`Email:    ${FIXTURE_EMAIL}`);
  console.log("Password: (from EA_FIXTURE_PASSWORD)");
  console.log(`User ID:  ${userId}`);
  console.log("Never use the App Store review inbox for screenshots or seeded rows.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
