"use client";

import dynamic from "next/dynamic";

const ConverterUi = dynamic(
  () => import("@/components/ConverterUi").then((mod) => mod.ConverterUi),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center min-h-[500px]">
        <div className="w-12 h-12 border-[3px] border-border border-t-white rounded-full animate-spin" />
      </div>
    ),
  }
);

export default function PdfConverterPage() {
  return (
    <div className="w-full min-h-full">
      <ConverterUi />
    </div>
  );
}
