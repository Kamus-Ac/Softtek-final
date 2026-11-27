# Páginas personalizadas de restaurantes

Este módulo reúne las herramientas de edición y presentación del contenido personalizado. La fase 1.6.3.B agrega cinco widgets al editor experimental y a su documento versionado. El motor usa **GrapesJS Core 0.23.9**, de licencia **BSD-3-Clause**. [Código y licencia de GrapesJS](https://github.com/GrapesJS/grapesjs/blob/v0.23.9/packages/core/LICENSE)

## Prueba de concepto del editor

Desde `apps/publica`, ejecuta `npm ci` y `npm run dev`. Abre [/editor/demo-restaurant](http://localhost:3000/editor/demo-restaurant). Arrastra elementos desde **Bloques**. Haz doble clic en un título o párrafo para editarlo. **Capas** refleja el anidamiento y permite seleccionar los grupos. El historial de la sesión admite deshacer y rehacer.

| Categoría | Bloques |
| --- | --- |
| Contenido | Encabezado, texto, imagen local y botón. |
| Estructura | Sección, contenedor, dos columnas, tres columnas, separador y espaciador. |
| Multimedia | Galería local de tres espacios que reutilizan la ilustración de la demostración. |
| Restaurante | Portada, menú dinámico experimental, horarios comerciales, ubicación, contacto, disponibilidad y reservaciones. |

Arrastra un contenedor a una sección, un grupo de columnas al contenedor y texto o imágenes a las columnas. Puedes mover el contenido entre columnas y duplicar o eliminar el grupo completo. Las columnas individuales se conservan para mantener la estructura del bloque. El botón de ejemplo es decorativo y las imágenes locales ofrecen texto alternativo en **Ajustes**.

El lienzo usa CSS Grid. Los grupos de tres columnas y la galería pasan a dos a 768 px. Todos esos grupos se apilan a 480 px. El menú en cuadrícula también se apila a ese ancho. El selector muestra escritorio, tablet de 768 px y móvil de 375 px. Los cambios de estilo en tablet y móvil generan reglas `max-width` que se aplican en cascada. Un ajuste móvil conserva su ámbito de 375 px.

**Estilos** ofrece familia, tamaño, peso, color, alineación e interlineado de texto. También ofrece ancho, alto, ancho máximo, márgenes, padding, modo de distribución, separación y alineación de elementos, fondo, bordes, radio, sombras y opacidad. Los controles dependen del elemento elegido. Por ejemplo, el espaciador expone la altura y el widget de menú expone estilos de presentación de la sección.

### Contexto público y widgets

El workspace llama a `getEditorRestaurant` en el servidor. La asociación de demostración `demo-restaurant` → `rest-casa-oliva` solicita la ficha canónica `casa-oliva` a `RestaurantService`. La proyección compartida contiene identidad, nombre, horarios semanales, ubicación sin coordenadas, contacto público, menú y ejemplos de disponibilidad. El menú se reutiliza de la ficha y `getMenu` queda como alternativa cuando la ficha carece de ese campo. Otros identificadores conservan el editor y muestran estados sin datos. La asociación identifica una muestra pública. Las rutas administrativas requieren autorización real en servidor.

| Tipo | Opciones en Ajustes | Información operativa en el lienzo |
| --- | --- | --- |
| `restaurant-menu` | Título, lista o cuadrícula, visibilidad de descripciones e imágenes | Categorías, platillos, precios, disponibilidad e imágenes locales admitidas. |
| `restaurant-hours` | Título, lista o compacta, días cerrados visibles u ocultos | Horarios locales semanales. Muestra cada intervalo e identifica cierres al día siguiente. |
| `restaurant-location` | Título, lista o compacta, visibilidad de ciudad, estado y país | Dirección de la demostración y campos públicos de la ficha. |
| `restaurant-contact` | Título, lista o compacta, visibilidad de teléfono, correo y web | Canales publicados como texto. La ficha de Casa Oliva contiene solamente correo. |
| `restaurant-availability` | Título, lista o compacta | Dos consultas fijas para 2 personas, el 10 y el 9 de junio de 2036. Muestra horas en la zona del restaurante, una lista vacía o un estado sin datos. |
| `restaurant-reservation` | Título, descripción editorial, texto del botón y alineación | La ruta demostrativa `/restaurantes/casa-oliva/reservar`, derivada del slug con `routes.reserve`, y un botón deshabilitado. |

Los nuevos widgets ofrecen tamaño e interlineado del texto, color, fondo, márgenes, padding y opacidad mediante **Estilos**. Sus vistas crean los nodos con el DOM y `textContent`. Los datos quedan fuera del árbol editable, de modo que seleccionar, mover, duplicar y eliminar actúa sobre la instancia. El horario semanal se presenta como referencia y la disponibilidad corresponde a ejemplos fijos. El lienzo carece de selección de horarios, enlaces activos de contacto, mapas y acciones de reserva. Las restricciones de interfaz no sustituyen la validación ni la autorización en servidor.

### Integración con App Router

- `editor/components/GrapesEditor.tsx` importa el CSS oficial en el workspace. Un efecto del Client Component carga el motor con `import()` e inicializa una instancia en la referencia al contenedor. El desmontaje cancela una carga pendiente y llama a `destroy()` si ya existe una instancia. Al volver a entrar se carga el documento de demostración. `editor/components/GrapesEditor.module.css` limita los ajustes de tamaño al workspace.
- `editor/config/grapes-editor-config.ts` configura el motor y las restricciones del lienzo. `editor-style-sectors.ts` define los sectores del Style Manager y `grapes-editor-demo.ts` contiene el documento inicial. `grapesjs-locale.d.ts` declara el submódulo oficial de traducción al español.
- `registry/register-editor-blocks.ts` registra los tipos personalizados y los bloques. `types/restaurant-widgets.ts` define el catálogo de opciones que usan Ajustes y el validador. `theme/restaurant-widget-canvas-styles.ts` aplica estilos a las vistas del editor fuera del CSS serializado, de modo que las capturas de la fase 1.6.3.A conservan su tema base.
- GrapesJS 0.23.9 puede programar un reinicio del contenedor temporal de arrastre después de destruir el editor. La configuración cancela ese callback antes de que se retire el lienzo. Al actualizar GrapesJS, vuelve a probar la navegación inmediatamente después de arrastrar un bloque y revisa si se puede retirar la solución.
- `EditorWorkspaceScreen.tsx` carga el contexto compartido en el servidor. La vista previa vive en un segmento hermano y muestra contenido provisional independiente del lienzo. Las fichas públicas conservan su renderizado en servidor.

## Proyecto editable y documento V1

Usa **Validar documento** debajo del editor de demostración. El diagnóstico muestra el JSON normalizado o la ruta que impidió convertirlo. **Recargar en memoria** usa la última captura válida si aún es idéntica al lienzo. Tras editar, vuelve a validar antes de recargar. Al reconstruir los modelos, GrapesJS reinicia el historial de la sesión.

El proyecto obtenido con `getProjectData()` es la fuente de verdad y conserva sus páginas, marcos, activos y reglas. El sobre `EditablePageProjectV1` añade `formatVersion`, versión del editor e identidad del documento. `PageDocumentV1` deriva de esa misma captura y usa `schemaVersion`, identidad, tema y bloques. Los tipos y el validador del documento pueden ejecutarse sin GrapesJS. La recarga usa el proyecto editable con `loadProjectData()`. [Guía de datos de proyecto de GrapesJS](https://grapesjs.com/docs/modules/Storage.html#project-data)

Estos fragmentos proceden de la misma sesión y omiten componentes y reglas. Durante el diagnóstico, el sobre editable conserva el proyecto completo en memoria.

```json
{
  "formatVersion": 1,
  "editor": "grapesjs",
  "editorVersion": "0.23.9",
  "documentId": "page-39e1760cb117dcd9d772f639f3714aaf",
  "restaurantId": "rest-casa-oliva",
  "project": {
    "pages": [{
      "id": "sGPyL2MM3oQqREF2",
      "frames": [{
        "id": "ui1HkjJmGcIzpC77",
        "component": {
          "type": "wrapper",
          "components": [{
            "type": "restaurant-menu",
            "classes": ["builder-menu"],
            "attributes": { "id": "i7ak5" },
            "pageBlockId": "block-e12203eec2e2974c11ca52c07e04e6d1",
            "menuTitle": "Carta de temporada",
            "menuLayout": "grid",
            "showDescriptions": false,
            "showImages": false
          }]
        }
      }]
    }],
    "styles": [{
      "selectors": ["#i5325"],
      "style": { "font-size": "21px" },
      "mediaText": "(max-width: 375px)",
      "atRuleType": "media"
    }]
  }
}
```

```json
{
  "schemaVersion": 1,
  "documentId": "page-39e1760cb117dcd9d772f639f3714aaf",
  "restaurantId": "rest-casa-oliva",
  "theme": { "preset": "restaurant-demo-v1" },
  "blocks": [{
    "id": "block-e12203eec2e2974c11ca52c07e04e6d1",
    "type": "restaurant-menu",
    "options": {
      "menuTitle": "Carta de temporada",
      "menuLayout": "grid",
      "showDescriptions": false,
      "showImages": false
    }
  }]
}
```

### Identidad, bloques y diseño

Cada instancia guarda `pageBlockId` desde su creación. La duplicación asigna nuevos identificadores al grupo y a todos sus bloques internos. Mover o editar conserva el ID, y deshacer o rehacer una duplicación recupera los IDs de la operación. El adaptador usa `attributes.id` únicamente como enlace desde los selectores de GrapesJS hasta el bloque que recibe los estilos. El ID del documento dura la sesión experimental.

| Catálogo | Representación V1 comprobada |
| --- | --- |
| Encabezado, texto y botón | `heading` con nivel, `text` y `button` sin acción, con contenido en línea estructurado. |
| Imagen local | `image` con referencia autorizada y texto alternativo. |
| Sección y contenedor | `section` y `container`, con hijos ordenados y variante de introducción o estándar. |
| Dos columnas y tres columnas | `columns` con 2 o 3 hijos `column`, que conservan sus propios bloques. |
| Separador y espaciador | `divider` y `spacer`, ambos sin hijos. |
| Galería local y portada | `gallery` con imágenes y `cover` con hijos ordenados. |
| Menú dinámico experimental | `restaurant-menu` con cuatro opciones de presentación. |
| Horarios, ubicación, contacto, disponibilidad y reservaciones | `restaurant-hours`, `restaurant-location`, `restaurant-contact`, `restaurant-availability` y `restaurant-reservation`, con opciones de presentación e identidad por instancia. |

El tema `restaurant-demo-v1` identifica las reglas base del código. Los estilos editables por instancia se normalizan a `styles.base`, `styles.tablet` y `styles.mobile`. Se aceptan declaraciones controladas de tipografía, distribución, dimensiones, espaciado, fondos de color, bordes, sombras y opacidad. El CSS base de composición tiene rangos hasta 480 px y de más de 480 a 768 px. Las reglas del Style Manager corresponden a 768 y 375 px. El adaptador conserva esa distinción entre tema y ajustes.

Fragmento de los bloques anidados de una captura de la fase 1.6.3.B:

```json
[
  {
    "id": "block-faa5ab261b0dc6e8135f81a8ef8ebabe",
    "type": "restaurant-hours",
    "options": { "heading": "Horario semanal", "layout": "compact", "showClosedDays": false },
    "styles": {
      "base": { "font-size": "31px" },
      "tablet": { "font-size": "26px" },
      "mobile": { "font-size": "21px" }
    }
  },
  {
    "id": "block-315a13f2ba1c2653b0c2e408aae85cdb",
    "type": "restaurant-reservation",
    "options": {
      "heading": "Planea tu visita",
      "description": "Consulta la reserva de demostración.",
      "buttonText": "Ver reservas",
      "alignment": "center"
    }
  }
]
```

### Validación y límites de conversión

- V1 admite un documento de una página y un marco, hasta 200 bloques, 12 niveles de bloques o de marcas de texto, 1,200 nodos de texto, 4,000 caracteres por fragmento y 200 por título o texto alternativo. Cada representación tiene un límite de 256 KiB de JSON en UTF-8, con límites adicionales de 48 niveles y 30,000 valores del árbol JSON. Son valores provisionales.
- El validador comprueba versión, propietario esperado, claves, IDs únicos, estructura, propiedades discriminadas, límites y referencias. Las imágenes se restringen al recurso local de demostración. Rechaza scripts, atributos de eventos, HTML como propiedad, enlaces de botón, CSS externo y valores fuera de la gramática. El texto en línea admite negrita, cursiva, subrayado, tachado y saltos.
- El adaptador rechaza cambios a las reglas compartidas del tema, selectores personalizados o con estado, consultas responsivas distintas a las dos admitidas, reglas huérfanas, varias reglas para la misma instancia y dispositivo, y estructuras fuera del catálogo. Entre los casos posibles desde el editor están las clases personalizadas y los bloques sin imagen dentro de una galería. La ruta del error permite conservar el diseño activo y localizar la incompatibilidad. Los metadatos propios del editor, como etiquetas de capas y ajustes del lienzo, se conservan únicamente en el proyecto editable.
- V1 se amplía de forma aditiva y mantiene sus límites. Cada widget conserva ID, tipo, opciones y estilos. Los horarios, la dirección, el contacto, los ejemplos de disponibilidad y la ruta de reserva se mantienen en el contexto o se derivan de él. Los tipos nuevos rechazan claves como `restaurantId`, `slug`, `href` y `url` en el bloque. La validación estructural debe repetirse en servidor antes de guardar o publicar. La autorización del propietario requiere una comprobación independiente.

### Pruebas y siguiente fase

```sh
node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --test tests/mock-services.test.mjs tests/page-document.test.mjs
```

Las 6 pruebas de servicios y las 15 pruebas de documentos cubren documentos y proyectos válidos, límites, claves peligrosas, propietario, estructura, estilos y recarga. Las pruebas de widgets incluyen disposiciones, campos prohibidos, estados sin datos, intervalos separados y cierres al día siguiente. Los controles nativos existentes de GrapesJS pueden producir clases, estados, reglas compartidas o valores fuera de V1. El diagnóstico señala la ruta incompatible.

Chrome y Playwright comprobaron la inserción, selección, movimiento, duplicación y eliminación de los cinco widgets, sus ajustes, el botón inerte, los estilos en tres dispositivos y la recarga. Compararon ambos JSON para verificar que los datos operativos quedaran fuera y comprobaron que una captura de la fase 1.6.3.A conserva su representación V1. También comprobaron el aislamiento de las fichas públicas y los estados sin contexto.

Una futura revisión de contenido puede identificar una captura de borrador o publicación. `schemaVersion` identifica las reglas de lectura y migración del formato. Para mantener las dos representaciones alineadas, guarda el editable como fuente de verdad y deriva el normalizado en la misma revisión y transacción de publicación. Quedan por acordar almacenamiento, autorización, versionado del tema y migraciones con backend.

### Alcance y pendientes

- Los cambios duran lo que dura la instancia del editor. El almacenamiento, la telemetría, los iconos desde CDN, la carga de imágenes y la entrada de URL de recursos están desactivados. El selector de imágenes ofrece el recurso local de la demostración.
- Los bloques tienen contenido definido en el código. El lienzo acepta pegado como texto plano y restringe la ejecución de scripts y la carga de recursos externos mediante CSP. Se deshabilitan las entradas de HTML externo y no se publica el resultado del editor.
- El workspace y su vista previa requieren autenticación y autorización en servidor, incluida la comprobación de permisos sobre el restaurante. La prueba es para uso local.
- Casa Oliva ofrece seis productos sin imágenes de platillos. El control de visibilidad se aplica cuando el servicio proporciona una imagen local admitida. Quedan pendientes la persistencia autorizada y el renderizador público independiente.

## Directorios

| Directorio | Responsabilidad |
| --- | --- |
| `blocks/` | Definiciones de biblioteca, columnas anidables y vista del menú dinámico. |
| `editor/` | Interfaz, configuración y adaptador experimental del proyecto editable. |
| `renderer/` | Presentación del contenido personalizado en la ficha pública y en la vista previa. Actualmente contiene solo la presentación temporal de la vista previa. |
| `registry/` | Registro de tipos y bloques en GrapesJS para cada instancia. |
| `schemas/` | Validación de documentos, valores JSON y declaraciones de estilos de V1. |
| `theme/` | Configuración visual de colores, tipografía y estilos. |
| `hooks/` | Estado e interacción específicos del editor. |
| `services/` | Carga y proyección de datos del menú para el editor. |
| `types/` | Documento V1, opciones editables y proyección pública compartida de los widgets. |
| `utils/` | Utilidades internas del sistema de páginas. |

## Límites

- El editor y el renderizador público se desarrollan por separado. `renderer/` y su código compartido deben poder ejecutarse sin importar `editor/`, los hooks interactivos del editor ni la biblioteca de edición.
- El contenido personalizado se representará mediante documentos serializables y versionados. Se distinguirán los borradores del contenido publicado. El renderizado público usará contenido publicado y la vista previa de borradores requerirá autorización.
- Los bloques de menú, horarios, ubicación, disponibilidad y reservas consumirán datos autorizados del restaurante. Los precios, la disponibilidad de productos y los horarios reservables son datos operativos. Los ajustes de tema, contenido y composición respetarán las reglas de negocio de reservas.
- La persistencia, la publicación y la autorización dependerán de contratos acordados con backend.
- La adopción definitiva de GrapesJS y el contrato de almacenamiento quedan pendientes.
