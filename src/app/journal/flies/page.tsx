import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Plus, Pencil } from "lucide-react";

export default async function FliesPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {}
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/journal/flies");

  const { data: flies } = await supabase
    .from("fly_patterns")
    .select("*")
    .eq("user_id", user.id)
    .order("name");

  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto max-w-6xl px-4 pt-24 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/journal" className="inline-flex items-center gap-1 text-forest text-sm mb-2 hover:text-forest-dark">
              <ArrowLeft className="h-4 w-4" /> Back to Journal
            </Link>
            <h1 className="font-heading text-forest-dark text-3xl font-bold">My Fly Patterns</h1>
            <p className="text-slate-500 text-sm mt-1">{flies?.length ?? 0} patterns</p>
          </div>
          <Link href="/journal/flies/new"
            className="inline-flex items-center gap-2 rounded-lg bg-forest px-4 py-2.5 text-white text-sm font-medium hover:bg-forest-dark transition-colors">
            <Plus className="h-4 w-4" /> Add Pattern
          </Link>
        </div>

        {!flies?.length ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">🪰</p>
            <p className="text-slate-500 mb-4">No fly patterns yet.</p>
            <Link href="/journal/flies/new" className="inline-flex items-center gap-2 rounded-lg bg-forest px-4 py-2 text-white text-sm font-medium hover:bg-forest-dark">
              <Plus className="h-4 w-4" /> Add Your First Pattern
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {flies.map((fly) => (
              <div key={fly.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100 group">
                {/* Image */}
                <div className="relative aspect-square bg-slate-100">
                  {fly.image_url ? (
                    <Image src={fly.image_url} alt={fly.name || "Fly pattern"} fill className="object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-4xl">🪰</div>
                  )}
                  <Link href={`/journal/flies/${fly.id}/edit`}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full p-1.5 shadow">
                    <Pencil className="h-3.5 w-3.5 text-slate-600" />
                  </Link>
                </div>
                {/* Info */}
                <div className="p-3">
                  <p className="font-semibold text-forest-dark text-sm leading-tight">{fly.name || "Unnamed"}</p>
                  {fly.type && <p className="text-xs text-slate-500 mt-0.5">{fly.type}</p>}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {fly.size?.slice(0, 3).map((s: string) => (
                      <span key={s} className="text-xs bg-slate-100 text-slate-600 rounded px-1.5 py-0.5">#{s}</span>
                    ))}
                    {fly.bead_size && (
                      <span className="text-xs bg-amber-50 text-amber-700 rounded px-1.5 py-0.5">{fly.bead_size}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
