import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { isAdmin } from "@/lib/admin";

/**
 * POST /api/admin/upload-image
 * Admin-only image upload used by ImageField (hero crop, etc).
 * Replaces the deleted /api/submissions/upload route.
 *
 * Multipart body:
 *   file: image blob (required)
 *   submission_id: string (optional — used to name the storage path)
 *
 * Returns { url } where url is the public Supabase Storage URL.
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !isAdmin(user.email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const submissionId = (formData.get("submission_id") as string) || `admin-${Date.now()}`;
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const path = `${submissionId}.${ext}`;
    const arrayBuffer = await file.arrayBuffer();

    // Service-role client — admin uploads bypass RLS on the photos bucket.
    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const { error: uploadError } = await admin.storage
      .from("photos")
      .upload(path, arrayBuffer, {
        contentType: file.type || "image/jpeg",
        upsert: true,
      });

    if (uploadError) {
      console.error("[admin/upload-image] storage upload error:", uploadError);
      return NextResponse.json(
        { error: `Storage upload failed: ${uploadError.message}` },
        { status: 500 },
      );
    }

    const { data: { publicUrl } } = admin.storage.from("photos").getPublicUrl(path);
    return NextResponse.json({ url: publicUrl });
  } catch (err) {
    console.error("[admin/upload-image] error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed" },
      { status: 500 },
    );
  }
}
