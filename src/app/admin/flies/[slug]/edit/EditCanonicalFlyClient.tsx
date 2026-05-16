"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FlyPatternForm, {
  type FlyPatternFormInitial,
} from "@/components/flies/FlyPatternForm";
import type { RecipeStep } from "@/components/flies/RecipeBuilder";

interface Props {
  flyId: string;
  slug: string;
  /** Where to send the user after Save / Cancel. Defaults to the public detail. */
  returnTo?: string;
  initial: FlyPatternFormInitial;
}

export default function EditCanonicalFlyClient({ flyId, slug, returnTo, initial }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const detailHref = returnTo ?? `/flies/${slug}`;

  async function handleSubmit(formData: FormData, _steps: RecipeStep[]) {
    void _steps;
    setBusy(true);
    setError(null);
    try {
      const hasImage = formData.has("image");
      let res: Response;
      if (hasImage) {
        res = await fetch(`/api/admin/flies/${flyId}`, {
          method: "PATCH",
          body: formData,
        });
      } else {
        const body: Record<string, unknown> = {};
        for (const [k, v] of formData.entries()) {
          if (k === "image") continue;
          body[k] = v;
        }
        res = await fetch(`/api/admin/flies/${flyId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }
      if (!res.ok) {
        const d = await res.json().catch(() => null);
        const reason =
          (d && typeof d.error === "string" && d.error) ||
          res.statusText ||
          "Unknown error";
        throw new Error(`Save failed (HTTP ${res.status}): ${reason}`);
      }
      router.push(detailHref);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Save failed — could not reach the server",
      );
      setBusy(false);
    }
  }

  return (
    <FlyPatternForm
      mode="canonical-edit"
      initial={initial}
      onSubmit={handleSubmit}
      busy={busy}
      error={error}
      cancelHref={detailHref}
      requireCaptcha={false}
    />
  );
}
