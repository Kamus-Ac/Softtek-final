import type { Component, Editor } from "grapesjs";
import { getMenuWidgetDefaults, type MenuWidgetData, type MenuWidgetOptions } from "../types/menu-widget";

export const menuWidgetType = "restaurant-menu";

const menuStyleProperties = [
  "font-family", "font-size", "font-weight", "line-height", "text-align", "color",
  "margin", "padding", "background-color", "border", "border-radius", "box-shadow", "opacity",
];

function getMenuOptions(model: Component): MenuWidgetOptions {
  const title: unknown = model.get("menuTitle");
  return {
    menuTitle: typeof title === "string" ? title.trim() : "",
    menuLayout: model.get("menuLayout") === "grid" ? "grid" : "list",
    showDescriptions: model.get("showDescriptions") === true,
    showImages: model.get("showImages") === true,
  };
}

function renderMenu(root: HTMLElement, menu: MenuWidgetData | null, options: MenuWidgetOptions) {
  const doc = root.ownerDocument;
  const preview = doc.createElement("div");
  preview.className = "builder-menu-preview";
  preview.dataset.layout = options.menuLayout;
  preview.contentEditable = "false";
  const title = doc.createElement("h2");
  title.textContent = options.menuTitle || menu?.name || "Menú";
  preview.append(title);

  if (!menu?.categories.length) {
    const empty = doc.createElement("p");
    empty.textContent = "El menú no está disponible en esta demostración.";
    preview.append(empty);
  }

  for (const category of menu?.categories ?? []) {
    const section = doc.createElement("section");
    const heading = doc.createElement("h3");
    heading.textContent = category.name;
    const items = doc.createElement("ul");

    for (const item of category.items) {
      const row = doc.createElement("li");
      if (options.showImages && item.image) {
        const image = doc.createElement("img");
        image.src = item.image.url;
        image.alt = item.image.alt;
        row.append(image);
      }

      const name = doc.createElement("h4");
      name.textContent = item.name;
      row.append(name);

      if (options.showDescriptions && item.description) {
        const description = doc.createElement("p");
        description.textContent = item.description;
        row.append(description);
      }

      const price = doc.createElement("span");
      price.textContent = item.priceLabel;
      const availability = doc.createElement("small");
      availability.textContent = item.isAvailable ? "Disponible" : "No disponible";
      row.append(price, availability);
      items.append(row);
    }

    section.append(heading, items);
    preview.append(section);
  }
  root.replaceChildren(preview);
}

export function registerMenuWidget(editor: Editor, menu: MenuWidgetData | null) {
  const defaults = getMenuWidgetDefaults(menu?.name);

  editor.Components.addType(menuWidgetType, {
    model: {
      defaults: {
        ...defaults,
        tagName: "section",
        name: "Menú dinámico",
        classes: ["builder-menu"],
        editable: false,
        droppable: false,
        stylable: menuStyleProperties,
        traits: [
          { name: "menuTitle", label: "Título de sección", changeProp: true },
          {
            name: "menuLayout", label: "Distribución", type: "select", changeProp: true,
            options: [{ id: "list", label: "Lista" }, { id: "grid", label: "Cuadrícula" }],
          },
          { name: "showDescriptions", label: "Mostrar descripciones", type: "checkbox", changeProp: true },
          { name: "showImages", label: "Mostrar imágenes", type: "checkbox", changeProp: true },
        ],
      },
    },
    view: {
      init() {
        this.listenTo(this.model, "change:menuTitle change:menuLayout change:showDescriptions change:showImages",
          () => renderMenu(this.el, menu, getMenuOptions(this.model)));
      },
      onRender({ el, model }) {
        renderMenu(el, menu, getMenuOptions(model));
      },
    },
  });
}
