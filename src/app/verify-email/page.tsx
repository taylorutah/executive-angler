import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { POST_LOGIN_PATH } from "@/lib/auth-paths";
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
    redirect(sp.next && sp.next.startsWith("/") ? sp.next : POST_LOGIN_PATH);
  }

  return (
    <div className="min-h-screen bg-[var(--surface-page)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-[var(--surface-raised)] border border-[var(--border-rule)] rounded-xl shadow-md p-8 text-center">
          <div className="text-4xl mb-4">📬</div>
          <h1 className="font-heading text-2xl font-bold text-[var(--action)] mb-3">
            Confirm your email
          </h1>
          <p className="text-[var(--text-body)] mb-2">
            We sent a confirmation link to{" "}
            <span className="font-mono text-[var(--text-primary)]">{user.email}</span>.
          </p>
          <p className="text-sm text-[var(--text-meta)] mb-6">
            Click the link in that email to unlock your journal, fly box, and feed. Check spam if you don&apos;t see it within a minute.
          </p>

          <ResendButton email={user.email || ""} />

          <p className="text-xs text-[var(--text-meta)] mt-6">
            Wrong address?{" "}
            <Link href="/account" className="text-[var(--action)] hover:underline">
              Update it in Account
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
