"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[EA Error Boundary]", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-6xl font-bold text-[var(--action)]/30 font-mono mb-4">Error</p>
        <h2 className="font-serif text-2xl text-[var(--text-primary)] mb-3">Something went wrong</h2>
        <p className="text-[var(--text-body)] mb-6 text-sm">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-[var(--action)] text-[var(--on-action)] font-semibold rounded-lg hover:bg-[#F0A65A] transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
