import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabase
      .from("fishing_spots")
      .select("*")
      .eq("user_id", user.id)
      .order("name");

    if (error) {
      console.error("Failed to fetch fishing spots:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data || []);
  } catch (err) {
    console.error("Fishing spots GET error:", err);
    return NextResponse.json({ error: "Failed to fetch fishing spots" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { name, river_id, latitude, longitude, description } = body;

    if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });

    const { data, error } = await supabase
      .from("fishing_spots")
      .insert({ user_id: user.id, name, river_id: river_id || null, latitude: latitude || null, longitude: longitude || null, description: description || null })
      .select()
      .single();

    if (error) {
      console.error("Failed to create fishing spot:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (err) {
    console.error("Fishing spots POST error:", err);
    return NextResponse.json({ error: "Failed to create fishing spot" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const body = await req.json();
    const { name, river_id, latitude, longitude, description } = body;

    const { data, error } = await supabase
      .from("fishing_spots")
      .update({ name, river_id: river_id || null, latitude: latitude || null, longitude: longitude || null, description: description || null })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Failed to update fishing spot:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (err) {
    console.error("Fishing spots PATCH error:", err);
    return NextResponse.json({ error: "Failed to update fishing spot" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const { error } = await supabase
      .from("fishing_spots")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Failed to delete fishing spot:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Fishing spots DELETE error:", err);
    return NextResponse.json({ error: "Failed to delete fishing spot" }, { status: 500 });
  }
}
