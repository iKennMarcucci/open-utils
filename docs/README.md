# Open Utils — Guía de Diseño

Esta carpeta documenta **todo** el sistema de diseño, los patrones UX/UI, el Bento
Grid y las interfaces de Open Utils. Está pensada para servir de **base de diseño**:
en una sesión nueva de Claude Code (o para cualquier persona), enlaza esta carpeta y
úsala como fuente de verdad antes de escribir o modificar UI.

> **Regla de oro:** cualquier UI nueva debe verse como si ya existiera en Open Utils.
> Reutiliza tokens y primitivos; no inventes colores, radios ni patrones nuevos.

---

## Identidad del proyecto

- **Nombre:** siempre **"Open Utils"** (nunca "Local Converters", "Converters", etc.).
- **Base de diseño:** [Geist Design System](https://vercel.com/geist/introduction) de Vercel
  — superficies monocromáticas, **un solo acento azul** (`#0070f3`), bordes sutiles de 1px,
  radios ajustados y la tipografía **Geist**.
- **Tema:** **dark-only** (fondo negro puro `#000`). No hay modo claro.
- **Idioma de la UI:** **español**. Todo el copy visible va en español.
- **Privacidad:** **100% local** — todo se procesa en el navegador, sin CDNs ni servidores.
- **Home:** un **Bento Grid** que reparte las herramientas por categoría.
- **Animación:** `motion/react` (el paquete Motion moderno), no `framer-motion`.

## Stack

Next.js 16 (App Router) · React 19 · Tailwind CSS v4 · Motion (`motion/react`) ·
lucide-react · pdf-lib / pdfjs-dist / @ffmpeg · JSZip. Todo local.

---

## Índice

| Doc | Contenido |
| --- | --- |
| [01-design-tokens.md](01-design-tokens.md) | Colores, radios, sombras, tipografía, focus, scrollbar. La fuente de todos los valores. |
| [02-components.md](02-components.md) | Primitivos `.ou-*` y patrones de UI recurrentes (headers, dropzones, modales, resultados). |
| [03-motion.md](03-motion.md) | Convenciones de animación con `motion/react`. |
| [04-app-shell-sidebar.md](04-app-shell-sidebar.md) | Shell de la app y el Sidebar (colapso, tooltips, toggles de conversor, íconos). |
| [05-bento-grid.md](05-bento-grid.md) | El Bento Grid de la home: categorías, tarjetas, layout. |
| [06-tools-and-patterns.md](06-tools-and-patterns.md) | Interfaces de las herramientas, el patrón "conversor contraparte" y cómo agregar una nueva. |

---

## TL;DR — reglas no negociables

1. **Usa tokens, no valores crudos.** `bg-surface`, `text-foreground-muted`, `border-border`…
   nunca `bg-neutral-900` ni hex sueltos. Ver [01-design-tokens.md](01-design-tokens.md).
2. **Usa los primitivos `.ou-*`** para cards, botones, labels, badges, dropzones.
   Ver [02-components.md](02-components.md).
3. **Radios Geist:** `rounded-control` (8px), `rounded-card` (12px), `rounded-panel` (16px),
   `rounded-hero` (24px). Nada de radios arbitrarios.
4. **Un solo acento azul** (`accent`). Los demás colores (púrpura/ámbar/teal) solo como
   acentos de **categoría** en el Bento, muy sutiles.
5. **Motion con `motion/react`** y el easing Geist `cubic-bezier(0.22, 1, 0.36, 1)`.
6. **Copy en español**, tono directo.
7. **Conversores contraparte:** una ruta con `?mode=`, un ítem en el sidebar con botón
   reload que cambia de funcionalidad. Ver [06-tools-and-patterns.md](06-tools-and-patterns.md).
8. **100% local:** sin CDNs. Los assets (worker de pdf.js, core de FFmpeg) se auto-hospedan.

## Archivos fuente clave

- Tokens y primitivos: [`src/app/globals.css`](../src/app/globals.css)
- Shell: [`src/app/layout.tsx`](../src/app/layout.tsx)
- Sidebar: [`src/components/Sidebar.tsx`](../src/components/Sidebar.tsx) · Logo: [`src/components/Logo.tsx`](../src/components/Logo.tsx)
- Bento/home: [`src/components/HomeView.tsx`](../src/components/HomeView.tsx)
- Herramientas: [`src/components/ConverterUi.tsx`](../src/components/ConverterUi.tsx), [`VideoConverterUi.tsx`](../src/components/VideoConverterUi.tsx), [`MergeConverterUi.tsx`](../src/components/MergeConverterUi.tsx), [`SplitConverterUi.tsx`](../src/components/SplitConverterUi.tsx)
- `cn()` helper (clsx + tailwind-merge): [`src/lib/utils.ts`](../src/lib/utils.ts)
