import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getEntityConfig } from "@/lib/admin/entity-config";
import CreateEntityClient from "./CreateEntityClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ entity: string }>;
}): Promise<Metadata> {
  const { entity } = await params;
  const config = getEntityConfig(entity);
  return {
    title: `New ${config?.labelSingular ?? "Entity"} — Admin | Executive Angler`,
  };
}

export default async function AdminEntityNewPage({
  params,
}: {
  params: Promise<{ entity: string }>;
}) {
  const { entity } = await params;
  const config = getEntityConfig(entity);
  if (!config) redirect("/admin/content");

  return (
    <CreateEntityClient
      entitySlug={config.slug}
      entityLabel={config.labelSingular}
      fields={config.fields}
      table={config.table}
    />
  );
}
