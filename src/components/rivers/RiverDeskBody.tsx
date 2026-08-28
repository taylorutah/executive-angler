import Link from "next/link";
import { Suspense } from "react";
import HomeGutter from "@/components/home/HomeGutter";
import SafeEntityImage from "@/components/media/SafeEntityImage";
import RiverConditionsCard from "./RiverConditionsCard";
import YourRecordHere from "./YourRecordHere";
import type { Article } from "@/types/entities";
import type { HatchRailRow, WeekFlyChip } from "@/lib/rivers/week-flies";

interface Props {
  riverId: string;
  riverName: string;
  description: string;
  usgsGaugeId?: string | null;
  riverLatitude?: number | null;
  riverLongitude?: number | null;
  regulations?: string | null;
  weekFlies: WeekFlyChip[];
  hatchRail: HatchRailRow[];
  fieldNote?: Pick<Article, "slug" | "title" | "excerpt"> | null;
}

function Eyebrow({ children }: { children: string }) {
  return (
    <p className="font-ui text-[11px] font-medium uppercase tracking-[1.6px] text-[var(--slate)]">
      {children}
    </p>
  );
}

function LiveFallback({ riverName }: { riverName: string }) {
  return (
    <div className="register-dusk bg-[var(--riverbed)] px-5 pb-4 pt-4" aria-hidden>
      <p className="font-ui text-[11px] font-medium uppercase tracking-[1.4px] text-[var(--signal-live)]">
        Live
      </p>
      <p className="mt-3 font-ui text-[11px] font-medium uppercase tracking-[1.2px] text-[var(--hero-type)]">
        {riverName}
      </p>
      <div className="mt-1 flex items-end gap-2 text-[var(--signal-live)]">
        <p
          className="font-heading text-[52px] font-semibold leading-[48px]"
          style={{ fontVariationSettings: '"SOFT" 0, "WONK" 1' }}
        >
          —
        </p>
        <p className="pb-1 font-ui text-[14px]">cfs</p>
      </div>
    </div>
  );
}

/**
 * River dossier body — Figma 40:489. 794 How-it-fishes + 438 instrument.
 * Copy comes from the river row, this month's chart, and related notes.
 * Do not invent a week's essay or a named put-in.
 */
export default function RiverDeskBody({
  riverId,
  riverName,
  description,
  usgsGaugeId,
  riverLatitude,
  riverLongitude,
  regulations,
  weekFlies,
  hatchRail,
  fieldNote,
}: Props) {
  const paragraphs = description.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);

  return (
    <section className="bg-[var(--paper)]">
      <HomeGutter className="py-12">
        <div className="flex flex-col items-start gap-12 xl:flex-row xl:gap-12">
          <div className="flex w-full max-w-[794px] flex-col gap-7 xl:w-[794px] xl:shrink-0">
            {paragraphs.length > 0 ? (
              <div className="flex flex-col gap-3.5">
                <Eyebrow>How it fishes</Eyebrow>
                <div className="space-y-3.5 font-body text-[17px] leading-7 text-[var(--graphite)]">
                  {paragraphs.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </div>
            ) : null}

            {weekFlies.length > 0 ? (
              <div className="flex flex-col gap-3">
                <Eyebrow>On the water this week</Eyebrow>
                <ul className="flex flex-wrap gap-2">
                  {weekFlies.map((chip) => {
                    const meta = [chip.size, chip.hint].filter(Boolean).join("  ·  ");
                    const inner = (
                      <>
                        <div className="relative size-16 shrink-0">
                          <SafeEntityImage
                            src={chip.imageUrl}
                            alt={chip.name}
                            title={chip.name}
                            fallback="quiet"
                            sizes="64px"
                            className="object-cover"
                          />
                        </div>
                        <span className="flex flex-col gap-0.5">
                          <span className="font-ui text-[13px] font-medium text-[var(--ink)]">
                            {chip.name}
                          </span>
                          {meta ? (
                            <span className="font-ui text-[11px] text-[var(--slate)]">{meta}</span>
                          ) : null}
                        </span>
                      </>
                    );
                    return (
                      <li key={chip.key}>
                        {chip.href ? (
                          <Link
                            href={chip.href}
                            className="flex items-center gap-2.5 rounded-[4px] border border-[var(--border-strong)] bg-[var(--paper)] py-2 pr-2.5 pl-2 hover:border-[var(--copper)]"
                          >
                            {inner}
                          </Link>
                        ) : (
                          <div className="flex items-center gap-2.5 rounded-[4px] border border-[var(--border-strong)] bg-[var(--paper)] py-2 pr-2.5 pl-2">
                            {inner}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : null}

            {fieldNote ? (
              <div className="flex flex-col gap-2">
                <Eyebrow>Field notes</Eyebrow>
                <Link
                  href={`/articles/${fieldNote.slug}`}
                  className="font-heading text-[22px] font-semibold text-[var(--ink)] hover:text-[var(--copper)]"
                  style={{ fontVariationSettings: '"SOFT" 0, "WONK" 1' }}
                >
                  {fieldNote.title}
                </Link>
                {fieldNote.excerpt ? (
                  <p className="font-ui text-[14px] text-[var(--graphite)]">{fieldNote.excerpt}</p>
                ) : null}
              </div>
            ) : null}
          </div>

          <aside className="w-full max-w-[438px] xl:w-[438px] xl:shrink-0">
            <div
              className="overflow-hidden bg-white"
              style={{
                borderRadius: "var(--radius-instrument)",
                border: "1px solid rgb(44 33 27 / 0.22)",
              }}
            >
              <Suspense fallback={<LiveFallback riverName={riverName} />}>
                <RiverConditionsCard
                  riverId={riverId}
                  usgsSiteId={usgsGaugeId ?? undefined}
                  riverName={riverName}
                  riverLatitude={riverLatitude}
                  riverLongitude={riverLongitude}
                  layout="well"
                />
              </Suspense>

              {hatchRail.length > 0 ? (
                <div className="flex flex-col gap-2 border-t border-[var(--border-strong)] px-5 py-4">
                  <p className="font-ui text-[11px] font-medium uppercase tracking-[1.4px] text-[var(--slate)]">
                    Hatch
                  </p>
                  <ul className="flex flex-col gap-2">
                    {hatchRail.map((row) => (
                      <li
                        key={row.insect}
                        className="flex items-start justify-between gap-4 font-ui"
                      >
                        <span className="text-[13px] text-[var(--ink)]">{row.insect}</span>
                        {row.detail ? (
                          <span className="shrink-0 text-[12px] text-[var(--slate)]">{row.detail}</span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="flex flex-col gap-2 border-t border-[var(--border-strong)] px-5 py-4">
                <p className="font-ui text-[11px] font-medium uppercase tracking-[1.4px] text-[var(--slate)]">
                  Access · regs
                </p>
                {regulations ? (
                  <p className="font-ui text-[13px] leading-5 text-[var(--graphite)]">{regulations}</p>
                ) : null}
              </div>

              <div className="flex flex-col gap-1.5 px-5 pt-4 pb-[18px]">
                <p className="font-ui text-[11px] font-medium uppercase tracking-[1.4px] text-[var(--slate)]">
                  Map
                </p>
                <p
                  className="font-heading text-[20px] font-semibold text-[var(--ink)]"
                  style={{ fontVariationSettings: '"SOFT" 0, "WONK" 1' }}
                >
                  {riverName}
                </p>
                <p className="font-ui text-[12px] text-[var(--slate)]">Walk-in. No pin.</p>
              </div>
            </div>

            <div className="mt-5 pt-2">
              <YourRecordHere riverId={riverId} riverName={riverName} />
            </div>
          </aside>
        </div>
      </HomeGutter>
    </section>
  );
}
