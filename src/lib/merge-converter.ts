import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export interface MergeError {
  title: string;
  message: string;
  suggestion: string;
}

export interface MergeResult {
  blob: Blob;
  url: string;
  filename: string;
  type: string;
  pages: number;
}

export type MergeItemKind = "pdf" | "image";

export interface MergeItem {
  id: string;
  file: File;
  kind: MergeItemKind;
  /** Object URL for image preview (null for PDFs). */
  preview: string | null;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB per file
const SUPPORTED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/bmp",
  "image/gif",
];


function makeId(file: File, index: number): string {
  return `${file.name}-${file.size}-${file.lastModified}-${index}`;
}

/**
 * Classifies a dropped/selected file and validates it. Returns either a
 * ready-to-use MergeItem or a MergeError describing why it was rejected.
 */
export function buildMergeItem(
  file: File,
  index: number
): { item: MergeItem | null; error: MergeError | null } {
  if (file.size > MAX_FILE_SIZE) {
    return {
      item: null,
      error: {
        title: "Archivo demasiado grande",
        message: `"${file.name}" pesa ${(file.size / (1024 * 1024)).toFixed(
          1
        )}MB, supera el máximo de 50MB por archivo.`,
        suggestion:
          "Comprime el archivo o divídelo en partes más pequeñas antes de unirlo.",
      },
    };
  }

  const isPdf =
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  const isImage = SUPPORTED_IMAGE_TYPES.includes(file.type);

  if (!isPdf && !isImage) {
    return {
      item: null,
      error: {
        title: "Formato no admitido",
        message: `"${file.name}" tiene el tipo "${
          file.type || "desconocido"
        }", que no se puede unir.`,
        suggestion:
          "Solo se admiten archivos PDF e imágenes (PNG, JPG, WebP, BMP, GIF).",
      },
    };
  }

  const kind: MergeItemKind = isPdf ? "pdf" : "image";
  return {
    item: {
      id: makeId(file, index),
      file,
      kind,
      preview: isImage ? URL.createObjectURL(file) : null,
    },
    error: null,
  };
}

function loadImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("No se pudo cargar la imagen"));
    img.src = URL.createObjectURL(file);
  });
}

/** Converts any image File into PNG bytes via canvas (used for webp/bmp/gif). */
async function imageToPngBytes(file: File): Promise<ArrayBuffer> {
  const img = await loadImageElement(file);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo crear el contexto de canvas");
  ctx.drawImage(img, 0, 0);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Fallo al convertir la imagen"))),
      "image/png",
      1.0
    );
  });
  return blob.arrayBuffer();
}

/**
 * Merges the given ordered items into a single paginated PDF.
 * - PDF inputs contribute all of their pages, in order.
 * - Image inputs each become one page sized to the image's own dimensions and
 *   aspect ratio (no white padding); the image fills the page edge to edge.
 * Page numbers ("n / total") are stamped at the bottom of every page.
 */
export async function mergeToPdf(
  items: MergeItem[],
  options: { addPageNumbers?: boolean; filename?: string } = {}
): Promise<MergeResult> {
  const { addPageNumbers = true, filename = "documento-unificado.pdf" } = options;

  if (items.length === 0) {
    throw {
      title: "Sin archivos",
      message: "Agrega al menos un PDF o imagen para unificar.",
      suggestion: "Arrastra o selecciona archivos en el área de entrada.",
    } as MergeError;
  }

  try {
    const outDoc = await PDFDocument.create();
    // Track which output pages came from images so the page number can be
    // drawn with a legible backdrop instead of plain gray text.
    const imagePageIndices = new Set<number>();

    for (const item of items) {
      if (item.kind === "pdf") {
        const bytes = await item.file.arrayBuffer();
        const srcDoc = await PDFDocument.load(bytes, {
          ignoreEncryption: true,
        });
        const copied = await outDoc.copyPages(srcDoc, srcDoc.getPageIndices());
        copied.forEach((p) => outDoc.addPage(p));
      } else {
        const bytes = await item.file.arrayBuffer();
        let embedded;
        if (item.file.type === "image/png") {
          embedded = await outDoc.embedPng(bytes);
        } else if (
          item.file.type === "image/jpeg" ||
          item.file.type === "image/jpg"
        ) {
          embedded = await outDoc.embedJpg(bytes);
        } else {
          const pngBytes = await imageToPngBytes(item.file);
          embedded = await outDoc.embedPng(pngBytes);
        }

        // Page matches the image's own size and aspect ratio; the image
        // fills the page completely (no white padding).
        const page = outDoc.addPage([embedded.width, embedded.height]);
        page.drawImage(embedded, {
          x: 0,
          y: 0,
          width: embedded.width,
          height: embedded.height,
        });
        imagePageIndices.add(outDoc.getPageCount() - 1);
      }
    }

    const totalPages = outDoc.getPageCount();

    if (addPageNumbers) {
      const font = await outDoc.embedFont(StandardFonts.Helvetica);
      const pages = outDoc.getPages();
      pages.forEach((page, idx) => {
        const label = `${idx + 1} / ${totalPages}`;
        const { width } = page.getSize();
        const isImagePage = imagePageIndices.has(idx);

        // Scale the label to the page so it stays readable on large images.
        const fontSize = isImagePage
          ? Math.min(Math.max(width * 0.018, 10), 28)
          : 10;
        const textWidth = font.widthOfTextAtSize(label, fontSize);
        const textX = (width - textWidth) / 2;
        const textY = isImagePage ? fontSize * 0.9 : 18;

        if (isImagePage) {
          // Semitransparent dark pill so the number is legible over any image.
          const padX = fontSize * 0.6;
          const padY = fontSize * 0.4;
          page.drawRectangle({
            x: textX - padX,
            y: textY - padY,
            width: textWidth + padX * 2,
            height: fontSize + padY * 2,
            color: rgb(0, 0, 0),
            opacity: 0.45,
          });
          page.drawText(label, {
            x: textX,
            y: textY,
            size: fontSize,
            font,
            color: rgb(1, 1, 1),
          });
        } else {
          page.drawText(label, {
            x: textX,
            y: textY,
            size: fontSize,
            font,
            color: rgb(0.4, 0.4, 0.4),
          });
        }
      });
    }

    const pdfBytes = await outDoc.save();
    const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    const safeName = filename.toLowerCase().endsWith(".pdf")
      ? filename
      : `${filename}.pdf`;

    return {
      blob,
      url,
      filename: safeName,
      type: "application/pdf",
      pages: totalPages,
    };
  } catch (error) {
    if ((error as MergeError).title) throw error;

    const err = error as Error;
    if (err.message?.includes("encrypted") || err.message?.includes("password")) {
      throw {
        title: "PDF protegido",
        message:
          "Uno de los PDF está protegido con contraseña y no se puede unir.",
        suggestion:
          "Quita la protección del PDF con tu lector y vuelve a intentarlo.",
      } as MergeError;
    }

    throw {
      title: "Error al unificar",
      message: `Ocurrió un error al generar el PDF: ${err.message}`,
      suggestion:
        "Verifica que todos los archivos sean válidos. Si un PDF está dañado o usa funciones no soportadas, retíralo e intenta de nuevo.",
    } as MergeError;
  }
}
