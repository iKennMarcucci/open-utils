import * as pdfjsLib from "pdfjs-dist";

// Single source of truth for the PDF.js worker. Resolved from the installed
// `pdfjs-dist` package and emitted by the bundler as a same-origin asset — no
// CDN, version locked to the dependency. Setting it is idempotent.
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();
}

export { pdfjsLib };
