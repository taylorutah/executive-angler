import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";
import AdminFlySubmissionsClient from "./AdminFlySubmissionsClient";

export const metadata: Metadata = {
  title: "Fly Submissions — Admin",
  description: "Review and approve community fly pattern submissions.",
};

export default async function AdminFlySubmissionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdmin(user.email)) redirect("/dashboard");

  return <AdminFlySubmissionsClient />;
}
