import { GrapesEditor } from "./components/GrapesEditor";
import { getEditorMenu } from "../services/get-editor-menu";

export async function EditorWorkspaceScreen({ restaurantId }: { restaurantId: string }) {
  const menu = await getEditorMenu(restaurantId);

  return (
    <main className="space-y-3">
      <h1>Editor de restaurante</h1>
      <p>Restaurante de demostración <bdi className="break-all">{restaurantId}</bdi>.</p>
      <GrapesEditor key={restaurantId} menu={menu} />
    </main>
  );
}
