// Types for the Pendo agent's trackAgent API, which tracks Tripwise Assistant conversations.
// window.pendo exists only once the Pendo snippet has loaded, and trackAgent only on agent
// versions that support it. Both are optional so callers must use optional chaining: when
// Pendo is missing or blocked, tracking is skipped instead of breaking the app.

/** Metadata of a Pendo trackAgent event. */
interface PendoTrackAgentMetadata {
  /** The agent's id in Pendo. */
  agentId: string;
  conversationId: string;
  messageId: string;
  /** The message text, or the reaction for a "user_reaction" event. */
  content: string;
  modelUsed?: string;
  suggestedPrompt?: boolean;
  toolsUsed?: string[];
  fileUploaded?: boolean;
}

interface Window {
  pendo?: {
    trackAgent?: (
      eventType: "prompt" | "agent_response" | "user_reaction",
      metadata: PendoTrackAgentMetadata,
    ) => void;
  };
}
