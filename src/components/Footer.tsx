"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, Scale } from "lucide-react";
import { Logo } from "@/components/Logo";

export const REPO_URL = "https://github.com/iKennMarcucci/open-utils";

/** lucide-react v1 dropped brand icons, so the GitHub mark ships as its own glyph. */
export function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.2 11.39.6.11.82-.26.82-.58l-.01-2.03c-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6.01 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.62-5.49 5.92.43.37.82 1.1.82 2.22l-.01 3.29c0 .32.21.7.82.58A12.01 12.01 0 0 0 24 12.5C24 5.87 18.63.5 12 .5Z" />
    </svg>
  );
}

/**
 * Routes that render an app-like full-viewport canvas (`h-screen`, own scroll).
 * A footer underneath them would add a second scroll region, so we skip it.
 */
const FULL_CANVAS_ROUTES = ["/pdf-editor", "/image-editor"];

export function Footer() {
  const pathname = usePathname();

  if (FULL_CANVAS_ROUTES.includes(pathname)) return null;

  return (
    <footer className="border-t border-border bg-background-elevated">
      <div className="mx-auto w-full max-w-6xl px-6 py-8 md:px-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
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
            <Link
              href={`${REPO_URL}/blob/main/LICENSE`}
              target="_blank"
              rel="noopener noreferrer"
              className="ou-pill"
            >
              <Scale className="h-3.5 w-3.5" />
              Licencia MIT
            </Link>
            <Link
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="ou-btn ou-btn-secondary"
            >
              <GithubIcon className="h-4 w-4" />
              Ver en GitHub
            </Link>
          </div>
        </div>

        <p className="mt-6 border-t border-border pt-6 text-xs text-foreground-faint">
          Proyecto de código abierto. Contribuciones, reportes de errores e ideas son
          bienvenidos en{" "}
          <Link
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-text underline-offset-4 hover:underline"
          >
            GitHub
          </Link>
          .
        </p>
      </div>
    </footer>
  );
}
