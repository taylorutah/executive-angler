import { ImageResponse } from "next/og";

/**
 * /founding OG image — what Reddit, Twitter, iMessage, and Slack unfurl.
 *
 * This image is the hook. If someone pastes the link, they see this before
 * they click — so we optimize for thumbnail-legibility at the smallest size
 * a feed might render (say, ~260px wide in a tweet). That drives the choices:
 *
 *   • Huge price callout ($150) — readable when the image is a postage stamp
 *   • Live seat count — "37 / 50 Left" creates real-time scarcity in the feed
 *   • Minimal copy — no three-line tagline you can't read at thumbnail size
 *   • Copper gradient — brand recognition, not a generic dark-mode SaaS shot
 *
 * Caching: Next's default edge OG route caches aggressively. We set a 5-min
 * revalidate so the seat count moves within a few minutes of a purchase —
 * stale enough to cache across a spike, fresh enough to keep scarcity honest.
 */

export const runtime = "edge";
export const revalidate = 300;
export const alt = "Founding 50 — Lifetime Executive Angler Pro for $150";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Pull the live seat count from the public `founding_seats_remaining` view.
 * The view has GRANT SELECT to anon, so we hit PostgREST directly with the
 * anon key — no cookie context needed, works cleanly on the edge runtime.
 *
 * Falls back to "50 / 50 Left" on any error. Better to render an optimistic
 * number than to 500 on an OG image that's about to be scraped by bots.
 */
async function getSeatCount(): Promise<{ remaining: number; total: number }> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anon) return { remaining: 50, total: 50 };

    const res = await fetch(
      `${url}/rest/v1/founding_seats_remaining?select=total_seats,remaining_seats`,
      {
        headers: {
          apikey: anon,
          Authorization: `Bearer ${anon}`,
        },
        next: { revalidate: 300 },
      }
    );
    if (!res.ok) return { remaining: 50, total: 50 };
    const rows = (await res.json()) as Array<{
      total_seats: number;
      remaining_seats: number;
    }>;
    const row = rows?.[0];
    if (!row) return { remaining: 50, total: 50 };
    return {
      remaining: row.remaining_seats ?? 50,
      total: row.total_seats ?? 50,
    };
  } catch {
    return { remaining: 50, total: 50 };
  }
}

export default async function Image() {
  const { remaining, total } = await getSeatCount();
  const soldOut = remaining <= 0;
  const percentSold = Math.min(100, ((total - remaining) / total) * 100);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#0D1117",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        {/* Copper glow — upper left */}
        <div
          style={{
            position: "absolute",
            top: -200,
            left: -200,
            width: 800,
            height: 800,
            background:
              "radial-gradient(circle, rgba(232,146,58,0.35) 0%, rgba(232,146,58,0) 70%)",
            display: "flex",
          }}
        />
        {/* Teal accent — lower right */}
        <div
          style={{
            position: "absolute",
            bottom: -300,
            right: -300,
            width: 900,
            height: 900,
            background:
              "radial-gradient(circle, rgba(0,180,216,0.18) 0%, rgba(0,180,216,0) 70%)",
            display: "flex",
          }}
        />

        {/* Top brand bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "8px",
            background: "linear-gradient(90deg, #E8923A 0%, #00B4D8 100%)",
            display: "flex",
          }}
        />

        {/* Top eyebrow — brand name */}
        <div
          style={{
            position: "absolute",
            top: 48,
            left: 72,
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 7,
              backgroundColor: "#E8923A",
              display: "flex",
            }}
          />
          <span
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "#E8923A",
              letterSpacing: 5,
              textTransform: "uppercase",
            }}
          >
            Executive Angler
          </span>
        </div>

        {/* Founding badge pill — top right */}
        <div
          style={{
            position: "absolute",
            top: 44,
            right: 72,
            padding: "10px 20px",
            borderRadius: 999,
            backgroundColor: "rgba(232,146,58,0.12)",
            border: "2px solid rgba(232,146,58,0.4)",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span
            style={{
              fontSize: 14,
              fontWeight: 800,
              color: "#E8923A",
              letterSpacing: 3,
              textTransform: "uppercase",
            }}
          >
            ★ Founding 50 · Limited
          </span>
        </div>

        {/* Main block — vertically centered */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 72px",
          }}
        >
          {/* Kicker */}
          <div
            style={{
              fontSize: 28,
              fontWeight: 600,
              color: "#A8B2BD",
              marginBottom: 12,
              display: "flex",
            }}
          >
            50 anglers. Lifetime Pro.
          </div>

          {/* Headline — the price */}
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 24,
              marginBottom: 28,
            }}
          >
            <span
              style={{
                fontSize: 180,
                fontWeight: 900,
                color: "#F0F6FC",
                lineHeight: 0.9,
                letterSpacing: -4,
              }}
            >
              $150
            </span>
            <span
              style={{
                fontSize: 36,
                fontWeight: 600,
                color: "#6E7681",
                display: "flex",
              }}
            >
              one-time · forever
            </span>
          </div>

          {/* Supporting line */}
          <div
            style={{
              fontSize: 26,
              color: "#A8B2BD",
              maxWidth: 900,
              lineHeight: 1.4,
              display: "flex",
            }}
          >
            Every Pro feature on iOS, Android, and web. No renewals. No upsells.
          </div>
        </div>

        {/* Bottom bar — seats remaining + URL */}
        <div
          style={{
            position: "absolute",
            left: 72,
            right: 72,
            bottom: 48,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Seat counter */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#6E7681",
                letterSpacing: 3,
                textTransform: "uppercase",
                display: "flex",
              }}
            >
              {soldOut ? "Sold Out" : "Seats Remaining"}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <div
                style={{
                  fontSize: 52,
                  fontWeight: 900,
                  color: soldOut ? "#E85A4F" : "#F0F6FC",
                  lineHeight: 1,
                  display: "flex",
                }}
              >
                {soldOut ? "0" : remaining}
              </div>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 600,
                  color: "#6E7681",
                  display: "flex",
                }}
              >
                / {total} left
              </div>
            </div>
            {/* Progress bar */}
            <div
              style={{
                width: 360,
                height: 6,
                borderRadius: 3,
                backgroundColor: "#21262D",
                overflow: "hidden",
                display: "flex",
              }}
            >
              <div
                style={{
                  width: `${percentSold}%`,
                  height: "100%",
                  background: "linear-gradient(90deg, #E8923A 0%, #D4751F 100%)",
                  display: "flex",
                }}
              />
            </div>
          </div>

          {/* URL */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 6,
            }}
          >
            <span
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "#F0F6FC",
                display: "flex",
              }}
            >
              executiveangler.com/founding
            </span>
            <span
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: "#6E7681",
                letterSpacing: 2,
                textTransform: "uppercase",
                display: "flex",
              }}
            >
              Claim your seat →
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
