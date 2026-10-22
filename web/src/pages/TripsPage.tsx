import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { pendo } from "../analytics/pendo";
import { daysUntilStart } from "../analytics/trips";
import { tripsApi, type Trip } from "../api/trips";
import { TripList } from "../components/TripList";

/** The signed-in user's trips. */
export function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    tripsApi
      .list()
      .then(setTrips)
      .catch((e: Error) => setError(e.message));
  }, []);

  const removeTrip = async (trip: Trip) => {
    try {
      setError(null);
      await tripsApi.remove(trip.id);
      pendo.track("trip_removed", {
        tripId: trip.id,
        destination: trip.destination,
        travelers: trip.travelers,
        daysUntilStart: daysUntilStart(trip),
        remainingTripCount: trips.filter((t) => t.id !== trip.id).length,
      });
      setTrips((current) => current.filter((t) => t.id !== trip.id));
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <section aria-labelledby="trips-heading">
      <div className="section-header">
        <h2 id="trips-heading">Your trips</h2>
        <Link className="button" to="/trips/new">
          Plan a trip
        </Link>
      </div>
      <TripList trips={trips} onRemove={removeTrip} />
      {error && <p className="error">{error}</p>}
    </section>
  );
}
