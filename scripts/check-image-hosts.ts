/**
 * Fail CI if next.config.ts remotePatterns grows beyond the committed baseline.
 *
 *   npm run check:image-hosts
 *
 * To allow a new host: add it to scripts/image-hosts-baseline.json in the
 * same PR as the config change. That is the reviewable act. The post-migration
 * target (storage + Google avatars only) lives in image-hosts-target.json
 * and is not enforced until Unsplash ingest lands.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

interface Pattern {
  host: string;
}

function parseRemotePatterns(configPath: string): Pattern[] {
  const text = readFileSync(configPath, "utf8");
  const patterns: Pattern[] = [];
  const re = /hostname:\s*"([^"]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    patterns.push({ host: m[1] });
  }
  return patterns;
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

function main() {
  const root = process.cwd();
  const configHosts = unique(
    parseRemotePatterns(resolve(root, "next.config.ts")).map((p) => p.host),
  );
  const baseline = JSON.parse(
    readFileSync(resolve(root, "scripts/image-hosts-baseline.json"), "utf8"),
  ) as { hosts: string[] };
  const allowed = new Set(baseline.hosts);

  const extra = configHosts.filter((h) => !allowed.has(h));
  const missing = baseline.hosts.filter((h) => !configHosts.includes(h));

  if (extra.length) {
    console.error("next.config.ts remotePatterns grew beyond the baseline:\n");
    for (const h of extra) console.error("  + " + h);
    console.error("\nAdd the host to scripts/image-hosts-baseline.json only with a reason.");
    process.exit(1);
  }

  if (missing.length) {
    console.error("Baseline lists hosts that are no longer in next.config.ts:\n");
    for (const h of missing) console.error("  - " + h);
    console.error("\nUpdate the baseline in the same PR that removed them.");
    process.exit(1);
  }

  const target = JSON.parse(
    readFileSync(resolve(root, "scripts/image-hosts-target.json"), "utf8"),
  ) as { hosts: Array<{ hostname: string }> };
  console.log(
    `image-hosts OK — ${configHosts.length} unique hosts (target after ingest: ${target.hosts.length})`,
  );
}

main();
