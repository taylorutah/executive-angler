import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Learn to Fly Fish — Start Here",
  description:
    "The beginner path: the gear that actually matters, how to read water, the first five flies to carry, and forgiving rivers to learn on.",
  alternates: { canonical: `${SITE_URL}/learn` },
};

const NEXT_STEPS = [
  {
    href: "/rivers",
    label: "Rivers",
    blurb: "Access points, hatch charts, and current flows on water worth learning.",
  },
  {
    href: "/flies/library",
    label: "Fly library",
    blurb: "What each pattern imitates, and when to tie it on.",
  },
  {
    href: "/articles",
    label: "Articles",
    blurb: "Technique, gear, and conservation written for anglers who read.",
  },
];

export default function LearnPage() {
  return (
    <div className="bg-[var(--surface-page)] pt-10 pb-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--action)]">
          The beginner path
        </p>
        <h1 className="mt-4 font-heading text-4xl sm:text-5xl font-bold text-[var(--text-primary)]">
          Learn
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-[var(--text-body)]">
          Start here if fly fishing is new to you. This is the short path through the noise: the
          gear that actually matters, how to read water so you cast where fish hold, the first five
          flies worth carrying, and forgiving rivers where a beginner can still catch fish. More of
          it lands here as we write it.
        </p>

        <div className="mt-12 border-t border-[var(--border-rule)]">
          {NEXT_STEPS.map((step) => (
            <Link
              key={step.href}
              href={step.href}
              className="ea-focus-ring flex flex-col gap-1 border-b border-[var(--border-rule)] py-5 transition-colors duration-[120ms] ease-out hover:bg-[var(--surface-card)]"
            >
              <span className="text-[17px] font-semibold text-[var(--text-primary)]">
                {step.label}
              </span>
              <span className="text-[15px] text-[var(--text-body)]">{step.blurb}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
