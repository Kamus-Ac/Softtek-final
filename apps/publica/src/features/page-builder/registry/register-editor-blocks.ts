import type { Editor } from "grapesjs";
import { registerLayoutComponents, restaurantBlocks } from "../blocks/restaurant-blocks";
import { menuWidgetType, registerMenuWidget } from "../blocks/restaurant-menu";
import { registerRestaurantWidgets } from "../blocks/restaurant-widgets";
import type { EditorRestaurantContext } from "../types/restaurant-widgets";

export function registerEditorBlocks(editor: Editor, context: EditorRestaurantContext | null) {
  registerLayoutComponents(editor);
  registerMenuWidget(editor, context?.menu ?? null);

  for (const block of restaurantBlocks) {
    editor.BlockManager.add(block.id, block);
  }
  editor.BlockManager.add(menuWidgetType, {
    label: "Menú dinámico experimental",
    category: "Restaurante",
    content: { type: menuWidgetType },
  });
  registerRestaurantWidgets(editor, context);
}
