import { describe, it, expect, vi, afterEach } from "vitest";
import { decodeJwt } from "@/lib/jwt";

/** base64url-encode a JS value as a JWT segment (no padding). */
function seg(obj: unknown): string {
  const json = JSON.stringify(obj);
  const b64 = Buffer.from(json, "utf-8").toString("base64");
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function makeJwt(header: unknown, payload: unknown, sig = "signature"): string {
  return `${seg(header)}.${seg(payload)}.${sig}`;
}

afterEach(() => {
  vi.useRealTimers();
});

describe("decodeJwt structure", () => {
  it("errors (empty) on blank input", () => {
    expect(decodeJwt("   ")).toEqual({ ok: false, error: "" });
  });

  it("requires exactly three dot-separated parts", () => {
    const res = decodeJwt("only.two");
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toMatch(/tres partes/);
  });

  it("decodes header and payload from base64url", () => {
    const token = makeJwt(
      { alg: "HS256", typ: "JWT" },
      { sub: "1234", name: "Ada" }
    );
    const res = decodeJwt(token);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.header).toEqual({ alg: "HS256", typ: "JWT" });
      expect(res.payload).toEqual({ sub: "1234", name: "Ada" });
      expect(res.signature).toBe("signature");
      expect(res.headerText).toBe(JSON.stringify({ alg: "HS256", typ: "JWT" }, null, 2));
    }
  });

  it("errors when the header segment is not valid base64url JSON", () => {
    const res = decodeJwt("!!!notjson.payload.sig");
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toMatch(/cabecera/);
  });

  it("errors when the payload segment is not valid base64url JSON", () => {
    const good = seg({ alg: "HS256" });
    const res = decodeJwt(`${good}.$$$notjson.sig`);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toMatch(/payload/);
  });

  it("surfaces iss / sub / aud string claims", () => {
    const token = makeJwt(
      { alg: "none" },
      { iss: "openutils", sub: "user-1", aud: "web" }
    );
    const res = decodeJwt(token);
    expect(res.ok).toBe(true);
    if (res.ok) {
      const byKey = Object.fromEntries(res.claims.map((c) => [c.key, c.value]));
      expect(byKey["Emisor (iss)"]).toBe("openutils");
      expect(byKey["Sujeto (sub)"]).toBe("user-1");
      expect(byKey["Audiencia (aud)"]).toBe("web");
    }
  });
});

describe("decodeJwt time claims", () => {
  it("marks an expired token as 'caducado'", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-19T00:00:00Z"));
    const exp = Math.floor(new Date("2020-01-01T00:00:00Z").getTime() / 1000);
    const iat = Math.floor(new Date("2019-12-31T00:00:00Z").getTime() / 1000);
    const res = decodeJwt(makeJwt({ alg: "HS256" }, { exp, iat }));
    expect(res.ok).toBe(true);
    if (res.ok) {
      const expClaim = res.claims.find((c) => c.key === "Expira");
      expect(expClaim?.note).toBe("caducado");
      expect(expClaim?.value).toBe("2020-01-01T00:00:00.000Z");
      const iatClaim = res.claims.find((c) => c.key === "Emitido (iat)");
      expect(iatClaim?.note).toBeUndefined();
    }
  });

  it("does not mark a future expiry as expired", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-19T00:00:00Z"));
    const exp = Math.floor(new Date("2030-01-01T00:00:00Z").getTime() / 1000);
    const res = decodeJwt(makeJwt({ alg: "HS256" }, { exp }));
    expect(res.ok).toBe(true);
    if (res.ok) {
      const expClaim = res.claims.find((c) => c.key === "Expira");
      expect(expClaim?.note).toBeUndefined();
    }
  });

  it("ignores non-numeric time claims", () => {
    const res = decodeJwt(makeJwt({ alg: "HS256" }, { exp: "soon" }));
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.claims.find((c) => c.key === "Expira")).toBeUndefined();
    }
  });
});
