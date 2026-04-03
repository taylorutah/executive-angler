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
 * GET /api/admin/entities/[id]?table=rivers
 * Fetch a single entity by id.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const table = searchParams.get("table");

  if (!table || !isAllowedTable(table)) {
    return NextResponse.json(
      {
        error: `Invalid table. Must be one of: ${ALLOWED_TABLES.join(", ")}`,
      },
      { status: 400 }
    );
  }

  const { data, error } = await admin
    .from(table)
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}

/**
 * PATCH /api/admin/entities/[id]
 * Body: { table: string, data: Record<string, unknown> }
 * Update an entity by id.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

  const { id } = await params;
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

  const { data, error } = await admin
    .from(table)
    .update(rowData)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}

/**
 * DELETE /api/admin/entities/[id]?table=rivers
 * Delete an entity by id.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const table = searchParams.get("table");

  if (!table || !isAllowedTable(table)) {
    return NextResponse.json(
      {
        error: `Invalid table. Must be one of: ${ALLOWED_TABLES.join(", ")}`,
      },
      { status: 400 }
    );
  }

  const { error } = await admin.from(table).delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
