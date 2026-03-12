export default function Loading() {
  return (
    <>
      {/* Hero skeleton */}
      <div className="h-[45vh] bg-[#1F2937] animate-pulse" />

      {/* Grid skeleton */}
      <section className="py-16 sm:py-20 bg-[#0D1117]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl overflow-hidden bg-[#161B22] shadow-md animate-pulse"
              >
                <div className="h-48 bg-[#1F2937]" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-[#1F2937] rounded w-3/4" />
                  <div className="h-4 bg-[#21262D] rounded w-1/2" />
                  <div className="h-3 bg-[#21262D] rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
