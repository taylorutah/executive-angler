import type { ReactNode } from "react";
import { Camera } from "@/icons";
import SafeEntityImage from "@/components/media/SafeEntityImage";
import EntityIdentityBand from "@/components/ui/EntityIdentityBand";
import { isUsableImageUrl } from "@/lib/media/image-url";

interface HeroSectionProps {
  imageUrl?: string;
  imageAlt: string;
  title: string;
  subtitle?: string;
  overline?: string;
  height?: string;
  children?: React.ReactNode;
  imageContain?: boolean;
  imageCredit?: string;
  imageCreditUrl?: string;
  creditStyle?: "chip" | "overlay";
  toolbar?: ReactNode;
  spec?: ReactNode;
}

/**
 * Flat hero (DESIGN.md § Imagery): graded photograph in its own band, title
 * and facts on paper below. No scrims, no text over the photo.
 */
export default function HeroSection({
  imageUrl,
  imageAlt,
  title,
  subtitle,
  overline,
  height = "h-[60vh]",
  imageContain = false,
  imageCredit,
  imageCreditUrl,
  creditStyle = "chip",
  toolbar,
  spec,
  children,
}: HeroSectionProps) {
  const showCredit = Boolean(imageCredit) && isUsableImageUrl(imageUrl);

  const credit =
    showCredit && creditStyle === "chip" ? (
      <div className="mt-3">
        {imageCreditUrl ? (
          <a
            href={imageCreditUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded bg-[var(--ink)] px-2 py-1 text-[length:var(--text-12)] font-medium text-[color:var(--paper)] hover:opacity-90 transition-opacity"
          >
            <Camera className="h-3.5 w-3.5" />
            {imageCredit}
          </a>
        ) : (
          <span className="inline-flex items-center gap-1 rounded bg-[var(--ink)] px-2 py-1 text-[length:var(--text-12)] font-medium text-[color:var(--paper)]">
            <Camera className="h-3.5 w-3.5" />
            {imageCredit}
          </span>
        )}
      </div>
    ) : showCredit && creditStyle === "overlay" ? (
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
    ) : null;

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

      <EntityIdentityBand
        toolbar={toolbar}
        overline={overline}
        title={title}
        meta={subtitle}
        spec={spec}
        credit={credit}
      >
        {children}
      </EntityIdentityBand>
    </section>
  );
}
