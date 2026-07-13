import type { Metadata } from "next";
import Link from "next/link";
import { ALL_TOOLS } from "@/lib/seo/tools";

export const metadata: Metadata = {
  title: "Página no encontrada | Open Utils",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-20 md:px-10">
      <p className="ou-label">Error 404</p>
      <h1 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
        Esta página no existe
      </h1>
      <p className="mt-4 text-base text-foreground-subtle leading-relaxed">
        El enlace que has seguido no lleva a ninguna parte, o la herramienta ha cambiado de
        dirección. Estas son todas las herramientas disponibles:
      </p>

      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        {ALL_TOOLS.map((tool) => (
          <li key={tool.slug}>
            <Link
              href={`/${tool.slug}`}
              className="ou-card-interactive block rounded-panel p-4"
            >
              <p className="text-sm font-medium text-foreground">{tool.name}</p>
              <p className="mt-1 text-xs text-foreground-faint leading-relaxed line-clamp-2">
                {tool.description}
              </p>
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-8 text-sm text-foreground-faint">
        O vuelve a{" "}
        <Link href="/" className="text-accent-text underline-offset-4 hover:underline">
          la página de inicio
        </Link>
        .
      </p>
    </main>
  );
}
