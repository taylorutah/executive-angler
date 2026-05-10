import { NextRequest } from "next/server";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { isAdmin } from "@/lib/admin";

export type SubmissionType = "fly_pattern" | "photo" | "review" | "material" | "community";

const RATE_LIMITS: Record<SubmissionType, { perDay: number; ipPerDay: number }> = {
  fly_pattern: { perDay: 5, ipPerDay: 10 },
  photo: { perDay: 10, ipPerDay: 20 },
  review: { perDay: 10, ipPerDay: 20 },
  material: { perDay: 10, ipPerDay: 20 },
  community: { perDay: 10, ipPerDay: 20 },
};

const ACCOUNT_AGE_MIN_HOURS = 24;

let _service: SupabaseClient | null = null;
function service(): SupabaseClient {
  if (!_service) {
    _service = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return _service;
}

export type GateContext = {
  type: SubmissionType;
  user: User;
  // Optional Turnstile token from the client. Present for browser submissions,
  // absent for server-side / iOS / API client paths — those skip Turnstile.
  turnstileToken?: string | null;
  // Hidden honeypot field value. Real users leave it empty; bots fill it.
  honeypot?: string | null;
  request: NextRequest;
  // Submitter is admin → bypass the gate entirely. Caller already has the
  // isAdmin check handy, so passing it explicitly avoids a second lookup.
  isAdminSubmitter?: boolean;
};

export type GateResult =
  | { ok: true; ipHash: string | null }
  | { ok: false; status: number; error: string };

/**
 * Verify a Cloudflare Turnstile token server-side.
 * Returns true if the secret isn't configured (graceful degrade in dev), or
 * if the verification endpoint says success.
 */
async function verifyTurnstile(token: string, ip: string | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;

  const body = new URLSearchParams({ secret, response: token });
  if (ip) body.set("remoteip", ip);

  const res = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    }
  );
  if (!res.ok) return false;
  const data = (await res.json()) as { success?: boolean };
  return data.success === true;
}

function getClientIp(request: NextRequest): string | null {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return request.headers.get("x-real-ip");
}

async function hashIp(ip: string): Promise<string> {
  const enc = new TextEncoder().encode(ip + (process.env.PHOTO_REVIEW_SECRET ?? ""));
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 32);
}

/**
 * Run all submission gates: honeypot → email-verified → account-age →
 * Turnstile → rate limit. Returns ok:true with ipHash if accepted (caller
 * uses ipHash when logging the rate-limit row).
 *
 * Admin submitters bypass the gate entirely.
 */
export async function checkSubmissionGate(ctx: GateContext): Promise<GateResult> {
  const { type, user, turnstileToken, honeypot, request, isAdminSubmitter } = ctx;

  if (isAdminSubmitter || isAdmin(user.email)) {
    return { ok: true, ipHash: null };
  }

  if (honeypot && honeypot.trim() !== "") {
    return { ok: false, status: 400, error: "Submission rejected." };
  }

  if (!user.email_confirmed_at) {
    return {
      ok: false,
      status: 403,
      error: "Please verify your email address before submitting.",
    };
  }

  const createdAt = user.created_at ? new Date(user.created_at).getTime() : 0;
  const ageHours = (Date.now() - createdAt) / 3_600_000;
  if (ageHours < ACCOUNT_AGE_MIN_HOURS) {
    const wait = Math.ceil(ACCOUNT_AGE_MIN_HOURS - ageHours);
    return {
      ok: false,
      status: 403,
      error: `New accounts can submit after ${ACCOUNT_AGE_MIN_HOURS}h. Try again in ~${wait}h.`,
    };
  }

  const ip = getClientIp(request);
  if (turnstileToken !== undefined) {
    if (!turnstileToken) {
      return { ok: false, status: 400, error: "Captcha is required." };
    }
    const ok = await verifyTurnstile(turnstileToken, ip);
    if (!ok) {
      return { ok: false, status: 400, error: "Captcha verification failed." };
    }
  }

  const limit = RATE_LIMITS[type];
  const sb = service();
  const since = new Date(Date.now() - 86_400_000).toISOString();

  const { count: userCount } = await sb
    .from("submission_rate_limits")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("submission_type", type)
    .gte("submitted_at", since);

  if ((userCount ?? 0) >= limit.perDay) {
    return {
      ok: false,
      status: 429,
      error: `You've hit the daily limit for this submission type. Try again tomorrow.`,
    };
  }

  const ipHash = ip ? await hashIp(ip) : null;
  if (ipHash) {
    const { count: ipCount } = await sb
      .from("submission_rate_limits")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .eq("submission_type", type)
      .gte("submitted_at", since);

    if ((ipCount ?? 0) >= limit.ipPerDay) {
      return {
        ok: false,
        status: 429,
        error: `Too many submissions from this network. Try again tomorrow.`,
      };
    }
  }

  return { ok: true, ipHash };
}

/**
 * Log a successful submission to the rate-limit table. Caller invokes this
 * AFTER the submission insert succeeds so failed inserts don't count.
 */
export async function logSubmission(
  type: SubmissionType,
  userId: string,
  ipHash: string | null
): Promise<void> {
  await service()
    .from("submission_rate_limits")
    .insert({ user_id: userId, submission_type: type, ip_hash: ipHash });
}
