import { describe, it, expect } from "vitest";
import { jsonToTypeScript } from "@/lib/json-to-ts";

describe("jsonToTypeScript", () => {
  it("returns empty output for blank input", () => {
    expect(jsonToTypeScript("")).toEqual({ ok: true, output: "" });
  });

  it("errors on invalid JSON and surfaces the position", () => {
    const res = jsonToTypeScript("{ not valid");
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toMatch(/JSON no válido/);
  });

  it("emits a named interface per nested object", () => {
    const res = jsonToTypeScript('{"user":{"name":"Ada","age":30}}');
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.output).toContain("export interface Root");
      expect(res.output).toContain("export interface User");
      expect(res.output).toContain("user: User;");
      expect(res.output).toContain("name: string;");
      expect(res.output).toContain("age: number;");
    }
  });

  it("types primitives including null", () => {
    const res = jsonToTypeScript('{"s":"x","n":1,"b":true,"nada":null}');
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.output).toContain("s: string;");
      expect(res.output).toContain("n: number;");
      expect(res.output).toContain("b: boolean;");
      expect(res.output).toContain("nada: null;");
    }
  });

  it("merges an array of objects and marks non-shared fields optional", () => {
    const res = jsonToTypeScript('{"items":[{"a":1},{"a":2,"b":3}]}');
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.output).toContain("a: number;");
      expect(res.output).toContain("b?: number;"); // present only in one element
    }
  });

  it("honours a custom root name", () => {
    const res = jsonToTypeScript('{"x":1}', "Config");
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.output).toContain("export interface Config");
  });

  it("emits a type alias for a primitive root", () => {
    const res = jsonToTypeScript("42", "Root");
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.output.trim()).toBe("export type Root = number;");
  });

  it("emits a type alias for an array-of-primitives root", () => {
    const res = jsonToTypeScript("[1,2,3]", "Root");
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.output.trim()).toBe("export type Root = number[];");
  });

  it("emits the element interface when the root is an array of objects", () => {
    const res = jsonToTypeScript('[{"a":1}]', "Root");
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.output).toContain("export interface RootItem");
      expect(res.output).toContain("a: number;");
    }
  });

  // An array-of-objects ROOT now encodes its array-ness: the element shape gets
  // its own interface and the root becomes a `[]` alias of it, e.g.
  // `export type Root = RootItem[]`.
  it("conveys that an array-of-objects root is an array", () => {
    const res = jsonToTypeScript('[{"a":1}]', "Root");
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.output).toMatch(/\[\]/);
      expect(res.output).toContain("export type Root = RootItem[];");
      expect(res.output).toContain("export interface RootItem");
    }
  });

  it("quotes property keys that are not valid identifiers", () => {
    const res = jsonToTypeScript('{"weird-key":1}');
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.output).toContain('"weird-key": number;');
  });
});
