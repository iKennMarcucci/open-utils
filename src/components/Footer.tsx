import Link from "next/link";
import { ShieldCheck, Scale } from "lucide-react";
import { Logo } from "@/components/Logo";
import { toolsInCategory } from "@/lib/seo/tools";
import { ALL_CATEGORIES } from "@/lib/seo/categories";
import { GithubIcon } from "@/components/GithubIcon";
import { REPO_URL } from "@/lib/seo/site";

/**
 * A Server Component: it renders on every page, which makes it the site's one
 * complete, crawlable link set — the sidebar's category flyouts are behind
 * hover/JS, so the footer is where every tool and category link is guaranteed to
 * be in the initial HTML. Grouped by category, derived entirely from the single
 * source, so a new tool appears here automatically.
 */
export function Footer() {
  return (
    <footer className="border-t border-border bg-background-elevated">
      <div className="mx-auto w-full max-w-6xl px-6 py-10 md:px-10">
        <nav aria-label="Todas las herramientas">
          <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-3">
            {ALL_CATEGORIES.map((category) => (
              <div key={category.id}>
                <h2 className="mb-3">
                  <Link
                    href={`/${category.id}`}
                    className="ou-label hover:text-foreground transition-colors"
                  >
                    {category.label}
                  </Link>
                </h2>
                <ul className="space-y-2.5">
                  {toolsInCategory(category.id).map((tool) => (
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
              </div>
            ))}
          </div>
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
            <Link href="/privacidad" className="ou-pill">
              <ShieldCheck className="h-3.5 w-3.5 text-success-text" />
              Privacidad
            </Link>
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
        <p className="mt-3 text-xs text-foreground-faint leading-relaxed">
          Las herramientas de vídeo usan{" "}
          <a
            href="https://github.com/ffmpegwasm/ffmpeg.wasm"
            target="_blank"
            rel="noopener noreferrer"
            className="underline-offset-4 hover:text-foreground hover:underline"
          >
            FFmpeg.wasm
          </a>
          , una compilación de FFmpeg con licencia{" "}
          <a
            href="https://www.ffmpeg.org/legal.html"
            target="_blank"
            rel="noopener noreferrer"
            className="underline-offset-4 hover:text-foreground hover:underline"
          >
            LGPL-2.1
          </a>{" "}
          que se ejecuta íntegramente en tu navegador.
        </p>
      </div>
    </footer>
  );
}
