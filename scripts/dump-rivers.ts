import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const s = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

async function main() {
  const { data, error } = await s
    .from("rivers")
    .select("slug, name, destination_id, hero_image_url, primary_species")
    .order("slug");
  if (error) throw error;

  const { data: dests } = await s
    .from("destinations")
    .select("id, name, state, country");
  const dMap = new Map((dests ?? []).map((d) => [d.id, d]));

  const rows = data!.map((r) => {
    const d = dMap.get(r.destination_id);
    const loc = d ? `${d.name}${d.state ? ", " + d.state : ""}` : "—";
    const isLocal = r.hero_image_url?.startsWith("/");
    return {
      slug: r.slug,
      name: r.name,
      location: loc,
      species: (r.primary_species ?? []).join(", "),
      isLocal,
    };
  });

  fs.writeFileSync("/tmp/rivers-inventory.json", JSON.stringify(rows, null, 2));
  console.log(`Wrote ${rows.length} rivers to /tmp/rivers-inventory.json`);
  console.log(`Needs new image: ${rows.filter((r) => !r.isLocal).length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
