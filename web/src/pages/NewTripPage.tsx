import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { daysUntilDeparture, pendo, tripLengthDays } from "../analytics/pendo";
import { tripsApi, type NewTrip } from "../api/trips";
import { TripForm } from "../components/TripForm";

/** Plans a new trip, then goes back to the trip list. */
export function NewTripPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const createTrip = async (trip: NewTrip) => {
    try {
      setError(null);
      const created = await tripsApi.create(trip);
      pendo.track("trip_created", {
        trip_id: created.id,
        destination: trip.destination,
        travelers: trip.travelers,
        start_date: trip.startDate,
        trip_length_days: tripLengthDays(trip),
        days_until_departure: daysUntilDeparture(trip),
      });
      navigate("/trips");
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <>
      <TripForm heading="Plan a trip" submitLabel="Add trip" onSubmit={createTrip} />
      {error && <p className="error">{error}</p>}
    </>
  );
}
