import { pdfjsLib } from "./pdfjs";
import { yieldToMain } from "./scheduler";
import { PDFDocument } from "pdf-lib";

export type ConversionMode = "pdf-to-img" | "img-to-pdf";

/** Raster output format for PDF → image. */
export type ImageFormat = "png" | "jpeg";

const FORMAT_SPEC: Record<ImageFormat, { mime: string; ext: string; quality: number }> = {
  // Lossless: keeps text and thin lines crisp. Bigger files.
  png: { mime: "image/png", ext: "png", quality: 1.0 },
  // Much smaller, visually indistinguishable at this quality for most pages.
  jpeg: { mime: "image/jpeg", ext: "jpg", quality: 0.92 },
};

export interface ConversionResult {
  blob: Blob;
  url: string;
  filename: string;
  type: string;
  pages?: number;
}

export interface ConversionError {
  title: string;
  message: string;
  suggestion: string;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const SUPPORTED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/bmp",
  "image/gif",
];

export function validateFile(
  file: File,
  mode: ConversionMode
): ConversionError | null {
  if (file.size > MAX_FILE_SIZE) {
    return {
      title: "Archivo demasiado grande",
      message: `El archivo "${file.name}" ocupa ${(file.size / (1024 * 1024)).toFixed(1)} MB y supera el máximo permitido de 50 MB.`,
      suggestion:
        "Comprime el archivo antes, o divide los PDF grandes en partes más pequeñas con la herramienta Dividir PDF.",
    };
  }

  if (mode === "pdf-to-img") {
    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      return {
        title: "Tipo de archivo no válido",
        message: `Se esperaba un PDF, pero se ha recibido "${file.type || "tipo desconocido"}" (${file.name}).`,
        suggestion:
          "Comprueba que el archivo sea un PDF válido. Si lo que quieres es convertir una imagen, usa la herramienta Imagen a PDF.",
      };
    }
  } else {
    if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
      return {
        title: "Formato de imagen no admitido",
        message: `El archivo "${file.name}" es de tipo "${file.type || "desconocido"}", que no está admitido.`,
        suggestion: "Formatos admitidos: PNG, JPEG, WebP, BMP y GIF. Convierte tu imagen a uno de ellos e inténtalo de nuevo.",
      };
    }
  }

  return null;
}

export async function pdfToImages(
  file: File,
  format: ImageFormat = "jpeg"
): Promise<ConversionResult[]> {
  try {
    const { mime, ext, quality } = FORMAT_SPEC[format];
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const results: ConversionResult[] = [];
    const totalPages = pdf.numPages;

    for (let i = 1; i <= totalPages; i++) {
      const page = await pdf.getPage(i);
      const scale = 2; // High quality
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context) {
        throw new Error("Could not create canvas context");
      }

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // JPEG has no alpha: without a white ground, transparent PDF areas
      // would encode as black.
      if (format === "jpeg") {
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
      }

      await page.render({
        canvasContext: context,
        viewport: viewport,
      } as any).promise;

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => {
            if (b) resolve(b);
            else reject(new Error("Failed to create image blob"));
          },
          mime,
          quality
        );
      });

      const url = URL.createObjectURL(blob);
      const baseName = file.name.replace(/\.pdf$/i, "");
      const filename =
        totalPages > 1 ? `${baseName}_pagina_${i}.${ext}` : `${baseName}.${ext}`;

      results.push({
        blob,
        url,
        filename,
        type: mime,
        pages: totalPages,
      });

      // Free the backing bitmap before rendering the next page; a 100-page PDF
      // at scale 2 otherwise holds every canvas alive at once.
      canvas.width = 0;
      canvas.height = 0;

      // Yield to the event loop so a long PDF doesn't freeze the tab (INP).
      await yieldToMain();
    }

    return results;
  } catch (error) {
    const err = error as Error;

    if (err.message?.includes("Invalid PDF")) {
      throw {
        title: "PDF no válido",
        message:
          "El archivo parece estar dañado o no es un documento PDF válido.",
        suggestion:
          "Ábrelo primero en un lector de PDF para comprobar que funciona. Si está cifrado o protegido con contraseña, quita la protección antes de convertirlo.",
      } as ConversionError;
    }

    if (err.message?.includes("password")) {
      throw {
        title: "PDF protegido con contraseña",
        message: "Este PDF está protegido con contraseña y no se puede convertir.",
        suggestion:
          "Quita la protección con contraseña desde tu lector de PDF y vuelve a intentarlo.",
      } as ConversionError;
    }

    throw {
      title: "La conversión ha fallado",
      message: `Ha ocurrido un error inesperado al convertir el PDF: ${err.message}`,
      suggestion:
        "Prueba con otro PDF. Si el problema continúa, es posible que el archivo esté dañado o use una función de PDF no admitida.",
    } as ConversionError;
  }
}

/** Embeds one image into `pdfDoc`, transcoding formats pdf-lib can't take natively. */
async function embedImage(pdfDoc: PDFDocument, file: File) {
  const imageBytes = await file.arrayBuffer();

  if (file.type === "image/png") return pdfDoc.embedPng(imageBytes);
  if (file.type === "image/jpeg" || file.type === "image/jpg") {
    return pdfDoc.embedJpg(imageBytes);
  }

  // pdf-lib only embeds PNG and JPEG. WebP, BMP and GIF go through a canvas
  // first, which the browser can decode natively.
  const img = await loadImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not create canvas context");
  ctx.drawImage(img, 0, 0);

  const pngBlob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Failed to convert image"))),
      "image/png",
      1.0
    );
  });

  URL.revokeObjectURL(img.src);
  canvas.width = 0;
  canvas.height = 0;

  return pdfDoc.embedPng(await pngBlob.arrayBuffer());
}

/**
 * Turns one or more images into a single PDF — one page per image, each page
 * sized to that image exactly (no letterboxing, no forced A4).
 *
 * Page order follows the order of `files`, which is the order the user arranged
 * in the UI.
 */
export async function imagesToPdf(files: File[]): Promise<ConversionResult> {
  if (files.length === 0) {
    throw {
      title: "Sin imágenes",
      message: "No has añadido ninguna imagen.",
      suggestion: "Arrastra al menos una imagen para crear el PDF.",
    } as ConversionError;
  }

  try {
    const pdfDoc = await PDFDocument.create();

    for (const file of files) {
      const image = await embedImage(pdfDoc, file);
      const { width, height } = image;
      // Each page takes the exact dimensions of its image.
      const page = pdfDoc.addPage([width, height]);
      page.drawImage(image, { x: 0, y: 0, width, height });

      // Encoding several large images is one long task otherwise (INP).
      await yieldToMain();
    }

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    // One image keeps its own name; several become a single named document.
    const filename =
      files.length === 1
        ? `${files[0].name.replace(/\.[^.]+$/, "")}.pdf`
        : "imagenes.pdf";

    return {
      blob,
      url,
      filename,
      type: "application/pdf",
      pages: files.length,
    };
  } catch (error) {
    if ((error as ConversionError).title) throw error;
    const err = error as Error;
    throw {
      title: "La conversión de la imagen ha fallado",
      message: `No se ha podido convertir la imagen a PDF: ${err.message}`,
      suggestion:
        "Comprueba que la imagen no esté dañada abriéndola primero en un visor. Formatos admitidos: PNG, JPEG, WebP, BMP y GIF.",
    } as ConversionError;
  }
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
}
