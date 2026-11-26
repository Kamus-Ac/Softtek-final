import { RestaurantDirectoryScreen } from "@/features/discovery/components/RestaurantDirectoryScreen";
import { dataServices } from "@/lib/data-services";

export default async function RestaurantsPage() {
  const restaurants = await dataServices.restaurants.list();

  return <RestaurantDirectoryScreen restaurants={restaurants} />;
}
