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
    <section className="bg-[var(--surface-raised)] border-t border-[var(--border-rule)] py-16 sm:py-20">
      <div className="mx-auto max-w-7xl space-y-14 px-4 sm:px-6 lg:px-8">
        <div>
          <h2 className="font-heading text-2xl text-[var(--text-primary)]">
            On the ground
          </h2>
          <p className="mt-2 text-sm text-[var(--text-body)]">
            Reached from the water, not as a directory.
          </p>
        </div>

        {sections.map(({ river, lodges: riverLodges, guides: riverGuides }) => (
          <div key={river.id} className="space-y-8">
            {riverLodges.length > 0 && (
              <div>
                <h3 className="font-heading text-lg text-[var(--text-primary)]">
                  Lodges on the {river.name}
                </h3>
                <ul className="mt-4 divide-y divide-[var(--border-rule)] border-y border-[var(--border-rule)]">
                  {riverLodges.map((lodge) => (
                    <li key={lodge.id}>
                      <Link
                        href={`/lodges/${lodge.slug}`}
                        className="flex items-baseline justify-between gap-4 py-3 text-[15px] hover:text-[var(--action)]"
                      >
                        <span className="font-medium text-[var(--text-primary)]">
                          {lodge.name}
                        </span>
                        {lodge.priceRange && (
                          <span className="shrink-0 text-[13px] text-[var(--text-body)]">
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
                <h3 className="font-heading text-lg text-[var(--text-primary)]">
                  Guides on the {river.name}
                </h3>
                <ul className="mt-4 divide-y divide-[var(--border-rule)] border-y border-[var(--border-rule)]">
                  {riverGuides.map((guide) => (
                    <li key={guide.id}>
                      <Link
                        href={`/guides/${guide.slug}`}
                        className="block py-3 hover:text-[var(--action)]"
                      >
                        <span className="font-medium text-[var(--text-primary)]">
                          {guide.name}
                        </span>
                        {(guide.specialties ?? []).length > 0 && (
                          <p className="mt-0.5 text-[13px] text-[var(--text-body)]">
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
            <h3 className="font-heading text-lg text-[var(--text-primary)]">
              Lodges in {placeName}
            </h3>
            <ul className="mt-4 divide-y divide-[var(--border-rule)] border-y border-[var(--border-rule)]">
              {unassignedLodges.map((lodge) => (
                <li key={lodge.id}>
                  <Link
                    href={`/lodges/${lodge.slug}`}
                    className="flex items-baseline justify-between gap-4 py-3 text-[15px]"
                  >
                    <span className="font-medium text-[var(--text-primary)]">
                      {lodge.name}
                    </span>
                    {lodge.priceRange && (
                      <span className="shrink-0 text-[13px] text-[var(--text-body)]">
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
            <h3 className="font-heading text-lg text-[var(--text-primary)]">
              Guides in {placeName}
            </h3>
            <ul className="mt-4 divide-y divide-[var(--border-rule)] border-y border-[var(--border-rule)]">
              {unassignedGuides.map((guide) => (
                <li key={guide.id}>
                  <Link
                    href={`/guides/${guide.slug}`}
                    className="block py-3"
                  >
                    <span className="font-medium text-[var(--text-primary)]">
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
            <h3 className="font-heading text-lg text-[var(--text-primary)]">
              Fly shops in {placeName}
            </h3>
            <ul className="mt-4 divide-y divide-[var(--border-rule)] border-y border-[var(--border-rule)]">
              {flyShops.map((shop) => (
                <li key={shop.id}>
                  <Link
                    href={`/fly-shops/${shop.slug}`}
                    className="block py-3"
                  >
                    <span className="font-medium text-[var(--text-primary)]">
                      {shop.name}
                    </span>
                    <p className="mt-0.5 text-[13px] text-[var(--text-body)]">
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
