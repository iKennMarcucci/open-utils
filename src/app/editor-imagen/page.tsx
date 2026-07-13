import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { ToolPageContent } from "@/components/seo/ToolPageContent";
import { toolGraph } from "@/lib/seo/jsonld";
import { toolMetadata } from "@/lib/seo/metadata";
import { getTool } from "@/lib/seo/tools";
import { ImageEditorClient } from "./ImageEditorClient";

const SLUG = "editor-imagen";

export const metadata: Metadata = toolMetadata(SLUG);

export default function Page() {
  return (
    <div className="w-full min-h-full">
      <JsonLd data={toolGraph(getTool(SLUG))} />
      <ImageEditorClient />
      <ToolPageContent slug={SLUG} />
    </div>
  );
}
