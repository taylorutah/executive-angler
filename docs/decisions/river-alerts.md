# River alerts — end to end

**Status:** decided  
**Date:** 2026-08-25  
**Lane:** P4 / T1 (with T4 first-run)  
**Branch:** `cursor/p4-t4-3c0f`

Alerts are about **water**. Never about people, catches, spots, or another angler's day.

This document is the contract. The check route and subscribe/unsubscribe endpoints implement it. Do not change trigger math, recipients, or copy without updating this file first.

---

## What existed (findings)

`POST /api/river-alerts/check` already ran on a Vercel cron (`*/15 * * * *` in `vercel.json`). It was not an end-to-end product:

| Gap | What the code did | Why it is wrong |
|---|---|---|
| Recipients | Every `user_favorites` row with `entity_type = river` (a heart) | Hearting a river is not an alert opt-in. T3: every channel defaults off. |
| Watchlist | Ignored `user_favorite_sections` | Today and `/rivers/mine` watch sections. Hearts and watches are different lists. |
| Trigger | >20% vs a 6-hour average, or a status flip | Brief is **>25% in 24h**. Absolute LOW/NORMAL/HIGH buckets (`<100`, `<500` cfs) lie about the Madison and about a spring creek in the same sentence. |
| Debounce | 1 alert per river per user per 6 hours | Brief: **1 per river per 24h**, **3 per user per day**. |
| Cron method | `POST` only | Vercel Cron sends **GET**. The job 405s unless GET is handled. |
| Auth | Skipped when `CRON_SECRET` is unset | Fail open. Anyone who found the URL could fire the job. |
| Gauge down | Skipped the site. No notice. | A silent gauge is information. Inventing `0 cfs` is a lie. |
| Copy | Emoji (`📈` / `📉`) in the push title | Brand: no confetti. Water, not a ticker. |
| Subscribe | None | No way to opt in or out without un-hearting a river. |

Personal-band and hatch triggers were not implemented. Hatch "opening" has no honest daily signal until V3. Personal band is possible when the subscriber has enough of their own `fishing_sessions.river_flow_cfs` on that river.

---

## Who receives an alert

A user receives a water alert for a river only when **all** of these are true:

1. They are signed in as themselves (the row is theirs).
2. They have **opted in** to alerts for that river — a `user_favorites` row with `entity_type = 'river_alert'` and `entity_id = <river id>`.
3. That river has at least one USGS site we can name (from `rivers.usgs_gauge_id`, or from a pinned `user_favorite_sections.usgs_site_id`).

Watching a section (`user_favorite_sections`) puts the river on Today and `/rivers/mine`. It does **not** turn alerts on.

Hearting a river (`entity_type = 'river'`) does **not** turn alerts on.

No one else is in the payload. No follower, no presence, no catch.

### Subscribe / unsubscribe

| Method | Path | Who | Body |
|---|---|---|---|
| `GET` | `/api/river-alerts` | session | — → `{ riverIds: string[] }` |
| `POST` | `/api/river-alerts/subscribe` | session | `{ riverId }` |
| `POST` | `/api/river-alerts/unsubscribe` | session | `{ riverId }` |

Subscribe inserts `{ user_id, entity_type: 'river_alert', entity_id }` (idempotent on the unique triple). Unsubscribe deletes that row.

The control lives on `/rivers/mine` next to each watched river. Off by default. Unwatching a river does not have to delete the opt-in; the check still requires a resolvable gauge, and a leftover opt-in with no gauge is a no-op. The unsubscribe control is the way off.

T3 owns `/account` notification prefs. This lane does not add a global "river alerts" toggle there. Per-river opt-in is the preference.

Storage uses the existing `user_favorites` table (`entity_id` is `text` on the live database). No new table in this PR. `[cross-lane] supabase/migrations` — a dedicated `river_alert_subscriptions` table is cleaner if T3 or a later schema lane wants one; the `entity_type` discriminator is the contract until then.

---

## What triggers (evaluated on cron, never on page load)

Cron: existing `GET /api/river-alerts/check` every 15 minutes. `POST` is kept for the same handler so a manual curl still works.

**Auth:** `Authorization: Bearer $CRON_SECRET` or `x-cron-secret: $CRON_SECRET`. If `CRON_SECRET` is missing, the route returns **401**. Fail closed.

Compare **current instantaneous discharge** (USGS IV `00060`) to a **24-hour average** on the same site, and classify current vs a **7-day median** with `classifyFlowState` in `src/lib/browse/flow-state.ts` (ratios against that site's own median — not a global cfs bucket).

A river may fire **at most one** of these per user per 24 hours (priority order):

| # | Trigger | Honest condition | Copy shape (water only) |
|---|---|---|---|
| 1 | **>25% move in 24h** | `abs(current − avg24) / avg24 > 0.25` and `avg24 > 0` | `{River} is {n} cfs, {up\|down} {pct}% from the last 24 hours.` |
| 2 | **Blown → fishable** | 7-day-median classification was `blown`; current is `low`, `normal`, or `high` | `{River} is {n} cfs. The gauge is no longer in the blown band against its own recent median.` |
| 3 | **Threshold / state change** | `classifyFlowState(current, median7)` ≠ `classifyFlowState(avg24, median7)` and neither side is null | `{River} is {n} cfs ({state}), against its own recent median.` |
| 4 | **Personal band** | Subscriber has **≥ 3** of their own sessions on that river with `river_flow_cfs`; current has moved from outside `[p25, p75]` of those flows to inside | `{River} is {n} cfs, inside the flow band from your logged days on this river.` |
| 5 | **Gauge quiet** | Subscribed site has no usable current reading (USGS error, empty series, non-finite, or ≤ 0) | `{River} has no USGS reading right now.` |

**Not in this PR**

- **Hatch opening.** Month-on-a-chart is not "opened today." Inventing a daily hatch flip would be a fishing fact we do not have. Revisit when V3 hatch pages expose an honest opening signal.
- **A global cfs threshold** (the old `<100 / <500 / <1500` buckets). Deleted.
- **Anything about people or fish.** No "someone is on the Madison," no counts, no GPS.

If USGS returns no 24-hour average, skip triggers 1–3 for that site (cannot compute a move or a prior state). Personal band and gauge-quiet can still fire.

---

## Gauge-down behaviour

- Never treat a missing reading as `0 cfs`.
- Never send a "flow dropped 100%" alert because the series is empty.
- Send trigger 5 (gauge quiet) at most once per river per user per 24 hours.
- When the gauge returns, do not send a "it's back" alert unless a real trigger (1–4) is also true on that run.

---

## Debounce

Evaluated per user, after a trigger is chosen:

1. **One alert per river per 24 hours.** Look at `notifications` where `recipient_id` is the user, `type = 'conditions'`, `created_at` ≥ now − 24h, and `message` starts with `{riverId}|`.
2. **Three alerts per user per day.** Same table, `type = 'conditions'`, last 24 hours, any river. A fourth is dropped.

In-app row and push share this cap. Push failure does not retry as a second notification.

---

## What is delivered

1. **In-app notification** (`notifications` row):
   - `recipient_id` = the subscriber
   - `actor_id` = null
   - `type` = `conditions`
   - `session_id` = null
   - `message` = `{riverId}|{kind}|{title}|{body}`  
     `kind` ∈ `flow_move` · `blown_fishable` · `state_change` · `personal_band` · `gauge_quiet`
2. **Push** (best-effort, existing `/api/notifications/push`): title and body are the water sentences above. **No emoji.** `data: { type: 'conditions', riverId, kind }` only — no coordinates, no fish fields.

Email is out of scope here (T2 is the digest). This job does not send mail.

---

## What this is not

- Not a fishing report.
- Not a social ping.
- Not on by default.
- Not evaluated on `/today` or a river page render.
- Not a paid feature.

---

## See Also

- [[p4-t4-wire-gate]] — empty-state gate wiring
- `src/lib/browse/flow-state.ts` — hydrologic classification
- Build brief III, Wave 4 / T1

## Timeline

- **2026-08-25** | Decision written from the existing check route and the brief. Implementation follows this file.
