import type { OffsetDateTime, TimeZone } from "@/types/date-time";

export interface AvailabilityQuery {
  restaurantId: string;
  /** Fecha YYYY-MM-DD en la zona horaria del restaurante. */
  date: string;
  partySize: number;
}

export interface AvailabilitySlot {
  startsAt: OffsetDateTime;
}

export interface AvailabilityResult {
  query: AvailabilityQuery;
  timeZone: TimeZone;
  slots: readonly AvailabilitySlot[];
}
