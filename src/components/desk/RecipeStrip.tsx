import Link from "next/link";
import type { LinkedMaterialSlot } from "@/lib/flies/link-materials";

function formatSlotLabel(slot: string): string {
  return (
    slot
      .split(/[_\s]+/)
      .filter(Boolean)
      .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
      .join(" ") || "Material"
  );
}

interface Props {
  materials: LinkedMaterialSlot[];
  notes?: string | null;
}

/**
 * Hook / thread / bead / dubbing as a bill of materials.
 * Tabular numerals (`.num`) for sizes — mono is retired (DESIGN.md §2).
 */
export default function RecipeStrip({ materials, notes }: Props) {
  const hasMaterials = materials.length > 0;

  return (
    <section aria-labelledby="recipe-strip-heading" className="mx-auto max-w-[var(--container)] px-4 sm:px-6 lg:px-8">
      <h2
        id="recipe-strip-heading"
        className="font-heading text-2xl font-semibold leading-tight text-[var(--text-1)]"
      >
        Recipe
      </h2>
      {hasMaterials ? (
        <ul className="mt-4 max-w-2xl divide-y divide-[var(--border)] border-y border-[var(--border)]">
          {materials.map((m, i) => {
            const slotLabel = formatSlotLabel(String(m.slot ?? "Material"));
            const detail = [m.material, m.brand].filter(Boolean).join(" · ");
            const sizeMatch = detail.match(/#\d+/);
            return (
              <li key={i} className="flex items-baseline gap-3 py-3 text-[14px]">
                <span className="ea-overline w-24 shrink-0">
                  {slotLabel}
                </span>
                {m.href ? (
                  <Link
                    href={m.href}
                    className="text-[var(--text-1)] underline-offset-4 hover:text-[var(--accent)] hover:underline"
                  >
                    {sizeMatch ? (
                      <>
                        {detail.slice(0, sizeMatch.index)}
                        <span className="num">{sizeMatch[0]}</span>
                        {detail.slice((sizeMatch.index ?? 0) + sizeMatch[0].length)}
                      </>
                    ) : (
                      detail || m.catalogName || "—"
                    )}
                  </Link>
                ) : (
                  <span className="text-[var(--text-1)]">
                    {sizeMatch ? (
                      <>
                        {detail.slice(0, sizeMatch.index)}
                        <span className="num">{sizeMatch[0]}</span>
                        {detail.slice((sizeMatch.index ?? 0) + sizeMatch[0].length)}
                      </>
                    ) : (
                      detail || "—"
                    )}
                  </span>
                )}
                {m.description && (
                  <span className="text-[13px] text-[var(--text-2)]">{m.description}</span>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-3 text-[14px] text-[var(--text-2)]">Recipe not filled in yet.</p>
      )}
      {notes && (
        <div className="prose mt-6 max-w-[var(--prose)]">
          <p className="whitespace-pre-line">{notes}</p>
        </div>
      )}
    </section>
  );
}
