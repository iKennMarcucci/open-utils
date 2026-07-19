"use client";

import dynamic from "next/dynamic";

const LoremUi = dynamic(() => import("@/components/LoremUi").then((mod) => mod.LoremUi), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center min-h-screen">
      <div className="w-12 h-12 border-[3px] border-surface-strong border-t-accent rounded-full animate-spin" />
    </div>
  ),
});

export function LoremClient() {
  return <LoremUi />;
}
