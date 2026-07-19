import Link from "next/link";
import { ChevronRight, ShieldCheck } from "lucide-react";
import { ALL_CATEGORIES } from "@/lib/seo/categories";
import type { CategoryWithTools } from "@/lib/seo/category-tools";
import { CATEGORY_VISUALS } from "@/lib/catalog";
import { ToolCard } from "@/components/ToolCard";

/**
 * The crawlable category landing page: a real <h1>, real prose and a grid of the
 * category's tools, all server-rendered (no client-only widget), so everything a
 * crawler needs is in the initial HTML. Content comes from the single source in
 * `categories.ts` + `tools.ts`.
 */
export function CategoryView({ category }: { category: CategoryWithTools }) {
  const { icon: Icon, accent } = CATEGORY_VISUALS[category.id];
  const others = ALL_CATEGORIES.filter((c) => c.id !== category.id);

  return (
    <main className="w-full p-4 sm:p-6">
      <nav aria-label="Ruta de navegación">
        <ol className="flex items-center gap-1.5 text-xs text-foreground-faint">
          <li>
            <Link href="/" className="hover:text-foreground transition-colors">
              Inicio
            </Link>
          </li>
          <ChevronRight className="h-3 w-3" aria-hidden />
          <li aria-current="page" className="text-foreground-muted">
            {category.label}
          </li>
        </ol>
      </nav>

      <header className="mt-6 mb-10 md:mb-12">
        <div className="flex items-center gap-3">
          <span
            className="flex h-11 w-11 items-center justify-center rounded-control border border-border bg-surface-strong"
            style={{ color: accent }}
          >
            <Icon className="h-5 w-5" />
          </span>
          <span className="ou-label">{category.tools.length} herramientas</span>
        </div>

        <h1 className="mt-5 text-4xl md:text-5xl font-semibold tracking-tight text-foreground text-balance">
          {category.h1}
        </h1>

        <div className="mt-4 max-w-2xl space-y-4">
          {category.intro.map((p) => (
            <p key={p} className="text-base md:text-lg text-foreground-subtle leading-relaxed text-pretty">
              {p}
            </p>
          ))}
        </div>

        <span className="ou-badge mt-6">
          <ShieldCheck className="h-3 w-3 text-success-text" />
          Gratis · sin marca de agua · sin subir archivos
        </span>
      </header>

      <h2 className="sr-only">Herramientas de {category.label}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[minmax(180px,auto)]">
        {category.tools.map((tool) => (
          <ToolCard key={tool.slug} tool={tool} />
        ))}
      </div>

      {/* Internal links to the sibling categories. */}
      <h2 className="mt-14 mb-5 text-2xl font-semibold tracking-tight text-foreground">
        Otras categorías
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {others.map((c) => (
          <Link
            key={c.id}
            href={`/${c.id}`}
            className="ou-card-interactive rounded-panel p-5 group"
          >
            <p className="text-base font-medium text-foreground">{c.label}</p>
            <p className="mt-1.5 text-sm text-foreground-faint leading-relaxed">{c.tagline}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
