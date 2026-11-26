import type { Menu } from "@/features/restaurants/types/menu";

export const casaOlivaMenu: Menu = {
  id: "casa-oliva-menu",
  name: "Menú de Casa Oliva",
  description: "Recetas italianas de mesa tradicional.",
  categories: [
    {
      id: "casa-oliva-entradas",
      name: "Entradas",
      displayOrder: 1,
      items: [
        {
          id: "casa-oliva-bruschetta",
          name: "Bruschetta al pomodoro",
          description: "Pan tostado con tomate, albahaca y aceite de oliva.",
          price: { amountMinor: 14500, currency: "MXN" },
          isAvailable: true,
          displayOrder: 1,
        },
        {
          id: "casa-oliva-arancini",
          name: "Arancini de hongos",
          description: "Croquetas de risotto con hongos y parmesano.",
          price: { amountMinor: 16500, currency: "MXN" },
          isAvailable: true,
          displayOrder: 2,
        },
      ],
    },
    {
      id: "casa-oliva-principales",
      name: "Platos principales",
      displayOrder: 2,
      items: [
        {
          id: "casa-oliva-tagliatelle",
          name: "Tagliatelle al ragú",
          description: "Pasta fresca con ragú cocido lentamente.",
          price: { amountMinor: 31500, currency: "MXN" },
          isAvailable: true,
          displayOrder: 1,
        },
        {
          id: "casa-oliva-risotto",
          name: "Risotto de limón",
          description: "Arroz cremoso con limón amarillo y parmesano.",
          price: { amountMinor: 28500, currency: "MXN" },
          isAvailable: true,
          displayOrder: 2,
        },
      ],
    },
    {
      id: "casa-oliva-postres",
      name: "Postres",
      displayOrder: 3,
      items: [
        {
          id: "casa-oliva-tiramisu",
          name: "Tiramisú de la casa",
          description: "Capas de bizcocho con café y crema de mascarpone.",
          price: { amountMinor: 15500, currency: "MXN" },
          isAvailable: true,
          displayOrder: 1,
        },
        {
          id: "casa-oliva-panna-cotta",
          name: "Panna cotta de vainilla",
          description: "Crema de vainilla con compota de frutos rojos.",
          price: { amountMinor: 13500, currency: "MXN" },
          isAvailable: false,
          displayOrder: 2,
        },
      ],
    },
  ],
};

export const raizNorteMenu: Menu = {
  id: "raiz-norte-menu",
  name: "Menú de Raíz Norte",
  description: "Cocina mexicana contemporánea con sabores del norte.",
  categories: [
    {
      id: "raiz-norte-entradas",
      name: "Para compartir",
      displayOrder: 1,
      items: [
        {
          id: "raiz-norte-esquites",
          name: "Esquites de maíz tatemado",
          description: "Maíz asado con mayonesa de limón y chile seco.",
          price: { amountMinor: 12500, currency: "MXN" },
          isAvailable: true,
          displayOrder: 1,
        },
        {
          id: "raiz-norte-tostada",
          name: "Tostada de betabel",
          description: "Betabel rostizado con requesón y pepitas.",
          price: { amountMinor: 14500, currency: "MXN" },
          isAvailable: true,
          displayOrder: 2,
        },
      ],
    },
    {
      id: "raiz-norte-principales",
      name: "Platos principales",
      displayOrder: 2,
      items: [
        {
          id: "raiz-norte-tacos",
          name: "Tacos de costilla",
          description: "Tortillas de maíz con costilla braseada y cebolla encurtida.",
          price: { amountMinor: 27500, currency: "MXN" },
          isAvailable: true,
          displayOrder: 1,
        },
        {
          id: "raiz-norte-coliflor",
          name: "Coliflor con mole de semillas",
          description: "Coliflor asada con mole de pepita y ajonjolí.",
          price: { amountMinor: 25500, currency: "MXN" },
          isAvailable: false,
          displayOrder: 2,
        },
      ],
    },
    {
      id: "raiz-norte-postres",
      name: "Postres",
      displayOrder: 3,
      items: [
        {
          id: "raiz-norte-pan-elote",
          name: "Pan de elote",
          description: "Pan tibio con crema y miel de piloncillo.",
          price: { amountMinor: 13500, currency: "MXN" },
          isAvailable: true,
          displayOrder: 1,
        },
        {
          id: "raiz-norte-flan",
          name: "Flan de café de olla",
          description: "Flan con café especiado y caramelo.",
          price: { amountMinor: 14500, currency: "MXN" },
          isAvailable: true,
          displayOrder: 2,
        },
      ],
    },
  ],
};

export const kumoMenu: Menu = {
  id: "kumo-menu",
  name: "Menú de Kumo",
  description: "Platos japoneses de preparación sencilla y sabores limpios.",
  categories: [
    {
      id: "kumo-entradas",
      name: "Entradas",
      displayOrder: 1,
      items: [
        {
          id: "kumo-edamame",
          name: "Edamame al vapor",
          description: "Vainas tiernas con sal marina y ralladura de limón.",
          price: { amountMinor: 9500, currency: "MXN" },
          isAvailable: true,
          displayOrder: 1,
        },
        {
          id: "kumo-gyoza",
          name: "Gyozas de shiitake",
          description: "Empanadillas doradas con hongos y cebollín.",
          price: { amountMinor: 15500, currency: "MXN" },
          isAvailable: true,
          displayOrder: 2,
        },
      ],
    },
    {
      id: "kumo-principales",
      name: "Platos principales",
      displayOrder: 2,
      items: [
        {
          id: "kumo-ramen",
          name: "Ramen de miso",
          description: "Caldo de miso con fideos, tofu y verduras.",
          price: { amountMinor: 28500, currency: "MXN" },
          isAvailable: true,
          displayOrder: 1,
        },
        {
          id: "kumo-donburi",
          name: "Donburi de salmón",
          description: "Arroz japonés con salmón glaseado y pepino.",
          price: { amountMinor: 32500, currency: "MXN" },
          isAvailable: false,
          displayOrder: 2,
        },
      ],
    },
    {
      id: "kumo-postres",
      name: "Postres",
      displayOrder: 3,
      items: [
        {
          id: "kumo-mochi",
          name: "Mochi de té verde",
          description: "Pastel suave de arroz con relleno de matcha.",
          price: { amountMinor: 12500, currency: "MXN" },
          isAvailable: true,
          displayOrder: 1,
        },
        {
          id: "kumo-pudin",
          name: "Pudín de sésamo negro",
          description: "Pudín cremoso con sésamo tostado y azúcar morena.",
          price: { amountMinor: 13500, currency: "MXN" },
          isAvailable: true,
          displayOrder: 2,
        },
      ],
    },
  ],
};
