"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type CropRect = { x: number; y: number; w: number; h: number };

const ASPECTS: { label: string; ratio: number | null }[] = [
  { label: "Libre", ratio: null },
  { label: "1:1", ratio: 1 },
  { label: "16:9", ratio: 16 / 9 },
  { label: "9:16", ratio: 9 / 16 },
  { label: "4:3", ratio: 4 / 3 },
  { label: "3:4", ratio: 3 / 4 },
  { label: "3:2", ratio: 3 / 2 },
  { label: "2:3", ratio: 2 / 3 },
];

/**
 * A self-contained crop dialog: it renders the flattened image and an
 * interactive crop box (drag the body to move, drag a corner to resize),
 * optionally locked to an aspect ratio. It owns its own pointer handling so it
 * never fights the annotation canvas — the parent only receives the final rect
 * in image pixels.
 */
export function CropPanel({
  src,
  imgW,
  imgH,
  onCancel,
  onApply,
}: {
  src: string;
  imgW: number;
  imgH: number;
  onCancel: () => void;
  onApply: (rect: CropRect) => void;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [display, setDisplay] = useState({ w: 0, h: 0, scale: 1 });
  const [ratio, setRatio] = useState<number | null>(null);
  // Crop rect in image pixels.
  const [rect, setRect] = useState<CropRect>({ x: 0, y: 0, w: imgW, h: imgH });
  const drag = useRef<{ mode: "move" | "nw" | "ne" | "sw" | "se"; sx: number; sy: number; start: CropRect } | null>(null);

  // Fit the image into the available box.
  useEffect(() => {
    const measure = () => {
      const el = boxRef.current;
      if (!el) return;
      const maxW = el.clientWidth;
      const maxH = Math.min(window.innerHeight * 0.6, 620);
      const scale = Math.min(maxW / imgW, maxH / imgH, 1);
      setDisplay({ w: imgW * scale, h: imgH * scale, scale });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [imgW, imgH]);

  const clampRect = useCallback(
    (r: CropRect): CropRect => {
      const w = Math.min(Math.max(r.w, 16), imgW);
      const h = Math.min(Math.max(r.h, 16), imgH);
      const x = Math.min(Math.max(r.x, 0), imgW - w);
      const y = Math.min(Math.max(r.y, 0), imgH - h);
      return { x, y, w, h };
    },
    [imgW, imgH]
  );

  const applyAspect = (rat: number | null) => {
    setRatio(rat);
    if (rat === null) return;
    // Re-fit the current rect to the ratio, centered.
    let w = rect.w;
    let h = w / rat;
    if (h > imgH) { h = imgH; w = h * rat; }
    if (w > imgW) { w = imgW; h = w / rat; }
    setRect(clampRect({ x: rect.x + (rect.w - w) / 2, y: rect.y + (rect.h - h) / 2, w, h }));
  };

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const d = drag.current;
      if (!d) return;
      const dx = (e.clientX - d.sx) / display.scale;
      const dy = (e.clientY - d.sy) / display.scale;
      if (d.mode === "move") {
        setRect(clampRect({ ...d.start, x: d.start.x + dx, y: d.start.y + dy }));
        return;
      }
      let { x, y, w, h } = d.start;
      if (d.mode === "se") { w = d.start.w + dx; h = d.start.h + dy; }
      if (d.mode === "sw") { x = d.start.x + dx; w = d.start.w - dx; h = d.start.h + dy; }
      if (d.mode === "ne") { y = d.start.y + dy; w = d.start.w + dx; h = d.start.h - dy; }
      if (d.mode === "nw") { x = d.start.x + dx; y = d.start.y + dy; w = d.start.w - dx; h = d.start.h - dy; }
      if (ratio) {
        // Lock height to width by the ratio, anchoring the moved corner.
        h = w / ratio;
        if (d.mode === "nw" || d.mode === "ne") y = d.start.y + (d.start.h - h);
      }
      if (w < 16 || h < 16) return;
      setRect(clampRect({ x, y, w, h }));
    };
    const onUp = () => (drag.current = null);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => { window.removeEventListener("pointermove", onMove); window.removeEventListener("pointerup", onUp); };
  }, [display.scale, ratio, clampRect]);

  const startDrag = (mode: "move" | "nw" | "ne" | "sw" | "se", e: React.PointerEvent) => {
    e.stopPropagation();
    drag.current = { mode, sx: e.clientX, sy: e.clientY, start: rect };
  };

  const s = display.scale;
  const handle = "absolute w-3 h-3 rounded-sm border border-accent bg-background";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" onClick={onCancel}>
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="ou-card w-full max-w-3xl p-5"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Recortar imagen</h3>
          <button onClick={onCancel} className="ou-btn ou-btn-ghost h-8 px-2"><X className="h-4 w-4" /></button>
        </div>

        <div className="mb-4 flex flex-wrap gap-1.5">
          {ASPECTS.map((a) => (
            <button key={a.label} onClick={() => applyAspect(a.ratio)} className={cn("ou-pill", ratio === a.ratio && "border-accent/60 text-foreground")}>
              {a.label}
            </button>
          ))}
        </div>

        <div ref={boxRef} className="flex items-center justify-center">
          <div className="relative select-none" style={{ width: display.w, height: display.h }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="Recorte" className="pointer-events-none absolute inset-0 h-full w-full" draggable={false} />
            <div className="pointer-events-none absolute inset-0 bg-black/50" />
            {/* Crop window */}
            <div
              className="absolute cursor-move border border-accent shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"
              style={{ left: rect.x * s, top: rect.y * s, width: rect.w * s, height: rect.h * s }}
              onPointerDown={(e) => startDrag("move", e)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" draggable={false} className="pointer-events-none absolute max-w-none" style={{ left: -rect.x * s, top: -rect.y * s, width: display.w, height: display.h }} />
              <div className={cn(handle, "-left-1.5 -top-1.5 cursor-nw-resize")} onPointerDown={(e) => startDrag("nw", e)} />
              <div className={cn(handle, "-right-1.5 -top-1.5 cursor-ne-resize")} onPointerDown={(e) => startDrag("ne", e)} />
              <div className={cn(handle, "-left-1.5 -bottom-1.5 cursor-sw-resize")} onPointerDown={(e) => startDrag("sw", e)} />
              <div className={cn(handle, "-right-1.5 -bottom-1.5 cursor-se-resize")} onPointerDown={(e) => startDrag("se", e)} />
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="font-mono text-xs text-foreground-faint">{Math.round(rect.w)} × {Math.round(rect.h)} px</span>
          <div className="flex gap-2">
            <button onClick={onCancel} className="ou-btn ou-btn-secondary">Cancelar</button>
            <button onClick={() => onApply(clampRect(rect))} className="ou-btn ou-btn-accent"><Check className="h-4 w-4" /> Aplicar recorte</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
