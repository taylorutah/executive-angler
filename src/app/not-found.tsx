import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-8xl font-bold text-[#E8923A] font-mono mb-4">404</p>
        <h1 className="font-serif text-3xl text-[#F0F6FC] mb-3">
          River Not Found
        </h1>
        <p className="text-[#8B949E] mb-8">
          Looks like you&apos;ve waded into uncharted water. The page you&apos;re
          looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-[#E8923A] text-white font-semibold rounded-lg hover:bg-[#F0A65A] transition-colors"
          >
            Back to Shore
          </Link>
          <Link
            href="/rivers"
            className="px-6 py-3 bg-[#161B22] text-[#F0F6FC] font-semibold rounded-lg border border-[#21262D] hover:border-[#E8923A] transition-colors"
          >
            Explore Rivers
          </Link>
        </div>
      </div>
    </div>
  );
}
