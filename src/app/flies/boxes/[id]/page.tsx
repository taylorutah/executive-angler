/**
 * /flies/boxes/[id] — single box detail page.
 * Shows box header (name, tier, description, capacity, stats) + grid of fly entries.
 */
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBoxById, getEntriesInBox } from "@/lib/db/fly-boxes";
import BoxDetailClient from "./BoxDetailClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const box = await getBoxById(id);
  return {
    title: box ? `${box.name} — Fly Box` : "Fly Box",
  };
}

export default async function BoxDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/flies/boxes/${id}`);

  const box = await getBoxById(id);
  if (!box || box.user_id !== user.id) notFound();

  const entries = await getEntriesInBox(id);
  return <BoxDetailClient box={box} initialEntries={entries} />;
}
