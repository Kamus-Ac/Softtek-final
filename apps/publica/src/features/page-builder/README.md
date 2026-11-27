# Páginas personalizadas de restaurantes

Este módulo reúne las herramientas de edición y la presentación del contenido personalizado. La fase 1.6.1 incorpora una prueba de concepto con **GrapesJS Core 0.23.9**, de licencia **BSD-3-Clause**. El paquete `grapesjs` incluye el motor, su CSS, el catálogo en español y los tipos de TypeScript. [Código y licencia de GrapesJS](https://github.com/GrapesJS/grapesjs/blob/v0.23.9/packages/core/LICENSE)

## Prueba de concepto del editor

Desde `apps/publica`, ejecuta `npm ci` y `npm run dev`. Abre [/editor/demo-restaurant](http://localhost:3000/editor/demo-restaurant). Haz doble clic en el título o el párrafo para editarlo. Usa **Bloques** para arrastrar texto, un título, una sección, una imagen local o un botón al lienzo. **Estilos** permite modificar el elemento seleccionado y **Capas** muestra el árbol de componentes. El historial de la sesión admite deshacer y rehacer. El selector de dispositivos permite probar escritorio, tablet de 768 px y móvil de 375 px. El botón de ejemplo es decorativo.

### Integración con App Router

- `editor/components/GrapesEditor.tsx` importa el CSS oficial en el workspace. Un efecto del Client Component carga el motor con `import()` e inicializa una instancia en la referencia al contenedor. El desmontaje cancela una carga pendiente y llama a `destroy()` si ya existe una instancia. Al volver a entrar se carga el documento de demostración. `editor/components/GrapesEditor.module.css` limita los ajustes de tamaño al workspace.
- `editor/config/grapes-editor-config.ts` configura los administradores y paneles nativos, el historial, los dispositivos y las restricciones del lienzo. `editor/config/grapes-editor-demo.ts` contiene el documento de ejemplo, los cinco bloques y la referencia a la imagen local. `editor/config/grapesjs-locale.d.ts` declara el submódulo oficial de traducción al español.
- GrapesJS 0.23.9 puede programar un reinicio del contenedor temporal de arrastre después de destruir el editor. La configuración cancela ese callback antes de que se retire el lienzo. Al actualizar GrapesJS, vuelve a probar la navegación inmediatamente después de arrastrar un bloque y revisa si se puede retirar la solución.
- `EditorWorkspaceScreen.tsx` y `EditorShell.tsx` siguen en el servidor. La vista previa vive en un segmento hermano, conserva el enlace de regreso y muestra contenido provisional independiente del lienzo de GrapesJS. Las fichas públicas conservan su renderizado en servidor.

### Alcance y pendientes

- Los cambios duran lo que dura la instancia del editor. El almacenamiento, la telemetría, los iconos desde CDN, la carga de imágenes y la entrada de URL de recursos están desactivados. El selector de imágenes ofrece el recurso local de la demostración.
- Los bloques tienen contenido definido en el código. El lienzo acepta pegado como texto plano y restringe la ejecución de scripts y la carga de recursos externos mediante CSP. Se deshabilitan las entradas de HTML externo y no se publica el resultado del editor.
- El workspace y su vista previa requieren autenticación y autorización en servidor, incluida la comprobación de permisos sobre el restaurante. La prueba es para uso local.
- En la fase 1.6.2 conviene evaluar cómo representar bloques dinámicos mediante tipos y propiedades permitidas, manteniendo los datos operativos en sus servicios. Queda por decidir la adaptación de GrapesJS a un documento versionado, la persistencia autorizada de borradores y un renderizador público independiente que valide sus entradas.

## Directorios

| Directorio | Responsabilidad |
| --- | --- |
| `blocks/` | Componentes de contenido que se podrán incluir en una página. |
| `editor/` | Interfaz de edición y herramientas de configuración. |
| `renderer/` | Presentación del contenido personalizado en la ficha pública y en la vista previa. Actualmente contiene solo la presentación temporal de la vista previa. |
| `registry/` | Catálogo de bloques disponibles y configuración compartida de cada bloque. |
| `schemas/` | Validación futura de documentos y configuraciones de bloques. |
| `theme/` | Configuración visual de colores, tipografía y estilos. |
| `hooks/` | Estado e interacción específicos del editor. |
| `services/` | Adaptadores de almacenamiento y publicación cuando se acuerden los contratos. |
| `types/` | Modelos TypeScript del documento y sus bloques cuando se definan. |
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
