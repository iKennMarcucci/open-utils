"use client";

import dynamic from "next/dynamic";

const SvgToPngUi = dynamic(() => import("@/components/SvgToPngUi").then((mod) => mod.SvgToPngUi), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center min-h-screen">
      <div className="w-12 h-12 border-[3px] border-surface-strong border-t-accent rounded-full animate-spin" />
    </div>
  ),
});

export function SvgToPngClient() {
  return <SvgToPngUi />;
}
