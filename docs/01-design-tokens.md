# 01 · Design Tokens

Todos los tokens viven en [`src/app/globals.css`](../src/app/globals.css). Hay **tres capas**:

1. **Escala cruda Geist** (`--ds-*`) — los valores primitivos. Rara vez se usan directo.
2. **Tokens semánticos** (`--background`, `--surface`, `--foreground`, `--accent`…) — apuntan a la escala cruda y expresan _intención_.
3. **Mapeo a Tailwind** (`@theme inline`) — expone los semánticos como utilidades (`bg-surface`, `text-foreground-muted`, `rounded-card`…).

> **Siempre usa la capa semántica** (utilidades de Tailwind o `var(--token)`). Solo baja a
> `--ds-*` para acentos puntuales (p. ej. el color de una categoría del Bento).

Tema **dark-only**: todos los tokens están definidos para fondo oscuro. No hay variantes claras.

---

## Colores

### Escala de grises Geist (cruda)

| Token | Hex | Uso típico |
| --- | --- | --- |
| `--ds-gray-100` | `#1a1a1a` | — |
| `--ds-gray-200` | `#1f1f1f` | — |
| `--ds-gray-300` | `#292929` | thumb de scrollbar |
| `--ds-gray-400` | `#2e2e2e` | — |
| `--ds-gray-500` | `#454545` | hover de scrollbar / borde dropzone hover |
| `--ds-gray-600` | `#6b6b6b` | → `foreground-faint` |
| `--ds-gray-700` | `#7d7d7d` | → `foreground-subtle` |
| `--ds-gray-800` | `#a1a1a1` | → `foreground-muted` |
| `--ds-gray-900` | `#b8b8b8` | — |
| `--ds-gray-1000` | `#ededed` | → `foreground` (texto principal) |

**Grises alfa** (para bordes/overlays sobre cualquier superficie):

| Token | Valor |
| --- | --- |
| `--ds-gray-alpha-100` | `rgba(255,255,255,.06)` |
| `--ds-gray-alpha-200` | `rgba(255,255,255,.09)` → `border` |
| `--ds-gray-alpha-300` | `rgba(255,255,255,.13)` |
| `--ds-gray-alpha-400` | `rgba(255,255,255,.18)` → `border-strong` |

### Azul (acento primario)

| Token | Hex |
| --- | --- |
| `--ds-blue-700` | `#0070f3` → `accent` |
| `--ds-blue-800` | `#0761d1` → `accent-hover` |
| `--ds-blue-900` | `#0058c4` |
| `--ds-blue-text` | `#52a8ff` → `accent-text` (texto/íconos azules legibles en dark) |
| `--ds-blue-subtle` | `rgba(0,112,243,.12)` → `accent-subtle` (fondos/selección) |
| `--ds-blue-border` | `rgba(0,112,243,.35)` |

### Acentos de categoría (solo para el Bento)

| Token | Hex |
| --- | --- |
| `--ds-purple-600` / `--ds-purple-text` | `#8e4ec6` / `#bf7af0` |
| `--ds-amber-600` / `--ds-amber-text` | `#d97706` / `#f5a623` |
| `--ds-teal-600` / `--ds-teal-text` | `#12a594` / `#3ddbd0` |

### Estado

| Token | Hex |
| --- | --- |
| `--ds-green-600` / `--ds-green-text` | `#16a34a` / `#4ade80` → `success` / `success-text` |
| `--ds-red-600` / `--ds-red-text` | `#e5484d` / `#ff6166` → `error` / `error-text` |

### Tokens semánticos → utilidades de Tailwind

Esto es lo que **debes** usar en el 95% de los casos:

| Semántico | Valor | Utilidades Tailwind |
| --- | --- | --- |
| `background` | `#000000` (canvas) | `bg-background` |
| `background-elevated` | `#0a0a0a` | `bg-background-elevated` |
| `surface` | `#0e0e0e` (cards/paneles) | `bg-surface` |
| `surface-hover` | `#161616` | `bg-surface-hover` |
| `surface-strong` | `#1c1c1c` (wells, thumbnails) | `bg-surface-strong` |
| `border` | alpha-200 | `border-border` |
| `border-strong` | alpha-400 | `border-border-strong` |
| `foreground` | `#ededed` (texto principal) | `text-foreground` |
| `foreground-muted` | `#a1a1a1` | `text-foreground-muted` |
| `foreground-subtle` | `#7d7d7d` | `text-foreground-subtle` |
| `foreground-faint` | `#6b6b6b` | `text-foreground-faint` |
| `accent` | `#0070f3` | `bg-accent` / `text-accent` / `border-accent` |
| `accent-hover` | `#0761d1` | `bg-accent-hover` |
| `accent-foreground` | `#ffffff` | `text-accent-foreground` (texto sobre acento) |
| `accent-text` | `#52a8ff` | `text-accent-text` |
| `accent-subtle` | azul .12 | `bg-accent-subtle` |
| `success` / `success-text` | verde | `bg-success` / `text-success-text` |
| `error` / `error-text` | rojo | `bg-error` / `text-error-text` |

**Acentos de categoría** también expuestos: `bg-cat-blue`, `bg-cat-purple`, `bg-cat-amber`,
`bg-cat-teal` (aunque el Bento suele usar los `--ds-*-text` inline como `style`, ver
[05-bento-grid.md](05-bento-grid.md)).

> **Nota:** las escalas crudas `--ds-*` **no** están expuestas como utilidades. Si necesitas
> una, úsala como `var()`: `style={{ color: "var(--ds-purple-text)" }}` o
> `text-[var(--ds-blue-text)]`.

### Jerarquía de texto (memorízala)

`foreground` (títulos/valores) › `foreground-muted` (texto secundario) ›
`foreground-subtle` (labels, ayudas) › `foreground-faint` (metadatos, placeholders).

### Jerarquía de superficies

`background` (#000, canvas) → `background-elevated` (#0a0a0a, sidebar/dropzone) →
`surface` (#0e0e0e, cards) → `surface-hover` (#161616) → `surface-strong` (#1c1c1c, wells).

---

## Radios

Geist es **ajustado**. Usa siempre estos tokens (expuestos como `rounded-*`):

| Token / utilidad | Valor | Uso |
| --- | --- | --- |
| `rounded-control` | `8px` | botones, inputs, chips, íconos-well pequeños |
| `rounded-card` | `12px` | cards, paquetes |
| `rounded-panel` | `16px` | paneles grandes, dropzones |
| `rounded-hero` | `24px` | tile hero del Bento |
| `rounded-full` | — | pills, badges, avatares/círculos |

No uses `rounded-2xl`, `rounded-3xl` ni valores arbitrarios en px. Para cuadros de ícono
pequeños dentro de un botón/badge sí se usa `rounded-md`/`rounded-lg` puntualmente.

---

## Sombras

| Token | Valor | Uso |
| --- | --- | --- |
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,.4)` | elevación mínima |
| `--shadow-md` | `0 4px 16px rgba(0,0,0,.5)` | popovers/tooltips |
| `--shadow-lg` | `0 12px 40px rgba(0,0,0,.55)` | modales, sidebar flotante |

En clases suele usarse `shadow-lg`/`shadow-2xl` de Tailwind para modales; los tokens `--shadow-*`
están disponibles vía `var()` cuando quieras la sombra exacta del sistema.

---

## Tipografía

- **Sans:** Geist (`--font-geist-sans`, expuesta como `font-sans`).
- **Mono:** Geist Mono (`--font-geist-mono`, `font-mono`) — para tiempos, tamaños, código.
- Cargadas con `next/font/google` en [`layout.tsx`](../src/app/layout.tsx) → **auto-hospedadas**
  (sin request a Google en runtime).
- `-webkit-font-smoothing: antialiased` global.

Escala de tipo usada en la práctica:

| Rol | Clases |
| --- | --- |
| Título de herramienta (h1) | `text-4xl font-semibold tracking-tight text-foreground` |
| Título home (h1) | `text-4xl md:text-5xl font-semibold tracking-tight` |
| Título de sección (h2) | `text-xl font-bold` / `text-lg font-semibold` |
| Título de card Bento | `text-lg` (normal) / `text-2xl md:text-3xl` (hero) |
| Cuerpo | `text-sm` / `text-[15px]` |
| Secundario | `text-sm text-foreground-subtle` |
| Micro-label | primitivo `.ou-label` (ver [02-components.md](02-components.md)) |
| Metadatos | `text-xs text-foreground-faint` |

Pesos: títulos = **`font-semibold`** (600). Evita `font-bold` (700) para h1 — Geist es semibold.

---

## Focus, selección y scrollbar

- **Focus ring global** (accesibilidad Geist): `:focus-visible` → `outline: 2px solid var(--accent); outline-offset: 2px`.
  No lo quites; para elementos con su propio anillo usa `focus-visible:outline-none` y estiliza.
- **Selección de texto:** fondo `accent-subtle`, texto `foreground`.
- **Scrollbar:** 8px, thumb `--ds-gray-300` (hover `--ds-gray-500`). Añade `.custom-scrollbar` a
  contenedores con scroll para el estilo fino consistente.
- **`prefers-reduced-motion`**: se anulan animaciones/transiciones globalmente. Respétalo.
