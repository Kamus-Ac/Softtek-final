import { pageImageResource, pageThemePreset } from "../theme/page-preset";
import { pageSchemaVersion, type PageDocumentV1 } from "../types/page-document";
import { isRestaurantWidgetType } from "../types/restaurant-widgets";
import { readPageStyles } from "./page-styles";
import { allowKeys, checkJson, pageLimits, readArray, readId, readRecord, readText, requirePageValue } from "./page-values";
import { readRestaurantWidgetOptions } from "./restaurant-widgets";

export function validatePageDocument(input: unknown, expectedRestaurantId: string): PageDocumentV1 {
  checkJson(input, "document");
  const doc = readRecord(input, "document");
  allowKeys(doc, ["schemaVersion", "documentId", "restaurantId", "theme", "blocks"], "document");
  requirePageValue(doc.schemaVersion === pageSchemaVersion, "document.schemaVersion", "Versión no admitida.");
  readId(doc.documentId, "document.documentId");
  requirePageValue(readId(doc.restaurantId, "document.restaurantId") === expectedRestaurantId,
    "document.restaurantId", "El restaurante no corresponde al contexto esperado.");

  const theme = readRecord(doc.theme, "document.theme");
  allowKeys(theme, ["preset", "styles"], "document.theme");
  requirePageValue(theme.preset === pageThemePreset, "document.theme.preset", "Tema desconocido.");
  if ("styles" in theme) readPageStyles(theme.styles, "document.theme.styles");

  const ids = new Set<string>();
  let inlineCount = 0;

  function inline(value: unknown, path: string, depth: number) {
    requirePageValue(depth <= pageLimits.depth, path, "El texto supera la profundidad permitida.");
    readArray(value, path).forEach((entry, index) => {
      const at = `${path}[${index}]`;
      requirePageValue(++inlineCount <= pageLimits.inlineNodes, at, "Demasiados nodos de texto.");
      const part = readRecord(entry, at);
      switch (part.type) {
        case "text":
          allowKeys(part, ["type", "value"], at);
          readText(part.value, `${at}.value`);
          break;
        case "break":
          allowKeys(part, ["type"], at);
          break;
        case "bold": case "italic": case "underline": case "strike":
          allowKeys(part, ["type", "children"], at);
          inline(part.children, `${at}.children`, depth + 1);
          break;
        default:
          requirePageValue(false, `${at}.type`, "Formato de texto no admitido.");
      }
    });
  }

  function blocks(value: unknown, path: string, depth: number, parent?: unknown) {
    requirePageValue(depth <= pageLimits.depth, path, "La estructura supera la profundidad permitida.");
    readArray(value, path).forEach((entry, index) => {
      const at = `${path}[${index}]`;
      const block = readRecord(entry, at);
      const id = readId(block.id, `${at}.id`);
      requirePageValue(!ids.has(id), `${at}.id`, "Identificador duplicado.");
      ids.add(id);
      requirePageValue(ids.size <= pageLimits.blocks, at, "Demasiados bloques.");
      const only = (...extra: string[]) => allowKeys(block, ["type", "id", "title", "styles", ...extra], at);
      if ("styles" in block) readPageStyles(block.styles, `${at}.styles`);
      if ("title" in block) readText(block.title, `${at}.title`, pageLimits.title);
      requirePageValue((parent === "columns") === (block.type === "column"), at, "Una columna pertenece a un grupo de columnas.");
      requirePageValue(parent !== "gallery" || block.type === "image", at, "La galería solo admite imágenes.");

      switch (block.type) {
        case "text": case "button": case "heading":
          only("content", ...(block.type === "heading" ? ["level"] : []));
          if (block.type === "heading") requirePageValue([1, 2, 3, 4, 5, 6].some((n) => n === block.level), `${at}.level`, "Nivel de encabezado no admitido.");
          inline(block.content, `${at}.content`, 1);
          break;
        case "image":
          only("resource", "alt");
          requirePageValue(block.resource === pageImageResource, `${at}.resource`, "Recurso no autorizado para el catálogo de demostración.");
          readText(block.alt, `${at}.alt`, pageLimits.title);
          break;
        case "divider": case "spacer":
          only();
          break;
        case "columns":
          only("count", "children");
          requirePageValue((block.count === 2 || block.count === 3)
            && readArray(block.children, `${at}.children`).length === block.count, at, "Grupo de columnas inválido.");
          blocks(block.children, `${at}.children`, depth + 1, block.type);
          break;
        case "section": case "container": case "column": case "gallery": case "cover":
          if (block.type === "section" || block.type === "container") {
            only("variant", "children");
            requirePageValue(block.variant === "standard" || block.variant === "intro", `${at}.variant`, "Variante no admitida.");
          } else only("children");
          blocks(block.children, `${at}.children`, depth + 1, block.type);
          break;
        case "restaurant-menu": {
          only("options");
          const options = readRecord(block.options, `${at}.options`);
          allowKeys(options, ["menuTitle", "menuLayout", "showDescriptions", "showImages"], `${at}.options`);
          readText(options.menuTitle, `${at}.options.menuTitle`, pageLimits.title);
          requirePageValue(options.menuLayout === "list" || options.menuLayout === "grid", `${at}.options.menuLayout`, "Distribución no admitida.");
          for (const flag of ["showDescriptions", "showImages"]) {
            requirePageValue(typeof options[flag] === "boolean", `${at}.options.${flag}`, "Se esperaba un booleano.");
          }
          break;
        }
        default:
          if (isRestaurantWidgetType(block.type)) {
            only("options");
            readRestaurantWidgetOptions(block.type, block.options, `${at}.options`);
            break;
          }
          requirePageValue(false, `${at}.type`, "Tipo de bloque desconocido.");
      }
    });
  }

  blocks(doc.blocks, "document.blocks", 1);
  return input as PageDocumentV1;
}
