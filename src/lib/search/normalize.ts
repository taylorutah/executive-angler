const APOSTROPHE = /['\u2018\u2019]/g;
const PUNCT = /[^\p{L}\p{N}\s]+/gu;

export function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .replace(APOSTROPHE, "")
    .replace(PUNCT, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenize(input: string): string[] {
  const n = normalizeText(input);
  if (!n) return [];
  return n.split(" ").filter(Boolean);
}

/** Whole-word / prefix test on a normalized haystack. */
export function hasWord(haystack: string, needle: string): boolean {
  if (!needle) return false;
  if (haystack === needle) return true;
  return (
    haystack.startsWith(needle + " ") ||
    haystack.endsWith(" " + needle) ||
    haystack.includes(" " + needle + " ")
  );
}
