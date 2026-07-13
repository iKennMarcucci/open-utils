"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, Reorder } from "motion/react";
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  Download,
  X,
  CheckCircle2,
  GripVertical,
  Layers,
  Trash2,
  Hash,
  RefreshCw,
} from "lucide-react";
import { saveAs } from "file-saver";
import { cn } from "@/lib/utils";
import {
  buildMergeItem,
  mergeToPdf,
  type MergeItem,
  type MergeResult,
  type MergeError,
} from "@/lib/merge-converter";

const ACCEPT = "application/pdf,image/png,image/jpeg,image/webp,image/bmp,image/gif";

export function MergeConverterUi() {
  const router = useRouter();
  const [items, setItems] = useState<MergeItem[]>([]);
  const [result, setResult] = useState<MergeResult | null>(null);
  const [isMerging, setIsMerging] = useState(false);
  const [error, setError] = useState<MergeError | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [addPageNumbers, setAddPageNumbers] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const itemsRef = useRef<MergeItem[]>([]);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  // Revoke object URLs on unmount to avoid leaks.
  useEffect(() => {
    return () => {
      itemsRef.current.forEach((it) => it.preview && URL.revokeObjectURL(it.preview));
    };
  }, []);

  const clearResult = () => {
    setResult((prev) => {
      if (prev) URL.revokeObjectURL(prev.url);
      return null;
    });
  };

  const addFiles = (files: FileList | File[]) => {
    setError(null);
    clearResult();
    const incoming = Array.from(files);
    const accepted: MergeItem[] = [];
    let firstError: MergeError | null = null;

    incoming.forEach((file, i) => {
      const { item, error: itemError } = buildMergeItem(file, items.length + i);
      if (item) accepted.push(item);
      else if (itemError && !firstError) firstError = itemError;
    });

    if (accepted.length > 0) setItems((prev) => [...prev, ...accepted]);
    if (firstError) setError(firstError);
  };

  const removeItem = (id: string) => {
    clearResult();
    setItems((prev) => {
      const target = prev.find((it) => it.id === id);
      if (target?.preview) URL.revokeObjectURL(target.preview);
      return prev.filter((it) => it.id !== id);
    });
  };

  const clearAll = () => {
    clearResult();
    setError(null);
    setItems((prev) => {
      prev.forEach((it) => it.preview && URL.revokeObjectURL(it.preview));
      return [];
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleMerge = async () => {
    setError(null);
    setIsMerging(true);
    clearResult();
    try {
      const res = await mergeToPdf(items, { addPageNumbers });
      setResult(res);
    } catch (err) {
      const e = err as MergeError;
      setError(
        e.title
          ? e
          : {
            title: "Error al unificar",
            message: "Ocurrió un error desconocido al generar el PDF.",
            suggestion: "Inténtalo de nuevo con otros archivos.",
          }
      );
    } finally {
      setIsMerging(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const onDragLeave = () => setIsDragging(false);
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 sm:p-12 selection:bg-surface-strong">
      <div className="w-full max-w-4xl space-y-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center space-x-4"
        >
          <Layers className="w-7 h-7 text-foreground-muted" />
          <h2 className="text-4xl font-semibold tracking-tight text-foreground">
            Unificador PDF
          </h2>
          <button
            onClick={() => router.push("/dividir-pdf")}
            title="Cambiar a Dividir PDF"
            className="p-2 rounded-full hover:bg-surface-strong transition-colors text-foreground-muted hover:text-foreground"
          >
            <RefreshCw className="w-6 h-6 transition-transform duration-500" />
          </button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Input / Ordering Area */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col h-full"
          >
            <div className="flex justify-between items-end mb-3 ml-1">
              <label className="text-sm font-medium text-foreground-muted uppercase tracking-wider">
                Entrada {items.length > 0 && `(${items.length})`}
              </label>
              {items.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-xs text-foreground-muted hover:text-red-400 transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3 h-3" /> Limpiar todo
                </button>
              )}
            </div>

            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              className={cn(
                "group relative flex-1 flex flex-col border-2 border-dashed rounded-panel transition-all overflow-hidden min-h-[400px] bg-surface/50",
                items.length === 0
                  ? "border-border hover:border-border-strong hover:bg-surface cursor-pointer items-center justify-center p-8"
                  : "border-border p-3",
                isDragging && "border-white bg-surface",
                error && "border-red-900/50 bg-red-950/10"
              )}
              onClick={() => items.length === 0 && fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                multiple
                accept={ACCEPT}
                onChange={(e) => {
                  if (e.target.files?.length) addFiles(e.target.files);
                  e.target.value = "";
                }}
                className="hidden"
              />

              {items.length === 0 ? (
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-surface-strong/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <UploadCloud className="w-8 h-8 text-foreground-muted" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-foreground">
                      Suelta tus PDFs e imágenes aquí
                    </p>
                    <p className="text-sm text-foreground-subtle mt-1">
                      o haz clic para seleccionar varios
                    </p>
                  </div>
                  <div className="text-xs text-foreground-faint mt-4 flex items-center gap-3">
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-4 h-4" /> PDF
                    </span>
                    <span className="flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4" /> PNG, JPG, WebP
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col min-h-0">
                  <Reorder.Group
                    axis="y"
                    values={items}
                    onReorder={(next) => {
                      clearResult();
                      setItems(next);
                    }}
                    className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1"
                  >
                    {items.map((item, idx) => (
                      <Reorder.Item
                        key={item.id}
                        value={item}
                        className="flex items-center gap-3 bg-surface border border-border rounded-xl p-2.5 cursor-grab active:cursor-grabbing hover:border-border-strong transition-colors"
                      >
                        <GripVertical className="w-4 h-4 text-foreground-faint shrink-0" />
                        <span className="w-6 h-6 rounded-md bg-surface-strong text-foreground-muted text-xs font-medium flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div className="w-10 h-10 rounded-md overflow-hidden bg-background flex items-center justify-center shrink-0 border border-white/5">
                          {item.preview ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.preview}
                              alt={item.file.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <FileText className="w-5 h-5 text-foreground-subtle" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground truncate">
                            {item.file.name}
                          </p>
                          <p className="text-xs text-foreground-subtle">
                            {item.kind === "pdf" ? "PDF" : "Imagen"} ·{" "}
                            {(item.file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeItem(item.id);
                          }}
                          className="p-1.5 text-foreground-subtle hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </Reorder.Item>
                    ))}
                  </Reorder.Group>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2 shrink-0 flex items-center justify-center gap-2 text-sm text-foreground-muted hover:text-foreground border border-dashed border-border hover:border-border-strong rounded-xl py-2.5 transition-colors"
                  >
                    <UploadCloud className="w-4 h-4" /> Agregar más
                  </button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Output Area */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col h-full"
          >
            <label className="text-sm font-medium text-foreground-muted mb-3 ml-1 uppercase tracking-wider">
              Salida
            </label>
            <div
              className={cn(
                "relative flex-1 flex flex-col items-center justify-center border border-border rounded-panel transition-all overflow-hidden min-h-[400px]",
                result ? "bg-surface border-border-strong" : "bg-background/50"
              )}
            >
              <AnimatePresence mode="wait">
                {isMerging ? (
                  <motion.div
                    key="merging"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center"
                  >
                    <div className="w-12 h-12 border-[3px] border-border border-t-white rounded-full animate-spin" />
                    <p className="mt-6 text-sm font-medium text-foreground-muted animate-pulse">
                      Unificando...
                    </p>
                  </motion.div>
                ) : result ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 flex flex-col p-4"
                  >
                    <div className="flex-1 min-h-0 rounded-xl overflow-hidden border border-white/10 bg-white">
                      <iframe
                        src={result.url}
                        className="w-full h-full"
                        title="Vista previa del PDF"
                      />
                    </div>
                    <div className="shrink-0 mt-4 flex items-center justify-between gap-3">
                      <div className="text-sm text-foreground-muted">
                        <span className="text-foreground font-medium">
                          {result.pages}
                        </span>{" "}
                        páginas
                      </div>
                      <button
                        onClick={() => saveAs(result.blob, result.filename)}
                        className="bg-white hover:bg-neutral-200 text-black px-5 py-2.5 rounded-full text-sm font-medium transition-transform hover:scale-105 flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" /> Descargar PDF
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center px-6"
                  >
                    <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mx-auto mb-4 border border-border">
                      <CheckCircle2 className="w-8 h-8 text-foreground-faint" />
                    </div>
                    <p className="text-sm font-medium text-foreground-subtle">
                      {items.length === 0
                        ? "Esperando archivos"
                        : "Listo para unificar"}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            onClick={() => setAddPageNumbers((v) => !v)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium border transition-colors",
              addPageNumbers
                ? "bg-white/10 border-white/20 text-foreground"
                : "bg-transparent border-border text-foreground-muted hover:text-foreground hover:border-border-strong"
            )}
          >
            <Hash className="w-4 h-4" />
            Numeración de páginas: {addPageNumbers ? "Sí" : "No"}
          </button>
          <button
            onClick={handleMerge}
            disabled={items.length === 0 || isMerging}
            className={cn(
              "flex items-center gap-2 px-8 py-2.5 rounded-full text-sm font-semibold transition-all",
              items.length === 0 || isMerging
                ? "bg-surface-strong text-foreground-subtle cursor-not-allowed"
                : "bg-white text-black hover:bg-neutral-200 hover:scale-105"
            )}
          >
            <Layers className="w-4 h-4" />
            Unificar {items.length > 0 ? `${items.length} archivos` : ""} en PDF
          </button>
        </motion.div>
      </div>

      {/* Error Modal */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setError(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface border border-border w-full max-w-md max-h-[85vh] flex flex-col rounded-panel shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-blue-500 to-purple-500" />
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {error.title}
                </h3>
                <p className="text-foreground-muted text-sm mb-4 leading-relaxed wrap-break-word">
                  {error.message}
                </p>
                <div className="bg-black/30 rounded-lg p-4 border border-white/5">
                  <p className="text-xs text-foreground-muted font-medium mb-1 uppercase tracking-wider">
                    Sugerencia
                  </p>
                  <p className="text-sm text-foreground-muted wrap-break-word">
                    {error.suggestion}
                  </p>
                </div>
                <div className="mt-8 flex justify-end">
                  <button
                    onClick={() => setError(null)}
                    className="bg-white hover:bg-neutral-200 text-black px-6 py-2 rounded-full text-sm font-medium transition-colors"
                  >
                    Entendido
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
