import Link from "next/link";
import { routes } from "@/config/routes";

export function AccountNavigation() {
  return (
    <nav aria-label="Navegación de cuenta">
      <ul className="flex flex-wrap gap-x-4 gap-y-2">
        <li><Link href={routes.profile}>Perfil</Link></li>
        <li><Link href={routes.myReservations}>Mis reservas</Link></li>
        <li><Link href={routes.home}>Ir al inicio</Link></li>
      </ul>
    </nav>
  );
}
