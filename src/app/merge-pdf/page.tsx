"use client";

import dynamic from "next/dynamic";

const MergeConverterUi = dynamic(
  () => import("@/components/MergeConverterUi").then((mod) => mod.MergeConverterUi),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center min-h-[500px]">
        <div className="w-12 h-12 border-[3px] border-neutral-800 border-t-white rounded-full animate-spin" />
      </div>
    ),
  }
);

export default function MergePdfPage() {
  return (
    <div className="w-full min-h-full">
      <MergeConverterUi />
    </div>
  );
}
