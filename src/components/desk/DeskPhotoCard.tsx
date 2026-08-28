import Link from "next/link";
import SafeEntityImage from "@/components/media/SafeEntityImage";

interface Props {
  href: string;
  imageUrl?: string;
  imageAlt: string;
  title: string;
  meta?: string;
  kicker?: string;
  featured?: boolean;
  liveHint?: string;
  /** plate = Flies index 12px Archivo names. river = Fraunces 20/28. */
  density?: "river" | "plate";
}

/** Pictures-first card. Clip, lift, name stays, copper on hover. */
export default function DeskPhotoCard({
  href,
  imageUrl,
  imageAlt,
  title,
  meta,
  kicker,
  featured,
  liveHint,
  density = "river",
}: Props) {
  const plate = density === "plate";
  return (
    <Link href={href} className="group block">
      <div
        className={`photo-lift relative w-full ${
          plate ? "aspect-square" : featured ? "aspect-[832/480]" : "aspect-[416/240]"
        }`}
      >
        <SafeEntityImage
          src={imageUrl}
          alt={imageAlt}
          title={title}
          meta={meta}
          fallback={plate ? "quiet" : "named"}
          className="object-cover"
          sizes={featured ? "(max-width: 1024px) 100vw, 65vw" : "(max-width: 1024px) 100vw, 33vw"}
        />
      </div>
      {plate ? (
        <h3 className="hover-copper mt-1.5 font-ui text-[12px] font-medium text-[var(--text-primary)] group-hover:text-[var(--action)]">
          {title}
        </h3>
      ) : (
        <h3
          className={`hover-copper mt-2.5 font-heading font-semibold leading-none text-[var(--text-primary)] group-hover:text-[var(--action)] ${
            featured ? "text-[28px]" : "text-[20px] leading-[25px]"
          }`}
          style={{ fontVariationSettings: '"SOFT" 0, "WONK" 1' }}
        >
          {title}
        </h3>
      )}
      {(kicker || meta || liveHint) && (
        <p className={`font-ui text-[var(--text-meta)] ${plate ? "mt-0.5 text-[11px]" : "mt-2 text-[13px]"}`}>
          {kicker}
          {liveHint ? (
            <>
              {kicker ? "  ·  " : null}
              <span className="text-[var(--signal-live)]">{liveHint}</span>
            </>
          ) : null}
          {meta ? (
            <>
              {kicker || liveHint ? "  ·  " : null}
              {meta}
            </>
          ) : null}
        </p>
      )}
    </Link>
  );
}
