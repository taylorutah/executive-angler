import type { ReactNode } from "react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

interface Crumb {
  label: string;
  href?: string;
}

interface Props {
  items: Crumb[];
  actions?: ReactNode;
  children?: ReactNode;
}

/**
 * Entity page chrome: parent trail + actions.
 * Mobile stacks so Save / Report never squeeze facts into a one-word column.
 * Breadcrumbs stay — on small screens that is a single parent back link.
 */
export default function EntityChrome({ items, actions, children }: Props) {
  return (
    <div className="border-b border-[var(--border)] bg-[var(--paper)]">
      <div className="mx-auto max-w-[var(--container)] px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <Breadcrumbs items={items} />
          {actions ? (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 sm:shrink-0 sm:justify-end">
              {actions}
            </div>
          ) : null}
        </div>
        {children}
      </div>
    </div>
  );
}
