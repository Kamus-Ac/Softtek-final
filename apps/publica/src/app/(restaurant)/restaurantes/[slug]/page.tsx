import Link from "next/link";
import { routes } from "@/config/routes";

export default async function RestaurantPage({ params }: PageProps<"/restaurantes/[slug]">) {
  const { slug: segment } = await params;
  const slug = decodeURIComponent(segment);

  return (
    <main className="space-y-3">
      <h1>Ficha pública del restaurante</h1>
      <p>Restaurante de demostración <bdi className="break-all">{slug}</bdi>.</p>
      <p>Aquí podrás consultar información, horarios y menú del restaurante.</p>
      <Link href={routes.reserve(slug)}>Ir al proceso de reserva</Link>
    </main>
  );
}
