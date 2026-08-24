"use client";

import Image from "next/image";
import Link from "next/link";
import { Share2, Feather } from "lucide-react";
import type { FlyPattern } from "@/types/fishing-log";
import { flyPermalink } from "@/lib/flies/permalink";

export default function SharedPanel({
  shared,
  ownerUsernames,
}: {
  shared: FlyPattern[];
  ownerUsernames: Record<string, string>;
}) {
  if (shared.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-14 text-center">
        <Share2 className="mx-auto h-10 w-10 text-[var(--color-text-muted)]" />
        <h2 className="mt-4 font-heading text-lg font-bold text-[var(--color-text-primary)]">
          Nothing shared with you yet
        </h2>
        <p className="mx-auto mt-1 max-w-md text-sm text-[var(--color-text-muted)]">
          When another angler shares a pattern with you directly, it shows up here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {shared.map((p) => {
        const href = flyPermalink({
          id: p.id,
          slug: p.slug ?? null,
          promoted_to_canonical_id: p.promoted_to_canonical_id ?? null,
          promotedCanonicalSlug: p.promoted_canonical_slug ?? null,
          ownerUserId: p.user_id,
          ownerUsername: ownerUsernames[p.user_id] ?? null,
          viewerIsOwner: false,
        });
        return (
        <div
          key={p.id}
          className="flex flex-col gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
        >
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-[var(--color-bg)]">
              {p.image_url || p.my_tied_fly_photo_url ? (
                <Image
                  src={(p.image_url ?? p.my_tied_fly_photo_url)!}
                  alt={p.name}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-[var(--color-text-muted)]">
                  <Feather className="h-5 w-5" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold text-[var(--color-text-primary)]">{p.name}</h3>
              {p.type ? (
                <p className="text-[11px] uppercase tracking-wider text-[var(--color-text-muted)]">{p.type}</p>
              ) : null}
            </div>
          </div>
          <div className="mt-1 flex items-center justify-end">
            <Link
              href={href}
              className="text-xs text-[var(--action)] hover:underline"
            >
              Open
            </Link>
          </div>
        </div>
        );
      })}
    </div>
  );
}
