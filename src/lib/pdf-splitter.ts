import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { pdfjsLib } from "./pdfjs";
import { yieldToMain } from "./scheduler";

export interface SplitError {
  title: string;
  message: string;
  suggestion: string;
}

/** How a package's pages should be exported. */
export type PackageOutput = "pdf-single" | "pdf-per-page" | "image";

export interface SplitPackage {
  id: string;
  name: string;
  /** 1-based page numbers, kept in ascending order. */
  pages: number[];
  output: PackageOutput;
  color: string;
}

export interface LoadedPdf {
  numPages: number;
  /** Object URLs of JPEG thumbnails, one per page, for the picker grid.
   *  Release them with `releaseThumbnails` when the document is dropped. */
  thumbnails: string[];
  /** Original file bytes, reused for export. */
  bytes: ArrayBuffer;
  name: string;
}

export interface SplitResultFile {
  name: string;
  blob: Blob;
  kind: "pdf" | "image";
  url: string;
}

export interface SplitResultGroup {
  id: string;
  name: string;
  output: PackageOutput;
  color: string;
  files: SplitResultFile[];
}

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

/** Renders a single PDF.js page to a PNG blob at the given scale. */
async function renderPageToPng(
  doc: Awaited<ReturnType<typeof pdfjsLib.getDocument>["promise"]>,
  pageNo: number,
  scale = 2
): Promise<Blob> {
  const page = await doc.getPage(pageNo);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo crear el contexto de canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await page.render({ canvasContext: ctx, viewport } as any).promise;
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Fallo al generar la imagen"))),
      "image/png",
      1.0
    );
  });
}

/**
 * Loads a PDF, validates it, and renders a lightweight thumbnail per page for
 * the page picker. Runs entirely in the browser.
 */
export async function loadPdf(file: File): Promise<LoadedPdf> {
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    throw {
      title: "Archivo no válido",
      message: `Se esperaba un PDF pero se recibió "${file.type || "tipo desconocido"}".`,
      suggestion: "Selecciona un archivo con extensión .pdf.",
    } as SplitError;
  }
  if (file.size > MAX_FILE_SIZE) {
    throw {
      title: "Archivo demasiado grande",
      message: `"${file.name}" pesa ${(file.size / (1024 * 1024)).toFixed(1)}MB y supera el máximo de 100MB.`,
      suggestion: "Divide el PDF en partes más pequeñas antes de separarlo.",
    } as SplitError;
  }

  try {
    const bytes = await file.arrayBuffer();
    const doc = await pdfjsLib.getDocument({ data: bytes.slice(0) }).promise;
    const numPages = doc.numPages;
    const thumbnails: string[] = [];

    for (let i = 1; i <= numPages; i++) {
      const page = await doc.getPage(i);
      const base = page.getViewport({ scale: 1 });
      const scale = Math.min(220 / base.width, 1.5);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("No se pudo crear el contexto de canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await page.render({ canvasContext: ctx, viewport } as any).promise;

      // `toDataURL` encodes synchronously and base64-inflates the result by ~33%.
      // On a 100 MB, several-hundred-page PDF that froze the tab for seconds and
      // held every thumbnail in memory as a string. `toBlob` encodes off the main
      // thread and an object URL is a pointer, not a copy.
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("No se pudo generar la miniatura"))),
          "image/jpeg",
          0.7
        );
      });
      thumbnails.push(URL.createObjectURL(blob));

      canvas.width = 0;
      canvas.height = 0;

      // Let the browser paint and stay responsive between pages (INP).
      await yieldToMain();
    }

    await doc.cleanup();
    return { numPages, thumbnails, bytes, name: file.name };
  } catch (error) {
    if ((error as SplitError).title) throw error;
    const err = error as Error;
    throw {
      title: "No se pudo leer el PDF",
      message: `El archivo parece dañado o no es un PDF válido: ${err.message}`,
      suggestion:
        "Ábrelo en un lector de PDF para verificarlo. Si está protegido con contraseña, retírala e intenta de nuevo.",
    } as SplitError;
  }
}

/**
 * Builds the output files for every package. Each package becomes either:
 * - `pdf-single`: one PDF containing all of its pages, in order;
 * - `pdf-per-page`: one separate PDF per page;
 * - `image`: one PNG per page.
 */
export async function buildSplitOutputs(
  bytes: ArrayBuffer,
  sourceName: string,
  packages: SplitPackage[]
): Promise<SplitResultGroup[]> {
  const active = packages.filter((p) => p.pages.length > 0);
  if (active.length === 0) {
    throw {
      title: "Sin paquetes",
      message: "Crea al menos un paquete y asígnale páginas antes de procesar.",
      suggestion: "Haz clic en las páginas para agregarlas al paquete activo.",
    } as SplitError;
  }

  const base = sourceName.replace(/\.pdf$/i, "");

  try {
    const src = await PDFDocument.load(bytes.slice(0), { ignoreEncryption: true });

    // Only spin up a PDF.js document if some package exports images.
    const needsImages = active.some((p) => p.output === "image");
    const imgDoc = needsImages
      ? await pdfjsLib.getDocument({ data: bytes.slice(0) }).promise
      : null;

    const groups: SplitResultGroup[] = [];

    for (const pkg of active) {
      const files: SplitResultFile[] = [];

      if (pkg.output === "image") {
        for (const pageNo of pkg.pages) {
          const blob = await renderPageToPng(imgDoc!, pageNo);
          files.push(makeFile(`${base}_p${pageNo}.png`, blob, "image"));
        }
      } else if (pkg.output === "pdf-per-page") {
        for (const pageNo of pkg.pages) {
          const out = await PDFDocument.create();
          const [copied] = await out.copyPages(src, [pageNo - 1]);
          out.addPage(copied);
          const blob = new Blob([(await out.save()) as BlobPart], {
            type: "application/pdf",
          });
          files.push(makeFile(`${base}_p${pageNo}.pdf`, blob, "pdf"));
        }
      } else {
        // pdf-single
        const out = await PDFDocument.create();
        const copied = await out.copyPages(
          src,
          pkg.pages.map((n) => n - 1)
        );
        copied.forEach((p) => out.addPage(p));
        const blob = new Blob([(await out.save()) as BlobPart], {
          type: "application/pdf",
        });
        const label = slug(pkg.name) || pkg.id;
        files.push(makeFile(`${base}_${label}.pdf`, blob, "pdf"));
      }

      groups.push({
        id: pkg.id,
        name: pkg.name,
        output: pkg.output,
        color: pkg.color,
        files,
      });
    }

    if (imgDoc) await imgDoc.cleanup();
    return groups;
  } catch (error) {
    if ((error as SplitError).title) throw error;
    const err = error as Error;
    if (err.message?.includes("encrypted") || err.message?.includes("password")) {
      throw {
        title: "PDF protegido",
        message: "El PDF está protegido con contraseña y no se puede separar.",
        suggestion: "Quita la protección con tu lector de PDF y vuelve a intentarlo.",
      } as SplitError;
    }
    throw {
      title: "Error al separar",
      message: `Ocurrió un error al generar los archivos: ${err.message}`,
      suggestion: "Verifica que el PDF sea válido e intenta de nuevo.",
    } as SplitError;
  }
}

function makeFile(name: string, blob: Blob, kind: "pdf" | "image"): SplitResultFile {
  return { name, blob, kind, url: URL.createObjectURL(blob) };
}

function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Bundles every result file into a single .zip and triggers a download. */
export async function downloadAllAsZip(
  groups: SplitResultGroup[],
  sourceName: string
): Promise<void> {
  const zip = new JSZip();
  for (const g of groups) {
    for (const f of g.files) {
      zip.file(f.name, f.blob);
    }
  }
  const base = sourceName.replace(/\.pdf$/i, "");
  const blob = await zip.generateAsync({ type: "blob" });
  saveAs(blob, `${base}_separado.zip`);
}

export function saveResultFile(file: SplitResultFile): void {
  saveAs(file.blob, file.name);
}

/**
 * Thumbnails are object URLs now (they used to be base64 data URLs, which the GC
 * reclaimed on its own). An object URL pins its blob until it is revoked, so the
 * UI must release them when it drops a document.
 */
export function releaseThumbnails(thumbnails: string[]) {
  thumbnails.forEach((url) => URL.revokeObjectURL(url));
}
