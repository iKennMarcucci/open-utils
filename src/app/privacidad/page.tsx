import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, ShieldCheck, EyeOff, BarChart3, Lock } from "lucide-react";
import { baseOpenGraph } from "@/lib/seo/metadata";
import { SITE_NAME, REPO_URL, absoluteUrl } from "@/lib/seo/site";

const TITLE = "Privacidad: tus archivos nunca salen de tu navegador | Open Utils";
const DESCRIPTION =
  "Cómo trata Open Utils tus datos: todo lo que procesas (archivos y texto) se queda en tu navegador y no se sube a ningún servidor. Solo medimos visitas y rendimiento de forma anónima.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: absoluteUrl("/privacidad") },
  openGraph: {
    ...baseOpenGraph,
    title: TITLE,
    description: DESCRIPTION,
    url: absoluteUrl("/privacidad"),
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

export default function PrivacyPage() {
  return (
    <div className="w-full min-h-screen">
      <div className="mx-auto w-full max-w-3xl px-6 py-14 md:px-10 md:py-20">
        <nav aria-label="Ruta de navegación">
          <ol className="flex items-center gap-1.5 text-xs text-foreground-faint">
            <li>
              <Link href="/" className="hover:text-foreground transition-colors">
                Inicio
              </Link>
            </li>
            <ChevronRight className="h-3 w-3" aria-hidden />
            <li aria-current="page" className="text-foreground-muted">
              Privacidad
            </li>
          </ol>
        </nav>

        <h1 className="mt-6 text-3xl md:text-4xl font-semibold tracking-tight text-foreground text-balance">
          Tus archivos y tus datos nunca salen de tu navegador
        </h1>
        <p className="mt-5 text-base text-foreground-subtle leading-relaxed text-pretty">
          {SITE_NAME} está pensado para que puedas trabajar con material sensible —una respuesta de
          API, un PDF con datos de clientes, una foto personal— sin que salga de tu equipo. Esta
          página explica, sin letra pequeña, qué se queda contigo y qué medimos.
        </p>

        {/* What never leaves */}
        <div className="mt-10 rounded-panel border border-success/30 bg-success/5 p-5 md:p-6">
          <div className="flex items-center gap-2.5">
            <EyeOff className="h-5 w-5 shrink-0 text-success-text" />
            <h2 className="text-lg font-semibold text-foreground">
              Lo que <span className="text-success-text">nunca</span> sale de tu dispositivo
            </h2>
          </div>
          <p className="mt-3 text-sm text-foreground-subtle leading-relaxed">
            Todo lo que introduces o procesas. Sin excepción:
          </p>
          <ul className="mt-3 space-y-2 text-sm text-foreground-subtle">
            {[
              "Los archivos que abres: PDF, imágenes, vídeo, ZIP y cualquier otro.",
              "El texto y los datos que pegas: JSON, tokens JWT, Base64, YAML, especificaciones OpenAPI…",
              "El resultado de cada herramienta: nada de eso se envía ni se guarda en ningún servidor.",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2.5">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success-text" />
                <span className="leading-relaxed">{t}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-foreground-subtle leading-relaxed">
            Cada herramienta se ejecuta íntegramente en tu navegador (con JavaScript y WebAssembly).
            Puedes comprobarlo tú mismo: abre la pestaña <strong>Red</strong> de las herramientas de
            desarrollo mientras usas cualquier utilidad y verás que tu contenido no se sube a ninguna
            parte. Y como el código es abierto (MIT), puedes revisar exactamente qué hace en{" "}
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

        {/* What we do measure */}
        <h2 className="mt-12 flex items-center gap-2.5 text-2xl font-semibold tracking-tight text-foreground">
          <BarChart3 className="h-5 w-5 text-accent-text" />
          Lo que sí medimos, de forma anónima
        </h2>
        <p className="mt-4 text-base text-foreground-subtle leading-relaxed text-pretty">
          Para saber qué herramientas resultan útiles y para que el sitio siga siendo rápido, usamos
          las analíticas anónimas de Vercel (Vercel Analytics y Speed Insights). Es telemetría de uso
          agregada, y conviene ser explícito sobre su alcance:
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-panel border border-border bg-surface/50 p-5">
            <p className="text-sm font-medium text-foreground">Qué recoge</p>
            <ul className="mt-2.5 space-y-1.5 text-sm text-foreground-subtle">
              <li>· Qué páginas se visitan.</li>
              <li>· País y tipo de dispositivo aproximados.</li>
              <li>· Métricas de rendimiento (Core Web Vitals: LCP, INP, CLS).</li>
            </ul>
          </div>
          <div className="rounded-panel border border-border bg-surface/50 p-5">
            <p className="text-sm font-medium text-foreground">Qué NO recoge</p>
            <ul className="mt-2.5 space-y-1.5 text-sm text-foreground-subtle">
              <li>· El contenido que procesas: tus archivos y tu texto, nunca.</li>
              <li>· Datos personales que te identifiquen.</li>
              <li>· Cookies de seguimiento ni perfilado entre webs.</li>
            </ul>
          </div>
        </div>

        {/* Technical guarantee */}
        <h2 className="mt-12 flex items-center gap-2.5 text-2xl font-semibold tracking-tight text-foreground">
          <Lock className="h-5 w-5 text-accent-text" />
          Una garantía técnica, no solo una promesa
        </h2>
        <p className="mt-4 text-base text-foreground-subtle leading-relaxed text-pretty">
          El sitio declara una <strong>Content-Security-Policy</strong> con{" "}
          <code className="font-mono text-sm text-foreground">connect-src &apos;self&apos;</code>: el
          propio navegador bloquea cualquier intento de enviar datos a un tercero. Las analíticas de
          Vercel se sirven desde el mismo dominio, así que no se contacta con ningún servidor externo.
          Dicho de otra forma: aunque una dependencia intentara filtrar algo, el navegador no la
          dejaría.
        </p>

        <div className="mt-10 rounded-panel border border-border bg-surface/30 p-5 md:p-6">
          <p className="text-sm text-foreground-subtle leading-relaxed">
            <strong className="text-foreground">En resumen:</strong> lo que subes o escribes se queda
            en tu equipo. Solo sabemos, de forma anónima y agregada, que una página se visitó y cómo
            rindió — nunca <em>qué</em> hiciste con tus datos.
          </p>
        </div>

        <p className="mt-10 text-sm text-foreground-faint leading-relaxed">
          ¿Dudas o sugerencias? El proyecto es de código abierto; puedes abrir un tema en{" "}
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
    </div>
  );
}
