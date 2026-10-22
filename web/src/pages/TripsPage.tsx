import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { daysUntilDeparture, pendo } from "../analytics/pendo";
import { tripsApi, type Trip } from "../api/trips";
import { TripList } from "../components/TripList";

// Trips already reported as removed. Remove stays clickable while its request is in flight, so
// this keeps a double-click from reporting the same trip twice.
const reportedRemovals = new Set<string>();

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
      setTrips((current) => current.filter((t) => t.id !== trip.id));
      if (!reportedRemovals.has(trip.id)) {
        reportedRemovals.add(trip.id);
        pendo.track("trip_removed", {
          trip_id: trip.id,
          destination: trip.destination,
          travelers: trip.travelers,
          days_until_departure: daysUntilDeparture(trip),
          remaining_trip_count: trips.filter((t) => t.id !== trip.id).length,
        });
      }
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
