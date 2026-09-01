"use client";

import { useState } from "react";
import Image from "next/image";
import PlateFallback from "./PlateFallback";
import { normalizeImageUrl } from "@/lib/media/image-url";
import { SURFACE_RAISED_BLUR_DATA_URL } from "@/lib/media/blur";

interface SafeEntityImageProps {
  src?: string | null;
  alt: string;
  title: string;
  meta?: string;
  className?: string;
  sizes?: string;
  /** Only for blob:/data: previews or SVGs the optimizer cannot fetch. */
  unoptimized?: boolean;
  priority?: boolean;
  loading?: "lazy" | "eager";
  /** object-contain + padding for illustrations */
  contain?: boolean;
  /** Origin leftover desks pass this; default stays the named plate. */
  fallback?: "quiet" | "named" | "none";
}

/**
 * next/image with a plate fallback when the URL is missing or fails to load.
 * Parent must be `relative` with an explicit size (fill).
 */
export default function SafeEntityImage({
  src,
  alt,
  title,
  meta,
  className,
  sizes,
  unoptimized,
  priority,
  loading,
  contain,
  fallback = "named",
}: SafeEntityImageProps) {
  const [failed, setFailed] = useState(false);
  const href = normalizeImageUrl(src);

  if (!href || failed) {
    if (fallback === "none") return null;
    return <PlateFallback title={title} meta={meta} quiet={fallback === "quiet"} />;
  }

  return (
    <>
      <Image
        src={href}
        alt={alt}
        fill
        unoptimized={unoptimized}
        priority={priority}
        loading={loading}
        sizes={sizes}
        placeholder={contain ? undefined : "blur"}
        blurDataURL={contain ? undefined : SURFACE_RAISED_BLUR_DATA_URL}
        className={
          className ??
          (contain ? "object-contain p-3" : "object-cover")
        }
        onError={() => setFailed(true)}
      />
    </>
  );
}
