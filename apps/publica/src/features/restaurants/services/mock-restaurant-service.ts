import { demoRestaurantSlug } from "@/config/routes";
import { mockRestaurants } from "@/mocks/restaurants";
import type { RestaurantDetail, RestaurantSummary } from "../types/restaurant";
import type { RestaurantService } from "./restaurant-service";

function normalize(value: string) {
  return value.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function summarize({ id, slug, name, cuisines, location, coverImage }: RestaurantDetail): RestaurantSummary {
  const { city, state, country } = location;
  return { id, slug, name, cuisines, location: { city, state, country }, ...(coverImage && { coverImage }) };
}

export const mockRestaurantService: RestaurantService = {
  async list({ query, city, cuisines, pagination } = {}) {
    if (pagination && (
      !Number.isSafeInteger(pagination.page) || pagination.page < 1 ||
      !Number.isSafeInteger(pagination.pageSize) || pagination.pageSize < 1
    )) {
      throw new RangeError("La página y su tamaño deben ser enteros positivos.");
    }

    const search = normalize(query ?? "");
    const normalizedCity = normalize(city ?? "");
    const requestedCuisines = cuisines?.map(normalize).filter(Boolean) ?? [];

    // El directorio delegará el filtro por tamaño del grupo al servicio de disponibilidad.
    const matches = mockRestaurants.filter((restaurant) => {
      const matchesQuery = normalize(restaurant.name).includes(search) ||
        normalize(restaurant.description ?? "").includes(search);
      const matchesCity = !normalizedCity || normalize(restaurant.location.city) === normalizedCity;
      const matchesCuisine = requestedCuisines.length === 0 ||
        restaurant.cuisines.some((cuisine) => requestedCuisines.includes(normalize(cuisine)));

      return matchesQuery && matchesCity && matchesCuisine;
    });

    if (!pagination) return matches.map(summarize);

    const start = (pagination.page - 1) * pagination.pageSize;
    return matches.slice(start, start + pagination.pageSize).map(summarize);
  },

  async getBySlug(slug) {
    const target = slug === demoRestaurantSlug ? "casa-oliva" : slug;
    return mockRestaurants.find((restaurant) => restaurant.slug === target) ?? null;
  },

  async getMenu(restaurantId) {
    return mockRestaurants.find((restaurant) => restaurant.id === restaurantId)?.menu ?? null;
  },
};
