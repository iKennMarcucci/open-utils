# Core Web Vitals y rendimiento

Google usa la experiencia de página como señal de ranking. Las tres métricas Core
Web Vitals (datos de campo reales de usuarios, vía CrUX) son el estándar 2026.

## Métricas y umbrales

| Métrica | Mide | Bueno | Necesita mejora | Malo |
|---|---|---|---|---|
| **LCP** (Largest Contentful Paint) | Velocidad de carga percibida | ≤ 2.5s | 2.5-4.0s | > 4.0s |
| **INP** (Interaction to Next Paint) | Capacidad de respuesta | ≤ 200ms | 200-500ms | > 500ms |
| **CLS** (Cumulative Layout Shift) | Estabilidad visual | ≤ 0.1 | 0.1-0.25 | > 0.25 |

> **INP reemplazó a FID** en marzo de 2024. Si ves guías que hablan de FID, están
> desactualizadas. INP mide la latencia de TODAS las interacciones, no solo la
> primera.

Mide **datos de campo** (usuarios reales) en Search Console y PageSpeed Insights,
y **datos de laboratorio** con Lighthouse/DevTools para depurar. El ranking usa
campo, no laboratorio.

## Optimizar LCP (< 2.5s)

El LCP suele ser la imagen hero o un bloque de texto grande above-the-fold.

- **Identifica el elemento LCP** (Lighthouse te lo dice) y prioriza su carga.
- **Optimiza la imagen hero**: formato moderno (AVIF/WebP), tamaño correcto,
  `fetchpriority="high"`, `<link rel="preload">`. NUNCA `loading="lazy"` en el LCP.
- **Servidor rápido**: reduce TTFB con caché, CDN, SSR/SSG en vez de CSR.
- **Elimina render-blocking**: CSS crítico inline, JS diferido (`defer`/`async`),
  minimiza CSS/JS.
- **Preconnect** a orígenes de terceros críticos (fuentes, CDN).
- **Fuentes**: `font-display: swap`, preload de la fuente crítica, subsetting.

## Optimizar INP (< 200ms)

La interactividad se rompe cuando el hilo principal está bloqueado por JS.

- **Reduce JavaScript**: menos librerías, tree-shaking, code splitting, carga
  diferida de lo no crítico.
- **Rompe tareas largas** (>50ms): usa `requestIdleCallback`, `setTimeout`,
  `scheduler.yield()`, o Web Workers para cómputo pesado.
- **Evita hidration masiva**: en frameworks JS, usa islas/partial hydration
  (Astro), Server Components (Next), o hidratación selectiva.
- **Debounce/throttle** en handlers de input, scroll y resize.
- **Evita layout thrashing**: agrupa lecturas y escrituras del DOM.

## Optimizar CLS (< 0.1)

Los saltos de layout ocurren cuando el contenido se mueve tras cargar.

- **Dimensiona imágenes y vídeos**: `width`/`height` o `aspect-ratio` siempre.
- **Reserva espacio** para anuncios, embeds e iframes antes de que carguen.
- **Fuentes sin FOUT/FOIT**: usa `size-adjust`/métricas de fallback para que la
  fuente de respaldo ocupe lo mismo que la final.
- **No insertes contenido** por encima de contenido existente (banners, avisos)
  sin reservar su espacio.
- **Animaciones con `transform`/`opacity`**, nunca con propiedades que reflowen
  (top, left, width, height).

## Presupuesto de rendimiento (performance budget)

Fija límites y monitorízalos en CI:
- Peso total de la página, tamaño de JS/CSS, número de requests.
- Herramientas: Lighthouse CI, WebPageTest, bundle analyzers.

## Herramientas de medición

- **PageSpeed Insights**: campo (CrUX) + laboratorio (Lighthouse) en una URL.
- **Search Console → Core Web Vitals**: estado del sitio por grupos de URLs.
- **Chrome DevTools → Performance / Lighthouse**: depuración local.
- **web-vitals (librería JS)**: mide en producción y envía a tu analytics.

## Checklist rápido

- [ ] Imagen LCP en AVIF/WebP, dimensionada, con `fetchpriority=high` y sin lazy.
- [ ] CSS crítico inline; resto diferido.
- [ ] JS no crítico con `defer`/`async` y code splitting.
- [ ] Todas las imágenes con `width`/`height`.
- [ ] Fuentes con `font-display: swap` y preload de la crítica.
- [ ] Espacio reservado para anuncios/embeds.
- [ ] CDN y caché configurados; TTFB bajo.
- [ ] Verificado en datos de CAMPO, no solo laboratorio.
