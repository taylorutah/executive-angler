import { createStaticClient } from "@/lib/supabase/static";
import { withRetry } from "./retry";

export interface ApprovedPhoto {
  id: string;
  photoUrl: string;
  caption?: string;
  submitterName: string;
  cameraBody?: string;
  lens?: string;
  aperture?: string;
  shutterSpeed?: string;
  iso?: string;
  submittedAt: string;
}

export async function getApprovedPhotosByEntity(
  entityType: "river" | "species" | "destination",
  entityId: string
): Promise<ApprovedPhoto[]> {
  return withRetry(async () => {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("photo_submissions")
      .select(
        "id, photo_url, caption, submitter_name, camera_body, lens, aperture, shutter_speed, iso, submitted_at"
      )
      .eq("entity_type", entityType)
      .eq("entity_id", entityId)
      .eq("status", "approved")
      .order("submitted_at", { ascending: false });

    if (error) {
      console.error("[getApprovedPhotosByEntity] Supabase error:", error);
      throw error;
    }

    return (data ?? []).map((row) => ({
      id: row.id as string,
      photoUrl: row.photo_url as string,
      caption: (row.caption as string) || undefined,
      submitterName: row.submitter_name as string,
      cameraBody: (row.camera_body as string) || undefined,
      lens: (row.lens as string) || undefined,
      aperture: (row.aperture as string) || undefined,
      shutterSpeed: (row.shutter_speed as string) || undefined,
      iso: (row.iso as string) || undefined,
      submittedAt: row.submitted_at as string,
    }));
  }, `getApprovedPhotosByEntity:${entityType}:${entityId}`).catch((err) => {
    console.error(
      `[getApprovedPhotosByEntity] All retries failed for ${entityType}:${entityId}:`,
      err
    );
    return [];
  });
}
