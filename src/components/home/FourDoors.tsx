import Link from "next/link";
import SafeEntityImage from "@/components/media/SafeEntityImage";

export interface Door {
  label: string;
  href: string;
  count: number;
  noun: string;
  imageUrl?: string;
}

interface Props {
  doors: Door[];
}

/** Band 4 — the four doors into the reference, as photographs rather than icons. */
export default function FourDoors({ doors }: Props) {
  return (
    <section className="bg-[var(--surface-page)] py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {doors.map((door) => (
            <Link
              key={door.href}
              href={door.href}
              className="group relative block aspect-[3/4] overflow-hidden rounded-lg border border-[var(--border-rule)] sm:aspect-[2/3]"
            >
              <SafeEntityImage
                src={door.imageUrl}
                alt=""
                title={door.label}
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 1024px) 50vw, 25vw"
                scrimClassName="bg-gradient-to-t from-black/80 via-black/20 to-transparent"
              />
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                <h2 className="font-heading text-2xl font-bold text-white drop-shadow sm:text-3xl">
                  {door.label}
                </h2>
                {door.count > 0 && (
                  <p className="num mt-1 text-[13px] text-white/85">
                    {door.count.toLocaleString("en-US")} {door.noun}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
