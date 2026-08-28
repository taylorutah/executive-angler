"use client";

/**
 * Variant spec on the fly sheet — same measure as Recipe and Fishing now.
 * Public HTML is the size/bead/body spec. Stock and "add to box" hydrate
 * after auth so the cached page never contains another angler's counts.
 * Table scrolls at 390 only.
 */
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import type { FlyConfigurationWithBoxes } from "@/types/flies";
import {
  normalizeSizeKey,
  type PublicVariantRow,
} from "@/lib/flies/variant-rows";
import InstrumentWell from "@/components/desk/InstrumentWell";

type BoxOption = { id: string; name: string; tier: string; is_default?: boolean };

type RowState = PublicVariantRow & {
  configurationId: string | null;
  stock: number | null;
  target: number | null;
};

function stockOf(c: FlyConfigurationWithBoxes): number {
  return (c.tied_count ?? 0) + (c.bought_count ?? 0);
}

function mergeRows(
  publicRows: PublicVariantRow[],
  configs: FlyConfigurationWithBoxes[],
): RowState[] {
  const used = new Set<string>();
  const rows: RowState[] = publicRows.map((row) => {
    const key = normalizeSizeKey(row.size === "—" ? "" : row.size);
    const match = configs.find((c) => normalizeSizeKey(c.size) === key && key !== "");
    if (match) used.add(match.id);
    return {
      ...row,
      configurationId: match?.id ?? null,
      stock: match ? stockOf(match) : null,
      target: match?.target_count ?? null,
    };
  });

  for (const c of configs) {
    if (used.has(c.id)) continue;
    const size = c.size?.trim() ? (c.size.startsWith("#") ? c.size : `#${c.size}`) : "—";
    rows.push({
      key: `mine-${c.id}`,
      size,
      bead: "—",
      body: "—",
      configurationId: c.id,
      stock: stockOf(c),
      target: c.target_count,
    });
  }
  return rows;
}

interface Props {
  flyId: string;
  flySlug: string;
  flyName: string;
  publicRows: PublicVariantRow[];
}

export default function FlyVariantTable({ flyId, flySlug, flyName, publicRows }: Props) {
  const { user } = useAuth();
  const [rows, setRows] = useState<RowState[]>(() =>
    publicRows.map((r) => ({ ...r, configurationId: null, stock: null, target: null })),
  );
  const [picker, setPicker] = useState<{ size: string; boxes: BoxOption[] } | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loginHref = `/login?redirect=${encodeURIComponent(`/flies/${flySlug}`)}`;

  const applyConfigs = useCallback(
    (configs: FlyConfigurationWithBoxes[]) => {
      setRows(mergeRows(publicRows, configs));
    },
    [publicRows],
  );

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/fishing/fly-configurations?fly_id=${encodeURIComponent(flyId)}`,
        );
        if (!res.ok) return;
        const json = (await res.json()) as { configurations?: FlyConfigurationWithBoxes[] };
        if (!cancelled) applyConfigs(json.configurations ?? []);
      } catch {
        /* signed-out HTML stays */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, flyId, applyConfigs]);

  async function addSize(size: string, boxId?: string) {
    setBusyKey(size);
    setError(null);
    try {
      const res = await fetch("/api/fishing/fly-configurations/quick-add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fly_id: flyId,
          size: size === "—" ? null : size.replace(/^#/, ""),
          box_id: boxId,
        }),
      });
      if (res.status === 401) {
        window.location.href = loginHref;
        return;
      }
      const json = await res.json();
      if (res.status === 409 && json.needsBoxPicker) {
        setPicker({ size, boxes: json.boxes ?? [] });
        return;
      }
      if (!res.ok) {
        setError(typeof json.error === "string" ? json.error : "Could not add to box");
        return;
      }
      setPicker(null);
      const refresh = await fetch(
        `/api/fishing/fly-configurations?fly_id=${encodeURIComponent(flyId)}`,
      );
      if (refresh.ok) {
        const body = (await refresh.json()) as { configurations?: FlyConfigurationWithBoxes[] };
        applyConfigs(body.configurations ?? []);
      }
    } catch {
      setError("Network error");
    } finally {
      setBusyKey(null);
    }
  }

  async function setTied(row: RowState, nextTied: number) {
    if (!row.configurationId) return;
    const prev = row.stock;
    setRows((cur) =>
      cur.map((r) => (r.key === row.key ? { ...r, stock: Math.max(0, nextTied) } : r)),
    );
    setBusyKey(row.key);
    setError(null);
    try {
      const res = await fetch("/api/fishing/fly-configurations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: row.configurationId, tied_count: Math.max(0, nextTied) }),
      });
      if (!res.ok) throw new Error("Failed");
    } catch {
      setRows((cur) => cur.map((r) => (r.key === row.key ? { ...r, stock: prev } : r)));
      setError("Could not update count");
    } finally {
      setBusyKey(null);
    }
  }

  return (
    <section aria-labelledby="fly-variants-heading">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <h2
            id="fly-variants-heading"
            className="font-heading text-2xl text-[var(--text-primary)]"
          >
            Variants
          </h2>
          {!user && (
            <p className="font-ui text-[13px] text-[var(--text-body)]">
              <Link
                href={loginHref}
                className="hover-copper text-[var(--action)] underline-offset-4 hover:underline"
              >
                Sign in
              </Link>{" "}
              to put these sizes in your box.
            </p>
          )}
        </div>

        <div className="desk-table-wrap border border-[var(--border-rule)]">
          <table className="desk-table text-[13px] leading-[1.35]">
            <thead>
              <tr className="border-b border-[var(--border-rule)] bg-[var(--surface-raised)]">
                <th className="px-3 py-2 font-ui text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--text-meta)]">
                  Size
                </th>
                <th className="px-3 py-2 font-ui text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--text-meta)]">
                  Bead
                </th>
                <th className="px-3 py-2 font-ui text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--text-meta)]">
                  Body
                </th>
                <th className="px-3 py-2 text-right font-ui text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--text-meta)]">
                  In box
                </th>
                <th className="px-3 py-2 text-right font-ui text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--text-meta)]">
                  Add to box
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const zebra = i % 2 === 0 ? "bg-[var(--surface-page)]" : "bg-[var(--surface-raised)]";
                return (
                  <tr key={row.key} className={`${zebra} h-8`}>
                    <td className="px-3 font-mono text-[12px] text-[var(--text-primary)]">
                      {row.size}
                    </td>
                    <td className="px-3 text-[var(--text-body)]">{row.bead}</td>
                    <td className="px-3 text-[var(--text-body)]">{row.body}</td>
                    <td className="px-3 text-right">
                      {user && row.stock != null ? (
                        <span className="num text-[var(--text-primary)]">{row.stock}</span>
                      ) : (
                        <span className="text-[var(--text-meta)]">—</span>
                      )}
                    </td>
                    <td className="px-3 text-right">
                      {!user ? (
                        <Link
                          href={loginHref}
                          className="text-[13px] text-[var(--action)] underline-offset-4 hover:underline"
                        >
                          Sign in
                        </Link>
                      ) : row.configurationId && row.stock != null ? (
                        <span className="inline-flex items-center justify-end gap-1">
                          <button
                            type="button"
                            disabled={busyKey === row.key || row.stock === 0}
                            onClick={() => setTied(row, (row.stock ?? 0) - 1)}
                            aria-label={`Remove one ${flyName} ${row.size}`}
                            className="inline-flex h-7 w-7 items-center justify-center border border-[var(--border-strong)] text-[var(--text-primary)] hover:border-[var(--action)] disabled:opacity-40"
                          >
                            −
                          </button>
                          <span className="num w-6 text-center text-[var(--text-primary)]">
                            {row.stock}
                          </span>
                          <button
                            type="button"
                            disabled={busyKey === row.key}
                            onClick={() => setTied(row, (row.stock ?? 0) + 1)}
                            aria-label={`Add one ${flyName} ${row.size}`}
                            className="inline-flex h-7 w-7 items-center justify-center border border-[var(--border-strong)] text-[var(--text-primary)] hover:border-[var(--action)] disabled:opacity-40"
                          >
                            +
                          </button>
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={!!busyKey}
                          onClick={() => addSize(row.size)}
                          className="bg-[var(--action)] px-2.5 py-1 text-[12px] font-semibold text-[var(--on-action)] hover:bg-[var(--action-hover)] disabled:opacity-50"
                        >
                          {busyKey === row.size ? "Adding…" : "Add"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {error && (
          <p className="mt-3 text-[12px] text-[var(--state-negative)]" role="status">
            {error}
          </p>
        )}

        {picker && (
          <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-[var(--surface-page)]/70 sm:items-center"
            role="dialog"
            aria-modal="true"
            aria-labelledby="variant-box-picker"
            onClick={() => setPicker(null)}
          >
            <div onClick={(e) => e.stopPropagation()}>
            <InstrumentWell
              className="w-full max-w-md bg-[var(--surface-raised)] p-5"
              label="Which box?"
            >
              <h3 id="variant-box-picker" className="font-heading text-lg">
                Which box?
              </h3>
              <p className="mt-1 text-[13px] text-[var(--text-meta)]">
                Add {flyName} {picker.size} to one of your boxes.
              </p>
              <ul className="mt-4 space-y-1">
                {picker.boxes.map((b) => (
                  <li key={b.id}>
                    <button
                      type="button"
                      onClick={() => addSize(picker.size, b.id)}
                      className="flex w-full items-center justify-between border border-[var(--border-rule)] px-3 py-2 text-left text-[13px] hover:border-[var(--action)]"
                    >
                      <span>{b.name}</span>
                      {b.tier && (
                        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-meta)]">
                          {b.tier}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => setPicker(null)}
                className="mt-4 w-full border border-[var(--border-rule)] px-3 py-2 text-[12px] text-[var(--text-body)] hover:border-[var(--action)]"
              >
                Cancel
              </button>
            </InstrumentWell>
            </div>
          </div>
        )}
    </section>
  );
}
