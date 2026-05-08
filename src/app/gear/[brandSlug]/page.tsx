import { redirect } from "next/navigation";

/** Legacy brand-detail page retired — see Phase 4 (gear cleanup, 2026-05-08). */
export default function BrandDetailRedirect() {
  redirect("/gear");
}
