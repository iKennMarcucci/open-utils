"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  RefreshCw,
  UploadCloud,
  FileText,
  Image as ImageIcon,
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
  imageToPdf,
  type ConversionMode,
  type ConversionResult,
  type ConversionError,
} from "@/lib/converter";

export function ConverterUi() {
  const searchParams = useSearchParams();
  const initialModeParam = searchParams?.get("mode") as ConversionMode | null;
  const initialMode = initialModeParam === "img-to-pdf" ? "img-to-pdf" : "pdf-to-img";

  const [mode, setMode] = useState<ConversionMode>(initialMode);
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [results, setResults] = useState<ConversionResult[] | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<ConversionError | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fullscreenResult, setFullscreenResult] = useState<ConversionResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setFile(null);
    setFilePreview(null);
    setResults(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  useEffect(() => {
    if (!searchParams) return;
    const urlMode = searchParams.get("mode") as ConversionMode | null;
    if (urlMode === "img-to-pdf" || urlMode === "pdf-to-img") {
      if (mode !== urlMode) {
        setMode(urlMode);
        resetState();
      }
    }
  }, [searchParams]);


  const handleToggleMode = () => {
    setMode((prev) => (prev === "pdf-to-img" ? "img-to-pdf" : "pdf-to-img"));
    resetState();
  };


  const handleFile = async (selectedFile: File) => {
    setError(null);
    
    // Validate file based on mode
    const validationError = validateFile(selectedFile, mode);
    if (validationError) {
      setError(validationError);
      return;
    }

    setFile(selectedFile);
    setResults(null);

    // Create preview for input
    if (selectedFile.type.startsWith("image/")) {
      const url = URL.createObjectURL(selectedFile);
      setFilePreview(url);
    } else if (selectedFile.type === "application/pdf") {
      setFilePreview(null); // Will just show a PDF icon for simplicity
    }

    // Auto-convert
    await handleConvert(selectedFile, mode);
  };

  const handleConvert = async (fileToConvert: File, currentMode: ConversionMode) => {
    setIsConverting(true);
    try {
      if (currentMode === "pdf-to-img") {
        const res = await pdfToImages(fileToConvert);
        setResults(res);
      } else {
        const res = await imageToPdf(fileToConvert);
        setResults([res]);
      }
    } catch (err: any) {
      setError(
        err.title
          ? err
          : {
              title: "Conversion Error",
              message: "An unknown error occurred during conversion.",
              suggestion: "Please try again with a different file.",
            }
      );
    } finally {
      setIsConverting(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
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
    <div className="min-h-screen flex flex-col items-center justify-center p-6 sm:p-12 selection:bg-surface-strong">
      <div className="w-full max-w-4xl space-y-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center space-x-4"
        >
          <h1 className="text-4xl font-semibold tracking-tight text-foreground">
            {mode === "pdf-to-img" ? "PDF ⇄ IMG" : "IMG ⇄ PDF"}
          </h1>
          <button
            onClick={handleToggleMode}
            className="p-2 rounded-full hover:bg-surface-strong/80 transition-colors text-foreground-muted hover:text-foreground"
            title="Switch Conversion Mode"
          >
            <RefreshCw
              className={cn(
                "w-6 h-6 transition-transform duration-500",
                mode === "img-to-pdf" && "rotate-180"
              )}
            />
          </button>
        </motion.div>

        {/* Main Workspace */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Input Area */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col h-full"
          >
            <label className="text-sm font-medium text-foreground-muted mb-3 ml-1 uppercase tracking-wider">
              Input
            </label>
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => !file && fileInputRef.current?.click()}
              className={cn(
                "group relative flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-panel p-8 transition-all overflow-hidden min-h-[350px] bg-surface/50",
                file
                  ? "border-border cursor-default"
                  : "border-border hover:border-border-strong hover:bg-surface cursor-pointer",
                isDragging && "border-white bg-surface",
                error && "border-red-900/50 bg-red-950/10"
              )}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleFile(e.target.files[0]);
                  }
                }}
                className="hidden"
                accept={
                  mode === "pdf-to-img"
                    ? "application/pdf"
                    : "image/png,image/jpeg,image/webp,image/bmp,image/gif"
                }
              />

              <AnimatePresence mode="wait">
                {!file ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex flex-col items-center text-center space-y-4"
                  >
                    <div className="w-16 h-16 rounded-full bg-surface-strong/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <UploadCloud className="w-8 h-8 text-foreground-muted" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-foreground">
                        Drop your file here
                      </p>
                      <p className="text-sm text-foreground-subtle mt-1">
                        or click to browse
                      </p>
                    </div>
                    <div className="text-xs text-foreground-faint mt-4 flex items-center gap-2">
                      {mode === "pdf-to-img" ? (
                        <>
                          <FileText className="w-4 h-4" /> Supports PDF up to 50MB
                        </>
                      ) : (
                        <>
                          <ImageIcon className="w-4 h-4" /> Supports PNG, JPG, WebP
                        </>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="file"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 w-full h-full flex flex-col"
                  >
                    {/* File Preview */}
                    <div className="flex-1 overflow-hidden relative bg-background flex items-center justify-center">
                      {filePreview ? (
                        <img
                          src={filePreview}
                          alt="File Preview"
                          className="w-full h-full object-contain p-4 opacity-50 blur-[2px] hover:opacity-100 hover:blur-none transition-all duration-500"
                        />
                      ) : (
                        <FileText className="w-32 h-32 text-surface-strong" />
                      )}
                      
                      {/* Overlay content */}
                      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-black/80 to-transparent pointer-events-none" />
                      <div className="absolute inset-4 flex flex-col justify-end pointer-events-none">
                         <div className="flex justify-between items-end backdrop-blur-md bg-black/40 p-4 rounded-xl border border-white/5 pointer-events-auto">
                            <div className="truncate pr-4">
                              <p className="text-sm font-medium text-foreground truncate w-[150px] sm:w-[200px]">
                                {file.name}
                              </p>
                              <p className="text-xs text-zinc-400">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                resetState();
                              }}
                              className="p-2 bg-white/10 hover:bg-red-500/20 text-foreground-muted hover:text-red-400 rounded-lg transition-colors shrink-0"
                            >
                              <X className="w-4 h-4" />
                            </button>
                         </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
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
                Output
              </label>
              {results && results.length > 1 && (
                <button 
                  onClick={handleDownloadAll}
                  className="text-xs text-foreground bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3 h-3" /> Download All ({results.length})
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
                    <div className="w-12 h-12 border-[3px] border-border border-t-white rounded-full animate-spin" />
                    <p className="mt-6 text-sm font-medium text-foreground-muted animate-pulse">
                      Processing...
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
                      Awaiting file
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
                          "relative group rounded-xl overflow-hidden bg-black/50 border border-white/5 hover:border-white/20 transition-all shadow-xl",
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
                             className="bg-white/10 hover:bg-white/20 text-foreground p-3 rounded-full transition-transform hover:scale-110"
                           >
                             <Maximize2 className="w-5 h-5" />
                           </button>
                           <button
                             onClick={() => handleDownload(result)}
                             className="bg-white hover:bg-neutral-200 text-black px-4 py-2 rounded-full text-sm font-medium transition-transform hover:scale-105 flex items-center gap-2"
                           >
                             <Download className="w-4 h-4" /> Download
                           </button>
                        </div>
                        {results.length > 1 && (
                          <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md text-[10px] text-foreground/70 border border-white/10">
                            Pg {idx + 1}
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
                    <div className="bg-black/30 rounded-lg p-4 border border-white/5">
                      <p className="text-xs text-foreground-muted font-medium mb-1 uppercase tracking-wider">
                        Suggestion
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
                    className="bg-white hover:bg-neutral-200 text-black px-6 py-2 rounded-full text-sm font-medium transition-colors"
                  >
                    Understood
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
              <span className="text-sm font-medium text-foreground-muted truncate max-w-[300px]">
                {fullscreenResult.filename}
              </span>
              <div className="flex items-center gap-4">
                 <button
                   onClick={() => handleDownload(fullscreenResult)}
                   className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-foreground px-4 py-2 rounded-full text-sm font-medium transition-colors"
                 >
                   <Download className="w-4 h-4" /> Download
                 </button>
                 <button
                   onClick={() => setFullscreenResult(null)}
                   className="p-2 bg-white/5 hover:bg-white/10 text-foreground-muted hover:text-foreground rounded-full transition-colors"
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

    </div>
  );
}
