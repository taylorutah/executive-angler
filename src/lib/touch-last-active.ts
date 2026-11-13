import { createClient } from "@/lib/supabase/client";

const STORAGE_KEY = "ea-touch-last-active";
const THROTTLE_MS = 5 * 60 * 1000;

/**
 * Throttled client heartbeat for profiles.last_active_at (touch_last_active RPC).
 */
export async function touchLastActiveThrottled(): Promise<void> {
  try {
    const last = Number(sessionStorage.getItem(STORAGE_KEY) || "0");
    if (last && Date.now() - last < THROTTLE_MS) return;

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.rpc("touch_last_active");
    if (error) {
      console.warn("[touch_last_active]", error.message);
      return;
    }
    sessionStorage.setItem(STORAGE_KEY, String(Date.now()));
  } catch (err) {
    console.warn("[touch_last_active]", err);
  }
}
