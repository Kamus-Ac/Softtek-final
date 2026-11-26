import type { CuisineType } from "@/features/restaurants/types/restaurant";

export interface RestaurantFilters {
  query?: string;
  city?: string;
  cuisines?: readonly CuisineType[];
  partySize?: number;
  pagination?: {
    /** Número de página a partir de 1. */
    page: number;
    pageSize: number;
  };
}
