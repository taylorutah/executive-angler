import Link from "next/link";
import type { CardData } from "@/types/list-config";

export type AlsoKeptGroup = { group: string; items: CardData[] };

/** Places / Flies INDEX list: name + one meta line, grouped. */
export function groupAlsoKept(items: CardData[]): AlsoKeptGroup[] {
  const map = new Map<string, CardData[]>();
  for (const item of items) {
    const key = item.group?.trim() || "Also kept";
    const list = map.get(key);
    if (list) list.push(item);
    else map.set(key, [item]);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([group, rows]) => ({
      group,
      items: [...rows].sort((a, b) => a.title.localeCompare(b.title)),
    }));
}

interface Props {
  items: CardData[];
  heading?: string;
}

/** INDEX List / Also kept — same language as Places Index 81:246. */
export default function DeskAlsoKept({ items, heading = "Also kept" }: Props) {
  if (items.length === 0) return null;

  const groups = groupAlsoKept(items);
  const namedGroups = groups.length > 1 || groups[0]?.group !== "Also kept";

  return (
    <div>
      <h2
        className="font-heading text-[28px] font-semibold text-[var(--text-primary)]"
        style={{ fontVariationSettings: '"SOFT" 0, "WONK" 1' }}
      >
        {heading}
      </h2>
      <div className={namedGroups ? "mt-8 space-y-10" : "mt-6"}>
        {groups.map((block) => (
          <section key={block.group}>
            {namedGroups ? (
              <h3 className="mb-3 font-ui text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--text-meta)]">
                {block.group}
              </h3>
            ) : null}
            <ul className="divide-y divide-[var(--border-rule)] border-t border-[var(--border-rule)]">
              {block.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="ea-focus-ring group flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
                  >
                    <span
                      className="hover-copper font-heading text-[20px] font-semibold leading-[25px] text-[var(--text-primary)] group-hover:text-[var(--action)]"
                      style={{ fontVariationSettings: '"SOFT" 0, "WONK" 1' }}
                    >
                      {item.title}
                    </span>
                    {item.meta || item.subtitle ? (
                      <span className="font-ui text-[13px] text-[var(--text-meta)]">
                        {item.meta || item.subtitle}
                      </span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
