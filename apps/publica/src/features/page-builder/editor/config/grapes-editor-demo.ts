import type { EditorConfig } from "grapesjs";

export const localImage = "/images/restaurant-placeholder.svg";

export const demoComponents = `
  <section class="demo-hero">
    <h1>Bienvenidos al restaurante</h1>
    <p>Haz doble clic para editar este texto.</p>
    <button type="button">Botón de ejemplo</button>
  </section>
  <div class="demo-container">
    <p>Arrastra un bloque aquí para agregar contenido.</p>
  </div>
`;

export const demoStyles = `
  body { font-family: system-ui, sans-serif; color: #292524; }
  .demo-hero { padding: 2rem; background-color: #fafaf9; }
  .demo-hero h1 { margin-top: 0; }
  .demo-hero button { padding: 0.5rem 1rem; }
  .demo-container { padding: 1.5rem 2rem; min-height: 8rem; }
  img { max-width: 100%; }
`;

export const demoBlocks: NonNullable<EditorConfig["blockManager"]>["blocks"] = [
  { id: "text", label: "Texto", content: "<p>Escribe tu texto aquí.</p>" },
  { id: "heading", label: "Título", content: "<h2>Título de sección</h2>" },
  {
    id: "section",
    label: "Sección",
    content: { tagName: "section", style: { padding: "1rem" }, components: "<p>Nueva sección</p>" },
  },
  {
    id: "image",
    label: "Imagen local",
    content: { type: "image", attributes: { src: localImage, alt: "Ilustración de un plato" } },
  },
  { id: "button", label: "Botón", content: '<button type="button">Botón de ejemplo</button>' },
];
