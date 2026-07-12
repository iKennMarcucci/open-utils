"use client";

import dynamic from "next/dynamic";

const ImageEditorUi = dynamic(
  () => import("@/components/ImageEditorUi").then((mod) => mod.ImageEditorUi),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center min-h-[500px]">
        <div className="w-12 h-12 border-[3px] border-surface-strong border-t-accent rounded-full animate-spin" />
      </div>
    ),
  }
);

export default function ImageEditorPage() {
  return (
    <div className="w-full min-h-full">
      <ImageEditorUi />
    </div>
  );
}
