"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MapPin,
  Waves,
  Fish,
  Building,
  User,
  ShoppingBag,
  FileText,
  Camera,
} from "lucide-react";
import type { ReactNode } from "react";

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
}

const dashboardLink: NavItem = {
  href: "/admin",
  label: "Dashboard",
  icon: <LayoutDashboard className="h-4 w-4" />,
};

const contentLinks: NavItem[] = [
  { href: "/admin/content/destinations", label: "Destinations", icon: <MapPin className="h-4 w-4" /> },
  { href: "/admin/content/rivers", label: "Rivers", icon: <Waves className="h-4 w-4" /> },
  { href: "/admin/content/species", label: "Species", icon: <Fish className="h-4 w-4" /> },
  { href: "/admin/content/lodges", label: "Lodges", icon: <Building className="h-4 w-4" /> },
  { href: "/admin/content/guides", label: "Guides", icon: <User className="h-4 w-4" /> },
  { href: "/admin/content/fly-shops", label: "Fly Shops", icon: <ShoppingBag className="h-4 w-4" /> },
  { href: "/admin/content/articles", label: "Articles", icon: <FileText className="h-4 w-4" /> },
];

const photosLink: NavItem = {
  href: "/admin/photos",
  label: "Photos",
  icon: <Camera className="h-4 w-4" />,
};

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const isActive =
    item.href === "/admin"
      ? pathname === "/admin"
      : pathname.startsWith(item.href);

  return (
    <Link
      href={item.href}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        isActive
          ? "text-[#E8923A] bg-[#E8923A]/10 border-l-2 border-[#E8923A] -ml-px"
          : "text-[#A8B2BD] hover:text-[#F0F6FC] hover:bg-[#21262D]/50"
      }`}
    >
      <span className={isActive ? "text-[#E8923A]" : "text-[#6E7681]"}>
        {item.icon}
      </span>
      {item.label}
    </Link>
  );
}

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 bg-[#161B22] border-r border-[#21262D] min-h-screen px-3 py-6 space-y-6">
      {/* Dashboard */}
      <div>
        <NavLink item={dashboardLink} pathname={pathname} />
      </div>

      {/* Content section */}
      <div>
        <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-[#6E7681]">
          Content
        </p>
        <nav className="space-y-0.5">
          {contentLinks.map((item) => (
            <NavLink key={item.href} item={item} pathname={pathname} />
          ))}
        </nav>
      </div>

      {/* Photos */}
      <div>
        <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-[#6E7681]">
          Moderation
        </p>
        <NavLink item={photosLink} pathname={pathname} />
      </div>
    </aside>
  );
}
