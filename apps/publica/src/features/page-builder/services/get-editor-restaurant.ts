import "server-only";

import { dataServices } from "@/lib/data-services";
import type { EditorRestaurantContext } from "../types/restaurant-widgets";
import { projectAvailabilityExample } from "../utils/restaurant-widget-preview";
import { getEditorMenu, projectMenuFromDetail } from "./get-editor-menu";

const demoAssociation = { editorId: "demo-restaurant", restaurantId: "rest-casa-oliva", slug: "casa-oliva" };
const demoDates = ["2036-06-10", "2036-06-09"] as const;
const demoPartySize = 2;

export async function getEditorRestaurant(editorId: string): Promise<EditorRestaurantContext | null> {
  if (editorId !== demoAssociation.editorId) return null;

  const restaurant = await dataServices.restaurants.getBySlug(demoAssociation.slug);
  if (restaurant?.id !== demoAssociation.restaurantId || restaurant.slug !== demoAssociation.slug) return null;

  const { id, slug, name, openingHours, location, contact } = restaurant;
  const [menu, availability] = await Promise.all([
    restaurant.menu ? projectMenuFromDetail(restaurant.menu) : getEditorMenu(id),
    Promise.all(demoDates.map(async (date) => {
      const result = await dataServices.availability.getAvailability({ restaurantId: id, date, partySize: demoPartySize });
      return projectAvailabilityExample(date, demoPartySize, result);
    })),
  ]);
  const { address, city, state, country } = location;
  return {
    restaurantId: id, slug, name, hours: openingHours ?? null,
    location: { address, city, state, country },
    contact: contact ? { phone: contact.phone, email: contact.email, websiteUrl: contact.websiteUrl } : null,
    menu, availability,
  };
}
