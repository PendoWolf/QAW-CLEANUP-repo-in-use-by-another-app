// The Pendo agent. The install snippet in index.html defines `pendo` before the app
// loads, and queues the calls it stubs until the agent script has loaded.

/** A Pendo visitor or account: its unique `id` and any other metadata fields. */
interface PendoRecord {
  id: string;
  [field: string]: string | number | boolean | string[];
}

interface PendoIdentity {
  visitor: PendoRecord;
  account?: PendoRecord;
}

interface Pendo {
  /** Starts the agent. Called once, when the app loads (main.tsx). */
  initialize: (options: PendoIdentity) => void;
  /** Identifies the signed-in visitor and their account, or updates their metadata. */
  identify: (identity: PendoIdentity) => void;
  /**
   * Starts a fresh anonymous visitor. The install snippet doesn't stub it, so it's
   * undefined until the agent script has loaded, and for good if the agent is blocked.
   */
  clearSession?: () => void;
}

declare var pendo: Pendo;
