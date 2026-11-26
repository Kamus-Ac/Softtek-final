import Link from "next/link";
import { routes } from "@/config/routes";

export function ReserveScreen({ slug }: { slug: string }) {
  return (
    <main className="space-y-3">
      <h1>Reservar una mesa</h1>
      <p>Restaurante de demostración <bdi className="break-all">{slug}</bdi>.</p>
      <p>Aquí podrás elegir la fecha, la hora y el número de personas.</p>
      <Link href={routes.bookingConfirmation}>Ver confirmación de demostración</Link>
    </main>
  );
}
