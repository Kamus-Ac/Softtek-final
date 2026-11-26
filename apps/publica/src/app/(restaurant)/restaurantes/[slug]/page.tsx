import { RestaurantScreen } from "@/features/restaurants/components/RestaurantScreen";

export default async function RestaurantPage({ params }: PageProps<"/restaurantes/[slug]">) {
  const { slug: segment } = await params;
  const slug = decodeURIComponent(segment);

  return <RestaurantScreen slug={slug} />;
}
