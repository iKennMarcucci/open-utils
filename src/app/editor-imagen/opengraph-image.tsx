import { renderToolOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/seo/og";
import { getTool } from "@/lib/seo/tools";

export const alt = getTool("editor-imagen").h1;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderToolOgImage("editor-imagen");
}
