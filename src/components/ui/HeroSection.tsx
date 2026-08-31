import { Camera } from "@/icons";
import SafeEntityImage from "@/components/media/SafeEntityImage";
import { isUsableImageUrl } from "@/lib/media/image-url";

interface HeroSectionProps {
  imageUrl?: string;
  imageAlt: string;
  title: string;
  subtitle?: string;
  height?: string;
  children?: React.ReactNode;
  imageContain?: boolean;
  /** Photo credit — photographer name or "© Name" */
  imageCredit?: string;
  /** Optional link to photographer's site or portfolio */
  imageCreditUrl?: string;
  /**
   * "chip" (default) — the solid-ink credit pill in the paper band, used by
   * fly-shops/species/lodges heroes. "overlay" — a plain metadata line under
   * the subtitle in the paper band. Credit never sits on the photograph.
   */
  creditStyle?: "chip" | "overlay";
}

/**
 * Flat hero (DESIGN.md § Imagery): graded photograph in its own band, title
 * and subtitle on paper below. No scrims, no text over the photo — gradients
 * are banned and overlines/metadata never sit on imagery.
 */
export default function HeroSection({
  imageUrl,
  imageAlt,
  title,
  subtitle,
  height = "h-[60vh]",
  imageContain = false,
  imageCredit,
  imageCreditUrl,
  creditStyle = "chip",
  children,
}: HeroSectionProps) {
  const showCredit = Boolean(imageCredit) && isUsableImageUrl(imageUrl);

  return (
    <section className="w-full">
      <div
        className={`relative ${height} w-full overflow-hidden${imageContain ? " bg-[var(--surface-card)]" : ""}`}
      >
        <SafeEntityImage
          src={imageUrl}
          alt={imageAlt}
          title=""
          contain={imageContain}
          className={
            imageContain
              ? "object-contain"
              : "object-cover [filter:var(--photo-grade)]"
          }
          priority
          sizes="100vw"
        />
      </div>

      <div className="border-b border-[var(--border)]">
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <h1 className="max-w-4xl text-[var(--text-1)]">{title}</h1>
          {subtitle && (
            <p className="mt-4 max-w-2xl text-[var(--text-18)] leading-relaxed text-[var(--text-2)]">
              {subtitle}
            </p>
          )}
          {children}
          {showCredit && creditStyle === "chip" && (
            <div className="mt-3">
              {imageCreditUrl ? (
                <a
                  href={imageCreditUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded bg-[var(--ink)] px-2 py-1 text-[var(--text-12)] font-medium text-[var(--paper)] hover:opacity-90 transition-opacity"
                >
                  <Camera className="h-3.5 w-3.5" />
                  {imageCredit}
                </a>
              ) : (
                <span className="inline-flex items-center gap-1 rounded bg-[var(--ink)] px-2 py-1 text-[var(--text-12)] font-medium text-[var(--paper)]">
                  <Camera className="h-3.5 w-3.5" />
                  {imageCredit}
                </span>
              )}
            </div>
          )}
          {showCredit && creditStyle === "overlay" && (
            <p className="mt-3 text-[var(--text-13)] tracking-wide text-[var(--text-3)]">
              {imageCreditUrl ? (
                <a
                  href={imageCreditUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4 hover:text-[var(--text-1)]"
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
    </section>
  );
}
