"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import FlyPatternForm, {
  type FlyPatternFormInitial,
} from "@/components/flies/FlyPatternForm";
import type { RecipeStep } from "@/components/flies/RecipeBuilder";

interface Props {
  isAdminUser: boolean;
}

interface CloneSourceResponse {
  sourceName: string;
  sourceSlug: string;
  initial: FlyPatternFormInitial;
  sourceImageUrl: string | null;
  error?: string;
}

export default function NewFlyPatternClient({ isAdminUser }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cloneFromId = searchParams.get("cloneFrom");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initial, setInitial] = useState<FlyPatternFormInitial | null>(null);
  const [sourceImageUrl, setSourceImageUrl] = useState<string | null>(null);
  const [sourceName, setSourceName] = useState<string | null>(null);
  const [loadingClone, setLoadingClone] = useState<boolean>(!!cloneFromId);

  useEffect(() => {
    if (!cloneFromId) return;
    let cancelled = false;
    setLoadingClone(true);
    fetch(`/api/fishing/flies/clone-source?canonicalId=${encodeURIComponent(cloneFromId)}`)
      .then((r) => r.json())
      .then((data: CloneSourceResponse) => {
        if (cancelled) return;
        if (data.error) {
          setError(data.error);
          setLoadingClone(false);
          return;
        }
        setInitial(data.initial);
        setSourceImageUrl(data.sourceImageUrl);
        setSourceName(data.sourceName);
        setLoadingClone(false);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load source fly");
        setLoadingClone(false);
      });
    return () => {
      cancelled = true;
    };
  }, [cloneFromId]);

  async function handleSubmit(formData: FormData, _steps: RecipeStep[]) {
    void _steps;
    setBusy(true);
    setError(null);
    try {
      // If we're cloning and the user didn't upload a fresh image, ask the
      // server to copy the canonical's hero image into the user's namespace.
      if (sourceImageUrl && !formData.has("image")) {
        formData.set("clone_image_from_url", sourceImageUrl);
      }
      const response = await fetch("/api/fishing/flies", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create fly pattern");
      }
      router.push("/journal/flies");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setBusy(false);
    }
  }

  if (loadingClone) {
    return (
      <div className="min-h-screen bg-[var(--surface-page)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-[var(--text-meta)]">
          <div className="h-8 w-8 rounded-full border-2 border-[var(--border-rule)] border-t-[#E8923A] animate-spin" />
          <p className="text-sm">Loading source fly…</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {sourceName && (
        <div className="mx-auto max-w-5xl px-4 sm:px-6 pt-4">
          <div className="rounded-md border border-[var(--signal-live)]/40 bg-[var(--signal-live)]/10 px-3 py-2 text-xs text-[var(--signal-live)]">
            Cloning from <span className="font-semibold">{sourceName}</span> — rename it and adjust any materials, then save as a new fly.
          </div>
        </div>
      )}
      <FlyPatternForm
        mode="new"
        initial={initial ?? undefined}
        onSubmit={handleSubmit}
        busy={busy}
        error={error}
        cancelHref="/journal/flies"
        requireCaptcha={!isAdminUser}
      />
    </>
  );
}
