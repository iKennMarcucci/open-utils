"use client";

import { useState } from "react";
import { AlertCircle, FileText, ImageIcon, UploadCloud } from "lucide-react";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { readImageMetadata, readPdfMetadata, type MetaRow } from "@/lib/metadata";
import { loadImage } from "@/lib/canvas";
import { ToolLayout } from "@/components/ToolLayout";
import { ExampleButton } from "@/components/ExampleButton";
import { FileDropzone } from "@/components/FileDropzone";

export function MetadataUi() {
  const [rows, setRows] = useState<MetaRow[] | null>(null);
  const [name, setName] = useState("");
  const [kind, setKind] = useState<"image" | "pdf" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handle = async (file: File) => {
    setError(null);
    setName(file.name);
    try {
      if (file.type === "application/pdf" || /\.pdf$/i.test(file.name)) {
        setKind("pdf");
        setRows(await readPdfMetadata(file));
      } else if (file.type.startsWith("image/") || /\.(png|jpe?g|gif|webp|bmp)$/i.test(file.name)) {
        setKind("image");
        setRows(await readImageMetadata(file));
      } else {
        setError("Formato no soportado. Sube una imagen (JPG, PNG, WebP…) o un PDF.");
        setRows(null);
      }
    } catch {
      setError("No se pudo leer el archivo. Puede estar dañado o protegido.");
      setRows(null);
    }
  };

  const loadExample = async () => {
    // Build a small PDF with real metadata and read it back.
    const doc = await PDFDocument.create();
    doc.setTitle("Informe trimestral");
    doc.setAuthor("Ada Lovelace");
    doc.setSubject("Resultados Q1");
    doc.setKeywords(["informe", "finanzas", "ejemplo"]);
    doc.setProducer("Open Utils");
    doc.setCreationDate(new Date(Date.UTC(2026, 0, 15, 9, 30)));
    const page = doc.addPage([595, 842]);
    const font = await doc.embedFont(StandardFonts.Helvetica);
    page.drawText("Documento de ejemplo", { x: 60, y: 760, size: 24, font });
    const bytes = await doc.save();
    await handle(new File([bytes as BlobPart], "ejemplo.pdf", { type: "application/pdf" }));
  };

  return (
    <ToolLayout
      slug="ver-metadatos"
      actions={
        <>
          <label className="ou-btn ou-btn-secondary cursor-pointer">
            <UploadCloud className="h-4 w-4" /> Elegir archivo
            <input type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handle(f); e.target.value = ""; }} />
          </label>
          <ExampleButton onClick={loadExample} />
        </>
      }
    >
        {error && (
          <div className="flex items-start gap-3 rounded-panel border border-error/40 bg-error/5 p-4">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-error-text" />
            <p className="text-sm text-error-text">{error}</p>
          </div>
        )}

        {!rows && !error && (
          <FileDropzone
            onFiles={(files) => handle(files[0])}
            accept="image/*,application/pdf"
            title="Arrastra una imagen o un PDF"
            hint="Verás sus metadatos: dimensiones, EXIF, páginas y más."
          />
        )}

        {rows && (
          <div className="overflow-hidden rounded-panel border border-border">
            <div className="flex items-center gap-2 border-b border-border bg-surface/50 px-4 py-3">
              {kind === "pdf" ? <FileText className="h-4 w-4 text-accent-text" /> : <ImageIcon className="h-4 w-4 text-accent-text" />}
              <span className="truncate text-sm font-medium text-foreground">{name}</span>
            </div>
            <dl className="divide-y divide-border">
              {rows.map((r) => (
                <div key={r.label} className="flex flex-col gap-1 px-4 py-2.5 sm:flex-row sm:gap-4">
                  <dt className="w-40 shrink-0 text-xs text-foreground-faint">{r.label}</dt>
                  <dd className="min-w-0 flex-1 break-words font-mono text-sm text-foreground">{r.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
    </ToolLayout>
  );
}
