import Link from "next/link";
import { routes } from "@/config/routes";

export function LoginScreen() {
  return (
    <main className="space-y-3">
      <h1>Iniciar sesión</h1>
      <p>Aquí podrás acceder a tu cuenta de cliente cuando se habilite la autenticación.</p>
      <ul className="flex flex-wrap gap-x-4 gap-y-2">
        <li><Link href={routes.register}>Crear una cuenta</Link></li>
        <li><Link href={routes.profile}>Ver el perfil de demostración</Link></li>
      </ul>
    </main>
  );
}
