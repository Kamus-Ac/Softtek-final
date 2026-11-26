import Link from "next/link";
import { routes } from "@/config/routes";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-5xl space-y-3 px-4 py-8 sm:px-6">
      <h1>Página no encontrada</h1>
      <p>La dirección solicitada no corresponde a una página disponible.</p>
      <Link href={routes.home}>Volver al inicio</Link>
    </main>
  );
}
