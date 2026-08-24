"use client";

import { Suspense } from "react";
import SearchPageClient, { SearchPageFallback } from "@/components/search/SearchPageClient";

export default function SearchPage() {
  return (
    <div className="pt-10 pb-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Suspense fallback={<SearchPageFallback />}>
          <SearchPageClient />
        </Suspense>
      </div>
    </div>
  );
}
