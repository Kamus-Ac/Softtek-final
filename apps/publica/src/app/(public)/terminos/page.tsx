import Link from "next/link";
import { routes } from "@/config/routes";

export default function TermsPage() {
  return (
    <main className="space-y-3">
      <h1>Términos</h1>
      <p>Aquí se publicarán las condiciones de uso de la plataforma y del servicio de reservas.</p>
      <Link href={routes.privacy}>Consultar privacidad</Link>
    </main>
  );
}
