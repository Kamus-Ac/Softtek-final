import type { Menu, MenuCategory, MenuItem } from "@/features/restaurants/types/menu";
import type { RestaurantImage } from "@/features/restaurants/types/restaurant-image";

export type MenuWidgetLayout = "list" | "grid";

export interface MenuWidgetOptions {
  menuTitle: string;
  menuLayout: MenuWidgetLayout;
  showDescriptions: boolean;
  showImages: boolean;
}

type PublicMenuItem = Readonly<Pick<MenuItem, "name" | "description" | "isAvailable"> & {
  priceLabel: string;
  image?: Readonly<RestaurantImage>;
}>;

type PublicMenuCategory = Readonly<Pick<MenuCategory, "name"> & {
  items: readonly PublicMenuItem[];
}>;

export type MenuWidgetData = Readonly<Pick<Menu, "name"> & {
  categories: readonly PublicMenuCategory[];
}>;
