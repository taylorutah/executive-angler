import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";

/**
 * POST /api/submissions/upload
 * Upload an image for a community submission.
 * Uses service role key to bypass RLS on storage.
 */
export async function POST(request: Request) {
  const serverSupabase = await createServerClient();
  const { data: { user } } = await serverSupabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const submissionId = formData.get("submission_id") as string | null;

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  // Validate file type
  const validTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
  if (!validTypes.includes(file.type)) {
    return NextResponse.json({ error: "Invalid file type. Use JPEG, PNG, or WebP." }, { status: 400 });
  }

  // Validate file size (10 MB max)
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large. Maximum 10 MB." }, { status: 400 });
  }

  // Use service role client for storage upload
  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const ext = file.name.split(".").pop() || "jpg";
  const path = `submissions/${user.id}/${submissionId || "general"}/${Date.now()}.${ext}`;

  const buffer = await file.arrayBuffer();

  const { error: uploadError } = await adminSupabase.storage
    .from("community-images")
    .upload(path, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    // If bucket doesn't exist, try creating it
    if (uploadError.message?.includes("not found") || uploadError.message?.includes("Bucket")) {
      await adminSupabase.storage.createBucket("community-images", {
        public: true,
        fileSizeLimit: 10 * 1024 * 1024,
        allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/avif"],
      });

      // Retry upload
      const { error: retryError } = await adminSupabase.storage
        .from("community-images")
        .upload(path, buffer, {
          contentType: file.type,
          upsert: false,
        });

      if (retryError) {
        return NextResponse.json({ error: retryError.message }, { status: 500 });
      }
    } else {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }
  }

  const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/community-images/${path}`;

  return NextResponse.json({ url: publicUrl });
}
