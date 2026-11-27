"use client";

import { useEffect, useRef, useState } from "react";
import type { Editor } from "grapesjs";
import "grapesjs/dist/css/grapes.min.css";
import { getMenuWidgetDefaults } from "../../types/menu-widget";
import type { PageDocumentV1 } from "../../types/page-document";
import type { EditorRestaurantContext } from "../../types/restaurant-widgets";
import { createGrapesEditorConfig } from "../config/grapes-editor-config";
import { createPageId } from "../document/block-identity";
import { createProjectDiagnostic } from "../document/editable-page-project";
import styles from "./GrapesEditor.module.css";

export function GrapesEditor({ context }: { context: EditorRestaurantContext | null }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const diagnosticRef = useRef<ReturnType<typeof createProjectDiagnostic> | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [document, setDocument] = useState<PageDocumentV1>();
  const [diagnosticMessage, setDiagnosticMessage] = useState("");
  const [diagnosticFailed, setDiagnosticFailed] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    let editor: Editor | undefined;

    async function initializeEditor(container: HTMLDivElement) {
      try {
        const { default: grapesjs } = await import("grapesjs");
        if (cancelled) return;

        editor = grapesjs.init(createGrapesEditorConfig(container, context));
        editor.once("load", () => {
          if (cancelled || !editor) return;
          if (context) {
            diagnosticRef.current = createProjectDiagnostic(
              editor, { documentId: createPageId("page"), restaurantId: context.restaurantId },
              getMenuWidgetDefaults(context.menu?.name),
            );
          }
          setStatus("ready");
        });
      } catch (error) {
        if (cancelled) return;
        console.error("Error al iniciar GrapesJS", error);
        setStatus("error");
      }
    }

    void initializeEditor(container);

    return () => {
      cancelled = true;
      diagnosticRef.current = null;
      editor?.destroy();
    };
  }, [context]);

  function runDiagnostic(action: "capture" | "reload") {
    const diagnostic = diagnosticRef.current;
    if (!diagnostic) return;
    try {
      if (action === "capture") {
        setDocument(diagnostic.capture().normalized);
        setDiagnosticMessage("Proyecto y documento V1 válidos.");
      } else {
        diagnostic.reload();
        setDiagnosticMessage("Proyecto recargado en memoria.");
      }
      setDiagnosticFailed(false);
    } catch (error) {
      setDocument(undefined);
      setDiagnosticFailed(true);
      setDiagnosticMessage(error instanceof Error ? error.message : "No se pudo validar el proyecto.");
    }
  }

  return (
    <div className="overflow-x-auto">
      {status === "loading" && <p role="status">Cargando el editor…</p>}
      {status === "error" && <p role="alert">No se pudo cargar el editor.</p>}
      <div className={styles.workspace}>
        <div ref={containerRef} />
      </div>
      {status === "ready" && context && (
        <section aria-label="Diagnóstico del documento" className="mt-3 space-y-2">
          <div className="flex flex-wrap gap-2">
            <button type="button" className="rounded border px-3 py-1" onClick={() => runDiagnostic("capture")}>Validar documento</button>
            <button type="button" className="rounded border px-3 py-1 disabled:opacity-50"
              disabled={!document} onClick={() => runDiagnostic("reload")}>Recargar en memoria</button>
          </div>
          {diagnosticMessage && <p role={diagnosticFailed ? "alert" : "status"}>{diagnosticMessage}</p>}
          {document && (
            <details>
              <summary>Ver JSON normalizado</summary>
              <pre className="max-h-72 overflow-auto rounded border p-3">{JSON.stringify(document, null, 2)}</pre>
            </details>
          )}
        </section>
      )}
    </div>
  );
}
