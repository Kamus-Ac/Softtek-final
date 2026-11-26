import { notFound } from "next/navigation";
import { demoRestaurantSlug } from "@/config/routes";
import { RestaurantScreen } from "@/features/restaurants/components/RestaurantScreen";
import { dataServices } from "@/lib/data-services";

export const dynamicParams = false;

export async function generateStaticParams() {
  const restaurants = await dataServices.restaurants.list();

  return [...restaurants.map(({ slug }) => ({ slug })), { slug: demoRestaurantSlug }];
}

export default async function RestaurantPage({ params }: PageProps<"/restaurantes/[slug]">) {
  const { slug: segment } = await params;
  const slug = decodeURIComponent(segment);
  const restaurant = await dataServices.restaurants.getBySlug(slug);

  if (!restaurant) notFound();

  return <RestaurantScreen restaurant={restaurant} reservationSlug={slug} />;
}
