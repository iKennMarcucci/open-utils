"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { saveAs } from "file-saver";
import { motion, AnimatePresence } from "motion/react";
import {
  Image as ImageIcon,
  Brush,
  Download,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCw,
  RotateCcw,
  AlertCircle,
  Loader2,
  Crop as CropIcon,
  Scaling,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ExampleButton } from "@/components/ExampleButton";
import { ToolLayout } from "@/components/ToolLayout";
import { FileDropzone } from "@/components/FileDropzone";
import { CropPanel, type CropRect } from "@/components/editor/CropPanel";
import {
  AnnotationCanvas,
  type AnnotationCanvasHandle,
  type PendingImage,
} from "@/components/editor/AnnotationCanvas";
import { EditorToolbar } from "@/components/editor/EditorToolbar";
import { useLayeredHistory } from "@/components/editor/useLayeredHistory";
import {
  DEFAULT_STYLE,
  renderScene,
  preloadImages,
  loadImageForInsertion,
  rotateAnnotations,
  type Annotation,
  type Style,
  type Tool,
  type EditorError,
} from "@/lib/editor-core";


const LAYER = "img";

/** Undoable image state: its drawings and its rotation, together. */
type ImgState = { annotations: Annotation[]; rotation: number };

interface Original {
  el: HTMLImageElement;
  width: number;
  height: number;
  name: string;
}

interface Background {
  source: CanvasImageSource;
  width: number;
  height: number;
  rotation: number;
}

/** Produces a background (image or rotated canvas) for a given rotation. */
function rotatedBackground(img: HTMLImageElement, rotation: number): Background {
  const rot = ((rotation % 360) + 360) % 360;
  if (rot === 0) {
    return { source: img, width: img.naturalWidth, height: img.naturalHeight, rotation: 0 };
  }
  const swap = rot === 90 || rot === 270;
  const w = swap ? img.naturalHeight : img.naturalWidth;
  const h = swap ? img.naturalWidth : img.naturalHeight;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  ctx.translate(w / 2, h / 2);
  ctx.rotate((rot * Math.PI) / 180);
  ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
  return { source: c, width: w, height: h, rotation: rot };
}

export function ImageEditorUi() {
  const [image, setImage] = useState<Original | null>(null);
  const [tool, setTool] = useState<Tool>("pen");
  const [style, setStyleState] = useState<Style>(DEFAULT_STYLE);
  const [zoom, setZoom] = useState(1);
  const [containerW, setContainerW] = useState(800);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<EditorError | null>(null);
  const [selection, setSelection] = useState<Annotation | null>(null);
  const [pendingImage, setPendingImage] = useState<PendingImage | null>(null);
  const [showResize, setShowResize] = useState(false);
  const [resizeW, setResizeW] = useState(0);
  const [resizeH, setResizeH] = useState(0);
  const [linkAspect, setLinkAspect] = useState(true);
  const [cropSrc, setCropSrc] = useState<string | null>(null);

  const hist = useLayeredHistory<ImgState>();
  const canvasApi = useRef<AnnotationCanvasHandle>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Style changes update defaults for new annotations AND restyle the current
  // selection (e.g. change the font of a selected text).
  const setStyle = (patch: Partial<Style>) => {
    setStyleState((s) => ({ ...s, ...patch }));
    if (selection) canvasApi.current?.applyStyleToSelected(patch);
  };

  const handleSelectionChange = (sel: Annotation | null) => {
    setSelection(sel);
    if (sel?.type === "text") {
      setStyleState((s) => ({ ...s, fontFamily: sel.family, fontSize: sel.size, color: sel.color }));
    }
  };

  // The background is fully determined by the original image and the rotation
  // stored in history, so derive it — undo/redo of a rotation flows through
  // here automatically without an extra effect.
  const historyRotation = hist.get(LAYER)?.rotation;
  const bg = useMemo<Background | null>(
    () => (image ? rotatedBackground(image.el, historyRotation ?? 0) : null),
    [image, historyRotation]
  );

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => setContainerW(entries[0].contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, [image]);

  const fitScale = bg ? Math.min((containerW - 48) / bg.width, 2) : 1;
  const scale = Math.max(0.05, fitScale * zoom);

  const handleFile = (file: File) => {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError({ title: "Archivo no válido", message: "Selecciona una imagen (PNG, JPG, WEBP…).", suggestion: "Arrastra un archivo de imagen." });
      return;
    }
    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const el = new Image();
      el.onload = () => {
        setImage({ el, width: el.naturalWidth, height: el.naturalHeight, name: file.name });
        hist.reset({ [LAYER]: { annotations: [], rotation: 0 } });
        setZoom(1);
        setTool("pen");
        setIsLoading(false);
      };
      el.onerror = () => {
        setError({ title: "No se pudo abrir", message: "La imagen parece dañada.", suggestion: "Prueba con otro archivo." });
        setIsLoading(false);
      };
      el.src = reader.result as string;
    };
    reader.onerror = () => { setError({ title: "Error", message: "No se pudo leer el archivo.", suggestion: "Intenta de nuevo." }); setIsLoading(false); };
    reader.readAsDataURL(file);
  };

  const resetAll = () => {
    setImage(null);
    setSelection(null);
    hist.reset();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ---- rotation ---------------------------------------------------------
  const rotateImage = (dir: 1 | -1) => {
    if (!image || !bg) return;
    const newRotation = (((bg.rotation + dir * 90) % 360) + 360) % 360;
    const rotated = rotateAnnotations(
      hist.get(LAYER)?.annotations ?? [],
      bg.width,
      bg.height,
      dir === 1
    );
    // Rotation + rotated drawings land as a single undo step; `bg` recomputes
    // from the new history rotation. Undo/redo revert both together.
    hist.commit(LAYER, { annotations: rotated, rotation: newRotation });
    canvasApi.current?.clearSelection();
  };

  const onInsertImage = () => imgInputRef.current?.click();
  const handleImageFile = async (file: File) => {
    try {
      const img = await loadImageForInsertion(file);
      setPendingImage(img);
      setTool("image");
    } catch (e) {
      setError({ title: "Imagen no válida", message: (e as Error).message, suggestion: "Usa un PNG, JPG o WEBP." });
    }
  };

  // ---- transform (resize / crop) ---------------------------------------
  // These "bake" the current scene (background + drawings) into a new base
  // image and reset the annotations — the clean way to change the canvas size
  // without breaking annotation coordinates.
  const flattenScene = async (): Promise<HTMLCanvasElement | null> => {
    if (!bg) return null;
    const anns = hist.get(LAYER)?.annotations ?? [];
    await preloadImages(anns);
    const canvas = document.createElement("canvas");
    canvas.width = bg.width;
    canvas.height = bg.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    renderScene(ctx, bg.source, bg.width, bg.height, anns);
    return canvas;
  };

  const adoptCanvas = (canvas: HTMLCanvasElement, name: string) => {
    const el = new Image();
    el.onload = () => {
      setImage({ el, width: el.naturalWidth, height: el.naturalHeight, name });
      hist.reset({ [LAYER]: { annotations: [], rotation: 0 } });
      setZoom(1);
      setTool("select");
      setSelection(null);
    };
    el.src = canvas.toDataURL("image/png");
  };

  const openResize = () => {
    if (!bg) return;
    setResizeW(bg.width);
    setResizeH(bg.height);
    setLinkAspect(true);
    setShowResize(true);
  };

  const setResizeAspect = (ratio: number) => {
    if (!bg) return;
    const w = resizeW || bg.width;
    setResizeH(Math.round(w / ratio));
  };

  const applyResize = async () => {
    const flat = await flattenScene();
    if (!flat || resizeW < 1 || resizeH < 1) return;
    const c = document.createElement("canvas");
    c.width = resizeW;
    c.height = resizeH;
    const ctx = c.getContext("2d")!;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(flat, 0, 0, resizeW, resizeH);
    adoptCanvas(c, image?.name ?? "imagen.png");
    setShowResize(false);
  };

  const openCrop = async () => {
    const flat = await flattenScene();
    if (flat) setCropSrc(flat.toDataURL("image/png"));
  };

  const applyCrop = (rect: CropRect) => {
    if (!cropSrc) return;
    const el = new Image();
    el.onload = () => {
      const c = document.createElement("canvas");
      c.width = Math.round(rect.w);
      c.height = Math.round(rect.h);
      const ctx = c.getContext("2d")!;
      ctx.drawImage(el, rect.x, rect.y, rect.w, rect.h, 0, 0, rect.w, rect.h);
      adoptCanvas(c, image?.name ?? "imagen.png");
      setCropSrc(null);
    };
    el.src = cropSrc;
  };

  const loadExampleImage = () => {
    const c = document.createElement("canvas");
    c.width = 1280;
    c.height = 720;
    const ctx = c.getContext("2d")!;
    const g = ctx.createLinearGradient(0, 0, 1280, 720);
    g.addColorStop(0, "#0ea5e9");
    g.addColorStop(1, "#6d28d9");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 1280, 720);
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.font = "bold 84px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Imagen de ejemplo", 640, 340);
    ctx.font = "500 34px system-ui, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    ctx.fillText("Dibuja, resalta, recorta o redimensiona", 640, 410);
    adoptCanvas(c, "ejemplo.png");
  };

  const handleExport = async (format: "png" | "jpeg") => {
    if (!bg) return;
    setIsExporting(true);
    try {
      const anns = hist.get(LAYER)?.annotations ?? [];
      await preloadImages(anns);
      const canvas = document.createElement("canvas");
      canvas.width = bg.width;
      canvas.height = bg.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("No se pudo crear el contexto");
      if (format === "jpeg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      renderScene(ctx, bg.source, bg.width, bg.height, anns);
      const mime = format === "png" ? "image/png" : "image/jpeg";
      const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, mime, 0.95));
      if (blob) {
        const base = (image?.name ?? "imagen").replace(/\.[^.]+$/, "");
        saveAs(blob, `${base}_editada.${format === "png" ? "png" : "jpg"}`);
      }
    } catch (e) {
      setError({ title: "Error al exportar", message: (e as Error).message, suggestion: "Intenta de nuevo." });
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    if (!image) return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "TEXTAREA" || target.tagName === "INPUT") return;
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) hist.redo(LAYER); else hist.undo(LAYER);
      } else if (meta && e.key.toLowerCase() === "y") {
        e.preventDefault(); hist.redo(LAYER);
      } else if (e.key === "Delete" || e.key === "Backspace") {
        if (selection) { e.preventDefault(); canvasApi.current?.deleteSelected(); }
      } else if (e.key === "Escape") {
        canvasApi.current?.clearSelection();
      } else if (!meta) {
        const map: Record<string, Tool> = { v: "select", p: "pen", h: "highlighter", l: "line", a: "arrow", r: "rect", o: "ellipse", t: "text", e: "eraser" };
        const t = map[e.key.toLowerCase()];
        if (t) setTool(t);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [image, selection, hist]);

  const annotations = useMemo(() => hist.get(LAYER)?.annotations ?? [], [hist]);

  if (!image || !bg) {
    return (
      <ToolLayout slug="editor-imagen">
        <div className="w-full">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[420px]">
              <div className="w-12 h-12 border-[3px] border-surface-strong border-t-accent rounded-full animate-spin" />
              <p className="mt-6 text-sm font-medium text-foreground-subtle animate-pulse">Cargando imagen…</p>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
              <FileDropzone
                onFiles={(files) => handleFile(files[0])}
                accept="image/*"
                title="Suelta tu imagen aquí"
                subtitle="o haz clic para seleccionarla"
                hint={<><ImageIcon className="w-4 h-4" /> Dibuja, encierra en cuadros, resalta, escribe y agrega formas</>}
                example={<ExampleButton onClick={loadExampleImage} label="Probar con una imagen de ejemplo" />}
                className="min-h-[420px]"
              />
            </motion.div>
          )}
        </div>
        <ErrorModal error={error} onClose={() => setError(null)} />
      </ToolLayout>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <input type="file" ref={imgInputRef} accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageFile(f); e.target.value = ""; }} className="hidden" />

      {/* Header — file name + document actions */}
      <div className="shrink-0 z-30 border-b border-border bg-background-elevated/95 backdrop-blur px-4 h-14 flex items-center gap-3">
        <Brush className="w-5 h-5 text-foreground-muted shrink-0" />
        <span className="text-sm font-medium text-foreground truncate max-w-[200px]" title={image.name}>{image.name}</span>
        <div className="ml-auto flex items-center gap-2 shrink-0">
          <ExampleButton onClick={loadExampleImage} className="h-9 hidden sm:inline-flex" label="Ejemplo" />
          <button onClick={resetAll} className="ou-btn ou-btn-ghost h-9 px-3 text-xs">Nueva</button>
          <button onClick={() => handleExport("jpeg")} disabled={isExporting} className="ou-btn ou-btn-secondary h-9 px-3">JPG</button>
          <button onClick={() => handleExport("png")} disabled={isExporting} className="ou-btn ou-btn-accent h-9 px-4">
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            PNG
          </button>
        </div>
      </div>

      {/* Toolbar — full-width, its own row so it has room to breathe */}
      <div className="shrink-0 z-20 border-b border-border bg-background-elevated/90 backdrop-blur px-3 py-2 overflow-x-auto custom-scrollbar">
        <EditorToolbar
          tool={tool}
          setTool={setTool}
          style={style}
          setStyle={setStyle}
          onUndo={() => hist.undo(LAYER)}
          onRedo={() => hist.redo(LAYER)}
          canUndo={hist.canUndo(LAYER)}
          canRedo={hist.canRedo(LAYER)}
          hasSelection={!!selection}
          onDelete={() => canvasApi.current?.deleteSelected()}
          onDuplicate={() => canvasApi.current?.duplicateSelected()}
          onBringForward={() => canvasApi.current?.bringForward()}
          onSendBackward={() => canvasApi.current?.sendBackward()}
          onInsertImage={onInsertImage}
          selectedType={selection?.type}
        />
      </div>

      {/* Transform + zoom bar */}
      <div className="relative shrink-0 z-10 border-b border-border px-3 py-2 flex items-center gap-1.5 bg-background-elevated/80 backdrop-blur">
        <span className="ou-label hidden md:inline mr-1">Transformar</span>
        <button onClick={() => rotateImage(-1)} className="ou-btn ou-btn-ghost h-8 px-2.5" title="Rotar a la izquierda"><RotateCcw className="w-4 h-4" /></button>
        <button onClick={() => rotateImage(1)} className="ou-btn ou-btn-ghost h-8 px-2.5" title="Rotar a la derecha"><RotateCw className="w-4 h-4" /></button>
        <button onClick={openResize} className={cn("ou-btn ou-btn-ghost h-8 px-2.5", showResize && "bg-surface-hover text-foreground")} title="Redimensionar"><Scaling className="w-4 h-4" /><span className="hidden lg:inline ml-1 text-xs">Redimensionar</span></button>
        <button onClick={openCrop} className="ou-btn ou-btn-ghost h-8 px-2.5" title="Recortar"><CropIcon className="w-4 h-4" /><span className="hidden lg:inline ml-1 text-xs">Recortar</span></button>

        <div className="w-px h-5 bg-border mx-1" />
        <button onClick={() => setZoom((z) => Math.max(0.1, z - 0.15))} className="ou-btn ou-btn-ghost h-8 px-2.5" title="Alejar"><ZoomOut className="w-4 h-4" /></button>
        <span className="text-xs text-foreground-muted tabular-nums w-12 text-center">{Math.round(scale * 100)}%</span>
        <button onClick={() => setZoom((z) => Math.min(6, z + 0.15))} className="ou-btn ou-btn-ghost h-8 px-2.5" title="Acercar"><ZoomIn className="w-4 h-4" /></button>
        <button onClick={() => setZoom(1)} className="ou-btn ou-btn-ghost h-8 px-2.5" title="Ajustar"><Maximize2 className="w-4 h-4" /></button>
        <span className="ml-auto text-xs text-foreground-faint tabular-nums">{bg.width} × {bg.height}px</span>

        {/* Resize popover */}
        {showResize && (
          <>
            <div className="fixed inset-0 z-20" onClick={() => setShowResize(false)} />
            <div className="absolute top-full left-3 mt-2 z-30 ou-card rounded-panel p-4 shadow-lg w-72">
              <p className="ou-label mb-2">Redimensionar</p>
              <div className="mb-3 flex items-center gap-2">
                <input type="number" min={1} value={resizeW} onChange={(e) => { const w = Math.max(1, Number(e.target.value) || 1); setResizeW(w); if (linkAspect && bg) setResizeH(Math.round(w * (bg.height / bg.width))); }} className="w-full rounded-control border border-border bg-surface px-2 h-9 text-sm text-foreground outline-none focus:border-border-strong" />
                <button onClick={() => setLinkAspect((v) => !v)} title="Mantener proporción" className={cn("h-9 px-2 rounded-control text-xs shrink-0", linkAspect ? "bg-surface-strong text-foreground border border-border-strong" : "text-foreground-faint hover:text-foreground")}>{linkAspect ? "🔗" : "⛓️‍💥"}</button>
                <input type="number" min={1} value={resizeH} onChange={(e) => { const h = Math.max(1, Number(e.target.value) || 1); setResizeH(h); if (linkAspect && bg) setResizeW(Math.round(h * (bg.width / bg.height))); }} className="w-full rounded-control border border-border bg-surface px-2 h-9 text-sm text-foreground outline-none focus:border-border-strong" />
              </div>
              <div className="mb-3 flex flex-wrap gap-1.5">
                {([["16:9", 16 / 9], ["9:16", 9 / 16], ["1:1", 1], ["4:3", 4 / 3], ["3:4", 3 / 4], ["3:2", 3 / 2]] as const).map(([label, r]) => (
                  <button key={label} onClick={() => setResizeAspect(r)} className="ou-pill">{label}</button>
                ))}
              </div>
              <button onClick={applyResize} className="ou-btn ou-btn-accent w-full h-9"><Check className="w-4 h-4" /> Aplicar</button>
            </div>
          </>
        )}
      </div>

      {/* Canvas */}
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-auto custom-scrollbar bg-surface-strong p-6 flex items-start justify-center">
        <AnnotationCanvas
          ref={canvasApi}
          key={`img:${bg.rotation}`}
          background={bg.source}
          width={bg.width}
          height={bg.height}
          scale={scale}
          tool={tool}
          style={style}
          annotations={annotations}
          onCommit={(next) => hist.commit(LAYER, { annotations: next, rotation: bg.rotation })}
          onSelectionChange={handleSelectionChange}
          pendingImage={pendingImage}
          onImagePlaced={() => { setPendingImage(null); setTool("select"); }}
        />
      </div>

      {cropSrc && bg && (
        <CropPanel src={cropSrc} imgW={bg.width} imgH={bg.height} onCancel={() => setCropSrc(null)} onApply={applyCrop} />
      )}

      <ErrorModal error={error} onClose={() => setError(null)} />
    </div>
  );
}

function ErrorModal({ error, onClose }: { error: EditorError | null; onClose: () => void }) {
  return (
    <AnimatePresence>
      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 12 }} onClick={(e) => e.stopPropagation()} className="ou-card w-full max-w-md p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-control bg-error/10 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-error-text" />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-semibold text-foreground mb-1.5">{error.title}</h3>
                <p className="text-sm text-foreground-subtle leading-relaxed mb-4">{error.message}</p>
                <div className="bg-background-elevated rounded-control p-3 border border-border">
                  <p className="ou-label mb-1">Sugerencia</p>
                  <p className="text-sm text-foreground-muted">{error.suggestion}</p>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={onClose} className="ou-btn ou-btn-primary">Entendido</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
