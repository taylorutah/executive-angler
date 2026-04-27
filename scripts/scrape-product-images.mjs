// One-off product image scraper. Reads brand collection pages from each
// brand's site, extracts product names + image URLs, and writes a JSON
// map keyed by normalized product name → { imageUrl, productUrl }.
//
// Output: scripts/scraped-product-images.json
//
// We then run a second pass to match scraped names against gear-products.ts
// slugs and update the data file.

import { writeFileSync } from "node:fs";

const USER_AGENT =
  "Mozilla/5.0 (compatible; ExecutiveAnglerBot/1.0; +https://www.executiveangler.com)";

/**
 * Brand collection sources. Each entry hits a Shopify-style /collections/{handle}
 * page and parses Shopify's standard product card markup. For non-Shopify
 * brands, we fall back to extracting og:image-style hints from a homepage.
 */
const SOURCES = [
  // Far Bank umbrella (Sage / Redington / Rio)
  { brand: "redington", url: "https://farbank.com/collections/redington-classic-trout-freshwater" },
  { brand: "redington", url: "https://farbank.com/collections/redington-behemoth-reel-freshwater" },
  { brand: "redington", url: "https://farbank.com/collections/redington-claymore-spey" },
  { brand: "redington", url: "https://farbank.com/collections/redington-bass-gear" },
  { brand: "redington", url: "https://farbank.com/collections/redington-bonefish-gear" },
  { brand: "redington", url: "https://farbank.com/collections/redington-butter-stick-freshwater" },
  { brand: "redington", url: "https://farbank.com/collections/redington-bluewater-gear" },
  { brand: "redington", url: "https://farbank.com/collections/redington-classic-trout-reel-collection" },
  { brand: "redington", url: "https://farbank.com/collections/redington-fly-fishing-spools" },
  { brand: "redington", url: "https://farbank.com/collections/redington-crosswater-reel-freshwater" },
  { brand: "redington", url: "https://farbank.com/collections/redington-dually-spey" },
  { brand: "rio", url: "https://farbank.com/collections/rio-freshwater-slickcast" },
  { brand: "rio", url: "https://farbank.com/collections/rio-freshwater-fly-lines" },
  { brand: "rio", url: "https://farbank.com/collections/rio-saltwater-fly-lines" },
  { brand: "rio", url: "https://farbank.com/collections/rio-leaders-tippet" },
  { brand: "rio", url: "https://farbank.com/collections/rio-spey-fly-lines" },
  { brand: "sage", url: "https://farbank.com/collections/sage-trout-rods" },
  { brand: "sage", url: "https://farbank.com/collections/sage-saltwater-rods" },
  { brand: "sage", url: "https://farbank.com/collections/sage-spey-rods" },
  { brand: "sage", url: "https://farbank.com/collections/sage-fly-reels" },
  { brand: "sage", url: "https://farbank.com/collections/sage-fly-rods-fly-fishing" },
  { brand: "sage", url: "https://farbank.com/pages/sage" },

  // Tibor — single page works
  { brand: "tibor", url: "https://tiborreel.com/collections/all" },

  // Korkers
  { brand: "korkers", url: "https://www.korkers.com/collections/fishing-footwear" },
  { brand: "korkers", url: "https://www.korkers.com/collections/omnitrax-wading-boots" },
  { brand: "korkers", url: "https://www.korkers.com/collections/wade-lite" },

  // Skwala — keep
  { brand: "skwala", url: "https://www.skwalafishing.com/collections/waders" },

  // Thomas & Thomas
  { brand: "thomas-thomas", url: "https://thomasandthomas.com/collections/saltwater" },
  { brand: "thomas-thomas", url: "https://thomasandthomas.com/collections/freshwater" },
  { brand: "thomas-thomas", url: "https://thomasandthomas.com/collections/limited-edition-rods" },
  { brand: "thomas-thomas", url: "https://thomasandthomas.com/collections/reels" },

  // Hardy
  { brand: "hardy", url: "https://www.hardyfishing.com/collections/fly-rods" },
  { brand: "hardy", url: "https://www.hardyfishing.com/collections/fly-reels" },

  // Fishpond
  { brand: "fishpond", url: "https://www.fishpondusa.com/collections/all" },
  { brand: "fishpond", url: "https://www.fishpondusa.com/collections/landing-nets" },
  { brand: "fishpond", url: "https://www.fishpondusa.com/collections/packs" },
  { brand: "fishpond", url: "https://www.fishpondusa.com/collections/sling-packs" },

  // Simms
  { brand: "simms", url: "https://www.simmsfishing.com/collections/all-mens-waders" },
  { brand: "simms", url: "https://www.simmsfishing.com/collections/mens-wading-boots" },
  { brand: "simms", url: "https://www.simmsfishing.com/collections/wading-packs-vests-bags" },
  { brand: "simms", url: "https://www.simmsfishing.com/collections/fishing-nets" },
  { brand: "simms", url: "https://www.simmsfishing.com/collections/fishing-packs" },

  // Hatch — try collection pages
  { brand: "hatch", url: "https://hatchoutdoors.com/collections/reels" },
  { brand: "hatch", url: "https://hatchoutdoors.com/collections/fly-reels" },
  { brand: "hatch", url: "https://hatchoutdoors.com/" },

  // Other brands (best-effort)
  { brand: "patagonia", url: "https://www.patagonia.com/shop/fly-fishing/waders/" },
  { brand: "orvis", url: "https://www.orvis.com/fly-fishing-waders.html" },
  { brand: "orvis", url: "https://www.orvis.com/fly-fishing-rods.html" },
  { brand: "orvis", url: "https://www.orvis.com/fly-fishing-reels.html" },
  { brand: "orvis", url: "https://www.orvis.com/fly-fishing-boots.html" },
  { brand: "orvis", url: "https://www.orvis.com/fly-fishing-packs-vests.html" },
  { brand: "orvis", url: "https://www.orvis.com/fly-fishing-nets.html" },

  // Echo
  { brand: "echo", url: "https://echoflyfishing.com/rods/" },
  { brand: "echo", url: "https://echoflyfishing.com/reels/" },

  // Winston
  { brand: "winston", url: "https://www.winstonrods.com/rods/" },

  // Scott
  { brand: "scott", url: "https://www.scottflyrod.com/rods/" },

  // Brodin
  { brand: "brodin", url: "https://brodinnets.com/collections/all" },
  { brand: "brodin", url: "https://brodinnets.com/collections/landing-nets" },

  // Galvan, Abel, Ross, Nautilus, Bauer, Cheeky, Lamson
  { brand: "galvan", url: "https://www.galvanflyreels.com/" },
  { brand: "abel", url: "https://www.abelreels.com/collections/all" },
  { brand: "ross", url: "https://www.rossreels.com/collections/all" },
  { brand: "nautilus", url: "https://nautilusreels.com/collections/all" },
  { brand: "bauer", url: "https://www.bauerflyreels.com/" },
  { brand: "cheeky", url: "https://www.cheekyfishing.com/collections/fly-reels" },
  { brand: "lamson", url: "https://www.lamson.com/collections/fly-reels" },
  { brand: "lamson", url: "https://www.lamson.com/" },

  // Lines / leaders / tippet
  { brand: "scientific-anglers", url: "https://www.scientificanglers.com/fly-lines/" },
  { brand: "airflo", url: "https://airflousa.com/collections/all" },
  { brand: "cortland", url: "https://www.cortlandline.com/collections/fly-lines" },
  { brand: "trouthunter", url: "https://www.trouthunt.com/collections/all" },

  // TFO, Beulah, St. Croix, Douglas
  { brand: "tfo", url: "https://templeforkoutfitters.com/collections/fly-rods" },
  { brand: "beulah", url: "https://beulahflyrods.com/collections/all" },
  { brand: "st-croix", url: "https://stcroixrods.com/collections/fly-rods" },
  { brand: "douglas", url: "https://www.douglasoutdoors.com/collections/fly-rods" },

  // Wader brands
  { brand: "grundens", url: "https://grundens.com/collections/waders" },
  { brand: "frogg-toggs", url: "https://www.froggtoggs.com/collections/fishing-waders" },
  { brand: "ll-bean", url: "https://www.llbean.com/llb/shop/512064" },
  { brand: "filson", url: "https://www.filson.com/clothing/mens-waders.html" },
  { brand: "umpqua", url: "https://www.umpqua.com/collections/packs" },
  { brand: "g-loomis", url: "https://www.gloomis.com/collections/fly-rods" },
];

async function fetchHtml(url) {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "text/html" },
      redirect: "follow",
    });
    if (!res.ok) return { url, error: `HTTP ${res.status}`, html: null };
    const html = await res.text();
    return { url, html };
  } catch (e) {
    return { url, error: e.message, html: null };
  }
}

/**
 * Parse a Shopify collection page. Standard markup pattern:
 *   <a href="/products/{handle}" ...>
 *     <img src="//cdn.shopify.com/.../products/foo.jpg" ... alt="Product Name">
 *   </a>
 * Or with srcset, lazy-loaded data-src, or data-srcset.
 */
function parseShopify(html, baseHost) {
  const items = new Map();
  // Match <a href="/products/{handle}"> ... </a> blocks
  const linkRe = /<a[^>]*href=["']([^"']*\/products\/[^"'?]+)[^"']*["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = linkRe.exec(html)) !== null) {
    const href = match[1];
    const inner = match[2];
    const handle = href.split("/products/")[1]?.split(/[?#]/)[0];
    if (!handle) continue;
    if (items.has(handle)) continue;

    // Try data-src, data-srcset, src, srcset for the first <img> in the link block
    const imgMatch = inner.match(/<img\b([^>]*)>/i);
    if (!imgMatch) continue;
    const attrs = imgMatch[1];

    const srcsetMatch =
      attrs.match(/(?:data-srcset|srcset)=["']([^"']+)["']/i) ||
      attrs.match(/data-src=["']([^"']+)["']/i) ||
      attrs.match(/\bsrc=["']([^"']+)["']/i);
    if (!srcsetMatch) continue;

    let imgUrl = srcsetMatch[1].split(",")[0].trim().split(" ")[0];
    if (imgUrl.startsWith("//")) imgUrl = "https:" + imgUrl;
    else if (imgUrl.startsWith("/")) imgUrl = "https://" + baseHost + imgUrl;

    if (!/^https?:/.test(imgUrl)) continue;
    if (imgUrl.includes("data:image")) continue;

    const titleMatch = inner.match(/<(?:h[1-6]|span|div)[^>]*class=["'][^"']*(?:product[-_]?(?:title|name|card[-_]?title))[^"']*["'][^>]*>([\s\S]*?)<\/(?:h[1-6]|span|div)>/i);
    const altMatch = attrs.match(/\balt=["']([^"']+)["']/i);
    const title = (titleMatch?.[1] || altMatch?.[1] || handle).replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();

    items.set(handle, {
      handle,
      title,
      productUrl: href.startsWith("http") ? href : "https://" + baseHost + href,
      imageUrl: imgUrl,
    });
  }
  return Array.from(items.values());
}

/**
 * Shopify-standard /products.json endpoint. Most Shopify stores expose this
 * publicly and return up to 250 products per page. Pagination via ?page=N.
 */
async function fetchShopifyJson(host) {
  const items = [];
  for (let page = 1; page <= 5; page++) {
    try {
      const res = await fetch(`https://${host}/products.json?limit=250&page=${page}`, {
        headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
      });
      if (!res.ok) break;
      const data = await res.json();
      if (!data.products || data.products.length === 0) break;
      for (const p of data.products) {
        const img = p.images?.[0]?.src || p.image?.src;
        if (!img) continue;
        items.push({
          handle: p.handle,
          title: p.title,
          productUrl: `https://${host}/products/${p.handle}`,
          imageUrl: img,
        });
      }
      if (data.products.length < 250) break;
      await new Promise((r) => setTimeout(r, 400));
    } catch {
      break;
    }
  }
  return items;
}

const JSON_HOSTS = [
  { brand: "sage", host: "farbank.com" },
  { brand: "redington", host: "farbank.com" },
  { brand: "rio", host: "farbank.com" },
  { brand: "tibor", host: "tiborreel.com" },
  { brand: "korkers", host: "www.korkers.com" },
  { brand: "skwala", host: "www.skwalafishing.com" },
  { brand: "thomas-thomas", host: "thomasandthomas.com" },
  { brand: "hardy", host: "www.hardyfishing.com" },
  { brand: "fishpond", host: "www.fishpondusa.com" },
  { brand: "simms", host: "www.simmsfishing.com" },
  { brand: "hatch", host: "hatchoutdoors.com" },
  { brand: "abel", host: "www.abelreels.com" },
  { brand: "ross", host: "www.rossreels.com" },
  { brand: "nautilus", host: "nautilusreels.com" },
  { brand: "cheeky", host: "www.cheekyfishing.com" },
  { brand: "lamson", host: "www.lamson.com" },
  { brand: "airflo", host: "airflousa.com" },
  { brand: "cortland", host: "www.cortlandline.com" },
  { brand: "trouthunter", host: "www.trouthunt.com" },
  { brand: "tfo", host: "templeforkoutfitters.com" },
  { brand: "beulah", host: "beulahflyrods.com" },
  { brand: "umpqua", host: "www.umpqua.com" },
  { brand: "brodin", host: "brodinnets.com" },
  { brand: "grundens", host: "grundens.com" },
  { brand: "g-loomis", host: "www.gloomis.com" },
];

async function main() {
  const allResults = {};

  // Phase 1: Shopify JSON API (most reliable)
  for (const j of JSON_HOSTS) {
    process.stdout.write(`json  ${j.host} (${j.brand}) ... `);
    const items = await fetchShopifyJson(j.host);
    console.log(`${items.length} items`);
    for (const item of items) {
      const key = `${j.brand}::${item.handle}`;
      allResults[key] = { ...item, brand: j.brand, source: `${j.host}/products.json` };
    }
  }

  // Phase 2: HTML scrape for collection-specific filtering
  for (const src of SOURCES) {
    process.stdout.write(`html  ${src.url} ... `);
    const { html, error } = await fetchHtml(src.url);
    if (error || !html) {
      console.log(`FAIL ${error}`);
      continue;
    }
    const baseHost = new URL(src.url).host;
    const items = parseShopify(html, baseHost);
    console.log(`${items.length} items`);
    for (const item of items) {
      const key = `${src.brand}::${item.handle}`;
      // Don't overwrite — JSON results are more authoritative
      if (!allResults[key]) {
        allResults[key] = { ...item, brand: src.brand, source: src.url };
      }
    }
    // be polite
    await new Promise((r) => setTimeout(r, 700));
  }

  writeFileSync(
    "/Users/taylorwarnick/My Sites-Apps/personal/executive-angler/scripts/scraped-product-images.json",
    JSON.stringify(allResults, null, 2),
  );
  console.log(`\nWrote ${Object.keys(allResults).length} scraped products to scripts/scraped-product-images.json`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
