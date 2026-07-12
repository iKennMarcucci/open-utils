# 04 · App Shell y Sidebar

## App Shell — [`src/app/layout.tsx`](../src/app/layout.tsx)

```tsx
<html className="… antialiased dark">
  <body className="min-h-full bg-background text-foreground">
    <div className="flex h-screen overflow-hidden w-full">
      <Sidebar />
      <div className="flex-1 overflow-y-auto relative">{children}</div>
    </div>
  </body>
</html>
```

- `dark` fijo en `<html>` (tema único). Fuentes Geist via `next/font/google` (auto-hospedadas).
- Layout de dos zonas: **Sidebar** (fijo a la izquierda) + **contenido** scrolleable (`flex-1`).
- **Metadata:** título con template `"%s · Open Utils"` y default `"Open Utils — Fast, local, private utilities"`.

---

## Sidebar — [`src/components/Sidebar.tsx`](../src/components/Sidebar.tsx)

Tres zonas: **marca** (Logo + wordmark), **nav**, **footer**. Ancho: `272px` expandido,
`72px` (`RAIL_WIDTH`) colapsado. Fondo `background-elevated`, borde derecho `border`.

En móvil (`<lg`) el sidebar es un overlay deslizante (`translate-x`) con backdrop; el colapso
solo existe en desktop.

### Marca

`Logo` ([`Logo.tsx`](../src/components/Logo.tsx)) es un **logomark tipo bento**: cuadrado
redondeado `bg-foreground` con un SVG de 4 tiles (eco del grid de la home). Al lado, el wordmark
"Open Utils". Ambos enlazan a `/`.

### Colapso / expansión (animación)

- Anima **solo el ancho del `<aside>`** con `motion` (`initial={false}`, duración `0.28`, easing Geist).
- El `<aside>` tiene `overflow-hidden`; las etiquetas se **renderizan condicionalmente** según
  `isCollapsed` — **no** se anima `width: auto` en cada label (eso causaba jank). Al expandir, el
  ancho creciente revela las etiquetas.
- Ítems colapsados: `justify-center px-0` → **ícono centrado** en el riel de 72px.
- Botón **colapsar** (`PanelLeftClose`) vive en el header (solo expandido).
- Botón **expandir** (`PanelLeftOpen`) aparece en el **footer** cuando está colapsado,
  reemplazando la insignia "100% local" (que muestra `ShieldCheck` cuando está expandido).

### Ítems de navegación

Modelo de cada ítem: `{ id, name, icon, href, matchPath, hasToggle, onToggle?, isFlipped? }`.
El ítem activo (`pathname === matchPath`) usa fondo `surface-hover` + barra de acento con
`layoutId="sidebar-active"`.

Ítems actuales: **Inicio** · **PDF a IMG / IMG a PDF** · **Video a GIF / GIF a Video** ·
**Unificador PDF / Separador PDF**.

### Conversores contraparte (toggle con reload)

Los ítems con `hasToggle: true` tienen un **botón reload** que cambia de funcionalidad sin
navegar (`e.preventDefault()`). El estado del modo vive en el sidebar (`pdfToolMode`,
`videoToolMode`, `pdfOrgMode`) y de él se derivan **nombre, ícono y href**:

```tsx
{
  id: "video-converter",
  name: videoToolMode === "video-to-gif" ? "Video a GIF" : "GIF a Video",
  icon: videoToolMode === "video-to-gif" ? ImagePlay : Video,   // ← ícono = destino
  href: `/video-converter?mode=${videoToolMode}`,
  hasToggle: true,
  onToggle: handleToggleVideoMode,
  isFlipped: videoToolMode === "gif-to-video",   // rota el ícono reload 180°
}
```

### Regla de íconos: **el ícono representa el formato DESTINO**

| Modo | Ícono lucide |
| --- | --- |
| PDF a IMG | `Image` (imagen) |
| IMG a PDF | `FileText` (PDF) |
| Video a GIF | `ImagePlay` (GIF animado) |
| GIF a Video | `Video` |
| Unificador PDF | `Layers` |
| Separador PDF | `Scissors` |

Al pulsar reload cambian **juntos** el texto y el ícono (tanto en el ítem expandido como en el
ícono del riel colapsado, porque ambos usan el mismo `item.icon` derivado del estado).

### Tooltips del riel colapsado (clicables, dos partes)

Cuando el sidebar está colapsado, al hacer hover sobre un ítem aparece un **tooltip flotante**
con dos contenedores:

1. **Texto = `<Link>`** → navega a la herramienta (`href` del ítem) y cierra el tooltip.
2. **Botón reload** (si `hasToggle`) → ejecuta `onToggle`, que **cambia el link del texto a la
   contraparte** (y rota el ícono). No navega.

Detalles de implementación:

- El tooltip se renderiza como **hermano `fixed`** del `<aside>` (no hijo), para no ser recortado
  por el `overflow-hidden` del riel. Posición: `left: RAIL_WIDTH`, `top` = centro del ítem
  (medido con `getBoundingClientRect` al hacer hover).
- **Hover-intent:** al salir del ítem se programa el cierre con un timer de ~120ms; el tooltip
  cancela ese timer con `onMouseEnter`, así puedes moverte del ícono al tooltip sin que se cierre.
  Un `pl-2` en el contenedor hace de puente para que el hover sea continuo.
- El contenido se busca por `id` en `navItems` en cada render → el nombre/href/ícono siempre están
  frescos tras un toggle.

### Footer

- Expandido: insignia `ShieldCheck` verde + "100% local / Nada sale de tu equipo".
- Colapsado: botón expandir (`PanelLeftOpen`).

---

## Reglas al tocar el sidebar

- Un **conversor con dos direcciones** = un solo ítem con `hasToggle` (no dos ítems). Ver
  [06-tools-and-patterns.md](06-tools-and-patterns.md).
- El ícono **siempre** refleja el destino de la conversión.
- No animes el ancho de los labels; renderízalos condicionalmente.
- Tooltip = texto-link + botón reload separados, nunca un `<button>` dentro de un `<a>`.
