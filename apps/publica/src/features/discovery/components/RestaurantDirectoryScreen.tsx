import Link from "next/link";
import { routes } from "@/config/routes";
import type { RestaurantSummary } from "@/features/restaurants/types/restaurant";

export function RestaurantDirectoryScreen({ restaurants }: { restaurants: readonly RestaurantSummary[] }) {
  return (
    <main className="space-y-3">
      <h1>Directorio de restaurantes</h1>
      <p>Restaurantes ficticios para la demostración.</p>
      {restaurants.length === 0 ? (
        <p>No hay restaurantes para mostrar.</p>
      ) : (
        <ul className="list-disc space-y-2 pl-5">
          {restaurants.map(({ id, slug, name }) => (
            <li key={id}><Link href={routes.restaurant(slug)}>{name}</Link></li>
          ))}
        </ul>
      )}
    </main>
  );
}
