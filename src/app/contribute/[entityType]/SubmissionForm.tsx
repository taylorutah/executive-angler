"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft, Upload, Save, Send, MapPin, Globe,
  Phone, Mail, Image as ImageIcon, AlertCircle, CheckCircle, Loader2
} from "lucide-react";

interface Props {
  entityType: string;
  entityLabel: string;
  userId: string;
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
};

export default function SubmissionForm({ entityType, entityLabel, userId }: Props) {
  const router = useRouter();
  const fields = ENTITY_FIELDS[entityType] || [];
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [heroImage, setHeroImage] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
    <div className="min-h-screen bg-[#0D1117]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/contribute" className="text-[#8B949E] hover:text-[#F0F6FC] transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="font-serif text-2xl text-[#F0F6FC]">Add {entityLabel}</h1>
        </div>

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

        {/* Hero image */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-[#8B949E] uppercase tracking-wider mb-2">
            <ImageIcon className="h-3 w-3 inline mr-1" />
            Hero Image <span className="text-[#E8923A]">*strongly recommended</span>
          </label>
          <input
            type="url"
            value={heroImage}
            onChange={e => setHeroImage(e.target.value)}
            placeholder="Paste image URL (upload to Imgur, Unsplash, or similar)"
            className="w-full px-4 py-3 bg-[#161B22] border border-[#21262D] rounded-lg text-sm text-[#F0F6FC] placeholder-[#484F58] focus:outline-none focus:border-[#E8923A]"
          />
          {heroImage && (
            <div className="mt-2 rounded-lg overflow-hidden border border-[#21262D]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={heroImage} alt="Preview" className="w-full h-40 object-cover" onError={() => setHeroImage("")} />
            </div>
          )}
          <p className="text-[10px] text-[#484F58] mt-1">A great photo dramatically increases approval chances</p>
        </div>

        {/* Dynamic fields */}
        <div className="space-y-5">
          {fields.map(field => (
            <div key={field.key}>
              <label className="block text-xs font-bold text-[#8B949E] uppercase tracking-wider mb-2">
                {field.label}
                {field.required && <span className="text-red-400 ml-1">*</span>}
              </label>

              {field.type === "text" && (
                <input
                  type="text"
                  value={formData[field.key] || ""}
                  onChange={e => updateField(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full px-4 py-3 bg-[#161B22] border border-[#21262D] rounded-lg text-sm text-[#F0F6FC] placeholder-[#484F58] focus:outline-none focus:border-[#E8923A]"
                />
              )}

              {field.type === "textarea" && (
                <textarea
                  value={formData[field.key] || ""}
                  onChange={e => updateField(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  rows={4}
                  className="w-full px-4 py-3 bg-[#161B22] border border-[#21262D] rounded-lg text-sm text-[#F0F6FC] placeholder-[#484F58] focus:outline-none focus:border-[#E8923A] resize-none"
                />
              )}

              {field.type === "select" && (
                <select
                  value={formData[field.key] || ""}
                  onChange={e => updateField(field.key, e.target.value)}
                  className="w-full px-4 py-3 bg-[#161B22] border border-[#21262D] rounded-lg text-sm text-[#F0F6FC] focus:outline-none focus:border-[#E8923A]"
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
                    className="w-full px-4 py-3 bg-[#161B22] border border-[#21262D] rounded-lg text-sm text-[#F0F6FC] placeholder-[#484F58] focus:outline-none focus:border-[#E8923A]"
                  />
                  <p className="text-[10px] text-[#484F58] mt-1">Separate with commas</p>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mt-8">
          <button
            onClick={() => handleSave(false)}
            disabled={saving || submitting || !formData.name?.trim()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 bg-[#21262D] text-[#F0F6FC] rounded-lg text-sm font-semibold hover:bg-[#2D333B] transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Draft
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={saving || submitting || !formData.name?.trim()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 bg-[#E8923A] text-white rounded-lg text-sm font-bold hover:bg-[#F0A65A] transition-colors disabled:opacity-50"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Submit for Review
          </button>
        </div>
      </div>
    </div>
  );
}
