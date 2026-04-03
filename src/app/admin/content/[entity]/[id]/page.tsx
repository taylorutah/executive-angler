import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getEntityConfig } from "@/lib/admin/entity-config";
import EditEntityClient from "./EditEntityClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ entity: string; id: string }>;
}): Promise<Metadata> {
  const { entity } = await params;
  const config = getEntityConfig(entity);
  return {
    title: `Edit ${config?.labelSingular ?? "Entity"} — Admin | Executive Angler`,
  };
}

export default async function AdminEntityEditPage({
  params,
}: {
  params: Promise<{ entity: string; id: string }>;
}) {
  const { entity, id } = await params;
  const config = getEntityConfig(entity);
  if (!config) redirect("/admin/content");

  return (
    <EditEntityClient
      entitySlug={config.slug}
      entityLabel={config.labelSingular}
      fields={config.fields}
      table={config.table}
      entityId={id}
    />
  );
}
