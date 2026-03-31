import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { checkPremium } from "@/lib/admin";

/**
 * POST /api/insights/journal
 *
 * Takes the user's session + catch data and generates a natural-language
 * journal analysis using Claude. Premium-gated.
 */
export async function POST() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI insights not configured" }, { status: 503 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isPremium = await checkPremium(supabase, user.id, user.email);
  if (!isPremium) {
    return NextResponse.json({ error: "Premium required" }, { status: 403 });
  }

  // Fetch user data
  const [sessionsRes, catchesRes, fliesRes] = await Promise.all([
    supabase
      .from("fishing_sessions")
      .select("id, date, river_name, total_fish, weather, water_temp_f, water_clarity, section, notes, flies_notes")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(50),
    supabase
      .from("catches")
      .select("id, session_id, species, length_inches, fly_pattern_id, fly_size, time_caught, quantities")
      .eq("user_id", user.id)
      .limit(500),
    supabase
      .from("fly_patterns")
      .select("id, name, type")
      .eq("user_id", user.id),
  ]);

  const sessions = sessionsRes.data || [];
  const catches = catchesRes.data || [];
  const flies = fliesRes.data || [];

  if (sessions.length < 3) {
    return NextResponse.json({
      summary: "Log at least 3 sessions to generate an AI analysis of your fishing journal.",
    });
  }

  const flyMap = Object.fromEntries(flies.map(f => [f.id, f.name]));

  // Build compact data summary for Claude
  const sessionSummaries = sessions.slice(0, 30).map(s => {
    const sessionCatches = catches.filter(c => c.session_id === s.id);
    const speciesSet = new Set(sessionCatches.map(c => c.species).filter(Boolean));
    const flyNames = sessionCatches
      .map(c => c.fly_pattern_id ? flyMap[c.fly_pattern_id] : null)
      .filter(Boolean);
    const biggest = sessionCatches.reduce((max, c) => Math.max(max, c.length_inches || 0), 0);

    return [
      s.date,
      s.river_name || "unknown river",
      `${s.total_fish || sessionCatches.length} fish`,
      s.water_temp_f ? `${s.water_temp_f}F` : null,
      s.water_clarity || null,
      s.weather || null,
      speciesSet.size > 0 ? `species: ${Array.from(speciesSet).join(", ")}` : null,
      flyNames.length > 0 ? `flies: ${[...new Set(flyNames)].join(", ")}` : null,
      biggest > 0 ? `biggest: ${biggest}"` : null,
      s.notes ? `notes: "${s.notes.substring(0, 100)}"` : null,
    ].filter(Boolean).join(" | ");
  });

  const totalFish = sessions.reduce((s, ses) => s + (ses.total_fish || 0), 0);
  const rivers = [...new Set(sessions.map(s => s.river_name).filter(Boolean))];

  const prompt = `You are an expert fly fishing analyst for Executive Angler, a premium fishing journal app. Analyze this angler's recent fishing data and provide a personalized, actionable journal analysis.

DATA SUMMARY:
- ${sessions.length} sessions total, ${totalFish} fish caught
- Rivers: ${rivers.join(", ")}
- Date range: ${sessions[sessions.length - 1]?.date} to ${sessions[0]?.date}

RECENT SESSIONS (most recent first):
${sessionSummaries.join("\n")}

Write a 3-4 paragraph analysis covering:
1. Overall performance assessment and recent trends
2. Key patterns you see (fly selection, conditions, rivers, timing)
3. Specific, actionable recommendations for their next trip
4. One insight that connects multiple data points in a non-obvious way

Write in second person ("you"), conversational but expert tone. Be specific — reference actual fly names, rivers, temperatures, and dates from their data. No generic advice. No bullet points — flowing paragraphs. Keep it under 300 words.`;

  try {
    const anthropic = new Anthropic({ apiKey });
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 512,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";

    return NextResponse.json(
      { summary: text },
      { headers: { "Cache-Control": "private, max-age=3600" } }
    );
  } catch (err) {
    console.error("[AI Insights] Claude API error:", err);
    return NextResponse.json({ error: "AI analysis failed" }, { status: 502 });
  }
}
