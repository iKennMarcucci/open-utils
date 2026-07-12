# 03 · Motion (animación)

## Librería

Usa **`motion/react`** (el paquete Motion moderno, sucesor de framer-motion). Import estándar:

```tsx
import { motion, AnimatePresence, Reorder, type Variants } from "motion/react";
```

> No importes de `framer-motion`. La API es la misma (`motion`, `AnimatePresence`, `Reorder`,
> `layoutId`, variants…), pero el proyecto está estandarizado en `motion/react`.

## Easing y duraciones

- **Easing Geist** (el de todo el proyecto): `cubic-bezier(0.22, 1, 0.36, 1)`.
  En CSS es `var(--ease-geist)`; en Motion se pasa como array `[0.22, 1, 0.36, 1]`.
- **Duraciones** típicas:
  - `0.14–0.2s` — tooltips, fades rápidos, hovers.
  - `0.28–0.3s` — colapso del sidebar, transiciones de layout.
  - `0.4–0.5s` — entradas de contenido, stagger de tarjetas.
- Para físicas puntuales (modales que "entran"): `type: "spring", stiffness: 380, damping: 32`.

## Patrones

### Entrada de elemento

```tsx
<motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} />
```

Columnas ENTRADA/SALIDA entran desde los lados (`x: -20` / `x: 20`) con `delay` escalonado
(0.1 / 0.2). Headers entran desde arriba (`y: -20`).

### Stagger (contenedor + hijos) — el Bento

```tsx
const container: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } } };
const item: Variants = { hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } };

<motion.div variants={container} initial="hidden" animate="show">
  {items.map(i => <motion.div key={i.id} variants={item} />)}
</motion.div>
```

### Hover / tap

```tsx
<motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} />
```

Alternativamente con Tailwind: `group-hover:scale-105 transition-transform` en ícono-wells.

### Mount / unmount

Envuelve en `AnimatePresence` y da `exit`. Para modales usa el backdrop + card (ver
[02-components.md](02-components.md)). Para listas keyea por id.

```tsx
<AnimatePresence>{open && (
  <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} />
)}</AnimatePresence>
```

### Layout animation (indicador activo compartido)

El sidebar mueve la barra de acento activa entre ítems con `layoutId`:

```tsx
{isActive && <motion.span layoutId="sidebar-active"
  className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full bg-accent" />}
```

Todos los ítems comparten el mismo `layoutId` → Motion interpola la posición.

### Colapso del sidebar (importante)

Anima **solo el ancho del `<aside>`** con `initial={false}` y `overflow-hidden`; las etiquetas
se renderizan condicionalmente (no animes `width: auto` en cada hijo — causa jank). Ver
[04-app-shell-sidebar.md](04-app-shell-sidebar.md).

```tsx
<motion.aside initial={false} animate={{ width: isCollapsed ? 72 : 272 }}
  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden …" />
```

## Reglas

- **Anima `transform` y `opacity`**, no `width/height/top/left` de layout salvo casos
  controlados (ancho del sidebar con `overflow-hidden`).
- **`prefers-reduced-motion`** está anulado globalmente en CSS; no dependas de la animación para
  transmitir información esencial.
- Mantén la animación **sutil y rápida**: acompaña la interacción, no la protagoniza.
- Reutiliza el easing Geist en **todo** (CSS `transition` y Motion).
