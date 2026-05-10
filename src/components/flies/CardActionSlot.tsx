"use client";

import FlyBoxAddButton from "./FlyBoxAddButton";

/**
 * Inline "add to fly box" affordance for catalog cards whose root is a
 * <Link>. Stops propagation so the trigger never navigates the parent.
 *
 * Card lists pass only `canonicalFlyId` + `flyName` (the actionSlot type is
 * cross-boundary serializable); the underlying sheet lazy-fetches sizes /
 * colors / bead options / hero image on open so chip pickers populate
 * correctly without forcing every list page to hydrate richer data.
 */
export default function CardActionSlot({
  canonicalFlyId,
  flyName,
  placement = "top-right",
}: {
  canonicalFlyId: string;
  flyName: string;
  placement?: "top-right" | "inline";
}) {
  if (placement === "inline") {
    return (
      <FlyBoxAddButton
        fly={{ id: canonicalFlyId, name: flyName }}
        variant="pill"
        stopPropagation
      />
    );
  }
  return (
    <div className="absolute top-2 right-2 z-10">
      <FlyBoxAddButton
        fly={{ id: canonicalFlyId, name: flyName }}
        variant="icon"
        stopPropagation
      />
    </div>
  );
}
