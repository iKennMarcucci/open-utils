/**
 * Client-side tool search for the sidebar finder.
 *
 * Matching is deliberately forgiving: the query is normalised (lowercased,
 * accents stripped, so "compresion" finds "compresión"), split into tokens, and
 * a tool only survives if EVERY token hits somewhere in its haystack — its
 * name, short name, description, category label or its keyword bank. That makes
 * "unir pdf" and "pdf unir" behave the same while "unir zip" still narrows.
 *
 * Results are ranked (a name hit beats a keyword hit) and then grouped by
 * category so the flyout can mirror the sidebar's own taxonomy.
 */
import { ALL_TOOLS, type CategoryId, type ToolSeo } from "@/lib/seo/tools";
import { ALL_CATEGORIES } from "@/lib/seo/categories";
import { keywordsFor } from "@/lib/seo/keywords";

/** Lowercase + strip diacritics, so accents never make a query miss. */
export function normalize(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export type SearchGroup = {
  category: CategoryId;
  label: string;
  tools: ToolSeo[];
};

type Indexed = {
  tool: ToolSeo;
  name: string;
  shortName: string;
  keywords: string[];
  haystack: string;
};

/** Built once per module load — 28 tools, so a plain linear scan is plenty. */
const INDEX: Indexed[] = ALL_TOOLS.map((tool) => {
  const keywords = keywordsFor(tool.slug).map(normalize);
  const categoryLabel =
    ALL_CATEGORIES.find((c) => c.id === tool.category)?.label ?? "";
  return {
    tool,
    name: normalize(tool.name),
    shortName: normalize(tool.shortName),
    keywords,
    haystack: normalize(
      [tool.name, tool.shortName, tool.description, categoryLabel, ...keywordsFor(tool.slug)].join(" "),
    ),
  };
});

/** Best score this entry can give a single token; 0 means "no match". */
function scoreToken(entry: Indexed, token: string): number {
  if (entry.name === token) return 100;
  if (entry.name.startsWith(token)) return 80;
  if (entry.name.includes(token)) return 60;
  if (entry.shortName.includes(token)) return 55;

  let best = 0;
  for (const kw of entry.keywords) {
    if (kw === token) return 50;
    if (kw.startsWith(token)) best = Math.max(best, 40);
    else if (kw.includes(token)) best = Math.max(best, 30);
  }
  if (best) return best;

  return entry.haystack.includes(token) ? 10 : 0;
}

/** Flat, ranked matches. Empty query yields an empty list. */
export function searchToolsFlat(query: string): ToolSeo[] {
  const tokens = normalize(query).split(" ").filter(Boolean);
  if (!tokens.length) return [];

  const scored: { tool: ToolSeo; score: number }[] = [];
  for (const entry of INDEX) {
    let total = 0;
    let matchedAll = true;
    for (const token of tokens) {
      const s = scoreToken(entry, token);
      if (!s) {
        matchedAll = false;
        break;
      }
      total += s;
    }
    if (matchedAll) scored.push({ tool: entry.tool, score: total });
  }

  return scored
    .sort((a, b) => b.score - a.score || a.tool.name.localeCompare(b.tool.name))
    .map((s) => s.tool);
}

/**
 * Ranked matches grouped by category, in the sidebar's own category order.
 * Empty categories are omitted, so an empty array means "no results".
 */
export function searchTools(query: string): SearchGroup[] {
  const matches = searchToolsFlat(query);
  if (!matches.length) return [];

  return ALL_CATEGORIES.map((category) => ({
    category: category.id,
    label: category.label,
    tools: matches.filter((t) => t.category === category.id),
  })).filter((group) => group.tools.length > 0);
}
