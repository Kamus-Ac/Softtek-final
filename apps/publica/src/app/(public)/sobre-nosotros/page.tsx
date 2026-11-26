import Link from "next/link";
import { routes } from "@/config/routes";

export default function AboutPage() {
  return (
    <main className="space-y-3">
      <h1>Sobre nosotros</h1>
      <p>Esta sección explicará el propósito de la plataforma y cómo ayuda a descubrir restaurantes.</p>
      <Link href={routes.restaurants}>Explorar restaurantes</Link>
    </main>
  );
}
