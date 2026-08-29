import HomeGutter from "@/components/home/HomeGutter";

interface Props {
  kicker?: string;
  title: string;
  lede: string;
  /** word = Rivers 56/60. phrase = Every fly we keep 48/56. */
  titleSize?: "word" | "phrase";
  /** essay = Newsreader 20/28 (Rivers). ui = Archivo 16/24 (catalog). */
  ledeFace?: "essay" | "ui";
}

/** INDEX / FIND mast from Water Desk frames. */
export default function DeskMast({
  kicker = "INDEX",
  title,
  lede,
  titleSize = "word",
  ledeFace = "essay",
}: Props) {
  const phrase = titleSize === "phrase";
  const catalog = ledeFace === "ui";

  return (
    <section className="bg-[var(--surface-page)]">
      <HomeGutter className="pb-8 pt-14">
        <p
          className={`font-ui text-[11px] font-medium uppercase text-[var(--text-meta)] ${
            catalog ? "tracking-[1.6px]" : "tracking-[1.8px]"
          }`}
        >
          {kicker}
        </p>
        <h1
          className={`mt-4 font-heading font-semibold text-[var(--text-primary)] text-[32px] leading-[36px] ${
            phrase ? "sm:text-[48px] sm:leading-[56px]" : "sm:text-[56px] sm:leading-[60px]"
          }`}
          style={{ fontVariationSettings: '"SOFT" 0, "WONK" 1' }}
        >
          {title}
        </h1>
        {catalog ? (
          <p className="mt-4 max-w-[720px] font-ui text-[16px] leading-6 text-[var(--text-body)]">
            {lede}
          </p>
        ) : (
          <p className="prose mt-4 max-w-[720px] text-[18px] leading-7 text-[var(--text-body)] sm:text-[20px]">
            {lede}
          </p>
        )}
      </HomeGutter>
    </section>
  );
}
