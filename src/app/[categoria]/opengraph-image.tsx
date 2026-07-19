import { renderCategoryOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/seo/og";
import { CATEGORY_ORDER } from "@/lib/seo/categories";

export const dynamicParams = false;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return CATEGORY_ORDER.map((categoria) => ({ categoria }));
}

export default async function Image({ params }: { params: Promise<{ categoria: string }> }) {
  const { categoria } = await params;
  return renderCategoryOgImage(categoria);
}
