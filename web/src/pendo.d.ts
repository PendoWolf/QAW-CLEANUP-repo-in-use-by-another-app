// Types for Pendo's trackAgent API, which tracks conversations with the Tripwise Assistant.
// window.pendo is undefined until the Pendo snippet runs, and an install snippet's stub may not
// include trackAgent before the Pendo agent loads, so call it as window.pendo?.trackAgent?.(...).

/** What a trackAgent event records about one message in a conversation with an AI agent. */
interface PendoTrackAgentMetadata {
  agentId: string;
  conversationId: string;
  messageId: string;
  /** The message text, or for a user_reaction the reaction ("positive", "negative", "retry", …). */
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
