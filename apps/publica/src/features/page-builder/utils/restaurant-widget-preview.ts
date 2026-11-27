import type { AvailabilityResult } from "@/features/availability/types/availability";
import type { OpeningHours } from "@/features/restaurants/types/opening-hours";
import { routes } from "@/config/routes";
import type { AvailabilityExample, EditorRestaurantContext } from "../types/restaurant-widgets";

const weekdays = [
  ["monday", "Lunes"], ["tuesday", "Martes"], ["wednesday", "Miércoles"], ["thursday", "Jueves"],
  ["friday", "Viernes"], ["saturday", "Sábado"], ["sunday", "Domingo"],
] as const;

export function formatOpeningHours(hours: OpeningHours | null, showClosedDays: boolean) {
  if (!hours) return [];
  return weekdays.flatMap(([key, label]) => {
    const day = hours[key];
    if (day.status === "closed") return showClosedDays ? [{ label, value: "Cerrado" }] : [];
    return [{
      label,
      value: day.intervals.map(({ opensAt, closesAt, closesNextDay }) =>
        `${opensAt}–${closesAt}${closesNextDay ? " (día siguiente)" : ""}`).join(" · "),
    }];
  });
}

export function projectAvailabilityExample(
  date: string, partySize: number, result: AvailabilityResult | null,
): AvailabilityExample {
  if (!result) return { date, partySize, times: null };
  const formatter = new Intl.DateTimeFormat("es-MX", {
    timeZone: result.timeZone, hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  });
  return { date, partySize, times: result.slots.map(({ startsAt }) => formatter.format(new Date(startsAt))) };
}

export function describeAvailability(times: AvailabilityExample["times"]): string {
  if (times === null) return "Sin datos de disponibilidad.";
  return times.length ? times.join(" · ") : "Sin horarios disponibles.";
}

export function getReservationPath(context: Pick<EditorRestaurantContext, "slug"> | null) {
  return context ? routes.reserve(context.slug) : null;
}
