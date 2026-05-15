/**
 * Render a friendly auto-summary for a configuration when the user didn't
 * pick a nickname. Example: "#16 · 3mm copper · olive".
 */
import type { FlyConfiguration, SlotOverrides } from "@/types/flies";

export function summarizeVersion(c: Pick<FlyConfiguration, "nickname" | "size" | "slot_overrides">): string {
  if (c.nickname && c.nickname.trim()) return c.nickname.trim();
  const parts: string[] = [];
  if (c.size) parts.push(`#${c.size}`);
  const o = (c.slot_overrides ?? {}) as SlotOverrides;
  const beadParts: string[] = [];
  if (o.bead?.size_mm) beadParts.push(`${o.bead.size_mm}mm`);
  if (o.bead?.color) beadParts.push(String(o.bead.color));
  if (beadParts.length) parts.push(beadParts.join(" "));
  if (o.body?.color) parts.push(`${o.body.color} body`);
  return parts.length ? parts.join(" · ") : "Default version";
}
