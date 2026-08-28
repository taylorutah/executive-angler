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
 * Spec sheet on the parent desk measure.
 * Label 7em Plex Mono, value Archivo. Brand Bible v4.1 §12 RecipeStrip.
 */
export default function RecipeStrip({ materials, notes }: Props) {
  const hasMaterials = materials.length > 0;

  return (
    <section aria-labelledby="recipe-strip-heading">
      <h2
        id="recipe-strip-heading"
        className="font-heading text-2xl text-[var(--text-primary)]"
      >
        Recipe
      </h2>
      {hasMaterials ? (
        <ul className="desk-recipe mt-4">
          {materials.map((m, i) => {
            const slotLabel = formatSlotLabel(String(m.slot ?? "Material"));
            const detail = [m.material, m.brand].filter(Boolean).join(" · ");
            const sizeMatch = detail.match(/#\d+/);
            const value = sizeMatch ? (
              <>
                {detail.slice(0, sizeMatch.index)}
                <span className="font-mono">{sizeMatch[0]}</span>
                {detail.slice((sizeMatch.index ?? 0) + sizeMatch[0].length)}
              </>
            ) : (
              detail || m.catalogName || "—"
            );
            return (
              <li key={i} className="desk-recipe-row">
                <span className="desk-recipe-label">{slotLabel}</span>
                <span className="desk-recipe-value">
                  {m.href ? (
                    <Link
                      href={m.href}
                      className="hover-copper underline-offset-4 hover:text-[var(--action)] hover:underline"
                    >
                      {value}
                    </Link>
                  ) : (
                    value
                  )}
                  {m.description && (
                    <span className="mt-0.5 block text-[13px] text-[var(--text-body)]">
                      {m.description}
                    </span>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-3 font-ui text-[15px] text-[var(--text-body)]">
          Recipe not filled in yet.
        </p>
      )}
      {notes && (
        <div className="prose mt-6">
          <p className="whitespace-pre-line">{notes}</p>
        </div>
      )}
    </section>
  );
}
