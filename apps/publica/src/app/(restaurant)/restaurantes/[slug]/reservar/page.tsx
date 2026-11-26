import { ReserveScreen } from "@/features/reservations/components/ReserveScreen";

export default async function ReservePage({ params }: PageProps<"/restaurantes/[slug]/reservar">) {
  const { slug: segment } = await params;
  const slug = decodeURIComponent(segment);

  return <ReserveScreen slug={slug} />;
}
