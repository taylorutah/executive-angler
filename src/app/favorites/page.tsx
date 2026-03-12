"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, Trash2, MapPin, Fish, BookOpen, Home } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { destinations } from "@/data/destinations";
import { rivers } from "@/data/rivers";
import { lodges } from "@/data/lodges";
import { articles } from "@/data/articles";
import { guides } from "@/data/guides";
import { flyShops } from "@/data/fly-shops";

interface Favorite {
  id: string;
  entity_type: string;
  entity_id: string;
  created_at: string;
}

function getEntityDetails(type: string, id: string) {
  switch (type) {
    case "destination": {
      const d = destinations.find((x) => x.id === id);
      return d ? { name: d.name, href: `/destinations/${d.slug}`, icon: MapPin } : null;
    }
    case "river": {
      const r = rivers.find((x) => x.id === id);
      return r ? { name: r.name, href: `/rivers/${r.slug}`, icon: Fish } : null;
    }
    case "lodge": {
      const l = lodges.find((x) => x.id === id);
      return l ? { name: l.name, href: `/lodges/${l.slug}`, icon: Home } : null;
    }
    case "article": {
      const a = articles.find((x) => x.id === id);
      return a ? { name: a.title, href: `/articles/${a.slug}`, icon: BookOpen } : null;
    }
    case "guide": {
      const g = guides.find((x) => x.id === id);
      return g ? { name: g.name, href: `/guides/${g.slug}`, icon: MapPin } : null;
    }
    case "fly_shop": {
      const f = flyShops.find((x) => x.id === id);
      return f ? { name: f.name, href: `/fly-shops/${f.slug}`, icon: Home } : null;
    }
    default:
      return null;
  }
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
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

    setFavorites(data || []);
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
              const details = getEntityDetails(fav.entity_type, fav.entity_id);
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
