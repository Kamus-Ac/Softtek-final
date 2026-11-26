import Link from "next/link";
import { routes } from "@/config/routes";

export default function MyReservationsPage() {
  return (
    <main className="space-y-3">
      <h1>Mis reservas</h1>
      <p>Aquí podrás consultar tus reservas y su estado. Esta página es una demostración.</p>
      <Link href={routes.restaurants}>Buscar restaurantes</Link>
    </main>
  );
}
