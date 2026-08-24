"use client";

/**
 * Collapses identical GETs fired by widgets that mount together on the river
 * page (conditions card, section pills, flow chart, photo strip/widget).
 *
 * Entries expire so the periodic refresh timers inside those widgets still
 * reach the network instead of replaying the first payload forever.
 */
const DEDUPE_WINDOW_MS = 30_000;

const inflight = new Map<string, { promise: Promise<Response>; at: number }>();

export function fetchOnce(url: string, init?: RequestInit): Promise<Response> {
  const existing = inflight.get(url);
  if (existing && Date.now() - existing.at < DEDUPE_WINDOW_MS) {
    return existing.promise.then((r) => r.clone());
  }

  const promise = fetch(url, init);
  inflight.set(url, { promise, at: Date.now() });
  promise.catch(() => {
    if (inflight.get(url)?.promise === promise) inflight.delete(url);
  });

  return promise.then((r) => r.clone());
}
