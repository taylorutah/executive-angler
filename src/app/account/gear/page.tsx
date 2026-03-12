import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import GearLockerClient from "./GearLockerClient";

export const metadata = { title: "Gear Locker | Executive Angler" };

export default async function GearLockerPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/account/gear");
  return <GearLockerClient />;
}
