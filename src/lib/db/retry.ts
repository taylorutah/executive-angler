/**
 * Simple retry wrapper for Supabase queries during static generation.
 * Transient ECONNRESET / Cloudflare 500 errors are common when
 * Next.js prerenders 1200+ pages concurrently.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  label: string,
  maxRetries = 2,
  delayMs = 1500
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const msg = err instanceof Error ? err.message : String(err);
      const isTransient =
        msg.includes("ECONNRESET") ||
        msg.includes("ECONNREFUSED") ||
        msg.includes("ETIMEDOUT") ||
        msg.includes("fetch failed") ||
        msg.includes("500") ||
        msg.includes("502") ||
        msg.includes("503") ||
        msg.includes("504");

      if (isTransient && attempt < maxRetries) {
        const wait = delayMs * (attempt + 1);
        console.warn(
          `[${label}] Transient error (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${wait}ms: ${msg}`
        );
        await new Promise((r) => setTimeout(r, wait));
      } else {
        break;
      }
    }
  }
  throw lastError;
}
