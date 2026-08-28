import SafeEntityImage from "@/components/media/SafeEntityImage";
import { pullQuoteFromEssay } from "@/lib/destinations/season";

export interface PlaceEssayImage {
  src: string;
  alt: string;
  caption?: string;
}

interface PlaceEssayProps {
  description: string;
  images?: PlaceEssayImage[];
}

export default function PlaceEssay({ description, images = [] }: PlaceEssayProps) {
  const paragraphs = description
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  const quote = pullQuoteFromEssay(description);

  return (
    <article className="prose">
      {paragraphs.map((paragraph, i) => (
        <div key={i}>
          <p>{paragraph}</p>
          {i === 0 && quote ? (
            <blockquote className="my-10 border-l-2 border-[var(--accent)] pl-6 not-italic">
              <p className="font-heading text-2xl font-semibold leading-snug text-[var(--text-1)]">
                {quote}
              </p>
            </blockquote>
          ) : null}
          {i === 1 && images[0] ? <InlinePhoto image={images[0]} /> : null}
          {i === 2 && images[1] ? <InlinePhoto image={images[1]} /> : null}
        </div>
      ))}
    </article>
  );
}

function InlinePhoto({ image }: { image: PlaceEssayImage }) {
  return (
    <figure className="my-10">
      <div className="relative aspect-[3/2] overflow-hidden bg-[var(--paper-deep)]">
        <SafeEntityImage
          src={image.src}
          alt={image.alt}
          title=""
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 680px"
        />
      </div>
      {image.caption ? (
        <figcaption className="mt-2 text-[13px] text-[var(--text-2)]">
          {image.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
