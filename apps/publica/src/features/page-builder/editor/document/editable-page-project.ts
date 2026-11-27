import type { Editor, ProjectData } from "grapesjs";
import { requirePageValue } from "../../schemas/page-values";
import type { MenuWidgetOptions } from "../../types/menu-widget";
import type { PageDocumentIdentity } from "../../types/page-document";
import { convertEditableProject } from "./project-conversion";

export interface EditablePageProjectV1 extends PageDocumentIdentity {
  formatVersion: 1;
  editor: "grapesjs";
  editorVersion: "0.23.9";
  project: ProjectData;
}

export function createProjectDiagnostic(editor: Editor, identity: PageDocumentIdentity, menuDefaults: MenuWidgetOptions) {
  // Created on the first editor load, before the user can change the preset rules.
  const presetRules: unknown[] = editor.getProjectData().styles;
  let captured: EditablePageProjectV1 | undefined;

  function readCurrentProject() {
    requirePageValue(!editor.getEditing(), "project", "Termina la edición de texto antes de usar el diagnóstico.");
    return editor.getProjectData();
  }

  return {
    capture() {
      captured = undefined;
      const project = readCurrentProject();
      const normalized = convertEditableProject(project, identity, presetRules, menuDefaults);
      captured = { formatVersion: 1, editor: "grapesjs", editorVersion: "0.23.9", ...identity, project };
      return { editable: captured, normalized };
    },
    reload() {
      requirePageValue(captured, "project", "Valida el proyecto antes de recargar.");
      requirePageValue(JSON.stringify(readCurrentProject()) === JSON.stringify(captured.project),
        "project", "El lienzo cambió. Vuelve a validar el diseño actual.");
      convertEditableProject(captured.project, identity, presetRules, menuDefaults);
      editor.loadProjectData(structuredClone(captured.project));
      editor.UndoManager.clear();
      editor.clearDirtyCount();
    },
  };
}
