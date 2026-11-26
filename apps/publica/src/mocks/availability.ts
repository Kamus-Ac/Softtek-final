// Los horarios UTC de este escenario caen en la fecha local de los tres restaurantes.
interface DemoSlot {
  utcTime: string;
  maxPartySize: number;
}

interface DemoAvailability {
  /** Días de la semana, desde 0 (domingo) hasta 6 (sábado). */
  weekdays: readonly number[];
  slots: readonly DemoSlot[];
}

export const mockAvailability: Readonly<Partial<Record<string, DemoAvailability>>> = {
  "rest-casa-oliva": {
    weekdays: [2, 3, 4, 5, 6],
    slots: [
      { utcTime: "19:00:00", maxPartySize: 4 },
      { utcTime: "20:30:00", maxPartySize: 2 },
      { utcTime: "23:00:00", maxPartySize: 6 },
    ],
  },
  "rest-raiz-norte": {
    weekdays: [3, 4, 5, 6, 0],
    slots: [
      { utcTime: "18:30:00", maxPartySize: 2 },
      { utcTime: "21:00:00", maxPartySize: 6 },
    ],
  },
  "rest-kumo": {
    weekdays: [4, 5, 6],
    slots: [{ utcTime: "23:30:00", maxPartySize: 4 }],
  },
};
