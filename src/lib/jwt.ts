/**
 * JWT *decoder* — not a verifier.
 *
 * A JWT is three base64url segments joined by dots: header.payload.signature.
 * The header and payload are just base64url-encoded JSON; anyone can read them
 * without any key. This decodes those two and surfaces the standard time claims
 * in a human-readable form. It deliberately does NOT verify the signature: that
 * needs the secret/public key and belongs on a server, and pretending to verify
 * client-side would be worse than not verifying at all.
 */

export type JwtClaim = { key: string; value: string; note?: string };

export type JwtResult =
  | {
      ok: true;
      header: Record<string, unknown>;
      payload: Record<string, unknown>;
      headerText: string;
      payloadText: string;
      signature: string;
      claims: JwtClaim[];
    }
  | { ok: false; error: string };

function base64UrlToJson(segment: string): Record<string, unknown> {
  let s = segment.replace(/-/g, "+").replace(/_/g, "/");
  const pad = s.length % 4;
  if (pad) s += "=".repeat(4 - pad);
  const binary = atob(s);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  return JSON.parse(text);
}

const TIME_CLAIMS: Record<string, string> = {
  exp: "Expira",
  iat: "Emitido (iat)",
  nbf: "No válido antes (nbf)",
};

function formatTimeClaim(seconds: number): string {
  const date = new Date(seconds * 1000);
  const iso = date.toISOString();
  return iso;
}

export function decodeJwt(token: string): JwtResult {
  const trimmed = token.trim();
  if (!trimmed) return { ok: false, error: "" };

  const parts = trimmed.split(".");
  if (parts.length !== 3) {
    return {
      ok: false,
      error:
        "Un JWT válido tiene tres partes separadas por puntos (header.payload.signature). Esta cadena no las tiene.",
    };
  }

  let header: Record<string, unknown>;
  let payload: Record<string, unknown>;
  try {
    header = base64UrlToJson(parts[0]);
  } catch {
    return { ok: false, error: "No se pudo decodificar la cabecera (header): no es Base64URL de un JSON válido." };
  }
  try {
    payload = base64UrlToJson(parts[1]);
  } catch {
    return { ok: false, error: "No se pudo decodificar el contenido (payload): no es Base64URL de un JSON válido." };
  }

  const claims: JwtClaim[] = [];
  for (const [key, label] of Object.entries(TIME_CLAIMS)) {
    const raw = payload[key];
    if (typeof raw === "number") {
      const when = formatTimeClaim(raw);
      const isExp = key === "exp";
      const expired = isExp && raw * 1000 < Date.now();
      claims.push({
        key: label,
        value: when,
        note: expired ? "caducado" : undefined,
      });
    }
  }
  if (typeof payload.iss === "string") claims.push({ key: "Emisor (iss)", value: payload.iss });
  if (typeof payload.sub === "string") claims.push({ key: "Sujeto (sub)", value: payload.sub });
  if (typeof payload.aud === "string") claims.push({ key: "Audiencia (aud)", value: payload.aud });

  return {
    ok: true,
    header,
    payload,
    headerText: JSON.stringify(header, null, 2),
    payloadText: JSON.stringify(payload, null, 2),
    signature: parts[2],
    claims,
  };
}
