import Link from "next/link";

interface Props {
  name: string;
  line?: string;
  href?: string;
}

/** Notched cream plate. Type only — never a reserved square, never an AI insect. */
export default function GazettePlate({ name, line, href }: Props) {
  const inner = (
    <>
      <div className="ea-plate-well" aria-hidden />
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
