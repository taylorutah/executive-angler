"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Upload, Send, Image as ImageIcon, AlertCircle, CheckCircle, Loader2, Search, X } from "@/icons";
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
    <div className="min-h-screen bg-[var(--surface-page)]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/contribute" className="text-[var(--text-body)] hover:text-[var(--text-primary)] transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="font-serif text-2xl text-[var(--text-primary)]">Update a Listing Photo</h1>
        </div>

        <p className="text-sm text-[var(--text-body)] mb-8">
          Submit a hero photo for an existing shop, guide, lodge, or river. Once approved, it will replace the listing&apos;s current hero image.
        </p>

        {/* Status messages */}
        {error && (
          <div className="mb-4 px-4 py-3 bg-red-950/30 border border-red-800 rounded-lg flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-4 px-4 py-3 bg-green-950/30 border border-green-800 rounded-lg flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-green-400 shrink-0 mt-0.5" />
            <p className="text-sm text-green-400">{success}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Step 1: Entity type */}
          <div>
            <label className="block text-xs font-bold text-[var(--text-body)] uppercase tracking-wider mb-2">
              Step 1 — What type of listing?
            </label>
            <select
              value={targetEntityType}
              onChange={e => handleEntityTypeChange(e.target.value)}
              className="w-full px-4 py-3 bg-[var(--surface-raised)] border border-[var(--border-rule)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--action)]"
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
              <label className="block text-xs font-bold text-[var(--text-body)] uppercase tracking-wider mb-2">
                Step 2 — Search for the {entityTypeOption?.label}
              </label>
              <div className="relative" ref={dropdownRef}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-meta)]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => { setSearchQuery(e.target.value); setSelectedEntity(null); }}
                    placeholder={`Type to search ${entityTypeOption?.label.toLowerCase()} names...`}
                    className="w-full pl-9 pr-10 py-3 bg-[var(--surface-raised)] border border-[var(--border-rule)] rounded-lg text-sm text-[var(--text-primary)] placeholder-[#6E7681] focus:outline-none focus:border-[var(--action)]"
                  />
                  {searching && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--action)] animate-spin" />
                  )}
                  {selectedEntity && !searching && (
                    <button
                      onClick={() => { setSelectedEntity(null); setSearchQuery(""); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-meta)] hover:text-[var(--text-primary)]"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {showDropdown && searchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-[var(--surface-raised)] border border-[var(--border-rule)] rounded-lg shadow-lg overflow-hidden">
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
                  <div className="absolute z-10 w-full mt-1 bg-[var(--surface-raised)] border border-[var(--border-rule)] rounded-lg px-4 py-3">
                    <p className="text-sm text-[var(--text-meta)]">No results for &ldquo;{searchQuery}&rdquo;</p>
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
              <label className="block text-xs font-bold text-[var(--text-body)] uppercase tracking-wider mb-2">
                <ImageIcon className="h-3 w-3 inline mr-1" />
                Step 3 — Upload the photo <span className="text-[var(--action)]">*required</span>
              </label>

              {heroImage ? (
                <div className="relative rounded-xl overflow-hidden border border-[var(--border-rule)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={heroImage} alt="Preview" className="w-full h-56 object-cover" />
                  <button
                    onClick={() => setHeroImage("")}
                    className="absolute top-2 right-2 px-2.5 py-1 bg-black/70 text-white rounded-lg text-xs font-semibold hover:bg-black/90 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label
                  className={`flex flex-col items-center justify-center w-full h-48 bg-[var(--surface-raised)] border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                    uploading ? "border-[var(--action)] bg-[var(--action)]/5" : "border-[var(--border-rule)] hover:border-[var(--text-meta)]"
                  }`}
                  onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add("border-[var(--action)]", "bg-[var(--action)]/5"); }}
                  onDragLeave={e => { e.currentTarget.classList.remove("border-[var(--action)]", "bg-[var(--action)]/5"); }}
                  onDrop={async e => {
                    e.preventDefault();
                    e.currentTarget.classList.remove("border-[var(--action)]", "bg-[var(--action)]/5");
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
                      <Loader2 className="h-8 w-8 text-[var(--action)] animate-spin mb-2" />
                      <span className="text-sm text-[var(--action)] font-medium">Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-[var(--text-meta)] mb-2" />
                      <span className="text-sm text-[var(--text-body)] font-medium">Drop an image here or click to browse</span>
                      <span className="text-[10px] text-[var(--text-meta)] mt-1">JPEG, PNG, or WebP · max 10 MB</span>
                    </>
                  )}
                </label>
              )}
              <p className="text-[10px] text-[var(--text-meta)] mt-1.5">Landscape orientation works best. High resolution preferred.</p>
            </div>
          )}
        </div>

        {/* Submit button */}
        <div className="mt-8">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-[var(--action)] text-white rounded-lg text-sm font-bold hover:bg-[var(--action-hover)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Submit Photo for Review
          </button>
        </div>
      </div>
    </div>
  );
}
