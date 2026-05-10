"use client";

/**
 * Back-compat shim — the original "Add to Fly Box" button. Now forwards to
 * <FlyBoxAddButton>, which opens the unified <QuickAddToBoxSheet> with
 * size / bead / color / box-picker UI.
 *
 * Preserved props (`canonicalFlyId`, `flyName`, `compact`) so existing call
 * sites in the canonical fly detail page and elsewhere keep working.
 */

import FlyBoxAddButton from "./FlyBoxAddButton";

interface AddToFlyBoxButtonProps {
  canonicalFlyId: string;
  flyName: string;
  compact?: boolean;
}

export default function AddToFlyBoxButton({
  canonicalFlyId,
  flyName,
  compact = false,
}: AddToFlyBoxButtonProps) {
  return (
    <FlyBoxAddButton
      fly={{ id: canonicalFlyId, name: flyName }}
      variant={compact ? "pill" : "full"}
    />
  );
}
