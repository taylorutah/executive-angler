import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const s = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

async function main() {
  const { data, error } = await s
    .from("rivers")
    .select(
      "slug, name, description, destination_id, hero_image_url, primary_species, flow_type",
    )
    .order("slug");
  if (error) throw error;

  const { data: dests } = await s
    .from("destinations")
    .select("id, name, region, state, country");
  const dMap = new Map((dests ?? []).map((d) => [d.id, d]));

  const rows = data!.map((r) => {
    const d = dMap.get(r.destination_id);
    const firstPara =
      (r.description ?? "").split(/\n|\. /)[0]?.slice(0, 300) ?? "";
    return {
      slug: r.slug,
      name: r.name,
      region: d?.region ?? "",
      state: d?.state ?? "",
      country: d?.country ?? "",
      species: (r.primary_species ?? []).join(", "),
      flowType: r.flow_type,
      descriptionSnippet: firstPara,
      isLocal: r.hero_image_url?.startsWith("/") ?? false,
      currentHero: r.hero_image_url,
    };
  });

  fs.writeFileSync(
    "/tmp/rivers-enriched.json",
    JSON.stringify(rows, null, 2),
  );
  console.log(`Wrote ${rows.length} rivers to /tmp/rivers-enriched.json`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
