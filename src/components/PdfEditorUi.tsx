"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  UploadCloud,
  FileText,
  Pencil,
  RotateCw,
  RotateCcw,
  Trash2,
  Download,
  ZoomIn,
  ZoomOut,
  Maximize2,
  AlertCircle,
  ChevronUp,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AnnotationCanvas,
  type AnnotationCanvasHandle,
  type PendingImage,
} from "@/components/editor/AnnotationCanvas";
import { EditorToolbar } from "@/components/editor/EditorToolbar";
import { useLayeredHistory } from "@/components/editor/useLayeredHistory";
import {
  DEFAULT_STYLE,
  type Annotation,
  type Style,
  type Tool,
} from "@/lib/editor-core";
import {
  loadPdfForEditing,
  renderPageBitmap,
  rotateAnnotations,
  exportEditedPdf,
  downloadPdf,
  loadImageForInsertion,
  type EditablePdf,
  type EditablePage,
  type EditorError,
} from "@/lib/pdf-editor";

/** One page's undoable state: its drawings and its rotation, together. */
type PageState = { annotations: Annotation[]; rotation: number };

/** A rendered page background at a given rotation. */
type PageView = { bitmap: ImageBitmap; width: number; height: number };

const viewKey = (pageId: string, rotation: number) => `${pageId}:${rotation}`;

function PageThumb({
  view,
  index,
  active,
  onClick,
}: {
  view: PageView | undefined;
  index: number;
  active: boolean;
  onClick: () => void;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !view) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const maxW = 120;
    const scale = maxW / view.width;
    canvas.width = maxW;
    canvas.height = Math.round(view.height * scale);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(view.bitmap, 0, 0, canvas.width, canvas.height);
  }, [view]);

  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative w-full rounded-lg overflow-hidden border transition-all bg-white",
        active ? "border-transparent ring-2 ring-accent" : "border-border hover:border-border-strong"
      )}
      title={`Página ${index + 1}`}
    >
      {view ? (
        <canvas ref={ref} className="w-full block" />
      ) : (
        <div className="w-full aspect-3/4 flex items-center justify-center">
          <Loader2 className="w-4 h-4 text-foreground-faint animate-spin" />
        </div>
      )}
      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 min-w-5 h-5 px-1.5 rounded-md bg-black/70 backdrop-blur-sm text-[11px] font-semibold text-white flex items-center justify-center">
        {index + 1}
      </span>
    </button>
  );
}

export function PdfEditorUi() {
  const [pdf, setPdf] = useState<EditablePdf | null>(null);
  const [pages, setPages] = useState<EditablePage[]>([]);
  const [currentId, setCurrentId] = useState<string>("");
  const [tool, setTool] = useState<Tool>("select");
  const [style, setStyleState] = useState<Style>(DEFAULT_STYLE);
  const [zoom, setZoom] = useState(1);
  const [containerW, setContainerW] = useState(800);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<EditorError | null>(null);
  const [selection, setSelection] = useState<Annotation | null>(null);
  const [pendingImage, setPendingImage] = useState<PendingImage | null>(null);
  const [rotating, setRotating] = useState(false);

  const hist = useLayeredHistory<PageState>();
  const canvasApi = useRef<AnnotationCanvasHandle>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Bitmap cache keyed by `${pageId}:${rotation}`. Rotation lives ONLY in
  // history; the displayed bitmap is derived by looking it up here. Undo/redo
  // therefore just re-reads a cached bitmap — synchronous, no races. Kept in
  // state (not a ref) so updates re-render and reads during render are valid.
  const [cache, setCache] = useState<Map<string, PageView>>(new Map());
  const addToCache = (key: string, view: PageView) =>
    setCache((prev) => new Map(prev).set(key, view));

  const current = pages.find((p) => p.id === currentId) ?? null;
  const currentRotation = current ? hist.get(current.id)?.rotation ?? 0 : 0;
  const currentView = current
    ? cache.get(viewKey(current.id, currentRotation))
    : undefined;

  // Style changes update the defaults for new annotations AND restyle the
  // current selection (e.g. change the font of a selected text).
  const setStyle = (patch: Partial<Style>) => {
    setStyleState((s) => ({ ...s, ...patch }));
    if (selection) canvasApi.current?.applyStyleToSelected(patch);
  };

  // When a text is selected, reflect its font/size/color in the toolbar.
  const handleSelectionChange = (sel: Annotation | null) => {
    setSelection(sel);
    if (sel?.type === "text") {
      setStyleState((s) => ({ ...s, fontFamily: sel.family, fontSize: sel.size, color: sel.color }));
    }
  };

  // Track available width so pages fit the viewport.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      setContainerW(entries[0].contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [pdf]);

  const fitScale = currentView ? Math.min((containerW - 48) / currentView.width, 1.4) : 1;
  const scale = Math.max(0.1, fitScale * zoom);

  const handleFile = async (file: File) => {
    setError(null);
    setIsLoading(true);
    try {
      const loaded = await loadPdfForEditing(file);
      // Seed the cache with each page's rotation-0 render.
      const seeded = new Map<string, PageView>();
      for (const p of loaded.pages) {
        seeded.set(viewKey(p.id, 0), { bitmap: p.bitmap, width: p.width, height: p.height });
      }
      setCache(seeded);
      setPdf(loaded);
      setPages(loaded.pages);
      setCurrentId(loaded.pages[0]?.id ?? "");
      hist.reset(
        Object.fromEntries(
          loaded.pages.map((p) => [p.id, { annotations: [], rotation: 0 } as PageState])
        )
      );
      setZoom(1);
      setTool("select");
    } catch (err) {
      const e = err as EditorError;
      setError(e.title ? e : { title: "Error", message: "No se pudo abrir el PDF.", suggestion: "Intenta con otro archivo." });
    } finally {
      setIsLoading(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const resetAll = () => {
    setCache(new Map());
    setPdf(null);
    setPages([]);
    setCurrentId("");
    setSelection(null);
    hist.reset();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Ensure the current page's bitmap for the active rotation is cached. Only
  // fires on a genuine cache miss (a rotation never rendered before); undo/redo
  // to a previously-seen rotation hits the cache and skips this entirely.
  useEffect(() => {
    if (!pdf || !current) return;
    const key = viewKey(current.id, currentRotation);
    if (cache.has(key)) return;
    let cancelled = false;
    renderPageBitmap(pdf.bytes, current, currentRotation)
      .then((view) => {
        if (cancelled) return;
        addToCache(key, view);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [pdf, current, currentRotation, cache]);

  // ---- page operations --------------------------------------------------
  const rotatePage = async (dir: 1 | -1) => {
    if (!current || !pdf || rotating) return;
    const view = cache.get(viewKey(current.id, currentRotation));
    if (!view) return;
    const newRotation = (((currentRotation + dir * 90) % 360) + 360) % 360;
    const rotated = rotateAnnotations(
      hist.get(current.id)?.annotations ?? [],
      view.width,
      view.height,
      dir === 1
    );
    setRotating(true);
    try {
      const key = viewKey(current.id, newRotation);
      if (!cache.has(key)) {
        addToCache(key, await renderPageBitmap(pdf.bytes, current, newRotation));
      }
      // Rotation + rotated drawings land as one undo step. Display follows the
      // history rotation, so undo reverts both together.
      hist.commit(current.id, { annotations: rotated, rotation: newRotation });
      canvasApi.current?.clearSelection();
    } catch {
      setError({ title: "Error", message: "No se pudo rotar la página.", suggestion: "Intenta de nuevo." });
    } finally {
      setRotating(false);
    }
  };

  const deletePage = (id: string) => {
    if (pages.length <= 1) {
      setError({ title: "No se puede eliminar", message: "El PDF debe conservar al menos una página.", suggestion: "Agrega otra página antes de eliminar esta." });
      return;
    }
    setPages((prev) => {
      const idx = prev.findIndex((p) => p.id === id);
      const next = prev.filter((p) => p.id !== id);
      if (id === currentId) {
        setCurrentId(next[Math.min(idx, next.length - 1)].id);
      }
      return next;
    });
  };

  const movePage = (id: string, dir: 1 | -1) => {
    setPages((prev) => {
      const i = prev.findIndex((p) => p.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= prev.length) return prev;
      const next = prev.slice();
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };

  // ---- image insertion --------------------------------------------------
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

  // ---- export -----------------------------------------------------------
  const handleExport = async () => {
    if (!pdf) return;
    setIsExporting(true);
    setError(null);
    try {
      // Export each page with its history annotations + rotation. Annotations
      // live in the rotated edit-bitmap space, so pass those dimensions (from
      // the cache) as page.width/height for correct export scaling.
      const specs = pages.map((page) => {
        const st = hist.get(page.id);
        const rot = st?.rotation ?? 0;
        const view = cache.get(viewKey(page.id, rot));
        return {
          page: {
            ...page,
            rotation: rot,
            width: view?.width ?? page.width,
            height: view?.height ?? page.height,
          },
          annotations: st?.annotations ?? [],
        };
      });
      const blob = await exportEditedPdf(pdf.bytes, specs);
      downloadPdf(blob, pdf.name);
    } catch (err) {
      const e = err as EditorError;
      setError(e.title ? e : { title: "Error", message: "No se pudo exportar.", suggestion: "Intenta de nuevo." });
    } finally {
      setIsExporting(false);
    }
  };

  // ---- keyboard shortcuts ----------------------------------------------
  useEffect(() => {
    if (!pdf) return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "TEXTAREA" || target.tagName === "INPUT") return;
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) hist.redo(currentId);
        else hist.undo(currentId);
      } else if (meta && e.key.toLowerCase() === "y") {
        e.preventDefault();
        hist.redo(currentId);
      } else if (e.key === "Delete" || e.key === "Backspace") {
        if (selection) {
          e.preventDefault();
          canvasApi.current?.deleteSelected();
        }
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
  }, [pdf, currentId, selection, hist]);

  const annotations = useMemo(
    () => (current ? hist.get(current.id)?.annotations ?? [] : []),
    [current, hist]
  );

  // ---------------------------------------------------------------------
  if (!pdf) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-4 mb-10"
          >
            <Pencil className="w-7 h-7 text-foreground-muted" />
            <h2 className="text-4xl font-semibold tracking-tight text-foreground">Editor de PDF</h2>
          </motion.div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[420px]">
              <div className="w-12 h-12 border-[3px] border-surface-strong border-t-accent rounded-full animate-spin" />
              <p className="mt-6 text-sm font-medium text-foreground-subtle animate-pulse">Preparando páginas…</p>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "group relative flex flex-col items-center justify-center gap-5 border-2 border-dashed rounded-panel transition-all min-h-[420px] p-8 text-center cursor-pointer",
                  isDragging ? "border-white bg-surface" : "border-border bg-surface/50 hover:border-border-strong hover:bg-surface"
                )}
              >
                <div className="w-16 h-16 rounded-full bg-surface-strong flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <UploadCloud className="w-8 h-8 text-foreground-muted" />
                </div>
                <div>
                  <p className="text-lg font-medium text-foreground">Suelta tu PDF aquí</p>
                  <p className="text-sm text-foreground-subtle mt-1">o haz clic para seleccionarlo</p>
                </div>
                <div className="text-xs text-foreground-faint flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Dibuja, resalta, escribe, agrega formas e imágenes · máx. 100MB
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="application/pdf"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
                  className="hidden"
                />
              </div>
            </motion.div>
          )}
        </div>
        <ErrorModal error={error} onClose={() => setError(null)} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Hidden image input */}
      <input
        type="file"
        ref={imgInputRef}
        accept="image/*"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageFile(f); e.target.value = ""; }}
        className="hidden"
      />

      {/* Top bar — pinned above the scrolling canvas */}
      <div className="shrink-0 z-30 border-b border-border bg-background-elevated/95 backdrop-blur px-3 py-2.5 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <Pencil className="w-5 h-5 text-foreground-muted shrink-0" />
          <span className="text-sm font-medium text-foreground truncate max-w-[180px]" title={pdf.name}>{pdf.name}</span>
        </div>
        <div className="flex-1 min-w-[280px]">
          <EditorToolbar
            tool={tool}
            setTool={setTool}
            style={style}
            setStyle={setStyle}
            onUndo={() => hist.undo(currentId)}
            onRedo={() => hist.redo(currentId)}
            canUndo={hist.canUndo(currentId)}
            canRedo={hist.canRedo(currentId)}
            hasSelection={!!selection}
            onDelete={() => canvasApi.current?.deleteSelected()}
            onDuplicate={() => canvasApi.current?.duplicateSelected()}
            onBringForward={() => canvasApi.current?.bringForward()}
            onSendBackward={() => canvasApi.current?.sendBackward()}
            onInsertImage={onInsertImage}
            selectedType={selection?.type}
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={resetAll} className="ou-btn ou-btn-ghost h-9 px-3 text-xs">Nuevo</button>
          <button onClick={handleExport} disabled={isExporting} className="ou-btn ou-btn-accent h-9 px-4">
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {isExporting ? "Exportando…" : "Descargar PDF"}
          </button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Pages rail */}
        <aside className="w-40 shrink-0 border-r border-border bg-background-elevated/40 flex flex-col">
          <div className="px-3 py-2.5 flex items-center justify-between border-b border-border">
            <span className="ou-label">Páginas ({pages.length})</span>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2.5 space-y-2.5">
            {pages.map((page, i) => {
              const rot = hist.get(page.id)?.rotation ?? 0;
              const thumbView =
                cache.get(viewKey(page.id, rot)) ??
                cache.get(viewKey(page.id, 0));
              return (
                <div key={page.id} className="group/thumb relative">
                  <PageThumb view={thumbView} index={i} active={page.id === currentId} onClick={() => { setCurrentId(page.id); canvasApi.current?.clearSelection(); }} />
                  <div className="absolute top-1 right-1 flex flex-col gap-1 opacity-0 group-hover/thumb:opacity-100 transition-opacity">
                    <button onClick={() => movePage(page.id, -1)} disabled={i === 0} className="w-6 h-6 rounded-md bg-black/70 text-white flex items-center justify-center hover:bg-black disabled:opacity-30" title="Subir">
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => movePage(page.id, 1)} disabled={i === pages.length - 1} className="w-6 h-6 rounded-md bg-black/70 text-white flex items-center justify-center hover:bg-black disabled:opacity-30" title="Bajar">
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => deletePage(page.id)} className="w-6 h-6 rounded-md bg-black/70 text-white flex items-center justify-center hover:bg-error hover:text-white" title="Eliminar página">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Canvas stage */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          {/* Page controls */}
          <div className="shrink-0 z-20 border-b border-border px-3 py-2 flex items-center gap-2 bg-background-elevated/90 backdrop-blur">
            <button onClick={() => rotatePage(-1)} disabled={rotating} className="ou-btn ou-btn-ghost h-8 px-2.5 text-xs" title="Rotar a la izquierda">
              <RotateCcw className="w-4 h-4" />
            </button>
            <button onClick={() => rotatePage(1)} disabled={rotating} className="ou-btn ou-btn-ghost h-8 px-2.5 text-xs" title="Rotar a la derecha">
              <RotateCw className="w-4 h-4" />
            </button>
            <button onClick={() => current && deletePage(current.id)} className="ou-btn ou-btn-ghost h-8 px-2.5 text-xs text-foreground-muted hover:text-error-text" title="Eliminar página actual">
              <Trash2 className="w-4 h-4" />
            </button>
            <div className="w-px h-5 bg-border mx-1" />
            <button onClick={() => setZoom((z) => Math.max(0.2, z - 0.15))} className="ou-btn ou-btn-ghost h-8 px-2.5" title="Alejar"><ZoomOut className="w-4 h-4" /></button>
            <span className="text-xs text-foreground-muted tabular-nums w-12 text-center">{Math.round(scale * 100)}%</span>
            <button onClick={() => setZoom((z) => Math.min(4, z + 0.15))} className="ou-btn ou-btn-ghost h-8 px-2.5" title="Acercar"><ZoomIn className="w-4 h-4" /></button>
            <button onClick={() => setZoom(1)} className="ou-btn ou-btn-ghost h-8 px-2.5" title="Ajustar"><Maximize2 className="w-4 h-4" /></button>
            <div className="ml-auto text-xs text-foreground-faint">
              Página {pages.findIndex((p) => p.id === currentId) + 1} de {pages.length}
            </div>
          </div>

          {/* Scrollable canvas */}
          <div ref={scrollRef} className="flex-1 overflow-auto custom-scrollbar bg-[#0b0b0b] p-6 flex items-start justify-center">
            {current && currentView ? (
              <div className="relative">
                {rotating && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 rounded">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  </div>
                )}
                <AnnotationCanvas
                  ref={canvasApi}
                  key={viewKey(current.id, currentRotation)}
                  background={currentView.bitmap}
                  width={currentView.width}
                  height={currentView.height}
                  scale={scale}
                  tool={tool}
                  style={style}
                  annotations={annotations}
                  onCommit={(next) => hist.commit(current.id, { annotations: next, rotation: currentRotation })}
                  onSelectionChange={handleSelectionChange}
                  pendingImage={pendingImage}
                  onImagePlaced={() => { setPendingImage(null); setTool("select"); }}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center min-h-[300px]">
                <Loader2 className="w-8 h-8 text-foreground-faint animate-spin" />
              </div>
            )}
          </div>
        </div>
      </div>

      <ErrorModal error={error} onClose={() => setError(null)} />
    </div>
  );
}

function ErrorModal({ error, onClose }: { error: EditorError | null; onClose: () => void }) {
  return (
    <AnimatePresence>
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            onClick={(e) => e.stopPropagation()}
            className="ou-card w-full max-w-md p-6"
          >
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
