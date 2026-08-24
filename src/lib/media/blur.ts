/**
 * Shared LQIP for cards and heroes when a per-image blur hash is not stored.
 *
 * 8×8 PNG of daylight `--surface-raised` (vellum #F2EDE4). 95 bytes.
 *
 * Why not per-row hashes or a build-time fetch:
 * - Build-time: sampled HEAD is 176–368ms per URL. ~779 content images at
 *   concurrency 8 is ~25–35s on the critical build path, and this snapshot
 *   is missing most `/images/rivers/*` files so hashes would be wrong on preview.
 * - Stored on the row: needs a column + backfill. Worth it later if we
 *   want real subject-color LQIPs. Not required to kill the empty-card flash.
 *
 * The card frame is already `bg-[var(--surface-raised)]`, so the placeholder
 * matches the designed empty state on daylight. Dusk pages keep the frame
 * token; the PNG is only on-screen for a few hundred ms.
 */
export const SURFACE_RAISED_BLUR_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAACXBIWXMAAAPoAAAD6AG1e1JrAAAAEUlEQVR4nGP49PYJVsQwtCQAE1OwwVUvm0AAAAAASUVORK5CYII=";
