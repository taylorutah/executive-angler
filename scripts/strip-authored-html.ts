/**
 * Strip Tailwind class attributes from stored / seeded HTML.
 *
 * Stored markup is never scanned by Tailwind, so colour utilities there
 * cannot compile. Colour lives on `.article-body` / `.destination-body` /
 * `.river-body` in globals.css. Callout boxes become <aside>.
 */

export function stripAuthoredClasses(html: string): string {
  let out = html.replace(
    /<div\s+class="(?:bg-forest\/5|bg-\[#1F1610\]|bg-\[#161B22\])[^"]*"\s*>([\s\S]*?)<\/div>/gi,
    (_m, inner: string) => `<aside>${inner}</aside>`,
  );
  out = out.replace(/\sclass="[^"]*"/g, "");
  out = out.replace(/\sclass='[^']*'/g, "");
  return out;
}

const FORBIDDEN = /(?:text|bg)-\[var\(/;

export function findForbiddenUtilities(html: string): string[] {
  const found: string[] = [];
  const re = /(?:text|bg)-\[var\([^)]*\)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) found.push(m[0]);
  return found;
}

export function hasForbiddenUtilities(html: string): boolean {
  return FORBIDDEN.test(html);
}
