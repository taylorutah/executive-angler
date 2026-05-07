import { permanentRedirect } from "next/navigation";

export default function LegacyMyBoxesPage() {
  permanentRedirect("/flies?tab=boxes");
}
