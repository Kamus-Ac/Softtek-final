import type { RestaurantDetail } from "@/features/restaurants/types/restaurant";
import { casaOlivaMenu, kumoMenu, raizNorteMenu } from "./menus";
import { casaOlivaHours, kumoHours, raizNorteHours } from "./opening-hours";

const coverImage = {
  url: "/images/restaurant-placeholder.svg",
  alt: "Ilustración genérica de un plato para la demostración",
};

export const mockRestaurants: readonly RestaurantDetail[] = [
  {
    id: "rest-casa-oliva",
    slug: "casa-oliva",
    name: "Casa Oliva",
    description: "Restaurante italiano tradicional y elegante, con pasta fresca y recetas de sobremesa.",
    cuisines: ["Italiana"],
    location: {
      address: "Paseo de la Oliva Imaginaria s/n (dirección ficticia)",
      city: "San Pedro Garza García",
      state: "Nuevo León",
      country: "México",
    },
    contact: { email: "casa-oliva@example.com" },
    coverImage,
    gallery: [],
    timeZone: "America/Mexico_City",
    openingHours: casaOlivaHours,
    menu: casaOlivaMenu,
  },
  {
    id: "rest-raiz-norte",
    slug: "raiz-norte",
    name: "Raíz Norte",
    description: "Cocina mexicana contemporánea con maíz tatemado, moles de semillas y sabores del norte.",
    cuisines: ["Mexicana"],
    location: {
      address: "Andador del Maíz Imaginario s/n (dirección ficticia)",
      city: "Monterrey",
      state: "Nuevo León",
      country: "México",
    },
    contact: { email: "raiz-norte@example.com" },
    coverImage,
    gallery: [],
    timeZone: "America/Mexico_City",
    openingHours: raizNorteHours,
    menu: raizNorteMenu,
  },
  {
    id: "rest-kumo",
    slug: "kumo",
    name: "Kumo",
    description: "Restaurante japonés minimalista con ramen, donburi y postres de té verde.",
    cuisines: ["Japonesa"],
    location: {
      address: "Pasaje de la Nube Imaginaria s/n (dirección ficticia)",
      city: "Monterrey",
      state: "Nuevo León",
      country: "México",
    },
    contact: { email: "kumo@example.com" },
    coverImage,
    gallery: [],
    timeZone: "America/Mexico_City",
    openingHours: kumoHours,
    menu: kumoMenu,
  },
];
