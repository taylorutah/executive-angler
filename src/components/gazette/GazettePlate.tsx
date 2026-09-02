"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { plateImageUrl } from "@/lib/media/image-url";

interface Props {
  name: string;
  line?: string;
  href?: string;
  imageUrl?: string;
}

/**
 * Notched cream plate when a hosted still exists.
 * Missing stills are compact type — never an empty square, never a letter tile.
 */
export default function GazettePlate({ name, line, href, imageUrl }: Props) {
  const still = plateImageUrl(imageUrl);
  const [showStill, setShowStill] = useState(Boolean(still));
  const photo = showStill && still;

  const caption = (
    <>
      <p className="ea-plate-name">{name}</p>
      {line ? <p className="ea-plate-line">{line}</p> : null}
    </>
  );

  if (!photo) {
    const type = <div className="ea-plate-type">{caption}</div>;
    if (href) {
      return (
        <Link href={href} className="ea-plate-type-link">
          {type}
        </Link>
      );
    }
    return type;
  }

  const inner = (
    <>
      <Image
        src={still}
        alt={name}
        width={480}
        height={480}
        sizes="(max-width: 640px) 42vw, (max-width: 1024px) 22vw, 12vw"
        className="ea-plate-photo"
        onError={() => setShowStill(false)}
      />
      {caption}
    </>
  );

  const plate = <div className="ea-plate">{inner}</div>;

  if (href) {
    return (
      <Link href={href} className="ea-plate-ink">
        {plate}
      </Link>
    );
  }

  return <div className="ea-plate-ink">{plate}</div>;
}
