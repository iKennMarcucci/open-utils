# 06 · Herramientas y patrones de arquitectura

## Herramientas actuales

| Herramienta | Ruta | Componente | Lib |
| --- | --- | --- | --- |
| PDF ⇄ IMG | `/pdf-converter?mode=pdf-to-img\|img-to-pdf` | `ConverterUi` | `converter.ts` |
| Video ⇄ GIF | `/video-converter?mode=video-to-gif\|gif-to-video` | `VideoConverterUi` | `video-converter.ts` |
| Unificador PDF | `/pdf-organizer?mode=merge` | `MergeConverterUi` | `merge-converter.ts` |
| Separador PDF | `/pdf-organizer?mode=split` | `SplitConverterUi` | `pdf-splitter.ts` |
| Formato JSON | — | _próximamente_ | — |

Rutas legacy `/merge-pdf` y `/pdf-splitter` → **redirect** a `/pdf-organizer?mode=…`.
Worker de PDF.js compartido en `pdfjs.ts`.

---

## Patrón "conversor contraparte" (clave)

Dos funcionalidades opuestas se modelan como **una ruta con `?mode=`** y un **botón reload** que
alterna entre ellas. Aplica a los 3 conversores (`pdf-converter`, `video-converter`, `pdf-organizer`).

Piezas:

1. **Ruta con `?mode=`** — un `page.tsx` cliente que importa el componente con `dynamic(..., { ssr: false })`.
2. **Lee el modo** con `useSearchParams()` dentro del componente (o de un wrapper). El componente
   ramifica su UI según el modo.
3. **Toggle en el header de la herramienta** — botón `RefreshCw` que navega/cambia al modo
   contraparte (ver header en [02-components.md](02-components.md)).
4. **Toggle en el sidebar** — un solo ítem con `hasToggle` cuyo nombre/ícono/href derivan del modo
   (ver [04-app-shell-sidebar.md](04-app-shell-sidebar.md)).

### Dos formas del patrón

- **Un componente, dos modos** (PDF⇄IMG, Video⇄GIF): el mismo componente cambia su UI según
  `?mode=` (usa `useSearchParams` + estado interno). El toggle actualiza el query param.
- **Dos componentes, un wrapper** (Unificador/Separador): son herramientas grandes y distintas, así
  que `/pdf-organizer` usa un wrapper [`PdfOrganizerUi`](../src/components/PdfOrganizerUi.tsx) que
  lee `?mode=` y renderiza `<MergeConverterUi/>` o `<SplitConverterUi/>` (cada uno `dynamic ssr:false`,
  code-split). El toggle del header hace `router.push("/pdf-organizer?mode=…")`.

### Ruta con carga diferida (plantilla)

```tsx
"use client";
import dynamic from "next/dynamic";
const Ui = dynamic(() => import("@/components/XxxUi").then(m => m.XxxUi), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center min-h-[500px]">
      <div className="w-12 h-12 border-[3px] border-surface-strong border-t-accent rounded-full animate-spin" />
    </div>
  ),
});
export default function Page() { return <div className="w-full min-h-full"><Ui /></div>; }
```

> `ssr: false` es importante: estas herramientas usan APIs del navegador (canvas, WASM, workers) y
> `useSearchParams` sin necesidad de Suspense en build.

---

## Convenciones de nombres

- **Header de herramienta y tiles del Bento:** `⇄` para bidireccionales — "PDF ⇄ IMG",
  "Video ⇄ GIF". Nombres propios para las de PDF: "Unificador PDF", "Separador PDF".
- **Sidebar:** dirección explícita — "PDF a IMG" / "IMG a PDF", "Video a GIF" / "GIF a Video".
- Copy **en español** siempre.

---

## Estados de una herramienta

Toda herramienta cubre estos estados con los patrones de [02-components.md](02-components.md):

1. **Vacío** — dropzone (una o dos columnas ENTRADA/SALIDA). Contenedor centrado `max-w-4xl` si es
   simple; `max-w-6xl` alineado arriba si el editor es ancho (p. ej. Separador). El header centrado
   (ícono + título + reload) es constante.
2. **Trabajando / cargando** — spinner + texto (`animate-pulse`).
3. **Resultado** — preview + descarga (fila de descarga; `.zip` con JSZip si hay muchos archivos).
4. **Error** — modal `{ title, message, suggestion }`.

Ejemplo de flujo distinto: el **Separador PDF** tras cargar el PDF muestra un **editor** (grilla de
páginas 2/3 + panel de paquetes 1/3) donde el usuario asigna páginas a "paquetes", cada uno con
salida _PDF unido / PDF por página / imágenes_, y exporta todo en un `.zip`.

---

## 100% local (sin CDNs) — innegociable

Todo se procesa en el navegador y **ningún asset viene de un CDN**:

- **FFmpeg core** (`@ffmpeg/core`) se copia a `public/ffmpeg/` con
  [`scripts/copy-ffmpeg.mjs`](../scripts/copy-ffmpeg.mjs) (hook `postinstall`/`predev`/`prebuild`)
  y se carga desde `/ffmpeg`. El `.wasm` (~31MB) está en `.gitignore`.
- **Worker de pdf.js** se resuelve del paquete instalado vía `new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url)` → asset del mismo origen ([`src/lib/pdfjs.ts`](../src/lib/pdfjs.ts)).
- **Fuentes Geist** auto-hospedadas por `next/font` (sin request a Google en runtime).
- **JSZip** empaquetado localmente.

Al añadir una dependencia que cargue recursos, **auto-hospéjalos**. Nunca introduzcas una URL de CDN.

---

## Cómo agregar una herramienta nueva (checklist)

1. **Lib** en `src/lib/<tool>.ts` — la lógica pura (procesamiento en el navegador, tipos de
   error `{ title, message, suggestion }`). Sin CDNs.
2. **Componente** `src/components/<Tool>Ui.tsx` (`"use client"`) — usa tokens y primitivos `.ou-*`,
   header centrado, estados vacío/trabajando/resultado/error, `motion/react`.
3. **Ruta** `src/app/<tool>/page.tsx` — patrón `dynamic ssr:false` (arriba). Si tiene contraparte,
   usa `?mode=` + wrapper.
4. **Sidebar** — añade el ítem a `navItems` en [`Sidebar.tsx`](../src/components/Sidebar.tsx). Si es
   conversor, `hasToggle: true` con nombre/**ícono (= destino)**/href derivados del modo.
5. **Bento** — añade la tarjeta a `TOOLS` en [`HomeView.tsx`](../src/components/HomeView.tsx) con su
   categoría y acento; cuida que el grid cierre sin huecos (ver [05-bento-grid.md](05-bento-grid.md)).
6. **Docs** — si introduces un patrón nuevo, documéntalo aquí.
7. **Verifica:** `npx tsc --noEmit` limpio, `npx eslint <archivos>` sin errores, la ruta responde 200.

## Estructura de carpetas (referencia)

```
src/
  app/
    layout.tsx            · shell (dark, Sidebar + contenido)
    page.tsx              · home → <HomeView/>
    globals.css           · TODOS los tokens + primitivos .ou-*
    <tool>/page.tsx       · rutas (dynamic ssr:false)
  components/
    Sidebar.tsx, Logo.tsx, HomeView.tsx
    ConverterUi / VideoConverterUi / MergeConverterUi / SplitConverterUi / PdfOrganizerUi
  lib/
    utils.ts (cn), pdfjs.ts (worker), converter.ts, video-converter.ts,
    merge-converter.ts, pdf-splitter.ts
scripts/copy-ffmpeg.mjs   · auto-hospedaje del core de FFmpeg
docs/                     · esta guía de diseño
```
