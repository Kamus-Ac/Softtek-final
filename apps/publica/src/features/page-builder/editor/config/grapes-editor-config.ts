import type { Component, Editor, EditorConfig } from "grapesjs";
import es from "grapesjs/locale/es.mjs";
import { demoBlocks, demoComponents, demoStyles, localImage } from "./grapes-editor-demo";

function cancelPendingDragCleanup(editor: Editor) {
  const { shallow, events } = editor.Components;
  if (!shallow) return;

  // GrapesJS 0.23.9 leaves a debounced reset on its temporary drag wrapper after destroy.
  // Cancel that reset before GrapesJS tears down the wrapper's canvas.
  type DebouncedListener = { callback: (() => void) & { cancel?: () => void } };
  const { _events: listeners } = shallow as Component & {
    _events?: Record<string, DebouncedListener[]>;
  };
  for (const event of [events.update, events.updateInside]) {
    for (const { callback } of listeners?.[event] ?? []) {
      if (!callback.cancel) continue;
      callback.cancel();
      shallow.off(event, callback);
    }
  }
}

export function createGrapesEditorConfig(container: HTMLElement): EditorConfig {
  return {
    container,
    height: "max(38rem, calc(100dvh - 9rem))",
    width: "auto",
    storageManager: false,
    telemetry: false,
    cssIcons: "",
    jsInHtml: false,
    nativeDnD: false,
    i18n: { locale: "es", detectLocale: false, messages: { es } },
    parser: {
      optionsHtml: {
        allowScripts: false,
        allowUnsafeAttr: false,
        allowUnsafeAttrValue: false,
      },
    },
    canvas: {
      allowExternalDrop: false,
      // The editable iframe keeps same-origin DOM access and permits only local images and inline CSS.
      frameContent: `<!DOCTYPE html><html lang="es"><head>
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; form-action 'none'; base-uri 'none'">
        </head><body></body></html>`,
    },
    richTextEditor: {
      actions: ["bold", "italic", "underline", "strikethrough"],
      onPaste: ({ ev, rte }) => {
        ev.preventDefault();
        const text = ev.clipboardData?.getData("text/plain");
        if (text) rte.exec("insertText", text);
      },
    },
    assetManager: {
      assets: [localImage],
      upload: false,
      embedAsBase64: false,
      showUrlInput: false,
    },
    deviceManager: {
      devices: [
        { id: "desktop", name: "Escritorio", width: "" },
        { id: "tablet", name: "Tablet", width: "768px" },
        { id: "mobile", name: "Móvil", width: "375px" },
      ],
    },
    components: demoComponents,
    style: demoStyles,
    blockManager: { blocks: demoBlocks },
    plugins: [
      (editor) => {
        const { Panels } = editor;
        Panels.removeButton("options", "export-template");
        Panels.removeButton("options", "preview");

        const labels = [
          ["options", "sw-visibility", "Contornos"],
          ["options", "fullscreen", "Pantalla completa"],
          ["views", "open-sm", "Estilos"],
          ["views", "open-tm", "Ajustes"],
          ["views", "open-layers", "Capas"],
          ["views", "open-blocks", "Bloques"],
        ];
        for (const [panel, id, label] of labels) {
          Panels.getButton(panel, id)?.set({ className: "", label, attributes: { title: label } });
        }

        Panels.addButton("options", { id: "undo", label: "Deshacer", command: "core:undo" });
        Panels.addButton("options", { id: "redo", label: "Rehacer", command: "core:redo" });

        editor.on("canvas:frame:load:head", ({ window }) => {
          // Block native drops into contenteditable. GrapesJS uses its own sorter for internal drags.
          window.document.addEventListener("drop", (event) => event.preventDefault(), true);
        });
        editor.on("destroy", () => cancelPendingDragCleanup(editor));
      },
    ],
  };
}
