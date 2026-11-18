export function boxRemoveOneConfirm(boxName: string): string {
  return `Remove this version from ${boxName}? The version stays in your stock. If this is its last box, tied and bought counts reset to zero.`;
}

export function boxRemoveBulkConfirm(count: number, boxName: string): string {
  const noun = count === 1 ? "version" : "versions";
  return `Remove ${count} ${noun} from ${boxName}? They stay in your stock. If a version is removed from its last box, tied and bought counts reset to zero.`;
}
