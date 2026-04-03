import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { isAdmin } from "@/lib/admin";

const ALLOWED_TABLES = [
  "destinations",
  "rivers",
  "species",
  "lodges",
  "guides",
  "fly_shops",
  "articles",
] as const;

type AllowedTable = (typeof ALLOWED_TABLES)[number];

function isAllowedTable(table: string): table is AllowedTable {
  return ALLOWED_TABLES.includes(table as AllowedTable);
}

/** Returns the column used for ordering/searching per table */
function nameColumn(table: AllowedTable): string {
  if (table === "articles") return "title";
  if (table === "species") return "common_name";
  return "name";
}

function getAdminSupabase() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function authorize() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdmin(user.email)) {
    return null;
  }
  return user;
}

/**
 * GET /api/admin/entities?table=rivers&search=madison
 * List entities from a given table, optionally filtered by search.
 */
export async function GET(request: NextRequest) {
  const user = await authorize();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const admin = getAdminSupabase();
  if (!admin) {
    return NextResponse.json(
      { error: "Service role key not configured" },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);
  const table = searchParams.get("table");
  const search = searchParams.get("search");

  if (!table || !isAllowedTable(table)) {
    return NextResponse.json(
      {
        error: `Invalid table. Must be one of: ${ALLOWED_TABLES.join(", ")}`,
      },
      { status: 400 }
    );
  }

  const col = nameColumn(table);
  let query = admin.from(table).select("*").order(col, { ascending: true });

  if (search) {
    query = query.ilike(col, `%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

/**
 * POST /api/admin/entities
 * Body: { table: string, data: Record<string, unknown> }
 * Create a new entity row.
 */
export async function POST(request: NextRequest) {
  const user = await authorize();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const admin = getAdminSupabase();
  if (!admin) {
    return NextResponse.json(
      { error: "Service role key not configured" },
      { status: 503 }
    );
  }

  const body = await request.json();
  const { table, data: rowData } = body as {
    table?: string;
    data?: Record<string, unknown>;
  };

  if (!table || !isAllowedTable(table)) {
    return NextResponse.json(
      {
        error: `Invalid table. Must be one of: ${ALLOWED_TABLES.join(", ")}`,
      },
      { status: 400 }
    );
  }

  if (!rowData || typeof rowData !== "object") {
    return NextResponse.json(
      { error: "data object is required" },
      { status: 400 }
    );
  }

  // Auto-generate id if not provided
  const insertData = { ...rowData };
  if (!insertData.id) {
    insertData.id = crypto.randomUUID();
  }

  const { data, error } = await admin
    .from(table)
    .insert(insertData)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
