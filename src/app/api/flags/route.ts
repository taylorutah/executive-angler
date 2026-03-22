import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/flags — Submit a community flag/report
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { entity_type, entity_id, reason, details } = await request.json();

  if (!entity_type || !entity_id || !reason) {
    return NextResponse.json({ error: "entity_type, entity_id, and reason are required" }, { status: 400 });
  }

  // Check for duplicate flags from same user on same entity
  const { data: existing } = await supabase
    .from("community_flags")
    .select("id")
    .eq("reporter_id", user.id)
    .eq("entity_type", entity_type)
    .eq("entity_id", entity_id)
    .eq("status", "open")
    .limit(1);

  if (existing && existing.length > 0) {
    return NextResponse.json({ error: "You've already reported this. We're reviewing it." }, { status: 409 });
  }

  const { error } = await supabase.from("community_flags").insert({
    reporter_id: user.id,
    entity_type,
    entity_id,
    reason,
    details,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Notify admin
  try {
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "Executive Angler <noreply@executiveangler.com>",
          to: [process.env.ADMIN_EMAIL || "taylor@executiveangler.com"],
          subject: `Flag: ${reason} on ${entity_type} (${entity_id})`,
          html: `<p>A user flagged a ${entity_type} as <strong>${reason}</strong>.</p>
                 <p>Entity: ${entity_id}</p>
                 ${details ? `<p>Details: ${details}</p>` : ""}
                 <p><a href="https://www.executiveangler.com/admin">Review in Admin →</a></p>`,
        }),
      });
    }
  } catch { /* ignore */ }

  return NextResponse.json({ success: true });
}
