/**
 * Executive Angler — Notion Fishing Log Import
 *
 * Imports fishing data from Notion databases:
 * - Fishing Log (sessions)
 * - Fish Counts (catches)
 * - Fly Patterns
 *
 * Usage:
 *   SUPABASE_SERVICE_ROLE_KEY=xxx npm run fishing:import
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";

// Load Notion credentials
const credPath = join(process.env.HOME || "", "clawd/credentials/notion_fishing_app.json");
const creds = JSON.parse(readFileSync(credPath, "utf-8"));
const NOTION_TOKEN = creds.access_token;

// Database IDs
const DB_FISHING_LOG = "effe6383-3332-46bd-8e65-7feba8c74800";
const DB_FISH_COUNTS = "e70a65c4-a8fd-44e4-a236-1b160d772850";
const DB_FLY_PATTERNS = "66026fbb-4bc0-478c-9964-51555c780b37";

// Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ Missing env vars. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Notion API helpers
interface NotionPage {
  id: string;
  properties: Record<string, any>;
  created_time: string;
}

interface NotionQueryResponse {
  results: NotionPage[];
  has_more: boolean;
  next_cursor?: string;
}

async function queryNotionDatabase(databaseId: string): Promise<NotionPage[]> {
  const pages: NotionPage[] = [];
  let hasMore = true;
  let cursor: string | undefined = undefined;

  while (hasMore) {
    const body: any = { page_size: 100 };
    if (cursor) body.start_cursor = cursor;

    const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${NOTION_TOKEN}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Notion API error: ${response.status} ${await response.text()}`);
    }

    const data: NotionQueryResponse = await response.json();
    pages.push(...data.results);
    hasMore = data.has_more;
    cursor = data.next_cursor;
  }

  return pages;
}

function getPropertyValue(property: any): any {
  if (!property) return undefined;

  switch (property.type) {
    case "title":
      return property.title.map((t: any) => t.plain_text).join("");
    case "rich_text":
      return property.rich_text.map((t: any) => t.plain_text).join("");
    case "number":
      return property.number;
    case "date":
      return property.date?.start;
    case "select":
      return property.select?.name;
    case "multi_select":
      return property.multi_select.map((s: any) => s.name);
    case "relation":
      return property.relation.map((r: any) => r.id);
    case "rollup":
      if (property.rollup.type === "number") return property.rollup.number;
      if (property.rollup.type === "array") return property.rollup.array;
      return undefined;
    default:
      return undefined;
  }
}

// Parse river name from session title (format: "Date - River Name" or just "River Name")
function parseRiverName(sessionName: string): string | undefined {
  if (!sessionName) return undefined;

  // Try to extract river name after " - "
  const parts = sessionName.split(" - ");
  if (parts.length > 1) {
    return parts[1].trim();
  }

  // If no separator, assume the whole name is the river (filter out dates)
  const cleaned = sessionName.replace(/^\d{1,2}\/\d{1,2}\/\d{2,4}\s*-?\s*/, "").trim();
  return cleaned || undefined;
}

async function main() {
  console.log("🐟 Executive Angler — Importing from Notion\n");

  // Fetch all Notion data
  console.log("📥 Fetching Notion databases...");
  const [flyPatternPages, sessionPages, catchPages] = await Promise.all([
    queryNotionDatabase(DB_FLY_PATTERNS),
    queryNotionDatabase(DB_FISHING_LOG),
    queryNotionDatabase(DB_FISH_COUNTS),
  ]);

  console.log(`  ✅ Fetched ${flyPatternPages.length} fly patterns`);
  console.log(`  ✅ Fetched ${sessionPages.length} sessions`);
  console.log(`  ✅ Fetched ${catchPages.length} catches\n`);

  // Get a default user_id (we'll need to create or use an existing user)
  // For now, we'll create a placeholder user or use the first existing user
  const { data: users } = await supabase.auth.admin.listUsers();
  let defaultUserId = users?.users[0]?.id;

  if (!defaultUserId) {
    // Create a placeholder user for imported Notion data
    const { data, error } = await supabase.auth.admin.createUser({
      email: "notion-import@executiveangler.com",
      email_confirm: true,
      user_metadata: { display_name: "Notion Import User" },
    });

    if (error) {
      console.error("❌ Failed to create default user:", error.message);
      process.exit(1);
    }

    defaultUserId = data.user.id;
    console.log(`  ✅ Created default user: ${defaultUserId}\n`);
  } else {
    console.log(`  ℹ️  Using existing user: ${defaultUserId}\n`);
  }

  // 1. Import fly patterns
  console.log("🎣 Importing fly patterns...");
  const flyPatternMap = new Map<string, string>(); // Notion ID -> Supabase ID

  const flyPatternsToInsert = flyPatternPages.map((page) => {
    const props = page.properties;
    return {
      name: getPropertyValue(props.Name) || "Unnamed Pattern",
      type: getPropertyValue(props.Type),
      size: getPropertyValue(props.Size),
      hook: getPropertyValue(props.Hook),
      materials: getPropertyValue(props.Materials),
      notes: getPropertyValue(props.Notes),
      notion_id: page.id,
    };
  });

  if (flyPatternsToInsert.length > 0) {
    const { data: insertedPatterns, error } = await supabase
      .from("fly_patterns")
      .upsert(flyPatternsToInsert, { onConflict: "notion_id" })
      .select("id, notion_id");

    if (error) {
      console.error("  ❌ Error inserting fly patterns:", error.message);
    } else {
      insertedPatterns?.forEach((p) => {
        if (p.notion_id) flyPatternMap.set(p.notion_id, p.id);
      });
      console.log(`  ✅ Inserted ${insertedPatterns?.length || 0} fly patterns`);
    }
  }

  // 2. Extract unique rivers and create them
  console.log("\n🏞️  Creating rivers...");
  const riverNamesSet = new Set<string>();

  sessionPages.forEach((page) => {
    const sessionName = getPropertyValue(page.properties.Name);
    const riverName = parseRiverName(sessionName);
    if (riverName) riverNamesSet.add(riverName);
  });

  const riverMap = new Map<string, string>(); // River name -> Supabase ID

  for (const riverName of riverNamesSet) {
    // Check if river already exists by name
    const { data: existing } = await supabase
      .from("rivers")
      .select("id, name")
      .ilike("name", riverName)
      .single();

    if (existing) {
      riverMap.set(riverName, existing.id);
    } else {
      // Create new river
      const slug = riverName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const { data: newRiver, error } = await supabase
        .from("rivers")
        .insert({
          name: riverName,
          slug: `${slug}-${Date.now()}`, // Add timestamp to ensure uniqueness
          description: `Imported from Notion fishing log.`,
        })
        .select("id")
        .single();

      if (error) {
        console.error(`  ⚠️  Error creating river "${riverName}":`, error.message);
      } else if (newRiver) {
        riverMap.set(riverName, newRiver.id);
      }
    }
  }

  console.log(`  ✅ Processed ${riverMap.size} rivers`);

  // 3. Import fishing sessions
  console.log("\n📝 Importing fishing sessions...");
  const sessionMap = new Map<string, string>(); // Notion session ID -> Supabase session ID

  const sessionsToInsert = sessionPages.map((page) => {
    const props = page.properties;
    const sessionName = getPropertyValue(props.Name);
    const riverName = parseRiverName(sessionName);
    const riverId = riverName ? riverMap.get(riverName) : undefined;

    // Get fly positions for flies_notes
    const flyPos = [
      getPropertyValue(props["Fly - Position 1"]),
      getPropertyValue(props["Fly - Position 2"]),
      getPropertyValue(props["Fly - Position 3"]),
    ].filter(Boolean);

    return {
      user_id: defaultUserId,
      river_id: riverId,
      river_name: riverName,
      date: getPropertyValue(props.Date) || page.created_time.split("T")[0],
      weather: getPropertyValue(props.Weather),
      water_temp_f: getPropertyValue(props["Water Temp (F)"]),
      water_clarity: getPropertyValue(props["Water Clarity"]),
      total_fish: getPropertyValue(props["Total Fish Caught"]) || 0,
      notes: getPropertyValue(props.Notes),
      flies_notes: flyPos.join(", "),
      tags: getPropertyValue(props.Tags) || [],
      notion_id: page.id,
    };
  });

  if (sessionsToInsert.length > 0) {
    const { data: insertedSessions, error } = await supabase
      .from("fishing_sessions")
      .upsert(sessionsToInsert, { onConflict: "notion_id" })
      .select("id, notion_id");

    if (error) {
      console.error("  ❌ Error inserting sessions:", error.message);
      console.error("     Details:", error.details);
    } else {
      insertedSessions?.forEach((s) => {
        if (s.notion_id) sessionMap.set(s.notion_id, s.id);
      });
      console.log(`  ✅ Inserted ${insertedSessions?.length || 0} fishing sessions`);
    }
  }

  // 4. Import session rigs (fly positions)
  console.log("\n🎣 Importing session rigs...");
  const rigsToInsert: any[] = [];

  sessionPages.forEach((page) => {
    const sessionId = sessionMap.get(page.id);
    if (!sessionId) return;

    const props = page.properties;
    const positions = [
      { position: 1, prop: "Fly - Position 1" },
      { position: 2, prop: "Fly - Position 2" },
      { position: 3, prop: "Fly - Position 3" },
    ];

    positions.forEach(({ position, prop }) => {
      const flyName = getPropertyValue(props[prop]);
      if (!flyName) return;

      // Try to find matching fly pattern
      const flyPatternId = Array.from(flyPatternMap.entries()).find(
        ([_, id]) => flyName.includes(id)
      )?.[1];

      rigsToInsert.push({
        session_id: sessionId,
        fly_pattern_id: flyPatternId,
        fly_name: flyName,
        position,
        notion_id: `${page.id}-pos${position}`,
      });
    });
  });

  if (rigsToInsert.length > 0) {
    const { data: insertedRigs, error } = await supabase
      .from("session_rigs")
      .upsert(rigsToInsert, { onConflict: "notion_id" })
      .select("id");

    if (error) {
      console.error("  ❌ Error inserting rigs:", error.message);
    } else {
      console.log(`  ✅ Inserted ${insertedRigs?.length || 0} session rigs`);
    }
  }

  // 5. Import catches
  console.log("\n🐟 Importing catches...");
  const catchesToInsert = catchPages.map((page) => {
    const props = page.properties;

    // Get session relation
    const sessionRelations = getPropertyValue(props.Session);
    const sessionNotionId = sessionRelations?.[0];
    const sessionId = sessionNotionId ? sessionMap.get(sessionNotionId) : undefined;

    // Get fly relation
    const flyRelations = getPropertyValue(props.Fly);
    const flyNotionId = flyRelations?.[0];
    const flyPatternId = flyNotionId ? flyPatternMap.get(flyNotionId) : undefined;

    return {
      session_id: sessionId,
      species: getPropertyValue(props.Species),
      length_inches: getPropertyValue(props["Length (inches)"]),
      fly_pattern_id: flyPatternId,
      fly_name: getPropertyValue(props.Fly),
      time: getPropertyValue(props.Time),
      notes: getPropertyValue(props.Notes),
      notion_id: page.id,
    };
  }).filter((c) => c.session_id); // Only include catches with valid session

  if (catchesToInsert.length > 0) {
    const { data: insertedCatches, error } = await supabase
      .from("catches")
      .upsert(catchesToInsert, { onConflict: "notion_id" })
      .select("id");

    if (error) {
      console.error("  ❌ Error inserting catches:", error.message);
    } else {
      console.log(`  ✅ Inserted ${insertedCatches?.length || 0} catches`);
    }
  }

  console.log("\n🎣 Import complete!");
  console.log(`   Fly patterns: ${flyPatternMap.size}`);
  console.log(`   Rivers: ${riverMap.size}`);
  console.log(`   Sessions: ${sessionMap.size}`);
  console.log(`   Rigs: ${rigsToInsert.length}`);
  console.log(`   Catches: ${catchesToInsert.filter((c) => c.session_id).length}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
