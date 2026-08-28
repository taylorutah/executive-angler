"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const fieldClass =
  "w-full rounded-[2px] border border-[var(--border-rule)] bg-[var(--surface-card)] px-4 py-3 font-ui text-[15px] text-[var(--ink)] placeholder:text-[var(--slate)] outline-none focus:border-[var(--action)]";

interface Props {
  entityType: string;
  entityLabel: string;
  userId: string;
  prefillData?: Record<string, string>;
}

// Field definitions per entity type
const ENTITY_FIELDS: Record<string, { label: string; key: string; type: string; required?: boolean; placeholder?: string; options?: string[] }[]> = {
  river: [
    { label: "River / Stream Name", key: "name", type: "text", required: true, placeholder: "e.g., Little Cottonwood Creek" },
    { label: "State / Province", key: "state", type: "text", required: true, placeholder: "e.g., Utah" },
    { label: "Region / Area", key: "region", type: "text", placeholder: "e.g., Wasatch Front" },
    { label: "Short Description", key: "short_description", type: "text", placeholder: "One-line tagline for this water" },
    { label: "Full Description", key: "description", type: "textarea", required: true, placeholder: "Describe the fishery — what makes it special, best sections, access, etc." },
    { label: "Primary Species", key: "primary_species", type: "tags", placeholder: "Brown Trout, Rainbow Trout, Cutthroat Trout" },
    { label: "Access Points / Directions", key: "access_points", type: "textarea", placeholder: "How to get there, parking, trailheads" },
    { label: "Regulations / Special Rules", key: "regulations", type: "textarea", placeholder: "Catch and release, artificial flies only, etc." },
    { label: "Best Season", key: "season", type: "text", placeholder: "e.g., June through October" },
    { label: "Difficulty", key: "difficulty", type: "select", options: ["Beginner", "Intermediate", "Advanced", "Expert"] },
    { label: "Water Type", key: "water_type", type: "select", options: ["Freestone", "Tailwater", "Spring Creek", "Lake", "Reservoir", "Pond", "Estuary"] },
  ],
  fly_shop: [
    { label: "Shop Name", key: "name", type: "text", required: true, placeholder: "e.g., Trout Bum 2" },
    { label: "Address", key: "address", type: "text", required: true, placeholder: "Full street address" },
    { label: "City / Town", key: "region", type: "text", required: true, placeholder: "e.g., Truckee" },
    { label: "State", key: "state", type: "text", required: true, placeholder: "e.g., California" },
    { label: "Description", key: "description", type: "textarea", required: true, placeholder: "What makes this shop great?" },
    { label: "Phone", key: "phone", type: "text", placeholder: "(555) 555-5555" },
    { label: "Website", key: "website", type: "text", placeholder: "https://..." },
    { label: "Email", key: "contact_email", type: "text", placeholder: "info@shop.com" },
    { label: "Services", key: "services", type: "tags", placeholder: "Guide trips, Fly tying, Rod repair, Casting lessons" },
    { label: "Brands Carried", key: "brands", type: "tags", placeholder: "Simms, Orvis, Sage, Rio" },
  ],
  guide: [
    { label: "Guide / Service Name", key: "name", type: "text", required: true, placeholder: "e.g., John Smith Guide Service" },
    { label: "Location / Base", key: "region", type: "text", required: true, placeholder: "e.g., Jackson Hole, WY" },
    { label: "State", key: "state", type: "text", required: true },
    { label: "Description", key: "description", type: "textarea", required: true, placeholder: "Experience, approach, what a trip looks like" },
    { label: "Rivers Guided", key: "rivers_guided", type: "tags", placeholder: "Snake River, Green River, South Fork" },
    { label: "Specialties", key: "specialties", type: "tags", placeholder: "Dry fly, Euro nymphing, Streamer, Float trips" },
    { label: "Price Range", key: "price_range", type: "select", options: ["$", "$$", "$$$", "$$$$"] },
    { label: "Website", key: "website", type: "text", placeholder: "https://..." },
    { label: "Phone", key: "phone", type: "text" },
    { label: "Email", key: "contact_email", type: "text" },
  ],
  lodge: [
    { label: "Lodge Name", key: "name", type: "text", required: true, placeholder: "e.g., Silver Creek Lodge" },
    { label: "Location", key: "region", type: "text", required: true, placeholder: "e.g., Sun Valley, ID" },
    { label: "State", key: "state", type: "text", required: true },
    { label: "Description", key: "description", type: "textarea", required: true, placeholder: "The experience, accommodations, fishing access" },
    { label: "Nearby Rivers", key: "nearby_rivers", type: "tags", placeholder: "Silver Creek, Big Wood River" },
    { label: "Amenities", key: "amenities", type: "tags", placeholder: "Guide service, Fly shop, Meals included, Hot tub" },
    { label: "Price Range", key: "price_range", type: "select", options: ["$", "$$", "$$$", "$$$$", "$$$$$"] },
    { label: "Website", key: "website", type: "text" },
    { label: "Phone", key: "phone", type: "text" },
    { label: "Address", key: "address", type: "text" },
  ],
  destination: [
    { label: "Destination Name", key: "name", type: "text", required: true, placeholder: "e.g., Yellowstone Country" },
    { label: "State / Country", key: "state", type: "text", required: true },
    { label: "Region", key: "region", type: "text", placeholder: "e.g., Greater Yellowstone" },
    { label: "Description", key: "description", type: "textarea", required: true, placeholder: "Why anglers should visit, what to expect" },
    { label: "Best Months", key: "best_months", type: "tags", placeholder: "June, July, August, September" },
    { label: "Key Rivers", key: "key_rivers", type: "tags", placeholder: "Madison, Yellowstone, Firehole" },
    { label: "Nearest Airport", key: "nearest_airport", type: "text", placeholder: "e.g., BZN (Bozeman)" },
    { label: "Species Available", key: "species", type: "tags", placeholder: "Brown Trout, Rainbow Trout, Cutthroat" },
  ],
  species: [
    { label: "Common Name", key: "name", type: "text", required: true, placeholder: "e.g., Westslope Cutthroat Trout" },
    { label: "Scientific Name", key: "scientific_name", type: "text", placeholder: "e.g., Oncorhynchus clarkii lewisi" },
    { label: "Family", key: "family", type: "select", options: ["Trout", "Salmon", "Char", "Bass", "Panfish", "Pike", "Carp", "Other"] },
    { label: "Description", key: "description", type: "textarea", required: true, placeholder: "Identification, habitat, behavior" },
    { label: "Habitat", key: "habitat", type: "textarea", placeholder: "Where this species is found" },
    { label: "Average Size", key: "avg_size", type: "text", placeholder: "e.g., 10-16 inches" },
    { label: "Record Size", key: "record_size", type: "text", placeholder: "e.g., 24 inches / 5 lbs" },
    { label: "Preferred Flies", key: "preferred_flies", type: "tags", placeholder: "Elk Hair Caddis, Parachute Adams, Prince Nymph" },
    { label: "Range / Distribution", key: "range", type: "text", placeholder: "e.g., Northern Rockies, Pacific Northwest" },
  ],
  fly_pattern: [
    { label: "Pattern Name", key: "name", type: "text", required: true, placeholder: "e.g., Red Dart, Duracell Jig" },
    { label: "Category", key: "category", type: "select", required: true, options: ["dry", "nymph", "streamer", "emerger", "wet", "terrestrial", "egg", "midge"] },
    { label: "Tagline", key: "tagline", type: "text", placeholder: "One-line description — what makes this pattern unique" },
    { label: "Description", key: "description", type: "textarea", required: true, placeholder: "Detailed description of the pattern, its history, and why it works" },
    { label: "What it Imitates", key: "imitates", type: "tags", placeholder: "Baetis nymph, Caddis larva, Stonefly" },
    { label: "Effective Species", key: "effective_species", type: "tags", placeholder: "Brown Trout, Rainbow Trout, Cutthroat" },
    { label: "Sizes (comma-separated)", key: "sizes", type: "tags", placeholder: "14, 16, 18, 20" },
    { label: "Colors / Variants", key: "colors", type: "tags", placeholder: "Olive, Black, Natural" },
    { label: "Bead Options", key: "bead_options", type: "tags", placeholder: "Tungsten copper, Tungsten gold, Unweighted" },
    { label: "Hook Style", key: "hook_styles", type: "tags", placeholder: "Standard dry, Jig, Scud/pupa" },
    { label: "Water Types", key: "water_types", type: "tags", placeholder: "Tailwater, Freestone, Spring creek, Still water" },
    { label: "When to Use", key: "when_to_use", type: "textarea", placeholder: "Seasonal timing, conditions, hatch matches" },
    { label: "Fishing Tips", key: "fishing_tips", type: "textarea", placeholder: "How to fish it — presentation, retrieve, depth" },
    { label: "Materials List", key: "materials_list", type: "textarea", placeholder: "Hook: Umpqua U202 size 16\nThread: UTC 70 Black\nBead: Tungsten copper 3/32\"" },
    { label: "Tying Overview", key: "tying_overview", type: "textarea", placeholder: "Step-by-step tying summary" },
    { label: "YouTube Tying Video URL", key: "video_url", type: "text", placeholder: "https://www.youtube.com/watch?v=..." },
    { label: "Origin / Tier Credit", key: "origin_credit", type: "text", placeholder: "e.g., Tied by John Barr, South Platte CO" },
  ],
};

export default function SubmissionForm({ entityType, entityLabel, userId, prefillData }: Props) {
  const router = useRouter();
  const fields = ENTITY_FIELDS[entityType] || [];
  const [formData, setFormData] = useState<Record<string, string>>(() => {
    if (!prefillData) return {};
    // Strip internal prefill keys from form data
    const { _prefill_hero_image, ...rest } = prefillData;
    void _prefill_hero_image;
    return rest;
  });
  const [heroImage, setHeroImage] = useState<string>(prefillData?._prefill_hero_image || "");
  const [showPrefillBanner, setShowPrefillBanner] = useState(!!prefillData);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
      const formData = new FormData();
      formData.append("file", file);
      formData.append("submission_id", "new");

      const res = await fetch("/api/submissions/upload", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Upload failed");

      setHeroImage(result.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    }

    setUploading(false);
  }

  function updateField(key: string, value: string) {
    setFormData(prev => ({ ...prev, [key]: value }));
  }

  async function handleSave(submit: boolean) {
    const setter = submit ? setSubmitting : setSaving;
    setter(true);
    setError(null);
    setSuccess(null);

    // Validate required fields
    if (submit) {
      const missing = fields.filter(f => f.required && !formData[f.key]?.trim());
      if (missing.length > 0) {
        setError(`Please fill in: ${missing.map(f => f.label).join(", ")}`);
        setter(false);
        return;
      }
    }

    // Separate core fields from entity_data
    const coreKeys = ["name", "description", "short_description", "state", "region", "address", "website", "phone", "contact_email"];
    const core: Record<string, string> = {};
    const entityData: Record<string, unknown> = {};

    Object.entries(formData).forEach(([k, v]) => {
      if (coreKeys.includes(k)) {
        core[k] = v;
      } else {
        // Tags fields → arrays
        const fieldDef = fields.find(f => f.key === k);
        if (fieldDef?.type === "tags") {
          entityData[k] = v.split(",").map(s => s.trim()).filter(Boolean);
        } else {
          entityData[k] = v;
        }
      }
    });

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity_type: entityType,
          ...core,
          email: core.contact_email,
          entity_data: entityData,
          hero_image_url: heroImage || undefined,
          source_fly_pattern_id: prefillData?.source_fly_pattern_id || undefined,
          submit,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      if (submit) {
        setSuccess("Submitted for review! We'll notify you when it's approved.");
        setTimeout(() => router.push("/account#submissions"), 2000);
      } else {
        setSuccess("Draft saved. You can continue editing from your Account page.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    }

    setter(false);
  }

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
          Add {entityLabel}
        </h1>

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

        {showPrefillBanner ? (
          <p className="mt-4 flex items-baseline justify-between gap-3 border border-[var(--border-rule)] bg-[var(--vellum)] px-4 py-2 font-ui text-sm text-[var(--ink)]">
            <span>Pre-filled from your fly box — review and complete the details below.</span>
            <button type="button" onClick={() => setShowPrefillBanner(false)} className="hover-copper text-[var(--copper)]">
              Dismiss
            </button>
          </p>
        ) : null}

        {/* Hero image upload */}
        <div className="mb-6">
          <label className="mb-2 block font-ui text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--slate)]">
            Still <span className="normal-case tracking-normal text-[var(--graphite)]">— recommended</span>
          </label>

          {heroImage ? (
            <div className="relative overflow-hidden border border-[var(--border-rule)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={heroImage} alt="Preview" className="h-48 w-full object-cover" />
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
          <p className="mt-1.5 font-ui text-[11px] text-[var(--slate)]">A hosted photograph helps the review.</p>
        </div>

        {/* Dynamic fields */}
        <div className="space-y-5">
          {fields.map(field => (
            <div key={field.key}>
              <label className="mb-2 block font-ui text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--slate)]">
                {field.label}
                {field.required ? <span className="ml-1 text-[var(--copper)]">*</span> : null}
              </label>

              {field.type === "text" && (
                <input
                  type="text"
                  value={formData[field.key] || ""}
                  onChange={e => updateField(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className={fieldClass}
                />
              )}

              {field.type === "textarea" && (
                <textarea
                  value={formData[field.key] || ""}
                  onChange={e => updateField(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  rows={4}
                  className={`${fieldClass} resize-none`}
                />
              )}

              {field.type === "select" && (
                <select
                  value={formData[field.key] || ""}
                  onChange={e => updateField(field.key, e.target.value)}
                  className={fieldClass}
                >
                  <option value="">Select...</option>
                  {field.options?.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              )}

              {field.type === "tags" && (
                <>
                  <input
                    type="text"
                    value={formData[field.key] || ""}
                    onChange={e => updateField(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className={fieldClass}
                  />
                  <p className="mt-1 font-ui text-[11px] text-[var(--slate)]">Separate with commas</p>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="mt-8 flex gap-3">
          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={saving || submitting || !formData.name?.trim()}
            className="flex-1 border border-[var(--border-rule)] bg-[var(--vellum)] px-4 py-3 font-ui text-[14px] font-semibold text-[var(--ink)] disabled:cursor-not-allowed"
          >
            {saving ? "Saving…" : "Save draft"}
          </button>
          <button
            type="button"
            onClick={() => handleSave(true)}
            disabled={saving || submitting || !formData.name?.trim()}
            className="flex-1 bg-[var(--action)] px-4 py-3 font-ui text-[14px] font-semibold text-[var(--on-action)] hover:bg-[var(--action-hover)] disabled:cursor-not-allowed"
          >
            {submitting ? "Sending…" : "Submit for review"}
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}
