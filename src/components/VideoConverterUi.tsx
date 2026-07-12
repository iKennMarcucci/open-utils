"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  RefreshCw, UploadCloud, Video as VideoIcon, Image as ImageIcon,
  Download, X, AlertCircle, Play, Pause, CheckCircle2,
  Feather, Gauge, Sparkles, ChevronRight, Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { convertMedia, VideoConversionMode, QualityPreset } from "@/lib/video-converter";

// ─── Quality Modal ────────────────────────────────────────────────────────────

interface QualityOption {
  id: QualityPreset;
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  tag?: string;
  tagColor?: string;
  accent: string;
  description: string;
  stats: { weight: number; quality: number; speed: number };
}

const QUALITY_OPTIONS: QualityOption[] = [
  {
    id: "light",
    icon: <Feather className="w-5 h-5" />,
    label: "Liviano",
    sublabel: "Prioriza el peso del archivo",
    accent: "from-sky-500/20 to-sky-600/5 border-sky-500/30",
    description: "Ideal para compartir rápidamente. Menor resolución y FPS para obtener el archivo más pequeño posible.",
    stats: { weight: 1, quality: 2, speed: 5 },
  },
  {
    id: "normal",
    icon: <Gauge className="w-5 h-5" />,
    label: "Normal",
    sublabel: "Equilibrio entre calidad y peso",
    tag: "Recomendado",
    tagColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    accent: "from-emerald-500/20 to-emerald-600/5 border-emerald-500/40",
    description: "La opción perfecta para la mayoría de casos. Buena calidad visual con un tamaño de archivo razonable.",
    stats: { weight: 3, quality: 4, speed: 4 },
  },
  {
    id: "high",
    icon: <Sparkles className="w-5 h-5" />,
    label: "Alta Calidad",
    sublabel: "Prioriza la fidelidad visual",
    tag: "Pesado · Lento",
    tagColor: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    accent: "from-violet-500/20 to-violet-600/5 border-violet-500/30",
    description: "Máxima fidelidad visual. Resolución y FPS completos. El archivo será significativamente más grande.",
    stats: { weight: 5, quality: 5, speed: 2 },
  },
];

function StatBar({ value, max = 5, color }: { value: number; max?: number; color: string }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: i * 0.04, duration: 0.2 }}
          className={cn(
            "h-1 flex-1 rounded-full origin-left",
            i < value ? color : "bg-surface-strong"
          )}
        />
      ))}
    </div>
  );
}

interface QualityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (quality: QualityPreset) => void;
  mode: VideoConversionMode;
}

function QualityModal({ isOpen, onClose, onSelect, mode }: QualityModalProps) {
  const [selected, setSelected] = useState<QualityPreset>("normal");
  const [hovered, setHovered] = useState<QualityPreset | null>(null);

  const active = QUALITY_OPTIONS.find(o => o.id === (hovered ?? selected))!;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            onClick={e => e.stopPropagation()}
            className="relative w-full max-w-lg bg-[#0f0f0f] border border-white/8 rounded-panel overflow-hidden shadow-2xl"
          >
            {/* Top gradient accent */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            {/* Header */}
            <div className="px-6 pt-6 pb-4 flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold text-foreground-faint uppercase tracking-[0.15em] mb-1.5">
                  Configuración de conversión
                </p>
                <h2 className="text-xl font-bold text-foreground">
                  ¿Qué calidad necesitas?
                </h2>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors mt-0.5"
              >
                <X className="w-4 h-4 text-foreground-muted" />
              </button>
            </div>

            {/* Options */}
            <div className="px-4 pb-2 space-y-2">
              {QUALITY_OPTIONS.map((opt) => {
                const isSelected = selected === opt.id;
                return (
                  <motion.button
                    key={opt.id}
                    onClick={() => setSelected(opt.id)}
                    onHoverStart={() => setHovered(opt.id)}
                    onHoverEnd={() => setHovered(null)}
                    whileTap={{ scale: 0.985 }}
                    className={cn(
                      "w-full text-left px-4 py-3.5 rounded-panel border transition-all duration-200 relative overflow-hidden",
                      isSelected
                        ? `bg-gradient-to-br ${opt.accent}`
                        : "bg-white/[0.03] border-white/6 hover:bg-white/[0.06] hover:border-white/10"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {/* Icon */}
                      <div className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors",
                        isSelected ? "bg-white/10 text-foreground" : "bg-white/5 text-foreground-subtle"
                      )}>
                        {opt.icon}
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={cn(
                            "font-bold text-sm transition-colors",
                            isSelected ? "text-foreground" : "text-foreground-muted"
                          )}>
                            {opt.label}
                          </span>
                          {opt.tag && (
                            <span className={cn(
                              "text-[10px] font-semibold px-2 py-0.5 rounded-full border",
                              opt.tagColor
                            )}>
                              {opt.tag}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-foreground-subtle mt-0.5">{opt.sublabel}</p>
                      </div>

                      {/* Selector */}
                      <div className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all",
                        isSelected
                          ? "border-white bg-white"
                          : "border-border-strong bg-transparent"
                      )}>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-2 h-2 rounded-full bg-black"
                          />
                        )}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Description + Stats panel */}
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="mx-4 mt-2 mb-4 bg-white/[0.03] rounded-panel border border-white/6 px-4 py-3.5"
              >
                <p className="text-xs text-foreground-muted leading-relaxed mb-3">
                  {active.description}
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Peso", value: active.stats.weight, color: "bg-sky-500" },
                    { label: "Calidad", value: active.stats.quality, color: "bg-violet-500" },
                    { label: "Velocidad", value: active.stats.speed, color: "bg-emerald-500" },
                  ].map(s => (
                    <div key={s.label}>
                      <p className="text-[10px] text-foreground-faint uppercase tracking-wider mb-1.5">{s.label}</p>
                      <StatBar value={s.value} color={s.color} />
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Footer warning for high quality */}
            <AnimatePresence>
              {selected === "high" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-4 overflow-hidden"
                >
                  <div className="flex items-center gap-2 bg-amber-500/8 border border-amber-500/20 rounded-xl px-3 py-2 mb-4">
                    <Clock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    <p className="text-xs text-amber-400/80">
                      El procesamiento puede tardar varios minutos en el navegador.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* CTA */}
            <div className="px-4 pb-5">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onSelect(selected)}
                className="w-full h-13 bg-white hover:bg-neutral-100 text-black font-bold rounded-panel flex items-center justify-center gap-2 transition-colors shadow-xl"
              >
                Convertir ahora
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function VideoConverterUi() {
  const searchParams = useSearchParams();
  const initialModeParam = searchParams?.get("mode") as VideoConversionMode | null;
  const initialMode = initialModeParam === "gif-to-video" ? "gif-to-video" : "video-to-gif";

  const [mode, setMode] = useState<VideoConversionMode>(initialMode);
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<{ title: string; message: string; suggestion: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showQualityModal, setShowQualityModal] = useState(false);

  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!searchParams) return;
    const urlMode = searchParams.get("mode") as VideoConversionMode | null;
    if (urlMode === "video-to-gif" || urlMode === "gif-to-video") {
      if (mode !== urlMode) { setMode(urlMode); resetState(); }
    }
  }, [searchParams]);

  const resetState = () => {
    setFile(null);
    if (fileUrl) URL.revokeObjectURL(fileUrl);
    setFileUrl(null);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultUrl(null);
    setDuration(0); setStartTime(0); setEndTime(0);
    setCurrentTime(0); setProgress(0); setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFile = (selectedFile: File) => {
    const isVideo = selectedFile.type.startsWith("video/");
    const isGif = selectedFile.type === "image/gif";
    if (mode === "video-to-gif" && !isVideo) {
      setError({ title: "Archivo inválido", message: "Por favor selecciona un archivo de video para convertir a GIF.", suggestion: "Formatos comunes: MP4, WebM, MOV." });
      return;
    }
    if (mode === "gif-to-video" && !isGif) {
      setError({ title: "Archivo inválido", message: "Por favor selecciona un archivo GIF para convertir a video.", suggestion: "Asegúrate de que la extensión sea .gif" });
      return;
    }
    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setFileUrl(url);
    setResultUrl(null);
  };

  // Called when user picks a quality from the modal
  const handleQualitySelect = async (quality: QualityPreset) => {
    setShowQualityModal(false);
    if (!file) return;
    setIsConverting(true);
    setProgress(0);
    try {
      const url = await convertMedia({ file, startTime, endTime, mode, quality, onProgress: setProgress });
      setResultUrl(url);
    } catch (err: any) {
      setError({
        title: "Error de conversión",
        message: err.message || "Ocurrió un error inesperado al procesar el archivo.",
        suggestion: "Intenta con un archivo más corto o de menor resolución."
      });
    } finally {
      setIsConverting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
  };

  const onMetadataLoaded = () => {
    if (videoRef.current) { const d = videoRef.current.duration; setDuration(d); setEndTime(d); }
  };

  const onTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (videoRef.current.currentTime >= endTime) {
        videoRef.current.currentTime = startTime;
        if (!isPlaying) videoRef.current.pause();
      }
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause(); else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    if (currentTime < startTime) { setCurrentTime(startTime); if (videoRef.current) videoRef.current.currentTime = startTime; }
    else if (currentTime > endTime) { setCurrentTime(startTime); if (videoRef.current) videoRef.current.currentTime = startTime; }
  }, [startTime, endTime]);

  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    const newStart = Math.min(val, endTime - 0.1);
    setStartTime(newStart);
    if (videoRef.current) videoRef.current.currentTime = newStart;
  };

  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    const newEnd = Math.max(val, startTime + 0.1);
    setEndTime(newEnd);
    if (videoRef.current) videoRef.current.currentTime = newEnd;
  };

  return (
    <div className="max-w-5xl mx-auto p-6 lg:p-12 pb-32">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-4xl font-semibold text-foreground mb-2 tracking-tight">
            {mode === "video-to-gif" ? "Video ⇄ GIF" : "GIF ⇄ Video"}
          </h1>
          <p className="text-foreground-subtle font-medium">Procesa tus videos localmente con privacidad total.</p>
        </motion.div>
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => { setMode(prev => prev === "video-to-gif" ? "gif-to-video" : "video-to-gif"); resetState(); }}
          className="p-2 rounded-full hover:bg-surface-strong/80 transition-colors text-foreground-muted hover:text-foreground"
        >
          <RefreshCw className={cn("w-6 h-6 transition-transform duration-500", mode === "video-to-gif" && "rotate-180")} />
        </motion.button>
      </div>

      <div className="grid grid-cols-1 gap-12">
        {/* Input Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
              {mode === "video-to-gif" ? <VideoIcon className="w-5 h-5 text-foreground" /> : <ImageIcon className="w-5 h-5 text-foreground" />}
            </div>
            <h2 className="text-xl font-bold text-foreground">Entrada</h2>
          </div>

          <AnimatePresence mode="wait">
            {!file ? (
              <motion.div
                key="dropzone"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "relative aspect-video rounded-hero border-2 border-dashed flex flex-col items-center justify-center gap-6 cursor-pointer transition-all duration-300 overflow-hidden group",
                  isDragging ? "border-white bg-white/10" : "border-border bg-surface/50 hover:bg-surface hover:border-border-strong"
                )}
              >
                <div className="w-20 h-20 rounded-hero bg-surface-strong flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <UploadCloud className="w-10 h-10 text-foreground-muted group-hover:text-foreground transition-colors" />
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-foreground mb-2">{mode === "video-to-gif" ? "Importa tu Video" : "Importa tu GIF"}</p>
                  <p className="text-foreground-subtle font-medium">Arrastra el archivo o haz clic para explorar</p>
                </div>
                <input type="file" ref={fileInputRef} onChange={(e) => { const s = e.target.files?.[0]; if (s) handleFile(s); }} accept={mode === "video-to-gif" ? "video/*" : "image/gif"} className="hidden" />
              </motion.div>
            ) : (
              <motion.div key="preview" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-surface border border-border rounded-hero overflow-hidden p-6">
                {mode === "video-to-gif" ? (
                  <div className="relative aspect-video bg-black rounded-panel overflow-hidden mb-6 group">
                    <video ref={videoRef} src={fileUrl!} className="w-full h-full object-contain" onLoadedMetadata={onMetadataLoaded} onTimeUpdate={onTimeUpdate} onEnded={() => setIsPlaying(false)} />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                      <button onClick={togglePlay} className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform">
                        {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                      </button>
                    </div>
                    <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-black/60 backdrop-blur-md border border-white/10 rounded-lg text-xs font-mono text-foreground">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </div>
                  </div>
                ) : (
                  <div className="relative aspect-video bg-black rounded-panel overflow-hidden mb-6 flex items-center justify-center">
                    {/* A GIF renders as an image, not a <video> element. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={fileUrl!} alt="GIF a convertir" className="w-full h-full object-contain" />
                    <div className="absolute top-4 left-4 px-2.5 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-lg text-[11px] font-semibold uppercase tracking-wider text-foreground">
                      GIF
                    </div>
                  </div>
                )}

                {/* Trimmer (only for video → GIF; a GIF is converted whole) */}
                <div className="space-y-8">
                  {mode === "video-to-gif" && (
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between text-xs font-mono text-foreground-subtle uppercase tracking-wider mb-2">
                        <span>Inicio: {formatTime(startTime)}</span>
                        <span>Fin: {formatTime(endTime)}</span>
                      </div>
                      <div ref={timelineRef} className="relative h-12 flex items-center group/range">
                        <div className="absolute h-1.5 w-full bg-surface-strong rounded-full" />
                        <div className="absolute h-1.5 bg-white/20 rounded-full" style={{ left: `${(startTime / duration) * 100}%`, right: `${100 - (endTime / duration) * 100}%` }} />
                        <div
                          onPointerDown={(e) => { e.stopPropagation(); e.currentTarget.setPointerCapture(e.pointerId); }}
                          onPointerMove={(e) => {
                            if (e.buttons !== 1 || !timelineRef.current || !duration) return;
                            const rect = timelineRef.current.getBoundingClientRect();
                            const pct = (e.clientX - rect.left) / rect.width;
                            const t = Math.max(startTime, Math.min(pct * duration, endTime));
                            setCurrentTime(t);
                            if (videoRef.current) videoRef.current.currentTime = t;
                          }}
                          className="absolute h-8 w-3 -ml-1.5 z-50 cursor-grab active:cursor-grabbing flex items-center justify-center group/playhead"
                          style={{ left: `${(currentTime / duration) * 100}%` }}
                        >
                          <div className="w-1 h-full bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)] group-hover/playhead:scale-x-150 transition-transform" />
                          <div className="absolute -top-1 w-3 h-3 bg-red-500 rounded-full shadow-[0_0_12px_rgba(239,68,68,0.8)]" />
                        </div>
                        <div className="absolute inset-0 z-30 cursor-pointer" onPointerDown={(e) => {
                          if (!timelineRef.current || !duration) return;
                          const rect = timelineRef.current.getBoundingClientRect();
                          const t = Math.max(startTime, Math.min(((e.clientX - rect.left) / rect.width) * duration, endTime));
                          setCurrentTime(t);
                          if (videoRef.current) videoRef.current.currentTime = t;
                        }} />
                        <div className="absolute h-8 w-1.5 bg-white z-50 pointer-events-none rounded-full shadow-[0_0_15px_rgba(255,255,255,0.4)]" style={{ left: `${(startTime / duration) * 100}%`, transform: 'translateX(-50%)' }} />
                        <div className="absolute h-8 w-1.5 bg-white z-50 pointer-events-none rounded-full shadow-[0_0_15px_rgba(255,255,255,0.4)]" style={{ left: `${(endTime / duration) * 100}%`, transform: 'translateX(-50%)' }} />
                        <input type="range" min="0" max={duration} step="0.01" value={startTime} onChange={handleStartTimeChange} className="absolute w-full appearance-none bg-transparent pointer-events-none z-60 cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-8 [&::-webkit-slider-thumb]:h-10 [&::-webkit-slider-thumb]:bg-transparent [&::-webkit-slider-thumb]:appearance-none" />
                        <input type="range" min="0" max={duration} step="0.01" value={endTime} onChange={handleEndTimeChange} className="absolute w-full appearance-none bg-transparent pointer-events-none z-60 cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-8 [&::-webkit-slider-thumb]:h-10 [&::-webkit-slider-thumb]:bg-transparent [&::-webkit-slider-thumb]:appearance-none" />
                      </div>
                    </div>
                  </div>
                  )}

                  {/* Footer row */}
                  <div className="flex items-center justify-between gap-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-surface-strong overflow-hidden flex items-center justify-center">
                        {file?.type.includes("video") ? <VideoIcon className="w-5 h-5 text-foreground-muted" /> : <ImageIcon className="w-5 h-5 text-foreground-muted" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground truncate max-w-[200px]">{file.name}</p>
                        <p className="text-xs text-foreground-subtle">{(file.size / (1024 * 1024)).toFixed(2)} MB{mode === "video-to-gif" ? ` • Recortando ${formatTime(endTime - startTime)}` : " • GIF completo"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button onClick={resetState} className="p-3 text-foreground-muted hover:text-foreground transition-colors" title="Eliminar archivo">
                        <X className="w-5 h-5" />
                      </button>

                      {/* ── Command-style Convert Button ── */}
                      <motion.button
                        whileHover={{ scale: isConverting ? 1 : 1.03 }}
                        whileTap={{ scale: isConverting ? 1 : 0.96 }}
                        onClick={() => !isConverting && setShowQualityModal(true)}
                        disabled={isConverting}
                        className={cn(
                          "relative px-6 h-12 rounded-panel font-bold transition-all shadow-xl flex items-center gap-2.5 overflow-hidden",
                          isConverting
                            ? "bg-surface-strong text-foreground-subtle cursor-not-allowed"
                            : "bg-white text-black hover:shadow-white/20"
                        )}
                      >
                        {isConverting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-border-strong border-t-white rounded-full animate-spin" />
                            <span>Procesando {Math.round(progress)}%</span>
                          </>
                        ) : (
                          <>
                            <span>Convertir</span>
                            {/* Keyboard shortcut badge */}
                            <span className="flex items-center gap-0.5 bg-black/10 rounded-lg px-1.5 py-0.5 text-[11px] font-semibold text-black/50">
                              <ChevronRight className="w-3 h-3" />
                            </span>
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Output Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-foreground" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Resultado</h2>
          </div>
          <AnimatePresence mode="wait">
            {resultUrl ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-surface border border-border rounded-hero overflow-hidden p-6">
                <div className="relative aspect-video bg-black rounded-panel overflow-hidden mb-6">
                  {mode === "video-to-gif"
                    ? <img src={resultUrl} className="w-full h-full object-contain" alt="Resultado" />
                    : <video src={resultUrl} controls className="w-full h-full object-contain" />}
                </div>
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-panel bg-emerald-500/10 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground">¡Conversión lista!</p>
                      <p className="text-sm text-foreground-subtle">Haz clic en descargar para guardar el archivo.</p>
                    </div>
                  </div>
                  <a href={resultUrl} download={mode === "video-to-gif" ? "result.gif" : "result.mp4"} className="w-full md:w-auto px-10 h-14 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-panel transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3">
                    <Download className="w-5 h-5" />
                    Descargar Resultado
                  </a>
                </div>
              </motion.div>
            ) : isConverting ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="aspect-video rounded-hero bg-surface/50 border border-border border-dashed flex flex-col items-center justify-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full border-4 border-border border-t-white animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-foreground">{Math.round(progress)}%</div>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-foreground mb-2 tracking-tight">Procesando Video</p>
                  <p className="text-foreground-subtle font-medium">Usando FFmpeg.wasm localmente...</p>
                </div>
              </motion.div>
            ) : (
              <div className="aspect-video rounded-hero bg-surface/30 border border-border border-dashed flex flex-col items-center justify-center opacity-30">
                <Download className="w-12 h-12 text-foreground-faint mb-4" />
                <p className="text-foreground-faint font-bold">Sin resultados todavía</p>
              </div>
            )}
          </AnimatePresence>
        </section>
      </div>

      {/* Quality Modal */}
      <QualityModal
        isOpen={showQualityModal}
        onClose={() => setShowQualityModal(false)}
        onSelect={handleQualitySelect}
        mode={mode}
      />

      {/* Error Modal */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-surface border border-border w-full max-w-md rounded-hero p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-red-500 to-orange-500" />
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-panel bg-red-500/10 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-6 h-6 text-red-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-foreground mb-2">{error.title}</h3>
                  <p className="text-foreground-muted mb-6 leading-relaxed">{error.message}</p>
                  <div className="bg-black/40 rounded-panel p-5 border border-white/5">
                    <p className="text-xs text-foreground-subtle font-bold mb-2 uppercase tracking-widest">Sugerencia</p>
                    <p className="text-sm text-foreground-muted">{error.suggestion}</p>
                  </div>
                </div>
              </div>
              <button onClick={() => setError(null)} className="mt-8 w-full bg-white hover:bg-neutral-200 text-black h-14 rounded-panel font-bold transition-all shadow-xl">
                Entendido
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}