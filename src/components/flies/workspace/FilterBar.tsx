"use client";
/**
 * FilterBar — composition of Source · Category · Box · Tags pills + a free-text
 * search input + a "Clear all" affordance.
 *
 * State is owned by the parent (WorkspaceClient); FilterBar is purely
 * presentational so URL state can be the single source of truth.
 */
import { Search, X } from "lucide-react";
import FilterPill, { type FilterOption } from "./FilterPill";
import type {
  WorkspaceFilter,
  WorkspaceSource,
  WorkspaceTag,
} from "@/lib/flies/workspace-shared";

const SOURCE_OPTIONS: FilterOption[] = [
  { value: "custom", label: "Created by me" },
  { value: "canonical", label: "From the library" },
];

const TAG_OPTIONS: FilterOption[] = [
  { value: "favorite", label: "Favorites" },
  { value: "tie-next", label: "Tie next" },
  { value: "in-box", label: "In a box" },
  { value: "restock", label: "Needs restock" },
];

interface Props {
  filter: WorkspaceFilter;
  onChange: (next: WorkspaceFilter) => void;
  categoryOptions: FilterOption[];
  boxOptions: FilterOption[];
}

export default function FilterBar({
  filter,
  onChange,
  categoryOptions,
  boxOptions,
}: Props) {
  const activeCount =
    (filter.source && filter.source !== "all" ? 1 : 0) +
    (filter.categories?.length ?? 0) +
    (filter.box_ids?.length ?? 0) +
    (filter.tags?.length ?? 0) +
    (filter.search?.trim() ? 1 : 0);

  function update(patch: Partial<WorkspaceFilter>) {
    onChange({ ...filter, ...patch });
  }

  function clearAll() {
    onChange({});
  }

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px] max-w-md">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--color-text-muted)] pointer-events-none" />
        <input
          type="search"
          value={filter.search ?? ""}
          onChange={(e) => update({ search: e.target.value })}
          placeholder="Search your flies…"
          className="w-full rounded-md border border-[var(--color-border)] bg-transparent pl-8 pr-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[#E8923A]/40"
        />
      </div>

      <FilterPill
        label="Source"
        options={SOURCE_OPTIONS}
        selected={filter.source && filter.source !== "all" ? [filter.source] : []}
        onChange={(next) => {
          // Source is single-select in spirit (either canonical, custom, or
          // both/all). Multi-select with both selected is equivalent to
          // unset (= all).
          if (next.length === 0 || next.length === 2) {
            update({ source: undefined });
          } else {
            update({ source: next[0] as WorkspaceSource });
          }
        }}
      />

      <FilterPill
        label="Category"
        options={categoryOptions}
        selected={filter.categories ?? []}
        onChange={(next) => update({ categories: next.length ? next : undefined })}
      />

      <FilterPill
        label="Box"
        options={boxOptions}
        selected={filter.box_ids ?? []}
        onChange={(next) => update({ box_ids: next.length ? next : undefined })}
      />

      <FilterPill
        label="Tags"
        options={TAG_OPTIONS}
        selected={filter.tags ?? []}
        onChange={(next) =>
          update({ tags: next.length ? (next as WorkspaceTag[]) : undefined })
        }
      />

      {activeCount > 0 && (
        <button
          type="button"
          onClick={clearAll}
          className="inline-flex items-center gap-1 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          <X className="h-3 w-3" />
          Clear all
        </button>
      )}
    </div>
  );
}
