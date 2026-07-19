import { renderToolOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/seo/og";
import { getTool } from "@/lib/seo/tools";

export const alt = getTool("svg-a-png").h1;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderToolOgImage("svg-a-png");
}
