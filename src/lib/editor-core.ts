/**
 * editor-core — a small, framework-free vector-annotation engine shared by the
 * PDF editor and the Image editor.
 *
 * Annotations are stored as vector objects in the *natural pixel space* of the
 * background (the raster image, or a PDF page rendered at a chosen resolution).
 * That keeps them crisp at any zoom and lets us re-render at export resolution.
 */

export type Tool =
  | "select"
  | "pen"
  | "highlighter"
  | "line"
  | "arrow"
  | "rect"
  | "ellipse"
  | "text"
  | "image"
  | "eraser";

export interface Style {
  color: string;
  /** stroke width in natural px */
  width: number;
  /** 0..1 */
  opacity: number;
  /** fill color for shapes, or "none" */
  fill: string;
  /** font size in natural px for text */
  fontSize: number;
  fontFamily: string;
}

export interface PathAnn {
  id: string;
  type: "pen" | "highlighter";
  color: string;
  width: number;
  opacity: number;
  /** flat [x0,y0,x1,y1,...] in natural px */
  points: number[];
}

export interface ShapeAnn {
  id: string;
  type: "rect" | "ellipse";
  color: string;
  width: number;
  opacity: number;
  fill: string; // "none" or css color
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface LineAnn {
  id: string;
  type: "line" | "arrow";
  color: string;
  width: number;
  opacity: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface TextAnn {
  id: string;
  type: "text";
  color: string;
  x: number;
  y: number;
  text: string;
  size: number;
  family: string;
  opacity: number;
}

export interface ImageAnn {
  id: string;
  type: "image";
  x: number;
  y: number;
  w: number;
  h: number;
  src: string; // data URL
  opacity: number;
}

export type Annotation = PathAnn | ShapeAnn | LineAnn | TextAnn | ImageAnn;

export interface Bounds {
  x: number;
  y: number;
  w: number;
  h: number;
}

let idCounter = 0;
export function newId(): string {
  idCounter += 1;
  return `a${idCounter}_${Math.round(Math.random() * 1e6).toString(36)}`;
}

/** Shared cache so repeated renders don't reload the same image data URL. */
const imageCache = new Map<string, HTMLImageElement>();

export function getCachedImage(
  src: string,
  onLoad?: () => void
): HTMLImageElement | null {
  const existing = imageCache.get(src);
  if (existing) return existing.complete ? existing : null;
  const img = new Image();
  img.onload = () => onLoad?.();
  img.src = src;
  imageCache.set(src, img);
  return img.complete ? img : null;
}

/** Preload every image annotation; resolves once all are decoded. */
export async function preloadImages(annotations: Annotation[]): Promise<void> {
  const srcs = annotations
    .filter((a): a is ImageAnn => a.type === "image")
    .map((a) => a.src);
  await Promise.all(
    srcs.map(
      (src) =>
        new Promise<void>((resolve) => {
          const cached = imageCache.get(src);
          if (cached?.complete) return resolve();
          const img = cached ?? new Image();
          if (!cached) imageCache.set(src, img);
          img.onload = () => resolve();
          img.onerror = () => resolve();
          if (!img.src) img.src = src;
          if (img.complete) resolve();
        })
    )
  );
}

// ---------------------------------------------------------------------------
// Drawing
// ---------------------------------------------------------------------------

function withAlpha(ctx: CanvasRenderingContext2D, opacity: number, draw: () => void) {
  const prev = ctx.globalAlpha;
  ctx.globalAlpha = Math.max(0, Math.min(1, opacity));
  draw();
  ctx.globalAlpha = prev;
}

export function drawAnnotation(
  ctx: CanvasRenderingContext2D,
  ann: Annotation,
  onImageLoad?: () => void
) {
  ctx.save();
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  switch (ann.type) {
    case "pen":
    case "highlighter": {
      if (ann.points.length < 2) break;
      const isHi = ann.type === "highlighter";
      withAlpha(ctx, isHi ? ann.opacity : ann.opacity, () => {
        if (isHi) ctx.globalCompositeOperation = "multiply";
        ctx.strokeStyle = ann.color;
        ctx.lineWidth = ann.width;
        ctx.beginPath();
        ctx.moveTo(ann.points[0], ann.points[1]);
        for (let i = 2; i < ann.points.length; i += 2) {
          ctx.lineTo(ann.points[i], ann.points[i + 1]);
        }
        ctx.stroke();
      });
      break;
    }
    case "rect": {
      withAlpha(ctx, ann.opacity, () => {
        const { x, y, w, h } = normRect(ann);
        if (ann.fill && ann.fill !== "none") {
          ctx.fillStyle = ann.fill;
          ctx.fillRect(x, y, w, h);
        }
        if (ann.width > 0) {
          ctx.strokeStyle = ann.color;
          ctx.lineWidth = ann.width;
          ctx.strokeRect(x, y, w, h);
        }
      });
      break;
    }
    case "ellipse": {
      withAlpha(ctx, ann.opacity, () => {
        const { x, y, w, h } = normRect(ann);
        ctx.beginPath();
        ctx.ellipse(x + w / 2, y + h / 2, Math.abs(w / 2), Math.abs(h / 2), 0, 0, Math.PI * 2);
        if (ann.fill && ann.fill !== "none") {
          ctx.fillStyle = ann.fill;
          ctx.fill();
        }
        if (ann.width > 0) {
          ctx.strokeStyle = ann.color;
          ctx.lineWidth = ann.width;
          ctx.stroke();
        }
      });
      break;
    }
    case "line":
    case "arrow": {
      withAlpha(ctx, ann.opacity, () => {
        ctx.strokeStyle = ann.color;
        ctx.fillStyle = ann.color;
        ctx.lineWidth = ann.width;
        ctx.beginPath();
        ctx.moveTo(ann.x1, ann.y1);
        ctx.lineTo(ann.x2, ann.y2);
        ctx.stroke();
        if (ann.type === "arrow") {
          drawArrowHead(ctx, ann.x1, ann.y1, ann.x2, ann.y2, ann.width);
        }
      });
      break;
    }
    case "text": {
      withAlpha(ctx, ann.opacity, () => {
        ctx.fillStyle = ann.color;
        ctx.textBaseline = "top";
        ctx.font = `${ann.size}px ${ann.family}`;
        const lines = ann.text.split("\n");
        lines.forEach((ln, i) => {
          ctx.fillText(ln, ann.x, ann.y + i * ann.size * 1.25);
        });
      });
      break;
    }
    case "image": {
      const img = getCachedImage(ann.src, onImageLoad);
      if (img) {
        withAlpha(ctx, ann.opacity, () => {
          const { x, y, w, h } = normRect(ann);
          ctx.drawImage(img, x, y, w, h);
        });
      }
      break;
    }
  }
  ctx.restore();
}

function drawArrowHead(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  width: number
) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const len = Math.max(10, width * 3.5);
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(
    x2 - len * Math.cos(angle - Math.PI / 6),
    y2 - len * Math.sin(angle - Math.PI / 6)
  );
  ctx.lineTo(
    x2 - len * Math.cos(angle + Math.PI / 6),
    y2 - len * Math.sin(angle + Math.PI / 6)
  );
  ctx.closePath();
  ctx.fill();
}

/** Renders a background then every annotation, in order, onto a context. */
export function renderScene(
  ctx: CanvasRenderingContext2D,
  background: CanvasImageSource | null,
  bgWidth: number,
  bgHeight: number,
  annotations: Annotation[],
  onImageLoad?: () => void
) {
  ctx.clearRect(0, 0, bgWidth, bgHeight);
  if (background) {
    ctx.drawImage(background, 0, 0, bgWidth, bgHeight);
  } else {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, bgWidth, bgHeight);
  }
  for (const ann of annotations) drawAnnotation(ctx, ann, onImageLoad);
}

// ---------------------------------------------------------------------------
// Geometry helpers
// ---------------------------------------------------------------------------

function normRect(r: { x: number; y: number; w: number; h: number }): Bounds {
  return {
    x: r.w < 0 ? r.x + r.w : r.x,
    y: r.h < 0 ? r.y + r.h : r.y,
    w: Math.abs(r.w),
    h: Math.abs(r.h),
  };
}

/** Measures a text annotation using an offscreen context. */
export function measureText(
  ctx: CanvasRenderingContext2D,
  ann: TextAnn
): Bounds {
  ctx.save();
  ctx.font = `${ann.size}px ${ann.family}`;
  const lines = ann.text.split("\n");
  let maxW = 0;
  for (const ln of lines) maxW = Math.max(maxW, ctx.measureText(ln || " ").width);
  ctx.restore();
  return {
    x: ann.x,
    y: ann.y,
    w: Math.max(maxW, 8),
    h: lines.length * ann.size * 1.25,
  };
}

export function getBounds(
  ann: Annotation,
  ctx?: CanvasRenderingContext2D
): Bounds {
  switch (ann.type) {
    case "rect":
    case "ellipse":
    case "image":
      return normRect(ann);
    case "line":
    case "arrow":
      return normRect({
        x: ann.x1,
        y: ann.y1,
        w: ann.x2 - ann.x1,
        h: ann.y2 - ann.y1,
      });
    case "text":
      if (ctx) return measureText(ctx, ann);
      return { x: ann.x, y: ann.y, w: ann.text.length * ann.size * 0.55, h: ann.size * 1.25 };
    case "pen":
    case "highlighter": {
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (let i = 0; i < ann.points.length; i += 2) {
        minX = Math.min(minX, ann.points[i]);
        maxX = Math.max(maxX, ann.points[i]);
        minY = Math.min(minY, ann.points[i + 1]);
        maxY = Math.max(maxY, ann.points[i + 1]);
      }
      if (!isFinite(minX)) return { x: 0, y: 0, w: 0, h: 0 };
      const pad = ann.width / 2;
      return { x: minX - pad, y: minY - pad, w: maxX - minX + ann.width, h: maxY - minY + ann.width };
    }
  }
}

function distToSegment(px: number, py: number, x1: number, y1: number, x2: number, y2: number) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  let t = lenSq === 0 ? 0 : ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const cx = x1 + t * dx;
  const cy = y1 + t * dy;
  return Math.hypot(px - cx, py - cy);
}

/** Returns the id of the topmost annotation under (x,y), or null. */
export function hitTest(
  annotations: Annotation[],
  x: number,
  y: number,
  ctx: CanvasRenderingContext2D,
  tolerance = 6
): string | null {
  for (let i = annotations.length - 1; i >= 0; i--) {
    const ann = annotations[i];
    if (ann.type === "line" || ann.type === "arrow") {
      if (distToSegment(x, y, ann.x1, ann.y1, ann.x2, ann.y2) <= tolerance + ann.width / 2)
        return ann.id;
      continue;
    }
    if (ann.type === "pen" || ann.type === "highlighter") {
      for (let p = 0; p < ann.points.length - 2; p += 2) {
        if (
          distToSegment(
            x, y,
            ann.points[p], ann.points[p + 1],
            ann.points[p + 2], ann.points[p + 3]
          ) <= tolerance + ann.width / 2
        )
          return ann.id;
      }
      continue;
    }
    const b = getBounds(ann, ctx);
    if (x >= b.x - tolerance && x <= b.x + b.w + tolerance && y >= b.y - tolerance && y <= b.y + b.h + tolerance)
      return ann.id;
  }
  return null;
}

export type HandleId = "nw" | "ne" | "sw" | "se" | "start" | "end";

export interface Handle {
  id: HandleId;
  x: number;
  y: number;
}

/** Resize/endpoint handles for the current selection, in natural px. */
export function getHandles(ann: Annotation, ctx?: CanvasRenderingContext2D): Handle[] {
  if (ann.type === "line" || ann.type === "arrow") {
    return [
      { id: "start", x: ann.x1, y: ann.y1 },
      { id: "end", x: ann.x2, y: ann.y2 },
    ];
  }
  if (ann.type === "pen" || ann.type === "highlighter") return [];
  const b = getBounds(ann, ctx);
  return [
    { id: "nw", x: b.x, y: b.y },
    { id: "ne", x: b.x + b.w, y: b.y },
    { id: "sw", x: b.x, y: b.y + b.h },
    { id: "se", x: b.x + b.w, y: b.y + b.h },
  ];
}

/** Translates an annotation by (dx,dy). Returns a new object. */
export function moveAnn(ann: Annotation, dx: number, dy: number): Annotation {
  switch (ann.type) {
    case "pen":
    case "highlighter":
      return { ...ann, points: ann.points.map((v, i) => (i % 2 === 0 ? v + dx : v + dy)) };
    case "line":
    case "arrow":
      return { ...ann, x1: ann.x1 + dx, y1: ann.y1 + dy, x2: ann.x2 + dx, y2: ann.y2 + dy } as Annotation;
    default:
      return { ...ann, x: ann.x + dx, y: ann.y + dy } as Annotation;
  }
}

/** Applies a handle drag to an annotation. Returns a new object. */
export function resizeAnn(
  ann: Annotation,
  handle: HandleId,
  x: number,
  y: number
): Annotation {
  if (ann.type === "line" || ann.type === "arrow") {
    if (handle === "start") return { ...ann, x1: x, y1: y } as Annotation;
    return { ...ann, x2: x, y2: y } as Annotation;
  }
  if (ann.type === "pen" || ann.type === "highlighter") return ann;

  // Rect-like (rect/ellipse/image/text-as-box). Keep the opposite corner fixed.
  const b = getBounds(ann);
  let left = b.x;
  let top = b.y;
  let right = b.x + b.w;
  let bottom = b.y + b.h;
  if (handle === "nw") { left = x; top = y; }
  if (handle === "ne") { right = x; top = y; }
  if (handle === "sw") { left = x; bottom = y; }
  if (handle === "se") { right = x; bottom = y; }
  const nx = Math.min(left, right);
  const ny = Math.min(top, bottom);
  const nw = Math.max(2, Math.abs(right - left));
  const nh = Math.max(2, Math.abs(bottom - top));

  if (ann.type === "text") {
    // Scale font size to the new height rather than distorting.
    const ratio = nh / Math.max(1, b.h);
    return { ...ann, x: nx, y: ny, size: Math.max(6, ann.size * ratio) } as Annotation;
  }
  return { ...ann, x: nx, y: ny, w: nw, h: nh } as Annotation;
}

export const DEFAULT_STYLE: Style = {
  color: "#ff3b30",
  width: 4,
  opacity: 1,
  fill: "none",
  fontSize: 28,
  fontFamily: "sans-serif",
};

export const PALETTE = [
  "#ff3b30",
  "#ff9500",
  "#ffcc00",
  "#34c759",
  "#0070f3",
  "#5856d6",
  "#af52de",
  "#000000",
  "#8e8e93",
  "#ffffff",
];

export const HIGHLIGHT_PALETTE = [
  "#ffe600",
  "#a6ff00",
  "#00e5ff",
  "#ff7ac2",
  "#ff9500",
];

/** Font families offered by the text tool. `value` is a CSS font-family. */
export const FONT_FAMILIES: { label: string; value: string }[] = [
  { label: "Sans-serif", value: "sans-serif" },
  { label: "Serif", value: "serif" },
  { label: "Monoespaciada", value: "monospace" },
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Verdana", value: "Verdana, Geneva, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Times New Roman", value: "'Times New Roman', Times, serif" },
  { label: "Courier New", value: "'Courier New', Courier, monospace" },
  { label: "Comic Sans", value: "'Comic Sans MS', 'Comic Sans', cursive" },
  { label: "Impact", value: "Impact, Haettenschweiler, sans-serif" },
];
