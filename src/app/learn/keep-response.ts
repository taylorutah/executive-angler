/**
 * Keep-this-list treats "already there" as success. `fetch` only rejects on
 * network failure; unique-constraint 4xx from /api/favorites and
 * /api/dashboard/favorite-sections must not flip the button to error.
 */
export function keepResponseOk(status: number, error?: string): boolean {
  if (status >= 200 && status < 300) return true;
  if (!error) return false;
  return /duplicate key|unique constraint|already exists/i.test(error);
}
