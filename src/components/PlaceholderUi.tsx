"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Download, ImageDown } from "lucide-react";
import { saveAs } from "file-saver";
import { cn } from "@/lib/utils";
import {
  ASPECT_PRESETS,
  COLOR_PRESETS,
  PATTERNS,
  buildSvg,
  exportCss,
  exportHtml,
  exportReact,
  svgToDataUri,
  type PatternId,
  type PlaceholderOptions,
} from "@/lib/placeholder";
import { svgToPngBlob } from "@/lib/canvas";
import { CodeBlock } from "@/components/CodeBlock";
import { ToolLayout } from "@/components/ToolLayout";
import type { CodeLang } from "@/lib/highlight";
import { ExampleButton } from "@/components/ExampleButton";

type ExportTab = "svg" | "html" | "css" | "react";

const TAB_LANG: Record<ExportTab, CodeLang> = {
  svg: "xml",
  html: "html",
  css: "css",
  react: "jsx",
};

export function PlaceholderUi() {
  const [o, setO] = useState<PlaceholderOptions>({
    width: 1280,
    height: 720,
    pattern: "gradient",
    color1: "#0ea5e9",
    color2: "#1e3a8a",
    textColor: "#ffffff",
    text: "",
    showText: true,
  });
  const [tab, setTab] = useState<ExportTab>("svg");
  const [copied, setCopied] = useState(false);

  const svg = useMemo(() => buildSvg(o), [o]);
  const dataUri = useMemo(() => svgToDataUri(svg), [svg]);
  const set = (patch: Partial<PlaceholderOptions>) => setO((prev) => ({ ...prev, ...patch }));

  const exportText = useMemo(() => {
    switch (tab) {
      case "svg": return svg;
      case "html": return exportHtml(o, svg);
      case "css": return exportCss(svg);
      case "react": return exportReact(o, svg);
    }
  }, [tab, svg, o]);

  const copy = async () => {
    await navigator.clipboard.writeText(exportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const downloadSvg = () => saveAs(new Blob([svg], { type: "image/svg+xml" }), "placeholder.svg");
  const downloadPng = async () => {
    const blob = await svgToPngBlob(svg, o.width, o.height);
    saveAs(blob, "placeholder.png");
  };

  const inputCls = "rounded-control border border-border bg-surface px-3 h-9 text-sm text-foreground outline-none focus:border-border-strong";

  return (
    <ToolLayout
      slug="imagen-placeholder"
      actions={
        <ExampleButton onClick={() => set({ pattern: "blueprint", color1: "#0b3d91", color2: "#7aa2ff", textColor: "#ffffff", text: "Hero 16:9", width: 1280, height: 720, showText: true })} />
      }
    >
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* Preview */}
          <div className="min-w-0 space-y-4">
            <div className="flex min-h-[280px] items-center justify-center overflow-hidden rounded-panel border border-border bg-[repeating-conic-gradient(var(--surface-strong)_0_25%,var(--surface)_0_50%)] bg-[length:24px_24px] p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={dataUri} alt="Vista previa del placeholder" className="max-h-[420px] max-w-full rounded shadow-lg" style={{ aspectRatio: `${o.width}/${o.height}` }} />
            </div>

            {/* Export */}
            <div>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1 rounded-control border border-border bg-surface p-1">
                  {(["svg", "html", "css", "react"] as const).map((t) => (
                    <button key={t} onClick={() => setTab(t)} className={cn("px-2.5 py-1.5 rounded-md text-xs font-medium uppercase transition-colors", tab === t ? "bg-surface-strong text-foreground" : "text-foreground-faint hover:text-foreground")}>
                      {t}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={copy} className="ou-btn ou-btn-secondary py-1.5">
                    {copied ? <Check className="h-4 w-4 text-success-text" /> : <Copy className="h-4 w-4" />}
                    Copiar
                  </button>
                  <button onClick={downloadSvg} className="ou-btn ou-btn-secondary py-1.5"><Download className="h-4 w-4" /> SVG</button>
                  <button onClick={downloadPng} className="ou-btn ou-btn-secondary py-1.5"><ImageDown className="h-4 w-4" /> PNG</button>
                </div>
              </div>
              <CodeBlock code={exportText} lang={TAB_LANG[tab]} className="max-h-40 p-3 text-[12px]" />
            </div>

            {/* Usage examples */}
            <div className="rounded-panel border border-border bg-surface/30 p-4">
              <p className="ou-label mb-2">Ejemplos de uso</p>
              <ul className="list-disc space-y-1 pl-5 text-sm text-foreground-subtle">
                <li>Maquetar un diseño antes de tener las imágenes reales.</li>
                <li>Rellenar tarjetas y galerías en un prototipo.</li>
                <li>Como fondo con el CSS generado (<code className="font-mono text-xs">background-image</code>).</li>
                <li>Como componente React reutilizable con el código exportado.</li>
              </ul>
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-5">
            <div>
              <p className="ou-label mb-2">Dimensiones</p>
              <div className="mb-2 flex flex-wrap gap-1.5">
                {ASPECT_PRESETS.map((a) => (
                  <button key={a.label} onClick={() => set({ width: a.w, height: a.h })} className={cn("ou-pill", o.width === a.w && o.height === a.h && "border-accent/60 text-foreground")}>
                    {a.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input type="number" value={o.width} min={16} max={4000} onChange={(e) => set({ width: Math.max(16, Number(e.target.value) || 16) })} className={cn(inputCls, "w-full")} />
                <span className="text-foreground-faint">×</span>
                <input type="number" value={o.height} min={16} max={4000} onChange={(e) => set({ height: Math.max(16, Number(e.target.value) || 16) })} className={cn(inputCls, "w-full")} />
              </div>
            </div>

            <div>
              <p className="ou-label mb-2">Patrón</p>
              <div className="grid grid-cols-2 gap-1.5">
                {PATTERNS.map((p) => (
                  <button key={p.id} onClick={() => set({ pattern: p.id as PatternId })} className={cn("rounded-control border px-3 py-2 text-xs font-medium transition-colors", o.pattern === p.id ? "border-accent/60 bg-surface-hover text-foreground" : "border-border text-foreground-muted hover:text-foreground")}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="ou-label mb-2">Colores</p>
              <div className="mb-2 flex flex-wrap gap-1.5">
                {COLOR_PRESETS.map((c) => (
                  <button key={c.label} onClick={() => set({ color1: c.c1, color2: c.c2, textColor: c.text })} title={c.label} className="h-7 w-7 rounded-full border border-border" style={{ background: `linear-gradient(135deg, ${c.c1}, ${c.c2})` }} />
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                {([["Fondo", "color1"], ["Secundario", "color2"], ["Texto", "textColor"]] as const).map(([label, key]) => (
                  <label key={key} className="flex items-center gap-2 text-xs text-foreground-muted">
                    <input type="color" value={o[key]} onChange={(e) => set({ [key]: e.target.value } as Partial<PlaceholderOptions>)} className="h-8 w-8 cursor-pointer rounded border border-border bg-transparent" />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <p className="ou-label mb-2">Texto</p>
              <label className="mb-2 flex items-center gap-2 text-sm text-foreground-muted">
                <input type="checkbox" checked={o.showText} onChange={(e) => set({ showText: e.target.checked })} className="h-4 w-4 accent-[var(--accent-text)]" />
                Mostrar texto
              </label>
              <input value={o.text} onChange={(e) => set({ text: e.target.value })} placeholder={`${o.width}×${o.height} (por defecto)`} disabled={!o.showText} className={cn(inputCls, "w-full disabled:opacity-40")} />
            </div>
          </div>
        </div>
    </ToolLayout>
  );
}
