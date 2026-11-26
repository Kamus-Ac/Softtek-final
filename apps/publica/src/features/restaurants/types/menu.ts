import type { RestaurantImage } from "./restaurant-image";

interface MenuPrice {
  /** Entero seguro no negativo, expresado en la unidad menor de la moneda. */
  amountMinor: number;
  /** Código alfabético de moneda ISO 4217, como MXN. */
  currency: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  images?: readonly RestaurantImage[];
  price: MenuPrice;
  isAvailable: boolean;
  displayOrder?: number;
}

export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  displayOrder?: number;
  items: readonly MenuItem[];
}

export interface Menu {
  id: string;
  name: string;
  description?: string;
  categories: readonly MenuCategory[];
}
