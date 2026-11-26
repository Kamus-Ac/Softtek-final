import Link from "next/link";
import { demoRestaurantSlug, routes } from "@/config/routes";

export function RestaurantDirectoryScreen() {
  return (
    <main className="space-y-3">
      <h1>Directorio de restaurantes</h1>
      <p>Aquí podrás buscar restaurantes y filtrar los resultados. La ficha de ejemplo representa un restaurante ficticio.</p>
      <Link href={routes.restaurant(demoRestaurantSlug)}>Abrir ficha del restaurante de demostración</Link>
    </main>
  );
}
