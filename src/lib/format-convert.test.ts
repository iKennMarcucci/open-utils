import { describe, it, expect } from "vitest";
import { parseInput, serializeOutput } from "@/lib/format-convert";

describe("parseInput", () => {
  it("returns null for blank input", () => {
    expect(parseInput("   ", "json")).toEqual({ ok: true, value: null });
  });

  it("parses JSON", () => {
    expect(parseInput('{"a":1,"b":[2,3]}', "json")).toEqual({
      ok: true,
      value: { a: 1, b: [2, 3] },
    });
  });

  it("parses YAML", () => {
    const res = parseInput("a: 1\nb:\n  - 2\n  - 3\n", "yaml");
    expect(res).toEqual({ ok: true, value: { a: 1, b: [2, 3] } });
  });

  it("parses TOML", () => {
    const res = parseInput('titulo = "Demo"\nnum = 3', "toml");
    expect(res).toEqual({ ok: true, value: { titulo: "Demo", num: 3 } });
  });

  it("parses CSV into an array of row objects, coercing scalars", () => {
    const res = parseInput("id,nombre,activo\n1,Ada,true\n2,Linus,false", "csv");
    expect(res).toEqual({
      ok: true,
      value: [
        { id: 1, nombre: "Ada", activo: true },
        { id: 2, nombre: "Linus", activo: false },
      ],
    });
  });

  it("handles quoted CSV cells containing commas", () => {
    const res = parseInput('nombre\n"Ada, Lovelace"', "csv");
    expect(res).toEqual({ ok: true, value: [{ nombre: "Ada, Lovelace" }] });
  });

  it("errors on malformed JSON", () => {
    const res = parseInput("{ broken", "json");
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toMatch(/No se pudo leer el JSON/);
  });
});

describe("serializeOutput", () => {
  const rows = [
    { id: 1, nombre: "Ada", activo: true },
    { id: 2, nombre: "Linus", activo: false },
  ];

  it("serializes to JSON (2-space)", () => {
    const res = serializeOutput(rows, "json");
    expect(res.ok && res.value).toBe(JSON.stringify(rows, null, 2));
  });

  it("serializes to YAML", () => {
    const res = serializeOutput(rows, "yaml");
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value).toContain("nombre: Ada");
      expect(res.value).toContain("activo: false");
    }
  });

  it("serializes to CSV", () => {
    const res = serializeOutput(rows, "csv");
    expect(res.ok && res.value).toBe(
      "id,nombre,activo\n1,Ada,true\n2,Linus,false"
    );
  });

  it("serializes to XML", () => {
    const res = serializeOutput(rows, "xml");
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(res.value).toContain("<nombre>Ada</nombre>");
    }
  });

  it("serializes to SQL INSERT statements", () => {
    const res = serializeOutput(rows, "sql", "usuarios");
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value).toContain(
        "INSERT INTO usuarios (id, nombre, activo) VALUES (1, 'Ada', TRUE);"
      );
    }
  });

  it("serializes to a Markdown table", () => {
    const res = serializeOutput(rows, "markdown");
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value).toContain("| id | nombre | activo |");
      expect(res.value).toContain("| --- | --- | --- |");
    }
  });

  it("serializes to an HTML table", () => {
    const res = serializeOutput(rows, "html");
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value).toContain("<table>");
      expect(res.value).toContain("<th>nombre</th>");
      expect(res.value).toContain("<td>Ada</td>");
    }
  });

  it("requires an object at the TOML root (rejects a bare array)", () => {
    const res = serializeOutput(rows, "toml");
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toMatch(/TOML requiere un objeto/);
  });

  it("serializes a flat object to TOML", () => {
    const res = serializeOutput({ titulo: "Demo", num: 3 }, "toml");
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value).toContain('titulo = "Demo"');
      expect(res.value).toContain("num = 3");
    }
  });

  it("errors when tabular targets get nested (non-tabular) data", () => {
    const nested = { usuario: { nombre: "Ada", direccion: { calle: "X" } } };
    for (const fmt of ["csv", "sql", "markdown", "html"] as const) {
      const res = serializeOutput(nested, fmt);
      expect(res.ok).toBe(false);
      if (!res.ok) expect(res.error).toMatch(/datos tabulares/);
    }
  });

  it("escapes special characters in CSV cells", () => {
    const res = serializeOutput([{ txt: 'a,b"c' }], "csv");
    expect(res.ok && res.value).toBe('txt\n"a,b""c"');
  });
});
