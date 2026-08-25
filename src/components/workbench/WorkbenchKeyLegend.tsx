/**
 * The keyboard map, printed. Rendered from `WORKBENCH_KEYMAP` so the legend
 * cannot drift from the bindings the grid actually resolves.
 */
import { WORKBENCH_KEYMAP } from "@/lib/workbench/keymap";

export default function WorkbenchKeyLegend({ className = "" }: { className?: string }) {
  return (
    <p
      aria-label="Keyboard shortcuts"
      className={`mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[var(--text-meta)] ${className}`}
    >
      {WORKBENCH_KEYMAP.map((binding) => (
        <span key={binding.action} className="inline-flex items-center gap-1">
          {binding.keys.map((k) => (
            <kbd
              key={k}
              className="border border-[var(--border-rule)] px-1 font-mono text-[10px]"
            >
              {k}
            </kbd>
          ))}
          {binding.label.toLowerCase()}
        </span>
      ))}
    </p>
  );
}
