import { useState, type FormEvent } from "react";
import { pendo } from "../analytics/pendo";
import { sendAssistantMessage, type ChatMessage } from "../api/assistant";
import { ApiError } from "../api/client";

const SUGGESTED_PROMPTS = [
  "Suggest a 3-day itinerary for my next trip",
  "What should I pack for a week in Iceland?",
  "Find a cheaper alternative to Paris in spring",
];

function newConversationId(): string {
  return crypto.randomUUID();
}

/**
 * AI chat panel for the Tripwise Assistant, an LLM-powered travel agent.
 * Each prompt the user sends goes to the Tripwise API with the conversation so
 * far; the assistant's reply is appended when the API answers.
 */
export function AssistantPanel({ onClose }: { onClose: () => void }) {
  const [conversationId, setConversationId] = useState(newConversationId);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = async (text: string, source: "suggested" | "typed") => {
    const prompt = text.trim();
    if (prompt === "" || thinking) return;
    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: "user", content: prompt };
    const conversation = [...messages, userMessage];
    setMessages(conversation);
    setDraft("");
    setError(null);
    setThinking(true);
    // How many prompts the user has sent in this conversation, this one included.
    const turnNumber = conversation.filter((message) => message.role === "user").length;
    const startedAt = performance.now();
    try {
      const reply = await sendAssistantMessage(conversationId, conversation);
      setMessages((current) => [...current, reply.message]);
      // Lengths rather than text: prompts and replies may hold personal details.
      pendo.track("assistant_reply_received", {
        conversation_id: conversationId,
        reply_message_id: reply.message.id,
        turn_number: turnNumber,
        prompt_source: source,
        suggested_prompt: source === "suggested" ? prompt : undefined,
        prompt_length: prompt.length,
        reply_length: reply.message.content.length,
        response_time_ms: Math.round(performance.now() - startedAt),
      });
    } catch (e) {
      pendo.track("assistant_reply_failed", {
        conversation_id: conversationId,
        turn_number: turnNumber,
        prompt_source: source,
        error_status: e instanceof ApiError ? e.status : undefined,
        response_time_ms: Math.round(performance.now() - startedAt),
      });
      setError((e as Error).message);
    } finally {
      setThinking(false);
    }
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    void send(draft, "typed");
  };

  const startNewChat = () => {
    setConversationId(newConversationId());
    setMessages([]);
    setError(null);
  };

  return (
    <aside className="assistant" aria-label="Tripwise Assistant">
      <header>
        <h2>Tripwise Assistant</h2>
        <div>
          <button type="button" className="secondary" onClick={startNewChat}>
            New chat
          </button>
          <button type="button" className="secondary" onClick={onClose} aria-label="Close assistant">
            ✕
          </button>
        </div>
      </header>

      <ol className="messages" aria-live="polite">
        {messages.length === 0 && (
          <li className="hint">
            Ask me anything about planning a trip.
            <div className="suggestions">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button key={prompt} type="button" className="secondary" onClick={() => void send(prompt, "suggested")}>
                  {prompt}
                </button>
              ))}
            </div>
          </li>
        )}
        {messages.map((message) => (
          <li key={message.id} className={`message ${message.role}`}>
            {message.content}
          </li>
        ))}
        {thinking && <li className="message assistant">Thinking…</li>}
      </ol>

      {error && <p className="error">{error}</p>}

      <form onSubmit={submit}>
        <label className="sr-only" htmlFor="assistant-input">
          Message the assistant
        </label>
        <textarea
          id="assistant-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Message the assistant"
          rows={2}
        />
        <button type="submit" disabled={draft.trim() === "" || thinking}>
          Send
        </button>
      </form>
    </aside>
  );
}
