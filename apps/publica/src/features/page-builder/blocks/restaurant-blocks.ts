import type { BlockProperties, ComponentDefinition, Editor } from "grapesjs";

const columnsType = "layout-columns";
const columnType = "layout-column";

export const localImage = "/images/restaurant-placeholder.svg";

function image(): ComponentDefinition {
  return { type: "image", attributes: { src: localImage, alt: "Ilustración de un plato" } };
}

function columns(count: 2 | 3): ComponentDefinition {
  return {
    type: columnsType,
    classes: ["builder-columns", `builder-columns--${count}`],
    components: Array.from({ length: count }, () => ({ type: columnType })),
  };
}

export const restaurantBlocks: (BlockProperties & { id: string })[] = [
  { id: "heading", label: "Encabezado", category: "Contenido", content: "<h2>Título de sección</h2>" },
  { id: "text", label: "Texto", category: "Contenido", content: "<p>Escribe tu texto aquí.</p>" },
  { id: "image", label: "Imagen local", category: "Contenido", content: image() },
  { id: "button", label: "Botón", category: "Contenido", content: '<button type="button">Botón de ejemplo</button>' },
  {
    id: "section", label: "Sección", category: "Estructura",
    content: { tagName: "section", name: "Sección", classes: ["builder-section"], components: "<h2>Nueva sección</h2>" },
  },
  {
    id: "container", label: "Contenedor", category: "Estructura",
    content: { tagName: "div", name: "Contenedor", classes: ["builder-container"] },
  },
  { id: "columns-2", label: "Dos columnas", category: "Estructura", content: columns(2) },
  { id: "columns-3", label: "Tres columnas", category: "Estructura", content: columns(3) },
  {
    id: "divider", label: "Separador", category: "Estructura",
    content: { tagName: "hr", classes: ["builder-divider"], void: true, droppable: false },
  },
  {
    id: "spacer", label: "Espaciador", category: "Estructura",
    content: {
      tagName: "div", name: "Espaciador", classes: ["builder-spacer"],
      attributes: { "aria-hidden": "true" }, droppable: false, stylable: ["height"],
    },
  },
  {
    id: "gallery", label: "Galería local", category: "Multimedia",
    content: { tagName: "div", name: "Galería", classes: ["builder-gallery"], components: [image(), image(), image()] },
  },
  {
    id: "cover", label: "Portada", category: "Restaurante",
    content: {
      tagName: "header", name: "Portada", classes: ["builder-cover"],
      components: ["<h1>Nombre del restaurante</h1>", "<p>Presenta tu restaurante.</p>", image()],
    },
  },
];

export function registerLayoutComponents(editor: Editor) {
  editor.Components.addType(columnsType, {
    model: { defaults: { name: "Grupo de columnas", droppable: ".builder-column" } },
  });
  editor.Components.addType(columnType, {
    model: {
      defaults: {
        name: "Columna",
        classes: ["builder-column"],
        draggable: ".builder-columns",
        removable: false,
        copyable: false,
      },
    },
  });
}
