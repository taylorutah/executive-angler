"use client";

/**
 * Variant table — the one public workbench module on a fly page, rendered
 * to the DESIGN.md §4 table spec (`.ea-table`: 12px/0.06em uppercase header
 * in --text-3, 1px row borders, 12px cell padding, row hover --paper-deep,
 * tabular numerals). Public HTML is the size/bead/body spec. Stock and
 * "add to box" hydrate after auth so the cached page never contains
 * another angler's counts.
 */
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import type { FlyConfigurationWithBoxes } from "@/types/flies";
import {
  normalizeSizeKey,
  type PublicVariantRow,
} from "@/lib/flies/variant-rows";
import InstrumentWell, { InstrumentWellFrame } from "@/components/desk/InstrumentWell";

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
    <InstrumentWellFrame>
      <InstrumentWell label={`Variants — ${flyName}`} className="p-4 sm:p-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="ea-overline">
              Workbench
            </p>
            <h2
              id="fly-variants-heading"
              className="font-heading text-2xl font-semibold leading-tight text-[var(--text-1)]"
            >
              Variants
            </h2>
          </div>
          {!user && (
            <p className="text-[13px] text-[var(--text-2)]">
              <Link
                href={loginHref}
                className="text-[var(--accent)] underline-offset-4 hover:underline"
              >
                Sign in
              </Link>{" "}
              to put these sizes in your box.
            </p>
          )}
        </div>

        <div className="overflow-x-auto rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]">
          <table className="ea-table min-w-[32rem] text-left">
            <thead>
              <tr>
                <th>
                  Size
                </th>
                <th>
                  Bead
                </th>
                <th>
                  Body
                </th>
                <th className="text-right">
                  In box
                </th>
                <th className="text-right">
                  Add to box
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                return (
                  <tr key={row.key}>
                    <td className="align-middle text-[var(--text-1)]">
                      {row.size}
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
                        <Link
                          href={loginHref}
                          className="text-[13px] text-[var(--accent)] underline-offset-4 hover:underline"
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
                            onClick={() => setTied(row, (row.stock ?? 0) + 1)}
                            aria-label={`Add one ${flyName} ${row.size}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-strong)] text-[var(--text-1)] hover:border-[var(--accent)] disabled:opacity-50"
                          >
                            +
                          </button>
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={!!busyKey}
                          onClick={() => addSize(row.size)}
                          className="ea-btn ea-btn-sm ea-btn-primary"
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
          <p className="mt-3 text-[12px] text-[var(--danger)]" role="status">
            {error}
          </p>
        )}

        {picker && (
          <div
            className="ea-modal-overlay z-50 flex items-end justify-center sm:items-center"
            role="dialog"
            aria-modal="true"
            aria-labelledby="variant-box-picker"
            onClick={() => setPicker(null)}
          >
            <div onClick={(e) => e.stopPropagation()}>
            <InstrumentWell
              className="w-full max-w-md bg-[var(--surface)] p-6 shadow-[var(--shadow-float)]"
              label="Which box?"
            >
              <h3 id="variant-box-picker" className="font-heading text-lg text-[var(--text-1)]">
                Which box?
              </h3>
              <p className="mt-1 text-[13px] text-[var(--text-3)]">
                Add {flyName} {picker.size} to one of your boxes.
              </p>
              <ul className="mt-4 space-y-1">
                {picker.boxes.map((b) => (
                  <li key={b.id}>
                    <button
                      type="button"
                      onClick={() => addSize(picker.size, b.id)}
                      className="flex w-full items-center justify-between rounded-[var(--radius-md)] border border-[var(--border)] px-3 py-2 text-left text-[13px] hover:border-[var(--accent)]"
                    >
                      <span>{b.name}</span>
                      {b.tier && (
                        <span className="ea-overline">
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
                className="mt-4 w-full rounded-[var(--radius-md)] border border-[var(--border)] px-3 py-2 text-[14px] font-medium text-[var(--text-2)] hover:border-[var(--accent)]"
              >
                Cancel
              </button>
            </InstrumentWell>
            </div>
          </div>
        )}
      </InstrumentWell>
    </InstrumentWellFrame>
  );
}
