"use client";

/**
 * Variant table — one bordered instrument on paper (DESIGN.md §4 `.ea-table`).
 * Public HTML is size / bead / body. Stock and add-to-box hydrate after auth.
 * Signed-out: one sign-in line for the module, not a control on every row.
 */
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import QuickAddToBoxSheet from "@/components/flies/QuickAddToBoxSheet";
import type { FlyConfigurationWithBoxes } from "@/types/flies";
import {
  normalizeSizeKey,
  type PublicVariantRow,
} from "@/lib/flies/variant-rows";

type RowState = PublicVariantRow & {
  configurationId: string | null;
  stock: number | null;
  tied: number | null;
  bought: number | null;
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
      tied: match?.tied_count ?? null,
      bought: match?.bought_count ?? null,
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
      tied: c.tied_count ?? 0,
      bought: c.bought_count ?? 0,
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
    publicRows.map((r) => ({
      ...r,
      configurationId: null,
      stock: null,
      tied: null,
      bought: null,
      target: null,
    })),
  );
  const [quickAddSize, setQuickAddSize] = useState<string | null>(null);
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

  async function refreshConfigs() {
    const refresh = await fetch(
      `/api/fishing/fly-configurations?fly_id=${encodeURIComponent(flyId)}`,
    );
    if (refresh.ok) {
      const body = (await refresh.json()) as { configurations?: FlyConfigurationWithBoxes[] };
      applyConfigs(body.configurations ?? []);
    }
  }

  async function setTied(row: RowState, nextTied: number) {
    if (!row.configurationId) return;
    const tied = Math.max(0, nextTied);
    const bought = row.bought ?? 0;
    const prevTied = row.tied;
    const prevStock = row.stock;
    setRows((cur) =>
      cur.map((r) =>
        r.key === row.key ? { ...r, tied, stock: tied + bought } : r,
      ),
    );
    setBusyKey(row.key);
    setError(null);
    try {
      const res = await fetch("/api/fishing/fly-configurations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: row.configurationId, tied_count: tied }),
      });
      if (!res.ok) throw new Error("Failed");
    } catch {
      setRows((cur) =>
        cur.map((r) =>
          r.key === row.key ? { ...r, tied: prevTied, stock: prevStock } : r,
        ),
      );
      setError("Could not update count");
    } finally {
      setBusyKey(null);
    }
  }

  return (
    <section className="desk-table-wrap bg-[var(--vellum)]" aria-labelledby="fly-variants-heading">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="ea-overline">Workbench</p>
          <h2 id="fly-variants-heading">Variants</h2>
        </div>
        {!user && (
          <p className="text-[13px] text-[var(--text-2)]">
            <Link
              href={loginHref}
              className="text-[var(--accent)] underline-offset-4 hover:underline"
            >
              Sign in to put these sizes in your box
            </Link>
          </p>
        )}
      </div>

      <p className="mb-3 text-[13px] text-[var(--text-3)] md:hidden">
        Swipe to see In box and Add
      </p>

      <div className="overflow-x-auto" tabIndex={0} aria-label="Variant sizes">
        <table className="ea-table min-w-[32rem] text-left">
          <thead>
            <tr>
              <th>Size</th>
              <th>Bead</th>
              <th>Body</th>
              <th className="text-right">In box</th>
              <th className="text-right">Add to box</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key}>
                <td className="align-middle text-[var(--text-1)]">
                  <span className="num">{row.size}</span>
                </td>
                <td className="align-middle text-[var(--text-2)]">{row.bead}</td>
                <td className="align-middle text-[var(--text-2)]">{row.body}</td>
                <td className="align-middle text-right">
                  {user && row.stock != null ? (
                    <span className="num text-[var(--text-1)]">{row.stock}</span>
                  ) : (
                    <span className="text-[var(--text-3)]">—</span>
                  )}
                </td>
                <td className="align-middle text-right">
                  {!user ? (
                    <span className="text-[var(--text-3)]">—</span>
                  ) : row.configurationId && row.stock != null ? (
                    <span className="inline-flex items-center justify-end gap-1">
                      <button
                        type="button"
                        disabled={busyKey === row.key || (row.tied ?? 0) === 0}
                        onClick={() => setTied(row, (row.tied ?? 0) - 1)}
                        aria-label={`Remove one tied ${flyName} ${row.size}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-strong)] text-[var(--text-1)] hover:border-[var(--accent)] disabled:opacity-50"
                      >
                        −
                      </button>
                      <span className="num w-6 text-center text-[var(--text-1)]">
                        {row.stock}
                      </span>
                      <button
                        type="button"
                        disabled={busyKey === row.key}
                        onClick={() => setTied(row, (row.tied ?? 0) + 1)}
                        aria-label={`Add one tied ${flyName} ${row.size}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-strong)] text-[var(--text-1)] hover:border-[var(--accent)] disabled:opacity-50"
                      >
                        +
                      </button>
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={!!busyKey}
                      onClick={() => setQuickAddSize(row.size)}
                      className="ea-btn ea-btn-sm ea-btn-primary"
                    >
                      Add
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {error && (
        <p className="mt-3 text-[12px] text-[var(--danger)]" role="status">
          {error}
        </p>
      )}

      <QuickAddToBoxSheet
        open={quickAddSize != null}
        fly={{ id: flyId, name: flyName, slug: flySlug }}
        defaultQtySource="tied"
        initialSizes={
          quickAddSize && quickAddSize !== "—" ? [quickAddSize] : undefined
        }
        onClose={() => setQuickAddSize(null)}
        onSaved={() => {
          setQuickAddSize(null);
          void refreshConfigs();
        }}
      />
    </section>
  );
}
