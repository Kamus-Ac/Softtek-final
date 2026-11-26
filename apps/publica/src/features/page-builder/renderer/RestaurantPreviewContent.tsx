export function RestaurantPreviewContent({ restaurantId }: { restaurantId: string }) {
  return (
    <>
      <h1>Vista previa del restaurante</h1>
      <p>Restaurante de demostración <bdi className="break-all">{restaurantId}</bdi>.</p>
      <p>Aquí se podrá revisar la ficha pública antes de publicarla.</p>
    </>
  );
}
