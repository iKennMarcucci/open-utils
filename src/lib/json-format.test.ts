import { describe, it, expect } from "vitest";
import { formatJson, minifyJson, validateJson } from "@/lib/json-format";

describe("formatJson", () => {
  it("pretty-prints strict JSON with 2-space indent", () => {
    const res = formatJson('{"a":1,"b":[2,3]}', 2);
    expect(res).toEqual({
      ok: true,
      output: '{\n  "a": 1,\n  "b": [\n    2,\n    3\n  ]\n}',
    });
  });

  it("honours a 4-space indent", () => {
    const res = formatJson('{"a":1}', 4);
    expect(res.ok && res.output).toBe('{\n    "a": 1\n}');
  });

  it("returns empty output for blank input", () => {
    expect(formatJson("   ", 2)).toEqual({ ok: true, output: "" });
  });

  it("normalizes JSON5 (unquoted keys, single quotes, trailing commas) to real JSON", () => {
    const res = formatJson("{ nombre: 'Ada', activo: true, lista: [1,2,], }", 2);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(JSON.parse(res.output)).toEqual({
        nombre: "Ada",
        activo: true,
        lista: [1, 2],
      });
      // Real JSON: keys are double-quoted, no trailing comma.
      expect(res.output).toContain('"nombre"');
      expect(res.output).not.toContain("'");
    }
  });

  it("reports an error with a line and column on invalid JSON", () => {
    const res = formatJson('{\n  "a": 1,\n  "b":\n}', 2);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.issue.line).toBeGreaterThanOrEqual(1);
      expect(res.issue.column).toBeGreaterThanOrEqual(1);
      expect(res.issue.message).toBeTruthy();
    }
  });
});

describe("minifyJson", () => {
  it("strips all insignificant whitespace", () => {
    expect(minifyJson('{\n  "a": 1,\n  "b": 2\n}')).toEqual({
      ok: true,
      output: '{"a":1,"b":2}',
    });
  });

  it("minifies JSON5 input too", () => {
    const res = minifyJson("{ a: 1, b: 'x', }");
    expect(res).toEqual({ ok: true, output: '{"a":1,"b":"x"}' });
  });

  it("errors on broken input", () => {
    const res = minifyJson('{"roto": [1,2,}');
    expect(res.ok).toBe(false);
  });
});

describe("validateJson", () => {
  it("returns null for valid JSON", () => {
    expect(validateJson('{"a":1}')).toBeNull();
  });

  it("returns null for blank input", () => {
    expect(validateJson("")).toBeNull();
  });

  it("returns null for JSON5 (it is accepted as valid)", () => {
    expect(validateJson("{ a: 1 }")).toBeNull();
  });

  it("returns an issue with a position for a truncated object", () => {
    const issue = validateJson("{");
    expect(issue).not.toBeNull();
    expect(issue!.line).toBe(1);
    expect(issue!.column).toBeGreaterThan(0);
  });

  it("locates the error on a specific line for multi-line input", () => {
    const issue = validateJson('{\n  "a": 1\n  "b": 2\n}');
    expect(issue).not.toBeNull();
    // Missing comma is detected on line 3, where "b" begins.
    expect(issue!.line).toBe(3);
  });
});
