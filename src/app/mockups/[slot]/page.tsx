// Mockup stage — renders a single App Store mockup at native iPhone 16/17 Pro
// Max resolution (1320×2868). The Playwright capture script hits this route
// for each slot, waits for fonts, and snaps a PNG the compositor can use.

import { notFound } from "next/navigation";
import HomeMockup from "@/components/marketing/AppStoreMockup/HomeMockup";
import SessionMockup from "@/components/marketing/AppStoreMockup/SessionMockup";
import FlyBoxMockup from "@/components/marketing/AppStoreMockup/FlyBoxMockup";
import RiverMockup from "@/components/marketing/AppStoreMockup/RiverMockup";
import InsightsMockup from "@/components/marketing/AppStoreMockup/InsightsMockup";
import LegacyMockup from "@/components/marketing/AppStoreMockup/LegacyMockup";

const SLOTS: Record<string, () => React.ReactElement> = {
  "01-home": () => <HomeMockup />,
  "02-session": () => <SessionMockup />,
  "03-flybox": () => <FlyBoxMockup />,
  "04-river": () => <RiverMockup />,
  "05-insights": () => <InsightsMockup />,
  "06-legacy": () => <LegacyMockup />,
};

export function generateStaticParams() {
  return Object.keys(SLOTS).map((slot) => ({ slot }));
}

export default async function MockupStage({
  params,
}: {
  params: Promise<{ slot: string }>;
}) {
  const { slot } = await params;
  const Mockup = SLOTS[slot];
  if (!Mockup) notFound();

  return (
    <div
      id="mockup-stage"
      style={{
        width: 1320,
        height: 2868,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {Mockup()}
    </div>
  );
}
