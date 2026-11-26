import Link from "next/link";
import { routes } from "@/config/routes";

export function RestaurantScreen({ slug }: { slug: string }) {
  return (
    <main className="space-y-3">
      <h1>Ficha pública del restaurante</h1>
      <p>Restaurante de demostración <bdi className="break-all">{slug}</bdi>.</p>
      <p>Aquí podrás consultar información, horarios y menú del restaurante.</p>
      <Link href={routes.reserve(slug)}>Ir al proceso de reserva</Link>
    </main>
  );
}
