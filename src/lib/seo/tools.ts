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

export type ToolSeo = {
  slug: string;
  /** Full name, used in breadcrumbs, JSON-LD and nav. */
  name: string;
  /** Short label for the sidebar rail. */
  shortName: string;
  category: string;
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
    category: "Documentos",
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
    category: "Multimedia",
    title: "Editor de imágenes online: dibuja y escribe | Open Utils",
    description:
      "Dibuja a mano, escribe texto, resalta y añade formas sobre cualquier imagen. Exporta en PNG o JPG, gratis y sin subir la imagen a ningún servidor.",
    h1: "Editor de imágenes online: dibuja y escribe sobre tu imagen",
    intro: [
      "Abre cualquier imagen y anótala: dibuja a mano alzada, escribe texto encima, resáltala, enciérrala en recuadros de colores y añade formas y flechas. Al terminar la exportas en PNG o en JPG, con la resolución original intacta.",
      "Está pensado para lo que uno hace realmente con una captura de pantalla: señalar el botón del que estás hablando, tapar un dato, rodear el error, poner una nota. No es un Photoshop —no hay capas, filtros ni retoque—, es una herramienta de anotación rápida que se abre en un segundo.",
    ],
    features: [
      "Dibujo a mano alzada",
      "Texto sobre la imagen",
      "Resaltado",
      "Recuadros y formas de colores",
      "Flechas para señalar",
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
        q: "¿En qué formato puedo exportar la imagen?",
        a: "Puedes exportar la imagen editada en PNG o en JPG. El PNG conserva la transparencia; el JPG pesa menos y se guarda sobre fondo blanco. En los dos casos se exporta al tamaño original de la imagen.",
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
    category: "Documentos",
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
    category: "Documentos",
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
    category: "Documentos",
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
    category: "Documentos",
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
    category: "Multimedia",
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
    category: "Multimedia",
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
    category: "Desarrollo",
    title: "Formatear JSON online: validar y minificar | Open Utils",
    description:
      "Formatea, valida y minifica JSON al instante en tu navegador. Ideal para datos sensibles: nada se envía a ningún servidor. Gratis y sin registro.",
    h1: "Formatear JSON online: indenta, valida y minifica",
    intro: [
      "Pega un JSON y formátealo con la indentación que prefieras, valídalo para localizar el error exacto si está mal, o minifícalo para dejarlo en una sola línea. Todo ocurre en tu navegador, al instante.",
      "Si el JSON no es válido, la herramienta te dice qué falla y en qué posición, en lugar de limitarse a decir que hay un error.",
    ],
    features: [
      "Formatea e indenta JSON con 2 o 4 espacios",
      "Valida y señala el error exacto",
      "Minifica a una sola línea",
      "Copiar al portapapeles y descargar",
      "Procesamiento 100% local",
    ],
    steps: [
      {
        name: "Pega tu JSON",
        text: "Pega el contenido en el editor, o arrastra un archivo .json.",
      },
      {
        name: "Formatea, valida o minifica",
        text: "Elige la indentación y pulsa Formatear, o Minificar para dejarlo en una línea. La validación es automática.",
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
        q: "¿Mis datos se envían a algún servidor?",
        a: "No. El JSON se procesa localmente en tu navegador, así que es seguro para datos sensibles: respuestas de API de producción, tokens o volcados con datos de clientes.",
      },
    ],
    related: ["editor-pdf", "pdf-a-imagen"],
    applicationCategory: "DeveloperApplication",
    applicationSubCategory: "Formateador y validador de JSON",
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
] as const;

export const ALL_TOOLS: ToolSeo[] = TOOL_ORDER.map((slug) => TOOLS_SEO[slug]);

export function getTool(slug: string): ToolSeo {
  const tool = TOOLS_SEO[slug];
  if (!tool) throw new Error(`Unknown tool slug: ${slug}`);
  return tool;
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
