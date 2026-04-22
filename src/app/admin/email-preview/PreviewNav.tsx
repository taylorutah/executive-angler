"use client";

type NavItem = { key: string; label: string };

export default function PreviewNav({ items }: { items: NavItem[] }) {
  return (
    <nav className="mb-10 flex flex-wrap gap-2">
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={() => {
            const el = document.getElementById(item.key);
            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
          className="text-xs px-3 py-1.5 rounded-md border border-[#21262D] bg-[#161B22] text-[#A8B2BD] hover:text-[#F0F6FC] hover:border-[#E8923A]/40 transition-colors cursor-pointer"
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}
