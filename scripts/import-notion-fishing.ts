/**
 * Executive Angler — Notion Fishing Log Import
 *
 * Imports fishing data from Notion databases with image handling:
 * - Fly Patterns (with images)
 * - Fishing Log (sessions)
 * - Fish Counts (catches with 3 image types)
 *
 * Usage:
 *   NEXT_PUBLIC_SUPABASE_URL=xxx SUPABASE_SERVICE_ROLE_KEY=xxx npx tsx scripts/import-notion-fishing.ts
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";

// Load Notion credentials
const credPath = join(process.env.HOME || "", "clawd/credentials/notion_fishing_app.json");
const creds = JSON.parse(readFileSync(credPath, "utf-8"));
const NOTION_TOKEN = creds.access_token;

// Database IDs
const DB_FLY_PATTERNS = "66026fbb-4bc0-478c-9964-51555c780b37";
const DB_FISHING_LOG = "effe6383-3332-46bd-8e65-7feba8c74800";
const DB_FISH_COUNTS = "e70a65c4-a8fd-44e4-a236-1b160d772850";

// Taylor's user_id
const TAYLOR_USER_ID = "e0cb4b66-74eb-4bb9-b793-0445dcf5ec2b";

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
    case "url":
      return property.url;
    case "files":
      return property.files;
    default:
      return undefined;
  }
}

// Image handling
async function ensureBucket(bucketId: string): Promise<void> {
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some((b) => b.id === bucketId);

  if (!exists) {
    console.log(`  📦 Creating bucket: ${bucketId}`);
    const { error } = await supabase.storage.createBucket(bucketId, { public: true });
    if (error) {
      console.error(`  ⚠️  Error creating bucket ${bucketId}:`, error.message);
    }
  }
}

async function downloadAndUploadImage(
  notionFileUrl: string,
  bucket: string,
  path: string
): Promise<string | null> {
  try {
    // Download from Notion
    const response = await fetch(notionFileUrl);
    if (!response.ok) return null;

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Determine content type from URL
    const ext = notionFileUrl.match(/\.(jpg|jpeg|png|webp)/i)?.[0] || ".jpg";
    const contentType = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";

    // Upload to Supabase Storage
    const fullPath = path.endsWith(ext) ? path : `${path}${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(fullPath, buffer, {
      contentType,
      upsert: true,
    });

    if (error) {
      console.error(`  ⚠️  Upload error for ${fullPath}:`, error.message);
      return null;
    }

    // Return public URL
    const { data } = supabase.storage.from(bucket).getPublicUrl(fullPath);
    return data.publicUrl;
  } catch (err) {
    console.error(`  ⚠️  Image processing error:`, err);
    return null;
  }
}

async function main() {
  console.log("🐟 Executive Angler — Importing from Notion\n");

  // Ensure storage buckets exist
  console.log("📦 Checking storage buckets...");
  await ensureBucket("fish-images");
  await ensureBucket("fly-pattern-images");
  console.log("  ✅ Storage buckets ready\n");

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

  // 1. Import fly patterns
  console.log("🎣 Importing fly patterns...");
  const flyPatternMap = new Map<string, string>(); // Notion ID -> Supabase ID

  for (const page of flyPatternPages) {
    const props = page.properties;

    // Get multi_select arrays
    const sizeArray = getPropertyValue(props.Size) || [];
    const beadColorArray = getPropertyValue(props["Bead Color"]) || [];
    const flyColorArray = getPropertyValue(props["Fly Color"]) || [];
    const tagsArray = getPropertyValue(props.Tags) || [];

    // Handle image
    let imageUrl = null;
    const files = getPropertyValue(props.Image);
    if (files && files.length > 0) {
      const notionUrl = files[0].file?.url || files[0].external?.url;
      if (notionUrl) {
        imageUrl = await downloadAndUploadImage(
          notionUrl,
          "fly-pattern-images",
          `${TAYLOR_USER_ID}/flies/${page.id}`
        );
      }
    }

    const record = {
      user_id: TAYLOR_USER_ID,
      name: getPropertyValue(props.Name) || "Unnamed Pattern",
      type: getPropertyValue(props.Type),
      size: sizeArray,
      bead_size: getPropertyValue(props["Bead Size"]),
      bead_color: beadColorArray,
      fly_color: flyColorArray,
      materials: getPropertyValue(props.Materials),
      description: getPropertyValue(props["Description/Notes"]),
      video_url: getPropertyValue(props["Video URL"]),
      tags: tagsArray,
      image_url: imageUrl,
      notion_id: page.id,
    };

    const { data, error } = await supabase
      .from("fly_patterns")
      .upsert(record, { onConflict: "notion_id" })
      .select("id, notion_id")
      .single();

    if (error) {
      console.error(`  ⚠️  Error upserting fly pattern ${page.id}:`, error.message);
    } else if (data?.notion_id) {
      flyPatternMap.set(data.notion_id, data.id);
    }
  }

  console.log(`  ✅ Imported ${flyPatternMap.size} fly patterns\n`);

  // 2. Import fishing sessions
  console.log("📝 Importing fishing sessions...");
  const sessionMap = new Map<string, string>(); // Notion session ID -> Supabase session ID

  for (const page of sessionPages) {
    const props = page.properties;

    // Get trip tags array
    const tripTagsArray = getPropertyValue(props.Tags) || [];

    // Parse water temperature as number
    const waterTempRaw = getPropertyValue(props["Water Temperature"]);
    const waterTempF = waterTempRaw ? parseFloat(waterTempRaw) : null;

    const record = {
      user_id: TAYLOR_USER_ID,
      title: getPropertyValue(props.Name),
      date: getPropertyValue(props.Date) || page.created_time.split("T")[0],
      river_name: getPropertyValue(props.River),
      location: getPropertyValue(props.Location),
      notes: getPropertyValue(props.Notes),
      flies_notes: getPropertyValue(props["Flies Notes"]),
      weather: getPropertyValue(props.Weather),
      water_temp_f: waterTempF,
      water_clarity: getPropertyValue(props["Water Clarity"]),
      tags: tripTagsArray,
      total_fish: getPropertyValue(props["Total Fish Caught"]) || 0,
      notion_id: page.id,
    };

    const { data, error } = await supabase
      .from("fishing_sessions")
      .upsert(record, { onConflict: "notion_id" })
      .select("id, notion_id")
      .single();

    if (error) {
      console.error(`  ⚠️  Error upserting session ${page.id}:`, error.message);
    } else if (data?.notion_id) {
      sessionMap.set(data.notion_id, data.id);
    }
  }

  console.log(`  ✅ Imported ${sessionMap.size} fishing sessions\n`);

  // 3. Import catches
  console.log("🐟 Importing catches...");
  let catchCount = 0;

  for (const page of catchPages) {
    const props = page.properties;

    // Get session relation
    const sessionRelations = getPropertyValue(props.Session);
    const sessionNotionId = sessionRelations?.[0];
    const sessionId = sessionNotionId ? sessionMap.get(sessionNotionId) : undefined;

    if (!sessionId) {
      console.log(`  ⚠️  Skipping catch ${page.id} - no session link`);
      continue;
    }

    // Get fly pattern relation
    const flyRelations = getPropertyValue(props["Fly Pattern"]);
    const flyNotionId = flyRelations?.[0];
    const flyPatternId = flyNotionId ? flyPatternMap.get(flyNotionId) : undefined;

    // Get catch tags array
    const catchTagsArray = getPropertyValue(props.Tags) || [];

    // Parse length (strip quotes and "in")
    const lengthRaw = getPropertyValue(props.Length);
    const lengthInches = lengthRaw ? parseFloat(lengthRaw.replace(/["\s]|in/gi, "")) : null;

    // Handle images
    let fishImageUrl = null;
    let fishLocationImageUrl = null;
    let flyImageUrl = null;

    const fishImageFiles = getPropertyValue(props["Fish Image"]);
    if (fishImageFiles && fishImageFiles.length > 0) {
      const notionUrl = fishImageFiles[0].file?.url || fishImageFiles[0].external?.url;
      if (notionUrl) {
        fishImageUrl = await downloadAndUploadImage(
          notionUrl,
          "fish-images",
          `${TAYLOR_USER_ID}/catches/${page.id}/fish`
        );
      }
    }

    const fishLocationFiles = getPropertyValue(props["Fish Location"]);
    if (fishLocationFiles && fishLocationFiles.length > 0) {
      const notionUrl = fishLocationFiles[0].file?.url || fishLocationFiles[0].external?.url;
      if (notionUrl) {
        fishLocationImageUrl = await downloadAndUploadImage(
          notionUrl,
          "fish-images",
          `${TAYLOR_USER_ID}/catches/${page.id}/location`
        );
      }
    }

    const flyImageFiles = getPropertyValue(props["Fly Image"]);
    if (flyImageFiles && flyImageFiles.length > 0) {
      const notionUrl = flyImageFiles[0].file?.url || flyImageFiles[0].external?.url;
      if (notionUrl) {
        flyImageUrl = await downloadAndUploadImage(
          notionUrl,
          "fish-images",
          `${TAYLOR_USER_ID}/catches/${page.id}/fly`
        );
      }
    }

    const record = {
      user_id: TAYLOR_USER_ID,
      session_id: sessionId,
      species: getPropertyValue(props["Fish Details"]),
      length_inches: lengthInches,
      quantities: getPropertyValue(props.Quantities) || 1,
      fly_pattern_id: flyPatternId,
      fly_position: getPropertyValue(props["Fly Position"]),
      fly_size: getPropertyValue(props["Fly Size"]),
      bead_size: getPropertyValue(props["Bead Size"]),
      time_caught: getPropertyValue(props["Time Caught"]),
      catch_tags: catchTagsArray,
      fish_image_url: fishImageUrl,
      fish_location_image_url: fishLocationImageUrl,
      fly_image_url: flyImageUrl,
      notion_id: page.id,
    };

    const { error } = await supabase
      .from("catches")
      .upsert(record, { onConflict: "notion_id" });

    if (error) {
      console.error(`  ⚠️  Error upserting catch ${page.id}:`, error.message);
    } else {
      catchCount++;
    }
  }

  console.log(`  ✅ Imported ${catchCount} catches\n`);

  console.log("🎣 Import complete!");
  console.log(`   Fly patterns: ${flyPatternMap.size}`);
  console.log(`   Sessions: ${sessionMap.size}`);
  console.log(`   Catches: ${catchCount}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
