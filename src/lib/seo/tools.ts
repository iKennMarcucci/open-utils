/**
 * Content + SEO source of truth for every tool page.
 *
 * The same entry feeds three things at once: the page's `metadata` export, the
 * visible copy (intro, steps, sections, FAQ) and the JSON-LD graph. Writing the
 * FAQ text once is deliberate — Schema.org markup that disagrees with the
 * visible text is "misleading markup" and is a manual-action offence, so the
 * two must be structurally incapable of drifting apart.
 *
 * Every capability claim below was verified against the implementation. Do not
 * add a claim here without checking the code first: this file is the thing that
 * tells Google (and ChatGPT) what the tools do.
 */

export type Faq = { q: string; a: string };
export type Step = { name: string; text: string };
export type Section = { h2: string; paragraphs: string[] };

/**
 * The tool taxonomy. Each tool belongs to exactly one category, and the
 * category owns a landing page at `/{id}`. This is the single discriminator the
 * sidebar, the home and the category pages all group by — add a category here
 * and everything that renders a grouped list picks it up. The human-readable
 * label, SEO copy and route content live in `categories.ts`; keeping only the
 * id here avoids a circular import (categories.ts reads the tools).
 */
export type CategoryId = "documentos" | "imagen-y-video" | "desarrollo";

export type ToolSeo = {
  slug: string;
  /** Full name, used in breadcrumbs, JSON-LD and nav. */
  name: string;
  /** Short label for the sidebar rail. */
  shortName: string;
  category: CategoryId;
  title: string;
  description: string;
  h1: string;
  intro: string[];
  /** Powers both the visible "qué puedes hacer" list and JSON-LD `featureList`. */
  features: string[];
  steps: Step[];
  sections: Section[];
  faqs: Faq[];
  /** Slugs of related tools, for contextual internal links. */
  related: string[];
  applicationCategory: "UtilitiesApplication" | "MultimediaApplication" | "DeveloperApplication";
  applicationSubCategory: string;
  browserRequirements: string;
};

/** Reused verbatim across tool pages — one short paragraph, not duplicated bulk. */
export const PRIVACY_PARAGRAPH =
  "Open Utils funciona íntegramente en el navegador: cuando eliges un archivo, se abre en la memoria de tu propio dispositivo y se procesa ahí. No hay subida, no hay cola de procesamiento en un servidor y no hay copia que borrar después. Puedes comprobarlo tú mismo: abre las herramientas de desarrollo del navegador, entra en la pestaña Red, usa la herramienta y verás que no se envía ningún archivo.";

export const TOOLS_SEO: Record<string, ToolSeo> = {
  "editor-pdf": {
    slug: "editor-pdf",
    name: "Editor de PDF",
    shortName: "Editor PDF",
    category: "documentos",
    title: "Editar PDF gratis online sin marca de agua | Open Utils",
    description:
      "Escribe, dibuja, resalta y añade formas sobre tu PDF, y descárgalo al instante. Gratis, sin marca de agua y sin subir el archivo a ningún servidor.",
    h1: "Editor de PDF online: escribe y dibuja sobre tu PDF sin subirlo",
    intro: [
      "Este editor te deja intervenir un PDF directamente en el navegador: escribir texto encima, dibujar a mano alzada, resaltar párrafos, trazar flechas y recuadros, insertar imágenes y reorganizar las páginas. Después descargas el documento con los cambios ya aplicados.",
      "Es el tipo de edición que la mayoría de la gente necesita de verdad. Casi nadie quiere rehacer la maquetación de un PDF; lo que quiere es rellenar un formulario que no trae campos, tachar un dato, firmar, marcar lo importante o añadir una nota antes de reenviarlo. Eso, que en Adobe Acrobat vive detrás de una suscripción y en las webs gratuitas suele acabar con una marca de agua en la esquina, aquí es gratis y sale limpio.",
    ],
    features: [
      "Escribir texto en cualquier punto de la página",
      "Dibujar a mano alzada y firmar",
      "Resaltar párrafos",
      "Añadir formas, flechas y recuadros",
      "Insertar imágenes sobre el documento",
      "Rotar, reordenar y eliminar páginas",
      "Deshacer y rehacer los cambios",
    ],
    steps: [
      {
        name: "Abre tu PDF",
        text: "Arrastra el documento a la ventana o haz clic para elegirlo. Se abre al instante en tu navegador, sin subirse a ningún sitio. Admite archivos de hasta 100 MB.",
      },
      {
        name: "Anota lo que necesites",
        text: "Elige una herramienta de la barra: texto, lápiz, resaltador, formas, flechas o imagen. Puedes cambiar el color y el grosor, y deshacer cualquier paso.",
      },
      {
        name: "Reorganiza las páginas",
        text: "Si hace falta, rota una página, cámbiala de sitio o elimínala del documento.",
      },
      {
        name: "Descarga el resultado",
        text: "Pulsa descargar y obtendrás tu PDF con las anotaciones ya incrustadas, sin marca de agua.",
      },
    ],
    sections: [
      {
        h2: "Un editor de PDF sin marca de agua y sin subir el archivo",
        paragraphs: [
          "La mayoría de editores de PDF gratuitos hacen lo mismo: te dejan editar, y al descargar te estampan un logo, te piden una cuenta o te limitan a tres documentos al día. Aquí no hay nada de eso. El PDF que descargas contiene exactamente lo que tú has dibujado y escrito, sin ninguna marca añadida, y no hay límite de documentos.",
          PRIVACY_PARAGRAPH,
        ],
      },
      {
        h2: "Qué significa exactamente 'editar' aquí",
        paragraphs: [
          "Conviene ser precisos, porque la palabra 'editar' se usa para dos cosas muy distintas. Este editor trabaja por anotación: coloca una capa encima del documento y, al exportar, la funde con la página original. Puedes escribir donde quieras, tapar, resaltar y firmar.",
          "Lo que no hace es reescribir el texto original del PDF: no puedes hacer clic sobre un párrafo existente y corregir una palabra, porque eso exige reconstruir la maquetación del documento. Para lo que la gente necesita en el día a día —rellenar, firmar, tachar, señalar— la anotación es justo lo que hace falta, y es lo que hacen también Vista Previa de macOS o el visor PDF de Edge.",
        ],
      },
      {
        h2: "Casos de uso habituales",
        paragraphs: [
          "Rellenar un formulario escaneado que llega como imagen y no tiene campos rellenables. Firmar un contrato a mano alzada con el ratón o el dedo y devolverlo sin pasar por la impresora. Corregir un documento marcando los cambios en rojo. Tachar datos personales antes de compartir un justificante. Señalar con flechas la parte relevante de un plano o una factura.",
          "En todos esos casos el documento suele contener datos que no querrías dejar en el servidor de un desconocido: un contrato, una nómina, un informe médico, el DNI de alguien. Ese es exactamente el escenario para el que está pensada esta herramienta.",
        ],
      },
    ],
    faqs: [
      {
        q: "¿Puedo editar un PDF gratis y sin marca de agua?",
        a: "Sí. El editor de PDF de Open Utils es gratuito, no tiene límite de uso y no añade ninguna marca de agua a tus documentos: el PDF que descargas contiene solo el contenido original y tus anotaciones.",
      },
      {
        q: "¿Qué puedo hacer sobre un PDF?",
        a: "Dibujar a mano alzada, resaltar, escribir texto y añadir formas, flechas e imágenes; además puedes rotar, reordenar y eliminar páginas. Son anotaciones que se superponen al documento y se incrustan al exportar: no se reescribe el texto original del PDF.",
      },
      {
        q: "¿Se sube mi PDF a un servidor?",
        a: "No. El PDF se abre y se edita dentro de tu navegador; no se envía a ningún servidor. Puedes comprobarlo en la pestaña Red de las herramientas de desarrollo: no sale ninguna petición con tu archivo.",
      },
      {
        q: "¿Necesito instalar Adobe u otro programa?",
        a: "No. Funciona directamente en el navegador, sin instalar nada, sin registrarte y sin crear una cuenta.",
      },
      {
        q: "¿Puedo firmar un PDF a mano alzada?",
        a: "Sí. Con la herramienta de dibujo a mano alzada puedes trazar tu firma con el ratón, el trackpad o el dedo en una pantalla táctil, colocarla donde corresponda y descargar el PDF firmado.",
      },
      {
        q: "¿Hay límite de tamaño?",
        a: "El editor admite PDF de hasta 100 MB. Por debajo de ese tope, el único freno real es la memoria de tu dispositivo, porque todo el trabajo se hace en local.",
      },
    ],
    related: ["unir-pdf", "dividir-pdf", "pdf-a-imagen"],
    applicationCategory: "UtilitiesApplication",
    applicationSubCategory: "Editor de PDF",
    browserRequirements: "Requiere un navegador moderno con JavaScript habilitado.",
  },

  "editor-imagen": {
    slug: "editor-imagen",
    name: "Editor de Imagen",
    shortName: "Editor IMG",
    category: "imagen-y-video",
    title: "Editor de imágenes online: dibuja y escribe | Open Utils",
    description:
      "Dibuja a mano, escribe texto, resalta y añade formas sobre cualquier imagen. Exporta en PNG o JPG, gratis y sin subir la imagen a ningún servidor.",
    h1: "Editor de imágenes online: dibuja y escribe sobre tu imagen",
    intro: [
      "Abre cualquier imagen y anótala: dibuja a mano alzada, escribe texto encima, resáltala, enciérrala en recuadros de colores y añade formas y flechas. Además puedes recortarla y redimensionarla, con proporciones predefinidas como 16:9, 9:16, 1:1 o 4:3. Al terminar la exportas en PNG o en JPG.",
      "Está pensado para lo que uno hace realmente con una captura de pantalla: señalar el botón del que estás hablando, tapar un dato, rodear el error, poner una nota, o dejarla en el tamaño y la proporción que pide una red social. No es un Photoshop —no hay capas, filtros ni retoque—, es una herramienta de anotación rápida que se abre en un segundo.",
    ],
    features: [
      "Dibujo a mano alzada, texto, resaltado y formas",
      "Flechas y recuadros de colores para señalar",
      "Recortar la imagen con recorte interactivo",
      "Redimensionar, con proporciones (16:9, 9:16, 1:1, 4:3…)",
      "Rotar la imagen",
      "Exportación en PNG o JPG",
      "Deshacer y rehacer",
    ],
    steps: [
      {
        name: "Abre tu imagen",
        text: "Arrastra la imagen a la ventana o haz clic para elegirla. Se carga directamente en tu navegador.",
      },
      {
        name: "Anótala",
        text: "Usa el lápiz, el texto, el resaltador, las formas o las flechas. Puedes cambiar el color y el grosor del trazo en cualquier momento.",
      },
      {
        name: "Exporta",
        text: "Descarga el resultado en PNG (mantiene la transparencia) o en JPG (más ligero, con fondo blanco). La imagen se guarda a su tamaño original, sin reescalar.",
      },
    ],
    sections: [
      {
        h2: "PNG o JPG, tú eliges",
        paragraphs: [
          "Al exportar puedes elegir entre PNG y JPG. PNG conserva la transparencia y no pierde calidad, así que es lo mejor para capturas de pantalla, diagramas y cualquier imagen con texto o líneas nítidas. JPG produce un archivo bastante más ligero y es lo razonable para fotografías o cuando necesitas adjuntar algo sin que pese.",
          "En ambos casos la imagen se exporta a su resolución original: lo que entra es lo que sale, con tus anotaciones fundidas encima y sin ninguna marca de agua.",
        ],
      },
      {
        h2: "Tu imagen no se sube a ningún servidor",
        paragraphs: [
          PRIVACY_PARAGRAPH,
          "Importa más de lo que parece: las capturas de pantalla que uno anota suelen tener dentro precisamente lo que no debería salir de la empresa —un panel interno, un correo, una conversación, datos de un cliente—. Aquí esa imagen nunca abandona tu equipo.",
        ],
      },
    ],
    faqs: [
      {
        q: "¿Cómo escribo o dibujo sobre una imagen?",
        a: "Abres la imagen y usas las herramientas de dibujo a mano alzada, texto, formas, resaltado y recuadros de colores para anotarla. Puedes cambiar el color y el grosor del trazo, y deshacer cualquier paso.",
      },
      {
        q: "¿Puedo recortar o redimensionar la imagen?",
        a: "Sí. Puedes recortarla con un recorte interactivo (con proporciones como 1:1 o 16:9 o a mano alzada) y redimensionarla indicando el tamaño en píxeles o eligiendo una proporción predefinida (16:9, 9:16, 1:1, 4:3, 3:4…).",
      },
      {
        q: "¿En qué formato puedo exportar la imagen?",
        a: "Puedes exportar la imagen editada en PNG o en JPG. El PNG conserva la transparencia; el JPG pesa menos y se guarda sobre fondo blanco.",
      },
      {
        q: "¿Es gratis y privado?",
        a: "Sí. Es gratuito, sin marca de agua y sin registro, y la imagen se procesa dentro de tu navegador: no se sube a ningún servidor.",
      },
    ],
    related: ["editor-pdf", "imagen-a-pdf", "pdf-a-imagen"],
    applicationCategory: "MultimediaApplication",
    applicationSubCategory: "Editor de imágenes",
    browserRequirements: "Requiere un navegador moderno con JavaScript habilitado.",
  },

  "pdf-a-imagen": {
    slug: "pdf-a-imagen",
    name: "PDF a imagen",
    shortName: "PDF a IMG",
    category: "documentos",
    title: "Convertir PDF a imagen (JPG y PNG) gratis | Open Utils",
    description:
      "Convierte cada página de tu PDF en una imagen JPG o PNG de alta calidad. Gratis, sin marca de agua y sin subir el documento a ningún servidor.",
    h1: "Convertir PDF a imagen: una JPG o PNG por cada página",
    intro: [
      "Abre un PDF y conviértelo en imágenes: la herramienta rasteriza cada página por separado y te devuelve un archivo por página, que puedes descargar suelto o todo de una vez. Puedes elegir el formato de salida entre JPG y PNG.",
      "Las páginas se renderizan al doble de resolución, así que el resultado se ve nítido incluso al ampliarlo o al insertarlo en una presentación.",
    ],
    features: [
      "Una imagen por cada página del PDF",
      "Salida en JPG o en PNG",
      "Renderizado al doble de resolución",
      "Descarga individual o de todas las páginas",
      "Sin marca de agua",
    ],
    steps: [
      {
        name: "Elige tu PDF",
        text: "Arrastra el documento o haz clic para seleccionarlo. Se convierte un archivo a la vez, de hasta 50 MB.",
      },
      {
        name: "Elige el formato",
        text: "Selecciona JPG si quieres archivos más ligeros, o PNG si prefieres calidad sin pérdida y fondo transparente.",
      },
      {
        name: "Descarga las imágenes",
        text: "La conversión empieza sola. Obtienes una imagen por página y puedes bajarlas una a una o todas de golpe.",
      },
    ],
    sections: [
      {
        h2: "¿JPG o PNG?",
        paragraphs: [
          "JPG es lo que quieres casi siempre que la página tenga fotografías o mucho color: el archivo pesa mucho menos y la pérdida de calidad es imperceptible a simple vista. Es el formato que espera casi cualquier sitio donde vayas a subir la imagen después.",
          "PNG comprime sin pérdida, así que conserva los bordes de las letras y las líneas perfectamente nítidos. Es la opción correcta para páginas con texto, tablas, planos o gráficos vectoriales, y para cuando la imagen va a ser recortada o editada más tarde.",
        ],
      },
      {
        h2: "Sin subir el documento a ningún servidor",
        paragraphs: [
          PRIVACY_PARAGRAPH,
          "Es la diferencia práctica con los conversores habituales: en ellos tu PDF viaja a una máquina ajena, se procesa allí y se queda almacenado un tiempo. Si el documento es una factura, un contrato o un informe, eso importa.",
        ],
      },
    ],
    faqs: [
      {
        q: "¿Cómo convierto un PDF a imágenes?",
        a: "Arrastras tu PDF (uno a la vez, hasta 50 MB), eliges si quieres JPG o PNG y la conversión empieza sola: obtienes una imagen por cada página, renderizada al doble de resolución para que se vea nítida. Puedes descargarlas de una en una o todas de golpe.",
      },
      {
        q: "¿En qué formato se guardan las imágenes?",
        a: "Puedes elegir entre JPG y PNG. JPG genera archivos mucho más ligeros y va bien para páginas con fotos; PNG comprime sin pérdida y mantiene el texto y las líneas más nítidos.",
      },
      {
        q: "¿Se suben mis archivos al convertir?",
        a: "No. La conversión ocurre localmente en tu navegador; tus archivos no salen de tu dispositivo ni se envían a ningún servidor.",
      },
      {
        q: "¿Tiene marca de agua o límites de tamaño?",
        a: "No añade ninguna marca de agua. Sí hay un límite de tamaño: el PDF de entrada no puede superar los 50 MB. Por debajo de ese tope, el único freno real es la memoria de tu dispositivo, porque todo se procesa en local.",
      },
    ],
    related: ["imagen-a-pdf", "dividir-pdf", "editor-pdf"],
    applicationCategory: "UtilitiesApplication",
    applicationSubCategory: "Conversor de PDF a imagen",
    browserRequirements: "Requiere un navegador moderno con JavaScript habilitado.",
  },

  "imagen-a-pdf": {
    slug: "imagen-a-pdf",
    name: "Imagen a PDF",
    shortName: "IMG a PDF",
    category: "documentos",
    title: "Convertir imágenes a PDF gratis: JPG y PNG | Open Utils",
    description:
      "Convierte varias imágenes JPG o PNG en un único PDF y ordénalas como quieras. Gratis, sin marca de agua y sin subirlas a ningún servidor.",
    h1: "Convertir imágenes a PDF: varias en un solo documento",
    intro: [
      "Añade todas las imágenes que necesites, arrástralas para dejarlas en el orden correcto y conviértelas en un único PDF. Cada imagen ocupa una página, con el tamaño exacto del original: sin márgenes que no pediste, sin reescalados y sin recortes.",
      "Admite JPG, PNG, WebP, BMP y GIF, y también funciona con una sola imagen si es lo único que tienes.",
    ],
    features: [
      "Varias imágenes en un solo PDF",
      "Reordena las páginas arrastrándolas",
      "Una página por imagen, con su tamaño exacto",
      "Admite JPG, PNG, WebP, BMP y GIF",
      "Sin márgenes ni reescalado",
      "Sin marca de agua",
    ],
    steps: [
      {
        name: "Añade tus imágenes",
        text: "Arrástralas todas de una vez o haz clic para elegirlas. Puedes seguir añadiendo más después. Cada imagen puede pesar hasta 50 MB.",
      },
      {
        name: "Ponlas en orden",
        text: "Arrastra cada imagen de la lista para colocarla donde quieras: ese será el orden de las páginas del PDF.",
      },
      {
        name: "Crea el PDF y descárgalo",
        text: "Pulsa Crear PDF y obtendrás un único documento con una página por imagen.",
      },
    ],
    sections: [
      {
        h2: "Varias imágenes, un único PDF",
        paragraphs: [
          "Es el caso de siempre: te piden 'un PDF' y lo que tienes son cinco fotos del contrato, o las capturas de una conversación, o un justificante escaneado en tres trozos. Aquí las sueltas todas juntas, las ordenas arrastrándolas y sale un solo documento.",
          "Cada página adopta las dimensiones exactas de su imagen, así que una foto apaisada sale apaisada y un pantallazo vertical sale vertical, sin franjas blancas ni recortes. Y no hace falta que todas tengan el mismo tamaño.",
        ],
      },
      {
        h2: "¿Esta herramienta o Unir PDF?",
        paragraphs: [
          "Si lo que tienes son solo imágenes, esta es la herramienta: está pensada para eso y es más directa.",
          "Si necesitas mezclar imágenes con PDF que ya existen —añadir dos fotos al final de un contrato, por ejemplo— entonces usa Unir PDF, que acepta los dos tipos de archivo en la misma lista y además puede numerar las páginas.",
        ],
      },
      {
        h2: "Nada se sube a ningún servidor",
        paragraphs: [PRIVACY_PARAGRAPH],
      },
    ],
    faqs: [
      {
        q: "¿Puedo unir varias imágenes en un solo PDF?",
        a: "Sí. Añades todas las imágenes que quieras, las arrastras para dejarlas en el orden que prefieras y se combinan en un único PDF con una página por imagen.",
      },
      {
        q: "¿Puedo cambiar el orden de las páginas?",
        a: "Sí. Cada imagen aparece en una lista que puedes reordenar arrastrándola, y ese orden es exactamente el que tendrán las páginas del PDF final. También puedes quitar una imagen concreta antes de crear el documento.",
      },
      {
        q: "¿Qué formatos de imagen admite?",
        a: "Admite JPG, PNG, WebP, BMP y GIF, con un límite de 50 MB por imagen.",
      },
      {
        q: "¿Se suben mis imágenes a algún servidor?",
        a: "No. La conversión se hace dentro de tu navegador y las imágenes no salen de tu dispositivo.",
      },
      {
        q: "¿Añade marca de agua?",
        a: "No. El PDF que descargas contiene únicamente tus imágenes, sin ninguna marca ni logo añadido.",
      },
    ],
    related: ["unir-pdf", "pdf-a-imagen", "editor-imagen"],
    applicationCategory: "UtilitiesApplication",
    applicationSubCategory: "Conversor de imágenes a PDF",
    browserRequirements: "Requiere un navegador moderno con JavaScript habilitado.",
  },

  "unir-pdf": {
    slug: "unir-pdf",
    name: "Unir PDF",
    shortName: "Unificador PDF",
    category: "documentos",
    title: "Unir PDF gratis: combina varios PDF en uno | Open Utils",
    description:
      "Combina varios PDF e imágenes en un solo documento y ordénalos como quieras. Gratis, sin marca de agua y sin subir nada a ningún servidor.",
    h1: "Unir PDF online: combina varios archivos en un solo documento",
    intro: [
      "Añade todos los PDF e imágenes que quieras, arrástralos para ponerlos en el orden correcto y únelos en un único documento. Si te viene bien, puedes activar la numeración de páginas antes de unificar.",
      "Es la herramienta para cuando tienes un expediente repartido en cinco archivos, o cuando hay que entregar 'un solo PDF' y lo que tienes es un contrato escaneado, dos anexos y una foto del justificante.",
    ],
    features: [
      "Combina varios PDF en uno solo",
      "Mezcla PDF e imágenes en el mismo documento",
      "Reordena los archivos arrastrándolos",
      "Numeración de páginas opcional",
      "Sin marca de agua",
    ],
    steps: [
      {
        name: "Añade tus archivos",
        text: "Arrastra los PDF y las imágenes que quieras combinar. Cada archivo puede pesar hasta 50 MB.",
      },
      {
        name: "Ponlos en orden",
        text: "Arrastra los archivos de la lista para colocarlos en el orden en que deben aparecer en el documento final.",
      },
      {
        name: "Unifica y descarga",
        text: "Si quieres, activa la numeración de páginas. Pulsa Unificar y descarga el PDF combinado.",
      },
    ],
    sections: [
      {
        h2: "PDF e imágenes en el mismo documento",
        paragraphs: [
          "No hace falta convertir las imágenes antes: puedes soltar JPG o PNG junto a tus PDF y la herramienta los integrará como una página más del documento final, respetando el orden que hayas dado a la lista.",
          "El orden se decide a nivel de archivo: arrastras cada elemento a su sitio y las páginas de cada PDF se añaden completas, en su orden original. Si necesitas quitar páginas sueltas o reordenarlas dentro de un documento, usa antes Dividir PDF o el Editor de PDF.",
        ],
      },
      {
        h2: "Gratis, sin marca de agua y sin subir nada",
        paragraphs: [
          "El PDF resultante sale limpio: no se estampa ningún logo ni ninguna marca. Lo único que puede añadirse es la numeración de páginas, y solo si tú la activas expresamente antes de unificar.",
          PRIVACY_PARAGRAPH,
        ],
      },
    ],
    faqs: [
      {
        q: "¿Cómo uno varios PDF en uno solo?",
        a: "Arrastras tus PDF e imágenes, los reordenas con el ratón hasta dejarlos como quieres y pulsas Unificar: se concatenan en un único PDF respetando ese orden. Si te interesa, puedes activar la numeración de páginas antes de unificarlos.",
      },
      {
        q: "¿Puedo combinar PDF e imágenes juntos?",
        a: "Sí. Puedes mezclar PDF e imágenes en un mismo documento final; cada imagen se añade como una página más, en la posición que le hayas dado en la lista.",
      },
      {
        q: "¿Se suben mis documentos a un servidor?",
        a: "No. La unión se hace dentro de tu navegador; nada se sube a la nube ni sale de tu dispositivo.",
      },
      {
        q: "¿Es gratis y sin marca de agua?",
        a: "Sí. Unir PDF es gratuito y no añade ninguna marca de agua: el documento sale limpio y solo se estampa la numeración de páginas si tú decides activarla.",
      },
    ],
    related: ["dividir-pdf", "editor-pdf", "imagen-a-pdf"],
    applicationCategory: "UtilitiesApplication",
    applicationSubCategory: "Unificador de PDF",
    browserRequirements: "Requiere un navegador moderno con JavaScript habilitado.",
  },

  "dividir-pdf": {
    slug: "dividir-pdf",
    name: "Dividir PDF",
    shortName: "Separador PDF",
    category: "documentos",
    title: "Dividir PDF y separar páginas gratis | Open Utils",
    description:
      "Divide un PDF en varios archivos o extrae las páginas que necesites, en PDF o en PNG. Gratis, sin marca de agua y sin subir el documento a ningún servidor.",
    h1: "Dividir PDF online: separa y extrae las páginas que necesites",
    intro: [
      "Abre un PDF, mira todas sus páginas en una cuadrícula y decide qué páginas van en cada paquete. Puedes generar varios archivos de una sola pasada y descargarlos juntos en un ZIP.",
      "Sirve tanto para partir un documento largo en capítulos como para lo más habitual: extraer únicamente las tres páginas que te han pedido, sin mandar el expediente entero.",
    ],
    features: [
      "Vista de todas las páginas en cuadrícula",
      "Varios paquetes de páginas en una sola pasada",
      "Exporta como PDF, como un PDF por página o como imágenes PNG",
      "Descarga todo en un ZIP",
      "Sin marca de agua",
    ],
    steps: [
      {
        name: "Abre tu PDF",
        text: "Arrastra el documento a la ventana. Admite archivos de hasta 100 MB y verás todas sus páginas en miniatura.",
      },
      {
        name: "Elige las páginas",
        text: "Selecciona qué páginas van en cada paquete. Puedes crear varios paquetes a la vez.",
      },
      {
        name: "Elige el formato y descarga",
        text: "Exporta cada paquete como un PDF, como un PDF por página o como imágenes PNG. Si generas varios archivos, se descargan juntos en un ZIP.",
      },
    ],
    sections: [
      {
        h2: "Dividir o extraer: las dos cosas",
        paragraphs: [
          "Partir y extraer son en realidad la misma operación vista desde dos lados. Si defines varios paquetes de páginas, estás dividiendo el documento. Si defines uno solo con las páginas que te interesan, estás extrayendo. La herramienta cubre los dos casos sin cambiar de modo.",
          "También puedes sacar las páginas como imágenes PNG (una por página) en lugar de como PDF, que es lo cómodo cuando el destino es una presentación, un correo o un chat.",
        ],
      },
      {
        h2: "El documento no sale de tu equipo",
        paragraphs: [
          PRIVACY_PARAGRAPH,
          "Justo en esta herramienta es donde más se nota: si estás extrayendo tres páginas de un expediente es, muchas veces, precisamente porque el resto del expediente no debería verlo nadie más.",
        ],
      },
    ],
    faqs: [
      {
        q: "¿Cómo divido un PDF en varias partes?",
        a: "Abres el PDF, ves todas sus páginas en una cuadrícula y eliges qué páginas van en cada paquete. Puedes generar varios archivos a la vez y descargarlos juntos en un ZIP.",
      },
      {
        q: "¿Puedo extraer páginas sueltas de un PDF?",
        a: "Sí. Seleccionas las páginas que quieras y las exportas como un PDF nuevo, como un PDF por cada página o como imágenes PNG (una por página).",
      },
      {
        q: "¿Se sube mi PDF al dividirlo?",
        a: "No. La división se realiza localmente en tu navegador y el documento no se envía a ningún servidor.",
      },
      {
        q: "¿Es gratis?",
        a: "Sí. Dividir PDF es gratuito, sin registro y sin marca de agua: las páginas que extraes salen exactamente como estaban en el original.",
      },
    ],
    related: ["unir-pdf", "pdf-a-imagen", "editor-pdf"],
    applicationCategory: "UtilitiesApplication",
    applicationSubCategory: "Separador de PDF",
    browserRequirements: "Requiere un navegador moderno con JavaScript habilitado.",
  },

  "video-a-gif": {
    slug: "video-a-gif",
    name: "Video a GIF",
    shortName: "Video a GIF",
    category: "imagen-y-video",
    title: "Convertir video a GIF gratis online | Open Utils",
    description:
      "Recorta el fragmento que quieras de tu video y expórtalo como GIF. Gratis, sin marca de agua y sin subir el video a ningún servidor.",
    h1: "Convertir video a GIF: recorta y exporta en tu navegador",
    intro: [
      "Abre un video, marca dónde empieza y dónde acaba el fragmento que te interesa y expórtalo como GIF animado. La conversión se hace dentro del navegador con FFmpeg compilado a WebAssembly, así que el video no se sube a ninguna parte.",
      "Al exportar eliges una de las tres calidades —Liviano, Normal o Alta—, que es lo que decide el equilibrio entre nitidez y peso del GIF resultante.",
    ],
    features: [
      "Recorte del fragmento con marcadores de inicio y fin",
      "Tres niveles de calidad: Liviano, Normal y Alta",
      "Paleta de color optimizada para que el GIF se vea bien",
      "Sin marca de agua",
      "Conversión local con FFmpeg en WebAssembly",
    ],
    steps: [
      {
        name: "Abre tu video",
        text: "Arrastra el archivo de video a la ventana. Se carga en tu navegador sin subirse a ningún servidor.",
      },
      {
        name: "Recorta el fragmento",
        text: "Mueve los marcadores de inicio y fin para quedarte solo con el trozo que quieres convertir.",
      },
      {
        name: "Elige la calidad",
        text: "Al pulsar Convertir eliges entre Liviano, Normal y Alta según cuánto quieras que pese el GIF.",
      },
      {
        name: "Descarga el GIF",
        text: "Cuando termine la conversión, descarga el GIF. No lleva ninguna marca de agua.",
      },
    ],
    sections: [
      {
        h2: "Qué calidad elegir",
        paragraphs: [
          "Los GIF pesan mucho: el formato es de 1987 y no comprime el movimiento como lo hace un video moderno. Por eso la elección de calidad importa más de lo habitual. Liviano reduce el tamaño y la fluidez, y es lo que quieres si el GIF va a ir en un correo o en un chat con límite de adjuntos. Alta conserva más detalle y fluidez a costa de un archivo bastante más grande.",
          "Normal es el punto medio razonable para casi todo. Y en cualquier caso, cuanto más corto sea el fragmento que recortes, más ligero será el resultado: es la palanca que más influye.",
        ],
      },
      {
        h2: "El video no se sube a internet",
        paragraphs: [
          PRIVACY_PARAGRAPH,
          "En video esto se nota además en velocidad: no hay que esperar a que se suban decenas o cientos de megas antes de que empiece siquiera la conversión.",
        ],
      },
    ],
    faqs: [
      {
        q: "¿Cómo convierto un video a GIF?",
        a: "Arrastras tu video, recortas el fragmento con los marcadores de inicio y fin, eliges una calidad (Liviano, Normal o Alta) y descargas el GIF. Todo el proceso ocurre dentro de tu navegador.",
      },
      {
        q: "¿Puedo convertir un GIF de vuelta a video?",
        a: "Sí, con la herramienta GIF a video, que te devuelve un MP4 (H.264). Eso sí: en ese sentido se convierte el GIF completo, sin recorte.",
      },
      {
        q: "¿Se sube mi video a internet?",
        a: "No. El video se procesa localmente en tu navegador, así que no se sube a ningún servidor.",
      },
      {
        q: "¿Es gratis?",
        a: "Sí. Convertir video a GIF es gratuito, sin registro y sin marca de agua.",
      },
    ],
    related: ["gif-a-video", "editor-imagen", "pdf-a-imagen"],
    applicationCategory: "MultimediaApplication",
    applicationSubCategory: "Conversor de video a GIF",
    browserRequirements:
      "Requiere un navegador moderno con JavaScript y WebAssembly habilitados.",
  },

  "gif-a-video": {
    slug: "gif-a-video",
    name: "GIF a video",
    shortName: "GIF a Video",
    category: "imagen-y-video",
    title: "Convertir GIF a video MP4 gratis | Open Utils",
    description:
      "Convierte un GIF animado en un video MP4 (H.264) listo para compartir. Gratis, sin marca de agua y sin subir el archivo a ningún servidor.",
    h1: "Convertir GIF a video MP4 sin subir el archivo",
    intro: [
      "Convierte un GIF animado en un MP4 con códec H.264, que es lo que esperan hoy casi todas las plataformas. El archivo resultante pesa mucho menos que el GIF original y se reproduce mejor en el móvil.",
      "La conversión toma el GIF completo: aquí no hay recorte. Si necesitas quedarte solo con un fragmento, recórtalo antes.",
    ],
    features: [
      "Convierte GIF a MP4 con códec H.264",
      "Archivo resultante mucho más ligero que el GIF",
      "Compatible con redes sociales y móviles",
      "Sin marca de agua",
      "Conversión local con FFmpeg en WebAssembly",
    ],
    steps: [
      {
        name: "Abre tu GIF",
        text: "Arrastra el GIF animado a la ventana. Se carga en tu navegador, sin subirse a ningún servidor.",
      },
      {
        name: "Elige la calidad",
        text: "Al pulsar Convertir eliges entre Liviano, Normal y Alta.",
      },
      {
        name: "Descarga el MP4",
        text: "Obtienes un video MP4 (H.264) con el contenido completo del GIF.",
      },
    ],
    sections: [
      {
        h2: "Por qué pasar un GIF a MP4",
        paragraphs: [
          "Un GIF de unos pocos segundos puede ocupar varios megabytes; el mismo contenido en MP4 suele quedarse en una fracción de eso, porque H.264 comprime el movimiento entre fotogramas y el GIF no. Además, muchas plataformas y clientes de correo tratan mejor un MP4 que un GIF pesado.",
          "Es también el paso obligado cuando quieres subir una animación a una red social que no acepta GIF, o cuando el adjunto no cabe por tamaño.",
        ],
      },
      {
        h2: "Sin subir el archivo",
        paragraphs: [PRIVACY_PARAGRAPH],
      },
    ],
    faqs: [
      {
        q: "¿En qué formato se convierte el GIF?",
        a: "Obtienes un video MP4 con códec H.264, que es el formato compatible con prácticamente cualquier reproductor, red social y móvil.",
      },
      {
        q: "¿Puedo recortar el GIF antes de convertirlo?",
        a: "No: en este sentido se convierte el GIF completo, sin recorte. El recorte está disponible en la herramienta de video a GIF.",
      },
      {
        q: "¿Se sube mi archivo a internet?",
        a: "No. El GIF se procesa localmente en tu navegador y no se envía a ningún servidor.",
      },
      {
        q: "¿Es gratis?",
        a: "Sí. Convertir GIF a video es gratuito, sin registro y sin marca de agua.",
      },
    ],
    related: ["video-a-gif", "editor-imagen"],
    applicationCategory: "MultimediaApplication",
    applicationSubCategory: "Conversor de GIF a video",
    browserRequirements:
      "Requiere un navegador moderno con JavaScript y WebAssembly habilitados.",
  },

  "formato-json": {
    slug: "formato-json",
    name: "Formato JSON",
    shortName: "Formato JSON",
    category: "desarrollo",
    title: "Formatear JSON online: validar y minificar | Open Utils",
    description:
      "Formatea, valida y minifica JSON al instante en tu navegador. Ideal para datos sensibles: nada se envía a ningún servidor. Gratis y sin registro.",
    h1: "Formatear JSON online: indenta, valida y minifica",
    intro: [
      "Pega tu JSON a la izquierda y ve el resultado formateado o minificado a la derecha, con resaltado de colores para distinguir claves, textos, números y valores. Elige la indentación, valídalo para localizar el error exacto si está mal, o minifícalo para dejarlo en una sola línea. Todo ocurre en tu navegador, al instante.",
      "Además del JSON estándar, acepta objetos escritos como en JavaScript —claves sin comillas, comillas simples y comas finales— y los normaliza a JSON válido al formatear o minificar.",
      "Si el texto no se puede interpretar, la herramienta te dice qué falla y en qué posición, en lugar de limitarse a decir que hay un error.",
    ],
    features: [
      "Vista de dos paneles: entrada y resultado en paralelo",
      "Resaltado de sintaxis por colores (clave y valor)",
      "Acepta objetos de JavaScript: claves sin comillas, comillas simples y comas finales",
      "Formatea e indenta JSON con 2 o 4 espacios",
      "Valida y señala el error exacto",
      "Minifica a una sola línea",
      "Copiar al portapapeles y descargar",
      "Procesamiento 100% local",
    ],
    steps: [
      {
        name: "Pega tu JSON u objeto",
        text: "Pega el contenido en el panel de la izquierda, o arrastra un archivo .json. Vale JSON estándar o un objeto tipo { clave: valor }.",
      },
      {
        name: "Formatea o minifica",
        text: "Elige la indentación y el modo Formatear, o Minificar para dejarlo en una línea. El resultado aparece a la derecha y la validación es automática.",
      },
      {
        name: "Copia o descarga",
        text: "Copia el resultado al portapapeles o descárgalo como archivo .json.",
      },
    ],
    sections: [
      {
        h2: "Por qué importa que sea local",
        paragraphs: [
          "Los JSON que uno necesita formatear en el trabajo casi nunca son inocentes: son la respuesta de una API de producción, un payload con tokens, un volcado con datos de clientes o la configuración de un servicio. Pegarlos en una web que los envía a su servidor es, en la práctica, filtrar esos datos a un tercero, y en muchos equipos incumple directamente la política interna.",
          "Esta herramienta no puede filtrar nada porque no envía nada: el JSON se procesa con el motor del propio navegador y no sale de tu equipo. Puedes comprobarlo en la pestaña Red de las herramientas de desarrollo, y el código está publicado en GitHub.",
        ],
      },
      {
        h2: "Formatear, validar y minificar",
        paragraphs: [
          "Formatear (o 'embellecer') reescribe el JSON con saltos de línea e indentación para que puedas leerlo. Es lo que quieres cuando recibes una respuesta de API en una sola línea ilegible.",
          "Minificar hace lo contrario: quita todos los espacios sobrantes y lo deja en una línea, que es como conviene guardarlo o transmitirlo porque ocupa menos. Validar comprueba que la sintaxis sea correcta y, si no lo es, te señala dónde está el problema: una coma de más, una comilla sin cerrar, una llave sin abrir.",
        ],
      },
    ],
    faqs: [
      {
        q: "¿Qué hace la herramienta de formato JSON?",
        a: "Formatea e indenta, valida y minifica JSON al instante en tu navegador. Puedes elegir la indentación, dejarlo todo en una línea, copiar el resultado o descargarlo como archivo.",
      },
      {
        q: "¿Valida si mi JSON tiene errores?",
        a: "Sí. Si el JSON no es válido te lo indica y te señala en qué punto está el problema, para que puedas corregirlo.",
      },
      {
        q: "¿Puedo pegar un objeto de JavaScript en vez de JSON?",
        a: "Sí. Acepta objetos escritos como en JavaScript, con las claves sin comillas, comillas simples o comas finales (por ejemplo { nombre: 'Ada', activo: true, }), y los convierte a JSON válido al formatear o minificar.",
      },
      {
        q: "¿Mis datos se envían a algún servidor?",
        a: "No. El JSON se procesa localmente en tu navegador, así que es seguro para datos sensibles: respuestas de API de producción, tokens o volcados con datos de clientes.",
      },
    ],
    related: ["codificar-base64", "decodificar-base64", "editor-pdf"],
    applicationCategory: "DeveloperApplication",
    applicationSubCategory: "Formateador y validador de JSON",
    browserRequirements: "Requiere un navegador moderno con JavaScript habilitado.",
  },

  "codificar-base64": {
    slug: "codificar-base64",
    name: "Codificar Base64",
    shortName: "Codificar B64",
    category: "desarrollo",
    title: "Codificar a Base64 online (UTF-8) | Open Utils",
    description:
      "Convierte texto a Base64 al instante, con soporte correcto de UTF-8 (acentos y emojis). Todo en tu navegador: nada se envía a ningún servidor. Gratis y sin registro.",
    h1: "Codificar a Base64 online, con UTF-8 correcto",
    intro: [
      "Escribe o pega tu texto y obtén su representación en Base64 al momento, mientras escribes; o carga un archivo cualquiera —una imagen, un PDF— y obtén su Base64 completo. La conversión ocurre en tu navegador, así que nada se envía a ninguna parte.",
      "A diferencia de muchas utilidades que usan directamente el `btoa` del navegador —que solo entiende Latin-1 y corrompe cualquier acento o emoji—, aquí el texto se codifica como UTF-8 antes de pasar a Base64, así que 'áéí 🚀' sobrevive intacto al proceso.",
    ],
    features: [
      "Codifica texto a Base64 mientras escribes",
      "Codifica cualquier archivo (imagen, PDF…) a Base64",
      "UTF-8 correcto: acentos, ñ y emojis se conservan",
      "Copiar al portapapeles y descargar el resultado",
      "Procesamiento 100% local",
    ],
    steps: [
      {
        name: "Escribe texto o carga un archivo",
        text: "Introduce el texto en el editor, o pulsa «Codificar archivo» y elige cualquier archivo de tu equipo.",
      },
      {
        name: "Copia el Base64",
        text: "El resultado en Base64 aparece al instante. Cópialo al portapapeles o descárgalo como archivo.",
      },
    ],
    sections: [
      {
        h2: "Qué es Base64 y para qué sirve",
        paragraphs: [
          "Base64 es una forma de representar datos binarios usando solo 64 caracteres de texto imprimible (letras, números y unos pocos símbolos). Se usa para poder meter datos que no son texto —o texto con caracteres raros— dentro de sitios que solo aceptan texto plano: el cuerpo de un correo, un data URI en una hoja de estilos, un token en una cabecera HTTP o un campo de un JSON.",
          "No es cifrado ni compresión: cualquiera puede decodificar un Base64 al instante, y el resultado ocupa alrededor de un tercio más que el original. Es un formato de transporte, no una medida de seguridad; no lo uses para 'ocultar' una contraseña.",
        ],
      },
      {
        h2: "Se codifica en tu navegador, no en un servidor",
        paragraphs: [
          PRIVACY_PARAGRAPH,
          "Importa porque el texto que uno codifica a Base64 suele ser precisamente lo delicado: la carga útil de un token, credenciales de una API, un fragmento de configuración. Aquí ese texto no sale de tu equipo.",
        ],
      },
    ],
    faqs: [
      {
        q: "¿Cómo codifico un texto a Base64?",
        a: "Escribes o pegas el texto y su versión en Base64 aparece al instante debajo; después puedes copiarla o descargarla. Todo ocurre en tu navegador.",
      },
      {
        q: "¿Puedo codificar un archivo, no solo texto?",
        a: "Sí. Con «Codificar archivo» eliges cualquier archivo (una imagen, un PDF, lo que sea) y obtienes su Base64 completo, útil por ejemplo para incrustarlo como data URI. El archivo se lee en tu navegador y no se sube a ningún servidor.",
      },
      {
        q: "¿Funciona con acentos, ñ y emojis?",
        a: "Sí. El texto se codifica como UTF-8 antes de convertirlo a Base64, así que los acentos, la ñ y los emojis se conservan correctamente y se recuperan igual al decodificar.",
      },
      {
        q: "¿Base64 cifra o protege mi texto?",
        a: "No. Base64 no es cifrado: cualquiera puede decodificarlo sin ninguna clave. Es solo una forma de representar datos como texto para transportarlos; no lo uses para proteger contraseñas ni datos secretos.",
      },
      {
        q: "¿Se envía mi texto a algún servidor?",
        a: "No. La codificación se hace localmente en tu navegador y el texto no se envía a ningún servidor.",
      },
    ],
    related: ["decodificar-base64", "formato-json", "editor-pdf"],
    applicationCategory: "DeveloperApplication",
    applicationSubCategory: "Codificador Base64",
    browserRequirements: "Requiere un navegador moderno con JavaScript habilitado.",
  },

  "decodificar-base64": {
    slug: "decodificar-base64",
    name: "Decodificar Base64",
    shortName: "Decodificar B64",
    category: "desarrollo",
    title: "Decodificar Base64 a texto online (UTF-8) | Open Utils",
    description:
      "Convierte Base64 a texto al instante, con UTF-8 correcto. Acepta Base64 estándar y URL-safe. Todo en tu navegador: nada se envía a ningún servidor. Gratis y sin registro.",
    h1: "Decodificar Base64 a texto online",
    intro: [
      "Pega una cadena en Base64 y recupera el texto original al instante. Y si ese Base64 no es texto sino un archivo —una imagen, un PDF—, puedes descargarlo como archivo con un clic. Todo ocurre en tu navegador.",
      "Acepta tanto el Base64 estándar (con + y /) como la variante URL-safe (con - y _), tolera los saltos de línea y el relleno que falte, y decodifica el resultado como UTF-8 para que los acentos y los emojis se muestren bien.",
    ],
    features: [
      "Decodifica Base64 a texto mientras escribes",
      "Descarga el contenido decodificado como archivo (imagen, PDF…)",
      "Acepta Base64 estándar y URL-safe (- y _)",
      "Tolera saltos de línea y relleno (=) ausente",
      "UTF-8 correcto: acentos, ñ y emojis",
      "Procesamiento 100% local",
    ],
    steps: [
      {
        name: "Pega tu Base64",
        text: "Introduce la cadena en Base64 en el editor.",
      },
      {
        name: "Copia el texto o descarga el archivo",
        text: "Si es texto, aparece al instante y lo copias; si es un archivo binario, pulsa «Descargar como archivo» para guardarlo.",
      },
    ],
    sections: [
      {
        h2: "Estándar y URL-safe, y con el relleno que falte",
        paragraphs: [
          "Hay dos alfabetos de Base64 en circulación. El estándar usa los símbolos + y /, mientras que la variante URL-safe los sustituye por - y _ para poder viajar dentro de una URL o de un token JWT sin romperse. Esta herramienta acepta las dos sin que tengas que indicar cuál es.",
          "También es habitual encontrarse Base64 sin los signos = del final, o partido en varias líneas. Ambos casos se toleran: se ignoran los espacios y saltos de línea y se recalcula el relleno antes de decodificar.",
        ],
      },
      {
        h2: "Cuando el resultado no es texto",
        paragraphs: [
          "Base64 se usa también para transportar archivos binarios —imágenes, PDF, fuentes— dentro de texto. Si pegas uno de esos, el resultado no será legible como texto y la herramienta te avisará de que el contenido decodificado no es UTF-8 válido, en lugar de mostrarte caracteres corruptos.",
          PRIVACY_PARAGRAPH,
        ],
      },
    ],
    faqs: [
      {
        q: "¿Cómo decodifico una cadena Base64?",
        a: "Pegas la cadena en Base64 y el texto original aparece al instante debajo; después puedes copiarlo o descargarlo. Todo ocurre en tu navegador.",
      },
      {
        q: "¿Admite Base64 URL-safe (con - y _)?",
        a: "Sí. Acepta tanto el Base64 estándar (con + y /) como la variante URL-safe (con - y _), y también tolera los saltos de línea y el relleno con = que falte.",
      },
      {
        q: "¿Por qué me dice que el resultado no es válido?",
        a: "Porque el texto que has pegado tiene caracteres que no pertenecen al alfabeto Base64, o porque al decodificarlo no resulta un texto UTF-8. Esto último suele pasar cuando el Base64 corresponde a un archivo binario, como una imagen o un PDF: en ese caso usa «Descargar como archivo» para guardarlo.",
      },
      {
        q: "¿Se envía mi contenido a algún servidor?",
        a: "No. La decodificación se hace localmente en tu navegador y el contenido no se envía a ningún servidor.",
      },
    ],
    related: ["codificar-base64", "formato-json", "editor-pdf"],
    applicationCategory: "DeveloperApplication",
    applicationSubCategory: "Decodificador Base64",
    browserRequirements: "Requiere un navegador moderno con JavaScript habilitado.",
  },

  "convertir-mayusculas": {
    slug: "convertir-mayusculas",
    name: "Text Case Formatter",
    shortName: "Text Case",
    category: "desarrollo",
    title: "Convertir mayúsculas, minúsculas y camelCase | Open Utils",
    description:
      "Convierte texto a MAYÚSCULAS, minúsculas, Title Case, camelCase, snake_case, kebab-case y más, al instante y en tu navegador. Gratis y sin registro.",
    h1: "Convertir texto entre mayúsculas, minúsculas y formatos de código",
    intro: [
      "Pega un texto y obtén al momento todas sus variantes: mayúsculas, minúsculas, Title Case, tipo oración, y los formatos que usan los programadores como camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE, dot.case, path/case y Header-Case. Pulsa cualquiera para copiarlo.",
      "Reconoce cómo está escrito el texto de entrada aunque ya venga en uno de esos formatos: si pegas 'miVariableFavorita' puede devolverte 'mi-variable-favorita' o 'MI_VARIABLE_FAVORITA' sin que tengas que separar las palabras a mano.",
    ],
    features: [
      "MAYÚSCULAS, minúsculas, Title Case y tipo oración",
      "camelCase, PascalCase, snake_case y kebab-case",
      "CONSTANT_CASE, dot.case, path/case y Header-Case",
      "Reconoce el formato de entrada y separa las palabras solo",
      "Copiar cualquier resultado con un clic",
      "Procesamiento 100% local",
    ],
    steps: [
      { name: "Escribe o pega tu texto", text: "Introduce el texto en el editor. Puede venir en cualquier formato." },
      { name: "Copia el formato que necesites", text: "Verás todas las variantes a la vez; pulsa una para copiarla al portapapeles." },
    ],
    sections: [
      {
        h2: "Para qué sirven los formatos de código",
        paragraphs: [
          "Cada lenguaje y cada convención de equipo espera un formato distinto para los nombres. Las variables de JavaScript suelen ir en camelCase, las clases en PascalCase, las constantes en CONSTANT_CASE, los nombres de archivo y las URLs en kebab-case, y muchas columnas de base de datos en snake_case. Convertir a mano entre ellos es tedioso y propenso a erratas.",
          "Esta herramienta hace la conversión respetando las fronteras entre palabras, así que da igual cómo llegue el texto: lo descompone en palabras y lo vuelve a unir en el formato que pidas.",
        ],
      },
      {
        h2: "Se procesa en tu navegador",
        paragraphs: [PRIVACY_PARAGRAPH],
      },
    ],
    faqs: [
      {
        q: "¿Qué formatos de texto puedo generar?",
        a: "MAYÚSCULAS, minúsculas, Title Case, tipo oración, camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE, dot.case, path/case y Header-Case. Todos se muestran a la vez y se copian con un clic.",
      },
      {
        q: "¿Reconoce el formato del texto que pego?",
        a: "Sí. Separa las palabras aunque el texto ya venga en camelCase, snake_case o kebab-case, así que puedes convertir de cualquier formato a cualquier otro sin preparar la entrada.",
      },
      {
        q: "¿Se envía mi texto a algún servidor?",
        a: "No. La conversión se hace localmente en tu navegador y el texto no se envía a ningún servidor.",
      },
    ],
    related: ["lorem-ipsum", "formato-json", "json-a-typescript"],
    applicationCategory: "DeveloperApplication",
    applicationSubCategory: "Convertidor de mayúsculas y minúsculas",
    browserRequirements: "Requiere un navegador moderno con JavaScript habilitado.",
  },

  "lorem-ipsum": {
    slug: "lorem-ipsum",
    name: "Generador de Lorem Ipsum",
    shortName: "Lorem Ipsum",
    category: "desarrollo",
    title: "Generador de Lorem Ipsum online gratis | Open Utils",
    description:
      "Genera texto Lorem Ipsum de relleno indicando cuántos párrafos, frases, palabras o caracteres necesitas. Al instante, en tu navegador, gratis y sin registro.",
    h1: "Generador de Lorem Ipsum: párrafos, frases, palabras o caracteres",
    intro: [
      "Genera el texto de relleno clásico para maquetar diseños, rellenar prototipos o probar cómo se comporta una interfaz con contenido real. Eliges la unidad —párrafos, frases, palabras o caracteres— y la cantidad exacta, y el texto aparece al momento listo para copiar o descargar.",
      "El modo por caracteres es útil cuando necesitas ajustar un texto a un límite concreto, como un meta description o un campo con longitud máxima: pides los caracteres justos y los obtienes.",
    ],
    features: [
      "Genera por párrafos, frases, palabras o caracteres",
      "Cantidad exacta a tu elección",
      "Copiar al portapapeles y descargar como .txt",
      "Resultado inmediato mientras ajustas los valores",
      "Procesamiento 100% local",
    ],
    steps: [
      { name: "Elige unidad y cantidad", text: "Selecciona párrafos, frases, palabras o caracteres, e indica cuántos necesitas." },
      { name: "Copia o descarga", text: "El texto se genera al instante; cópialo al portapapeles o descárgalo como archivo .txt." },
    ],
    sections: [
      {
        h2: "Qué es el Lorem Ipsum y por qué se usa",
        paragraphs: [
          "El Lorem Ipsum es un texto de relleno derivado de un tratado de Cicerón, deformado para que no signifique nada. Se usa desde la imprenta del siglo XVI porque permite ver el aspecto de un diseño sin que el contenido real distraiga: al no poder leerlo, te fijas en la tipografía, el interlineado y la composición.",
          "En diseño web y de producto sigue siendo la forma más rápida de rellenar una maqueta, comprobar desbordamientos de texto o preparar una demo antes de tener el contenido definitivo.",
        ],
      },
      {
        h2: "Se genera en tu navegador",
        paragraphs: [
          "No hace falta ninguna conexión con un servidor: el texto se compone en tu propio dispositivo, así que es instantáneo y funciona igual aunque la red vaya lenta.",
        ],
      },
    ],
    faqs: [
      {
        q: "¿Puedo elegir cuántos párrafos o palabras genero?",
        a: "Sí. Eliges la unidad —párrafos, frases, palabras o caracteres— y la cantidad exacta, y el texto se genera al momento con esa medida.",
      },
      {
        q: "¿Puedo generar un número exacto de caracteres?",
        a: "Sí. En el modo por caracteres el texto se recorta a la longitud exacta que indiques, útil para ajustarse a límites como un meta description.",
      },
      {
        q: "¿Es gratis y sin registro?",
        a: "Sí. Es gratuito, sin registro y sin límites, y el texto se genera localmente en tu navegador.",
      },
    ],
    related: ["convertir-mayusculas", "formato-json", "simbolos-emojis"],
    applicationCategory: "DeveloperApplication",
    applicationSubCategory: "Generador de texto de relleno",
    browserRequirements: "Requiere un navegador moderno con JavaScript habilitado.",
  },

  "decodificar-jwt": {
    slug: "decodificar-jwt",
    name: "Decodificar JWT",
    shortName: "JWT",
    category: "desarrollo",
    title: "Decodificar JWT online: leer el token | Open Utils",
    description:
      "Decodifica un JWT y lee su cabecera y su contenido, con las fechas de emisión y caducidad. En tu navegador, seguro para tokens: nada se envía a un servidor.",
    h1: "Decodificar JWT: lee la cabecera y el contenido de tu token",
    intro: [
      "Pega un JSON Web Token y lee al instante su cabecera (header) y su contenido (payload), con las fechas de emisión, validez y caducidad ya convertidas a un formato legible. Todo ocurre en tu navegador.",
      "Es una herramienta de depuración: sirve para ver qué lleva dentro un token —qué usuario, qué permisos, cuándo caduca— cuando estás desarrollando o diagnosticando un problema de autenticación.",
    ],
    features: [
      "Decodifica la cabecera y el contenido del token",
      "Muestra las fechas de emisión, validez y caducidad",
      "Avisa si el token ya ha caducado",
      "Copiar la cabecera o el contenido como JSON",
      "Procesamiento 100% local",
    ],
    steps: [
      { name: "Pega tu JWT", text: "Introduce el token completo (las tres partes separadas por puntos)." },
      { name: "Lee sus datos", text: "Verás la cabecera, el contenido y los claims destacados; puedes copiar cada bloque como JSON." },
    ],
    sections: [
      {
        h2: "Decodificar no es verificar",
        paragraphs: [
          "Un JWT tiene tres partes: cabecera, contenido y firma. La cabecera y el contenido son simplemente JSON codificado en Base64URL, así que cualquiera puede leerlos sin ninguna clave: eso es lo que hace esta herramienta. La firma, en cambio, es lo que garantiza que el token no ha sido manipulado, y comprobarla exige la clave secreta o pública del emisor.",
          "Por eso esta herramienta decodifica pero no verifica la firma: hacerlo en el navegador obligaría a exponer la clave, y validar un token de verdad debe hacerse en el servidor. No des por bueno el contenido de un JWT solo porque se pueda leer aquí.",
        ],
      },
      {
        h2: "Seguro para tokens: no salen de tu equipo",
        paragraphs: [
          "Un JWT suele contener datos de sesión reales —el identificador de un usuario, sus permisos, a veces su correo—. Pegarlo en una web que lo envía a su servidor es filtrar esa sesión a un tercero.",
          PRIVACY_PARAGRAPH,
        ],
      },
    ],
    faqs: [
      {
        q: "¿Esta herramienta verifica la firma del JWT?",
        a: "No. Decodifica y muestra la cabecera y el contenido, pero no comprueba la firma: eso requiere la clave del emisor y debe hacerse en el servidor. No confíes en un token solo porque se pueda leer.",
      },
      {
        q: "¿Qué información me muestra del token?",
        a: "La cabecera (algoritmo y tipo), el contenido completo (payload) y los claims destacados, incluyendo las fechas de emisión (iat), validez (nbf) y caducidad (exp), con aviso si ya ha caducado.",
      },
      {
        q: "¿Es seguro pegar aquí un token real?",
        a: "El token se decodifica localmente en tu navegador y no se envía a ningún servidor. Aun así, trata cualquier token como un dato sensible: si es un token de producción en uso, lo prudente es revocarlo después de depurarlo.",
      },
    ],
    related: ["codificar-base64", "decodificar-base64", "formato-json"],
    applicationCategory: "DeveloperApplication",
    applicationSubCategory: "Decodificador de JWT",
    browserRequirements: "Requiere un navegador moderno con JavaScript habilitado.",
  },

  "json-a-typescript": {
    slug: "json-a-typescript",
    name: "JSON a TypeScript",
    shortName: "JSON a TS",
    category: "desarrollo",
    title: "Convertir JSON a interfaces TypeScript | Open Utils",
    description:
      "Genera interfaces de TypeScript a partir de un JSON de ejemplo, con tipos anidados y propiedades opcionales. Al instante y en tu navegador. Gratis y sin registro.",
    h1: "Generar interfaces de TypeScript a partir de un JSON",
    intro: [
      "Pega un JSON de ejemplo —la respuesta de una API, un objeto de configuración— y obtén las interfaces de TypeScript que lo describen, con los tipos anidados como interfaces propias y las propiedades opcionales marcadas con '?'. Copia el resultado y pégalo en tu proyecto.",
      "Al tipar arrays de objetos, fusiona la forma de todos los elementos en vez de fiarse solo del primero: si un objeto del array tiene un campo que otro no tiene, ese campo se marca como opcional.",
    ],
    features: [
      "Interfaces de TypeScript desde un JSON de ejemplo",
      "Objetos anidados como interfaces separadas",
      "Propiedades opcionales detectadas en arrays de objetos",
      "Nombre de la interfaz raíz personalizable",
      "Copiar y descargar como archivo .ts",
      "Procesamiento 100% local",
    ],
    steps: [
      { name: "Pega tu JSON", text: "Introduce un JSON de ejemplo representativo de los datos que vas a tipar." },
      { name: "Copia las interfaces", text: "Se generan al instante; ajusta el nombre de la raíz si quieres y copia o descarga el TypeScript." },
    ],
    sections: [
      {
        h2: "Cómo se infieren los tipos",
        paragraphs: [
          "La herramienta recorre el JSON y crea una interfaz por cada objeto. Los tipos primitivos (texto, número, booleano, null) se mapean directamente, y los objetos anidados se extraen como interfaces con nombre para que el resultado sea legible y reutilizable.",
          "Para los arrays, mira todos los elementos y no solo el primero. Si es un array de objetos, une sus formas: los campos presentes en todos quedan obligatorios y los que faltan en alguno se marcan como opcionales. Así el tipo describe los datos reales y no una muestra parcial.",
        ],
      },
      {
        h2: "Se genera en tu navegador",
        paragraphs: [
          "El JSON que uno tipa suele ser la respuesta de una API real, a veces con datos de clientes. Aquí no sale de tu equipo: el análisis y la generación se hacen con el motor de tu propio navegador.",
        ],
      },
    ],
    faqs: [
      {
        q: "¿Cómo convierto un JSON en tipos de TypeScript?",
        a: "Pegas un JSON de ejemplo y la herramienta genera las interfaces que lo describen, con los objetos anidados como interfaces propias. Puedes cambiar el nombre de la interfaz raíz y copiar o descargar el resultado.",
      },
      {
        q: "¿Detecta las propiedades opcionales?",
        a: "Sí. En los arrays de objetos fusiona la forma de todos los elementos: si un campo no está presente en todos, lo marca como opcional con el signo de interrogación.",
      },
      {
        q: "¿Se envía mi JSON a algún servidor?",
        a: "No. El JSON se analiza localmente en tu navegador y no se envía a ningún servidor, así que es seguro para respuestas de API reales.",
      },
    ],
    related: ["formato-json", "convertir-mayusculas", "decodificar-jwt"],
    applicationCategory: "DeveloperApplication",
    applicationSubCategory: "Generador de tipos TypeScript",
    browserRequirements: "Requiere un navegador moderno con JavaScript habilitado.",
  },

  "simbolos-emojis": {
    slug: "simbolos-emojis",
    name: "Símbolos y emojis",
    shortName: "Símbolos",
    category: "desarrollo",
    title: "Símbolos especiales y emojis para copiar | Open Utils",
    description:
      "Busca y copia símbolos especiales y emojis: flechas, matemáticas, moneda, puntuación y caras. Un clic y al portapapeles. En tu navegador, gratis y sin registro.",
    h1: "Símbolos especiales y emojis para copiar y pegar",
    intro: [
      "Encuentra ese carácter que no está en el teclado —una flecha, el símbolo de grados, una comilla angular, el euro, un emoji— y cópialo con un solo clic. Puedes buscar por nombre en español, así que no necesitas saber cómo se llama exactamente.",
      "Están organizados por grupos: flechas, puntuación, matemáticas, moneda, símbolos comunes y varias categorías de emojis.",
    ],
    features: [
      "Símbolos de flechas, matemáticas, moneda y puntuación",
      "Emojis de caras, gestos y objetos",
      "Buscador por nombre en español",
      "Copiar al portapapeles con un clic",
      "Procesamiento 100% local",
    ],
    steps: [
      { name: "Busca o navega", text: "Escribe qué buscas (flecha, corazón, euro…) o recorre los grupos." },
      { name: "Pulsa para copiar", text: "Haz clic en el símbolo o emoji y se copia al portapapeles, listo para pegar." },
    ],
    sections: [
      {
        h2: "Símbolos que no están en el teclado",
        paragraphs: [
          "El teclado deja fuera muchísimos caracteres de uso corriente: flechas para diagramas, el símbolo de grados para temperaturas, las comillas angulares del español, los operadores matemáticos, el símbolo de copyright o de marca registrada. Buscarlos y copiarlos es más rápido que memorizar combinaciones de teclas distintas en cada sistema.",
          "Todos los caracteres son Unicode estándar, así que se ven y se pegan igual en un documento, un correo, un mensaje o el código.",
        ],
      },
      {
        h2: "Todo ocurre en tu navegador",
        paragraphs: [
          "No hay nada que subir ni ninguna búsqueda que viaje a un servidor: el catálogo está en la propia página y el copiado usa el portapapeles de tu navegador.",
        ],
      },
    ],
    faqs: [
      {
        q: "¿Cómo copio un símbolo o un emoji?",
        a: "Haz clic sobre él y se copia al portapapeles automáticamente; después lo pegas donde quieras. También puedes buscarlo por su nombre en español.",
      },
      {
        q: "¿Qué símbolos incluye?",
        a: "Flechas, signos de puntuación, operadores matemáticos, símbolos de moneda, símbolos comunes (copyright, marca registrada, estrellas, checks) y varias categorías de emojis: caras, gestos y objetos.",
      },
      {
        q: "¿Se ven igual en todas partes?",
        a: "Los símbolos son caracteres Unicode estándar, así que se comportan como texto normal. El aspecto exacto de los emojis depende del sistema o la aplicación donde los pegues, como ocurre con cualquier emoji.",
      },
    ],
    related: ["lorem-ipsum", "convertir-mayusculas", "formato-json"],
    applicationCategory: "DeveloperApplication",
    applicationSubCategory: "Selector de símbolos y emojis",
    browserRequirements: "Requiere un navegador moderno con JavaScript habilitado.",
  },

  "editor-markdown": {
    slug: "editor-markdown",
    name: "Editor de Markdown",
    shortName: "Markdown",
    category: "desarrollo",
    title: "Editor de Markdown online con vista previa | Open Utils",
    description:
      "Escribe Markdown y ve el resultado al instante en una vista previa. Exporta a HTML o descarga el .md. En tu navegador, gratis y sin registro.",
    h1: "Editor de Markdown con vista previa en tiempo real",
    intro: [
      "Escribe en Markdown y ve el resultado formateado al lado, según escribes. Soporta encabezados, negrita y cursiva, listas, enlaces, imágenes, citas, bloques de código y tablas. Cuando termines, copia el HTML o descarga el documento como .md o como .html.",
      "La vista previa escapa cualquier etiqueta HTML que aparezca en el texto antes de formatearlo, así que puedes pegar contenido de terceros sin riesgo de que se ejecute nada.",
    ],
    features: [
      "Vista previa en tiempo real mientras escribes",
      "Encabezados, listas, enlaces, imágenes, citas, código y tablas",
      "Vistas: editor, dividido o solo vista previa",
      "Copiar el HTML generado",
      "Descargar como .md o como .html",
      "Procesamiento 100% local",
    ],
    steps: [
      { name: "Escribe en Markdown", text: "Teclea en el editor; la vista previa se actualiza al instante." },
      { name: "Exporta", text: "Copia el HTML, o descarga el documento como archivo .md o .html." },
    ],
    sections: [
      {
        h2: "Qué es Markdown y por qué usarlo",
        paragraphs: [
          "Markdown es una forma de dar formato a un texto usando solo caracteres normales: almohadillas para los títulos, asteriscos para la negrita, guiones para las listas. Se lee bien tal cual, sin renderizar, y se convierte a HTML limpio. Por eso lo usan GitHub, la documentación técnica, muchos blogs y las notas.",
          "Escribirlo con una vista previa al lado te deja comprobar el resultado sin cambiar de aplicación ni publicar nada, y el HTML que genera lo puedes pegar directamente donde lo necesites.",
        ],
      },
      {
        h2: "Se procesa en tu navegador",
        paragraphs: [
          "El texto no se envía a ningún servidor: el Markdown se convierte a HTML con código que se ejecuta en tu propio navegador, así que tus notas y documentos no salen de tu equipo.",
        ],
      },
    ],
    faqs: [
      {
        q: "¿Puedo ver el resultado mientras escribo?",
        a: "Sí. La vista previa se actualiza en tiempo real junto al editor. Puedes elegir entre ver solo el editor, la vista dividida o solo la vista previa.",
      },
      {
        q: "¿Puedo exportar el resultado?",
        a: "Sí. Puedes copiar el HTML generado al portapapeles, o descargar el documento como archivo .md (Markdown) o .html.",
      },
      {
        q: "¿Es seguro pegar texto de otra fuente?",
        a: "Sí. La vista previa escapa cualquier etiqueta HTML del texto antes de formatearlo, así que el contenido pegado no puede ejecutar código. Además, todo se procesa localmente en tu navegador.",
      },
    ],
    related: ["lorem-ipsum", "simbolos-emojis", "convertir-formatos"],
    applicationCategory: "DeveloperApplication",
    applicationSubCategory: "Editor de Markdown",
    browserRequirements: "Requiere un navegador moderno con JavaScript habilitado.",
  },

  "query-string": {
    slug: "query-string",
    name: "Constructor de Query String",
    shortName: "Query String",
    category: "desarrollo",
    title: "Constructor de query string y URLs de API | Open Utils",
    description:
      "Construye y edita la query string de una URL con parámetros, presets y orden alfabético. Impórtala pegando una URL y expórtala a cURL, fetch o Python.",
    h1: "Constructor de query string para URLs de API",
    intro: [
      "Monta la parte de parámetros de una URL sin pelearte con los signos de interrogación y los ampersands. Añades cada parámetro con su clave y su valor, activas o desactivas los que quieras, y la URL completa se arma sola, con los valores correctamente codificados.",
      "Puedes importar una URL o una query string existente pegándola, ordenar los parámetros alfabéticamente, añadir de un clic grupos comunes (paginación, orden, búsqueda, rango de fechas, API) y exportar la petición a cURL, a JavaScript (fetch), a Python (requests) o a Node (axios).",
    ],
    features: [
      "Añade, edita, activa y desactiva parámetros",
      "Importa pegando una URL o query string",
      "Presets: paginación, orden, filtro, búsqueda, fechas, API",
      "Ordena los parámetros alfabéticamente",
      "Codificación correcta de claves y valores",
      "Exporta a cURL, fetch, Python y Node",
    ],
    steps: [
      { name: "Pon la base y los parámetros", text: "Escribe la URL base y añade los parámetros, o importa una URL existente pegándola." },
      { name: "Copia o exporta", text: "Copia la URL resultante, o expórtala como comando cURL o como código en tu lenguaje." },
    ],
    sections: [
      {
        h2: "De parámetros a código listo para pegar",
        paragraphs: [
          "La query string es lo que va después del signo de interrogación en una URL: los pares clave=valor separados por &. Construirla a mano es fácil de estropear —un espacio sin codificar, un & de más— y esta herramienta se encarga de codificar cada valor como toca.",
          "Cuando la tienes montada, la exportas al formato que necesites: un comando cURL para probar en la terminal, o el código equivalente en JavaScript, Python o Node para pegarlo en tu proyecto.",
        ],
      },
      {
        h2: "Todo ocurre en tu navegador",
        paragraphs: [
          "No se hace ninguna petición a las URLs que construyes ni se envía nada a un servidor: la herramienta solo compone el texto de la URL y el código, en tu propio navegador.",
        ],
      },
    ],
    faqs: [
      {
        q: "¿Puedo importar una URL que ya tengo?",
        a: "Sí. Pega la URL completa o solo su query string y la herramienta separa la base y carga cada parámetro en su fila, listo para editarlo.",
      },
      {
        q: "¿A qué lenguajes puedo exportar?",
        a: "A un comando cURL y a código en JavaScript (fetch), Python (requests) y Node (axios). También puedes copiar directamente la URL resultante.",
      },
      {
        q: "¿Se envía alguna petición a las URLs?",
        a: "No. La herramienta solo construye el texto de la URL y del código; no hace ninguna petición ni envía nada a ningún servidor.",
      },
    ],
    related: ["formato-json", "convertir-formatos", "decodificar-jwt"],
    applicationCategory: "DeveloperApplication",
    applicationSubCategory: "Constructor de URLs y query strings",
    browserRequirements: "Requiere un navegador moderno con JavaScript habilitado.",
  },

  "datos-falsos": {
    slug: "datos-falsos",
    name: "Generador de datos falsos",
    shortName: "Datos falsos",
    category: "desarrollo",
    title: "Generador de datos falsos: esquema o Swagger | Open Utils",
    description:
      "Genera datos de prueba con tu propio esquema de campos o importa un Swagger/OpenAPI para rellenar el request y la respuesta de cada endpoint. En tu navegador.",
    h1: "Generador de datos falsos para pruebas",
    intro: [
      "Define un esquema —el nombre de cada campo y su tipo (nombre, email, fecha, UUID, precio, booleano…)— indica cuántos registros necesitas y genera datos de prueba realistas al instante. Exportas el resultado en JSON, CSV, XML, SQL (sentencias INSERT) o como tabla para pegar en una hoja de cálculo.",
      "O importa la especificación de tu API —un archivo OpenAPI 3 o Swagger 2 en JSON o YAML— y la herramienta recorre cada endpoint y genera un ejemplo de cuerpo para su petición y su respuesta, siguiendo el esquema de cada uno: resuelve las referencias ($ref), respeta los enum y ejemplos declarados, y adivina valores realistas a partir del formato y el nombre de cada campo.",
      "Sirve para rellenar una base de datos de desarrollo, probar cómo se comporta una interfaz con muchos registros, montar un mock de tu API a partir de su contrato, o preparar un ejemplo sin usar datos reales de personas.",
    ],
    features: [
      "Esquema personalizable: nombre y tipo de cada campo",
      "Más de 20 tipos: nombre, email, fecha, UUID, precio, IP, color…",
      "Importa OpenAPI 3 o Swagger 2 (JSON o YAML)",
      "Fakea el request y la respuesta de cada endpoint del contrato",
      "Resuelve $ref y respeta enum, ejemplos y rangos del esquema",
      "Hasta 1000 registros por generación en modo esquema",
      "Exporta a JSON, CSV, XML, SQL o tabla (hoja de cálculo)",
      "Procesamiento 100% local",
    ],
    steps: [
      { name: "Elige el modo", text: "Usa un esquema de campos manual o importa tu especificación OpenAPI/Swagger pegándola o subiendo el archivo." },
      { name: "Ajusta lo que necesites", text: "En modo esquema defines campos y cuántos registros; en modo API eliges qué endpoints incluir y cuántos ítems por lista." },
      { name: "Genera y exporta", text: "Pulsa Generar y copia o descarga el resultado en el formato que necesites." },
    ],
    sections: [
      {
        h2: "Datos de prueba sin usar datos reales",
        paragraphs: [
          "Para desarrollar y probar hace falta rellenar tablas y listas, y usar datos reales de clientes para eso es un riesgo innecesario: basta con que ese entorno de pruebas se filtre para tener un problema. Los datos falsos resuelven eso —tienen la forma correcta pero no corresponden a ninguna persona real—.",
          "Aquí defines exactamente los campos que necesitas y su tipo, así que los datos encajan con tu modelo y puedes generar tantos registros como quieras para ver cómo se comporta todo a escala.",
        ],
      },
      {
        h2: "Datos de ejemplo directamente desde tu Swagger",
        paragraphs: [
          "Si ya tienes la especificación de tu API, no hace falta redefinir el esquema a mano. Importa el documento OpenAPI 3 o Swagger 2 —en JSON o en YAML— y la herramienta lo analiza en tu navegador: detecta cada ruta y método, localiza el esquema del cuerpo de la petición y de la respuesta correcta, y rellena ambos con datos falsos que respetan ese contrato.",
          "Resuelve las referencias internas ($ref) a los modelos, sigue los enum y los valores de ejemplo que ya hayas declarado, y para el resto infiere valores realistas a partir del formato (uuid, email, date-time…) y del nombre del campo. El resultado es un documento JSON con un ejemplo de request y response por cada endpoint que elijas, listo para pruebas o para montar un mock.",
        ],
      },
      {
        h2: "Varios formatos de salida",
        paragraphs: [
          "En el modo esquema, el mismo conjunto de datos se exporta a JSON para una API, a CSV o a la tabla para una hoja de cálculo, a XML, o a SQL como sentencias INSERT listas para ejecutar. Y todo se genera en tu navegador, sin enviar nada a ningún servidor.",
        ],
      },
    ],
    faqs: [
      {
        q: "¿Puedo definir qué campos y tipos genero?",
        a: "Sí. Añades cada campo con su nombre y eliges su tipo entre más de veinte (nombre, email, fecha, UUID, precio, ciudad, IP, color y más), y decides cuántos registros generar.",
      },
      {
        q: "¿Puedo generar datos a partir de un Swagger u OpenAPI?",
        a: "Sí. Pega o sube tu especificación OpenAPI 3 o Swagger 2, en JSON o YAML, y la herramienta genera un ejemplo de cuerpo para la petición y la respuesta de cada endpoint siguiendo su esquema, resolviendo las referencias y respetando los enum y ejemplos declarados.",
      },
      {
        q: "¿En qué formatos puedo exportar?",
        a: "En modo esquema exportas a JSON, CSV, XML, SQL (sentencias INSERT) y como tabla separada por tabuladores para pegar en una hoja de cálculo. La importación de Swagger produce un documento JSON con el ejemplo de cada endpoint. Puedes copiar o descargar el resultado.",
      },
      {
        q: "¿Los datos corresponden a personas reales?",
        a: "No. Son datos generados al azar con la forma correcta pero sin relación con ninguna persona real, y todo (incluido el análisis del Swagger) ocurre en tu navegador sin enviar nada a ningún servidor.",
      },
    ],
    related: ["convertir-formatos", "formato-json", "json-a-typescript"],
    applicationCategory: "DeveloperApplication",
    applicationSubCategory: "Generador de datos de prueba",
    browserRequirements: "Requiere un navegador moderno con JavaScript habilitado.",
  },

  "convertir-formatos": {
    slug: "convertir-formatos",
    name: "Conversor de formatos",
    shortName: "Conversor",
    category: "desarrollo",
    title: "Convertir JSON, YAML, CSV, XML, TOML y más | Open Utils",
    description:
      "Convierte datos entre JSON, YAML, CSV y TOML a JSON, YAML, CSV, XML, TOML, SQL, Markdown o HTML. Al instante y en tu navegador. Gratis y sin registro.",
    h1: "Conversor de formatos de datos entre JSON, YAML, CSV y más",
    intro: [
      "Pega tus datos, elige de qué formato vienen y a cuál los quieres, y obtén la conversión al instante. Se leen JSON, YAML, CSV y TOML, y se genera JSON, YAML, CSV, XML, TOML, SQL, tablas de Markdown y tablas de HTML.",
      "Los formatos tabulares (CSV, SQL, Markdown y HTML) necesitan datos con forma de tabla —un array de objetos planos—; cuando los datos están anidados y no encajan en una tabla, la herramienta te lo dice con claridad en vez de generar algo engañoso.",
    ],
    features: [
      "Lee JSON, YAML, CSV y TOML",
      "Genera JSON, YAML, CSV, XML, TOML, SQL, Markdown y HTML",
      "Conversión al instante mientras escribes",
      "Avisa cuando los datos no encajan en el formato pedido",
      "Copiar y descargar el resultado",
      "Procesamiento 100% local",
    ],
    steps: [
      { name: "Pega tus datos y elige formatos", text: "Indica el formato de entrada y el de salida, y pega los datos." },
      { name: "Copia o descarga", text: "La conversión aparece al instante; cópiala o descárgala como archivo." },
    ],
    sections: [
      {
        h2: "Un formato para cada sitio",
        paragraphs: [
          "Los mismos datos viven en formatos distintos según dónde los uses: JSON para una API, YAML para la configuración de un despliegue, TOML para la de una herramienta, CSV para una hoja de cálculo, SQL para cargarlos en una base de datos, o una tabla de Markdown para documentarlos. Pasar de uno a otro a mano es lento y fácil de estropear.",
          "Esta herramienta lo hace pasando siempre por una representación intermedia: interpreta la entrada, y desde ahí genera la salida en el formato que elijas.",
        ],
      },
      {
        h2: "Formatos tabulares y datos anidados",
        paragraphs: [
          "CSV, SQL, Markdown y HTML representan una tabla: filas y columnas. Solo tienen sentido si tus datos son una lista de objetos con los mismos campos. Si tus datos están anidados —objetos dentro de objetos—, no caben en una tabla, y la herramienta te avisa en lugar de aplanarlos de cualquier manera.",
          "JSON, YAML, XML y TOML sí admiten estructuras anidadas, así que para datos con jerarquía esos son los formatos de salida adecuados. Todo el proceso ocurre en tu navegador.",
        ],
      },
    ],
    faqs: [
      {
        q: "¿Entre qué formatos convierte?",
        a: "Lee JSON, YAML, CSV y TOML, y genera JSON, YAML, CSV, XML, TOML, SQL, tablas de Markdown y tablas de HTML. Eliges el formato de entrada y el de salida.",
      },
      {
        q: "¿Por qué me dice que los datos no encajan en el formato?",
        a: "Porque CSV, SQL, Markdown y HTML son formatos de tabla y necesitan una lista de objetos planos. Si tus datos están anidados no caben en una tabla; para ellos usa JSON, YAML, XML o TOML como salida.",
      },
      {
        q: "¿Se envían mis datos a algún servidor?",
        a: "No. La conversión se hace localmente en tu navegador, así que es seguro para datos sensibles como configuraciones o volcados con datos de clientes.",
      },
    ],
    related: ["formato-json", "datos-falsos", "json-a-typescript"],
    applicationCategory: "DeveloperApplication",
    applicationSubCategory: "Conversor de formatos de datos",
    browserRequirements: "Requiere un navegador moderno con JavaScript habilitado.",
  },

  "imagen-placeholder": {
    slug: "imagen-placeholder",
    name: "Generador de imágenes placeholder",
    shortName: "Placeholder",
    category: "imagen-y-video",
    title: "Generador de imágenes placeholder (SVG) | Open Utils",
    description:
      "Crea imágenes placeholder con patrones, colores y texto. Copia como SVG, HTML, CSS o React, y descarga en SVG o PNG. En tu navegador, gratis y sin registro.",
    h1: "Generador de imágenes placeholder con patrones y estilos",
    intro: [
      "Crea imágenes de relleno a medida para maquetar: eliges el tamaño (o una proporción como 16:9, 9:16, 1:1, 4:3…), un patrón de fondo, los colores y el texto que quieras mostrar. La vista previa se actualiza al instante.",
      "Cuando te guste, la copias como SVG, como etiqueta HTML, como regla CSS de fondo o como componente de React, y también puedes descargarla en SVG o en PNG.",
    ],
    features: [
      "Ancho y alto libres o proporciones predefinidas (16:9, 9:16, 1:1, 4:3…)",
      "Patrones: sólido, gradiente, puntos, cuadrícula, diagonales, ruido y blueprint",
      "Colores personalizables y presets de paletas",
      "Texto personalizable sobre la imagen",
      "Copia como SVG, HTML, CSS o componente React",
      "Descarga en SVG o PNG",
    ],
    steps: [
      { name: "Ajusta tamaño, patrón y colores", text: "Elige las dimensiones o una proporción, un patrón, los colores y el texto." },
      { name: "Copia o descarga", text: "Copia el código (SVG, HTML, CSS o React) o descarga la imagen en SVG o PNG." },
    ],
    sections: [
      {
        h2: "Placeholders a medida, sin depender de un servicio externo",
        paragraphs: [
          "Los placeholders sirven para ver cómo queda un diseño antes de tener las imágenes definitivas. Lo habitual es tirar de un servicio online que devuelve la imagen desde su servidor, lo que añade una dependencia externa y una petición de red por cada imagen.",
          "Aquí la imagen se genera como SVG en tu propio navegador, así que no depende de que ningún servicio siga vivo: te llevas el código o el archivo y lo usas donde quieras.",
        ],
      },
      {
        h2: "SVG, PNG, HTML, CSS o React",
        paragraphs: [
          "El mismo placeholder se exporta en varios formatos según dónde lo vayas a usar: el SVG para incrustarlo o editarlo, el PNG para un archivo de imagen, la etiqueta HTML lista para pegar, la regla CSS para usarlo como fondo, o un componente de React reutilizable. Todo se genera localmente, sin subir nada.",
        ],
      },
    ],
    faqs: [
      {
        q: "¿Qué patrones y estilos puedo usar?",
        a: "Color sólido, gradiente, puntos, cuadrícula, líneas diagonales, textura de ruido y estilo blueprint, con colores personalizables o partiendo de un preset de paleta, y con texto propio encima.",
      },
      {
        q: "¿En qué formatos puedo exportar?",
        a: "Puedes copiar el resultado como SVG, como etiqueta HTML, como regla CSS de fondo o como componente de React, y descargarlo como archivo SVG o PNG.",
      },
      {
        q: "¿Se genera en un servidor?",
        a: "No. La imagen se crea como SVG con código que se ejecuta en tu navegador; no se sube ni se descarga nada de ningún servidor.",
      },
    ],
    related: ["editor-imagen", "svg-a-png", "comprimir-imagen"],
    applicationCategory: "MultimediaApplication",
    applicationSubCategory: "Generador de imágenes placeholder",
    browserRequirements: "Requiere un navegador moderno con JavaScript habilitado.",
  },

  "generar-favicon": {
    slug: "generar-favicon",
    name: "Generador de favicon",
    shortName: "Favicon",
    category: "imagen-y-video",
    title: "Generador de favicon (.ico) desde una imagen | Open Utils",
    description:
      "Convierte cualquier imagen en un favicon.ico con varios tamaños (16, 32, 48 y 64 px). En tu navegador, sin subir la imagen a ningún servidor. Gratis y sin registro.",
    h1: "Generador de favicon .ico a partir de una imagen",
    intro: [
      "Sube una imagen o un logo y obtén un favicon.ico listo para tu web. La imagen se recorta al centro en cuadrado y se genera un único archivo .ico que contiene varios tamaños (16, 32, 48 y 64 píxeles), que es lo que los navegadores eligen según dónde muestren el icono.",
      "Verás una vista previa de cómo queda a cada tamaño antes de descargarlo.",
    ],
    features: [
      "Favicon .ico desde cualquier imagen o logo",
      "Incluye los tamaños 16, 32, 48 y 64 px en un solo archivo",
      "Recorte automático al centro en cuadrado",
      "Vista previa a cada tamaño",
      "Procesamiento 100% local",
    ],
    steps: [
      { name: "Elige tu imagen", text: "Arrastra o selecciona la imagen o el logo que quieres convertir." },
      { name: "Descarga el favicon", text: "Revisa la vista previa a cada tamaño y descarga el archivo favicon.ico." },
    ],
    sections: [
      {
        h2: "Un .ico con varios tamaños",
        paragraphs: [
          "El formato .ico puede contener varias resoluciones de la misma imagen dentro de un único archivo, y el navegador escoge la que mejor encaja en cada sitio: la pestaña, un marcador, un acceso directo. Por eso un buen favicon no es una sola imagen, sino varias empaquetadas.",
          "Esta herramienta genera esos tamaños a partir de tu imagen y los une en un solo favicon.ico, renderizando cada uno con suavizado para que se vea nítido incluso a 16 píxeles.",
        ],
      },
      {
        h2: "Tu imagen no se sube a ningún servidor",
        paragraphs: [
          "Todo el proceso —el recorte, el redimensionado y el empaquetado del .ico— ocurre en tu navegador. La imagen no viaja a ningún servidor.",
        ],
      },
    ],
    faqs: [
      {
        q: "¿Qué tamaños incluye el favicon?",
        a: "El archivo .ico generado contiene los tamaños de 16, 32, 48 y 64 píxeles en un solo fichero, para que el navegador use el adecuado en cada contexto.",
      },
      {
        q: "¿Qué imágenes puedo usar?",
        a: "Cualquier imagen que abra tu navegador (PNG, JPG, WebP…). Se recorta automáticamente al centro en formato cuadrado antes de generar los distintos tamaños.",
      },
      {
        q: "¿Se sube mi imagen a un servidor?",
        a: "No. El recorte, el redimensionado y la creación del .ico se hacen localmente en tu navegador; la imagen no sale de tu dispositivo.",
      },
    ],
    related: ["svg-a-png", "editor-imagen", "imagen-placeholder"],
    applicationCategory: "MultimediaApplication",
    applicationSubCategory: "Generador de favicon",
    browserRequirements: "Requiere un navegador moderno con JavaScript habilitado.",
  },

  "svg-a-png": {
    slug: "svg-a-png",
    name: "SVG a PNG",
    shortName: "SVG a PNG",
    category: "imagen-y-video",
    title: "Convertir SVG a PNG online (con escala) | Open Utils",
    description:
      "Convierte un SVG en una imagen PNG a la escala que elijas (1×, 2×, 3×, 4×). Pega el código o abre el archivo. En tu navegador, gratis y sin registro.",
    h1: "Convertir SVG a PNG a la resolución que necesites",
    intro: [
      "Pega el código de un SVG o abre un archivo .svg y conviértelo en un PNG. Como el SVG es vectorial, puedes rasterizarlo a la escala que quieras —1×, 2×, 3× o 4× su tamaño— sin que pierda nitidez, y verás el tamaño de salida en píxeles antes de descargar.",
      "La vista previa te muestra el SVG tal cual antes de convertirlo.",
    ],
    features: [
      "Pega el código SVG o abre un archivo .svg",
      "Escala de salida 1×, 2×, 3× o 4×",
      "Detecta el tamaño del SVG automáticamente",
      "Vista previa antes de convertir",
      "Descarga en PNG con transparencia",
      "Procesamiento 100% local",
    ],
    steps: [
      { name: "Pega o abre tu SVG", text: "Introduce el código SVG o abre un archivo .svg." },
      { name: "Elige la escala y descarga", text: "Selecciona 1×, 2×, 3× o 4× y descarga el PNG resultante." },
    ],
    sections: [
      {
        h2: "Por qué convertir un SVG a PNG",
        paragraphs: [
          "El SVG es ideal por ser vectorial —escala sin perder calidad y pesa poco—, pero no todos los sitios lo aceptan: algunas plataformas, editores o clientes de correo solo admiten imágenes de mapa de bits. Ahí es donde necesitas un PNG.",
          "Como el SVG es vectorial, puedes generar el PNG a la resolución que quieras: 2× o 3× para pantallas de alta densidad, o el tamaño exacto que pida el destino, siempre con bordes nítidos y fondo transparente.",
        ],
      },
      {
        h2: "Se convierte en tu navegador",
        paragraphs: [
          "El SVG se rasteriza con el propio motor gráfico de tu navegador, así que no se sube a ningún servidor y el resultado es idéntico a cómo se ve el SVG en la web.",
        ],
      },
    ],
    faqs: [
      {
        q: "¿A qué resolución puedo exportar el PNG?",
        a: "A 1×, 2×, 3× o 4× el tamaño del SVG. Como el SVG es vectorial, subir la escala no pierde nitidez; la herramienta te muestra el tamaño final en píxeles.",
      },
      {
        q: "¿Puedo pegar el código o tiene que ser un archivo?",
        a: "Las dos cosas: puedes pegar directamente el código SVG o abrir un archivo .svg desde tu equipo.",
      },
      {
        q: "¿El PNG mantiene la transparencia?",
        a: "Sí. Las zonas sin relleno del SVG quedan transparentes en el PNG, y todo se convierte localmente en tu navegador.",
      },
    ],
    related: ["imagen-placeholder", "generar-favicon", "comprimir-imagen"],
    applicationCategory: "MultimediaApplication",
    applicationSubCategory: "Conversor de SVG a PNG",
    browserRequirements: "Requiere un navegador moderno con JavaScript habilitado.",
  },

  "comprimir-imagen": {
    slug: "comprimir-imagen",
    name: "Comprimir imagen",
    shortName: "Comprimir IMG",
    category: "imagen-y-video",
    title: "Comprimir imágenes online sin perder calidad | Open Utils",
    description:
      "Reduce el peso de una imagen ajustando la calidad y el tamaño, y expórtala en JPEG, WebP o PNG. En tu navegador, sin subir nada a ningún servidor.",
    h1: "Comprimir imágenes y reducir su peso en el navegador",
    intro: [
      "Sube una imagen y reduce su tamaño de archivo ajustando la calidad y, si quieres, el ancho máximo. Puedes exportar en JPEG, WebP o PNG y ves al instante cuánto pesa antes y después y el porcentaje de reducción.",
      "WebP suele conseguir archivos más pequeños que JPEG a la misma calidad aparente, así que si el destino lo admite, es la opción que más reduce.",
    ],
    features: [
      "Reduce el peso ajustando la calidad",
      "Redimensiona por ancho máximo si lo necesitas",
      "Exporta en JPEG, WebP o PNG",
      "Muestra el peso antes y después y el % de reducción",
      "Vista previa del resultado",
      "Procesamiento 100% local",
    ],
    steps: [
      { name: "Elige tu imagen", text: "Arrastra o selecciona la imagen que quieres comprimir." },
      { name: "Ajusta y descarga", text: "Mueve la calidad (y el ancho máximo si quieres), comprueba la reducción y descarga." },
    ],
    sections: [
      {
        h2: "Calidad, formato y tamaño: las tres palancas",
        paragraphs: [
          "El peso de una imagen depende sobre todo de tres cosas: la calidad de compresión, el formato y las dimensiones. Bajar la calidad reduce el archivo a costa de detalle, aunque entre el 60 % y el 80 % la pérdida suele ser imperceptible en fotografías. Cambiar a WebP reduce más que JPEG a igualdad de calidad. Y reducir el ancho, cuando la imagen se va a ver pequeña, es lo que más ahorra.",
          "Aquí controlas las tres y ves el resultado al momento, así que puedes buscar el punto donde el archivo pesa lo mínimo sin que se note.",
        ],
      },
      {
        h2: "La imagen no se sube a ningún servidor",
        paragraphs: [
          "Muchos compresores online suben tu imagen a su servidor, la procesan allí y la guardan un tiempo. Aquí no: la compresión se hace con el motor de tu navegador y la imagen no sale de tu equipo.",
        ],
      },
    ],
    faqs: [
      {
        q: "¿Comprime sin que se note la pérdida de calidad?",
        a: "En fotografías, una calidad del 60–80 % reduce mucho el peso con una pérdida casi imperceptible. Como ves la vista previa y el tamaño resultante al instante, puedes ajustar hasta el punto que te convenza.",
      },
      {
        q: "¿En qué formatos puedo exportar?",
        a: "En JPEG, WebP o PNG. JPEG y WebP son los que más comprimen —WebP suele lograr archivos más pequeños que JPEG a la misma calidad aparente— y PNG es útil cuando necesitas conservar la transparencia.",
      },
      {
        q: "¿Se sube mi imagen a un servidor?",
        a: "No. La compresión se hace localmente en tu navegador; la imagen no se envía a ningún servidor.",
      },
    ],
    related: ["editor-imagen", "svg-a-png", "marca-de-agua"],
    applicationCategory: "MultimediaApplication",
    applicationSubCategory: "Compresor de imágenes",
    browserRequirements: "Requiere un navegador moderno con JavaScript habilitado.",
  },

  "marca-de-agua": {
    slug: "marca-de-agua",
    name: "Marca de agua",
    shortName: "Marca de agua",
    category: "imagen-y-video",
    title: "Añadir marca de agua a imágenes online | Open Utils",
    description:
      "Pon una marca de agua de texto o de logo sobre tus imágenes, con posición, opacidad, tamaño y mosaico. En tu navegador, sin subir la imagen a ningún servidor.",
    h1: "Añadir una marca de agua a tus imágenes",
    intro: [
      "Protege o firma tus imágenes con una marca de agua. Puede ser un texto —tu nombre, un aviso de copyright— o un logo en PNG, y controlas su posición, su opacidad y su tamaño. También puedes repetirla en mosaico sobre toda la imagen para que sea más difícil de quitar.",
      "La vista previa se actualiza en tiempo real mientras ajustas, y al terminar descargas la imagen con la marca ya incrustada.",
    ],
    features: [
      "Marca de agua de texto o de logo (imagen)",
      "Control de posición, opacidad y tamaño",
      "Repetición en mosaico sobre toda la imagen",
      "Vista previa en tiempo real",
      "Descarga en PNG con la marca incrustada",
      "Procesamiento 100% local",
    ],
    steps: [
      { name: "Sube la imagen base", text: "Arrastra o selecciona la imagen a la que quieres poner la marca de agua." },
      { name: "Configura la marca", text: "Elige texto o logo y ajusta posición, opacidad, tamaño o el modo mosaico." },
      { name: "Descarga", text: "Descarga la imagen con la marca de agua ya aplicada." },
    ],
    sections: [
      {
        h2: "Texto o logo, fija o en mosaico",
        paragraphs: [
          "Una marca de agua sirve para dos cosas: dejar claro de quién es una imagen y dificultar que se reutilice sin permiso. Para lo primero suele bastar una marca discreta en una esquina; para lo segundo es más eficaz repetirla en mosaico por toda la imagen, porque recortarla deja de ser trivial.",
          "Aquí puedes hacer ambas: colocar una marca de texto o un logo en la posición que elijas, o activar el mosaico para cubrir toda la superficie, ajustando siempre la opacidad para que se note lo justo.",
        ],
      },
      {
        h2: "La imagen no se sube a ningún servidor",
        paragraphs: [
          "La marca de agua se dibuja sobre la imagen con el canvas de tu propio navegador, así que la imagen original —que a menudo es precisamente la que no quieres que circule sin marca— no se envía a ningún sitio.",
        ],
      },
    ],
    faqs: [
      {
        q: "¿Puedo usar un logo o solo texto?",
        a: "Las dos opciones: puedes poner una marca de agua de texto (con su color) o subir un logo en PNG. En ambos casos controlas la posición, la opacidad y el tamaño, y puedes repetirla en mosaico.",
      },
      {
        q: "¿Sobre qué archivos funciona?",
        a: "Sobre imágenes (PNG, JPG, WebP…). La marca se dibuja encima y descargas el resultado como PNG con la marca ya incrustada.",
      },
      {
        q: "¿Se sube mi imagen a un servidor?",
        a: "No. La marca de agua se aplica localmente en tu navegador con el canvas; la imagen no se envía a ningún servidor.",
      },
    ],
    related: ["editor-imagen", "comprimir-imagen", "imagen-placeholder"],
    applicationCategory: "MultimediaApplication",
    applicationSubCategory: "Marca de agua para imágenes",
    browserRequirements: "Requiere un navegador moderno con JavaScript habilitado.",
  },

  "comprimir-zip": {
    slug: "comprimir-zip",
    name: "Comprimir a ZIP",
    shortName: "Crear ZIP",
    category: "documentos",
    title: "Comprimir archivos en un ZIP online | Open Utils",
    description:
      "Junta varios archivos en un único .zip directamente en tu navegador, sin subirlos a ningún servidor. Gratis, sin marca de agua y sin registro.",
    h1: "Comprimir varios archivos en un único ZIP",
    intro: [
      "Arrastra todos los archivos que quieras y comprímelos en un único .zip listo para enviar o guardar. Los archivos se empaquetan y comprimen dentro de tu navegador, así que no se suben a ningún servidor.",
      "Es lo práctico cuando tienes que mandar varios ficheros juntos: en vez de adjuntarlos uno a uno, los reúnes en un solo archivo que ocupa menos.",
    ],
    features: [
      "Junta varios archivos en un solo .zip",
      "Compresión DEFLATE estándar",
      "Nombre del ZIP personalizable",
      "Quita archivos de la lista antes de comprimir",
      "Procesamiento 100% local",
    ],
    steps: [
      { name: "Añade tus archivos", text: "Arrastra o selecciona todos los archivos que quieres incluir." },
      { name: "Descarga el ZIP", text: "Ponle nombre y descarga el archivo .zip con todo dentro." },
    ],
    sections: [
      {
        h2: "Un solo archivo en lugar de muchos",
        paragraphs: [
          "El ZIP es el formato de compresión más universal: lo abren todos los sistemas sin instalar nada. Reunir varios archivos en uno solo facilita enviarlos —un único adjunto en lugar de diez— y además reduce el tamaño total gracias a la compresión.",
          "Aquí eliges los archivos, les das un nombre al paquete y obtienes el .zip, todo sin salir del navegador.",
        ],
      },
      {
        h2: "Tus archivos no se suben a ningún servidor",
        paragraphs: [
          "El empaquetado y la compresión se hacen con código que se ejecuta en tu dispositivo. Los archivos que metes en el ZIP no viajan a ningún servidor, lo que importa cuando son documentos privados.",
        ],
      },
    ],
    faqs: [
      {
        q: "¿Puedo meter varios archivos en un ZIP?",
        a: "Sí. Añades todos los archivos que quieras —arrastrándolos o seleccionándolos—, les das un nombre al paquete y descargas un único .zip con todo dentro.",
      },
      {
        q: "¿Se suben mis archivos a un servidor?",
        a: "No. El ZIP se crea localmente en tu navegador; los archivos no se envían a ningún servidor.",
      },
      {
        q: "¿Con qué programas se puede abrir el ZIP?",
        a: "Con cualquiera: el .zip es un formato estándar que abren de serie Windows, macOS, Linux, Android e iOS sin instalar nada.",
      },
    ],
    related: ["descomprimir-zip", "unir-pdf", "ver-metadatos"],
    applicationCategory: "UtilitiesApplication",
    applicationSubCategory: "Compresor de archivos ZIP",
    browserRequirements: "Requiere un navegador moderno con JavaScript habilitado.",
  },

  "descomprimir-zip": {
    slug: "descomprimir-zip",
    name: "Descomprimir ZIP",
    shortName: "Abrir ZIP",
    category: "documentos",
    title: "Descomprimir un ZIP online y ver su contenido | Open Utils",
    description:
      "Abre un archivo .zip en el navegador, mira qué contiene y descarga los archivos que necesites, sin subir nada a ningún servidor. Gratis y sin registro.",
    h1: "Descomprimir un ZIP y ver su contenido en el navegador",
    intro: [
      "Abre un .zip y consulta al instante todo lo que hay dentro —archivos y carpetas, con su tamaño e ícono según el tipo de archivo— sin tener que extraerlo entero en tu equipo. Después descargas solo los archivos que te interesen.",
      "Lo recorres de tres maneras: como árbol de carpetas plegable, en pestañas para saltar entre archivos, o como un explorador que abres carpeta por carpeta. Al seleccionar un archivo ves su contenido: el texto y el código con resaltado de colores, y las imágenes en vista previa.",
      "Es cómodo cuando te llega un ZIP y solo quieres un archivo concreto, o simplemente comprobar qué contiene antes de descomprimirlo del todo.",
    ],
    features: [
      "Tres vistas: árbol de carpetas, pestañas y explorador",
      "Vista previa del contenido: texto y código con colores, e imágenes",
      "Ícono por tipo de archivo para identificarlos de un vistazo",
      "Muestra el tamaño de cada archivo y la estructura de carpetas",
      "Descarga archivos concretos, sin extraer todo",
      "Procesamiento 100% local",
    ],
    steps: [
      { name: "Abre tu ZIP", text: "Arrastra o selecciona el archivo .zip que quieres inspeccionar." },
      { name: "Explóralo a tu manera", text: "Cambia entre árbol, pestañas o explorador y haz clic en un archivo para ver su contenido." },
      { name: "Descarga lo que necesites", text: "Descarga los archivos concretos que quieras, sin extraer todo el ZIP." },
    ],
    sections: [
      {
        h2: "Mira dentro antes de extraer",
        paragraphs: [
          "A veces no hace falta descomprimir un ZIP entero: solo quieres ver qué trae, leer un archivo o rescatarlo. Esta herramienta lee el índice del ZIP y te lo muestra —con carpetas, tamaños e íconos por tipo— y te deja abrir el contenido de cada archivo: texto y código con resaltado de sintaxis, e imágenes en vista previa.",
          "Puedes recorrerlo como un árbol plegable, en pestañas o como un explorador de carpetas, según lo que te resulte más cómodo. Todo se hace leyendo el archivo en tu navegador, así que es inmediato y no depende de instalar ningún descompresor.",
        ],
      },
      {
        h2: "El ZIP no se sube a ningún servidor",
        paragraphs: [
          "El archivo se abre y se lee dentro de tu navegador; su contenido no se envía a ningún servidor. Es lo prudente cuando el ZIP puede contener documentos privados.",
        ],
      },
    ],
    faqs: [
      {
        q: "¿Puedo ver qué hay dentro de un ZIP sin extraerlo?",
        a: "Sí. La herramienta lista todos los archivos y carpetas del ZIP con su tamaño, y descargas solo los que quieras, sin tener que extraer el archivo completo.",
      },
      {
        q: "¿Puedo ver el contenido de los archivos del ZIP?",
        a: "Sí. Al seleccionar un archivo se muestra su contenido: el texto y el código con resaltado de colores, y las imágenes en vista previa. Los archivos que no se pueden previsualizar se pueden descargar.",
      },
      {
        q: "¿De qué formas puedo explorar el ZIP?",
        a: "De tres: como un árbol de carpetas plegable, en pestañas para saltar entre archivos, o como un explorador en el que entras carpeta por carpeta. Cada archivo lleva un ícono según su tipo para identificarlo de un vistazo.",
      },
      {
        q: "¿Se sube mi ZIP a un servidor?",
        a: "No. El ZIP se abre y se lee localmente en tu navegador; su contenido no se envía a ningún servidor.",
      },
    ],
    related: ["comprimir-zip", "ver-metadatos", "dividir-pdf"],
    applicationCategory: "UtilitiesApplication",
    applicationSubCategory: "Descompresor de archivos ZIP",
    browserRequirements: "Requiere un navegador moderno con JavaScript habilitado.",
  },

  "ver-metadatos": {
    slug: "ver-metadatos",
    name: "Ver metadatos",
    shortName: "Metadatos",
    category: "documentos",
    title: "Ver metadatos de imágenes y PDF online | Open Utils",
    description:
      "Consulta los metadatos de una imagen (dimensiones, EXIF de la cámara) o de un PDF (autor, título, páginas, fechas), sin subir el archivo a ningún servidor.",
    h1: "Ver los metadatos de una imagen o un PDF",
    intro: [
      "Abre una imagen o un PDF y consulta la información que lleva dentro. De una imagen ves sus dimensiones, proporción y, si es una foto con datos EXIF, la cámara, la fecha de captura, la orientación y parámetros como el ISO o la apertura. De un PDF ves el número de páginas, el tamaño, y los metadatos del documento: título, autor, asunto, creador y fechas.",
      "Es útil para comprobar qué información revela un archivo antes de compartirlo, o para consultar de qué cámara y con qué ajustes salió una foto.",
    ],
    features: [
      "Metadatos de imágenes: dimensiones, proporción y megapíxeles",
      "EXIF de fotos: cámara, fecha, orientación, ISO, apertura",
      "Metadatos de PDF: título, autor, asunto, creador y fechas",
      "Número de páginas y tamaño de página del PDF",
      "Procesamiento 100% local",
    ],
    steps: [
      { name: "Elige tu archivo", text: "Arrastra o selecciona una imagen (JPG, PNG, WebP…) o un PDF." },
      { name: "Lee los metadatos", text: "Verás la información del archivo organizada en una tabla." },
    ],
    sections: [
      {
        h2: "Qué información lleva un archivo por dentro",
        paragraphs: [
          "Muchos archivos guardan datos que no se ven al abrirlos. Las fotos suelen llevar EXIF: el modelo de cámara o móvil, la fecha y hora exactas, la orientación y los ajustes de disparo. Los PDF guardan el título, el autor, el programa con el que se crearon y las fechas de creación y modificación.",
          "Consultar esos metadatos sirve tanto para curiosear los datos de una foto como para revisar, antes de publicar un documento, qué información sobre su origen estás compartiendo sin darte cuenta.",
        ],
      },
      {
        h2: "El archivo no se sube a ningún servidor",
        paragraphs: [
          "Los metadatos se leen dentro de tu navegador. El archivo —que puede ser una foto personal o un documento privado— no se envía a ningún servidor.",
        ],
      },
    ],
    faqs: [
      {
        q: "¿Qué metadatos veo de una imagen?",
        a: "Sus dimensiones, proporción y megapíxeles, además del tipo y el tamaño. Si es una foto JPEG con datos EXIF, también la cámara, la fecha de captura, la orientación y ajustes como el ISO, la apertura y la distancia focal cuando están disponibles.",
      },
      {
        q: "¿Qué metadatos veo de un PDF?",
        a: "El número de páginas y el tamaño de página, y los metadatos del documento: título, autor, asunto, palabras clave, creador, productor y las fechas de creación y modificación cuando existen.",
      },
      {
        q: "¿Se sube mi archivo a un servidor?",
        a: "No. Los metadatos se leen localmente en tu navegador; el archivo no se envía a ningún servidor.",
      },
    ],
    related: ["comprimir-zip", "descomprimir-zip", "editor-pdf"],
    applicationCategory: "UtilitiesApplication",
    applicationSubCategory: "Visor de metadatos de archivos",
    browserRequirements: "Requiere un navegador moderno con JavaScript habilitado.",
  },
};

/** Canonical order — drives the sitemap, the sidebar and the home grid. */
export const TOOL_ORDER = [
  "editor-pdf",
  "editor-imagen",
  "pdf-a-imagen",
  "imagen-a-pdf",
  "unir-pdf",
  "dividir-pdf",
  "video-a-gif",
  "gif-a-video",
  "formato-json",
  "codificar-base64",
  "decodificar-base64",
  "convertir-mayusculas",
  "lorem-ipsum",
  "decodificar-jwt",
  "json-a-typescript",
  "simbolos-emojis",
  "editor-markdown",
  "query-string",
  "datos-falsos",
  "convertir-formatos",
  "imagen-placeholder",
  "generar-favicon",
  "svg-a-png",
  "comprimir-imagen",
  "marca-de-agua",
  "comprimir-zip",
  "descomprimir-zip",
  "ver-metadatos",
] as const;

export const ALL_TOOLS: ToolSeo[] = TOOL_ORDER.map((slug) => TOOLS_SEO[slug]);

export function getTool(slug: string): ToolSeo {
  const tool = TOOLS_SEO[slug];
  if (!tool) throw new Error(`Unknown tool slug: ${slug}`);
  return tool;
}

/** Tools in a category, in canonical `TOOL_ORDER`. Drives every grouped list. */
export function toolsInCategory(id: CategoryId): ToolSeo[] {
  return ALL_TOOLS.filter((t) => t.category === id);
}

/** Home FAQ — verified against the code (size limits are real; there is no PWA). */
export const HOME_FAQS: Faq[] = [
  {
    q: "¿Open Utils es gratis?",
    a: "Sí. Todas las herramientas son gratuitas, sin marca de agua y sin límite de uso. No hay plan de pago, no hay versión pro y no hay funciones bloqueadas: es un proyecto de código abierto con licencia MIT.",
  },
  {
    q: "¿Se suben mis archivos a algún servidor?",
    a: "No. Todo el procesamiento ocurre dentro de tu navegador, así que tus archivos nunca salen de tu dispositivo. Puedes comprobarlo en la pestaña Red de las herramientas de desarrollo: no se envía ninguna petición con tu archivo.",
  },
  {
    q: "¿Necesito registrarme o instalar algo?",
    a: "No. Abres la herramienta en el navegador y empiezas a usarla; no hay cuentas, ni instalaciones, ni descargas.",
  },
  {
    q: "¿Por qué Open Utils es más privado que otras webs de utilidades?",
    a: "Porque no envía tus archivos a la nube: la conversión y la edición se hacen localmente en tu equipo. Sin subida no hay copia, y sin copia no hay retención que confiar a nadie.",
  },
  {
    q: "¿Añade marca de agua a los archivos?",
    a: "No. Los archivos que descargas no llevan ninguna marca, logo ni referencia a Open Utils.",
  },
  {
    q: "¿Funciona sin conexión a internet?",
    a: "Necesitas conexión para cargar la página la primera vez. Una vez cargada, el procesamiento de tus archivos no consume red, porque se hace íntegramente en tu dispositivo.",
  },
  {
    q: "¿Hay límite de tamaño?",
    a: "Sí, un límite razonable por archivo: 50 MB en los conversores y en Unir PDF, y 100 MB en el Editor de PDF y en Dividir PDF. Por debajo de eso, el único freno es la memoria de tu dispositivo, porque todo se procesa en local.",
  },
  {
    q: "¿Open Utils usa cookies o me rastrea?",
    a: "No hay cookies ni rastreo publicitario. Solo se registran mediciones anónimas y agregadas de dos cosas: cuántas veces se abre cada herramienta y cuánto tarda la página en cargar. No identifican a ningún usuario ni construyen un perfil, y tus archivos quedan siempre fuera de ellas, porque nunca salen de tu navegador.",
  },
];
