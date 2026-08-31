"use client";

import { useEffect, useState } from "react";
import ConditionsRail from "./ConditionsRail";
import HomeHero from "./HomeHero";
import OnTheWaterNow from "./OnTheWaterNow";
import type { DailyReading, FlagshipRiver, GaugeSnapshot } from "./conditions";

type Payload = {
  snapshots: Record<string, GaugeSnapshot>;
  histories: Record<string, DailyReading[]>;
};

let inflight: Promise<Payload | null> | null = null;

function loadFlagshipGauges(): Promise<Payload | null> {
  if (!inflight) {
    inflight = fetch("/api/home/flagship-gauges")
      .then((res) => (res.ok ? (res.json() as Promise<Payload>) : null))
      .catch(() => null);
  }
  return inflight;
}

function useFlagshipGauges(): {
  snapshots: Map<string, GaugeSnapshot>;
  histories: Map<string, DailyReading[]>;
} {
  const [data, setData] = useState<Payload | null>(null);
  useEffect(() => {
    let cancelled = false;
    loadFlagshipGauges().then((payload) => {
      if (!cancelled && payload) setData(payload);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return {
    snapshots: new Map(Object.entries(data?.snapshots ?? {})),
    histories: new Map(Object.entries(data?.histories ?? {})),
  };
}

export function LiveConditionsRail({ rivers }: { rivers: FlagshipRiver[] }) {
  const { snapshots } = useFlagshipGauges();
  return <ConditionsRail rivers={rivers} snapshots={snapshots} />;
}

export function LiveHomeHero({
  headline,
  madisonId,
}: {
  headline: string;
  madisonId?: string;
}) {
  const { snapshots } = useFlagshipGauges();
  const cfs = madisonId ? snapshots.get(madisonId)?.cfs ?? null : null;
  return <HomeHero cfs={cfs} headline={headline} />;
}

export function LiveOnTheWaterNow({
  rivers,
  month,
}: {
  rivers: FlagshipRiver[];
  month: string;
}) {
  const { snapshots, histories } = useFlagshipGauges();
  return (
    <OnTheWaterNow
      rivers={rivers}
      snapshots={snapshots}
      histories={histories}
      month={month}
    />
  );
}
