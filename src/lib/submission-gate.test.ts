import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { User } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";
import { checkSubmissionGate } from "./submission-gate.ts";

function request(): NextRequest {
  return {
    headers: {
      get(name: string) {
        if (name === "x-forwarded-for") return "203.0.113.10";
        return null;
      },
    },
  } as NextRequest;
}

function eligibleUser(): User {
  return {
    id: "11111111-1111-1111-1111-111111111111",
    email: "angler@example.com",
    email_confirmed_at: "2020-01-01T00:00:00.000Z",
    created_at: "2020-01-01T00:00:00.000Z",
  } as User;
}

async function gate(turnstileToken: string | null | undefined) {
  return checkSubmissionGate({
    type: "fly_pattern",
    user: eligibleUser(),
    turnstileToken,
    honeypot: null,
    request: request(),
    isAdminSubmitter: false,
  });
}

describe("checkSubmissionGate Turnstile posture", () => {
  it("does not require captcha when turnstileToken is omitted (undefined)", async () => {
    const prevUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const prevKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const prevSecret = process.env.TURNSTILE_SECRET_KEY;
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key";
    delete process.env.TURNSTILE_SECRET_KEY;

    const originalFetch = globalThis.fetch;
    let cloudflareHit = false;
    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.toString()
            : input.url;
      if (url.includes("challenges.cloudflare.com")) {
        cloudflareHit = true;
        throw new Error("tests must not call Cloudflare");
      }
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: {
          "content-type": "application/json",
          "content-range": "0-0/0",
        },
      });
    }) as typeof fetch;

    try {
      const result = await gate(undefined);
      assert.equal(cloudflareHit, false);
      if (!result.ok) {
        assert.notEqual(result.error, "Captcha is required.");
      }
    } finally {
      globalThis.fetch = originalFetch;
      if (prevUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      else process.env.NEXT_PUBLIC_SUPABASE_URL = prevUrl;
      if (prevKey === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY;
      else process.env.SUPABASE_SERVICE_ROLE_KEY = prevKey;
      if (prevSecret === undefined) delete process.env.TURNSTILE_SECRET_KEY;
      else process.env.TURNSTILE_SECRET_KEY = prevSecret;
    }
  });

  it("requires captcha when turnstileToken is an empty string", async () => {
    const result = await gate("");
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.error, "Captcha is required.");
      assert.equal(result.status, 400);
    }
  });

  it("requires captcha when turnstileToken is null", async () => {
    const result = await gate(null);
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.error, "Captcha is required.");
      assert.equal(result.status, 400);
    }
  });
});
