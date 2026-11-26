import Link from "next/link";
import { routes } from "@/config/routes";

export default function HomePage() {
  return (
    <main className="space-y-3">
      <h1>Web pública de restaurantes</h1>
      <p>Desde aquí podrás descubrir restaurantes y consultar cómo reservar una mesa.</p>
      <Link href={routes.restaurants}>Explorar el directorio</Link>
    </main>
  );
}
