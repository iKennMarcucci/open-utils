import Link from "next/link";
import { ShieldCheck, Scale } from "lucide-react";
import { Logo } from "@/components/Logo";
import { ALL_TOOLS } from "@/lib/seo/tools";
import { GithubIcon } from "@/components/GithubIcon";
import { REPO_URL } from "@/lib/seo/site";

/**
 * A Server Component now (it was "use client" only to read the pathname and hide
 * itself on the editor routes). It renders on every page, which makes it the
 * site's one complete, crawlable link set: the sidebar derives four of its links
 * from `useState`, so half the tools never appear in the initial HTML there.
 */
export function Footer() {
  return (
    <footer className="border-t border-border bg-background-elevated">
      <div className="mx-auto w-full max-w-6xl px-6 py-10 md:px-10">
        <nav aria-label="Todas las herramientas">
          <h2 className="ou-label mb-4">Herramientas</h2>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-2.5 sm:grid-cols-3 lg:grid-cols-5">
            {ALL_TOOLS.map((tool) => (
              <li key={tool.slug}>
                <Link
                  href={`/${tool.slug}`}
                  className="text-sm text-foreground-subtle hover:text-foreground transition-colors"
                >
                  {tool.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-10 flex flex-col gap-6 border-t border-border pt-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Logo size={24} className="shrink-0" />
            <div className="leading-tight">
              <p className="text-sm font-medium text-foreground">Open Utils</p>
              <p className="text-xs text-foreground-faint">
                Software libre — hecho para ejecutarse en tu navegador.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="ou-badge">
              <ShieldCheck className="h-3 w-3 text-success-text" />
              100% local
            </span>
            <a
              href={`${REPO_URL}/blob/main/LICENSE`}
              target="_blank"
              rel="noopener noreferrer"
              className="ou-pill"
            >
              <Scale className="h-3.5 w-3.5" />
              Licencia MIT
            </a>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="ou-btn ou-btn-secondary"
            >
              <GithubIcon className="h-4 w-4" />
              Ver en GitHub
            </a>
          </div>
        </div>

        <p className="mt-6 border-t border-border pt-6 text-xs text-foreground-faint">
          Proyecto de código abierto. Contribuciones, reportes de errores e ideas son
          bienvenidos en{" "}
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-text underline-offset-4 hover:underline"
          >
            GitHub
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
