import Link from "next/link";
import type { CardData } from "@/types/list-config";
import SafeEntityImage from "@/components/media/SafeEntityImage";

interface Props {
  items: CardData[];
}

/** Field Notes archive: featured split + “From the year” rows. Frame 81:440. */
export default function DeskArchive({ items }: Props) {
  if (items.length === 0) return null;

  const [lead, ...rest] = items;

  return (
    <div>
      <Link href={lead.href} className="group grid items-start gap-8 lg:grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)]">
        <div className="photo-lift relative aspect-[794/420] w-full">
          <SafeEntityImage
            src={lead.imageUrl}
            alt={lead.imageAlt}
            title={lead.title}
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 62vw"
            priority
          />
        </div>
        <div className="flex flex-col gap-3">
          <p className="font-ui text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--text-meta)]">
            {lead.badges?.[0] ? lead.badges[0] : "Field note"}
          </p>
          <h2
            className="hover-copper font-heading text-[28px] font-semibold leading-[34px] text-[var(--text-primary)] group-hover:text-[var(--action)] sm:text-[32px] sm:leading-[38px]"
            style={{ fontVariationSettings: '"SOFT" 0, "WONK" 1' }}
          >
            {lead.title}
          </h2>
          {lead.meta ? (
            <p className="font-ui text-[13px] text-[var(--text-meta)]">{lead.meta}</p>
          ) : null}
          {lead.description ? (
            <p className="font-ui text-[16px] leading-6 text-[var(--text-body)]">{lead.description}</p>
          ) : null}
          <span className="mt-1 font-ui text-[14px] font-medium text-[var(--action)]">
            Read the note →
          </span>
        </div>
      </Link>

      {rest.length > 0 ? (
        <div className="mt-10">
          <h3
            className="mb-4 font-heading text-[28px] font-semibold text-[var(--text-primary)]"
            style={{ fontVariationSettings: '"SOFT" 0, "WONK" 1' }}
          >
            From the year
          </h3>
          <ul>
            {rest.map((item) => (
              <li key={item.href} className="border-t border-[var(--border-rule)]">
                <Link
                  href={item.href}
                  className="group flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:gap-6"
                >
                  <div className="photo-lift relative h-[140px] w-full shrink-0 sm:w-[240px]">
                    <SafeEntityImage
                      src={item.imageUrl}
                      alt={item.imageAlt}
                      title={item.title}
                      className="object-cover"
                      sizes="240px"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    {item.badges?.[0] || item.meta ? (
                      <p className="font-ui text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--text-meta)]">
                        {[item.badges?.[0], item.meta].filter(Boolean).join("  ·  ")}
                      </p>
                    ) : null}
                    <h4
                      className="hover-copper mt-1.5 font-heading text-[22px] font-semibold leading-[26px] text-[var(--text-primary)] group-hover:text-[var(--action)]"
                      style={{ fontVariationSettings: '"SOFT" 0, "WONK" 1' }}
                    >
                      {item.title}
                    </h4>
                    {item.description ? (
                      <p className="mt-1.5 max-w-[720px] font-ui text-[14px] leading-5 text-[var(--text-body)]">
                        {item.description}
                      </p>
                    ) : null}
                  </div>
                  <span className="shrink-0 font-ui text-[13px] font-medium text-[var(--action)]">
                    Read →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
