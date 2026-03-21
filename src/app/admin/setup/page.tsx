import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";
import SetupClient from "./SetupClient";

export default async function AdminSetupPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdmin(user.email)) redirect("/dashboard");

  // Check which schema pieces exist
  const checks: Record<string, boolean> = {};

  // profiles.is_premium
  const { error: e1 } = await supabase.from("profiles").select("is_premium").limit(1);
  checks["profiles.is_premium"] = !e1;

  // profiles.is_banned
  const { error: e2 } = await supabase.from("profiles").select("is_banned").limit(1);
  checks["profiles.is_banned"] = !e2;

  // admin_audit_log table
  const { error: e3 } = await supabase.from("admin_audit_log").select("id").limit(1);
  checks["admin_audit_log"] = !e3;

  // admin_user_notes table
  const { error: e4 } = await supabase.from("admin_user_notes").select("id").limit(1);
  checks["admin_user_notes"] = !e4;

  const allGood = Object.values(checks).every(Boolean);

  return <SetupClient checks={checks} allGood={allGood} />;
}
