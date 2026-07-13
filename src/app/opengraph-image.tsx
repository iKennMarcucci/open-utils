import { ImageResponse } from "next/og";

export const alt =
  "Open Utils — utilidades de archivos que funcionan en tu navegador, sin subir nada";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Brand OG card, 1200x630. Rendered by Satori, which only supports flexbox
 * (no CSS grid) and needs explicit `display: flex` on every container.
 */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0a0a0a",
          backgroundImage:
            "radial-gradient(circle at 78% 12%, rgba(0,112,243,0.20), transparent 55%)",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 56,
              height: 56,
              borderRadius: 999,
              background: "#ededed",
              color: "#0a0a0a",
              fontSize: 30,
              fontWeight: 700,
            }}
          >
            {">_"}
          </div>
          <div style={{ display: "flex", fontSize: 30, color: "#ededed", fontWeight: 600 }}>
            Open Utils
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 66,
              lineHeight: 1.1,
              fontWeight: 700,
              color: "#ededed",
              letterSpacing: "-0.02em",
              maxWidth: 940,
            }}
          >
            Utilidades de archivos que no suben nada a ningún servidor
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 26,
              fontSize: 30,
              color: "#a1a1a1",
              maxWidth: 900,
            }}
          >
            Edita, convierte, une y divide PDF, imágenes y video — todo en tu navegador.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {["100% local", "Sin marca de agua", "Gratis", "Open source"].map((chip) => (
            <div
              key={chip}
              style={{
                display: "flex",
                padding: "10px 22px",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.18)",
                background: "rgba(255,255,255,0.06)",
                color: "#ededed",
                fontSize: 24,
              }}
            >
              {chip}
            </div>
          ))}
        </div>
      </div>
    ),
    size
  );
}
