import Link from "next/link";
import { ChevronRight, Check, ShieldCheck } from "lucide-react";
import { getTool, type ToolSeo } from "@/lib/seo/tools";
import { REPO_URL } from "@/lib/seo/site";

/**
 * The crawlable half of a tool page.
 *
 * Rendered by the route's Server Component, so all of this text is in the
 * initial HTML response — the interactive widget above it is client-only and
 * contributes nothing to the document a crawler receives. It sits *below* the
 * app on purpose: the two editors go `h-screen` once a file is loaded, so
 * anything placed above would push the canvas off-screen.
 *
 * The FAQ here and the FAQPage JSON-LD both read `tool.faqs`, so the markup
 * cannot disagree with what the page actually says.
 */
export function ToolPageContent({ slug }: { slug: string }) {
  const tool = getTool(slug);

  return (
    <section className="border-t border-border bg-background">
      <div className="mx-auto w-full max-w-6xl px-6 py-10 md:px-10">
        <Breadcrumb name={tool.name} />

        <h1 className="mt-6 text-3xl md:text-4xl font-semibold tracking-tight text-foreground text-balance">
          {tool.h1}
        </h1>

        <div className="mt-5 space-y-4">
          {tool.intro.map((p) => (
            <p key={p} className="text-base text-foreground-subtle leading-relaxed text-pretty">
              {p}
            </p>
          ))}
        </div>

        <span className="ou-badge mt-6">
          <ShieldCheck className="h-3 w-3 text-success-text" />
          Gratis · sin marca de agua · sin subir archivos
        </span>

        <h2 className="mt-14 mb-5 text-2xl font-semibold tracking-tight text-foreground">
          Qué puedes hacer con {tool.name}
        </h2>
        <ul className="grid gap-2.5 sm:grid-cols-2">
          {tool.features.map((f) => (
            <li key={f} className="flex items-start gap-2.5">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-success-text" />
              <span className="text-sm text-foreground-subtle leading-relaxed">{f}</span>
            </li>
          ))}
        </ul>

        <h2
          id="como-funciona"
          className="mt-14 mb-5 scroll-mt-8 text-2xl font-semibold tracking-tight text-foreground"
        >
          Cómo usar {tool.name} paso a paso
        </h2>
        <ol className="space-y-4">
          {tool.steps.map((step, i) => (
            <li key={step.name} className="flex gap-4">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-surface-strong text-xs font-semibold text-foreground">
                {i + 1}
              </span>
              <div className="min-w-0 pt-0.5">
                <h3 className="text-sm font-medium text-foreground">{step.name}</h3>
                <p className="mt-1 text-sm text-foreground-subtle leading-relaxed">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>

        {tool.sections.map((section) => (
          <div key={section.h2}>
            <h2 className="mt-14 mb-5 text-2xl font-semibold tracking-tight text-foreground">
              {section.h2}
            </h2>
            <div className="space-y-4">
              {section.paragraphs.map((p) => (
                <p key={p} className="text-base text-foreground-subtle leading-relaxed text-pretty">
                  {p}
                </p>
              ))}
            </div>
          </div>
        ))}

        <h2
          id="faq"
          className="mt-14 mb-5 scroll-mt-8 text-2xl font-semibold tracking-tight text-foreground"
        >
          Preguntas frecuentes
        </h2>
        <div className="divide-y divide-border border-y border-border">
          {tool.faqs.map((faq) => (
            <div key={faq.q} className="py-5">
              <h3 className="text-base font-medium text-foreground">{faq.q}</h3>
              <p className="mt-2 text-sm text-foreground-subtle leading-relaxed text-pretty">
                {faq.a}
              </p>
            </div>
          ))}
        </div>

        <RelatedTools tool={tool} />

        <p className="mt-10 text-sm text-foreground-faint leading-relaxed">
          Open Utils es un proyecto de código abierto con licencia MIT. Puedes revisar
          exactamente qué hace esta herramienta —y comprobar que tus archivos no se envían a
          ninguna parte— en{" "}
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-text underline-offset-4 hover:underline"
          >
            el repositorio en GitHub
          </a>
          .
        </p>
      </div>
    </section>
  );
}

function Breadcrumb({ name }: { name: string }) {
  return (
    <nav aria-label="Ruta de navegación">
      <ol className="flex items-center gap-1.5 text-xs text-foreground-faint">
        <li>
          <Link href="/" className="hover:text-foreground transition-colors">
            Inicio
          </Link>
        </li>
        <ChevronRight className="h-3 w-3" aria-hidden />
        <li aria-current="page" className="text-foreground-muted">
          {name}
        </li>
      </ol>
    </nav>
  );
}

/** Contextual internal links with descriptive anchor text. */
function RelatedTools({ tool }: { tool: ToolSeo }) {
  const related = tool.related.map(getTool);
  if (related.length === 0) return null;

  return (
    <>
      <h2 className="mt-14 mb-5 text-2xl font-semibold tracking-tight text-foreground">
        Otras herramientas que te pueden servir
      </h2>
      <div className="grid gap-3 sm:grid-cols-3">
        {related.map((r) => (
          <Link
            key={r.slug}
            href={`/${r.slug}`}
            className="ou-card-interactive rounded-panel p-4 group"
          >
            <p className="text-sm font-medium text-foreground group-hover:text-foreground">
              {r.name}
            </p>
            <p className="mt-1.5 text-xs text-foreground-faint leading-relaxed line-clamp-3">
              {r.description}
            </p>
          </Link>
        ))}
      </div>
    </>
  );
}
