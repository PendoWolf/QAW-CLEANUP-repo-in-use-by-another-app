import type { Account, User } from "../api/auth";
import type { NewTrip, Trip } from "../api/trips";

// Pendo Track Events record outcomes that Page views and Feature clicks can't show, such as
// whether a save succeeded. Pendo matches each event by its exact, case-sensitive name, so an
// event must never be renamed once it is sent.

type PromptSource = "suggested" | "typed";

/** Every Track Event the app sends, with its properties. */
interface TrackEvents {
  sign_in_succeeded: {
    return_path: string;
    user_role: User["role"];
    account_plan: Account["plan"];
  };
  sign_in_failed: {
    /** The API's HTTP status; absent when the API couldn't be reached. */
    error_status?: number;
    error_type: "invalid_credentials" | "server_error" | "network_error";
    return_path: string;
  };
  trip_created: {
    trip_id: string;
    destination: string;
    travelers: number;
    start_date: string;
    trip_length_days: number;
    days_until_departure: number;
  };
  trip_updated: {
    trip_id: string;
    changed_fields: (keyof NewTrip)[];
    destination: string;
    travelers: number;
    trip_length_days: number;
    days_until_departure: number;
  };
  trip_removed: {
    trip_id: string;
    destination: string;
    travelers: number;
    days_until_departure: number;
    remaining_trip_count: number;
  };
  profile_updated: {
    name_changed: boolean;
    email_changed: boolean;
    user_role: User["role"];
    account_plan: Account["plan"];
  };
  assistant_reply_received: {
    conversation_id: string;
    reply_message_id: string;
    turn_number: number;
    prompt_source: PromptSource;
    /** The suggested prompt the user picked; absent for a typed prompt. */
    suggested_prompt?: string;
    prompt_length: number;
    reply_length: number;
    response_time_ms: number;
  };
  assistant_reply_failed: {
    conversation_id: string;
    turn_number: number;
    prompt_source: PromptSource;
    /** The API's HTTP status; absent when the API couldn't be reached. */
    error_status?: number;
    response_time_ms: number;
  };
}

/** The signed-in user and their account (company), as Pendo identifies them. */
interface PendoIdentity {
  visitor: { id: string };
  account: { id: string };
}

/** The parts of the Pendo agent's browser API that the app calls. */
interface PendoAgent {
  identify: (identity: PendoIdentity) => void;
  track: (event: string, properties: object) => void;
}

declare global {
  interface Window {
    /** The Pendo agent, which the Pendo install snippet adds to the page. */
    pendo?: PendoAgent;
  }
}

/**
 * Calls the Pendo agent when it is on the page. Tracking must never break the app, so a call
 * does nothing when the agent isn't loaded, and anything the agent throws is swallowed.
 */
export const pendo = {
  /** Attributes the events that follow to the signed-in user and their account. */
  identify(identity: PendoIdentity): void {
    try {
      window.pendo?.identify(identity);
    } catch {
      // Ignore: a tracking failure must not change what the user sees.
    }
  },

  /** Sends a Track Event. The agent adds the visitor, account, time and URL itself. */
  track<Name extends keyof TrackEvents>(event: Name, properties: TrackEvents[Name]): void {
    try {
      window.pendo?.track(event, properties);
    } catch {
      // Ignore: a tracking failure must not change what the user sees.
    }
  },
};

const DAY_MS = 24 * 60 * 60 * 1000;

/** How many days a trip lasts, counting its first and last day. */
export function tripLengthDays(trip: Pick<Trip, "startDate" | "endDate">): number {
  return Math.round((Date.parse(trip.endDate) - Date.parse(trip.startDate)) / DAY_MS) + 1;
}

/** Days from today, in the user's time zone, until the trip starts: 0 on its first day, negative after. */
export function daysUntilDeparture(trip: Pick<Trip, "startDate">): number {
  // Date.parse reads a YYYY-MM-DD trip date as UTC midnight, so take today's date at UTC midnight too.
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((Date.parse(trip.startDate) - today) / DAY_MS);
}
