import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ImportClient from "./ImportClient";

export const metadata: Metadata = {
  title: "Import Journal",
  description:
    "Bring your old fishing journal into Executive Angler. Use AI to format your data and import it in minutes.",
};

export default async function ImportPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/journal/import");

  return <ImportClient />;
}
