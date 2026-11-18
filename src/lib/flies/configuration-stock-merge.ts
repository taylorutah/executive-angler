/**
 * How POST /api/fishing/fly-configurations merges tied/bought when a matching
 * user_fly_configurations row already exists (same fly + size + body color).
 *
 * Increment when the version is still in at least one box (adding more stock).
 * Replace when it is not in any box (e.g. removed from box then re-added via Quick Add).
 */
export function mergeConfigurationStockCounts(args: {
  existingTied: number;
  existingBought: number;
  addTied: number;
  addBought: number;
  /** Membership rows in fly_box_entries_v3 for this configuration. */
  inBoxCount: number;
}): { tied_count: number; bought_count: number } {
  const addTied = Math.max(0, args.addTied);
  const addBought = Math.max(0, args.addBought);
  if (addTied === 0 && addBought === 0) {
    return { tied_count: args.existingTied, bought_count: args.existingBought };
  }
  if (args.inBoxCount <= 0) {
    return { tied_count: addTied, bought_count: addBought };
  }
  return {
    tied_count: args.existingTied + addTied,
    bought_count: args.existingBought + addBought,
  };
}

/** Stock counts after removing the last box membership for a configuration. */
export function stockCountsAfterLastBoxRemoval(): { tied_count: number; bought_count: number } {
  return { tied_count: 0, bought_count: 0 };
}
