import { permanentRedirect } from "next/navigation";

// Founding 50 retired. /founding permanently redirects to the new pricing page.
export default function FoundingRetired() {
  permanentRedirect("/pricing");
}
