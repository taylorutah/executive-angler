import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { MapPin, Store, Mountain, Home, Fish, Compass } from "lucide-react";

export const metadata: Metadata = {
  title: "Contribute — Executive Angler",
  description: "Help build the ultimate fly fishing resource. Submit rivers, fly shops, guides, lodges, and more.",
};

const ENTITY_TYPES = [
  { type: "river", label: "River or Stream", icon: "🏞️", description: "Trout streams, tailwaters, freestone rivers — big or small", color: "#0BA5C7" },
  { type: "fly_shop", label: "Fly Shop", icon: "🏪", description: "Local fly shops and outfitters", color: "#E8923A" },
  { type: "guide", label: "Fishing Guide", icon: "🎣", description: "Independent guides and guide services", color: "#2EA44F" },
  { type: "lodge", label: "Lodge or Resort", icon: "🏡", description: "Fishing lodges, ranch stays, and resorts", color: "#9B59B6" },
  { type: "destination", label: "Destination", icon: "🗺️", description: "Fly fishing destinations and regions", color: "#E74C3C" },
  { type: "species", label: "Species", icon: "🐟", description: "Fish species with habitat and fly recommendations", color: "#F39C12" },
];

export default async function ContributePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/contribute");

  return (
    <div className="min-h-screen bg-[#0D1117]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="font-serif text-3xl text-[#F0F6FC] mb-3">Contribute to Executive Angler</h1>
          <p className="text-[#A8B2BD] max-w-lg mx-auto">
            Help build the most complete fly fishing resource. Your local knowledge makes this platform better for every angler.
          </p>
        </div>

        {/* Entity type grid */}
        <div className="grid sm:grid-cols-2 gap-4">
          {ENTITY_TYPES.map(({ type, label, icon, description, color }) => (
            <Link
              key={type}
              href={`/contribute/${type}`}
              className="group p-5 bg-[#161B22] border border-[#21262D] rounded-xl hover:border-opacity-60 transition-all"
              style={{ ["--hover-color" as string]: color }}
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl">{icon}</span>
                <div>
                  <h2 className="text-base font-bold text-[#F0F6FC] group-hover:text-[#E8923A] transition-colors">{label}</h2>
                  <p className="text-xs text-[#A8B2BD] mt-1">{description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Info section */}
        <div className="mt-10 bg-[#161B22] border border-[#21262D] rounded-xl p-6">
          <h3 className="text-sm font-bold text-[#F0F6FC] mb-3">How it works</h3>
          <ol className="space-y-3 text-sm text-[#A8B2BD]">
            <li className="flex gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#E8923A]/15 text-[#E8923A] text-xs font-bold shrink-0">1</span>
              <span>Choose what you want to add and fill in the details. A high-quality photo is strongly recommended.</span>
            </li>
            <li className="flex gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#E8923A]/15 text-[#E8923A] text-xs font-bold shrink-0">2</span>
              <span>Submit for review. You can save as a draft and come back later from your Account page.</span>
            </li>
            <li className="flex gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#E8923A]/15 text-[#E8923A] text-xs font-bold shrink-0">3</span>
              <span>Our team reviews your submission. We may ask for more details. Once approved, it goes live on the site.</span>
            </li>
          </ol>
        </div>

        {/* Link to my submissions */}
        <div className="mt-6 text-center">
          <Link href="/account#submissions" className="text-sm text-[#E8923A] hover:underline">
            View my submissions →
          </Link>
        </div>
      </div>
    </div>
  );
}
