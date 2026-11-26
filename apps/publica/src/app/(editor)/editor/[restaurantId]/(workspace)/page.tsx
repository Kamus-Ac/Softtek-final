export default async function EditorPage({ params }: PageProps<"/editor/[restaurantId]">) {
  const { restaurantId: segment } = await params;
  const restaurantId = decodeURIComponent(segment);

  return (
    <main className="space-y-3">
      <h1>Editor de restaurante</h1>
      <p>Restaurante de demostración <bdi className="break-all">{restaurantId}</bdi>.</p>
      <p>Aquí se podrá editar el contenido de la ficha pública.</p>
    </main>
  );
}
