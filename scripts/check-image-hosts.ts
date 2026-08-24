/**
 * Fail CI if next.config.ts remotePatterns grows, or if it shrinks
 * before audit:images reports PHASE2_EXTERNAL_ROWS=0.
 *
 *   npm run check:image-hosts
 *
 * Phase 1 (now): 45 unique hosts. Growth is a reviewable baseline edit.
 * Phase 2 (later): shrink to the six in image-hosts-target.json, but only
 * when the audit measurement is the integer 0. Editing the baseline file
 * downward does not bypass that — the freeze is PHASE1_UNIQUE_HOST_COUNT.
 */
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  PHASE1_UNIQUE_HOST_COUNT,
  evaluateRemotePatterns,
} from "../src/lib/media/phase2-hosts";

function parseRemotePatterns(configPath: string): string[] {
  const text = readFileSync(configPath, "utf8");
  const hosts: string[] = [];
  const re = /hostname:\s*"([^"]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) hosts.push(m[1]);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const h of hosts) {
    if (seen.has(h)) continue;
    seen.add(h);
    out.push(h);
  }
  return out;
}

function measureExternalRows(): number | null {
  const r = spawnSync("npx", ["tsx", "scripts/audit-images.ts", "--dry"], {
    encoding: "utf8",
  });
  const text = `${r.stdout ?? ""}\n${r.stderr ?? ""}`;
  const m = text.match(/PHASE2_EXTERNAL_ROWS=(\d+)/);
  if (!m) return null;
  return Number(m[1]);
}

function main() {
  const root = process.cwd();
  const configHosts = parseRemotePatterns(resolve(root, "next.config.ts"));
  const baseline = JSON.parse(
    readFileSync(resolve(root, "scripts/image-hosts-baseline.json"), "utf8"),
  ) as { hosts: string[] };
  const targetFile = JSON.parse(
    readFileSync(resolve(root, "scripts/image-hosts-target.json"), "utf8"),
  ) as { hosts: Array<{ hostname: string }> };
  const targetHosts = targetFile.hosts.map((h) => h.hostname);

  const needsMeasurement = configHosts.length < PHASE1_UNIQUE_HOST_COUNT;
  const externalRows = needsMeasurement ? measureExternalRows() : null;

  const verdict = evaluateRemotePatterns({
    configHosts,
    baselineHosts: baseline.hosts,
    targetHosts,
    externalRows,
  });

  if (!verdict.ok) {
    console.error(verdict.message);
    process.exit(1);
  }

  if (verdict.reason === "phase1") {
    console.log(
      `image-hosts OK — Phase 1 freeze ${configHosts.length} unique hosts. ` +
        `Phase 2 shrink to ${targetHosts.length} is blocked until audit:images prints PHASE2_EXTERNAL_ROWS=0.`,
    );
    return;
  }

  console.log(
    `image-hosts OK — Phase 2. remotePatterns is the six targets. PHASE2_EXTERNAL_ROWS=0.`,
  );
}

main();
