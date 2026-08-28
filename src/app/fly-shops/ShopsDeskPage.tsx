import FindDesk from "@/components/desk/FindDesk";
import { getAllDestinations, getAllFlyShops } from "@/lib/db";

/** FIND / Shops — Lodges 84:3 language. */
export default async function ShopsDeskPage() {
  const [shops, destinations] = await Promise.all([getAllFlyShops(), getAllDestinations()]);
  const destById = new Map(destinations.map((d) => [d.id, d]));

  return (
    <FindDesk
      title="Shops"
      lede="Local counters near the water we keep. Hours and flies. Not a cart."
      featuredInkLine="We do not sell the fly."
      seeAllHref="/fly-shops/all"
      seeAllNoun="shop"
      items={shops.map((shop) => {
        const dest = destById.get(shop.destinationId);
        return {
          id: shop.id,
          href: `/fly-shops/${shop.slug}`,
          name: shop.name,
          imageUrl: shop.heroImageUrl,
          imageAlt: shop.heroImageAlt || shop.name,
          meta: dest?.name,
          description: shop.description,
          websiteUrl: shop.websiteUrl,
          featured: false,
        };
      })}
    />
  );
}
