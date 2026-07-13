# SEO local e internacional

Aplica esta referencia si el sitio tiene presencia física local o se dirige a
varios idiomas/países.

## Parte A — SEO internacional (multi-idioma / multi-país)

### hreflang

Le dice a Google qué versión servir según idioma y región. Evita que Google
muestre la versión equivocada o considere el contenido traducido como duplicado.

Reglas:
- Cada versión declara **todas** las alternativas, incluida a sí misma
  (autoreferencial).
- El valor combina idioma (ISO 639-1) y opcionalmente región (ISO 3166-1):
  `es`, `es-ES`, `es-MX`, `en`, `en-US`.
- Añade `x-default` para la versión por defecto (selector de idioma o fallback).
- Las anotaciones deben ser **recíprocas**: si A apunta a B, B debe apuntar a A.
- URLs absolutas.

En el `<head>` de cada página:

```html
<link rel="alternate" hreflang="es-ES" href="https://dominio.com/es/pagina">
<link rel="alternate" hreflang="es-MX" href="https://dominio.com/mx/pagina">
<link rel="alternate" hreflang="en-US" href="https://dominio.com/en/pagina">
<link rel="alternate" hreflang="x-default" href="https://dominio.com/pagina">
```

También puede declararse en el sitemap XML o en cabeceras HTTP (útil para no-HTML).

### Estructura de URLs internacionales

Tres opciones (de mayor a menor señal geográfica y coste):
- **ccTLD**: `dominio.es`, `dominio.mx` — señal geográfica fuerte, más caro/complejo.
- **Subdirectorio**: `dominio.com/es/`, `dominio.com/mx/` — recomendado en general:
  concentra autoridad del dominio y es fácil de gestionar.
- **Subdominio**: `es.dominio.com` — válido pero reparte autoridad.

### Buenas prácticas

- Traduce de verdad (no auto-traducción de baja calidad); adapta a la cultura
  (moneda, formatos, ejemplos locales).
- No mezcles idiomas en una misma página.
- Configura el país objetivo en Search Console si usas dominio genérico.

## Parte B — SEO local

Para negocios con ubicación física o área de servicio (restaurantes, clínicas,
tiendas, servicios locales).

### Google Business Profile (GBP)

La pieza central del SEO local. Es gratis y aparece en Maps y en el "local pack".

- **Reclama y verifica** el perfil.
- **Completa todo**: categoría principal correcta, horarios, teléfono, web, área
  de servicio, atributos, fotos reales y recientes.
- **Reseñas**: consíguelas de forma legítima y **responde a todas**. Volumen,
  frecuencia, valoración y respuestas influyen en el ranking local.
- **Publicaciones y novedades**: mantén el perfil activo.
- **Q&A**: responde las preguntas de usuarios.

### NAP consistente

**N**ame, **A**ddress, **P**hone deben ser **idénticos** en todas partes: web,
GBP, directorios, redes. Las inconsistencias confunden a Google y dañan el ranking
local. Cita el NAP en el pie o página de contacto y márcalo con `LocalBusiness`.

### Señales on-site para local

- **Structured data `LocalBusiness`** (o subtipo: `Restaurant`, `Dentist`,
  `Store`...) con dirección, geo, teléfono y horarios (ver `structured-data.md`).
- **Página por ubicación** si hay varias sedes, cada una con su NAP, mapa
  embebido y contenido único (no plantillas duplicadas).
- **Keywords locales** naturales en títulos, encabezados y contenido
  ("dentista en Cúcuta", "fontanero 24h Madrid").
- **Página de contacto** con dirección, mapa y horarios.

### Citaciones y directorios

Presencia consistente en directorios relevantes (locales, sectoriales, mapas).
Prioriza calidad y consistencia del NAP sobre cantidad.

### Reseñas y reputación

Las reseñas son un factor de ranking local de primer orden y un motor de
conversión. Facilita dejarlas (enlace directo), nunca las compres ni las falsees
(penalización y pérdida de confianza), y responde con profesionalidad tanto a las
positivas como a las negativas.
