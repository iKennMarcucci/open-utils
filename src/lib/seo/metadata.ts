import type { Metadata } from "next";
import { SITE_NAME, SITE_LOCALE, absoluteUrl } from "./site";
import { getTool } from "./tools";

/**
 * Base Open Graph fields. Next merges `openGraph` *shallowly*: a page that sets
 * `openGraph: { title }` silently drops siteName, locale, images and everything
 * else from the layout. So every page spreads this instead of redefining it.
 */
export const baseOpenGraph = {
  siteName: SITE_NAME,
  locale: SITE_LOCALE,
  type: "website" as const,
};

/** Metadata for a tool page, derived from its single source of truth. */
export function toolMetadata(slug: string): Metadata {
  const tool = getTool(slug);
  const url = absoluteUrl(`/${tool.slug}`);

  return {
    title: tool.title,
    description: tool.description,
    alternates: { canonical: url },
    openGraph: {
      ...baseOpenGraph,
      title: tool.title,
      description: tool.description,
      url,
    },
    twitter: {
      card: "summary_large_image",
      title: tool.title,
      description: tool.description,
    },
  };
}
