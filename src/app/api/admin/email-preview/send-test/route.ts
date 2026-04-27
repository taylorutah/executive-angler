import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";
import { sendBrandedEmail } from "@/lib/email/client";
import { EMAIL_SAMPLES } from "@/app/admin/email-preview/samples";

/**
 * POST /api/admin/email-preview/send-test
 * Body: { key: string, to?: string }
 *
 * Sends one of the EMAIL_SAMPLES fixtures via Resend so admins can verify
 * production rendering in actual inbox clients (Gmail, iOS Mail, etc.).
 * Admin only.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { key, to } = (await request.json()) as { key?: string; to?: string };

  if (!key) {
    return NextResponse.json({ error: "Missing template key" }, { status: 400 });
  }

  const sample = EMAIL_SAMPLES.find((s) => s.key === key);
  if (!sample) {
    return NextResponse.json(
      { error: `Unknown template key: ${key}` },
      { status: 400 }
    );
  }

  const recipient =
    typeof to === "string" && to.includes("@") ? to : user.email;

  if (!recipient) {
    return NextResponse.json(
      { error: "No recipient email available" },
      { status: 400 }
    );
  }

  const result = await sendBrandedEmail({
    tag: `test_${key}`,
    to: recipient,
    ...sample.content,
  });

  return NextResponse.json(
    { ...result, recipient },
    { status: result.sent ? 200 : 502 }
  );
}
