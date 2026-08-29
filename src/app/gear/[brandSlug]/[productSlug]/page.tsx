import { permanentRedirect } from "next/navigation";

/** Legacy product-detail page retired — see Phase 4 (gear cleanup, 2026-05-08). */
export default function ProductDetailRedirect() {
  permanentRedirect("/gear");
}
