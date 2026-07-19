import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { ToolPageContent } from "@/components/seo/ToolPageContent";
import { toolGraph } from "@/lib/seo/jsonld";
import { toolMetadata } from "@/lib/seo/metadata";
import { getTool } from "@/lib/seo/tools";
import { SymbolPickerClient } from "./SymbolPickerClient";

const SLUG = "simbolos-emojis";

export const metadata: Metadata = toolMetadata(SLUG);

export default function Page() {
  return (
    <div className="w-full min-h-full">
      <JsonLd data={toolGraph(getTool(SLUG))} />
      <SymbolPickerClient />
      <ToolPageContent slug={SLUG} />
    </div>
  );
}
