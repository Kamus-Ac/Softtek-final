import type { OffsetDateTime } from "@/types/date-time";

export interface ReservationContact {
  fullName: string;
  email: string;
  phone?: string;
}

export interface ReservationInput {
  restaurantId: string;
  startsAt: OffsetDateTime;
  partySize: number;
  contact: ReservationContact;
}

interface ReservationDetails {
  id: string;
  restaurantId: string;
  startsAt: OffsetDateTime;
  partySize: number;
  bookedBy: { kind: "guest" } | { kind: "customer"; customerId: string };
}

export type Reservation = ReservationDetails &
  (
    | { status: "pending"; confirmationReference?: never }
    | { status: "confirmed"; confirmationReference: string }
    | { status: "cancelled"; confirmationReference?: string }
  );

/** Estados provisionales sujetos a la definición del backend. */
export type ReservationStatus = Reservation["status"];
