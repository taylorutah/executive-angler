import { permanentRedirect } from "next/navigation";

export default function BoxesIndexRedirect(): never {
  permanentRedirect("/flies?tab=boxes");
}
