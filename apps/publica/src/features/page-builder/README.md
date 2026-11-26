# Páginas personalizadas de restaurantes

Este módulo reúne las herramientas de edición y la presentación del contenido personalizado. En esta fase contiene la pantalla temporal del workspace y el contenido de la vista previa. La vista previa mantiene su propio segmento de ruta. Su enlace de regreso al workspace se compone en `app/`.

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
- Los bloques de menú, horarios, disponibilidad y reservas consumirán datos autorizados del restaurante. Los ajustes de tema, contenido y composición respetarán las reglas de negocio de reservas.
- La persistencia, la publicación y la autorización dependerán de contratos acordados con backend.
- La elección del motor de edición y la definición del esquema JSON quedan pendientes.
