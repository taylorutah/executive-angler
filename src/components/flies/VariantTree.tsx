"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, ChevronRight, GitBranch, Sparkles, Plus } from "lucide-react";
import RecipeDiff from "./RecipeDiff";
import HelpHint from "@/components/ui/HelpHint";
import type { FlyPattern } from "@/types/fishing-log";
import { ownerPatternPermalink } from "@/lib/flies/permalink";

type CanonicalLite = {
  id: string;
  slug: string;
  name: string;
  category?: string;
  tagline?: string | null;
  hero_image_url?: string | null;
};

type PersonalLineage = {
  pattern: FlyPattern;
  parent: FlyPattern | null;
  parentCanonical: CanonicalLite | null;
  children: FlyPattern[];
  siblings: FlyPattern[];
};

type CanonicalLineage = {
  canonical: CanonicalLite | null;
  variants: Array<
    Pick<
      FlyPattern,
      | "id"
      | "name"
      | "type"
      | "size"
      | "hook"
      | "bead_size"
      | "bead_color"
      | "fly_color"
      | "image_url"
      | "my_tied_fly_photo_url"
      | "provenance_credit"
      | "user_id"
      | "updated_at"
    >
  >;
};

interface Props {
  /** Personal pattern id. Shows parent + siblings + children. */
  patternId?: string;
  /** Canonical fly id. Shows public community variants of that canonical. */
  canonicalId?: string;
  /** Optional: a spec for the "Create Variant" CTA. When present, shown in the header. */
  createVariantHref?: string;
}

export default function VariantTree({ patternId, canonicalId, createVariantHref }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PersonalLineage | CanonicalLineage | null>(null);

  useEffect(() => {
    const qs = patternId
      ? `?patternId=${patternId}`
      : canonicalId
        ? `?canonicalId=${canonicalId}`
        : null;
    if (!qs) return;
    setLoading(true);
    setError(null);
    fetch(`/api/fishing/flies/lineage${qs}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.error) {
          setError(json.error);
        } else {
          setData(json);
        }
      })
      .catch(() => setError("Failed to load lineage"))
      .finally(() => setLoading(false));
  }, [patternId, canonicalId]);

  if (loading) {
    return (
      <div className="rounded-xl border border-[#21262D] bg-[#161B22] p-4 text-xs text-[#6E7681]">
        Loading lineage…
      </div>
    );
  }
  if (error) {
    return (
      <div className="rounded-xl border border-[#21262D] bg-[#161B22] p-4 text-xs text-red-400">
        {error}
      </div>
    );
  }
  if (!data) return null;

  if ("pattern" in data) {
    return <PersonalTree data={data} createVariantHref={createVariantHref} />;
  }
  return <CanonicalTree data={data} createVariantHref={createVariantHref} />;
}

function PersonalTree({
  data,
  createVariantHref,
}: {
  data: PersonalLineage;
  createVariantHref?: string;
}) {
  const { pattern, parent, parentCanonical, children, siblings } = data;
  const hasAny = parent || parentCanonical || children.length > 0 || siblings.length > 0;

  if (!hasAny) {
    return (
      <div className="rounded-xl border border-[#21262D] bg-[#161B22] p-5">
        <Header title="Variant lineage" createVariantHref={createVariantHref} />
        <p className="mt-2 text-xs text-[#6E7681]">
          This pattern has no parent and no variants yet. Create a variant to fork a size or color.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#21262D] bg-[#161B22] p-5">
      <Header title="Variant lineage" createVariantHref={createVariantHref} />

      {/* Parent */}
      {(parent || parentCanonical) && (
        <div className="mt-4">
          <SectionLabel>Forked from</SectionLabel>
          {parent ? (
            <PersonalNode
              pattern={parent}
              href={ownerPatternPermalink({
                id: parent.id,
                promoted_to_canonical_id: parent.promoted_to_canonical_id ?? null,
                promotedCanonicalSlug: parent.promoted_canonical_slug ?? null,
              })}
              diffAgainst={pattern}
              badge="Parent"
              badgeTone="parent"
            />
          ) : parentCanonical ? (
            <CanonicalNode canonical={parentCanonical} badge="Parent (canonical)" />
          ) : null}
        </div>
      )}

      {/* Current */}
      <div className="mt-4">
        <SectionLabel>You are here</SectionLabel>
        <div className="rounded-lg border border-[#E8923A]/40 bg-[#E8923A]/5 p-3">
          <div className="flex items-center gap-3">
            <Thumb url={pattern.image_url ?? pattern.my_tied_fly_photo_url ?? null} alt={pattern.name} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-[#F0F6FC]">{pattern.name}</p>
              <MetaLine pattern={pattern} />
            </div>
          </div>
        </div>
      </div>

      {/* Siblings */}
      {siblings.length > 0 && (
        <div className="mt-4">
          <SectionLabel>Sibling variants ({siblings.length})</SectionLabel>
          <div className="grid gap-2 sm:grid-cols-2">
            {siblings.map((s) => (
              <PersonalNode
                key={s.id}
                pattern={s}
                href={ownerPatternPermalink({
                  id: s.id,
                  promoted_to_canonical_id: s.promoted_to_canonical_id ?? null,
                  promotedCanonicalSlug: s.promoted_canonical_slug ?? null,
                })}
                diffAgainst={parent ?? null}
                badge="Sibling"
                badgeTone="sibling"
              />
            ))}
          </div>
        </div>
      )}

      {/* Children */}
      {children.length > 0 && (
        <div className="mt-4">
          <SectionLabel>Children ({children.length})</SectionLabel>
          <div className="grid gap-2 sm:grid-cols-2">
            {children.map((c) => (
              <PersonalNode
                key={c.id}
                pattern={c}
                href={ownerPatternPermalink({
                  id: c.id,
                  promoted_to_canonical_id: c.promoted_to_canonical_id ?? null,
                  promotedCanonicalSlug: c.promoted_canonical_slug ?? null,
                })}
                diffAgainst={pattern}
                badge="Child"
                badgeTone="child"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CanonicalTree({
  data,
  createVariantHref,
}: {
  data: CanonicalLineage;
  createVariantHref?: string;
}) {
  const { canonical, variants } = data;
  if (!canonical) return null;

  return (
    <div className="rounded-xl border border-[#21262D] bg-[#161B22] p-5">
      <Header title={`Community variants of ${canonical.name}`} createVariantHref={createVariantHref} />

      {variants.length === 0 ? (
        <p className="mt-2 text-xs text-[#6E7681]">
          No public variants yet. Create one and share it to become the first.
        </p>
      ) : (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {variants.map((v) => (
            <CommunityVariantNode key={v.id} variant={v} canonical={canonical} />
          ))}
        </div>
      )}
    </div>
  );
}

function Header({ title, createVariantHref }: { title: string; createVariantHref?: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h3 className="flex items-center gap-1.5 font-heading text-base font-bold text-[#F0F6FC]">
        <GitBranch className="h-4 w-4 text-[#00B4D8]" />
        {title}
        <HelpHint label="About variant lineage">
          <p className="text-[#F0F6FC] font-semibold">Variants are linked children of a parent pattern.</p>
          <p>Forking a fly captures what&apos;s different (size, bead, color) and remembers where it came from — so you can tell <em>Frenchie #16 olive</em> from <em>Frenchie #14 red-collar</em> at a glance.</p>
          <p className="text-[#6E7681] text-xs">Public canonical patterns also show community variants here.</p>
        </HelpHint>
      </h3>
      {createVariantHref && (
        <Link
          href={createVariantHref}
          className="inline-flex items-center gap-1 rounded-md border border-[#00B4D8]/40 bg-[#00B4D8]/10 px-2.5 py-1 text-xs font-semibold text-[#00B4D8] hover:bg-[#00B4D8]/20"
        >
          <Sparkles className="h-3 w-3" /> New variant
        </Link>
      )}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#6E7681]">
      {children}
    </div>
  );
}

function Thumb({ url, alt }: { url: string | null; alt: string }) {
  return (
    <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-[#0D1117]">
      {url ? (
        <Image src={url} alt={alt} fill className="object-cover" sizes="48px" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-xl">🪝</div>
      )}
    </div>
  );
}

function MetaLine({ pattern }: { pattern: FlyPattern }) {
  const parts = [
    pattern.type,
    pattern.size ? `#${pattern.size}` : null,
    pattern.fly_color,
    pattern.bead_color ? `${pattern.bead_color} bead` : null,
  ].filter(Boolean);
  if (parts.length === 0) return null;
  return <p className="truncate text-xs text-[#6E7681]">{parts.join(" · ")}</p>;
}

function PersonalNode({
  pattern,
  href,
  diffAgainst,
  badge,
  badgeTone,
}: {
  pattern: FlyPattern;
  href: string;
  diffAgainst: FlyPattern | null;
  badge: string;
  badgeTone: "parent" | "sibling" | "child";
}) {
  const [open, setOpen] = useState(false);
  const badgeClass =
    badgeTone === "parent"
      ? "bg-[#0BA5C7]/10 text-[#0BA5C7]"
      : badgeTone === "child"
        ? "bg-[#E8923A]/10 text-[#E8923A]"
        : "bg-[#21262D] text-[#A8B2BD]";

  return (
    <div className="rounded-lg border border-[#21262D] bg-[#0D1117]">
      <div className="flex items-start gap-3 p-3">
        <Thumb url={pattern.image_url ?? pattern.my_tied_fly_photo_url ?? null} alt={pattern.name} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Link
              href={href}
              className="truncate font-semibold text-[#F0F6FC] hover:text-[#E8923A]"
            >
              {pattern.name}
            </Link>
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${badgeClass}`}
            >
              {badge}
            </span>
          </div>
          <MetaLine pattern={pattern} />
          {diffAgainst && (
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-[#00B4D8] hover:text-[#0BA5C7]"
            >
              {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              {open ? "Hide diff" : "Show diff"}
            </button>
          )}
        </div>
      </div>
      {open && diffAgainst && (
        <div className="border-t border-[#21262D] p-3">
          <RecipeDiff
            parent={diffAgainst}
            child={pattern}
            parentLabel={diffAgainst.name}
            childLabel={pattern.name}
            compact
          />
        </div>
      )}
    </div>
  );
}

function CanonicalNode({ canonical, badge }: { canonical: CanonicalLite; badge: string }) {
  return (
    <Link
      href={`/flies/${canonical.slug}`}
      className="flex items-start gap-3 rounded-lg border border-[#21262D] bg-[#0D1117] p-3 hover:border-[#00B4D8]/40"
    >
      <Thumb url={canonical.hero_image_url ?? null} alt={canonical.name} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-semibold text-[#F0F6FC]">{canonical.name}</span>
          <span className="rounded-full bg-[#0BA5C7]/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#0BA5C7]">
            {badge}
          </span>
        </div>
        {canonical.tagline && (
          <p className="truncate text-xs text-[#6E7681]">{canonical.tagline}</p>
        )}
      </div>
    </Link>
  );
}

function CommunityVariantNode({
  variant,
  canonical,
}: {
  variant: CanonicalLineage["variants"][number];
  canonical: CanonicalLite;
}) {
  const [open, setOpen] = useState(false);
  const image = variant.image_url ?? variant.my_tied_fly_photo_url ?? null;
  return (
    <div className="rounded-lg border border-[#21262D] bg-[#0D1117]">
      <div className="flex items-start gap-3 p-3">
        <Thumb url={image} alt={variant.name} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-[#F0F6FC]">{variant.name}</p>
          <p className="truncate text-xs text-[#6E7681]">
            {[variant.type, variant.size ? `#${variant.size}` : null, variant.fly_color]
              .filter(Boolean)
              .join(" · ") || "Community variant"}
          </p>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-[#00B4D8] hover:text-[#0BA5C7]"
          >
            {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            {open ? "Hide diff" : "What's different"}
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-[#21262D] p-3">
          <RecipeDiff
            parent={{
              name: canonical.name,
              type: canonical.category ? canonical.category : null,
              size: null,
              fly_color: null,
              bead_color: null,
              hook: null,
              bead_size: null,
              materials: null,
              description: null,
              video_url: null,
              tags: null,
            }}
            child={{
              name: variant.name,
              type: variant.type ?? null,
              size: variant.size ?? null,
              fly_color: variant.fly_color ?? null,
              bead_color: variant.bead_color ?? null,
              hook: variant.hook ?? null,
              bead_size: variant.bead_size ?? null,
              materials: null,
              description: null,
              video_url: null,
              tags: null,
            }}
            parentLabel={canonical.name}
            childLabel={variant.name}
            compact
          />
        </div>
      )}
    </div>
  );
}

// Export for callers that want to render a "New variant" CTA next to the tree
export function NewVariantPill({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 rounded-md border border-[#00B4D8]/40 bg-[#00B4D8]/10 px-2.5 py-1 text-xs font-semibold text-[#00B4D8] hover:bg-[#00B4D8]/20"
    >
      <Plus className="h-3 w-3" /> Variant
    </Link>
  );
}
