import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ToolSeo } from "@/lib/seo/tools";
import { CATEGORIES } from "@/lib/seo/categories";
import { TOOL_ICONS, TOOL_FALLBACK_ICON, CATEGORY_VISUALS } from "@/lib/catalog";
import { cn } from "@/lib/utils";

/**
 * One tool tile. Server component with no client JS: it renders the same in the
 * home grid and in each category grid, and its data comes entirely from the
 * single source (tools.ts for copy, catalog.tsx for icon/accent). The heading is
 * an <h3>; whatever renders a grid of these supplies the surrounding <h2>.
 */
export function ToolCard({ tool, showCategory = false }: { tool: ToolSeo; showCategory?: boolean }) {
  const Icon = TOOL_ICONS[tool.slug] ?? TOOL_FALLBACK_ICON;
  const { accent } = CATEGORY_VISUALS[tool.category];
  const categoryLabel = CATEGORIES[tool.category].label;

  return (
    <Link
      href={`/${tool.slug}`}
      className={cn(
        "group relative flex flex-col overflow-hidden p-5 md:p-6",
        "rounded-panel min-h-[180px] ou-card-interactive h-full w-full"
      )}
    >
      {/* hover glow tinted by the category accent */}
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(120% 120% at 100% 0%, color-mix(in srgb, ${accent} 12%, transparent), transparent 60%)`,
        }}
      />

      <div className="relative z-10 flex items-start justify-between">
        <div
          className="relative flex h-11 w-11 items-center justify-center rounded-control border border-border bg-surface-strong transition-transform duration-300 group-hover:scale-105"
          style={{ color: accent }}
        >
          <Icon className="h-5 w-5" />
        </div>
        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-foreground-faint transition-all duration-300 group-hover:border-border-strong group-hover:text-foreground">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>

      <div className="relative z-10 mt-auto pt-6">
        {showCategory && (
          <span className="mb-2 inline-flex items-center gap-1.5 ou-label">
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accent }} />
            {categoryLabel}
          </span>
        )}
        <h3 className="text-lg font-semibold tracking-tight text-foreground">{tool.name}</h3>
        <p className="mt-1.5 text-[13px] leading-relaxed text-foreground-subtle line-clamp-3">
          {tool.description}
        </p>
      </div>
    </Link>
  );
}
