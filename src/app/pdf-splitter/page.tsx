import { redirect } from "next/navigation";

// "Separador PDF" now lives in the unified PDF organizer as the `split` mode.
export default function PdfSplitterPage() {
  redirect("/pdf-organizer?mode=split");
}
