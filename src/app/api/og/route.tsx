import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

/**
 * GET /api/og?title=...&subtitle=...&type=...
 *
 * Generates dynamic Open Graph images for social sharing.
 * Uses brand colors (Abyss background, Copper accents, Chalk text).
 *
 * Query params:
 *   title    - Main heading (required)
 *   subtitle - Secondary text (optional)
 *   type     - Content type: "destination" | "river" | "species" | "article" | "default"
 */

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title") || "Executive Angler";
  const subtitle = searchParams.get("subtitle") || "Premium Fly Fishing Resource";
  const type = searchParams.get("type") || "default";

  const iconMap: Record<string, string> = {
    destination: "🏔️",
    river: "🌊",
    species: "🐟",
    article: "📖",
    default: "🎣",
  };
  const icon = iconMap[type] || iconMap.default;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          backgroundColor: "#0D1117",
          padding: "60px 80px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Top bar accent */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "6px",
            background: "linear-gradient(90deg, #E8923A 0%, #0BA5C7 100%)",
          }}
        />

        {/* Logo area */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "40px",
          }}
        >
          <span style={{ fontSize: "32px", marginRight: "12px" }}>{icon}</span>
          <span
            style={{
              fontSize: "18px",
              fontWeight: 600,
              color: "#E8923A",
              textTransform: "uppercase",
              letterSpacing: "3px",
            }}
          >
            Executive Angler
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: title.length > 40 ? "48px" : "56px",
            fontWeight: 700,
            color: "#F0F6FC",
            lineHeight: 1.2,
            marginBottom: "16px",
            maxWidth: "900px",
          }}
        >
          {title}
        </div>

        {/* Subtitle */}
        {subtitle && (
          <div
            style={{
              fontSize: "24px",
              color: "#A8B2BD",
              lineHeight: 1.5,
              maxWidth: "800px",
            }}
          >
            {subtitle}
          </div>
        )}

        {/* Bottom bar */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            left: "80px",
            right: "80px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: "16px", color: "#6E7681" }}>
            executiveangler.com
          </span>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "#E8923A",
              }}
            />
            <span style={{ fontSize: "14px", color: "#6E7681" }}>
              Track · Log · Discover
            </span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
