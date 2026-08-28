import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  PAPER,
  VELLUM,
  CARD,
  RULE,
  INK,
  GRAPHITE,
  SLATE,
  COPPER_700,
  TEAL_700,
  RISE_700,
  CUT_700,
} from "@/lib/palette";

export const metadata: Metadata = {
  title: "Styleguide",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type Swatch = {
  name: string;
  hex: string;
  role: string;
  against: string;
  againstHex: string;
  min: number;
};

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ];
}

function channel(c: number): number {
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function contrast(fg: string, bg: string): number {
  const L = (hex: string) => {
    const [r, g, b] = hexToRgb(hex);
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
  };
  const a = L(fg);
  const b = L(bg);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

const DAYLIGHT: Swatch[] = [
  { name: "paper", hex: PAPER, role: "page", against: "ink", againstHex: INK, min: 4.5 },
  { name: "vellum", hex: VELLUM, role: "raised", against: "ink", againstHex: INK, min: 4.5 },
  { name: "card", hex: CARD, role: "card", against: "ink", againstHex: INK, min: 4.5 },
  { name: "rule", hex: RULE, role: "border (non-text)", against: "paper", againstHex: PAPER, min: 3 },
  { name: "ink", hex: INK, role: "headings", against: "paper", againstHex: PAPER, min: 4.5 },
  { name: "graphite", hex: GRAPHITE, role: "body", against: "paper", againstHex: PAPER, min: 4.5 },
  { name: "slate", hex: SLATE, role: "meta / 13px captions", against: "vellum", againstHex: VELLUM, min: 4.5 },
  { name: "copper-700", hex: COPPER_700, role: "ACTION only", against: "vellum", againstHex: VELLUM, min: 4.5 },
  { name: "teal-700", hex: TEAL_700, role: "LIVE DATA only", against: "vellum", againstHex: VELLUM, min: 4.5 },
  { name: "rise-700", hex: RISE_700, role: "positive", against: "paper", againstHex: PAPER, min: 4.5 },
  { name: "cut-700", hex: CUT_700, role: "negative", against: "paper", againstHex: PAPER, min: 4.5 },
];

const SPINE = [
  "Header",
  "Search field",
  "Entity card",
  "Live conditions inset",
  "Filter bar",
  "Specimen plate",
  "Field-note dek",
  "Footer",
  "Signed-out state",
];

function SwatchGrid({ items }: { items: Swatch[]; ground?: string }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {items.map((s) => {
        const fg = s.role.includes("page") || s.role.includes("raised") || s.role.includes("card") || s.role.includes("surface") || s.role.includes("border")
          ? s.againstHex
          : s.hex;
        const bg = s.role.includes("page") || s.role.includes("raised") || s.role.includes("card") || s.role.includes("surface") || s.role.includes("border")
          ? s.hex
          : s.againstHex;
        const r = contrast(fg, bg);
        const ok = r + 1e-9 >= s.min;
        return (
          <div
            key={s.name}
            className="rounded-lg overflow-hidden border"
            style={{ borderColor: "var(--border-rule)" }}
          >
            <div className="h-20 px-3 py-2 flex flex-col justify-end" style={{ background: s.hex, color: fg }}>
              <span className="font-heading text-lg leading-none">{s.name}</span>
            </div>
            <div className="px-3 py-2 text-xs font-sans" style={{ background: "var(--surface-card)", color: "var(--text-body)" }}>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono">{s.hex}</span>
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide"
                  style={{
                    background: ok ? "var(--state-positive)" : "var(--state-negative)",
                    color: "var(--on-action)",
                  }}
                >
                  {ok ? "pass" : "fail"} {r.toFixed(2)}:1
                </span>
              </div>
              <p className="mt-1" style={{ color: "var(--text-meta)" }}>
                {s.role} · vs {s.against} (min {s.min}:1)
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TypeSpecimen() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-widest mb-2" style={{ fontFamily: "var(--font-ui)", color: "var(--text-meta)" }}>
          Display — Fraunces
        </p>
        <h1 className="font-heading text-5xl leading-none">The Madison is at 760</h1>
        <h2 className="font-heading text-3xl mt-2">Caddis are late this week</h2>
      </div>
      <div>
        <p className="text-xs uppercase tracking-widest mb-2" style={{ fontFamily: "var(--font-ui)", color: "var(--text-meta)" }}>
          Body — Fraunces (text optical size)
        </p>
        <p className="max-w-[68ch] text-[19px] leading-[1.7]" style={{ fontFamily: "var(--font-body)", color: "var(--text-body)" }}>
          A river page is a document, not a dashboard. Live readings sit in a
          bordered daylight panel — light theme only, the dusk register is
          deleted machinery.
        </p>
      </div>
      <div>
        <p className="text-xs uppercase tracking-widest mb-2" style={{ fontFamily: "var(--font-ui)", color: "var(--text-meta)" }}>
          UI — Archivo · .num tabular
        </p>
        <p className="text-sm" style={{ fontFamily: "var(--font-ui)" }}>
          Search · Rivers · Flies
        </p>
        <p className="num text-2xl mt-1">1,247 cfs · 48.2°F · #18</p>
      </div>
      <div>
        <p className="text-xs uppercase tracking-widest mb-2" style={{ fontFamily: "var(--font-ui)", color: "var(--text-meta)" }}>
          Mono — identifiers only
        </p>
        <p className="font-mono text-sm">USGS 06041000 · 44.6421, −111.6703 · 2X heavy</p>
      </div>
    </div>
  );
}

export default function StyleguidePage() {
  if (process.env.VERCEL_ENV === "production") notFound();

  return (
    <div className="min-h-screen" style={{ background: "var(--surface-page)", color: "var(--text-primary)" }}>
      <div className="mx-auto max-w-6xl px-4 py-12 space-y-16">
        <header>
          <p className="text-xs uppercase tracking-[0.2em]" style={{ fontFamily: "var(--font-ui)", color: "var(--text-meta)" }}>
            Internal · non-production
          </p>
          <h1 className="font-heading text-4xl mt-2">Styleguide</h1>
          <p className="mt-2 max-w-[68ch]" style={{ fontFamily: "var(--font-body)", color: "var(--text-body)" }}>
            Tokens, type, and components. Daylight is the only register;
            deep river green is the action colour and nothing else.
          </p>
        </header>

        <section>
          <h2 className="font-heading text-2xl mb-4">Daylight</h2>
          <SwatchGrid items={DAYLIGHT} ground={PAPER} />
        </section>

        <section>
          <div className="rounded-2xl p-6 border" style={{ borderColor: "var(--border-rule)", background: "var(--surface-card)" }}>
            <h2 className="font-heading text-2xl mb-4">Type · daylight</h2>
            <TypeSpecimen />
          </div>
        </section>

        <section className="rounded-2xl p-6 border" style={{ borderColor: "var(--border-rule)", background: "var(--paper)" }}>
          <h2 className="font-heading text-2xl mb-2">Instrument panel</h2>
          <p className="mb-4 max-w-[68ch]" style={{ fontFamily: "var(--font-body)", color: "var(--text-body)" }}>
            A live-conditions panel is a bordered daylight inset — hairline,
            instrument radius, no shadow.
          </p>
          <div className="flex items-baseline justify-between gap-4 p-4" style={{ background: "var(--surface-page)", color: "var(--text-primary)", borderRadius: "var(--radius-instrument)", border: "1px solid var(--border-rule)" }}>
            <div>
              <p className="text-xs uppercase tracking-widest" style={{ fontFamily: "var(--font-ui)", color: "var(--text-meta)" }}>Madison River</p>
              <p className="font-heading text-3xl">760 <span className="text-base" style={{ color: "var(--signal-live)" }}>cfs</span></p>
            </div>
            <p className="num text-sm" style={{ color: "var(--signal-live)" }}>live · USGS</p>
          </div>
        </section>

        <section className="rounded-2xl p-6 border" style={{ borderColor: "var(--border-rule)", background: "var(--surface-page)" }}>
          <h2 className="font-heading text-2xl mb-2">WorkbenchTable</h2>
          <p className="mb-4 max-w-[68ch]" style={{ fontFamily: "var(--font-body)", color: "var(--text-body)" }}>
            The one instrument table. <code className="font-mono text-sm">src/components/data/DataTable</code> and{" "}
            <code className="font-mono text-sm">src/components/ui/DataTable</code> are gone — they were never
            imported, despite a comment that claimed four adopters.{" "}
            <code className="font-mono text-sm">WorkbenchTable</code> is the primitive:{" "}
            <code className="font-mono text-sm">/journal</code>,{" "}
            <code className="font-mono text-sm">/flybox</code>,{" "}
            <code className="font-mono text-sm">/rivers/mine</code>,{" "}
            <code className="font-mono text-sm">/account/gear</code>.
          </p>
          <ul className="mb-4 space-y-1 text-sm" style={{ fontFamily: "var(--font-ui)", color: "var(--text-body)" }}>
            <li>12px vertical cell padding · row hover paper-deep · numerics in <code className="font-mono">.num</code>, right-aligned</li>
            <li>Inline edit flashes green on save, red on error, then clears</li>
            <li>Bulk toolbar appears only when a row is selected</li>
            <li>
              Keyboard: <code className="font-mono">↑↓</code> / <code className="font-mono">j k</code> move,{" "}
              <code className="font-mono">Space</code> selects, <code className="font-mono">↵</code> activates,{" "}
              <code className="font-mono">/</code> filter, <code className="font-mono">Esc</code> cancels,{" "}
              <code className="font-mono">⌘K</code> site search
            </li>
            <li>
              Focus is roving tabindex — the active row is <code className="font-mono">tabIndex=0</code>, the
              others <code className="font-mono">-1</code>, and the cursor calls{" "}
              <code className="font-mono">.focus()</code>. A painted ring is not a stop.
            </li>
          </ul>
          <div className="grid items-center border-b text-[12px] font-medium uppercase tracking-[0.06em]" style={{ gridTemplateColumns: "32px 1fr 64px", borderColor: "var(--border)", color: "var(--text-3)" }}>
            <span />
            <span className="px-2 py-3">Session</span>
            <span className="px-2 py-3 text-right">Fish</span>
          </div>
          <div className="ea-wb-row ea-focus-ring grid items-center border-b" style={{ gridTemplateColumns: "32px 1fr 64px", borderColor: "var(--border)", color: "var(--text-1)" }}>
            <span />
            <span className="truncate px-2 py-3 text-[13px]">Fixture — Madison table row</span>
            <span className="num truncate px-2 py-3 text-right text-[13px]">0</span>
          </div>
          <div className="ea-wb-row grid items-center border-b" style={{ gridTemplateColumns: "32px 1fr 64px", borderColor: "var(--border)", color: "var(--text-1)" }}>
            <span />
            <span className="truncate px-2 py-3 text-[13px]">Fixture — Gallatin table row</span>
            <span className="num truncate px-2 py-3 text-right text-[13px]">0</span>
          </div>
        </section>

        <section>
          <h2 className="font-heading text-2xl mb-4">Spine placeholders</h2>
          <p className="mb-4" style={{ fontFamily: "var(--font-body)", color: "var(--text-body)" }}>
            Later lanes fill these in. Do not invent them here.
          </p>
          <ol className="grid sm:grid-cols-2 gap-2">
            {SPINE.map((name, i) => (
              <li
                key={name}
                className="rounded-lg border px-3 py-3 text-sm"
                style={{ borderColor: "var(--border-rule)", borderStyle: "dashed", fontFamily: "var(--font-ui)", color: "var(--text-meta)" }}
              >
                {i + 1}. {name}
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}
