import Link from "next/link";
import type { Guide, Lodge } from "@/types/entities";
import type { FlyShop } from "@/types/entities";

interface RiverRef {
  id: string;
  slug: string;
  name: string;
}

interface Props {
  placeName: string;
  rivers: RiverRef[];
  lodges: Lodge[];
  guides: Guide[];
  flyShops: FlyShop[];
}

/**
 * Lodges, guides, and shops grouped by river — contextual, not an alphabetical wall.
 */
export default function PlaceRiverDirectories({
  placeName,
  rivers,
  lodges,
  guides,
  flyShops,
}: Props) {
  const riverById = new Map(rivers.map((r) => [r.id, r]));
  const sections: Array<{
    river: RiverRef;
    lodges: Lodge[];
    guides: Guide[];
  }> = [];

  for (const river of rivers) {
    const riverLodges = lodges.filter((l) =>
      (l.nearbyRiverIds ?? []).includes(river.id),
    );
    const riverGuides = guides.filter((g) =>
      (g.riverIds ?? []).includes(river.id),
    );
    if (riverLodges.length > 0 || riverGuides.length > 0) {
      sections.push({ river, lodges: riverLodges, guides: riverGuides });
    }
  }

  const unassignedLodges = lodges.filter(
    (l) => !(l.nearbyRiverIds ?? []).some((id) => riverById.has(id)),
  );
  const unassignedGuides = guides.filter(
    (g) => !(g.riverIds ?? []).some((id) => riverById.has(id)),
  );

  if (
    sections.length === 0 &&
    unassignedLodges.length === 0 &&
    unassignedGuides.length === 0 &&
    flyShops.length === 0
  ) {
    return null;
  }

  return (
    <section className="bg-[var(--paper-deep)] border-t border-[var(--border)] py-16 sm:py-24">
      <div className="mx-auto max-w-[var(--container)] space-y-12 px-4 sm:px-6 lg:px-8">
        <div>
          <h2 className="font-heading text-2xl font-semibold leading-tight text-[var(--text-1)]">
            On the ground
          </h2>
          <p className="mt-2 text-sm text-[var(--text-2)]">
            Reached from the water, not as a directory.
          </p>
        </div>

        {sections.map(({ river, lodges: riverLodges, guides: riverGuides }) => (
          <div key={river.id} className="space-y-8">
            {riverLodges.length > 0 && (
              <div>
                <h3 className="font-heading text-lg font-semibold text-[var(--text-1)]">
                  Lodges on the {river.name}
                </h3>
                <ul className="mt-4 divide-y divide-[var(--border)] border-y border-[var(--border)]">
                  {riverLodges.map((lodge) => (
                    <li key={lodge.id}>
                      <Link
                        href={`/lodges/${lodge.slug}`}
                        className="flex items-baseline justify-between gap-4 py-3 text-base hover:text-[var(--accent)]"
                      >
                        <span className="font-medium text-[var(--text-1)]">
                          {lodge.name}
                        </span>
                        {lodge.priceRange && (
                          <span className="shrink-0 text-[13px] text-[var(--text-2)]">
                            {lodge.priceRange}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {riverGuides.length > 0 && (
              <div>
                <h3 className="font-heading text-lg font-semibold text-[var(--text-1)]">
                  Guides on the {river.name}
                </h3>
                <ul className="mt-4 divide-y divide-[var(--border)] border-y border-[var(--border)]">
                  {riverGuides.map((guide) => (
                    <li key={guide.id}>
                      <Link
                        href={`/guides/${guide.slug}`}
                        className="block py-3 hover:text-[var(--accent)]"
                      >
                        <span className="font-medium text-[var(--text-1)]">
                          {guide.name}
                        </span>
                        {(guide.specialties ?? []).length > 0 && (
                          <p className="mt-0.5 text-[13px] text-[var(--text-2)]">
                            {(guide.specialties ?? []).slice(0, 3).join(" · ")}
                          </p>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}

        {unassignedLodges.length > 0 && (
          <div>
            <h3 className="font-heading text-lg font-semibold text-[var(--text-1)]">
              Lodges in {placeName}
            </h3>
            <ul className="mt-4 divide-y divide-[var(--border)] border-y border-[var(--border)]">
              {unassignedLodges.map((lodge) => (
                <li key={lodge.id}>
                  <Link
                    href={`/lodges/${lodge.slug}`}
                    className="flex items-baseline justify-between gap-4 py-3 text-base"
                  >
                    <span className="font-medium text-[var(--text-1)]">
                      {lodge.name}
                    </span>
                    {lodge.priceRange && (
                      <span className="shrink-0 text-[13px] text-[var(--text-2)]">
                        {lodge.priceRange}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {unassignedGuides.length > 0 && (
          <div>
            <h3 className="font-heading text-lg font-semibold text-[var(--text-1)]">
              Guides in {placeName}
            </h3>
            <ul className="mt-4 divide-y divide-[var(--border)] border-y border-[var(--border)]">
              {unassignedGuides.map((guide) => (
                <li key={guide.id}>
                  <Link
                    href={`/guides/${guide.slug}`}
                    className="block py-3"
                  >
                    <span className="font-medium text-[var(--text-1)]">
                      {guide.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {flyShops.length > 0 && (
          <div>
            <h3 className="font-heading text-lg font-semibold text-[var(--text-1)]">
              Fly shops in {placeName}
            </h3>
            <ul className="mt-4 divide-y divide-[var(--border)] border-y border-[var(--border)]">
              {flyShops.map((shop) => (
                <li key={shop.id}>
                  <Link
                    href={`/fly-shops/${shop.slug}`}
                    className="block py-3"
                  >
                    <span className="font-medium text-[var(--text-1)]">
                      {shop.name}
                    </span>
                    <p className="mt-0.5 text-[13px] text-[var(--text-2)]">
                      {shop.address}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
