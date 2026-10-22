import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { pendo } from "../analytics/pendo";
import { daysUntilStart, tripLengthDays } from "../analytics/trips";
import { tripsApi, type NewTrip } from "../api/trips";
import { TripForm } from "../components/TripForm";

/** Plans a new trip, then goes back to the trip list. */
export function NewTripPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const createTrip = async (trip: NewTrip) => {
    try {
      setError(null);
      const { id: tripId } = await tripsApi.create(trip);
      pendo.track("trip_created", {
        tripId,
        destination: trip.destination,
        travelers: trip.travelers,
        startDate: trip.startDate,
        endDate: trip.endDate,
        tripLengthDays: tripLengthDays(trip),
        daysUntilStart: daysUntilStart(trip),
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
