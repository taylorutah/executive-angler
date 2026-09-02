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
 * Notched cream plate. A tied-fly still when plateImageUrl says so;
 * otherwise compact type — never an empty square, never a letter tile.
 */
export default function GazettePlate({ name, line, href, imageUrl }: Props) {
  const still = plateImageUrl(imageUrl);
  const [showStill, setShowStill] = useState(Boolean(still));
  const photo = showStill && still;

  const inner = (
    <>
      {photo ? (
        <span className="ea-plate-still ea-fly-well">
          <Image
            src={still}
            alt={name}
            fill
            sizes="(max-width: 640px) 92vw, (max-width: 1024px) 30vw, 12vw"
            className="object-contain p-1.5"
            onError={() => setShowStill(false)}
          />
        </span>
      ) : null}
      <p className="ea-plate-name">{name}</p>
      {line ? <p className="ea-plate-line">{line}</p> : null}
    </>
  );

  const plate = (
    <div className={photo ? "ea-plate" : "ea-plate ea-plate--type"}>{inner}</div>
  );

  if (href) {
    return (
      <Link href={href} className="ea-plate-ink">
        {plate}
      </Link>
    );
  }

  return <div className="ea-plate-ink">{plate}</div>;
}
