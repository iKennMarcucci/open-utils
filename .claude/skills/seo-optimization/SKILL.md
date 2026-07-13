---
name: seo-optimization
description: >-
  Professional, end-to-end SEO and web positioning toolkit for real codebases.
  Use this skill WHENEVER the user wants to improve search rankings, "posicionar"
  o "posicionamiento web", run an SEO audit, fix technical SEO issues, write or
  optimize title tags and meta descriptions, add structured data / Schema.org /
  JSON-LD, generate a sitemap.xml or robots.txt, set up canonical or hreflang
  tags, implement Open Graph / Twitter Cards, improve Core Web Vitals (LCP, INP,
  CLS), optimize content for keywords or search intent, prepare a site for AI
  search / AI Overviews (GEO), or configure SEO in a Next.js, Astro, Vue/Nuxt,
  WordPress or plain HTML project. Trigger this even when the user only says
  "revisa el SEO de mi proyecto", "configura el SEO", "optimiza esta página" or
  mentions Google ranking, keywords, metaetiquetas, or indexing — do not rely on
  memory for SEO best practices, follow this skill.
---

# SEO Optimization

Skill profesional para auditar, implementar y mantener SEO técnico y de contenido
en proyectos web reales. Prioriza **cambios verificables en el código** por encima
de consejos genéricos: cada recomendación debe traducirse en un archivo, una
etiqueta o una configuración concreta.

## Principio rector

El SEO en 2026 se apoya en tres pilares que Google evalúa de forma combinada:

1. **Que te puedan rastrear e indexar** (technical SEO). Si Google no puede
   acceder, renderizar e indexar la página, nada más importa.
2. **Que entiendan de qué trata y por qué es confiable** (on-page, structured
   data, E-E-A-T). El contenido debe responder a una intención de búsqueda real.
3. **Que la experiencia sea buena** (Core Web Vitals, mobile-first, HTTPS).

A esto se suma un cuarto pilar emergente que ya NO es opcional: **visibilidad en
buscadores con IA** (AI Overviews, ChatGPT Search, Perplexity), conocido como GEO
(Generative Engine Optimization). Ver `references/ai-search-geo.md`.

## Flujo de trabajo

Sigue este orden. No saltes al paso 3 sin haber hecho el 1: implementar tácticas
sueltas sin diagnóstico produce trabajo desperdiciado.

### Paso 1 — Diagnóstico (auditoría)

Antes de tocar nada, entiende el estado actual. Identifica el stack del proyecto
(mira `package.json`, `next.config.*`, `astro.config.*`, `wp-config.php`,
o archivos `.html` sueltos) para saber DÓNDE viven las etiquetas y la config.

Ejecuta el auditor incluido sobre el proyecto o una URL en vivo:

```bash
# Auditar archivos HTML/plantillas locales (recursivo)
python scripts/seo_audit.py --path ./src

# Auditar una URL en producción (requiere red)
python scripts/seo_audit.py --url https://ejemplo.com

# Salida JSON para procesar programáticamente
python scripts/seo_audit.py --path . --json > seo-report.json
```

El script revisa title, meta description, encabezados, canonical, Open Graph,
JSON-LD, imágenes sin `alt`, robots meta, viewport y más. **Léelo tú y prioriza**:
no listes los 40 hallazgos de golpe. Agrupa por impacto (crítico / importante /
menor) y explica al usuario los 3-5 más urgentes primero.

Complementa con las herramientas oficiales (no las reemplaces): Google Search
Console (cobertura, rendimiento, Core Web Vitals de campo), PageSpeed Insights,
y el Rich Results Test para structured data. Consulta
`references/audit-checklist.md` para la lista completa.

### Paso 2 — Technical SEO (los cimientos)

Resuelve primero lo que bloquea rastreo/indexación. Detalles en
`references/technical-seo.md`. Resumen accionable:

- **robots.txt**: usa `assets/robots.txt.template`. NUNCA bloquees CSS/JS que
  Google necesita para renderizar. No uses robots.txt para "ocultar" páginas de
  la indexación (para eso está `noindex`).
- **sitemap.xml**: genera con `scripts/generate_sitemap.py`. Solo URLs
  canónicas, indexables y 200. Referéncialo en robots.txt.
- **Canonical tags**: una URL canónica autoreferencial por página. Evita
  duplicados por parámetros, mayúsculas, trailing slash, http/https.
- **Códigos de estado y redirecciones**: 301 para movimientos permanentes,
  cadenas de redirección eliminadas, 404 personalizado que devuelva 404 real.
- **Indexabilidad**: revisa que no haya `noindex` accidental en producción (un
  clásico: quedó el `noindex` del entorno de staging).

### Paso 3 — On-page SEO (por página)

Optimiza cada plantilla/página. Detalles en `references/on-page-seo.md`.
Usa `assets/meta-tags.template.html` como base. Reglas rápidas:

- **Title**: 50-60 caracteres, keyword principal al inicio, único por página,
  marca al final. Uno solo por página.
- **Meta description**: 140-160 caracteres, con propuesta de valor y llamada a
  la acción. No es factor de ranking directo pero afecta el CTR.
- **Un solo `<h1>`** por página, que refleje el tema. Jerarquía H2/H3 lógica.
- **URLs**: cortas, descriptivas, con guiones, en minúsculas, sin stop-words
  innecesarias ni IDs.
- **Enlazado interno**: enlaces contextuales con anchor text descriptivo hacia
  páginas relacionadas. Es de lo más subestimado y de mayor impacto.
- **Imágenes**: `alt` descriptivo, formato moderno (WebP/AVIF), `width`/`height`
  para evitar CLS, `loading="lazy"` salvo el LCP.

### Paso 4 — Structured Data (Schema.org / JSON-LD)

Ayuda a Google a entender la página y habilita rich results. Guía completa y
plantillas por tipo en `references/structured-data.md` y
`assets/structured-data-templates.json`. Reglas:

- Usa **JSON-LD** (recomendado por Google) inyectado en `<head>` o `<body>`.
- Elige el tipo correcto: `Article`/`BlogPosting`, `Product` + `Offer`,
  `LocalBusiness`, `FAQPage`, `BreadcrumbList`, `Organization`, `WebSite` +
  `SearchAction`, `Recipe`, `Event`, etc.
- El markup debe reflejar contenido **visible** en la página. Marcado engañoso =
  acción manual de Google.
- Valida SIEMPRE con `scripts/validate_structured_data.py` y con el Rich Results
  Test oficial antes de dar por cerrado.

### Paso 5 — Core Web Vitals y rendimiento

Experiencia de página. Detalles en `references/core-web-vitals.md`. Métricas 2026:

- **LCP** (carga) < 2.5s: optimiza la imagen/hero, `preload`, CDN, SSR/SSG.
- **INP** (interactividad, reemplazó a FID) < 200ms: reduce JS, divide tareas
  largas, evita hidration pesada.
- **CLS** (estabilidad) < 0.1: dimensiona imágenes/anuncios, reserva espacio,
  `font-display: swap` con fallback métrico.

### Paso 6 — Contenido e intención de búsqueda

El motor real del ranking. Detalles en `references/content-seo.md`.

- Investiga la **intención** detrás de cada keyword (informacional,
  navegacional, transaccional, comercial) y ajusta el formato.
- Construye **topic clusters**: una página pilar + páginas de apoyo enlazadas.
- Demuestra **E-E-A-T**: autoría real, fuentes, actualización, señales de
  confianza. Crítico en YMYL (salud, finanzas).

### Paso 7 — AI Search / GEO

Optimización para buscadores generativos. Detalles en
`references/ai-search-geo.md`. Resumen: contenido citable y estructurado,
respuestas directas, datos y fuentes verificables, `llms.txt`, y structured data
que las IAs puedan parsear.

### Paso 8 — Internacional y local (si aplica)

`hreflang` para multi-idioma/país, `LocalBusiness` + Google Business Profile,
NAP consistente. Detalles en `references/local-international-seo.md`.

## Especificidades por framework

El QUÉ es universal; el DÓNDE cambia según el stack. Antes de editar, identifica
el framework y consulta la sección correspondiente en
`references/framework-notes.md` (Next.js App/Pages Router, Astro, Nuxt/Vue,
WordPress, HTML estático). Puntos clave:

- **Next.js (App Router)**: usa la Metadata API (`export const metadata` /
  `generateMetadata`), `app/sitemap.ts`, `app/robots.ts`, y componente `<Script>`
  para JSON-LD. No pongas `<title>` manual en el JSX.
- **Astro**: metadatos en el frontmatter del layout, integración `@astrojs/sitemap`.
- **WordPress**: normalmente vía Yoast/RankMath; edita plantillas del theme para
  lo que el plugin no cubra.
- **HTML estático**: edita el `<head>` directamente; genera sitemap con el script.

## Reglas de oro (qué NO hacer)

Estas prácticas causan penalizaciones o pérdida de tráfico. Nunca las apliques ni
las recomiendes:

- **No** hagas keyword stuffing ni "cloaking" (mostrar algo distinto a Google).
- **No** compres enlaces ni participes en granjas de enlaces (link schemes).
- **No** generes contenido masivo de baja calidad solo para rankear (spam de
  contenido escalado — penalizado desde el Helpful Content System).
- **No** uses texto oculto, redirecciones engañosas ni doorway pages.
- **No** marques con structured data contenido que no está visible en la página.
- **No** prometas posiciones garantizadas ni resultados en X días: el SEO es
  probabilístico y depende de competencia, autoridad y tiempo.

## Entrega

Al terminar una intervención, deja al usuario: (1) un resumen priorizado de lo
cambiado, (2) los archivos concretos modificados/creados, y (3) un checklist de
verificación post-deploy (validar en Rich Results Test, reenviar sitemap en
Search Console, revisar Core Web Vitals a los pocos días). El SEO se mide en
semanas: fija expectativas realistas.

## Índice de referencias

| Archivo | Cuándo leerlo |
|---|---|
| `references/technical-seo.md` | Rastreo, indexación, robots, sitemap, canonical, redirecciones |
| `references/on-page-seo.md` | Titles, metas, encabezados, URLs, enlazado, imágenes |
| `references/structured-data.md` | Schema.org / JSON-LD por tipo, con ejemplos |
| `references/core-web-vitals.md` | LCP, INP, CLS y rendimiento |
| `references/content-seo.md` | Keywords, intención, topic clusters, E-E-A-T |
| `references/ai-search-geo.md` | Optimización para AI Overviews y buscadores generativos |
| `references/local-international-seo.md` | hreflang, local SEO, Google Business Profile |
| `references/framework-notes.md` | Cómo aplicar todo en Next.js, Astro, Nuxt, WordPress, HTML |
| `references/audit-checklist.md` | Checklist completo de auditoría |
