import { GrapesEditor } from "./components/GrapesEditor";

export function EditorWorkspaceScreen({ restaurantId }: { restaurantId: string }) {
  return (
    <main className="space-y-3">
      <h1>Editor de restaurante</h1>
      <p>Restaurante de demostración <bdi className="break-all">{restaurantId}</bdi>.</p>
      <GrapesEditor key={restaurantId} />
    </main>
  );
}
