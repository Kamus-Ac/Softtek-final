import { validatePageDocument } from "../../schemas/page-document";
import { readDeclarations } from "../../schemas/page-styles";
import { readRestaurantWidgetOptions } from "../../schemas/restaurant-widgets";
import {
  allowKeys, checkJson, pageLimits, readArray, readId, readRecord, readText, requirePageValue,
} from "../../schemas/page-values";
import { pageImageResource, pageMediaQueries, pageThemePreset } from "../../theme/page-preset";
import {
  pageSchemaVersion, type InlineContent, type PageBlock, type PageBreakpoint,
  type PageDocumentIdentity, type PageDocumentV1, type PageStyles,
} from "../../types/page-document";
import type { MenuWidgetOptions } from "../../types/menu-widget";
import {
  getRestaurantWidgetDefaults, isRestaurantWidgetType, restaurantWidgetClass, restaurantWidgets,
  type RestaurantWidgetBlock,
} from "../../types/restaurant-widgets";

type StyleTarget = { styles?: PageStyles };
type RawNode = Record<string, unknown>;
const visualFields = ["style", "classes", "attributes"] as const;
const menuFields = ["menuTitle", "menuLayout", "showDescriptions", "showImages"] as const;
const emphasis = { b: "bold", strong: "bold", i: "italic", em: "italic", u: "underline", s: "strike", strike: "strike", del: "strike" } as const;

function children(node: RawNode, path: string) {
  return "components" in node ? readArray(node.components, `${path}.components`) : [];
}

function readInline(value: unknown, path: string): InlineContent {
  const node = readRecord(value, path);
  if (node.type === "textnode") {
    allowKeys(node, ["type", "content"], path);
    return { type: "text", value: readText(node.content ?? "", `${path}.content`) };
  }
  if (node.tagName === "br") {
    allowKeys(node, ["tagName", "void"], path);
    requirePageValue(node.void === true, path, "Salto de línea no admitido.");
    return { type: "break" };
  }
  const tag = node.tagName;
  requirePageValue(typeof tag === "string" && Object.hasOwn(emphasis, tag), `${path}.tagName`, "Marca de texto no admitida.");
  allowKeys(node, ["type", "tagName", "components"], path);
  requirePageValue(node.type === undefined || node.type === "text", `${path}.type`, "Tipo de texto no admitido.");
  return {
    type: emphasis[tag as keyof typeof emphasis],
    children: children(node, path).map((part, index) => readInline(part, `${path}.components[${index}]`)),
  };
}

function setStyles(target: StyleTarget, breakpoint: PageBreakpoint, input: unknown, path: string) {
  const declarations = readDeclarations(input, path);
  if (Object.keys(declarations).length === 0) return;
  requirePageValue(!target.styles?.[breakpoint], path, "Hay varias reglas para el mismo elemento y dispositivo.");
  target.styles = { ...target.styles, [breakpoint]: declarations };
}

function requireEmpty(value: unknown, path: string) {
  requirePageValue(readArray(value, path).length === 0, path, "Se esperaba un arreglo vacío.");
}

function readProjectRoot(project: RawNode) {
  allowKeys(project, ["assets", "styles", "pages", "dataSources", "symbols"], "project");
  for (const key of ["dataSources", "symbols"]) requireEmpty(project[key], `project.${key}`);
  readArray(project.assets, "project.assets").forEach((value, index) => {
    const at = `project.assets[${index}]`;
    const asset = readRecord(value, at);
    allowKeys(asset, ["type", "src", "unitDim", "height", "width"], at);
    requirePageValue(asset.type === "image" && asset.src === pageImageResource
      && (asset.unitDim === undefined || asset.unitDim === "px"), at, "Recurso de proyecto no admitido.");
    for (const key of ["height", "width"]) {
      const value = asset[key];
      requirePageValue(value === undefined || (typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 10_000),
        `${at}.${key}`, "Dimensión de recurso no admitida.");
    }
  });
  const pages = readArray(project.pages, "project.pages");
  requirePageValue(pages.length === 1, "project.pages", "Solo se admite una página.");
  const page = readRecord(pages[0], "project.pages[0]");
  allowKeys(page, ["id", "frames"], "project.pages[0]");
  readId(page.id, "project.pages[0].id");
  const frames = readArray(page.frames, "project.pages[0].frames");
  requirePageValue(frames.length === 1, "project.pages[0].frames", "Solo se admite un marco.");
  const frame = readRecord(frames[0], "project.pages[0].frames[0]");
  allowKeys(frame, ["id", "component"], "project.pages[0].frames[0]");
  readId(frame.id, "project.pages[0].frames[0].id");
  return readRecord(frame.component, "project.root");
}

export function convertEditableProject(
  input: unknown,
  identity: PageDocumentIdentity,
  presetRules: readonly unknown[],
  menuDefaults: MenuWidgetOptions,
): PageDocumentV1 {
  checkJson(input, "project");
  const project = readRecord(input, "project");
  const root = readProjectRoot(project);
  const cssTargets = new Map<string, StyleTarget>();
  const theme: PageDocumentV1["theme"] = { preset: pageThemePreset };
  let count = 0;

  function mapStyles(node: RawNode, attributes: RawNode, target: StyleTarget, path: string) {
    if ("id" in attributes) {
      const id = readId(attributes.id, `${path}.attributes.id`);
      requirePageValue(!cssTargets.has(id), `${path}.attributes.id`, "Identificador CSS duplicado.");
      cssTargets.set(id, target);
    }
    if ("style" in node) setStyles(target, "base", node.style, `${path}.style`);
  }

  function convertBlock(value: unknown, path: string, depth: number): PageBlock {
    requirePageValue(depth <= pageLimits.depth && ++count <= pageLimits.blocks, path, "La composición excede sus límites.");
    const node = readRecord(value, path);
    const isMenu = node.type === "restaurant-menu";
    const restaurantType = isRestaurantWidgetType(node.type) ? node.type : null;
    const widgetFields = restaurantType ? Object.keys(restaurantWidgets[restaurantType].fields) : [];
    allowKeys(node, [
      "pageBlockId", "type", "tagName", "name", "components", "droppable", "void", "stylable", "resizable",
      ...visualFields, ...(isMenu ? menuFields : widgetFields),
    ], path);
    if ("name" in node) readText(node.name, `${path}.name`, pageLimits.title);
    if ("droppable" in node) requirePageValue(node.droppable === false, `${path}.droppable`, "Configuración de arrastre no admitida.");
    if ("void" in node) requirePageValue(node.void === true && node.tagName === "hr", `${path}.void`, "Marca de elemento vacío no admitida.");
    if ("stylable" in node) requirePageValue(JSON.stringify(node.stylable) === '["height"]', `${path}.stylable`, "Configuración visual no admitida.");
    if ("resizable" in node) requirePageValue(node.type === "image" && JSON.stringify(node.resizable) === '{"ratioDefault":1}',
      `${path}.resizable`, "Configuración de imagen no admitida.");

    const attrs = "attributes" in node ? readRecord(node.attributes, `${path}.attributes`) : {};
    const classList = "classes" in node ? readArray(node.classes, `${path}.classes`) : [];
    requirePageValue(classList.every((token) => typeof token === "string" && /^[a-z0-9-]+$/.test(token)),
      `${path}.classes`, "Clase CSS no admitida.");
    const classes = classList.join(" ");
    const tag = node.tagName;
    const base = {
      id: readId(node.pageBlockId, `${path}.pageBlockId`),
      ...("title" in attrs && { title: readText(attrs.title, `${path}.attributes.title`, pageLimits.title) }),
    };
    const onlyAttributes = (...extra: string[]) => allowKeys(attrs, ["id", "title", ...extra], `${path}.attributes`);
    const nested = () => children(node, path).map((child, index) => convertBlock(child, `${path}.components[${index}]`, depth + 1));
    const leaf = () => requirePageValue(children(node, path).length === 0, `${path}.components`, "Este bloque no admite hijos.");
    const withChildren = () => ({ ...base, children: nested() });
    let block: PageBlock;
    onlyAttributes(...(node.type === "image" ? ["src", "alt"] : tag === "button" ? ["type"] : classes === "builder-spacer" ? ["aria-hidden"] : []));

    if (node.type === "text" && !classes && (tag === "p" || tag === "button" || (typeof tag === "string" && /^h[1-6]$/.test(tag)))) {
      const content = children(node, path).map((part, index) => readInline(part, `${path}.components[${index}]`));
      if (tag === "button") requirePageValue(attrs.type === "button", `${path}.attributes.type`, "Solo se admiten botones sin acción.");
      block = tag === "p" || tag === "button"
        ? { ...base, type: tag === "p" ? "text" : "button", content }
        : { ...base, type: "heading", level: Number(tag[1]) as 1 | 2 | 3 | 4 | 5 | 6, content };
    } else if (node.type === "image" && !classes && (tag === undefined || tag === "img")) {
      leaf();
      requirePageValue(attrs.src === pageImageResource, `${path}.attributes.src`, "Imagen no admitida.");
      block = { ...base, type: "image", resource: pageImageResource, alt: readText(attrs.alt ?? "", `${path}.attributes.alt`, pageLimits.title) };
    } else if (isMenu && classes === "builder-menu" && (tag === undefined || tag === "section")) {
      leaf();
      const options = { ...menuDefaults };
      for (const key of menuFields) if (key in node) Object.assign(options, { [key]: node[key] });
      block = { ...base, type: "restaurant-menu", options };
    } else if (restaurantType && classes === restaurantWidgetClass && (tag === undefined || tag === "section")) {
      leaf();
      const settings = { ...getRestaurantWidgetDefaults(restaurantType) };
      for (const key of widgetFields) if (key in node) Object.assign(settings, { [key]: node[key] });
      const options = readRestaurantWidgetOptions(restaurantType, settings, path);
      // The field schema is selected by this type, and the validator preserves that correlation.
      const widget = { type: restaurantType, options } as RestaurantWidgetBlock;
      block = { ...base, ...widget };
    } else if (node.type === "layout-columns" && tag === undefined && /^builder-columns builder-columns--[23]$/.test(classes)) {
      block = { ...withChildren(), type: "columns", count: classes.endsWith("2") ? 2 : 3 };
    } else if (node.type === "layout-column" && tag === undefined && classes === "builder-column") {
      block = { ...withChildren(), type: "column" };
    } else {
      requirePageValue(node.type === undefined, `${path}.type`, "Tipo de componente no admitido.");
      if (tag === "section" && (classes === "builder-section" || classes === "demo-hero")) {
        block = { ...withChildren(), type: "section", variant: classes === "demo-hero" ? "intro" : "standard" };
      } else if (tag === undefined && (classes === "builder-container" || classes === "demo-container")) {
        block = { ...withChildren(), type: "container", variant: classes === "demo-container" ? "intro" : "standard" };
      } else if ((tag === "header" && classes === "builder-cover") || (tag === undefined && classes === "builder-gallery")) {
        block = { ...withChildren(), type: tag === "header" ? "cover" : "gallery" };
      } else if ((tag === "hr" && classes === "builder-divider") || (tag === undefined && classes === "builder-spacer")) {
        leaf();
        if (classes === "builder-spacer") requirePageValue(attrs["aria-hidden"] === "true", path, "Espaciador inválido.");
        block = { ...base, type: tag === "hr" ? "divider" : "spacer" };
      } else {
        requirePageValue(false, path, "La etiqueta, clases o estructura del bloque no tienen una representación en V1.");
      }
    }
    mapStyles(node, attrs, block, path);
    return block;
  }

  allowKeys(root, ["type", "head", "docEl", "stylable", "components", "attributes", "style"], "project.root");
  requirePageValue(root.type === "wrapper" && JSON.stringify(root.head) === '{"type":"head"}'
    && JSON.stringify(root.docEl) === '{"tagName":"html"}', "project.root", "La estructura base del marco no es admitida.");
  if ("stylable" in root) {
    requirePageValue(JSON.stringify(root.stylable) === '["background","background-color","background-image","background-repeat","background-attachment","background-position","background-size"]',
      "project.root.stylable", "Configuración base no admitida.");
  }
  const rootAttrs = "attributes" in root ? readRecord(root.attributes, "project.root.attributes") : {};
  allowKeys(rootAttrs, ["id"], "project.root.attributes");
  mapStyles(root, rootAttrs, theme, "project.root");
  const blocks = children(root, "project.root").map((node, index) => convertBlock(node, `project.root.components[${index}]`, 1));

  const rules = readArray(project.styles, "project.styles");
  requirePageValue(rules.length >= presetRules.length, "project.styles", "Faltan reglas del tema base.");
  rules.forEach((value, index) => {
    const at = `project.styles[${index}]`;
    if (index < presetRules.length) {
      requirePageValue(JSON.stringify(value) === JSON.stringify(presetRules[index]), at, "La regla compartida difiere del tema base.");
      return;
    }
    const rule = readRecord(value, at);
    allowKeys(rule, ["selectors", "style", "atRuleType", "mediaText"], at);
    const selectors = readArray(rule.selectors, `${at}.selectors`);
    const [selector] = selectors;
    requirePageValue(selectors.length === 1 && typeof selector === "string" && selector.startsWith("#"),
      `${at}.selectors`, "Solo se admiten reglas por instancia.");
    const target = cssTargets.get(selector.slice(1));
    requirePageValue(target, `${at}.selectors`, "La regla no corresponde a una instancia del documento.");
    let breakpoint: PageBreakpoint = "base";
    if ("atRuleType" in rule || "mediaText" in rule) {
      requirePageValue(rule.atRuleType === "media" && (rule.mediaText === pageMediaQueries.tablet || rule.mediaText === pageMediaQueries.mobile),
        `${at}.mediaText`, "La consulta responsiva no es admitida.");
      breakpoint = rule.mediaText === pageMediaQueries.tablet ? "tablet" : "mobile";
    }
    setStyles(target, breakpoint, rule.style, `${at}.style`);
  });

  return validatePageDocument({ schemaVersion: pageSchemaVersion, ...identity, theme, blocks }, identity.restaurantId);
}
