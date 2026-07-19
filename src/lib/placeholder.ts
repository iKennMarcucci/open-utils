/**
 * Placeholder image generator. Produces an SVG string from a set of options,
 * plus exporters (data URI, HTML, CSS, React). PNG export is done in the UI by
 * rasterizing the SVG on a canvas.
 */

export type PatternId = "solid" | "gradient" | "dots" | "grid" | "diagonal" | "noise" | "blueprint";

export const PATTERNS: { id: PatternId; label: string }[] = [
  { id: "solid", label: "Color sólido" },
  { id: "gradient", label: "Gradiente" },
  { id: "dots", label: "Puntos" },
  { id: "grid", label: "Cuadrícula" },
  { id: "diagonal", label: "Líneas diagonales" },
  { id: "noise", label: "Ruido" },
  { id: "blueprint", label: "Blueprint" },
];

export const ASPECT_PRESETS: { label: string; w: number; h: number }[] = [
  { label: "16:9", w: 1280, h: 720 },
  { label: "9:16", w: 720, h: 1280 },
  { label: "1:1", w: 800, h: 800 },
  { label: "4:3", w: 1024, h: 768 },
  { label: "3:4", w: 768, h: 1024 },
  { label: "3:2", w: 1200, h: 800 },
  { label: "21:9", w: 1680, h: 720 },
  { label: "Banner", w: 1200, h: 300 },
];

export const COLOR_PRESETS: { label: string; c1: string; c2: string; text: string }[] = [
  { label: "Grafito", c1: "#1c1c1c", c2: "#3a3a3a", text: "#e5e5e5" },
  { label: "Océano", c1: "#0ea5e9", c2: "#1e3a8a", text: "#ffffff" },
  { label: "Atardecer", c1: "#f97316", c2: "#db2777", text: "#ffffff" },
  { label: "Bosque", c1: "#10b981", c2: "#064e3b", text: "#ecfdf5" },
  { label: "Lavanda", c1: "#a78bfa", c2: "#6d28d9", text: "#ffffff" },
  { label: "Papel", c1: "#f5f5f4", c2: "#d6d3d1", text: "#44403c" },
];

export type PlaceholderOptions = {
  width: number;
  height: number;
  pattern: PatternId;
  color1: string;
  color2: string;
  textColor: string;
  text: string;
  showText: boolean;
};

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function background(o: PlaceholderOptions): { defs: string; fill: string } {
  const { color1, color2 } = o;
  switch (o.pattern) {
    case "solid":
      return { defs: "", fill: color1 };
    case "gradient":
      return {
        defs: `<linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${color1}"/><stop offset="1" stop-color="${color2}"/></linearGradient>`,
        fill: "url(#g)",
      };
    case "dots":
      return {
        defs: `<pattern id="p" width="24" height="24" patternUnits="userSpaceOnUse"><rect width="24" height="24" fill="${color1}"/><circle cx="12" cy="12" r="2.5" fill="${color2}"/></pattern>`,
        fill: "url(#p)",
      };
    case "grid":
      return {
        defs: `<pattern id="p" width="32" height="32" patternUnits="userSpaceOnUse"><rect width="32" height="32" fill="${color1}"/><path d="M32 0H0V32" fill="none" stroke="${color2}" stroke-width="1"/></pattern>`,
        fill: "url(#p)",
      };
    case "diagonal":
      return {
        defs: `<pattern id="p" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="20" height="20" fill="${color1}"/><line x1="0" y1="0" x2="0" y2="20" stroke="${color2}" stroke-width="6"/></pattern>`,
        fill: "url(#p)",
      };
    case "noise":
      return {
        defs: `<filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>`,
        fill: color1,
      };
    case "blueprint":
      return {
        defs: `<pattern id="p" width="40" height="40" patternUnits="userSpaceOnUse"><rect width="40" height="40" fill="${color1}"/><path d="M40 0H0V40" fill="none" stroke="${color2}" stroke-width="0.5" opacity="0.6"/><path d="M8 0V40M16 0V40M24 0V40M32 0V40M0 8H40M0 16H40M0 24H40M0 32H40" stroke="${color2}" stroke-width="0.3" opacity="0.35"/></pattern>`,
        fill: "url(#p)",
      };
  }
}

export function buildSvg(o: PlaceholderOptions): string {
  const bg = background(o);
  const label = o.text || `${o.width}×${o.height}`;
  const fontSize = Math.max(14, Math.round(Math.min(o.width, o.height) / 10));
  const noiseOverlay =
    o.pattern === "noise" ? `<rect width="100%" height="100%" filter="url(#n)" opacity="0.5"/>` : "";
  const text = o.showText
    ? `<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="${o.textColor}" font-family="system-ui, sans-serif" font-size="${fontSize}" font-weight="600">${esc(label)}</text>`
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${o.width}" height="${o.height}" viewBox="0 0 ${o.width} ${o.height}" role="img" aria-label="${esc(label)}"><defs>${bg.defs}</defs><rect width="100%" height="100%" fill="${bg.fill}"/>${noiseOverlay}${text}</svg>`;
}

export function svgToDataUri(svg: string): string {
  return `data:image/svg+xml,${encodeURIComponent(svg).replace(/'/g, "%27").replace(/"/g, "%22")}`;
}

export function exportHtml(o: PlaceholderOptions, svg: string): string {
  return `<img src="${svgToDataUri(svg)}" width="${o.width}" height="${o.height}" alt="${esc(o.text || "placeholder")}" />`;
}

export function exportCss(svg: string): string {
  return `.placeholder {\n  background-image: url("${svgToDataUri(svg)}");\n  background-size: cover;\n  background-position: center;\n}`;
}

export function exportReact(o: PlaceholderOptions, svg: string): string {
  return `export function Placeholder() {\n  return (\n    <img\n      src="${svgToDataUri(svg)}"\n      width={${o.width}}\n      height={${o.height}}\n      alt="${esc(o.text || "placeholder")}"\n    />\n  );\n}`;
}
