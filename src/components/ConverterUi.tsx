"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  RefreshCw,
  FileText,
  Download,
  X,
  AlertCircle,
  CheckCircle2,
  Maximize2,
} from "lucide-react";
import { saveAs } from "file-saver";
import { cn } from "@/lib/utils";
import {
  validateFile,
  pdfToImages,
  type ImageFormat,
  type ConversionResult,
  type ConversionError,
} from "@/lib/converter";
import { ExampleButton } from "@/components/ExampleButton";
import { FileDropzone } from "@/components/FileDropzone";
import { ToolLayout } from "@/components/ToolLayout";
import { samplePdfFile } from "@/lib/samples";

/**
 * PDF → image. The opposite direction lives in its own route and component
 * (`ImageToPdfUi`), because it takes *many* images and lets you order them —
 * a different enough interaction that sharing one component only tangled both.
 */
export function ConverterUi() {
  const [format, setFormat] = useState<ImageFormat>("jpeg");
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [results, setResults] = useState<ConversionResult[] | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<ConversionError | null>(null);
  const [fullscreenResult, setFullscreenResult] = useState<ConversionResult | null>(null);

  /** Object URLs are leaked otherwise — one per page, on every conversion. */
  const revokeResults = (list: ConversionResult[] | null) => {
    list?.forEach((r) => URL.revokeObjectURL(r.url));
  };

  const resetState = () => {
    setFile(null);
    setFilePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setResults((prev) => {
      revokeResults(prev);
      return null;
    });
    setError(null);
  };

  useEffect(() => {
    return () => {
      revokeResults(results);
      if (filePreview) URL.revokeObjectURL(filePreview);
    };
    // Cleanup on unmount only; `results`/`filePreview` are read at teardown.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFile = async (selectedFile: File) => {
    setError(null);

    const validationError = validateFile(selectedFile, "pdf-to-img");
    if (validationError) {
      setError(validationError);
      return;
    }

    setFile(selectedFile);
    setResults((prev) => {
      revokeResults(prev);
      return null;
    });

    if (selectedFile.type.startsWith("image/")) {
      const url = URL.createObjectURL(selectedFile);
      setFilePreview(url);
    } else if (selectedFile.type === "application/pdf") {
      setFilePreview(null); // A PDF icon stands in for the preview.
    }

    await handleConvert(selectedFile, format);
  };

  const handleConvert = async (fileToConvert: File, imageFormat: ImageFormat) => {
    setIsConverting(true);
    try {
      const res = await pdfToImages(fileToConvert, imageFormat);
      setResults(res);
    } catch (err: unknown) {
      const known = err as ConversionError;
      setError(
        known?.title
          ? known
          : {
              title: "Error de conversión",
              message: "Ha ocurrido un error inesperado durante la conversión.",
              suggestion: "Inténtalo de nuevo con otro archivo.",
            }
      );
    } finally {
      setIsConverting(false);
    }
  };

  /** Re-runs the conversion when the user picks a different output format. */
  const handleFormatChange = async (next: ImageFormat) => {
    if (next === format) return;
    setFormat(next);
    setResults((prev) => {
      revokeResults(prev);
      return null;
    });
    if (file) await handleConvert(file, next);
  };

  const handleDownload = (result: ConversionResult) => {
    saveAs(result.blob, result.filename);
  };

  const handleDownloadAll = () => {
    if (!results) return;
    results.forEach((res) => {
      saveAs(res.blob, res.filename);
    });
  };

  return (
    <ToolLayout
      slug="pdf-a-imagen"
      actions={
        <>
          <Link
            href="/imagen-a-pdf"
            title="Cambiar a Imagen a PDF"
            aria-label="Cambiar a Imagen a PDF"
            className="ou-btn ou-btn-secondary w-fit"
          >
            <RefreshCw className="h-4 w-4" /> Imagen a PDF
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            <span className="ou-label">Formato de salida</span>
            <div
              role="radiogroup"
              aria-label="Formato de salida"
              className="flex items-center gap-1 rounded-control border border-border bg-surface p-1"
            >
              {(["jpeg", "png"] as const).map((f) => (
                <button
                  key={f}
                  role="radio"
                  aria-checked={format === f}
                  onClick={() => handleFormatChange(f)}
                  disabled={isConverting}
                  className={cn(
                    "px-3 py-1 rounded-md text-xs font-medium transition-colors disabled:opacity-50",
                    format === f
                      ? "bg-surface-strong text-foreground"
                      : "text-foreground-faint hover:text-foreground"
                  )}
                >
                  {f === "jpeg" ? "JPG" : "PNG"}
                </button>
              ))}
          </div>
          </div>
        </>
      }
    >
        {/* Main Workspace */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Input Area */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col h-full"
          >
            <label className="text-sm font-medium text-foreground-muted mb-3 ml-1 uppercase tracking-wider">
              Entrada
            </label>
            {!file ? (
              <FileDropzone
                onFiles={(files) => handleFile(files[0])}
                accept="application/pdf"
                title="Arrastra tu archivo aquí"
                subtitle="o haz clic para elegirlo"
                hint={
                  <>
                    <FileText className="w-4 h-4" /> Admite PDF de hasta 50 MB
                  </>
                }
                example={
                  <ExampleButton onClick={() => samplePdfFile(3, "ejemplo.pdf").then(handleFile)} />
                }
                className={cn("flex-1", error && "border-error/40 bg-error/5")}
              />
            ) : (
              <motion.div
                key="file"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={cn(
                  "group relative flex-1 flex flex-col overflow-hidden rounded-panel border-2 border-dashed min-h-[350px] bg-surface/50",
                  error ? "border-error/40 bg-error/5" : "border-border"
                )}
              >
                {/* File Preview */}
                <div className="flex-1 overflow-hidden relative bg-background flex items-center justify-center">
                  {filePreview ? (
                    <img
                      src={filePreview}
                      alt="Vista previa del archivo"
                      className="w-full h-full object-contain p-4 opacity-50 blur-[2px] hover:opacity-100 hover:blur-none transition-all duration-500"
                    />
                  ) : (
                    <FileText className="w-32 h-32 text-surface-strong" />
                  )}

                  {/* Overlay content */}
                  <div className="absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-black/80 to-transparent pointer-events-none" />
                  <div className="absolute inset-4 flex flex-col justify-end pointer-events-none">
                     <div className="flex justify-between items-end backdrop-blur-md bg-black/40 p-4 rounded-xl border border-white/10 pointer-events-auto">
                        <div className="truncate pr-4">
                          <p className="text-sm font-medium text-white truncate w-[150px] sm:w-[200px]">
                            {file.name}
                          </p>
                          <p className="text-xs text-white/60">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            resetState();
                          }}
                          className="p-2 bg-white/10 hover:bg-red-500/20 text-white/70 hover:text-red-400 rounded-lg transition-colors shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </button>
                     </div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Output Area */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col h-full"
          >
            <div className="flex justify-between items-end mb-3 ml-1">
              <label className="text-sm font-medium text-foreground-muted uppercase tracking-wider">
                Salida
              </label>
              {results && results.length > 1 && (
                <button
                  onClick={handleDownloadAll}
                  className="text-xs text-foreground bg-surface-hover hover:bg-surface-strong border border-border px-3 py-1 rounded-full transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3 h-3" /> Descargar todo ({results.length})
                </button>
              )}
            </div>
            <div
              className={cn(
                "relative flex-1 flex flex-col items-center justify-center border border-border rounded-panel transition-all overflow-hidden min-h-[350px]",
                results ? "bg-surface border-border-strong" : "bg-background/50"
              )}
            >
              <AnimatePresence mode="wait">
                {isConverting ? (
                  <motion.div
                    key="converting"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center"
                  >
                    <div className="w-12 h-12 border-[3px] border-border border-t-accent rounded-full animate-spin" />
                    <p className="mt-6 text-sm font-medium text-foreground-muted animate-pulse">
                      Procesando…
                    </p>
                  </motion.div>
                ) : !results ? (
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
                      Esperando archivo
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={cn(
                      "w-full h-full absolute inset-0 overflow-y-auto p-4 custom-scrollbar",
                      results.length > 1 ? "grid grid-cols-2 gap-4 auto-rows-max" : "flex items-center justify-center"
                    )}
                  >
                    {results.map((result, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "relative group rounded-xl overflow-hidden bg-surface-strong border border-border hover:border-border-strong transition-all shadow-xl",
                          results.length === 1 ? "w-full max-w-[300px] aspect-[3/4]" : "aspect-square"
                        )}
                      >
                        {result.type === "application/pdf" ? (
                          <div className="w-full h-full flex items-center justify-center bg-surface text-foreground-muted">
                            <FileText className="w-16 h-16 opacity-50" />
                          </div>
                        ) : (
                          <img
                            src={result.url}
                            alt={result.filename}
                            className="w-full h-full object-cover"
                          />
                        )}
                        
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3 backdrop-blur-sm">
                           <button
                             onClick={() => setFullscreenResult(result)}
                             className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-transform hover:scale-110"
                           >
                             <Maximize2 className="w-5 h-5" />
                           </button>
                           <button
                             onClick={() => handleDownload(result)}
                             className="bg-foreground hover:bg-foreground-muted text-background px-4 py-2 rounded-full text-sm font-medium transition-transform hover:scale-105 flex items-center gap-2"
                           >
                             <Download className="w-4 h-4" /> Descargar
                           </button>
                        </div>
                        {results.length > 1 && (
                          <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md text-[10px] text-white/70 border border-white/10">
                            Pág. {idx + 1}
                          </div>
                        )}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
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
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-surface border border-border w-full max-w-md max-h-[85vh] flex flex-col rounded-panel shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-blue-500 to-purple-500" />
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {error.title}
                    </h3>
                    <p className="text-foreground-muted text-sm mb-4 leading-relaxed wrap-break-word">
                      {error.message}
                    </p>
                    <div className="bg-background-elevated rounded-lg p-4 border border-border">
                      <p className="text-xs text-foreground-muted font-medium mb-1 uppercase tracking-wider">
                        Sugerencia
                      </p>
                      <p className="text-sm text-foreground-muted wrap-break-word">
                        {error.suggestion}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-8 flex justify-end">
                  <button
                    onClick={() => setError(null)}
                    className="ou-btn ou-btn-primary"
                  >
                    Entendido
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen Preview Modal */}
      <AnimatePresence>
        {fullscreenResult && (
          <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col"
          >
            {/* Header / Actions */}
            <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-black/50">
              <span className="text-sm font-medium text-white/70 truncate max-w-[200px] sm:max-w-[300px]">
                {fullscreenResult.filename}
              </span>
              <div className="flex items-center gap-4">
                 <button
                   onClick={() => handleDownload(fullscreenResult)}
                   className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
                 >
                   <Download className="w-4 h-4" /> Descargar
                 </button>
                 <button
                   onClick={() => setFullscreenResult(null)}
                   className="p-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-full transition-colors"
                 >
                   <X className="w-5 h-5" />
                 </button>
              </div>
            </div>

            {/* Content area */}
            <div className="flex-1 overflow-auto p-4 sm:p-8 flex items-center justify-center">
               {fullscreenResult.type === "application/pdf" ? (
                 <iframe 
                   src={fullscreenResult.url} 
                   className="w-full h-full max-w-5xl bg-white rounded-xl shadow-2xl"
                   title="PDF Preview"
                 />
               ) : (
                 <div className="relative aspect-[3/4] bg-surface-strong rounded-panel overflow-hidden group shadow-lg">
                   <img
                     src={fullscreenResult.url}
                     alt="Preview"
                     className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                   />
                 </div>
               )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </ToolLayout>
  );
}
