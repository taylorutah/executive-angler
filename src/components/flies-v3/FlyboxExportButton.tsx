"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, X } from "@/icons";
import { Button } from "@/components/ui/Button";

export type FlyboxExportOption = {
  id: string;
  name: string;
  count?: number;
};

export default function FlyboxExportButton({
  boxes,
  defaultBoxId,
}: {
  boxes: FlyboxExportOption[];
  /** When set, that box is checked; otherwise every box is checked. */
  defaultBoxId?: string;
}) {
  const [open, setOpen] = useState(false);
  const defaultIds = useMemo(() => {
    if (defaultBoxId && boxes.some((b) => b.id === defaultBoxId)) {
      return new Set([defaultBoxId]);
    }
    return new Set(boxes.map((b) => b.id));
  }, [boxes, defaultBoxId]);
  const [selected, setSelected] = useState<Set<string>>(defaultIds);

  useEffect(() => {
    if (open) setSelected(new Set(defaultIds));
  }, [open, defaultIds]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  if (boxes.length === 0) return null;

  const selectedIds = boxes.filter((b) => selected.has(b.id)).map((b) => b.id);
  const noneChecked = selectedIds.length === 0;
  const allChecked = selectedIds.length === boxes.length;

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function hrefFor(format: "csv" | "pdf"): string {
    if (allChecked) return `/api/export/flybox/${format}?all=1`;
    return `/api/export/flybox/${format}?ids=${selectedIds.join(",")}`;
  }

  function download(format: "csv" | "pdf") {
    if (noneChecked) return;
    window.location.assign(hrefFor(format));
  }

  return (
    <>
      <Button variant="outline" size="sm" icon={Download} onClick={() => setOpen(true)}>
        Export
      </Button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="flybox-export-title"
          className="ea-modal-overlay z-30 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="ea-modal max-w-md p-0 overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
              <h2 id="flybox-export-title" className="font-display text-lg font-semibold text-[var(--text-1)]">
                Export fly boxes
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="rounded-[var(--radius-sm)] p-1.5 text-[var(--text-3)] hover:text-[var(--text-1)] hover:bg-[var(--paper-deep)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-4 py-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-xs text-[var(--text-3)]">
                  CSV for reorder. PDF to print for the shop.
                </p>
                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setSelected(new Set(boxes.map((b) => b.id)))}
                    className="text-[var(--accent)] hover:underline"
                  >
                    Select all
                  </button>
                  <span className="text-[var(--text-3)]">·</span>
                  <button
                    type="button"
                    onClick={() => setSelected(new Set())}
                    className="text-[var(--accent)] hover:underline"
                  >
                    Select none
                  </button>
                </div>
              </div>

              <ul className="max-h-64 space-y-1 overflow-y-auto rounded-[var(--radius-md)] border border-[var(--border)] p-2">
                {boxes.map((b) => {
                  const checked = selected.has(b.id);
                  return (
                    <li key={b.id}>
                      <label className="flex cursor-pointer items-center gap-2 rounded-[var(--radius-sm)] px-2 py-1.5 hover:bg-[var(--paper-deep)]">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggle(b.id)}
                          className="h-4 w-4 rounded-[var(--radius-sm)] border-[var(--border-strong)] text-[var(--accent)] focus:ring-[var(--accent)]"
                        />
                        <span className="min-w-0 flex-1 truncate text-sm text-[var(--text-1)]">
                          {b.name}
                        </span>
                        {b.count != null && (
                          <span className="num text-xs text-[var(--text-3)]">
                            {b.count} {b.count === 1 ? "version" : "versions"}
                          </span>
                        )}
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-[var(--border)] px-4 py-3">
              <Button
                variant="outline"
                size="sm"
                icon={Download}
                disabled={noneChecked}
                onClick={() => download("csv")}
              >
                Download CSV
              </Button>
              <Button
                variant="solid"
                size="sm"
                icon={Download}
                disabled={noneChecked}
                onClick={() => download("pdf")}
              >
                Download PDF
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
