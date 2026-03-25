import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";
import AdminPhotosClient from "./AdminPhotosClient";

export const metadata: Metadata = {
  title: "Photo Submissions — Admin | Executive Angler",
  description: "Review and manage community photo submissions.",
};

export default async function AdminPhotosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdmin(user.email)) redirect("/dashboard");

  return <AdminPhotosClient />;
}
