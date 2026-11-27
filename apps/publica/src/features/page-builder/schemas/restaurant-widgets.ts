import { getRestaurantWidgetFields, type RestaurantWidgetOptions, type RestaurantWidgetType } from "../types/restaurant-widgets";
import { allowKeys, pageLimits, readRecord, readText, requirePageValue } from "./page-values";

export function readRestaurantWidgetOptions<T extends RestaurantWidgetType>(
  type: T, input: unknown, path: string,
): RestaurantWidgetOptions<T> {
  const options = readRecord(input, path);
  const fields = getRestaurantWidgetFields(type);
  allowKeys(options, fields.map(([key]) => key), path);

  for (const [key, field] of fields) {
    const at = `${path}.${key}`;
    const value = options[key];
    if (field.type === "checkbox") {
      requirePageValue(typeof value === "boolean", at, "Se esperaba un booleano.");
    } else if (field.type === "select") {
      requirePageValue(field.options.some((option) => option.id === value), at, "Opción de presentación no admitida.");
    } else {
      readText(value, at, key === "description" ? pageLimits.text : pageLimits.title);
    }
  }
  return options as RestaurantWidgetOptions<T>;
}
