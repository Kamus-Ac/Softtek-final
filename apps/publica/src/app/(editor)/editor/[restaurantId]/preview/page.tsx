import type { Metadata } from "next";
import Link from "next/link";
import { routes } from "@/config/routes";
import { RestaurantPreviewContent } from "@/features/page-builder/renderer/RestaurantPreviewContent";

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
      <RestaurantPreviewContent restaurantId={restaurantId} />
      <Link href={routes.editor(restaurantId)}>Volver al editor</Link>
    </main>
  );
}
