import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { NextResponse } from "next/server";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "taylor@executiveangler.com";

function getClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

export async function POST(request: Request) {
  const supabase = getClient();
  try {
    const { email, name } = await request.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    const { error } = await supabase.from("waitlist").insert({
      email: email.toLowerCase().trim(),
      name: name?.trim() || null,
      source: "website",
    });

    if (error) {
      // Duplicate email — treat as success so we don't leak info
      if (error.code === "23505") {
        return NextResponse.json({ success: true, already_joined: true });
      }
      console.error("Waitlist insert error:", error);
      return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 500 });
    }

    // Notify admin of new waitlist signup (fire-and-forget)
    const resend = getResend();
    if (resend) {
      const cleanEmail = email.toLowerCase().trim();
      const cleanName = name?.trim() || "—";
      resend.emails.send({
        from: "Executive Angler <noreply@executiveangler.com>",
        to: ADMIN_EMAIL,
        subject: `🎣 New waitlist signup: ${cleanEmail}`,
        html: `<p><strong>${cleanName}</strong> (${cleanEmail}) just joined the Executive Angler waitlist.</p>`,
      }).catch((err) => console.error("[WAITLIST NOTIFY ERROR]", err));
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Waitlist route error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = getClient();
    const { count, error } = await supabase
      .from("waitlist")
      .select("*", { count: "exact", head: true });

    if (error) {
      console.error("Waitlist count error:", error);
      return NextResponse.json({ count: 0 });
    }

    return NextResponse.json({ count: count ?? 0 });
  } catch (err) {
    console.error("Waitlist GET error:", err);
    return NextResponse.json({ count: 0 });
  }
}
