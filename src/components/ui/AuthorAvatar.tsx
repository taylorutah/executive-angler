import Image from "next/image";

interface Props {
  name: string;
  imageUrl?: string;
  sizes?: string;
  /** Tailwind text-size class for fallback initials. Default tuned for 144px circle. */
  fallbackTextClass?: string;
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function AuthorAvatar({
  name,
  imageUrl,
  sizes = "144px",
  fallbackTextClass = "text-2xl",
}: Props) {
  if (imageUrl) {
    return (
      <Image
        src={imageUrl}
        alt={name}
        fill
        sizes={sizes}
        className="object-cover"
      />
    );
  }

  return (
    <div
      className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[var(--action)] to-[#A8551A]"
      aria-label={name}
    >
      <span className={`font-heading font-bold text-[var(--text-primary)] tracking-wide ${fallbackTextClass}`}>
        {getInitials(name)}
      </span>
    </div>
  );
}
