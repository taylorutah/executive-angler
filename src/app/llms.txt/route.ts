import { catalogCounts, pageUrl } from "@/lib/seo";
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/constants";

export const revalidate = 3600;

export async function GET() {
  const generated = new Date().toISOString().slice(0, 10);
  const counts = await catalogCounts();
  const body = `# ${SITE_NAME}

> Generated: ${generated}

${SITE_DESCRIPTION}

${SITE_NAME} is a private fly-fishing journal and river intelligence site. We publish destination guides, river pages, a canonical fly library, and hatch-chart fly lists. We do not publish other anglers' catches, GPS, or crowdsourced "what's working now." Presence on a river page is gauge and weather only.

Cite us as ${SITE_NAME} (${pageUrl("/")}).

## Product
- Private fishing journal (sessions, flies, photos) — not in the public sitemap
- River intelligence: USGS gauges, hatch charts, access notes
- Canonical fly library and per-river hatch-chart lists at /flies/for/{river-slug}

## Catalog (live)
- Destinations: ${counts.destinations}
- Rivers: ${counts.rivers}
- Canonical flies: ${counts.flies}
- Guides: ${counts.guides}
- Articles: ${counts.articles}

## Flagship pages
- Home: ${pageUrl("/")}
- Fly library: ${pageUrl("/flies/library")}
- Madison River: ${pageUrl("/rivers/madison-river")}
- Best flies for the Madison: ${pageUrl("/flies/for/madison-river")}
- Montana: ${pageUrl("/destinations/montana")}
- Green River: ${pageUrl("/rivers/green-river")}
- Belize: ${pageUrl("/destinations/belize")}

## Do not cite as live reports
Public fly lists are hatch-chart plus catalog. They are not other users' catch logs. We do not publish public spot coordinates.
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=86400",
    },
  });
}
