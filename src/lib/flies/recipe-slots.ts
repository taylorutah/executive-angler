import type { LinkedMaterialSlot } from "@/lib/flies/link-materials";

const LABEL_ORDER = [
  "Hook",
  "Bead",
  "Thread",
  "Tail",
  "Body",
  "Rib",
  "Wingcase",
  "Wing",
  "Thorax",
  "Hackle",
  "Collar",
  "Head",
] as const;

const SLOT_LABEL: Record<string, string> = {
  hook: "Hook",
  bead: "Bead",
  thread: "Thread",
  tail: "Tail",
  body: "Body",
  abdomen: "Body",
  rib: "Rib",
  wingcase: "Wingcase",
  thorax: "Thorax",
  hackle: "Hackle",
  collar: "Collar",
  head: "Head",
};

function slotKey(slot: string): string {
  return String(slot ?? "")
    .toLowerCase()
    .replace(/[^a-z]+/g, "");
}

function titleCaseSlot(slot: string): string {
  return (
    String(slot ?? "")
      .split(/[_\s]+/)
      .filter(Boolean)
      .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
      .join(" ") || "Material"
  );
}

/** One BOM label per slot. Wing becomes Wingcase only when the material says so. */
export function recipeSlotLabel(
  slot: string,
  material?: string | null,
  description?: string | null,
): string {
  const key = slotKey(slot);
  if (key === "wing") {
    const blob = `${material ?? ""} ${description ?? ""}`.toLowerCase();
    if (blob.includes("wingcase") || blob.includes("flashback")) return "Wingcase";
    return "Wing";
  }
  return SLOT_LABEL[key] ?? titleCaseSlot(slot);
}

export type RecipeRow = LinkedMaterialSlot & { label: string };

/**
 * Bill of materials: canonical order, one label each.
 * Two stored "body" slots (abdomen + thorax) become Body then Thorax.
 */
export function uniqueRecipeRows(slots: LinkedMaterialSlot[]): RecipeRow[] {
  const used = new Set<string>();
  const rows: RecipeRow[] = slots.map((s) => {
    let label = recipeSlotLabel(s.slot, s.material, s.description);
    if (used.has(label)) {
      if (label === "Body" && !used.has("Thorax")) label = "Thorax";
      else if (label === "Wingcase" && !used.has("Wing")) label = "Wing";
    }
    if (used.has(label)) {
      const base = recipeSlotLabel(s.slot, s.material, s.description);
      let n = 2;
      let next = `${base} ${n}`;
      while (used.has(next)) {
        n += 1;
        next = `${base} ${n}`;
      }
      label = next;
    }
    used.add(label);
    return { ...s, label };
  });

  return rows.sort((a, b) => {
    const ia = LABEL_ORDER.indexOf(a.label as (typeof LABEL_ORDER)[number]);
    const ib = LABEL_ORDER.indexOf(b.label as (typeof LABEL_ORDER)[number]);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });
}
