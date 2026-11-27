import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { extname } from "node:path";
import { test } from "node:test";

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@/")) {
      return nextResolve(new URL("../src/" + specifier.slice(2) + ".ts", import.meta.url).href, context);
    }
    const mapped = context.parentURL?.endsWith(".ts") && specifier.startsWith(".") && !extname(specifier)
      ? specifier + ".ts" : specifier;
    return nextResolve(mapped, context);
  },
});

const { convertEditableProject } = await import("../src/features/page-builder/editor/document/project-conversion.ts");
const { createProjectDiagnostic } = await import("../src/features/page-builder/editor/document/editable-page-project.ts");
const { validatePageDocument } = await import("../src/features/page-builder/schemas/page-document.ts");
const { pageLimits } = await import("../src/features/page-builder/schemas/page-values.ts");
const { pageImageResource, pageMediaQueries, pageThemePreset } = await import("../src/features/page-builder/theme/page-preset.ts");
const { getMenuWidgetDefaults } = await import("../src/features/page-builder/types/menu-widget.ts");
const {
  getRestaurantWidgetDefaults, restaurantWidgetClass, restaurantWidgets,
} = await import("../src/features/page-builder/types/restaurant-widgets.ts");
const {
  describeAvailability, formatOpeningHours, getReservationPath, projectAvailabilityExample,
} = await import("../src/features/page-builder/utils/restaurant-widget-preview.ts");

const identity = { documentId: "page-demo", restaurantId: "rest-casa-oliva" };
const validate = (input) => validatePageDocument(input, identity.restaurantId);
const text = (id = "text-a") => ({ id, type: "text", content: [{ type: "text", value: "Bienvenidos" }] });
const menu = () => ({ id: "menu-a", type: "restaurant-menu", options: getMenuWidgetDefaults() });
const document = (blocks = [text(), menu()]) => ({
  schemaVersion: 1, ...identity, theme: { preset: pageThemePreset }, blocks,
});

test("valida una página versionada con columnas, contenido, recursos y estilos", () => {
  const input = document([{
    id: "columns-a", type: "columns", count: 2,
    styles: {
      base: { "background-color": "#FAFAF9", padding: "1rem 2rem", display: "grid" },
      mobile: { padding: "0", "box-shadow": "0 2px 5px rgba(0, 0, 0, 0.4)" },
    },
    children: [
      { id: "col-a", type: "column", children: [{ id: "img-a", type: "image", resource: pageImageResource, alt: "Plato" }] },
      { id: "col-b", type: "column", children: [text(), menu()] },
    ],
  }]);
  assert.deepEqual(validate(input), input);
});

test("rechaza versiones, tipos, IDs y propietarios inesperados", () => {
  assert.throws(() => validate({ ...document(), schemaVersion: 2 }), /schemaVersion/);
  assert.throws(() => validate(document([{ id: "a", type: "video" }])), /blocks\[0\]\.type/);
  assert.throws(() => validate(document([text(), text()])), /Identificador duplicado/);
  assert.throws(() => validate({ ...document(), restaurantId: "rest-kumo" }), /contexto esperado/);
  assert.throws(() => validate(document([{ ...menu(), restaurantId: "rest-kumo" }])), /restaurantId/);
});

test("rechaza propiedades incorrectas, recursos y estructuras fuera del catálogo", () => {
  assert.throws(() => validate(document([{ ...menu(), options: { ...menu().options, showImages: "true" } }])), /showImages/);
  assert.throws(() => validate(document([{ ...menu(), options: { ...menu().options, menuLayout: "table" } }])), /menuLayout/);
  for (const resource of ["https://example.com/a.png", "//example.com/a.png", "/images/otro.webp", "/images/../secreto.svg"]) {
    assert.throws(() => validate(document([{ id: "a", type: "image", resource, alt: "" }])), /resource/);
  }
  assert.throws(() => validate(document([{ id: "a", type: "column", children: [] }])), /grupo de columnas/);
  assert.throws(() => validate(document([{ id: "a", type: "gallery", children: [text()] }])), /solo admite imágenes/);
  assert.throws(() => validate(document([{ id: "a", type: "columns", count: 2, children: [] }])), /columnas inválido/);
});

test("limita profundidad, cantidad de nodos, longitud y tamaño JSON", () => {
  let nested = text();
  for (let i = 0; i < pageLimits.depth; i++) nested = { id: `nest-${i}`, type: "container", variant: "standard", children: [nested] };
  assert.throws(() => validate(document([nested])), /profundidad/);
  assert.throws(() => validate(document(Array.from({ length: pageLimits.blocks + 1 }, (_, i) => text(`text-${i}`)))), /Demasiados bloques/);
  assert.throws(() => validate(document([{ ...text(), content: [{ type: "text", value: "a".repeat(pageLimits.text + 1) }] }])), /texto plano/);
  assert.throws(() => validate(document(Array.from({ length: 30 }, (_, i) => ({
    ...text(`text-${i}`), content: [{ type: "text", value: "ñ".repeat(pageLimits.text) }, { type: "text", value: "ñ".repeat(pageLimits.text) }],
  })))), /tamaño|KiB/);
  assert.throws(() => validate(document([{ ...text(), content: Array.from({ length: pageLimits.inlineNodes + 1 }, () => ({ type: "break" })) }])), /nodos de texto/);
});

test("rechaza contenido ejecutable, getters y CSS fuera de la gramática", () => {
  assert.throws(() => validate(document([{ ...text(), content: [{ type: "text", value: "<script>prueba</script>" }] }])), /texto plano/);
  assert.throws(() => validate(document([{ ...text(), onClick: "prueba" }])), /onClick/);
  assert.throws(() => validate(document([{ ...text(), content: [{ type: "html", value: "<b>prueba</b>" }] }])), /Formato de texto/);
  assert.throws(() => validate(document([{ ...text(), extra: () => null }])), /serializable/);
  const getter = Object.defineProperty(text(), "extra", { enumerable: true, get() { assert.fail("No debe ejecutar el getter"); } });
  assert.throws(() => validate(document([getter])), /Propiedad JSON/);
  for (const rule of [
    { "background-image": "url(https://example.com/a.png)" },
    { opacity: "2" }, { width: "expression(prueba)" }, { color: "var(--otra)" },
    { padding: "1px; color: red" }, { font: "12px Arial" }, { color: "#abc !important" },
    { color: "rgb(1, 2)" }, { color: "rgb(260 0 0)" }, { "font-family": "Arial," },
  ]) {
    assert.throws(() => validate(document([{ ...text(), styles: { base: rule } }])), /valor CSS/);
  }
});

const identityNode = (id, node) => ({ pageBlockId: id, ...node });
const rawText = (id, tagName = "p") => identityNode(id, {
  type: "text", tagName, components: [{ type: "textnode", content: "Una carta" }],
});
const rawImage = (id) => identityNode(id, {
  type: "image", attributes: { src: pageImageResource, alt: "Plato" }, resizable: { ratioDefault: 1 },
});
const columns = (count) => identityNode(`grid-${count}`, {
  type: "layout-columns", classes: ["builder-columns", `builder-columns--${count}`],
  components: Array.from({ length: count }, (_, index) =>
    identityNode(`column-${count}-${index}`, { type: "layout-column", classes: ["builder-column"] })),
});
const rawMenu = identityNode("menu-a", { type: "restaurant-menu", classes: ["builder-menu"] });
const preset = [{ selectors: ["builder-container"], style: { padding: "1rem" } }];
const project = (components, styles = preset) => ({
  assets: [{ type: "image", src: pageImageResource }], symbols: [], dataSources: [], styles,
  pages: [{ id: "sample", frames: [{
    id: "frame", component: { type: "wrapper", head: { type: "head" }, docEl: { tagName: "html" }, components },
  }] }],
});
const convert = (value) => convertEditableProject(value, identity, preset, getMenuWidgetDefaults("Carta"));

test("convierte los 13 bloques, sus tipos internos y el texto enriquecido conservando el árbol", () => {
  const input = project([
    rawText("heading", "h2"),
    { ...rawText("text"), components: [
      { type: "textnode", content: "Hola " },
      { tagName: "strong", type: "text", components: [{ type: "textnode", content: "mundo" }] },
      { tagName: "br", void: true },
    ] },
    rawImage("image"),
    { ...rawText("button", "button"), attributes: { type: "button" } },
    identityNode("section", { tagName: "section", classes: ["builder-section"], components: [rawText("nested")] }),
    identityNode("container", { classes: ["builder-container"] }),
    columns(2), columns(3),
    identityNode("divider", { tagName: "hr", classes: ["builder-divider"], void: true, droppable: false }),
    identityNode("spacer", { classes: ["builder-spacer"], attributes: { "aria-hidden": "true" }, stylable: ["height"] }),
    identityNode("gallery", { classes: ["builder-gallery"], components: [rawImage("gallery-image")] }),
    identityNode("cover", { tagName: "header", classes: ["builder-cover"], components: [rawText("cover-title", "h1")] }),
    rawMenu,
  ]);
  const before = JSON.stringify(input);
  const result = convert(input);
  assert.deepEqual(result.blocks.map((block) => block.type), [
    "heading", "text", "image", "button", "section", "container", "columns", "columns",
    "divider", "spacer", "gallery", "cover", "restaurant-menu",
  ]);
  assert.deepEqual(result.blocks[1].content, [
    { type: "text", value: "Hola " },
    { type: "bold", children: [{ type: "text", value: "mundo" }] },
    { type: "break" },
  ]);
  assert.equal(result.blocks[4].children[0].id, "nested");
  assert.equal(result.blocks[7].children[2].id, "column-3-2");
  assert.deepEqual(result.blocks.at(-1).options, getMenuWidgetDefaults("Carta"));
  assert.equal(JSON.stringify(input), before);
});

test("deriva estilos por identidad, conserva traits y excluye datos operativos", () => {
  const styled = { ...rawMenu, attributes: { id: "gjs-menu" }, menuLayout: "grid", showDescriptions: false };
  const input = project([styled], [
    ...preset,
    { selectors: ["#gjs-menu"], style: { color: "#234567" } },
    { selectors: ["#gjs-menu"], style: { padding: "1rem" }, atRuleType: "media", mediaText: pageMediaQueries.tablet },
    { selectors: ["#gjs-menu"], style: { padding: "0" }, atRuleType: "media", mediaText: pageMediaQueries.mobile },
  ]);
  const block = convert(input).blocks[0];
  assert.equal(block.id, "menu-a");
  assert.deepEqual(block.options, { ...getMenuWidgetDefaults("Carta"), menuLayout: "grid", showDescriptions: false });
  assert.deepEqual(block.styles, { base: { color: "#234567" }, tablet: { padding: "1rem" }, mobile: { padding: "0" } });
  assert.doesNotMatch(JSON.stringify(block), /gjs-menu|categories|price|isAvailable|restaurantId/);
  assert.throws(() => convert(project([{ ...styled, items: [] }])), /items/);
  assert.throws(() => convert(project([{ ...styled, components: [rawText("unexpected")] }])), /no admite hijos/);
});

test("informa la ruta de estilos o componentes sin representación", () => {
  assert.throws(() => convert(project([{ ...rawMenu, script: "prueba" }])), /components\[0\]\.script/);
  assert.throws(() => convert(project([{ ...rawText("a"), attributes: { onclick: "prueba" } }])), /attributes\.onclick/);
  assert.throws(() => convert(project([{ ...rawText("a"), classes: ["custom"] }])), /components\[0\]/);
  assert.throws(() => convert(project([], [])), /tema base/);
  assert.throws(() => convert(project([], [{ selectors: ["builder-container"], style: { padding: "2rem" } }])), /regla compartida/);
  assert.throws(() => convert(project([], [...preset, { selectors: ["body"], style: { color: "red" } }])), /solo se admiten reglas por instancia/i);
  assert.throws(() => convert(project([], [...preset, { selectors: ["#no-node"], style: { color: "red" } }])), /no corresponde/);
  assert.throws(() => convert(project([{ ...rawMenu, attributes: { id: "menu" } }], [
    ...preset, { selectors: ["#menu"], style: { color: "red" }, atRuleType: "media", mediaText: "(max-width: 600px)" },
  ])), /consulta responsiva/);
});

test("empaqueta los metadatos de edición y solo recarga una captura válida del estado actual", () => {
  let active = project([rawText("one")]);
  const loads = [];
  let editing = false;
  let resets = 0;
  const editor = {
    getProjectData: () => structuredClone(active),
    getEditing: () => editing,
    loadProjectData: (value) => loads.push(value),
    UndoManager: { clear: () => resets++ },
    clearDirtyCount: () => resets++,
  };
  const diagnostic = createProjectDiagnostic(editor, identity, getMenuWidgetDefaults());
  assert.throws(() => diagnostic.reload(), /Valida el proyecto/);
  editing = true;
  assert.throws(() => diagnostic.capture(), /Termina la edición/);
  editing = false;
  const { editable, normalized } = diagnostic.capture();
  assert.deepEqual(editable, { formatVersion: 1, editor: "grapesjs", editorVersion: "0.23.9", ...identity, project: active });
  assert.deepEqual(normalized, document([{ ...text("one"), content: [{ type: "text", value: "Una carta" }] }]));
  active = project([rawText("two")]);
  assert.throws(() => diagnostic.reload(), /lienzo cambió/);
  assert.equal(loads.length, 0);
  diagnostic.capture();
  diagnostic.reload();
  assert.deepEqual(loads, [active]);
  assert.equal(resets, 2);
});

const widgetTypes = Object.keys(restaurantWidgets);
const rawWidget = (type, options = {}) => identityNode(`block-${type}`, {
  type, classes: [restaurantWidgetClass], ...options,
});
const widgetBlock = (type) => ({
  type, id: `block-${type}`, options: getRestaurantWidgetDefaults(type),
});

test("convierte los cinco widgets V1 con sus defaults, propiedades editadas y estilos responsivos", () => {
  const edited = [
    { heading: "Visítanos", showClosedDays: false, layout: "compact" },
    { showCity: false, showCountry: false },
    { showEmail: false, showWebsite: false },
    { heading: "Horarios de ejemplo", layout: "compact" },
    { description: "Planea tu visita.", buttonText: "Ver reservas", alignment: "center" },
  ];
  const input = project(widgetTypes.map((type, index) => rawWidget(type, {
    attributes: { id: `css-${index}` }, ...edited[index],
  })), [
    ...preset,
    ...widgetTypes.flatMap((_, index) => [
      { selectors: [`#css-${index}`], style: { color: "#234567" } },
      { selectors: [`#css-${index}`], style: { padding: "1rem" }, atRuleType: "media", mediaText: pageMediaQueries.tablet },
      { selectors: [`#css-${index}`], style: { padding: "0" }, atRuleType: "media", mediaText: pageMediaQueries.mobile },
    ]),
  ]);
  const before = JSON.stringify(input);
  assert.deepEqual(convert(input), document(widgetTypes.map((type, index) => ({
    ...widgetBlock(type),
    options: { ...getRestaurantWidgetDefaults(type), ...edited[index] },
    styles: { base: { color: "#234567" }, tablet: { padding: "1rem" }, mobile: { padding: "0" } },
  }))));
  assert.equal(JSON.stringify(input), before);
  assert.equal(convert(project([rawMenu, rawWidget("restaurant-hours")])).schemaVersion, 1);
});

test("rechaza tipos de opciones inválidos y campos ajenos en cada widget", () => {
  const invalid = [
    ["restaurant-hours", "showClosedDays", "false"],
    ["restaurant-location", "showCity", 1],
    ["restaurant-contact", "layout", "grid"],
    ["restaurant-availability", "heading", "<img>"],
    ["restaurant-reservation", "alignment", "spread"],
  ];
  for (const [type, field, value] of invalid) {
    const block = widgetBlock(type);
    assert.throws(() => validate(document([{ ...block, options: { ...block.options, [field]: value } }])), new RegExp(field));
    assert.throws(() => convert(project([rawWidget(type, { [field]: value })])), new RegExp(field));
  }
  for (const type of widgetTypes) {
    const block = widgetBlock(type);
    for (const [field, value] of [["restaurantId", "rest-kumo"], ["slug", "kumo"], ["href", "https://example.com"]]) {
      assert.throws(() => validate(document([{ ...block, options: { ...block.options, [field]: value } }])), new RegExp(field));
      assert.throws(() => convert(project([rawWidget(type, { [field]: value })])), new RegExp(field));
    }
    assert.throws(() => convert(project([rawWidget(type, { components: [rawText("operational")] })])), /no admite hijos/);
    assert.throws(() => convert(project([rawWidget(type, { attributes: { onclick: "invalid" } })])), /onclick/);
    assert.throws(() => convert(project([rawWidget(type), rawWidget(type)])), /Identificador duplicado/);
  }
});

test("mantiene V1 y deja fuera horarios, ubicación, contacto y consultas operativas", () => {
  const oldV1 = document([text(), menu()]);
  assert.deepEqual(validate(oldV1), oldV1);
  const newer = convert(project(widgetTypes.map((type) => rawWidget(type))));
  assert.equal(newer.schemaVersion, oldV1.schemaVersion);
  assert.deepEqual(newer.blocks, widgetTypes.map(widgetBlock));
  assert.doesNotMatch(JSON.stringify(newer.blocks), /slug|restaurantId|address|email|partySize|slots|\/restaurantes\//);
  for (const [type, field] of [
    ["restaurant-hours", "intervals"], ["restaurant-location", "address"], ["restaurant-contact", "email"],
    ["restaurant-availability", "slots"], ["restaurant-availability", "partySize"], ["restaurant-reservation", "url"],
  ]) {
    assert.throws(() => convert(project([rawWidget(type, { [field]: "operational" })])), new RegExp(field));
  }
});

test("presenta horarios separados, cierre al día siguiente y días cerrados o ausentes", () => {
  const closed = { status: "closed" };
  const hours = {
    monday: closed, tuesday: closed, wednesday: closed, thursday: closed, sunday: closed,
    friday: { status: "open", intervals: [{ opensAt: "13:00", closesAt: "16:00" }, { opensAt: "18:30", closesAt: "22:30" }] },
    saturday: { status: "open", intervals: [{ opensAt: "17:30", closesAt: "00:30", closesNextDay: true }] },
  };
  assert.deepEqual(formatOpeningHours(hours, false), [
    { label: "Viernes", value: "13:00–16:00 · 18:30–22:30" },
    { label: "Sábado", value: "17:30–00:30 (día siguiente)" },
  ]);
  assert.deepEqual(formatOpeningHours(hours, true)[0], { label: "Lunes", value: "Cerrado" });
  assert.deepEqual(formatOpeningHours(null, true), []);
});

test("distingue disponibilidad con horarios, vacía o sin datos y usa la ruta canónica para reservar", () => {
  const date = "2036-06-10";
  const query = { date, partySize: 2, restaurantId: "rest-casa-oliva" };
  const result = { query, timeZone: "America/Mexico_City", slots: [{ startsAt: "2036-06-10T19:00:00Z" }] };
  assert.deepEqual(projectAvailabilityExample(date, 2, result), { date, partySize: 2, times: ["13:00"] });
  assert.equal(describeAvailability(projectAvailabilityExample(date, 2, { ...result, slots: [] }).times), "Sin horarios disponibles.");
  assert.equal(describeAvailability(projectAvailabilityExample(date, 2, null).times), "Sin datos de disponibilidad.");
  assert.equal(getReservationPath({ slug: "casa-oliva" }), "/restaurantes/casa-oliva/reservar");
  assert.equal(getReservationPath(null), null);
});

test("recarga un editable con los cinco widgets y conserva la identidad de cada bloque", () => {
  let active = project([rawMenu, ...widgetTypes.map((type) => rawWidget(type))]);
  const diagnostic = createProjectDiagnostic({
    getProjectData: () => structuredClone(active),
    getEditing: () => false,
    loadProjectData: (value) => { active = value; },
    UndoManager: { clear() {} },
    clearDirtyCount() {},
  }, identity, getMenuWidgetDefaults("Carta"));
  const before = diagnostic.capture();
  diagnostic.reload();
  assert.deepEqual(diagnostic.capture(), before);
  assert.deepEqual(before.normalized.blocks.slice(1).map(({ id }) => id), widgetTypes.map((type) => `block-${type}`));
});
