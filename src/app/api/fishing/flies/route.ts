import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const singleId = req.nextUrl.searchParams.get("id");
    if (singleId) {
      const { data, error } = await supabase
        .from("fly_patterns")
        .select("*")
        .eq("id", singleId)
        .eq("user_id", user.id)
        .single();
      if (error) {
        console.error("Failed to fetch fly pattern:", error);
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
      return NextResponse.json(data);
    }

    const { data, error } = await supabase
      .from("fly_patterns")
      .select("*")
      .eq("user_id", user.id)
      .order("name");

    if (error) {
      console.error("Failed to fetch fly patterns:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (err) {
    console.error("Fly patterns GET error:", err);
    return NextResponse.json({ error: "Failed to fetch fly patterns" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const contentType = req.headers.get("content-type") || "";
    let body: Record<string, unknown> = {};
    let imageUrl: string | undefined;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("image") as File | null;

      if (file && file.size > 0) {
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
        const arrayBuffer = await file.arrayBuffer();
        const { error: uploadError } = await supabase.storage
          .from("fly-pattern-images")
          .upload(path, arrayBuffer, { contentType: file.type, upsert: true });

        if (uploadError) {
          console.error("Image upload error:", uploadError);
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from("fly-pattern-images")
            .getPublicUrl(path);
          imageUrl = publicUrl;
        }
      }

      for (const [key, value] of formData.entries()) {
        if (key !== "image") body[key] = value;
      }
    } else {
      body = await req.json();
    }

    // Parse array fields
    const parseArr = (v: unknown) =>
      typeof v === "string" ? v.split(",").map((s) => s.trim()).filter(Boolean) : v;

    const str = (v: unknown) => (v !== undefined && v !== null ? String(v) : undefined);

    const row: Record<string, unknown> = {
      user_id: user.id,
      name: str(body.name),
      type: str(body.type),
      size: str(body.size),
      hook: str(body.hook),
      bead_size: str(body.bead_size),
      bead_color: str(body.bead_color),
      fly_color: str(body.fly_color),
      materials: str(body.materials),
      description: str(body.description),
      video_url: str(body.video_url),
      tags: parseArr(body.tags),
      ...(imageUrl ? { image_url: imageUrl } : {}),
    };

    // Remove undefined values so Supabase uses column defaults
    Object.keys(row).forEach((k) => row[k] === undefined && delete row[k]);

    const { data, error } = await supabase
      .from("fly_patterns")
      .insert(row)
      .select()
      .single();

    if (error) {
      console.error("Failed to create fly pattern:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (err) {
    console.error("Fly patterns POST error:", err);
    return NextResponse.json({ error: "Failed to create fly pattern" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const contentType = req.headers.get("content-type") || "";
    let body: Record<string, unknown> = {};
    let imageUrl: string | undefined;

    if (contentType.includes("multipart/form-data")) {
      // Handle file upload in PATCH (e.g. replacing fly photo)
      const formData = await req.formData();
      const file = formData.get("image") as File | null;

      if (file && file.size > 0) {
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
        const arrayBuffer = await file.arrayBuffer();
        const { error: uploadError } = await supabase.storage
          .from("fly-pattern-images")
          .upload(path, arrayBuffer, { contentType: file.type, upsert: true });

        if (uploadError) {
          console.error("Image upload error:", uploadError);
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from("fly-pattern-images")
            .getPublicUrl(path);
          imageUrl = publicUrl;
        }
      }

      for (const [key, value] of formData.entries()) {
        if (key !== "image") body[key] = value;
      }
    } else {
      body = await req.json();
    }

    // Parse array fields — same logic as POST so DB columns get proper arrays
    const parseArr = (v: unknown) =>
      typeof v === "string" ? v.split(",").map((s) => s.trim()).filter(Boolean) : v;

    const str = (v: unknown) => (v !== undefined ? String(v) : undefined);

    const updates: Record<string, unknown> = {
      name: str(body.name),
      type: str(body.type),
      size: str(body.size),
      hook: str(body.hook),
      bead_size: str(body.bead_size),
      bead_color: str(body.bead_color),
      fly_color: str(body.fly_color),
      materials: str(body.materials),
      description: str(body.description),
      video_url: str(body.video_url),
      tags: parseArr(body.tags),
      ...(imageUrl ? { image_url: imageUrl } : {}),
    };

    // Remove undefined values so we only update fields that were sent
    Object.keys(updates).forEach((k) => updates[k] === undefined && delete updates[k]);

    const { error } = await supabase
      .from("fly_patterns")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Failed to update fly pattern:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ id });
  } catch (err) {
    console.error("Fly patterns PATCH error:", err);
    return NextResponse.json({ error: "Failed to update fly pattern" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    // Unlink any catches that reference this fly before deleting
    const { error: unlinkError } = await supabase
      .from("catches")
      .update({ fly_pattern_id: null })
      .eq("fly_pattern_id", id);

    if (unlinkError) {
      console.error("Failed to unlink catches:", unlinkError);
    }

    const { error } = await supabase
      .from("fly_patterns")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Failed to delete fly pattern:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Fly patterns DELETE error:", err);
    return NextResponse.json({ error: "Failed to delete fly pattern" }, { status: 500 });
  }
}
