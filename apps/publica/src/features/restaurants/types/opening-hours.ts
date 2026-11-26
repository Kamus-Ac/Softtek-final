type Weekday =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

interface OpeningInterval {
  /** Hora local HH:mm en formato de 24 horas. */
  opensAt: string;
  /** Hora local HH:mm en formato de 24 horas. */
  closesAt: string;
  /** Indica que el cierre ocurre el día siguiente al de apertura. */
  closesNextDay?: true;
}

type DailyOpeningHours =
  | { status: "closed" }
  | { status: "open"; intervals: readonly [OpeningInterval, ...OpeningInterval[]] };

export type OpeningHours = Record<Weekday, DailyOpeningHours>;
