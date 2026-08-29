/**
 * Shared top-fly ranking for river personal widgets.
 *
 * Rule: most sessions the fly was logged on; tie-break by most attributed
 * fish, then most recent session date. One session with one fly is enough.
 * Returns null only when there are zero resolvable fly records.
 */

export interface FlyRef {
  fly_pattern_id?: string | null;
  canonical_fly_id?: string | null;
  fly_name?: string | null;
}

export interface FlyIdentity {
  key: string;
  displayName: string;
}

export interface FlyLogEvent {
  key: string;
  displayName: string;
  sessionId: string;
  sessionDate: string;
  fish: number;
}

export interface TopFly {
  name: string;
  sessionCount: number;
  totalFish: number;
  lastUsed: string;
}

export function flyIdentity(
  record: FlyRef,
  flyNameById: Map<string, string>,
): FlyIdentity | null {
  const flyId = record.fly_pattern_id || record.canonical_fly_id;
  if (flyId) {
    const name = flyNameById.get(flyId);
    if (name) return { key: `id:${flyId}`, displayName: name };
  }
  if (record.fly_name?.trim()) {
    const displayName = record.fly_name.trim();
    const norm = displayName.toLowerCase().replace(/\s+/g, " ");
    return { key: `name:${norm}`, displayName };
  }
  return null;
}

export function collectReferencedFlyIds(records: FlyRef[]): string[] {
  return Array.from(
    new Set(
      records
        .flatMap((r) => [r.fly_pattern_id, r.canonical_fly_id])
        .filter((v): v is string => !!v),
    ),
  );
}

export function buildFlyLogEvents(args: {
  catches: Array<FlyRef & { session_id: string; quantities?: number | null }>;
  rigs?: Array<FlyRef & { session_id: string }>;
  sessionDateById: Map<string, string>;
  flyNameById: Map<string, string>;
}): FlyLogEvent[] {
  const events: FlyLogEvent[] = [];
  const { sessionDateById, flyNameById } = args;

  for (const c of args.catches) {
    const ident = flyIdentity(c, flyNameById);
    if (!ident) continue;
    const sessionDate = sessionDateById.get(c.session_id);
    if (!sessionDate) continue;
    events.push({
      ...ident,
      sessionId: c.session_id,
      sessionDate,
      fish: c.quantities && c.quantities > 0 ? c.quantities : 1,
    });
  }

  for (const r of args.rigs ?? []) {
    const ident = flyIdentity(r, flyNameById);
    if (!ident) continue;
    const sessionDate = sessionDateById.get(r.session_id);
    if (!sessionDate) continue;
    events.push({
      ...ident,
      sessionId: r.session_id,
      sessionDate,
      fish: 0,
    });
  }

  return events;
}

export function computeTopFly(events: FlyLogEvent[]): TopFly | null {
  if (events.length === 0) return null;

  const byKey = new Map<
    string,
    { displayName: string; sessions: Set<string>; totalFish: number; lastUsed: string }
  >();

  for (const e of events) {
    const cur = byKey.get(e.key) ?? {
      displayName: e.displayName,
      sessions: new Set<string>(),
      totalFish: 0,
      lastUsed: e.sessionDate,
    };
    cur.sessions.add(e.sessionId);
    cur.totalFish += e.fish;
    if (e.sessionDate > cur.lastUsed) cur.lastUsed = e.sessionDate;
    byKey.set(e.key, cur);
  }

  let winner: TopFly | null = null;
  for (const cur of byKey.values()) {
    const candidate: TopFly = {
      name: cur.displayName,
      sessionCount: cur.sessions.size,
      totalFish: cur.totalFish,
      lastUsed: cur.lastUsed,
    };
    if (!winner) {
      winner = candidate;
      continue;
    }
    if (candidate.sessionCount !== winner.sessionCount) {
      if (candidate.sessionCount > winner.sessionCount) winner = candidate;
      continue;
    }
    if (candidate.totalFish !== winner.totalFish) {
      if (candidate.totalFish > winner.totalFish) winner = candidate;
      continue;
    }
    if (candidate.lastUsed > winner.lastUsed) winner = candidate;
  }

  return winner;
}
