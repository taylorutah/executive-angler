import type { CardData } from "@/types/list-config";
import DeskPhotoCard from "./DeskPhotoCard";

interface Props {
  items: CardData[];
  liveCfs?: Record<string, string>;
}

/** Featured row (lead + two sides) then a 3-up pictures grid. */
export default function DeskMagazine({ items, liveCfs }: Props) {
  if (items.length === 0) return null;

  const [lead, sideA, sideB, ...rest] = items;

  return (
    <div className="flex flex-col gap-7">
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.9fr)_minmax(0,1fr)]">
        <DeskPhotoCard
          href={lead.href}
          imageUrl={lead.imageUrl}
          imageAlt={lead.imageAlt}
          title={lead.title}
          meta={lead.meta ?? lead.subtitle}
          featured
          liveHint={liveCfs?.[lead.href]}
        />
        <div className="flex flex-col gap-4">
          {sideA && (
            <DeskPhotoCard
              href={sideA.href}
              imageUrl={sideA.imageUrl}
              imageAlt={sideA.imageAlt}
              title={sideA.title}
              meta={sideA.meta ?? sideA.subtitle}
              liveHint={liveCfs?.[sideA.href]}
            />
          )}
          {sideB && (
            <DeskPhotoCard
              href={sideB.href}
              imageUrl={sideB.imageUrl}
              imageAlt={sideB.imageAlt}
              title={sideB.title}
              meta={sideB.meta ?? sideB.subtitle}
              liveHint={liveCfs?.[sideB.href]}
            />
          )}
        </div>
      </div>

      {rest.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((item) => (
            <li key={item.href}>
              <DeskPhotoCard
                href={item.href}
                imageUrl={item.imageUrl}
                imageAlt={item.imageAlt}
                title={item.title}
                meta={item.meta ?? item.subtitle}
                liveHint={liveCfs?.[item.href]}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
