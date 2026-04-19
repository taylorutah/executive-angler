"use client";

import AddToFlyBoxButton from "./AddToFlyBoxButton";

/**
 * A small positioned wrapper for AddToFlyBoxButton when used inside a
 * catalog card whose root is a <Link>. Stops click/mousedown from
 * bubbling to the parent anchor so users can add without navigating.
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
  const stop = (e: React.SyntheticEvent) => {
    e.stopPropagation();
  };
  if (placement === "inline") {
    return (
      <div onClick={stop} onMouseDown={stop}>
        <AddToFlyBoxButton canonicalFlyId={canonicalFlyId} flyName={flyName} compact />
      </div>
    );
  }
  return (
    <div
      className="absolute top-2 right-2 z-10"
      onClick={stop}
      onMouseDown={stop}
    >
      <AddToFlyBoxButton canonicalFlyId={canonicalFlyId} flyName={flyName} compact />
    </div>
  );
}
