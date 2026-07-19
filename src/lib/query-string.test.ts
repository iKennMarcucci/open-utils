import { describe, it, expect } from "vitest";
import {
  parseUrl,
  buildQuery,
  buildUrl,
  exportAs,
  type Param,
} from "@/lib/query-string";

const p = (key: string, value: string, enabled = true): Param => ({
  key,
  value,
  enabled,
});

describe("parseUrl", () => {
  it("returns empty for blank input", () => {
    expect(parseUrl("  ")).toEqual({ base: "", params: [] });
  });

  it("splits a full URL into base + params", () => {
    const res = parseUrl("https://api.example.com/x?page=1&limit=20");
    expect(res.base).toBe("https://api.example.com/x");
    expect(res.params).toEqual([
      p("page", "1"),
      p("limit", "20"),
    ]);
  });

  it("treats a URL with no query string as base only", () => {
    expect(parseUrl("https://example.com/path")).toEqual({
      base: "https://example.com/path",
      params: [],
    });
  });

  it("parses a bare query string with no base", () => {
    const res = parseUrl("a=1&b=2");
    expect(res.base).toBe("");
    expect(res.params).toEqual([p("a", "1"), p("b", "2")]);
  });

  it("percent-decodes keys and values, and + as space", () => {
    const res = parseUrl("?q=hola+mundo&city=Bogot%C3%A1");
    expect(res.params).toEqual([p("q", "hola mundo"), p("city", "Bogotá")]);
  });

  it("handles a key without a value", () => {
    const res = parseUrl("?flag");
    expect(res.params).toEqual([p("flag", "")]);
  });

  it("keeps malformed percent-escapes verbatim instead of throwing", () => {
    const res = parseUrl("?bad=%E0%A4%A");
    expect(res.params[0].value).toBe("%E0%A4%A");
  });
});

describe("buildQuery", () => {
  it("percent-encodes keys and values", () => {
    expect(buildQuery([p("q", "hola mundo")], false)).toBe("q=hola%20mundo");
    expect(buildQuery([p("a b", "c&d")], false)).toBe("a%20b=c%26d");
  });

  it("skips disabled and empty-key params", () => {
    expect(
      buildQuery([p("a", "1"), p("b", "2", false), p("", "3")], false)
    ).toBe("a=1");
  });

  it("sorts keys alphabetically when asked", () => {
    expect(buildQuery([p("z", "1"), p("a", "2")], true)).toBe("a=2&z=1");
    // and preserves insertion order when not sorting
    expect(buildQuery([p("z", "1"), p("a", "2")], false)).toBe("z=1&a=2");
  });
});

describe("buildUrl", () => {
  it("joins base and query", () => {
    expect(buildUrl("https://x.dev", [p("a", "1")], false)).toBe(
      "https://x.dev?a=1"
    );
  });

  it("returns a leading-? query when there is no base", () => {
    expect(buildUrl("", [p("a", "1")], false)).toBe("?a=1");
  });

  it("returns the bare base when there are no active params", () => {
    expect(buildUrl("https://x.dev", [], false)).toBe("https://x.dev");
  });
});

describe("exportAs", () => {
  const url = "https://api.example.com/x?a=1";

  it("emits a curl command", () => {
    expect(exportAs("curl", url)).toBe(`curl "${url}"`);
  });

  it("emits a fetch snippet", () => {
    const out = exportAs("fetch", url);
    expect(out).toContain(`fetch("${url}")`);
    expect(out).toContain("await res.json()");
  });

  it("emits a Python requests snippet", () => {
    const out = exportAs("python", url);
    expect(out).toContain("import requests");
    expect(out).toContain(`requests.get("${url}")`);
  });

  it("emits a Node axios snippet", () => {
    const out = exportAs("node", url);
    expect(out).toContain("axios");
    expect(out).toContain(`axios.get("${url}")`);
  });

  it("falls back to a placeholder URL when given an empty string", () => {
    expect(exportAs("curl", "")).toContain("https://api.ejemplo.com/recurso");
  });
});
