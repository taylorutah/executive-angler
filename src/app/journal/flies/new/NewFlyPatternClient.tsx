"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FlyPatternForm from "@/components/flies/FlyPatternForm";
import type { RecipeStep } from "@/components/flies/RecipeBuilder";

interface Props {
  isAdminUser: boolean;
}

export default function NewFlyPatternClient({ isAdminUser }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData, _steps: RecipeStep[]) {
    void _steps;
    setBusy(true);
    setError(null);
    try {
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

  return (
    <FlyPatternForm
      mode="new"
      onSubmit={handleSubmit}
      busy={busy}
      error={error}
      cancelHref="/journal/flies"
      requireCaptcha={!isAdminUser}
    />
  );
}
