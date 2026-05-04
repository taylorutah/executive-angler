/**
 * Convert any YouTube URL to its embed form. Handles youtu.be short links,
 * standard watch URLs, /shorts/, /live/, and already-embed URLs. Preserves
 * the start time when present (?t=Xs or ?start=X). Returns null when the
 * input isn't a recognizable YouTube URL.
 */
export function toYouTubeEmbedUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, "");
  let id: string | null = null;

  if (host === "youtu.be") {
    id = url.pathname.slice(1).split("/")[0] || null;
  } else if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
    if (url.pathname === "/watch") {
      id = url.searchParams.get("v");
    } else {
      const m = url.pathname.match(/^\/(?:embed|shorts|live|v)\/([^/?#]+)/);
      if (m) id = m[1];
    }
  }

  if (!id || !/^[A-Za-z0-9_-]{6,}$/.test(id)) return null;

  const params = new URLSearchParams();
  const start = url.searchParams.get("t") || url.searchParams.get("start");
  if (start) {
    const seconds = start.match(/^(\d+)s?$/) ? start.replace(/s$/, "") : start;
    if (/^\d+$/.test(seconds)) params.set("start", seconds);
  }
  const qs = params.toString();
  return `https://www.youtube.com/embed/${id}${qs ? `?${qs}` : ""}`;
}
