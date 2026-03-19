import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    // Cookie-based auth (matches how the browser sends credentials)
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const sessionId = formData.get("sessionId") as string;
    const caption = formData.get("caption") as string | null;

    if (!file || !sessionId) {
      return NextResponse.json(
        { error: "Missing file or sessionId" },
        { status: 400 }
      );
    }

    // Service role client for storage uploads (bypasses RLS)
    const serviceClient = createServiceClient(supabaseUrl, supabaseServiceKey);

    // Generate unique filename
    const uuid = crypto.randomUUID();
    const ext = file.name.split(".").pop() || "jpg";
    const filePath = `${user.id}/${sessionId}/${uuid}.${ext}`;

    // Upload to storage
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const { error: uploadError } = await serviceClient.storage
      .from("session-photos")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json(
        { error: "Upload failed" },
        { status: 500 }
      );
    }

    // Get public URL
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/session-photos/${filePath}`;

    // Insert record using service client (bypasses RLS on session_photos table)
    const { data: photo, error: insertError } = await serviceClient
      .from("session_photos")
      .insert({
        session_id: sessionId,
        user_id: user.id,
        url: publicUrl,
        caption: caption || null,
      })
      .select("id, url, caption, created_at")
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return NextResponse.json(
        { error: "Database insert failed" },
        { status: 500 }
      );
    }

    return NextResponse.json(photo);
  } catch (error) {
    console.error("Session photo upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing sessionId" },
        { status: 400 }
      );
    }

    const { data: photos, error } = await supabase
      .from("session_photos")
      .select("id, url, caption, created_at")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Fetch error:", error);
      return NextResponse.json(
        { error: "Fetch failed" },
        { status: 500 }
      );
    }

    return NextResponse.json(photos || []);
  } catch (error) {
    console.error("Session photos fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Cookie-based auth
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const photoId = searchParams.get("id");

    if (!photoId) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    // Service role client for storage + DB operations
    const serviceClient = createServiceClient(supabaseUrl, supabaseServiceKey);

    // Get photo to verify ownership and get storage path
    const { data: photo, error: fetchError } = await serviceClient
      .from("session_photos")
      .select("*")
      .eq("id", photoId)
      .single();

    if (fetchError || !photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    if (photo.user_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Extract storage path from URL
    const urlParts = photo.url.split("/session-photos/");
    if (urlParts.length === 2) {
      const filePath = urlParts[1];
      await serviceClient.storage.from("session-photos").remove([filePath]);
    }

    // Delete from database
    const { error: deleteError } = await serviceClient
      .from("session_photos")
      .delete()
      .eq("id", photoId);

    if (deleteError) {
      console.error("Delete error:", deleteError);
      return NextResponse.json(
        { error: "Delete failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Session photo delete error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
