/**
 * Search keywords for the sidebar tool finder.
 *
 * These live apart from `tools.ts` on purpose. `tools.ts` is the single source
 * of truth for everything that reaches Google — metadata, visible copy and
 * JSON-LD — and every claim in it must be verifiable against the code. These
 * keywords reach none of those: they are an internal, client-side search index
 * so typing "achicar foto" or "minify" finds the right tool. They are NEVER
 * rendered on a page and NEVER emitted in structured data — doing so would be
 * keyword stuffing, which is a manual-action offence.
 *
 * Every tool carries at least 25 terms: Spanish and English, the action and the
 * object, formats, and the colloquial phrasings people actually type.
 */

export const TOOL_KEYWORDS: Record<string, string[]> = {
  "editor-pdf": [
    "editor pdf", "editar pdf", "modificar pdf", "escribir en pdf", "escribir sobre pdf",
    "dibujar en pdf", "firmar pdf", "firma digital", "rellenar formulario pdf", "anotar pdf",
    "resaltar pdf", "subrayar pdf", "marcador pdf", "tachar pdf", "censurar pdf",
    "añadir texto pdf", "agregar imagen pdf", "flechas pdf", "formas pdf", "recuadro pdf",
    "rotar paginas pdf", "reordenar paginas", "eliminar paginas pdf", "pdf editor", "edit pdf",
    "annotate pdf", "sign pdf", "fill pdf form", "markup pdf", "sin marca de agua",
  ],
  "editor-imagen": [
    "editor de imagen", "editar imagen", "editar foto", "retocar foto", "dibujar en imagen",
    "escribir en imagen", "anotar imagen", "anotar captura", "marcar screenshot", "resaltar imagen",
    "recortar imagen", "crop imagen", "cortar foto", "redimensionar imagen", "cambiar tamaño imagen",
    "rotar imagen", "girar foto", "flechas en imagen", "formas en imagen", "censurar imagen",
    "tapar datos foto", "image editor", "edit image", "photo editor", "draw on image",
    "annotate image", "crop image", "resize image", "screenshot markup", "editar png jpg",
  ],
  "pdf-a-imagen": [
    "pdf a imagen", "pdf a jpg", "pdf a png", "pdf a jpeg", "convertir pdf a imagen",
    "exportar pdf como imagen", "pasar pdf a foto", "extraer imagenes pdf", "pdf a foto",
    "capturar paginas pdf", "rasterizar pdf", "convertir paginas pdf", "pdf paginas a png",
    "guardar pdf como jpg", "pdf to image", "pdf to jpg", "pdf to png", "convert pdf",
    "export pdf pages", "pdf converter", "descargar paginas pdf", "imagen desde pdf",
    "convertidor pdf", "pdf en imagenes", "sacar imagen de pdf", "pdf a bitmap",
  ],
  "imagen-a-pdf": [
    "imagen a pdf", "jpg a pdf", "png a pdf", "foto a pdf", "convertir imagen a pdf",
    "varias imagenes a pdf", "multiples fotos pdf", "juntar imagenes en pdf", "crear pdf desde fotos",
    "escanear a pdf", "documento desde fotos", "album pdf", "webp a pdf", "bmp a pdf", "gif a pdf",
    "image to pdf", "jpg to pdf", "png to pdf", "photo to pdf", "images to pdf",
    "convert image", "make pdf", "pasar fotos a pdf", "generar pdf imagenes",
    "convertidor imagen pdf", "unir fotos pdf",
  ],
  "unir-pdf": [
    "unir pdf", "juntar pdf", "combinar pdf", "fusionar pdf", "merge pdf",
    "unir varios pdf", "unir documentos", "concatenar pdf", "pegar pdf", "sumar pdf",
    "un solo pdf", "juntar archivos pdf", "unir pdf e imagenes", "combinar documentos",
    "combine pdf", "join pdf", "merge documents", "append pdf", "unir paginas",
    "agrupar pdf", "consolidar pdf", "mezclar pdf", "unir escaneos", "pdf en uno",
    "ordenar y unir pdf", "unificar pdf",
  ],
  "dividir-pdf": [
    "dividir pdf", "separar pdf", "split pdf", "partir pdf", "cortar pdf",
    "extraer paginas pdf", "sacar paginas pdf", "dividir por paginas", "separar hojas pdf",
    "pdf por partes", "trocear pdf", "recortar pdf paginas", "seleccionar paginas pdf",
    "guardar pagina suelta", "split document", "extract pages", "separate pdf", "divide pdf",
    "page range pdf", "rango de paginas", "quitar paginas", "pdf individual por pagina",
    "descomponer pdf", "fragmentar pdf", "exportar paginas", "partir documento",
  ],
  "video-a-gif": [
    "video a gif", "convertir video en gif", "mp4 a gif", "mov a gif", "webm a gif",
    "hacer gif", "crear gif", "gif desde video", "clip a gif", "animacion gif",
    "gif animado", "grabar gif", "recortar video gif", "meme gif", "gif corto",
    "video to gif", "mp4 to gif", "make gif", "create gif", "convert video",
    "gif maker", "generar gif", "pasar video a gif", "gif sin marca de agua",
    "video corto gif", "exportar gif",
  ],
  "gif-a-video": [
    "gif a video", "gif a mp4", "convertir gif en video", "gif a mp4 online", "pasar gif a video",
    "gif a webm", "animacion a video", "gif to video", "gif to mp4", "convert gif",
    "video desde gif", "comprimir gif como video", "reducir peso gif", "gif pesado a mp4",
    "publicar gif como video", "gif para instagram", "gif para whatsapp", "gif converter",
    "transformar gif", "exportar gif a video", "gif en mp4", "convertidor gif",
    "gif animado a video", "mp4 desde gif", "cambiar formato gif", "gif a clip",
  ],
  "formato-json": [
    "formato json", "formatear json", "json formatter", "embellecer json", "json bonito",
    "beautify json", "prettify json", "indentar json", "ordenar json", "minificar json",
    "minify json", "comprimir json", "validar json", "json valido", "verificar json",
    "corregir json", "json lint", "linter json", "objeto javascript a json", "js object a json",
    "comillas simples json", "comas finales json", "parsear json", "leer json", "json viewer",
    "visor json", "arreglar json", "json parser", "sangria json",
  ],
  "codificar-base64": [
    "codificar base64", "base64 encode", "encriptar base64", "texto a base64", "convertir a base64",
    "generar base64", "archivo a base64", "imagen a base64", "data uri", "data url",
    "base64 online", "encode base64", "string a base64", "cifrar base64", "codificacion base64",
    "pasar a base64", "base64 de imagen", "base64 de archivo", "incrustar imagen base64",
    "convertidor base64", "utf8 a base64", "base64 encoder", "codificar texto",
    "base 64", "b64 encode", "generar data uri",
  ],
  "decodificar-base64": [
    "decodificar base64", "base64 decode", "desencriptar base64", "base64 a texto", "leer base64",
    "convertir base64", "descifrar base64", "base64 a archivo", "base64 a imagen", "decode base64",
    "base64 decoder", "traducir base64", "interpretar base64", "base64 online", "descodificar base64",
    "pasar base64 a texto", "abrir base64", "extraer de base64", "data uri a imagen",
    "b64 decode", "base 64 decodificar", "convertidor base64", "descargar desde base64",
    "base64 a utf8", "revertir base64", "ver contenido base64",
  ],
  "convertir-mayusculas": [
    "convertir mayusculas", "minusculas", "text case", "cambiar mayusculas", "mayusculas a minusculas",
    "minusculas a mayusculas", "capitalizar", "capitalize", "primera letra mayuscula", "title case",
    "camelcase", "camel case", "pascalcase", "snake case", "snake_case", "kebab case", "kebab-case",
    "screaming snake", "constant case", "convertir texto", "formatear texto", "uppercase",
    "lowercase", "invertir mayusculas", "toggle case", "nombre de variable", "convertir nombres",
    "estilo de texto", "text formatter",
  ],
  "lorem-ipsum": [
    "lorem ipsum", "texto de relleno", "generador lorem", "texto falso", "dummy text",
    "placeholder texto", "parrafos de prueba", "texto de ejemplo", "relleno maqueta",
    "generar parrafos", "palabras aleatorias", "frases de prueba", "contenido ficticio",
    "texto mock", "lorem generator", "filler text", "sample text", "texto largo prueba",
    "maquetacion texto", "prototipo texto", "generar texto", "texto aleatorio",
    "ipsum", "lipsum", "texto para diseño", "borrador texto", "placeholder text",
  ],
  "decodificar-jwt": [
    "decodificar jwt", "jwt decoder", "leer jwt", "json web token", "token jwt",
    "ver payload jwt", "header jwt", "claims jwt", "inspeccionar token", "analizar jwt",
    "jwt debugger", "depurar token", "expiracion token", "exp jwt", "iat jwt",
    "verificar jwt", "abrir token", "descifrar jwt", "decode jwt", "jwt viewer",
    "token de acceso", "bearer token", "auth token", "revisar token", "jwt online",
    "parsear jwt", "contenido del token", "firma jwt",
  ],
  "json-a-typescript": [
    "json a typescript", "json to typescript", "generar interfaces", "interface typescript",
    "tipos desde json", "json a interface", "json to ts", "generar types", "tipar json",
    "modelo typescript", "definir tipos", "type definitions", "json a type", "crear interfaces",
    "convertir json ts", "typescript generator", "types desde api", "respuesta api a tipos",
    "generar dto", "esquema typescript", "ts interface", "json schema typescript",
    "autogenerar tipos", "convertidor typescript", "tipado json", "declaraciones typescript",
  ],
  "simbolos-emojis": [
    "simbolos", "emojis", "caracteres especiales", "copiar simbolos", "tabla de caracteres",
    "unicode", "buscar emoji", "iconos texto", "flechas simbolo", "signos matematicos",
    "letras griegas", "monedas simbolo", "corazon simbolo", "estrella simbolo", "check simbolo",
    "simbolo grados", "copyright simbolo", "marca registrada", "fracciones", "numeros circulados",
    "ajedrez cartas", "notas musicales", "banderas emoji", "caritas emoji", "gestos emoji",
    "emoji picker", "character map", "special characters", "copiar y pegar simbolos", "glifos",
  ],
  "editor-markdown": [
    "editor markdown", "markdown", "md editor", "vista previa markdown", "markdown preview",
    "escribir markdown", "markdown a html", "convertir markdown", "readme", "editar readme",
    "documentacion md", "notas markdown", "sintaxis markdown", "tabla markdown", "lista markdown",
    "codigo markdown", "cita markdown", "encabezados markdown", "negrita cursiva", "enlaces markdown",
    "markdown editor", "md a html", "preview md", "exportar html", "descargar md",
    "apuntes markdown", "wiki markdown", "markdown online",
  ],
  "query-string": [
    "query string", "parametros url", "constructor url", "url builder", "cadena de consulta",
    "parametros get", "armar url", "editar parametros", "url params", "querystring",
    "codificar url", "url encode", "decodificar url", "parsear url", "analizar url",
    "api url", "endpoint parametros", "curl generator", "generar fetch", "codigo python requests",
    "axios request", "utm parametros", "paginacion url", "filtros url", "ordenar parametros",
    "clave valor url", "build query", "url query", "parametros de busqueda",
  ],
  "datos-falsos": [
    "datos falsos", "datos de prueba", "fake data", "generador de datos", "mock data",
    "datos ficticios", "usuarios falsos", "nombres falsos", "correos falsos", "telefonos falsos",
    "direcciones falsas", "json de prueba", "seed database", "poblar base de datos", "datos dummy",
    "generar registros", "csv de prueba", "sql de prueba", "openapi mock", "swagger mock",
    "mock api", "datos aleatorios", "test data", "faker", "generador faker",
    "datos para testing", "sample data", "datos demo", "generar usuarios",
  ],
  "convertir-formatos": [
    "convertir formatos", "json a yaml", "yaml a json", "json a csv", "csv a json",
    "json a xml", "xml a json", "json a toml", "toml a json", "convertidor de datos",
    "yaml a csv", "csv a yaml", "transformar datos", "cambiar formato datos", "format converter",
    "convert json", "convert yaml", "convert csv", "convert xml", "convert toml",
    "pasar a yaml", "exportar csv", "estructura de datos", "serializar datos", "parsear yaml",
    "conversor de archivos", "data converter", "traducir formato",
  ],
  "imagen-placeholder": [
    "imagen placeholder", "placeholder", "imagen de relleno", "imagen de prueba", "mockup imagen",
    "generar placeholder", "placeholder generator", "imagen falsa", "dummy image", "banner de prueba",
    "imagen maqueta", "reservar espacio imagen", "svg placeholder", "png placeholder",
    "imagen con texto", "imagen con medidas", "gradiente imagen", "patron imagen", "cuadricula",
    "puntos patron", "blueprint", "ruido imagen", "16:9 imagen", "banner", "avatar placeholder",
    "prototipo imagen", "wireframe imagen", "generar imagen", "placeholder image",
  ],
  "generar-favicon": [
    "generar favicon", "favicon", "icono web", "ico", "crear favicon",
    "favicon generator", "icono pestaña", "icono sitio web", "favicon png", "favicon ico",
    "generar ico", "icono 16x16", "icono 32x32", "apple touch icon", "icono app",
    "logo a favicon", "imagen a favicon", "convertir a ico", "png a ico", "favicon online",
    "icono navegador", "site icon", "web icon", "crear ico", "favicon desde imagen",
    "iconos multiples tamaños", "manifest icon",
  ],
  "svg-a-png": [
    "svg a png", "convertir svg", "svg to png", "exportar svg", "rasterizar svg",
    "svg a imagen", "vector a png", "svg a bitmap", "descargar svg como png", "convertidor svg",
    "svg a jpg", "abrir svg", "svg render", "escalar svg", "svg alta resolucion",
    "svg 2x 3x", "logo svg a png", "icono svg a png", "convert svg", "export svg",
    "svg converter", "pasar svg a png", "vectorial a raster", "svg png online",
    "guardar svg", "svg a mapa de bits", "transformar svg",
  ],
  "comprimir-imagen": [
    "comprimir imagen", "reducir peso imagen", "optimizar imagen", "bajar tamaño foto", "achicar foto",
    "compress image", "reducir kb imagen", "imagen mas liviana", "optimizar fotos web",
    "calidad imagen", "reducir mb foto", "comprimir jpg", "comprimir png", "comprimir webp",
    "convertir a webp", "imagen ligera", "optimizar para web", "reducir resolucion",
    "redimensionar y comprimir", "image compressor", "optimize image", "shrink image",
    "reduce image size", "adelgazar imagen", "peso de imagen", "subir foto ligera",
    "comprimir foto online",
  ],
  "marca-de-agua": [
    "marca de agua", "watermark", "poner marca de agua", "logo en imagen", "firmar imagen",
    "proteger imagen", "copyright imagen", "texto sobre imagen", "sello imagen", "branding foto",
    "marca de agua texto", "marca de agua logo", "transparencia marca", "add watermark",
    "watermark image", "marcar fotos", "proteger fotos", "poner logo", "insertar logo",
    "credito autor imagen", "firma en foto", "marca personal", "watermark online",
    "estampar imagen", "superponer logo", "opacidad marca",
  ],
  "comprimir-zip": [
    "comprimir zip", "crear zip", "hacer zip", "zip online", "empaquetar archivos",
    "comprimir archivos", "juntar archivos zip", "archivo comprimido", "create zip", "make zip",
    "zip files", "compress files", "generar zip", "carpeta comprimida", "enviar varios archivos",
    "agrupar archivos", "empaquetar carpeta", "reducir varios archivos", "zip de fotos",
    "zip de documentos", "compresor", "archivador", "compactar archivos", "zipper",
    "comprimir varios", "crear archivo zip", "zip maker",
  ],
  "descomprimir-zip": [
    "descomprimir zip", "abrir zip", "extraer zip", "unzip", "ver contenido zip",
    "explorar zip", "leer zip", "sacar archivos zip", "extract zip", "open zip",
    "unzip online", "descomprimir archivos", "abrir comprimido", "visor zip", "explorador zip",
    "arbol de archivos", "previsualizar zip", "descargar archivo de zip", "zip viewer",
    "inspeccionar zip", "contenido comprimido", "abrir carpeta comprimida", "extraer archivos",
    "descomprimir online", "revisar zip", "listar archivos zip", "zip extractor",
  ],
  "ver-metadatos": [
    "ver metadatos", "metadatos", "exif", "datos exif", "informacion de imagen",
    "propiedades archivo", "metadata", "ver exif", "camara foto datos", "fecha de captura",
    "modelo de camara", "orientacion imagen", "iso apertura", "distancia focal", "exposicion",
    "dimensiones imagen", "megapixeles", "proporcion imagen", "peso archivo", "info pdf",
    "propiedades pdf", "autor pdf", "titulo pdf", "paginas pdf", "productor pdf",
    "exif viewer", "metadata viewer", "file info", "inspeccionar archivo",
  ],
};

/** Terms for a tool; empty array if the slug is unknown. */
export function keywordsFor(slug: string): string[] {
  return TOOL_KEYWORDS[slug] ?? [];
}
