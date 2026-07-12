"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  type Annotation,
  type Style,
  type Tool,
  type HandleId,
  type TextAnn,
  newId,
  renderScene,
  hitTest,
  getBounds,
  getHandles,
  moveAnn,
  resizeAnn,
} from "@/lib/editor-core";

export interface PendingImage {
  src: string;
  width: number;
  height: number;
}

export interface AnnotationCanvasHandle {
  deleteSelected: () => void;
  duplicateSelected: () => void;
  clearSelection: () => void;
  bringForward: () => void;
  sendBackward: () => void;
  /** Applies style changes (color, width, font, …) to the current selection. */
  applyStyleToSelected: (patch: Partial<Style>) => void;
}

interface Props {
  background: CanvasImageSource | null;
  width: number;
  height: number;
  /** final display scale (fit × zoom) */
  scale: number;
  tool: Tool;
  style: Style;
  annotations: Annotation[];
  /**
   * A gesture finished — parent should snapshot history and update state.
   * Drag previews are painted imperatively inside the canvas, so parent state
   * only changes on commit (keeping one undo entry per gesture).
   */
  onCommit: (next: Annotation[]) => void;
  onSelectionChange?: (selected: Annotation | null) => void;
  pendingImage?: PendingImage | null;
  /** called after a pending image is placed, so parent can clear it */
  onImagePlaced?: () => void;
}

type GestureMode =
  | { kind: "none" }
  | { kind: "draw-path"; id: string }
  | { kind: "draft-shape"; id: string }
  | { kind: "draft-line"; id: string }
  | { kind: "move"; id: string; startX: number; startY: number; orig: Annotation }
  | { kind: "resize"; id: string; handle: HandleId }
  | { kind: "erase"; removed: Set<string> };

const HANDLE_PX = 9;

export const AnnotationCanvas = forwardRef<AnnotationCanvasHandle, Props>(
  function AnnotationCanvas(
    {
      background,
      width,
      height,
      scale,
      tool,
      style,
      annotations,
      onCommit,
      onSelectionChange,
      pendingImage,
      onImagePlaced,
    },
    ref
  ) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const measureRef = useRef<CanvasRenderingContext2D | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [editingText, setEditingText] = useState<TextAnn | null>(null);

    // Live refs so imperative painting never reads stale closures.
    const annsRef = useRef(annotations);
    const workingRef = useRef<Annotation | null>(null);
    const gestureRef = useRef<GestureMode>({ kind: "none" });
    const selectedRef = useRef<string | null>(null);
    const styleRef = useRef(style);
    const toolRef = useRef(tool);
    annsRef.current = annotations;
    styleRef.current = style;
    toolRef.current = tool;
    selectedRef.current = selectedId;

    // Reliably focus the text editor whenever one opens (autoFocus alone can be
    // lost when it mounts during a pointer event).
    useEffect(() => {
      if (!editingText) return;
      const ta = textareaRef.current;
      if (!ta) return;
      const id = requestAnimationFrame(() => {
        ta.focus();
        const len = ta.value.length;
        ta.setSelectionRange(len, len);
      });
      return () => cancelAnimationFrame(id);
    }, [editingText]);

    // Offscreen ctx for text measurement.
    useEffect(() => {
      const c = document.createElement("canvas");
      measureRef.current = c.getContext("2d");
    }, []);

    const currentScene = useCallback((): Annotation[] => {
      const g = gestureRef.current;
      if (g.kind === "erase") {
        return g.removed.size
          ? annsRef.current.filter((a) => !g.removed.has(a.id))
          : annsRef.current;
      }
      const w = workingRef.current;
      if (!w) return annsRef.current;
      const idx = annsRef.current.findIndex((a) => a.id === w.id);
      if (idx === -1) return [...annsRef.current, w];
      const copy = annsRef.current.slice();
      copy[idx] = w;
      return copy;
    }, []);

    const paint = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const scene = currentScene();
      renderScene(ctx, background, width, height, scene, () => paint());

      // Selection chrome for the selected annotation (constant screen size).
      const selId = selectedRef.current;
      const sel = scene.find((a) => a.id === selId);
      if (sel && !editingText) {
        ctx.save();
        const inv = 1 / scale;
        ctx.strokeStyle = "#0070f3";
        ctx.lineWidth = 1.5 * inv;
        ctx.setLineDash([5 * inv, 4 * inv]);
        const b = getBounds(sel, measureRef.current ?? undefined);
        ctx.strokeRect(b.x - 3 * inv, b.y - 3 * inv, b.w + 6 * inv, b.h + 6 * inv);
        ctx.setLineDash([]);
        const hs = HANDLE_PX * inv;
        for (const h of getHandles(sel, measureRef.current ?? undefined)) {
          ctx.fillStyle = "#ffffff";
          ctx.strokeStyle = "#0070f3";
          ctx.lineWidth = 1.5 * inv;
          ctx.beginPath();
          ctx.arc(h.x, h.y, hs / 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
        ctx.restore();
      }
    }, [background, width, height, scale, currentScene, editingText]);

    // Repaint on any relevant change.
    useEffect(() => {
      paint();
    }, [paint, annotations, selectedId, tool]);

    // Notify parent when selection changes.
    useEffect(() => {
      const sel = annotations.find((a) => a.id === selectedId) ?? null;
      onSelectionChange?.(sel);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedId, annotations]);

    // ---- imperative API --------------------------------------------------
    const commitList = (next: Annotation[]) => {
      onCommit(next);
    };

    useImperativeHandle(ref, () => ({
      deleteSelected() {
        if (!selectedRef.current) return;
        const next = annsRef.current.filter((a) => a.id !== selectedRef.current);
        setSelectedId(null);
        commitList(next);
      },
      duplicateSelected() {
        const sel = annsRef.current.find((a) => a.id === selectedRef.current);
        if (!sel) return;
        const clone = moveAnn({ ...sel, id: newId() }, 24, 24);
        commitList([...annsRef.current, clone]);
        setSelectedId(clone.id);
      },
      clearSelection() {
        setSelectedId(null);
      },
      bringForward() {
        const id = selectedRef.current;
        const list = annsRef.current;
        const i = list.findIndex((a) => a.id === id);
        if (i < 0 || i === list.length - 1) return;
        const next = list.slice();
        [next[i], next[i + 1]] = [next[i + 1], next[i]];
        commitList(next);
      },
      sendBackward() {
        const id = selectedRef.current;
        const list = annsRef.current;
        const i = list.findIndex((a) => a.id === id);
        if (i <= 0) return;
        const next = list.slice();
        [next[i], next[i - 1]] = [next[i - 1], next[i]];
        commitList(next);
      },
      applyStyleToSelected(patch: Partial<Style>) {
        const id = selectedRef.current;
        if (!id) return;
        let changed = false;
        const next = annsRef.current.map((a): Annotation => {
          if (a.id !== id) return a;
          changed = true;
          switch (a.type) {
            case "text":
              return {
                ...a,
                size: patch.fontSize ?? a.size,
                family: patch.fontFamily ?? a.family,
                color: patch.color ?? a.color,
                opacity: patch.opacity ?? a.opacity,
              };
            case "pen":
            case "highlighter":
            case "line":
            case "arrow":
              return {
                ...a,
                color: patch.color ?? a.color,
                width: patch.width ?? a.width,
                opacity: patch.opacity ?? a.opacity,
              };
            case "rect":
            case "ellipse":
              return {
                ...a,
                color: patch.color ?? a.color,
                width: patch.width ?? a.width,
                opacity: patch.opacity ?? a.opacity,
                fill: patch.fill ?? a.fill,
              };
            case "image":
              return { ...a, opacity: patch.opacity ?? a.opacity };
          }
        });
        if (changed) commitList(next);
      },
    }));

    // ---- coordinate helpers ----------------------------------------------
    const toNatural = (e: React.PointerEvent): { x: number; y: number } => {
      const canvas = canvasRef.current!;
      const rect = canvas.getBoundingClientRect();
      return {
        x: ((e.clientX - rect.left) / rect.width) * width,
        y: ((e.clientY - rect.top) / rect.height) * height,
      };
    };

    const handleHitTest = (x: number, y: number): HandleId | null => {
      const sel = annsRef.current.find((a) => a.id === selectedRef.current);
      if (!sel) return null;
      const tol = (HANDLE_PX / scale) * 1.2;
      for (const h of getHandles(sel, measureRef.current ?? undefined)) {
        if (Math.abs(x - h.x) <= tol && Math.abs(y - h.y) <= tol) return h.id;
      }
      return null;
    };

    // ---- pointer lifecycle ------------------------------------------------
    const onPointerDown = (e: React.PointerEvent) => {
      // Finish any open text edit before starting a new interaction.
      if (editingText) {
        commitEditingText(textareaRef.current?.value ?? editingText.text);
        return;
      }
      const { x, y } = toNatural(e);
      const t = toolRef.current;
      const s = styleRef.current;

      // Click-to-place tools (text, image) must NOT capture the pointer — the
      // capture can steal focus from the text editor that's about to open, and
      // setPointerCapture can also throw for stale pointer ids.
      const isPlacement = t === "text" || (t === "image" && !!pendingImage);
      if (!isPlacement) {
        try {
          (e.target as HTMLElement).setPointerCapture(e.pointerId);
        } catch {
          /* ignore unsupported/stale pointer ids */
        }
      }

      // Placing a pending image.
      if (t === "image" && pendingImage) {
        const maxW = width * 0.5;
        const ratio = pendingImage.height / pendingImage.width;
        const w = Math.min(pendingImage.width, maxW);
        const h = w * ratio;
        const ann: Annotation = {
          id: newId(),
          type: "image",
          x: x - w / 2,
          y: y - h / 2,
          w,
          h,
          src: pendingImage.src,
          opacity: s.opacity,
        };
        commitList([...annsRef.current, ann]);
        setSelectedId(ann.id);
        onImagePlaced?.();
        return;
      }

      if (t === "text") {
        const ann: TextAnn = {
          id: newId(),
          type: "text",
          x,
          y,
          text: "",
          size: s.fontSize,
          family: s.fontFamily,
          color: s.color,
          opacity: s.opacity,
        };
        workingRef.current = ann;
        setSelectedId(ann.id);
        setEditingText(ann);
        return;
      }

      if (t === "select" || t === "eraser") {
        // Resize handle first.
        const handle = handleHitTest(x, y);
        if (handle && t === "select") {
          gestureRef.current = { kind: "resize", id: selectedRef.current!, handle };
          workingRef.current = annsRef.current.find((a) => a.id === selectedRef.current) ?? null;
          return;
        }
        const hitId = hitTest(annsRef.current, x, y, measureRef.current!);
        if (t === "eraser") {
          // Begin a continuous erase: anything the pointer passes over while
          // the button is held gets removed, committed as one undo step.
          const removed = new Set<string>();
          if (hitId) removed.add(hitId);
          gestureRef.current = { kind: "erase", removed };
          paint();
          return;
        }
        if (hitId) {
          setSelectedId(hitId);
          const orig = annsRef.current.find((a) => a.id === hitId)!;
          gestureRef.current = { kind: "move", id: hitId, startX: x, startY: y, orig };
          workingRef.current = orig;
        } else {
          setSelectedId(null);
        }
        return;
      }

      // Drawing tools.
      if (t === "pen" || t === "highlighter") {
        const ann: Annotation = {
          id: newId(),
          type: t,
          color: s.color,
          width: t === "highlighter" ? Math.max(s.width * 3, 14) : s.width,
          opacity: t === "highlighter" ? 0.4 : s.opacity,
          points: [x, y],
        };
        workingRef.current = ann;
        gestureRef.current = { kind: "draw-path", id: ann.id };
        paint();
        return;
      }
      if (t === "line" || t === "arrow") {
        const ann: Annotation = {
          id: newId(),
          type: t,
          color: s.color,
          width: s.width,
          opacity: s.opacity,
          x1: x,
          y1: y,
          x2: x,
          y2: y,
        };
        workingRef.current = ann;
        gestureRef.current = { kind: "draft-line", id: ann.id };
        return;
      }
      if (t === "rect" || t === "ellipse") {
        const ann: Annotation = {
          id: newId(),
          type: t,
          color: s.color,
          width: s.width,
          opacity: s.opacity,
          fill: s.fill,
          x,
          y,
          w: 0,
          h: 0,
        };
        workingRef.current = ann;
        gestureRef.current = { kind: "draft-shape", id: ann.id };
        return;
      }
    };

    const onPointerMove = (e: React.PointerEvent) => {
      const g = gestureRef.current;
      if (g.kind === "none") return;
      const { x, y } = toNatural(e);

      if (g.kind === "erase") {
        // Hit-test against what's still visible so we can peel through stacks.
        const remaining = annsRef.current.filter((a) => !g.removed.has(a.id));
        const id = hitTest(remaining, x, y, measureRef.current!, 8);
        if (id) {
          g.removed.add(id);
          paint();
        }
        return;
      }

      const w = workingRef.current;
      if (!w) return;

      if (g.kind === "draw-path" && (w.type === "pen" || w.type === "highlighter")) {
        w.points.push(x, y);
      } else if (g.kind === "draft-line" && (w.type === "line" || w.type === "arrow")) {
        w.x2 = x;
        w.y2 = y;
        // Shift constrains to horizontal/vertical.
        if (e.shiftKey) {
          if (Math.abs(x - w.x1) > Math.abs(y - w.y1)) w.y2 = w.y1;
          else w.x2 = w.x1;
        }
      } else if (g.kind === "draft-shape" && (w.type === "rect" || w.type === "ellipse")) {
        w.w = x - w.x;
        w.h = y - w.y;
        if (e.shiftKey) {
          const side = Math.max(Math.abs(w.w), Math.abs(w.h));
          w.w = Math.sign(w.w || 1) * side;
          w.h = Math.sign(w.h || 1) * side;
        }
      } else if (g.kind === "move") {
        workingRef.current = moveAnn(g.orig, x - g.startX, y - g.startY);
      } else if (g.kind === "resize") {
        const base = annsRef.current.find((a) => a.id === g.id);
        if (base) workingRef.current = resizeAnn(base, g.handle, x, y);
      }
      paint();
    };

    const finishGesture = () => {
      const g = gestureRef.current;
      gestureRef.current = { kind: "none" };

      if (g.kind === "erase") {
        if (g.removed.size) {
          commitList(annsRef.current.filter((a) => !g.removed.has(a.id)));
        } else {
          paint();
        }
        return;
      }

      const w = workingRef.current;
      workingRef.current = null;
      if (g.kind === "none" || !w) {
        paint();
        return;
      }

      // Discard degenerate drafts.
      if (g.kind === "draw-path" && (w.type === "pen" || w.type === "highlighter") && w.points.length < 4) {
        paint();
        return;
      }
      if (g.kind === "draft-line" && (w.type === "line" || w.type === "arrow")) {
        if (Math.hypot(w.x2 - w.x1, w.y2 - w.y1) < 3) {
          paint();
          return;
        }
      }
      if (g.kind === "draft-shape" && (w.type === "rect" || w.type === "ellipse")) {
        if (Math.abs(w.w) < 3 && Math.abs(w.h) < 3) {
          paint();
          return;
        }
      }

      const idx = annsRef.current.findIndex((a) => a.id === w.id);
      const next = idx === -1 ? [...annsRef.current, w] : annsRef.current.map((a) => (a.id === w.id ? w : a));
      commitList(next);
    };

    const onPointerUp = (e: React.PointerEvent) => {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      finishGesture();
    };

    // Double-click a text annotation (select tool) to edit it.
    const onDoubleClick = (e: React.PointerEvent) => {
      const { x, y } = toNatural(e as unknown as React.PointerEvent);
      const id = hitTest(annsRef.current, x, y, measureRef.current!);
      const ann = annsRef.current.find((a) => a.id === id);
      if (ann && ann.type === "text") {
        setSelectedId(ann.id);
        workingRef.current = { ...ann };
        setEditingText({ ...ann });
      }
    };

    // ---- text editing overlay --------------------------------------------
    const commitEditingText = (value: string) => {
      const t = editingText;
      setEditingText(null);
      if (!t) return;
      workingRef.current = null;
      const trimmed = value.replace(/\s+$/g, "");
      if (!trimmed) {
        // Remove empty text.
        setSelectedId(null);
        commitList(annsRef.current.filter((a) => a.id !== t.id));
        return;
      }
      const updated: TextAnn = { ...t, text: value };
      const idx = annsRef.current.findIndex((a) => a.id === t.id);
      const next =
        idx === -1
          ? [...annsRef.current, updated]
          : annsRef.current.map((a) => (a.id === t.id ? updated : a));
      commitList(next);
    };

    // A cursor that visually mirrors the active tool: a colored dot the size of
    // the brush for pen/highlighter, an eraser glyph for erasing, etc.
    const cursorFor = (): string => {
      switch (tool) {
        case "select":
          return "default";
        case "text":
          return "text";
        case "pen":
        case "highlighter": {
          const eff = tool === "highlighter" ? Math.max(style.width * 3, 14) : style.width;
          const d = Math.min(Math.max(eff * scale, 8), 40);
          const size = Math.ceil(d + 6);
          const c = size / 2;
          const r = d / 2;
          const op = tool === "highlighter" ? 0.5 : 0.9;
          const svg =
            `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 ${size} ${size}'>` +
            `<circle cx='${c}' cy='${c}' r='${(r + 0.75).toFixed(2)}' fill='none' stroke='black' stroke-opacity='0.4' stroke-width='1.5'/>` +
            `<circle cx='${c}' cy='${c}' r='${r.toFixed(2)}' fill='${style.color}' fill-opacity='${op}' stroke='white' stroke-width='1.5'/>` +
            `</svg>`;
          return `url("data:image/svg+xml,${encodeURIComponent(svg)}") ${c} ${c}, crosshair`;
        }
        case "eraser": {
          const svg =
            `<svg xmlns='http://www.w3.org/2000/svg' width='26' height='24' viewBox='0 0 26 24'>` +
            `<rect x='2.5' y='7' width='20' height='10' rx='2.5' fill='#ffe3e8' stroke='#2b2b2b' stroke-width='1.4'/>` +
            `<rect x='2.5' y='7' width='7.5' height='10' rx='2.5' fill='#ff7a95' stroke='#2b2b2b' stroke-width='1.4'/>` +
            `<line x1='10' y1='7' x2='10' y2='17' stroke='#2b2b2b' stroke-width='1'/>` +
            `</svg>`;
          return `url("data:image/svg+xml,${encodeURIComponent(svg)}") 3 12, auto`;
        }
        default:
          // line, arrow, rect, ellipse, image
          return "crosshair";
      }
    };

    return (
      <div
        className="relative shadow-lg"
        style={{ width: width * scale, height: height * scale }}
      >
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onDoubleClick={(e) => onDoubleClick(e as unknown as React.PointerEvent)}
          style={{
            width: width * scale,
            height: height * scale,
            touchAction: "none",
            cursor: cursorFor(),
            display: "block",
          }}
        />
        {editingText && (
          <textarea
            ref={textareaRef}
            defaultValue={editingText.text}
            onBlur={(e) => commitEditingText(e.target.value)}
            onPointerDown={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === "Escape") {
                (e.target as HTMLTextAreaElement).blur();
              }
            }}
            spellCheck={false}
            className="absolute z-10 resize-none overflow-hidden rounded-sm px-0.5"
            style={{
              left: editingText.x * scale,
              top: editingText.y * scale,
              minWidth: 40,
              minHeight: editingText.size * scale * 1.25,
              color: editingText.color,
              fontSize: editingText.size * scale,
              lineHeight: 1.25,
              fontFamily: editingText.family,
              caretColor: editingText.color,
              backgroundColor: "rgba(0, 112, 243, 0.10)",
              outline: "2px solid var(--accent)",
              whiteSpace: "pre",
            }}
          />
        )}
      </div>
    );
  }
);
