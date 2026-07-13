"use client";

import dynamic from "next/dynamic";

/**
 * Client shell. The `ssr: false` dynamic import has to live in a Client
 * Component — Next 16 rejects it inside a Server Component — and keeping it
 * *only* here is what lets `page.tsx` stay a Server Component that can export
 * `metadata` and render crawlable copy and JSON-LD.
 */
const SplitConverterUi = dynamic(
  () => import("@/components/SplitConverterUi").then((mod) => mod.SplitConverterUi),
  {
    ssr: false,
    loading: () => (
      // Reserves the same height the real widget will occupy (they are all
      // `min-h-screen`), so swapping the spinner for the tool does not shove the
      // content below it down the page (CLS).
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-[3px] border-surface-strong border-t-accent rounded-full animate-spin" />
      </div>
    ),
  }
);

export function SplitPdfClient() {
  return <SplitConverterUi />;
}
