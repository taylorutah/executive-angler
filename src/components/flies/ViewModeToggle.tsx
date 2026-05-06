"use client";

/**
 * ViewModeToggle — Yours / Library segmented control on the canonical fly
 * page. Drives the `?view=` URL param. When in box, the page defaults to
 * `yours` (no param) and the user can flip to canonical via `?view=library`.
 */
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Library, User } from "lucide-react";

interface Props {
  /** Current resolved view mode — "yours" | "library". */
  current: "yours" | "library";
}

export default function ViewModeToggle({ current }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  function setMode(next: "yours" | "library") {
    if (pending || next === current) return;
    const params = new URLSearchParams(searchParams.toString());
    if (next === "library") params.set("view", "library");
    else params.delete("view");
    const qs = params.toString();
    startTransition(() => {
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    });
  }

  const yoursActive = current === "yours";
  const baseBtn =
    "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8923A]/60";
  const activeCls = "bg-[#E8923A] text-[#0D1117]";
  const inactiveCls =
    "bg-transparent text-[#A8B2BD] hover:text-[#F0F6FC]";

  return (
    <div
      role="tablist"
      aria-label="Fly view mode"
      className="inline-flex rounded-lg overflow-hidden border border-[#21262D] bg-[#0D1117]"
    >
      <button
        type="button"
        role="tab"
        aria-selected={yoursActive}
        onClick={() => setMode("yours")}
        className={`${baseBtn} ${yoursActive ? activeCls : inactiveCls}`}
      >
        <User className="h-3.5 w-3.5" />
        Yours
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={!yoursActive}
        onClick={() => setMode("library")}
        className={`${baseBtn} ${!yoursActive ? activeCls : inactiveCls}`}
      >
        <Library className="h-3.5 w-3.5" />
        Library
      </button>
    </div>
  );
}
