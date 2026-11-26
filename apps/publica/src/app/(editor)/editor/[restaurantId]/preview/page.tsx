import type { Metadata } from "next";
import Link from "next/link";
import { routes } from "@/config/routes";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function EditorPreviewPage({
  params,
}: PageProps<"/editor/[restaurantId]/preview">) {
  const { restaurantId: segment } = await params;
  const restaurantId = decodeURIComponent(segment);

  return (
    <main className="mx-auto max-w-3xl space-y-3 px-4 py-8 sm:px-6">
      <h1>Vista previa del restaurante</h1>
      <p>Restaurante de demostración <bdi className="break-all">{restaurantId}</bdi>.</p>
      <p>Aquí se podrá revisar la ficha pública antes de publicarla.</p>
      <Link href={routes.editor(restaurantId)}>Volver al editor</Link>
    </main>
  );
}
