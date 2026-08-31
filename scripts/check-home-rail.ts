/**
 * Smoke: the public homepage rail must include a numeric cfs in the HTML.
 * That is first paint — not a client fetch after hydration.
 *
 *   BASE_URL=http://127.0.0.1:3010 npm run check:home-rail
 */
const BASE = process.env.BASE_URL ?? "http://localhost:3000";

export async function railCfsCount(htmlOrPageCfs: string[]): Promise<number> {
  return htmlOrPageCfs.filter((t) => /\d[\d,]*\s*cfs/i.test(t)).length;
}

/** True when the SSR rail (not a later client paint) already has a CFS figure. */
export function railHtmlHasCfs(html: string): boolean {
  const idx = html.indexOf("data-home-rail");
  if (idx < 0) return false;
  const slice = html.slice(idx, idx + 12_000).replace(/<[^>]+>/g, " ");
  return /\d[\d,]*\s*cfs/i.test(slice);
}

async function main() {
  const res = await fetch(`${BASE}/`, { redirect: "follow" });
  if (!res.ok) {
    throw new Error(`GET / failed: ${res.status}`);
  }
  const html = await res.text();
  if (!railHtmlHasCfs(html)) {
    const idx = html.indexOf("data-home-rail");
    const slice = idx >= 0 ? html.slice(idx, idx + 800) : "(data-home-rail missing)";
    console.error("home rail HTML has no numeric cfs:\n", slice);
    process.exit(1);
  }
  console.log("home rail OK — numeric cfs present in SSR HTML");
}

const isEntry = process.argv[1] && process.argv[1].includes("check-home-rail.ts");
if (isEntry) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
