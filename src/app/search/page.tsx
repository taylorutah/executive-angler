"use client";

import { Suspense } from "react";
import SearchPageClient, { SearchPageFallback } from "@/components/search/SearchPageClient";

export default function SearchPage() {
  return (
    <div className="bg-[var(--paper)]">
      <div className="desk-sheet">
        <div className="house-measure">
        <Suspense fallback={<SearchPageFallback />}>
          <SearchPageClient />
        </Suspense>
        </div>
      </div>
    </div>
  );
}
