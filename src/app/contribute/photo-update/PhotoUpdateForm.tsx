"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const fieldClass =
  "w-full rounded-[2px] border border-[var(--border-rule)] bg-[var(--surface-card)] px-4 py-3 font-ui text-[15px] text-[var(--ink)] placeholder:text-[var(--slate)] outline-none focus:border-[var(--action)]";

interface Props {
  userId: string;
}

const ENTITY_TYPE_OPTIONS = [
  { value: "fly_shop", label: "Fly Shop", table: "fly_shops", nameField: "name" },
  { value: "guide", label: "Guide", table: "guides", nameField: "name" },
  { value: "lodge", label: "Lodge", table: "lodges", nameField: "name" },
  { value: "river", label: "River", table: "rivers", nameField: "name" },
];

interface EntityResult {
  id: string;
  slug: string;
  name: string;
}

export default function PhotoUpdateForm({ userId }: Props) {
  const router = useRouter();
  const supabase = createClient();
  void userId;

  const [targetEntityType, setTargetEntityType] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<EntityResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<EntityResult | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [heroImage, setHeroImage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search entities as user types
  useEffect(() => {
    if (!targetEntityType || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      const option = ENTITY_TYPE_OPTIONS.find(o => o.value === targetEntityType);
      if (!option) { setSearching(false); return; }

      const { data } = await supabase
        .from(option.table)
        .select("id, slug, name")
        .ilike("name", `%${searchQuery.trim()}%`)
        .limit(8);

      setSearchResults((data as EntityResult[]) || []);
      setShowDropdown(true);
      setSearching(false);
    }, 300);
  }, [searchQuery, targetEntityType]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleSelectEntity(entity: EntityResult) {
    setSelectedEntity(entity);
    setSearchQuery(entity.name);
    setShowDropdown(false);
  }

  function handleEntityTypeChange(value: string) {
    setTargetEntityType(value);
    setSelectedEntity(null);
    setSearchQuery("");
    setSearchResults([]);
  }

  async function handleImageUpload(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (JPEG, PNG, or WebP)");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Image is too large. Maximum 10 MB.");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("submission_id", "new");

      const res = await fetch("/api/submissions/upload", { method: "POST", body: fd });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Upload failed");
      setHeroImage(result.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    }

    setUploading(false);
  }

  async function handleSubmit() {
    if (!selectedEntity) { setError("Please select a listing to update."); return; }
    if (!heroImage) { setError("Please upload a photo."); return; }

    setSubmitting(true);
    setError(null);

    const entityTypeOption = ENTITY_TYPE_OPTIONS.find(o => o.value === targetEntityType);
    const label = entityTypeOption?.label || targetEntityType;

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity_type: "photo_update",
          name: `${selectedEntity.name} — Photo Update`,
          short_description: `Hero photo update for ${label}: ${selectedEntity.name}`,
          hero_image_url: heroImage,
          entity_data: {
            target_entity_type: targetEntityType,
            target_slug: selectedEntity.slug,
            target_id: selectedEntity.id,
          },
          submit: true,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Submission failed");

      setSuccess("Photo submitted for review! Taylor will approve it shortly.");
      setTimeout(() => router.push("/account#submissions"), 2500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to submit");
    }

    setSubmitting(false);
  }

  const entityTypeOption = ENTITY_TYPE_OPTIONS.find(o => o.value === targetEntityType);
  const canSubmit = !!selectedEntity && !!heroImage && !uploading && !submitting;

  return (
    <div className="bg-[var(--paper)]">
      <div className="desk-sheet">
        <div className="desk-form">
        <p className="desk-eyebrow">House</p>
        <p className="mt-2 font-ui text-[13px]">
          <Link href="/contribute" className="hover-copper text-[var(--copper)]">
            Contribute
          </Link>
        </p>
        <h1
          className="mt-4 font-heading text-[32px] font-semibold leading-[36px] text-[var(--ink)]"
          style={{ fontVariationSettings: '"SOFT" 0, "WONK" 1' }}
        >
          Update a still
        </h1>
        <p className="desk-dek-ui mt-3">
          A hosted photograph for a shop, guide, lodge, or river we already keep.
        </p>

        {error ? (
          <p className="mt-4 border border-[var(--border-rule)] bg-[var(--vellum)] px-4 py-2 font-ui text-sm text-[var(--ink)]">
            {error}
          </p>
        ) : null}
        {success ? (
          <p className="mt-4 border border-[var(--border-rule)] bg-[var(--vellum)] px-4 py-2 font-ui text-sm text-[var(--ink)]">
            {success}
          </p>
        ) : null}

        <div className="space-y-6">
          {/* Step 1: Entity type */}
          <div>
            <label className="mb-2 block font-ui text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--slate)]">
              Step 1 — What type of listing?
            </label>
            <select
              value={targetEntityType}
              onChange={e => handleEntityTypeChange(e.target.value)}
              className={fieldClass}
            >
              <option value="">Select listing type...</option>
              {ENTITY_TYPE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Step 2: Search for entity */}
          {targetEntityType && (
            <div>
              <label className="mb-2 block font-ui text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--slate)]">
                Step 2 — Search for the {entityTypeOption?.label}
              </label>
              <div className="relative" ref={dropdownRef}>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => { setSearchQuery(e.target.value); setSelectedEntity(null); }}
                    placeholder={`Type to search ${entityTypeOption?.label.toLowerCase()} names...`}
                    className={`${fieldClass} ${searchQuery ? "pr-16" : ""}`}
                  />
                  {searching ? (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 font-ui text-[12px] text-[var(--slate)]">
                      …
                    </span>
                  ) : null}
                  {selectedEntity && !searching ? (
                    <button
                      type="button"
                      onClick={() => { setSelectedEntity(null); setSearchQuery(""); }}
                      className="hover-copper absolute right-3 top-1/2 -translate-y-1/2 font-ui text-[13px] text-[var(--copper)]"
                    >
                      Clear
                    </button>
                  ) : null}
                </div>

                {showDropdown && searchResults.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full overflow-hidden border border-[var(--border-rule)] bg-[var(--paper)]">
                    {searchResults.map(entity => (
                      <button
                        key={entity.id}
                        onClick={() => handleSelectEntity(entity)}
                        className="w-full px-4 py-3 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--border-rule)] transition-colors border-b border-[var(--border-rule)] last:border-0"
                      >
                        <span className="font-medium">{entity.name}</span>
                        <span className="ml-2 text-[10px] text-[var(--text-meta)]">/{entity.slug}</span>
                      </button>
                    ))}
                  </div>
                )}

                {showDropdown && searchResults.length === 0 && !searching && searchQuery.trim().length >= 2 && (
                  <div className="absolute z-10 mt-1 w-full border border-[var(--border-rule)] bg-[var(--paper)] px-4 py-3">
                    <p className="font-ui text-sm text-[var(--slate)]">No results for &ldquo;{searchQuery}&rdquo;</p>
                  </div>
                )}
              </div>

              {selectedEntity && (
                <p className="mt-2 text-xs text-[var(--state-positive)]">
                  ✓ Selected: <strong>{selectedEntity.name}</strong>
                </p>
              )}
            </div>
          )}

          {/* Step 3: Upload photo */}
          {selectedEntity && (
            <div>
              <label className="mb-2 block font-ui text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--slate)]">
                Step 3 — Upload the still <span className="normal-case tracking-normal text-[var(--graphite)]">— required</span>
              </label>

              {heroImage ? (
                <div className="relative overflow-hidden border border-[var(--border-rule)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={heroImage} alt="Preview" className="h-56 w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setHeroImage("")}
                    className="absolute right-2 top-2 bg-[var(--ink)] px-2.5 py-1 font-ui text-[12px] font-semibold text-[var(--hero-type)]"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label
                  className={`flex h-48 w-full cursor-pointer flex-col items-center justify-center border border-dashed bg-[var(--vellum)] ${
                    uploading ? "border-[var(--ink)]" : "border-[var(--border-rule)]"
                  }`}
                  onDragOver={e => { e.preventDefault(); }}
                  onDrop={async e => {
                    e.preventDefault();
                    const file = e.dataTransfer.files[0];
                    if (file) await handleImageUpload(file);
                  }}
                >
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={async e => {
                      const file = e.target.files?.[0];
                      if (file) await handleImageUpload(file);
                    }}
                  />
                  <span className="font-ui text-sm text-[var(--graphite)]">
                    {uploading ? "Uploading…" : "Drop a hosted still or click to browse"}
                  </span>
                  <span className="mt-1 font-ui text-[11px] text-[var(--slate)]">JPEG, PNG, or WebP · max 10 MB</span>
                </label>
              )}
              <p className="mt-1.5 font-ui text-[11px] text-[var(--slate)]">Landscape. Hosted photograph only.</p>
            </div>
          )}
        </div>

        {/* Submit button */}
        <div className="mt-8">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full bg-[var(--action)] py-3 font-ui text-[14px] font-semibold text-[var(--on-action)] hover:bg-[var(--action-hover)] disabled:cursor-not-allowed"
          >
            {submitting ? "Sending…" : "Submit still for review"}
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}
