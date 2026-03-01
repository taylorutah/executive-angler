import Image from "next/image";
import Link from "next/link";

interface EntityCardProps {
  href: string;
  imageUrl: string;
  imageAlt: string;
  title: string;
  subtitle?: string;
  meta?: string;
  badges?: string[];
}

export default function EntityCard({
  href,
  imageUrl,
  imageAlt,
  title,
  subtitle,
  meta,
  badges,
}: EntityCardProps) {
  return (
    <Link href={href} className="group block card-hover rounded-xl overflow-hidden bg-white shadow-md">
      <div className="relative h-56 overflow-hidden">
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          className="object-cover card-image-zoom"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {badges && badges.length > 0 && (
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            {badges.map((badge) => (
              <span
                key={badge}
                className="px-2.5 py-1 text-xs font-medium bg-white/90 backdrop-blur-sm text-forest-dark rounded-full"
              >
                {badge}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-heading text-lg font-semibold text-forest-dark group-hover:text-forest transition-colors">
          {title}
        </h3>
        {subtitle && (
          <p className="mt-1.5 text-sm text-slate-600 line-clamp-2">{subtitle}</p>
        )}
        {meta && (
          <p className="mt-2 text-xs font-medium text-slate-400 uppercase tracking-wider">
            {meta}
          </p>
        )}
      </div>
    </Link>
  );
}
