import type { StyleManagerConfig } from "grapesjs";

export const editorStyleSectors: NonNullable<StyleManagerConfig["sectors"]> = [
  {
    id: "typography", name: "Tipografía", open: false,
    buildProps: ["font-family", "font-size", "font-weight", "color", "text-align", "line-height"],
  },
  {
    id: "spacing", name: "Dimensiones y espaciado", open: false,
    buildProps: ["width", "height", "max-width", "margin", "padding"],
  },
  {
    id: "layout", name: "Distribución", open: false,
    buildProps: ["display", "gap", "flex-direction", "flex-wrap", "justify-content", "align-items"],
    properties: [
      {
        property: "display", label: "Modo de distribución", type: "select",
        options: [
          { id: "block", label: "Bloque" },
          { id: "inline", label: "En línea" },
          { id: "inline-block", label: "Bloque en línea" },
          { id: "flex", label: "Flexible" },
          { id: "grid", label: "Cuadrícula" },
        ],
      },
      { property: "gap", label: "Separación", type: "number", units: ["px", "rem", "em", "%"], min: 0 },
      { property: "justify-content", requires: { display: ["flex", "grid"] } },
      { property: "align-items", requires: { display: ["flex", "grid"] } },
    ],
  },
  {
    id: "appearance", name: "Apariencia", open: false,
    buildProps: ["background-color", "border", "border-radius", "box-shadow", "opacity"],
  },
];
