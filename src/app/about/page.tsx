import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About",
  description:
    "Executive Angler is the definitive fly fishing resource — connecting anglers with destinations, rivers, lodges, guides, and expert instruction worldwide.",
};

export default function AboutPage() {
  return (
    <div className="pt-28 pb-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="font-heading text-4xl font-bold text-forest-dark mb-6">
          About {SITE_NAME}
        </h1>

        <div className="prose prose-lg max-w-none text-slate-700 space-y-6">
          <p className="text-xl text-slate-600 leading-relaxed">
            {SITE_NAME} is the definitive fly fishing resource, built to connect
            anglers with the world&apos;s finest waters, lodges, guides, and expert
            instruction.
          </p>

          <h2 className="font-heading text-2xl font-bold text-forest-dark mt-10">
            Our Mission
          </h2>
          <p>
            We believe every angler deserves access to comprehensive, trustworthy
            information about fly fishing destinations worldwide. Our mission is to
            be the single authoritative source that helps you plan your next trip,
            discover new waters, understand the species you pursue, and connect
            directly with the lodges and guides who will make your experience
            unforgettable.
          </p>

          <h2 className="font-heading text-2xl font-bold text-forest-dark mt-10">
            What We Cover
          </h2>
          <p>
            From the spring creeks of Montana to the saltwater flats of Christmas
            Island, from Atlantic salmon rivers in Iceland to the sea-run brown
            trout waters of Tierra del Fuego, {SITE_NAME} covers every major fly
            fishing destination on Earth. Our content spans:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-slate-700">
            <li>
              <strong>Destinations</strong> — In-depth profiles of 35+ fly fishing
              regions across six continents, with maps, best months, target species,
              and local regulations.
            </li>
            <li>
              <strong>Rivers &amp; Waters</strong> — Detailed guides to 55+ rivers
              and waterways, including access points, hatch charts, flow types, and
              GPS coordinates.
            </li>
            <li>
              <strong>Lodges</strong> — Curated listings of premier fly fishing
              lodges with amenities, pricing, seasons, and direct booking links.
            </li>
            <li>
              <strong>Guides</strong> — Professional guide services with
              specialties, rates, and the rivers they know best.
            </li>
            <li>
              <strong>Species</strong> — A comprehensive reference covering 35+
              species with taxonomy, habitat, conservation status, fly patterns, and
              tackle recommendations.
            </li>
            <li>
              <strong>Articles</strong> — Expert editorial content on techniques,
              gear, conservation, and the culture of fly fishing.
            </li>
            <li>
              <strong>Fly Shops</strong> — Local shops with hours, services, and the
              brands they carry.
            </li>
          </ul>

          <h2 className="font-heading text-2xl font-bold text-forest-dark mt-10">
            No Middleman
          </h2>
          <p>
            {SITE_NAME} does not sell gear or operate as a booking agent. We
            connect you directly with lodges, guides, and fly shops — no commissions,
            no markups, no middleman. When you find a lodge or guide on our site, the
            contact information and website links go straight to them.
          </p>

          <h2 className="font-heading text-2xl font-bold text-forest-dark mt-10">
            Community
          </h2>
          <p>
            Our community photo galleries let anglers share their experiences on the
            water. Submit your best fishing photos to any destination, river, lodge,
            or species page, and your images will be featured alongside our editorial
            content after a brief review.
          </p>

          <h2 className="font-heading text-2xl font-bold text-forest-dark mt-10">
            Conservation
          </h2>
          <p>
            Fly fishing and conservation are inseparable. {SITE_NAME} is committed
            to promoting catch-and-release practices, wild trout management, and
            habitat conservation. Our species profiles include conservation status
            information, and our editorial coverage regularly addresses the
            stewardship issues that matter most to the future of our sport and the
            ecosystems it depends on.
          </p>
        </div>
      </div>
    </div>
  );
}
