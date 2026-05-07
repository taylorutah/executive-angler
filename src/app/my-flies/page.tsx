import { permanentRedirect } from "next/navigation";

type SearchParams = { tab?: string };

export default async function LegacyMyFliesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { tab } = await searchParams;
  // Map old tab keys to the new hub tabs:
  //   box        → patterns (default)
  //   workbench  → workbench
  //   tie-next   → tie-next
  //   shared     → shared
  const next = tab === "workbench" ? "workbench" : tab === "tie-next" ? "tie-next" : tab === "shared" ? "shared" : "patterns";
  permanentRedirect(`/flies?tab=${next}`);
}
