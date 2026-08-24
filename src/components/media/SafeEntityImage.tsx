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
  unoptimized?: boolean;
  priority?: boolean;
  /** object-contain + padding for illustrations */
  contain?: boolean;
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
  contain,
}: SafeEntityImageProps) {
  const [failed, setFailed] = useState(false);

  if (!isUsableImageUrl(src) || failed) {
    return <PlateFallback title={title} meta={meta} />;
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      unoptimized={unoptimized}
      priority={priority}
      sizes={sizes}
      placeholder="blur"
      blurDataURL={SURFACE_RAISED_BLUR_DATA_URL}
      className={
        className ??
        (contain ? "object-contain p-3" : "object-cover")
      }
      onError={() => setFailed(true)}
    />
  );
}
