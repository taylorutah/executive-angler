"use client";

import { useState } from "react";
import Image from "next/image";
import PlateFallback from "./PlateFallback";
import { isUsableImageUrl } from "@/lib/media/image-url";
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
  /** Skip blur placeholder on list thumbnails — avoids CLS on index grids. */
  placeholderEmpty?: boolean;
  /** object-contain + padding for illustrations */
  contain?: boolean;
  /** Overlay painted only after the photo has loaded. */
  scrimClassName?: string;
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
  placeholderEmpty,
  contain,
  scrimClassName,
}: SafeEntityImageProps) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (!isUsableImageUrl(src) || failed) {
    return <PlateFallback title={title} meta={meta} />;
  }

  return (
    <>
      <Image
        src={src}
        alt={alt}
        fill
        unoptimized={unoptimized}
        priority={priority}
        loading={loading}
        fetchPriority={priority ? "high" : undefined}
        sizes={sizes}
        placeholder={placeholderEmpty ? "empty" : "blur"}
        blurDataURL={placeholderEmpty ? undefined : SURFACE_RAISED_BLUR_DATA_URL}
        className={
          className ??
          (contain ? "object-contain p-3" : "object-cover")
        }
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
      />
      {loaded && scrimClassName ? (
        <div className={`absolute inset-0 pointer-events-none ${scrimClassName}`} />
      ) : null}
    </>
  );
}
