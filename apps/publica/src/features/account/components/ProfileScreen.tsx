import Link from "next/link";
import { routes } from "@/config/routes";

export function ProfileScreen() {
  return (
    <main className="space-y-3">
      <h1>Perfil</h1>
      <p>Aquí podrás consultar y editar los datos de tu cuenta. Esta página es una demostración.</p>
      <Link href={routes.myReservations}>Consultar mis reservas</Link>
    </main>
  );
}
