/**
 * SEO regression gate.
 *
 * Every tool page on this site earns its traffic from server-rendered content:
 * a unique title, one <h1>, real prose and JSON-LD, all present in the initial
 * HTML. That is fragile in exactly one way — it depends on `page.tsx` staying a
 * Server Component and on `src/lib/seo/tools.ts` staying in sync with what the
 * code actually does. This script fails the moment either drifts.
 *
 *   npm run seo:check              static checks (no server needed)
 *   npm run seo:check -- --live    also audits a running server (npm start)
 *
 * Read `AGENTS.md` for the rules this enforces and why they exist.
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const APP = join(ROOT, "src", "app");

const { TOOL_ORDER, TOOLS_SEO, HOME_FAQS } = await import(
  join(ROOT, "src", "lib", "seo", "tools.ts")
);

const problems = [];
const err = (where, msg, fix) => problems.push({ where, msg, fix });

const read = (p) => (existsSync(p) ? readFileSync(p, "utf8") : null);

// ── 1. Every tool has a route, and every tool route has a tool ───────────────
// A tool that exists in the code but not in TOOLS_SEO gets no title, no canonical
// and no JSON-LD — it is invisible. The reverse (data with no route) puts a 404
// in the sitemap.
const RESERVED = new Set(["favicon.ico"]);
const routeDirs = readdirSync(APP, { withFileTypes: true })
  .filter((d) => d.isDirectory() && !d.name.startsWith("_") && !RESERVED.has(d.name))
  .map((d) => d.name);

for (const slug of TOOL_ORDER) {
  if (!routeDirs.includes(slug)) {
    err(
      `tools.ts → "${slug}"`,
      "está en TOOL_ORDER pero no existe la carpeta de ruta.",
      `Crea src/app/${slug}/page.tsx, o quítalo de TOOL_ORDER (si no, el sitemap apunta a un 404).`
    );
  }
}

for (const dir of routeDirs) {
  const page = read(join(APP, dir, "page.tsx"));
  if (!page) continue;
  if (!TOOL_ORDER.includes(dir)) {
    err(
      `src/app/${dir}/`,
      "es una ruta con page.tsx pero no tiene entrada en TOOLS_SEO.",
      `Si es una herramienta, añádela a src/lib/seo/tools.ts y a TOOL_ORDER. Sin eso no tiene title, canonical, JSON-LD ni entra en el sitemap.`
    );
  }
}

// ── 2. The three-layer SSR pattern ──────────────────────────────────────────
// This is the whole game. A "use client" page.tsx cannot export metadata, and a
// dynamic(ssr:false) widget renders nothing into the HTML — which is exactly the
// state the site was in before: seven pages with no text and no title.
for (const slug of TOOL_ORDER) {
  const dirPath = join(APP, slug);
  if (!existsSync(dirPath)) continue;

  const page = read(join(dirPath, "page.tsx"));
  if (!page) {
    err(`src/app/${slug}/`, "falta page.tsx.", "Cada herramienta necesita su Server Component.");
    continue;
  }

  if (/^\s*["']use client["']/m.test(page)) {
    err(
      `src/app/${slug}/page.tsx`,
      'es "use client" — un Client Component NO puede exportar `metadata`.',
      "Quita el 'use client' y mueve el dynamic(ssr:false) a un wrapper cliente aparte."
    );
  }
  if (!/export const metadata/.test(page)) {
    err(
      `src/app/${slug}/page.tsx`,
      "no exporta `metadata` — la página heredaría el title de la home.",
      `Añade: export const metadata: Metadata = toolMetadata("${slug}");`
    );
  }
  if (!/<JsonLd/.test(page)) {
    err(`src/app/${slug}/page.tsx`, "no renderiza <JsonLd>.", `Añade <JsonLd data={toolGraph(getTool("${slug}"))} />.`);
  }
  if (!/<ToolPageContent/.test(page)) {
    err(
      `src/app/${slug}/page.tsx`,
      "no renderiza <ToolPageContent> — la página no tendría H1, texto ni FAQ indexables.",
      `Añade <ToolPageContent slug={"${slug}"} />.`
    );
  }

  // The ssr:false import must live in a client wrapper, never in page.tsx.
  if (/ssr:\s*false/.test(page)) {
    err(
      `src/app/${slug}/page.tsx`,
      "usa dynamic(ssr:false) directamente — Next 16 lo prohíbe en un Server Component.",
      "Muévelo a un archivo con 'use client' en la misma carpeta."
    );
  }
  const clients = readdirSync(dirPath).filter(
    (f) => f.endsWith("Client.tsx") || f.endsWith("client.tsx")
  );
  if (clients.length === 0) {
    err(`src/app/${slug}/`, "no hay wrapper cliente.", "El widget interactivo va en un <X>Client.tsx con 'use client'.");
  }

  if (!existsSync(join(dirPath, "opengraph-image.tsx"))) {
    err(
      `src/app/${slug}/`,
      "no tiene imagen Open Graph — al compartir el enlace sale una tarjeta gris.",
      "Copia el opengraph-image.tsx de otra herramienta (son 8 líneas)."
    );
  }
}

// ── 3. Content quality, per tool ────────────────────────────────────────────
const LIMITS = { title: [40, 65], description: [110, 170] };

for (const slug of TOOL_ORDER) {
  const t = TOOLS_SEO[slug];
  if (!t) continue;
  const at = `tools.ts → "${slug}"`;

  for (const [field, [min, max]] of Object.entries(LIMITS)) {
    const len = (t[field] ?? "").length;
    if (len < min || len > max) {
      err(
        at,
        `${field} tiene ${len} caracteres (recomendado ${min}-${max}).`,
        field === "title"
          ? "Google trunca los titles largos en el resultado de búsqueda."
          : "Una description fuera de rango se corta o se rellena sola, y baja el CTR."
      );
    }
  }

  if (!t.h1?.trim()) err(at, "no tiene H1.", "Cada página necesita un H1 único y descriptivo.");
  if (t.h1 === t.title) err(at, "el H1 es idéntico al title.", "Deben decir lo mismo con palabras distintas.");
  if ((t.faqs?.length ?? 0) < 3) {
    err(at, `solo tiene ${t.faqs?.length ?? 0} preguntas de FAQ (mínimo 3).`, "La FAQ es el texto que citan los buscadores con IA.");
  }
  if ((t.features?.length ?? 0) < 3) err(at, "menos de 3 features.", "Alimentan el featureList del JSON-LD y la lista visible.");
  if ((t.steps?.length ?? 0) < 2) err(at, "menos de 2 pasos.", "Alimentan el HowTo del JSON-LD.");
  if (!t.intro?.length) err(at, "no tiene intro.", "Es el primer párrafo indexable de la página.");

  for (const r of t.related ?? []) {
    if (!TOOLS_SEO[r]) err(at, `enlaza a "${r}", que no existe.`, "Corrige el slug en `related`.");
  }

  // Empty FAQ answers would produce FAQPage markup with no visible counterpart.
  for (const f of t.faqs ?? []) {
    if (!f.q?.trim() || !f.a?.trim()) {
      err(at, "hay una pregunta o respuesta de FAQ vacía.", "El JSON-LD copiaría un texto vacío: marcado engañoso.");
    }
  }
}

if (HOME_FAQS.length < 3) err("tools.ts → HOME_FAQS", "menos de 3 preguntas en la home.", "Añade más.");

// ── 4. Hygiene ──────────────────────────────────────────────────────────────
const srcFiles = [];
const walk = (dir) => {
  for (const d of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, d.name);
    if (d.isDirectory()) walk(p);
    else if (/\.(tsx?|mjs)$/.test(d.name)) srcFiles.push(p);
  }
};
walk(join(ROOT, "src"));

/** Comments legitimately *discuss* vercel.app and noindex; only code counts. */
const stripComments = (s) =>
  s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "").replace(/\{\/\*[\s\S]*?\*\/\}/g, "");

for (const file of srcFiles) {
  const code = stripComments(readFileSync(file, "utf8"));
  const rel = file.replace(ROOT + "/", "");

  // A hardcoded preview domain in a canonical/OG tag tells Google the wrong URL
  // is the real one.
  if (/vercel\.app/.test(code)) {
    err(rel, "contiene una URL de vercel.app hardcodeada.", "Usa SITE_URL / absoluteUrl() de src/lib/seo/site.ts.");
  }
  // The classic: a staging noindex shipped to production.
  if (/noindex/.test(code) && !/not-found/.test(rel)) {
    err(rel, "contiene `noindex`.", "Solo la 404 debe llevarlo. Un noindex accidental borra la página de Google.");
  }
}

// ── 5. Live audit (optional) ────────────────────────────────────────────────
if (process.argv.includes("--live")) {
  const base = process.env.SEO_BASE_URL ?? "http://localhost:3000";
  console.log(`\n🌐 Auditando ${base} …\n`);

  const strip = (html) =>
    html
      .replace(/<script[\s\S]*?<\/script>/g, " ")
      .replace(/<style[\s\S]*?<\/style>/g, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&[a-z]+;/g, " ")
      .replace(/\s+/g, " ");

  for (const slug of ["", ...TOOL_ORDER]) {
    const url = `${base}/${slug}`;
    let html;
    try {
      const res = await fetch(url);
      html = await res.text();
      if (!res.ok) {
        err(url, `devuelve ${res.status}.`, "La ruta debe responder 200.");
        continue;
      }
    } catch {
      err(url, "no responde. ¿Está el servidor levantado?", "Ejecuta `npm run build && npm start` antes de --live.");
      break;
    }

    const h1s = html.match(/<h1[^>]*>/g) ?? [];
    if (h1s.length !== 1) err(url, `tiene ${h1s.length} <h1> (debe haber exactamente 1).`, "Un solo H1 por página.");

    const visible = strip(html);
    const words = visible.trim().split(/\s+/).length;
    if (words < 300) {
      err(
        url,
        `solo ${words} palabras en el HTML del servidor.`,
        "Si la app es client-only, el contenido indexable debe venir de ToolPageContent. Esto huele a que se rompió el SSR."
      );
    }

    // The rule that makes the markup honest: every FAQ answer in the JSON-LD
    // must also be visible on the page. Marking up text the user can't see is
    // a manual-action offence.
    const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
    if (blocks.length === 0) err(url, "no tiene JSON-LD.", "Falta <JsonLd> en la página.");

    for (const [, raw] of blocks) {
      let data;
      try {
        data = JSON.parse(raw.replace(/\\u003c/g, "<"));
      } catch {
        err(url, "tiene un bloque JSON-LD que no parsea.", "Revisa el escapado.");
        continue;
      }
      for (const node of data["@graph"] ?? []) {
        if (node["@type"] !== "FAQPage") continue;
        for (const qa of node.mainEntity) {
          const q = qa.name.replace(/\s+/g, " ");
          const a = qa.acceptedAnswer.text.replace(/\s+/g, " ");
          if (!visible.includes(q) || !visible.includes(a)) {
            err(
              url,
              `la FAQ "${q.slice(0, 45)}…" está en el JSON-LD pero NO en el texto visible.`,
              "Marcado engañoso. La FAQ visible y el JSON-LD deben salir de la misma constante en tools.ts."
            );
          }
        }
      }
    }
  }
}

// ── Report ──────────────────────────────────────────────────────────────────
console.log("");
if (problems.length === 0) {
  const mode = process.argv.includes("--live") ? "estáticas + en vivo" : "estáticas";
  console.log(`✅ SEO OK — ${TOOL_ORDER.length} herramientas, comprobaciones ${mode}.`);
  console.log("   Recuerda: valida el structured data en el Rich Results Test antes de dar por cerrado un cambio.");
  process.exit(0);
}

console.log(`❌ ${problems.length} problema(s) de SEO:\n`);
for (const p of problems) {
  console.log(`  ${p.where}`);
  console.log(`    ${p.msg}`);
  console.log(`    → ${p.fix}\n`);
}
console.log("Guía completa en AGENTS.md, sección «SEO: obligatorio en todo cambio».");
process.exit(1);
