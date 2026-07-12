"use client";

import { useRef, useState } from "react";
import {
  MousePointer2,
  Pen,
  Highlighter,
  Minus,
  ArrowUpRight,
  Square,
  Circle,
  Type,
  ImagePlus,
  Eraser,
  Undo2,
  Redo2,
  Trash2,
  Copy,
  BringToFront,
  SendToBack,
  Palette,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type Style,
  type Tool,
  PALETTE,
  FONT_FAMILIES,
} from "@/lib/editor-core";

const TOOLS: { id: Tool; icon: typeof Pen; label: string; shortcut?: string }[] = [
  { id: "select", icon: MousePointer2, label: "Seleccionar", shortcut: "V" },
  { id: "pen", icon: Pen, label: "Lápiz", shortcut: "P" },
  { id: "highlighter", icon: Highlighter, label: "Resaltador", shortcut: "H" },
  { id: "line", icon: Minus, label: "Línea", shortcut: "L" },
  { id: "arrow", icon: ArrowUpRight, label: "Flecha", shortcut: "A" },
  { id: "rect", icon: Square, label: "Rectángulo", shortcut: "R" },
  { id: "ellipse", icon: Circle, label: "Elipse", shortcut: "O" },
  { id: "text", icon: Type, label: "Texto", shortcut: "T" },
  { id: "image", icon: ImagePlus, label: "Insertar imagen" },
  { id: "eraser", icon: Eraser, label: "Borrador", shortcut: "E" },
];

interface Props {
  tool: Tool;
  setTool: (t: Tool) => void;
  style: Style;
  setStyle: (patch: Partial<Style>) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  hasSelection: boolean;
  /** Type of the currently selected annotation, if any. */
  selectedType?: string;
  onDelete: () => void;
  onDuplicate: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  onInsertImage: () => void;
}

/** Styled tooltip shown on hover, below the control. */
function Tooltip({ label, shortcut }: { label: string; shortcut?: string }) {
  return (
    <span
      role="tooltip"
      className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 translate-y-[-3px] whitespace-nowrap rounded-md border border-border-strong bg-surface-strong px-2 py-1 text-xs font-medium text-foreground opacity-0 shadow-lg transition-all duration-150 group-hover/tt:translate-y-0 group-hover/tt:opacity-100"
    >
      {label}
      {shortcut && (
        <kbd className="ml-1.5 rounded border border-border bg-background-elevated px-1 text-[10px] text-foreground-faint">
          {shortcut}
        </kbd>
      )}
    </span>
  );
}

function ToolButton({
  active,
  onClick,
  label,
  shortcut,
  children,
  disabled,
}: {
  active?: boolean;
  onClick: () => void;
  label: string;
  shortcut?: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <div className={cn("group/tt relative inline-flex", disabled && "pointer-events-none")}>
      <button
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        className={cn(
          "flex items-center justify-center w-9 h-9 rounded-control transition-colors shrink-0",
          active
            ? "bg-accent text-accent-foreground"
            : "text-foreground-muted hover:text-foreground hover:bg-surface-hover",
          disabled && "opacity-40"
        )}
      >
        {children}
      </button>
      {!disabled && <Tooltip label={label} shortcut={shortcut} />}
    </div>
  );
}

const Divider = () => <span className="w-px h-6 bg-border mx-1 shrink-0" />;

export function EditorToolbar({
  tool,
  setTool,
  style,
  setStyle,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  hasSelection,
  onDelete,
  onDuplicate,
  onBringForward,
  onSendBackward,
  onInsertImage,
  selectedType,
}: Props) {
  const [showColor, setShowColor] = useState(false);
  const colorRef = useRef<HTMLInputElement>(null);

  // Controls appear for the active tool AND for a matching selection, so you can
  // restyle something after selecting it.
  const strokeKinds = ["pen", "highlighter", "line", "arrow", "rect", "ellipse"];
  const isShapeTool = tool === "rect" || tool === "ellipse" || selectedType === "rect" || selectedType === "ellipse";
  const isTextTool = tool === "text" || selectedType === "text";
  const showStroke = strokeKinds.includes(tool) || (!!selectedType && strokeKinds.includes(selectedType));

  return (
    <div className="ou-card rounded-panel p-2 flex flex-wrap items-center gap-1.5">
      {/* Tools */}
      <div className="flex items-center gap-0.5">
        {TOOLS.map((t) => (
          <ToolButton
            key={t.id}
            active={tool === t.id}
            label={t.label}
            shortcut={t.shortcut}
            onClick={() => {
              if (t.id === "image") {
                onInsertImage();
                return;
              }
              setTool(t.id);
            }}
          >
            <t.icon className="w-[18px] h-[18px]" />
          </ToolButton>
        ))}
      </div>

      <Divider />

      {/* Color */}
      <div className="relative">
        <button
          onClick={() => setShowColor((v) => !v)}
          title="Color"
          className="flex items-center gap-1.5 h-9 pl-2 pr-2.5 rounded-control text-foreground-muted hover:text-foreground hover:bg-surface-hover transition-colors"
        >
          <span
            className="w-5 h-5 rounded-md border border-border-strong shrink-0"
            style={{ background: style.color }}
          />
          <Palette className="w-4 h-4" />
        </button>
        {showColor && (
          <>
            <div className="fixed inset-0 z-20" onClick={() => setShowColor(false)} />
            <div className="absolute top-full left-0 mt-2 z-30 ou-card rounded-panel p-3 shadow-lg w-56">
              <p className="ou-label mb-2">Color</p>
              <div className="grid grid-cols-5 gap-2 mb-3">
                {PALETTE.map((c) => (
                  <button
                    key={c}
                    onClick={() => setStyle({ color: c })}
                    className={cn(
                      "w-8 h-8 rounded-md border transition-transform hover:scale-110",
                      style.color.toLowerCase() === c.toLowerCase()
                        ? "border-accent ring-2 ring-accent"
                        : "border-border-strong"
                    )}
                    style={{ background: c }}
                    aria-label={c}
                  />
                ))}
              </div>
              <button
                onClick={() => colorRef.current?.click()}
                className="ou-btn ou-btn-secondary w-full h-9 text-xs"
              >
                <Palette className="w-3.5 h-3.5" /> Color personalizado
              </button>
              <input
                ref={colorRef}
                type="color"
                value={style.color}
                onChange={(e) => setStyle({ color: e.target.value })}
                className="sr-only"
              />
            </div>
          </>
        )}
      </div>

      {/* Fill toggle for shapes */}
      {isShapeTool && (
        <button
          onClick={() =>
            setStyle({ fill: style.fill === "none" ? style.color : "none" })
          }
          title="Relleno"
          className={cn(
            "h-9 px-2.5 rounded-control text-xs font-medium transition-colors",
            style.fill !== "none"
              ? "bg-surface-strong text-foreground border border-border-strong"
              : "text-foreground-muted hover:text-foreground hover:bg-surface-hover"
          )}
        >
          {style.fill !== "none" ? "Relleno" : "Sin relleno"}
        </button>
      )}

      {/* Stroke width */}
      {showStroke && (
        <div className="flex items-center gap-2 px-2 h-9">
          <span className="text-[11px] text-foreground-faint w-8 tabular-nums">
            {style.width}px
          </span>
          <input
            type="range"
            min={1}
            max={40}
            value={style.width}
            onChange={(e) => setStyle({ width: Number(e.target.value) })}
            className="w-24 accent-accent"
          />
        </div>
      )}

      {/* Font family + size (text) */}
      {isTextTool && (
        <div className="flex items-center gap-2 px-1 h-9">
          <select
            value={style.fontFamily}
            onChange={(e) => setStyle({ fontFamily: e.target.value })}
            title="Tipo de letra"
            aria-label="Tipo de letra"
            className="h-8 rounded-control border border-border bg-surface-strong px-2 text-xs text-foreground hover:border-border-strong focus-visible:outline-none max-w-[130px]"
            style={{ fontFamily: style.fontFamily }}
          >
            {FONT_FAMILIES.map((f) => (
              <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
                {f.label}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-1.5" title="Tamaño de letra">
            <Type className="w-3.5 h-3.5 text-foreground-faint shrink-0" />
            <input
              type="range"
              min={8}
              max={200}
              value={style.fontSize}
              onChange={(e) => setStyle({ fontSize: Number(e.target.value) })}
              className="w-20 accent-accent"
              aria-label="Tamaño de letra"
            />
            <input
              type="number"
              min={8}
              max={400}
              value={style.fontSize}
              onChange={(e) => {
                const n = Number(e.target.value);
                if (Number.isFinite(n) && n > 0) setStyle({ fontSize: Math.min(400, Math.max(4, n)) });
              }}
              className="w-12 h-8 rounded-control border border-border bg-surface-strong px-1.5 text-xs text-foreground text-center tabular-nums focus-visible:outline-none"
              aria-label="Tamaño exacto de letra"
            />
          </div>
        </div>
      )}

      <Divider />

      {/* Layer + selection actions */}
      <ToolButton label="Traer al frente" disabled={!hasSelection} onClick={onBringForward}>
        <BringToFront className="w-[18px] h-[18px]" />
      </ToolButton>
      <ToolButton label="Enviar al fondo" disabled={!hasSelection} onClick={onSendBackward}>
        <SendToBack className="w-[18px] h-[18px]" />
      </ToolButton>
      <ToolButton label="Duplicar" disabled={!hasSelection} onClick={onDuplicate}>
        <Copy className="w-[18px] h-[18px]" />
      </ToolButton>
      <ToolButton label="Eliminar" shortcut="Supr" disabled={!hasSelection} onClick={onDelete}>
        <Trash2 className="w-[18px] h-[18px]" />
      </ToolButton>

      <Divider />

      {/* History */}
      <ToolButton label="Deshacer" shortcut="Ctrl+Z" disabled={!canUndo} onClick={onUndo}>
        <Undo2 className="w-[18px] h-[18px]" />
      </ToolButton>
      <ToolButton label="Rehacer" shortcut="Ctrl+Y" disabled={!canRedo} onClick={onRedo}>
        <Redo2 className="w-[18px] h-[18px]" />
      </ToolButton>
    </div>
  );
}
