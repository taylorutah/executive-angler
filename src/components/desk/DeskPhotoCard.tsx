import Link from "next/link";
import SafeEntityImage from "@/components/media/SafeEntityImage";

interface Props {
  href: string;
  imageUrl?: string;
  imageAlt: string;
  title: string;
  meta?: string;
  featured?: boolean;
  liveHint?: string;
}

/** Pictures-first card. Clip, lift, name stays, copper on hover. */
export default function DeskPhotoCard({
  href,
  imageUrl,
  imageAlt,
  title,
  meta,
  featured,
  liveHint,
}: Props) {
  return (
    <Link href={href} className="group block">
      <div
        className={`photo-lift relative w-full ${
          featured ? "aspect-[832/480]" : "aspect-[416/240]"
        }`}
      >
        <SafeEntityImage
          src={imageUrl}
          alt={imageAlt}
          title={title}
          className="object-cover"
          sizes={featured ? "(max-width: 1024px) 100vw, 65vw" : "(max-width: 1024px) 100vw, 33vw"}
        />
      </div>
      <h3
        className={`mt-2.5 font-heading font-semibold leading-none text-[var(--text-primary)] group-hover:text-[var(--action)] ${
          featured ? "text-[28px]" : "text-[20px]"
        }`}
        style={{ fontVariationSettings: '"SOFT" 0, "WONK" 1' }}
      >
        {title}
      </h3>
      {(meta || liveHint) && (
        <p className="mt-2 font-ui text-[13px] text-[var(--text-meta)]">
          {meta}
          {liveHint ? (
            <>
              {meta ? "  ·  " : null}
              <span className="text-[var(--signal-live)]">{liveHint}</span>
            </>
          ) : null}
        </p>
      )}
    </Link>
  );
}
