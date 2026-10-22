// Types for the Pendo agent's trackAgent API, which records the conversations users have
// with an AI agent, such as the Tripwise Assistant, in Pendo.

/** The metadata of a `pendo.trackAgent` event. */
interface PendoAgentEvent {
  agentId: string;
  conversationId: string;
  messageId: string;
  /**
   * The prompt or response text, or for a "user_reaction" event the reaction:
   * "positive", "negative", "mixed", "undo" or "retry".
   */
  content: string;
  /** The model that generated an "agent_response". */
  modelUsed?: string;
  /** Whether the prompt is one the app suggested, rather than one the user typed. */
  suggestedPrompt?: boolean;
  /** The tools the agent called for an "agent_response". */
  toolsUsed?: string[];
  /** Whether a file was attached to the prompt. */
  fileUploaded?: boolean;
}

interface Pendo {
  /** Tracks a prompt, an agent response or a user reaction in a conversation with an AI agent. */
  trackAgent: (
    eventType: "prompt" | "agent_response" | "user_reaction",
    metadata: PendoAgentEvent,
  ) => void;
}

interface Window {
  /**
   * The Pendo agent, which the Pendo install snippet defines on the page. It's undefined
   * wherever the snippet isn't on the page, so call it through `window.pendo?.`.
   */
  pendo?: Pendo;
}
