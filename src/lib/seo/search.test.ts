import { describe, it, expect } from "vitest";
import { normalize, searchTools, searchToolsFlat } from "@/lib/seo/search";
import { TOOL_ORDER } from "@/lib/seo/tools";
import { TOOL_KEYWORDS } from "@/lib/seo/keywords";

const slugs = (q: string) => searchToolsFlat(q).map((t) => t.slug);

describe("normalize", () => {
  it("lowercases and strips accents", () => {
    expect(normalize("Compresión ÁÉÍÓÚ ñ")).toBe("compresion aeiou n");
  });

  it("collapses whitespace and trims", () => {
    expect(normalize("  unir   pdf  ")).toBe("unir pdf");
  });
});

describe("keyword bank", () => {
  it("covers every tool with at least 25 terms", () => {
    for (const slug of TOOL_ORDER) {
      const kw = TOOL_KEYWORDS[slug];
      expect(kw, `missing keywords for ${slug}`).toBeDefined();
      expect(kw.length, `${slug} has only ${kw.length}`).toBeGreaterThanOrEqual(25);
    }
  });

  it("has no duplicate terms within a tool", () => {
    for (const slug of TOOL_ORDER) {
      const kw = TOOL_KEYWORDS[slug];
      expect(new Set(kw).size, `${slug} has duplicates`).toBe(kw.length);
    }
  });
});

describe("searchToolsFlat — empty and no-match", () => {
  it("returns nothing for an empty or whitespace query", () => {
    expect(searchToolsFlat("")).toEqual([]);
    expect(searchToolsFlat("   ")).toEqual([]);
  });

  it("returns nothing for gibberish", () => {
    expect(searchToolsFlat("zzzzqqqxyw")).toEqual([]);
  });
});

describe("searchToolsFlat — name matching and ranking", () => {
  it("ranks an exact name match first", () => {
    expect(slugs("unir pdf")[0]).toBe("unir-pdf");
  });

  it("finds a tool by a prefix of its name", () => {
    expect(slugs("dividi")).toContain("dividir-pdf");
  });

  it("is accent-insensitive", () => {
    expect(slugs("simbolos")).toContain("simbolos-emojis");
    expect(slugs("símbolos")).toContain("simbolos-emojis");
  });

  it("is order-insensitive across tokens", () => {
    expect(slugs("pdf unir")).toContain("unir-pdf");
    expect(slugs("unir pdf")).toContain("unir-pdf");
  });
});

describe("searchToolsFlat — keyword matching (the flexible part)", () => {
  it.each([
    ["achicar foto", "comprimir-imagen"],
    ["watermark", "marca-de-agua"],
    ["unzip", "descomprimir-zip"],
    ["exif", "ver-metadatos"],
    ["camelcase", "convertir-mayusculas"],
    ["json web token", "decodificar-jwt"],
    ["readme", "editor-markdown"],
    ["mp4 a gif", "video-a-gif"],
    ["firmar pdf", "editor-pdf"],
    ["mock data", "datos-falsos"],
    ["yaml", "convertir-formatos"],
    ["favicon", "generar-favicon"],
  ])("query %j finds %s", (query, slug) => {
    expect(slugs(query)).toContain(slug);
  });

  it("narrows as more tokens are typed", () => {
    const broad = slugs("pdf");
    const narrow = slugs("pdf dividir");
    expect(broad.length).toBeGreaterThan(narrow.length);
    expect(narrow).toContain("dividir-pdf");
  });

  it("requires every token to match (AND, not OR)", () => {
    // "zip" and "jwt" belong to different tools, so together they match nothing
    expect(searchToolsFlat("zip jwt")).toEqual([]);
  });
});

describe("searchTools — grouping", () => {
  it("groups matches by category and omits empty groups", () => {
    const groups = searchTools("pdf");
    expect(groups.length).toBeGreaterThan(0);
    for (const g of groups) {
      expect(g.tools.length).toBeGreaterThan(0);
      expect(g.label.trim()).not.toBe("");
      for (const t of g.tools) expect(t.category).toBe(g.category);
    }
  });

  it("returns an empty array when nothing matches", () => {
    expect(searchTools("zzzzqqqxyw")).toEqual([]);
  });

  it("preserves every flat match across the groups", () => {
    const flat = searchToolsFlat("imagen");
    const grouped = searchTools("imagen").flatMap((g) => g.tools);
    expect(grouped.length).toBe(flat.length);
    expect(new Set(grouped.map((t) => t.slug))).toEqual(new Set(flat.map((t) => t.slug)));
  });
});
