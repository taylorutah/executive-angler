"use client";

/**
 * Client wrapper for the unified fly edit page. Renders FlyPatternForm and
 * submits PATCH to /api/flies/[id], which permission-gates owner vs admin
 * server-side and writes both flies.materials_list + fly_recipe_ingredients
 * atomically.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import FlyPatternForm, {
  type FlyPatternFormInitial,
} from "@/components/flies/FlyPatternForm";

interface Props {
  flyId: string;
  slug: string;
  mode: "edit" | "canonical-edit";
  /** Where to send the user after Save / Cancel. */
  returnTo: string;
  initial: FlyPatternFormInitial;
}

export default function FlyEditClient({
  flyId,
  slug,
  mode,
  returnTo,
  initial,
}: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setBusy(true);
    setError(null);
    try {
      const hasImage = formData.has("image");
      let res: Response;
      if (hasImage) {
        res = await fetch(`/api/flies/${flyId}`, {
          method: "PATCH",
          body: formData,
        });
      } else {
        const body: Record<string, unknown> = {};
        for (const [k, v] of formData.entries()) {
          if (k === "image") continue;
          body[k] = v;
        }
        res = await fetch(`/api/flies/${flyId}`, {
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
      router.push(returnTo);
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

  // Reference unused props to keep the signature stable for future use.
  void slug;

  return (
    <FlyPatternForm
      mode={mode}
      initial={initial}
      onSubmit={handleSubmit}
      busy={busy}
      error={error}
      cancelHref={returnTo}
      requireCaptcha={false}
    />
  );
}
