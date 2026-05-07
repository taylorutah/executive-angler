import { permanentRedirect } from "next/navigation";

export default function LegacyFlyBoxRedirect() {
  permanentRedirect("/flies?tab=patterns");
}
