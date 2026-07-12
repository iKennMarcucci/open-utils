"use client";

import dynamic from "next/dynamic";

const PdfEditorUi = dynamic(
  () => import("@/components/PdfEditorUi").then((mod) => mod.PdfEditorUi),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center min-h-[500px]">
        <div className="w-12 h-12 border-[3px] border-surface-strong border-t-accent rounded-full animate-spin" />
      </div>
    ),
  }
);

export default function PdfEditorPage() {
  return (
    <div className="w-full min-h-full">
      <PdfEditorUi />
    </div>
  );
}
