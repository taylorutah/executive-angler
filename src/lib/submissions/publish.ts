import { createClient } from "@supabase/supabase-js";

/**
 * Publish a community submission to the appropriate entity table.
 * Called after admin approves a submission.
 */
export async function publishSubmission(submission: Record<string, unknown>): Promise<{ slug: string; error?: string }> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const slug = generateSlug(submission.name as string);
  const entityType = submission.entity_type as string;
  const entityData = (submission.entity_data || {}) as Record<string, unknown>;

  try {
    switch (entityType) {
      case "river": {
        const { error } = await supabase.from("rivers").insert({
          id: slug,
          slug,
          name: submission.name,
          description: submission.description,
          hero_image_url: submission.hero_image_url,
          latitude: submission.latitude,
          longitude: submission.longitude,
          state: submission.state,
          primary_species: entityData.primary_species || [],
          difficulty: entityData.difficulty || null,
          flow_type: entityData.water_type || entityData.flow_type || null,
          regulations: entityData.regulations || null,
          best_months: entityData.season ? [entityData.season] : [],
          access_points: entityData.access_points || null,
          meta_title: `${submission.name} — Fly Fishing`,
          meta_description: (submission.short_description || (submission.description as string)?.slice(0, 160)) as string,
        });
        if (error) return { slug, error: error.message };
        break;
      }

      case "fly_shop": {
        const { error } = await supabase.from("fly_shops").insert({
          slug,
          name: submission.name,
          description: submission.description,
          hero_image_url: submission.hero_image_url,
          address: submission.address,
          latitude: submission.latitude,
          longitude: submission.longitude,
          phone: submission.phone,
          website_url: submission.website,
          services: entityData.services || [],
          brands_carried: entityData.brands || [],
          meta_title: `${submission.name} — Fly Shop`,
          meta_description: (submission.short_description || (submission.description as string)?.slice(0, 160)) as string,
        });
        if (error) return { slug, error: error.message };
        break;
      }

      case "guide": {
        const { error } = await supabase.from("guides").insert({
          slug,
          name: submission.name,
          bio: submission.description,
          photo_url: submission.hero_image_url,
          latitude: submission.latitude,
          longitude: submission.longitude,
          phone: submission.phone,
          email: submission.email,
          website_url: submission.website,
          specialties: entityData.specialties || [],
          daily_rate: entityData.price_range || null,
          years_experience: entityData.experience_years || null,
          meta_title: `${submission.name} — Fishing Guide`,
          meta_description: (submission.short_description || (submission.description as string)?.slice(0, 160)) as string,
        });
        if (error) return { slug, error: error.message };
        break;
      }

      case "lodge": {
        const { error } = await supabase.from("lodges").insert({
          slug,
          name: submission.name,
          description: submission.description,
          hero_image_url: submission.hero_image_url,
          address: submission.address,
          latitude: submission.latitude,
          longitude: submission.longitude,
          phone: submission.phone,
          email: submission.email,
          website_url: submission.website,
          amenities: entityData.amenities || [],
          price_range: entityData.price_range || null,
          capacity: entityData.capacity || null,
          meta_title: `${submission.name} — Fishing Lodge`,
          meta_description: (submission.short_description || (submission.description as string)?.slice(0, 160)) as string,
        });
        if (error) return { slug, error: error.message };
        break;
      }

      case "destination": {
        const { error } = await supabase.from("destinations").insert({
          slug,
          name: submission.name,
          description: submission.description,
          hero_image_url: submission.hero_image_url,
          state: submission.state,
          region: submission.region,
          country: submission.country || "US",
          latitude: submission.latitude,
          longitude: submission.longitude,
          best_months: entityData.best_months || [],
          primary_species: entityData.species || [],
          tagline: submission.short_description,
          meta_title: `${submission.name} — Fly Fishing Destination`,
          meta_description: (submission.short_description || (submission.description as string)?.slice(0, 160)) as string,
        });
        if (error) return { slug, error: error.message };
        break;
      }

      case "species": {
        const { error } = await supabase.from("species").insert({
          slug,
          common_name: submission.name,
          scientific_name: entityData.scientific_name || null,
          family: entityData.family || null,
          description: submission.description,
          image_url: submission.hero_image_url,
          preferred_habitat: entityData.habitat || null,
          average_size: entityData.avg_size || null,
          record_size: entityData.record_size || null,
          preferred_flies: entityData.preferred_flies || [],
          native_range: entityData.range || null,
          meta_title: `${submission.name} — Fish Species`,
          meta_description: (submission.short_description || (submission.description as string)?.slice(0, 160)) as string,
        });
        if (error) return { slug, error: error.message };
        break;
      }

      case "feedback":
        // Feedback doesn't publish to a table — it's just tracked in submissions
        return { slug: "" };

      default:
        return { slug, error: `Unknown entity type: ${entityType}` };
    }

    // Update submission with published entity ID
    await supabase
      .from("community_submissions")
      .update({
        status: "published",
        published_entity_id: slug,
        published_at: new Date().toISOString(),
      })
      .eq("id", submission.id);

    return { slug };
  } catch (e) {
    return { slug, error: e instanceof Error ? e.message : "Unknown publish error" };
  }
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
