"use client";

import { useEffect, useRef, useState } from "react";
import type { Editor } from "grapesjs";
import "grapesjs/dist/css/grapes.min.css";
import { createGrapesEditorConfig } from "../config/grapes-editor-config";
import styles from "./GrapesEditor.module.css";

export function GrapesEditor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    let editor: Editor | undefined;

    async function initializeEditor(container: HTMLDivElement) {
      try {
        const { default: grapesjs } = await import("grapesjs");
        if (cancelled) return;

        editor = grapesjs.init(createGrapesEditorConfig(container));
        editor.on("load", () => {
          if (!cancelled) setStatus("ready");
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
      editor?.destroy();
    };
  }, []);

  return (
    <div className="overflow-x-auto">
      {status === "loading" && <p role="status">Cargando el editor…</p>}
      {status === "error" && <p role="alert">No se pudo cargar el editor.</p>}
      <div className={styles.workspace}>
        <div ref={containerRef} />
      </div>
    </div>
  );
}
