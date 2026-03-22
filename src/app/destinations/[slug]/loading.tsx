export default function Loading() {
  return (
    <>
      {/* Hero skeleton */}
      <div className="h-[65vh] bg-[#1F2937] animate-pulse" />

      {/* Breadcrumb skeleton */}
      <div className="bg-[#0D1117]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="h-4 bg-[#1F2937] rounded w-48 animate-pulse" />
        </div>
      </div>

      {/* Content skeleton — deliberately minimal so it doesn't look like a duplicate page */}
      <section className="bg-[#0D1117] pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full border-4 border-[#E8923A] border-t-transparent animate-spin" />
              <p className="text-[#A8B2BD] text-sm">Loading destination…</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
