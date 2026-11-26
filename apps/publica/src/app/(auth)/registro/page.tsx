import Link from "next/link";
import { routes } from "@/config/routes";

export default function RegisterPage() {
  return (
    <main className="space-y-3">
      <h1>Registro</h1>
      <p>Aquí podrás crear una cuenta de cliente para consultar tus reservas.</p>
      <Link href={routes.login}>Ir a iniciar sesión</Link>
    </main>
  );
}
