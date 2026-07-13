<div align="center">

# Open Utils

**Utilidades de archivos rápidas, locales y privadas — todo corre en tu navegador.**

Edita, convierte, unifica y separa archivos sin que nada salga de tu equipo:
no hay backend, no hay subidas, no hay CDNs.

[![Licencia: MIT](https://img.shields.io/badge/Licencia-MIT-0070f3.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000.svg)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-000000.svg)](https://react.dev)

</div>

---

## Por qué Open Utils

La mayoría de los conversores en línea suben tus archivos a un servidor ajeno.
Open Utils no: **todo el procesamiento ocurre en tu navegador** (WebAssembly y
las APIs del DOM). Los archivos nunca viajan por la red, la app funciona sin
conexión y el código está aquí para que lo audites.

- **100% local** — cero peticiones a servidores externos, ni siquiera para fuentes.
- **Sin instalación** — abre la web y listo.
- **Código abierto** — licencia MIT, contribuciones bienvenidas.

## Herramientas

| Categoría  | Herramienta          | Ruta                        | Qué hace                                                                                                                      |
| ---------- | -------------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Documentos | **Editor de PDF**    | `/pdf-editor`               | Dibuja, resalta, escribe, agrega formas, flechas e imágenes; rota, reordena y elimina páginas                                  |
| Documentos | **PDF ⇄ IMG**        | `/pdf-converter`            | Convierte PDF a imágenes y viceversa                                                                                          |
| Documentos | **Unificador PDF**   | `/pdf-organizer?mode=merge` | Combina varios PDFs en uno, reordenando páginas                                                                               |
| Documentos | **Separador PDF**    | `/pdf-organizer?mode=split` | Agrupa las páginas en paquetes y exporta un PDF unificado por paquete, un PDF por página o imágenes, empaquetados en un `.zip` |
| Multimedia | **Editor de Imagen** | `/image-editor`             | Anota, dibuja y transforma imágenes en un lienzo con historial por capas                                                       |
| Multimedia | **Video ⇄ GIF**      | `/video-converter`          | Convierte video a GIF y GIF a video con FFmpeg (WebAssembly)                                                                   |
| Desarrollo | Formato JSON         | _próximamente_              | —                                                                                                                             |

## Empezar

Requiere Node.js 20+.

```bash
git clone https://github.com/iKennMarcucci/open-utils.git
cd open-utils
npm install          # el postinstall copia el core de FFmpeg a public/ffmpeg/
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

| Script                 | Descripción                                   |
| ---------------------- | --------------------------------------------- |
| `npm run dev`          | Servidor de desarrollo                        |
| `npm run build`        | Build de producción                           |
| `npm start`            | Sirve el build de producción                  |
| `npm run lint`         | ESLint                                        |
| `npm run setup:ffmpeg` | Vuelve a copiar el core de FFmpeg a `public/` |

## Cómo se mantiene 100% local

Todos los assets en tiempo de ejecución se sirven desde el mismo origen, así que
la app funciona sin conexión y nada sale de tu equipo:

- **FFmpeg core** (`@ffmpeg/core`) se copia a `public/ffmpeg/` mediante
  [`scripts/copy-ffmpeg.mjs`](scripts/copy-ffmpeg.mjs) (se ejecuta en `postinstall`,
  `predev` y `prebuild`) y se carga desde `/ffmpeg`. Los ~31 MB de wasm quedan
  fuera de git y se regeneran en cada instalación.
- **Worker de pdf.js** se resuelve desde el paquete instalado `pdfjs-dist` con
  `new URL(..., import.meta.url)`, de modo que el bundler lo emite como un asset del
  mismo origen, atado a la versión instalada.
- **Fuentes Geist** se auto-hospedan con `next/font` en tiempo de build — sin
  peticiones a Google Fonts en runtime.

## Stack

[Next.js 16](https://nextjs.org) (App Router) · React 19 · TypeScript ·
[Tailwind CSS v4](https://tailwindcss.com) · [Motion](https://motion.dev) ·
[pdf-lib](https://pdf-lib.js.org) · [pdf.js](https://mozilla.github.io/pdf.js/) ·
[ffmpeg.wasm](https://ffmpegwasm.netlify.app) · [JSZip](https://stuk.github.io/jszip/) ·
lucide-react

## Sistema de diseño

Open Utils usa un sistema de diseño construido sobre el
[Geist Design System](https://vercel.com/geist/introduction) de Vercel: superficies
monocromas, un único acento azul, bordes sutiles de 1px, radios ajustados y la
tipografía Geist. Los tokens viven en [`src/app/globals.css`](src/app/globals.css)
y se exponen a Tailwind v4 vía `@theme inline`, junto con los primitivos compartidos
(`.ou-card`, `.ou-btn`, `.ou-dropzone`, `.ou-label`, `.ou-badge`). La página de inicio
organiza las herramientas en un **bento grid** por categoría.

La guía completa está en [`docs/`](docs/) — **léela antes de escribir o modificar UI**:

| Documento                                                   | Contenido                     |
| ----------------------------------------------------------- | ----------------------------- |
| [`01-design-tokens.md`](docs/01-design-tokens.md)           | Colores, radios, tipografía   |
| [`02-components.md`](docs/02-components.md)                 | Primitivos `.ou-*`            |
| [`03-motion.md`](docs/03-motion.md)                         | Animación y easing            |
| [`04-app-shell-sidebar.md`](docs/04-app-shell-sidebar.md)   | Shell y barra lateral         |
| [`05-bento-grid.md`](docs/05-bento-grid.md)                 | Bento grid del inicio         |
| [`06-tools-and-patterns.md`](docs/06-tools-and-patterns.md) | Patrones de cada herramienta  |

## Estructura

```
src/
├── app/              # rutas del App Router (una por herramienta) + globals.css
├── components/       # UI de cada herramienta, Sidebar, Footer y bento del inicio
│   └── editor/       # lienzo de anotación, toolbar e historial por capas
└── lib/              # lógica pura: conversión, PDF, video, editor
scripts/              # copy-ffmpeg.mjs (assets locales de FFmpeg)
docs/                 # sistema de diseño (fuente de verdad para la UI)
```

La lógica de negocio vive en [`src/lib/`](src/lib/) y es independiente de React;
los componentes de [`src/components/`](src/components/) solo la orquestan.

## Contribuir

1. Haz un fork y crea una rama: `git checkout -b feat/mi-herramienta`.
2. Sigue el sistema de diseño de [`docs/`](docs/) — cualquier UI nueva debe verse
   como si ya existiera en Open Utils.
3. Mantén la promesa: **nada de red**. Una herramienta que suba archivos a un
   servidor no entra.
4. Verifica con `npm run lint` y `npm run build` antes de abrir el PR.

Los reportes de errores y las ideas de nuevas herramientas son bienvenidos en
[Issues](https://github.com/iKennMarcucci/open-utils/issues).

## Licencia

[MIT](LICENSE) © Kenn Marcucci
