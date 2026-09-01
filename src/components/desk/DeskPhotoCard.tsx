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
  /** plate = Inter 12px captions. river = Fraunces titles. */
  density?: "river" | "plate";
}

/** Pictures-first specimen card. No lift, no copper, tokens from DESIGN.md. */
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
  const showWell = !plate || Boolean(imageUrl);
  return (
    <Link href={href} className="card-hover group block">
      {showWell ? (
      <div
        className={`relative isolate w-full bg-[var(--paper)] ${
          plate ? "aspect-square" : featured ? "aspect-[832/480]" : "aspect-[416/240]"
        }`}
      >
        <div className={plate ? "absolute inset-0 mix-blend-multiply" : "contents"}>
        <SafeEntityImage
          src={imageUrl}
          alt={imageAlt}
          title={title}
          meta={meta}
          fallback={plate ? "none" : "named"}
          className={plate ? "object-contain" : "object-cover"}
          sizes={featured ? "(max-width: 1024px) 100vw, 65vw" : "(max-width: 1024px) 100vw, 33vw"}
        />
        </div>
      </div>
      ) : null}
      {plate ? (
        <h3 className="mt-2 text-[12px] font-medium text-[var(--text-1)] group-hover:text-[var(--accent)]">
          {title}
        </h3>
      ) : (
        <h3
          className={`mt-2 font-heading font-semibold text-[var(--text-1)] group-hover:text-[var(--accent)] ${
            featured ? "text-[30px] leading-none" : "text-[20px] leading-[25px]"
          }`}
        >
          {title}
        </h3>
      )}
      {(kicker || meta || liveHint) && (
        <p className={`text-[var(--text-3)] ${plate ? "mt-1 text-[12px]" : "mt-2 text-[13px]"}`}>
          {kicker}
          {liveHint ? (
            <>
              {kicker ? "  ·  " : null}
              <span className="text-[var(--accent)]">{liveHint}</span>
            </>
          ) : null}
          {meta ? (
            <>
              {kicker || liveHint ? "  ·  " : null}
              <span className="num">{meta}</span>
            </>
          ) : null}
        </p>
      )}
    </Link>
  );
}
