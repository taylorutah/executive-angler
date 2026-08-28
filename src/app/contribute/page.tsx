import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contribute",
  description: "Add a river, shop, guide, lodge, or fly to the desk.",
};

const ENTITY_TYPES = [
  { type: "river", label: "River or stream", href: "/contribute/river", description: "A water we should keep." },
  { type: "fly_shop", label: "Fly shop", href: "/contribute/fly_shop", description: "A counter near the water." },
  { type: "guide", label: "Guide", href: "/contribute/guide", description: "Someone who knows a river." },
  { type: "lodge", label: "Lodge", href: "/contribute/lodge", description: "Beds on water we keep." },
  { type: "destination", label: "Place", href: "/contribute/destination", description: "A region we should keep." },
  { type: "species", label: "Species", href: "/contribute/species", description: "A fish and the flies it takes." },
  { type: "fly_pattern", label: "Fly pattern", href: "/contribute/fly_pattern", description: "A pattern for the bench." },
  { type: "photo_update", label: "Update a still", href: "/contribute/photo-update", description: "A hosted photograph for a listing we keep." },
];

export default async function ContributePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/contribute");

  return (
    <div className="bg-[var(--paper)]">
      <div className="desk-sheet">
        <div className="house-measure">
          <p className="desk-eyebrow">House</p>
          <h1
            className="mt-4 font-heading text-[32px] font-semibold leading-[36px] text-[var(--ink)] sm:text-[48px] sm:leading-[56px]"
            style={{ fontVariationSettings: '"SOFT" 0, "WONK" 1' }}
          >
            Contribute
          </h1>
          <p className="desk-dek-ui mt-4">
            Help keep the desk honest. We review every submission. Their site stays theirs.
          </p>

          <ul className="desk-rule-list mt-12">
            {ENTITY_TYPES.map((item) => (
              <li key={item.type}>
                <Link
                  href={item.href}
                  className="hover-copper text-[15px] text-[var(--ink)] underline-offset-4 hover:text-[var(--action)] hover:underline"
                >
                  {item.label}
                </Link>
                <span className="shrink-0 text-[13px] text-[var(--graphite)]">{item.description}</span>
              </li>
            ))}
          </ul>

          <ol className="prose mt-12 space-y-3">
            <li>Choose what to add. A hosted still helps.</li>
            <li>Submit for review, or save a draft on your account.</li>
            <li>We read it. When it is honest, it goes on the desk.</li>
          </ol>

          <p className="mt-10">
            <Link
              href="/account#submissions"
              className="hover-copper font-ui text-[14px] font-medium text-[var(--copper)]"
            >
              Your submissions →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
