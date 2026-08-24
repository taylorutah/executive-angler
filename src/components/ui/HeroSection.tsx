import { Camera } from "lucide-react";
import SafeEntityImage from "@/components/media/SafeEntityImage";
import { isUsableImageUrl } from "@/lib/media/image-url";

interface HeroSectionProps {
  imageUrl?: string;
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
  /**
   * "chip" (default) — the existing solid-ink rounded credit pill, used by
   * fly-shops/species/lodges heroes. "overlay" — a plain white/80 text line
   * under the title, in the same scrim band. Do not use "chip" on the place
   * page; a solid pill reads as app chrome over the essay-style hero.
   */
  creditStyle?: "chip" | "overlay";
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
  creditStyle = "chip",
}: HeroSectionProps) {
  const showCredit = Boolean(imageCredit) && isUsableImageUrl(imageUrl);

  return (
    <section className={`relative ${height} w-full overflow-hidden${imageContain ? " bg-[var(--surface-card)]" : ""}`}>
      <SafeEntityImage
        src={imageUrl}
        alt={imageAlt}
        title=""
        contain={imageContain}
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
          {showCredit && creditStyle === "overlay" && (
            <p className="mt-3 text-[11px] tracking-wide text-white/80">
              {imageCreditUrl ? (
                <a
                  href={imageCreditUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-white/40 underline-offset-4 hover:text-white hover:decoration-white"
                >
                  {imageCredit}
                </a>
              ) : (
                imageCredit
              )}
            </p>
          )}
        </div>
      </div>

      {showCredit && creditStyle === "chip" && (
        <div className="absolute bottom-3 right-4 z-10">
          {imageCreditUrl ? (
            <a
              href={imageCreditUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[var(--ink)] text-[var(--card)] hover:opacity-90 transition-opacity text-[10px] font-medium"
            >
              <Camera className="h-2.5 w-2.5" />
              {imageCredit}
            </a>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[var(--ink)] text-[var(--card)] text-[10px] font-medium">
              <Camera className="h-2.5 w-2.5" />
              {imageCredit}
            </span>
          )}
        </div>
      )}
    </section>
  );
}
