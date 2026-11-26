import type { OpeningHours } from "@/features/restaurants/types/opening-hours";

const closed = { status: "closed" } as const;
const oliveLunchAndDinner = {
  status: "open",
  intervals: [
    { opensAt: "13:00", closesAt: "16:00" },
    { opensAt: "18:30", closesAt: "22:30" },
  ],
} as const;

export const casaOlivaHours: OpeningHours = {
  monday: closed,
  tuesday: oliveLunchAndDinner,
  wednesday: oliveLunchAndDinner,
  thursday: oliveLunchAndDinner,
  friday: oliveLunchAndDinner,
  saturday: { status: "open", intervals: [{ opensAt: "13:00", closesAt: "23:00" }] },
  sunday: { status: "open", intervals: [{ opensAt: "12:00", closesAt: "18:00" }] },
};

const raizLunch = {
  status: "open",
  intervals: [{ opensAt: "12:30", closesAt: "21:30" }],
} as const;

export const raizNorteHours: OpeningHours = {
  monday: raizLunch,
  tuesday: closed,
  wednesday: raizLunch,
  thursday: raizLunch,
  friday: { status: "open", intervals: [{ opensAt: "12:30", closesAt: "23:30" }] },
  saturday: { status: "open", intervals: [{ opensAt: "12:00", closesAt: "23:30" }] },
  sunday: { status: "open", intervals: [{ opensAt: "12:00", closesAt: "19:30" }] },
};

const kumoDinner = {
  status: "open",
  intervals: [{ opensAt: "17:30", closesAt: "22:30" }],
} as const;
const kumoLateDinner = {
  status: "open",
  intervals: [{ opensAt: "17:30", closesAt: "00:30", closesNextDay: true }],
} as const;

export const kumoHours: OpeningHours = {
  monday: kumoDinner,
  tuesday: kumoDinner,
  wednesday: closed,
  thursday: kumoDinner,
  friday: kumoLateDinner,
  saturday: kumoLateDinner,
  sunday: { status: "open", intervals: [{ opensAt: "14:00", closesAt: "21:00" }] },
};
