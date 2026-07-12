import { redirect } from "next/navigation";

// "Unificador PDF" now lives in the unified PDF organizer as the `merge` mode.
export default function MergePdfPage() {
  redirect("/pdf-organizer?mode=merge");
}
