import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { GearType } from "@/types/gear";

const GEAR_TYPES: GearType[] = ['rod', 'reel', 'line', 'leader', 'tippet', 'net', 'waders', 'other'];

async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );
}

// GET /api/gear/defaults — returns { rod: GearItem|null, reel: GearItem|null, ... }
export async function GET(_req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("gear_items")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_default", true)
    .eq("is_active", true);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Build result with null for types that have no default
  const defaults: Record<string, unknown> = {};
  for (const type of GEAR_TYPES) {
    defaults[type] = data?.find((item) => item.type === type) ?? null;
  }

  return NextResponse.json(defaults);
}
