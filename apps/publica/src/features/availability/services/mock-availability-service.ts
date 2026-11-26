import { mockAvailability } from "@/mocks/availability";
import { mockRestaurants } from "@/mocks/restaurants";
import type { AvailabilityService } from "./availability-service";

function parseCalendarDate(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date.startsWith("0000")) {
    throw new RangeError("La fecha debe usar el formato YYYY-MM-DD.");
  }

  const calendarDate = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(calendarDate.getTime()) || calendarDate.toISOString().slice(0, 10) !== date) {
    throw new RangeError("La fecha de disponibilidad debe existir en el calendario.");
  }

  return calendarDate;
}

export const mockAvailabilityService: AvailabilityService = {
  async getAvailability(query) {
    const { restaurantId, date, partySize } = query;
    const calendarDate = parseCalendarDate(date);

    if (!restaurantId.trim() || !Number.isSafeInteger(partySize) || partySize < 1) {
      throw new RangeError("Indica un restaurante y un número entero positivo de personas.");
    }

    const restaurant = mockRestaurants.find(({ id }) => id === restaurantId);
    if (!restaurant) return null;

    const scenario = mockAvailability[restaurantId];
    const slots = scenario?.weekdays.includes(calendarDate.getUTCDay())
      ? scenario.slots
          .filter(({ maxPartySize }) => partySize <= maxPartySize)
          .map(({ utcTime }) => ({ startsAt: `${date}T${utcTime}Z` }))
      : [];

    return { query: { ...query }, timeZone: restaurant.timeZone, slots };
  },
};
