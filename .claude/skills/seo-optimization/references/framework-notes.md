# Notas por framework

El QUÉ del SEO es universal; el DÓNDE cambia según el stack. Identifica el
framework (mira `package.json`, archivos de config o extensiones de archivo) y usa
la sección correspondiente. Verifica siempre la versión: las APIs cambian.

## Next.js (App Router, v13+)

**Metadatos**: usa la Metadata API, no `<title>` manual en el JSX.

```tsx
// app/pagina/page.tsx  (estático)
export const metadata = {
  title: "Título de la página | Marca",
  description: "Descripción de 140-160 caracteres.",
  alternates: { canonical: "https://dominio.com/pagina" },
  openGraph: {
    title: "Título para compartir",
    description: "Descripción social.",
    images: ["https://dominio.com/og.jpg"],
    url: "https://dominio.com/pagina",
    type: "article",
  },
  twitter: { card: "summary_large_image" },
};

// Metadatos dinámicos:
export async function generateMetadata({ params }) {
  const data = await getData(params.slug);
  return { title: data.title, description: data.excerpt };
}
```

**Sitemap**: `app/sitemap.ts` exportando una función que devuelve el array de URLs.
**robots**: `app/robots.ts` exportando la config de robots.
**JSON-LD**: inyéctalo con un `<script type="application/ld+json">` en el componente
(usa `dangerouslySetInnerHTML` con el JSON stringificado, o el componente `Script`).
**Rendimiento**: usa `next/image` (optimiza y evita CLS), `next/font` (evita FOUT),
Server Components por defecto y `dynamic import` para trocear JS.

### Next.js (Pages Router, legacy)
Metadatos con `next/head` (`<Head>`) dentro del componente de página. Sitemap y
robots suelen generarse con `getServerSideProps` en rutas API o paquetes como
`next-sitemap`.

## Astro

**Metadatos**: en el frontmatter del componente/layout, renderizados en el `<head>`.

```astro
---
const { title, description, canonical } = Astro.props;
---
<head>
  <title>{title}</title>
  <meta name="description" content={description}>
  <link rel="canonical" href={canonical}>
</head>
```

**Sitemap**: integración oficial `@astrojs/sitemap` (añádela en `astro.config.mjs`).
**Rendimiento**: Astro es de los mejores para Core Web Vitals por su enfoque
"islands / zero-JS por defecto". Aprovéchalo: hidrata solo lo imprescindible
(`client:load`, `client:visible`).
**JSON-LD**: inserta el `<script type="application/ld+json">` en el layout con
`set:html={JSON.stringify(data)}`.

## Nuxt / Vue

**Metadatos**: `useHead()` o `useSeoMeta()` en el componente (Nuxt 3).

```ts
useSeoMeta({
  title: "Título | Marca",
  description: "Descripción.",
  ogTitle: "Título social",
  ogImage: "https://dominio.com/og.jpg",
  twitterCard: "summary_large_image",
});
```

**Sitemap/robots**: módulo `@nuxtjs/sitemap` y `@nuxtjs/robots`.
**Rendimiento**: usa SSR/SSG (`nuxt generate` para estático), `<NuxtImg>` del
módulo de imagen, y lazy components.
**JSON-LD**: `useHead({ script: [{ type: 'application/ld+json', innerHTML: ... }] })`.

## WordPress

**Plugin SEO**: la mayoría del on-page se gestiona con **Yoast SEO** o **Rank
Math** (títulos, metas, sitemaps, robots, breadcrumbs, structured data básico,
Open Graph). Configúralos antes de tocar código.

Qué revisar/editar en el theme cuando el plugin no cubre algo:
- **Estructura de encabezados** en las plantillas (`single.php`, `page.php`): un
  solo H1, jerarquía correcta.
- **Permalinks**: Ajustes → Enlaces permanentes → estructura amigable
  (`/%postname%/`).
- **Imágenes**: fuerza WebP (plugin o CDN), alt en la biblioteca de medios,
  dimensiones correctas.
- **Core Web Vitals**: caché (WP Rocket, LiteSpeed), lazy load, minificación,
  limitar plugins pesados, un theme ligero.
- **Structured data avanzado**: los plugins cubren lo básico; para tipos
  específicos añade JSON-LD en el theme o con snippets.

Cuidado con: plugins duplicando funciones (dos plugins SEO chocan), temas que
generan HTML inflado, y páginas de archivo/tag/paginación indexables sin valor
(configura noindex donde toque desde el plugin).

## HTML estático / sin framework

Edita el `<head>` de cada `.html` directamente usando
`assets/meta-tags.template.html` como base. Genera el `sitemap.xml` con
`scripts/generate_sitemap.py` y crea `robots.txt` desde
`assets/robots.txt.template`. Para evitar repetir el `<head>` en cada archivo,
considera un pequeño sistema de plantillas o un generador de sitios estáticos
(SSG) si el sitio crece.

## Regla general para cualquier stack

1. Los metadatos deben salir en el **HTML inicial** (server-rendered), no
   inyectarse solo en cliente tras la carga.
2. Usa la **API oficial** del framework para el `<head>`; no manipules el DOM del
   head a mano.
3. Verifica el resultado con "Inspección de URL" en Search Console para confirmar
   qué ve Googlebot realmente.
