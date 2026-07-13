# Technical SEO

Los cimientos. Si Google no puede rastrear, renderizar e indexar, el resto no
sirve. Trabaja estos puntos en orden de bloqueo.

## Tabla de contenidos
1. Rastreo (crawling)
2. Indexación
3. robots.txt
4. Sitemaps
5. Canonicalización
6. Redirecciones y códigos de estado
7. Estructura de URLs
8. Renderizado (JS SEO)
9. HTTPS y seguridad
10. Paginación y navegación facetada

## 1. Rastreo (crawling)

Googlebot descubre páginas siguiendo enlaces y leyendo sitemaps. Verifica:

- **Enlaces rastreables**: usa `<a href="/ruta">`. Los enlaces generados solo con
  JS al hacer click (onClick sin href) pueden no rastrearse.
- **Presupuesto de rastreo (crawl budget)**: relevante en sitios grandes (>10k
  URLs). No malgastes rastreo en parámetros infinitos, filtros, o páginas basura.
- **No bloquees recursos de render**: CSS y JS deben ser accesibles a Googlebot,
  o la página se indexa "rota".

## 2. Indexación

Rastreo ≠ indexación. Una página rastreada puede no indexarse.

- **Meta robots**: `<meta name="robots" content="index, follow">` para indexar.
  `noindex` para excluir. El error más común y grave: dejar `noindex` de staging
  en producción. Audítalo siempre antes de dar por terminado.
- **X-Robots-Tag** (cabecera HTTP): útil para PDFs, imágenes y no-HTML.
- **Cobertura en Search Console**: revisa "Páginas" para ver por qué se excluyen
  URLs (duplicadas, noindex, redirección, error de servidor, "rastreada no
  indexada", "detectada no indexada").

Directivas frecuentes en `content`:
- `index, follow` — indexar y seguir enlaces (default).
- `noindex, follow` — no indexar pero seguir enlaces (ej: paginación profunda).
- `noindex, nofollow` — no indexar ni seguir.
- `max-image-preview:large`, `max-snippet:-1` — controlan previews (útil para GEO).

## 3. robots.txt

Vive en la raíz: `https://dominio.com/robots.txt`. Controla el RASTREO, no la
indexación. Una URL bloqueada en robots.txt puede seguir apareciendo en resultados
sin snippet si tiene enlaces externos. Para excluir de verdad, usa `noindex` (y no
la bloquees en robots.txt, o Google no verá el noindex).

Plantilla base en `assets/robots.txt.template`. Estructura:

```
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /carrito/
Disallow: /*?sessionid=

Sitemap: https://dominio.com/sitemap.xml
```

Errores a evitar:
- `Disallow: /` en producción (bloquea todo el sitio). Revísalo SIEMPRE.
- Bloquear `/wp-content/`, `/_next/`, `/assets/` con CSS/JS necesarios.
- Poner `noindex` dentro de robots.txt (Google dejó de soportarlo en 2019).

## 4. Sitemaps

Un `sitemap.xml` lista las URLs que quieres que Google conozca. No garantiza
indexación pero ayuda al descubrimiento, sobre todo en sitios nuevos o grandes.

Reglas:
- Solo URLs **canónicas, indexables (index) y con estado 200**. Nada de noindex,
  redirecciones ni 404.
- Máx. 50.000 URLs o 50 MB por archivo; usa un sitemap índice si superas eso.
- Incluye `<lastmod>` real (fecha de última modificación) — Google lo usa.
- Referéncialo en robots.txt y envíalo en Search Console.

Genera con `scripts/generate_sitemap.py`. Ejemplo de entrada mínima:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://dominio.com/</loc>
    <lastmod>2026-01-15</lastmod>
  </url>
</urlset>
```

Para sitios grandes crea sitemaps especializados (páginas, blog, productos,
imágenes, vídeo) y agrúpalos en un sitemap índice.

## 5. Canonicalización

Le dice a Google cuál es la versión "oficial" cuando hay contenido duplicado o
accesible por varias URLs.

- `<link rel="canonical" href="https://dominio.com/pagina">` en el `<head>`.
- **Autoreferencial**: cada página apunta a sí misma (a su URL canónica limpia).
- Usa URL **absoluta**, no relativa.
- Causas típicas de duplicados a canonicalizar: parámetros de tracking
  (`?utm_...`), orden/mayúsculas de parámetros, trailing slash, `www` vs no-www,
  http vs https, versiones de impresión, paginación.
- Elige una forma única de dominio (con o sin www, con o sin trailing slash) y
  redirige 301 el resto. Sé consistente en enlaces internos y sitemap.

## 6. Redirecciones y códigos de estado

- **301** (permanente): para movimientos definitivos. Transfiere señales de
  ranking. Úsalo en migraciones, cambios de URL, consolidaciones.
- **302** (temporal): solo para movimientos temporales reales.
- **Cadenas de redirección**: A→B→C desperdicia rastreo y velocidad. Aplana a A→C.
- **404 vs 410**: 404 "no encontrado", 410 "eliminado permanentemente". Un 404
  debe devolver realmente el código 404 (los "soft 404" que devuelven 200 con
  página de error confunden a Google).
- **Página 404 personalizada**: útil para el usuario, pero debe devolver 404 real.

## 7. Estructura de URLs

- Cortas, legibles y descriptivas: `/blog/seo-tecnico` mejor que `/p?id=8837`.
- Minúsculas, palabras separadas por guiones (`-`), sin espacios ni caracteres
  especiales ni mayúsculas.
- Jerarquía lógica que refleje la arquitectura: `/categoria/subcategoria/producto`.
- Evita profundidad excesiva (idealmente ≤3-4 niveles desde la home).
- Mantén las URLs estables; cambiarlas obliga a redirigir y arriesga rankings.

## 8. Renderizado (JavaScript SEO)

Google renderiza JS, pero con coste y retraso. Para apps SPA/React/Vue:

- Prefiere **SSR** (server-side rendering) o **SSG** (static) sobre CSR puro para
  contenido indexable. Con CSR puro, Google puede tardar o fallar en indexar.
- Asegura que el contenido crítico y los metadatos estén en el HTML inicial o se
  generen en el servidor.
- Verifica con la herramienta "Inspección de URL" de Search Console → "Ver página
  rastreada" para confirmar qué ve Googlebot.
- Metadatos dinámicos: en frameworks modernos usa su API oficial (Metadata API de
  Next, `useHead` en Nuxt, etc.), no manipules el `<head>` a mano tras la carga.

## 9. HTTPS y seguridad

- HTTPS es factor de ranking (leve pero real) y requisito para muchas features.
- Certificado válido, sin contenido mixto (recursos http en página https).
- Redirige todo http → https con 301, y unifica www/no-www.
- HSTS recomendado.

## 10. Paginación y navegación facetada

- **Paginación**: cada página paginada con su URL canónica autoreferencial. Ya no
  se usa `rel=next/prev` (Google lo deprecó), pero mantén enlaces `<a>` entre
  páginas para rastreo. Asegura enlaces a las páginas de detalle desde el listado.
- **Faceted navigation** (filtros de e-commerce): puede generar millones de URLs
  duplicadas. Estrategia: canonical a la versión sin filtro, `noindex` en
  combinaciones de filtro de bajo valor, o bloqueo por robots de parámetros que no
  aporten. Decide qué combinaciones SÍ merecen indexarse (ej: "zapatillas rojas").
