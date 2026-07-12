# 05 · Bento Grid (home)

La home ([`src/components/HomeView.tsx`](../src/components/HomeView.tsx)) es un **Bento Grid**
que **reparte las herramientas por categoría**. Es la seña de identidad de Open Utils.

## Estructura

```tsx
<main className="mx-auto w-full max-w-6xl px-6 py-12 md:px-10 md:py-16">
  <header>  {/* badge "100% local · privado" + h1 "Open Utils" + subtítulo */}  </header>
  <motion.div variants={container} initial="hidden" animate="show"
    className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[minmax(190px,auto)]">
    {TOOLS.map(t => <ToolCard key={t.id} tool={t} />)}
    {/* + tile de identidad "Por qué Open Utils" */}
  </motion.div>
</main>
```

- **Grid:** 1 columna en móvil, **3 columnas** en `md+`. Filas `auto-rows-[minmax(190px,auto)]`.
- El tile **hero** ocupa `md:col-span-2 md:row-span-2`; el resto son `1×1`. Con 5 herramientas +
  el tile de identidad, el grid queda **3×3** limpio (sin huecos).
- Entrada con **stagger** (ver [03-motion.md](03-motion.md)).

## Modelo de datos (`Tool`)

```ts
type Tool = {
  id: string;
  title: string;          // "PDF ⇄ IMG", "Unificador PDF", …
  description: string;
  href?: string;          // ausente si soon
  icon: React.ComponentType<{ className?: string }>;
  category: string;       // "Documentos" | "Multimedia" | "Desarrollo"
  accent: string;         // color CSS de la categoría, p. ej. "var(--ds-blue-text)"
  span: string;           // clases de grid, p. ej. "md:col-span-2 md:row-span-2"
  featured?: boolean;     // tile hero
  soon?: boolean;         // "Próximamente" (deshabilitado)
};
```

## Categorías y acentos

| Categoría | Color (`accent`) | Herramientas |
| --- | --- | --- |
| **Documentos** | `var(--ds-blue-text)` (azul) | PDF ⇄ IMG (hero), Unificador PDF, Separador PDF |
| **Multimedia** | `var(--ds-purple-text)` (púrpura) | Video ⇄ GIF |
| **Desarrollo** | `var(--ds-amber-text)` (ámbar) | Formato JSON (soon) |

`teal` (`--ds-teal-text`) está disponible para una categoría futura. El acento se usa **sutil**:
tinte del ícono y un _glow_ radial en hover.

## Anatomía de una tarjeta (`ToolCard`)

- Base: `.ou-card-interactive` (o borde punteado + opacidad si `soon`), `rounded-panel`
  (`rounded-hero` si hero), `min-h-[190px]`.
- **Glow en hover** tintado por la categoría:
  ```tsx
  style={{ background: `radial-gradient(120% 120% at 100% 0%,
           color-mix(in srgb, ${tool.accent} 12%, transparent), transparent 60%)` }}
  ```
- Arriba: **IconWell** (ícono tintado con `accent`) + esquina: flecha `ArrowUpRight` (o badge
  "Próximamente" si `soon`).
- Abajo: **CategoryTag** (punto de color + label en `.ou-label`) + título + descripción.
- Tile `soon`: `border-dashed`, `opacity-70`, sin link.

`CategoryTag`:

```tsx
<span className="inline-flex items-center gap-1.5 ou-label">
  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accent }} />
  {label}
</span>
```

## Tile de identidad

Tras las herramientas hay una `.ou-card` con label "Por qué Open Utils" y 3 _highlights_
(Privado / Instantáneo / Open source), cada uno con ícono-well + texto. Completa el 3×3.

## Cómo agregar una tarjeta al Bento

1. Añade un objeto al array `TOOLS` con `title`, `description`, `href`, `icon` (lucide),
   `category`, `accent` (color de su categoría) y `span`.
2. Verifica que el grid siga cerrando sin huecos (hero 2×2 + N×(1×1) + tile identidad).
   Si sobra/falta una celda, ajusta el `span` del tile de identidad o de la nueva tarjeta.
3. Si la herramienta aún no existe, márcala `soon: true` y omite `href`.
4. Mantén los títulos con el estilo del resto (`⇄` para conversores bidireccionales).
