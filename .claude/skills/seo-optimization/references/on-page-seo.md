# On-Page SEO

Optimización de cada página individual: lo que Google lee para entender el tema y
lo que el usuario ve en los resultados. Usa `assets/meta-tags.template.html` como
punto de partida.

## Tabla de contenidos
1. Title tag
2. Meta description
3. Encabezados (H1-H6)
4. Contenido y keywords
5. Enlazado interno
6. Imágenes
7. Open Graph y Twitter Cards
8. Otras meta etiquetas del head

## 1. Title tag

El factor on-page más importante. Aparece en la pestaña y (a veces) como título
del resultado.

- **Longitud**: 50-60 caracteres (~600px). Más largo se trunca con "…".
- **Keyword principal cerca del inicio**.
- **Único por página**. Duplicados = señal de baja calidad.
- **Marca al final**, separada por `|` o `–`: `Zapatillas running mujer | Marca`.
- Escríbelo para el humano: debe dar ganas de hacer click, no ser solo keywords.
- Google puede reescribirlo si no le convence; un buen title reduce esa
  probabilidad.

```html
<title>Guía de SEO técnico 2026: rastreo, indexación y Core Web Vitals | Marca</title>
```

## 2. Meta description

No es factor de ranking directo, pero influye en el CTR (que sí importa).

- **Longitud**: 140-160 caracteres.
- Resume el valor de la página + incluye la keyword de forma natural (se resalta
  en negrita si coincide con la búsqueda).
- Termina con una llamada a la acción cuando aplique.
- Única por página. Si falta, Google genera un snippet del contenido.

```html
<meta name="description" content="Aprende SEO técnico paso a paso: cómo optimizar el rastreo, la indexación y los Core Web Vitals de tu web. Guía práctica con ejemplos de código.">
```

## 3. Encabezados (H1-H6)

Estructuran el contenido para usuarios y buscadores.

- **Un único `<h1>`** por página, que describa el tema principal (suele alinearse
  con el title pero puede ser más largo/natural).
- Jerarquía lógica y anidada: H2 para secciones, H3 para subsecciones. No saltes
  niveles (no pases de H2 a H4).
- No uses encabezados solo por estilo visual; para tamaño usa CSS.
- Incluye keywords secundarias y variantes semánticas de forma natural en H2/H3.

## 4. Contenido y keywords

- Escribe para **satisfacer la intención de búsqueda**, no para una densidad de
  keyword. Ver `content-seo.md`.
- Cubre el tema en profundidad y responde las preguntas relacionadas (mira
  "People Also Ask" y "búsquedas relacionadas").
- Usa **variantes y sinónimos** (entidades, términos relacionados), no repitas la
  misma keyword exacta: Google entiende semántica, no cuenta ocurrencias.
- **Nada de keyword stuffing**: perjudica.
- Contenido escaneable: párrafos cortos, listas, tablas, negritas puntuales.
- **Frescura**: actualiza contenido que envejece (año en el título, datos, etc.).

## 5. Enlazado interno

Subestimado y de altísimo impacto. Distribuye "autoridad" y ayuda al rastreo y a
la comprensión temática.

- Enlaza de forma **contextual** dentro del contenido hacia páginas relacionadas.
- **Anchor text descriptivo**: usa texto que describa el destino ("guía de SEO
  técnico"), no "haz click aquí".
- Enlaza páginas nuevas desde páginas ya indexadas para acelerar su descubrimiento.
- Construye clusters: la página pilar enlaza a las de apoyo y viceversa.
- Evita páginas huérfanas (sin enlaces internos entrantes).
- No abuses: cientos de enlaces en una página diluyen el valor.

## 6. Imágenes

Afectan a accesibilidad, Core Web Vitals y a Google Imágenes.

- **`alt` descriptivo**: describe la imagen; incluye keyword solo si es natural.
  Imágenes decorativas: `alt=""`.
- **Formato moderno**: WebP o AVIF en vez de JPG/PNG pesados.
- **`width` y `height` explícitos** (o `aspect-ratio`) para evitar CLS.
- **`loading="lazy"`** en imágenes below-the-fold. La imagen LCP (hero) NO debe
  ser lazy; considera `fetchpriority="high"` y `preload`.
- Nombres de archivo descriptivos: `zapatillas-running-azul.webp`, no `IMG_9281.jpg`.
- `srcset`/`sizes` para servir el tamaño adecuado a cada dispositivo.

```html
<img src="/img/seo-tecnico.webp" alt="Diagrama del proceso de rastreo de Googlebot"
     width="1200" height="630" loading="lazy" decoding="async">
```

## 7. Open Graph y Twitter Cards

No afectan al ranking, pero controlan cómo se ve el enlace al compartirse (redes,
chats). El CTR social alimenta tráfico y señales indirectas.

```html
<!-- Open Graph -->
<meta property="og:type" content="article">
<meta property="og:title" content="Título para compartir">
<meta property="og:description" content="Descripción atractiva para redes.">
<meta property="og:image" content="https://dominio.com/img/og-image.jpg">
<meta property="og:url" content="https://dominio.com/pagina">
<meta property="og:site_name" content="Marca">

<!-- Twitter / X -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Título para compartir">
<meta name="twitter:description" content="Descripción atractiva.">
<meta name="twitter:image" content="https://dominio.com/img/og-image.jpg">
```

- Imagen OG recomendada: **1200×630 px**.
- Cada página con su OG único (title, description, image, url).

## 8. Otras meta etiquetas del head

```html
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="canonical" href="https://dominio.com/pagina">
<html lang="es">  <!-- idioma del contenido -->
```

- `viewport` es imprescindible para mobile-first.
- `lang` en `<html>` ayuda a Google y a la accesibilidad.
- NO uses `<meta name="keywords">`: Google lo ignora desde hace años.
- Evita metaetiquetas obsoletas o redundantes que solo añaden peso.
