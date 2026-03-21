import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SubmissionForm from "./SubmissionForm";

const VALID_TYPES = ["river", "fly_shop", "guide", "lodge", "destination", "species"];
const TYPE_LABELS: Record<string, string> = {
  river: "River or Stream",
  fly_shop: "Fly Shop",
  guide: "Fishing Guide",
  lodge: "Lodge or Resort",
  destination: "Destination",
  species: "Species",
};

export async function generateMetadata({ params }: { params: Promise<{ entityType: string }> }): Promise<Metadata> {
  const { entityType } = await params;
  const label = TYPE_LABELS[entityType] || "Entity";
  return {
    title: `Add ${label} — Contribute — Executive Angler`,
    description: `Submit a new ${label.toLowerCase()} to Executive Angler.`,
  };
}

export default async function SubmissionPage({ params }: { params: Promise<{ entityType: string }> }) {
  const { entityType } = await params;
  if (!VALID_TYPES.includes(entityType)) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?redirect=/contribute/${entityType}`);

  return (
    <SubmissionForm
      entityType={entityType}
      entityLabel={TYPE_LABELS[entityType]}
      userId={user.id}
    />
  );
}
