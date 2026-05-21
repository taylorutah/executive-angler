import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ResendButton from "./ResendButton";

export const metadata = { title: "Verify your email — Executive Angler" };
export const dynamic = "force-dynamic";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }
  if (user.email_confirmed_at) {
    redirect(sp.next && sp.next.startsWith("/") ? sp.next : "/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#0D1117] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-[#161B22] border border-[#21262D] rounded-xl shadow-md p-8 text-center">
          <div className="text-4xl mb-4">📬</div>
          <h1 className="font-heading text-2xl font-bold text-[#E8923A] mb-3">
            Confirm your email
          </h1>
          <p className="text-[#A8B2BD] mb-2">
            We sent a confirmation link to{" "}
            <span className="font-mono text-[#F0F6FC]">{user.email}</span>.
          </p>
          <p className="text-sm text-[#6E7681] mb-6">
            Click the link in that email to unlock your journal, fly box, and feed. Check spam if you don&apos;t see it within a minute.
          </p>

          <ResendButton email={user.email || ""} />

          <p className="text-xs text-[#6E7681] mt-6">
            Wrong address?{" "}
            <Link href="/account" className="text-[#E8923A] hover:underline">
              Update it in Account
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
