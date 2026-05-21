/**
 * Email normalization + disposable-domain blocklist for signup hardening.
 *
 * Normalization rules:
 *   - lowercase
 *   - strip + tags ("john+tag@gmail.com" → "john@gmail.com")
 *   - for gmail.com / googlemail.com: strip dots in local-part
 *     ("j.o.hn@gmail.com" → "john@gmail.com")
 *
 * Why: bots abuse Gmail's dot-insensitivity to create dozens of
 * "different" accounts from one real inbox. Normalizing collapses
 * them to a single canonical form we can collision-check against.
 */

const GMAIL_DOMAINS = new Set(["gmail.com", "googlemail.com"]);

// Curated list of common throwaway/disposable email providers.
// Not exhaustive — bots rotate domains — but catches the obvious ones.
// Add to this list as we see abuse in signup_audit.
const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com", "guerrillamail.com", "guerrillamail.net",
  "guerrillamail.info", "guerrillamail.biz", "guerrillamail.org",
  "10minutemail.com", "10minutemail.net", "tempmail.com",
  "temp-mail.org", "throwawaymail.com", "trashmail.com",
  "yopmail.com", "fakeinbox.com", "maildrop.cc",
  "getairmail.com", "mintemail.com", "mohmal.com",
  "sharklasers.com", "spam4.me", "dispostable.com",
  "tempr.email", "tempinbox.com", "emailondeck.com",
  "mailcatch.com", "tempmailaddress.com", "discard.email",
  "moakt.com", "harakirimail.com", "anonbox.net",
]);

export interface NormalizedEmail {
  raw: string;
  normalized: string;
  domain: string;
  isDisposable: boolean;
  isValid: boolean;
}

export function normalizeEmail(raw: string): NormalizedEmail {
  const trimmed = raw.trim().toLowerCase();
  const atIdx = trimmed.lastIndexOf("@");
  if (atIdx < 1 || atIdx === trimmed.length - 1) {
    return { raw, normalized: trimmed, domain: "", isDisposable: false, isValid: false };
  }

  let local = trimmed.slice(0, atIdx);
  const domain = trimmed.slice(atIdx + 1);

  // Strip + tag
  const plusIdx = local.indexOf("+");
  if (plusIdx >= 0) local = local.slice(0, plusIdx);

  // Gmail-specific: dots in local-part are ignored by Google
  if (GMAIL_DOMAINS.has(domain)) {
    local = local.replace(/\./g, "");
  }

  const normalized = `${local}@${domain}`;
  const isDisposable = DISPOSABLE_DOMAINS.has(domain);
  // Cheap shape validation — Supabase will reject malformed addresses too,
  // but failing fast here saves an audit row.
  const isValid = local.length > 0 && /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(trimmed);

  return { raw, normalized, domain, isDisposable, isValid };
}
