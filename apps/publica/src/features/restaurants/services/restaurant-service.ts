import type { RestaurantFilters } from "@/features/discovery/types/restaurant-filters";
import type { Menu } from "../types/menu";
import type { RestaurantDetail, RestaurantSummary } from "../types/restaurant";

export interface RestaurantService {
  /** Un listado sin coincidencias devuelve una lista vacía. */
  list(filters?: RestaurantFilters): Promise<readonly RestaurantSummary[]>;
  /** Devuelve null si el slug no existe. */
  getBySlug(slug: string): Promise<RestaurantDetail | null>;
  /** Devuelve null si el restaurante no existe o carece de menú público. */
  getMenu(restaurantId: string): Promise<Menu | null>;
}
