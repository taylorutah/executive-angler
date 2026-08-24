/** A row without a readable licence does not publish. */
export function mayPublish(input: {
  licence?: string | null;
  storagePath?: string | null;
  status?: string | null;
}): boolean {
  const licence = input.licence?.trim() ?? "";
  const path = input.storagePath?.trim() ?? "";
  if (!licence) return false;
  if (!path) return false;
  if (input.status === "flagged" || input.status === "unpublished") return false;
  return true;
}

export function publishStatus(input: {
  licence?: string | null;
  storagePath?: string | null;
}): "published" | "flagged" | "pending" {
  const licence = input.licence?.trim() ?? "";
  if (!licence) return "flagged";
  if (!input.storagePath?.trim()) return "pending";
  return "published";
}
