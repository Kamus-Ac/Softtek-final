import "server-only";

import type { Menu, MenuItem } from "@/features/restaurants/types/menu";
import { dataServices } from "@/lib/data-services";
import type { MenuWidgetData } from "../types/menu-widget";

const localImagePath = /^\/images\/(?:[\w-]+\/)*[\w-]+\.(?:avif|gif|jpe?g|png|svg|webp)$/i;

function formatMenuPrice({ amountMinor, currency }: MenuItem["price"]) {
  const formatter = new Intl.NumberFormat("es-MX", { style: "currency", currency, currencyDisplay: "code" });
  const decimals = formatter.resolvedOptions().maximumFractionDigits ?? 2;
  const scale = 10 ** decimals;
  const whole = Math.trunc(amountMinor / scale);
  const fraction = String(amountMinor % scale).padStart(decimals, "0");
  return formatter.formatToParts(whole)
    .map(({ type, value }) => type === "fraction" ? fraction : value)
    .join("");
}

export async function getEditorMenu(restaurantId: string): Promise<MenuWidgetData | null> {
  const menu = await dataServices.restaurants.getMenu(restaurantId);
  return menu ? projectMenuFromDetail(menu) : null;
}

export function projectMenuFromDetail(menu: Menu): MenuWidgetData {
  return {
    name: menu.name,
    categories: menu.categories.map(({ name, items }) => ({
      name,
      items: items.map(({ name, description, isAvailable, price, images }) => {
        const image = images?.find(({ url }) => localImagePath.test(url));
        return {
          name,
          description,
          isAvailable,
          priceLabel: formatMenuPrice(price),
          ...(image && { image: { url: image.url, alt: image.alt } }),
        };
      }),
    })),
  };
}
