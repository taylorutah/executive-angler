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
      .catch(() => null)
      .then((payload) => {
        if (!payload?.snapshots || Object.keys(payload.snapshots).length === 0) {
          inflight = null;
        }
        return payload;
      });
  }
  return inflight;
}

function useFlagshipGauges(initial?: Payload | null): {
  snapshots: Map<string, GaugeSnapshot>;
  histories: Map<string, DailyReading[]>;
} {
  const [data, setData] = useState<Payload | null>(initial ?? null);
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

export function LiveConditionsRail({
  rivers,
  initial,
}: {
  rivers: FlagshipRiver[];
  initial?: Payload | null;
}) {
  const { snapshots } = useFlagshipGauges(initial);
  return <ConditionsRail rivers={rivers} snapshots={snapshots} />;
}

export function LiveHomeHero({
  headline,
  madisonId,
  initial,
}: {
  headline: string;
  madisonId?: string;
  initial?: Payload | null;
}) {
  const { snapshots } = useFlagshipGauges(initial);
  const cfs = madisonId ? snapshots.get(madisonId)?.cfs ?? null : null;
  return <HomeHero cfs={cfs} headline={headline} />;
}

export function LiveOnTheWaterNow({
  rivers,
  month,
  initial,
}: {
  rivers: FlagshipRiver[];
  month: string;
  initial?: Payload | null;
}) {
  const { snapshots, histories } = useFlagshipGauges(initial);
  return (
    <OnTheWaterNow
      rivers={rivers}
      snapshots={snapshots}
      histories={histories}
      month={month}
    />
  );
}
