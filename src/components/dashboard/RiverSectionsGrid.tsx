"use client";

import { useMemo, useState, useTransition } from "react";
import {
  DndContext, DragEndEvent, PointerSensor, useSensor, useSensors, closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext, arrayMove, useSortable, rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, MapPin } from "@/icons";
import RiverSectionCard, { type GaugeChoice } from "./RiverSectionCard";
import AddSectionModal from "./AddSectionModal";

export interface FavoriteSectionDTO {
  id: string;
  river_id: string;
  river_name: string;
  river_slug: string;
  usgs_site_id: string;
  section_name: string;
  gauge_name: string;
  hatch_now?: string[];
}

export interface YourRiverDTO {
  river_id: string;
  river_name: string;
  river_slug: string;
  gauges: GaugeChoice[];
  default_site_id: string;
  hatch_now?: string[];
}

interface Props {
  initialFavorites: FavoriteSectionDTO[];
  yourRivers: YourRiverDTO[];
  allRiversForPicker: Array<{ id: string; name: string; slug: string; gauges: GaugeChoice[] }>;
}

function SortableCard({
  fav,
}: {
  fav: FavoriteSectionDTO;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: fav.id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  async function handleRemove() {
    await fetch(`/api/dashboard/favorite-sections/${fav.id}`, { method: "DELETE" });
    window.location.reload();
  }

  return (
    <div ref={setNodeRef} style={style}>
      <RiverSectionCard
        mode="favorite"
        favoriteId={fav.id}
        riverId={fav.river_id}
        riverName={fav.river_name}
        riverSlug={fav.river_slug}
        siteId={fav.usgs_site_id}
        sectionName={fav.section_name}
        hatchNow={fav.hatch_now}
        dragAttributes={attributes as unknown as Record<string, unknown>}
        dragListeners={listeners as unknown as Record<string, unknown>}
        onRemove={handleRemove}
      />
    </div>
  );
}

function YoursCard({ river }: { river: YourRiverDTO }) {
  const [selectedSite, setSelectedSite] = useState(river.default_site_id);
  const selectedGauge = river.gauges.find((g) => g.site_id === selectedSite) ?? river.gauges[0];

  async function handleChange(siteId: string) {
    setSelectedSite(siteId);
    fetch("/api/dashboard/river-section-pref", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ riverId: river.river_id, usgsSiteId: siteId }),
    }).catch(() => {});
  }

  if (!selectedGauge) return null;

  return (
    <RiverSectionCard
      mode="yours"
      riverId={river.river_id}
      riverName={river.river_name}
      riverSlug={river.river_slug}
      siteId={selectedGauge.site_id}
      sectionName={selectedGauge.section}
      hatchNow={river.hatch_now}
      gauges={river.gauges}
      onChangeGauge={handleChange}
    />
  );
}

export default function RiverSectionsGrid({ initialFavorites, yourRivers, allRiversForPicker }: Props) {
  const [tab, setTab] = useState<"favorites" | "yours">(initialFavorites.length > 0 ? "favorites" : "yours");
  const [favorites, setFavorites] = useState(initialFavorites);
  const [showAdd, setShowAdd] = useState(false);
  const [, startTransition] = useTransition();

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const favoriteIds = useMemo(() => favorites.map((f) => f.id), [favorites]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = favorites.findIndex((f) => f.id === active.id);
    const newIndex = favorites.findIndex((f) => f.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const reordered = arrayMove(favorites, oldIndex, newIndex);
    setFavorites(reordered);
    startTransition(() => {
      fetch("/api/dashboard/favorite-sections/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds: reordered.map((f) => f.id) }),
      }).catch(() => {});
    });
  }

  const showEmptyState = tab === "favorites" && favorites.length === 0;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="inline-flex rounded-lg bg-[var(--surface-raised)] border border-[var(--border-rule)] p-0.5 text-sm">
          <button
            type="button"
            onClick={() => setTab("favorites")}
            className={`px-3 py-1.5 rounded-md font-medium transition ${
              tab === "favorites" ? "bg-[var(--action)] text-[var(--surface-page)]" : "text-[var(--text-body)] hover:text-[var(--text-primary)]"
            }`}
          >
            Favorites {favorites.length > 0 && <span className="ml-1 opacity-70">{favorites.length}</span>}
          </button>
          <button
            type="button"
            onClick={() => setTab("yours")}
            className={`px-3 py-1.5 rounded-md font-medium transition ${
              tab === "yours" ? "bg-[var(--action)] text-[var(--surface-page)]" : "text-[var(--text-body)] hover:text-[var(--text-primary)]"
            }`}
          >
            Your Rivers {yourRivers.length > 0 && <span className="ml-1 opacity-70">{yourRivers.length}</span>}
          </button>
        </div>
        {tab === "favorites" && (
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--surface-raised)] border border-[var(--border-rule)] hover:border-[var(--action)]/50 px-3 py-1.5 text-sm text-[var(--text-primary)]"
          >
            <Plus className="h-4 w-4" /> Pin section
          </button>
        )}
      </div>

      {showEmptyState ? (
        <div className="rounded-2xl border border-dashed border-[var(--border-rule)] bg-[var(--surface-page)]/40 px-6 py-10 text-center">
          <MapPin className="h-7 w-7 text-[var(--text-meta)] mx-auto mb-2" />
          <p className="text-[var(--text-primary)] font-medium">Pin a river section to track its flow</p>
          <p className="text-sm text-[var(--text-body)] mt-1">Live discharge, water temp, weather, and 12-month history — all in one place.</p>
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[var(--action)] text-[var(--surface-page)] hover:bg-[var(--action)]/90 px-4 py-2 text-sm font-medium"
          >
            <Plus className="h-4 w-4" /> Pin your first section
          </button>
        </div>
      ) : tab === "favorites" ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={favoriteIds} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {favorites.map((fav) => <SortableCard key={fav.id} fav={fav} />)}
            </div>
          </SortableContext>
        </DndContext>
      ) : yourRivers.length === 0 ? (
        <div className="rounded-2xl border border-[var(--border-rule)] bg-[var(--surface-page)]/40 px-6 py-8 text-center">
          <p className="text-[var(--text-body)] text-sm">Log a session to see your rivers here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {yourRivers.map((r) => <YoursCard key={r.river_id} river={r} />)}
        </div>
      )}

      {showAdd && (
        <AddSectionModal
          rivers={allRiversForPicker}
          alreadyPinned={favorites.map((f) => `${f.river_id}:${f.usgs_site_id}`)}
          onClose={() => setShowAdd(false)}
        />
      )}
    </section>
  );
}
