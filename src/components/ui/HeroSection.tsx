import Image from "next/image";

interface HeroSectionProps {
  imageUrl: string;
  imageAlt: string;
  title: string;
  subtitle?: string;
  height?: string;
  overlay?: "dark" | "light";
  children?: React.ReactNode;
  imageContain?: boolean;
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
}: HeroSectionProps) {
  return (
    <section className={`relative ${height} w-full overflow-hidden${imageContain ? " bg-slate-800" : ""}`}>
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
    </section>
  );
}
