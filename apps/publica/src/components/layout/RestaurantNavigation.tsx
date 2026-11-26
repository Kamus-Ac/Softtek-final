import Link from "next/link";
import { routes } from "@/config/routes";

export function RestaurantNavigation({ slug }: { slug: string }) {
  return (
    <nav aria-label="Navegación del restaurante">
      <ul className="flex flex-wrap gap-x-4 gap-y-2">
        <li><Link href={routes.restaurant(slug)}>Ficha del restaurante</Link></li>
        <li><Link href={routes.reserve(slug)}>Reservar</Link></li>
        <li><Link href={routes.restaurants}>Volver al directorio</Link></li>
      </ul>
    </nav>
  );
}
