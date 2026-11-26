export const routes = {
  home: "/",
  restaurants: "/restaurantes",
  about: "/sobre-nosotros",
  privacy: "/privacidad",
  terms: "/terminos",
  login: "/login",
  register: "/registro",
  profile: "/perfil",
  myReservations: "/mis-reservas",
  bookingConfirmation: "/reservas/confirmacion",
  restaurant: (slug: string) => `/restaurantes/${encodeURIComponent(slug)}`,
  reserve: (slug: string) => `/restaurantes/${encodeURIComponent(slug)}/reservar`,
  editor: (restaurantId: string) => `/editor/${encodeURIComponent(restaurantId)}`,
  editorPreview: (restaurantId: string) => `/editor/${encodeURIComponent(restaurantId)}/preview`,
} as const;

export const demoRestaurantSlug = "restaurante-demo";
