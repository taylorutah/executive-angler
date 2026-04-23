import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { checkPremium } from "@/lib/admin";
import ImportClient from "./ImportClient";

export const metadata: Metadata = {
  title: "Import Journal — Executive Angler",
  description:
    "Bring your old fishing journal into Executive Angler. Use AI to format your data and import it in minutes.",
};

export default async function ImportPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/journal/import");

  const isPremium = await checkPremium(supabase, user.id, user.email);
  if (!isPremium) {
    return (
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#161B22] rounded-2xl border border-[#21262D] p-8 text-center">
          <Lock className="h-12 w-12 text-[#E8923A] mx-auto mb-4" />
          <h1 className="text-xl font-bold text-[#F0F6FC] mb-2">Pro Feature</h1>
          <p className="text-sm text-[#A8B2BD] mb-6">
            Journal import (CSV) is available with Executive Angler Pro.
            Migrate your full fishing history in minutes.
          </p>
          <Link
            href="/account"
            className="inline-flex items-center gap-2 bg-[#E8923A] text-white font-semibold rounded-xl px-6 py-3 hover:bg-[#d4822e] transition-colors"
          >
            Upgrade to Pro
          </Link>
        </div>
      </div>
    );
  }

  return <ImportClient />;
}
