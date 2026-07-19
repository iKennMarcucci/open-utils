"use client";

import { useEffect, useRef, useState } from "react";
import { Download, UploadCloud } from "lucide-react";
import { saveAs } from "file-saver";
import { fileToImage, canvasToBlob, loadImage } from "@/lib/canvas";
import { buildIco, ICO_SIZES } from "@/lib/ico";
import { ToolLayout } from "@/components/ToolLayout";
import { ExampleButton } from "@/components/ExampleButton";
import { FileDropzone } from "@/components/FileDropzone";

/** Draw a source image centered and cropped to a square of `size`. */
function squareCanvas(img: HTMLImageElement, size: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  const side = Math.min(img.width, img.height);
  const sx = (img.width - side) / 2;
  const sy = (img.height - side) / 2;
  ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
  return canvas;
}

export function FaviconUi() {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [busy, setBusy] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Render preview tiles whenever the image changes.
  useEffect(() => {
    const host = previewRef.current;
    if (!host || !img) return;
    host.innerHTML = "";
    for (const size of ICO_SIZES) {
      const c = squareCanvas(img, size);
      c.style.width = `${size}px`;
      c.style.height = `${size}px`;
      c.className = "rounded border border-border bg-surface";
      const wrap = document.createElement("div");
      wrap.className = "flex flex-col items-center gap-1.5";
      const label = document.createElement("span");
      label.className = "text-[11px] text-foreground-faint";
      label.textContent = `${size}×${size}`;
      wrap.append(c, label);
      host.append(wrap);
    }
  }, [img]);

  const onFile = async (file: File) => {
    setImg(await fileToImage(file));
  };

  const loadExample = async () => {
    // Build a sample logo on a canvas, then use it as the source image.
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 256;
    const ctx = c.getContext("2d")!;
    const g = ctx.createLinearGradient(0, 0, 256, 256);
    g.addColorStop(0, "#0ea5e9");
    g.addColorStop(1, "#6d28d9");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 150px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("O", 128, 138);
    setImg(await loadImage(c.toDataURL("image/png")));
  };

  const download = async () => {
    if (!img) return;
    setBusy(true);
    try {
      const frames = [];
      for (const size of ICO_SIZES) {
        const blob = await canvasToBlob(squareCanvas(img, size), "image/png");
        frames.push({ size, png: new Uint8Array(await blob.arrayBuffer()) });
      }
      saveAs(buildIco(frames), "favicon.ico");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ToolLayout
      slug="generar-favicon"
      actions={
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={() => fileRef.current?.click()} className="ou-btn ou-btn-secondary">
            <UploadCloud className="h-4 w-4" />
            Elegir imagen
          </button>
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
            hint="Se recorta al centro en cuadrado."
          />
        ) : (
          <div className="space-y-6">
            <div ref={previewRef} className="flex flex-wrap items-end justify-center gap-6 rounded-panel border border-border bg-surface/30 p-6" />
            <div className="flex justify-center">
              <button onClick={download} disabled={busy} className="ou-btn ou-btn-accent h-11 px-6 disabled:opacity-50">
                <Download className="h-4 w-4" />
                {busy ? "Generando…" : "Descargar favicon.ico"}
              </button>
            </div>
            <p className="text-center text-sm text-foreground-faint">
              El .ico incluye los tamaños {ICO_SIZES.join(", ")} px.
            </p>
          </div>
        )}
    </ToolLayout>
  );
}
