import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo/site";
import { TOOL_ORDER } from "@/lib/seo/tools";
import { CATEGORY_ORDER } from "@/lib/seo/categories";

/**
 * Only canonical, indexable, 200-status URLs belong here — no redirects. The
 * legacy English routes (/pdf-editor, /merge-pdf, …) 308 to these, so they are
 * deliberately absent.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: absoluteUrl("/"),
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    // Category landing pages sit just below the home: they are hubs that link out
    // to the tools and can rank for broader queries.
    ...CATEGORY_ORDER.map((id) => ({
      url: absoluteUrl(`/${id}`),
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
    ...TOOL_ORDER.map((slug) => ({
      url: absoluteUrl(`/${slug}`),
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    {
      url: absoluteUrl("/privacidad"),
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
