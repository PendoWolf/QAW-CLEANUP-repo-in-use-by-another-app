// The Pendo agent. The install snippet in index.html defines it on window, and queues the
// calls made before the agent script has loaded.

/** Metadata about a visitor or an account. `id` is required; every other field is a custom attribute. */
interface PendoMetadata {
  id: string;
  [field: string]: string | number | boolean | string[];
}

interface PendoOptions {
  visitor: PendoMetadata;
  account?: PendoMetadata;
}

interface Pendo {
  initialize(options: PendoOptions): void;
  identify(options: PendoOptions): void;
  /** The install snippet doesn't queue this one, so it only exists once the agent script has loaded. */
  clearSession?(): void;
}

declare var pendo: Pendo;
