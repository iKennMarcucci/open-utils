import { describe, it, expect } from "vitest";
import {
  buildSvg,
  svgToDataUri,
  exportHtml,
  exportCss,
  exportReact,
  PATTERNS,
  type PlaceholderOptions,
  type PatternId,
} from "@/lib/placeholder";

const base: PlaceholderOptions = {
  width: 800,
  height: 600,
  pattern: "solid",
  color1: "#111111",
  color2: "#222222",
  textColor: "#ffffff",
  text: "",
  showText: true,
};

describe("buildSvg — structure", () => {
  it("emits a well-formed root svg with the requested dimensions", () => {
    const svg = buildSvg(base);
    expect(svg.startsWith("<svg")).toBe(true);
    expect(svg.trimEnd().endsWith("</svg>")).toBe(true);
    expect(svg).toContain('width="800"');
    expect(svg).toContain('height="600"');
    expect(svg).toContain('viewBox="0 0 800 600"');
  });

  it("uses width×height as the label when text is empty", () => {
    const svg = buildSvg(base);
    expect(svg).toContain("800×600");
  });

  it("uses the provided text as the label when set", () => {
    const svg = buildSvg({ ...base, text: "Hola" });
    expect(svg).toContain(">Hola</text>");
    expect(svg).toContain('aria-label="Hola"');
  });

  it("omits the <text> element when showText is false", () => {
    const svg = buildSvg({ ...base, showText: false });
    expect(svg).not.toContain("<text");
  });
});

describe("buildSvg — every pattern renders", () => {
  it.each(PATTERNS.map((p) => p.id))("pattern %s produces a valid rect fill", (id) => {
    const svg = buildSvg({ ...base, pattern: id as PatternId });
    expect(svg).toContain("<svg");
    // there must always be a full-bleed background rect
    expect(svg).toContain('<rect width="100%" height="100%"');
  });

  it("gradient/dots/grid/diagonal/blueprint reference a def by id", () => {
    for (const id of ["gradient", "dots", "grid", "diagonal", "blueprint"] as PatternId[]) {
      const svg = buildSvg({ ...base, pattern: id });
      expect(svg).toMatch(/fill="url\(#[gp]\)"/);
    }
  });

  it("noise adds a turbulence filter and an overlay rect", () => {
    const svg = buildSvg({ ...base, pattern: "noise" });
    expect(svg).toContain("feTurbulence");
    expect(svg).toContain('filter="url(#n)"');
  });
});

describe("buildSvg — escaping (no SVG injection via text)", () => {
  it("escapes < > & in both the visible text and the aria-label", () => {
    const svg = buildSvg({ ...base, text: '<script>&"' });
    expect(svg).not.toContain("<script>");
    expect(svg).toContain("&lt;script&gt;");
    expect(svg).toContain("&amp;");
  });
});

describe("buildSvg — font size", () => {
  it("never drops below the 14px floor for tiny images", () => {
    const svg = buildSvg({ ...base, width: 20, height: 20, text: "x" });
    expect(svg).toContain('font-size="14"');
  });

  it("scales with the smaller dimension for large images", () => {
    // min(1000, 500)/10 = 50
    const svg = buildSvg({ ...base, width: 1000, height: 500, text: "x" });
    expect(svg).toContain('font-size="50"');
  });
});

describe("svgToDataUri — URL safety", () => {
  it("produces an inline svg+xml data URI with no raw quotes or apostrophes", () => {
    const uri = svgToDataUri(buildSvg({ ...base, text: "a'b\"c" }));
    expect(uri.startsWith("data:image/svg+xml,")).toBe(true);
    // raw ' and " would break the attribute in HTML/CSS contexts
    expect(uri).not.toContain("'");
    expect(uri).not.toContain('"');
    expect(uri).toContain("%27");
    expect(uri).toContain("%22");
  });
});

describe("exporters — embed the data URI and honest dimensions", () => {
  const svg = buildSvg(base);

  it("exportHtml is a single <img> with width/height", () => {
    const html = exportHtml(base, svg);
    expect(html).toContain("<img");
    expect(html).toContain('width="800"');
    expect(html).toContain('height="600"');
    expect(html).toContain("data:image/svg+xml,");
  });

  it("exportHtml alt falls back to 'placeholder' when no text", () => {
    expect(exportHtml(base, svg)).toContain('alt="placeholder"');
  });

  it("exportCss wraps the URI in a background-image with cover sizing", () => {
    const css = exportCss(svg);
    expect(css).toContain("background-image: url(");
    expect(css).toContain("background-size: cover");
  });

  it("exportReact emits a component using JSX numeric props", () => {
    const jsx = exportReact(base, svg);
    expect(jsx).toContain("export function Placeholder()");
    expect(jsx).toContain("width={800}");
    expect(jsx).toContain("height={600}");
  });

  it("exporters do not stretch the snippet with unescaped newlines in the URI", () => {
    // The data URI must be a single line: no literal newline can leak in.
    const uri = svgToDataUri(buildSvg({ ...base, text: "multi\nline" }));
    expect(uri).not.toContain("\n");
  });
});
