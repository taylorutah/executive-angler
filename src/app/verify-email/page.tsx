import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { POST_LOGIN_PATH } from "@/lib/auth-paths";
import { Mail } from "@/icons";
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
    <div className="min-h-screen bg-[var(--paper)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="ea-card text-center">
          <div className="mx-auto w-14 h-14 rounded-[var(--radius-card)] bg-[var(--accent-soft)] flex items-center justify-center mb-4">
            <Mail className="h-7 w-7 text-[var(--accent)]" />
          </div>
          <h1 className="font-display text-2xl font-semibold text-[var(--text-1)] mb-3">
            Confirm your email
          </h1>
          <p className="text-[var(--text-2)] mb-2">
            We sent a confirmation link to{" "}
            <span className="font-medium text-[var(--text-1)]">{user.email}</span>.
          </p>
          <p className="text-sm text-[var(--text-3)] mb-6">
            Click the link in that email to unlock your journal, fly box, and feed. Check spam if you don&apos;t see it within a minute.
          </p>

          <ResendButton email={user.email || ""} />

          <p className="text-xs text-[var(--text-3)] mt-6">
            Wrong address?{" "}
            <Link href="/account" className="text-[var(--accent)] hover:underline">
              Update it in Account
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
