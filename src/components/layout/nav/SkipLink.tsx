import { FOCUS_VISIBLE } from "./links";

export const MAIN_CONTENT_ID = "main-content";

/**
 * First tab stop on every page. Server-rendered so the a11y gate does not
 * race a client portal. Visible only on focus.
 */
export default function SkipLink() {
  return (
    <a
      href={`#${MAIN_CONTENT_ID}`}
      className={`ea-skip-link ea-focus-ring ${FOCUS_VISIBLE} sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:bg-[var(--surface-page)] focus:px-3 focus:py-2 focus:text-[14px] focus:font-medium focus:text-[var(--text-primary)] focus:shadow-lg`}
    >
      Skip to content
    </a>
  );
}
