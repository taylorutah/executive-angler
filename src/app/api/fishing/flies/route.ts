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
    if (error) return NextResponse.json({ error: error.message }, { status: 404 });
    return NextResponse.json(data);
  }

  const { data, error } = await supabase
    .from("fly_patterns")
    .select("*")
    .eq("user_id", user.id)
    .order("name");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
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

      if (!uploadError) {
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

  const { data, error } = await supabase
    .from("fly_patterns")
    .insert({
      ...body,
      user_id: user.id,
      ...(imageUrl ? { image_url: imageUrl } : {}),
      size: parseArr(body.size),
      bead_color: parseArr(body.bead_color),
      fly_color: parseArr(body.fly_color),
      tags: parseArr(body.tags),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const body = await req.json();
  const { error } = await supabase
    .from("fly_patterns")
    .update(body)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id });
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  // Check if fly is used in any session
  const { count } = await supabase
    .from("catches")
    .select("*", { count: "exact", head: true })
    .eq("fly_pattern_id", id);

  if (count && count > 0) {
    return NextResponse.json(
      { error: `This fly is used in ${count} catch record(s) and cannot be deleted.` },
      { status: 409 }
    );
  }

  const { error } = await supabase
    .from("fly_patterns")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
