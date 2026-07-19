"use client";

import Link from "next/link";
import { motion, type Variants } from "motion/react";
import { ArrowUpRight, ShieldCheck, Zap, Code } from "lucide-react";
import { ALL_CATEGORIES } from "@/lib/seo/categories";
import { toolsInCategory } from "@/lib/seo/tools";
import { CATEGORY_VISUALS } from "@/lib/catalog";
import { ToolCard } from "@/components/ToolCard";

/**
 * The home. Every card and section is derived from the single source
 * (`categories.ts` + `tools.ts` + `catalog.tsx`) and grouped by category — there
 * is no hand-maintained list here, so a new tool appears the moment it is added
 * to `tools.ts`. The cards are real, statically-linked <a> tags: a crawler sees
 * every tool link in the initial HTML.
 */

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.04 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const HIGHLIGHTS = [
  { icon: ShieldCheck, label: "Privado", detail: "Nada se sube a un servidor" },
  { icon: Zap, label: "Instantáneo", detail: "Procesado en tu navegador" },
  { icon: Code, label: "Open source", detail: "Licencia MIT, auditable" },
];

export function HomeView() {
  return (
    <main className="w-full p-4 sm:p-6">
      {/* Header. Deliberately NOT animated from opacity:0 — the h1 is the LCP
          element, and fading it in makes LCP wait for framer-motion to hydrate. */}
      <header className="mb-10 md:mb-12">
        <span className="ou-badge mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-success-text" />
          100% local · privado
        </span>
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-foreground text-balance">
          Utilidades de archivos que funcionan en tu navegador, sin subir nada
        </h1>
        <p className="mt-4 max-w-2xl text-base md:text-lg text-foreground-subtle text-pretty">
          Edita, convierte, une y divide PDF, imágenes y video, y trabaja con JSON y Base64,
          sin registrarte y sin que tus archivos salgan de tu equipo. Gratis, sin marca de
          agua y de código abierto.
        </p>
      </header>

      <h2 className="sr-only">Herramientas disponibles por categoría</h2>

      <div className="space-y-12">
        {ALL_CATEGORIES.map((category) => {
          const tools = toolsInCategory(category.id);
          const { accent } = CATEGORY_VISUALS[category.id];

          return (
            <section key={category.id}>
              {/* Category header links to the category landing page. */}
              <div className="mb-4 flex items-end justify-between gap-4">
                <div className="min-w-0">
                  <span className="inline-flex items-center gap-1.5 ou-label">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accent }} />
                    {category.label}
                  </span>
                  <p className="mt-1 text-sm text-foreground-faint">{category.tagline}</p>
                </div>
                <Link
                  href={`/${category.id}`}
                  className="group flex shrink-0 items-center gap-1 text-sm font-medium text-foreground-muted hover:text-foreground transition-colors"
                >
                  Ver todo
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </div>

              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[minmax(180px,auto)]"
              >
                {tools.map((tool) => (
                  <motion.div key={tool.slug} variants={item}>
                    <ToolCard tool={tool} />
                  </motion.div>
                ))}
              </motion.div>
            </section>
          );
        })}
      </div>

      {/* Trust strip */}
      <div className="mt-12 grid gap-3 sm:grid-cols-3">
        {HIGHLIGHTS.map(({ icon: Icon, label, detail }) => (
          <div key={label} className="ou-card rounded-panel p-5 flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control border border-border bg-surface-strong text-foreground-muted">
              <Icon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">{label}</p>
              <p className="text-xs text-foreground-faint leading-snug">{detail}</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
