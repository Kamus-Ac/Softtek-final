import type { Editor } from "grapesjs";
import { registerLayoutComponents, restaurantBlocks } from "../blocks/restaurant-blocks";
import { menuWidgetType, registerMenuWidget } from "../blocks/restaurant-menu";
import type { MenuWidgetData } from "../types/menu-widget";

export function registerEditorBlocks(editor: Editor, menu: MenuWidgetData | null) {
  registerLayoutComponents(editor);
  registerMenuWidget(editor, menu);

  for (const block of restaurantBlocks) {
    editor.BlockManager.add(block.id, block);
  }
  editor.BlockManager.add(menuWidgetType, {
    label: "Menú dinámico experimental",
    category: "Restaurante",
    content: { type: menuWidgetType },
  });
}
