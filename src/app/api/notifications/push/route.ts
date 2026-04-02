import { NextRequest, NextResponse } from "next/server";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { SignJWT, importPKCS8 } from "jose";

/**
 * POST /api/notifications/push
 *
 * Sends APNs push notifications to a user's registered devices.
 * Called internally by other API routes (email/route.ts, etc.) when
 * a notification event occurs (follow, comment, like, message).
 *
 * Body: {
 *   recipientId: string,    // user_id to send to
 *   title: string,          // notification title
 *   body: string,           // notification body
 *   data?: object,          // custom payload (e.g. { type, sessionId })
 *   badge?: number,         // badge count
 * }
 *
 * Secured by: WEBHOOK_SECRET header (for internal calls)
 * Requires: APNS_AUTH_KEY, APNS_KEY_ID, APNS_TEAM_ID env vars
 */

const APNS_HOST = process.env.NODE_ENV === "production"
  ? "https://api.push.apple.com"
  : "https://api.sandbox.push.apple.com";

const BUNDLE_ID = "com.taylorwarnick.executiveangler";

/* ── Singletons ── */

let _supabaseAdmin: SupabaseClient | null = null;
function getSupabaseAdmin() {
  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return _supabaseAdmin;
}

/* ── APNs JWT Token ── */

let _cachedJWT: { token: string; expiresAt: number } | null = null;

async function getAPNsJWT(): Promise<string> {
  // APNs tokens are valid for 60 min; we refresh at 50 min
  if (_cachedJWT && Date.now() < _cachedJWT.expiresAt) {
    return _cachedJWT.token;
  }

  const keyId = process.env.APNS_KEY_ID;
  const teamId = process.env.APNS_TEAM_ID;
  const authKey = process.env.APNS_AUTH_KEY;

  if (!keyId || !teamId || !authKey) {
    throw new Error("Missing APNs configuration (APNS_KEY_ID, APNS_TEAM_ID, APNS_AUTH_KEY)");
  }

  // The auth key may be stored with literal \n — convert to real newlines
  const pemKey = authKey.replace(/\\n/g, "\n");

  const privateKey = await importPKCS8(pemKey, "ES256");

  const now = Math.floor(Date.now() / 1000);
  const token = await new SignJWT({})
    .setProtectedHeader({ alg: "ES256", kid: keyId })
    .setIssuer(teamId)
    .setIssuedAt(now)
    .sign(privateKey);

  _cachedJWT = {
    token,
    expiresAt: Date.now() + 50 * 60 * 1000, // 50 minutes
  };

  return token;
}

/* ── Send Push ── */

async function sendPush(
  deviceToken: string,
  payload: { title: string; body: string; data?: Record<string, unknown>; badge?: number }
): Promise<{ success: boolean; token: string; error?: string }> {
  try {
    const jwt = await getAPNsJWT();

    const apnsPayload = {
      aps: {
        alert: {
          title: payload.title,
          body: payload.body,
        },
        sound: "default",
        ...(payload.badge !== undefined ? { badge: payload.badge } : {}),
      },
      ...(payload.data || {}),
    };

    const response = await fetch(`${APNS_HOST}/3/device/${deviceToken}`, {
      method: "POST",
      headers: {
        Authorization: `bearer ${jwt}`,
        "apns-topic": BUNDLE_ID,
        "apns-push-type": "alert",
        "apns-priority": "10",
        "apns-expiration": "0",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(apnsPayload),
    });

    if (response.ok) {
      return { success: true, token: deviceToken };
    }

    const errorBody = await response.json().catch(() => ({}));
    const reason = (errorBody as { reason?: string }).reason || `HTTP ${response.status}`;

    // If the token is invalid/unregistered, we should clean it up
    if (response.status === 410 || reason === "Unregistered" || reason === "BadDeviceToken") {
      console.log(`[PUSH] Removing stale token ${deviceToken.substring(0, 8)}...`);
      const admin = getSupabaseAdmin();
      await admin.from("device_tokens").delete().eq("token", deviceToken);
    }

    return { success: false, token: deviceToken, error: reason };
  } catch (err) {
    return { success: false, token: deviceToken, error: String(err) };
  }
}

/* ── FCM Push (Android) ── */

async function getFCMAccessToken(): Promise<string> {
  const serviceAccount = process.env.FCM_SERVICE_ACCOUNT_JSON;
  if (!serviceAccount) {
    throw new Error("Missing FCM_SERVICE_ACCOUNT_JSON env var");
  }

  const sa = JSON.parse(serviceAccount);
  const now = Math.floor(Date.now() / 1000);

  const pemKey = sa.private_key.replace(/\\n/g, "\n");
  const privateKey = await importPKCS8(pemKey, "RS256");

  const token = await new SignJWT({
    iss: sa.client_email,
    sub: sa.client_email,
    aud: "https://oauth2.googleapis.com/token",
    scope: "https://www.googleapis.com/auth/firebase.messaging",
  })
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .setIssuedAt(now)
    .setExpirationTime(now + 3600)
    .sign(privateKey);

  // Exchange JWT for OAuth2 access token
  const resp = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${token}`,
  });

  if (!resp.ok) {
    throw new Error(`FCM OAuth failed: ${resp.status}`);
  }

  const data = await resp.json();
  return (data as { access_token: string }).access_token;
}

let _cachedFCMToken: { token: string; expiresAt: number } | null = null;

async function getCachedFCMToken(): Promise<string> {
  if (_cachedFCMToken && Date.now() < _cachedFCMToken.expiresAt) {
    return _cachedFCMToken.token;
  }
  const token = await getFCMAccessToken();
  _cachedFCMToken = { token, expiresAt: Date.now() + 50 * 60 * 1000 };
  return token;
}

async function sendFCMPush(
  fcmToken: string,
  payload: { title: string; body: string; data?: Record<string, unknown>; badge?: number }
): Promise<{ success: boolean; token: string; error?: string }> {
  try {
    const serviceAccount = process.env.FCM_SERVICE_ACCOUNT_JSON;
    if (!serviceAccount) {
      return { success: false, token: fcmToken, error: "FCM not configured" };
    }

    const sa = JSON.parse(serviceAccount);
    const projectId = sa.project_id;
    const accessToken = await getCachedFCMToken();

    const fcmPayload = {
      message: {
        token: fcmToken,
        notification: {
          title: payload.title,
          body: payload.body,
        },
        data: payload.data
          ? Object.fromEntries(
              Object.entries(payload.data).map(([k, v]) => [k, String(v)])
            )
          : undefined,
        android: {
          priority: "high" as const,
          notification: {
            channel_id: "social",
            sound: "default",
          },
        },
      },
    };

    const response = await fetch(
      `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fcmPayload),
      }
    );

    if (response.ok) {
      return { success: true, token: fcmToken };
    }

    const errorBody = await response.json().catch(() => ({}));
    const errorDetails = errorBody as { error?: { message?: string; status?: string } };
    const reason = errorDetails.error?.message || `HTTP ${response.status}`;

    // Remove invalid tokens
    if (
      errorDetails.error?.status === "NOT_FOUND" ||
      reason.includes("not a valid FCM registration token")
    ) {
      console.log(`[FCM] Removing stale token ${fcmToken.substring(0, 8)}...`);
      const admin = getSupabaseAdmin();
      await admin.from("device_tokens").delete().eq("token", fcmToken);
    }

    return { success: false, token: fcmToken, error: reason };
  } catch (err) {
    return { success: false, token: fcmToken, error: String(err) };
  }
}

/* ── Route Handler ── */

export async function POST(req: NextRequest) {
  try {
    // Verify internal caller via webhook secret
    const webhookSecret = process.env.WEBHOOK_SECRET;
    if (webhookSecret) {
      const authHeader = req.headers.get("x-webhook-secret") || req.headers.get("authorization");
      if (authHeader !== webhookSecret && authHeader !== `Bearer ${webhookSecret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const body = await req.json();
    const { recipientId, title, body: notifBody, data, badge } = body as {
      recipientId: string;
      title: string;
      body: string;
      data?: Record<string, unknown>;
      badge?: number;
    };

    if (!recipientId || !title || !notifBody) {
      return NextResponse.json(
        { error: "Missing required fields: recipientId, title, body" },
        { status: 400 }
      );
    }

    // Fetch all device tokens for the recipient (iOS + Android)
    const admin = getSupabaseAdmin();
    const { data: tokens, error } = await admin
      .from("device_tokens")
      .select("token, platform")
      .eq("user_id", recipientId);

    if (error) {
      console.error("[PUSH] Failed to fetch device tokens:", error.message);
      return NextResponse.json({ error: "Failed to fetch device tokens" }, { status: 500 });
    }

    if (!tokens?.length) {
      return NextResponse.json({
        sent: 0,
        reason: "No registered devices for user",
      });
    }

    const iosTokens = tokens.filter((t) => t.platform === "ios");
    const androidTokens = tokens.filter((t) => t.platform === "android");

    // Send to all devices in parallel
    const pushPayload = { title, body: notifBody, data, badge };
    const results = await Promise.all([
      ...iosTokens.map((t) => sendPush(t.token, pushPayload)),
      ...androidTokens.map((t) => sendFCMPush(t.token, pushPayload)),
    ]);

    const succeeded = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success);

    if (failed.length > 0) {
      console.error(
        `[PUSH] ${failed.length} delivery failures:`,
        failed.map((f) => `${f.token.substring(0, 8)}...: ${f.error}`)
      );
    }

    console.log(
      `[PUSH] Sent ${succeeded}/${tokens.length} (${iosTokens.length} iOS, ${androidTokens.length} Android) to user ${recipientId.substring(0, 8)}...`
    );

    return NextResponse.json({
      sent: succeeded,
      total: tokens.length,
      failures: failed.map((f) => ({ token: f.token.substring(0, 8), error: f.error })),
    });
  } catch (err) {
    console.error("[PUSH ERROR]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
