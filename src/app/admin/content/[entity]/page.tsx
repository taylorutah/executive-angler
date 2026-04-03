import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getEntityConfig } from "@/lib/admin/entity-config";
import EntityListClient from "./EntityListClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ entity: string }>;
}): Promise<Metadata> {
  const { entity } = await params;
  const config = getEntityConfig(entity);
  return {
    title: `${config?.label ?? "Entity"} — Admin | Executive Angler`,
  };
}

export default async function AdminEntityListPage({
  params,
}: {
  params: Promise<{ entity: string }>;
}) {
  const { entity } = await params;
  const config = getEntityConfig(entity);
  if (!config) redirect("/admin/content");

  return (
    <EntityListClient
      entitySlug={config.slug}
      entityLabel={config.label}
      fields={config.fields}
      table={config.table}
    />
  );
}
