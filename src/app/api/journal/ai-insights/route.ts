import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { checkPremium } from "@/lib/admin";

export interface AIInsight {
  title: string;
  insight: string;
  type: "pattern" | "recommendation" | "achievement";
}

/**
 * POST /api/journal/ai-insights
 *
 * Fetches user's recent fishing sessions + catches, sends structured data
 * to Claude, and returns 3-5 actionable insight cards as JSON.
 * Auth required, premium-gated.
 */
export async function POST() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI insights are not configured. Set the ANTHROPIC_API_KEY environment variable." },
      { status: 503 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isPremium = await checkPremium(supabase, user.id, user.email);
  if (!isPremium) {
    return NextResponse.json({ error: "Premium required" }, { status: 403 });
  }

  // Fetch last 20 sessions with catches and fly patterns
  const [sessionsRes, catchesRes, fliesRes] = await Promise.all([
    supabase
      .from("fishing_sessions")
      .select(
        "id, date, river_name, total_fish, weather, water_temp_f, water_clarity, section, notes, flies_notes, weather_condition, weather_temp_f"
      )
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(20),
    supabase
      .from("catches")
      .select(
        "id, session_id, species, length_inches, fly_pattern_id, fly_size, fly_position, time_caught, quantities"
      )
      .eq("user_id", user.id)
      .limit(300),
    supabase.from("fly_patterns").select("id, name, type").eq("user_id", user.id),
  ]);

  const sessions = sessionsRes.data || [];
  const catches = catchesRes.data || [];
  const flies = fliesRes.data || [];

  if (sessions.length < 3) {
    return NextResponse.json({
      insights: [],
      message: "Log at least 3 sessions to generate AI insights.",
    });
  }

  const flyMap = Object.fromEntries(flies.map((f) => [f.id, f.name]));

  // Build structured session summaries for the prompt
  const sessionSummaries = sessions.map((s) => {
    const sessionCatches = catches.filter((c) => c.session_id === s.id);
    const speciesSet = new Set(sessionCatches.map((c) => c.species).filter(Boolean));
    const flyNames = sessionCatches
      .map((c) => (c.fly_pattern_id ? flyMap[c.fly_pattern_id] : null))
      .filter(Boolean);
    const flyPositions = sessionCatches
      .map((c) => c.fly_position)
      .filter(Boolean);
    const biggest = sessionCatches.reduce(
      (max, c) => Math.max(max, c.length_inches || 0),
      0
    );

    return [
      s.date,
      s.river_name || "unknown river",
      `${s.total_fish || sessionCatches.length} fish`,
      s.water_temp_f ? `water: ${s.water_temp_f}F` : null,
      s.water_clarity ? `clarity: ${s.water_clarity}` : null,
      s.weather_condition || s.weather || null,
      s.weather_temp_f ? `air: ${s.weather_temp_f}F` : null,
      speciesSet.size > 0 ? `species: ${Array.from(speciesSet).join(", ")}` : null,
      flyNames.length > 0 ? `flies: ${[...new Set(flyNames)].join(", ")}` : null,
      flyPositions.length > 0
        ? `positions: ${[...new Set(flyPositions)].join(", ")}`
        : null,
      biggest > 0 ? `biggest: ${biggest}"` : null,
      s.section ? `section: ${s.section}` : null,
      s.notes ? `notes: "${s.notes.substring(0, 80)}"` : null,
    ]
      .filter(Boolean)
      .join(" | ");
  });

  const totalFish = sessions.reduce((s, ses) => s + (ses.total_fish || 0), 0);
  const rivers = [...new Set(sessions.map((s) => s.river_name).filter(Boolean))];

  const systemPrompt = `You are an expert fly fishing analyst for Executive Angler, a premium fishing journal app. Analyze this angler's recent fishing data and provide 3-5 actionable insights about patterns, what's working, and recommendations. Be specific about flies, rivers, and conditions. Keep each insight to 2-3 sentences. Format your response as a JSON array of objects with these fields:
- title: short insight title (3-6 words)
- insight: the 2-3 sentence insight text
- type: one of "pattern", "recommendation", or "achievement"

Types:
- "pattern": a recurring trend or correlation you found in the data
- "recommendation": actionable advice for their next trip
- "achievement": a notable milestone or accomplishment

Return ONLY the JSON array, no other text.`;

  const userPrompt = `DATA SUMMARY:
- ${sessions.length} sessions, ${totalFish} fish caught
- Rivers: ${rivers.join(", ")}
- Date range: ${sessions[sessions.length - 1]?.date} to ${sessions[0]?.date}

RECENT SESSIONS (most recent first):
${sessionSummaries.join("\n")}`;

  try {
    const anthropic = new Anthropic({ apiKey });
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Parse JSON from response — handle potential markdown code fences
    let insights: AIInsight[];
    try {
      const cleaned = text.replace(/```json?\n?/g, "").replace(/```\n?/g, "").trim();
      insights = JSON.parse(cleaned);

      // Validate structure
      if (!Array.isArray(insights)) {
        throw new Error("Response is not an array");
      }
      insights = insights.slice(0, 5).map((item) => ({
        title: String(item.title || "Insight"),
        insight: String(item.insight || ""),
        type: ["pattern", "recommendation", "achievement"].includes(item.type)
          ? item.type
          : "pattern",
      }));
    } catch {
      // If JSON parsing fails, return the raw text as a single insight
      insights = [
        {
          title: "AI Analysis",
          insight: text.substring(0, 500),
          type: "pattern" as const,
        },
      ];
    }

    return NextResponse.json(
      { insights },
      { headers: { "Cache-Control": "private, max-age=3600" } }
    );
  } catch (err) {
    console.error("[AI Insights] Claude API error:", err);
    return NextResponse.json({ error: "AI analysis failed" }, { status: 502 });
  }
}
