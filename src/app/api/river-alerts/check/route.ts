import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * POST /api/river-alerts/check
 *
 * CRON-triggered endpoint that checks USGS gauges for significant flow changes
 * on rivers that have at least one user favorite. Creates notifications and
 * triggers push for affected users.
 *
 * Flow spike/dip logic:
 * - Compare current discharge to 6-hour rolling average
 * - Alert on >20% change or flow status change (NORMAL -> HIGH, etc.)
 * - Dedupe: max 1 alert per river per user per 6 hours
 *
 * Secured by: CRON_SECRET header
 */

const PARAM_DISCHARGE = "00060";

interface GaugeConfig {
  site_id: string;
  name: string;
  section: string;
}

interface River {
  id: string;
  name: string;
  usgs_gauge_id: string | GaugeConfig[] | null;
}

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function flowStatus(cfs: number): string {
  if (cfs < 100) return "LOW";
  if (cfs < 500) return "NORMAL";
  if (cfs < 1500) return "MODERATE";
  if (cfs < 5000) return "HIGH";
  return "FLOOD";
}

async function fetchCurrentDischarge(siteIds: string[]): Promise<Map<string, number>> {
  const joined = siteIds.join(",");
  const url = `https://waterservices.usgs.gov/nwis/iv/?format=json&sites=${joined}&parameterCd=${PARAM_DISCHARGE}&siteStatus=all`;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) return new Map();

    const json = await res.json();
    const series = json?.value?.timeSeries || [];
    const result = new Map<string, number>();

    for (const ts of series) {
      const siteId = ts.sourceInfo?.siteCode?.[0]?.value;
      const paramCode = ts.variable?.variableCode?.[0]?.value;
      if (siteId && paramCode === PARAM_DISCHARGE) {
        const values = ts.values?.[0]?.value || [];
        if (values.length > 0) {
          const latest = parseFloat(values[values.length - 1].value);
          if (!isNaN(latest) && latest > 0) {
            result.set(siteId, latest);
          }
        }
      }
    }
    return result;
  } catch {
    return new Map();
  }
}

async function fetch6HourAvgDischarge(siteIds: string[]): Promise<Map<string, number>> {
  const joined = siteIds.join(",");
  const url = `https://waterservices.usgs.gov/nwis/iv/?format=json&sites=${joined}&parameterCd=${PARAM_DISCHARGE}&period=PT6H&siteStatus=all`;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) return new Map();

    const json = await res.json();
    const series = json?.value?.timeSeries || [];
    const result = new Map<string, number>();

    for (const ts of series) {
      const siteId = ts.sourceInfo?.siteCode?.[0]?.value;
      const paramCode = ts.variable?.variableCode?.[0]?.value;
      if (siteId && paramCode === PARAM_DISCHARGE) {
        const values = (ts.values?.[0]?.value || [])
          .map((v: { value: string }) => parseFloat(v.value))
          .filter((v: number) => !isNaN(v) && v > 0);
        if (values.length > 0) {
          const avg = values.reduce((a: number, b: number) => a + b, 0) / values.length;
          result.set(siteId, avg);
        }
      }
    }
    return result;
  } catch {
    return new Map();
  }
}

export async function POST(req: NextRequest) {
  // Verify cron secret
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = req.headers.get("authorization") || req.headers.get("x-cron-secret");
    if (authHeader !== cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const admin = getSupabaseAdmin();

  // 1. Find rivers that have at least one user favorite
  const { data: favorites } = await admin
    .from("user_favorites")
    .select("entity_id")
    .eq("entity_type", "river");

  if (!favorites?.length) {
    return NextResponse.json({ checked: 0, alerts: 0, reason: "No favorited rivers" });
  }

  const favoritedRiverIds = [...new Set(favorites.map((f) => f.entity_id))];

  // 2. Fetch river gauge configs for favorited rivers
  const { data: rivers } = await admin
    .from("rivers")
    .select("id, name, usgs_gauge_id")
    .in("id", favoritedRiverIds)
    .not("usgs_gauge_id", "is", null);

  if (!rivers?.length) {
    return NextResponse.json({ checked: 0, alerts: 0, reason: "No gauges for favorited rivers" });
  }

  // 3. Collect all gauge site IDs
  const allGauges: { riverId: string; riverName: string; siteId: string; section: string }[] = [];

  for (const river of rivers as River[]) {
    let gauges: GaugeConfig[] = [];
    if (typeof river.usgs_gauge_id === "string") {
      try { gauges = JSON.parse(river.usgs_gauge_id); } catch { continue; }
    } else if (Array.isArray(river.usgs_gauge_id)) {
      gauges = river.usgs_gauge_id;
    }
    for (const g of gauges) {
      allGauges.push({ riverId: river.id, riverName: river.name, siteId: g.site_id, section: g.section });
    }
  }

  if (allGauges.length === 0) {
    return NextResponse.json({ checked: 0, alerts: 0, reason: "No valid gauges" });
  }

  const siteIds = allGauges.map((g) => g.siteId);

  // 4. Fetch current and 6-hour average discharge in parallel
  const [currentMap, avgMap] = await Promise.all([
    fetchCurrentDischarge(siteIds),
    fetch6HourAvgDischarge(siteIds),
  ]);

  // 5. Check for significant changes
  const alerts: { riverId: string; riverName: string; section: string; currentCfs: number; avgCfs: number; changePercent: number; status: string }[] = [];

  for (const gauge of allGauges) {
    const current = currentMap.get(gauge.siteId);
    const avg = avgMap.get(gauge.siteId);
    if (current == null || avg == null || avg === 0) continue;

    const changePercent = ((current - avg) / avg) * 100;
    const currentStatus = flowStatus(current);
    const avgStatus = flowStatus(avg);

    // Alert on >20% change OR status change
    if (Math.abs(changePercent) > 20 || currentStatus !== avgStatus) {
      alerts.push({
        riverId: gauge.riverId,
        riverName: gauge.riverName,
        section: gauge.section,
        currentCfs: Math.round(current),
        avgCfs: Math.round(avg),
        changePercent: Math.round(changePercent),
        status: currentStatus,
      });
    }
  }

  if (alerts.length === 0) {
    return NextResponse.json({ checked: allGauges.length, alerts: 0, reason: "No significant changes" });
  }

  // 6. Dedupe: group alerts by river, take the most significant gauge per river
  const alertsByRiver = new Map<string, typeof alerts[number]>();
  for (const alert of alerts) {
    const existing = alertsByRiver.get(alert.riverId);
    if (!existing || Math.abs(alert.changePercent) > Math.abs(existing.changePercent)) {
      alertsByRiver.set(alert.riverId, alert);
    }
  }

  // 7. For each alerted river, find subscribed users and create notifications
  let notificationCount = 0;
  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.executiveangler.com";

  for (const [riverId, alert] of alertsByRiver) {
    // Find users who favorited this river
    const { data: riverFavorites } = await admin
      .from("user_favorites")
      .select("user_id")
      .eq("entity_type", "river")
      .eq("entity_id", riverId);

    if (!riverFavorites?.length) continue;

    for (const fav of riverFavorites) {
      // Dedupe: check if we already alerted this user about this river in the last 6 hours
      const { count } = await admin
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("recipient_id", fav.user_id)
        .eq("type", "conditions")
        .gte("created_at", sixHoursAgo)
        .like("message", `%${riverId}%`);

      if ((count ?? 0) > 0) continue;

      const direction = alert.changePercent > 0 ? "up" : "down";
      const emoji = alert.changePercent > 0 ? "📈" : "📉";
      const title = `${alert.riverName} flow ${direction} ${Math.abs(alert.changePercent)}%`;
      const body = `${alert.section}: ${alert.currentCfs} cfs (was ${alert.avgCfs} avg). Status: ${alert.status}`;

      // Insert notification record
      await admin.from("notifications").insert({
        recipient_id: fav.user_id,
        type: "conditions",
        message: `${riverId}|${title}|${body}`,
      });

      // Trigger push notification
      try {
        await fetch(`${baseUrl}/api/notifications/push`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-webhook-secret": process.env.WEBHOOK_SECRET || "",
          },
          body: JSON.stringify({
            recipientId: fav.user_id,
            title: `${emoji} ${title}`,
            body,
            data: { type: "conditions", riverId },
          }),
        });
      } catch {
        // Push failure shouldn't block other notifications
      }

      notificationCount++;
    }
  }

  console.log(`[RIVER-ALERTS] Checked ${allGauges.length} gauges, found ${alertsByRiver.size} river alerts, sent ${notificationCount} notifications`);

  return NextResponse.json({
    checked: allGauges.length,
    rivers: alertsByRiver.size,
    alerts: notificationCount,
    details: [...alertsByRiver.values()].map((a) => ({
      river: a.riverName,
      section: a.section,
      change: `${a.changePercent > 0 ? "+" : ""}${a.changePercent}%`,
      current: `${a.currentCfs} cfs`,
      status: a.status,
    })),
  });
}
