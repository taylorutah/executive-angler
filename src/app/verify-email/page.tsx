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
    <div className="bg-[var(--paper)]">
      <div className="desk-sheet">
        <div className="desk-form">
          <h1
            className="font-heading text-[32px] font-semibold leading-[36px] text-[var(--text-primary)] sm:text-[48px] sm:leading-[56px]"
            style={{ fontVariationSettings: '"SOFT" 0, "WONK" 1' }}
          >
            Confirm your email
          </h1>
          <p className="desk-dek-ui mt-3">
            We sent a confirmation link to{" "}
            <span className="font-mono text-[var(--text-primary)]">{user.email}</span>.
          </p>
          <p className="mt-3 font-ui text-sm text-[var(--text-meta)]">
            Click the link in that email to unlock your journal, fly box, and feed. Check spam if you don&apos;t see it within a minute.
          </p>
          <div className="mt-8">
            <ResendButton email={user.email || ""} />
          </div>
          <p className="mt-6 font-ui text-sm text-[var(--text-meta)]">
            Wrong address?{" "}
            <Link
              href="/account"
              className="hover-copper text-[var(--action)] underline underline-offset-4"
            >
              Update it in Account
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
