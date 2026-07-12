"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  UploadCloud,
  FileText,
  Files,
  Image as ImageIcon,
  Scissors,
  Plus,
  X,
  Trash2,
  Download,
  Archive,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Package as PackageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  loadPdf,
  buildSplitOutputs,
  downloadAllAsZip,
  saveResultFile,
  type LoadedPdf,
  type SplitPackage,
  type PackageOutput,
  type SplitResultGroup,
  type SplitError,
} from "@/lib/pdf-splitter";

const PKG_COLORS = [
  "#52a8ff",
  "#bf7af0",
  "#f5a623",
  "#3ddbd0",
  "#4ade80",
  "#ff6166",
  "#fb923c",
];

const OUTPUT_OPTIONS: { id: PackageOutput; label: string; icon: typeof FileText }[] = [
  { id: "pdf-single", label: "PDF unido", icon: FileText },
  { id: "pdf-per-page", label: "PDF x pág.", icon: Files },
  { id: "image", label: "Imágenes", icon: ImageIcon },
];

const outputLabel = (o: PackageOutput) =>
  OUTPUT_OPTIONS.find((x) => x.id === o)?.label ?? o;

export function SplitConverterUi() {
  const router = useRouter();
  const [doc, setDoc] = useState<LoadedPdf | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [packages, setPackages] = useState<SplitPackage[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [results, setResults] = useState<SplitResultGroup[] | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<SplitError | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pkgCounter = useRef(1);
  const resultsRef = useRef<SplitResultGroup[] | null>(null);
  useEffect(() => {
    resultsRef.current = results;
  }, [results]);

  const revokeResults = () => {
    resultsRef.current?.forEach((g) => g.files.forEach((f) => URL.revokeObjectURL(f.url)));
  };
  // Revoke any outstanding object URLs on unmount.
  useEffect(() => () => revokeResults(), []);

  const makePackage = (): SplitPackage => {
    const n = pkgCounter.current++;
    return {
      id: `pkg-${n}`,
      name: `Paquete ${n}`,
      pages: [],
      output: "pdf-single",
      color: PKG_COLORS[(n - 1) % PKG_COLORS.length],
    };
  };

  const resetAll = () => {
    revokeResults();
    setResults(null);
    setDoc(null);
    setPackages([]);
    setActiveId("");
    setError(null);
    pkgCounter.current = 1;
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFile = async (file: File) => {
    setError(null);
    setIsLoading(true);
    revokeResults();
    setResults(null);
    try {
      const loaded = await loadPdf(file);
      setDoc(loaded);
      pkgCounter.current = 1;
      const first = makePackage();
      setPackages([first]);
      setActiveId(first.id);
    } catch (err) {
      const e = err as SplitError;
      setError(
        e.title ? e : { title: "Error", message: "No se pudo abrir el PDF.", suggestion: "Intenta con otro archivo." }
      );
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

  const invalidateResults = () => {
    if (resultsRef.current) {
      revokeResults();
      setResults(null);
    }
  };

  const togglePage = (pageNo: number) => {
    invalidateResults();
    setPackages((prev) => {
      const activeIdx = prev.findIndex((p) => p.id === activeId);
      if (activeIdx === -1) return prev;
      return prev.map((p, idx) => {
        if (idx === activeIdx) {
          return p.pages.includes(pageNo)
            ? { ...p, pages: p.pages.filter((n) => n !== pageNo) }
            : { ...p, pages: [...p.pages, pageNo].sort((a, b) => a - b) };
        }
        return p.pages.includes(pageNo)
          ? { ...p, pages: p.pages.filter((n) => n !== pageNo) }
          : p;
      });
    });
  };

  const addPackage = () => {
    invalidateResults();
    const pkg = makePackage();
    setPackages((prev) => [...prev, pkg]);
    setActiveId(pkg.id);
  };

  const removePackage = (id: string) => {
    invalidateResults();
    setPackages((prev) => {
      const next = prev.filter((p) => p.id !== id);
      if (id === activeId) setActiveId(next[0]?.id ?? "");
      return next;
    });
  };

  const setOutput = (id: string, output: PackageOutput) => {
    invalidateResults();
    setPackages((prev) => prev.map((p) => (p.id === id ? { ...p, output } : p)));
  };

  const assignedCount = packages.reduce((n, p) => n + p.pages.length, 0);
  const activePkg = packages.find((p) => p.id === activeId) ?? null;

  // page number -> owning package color/index
  const owner: Record<number, { color: string; idx: number }> = {};
  packages.forEach((p, idx) => p.pages.forEach((pg) => (owner[pg] = { color: p.color, idx })));

  const handleProcess = async () => {
    if (!doc) return;
    setError(null);
    setIsProcessing(true);
    revokeResults();
    try {
      const groups = await buildSplitOutputs(doc.bytes, doc.name, packages);
      setResults(groups);
    } catch (err) {
      const e = err as SplitError;
      setError(
        e.title ? e : { title: "Error", message: "No se pudieron generar los archivos.", suggestion: "Intenta de nuevo." }
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      className={cn(
        "min-h-screen flex flex-col p-6 sm:p-10 lg:p-12",
        !doc && "items-center justify-center"
      )}
    >
      <div
        className={cn(
          "w-full mx-auto flex flex-col",
          doc ? "max-w-6xl flex-1" : "max-w-4xl"
        )}
      >
        {/* Header — matches "Unificador PDF": centered icon + title + mode toggle */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center space-x-4 mb-10"
        >
          <Scissors className="w-7 h-7 text-foreground-muted" />
          <h1 className="text-4xl font-semibold tracking-tight text-foreground">
            Separador PDF
          </h1>
          <button
            onClick={() => router.push("/pdf-organizer?mode=merge")}
            title="Cambiar a Unificador PDF"
            className="p-2 rounded-full hover:bg-surface-strong transition-colors text-foreground-muted hover:text-foreground"
          >
            <RefreshCw className="w-6 h-6 transition-transform duration-500" />
          </button>
        </motion.div>

        {/* Empty state / loader — two columns, like "Unificador PDF" */}
        {!doc ? (
          isLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[420px]">
              <div className="w-12 h-12 border-[3px] border-surface-strong border-t-accent rounded-full animate-spin" />
              <p className="mt-6 text-sm font-medium text-foreground-subtle animate-pulse">
                Cargando páginas…
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Entrada */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex flex-col h-full"
              >
                <label className="text-sm font-medium text-foreground-muted uppercase tracking-wider mb-3 ml-1">
                  Entrada
                </label>
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={onDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "group relative flex-1 flex flex-col items-center justify-center gap-5 border-2 border-dashed rounded-panel transition-all overflow-hidden min-h-[420px] p-8 text-center cursor-pointer",
                    isDragging
                      ? "border-white bg-surface"
                      : "border-border bg-surface/50 hover:border-border-strong hover:bg-surface"
                  )}
                >
                  <div className="w-16 h-16 rounded-full bg-surface-strong flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <UploadCloud className="w-8 h-8 text-foreground-muted" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-foreground">Suelta tu PDF aquí</p>
                    <p className="text-sm text-foreground-subtle mt-1">o haz clic para seleccionarlo</p>
                  </div>
                  <div className="text-xs text-foreground-faint mt-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Solo PDF · máx. 100MB
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

              {/* Salida */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col h-full"
              >
                <label className="text-sm font-medium text-foreground-muted uppercase tracking-wider mb-3 ml-1">
                  Salida
                </label>
                <div className="relative flex-1 flex flex-col items-center justify-center border border-border rounded-panel overflow-hidden min-h-[420px] bg-background/50 text-center px-8">
                  <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mb-4 border border-border">
                    <PackageIcon className="w-8 h-8 text-foreground-faint" />
                  </div>
                  <p className="text-sm font-medium text-foreground-subtle">Esperando un PDF</p>
                  <p className="text-xs text-foreground-faint mt-1 max-w-[240px]">
                    Al cargarlo, sus páginas aparecerán aquí para armar tus paquetes.
                  </p>
                </div>
              </motion.div>
            </div>
          )
        ) : results ? (
          /* ---------------- Results ---------------- */
          <ResultsView
            groups={results}
            sourceName={doc.name}
            onBack={() => setResults(null)}
            onReset={resetAll}
          />
        ) : (
          /* ---------------- Editor ---------------- */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
            {/* Pages grid */}
            <div className="lg:col-span-2 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <p className="ou-label">Páginas ({doc.numPages})</p>
                <button
                  onClick={resetAll}
                  className="text-xs text-foreground-subtle hover:text-error-text transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3 h-3" /> Empezar de nuevo
                </button>
              </div>
              <div className="ou-card p-4 flex-1">
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {doc.thumbnails.map((thumb, i) => {
                    const pageNo = i + 1;
                    const own = owner[pageNo];
                    return (
                      <button
                        key={pageNo}
                        onClick={() => togglePage(pageNo)}
                        className={cn(
                          "group relative rounded-lg overflow-hidden border bg-surface-strong transition-all",
                          own ? "border-transparent" : "border-border hover:border-border-strong"
                        )}
                        style={own ? { boxShadow: `0 0 0 2px ${own.color}` } : undefined}
                        title={`Página ${pageNo}`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={thumb} alt={`Página ${pageNo}`} className="w-full aspect-3/4 object-contain bg-white" />
                        {/* page number */}
                        <span className="absolute top-1.5 left-1.5 min-w-5 h-5 px-1 rounded-md bg-black/70 backdrop-blur-sm text-[11px] font-semibold text-white flex items-center justify-center">
                          {pageNo}
                        </span>
                        {/* owner chip */}
                        {own && (
                          <span
                            className="absolute top-1.5 right-1.5 w-5 h-5 rounded-md text-[11px] font-bold text-black flex items-center justify-center"
                            style={{ background: own.color }}
                          >
                            {own.idx + 1}
                          </span>
                        )}
                        {/* hover add hint */}
                        {!own && activePkg && (
                          <span className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Plus className="w-6 h-6" style={{ color: activePkg.color }} />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-foreground-faint mt-4 flex flex-wrap items-center gap-1.5">
                  Haz clic en una página para agregarla a
                  {activePkg ? (
                    <span className="inline-flex items-center gap-1.5 font-medium text-foreground-muted">
                      <span className="w-2 h-2 rounded-full" style={{ background: activePkg.color }} />
                      {activePkg.name}
                    </span>
                  ) : (
                    "un paquete"
                  )}
                  · las páginas sin paquete no se exportan.
                </p>
              </div>
            </div>

            {/* Packages panel */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <p className="ou-label">Paquetes ({packages.length})</p>
                <button
                  onClick={addPackage}
                  className="text-xs text-accent-text hover:text-foreground transition-colors flex items-center gap-1 font-medium"
                >
                  <Plus className="w-3.5 h-3.5" /> Agregar
                </button>
              </div>

              <div className="space-y-3 flex-1">
                <AnimatePresence initial={false}>
                  {packages.map((pkg) => {
                    const isActive = pkg.id === activeId;
                    return (
                      <motion.div
                        key={pkg.id}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.97 }}
                        onClick={() => setActiveId(pkg.id)}
                        className={cn(
                          "rounded-card border p-3.5 cursor-pointer transition-colors",
                          isActive
                            ? "bg-surface-hover border-border-strong"
                            : "bg-surface border-border hover:border-border-strong"
                        )}
                        style={isActive ? { boxShadow: `inset 3px 0 0 ${pkg.color}` } : undefined}
                      >
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: pkg.color }} />
                            <span className="text-sm font-semibold text-foreground truncate">{pkg.name}</span>
                            <span className="text-xs text-foreground-faint shrink-0">
                              {pkg.pages.length} pág.
                            </span>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); removePackage(pkg.id); }}
                            className="p-1 rounded-md text-foreground-faint hover:text-error-text hover:bg-error/10 transition-colors shrink-0"
                            title="Eliminar paquete"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        {/* output segmented control */}
                        <div className="grid grid-cols-3 gap-1 p-1 rounded-control bg-background-elevated border border-border">
                          {OUTPUT_OPTIONS.map((opt) => {
                            const on = pkg.output === opt.id;
                            const Icon = opt.icon;
                            return (
                              <button
                                key={opt.id}
                                onClick={(e) => { e.stopPropagation(); setOutput(pkg.id, opt.id); }}
                                className={cn(
                                  "flex flex-col items-center gap-1 py-1.5 rounded-md text-[11px] font-medium transition-colors",
                                  on ? "bg-surface-strong text-foreground" : "text-foreground-faint hover:text-foreground-muted"
                                )}
                              >
                                <Icon className="w-4 h-4" />
                                {opt.label}
                              </button>
                            );
                          })}
                        </div>

                        {pkg.pages.length > 0 && (
                          <p className="text-[11px] text-foreground-faint mt-2.5 truncate">
                            Págs: {pkg.pages.join(", ")}
                          </p>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {packages.length === 0 && (
                  <button
                    onClick={addPackage}
                    className="w-full flex flex-col items-center justify-center gap-2 py-8 rounded-card border border-dashed border-border text-foreground-subtle hover:text-foreground hover:border-border-strong transition-colors"
                  >
                    <PackageIcon className="w-6 h-6" />
                    <span className="text-sm font-medium">Crear un paquete</span>
                  </button>
                )}
              </div>

              {/* Action bar */}
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between text-xs text-foreground-subtle mb-3">
                  <span>{packages.filter((p) => p.pages.length > 0).length} paquete(s)</span>
                  <span>{assignedCount} / {doc.numPages} páginas</span>
                </div>
                <button
                  onClick={handleProcess}
                  disabled={isProcessing || assignedCount === 0}
                  className="ou-btn ou-btn-accent w-full h-11"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Procesando…
                    </>
                  ) : (
                    <>
                      <Scissors className="w-4 h-4" /> Separar PDF
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error modal */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setError(null)}
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
                <button onClick={() => setError(null)} className="ou-btn ou-btn-primary">
                  Entendido
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ResultsView({
  groups,
  sourceName,
  onBack,
  onReset,
}: {
  groups: SplitResultGroup[];
  sourceName: string;
  onBack: () => void;
  onReset: () => void;
}) {
  const [zipping, setZipping] = useState(false);
  const totalFiles = groups.reduce((n, g) => n + g.files.length, 0);

  const handleZip = async () => {
    setZipping(true);
    try {
      await downloadAllAsZip(groups, sourceName);
    } finally {
      setZipping(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex-1">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-control bg-success/10 flex items-center justify-center">
          <CheckCircle2 className="w-5 h-5 text-success-text" />
        </div>
        <div>
          <p className="font-semibold text-foreground">
            {totalFiles} archivo(s) en {groups.length} paquete(s)
          </p>
          <p className="text-sm text-foreground-subtle">Descarga cada archivo o todo en un .zip.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {groups.map((g) => (
          <div key={g.id} className="ou-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: g.color }} />
              <span className="text-sm font-semibold text-foreground">{g.name}</span>
              <span className="ou-badge ml-auto">{outputLabel(g.output)}</span>
            </div>
            <div className="space-y-1.5">
              {g.files.map((f) => (
                <div
                  key={f.name}
                  className="flex items-center gap-2.5 rounded-control bg-background-elevated border border-border px-3 py-2"
                >
                  {f.kind === "pdf" ? (
                    <FileText className="w-4 h-4 text-foreground-faint shrink-0" />
                  ) : (
                    <ImageIcon className="w-4 h-4 text-foreground-faint shrink-0" />
                  )}
                  <span className="text-xs text-foreground-muted truncate flex-1">{f.name}</span>
                  <button
                    onClick={() => saveResultFile(f)}
                    className="p-1.5 rounded-md text-foreground-faint hover:text-foreground hover:bg-surface-strong transition-colors shrink-0"
                    title="Descargar"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 mt-8">
        <button onClick={handleZip} disabled={zipping} className="ou-btn ou-btn-accent w-full sm:w-auto px-6 h-11">
          {zipping ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Comprimiendo…
            </>
          ) : (
            <>
              <Archive className="w-4 h-4" /> Descargar todo (.zip)
            </>
          )}
        </button>
        <button onClick={onBack} className="ou-btn ou-btn-secondary w-full sm:w-auto px-5 h-11">
          <ArrowLeft className="w-4 h-4" /> Editar paquetes
        </button>
        <button onClick={onReset} className="ou-btn ou-btn-ghost w-full sm:w-auto px-5 h-11">
          Nuevo PDF
        </button>
      </div>
    </motion.div>
  );
}
