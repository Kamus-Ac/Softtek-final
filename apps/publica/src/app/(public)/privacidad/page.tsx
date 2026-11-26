import Link from "next/link";
import { routes } from "@/config/routes";

export default function PrivacyPage() {
  return (
    <main className="space-y-3">
      <h1>Privacidad</h1>
      <p>Aquí se publicará el aviso sobre el tratamiento de los datos personales en la plataforma.</p>
      <Link href={routes.terms}>Consultar términos</Link>
    </main>
  );
}
