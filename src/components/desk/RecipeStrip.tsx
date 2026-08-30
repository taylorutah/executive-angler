import Link from "next/link";
import type { LinkedMaterialSlot } from "@/lib/flies/link-materials";
import { uniqueRecipeRows } from "@/lib/flies/recipe-slots";

interface Props {
  materials: LinkedMaterialSlot[];
  notes?: string | null;
}

function materialLine(material?: string | null, brand?: string | null): string {
  return [material, brand].filter(Boolean).join(" · ");
}

function withTabularSizes(text: string) {
  const sizeMatch = text.match(/#\d+/);
  if (!sizeMatch || sizeMatch.index == null) return text;
  return (
    <>
      {text.slice(0, sizeMatch.index)}
      <span className="num">{sizeMatch[0]}</span>
      {text.slice(sizeMatch.index + sizeMatch[0].length)}
    </>
  );
}

/**
 * Hook / bead / thread / tail / body / rib / wingcase / thorax.
 * Inter labels, tabular sizes, materials linked. One slot label each.
 */
export default function RecipeStrip({ materials, notes }: Props) {
  const rows = uniqueRecipeRows(materials);

  return (
    <section aria-labelledby="recipe-strip-heading" className="desk-recipe">
      <h2 id="recipe-strip-heading">Recipe</h2>
      {rows.length > 0 ? (
        <ul className="desk-rule-list mt-4 divide-y divide-[var(--border)] border-y border-[var(--border)]">
          {rows.map((m, i) => {
            const detail = materialLine(m.material, m.brand);
            const text = detail || m.catalogName || "—";
            return (
              <li key={`${m.label}-${i}`} className="py-3 text-[14px]">
                <span className="desk-recipe-label">{m.label}</span>
                <span>
                  {m.href ? (
                    <Link
                      href={m.href}
                      className="text-[var(--text-1)] underline-offset-4 hover:text-[var(--accent)] hover:underline"
                    >
                      {withTabularSizes(text)}
                    </Link>
                  ) : (
                    <span className="text-[var(--text-1)]">{withTabularSizes(text)}</span>
                  )}
                  {m.description ? (
                    <span className="mt-1 block text-[13px] text-[var(--text-2)]">
                      {m.description}
                    </span>
                  ) : null}
                </span>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-3 text-[14px] text-[var(--text-2)]">Recipe not filled in yet.</p>
      )}
      {notes ? (
        <div className="prose mt-6">
          <p className="whitespace-pre-line">{notes}</p>
        </div>
      ) : null}
    </section>
  );
}
