# 02 · Componentes y patrones de UI

Dos niveles:

- **Primitivos `.ou-*`** — clases CSS reutilizables definidas en [`globals.css`](../src/app/globals.css).
  Son la identidad CSS compartida. Compón con utilidades de Tailwind encima.
- **Patrones compuestos** — combinaciones recurrentes (headers, dropzones, modales…) que no
  son una clase pero **sí** son convención. Cópialos tal cual.

---

## Primitivos `.ou-*`

### `.ou-card` / `.ou-card-interactive`

Superficie base. `card` es estática; `card-interactive` aclara el borde y el fondo en hover
(para tiles clicables). Radio `card` (12px), borde 1px `border`, fondo `surface`.

```tsx
<div className="ou-card p-4">…</div>
<Link className="ou-card-interactive p-6">…</Link>   // hover → surface-hover + border-strong
```

### `.ou-label`

Micro-label en mayúsculas sobre secciones/inputs. `0.6875rem`, `600`, `tracking .08em`,
`uppercase`, color `foreground-subtle`.

```tsx
<p className="ou-label">Entrada</p>
```

> Excepción histórica: las herramientas Unificar/Separar y los conversores usan a veces un label
> propio `text-sm font-medium text-foreground-muted uppercase tracking-wider` para las columnas
> ENTRADA/SALIDA. Ambos son válidos; para labels nuevos prefiere `.ou-label`.

### Botones — `.ou-btn` + variante

`.ou-btn` da la forma (inline-flex, gap, `h-2.5rem`, `rounded-control`, transición). Añade una variante:

| Variante | Aspecto | Uso |
| --- | --- | --- |
| `.ou-btn-primary` | fondo `foreground` (casi blanco), texto negro | acción principal neutra |
| `.ou-btn-accent` | fondo `accent` azul, texto blanco | acción principal destacada (Separar, Descargar zip) |
| `.ou-btn-secondary` | fondo `surface-strong`, borde | acción secundaria |
| `.ou-btn-ghost` | transparente, hover sutil | acción terciaria |

```tsx
<button className="ou-btn ou-btn-accent w-full h-11">Separar PDF</button>
<button className="ou-btn ou-btn-secondary px-5 h-11"><ArrowLeft className="w-4 h-4"/> Editar</button>
```

`:disabled` → `opacity .5` + `cursor-not-allowed` automáticamente.

### `.ou-pill`

Chip redondeado clicable (toggles, filtros). `rounded-full`, borde, fondo alfa sutil.

```tsx
<button className="ou-pill"><Trash2 className="w-3.5 h-3.5"/> Empezar de nuevo</button>
```

### `.ou-badge`

Etiqueta de estado **no** interactiva. `rounded-full`, `text-[0.6875rem]`, borde 1px.

```tsx
<span className="ou-badge"><Sparkles className="w-3 h-3"/> Próximamente</span>
```

### `.ou-dropzone`

Well de subida con borde punteado. Estados por atributo:

```tsx
<div className="ou-dropzone …" data-dragging={isDragging}>…</div>
```

`hover` → borde `gray-500` + fondo `surface`; `[data-dragging="true"]` → borde `accent` +
fondo `accent-subtle`. (Varias herramientas implementan el dropzone "a mano" con
`border-2 border-dashed border-border` para tener más control de estados file/error — ver patrón abajo.)

### `.ou-hairline-top`

Pseudo-línea degradada de 1px en el borde superior (para modales/heroes). Requiere `position: relative`.

---

## Patrones compuestos (convenciones)

### Header de herramienta

Centrado: **ícono + título `text-4xl` + botón reload**. Idéntico entre conversores.

```tsx
<motion.div initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}}
  className="flex items-center justify-center space-x-4">
  <Layers className="w-7 h-7 text-foreground-muted" />
  <h1 className="text-4xl font-semibold tracking-tight text-foreground">Unificador PDF</h1>
  <button onClick={/* toggle a la contraparte */}
    className="p-2 rounded-full hover:bg-surface-strong transition-colors text-foreground-muted hover:text-foreground">
    <RefreshCw className="w-6 h-6 transition-transform duration-500" />
  </button>
</motion.div>
```

El botón reload de la derecha cambia a la **herramienta contraparte** (ver [06](06-tools-and-patterns.md)).

### Ícono-well (cuadro de ícono)

Cuadro redondeado con ícono tintado; escala en hover del grupo.

```tsx
<div className="w-11 h-11 rounded-control border border-border bg-surface-strong
                flex items-center justify-center group-hover:scale-105 transition-transform"
     style={{ color: accent }}>
  <Icon className="w-5 h-5" />
</div>
```

Tamaños: `w-11 h-11` (11=44px) normal · `w-14 h-14` hero · `w-16 h-16` en estados vacíos.

### Dropzone (versión "a mano" con estados)

```tsx
<div onDragOver=… onDragLeave=… onDrop=… onClick={()=>inputRef.current?.click()}
  className={cn(
    "group relative flex-1 flex flex-col items-center justify-center gap-5",
    "border-2 border-dashed rounded-panel transition-all min-h-[420px] p-8 text-center cursor-pointer",
    isDragging ? "border-white bg-surface"
               : "border-border bg-surface/50 hover:border-border-strong hover:bg-surface"
  )}>
  <div className="w-16 h-16 rounded-full bg-surface-strong flex items-center justify-center
                  group-hover:scale-110 transition-transform duration-300">
    <UploadCloud className="w-8 h-8 text-foreground-muted" />
  </div>
  <div>
    <p className="text-lg font-medium text-foreground">Suelta tu PDF aquí</p>
    <p className="text-sm text-foreground-subtle mt-1">o haz clic para seleccionarlo</p>
  </div>
  <div className="text-xs text-foreground-faint mt-2 flex items-center gap-2">
    <FileText className="w-4 h-4" /> Solo PDF · máx. 100MB
  </div>
  <input type="file" ref={inputRef} className="hidden" />
</div>
```

### Panel "esperando" (estado vacío de salida)

```tsx
<div className="relative flex-1 flex flex-col items-center justify-center border border-border
                rounded-panel min-h-[420px] bg-background/50 text-center px-8">
  <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mb-4 border border-border">
    <PackageIcon className="w-8 h-8 text-foreground-faint" />
  </div>
  <p className="text-sm font-medium text-foreground-subtle">Esperando un PDF</p>
  <p className="text-xs text-foreground-faint mt-1 max-w-[240px]">Al cargarlo…</p>
</div>
```

### Layout ENTRADA / SALIDA

Los conversores basados en dos paneles usan un grid de 2 columnas con label arriba de cada una:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
  <motion.div initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} transition={{delay:0.1}}
    className="flex flex-col h-full">
    <label className="text-sm font-medium text-foreground-muted uppercase tracking-wider mb-3 ml-1">Entrada</label>
    {/* dropzone */}
  </motion.div>
  <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} transition={{delay:0.2}}
    className="flex flex-col h-full">
    <label className="…">Salida</label>
    {/* panel de resultado / esperando */}
  </motion.div>
</div>
```

### Modal de error

Backdrop con blur + card centrada. Ícono en well, título, mensaje y una **sugerencia** en un well interno.

```tsx
<AnimatePresence>{error && (
  <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
    onClick={()=>setError(null)}
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
    <motion.div initial={{opacity:0,scale:.96,y:12}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:.96,y:12}}
      onClick={(e)=>e.stopPropagation()} className="ou-card w-full max-w-md p-6">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-control bg-error/10 flex items-center justify-center shrink-0">
          <AlertCircle className="w-5 h-5 text-error-text" />
        </div>
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-foreground mb-1.5">{error.title}</h3>
          <p className="text-sm text-foreground-subtle leading-relaxed mb-4">{error.message}</p>
          <div className="bg-background-elevated rounded-control p-3 border border-border">
            <p className="ou-label mb-1">Sugerencia</p>
            <p className="text-sm text-foreground-muted">{error.suggestion}</p>
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <button onClick={()=>setError(null)} className="ou-btn ou-btn-primary">Entendido</button>
      </div>
    </motion.div>
  </motion.div>
)}</AnimatePresence>
```

**Convención de errores:** cada error es `{ title, message, suggestion }`. Siempre da una sugerencia accionable.

### Segmented control (selector de opciones)

Grupo de opciones en un contenedor con fondo hundido; la activa se ilumina.

```tsx
<div className="grid grid-cols-3 gap-1 p-1 rounded-control bg-background-elevated border border-border">
  {options.map(o => (
    <button className={cn("flex flex-col items-center gap-1 py-1.5 rounded-md text-[11px] font-medium transition-colors",
      active ? "bg-surface-strong text-foreground" : "text-foreground-faint hover:text-foreground-muted")}>
      <o.icon className="w-4 h-4" /> {o.label}
    </button>
  ))}
</div>
```

### Fila de resultado / descarga

```tsx
<div className="flex items-center gap-2.5 rounded-control bg-background-elevated border border-border px-3 py-2">
  <FileText className="w-4 h-4 text-foreground-faint shrink-0" />
  <span className="text-xs text-foreground-muted truncate flex-1">{file.name}</span>
  <button className="p-1.5 rounded-md text-foreground-faint hover:text-foreground hover:bg-surface-strong transition-colors">
    <Download className="w-4 h-4" />
  </button>
</div>
```

### Spinner

```tsx
<div className="w-12 h-12 border-[3px] border-surface-strong border-t-accent rounded-full animate-spin" />
```

Variantes: track `border-surface-strong`, punta `border-t-accent` (o `border-t-white` en superficies claras).

---

## Iconografía

- **Librería:** `lucide-react`. Tamaños: `w-4 h-4` (inline/botón), `w-5 h-5` (nav/acciones),
  `w-6 h-6` (toggles), `w-7 h-7` (header), `w-8 h-8` (wells de estado vacío).
- **Íconos de conversión = formato destino** (ver [04](04-app-shell-sidebar.md)):
  PDF→IMG = `Image`, IMG→PDF = `FileText`, Video→GIF = `ImagePlay`, GIF→Video = `Video`,
  Unificador = `Layers`, Separador = `Scissors`.
- `<img>` para previews locales necesita `{/* eslint-disable-next-line @next/next/no-img-element */}`
  (son blobs/dataURLs, no assets de Next).

## Convenciones de tamaño (resumen)

| Elemento | Tamaño |
| --- | --- |
| Alto de botón | `h-10` (ou-btn) / `h-11` en CTAs de herramienta |
| Ícono-well pequeño | `w-10 h-10` / `w-11 h-11` |
| Ícono-well estado vacío | `w-16 h-16` |
| Dropzone / panel | `min-h-[420px]` (2 columnas) |
| Ancho contenedor herramienta | `max-w-4xl` (estado simple) · `max-w-6xl` (editor ancho) |
| Gap de grid | `gap-4` (bento) · `gap-6`/`gap-8` (columnas) |
