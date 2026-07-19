import { describe, it, expect, vi } from "vitest";

// converter.ts pulls in pdf.js at module load for the conversion paths, which
// needs browser globals (DOMMatrix) absent in the node test env. validateFile
// itself is pure, so we stub the pdf.js shim to import the module cleanly.
vi.mock("@/lib/pdfjs", () => ({ pdfjsLib: {} }));

import { validateFile, type ConversionMode } from "@/lib/converter";

// validateFile only reads size, name and type, so a light stand-in avoids
// allocating a real 50 MB buffer just to exercise the size guard.
function fakeFile(opts: { name: string; type: string; size: number }): File {
  return opts as unknown as File;
}

const MB = 1024 * 1024;

describe("validateFile — size guard", () => {
  it("rejects any file larger than 50 MB, in either mode", () => {
    const big = fakeFile({ name: "huge.pdf", type: "application/pdf", size: 51 * MB });
    for (const mode of ["pdf-to-img", "img-to-pdf"] as ConversionMode[]) {
      const err = validateFile(big, mode);
      expect(err?.title).toBe("Archivo demasiado grande");
      expect(err?.message).toContain("huge.pdf");
    }
  });

  it("accepts a file exactly at the 50 MB boundary", () => {
    const edge = fakeFile({ name: "edge.pdf", type: "application/pdf", size: 50 * MB });
    expect(validateFile(edge, "pdf-to-img")).toBeNull();
  });
});

describe("validateFile — pdf-to-img mode", () => {
  it("accepts a proper application/pdf", () => {
    const f = fakeFile({ name: "doc.pdf", type: "application/pdf", size: 1000 });
    expect(validateFile(f, "pdf-to-img")).toBeNull();
  });

  it("accepts a .pdf even when the browser reports no MIME type", () => {
    const f = fakeFile({ name: "doc.pdf", type: "", size: 1000 });
    expect(validateFile(f, "pdf-to-img")).toBeNull();
  });

  it("rejects an image when a PDF is expected", () => {
    const f = fakeFile({ name: "photo.png", type: "image/png", size: 1000 });
    const err = validateFile(f, "pdf-to-img");
    expect(err?.title).toBe("Tipo de archivo no válido");
    expect(err?.message).toContain("photo.png");
  });

  it("reports 'tipo desconocido' when the type is empty and name is not .pdf", () => {
    const f = fakeFile({ name: "mystery", type: "", size: 1000 });
    const err = validateFile(f, "pdf-to-img");
    expect(err?.message).toContain("tipo desconocido");
  });
});

describe("validateFile — img-to-pdf mode", () => {
  it.each(["image/png", "image/jpeg", "image/jpg", "image/webp", "image/bmp", "image/gif"])(
    "accepts %s",
    (type) => {
      const f = fakeFile({ name: `img.${type.split("/")[1]}`, type, size: 1000 });
      expect(validateFile(f, "img-to-pdf")).toBeNull();
    },
  );

  it("rejects a PDF when an image is expected", () => {
    const f = fakeFile({ name: "doc.pdf", type: "application/pdf", size: 1000 });
    const err = validateFile(f, "img-to-pdf");
    expect(err?.title).toBe("Formato de imagen no admitido");
  });

  it("rejects an unsupported image type (e.g. tiff/svg/avif)", () => {
    for (const type of ["image/tiff", "image/svg+xml", "image/avif"]) {
      const f = fakeFile({ name: "x", type, size: 1000 });
      expect(validateFile(f, "img-to-pdf")?.title).toBe("Formato de imagen no admitido");
    }
  });
});
