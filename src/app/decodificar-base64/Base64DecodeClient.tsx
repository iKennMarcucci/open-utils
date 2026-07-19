"use client";

import dynamic from "next/dynamic";

/**
 * Client shell. The `ssr: false` dynamic import has to live in a Client
 * Component — Next 16 rejects it inside a Server Component — and keeping it
 * *only* here is what lets `page.tsx` stay a Server Component that can export
 * `metadata` and render crawlable copy and JSON-LD.
 */
const Base64Ui = dynamic(
  () => import("@/components/Base64Ui").then((mod) => mod.Base64Ui),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-[3px] border-surface-strong border-t-accent rounded-full animate-spin" />
      </div>
    ),
  }
);

export function Base64DecodeClient() {
  return <Base64Ui mode="decode" />;
}
