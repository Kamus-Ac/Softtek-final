export const pageLimits = {
  bytes: 256 * 1024,
  blocks: 200,
  depth: 12,
  text: 4000,
  title: 200,
  inlineNodes: 1200,
} as const;

export class PageDocumentError extends Error {
  readonly path: string;

  constructor(path: string, reason: string) {
    super(`${path}: ${reason}`);
    this.name = "PageDocumentError";
    this.path = path;
  }
}

export function requirePageValue(value: unknown, path: string, reason: string): asserts value {
  if (!value) throw new PageDocumentError(path, reason);
}

export function readRecord(value: unknown, path: string): Record<string, unknown> {
  requirePageValue(value !== null && typeof value === "object" && !Array.isArray(value), path, "Se esperaba un objeto.");
  const prototype = Object.getPrototypeOf(value);
  requirePageValue(prototype === Object.prototype || prototype === null, path, "Se esperaba un objeto JSON.");
  return value as Record<string, unknown>;
}

export function readArray(value: unknown, path: string): unknown[] {
  requirePageValue(Array.isArray(value), path, "Se esperaba un arreglo.");
  return value;
}

export function allowKeys(record: Record<string, unknown>, keys: readonly string[], path: string) {
  for (const key of Object.keys(record)) {
    requirePageValue(keys.includes(key), `${path}.${key}`, "Propiedad no admitida.");
  }
}

export function readText(value: unknown, path: string, limit: number = pageLimits.text): string {
  requirePageValue(
    typeof value === "string" && value.length <= limit && !/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value)
      && !/<\s*(?:\/?[a-z][^>]*|[!?][^>]*)>/i.test(value),
    path, `Se esperaba texto plano de hasta ${limit} caracteres.`,
  );
  return value;
}

export function readId(value: unknown, path: string): string {
  requirePageValue(typeof value === "string" && /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,79}$/.test(value), path, "Identificador no válido.");
  return value;
}

// Inspect the original value before JSON serialization can omit a key or invoke a getter.
export function checkJson(value: unknown, path: string) {
  const ancestors = new Set<object>();
  let members = 0;
  let stringUnits = 0;
  function visit(item: unknown, at: string, depth: number) {
    requirePageValue(depth <= 48 && ++members <= 30_000, at, "El árbol JSON excede sus límites.");
    if (typeof item === "string") {
      stringUnits += item.length;
      requirePageValue(stringUnits <= pageLimits.bytes, at, "El JSON supera el límite de tamaño.");
      return;
    }
    if (item === null || typeof item === "boolean" || (typeof item === "number" && Number.isFinite(item))) return;
    requirePageValue(typeof item === "object" && item !== null && !ancestors.has(item), at, "Valor no serializable en JSON.");
    const list = Array.isArray(item);
    if (!list) readRecord(item, at);
    const entries = Object.getOwnPropertyDescriptors(item);
    requirePageValue(Object.getOwnPropertySymbols(item).length === 0, at, "Los símbolos no son JSON.");
    ancestors.add(item);
    if (list) requirePageValue(Object.keys(entries).length === item.length + 1, at, "Arreglo JSON inválido.");
    for (const [key, descriptor] of Object.entries(entries)) {
      if (list && key === "length") continue;
      requirePageValue(
        !["__proto__", "constructor", "prototype", "toJSON"].includes(key)
          && descriptor.enumerable && "value" in descriptor
          && (!list || (/^(0|[1-9]\d*)$/.test(key) && Number(key) < item.length)),
        at, "Propiedad JSON no admitida.",
      );
      stringUnits += key.length;
      requirePageValue(stringUnits <= pageLimits.bytes, at, "El JSON supera el límite de tamaño.");
      visit(descriptor.value, `${at}.${key}`, depth + 1);
    }
    ancestors.delete(item);
  }
  visit(value, path, 0);
  requirePageValue(new TextEncoder().encode(JSON.stringify(value)).length <= pageLimits.bytes, path, "El JSON supera el límite de 256 KiB.");
}
