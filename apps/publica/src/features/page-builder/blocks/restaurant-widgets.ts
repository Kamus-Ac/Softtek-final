import type { Component, Editor } from "grapesjs";
import {
  getRestaurantWidgetDefaults, getRestaurantWidgetFields, restaurantWidgetClass, restaurantWidgets,
  type EditorRestaurantContext, type RestaurantWidgetOptions, type RestaurantWidgetType,
} from "../types/restaurant-widgets";
import { describeAvailability, formatOpeningHours, getReservationPath } from "../utils/restaurant-widget-preview";

const widgetStyleProperties = ["font-size", "line-height", "color", "background-color", "margin", "padding", "opacity"];

function appendText(parent: HTMLElement, tag: "h2" | "p" | "strong" | "span" | "small" | "address", value: string) {
  const node = parent.ownerDocument.createElement(tag);
  node.textContent = value;
  parent.append(node);
}

function appendRows(
  parent: HTMLElement,
  rows: readonly { label: string; value: string }[],
  empty: string,
) {
  if (!rows.length) {
    appendText(parent, "p", empty);
    return;
  }
  const list = parent.ownerDocument.createElement("ul");
  for (const { label, value } of rows) {
    const entry = parent.ownerDocument.createElement("li");
    appendText(entry, "strong", label);
    appendText(entry, "span", value);
    list.append(entry);
  }
  parent.append(list);
}

const previews: {
  [T in RestaurantWidgetType]: (root: HTMLElement, context: EditorRestaurantContext | null, options: RestaurantWidgetOptions<T>) => void;
} = {
  "restaurant-hours"(root, context, { showClosedDays }) {
    appendRows(root, formatOpeningHours(context?.hours ?? null, showClosedDays),
      context?.hours ? "No hay días abiertos para mostrar." : "Sin horarios comerciales publicados.");
  },
  "restaurant-location"(root, context, { showCity, showState, showCountry }) {
    if (!context?.location) {
      appendText(root, "p", "Sin ubicación pública.");
      return;
    }
    const { address, city, state, country } = context.location;
    appendText(root, "address", address);
    appendRows(root, [
      ...(showCity && city ? [{ label: "Ciudad", value: city }] : []),
      ...(showState && state ? [{ label: "Estado", value: state }] : []),
      ...(showCountry && country ? [{ label: "País", value: country }] : []),
    ], "Sin campos de ubicación adicionales para mostrar.");
  },
  "restaurant-contact"(root, context, { showPhone, showEmail, showWebsite }) {
    const { phone, email, websiteUrl } = context?.contact ?? {};
    appendRows(root, [
      ...(showPhone && phone ? [{ label: "Teléfono", value: phone }] : []),
      ...(showEmail && email ? [{ label: "Correo electrónico", value: email }] : []),
      ...(showWebsite && websiteUrl ? [{ label: "Sitio web", value: websiteUrl }] : []),
    ], "Sin canales públicos para mostrar.");
  },
  "restaurant-availability"(root, context) {
    appendRows(root, (context?.availability ?? []).map(({ date, partySize, times }) => ({
      label: `${date} · ${partySize} ${partySize === 1 ? "persona" : "personas"}`,
      value: describeAvailability(times),
    })), describeAvailability(null));
    appendText(root, "small", "Ejemplos fijos del servicio simulado.");
  },
  "restaurant-reservation"(root, context, { description, buttonText, alignment }) {
    root.dataset.alignment = alignment;
    appendText(root, "p", description);
    const button = root.ownerDocument.createElement("button");
    button.type = "button";
    button.disabled = true;
    button.textContent = buttonText;
    root.append(button);
    const path = getReservationPath(context);
    appendText(root, "small", path ? `Destino de demostración: ${path}` : "Sin destino de reserva en esta demostración.");
  },
};

function registerWidget<T extends RestaurantWidgetType>(editor: Editor, type: T, context: EditorRestaurantContext | null) {
  const { label } = restaurantWidgets[type];
  const entries = getRestaurantWidgetFields(type);
  const defaults = getRestaurantWidgetDefaults(type);
  const changeEvents = entries.map(([key]) => `change:${key}`).join(" ");

  function render(root: HTMLElement, model: Component) {
    const options = Object.fromEntries(entries.map(([key, field]) => {
      const value: unknown = model.get(key);
      const valid = field.type === "select" ? field.options.some((option) => option.id === value)
        : typeof value === typeof field.initial;
      return [key, valid ? value : field.initial];
    })) as RestaurantWidgetOptions<T>;
    const view = root.ownerDocument.createElement("div");
    view.className = "builder-restaurant-widget-preview";
    view.contentEditable = "false";
    view.dataset.layout = model.get("layout") === "compact" ? "compact" : "list";
    appendText(view, "h2", options.heading);
    previews[type](view, context, options);
    if (context && type !== "restaurant-availability" && type !== "restaurant-reservation") {
      appendText(view, "small", `Datos de demostración de ${context.name}.`);
    }
    root.replaceChildren(view);
  }

  editor.Components.addType(type, {
    model: {
      defaults: {
        ...defaults,
        tagName: "section",
        name: label,
        classes: [restaurantWidgetClass],
        editable: false,
        droppable: false,
        stylable: widgetStyleProperties,
        traits: entries.map(([name, field]) => ({
          name, type: field.type, label: field.label, changeProp: true,
          ...(field.type === "select" && { options: field.options.map((entry) => ({ ...entry })) }),
        })),
      },
    },
    view: {
      init() {
        this.listenTo(this.model, changeEvents, () => render(this.el, this.model));
      },
      onRender({ el, model }) {
        render(el, model);
      },
    },
  });
  editor.BlockManager.add(type, { label, category: "Restaurante", content: { type } });
}

export function registerRestaurantWidgets(editor: Editor, context: EditorRestaurantContext | null) {
  for (const type of Object.keys(restaurantWidgets) as RestaurantWidgetType[]) registerWidget(editor, type, context);
}
