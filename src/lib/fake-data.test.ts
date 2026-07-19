import { describe, it, expect } from "vitest";
import {
  guessFieldType,
  generateRecords,
  serialize,
  value,
  type Field,
} from "@/lib/fake-data";

describe("guessFieldType", () => {
  it("prefers the OpenAPI format over the name", () => {
    expect(guessFieldType("whatever", "email")).toBe("email");
    expect(guessFieldType("whatever", "date-time")).toBe("datetime");
    expect(guessFieldType("whatever", "uuid")).toBe("uuid");
    expect(guessFieldType("whatever", "uri")).toBe("url");
  });

  it("is case-insensitive on the format", () => {
    expect(guessFieldType("x", "DATE-TIME")).toBe("datetime");
  });

  it("falls back to name-based hints", () => {
    expect(guessFieldType("userEmail")).toBe("email");
    expect(guessFieldType("phone")).toBe("phone");
    expect(guessFieldType("precio")).toBe("price");
    expect(guessFieldType("ciudad")).toBe("city");
    expect(guessFieldType("created_at")).toBe("datetime");
    expect(guessFieldType("user_id")).toBe("uuid");
  });

  it("returns null when nothing matches", () => {
    expect(guessFieldType("randomBlob")).toBeNull();
    expect(guessFieldType("xyz", "unknownformat")).toBeNull();
  });
});

describe("value", () => {
  it("produces values matching the requested type's shape", () => {
    expect(value("uuid")).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
    );
    expect(value("email")).toMatch(/^[^@\s]+@[^@\s]+$/);
    expect(value("color")).toMatch(/^#[0-9a-f]{6}$/);
    expect(value("ipv4")).toMatch(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/);
    expect(typeof value("int")).toBe("number");
    expect(typeof value("boolean")).toBe("boolean");
    expect(value("date")).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(value("datetime")).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
  });
});

describe("generateRecords", () => {
  const schema: Field[] = [
    { name: "id", type: "uuid" },
    { name: "nombre", type: "fullName" },
  ];

  it("produces exactly the requested count of rows with the schema keys", () => {
    const rows = generateRecords(schema, 5);
    expect(rows).toHaveLength(5);
    for (const r of rows) expect(Object.keys(r)).toEqual(["id", "nombre"]);
  });

  it("caps the count at 1000", () => {
    expect(generateRecords(schema, 99999)).toHaveLength(1000);
  });

  it("clamps a zero/negative count up to at least 1", () => {
    expect(generateRecords(schema, 0)).toHaveLength(1);
    expect(generateRecords(schema, -3)).toHaveLength(1);
  });

  it("ignores fields with a blank name", () => {
    const rows = generateRecords(
      [{ name: "", type: "uuid" }, { name: "keep", type: "word" }],
      1
    );
    expect(Object.keys(rows[0])).toEqual(["keep"]);
  });
});

describe("serialize", () => {
  const records = [
    { id: 1, nombre: "Ada", activo: true },
    { id: 2, nombre: "Linus", activo: false },
  ];

  it("returns empty string for no records", () => {
    expect(serialize([], "json")).toBe("");
  });

  it("serializes to JSON", () => {
    expect(serialize(records, "json")).toBe(JSON.stringify(records, null, 2));
  });

  it("serializes to CSV with a header row", () => {
    expect(serialize(records, "csv")).toBe(
      "id,nombre,activo\n1,Ada,true\n2,Linus,false"
    );
  });

  it("serializes to a tab-separated table", () => {
    expect(serialize(records, "table")).toBe(
      "id\tnombre\tactivo\n1\tAda\ttrue\n2\tLinus\tfalse"
    );
  });

  it("serializes to XML", () => {
    const out = serialize(records, "xml", "usuarios");
    expect(out).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(out).toContain("<usuarios>");
    expect(out).toContain("<registro>");
    expect(out).toContain("<nombre>Ada</nombre>");
  });

  it("serializes to SQL INSERT statements", () => {
    const out = serialize(records, "sql", "usuarios");
    expect(out).toContain(
      "INSERT INTO usuarios (id, nombre, activo) VALUES (1, 'Ada', TRUE);"
    );
    expect(out).toContain(
      "INSERT INTO usuarios (id, nombre, activo) VALUES (2, 'Linus', FALSE);"
    );
  });

  it("escapes quotes/commas in CSV and single quotes in SQL", () => {
    const rows = [{ txt: `a,b"c` }];
    expect(serialize(rows, "csv")).toBe('txt\n"a,b""c"');
    expect(serialize([{ txt: "O'Hara" }], "sql", "t")).toContain(
      "'O''Hara'"
    );
  });
});
