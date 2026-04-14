import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PhotoUpdateForm from "./PhotoUpdateForm";

export const metadata: Metadata = {
  title: "Update Listing Photo — Contribute — Executive Angler",
  description: "Submit a hero photo for an existing fly shop, lodge, guide, or river listing.",
};

export default async function PhotoUpdatePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/contribute/photo-update");

  return <PhotoUpdateForm userId={user.id} />;
}
