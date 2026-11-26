import Link from "next/link";
import { routes } from "@/config/routes";
import type { RestaurantDetail } from "../types/restaurant";

export function RestaurantScreen({ restaurant, reservationSlug }: {
  restaurant: RestaurantDetail;
  reservationSlug: string;
}) {
  const { name, description, cuisines, location } = restaurant;

  return (
    <main className="space-y-3">
      <h1>{name}</h1>
      <p>Restaurante ficticio de demostración.</p>
      {description && <p>{description}</p>}
      <p>{location.city}, {location.state} · {cuisines.join(", ")}</p>
      <Link href={routes.reserve(reservationSlug)}>Ir al proceso de reserva</Link>
    </main>
  );
}
