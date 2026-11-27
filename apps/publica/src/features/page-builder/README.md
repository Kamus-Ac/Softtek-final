# Páginas personalizadas de restaurantes

Este módulo reúne las herramientas de edición y presentación del contenido personalizado. La fase 1.6.2 agrega una biblioteca de bloques y el prototipo de menú a la prueba de concepto con **GrapesJS Core 0.23.9**, de licencia **BSD-3-Clause**. El paquete incluye el motor, su CSS, el catálogo en español y los tipos de TypeScript. [Código y licencia de GrapesJS](https://github.com/GrapesJS/grapesjs/blob/v0.23.9/packages/core/LICENSE)

## Prueba de concepto del editor

Desde `apps/publica`, ejecuta `npm ci` y `npm run dev`. Abre [/editor/demo-restaurant](http://localhost:3000/editor/demo-restaurant). Arrastra elementos desde **Bloques**. Haz doble clic en un título o párrafo para editarlo. **Capas** refleja el anidamiento y permite seleccionar los grupos. El historial de la sesión admite deshacer y rehacer.

| Categoría | Bloques |
| --- | --- |
| Contenido | Encabezado, texto, imagen local y botón. |
| Estructura | Sección, contenedor, dos columnas, tres columnas, separador y espaciador. |
| Multimedia | Galería local de tres espacios que reutilizan la ilustración de la demostración. |
| Restaurante | Portada y menú dinámico experimental. |

Arrastra un contenedor a una sección, un grupo de columnas al contenedor y texto o imágenes a las columnas. Puedes mover el contenido entre columnas y duplicar o eliminar el grupo completo. Las columnas individuales se conservan para mantener la estructura del bloque. El botón de ejemplo es decorativo y las imágenes locales ofrecen texto alternativo en **Ajustes**.

El lienzo usa CSS Grid. Los grupos de tres columnas y la galería pasan a dos a 768 px. Todos esos grupos se apilan a 480 px. El menú en cuadrícula también se apila a ese ancho. El selector muestra escritorio, tablet de 768 px y móvil de 375 px. Los cambios de estilo en tablet y móvil generan reglas `max-width` que se aplican en cascada. Un ajuste móvil conserva su ámbito de 375 px.

**Estilos** ofrece familia, tamaño, peso, color, alineación e interlineado de texto. También ofrece ancho, alto, ancho máximo, márgenes, padding, modo de distribución, separación y alineación de elementos, fondo, bordes, radio, sombras y opacidad. Los controles dependen del elemento elegido. Por ejemplo, el espaciador expone la altura y el widget de menú expone estilos de presentación de la sección.

### Widget de menú

El workspace llama en el servidor a `getEditorMenu`. La asociación de demostración `demo-restaurant` → `rest-casa-oliva` selecciona Casa Oliva en `RestaurantService.getMenu(restaurantId)`. Otros identificadores conservan el editor y muestran un estado vacío al insertar el menú. La asociación identifica una muestra pública. Las rutas administrativas siguen requiriendo autorización real en el servidor.

El cliente recibe categorías, nombres de platillos, descripciones, disponibilidad, precios ya formateados en MXN a partir de unidades menores y, cuando existe, una imagen de `/images/`. En **Ajustes**, el componente `restaurant-menu` guarda el título, la variante `list` o `grid`, y los dos controles booleanos de visibilidad. **Estilos** aplica tipografía, color, espaciado, fondo y decoración a la sección.

La vista del componente crea los nodos operativos en el iframe mediante API del DOM y `textContent`. El contenido queda fuera del árbol de modelos de GrapesJS. Apuntar a un platillo selecciona el widget completo. El widget se puede mover, duplicar y eliminar. La protección describe el comportamiento del editor. El DOM y el estado de un navegador siguen siendo inspeccionables y modificables por quien controla ese navegador.

### Integración con App Router

- `editor/components/GrapesEditor.tsx` importa el CSS oficial en el workspace. Un efecto del Client Component carga el motor con `import()` e inicializa una instancia en la referencia al contenedor. El desmontaje cancela una carga pendiente y llama a `destroy()` si ya existe una instancia. Al volver a entrar se carga el documento de demostración. `editor/components/GrapesEditor.module.css` limita los ajustes de tamaño al workspace.
- `editor/config/grapes-editor-config.ts` configura el motor y las restricciones del lienzo. `editor-style-sectors.ts` define los sectores del Style Manager y `grapes-editor-demo.ts` contiene el documento inicial. `grapesjs-locale.d.ts` declara el submódulo oficial de traducción al español.
- `registry/register-editor-blocks.ts` registra primero los tipos personalizados `layout-columns`, `layout-column` y `restaurant-menu`, y después los bloques con sus identificadores de catálogo. `blocks/` define sus estructuras y la vista del menú. `theme/builder-canvas-styles.ts` aporta el CSS inicial que consume el lienzo.
- GrapesJS 0.23.9 puede programar un reinicio del contenedor temporal de arrastre después de destruir el editor. La configuración cancela ese callback antes de que se retire el lienzo. Al actualizar GrapesJS, vuelve a probar la navegación inmediatamente después de arrastrar un bloque y revisa si se puede retirar la solución.
- `EditorWorkspaceScreen.tsx` carga los datos públicos del menú en el servidor y pasa esa proyección al editor. `EditorShell.tsx` sigue en el servidor. La vista previa vive en un segmento hermano y muestra contenido provisional independiente del lienzo. Las fichas públicas conservan su renderizado en servidor.

### Formato observado del proyecto

`editor.getProjectData()` entrega `pages` y `styles`, entre otras claves del motor. Cada página contiene marcos y el nodo raíz vive en `pages[].frames[].component`. Las colecciones `components` conservan el orden y el anidamiento. Los tipos personalizados aparecen en `type`. Los identificadores de catálogo como `columns-3` sirven para insertar bloques. En el documento se conservan los tipos y las clases de la instancia.

El Style Manager edita por componente. Al aplicar un estilo propio, el modelo guarda el ID generado en `attributes.id` y CSS Composer lo referencia desde `styles[].selectors`. Los nodos que solo usan sus valores iniciales pueden omitir el ID y otros valores por defecto. Una regla por dispositivo conserva `mediaText` y `atRuleType`. Este fragmento omite los demás componentes y reglas de la sesión.

```json
{
  "pages": [{
    "frames": [{
      "component": {
        "type": "wrapper",
        "components": [{
          "type": "restaurant-menu",
          "classes": ["builder-menu"],
          "attributes": { "id": "i9nbg" },
          "menuTitle": "Carta de temporada",
          "menuLayout": "grid",
          "showDescriptions": false,
          "showImages": false
        }]
      }
    }]
  }],
  "styles": [
    { "selectors": ["#i9nbg"], "style": { "color": "#234567" } },
    {
      "selectors": ["#i70li"],
      "style": { "font-size": "21px" },
      "mediaText": "(max-width: 375px)",
      "atRuleType": "media"
    }
  ]
}
```

El modelo de menú carece de hijos serializados. La vista se reconstruye mediante el tipo registrado y la proyección de datos del servidor. Los nombres, precios, descripciones operativas y disponibilidad quedan fuera de los datos de proyecto. El JSON tampoco incluye la asociación con el restaurante. El HTML de exportación omite la vista de los platillos y pierde información del modelo editable. Un documento durable necesitará su propio identificador estable por bloque, versión, referencia al restaurante y validación en la frontera de lectura.

La prueba con Chrome y Playwright serializó los datos a JSON y los recargó en memoria con `editor.loadProjectData()`. Conservó el anidamiento, las opciones del widget y los estilos por dispositivo. La vista volvió a mostrar los seis platillos usando los datos que ya tenía el editor. La prueba de imágenes usó una ilustración local añadida únicamente a los datos en memoria del navegador.

### Alcance y pendientes

- Los cambios duran lo que dura la instancia del editor. El almacenamiento, la telemetría, los iconos desde CDN, la carga de imágenes y la entrada de URL de recursos están desactivados. El selector de imágenes ofrece el recurso local de la demostración.
- Los bloques tienen contenido definido en el código. El lienzo acepta pegado como texto plano y restringe la ejecución de scripts y la carga de recursos externos mediante CSP. Se deshabilitan las entradas de HTML externo y no se publica el resultado del editor.
- El workspace y su vista previa requieren autenticación y autorización en servidor, incluida la comprobación de permisos sobre el restaurante. La prueba es para uso local.
- Casa Oliva ofrece seis productos sin imágenes de platillos. El control de visibilidad se aplica cuando el servicio proporciona una imagen local admitida. El esquema versionado, la persistencia autorizada de borradores y el renderizador público independiente quedan pendientes.

## Directorios

| Directorio | Responsabilidad |
| --- | --- |
| `blocks/` | Definiciones de biblioteca, columnas anidables y vista del menú dinámico. |
| `editor/` | Interfaz de edición y herramientas de configuración. |
| `renderer/` | Presentación del contenido personalizado en la ficha pública y en la vista previa. Actualmente contiene solo la presentación temporal de la vista previa. |
| `registry/` | Registro de tipos y bloques en GrapesJS para cada instancia. |
| `schemas/` | Validación futura de documentos y configuraciones de bloques. |
| `theme/` | Configuración visual de colores, tipografía y estilos. |
| `hooks/` | Estado e interacción específicos del editor. |
| `services/` | Carga y proyección de datos del menú para el editor. |
| `types/` | Opciones editables y datos públicos del widget de menú. |
| `utils/` | Utilidades internas del sistema de páginas. |

## Límites

- El editor y el renderizador público se desarrollan por separado. `renderer/` y su código compartido deben poder ejecutarse sin importar `editor/`, los hooks interactivos del editor ni la biblioteca de edición.
- El contenido personalizado se representará mediante documentos serializables y versionados. Se distinguirán los borradores del contenido publicado. El renderizado público usará contenido publicado y la vista previa de borradores requerirá autorización.
- Los bloques de menú, horarios, ubicación, disponibilidad y reservas consumirán datos autorizados del restaurante. Los precios, la disponibilidad de productos y los horarios reservables son datos operativos. Los ajustes de tema, contenido y composición respetarán las reglas de negocio de reservas.
- La persistencia, la publicación y la autorización dependerán de contratos acordados con backend.
- La adopción definitiva de GrapesJS y la definición del esquema JSON quedan pendientes.

## Requisitos del futuro PageDocument

- Incluir una versión del esquema y una referencia al restaurante propietario. La versión del esquema permitirá identificar qué migraciones aplicar a documentos de versiones anteriores.
- Conservar la configuración del tema y la estructura de bloques. Cada bloque tendrá un identificador estable y propiedades serializables. El documento conservará su orden y el anidamiento cuando el motor elegido lo admita.
- Distinguir el borrador del contenido publicado. El editor y el renderizador usarán un modelo de contenido compatible, con las propiedades que ambos necesitan y sin dependencia del formato interno de la biblioteca de edición.
- Guardar referencias autorizadas a datos operativos, como el menú, la ubicación o la disponibilidad del restaurante. La fuente operativa seguirá a cargo de esos datos y de las reglas de reserva.
- Acordar con backend la asociación con el restaurante, la persistencia, los permisos de lectura y publicación, y el tratamiento de versiones antes de implementar el esquema o sus migraciones.
