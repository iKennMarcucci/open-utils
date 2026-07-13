<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# SEO: obligatorio en todo cambio

**Este sitio vive del buscador.** Cada herramienta rankea porque su HTML de servidor
lleva un title único, un solo `<h1>`, texto real y JSON-LD. Eso es frágil de una única
forma: se rompe en cuanto alguien añade una función y no actualiza el SEO alrededor.

Por eso, **cualquier cambio que toque una ruta, una herramienta o lo que una herramienta
hace, arrastra su parte de SEO en el mismo cambio.** No es un paso posterior ni opcional.

Usa la skill `seo-optimization` (en `.claude/skills/`) para el detalle; esto es el contrato
mínimo de este repo.

## Antes de dar por cerrado un cambio

```bash
npm run seo:check          # estático — falla si rompes el patrón o falta contenido
npm run build && npm start
npm run seo:check:live     # además audita el HTML servido y el JSON-LD
```

`npm run seo:check` es la red de seguridad, no la tarea. Que pase no significa que el
contenido sea bueno ni **verdadero** — solo que la estructura está.

## Las cuatro reglas que no se negocian

### 1. `page.tsx` es SIEMPRE un Server Component

El patrón de tres capas es lo que hace que el sitio exista para Google:

```
src/app/<slug>/page.tsx          Server Component: metadata + JsonLd + ToolPageContent
src/app/<slug>/<X>Client.tsx     "use client" + el ÚNICO dynamic(ssr:false)
src/components/<X>Ui.tsx         el widget pesado, sin tocar
```

Nunca pongas `"use client"` en `page.tsx`: un Client Component **no puede exportar
`metadata`**, y Next 16 **rechaza `ssr:false` dentro de un Server Component**
(`node_modules/next/dist/docs/01-app/02-guides/lazy-loading.md`). Si rompes esto, la
página se sirve vacía — que es exactamente el estado del que salió este proyecto: siete
rutas sin una sola frase y todas con el mismo title.

### 2. `src/lib/seo/tools.ts` es la única fuente de verdad

Una sola constante por herramienta alimenta **a la vez** el `metadata`, el texto visible
(intro, features, pasos, secciones, FAQ) y el JSON-LD. Nunca escribas el mismo texto dos
veces: si el `FAQPage` del JSON-LD y la FAQ visible divergen, eso es **marcado engañoso**
y es motivo de acción manual de Google.

Al añadir una herramienta, toca en este orden:

1. `src/lib/seo/tools.ts` — entrada completa + añadirla a `TOOL_ORDER`
2. `src/app/<slug>/page.tsx` + `<X>Client.tsx` + `opengraph-image.tsx`
3. `src/components/HomeView.tsx` — su tarjeta, con `href` estático
4. `public/llms.txt` — su línea

El `sitemap.ts`, el footer, la 404 y los enlaces internos **se generan solos** desde
`TOOL_ORDER`. No los edites a mano.

### 3. No afirmes nada que el código no haga

Esta es la regla más importante y la más fácil de saltarse.

Antes de escribir o tocar un `title`, una `description`, una feature o una respuesta de
FAQ: **abre el código y compruébalo**. Formatos de exportación reales, límites de tamaño
reales, opciones que existen de verdad.

Ya ha pasado: la home prometía *"transforma varias imágenes en un único documento"* cuando
el `<input>` no tenía `multiple` y solo procesaba `files[0]`. Una promesa falsa produce
rebote inmediato, y en el structured data es sancionable.

Prohibido, sin excepción:

- `aggregateRating` o `review` — no hay valoraciones reales; inventarlas es spam.
- `SearchAction` — no hay buscador en el sitio.
- Marcar en JSON-LD cualquier cosa que no esté **visible** en la página.
- Prometer una función "próximamente" en una landing vacía (*thin content*).

Si un cambio hace que una afirmación deje de ser cierta (o pase a serlo), **actualiza el
texto en el mismo commit.**

### 4. El contenido va SIEMPRE en el HTML de servidor

Los crawlers de IA (ChatGPT, Perplexity) no ejecutan JavaScript. El widget puede seguir
siendo client-only; **el texto no**. Si el contenido nuevo solo aparece tras hidratar, no
existe.

Nunca escondas contenido marcado en JSON-LD con `display:none` para "que no moleste": eso
convierte el marcado en contenido oculto.

## Rendimiento (Core Web Vitals)

- **LCP** — el `<h1>` de la home no puede nacer con `opacity:0` esperando a que hidrate
  una animación.
- **INP** — todo bucle que rasterice o codifique (pdf.js, canvas, ffmpeg) debe llamar a
  `await yieldToMain()` (`src/lib/scheduler.ts`) entre elementos. Usa `canvas.toBlob`,
  nunca `toDataURL` (es síncrono y bloquea).
- **CLS** — el `loading:` de un `dynamic()` debe reservar la altura real del widget.
- Revoca siempre los object URLs (`URL.revokeObjectURL`) al soltar un archivo.

## Dominio

`https://openutils.co`, definido en `src/lib/seo/site.ts` (`NEXT_PUBLIC_SITE_URL` lo
sobrescribe). **Nunca** hardcodees un dominio: usa `SITE_URL` / `absoluteUrl()`. Las rutas
en inglés antiguas redirigen 308 desde `next.config.ts`; si renombras una ruta, añade ahí
su redirect.

## Al terminar

Recuerda al usuario que valide el structured data en el
[Rich Results Test](https://search.google.com/test/rich-results) y que el SEO se mide en
**semanas, no en días**.
