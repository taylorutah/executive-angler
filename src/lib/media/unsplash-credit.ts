export type UnsplashCredit = { name: string; url: string };

/** Filename segment from an images.unsplash.com / plus.unsplash.com URL. */
export function unsplashPhotoPath(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== "images.unsplash.com" && parsed.hostname !== "plus.unsplash.com") {
      return null;
    }
    const m = parsed.pathname.match(/\/(photo-[A-Za-z0-9_-]+)/);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

export function unsplashOembedUrl(imageUrl: string): string | null {
  const path = unsplashPhotoPath(imageUrl);
  if (!path) return null;
  return `https://unsplash.com/oembed?url=${encodeURIComponent(`https://unsplash.com/photos/${path}`)}`;
}

export function parseUnsplashOembed(json: unknown, fallbackUrl: string): UnsplashCredit {
  const obj = json && typeof json === "object" ? (json as Record<string, unknown>) : {};
  const name =
    typeof obj.author_name === "string" && obj.author_name.trim()
      ? obj.author_name.trim()
      : "Unsplash";
  const url =
    typeof obj.author_url === "string" && obj.author_url.trim()
      ? obj.author_url.trim()
      : fallbackUrl;
  return { name, url };
}

export async function fetchUnsplashCredit(imageUrl: string): Promise<UnsplashCredit> {
  const oembed = unsplashOembedUrl(imageUrl);
  if (!oembed) return { name: "Unsplash", url: imageUrl };
  try {
    const res = await fetch(oembed, {
      headers: { "User-Agent": "ExecutiveAngler/1.0 (image credit)" },
    });
    if (!res.ok) return { name: "Unsplash", url: imageUrl };
    return parseUnsplashOembed(await res.json(), imageUrl);
  } catch {
    return { name: "Unsplash", url: imageUrl };
  }
}
