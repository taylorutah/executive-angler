import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse form data
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const catchId = formData.get("catchId") as string | null;

    if (!file || !catchId) {
      return NextResponse.json({ error: "Missing file or catchId" }, { status: 400 });
    }

    // Upload to Supabase Storage using service role client
    const serviceClient = createServiceClient(supabaseUrl, supabaseServiceKey);
    const timestamp = Date.now();
    const filePath = `${user.id}/${catchId}-${timestamp}.jpg`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await serviceClient.storage
      .from("fish-images")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      const isPayloadTooLarge =
        uploadError.message?.includes("Payload too large") ||
        uploadError.message?.includes("exceeds the maximum") ||
        uploadError.message?.includes("413");
      const message = isPayloadTooLarge
        ? "Photo is too large (max 5 MB). Please use a smaller image."
        : `Upload failed: ${uploadError.message}`;
      return NextResponse.json({ error: message }, { status: isPayloadTooLarge ? 413 : 500 });
    }

    // Get public URL
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/fish-images/${filePath}`;

    // Fetch existing photo URLs for this catch
    const { data: existingCatch } = await supabase
      .from("catches")
      .select("fish_image_url, fish_image_urls")
      .eq("id", catchId)
      .eq("user_id", user.id)
      .single();

    const existingUrls: string[] = existingCatch?.fish_image_urls
      || (existingCatch?.fish_image_url ? [existingCatch.fish_image_url] : []);
    const updatedUrls = [...existingUrls, publicUrl].slice(0, 3); // max 3 photos

    // Update catches table — both singular (primary) and array (all photos)
    const { error: updateError } = await supabase
      .from("catches")
      .update({
        fish_image_url: updatedUrls[0] || publicUrl,
        fish_image_urls: updatedUrls,
      })
      .eq("id", catchId)
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Database update error:", updateError);
      return NextResponse.json({ error: "Failed to update catch" }, { status: 500 });
    }

    return NextResponse.json({ url: publicUrl, urls: updatedUrls });
  } catch (error) {
    console.error("Photo upload error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
