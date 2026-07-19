/**
 * The one place that joins categories to their tools at the value level.
 *
 * It is kept apart from `categories.ts` on purpose: `categories.ts` holds only
 * data and type-only imports, so the build-time SEO checker can import it
 * standalone (Node's TS loader can't resolve a value import to another
 * extensionless module). This module does the value-level join and is only ever
 * imported by the app and components, which the Next bundler resolves.
 */
import { type CategoryId, type ToolSeo, toolsInCategory } from "./tools";
import { CATEGORIES, type CategorySeo } from "./categories";

/** A category paired with its tools, ready to render. */
export type CategoryWithTools = CategorySeo & { tools: ToolSeo[] };

export function categoryWithTools(id: CategoryId): CategoryWithTools {
  return { ...CATEGORIES[id], tools: toolsInCategory(id) };
}
