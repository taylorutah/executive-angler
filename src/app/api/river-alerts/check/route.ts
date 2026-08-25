import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { SITE_URL } from "@/lib/constants";
import { median } from "@/lib/browse/flow-state";
import {
  ALERT_TYPE,
  PER_RIVER_HOURS,
  PER_USER_DAILY_CAP,
  RIVER_ALERT_ENTITY,
} from "../constants";
import { chooseAlert, personalBand, type GaugeReading } from "../evaluate";

/**
 * GET|POST /api/river-alerts/check
 *
 * Vercel Cron hits GET. Contract: docs/decisions/river-alerts.md
 * Do not change triggers or recipients without updating that file first.
 */

const PARAM_DISCHARGE = "00060";

interface GaugeConfig {
  site_id: string;
  name?: string;
  section?: string;
}

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

function authorize(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;
  const authHeader = req.headers.get("authorization") || req.headers.get("x-cron-secret");
  return authHeader === cronSecret || authHeader === `Bearer ${cronSecret}`;
}

function parseGauges(raw: unknown): GaugeConfig[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as GaugeConfig[];
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (trimmed.startsWith("[")) {
      try {
        return JSON.parse(trimmed) as GaugeConfig[];
      } catch {
        return [];
      }
    }
    if (trimmed) return [{ site_id: trimmed }];
  }
  return [];
}

type UsgsPoint = { value: number; at: number };

async function fetchUsgsWeek(siteIds: string[]): Promise<Map<string, UsgsPoint[]>> {
  const out = new Map<string, UsgsPoint[]>();
  if (siteIds.length === 0) return out;
  const unique = [...new Set(siteIds.filter(Boolean))];
  const chunkSize = 40;
  for (let i = 0; i < unique.length; i += chunkSize) {
    const chunk = unique.slice(i, i + chunkSize);
    const url =
      `https://waterservices.usgs.gov/nwis/iv/?format=json&sites=${chunk.join(",")}` +
      `&parameterCd=${PARAM_DISCHARGE}&period=P7D&siteStatus=all`;
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
      if (!res.ok) continue;
      const json = (await res.json()) as {
        value?: {
          timeSeries?: Array<{
            sourceInfo?: { siteCode?: Array<{ value?: string }> };
            variable?: { variableCode?: Array<{ value?: string }> };
            values?: Array<{
              value?: Array<{ value?: string; dateTime?: string }>;
            }>;
          }>;
        };
      };
      for (const ts of json.value?.timeSeries ?? []) {
        const siteId = ts.sourceInfo?.siteCode?.[0]?.value;
        const param = ts.variable?.variableCode?.[0]?.value;
        if (!siteId || param !== PARAM_DISCHARGE) continue;
        const points: UsgsPoint[] = [];
        for (const raw of ts.values?.[0]?.value ?? []) {
          const value = parseFloat(raw.value ?? "");
          const at = raw.dateTime ? Date.parse(raw.dateTime) : NaN;
          if (!Number.isFinite(value) || value <= 0 || !Number.isFinite(at)) continue;
          points.push({ value, at });
        }
        if (points.length) out.set(siteId, points);
      }
    } catch {
      // A failed chunk leaves those sites without readings → gauge_quiet.
    }
  }
  return out;
}

function readingFromSeries(points: UsgsPoint[] | undefined, now: number): GaugeReading {
  if (!points?.length) {
    return { current: null, avg24: null, median7: null };
  }
  const current = points[points.length - 1]?.value ?? null;
  const since24 = now - 24 * 60 * 60 * 1000;
  const lastDay = points.filter((p) => p.at >= since24).map((p) => p.value);
  const avg24 =
    lastDay.length > 0
      ? lastDay.reduce((a, b) => a + b, 0) / lastDay.length
      : null;
  const median7 = median(points.map((p) => p.value));
  return { current, avg24, median7 };
}

function encodeMessage(riverId: string, kind: string, title: string, body: string): string {
  return `${riverId}|${kind}|${title}|${body}`;
}

function riverIdFromMessage(message: string | null): string | null {
  if (!message) return null;
  const id = message.split("|")[0];
  return id || null;
}

async function runCheck() {
  const admin = getSupabaseAdmin();

  const { data: subs, error: subError } = await admin
    .from("user_favorites")
    .select("user_id, entity_id")
    .eq("entity_type", RIVER_ALERT_ENTITY);
  if (subError) {
    return NextResponse.json({ error: subError.message }, { status: 500 });
  }
  if (!subs?.length) {
    return NextResponse.json({ checked: 0, alerts: 0, reason: "No subscribers" });
  }

  const riverIds = [...new Set(subs.map((s) => s.entity_id).filter(Boolean))];
  const { data: rivers } = await admin
    .from("rivers")
    .select("id, name, usgs_gauge_id")
    .in("id", riverIds);

  const riverMap = new Map<
    string,
    { name: string; gauges: GaugeConfig[] }
  >();
  for (const river of rivers ?? []) {
    riverMap.set(river.id, {
      name: river.name,
      gauges: parseGauges(river.usgs_gauge_id),
    });
  }

  const userIds = [...new Set(subs.map((s) => s.user_id))];
  const { data: pinned } = await admin
    .from("user_favorite_sections")
    .select("user_id, river_id, usgs_site_id")
    .in("user_id", userIds)
    .in("river_id", riverIds);

  const pinKey = (userId: string, riverId: string) => `${userId}:${riverId}`;
  const pins = new Map<string, string>();
  for (const row of pinned ?? []) {
    if (row.usgs_site_id) pins.set(pinKey(row.user_id, row.river_id), row.usgs_site_id);
  }

  const siteBySub: Array<{
    userId: string;
    riverId: string;
    riverName: string;
    siteId: string;
  }> = [];
  for (const sub of subs) {
    const river = riverMap.get(sub.entity_id);
    if (!river) continue;
    const pinnedSite = pins.get(pinKey(sub.user_id, sub.entity_id));
    const siteId = pinnedSite || river.gauges[0]?.site_id;
    if (!siteId) continue;
    siteBySub.push({
      userId: sub.user_id,
      riverId: sub.entity_id,
      riverName: river.name,
      siteId,
    });
  }

  if (siteBySub.length === 0) {
    return NextResponse.json({ checked: 0, alerts: 0, reason: "No gauges for subscribers" });
  }

  const now = Date.now();
  const series = await fetchUsgsWeek(siteBySub.map((s) => s.siteId));

  const { data: flowRows } = await admin
    .from("fishing_sessions")
    .select("user_id, river_id, river_flow_cfs")
    .in("user_id", userIds)
    .in("river_id", riverIds)
    .not("river_flow_cfs", "is", null);

  const flowsByUserRiver = new Map<string, number[]>();
  for (const row of flowRows ?? []) {
    const cfs = Number(row.river_flow_cfs);
    if (!Number.isFinite(cfs) || cfs <= 0) continue;
    const key = pinKey(row.user_id, row.river_id);
    const list = flowsByUserRiver.get(key) ?? [];
    list.push(cfs);
    flowsByUserRiver.set(key, list);
  }

  const since = new Date(now - PER_RIVER_HOURS * 60 * 60 * 1000).toISOString();
  const { data: recent } = await admin
    .from("notifications")
    .select("recipient_id, message")
    .eq("type", ALERT_TYPE)
    .gte("created_at", since)
    .in("recipient_id", userIds);

  const recentByUser = new Map<string, string[]>();
  for (const row of recent ?? []) {
    const list = recentByUser.get(row.recipient_id) ?? [];
    const rid = riverIdFromMessage(row.message);
    if (rid) list.push(rid);
    recentByUser.set(row.recipient_id, list);
  }

  const sentThisRun = new Map<string, number>();
  let notificationCount = 0;
  const details: Array<{ river: string; kind: string; user: string }> = [];
  const baseUrl = SITE_URL;

  for (const sub of siteBySub) {
    const already = recentByUser.get(sub.userId) ?? [];
    const runCount = sentThisRun.get(sub.userId) ?? 0;
    if (already.length + runCount >= PER_USER_DAILY_CAP) continue;
    if (already.includes(sub.riverId)) continue;

    const reading = readingFromSeries(series.get(sub.siteId), now);
    const band = personalBand(flowsByUserRiver.get(pinKey(sub.userId, sub.riverId)) ?? []);
    const chosen = chooseAlert(sub.riverName, reading, band);
    if (!chosen) continue;

    const message = encodeMessage(sub.riverId, chosen.kind, chosen.title, chosen.body);
    await admin.from("notifications").insert({
      recipient_id: sub.userId,
      actor_id: null,
      type: ALERT_TYPE,
      session_id: null,
      message,
    });

    try {
      await fetch(`${baseUrl}/api/notifications/push`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-webhook-secret": process.env.WEBHOOK_SECRET || "",
        },
        body: JSON.stringify({
          recipientId: sub.userId,
          title: chosen.title,
          body: chosen.body,
          data: { type: ALERT_TYPE, riverId: sub.riverId, kind: chosen.kind },
        }),
      });
    } catch {
      // Push is best-effort. The in-app row already exists.
    }

    already.push(sub.riverId);
    recentByUser.set(sub.userId, already);
    sentThisRun.set(sub.userId, runCount + 1);
    notificationCount += 1;
    details.push({ river: sub.riverName, kind: chosen.kind, user: sub.userId });
  }

  return NextResponse.json({
    checked: siteBySub.length,
    alerts: notificationCount,
    details: details.map((d) => ({ river: d.river, kind: d.kind })),
  });
}

export async function GET(req: NextRequest) {
  if (!authorize(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return runCheck();
}

export async function POST(req: NextRequest) {
  if (!authorize(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return runCheck();
}
