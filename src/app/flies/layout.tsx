/**
 * /flies layout — applies to every nested route under /flies.
 *
 * We intentionally do NOT wrap children in <FliesShell /> at the layout
 * level because:
 *   - Some routes (e.g. /flies/library, /flies/[slug], /flies/by-id, etc.)
 *     are public reference pages that don't belong inside the authenticated
 *     hub chrome.
 *   - Each authenticated section (workspace, boxes, workbench, tie-next,
 *     shared) renders <FliesShell active=... counts={...}> itself so it
 *     can pass route-specific counts.
 *
 * This layout exists so we have a place to add cross-route concerns later
 * (a flies-scoped error boundary, a route-change progress bar, etc.)
 * without re-touching every page.
 */
export default function FliesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
