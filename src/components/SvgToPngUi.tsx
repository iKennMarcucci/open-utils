"use client";

import { useMemo, useState } from "react";
import { AlertCircle, Download, UploadCloud } from "lucide-react";
import { saveAs } from "file-saver";
import { svgToPngBlob } from "@/lib/canvas";
import { ToolLayout } from "@/components/ToolLayout";
import { ExampleButton } from "@/components/ExampleButton";

const svgToDataUriSafe = (svg: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

const SAMPLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240">
  <rect width="240" height="240" rx="32" fill="#0ea5e9"/>
  <circle cx="120" cy="120" r="64" fill="none" stroke="#fff" stroke-width="14"/>
  <path d="M120 60v120M60 120h120" stroke="#fff" stroke-width="14" stroke-linecap="round"/>
</svg>`;

function intrinsicSize(svg: string): { w: number; h: number } {
  const wm = /width="([\d.]+)"/.exec(svg);
  const hm = /height="([\d.]+)"/.exec(svg);
  if (wm && hm) return { w: Math.round(+wm[1]), h: Math.round(+hm[1]) };
  const vb = /viewBox="[\d.]+ [\d.]+ ([\d.]+) ([\d.]+)"/.exec(svg);
  if (vb) return { w: Math.round(+vb[1]), h: Math.round(+vb[2]) };
  return { w: 512, h: 512 };
}

export function SvgToPngUi() {
  const [svg, setSvg] = useState("");
  const [scale, setScale] = useState(2);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const base = useMemo(() => intrinsicSize(svg || SAMPLE_SVG), [svg]);
  const outW = Math.round(base.w * scale);
  const outH = Math.round(base.h * scale);
  const preview = useMemo(() => (svg.trim() ? svgToDataUriSafe(svg) : ""), [svg]);

  const onFile = async (file: File) => setSvg(await file.text());

  const download = async () => {
    setBusy(true);
    setError(null);
    try {
      const blob = await svgToPngBlob(svg, outW, outH);
      saveAs(blob, "imagen.png");
    } catch {
      setError("No se pudo convertir el SVG. Revisa que sea un SVG válido.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ToolLayout
      slug="svg-a-png"
      contentClassName="space-y-6"
      actions={
        <>
          <div className="flex items-center gap-2">
            <label className="ou-btn ou-btn-secondary cursor-pointer">
              <UploadCloud className="h-4 w-4" /> Abrir .svg
              <input type="file" accept=".svg,image/svg+xml" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ""; }} />
            </label>
            <ExampleButton onClick={() => setSvg(SAMPLE_SVG)} />
          </div>
          <div className="flex items-center gap-2">
            <span className="ou-label">Escala</span>
            <div className="flex items-center gap-1 rounded-control border border-border bg-surface p-1">
              {[1, 2, 3, 4].map((s) => (
                <button key={s} onClick={() => setScale(s)} className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${scale === s ? "bg-surface-strong text-foreground" : "text-foreground-faint hover:text-foreground"}`}>{s}×</button>
              ))}
            </div>
          </div>
        </>
      }
    >
        <div className="grid gap-5 lg:grid-cols-2">
          <textarea
            value={svg}
            onChange={(e) => setSvg(e.target.value)}
            spellCheck={false}
            placeholder="Pega aquí el código SVG, o abre un archivo .svg."
            className="min-h-[360px] w-full resize-y rounded-panel border border-border focus:border-border-strong bg-surface/50 p-4 font-mono text-[13px] leading-relaxed text-foreground outline-none transition-colors placeholder:text-foreground-faint"
          />
          <div className="flex min-h-[360px] items-center justify-center rounded-panel border border-border bg-[repeating-conic-gradient(#1c1c1c_0_25%,#161616_0_50%)] bg-[length:24px_24px] p-4">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Vista previa del SVG" className="max-h-[320px] max-w-full" />
            ) : (
              <p className="text-sm text-foreground-faint">La vista previa aparecerá aquí.</p>
            )}
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-3 rounded-panel border border-error/40 bg-error/5 p-4">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-error-text" />
            <p className="text-sm text-error-text">{error}</p>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-foreground-faint">Tamaño de salida: <span className="font-mono text-foreground">{outW}×{outH}</span> px</p>
          <button onClick={download} disabled={!svg.trim() || busy} className="ou-btn ou-btn-accent h-11 px-6 disabled:opacity-50">
            <Download className="h-4 w-4" />
            {busy ? "Convirtiendo…" : "Descargar PNG"}
          </button>
        </div>
    </ToolLayout>
  );
}
