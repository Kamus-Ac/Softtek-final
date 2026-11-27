import { GrapesEditor } from "./components/GrapesEditor";
import { getEditorRestaurant } from "../services/get-editor-restaurant";

export async function EditorWorkspaceScreen({ restaurantId }: { restaurantId: string }) {
  const context = await getEditorRestaurant(restaurantId);

  return (
    <main className="space-y-3">
      <h1>Editor de restaurante</h1>
      <p>Restaurante de demostración <bdi className="break-all">{restaurantId}</bdi>.</p>
      <GrapesEditor key={restaurantId} context={context} />
    </main>
  );
}
