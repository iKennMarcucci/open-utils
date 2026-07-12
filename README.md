# Open Utils

A collection of fast, **local, and private** browser utilities. Convert, merge and
transform files without anything ever leaving your device — every tool runs
entirely in the browser.

## Tools

| Categoría   | Herramienta      | Ruta               |
| ----------- | ---------------- | ------------------ |
| Documentos  | PDF ⇄ IMG        | `/pdf-converter`   |
| Documentos  | Unificador PDF       | `/merge-pdf`       |
| Documentos  | Separador PDF | `/pdf-splitter`    |
| Multimedia  | Video ⇄ GIF      | `/video-converter` |
| Desarrollo  | Formato JSON     | _próximamente_     |

The **Separador PDF** lets you group a PDF's pages into packages and export
each package as a unified PDF, one PDF per page, or images — bundled into a
single `.zip` (JSZip, bundled locally).

## Design system

Open Utils uses a design system built on the [Geist Design System](https://vercel.com/geist/introduction)
(Vercel): monochrome-forward surfaces, a single blue accent, subtle 1px borders,
tight radii and the Geist typeface. All tokens live in
[`src/app/globals.css`](src/app/globals.css) and are exposed to Tailwind v4 via
`@theme inline`, plus shared component primitives (`.ou-card`, `.ou-btn`,
`.ou-dropzone`, `.ou-label`, `.ou-badge`). The home page arranges the tools as a
responsive **bento grid** grouped by category, animated with
[Motion](https://motion.dev) (`motion/react`).

## 100% local — no CDNs

Every runtime asset is served from the same origin, so the app works fully
offline and nothing ever leaves your device:

- **FFmpeg core** (`@ffmpeg/core`) is copied into `public/ffmpeg/` by
  [`scripts/copy-ffmpeg.mjs`](scripts/copy-ffmpeg.mjs) (runs on `postinstall` /
  `predev` / `prebuild`) and loaded from `/ffmpeg`. The 31 MB wasm stays out of
  git and is regenerated on install.
- **pdf.js worker** is resolved from the installed `pdfjs-dist` package via
  `new URL(..., import.meta.url)`, so the bundler emits it as a same-origin
  asset locked to the installed version.
- **Geist fonts** are self-hosted by `next/font` at build time — no request to
  Google Fonts at runtime.

## Getting started

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

Built with [Next.js](https://nextjs.org) (App Router), React 19, Tailwind CSS v4,
Motion and lucide-react.
