"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth-context";
import type { LearnFly, LearnRiver } from "./types";

type Props = {
  flies: LearnFly[];
  rivers: LearnRiver[];
};

export default function KeepList({ flies, rivers }: Props) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [state, setState] = useState<"idle" | "saving" | "kept" | "error">("idle");

  async function keep() {
    if (isLoading) return;
    if (!user) {
      router.push("/login?redirect=/learn");
      return;
    }
    setState("saving");
    try {
      const riverPosts = rivers.map((r) =>
        fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ entity_type: "river", entity_id: r.id }),
        }),
      );

      const flyPosts = flies.map(async (f) => {
        const existing = await fetch(
          `/api/fishing/fly-configurations?fly_id=${encodeURIComponent(f.id)}`,
        );
        if (existing.ok) {
          const json = (await existing.json()) as {
            configurations?: Array<{ id: string; is_favorite?: boolean }>;
          };
          const row = json.configurations?.[0];
          if (row?.id) {
            if (row.is_favorite) return;
            await fetch("/api/fishing/fly-configurations", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id: row.id, is_favorite: true }),
            });
            return;
          }
        }
        await fetch("/api/fishing/fly-configurations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fly_id: f.id, is_favorite: true }),
        });
      });

      await Promise.all([...riverPosts, ...flyPosts]);
      setState("kept");
    } catch {
      setState("error");
    }
  }

  return (
    <div>
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <section aria-labelledby="keep-flies">
          <h3
            id="keep-flies"
            className="font-heading text-2xl font-bold text-[var(--text-primary)]"
          >
            Five flies
          </h3>
          <ol className="mt-5 divide-y divide-[var(--border-rule)] border-y border-[var(--border-rule)]">
            {flies.map((fly, i) => (
              <li key={fly.id}>
                <Link
                  href={`/flies/${fly.slug}`}
                  className="ea-focus-ring flex items-baseline gap-4 py-3.5"
                >
                  <span className="num w-6 shrink-0 font-mono text-[12px] tabular-nums text-[var(--text-meta)]">
                    {i + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="font-heading text-[17px] font-semibold text-[var(--text-primary)] underline decoration-transparent underline-offset-4 hover:text-[var(--action)] hover:decoration-[var(--action)]">
                      {fly.name}
                    </span>
                    <span className="mt-0.5 block text-[14px] text-[var(--text-body)]">
                      {fly.job}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="keep-rivers">
          <h3
            id="keep-rivers"
            className="font-heading text-2xl font-bold text-[var(--text-primary)]"
          >
            Five rivers
          </h3>
          <ol className="mt-5 divide-y divide-[var(--border-rule)] border-y border-[var(--border-rule)]">
            {rivers.map((river, i) => (
              <li key={river.id}>
                <Link
                  href={`/rivers/${river.slug}`}
                  className="ea-focus-ring flex items-baseline gap-4 py-3.5"
                >
                  <span className="num w-6 shrink-0 font-mono text-[12px] tabular-nums text-[var(--text-meta)]">
                    {i + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="font-heading text-[17px] font-semibold text-[var(--text-primary)] underline decoration-transparent underline-offset-4 hover:text-[var(--action)] hover:decoration-[var(--action)]">
                      {river.name}
                    </span>
                    <span className="mt-0.5 block text-[14px] text-[var(--text-body)]">
                      {river.place}
                      {river.flowType ? ` · ${river.flowType}` : ""}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <div className="mt-10 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        <Button
          type="button"
          variant="solid"
          size="lg"
          onClick={keep}
          loading={state === "saving"}
          disabled={state === "saving" || state === "kept"}
        >
          {state === "kept" ? "Kept" : "Keep this list"}
        </Button>
        <p className="text-[14px] leading-relaxed text-[var(--text-body)]">
          {state === "kept" ? (
            <>
              The flies are in your box. The rivers are in{" "}
              <Link
                href="/rivers/mine"
                className="text-[var(--text-primary)] underline decoration-[var(--border-rule)] underline-offset-4 hover:text-[var(--action)] hover:decoration-[var(--action)]"
              >
                My Rivers
              </Link>
              .
            </>
          ) : (
            <>An account is how the list stays yours. Nothing else is required.</>
          )}
        </p>
      </div>
      {state === "error" && (
        <p className="mt-3 text-[14px] text-[var(--state-negative)]">
          Could not save the list. Try again.
        </p>
      )}
    </div>
  );
}
