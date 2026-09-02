import Link from "next/link";
import { FLOW_STATE_LABEL, type FlowState } from "@/lib/browse/flow-state";
import type { RiverBrowseItem } from "@/lib/browse/river-items";
import { waterTypeLabel } from "@/lib/browse/river-items";

export interface StationFlow {
  cfs: number;
  state: FlowState;
  deltaCfs: number | null;
}

interface Props {
  items: RiverBrowseItem[];
  flows: Record<string, StationFlow>;
}

/** Ungauged CFS / trend — never a guessed number and never a string of periods. */
export const UNGAUGED = "—";

export function isGauged(flow: StationFlow | undefined): boolean {
  return Boolean(flow && Number.isFinite(flow.cfs));
}

export function trendWord(flow: StationFlow | undefined): string {
  if (!isGauged(flow) || !flow) return UNGAUGED;
  if (flow.deltaCfs == null) return FLOW_STATE_LABEL[flow.state] ?? UNGAUGED;
  if (flow.deltaCfs > 15) return "rising";
  if (flow.deltaCfs < -15) return "dropping";
  return "steady";
}

export function cfsCell(flow: StationFlow | undefined): string {
  if (!isGauged(flow) || !flow) return UNGAUGED;
  return `${Math.round(flow.cfs).toLocaleString("en-US")} CFS`;
}

function waterLabel(item: RiverBrowseItem): string {
  return (waterTypeLabel(String(item._filterValues?.waterType ?? "")) ?? UNGAUGED).toLowerCase();
}

function TrendMark({ flow }: { flow: StationFlow | undefined }) {
  if (!isGauged(flow) || !flow) {
    return <span className="text-[var(--text-3)]">{UNGAUGED}</span>;
  }
  const rising = flow.deltaCfs != null && flow.deltaCfs > 15;
  const dropping = flow.deltaCfs != null && flow.deltaCfs < -15;
  return (
    <span className="text-[var(--copper)]" aria-label={trendWord(flow)}>
      {rising ? "↑" : dropping ? "↓" : UNGAUGED}
    </span>
  );
}

/** Default /rivers view: a station table, not photo cards. */
export default function RiversStationTable({ items, flows }: Props) {
  if (items.length === 0) {
    return (
      <p className="border-t border-[var(--border)] py-8 font-ui text-[13px] text-[var(--text-3)]">
        No rivers match.
      </p>
    );
  }

  return (
    <>
      <ul className="border-t border-[var(--border)] md:hidden">
        {items.map((item) => {
          const flow = flows[item.riverId];
          const gauged = isGauged(flow);
          return (
            <li key={item.riverId} className="border-b border-[var(--border)] py-3">
              <Link
                href={item.href}
                className="font-body text-[17px] italic text-[var(--ink)] hover:text-[var(--copper)]"
              >
                {item.title}
              </Link>
              <p className="mt-0.5 font-ui text-[12px] uppercase tracking-[0.08em] text-[var(--text-3)]">
                {item.kicker ?? UNGAUGED}
              </p>
              <p className="mt-1.5 font-ui text-[13px] text-[var(--text-2)]">
                {gauged ? (
                  <>
                    <span className="num text-[var(--ink)]">{cfsCell(flow)}</span>
                    <span className="text-[var(--text-3)]"> · </span>
                    <TrendMark flow={flow} />
                  </>
                ) : (
                  <span className="text-[var(--text-3)]">{UNGAUGED}</span>
                )}
                <span className="text-[var(--text-3)]"> · </span>
                <span>{item.whatsOn || UNGAUGED}</span>
                <span className="text-[var(--text-3)]"> · </span>
                <span className="text-[var(--text-3)]">{waterLabel(item)}</span>
              </p>
            </li>
          );
        })}
      </ul>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[44rem] text-left">
          <thead>
            <tr className="border-b border-[var(--ink)] font-ui text-[11px] uppercase tracking-[0.14em] text-[var(--ink)]">
              <th className="py-3 pr-4 font-medium">River</th>
              <th className="py-3 pr-4 font-medium">Place</th>
              <th className="py-3 pr-4 font-medium">CFS live</th>
              <th className="py-3 pr-4 font-medium">Trend</th>
              <th className="py-3 pr-4 font-medium">What&apos;s on</th>
              <th className="py-3 font-medium">Water</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const flow = flows[item.riverId];
              const live = isGauged(flow);
              return (
                <tr key={item.riverId} className="border-b border-[var(--border)]">
                  <td className="py-2.5 pr-4">
                    <Link
                      href={item.href}
                      className="font-body text-[17px] italic text-[var(--ink)] hover:text-[var(--copper)]"
                    >
                      {item.title}
                    </Link>
                  </td>
                  <td className="py-2.5 pr-4 font-body text-[14px] text-[var(--ink)]">
                    {item.kicker ?? UNGAUGED}
                  </td>
                  <td className="py-2.5 pr-4 text-[14px]">
                    {live ? (
                      <span className="num text-[var(--ink)]">
                        {Math.round(flow.cfs).toLocaleString("en-US")}
                      </span>
                    ) : (
                      <span className="text-[var(--text-3)]">{UNGAUGED}</span>
                    )}
                  </td>
                  <td className="py-2.5 pr-4 font-ui text-[14px]">
                    <TrendMark flow={flow} />
                  </td>
                  <td className="py-2.5 pr-4 font-body text-[14px] text-[var(--text-2)]">
                    {item.whatsOn || UNGAUGED}
                  </td>
                  <td className="py-2.5 font-body text-[14px] lowercase text-[var(--text-2)]">
                    {waterLabel(item)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
