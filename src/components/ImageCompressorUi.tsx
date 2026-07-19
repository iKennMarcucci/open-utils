"use client";

import { useEffect, useRef, useState } from "react";
import { Download, UploadCloud } from "lucide-react";
import { saveAs } from "file-saver";
import { fileToImage, drawToCanvas, canvasToBlob, loadImage, formatBytes } from "@/lib/canvas";
import { ToolLayout } from "@/components/ToolLayout";
import { ExampleButton } from "@/components/ExampleButton";
import { FileDropzone } from "@/components/FileDropzone";

type Fmt = "image/jpeg" | "image/webp" | "image/png";
const FORMATS: { id: Fmt; label: string; ext: string; lossy: boolean }[] = [
  { id: "image/jpeg", label: "JPEG", ext: "jpg", lossy: true },
  { id: "image/webp", label: "WebP", ext: "webp", lossy: true },
  { id: "image/png", label: "PNG", ext: "png", lossy: false },
];

export function ImageCompressorUi() {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [format, setFormat] = useState<Fmt>("image/jpeg");
  const [quality, setQuality] = useState(0.7);
  const [maxWidth, setMaxWidth] = useState(0); // 0 = keep original
  const [out, setOut] = useState<{ blob: Blob; url: string } | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!img) return;
    let cancelled = false;
    const run = async () => {
      const scale = maxWidth > 0 && img.width > maxWidth ? maxWidth / img.width : 1;
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = drawToCanvas(img, w, h);
      const lossy = FORMATS.find((f) => f.id === format)!.lossy;
      const blob = await canvasToBlob(canvas, format, lossy ? quality : undefined);
      if (cancelled) return;
      setOut((prev) => {
        if (prev) URL.revokeObjectURL(prev.url);
        return { blob, url: URL.createObjectURL(blob) };
      });
    };
    run();
    return () => { cancelled = true; };
  }, [img, format, quality, maxWidth]);

  const onFile = async (file: File) => {
    setOriginalSize(file.size);
    setImg(await fileToImage(file));
  };

  const loadExample = async () => {
    const c = document.createElement("canvas");
    c.width = 1200; c.height = 800;
    const ctx = c.getContext("2d")!;
    for (let i = 0; i < 4000; i++) {
      ctx.fillStyle = `hsl(${(i * 37) % 360} 70% ${40 + (i % 40)}%)`;
      ctx.fillRect(Math.random() * 1200, Math.random() * 800, 30, 30);
    }
    const blob = await canvasToBlob(c, "image/png");
    setOriginalSize(blob.size);
    setImg(await loadImage(URL.createObjectURL(blob)));
  };

  const reduction = out && originalSize ? Math.round((1 - out.blob.size / originalSize) * 100) : 0;
  const ext = FORMATS.find((f) => f.id === format)!.ext;

  return (
    <ToolLayout
      slug="comprimir-imagen"
      actions={
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={() => fileRef.current?.click()} className="ou-btn ou-btn-secondary"><UploadCloud className="h-4 w-4" /> Elegir imagen</button>
          <ExampleButton onClick={loadExample} />
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ""; }} />
        </div>
      }
    >
        {!img ? (
          <FileDropzone
            onFiles={(files) => onFile(files[0])}
            accept="image/*"
            title="Arrastra una imagen aquí"
          />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="flex min-w-0 min-h-[280px] items-center justify-center overflow-hidden rounded-panel border border-border bg-surface/30 p-4">
              {out && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={out.url} alt="Vista previa comprimida" className="max-h-[420px] max-w-full rounded" />
              )}
            </div>

            <div className="min-w-0 space-y-5">
              <div>
                <p className="ou-label mb-2">Formato</p>
                <div className="flex items-center gap-1 rounded-control border border-border bg-surface p-1">
                  {FORMATS.map((f) => (
                    <button key={f.id} onClick={() => setFormat(f.id)} className={`flex-1 px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${format === f.id ? "bg-surface-strong text-foreground" : "text-foreground-faint hover:text-foreground"}`}>{f.label}</button>
                  ))}
                </div>
              </div>

              {FORMATS.find((f) => f.id === format)!.lossy && (
                <div>
                  <div className="mb-2 flex items-center justify-between"><span className="ou-label">Calidad</span><span className="text-sm text-foreground">{Math.round(quality * 100)}%</span></div>
                  <input type="range" min={10} max={100} value={Math.round(quality * 100)} onChange={(e) => setQuality(Number(e.target.value) / 100)} className="w-full accent-[var(--accent-text)]" />
                </div>
              )}

              <div>
                <p className="ou-label mb-2">Ancho máximo (px)</p>
                <input type="number" min={0} value={maxWidth} onChange={(e) => setMaxWidth(Math.max(0, Number(e.target.value) || 0))} placeholder="0 = mantener original" className="w-full rounded-control border border-border bg-surface px-3 h-10 text-sm text-foreground outline-none focus:border-border-strong" />
              </div>

              <div className="rounded-panel border border-border bg-surface/50 p-4 text-sm">
                <div className="flex items-center justify-between"><span className="text-foreground-faint">Original</span><span className="font-mono text-foreground">{formatBytes(originalSize)}</span></div>
                <div className="mt-1.5 flex items-center justify-between"><span className="text-foreground-faint">Comprimida</span><span className="font-mono text-foreground">{out ? formatBytes(out.blob.size) : "—"}</span></div>
                {reduction > 0 && <div className="mt-2 rounded bg-success-text/10 px-2 py-1 text-center text-xs font-medium text-success-text">−{reduction}% de tamaño</div>}
              </div>

              <button onClick={() => out && saveAs(out.blob, `comprimida.${ext}`)} disabled={!out} className="ou-btn ou-btn-accent h-11 w-full disabled:opacity-50">
                <Download className="h-4 w-4" /> Descargar
              </button>
            </div>
          </div>
        )}
    </ToolLayout>
  );
}
