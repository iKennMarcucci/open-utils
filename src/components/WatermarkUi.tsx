"use client";

import { useEffect, useRef, useState } from "react";
import { Download, UploadCloud } from "lucide-react";
import { saveAs } from "file-saver";
import { fileToImage, canvasToBlob, loadImage } from "@/lib/canvas";
import { ToolLayout } from "@/components/ToolLayout";
import { ExampleButton } from "@/components/ExampleButton";
import { FileDropzone } from "@/components/FileDropzone";

type Pos = "nw" | "n" | "ne" | "w" | "c" | "e" | "sw" | "s" | "se";
const POSITIONS: Pos[] = ["nw", "n", "ne", "w", "c", "e", "sw", "s", "se"];

export function WatermarkUi() {
  const [base, setBase] = useState<HTMLImageElement | null>(null);
  const [mark, setMark] = useState<HTMLImageElement | null>(null);
  const [mode, setMode] = useState<"text" | "image">("text");
  const [text, setText] = useState("© Open Utils");
  const [color, setColor] = useState("#ffffff");
  const [opacity, setOpacity] = useState(0.6);
  const [size, setSize] = useState(6); // % of base width
  const [pos, setPos] = useState<Pos>("se");
  const [tiled, setTiled] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const baseRef = useRef<HTMLInputElement>(null);
  const markRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !base) return;
    canvas.width = base.width;
    canvas.height = base.height;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(base, 0, 0);
    ctx.globalAlpha = opacity;

    const margin = base.width * 0.03;
    const coord = (p: Pos, w: number, h: number) => {
      const x = p.includes("w") ? margin : p.includes("e") ? base.width - w - margin : (base.width - w) / 2;
      const y = p.includes("n") ? margin : p.includes("s") ? base.height - h - margin : (base.height - h) / 2;
      return { x, y };
    };

    if (mode === "text" && text) {
      const fontPx = Math.max(10, (base.width * size) / 100);
      ctx.font = `bold ${fontPx}px system-ui, sans-serif`;
      ctx.fillStyle = color;
      ctx.textBaseline = "top";
      const w = ctx.measureText(text).width;
      const h = fontPx * 1.2;
      if (tiled) {
        ctx.save();
        ctx.rotate(-Math.PI / 6);
        for (let y = -base.height; y < base.height * 1.5; y += h * 3)
          for (let x = -base.width; x < base.width * 1.5; x += w + fontPx * 2) ctx.fillText(text, x, y);
        ctx.restore();
      } else {
        const { x, y } = coord(pos, w, h);
        ctx.fillText(text, x, y);
      }
    } else if (mode === "image" && mark) {
      const w = (base.width * size * 4) / 100;
      const h = (mark.height / mark.width) * w;
      if (tiled) {
        for (let y = 0; y < base.height; y += h * 2)
          for (let x = 0; x < base.width; x += w * 2) ctx.drawImage(mark, x, y, w, h);
      } else {
        const { x, y } = coord(pos, w, h);
        ctx.drawImage(mark, x, y, w, h);
      }
    }
    ctx.globalAlpha = 1;
  }, [base, mark, mode, text, color, opacity, size, pos, tiled]);

  const loadExample = async () => {
    const c = document.createElement("canvas");
    c.width = 1000; c.height = 640;
    const ctx = c.getContext("2d")!;
    const g = ctx.createLinearGradient(0, 0, 1000, 640);
    g.addColorStop(0, "#334155"); g.addColorStop(1, "#0f172a");
    ctx.fillStyle = g; ctx.fillRect(0, 0, 1000, 640);
    ctx.fillStyle = "#94a3b8"; ctx.font = "bold 40px system-ui"; ctx.textAlign = "center";
    ctx.fillText("Tu imagen", 500, 330);
    setBase(await loadImage(c.toDataURL("image/png")));
    setMode("text"); setText("© Open Utils"); setTiled(false); setPos("se");
  };

  const download = async () => {
    if (!canvasRef.current) return;
    saveAs(await canvasToBlob(canvasRef.current, "image/png"), "con-marca-de-agua.png");
  };

  return (
    <ToolLayout
      slug="marca-de-agua"
      actions={
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={() => baseRef.current?.click()} className="ou-btn ou-btn-secondary"><UploadCloud className="h-4 w-4" /> Imagen base</button>
          <ExampleButton onClick={loadExample} />
          <input ref={baseRef} type="file" accept="image/*" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (f) setBase(await fileToImage(f)); e.target.value = ""; }} />
        </div>
      }
    >
        {!base ? (
          <FileDropzone
            onFiles={async (files) => setBase(await fileToImage(files[0]))}
            accept="image/*"
            title="Arrastra la imagen base aquí"
          />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="flex min-w-0 min-h-[300px] items-center justify-center overflow-hidden rounded-panel border border-border bg-surface/30 p-3">
              <canvas ref={canvasRef} className="max-h-[440px] max-w-full rounded" />
            </div>

            <div className="min-w-0 space-y-5">
              <div className="flex items-center gap-1 rounded-control border border-border bg-surface p-1">
                {(["text", "image"] as const).map((m) => (
                  <button key={m} onClick={() => setMode(m)} className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${mode === m ? "bg-surface-strong text-foreground" : "text-foreground-faint hover:text-foreground"}`}>{m === "text" ? "Texto" : "Imagen"}</button>
                ))}
              </div>

              {mode === "text" ? (
                <>
                  <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Texto de la marca" className="w-full rounded-control border border-border bg-surface px-3 h-10 text-sm text-foreground outline-none focus:border-border-strong" />
                  <label className="flex items-center gap-2 text-xs text-foreground-muted"><input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-8 w-8 cursor-pointer rounded border border-border bg-transparent" /> Color del texto</label>
                </>
              ) : (
                <button onClick={() => markRef.current?.click()} className="ou-btn ou-btn-secondary w-full">
                  <UploadCloud className="h-4 w-4" /> {mark ? "Cambiar logo" : "Elegir logo (PNG)"}
                </button>
              )}
              <input ref={markRef} type="file" accept="image/*" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (f) setMark(await fileToImage(f)); e.target.value = ""; }} />

              <div>
                <div className="mb-2 flex items-center justify-between"><span className="ou-label">Opacidad</span><span className="text-sm text-foreground">{Math.round(opacity * 100)}%</span></div>
                <input type="range" min={5} max={100} value={Math.round(opacity * 100)} onChange={(e) => setOpacity(Number(e.target.value) / 100)} className="w-full accent-[var(--accent-text)]" />
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between"><span className="ou-label">Tamaño</span><span className="text-sm text-foreground">{size}%</span></div>
                <input type="range" min={2} max={20} value={size} onChange={(e) => setSize(Number(e.target.value))} className="w-full accent-[var(--accent-text)]" />
              </div>

              <div>
                <p className="ou-label mb-2">Posición</p>
                <div className="grid grid-cols-3 gap-1.5" style={{ opacity: tiled ? 0.4 : 1, pointerEvents: tiled ? "none" : "auto" }}>
                  {POSITIONS.map((p) => (
                    <button key={p} onClick={() => setPos(p)} className={`aspect-square rounded border transition-colors ${pos === p ? "border-accent bg-surface-hover" : "border-border hover:border-border-strong"}`} aria-label={p} />
                  ))}
                </div>
                <label className="mt-3 flex items-center gap-2 text-sm text-foreground-muted"><input type="checkbox" checked={tiled} onChange={(e) => setTiled(e.target.checked)} className="h-4 w-4 accent-[var(--accent-text)]" /> Repetir en mosaico</label>
              </div>

              <button onClick={download} className="ou-btn ou-btn-accent h-11 w-full"><Download className="h-4 w-4" /> Descargar PNG</button>
            </div>
          </div>
        )}
    </ToolLayout>
  );
}
