import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { normalizeEmail } from "@/lib/email-validation";

/**
 * POST /api/auth/preflight
 *
 * Hardened pre-check before Supabase signUp(). The client form calls this
 * first; only if it returns { ok: true } do we proceed to supabase.auth.signUp.
 *
 * Checks (fail-closed):
 *   - Per-IP rate limit (MAX_SIGNUPS_PER_IP_PER_DAY)
 *   - Cloudflare Turnstile token verification
 *   - Disposable email domain blocklist
 *   - Gmail dot-trick collision against an existing normalized email
 *
 * Every attempt — accepted or rejected — gets logged to signup_audit
 * for forensics and tuning.
 */

const MAX_SIGNUPS_PER_IP_PER_DAY = 3;

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function getClientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

async function hashIp(ip: string): Promise<string> {
  const salt = process.env.PHOTO_REVIEW_SECRET ?? "";
  const enc = new TextEncoder().encode(ip + salt);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 32);
}

async function verifyTurnstile(token: string, ip: string): Promise<"ok" | "fail" | "unconfigured"> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  // If the secret isn't configured in this env, return "unconfigured" so the
  // caller can decide policy. We want fail-CLOSED in prod, but during the
  // initial rollout (before TURNSTILE_SECRET_KEY lands in Vercel) we accept
  // and log so legitimate users aren't blocked.
  if (!secret) return "unconfigured";
  if (!token) return "fail";

  const body = new URLSearchParams({ secret, response: token, remoteip: ip });
  const res = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    }
  );
  if (!res.ok) return "fail";
  const data = (await res.json()) as { success?: boolean };
  return data.success === true ? "ok" : "fail";
}

type Outcome =
  | "accepted"
  | "rate_limited"
  | "captcha_failed"
  | "disposable_email"
  | "duplicate_collision"
  | "other_reject";

async function logAttempt(args: {
  ipHash: string;
  emailNormalized: string | null;
  outcome: Outcome;
  reason: string | null;
  ua: string | null;
  country: string | null;
}) {
  try {
    await getServiceClient().from("signup_audit").insert({
      ip_hash: args.ipHash,
      email_normalized: args.emailNormalized,
      outcome: args.outcome,
      reason: args.reason,
      user_agent: args.ua,
      country: args.country,
    });
  } catch (err) {
    console.warn("[preflight] audit insert failed:", err);
  }
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const ipHash = await hashIp(ip);
  const ua = req.headers.get("user-agent");
  const country = req.headers.get("x-vercel-ip-country");

  let body: { email?: string; captchaToken?: string } = {};
  try {
    body = (await req.json()) as { email?: string; captchaToken?: string };
  } catch {
    // fall through — handled below
  }

  const emailRaw = body.email || "";
  const captchaToken = body.captchaToken || "";
  const { normalized, domain, isDisposable, isValid } = normalizeEmail(emailRaw);

  if (!isValid) {
    await logAttempt({
      ipHash,
      emailNormalized: null,
      outcome: "other_reject",
      reason: "invalid_email_shape",
      ua,
      country,
    });
    return NextResponse.json({ ok: false, error: "Enter a valid email." }, { status: 400 });
  }

  // 1. Per-IP rate limit (sliding 24h window)
  const sb = getServiceClient();
  const since = new Date(Date.now() - 86_400_000).toISOString();
  const { count } = await sb
    .from("signup_audit")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("attempted_at", since);
  if ((count ?? 0) >= MAX_SIGNUPS_PER_IP_PER_DAY) {
    await logAttempt({
      ipHash,
      emailNormalized: normalized,
      outcome: "rate_limited",
      reason: `ip exceeded ${MAX_SIGNUPS_PER_IP_PER_DAY}/day`,
      ua,
      country,
    });
    return NextResponse.json(
      { ok: false, error: "Too many signups from this network. Try again tomorrow." },
      { status: 429 }
    );
  }

  // 2. Turnstile (fail-closed when secret is configured, soft-fail-open when
  // it isn't — the other defenses still apply). When TURNSTILE_SECRET_KEY
  // lands in Vercel this automatically tightens to fail-closed.
  //
  // Mobile clients send `X-EA-Client: ios|android` and skip captcha entirely
  // (Apple/Google handle bot defense at the store level; the rate-limit +
  // disposable + dot-trick checks below still apply). The header is
  // trivially spoofable from web, so we don't depend on it for security —
  // the IP rate limit (3/day) is the real backstop against bursts.
  const eaClient = (req.headers.get("x-ea-client") || "").toLowerCase();
  const isMobileClient = eaClient === "ios" || eaClient === "android";
  const captchaState = isMobileClient ? "ok" : await verifyTurnstile(captchaToken, ip);
  if (captchaState === "fail") {
    await logAttempt({
      ipHash,
      emailNormalized: normalized,
      outcome: "captcha_failed",
      reason: captchaToken ? "verify_returned_false" : "no_token",
      ua,
      country,
    });
    return NextResponse.json(
      { ok: false, error: "Captcha verification failed. Refresh and try again." },
      { status: 400 }
    );
  }
  if (captchaState === "unconfigured") {
    console.warn("[preflight] TURNSTILE_SECRET_KEY not set — signup accepted without captcha verification.");
  }

  // 3. Disposable domain blocklist
  if (isDisposable) {
    await logAttempt({
      ipHash,
      emailNormalized: normalized,
      outcome: "disposable_email",
      reason: domain,
      ua,
      country,
    });
    return NextResponse.json(
      { ok: false, error: "Disposable email addresses aren't allowed. Use your real email." },
      { status: 400 }
    );
  }

  // 4. Collision: normalized email already used (catches Gmail dot tricks)
  // We compare against a profiles.email_normalized column if it exists, OR
  // against past accepted signups in signup_audit as a soft check.
  const { count: collisionCount } = await sb
    .from("signup_audit")
    .select("id", { count: "exact", head: true })
    .eq("email_normalized", normalized)
    .eq("outcome", "accepted");
  if ((collisionCount ?? 0) > 0) {
    await logAttempt({
      ipHash,
      emailNormalized: normalized,
      outcome: "duplicate_collision",
      reason: "normalized_email_already_used",
      ua,
      country,
    });
    return NextResponse.json(
      {
        ok: false,
        error:
          "An account already exists for this email. Try signing in, or use a different address.",
      },
      { status: 409 }
    );
  }

  // All checks passed.
  await logAttempt({
    ipHash,
    emailNormalized: normalized,
    outcome: "accepted",
    reason: null,
    ua,
    country,
  });
  return NextResponse.json({ ok: true });
}
