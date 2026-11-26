import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { registerHooks } from "node:module";
import { extname } from "node:path";
import { test } from "node:test";

// Node 24 puede ejecutar los tipos de estas fuentes. El hook traduce las rutas
// que normalmente resuelve Next.js durante la compilación.
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@/")) {
      return nextResolve(new URL("../src/" + specifier.slice(2) + ".ts", import.meta.url).href, context);
    }

    if (context.parentURL?.endsWith(".ts") && specifier.startsWith(".") && !extname(specifier)) {
      return nextResolve(specifier + ".ts", context);
    }

    return nextResolve(specifier, context);
  },
});

const { mockRestaurantService: restaurants } = await import(
  "../src/features/restaurants/services/mock-restaurant-service.ts"
);
const { mockAvailabilityService: availability } = await import(
  "../src/features/availability/services/mock-availability-service.ts"
);
const { mockAvailability } = await import("../src/mocks/availability.ts");

const slugs = ["casa-oliva", "raiz-norte", "kumo"];
const tuesday = "2036-06-10";
const monday = "2036-06-09";
const demoQuery = { restaurantId: "rest-casa-oliva", date: tuesday, partySize: 2 };

function assertUnique(values) {
  assert.equal(new Set(values).size, values.length);
}

test("Las fichas, los menús y los escenarios tienen identificadores y relaciones válidos", async () => {
  const list = await restaurants.list();
  assert.deepEqual(list.map(({ slug }) => slug), slugs);
  assertUnique(list.map(({ id }) => id));
  assert.deepEqual(Object.keys(mockAvailability).sort(), list.map(({ id }) => id).sort());

  const menus = [];
  for (const { id, slug } of list) {
    const detail = await restaurants.getBySlug(slug);
    assert.equal(detail.id, id);
    assert.match(detail.contact.email, /@example\.com$/);
    assert.ok(existsSync(new URL("../public" + detail.coverImage.url, import.meta.url)));
    const menu = await restaurants.getMenu(id);
    assert.deepEqual(menu, detail.menu);
    assert.deepEqual(menu.categories.map(({ displayOrder }) => displayOrder), [1, 2, 3]);

    const items = menu.categories.flatMap(({ items }) => items);
    assert.equal(items.length, 6);
    assert.ok(items.some(({ isAvailable }) => isAvailable));
    assert.ok(items.some(({ isAvailable }) => !isAvailable));

    for (const { price } of items) {
      assert.equal(price.currency, "MXN");
      assert.ok(Number.isSafeInteger(price.amountMinor) && price.amountMinor >= 0);
    }
    menus.push(menu);
  }

  const categories = menus.flatMap(({ categories }) => categories);
  assertUnique(menus.map(({ id }) => id));
  assertUnique(categories.map(({ id }) => id));
  assertUnique(categories.flatMap(({ items }) => items.map(({ id }) => id)));
  assert.equal((await restaurants.getBySlug("restaurante-demo")).slug, "casa-oliva");
  assert.equal(await restaurants.getBySlug("desconocido"), null);
  assert.equal(await restaurants.getMenu("desconocido"), null);
});

test("El listado filtra por texto, ciudad y cualquiera de las cocinas seleccionadas", async () => {
  const search = async (filters) => (await restaurants.list(filters)).map(({ slug }) => slug);

  assert.deepEqual(await search({ query: " RAIZ " }), ["raiz-norte"]);
  assert.deepEqual(await search({ query: "MAIZ TATEMADO" }), ["raiz-norte"]);
  assert.deepEqual(await search({ city: "SAN PEDRO GARZA GARCIA" }), ["casa-oliva"]);
  assert.deepEqual(await search({ city: "monterrey", cuisines: ["JAPONESA", "mexicana"] }), ["raiz-norte", "kumo"]);
  assert.deepEqual(await search({ city: "monterrey", cuisines: ["JAPONESA"] }), ["kumo"]);
  assert.deepEqual(await search({ query: "sin coincidencias" }), []);
  assert.deepEqual(await search({ partySize: 100 }), slugs);
});

test("La paginación sigue el orden del listado filtrado y rechaza límites inválidos", async () => {
  const filters = { city: "Monterrey", pagination: { page: 2, pageSize: 1 } };
  const page = await restaurants.list(filters);
  assert.deepEqual(page.map(({ slug }) => slug), ["kumo"]);
  assert.deepEqual(await restaurants.list(filters), page);
  assert.deepEqual(await restaurants.list({ pagination: { page: 5, pageSize: 2 } }), []);
  await assert.rejects(restaurants.list({ pagination: { page: 0, pageSize: 2 } }), RangeError);
  await assert.rejects(restaurants.list({ pagination: { page: 1, pageSize: 0.5 } }), RangeError);
});

test("Modificar una ficha, un menú o un resumen no cambia consultas posteriores", async () => {
  const original = await restaurants.getBySlug("casa-oliva");
  const [summary] = await restaurants.list();
  const menu = await restaurants.getMenu(original.id);
  const snapshot = structuredClone(original);

  original.location.city = "Ciudad modificada";
  summary.coverImage.alt = "Texto modificado";
  menu.categories[0].items[0].price.amountMinor = 1;

  assert.deepEqual(await restaurants.getBySlug("casa-oliva"), snapshot);
  assert.deepEqual(await restaurants.getMenu(original.id), snapshot.menu);
  const [newSummary] = await restaurants.list();
  assert.equal(newSummary.coverImage.alt, snapshot.coverImage.alt);
  assert.equal(newSummary.location.city, snapshot.location.city);
});

test("Disponibilidad distingue tamaño del grupo, fecha sin horarios y restaurante desconocido", async () => {
  const result = await availability.getAvailability(demoQuery);
  assert.deepEqual(result, await availability.getAvailability(demoQuery));
  assert.equal(result.timeZone, "America/Mexico_City");
  assert.equal(result.slots.length, 3);

  const localDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: result.timeZone, year: "numeric", month: "2-digit", day: "2-digit",
  });
  for (const { startsAt } of result.slots) {
    assert.match(startsAt, /T\d{2}:\d{2}:\d{2}Z$/);
    assert.equal(localDate.format(Date.parse(startsAt)), tuesday);
  }

  assert.equal((await availability.getAvailability({ ...demoQuery, partySize: 6 })).slots.length, 1);
  assert.deepEqual((await availability.getAvailability({ ...demoQuery, partySize: 7 })).slots, []);
  assert.deepEqual((await availability.getAvailability({ ...demoQuery, date: monday })).slots, []);
  assert.equal(await availability.getAvailability({ ...demoQuery, restaurantId: "desconocido" }), null);
});

test("Disponibilidad rechaza fechas y tamaños de grupo inválidos", async () => {
  for (const date of ["2036-02-30", "2036-6-10", "0000-06-10"]) {
    await assert.rejects(availability.getAvailability({ ...demoQuery, date }), RangeError);
  }

  for (const partySize of [0, -1, 2.5, Infinity]) {
    await assert.rejects(availability.getAvailability({ ...demoQuery, partySize }), RangeError);
  }

  await assert.rejects(availability.getAvailability({ ...demoQuery, restaurantId: " " }), RangeError);
});
