import Link from "next/link";
import { routes } from "@/config/routes";

export default function BookingConfirmationPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-3 px-4 py-8 sm:px-6">
      <h1>Confirmación de reserva</h1>
      <p>Aquí se mostrarán los datos de una reserva confirmada. Esta pantalla es una demostración.</p>
      <ul className="flex flex-wrap gap-x-4 gap-y-2">
        <li><Link href={routes.restaurants}>Volver al directorio</Link></li>
        <li><Link href={routes.myReservations}>Consultar mis reservas</Link></li>
      </ul>
    </main>
  );
}
