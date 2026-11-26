import "server-only";

import type { AvailabilityService } from "@/features/availability/services/availability-service";
import { mockAvailabilityService } from "@/features/availability/services/mock-availability-service";
import { mockRestaurantService } from "@/features/restaurants/services/mock-restaurant-service";
import type { RestaurantService } from "@/features/restaurants/services/restaurant-service";

export const dataServices: {
  restaurants: RestaurantService;
  availability: AvailabilityService;
} = {
  restaurants: mockRestaurantService,
  availability: mockAvailabilityService,
};
