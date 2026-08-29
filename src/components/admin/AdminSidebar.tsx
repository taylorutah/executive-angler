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
  Award,
  Package,
  Camera,
  Mail,
  Feather,
  Wrench,
  Images,
} from "@/icons";
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
  { href: "/admin/content/flies", label: "Flies", icon: <Feather className="h-4 w-4" /> },
  { href: "/admin/content/gear-brands", label: "Gear Brands", icon: <Award className="h-4 w-4" /> },
  { href: "/admin/content/gear-products", label: "Gear Products", icon: <Package className="h-4 w-4" /> },
];

const photosLink: NavItem = {
  href: "/admin/photos",
  label: "Photos",
  icon: <Camera className="h-4 w-4" />,
};

const imageGapsLink: NavItem = {
  href: "/admin/content/images",
  label: "Image gaps",
  icon: <Images className="h-4 w-4" />,
};

const emailPreviewLink: NavItem = {
  href: "/admin/email-preview",
  label: "Email Preview",
  icon: <Mail className="h-4 w-4" />,
};

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const isActive =
    item.href === "/admin"
      ? pathname === "/admin"
      : pathname.startsWith(item.href);

  return (
    <Link
      href={item.href}
      aria-current={isActive ? "page" : undefined}
      className={`flex items-center gap-3 px-3 py-2 rounded-[var(--radius-md)] text-sm font-medium transition-colors duration-150 ease-standard ${
        isActive
          ? "bg-[var(--accent-soft)] text-[var(--accent)]"
          : "text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--surface)]"
      }`}
    >
      <span className={isActive ? "text-[var(--accent)]" : "text-[var(--text-3)]"}>
        {item.icon}
      </span>
      {item.label}
    </Link>
  );
}

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 bg-[var(--paper-deep)] border-r border-[var(--border)] min-h-screen px-3 py-6 space-y-6">
      {/* Dashboard */}
      <div>
        <NavLink item={dashboardLink} pathname={pathname} />
      </div>

      {/* Content section */}
      <div>
        <p className="ea-overline px-3 mb-2">
          Content
        </p>
        <nav className="space-y-0.5">
          {contentLinks.map((item) => (
            <NavLink key={item.href} item={item} pathname={pathname} />
          ))}
        </nav>
      </div>

      {/* Moderation */}
      <div>
        <p className="ea-overline px-3 mb-2">
          Moderation
        </p>
        <NavLink item={imageGapsLink} pathname={pathname} />
        <NavLink item={photosLink} pathname={pathname} />
        <NavLink
          item={{ href: "/admin/flies/submissions", label: "Fly Submissions", icon: <Feather className="h-4 w-4" /> }}
          pathname={pathname}
        />
        <NavLink
          item={{ href: "/admin/content/materials", label: "Materials Queue", icon: <Wrench className="h-4 w-4" /> }}
          pathname={pathname}
        />
      </div>

      {/* Tools */}
      <div>
        <p className="ea-overline px-3 mb-2">
          Tools
        </p>
        <NavLink item={emailPreviewLink} pathname={pathname} />
      </div>
    </aside>
  );
}
