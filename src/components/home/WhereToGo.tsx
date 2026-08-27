import Link from "next/link";
import SafeEntityImage from "@/components/media/SafeEntityImage";
import { photoAlt } from "./homepage-images";
import HomeGutter from "./HomeGutter";

export type PlaceCard = {
  href: string;
  name: string;
  imageUrl?: string | null;
  imageAlt?: string | null;
  caption: string;
};

interface Props {
  places: PlaceCard[];
}

export function seasonLine(bestMonths: string[], month: string): string | null {
  const months = bestMonths ?? [];
  if (months.length === 0) return null;
  if (months.includes(month)) return `Best in ${month}`;
  if (months.length === 1) return `Best in ${months[0]}`;
  return `Best ${months[0]}–${months[months.length - 1]}`;
}

/** Three landscape place cards. Name stays; copper on hover. */
export default function WhereToGo({ places }: Props) {
  if (places.length === 0) return null;

  return (
    <section data-lane="resource" className="bg-[var(--surface-page)] pb-12 pt-4">
      <HomeGutter>
        <h2
          className="font-heading text-[36px] font-semibold leading-none text-[var(--text-primary)]"
          style={{ fontVariationSettings: '"SOFT" 0, "WONK" 1' }}
        >
          Where to go
        </h2>
        <ul className="mt-4 grid gap-4 lg:grid-cols-3">
          {places.map((place) => (
            <li key={place.href}>
              <Link href={place.href} className="group block">
                <div className="photo-lift relative aspect-[416/258] w-full">
                  <SafeEntityImage
                    src={place.imageUrl}
                    alt={photoAlt(place.imageAlt, place.name)}
                    title={place.name}
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                  />
                </div>
                <h3
                  className="mt-2 font-heading text-[22px] font-semibold leading-none text-[var(--text-primary)] group-hover:text-[var(--action)]"
                  style={{ fontVariationSettings: '"SOFT" 0, "WONK" 1' }}
                >
                  {place.name}
                </h3>
                <p className="mt-2 font-ui text-[13px] text-[var(--text-meta)]">{place.caption}</p>
              </Link>
            </li>
          ))}
        </ul>
      </HomeGutter>
    </section>
  );
}
