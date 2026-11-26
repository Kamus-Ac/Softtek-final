import Link from "next/link";
import { routes } from "@/config/routes";

export function PublicHeader() {
  return (
    <header className="border-b border-neutral-200">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href={routes.home} className="font-semibold">Plataforma de restaurantes</Link>
        <nav aria-label="Navegación pública">
          <ul className="flex flex-wrap gap-x-4 gap-y-2">
            <li><Link href={routes.restaurants}>Restaurantes</Link></li>
            <li><Link href={routes.about}>Sobre nosotros</Link></li>
            <li><Link href={routes.login}>Iniciar sesión</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
