/** Pendo Track Event properties. Properties set to undefined are left out of the event. */
export type TrackEventProperties = Record<string, string | number | boolean | string[] | undefined>;

/** The part of the Pendo agent, which the Pendo install snippet loads on the page, that the app uses. */
interface PendoAgent {
  track: (event: string, properties?: Record<string, unknown>) => void;
}

declare global {
  interface Window {
    pendo?: PendoAgent;
  }
}

/**
 * Sends Pendo Track Events through the Pendo agent, which adds the visitor and account itself.
 * Does nothing while the agent isn't loaded, and never throws, so tracking can't break the flow
 * it reports on.
 */
export const pendo = {
  track(event: string, properties: TrackEventProperties = {}): void {
    try {
      const defined = Object.entries(properties).filter(([, value]) => value !== undefined);
      window.pendo?.track(event, Object.fromEntries(defined));
    } catch {
      // Tracking is best effort.
    }
  },
};
