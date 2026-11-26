import type { TimeZone } from "@/types/date-time";
import type { Menu } from "./menu";
import type { OpeningHours } from "./opening-hours";
import type { RestaurantImage } from "./restaurant-image";

/** Valor del catálogo de cocinas que usan el directorio y sus filtros. */
export type CuisineType = string;

export interface RestaurantLocation {
  address: string;
  city: string;
  state: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface RestaurantContact {
  phone?: string;
  email?: string;
  websiteUrl?: string;
}

export interface RestaurantSummary {
  id: string;
  slug: string;
  name: string;
  cuisines: readonly CuisineType[];
  location: Pick<RestaurantLocation, "city" | "state" | "country">;
  coverImage?: RestaurantImage;
}

export interface RestaurantDetail extends RestaurantSummary {
  description?: string;
  location: RestaurantLocation;
  contact?: RestaurantContact;
  gallery: readonly RestaurantImage[];
  timeZone: TimeZone;
  openingHours?: OpeningHours;
  menu?: Menu;
}
