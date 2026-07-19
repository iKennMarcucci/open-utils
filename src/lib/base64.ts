/**
 * Base64 encode/decode, UTF-8 safe and done entirely in the browser.
 *
 * `btoa`/`atob` only speak Latin-1, so passing them a string with accents or
 * emoji corrupts the bytes. We go through `TextEncoder`/`TextDecoder` so that
 * "áéí 🚀" survives a round trip intact — that is the single most common way a
 * naive Base64 tool gets it wrong.
 */

export type DecodeResult =
  | { ok: true; output: string }
  | { ok: false; error: string };

export type BytesResult =
  | { ok: true; bytes: Uint8Array }
  | { ok: false; error: string };

/** Raw bytes → Base64 (standard alphabet, with padding). Works for any file. */
export function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  // Chunk to avoid blowing the argument limit of String.fromCharCode on big inputs.
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(binary);
}

/** Text → Base64 (standard alphabet, with padding). */
export function encodeBase64(text: string): string {
  if (!text) return "";
  return bytesToBase64(new TextEncoder().encode(text));
}

/** Base64 → raw bytes. Accepts standard and URL-safe alphabets. */
export function base64ToBytes(input: string): BytesResult {
  const trimmed = input.trim();
  if (!trimmed) return { ok: true, bytes: new Uint8Array(0) };

  let normalized = trimmed.replace(/-/g, "+").replace(/_/g, "/").replace(/\s+/g, "");
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(normalized)) {
    return {
      ok: false,
      error:
        "El texto contiene caracteres que no son válidos en Base64. Solo se admiten letras, números y los símbolos + / - _ (y = al final).",
    };
  }
  const pad = normalized.length % 4;
  if (pad === 1) return { ok: false, error: "La longitud del Base64 es incorrecta: está incompleto." };
  if (pad) normalized += "=".repeat(4 - pad);

  try {
    const binary = atob(normalized);
    return { ok: true, bytes: Uint8Array.from(binary, (c) => c.charCodeAt(0)) };
  } catch {
    return { ok: false, error: "No se pudo decodificar el Base64." };
  }
}

/**
 * Base64 → text. Accepts both the standard (`+` `/`) and URL-safe (`-` `_`)
 * alphabets, tolerates surrounding whitespace/newlines and missing padding, and
 * decodes the bytes as UTF-8. Returns a friendly reason instead of throwing.
 */
export function decodeBase64(input: string): DecodeResult {
  const res = base64ToBytes(input);
  if (!res.ok) return { ok: false, error: res.error };
  try {
    const output = new TextDecoder("utf-8", { fatal: true }).decode(res.bytes);
    return { ok: true, output };
  } catch {
    return {
      ok: false,
      error:
        "El contenido decodificado no es texto UTF-8 válido. Puede que estos datos sean un archivo binario (una imagen, un PDF…) y no texto. Usa «Descargar como archivo» para guardarlo.",
    };
  }
}
