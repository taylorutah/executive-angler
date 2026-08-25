export type CommonsMeta = {
  licence: string;
  licenceUrl: string;
  artist: string;
};

/** File title from an upload.wikimedia.org URL (last path segment). */
export function commonsFileTitle(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.endsWith("wikimedia.org")) return null;
    const parts = parsed.pathname.split("/").filter(Boolean);
    const last = parts[parts.length - 1];
    if (!last) return null;
    return decodeURIComponent(last);
  } catch {
    return null;
  }
}

export function stripMarkup(html: string): string {
  return cleanArtist(
    html
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

/** Commons repeats "Unknown author" with no separator. */
export function cleanArtist(name: string): string {
  return name.replace(/Unknown authorUnknown author/g, "Unknown author").trim();
}

export function parseCommonsExtmetadata(
  meta: Record<string, { value?: string } | undefined> | undefined,
): CommonsMeta {
  const licence = meta?.LicenseShortName?.value ?? meta?.UsageTerms?.value ?? "";
  const licenceUrl = meta?.LicenseUrl?.value ?? "";
  const artist = stripMarkup(meta?.Artist?.value ?? "");
  return { licence, licenceUrl, artist };
}

export function commonsFilePageUrl(imageUrl: string): string | undefined {
  const title = commonsFileTitle(imageUrl);
  if (!title) return undefined;
  return `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(title)}`;
}

export function commonsApiUrl(fileTitle: string): string {
  return (
    "https://commons.wikimedia.org/w/api.php?action=query&titles=" +
    encodeURIComponent("File:" + fileTitle) +
    "&prop=imageinfo&iiprop=extmetadata|url&format=json"
  );
}

export async function fetchCommonsMeta(imageUrl: string): Promise<CommonsMeta | null> {
  const title = commonsFileTitle(imageUrl);
  if (!title) return null;
  try {
    const res = await fetch(commonsApiUrl(title), {
      headers: { "User-Agent": "ExecutiveAngler/1.0 (https://www.executiveangler.com)" },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      query?: {
        pages?: Record<
          string,
          { imageinfo?: Array<{ extmetadata?: Record<string, { value?: string }> }> }
        >;
      };
    };
    const page = json.query?.pages ? Object.values(json.query.pages)[0] : undefined;
    return parseCommonsExtmetadata(page?.imageinfo?.[0]?.extmetadata);
  } catch {
    return null;
  }
}
