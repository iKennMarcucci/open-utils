"use client";

import dynamic from "next/dynamic";

const SymbolPickerUi = dynamic(() => import("@/components/SymbolPickerUi").then((mod) => mod.SymbolPickerUi), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center min-h-screen">
      <div className="w-12 h-12 border-[3px] border-surface-strong border-t-accent rounded-full animate-spin" />
    </div>
  ),
});

export function SymbolPickerClient() {
  return <SymbolPickerUi />;
}
