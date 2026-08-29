import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Waves, Store, User, Home, Compass, Fish, Feather, Camera } from "@/icons";

export const metadata: Metadata = {
  title: "Contribute",
  description: "Help build the ultimate fly fishing resource. Submit rivers, fly shops, guides, lodges, and more.",
};

const ENTITY_TYPES = [
  { type: "river", label: "River or Stream", icon: Waves, description: "Trout streams, tailwaters, freestone rivers — big or small" },
  { type: "fly_shop", label: "Fly Shop", icon: Store, description: "Local fly shops and outfitters" },
  { type: "guide", label: "Fishing Guide", icon: User, description: "Independent guides and guide services" },
  { type: "lodge", label: "Lodge or Resort", icon: Home, description: "Fishing lodges, ranch stays, and resorts" },
  { type: "destination", label: "Destination", icon: Compass, description: "Fly fishing destinations and regions" },
  { type: "species", label: "Species", icon: Fish, description: "Fish species with habitat and fly recommendations" },
  { type: "fly_pattern", label: "Fly Pattern", icon: Feather, description: "Share a pattern for the EA canonical fly library" },
  { type: "photo_update", label: "Update a Listing Photo", icon: Camera, description: "Submit a hero photo for an existing fly shop, lodge, guide, or river" },
];

export default async function ContributePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/contribute");

  return (
    <div className="min-h-screen bg-[var(--paper)]">
      <div className="max-w-[var(--prose)] mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[var(--text-1)]">Contribute to Executive Angler</h1>
          <p className="text-sm text-[var(--text-2)] mt-2">
            Help build the most complete fly fishing resource. Your local knowledge makes this platform better for every angler.
          </p>
        </div>

        {/* Entity type grid */}
        <div className="grid sm:grid-cols-2 gap-4">
          {ENTITY_TYPES.map(({ type, label, icon: Icon, description }) => (
            <Link
              key={type}
              href={type === "photo_update" ? "/contribute/photo-update" : `/contribute/${type}`}
              className="group ea-card card-hover block"
            >
              <div className="flex items-start gap-4">
                <span className="h-10 w-10 rounded-[var(--radius-md)] bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-base font-semibold text-[var(--text-1)] group-hover:text-[var(--accent)] transition-colors duration-150 ease-standard">{label}</h2>
                  <p className="text-xs text-[var(--text-2)] mt-1">{description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Info section */}
        <div className="mt-8 ea-card">
          <h2 className="font-display text-xl font-semibold text-[var(--text-1)] mb-4">How it works</h2>
          <ol className="space-y-3 text-sm text-[var(--text-2)]">
            <li className="flex gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-[var(--radius-md)] bg-[var(--accent-soft)] text-[var(--accent)] text-xs font-semibold num shrink-0">1</span>
              <span>Choose what you want to add and fill in the details. A high-quality photo is strongly recommended.</span>
            </li>
            <li className="flex gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-[var(--radius-md)] bg-[var(--accent-soft)] text-[var(--accent)] text-xs font-semibold num shrink-0">2</span>
              <span>Submit for review. You can save as a draft and come back later from your Account page.</span>
            </li>
            <li className="flex gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-[var(--radius-md)] bg-[var(--accent-soft)] text-[var(--accent)] text-xs font-semibold num shrink-0">3</span>
              <span>Our team reviews your submission. We may ask for more details. Once approved, it goes live on the site.</span>
            </li>
          </ol>
        </div>

        {/* Link to my submissions */}
        <div className="mt-6">
          <Link href="/account#submissions" className="text-sm text-[var(--accent)] hover:underline">
            View my submissions →
          </Link>
        </div>
      </div>
    </div>
  );
}
