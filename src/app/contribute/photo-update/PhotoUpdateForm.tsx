"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, Send, Image as ImageIcon, AlertCircle, CheckCircle, Loader2, Search, X } from "@/icons";
import { createClient } from "@/lib/supabase/client";

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
    <div className="min-h-screen bg-[var(--paper)]">
      <div className="max-w-[var(--prose)] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/contribute"
            className="inline-flex items-center gap-1.5 text-xs text-[var(--text-2)] hover:text-[var(--accent)] transition-colors duration-150 ease-standard mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Contribute
          </Link>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[var(--text-1)]">Update a Listing Photo</h1>
        </div>

        <p className="text-sm text-[var(--text-2)] mb-8">
          Submit a hero photo for an existing shop, guide, lodge, or river. Once approved, it will replace the listing&apos;s current hero image.
        </p>

        {/* Status messages */}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-[var(--radius-md)] border border-[var(--danger)]/30 bg-[var(--danger)]/10 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-[var(--danger)] shrink-0 mt-0.5" />
            <p className="text-sm text-[var(--danger)]">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-4 px-4 py-3 rounded-[var(--radius-md)] border border-[var(--success)]/30 bg-[var(--success)]/10 flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-[var(--success)] shrink-0 mt-0.5" />
            <p className="text-sm text-[var(--success)]">{success}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Step 1: Entity type */}
          <div>
            <label htmlFor="photo-update-type" className="ea-label">
              Step 1 — What type of listing?
            </label>
            <select
              id="photo-update-type"
              value={targetEntityType}
              onChange={e => handleEntityTypeChange(e.target.value)}
              className="ea-input"
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
              <label htmlFor="photo-update-search" className="ea-label">
                Step 2 — Search for the {entityTypeOption?.label}
              </label>
              <div className="relative" ref={dropdownRef}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-3)]" />
                  <input
                    id="photo-update-search"
                    type="text"
                    value={searchQuery}
                    onChange={e => { setSearchQuery(e.target.value); setSelectedEntity(null); }}
                    placeholder={`Type to search ${entityTypeOption?.label.toLowerCase()} names...`}
                    className="ea-input pl-9 pr-10"
                  />
                  {searching && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--accent)] animate-spin" />
                  )}
                  {selectedEntity && !searching && (
                    <button
                      onClick={() => { setSelectedEntity(null); setSearchQuery(""); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-3)] hover:text-[var(--text-1)] transition-colors duration-150 ease-standard"
                      aria-label="Clear selection"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {showDropdown && searchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-md)] shadow-[var(--shadow-float)] overflow-hidden">
                    {searchResults.map(entity => (
                      <button
                        key={entity.id}
                        onClick={() => handleSelectEntity(entity)}
                        className="w-full px-4 py-3 text-left text-sm text-[var(--text-1)] hover:bg-[var(--paper-deep)] transition-colors duration-150 ease-standard border-b border-[var(--border)] last:border-0"
                      >
                        <span className="font-medium">{entity.name}</span>
                        <span className="ml-2 text-xs text-[var(--text-3)]">/{entity.slug}</span>
                      </button>
                    ))}
                  </div>
                )}

                {showDropdown && searchResults.length === 0 && !searching && searchQuery.trim().length >= 2 && (
                  <div className="absolute z-10 w-full mt-1 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-md)] shadow-[var(--shadow-float)] px-4 py-3">
                    <p className="text-sm text-[var(--text-3)]">No results for &ldquo;{searchQuery}&rdquo;</p>
                  </div>
                )}
              </div>

              {selectedEntity && (
                <p className="mt-2 text-xs text-[var(--success)]">
                  ✓ Selected: <span className="font-medium text-[var(--text-1)]">{selectedEntity.name}</span>
                </p>
              )}
            </div>
          )}

          {/* Step 3: Upload photo */}
          {selectedEntity && (
            <div>
              <label className="ea-label">
                <ImageIcon className="h-3.5 w-3.5 inline mr-1" />
                Step 3 — Upload the photo <span className="text-[var(--accent)]">*required</span>
              </label>

              {heroImage ? (
                <div className="relative rounded-[var(--radius-card)] overflow-hidden border border-[var(--border)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={heroImage} alt="Preview" className="w-full h-56 object-cover" />
                  <button
                    onClick={() => setHeroImage("")}
                    className="absolute top-2 right-2 px-2 py-1 rounded-[var(--radius-sm)] bg-[var(--ink)] text-[var(--paper)] text-xs font-medium hover:bg-[var(--ink)]/85 transition-colors duration-150 ease-standard"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label
                  className={`flex flex-col items-center justify-center w-full h-48 bg-[var(--surface)] border-2 border-dashed rounded-[var(--radius-card)] cursor-pointer transition-colors duration-150 ease-standard ${
                    uploading ? "border-[var(--accent)] bg-[var(--accent-soft)]" : "border-[var(--border-strong)] hover:border-[var(--accent)]"
                  }`}
                  onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add("border-[var(--accent)]", "bg-[var(--accent-soft)]"); }}
                  onDragLeave={e => { e.currentTarget.classList.remove("border-[var(--accent)]", "bg-[var(--accent-soft)]"); }}
                  onDrop={async e => {
                    e.preventDefault();
                    e.currentTarget.classList.remove("border-[var(--accent)]", "bg-[var(--accent-soft)]");
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
                  {uploading ? (
                    <>
                      <Loader2 className="h-8 w-8 text-[var(--accent)] animate-spin mb-2" />
                      <span className="text-sm text-[var(--accent)] font-medium">Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-[var(--text-3)] mb-2" />
                      <span className="text-sm text-[var(--text-2)] font-medium">Drop an image here or click to browse</span>
                      <span className="text-xs text-[var(--text-3)] mt-1">JPEG, PNG, or WebP · max 10 MB</span>
                    </>
                  )}
                </label>
              )}
              <p className="ea-field-helper">Landscape orientation works best. High resolution preferred.</p>
            </div>
          )}
        </div>

        {/* Submit button */}
        <div className="mt-8">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="ea-btn ea-btn-primary ea-btn-lg w-full"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Submit Photo for Review
          </button>
        </div>
      </div>
    </div>
  );
}
