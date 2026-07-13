# Checklist de auditoría SEO

Lista de verificación completa. Úsala tras ejecutar `scripts/seo_audit.py` para no
dejar cabos sueltos. Marca por prioridad: 🔴 crítico, 🟠 importante, 🟡 menor.

## Indexación y rastreo

- 🔴 ¿El sitio es indexable? (sin `noindex` accidental en producción)
- 🔴 ¿robots.txt no bloquea contenido ni recursos CSS/JS críticos?
- 🔴 ¿Existe y es válido el `sitemap.xml`? ¿Está en robots.txt y en Search Console?
- 🔴 ¿El sitemap solo contiene URLs canónicas, indexables y 200?
- 🟠 ¿Search Console reporta errores de cobertura? (rastreadas no indexadas, etc.)
- 🟠 ¿Hay páginas huérfanas sin enlaces internos?
- 🟡 ¿Se gasta crawl budget en parámetros/filtros basura?

## Canonicalización y duplicados

- 🔴 ¿Cada página tiene canonical autoreferencial y absoluto?
- 🔴 ¿Una sola forma de dominio (www/no-www, http/https, trailing slash)?
- 🟠 ¿Parámetros de URL (utm, orden, filtros) canonicalizados o controlados?
- 🟠 ¿Contenido duplicado entre páginas resuelto?

## On-page

- 🔴 ¿Title único, 50-60 car., con keyword y marca, en cada página?
- 🟠 ¿Meta description única, 140-160 car., persuasiva, en cada página?
- 🔴 ¿Un solo H1 por página y jerarquía de encabezados lógica?
- 🟠 ¿URLs limpias, descriptivas, en minúsculas y con guiones?
- 🟠 ¿Enlazado interno contextual con anchor text descriptivo?
- 🟠 ¿Imágenes con `alt`, formato moderno y dimensiones?
- 🟡 ¿Open Graph y Twitter Cards en cada página?
- 🟡 ¿`<meta name="keywords">` eliminado (obsoleto)?

## Structured data

- 🟠 ¿JSON-LD presente y del tipo correcto por página?
- 🔴 ¿El markup refleja contenido visible (sin datos falsos)?
- 🟠 ¿Valida en Rich Results Test sin errores?
- 🟡 ¿Organization + WebSite en la home?

## Core Web Vitals y rendimiento

- 🔴 ¿LCP ≤ 2.5s en datos de campo?
- 🟠 ¿INP ≤ 200ms?
- 🟠 ¿CLS ≤ 0.1?
- 🟠 ¿Imagen LCP optimizada, sin lazy, con prioridad?
- 🟠 ¿Imágenes con width/height y formato moderno?
- 🟡 ¿JS/CSS minificado, diferido y troceado?
- 🟡 ¿CDN y caché configurados; TTFB bajo?

## Mobile y experiencia

- 🔴 ¿`<meta name="viewport">` presente?
- 🔴 ¿Diseño responsive y usable en móvil (mobile-first)?
- 🟠 ¿HTTPS en todo el sitio, sin contenido mixto?
- 🟡 ¿Sin intersticiales intrusivos que tapen el contenido?

## Contenido

- 🟠 ¿El contenido satisface la intención de búsqueda de su keyword objetivo?
- 🟠 ¿Cobertura temática suficiente frente a la competencia?
- 🟠 ¿Señales de E-E-A-T (autoría, fuentes, confianza)?
- 🟡 ¿Contenido actualizado; obsoleto podado o consolidado?
- 🟡 ¿Sin contenido duplicado, fino o "escalado" de baja calidad?

## Internacional / local (si aplica)

- 🟠 ¿`hreflang` recíproco, autoreferencial y con `x-default`?
- 🟠 ¿Google Business Profile completo y verificado?
- 🟠 ¿NAP consistente en web, GBP y directorios?
- 🟡 ¿`LocalBusiness` structured data con dirección, geo y horarios?

## AI Search / GEO (si aplica)

- 🟡 ¿Contenido con estructura pregunta-respuesta y respuestas directas?
- 🟡 ¿Datos/fuentes citables?
- 🟡 ¿`llms.txt` considerado?
- 🟡 ¿Política de bots de IA decidida conscientemente en robots.txt?

## Redirecciones y errores

- 🟠 ¿Redirecciones 301 correctas, sin cadenas ni bucles?
- 🟠 ¿Los 404 devuelven código 404 real (sin soft 404)?
- 🟡 ¿Enlaces internos rotos corregidos?

## Herramientas oficiales de verificación

- **Google Search Console**: cobertura, rendimiento, Core Web Vitals, sitemaps,
  inspección de URL, mejoras de structured data.
- **PageSpeed Insights**: Core Web Vitals de campo + laboratorio.
- **Rich Results Test**: validación de structured data.
- **Mobile-Friendly / inspección de URL**: cómo ve Googlebot la página.
- **Lighthouse (DevTools)**: auditoría técnica local.

## Cómo presentar los hallazgos al usuario

No vuelques la lista entera. Agrupa por prioridad, empieza por los 🔴 críticos,
explica el impacto de cada uno en lenguaje claro, y propón la corrección concreta
(archivo/etiqueta). Cierra con un plan de acción ordenado y expectativas realistas
de tiempo (semanas, no días).
