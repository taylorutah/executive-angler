import { redirect } from "next/navigation";

// /journal/flies is now a soft redirect to the unified /my-flies surface.
// Phase 1 of the fly box + workbench redesign moved this page.
export default function LegacyFlyBoxRedirect() {
  redirect("/my-flies");
}
