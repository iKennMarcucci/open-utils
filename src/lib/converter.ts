import * as pdfjsLib from "pdfjs-dist";
import { PDFDocument } from "pdf-lib";

// Configure PDF.js worker
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

export type ConversionMode = "pdf-to-img" | "img-to-pdf";

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
      title: "File too large",
      message: `The file "${file.name}" is ${(file.size / (1024 * 1024)).toFixed(1)}MB, which exceeds the maximum allowed size of 50MB.`,
      suggestion:
        "Try compressing the file first, or split large PDFs into smaller parts before converting.",
    };
  }

  if (mode === "pdf-to-img") {
    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      return {
        title: "Invalid file type",
        message: `Expected a PDF file but received "${file.type || "unknown type"}" (${file.name}).`,
        suggestion:
          'Make sure you are uploading a valid PDF file. If the file has a different extension, try renaming it to .pdf. You can also switch to "IMG → PDF" mode if you want to convert an image instead.',
      };
    }
  } else {
    if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
      return {
        title: "Unsupported image format",
        message: `The file "${file.name}" has type "${file.type || "unknown"}" which is not supported.`,
        suggestion: `Supported formats: PNG, JPEG, WebP, BMP, GIF. Try converting your image to one of these formats first using an image editor.`,
      };
    }
  }

  return null;
}

export async function pdfToImages(file: File): Promise<ConversionResult[]> {
  try {
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
          "image/png",
          1.0
        );
      });

      const url = URL.createObjectURL(blob);
      const baseName = file.name.replace(/\.pdf$/i, "");
      const filename =
        totalPages > 1
          ? `${baseName}_page_${i}.png`
          : `${baseName}.png`;

      results.push({
        blob,
        url,
        filename,
        type: "image/png",
        pages: totalPages,
      });
    }

    return results;
  } catch (error) {
    const err = error as Error;

    if (err.message?.includes("Invalid PDF")) {
      throw {
        title: "Invalid PDF file",
        message:
          "The file appears to be corrupted or is not a valid PDF document.",
        suggestion:
          "Try opening the file in a PDF reader first to verify it works. If the file is encrypted or password-protected, remove the protection before converting.",
      } as ConversionError;
    }

    if (err.message?.includes("password")) {
      throw {
        title: "Password-protected PDF",
        message: "This PDF is password-protected and cannot be converted.",
        suggestion:
          "Remove the password protection from the PDF using your PDF reader or an online tool, then try again.",
      } as ConversionError;
    }

    throw {
      title: "Conversion failed",
      message: `An unexpected error occurred while converting the PDF: ${err.message}`,
      suggestion:
        "Try with a different PDF file. If the problem persists, the file might be corrupted or use an unsupported PDF feature.",
    } as ConversionError;
  }
}

export async function imageToPdf(file: File): Promise<ConversionResult> {
  try {
    const imageBytes = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.create();

    let image;
    if (file.type === "image/png") {
      image = await pdfDoc.embedPng(imageBytes);
    } else if (
      file.type === "image/jpeg" ||
      file.type === "image/jpg"
    ) {
      image = await pdfDoc.embedJpg(imageBytes);
    } else {
      // For other formats, convert to PNG first via canvas
      const img = await loadImage(file);
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not create canvas context");
      ctx.drawImage(img, 0, 0);

      const pngBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => {
            if (b) resolve(b);
            else reject(new Error("Failed to convert image"));
          },
          "image/png",
          1.0
        );
      });

      const pngBytes = await pngBlob.arrayBuffer();
      image = await pdfDoc.embedPng(pngBytes);
    }

    const { width, height } = image;
    const page = pdfDoc.addPage([width, height]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width,
      height,
    });

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const baseName = file.name.replace(/\.[^.]+$/, "");

    return {
      blob,
      url,
      filename: `${baseName}.pdf`,
      type: "application/pdf",
    };
  } catch (error) {
    if ((error as ConversionError).title) {
      throw error;
    }

    const err = error as Error;
    throw {
      title: "Image conversion failed",
      message: `Failed to convert the image to PDF: ${err.message}`,
      suggestion:
        "Make sure the image is not corrupted. Try opening it in an image viewer first. Supported formats: PNG, JPEG, WebP, BMP, GIF.",
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
