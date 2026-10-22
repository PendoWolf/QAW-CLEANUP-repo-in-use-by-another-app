// The Pendo agent. The install snippet in index.html defines the `pendo` global.

/** Visitor or account metadata for Pendo: a required `id`, plus any other fields to send. */
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
  /** Only defined once the agent script has loaded: the install snippet does not stub it. */
  clearSession?: () => void;
}

declare var pendo: Pendo;
