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
 *   submission_id: string (optional — used to scope the storage path)
 *
 * Storage: `photo-submissions` bucket (public, 20 MB limit, JPEG/PNG/WebP).
 * Path:    submissions/{user_id}/{submission_id}/{timestamp}.{ext}
 * Returns: { url } — the public Supabase Storage URL.
 */

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 20 * 1024 * 1024;
const BUCKET = "photo-submissions";

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

    if (!ALLOWED_MIME.has(file.type)) {
      return NextResponse.json(
        { error: `Unsupported type "${file.type}". Use JPEG, PNG, or WebP.` },
        { status: 400 },
      );
    }
    if (file.size > MAX_BYTES) {
      const mb = (file.size / (1024 * 1024)).toFixed(1);
      return NextResponse.json(
        { error: `File is ${mb} MB — max is 20 MB.` },
        { status: 400 },
      );
    }

    const submissionId =
      (formData.get("submission_id") as string) || `admin-${Date.now()}`;
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    // Match the path structure used by the deleted /api/submissions/upload
    // route so storage layout stays uniform with existing hero images.
    const path = `submissions/${user.id}/${submissionId}/${Date.now()}.${ext}`;
    const arrayBuffer = await file.arrayBuffer();

    // Service-role client — admin uploads bypass storage RLS.
    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const { error: uploadError } = await admin.storage
      .from(BUCKET)
      .upload(path, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("[admin/upload-image] storage upload error:", uploadError);
      return NextResponse.json(
        { error: `Storage upload failed: ${uploadError.message}` },
        { status: 500 },
      );
    }

    const { data: { publicUrl } } = admin.storage.from(BUCKET).getPublicUrl(path);
    return NextResponse.json({ url: publicUrl });
  } catch (err) {
    console.error("[admin/upload-image] error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed" },
      { status: 500 },
    );
  }
}
