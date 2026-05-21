/**
 * Tiny wrapper around the CSS View Transitions API.
 *
 *   useViewTransition(() => router.push(href))
 *
 * On browsers that support it (Chrome 111+, Safari 18+, Firefox 129+),
 * navigating wraps in document.startViewTransition() so the DOM diff
 * morphs smoothly between states. The new page's DOM gets to claim the
 * same `viewTransitionName` values, producing a card→detail morph for
 * free.
 *
 * On unsupported browsers the callback runs synchronously — no transition,
 * no regression.
 */
export function viewTransition(cb: () => void) {
  const d = document as Document & {
    startViewTransition?: (cb: () => void) => unknown;
  };
  if (typeof d.startViewTransition === "function") {
    d.startViewTransition(cb);
  } else {
    cb();
  }
}
