"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence, Reorder } from "motion/react";
import {
  RefreshCw,
  UploadCloud,
  FileText,
  Image as ImageIcon,
  Download,
  X,
  AlertCircle,
  CheckCircle2,
  GripVertical,
  Trash2,
} from "lucide-react";
import { saveAs } from "file-saver";
import { cn } from "@/lib/utils";
import { ToolLayout } from "@/components/ToolLayout";
import { ExampleButton } from "@/components/ExampleButton";
import { sampleImageFile } from "@/lib/samples";
import {
  validateFile,
  imagesToPdf,
  type ConversionResult,
  type ConversionError,
} from "@/lib/converter";

const ACCEPT = "image/png,image/jpeg,image/webp,image/bmp,image/gif";

/** One picked image, with its own preview URL and a stable id for reordering. */
type ImageItem = {
  id: string;
  file: File;
  preview: string;
};

let itemCounter = 0;

export function ImageToPdfUi() {
  const [items, setItems] = useState<ImageItem[]>([]);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<ConversionError | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Object URLs must be revoked by hand; a ref keeps the unmount cleanup from
  // needing `items` as a dependency (which would re-register it on every add).
  const itemsRef = useRef<ImageItem[]>([]);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);
  const resultRef = useRef<ConversionResult | null>(null);
  useEffect(() => {
    resultRef.current = result;
  }, [result]);

  useEffect(() => {
    return () => {
      itemsRef.current.forEach((it) => URL.revokeObjectURL(it.preview));
      if (resultRef.current) URL.revokeObjectURL(resultRef.current.url);
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

    const accepted: ImageItem[] = [];
    for (const file of Array.from(files)) {
      const validationError = validateFile(file, "img-to-pdf");
      if (validationError) {
        setError(validationError);
        continue;
      }
      accepted.push({
        id: `img${itemCounter++}`,
        file,
        preview: URL.createObjectURL(file),
      });
    }

    if (accepted.length > 0) setItems((prev) => [...prev, ...accepted]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeItem = (id: string) => {
    clearResult();
    setItems((prev) => {
      const gone = prev.find((it) => it.id === id);
      if (gone) URL.revokeObjectURL(gone.preview);
      return prev.filter((it) => it.id !== id);
    });
  };

  const clearAll = () => {
    clearResult();
    setError(null);
    setItems((prev) => {
      prev.forEach((it) => URL.revokeObjectURL(it.preview));
      return [];
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleConvert = async () => {
    if (items.length === 0) return;
    setIsConverting(true);
    setError(null);
    try {
      // Page order == list order, which is what the user dragged it into.
      const res = await imagesToPdf(items.map((it) => it.file));
      setResult(res);
    } catch (err: unknown) {
      const known = err as ConversionError;
      setError(
        known?.title
          ? known
          : {
              title: "Error de conversión",
              message: "Ha ocurrido un error inesperado durante la conversión.",
              suggestion: "Inténtalo de nuevo con otras imágenes.",
            }
      );
    } finally {
      setIsConverting(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };

  return (
    <ToolLayout
      slug="imagen-a-pdf"
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/pdf-a-imagen"
            title="Cambiar a PDF a imagen"
            aria-label="Cambiar a PDF a imagen"
            className="ou-btn ou-btn-secondary"
          >
            <RefreshCw className="h-4 w-4 rotate-180" />
            PDF a imagen
          </Link>
        </div>
      }
    >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Input / ordering */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex min-w-0 flex-col h-full"
          >
            <div className="flex justify-between items-end mb-3 ml-1">
              <label className="text-sm font-medium text-foreground-muted uppercase tracking-wider">
                Imágenes {items.length > 0 && `(${items.length})`}
              </label>
              {items.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-xs text-foreground-muted hover:text-red-400 transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Quitar todas
                </button>
              )}
            </div>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              onClick={() => items.length === 0 && fileInputRef.current?.click()}
              className={cn(
                "group relative flex-1 flex flex-col border-2 border-dashed rounded-panel transition-all overflow-hidden min-h-[350px] bg-surface/50",
                items.length === 0
                  ? "border-border hover:border-border-strong hover:bg-surface cursor-pointer items-center justify-center p-8"
                  : "border-border p-3",
                isDragging && "border-accent bg-accent-subtle",
                error && "border-red-900/50 bg-red-950/10"
              )}
            >
              <input
                type="file"
                ref={fileInputRef}
                multiple
                accept={ACCEPT}
                className="hidden"
                onChange={(e) => e.target.files?.length && addFiles(e.target.files)}
              />

              {items.length === 0 ? (
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-surface-strong flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <UploadCloud className="w-8 h-8 text-foreground-muted" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-foreground">
                      Arrastra tus imágenes aquí
                    </p>
                    <p className="text-sm text-foreground-subtle mt-1">
                      o haz clic para elegirlas — puedes añadir varias
                    </p>
                  </div>
                  <div className="text-xs text-foreground-faint mt-4 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" /> PNG, JPG, WebP, BMP y GIF · hasta 50 MB
                    cada una
                  </div>
                  <div onClick={(e) => e.stopPropagation()} className="mt-3">
                    <ExampleButton
                      onClick={() =>
                        Promise.all([
                          sampleImageFile("Página 1", "ejemplo-1.png", 900, 1200, ["#0ea5e9", "#1e3a8a"]),
                          sampleImageFile("Página 2", "ejemplo-2.png", 900, 1200, ["#f97316", "#db2777"]),
                        ]).then(addFiles)
                      }
                    />
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col min-h-0">
                  <p className="text-[11px] text-foreground-faint mb-2 px-1">
                    Arrastra para cambiar el orden de las páginas.
                  </p>
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
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.preview}
                            alt={item.file.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-foreground truncate">
                            {item.file.name}
                          </p>
                          <p className="text-[11px] text-foreground-faint">
                            {(item.file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          aria-label={`Quitar ${item.file.name}`}
                          className="p-1.5 rounded-md text-foreground-faint hover:text-red-400 hover:bg-surface-strong transition-colors shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </Reorder.Item>
                    ))}
                  </Reorder.Group>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2 w-full py-2 rounded-xl border border-dashed border-border text-xs text-foreground-muted hover:text-foreground hover:border-border-strong transition-colors"
                  >
                    + Añadir más imágenes
                  </button>
                </div>
              )}
            </div>

            {items.length > 0 && (
              <button
                onClick={handleConvert}
                disabled={isConverting}
                className="mt-4 w-full h-12 rounded-panel bg-foreground text-background font-medium transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" />
                {isConverting
                  ? "Creando el PDF…"
                  : `Crear PDF (${items.length} ${items.length === 1 ? "página" : "páginas"})`}
              </button>
            )}
          </motion.div>

          {/* Output */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex min-w-0 flex-col h-full"
          >
            <label className="text-sm font-medium text-foreground-muted mb-3 ml-1 uppercase tracking-wider">
              Salida
            </label>
            <div
              className={cn(
                "relative flex-1 flex flex-col items-center justify-center border border-border rounded-panel transition-all overflow-hidden min-h-[350px] p-6",
                result ? "bg-surface border-border-strong" : "bg-background/50"
              )}
            >
              <AnimatePresence mode="wait">
                {error ? (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center"
                  >
                    <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
                    <p className="text-sm font-medium text-foreground">{error.title}</p>
                    <p className="text-xs text-foreground-subtle mt-1.5">{error.message}</p>
                    <p className="text-xs text-foreground-faint mt-2">{error.suggestion}</p>
                  </motion.div>
                ) : isConverting ? (
                  <motion.div
                    key="converting"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center"
                  >
                    <div className="w-12 h-12 border-[3px] border-border border-t-white rounded-full animate-spin" />
                    <p className="mt-6 text-sm font-medium text-foreground-muted animate-pulse">
                      Procesando…
                    </p>
                  </motion.div>
                ) : !result ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center"
                  >
                    <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mx-auto mb-4 border border-border">
                      <CheckCircle2 className="w-8 h-8 text-foreground-faint" />
                    </div>
                    <p className="text-sm font-medium text-foreground-subtle">
                      Esperando imágenes
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center text-center"
                  >
                    <div className="w-20 h-24 rounded-lg bg-surface-strong border border-border flex items-center justify-center mb-5">
                      <FileText className="w-10 h-10 text-foreground-muted" />
                    </div>
                    <p className="text-sm font-medium text-foreground">{result.filename}</p>
                    <p className="text-xs text-foreground-faint mt-1">
                      {result.pages} {result.pages === 1 ? "página" : "páginas"} ·{" "}
                      {(result.blob.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <button
                      onClick={() => saveAs(result.blob, result.filename)}
                      className="mt-6 px-6 h-11 rounded-full bg-white hover:bg-neutral-200 text-black text-sm font-medium transition-transform hover:scale-105 flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" /> Descargar PDF
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
    </ToolLayout>
  );
}
