import { describe, it, expect } from "vitest";
import {
  encodeBase64,
  decodeBase64,
  bytesToBase64,
  base64ToBytes,
} from "@/lib/base64";

describe("encodeBase64 / decodeBase64", () => {
  it("round-trips plain ascii", () => {
    const enc = encodeBase64("hello");
    expect(enc).toBe("aGVsbG8=");
    expect(decodeBase64(enc)).toEqual({ ok: true, output: "hello" });
  });

  it("round-trips accents and emoji (UTF-8, not Latin-1)", () => {
    const enc = encodeBase64("áéí 🚀");
    expect(decodeBase64(enc)).toEqual({ ok: true, output: "áéí 🚀" });
  });

  it("encodes empty string to empty string", () => {
    expect(encodeBase64("")).toBe("");
  });

  it("decodes empty / whitespace-only input to empty string", () => {
    expect(decodeBase64("")).toEqual({ ok: true, output: "" });
    expect(decodeBase64("   \n  ")).toEqual({ ok: true, output: "" });
  });

  it("accepts URL-safe alphabet (- and _)", () => {
    // Bytes 0xFB 0xFF -> standard "+/8=", url-safe "-_8"
    const standard = bytesToBase64(new Uint8Array([0xfb, 0xff]));
    expect(standard).toBe("+/8=");
    const urlSafe = standard.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    expect(urlSafe).toBe("-_8");
    const res = base64ToBytes(urlSafe);
    expect(res.ok).toBe(true);
    if (res.ok) expect([...res.bytes]).toEqual([0xfb, 0xff]);
  });

  it("tolerates missing padding", () => {
    // "aGVsbG8=" without the trailing "=" pad
    expect(decodeBase64("aGVsbG8")).toEqual({ ok: true, output: "hello" });
  });

  it("tolerates interior whitespace and newlines", () => {
    expect(decodeBase64("aG Vs\nbG8=")).toEqual({ ok: true, output: "hello" });
  });

  it("rejects characters outside the Base64 alphabet", () => {
    const res = decodeBase64("@@@not base64@@@!");
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toMatch(/no son válidos/i);
  });

  it("rejects a Base64 whose length is impossible (pad === 1)", () => {
    const res = base64ToBytes("abcde"); // length 5 -> len % 4 === 1
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toMatch(/incompleto/i);
  });

  it("reports binary (non-UTF-8) content instead of throwing", () => {
    const b64 = bytesToBase64(new Uint8Array([0xff])); // 0xFF is not valid UTF-8
    const res = decodeBase64(b64);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toMatch(/UTF-8/);
  });
});

describe("bytesToBase64 / base64ToBytes", () => {
  it("round-trips arbitrary bytes", () => {
    const bytes = new Uint8Array([0, 1, 2, 250, 255, 128, 72, 105]);
    const b64 = bytesToBase64(bytes);
    const back = base64ToBytes(b64);
    expect(back.ok).toBe(true);
    if (back.ok) expect([...back.bytes]).toEqual([...bytes]);
  });

  it("encodes a known value", () => {
    expect(bytesToBase64(new Uint8Array([72, 105]))).toBe("SGk=");
  });

  it("decodes empty input to zero-length array", () => {
    const res = base64ToBytes("");
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.bytes.length).toBe(0);
  });
});
