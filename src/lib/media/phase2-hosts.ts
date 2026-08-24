/**
 * Phase 2 of self-hosting images: shrink next.config.ts remotePatterns
 * to the six target hosts.
 *
 * That shrink is gated on a measurement, not a checklist. Until
 * `npm run audit:images` reports PHASE2_EXTERNAL_ROWS=0, the allowlist
 * stays at the Phase 1 freeze (45 unique hosts). Editing the baseline
 * file downward does not bypass this — the freeze is the count 45.
 *
 * Google avatars (*.googleusercontent.com) are excepted from the
 * external count even if they later leave the target list.
 */

export const PHASE1_UNIQUE_HOST_COUNT = 45;

export type Phase2Class = "empty" | "local" | "target" | "avatar" | "external";

export type AllowlistVerdict =
  | { ok: true; reason: "phase1" | "phase2" }
  | {
      ok: false;
      code: "grew" | "phase2-blocked" | "illegal-shrink";
      message: string;
    };

export function isAvatarHost(hostname: string): boolean {
  return (
    hostname === "googleusercontent.com" ||
    hostname === "lh3.googleusercontent.com" ||
    hostname.endsWith(".googleusercontent.com")
  );
}

export function hostMatches(hostname: string, allowed: string[]): boolean {
  for (const raw of allowed) {
    if (raw === hostname) return true;
    if (raw.startsWith("*.")) {
      const root = raw.slice(2);
      if (hostname === root || hostname.endsWith("." + root)) return true;
    }
  }
  return false;
}

export function classifyImageUrl(url: string, targetHostnames: string[]): Phase2Class {
  const trimmed = url.trim();
  if (!trimmed) return "empty";
  if (trimmed.startsWith("/")) return "local";
  let hostname: string;
  try {
    hostname = new URL(trimmed).hostname;
  } catch {
    return "external";
  }
  if (isAvatarHost(hostname)) return "avatar";
  if (hostMatches(hostname, targetHostnames)) return "target";
  return "external";
}

export function countPhase2ExternalRows(
  urls: string[],
  targetHostnames: string[],
): number {
  let n = 0;
  for (const url of urls) {
    if (classifyImageUrl(url, targetHostnames) === "external") n += 1;
  }
  return n;
}

function sameSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const bs = new Set(b);
  return a.every((h) => bs.has(h));
}

/**
 * Decide whether the current remotePatterns list is legal.
 *
 * `externalRows` is the measurement from audit:images. Pass `null` when
 * the count has not been taken. A shrink to the six is refused until
 * that number is the integer 0.
 */
export function evaluateRemotePatterns(opts: {
  configHosts: string[];
  baselineHosts: string[];
  targetHosts: string[];
  externalRows: number | null;
}): AllowlistVerdict {
  const config = unique(opts.configHosts);
  const baseline = unique(opts.baselineHosts);
  const target = unique(opts.targetHosts);
  const extra = config.filter((h) => !baseline.includes(h));

  if (config.length > PHASE1_UNIQUE_HOST_COUNT || extra.length) {
    const grown = extra.length ? extra : config.slice(PHASE1_UNIQUE_HOST_COUNT);
    return {
      ok: false,
      code: "grew",
      message:
        "next.config.ts remotePatterns grew beyond the Phase 1 freeze:\n" +
        grown.map((h) => "  + " + h).join("\n") +
        "\nAdd a host to scripts/image-hosts-baseline.json only with a reason. Do not shrink.",
    };
  }

  if (config.length === PHASE1_UNIQUE_HOST_COUNT) {
    const missing = baseline.filter((h) => !config.includes(h));
    if (missing.length) {
      return {
        ok: false,
        code: "grew",
        message:
          "Phase 1 host list swapped names without growing the count:\n" +
          missing.map((h) => "  - " + h).join("\n") +
          extra.map((h) => "  + " + h).join("\n"),
      };
    }
    return { ok: true, reason: "phase1" };
  }

  // length < 45: this is a Phase 2 shrink attempt.
  if (!sameSet(config, target)) {
    return {
      ok: false,
      code: "illegal-shrink",
      message:
        `remotePatterns shrank to ${config.length} hosts, which is not the target six.\n` +
        "The only legal shrink is image-hosts-target.json, and only when\n" +
        "audit:images reports PHASE2_EXTERNAL_ROWS=0. Do not edit the baseline down to sneak this through.",
    };
  }

  if (opts.externalRows === null) {
    return {
      ok: false,
      code: "phase2-blocked",
      message:
        "Phase 2 shrink to the six target hosts is blocked: PHASE2_EXTERNAL_ROWS was not measured.\n" +
        "Run `npm run audit:images -- --dry` and do not shrink until it prints PHASE2_EXTERNAL_ROWS=0.",
    };
  }

  if (opts.externalRows !== 0) {
    return {
      ok: false,
      code: "phase2-blocked",
      message:
        `Phase 2 shrink is blocked: audit:images reports PHASE2_EXTERNAL_ROWS=${opts.externalRows}.\n` +
        "That count is rows whose image URL host sits outside the target six (Google avatars excepted).\n" +
        "remotePatterns stays at 45 until that number is 0. Removing a hotlink does not remove a copyright.",
    };
  }

  return { ok: true, reason: "phase2" };
}

function unique(hosts: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const h of hosts) {
    if (seen.has(h)) continue;
    seen.add(h);
    out.push(h);
  }
  return out;
}
