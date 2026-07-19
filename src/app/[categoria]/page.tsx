import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { CategoryView } from "@/components/CategoryView";
import { categoryGraph } from "@/lib/seo/jsonld";
import { categoryMetadata } from "@/lib/seo/metadata";
import { CATEGORY_ORDER, isCategoryId } from "@/lib/seo/categories";
import { categoryWithTools } from "@/lib/seo/category-tools";

/**
 * One dynamic route serves every category landing page. `generateStaticParams`
 * enumerates the categories and `dynamicParams = false` turns any other slug
 * into a 404 — so adding a category is purely a data change in
 * `categories.ts`/`tools.ts`, no new route file. Static tool routes take
 * precedence over this dynamic segment, so they are never shadowed.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return CATEGORY_ORDER.map((categoria) => ({ categoria }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categoria: string }>;
}): Promise<Metadata> {
  const { categoria } = await params;
  if (!isCategoryId(categoria)) return {};
  return categoryMetadata(categoria);
}

export default async function Page({
  params,
}: {
  params: Promise<{ categoria: string }>;
}) {
  const { categoria } = await params;
  if (!isCategoryId(categoria)) notFound();

  const category = categoryWithTools(categoria);

  return (
    <div className="w-full min-h-full">
      <JsonLd data={categoryGraph(category)} />
      <CategoryView category={category} />
    </div>
  );
}
