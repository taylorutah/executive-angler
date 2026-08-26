import InstrumentWell, { InstrumentWellFrame } from "@/components/desk/InstrumentWell";
import { firstUsgsSiteId } from "@/lib/search/usgs";
import { missingGaugeCopy } from "@/lib/rivers/missing-gauge";
import RiverConditionsCard from "./RiverConditionsCard";

interface Props {
  riverId: string;
  riverName: string;
  usgsGaugeId?: string | null;
  riverLatitude?: number | null;
  riverLongitude?: number | null;
  children?: React.ReactNode;
}

/**
 * One InstrumentWell per river dossier. Live readings sit inside it.
 * An instrument with no gauge is an empty well that says so — never a
 * dark panel pretending to be live.
 */
export default function RiverLiveInset({
  riverId,
  riverName,
  usgsGaugeId,
  riverLatitude,
  riverLongitude,
  children,
}: Props) {
  const siteId = firstUsgsSiteId(usgsGaugeId);

  return (
    <InstrumentWellFrame>
      <InstrumentWell label={`Live conditions — ${riverName}`} className="p-6 sm:p-8">
        {siteId ? (
          <>
            <RiverConditionsCard
              riverId={riverId}
              usgsSiteId={siteId}
              riverName={riverName}
              riverLatitude={riverLatitude}
              riverLongitude={riverLongitude}
              layout="band"
            />
            {children}
          </>
        ) : (
          <EmptyGauge riverName={riverName} usgsGaugeId={usgsGaugeId} />
        )}
      </InstrumentWell>
    </InstrumentWellFrame>
  );
}

function EmptyGauge({
  riverName,
  usgsGaugeId,
}: {
  riverName: string;
  usgsGaugeId?: string | null;
}) {
  return (
    <div>
      <h2 className="font-heading text-2xl font-bold text-[var(--text-primary)]">
        On the water
      </h2>
      <p className="mt-3 max-w-[68ch] text-sm leading-relaxed text-[var(--text-body)]">
        {missingGaugeCopy(riverName, usgsGaugeId)}
      </p>
    </div>
  );
}
