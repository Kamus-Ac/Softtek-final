import type { OpeningHours } from "@/features/restaurants/types/opening-hours";
import type { RestaurantContact, RestaurantLocation } from "@/features/restaurants/types/restaurant";
import type { MenuWidgetData } from "./menu-widget";

export const restaurantWidgetClass = "builder-restaurant-widget";

export interface AvailabilityExample {
  date: string;
  partySize: number;
  times: readonly string[] | null;
}

export interface EditorRestaurantContext {
  restaurantId: string;
  slug: string;
  name: string;
  hours: OpeningHours | null;
  location: Omit<RestaurantLocation, "coordinates">;
  contact: RestaurantContact | null;
  availability: readonly AvailabilityExample[];
  menu: MenuWidgetData | null;
}

const layout = {
  type: "select", label: "Distribución", initial: "list",
  options: [{ id: "list", label: "Lista" }, { id: "compact", label: "Compacta" }],
} as const;
const text = (label: string, initial: string) => ({ type: "text", label, initial }) as const;
const checkbox = (label: string) => ({ type: "checkbox", label, initial: true }) as const;

export const restaurantWidgets = {
  "restaurant-hours": {
    label: "Horarios comerciales",
    fields: { heading: text("Título", "Horarios comerciales"), layout, showClosedDays: checkbox("Mostrar días cerrados") },
  },
  "restaurant-location": {
    label: "Ubicación",
    fields: {
      heading: text("Título", "Ubicación"), layout, showCity: checkbox("Mostrar ciudad"),
      showState: checkbox("Mostrar estado"), showCountry: checkbox("Mostrar país"),
    },
  },
  "restaurant-contact": {
    label: "Contacto",
    fields: {
      heading: text("Título", "Contacto"), layout, showPhone: checkbox("Mostrar teléfono"),
      showEmail: checkbox("Mostrar correo"), showWebsite: checkbox("Mostrar sitio web"),
    },
  },
  "restaurant-availability": {
    label: "Disponibilidad",
    fields: { heading: text("Título", "Disponibilidad"), layout },
  },
  "restaurant-reservation": {
    label: "Reservaciones",
    fields: {
      heading: text("Título", "Reservaciones"),
      description: text("Descripción editorial", "Consulta el flujo de reserva de este restaurante."),
      buttonText: text("Texto del botón", "Reservar mesa"),
      alignment: {
        type: "select", label: "Alineación", initial: "left",
        options: [{ id: "left", label: "Izquierda" }, { id: "center", label: "Centro" }, { id: "right", label: "Derecha" }],
      },
    },
  },
} as const;

export type RestaurantWidgetType = keyof typeof restaurantWidgets;
type OptionValue<F> = F extends { type: "checkbox" } ? boolean
  : F extends { options: readonly { id: infer Value }[] } ? Value : string;
export type RestaurantWidgetOptions<T extends RestaurantWidgetType> = {
  -readonly [K in keyof (typeof restaurantWidgets)[T]["fields"]]: OptionValue<(typeof restaurantWidgets)[T]["fields"][K]>;
};

export type RestaurantWidgetBlock = {
  [T in RestaurantWidgetType]: { type: T; options: RestaurantWidgetOptions<T> }
}[RestaurantWidgetType];

export function isRestaurantWidgetType(value: unknown): value is RestaurantWidgetType {
  return typeof value === "string" && Object.hasOwn(restaurantWidgets, value);
}

type WidgetField = { label: string } & (
  | { type: "text"; initial: string }
  | { type: "checkbox"; initial: boolean }
  | { type: "select"; initial: string; options: readonly { id: string; label: string }[] }
);

export function getRestaurantWidgetFields(type: RestaurantWidgetType) {
  return Object.entries<WidgetField>(restaurantWidgets[type].fields);
}

export function getRestaurantWidgetDefaults<T extends RestaurantWidgetType>(type: T): RestaurantWidgetOptions<T> {
  return Object.fromEntries(getRestaurantWidgetFields(type)
    .map(([key, field]) => [key, field.initial])) as RestaurantWidgetOptions<T>;
}
