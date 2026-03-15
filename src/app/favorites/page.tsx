"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, Trash2, MapPin, Fish, BookOpen, Home } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Favorite {
  id: string;
  entity_type: string;
  entity_id: string;
  created_at: string;
}

interface EntityInfo {
  name: string;
  href: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
}

function iconForType(type: string) {
  switch (type) {
    case "destination": return MapPin;
    case "river": return Fish;
    case "lodge": return Home;
    case "article": return BookOpen;
    case "guide": return MapPin;
    case "fly_shop": return Home;
    default: return MapPin;
  }
}

function hrefForType(type: string, slug: string): string {
  switch (type) {
    case "destination": return `/destinations/${slug}`;
    case "river": return `/rivers/${slug}`;
    case "lodge": return `/lodges/${slug}`;
    case "article": return `/articles/${slug}`;
    case "guide": return `/guides/${slug}`;
    case "fly_shop": return `/fly-shops/${slug}`;
    default: return "/";
  }
}

async function fetchEntityInfo(
  supabase: ReturnType<typeof createClient>,
  type: string,
  id: string
): Promise<EntityInfo | null> {
  try {
    let table: string;
    let nameField = "name";
    switch (type) {
      case "destination": table = "destinations"; break;
      case "river": table = "rivers"; break;
      case "lodge": table = "lodges"; break;
      case "article": table = "articles"; nameField = "title"; break;
      case "guide": table = "guides"; break;
      case "fly_shop": table = "fly_shops"; break;
      default: return null;
    }

    const { data, error } = await supabase
      .from(table)
      .select(`id, slug, ${nameField}`)
      .eq("id", id)
      .single();

    if (error || !data) return null;

    const row = data as unknown as Record<string, string>;
    return {
      name: row[nameField],
      href: hrefForType(type, row.slug),
      icon: iconForType(type),
    };
  } catch {
    return null;
  }
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [entityMap, setEntityMap] = useState<Record<string, EntityInfo | null>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  async function loadFavorites() {
    const supabase = createClient();
    const { data } = await supabase
      .from("user_favorites")
      .select("*")
      .order("created_at", { ascending: false });

    const favs = data || [];
    setFavorites(favs);

    // Fetch entity info for each favorite from Supabase
    const entries = await Promise.all(
      favs.map(async (fav) => {
        const key = `${fav.entity_type}:${fav.entity_id}`;
        const info = await fetchEntityInfo(supabase, fav.entity_type, fav.entity_id);
        return [key, info] as [string, EntityInfo | null];
      })
    );
    setEntityMap(Object.fromEntries(entries));
    setLoading(false);
  }

  async function removeFavorite(id: string) {
    const supabase = createClient();
    await supabase.from("user_favorites").delete().eq("id", id);
    setFavorites((prev) => prev.filter((f) => f.id !== id));
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D1117] pt-28 px-4">
        <div className="mx-auto max-w-3xl">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-[#161B22] rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D1117] pt-28 pb-20 px-4">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center gap-3 mb-8">
          <Heart className="h-8 w-8 text-red-500 fill-red-500" />
          <h1 className="font-heading text-3xl font-bold text-[#E8923A]">
            Your Favorites
          </h1>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-16 bg-[#161B22] rounded-xl shadow-sm">
            <Heart className="h-12 w-12 text-[#484F58] mx-auto mb-4" />
            <h2 className="font-heading text-xl font-semibold text-[#8B949E] mb-2">
              No favorites yet
            </h2>
            <p className="text-[#484F58] mb-6">
              Explore destinations, rivers, and lodges — save the ones you love.
            </p>
            <Link
              href="/destinations"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#E8923A] text-white font-medium rounded-lg hover:bg-[#E8923A]-light transition-colors"
            >
              Explore Destinations
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {favorites.map((fav) => {
              const key = `${fav.entity_type}:${fav.entity_id}`;
              const details = entityMap[key];
              if (!details) return null;
              const Icon = details.icon;

              return (
                <div
                  key={fav.id}
                  className="flex items-center justify-between p-4 bg-[#161B22] rounded-xl shadow-sm"
                >
                  <Link
                    href={details.href}
                    className="flex items-center gap-3 flex-1 hover:text-[#E8923A] transition-colors"
                  >
                    <Icon className="h-5 w-5 text-[#E8923A] shrink-0" />
                    <div>
                      <p className="font-medium text-[#E8923A]">
                        {details.name}
                      </p>
                      <p className="text-xs text-[#8B949E] capitalize">
                        {fav.entity_type.replace("_", " ")}
                      </p>
                    </div>
                  </Link>
                  <button
                    onClick={() => removeFavorite(fav.id)}
                    className="p-2 text-[#484F58] hover:text-red-500 transition-colors"
                    aria-label="Remove favorite"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
