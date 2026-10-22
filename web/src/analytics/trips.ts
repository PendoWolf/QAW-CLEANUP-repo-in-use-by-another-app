import type { NewTrip } from "../api/trips";

// Describes trips on Pendo Track Events. Trip dates are "YYYY-MM-DD", which Date.parse reads as UTC.
const DAY_MS = 24 * 60 * 60 * 1000;
const TRIP_FIELDS = ["destination", "startDate", "endDate", "travelers"] as const;

/** The names of the fields an edit changed, in form order: none when it was saved unchanged. */
export function changedTripFields(before: NewTrip, after: NewTrip): (keyof NewTrip)[] {
  return TRIP_FIELDS.filter((field) => after[field] !== before[field]);
}

/** How many days a trip lasts, counting its start and end dates: 1 for a day trip. */
export function tripLengthDays(trip: NewTrip): number {
  return Math.round((Date.parse(trip.endDate) - Date.parse(trip.startDate)) / DAY_MS) + 1;
}

/** Days from the user's local date until a trip starts: 0 on its first day, negative once it has started. */
export function daysUntilStart(trip: NewTrip): number {
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((Date.parse(trip.startDate) - today) / DAY_MS);
}
