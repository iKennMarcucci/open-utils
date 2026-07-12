"use client";

import dynamic from "next/dynamic";

const PdfOrganizerUi = dynamic(
  () => import("@/components/PdfOrganizerUi").then((mod) => mod.PdfOrganizerUi),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center min-h-[500px]">
        <div className="w-12 h-12 border-[3px] border-surface-strong border-t-accent rounded-full animate-spin" />
      </div>
    ),
  }
);

export default function PdfOrganizerPage() {
  return (
    <div className="w-full min-h-full">
      <PdfOrganizerUi />
    </div>
  );
}
