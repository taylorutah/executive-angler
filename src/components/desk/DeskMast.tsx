import HomeGutter from "@/components/home/HomeGutter";

interface Props {
  kicker?: string;
  title: string;
  lede: string;
}

/** INDEX / FIND mast from Water Desk frames. */
export default function DeskMast({ kicker = "INDEX", title, lede }: Props) {
  return (
    <section className="bg-[var(--surface-page)]">
      <HomeGutter className="pb-8 pt-14">
        <p className="font-ui text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--text-meta)]">
          {kicker}
        </p>
        <h1
          className="mt-4 font-heading text-[40px] font-semibold leading-none text-[var(--text-primary)] sm:text-[56px] sm:leading-[60px]"
          style={{ fontVariationSettings: '"SOFT" 0, "WONK" 1' }}
        >
          {title}
        </h1>
        <p className="prose mt-4 max-w-[720px] text-[18px] leading-7 text-[var(--text-body)] sm:text-[20px]">
          {lede}
        </p>
      </HomeGutter>
    </section>
  );
}
