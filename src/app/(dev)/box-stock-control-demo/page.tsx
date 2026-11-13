/**
 * Dev-only fixture for QA screenshots of BoxEntriesTable stock controls.
 */
import BoxEntriesTable, { type BoxEntryRow } from "@/components/flies-v3/BoxEntriesTable";

const DEMO_ENTRIES: BoxEntryRow[] = [
  {
    id: "demo-entry",
    configuration: {
      id: "demo-config",
      nickname: null,
      size: "16",
      slot_overrides: { body: { color: "natural" } },
      tied_count: 0,
      bought_count: 2,
      target_count: 0,
      is_favorite: false,
      is_tie_next: false,
      fly: {
        id: "demo-fly",
        slug: "pheasant-tail-nymph",
        name: "Pheasant Tail Nymph",
        category: "nymph",
        hero_image_url: null,
      },
    },
  },
];

export default function BoxStockControlDemoPage() {
  return (
    <main className="max-w-5xl mx-auto p-4">
      <h1 className="sr-only">Box stock control demo</h1>
      <BoxEntriesTable boxId="00000000-0000-4000-8000-000000000001" boxName="Dry Fly Box" entries={DEMO_ENTRIES} />
    </main>
  );
}
