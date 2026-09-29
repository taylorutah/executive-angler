import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import NewFlyPatternClient from "./NewFlyPatternClient";

export default async function NewFlyPatternPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/journal/flies/new");

  return <NewFlyPatternClient />;
}
