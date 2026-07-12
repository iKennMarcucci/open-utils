"use client";

import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";

export type PdfOrganizerMode = "merge" | "split";

const Spinner = () => (
  <div className="flex-1 flex items-center justify-center min-h-[500px]">
    <div className="w-12 h-12 border-[3px] border-surface-strong border-t-accent rounded-full animate-spin" />
  </div>
);

// Each tool is code-split so only the active one is downloaded.
const MergeConverterUi = dynamic(
  () => import("@/components/MergeConverterUi").then((m) => m.MergeConverterUi),
  { ssr: false, loading: Spinner }
);
const SplitConverterUi = dynamic(
  () => import("@/components/SplitConverterUi").then((m) => m.SplitConverterUi),
  { ssr: false, loading: Spinner }
);

/**
 * Two counterpart PDF tools under one route, selected by `?mode`:
 * - `merge` (default) → Unificador PDF
 * - `split`           → Separar de PDF
 * This mirrors the other converters (`/pdf-converter?mode=`, `/video-converter?mode=`).
 */
export function PdfOrganizerUi() {
  const searchParams = useSearchParams();
  const mode: PdfOrganizerMode = searchParams?.get("mode") === "split" ? "split" : "merge";

  return (
    <div className="w-full min-h-full">
      {mode === "split" ? <SplitConverterUi /> : <MergeConverterUi />}
    </div>
  );
}
