import Image from "next/image";
import { Camera } from "lucide-react";

interface HeroSectionProps {
  imageUrl: string;
  imageAlt: string;
  title: string;
  subtitle?: string;
  height?: string;
  overlay?: "dark" | "light";
  children?: React.ReactNode;
  imageContain?: boolean;
  /** Photo credit — photographer name or "© Name" */
  imageCredit?: string;
  /** Optional link to photographer's site or portfolio */
  imageCreditUrl?: string;
}

export default function HeroSection({
  imageUrl,
  imageAlt,
  title,
  subtitle,
  height = "h-[60vh]",
  overlay = "dark",
  children,
  imageContain = false,
  imageCredit,
  imageCreditUrl,
}: HeroSectionProps) {
  return (
    <section className={`relative ${height} w-full overflow-hidden${imageContain ? " bg-[#1F2937]" : ""}`}>
      <Image
        src={imageUrl}
        alt={imageAlt}
        fill
        className={imageContain ? "object-contain" : "object-cover"}
        priority
        sizes="100vw"
      />
      <div
        className={`absolute inset-0 ${
          overlay === "dark" ? "hero-overlay" : "hero-overlay-light"
        }`}
      />
      <div className="absolute inset-0 flex items-end">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
          <h1 className="text-white text-4xl sm:text-5xl lg:text-6xl font-heading font-bold tracking-tight drop-shadow-lg">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-4 text-lg sm:text-xl text-white/90 max-w-2xl font-light leading-relaxed">
              {subtitle}
            </p>
          )}
          {children}
        </div>
      </div>

      {/* Photo credit — bottom right, subtle */}
      {imageCredit && (
        <div className="absolute bottom-3 right-4 z-10">
          {imageCreditUrl ? (
            <a
              href={imageCreditUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-black/40 backdrop-blur-sm text-white/60 hover:text-white/90 transition-colors text-[10px] font-medium"
            >
              <Camera className="h-2.5 w-2.5" />
              {imageCredit}
            </a>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-black/40 backdrop-blur-sm text-white/50 text-[10px] font-medium">
              <Camera className="h-2.5 w-2.5" />
              {imageCredit}
            </span>
          )}
        </div>
      )}
    </section>
  );
}
