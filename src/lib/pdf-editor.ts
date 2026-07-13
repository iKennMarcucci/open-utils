import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";
import { pdfjsLib } from "./pdfjs";
import { yieldToMain } from "./scheduler";
import {
  type Annotation,
  type EditorError,
  drawAnnotation,
  moveAnn,
} from "./editor-core";


export interface EditablePage {
  /** Stable id, independent of position, used to key annotations & history. */
  id: string;
  /** Index into the original PDF document. */
  srcIndex: number;
  /** User rotation delta applied on top of the page's intrinsic rotation. */
  rotation: number;
  /** Rendered editing background (at `editScale`, rotated). */
  bitmap: ImageBitmap;
  /** Bitmap pixel dimensions (rotated). */
  width: number;
  height: number;
  /** pdf.js scale used for the editing bitmap. */
  editScale: number;
  /** Intrinsic page rotation from the source file. */
  nativeRotation: number;
}

export interface EditablePdf {
  name: string;
  bytes: ArrayBuffer;
  pages: EditablePage[];
}

const MAX_FILE_SIZE = 100 * 1024 * 1024;
const MAX_EDIT_WIDTH = 1400;
const MAX_EXPORT_WIDTH = 2600;

type PdfDoc = Awaited<ReturnType<typeof pdfjsLib.getDocument>["promise"]>;

let pageIdCounter = 0;

async function renderPage(
  doc: PdfDoc,
  pageNo: number,
  scale: number,
  rotation: number
): Promise<{ canvas: HTMLCanvasElement; width: number; height: number }> {
  const page = await doc.getPage(pageNo);
  const viewport = page.getViewport({ scale, rotation });
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo crear el contexto de canvas");
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await page.render({ canvasContext: ctx, viewport } as any).promise;
  return { canvas, width: canvas.width, height: canvas.height };
}

/** Loads a PDF and renders an editing bitmap for every page. */
export async function loadPdfForEditing(file: File): Promise<EditablePdf> {
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    throw {
      title: "Archivo no válido",
      message: `Se esperaba un PDF pero se recibió "${file.type || "tipo desconocido"}".`,
      suggestion: "Selecciona un archivo con extensión .pdf.",
    } as EditorError;
  }
  if (file.size > MAX_FILE_SIZE) {
    throw {
      title: "Archivo demasiado grande",
      message: `"${file.name}" pesa ${(file.size / (1024 * 1024)).toFixed(1)}MB y supera el máximo de 100MB.`,
      suggestion: "Usa un PDF más ligero para editarlo con fluidez.",
    } as EditorError;
  }

  try {
    const bytes = await file.arrayBuffer();
    const doc = await pdfjsLib.getDocument({ data: bytes.slice(0) }).promise;
    const pages: EditablePage[] = [];

    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const nativeRotation = page.rotate ?? 0;
      const base = page.getViewport({ scale: 1, rotation: nativeRotation });
      const editScale = Math.min(1.5, MAX_EDIT_WIDTH / base.width);
      const { canvas, width, height } = await renderPage(doc, i, editScale, nativeRotation);
      const bitmap = await createImageBitmap(canvas);
      pages.push({
        id: `pg${pageIdCounter++}`,
        srcIndex: i - 1,
        rotation: 0,
        bitmap,
        width,
        height,
        editScale,
        nativeRotation,
      });

      // Rendering every page of a large PDF is one long task on the main thread:
      // while it runs, the tab is frozen. Yielding lets the browser paint and
      // respond between pages (INP).
      await yieldToMain();
    }

    await doc.cleanup();
    return { name: file.name, bytes, pages };
  } catch (error) {
    if ((error as EditorError).title) throw error;
    const err = error as Error;
    throw {
      title: "No se pudo abrir el PDF",
      message: `El archivo parece dañado o no es un PDF válido: ${err.message}`,
      suggestion: "Si está protegido con contraseña, retírala e intenta de nuevo.",
    } as EditorError;
  }
}

/** Re-renders a single page's editing bitmap at a new rotation. */
export async function renderPageBitmap(
  bytes: ArrayBuffer,
  page: EditablePage,
  rotation: number
): Promise<{ bitmap: ImageBitmap; width: number; height: number }> {
  const doc = await pdfjsLib.getDocument({ data: bytes.slice(0) }).promise;
  const abs = (page.nativeRotation + rotation) % 360;
  const { canvas, width, height } = await renderPage(doc, page.srcIndex + 1, page.editScale, abs);
  const bitmap = await createImageBitmap(canvas);
  await doc.cleanup();
  return { bitmap, width, height };
}

/** Draws annotations only (no background) onto a transparent canvas at scale. */
function flattenAnnotations(
  ctx: CanvasRenderingContext2D,
  anns: Annotation[],
  scaleRatio: number
) {
  ctx.save();
  ctx.scale(scaleRatio, scaleRatio);
  for (const a of anns) drawAnnotation(ctx, a);
  ctx.restore();
}

export interface ExportPageSpec {
  page: EditablePage;
  annotations: Annotation[];
}

/**
 * Builds the output PDF. Pages with no edits are copied as vector to preserve
 * quality; edited or rotated pages are flattened to a high-resolution raster so
 * the result matches the editor exactly.
 */
export async function exportEditedPdf(
  bytes: ArrayBuffer,
  specs: ExportPageSpec[]
): Promise<Blob> {
  if (specs.length === 0) {
    throw {
      title: "Sin páginas",
      message: "El documento no tiene páginas para exportar.",
      suggestion: "Carga un PDF y vuelve a intentarlo.",
    } as EditorError;
  }

  try {
    const out = await PDFDocument.create();
    const src = await PDFDocument.load(bytes.slice(0), { ignoreEncryption: true });

    const needsRaster = specs.some((s) => s.annotations.length > 0 || s.page.rotation !== 0);
    const rasterDoc = needsRaster
      ? await pdfjsLib.getDocument({ data: bytes.slice(0) }).promise
      : null;

    for (const { page, annotations } of specs) {
      const untouched = annotations.length === 0 && page.rotation === 0;

      if (untouched) {
        const [copied] = await out.copyPages(src, [page.srcIndex]);
        out.addPage(copied);
        continue;
      }

      const abs = (page.nativeRotation + page.rotation) % 360;
      const pdfjsPage = await rasterDoc!.getPage(page.srcIndex + 1);

      // Point dimensions of the (rotated) page — the output page size.
      const ptView = pdfjsPage.getViewport({ scale: 1, rotation: abs });

      // Export raster scale, capped for memory.
      const exportScale = Math.min(2, MAX_EXPORT_WIDTH / ptView.width);
      const bg = await renderPage(rasterDoc!, page.srcIndex + 1, exportScale, abs);

      const canvas = document.createElement("canvas");
      canvas.width = bg.width;
      canvas.height = bg.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("No se pudo crear el contexto de canvas");
      ctx.drawImage(bg.canvas, 0, 0);
      // Annotations live in editScale space; scale them into export space.
      flattenAnnotations(ctx, annotations, bg.width / page.width);

      const pngBytes = await new Promise<Uint8Array>((resolve, reject) => {
        canvas.toBlob(async (b) => {
          if (!b) return reject(new Error("Fallo al generar la página"));
          resolve(new Uint8Array(await b.arrayBuffer()));
        }, "image/png");
      });

      const embedded = await out.embedPng(pngBytes);
      const outPage = out.addPage([ptView.width, ptView.height]);
      outPage.drawImage(embedded, {
        x: 0,
        y: 0,
        width: ptView.width,
        height: ptView.height,
      });
    }

    if (rasterDoc) await rasterDoc.cleanup();
    const saved = await out.save();
    return new Blob([saved as BlobPart], { type: "application/pdf" });
  } catch (error) {
    if ((error as EditorError).title) throw error;
    const err = error as Error;
    throw {
      title: "Error al exportar",
      message: `No se pudo generar el PDF: ${err.message}`,
      suggestion: "Verifica el documento e intenta de nuevo.",
    } as EditorError;
  }
}

export function downloadPdf(blob: Blob, sourceName: string) {
  const base = sourceName.replace(/\.pdf$/i, "");
  saveAs(blob, `${base}_editado.pdf`);
}

/** Loads an image file to a data URL + natural size, for insertion. */

// Re-export for convenience so UIs import from one place.
export { moveAnn };

// These three live in `editor-core` (they are PDF-agnostic). Re-exported here so
// existing importers of `@/lib/pdf-editor` keep working — but the image editor
// must import them from `editor-core` directly, or it drags pdf-lib + pdfjs
// (hundreds of KB it never uses) into its bundle.
export { rotateAnnotations, loadImageForInsertion, type EditorError } from "./editor-core";
