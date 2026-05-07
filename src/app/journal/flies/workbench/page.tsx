import { permanentRedirect } from "next/navigation";

export default function WorkbenchPage() {
  permanentRedirect("/flies?tab=workbench");
}
