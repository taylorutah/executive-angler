import { createStaticClient } from "@/lib/supabase/static";
import { withRetry } from "./retry";

export type PublishedMediaAsset = {
  entityType: string;
  entityId: string;
  columnName: string;
  creditName?: string;
  creditUrl?: string;
  licence?: string;
  licenceUrl?: string;
  sourceUrl?: string;
};

export async function getPublishedMediaAsset(
  entityType: string,
  entityId: string,
  columnName: string,
): Promise<PublishedMediaAsset | undefined> {
  return withRetry(async () => {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("media_assets")
      .select("entity_type, entity_id, column_name, credit_name, credit_url, licence, licence_url, source_url")
      .eq("entity_type", entityType)
      .eq("entity_id", entityId)
      .eq("column_name", columnName)
      .eq("status", "published")
      .maybeSingle();

    if (error) {
      console.error("[getPublishedMediaAsset] Supabase error:", error);
      throw error;
    }
    if (!data) return undefined;
    return {
      entityType: data.entity_type as string,
      entityId: data.entity_id as string,
      columnName: data.column_name as string,
      creditName: (data.credit_name as string | null) ?? undefined,
      creditUrl: (data.credit_url as string | null) ?? undefined,
      licence: (data.licence as string | null) ?? undefined,
      licenceUrl: (data.licence_url as string | null) ?? undefined,
      sourceUrl: (data.source_url as string | null) ?? undefined,
    };
  }, "getPublishedMediaAsset").catch((err) => {
    console.error(`[getPublishedMediaAsset] All retries failed for ${entityType}/${entityId}:`, err);
    return undefined;
  });
}
