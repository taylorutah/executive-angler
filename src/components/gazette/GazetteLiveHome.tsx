"use client";

import { useEffect, useState } from "react";
import GazetteHome, { type GazetteHomeCounts } from "./GazetteHome";
import type { DailyReading, FlagshipRiver, GaugeSnapshot } from "@/components/home/conditions";
import type { Article, CanonicalFly } from "@/types/entities";

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

interface Props {
  madisonId?: string;
  initial?: Payload | null;
  counts: GazetteHomeCounts;
  rivers: FlagshipRiver[];
  month: string;
  plate: CanonicalFly[];
  flyCount: number;
  fieldNote: Article | null;
}

export default function GazetteLiveHome({
  madisonId: _madisonId,
  initial,
  counts,
  rivers,
  month,
  plate,
  flyCount,
  fieldNote,
}: Props) {
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

  const snapshots = new Map(Object.entries(data?.snapshots ?? {}));

  return (
    <GazetteHome
      counts={counts}
      rivers={rivers}
      snapshots={snapshots}
      month={month}
      plate={plate}
      flyCount={flyCount}
      fieldNote={fieldNote}
    />
  );
}
