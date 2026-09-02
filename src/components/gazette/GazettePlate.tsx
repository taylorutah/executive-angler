import Link from "next/link";

export type PlateEtch =
  | "dry"
  | "nymph"
  | "streamer"
  | "emerger"
  | "wet"
  | "terrestrial"
  | "egg"
  | "midge";

interface Props {
  name: string;
  line?: string;
  href?: string;
  etch?: PlateEtch;
}

/** Notched cream plate. Type + ink etch from the desk fly icons — never a photo. */
export default function GazettePlate({ name, line, href, etch }: Props) {
  const inner = (
    <>
      {etch ? <span className="ea-plate-etch" data-etch={etch} aria-hidden /> : null}
      <p className="ea-plate-name">{name}</p>
      {line ? <p className="ea-plate-line">{line}</p> : null}
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
